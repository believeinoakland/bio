#!/usr/bin/env node
/* REC-79's NEGATIVE CONTROLS — TEN ARMS PLUS A BASELINE (arm 0), NINETEEN SUB-CHECKS. Deliberately
 * NOT a `.test.mjs`: it mutates the tree, so the battery must not discover it.
 *
 * WHAT THIS FILE IS FOR. Every arm below breaks ONE thing, ALONE, with
 * everything else held open, and DECLARES BEFORE ARMING what MUST fail and what
 * MUST NOT. The arms that matter most are the ones that must NOT fail: an
 * instrument that fails on everything is not measuring its subject.
 *
 * THE BASELINE ROW IS NOT OPTIONAL. A harness whose first run reported `null`
 * for every arm INCLUDING the baseline was indistinguishable from six arms
 * working — only the baseline row told the two apart. So arm 0 runs everything
 * UNPATCHED first, and if it is not green the rest of the run means nothing.
 *
 * EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT (`cmp`-equivalent, a byte
 * comparison of the buffers), against UNIQUELY-NAMED PER-ARM pristine copies,
 * with the byte count PRINTED and a minimum GUARDED. Two harnesses in this
 * repository once reported a restore byte-identical OVER AN EMPTY MANIFEST, and
 * were caught only because a digest read `e3b0c442…`, the sha256 of the empty
 * string.
 *
 * THE TALLY IN THE FIRST LINE IS A CLAIM THIS FILE ASSERTS AT ITS OWN FOOT (D-355, 2026-09-21):
 * every declared arm must announce exactly once and exactly nineteen sub-checks must be
 * recorded, or the run exits 1 saying so. The census (`bio-plane/test/m025-arm-census.mjs`)
 * holds the same first line against the run from outside (D-333). Both exist because the
 * cheapest way past a red arm is to delete it, and a deleted arm leaves no failure behind.
 * Before 2026-09-21 this head stated no tally at all, so neither instrument could see one go.
 *
 * RUN 2026-09-21 by D-355, before any edit: exit 1 by an UNCAUGHT `ARM DID NOT ARM` at arm 2
 * (its anchor occurred 7 times), arms 0 and 1 as declared, arms 3-9 NEVER REACHED, and the pen
 * left behind holding 1.4 MB of pristine copies. The attributions are at arm 2's site and at
 * the pen's; the figures of record are in `MEASUREMENTS.md`.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../../bio-plane/scripts/armdecay.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const P = (r) => path.join(REPO, r);

const CHECKS = P("bio-plane/checks/bio-checks.mjs");
const INDEX  = P("bio-plane/src/index.mjs");
const APP    = P("civicos-ui/app.html");
const GUARD  = P("civicos-ui/check-refusal-codes.mjs");

/* The pristine copies live INSIDE this worktree — the shared scratchpad is NOT
   isolated between sessions and has already overwritten one worker's control
   harness mid-turn. */
const KEEP = path.join(HERE, ".rec79-control-pristine");

const MIN_BYTES = { [CHECKS]: 200000, [INDEX]: 300000, [APP]: 500000, [GUARD]: 60000 };

const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/* ============================ THE PEN IS REMOVED ON EVERY EXIT ============================
 * D-355, 2026-09-21, and the row understated it. This file used to `mkdirSync(KEEP)` at load
 * and never remove anything — not on a red exit, and NOT ON A CLEAN ONE EITHER: every run left
 * ~4 MB of pristine copies of `app.html`, `index.mjs` and `bio-checks.mjs` untracked beside the
 * UI suites (measured 2026-09-21 on a run that died at arm 2: two copies, 1.4 MB). That is not
 * inert — `check-firing.test.mjs`'s producer sweep once read this very pen as a SECOND producer
 * of a retired check (the `_m025/` note in `.gitignore`), and the battery's provenance line
 * names what a pen leaves.
 *
 * NOW, THREE LAYERS, each the precedent it names:
 *   1. every copy is written under a name that says which arm made it, and REMOVED BY NAME the
 *      moment its restore is verified — never a directory sweep (UI-59's driver: a sweep is how
 *      M0-30's driver took a sibling worktree with it on a clean exit at code 0);
 *   2. an `exit` hook runs on EVERY way out — exit 0, `process.exit(1)`, an uncaught throw, and
 *      SIGINT / SIGTERM / SIGHUP routed through `process.exit` (the census's per-driver timeout
 *      SIGTERMs a driver, which is exactly a kill between ARM and RESTORE). For any arm still in
 *      flight it RESTORES THE FILE FROM MEMORY first, verifies by sha256 and by content, and only
 *      then removes the copy — a pen removed over a still-patched tree would destroy the one thing
 *      a restore needs;
 *   3. the directory itself is removed only if it is EMPTY (`rmdirSync`, not recursive); anything
 *      in it this run did not write is LEFT, and the exit line says the directory remains, because
 *      it is not this driver's to delete.
 * THE ONE COPY EVER KEPT is one whose file the hook could not restore and verify: then that copy
 * is the restore source, and the hook prints its path and says the tree is MUTATED. That is a
 * condition on the TREE, never on the exit code. SIGKILL cannot be caught by anything; the pen
 * therefore also has its own line in `.gitignore`, which it never had before D-355. */
