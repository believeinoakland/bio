#!/bin/zsh
# D-334 negative controls. Each arm ALONE, others held open.
# Restore verified by sha256 AND cmp against a UNIQUELY-NAMED per-arm pristine copy.
set -u
cd "$(dirname "$0")/.." || exit 9
STORE=src/store.mjs
SUITE=test/d334-monitor-credential.test.mjs

arm_setup() {  # $1 = arm name
  PRISTINE="/tmp/d334-pristine-$1.mjs"
  cp "$STORE" "$PRISTINE" || exit 9
  BYTES=$(wc -c < "$PRISTINE")
  if [ "$BYTES" -lt 500000 ]; then echo "ABORT arm $1: pristine copy only $BYTES bytes"; exit 9; fi
  SHA_BEFORE=$(shasum -a 256 < "$PRISTINE" | cut -d' ' -f1)
  echo "=== ARM $1 === pristine $PRISTINE  bytes=$BYTES  sha256=$SHA_BEFORE"
}
arm_restore() {  # $1 = arm name
  cp "$PRISTINE" "$STORE"
  SHA_AFTER=$(shasum -a 256 < "$STORE" | cut -d' ' -f1)
  if cmp -s "$PRISTINE" "$STORE"; then CMP=IDENTICAL; else CMP=DIFFERS; fi
  echo "ARM $1 restore: sha256 $SHA_AFTER  match=$([ "$SHA_AFTER" = "$SHA_BEFORE" ] && echo YES || echo NO)  cmp=$CMP  bytes=$(wc -c < $STORE)"
}

# ---------------------------------------------------------------------------
# ARM 1 — THE ARM THIS ITEM EXISTS FOR. Restore presence-only selection.
# DECLARED: the suite MUST FAIL on the RUNS arms (arm A's fired/failed, arm D's
# named refusal). The NAMED arms (B) MUST NOT fail — selftest/posture/livefire
# report the same dead credential whether or not selection is healed; that is the
# honesty half and it is independent of the defect.
# DECLARED: arm C MUST NOT fail either (a live daemon is selected either way).
# ---------------------------------------------------------------------------
arm_setup 1
perl -0pi -e 's{  async \#monitorToken\(\) \{\n    const env = this\.env;\n    if \(!env\) return null;\n    if \(typeof env\.DAEMON_TOKEN === "string" && env\.DAEMON_TOKEN\.length > 0\n        && await liveToken\(env\.DAEMON_TOKEN\)\) return env\.DAEMON_TOKEN;\n    if \(typeof env\.ADMIN_TOKEN === "string" && env\.ADMIN_TOKEN\.length > 0\n        && await liveToken\(env\.ADMIN_TOKEN\)\) return env\.ADMIN_TOKEN;\n    return null;\n  \}}{  async \#monitorToken\(\) \{\n    return \(this.env && \(this.env.DAEMON_TOKEN \|\| this.env.ADMIN_TOKEN\)\) \|\| null;\n  \}}s' "$STORE"
if cmp -s "$PRISTINE" "$STORE"; then echo "ARM 1 DID NOT ARM (patch matched zero times) — THIS IS A FINDING"; else echo "ARM 1 armed (file differs from pristine)"; fi
node "$SUITE" > /tmp/d334-arm1.log 2>&1
echo "ARM 1 suite exit=$?"
tail -2 /tmp/d334-arm1.log
echo "--- ARM 1 failures ---"
grep '  FAIL' /tmp/d334-arm1.log
arm_restore 1
node "$SUITE" > /tmp/d334-arm1-after.log 2>&1; echo "ARM 1 post-restore suite exit=$?"; tail -1 /tmp/d334-arm1-after.log

