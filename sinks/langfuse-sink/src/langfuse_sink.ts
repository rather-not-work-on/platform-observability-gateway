import type {
  TelemetryEnvelope,
  TelemetrySinkDeliveryOutcome,
  TelemetrySinkDeliveryPort,
} from "@rather-not-work-on/telemetry-gateway";
import { normalizeTelemetryEnvelope } from "@rather-not-work-on/telemetry-gateway";

import { buildDeliveryOutcome } from "./delivery_policy.js";

export interface LangfuseSinkProfile {
  runtimeProfileName: string;
  host: string;
  executionMode?: string;
}

export interface LangfuseSinkOptions {
  profile?: LangfuseSinkProfile;
}

export class LangfuseSink implements TelemetrySinkDeliveryPort {
  constructor(private readonly options: LangfuseSinkOptions = {}) {}

  deliver(envelope: TelemetryEnvelope): TelemetrySinkDeliveryOutcome {
    const outcome = buildDeliveryOutcome(normalizeTelemetryEnvelope(envelope));

    return {
      ...outcome,
      delivered: outcome.delivered && (!this.options.profile || this.options.profile.host.length > 0),
    };
  }
}
