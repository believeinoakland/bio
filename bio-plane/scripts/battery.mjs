#!/usr/bin/env node
/* The battery: run EVERY suite, report all of them, fail if any failed.
 *
 * Two defects in the old `npm test` chain, both structural rather than careless:
 *
 * 1. `a && b && c` STOPS at the first failure, so one broken suite hides the
 *    state of every suite after it. D-93 is exactly this: `ratify.test.mjs`
 *    dies with an unhandled spawn error when `ssh-keygen` is absent, and
 *    everything downstream of it never runs — on a machine where the signing
 *    path is the one place a false green matters most.
 *
 * 2. The chain was a HAND-MAINTAINED list of 38 files while `test/` held 41.
 *    `bundle.test.mjs` was in the directory and not in the chain, so it had
 *    stopped being run by anything and nothing said so. The lesson the purge
 *    table already taught (D-113): a list maintained by hand is a list that
 *    silently falls behind the thing it lists.
 *
 * So suites are DISCOVERED from the directory, every one runs, and the summary
 * names the failures. Exit code is the number of failed suites, capped at 125.
 *
 *   node scripts/battery.mjs             all suites
 *   node scripts/battery.mjs search cite only suites whose name contains these
 */

import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const filters = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const QUIET = process.argv.includes("--quiet");

/* ---- D-186: the temp-directory leak, swept and then ASSERTED ----------------
 *
 * The battery leaked one OS temp directory per miniflare instance until it had
 * accumulated 23,263 of them holding 41.0 GB and filled the machine's disk to
 * zero, at which point every command failed before it started and no session
 * could commit or push. `test/sandbox.mjs` closes the leak at the source (see
 * its header for the measured mechanism, which is not the one anybody guessed).
 * Two things still belong here.
 *
 * FIRST, ORPHANS. A suite killed with SIGKILL runs no handler, and the machine
 * is already carrying directories from before the fix. So the battery sweeps at
 * start — and the one thing it must never do is a blanket wipe. A CONCURRENT
 * worker's battery is not hypothetical: one was mid-run during the manual
 * cleanup that found D-186, and deleting its live sandbox would have broken a
 * verification in flight. Two rules, because the two kinds of directory carry
 * different evidence about who owns them:
 *
 *   - `bio-battery-<pid>-*` is ours and NAMES ITS OWNER. Liveness of that pid is
 *     the decision — a dead owner cannot come back for its files, a live one may
 *     be a worker mid-battery. This is exact, and needs no clock at all.
 *   - the legacy prefixes carry no owner, so age is the only evidence there is.
 *     Note that "older than this run STARTED" is NOT safe on its own: a
 *     concurrent battery that began sixty seconds before ours has directories
 *     older than our start and is still using them. The threshold is therefore
 *     the start of this run less a GRACE window comfortably longer than any
 *     battery (measured at ~86s; the grace is 2 hours), which is the same rule
 *     with the concurrency hazard priced in. These prefixes stop being created
 *     at all once every suite imports the sandbox, so this arm is a drain.
 *
 * AND OVER BOTH, A SAFETY NET THAT DOES NOT DEPEND ON THE CLOCK: any directory
 * a live `workerd` or `node` still holds a file descriptor in is spared outright,
 * whatever its age. A clock argument is only as good as its assumption about how
 * long a run can last, and that assumption is already known to break — while
 * writing this fix a suite from another worktree was found still running after
 * 1h16m (`acquire.test.mjs`, pid 2236), holding a sandbox that a two-hour rule
 * would have deleted out from under it eighteen minutes later. `lsof` answers
 * that in ~20 ms. It is BEST EFFORT — if the tool is missing the age rule still
 * applies — because a sweep that refuses to run without it would trade a rare
 * wrong deletion for a certain return of the full disk.
 *
 * SECOND, THE ASSERTION. Running the battery twice and comparing the count is
 * the negative control this defect comes with for free, and a control nobody
 * runs is not a control — so the runner counts, before and after, and FAILS on
 * growth rather than leaving it to somebody's eye.
 *
 * THE COUNT HAS TO BE ATTRIBUTABLE, and getting that wrong is not academic: the
 * first version of this assertion counted host-level `miniflare-*` and went red
 * on a green run because ANOTHER worktree without this fix was running its own
 * battery into the same `$TMPDIR`. A false red on the battery is worse than the
 * leak it reports. So the runner takes a sandbox of its own and hands it to
 * every suite as `$TMPDIR`: each child then writes its temp files INSIDE this
 * run's directory whether or not the suite cooperates, because the environment
 * decides where `os.tmpdir()` points and the suite does not. What is left in
 * there when the suites are done is this run's leak, exactly, with no attribution
 * argument to make — 0 before, 0 after, and anything else fails.
 *
 * The host-level orphan count is still taken before and after, because it is the
 * number D-186 is written in and the one a reader will want. It is REPORTED and
 * attributed; only the run's own residue is allowed to fail the run.
 */
