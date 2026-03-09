import type { TelemetryEnvelope, TelemetrySinkDeliveryOutcome } from "@rather-not-work-on/telemetry-gateway";
import { normalizeTelemetryEnvelope } from "@rather-not-work-on/telemetry-gateway";

export function buildDeliveryOutcome(envelope: TelemetryEnvelope): TelemetrySinkDeliveryOutcome {
  const normalizedEnvelope = normalizeTelemetryEnvelope(envelope);

  return {
    delivered: normalizedEnvelope.runId.length > 0,
    runId: normalizedEnvelope.runId,
    eventName: normalizedEnvelope.eventName,
  };
}
