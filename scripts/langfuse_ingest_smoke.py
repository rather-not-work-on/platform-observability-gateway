#!/usr/bin/env python3

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import sys

from observability_smoke_contract import load_json, validate_report


REQUIRED_KEYS = [
    "trace_id",
    "span_id",
    "run_id",
    "event_id",
    "sequence_no",
    "event_time",
    "delivery_status",
]
DEFAULT_REPORT_SCHEMA = Path("contracts/c5-observability-ingest-smoke-artifact.schema.json")
DEFAULT_EVENT_SCHEMA = Path("contracts/c5-observability-ingest-contract.schema.json")
DEFAULT_TAXONOMY = Path("config/observability-reason-taxonomy.json")


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


def resolve_reason_code(required_errors, continuity_ok, duplicates):
    if required_errors:
        return "missing_required_fields"
    if not continuity_ok:
        return "continuity_error"
    if duplicates:
        return "replay_recovered"
    return "ok"


def main():
    parser = argparse.ArgumentParser(description="LangFuse ingest smoke scenarios")
    parser.add_argument("--scenario", choices=["normal", "delay_and_replay"], default="normal")
    parser.add_argument("--run-id", default=None)
    parser.add_argument(
        "--ingest-profile",
        default="langfuse-local",
        help="logical ingest profile name recorded in smoke evidence",
    )
    parser.add_argument(
        "--output-dir",
        default="runtime-artifacts/ingest",
        help="directory where ingest smoke report is written",
    )
    args = parser.parse_args()

    run_id = args.run_id or f"o11y-smoke-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    taxonomy = load_json(DEFAULT_TAXONOMY)

    events = build_events(args.scenario)
    required_errors = validate_required(events)

    unique_events, duplicates = dedupe_events(events)
    continuity_ok, continuity_errors = continuity_check(unique_events)
    reason_code = resolve_reason_code(required_errors, continuity_ok, duplicates)
    verdict = "pass" if reason_code in {"ok", "replay_recovered"} else "fail"
    report = {
        "generated_at_utc": now_utc(),
        "run_id": run_id,
        "ingest_profile": args.ingest_profile,
        "scenario": args.scenario,
        "verdict": verdict,
        "reason_code": reason_code,
        "reason_taxonomy_version": int(taxonomy.get("version", 0)),
        "required_errors": required_errors,
        "continuity_ok": continuity_ok,
        "continuity_errors": continuity_errors,
        "summary": {
            "input_event_count": len(events),
            "unique_event_count": len(unique_events),
            "duplicate_count": len(duplicates),
            "replay_detected": bool(duplicates),
            "continuity_ok": continuity_ok,
        },
        "dedupe": {
            "input_count": len(events),
            "output_count": len(unique_events),
            "duplicate_event_ids": duplicates,
        },
        "events": unique_events,
    }

    validate_report(report, DEFAULT_REPORT_SCHEMA, DEFAULT_EVENT_SCHEMA, DEFAULT_TAXONOMY)

    out = Path(args.output_dir) / f"{run_id}-{args.scenario}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=True, indent=2), encoding="utf-8")

    print(f"report written: {out}")
    print(
        f"scenario={args.scenario} verdict={verdict} reason_code={reason_code} continuity_ok={continuity_ok} duplicates={len(duplicates)}"
    )
    return 0 if verdict == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