const WRITTEN = new Set();          // pristine copies written and NOT YET removed, by absolute path
const IN_FLIGHT = new Map();        // stash objects whose restore has not been verified yet
const PEN = { written: 0, removedAtRestore: 0 };
function removePenOnExit(code) {
  const kept = [];
  for (const s of IN_FLIGHT.values()) {
    let ok = false;
    try {
      fs.writeFileSync(s.file, s.buf);
      const back = fs.readFileSync(s.file);
      ok = sha(back) === s.digest && Buffer.compare(back, s.buf) === 0;
    } catch { ok = false; }
    console.log(`      EXIT-TIME RESTORE (arm ${s.arm} was still in flight at exit ${code}): ${path.basename(s.file)} `
              + `${ok ? "restored from memory · sha256 MATCH · content IDENTICAL" : "**COULD NOT BE RESTORED AND VERIFIED**"}`);
    if (!ok) kept.push(s.dest);
  }
  let removedByHook = 0;
  for (const p of WRITTEN) {
    if (kept.includes(p)) continue;
    try { fs.rmSync(p, { force: true }); removedByHook++; } catch { kept.push(p); }
  }
  let dirGone = !fs.existsSync(KEEP);
  if (!dirGone && !kept.length) {
    try { fs.rmdirSync(KEEP); dirGone = true; }
    catch { /* NOT EMPTY: it holds something this run did not write. Left for whoever wrote it — never
               swept, and not listed either, because listing a directory is a walk and this file is
               inside `hygiene.test.mjs`'s discovery census. */ }
  }
  console.log(`\nPEN: ${PEN.written} pristine cop${PEN.written === 1 ? "y" : "ies"} written this run · ${PEN.removedAtRestore} removed by name `
            + `as each restore verified · ${removedByHook} removed by the exit hook · `
            + `${dirGone ? "the directory is ABSENT" : `the directory REMAINS at ${KEEP} — it holds something this run did not write`}`
            + ` · exit ${code}`);
  for (const p of kept) console.log(`PEN: **KEPT ${p}** — its file could not be restored and verified, so this copy is the restore source. The tree is MUTATED.`);
}
process.on("exit", removePenOnExit);
/* THE SIGNAL HALF NEEDED THE SUITES TO RUN ASYNCHRONOUSLY, AND THAT WAS MEASURED, NOT ASSUMED
   (2026-09-21): in a script whose work is `execFileSync`, a SIGTERM sent at 1.0s ran its JS handler
   at 4.0s — only after the WHOLE synchronous script had finished. A handler on a synchronous driver
   is therefore worse than none: it SUPPRESSES the default kill and defers the signal to the end, so
   Ctrl-C stops nothing and a hung suite outlives the census's per-driver timeout forever. So `run`
   below awaits an asynchronous child, the loop turns while every suite runs, and the handler can stop
   the running suite, restore from memory and remove the pen at once. SIGKILL is still uncatchable. */
let CURRENT = null;
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => {
    console.log(`\nreceived ${sig} — stopping the running suite, restoring, and removing the pen before exiting`);
    if (CURRENT) { try { CURRENT.kill("SIGTERM"); } catch { /* already gone */ } }
    process.exit(128 + os.constants.signals[sig]);
  });

