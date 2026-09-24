/* gatetrace.mjs — M0-126 condition 2 (TREE-SHARING.md §3a): WHAT A GATE UNIT ACTUALLY READ.
 *
 * Preloaded into every node process of a gate step by `tools/gates.mjs` (`NODE_OPTIONS=--import=<this file>`), so a
 * suite, and every node process it spawns, records each REPOSITORY file it opens or imports. `gates.mjs` compares the
 * record with the unit's declared input set (the set its result key hashes): a file read that the key does not cover
 * FAILS the unit by name and no PASS is written for it — under-inclusion would otherwise reuse a stale PASS.
 *
 * WHICH UNIT. `BIO_GATE_TRACE_UNIT` names it when the gate spawns a unit directly (a UI suite, a UI check, coverage).
 * Under the battery the runner itself is not a unit: a process whose `argv[1]` is a unit's top file (the map in
 * `BIO_GATE_TRACE_TOPS`) names itself and exports the name, so everything it spawns is traced as the same unit. A
 * process that is neither (the battery runner) traces nothing.
 *
 * WHAT IT SEES: module loads (ESM and CommonJS, through `module.registerHooks`), and the fs calls that read a file's
 * CONTENT — readFile/readFileSync/open/openSync/createReadStream/copyFile/cp, callback, sync and promise forms — plus
 * directory listings (readdir/opendir), recorded apart; and (BOB #30) every `git` child run over THIS checkout that walks
 * history or a live ref (`history`). WHAT IT CANNOT SEE, stated: the FILES a non-node child reads (git, workerd, a
 * shell) — so `git show HEAD:x`, `git ls-files`, `git clone` of this repository read no file here; a git command run
 * through a shell script rather than node's child_process; a node child
 * spawned with an environment that drops NODE_OPTIONS; a process killed by a signal before its exit handler (its
 * record is lost, never invented); existence and stat checks. The record is written once, at exit, to
 * `BIO_GATE_TRACE_DIR`. It prints NOTHING: suites compare their children's output byte for byte.
 */
