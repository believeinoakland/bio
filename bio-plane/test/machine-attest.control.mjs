/* REC-123 — THE NEGATIVE CONTROL FOR `machine-attest.test.mjs`, RE-RUNNABLE IN ONE STEP.
 *
 *   node test/machine-attest.control.mjs            # every arm, in order
 *   node test/machine-attest.control.mjs ratify     # one arm
 *
 * Run from `bio-plane/`. DELIBERATELY NOT A `.test.mjs`: it EDITS `src/index.mjs`
 * while it runs, and the battery must never discover it.
 *
 * EACH ARM IS ARMED ALONE, the others held open. Before arming, `src/index.mjs` is
 * copied to a UNIQUELY-NAMED per-arm pristine file inside this worktree's own temp
 * directory; after the suite runs it is copied BACK and the restore is verified by
 * sha256 AND by a full byte comparison, with the byte count printed and a minimum
 * guarded (an empty copy agreeing with an empty file is the e3b0c442… failure). NEVER
 * `git checkout --`, which restores to HEAD and has twice discarded a session's own
 * uncommitted work.
 *
 * EVERY ARM'S EDIT MUST MATCH EXACTLY ONCE, or the arm refuses to run: an arm that
 * did not arm is a finding, never a green.
 *
 * DECLARED BEFORE ARMING — which assertions MUST fail, by label; every other one
 * MUST pass. An arm whose failures differ from its declaration in EITHER direction
 * is reported as NOT AS DECLARED and the harness exits 1.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const TARGET = join(PLANE, "src", "index.mjs");
const SUITE = join(HERE, "machine-attest.test.mjs");
const MIN_BYTES = 500_000;          /* index.mjs is far larger; a restore below this is not a restore */
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* The guard exactly as it stands in the source, and the refusal it opens. */
const GUARD = "if (aiCred && isMachineIdentity(`${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`))";
const RATIFY_FENCE = `      ${GUARD}\n        return json({ ok: false, reason: "MACHINE_CANNOT_RATIFY", `;
const CASE_FENCE = `      ${GUARD}\n        return json({ ok: false, reason: "MACHINE_CANNOT_RATIFY_CASE", `;
const open = (fence) => fence.replace(GUARD, `if (false /* ARMED */)`);
const everyone = (fence) => fence.replace(GUARD, `if (true /* ARMED */)`);

const L = {
  ratRefused: "op=ratify by an `ai` credential carrying iris's VALID signature",
  ratNotPublished: "op=ratify: and the finding is NOT published",
  ratMember: "OVER-STRICTNESS, op=ratify:",
  caseRefused: "op=caseratify by an `ai` credential carrying iris's VALID signature",
  caseNotCommitted: "op=caseratify: and the case is NOT committed",
  caseMember: "OVER-STRICTNESS, op=caseratify:",
  table: "THE TABLE covers every DRIVEN op",
};

const ARMS = {
  baseline: { edits: [], mustFail: [] },
  /* (b) the op=ratify fence removed: the `ai` refusal BY NAME and the trace verdict
     fail; op=caseratify's stay green.
     CORRECTED 2026-09-18 by REC-125 (D-421, IC-137), never exempted: this arm
     declared a third failure — "the finding is NOT published" — and that was TRUE
     when REC-123 ran it (32/3), because the `ai` fence was then the only thing in
     front of the act. REC-125's fence directly below refuses EVERY caller that did
     not arrive through a signed-in session, and an `ai` credential is one, so with
     this fence removed the machine is now refused as OPERATOR_TOKEN_CANNOT_RATIFY
     and nothing is published. The read-back stays green because the act is
     DOUBLY fenced, and the arm still proves what it exists for: without C-32.12
     the machine is no longer refused BY ITS OWN NAME. Measured 33/2. */
  ratify: { edits: [[RATIFY_FENCE, open(RATIFY_FENCE)]],
            mustFail: [L.ratRefused, L.table] },
  /* (c) the op=caseratify fence removed: the same correction, the same reason —
     REC-125's session fence now holds the commit, so only the named refusal and the
     table fail. Measured 33/2. */
  caseratify: { edits: [[CASE_FENCE, open(CASE_FENCE)]],
                mustFail: [L.caseRefused, L.table] },
  /* (d) OVER-STRICTNESS: both fences refuse EVERY caller. Only the member arms can
     tell this from a fence holding — every machine refusal must STAY GREEN. */
  overstrict: { edits: [[RATIFY_FENCE, everyone(RATIFY_FENCE)], [CASE_FENCE, everyone(CASE_FENCE)]],
                mustFail: [L.ratMember, L.caseMember] },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.edits.map(([find, put]) => ({ arm, file: TARGET, find, put }))));
const count = (hay, needle) => hay.split(needle).length - 1;
const work = mkdtempSync(join(tmpdir(), "rec123-control-"));
const asked = process.argv[2];
const order = asked ? [asked] : Object.keys(ARMS);
if (asked && !ARMS[asked]) { console.log(`unknown arm '${asked}': ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let bad = 0;
const results = [];
for (const name of order) {
  const arm = ARMS[name];
  const original = readFileSync(TARGET);
  const pristine = join(work, `index.mjs.pristine-${name}-${process.pid}`);
  copyFileSync(TARGET, pristine);
  let src = original.toString("utf8"), armed = true;
  for (const [from, to] of arm.edits) {
    const n = count(src, from);
    if (n !== 1) { console.log(`  ARM ${name} DID NOT ARM: its anchor matched ${n} times (must be exactly 1)`); armed = false; break; }
    src = src.replace(from, to);
  }
  let out = "", failed = [], tally = null;
  try {
    if (armed) {
      if (arm.edits.length) writeFileSync(TARGET, src);
      const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8", maxBuffer: 64 << 20 });
      out = (r.stdout || "") + (r.stderr || "");
      failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
      const m = out.match(/machine-attest: (\d+) pass, (\d+) fail/);
      tally = m ? `${m[1]}/${m[2]}` : "-1 (the suite did not reach its foot)";
    }
  } finally {
    copyFileSync(pristine, TARGET);
    const back = readFileSync(TARGET);
    const same = back.length === original.length && back.equals(original) && sha(back) === sha(original);
    console.log(`  restore ${name}: ${back.length} B, sha256 ${sha(back).slice(0, 12)}…, `
      + `byte-identical ${same ? "YES" : "NO"}`);
    if (!same || back.length < MIN_BYTES) { console.log(`  RESTORE FAILED for ${name} — stop and repair by hand from ${pristine}`); process.exit(3); }
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
