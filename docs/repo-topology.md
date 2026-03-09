# platform-observability-gateway Topology

## Purpose
Fix the long-term repository boundaries before deeper observability implementation begins.

Workspace root descriptors may be added before runtime wiring is implemented. The first scaffold step introduces `services/`, `sinks/`, and `buffer/` package roots.

## Module Map
| Path | Responsibility | Allowed contents | Must not contain |
| --- | --- | --- | --- |
| `contracts/` | Observability-gateway-owned ingest/replay artifact contracts | schema files and contract docs | runtime code, generated reports |
| `config/` | static ingest, replay, and contract-pin configuration | JSON examples and policy metadata | executable logic, runtime evidence |
| `services/` | ingest gateway service layer | service packages, package README files, TypeScript source | project policy, generated artifacts |
| `sinks/` | external observability sink adapters | sink packages, package README files, TypeScript source | replay policy, generated evidence |
| `buffer/` | replay and local buffering workers | worker packages, package README files, TypeScript source | external sink ownership |
| `scripts/` | smoke checks, launch helpers, validators | repeatable local tooling and tests | mixed business logic without contract boundaries |
| `docs/runbook/` | operator guidance for ingest/replay evidence and remediation | runbooks and procedures | contracts, runtime outputs |
| `runtime-artifacts/` | gitignored local ingest/launcher evidence root | local smoke and launcher outputs plus tracked README | committed runtime reports |

## Extension Rules
1. Add contract/interface changes in `contracts/`.
2. Add ingest/replay policy changes in `config/`.
3. Add ingest gateway code in `services/`.
4. Add sink adapters in `sinks/`.
5. Add replay and buffer workers in `buffer/`.
6. Put repeatable launch/smoke/validation tooling in `scripts/`.
7. Keep operator procedures in `docs/runbook/`.
8. Keep runtime evidence external to Git under `runtime-artifacts/`.

## Ownership Boundary
- `platform-observability-gateway` owns ingest/replay evidence behavior and repo-local validation.
- Shared contract shape comes from `platform-contracts`.
- Planning/orchestration policy belongs upstream in `platform-planningops`.
- `services/telemetry-gateway` defines the public ingest and replay/sink port surface consumed by sibling packages.
- `services/telemetry-gateway` also owns the dispatch mode baseline that chooses buffer, sink, or fanout behavior.