import fs from "node:fs";
import { resolve, sep, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as mod from "node:module";
import { inScratch } from "./scratchpath.mjs";  /* M0-146: the one scratch path, named once, there */

const DIR = process.env.BIO_GATE_TRACE_DIR;
const REPO = process.env.BIO_GATE_TRACE_REPO;
let unit = process.env.BIO_GATE_TRACE_UNIT || null;
if (DIR && REPO && !unit && process.env.BIO_GATE_TRACE_TOPS && process.argv[1]) {
  try {
    const tops = JSON.parse(fs.readFileSync(process.env.BIO_GATE_TRACE_TOPS, "utf8"));
    const me = resolve(process.argv[1]);
    if (tops[me]) { unit = tops[me]; process.env.BIO_GATE_TRACE_UNIT = unit; }
  } catch { /* no map: this process is not a unit */ }
}

if (DIR && REPO && unit) {
  const root = REPO.endsWith(sep) ? REPO : REPO + sep;
  const reads = new Set();
  const dirs = new Set();
  const rel = (p) => {
    try {
      if (p === undefined || p === null || typeof p === "number") return null;
      let s = p instanceof URL ? fileURLToPath(p) : Buffer.isBuffer(p) ? p.toString() : String(p);
      if (s.startsWith("file:")) s = fileURLToPath(s);
      const abs = resolve(s);
      if (!abs.startsWith(root)) return null;
      const r = abs.slice(root.length).split(sep).join("/");
      /* M0-146: `.scratch/` is a worker's own untracked scratch, not a file of the tree — `tools/gates.mjs` §2e does
         not enrol it in the universe, so a unit that WALKS THE ROOT (`budget-sweep`, `bounds`, `case-opened`) would
         otherwise read one and be FAILED BY NAME for reading outside its key. The three readings skip the one path
         together or the worker is punished by whichever still sees it. */
      if (!r || r.startsWith(".git/") || r === ".git" || r.includes("node_modules/") || inScratch(r)) return null;
      return r;
    } catch { return null; }
  };
  const note = (p) => { const r = rel(p); if (r) reads.add(r); };
  const noteDir = (p) => { const r = rel(p); if (r !== null) dirs.add(r); };
  const wrap = (obj, name, rec) => {
    const orig = obj && obj[name];
    if (typeof orig !== "function") return;
    obj[name] = function (...a) { try { rec(a[0]); } catch { /* never disturb the caller */ } return orig.apply(this, a); };
  };
  for (const n of ["readFileSync", "readFile", "openSync", "open", "createReadStream", "copyFileSync", "copyFile", "cpSync", "cp"])
    wrap(fs, n, note);
  for (const n of ["readdirSync", "readdir", "opendirSync", "opendir"]) wrap(fs, n, noteDir);
  for (const n of ["readFile", "open", "copyFile", "cp"]) wrap(fs.promises, n, note);
  for (const n of ["readdir", "opendir"]) wrap(fs.promises, n, noteDir);
  try { mod.syncBuiltinESMExports(); } catch { /* older node: CommonJS callers still traced */ }
  if (typeof mod.registerHooks === "function") {
    mod.registerHooks({
      load(url, context, nextLoad) { try { if (url.startsWith("file:")) note(url); } catch { /* ignore */ } return nextLoad(url, context); },
    });
  }
  /* BOB #30 (§3a condition 1): a unit whose verdict reads GIT HISTORY or a LIVE REF of THIS repository reads outside the
     tree its key names. A `git` child run in this checkout (its cwd, or `-C <dir>`, inside it) whose subcommand walks
     history or a remote, or whose arguments name a remote-tracking ref or a commit id, is recorded as `history`. A git
     run in a fixture repository elsewhere (the suite built its history itself) is not. */
  const history = new Set();
  const HISTORY_SUB = new Set(["log", "rev-list", "merge-base", "ls-remote", "fetch", "reflog", "describe", "blame",
    "shortlog", "whatchanged", "pull", "for-each-ref", "name-rev", "cherry"]);
  const REVISH = /^(?:origin\/|refs\/remotes\/|refs\/heads\/|@\{|FETCH_HEAD|ORIG_HEAD|[0-9a-f]{7,40}(?:[\^~:.]|$))/;
  const noteGit = (file, args, opts) => {
    try {
      if (typeof file !== "string" || !/(?:^|\/)git$/.test(file) || !Array.isArray(args)) return;
      let dir = resolve((opts && opts.cwd) ? String(opts.cwd instanceof URL ? fileURLToPath(opts.cwd) : opts.cwd) : process.cwd());
      const a = args.map(String);
      let i = 0;
      while (i < a.length && a[i].startsWith("-")) { if (a[i] === "-C" && a[i + 1]) { dir = resolve(dir, a[i + 1]); i += 2; } else if (a[i] === "-c") i += 2; else i++; }
      if (!(dir + sep).startsWith(root) && dir !== REPO) return;
      const sub = a[i] || "";
      if (HISTORY_SUB.has(sub) || a.slice(i + 1).some((x) => REVISH.test(x) || x.includes("origin/")))
        history.add(`git ${a.slice(i, i + 4).join(" ")}`.slice(0, 160));
    } catch { /* never disturb the caller */ }
  };
  const noteShell = (cmd, opts) => {
    try { const m = /^\s*git\s+(.*)$/.exec(String(cmd)); if (m) noteGit("git", m[1].split(/\s+/), opts); } catch { /* ignore */ }
  };
  try {
    const cp = await import("node:child_process");
    const C = cp.default || cp;
    for (const n of ["spawn", "spawnSync", "execFile", "execFileSync"]) {
      const orig = C[n];
      if (typeof orig !== "function") continue;
      C[n] = function (file, args, opts) {
        noteGit(file, Array.isArray(args) ? args : [], Array.isArray(args) ? opts : args);
        return orig.apply(this, arguments);
      };
    }
    for (const n of ["exec", "execSync"]) {
      const orig = C[n];
      if (typeof orig !== "function") continue;
      C[n] = function (cmd, opts) { noteShell(cmd, opts); return orig.apply(this, arguments); };
    }
    mod.syncBuiltinESMExports();
  } catch { /* child_process not patchable: history reads go unseen, and that is the stated reach */ }
  const origWrite = fs.writeFileSync;
  process.on("exit", () => {
    try {
      const f = join(DIR, `${unit.replace(/[^\w.-]+/g, "_")}.${process.pid}.${Date.now()}.json`);
      origWrite(f, JSON.stringify({ unit, pid: process.pid, argv1: process.argv[1] || null,
        reads: [...reads].sort(), dirs: [...dirs].sort(), history: [...history].sort() }));
    } catch { /* the trace dir is gone: the gate reads a missing record as UNTRACED, never as clean */ }
  });
}
