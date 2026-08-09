/* D-269 · THE NEGATIVE CONTROL DRIVER for `test/analystvocab.test.mjs`.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES while it runs, so the
 * battery must not discover it (`check-refusal-codes.mjs`'s precedent, and
 * PL-2/PL-3/PL-4/PL-14's shape). Run it directly:
 *
 *     node bio-plane/test/analystvocab.control.mjs        (from the repo root)
 *     node test/analystvocab.control.mjs                  (from bio-plane/)
 *
 * WHAT MUST HAPPEN, DECLARED BEFORE ARMING (WORKER.md: *declare before arming
 * what MUST fail and what MUST NOT*):
 *
 *   ARM 1  SUBJECT           MUST FAIL   restore D-269's landed wording
 *   ARM 2  CONCATENATION     MUST FAIL   the same phrase SPLIT across a `+`
 *   ARM 3  CORPUS            MUST FAIL   the fixture matrix emptied
 *   ARM 4  LEXICON           MUST FAIL   the derived machine family emptied
 *   ARM 5  SURFACE           MUST FAIL   app.html stops rendering `detail`
 *   ARM 6  OVER-STRICTNESS   MUST PASS   the banned words used LEGITIMATELY, in
 *                                        a code comment, an internal identifier
 *                                        and a test fixture id — none of which a
 *                                        member ever reads
 *
 * ARM 2 IS THE ONE THIS ITEM EXISTS FOR. UI-43's first matcher read 2 OF 3 and
 * missed the graded branch — the case that actually bites — because the source
 * splits `independently ` from `sufficient grounds` across a boundary. A
 * source-text grep for the joined phrase reads CLEAN over arm 2's tree. The
 * suite drives the composer and classifies the RENDERED string, so it cannot be
 * hidden from this way; if arm 2 ever comes back green, the suite has regressed
 * to a grep and is lying about the size of the problem.
 *
 * ARM 6 IS THE OVER-STRICTNESS ARM AND IT IS NOT OPTIONAL. A fence tighter than
 * its rule is not a safer fence — it is an undeclared interface change wearing
 * the costume of caution. DEC-32 clause 1 bans what a MEMBER READS. It does not
 * ban what the engine is called, what a comment says, or what a fixture is
 * named, and a harness that goes red on those would force the next engineer to
 * write code they cannot explain.
 *
 * EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT (`cmp`-equivalent), against
 * a UNIQUELY-NAMED per-arm pristine copy, with a byte count PRINTED and FLOORED
 * — two harnesses in this project have reported a restore byte-identical OVER
 * AN EMPTY MANIFEST, caught only because a digest read `e3b0c442…`, the sha256
 * of the empty string. The floor here is what makes that impossible.
 *
 * THE BASELINE ROW IS RUN FIRST AND IS NOT OPTIONAL: a harness in this project
 * once reported `null` for every arm INCLUDING the baseline, and only the
 * baseline row distinguished six-arms-broken from six-arms-working.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL("./", import.meta.url));
const PLANE = HERE + "../";
const STORE = PLANE + "src/store.mjs";
const SUITE = HERE + "analystvocab.test.mjs";
const APP = PLANE + "../civicos-ui/app.html";

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const EMPTY_SHA = createHash("sha256").update("").digest("hex");

/* A restore that agrees for free is not a restore. Three independent checks:
   the digest, the byte count against a floor, and a full content compare. */
function verifyRestore(path, pristine, floor) {
  const a = readFileSync(path), b = readFileSync(pristine);
  const da = createHash("sha256").update(a).digest("hex");
  const db = createHash("sha256").update(b).digest("hex");
  const okBytes = a.length >= floor && b.length >= floor;
  const okSha = da === db && da !== EMPTY_SHA;
  const okContent = a.equals(b);
  console.log(`    restore ${path.split("/").pop()}: ${a.length} bytes (floor ${floor}) · sha ${da.slice(0, 12)}… · `
            + `sha=${okSha ? "OK" : "MISMATCH"} content=${okContent ? "OK" : "DIFFERS"} floor=${okBytes ? "OK" : "UNDER"}`);
  if (!(okSha && okContent && okBytes)) { console.log("    RESTORE FAILED — stopping so nothing is left mutated."); process.exit(2); }
}

function runSuite() {
  try {
    execFileSync(process.execPath, [SUITE], { cwd: PLANE, stdio: "pipe" });
    return { green: true, out: "" };
  } catch (e) {
    return { green: false, out: String(e.stdout || "") + String(e.stderr || "") };
  }
}

const FLOORS = { [STORE]: 500000, [SUITE]: 15000, [APP]: 400000 };

/* ONE arm. `edits` is [[path, find, replace], ...]. Others are held open: the
   loop arms exactly one and restores before the next. */
