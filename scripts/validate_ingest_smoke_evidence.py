#!/usr/bin/env python3

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import sys

from observability_smoke_contract import load_json, validate_report


DEFAULT_REPORT_SCHEMA = Path("contracts/c5-observability-ingest-smoke-artifact.schema.json")
DEFAULT_EVENT_SCHEMA = Path("contracts/c5-observability-ingest-contract.schema.json")
DEFAULT_TAXONOMY = Path("config/observability-reason-taxonomy.json")


def now_utc():
    return datetime.now(timezone.utc).isoformat()


def main():
    parser = argparse.ArgumentParser(description="Validate observability ingest smoke evidence")
    parser.add_argument("--report", required=True)
    parser.add_argument("--report-schema", default=str(DEFAULT_REPORT_SCHEMA))
    parser.add_argument("--event-schema", default=str(DEFAULT_EVENT_SCHEMA))
    parser.add_argument("--taxonomy", default=str(DEFAULT_TAXONOMY))
    parser.add_argument("--output", default="runtime-artifacts/validation/ingest-smoke-evidence-report.json")
    args = parser.parse_args()

    report_doc = load_json(Path(args.report))
    errors = []
    try:
        validate_report(
            report_doc,
            Path(args.report_schema),
            Path(args.event_schema),
            Path(args.taxonomy),
        )
    except Exception as exc:  # noqa: BLE001
        errors.append(str(exc))

    verdict = "pass" if not errors else "fail"
    payload = {
        "generated_at_utc": now_utc(),
        "report_path": args.report,
        "report_schema_path": args.report_schema,
        "event_schema_path": args.event_schema,
        "taxonomy_path": args.taxonomy,
        "error_count": len(errors),
        "errors": errors,
        "verdict": verdict,
    }
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=True, indent=2), encoding="utf-8")

    print(f"report written: {out}")
    print(f"verdict={verdict} error_count={len(errors)}")
    return 0 if verdict == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
