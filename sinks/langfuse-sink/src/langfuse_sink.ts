import type { TelemetryEnvelope, TelemetrySinkDeliveryOutcome, TelemetrySinkDeliveryPort } from "@rather-not-work-on/telemetry-gateway";

export class LangfuseSink implements TelemetrySinkDeliveryPort {
  deliver(envelope: TelemetryEnvelope): TelemetrySinkDeliveryOutcome {
    return {
      delivered: true,
      runId: envelope.runId,
      eventName: envelope.eventName,
    };
  }
}