/* A pristine copy per ARM, named for the arm, so two arms can never share one
   and a restore can never be verified against a file another arm wrote. */
function stash(arm, file) {
  const buf = fs.readFileSync(file);
  if (buf.length < MIN_BYTES[file])
    throw new Error(`arm ${arm}: ${path.basename(file)} is ${buf.length} bytes, below the ${MIN_BYTES[file]} floor — `
                  + `refusing to take a pristine copy of a file that has already been truncated`);
  const d = sha(buf);
  if (d === EMPTY) throw new Error(`arm ${arm}: ${path.basename(file)} digests as the EMPTY STRING`);
  fs.mkdirSync(KEEP, { recursive: true });
  const dest = path.join(KEEP, `arm-${arm}--${path.basename(file)}`);
  fs.writeFileSync(dest, buf);
  WRITTEN.add(dest);
  PEN.written++;
  const s = { arm, file, dest, buf, digest: d };
  IN_FLIGHT.set(dest, s);
  return s;
}

function restore(s) {
  fs.writeFileSync(s.file, s.buf);
  const back = fs.readFileSync(s.file);
  const okHash = sha(back) === s.digest;
  const okBytes = Buffer.compare(back, fs.readFileSync(s.dest)) === 0;   // the `cmp` half
  console.log(`      restore ${path.basename(s.file)}: ${back.length} bytes (floor ${MIN_BYTES[s.file]}) · `
            + `sha256 ${okHash ? "MATCH" : "**MISMATCH**"} · content ${okBytes ? "IDENTICAL" : "**DIFFERS**"} · `
            + `${s.digest.slice(0, 12)}…`);
  if (!okHash || !okBytes || back.length < MIN_BYTES[s.file])
    throw new Error(`arm ${s.arm}: RESTORE FAILED for ${s.file} — stopping rather than leaving a mutated tree`);
  /* VERIFIED, so the copy has done its job: removed BY NAME now, not at the foot. */
  IN_FLIGHT.delete(s.dest);
  fs.rmSync(s.dest, { force: true });
  WRITTEN.delete(s.dest);
  PEN.removedAtRestore++;
}

/* `run` KEEPS A PASSING SUITE'S OUTPUT (D-355, 2026-09-21). It used to return `out: ""` on
   exit 0, so any sub-check reading a suite's output could only ever read FALSE over a green
   suite — which is how arm 2's one real disagreement was reported as two: 2b declared the code
   assertions still pass, they did, and it read false because there was nothing to read.
   AND IT IS ASYNCHRONOUS, for the signal reason given at the pen. Output is collected whole from
   both streams and read only at `close`, after both have ended, so nothing is cut at a buffer. */
const run = (cmd, args, cwd) => new Promise((resolve) => {
  const child = spawn(cmd, args, { cwd: cwd || REPO, stdio: ["ignore", "pipe", "pipe"] });
  CURRENT = child;
  const out = [], err = [];
  child.stdout.on("data", (d) => out.push(d));
  child.stderr.on("data", (d) => err.push(d));
  child.on("error", (e) => { CURRENT = null; resolve({ exit: -1, out: String(e && e.message) }); });
  child.on("close", (code) => {
    CURRENT = null;
    resolve({ exit: code ?? -1, out: Buffer.concat(out).toString("utf8") + Buffer.concat(err).toString("utf8") });
  });
});
const runOut = run;

const GATE_SUITE = () => run("node", ["test/admission-gate.test.mjs"], P("bio-plane"));
/* THE PATH IS REPO-RELATIVE BECAUSE `run` USES THE REPO AS ITS CWD, AND THE
   FIRST DRAFT GOT THIS WRONG — recorded rather than quietly corrected, because
   it is the reason arm 0 exists. It read `test/admission-translation.test.mjs`,
   node could not find the file, and every UI arm exited 1. **Arm 4 therefore
   "AGREED" — it declared a failure and got one — while never having armed at
   all.** The only row that could tell the difference was the BASELINE, which
   declared 0 and got 1. A harness without a baseline row would have reported a
   clean sweep over an arm that never ran. */
