import type { TelemetryBufferAppendOutcome, TelemetryBufferAppendPort, TelemetryEnvelope } from "@rather-not-work-on/telemetry-gateway";

export class FileBuffer implements TelemetryBufferAppendPort {
  append(envelope: TelemetryEnvelope): TelemetryBufferAppendOutcome {
    return {
      buffered: true,
      runId: envelope.runId,
      eventName: envelope.eventName,
    };
  }
}
