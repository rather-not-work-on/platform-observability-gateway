import type { TelemetryReplayBatch } from "./replay_batch.js";
import type { ReplayReason } from "./replay_reason.js";

export type ReplayDispatchMode = "replay" | "skip";

export interface ReplayPolicyInput {
  batch: TelemetryReplayBatch;
  reason: ReplayReason;
  maxBatchSize?: number;
}

export interface ReplayPolicy {
  dispatchMode: ReplayDispatchMode;
  reason: ReplayReason;
}

export function resolveReplayPolicy(input: ReplayPolicyInput): ReplayPolicy {
  if (input.batch.events.length === 0) {
    return {
      dispatchMode: "skip",
      reason: input.reason,
    };
  }

  if (input.maxBatchSize && input.batch.events.length > input.maxBatchSize) {
    return {
      dispatchMode: "skip",
      reason: input.reason,
    };
  }

  return {
    dispatchMode: "replay",
    reason: input.reason,
  };
}
