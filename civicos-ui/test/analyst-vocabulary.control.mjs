#!/usr/bin/env node
/* analyst-vocabulary.control.mjs — UI-53'S NEGATIVE CONTROL DRIVER.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs and
 * `civicos-ui/test/run.mjs` discovers `*.test.mjs`; a driver the harness picked
 * up would mutate `app.html` and `DECISIONS.md` underneath every other suite.
 * UI-42's `version-review.control.mjs` sets the shape and this follows it.
 *
 *     node civicos-ui/test/analyst-vocabulary.control.mjs
 *
 * IT MUTATES AND RESTORES `docs/development/DECISIONS.md`, which UI-53 does NOT
 * otherwise edit — declared here rather than discovered, because arm 1's whole
 * subject is that the family is read from the ruling. Every restore is verified
 * by sha256 AND by `cmp` against TWO independent pristine copies.
 *
 * THE PRACTICES, each of which this estate has paid for:
 *   - EACH ARM IS ARMED ALONE, every other defence held open.
 *   - THERE IS A BASELINE ARM that patches NOTHING and must come back GREEN.
 *     Without it, "every arm failed" cannot be told from "the harness is broken".
 *   - EVERY ARM DECLARES ITS EXPECTATION BEFORE IT RUNS: RED or GREEN, and for a
 *     RED arm the text the failure must contain. An arm coming back GREEN when
 *     RED was declared is a FINDING ABOUT THE ARM and is printed as one.
 *   - EVERY PATCH IS ASSERTED TO HAVE ARMED: the anchor must occur EXACTLY ONCE
 *     and the bytes must differ afterwards.
 *   - THE PEN IS INSIDE THIS WORKTREE (`.ui53-harness/`), never a shared
 *     scratchpad two sessions can collide in.
 *
 * ------------------------------------------------------------ RESULTS, RUN
 *
 * RUN 2026-08-09 in worktree `agent-a5a6c1d8ff9f6c282`. EIGHT arms, each armed
 * alone; every restore verified by sha256 AND `cmp` against two independent
 * pristine copies, byte counts printed and floored at 2,000.
 * FINAL: 8 arms, 8 AS DECLARED, 0 not. All five watched files came back
 * byte-identical (app.html 1,157,344 · DECISIONS.md 420,488 · the family 16,767
 * · this item's suite 25,652 · elicitation.test.mjs 31,572).
 *
 *   (1) THE RULING ENUMERATES NOTHING — clause 1 rewritten to name no
 *       vocabulary. DECLARED: RED. ACTUAL: RED — 46 pass, 10 fail, ARM D first:
 *       *"the ruling enumerated 1 atoms [the analyst's vocabulary] (floor 4)"*.
 *       The family did NOT quietly narrow to a short list; it said so. That is
 *       the arm that separates a derivation from a hand list with extra steps.
 *   (2) A HAND LIST COMES BACK — `elicitation.test.mjs` regrows a private
 *       `BANNED` literal beside the shared family. DECLARED: RED, on the census.
 *       ACTUAL: RED — 55 pass, 1 fail, naming the file: *"keeps NO private ban
 *       pattern beside the shared family"*. This is the arm the whole item rests
 *       on, because four rival lists is precisely how the defect arose.
 *   (3) A RESIDUE TERM IS UNANCHORED — `partition` renamed to `quadrature`.
 *       DECLARED: RED. ACTUAL: RED — 54 pass, 2 fail, and the SECOND failure is
 *       the useful one: ARM U reported *"MISSED [partition (was enforced by:
 *       notifications, version-review, connections-sidebar)]"*. The anchor check
 *       and the union check caught it independently, which is what makes the
 *       residue a floor rather than a note.
 *   (4) D-269's RETIRED WORDING RETURNS — the elicitation read-back says
 *       `independently sufficient grounds` again. DECLARED: RED at the consuming
 *       sweep. ACTUAL: RED — `elicitation.test.mjs` 47/48, the sweep naming the
 *       phase and the word: *"authoring, a revision: ground"*. The family still
 *       defends the thing the delegation was about, measured through a CONSUMER
 *       rather than through the classifier.
 *   (5a) OVER-STRICTNESS, A CODE COMMENT — the banned words in a block comment
 *       inside the member-facing elicitation block. DECLARED: GREEN. ACTUAL:
 *       GREEN — elicitation 48/48, this item's suite 56/56.
 *   (5b) OVER-STRICTNESS, AN INTERNAL IDENTIFIER —
 *       `groundPartitionOfOrBranches` planted in the same block. DECLARED:
 *       GREEN. ACTUAL: GREEN — 48/48 and 56/56.
 *   (5c) OVER-STRICTNESS, A FIXTURE ID — `fixture-ground-partition-or-branch-1`
 *       in a consuming suite. DECLARED: GREEN. ACTUAL: GREEN — 48/48 and 56/56.
 *       THE THREE TOGETHER ARE THE POINT: the ban is on what a MEMBER READS, not
 *       on what the engine is called, and a fence tighter than its rule is an
 *       undeclared interface change wearing the costume of caution.
 *   (6) BASELINE — no patch. DECLARED: GREEN. ACTUAL: GREEN — 56/56 and 48/48.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(HERE, "..");
const REPO = path.join(UI, "..");
const APP = path.join(UI, "app.html");
const DECISIONS = path.join(REPO, "docs/development/DECISIONS.md");
const FAMILY = path.join(HERE, "analyst-vocabulary.mjs");
const MINE = path.join(HERE, "analyst-vocabulary.test.mjs");
const ELIC = path.join(HERE, "elicitation.test.mjs");
const PEN = path.join(UI, ".ui53-harness");
fs.mkdirSync(PEN, { recursive: true });

const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const same = (a, b) => { try { execFileSync("cmp", ["-s", a, b]); return true; } catch (_) { return false; } };

/* THE PRISTINE-OF-RECORD, taken ONCE before any arm and never overwritten. Every
   copy's byte count is PRINTED and FLOORED: two harnesses in this project have
   reported a restore byte-identical OVER AN EMPTY MANIFEST, caught only because
   a digest read `e3b0c442…`, the sha256 of the empty string. */
