# scripts

## Responsibility
Host repeatable local ingest/replay smoke, validation, and launcher tooling.

## Contents
- ingest smoke scenarios
- evidence validators
- contract pin validation
- stack launcher helpers

## Rules
- scripts should emit runtime output into `runtime-artifacts/` or `/tmp`, not Git-tracked paths
- repository topology drift must be caught by `test_module_readmes.sh`
