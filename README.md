# platform-observability-gateway

Local-first observability gateway baseline for UAP runtime.

## Scope
- C5 ingest contract skeleton
- continuity checks for `run_id/trace_id/event_id`
- delay/replay dedupe smoke validation

## Layout
- `contracts/`: ingest contract schema
- `config/`: fallback/replay policy examples
- `scripts/`: ingest smoke checks and local launcher
- `artifacts/`: ingest smoke reports

## Policy Notes
- default mode: local-first
- fallback mode: local file buffer + replay
- cloud migration target can switch endpoint/pipeline while preserving event contract shape

## Smoke Test
```bash
python3 scripts/langfuse_ingest_smoke.py --scenario normal
python3 scripts/langfuse_ingest_smoke.py --scenario delay_and_replay
python3 scripts/validate_contract_pin.py
bash scripts/test_observability_guardrails.sh
```

## Local LangFuse Launcher and Replay/Backfill Drill
```bash
bash scripts/langfuse_stack_launcher.sh --mode dry-run
```

Artifacts:
- `artifacts/ingest/<run_id>-normal.json`
- `artifacts/ingest/<run_id>-delay_and_replay.json`
- `artifacts/launcher/<run_id>.json`

## Local CI Baseline
- workflow: `.github/workflows/observability-local-ci.yml`
- checks:
  - ingest smoke (`normal`, `delay_and_replay`)
  - deterministic replay/dedupe assertions
  - contract pin validation (`scripts/validate_contract_pin.py`)
  - seeded failure guard (`scripts/test_observability_guardrails.sh`)

### Contract Pin Remediation
When contract pin validation fails:
1. Open `config/contract-pin.json`.
2. Ensure:
   - `source_repo == rather-not-work-on/platform-contracts`
   - `consumer_repo == rather-not-work-on/platform-observability-gateway`
   - `contract_bundle_version` format is `YYYY.MM.DD`
   - `pinned_contracts` contains `c5-observability-event`
3. Re-run:

```bash
python3 scripts/validate_contract_pin.py
bash scripts/test_observability_guardrails.sh
```
