# RufusAgent 개발 우선순위

## P0 - 설치 가능성과 공개 배포 안정성

- GitHub에서 clone 후 `install.ps1` 또는 `install.sh`만 실행하면 Codex skill로 설치되어야 합니다.
- `check-public-release.mjs`와 `portable-smoke-test.mjs`는 공개 저장소 checkout 기준으로 항상 통과해야 합니다.
- private planner 서버 구현, 로컬 SQLite 런타임 데이터, 개인 workspace 파일은 저장소에 포함하지 않습니다.
- 설치 후 `rufusagent`, `rufus agent`, `RufusAgent`, `rufus-agent` 입력이 모두 같은 workflow로 인식되는지 자동 검증을 추가합니다.

## P0 - 한글/인코딩 안정성

- 대시보드, README, skill 문서, 예제 JSON은 UTF-8 기준으로 관리합니다.
- Windows PowerShell 문자열로 한글 JSON을 직접 생성하지 않고, UTF-8 파일을 Node.js가 읽어 처리하는 방식으로 통일합니다.
- 테스트 fixture에 한글 plan title, agent purpose, task description을 포함하고 물음표 대체 패턴, 유니코드 replacement character, 대표적인 mojibake 문자열이 없는지 검사합니다.
- 대시보드 스냅샷 API와 브라우저 UI 양쪽에서 한글이 동일하게 표시되는지 smoke test를 추가합니다.

## P1 - 대시보드 가시성/가독성

- 상단 상태, 승인 흐름, agent 카드, runtime log, validation issue가 한눈에 구분되도록 정보 영역을 유지합니다.
- 중요 액션은 명확한 색상 대비와 충분한 클릭 영역을 가지게 하고, 모바일에서는 주요 버튼을 full width로 배치합니다.
- 빈 상태, 실패 상태, 대기 상태, 승인 후 터미널 확인 상태를 각각 별도 문구와 시각 상태로 보여줍니다.
- 현재 배포판은 빌드된 `dashboard.js` 중심이므로, 다음 단계에서는 원본 React 소스와 빌드 스크립트를 함께 공개해 UI 변경 추적성을 높입니다.

## P1 - Planner/대시보드 연결 안정성

- hosted plan normalizer 호출에서 `missing or malformed planner job ticket` 같은 실패가 발생하면 원인과 복구 방법을 사용자에게 바로 보여줘야 합니다.
- planner job ticket 생성, draft normalize, local dashboard 저장을 분리해 어느 단계에서 실패했는지 로그와 UI에 표시합니다.
- 원격 planner가 실패해도 UI 실험을 할 수 있도록 `seed-demo-plan.mjs` 같은 공식 로컬 데모 시딩 명령을 제공합니다.

## P2 - 토큰 소모 절감

- sub-agent마다 긴 정책문을 반복 전달하지 않고, run id와 runtime context 파일 경로만 전달하는 compact launch mode를 추가합니다.
- agent 역할별로 필요한 컨텍스트만 전달합니다. 예: 구현 agent에는 write scope와 acceptance criteria, 검증 agent에는 validation command와 artifact contract 중심으로 제공합니다.
- plan, manifest, agent prompt별 예상 token budget을 계산해 대시보드에 표시합니다.
- 긴 로그와 중간 산출물은 요약본과 원문 파일 경로를 분리해 재사용합니다.

## P2 - 코드 오류/디버깅 보완

- `doctor.mjs` 명령을 추가해 Node 버전, 설치 경로, workspace binding, dashboard health, active run, reporter script, SQLite DB 경로를 한번에 점검합니다.
- runtime report 누락, 잘못된 DB 사용, stale run, 첫 progress report 누락은 복구 명령까지 같이 안내합니다.
- SQLite lock/retry, dashboard bridge token, planner ticket 오류를 structured log로 남기고 대시보드에서 필터링할 수 있게 합니다.
- sub-agent 완료 보고가 누락된 경우 session file 또는 manifest 기준 reconcile 절차를 더 명확히 합니다.

## P3 - 검증 계약 강화

- plan에 `acceptance_criteria`, `validation_commands`, `artifact_contracts`를 명시하고 대시보드에서 편집 가능하게 합니다.
- 완료 전 unchecked artifact, 실패한 validation, 미해결 blocking issue가 있으면 dashboard가 경고하거나 완료를 막습니다.
- draft 생성부터 승인, 터미널 확인, manifest 생성, runtime report, completion까지 이어지는 end-to-end smoke test를 추가합니다.
- 브라우저 기반 UI 검증에서는 desktop/mobile screenshot, console error, 주요 텍스트 표시 여부를 같이 확인합니다.

## P3 - 실제 multi-agent 실행 품질

- host가 지원하는 경우 `spawn_agent` 기반 launch acknowledgement를 자동화하고, 수동 manifest 흐름에서는 사용자가 해야 할 다음 명령을 더 짧게 안내합니다.
- agent별 ownership, read/write path, deny path가 실제 작업 범위와 충돌하지 않는지 사전 검증합니다.
- 병렬 실행이 이득인 작업과 순차 실행이 필요한 작업을 plan 단계에서 구분하고, 불필요한 agent 분할은 줄입니다.
- agent가 막혔을 때 자동으로 질문, 재시도, 범위 축소, human confirmation 중 어떤 경로가 적절한지 제안합니다.

## P4 - GitHub 배포/운영

- release tag와 checksum을 제공해 사용자가 특정 버전을 안정적으로 설치할 수 있게 합니다.
- GitHub Actions에 Windows/Linux 설치 테스트, smoke test, 한글 fixture 검사를 추가합니다.
- README에는 설치, 실행, 대시보드 확인, 승인 절차, 문제 해결을 모두 한국어 기준으로 유지합니다.
- 공개 배포판과 private hosted planner의 경계를 문서화해 사용자가 self-hosting 가능 범위를 오해하지 않게 합니다.
