/* REC-88's NEGATIVE CONTROL HARNESS. Declared in `test/content-capture-bound.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec88.mjs             # every arm, in order, baseline first
 *     node test/nc-rec88.mjs nobound     # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it. `nc-rec83.mjs`'s shape, copied rather than imported for
 * that harness's own stated reason — a control harness that shares machinery
 * with another item's harness shares that harness's defects.
 *
 * THIS HARNESS ADDS ONE THING TO REC-83's, and it is the reason arm (b) exists
 * in the shape it does: `mustStayGreen` is CHECKED rather than described. REC-83
 * declared its held-open half in prose and its own first run found an arm that
 * ALSO broke its declared held-open assertion, caught only by reading the
 * output by hand. Here the held-open list is a list of assertion labels and the
 * verdict fails if any of them is among the failures — so "the arm is measuring
 * the bound and not the pin" is an assertion this harness makes, not a claim it
 * repeats.
 *
 * THE RULES, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing — the only row that distinguishes
 *     five-arms-broken from five-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count; a count that
 *     is not exactly 1 is a FINDING, never a retry).
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used: it restores to HEAD, not to what
 *     was there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 *
 * NOTE ON `textchain.mjs`: arm (d) patches it and restores it byte-identically,
 * verified by sha256 and by cmp. This item EDITS no byte of that module — the
 * four `captureBound` assertions in `textchain.test.mjs` are untouched and the
 * row said `delete nothing`. Driving a module is not editing it, and the
 * restore is measured rather than asserted.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* The pristine copies live INSIDE this worktree, in a DOT-directory so neither
   the battery's discovery nor the fleet walk can enrol what it holds — and never
   in the shared scratchpad, which is NOT isolated between sessions. */
const SAFE = join(REPO, ".rec88-control-pristine");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const TEXTCHAIN = join(PLANE, "src/textchain.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // store.mjs is over a megabyte; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE-like buffer
   and not a pipe the child can lose — D-282: a suite that calls process.exit()
   discards unflushed PIPE writes, and a control whose tally reads -1 because of
   it reports the wrong arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/content-capture-bound.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) passed, (\d+) failed/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

/* The one line this item added to the capture arm, quoted once so three arms
   patch the SAME anchor and a drift in it shows up as "matched 0×" rather than
   as an arm quietly measuring nothing. */
