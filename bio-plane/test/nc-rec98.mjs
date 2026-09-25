#!/usr/bin/env node
/* REC-98 / D-283 — THE NEGATIVE CONTROL for the WIRE.
 *
 * NOT a suite (`battery.mjs` and `coverage.mjs` do not discover `nc-*.mjs`): it
 * EDITS `src/index.mjs` on disk, one arm at a time, and restores it. Run it
 * directly:  node bio-plane/test/nc-rec98.mjs
 *
 * CPDF-20's `nc-cpdf20.mjs` controls the RULE. This controls the two CALL SITES,
 * which is a different subject with a different failure mode: a rule can be
 * perfectly correct and reach nothing, and CPDF-20 proved exactly that by
 * rebuilding the bundle and finding it byte-identical.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DECLARED BEFORE ARMING — what MUST fail, what MUST NOT, and why each exists
 * ─────────────────────────────────────────────────────────────────────────────
 *   BASELINE  the suite, untouched.                                MUST PASS
 *             Without this row, eight-arms-broken and eight-arms-working produce
 *             the identical report. A harness in this estate once read `null` for
 *             every arm INCLUDING the baseline and only the baseline row told
 *             anyone which it was.
 *
 *   A1  CALL SITE 1 REMOVED — `op=pdfstructure` restored to returning the
 *       member's whole answer, which is what it did before this item.
 *                                                                  MUST FAIL
 *       THE BRIEF'S OWN ARM: one call site removed, and a mixed-tier document
 *       records ONE tier for the whole document. It must fail on the per-page
 *       tier assertions BY NAME.
 *
 *   A2  CALL SITE 2 REMOVED — the acquire assembly restored to the wholesale
 *       `i2text = t2.text`.                                         MUST FAIL
 *       The other half of the same arm, and it is separate deliberately: a wire
 *       that landed ONE of two sites would pass A1's arm completely. The failure
 *       must be the CHAIN arm — the per-page provenance — and not the structure
 *       arms, which A1 owns.
 *
 *   A3  THE GUARD DROPPED AT THE RULE — §5.2 exactly as written, reached through
 *       the wire.                                                   MUST FAIL
 *       CPDF-20's A2 arm, one layer up: this proves the corrected rule is
 *       load-bearing THROUGH THE OP and not only in a unit test. It must fail on
 *       the degradation arm — the page tier 1 decoded more of.
 *
 *   A4  THE TIER NOT STAMPED ON THE ANSWER — `structure.tier` forced back to a
 *       constant 1.                                                 MUST FAIL
 *       A merge that is right and silent about it. "One document, TWO tiers" is
 *       half the item and would otherwise pass every other assertion.
 *
 *   A5  THE MEMBER'S NOTES DROPPED — the carry loop removed.        MUST FAIL
 *       Returning the plane's own answer instead of the member's is what put
 *       this finding at risk; the arm proves the remedy is doing work.
 *
 *   A6  THE D-251 CARRY-FORWARD DROPPED at call site 1.             MUST FAIL
 *       Declared FAIL and NOT assumed: the suite measured that the PAGE-WISE
 *       branch preserves the producer by construction, so this arm can only be
 *       caught by the ENCRYPTED (wholesale) document — which is driven through
 *       the op for exactly that reason. If it comes back PASS the arm is telling
 *       us the encrypted assertion is not reaching the branch it claims to.
 *
 *   A7  TRUNCATE THE FIXTURE — hide two of the four PDFs.           MUST FAIL
 *       A totality assertion over a near-empty corpus passes for free (three
 *       times in this repository). The MANIFEST must catch it and NAME the
 *       missing file, rather than a downstream assertion noticing late.
 *
 *   A8  OVER-STRICTNESS — the wire spelled differently at both sites.
 *                                                                MUST NOT FAIL
 *       Correct work in a spelling nobody anticipated must pass. An arm that
 *       fails here means the suite is pinned to how the wire is written rather
 *       than to what it does.
 *
 * A SURPRISING GREEN IS A FINDING ABOUT THE ARM. Recorded, never smoothed.
 */