const TMP = tmpdir();
const OWNED = "bio-battery-";
/* Every prefix the estate mints into $TMPDIR, from `mkdtempSync(join(tmpdir(),…))`
   in the suites plus miniflare's own. The OCR/PDF probes (`cpdf*-`) are NOT here:
   they are probes and not battery, they are bounded separately, and
   tier1-coverage-probe.mjs keeps a deliberately persistent cache in $TMPDIR. */
const LEGACY = ["miniflare-", "attest-", "ratify-", "reuse-ratify-", "sshsig-",
  "signpage-", "publish-", "publishedcase-", "reeval-", "bio-inquiry-boot-",
  "bio-rec31-fourth-name-"];
const GRACE_MS = 2 * 60 * 60 * 1000;
const RUN_STARTED = Date.now();

const ownerPid = (name) => {
  const n = Number(name.slice(OWNED.length).split("-")[0]);
  return Number.isInteger(n) && n > 0 ? n : null;
};
/* EPERM means the pid EXISTS and belongs to somebody else — the one error that
   must read as ALIVE, because treating it as dead deletes a live sandbox. */
const alive = (pid) => {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; }
};
/* An orphan is a directory no live process can still be using. */
const orphans = () => {
  let names;
  try { names = readdirSync(TMP); } catch { return []; }
  return names.filter((n) => {
    if (n.startsWith(OWNED)) {
      const pid = ownerPid(n);
      return pid === null || !alive(pid);
    }
    return LEGACY.some((p) => n.startsWith(p));
  });
};

/* Directories a live process still has open, by name. Best effort: an absent or
   unhappy `lsof` yields an empty set and the rules above stand on their own. */
const heldOpen = () => {
  const held = new Set();
  try {
    const r = spawnSync("lsof", ["-n", "-P", "-c", "workerd", "-c", "node", "-Fn"],
      { encoding: "utf8", timeout: 10_000 });
    if (!r.stdout) return held;
    for (const line of r.stdout.split("\n")) {
      if (!line.startsWith("n") || !line.startsWith(`n${TMP}`)) continue;
      const rest = line.slice(TMP.length + 1).replace(/^\/+/, "");
      const first = rest.split("/")[0];
      if (first) held.add(first);
    }
  } catch { /* best effort */ }
  return held;
};

const sweep = () => {
  const held = heldOpen();
  let removed = 0, spared = 0, failed = 0;
  for (const n of orphans()) {
    if (held.has(n)) { spared++; continue; }
    if (!n.startsWith(OWNED)) {
      /* no owner recorded and nothing holding it open: age is the only evidence */
      let mtime;
      try { mtime = statSync(join(TMP, n)).mtimeMs; } catch { continue; }
      if (mtime >= RUN_STARTED - GRACE_MS) { spared++; continue; }
    }
    try { rmSync(join(TMP, n), { recursive: true, force: true, maxRetries: 3 }); removed++; }
    catch { failed++; }
  }
  return { removed, spared, failed };
};

const swept = sweep();
if (swept.removed || swept.spared || swept.failed) {
  console.log(`\ntemp sweep: ${swept.removed} orphan(s) removed`
    + (swept.spared ? `, ${swept.spared} live or too recent to be sure (spared)` : "")
    + (swept.failed ? `, ${swept.failed} could not be removed` : ""));
}
const leakedBefore = orphans().length;

/* This run's own ground. Every suite is spawned with $TMPDIR pointing here, so
   whatever a suite leaks is left where only this run could have put it. Removed
   synchronously on exit, for the same reason test/sandbox.mjs does it that way. */
