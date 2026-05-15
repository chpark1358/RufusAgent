#!/usr/bin/env node

const payload = {
  ok: false,
  error_code: "PRIVATE_CONTROL_PLANE_NOT_SHIPPED",
  message: "The hosted RufusAgent plan normalizer/control-plane implementation is private and is not shipped in the public/community edition.",
  public_surface: {
    supported_client_env: [
      "Default public install: no extra planner env required",
      "Default planner draft URL: https://agent.zooo.kr/v1/planner/draft",
      "Default planner ticket URL: https://agent.zooo.kr/v1/planner/ticket",
      "Default dashboard URL: https://agent.zooo.kr/rufus-agent-dashboard/",
      "Optional override: RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_URL=https://your-planner.example/v1/planner/draft",
      "Optional override: RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_TICKET_URL=https://your-planner.example/v1/planner/ticket",
      "Optional override: RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_BEARER_TOKEN=<token>",
      "Optional override: RUFUS_AGENT_REMOTE_DASHBOARD_BASE_URL=https://agent.example/rufus-agent-dashboard/"
    ],
    note: "This repository ships the public local client, local loopback bridge, and runtime/dashboard components. The hosted control-plane implementation stays private. Standard public installs use the hosted RufusAgent planner defaults above, while private/self-hosted deployments can override them."
  }
};

console.error(payload.message);
console.error("");
console.error(JSON.stringify(payload, null, 2));
process.exit(1);
