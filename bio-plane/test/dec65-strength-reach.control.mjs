/* PL-20 — THE NEGATIVE CONTROL FOR `dec65-strength-reach.test.mjs`.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES while it runs, and
 * `scripts/battery.mjs` discovers suites by filename. A concurrent battery
 * against a patched `store.mjs` is how one worker's arm became another
 * worker's baseline, so this file is run BY HAND and never by the runner.
 *
 * THE DISCIPLINE, and every clause of it is a receipt this repository paid for:
 *   - EVERY ARM IS ARMED ALONE, with every other defence held OPEN. Two arms at
 *     once cannot tell which one a failure belongs to.
 *   - A BASELINE ARM RUNS FIRST. A harness whose every arm reports the same
 *     thing is indistinguishable from six broken arms without one.
 *   - AN OVER-STRICTNESS ARM RUNS LAST and MUST PASS: correct work in a
 *     spelling nobody anticipated must not be refused.
 *   - EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT, against a
 *     UNIQUELY-NAMED per-arm pristine copy, with the byte count PRINTED and
 *     FLOORED and the empty-string digest refused outright — two harnesses once
 *     reported a restore byte-identical OVER AN EMPTY MANIFEST.
 *   - AN ARM THAT DID NOT ARM IS A FINDING. Every patch asserts it matched, and
 *     asserts it matched EXACTLY ONCE.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM. Recorded, not smoothed.
 *
 * ============================ MEASURED RESULTS ============================
 * RUN 2026-08-09 · pl20-dec65-step-three · worktree agent-a04afa9454cdf0bc2 ·
 * `main` at 1081a6a (PL-17 merged; PL-19 committed on
 * worktree-agent-a875e2afd837947d7 and NOT merged).
 * store.mjs 24468 lines / sha256 recorded per arm below; bio-checks.mjs
 * untouched by every arm.
 *
 * TWO OF THE SEVEN DECLARATIONS WERE WRONG ON THEIR FIRST RUN. Both are
 * recorded as findings and the DECLARATIONS were corrected — never the guards
 * that caught them. Neither was the instrument being wrong about the subject;
 * both were this file being wrong about its own arm, which is the thing a
 * declaration exists to expose.
 *
 *   (0) BASELINE, nothing patched ............... 27 pass, 0 fail   AS DECLARED
 *   (1) the arithmetic READS the field .......... 22 pass, 5 fail   DECLARED 2
 *       — `#strengthWalk`'s `site` carries `asserted_by`. It changes NO
 *       behaviour: every letter, every weakest leg and both differentials are
 *       unmoved, which is the arm's whole point — the pin sees a READ that a
 *       behavioural suite cannot. THE THREE EXTRA FAILURES ARE THE SUITE'S OWN
 *       GUARDS FIRING, and they are the reason this arm is worth more than its
 *       declaration was: the suite's in-memory sensitivity mutation is anchored
 *       on THE SAME LINE this arm patches, so it could not apply — and the suite
 *       said so out loud through its `an arm that never armed is a finding`
 *       assertion instead of passing quietly over a mutation that did nothing.
 *   (2) the field named in a COMMENT only ....... 27 pass, 0 fail   AS DECLARED
 *       — a sweep that cited its own prose would have reported a reader here.
 *   (3) the scanner's regex arm removed ......... 25 pass, 2 fail   DECLARED 3
 *       — the desync self-check fires and the call-site roster goes with it:
 *       `suggestVersion` and thirteen other methods are swallowed into a
 *       neighbour's span, which is the instrument defect this file's own first
 *       build shipped with. THE CLOSURE AND THE PROPERTY VOCABULARY SURVIVE A
 *       DESYNCED SCANNER INTACT — so those two assertions are the ONLY things
 *       standing between a broken scanner and a result that reads perfectly
 *       clean, and that is a fact about this instrument worth knowing.
 *   (4) the partition collapsed to one part ..... 23 pass, 4 fail   AS DECLARED
 *       — `#axisResult` buckets every leg into the implicit part. The two
 *       ATTRIBUTION EQUALITIES STAY GREEN over an arithmetic that has stopped
 *       composing at all, which is the receipt that an equality costing nothing
 *       is not evidence and that §3's sensitivity arm is load-bearing.
 *   (5) THE REAL STEP TWO, unpatched suite against PL-19's own sources, run in a
 *       scratch `git worktree` at 4b3f7a7 ..... 25 pass, 2 fail   AS DECLARED
 *       — and the two are EXACTLY §4's defect pins, which is what "written to
 *       fail when step two lands" is supposed to mean. Everything else is
 *       byte-identical, INCLUDING the closure (8), the property vocabulary (47)
 *       and both differentials: the reach answer is a property of
 *       `#strengthWalk`, and PL-19 did not touch it. This arm is not a patch —
 *       it is the other tree, which is stronger than any hand-written stand-in.
 *   (6) OVER-STRICTNESS: the ground rows attributed in spellings nobody
 *       anticipated ................................ 27 pass, 0 fail   AS DECLARED
 *       — unicode, an apostrophe, an email shape, a parenthetical role, and a
 *       member whose NAME CONTAINS the minted no-claim literal. Every one is a
 *       genuine member's claim, every one is accepted at the write, and the
 *       pair is unmoved.
 *
 * ZERO RESTORE PROBLEMS: every arm's post-restore sha256 equalled its pristine
 * copy's AND `cmp` reported no difference; every byte count printed above the
 * floor; no digest equalled e3b0c442….
 * ==========================================================================
 *
 * HOW TO RUN:  cd bio-plane && node test/dec65-strength-reach.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(ROOT, "test", "dec65-strength-reach.test.mjs");
const EMPTY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const FLOOR_BYTES = { [STORE]: 500000, [SUITE]: 20000 };

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const bytes = (p) => readFileSync(p).length;

let problems = 0;
const say = (s) => console.log(s);

function pristine(arm, file) {
  const copy = `${file}.pristine-${arm}`;
  if (existsSync(copy)) throw new Error(`a pristine copy for arm ${arm} already exists: ${copy}`);
  copyFileSync(file, copy);
  const d = sha(copy), n = bytes(copy);
  if (d === EMPTY || n === 0) throw new Error(`arm ${arm}: pristine copy of ${file} is EMPTY (${d})`);
  if (n < FLOOR_BYTES[file]) throw new Error(`arm ${arm}: pristine ${file} is ${n} bytes, below the floor ${FLOOR_BYTES[file]}`);
  say(`    pristine ${file.split("/").slice(-2).join("/")}  ${n} bytes  sha256 ${d.slice(0, 16)}…`);
  return { copy, d, n };
}
function restore(arm, file, p) {
  copyFileSync(p.copy, file);
  const d = sha(file), n = bytes(file);
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", file, p.copy]); } catch { cmpOk = false; }
  const ok = d === p.d && n === p.n && cmpOk;
  say(`    restore  ${ok ? "VERIFIED" : "*** FAILED ***"}  ${n} bytes  sha256 ${d.slice(0, 16)}…  cmp ${cmpOk ? "identical" : "DIFFERS"}`);
  if (!ok) problems++;
  unlinkSync(p.copy);
}
/* AN ARM THAT DID NOT ARM IS A FINDING, so a patch asserts it matched and
   asserts it matched EXACTLY ONCE — an anchor occurring twice has silently
   armed two places, which is a different experiment from the one declared. */
