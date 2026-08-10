#!/usr/bin/env node
/* REC-79's NEGATIVE CONTROLS. Deliberately NOT a `.test.mjs`: it mutates the
 * tree, so the battery must not discover it.
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
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

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
fs.mkdirSync(KEEP, { recursive: true });

const MIN_BYTES = { [CHECKS]: 200000, [INDEX]: 300000, [APP]: 500000, [GUARD]: 60000 };

const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/* A pristine copy per ARM, named for the arm, so two arms can never share one
   and a restore can never be verified against a file another arm wrote. */
function stash(arm, file) {
  const buf = fs.readFileSync(file);
  if (buf.length < MIN_BYTES[file])
    throw new Error(`arm ${arm}: ${path.basename(file)} is ${buf.length} bytes, below the ${MIN_BYTES[file]} floor — `
                  + `refusing to take a pristine copy of a file that has already been truncated`);
  const d = sha(buf);
  if (d === EMPTY) throw new Error(`arm ${arm}: ${path.basename(file)} digests as the EMPTY STRING`);
  const dest = path.join(KEEP, `arm-${arm}--${path.basename(file)}`);
  fs.writeFileSync(dest, buf);
  return { arm, file, dest, buf, digest: d };
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
}

const run = (cmd, args, cwd) => {
  try { execFileSync(cmd, args, { cwd: cwd || REPO, stdio: "pipe", encoding: "utf8" }); return { exit: 0, out: "" }; }
  catch (e) { return { exit: e.status ?? -1, out: `${e.stdout || ""}${e.stderr || ""}` }; }
};
const runOut = (cmd, args, cwd) => {
  try { return { exit: 0, out: execFileSync(cmd, args, { cwd: cwd || REPO, stdio: "pipe", encoding: "utf8" }) }; }
  catch (e) { return { exit: e.status ?? -1, out: `${e.stdout || ""}${e.stderr || ""}` }; }
};

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

console.log("REC-79 · NEGATIVE CONTROLS — each arm ALONE, others held open\n");

/* ============================== ARM 0 — THE BASELINE ============================== */
console.log("ARM 0 · BASELINE — everything unpatched. If this is not green, every row below is meaningless.");
{
  const g = THE_GUARD(), a = GATE_SUITE(), u = UI_SUITE();
  record(0, "the DEC-49 guard, unpatched", 0, g.exit);
  record(0, "admission-gate.test.mjs, unpatched", 0, a.exit);
  record(0, "admission-translation.test.mjs, unpatched", 0, u.exit);
  const m = /arm F: THE PARTITION of (\d+) untranslated code\(s\) over a census of (\d+)/.exec(g.out);
  console.log(`      corpus PRINTED: ${m ? `${m[1]} untranslated over a census of ${m[2]}` : "**NOT PRINTED — the arm F line is missing**"}`);
  if (!m) throw new Error("arm 0: arm F printed no partition line, so no arm below can be read as a delta");
}

/* ===== ARM 1 — a row loses its sentence. MUST FAIL: admissionRow throws. ===== */
console.log("\nARM 1 · blank ONE row's canned translation. MUST FAIL (the plane suite). MUST NOT be silent.");
{
  const s = stash(1, CHECKS);
  patch(CHECKS, "translation: 'Nothing in this request said who you are. Sign in, or send a credential this '\n      + 'instance issued, and try again.',",
                "translation: '',");
  const a = GATE_SUITE();
  record(1, "admission-gate.test.mjs with C-38.1's sentence blanked", 1, a.exit === 0 ? 0 : 1,
         a.exit !== 0 ? "and it did not pass silently" : "**A BLANK SENTENCE REACHED A MEMBER AND NOTHING NOTICED**");
  restore(s);
}

