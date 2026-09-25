/* REC-125 — THE NEGATIVE CONTROL FOR `operator-attest.test.mjs`, RE-RUNNABLE IN ONE STEP.
 *
 *   node test/operator-attest.control.mjs            # every arm, in order
 *   node test/operator-attest.control.mjs probe      # one arm
 *
 * Run from `bio-plane/`. DELIBERATELY NOT A `.test.mjs`: it EDITS `src/index.mjs`
 * while it runs, and the battery must never discover it. The harness shape is
 * REC-123's (`machine-attest.control.mjs`), kept rather than re-invented.
 *
 * ONE ARM PER REFUSED CREDENTIAL CLASS — the row's own terms: that class's fence
 * removed, its ratification is ACCEPTED, and the arm fails NAMING THE CLASS. Plus
 * the over-strictness arm and the liar the row names (refusing by token STRING).
 *
 * EACH ARM IS ARMED ALONE. Before arming, `src/index.mjs` is copied to a
 * UNIQUELY-NAMED per-arm pristine file in a private temp directory; after the
 * suite runs it is copied BACK and the restore is verified by sha256 AND a full
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
import { anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const TARGET = join(PLANE, "src", "index.mjs");
const SUITE = join(HERE, "operator-attest.test.mjs");
const MIN_BYTES = 500_000;          /* index.mjs is far larger; a restore below this is not a restore */
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* The guard exactly as it stands in the source, at each of the two regions. */
const GUARD = "if (!viaSession)";
const RATIFY_FENCE = `      ${GUARD}\n        return json({ ok: false, reason: "OPERATOR_TOKEN_CANNOT_RATIFY",`;
const CASE_FENCE = `      ${GUARD}\n        return json({ ok: false, reason: "OPERATOR_TOKEN_CANNOT_RATIFY_CASE",`;
const both = (to) => [[RATIFY_FENCE, RATIFY_FENCE.replace(GUARD, to)], [CASE_FENCE, CASE_FENCE.replace(GUARD, to)]];

const L = {
  fence: (op, cls) => `OPERATOR FENCE, op=${op}, the \`${cls}\` class`,
  caseNot: "op=caseratify: after every bearer class was driven, the case is still NOT ratified",
  ratNot: "op=ratify: after every bearer class was driven, the finding is NOT published",
  caseMember: "OVER-STRICTNESS, op=caseratify:",
  ratMember: "OVER-STRICTNESS, op=ratify:",
  structure: "STRUCTURE, op=",
  table: "THE TABLE:",
};
/* One class exempted from BOTH fences: the class's two refusals fail, the two
   "nothing landed" read-backs fail because it DID land, and the table names it.
   The member's own session is still accepted afterwards (a ratification of bytes
   already ratified converges), so the over-strictness arms stay green. */
/* BREAK ONLY THE THING: the class is spelled as single characters joined at run
   time, so the arm puts no class LITERAL into the region and the structural pin
   is NOT perturbed — what fails is the DRIVE, which is the variable under test. */
const spelled = (cls) => `[${[...cls].map((c) => JSON.stringify(c)).join(", ")}].join("")`;
const classArm = (cls) => ({
  edits: both(`if (!viaSession && cls !== ${spelled(cls)} /* ARMED */)`),
  mustFail: [L.fence("caseratify", cls), L.fence("ratify", cls), L.caseNot, L.ratNot, L.table],
});

const ARMS = {
  baseline: { edits: [], mustFail: [] },
  admin: classArm("admin"),
  member: classArm("member"),
  probe: classArm("probe"),
  /* OVER-STRICTNESS: both fences refuse EVERY caller, the member's session too.
     Only the member arms can tell this from a fence holding. */
  overstrict: { edits: both("if (true /* ARMED */)"), mustFail: [L.caseMember, L.ratMember, `${L.structure}caseratify`, `${L.structure}ratify`] },
  /* THE LIAR: refuse by token STRING, naming two bindings. The probe class walks
     straight through at both acts, and the structural pin sees the binding. */
  tokenstring: {
    edits: both(`if ([env.ADMIN_TOKEN, env.MEMBER_TOKEN].includes(url.searchParams.get("token")) /* ARMED */)`),
    mustFail: [L.fence("caseratify", "probe"), L.fence("ratify", "probe"), L.caseNot, L.ratNot, L.table,
               `${L.structure}caseratify`, `${L.structure}ratify`],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.edits.map(([find, put]) => ({ arm, file: TARGET, find, put }))));

const count = (hay, needle) => hay.split(needle).length - 1;
const work = mkdtempSync(join(tmpdir(), "rec125-control-"));
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
      const m = out.match(/operator-attest: (\d+) pass, (\d+) fail/);
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
