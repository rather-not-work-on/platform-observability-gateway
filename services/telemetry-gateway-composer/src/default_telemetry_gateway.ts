import { LangfuseSink } from "@rather-not-work-on/langfuse-sink";
import { FileBuffer } from "@rather-not-work-on/replay-worker";
import {
  TelemetryGateway,
  type TelemetryBufferAppendPort,
  type TelemetryDispatchMode,
  type TelemetryGatewayDependencies,
  type TelemetrySinkDeliveryPort,
} from "@rather-not-work-on/telemetry-gateway";

export interface DefaultTelemetryGatewayOptions {
  buffer?: TelemetryBufferAppendPort;
  sink?: TelemetrySinkDeliveryPort;
  dispatchMode?: TelemetryDispatchMode;
}

export function buildDefaultTelemetryGatewayDependencies(
  options: DefaultTelemetryGatewayOptions = {},
): TelemetryGatewayDependencies {
  return {
    buffer: options.buffer ?? new FileBuffer(),
    sink: options.sink ?? new LangfuseSink(),
    dispatchMode: options.dispatchMode,
  };
}

export function createDefaultTelemetryGateway(options: DefaultTelemetryGatewayOptions = {}): TelemetryGateway {
  return new TelemetryGateway(buildDefaultTelemetryGatewayDependencies(options));
}