const UI_SUITE   = () => run("node", ["civicos-ui/test/admission-translation.test.mjs"]);
const THE_GUARD  = () => runOut("node", ["civicos-ui/check-refusal-codes.mjs"]);

const results = [];
const record = (arm, what, declared, actual, note) => {
  const agree = declared === actual;
  results.push({ arm, what, declared, actual, agree, note });
  console.log(`  arm ${arm}: declared ${declared}, actual ${actual} — ${agree ? "AGREES" : "**DISAGREES**"}`
            + `${note ? ` · ${note}` : ""}`);
};
const ANNOUNCED = [];
const announce = (id, text) => { ANNOUNCED.push(id); console.log(`${id === 0 ? "" : "\n"}ARM ${id} · ${text}`); };

/* A patch that matches ZERO times is an ARM THAT NEVER ARMED, and this project
   has shipped three of those. Every patch below asserts its own match count. */
function patch(file, find, replace, expect = 1) {
  const src = fs.readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== expect)
    throw new Error(`ARM DID NOT ARM: the anchor occurred ${n} time(s) in ${path.basename(file)}, expected ${expect}. `
                  + `An arm that did not arm is a finding, not a passing control.\n  anchor: ${find.slice(0, 120)}`);
  fs.writeFileSync(file, src.split(find).join(replace));
  return n;
}

/* ============================== THE ANCHORS, EVERY ONE, IN ONE PLACE ==============================
   Hoisted so D-331's preflight can count them all BEFORE anything is armed (below). */
const C38_1_SENTENCE = "translation: 'Nothing in this request said who you are. Sign in, or send a credential this '\n"
                     + "      + 'instance issued, and try again.',";
/* ARM 2's ANCHOR IS THE WHOLE ROW READER, BY NAME, AND THE OLD ONE-LINE ANCHOR IS KEPT HERE AS THE
   RECORD. It was `return { code, check: row.check, translation: row.translation };` — unique on
   REC-79's day, and it stayed unique until `f2beb0e1` (2026-09-14 19:12 -0700, CAP-8's `driveRow`,
   "admissionRow's shape one family over") copied the line; six readers carried it by 2026-09-19 and
   seven carry it today. From that merge the arm THREW `ARM DID NOT ARM` before arming. Only the
   reader's own first line makes the site unique, so the anchor is the function whole. */
/* BUILT FROM ONE SHARED HEAD BY CONCATENATION, NEVER BY `.replace(` — measured 2026-09-21: the first
   writing derived the bare form with `ADMISSION_ROW.replace("<the return line>", …)`, an IN-MEMORY
   transform, and `m025-arm-anchor-witness.test.mjs` reads every `.replace("…",` as an anchor INTO A FILE —
   A5 then failed naming this driver, because that return line sits in seven row readers and in no file
   exactly once. It was never this arm's anchor: the anchor is the whole row reader, and D-331's preflight
   below counts it in the file on every run. So the transform is not written in the shape the witness reads. */
const ADMISSION_ROW_HEAD = "const admissionRow = (code) => {\n"
  + "  const row = ADMISSION_CHECKS[code];\n"
  + "  if (!row || typeof row.translation !== \"string\" || !row.translation)\n"
  + "    throw new Error(`admissionRow: ${code} has no ADMISSION_CHECKS row with a canned translation `\n"
  + "                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);\n";
const ADMISSION_ROW = ADMISSION_ROW_HEAD + "  return { code, check: row.check, translation: row.translation };\n};";
const ADMISSION_ROW_BARE = ADMISSION_ROW_HEAD + "  return { code, check: row.check };\n};";
/* D-262's CHOKEPOINT — `dec49Decorate`, reached from `json()` through `dec49Attach` — backfills a
   refusal's missing `translation` from its catalogue row on the way OUT. It never overwrites. */
const BACKFILL = "  if (r.translation === undefined) r.translation = row.translation;\n";
const NOT_CAPABLE_SITE2 = `return json({ ok: false, reason: "NOT_CAPABLE", ...admissionRow("NOT_CAPABLE"),
              op, needs: "create_projects",`;
