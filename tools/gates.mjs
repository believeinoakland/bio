#!/usr/bin/env node
/* gates.mjs — run the gates a CHANGE actually needs, and prove which class it was.
 *
 * WHY. The pre-push discipline is four gates (battery, coverage --strict, the UI
 * suite, plancheck) and the full set costs ~25 minutes of wall clock. Measured
 * 2026-08-10: a DOCS-ONLY change cannot alter the verdict of a suite that never
 * reads docs/ — the plane suites drive workerd against src/, the UI suites drive
 * app.html — so for the commonest change class in this repository (planning and
 * architecture prose) most of that wall clock buys nothing. Bob, 2026-08-10:
 * "can we be more surgical about which tests to run in order to get the same
 * assurances." This tool is that, with the same assurances made structural:
 *
 *   1. THE CHANGE CLASS IS MEASURED, NEVER DECLARED. The diff (committed vs the
 *      upstream base, plus anything uncommitted) is classified from its paths.
 *      One path in the plane, the UI, the fleet, the installer or a package/config
 *      file and the class is FULL. Unknown or unclassifiable state is FULL — and
 *      that now includes a checkout with no merge-base against `origin/main`,
 *      which until M0-98 was read as "nothing committed" and could narrow to DOCS.
 *      The narrow DOCS profile is reached only by a diff that is entirely prose
 *      under docs/; the TARGETED profile (M0-98, below) by any other diff that
 *      touches none of those five.
 *
 *   2. THE DOC-FACING SUITE SET IS DERIVED AT RUN TIME, NEVER LISTED. A suite is
 *      doc-facing iff its source (or its sibling .control.mjs) mentions `docs/`.
 *      A hand-maintained list is the D-93/D-113 defect — it silently falls
 *      behind the directory — so the set is grepped fresh from test/ on every
 *      run, and the suites named are printed so the selection is auditable.
 *
 *   3. plancheck ALWAYS runs (as --local mid-turn; the bare run is owed after
 *      the push — publication is the handoff gate's half).
 *
 * ---- D-293 (BOB #22's ruling): THE VERDICT IS RECORDED, KEYED BY THE TREE. ----
 * The push guard (`tools/pushguard.mjs`) never RUNS this tool — a push-time gate
 * would not converge (M-85) — so the gate leaves its verdict where the guard can
 * READ it: after every run over a tree that was CLEAN when the run began AND when
 * it ended (and was the same tree at both ends — a run across a change measured a
 * tree that never existed), one run file lands under
 * `<git common dir>/bio-gates/`, untracked and shared by every worktree, keyed by
 * `HEAD^{tree}` and carrying the verdict, the class and every step with the units
 * it re-ran. A dirty tree's run is NOT recorded, and says so. The record's key,
 * path and verdict rule are the guard's module, imported here, so the writer and
 * the reader cannot drift apart.
 *
 * ---- M0-98 (BOB #23's item 1): A TARGETED CLASS, AND `--since`. ----
 * TARGETED: a diff that touches no plane (`bio-plane/src|checks`, the plane's
 * shipped build, and whatever the plane imports from outside `bio-plane/` —
 * DERIVED, today `docprofile/`), no `civicos-ui/`, no fleet member (DERIVED from
 * `fleet-member.json`), no installer (`newgroup/`, `release/`) and no
 * package/config file runs the units that IMPORT, SPAWN or MENTION a changed path,
 * `coverage --strict` when a test file changed, and plancheck. The selection is
 * derived at run time and PRINTED with each unit's reason, as DOCS's is. A "unit"
 * is a plane or fleet suite (run through the battery by name), a UI suite, a UI
 * harness check, or `coverage --strict`.
 *
 * SELECTION IS BY MENTION, NOT BY IMPORT, and that is the defeat the row names: an
 * import-only selector misses a suite that reads through a COMPUTED path
 * (`join(REPO, "tools", name + ".mjs")`). A unit mentions a changed path when any
 * file it reads — its source, its sibling control, every `tools/*.mjs` and
 * `scripts/*.mjs` the unit names, and their relative imports, transitively — IS
 * that path, or contains its basename, or its stem as a quoted token, or WALKS its
 * directory: a file that enumerates directories (`readdirSync`, `ls-files` …) and
 * names the parent's last segment or any ancestor's repo-relative path as a quoted
 * token (`join(REPO, "tools")`), or a unit's own file enumerating the directory it
 * sits in (`readdirSync(DIR)`). Every file is read as CODE, its comments blanked by the
 * estate's one lexer (`walkfloor.mjs` `stripComments`, strings kept, since a path is a
 * string) — a file a unit imports and, since M0-116, the unit's own source and control too;
 * which tools and scripts a unit RUNS is still read off its whole text. An unmeasured `docs/` path also brings
 * in DOCS's own doc-facing set, so TARGETED never checks prose more narrowly than DOCS
 * does. REACH, stated: the plane's runtime code is
 * not read (it cannot read a repository file at run time; its dependencies are
 * imports inside the FULL set); a path assembled at run time from pieces none of
 * which is its name, its stem or its directory is invisible; a comment naming a
 * path reads nothing and selects nothing (M0-116), and a path written inside a
 * REGEX literal is blanked with the comments (the lexer's rule). CONDUCT's integration batches
 * stay FULL (`ORCHESTRATION.md`, THE RECORD IS PARTITIONED BY WRITER, rule 1).
 *
 * `--since [<rev>]` (default ORIG_HEAD): after a rebase, read the recorded verdict
 * of <rev>'s tree — it must be GREEN — and re-run only the units that read a path
 * changed on BOTH sides: YOURS (what the measured branch changed, and what this
 * branch changes on its new base) AND THE OTHER (what `origin/main` changed between
 * the two bases, gated where it landed); plus plancheck. BOTH SIDES means the unit
 * reads something from each — a unit whose suite moved upstream while the tool it
 * tests moved here re-runs even though no single file changed on both sides,
 * because that pairing was never measured anywhere. A difference from the measured
 * tree that the other side does not explain — a commit made after the gate, a fix
 * made while rebasing — was measured by nobody, and its readers re-run as TARGETED
 * would run them. A side carrying a FULL-class path is taken to be read by EVERY unit
 * (MENTION cannot see who reads the runtime), so a plane merge gated FULL and then
 * rebased over docs re-runs the readers of those docs; both sides carrying one is
 * FULL. No GREEN record, a dirty tree, or an unresolvable <rev>: the ordinary
 * classification runs instead, and says why.
 *
 * ---- M0-126 (TREE-SHARING.md §3a): THE SHARED, PER-UNIT RESULT RECORD. ----
 * Every unit the plan selects is KEYED by the hash of its inputs (§2e derives the set; `tools/gateresults.mjs` hashes
 * it with node's major and every lockfile). A unit whose key holds a PASS on the branch `gate-results` — written by ANY
 * clone — is not run and is printed REUSED, naming the record (§3b). What runs is TRACED (`tools/gatetrace.mjs`): a
 * read outside the key FAILS the unit by name. Each unit that passed, traced clean, on a clean tree, gets a PASS record
 * (§4b). A unit marked `GATE: never-cache (<reason>)`, one that runs plancheck, and plancheck itself always run.
 *
 * Usage:
 *   node tools/gates.mjs                  classify the change, run the right profile
 *   node tools/gates.mjs --full           force the full four gates
 *   node tools/gates.mjs --explain        classify and print the plan (and every unit's KEY); run nothing
 *   node tools/gates.mjs --since [<rev>]  after a rebase: re-check only what both sides touched
 *   node tools/gates.mjs --no-reuse       run every selected unit whatever `gate-results` holds (the backstop:
 *                                         every release cut runs `--full --no-reuse`); passes are still recorded
 *   node tools/gates.mjs --inputs <unit>  print a unit's input set (`all`: every unit's, as JSON); run nothing
 *   BIO_GATE_RESULTS=off                  no key, no trace, no reuse, no record — the gate as before M0-126
 *   BIO_GATE_RESULTS_REMOTE=<remote>      where `gate-results` is read and written (default `origin`)
 *
 * Exit: 0 all gates green · 1 a gate failed or the state could not be classified · 124 NOT MEASURED:
 * no gate failed, and a battery step's only failures were EXPIRED BUDGETS (M0-107, BOB #28). A step counts as
 * timed out only when it exits 124 AND the verdict file the battery wrote (`$BIO_BATTERY_VERDICT`) names at
 * least one NOT MEASURED suite; any other 124 is a failure. RED outranks NOT MEASURED outranks GREEN, and a
 * NOT MEASURED record is never refused by the push guard, never GREEN, and licenses no `--since`.
 *
 * NEGATIVE CONTROL (run it when you touch the classifier): stage one whitespace
 * edit in bio-plane/src/store.mjs alongside a docs edit and confirm the class
 * reads FULL; drop it and confirm DOCS. Recorded 2026-08-10, both directions.
 * RE-RUN 2026-09-21 by the D-293/M0-98 worker over this rewrite, in a scratch clone
 * of this tree (`--explain`): both directions held — FULL naming
 * `bio-plane/src/store.mjs`, then DOCS.
 * NEGATIVE CONTROL for the record, the refusal, TARGETED and `--since`:
 * `node bio-plane/test/gates.control.mjs`, which arms this file and
 * `tools/pushguard.mjs` one arm at a time against `bio-plane/test/gates.test.mjs`.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, existsSync, statSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir, hostname } from "node:os";
import { join, dirname, resolve, relative, basename, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { appendRun, readRuns, effectiveVerdict } from "./pushguard.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const sh = (cmd, args) =>
  execFileSync(cmd, args, { cwd: REPO, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const tryGit = (args) => { try { return sh("git", args); } catch { return null; } };

const ARGV = process.argv.slice(2);
const FORCE_FULL = ARGV.includes("--full");
const EXPLAIN = ARGV.includes("--explain");
/* M0-126 (TREE-SHARING.md §3a): `--no-reuse` runs every selected unit whatever `gate-results` holds (the FULL
   backstop: every release cut runs `--full --no-reuse`); its passes are still recorded. `BIO_GATE_RESULTS=off` turns
   the whole mechanism off — no key, no trace, no reuse, no record: the gate as it stood before M0-126. */
const NO_REUSE = ARGV.includes("--no-reuse");
const RESULTS_OFF = process.env.BIO_GATE_RESULTS === "off";
const SINCE_AT = ARGV.indexOf("--since");
const SINCE = SINCE_AT < 0 ? null
  : (ARGV[SINCE_AT + 1] && !ARGV[SINCE_AT + 1].startsWith("--") ? ARGV[SINCE_AT + 1] : "ORIG_HEAD");
const short = (x) => String(x || "").slice(0, 8);

