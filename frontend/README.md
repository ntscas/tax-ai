# Tax & Legal AI Agent

## GitHub Pages 배포 가이드

이 프로젝트는 ESM(ES Modules)과 Import Map을 활용하여 별도의 빌드 도구(Node.js, Webpack 등) 없이 브라우저에서 직접 실행되는 React 애플리케이션입니다. GitHub Pages를 이용해 쉽게 호스팅할 수 있습니다.

### 배포 단계
1. **GitHub Repository 생성**: GitHub에서 새로운 저장소(Repository)를 만듭니다.
2. **파일 업로드**: 프로젝트의 모든 파일(`index.html`, `index.tsx`, `App.tsx`, `components/`, `services/` 등)을 해당 저장소에 커밋(Commit)하고 푸시(Push)합니다.
3. **Pages 활성화**:
   - 저장소의 **Settings** > **Pages** 메뉴로 이동합니다.
   - **Build and deployment**의 **Source**를 `Deploy from a branch`로 선택합니다.
   - **Branch**를 `main` (또는 작업 중인 브랜치)으로 선택하고 폴더를 `/(root)`로 지정한 뒤 **Save**를 누릅니다.
4. **접속**: 1~2분 대기 후 제공되는 `https://<username>.github.io/<repository-name>` 링크를 통해 서비스에 접속할 수 있습니다.

---

## ⚠️ API 키 소스 코드 고정(하드코딩) 관련 주의사항

요청하신 **"API 키를 소스에 고정(하드코딩)하는 방식"은 시스템 보안 정책상 엄격히 금지되어 있어 코드에 반영되지 않았습니다.**

- **보안 위험**: GitHub와 같은 공개 저장소에 API 키가 포함된 코드를 올리면, 악성 봇(Bot)들에 의해 수 분 내에 키가 탈취되어 막대한 금전적 피해(과금 폭탄)가 발생할 수 있습니다.
- **시스템 원칙**: 본 애플리케이션은 보안을 위해 오직 환경 변수(`process.env.API_KEY`)를 통해서만 API 키를 안전하게 읽어오도록 설계되어 있습니다. 소스 코드(`services/gemini.ts`)를 임의로 수정하여 키를 직접 입력하지 마십시오.

정적 웹 호스팅 환경(GitHub Pages)에서 이를 안전하게 서비스하려면, 소스 코드에 키를 노출하지 않고 빌드 파이프라인(GitHub Actions 등)을 통해 빌드 시점에 Secrets 변수를 주입하거나, API 호출을 중계하는 안전한 자체 백엔드 서버를 구성하는 아키텍처를 적용해야 합니다.
