import React, { useState, useRef, useEffect } from 'react';
import { Scale, MessageSquare, FileText, Send, Loader2, ExternalLink, AlertCircle, Database } from 'lucide-react';
import { generateLegalResponse, AgentMode, AgentResponse } from './services/gemini';
import { MarkdownRenderer } from './components/MarkdownRenderer';

const App: React.FC = () => {
  const [mode, setMode] = useState<AgentMode>('qa');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultEndRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [query]);

  // Scroll to result when it arrives
  useEffect(() => {
    if (result && resultEndRef.current) {
      resultEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateLegalResponse(query, mode);
      setResult(response);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Tax & Legal AI Agent</h1>
              <p className="text-xs text-blue-200 flex items-center mt-0.5">
                <Database className="w-3 h-3 mr-1" />
                Powered by ntis-tax-kr, 국세청 & 법제처 Data
              </p>
            </div>
          </div>
          
          {/* Mode Selector */}
          <div className="flex bg-blue-800/50 rounded-lg p-1 border border-blue-700/50">
            <button
              onClick={() => setMode('qa')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'qa' ? 'bg-white text-primary shadow-sm' : 'text-blue-100 hover:text-white hover:bg-blue-700/50'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              일반 질의응답
            </button>
            <button
              onClick={() => setMode('opinion')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'opinion' ? 'bg-white text-primary shadow-sm' : 'text-blue-100 hover:text-white hover:bg-blue-700/50'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              법률의견서 작성
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Panel: Input */}
        <div className="w-full md:w-1/3 flex flex-col space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex-grow flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              {mode === 'qa' ? '질문 입력' : '사실관계 입력'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {mode === 'qa' 
                ? '조세 및 법률 관련 궁금한 사항을 상세히 적어주세요.' 
                : '법률의견서 작성을 위해 구체적인 사실관계를 육하원칙에 따라 적어주세요.'}
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === 'qa' ? "예: 2024년 개정된 종합부동산세 1세대 1주택자 기본공제 금액은 얼마인가요?" : "예: 2023년 5월 1일, 서울시 강남구 소재 아파트를 15억원에 취득하였고..."}
                className="w-full flex-grow min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary resize-none transition-shadow text-gray-700"
                disabled={isLoading}
              />
              
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Shift + Enter로 줄바꿈
                </span>
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="flex items-center px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {mode === 'qa' ? '질문하기' : '의견서 초안 생성'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              이용 안내
            </h3>
            <ul className="text-xs text-blue-700 space-y-1.5 list-disc list-inside">
              <li>본 서비스는 AI가 작성한 초안으로, 법적 효력을 갖지 않습니다.</li>
              <li>실제 법적 분쟁이나 중요한 의사결정 시에는 반드시 전문 변호사나 세무사와 상담하시기 바랍니다.</li>
              <li>구글 검색을 통해 최신 법령을 참조하나, 시차에 따른 오류가 있을 수 있습니다.</li>
            </ul>
          </div>
        </div>

        {/* Right Panel: Output */}
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-grow min-h-[500px] flex flex-col">
            
            {!result && !isLoading && !error && (
              <div className="flex-grow flex flex-col items-center justify-center text-gray-400 h-full">
                <Scale className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">AI 에이전트가 대기 중입니다.</p>
                <p className="text-sm mt-2">좌측에 내용을 입력하고 버튼을 눌러주세요.</p>
              </div>
            )}

            {isLoading && (
              <div className="flex-grow flex flex-col items-center justify-center text-primary h-full space-y-4">
                <Loader2 className="w-12 h-12 animate-spin" />
                <div className="text-center">
                  <p className="font-medium text-lg">관련 법령 및 데이터를 분석하고 있습니다...</p>
                  <p className="text-sm text-gray-500 mt-1">ntis-tax-kr 및 법제처 정보를 검색 중입니다.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <div className="flex flex-col h-full animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    {mode === 'qa' ? '답변 내용' : '법률의견서 초안'}
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    생성 완료
                  </span>
                </div>
                
                {/* Markdown Content */}
                <div className="flex-grow overflow-auto pr-2">
                  <MarkdownRenderer content={result.text} />
                </div>

                {/* Grounding Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      참고 출처 (Grounding Sources)
                    </h3>
                    <ul className="space-y-2">
                      {result.sources.map((source, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-2 text-sm">[{index + 1}]</span>
                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-secondary hover:text-blue-700 hover:underline break-all line-clamp-1"
                            title={source.title || source.uri}
                          >
                            {source.title || source.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div ref={resultEndRef} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
