#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const allowedFlags = new Set(["--release-root"]);

function fail(message, extra = {}) {
  const payload = {
    ok: false,
    message,
    expected_usage: [
      "node $RUFUS_AGENT_INSTALL_ROOT/skills/rufus-agent/scripts/check-public-release.mjs --release-root /abs/release-root"
    ],
    ...extra
  };
  console.error(message);
  console.error("");
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const args = {
  releaseRoot: process.cwd()
};

for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index];
  if (token === "--help") {
    console.log("node $RUFUS_AGENT_INSTALL_ROOT/skills/rufus-agent/scripts/check-public-release.mjs --release-root /abs/release-root");
    process.exit(0);
  }
  if (token.startsWith("--") && !allowedFlags.has(token)) {
    fail(`Unsupported flag: ${token}`, { unsupported_flag: token });
  }
  if (token === "--release-root") {
    const value = process.argv[index + 1];
    if (!value) {
      fail("Missing value for --release-root", { flag: "--release-root" });
    }
    args.releaseRoot = resolve(value);
    index += 1;
  }
}

if (!existsSync(args.releaseRoot)) {
  fail(`Release root does not exist: ${args.releaseRoot}`, {
    missing_path: args.releaseRoot
  });
}

const result = {
  ok: true,
  release_root: args.releaseRoot,
  checks: []
};

function pushCheck(name, ok, detail) {
  result.checks.push({ name, ok, detail });
  if (!ok) {
    result.ok = false;
  }
}

function hasPath(relativePath) {
  return existsSync(resolve(args.releaseRoot, relativePath));
}

function walkFiles(rootDir, relativeDir = "") {
  const absoluteDir = resolve(rootDir, relativeDir);
  const entries = readdirSync(absoluteDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryRelativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...walkFiles(rootDir, entryRelativePath));
    } else if (entry.isFile()) {
      files.push(entryRelativePath);
    }
  }
  return files;
}

const allTopLevelEntries = readdirSync(args.releaseRoot, { withFileTypes: true });
const allowedHiddenTopLevelNames = new Set([".git", ".github"]);
const hiddenTopLevelEntries = allTopLevelEntries
  .filter((entry) => entry.name.startsWith("."))
  .filter((entry) => !allowedHiddenTopLevelNames.has(entry.name))
  .map((entry) => entry.name)
  .sort();
pushCheck(
  "hidden_top_level_entries",
  hiddenTopLevelEntries.length === 0,
  hiddenTopLevelEntries.length === 0
    ? "No hidden top-level entries detected in the public release root."
    : `Hidden top-level entries must be absent from the public release root. Found: ${hiddenTopLevelEntries.join(", ")}`
);

const visibleTopLevelEntries = allTopLevelEntries
  .filter((entry) => !entry.name.startsWith("."))
  .map((entry) => ({ name: entry.name, isDirectory: entry.isDirectory() }));
const visibleTopLevelNames = visibleTopLevelEntries.map((entry) => entry.name).sort();
const expectedTopLevelNames = ["rufus-agent-runtime", "rufus-agent"];
const allowedTopLevelFiles = new Set([
  "README.md",
  "LICENSE",
  "install.ps1",
  "install.sh",
  "DEVELOPMENT_PRIORITIES.md"
]);
const unexpectedVisibleTopLevelEntries = visibleTopLevelEntries.filter((entry) => {
  if (expectedTopLevelNames.includes(entry.name)) {
    return !entry.isDirectory;
  }
  return entry.isDirectory || !allowedTopLevelFiles.has(entry.name);
});

pushCheck(
  "top_level_entries",
  unexpectedVisibleTopLevelEntries.length === 0
    && expectedTopLevelNames.every((name) => visibleTopLevelEntries.some((entry) => entry.name === name && entry.isDirectory)),
  unexpectedVisibleTopLevelEntries.length === 0
    ? `Visible top-level entries include the required skill directories and optional GitHub packaging files. Found: ${visibleTopLevelNames.join(", ") || "(none)"}`
    : `Visible top-level entries must be ${expectedTopLevelNames.join(", ")} plus optional GitHub packaging files (${Array.from(allowedTopLevelFiles).join(", ")}). Unexpected: ${unexpectedVisibleTopLevelEntries.map((entry) => entry.name).join(", ")}`
);

