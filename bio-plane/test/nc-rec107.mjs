/* REC-107's NEGATIVE CONTROL HARNESS. Declared in `test/observation-meaning.test.mjs`
 * section H and `test/observation-content.test.mjs` section H, run from `bio-plane/`
 * in one step:
 *
 *     node test/nc-rec107.mjs              # every arm, in order, baseline first
 *     node test/nc-rec107.mjs weakdefault  # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec93.mjs` / `nc-rec94.mjs` / `nc-rec95.mjs` /
 * `nc-rec109.mjs` precedent).
 *
 * IT IS `nc-rec95.mjs`'s HARNESS WITH THIS ITEM'S ARMS, deliberately and without
 * improvement — a second harness of one shape is the drift this repository keeps
 * measuring — WITH ONE STRUCTURAL CHANGE THAT IS THIS ITEM'S OWN: **it runs BOTH
 * suites on every arm.** This item swept a class across two levels, and a driver
 * that ran only the rowed level's suite could not have told a fix that closed one
 * level from a fix that entangled them. The orthogonality claim is the arms'
 * `mustPass` and it is CHECKED rather than asserted in prose.
 *
 * WHAT EVERY ARM HERE IS POINTED AT. The defect this item closed is a published
 * ENUMERATION of the causes a missing row could not be narrowed to, which had two
 * members where the live set has three. **It is an overclaim that no existing
 * assertion could see**: 57 assertions in the meaning suite and 63 in the content
 * suite were green over it and stayed green when it was fixed, because every one
 * of them asserted which LIST a subject landed in or which CAUSE WORD it carried,
 * and none asserted on the CONTENT of the undetermined set. So the arms below
 * plant narrowings of that set and the sections that must catch them are section
 * H at both levels — which did not exist when the defect shipped, and which is
 * the whole of what this control is proving.
 *
 * WHAT THESE ARMS CANNOT SEE, stated rather than left to be discovered. Every arm
 * is a source-level mutation inside this plane, driven against a store these two
 * suites built in-process. **No arm here reaches a genuinely PRE-LOG corpus**,
 * because neither suite can register a subject before the observation log's first
 * row at its own level — so the `purged` cause is driven at a REFERENCE (through
 * the null-`entered` path `#missingMeaningCause`'s own guard exists for) and on
 * the PURE RULE for every other kind, and no arm exercises a real instance whose
 * captures predate the table. That is the same window this item concluded cannot
 * be closed, so the control shares the subject's limit rather than covering it.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("rec107");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const AIRUN = join(PLANE, "src/airun.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 10000;   /* store.mjs is over two megabytes and airun.mjs tens of KB;
                              a restore over a stub must fail loudly rather than quietly. */

/* BOTH SUITES, EVERY ARM — see the header. Captured to a FILE-backed buffer and
   not a pipe the suite can outlive (D-282: a suite that calls process.exit()
   discards unflushed PIPE writes, and a control whose tally reads -1 because of
   it reports the wrong arm as wrong). */
const SUITES = ["test/observation-meaning.test.mjs", "test/observation-content.test.mjs"];

