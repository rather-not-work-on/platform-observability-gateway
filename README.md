# platform-observability-gateway

Local-first observability gateway baseline for UAP runtime.

## Scope
- C5 ingest contract skeleton
- continuity checks for `run_id/trace_id/event_id`
- delay/replay dedupe smoke validation
- repo-owned ingest smoke evidence schema and reason taxonomy

## Layout
- `contracts/`: ingest contract schema
- `docs/runbook/`: evidence remediation and operator guidance
- `config/`: fallback/replay policy examples
- `scripts/`: ingest smoke checks and local launcher
- `runtime-artifacts/`: default local ingest smoke reports (gitignored)
- `docs/`: repository topology and extension guidance

Topology guide:
- `docs/repo-topology.md`
- `contracts/README.md`
- `config/README.md`
- `scripts/README.md`
- `docs/runbook/README.md`
- `runtime-artifacts/README.md`

## Workspace Bootstrap
- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `services/telemetry-gateway/`
- `sinks/langfuse-sink/`
- `buffer/replay-worker/`

The workspace bootstrap is intentionally thin in this step.

- current Python scripts remain smoke and launcher tooling
- local runtime outputs stay under `runtime-artifacts/`
- external sink or replay expansion stays in follow-up cards

## Policy Notes
- default mode: local-first
- fallback mode: local file buffer + replay
- cloud migration target can switch endpoint/pipeline while preserving event contract shape

## Smoke Test
```bash
python3 scripts/langfuse_ingest_smoke.py --scenario normal
python3 scripts/langfuse_ingest_smoke.py --scenario delay_and_replay
python3 scripts/validate_ingest_smoke_evidence.py \
  --report runtime-artifacts/ingest/<run_id>-delay_and_replay.json
python3 scripts/validate_contract_pin.py
bash scripts/test_observability_guardrails.sh
```

## Local LangFuse Launcher and Replay/Backfill Drill
```bash
bash scripts/langfuse_stack_launcher.sh --mode dry-run
```

Artifacts:
- `runtime-artifacts/ingest/<run_id>-normal.json`
- `runtime-artifacts/ingest/<run_id>-delay_and_replay.json`
- `runtime-artifacts/launcher/<run_id>.json`

## Local CI Baseline
- workflow: `.github/workflows/observability-local-ci.yml`
- checks:
  - ingest smoke (`normal`, `delay_and_replay`)
  - ingest smoke evidence validation (`scripts/validate_ingest_smoke_evidence.py`)
  - deterministic replay/dedupe assertions
  - contract pin validation (`scripts/validate_contract_pin.py`)
  - seeded failure guard (`scripts/test_observability_guardrails.sh`)
  - topology/module README regression (`scripts/test_module_readmes.sh`)
- evidence contract: `contracts/c5-observability-ingest-smoke-artifact.schema.json`
- reason taxonomy: `config/observability-reason-taxonomy.json`
- runbook: `docs/runbook/ingest-smoke-evidence-runbook.md`

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

Generated local runtime outputs stay under `runtime-artifacts/` and remain gitignored except for the tracked module README.