const APP_TRANSLATION_LINE = "  if(a && typeof a.translation === \"string\" && a.translation) return a.translation;\n";
const WRAPPED_READER = "        const w = /^(?:new\\s+)?[A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*\\s*\\(\\s*/.exec(text.slice(i, i + 120));";
const UNTRANSLATED_WALK = "  const untranslated = [...census.union].filter(c => !translated.has(c)).sort();";
const F6_PUT = "    else                                                 put(\"F6 out of reach, one site — needs a sentence WHEN its surface exists\", c);";
const STORE_NAME_LINE = "    const storeName = scope.name;";

/* THE DECLARED ARMS, asserted at the foot. Arm 10 was APPENDED on 2026-09-21 (D-355) — see it. */
const DECLARED_ARMS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DECLARED_SUBCHECKS = 19;

console.log("REC-79 · NEGATIVE CONTROLS — each arm ALONE, others held open\n");

/* D-331 — THIS IS A THROWING DRIVER (`patch` throws on a count other than one), SO IT VALIDATES EVERY
   ANCHOR BEFORE IT ARMS ANYTHING AND PRINTS THE WHOLE TABLE. It did not until D-355, and the cost was
   measured on 2026-09-21: one ambiguous anchor at arm 2 threw, and arms 3 through 9 — every one of them
   healthy — went unmeasured AND unreported. The throw is kept: a half-armed tree is never measured. */
preflight("refusal-partition.control.mjs", [
  { id: "1",  anchors: [{ file: CHECKS, needle: C38_1_SENTENCE }] },
  { id: "2",  anchors: [{ file: INDEX, needle: ADMISSION_ROW }, { file: INDEX, needle: BACKFILL }] },
  { id: "3",  anchors: [{ file: INDEX, needle: NOT_CAPABLE_SITE2 }] },
  { id: "4",  anchors: [{ file: APP, needle: APP_TRANSLATION_LINE }] },
  { id: "5",  anchors: [{ file: CHECKS, needle: C38_1_SENTENCE }] },
  { id: "6",  anchors: [{ file: GUARD, needle: WRAPPED_READER }] },
  { id: "7",  anchors: [{ file: GUARD, needle: UNTRANSLATED_WALK }] },
  { id: "8",  anchors: [{ file: GUARD, needle: F6_PUT }] },
  { id: "9",  anchors: [{ file: INDEX, needle: STORE_NAME_LINE }] },
  { id: "10", anchors: [{ file: INDEX, needle: ADMISSION_ROW }] },
]);
console.log("");

/* ============================== ARM 0 — THE BASELINE ============================== */
announce(0, "BASELINE — everything unpatched. If this is not green, every row below is meaningless.");
{
  const g = await THE_GUARD(), a = await GATE_SUITE(), u = await UI_SUITE();
  record(0, "the DEC-49 guard, unpatched", 0, g.exit);
  record(0, "admission-gate.test.mjs, unpatched", 0, a.exit);
  record(0, "admission-translation.test.mjs, unpatched", 0, u.exit);
  const m = /arm F: THE PARTITION of (\d+) untranslated code\(s\) over a census of (\d+)/.exec(g.out);
  console.log(`      corpus PRINTED: ${m ? `${m[1]} untranslated over a census of ${m[2]}` : "**NOT PRINTED — the arm F line is missing**"}`);
  if (!m) throw new Error("arm 0: arm F printed no partition line, so no arm below can be read as a delta");
}

/* ===== ARM 1 — a row loses its sentence. MUST FAIL: admissionRow throws. ===== */
announce(1, "blank ONE row's canned translation. MUST FAIL (the plane suite). MUST NOT be silent.");
{
  const s = stash(1, CHECKS);
  patch(CHECKS, C38_1_SENTENCE, "translation: '',");
  const a = await GATE_SUITE();
  record(1, "admission-gate.test.mjs with C-38.1's sentence blanked", 1, a.exit === 0 ? 0 : 1,
         a.exit !== 0 ? "and it did not pass silently" : "**A BLANK SENTENCE REACHED A MEMBER AND NOTHING NOTICED**");
  restore(s);
}

