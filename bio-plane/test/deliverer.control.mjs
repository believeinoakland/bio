/* REC-128 — THE NEGATIVE CONTROL FOR `deliverer.test.mjs`, RE-RUNNABLE IN ONE STEP.
 *
 *   node test/deliverer.control.mjs            # every arm, in order
 *   node test/deliverer.control.mjs fromsig    # one arm
 *
 * Run from `bio-plane/`. DELIBERATELY NOT A `.test.mjs`: it EDITS `src/index.mjs`
 * or `src/store.mjs` while it runs, and the battery must never discover it. The
 * harness shape is REC-125's (`operator-attest.control.mjs`), kept rather than
 * re-invented, widened only so an arm may name WHICH source it edits.
 *
 * EACH ARM IS ARMED ALONE. Before arming, every file the arm edits is copied to
 * a UNIQUELY-NAMED per-arm pristine file in a private temp directory; after the
 * suite runs each is copied BACK and the restore is verified by sha256 AND a full
 * byte comparison, with the byte count printed and a minimum guarded. NEVER
 * `git checkout --`, which restores to HEAD and has twice discarded a session's
 * own uncommitted work.
 *
 * EVERY ARM'S EDIT MUST MATCH EXACTLY ONCE, or the arm refuses to run: an arm
 * that did not arm is a finding, never a green.
 *
 * DECLARED BEFORE ARMING — which assertions MUST fail, by label prefix; every
 * other one MUST pass. An arm whose failures differ from its declaration in
 * EITHER direction is reported NOT AS DECLARED and the harness exits 1.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const FILES = { index: join(PLANE, "src", "index.mjs"), store: join(PLANE, "src", "store.mjs") };
const SUITE = join(HERE, "deliverer.test.mjs");
const MIN_BYTES = 500_000;          /* both sources are far larger; a restore below this is not a restore */
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* The two lines where each act takes its deliverer, exactly as they stand. */
const AT_CASE = "const deliveredBy = deliveringPrincipal(sessRights); /* REC-128: op=caseratify */";
const AT_RATIFY = "const deliveredBy = deliveringPrincipal(sessRights); /* REC-128: op=ratify */";
const bothActs = (expr) => [
  ["index", AT_CASE, AT_CASE.replace("deliveringPrincipal(sessRights)", `${expr} /* ARMED */`)],
  ["index", AT_RATIFY, AT_RATIFY.replace("deliveringPrincipal(sessRights)", `${expr} /* ARMED */`)],
];
/* The store's one read chokepoint, exactly as it stands. */
const READ = "  #deliveredBy(row) { return delivererOf(row ? row.delivered_by : null); }";

const L = {
  structActs: "STRUCTURE: both acts take the deliverer from the session row",
  caseAnswer: "DELIVERED, op=caseratify's answer",
  caseDoc: "DELIVERED, op=casedocument read back",
  ratAnswer: "DELIVERED, op=ratify's answer: iris signed and GUS",
  list: "DELIVERED, op=publishedlist: the finding names",
  editions: "DELIVERED, op=publishededitions",
  pubcase: "DELIVERED, op=publishedcase:",
  container: "DELIVERED, THE CONTAINER",
  looseAnswer: "DELIVERED, op=ratify's answer for a loose bundle",
  looseReads: "DELIVERED, op=publishedlist and op=publishedcase (the loose edition)",
  legacyRow: "LEGACY, a finding row",
  legacyCase: "LEGACY, a case document",
  table: "THE TABLE:",
  founderRead: "STANDING, the FOUNDER's session reads",
  containerDone: "THE CONTAINER: the edition completed",
  containerWords: "THE CONTAINER says",
  veraRead: "STANDING, a member of NO project (vera) is answered",
  veraDeliver: "STANDING, a member of NO project cannot deliver",
};
/* The founder's resolution, exactly as it stands. RE-POINTED 2026-09-18 by REC-132: `sessionCaseViewer`
   became `resolveSession` (the ONE resolver of a session, D-422/IC-149), whose VISIBILITY half is this one
   line. Both arms below arm the same variable they armed before — the founder's viewer, then every
   session's — at its new spelling; the old anchor no longer exists and an arm on it would not arm. */
