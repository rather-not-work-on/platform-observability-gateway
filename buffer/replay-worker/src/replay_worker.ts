import type { TelemetrySinkDeliveryPort } from "@rather-not-work-on/telemetry-gateway";

import type { ReplayReason } from "./replay_reason.js";
import type { TelemetryReplayBatch } from "./replay_batch.js";
import { resolveReplayPolicy } from "./replay_policy.js";

export interface ReplayWorkerDependencies {
  sink: TelemetrySinkDeliveryPort;
  maxBatchSize?: number;
}

export interface ReplayOutcome {
  replayed: boolean;
  batchId: string;
  reason: ReplayReason;
}

export class ReplayWorker {
  constructor(private readonly dependencies: ReplayWorkerDependencies) {}

  replay(batch: TelemetryReplayBatch, reason: ReplayReason = "delay_replay"): ReplayOutcome {
    const replayPolicy = resolveReplayPolicy({
      batch,
      reason,
      maxBatchSize: this.dependencies.maxBatchSize,
    });
    if (replayPolicy.dispatchMode === "skip") {
      return {
        replayed: false,
        batchId: batch.batchId,
        reason: replayPolicy.reason,
      };
    }

    for (const event of batch.events) {
      this.dependencies.sink.deliver(event);
    }

    return {
      replayed: true,
      batchId: batch.batchId,
      reason: replayPolicy.reason,
    };
  }
}
