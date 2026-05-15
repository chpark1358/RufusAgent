# RufusAgent

Codex 로컬 skill로 설치해서 사용하는 RufusAgent 공개 배포판입니다.

이 레포지토리는 공개 가능한 로컬 실행 구성만 포함합니다.

- `rufus-agent`
- `rufus-agent-runtime`

비공개 hosted planner 구현체는 포함하지 않습니다. 계획 정규화는 설정된 hosted normalizer를 사용하고, 대시보드 상태, 런타임 보고, SQLite 데이터, 실행 manifest는 로컬 워크스페이스에 저장됩니다.

## 요구 사항

- Node.js 22 이상
- Codex skills 디렉터리
  - Windows: `%USERPROFILE%\.codex\skills`
  - macOS/Linux: `$HOME/.codex/skills`
- RufusAgent plan normalizer에 접근 가능한 네트워크 환경

## 설치

PowerShell:

```powershell
git clone https://github.com/chpark1358/RufusAgent.git
cd RufusAgent
.\install.ps1
```

Bash:

```bash
git clone https://github.com/chpark1358/RufusAgent.git
cd RufusAgent
./install.sh
```

수동 설치:

```bash
mkdir -p "$HOME/.codex/skills"
cp -R rufus-agent "$HOME/.codex/skills/"
cp -R rufus-agent-runtime "$HOME/.codex/skills/"
node "$HOME/.codex/skills/rufus-agent/scripts/portable-smoke-test.mjs"
```

## 검증

레포지토리 루트에서 아래 명령을 실행합니다.

```bash
node rufus-agent/scripts/check-public-release.mjs --release-root .
node rufus-agent/scripts/portable-smoke-test.mjs
```

## 대시보드 실행

워크스페이스 기준으로 대시보드를 실행합니다.

```bash
node rufus-agent/scripts/start-dashboard.mjs --workspace-root /path/to/workspace
```

대시보드 가독성 개선 스타일은 아래 파일에 들어 있습니다.

```text
rufus-agent/internal/dashboard/dist/assets/dashboard-overrides.css
```

## 배포 메모

GitHub에는 이 레포지토리 루트를 그대로 배포하면 됩니다. 다른 로컬 skill, 비공개 planner 서비스 파일, 로컬 `.rufusagent` 런타임 데이터가 섞인 작업 디렉터리는 배포하지 마세요.
