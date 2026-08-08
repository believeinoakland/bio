/* REC-69 — THE NEGATIVE CONTROLS FOR `op=airuns`, RUN.
 *
 * `node test/airuns.control.mjs` from `bio-plane/`.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so
 * neither `scripts/battery.mjs` (which discovers `*.test.mjs`) nor the fleet
 * walk must collect it — PL-3/PL-4/PL-11/PL-15/FL-3's precedent.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS DRIVER DOES THAT A HAND-RUN ARM DOES NOT, and every one of these is
 * a failure some control in this repository has actually had:
 *
 *   A BASELINE ROW RUNS FIRST. A harness whose first run reported `null` for
 *   every arm INCLUDING the baseline is on record here; without a baseline row,
 *   six arms failing for a reason unrelated to their subject reads exactly like
 *   six arms working.
 *
 *   EVERY ARM DECLARES ITS EXPECTATION BEFORE IT RUNS — must-fail or
 *   must-not-fail — and the driver compares the declaration against what
 *   happened. A control that can only report "it went red" cannot tell an arm
 *   that armed from an arm that never did.
 *
 *   EVERY MUTATION IS ANCHOR-GUARDED: the anchor must appear EXACTLY ONCE, and
 *   the file's bytes must actually CHANGE. An arm that never armed and a silent
 *   no-op (`[].concat([...])`, which keeps every element) have both happened
 *   here inside instruments built to prevent exactly that.
 *
 *   EVERY ARM IS ARMED ALONE with every other held open, and EVERY RESTORE is
 *   verified by sha256 AND by `cmp` against a PRISTINE pre-arm copy named
 *   UNIQUELY PER ARM.
 *
 *   THE NAMED-FAILURE CHECK. An arm that must fail must fail in the suite this
 *   driver names, and for arms 1, 2 and 5 the failing text must NAME the op or
 *   the run it leaked — a red run is not evidence that the right thing broke.
 * ------------------------------------------------------------------------- */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const STORE = join(PLANE, "src/store.mjs");
/* INSIDE THIS WORKTREE, never /tmp: a harness writing outside the tree is a
   harness two concurrent workers can share by accident, and this session has
   already had one scratchpad file written by another checkout mid-run. */
