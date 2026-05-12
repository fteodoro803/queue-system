#!/usr/bin/env bash
set -euo pipefail

# 1) Configure base URL and port (can be overridden via env vars).
BASE_URL="${SCREENSHOT_BASE_URL:-http://127.0.0.1:3000}"
METEOR_PORT="${SCREENSHOT_PORT:-3000}"

# 2) Ensure the background Meteor process is always stopped on exit.
cleanup() {
  if [[ -n "${METEOR_PID:-}" ]] && kill -0 "$METEOR_PID" 2>/dev/null; then
    kill "$METEOR_PID" || true
  fi
}

trap cleanup EXIT

# 3) Start Meteor in the background and save PID for cleanup.
meteor run --port "$METEOR_PORT" > /tmp/queue-system-screenshots.log 2>&1 &
METEOR_PID=$!

# 4) Wait for app readiness, then run desktop+mobile screenshot commands.
for _ in {1..120}; do
  if curl -fsS "$BASE_URL" > /dev/null; then
    npm run screenshots:all
    exit 0
  fi
  sleep 2
done

# 5) If startup times out, print logs for debugging and fail fast.
echo "Timed out waiting for app at $BASE_URL"
cat /tmp/queue-system-screenshots.log || true
exit 1