function arm(id, mustFail, what, edits) {
  console.log(`\nARM ${id} — ${what}`);
  console.log(`  DECLARED: the suite MUST ${mustFail ? "FAIL" : "PASS"}.`);
  const pristines = [];
  for (const [path] of edits) {
    const p = `${path}.d269-arm-${id}.pristine`;
    copyFileSync(path, p);
    pristines.push([path, p]);
  }
  let armed = 0;
  for (const [path, find, replace] of edits) {
    const src = readFileSync(path, "utf8");
    const n = src.split(find).length - 1;
    if (n !== 1) {
      console.log(`  !! ARM DID NOT ARM: the patch matched ${n} times in ${path.split("/").pop()} (wanted exactly 1). `
                + `AN ARM THAT DID NOT ARM IS A FINDING, not a pass.`);
      continue;
    }
    writeFileSync(path, src.replace(find, replace));
    armed++;
  }
  console.log(`  armed ${armed} of ${edits.length} edit(s)`);
  /* ARM 2's WHOLE CLAIM, MEASURED ON ITS OWN TREE rather than asserted: with
     the phrase planted SPLIT across a `+`, a source grep for the joined phrase
     finds NOTHING. That is what a matcher reading source text would report. */
  if (id === "2" && armed === edits.length) {
    const src = readFileSync(STORE, "utf8");
    /* THE PRECISE STATEMENT, and the loose one is worth naming because the
       first version of this proof printed it and was wrong: a plain grep for
       `independently sufficient` over store.mjs DOES hit — in REC-42's own
       COMMENTS, which no member reads. What a prose matcher actually scans is
       STRING LITERALS. So the claim is: no SINGLE literal carries the phrase,
       which is what makes a literal-scanning matcher read this tree clean. */
    /* comments stripped FIRST — measured: without this the scan found the
       phrase inside a block comment at store.mjs:4638, where REC-42 QUOTES it
       ("these were independently sufficient" is a claim ANY READER CAN TEST),
       and reported the arm mis-planted when it was not. A quoted phrase in a
       comment is not a literal and is not read by anybody. */
    const noComments = src.replace(/\/\*[\s\S]*?\*\//g, " ");
    const lits = (noComments.match(/`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"/g) || []);
    const inOneLiteral = lits.filter((l) => /independently sufficient/i.test(l)).length;
    const split = /independently `[\s\S]{0,60}\+ `sufficient/i.test(src);
    console.log(`  ARM 2 PROOF: ${lits.length} string literals in store.mjs, and the joined phrase appears inside `
              + `${inOneLiteral} of them${inOneLiteral === 0 ? " — a literal-scanning matcher reads this tree CLEAN" : " (arm mis-planted)"}. `
              + `The SPLIT form is present in the source: ${split ? "yes" : "NO — the arm did not plant what it claims"}. `
              + `The suite still goes red, because it classifies the RENDERED string.`);
  }
  const r = armed === edits.length ? runSuite() : { green: null, out: "" };
  for (const [path, p] of pristines) { copyFileSync(p, path); verifyRestore(path, p, FLOORS[path] || 1000); unlinkSync(p); }
  const verdict = r.green === null ? "DID NOT ARM" : r.green ? "GREEN" : "RED";
  const wanted = mustFail ? "RED" : "GREEN";
  const okArm = verdict === wanted;
  console.log(`  ACTUAL: ${verdict}${okArm ? "" : "   <<< NOT WHAT WAS DECLARED — this is a finding about the ARM"}`);
  if (!r.green && r.out) {
    const named = r.out.split("\n").filter((l) => /FAIL/.test(l)).slice(0, 4);
    for (const l of named) console.log(`    ${l.trim().slice(0, 220)}`);
  }
  return okArm;
}

/* ---------------------------- THE BASELINE ---------------------------- */
console.log("BASELINE — no arm, nothing mutated. If this is not GREEN, every row below is meaningless.");
{
  const r = runSuite();
  console.log(`  BASELINE: ${r.green ? "GREEN" : "RED"}`);
  if (!r.green) { console.log(r.out.split("\n").filter((l) => /FAIL/.test(l)).slice(0, 6).join("\n")); process.exit(2); }
  console.log(`  store.mjs sha ${sha(STORE).slice(0, 16)}… · suite sha ${sha(SUITE).slice(0, 16)}… · app.html sha ${sha(APP).slice(0, 16)}…`);
}

const results = [];

/* ARM 1 · THE SUBJECT — put D-269 back exactly as it landed. */
results.push(["1 SUBJECT", arm("1", true, "restore D-269's landed wording in `#axisResult`", [[STORE,
  "`${axis} ${setter.grade} — the STRONGEST of the ${branches.length} sets of reasons `\n                 + `that each carry this conclusion on their own, which is ${label(best)}, and no stronger `\n                 + `than the weakest ${axis} WITHIN that set, which is ${w.target_id}`",
  "`${axis} ${setter.grade} — the STRONGEST of the ${branches.length} independently `\n                 + `sufficient grounds this conclusion rests on, which is ${label(best)}, and no stronger `\n                 + `than the weakest ${axis} WITHIN that ground, which is ${w.target_id}`"]])]);

/* ARM 2 · THE CONCATENATION TRAP. The forbidden phrase is planted SPLIT across
   a `+`, so `grep -a "independently sufficient" src/store.mjs` finds NOTHING
   on this tree. This is the exact shape that made the first measurement of
   D-269 read 2 of 3. */
