# Development Priorities

## P0 - GitHub installability

- Keep the repository root installable by cloning and running `install.ps1` or `install.sh`.
- Keep `check-public-release.mjs` passing for a GitHub checkout that includes top-level README and installer files.
- Keep private planner service files, local runtime data, and unrelated skills out of the repository.

## P1 - Dashboard readability

- Keep high-contrast text, clear cards, restrained borders, and 8px panel radii.
- Keep dense dashboard information scannable: status, approval, runtime logs, agent cards, and execution truth should be visually distinct.
- Keep mobile behavior usable by avoiding clipped controls and making primary actions full width on narrow screens.

## P2 - Token reduction

- Add a compact launch mode that passes short run identifiers plus run-scoped prompt file paths instead of repeating long policy text in every sub-agent prompt.
- Add a token budget estimator for plan, manifest, and per-agent prompt payloads.
- Prefer runtime context files over repeated inline instructions.

## P3 - Debugging and diagnostics

- Add a single `doctor.mjs` command that checks Node version, install paths, workspace binding, dashboard health, active run, manifest files, and runtime reporter availability.
- Improve diagnostics so stale run reports, wrong DB usage, and missing first progress reports include a concrete recovery command.
- Keep SQLite retry and lock failures visible in structured logs.

## P4 - Verification contracts

- Add plan-level `acceptance_criteria`, `validation_commands`, and `artifact_contracts`.
- Warn or block completion when meaningful artifacts remain `unchecked`.
- Add an end-to-end smoke test for draft, plan, approval, confirmation, manifest, runtime report, and diagnostics.
