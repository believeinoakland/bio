#!/bin/bash
# SessionStart hook — cloud Claude Code only (CLAUDE_CODE_REMOTE=true); a no-op on a Mac.
#
# Why (BOB #28, 2026-09-22, NEW-MACHINE.md §0, each MEASURED in the first cloud session):
# a cloud session starts from a fresh container that differs from the Mac this project was built on in
# four ways, and each broke an instrument before it was fixed by hand:
#   1. node is v22; the project uses 26. `tools/owed.mjs` uses inline regex modifiers `(?i:…)`, which
#      node 22 rejects, so `plancheck` crashed before it could judge anything.
#   2. the clone is SHALLOW (50 commits); every check that reads a file's last change from git read the
#      boundary commit's date, and plancheck reported 29 false front-matter FAILs.
#   3. no `node_modules` in the four packages that carry dependencies.
#   4. no stock `ssh-keygen`, the acceptance authority for every release signature (DIST).
# Also exported: NODE_USE_ENV_PROXY=1, without which node's built-in fetch ignores the egress proxy.
#
# Idempotent and non-interactive. Nothing here reads, prints or writes a secret, and nothing here
# changes a tracked file: `npm ci` honours each lockfile exactly.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

NODE_VERSION="v26.10.0"
NODE_HOME="/opt/node26"
REPO="${CLAUDE_PROJECT_DIR:-$(pwd)}"
say() { echo "session-start: $*" >&2; }

# 1 · node 26 ---------------------------------------------------------------------------------
if [ ! -x "$NODE_HOME/bin/node" ]; then
  say "installing node $NODE_VERSION into $NODE_HOME"
  tmp="$(mktemp -d)"
  if curl -fsSL --max-time 300 "https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.xz" -o "$tmp/node.tar.xz" \
     && mkdir -p "$NODE_HOME" \
     && tar -xJf "$tmp/node.tar.xz" -C "$NODE_HOME" --strip-components=1; then
    say "node $("$NODE_HOME/bin/node" -v) installed"
  else
    say "FAILED to install node $NODE_VERSION — instruments needing node 26 will fail"
  fi
fi
if [ -x "$NODE_HOME/bin/node" ]; then
  export PATH="$NODE_HOME/bin:$PATH"
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "export PATH=\"$NODE_HOME/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
  fi
fi
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export NODE_USE_ENV_PROXY=1' >> "$CLAUDE_ENV_FILE"
fi

# 2 · full history ----------------------------------------------------------------------------
if [ "$(git -C "$REPO" rev-parse --is-shallow-repository 2>/dev/null)" = "true" ]; then
  say "unshallowing the clone"
  git -C "$REPO" fetch --quiet --unshallow origin || say "FAILED to unshallow — git-history checks will misread dates"
fi

# 3 · dependencies ----------------------------------------------------------------------------
for pkg in bio-plane pdf-worker ocr-worker newgroup; do
  dir="$REPO/$pkg"
  [ -f "$dir/package-lock.json" ] || continue
  # Skip when an install exists and is newer than the lockfile; npm ci otherwise (it refuses drift).
  if [ -d "$dir/node_modules" ] && [ ! -L "$dir/node_modules" ] \
     && [ -f "$dir/node_modules/.package-lock.json" ] \
     && [ "$dir/node_modules/.package-lock.json" -nt "$dir/package-lock.json" ]; then
    continue
  fi
  say "npm ci in $pkg"
  (cd "$dir" && npm ci --no-audit --no-fund --loglevel=error >/dev/null) || say "FAILED: npm ci in $pkg"
done

# 4 · ssh-keygen ------------------------------------------------------------------------------
if ! command -v ssh-keygen >/dev/null 2>&1; then
  say "installing openssh-client (ssh-keygen)"
  { apt-get update -qq && apt-get install -y -qq --no-install-recommends openssh-client; } >/dev/null 2>&1 \
    || say "FAILED to install ssh-keygen"
fi

say "ready — node $(node -v 2>/dev/null), shallow=$(git -C "$REPO" rev-parse --is-shallow-repository 2>/dev/null), ssh-keygen $(command -v ssh-keygen >/dev/null && echo present || echo ABSENT)"
exit 0
