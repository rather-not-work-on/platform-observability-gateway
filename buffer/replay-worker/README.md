# replay-worker

Own replay and local buffer recovery flow.

- choose replay vs skip through a repo-owned replay policy before touching the sink
- consume sink delivery through the telemetry-gateway port surface
- do not leak sink implementation details upstream
- remote backfill logic stays out of this scaffold step
