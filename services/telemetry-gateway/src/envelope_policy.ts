import type { TelemetryEnvelope } from "./telemetry_ports.js";

function normalizeRequired(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed || fallback;
}

export function normalizeTelemetryEnvelope(envelope: TelemetryEnvelope): TelemetryEnvelope {
  return {
    ...envelope,
    runId: normalizeRequired(envelope.runId, "unknown-run"),
    missionId: normalizeRequired(envelope.missionId, "unknown-mission"),
    eventName: normalizeRequired(envelope.eventName, "telemetry.unknown"),
    detail: envelope.detail?.trim() || undefined,
    taskId: envelope.taskId?.trim() || undefined,
    handoffId: envelope.handoffId?.trim() || undefined,
    traceId: envelope.traceId?.trim() || undefined,
    reasonCode: envelope.reasonCode?.trim() || undefined,
    source: envelope.source ?? "executor",
  };
}
