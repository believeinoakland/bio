/* REC-111's NEGATIVE CONTROL HARNESS. Declared in `test/capture-text-index.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec111.mjs             # every arm, in order, baseline first
 *     node test/nc-rec111.mjs tighten     # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec91` / `nc-rec94` precedent).
 *
 * IT IS `nc-rec91.mjs`'s HARNESS WITH THIS ITEM'S ARMS, deliberately and without
 * improvement: a second harness of one shape is the drift this repository keeps
 * measuring, and the arms are the part that is this item's.
 *
 * TWO ARMS CARRY THIS ITEM AND THEY ARE NOT THE OVERFLOW ONE.
 *
 *  - `tighten` is the arm that decides REC-111 is SAFE TO SHIP. §4.3's own
 *    per-capture bound was not a limit that would merely have been too tight --
 *    LEFT ALONE IT WAS A REGRESSION, and M-20's census holds two real documents
 *    that promote today and would have stopped. So the control that matters is
 *    the one proving this suite can SEE a bound set too low: `tighten` picks a
 *    number a careless author might have picked and the over-strictness arms go
 *    red by name. Without it, G8's greens would be greens over a suite that
 *    cannot tell a safe bound from an unsafe one.
 *  - `pinoff` is the arm that justifies there being NO unit check at the acquire
 *    wire. The wire's unit ceiling (4,064) is a side effect of an ENVELOPE
 *    ESTIMATE, and the whole argument for stating it in a test rather than in a
 *    constant is that the test FIRES when the estimate moves. `pinoff` moves it.
 *    If this arm were green the wire would have no bound at all -- only a
 *    paragraph claiming one.
 *
 * WHAT THESE ARMS CANNOT SEE, stated rather than left to be discovered. Every
 * one is a source-level mutation inside this plane: no second instance, no real
 * network fetch, no real OCR engine, no `passage:` query (REC-92's, which does
 * not exist), no deployed Worker and therefore NO REAL CPU MEASUREMENT AT ALL.
 * Every millisecond this item reasons with is M-20's two-point fit applied to a
 * unit count, which is a PREDICTION and is labelled as one everywhere it is
 * used. An arm that made a promote genuinely exceed the invocation window is
 * outside this harness and outside miniflare.
 *
 * AND ONE ARM IS DELIBERATELY NOT HERE. There is no arm sending a capture over
 * the 13,720-unit ceiling of the caller-authored route, because `INLINE_MAX`
 * refuses the file first -- the same shape as REC-91's missing 2 MiB arm, one
 * bound over. It is recorded in M-35 rather than faked here.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("rec111");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 10000;   /* both files are hundreds of KB; a restore over a stub
                              must fail loudly rather than quietly. */