/* ---- 0 · the tree this run measures (D-293) ---------------------------- */
const statusNow = () => tryGit(["status", "--porcelain", "--untracked-files=normal"]);
const treeNow = () => tryGit(["rev-parse", "--verify", "--quiet", "HEAD^{tree}"]);
const START = { head: tryGit(["rev-parse", "--verify", "--quiet", "HEAD"]), tree: treeNow(), status: statusNow() };
const CLEAN_AT_START = START.status === "" && !!START.tree;

/* ---- 1 · what changed, measured ---------------------------------------- */
const listDiff = (args) => {
  const out = tryGit(["diff", "--name-only", "--no-renames", ...args]);
  return out === null ? null : out.split("\n").filter(Boolean);
};
const untrackedNow = () => {
  const out = tryGit(["ls-files", "--others", "--exclude-standard"]);
  return out === null ? null : out.split("\n").filter(Boolean);
};
const base = tryGit(["merge-base", "HEAD", "origin/main"]);
let changed = null;
let unreadable = "";
if (!base) unreadable = "no merge-base with origin/main, so the committed diff cannot be measured";
else {
  /* --no-renames: a rename is reported as BOTH of its paths, or a suite still naming the old one
     would never be selected. */
  const committed = listDiff([base, "HEAD"]);
  const working = listDiff(["HEAD"]);
  const untracked = untrackedNow();
  if (committed === null || working === null || untracked === null) unreadable = "a git read failed";
  else changed = new Set([...committed, ...working, ...untracked]);
}

const isDocsPath = (p) =>
  p.startsWith("docs/") &&
  (p.endsWith(".md") || p.endsWith(".html") || p.endsWith(".svg"));

/* ---- 1b · what is FULL, derived where it can be (M0-98) ----------------- */
const isFile = (abs) => { try { return statSync(abs).isFile(); } catch { return false; } };
const listDir = (abs) => { try { return readdirSync(abs).sort(); } catch { return []; } };
const repoRel = (abs) => relative(REPO, abs).split(sep).join("/");
const readJSON = (abs) => { try { return JSON.parse(readFileSync(abs, "utf8")); } catch { return null; } };

/* The fleet is whatever carries a manifest — the same discovery the battery and coverage use. */
const FLEET = listDir(REPO).filter((d) => !d.startsWith(".") && isFile(join(REPO, d, "fleet-member.json")))
  .map((d) => ({ dir: d, meta: readJSON(join(REPO, d, "fleet-member.json")) || {} }));

const IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["'`](\.{1,2}\/[^"'`\n]+)["'`]/g;
const URL_RE = /new URL\(\s*["'`](\.{1,2}\/[^"'`\n]+\.(?:mjs|js|cjs))["'`]\s*,\s*import\.meta\.url/g;

/* What the plane imports from OUTSIDE `bio-plane/src|checks` is plane code too (docprofile/ is
   read by `src/index.mjs`). Walked by import from both roots; a file reached outside `bio-plane/`
   makes its whole top-level directory plane code, one reached inside `bio-plane/` only itself. */
const PLANE_ROOTS = ["bio-plane/src/", "bio-plane/checks/"];
const PLANE_SHIPPED = ["bio-plane/dist/", "bio-plane/public/"];
const planeForeign = (() => {
  const roots = new Set(), files = new Set(), seen = new Set();
  const stack = [];
  const walk = (dirAbs) => {
    for (const n of listDir(dirAbs)) {
      const abs = join(dirAbs, n);
      if (isFile(abs)) { if (/\.(?:mjs|js)$/.test(n)) stack.push(abs); }
      else if (!n.startsWith(".") && n !== "node_modules") walk(abs);
    }
  };
  for (const r of PLANE_ROOTS) walk(join(REPO, r));
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    let src = "";
    try { src = readFileSync(f, "utf8"); } catch { continue; }
    for (const m of src.matchAll(IMPORT_RE)) {
      const t = resolve(dirname(f), m[1]);
      const rel = repoRel(t);
      if (rel.startsWith("..") || !isFile(t)) continue;
      if (PLANE_ROOTS.some((r) => rel.startsWith(r))) continue;
      if (rel.startsWith("bio-plane/")) files.add(rel);
      else roots.add(`${rel.split("/")[0]}/`);
      stack.push(t);
    }
  }
  return { roots: [...roots].sort(), files: [...files].sort() };
})();

const UI_ROOT = "civicos-ui/";
const INSTALLER_ROOTS = ["newgroup/", "release/"];
const PACKAGE_FILES = new Set(["package.json", "package-lock.json", "npm-shrinkwrap.json", "wrangler.jsonc",
  "wrangler.json", "wrangler.toml", "fleet-member.json", ".npmrc", ".nvmrc", ".node-version",
  "tsconfig.json", "jsconfig.json"]);

/* Why a path forces FULL, or null. A root-level dotfile or dot-directory (`.gitignore`,
   `.worktreeinclude`, `.env.example`, `.claude/`) is configuration: it changes what git tracks
   or how every session runs, which no suite's source names. */
function fullReason(p) {
  if (PLANE_ROOTS.some((r) => p.startsWith(r))) return "the plane";
  if (PLANE_SHIPPED.some((r) => p.startsWith(r))) return "the plane's shipped build";
  if (planeForeign.files.includes(p) || planeForeign.roots.some((r) => p.startsWith(r))) return "code the plane imports";
  if (p.startsWith(UI_ROOT)) return "the UI";
  if (FLEET.some((m) => p.startsWith(`${m.dir}/`))) return "a fleet member";
  if (INSTALLER_ROOTS.some((r) => p.startsWith(r))) return "the installer";
  if (PACKAGE_FILES.has(basename(p))) return "a package/config file";
  if (p.startsWith(".")) return "a package/config file";
  return null;
}
/* Runtime code: its text is not scanned for mentions and its imports are not followed. */
const isRuntime = (p) => PLANE_ROOTS.some((r) => p.startsWith(r)) || PLANE_SHIPPED.some((r) => p.startsWith(r))
  || planeForeign.files.includes(p) || planeForeign.roots.some((r) => p.startsWith(r))
  || FLEET.some((m) => p.startsWith(`${m.dir}/src/`) || p.startsWith(`${m.dir}/dist/`))
  || p.startsWith("newgroup/src/") || p.startsWith("newgroup/dist/");
const isTestFile = (p) => /(?:^|\/)test\//.test(p) || /\.(?:test|control)\.mjs$/.test(p);

/* ---- 1c · the class ----------------------------------------------------- */
function classify(paths) {
  if (paths.length === 0) return { cls: "DOCS", why: "empty diff — nothing beyond prose can have moved" };
  if (paths.every(isDocsPath)) return { cls: "DOCS", why: `${paths.length} path(s), all prose under docs/` };
  const hits = paths.map((p) => [p, fullReason(p)]).filter(([, r]) => r);
  if (hits.length)
    return { cls: "FULL", why: `${hits[0][1]} in the diff: ${hits[0][0]}${hits.length > 1 ? ` (+${hits.length - 1} more)` : ""}` };
  return { cls: "TARGETED",
           why: `${paths.length} path(s), none in the plane, the UI, the fleet, the installer or a package/config file` };
}

let cls = "FULL";
let why = "forced";
if (!FORCE_FULL) {
  if (!changed) why = `${unreadable} — refusing to narrow`;
  else ({ cls, why } = classify([...changed]));
}

/* ---- 2 · the doc-facing suite set, derived ------------------------------ */
/* A SUITE READS docs/ THROUGH A TOOL AS SURELY AS DIRECTLY. Corrected 2026-09-18 (LED-2) from
   M-57's finding that `owed.test.mjs` — which reads DEBT.md, DECISIONS.md and QUEUE.md live
   through `tools/owed.mjs` — was NOT in the doc-facing set: its own source never spells `docs/`,
   because the path lives in the tool's `SOURCES`. The fix is the CLASS, not a hand entry for one
   suite (a list is the D-93 defect this header refuses): a suite is doc-facing iff it, its control,
   or any `tools/<name>.mjs` it names — followed through that tool's own `./x.mjs` imports — mentions
   `docs/`. REACH, stated: a tool reached only through `bio-plane/scripts/` is not followed. */
const toolReachesDocs = (() => {
  const memo = new Map();
  const reaches = (name, seen = new Set()) => {
    if (memo.has(name)) return memo.get(name);
    if (seen.has(name)) return false;
    seen.add(name);
    let src = "";
    try { src = readFileSync(join(REPO, "tools", name), "utf-8"); } catch { memo.set(name, false); return false; }
    const hit = src.includes("docs/")
      || [...src.matchAll(/["']\.\/([\w.-]+\.mjs)["']/g)].some((m) => reaches(m[1], seen));
    memo.set(name, hit);
    return hit;
  };
  return reaches;
})();
function docFacing(dir) {
  const out = [];
  let files = [];
  try { files = readdirSync(join(REPO, dir)).filter((f) => f.endsWith(".test.mjs")); } catch { return out; }
  for (const f of files.sort()) {
    const src = readFileSync(join(REPO, dir, f), "utf-8");
    const ctrl = join(REPO, dir, f.replace(/\.test\.mjs$/, ".control.mjs"));
    const ctrlSrc = existsSync(ctrl) ? readFileSync(ctrl, "utf-8") : "";
    const viaTool = [...(src + ctrlSrc).matchAll(/tools\/([\w.-]+\.mjs)/g)].some((m) => toolReachesDocs(m[1]));
    if (src.includes("docs/") || ctrlSrc.includes("docs/") || viaTool) out.push(f);
  }
  return out;
}

const planeDoc = docFacing("bio-plane/test");
const uiDoc = docFacing("civicos-ui/test");

/* ---- 2b · the units, and what each one reads (M0-98) --------------------- */
const isSuite = (f) => f.endsWith(".test.mjs");
const topsOf = (dirAbs, f) => {
  const ctrl = join(dirAbs, f.replace(/\.test\.mjs$/, ".control.mjs"));
  return isFile(ctrl) ? [join(dirAbs, f), ctrl] : [join(dirAbs, f)];
};
const UNITS = (() => {
  const u = [];
  const planeDir = join(REPO, "bio-plane/test");
  for (const f of listDir(planeDir).filter(isSuite))
    u.push({ id: `plane:${f}`, kind: "plane", name: f, filter: f, tops: topsOf(planeDir, f) });
  for (const m of FLEET) {
    const td = join(REPO, m.dir, m.meta.testDir || "test");
    for (const f of listDir(td).filter(isSuite))
      u.push({ id: `fleet:${m.dir}/${f}`, kind: "fleet", name: `${m.dir}/${f}`, filter: `${m.dir}/${f}`, tops: topsOf(td, f) });
  }
  const uiDir = join(REPO, "civicos-ui/test");
  for (const f of listDir(uiDir).filter(isSuite))
    u.push({ id: `ui:${f}`, kind: "ui", name: f, tops: topsOf(uiDir, f) });
  /* The harness's checks are the ones its runner RUNS, read from the runner rather than listed. */
  let runner = "";
  try { runner = readFileSync(join(uiDir, "run.mjs"), "utf8"); } catch { /* no UI harness here */ }
  for (const m of new Set([...runner.matchAll(/["'`]\.\.\/(check-[\w.-]+\.mjs)["'`]/g)].map((x) => x[1])))
    if (isFile(join(REPO, "civicos-ui", m))) u.push({ id: `uicheck:${m}`, kind: "uicheck", name: m, tops: [join(REPO, "civicos-ui", m)] });
  const cov = join(REPO, "bio-plane/scripts/coverage.mjs");
  if (isFile(cov)) u.push({ id: "coverage", kind: "coverage", name: "coverage --strict", tops: [cov] });
  return u;
})();

const textMemo = new Map();
const textOf = (abs) => {
  if (!textMemo.has(abs)) { let s = null; try { s = readFileSync(abs, "utf8"); } catch { /* gone */ } textMemo.set(abs, s); }
  return textMemo.get(abs);
};
/* A FILE A UNIT MERELY IMPORTS IS READ AS CODE, ITS COMMENTS BLANKED — by the estate's ONE lexer
   (`stripComments` in `bio-plane/scripts/walkfloor.mjs`, D-301: strings KEPT, since a path is a string),
   never a second one. The helpers every suite imports cite files in their prose (`stdio.mjs` names
   `MEASUREMENTS.md`, `provenance.mjs` names `coverage.mjs`), and read by prose, one appended measurement
   selected 219 units and one `REGISTER_FLOOR` move ~100 (measured 2026-09-21, before this).
   A UNIT'S OWN FILES ARE READ AS CODE TOO (M0-116, BOB #27, 2026-09-22). They were read whole, comments
   included, on the reasoning that over-selection is the safe direction; measured, it was not safe but merely
   expensive — about 30 suites were selected for a MEASUREMENTS-only change because their OWN prose cites a
   measurement (`see MEASUREMENTS.md M-60`), and a comment reads nothing. A suite that READS the file does it
   through a string (`join(REPO, "docs/development/MEASUREMENTS.md")`), which the lexer keeps. What a unit names
   as a tool or script it RUNS (`edges`) is still read off the whole text. If the lexer cannot be loaded, every
   file is read whole and the plan SAYS so. */
let stripComments = null;
try { ({ stripComments } = await import("../bio-plane/scripts/walkfloor.mjs")); } catch { /* read whole, and say so */ }
const codeMemo = new Map();
const codeOf = (abs) => {
  if (!stripComments) return textOf(abs);
  if (!codeMemo.has(abs)) { const s = textOf(abs); let c = s; try { c = s === null ? null : stripComments(s); } catch { /* read whole */ } codeMemo.set(abs, c); }
  return codeMemo.get(abs);
};
const TOOL_RE = /\btools\/([\w.-]+\.mjs)\b/g;
const SCRIPT_RE = /\bscripts\/([\w.-]+\.mjs)\b/g;
/* [file, how it is reached]: "import" for a relative import or a `new URL(…, import.meta.url)`
   module, "name" for a tool or script the UNIT ITSELF names (only a unit's own files are read for
   names — a tool naming another tool in prose is not evidence that it runs it). */
const EDGES_MEMO = new Map();
function edges(abs, top) {
  const mk = `${abs}\0${top ? 1 : 0}`;
  if (!EDGES_MEMO.has(mk)) EDGES_MEMO.set(mk, edgesOf(abs, top));
  return EDGES_MEMO.get(mk);
}
function edgesOf(abs, top) {
  const src = textOf(abs) || "";
  const out = new Map();
  for (const m of src.matchAll(IMPORT_RE)) out.set(resolve(dirname(abs), m[1]), "import");
  for (const m of src.matchAll(URL_RE)) out.set(resolve(dirname(abs), m[1]), "import");
  if (top) {
    /* The plane's `scripts/` and the unit's own package's `scripts/` are both tried, and only a
       file that exists is followed. */
    const pkg = repoRel(abs).split("/")[0];
    const named = (p) => { if (!out.has(p)) out.set(p, "name"); };
    for (const m of src.matchAll(TOOL_RE)) named(join(REPO, "tools", m[1]));
    for (const m of src.matchAll(SCRIPT_RE)) { named(join(REPO, "bio-plane/scripts", m[1])); named(join(REPO, pkg, "scripts", m[1])); }
  }
  return [...out].filter(([p]) => isFile(p));
}
const closureMemo = new Map();
function closure(unit) {
  if (closureMemo.has(unit.id)) return closureMemo.get(unit.id);
  const seen = new Map();
  const stack = unit.tops.map((t) => [t, "self"]);
  for (const t of unit.tops) stack.push(...edges(t, true));
  while (stack.length) {
    const [f, how] = stack.pop();
    if (seen.has(f)) continue;
    seen.set(f, how);
    if (isRuntime(repoRel(f)) && !unit.tops.includes(f)) continue;
    for (const e of edges(f, false)) if (!seen.has(e[0])) stack.push(e);
  }
  closureMemo.set(unit.id, seen);
  return seen;
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TOKEN_RE_MEMO = new Map();
const tokenRe = (tok) => {
  if (!TOKEN_RE_MEMO.has(tok)) TOKEN_RE_MEMO.set(tok, new RegExp(`["'\`/]${esc(tok)}/?["'\`]`));
  return TOKEN_RE_MEMO.get(tok);
};
const probeMemo = new Map();
function probesFor(p) {
  if (probeMemo.has(p)) return probeMemo.get(p);
  const base = basename(p);
  const stem = base.includes(".") ? base.slice(0, base.lastIndexOf(".")) : base;
  const parts = p.split("/").slice(0, -1);
  const dirs = [];
  for (let i = parts.length; i >= 1; i--) dirs.push(parts.slice(0, i).join("/"));
  /* [the directory it stands for, the token, its quoted-token regex]: every ancestor by its
     repo-relative path, and the parent by its last segment too (`join(ROOT, "test")`). */
  const dirProbes = dirs.map((d) => [d, d, tokenRe(d)]);
  if (parts.length > 1) { const seg = parts[parts.length - 1]; dirProbes.push([parts.join("/"), seg, tokenRe(seg)]); }
  const probe = { base, stem, stemRe: stem ? tokenRe(stem) : null, dirProbes };
  probeMemo.set(p, probe);
  return probe;
}
/* A token is tested with a plain `includes` first and its quoted-token regex only on a hit, and
   each (file, token) answer is kept: a `--since` over a large docs move asks hundreds of paths of
   the same few hundred files, and nearly every token appears in nearly none of them. */
const tokenMemo = new Map();
function hasToken(abs, s, tok, re) {
  const key = `${abs}\0${s.length}\0${tok}`;
  if (!tokenMemo.has(key)) tokenMemo.set(key, s.includes(tok) && re.test(s));
  return tokenMemo.get(key);
}
/* A WALK needs a walker: a directory token in a file that never enumerates a directory is a path
   being BUILT, and a built path that reaches the changed file names it (basename or stem) and is
   caught above. Without this, every `join(REPO, "bio-plane", …)` read as a walk of bio-plane/ and a
   one-suite edit selected 258 units (measured 2026-09-21, before this line). */
const DISCOVERY_RE = /\b(?:readdirSync|readdir|opendirSync|opendir|globSync)\s*\(|["'`]ls-(?:files|tree)["'`]|\bgit\s+(?:ls-files|ls-tree|grep)\b|["'`]grep["'`]/;
const walkerMemo = new Map();
/* A walker ENUMERATES in code: a primitive named in a comment walks nothing. */
const isWalker = (abs) => { if (!walkerMemo.has(abs)) walkerMemo.set(abs, DISCOVERY_RE.test(codeOf(abs) || "")); return walkerMemo.get(abs); };
function fileHit(abs, p, own = false) {
  const s = codeOf(abs);          /* M0-116: a unit's own files too — see the lexer's block above */
  if (!s) return null;
  const pr = probesFor(p);
  if (s.includes(pr.base)) return `names ${pr.base}`;
  if (pr.stemRe && hasToken(abs, s, pr.stem, pr.stemRe)) return `names "${pr.stem}"`;
  if (!isWalker(abs, s)) return null;
  for (const [d, tok, re] of pr.dirProbes) if (hasToken(abs, s, tok, re)) return `walks ${d}/`;
  /* A unit's OWN file that enumerates a directory and sits in the changed path's directory walks
     its own directory (`readdirSync(DIR)` over `bio-plane/test/` is how the census suites read
     every suite). Only a unit's own files: a shared tool enumerating something else would drag
     in every unit that imports it. */
  if (own && dirname(abs) === dirname(join(REPO, p))) return `walks its own directory, ${repoRel(dirname(abs))}/`;
  return null;
}
/* Does this unit read the path? The reason, or null. */
function reads(unit, p) {
  const cl = closure(unit);
  const abs = join(REPO, p);
  if (unit.tops.includes(abs)) return "is the changed file";
  if (cl.has(abs)) return cl.get(abs) === "name" ? "names it as a tool or script it runs" : "imports it";
  for (const f of cl.keys()) {
    const own = unit.tops.includes(f);
    if (isRuntime(repoRel(f)) && !own) continue;
    const h = fileHit(f, p, own);
    if (h) return `${h} in ${repoRel(f)}`;
  }
  return null;
}
/* Every unit (of `among`, default all) reading any of `paths`, with its first reason. */
function selectReaders(paths, among = UNITS) {
  const out = new Map();
  for (const unit of among) {
    for (const p of paths) {
      const r = reads(unit, p);
      if (r) { out.set(unit.id, { unit, why: `${p}: ${r}` }); break; }
    }
  }
  return out;
}

/* ---- 2c · TARGETED, and --since --------------------------------------- */
let selection = null;      // Map id -> { unit, why }
let sinceInfo = null;
let sinceNote = "";

/* THE READERS OF A SET OF PATHS, by MENTION — docs paths included — with DOCS's own doc-facing set (the
   rule this estate already trusts for prose) as the BOUND on a docs/ path, on whichever side keeps it safe:
     "net" — an UNMEASURED prose change (TARGETED, or what changed since a gate) also brings in every
             doc-facing unit: prose is never checked more narrowly than DOCS checks it;
     "cap" — the OTHER side's prose in a `--since` pairing, gated where it landed, is read only by the
             doc-facing units that name it: the interaction is never checked more widely than DOCS would
             check the move itself. Without the cap, suites whose own prose cites a ledger (`MEASUREMENTS.md`,
             `QUEUE.md`) made a re-merge over a docs move WIDER than the 41 it replaces (79 and 55, measured
             2026-09-21, before this line); REACH, stated: the cap inherits DOCS's own blind spot, a suite
             reading prose only through `bio-plane/scripts/`;
     "fine" — mention alone (your own side, in a pairing). */
const DOC_FACING = new Set([...planeDoc.map((f) => `plane:${f}`), ...uiDoc.map((f) => `ui:${f}`)]);
function readersOf(paths, among = UNITS, { docs: docsMode = "net" } = {}) {
  const docs = paths.filter((p) => p.startsWith("docs/"));
  const rest = paths.filter((p) => !p.startsWith("docs/"));
  const out = selectReaders(docsMode === "cap" ? rest : paths, among);
  if (docs.length && docsMode === "cap")
    for (const [id, v] of selectReaders(docs, among.filter((u) => DOC_FACING.has(u.id)))) if (!out.has(id)) out.set(id, v);
  if (docs.length && docsMode === "net") for (const unit of among)
    if (!out.has(unit.id) && DOC_FACING.has(unit.id))
      out.set(unit.id, { unit, why: `doc-facing, and ${docs[0]}${docs.length > 1 ? ` (+${docs.length - 1} more)` : ""} changed` });
  return out;
}
function targetedSelection(paths) {
  const sel = readersOf(paths);
  const testChange = paths.find(isTestFile);
  const cov = UNITS.find((u) => u.id === "coverage");
  if (testChange && cov && !sel.has("coverage")) sel.set("coverage", { unit: cov, why: `a test file changed: ${testChange}` });
  return sel;
}

/* ---- 2e · M0-126: EACH UNIT'S INPUT SET, read FORWARD (TREE-SHARING.md §3a "The key") -------------------------
   The same rule `reads(unit, p)` answers one path at a time, turned around: every repository file the unit's
   MENTION reach covers — its closure (source, sibling control, the tools and scripts it names, their relative
   imports), every path a closure file names by basename or by stem as a quoted token, every directory a walker
   names (a file that enumerates, naming the directory's path, or its parent's last segment), and a unit's own
   walker's own directory — PLUS, where MENTION is blind by construction:
     - a doc-facing unit (DOCS's own rule, §2) takes every `docs/` path: it reads prose through tools whose paths
       are assembled at run time;
     - a plane or fleet unit takes the whole FULL-class runtime set (§3a): the plane's roots and shipped build, the
       code it imports from outside `bio-plane/`, every fleet member, and `bio-plane/`'s own package/config files.
   The universe is every TRACKED file present on disk plus every untracked, unignored one. What a unit reads that
   this set misses is found at run time by the trace (condition 2) and FAILS the unit by name. */
const I_MEMO = new Map();
let UNIVERSE = null;
function universe() {
  if (UNIVERSE) return UNIVERSE;
  const tracked = (tryGit(["ls-files", "-z"]) ?? "").split("\0").filter(Boolean);
  const untracked = (tryGit(["ls-files", "-z", "--others", "--exclude-standard"]) ?? "").split("\0").filter(Boolean);
  const paths = [...new Set([...tracked, ...untracked])].filter((p) => isFile(join(REPO, p))).sort();
  const byBase = new Map(), byStem = new Map(), under = new Map(), inDir = new Map();
  const push = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
  for (const p of paths) {
    const pr = probesFor(p);
    push(byBase, pr.base, p);
    if (pr.stem) push(byStem, pr.stem, p);
    const parts = p.split("/");
    for (let i = 1; i < parts.length; i++) push(under, parts.slice(0, i).join("/"), p);
    push(inDir, parts.length > 1 ? parts.slice(0, -1).join("/") : "", p);
  }
  UNIVERSE = { paths, set: new Set(paths), byBase, byStem, under, inDir };
  return UNIVERSE;
}
/* The paths ONE file's text reaches, as `fileHit` would answer them for every path at once. */
function forwardHits(abs, own) {
  const key = `${abs}\0${own ? 1 : 0}`;
  if (I_MEMO.has(key)) return I_MEMO.get(key);
  const out = new Set();
  const s = codeOf(abs);
  const U = universe();
  if (s) {
    /* THE SAME THREE PROBES AS `fileHit`, answered for every path in one pass over the text (measured: a probe per
       path per file cost ~12 s over the estate's 346 units; this costs well under one). A basename is a SUBSTRING
       (`s.includes(base)`): found at each `.<ext>` in the text, by the basenames ending in that extension. A stem or
       a directory is a QUOTED TOKEN (`tokenRe`: a quote or `/` before it, an optional `/` and a quote after it): the
       text's every such token is collected once, from each quote backwards. */
    const { byExt, bare } = baseIndex();
    for (const m of s.matchAll(/\.([A-Za-z0-9_-]+)/g)) {
      for (let n = 1; n <= m[1].length; n++) {      /* every prefix: `a.mjs` is a substring of `a.mjsx` too */
        const cands = byExt.get(m[1].slice(0, n));
        if (!cands) continue;
        const end = m.index + 1 + n;
        for (const [b, ps] of cands) if (end - b.length >= 0 && s.startsWith(b, end - b.length)) for (const p of ps) out.add(p);
      }
    }
    for (const [b, ps] of bare) if (s.includes(b)) for (const p of ps) out.add(p);
    const toks = quotedTokens(s);
    for (const [st, ps] of U.byStem) if (toks.has(st)) for (const p of ps) out.add(p);
    if (isWalker(abs)) {
      for (const [d, ps] of U.under) {
        const seg = d.slice(d.lastIndexOf("/") + 1);
        if (toks.has(d)) for (const p of ps) out.add(p);
        else if (d.includes("/") && toks.has(seg)) for (const p of U.inDir.get(d) || []) out.add(p);
      }
      if (own) for (const p of U.inDir.get(repoRel(dirname(abs))) || []) out.add(p);
      /* A unit's OWN file, or a helper DEDICATED to it (in the closure of at most three units — `budgetsweep.mjs` is
         `budget-sweep.test.mjs`'s instrument). A SHARED helper that can walk the root (a scanner dozens of suites import)
         does so for whichever caller asks, and read as every importer's walk it took 96 units to the whole tree while
         their traces read a median of 54 files (measured 2026-09-23). A shared helper's root walk that a unit does reach
         is found by the trace and FAILS it by name — the safe direction. */
      if ((own || importers(abs) <= 3) && walksRoot(abs, s)) for (const p of U.paths) out.add(p);
    }
  }
  I_MEMO.set(key, out);
  return out;
}
/* A WALK OF THE REPOSITORY ROOT names no directory at all — `walk(REPO)`, `})(REPO)`, `readdirSync(ROOT, {…})` — so the
   token probes above cannot see it, and the trace found it (measured 2026-09-23: `bounds`, `budget-sweep` and
   `case-opened` each read 700–800 files their MENTION set missed). A walker file that binds a name to the repository root
   (a `const` whose value resolves, from `import.meta.url` or a name already bound, to this checkout's top) and passes
   that name ALONE as a call's first argument walks the whole tree, so every path is its input. */
let IMPORTERS = null;
function importers(abs) {
  if (!IMPORTERS) {
    IMPORTERS = new Map();
    for (const u of UNITS) for (const f of closure(u).keys()) IMPORTERS.set(f, (IMPORTERS.get(f) || 0) + 1);
  }
  return IMPORTERS.get(abs) || 0;
}
function walksRoot(abs, s) {
  const bound = new Map();
  const here = dirname(abs);
  for (const m of s.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+)/g)) {
    const [, name, expr] = m;
    let at = null;
    if (/import\.meta\.(?:url|dirname)/.test(expr)) at = here;
    else { const id = /^\s*(?:(?:join|resolve)\(\s*)?([A-Za-z_$][\w$]*)/.exec(expr); if (id && bound.has(id[1])) at = bound.get(id[1]); }
    if (at === null) continue;
    const lits = [...expr.matchAll(/["'`]([^"'`\n]*)["'`]/g)].map((x) => x[1]);
    if (lits.some((l) => !/^[./]*$/.test(l))) continue;          /* a literal naming a directory: not the root */
    bound.set(name, resolve(at, ...lits));
  }
  const top = resolve(REPO);
  for (const [name, dir] of bound) {
    if (dir !== top) continue;
    /* `walk(R)`, `})(R)`, `readdirSync(R, {…})` — or R as a DEFAULT (`{ repo = R }`), which a caller passing nothing
       walks (`budgetsweep.mjs`'s `sweepBudgets()`). */
    if (new RegExp(`\\(\\s*${esc(name)}\\s*(?:\\)|,\\s*\\{)|[\\w$]\\s*=\\s*${esc(name)}\\s*[,})]`).test(s)) return true;
  }
  return false;
}
let BASE_INDEX = null;
function baseIndex() {
  if (BASE_INDEX) return BASE_INDEX;
  const byExt = new Map(), bare = [];
  for (const [b, ps] of universe().byBase) {
    const m = /\.([A-Za-z0-9_-]+)$/.exec(b);
    if (!m) { bare.push([b, ps]); continue; }
    if (!byExt.has(m[1])) byExt.set(m[1], []);
    byExt.get(m[1]).push([b, ps]);
  }
  BASE_INDEX = { byExt, bare };
  return BASE_INDEX;
}
/* Every X for which `tokenRe(X)` matches somewhere in s: X ends before an optional `/` and a quote, and starts after a
   quote or a `/`; it holds no quote or newline. */
function quotedTokens(s) {
  const out = new Set();
  const Q = (c) => c === 34 || c === 39 || c === 96;
  for (let q = 0; q < s.length; q++) {
    if (!Q(s.charCodeAt(q))) continue;
    let j = q - 1;
    for (const skip of [false, true]) {
      if (skip) { if (s.charCodeAt(q - 1) !== 47) break; j = q - 2; }
      for (let k = j; k >= 0 && j - k < 400; k--) {
        const c = s.charCodeAt(k);
        if (c === 10) break;
        if (Q(c) || c === 47) { if (k < j) out.add(s.slice(k + 1, j + 1)); if (Q(c)) break; }
      }
    }
  }
  return out;
}
const RUNTIME_PKG = (p) => (p.startsWith("bio-plane/") && !p.slice("bio-plane/".length).includes("/") && PACKAGE_FILES.has(basename(p)));
function runtimeSet() {
  return universe().paths.filter((p) => {
    const r = fullReason(p);
    return r === "the plane" || r === "the plane's shipped build" || r === "code the plane imports" || r === "a fleet member"
      || RUNTIME_PKG(p);
  });
}
const INPUTS_MEMO = new Map();
function inputsOf(unit) {
  if (!INPUTS_MEMO.has(unit.id)) INPUTS_MEMO.set(unit.id, deriveInputs(unit));
  return INPUTS_MEMO.get(unit.id);
}
function deriveInputs(unit) {
  const U = universe();
  const out = new Set();
  const cl = closure(unit);
  /* Runtime code is not read for mentions (§2b) — except a runtime module the unit's OWN file imports directly: the
     suite then holds its values, and a path among them is read by the suite (measured 2026-09-23: `skillpack.test.mjs`
     reads `docs/development/INVESTIGATIVE-SESSION.md` through `src/skillpack.mjs`'s AUTHORED_SOURCES). */
  const direct = new Set(unit.tops.flatMap((t) => edges(t, false).filter(([, how]) => how === "import").map(([p]) => p)));
  for (const f of cl.keys()) {
    const r = repoRel(f);
    if (U.set.has(r)) out.add(r);
    const own = unit.tops.includes(f);
    if (isRuntime(r) && !own && !direct.has(f)) continue;
    for (const p of forwardHits(f, own)) out.add(p);
  }
  /* The IMPORT closure is followed THROUGH runtime code too (§2b stops there for selection): a UI suite importing
     `bio-plane/src/x.mjs` loads everything x imports (measured 2026-09-23: 17 UI suites under-included that way). The
     files are inputs; their text is not read for mentions. */
  const stack = [...cl.keys()].filter((f) => isRuntime(repoRel(f)));
  const seenRt = new Set(stack);
  while (stack.length) {
    const f = stack.pop();
    const r = repoRel(f);
    if (U.set.has(r)) out.add(r);
    for (const [p, how] of edges(f, false)) if (how === "import" && !seenRt.has(p)) { seenRt.add(p); stack.push(p); }
  }
  if (DOC_FACING.has(unit.id)) for (const p of U.under.get("docs") || []) out.add(p);
  if (unit.kind === "plane" || unit.kind === "fleet") for (const p of runtimeSet()) out.add(p);
  /* A UI HARNESS CHECK is a check OVER the UI suites (`check-mock-envelope.mjs` re-runs every one with a probe
     preloaded): a check whose set holds a UI suite's source takes that suite's whole input set (measured 2026-09-23:
     the envelope check read 70 files its own MENTION set missed, every one a UI suite's input). */
  if (unit.kind === "uicheck")
    for (const u of UNITS) if (u.kind === "ui" && out.has(repoRel(u.tops[0]))) for (const p of inputsOf(u)) out.add(p);
  for (const d of declaredReads(unit)) {
    if (d === "*") for (const p of U.paths) out.add(p);
    else if (d.endsWith("/")) for (const p of U.under.get(d.slice(0, -1)) || []) out.add(p);
    else if (U.set.has(d)) out.add(d);
  }
  return out;
}
/* NEVER CACHED (§3a condition 1): a unit whose own source or control carries `GATE: never-cache (<reason>)`, and —
   decided here, §3a naming plancheck alone — a unit that RUNS plancheck (its closure names `tools/plancheck.mjs`): it
   reads what plancheck reads, the whole tree and `origin/coord`, and a verdict resting on a never-cached tool is itself
   never cached. Measured 2026-09-23: the traces of `ledger`, `mergecarry` and `pipeline-readers` read 1,027–1,028 of
   the tree's 1,028 files, through plancheck. */
function neverCacheOf(u) {
  /* At the START of a line (after a comment's `//`, `/*` or ` *`): a marker quoted inside a string — a fixture planting
     one, as `gateresults.test.mjs` does — declares nothing about the file that quotes it. */
  const NEVER_RE = /^[ \t]*(?:\/\/|\/?\*)?[ \t]*GATE: never-cache \(([^)\n]+)\)/m;
  for (const t of u.tops) { const m = NEVER_RE.exec(textOf(t) || ""); if (m) return m[1]; }
  if (closure(u).has(join(REPO, "tools/plancheck.mjs"))) return "runs tools/plancheck.mjs, which is never cached";
  return null;
}
/* A UNIT MAY DECLARE WHAT MENTION CANNOT SEE (M0-126; §3a is silent on how an under-inclusion is fixed, decided here):
   a line `GATE: reads <path> <dir/> …` in its source or control adds each repository path, each directory's every
   file (a trailing `/`), or `*` (the whole repository), to its input set. Over-inclusion costs only a re-run. The
   trace names what to declare; the line is read from the whole text, comments included, because it is a comment. */
const READS_RE = /^[ \t]*(?:\/\/|\/?\*)?[ \t]*GATE: reads (.*)$/gm;     /* line-start, as NEVER_RE, for the same reason */
function declaredReads(unit) {
  const out = [];
  for (const t of unit.tops) for (const m of (textOf(t) || "").matchAll(READS_RE)) {
    for (const raw of m[1].replace(/\*\/.*$/, "").trim().split(/\s+/)) {
      if (raw.startsWith("(")) break;                        /* the reason, in parentheses, ends the list */
      const tok = raw.replace(/^`|[`,;]+$/g, "");
      if (tok) out.push(tok);
    }
  }
  return out;
}

/* `--inputs <unit>` prints one unit's input set and whether it is never cached, then stops — the instrument for an
   UNDER-INCLUSION a gate named. `--inputs all` prints every unit's as JSON (the census M0-126 measured with). */
const INPUTS_AT = ARGV.indexOf("--inputs");
if (INPUTS_AT >= 0) {
  const want = ARGV[INPUTS_AT + 1] || "all";
  if (want === "all") {
    const o = {};
    for (const u of UNITS) o[u.id] = { never: neverCacheOf(u), inputs: [...inputsOf(u)].sort() };
    console.log(JSON.stringify(o));
  } else {
    const u = UNITS.find((x) => x.id === want);
    if (!u) { console.log(`gates: no unit ${want} (units are plane:<suite>, fleet:<member>/<suite>, ui:<suite>, uicheck:<check>, coverage)`); process.exit(2); }
    const inp = [...inputsOf(u)].sort();
    console.log(`gates: ${u.id} — ${inp.length} input(s)${neverCacheOf(u) ? `; NEVER-CACHED (${neverCacheOf(u)})` : ""}`);
    for (const p of inp) console.log(`  ${p}`);
  }
  process.exit(0);
}
if (SINCE && !FORCE_FULL) {
  const fallback = (reason) => { sinceNote = `--since ${SINCE} cannot narrow — ${reason}; the ordinary classification runs instead`; };
  const oldCommit = tryGit(["rev-parse", "--verify", "--quiet", `${SINCE}^{commit}`]);
  const oldTree = oldCommit ? tryGit(["rev-parse", "--verify", "--quiet", `${oldCommit}^{tree}`]) : null;
  if (!oldCommit || !oldTree) fallback(`it does not name a commit`);
  else if (!CLEAN_AT_START) fallback(`the working tree is not clean, and --since re-checks a COMMITTED tree`);
  else {
    const rec = readRuns({ repo: REPO, tree: oldTree });
    const eff = effectiveVerdict(rec.runs);
    /* The base this branch stands on now, and the base the measured commit stood on: the second is
       taken against the FIRST, never against HEAD — for a commit added on top of the measured one,
       merge-base(<rev>, HEAD) is <rev> itself and would read the branch's own change as upstream's. */
    const newBase = tryGit(["merge-base", "HEAD", "origin/main"]);
    const oldBase = newBase ? tryGit(["merge-base", oldCommit, newBase]) : null;
    if (eff.verdict !== "GREEN")
      fallback(eff.verdict === "RED" ? `the tree ${short(oldTree)} of ${SINCE} is recorded RED`
        : eff.verdict === "NOT MEASURED" ? `the tree ${short(oldTree)} of ${SINCE} is recorded NOT MEASURED — a budget`
          + ` expired, so ${eff.unmeasured.length} unit(s) were never measured, and a tree nobody measured licenses no --since (M0-107)`
        : `no verdict is recorded for the tree ${short(oldTree)} of ${SINCE}`
          + `${rec.unreadable.length ? ` (${rec.unreadable.length} record file(s) unreadable)` : ""}`);
    else if (!newBase) fallback("no merge-base with origin/main, so the other side cannot be told from yours");
    else if (!oldBase) fallback(`${SINCE} shares no history with origin/main`);
    else {
      /* THE TWO SIDES. Yours is what the measured branch changed and what this branch changes now;
         the other side is what `origin/main` changed between the two bases — gated where it landed.
         Anything else that differs from the measured tree was made HERE after the measurement (a
         commit on top, a fix made while rebasing), nobody has measured it, and it is re-checked as
         TARGETED would check it — NEVER assumed measured. Reading every difference as "the other
         side" is the unsound shape: a commit added after the gate would re-run nothing. */
      const mineThen = listDiff([oldBase, oldCommit]);
      const mineNow = listDiff([newBase, "HEAD"]);
      const upstream = listDiff([oldBase, newBase]);
      const differ = listDiff([oldCommit, "HEAD"]);
      if ([mineThen, mineNow, upstream, differ].includes(null)) fallback("a git read failed");
      else {
        const mine = [...new Set([...mineThen, ...mineNow])];
        const explained = new Set(upstream);
        const fresh = differ.filter((p) => !explained.has(p));
        const recordedClass = (eff.last && eff.last.class) || "?";
        sinceInfo = { commit: oldCommit, tree: oldTree, recordedClass, mine: mine.length, upstream: upstream.length, fresh: fresh.length };
        const head = `re-checking ${short(oldCommit)} (tree ${short(oldTree)}, recorded GREEN, class ${recordedClass}): `
          + `${mine.length} path(s) on your side, ${upstream.length} on the other, ${fresh.length} changed since the gate`;
        /* A FULL-class path is RUNTIME, and which units read the runtime is exactly what MENTION
           cannot see — so a side carrying one is taken to be read by EVERY unit, and the pairing
           reduces to the readers of the OTHER side. Both sides carrying one is FULL. This is what
           makes `--since` useful to an integration batch: a plane merge gated FULL once, rebased
           over docs, re-runs the readers of those docs, not the battery. */
        const freshFull = fresh.find((p) => fullReason(p));
        const mineFull = mine.find((p) => fullReason(p));
        const upFull = upstream.find((p) => fullReason(p));
        if (freshFull) {
          cls = "FULL";
          why = `--since ${SINCE}: a change made after the gate touches ${fullReason(freshFull)} (${freshFull}), and nobody measured it`;
        } else if (mineFull && upFull) {
          cls = "FULL";
          why = `--since ${SINCE}: BOTH sides touch runtime (${mineFull}; ${upFull}), and every unit may read both`;
        } else {
          cls = "SINCE";
          let pairing;
          const theirs = { docs: "cap" }, yours = { docs: "fine" };
          if (mineFull) pairing = readersOf(upstream, UNITS, theirs);
          else if (upFull) pairing = readersOf(mine, UNITS, yours);
          else {
            const mineReaders = readersOf(mine, UNITS, yours);
            const upReaders = readersOf(upstream, [...mineReaders.values()].map((v) => v.unit), theirs);
            pairing = new Map();
            for (const [id, v] of mineReaders) {
              const w = upReaders.get(id);
              if (w) pairing.set(id, { unit: v.unit, why: `${v.why} · AND ${w.why}` });
            }
          }
          selection = pairing;
          for (const [id, v] of fresh.length ? targetedSelection(fresh) : new Map())
            if (!selection.has(id)) selection.set(id, { unit: v.unit, why: `changed since the gate — ${v.why}` });
          why = `${head}; ${mineFull ? `your side touches ${fullReason(mineFull)} (${mineFull}), which every unit may read, so the units reading the other side`
            : upFull ? `the other side moved ${fullReason(upFull)} (${upFull}), which every unit may read, so the units reading your side`
            : "the units reading BOTH sides"} re-run${fresh.length ? ", with every reader of what changed since the gate" : ""}`;
        }
      }
    }
  }
}
if (cls === "TARGETED") selection = targetedSelection([...changed]);

/* ---- 2d · READ THIS TREE'S OWN RECORD FIRST (BOB #29, 2026-09-23) --------
   Bob: "every lane that experienced the bug then went and ran ALL suites even though they'd just passed
   those suites without making any further changes." MEASURED: this file read a record only under
   `--since`, and `--since` refuses a RED base, so the one road back from a RED on an UNCHANGED tree was the
   whole battery again. But the record (D-293, keyed by the TREE) already says what that tree needs:
     - effectively GREEN, by a run of this class or wider  -> nothing to run; say so and stop;
     - effectively RED, every open unit a named unit        -> RERUN: exactly those units, and plancheck.
   `pushguard.mjs` `effectiveVerdict` is the one reader: a failing step opens its units (since this change,
   only the suites the battery NAMES as failed), a passing step closes what it covers — so a RERUN that
   passes turns the tree GREEN with no suite that already passed on it run twice. A wildcard left open
   (a leak, a shared log, a step that named nothing) or no record of this class is not narrowed. `--full`
   and `--since` are never overridden. */
/* M0-126: FULLREUSE is a FULL selection some of whose units were REUSED from `gate-results` rather than run. It covers
   what FULL covers for this shortcut, and never licenses what only a run of everything does (effectiveVerdict's
   clear-all, the train's `--full` reuse, a release's GREEN FULL). `--no-reuse` is never answered from a record. */
const CLASS_RANK = (c) => (c === "FULL" || c === "FULLREUSE" ? 2 : 1);
const PER_UNIT_ON = !RESULTS_OFF && isFile(join(REPO, "tools/gateresults.mjs"));
if (CLEAN_AT_START && !FORCE_FULL && !NO_REUSE && SINCE === null) {
  const own = readRuns({ repo: REPO, tree: START.tree });
  const eff = effectiveVerdict(own.runs);
  const covering = own.runs.some((r) => CLASS_RANK(r.class) >= CLASS_RANK(cls));
  const known = new Map(UNITS.map((u) => [u.id, u]));
  /* BOB #30 (§3a condition 1): a REUSED record must still run the never-cached units, so with the per-unit record on,
     this tree-keyed shortcut is not taken: the per-unit reuse (§3b) answers every cacheable unit from `gate-results`
     and the never-cached ones run. Without it (BIO_GATE_RESULTS=off, or no `tools/gateresults.mjs`) it stands as before. */
  if (covering && eff.verdict === "GREEN" && PER_UNIT_ON)
    console.log(`gates: the tree ${short(START.tree)} is already recorded GREEN, but a record never answers for a never-cached`
      + " unit (BOB #30): the per-unit record answers the rest, and those run.");
  if (covering && eff.verdict === "GREEN" && !PER_UNIT_ON) {
    const by = own.runs.filter((r) => CLASS_RANK(r.class) >= CLASS_RANK(cls)).pop();
    console.log(`gates: the tree ${short(START.tree)} is already recorded GREEN (by a ${by.class} run)`
      + ` — nothing changed since, so nothing is re-run. \`--full\` forces a run.`);
    if (EXPLAIN) process.exit(0);
    /* THE ANSWER IS STILL RECORDED. A caller reads its verdict from the run it just caused (train.mjs `gate()`
       takes the runs added since it called), so an exit 0 that wrote nothing read to it as UNDETERMINED — found by
       train.test's --isolate arm on this change's first gate. A REUSED run names the record it relied on and has NO
       steps, so `effectiveVerdict` is unmoved by it: it opens nothing and, not being FULL, clears nothing. */
    let w;
    try {
      w = appendRun({ repo: REPO, run: { tree: START.tree, verdict: "GREEN", class: "REUSED", why: `already GREEN by ${by.file}`,
        head: START.head, base: base || null, at: new Date().toISOString(), worktree: REPO, reusedFrom: by.file, steps: [] } });
    } catch (e) { w = { ok: false, reason: e.message }; }
    console.log(w.ok ? `gates: RECORDED GREEN (REUSED) for tree ${short(START.tree)} — ${w.path}` : `gates: NOT RECORDED — ${w.reason}`);
    process.exit(0);
  }
  if (covering && eff.verdict === "RED" && eff.open.length
      && eff.open.every((u) => u === "plancheck" || known.has(u))) {
    const openUnits = eff.open.filter((u) => u !== "plancheck").map((u) => known.get(u));
    cls = "RERUN";
    why = `the tree ${short(START.tree)} is recorded RED at ${eff.open.length} unit(s) (${eff.open.join(", ")}); every other unit`
      + " passed on this same tree, so only those are re-run";
    selection = new Map(openUnits.map((u) => [u.id, { unit: u, why: "recorded RED on this tree" }]));
    /* BOB #30: a re-run of what failed REUSES everything else on this tree's record, so the never-cached units — whose
       verdicts read what no record could see (history, live refs, the clock) — run too. */
    if (PER_UNIT_ON)
      for (const u of UNITS) if (!selection.has(u.id) && neverCacheOf(u))
        selection.set(u.id, { unit: u, why: `never cached (${neverCacheOf(u)}): a record never answers for it` });
  }
}

/* ---- 3 · the plan ------------------------------------------------------- */
/* The battery's own filter rule, mirrored so the RECORD names what the battery actually ran:
   `scripts/battery.mjs` keeps a plane suite whose FILE NAME includes a filter and a fleet suite
   whose `<member>/<file>` label does. Filters are FULL file names, never stems — a stem ran
   suites nobody selected (39 derived doc-facing suites ran as 41, measured 2026-09-21). */
const batteryRuns = (filters) => UNITS.filter((u) => (u.kind === "plane" || u.kind === "fleet")
  && filters.some((x) => u.filter.includes(x))).map((u) => u.id);

const STEPS = [];
const plancheckStep = { label: "plancheck --local", units: ["plancheck"], cmd: "node", args: ["tools/plancheck.mjs", "--local"] };
if (cls === "FULL") {
  STEPS.push({ label: "battery (all)", units: ["plane:*", "fleet:*"], cmd: "npm", args: ["run", "test:battery"], cwd: join(REPO, "bio-plane") });
  STEPS.push({ label: "coverage --strict", units: ["coverage"], cmd: "node", args: ["scripts/coverage.mjs", "--strict"], cwd: join(REPO, "bio-plane") });
  STEPS.push({ label: "civicos-ui (all)", units: ["ui:*"], cmd: "node", args: ["civicos-ui/test/run.mjs"] });
} else if (cls === "DOCS") {
  if (planeDoc.length)
    STEPS.push({ label: "battery (doc-facing)", units: batteryRuns(planeDoc), cmd: "node", args: ["scripts/battery.mjs", ...planeDoc], cwd: join(REPO, "bio-plane"), names: planeDoc });
  for (const f of uiDoc)
    STEPS.push({ label: `ui (doc-facing) ${f}`, units: [`ui:${f}`], cmd: "node", args: [join("civicos-ui/test", f)] });
} else {
  const picked = [...selection.values()].map((v) => v.unit);
  const suites = picked.filter((u) => u.kind === "plane" || u.kind === "fleet").map((u) => u.filter);
  if (suites.length)
    STEPS.push({ label: `battery (${cls === "SINCE" ? "both sides" : cls === "RERUN" ? "re-run: recorded RED" : "selected"})`, units: batteryRuns(suites), cmd: "node", args: ["scripts/battery.mjs", ...suites], cwd: join(REPO, "bio-plane"), names: suites });
  if (picked.some((u) => u.kind === "coverage"))
    STEPS.push({ label: "coverage --strict", units: ["coverage"], cmd: "node", args: ["scripts/coverage.mjs", "--strict"], cwd: join(REPO, "bio-plane") });
  for (const u of picked.filter((x) => x.kind === "ui"))
    STEPS.push({ label: `ui ${u.name}`, units: [u.id], cmd: "node", args: [join("civicos-ui/test", u.name)] });
  for (const u of picked.filter((x) => x.kind === "uicheck"))
    STEPS.push({ label: `ui check ${u.name}`, units: [u.id], cmd: "node", args: [join("civicos-ui", u.name)] });
}
/* ---- 3b · M0-126: THE PER-UNIT RESULT RECORD (TREE-SHARING.md §3a) -------------------------------------------
   Every unit the plan would run gets a KEY — sha256 of its input set's blobs (2e), node's major and every lockfile
   (`tools/gateresults.mjs`). A unit whose key already holds a PASS on `gate-results` (and no revocation) is NOT run
   and is printed REUSED, naming the record; every other unit runs as planned. A unit carrying `GATE: never-cache
   (<reason>)` in its source or control gets no key and always runs; plancheck is never cached. What runs is TRACED
   (`tools/gatetrace.mjs`): a file read outside the unit's input set FAILS the unit by name (condition 2). Each unit
   that passed, traced clean, on a tree clean from start to end, gets a PASS record (4b). A FULL selection runs the UI
   harness unit by unit here, so each suite and check has a result of its own. */
const byId = new Map(UNITS.map((u) => [u.id, u]));
const expandUnits = (ids) => [...new Set(ids.flatMap((id) =>
  id === "plane:*" ? UNITS.filter((u) => u.kind === "plane").map((u) => u.id)
    : id === "fleet:*" ? UNITS.filter((u) => u.kind === "fleet").map((u) => u.id)
      : id === "ui:*" ? UNITS.filter((u) => u.kind === "ui" || u.kind === "uicheck").map((u) => u.id)
        : [id]))].filter((id) => byId.has(id));
const neverCache = neverCacheOf;
const uiStep = (u) => (u.kind === "ui"
  ? { label: `ui ${u.name}`, units: [u.id], cmd: "node", args: [join("civicos-ui/test", u.name)] }
  : { label: `ui check ${u.name}`, units: [u.id], cmd: "node", args: [join("civicos-ui", u.name)] });
let GR = null;
let grWhy = RESULTS_OFF ? "BIO_GATE_RESULTS=off" : "";
if (!RESULTS_OFF) {
  try { GR = await import("./gateresults.mjs"); } catch (e) { grWhy = `tools/gateresults.mjs did not load (${String(e.message).split("\n")[0]})`; }
}
const TRACER = join(REPO, "tools/gatetrace.mjs");
const KEYS = new Map();          /* unit id -> { hash, inputs } | { never } */
const REUSED = new Map();        /* unit id -> { path, record } */
const RESULT_NOTES = [];
let grFetch = null;
let keyMs = 0;
if (GR) {
  if (cls === "FULL") {
    const at = STEPS.findIndex((s) => s.units.includes("ui:*"));
    if (at >= 0) STEPS.splice(at, 1, ...UNITS.filter((u) => u.kind === "ui").map(uiStep), ...UNITS.filter((u) => u.kind === "uicheck").map(uiStep));
  }
  const t0 = Date.now();
  try {
    const U = universe();
    const blobs = GR.blobsOf({ repo: REPO, paths: U.paths });
    const runtime = GR.runtimeOf({ paths: U.paths, blobs });
    for (const id of expandUnits(STEPS.flatMap((s) => s.units))) {
      const u = byId.get(id);
      const never = neverCache(u);
      if (never) { KEYS.set(id, { never }); continue; }
      const inputs = inputsOf(u);
      KEYS.set(id, { hash: GR.inputHash({ unit: id, inputs, blobs, runtime }), inputs });
    }
  } catch (e) { grWhy = `the unit keys could not be computed (${e.message})`; KEYS.clear(); }
  keyMs = Date.now() - t0;
  if (KEYS.size && !NO_REUSE) {
    grFetch = GR.fetchResults({ repo: REPO });
    if (!grFetch.ok) RESULT_NOTES.push(`gate-results could not be fetched from ${GR.resultsRemote()} (${grFetch.reason}) — nothing reused`);
    else if (grFetch.absent) RESULT_NOTES.push(`${GR.resultsRemote()} holds no gate-results branch yet — nothing to reuse; this run's first PASS creates it`);
    else {
      const found = GR.lookup({ repo: REPO, tip: grFetch.tip, keys: [...KEYS].filter(([, k]) => k.hash).map(([id, k]) => [id, k.hash]) });
      for (const [id, f] of found) {
        if (f.state === "PASS") REUSED.set(id, { path: f.path, record: f.record });
        else if (f.state === "REVOKED") RESULT_NOTES.push(`${id}: key ${KEYS.get(id).hash.slice(0, 12)} is REVOKED (${(f.revoked && f.revoked.reason) || "no reason given"})`
          + `${f.record ? ` — its PASS was written by clone ${f.record.clone || "?"}, session ${f.record.session || "UNDETERMINED"}, run ${f.record.run || "?"}` : ""}; it runs`);
        else if (f.state === "UNREADABLE") RESULT_NOTES.push(`${id}: the record ${f.path} is UNREADABLE (not a PASS for this unit and key) — it runs`);
      }
    }
  }
  if (REUSED.size) {
    const next = [];
    for (const s of STEPS) {
      if (s.units.includes("plancheck")) { next.push(s); continue; }
      const ids = expandUnits(s.units);
      const left = ids.filter((id) => !REUSED.has(id));
      if (left.length === ids.length) next.push(s);
      else if (!left.length) continue;
      else {
        /* Only a battery step holds more than one unit: it runs the units left, by name. */
        const names = left.map((id) => byId.get(id).filter);
        next.push({ label: "battery (not reused)", units: batteryRuns(names), cmd: "node", args: ["scripts/battery.mjs", ...names], cwd: join(REPO, "bio-plane"), names });
      }
    }
    STEPS.splice(0, STEPS.length, ...next);
  }
}

/* --local skips the publication checks: gates runs MID-TURN, before commit+push,
   and a dirty planning surface is the expected state then. The bare plancheck is
   still owed AFTER the push — it is the handoff gate, not this one. */
STEPS.push(plancheckStep);

if (sinceNote) console.log(`gates: ${sinceNote}`);
console.log(`gates: change class ${cls} — ${why}`);
if (cls === "DOCS")
  console.log(`gates: doc-facing suites derived fresh — plane [${planeDoc.join(", ")}] · ui [${uiDoc.join(", ")}]`);
if (cls === "TARGETED" || cls === "SINCE" || cls === "RERUN") {
  console.log(`gates: FULL is derived too — plane imports from outside bio-plane/: [${planeForeign.roots.join(", ")}]`
    + `${planeForeign.files.length ? ` + [${planeForeign.files.join(", ")}]` : ""} · fleet: [${FLEET.map((m) => m.dir).join(", ")}]`);
  console.log(`gates: ${cls} selection derived fresh — ${selection.size} unit(s) of ${UNITS.length} ${cls === "SINCE" ? "read a path changed on BOTH sides" : "import, spawn or mention a changed path"}:`);
  for (const { unit, why: w } of selection.values()) console.log(`gates:   ${unit.id}  <- ${w}`);
  console.log("gates: REACH — a unit's source and control, the tools/scripts it names and their relative imports, all "
    + `read as code${stripComments ? ", comments blanked (strings kept)" : " — THE LEXER DID NOT LOAD, so comments count too (over-selection)"}; `
    + "not the plane's runtime code, and not a path assembled at run time from pieces none of which is its name, stem or directory.");
}
if (!GR) console.log(`gates: results (M0-126) — OFF: ${grWhy}; every selected unit runs and no per-unit record is read or written`);
else {
  const never = [...KEYS].filter(([, k]) => k.never);
  console.log(`gates: results (M0-126) — ${KEYS.size} unit(s) keyed in ${keyMs} ms; ${NO_REUSE ? "--no-reuse: NOTHING reused (the backstop)"
    : `${REUSED.size} REUSED from gate-results${grFetch && grFetch.tip ? ` @ ${short(grFetch.tip)}` : ""}`}; ${never.length} never-cached`
    + `${isFile(TRACER) ? "" : "; THE TRACER (tools/gatetrace.mjs) IS ABSENT, so condition 2 cannot be checked and NO PASS will be written"}`);
  for (const n of RESULT_NOTES) console.log(`gates:   ${n}`);
  for (const [id, k] of never) console.log(`gates:   NEVER-CACHED ${id}  <- GATE: never-cache (${k.never})`);
  for (const [id, r] of REUSED) console.log(`gates:   REUSED ${id}  <- ${r.path} (PASS on tree ${short(r.record.tree)}, `
    + `clone ${r.record.clone || "?"}, ${r.record.at || "?"})`);
  /* --explain names every key: the name a record, a revocation (`tools/gateresults.mjs revoke`) and a diagnosis use. */
  if (EXPLAIN) for (const [id, k] of KEYS) if (k.hash) console.log(`gates:   KEY ${id} ${k.hash}`);
}
const planLabel = (s) => (s.names ? `${s.label.split(" (")[0]} [${s.names.join(", ")}]` : s.label);
console.log(`gates: plan — ${STEPS.map(planLabel).join(" · ")}`);
console.log(CLEAN_AT_START
  ? `gates: record — the tree ${short(START.tree)} is CLEAN, so this run's verdict ${EXPLAIN ? "would be" : "will be"} recorded under the git common dir (D-293)`
  : `gates: record — the tree is NOT clean (${START.status === null ? "status unreadable" : `${START.status.split("\n").filter(Boolean).length} path(s)`}), so this run's verdict will NOT be recorded (D-293)`);

if (EXPLAIN) process.exit(0);

/* M0-107 (BOB #28): each step is handed a verdict file of its own. A battery writes its verdict there; a step
   reads as TIMED OUT only when it exits 124 AND that file names at least one NOT MEASURED suite — so no other
   tool's 124 (and no battery that merely exited 124 without saying why) can pass for an expired budget. */
const VERDICT_DIR = mkdtempSync(join(tmpdir(), "bio-gates-verdict-"));
const results = [];
/* M0-126: THE TRACE. A step that runs keyed units is run with the tracer preloaded; a battery step maps each suite's top
   file to its unit, a single-unit step names its unit. `passedUnits` collects the units a PASS may be written for. */
const TRACING = !!GR && KEYS.size > 0 && isFile(TRACER);
const passedUnits = new Set();
const underIncluded = new Map();   /* unit id -> [paths read outside its key] */
const untraced = new Set();
let topsFile = null;
if (TRACING) {
  const tops = {};
  for (const u of UNITS) if (u.kind === "plane" || u.kind === "fleet") tops[u.tops[0]] = u.id;
  topsFile = join(VERDICT_DIR, "tops.json");
  writeFileSync(topsFile, JSON.stringify(tops));
}
function readTraces(dir) {
  const out = new Map();
  let names = [];
  try { names = readdirSync(dir); } catch { return out; }
  for (const n of names) {
    let j = null;
    try { j = JSON.parse(readFileSync(join(dir, n), "utf8")); } catch { continue; }
    if (!j || !j.unit || !Array.isArray(j.reads)) continue;
    if (!out.has(j.unit)) { out.set(j.unit, new Set()); HISTORY.set(j.unit, HISTORY.get(j.unit) || new Set()); }
    for (const p of j.reads) out.get(j.unit).add(p);
    for (const h of j.history || []) HISTORY.get(j.unit).add(h);
  }
  return out;
}
const HISTORY = new Map();          /* unit id -> git history / live-ref reads in THIS checkout (the tracer's `history`) */
const historyRead = new Map();      /* keyed unit id -> those reads: it FAILS (BOB #30, §3a condition 1) */
STEPS.forEach((s, i) => {
  console.log(`\n=== gates · ${s.label}: ${s.cmd} ${s.args.join(" ")}`);
  const vf = join(VERDICT_DIR, `step-${i}.json`);
  const ran = s.units.includes("plancheck") ? [] : expandUnits(s.units);
  const keyed = ran.filter((id) => KEYS.get(id) && KEYS.get(id).hash);
  const traceDir = TRACING && keyed.length ? mkdtempSync(join(VERDICT_DIR, `trace-${i}-`)) : null;
  const isBattery = !!s.names || s.units.some((u) => u === "plane:*" || u === "fleet:*") || /battery/.test(s.label);
  const env = { ...process.env, BIO_BATTERY_VERDICT: vf };
  if (traceDir) {
    Object.assign(env, { BIO_GATE_TRACE_DIR: traceDir, BIO_GATE_TRACE_REPO: REPO,
      /* A gate run INSIDE a traced unit (a suite driving a fixture's gate) drops the outer tracer: one trace per step. */
      NODE_OPTIONS: `${String(process.env.NODE_OPTIONS || "").split(/\s+/).filter((o) => o && !/gatetrace\.mjs$/.test(o)).join(" ")} --import=${pathToFileURL(TRACER).href}`.trim() });
    delete env.BIO_GATE_TRACE_UNIT;
    /* A BATTERY step — even one running a single suite — is traced through the tops map, so the runner is nobody's
       read; only a step that IS its unit (a UI suite, a UI check, coverage) names it outright. Found by the one-reused
       backstop arm: a one-suite TARGETED battery step named its unit for the whole step, and the suite "read"
       `scripts/battery.mjs` — an UNDER-INCLUSION that was the runner's, not the suite's. */
    if (!isBattery && ran.length === 1) env.BIO_GATE_TRACE_UNIT = ran[0];
    else env.BIO_GATE_TRACE_TOPS = topsFile;
  }
  const r = spawnSync(s.cmd, s.args, { cwd: s.cwd ?? REPO, stdio: "inherit", env });
  let v = null;
  try { v = JSON.parse(readFileSync(vf, "utf8")); } catch { /* no verdict file: this step is not a battery, or it died */ }
  const unmeasured = v && v.verdict === "NOT MEASURED" && Array.isArray(v.notMeasured)
    ? v.notMeasured.map((x) => x && x.unit).filter(Boolean) : [];
  const timedOut = r.status === 124 && unmeasured.length > 0;
  /* BOB #29: a battery that went RED NAMES its failed suites; record them, so a re-run of those alone clears the
     tree (2d). Not when the finding is the run's, not a suite's — a leak or a shared log keeps the whole step open. */
  const failedUnits = r.status !== 0 && !timedOut && v && v.verdict === "RED" && Array.isArray(v.failed)
    && v.failed.length && !v.leaking && !v.sharedLog ? v.failed.filter((u) => typeof u === "string" && u) : [];
  let ok = r.status === 0;
  /* M0-126: which units PASSED here. A battery says so in its verdict file (`passed`), never when the run's own finding
     (a leak, a shared log) stands; a single-unit step passed when it exited 0. */
  const passedHere = !isBattery && ran.length === 1 ? (r.status === 0 ? ran : [])
    : v && Array.isArray(v.passed) && !v.leaking && !v.sharedLog ? v.passed.filter((id) => ran.includes(id)) : [];
  if (traceDir) {
    /* CONDITION 2: a file read outside the unit's key FAILS the unit by name. Only paths of the repository as it stood
       when the gate began are judged — a file a suite creates is not an input. */
    const traces = readTraces(traceDir);
    const U = universe();
    for (const id of keyed) {
      const t = traces.get(id);
      if (!t) { untraced.add(id); continue; }
      const miss = [...t].filter((p) => U.set.has(p) && !KEYS.get(id).inputs.has(p)).sort();
      if (miss.length) underIncluded.set(id, miss);
      /* BOB #30: git HISTORY or a LIVE REF read in this checkout is outside every key — the unit must be never-cached. */
      const h = [...(HISTORY.get(id) || [])];
      if (h.length) { historyRead.set(id, h); if (!underIncluded.has(id)) underIncluded.set(id, []); }
    }
  }
  for (const id of ran.filter((x) => historyRead.has(x))) {
    const h = historyRead.get(id);
    console.log(`gates: HISTORY READ (M0-126 condition 1, BOB #30) — ${id} ran ${h.length} git command(s) over this checkout's `
      + `history or a live ref (${h.slice(0, 4).join("; ")}${h.length > 4 ? " …" : ""}), which no key can cover. It FAILS and no PASS `
      + "is written; mark it `GATE: never-cache (history)` in its source.");
  }
  const under = ran.filter((id) => underIncluded.has(id));
  for (const id of under) {
    const miss = underIncluded.get(id);
    if (!miss.length) continue;                     /* a history read alone, said above */
    console.log(`gates: UNDER-INCLUSION (M0-126 condition 2) — ${id} read ${miss.length} file(s) its key does not cover: `
      + `${miss.slice(0, 12).join(", ")}${miss.length > 12 ? ` (+${miss.length - 12} more)` : ""}. It FAILS and no PASS is written; `
      + "declare them (`GATE: reads <path> <dir/>` in its source) or widen the derivation in tools/gates.mjs §2e.");
  }
  let fu = failedUnits;
  if (under.length) {
    if (ok) fu = under;
    else if (failedUnits.length) fu = [...new Set([...failedUnits, ...under])];
    ok = false;
  }
  for (const id of passedHere) if (!under.includes(id) && !timedOut) passedUnits.add(id);
  results.push({ label: s.label, units: s.units, ok, ...(timedOut ? { timedOut: true, unmeasured } : {}),
    ...(fu.length ? { failedUnits: fu } : {}) });
});
if (REUSED.size)
  results.push({ label: "reused (gate-results, M0-126)", units: [...REUSED.keys()], ok: true, reused: true,
    records: [...REUSED.values()].map((x) => x.path) });
if (cls === "FULL" && REUSED.size) cls = "FULLREUSE";
try { rmSync(VERDICT_DIR, { recursive: true, force: true }); } catch { /* the OS temp sweep */ }
const red = results.some((r) => !r.ok && !r.timedOut);
const notMeasured = !red && results.some((r) => r.timedOut);
const green = !red && !notMeasured;
const VERDICT = red ? "RED" : notMeasured ? "NOT MEASURED" : "GREEN";

console.log(`\ngates: ${VERDICT} · class ${cls}`);
if (notMeasured) {
  for (const r of results.filter((x) => x.timedOut))
    console.log(`gates:   ${r.label} — a budget EXPIRED in ${r.unmeasured.length} suite(s): ${r.unmeasured.join(", ")} — NOT MEASURED (M0-107)`);
  console.log("gates: an expired budget measured NOTHING: not RED, so the push is not refused; not GREEN, so it licenses no"
    + " --since. Re-run the named suites (or the gate) on a quieter machine to measure them.");
}

/* ---- 4 · the record (D-293) ------------------------------------------- */
{
  const endTree = treeNow();
  const endStatus = statusNow();
  if (!CLEAN_AT_START) {
    console.log(`gates: NOT RECORDED — the tree was not clean when the run began; a verdict binds only a clean tree (D-293)`);
  } else if (endStatus !== "" || endTree !== START.tree) {
    console.log(`gates: NOT RECORDED — the tree changed while the gate ran (`
      + `${endTree !== START.tree ? `HEAD's tree ${short(START.tree)} -> ${short(endTree)}` : `${String(endStatus || "").split("\n").filter(Boolean).length} path(s) dirty at the end`}`
      + `), so this run measured a tree that never existed (D-293)`);
  } else {
    let w;
    try {
      w = appendRun({ repo: REPO, run: {
        tree: START.tree, verdict: VERDICT, class: cls, why, head: START.head, base: base || null,
        at: new Date().toISOString(), worktree: REPO, since: sinceInfo,
        /* BOB #30 (2026-09-23, TREE-SHARING §3a condition 3): a release cut may rely on a GREEN FULL whole-tree record ONLY
           when its run REUSED NOTHING and used no `--since`. This run says so itself; pushguard's `isBackstop` reads it. A
           run that reused even ONE unit is FULLREUSE and never a backstop. */
        backstop: cls === "FULL" && REUSED.size === 0 && SINCE === null,
        steps: results.map(({ label, units, ok, timedOut, unmeasured, failedUnits, reused, records }) =>
          ({ label, units, ok, ...(timedOut ? { timedOut, unmeasured } : {}), ...(failedUnits ? { failedUnits } : {}),
             ...(reused ? { reused, records } : {}) })),
      } });
    } catch (e) { w = { ok: false, reason: `the record could not be written (${e.message})` }; }
    console.log(w.ok
      ? `gates: RECORDED ${VERDICT} for tree ${short(START.tree)} (class ${cls}) — ${w.path}; the push guard reads it (D-293)`
      : `gates: NOT RECORDED — ${w.reason}`);
    if (w.ok) console.log(cls === "FULL" && REUSED.size === 0 && SINCE === null
      ? "gates: BACKSTOP — a FULL run that reused nothing and used no --since: a release cut may rely on this record (§3a)"
      : `gates: NOT A BACKSTOP — ${REUSED.size ? `${REUSED.size} unit(s) REUSED` : SINCE !== null ? "--since" : `class ${cls}`}: no release cut relies on this record (§3a)`);
    /* ---- 4b · M0-126: the PASS records, one per unit that passed, traced clean, with a key ---------------------- */
    if (GR && KEYS.size) {
      const clone = `${hostname()}:${tryGit(["rev-parse", "--path-format=absolute", "--git-common-dir"]) || "?"}`;
      const session = process.env.CLAUDE_CODE_SESSION_ID || process.env.CLAUDE_SESSION_ID || process.env.BIO_SESSION || null;
      const files = [];
      const noTrace = !isFile(TRACER);
      for (const id of passedUnits) {
        const k = KEYS.get(id);
        if (!k || !k.hash || noTrace || untraced.has(id) || underIncluded.has(id)) continue;
        files.push({ path: GR.resultPath(id, k.hash), body: `${JSON.stringify({ unit: id, inputHash: k.hash, verdict: "PASS",
          run: w.ok ? basename(w.path) : null, tree: START.tree, head: START.head, gateVersion: GR.GATE_VERSION,
          keyVersion: GR.KEY_VERSION, class: cls, inputs: k.inputs.size, node: process.versions.node, clone,
          session, at: new Date().toISOString() }, null, 1)}\n` });
      }
      if (untraced.size) console.log(`gates: results (M0-126) — ${untraced.size} unit(s) left NO trace (killed, or a child that dropped NODE_OPTIONS), so no PASS is written for them: ${[...untraced].slice(0, 8).join(", ")}${untraced.size > 8 ? " …" : ""}`);
      if (noTrace) console.log("gates: results (M0-126) — NOT WRITTEN: the tracer is absent, so condition 2 was not checked");
      else if (!files.length) console.log("gates: results (M0-126) — no new PASS to write");
      else {
        const a = GR.appendRecords({ repo: REPO, files,
          message: `gate-results: ${files.length} PASS · tree ${short(START.tree)} · class ${cls}${session ? ` · session ${session}` : ""}` });
        console.log(a.status === "pushed" || a.status === "pushed-unverified" || a.status === "unchanged"
          ? `gates: results (M0-126) — WROTE ${a.added || 0} PASS record(s) to ${GR.resultsRemote()}/gate-results`
            + `${a.skipped ? ` (${a.skipped} already held)` : ""}${a.created ? " — the branch was CREATED by this write" : ""}`
            + `${a.commit ? ` @ ${short(a.commit)}` : ""}${a.status === "pushed-unverified" ? " — the remote did NOT read back that commit" : ""}`
          : `gates: results (M0-126) — NOT WRITTEN: ${a.reason}`);
      }
    }
  }
}
if (green) console.log("gates: after you push, run `node tools/plancheck.mjs` bare — the publication half runs there.");
process.exit(green ? 0 : notMeasured ? 124 : 1);