const SAFE = join(PLANE, ".rec69-control");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const runSuites = (names) => {
  let out = "";
  try {
    out = execFileSync("node", ["scripts/battery.mjs", ...names],
      { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (e) { out = (e.stdout || "") + (e.stderr || ""); }
  const per = new Map();
  for (const L of out.split("\n")) {
    const x = /^\s+(?:ok|FAIL)\s+(\S+)\s+\d+ms\s+(\d+) pass(?:, (\d+) FAIL)?/.exec(L);
    if (x) per.set(x[1], { pass: +x[2], fail: x[3] ? +x[3] : 0 });
  }
  const failed = [...per].filter(([, v]) => v.fail > 0).map(([k]) => k);
  return { out, per, failed, anyFail: failed.length > 0 };
};

const SUITES = ["airuns", "bounds", "meaning-bounds", "gate-reads"];

/* THE NAMED-FAILURE CHECK RUNS THE SUITE DIRECTLY, and that correction is a
   finding rather than a tidy-up. The first draft searched `battery.mjs`'s
   output, which prints a failing assertion's LABEL and NOT its `want`/`got` —
   so ARMS 1 and 2 reported *"no failing line NAMES RUN-r69-other"* against arms
   that had leaked exactly that run and printed it. The arms were right and the
   CHECK was blind, which is this repository's most-repeated shape: a control
   finding the instrument wrong rather than the subject. */
const runOne = (file) => {
  try { return execFileSync("node", [`test/${file}`], { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { return (e.stdout || "") + (e.stderr || ""); }
};

/* ---------------------------------------------------------- THE ARMS.
   Each: an anchor that must appear EXACTLY ONCE in store.mjs, what it becomes,
   whether the run MUST fail, and — where it matters — which suite must name it
   and what text must appear. */
const ARMS = [
  { id: "1", name: "DROP THE CONTEXT FILTER — a run in ANOTHER context appears",
    must: "FAIL",
    anchor: "WHERE lower(r.context_type) = ? AND r.context_id = ? AND ${seen.sql}",
    become: "WHERE (1=1 OR lower(r.context_type) = ?) AND (1=1 OR r.context_id = ?) AND ${seen.sql}",
    inSuite: "airuns.test.mjs",
    names: ["RUN-r69-other"] },

  /* ARM 2 AND ITS FINDING, which is the most useful thing this driver produced
     and it CORRECTED THE ARM'S OWN DECLARATION rather than the other way round.
     The arm was declared as *"the uninvited member receives the secret
     project's run"*. IT DOES NOT — and that is a fact about the design, not a
     weak control: the outer statement is gated AND every row is composed by
     `aiRunRead`, which compiles the SAME gate again, so dropping the outer one
     leaves the rows still withheld. **What the outer gate protects is the
     COUNT.** With it gone, an uninvited member asking for one row of a context
     holding two runs he may not see is told `truncated: true` — the withheld
     count arriving as a boolean, which is op=backlinks' no-count rule broken by
     a flag. So the arm now declares what it actually breaks and requires the
     TRUNCATION assertion to be the one that fails.
     AND THE FIXTURE HAD TO GROW FOR IT TO ARM AT ALL: with ONE hidden run,
     `page.length (1) > cap (1)` is false either way and this arm passed over a
     fixture that could not set the flag. A second hidden run was added, with
     the reason written at the fixture. */
  { id: "2", name: "DROP THE VIEWER GATE from the outer statement — the withheld COUNT leaks as `truncated`",
    must: "FAIL",
    anchor: "AND r.context_id = ? AND ${seen.sql}",
    become: "AND r.context_id = ? AND (1=1 OR ${seen.sql})",
    inSuite: "airuns.test.mjs",
    text: ["THE BOUND IS APPLIED BEHIND THE GATE"] },

  /* THE REDACT ARM IS A TWO-PART MUTATION, and the reason is worth stating
     because the FIRST draft of it PASSED and the pass was a finding about the
     arm rather than a clean bill for the suite. Nulling the context of a
     `found:false` row changes nothing while the outer query is gated: no such
     row survives to be composed, so the "redaction" ran over an empty set —
     "a control that passed while asserting nothing", one more time. To make
     the redact POSTURE reachable at all the gate must come off the outer query
     AND the stub must be emitted, so that is what this arm does. */
  { id: "3", name: "REDACT INSTEAD OF WITHHOLD — the invisible row STANDS with its context nulled (REC-36's other posture)",
    must: "FAIL",
    anchor: "AND r.context_id = ? AND ${seen.sql}\n       ORDER BY r.created DESC, r.run LIMIT ?`,\n      type, id, ...seen.args, cap + 1);",
    become: "AND r.context_id = ? AND (1=1 OR ${seen.sql})\n       ORDER BY r.created DESC, r.run LIMIT ?`,\n      type, id, ...seen.args, cap + 1);",
    also: { anchor: "      .filter((a) => a && a.found).map((a) => a.session);",
            become: "      .map((a) => (a && a.found) ? a.session : { id: null, label: null, status: null, context: { type: null, id: null } });" },
    inSuite: "airuns.test.mjs" },

  /* THE ANCHOR IS THE WHOLE RETURN TAIL AND NOT THE ONE LINE, because
     `limit: cap, truncated: page.length > cap,` appears TWICE in store.mjs —
     `aiRunLog` carries the identical line. The first draft used the short
     anchor and the driver refused to arm, reporting `ANCHOR NOT UNIQUE (2)`.
     That refusal is the guard working: a control that had silently mutated the
     FIRST match would have measured `op=airunlog` while claiming to measure
     this one. */
  { id: "4", name: "DROP THE PUBLISHED BOUND — the cap is applied and never stated",
    must: "FAIL",
    anchor: "      runs, count: runs.length,\n      limit: cap, truncated: page.length > cap,",
    become: "      runs, count: runs.length,\n      truncated: page.length > cap,",
    inSuite: "bounds.test.mjs",
    names: ["airuns"] },

  { id: "5", name: "ANSWER A BARE COLLECTION — the ZERO-bare-array pin must fail NAMING the op",
    must: "FAIL",
    anchor: "    return {\n      ok: true,\n      /* The context is echoed NORMALISED",
    become: "    return runs;\n    // eslint-disable-next-line no-unreachable\n    return {\n      ok: true,\n      /* The context is echoed NORMALISED",
    inSuite: "bounds.test.mjs",
    names: ["airuns"] },

  { id: "6", name: "OVER-STRICTNESS TEETH — match the context kind CASE-SENSITIVELY, refusing a run the record plainly holds",
    must: "FAIL",
    anchor: "WHERE lower(r.context_type) = ?",
    become: "WHERE r.context_type = ?",
    inSuite: "airuns.test.mjs" },

  { id: "7", name: "MUST-NOT-FAIL — a behaviour-preserving edit inside the same method leaves everything GREEN",
    must: "PASS",
    anchor: "    const kinds = Object.keys(RUN_CONTEXTS);",
    become: "    const kinds = Object.keys(RUN_CONTEXTS).slice();",
    inSuite: null },
];

/* ------------------------------------------------------------------ run it */
if (existsSync(SAFE)) rmSync(SAFE, { recursive: true });
mkdirSync(SAFE, { recursive: true });

console.log("REC-69 · NEGATIVE CONTROLS — every arm ALONE, every restore proved\n");

/* THE BASELINE ROW. Without it, an arm failing for a reason unrelated to its
   subject is indistinguishable from an arm working. */
const base = runSuites(SUITES);
console.log(`BASELINE   ${base.anyFail ? "RED" : "GREEN"}  · `
  + [...base.per].map(([k, v]) => `${k} ${v.pass}/${v.fail}`).join(" · "));
if (base.anyFail) {
  console.error("BASELINE IS RED — every arm below would be measuring something else. Stopping.");
  process.exit(2);
}

let wrong = 0;
for (const arm of ARMS) {
  const pristine = join(SAFE, `arm${arm.id}-store.mjs`);   // named UNIQUELY per arm
  copyFileSync(STORE, pristine);
  const before = sha(STORE);
  const src = readFileSync(STORE, "utf8");

  /* ANCHOR GUARD — exactly once, or the arm never armed. */
  const parts = [arm.anchor, ...(arm.also ? [arm.also.anchor] : [])];
  const bad = parts.filter((p) => src.split(p).length - 1 !== 1);
  if (bad.length) {
    console.log(`ARM ${arm.id}  ANCHOR NOT UNIQUE (${bad.map((p) => src.split(p).length - 1).join(",")} hit(s)) `
      + `— THE ARM NEVER ARMED. ${arm.name}`);
    wrong++; continue;
  }
  let mutated = src.replace(arm.anchor, arm.become);
  if (arm.also) mutated = mutated.replace(arm.also.anchor, arm.also.become);
  writeFileSync(STORE, mutated);
  if (sha(STORE) === before) {
    console.log(`ARM ${arm.id}  BYTES DID NOT CHANGE — a silent no-op. ${arm.name}`);
    copyFileSync(pristine, STORE); wrong++; continue;
  }

  const r = runSuites(SUITES);
  const got = r.anyFail ? "FAIL" : "PASS";
  let named = true, why = "";
  if (arm.must === "FAIL" && r.anyFail) {
    if (arm.inSuite && !r.failed.includes(arm.inSuite)) { named = false; why = `expected ${arm.inSuite} to fail; failed: ${r.failed.join(", ")}`; }
    if ((arm.names || []).length || (arm.text || []).length) {
      /* The suite's OWN output, not the battery's summary — see `runOne`. */
      const full = runOne(arm.inSuite);
      const block = full.split("\n");
      for (const n of arm.names || []) {
        const hit = block.some((L, i) =>
          L.includes(n) && block.slice(Math.max(0, i - 3), i + 1).some((x) => /\bFAIL\b/.test(x)));
        if (!hit) { named = false; why += ` · no failing assertion NAMES "${n}"`; }
      }
      /* WHICH assertion failed, not merely that one did. An arm that breaks
         something real by accident and something else on purpose reads exactly
         like an arm that worked. */
      for (const s of arm.text || []) {
        const hit = block.some((L) => /\bFAIL\b/.test(L) && L.includes(s));
        if (!hit) { named = false; why += ` · the failing assertion is not the one containing "${s}"`; }
      }
    }
  }
  const ok = got === arm.must && named;
  if (!ok) wrong++;
  console.log(`ARM ${arm.id}  declared ${arm.must}  got ${got}  ${ok ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`
    + `  · failing suites: ${r.failed.length ? r.failed.join(", ") : "none"}${why ? ` · ${why}` : ""}`);
  console.log(`         ${arm.name}`);

  /* RESTORE, AND PROVE IT — sha256 AND cmp, against this arm's OWN copy. */
  copyFileSync(pristine, STORE);
  const same = sha(STORE) === before;
  let cmpOk = true;
  try { execFileSync("cmp", [STORE, pristine]); } catch { cmpOk = false; }
  console.log(`         RESTORE ${same && cmpOk ? "OK" : "*** BAD ***"} · sha256 ${same ? "match" : "DIFFER"} · cmp ${cmpOk ? "identical" : "DIFFER"}`);
  if (!same || !cmpOk) { console.error("RESTORE FAILED — stopping."); process.exit(2); }
}

/* THE CLOSING BASELINE. The tree must be exactly where it started, proved by
   running rather than by having restored. */
const end = runSuites(SUITES);
console.log(`\nCLOSING BASELINE  ${end.anyFail ? "RED" : "GREEN"}  · `
  + [...end.per].map(([k, v]) => `${k} ${v.pass}/${v.fail}`).join(" · "));
const identical = [...base.per].every(([k, v]) => end.per.get(k)?.pass === v.pass);
console.log(`  identical to the opening baseline: ${identical}`);
rmSync(SAFE, { recursive: true });
console.log(`\nairuns.control: ${ARMS.length} arm(s), ${wrong} NOT AS DECLARED`);
process.exit(wrong || end.anyFail || !identical ? 1 : 0);
