# Tax & Legal AI Agent

## GitHub Pages 및 GitHub Actions 배포 가이드 (`deploy.yml` 활용)

이 프로젝트는 별도의 빌드 도구 없이 브라우저에서 직접 실행되는 React 애플리케이션입니다. 제공된 `.github/workflows/deploy.yml` 파일을 통해 소스 코드에 API 키를 하드코딩하지 않고도 안전하게 GitHub Pages에 배포할 수 있습니다.

### ⚠️ 보안 경고 (매우 중요)
GitHub Secrets를 통해 빌드 시점에 API 키를 주입하더라도, **최종적으로 배포된 웹사이트는 프론트엔드(클라이언트 사이드) 애플리케이션이므로 브라우저 개발자 도구를 통해 누구나 API 키를 볼 수 있습니다.** 
실제 상용 서비스로 운영할 경우, 반드시 백엔드 서버를 구축하여 API 호출을 중계해야 합니다. 본 배포 방식은 개인적인 테스트 및 포트폴리오 용도로만 사용하시기 바랍니다.

### 배포 설정 단계

#### 1. GitHub Secrets에 API 키 등록
소스 코드에 키를 직접 적지 않기 위해 GitHub의 보안 변수(Secrets) 기능을 사용합니다.
1. GitHub 저장소(Repository) 페이지로 이동합니다.
2. 상단 탭에서 **Settings**를 클릭합니다.
3. 좌측 메뉴에서 **Secrets and variables** > **Actions**를 클릭합니다.
4. **New repository secret** 버튼을 클릭합니다.
5. **Name**에 `GEMINI_API_KEY`를 입력합니다.
6. **Secret**에 발급받은 Google Gemini API 키 값을 입력하고 **Add secret**을 누릅니다.

#### 2. GitHub Pages 설정 변경
1. 저장소의 **Settings** > **Pages** 메뉴로 이동합니다.
2. **Build and deployment** 섹션에서 **Source**를 `GitHub Actions`로 변경합니다.

#### 3. 코드 푸시 및 자동 배포
1. `.github/workflows/deploy.yml` 파일을 포함한 모든 코드를 `main` 브랜치에 커밋하고 푸시(Push)합니다.
2. GitHub 저장소의 **Actions** 탭으로 이동하면 `Deploy to GitHub Pages` 워크플로우가 자동으로 실행되는 것을 볼 수 있습니다.
3. 배포가 완료되면 제공되는 `https://<username>.github.io/<repository-name>` 링크를 통해 서비스에 접속할 수 있습니다.

### 작동 원리
`deploy.yml` 워크플로우는 코드를 체크아웃한 뒤, `sed` 명령어를 사용하여 `services/gemini.ts` 파일 내에 있는 `process.env.API_KEY` 문자열을 GitHub Secrets에 저장된 실제 API 키로 치환합니다. 이후 치환된 파일들을 GitHub Pages 서버로 업로드하여 서비스합니다.