const runSuites = () => {
  let pass = 0, fail = 0, exit = 0;
  const failing = [];
  for (const suite of SUITES) {
    const r = spawnSync(process.execPath, [suite],
      { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const out = `${r.stdout || ""}${r.stderr || ""}`;
    /* `-?\d+` AND NOT `\d+`. Both suites print `-1 pass` when their own foot guard
       did not fire, which is WORKER.md's rule that a missing tally is reported as
       -1 and never as 0. An unsigned pattern matches the `1` inside `-1`, so a
       driver using one reads a suite that DIED EARLY as a suite that passed one
       assertion — `nc-rec94.mjs` paid for that on its first run and this harness
       inherits the fix rather than re-paying for it. */
    const m = /(-?\d+) pass, (-?\d+) fail/.exec(out);
    const p = m ? +m[1] : -1, f = m ? +m[2] : -1;
    /* A -1 TALLY IS NOT ADDED TO A RUNNING TOTAL, because -1 pass and 1 fail sum
       to a number that reads like a small healthy run. A suite that did not reach
       its foot poisons the whole arm's verdict and says so by name. */
    if (p < 0 || f < 0) failing.push(`${suite}: DID NOT REACH ITS FOOT (tally -1)`);
    pass += Math.max(p, 0); fail += Math.max(f, 0) + (p < 0 || f < 0 ? 1 : 0);
    exit = exit || r.status;
    /* THE THROW IS CARRIED OUT WITH THE FAILURES, because an arm whose suite DIED
       tells a completely different story from one whose assertions went red, and a
       driver that prints only `FAIL` lines makes the two look alike. */
    for (const l of out.split("\n"))
      if (l.includes("FAIL  ") || l.includes("THREW")) failing.push(l.trim());
  }
  return { pass, fail, exit, failing };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  if (ANCHOR_DRY) return (anchorPatch(file, find, replace), { armed: true, matches: 1 });   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], expectGreen: true,
    why: "nothing armed — the row that distinguishes six-arms-broken from six-arms-working",
    mustFail: [], mustPass: "everything, at BOTH levels", patch: () => ({ armed: true, matches: 0 }),
  },

  /* THE ROW'S OWN CONTROL, AND IT RESTORES THE SHIPPED DEFECT EXACTLY. Drop
     `never_looked` from the TWO-SIDED set and the answer goes back to claiming
     what the old sentence claimed: *a look happened, or a purge hid one* — over a
     subject nobody may ever have looked at. It is the overclaim direction and it
     is the whole reason this row was weighed as it was. */
  never: {
    files: [AIRUN],
    why: "drop `never_looked` from the two-sided undetermined set, restoring the shipped claim that "
       + "a subject with no row and no evidence was either looked at before the log or purged",
    mustFail: ["H1: THE PURE RULE",
               "H4: AND THE TWO-SIDED SET IS TWO AND NOT THREE"],
    /* THE ORTHOGONALITY PAIR, and it is the one that matters here: this arm must
       NOT move the one-sided answers. If H2, H7 or H8 go red, the two branches of
       `causesNotRuledOut` are entangled and the sidedness is not doing the work it
       is published as doing. */
    mustPass: "H2, H4 and H7/H8 in the meaning suite — every one-sided answer, which this arm does "
            + "not touch — and every arm in either suite about a RESOLVED cause. A `pre_log` or a "
            + "`never_looked` row is a set of one and cannot move here",
    patch: () => arm(AIRUN,
      `  if (evidenceOneSided === false) return ["purged", "never_looked"];`,
      `  if (evidenceOneSided === false) return ["purged"];`),
  },

  /* THE SECOND HALF OF THE SAME DEFECT, at the other kind. Collapse the one-sided
     widening onto the two-sided answer and a reference or an entity claims its
     evidence could have narrowed the set — which is exactly the state the
     top-level `evidence_one_sided` map was published to WARN about and which a
     caller who did not join it already read. */
  onesided: {
    files: [AIRUN],
    why: "collapse the ONE-SIDED widening onto the two-sided set, so a reference or an entity "
       + "claims a pre-log fruitless look is excluded when its evidence can never exclude one",
    /* CORRECTED AFTER THE FIRST RUN. `H5` WAS DECLARED MUST-FAIL AND CAME BACK
       GREEN, and the ARM WAS RIGHT WHILE THE DECLARATION WAS WRONG — the
       direction this repository keeps finding, recorded rather than tidied away.
       H5 drives an UNRECOGNISED CAUSE WORD, which returns from
       `if (missingCause !== "purged")` one line ABOVE the wide return this arm
       patches, so this mutation cannot reach it. That is a fact about the
       function having TWO wide exits for two different reasons, which is worth
       knowing: the unrecognised-cause exit is load-bearing on its own and is
       armed by nothing here. Declared 3, and H5 moved to `mustPass`. */
    mustFail: ["H2: and at a ONE-SIDED kind it is ALL THREE",
               "H3: THE WEAKEST-CLAIM DEFAULT",
               "H8: and at a ONE-SIDED subject kind"],
    mustPass: "EVERY arm in `observation-content.test.mjs` — that level is two-sided and takes the "
            + "other branch, so if the content suite moves at all the two levels are entangled and "
            + "the shared function is not shared, it is coupled. H1 and H4 in the meaning suite too, "
            + "and H5, which exits one line above this patch and is armed by nothing here",
    patch: () => arm(AIRUN,
      `  return [...ALL_MISSING_ROW_CAUSES];\n}`,
      `  return ["purged", "never_looked"];\n}`),
  },

  /* THE QUIET ONE, AND THE ARM THIS CONTROL EXISTS FOR. Every arm above is loud —
     a declared kind gets a visibly wrong set. This one leaves every DECLARED kind
     answering correctly and changes only what an UNDECLARED kind inherits, by
     rewriting `=== false` to a falsy test. `undefined` then takes the STRONG
     branch, so a fourth subject kind somebody adds without declaring its sidedness
     silently claims two-sided evidence it has never been measured to have.
     **Nothing about the code looks wrong with this applied**, every existing arm
     about capture / reference / entity stays green, and it is precisely the defect
     the spelling exists to prevent. It is also live rather than hypothetical:
     `OBSERVATION-LOG-DESIGN.md` §8's fourth item is being built as this lands. */
  weakdefault: {
    files: [AIRUN],
    why: "rewrite the weakest-default predicate from `=== false` to a falsy test, so an UNDECLARED "
       + "sidedness inherits the STRONG two-member answer by omission instead of the weak one",
    mustFail: ["H3: THE WEAKEST-CLAIM DEFAULT"],
    mustPass: "EVERYTHING ELSE, at both levels — every declared subject kind still answers exactly "
            + "as before, which is what makes this defect invisible and what makes H3 the only "
            + "instrument that can see it. If a second arm goes red, this patch took something "
            + "besides the default and the finding is about the ARM",
    patch: () => arm(AIRUN,
      `  if (evidenceOneSided === false) return ["purged", "never_looked"];`,
      `  if (!evidenceOneSided) return ["purged", "never_looked"];`),
  },

  /* THE PUBLICATION HALF, held apart from the RULE half on purpose. The rule can
     be perfectly right and reach no caller: that is the state this item found, in
     which the widening existed as a top-level map and the row said nothing. This
     arm removes the per-row fields and leaves the pure rule untouched. */
  rowfield: {
    files: [STORE],
    why: "stop publishing `not_ruled_out` and `evidence_one_sided` ON THE ROW, leaving the rule "
       + "correct and unreachable — the state this item found, where the limit sat beside the rows "
       + "and a caller had to remember to join it",
    /* CORRECTED AFTER THE FIRST RUN, AND THE CORRECTION WAS TO THE SUITE RATHER
       THAN TO THE DECLARATION. On its first run this arm did not produce four
       reds: it KILLED BOTH SUITES with `TypeError: Cannot read properties of
       undefined`, tallies -1 and -1. Removing the field made four of this item's
       own assertions dereference `.length` and `.every` on `undefined`, and a
       TypeError inside an assertion goes through NO assertion at all — it ends
       the module while the tally reads clean. **The control found the defect in
       this item's INSTRUMENT, which is where WORKER.md says controls find them
       most often, and it found it in the arms written to catch an overclaim.**
       Every dereference in section H at both levels is now guarded by
       `Array.isArray`, so removing the field produces a clean RED at each arm
       instead of a death that reports nothing. Declared below is the set that
       arms AFTER that fix. */
    mustFail: ["H7: THE DEFECT THIS ROW CLOSED",
               "H8: and at a ONE-SIDED subject kind",
               "H9: `not_ruled_out` IS TOTAL",
               "H2: `not_ruled_out` IS TOTAL over both published lists",
               "H3: A `never_looked` ROW CARRIES THE ONE-MEMBER SET"],
    mustPass: "every PURE-RULE arm — H1 to H6 in the meaning suite and H4 in the content suite. "
            + "They call `causesNotRuledOut` directly and this arm does not touch it; if one moves, "
            + "the rule and its publication are entangled",
    patch: () => arm(STORE,
      `    return {\n      evidence_one_sided: oneSided !== false,\n      not_ruled_out: causesNotRuledOut(missingCause, { evidenceOneSided: oneSided }),\n    };`,
      `    return {};`),
  },

  /* THE PROSE, ARMED SEPARATELY FROM THE SET. The sentence and the set are two
     claims about one fact and either can be wrong alone — this item found the
     sentence asserting a two-member set while the map beside it said three. */
  prose: {
    files: [AIRUN],
    why: "restore the two-member assertion in the meaning level's `purged` sentence, so the prose "
       + "claims a set the row's own field contradicts",
    mustFail: ["H10: AND THE PROSE STOPPED ASSERTING A SET IT CANNOT ASSERT"],
    mustPass: "every arm about the SET itself, at both levels — the fields are computed and this "
            + "arm rewrites only a canned string. A set arm going red here means the sentence is "
            + "load-bearing for a value, which it must never be",
    patch: () => arm(AIRUN,
      `              + "may have cleared the rows that described it, or nobody may have looked -- and at a "`,
      `              + "may have cleared the rows that described it. Neither can be ruled out -- and at a "`),
  },

  /* ARMED AS AN OVER-STRICTNESS ARM AND IT CAME BACK RED, AND THE ARM WAS RIGHT.
     Declared: *a legitimately declared fourth subject kind must not go red.* It
     went red on `A4` — REC-95's assertion, not this item's — which pins
     `MEANING_EVIDENCE_IS_ONE_SIDED` by its exact key set.
     **THE FINDING IS THAT THIS IS CORRECT STRICTNESS RATHER THAN OVER-STRICTNESS,
     and the distinction is the whole point of the arm.** A subject kind's
     sidedness is a MEASUREMENT — whether that kind's evidence table holds a row
     when the answer was no — and `address: false` asserts a measurement nobody
     took. A4 refusing it is the suite refusing an unmeasured claim about the
     record's own coverage, which is this project's first rule. So the
     DECLARATION was wrong and is corrected here rather than the assertion being
     loosened: an exempted test is a rule nobody is enforcing.
     WHAT IT MEANS FOR THE NEXT ITEM, and it is live: a level adding a subject
     kind declares its sidedness in its OWN map and measures it, and if anyone
     widens THIS map they will be stopped here and made to say why. */
  extrakey: {
    files: [AIRUN],
    why: "add an UNMEASURED fourth subject kind to the meaning level's sidedness map — declared as "
       + "an over-strictness arm, and RED is the correct answer",
    mustFail: ["A4: THE ONE-SIDED EVIDENCE"],
    mustPass: "everything else at both levels, including all of section H — which reads the map the "
            + "code publishes rather than pinning three kinds by name, so it is indifferent to a "
            + "fourth. A section-H red here would mean this item's own arms had hardcoded the kinds",
    patch: () => arm(AIRUN,
      "  entity:    true,    /* `connections` holds a row only where a pair was DERIVED */",
      "  entity:    true,    /* `connections` holds a row only where a pair was DERIVED */\n"
      + "  address:   false,   /* ARMED: an UNMEASURED fourth kind */"),
  },

  /* THE ACTUAL OVER-STRICTNESS ARM, rebuilt after the one above turned out to be
     a correctness arm. The CONTENT level's sidedness map is not pinned by key
     set, and a level gaining a kind is exactly what `OBSERVATION-LOG-DESIGN.md`
     §8's fourth item does while this lands. Nothing may go red: if either
     section H keys off a hardcoded list rather than off the published map, this
     is where it says so — and the next item would land into a suite that refused
     it for being NEW rather than for being wrong. */
  extrakey_content: {
    files: [AIRUN], expectGreen: true,
    why: "add a declared kind to the CONTENT level's sidedness map — correct work in a spelling "
       + "neither suite anticipated, which must pass",
    mustFail: [],
    mustPass: "EVERYTHING, at both levels. This is the arm that proves section H reads the "
            + "published map instead of pinning the kinds it happened to be written against",
    patch: () => arm(AIRUN,
      "  capture: false,     /* `readings` holds a row whether or not text was produced */",
      "  capture: false,     /* `readings` holds a row whether or not text was produced */\n"
      + "  address: false,    /* ARMED: a declared kind this suite did not anticipate */"),
  },
};

anchorEach(ARMS, (a) => a.patch());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — this arm must stay GREEN)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  /* Pristine copies, UNIQUELY NAMED PER ARM, taken before the patch. */
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const before = saved.map((s) => s.sha);
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  /* AND THE BYTES REALLY CHANGED — a patch that matched once and wrote the same
     text back is an arm that did not arm while reporting that it did. */
  saved.forEach((s, i) => {
    const now = sha(s.f);
    if (name !== "baseline" && now === before[i]) {
      console.log(`  FINDING    ${s.f.replace(REPO + "/", "")} is byte-identical AFTER the patch — the arm changed nothing`);
      finding++;
    }
  });
  const r = runSuites();
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}  (both suites)`);
  for (const l of r.failing) console.log(`             ${l}`);
  /* Restore, and MEASURE the restore. */
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  /* The declared verdict, checked. An arm declared GREEN is checked the way the
     baseline is, because `mustFail: []` under the red-checking branch would be
     satisfied by zero declared failures being present in a run that failed for
     any reason at all — an arm that can be satisfied without arming. */
  if (a.expectGreen) {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