const RUN_TMP = mkdtempSync(join(TMP, `bio-battery-${process.pid}-`));
const dropRunTmp = () => {
  try { rmSync(RUN_TMP, { recursive: true, force: true, maxRetries: 3 }); } catch { /* next sweep */ }
};
process.on("exit", dropRunTmp);
for (const [sig, code] of [["SIGINT", 130], ["SIGTERM", 143], ["SIGHUP", 129]]) {
  process.on(sig, () => { dropRunTmp(); process.exit(code); });
}
/* What this run left behind, counted two ways because the two answer different
   questions: `dirs` is how many suites failed to take their sandbox down, and
   `instances` is how many workerd sandboxes are sitting on the disk — the number
   D-186 is written in, and the one a negative control has to move. */
const residue = () => {
  const out = { dirs: 0, instances: 0 };
  let top;
  try { top = readdirSync(RUN_TMP); } catch { return out; }
  out.dirs = top.length;
  for (const n of top) {
    if (n.startsWith("miniflare-")) { out.instances++; continue; }
    try { out.instances += readdirSync(join(RUN_TMP, n)).filter((m) => m.startsWith("miniflare-")).length; }
    catch { /* not a directory, or gone */ }
  }
  return out;
};
const residueBefore = residue();

const planeSuites = readdirSync(join(ROOT, "test"))
  .filter((f) => f.endsWith(".test.mjs"))
  .filter((f) => filters.length === 0 || filters.some((x) => f.includes(x)))
  .sort()
  .map((f) => ({ label: f, cwd: ROOT, rel: join("test", f), fleet: null }));

/* ---- VF-3, 2026-08-08 (FL-2's turn): THE FLEET'S SUITES RUN TOO ------------
 *
 * THE DEFECT, MEASURED RATHER THAN SUSPECTED. Suites are discovered from
 * `bio-plane/test/` — which is the fix for D-93's second defect, a hand-kept list
 * of 38 files against a directory of 41 — and the fleet lives BESIDE the plane,
 * so `pdf-worker/test/pdf-worker.test.mjs` has been in the repository since
 * 2026-07-31 and **is run by nothing**. Its own `npm test` script exists and no
 * gate invokes it. Meanwhile `scripts/coverage.mjs` credited that member's
 * surface as REACHED, because reach there is read out of the suite's SOURCE.
 *
 * So the first fleet member's coverage figure was standing on a suite nobody
 * executed. That is `bundle.test.mjs`'s defect exactly (a suite in the directory
 * and in nothing's chain, so it had stopped being run and nothing said so), one
 * directory out — and it is D-117's own failure mode, a component going dark
 * while the figure holds still. VF-3 closes the instrument half; this closes the
 * half where the instrument's INPUT was never produced.
 *
 * Members are DISCOVERED by `fleet-member.json`, never listed here, for the same
 * reason the plane's suites are discovered from the directory.
 *
 * A MEMBER WHOSE SUITE CANNOT RESOLVE ITS IMPORTS IS SKIPPED LOUDLY AND BY NAME,
 * not failed — D-93's second half, the same treatment `ratify.test.mjs` gets when
 * `ssh-keygen` is absent. A fleet member keeps its own `node_modules` and a fresh
 * checkout has none, so failing would red the battery on every machine over a
 * dependency the plane does not own. The skip names the package AND the fix, and
 * it is counted in its own line of the summary rather than folded into the green
 * figure. `agent-worker`'s suite resolves miniflare from the plane's install and
 * therefore always runs; `pdf-worker`'s imports it bare and does not — that is a
 * DELEGATION to CONTENT-PDF, and until it lands the battery SAYS so on every run
 * instead of the member being invisible. */
const REPO = join(ROOT, "..");
const fleetSuites = [];
for (const dir of readdirSync(REPO).filter((d) => !d.startsWith("."))) {
  let meta;
  try { meta = JSON.parse(readFileSync(join(REPO, dir, "fleet-member.json"), "utf8")); } catch { continue; }
  const testDir = join(REPO, dir, meta.testDir || "test");
  let files = [];
  try { files = readdirSync(testDir).filter((f) => f.endsWith(".test.mjs")).sort(); } catch { /* none */ }
  for (const f of files) {
    const label = `${dir}/${f}`;
    if (filters.length && !filters.some((x) => label.includes(x))) continue;
    fleetSuites.push({ label, cwd: join(REPO, dir), rel: join(meta.testDir || "test", f), fleet: meta.name || dir });
  }
}

const suites = [...planeSuites, ...fleetSuites];

