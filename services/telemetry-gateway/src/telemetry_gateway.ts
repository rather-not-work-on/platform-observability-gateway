import type {
  TelemetryBufferAppendPort,
  TelemetryIngestOutcome,
  TelemetryIngestPort,
  TelemetryIngestRequest,
  TelemetrySinkDeliveryPort,
} from "./telemetry_ports.js";
import { resolveDispatchMode, type TelemetryDispatchMode } from "./dispatch_mode.js";
import { normalizeTelemetryEnvelope } from "./envelope_policy.js";

export interface TelemetryGatewayDependencies {
  buffer?: TelemetryBufferAppendPort;
  sink?: TelemetrySinkDeliveryPort;
  dispatchMode?: TelemetryDispatchMode;
}

export class TelemetryGateway implements TelemetryIngestPort {
  constructor(private readonly dependencies: TelemetryGatewayDependencies = {}) {}

  ingest(request: TelemetryIngestRequest): TelemetryIngestOutcome {
    const envelope = normalizeTelemetryEnvelope(request.envelope);
    const dispatchMode = resolveDispatchMode(this.dependencies.dispatchMode, this.dependencies);

    if (dispatchMode === "buffer_only" || dispatchMode === "fanout") {
      this.dependencies.buffer?.append(envelope);
    }

    if (dispatchMode === "sink_only" || dispatchMode === "fanout") {
      this.dependencies.sink?.deliver(envelope);
    }

    return {
      accepted: dispatchMode !== "noop",
      runId: envelope.runId,
      eventName: envelope.eventName,
    };
  }
}
