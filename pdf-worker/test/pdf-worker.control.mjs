#!/usr/bin/env node
/* pdf-worker — THE NEGATIVE-CONTROL DRIVER for `test/pdf-worker.test.mjs`.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so
 * neither `scripts/battery.mjs` (which discovers `*.test.mjs` in a fleet
 * member's testDir) nor `scripts/coverage.mjs`'s fleet walk must find it.
 * PL-3/PL-4/PL-11/FL-2's precedent, and FL-2's driver is the file this one is
 * modelled on.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad: the scratchpad
 * is shared between concurrent workers and one harness was overwritten mid-turn
 * BETWEEN ARM AND RESTORE.
 *
 * THE RULES THIS ENFORCES MECHANICALLY, because a control that is wrong is worse
 * than no control:
 *   - every arm is armed ALONE, with every other defence held OPEN;
 *   - every arm DECLARES, before it is armed, what MUST fail and what MUST NOT;
 *   - every restore is verified by sha256 AND by CONTENT (`cmp`) against a
 *     PRISTINE copy taken before any arm ran;
 *   - a missing tally reads as -1, NEVER as 0. An arm that KILLS a suite rather
 *     than failing it would otherwise be recorded as "stayed GREEN" — the exact
 *     defect FL-2's own arm A3 met;
 *   - a surprising green is a FINDING about the arm and is printed as such.
 *
 * Run it:  node pdf-worker/test/pdf-worker.control.mjs
 *
 * ===========================================================================
 * RESULTS — ALL SEVEN ARMS RUN 2026-08-08 IN WORKTREE agent-a59da2fdb4abbfa53
 * (CPDF-9), baseline 48 pass / 0 fail before each. Figures are MEASURED and were
 * written down from the run, never predicted. Every arm behaved AS DECLARED on
 * the recorded pass; the two that did not on the FIRST pass are recorded below
 * rather than smoothed, because both were findings about the HARNESS.
 *
 *  (A1) THE SUBJECT'S OWN — the member writes to R2. `env.CAPTURES.put()` added
 *       beside the read, bundle rebuilt -> 45 pass, 3 FAIL: both behavioural
 *       R2-unchanged arms AND the `.put(` source scan. Held as declared: the
 *       tier-2 extraction, the envelope marker, the refusals and the version arms
 *       (4/4 checked by name). This is 2026-07-31's original control, re-run.
 *  (A2) THE BATTERY ACTUALLY RUNS THIS SUITE — CPDF-9's whole reason. One
 *       assertion broken here -> `battery.mjs pdf-worker` EXITS 1, NAMES
 *       `pdf-worker/pdf-worker.test.mjs` in FAILED, and does NOT report it as a
 *       skip. Before this item the identical edit changed nothing anywhere,
 *       because nothing executed the file: that is the distinction that was
 *       missing for eight days and this arm is what proves it is gone.
 *  (A3) RE-ARM THE DEPENDENCY FAILURE — the generous direction must stay CLOSED.
 *       Fallback pointed at a package that does not exist -> battery exit 0 (a
 *       named skip is not a failure, by design) and the member is NAMED both ways:
 *       `SKIPPED (named): … cannot resolve 'miniflare-does-not-exist-control-arm'`
 *       AND `fleet: … 0 member(s) actually RAN · DARK: pdf-worker`. It is never
 *       counted among the suites that ran green.
 *  (A4) THE COMMENT STRIPPER EATS A URL AGAIN — D-232's rider. The naive
 *       `//`-to-end-of-line idiom restored -> 46 pass, 2 FAIL, both anchored-
 *       stripper arms by name. The `THE TRAP, DRIVEN` arms HELD, as declared:
 *       they describe the naive form and are unaffected by which form the suite
 *       uses, which is what makes them a description of the trap rather than of
 *       the fix.
 *  (A5) FLEET RULE 4 — `GET /version` removed from the worker, bundle rebuilt ->
 *       44 pass, 4 FAIL, the version arms by name. `coverage.mjs --strict` STILL
 *       EXITED 0, exactly as declared: fleet reach is read from the SUITE's
 *       source, not from the worker's, so the two halves are independent and this
 *       arm proves only the behavioural one. A6 arms the other half.
 *  (A6) THE SURFACE ROW WITHOUT ITS REACH, in two stages, and STAGE 1 IS A
 *       FINDING ABOUT THE INSTRUMENT. Stage 1 deleted the DRIVEN /version arms
 *       and left the SURFACE row -> `--strict` exit 0, `4/4 surface ops reached`.
 *       DECLARED IN ADVANCE AS DOUBTFUL and it came back exactly as doubted: the
 *       fleet reach matcher runs over the WHOLE suite text, so `/version`
 *       MENTIONED IN A COMMENT is credited as reach. Stage 2 removed every
 *       textual `/version` too -> `--strict` EXIT 1, `3/4 surface ops reached`,
 *       naming the unreached op, with the fleet FLOOR silent as declared. The
 *       gate has teeth; what it cannot see is the difference between a driven
 *       call and a mention. Delegated in CLAIMS.md rather than fixed here —
 *       narrowing a reach matcher is how a walk goes blind (REC-67's class).
 *  (O1) OVER-STRICTNESS, nothing broken. A second, correctly-written fleet suite
 *       under a filename this session did not anticipate
 *       (`zz-unanticipated-spelling.test.mjs`) -> DISCOVERED, RUN, `ok`, battery
 *       exit 0, member still reported as RAN. Discovery is by directory and
 *       extension, so an unanticipated spelling is not a spelling it can miss.
 *
 * TWO ARMS CAME BACK WRONG ON THE FIRST PASS, BOTH ABOUT THIS HARNESS:
 *   - A1 and A5 both reported `BUILD FAILED, arm could not be honoured` —
 *     `esbuild` lives in `pdf-worker/node_modules`, which this item deliberately
 *     REMOVES to reproduce the fresh-checkout condition. **The arms were not
 *     honoured and the harness said so** instead of reporting the unrebuilt
 *     bundle's green as evidence; that is the "an arm that could never have been
 *     honoured at all" failure mode, caught by `build()` returning its status.
 *     Fixed by `ensureBuildDeps()`/`dropBuildDeps()`, which install for those two
 *     arms and remove the install again so every later arm still measures a
 *     member with no `node_modules`.
 * ===========================================================================
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, renameSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/* `node pdf-worker/test/pdf-worker.control.mjs A1 A5` runs those arms only.
   With no argument every arm runs, which is how the recorded pass was taken —
   arms run one at a time are still armed ALONE, but a single pass is what makes
   the summary one measurement rather than several stitched together. */
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("-"));

