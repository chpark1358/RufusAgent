$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$CodexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$SkillsDir = Join-Path $CodexHome "skills"

New-Item -ItemType Directory -Force -Path $SkillsDir | Out-Null

Copy-Item -Path (Join-Path $RepoRoot "rufus-agent") -Destination $SkillsDir -Recurse -Force
Copy-Item -Path (Join-Path $RepoRoot "rufus-agent-runtime") -Destination $SkillsDir -Recurse -Force

node (Join-Path $SkillsDir "rufus-agent\scripts\portable-smoke-test.mjs")

Write-Host "Installed RufusAgent skills to $SkillsDir"
