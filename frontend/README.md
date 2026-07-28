# Tax & Legal AI Agent

## 🚀 주요 기능: GCP 버킷(ntis-tax-kr) 연동
이 애플리케이션은 사용자가 입력한 **GCP Cloud Storage 버킷 URI (`gs://...`)**의 파일을 직접 읽어와 판례 및 유권해석 상호 검증에 활용합니다.
- UI 좌측의 **'GCP 버킷 데이터 연동'** 입력란에 분석하고자 하는 파일의 경로(예: `gs://ntis-tax-kr/tax_data.pdf`)를 입력하면, Gemini 모델이 해당 파일을 직접 참조하여 답변을 생성합니다.

---

## ⚠️ 깃허브 배포 시 API 오류 해결 가이드 (필독)

GitHub에 코드를 올린 후 웹사이트에서 **"API 오류"**가 발생하는 경우, 다음 세 가지 원인 중 하나입니다.

### 1. `process is not defined` 오류 (가장 흔함)
- **원인**: 소스 코드에 API 키를 직접 적지 않기 위해 `process.env.API_KEY`를 사용하는데, GitHub에 파일을 **수동으로 업로드(Drag & Drop)**하면 이 변수가 실제 키로 치환되지 않아 브라우저에서 오류가 발생합니다.
- **해결 방법**: 반드시 아래의 **[GitHub Actions 배포 가이드]**를 따라 `deploy.yml` 워크플로우를 통해 배포해야 합니다. 워크플로우가 실행되면서 자동으로 키를 주입해 줍니다.

### 2. 400 / 403 권한 오류 (Vertex AI API 키 문제)
- **원인**: 본 프로젝트는 GCP 환경에 맞게 `vertexai: true` 옵션을 사용합니다. 따라서 일반적인 Google AI Studio API 키를 넣으면 권한 오류가 발생합니다.
- **해결 방법**: Google Cloud Console(GCP)에 접속하여 **[API 및 서비스] > [사용자 인증 정보]**에서 생성한 **Vertex AI API 키**를 GitHub Secrets에 등록해야 합니다.

### 3. GCP 버킷 파일 접근 오류 (404 / 403)
- **원인**: UI에 입력한 `gs://ntis-tax-kr/...` 파일이 실제로 존재하지 않거나, 사용 중인 API 키에 해당 버킷을 읽을 권한이 없는 경우입니다.
- **해결 방법**: 실제 존재하는 파일 경로를 입력하고, GCP IAM 설정에서 권한을 확인하세요.

---

## 📦 배포 가이드 1: GitHub Pages (GitHub Actions 활용)

1. GitHub 저장소의 **Settings > Secrets and variables > Actions**로 이동합니다.
2. **New repository secret**을 클릭하고, Name에 `GEMINI_API_KEY`, Secret에 **GCP Vertex AI API 키**를 입력합니다.
3. **Settings > Pages**에서 **Source**를 `GitHub Actions`로 변경합니다.
4. 코드를 `main` 브랜치에 Push하면 자동으로 배포가 진행됩니다.

---

## 📦 배포 가이드 2: GCP Cloud Storage (버킷 호스팅)

GitHub Pages 대신 GCP 버킷 자체에 정적 웹사이트를 호스팅하고 싶다면, 제공된 `.github/workflows/deploy-gcp.yml`을 사용할 수 있습니다.

1. GCP에서 정적 웹사이트 호스팅용 버킷을 생성합니다. (예: `www.my-tax-agent.com`)
2. GitHub Secrets에 다음 변수들을 추가합니다:
   - `GEMINI_API_KEY`: Vertex AI API 키
   - `GCP_PROJECT_ID`: GCP 프로젝트 ID
   - `GCP_SA_KEY`: GCP 서비스 계정 JSON 키 (버킷 쓰기 권한 필요)
   - `GCP_BUCKET_NAME`: 호스팅할 버킷 이름
3. `.github/workflows/deploy-gcp.yml` 파일의 주석 처리를 해제하고 Push하면 GCP 버킷으로 자동 배포됩니다.
