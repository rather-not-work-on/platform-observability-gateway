export { TelemetryGateway } from "./telemetry_gateway.js";
export { normalizeTelemetryEnvelope } from "./envelope_policy.js";
export { resolveDispatchMode } from "./dispatch_mode.js";
export type {
  TelemetryBufferAppendOutcome,
  TelemetryBufferAppendPort,
  TelemetryEnvelope,
  TelemetryIngestOutcome,
  TelemetryIngestPort,
  TelemetryIngestRequest,
  TelemetrySinkDeliveryOutcome,
  TelemetrySinkDeliveryPort,
} from "./telemetry_ports.js";
export type { DispatchModeDependencies, TelemetryDispatchMode } from "./dispatch_mode.js";