const WATCHED = { app: APP, decisions: DECISIONS, family: FAMILY, mine: MINE, elic: ELIC };
const RECORD = {};
for (const [k, p] of Object.entries(WATCHED)) {
  RECORD[k] = path.join(PEN, `record.${path.basename(p)}`);
  fs.copyFileSync(p, RECORD[k]);
  const bytes = fs.statSync(RECORD[k]).size;
  if (bytes < 2000) { console.error(`PRISTINE-OF-RECORD ${k} is ${bytes} bytes — refusing to run over an empty manifest`); process.exit(1); }
  console.log(`pristine-of-record ${k.padEnd(10)}: ${String(bytes).padStart(8)} bytes, sha256 ${sha(RECORD[k]).slice(0, 16)}…`);
}
const keyOf = (f) => Object.entries(WATCHED).find(([, p]) => p === f)[0];

const ARMS = [
  /* (1) THE RULING. The family is DERIVED from DEC-32 clause 1's own sentence. If
     the ruling can no longer be read, the family must FAIL LOUDLY rather than
     fall back to a short list — a derivation that degrades silently into a hand
     list is the exact rot this item exists to end. */
  { id: "1-ruling-enumerates-nothing", file: DECISIONS, run: [MINE], mustFail: true,
    says: "the ruling enumerated",
    what: "THE RULING ENUMERATES NOTHING — clause 1 rewritten so it names no vocabulary. A family derived from an authority it can no longer read must go RED, never quietly narrow",
    patch: (t) => {
      const a = "1. **NEVER show AND / OR / disjunction / grounds — not even as tooltips.**";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "1. **NEVER show the analyst's vocabulary — not even as tooltips.**");
    } },

  /* (2) THE CONSUMER. THIS IS THE ITEM. A fourth hand list must not be able to
     come back silently — which is exactly how there came to be four. */
  { id: "2-a-hand-list-comes-back", file: ELIC, run: [MINE], mustFail: true,
    says: "keeps NO private ban pattern",
    what: "A HAND LIST COMES BACK — `elicitation.test.mjs` regrows a private `BANNED` literal beside the shared family. The census must catch it BY SHAPE, since the whole defect was four rival lists nobody noticed",
    patch: (t) => {
      const a = "  console.log(\"  \" + reachLine());\n  const hits = [];";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "  console.log(\"  \" + reachLine());\n"
        + "  const BANNED = [\n"
        + "    [/\\bground/i,          \"the analyst's noun for a set of reasons\"],\n"
        + "    [/\\bdisjunct/i,        \"the analyst's word for the relationship\"],\n"
        + "  ];\n"
        + "  void BANNED;\n  const hits = [];");
    } },

  /* (3) THE RESIDUE. A residue term is legitimate ONLY because DEC-32 says it.
     Unanchored, it is a maintainer's recollection wearing the ruling's
     authority — and that is how a derived family becomes a hand list again. */
  { id: "3-residue-unanchored", file: FAMILY, run: [MINE], mustFail: true,
    says: "OCCURS IN DEC-32",
    what: "A RESIDUE TERM IS UNANCHORED — renamed to a word DEC-32 never says. The anchor check must go RED, or the residue is just a list with better manners",
    patch: (t) => {
      const a = '  ["partition", /\\bpartition/i,';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  ["quadrature", /\\bquadrature/i,');
    } },

  /* (4) THE SUBJECT. D-269's retired wording planted back at the exact site
     DEC-32 clause 3's remedy replaced it. If this does not go RED, the family
     does not defend the thing the delegation was about. */
  { id: "4-the-subject-returns", file: APP, run: [ELIC], mustFail: true,
    says: "not one analyst word",
    what: "D-269's RETIRED WORDING RETURNS — the elicitation read-back says `independently sufficient grounds` again, the phrase that was reaching members and freezing into signed bundle.md frontmatter",
    patch: (t) => {
      const a = "as sets that carry your answer on their own.";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "as independently sufficient grounds.");
    } },

  /* (5a-c) OVER-STRICTNESS. THE BAN IS ON WHAT A MEMBER READS, NOT ON WHAT THE
     ENGINE IS CALLED. All three MUST stay GREEN. A harness that goes red here is
     a fence tighter than its rule, and this project treats that as the worse
     defect because a guard that refuses correct work gets switched off. */
  { id: "5a-banned-in-a-comment", file: APP, run: [ELIC, MINE], mustFail: false,
    what: "OVER-STRICTNESS — the banned words in a CODE COMMENT inside the member-facing elicitation block. A comment is not rendered and must PASS",
    patch: (t) => {
      const a = "/*__ELICITATION_START__*/";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, a + "\n/* UI-53 CONTROL 5a: the OR part over the grounds partition, and the\n"
        + "   disjunction of its branches, is computed below. AND/OR relationships are\n"
        + "   named here because this is the analyst explaining the mechanism. */");
    } },

  { id: "5b-banned-in-an-identifier", file: APP, run: [ELIC, MINE], mustFail: false,
    what: "OVER-STRICTNESS — an INTERNAL IDENTIFIER carrying the banned words. What the engine calls a thing is not what a member reads, and must PASS",
    patch: (t) => {
      const a = "/*__ELICITATION_START__*/";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, a + "\nconst groundPartitionOfOrBranches = (disjunctSets) => disjunctSets;\n"
        + "void groundPartitionOfOrBranches;");
    } },

  { id: "5c-banned-in-a-fixture-id", file: ELIC, run: [ELIC, MINE], mustFail: false,
    what: "OVER-STRICTNESS — a FIXTURE ID carrying the banned words. A suite's own scaffolding is not a member-facing surface and must PASS",
    patch: (t) => {
      const a = "  console.log(\"  \" + reachLine());\n  const hits = [];";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "  const GROUND_PARTITION_OR_BRANCH_FIXTURE = \"fixture-ground-partition-or-branch-1\";\n"
        + "  void GROUND_PARTITION_OR_BRANCH_FIXTURE;\n"
        + "  console.log(\"  \" + reachLine());\n  const hits = [];");
    } },

  { id: "6-baseline", file: APP, run: [MINE, ELIC], mustFail: false,
    what: "BASELINE — no patch at all. Without this row, every arm failing for the wrong reason looks like every arm working",
    patch: (t) => t },
];

