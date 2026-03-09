import { FileBuffer } from "@rather-not-work-on/replay-worker";
import { LangfuseSink, type LangfuseSinkProfile } from "@rather-not-work-on/langfuse-sink";
import {
  TelemetryGateway,
  type TelemetryBufferAppendPort,
  type TelemetryDispatchMode,
  type TelemetrySinkDeliveryPort,
} from "@rather-not-work-on/telemetry-gateway";

export interface LangfuseRuntimeProfileSource {
  execution_mode: string;
  langfuse_host: string;
  litellm_base_url?: string;
  nanoclaw_endpoint?: string;
}

export interface LangfuseRuntimeProfileCatalog {
  active_profile?: string;
  profiles: Record<string, LangfuseRuntimeProfileSource>;
}

export interface LangfuseLocalRuntimeProfile {
  profileName: string;
  executionMode: string;
  langfuseHost: string;
}

export interface DefaultLangfuseGatewayOptions {
  profile: LangfuseLocalRuntimeProfile;
  buffer?: TelemetryBufferAppendPort;
  sink?: TelemetrySinkDeliveryPort;
  dispatchMode?: TelemetryDispatchMode;
}

function buildLangfuseProfile(profile: LangfuseLocalRuntimeProfile): LangfuseSinkProfile {
  return {
    runtimeProfileName: profile.profileName,
    host: profile.langfuseHost,
    executionMode: profile.executionMode,
  };
}

export function resolveLangfuseRuntimeProfile(
  catalog: LangfuseRuntimeProfileCatalog,
  requestedProfileName = catalog.active_profile,
): LangfuseLocalRuntimeProfile {
  if (!requestedProfileName) {
    throw new Error("runtime profile name is required");
  }

  const rawProfile = catalog.profiles[requestedProfileName];
  if (!rawProfile) {
    throw new Error(`runtime profile '${requestedProfileName}' is not defined`);
  }

  return {
    profileName: requestedProfileName,
    executionMode: rawProfile.execution_mode,
    langfuseHost: rawProfile.langfuse_host,
  };
}

export function createDefaultLangfuseGateway(options: DefaultLangfuseGatewayOptions): TelemetryGateway {
  return new TelemetryGateway({
    buffer: options.buffer ?? new FileBuffer(),
    sink: options.sink ?? new LangfuseSink({ profile: buildLangfuseProfile(options.profile) }),
    dispatchMode: options.dispatchMode ?? "fanout",
  });
}
