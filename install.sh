#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
codex_home="${CODEX_HOME:-$HOME/.codex}"
skills_dir="$codex_home/skills"

mkdir -p "$skills_dir"
cp -R "$repo_root/rufus-agent" "$skills_dir/"
cp -R "$repo_root/rufus-agent-runtime" "$skills_dir/"

node "$skills_dir/rufus-agent/scripts/portable-smoke-test.mjs"

printf 'Installed RufusAgent skills to %s\n' "$skills_dir"
