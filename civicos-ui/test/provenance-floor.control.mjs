/* D-257 NEGATIVE CONTROL DRIVER.
 *
 * Each arm is ARMED ALONE with every other defence held open, DECLARED before it
 * is armed, and every restore is verified by sha256 AND by `cmp` against a
 * UNIQUELY-NAMED per-arm pristine copy, with a byte count printed and a minimum
 * guarded. A `-1` is reported for a run whose own tally never printed.
 *
 * THE PHANTOM IS WRITTEN DIRECTLY, NOT DELIVERED BY `git stash`. WORKER.md
 * forbids the stash here for the exact reason D-238 documents — `refs/stash` is
 * repository-wide across all sixty worktrees, so arming the real mechanism would
 * arm it for everybody. What matters to these arms is the STATE the mechanism
 * produces (a file present in the working tree and absent from HEAD), and that
 * state is reproduced exactly by writing the file.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync, readFileSync, copyFileSync, rmSync, existsSync, mkdirSync, mkdtempSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../../", import.meta.url)).replace(/\/$/, "");
/* THE PRISTINE COPIES GO IN A mkdtemp INSIDE THIS WORKTREE AND ARE DELETED IN A
   `finally`, and that is not tidiness — it is a finding this harness paid for.
   They are copies of `app.html`, and `bio-plane/scripts/op-claims.mjs` walks the
   whole repository WITHOUT a dotfile filter, so leaving them behind turned the
   battery RED with ten findings attributed to the copies. A control harness
   demonstrating the class it was built to close is worth writing down. */
const HARNESS = mkdtempSync(join(REPO, ".d257-control-"));

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const run = (file, env = {}) => {
  const r = spawnSync("node", [join(REPO, file)], { cwd: REPO, encoding: "utf8",
    env: { ...process.env, ...env }, maxBuffer: 256 * 1024 * 1024 });
  return { status: r.status, out: (r.stdout || "") + (r.stderr || "") };
};
/* A TALLY THAT NEVER PRINTED IS -1, NEVER 0 (WORKER.md): a TypeError inside an
   assertion ends the module while the count reads clean. */
const tally = (out, re) => { const m = re.exec(out); return m ? Number(m[1]) : -1; };

const results = [];
const declare = (id, what, mustFail, mustNot) => { console.log(`\n=== ${id} — ${what}\n    MUST: ${mustFail}\n    MUST NOT: ${mustNot}`); };
const record = (id, verdict, detail) => { results.push({ id, verdict, detail }); console.log(`    RESULT ${verdict}: ${detail}`); };

/* --------------------------------------------------------------- pristine */
const GUARDED = [
  "civicos-ui/test/version-predecessor.test.mjs",
  "civicos-ui/test/add-surface.test.mjs",
  "civicos-ui/test/auth-surface.test.mjs",
  "civicos-ui/test/bound-sweep.test.mjs",
  "civicos-ui/test/preauth-vocabulary.test.mjs",
  "civicos-ui/test/publishedcase.test.mjs",
  "civicos-ui/test/run.mjs",
  "civicos-ui/check-refusal-codes.mjs",
  "civicos-ui/app.html",
  "bio-plane/test/hygiene.test.mjs",
];
const pristineFor = (arm, rel) => join(HARNESS, `pristine.${arm}.${rel.replace(/\//g, "_")}`);
const armSnapshot = (arm) => {
  for (const rel of GUARDED) copyFileSync(join(REPO, rel), pristineFor(arm, rel));
};
const armRestore = (arm) => {
  let bytes = 0;
  for (const rel of GUARDED) {
    const p = pristineFor(arm, rel), live = join(REPO, rel);
    copyFileSync(p, live);
    const a = sha(p), b = sha(live);
    if (a !== b) throw new Error(`RESTORE FAILED (sha256) for ${rel}: ${a} != ${b}`);
    const cmp = spawnSync("cmp", [p, live], { encoding: "utf8" });
    if (cmp.status !== 0) throw new Error(`RESTORE FAILED (cmp) for ${rel}: ${cmp.stdout}${cmp.stderr}`);
    bytes += statSync(live).size;
  }
  if (bytes < 1_000_000) throw new Error(`RESTORE SUSPECT: only ${bytes} bytes restored — a restore over an empty or truncated manifest reports byte-identical for free (M0-15)`);
  console.log(`    restore verified by sha256 AND cmp over ${GUARDED.length} file(s), ${bytes} bytes (floor 1,000,000)`);
};