results.push(["2 CONCATENATION", arm("2", true, "the forbidden phrase SPLIT across a `+` boundary — invisible to a source grep", [[STORE,
  "`that each carry this conclusion on their own, which is ${label(best)}, and no stronger `",
  "`that each are independently `\n                 + `sufficient for it, which is ${label(best)}, and no stronger `"]])]);

/* ARM 3 · THE CORPUS. A sweep over nothing reports clean — three headline
   totality assertions in this project have passed over an empty corpus. */
/* RECORDED RATHER THAN SMOOTHED, because it is the finding this arm produced
   about itself. ARM 3's FIRST version patched `const MATRIX = [` into
   `const MATRIX = [].concat([`, which (a) does not empty anything —
   `[].concat([a,b])` is `[a,b]` — and (b) left the closing bracket unbalanced.
   The suite went RED, the arm read "as declared", AND THE REASON WAS A
   SyntaxError. An arm that fails for the wrong reason is indistinguishable from
   one that works until somebody reads the output: the give-away was that no
   `FAIL` line was named under it, where every other red arm named one. The arm
   now empties the corpus at the LOOP, which keeps the file parseable and makes
   the floor the thing under test. */
results.push(["3 CORPUS", arm("3", true, "the fixture matrix emptied — the floor must catch a sweep over nothing", [[SUITE,
  "  for (const [name, mk] of MATRIX) {",
  "  for (const [name, mk] of []) {"]])]);

/* ARM 4 · THE LEXICON. A derived ban family that derives nothing bans nothing,
   and would leave §4 reporting clean over the very sentence D-269 removed. */
results.push(["4 LEXICON", arm("4", true, "the derived machine-side lexicon emptied", [[SUITE,
  "  return out;\n}\n\n/* MEMBER SIDE:",
  "  return new Set();\n}\n\n/* MEMBER SIDE:"]])]);

/* ARM 5 · THE SURFACE. The suite's verdict only reaches a member because the
   surface prints the plane's sentence and adds nothing to it. */
results.push(["5 SURFACE", arm("5", true, "`axisPanel` stops rendering the plane's `detail` verbatim", [[APP,
  "${a.detail?`<div class=\"subj-how\">${esc(a.detail)}</div>`:\"\"}\n      ${counts}</div>`;\n  }\n  if(state === \"unrated\"){",
  "${a.detail?`<div class=\"subj-how\">${esc(String(a.detail).split(\" — \")[0])}</div>`:\"\"}\n      ${counts}</div>`;\n  }\n  if(state === \"unrated\"){"]])]);

/* ARM 6 · OVER-STRICTNESS, AND IT MUST NOT FAIL. Three legitimate uses of the
   banned words, all at once, none of them read by a member:
     (a) a BLOCK COMMENT inside `#axisResult` using the analyst's own register,
     (b) an INTERNAL IDENTIFIER named for the machine's structure,
     (c) a TEST FIXTURE id in the suite's own matrix carrying a banned word.
   If any of these goes red, the ban has stopped being about what a member reads
   and has become a ban on how the engine may be written. */
results.push(["6 OVER-STRICTNESS", arm("6", false,
  "the banned words used LEGITIMATELY — a comment, an identifier and a fixture id", [
  [STORE,
   "    const grounds = keys.map((k) => Store.#groundResult(k, bucket.get(k).members, bucket.get(k).exhausted));",
   "    /* The OR part over the grounds partition: each labelled branch is a\n"
   + "       disjunct, and the axis takes the maximum across them. */\n"
   + "    const groundPartitionDisjunctBranches = keys.length;\n"
   + "    void groundPartitionDisjunctBranches;\n"
   + "    const grounds = keys.map((k) => Store.#groundResult(k, bucket.get(k).members, bucket.get(k).exhausted));"],
  [SUITE,
   "const P = (n) => `PLACEHOLDER-${n}`;",
   "const P = (n) => `PLACEHOLDER-${n}`;\n/* a fixture id carrying the word, on purpose: fixtures are not surfaces. */\nconst FIXTURE_GROUND_PARTITION_DISJUNCT = \"or-branch-ground-partition\";\nvoid FIXTURE_GROUND_PARTITION_DISJUNCT;"],
]) ]);

/* ------------------------------- THE ROLL ------------------------------- */
console.log("\n================ THE ROLL ================");
let wrong = 0;
for (const [name, okArm] of results) { console.log(`  ${okArm ? "as declared" : "NOT AS DECLARED"}   ARM ${name}`); if (!okArm) wrong++; }
console.log(`\nanalystvocab.control: ${results.length - wrong} of ${results.length} arms behaved as declared.`);
if (wrong) console.log("A SURPRISING RESULT IS A FINDING ABOUT THE ARM. Record it; do not smooth it.");
for (const p of [STORE, SUITE, APP])
  if (existsSync(p + ".d269-arm-1.pristine")) console.log(`  !! a pristine copy survived for ${p} — the tree may be mutated.`);
process.exit(wrong ? 1 : 0);