/* ===== ARM 2 — THE SHARP ONE. The code is right; the SENTENCE is dropped. ===== */
console.log("\nARM 2 · `admissionRow` returns the row WITHOUT its translation. MUST FAIL.");
console.log("        This is `translation: undefined` — the exact defect DEC-49 was written for, and the");
console.log("        reason `translation` is asserted SEPARATELY from `reason` rather than alongside it.");
{
  const s = stash(2, INDEX);
  patch(INDEX, "return { code, check: row.check, translation: row.translation };",
               "return { code, check: row.check };");
  const a = GATE_SUITE();
  const codesStillPass = /PASS.*answers NOT_AUTHENTICATED/.test(a.out);
  record(2, "admission-gate.test.mjs with every translation dropped from the wire", 1, a.exit === 0 ? 0 : 1);
  record("2b", "the CODE assertions still pass, so a code-only suite would have been GREEN through this",
         true, codesStillPass);
  restore(s);
}

/* ===== ARM 3 — the two NOT_CAPABLE sites drift into two wordings. ===== */
console.log("\nARM 3 · hand-write a SECOND wording at the second NOT_CAPABLE site. MUST FAIL.");
{
  const s = stash(3, INDEX);
  patch(INDEX, `return json({ ok: false, reason: "NOT_CAPABLE", ...admissionRow("NOT_CAPABLE"),
              op, needs: "create_projects",`,
               `return json({ ok: false, reason: "NOT_CAPABLE", ...admissionRow("NOT_CAPABLE"),
              translation: "You cannot make projects here, sorry about that.",
              op, needs: "create_projects",`);
  const a = GATE_SUITE();
  record(3, "admission-gate.test.mjs with the two sites disagreeing", 1, a.exit === 0 ? 0 : 1,
         /byte-identical to the other site/.test(a.out) ? "and the failing arm is the same-sentence one" : "");
  restore(s);
}

/* ===== ARM 4 — the surface goes back to inventing wording. ===== */
console.log("\nARM 4 · revert app.html's `a.translation` line. MUST FAIL (the UI suite).");
{
  const s = stash(4, APP);
  patch(APP, "  if(a && typeof a.translation === \"string\" && a.translation) return a.translation;\n", "");
  const u = UI_SUITE();
  record(4, "admission-translation.test.mjs with the surface re-inventing wording", 1, u.exit === 0 ? 0 : 1);
  restore(s);
}

/* ===== ARM 5 — OVER-STRICTNESS. A translation in an unanticipated voice. ===== */
console.log("\nARM 5 · OVER-STRICTNESS — a code that IS translated, in a spelling nothing anticipated.");
console.log("        MUST **NOT** FAIL, and arm F must NOT name it in any untranslated partition.");
{
  const s = stash(5, CHECKS);
  patch(CHECKS, "translation: 'Nothing in this request said who you are. Sign in, or send a credential this '\n      + 'instance issued, and try again.',",
                "translation: '\\u00bfQui\\u00e9n eres? Esta petici\\u00f3n no lo dijo \\u2014 inicia sesi\\u00f3n, "
              + "o env\\u00eda una credencial emitida por esta instancia, y vuelve a intentarlo.',");
  const g = THE_GUARD();
  const named = /F[1-6][^\n]*NOT_AUTHENTICATED/.test(g.out);
  record(5, "the DEC-49 guard over a Spanish translation with an em-dash and a question", 0, g.exit,
         "a correct sentence in an unfamiliar voice is still a sentence");
  record("5b", "arm F names NOT_AUTHENTICATED as untranslated", false, named,
         "over-strictness: a translated code in an unanticipated spelling must not be reported untranslated");
  restore(s);
}

/* ===== ARM 6 — THE SHARPEST. Neuter the widened outcome reader. ===== */
console.log("\nARM 6 · neuter the WRAPPED-RETURN reader — the thing that made the control plane visible at all.");
console.log("        MUST FAIL: `is-admission` would resolve, be well-formed, be correctly nested, and judge NOTHING.");
{
  const s = stash(6, GUARD);
  patch(GUARD, "        const w = /^(?:new\\s+)?[A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*\\s*\\(\\s*/.exec(text.slice(i, i + 120));",
               "        const w = null;");
  const g = THE_GUARD();
  const zero = /judged NO refusal inside the region `is-admission`/.test(g.out);
  record(6, "the DEC-49 guard with the wrapped-return reader neutered", 1, g.exit === 0 ? 0 : 1);
  record("6b", "and it says the region judged NOTHING rather than passing over it", true, zero,
         "a blind reader over a real region is the WRONG SPAN failure arriving through the instrument");
  restore(s);
}