if (suites.length === 0) { console.error("no suites matched"); process.exit(1); }

const run = ({ cwd, rel }) => new Promise((resolve) => {
  const started = Date.now();
  const child = spawn(process.execPath, [rel], {
    cwd,
    /* D-186: the suite's temp files land in THIS RUN's directory, whatever the
       suite believes about where temp goes. os.tmpdir() reads $TMPDIR on every
       call, so this is the one place the choice can be made for all of them. */
    env: { ...process.env, TMPDIR: RUN_TMP },
  });
  let out = "";
  child.stdout.on("data", (d) => { out += d; });
  child.stderr.on("data", (d) => { out += d; });
  child.on("error", (e) => resolve({ code: -1, out: String(e), ms: Date.now() - started }));
  child.on("close", (code) => resolve({ code, out, ms: Date.now() - started }));
});

/* Assertion counts come from each suite's own tail line ("name: N pass, M fail"),
   because that is what the suites already print. A suite whose count cannot be
   read is reported as unknown rather than as zero: an unreadable number and no
   assertions are different claims, and collapsing them is how a suite that
   silently ran short would pass unnoticed (the `sshsig` 16-vs-18 case in D-93).
   The optional third group is a NAMED skip count on the same line ("..., 2 skip
   (fresh signature verifies; ...)"): a suite that honestly ran fewer assertions
   says so and says WHICH, so the runner can surface it instead of the number
   looking like a full green. */
const tally = (out) => {
  const m = [...out.matchAll(/(\d+)\s+pass(?:ed)?,\s+(\d+)\s+fail(?:ed)?(?:,\s+(\d+)\s+skip(?:ped)?\s*\(([^)]*)\))?/g)].pop();
  return m ? { pass: +m[1], fail: +m[2], skip: m[3] ? +m[3] : 0, skipWhat: m[4] || "" } : null;
};

/* A suite that cannot run at all prints a wholesale marker ("name: SKIPPED —
   <reason>") and exits 0. That is not a failure (it must not stop the battery)
   and not a pass (it proved nothing), so it gets its own status and its reason
   is carried into the summary BY NAME — the D-93 requirement that a suite never
   quietly does less. */
const skipReason = (out) => {
  const m = out.match(/^\s*[\w.-]+:\s*SKIPPED\b[\s—:-]*(.*)$/mi);
  return m ? m[1].trim() : null;
};

/* A FLEET member's suite that cannot resolve a package IN ITS OWN DIRECTORY is
   not evidence about the subject — it is evidence that nobody ran `npm ci` there.
   Converted to a NAMED skip for fleet suites only, and only for this one cause;
   every other non-zero exit is a failure exactly as before. The package is named
   so the reader knows what to install rather than being told something is wrong
   somewhere. */
const fleetDepSkip = (entry, out) => {
  if (!entry.fleet) return null;
  const m = out.match(/Cannot find (?:package|module) '([^']+)'/);
  if (!m) return null;
  return `${entry.fleet}'s suite cannot resolve '${m[1]}' — run \`npm ci\` in ${entry.cwd.split("/").pop()}/, `
       + `or have the suite resolve it from the plane's install as agent-worker's does. `
       + `THE MEMBER'S SUITE DID NOT RUN.`;
};

console.log(`\nbattery: ${suites.length} suites (${planeSuites.length} plane · ${fleetSuites.length} fleet)\n`);
const results = [];
for (const entry of suites) {
  const file = entry.label;
  const r = await run(entry);
  const t = tally(r.out);
  const skip = (r.code === 0 ? skipReason(r.out) : null) || fleetDepSkip(entry, r.out);
  results.push({ ...r, file, fleet: entry.fleet, tally: skip ? null : t, skip });
  const failedRun = r.code !== 0 && !skip;
  const status = failedRun ? "FAIL" : skip ? "skip" : "ok  ";
  const counts = skip
    ? `SKIPPED — ${skip}`
    : t
      ? `${t.pass} pass${t.fail ? `, ${t.fail} FAIL` : ""}${t.skip ? `, ${t.skip} skipped` : ""}`
      : "assertions unknown";
  console.log(`  ${status}  ${file.padEnd(34)} ${String(r.ms).padStart(6)}ms  ${counts}`);
  if (failedRun && !QUIET) console.log(r.out.split("\n").filter((l) => /FAIL|Error|error/.test(l)).slice(0, 8).map((l) => `          ${l}`).join("\n"));
}

