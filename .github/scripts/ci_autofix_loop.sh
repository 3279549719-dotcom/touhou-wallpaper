#!/usr/bin/env bash
# In-job mechanical check + optional Cursor autofix loop (N attempts).
set -euo pipefail

MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
OUTCOME_FILE="${OUTCOME_FILE:-autofix-outcome.txt}"

strip_key() {
  CURSOR_API_KEY="$(printf '%s' "${CURSOR_API_KEY:-}" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  export CURSOR_API_KEY
}

run_checks() {
  set +e
  npx tsc -b --noEmit > tsc.log 2>&1
  local tsc_code=$?
  npx vitest run --reporter=verbose > vitest.log 2>&1
  local vitest_code=$?
  set -e
  {
    echo "=== Mechanical Check Results ==="
    echo ""
    echo "[TypeScript] Exit: ${tsc_code}"
    tail -n 40 tsc.log 2>/dev/null || true
    echo ""
    echo "[Vitest] Exit: ${vitest_code}"
    tail -n 60 vitest.log 2>/dev/null || true
  } > check-summary.txt
  if [[ "${tsc_code}" -eq 0 && "${vitest_code}" -eq 0 ]]; then
    return 0
  fi
  return 1
}

run_agent_fix() {
  strip_key
  if [[ -z "${CURSOR_API_KEY}" ]]; then
    echo "CURSOR_API_KEY secret is missing" >&2
    echo "cli-error" > "${OUTCOME_FILE}"
    return 2
  fi
  local prompt
  prompt="$(cat .github/cursor-agent-autofix-prompt.md)"
  # --force: allow file edits (Stage 1 review used no --force).
  # --trust: non-interactive CI.
  agent -p --force --trust --output-format text "${prompt}" > agent-autofix.log 2>&1 || true
}

main() {
  export PATH="${HOME}/.local/bin:${PATH}"

  if run_checks; then
    echo "green-initial" > "${OUTCOME_FILE}"
    echo "Mechanical checks green; skipping Cursor CLI."
    exit 0
  fi

  local attempt=1
  while [[ "${attempt}" -le "${MAX_ATTEMPTS}" ]]; do
    echo "Autofix attempt ${attempt}/${MAX_ATTEMPTS}"
    if ! run_agent_fix; then
      if [[ "$(cat "${OUTCOME_FILE}" 2>/dev/null || true)" == "cli-error" ]]; then
        exit 1
      fi
    fi
    if run_checks; then
      echo "fixed:${attempt}" > "${OUTCOME_FILE}"
      echo "Mechanical checks green after attempt ${attempt}."
      exit 0
    fi
    attempt=$((attempt + 1))
  done

  echo "gave-up:${MAX_ATTEMPTS}" > "${OUTCOME_FILE}"
  echo "Still red after ${MAX_ATTEMPTS} autofix attempts."
  exit 1
}

main "$@"
