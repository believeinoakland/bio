#!/usr/bin/env node
/* UI-63's NEGATIVE CONTROL DRIVER — the arms for `meaning-arms.test.mjs`.
 *
 * Run from the REPO ROOT:
 *     node civicos-ui/test/meaning-arms.control.mjs              # every arm
 *     node civicos-ui/test/meaning-arms.control.mjs liar
 *
 * THE DISCIPLINE. Each arm EDITS A REAL SOURCE, is armed ALONE with every other
 * arm held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy
 * verified by sha256 AND by `cmp`, with the byte count printed and a minimum
 * guarded. It NEVER uses `git checkout --`, which restores to HEAD and has twice
 * in this repository discarded a session's own uncommitted work.
 *
 * `baseline` is an arm and is the first one: it arms nothing and MUST be green.
 * Without it, a driver whose edits all failed to apply reports N red arms and
 * looks like a triumph.
 *
 * TWO SUITES ARE RUN FOR EVERY ARM, and the second one is the point. `meaning-arms`
 * is this item's own; `passage-surface` is UI-62's, whose over-strictness section
 * is THE FENCE around this work. An arm that reddens the fence has moved something
 * UI-62 proved unmoved, and that is a finding whether or not this item's own suite
 * noticed — which is precisely the case for `liar` below.
 *
 * ---------------------------------------------------------------------------
 * THE CHEAPEST GREEN THIS SUITE MUST NOT ALLOW, declared here because it is what
 * the arms are shaped against. `finderPlan` could be widened so that EVERY
 * unrecognised selector-shaped prefix counts as answered by the text route. All
 * three arms would then be reported correctly, this item's headline would go
 * green — and the cross-seam panel would lose the ability to say *answered by
 * neither* about ANYTHING, including `grade:`, which the plane compiles as
 * nothing at all. `liar` is that arm and it is the reason section 3 of the suite
 * exists. A row that narrows a FALSE negative must not remove the TRUE one.
 *
 * OVER-STRICTNESS IS AN ARM AND IS RUN EVERY TIME (`equivalent`, `reordered`).
 * Correct work in a spelling this item did not anticipate must PASS — a fence
 * tighter than its rule is not a safer fence.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one. The import is for its SIDE EFFECT and is idempotent. */
import fs from "fs";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const APP = ROOT + "civicos-ui/app.html";
const SUITES = [
  { name: "meaning-arms",    path: ROOT + "civicos-ui/test/meaning-arms.test.mjs",    tally: /meaning-arms: (\d+) pass, (\d+) fail/ },
  /* UI-62's SUITE, AND THIS ITEM NEVER EDITS IT. It is run as the FENCE. */
  { name: "passage-surface", path: ROOT + "civicos-ui/test/passage-surface.test.mjs", tally: /passage-surface: (\d+) pass, (\d+) fail/ },
];

const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

/* THE ARMS. `file` is what is edited; `from`/`to` is a single unique string
   replacement; `expect` is what the arm must produce and is declared HERE,
   before it is run, so a surprising result is a finding rather than a
   description. `mustNot` names what the arm must NOT take down — an arm that
   reddens everything has perturbed a second variable and its refutation is
   worth nothing (CLAUDE.md's break-only-the-thing rule). */