const runSuite = (s) => {
  try { return { code: 0, out: execFileSync("node", [s], { encoding: "utf8", stdio: "pipe" }) }; }
  catch (e) { return { code: e.status === undefined ? -1 : e.status,
                       out: String(e.stdout || "") + String(e.stderr || "") }; }
};

const results = [];
let broken = 0;
for (const arm of ARMS) {
  const key = path.basename(arm.file);
  const pristine = path.join(PEN, `${arm.id}.${key}.pristine`);   // UNIQUE per arm, never path alone
  fs.copyFileSync(arm.file, pristine);
  const before = fs.readFileSync(arm.file, "utf8");
  const after = arm.patch(before);
  const armed = after !== null && (arm.id === "6-baseline" || after !== before);
  if (after === null || !armed) {
    console.error(`ARM ${arm.id}: THE PATCH NEVER ARMED — its anchor did not appear exactly once. This is a FINDING about the arm, not about the subject.`);
    broken++;
    fs.copyFileSync(pristine, arm.file);
    results.push({ arm, armed: false, asDeclared: false });
    continue;
  }
  fs.writeFileSync(arm.file, after);

  const runs = arm.run.map((s) => ({ s: path.basename(s), ...runSuite(s) }));

  /* RESTORE, THEN VERIFY TWICE AND AGAINST TWO COPIES. */
  fs.copyFileSync(pristine, arm.file);
  const rec = RECORD[keyOf(arm.file)];
  const okSha = sha(arm.file) === sha(pristine) && sha(arm.file) === sha(rec);
  const okCmp = same(arm.file, pristine) && same(arm.file, rec);
  const bytes = fs.statSync(arm.file).size;
  if (!okSha || !okCmp || bytes < 2000) {
    console.error(`ARM ${arm.id}: RESTORE FAILED (sha256 ${okSha}, cmp ${okCmp}, ${bytes} bytes) — STOPPING`);
    process.exit(1);
  }

  const failed = runs.some((r) => r.code !== 0);
  const saidIt = !arm.says || !arm.mustFail || runs.some((r) => r.out.includes(arm.says));
  const asDeclared = failed === arm.mustFail && saidIt;
  if (!asDeclared) broken++;
  results.push({ arm, armed, runs, failed, asDeclared });

  console.log(`ARM ${arm.id.padEnd(28)} armed=${armed} declared=${arm.mustFail ? "RED" : "GREEN"} `
    + `actual=${failed ? "RED" : "GREEN"} ${asDeclared ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`
    + `  restore: sha256 ok, cmp ok, ${bytes} bytes`);
  for (const r of runs) {
    const tally = (r.out.split("\n").find((l) => /: \d+ pass, \d+ fail/.test(l))
                || r.out.split("\n").find((l) => /\d+\/\d+ assertions/.test(l)) || "").trim();
    console.log(`    ${r.s.padEnd(30)} exit=${r.code}  ${tally}`);
    for (const l of r.out.split("\n").filter((l) => /^\s+FAIL /.test(l)).slice(0, 3))
      console.log(`        ${l.trim().slice(0, 160)}`);
  }
}

console.log(`\n${results.length} arms run, ${results.filter((x) => x.asDeclared).length} as declared, ${broken} NOT`);
/* A SURPRISING GREEN IS A FINDING ABOUT THE ARM. Recorded, never smoothed. */
for (const r of results.filter((x) => !x.asDeclared))
  console.log(`  *** ${r.arm.id}: declared ${r.arm.mustFail ? "RED" : "GREEN"}, got ${r.armed ? (r.failed ? "RED" : "GREEN") : "NEVER ARMED"} — ${r.arm.what}`);

/* FINAL SWEEP: every watched file byte-identical to its pristine-of-record. */
let dirty = 0;
for (const [k, p] of Object.entries(WATCHED)) {
  const clean = sha(p) === sha(RECORD[k]) && same(p, RECORD[k]);
  if (!clean) { dirty++; console.error(`  *** ${k} (${p}) DID NOT COME BACK CLEAN`); }
}
console.log(dirty ? `${dirty} file(s) left dirty — THIS IS A FINDING` : "all watched files restored byte-identical (sha256 + cmp)");
if (!dirty) fs.rmSync(PEN, { recursive: true, force: true });
process.exit(broken || dirty ? 1 : 0);
