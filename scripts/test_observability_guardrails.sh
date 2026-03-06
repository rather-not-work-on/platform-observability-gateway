#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

RUN_ID="o11y-ci-guard"
OUT_DIR="$TMP_DIR/ingest"
mkdir -p "$OUT_DIR"

python3 "$ROOT_DIR/scripts/langfuse_ingest_smoke.py" \
  --scenario normal \
  --run-id "$RUN_ID" \
  --output-dir "$OUT_DIR"

python3 "$ROOT_DIR/scripts/langfuse_ingest_smoke.py" \
  --scenario delay_and_replay \
  --run-id "$RUN_ID" \
  --output-dir "$OUT_DIR"

NORMAL_REPORT="$OUT_DIR/$RUN_ID-normal.json"
REPLAY_REPORT="$OUT_DIR/$RUN_ID-delay_and_replay.json"

python3 - "$NORMAL_REPORT" "$REPLAY_REPORT" <<'PY'
import json
import sys
from pathlib import Path

normal = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
replay = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))

if normal.get("verdict") != "pass":
    raise SystemExit("normal scenario must pass")
if replay.get("verdict") != "pass":
    raise SystemExit("delay_and_replay scenario must pass")

if normal["dedupe"]["output_count"] != 2:
    raise SystemExit("normal output_count must be 2")
if replay["dedupe"]["output_count"] != 3:
    raise SystemExit("delay_and_replay output_count must be 3")

duplicates = replay["dedupe"]["duplicate_event_ids"]
if duplicates != ["evt-002"]:
    raise SystemExit(f"unexpected replay duplicates: {duplicates}")
PY

python3 "$ROOT_DIR/scripts/validate_contract_pin.py" \
  --output "$TMP_DIR/contract-pin-report.json"

INVALID_PIN="$TMP_DIR/contract-pin.invalid.json"
cat > "$INVALID_PIN" <<'JSON'
{
  "source_repo": "rather-not-work-on/platform-contracts",
  "contract_bundle_version": "2026.02.28",
  "pinned_contracts": [],
  "consumer_repo": "rather-not-work-on/platform-observability-gateway"
}
JSON

if python3 "$ROOT_DIR/scripts/validate_contract_pin.py" \
  --pin "$INVALID_PIN" \
  --output "$TMP_DIR/contract-pin-invalid-report.json"; then
  echo "[FAIL] invalid contract pin unexpectedly passed"
  exit 1
fi

echo "observability guardrails regression passed"