const PHANTOM = join(REPO, "civicos-ui", "zz-d257-phantom.mjs");
const phantomBody = (withDefect) => {
  let s = "/* D-257 CONTROL PHANTOM — written by .d257-harness/control.mjs, never committed. */\n";
  for (let i = 0; i < 400; i++) s += `function d257Phantom${i}(){ return ${i}; }\n`;
  if (withDefect)
    s += `\nasync function d257PhantomPick(locator){\n`
       + `  const r = await recR("search", { q: \`locator:"\${locator}"\`, limit:"500" });\n`
       + `  return ((r && r.hits) || [])[0];\n}\n`;
  return s;
};
const dropPhantom = () => { if (existsSync(PHANTOM)) rmSync(PHANTOM); };

/* ===================================================================== ARM 0 */
declare("ARM 0 BASELINE", "no patch at all", "nothing", "every guarded instrument green");
{
  const vp = run("civicos-ui/test/version-predecessor.test.mjs");
  const hy = run("bio-plane/test/hygiene.test.mjs");
  const n = tally(vp.out, /version-predecessor: (\d+) assertions/);
  const repro = /SWEEP FLOOR IS THE REPRODUCIBLE CORPUS: (\d+) of (\d+) file\(s\)[^—]*— (\d+) function\(s\), (\d+) site/.exec(vp.out);
  record("ARM 0 BASELINE", vp.status === 0 && hy.status === 0 && n > 0 ? "AS DECLARED" : "NOT AS DECLARED",
    `version-predecessor exit ${vp.status}, ${n} assertions; hygiene exit ${hy.status}; reproducible corpus ${repro ? repro.slice(1).join("/") : "NOT PRINTED"}`);
}

/* ===================================================================== ARM 1 */
declare("ARM 1 PHANTOM, NO DEFECT",
  "an UNTRACKED civicos-ui/zz-d257-phantom.mjs with 400 functions — the state a `stash pop` produces",
  "the provenance report NAMES it as UNTRACKED and the CONTAMINATED corpus rises",
  "the REPRODUCIBLE figures must NOT move, and every guarded suite must stay GREEN");
{
  armSnapshot("a1");
  writeFileSync(PHANTOM, phantomBody(false));
  const vp = run("civicos-ui/test/version-predecessor.test.mjs");
  const as = run("civicos-ui/test/add-surface.test.mjs");
  const au = run("civicos-ui/test/auth-surface.test.mjs");
  const bs = run("civicos-ui/test/bound-sweep.test.mjs");
  const named = /NOT IN ANY COMMIT[\s\S]*?zz-d257-phantom\.mjs\s+\(UNTRACKED\)/.test(vp.out);
  const corpus = /SWEEP CORPUS: (\d+) files/.exec(vp.out);
  const repro = /SWEEP FLOOR IS THE REPRODUCIBLE CORPUS: (\d+) of (\d+) file\(s\)[^—]*— (\d+) function\(s\)/.exec(vp.out);
  const asRepro = /FLOORED on the (\d+) that are in the commit|floored on the (\d+) in the commit/.exec(as.out);
  record("ARM 1 PHANTOM, NO DEFECT",
    named && vp.status === 0 && as.status === 0 && au.status === 0 && bs.status === 0
      && repro && repro[1] === "6" && repro[3] === "600" && corpus && corpus[1] === "7"
      ? "AS DECLARED" : "NOT AS DECLARED",
    `named=${named}; contaminated corpus ${corpus ? corpus[1] : "?"} files; reproducible ${repro ? repro[1] + " files / " + repro[3] + " functions" : "NOT PRINTED"}; `
    + `exits vp=${vp.status} add-surface=${as.status} auth-surface=${au.status} bound-sweep=${bs.status}`);
  dropPhantom();
  armRestore("a1");
}

