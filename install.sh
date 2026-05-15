#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
codex_home="${CODEX_HOME:-$HOME/.codex}"
skills_dir="$codex_home/skills"

mkdir -p "$skills_dir"
cp -R "$repo_root/sonol-multi-agent" "$skills_dir/"
cp -R "$repo_root/sonol-agent-runtime" "$skills_dir/"

node "$skills_dir/sonol-multi-agent/scripts/portable-smoke-test.mjs"

printf 'Installed Sonol skills to %s\n' "$skills_dir"
