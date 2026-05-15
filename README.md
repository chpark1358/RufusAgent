# Sonol Public Skills

Public Sonol multi-agent orchestration skills for Codex-compatible local skill installs.

This repository contains only the public local runtime surface:

- `sonol-multi-agent`
- `sonol-agent-runtime`

It does not include the private hosted planner implementation. Planning uses the configured hosted normalizer while dashboard state, runtime reports, SQLite data, and launch manifests stay local.

## Requirements

- Node.js 22 or newer
- A Codex skills directory, usually `%USERPROFILE%\.codex\skills` on Windows or `$HOME/.codex/skills` on macOS/Linux
- Network access to the configured Sonol plan normalizer

## Install

PowerShell:

```powershell
git clone https://github.com/<owner>/<repo>.git
cd <repo>
.\install.ps1
```

Bash:

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
./install.sh
```

Manual install:

```bash
mkdir -p "$HOME/.codex/skills"
cp -R sonol-multi-agent "$HOME/.codex/skills/"
cp -R sonol-agent-runtime "$HOME/.codex/skills/"
node "$HOME/.codex/skills/sonol-multi-agent/scripts/portable-smoke-test.mjs"
```

## Validate Release

```bash
node sonol-multi-agent/scripts/check-public-release.mjs --release-root .
node sonol-multi-agent/scripts/portable-smoke-test.mjs
```

## Dashboard

Start the dashboard from a workspace:

```bash
node sonol-multi-agent/scripts/start-dashboard.mjs --workspace-root /path/to/workspace
```

The dashboard UI includes a readability override stylesheet at:

```text
sonol-multi-agent/internal/dashboard/dist/assets/dashboard-overrides.css
```

## Publish Notes

For GitHub publication, publish this repository root. Do not publish a raw working install tree that contains unrelated skills, private planner service files, or local `.sonol` runtime data.