/* ===== ARM 2 — THE SHARP ONE. The code is right; the SENTENCE is dropped FROM THE WIRE. =====
 *
 * RE-AIMED 2026-09-21 BY D-355, NEVER EXEMPTED — A BEHAVIOUR MOVE, DATED, AND THEN AN ANCHOR DECAY
 * ON TOP OF IT.
 *
 * AS WRITTEN (REC-79, `4df1cd06`, 2026-08-09 15:46 -0700) this arm dropped the sentence from
 * `admissionRow` ALONE, and in REC-79's own tree that WAS dropping it from the wire. It was right.
 *
 * THE BEHAVIOUR MOVE. D-262 (`f5bdff29`, 2026-08-09 15:20 -0700) was written on a parallel branch and
 * put the catalogue row on the wire at ONE CHOKEPOINT: `json()` passes every answer through
 * `dec49Attach`, whose `dec49Decorate` fills a refusal's missing `translation` from its row. The two met
 * at the merge `108020ce` (2026-08-09 17:31 -0700, "Merge REC-64's remaining sweep"). From that merge a
 * sentence dropped from the row reader ALONE was put back on the way out, `admission-gate.test.mjs`
 * stayed green — CORRECTLY, because the member still received the sentence — and this arm read
 * declared 1 / actual 0. Sub-check 2b read false beside it only because `run` discarded a passing
 * suite's output (fixed above). M0-29 measured exactly that at `e9ba393` on 2026-09-14: 2 of 18 NOT AS
 * DECLARED. Nothing in the suite moved; the suite still asserts the sentence SEPARATELY from the code.
 *
 * THE ANCHOR DECAY, SEPARATE AND LATER: see `ADMISSION_ROW` above — from `f2beb0e1` (2026-09-14) the
 * arm threw before arming, and every arm behind it went dark with it.
 *
 * NOW: the arm breaks BOTH routes — the row reader's sentence AND the chokepoint's backfill — which is
 * the smallest break that still drops the sentence from the wire. ARM 10 drives the first break ALONE
 * and must stay green, so WHY the second break is needed is re-measured on every run rather than
 * asserted in this comment. And the arm's failure must now NAME the translation assertion: a suite
 * that dies for some other reason is not this arm's evidence. */
announce(2, "the canned sentence dropped FROM THE WIRE — `admissionRow` returns the row WITHOUT its translation");
console.log("        AND D-262's chokepoint no longer backfills it. MUST FAIL, at the CANNED TRANSLATION assertion.");
console.log("        This is `translation: undefined` — the exact defect DEC-49 was written for, and the");
console.log("        reason `translation` is asserted SEPARATELY from `reason` rather than alongside it.");
{
  const s = stash(2, INDEX);
  patch(INDEX, ADMISSION_ROW, ADMISSION_ROW_BARE);
  patch(INDEX, BACKFILL, "");
  const a = await GATE_SUITE();
  const named = /FAIL\s+[^\n]*carries the CANNED TRANSLATION/.test(a.out);
  const codesStillPass = /PASS.*answers NOT_AUTHENTICATED/.test(a.out);
  record(2, "admission-gate.test.mjs with every translation dropped from the wire (row reader AND chokepoint)", 1,
         a.exit !== 0 && named ? 1 : 0,
         a.exit === 0 ? "**THE SUITE STAYED GREEN WITH THE SENTENCE GONE FROM THE WIRE**"
                      : named ? "failing at the CANNED TRANSLATION assertion, by name" : "**it failed, but NOT at the translation assertion**");
  record("2b", "the CODE assertions still pass, so a code-only suite would have been GREEN through this",
         true, codesStillPass);
  restore(s);
}

/* ===== ARM 3 — the two NOT_CAPABLE sites drift into two wordings. ===== */
announce(3, "hand-write a SECOND wording at the second NOT_CAPABLE site. MUST FAIL.");
{
  const s = stash(3, INDEX);
  patch(INDEX, NOT_CAPABLE_SITE2,
               `return json({ ok: false, reason: "NOT_CAPABLE", ...admissionRow("NOT_CAPABLE"),
              translation: "You cannot make projects here, sorry about that.",
              op, needs: "create_projects",`);
  const a = await GATE_SUITE();
  record(3, "admission-gate.test.mjs with the two sites disagreeing", 1, a.exit === 0 ? 0 : 1,
         /byte-identical to the other site/.test(a.out) ? "and the failing arm is the same-sentence one" : "");
  restore(s);
}

