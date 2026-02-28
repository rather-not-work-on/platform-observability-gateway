#!/usr/bin/env python3

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import sys


REQUIRED_KEYS = [
    "trace_id",
    "span_id",
    "run_id",
    "event_id",
    "sequence_no",
    "event_time",
    "delivery_status",
]


def now_utc():
    return datetime.now(timezone.utc).isoformat()


def build_events(scenario: str):
    base = [
        {
            "trace_id": "trace-001",
            "span_id": "span-001",
            "run_id": "run-001",
            "event_id": "evt-001",
            "sequence_no": 1,
            "event_time": "2026-02-28T00:00:00Z",
            "delivery_status": "delivered",
        },
        {
            "trace_id": "trace-001",
            "span_id": "span-002",
            "run_id": "run-001",
            "event_id": "evt-002",
            "sequence_no": 2,
            "event_time": "2026-02-28T00:00:02Z",
            "delivery_status": "delivered",
        },
    ]

    if scenario == "normal":
        return base

    if scenario == "delay_and_replay":
        return base + [
            {
                "trace_id": "trace-001",
                "span_id": "span-002",
                "run_id": "run-001",
                "event_id": "evt-002",
                "sequence_no": 2,
                "event_time": "2026-02-28T00:00:05Z",
                "delivery_status": "retriable_failed",
            },
            {
                "trace_id": "trace-001",
                "span_id": "span-003",
                "run_id": "run-001",
                "event_id": "evt-003",
                "sequence_no": 3,
                "event_time": "2026-02-28T00:00:09Z",
                "delivery_status": "delivered",
            },
        ]

    raise ValueError(f"unknown scenario: {scenario}")


def validate_required(events):
    errors = []
    for i, e in enumerate(events):
        for key in REQUIRED_KEYS:
            if key not in e:
                errors.append(f"event[{i}] missing key: {key}")
    return errors


def continuity_check(events):
    if not events:
        return False, ["no events"]

    run_ids = {e["run_id"] for e in events}
    trace_ids = {e["trace_id"] for e in events}
    errors = []
    if len(run_ids) != 1:
        errors.append("multiple run_id values detected")
    if len(trace_ids) != 1:
        errors.append("multiple trace_id values detected")

    seq = [e["sequence_no"] for e in events]
    if min(seq) != 1:
        errors.append("sequence does not start at 1")

    return len(errors) == 0, errors


def dedupe_events(events):
    seen = set()
    unique = []
    duplicates = []
    for e in events:
        key = e["event_id"]
        if key in seen:
            duplicates.append(key)
            continue
        seen.add(key)
        unique.append(e)
    return unique, duplicates


def main():
    parser = argparse.ArgumentParser(description="LangFuse ingest smoke scenarios")
    parser.add_argument("--scenario", choices=["normal", "delay_and_replay"], default="normal")
    parser.add_argument("--run-id", default=None)
    args = parser.parse_args()

    run_id = args.run_id or f"o11y-smoke-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"

    events = build_events(args.scenario)
    required_errors = validate_required(events)

    unique_events, duplicates = dedupe_events(events)
    continuity_ok, continuity_errors = continuity_check(unique_events)

    fail_reasons = []
    if required_errors:
        fail_reasons.append("missing_required_fields")
    if not continuity_ok:
        fail_reasons.append("continuity_error")

    verdict = "pass" if not fail_reasons else "fail"
    report = {
        "generated_at_utc": now_utc(),
        "run_id": run_id,
        "scenario": args.scenario,
        "verdict": verdict,
        "fail_reasons": fail_reasons,
        "required_errors": required_errors,
        "continuity_ok": continuity_ok,
        "continuity_errors": continuity_errors,
        "event_count": len(events),
        "dedupe": {
            "input_count": len(events),
            "output_count": len(unique_events),
            "duplicate_event_ids": duplicates,
        },
        "events": unique_events,
    }

    out = Path(f"artifacts/ingest/{run_id}-{args.scenario}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=True, indent=2), encoding="utf-8")

    print(f"report written: {out}")
    print(
        f"scenario={args.scenario} verdict={verdict} continuity_ok={continuity_ok} duplicates={len(duplicates)}"
    )
    return 0 if verdict == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