# ---------------------------------------------------------------------------
# ARM 2 — OVER-STRICTNESS, in the direction that costs a working instance its
# monitoring: make selection REFUSE a live DAEMON_TOKEN and always take the
# fallback. DECLARED: arm C MUST FAIL (the live daemon is no longer preferred and
# its dead fallback cannot carry the tick). Arms A, B and D MUST NOT fail — the
# reported half is untouched and arm A's fallback still works.
# ---------------------------------------------------------------------------
arm_setup 2
perl -0pi -e 's{    if \(typeof env\.DAEMON_TOKEN === "string" && env\.DAEMON_TOKEN\.length > 0\n        && await liveToken\(env\.DAEMON_TOKEN\)\) return env\.DAEMON_TOKEN;\n}{}s' "$STORE"
if cmp -s "$PRISTINE" "$STORE"; then echo "ARM 2 DID NOT ARM (patch matched zero times) — THIS IS A FINDING"; else echo "ARM 2 armed (file differs from pristine)"; fi
node "$SUITE" > /tmp/d334-arm2.log 2>&1
echo "ARM 2 suite exit=$?"
tail -2 /tmp/d334-arm2.log
echo "--- ARM 2 failures ---"
grep '  FAIL' /tmp/d334-arm2.log
arm_restore 2
node "$SUITE" > /tmp/d334-arm2-after.log 2>&1; echo "ARM 2 post-restore suite exit=$?"; tail -1 /tmp/d334-arm2-after.log

# ---------------------------------------------------------------------------
# ARM 3 — THE HONESTY ARM. Heal the SYMPTOM into silence: make the selection
# skip a dead DAEMON_TOKEN *and* make the plane stop reporting it, by having
# selftest report a bound-but-dead daemon binding as "not configured" (the
# D-106 class, and the shape a well-meaning "tidy the report" change takes).
# DECLARED: arm B MUST FAIL — selftest no longer says `false`, fleet-posture
# reads admin-fallback instead of daemon-revoked, brokenCount drops to 0.
# Arms A, C and D MUST NOT fail: monitoring still runs, which is exactly why
# silent healing is dangerous rather than obvious.
# ---------------------------------------------------------------------------
INDEX=src/index.mjs
PRISTINE_I=/tmp/d334-pristine-3-index.mjs
cp "$INDEX" "$PRISTINE_I" || exit 9
BYTES_I=$(wc -c < "$PRISTINE_I")
if [ "$BYTES_I" -lt 100000 ]; then echo "ABORT arm 3: index pristine only $BYTES_I bytes"; exit 9; fi
SHA_I_BEFORE=$(shasum -a 256 < "$PRISTINE_I" | cut -d' ' -f1)
echo "=== ARM 3 === pristine $PRISTINE_I  bytes=$BYTES_I  sha256=$SHA_I_BEFORE"
perl -0pi -e 's{          DAEMON_TOKEN: \(typeof env\.DAEMON_TOKEN === "string" && env\.DAEMON_TOKEN\.length > 0\)\n            \? await liveToken\(env\.DAEMON_TOKEN\)\n            : "not configured",}{          DAEMON_TOKEN: \(typeof env.DAEMON_TOKEN === "string" && env.DAEMON_TOKEN.length > 0\n                         && await liveToken\(env.DAEMON_TOKEN\)\)\n            ? true\n            : "not configured",}s' "$INDEX"
if cmp -s "$PRISTINE_I" "$INDEX"; then echo "ARM 3 DID NOT ARM (patch matched zero times) — THIS IS A FINDING"; else echo "ARM 3 armed (file differs from pristine)"; fi
node "$SUITE" > /tmp/d334-arm3.log 2>&1
echo "ARM 3 suite exit=$?"
tail -2 /tmp/d334-arm3.log
echo "--- ARM 3 failures ---"
grep '  FAIL' /tmp/d334-arm3.log
cp "$PRISTINE_I" "$INDEX"
SHA_I_AFTER=$(shasum -a 256 < "$INDEX" | cut -d' ' -f1)
if cmp -s "$PRISTINE_I" "$INDEX"; then CMP_I=IDENTICAL; else CMP_I=DIFFERS; fi
echo "ARM 3 restore: sha256 $SHA_I_AFTER  match=$([ "$SHA_I_AFTER" = "$SHA_I_BEFORE" ] && echo YES || echo NO)  cmp=$CMP_I  bytes=$(wc -c < $INDEX)"
node "$SUITE" > /tmp/d334-arm3-after.log 2>&1; echo "ARM 3 post-restore suite exit=$?"; tail -1 /tmp/d334-arm3-after.log

echo "=== ALL ARMS DONE ==="
shasum -a 256 "$STORE" "$INDEX"
