import { createRunSnapshot } from "./rufus-agent-run-snapshot.mjs";

export { createRunSnapshot };

export function recommendPlan() {
  const error = new Error(
    "Local heuristic planning is not shipped in the public/community edition. Configure the hosted plan normalizer instead."
  );
  error.code = "PUBLIC_EDITION_REMOTE_PLANNER_ONLY";
  throw error;
}
