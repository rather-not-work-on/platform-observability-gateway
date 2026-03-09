# telemetry-gateway

Own ingest normalization and dispatch decisions.

- normalize inbound telemetry envelopes before dispatching to buffer or sink
- derive a repo-owned dispatch mode before choosing buffer, sink, or fanout behavior
- expose the repo-owned telemetry envelope and ingest/buffer/sink ports here
- replay and sink specifics stay in sibling packages and implement these interfaces later
- planningops policy stays upstream
