import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client.
// The API key is expected to be provided by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export type AgentMode = 'qa' | 'opinion';

export interface AgentResponse {
  text: string;
  sources: { uri: string; title?: string }[];
}

export const generateLegalResponse = async (
  query: string,
  mode: AgentMode,
  bucketUri?: string
): Promise<AgentResponse> => {
  // Define system instructions based on the selected mode.
  const systemInstruction =
    mode === 'qa'
      ? `당신은 'ntis-tax-kr' 조세 데이터베이스, 국세청 국세법령정보시스템, 그리고 법제처(law.go.kr) 법령 정보에 정통한 AI 조세/법률 전문가입니다.
사용자의 질문에 대하여 최신 법령과 판례, 국세청 예규, 심사/심판례 등을 바탕으로 정확하고 이해하기 쉽게 답변하세요.
[중요 내부 프로세스]: 판례, 유권해석, 예규 등을 인용할 경우에는 반드시 제공된 'ntis-tax-kr'의 데이터(GCP 버킷 파일)와 상호 검증(Cross-verification)을 거친 후 그 결과를 반영하여 답변을 작성하세요. 또한, 인용하는 모든 판례, 유권해석, 예규 등에는 반드시 해당 문서의 고유 번호(예: 사건번호, 문서번호, 예규번호 등)를 명시해야 합니다.
반드시 구글 검색을 활용하여 최신 법령 개정 사항이나 관련 뉴스를 확인하고 답변에 반영하세요.
답변은 논리적이고 구조화된 마크다운 형식으로 작성하세요.`
      : `당신은 'ntis-tax-kr' 조세 데이터베이스, 국세청 국세법령정보시스템, 그리고 법제처 법령 정보에 정통한 수석 조세 전문 변호사입니다.
사용자가 제공한 사실관계를 바탕으로 공식적인 '법률의견서'를 작성하세요.
[중요 내부 프로세스]: 판례, 유권해석, 예규 등을 인용할 경우에는 반드시 제공된 'ntis-tax-kr'의 데이터(GCP 버킷 파일)와 상호 검증(Cross-verification)을 거친 후 그 결과를 반영하여 작성하세요. 또한, 인용하는 모든 판례, 유권해석, 예규 등에는 반드시 해당 문서의 고유 번호(예: 사건번호, 문서번호, 예규번호 등)를 명시해야 합니다.
의견서는 다음 목차를 반드시 포함해야 합니다:
1. 쟁점 (Issue)
2. 사실관계 요약 (Facts)
3. 관련 법령 및 판례, 국세청 예규 (Applicable Laws, Precedents & Rulings) - 구글 검색을 통해 최신 정보 확인 필수 및 ntis-tax-kr 상호 검증 결과 반영, 문서 번호 명시
4. 법리적 판단 (Legal Analysis)
5. 결론 (Conclusion)
전문적이고 논리적인 법률 문장으로 작성하며, 마크다운 형식을 사용하여 가독성을 높이세요.`;

  try {
    // Construct parts array
    const parts: any[] = [];

    // GCP 버킷 URI가 제공된 경우 fileData 파트 추가
    if (bucketUri && bucketUri.trim().startsWith('gs://')) {
      const trimmedUri = bucketUri.trim();
      let mimeType = 'text/plain';
      if (trimmedUri.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
      else if (trimmedUri.toLowerCase().endsWith('.csv')) mimeType = 'text/csv';
      else if (trimmedUri.toLowerCase().endsWith('.json')) mimeType = 'application/json';

      parts.push({
        fileData: {
          fileUri: trimmedUri,
          mimeType: mimeType
        }
      });
    }

    // 사용자 질문 파트 추가
    parts.push({ text: query });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction,
        // Enable Google Search grounding to fetch up-to-date legal info
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Lower temperature for more factual/deterministic legal responses
      },
    });

    const text = response.text || '답변을 생성하지 못했습니다.';
    
    // Extract grounding chunks (URLs) if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks
      .map(chunk => {
        if (chunk.web?.uri) {
          return { uri: chunk.web.uri, title: chunk.web.title };
        }
        return null;
      })
      .filter((source): source is { uri: string; title?: string } => source !== null);

    // Deduplicate sources based on URI
    const uniqueSources = Array.from(
      new Map(sources.map(item => [item.uri, item])).values()
    );

    return { text, sources: uniqueSources };
  } catch (error: any) {
    console.error("Error generating response:", error);
    
    let errorMessage = "AI 응답을 생성하는 중 오류가 발생했습니다.";
    const errorStr = error.message || String(error);

    if (errorStr.includes('process is not defined')) {
      errorMessage = "API 키가 주입되지 않았습니다.\nGitHub Pages 배포 시 반드시 GitHub Actions 워크플로우가 성공했는지 확인하세요. 수동으로 코드를 업로드하면 API 키가 적용되지 않습니다.";
    } else if (errorStr.includes('403') || errorStr.includes('400') || errorStr.includes('PERMISSION_DENIED')) {
      errorMessage = "API 인증 오류 또는 잘못된 요청입니다.\n\n[해결 방법]\n1. Google AI Studio 키가 아닌 'GCP Vertex AI API 키'를 사용했는지 확인하세요. (vertexai: true 옵션 사용 중)\n2. 입력한 GCP 버킷(gs://) 경로의 파일이 실제 존재하는지, API 키에 해당 버킷 접근 권한이 있는지 확인하세요.\n3. GitHub Pages 도메인이 API 키의 HTTP 리퍼러 제한에 허용되어 있는지 확인하세요.";
    } else if (errorStr.includes('not found') || errorStr.includes('404')) {
      errorMessage = "요청한 리소스를 찾을 수 없습니다. 입력하신 GCP 버킷 파일 경로(gs://...)가 정확한지 다시 확인해주세요.";
    } else {
      errorMessage += `\n상세 오류: ${errorStr}`;
    }
    
    throw new Error(errorMessage);
  }
};