const VIEWER_LINE = '    viewer: r === "admin" ? "admin" : `member:${member}`,   /* the founder — Store.ROOT_ADMIN, an administrator (7.3) */';

const ARMS = {
  baseline: { edits: [], mustFail: [] },
  /* THE LIAR THE ROW NAMES: the deliverer taken from the SIGNATURE. Every
     delivery in the fixture is by somebody other than the signer, so every
     DELIVERED arm fails and the table names every determined row. */
  fromsig: {
    edits: bothActs("(attestor ? `member:${attestor.member_id}` : null)"),
    mustFail: [L.structActs, L.caseAnswer, L.caseDoc, L.ratAnswer, L.list, L.editions, L.pubcase, L.container,
               L.looseAnswer, L.looseReads, L.table],
  },
  /* THE LEGACY LIAR: a NULL deliverer back-filled from the signer at the read.
     DECLARATION CORRECTED after its first run, and the correction is the
     instrument's, not the subject's: it was declared as the two LEGACY arms
     alone, and THE TABLE failed too — rightly, because a back-filled legacy row
     reads `member:iris` beside signer iris, which is exactly the equality the
     table exists to catch. The first declaration forgot the table reads the
     legacy row as well as the new ones. */
  backfill: {
    edits: [["store", READ,
      "  #deliveredBy(row) { return delivererOf(row ? (row.delivered_by ?? (row.attestor_member ? `member:${row.attestor_member}` : null)) : null); } /* ARMED */"]],
    mustFail: [L.legacyRow, L.legacyCase, L.table],
  },
  /* FROM THE SESSION, BUT THE WRONG FIELD OF IT: `sessMember` folds the
     founder's `admin` role into a bare string, so the founder's deliveries read
     `member:admin` while gus's stay right. Only the founder arms can tell this
     from the session row. */
  "session-member": {
    edits: bothActs("`member:${sessMember}`"),
    mustFail: [L.structActs, L.caseAnswer, L.caseDoc, L.pubcase, L.container, L.looseAnswer, L.looseReads],
  },
  /* REC-128's merge onto REC-130 — THE FOUNDER'S STANDING REVERTED, and ONLY
     that: `sessionCaseViewer` loses its founder line, so a founder session folds
     to `member:admin` again exactly as both case reads spelled it before the fix.
     DECLARED BEFORE ARMING: the founder cannot read the unsigned bio case
     (founderRead), cannot deliver iris's case signature (caseAnswer), so the case
     document stays unratified (caseDoc), the public case read and the container
     never complete (pubcase, container, containerDone, containerWords). vera's two
     STANDING arms STAY GREEN — she never had standing — and so do the loose
     founder delivery (op=ratify asks no case standing) and gus's. */
  "founder-standing": {
    edits: [["index", VIEWER_LINE, "    viewer: `member:${member}`, /* ARMED: founder resolution removed */"]],
    mustFail: [L.founderRead, L.caseAnswer, L.caseDoc, L.pubcase, L.container, L.containerDone, L.containerWords],
  },
  /* THE OVER-BROAD FIX, the failure in the other direction: every session is
     resolved to the root-administrator viewer, so standing is everybody's. The
     founder arms STAY GREEN (a fix that is too wide passes every assertion about
     the founder), and ONLY vera's two STANDING arms can tell it from the right
     fix. DECLARATION CORRECTED after its first run (15/5, NOT AS DECLARED), and
     the correction is the instrument's, not the subject's: it was declared as
     vera's two arms alone, but under this arm vera's delivery SUCCEEDS — she
     carries iris's valid signature in before the founder does — so the case
     document is ratified with VERA as deliverer, and the three reads that expect
     the FOUNDER as the case's deliverer (caseDoc, pubcase, container) fail too,
     rightly. The founder's own answer (caseAnswer) stays green, and that is
     REC-128's design rather than a gap: ed25519 SSHSIG is deterministic, so the
     founder's retry carries the SAME signature, the store answers `existed: true`
     and writes nothing, and the answer's `deliveredBy` names who delivered THIS
     request (its comment at op=caseratify's answer) while the RECORD names vera. */
  "everyone-admin": {
    edits: [["index", VIEWER_LINE, "    viewer: \"admin\", /* ARMED */"]],
    mustFail: [L.veraRead, L.veraDeliver, L.caseDoc, L.pubcase, L.container],
  },
};