const HERE = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(HERE, "..");
const REPO = join(MEMBER, "..");
const PLANE = join(REPO, "bio-plane");

const SUITE = join(HERE, "pdf-worker.test.mjs");
const SRC = join(MEMBER, "src", "index.mjs");
const DIST = join(MEMBER, "dist", "pdf-worker.bundled.mjs");
const PRISTINE = join(HERE, ".control-pristine");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const FILES = { suite: SUITE, src: SRC, dist: DIST };

/* ---- pristine copies, taken ONCE before any arm ---- */
if (existsSync(PRISTINE)) rmSync(PRISTINE, { recursive: true, force: true });
mkdirSync(PRISTINE, { recursive: true });
const pristineOf = {};
for (const [k, p] of Object.entries(FILES)) {
  const c = join(PRISTINE, k);
  copyFileSync(p, c);
  pristineOf[k] = { copy: c, sha: sha(p) };
}

/* ---- the instrument ---- */

/* A missing tally is -1 and NEVER 0: a suite that DIED proved nothing, and
   recording it as "0 failures" is how an arm that killed a suite gets written
   down as "stayed green". */
const tally = (out) => {
  const m = [...out.matchAll(/(\d+)\s+passed,\s+(\d+)\s+failed/g)].pop();
  return m ? { pass: +m[1], fail: +m[2] } : { pass: -1, fail: -1 };
};

