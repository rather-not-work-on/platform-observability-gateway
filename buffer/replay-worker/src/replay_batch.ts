import type { TelemetryEnvelope } from "@rather-not-work-on/telemetry-gateway";

export interface TelemetryReplayBatch {
  batchId: string;
  events: TelemetryEnvelope[];
}