function patch(file, from, to) {
  const src = readFileSync(file, "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor matched ${n} times in ${file}\n  ${from.slice(0, 120)}`);
  writeFileSync(file, src.split(from).join(to));
}
function runSuite(dir = ROOT, file = "test/dec65-strength-reach.test.mjs") {
  let out = "";
  try {
    out = execFileSync(process.execPath, [file], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { out = `${e.stdout ?? ""}${e.stderr ?? ""}`; }
  const m = /dec65-strength-reach: (\d+) pass, (\d+) fail/.exec(out);
  /* A MISSING TALLY IS REPORTED AS -1 AND NEVER AS 0: a suite that died before
     its foot has not passed nothing, it has told us nothing. */
  const tally = m ? { pass: +m[1], fail: +m[2] } : { pass: -1, fail: -1 };
  const failed = out.split("\n").filter((l) => l.trim().startsWith("FAIL")).map((l) => l.trim().slice(0, 110));
  return { tally, failed, out };
}
const report = (arm, want, got, note = "") => {
  const ok = got.tally.pass === want.pass && got.tally.fail === want.fail;
  say(`    RESULT   ${got.tally.pass} pass, ${got.tally.fail} fail  —  ${ok ? "AS DECLARED" : "*** NOT AS DECLARED *** (declared "
      + `${want.pass}/${want.fail})`}${note ? "  " + note : ""}`);
  for (const f of got.failed) say(`      ${f}`);
  if (!ok) problems++;
};

say("PL-20 · dec65-strength-reach · NEGATIVE CONTROL");
say(`node ${process.version} · ${new Date().toISOString()}`);

/* ---------------------------------------------------------------- ARM 0 */
say("\n(0) BASELINE — nothing patched. MUST be all green; a harness whose baseline is red");
say("    cannot tell six broken arms from six working ones.");
const BASE = runSuite();
say(`    RESULT   ${BASE.tally.pass} pass, ${BASE.tally.fail} fail`);
if (BASE.tally.fail !== 0) { say("    *** BASELINE IS RED — every arm below is uninterpretable ***"); problems++; }
const WHOLE = BASE.tally.pass;

/* ---------------------------------------------------------------- ARM 1 */
say("\n(1) THE ARITHMETIC READS THE FIELD — `#strengthWalk`'s `site` carries `asserted_by`.");
say("    MUST FAIL: the reach assertion, the property vocabulary, the comment-only check, the");
say("    licence statement, AND the suite's own arm-did-not-arm guard. MUST NOT FAIL: anything");
say("    behavioural — the patch changes no letter, which is exactly why a driven suite could");
say("    not see it and this pin must.");
say("    DECLARED 2, MEASURED 5 ON THE FIRST RUN, AND THE CORRECTION IS THE FINDING: the");
say("    suite's in-memory sensitivity mutation is anchored on THE SAME LINE this arm patches,");
say("    so under this arm it cannot apply — and the suite SAID SO through its own");
say("    `an arm that never armed is a finding` assertion rather than passing quietly. The");
say("    comment-only check falls with it for the same reason (the real source now reads the");
say("    field, so the comment copy does too). Both are the guards working, not the arm");
say("    misfiring, so the declaration is corrected here rather than the guards loosened.");
{
  const p = pristine("a1", STORE);
  patch(STORE, `                     ground: leg.ground ?? null };`,
               `                     ground: leg.ground ?? null, asserted_by: leg.asserted_by ?? null };`);
  report("1", { pass: WHOLE - 5, fail: 5 }, runSuite());
  restore("a1", STORE, p);
}

/* ---------------------------------------------------------------- ARM 2 */
say("\n(2) THE FIELD NAMED IN A COMMENT INSIDE THE ARITHMETIC AND NOWHERE ELSE.");
say("    MUST NOT FAIL. A sweep that cites its own prose reports a reader that is not there,");
say("    and this repository has already had a sweep arm fail by citing itself.");
{
  const p = pristine("a2", STORE);
  patch(STORE, `  #strengthWalk(bundleId, depth, bound, legsOverride = null) {`,
               `  /* control arm 2: the words asserted_by, in a comment and nowhere else */\n`
             + `  #strengthWalk(bundleId, depth, bound, legsOverride = null) {`);
  report("2", { pass: WHOLE, fail: 0 }, runSuite());
  restore("a2", STORE, p);
}

/* ---------------------------------------------------------------- ARM 3 */
say("\n(3) THE SCANNER'S REGEX ARM REMOVED — the instrument's own defect, re-armed.");
say("    MUST FAIL: the desync self-check AND the call-site roster. This is the arm that says");
say("    the self-check is doing work rather than decorating a scanner that happens to be right.");
say("    DECLARED 3, MEASURED 2, and the correction matters: the CLOSURE and the property");
say("    vocabulary survive a desynced scanner intact, so the desync check and the roster are");
say("    the ONLY two things standing between a broken scanner and a result that reads clean.");
{
  const p = pristine("a3", SUITE);
  patch(SUITE, `      if (c === "/" && (REGEX_OK_AFTER.has(lastSig) || KEYWORD_BEFORE.test(code.slice(-24)))) {`,
               `      if (false) {`);
  report("3", { pass: WHOLE - 2, fail: 2 }, runSuite());
  restore("a3", SUITE, p);
}

/* ---------------------------------------------------------------- ARM 4 */
say("\n(4) THE PARTITION COLLAPSED — `#axisResult` buckets every leg into one implicit part.");
say("    MUST FAIL: both non-degeneracy assertions, the SENSITIVITY assertion, and the harm.");
say("    MUST NOT FAIL: the two attribution EQUALITIES — and that is the finding, not an");
say("    accident: they stay green over an arithmetic that has stopped composing at all.");
{
  const p = pristine("a4", STORE);
  patch(STORE, `    for (const m of members) at(m.ground ?? null).members.push(m);`,
               `    for (const m of members) at(null).members.push(m);`);
  report("4", { pass: WHOLE - 4, fail: 4 }, runSuite());
  restore("a4", STORE, p);
}

/* ---------------------------------------------------------------- ARM 5 */
say("\n(5) THE REAL STEP TWO — the UNPATCHED suite against PL-19's own sources, in a scratch");
say("    `git worktree` (never `git stash`, whose ref is repository-wide across every");
say("    checkout). MUST FAIL: exactly §4's two defect pins, because PL-19's `C-25.6`");
say("    refuses the write. MUST NOT FAIL: the reach, the supply or either differential —");
say("    the answer is a property of `#strengthWalk`, which PL-19 did not touch.");
{
  const PL19 = "4b3f7a7";
  const tmp = mkdtempSync(join(tmpdir(), "pl20-arm5-"));
  const wt = join(tmp, "tree");
  let ran = null;
  try {
    execFileSync("git", ["worktree", "add", "--detach", wt, PL19], { cwd: ROOT, stdio: "pipe" });
    execFileSync("ln", ["-s", join(ROOT, "node_modules"), join(wt, "bio-plane", "node_modules")]);
    copyFileSync(SUITE, join(wt, "bio-plane", "test", "dec65-strength-reach.test.mjs"));
    ran = runSuite(join(wt, "bio-plane"));
  } catch (e) {
    say(`    *** ARM 5 COULD NOT ARM: ${String(e.message).slice(0, 200)} ***`);
    say(`    (PL-19 is committed on worktree-agent-a875e2afd837947d7 and unmerged; if CONDUCT`);
    say(`     has since integrated it, this arm is subsumed by the battery and can be struck.)`);
    problems++;
  } finally {
    try { execFileSync("git", ["worktree", "remove", "--force", wt], { cwd: ROOT, stdio: "pipe" }); } catch {}
    rmSync(tmp, { recursive: true, force: true });
  }
  if (ran) report("5", { pass: WHOLE - 2, fail: 2 }, ran, "(the two are §4's pins, by name)");
}

/* ---------------------------------------------------------------- ARM 6 */
say("\n(6) OVER-STRICTNESS — the ground rows attributed in spellings nobody anticipated.");
say("    MUST NOT FAIL. A gate tighter than its rule is not a safer gate, and an instrument");
say("    that only recognises the names its author happened to type is not measuring the rule.");
{
  const p = pristine("a6", SUITE);
  patch(SUITE, `      \`    asserted_by: \${r.by ?? "carol"}\`, \`    at: "\${r.at ?? AT1}"\`,`,
               `      \`    asserted_by: \${r.by ?? "Ruth O’Brien-Kaur (acting chair)"}\`, \`    at: "\${r.at ?? AT1}"\`,`);
  patch(SUITE, `...scalarLine("asserted_by", g.by ?? "ruth"),`,
               `...scalarLine("asserted_by", g.by ?? "none-of-the-above ruth@believeinoakland.org"),`);
  report("6", { pass: WHOLE, fail: 0 }, runSuite());
  restore("a6", SUITE, p);
}

say(`\n${problems ? `*** ${problems} PROBLEM(S) — read every line above ***` : "every arm as declared; every restore verified by sha256 AND by cmp"}`);
process.exit(problems ? 1 : 0);