const BOUND_CALL = `      const b = captureBound(chain, EARNED_CAPTURE_CEILING);`;

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes five-arms-broken from five-arms-working",
    mustFail: [], mustStayGreen: [], mustPass: "everything",
    patch: () => ({ armed: true, matches: 0 }),
  },
  nobound: {
    files: [STORE],
    why: "THE ITEM'S OWN ARM — compute the bound and THROW IT AWAY, returning the capture axis to "
       + "exactly what it answered before this item (EARNED_CAPTURE_CEILING for every document the "
       + "record holds bytes of). This is D-349 restored: `captureBound` present, correct, and asked "
       + "by nobody",
    mustFail: ["THE ITEM: capture grade B on a document this plane OCR'd at C is REFUSED, by name",
               "and the refusal NAMES BOTH LETTERS and the measured fidelity",
               "and it names the DOCTRINE rather than only the number",
               "the entry is PRESENT with a NULL grade",
               "it carries the CODE, so a surface branches on a value rather than parsing prose",
               "a leg claiming ANY letter on an unmeasured transcription is REFUSED, by name",
               "the read reports the BOUND letter and its code",
               "THE PAIR: the letter the read reports is exactly the letter the write accepted",
               "BOTH DIRECTIONS AT ONCE",
               "THE ITEM: the sentence names the UNMEASURED FIDELITY"],
    /* THE HELD-OPEN HALF, AND IT IS THE WHOLE POINT OF THIS ARM: if disabling
       the bound also moved what a PUBLISHER-TYPED document earns, this suite
       would be measuring the capture arm as a whole rather than the bound. */
    mustStayGreen: ["and its entry is BYTE-IDENTICAL to what the PRISTINE pre-item tree printed",
                    "STRUCTURAL: it gained not one key",
                    "and a leg claiming B on it LANDS, exactly as it always has",
                    "a captured document the record has NEVER READ earns the ceiling"],
    mustPass: "every publisher-typed arm in section 5 — the digest pin, the key list and the landing leg",
    patch: () => arm(STORE, BOUND_CALL, `      const b = EARNED_CAPTURE_CEILING;`),
  },
  nocheck: {
    files: [CHECKS],
    why: "neuter the CEILING COMPARISON in `checkEarnedLeg`, leaving the registry computing the bound "
       + "correctly and the write path refusing nothing. The read and the write are two separate "
       + "defences and this arm is what proves it: a suite whose read and write arms fall together "
       + "cannot say which one is enforcing",
    mustFail: ["THE ITEM: capture grade B on a document this plane OCR'd at C is REFUSED, by name",
               "and the refusal NAMES BOTH LETTERS and the measured fidelity",
               "and it names the DOCTRINE rather than only the number",
               "so a leg claiming A on it is still refused",
               "THE PAIR: the letter the read reports is exactly the letter the write accepted"],
    /* The UNDETERMINED refusal goes through this item's OWN arm and not through
       the ceiling comparison, so it must survive — which is the two refusals
       being two rather than one wearing two labels. */
    mustStayGreen: ["a leg claiming ANY letter on an unmeasured transcription is REFUSED, by name",
                    "and the refusal says UNDETERMINED",
                    "the read reports the BOUND letter and its code",
                    "and its entry is BYTE-IDENTICAL to what the PRISTINE pre-item tree printed"],
    mustPass: "every READ assertion, and the undetermined refusal, which is a different arm",
    patch: () => arm(CHECKS,
      `    if (BASIS_GRADES.indexOf(leg.grade) < BASIS_GRADES.indexOf(earned.grade)) {`,
      `    if (false) {`),
  },
  undetpass: {
    files: [TEXTCHAIN],
    why: "make an UNDETERMINED fidelity pass the byte grade through, which is the simplification "
       + "`captureBound`'s own comment warns about by name — it would let an unmeasured engine's "
       + "output ride a direct capture's B. RESTORED BYTE-IDENTICALLY; this item edits no byte of "
       + "textchain.mjs",
    mustFail: ["the entry is PRESENT with a NULL grade",
               "it carries the CODE, so a surface branches on a value rather than parsing prose",
               "and it NAMES THE EMPTY LEVEL",
               "a leg claiming ANY letter on an unmeasured transcription is REFUSED, by name",
               "and the refusal says UNDETERMINED",
               "THE ITEM: the sentence names the UNMEASURED FIDELITY"],
    mustStayGreen: ["THE ITEM: capture grade B on a document this plane OCR'd at C is REFUSED, by name",
                    "the read reports the BOUND letter and its code",
                    "and its entry is BYTE-IDENTICAL to what the PRISTINE pre-item tree printed"],
    mustPass: "every MEASURED-fidelity arm — the C document is bounded exactly as before",
    patch: () => arm(TEXTCHAIN,
      `  if (cap == null) return null;`,
      `  if (cap == null) return byteGrade;`),
  },
  raise: {
    files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION, INVERTED — let the FIDELITY set the letter outright instead "
       + "of taking the weaker of the two, so a chain measured at A would RAISE the capture axis "
       + "above the byte ceiling. DEC-4's rule is a MINIMUM and 'OCR never raises a capture grade' is "
       + "the half a reader is most likely to assume rather than check",
    mustFail: ["a transcription measured at A does NOT raise the capture axis above the byte ceiling",
               "and it gains no bounded_by code",
               "so a leg claiming A on it is still refused",
               "BOTH DIRECTIONS AT ONCE",
               "the entry is PRESENT with a NULL grade",
               "a leg claiming ANY letter on an unmeasured transcription is REFUSED, by name",
               "THE ITEM: the sentence names the UNMEASURED FIDELITY"],
    mustStayGreen: ["THE ITEM: capture grade B on a document this plane OCR'd at C is REFUSED, by name",
                    "and the SAME leg at C lands",
                    "and its entry is BYTE-IDENTICAL to what the PRISTINE pre-item tree printed"],
    mustPass: "the fidelity-weaker direction, which this arm leaves alone — a C document is still C",
    patch: () => arm(STORE, BOUND_CALL,
      `      const b = isTranscribed(chain) ? (derivationCap(chain) ?? EARNED_CAPTURE_CEILING) : EARNED_CAPTURE_CEILING;`),
  },
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST GREEN ${a.mustStayGreen.length ? a.mustStayGreen.join(" | ") : "(nothing — baseline)"}`);
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
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  const r = runSuite();
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
  /* Restore, and MEASURE the restore. */
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  /* The declared verdict, checked — BOTH halves. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const broke = a.mustStayGreen.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length && broke.length === 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, `
      + `${broke.length} held-open assertion(s) ALSO broken, ${r.fail} total failing`);
    if (!ok) {
      finding++;
      for (const m of a.mustFail.filter((x) => !r.failing.some((l) => l.includes(x))))
        console.log(`  MISSING    declared failure did NOT occur: ${m}`);
      for (const m of broke)
        console.log(`  HELD-OPEN  an assertion declared to stay green FAILED: ${m}`);
    }
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
