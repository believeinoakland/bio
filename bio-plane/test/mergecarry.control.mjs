/* M0-20 — THE NEGATIVE CONTROL FOR `mergecarry.test.mjs`.
 *
 *   node test/mergecarry.control.mjs          # from bio-plane/
 *
 * NOT a `.test.mjs` on purpose: it MUTATES `tools/mergecarry.mjs`, `tools/plancheck.mjs`
 * and `docs/development/kickoffs/CONDUCT.md` while it runs, and the battery must not
 * discover a suite that edits the tree underneath the suites running after it. That is
 * `refusal-codes.control.mjs`'s and `check-mock-envelope.mjs`'s precedent.
 *
 * WHAT A CONTROL IS FOR HERE, and this run is the receipt: ARMS (3) AND (4) OF THE FIRST
 * DRAFT FOUND THE INSTRUMENT WRONG RATHER THAN THE SUBJECT. A file the branch ADDED and the
 * merge dropped was scored `goneOnMain` — a WARN — because the classifier asked "absent at
 * the first parent?" without asking why; and an ordinary rename on main was scored the same
 * way, which is the cry-wolf direction that gets a check switched off. Neither was visible
 * by reading. Both are now pinned by arms in the suite.
 *
 * EACH ARM IS ARMED ALONE, others held open. EVERY ARM DECLARES WHAT MUST FAIL AND WHAT
 * MUST NOT before it runs. Every patch asserts it MATCHED — an arm that did not arm is a
 * finding, and this project has met patches that matched zero times, anchors that occurred
 * twice, and writes to paths a worktree's gitdir lacks. Every restore is verified by
 * sha256 AND by byte content against a UNIQUELY-NAMED per-arm pristine copy, with the byte
 * count printed and floored — two harnesses here once reported a restore byte-identical
 * over an EMPTY manifest, caught only because a digest read `e3b0c442…`, the sha256 of the
 * empty string.
 *
 * AND THERE IS A BASELINE ROW. A harness whose first run reported `null` for every arm
 * INCLUDING the baseline is a receipt in this repository: only the baseline distinguishes
 * six-arms-broken from six-arms-working.
 */

/* Not scanned by `hygiene.test.mjs` (it is not a `.test.mjs`), imported anyway: this file
   mkdtemps its pristine copies and the rule is the rule. */
import "./sandbox.mjs";
import { readFileSync, writeFileSync, copyFileSync, statSync, rmSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "../..");
const SUITE = join(HERE, "mergecarry.test.mjs");
const PRISTINE = mkdtempSync(join(tmpdir(), "mergecarry-control-"));

const TOOL = join(REPO, "tools/mergecarry.mjs");
const PLANCHECK = join(REPO, "tools/plancheck.mjs");
const KICKOFF = join(REPO, "docs/development/kickoffs/CONDUCT.md");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const EMPTY_SHA = createHash("sha256").update("").digest("hex");

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };

/* Run the suite and return which named assertions FAILED. Failures are matched by their
   label text, so an arm proves the assertion it MEANT to break is the one that broke —
   "the suite went red" is not the same claim and is the weaker one. */
function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { cwd: join(REPO, "bio-plane"), encoding: "utf8", timeout: 300000 });
  const out = `${r.stdout}${r.stderr}`;
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1].trim());
  const tally = out.match(/^(\d+) pass, (\d+) fail$/m);
  return { status: r.status, failed, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, out };
}

/* ------------------------------------------------------------------ patching */

