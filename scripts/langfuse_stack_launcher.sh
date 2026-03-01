#!/usr/bin/env bash
set -euo pipefail

MODE="dry-run"
RUN_ID="o11y-launcher-$(date -u +%Y%m%dT%H%M%SZ)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --run-id)
      RUN_ID="$2"
      shift 2
      ;;
    *)
      echo "unknown arg: $1"
      exit 2
      ;;
  esac
done

mkdir -p artifacts/launcher artifacts/ingest

if [[ "$MODE" == "dry-run" ]]; then
  echo "[launcher] dry-run mode: running replay/backfill drill"
  python3 scripts/langfuse_ingest_smoke.py --scenario normal --run-id "$RUN_ID"
  python3 scripts/langfuse_ingest_smoke.py --scenario delay_and_replay --run-id "$RUN_ID"

  python3 - <<PY
import json
from pathlib import Path
from datetime import datetime, timezone

run_id = "${RUN_ID}"
normal_path = Path(f"artifacts/ingest/{run_id}-normal.json")
replay_path = Path(f"artifacts/ingest/{run_id}-delay_and_replay.json")

normal = json.loads(normal_path.read_text(encoding="utf-8"))
replay = json.loads(replay_path.read_text(encoding="utf-8"))

continuity_ok = bool(replay.get("continuity_ok"))
verdict = "pass" if normal.get("verdict") == "pass" and replay.get("verdict") == "pass" and continuity_ok else "fail"
manifest = {
    "generated_at_utc": datetime.now(timezone.utc).isoformat(),
    "run_id": run_id,
    "mode": "dry-run",
    "normal_report": str(normal_path),
    "replay_backfill_report": str(replay_path),
    "continuity_ok": continuity_ok,
    "duplicate_event_ids": replay.get("dedupe", {}).get("duplicate_event_ids", []),
    "verdict": verdict,
}

out = Path(f"artifacts/launcher/{run_id}.json")
out.write_text(json.dumps(manifest, ensure_ascii=True, indent=2), encoding="utf-8")
print(f"launcher manifest: {out}")
print(f"continuity_ok={continuity_ok} verdict={verdict}")

raise SystemExit(0 if verdict == "pass" else 1)
PY
  exit $?
fi

if [[ "$MODE" == "start" ]]; then
  echo "[launcher] start mode requested"
  if [[ -f "ops/langfuse.compose.yaml" ]]; then
    docker compose -f ops/langfuse.compose.yaml up -d
  else
    echo "[launcher] compose file not found (ops/langfuse.compose.yaml), running dry-run drill fallback"
  fi
  bash scripts/langfuse_stack_launcher.sh --mode dry-run --run-id "$RUN_ID"
  exit $?
fi

if [[ "$MODE" == "stop" ]]; then
  echo "[launcher] stop mode requested"
  if [[ -f "ops/langfuse.compose.yaml" ]]; then
    docker compose -f ops/langfuse.compose.yaml down
  else
    echo "[launcher] compose file not found (ops/langfuse.compose.yaml), nothing to stop"
  fi
  exit 0
fi

echo "unsupported mode: $MODE"
exit 2
