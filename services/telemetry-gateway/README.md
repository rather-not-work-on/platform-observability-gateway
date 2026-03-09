# telemetry-gateway

Own ingest normalization and dispatch decisions.

- derive a repo-owned dispatch mode before choosing buffer, sink, or fanout behavior
- expose the repo-owned telemetry envelope and ingest/buffer/sink ports here
- replay and sink specifics stay in sibling packages and implement these interfaces later
- planningops policy stays upstream