const failed = results.filter((r) => r.code !== 0 && !r.skip);
const skips = results.filter((r) => r.skip);
const partial = results.filter((r) => r.tally && r.tally.skip > 0);
const unknown = results.filter((r) => r.tally === null && !r.skip);
const assertions = results.reduce((n, r) => n + (r.tally ? r.tally.pass : 0), 0);
const ms = results.reduce((n, r) => n + r.ms, 0);
const green = results.length - failed.length - skips.length;

console.log(`\n${green}/${results.length} suites green · `
  + (skips.length ? `${skips.length} skipped · ` : "")
  + `${assertions} assertions passing · ${(ms / 1000).toFixed(1)}s`);
if (skips.length) console.log(`  SKIPPED (named): ${skips.map((r) => `${r.file} — ${r.skip}`).join("\n                   ")}`);
if (partial.length) console.log(`  ran short (named): ${partial.map((r) => `${r.file} skipped ${r.tally.skip} — ${r.tally.skipWhat}`).join("\n                     ")}`);
if (unknown.length) console.log(`  ${unknown.length} suite(s) reported no assertion count: ${unknown.map((r) => r.file).join(", ")}`);
if (failed.length) console.log(`  FAILED: ${failed.map((r) => r.file).join(", ")}`);

/* VF-3: the fleet's own line, printed even when every member ran, so the figure
   cannot hold still while a member goes dark. `coverage.mjs --strict` reads each
   member's surface out of its suite's SOURCE; this says whether that source was
   ever EXECUTED. Both halves are needed and neither implies the other. */
{
  const fleetRes = results.filter((r) => r.fleet);
  const byMember = [...new Set(fleetRes.map((r) => r.fleet))];
  const ranMembers = [...new Set(fleetRes.filter((r) => !r.skip && r.code === 0).map((r) => r.fleet))];
  console.log(`fleet: ${byMember.length} member${byMember.length === 1 ? "" : "s"} beside the plane · `
    + `${fleetRes.length} suite(s) discovered · ${ranMembers.length} member(s) actually RAN`
    + `${byMember.length !== ranMembers.length
        ? ` · DARK: ${byMember.filter((m) => !ranMembers.includes(m)).join(", ")}`
        : ""}`);
  if (byMember.length !== ranMembers.length)
    console.log(`  a member whose suite did not run is a component coverage credits from a source read`
      + ` alone (D-117) — that is the generous direction, and it is named here rather than left green.`);
}

/* D-186's assertion. The comparison IS the control: this run has just built and
   torn down one workerd sandbox per miniflare instance, so anything still
   sitting in this run's own temp directory is a sandbox a suite failed to take
   down. Counted, not assumed, and it fails the run. */
const residueAfter = residue();
const leaking = residueAfter.instances > residueBefore.instances || residueAfter.dirs > residueBefore.dirs;
const leakedAfter = orphans().length;
console.log(`temp: this run left ${residueAfter.dirs} director${residueAfter.dirs === 1 ? "y" : "ies"}`
  + ` holding ${residueAfter.instances} miniflare sandbox${residueAfter.instances === 1 ? "" : "es"}`
  + ` (was ${residueBefore.dirs}/${residueBefore.instances} before the suites ran)`
  + ` · host orphans ${leakedBefore} -> ${leakedAfter}`);
if (leaking) {
  console.log(`  LEAKING ${residueAfter.instances - residueBefore.instances} miniflare sandbox(es) in`
    + ` ${residueAfter.dirs - residueBefore.dirs} director(ies) (D-186): ${readdirSync(RUN_TMP).slice(0, 6).join(", ")}`);
  console.log(`  a suite left a sandbox behind — most likely one that mints temp files without`);
  console.log(`  importing test/sandbox.mjs, which hygiene.test.mjs names by file.`);
} else if (leakedAfter > leakedBefore) {
  /* Not ours: every child of this run wrote into RUN_TMP by environment, so a
     rise in the HOST count while our own residue is clean is somebody else's
     battery — another worktree without this fix. Say so; do not fail on it. */
  console.log(`  note: host orphans rose by ${leakedAfter - leakedBefore} while this run leaked none —`);
  console.log(`  another checkout without this fix is running a battery into the same $TMPDIR.`);
}
console.log("");

process.exit(Math.min(failed.length + (leaking ? 1 : 0), 125));
