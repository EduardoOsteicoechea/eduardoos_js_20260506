#!/usr/bin/env bash
# Shared EC2 post-rsync steps for Node systemd services (backend / documenter).
# Usage: ec2-node-service.sh <remote_app_dir> <systemd_unit> <port> <health_url> [legacy_unit]
set -euo pipefail

REMOTE_DIR="${1:?app dir}"
UNIT="${2:?systemd unit}"
PORT="${3:?port}"
HEALTH_URL="${4:?health url}"
LEGACY_UNIT="${5:-}"

DIST_ENTRY="$REMOTE_DIR/dist/server.js"

echo "==> $UNIT: stop before install"
sudo systemctl stop "$UNIT" 2>/dev/null || true

if [ -n "$LEGACY_UNIT" ] && systemctl cat "$LEGACY_UNIT" &>/dev/null; then
  echo "==> stop legacy unit $LEGACY_UNIT"
  sudo systemctl stop "$LEGACY_UNIT" 2>/dev/null || true
  sudo systemctl disable "$LEGACY_UNIT" 2>/dev/null || true
fi

if [ ! -f "$DIST_ENTRY" ]; then
  echo "ERROR: missing $DIST_ENTRY (build/rsync failed)"
  exit 1
fi

echo "==> npm ci in $REMOTE_DIR"
cd "$REMOTE_DIR"
npm ci --omit=dev

free_port() {
  local tries=0
  while ss -tln 2>/dev/null | grep -q ":${PORT} "; do
    tries=$((tries + 1))
    if [ "$tries" -eq 3 ]; then
      echo "==> port $PORT still in use; sending SIGTERM to listeners"
      sudo fuser -k "${PORT}/tcp" 2>/dev/null || true
      sleep 2
    fi
    if [ "$tries" -gt 12 ]; then
      echo "ERROR: port $PORT still in use"
      ss -tlnp | grep ":${PORT} " || true
      exit 1
    fi
    echo "==> port $PORT in use (attempt $tries), waiting..."
    sleep 1
  done
}

free_port

echo "==> start $UNIT"
sudo systemctl daemon-reload
sudo systemctl enable "$UNIT"
sudo systemctl restart "$UNIT"
sleep 2

if ! systemctl is-active --quiet "$UNIT"; then
  echo "ERROR: $UNIT is not active"
  journalctl -u "$UNIT" -n 40 --no-pager || true
  exit 1
fi

echo "==> health check $HEALTH_URL"
if ! curl -sf "$HEALTH_URL" >/dev/null; then
  echo "ERROR: health check failed for $HEALTH_URL"
  journalctl -u "$UNIT" -n 40 --no-pager || true
  exit 1
fi

echo "==> $UNIT deploy OK"
