# Public Release Boundary

Use a generated public release when you want to publish RufusAgent externally, such
as on GitHub, without shipping private deployment artifacts.

## What the public release contains

- `rufus-agent/`
- `rufus-agent-runtime/`

When published as a GitHub repository, the root may also include packaging
files such as `README.md`, `install.ps1`, `install.sh`, `LICENSE`, and
`DEVELOPMENT_PRIORITIES.md`. These files are install and documentation helpers,
not runtime authority.

The public release keeps the working operator experience intact:

- local SQLite remains authoritative
- the local loopback bridge remains authoritative for dashboard/runtime access
- the remote dashboard stays a thin UI against that local bridge
- the local Codex or Claude session still authors the creative draft
- the hosted planner service remains deterministic and only normalizes/binds

## What the public release must not contain

- private hosted service implementation
- deployment-unit files or service-manager templates for the hosted planner
- unpublished remote dashboard shell artifacts
- raw working copies that include duplicate or internal-only packaging paths

## Export workflow

1. Generate the public release root:
   - `node $RUFUS_AGENT_INSTALL_ROOT/skills/rufus-agent/scripts/export-public-release.mjs`
2. Validate the generated root:
   - `node $RUFUS_AGENT_INSTALL_ROOT/skills/rufus-agent/scripts/check-public-release.mjs --release-root /abs/output/rufus-agent-public`
3. Add only lightweight GitHub packaging files if needed.
4. Publish the generated root, not the raw working install tree.

## Notes

- The hosted planner remains remote. The public release only ships the local
  client/runtime surface needed to talk to it.
- Browser storage is never authoritative for RufusAgent orchestration state.
- The public release is intentionally separate from the portable machine-to-machine
  bundle. Use `export-portable-bundle.mjs` for private machine transfer, and
  `export-public-release.mjs` for external publishing.