/* ===================================================================== ARM 2 */
declare("ARM 2 PHANTOM CARRYING THE DEFECT",
  "the same phantom, plus an unlicensed POSITIONAL pick on relevance-ordered op=search",
  "version-predecessor must go RED — the sweep still reads the working tree, so a finding in uncommitted work is NOT hidden",
  "it must not pass quietly");
{
  armSnapshot("a2");
  writeFileSync(PHANTOM, phantomBody(true));
  const vp = run("civicos-ui/test/version-predecessor.test.mjs");
  const sawIt = /d257PhantomPick/.test(vp.out);
  record("ARM 2 PHANTOM CARRYING THE DEFECT",
    vp.status !== 0 && sawIt ? "AS DECLARED" : "NOT AS DECLARED",
    `exit ${vp.status}, the finding names the phantom function=${sawIt}`);
  dropPhantom();
  armRestore("a2");
}

/* ===================================================================== ARM 3 */
declare("ARM 3 GIT CANNOT ANSWER",
  "a shimmed `git` on PATH that exits 1 for every question",
  "the report must say UNVERIFIED and the suite must state verified=false",
  "it must NEVER report a clean provenance, and it must not crash");
{
  const shim = join(HARNESS, "bin");
  mkdirSync(shim, { recursive: true });
  writeFileSync(join(shim, "git"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
  const vp = run("civicos-ui/test/version-predecessor.test.mjs", { PATH: `${shim}:${process.env.PATH}` });
  const unverified = /provenance: UNVERIFIED over all \d+ discovered item\(s\)/.test(vp.out);
  const notClean = !/are in the commit at HEAD/.test(vp.out);
  record("ARM 3 GIT CANNOT ANSWER",
    unverified && notClean && vp.status === 0 ? "AS DECLARED" : "NOT AS DECLARED",
    `exit ${vp.status}, UNVERIFIED printed=${unverified}, no clean claim=${notClean}`);
}

/* ===================================================================== ARM 4 */
declare("ARM 4 OVER-STRICTNESS — an UNCOMMITTED EDIT TO A TRACKED FILE",
  "a new function appended to the tracked app.html, uncommitted",
  "the REPRODUCIBLE function count must RISE — provenance answers about a PATH, not about content",
  "correct work in a spelling nobody anticipated must NOT be excluded, and the suite must stay GREEN");
{
  armSnapshot("a4");
  const app = join(REPO, "civicos-ui", "app.html");
  writeFileSync(app, readFileSync(app, "utf8") + "\n<script>\nfunction d257OverStrictProbe(){ return 1; }\n</script>\n");
  const vp = run("civicos-ui/test/version-predecessor.test.mjs");
  const repro = /SWEEP FLOOR IS THE REPRODUCIBLE CORPUS: (\d+) of (\d+) file\(s\)[^—]*— (\d+) function\(s\)/.exec(vp.out);
  record("ARM 4 OVER-STRICTNESS",
    vp.status === 0 && repro && Number(repro[3]) === 601 ? "AS DECLARED" : "NOT AS DECLARED",
    `exit ${vp.status}, reproducible functions ${repro ? repro[3] : "NOT PRINTED"} (baseline 600, expected 601)`);
  armRestore("a4");
}

/* ===================================================================== ARM 5 */
declare("ARM 5 THE GUARD REMOVED",
  "the provenance import deleted from version-predecessor.test.mjs, with its allowlist entry already gone",
  "hygiene.test.mjs must go RED naming civicos-ui/test/version-predecessor.test.mjs as newly unguarded",
  "removing the allowlist entry must not be decorative");
{
  armSnapshot("a5");
  const f = join(REPO, "civicos-ui/test/version-predecessor.test.mjs");
  const src = readFileSync(f, "utf8");
  const IMP = 'import { readGitProvenance, repoPath, reportProvenance } from "../../bio-plane/scripts/provenance.mjs";';
  const hits = src.split(IMP).length - 1;
  if (hits !== 1) throw new Error(`ARM 5 ANCHOR appears ${hits} times, not once — an arm that cannot arm is a finding`);
  writeFileSync(f, src.replace(IMP, "/* ARM 5: import removed */"));
  const hy = run("bio-plane/test/hygiene.test.mjs");
  const named = /newly[\s\S]{0,200}version-predecessor\.test\.mjs|GUARDED or NAMED[^\n]*version-predecessor\.test\.mjs/.test(hy.out);
  record("ARM 5 THE GUARD REMOVED",
    hy.status !== 0 && named ? "AS DECLARED" : "NOT AS DECLARED",
    `hygiene exit ${hy.status}, names the file=${named}`);
  armRestore("a5");
}

/* ===================================================================== ARM 6 */
declare("ARM 6 THE FLOOR IS ACTUALLY GIT-BACKED — the decisive pair",
  "the phantom present, and the reach floor raised to 7 files: once in the D-257 spelling (UI_REPRO) and once in the PRE-D-257 spelling (UI_FILES)",
  "the D-257 spelling must FAIL at 6 reproducible files; the pre-D-257 spelling must PASS at 7 walked files",
  "if BOTH pass, the git backing is doing no work and this whole item is decoration");
{
  armSnapshot("a6");
  writeFileSync(PHANTOM, phantomBody(false));
  const f = join(REPO, "civicos-ui/test/version-predecessor.test.mjs");
  const src = readFileSync(f, "utf8");
  const ANCHOR = "UI_REPRO.length >= 3 && S_REPRO.functions >= 200 && S_REPRO.sites >= 1";
  const hits = src.split(ANCHOR).length - 1;
  if (hits !== 1) throw new Error(`ARM 6 ANCHOR appears ${hits} times, not once`);
  writeFileSync(f, src.replace(ANCHOR, "UI_REPRO.length >= 7 && S_REPRO.functions >= 200 && S_REPRO.sites >= 1"));
  const withGuard = run("civicos-ui/test/version-predecessor.test.mjs");
  writeFileSync(f, src.replace(ANCHOR, "UI_FILES.length >= 7 && S.functions >= 200 && S.sites >= 1"));
  const preD257 = run("civicos-ui/test/version-predecessor.test.mjs");
  record("ARM 6 THE FLOOR IS ACTUALLY GIT-BACKED",
    withGuard.status !== 0 && preD257.status === 0 ? "AS DECLARED" : "NOT AS DECLARED",
    `floor 7 over the COMMIT exit ${withGuard.status} (must be non-zero); floor 7 over the WORKING TREE exit ${preD257.status} (must be 0) — `
    + `the phantom is exactly the one file of difference`);
  dropPhantom();
  armRestore("a6");
}

/* ======================================================================= foot */
rmSync(HARNESS, { recursive: true, force: true });
if (existsSync(HARNESS)) throw new Error(`the harness directory ${HARNESS} survived — see this file's header`);
dropPhantom();

console.log(`\n================ D-257 CONTROL SUMMARY (${results.length} arms) ================`);
for (const r of results) console.log(`  ${r.verdict.padEnd(16)} ${r.id} — ${r.detail}`);
const bad = results.filter((r) => r.verdict !== "AS DECLARED");
console.log(`\n${results.length - bad.length} of ${results.length} arms came back AS DECLARED.`);
if (bad.length) console.log(`  NOT AS DECLARED: ${bad.map((r) => r.id).join(" · ")} — a surprising result is a finding about the ARM and is recorded, not smoothed.`);
console.log(`HEAD ${execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim()}`);
