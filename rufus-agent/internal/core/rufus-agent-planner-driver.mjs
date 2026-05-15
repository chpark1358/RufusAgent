import {
  DEFAULT_PUBLIC_REMOTE_PLANNER_URL,
  DEFAULT_PUBLIC_REMOTE_PLANNER_TICKET_URL_SOURCE,
  DEFAULT_PUBLIC_REMOTE_PLANNER_URL_SOURCE,
  deriveRemotePlannerTicketUrlFromPlannerUrl
} from "./rufus-agent-public-remote-config.mjs";

export const REMOTE_PLANNER_BACKEND = "remote_control_plane";
export const REMOTE_PLANNER_DRIVER = "remote_http";
export const RUFUS_AGENT_PLANNER_BACKEND = REMOTE_PLANNER_BACKEND;
export const RUFUS_AGENT_PLANNER_DRIVER = REMOTE_PLANNER_DRIVER;
export const DEFAULT_PLANNER_DRIVER = REMOTE_PLANNER_DRIVER;

const SUPPORTED_PLANNER_DRIVERS = new Set([REMOTE_PLANNER_DRIVER]);

function normalizeText(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function isTruthy(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").trim().toLowerCase());
}

export function isSupportedPlannerDriver(value) {
  return SUPPORTED_PLANNER_DRIVERS.has(String(value ?? "").trim());
}

export function defaultPlannerDriverForWorkspace() {
  return REMOTE_PLANNER_DRIVER;
}

export function defaultPlannerModelForDriver() {
  return "remote-managed";
}

export function plannerBackendForDriver() {
  return REMOTE_PLANNER_BACKEND;
}

export function resolvePlannerModel(options = {}) {
  const env = options.env ?? process.env;
  const requestedModel =
    options.plannerModel
    ?? options.model
    ?? env.RUFUS_AGENT_PLANNER_MODEL
    ?? null;
  const normalizedModel = String(requestedModel ?? "").trim();
  return normalizedModel || defaultPlannerModelForDriver();
}

export function resolvePlannerConfig(options = {}) {
  const env = options.env ?? process.env;
  const explicitRequestedDriver = normalizeText(
    options.plannerDriver
    ?? options.driver
    ?? env.RUFUS_AGENT_PLANNER_DRIVER,
    ""
  );
  const rawRemotePlannerUrl = normalizeText(
    options.remotePlannerUrl
    ?? options.remoteNormalizerUrl
    ?? env.RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_URL
    ?? env.RUFUS_AGENT_REMOTE_PLANNER_URL
    ?? env.RUFUS_AGENT_REMOTE_CONTROL_PLANE_URL,
    ""
  );
  const remotePlannerUrl = rawRemotePlannerUrl || DEFAULT_PUBLIC_REMOTE_PLANNER_URL;
  const rawRemotePlannerTicketUrl = normalizeText(
    options.remotePlannerTicketUrl
    ?? options.remoteNormalizerTicketUrl
    ?? env.RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_TICKET_URL
    ?? env.RUFUS_AGENT_REMOTE_PLANNER_TICKET_URL,
    ""
  );
  const remotePlannerTicketUrl = rawRemotePlannerTicketUrl || deriveRemotePlannerTicketUrlFromPlannerUrl(remotePlannerUrl);
  const remotePlannerBearerToken = normalizeText(
    options.remotePlannerBearerToken
    ?? options.remoteNormalizerBearerToken
    ?? env.RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_BEARER_TOKEN
    ?? env.RUFUS_AGENT_REMOTE_PLANNER_BEARER_TOKEN,
    ""
  );
  const remotePlannerAllowUnsigned = isTruthy(
    options.remotePlannerAllowUnsigned
    ?? options.remoteNormalizerAllowUnsigned
    ?? env.RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_ALLOW_UNSIGNED
    ?? env.RUFUS_AGENT_REMOTE_PLANNER_ALLOW_UNSIGNED
  );

  const remoteConfigPresentKeys = [];
  if (remotePlannerUrl) {
    remoteConfigPresentKeys.push(
      rawRemotePlannerUrl
        ? (env.RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_URL ? "RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_URL" : "RUFUS_AGENT_REMOTE_PLANNER_URL")
        : DEFAULT_PUBLIC_REMOTE_PLANNER_URL_SOURCE
    );
  }
  if (remotePlannerTicketUrl) {
    remoteConfigPresentKeys.push(
      rawRemotePlannerTicketUrl
        ? (env.RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_TICKET_URL ? "RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_TICKET_URL" : "RUFUS_AGENT_REMOTE_PLANNER_TICKET_URL")
        : DEFAULT_PUBLIC_REMOTE_PLANNER_TICKET_URL_SOURCE
    );
  }
  if (remotePlannerBearerToken) {
    remoteConfigPresentKeys.push(
      env.RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_BEARER_TOKEN ? "RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_BEARER_TOKEN" : "RUFUS_AGENT_REMOTE_PLANNER_BEARER_TOKEN"
    );
  }
  if (remotePlannerAllowUnsigned) {
    remoteConfigPresentKeys.push(
      env.RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_ALLOW_UNSIGNED ? "RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_ALLOW_UNSIGNED" : "RUFUS_AGENT_REMOTE_PLANNER_ALLOW_UNSIGNED"
    );
  }

  const remoteConfigMissingKeys = [];
  if (!remotePlannerUrl) {
    remoteConfigMissingKeys.push("RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_URL");
  }
  if (!remotePlannerAllowUnsigned && !remotePlannerTicketUrl) {
    remoteConfigMissingKeys.push("RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_TICKET_URL");
  }

  const remoteConfigDetected = remoteConfigPresentKeys.length > 0;
  const remoteConfigComplete = remoteConfigMissingKeys.length === 0;
  const invalidRequestedDriver = explicitRequestedDriver && !isSupportedPlannerDriver(explicitRequestedDriver)
    ? explicitRequestedDriver
    : null;

  let remoteConfigErrorReason = null;
  if (!remoteConfigDetected) {
    remoteConfigErrorReason = "Public/community edition requires a hosted plan normalizer. The built-in public endpoint could not be resolved, so set RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_URL and RUFUS_AGENT_REMOTE_PLAN_NORMALIZER_TICKET_URL explicitly.";
  } else if (!remoteConfigComplete) {
    remoteConfigErrorReason = `Hosted plan normalizer configuration is incomplete. Missing: ${remoteConfigMissingKeys.join(", ")}.`;
  }

  return {
    planner_backend: REMOTE_PLANNER_BACKEND,
    planner_driver: REMOTE_PLANNER_DRIVER,
    planner_selection_source: explicitRequestedDriver
      ? ((options.plannerDriver ?? options.driver) != null ? "explicit-option" : "env:RUFUS_AGENT_PLANNER_DRIVER")
      : "public-edition-default",
    remote_config_detected: remoteConfigDetected,
    remote_config_complete: remoteConfigComplete,
    remote_config_error_reason: remoteConfigErrorReason,
    remote_config_present_keys: remoteConfigPresentKeys,
    remote_config_missing_keys: remoteConfigMissingKeys,
    invalid_requested_driver: invalidRequestedDriver
  };
}

export function summarizePlannerConfig(config = {}) {
  return {
    planner_backend: config.planner_backend ?? null,
    planner_driver: config.planner_driver ?? null,
    planner_selection_source: config.planner_selection_source ?? null,
    remote_config_detected: Boolean(config.remote_config_detected),
    remote_config_complete: Boolean(config.remote_config_complete),
    remote_config_error_reason: config.remote_config_error_reason ?? null,
    remote_config_present_keys: Array.isArray(config.remote_config_present_keys) ? [...config.remote_config_present_keys] : [],
    remote_config_missing_keys: Array.isArray(config.remote_config_missing_keys) ? [...config.remote_config_missing_keys] : [],
    invalid_requested_driver: config.invalid_requested_driver ?? null
  };
}

export function validatePlannerConfig(config = {}) {
  if (config.invalid_requested_driver) {
    return {
      error_code: "INVALID_PLANNER_DRIVER",
      message: `Public/community edition only supports ${REMOTE_PLANNER_DRIVER}. Received: ${config.invalid_requested_driver}.`,
      details: summarizePlannerConfig(config)
    };
  }
  if (config.remote_config_error_reason) {
    return {
      error_code: config.remote_config_detected ? "REMOTE_PLANNER_CONFIG_INCOMPLETE" : "REMOTE_PLANNER_REQUIRED",
      message: config.remote_config_error_reason,
      details: summarizePlannerConfig(config)
    };
  }
  return null;
}
