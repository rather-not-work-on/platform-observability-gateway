# Ingest Smoke Evidence Runbook

## Purpose
Keep replay/dedupe smoke validation contract-owned by `platform-observability-gateway`.

## Commands
```bash
python3 scripts/langfuse_ingest_smoke.py --scenario normal
python3 scripts/langfuse_ingest_smoke.py --scenario delay_and_replay
python3 scripts/validate_ingest_smoke_evidence.py \
  --report runtime-artifacts/ingest/<run_id>-delay_and_replay.json
```

## Evidence Contract
- report schema: `contracts/c5-observability-ingest-smoke-artifact.schema.json`
- event schema: `contracts/c5-observability-ingest-contract.schema.json`
- reason taxonomy: `config/observability-reason-taxonomy.json`

## Expected Outcomes
- `normal` => `verdict=pass`, `reason_code=ok`
- `delay_and_replay` => `verdict=pass`, `reason_code=replay_recovered`
- any missing contract field => `verdict=fail`, `reason_code=missing_required_fields`
- continuity break => `verdict=fail`, `reason_code=continuity_error`

## Remediation
1. Fix the event payload or replay policy so each emitted event satisfies `c5-observability-ingest-contract`.
2. Re-run smoke generation and `validate_ingest_smoke_evidence.py`.
3. Only update taxonomy/schema if the runtime semantics actually changed.