/* ===== ARM 4 — the surface goes back to inventing wording. ===== */
announce(4, "revert app.html's `a.translation` line. MUST FAIL (the UI suite).");
{
  const s = stash(4, APP);
  patch(APP, APP_TRANSLATION_LINE, "");
  const u = await UI_SUITE();
  record(4, "admission-translation.test.mjs with the surface re-inventing wording", 1, u.exit === 0 ? 0 : 1);
  restore(s);
}

/* ===== ARM 5 — OVER-STRICTNESS. A translation in an unanticipated voice. ===== */
announce(5, "OVER-STRICTNESS — a code that IS translated, in a spelling nothing anticipated.");
console.log("        MUST **NOT** FAIL, and arm F must NOT name it in any untranslated partition.");
{
  const s = stash(5, CHECKS);
  patch(CHECKS, C38_1_SENTENCE,
                "translation: '\\u00bfQui\\u00e9n eres? Esta petici\\u00f3n no lo dijo \\u2014 inicia sesi\\u00f3n, "
              + "o env\\u00eda una credencial emitida por esta instancia, y vuelve a intentarlo.',");
  const g = await THE_GUARD();
  const named = /F[1-6][^\n]*NOT_AUTHENTICATED/.test(g.out);
  record(5, "the DEC-49 guard over a Spanish translation with an em-dash and a question", 0, g.exit,
         "a correct sentence in an unfamiliar voice is still a sentence");
  record("5b", "arm F names NOT_AUTHENTICATED as untranslated", false, named,
         "over-strictness: a translated code in an unanticipated spelling must not be reported untranslated");
  restore(s);
}

/* ===== ARM 6 — THE SHARPEST. Neuter the widened outcome reader. ===== */
announce(6, "neuter the WRAPPED-RETURN reader — the thing that made the control plane visible at all.");
console.log("        MUST FAIL: `is-admission` would resolve, be well-formed, be correctly nested, and judge NOTHING.");
{
  const s = stash(6, GUARD);
  patch(GUARD, WRAPPED_READER, "        const w = null;");
  const g = await THE_GUARD();
  const zero = /judged NO refusal inside the region `is-admission`/.test(g.out);
  record(6, "the DEC-49 guard with the wrapped-return reader neutered", 1, g.exit === 0 ? 0 : 1);
  record("6b", "and it says the region judged NOTHING rather than passing over it", true, zero,
         "a blind reader over a real region is the WRONG SPAN failure arriving through the instrument");
  restore(s);
}

/* ===== ARM 7 — neuter arm F's own walk. MUST FAIL on the floor, corpus printed. ===== */
announce(7, "neuter arm F's subject so it partitions NOTHING. MUST FAIL on the floor, with the corpus PRINTED.");
{
  const s = stash(7, GUARD);
  patch(GUARD, UNTRANSLATED_WALK, "  const untranslated = [];");
  const g = await THE_GUARD();
  const printed = /arm F has 0 untranslated code\(s\) to partition, floor is \d+/.test(g.out);
  record(7, "the DEC-49 guard with arm F's subject emptied", 1, g.exit === 0 ? 0 : 1);
  record("7b", "and the failure PRINTS the corpus and the floor rather than going quietly green", true, printed);
  restore(s);
}

/* ===== ARM 8 — break the partition's disjointness. MUST FAIL on the sum. ===== */
announce(8, "let a code land in TWO partitions. MUST FAIL on the sum, which is gated at zero.");
{
  const s = stash(8, GUARD);
  patch(GUARD, F6_PUT,
               "    else { put(\"F6 out of reach, one site — needs a sentence WHEN its surface exists\", c);\n"
             + "           put(\"F6 out of reach, one site — needs a sentence WHEN its surface exists\", c); }");
  const g = await THE_GUARD();
  const said = /arm F's partitions sum to \d+ but there are \d+ untranslated codes/.test(g.out);
  record(8, "the DEC-49 guard with a code double-counted", 1, g.exit === 0 ? 0 : 1);
  record("8b", "and it names the sum it got against the sum it owed", true, said);
  restore(s);
}