const requiredPaths = [
  "rufus-agent/SKILL.md",
  "rufus-agent/references/agent-selection.md",
  "rufus-agent/references/agent-shaping.md",
  "rufus-agent/references/public-release.md",
  "rufus-agent/scripts/export-public-release.mjs",
  "rufus-agent/scripts/check-public-release.mjs",
  "rufus-agent/scripts/start-dashboard.mjs",
  "rufus-agent/internal/dashboard/dist/index.html",
  "rufus-agent/internal/dashboard/dist/assets/dashboard-overrides.css",
  "rufus-agent/node_modules/ajv/package.json",
  "rufus-agent/node_modules/ws/package.json",
  "rufus-agent-runtime/SKILL.md",
  "rufus-agent-runtime/scripts/report-progress.mjs",
  "rufus-agent-runtime/scripts/report-completion.mjs"
];

for (const relativePath of requiredPaths) {
  pushCheck(
    `required:${relativePath}`,
    hasPath(relativePath),
    `Expected required public-release path: ${relativePath}`
  );
}

const forbiddenPaths = [
  "rufus-agent/rufus-agent-runtime",
  "rufus-agent/references/remote-control-plane.env.example",
  "rufus-agent/references/rufus-agent-remote-control-plane.service",
  "rufus-agent/references/remote-thin-dashboard.html"
];

for (const relativePath of forbiddenPaths) {
  pushCheck(
    `forbidden:${relativePath}`,
    !hasPath(relativePath),
    `Forbidden private or duplicate path must be absent: ${relativePath}`
  );
}

const allFiles = walkFiles(args.releaseRoot);
const forbiddenSuffixes = [".map", ".pem", ".ppk", ".key", ".crt"];
for (const suffix of forbiddenSuffixes) {
  const matches = allFiles.filter((relativePath) => relativePath.endsWith(suffix));
  pushCheck(
    `forbidden_suffix:${suffix}`,
    matches.length === 0,
    matches.length === 0
      ? `No forbidden "${suffix}" files detected in the public release.`
      : `Forbidden "${suffix}" files detected: ${matches.join(", ")}`
  );
}

const forbiddenTextMarkers = [
  "references/remote-control-plane.env.example",
  "references/rufus-agent-remote-control-plane.service",
  "references/remote-thin-dashboard.html",
  "hosted private planner",
  "/mnt/e/CLAUDE_PROJECT/",
  "/mnt/e/claude_project/",
  "/root/.codex/skills/rufus-agent",
  "/root/.codex/skills/rufus-agent-runtime",
  "/root/.agents/skills/",
  "/mnt/e/CLAUDE_PROJECT/MULTIAGENT_SKILL/"
];

function shouldScanTextFile(relativePath) {
  if (
    relativePath === "rufus-agent/scripts/check-public-release.mjs"
    || relativePath === "rufus-agent/scripts/export-public-release.mjs"
  ) {
    return false;
  }
  if (relativePath.startsWith("rufus-agent/node_modules/")) {
    return false;
  }
  if (relativePath.startsWith("rufus-agent-runtime/node_modules/")) {
    return false;
  }
  if (relativePath.startsWith("rufus-agent/internal/dashboard/dist/")) {
    return false;
  }
  return [
    ".md",
    ".txt",
    ".json",
    ".mjs",
    ".js",
    ".cjs",
    ".yml",
    ".yaml",
    ".service",
    ".env.example"
  ].some((suffix) => relativePath.endsWith(suffix));
}

const textFilesToScan = allFiles.filter((relativePath) => shouldScanTextFile(relativePath));

for (const relativePath of textFilesToScan) {
  const absolutePath = resolve(args.releaseRoot, relativePath);
  if (!existsSync(absolutePath)) {
    continue;
  }
  const text = readFileSync(absolutePath, "utf8");
  for (const marker of forbiddenTextMarkers) {
    pushCheck(
      `text:${relativePath}:${marker}`,
      !text.includes(marker),
      `Text marker "${marker}" must not appear in ${relativePath}`
    );
  }
}

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(result.ok ? 0 : 1);
