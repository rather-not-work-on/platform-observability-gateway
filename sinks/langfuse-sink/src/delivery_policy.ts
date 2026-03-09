import type { TelemetryEnvelope, TelemetrySinkDeliveryOutcome } from "@rather-not-work-on/telemetry-gateway";

function normalizeEventName(eventName: string): string {
  return eventName.trim() || "telemetry.unknown";
}

export function buildDeliveryOutcome(envelope: TelemetryEnvelope): TelemetrySinkDeliveryOutcome {
  const eventName = normalizeEventName(envelope.eventName);

  return {
    delivered: envelope.runId.trim().length > 0,
    runId: envelope.runId,
    eventName,
  };
}