const runSuite = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: MEMBER, encoding: "utf8", timeout: 300_000 });
  const out = (r.stdout || "") + (r.stderr || "");
  return { code: r.status, out, ...tally(out) };
};

const runBattery = (filter) => {
  const r = spawnSync(process.execPath, [join(PLANE, "scripts", "battery.mjs"), filter],
    { cwd: PLANE, encoding: "utf8", timeout: 900_000 });
  const out = (r.stdout || "") + (r.stderr || "");
  return { code: r.status, out };
};

const runCoverage = () => {
  const r = spawnSync(process.execPath, [join(PLANE, "scripts", "coverage.mjs"), "--strict"],
    { cwd: PLANE, encoding: "utf8", timeout: 300_000 });
  const out = (r.stdout || "") + (r.stderr || "");
  return { code: r.status, out };
};

/* TWO ARMS EDIT `src/index.mjs`, AND THE SUITE DRIVES THE COMMITTED BUNDLE — so
   they are only honoured if the bundle can be REBUILT, which needs `esbuild` from
   THIS directory's install. The fresh-checkout condition this item exists to
   prove is precisely that there is no such install, so the harness installs one
   for those arms and REMOVES it again. It is recorded here because the first pass
   of this harness reported both arms as `BUILD FAILED, arm could not be honoured`
   — which is the honest outcome and exactly why `build()` returns its status
   instead of the arm assuming a rebuild happened. An arm that could never have
   been honoured, recorded as if it ran, is the failure mode this project has
   already met. */
let installedHere = false;
const ensureBuildDeps = () => {
  try { createRequire(join(MEMBER, "package.json")).resolve("esbuild"); return true; } catch { /* install */ }
  const r = spawnSync("npm", ["ci"], { cwd: MEMBER, encoding: "utf8", timeout: 600_000 });
  if (r.status !== 0) return false;
  installedHere = true;
  return true;
};
const dropBuildDeps = () => {
  if (!installedHere) return;
  rmSync(join(MEMBER, "node_modules"), { recursive: true, force: true });
  installedHere = false;
};

const build = () => {
  if (!ensureBuildDeps()) return { code: -1, out: "esbuild unavailable and `npm ci` failed in pdf-worker/" };
  const r = spawnSync(process.execPath, [join(MEMBER, "scripts", "build.mjs")],
    { cwd: MEMBER, encoding: "utf8", timeout: 300_000 });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
};

/* Restore EVERYTHING, then prove it by sha256 AND by content. `cmp` is the
   content half: two files can be claimed identical by a hash computed over the
   wrong bytes, and the second instrument costs nothing. */
const restoreAll = () => {
  const report = [];
  for (const [k, p] of Object.entries(FILES)) {
    copyFileSync(pristineOf[k].copy, p);
    const now = sha(p);
    const cmp = spawnSync("cmp", ["-s", p, pristineOf[k].copy]).status;
    report.push({ file: k, shaOk: now === pristineOf[k].sha, cmpOk: cmp === 0 });
  }
  const bad = report.filter((r) => !r.shaOk || !r.cmpOk);
  if (bad.length) {
    console.log(`  !! RESTORE FAILED: ${JSON.stringify(bad)}`);
    process.exitCode = 1;
  } else {
    console.log(`  restore verified: ${report.map((r) => `${r.file} sha256+cmp OK`).join(" · ")}`);
  }
};

const edit = (p, from, to) => {
  const s = readFileSync(p, "utf8");
  if (!s.includes(from)) throw new Error(`ARM COULD NOT BE HONOURED: anchor not found in ${p}: ${from.slice(0, 60)}`);
  writeFileSync(p, s.replace(from, to));
};

