export interface TelemetryEnvelope {
  runId: string;
  missionId: string;
  eventName: string;
  detail?: string;
  taskId?: string;
  handoffId?: string;
  traceId?: string;
  source?: "executor" | "orchestrator" | "provider" | "observability";
  resultType?: "complete" | "partial" | "failed" | "canceled";
  reasonCode?: string;
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
