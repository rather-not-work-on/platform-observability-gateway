import type {
  TelemetryBufferAppendPort,
  TelemetryIngestOutcome,
  TelemetryIngestPort,
  TelemetryIngestRequest,
  TelemetrySinkDeliveryPort,
} from "./telemetry_ports.js";

export interface TelemetryGatewayDependencies {
  buffer?: TelemetryBufferAppendPort;
  sink?: TelemetrySinkDeliveryPort;
}

export class TelemetryGateway implements TelemetryIngestPort {
  constructor(private readonly dependencies: TelemetryGatewayDependencies = {}) {}

  ingest(request: TelemetryIngestRequest): TelemetryIngestOutcome {
    const { envelope } = request;

    this.dependencies.buffer?.append(envelope);
    this.dependencies.sink?.deliver(envelope);

    return {
      accepted: true,
      runId: envelope.runId,
      eventName: envelope.eventName,
    };
  }
}