import { readFileSync, writeFileSync, copyFileSync, renameSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";
import { ANCHOR_DRY, anchorRows, anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SUITE = join(HERE, "tier2-wire.test.mjs");
const FIX = join(HERE, "fixtures", "cpdf20");
const PEN = controlPen("rec98");

/* TWO SUBJECTS, because the item has two. The WIRE is `index.mjs`'s and every
   arm but one aims there. A3 aims at the RULE in `textchain.mjs` — not to
   re-run CPDF-20's control, which already proved the rule, but to prove the
   corrected rule is load-bearing THROUGH THE OP rather than only in a unit
   test. This file EDITS AND RESTORES that file; it does not land anything in
   it, and the restore is verified by sha256 AND `cmp` like every other arm. */
const SUBJECTS = {
  wire: { path: join(HERE, "..", "src", "index.mjs"), floor: 200_000, label: "src/index.mjs" },
  rule: { path: join(HERE, "..", "src", "textchain.mjs"), floor: 20_000, label: "src/textchain.mjs" },
};

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

function runSuite() {
  try {
    const out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status === undefined ? -1 : e.status, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

/** Patch the subject, and REFUSE if the anchor did not match exactly once — an
 *  arm that did not arm is a finding, and arms that matched zero times (or
 *  twice) have been reported as clean in this estate before. */
function patch(pristineText, from, to) {
  const n = pristineText.split(from).length - 1;
  if (n !== 1) return { ok: false, why: `anchor matched ${n} time(s), not exactly 1` };
  return { ok: true, text: pristineText.replace(from, to) };
}

mkdirSync(PEN, { recursive: true });
for (const s of Object.values(SUBJECTS)) {
  s.text = readFileSync(s.path, "utf8");
  s.sha = sha(s.path);
  s.bytes = readFileSync(s.path).length;
  if (s.bytes < s.floor) {
    console.error(`REFUSED: ${s.label} is ${s.bytes} B, below its ${s.floor} B floor — `
                + `restoring a truncated file byte-identically proves nothing.`);
    process.exit(2);
  }
  console.log(`subject: ${s.label} · ${s.bytes} B · ${s.sha.slice(0, 16)}`);
}
console.log(`suite:   test/tier2-wire.test.mjs\n`);

const results = [];

function restoreAndVerify(armName, s) {
  const copy = join(PEN, `${armName}.pristine.mjs`);
  writeFileSync(s.path, s.text);
  const back = sha(s.path), bytes = readFileSync(s.path).length;
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", s.path, copy]); cmpOk = true; } catch { cmpOk = false; }
  const okSha = back === s.sha;
  console.log(`      restored ${s.label}: ${bytes} B · sha ${okSha ? "MATCH" : "MISMATCH"} · cmp ${cmpOk ? "identical" : "DIFFERS"}`);
  if (!okSha || !cmpOk || bytes < s.floor) {
    console.error(`      RESTORE FAILED after ${armName}. Stopping rather than measuring a wrong tree.`);
    process.exit(3);
  }
}

/* The names a failure must carry to count as failing BY NAME. Read off the
   suite's own assertion labels, so an arm that breaks something UNNAMED — a
   crash, an unrelated regression — is distinguishable from the arm working. */
const NAMES = /TWO tiers|per PAGE|SCOPED, mixed chain|kept at tier 1|decline reaches the caller|producer is still named|could not be read|manifest|corpus floor/;

function sourceArm({ name, declared, subject = "wire", edits }) {
  if (ANCHOR_DRY) return void anchorRows(edits.map(([find, put]) => ({ arm: name, file: SUBJECTS[subject].path, find, put })));   /* M0-197: read, never armed */
  const s = SUBJECTS[subject];
  const copy = join(PEN, `${name}.pristine.mjs`);
  copyFileSync(s.path, copy);                  // uniquely-named, per-arm
  let text = s.text, why = null;
  for (const [from, to] of edits) {
    const p = patch(text, from, to);
    if (!p.ok) { why = p.why; break; }
    text = p.text;
  }
  if (why) {
    console.log(`  ${name}  ARM DID NOT ARM: ${why}  <-- THIS IS A FINDING, not a pass`);
    results.push({ name, declared, actual: "DID NOT ARM", agree: false });
    restoreAndVerify(name, s);
    return;
  }
  writeFileSync(s.path, text);
  const armedSha = sha(s.path);
  const r = runSuite();
  const actual = r.code === 0 ? "PASS" : "FAIL";
  const tally = r.out.match(/tier2-wire: (-?\d+) pass, (-?\d+) fail/);
  const named = NAMES.test((r.out.match(/ {2}FAIL .*/g) || []).join("\n"));
  console.log(`  ${name}  declared ${declared.padEnd(8)} actual ${actual.padEnd(5)} `
            + `(${tally ? `${tally[1]}/${tally[2]}` : "NO TALLY — report as -1, never 0"}, `
            + `${s.label}, armed sha ${armedSha.slice(0, 8)}, exit ${r.code})`);
  if (actual === "FAIL") {
    for (const l of (r.out.match(/ {2}FAIL .*/g) || []).slice(0, 3)) console.log(`      ${l.trim()}`);
    console.log(`      failed BY NAME: ${named ? "yes" : "NO — the arm broke something unnamed"}`);
  }
  results.push({ name, declared, actual, agree: actual === declared, named });
  restoreAndVerify(name, s);
}

/* ── BASELINE ─────────────────────────────────────────────────────────────── */
if (!ANCHOR_DRY) {   /* M0-197: no suite under the dry read */
  const r = runSuite();
  const actual = r.code === 0 ? "PASS" : "FAIL";
  const tally = r.out.match(/tier2-wire: (-?\d+) pass, (-?\d+) fail/);
  console.log(`  BASELINE  declared PASS     actual ${actual.padEnd(5)} `
            + `(${tally ? `${tally[1]} assertions` : "NO TALLY — report as -1, never 0"}, exit ${r.code})`);
  results.push({ name: "BASELINE", declared: "PASS", actual, agree: actual === "PASS" });
  if (actual !== "PASS") { console.error("  BASELINE IS RED. Every arm below would be meaningless."); process.exit(4); }
}

/* ── A1 · call site 1 removed — the op returns the member's answer whole ──── */
sourceArm({
  name: "A1", declared: "FAIL",
  edits: [[
`          if (r.ok && t2 && t2.ok) {`,
`          if (r.ok && t2 && t2.ok) { return json(t2, 200); }   /* NC A1: CALL SITE 1 REMOVED */
          if (false) {`,
  ]],
});

/* ── A2 · call site 2 removed — the acquire assembly assigns wholesale ────── */
sourceArm({
  name: "A2", declared: "FAIL",
  edits: [[
`                        const m = mergeTier2Text(i2text, t2.text);
                        if (m.ok) {`,
`                        /* NC A2: CALL SITE 2 REMOVED — the wholesale assignment restored */
                        i2text = (st.text && st.text.producer && !t2.text.producer)
                          ? { ...t2.text, producer: st.text.producer } : t2.text;
                        wiredTier = 2;
                        const m = { ok: false, why: null, replaced: [], kept: [] };
                        if (m.ok) {`,
  ]],
});

/* ── A3 · §5.2 exactly as written, reached through the wire ───────────────── */
sourceArm({
  name: "A3", declared: "FAIL", subject: "rule",
  edits: [[
`  return (u2 < u1 && c2 > c1) ? "tier2" : "tier1";`,
`  return (u2 < u1) ? "tier2" : "tier1";   /* NC A3: the design as written */`,
  ]],
});

/* ── A4 · the merge is right and says nothing about which tier answered ───── */
sourceArm({
  name: "A4", declared: "FAIL",
  edits: [[
`      structure.tier = structureTier;`,
`      structure.tier = 1;   /* NC A4: the tier not stamped */`,
  ]],
});

/* ── A5 · the member's own notes dropped ──────────────────────────────────── */
sourceArm({
  name: "A5", declared: "FAIL",
  edits: [[
`            for (const n of (Array.isArray(t2.notes) ? t2.notes : []))
              if (typeof n === "string" && !structure.notes.includes(n))
                structure.notes = [...structure.notes, n];`,
`            /* NC A5: the member's notes dropped */`,
  ]],
});

/* ── A6 · the D-251 carry-forward dropped at call site 1 ──────────────────── */
sourceArm({
  name: "A6", declared: "FAIL",
  edits: [[
`              structure.text = (structure.text && structure.text.producer && !m.text.producer)
                ? { ...m.text, producer: structure.text.producer } : m.text;`,
`              structure.text = m.text;   /* NC A6: D-251 carry-forward dropped */`,
  ]],
});

/* ── A7 · truncate the fixture ────────────────────────────────────────────── */
if (!ANCHOR_DRY) {   /* M0-197: it renames fixtures; under the dry read it is only named, below */
  const hidden = ["legistar-73550.pdf", "legistar-73618.pdf"];
  const stash = join(PEN, "A7-fixtures");
  mkdirSync(stash, { recursive: true });
  for (const f of hidden) renameSync(join(FIX, f), join(stash, f));
  const r = runSuite();
  const actual = r.code === 0 ? "PASS" : "FAIL";
  /* The manifest fails at LOAD, naming the file, rather than a downstream
     assertion noticing a thinner corpus — which is the whole reason CPDF-20
     replaced its `readdirSync` walk with one. */
  const named = new RegExp(hidden.join("|")).test(r.out) || /ENOENT|manifest|corpus floor/.test(r.out);
  console.log(`  A7  declared FAIL     actual ${actual.padEnd(5)} (2 of 4 PDFs hidden, exit ${r.code})`);
  console.log(`      failed BY NAME (the manifest names the missing file): ${named ? "yes" : "NO"}`);
  results.push({ name: "A7", declared: "FAIL", actual, agree: actual === "FAIL", named });
  for (const f of hidden) renameSync(join(stash, f), join(FIX, f));
  let allBack = true;
  for (const f of hidden) if (!existsSync(join(FIX, f))) allBack = false;
  console.log(`      fixture restored: ${allBack ? "both files back" : "MISSING FILES"}`);
  if (!allBack) process.exit(3);
}

/* ── A8 · OVER-STRICTNESS: the same wire, spelled differently, at BOTH sites ─ */
sourceArm({
  name: "A8", declared: "PASS",
  edits: [
    [
`              structureTier = m.replaced.length ? 2 : 1;`,
`              /* NC A8: the same verdict, spelled as a comparison rather than truthiness */
              structureTier = (m.replaced.length > 0) ? 2 : 1;`,
    ],
    [
`                          if (m.replaced.length) wiredTier = 2;`,
`                          /* NC A8: the same verdict, spelled as a guard */
                          if (!(m.replaced.length === 0)) { wiredTier = 2; }`,
    ],
    [
`                          if (m.replaced.length && m.kept.length) {`,
`                          /* NC A8: the same condition, spelled as two comparisons */
                          if (m.replaced.length > 0 && m.kept.length > 0) {`,
    ],
  ],
});

anchorTable([{ arm: "A7", none: "hides two fixture PDFs by rename; quotes no line" }]);   /* M0-197: prints the arms read above and exits, under the dry read only */

/* ── the ledger ───────────────────────────────────────────────────────────── */
console.log(`\n  arm       declared  actual  agree`);
for (const r of results)
  console.log(`  ${r.name.padEnd(9)} ${r.declared.padEnd(9)} ${String(r.actual).padEnd(7)} ${r.agree ? "yes" : "NO  <-- FINDING"}`);

const disagreed = results.filter((r) => !r.agree);
let clean = true;
for (const s of Object.values(SUBJECTS)) {
  const finalSha = sha(s.path), finalBytes = readFileSync(s.path).length;
  const ok = finalSha === s.sha;
  if (!ok) clean = false;
  console.log(`\n  ${s.label} after every arm: ${finalBytes} B · sha `
            + `${ok ? "MATCHES pristine" : "DOES NOT MATCH — the tree is dirty"}`);
}
console.log(`  ${results.length} arm(s), ${disagreed.length} disagreement(s)`);
/* THE PEN IS REMOVED ONLY AFTER EVERY RESTORE HAS BEEN VERIFIED — the per-arm
   pristine copies are what `cmp` compares against, so they must outlive the
   arms. Left behind, they are an untracked directory inside a worktree, which
   is precisely the kind of thing that reaches nobody and confuses the next
   reader. Kept on a disagreement, because then they are evidence. */
if (disagreed.length === 0 && clean) {
  rmSync(PEN, { recursive: true, force: true });
  console.log(`  pen removed: ${existsSync(PEN) ? "NO — still on disk" : "yes"}`);
} else {
  console.log(`  pen KEPT at ${PEN} — there is a disagreement to look at`);
}
process.exit(disagreed.length === 0 && clean ? 0 : 1);
