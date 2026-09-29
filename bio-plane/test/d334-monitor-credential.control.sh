#!/bin/bash
# D-334 negative controls. Each arm ALONE, others held open.
# Restore verified by sha256 AND cmp against a UNIQUELY-NAMED per-arm pristine copy.
set -u
cd "$(dirname "$0")/.." || exit 9
# RE-ANCHORED 2026-09-28 (T8, legacy-tests; MONITORING #1 J3 item 1, N63): the credential selection left the store's
# `#monitorToken()` for `runtime-limits.unattendedCredential(env)`, served by `src/tokens.mjs` (R26).
# RE-ANCHORED 2026-09-29 (T11, legacy-tests; K372 (b), N222; monitoring R23, R45, R24 retired): monitoring spends no
# credential, so patching `token()` bit nothing. Arms 1 and 2 now RE-INTRODUCE a credential condition into
# monitoring's two fires (`src/monitoring/index.mjs`, `$STORE`, the variable kept so the helpers are unchanged): the
# regression K372 retired. Arm 3 still patches `src/index.mjs`'s selftest.
STORE=src/monitoring/index.mjs
SUITE=test/d334-monitor-credential.test.mjs

arm_setup() {  # $1 = arm name
  PRISTINE="${TMPDIR:-/tmp}/d334-pristine-$1.mjs"
  cp "$STORE" "$PRISTINE" || exit 9
  BYTES=$(wc -c < "$PRISTINE")
  if [ "$BYTES" -lt 8000 ]; then echo "ABORT arm $1: pristine copy only $BYTES bytes"; exit 9; fi
  SHA_BEFORE=$(shasum -a 256 < "$PRISTINE" | cut -d' ' -f1)
  echo "=== ARM $1 === pristine $PRISTINE  bytes=$BYTES  sha256=$SHA_BEFORE"
}
arm_restore() {  # $1 = arm name
  cp "$PRISTINE" "$STORE"
  SHA_AFTER=$(shasum -a 256 < "$STORE" | cut -d' ' -f1)
  if cmp -s "$PRISTINE" "$STORE"; then CMP=IDENTICAL; else CMP=DIFFERS; fi
  echo "ARM $1 restore: sha256 $SHA_AFTER  match=$([ "$SHA_AFTER" = "$SHA_BEFORE" ] && echo YES || echo NO)  cmp=$CMP  bytes=$(wc -c < $STORE)"
}
# Arms 1 and 2 add the import and one guard at the head of each fire's `try`; $1 is the guard's condition.
arm_condition() {
  COND="$1" perl -0pi -e 's{(import \{ combine \} from "\.\./\.\./\.\./jurisdictions/index\.mjs";\n)}{$1import \{ unattendedCredential \} from "../tokens.mjs";\n};
    s{(  async #fire(?:MonitorTick\(bundleId\)|ArchiveFallback\(address\)) \{\n    try \{\n)}{$1      if \(!\($ENV{COND}\)\) return \{ ok: false, reason: "no LIVE monitoring credential" \};\n}g' "$STORE"
}
run_arm() {  # $1 = arm name
  if cmp -s "$PRISTINE" "$STORE"; then echo "ARM $1 DID NOT ARM (patch matched zero times) — THIS IS A FINDING"; else echo "ARM $1 armed (file differs from pristine; $(grep -c 'no LIVE monitoring credential' "$STORE") guard(s))"; fi
  node "$SUITE" > "${TMPDIR:-/tmp}/d334-arm$1.log" 2>&1
  echo "ARM $1 suite exit=$?"
  tail -2 "${TMPDIR:-/tmp}/d334-arm$1.log"
  echo "--- ARM $1 failures ---"
  grep '  FAIL' "${TMPDIR:-/tmp}/d334-arm$1.log"
}

# ---------------------------------------------------------------------------
# ARM 1 — THE REGRESSION K372 RETIRED, in its D-334-correct form: each fire
# spends only a LIVE credential and refuses without one. DECLARED: arm D (both
# dead) and arm F (none bound) MUST FAIL, with the structural pins on
# monitoring (no credential read, fires in process); arms A, B, C MUST NOT (a
# live credential is bound there, and the report is independent).
# ---------------------------------------------------------------------------
arm_setup 1
arm_condition 'await unattendedCredential(this.env).token()'
run_arm 1
arm_restore 1
node "$SUITE" > "${TMPDIR:-/tmp}/d334-arm1-after.log" 2>&1; echo "ARM 1 post-restore suite exit=$?"; tail -1 "${TMPDIR:-/tmp}/d334-arm1-after.log"

# ---------------------------------------------------------------------------
# ARM 2 — R24's OWN SHAPE: monitoring conditioned on a credential being BOUND
# (presence, not liveness). DECLARED: arm F (nothing bound) MUST FAIL with the
# structural pins; arm D MUST NOT (two dead values are still present), which is
# what makes arm F discriminating rather than a copy of arm D. A, B, C MUST NOT.
# (The old arm 2, over-strictness of the daemon-first choice, left with R24.)
# ---------------------------------------------------------------------------
arm_setup 2
arm_condition 'unattendedCredential(this.env).bound'
run_arm 2
arm_restore 2
node "$SUITE" > "${TMPDIR:-/tmp}/d334-arm2-after.log" 2>&1; echo "ARM 2 post-restore suite exit=$?"; tail -1 "${TMPDIR:-/tmp}/d334-arm2-after.log"

# ---------------------------------------------------------------------------
# ARM 3 — THE HONESTY ARM. Heal the SYMPTOM into silence: make the selection
# skip a dead DAEMON_TOKEN *and* make the plane stop reporting it, by having
# selftest report a bound-but-dead daemon binding as "not configured" (the
# D-106 class, and the shape a well-meaning "tidy the report" change takes).
# DECLARED: arm B MUST FAIL — selftest no longer says `false`, fleet-posture
# reads admin-fallback instead of daemon-revoked, brokenCount drops to 0.
# Arms A, C, D and F MUST NOT fail: monitoring still runs, which is exactly why
# silent healing is dangerous rather than obvious.
# ---------------------------------------------------------------------------
INDEX=src/index.mjs
PRISTINE_I="${TMPDIR:-/tmp}/d334-pristine-3-index.mjs"
cp "$INDEX" "$PRISTINE_I" || exit 9
BYTES_I=$(wc -c < "$PRISTINE_I")
if [ "$BYTES_I" -lt 100000 ]; then echo "ABORT arm 3: index pristine only $BYTES_I bytes"; exit 9; fi
SHA_I_BEFORE=$(shasum -a 256 < "$PRISTINE_I" | cut -d' ' -f1)
echo "=== ARM 3 === pristine $PRISTINE_I  bytes=$BYTES_I  sha256=$SHA_I_BEFORE"
perl -0pi -e 's{          DAEMON_TOKEN: \(typeof env\.DAEMON_TOKEN === "string" && env\.DAEMON_TOKEN\.length > 0\)\n            \? await liveToken\(env\.DAEMON_TOKEN\)\n            : "not configured",}{          DAEMON_TOKEN: \(typeof env.DAEMON_TOKEN === "string" && env.DAEMON_TOKEN.length > 0\n                         && await liveToken\(env.DAEMON_TOKEN\)\)\n            ? true\n            : "not configured",}s' "$INDEX"
if cmp -s "$PRISTINE_I" "$INDEX"; then echo "ARM 3 DID NOT ARM (patch matched zero times) — THIS IS A FINDING"; else echo "ARM 3 armed (file differs from pristine)"; fi
node "$SUITE" > "${TMPDIR:-/tmp}/d334-arm3.log" 2>&1
echo "ARM 3 suite exit=$?"
tail -2 "${TMPDIR:-/tmp}/d334-arm3.log"
echo "--- ARM 3 failures ---"
grep '  FAIL' "${TMPDIR:-/tmp}/d334-arm3.log"
cp "$PRISTINE_I" "$INDEX"
SHA_I_AFTER=$(shasum -a 256 < "$INDEX" | cut -d' ' -f1)
if cmp -s "$PRISTINE_I" "$INDEX"; then CMP_I=IDENTICAL; else CMP_I=DIFFERS; fi
echo "ARM 3 restore: sha256 $SHA_I_AFTER  match=$([ "$SHA_I_AFTER" = "$SHA_I_BEFORE" ] && echo YES || echo NO)  cmp=$CMP_I  bytes=$(wc -c < $INDEX)"
node "$SUITE" > "${TMPDIR:-/tmp}/d334-arm3-after.log" 2>&1; echo "ARM 3 post-restore suite exit=$?"; tail -1 "${TMPDIR:-/tmp}/d334-arm3-after.log"

echo "=== ALL ARMS DONE ==="
shasum -a 256 "$STORE" "$INDEX"
