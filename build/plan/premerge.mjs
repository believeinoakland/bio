#!/usr/bin/env node
// BOB's merge of a complete job, one tested command instead of hand-typed steps (K5309; mechanics §5.5).
//   node build/plan/premerge.mjs <module> [<module> ...]      run from the product root, on tranche/T<n>
// For each module, in the order given: (1) fetch its job branch and the tranche; (2) refuse unless its record's
// state is COMPLETE and its cursor has read BOB's newest entry (K5171); (3) the ownership check against the
// merge base must read 0 failures; (4) merge with --no-ff (a conflict aborts the merge and stops). Then, once:
// regenerate the word table (setup-words, `--check` clean) and commit it if it changed; run each merged module's
// suite (node --test over its `tests` paths, with the sqlite platform, no --test-force-exit) and the checks.
// It prints one summary line per step and never pushes: BOB reads the summary, then pushes and writes the ruling.
// Every counter is read from the run's own summary lines (`ℹ tests`, `ℹ fail`), never from a guessed format.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const PROC = process.env.CIVICOS_PROCESS || "/home/user/civicos-process";
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28, ...opts }).trim();
const run = (cmd, args) => spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28 });
const die = (msg) => { console.log(`STOP: ${msg}`); process.exit(1); };

const mods = process.argv.slice(2);
if (!mods.length) die("name at least one module");
const branch = sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
const t = (branch.match(/^tranche\/(T\d+)$/) || [])[1];
if (!t) die(`not on a tranche branch (${branch})`);
if (sh("git", ["status", "--porcelain", "--untracked-files=no"])) die("working tree has uncommitted changes");
const all = JSON.parse(readFileSync("build/modules.json", "utf8"));
const list = Array.isArray(all) ? all : all.modules;

sh("git", ["fetch", "-q", "origin", `tranche/${t}`, ...mods.map((m) => `job/${t}/${m}`)]);
const merged = [];
for (const m of mods) {
  const job = `origin/job/${t}/${m}`;
  const rec = sh("git", ["show", `${job}:build/jobs/${t}/${m}.md`]);
  const status = rec.split("\n").find((l) => l.startsWith("**Status**")) || "";
  const bob = existsSync(`build/jobs/${t}/${m}.bob.md`) ? readFileSync(`build/jobs/${t}/${m}.bob.md`, "utf8") : "";
  const newest = Math.max(0, ...[...bob.matchAll(/^## B(\d+) /gm)].map((x) => +x[1]));
  const handled = +((status.match(/handled B(\d+)/) || [])[1] || 0);
  if (!/· COMPLETE ·/.test(status)) die(`${m}: state is not COMPLETE (${status})`);
  if (handled < newest) die(`${m}: its cursor reads B${handled}, BOB's newest is B${newest}`);
  const base = sh("git", ["merge-base", "HEAD", job]);
  const own = run("node", [`${PROC}/checks/ownership.mjs`, ".", m, base, job]);
  const ownLine = (own.stdout + own.stderr).trim().split("\n").pop();
  if (!/; 0 failures$/.test(ownLine)) die(`${m}: ${ownLine}`);
  const mg = run("git", ["merge", "-q", "--no-ff", job, "-m", `Merge job/${t}/${m}`]);
  if (mg.status !== 0) { run("git", ["merge", "--abort"]); die(`${m}: merge conflict, aborted`); }
  console.log(`MERGED ${m}: ${ownLine.replace(/^ownership: /, "")}`);
  merged.push(m);
}

sh("node", ["bio-plane/src/setup-words/build.mjs"]);
const wc = run("node", ["bio-plane/src/setup-words/build.mjs", "--check"]);
if (wc.status !== 0) die(`setup-words --check: ${wc.stdout}${wc.stderr}`);
if (sh("git", ["status", "--porcelain", "--untracked-files=no"])) {
  sh("git", ["commit", "-qam", `rows.mjs regenerated after merging ${merged.join(", ")}`]);
  console.log("ROWS regenerated and committed");
} else console.log("ROWS unchanged");

let red = false;
for (const m of merged) {
  const e = list.find((x) => x.id === m);
  const files = (e?.tests || []).flatMap((p) =>
    sh("git", ["ls-files", p]).split("\n").filter((f) => f.endsWith(".test.mjs")));
  if (!files.length) { console.log(`SUITE ${m}: no test files`); continue; }
  const r = run("node", ["--import", "./bio-plane/test/platform-sqlite.mjs", "--test", ...files]);
  const n = (k) => ((r.stdout.match(new RegExp(`^ℹ ${k} (\\d+)$`, "m")) || [])[1]);
  if (n("tests") === undefined) { red = true; console.log(`SUITE ${m}: no summary read (exit ${r.status})`); continue; }
  if (+n("fail")) red = true;
  console.log(`SUITE ${m}: tests ${n("tests")}, pass ${n("pass")}, fail ${n("fail")}, todo ${n("todo")}`);
}

const ck = run("node", [`${PROC}/checks/run.mjs`, "."]);
const out = ck.stdout + ck.stderr;
for (const k of ["format", "architecture", "words", "fixtures"]) {
  const l = out.split("\n").find((x) => x.startsWith(`${k}:`));
  const f = l?.match(/(\d+) failures?/)?.[0] ?? "not reported";
  if (k !== "fixtures" && f !== "0 failures") red = true;
  console.log(`CHECK ${k}: ${f}`);
}
const unnamed = out.split("\n").filter((x) => /live ids named by no test/.test(x)).map((x) => x.replace(/^FAIL\s+/, "").replace(/: .*no test: /, " "));
console.log(`CHECK coverage: ${unnamed.length ? unnamed.join("; ") : "0 unnamed ids"}`);
console.log(red ? "RESULT: merged locally; a suite or a check is red or unread (read above before pushing)" : "RESULT: merged locally, suites green; push, strike, write the ruling");