/* ===== ARM 7 — neuter arm F's own walk. MUST FAIL on the floor, corpus printed. ===== */
console.log("\nARM 7 · neuter arm F's subject so it partitions NOTHING. MUST FAIL on the floor, with the corpus PRINTED.");
{
  const s = stash(7, GUARD);
  patch(GUARD, "  const untranslated = [...census.union].filter(c => !translated.has(c)).sort();",
               "  const untranslated = [];");
  const g = THE_GUARD();
  const printed = /arm F has 0 untranslated code\(s\) to partition, floor is \d+/.test(g.out);
  record(7, "the DEC-49 guard with arm F's subject emptied", 1, g.exit === 0 ? 0 : 1);
  record("7b", "and the failure PRINTS the corpus and the floor rather than going quietly green", true, printed);
  restore(s);
}

/* ===== ARM 8 — break the partition's disjointness. MUST FAIL on the sum. ===== */
console.log("\nARM 8 · let a code land in TWO partitions. MUST FAIL on the sum, which is gated at zero.");
{
  const s = stash(8, GUARD);
  patch(GUARD, "    else                                                 put(\"F6 out of reach, one site — needs a sentence WHEN its surface exists\", c);",
               "    else { put(\"F6 out of reach, one site — needs a sentence WHEN its surface exists\", c);\n"
             + "           put(\"F6 out of reach, one site — needs a sentence WHEN its surface exists\", c); }");
  const g = THE_GUARD();
  const said = /arm F's partitions sum to \d+ but there are \d+ untranslated codes/.test(g.out);
  record(8, "the DEC-49 guard with a code double-counted", 1, g.exit === 0 ? 0 : 1);
  record("8b", "and it names the sum it got against the sum it owed", true, said);
  restore(s);
}

/* ===== ARM 9 — OVER-STRICTNESS on the widened reader. ===== */
console.log("\nARM 9 · OVER-STRICTNESS on the reader — a wrapped SUCCESS inside the governed region.");
console.log("        MUST **NOT** FAIL: grading a success as a refusal is the direction that floods the guard.");
{
  const s = stash(9, INDEX);
  patch(INDEX, "    const storeName = scope.name;",
               "    if (url.searchParams.get(\"__rec79_never\") === \"1\")\n"
             + "      return json({ ok: true, note: \"a success in return position, wrapped, inside the region\" }, 200);\n"
             + "    const storeName = scope.name;");
  const g = THE_GUARD();
  const flagged = /CODELESS REFUSAL[^\n]*is-admission/.test(g.out);
  record(9, "the DEC-49 guard over a wrapped SUCCESS inside `is-admission`", 0, g.exit,
         "a declared success must not be conscripted into the refusal corpus");
  record("9b", "and it is not reported as a codeless refusal", false, flagged);
  restore(s);
}

/* ============================================================ */
console.log("\n================ SUMMARY ================");
for (const r of results)
  console.log(`  arm ${String(r.arm).padEnd(3)} ${r.agree ? "AGREES  " : "DISAGREE"}  declared=${r.declared} actual=${r.actual}  ${r.what}`);
const wrong = results.filter((r) => !r.agree);
console.log(`\n${results.length} arm(s), ${wrong.length} disagreeing with what was declared before arming.`);
if (wrong.length) {
  console.log("A DISAGREEMENT IS A FINDING ABOUT THE ARM AND MUST BE RECORDED, NOT SMOOTHED.");
  process.exit(1);
}
console.log("Every arm behaved as declared. Tree restored and verified by sha256 AND by content.");