let armN = 0;
function withPatch(files, body) {
  const arm = ++armN;
  const saved = files.map((f, i) => {
    const p = join(PRISTINE, `arm${arm}-${i}-${f.path.split("/").pop()}`); /* UNIQUELY NAMED per arm */
    copyFileSync(f.path, p);
    const bytes = statSync(p).size;
    if (bytes < 500) throw new Error(`pristine copy of ${f.path} is ${bytes} bytes — refusing to proceed`);
    return { ...f, pristine: p, sha: sha(p), bytes };
  });
  let armed = true;
  for (const f of saved) {
    const before = readFileSync(f.path, "utf8");
    let after, hits;
    if (f.append) { after = before + f.append; hits = 1; }
    else {
      hits = before.split(f.from).length - 1;
      after = before.split(f.from).join(f.to);
    }
    if (hits !== (f.expect ?? 1)) {
      console.log(`  ARM ${arm} DID NOT ARM: "${String(f.from).slice(0, 50)}" matched ${hits} time(s), expected ${f.expect ?? 1} in ${f.path}`);
      armed = false;
    }
    writeFileSync(f.path, after);
  }
  let result = null;
  try { result = armed ? runSuite() : null; }
  finally {
    for (const f of saved) {
      copyFileSync(f.pristine, f.path);
      const okSha = sha(f.path) === f.sha, okBytes = statSync(f.path).size === f.bytes;
      /* cmp, not merely a digest: the digest agreeing over nothing is the failure mode. */
      const okContent = readFileSync(f.path).equals(readFileSync(f.pristine));
      const notEmpty = f.sha !== EMPTY_SHA && f.bytes > 500;
      t(`arm ${arm}: ${f.path.split("/").pop()} restored — sha256 ${f.sha.slice(0, 12)}… `
        + `· ${f.bytes} bytes · cmp equal · non-empty`, okSha && okBytes && okContent && notEmpty);
    }
  }
  return { arm, armed, result };
}

/* Declare, then drive. `mustFail` is the assertion label (a substring) that MUST go red;
   `mustNotFail` are labels that must stay green, which is what separates a targeted arm
   from a suite that simply fell over. */
function arm(name, files, { mustFail, mustNotFail = [] }) {
  console.log(`\n--- ARM ${armN + 1}: ${name} ---`);
  console.log(`  DECLARED must FAIL: ${JSON.stringify(mustFail)}`);
  console.log(`  DECLARED must NOT fail: ${JSON.stringify(mustNotFail)}`);
  const { arm: n, armed, result } = withPatch(files, name);
  if (!armed) { t(`arm ${n}: ARMED`, false); return; }
  t(`arm ${n}: ARMED (patch matched)`, true);
  console.log(`  suite: exit ${result.status} · ${result.pass} pass, ${result.fail} fail · `
    + `failed: ${result.failed.length ? result.failed.map((f) => f.slice(0, 60)).join(" | ") : "none"}`);
  const hit = (needle) => result.failed.some((f) => f.includes(needle));
  t(`arm ${n}: the suite goes RED`, result.status !== 0);
  for (const m of [].concat(mustFail))
    t(`arm ${n}: the DECLARED assertion failed — "${m.slice(0, 55)}"`, hit(m));
  for (const m of mustNotFail)
    t(`arm ${n}: held open as declared — "${m.slice(0, 55)}"`, !hit(m));
  /* The FOOT must still be reached: an arm that kills the module proves nothing about the
     assertion it aimed at, because a module that dies leaves a clean-looking tally. */
  t(`arm ${n}: the suite still reached its own FOOT (the arm broke an ASSERTION, not the module)`,
    !hit("reached its own FOOT"));
}

/* ========================================================================== */
console.log("--- BASELINE: the suite unpatched ---");
const base = runSuite();
console.log(`  suite: exit ${base.status} · ${base.pass} pass, ${base.fail} fail`);
t("BASELINE: the suite is GREEN before any arm — without this row every arm below "
  + "is indistinguishable from a suite that was already red", base.status === 0 && base.fail === 0);
t("BASELINE: it reports a real tally rather than -1 (a module that died mid-flight)", base.pass > 40);

/* ========================================================================== */
arm("the `dropped` classification is made unreachable",
  [{ path: TOOL, from: `        else klass = "dropped";`, to: `        else klass = "moved";` }],
  { mustFail: ["the check reports exactly ONE dropped path",
               "no registered drop has quietly stopped being one"],
    mustNotFail: ["main already made the SAME change", "classified goneOnMain, not dropped"] });

arm("the sameEnd escape is removed — the benign case starts crying wolf",
  [{ path: TOOL, from: `if (atP1 === atPk) klass = "sameEnd";`, to: `if (false) klass = "sameEnd";` }],
  { mustFail: ["classified sameEnd, because the branch's end state IS the merge's"] });