const ARMS = {
  baseline: { file: null, why: "nothing armed — this MUST be green, and it is what proves the other arms are real" },

  /* ---- THE ITEM'S OWN CONTROL: the fix reverted. ---- */
  reverted: {
    file: APP,
    from: `      if(searchHasField(field) || searchHasMeaningArm(field) || QUERY_PREFIXES.includes(field)) text.push({ term, field });`,
    to:   `      if(searchHasField(field) || QUERY_PREFIXES.includes(field)) text.push({ term, field });`,
    why: "the fix removed — `finderPlan` asks only the FIELD half of `op=searchfields` again, so the three "
       + "meaning arms fall back into `unpublished` and the cross-seam panel tells a member they are "
       + "*answered by neither* while the surface's very next act sends them down the route that answers them",
    expect: "meaning-arms FAILS, and each failure NAMES THE ARM AND THE BUCKET — `leg:hunch`/`resolves:>=B`/"
          + "`content:stale` each reported as being in `neither`, plus the one-query separation assertion and "
          + "the text-route alternative that drops the arm from the member's own question. A failure reading "
          + "only *the panel is wrong* is one a reader cannot act on, and this arm is what proves these do not",
    mustNot: "passage-surface must stay GREEN — reverting this item restores exactly the state UI-62 shipped",
  },

  /* ---- THE CHEAPEST GREEN, ARMED. The whole reason section 3 exists. ---- */
  liar: {
    file: APP,
    from: `      if(searchHasField(field) || searchHasMeaningArm(field) || QUERY_PREFIXES.includes(field)) text.push({ term, field });`,
    to:   `      if(true) text.push({ term, field });`,
    why: "THE LIAR — every selector-shaped term treated as answered by the text route. All three arms are "
       + "reported correctly, this item's headline goes green, and the panel can no longer say *answered by "
       + "neither* about ANYTHING: `grade:` filters nothing on either route (`op=search` answers "
       + "`unknown field \"grade\"; read as free text`) and a member is now told it was answered",
    expect: "meaning-arms FAILS ONLY IN SECTION 3 — the eight-name sweep, each naming the term and reporting "
          + "it in `text`, plus the `answered by neither` capability assertion and the three no-meaning-half "
          + "fallbacks. Sections 0, 2 and 2b stay GREEN, which is the whole point: the liar satisfies the "
          + "row's headline. passage-surface ALSO fails, on its `passage:` term against a plane that does not "
          + "publish the arm — the fence catches this arm independently"
          + "  ||  MEASURED 2026-09-17: 13 FAIL, and THE DECLARATION WAS WRONG IN ONE PLACE AND IS CORRECTED "
          + "HERE RATHER THAN QUIETLY RESTATED. Section 2's THREE PER-ARM assertions did stay green — the liar "
          + "reports `leg:`, `resolves:` and `content:` correctly, which is the row's headline — but section 2's "
          + "COMBINED assertion (`in one query the panel separates the three ARMS from the one name published as "
          + "NEITHER`) went RED, because `grade:>=B` moved into `text` in the same render. THAT IS THE FINDING: "
          + "an assertion that checks the two kinds TOGETHER catches this arm where three assertions checking "
          + "one kind each cannot, and it is the only thing outside section 3 that did",
    mustNot: "n/a — this arm is SUPPOSED to be caught, and by section 3 specifically",
  },

  /* ---- ASKED, NOT REMEMBERED. ---- */
  literal: {
    file: APP,
    from: `  return !!(SEARCH_FIELDS.meaning && Object.prototype.hasOwnProperty.call(SEARCH_FIELDS.meaning, String(name||"").toLowerCase()));`,
    to:   `  return ["leg","resolves","content","concerns","passage"].includes(String(name||"").toLowerCase());`,
    why: "the plane's published vocabulary replaced by a LITERAL LIST in the surface — correct against today's "
       + "plane and a lie against any other. A surface that carries its own copy of a vocabulary reports a "
       + "capability a plane that has not landed it does not have, which is `finderPassageArm`'s whole rule "
       + "one construct over and UI-15's *absent is absent, never present-and-refused*",
    expect: "meaning-arms FAILS on the three `against a plane publishing NO meaning half` assertions and on the "
          + "did-not-latch line. Sections 0, 2 and 2b stay GREEN — against THIS plane the list is right, which "
          + "is exactly why a suite that only checked today's plane would ship this",
    mustNot: "passage-surface must stay GREEN — `passage:` is settled before this predicate is ever reached"
          + "  ||  MEASURED 2026-09-17: **THIS DECLARATION WAS WRONG AND THE RESULT IS BETTER THAN THE "
          + "PREDICTION.** passage-surface went 99/1, failing its own walk *a `passage:` term is then reported "
          + "as a name the record publishes as neither*. The reasoning behind the prediction was sound for the "
          + "ROUTING branch and blind to the REPORTING one: UI-62's walk blanks the published `meaning` half, "
          + "and with it blank the passage branch correctly declines the term — which hands it to the selector "
          + "branch, where a LITERAL LIST still claims the arm. So the fence is a SECOND, INDEPENDENT instrument "
          + "on this arm, and it is independent for a real reason: UI-62 already wrote the one walk that puts a "
          + "surface in front of a plane whose vocabulary it cannot assume, which is the exact condition a "
          + "hard-coded list lies about. Recorded rather than smoothed over — the next session re-running this "
          + "arm the obvious way should be told what it will actually see",
  },

  /* ---- THE OTHER DIRECTION: the predicate reached BEFORE the passage branch. ---- */
  stealspassage: {
    file: APP,
    from: `    const pas = /^-?([A-Za-z_][A-Za-z0-9_]*):(.+)$/.exec(term);`,
    to:   `    const pas = /^-?(NEVERMATCHES)():(.+)$/.exec(term);`,
    why: "the passages branch disarmed, so `passage:` falls through to the selector branch — where the "
       + "predicate this item ADDED now recognises it as a published meaning arm and routes it to the TEXT "
       + "route. The member's passage question is then answered at BUNDLE grain by a different op, and the "
       + "answer looks exactly like the one they asked for. This is the failure mode of widening a parse, "
       + "armed deliberately, because it is the one UI-62 refused this item's scope to prevent",
    expect: "BOTH suites FAIL — meaning-arms on `passage:` is STILL reported by the passages route, and "
          + "passage-surface across its passages-seam section. The ordering of the two branches is load-bearing "
          + "and this is what pins it",
    mustNot: "n/a — this arm must be caught, and by BOTH suites",
  },

  /* ---- OVER-STRICTNESS. Correct work in a spelling this item did not
          anticipate must PASS. Neither of these changes what the surface
          believes; they change how it is written. ---- */
  equivalent: {
    file: APP,
    from: `  return !!(SEARCH_FIELDS.meaning && Object.prototype.hasOwnProperty.call(SEARCH_FIELDS.meaning, String(name||"").toLowerCase()));`,
    to:   `  const m = SEARCH_FIELDS.meaning;\n  return !!m && Object.keys(m).includes(String(name||"").toLowerCase());`,
    why: "OVER-STRICTNESS — the same plane-derived question asked with `Object.keys(...).includes` instead of "
       + "`hasOwnProperty`. The criterion is identical and still the plane's",
    expect: "GREEN — 0 FAIL in both suites. If this arm goes red, this suite is pinning an implementation "
          + "spelling it never meant to require, and the assertion that did it is the defect",
    mustNot: "n/a — this arm must take NOTHING down",
  },
  reordered: {
    file: APP,
    from: `      if(searchHasField(field) || searchHasMeaningArm(field) || QUERY_PREFIXES.includes(field)) text.push({ term, field });`,
    to:   `      if(QUERY_PREFIXES.includes(field) || searchHasMeaningArm(field) || searchHasField(field)) text.push({ term, field });`,
    why: "OVER-STRICTNESS — the three halves of the published grammar tested in a different order. The union "
       + "is the same union; no name changes bucket",
    expect: "GREEN — 0 FAIL in both suites",
    mustNot: "n/a — this arm must take NOTHING down",
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).filter(([, a]) => a.file).map(([arm, a]) => ({ arm, file: a.file, find: a.from, put: a.to })));

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`no such arm: ${only}\n  arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let broke = 0;
const SUMMARY = [];
for (const name of names) {
  const arm = ARMS[name];
  console.log(`\n${"=".repeat(78)}\nARM ${name} — ${arm.why}`);
  if (arm.expect) console.log(`DECLARED BEFORE ARMING: ${arm.expect}`);
  if (arm.mustNot) console.log(`MUST NOT TAKE DOWN:     ${arm.mustNot}`);

  let pristine = null, before = null;
  if (arm.file) {
    pristine = `${arm.file}.pristine-${name}`;
    fs.copyFileSync(arm.file, pristine);
    before = sha(arm.file);
    const src = fs.readFileSync(arm.file, "utf8");
    const n = src.split(arm.from).length - 1;
    if (n !== 1) {
      /* AN ARM THAT DID NOT ARM IS A FINDING, never a quiet pass. */
      console.error(`  REFUSING TO ARM: the anchor matches ${n} time(s), and an arm must be a SINGLE unique replacement.`);
      fs.rmSync(pristine); broke++; SUMMARY.push(`${name}: DID NOT ARM (anchor matched ${n})`); continue;
    }
    fs.writeFileSync(arm.file, src.replace(arm.from, arm.to));
    console.log(`  armed: ${arm.file.replace(ROOT, "")} (${before.slice(0, 12)}… -> ${sha(arm.file).slice(0, 12)}…)`);
  }

  const line = [];
  for (const s of SUITES) {
    let out = "", code = 0;
    try { out = execFileSync("node", [s.path], { encoding: "utf8", stdio: "pipe", maxBuffer: 64 * 1024 * 1024 }); }
    catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status ?? 1; }
    const f = (out.match(/^  FAIL/gm) || []).length;
    const tally = s.tally.exec(out);
    const failed = (out.match(/^  FAIL  (.*)$/gm) || []).map((l) => l.replace(/^  FAIL {2}/, ""));
    /* THE SUITE'S OWN FOOT, not the shell's status. A `TypeError` inside an
       assertion ends the module while the tally reads clean, so a run that never
       printed its own tally is reported as -1 and never as 0. */
    console.log(`  RUN ${s.name}: ${f} FAIL line(s) (suite exit ${code}); the suite's OWN tally: ${
      tally ? `${tally[1]} pass, ${tally[2]} fail` : "*** NO TALLY LINE — the suite did not reach its own foot ***"}`);
    for (const l of failed.slice(0, 16)) console.log(`        FAILED: ${l}`);
    line.push(`${s.name} ${tally ? `${tally[1]}/${tally[2]}` : "-1/-1"}`);
  }
  SUMMARY.push(`${name}: ${line.join(" · ")}`);

  if (arm.file) {
    fs.copyFileSync(pristine, arm.file);
    const after = sha(arm.file);
    const bytes = fs.statSync(arm.file).size;
    let cmpOk = true;
    try { execFileSync("cmp", ["-s", arm.file, pristine]); } catch (_) { cmpOk = false; }
    fs.rmSync(pristine);
    const good = after === before && cmpOk && bytes > 100000;
    console.log(`  restored: sha256 ${good ? "EQUAL" : "*** MISMATCH ***"} · cmp ${cmpOk ? "identical" : "*** DIFFERS ***"} · ${bytes} bytes`);
    if (!good) { console.error("  *** THE RESTORE DID NOT VERIFY — STOP AND INSPECT ***"); broke++; }
  }
}
console.log(`\n${"=".repeat(78)}`);
for (const s of SUMMARY) console.log(`  ${s}`);
console.log(broke ? `${broke} arm(s) FAILED TO ARM OR RESTORE — inspect before trusting anything above`
                  : "every arm armed and restored, verified by sha256 and cmp");
process.exit(broke ? 1 : 0);