const results = [];
const arm = (id, title, declared, body) => {
  if (ONLY.length && !ONLY.includes(id)) return;
  console.log(`\n=== ${id} · ${title}`);
  console.log(`  DECLARED: ${declared}`);
  let actual;
  try { actual = body(); }
  catch (e) { actual = `ARM THREW: ${String(e && e.message || e)}`; }
  /* Restore the sources, THEN put the fresh-checkout condition back: an arm that
     installed `node_modules` to rebuild must not leave it behind for the arms
     that measure a member with none. */
  finally { restoreAll(); dropBuildDeps(); }
  console.log(`  ACTUAL:   ${actual}`);
  results.push({ id, title, declared, actual });
};

/* ---- the baseline every arm is measured against ---- */
console.log("=== BASELINE (nothing armed)");
const base = runSuite();
console.log(`  suite: exit ${base.code} · ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0 || base.pass <= 0) {
  console.log("  !! the baseline is not green — every arm below would be uninterpretable. STOPPING.");
  process.exit(1);
}

/* ======================================================================= (1) */
arm("A1", "THE SUBJECT'S OWN: the member writes to R2",
  "MUST FAIL: the behavioural R2-unchanged arms AND the source scan for `.put(`. "
  + "MUST NOT fail: the tier-2 extraction, the envelope arms, the refusal arms, the version arms.",
  () => {
    edit(SRC, "  const obj = await env.CAPTURES.get(",
      "  await env.CAPTURES.put(`${store}/control-probe`, new Uint8Array([1]));\n  const obj = await env.CAPTURES.get(");
    const b = build();
    if (b.code !== 0) return `BUILD FAILED, arm could not be honoured: ${b.out.slice(0, 200)}`;
    const r = runSuite();
    const named = ["the CAPTURES key set is unchanged", "only the seeded object exists", "no .put( call in source"]
      .filter((n) => new RegExp(`FAIL\\s+${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(r.out));
    const held = ["recovered the real text Tier 1 marked undetermined", "reports the BOUND build, not a compiled-in constant",
      "the marker names the cause: over_envelope", "reason NOT_FOUND"]
      .filter((n) => new RegExp(`PASS\\s+${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(r.out));
    return `exit ${r.code} · ${r.pass} pass, ${r.fail} FAIL · failed by name: ${named.join(" | ") || "NONE"} · held: ${held.length}/4`;
  });

/* ======================================================================= (2) */
arm("A2", "THE BATTERY ACTUALLY RUNS THIS SUITE (CPDF-9's whole reason)",
  "MUST: `battery.mjs pdf-worker` exits NON-ZERO and NAMES pdf-worker/pdf-worker.test.mjs in FAILED, "
  + "and the `fleet:` line must NOT report the member as having run clean. "
  + "MUST NOT: the suite be reported as a skip, which would hide the break.",
  () => {
    edit(SUITE, 't("container pdf", out.container, "pdf");', 't("container pdf", out.container, "NOT-A-CONTAINER");');
    const b = runBattery("pdf-worker");
    const namedInFailed = /FAILED:.*pdf-worker\/pdf-worker\.test\.mjs/.test(b.out);
    const skipped = /SKIPPED \(named\)/.test(b.out);
    const fleetLine = (b.out.match(/^fleet:.*$/m) || ["<no fleet line>"])[0];
    return `battery exit ${b.code} · named in FAILED: ${namedInFailed} · reported as skip: ${skipped} · ${fleetLine}`;
  });

/* ======================================================================= (3) */
arm("A3", "RE-ARM THE DEPENDENCY FAILURE (the generous direction must stay CLOSED)",
  "MUST: the battery NAMES the member as dark — `SKIPPED (named)` for the suite AND `DARK: pdf-worker` on the "
  + "`fleet:` line. MUST NOT: the member be silently counted among the members that RAN, and MUST NOT the battery "
  + "report the suite as green.",
  () => {
    edit(SUITE, 'createRequire(planePkg).resolve("miniflare")',
      'createRequire(planePkg).resolve("miniflare-does-not-exist-control-arm")');
    const b = runBattery("pdf-worker");
    const fleetLine = (b.out.match(/^fleet:.*$/m) || ["<no fleet line>"])[0];
    const skipLine = (b.out.match(/^\s*SKIPPED \(named\):.*$/m) || ["<no skip line>"])[0].trim().slice(0, 140);
    const countedGreen = /ok\s+pdf-worker\/pdf-worker\.test\.mjs/.test(b.out);
    return `battery exit ${b.code} · counted green: ${countedGreen} · ${fleetLine} · ${skipLine}`;
  });

/* ======================================================================= (4) */
arm("A4", "THE COMMENT STRIPPER EATS A URL AGAIN (D-232's rider)",
  "MUST FAIL: the anchored-stripper arms — the two `keeps both schemes`/`keeps the URL literal whole` assertions. "
  + "MUST NOT fail: the `THE TRAP, DRIVEN` arms (they describe the naive form and are unaffected), the corpus-floor "
  + "arms, or anything behavioural.",
  () => {
    edit(SUITE, 'const strip      = (s) => s.replace(/\\/\\*[\\s\\S]*?\\*\\//g, "").replace(/(^|[^:])\\/\\/[^\\n]*/g, "$1");',
      'const strip      = (s) => s.replace(/\\/\\*[\\s\\S]*?\\*\\//g, "").replace(/\\/\\/[^\\n]*/g, "");');
    const r = runSuite();
    const named = ["the anchored stripper keeps both schemes", "the anchored stripper keeps the URL literal whole"]
      .filter((n) => new RegExp(`FAIL\\s+${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(r.out));
    const trapHeld = /PASS\s+THE TRAP, DRIVEN: the naive idiom loses the URL literal/.test(r.out);
    return `exit ${r.code} · ${r.pass} pass, ${r.fail} FAIL · failed by name: ${named.join(" | ") || "NONE"} · trap arms held: ${trapHeld}`;
  });

/* ======================================================================= (5) */
arm("A5", "FLEET RULE 4 — remove GET /version from the worker",
  "MUST FAIL: the version arms (200, name, bound build). MUST: `coverage.mjs --strict` still EXIT 0, because the "
  + "SURFACE row goes with the handler and an op that no longer exists cannot be unreached — the arm exists to show "
  + "the two halves are independent, and A6 arms the half that does fail.",
  () => {
    edit(SRC, '    if (req.method === "GET" && path === "version") return handleVersion(env);\n', "");
    const b = build();
    if (b.code !== 0) return `BUILD FAILED, arm could not be honoured: ${b.out.slice(0, 200)}`;
    const r = runSuite();
    const named = ["GET /version is 200", "reports the BOUND build, not a compiled-in constant"]
      .filter((n) => new RegExp(`FAIL\\s+${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(r.out));
    const c = runCoverage();
    return `exit ${r.code} · ${r.pass} pass, ${r.fail} FAIL · failed by name: ${named.join(" | ") || "NONE"}`
      + ` · coverage --strict exit ${c.code} (declared 0: reach is read from the SUITE, which still names /version)`;
  });

/* ======================================================================= (6) */
arm("A6", "THE SURFACE ROW WITHOUT ITS REACH — two stages, because stage 1 may not have teeth",
  "STAGE 1 — delete the DRIVEN /version arms from the suite and leave the SURFACE row. MUST: `coverage.mjs "
  + "--strict` EXIT 1 naming pdf-worker's `version` as unreached. **DECLARED IN ADVANCE AS DOUBTFUL:** the fleet "
  + "reach matcher is `[/\"'`]op(?=[?\"'`&/\\s]|$)` over the WHOLE suite text, and this file names `/version` in its "
  + "own comments — so stage 1 may come back GREEN, which would be a finding about the INSTRUMENT (a mention in a "
  + "comment credited as reach) and not about the subject. STAGE 2 removes every textual `/version` too; that one "
  + "MUST exit 1. MUST NOT, in either stage: the fleet FLOOR fire — the op is still declared, so the count does not fall.",
  () => {
    const s0 = readFileSync(SUITE, "utf8");
    const start = s0.indexOf('console.log("\\n--- VERSION:');
    const end = s0.indexOf("console.log(`\\npdf-worker:");
    if (start < 0 || end < 0 || end < start) throw new Error("ARM COULD NOT BE HONOURED: version block anchors not found");
    writeFileSync(SUITE, s0.slice(0, start) + s0.slice(end));
    const c1 = runCoverage();
    const line1 = (c1.out.match(/^FLEET .*$/m) || ["<no FLEET line>"])[0];

    /* stage 2: the same deletion, plus every remaining textual mention */
    const s1 = readFileSync(SUITE, "utf8");
    writeFileSync(SUITE, s1.replace(/\/version/g, "/VERSIONWORDREMOVED").replace(/"version"/g, '"VERSIONWORDREMOVED"'));
    const c2 = runCoverage();
    const line2 = (c2.out.match(/^FLEET .*$/m) || ["<no FLEET line>"])[0];
    const named2 = /version/i.test((c2.out.match(/^.*(UNREACHED|unreached).*$/gm) || []).join(" "));
    const floor2 = /FLEET FLOOR/.test(c2.out);
    return `STAGE 1 coverage exit ${c1.code} · ${line1}  ||  STAGE 2 coverage exit ${c2.code}`
      + ` · names version unreached: ${named2} · floor fired: ${floor2} · ${line2}`;
  });

/* ======================================================================= (O) */
arm("O1", "OVER-STRICTNESS — a fleet suite in a spelling the discovery did not anticipate",
  "NOTHING IS BROKEN. MUST: a second, correctly-written fleet suite whose filename this session did not "
  + "anticipate is DISCOVERED and RUN by the battery, the battery stays GREEN, and the `fleet:` line still reports "
  + "the member as having RAN. MUST NOT: the extra suite be skipped, or the member reported dark.",
  () => {
    const extra = join(HERE, "zz-unanticipated-spelling.test.mjs");
    writeFileSync(extra,
      "/* CPDF-9 control O1 — a correct fleet suite in a filename nobody anticipated. */\n"
      + "/* NEGATIVE CONTROL: delete the assertion below -> this suite reports 0 pass. */\n"
      + 'import "../../bio-plane/test/sandbox.mjs";\n'
      + "let pass = 0, fail = 0;\n"
      + 'const ok = (l, g, w) => { const y = JSON.stringify(g) === JSON.stringify(w); console.log(`  ${y ? "PASS" : "FAIL"}  ${l}`); y ? pass++ : fail++; };\n'
      + 'ok("the runner reaches a suite it was never told about", 1 + 1, 2);\n'
      + 'console.log(`\\nzz-unanticipated: ${pass} passed, ${fail} failed`);\n'
      + "process.exit(fail ? 1 : 0);\n");
    try {
      const b = runBattery("pdf-worker");
      const discovered = /zz-unanticipated-spelling\.test\.mjs/.test(b.out);
      const ranOk = /ok\s+pdf-worker\/zz-unanticipated-spelling\.test\.mjs/.test(b.out);
      const fleetLine = (b.out.match(/^fleet:.*$/m) || ["<no fleet line>"])[0];
      return `battery exit ${b.code} · discovered: ${discovered} · ran ok: ${ranOk} · ${fleetLine}`;
    } finally { rmSync(extra, { force: true }); }
  });

/* ---- the close ---- */
console.log("\n=== FINAL STATE (everything restored)");
for (const [k, p] of Object.entries(FILES)) {
  const cmp = spawnSync("cmp", ["-s", p, pristineOf[k].copy]).status;
  console.log(`  ${k}: sha256 ${sha(p) === pristineOf[k].sha ? "MATCHES" : "DIFFERS"} pre-arm · cmp ${cmp === 0 ? "identical" : "DIFFERS"}`);
}
const after = runSuite();
console.log(`  suite after all arms: exit ${after.code} · ${after.pass} pass, ${after.fail} fail (baseline was ${base.pass}/${base.fail})`);

console.log("\n=== SUMMARY");
for (const r of results) console.log(`  ${r.id}  ${r.actual}`);
rmSync(PRISTINE, { recursive: true, force: true });
