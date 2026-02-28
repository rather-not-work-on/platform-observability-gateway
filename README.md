# platform-observability-gateway

Local-first observability gateway baseline for UAP runtime.

## Scope
- C5 ingest contract skeleton
- continuity checks for `run_id/trace_id/event_id`
- delay/replay dedupe smoke validation

## Layout
- `contracts/`: ingest contract schema
- `config/`: fallback/replay policy examples
- `scripts/`: ingest smoke checks
- `artifacts/`: ingest smoke reports

## Policy Notes
- default mode: local-first
- fallback mode: local file buffer + replay
- cloud migration target can switch endpoint/pipeline while preserving event contract shape

## Smoke Test
```bash
python3 scripts/langfuse_ingest_smoke.py --scenario normal
python3 scripts/langfuse_ingest_smoke.py --scenario delay_and_replay
```
