export interface TelemetryEnvelope {
  runId: string;
  eventName: string;
  detail?: string;
  traceId?: string;
}

export interface TelemetryIngestRequest {
  envelope: TelemetryEnvelope;
}

export interface TelemetryIngestOutcome {
  accepted: boolean;
  runId: string;
  eventName: string;
}

export interface TelemetryBufferAppendOutcome {
  buffered: boolean;
  runId: string;
  eventName: string;
}

export interface TelemetrySinkDeliveryOutcome {
  delivered: boolean;
  runId: string;
  eventName: string;
}

export interface TelemetryIngestPort {
  ingest(request: TelemetryIngestRequest): TelemetryIngestOutcome;
}

export interface TelemetryBufferAppendPort {
  append(envelope: TelemetryEnvelope): TelemetryBufferAppendOutcome;
}

export interface TelemetrySinkDeliveryPort {
  deliver(envelope: TelemetryEnvelope): TelemetrySinkDeliveryOutcome;
}