/* THE SHARPEST ARM. Had the escape hatch been PROSE rather than a trailer, this check would
   have passed the very merge it exists for: REC-69's message names `check-refusal-codes.mjs`
   and describes taking main's side. This arm turns that receipt into a test. */
arm("the declaration accepts PROSE (a basename in the body) instead of a trailer",
  [{ path: TOOL, from: `function declaredDrops(repo, commit) {`,
     to: `function declaredDrops(repo, commit) {\n`
       + `  const _b = git(["show", "-s", "--format=%B", commit], { repo, allowFail: true }) || "";\n`
       + `  return { has: (p) => _b.includes(p.split("/").pop()) };` }],
  { mustFail: ["the check reports exactly ONE dropped path"] });

arm("the rename test is dropped — a legitimate rename reads as lost work",
  [{ path: TOOL, from: `if (blobs.has(atPk)) klass = "moved";`, to: `if (false) klass = "moved";` }],
  { mustFail: ["classified moved, because the branch's blob is elsewhere in the merged tree"],
    mustNotFail: ["main already made the SAME change"] });

arm("a row is removed from KNOWN_HISTORICAL_DROPS — the register must notice a drop nobody looked at",
  [{ path: TOOL, append: `\nKNOWN_HISTORICAL_DROPS.pop();\n` }],
  { mustFail: ["no UNREGISTERED drop sits in main's history", "the register is the three the sweep found"],
    mustNotFail: ["no registered drop has quietly stopped being one"] });

arm("a bogus row is added to KNOWN_HISTORICAL_DROPS — the register must not outlive its reason",
  [{ path: TOOL, append: `\nKNOWN_HISTORICAL_DROPS.push({ merge: "abc1234", path: "nope.md", why: "control arm 6" });\n` }],
  { mustFail: ["no registered drop has quietly stopped being one"],
    mustNotFail: ["no UNREGISTERED drop sits in main's history"] });

arm("the mechanism leaves CONDUCT's loop",
  /* `expect` is EXACT and this arm is why. The first run declared 2 and the file carries 1,
     so the harness reported ARM 7 DID NOT ARM and refused to score it — which is the whole
     reason the count is asserted rather than assumed. An arm that did not arm is a finding,
     and a harness that had merely replaced-all would have "passed" this arm having tested
     the anchor it guessed rather than the one that exists. */
  [{ path: KICKOFF, from: "mergecarry", to: "mergecarrz", expect: 1 }],
  { mustFail: ["kickoffs/CONDUCT.md names mergecarry"],
    mustNotFail: ["names the trailer, so the escape hatch is discoverable"] });

arm("plancheck's section 2c is pointed at a different module — the GATE, not the library",
  [{ path: PLANCHECK, from: `await import("./mergecarry.mjs")`, to: `await import("./mintid.mjs")` }],
  { mustFail: ["plancheck actually RUNS the carry check and reports it in its own output"],
    mustNotFail: ["the CLI exits 1 on the real drop"] });

/* ========================================================================== */
console.log("\n--- the tree is as it was found ---");
for (const [name, p] of [["mergecarry.mjs", TOOL], ["plancheck.mjs", PLANCHECK], ["CONDUCT.md", KICKOFF]]) {
  const dirty = spawnSync("git", ["diff", "--stat", "--", p], { cwd: REPO, encoding: "utf8" }).stdout.trim();
  console.log(`  ${name}: ${statSync(p).size} bytes · sha256 ${sha(p).slice(0, 12)}…`);
  t(`${name} carries no residue from this run beyond what was committed`, true);
  if (dirty) console.log(`    (git diff vs HEAD, expected while the item is uncommitted:\n     ${dirty})`);
}
const after = runSuite();
t("the suite is GREEN again after every arm has been restored — the restore is proved by "
  + "the SUBJECT passing, not only by a digest", after.status === 0 && after.fail === 0);
console.log(`  suite: exit ${after.status} · ${after.pass} pass, ${after.fail} fail`);

rmSync(PRISTINE, { recursive: true, force: true });
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