const runSuite = (file) => {
  const r = spawnSync(process.execPath, [file], { cwd: PLANE, encoding: "utf8",
                                                 maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  /* `-?\d+` AND NOT `\d+`. The suite prints `-1 pass` when its own foot guard
     did not fire, and an unsigned pattern matches the `1` inside `-1` -- so a
     suite that DIED EARLY would read as one that passed a single assertion.
     nc-rec94's harness paid for this line and it is carried unchanged. */
  const m = /(-?\d+) pass, (-?\d+) fail/.exec(out);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status, out,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ") || l.includes("THREW"))
                       .map((l) => l.trim()) };
};
const SUBJECT = "test/capture-text-index.test.mjs";

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const BRANCH = `      if (written >= CAPTURE_TEXT_CAPTURE_UNIT_BOUND
          || bytes + size > CAPTURE_TEXT_CAPTURE_BOUND) { overBound++; continue; }`;

const ARMS = {
  baseline: {
    files: [], suite: SUBJECT,
    why: "nothing armed -- the row that distinguishes five-arms-broken from five-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  /* THE ITEM'S OWN ARM. The bound is declared, commented and never TESTED --
     which is precisely the state this item found the estate in, one level up: a
     bound that exists as arithmetic nobody wrote down. The declared failures are
     chosen so that between them the failure lines print the UNIT COUNT and the
     BYTE COUNT, because the queue row's control says in so many words that a
     failure naming one is a failure a reader cannot act on. G6b is asserted as a
     WHOLE SENTENCE for exactly that reason. */
  nounitbound: {
    files: [STORE], suite: SUBJECT,
    why: "drop the unit half of `#writeCaptureText`'s bound branch, so the constant is computed "
       + "and thrown away -- the tree exactly as it was before this item",
    mustFail: ["G3: the constants sit BESIDE each other",
               "G5: exactly the unit bound is indexed",
               "G6: the capture reads PARTIAL and the sentence NAMES THE UNIT BOUND",
               "G6b: and the detail carries BOTH counts"],
    mustPass: "`G1` and `G2` (the constants are still declared and still relate correctly -- which "
            + "is the finding: DECLARING a bound and ENFORCING one are two acts, and this arm is "
            + "the gap between them), `G7`, every `G8` over-strictness arm, and every A-F arm",
    patch: () => arm(STORE, BRANCH,
      `      if (bytes + size > CAPTURE_TEXT_CAPTURE_BOUND) { overBound++; continue; }   /* ARMED */`),
  },

  /* THE BOUND AND WHAT THE RECORD SAYS ABOUT IT ARE TWO DEFENCES, and a suite
     whose halves fall together cannot tell which one is enforcing (REC-88's
     `nocheck` arm, the same split one construct over). Here the trimming stays
     correct and only the SENTENCE regresses to naming bytes alone -- which is
     the record under-describing a refusal it really did make. */
  sentencebytesonly: {
    files: [STORE], suite: SUBJECT,
    why: "revert `#observeIndexed`'s `partial` sentence to the pre-item wording that names only "
       + "the byte bound, leaving the unit bound itself enforced",
    mustFail: ["G6: the capture reads PARTIAL and the sentence NAMES THE UNIT BOUND"],
    mustPass: "`G5` (the trimming is untouched -- the right number of units is indexed and the "
            + "record simply will not say why), `G6b` (the counts are in `detail`, not in "
            + "`bound`), `G7` and every `G8` arm",
    patch: () => arm(STORE, "      const byUnits = r.written >= CAPTURE_TEXT_CAPTURE_UNIT_BOUND;",
      "      const byUnits = false;   /* ARMED */"),
  },

  /* THE OFF-BY-ONE, ARMED IN THE DIRECTION THAT INDEXES ONE UNIT TOO MANY. It is
     armed this way round on purpose: `>` instead of `>=` leaves G7 (a capture at
     EXACTLY the bound) green, so an author who reached for the wrong comparison
     would see the arm they were most likely to write a test for pass. The arm
     that catches it is the OVER-the-bound one, which is why both exist. */
  gtnotge: {
    files: [STORE], suite: SUBJECT,
    why: "compare `written > CAPTURE_TEXT_CAPTURE_UNIT_BOUND` instead of `>=`, so one unit past "
       + "the bound is indexed",
    mustFail: ["G3: the constants sit BESIDE each other",
               "G5: exactly the unit bound is indexed",
               "G6b: and the detail carries BOTH counts"],
    mustPass: "`G7` -- A CAPTURE AT EXACTLY THE BOUND IS STILL FULL, which is the point of this "
            + "arm: the test an author would naturally write does NOT catch this defect. Also "
            + "`G1`, `G2`, `G6` and every `G8` arm",
    patch: () => arm(STORE, "      if (written >= CAPTURE_TEXT_CAPTURE_UNIT_BOUND",
      "      if (written > CAPTURE_TEXT_CAPTURE_UNIT_BOUND   /* ARMED */"),
  },

  /* THE ARM THAT DECIDES THIS ITEM IS SAFE TO SHIP. A bound tighter than its rule
     is not a safer bound -- it is an undeclared interface change wearing the
     costume of caution, and this one would silently stop indexing part of a
     document the record accepts today. 512 is not a random number: it is the
     kind of round figure an author reasoning from §4.1's four-hundred-unit
     worked example would reach for without going to M-20's ladder. */
  tighten: {
    files: [STORE], suite: SUBJECT,
    why: "lower the unit bound to 512, the number a careless author would take from §4.1's worked "
       + "example instead of from M-20's ladder -- the REGRESSION direction this item exists to "
       + "avoid",
    /* CORRECTED AFTER THE FIRST RUN, AND THE CORRECTION IS THE MOST USEFUL THING
       THIS HARNESS PRODUCED. Declared first as EIGHT failures including `G5`,
       `G6b` and `G7`; it came back 5/8 with those three GREEN, and they are green
       for a reason that is a finding about the SUITE rather than about the arm:
       THEY READ `CAPTURE_TEXT_CAPTURE_UNIT_BOUND` OUT OF THE PRODUCT, SO BOTH
       SIDES OF THE ASSERTION MOVE WITH IT. `G5` asks "is exactly the bound
       indexed" and 512 of 4,600 satisfies that as truly as 4,096 does; `G7`
       slices its fixture to `storeUnits`; `G6b` builds its expected sentence from
       it. **An assertion written against the product's own constant can tell you
       the MECHANISM is right and can never tell you the NUMBER is.**
       That is not a defect to fix by hand-copying the constant -- a hand copy
       agrees for free, which this repository has measured five times. It is the
       reason the section has TWO KINDS of assertion, and this arm is what proves
       the second kind exists and fires: `G1` compares against the wire's
       independently-derived ceiling, `G2` and `G6` carry M-20's literals, and
       `G8` carries two real documents by name and by size. Those four are the
       whole defence against a bound set to a wrong number, and all four went red.
       Declared here as it actually behaves, with the three greens named as
       required rather than left to look like an oversight. */
    mustFail: ["G1: THE WIRE CAN NEVER SEND MORE UNITS THAN THE STORE WILL KEEP",
               "G2: and the unit bound is the figure M-20's ladder gives",
               "G6: the capture reads PARTIAL and the sentence NAMES THE UNIT BOUND",
               "G8 (the census's worst docx)",
               "G8b (the census's worst docx)"],
    mustPass: "`G5`, `G6b` and `G7` -- GREEN ON PURPOSE AND THE REASON IS ABOVE: they read the "
            + "bound out of the product, so they follow it wherever it goes and are blind to its "
            + "VALUE by construction. Also `G8 (the census's worst PDF)`, whose 1,181 units "
            + "survive a 512-unit bound ONLY because the wire's byte budget has already trimmed "
            + "it to 411 -- this item's own thesis arriving as a control result: the two bounds "
            + "interact, and a unit bound read without the byte budget beside it says nothing "
            + "about what a document costs. Also every purge arm and every refusal -- a bound is "
            + "not a refusal and must move none",
    patch: () => arm(STORE, "const CAPTURE_TEXT_CAPTURE_UNIT_BOUND = 4096;",
      "const CAPTURE_TEXT_CAPTURE_UNIT_BOUND = 512;   /* ARMED */"),
  },

  /* THE ARM THAT JUSTIFIES SHIPPING NO CHECK AT THE ACQUIRE WIRE. This item
     argues that a wire-side unit budget provably cannot fire (the largest budget
     that regresses nothing, 4,096, is above the 4,064 the wire can reach) and
     that the honest mechanism is therefore a PIN rather than a constant. A pin
     that does not fire when its operands move is a paragraph. This moves one. */
  pinoff: {
    files: [INDEX], suite: SUBJECT,
    why: "halve `ACQUIRE_TEXT_UNIT_ENVELOPE` to 64, doubling the wire's unit ceiling to 8,129 -- "
       + "past the store's bound, so the wire could offer units the store will silently drop",
    mustFail: ["G1: THE WIRE CAN NEVER SEND MORE UNITS THAN THE STORE WILL KEEP"],
    mustPass: "EVERY STORE ARM -- `G5`, `G6`, `G6b`, `G7` and both `G8`s. That separation is the "
            + "finding: the wire and the store hold two different bounds, this arm moves only the "
            + "wire's, and nothing in the store's behaviour notices. A single assertion is the "
            + "entire defence against a bytes-change silently moving what a promote may COST",
    patch: () => arm(INDEX, "const ACQUIRE_TEXT_UNIT_ENVELOPE = 128;",
      "const ACQUIRE_TEXT_UNIT_ENVELOPE = 64;   /* ARMED */"),
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
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing -- baseline)"}`);
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
  const r = runSuite(a.suite);
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
  /* The declared verdict, checked — INCLUDING the held-open half. An arm that
     also broke what it declared must stay green is an arm measuring something
     wider than its subject, and REC-83's own run found one. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const stray = r.failing.filter((l) => !a.mustFail.some((m) => l.includes(m)));
    const declaredThrow = a.mustFail.includes("THREW");
    const ok = hit.length === a.mustFail.length && stray.length === 0
            && (declaredThrow ? r.pass === -1 : r.fail > 0);
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${stray.length} UNDECLARED failure(s), ${r.fail} total failing`);
    for (const l of stray) console.log(`  UNDECLARED ${l}`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