const count = (hay, needle) => hay.split(needle).length - 1;
const work = mkdtempSync(join(tmpdir(), "rec128-control-"));
const asked = process.argv[2];
const order = asked ? [asked] : Object.keys(ARMS);
if (asked && !ARMS[asked]) { console.log(`unknown arm '${asked}': ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let bad = 0;
const results = [];
for (const name of order) {
  const arm = ARMS[name];
  const touched = [...new Set(arm.edits.map(([f]) => f))];
  const originals = Object.fromEntries(touched.map((f) => [f, readFileSync(FILES[f])]));
  const pristine = Object.fromEntries(touched.map((f) => [f, join(work, `${f}.mjs.pristine-${name}-${process.pid}`)]));
  for (const f of touched) copyFileSync(FILES[f], pristine[f]);
  const srcs = Object.fromEntries(touched.map((f) => [f, originals[f].toString("utf8")]));
  let armed = true;
  for (const [f, from, to] of arm.edits) {
    const n = count(srcs[f], from);
    if (n !== 1) { console.log(`  ARM ${name} DID NOT ARM: its anchor in ${f} matched ${n} times (must be exactly 1)`); armed = false; break; }
    srcs[f] = srcs[f].replace(from, to);
  }
  let out = "", failed = [], tally = null;
  try {
    if (armed) {
      for (const f of touched) writeFileSync(FILES[f], srcs[f]);
      const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8", maxBuffer: 64 << 20 });
      out = (r.stdout || "") + (r.stderr || "");
      failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
      const m = out.match(/deliverer: (\d+) pass, (\d+) fail/);
      tally = m ? `${m[1]}/${m[2]}` : "-1 (the suite did not reach its foot)";
    }
  } finally {
    for (const f of touched) {
      copyFileSync(pristine[f], FILES[f]);
      const back = readFileSync(FILES[f]);
      const same = back.length === originals[f].length && back.equals(originals[f]) && sha(back) === sha(originals[f]);
      console.log(`  restore ${name} ${f}: ${back.length} B, sha256 ${sha(back).slice(0, 12)}…, `
        + `byte-identical ${same ? "YES" : "NO"}`);
      if (!same || back.length < MIN_BYTES) { console.log(`  RESTORE FAILED for ${name} ${f} — stop and repair by hand from ${pristine[f]}`); process.exit(3); }
    }
  }
  if (!armed) { bad++; results.push(`${name}: DID NOT ARM`); continue; }
  const missing = arm.mustFail.filter((l) => !failed.some((f) => f.startsWith(l)));
  const extra = failed.filter((f) => !arm.mustFail.some((l) => f.startsWith(l)));
  const asDeclared = missing.length === 0 && extra.length === 0 && tally && !tally.startsWith("-1");
  if (!asDeclared) bad++;
  results.push(`${name}: ${tally} — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  console.log(`\n=== arm ${name}: ${tally} (pass/fail) — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  for (const f of failed) console.log(`     failed: ${f.slice(0, 150)}`);
  for (const m of missing) console.log(`     DECLARED TO FAIL AND DID NOT: ${m}`);
  for (const e of extra) console.log(`     FAILED AND WAS NOT DECLARED: ${e.slice(0, 150)}`);
}
rmSync(work, { recursive: true, force: true });
console.log(`\nRESULTS: ${results.join(" · ")}`);
process.exit(bad ? 1 : 0);
