# replay-worker

Own replay and local buffer recovery flow.

- do not leak sink implementation details upstream
- remote backfill logic stays out of this scaffold step
