#!/usr/bin/env python3

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import subprocess
import sys


def now_utc():
    return datetime.now(timezone.utc).isoformat()


def run(command: list[str], cwd: Path, env: dict[str, str] | None = None):
    return subprocess.run(command, cwd=cwd, capture_output=True, text=True, env=env)


def python_first_env():
    env = os.environ.copy()
    python_bin = str(Path(sys.executable).resolve().parent)
    env["PATH"] = f"{python_bin}:{env.get('PATH', '')}"
    env["PYTHON_BIN"] = sys.executable
    return env


def main():
    parser = argparse.ArgumentParser(description="Run a launcher-backed Langfuse local smoke wrapper")
    parser.add_argument("--launcher-mode", choices=["dry-run", "start"], default="start")
    parser.add_argument(
        "--run-id",
        default=f"langfuse-live-smoke-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Optional manifest path. Defaults to runtime-artifacts/live/<run_id>.json",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    env = python_first_env()
    launcher_run_id = f"{args.run_id}-launcher"
    launcher_report = repo_root / "runtime-artifacts" / "launcher" / f"{launcher_run_id}.json"
    normal_report = repo_root / "runtime-artifacts" / "ingest" / f"{launcher_run_id}-normal.json"
    replay_report = repo_root / "runtime-artifacts" / "ingest" / f"{launcher_run_id}-delay_and_replay.json"
    normal_validation = repo_root / "runtime-artifacts" / "validation" / f"{args.run_id}-normal-validation.json"
    replay_validation = repo_root / "runtime-artifacts" / "validation" / f"{args.run_id}-replay-validation.json"

    launcher = run(
        [
            "bash",
            "scripts/langfuse_stack_launcher.sh",
            "--mode",
            args.launcher_mode,
            "--run-id",
            launcher_run_id,
        ],
        cwd=repo_root,
        env=env,
    )

    normal = run(
        [
            sys.executable,
            "scripts/validate_ingest_smoke_evidence.py",
            "--report",
            str(normal_report),
            "--output",
            str(normal_validation),
        ],
        cwd=repo_root,
        env=env,
    )
    replay = run(
        [
            sys.executable,
            "scripts/validate_ingest_smoke_evidence.py",
            "--report",
            str(replay_report),
            "--output",
            str(replay_validation),
        ],
        cwd=repo_root,
        env=env,
    )

    if args.launcher_mode == "start":
        run(["bash", "scripts/langfuse_stack_launcher.sh", "--mode", "stop"], cwd=repo_root, env=env)

    verdict = "pass" if launcher.returncode == 0 and normal.returncode == 0 and replay.returncode == 0 else "fail"
    reason_code = "ok" if verdict == "pass" else "langfuse_live_smoke_failed"
    report = {
        "generated_at_utc": now_utc(),
        "run_id": args.run_id,
        "launcher_mode_requested": args.launcher_mode,
        "launcher": {
            "exit_code": launcher.returncode,
            "stdout": launcher.stdout.strip(),
            "stderr": launcher.stderr.strip(),
            "report_path": str(launcher_report),
        },
        "normal_validation": {
            "exit_code": normal.returncode,
            "stdout": normal.stdout.strip(),
            "stderr": normal.stderr.strip(),
            "report_path": str(normal_validation),
            "source_report": str(normal_report),
        },
        "replay_validation": {
            "exit_code": replay.returncode,
            "stdout": replay.stdout.strip(),
            "stderr": replay.stderr.strip(),
            "report_path": str(replay_validation),
            "source_report": str(replay_report),
        },
        "verdict": verdict,
        "reason_code": reason_code,
    }

    output_path = Path(args.output) if args.output else repo_root / "runtime-artifacts" / "live" / f"{args.run_id}.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(report, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")

    print(f"report written: {output_path}")
    print(f"verdict={verdict} reason_code={reason_code}")
    return 0 if verdict == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
