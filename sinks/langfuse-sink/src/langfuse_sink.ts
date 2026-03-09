import type { TelemetryEnvelope, TelemetrySinkDeliveryOutcome, TelemetrySinkDeliveryPort } from "@rather-not-work-on/telemetry-gateway";

import { buildDeliveryOutcome } from "./delivery_policy.js";

export class LangfuseSink implements TelemetrySinkDeliveryPort {
  deliver(envelope: TelemetryEnvelope): TelemetrySinkDeliveryOutcome {
    return buildDeliveryOutcome(envelope);
  }
}