/* ===== ARM 9 — OVER-STRICTNESS on the widened reader. ===== */
announce(9, "OVER-STRICTNESS on the reader — a wrapped SUCCESS inside the governed region.");
console.log("        MUST **NOT** FAIL: grading a success as a refusal is the direction that floods the guard.");
{
  const s = stash(9, INDEX);
  patch(INDEX, STORE_NAME_LINE,
               "    if (url.searchParams.get(\"__rec79_never\") === \"1\")\n"
             + "      return json({ ok: true, note: \"a success in return position, wrapped, inside the region\" }, 200);\n"
             + STORE_NAME_LINE);
  const g = await THE_GUARD();
  const flagged = /CODELESS REFUSAL[^\n]*is-admission/.test(g.out);
  record(9, "the DEC-49 guard over a wrapped SUCCESS inside `is-admission`", 0, g.exit,
         "a declared success must not be conscripted into the refusal corpus");
  record("9b", "and it is not reported as a codeless refusal", false, flagged);
  restore(s);
}

/* ===== ARM 10 — ARM 2's ATTRIBUTION, DRIVEN. APPENDED 2026-09-21 BY D-355. =====
   Only the row reader's sentence is dropped; D-262's chokepoint is left alone. This is REC-79's
   ORIGINAL arm 2, kept as a live measurement instead of being deleted: it must stay GREEN, because
   the chokepoint puts the sentence back on the wire. If it ever goes red, the chokepoint has stopped
   covering the admission family — and arm 2's second break is then no longer what separates a
   disarmed arm from a working one. Either way the reader of this run learns it here, not from a
   comment that went stale for six weeks. */
announce(10, "ONLY `admissionRow`'s sentence dropped — REC-79's original arm 2, with D-262's chokepoint left in place.");
console.log("        MUST **NOT** FAIL: the chokepoint re-attaches the canned sentence on the way out, so the member");
console.log("        still receives it. This is WHY arm 2 must break both routes, measured rather than argued.");
{
  const s = stash(10, INDEX);
  patch(INDEX, ADMISSION_ROW, ADMISSION_ROW_BARE);
  const a = await GATE_SUITE();
  record(10, "admission-gate.test.mjs with ONLY the row reader's sentence dropped (D-262's backfill intact)", 0,
         a.exit === 0 ? 0 : 1,
         a.exit === 0 ? "the chokepoint carried the sentence to the wire"
                      : "**the chokepoint did NOT carry it — arm 2's attribution no longer holds; read the suite**");
  restore(s);
}

/* ============================================================ */
console.log("\n================ SUMMARY ================");
for (const r of results)
  console.log(`  arm ${String(r.arm).padEnd(3)} ${r.agree ? "AGREES  " : "DISAGREE"}  declared=${r.declared} actual=${r.actual}  ${r.what}`);
const wrong = results.filter((r) => !r.agree);
/* THE TALLY, HELD AGAINST THE HEAD (D-355). A deleted arm fails nothing by itself; this is what fails. */
const missing = DECLARED_ARMS.filter((a) => ANNOUNCED.filter((x) => x === a).length !== 1);
const extra = ANNOUNCED.filter((a) => !DECLARED_ARMS.includes(a));
const tallyOk = !missing.length && !extra.length && results.length === DECLARED_SUBCHECKS;
/* SPELLED "DECLARED vs RUN", NEVER "ARM TALLY:" — a line opening `ARM <word>:` is an ANNOUNCEMENT to the
   census's third shape, and this line would have added one to the very count it reports. */
console.log(`\nDECLARED vs RUN: ${ANNOUNCED.length} arm(s) announced of ${DECLARED_ARMS.length} declared · `
          + `${results.length} sub-check(s) recorded of ${DECLARED_SUBCHECKS} declared`
          + `${tallyOk ? " — as declared" : ` — **NOT AS DECLARED** (missing or repeated: [${missing}], undeclared: [${extra}])`}`);
console.log(`${results.length} arm(s), ${wrong.length} disagreeing with what was declared before arming.`);
if (wrong.length || !tallyOk) {
  console.log("A DISAGREEMENT IS A FINDING ABOUT THE ARM AND MUST BE RECORDED, NOT SMOOTHED.");
  process.exit(1);
}
console.log("Every arm behaved as declared. Tree restored and verified by sha256 AND by content.");
