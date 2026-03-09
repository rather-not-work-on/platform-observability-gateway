import type { TelemetryBufferAppendPort, TelemetrySinkDeliveryPort } from "./telemetry_ports.js";

export type TelemetryDispatchMode = "buffer_only" | "sink_only" | "fanout" | "noop";

export interface DispatchModeDependencies {
  buffer?: TelemetryBufferAppendPort;
  sink?: TelemetrySinkDeliveryPort;
}

export function resolveDispatchMode(
  requestedMode: TelemetryDispatchMode | undefined,
  dependencies: DispatchModeDependencies,
): TelemetryDispatchMode {
  if (requestedMode === "buffer_only" && dependencies.buffer) {
    return requestedMode;
  }

  if (requestedMode === "sink_only" && dependencies.sink) {
    return requestedMode;
  }

  if (requestedMode === "fanout" && dependencies.buffer && dependencies.sink) {
    return requestedMode;
  }

  if (dependencies.buffer && dependencies.sink) {
    return "fanout";
  }

  if (dependencies.buffer) {
    return "buffer_only";
  }

  if (dependencies.sink) {
    return "sink_only";
  }

  return "noop";
}
