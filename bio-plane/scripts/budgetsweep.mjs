#!/usr/bin/env node
/* budgetsweep.mjs — M0-107's SWEEP: every budget site in the gate, with its outcome check.
 *
 * THE ROW'S ACCEPTS-WHEN, first half: *"a sweep names every `timeout:` and budget site with its outcome
 * check."* A budget whose expiry is read as a FINDING is a false RED waiting for a loaded machine (M0-103,
 * DIST #4's 0.71.0 gate); BOB #28 ruled an expiry NOT MEASURED. This walk finds every budget site the gate
 * can execute and grades it:
 *
 *   CHECKED     a site in a SUITE whose result is handed to `budgetAssert(…)` / `expired(…)`
 *               (`test/budget.mjs`) within CHECK_WINDOW lines after it — the site's own binding, never
 *               "some budgetAssert somewhere in the file" (the liar arm (s5) drives exactly that);
 *   LEDGERED    a site in a gate HELPER (a module the gate or a suite imports, or a runner) named in
 *               BUDGET_LEDGER below with the count per kind and WHY its expiry is not read as a finding —
 *               a deliberate CLOSURE, or a DEFECT named for SCHEDULER that is not this row's;
 *   UNCHECKED   a site in a suite with no check — FAILS `budget-sweep.test.mjs` by name;
 *   UNLEDGERED  a helper site not in the ledger, or a ledgered file whose count moved — FAILS by name;
 *   OUTSIDE     a site in a file the gate never executes (control drivers, probes, measures, the
 *               installer): COUNTED AND NAMED PER FILE, never graded — their expiry cannot reach a gate
 *               verdict. That they read an expiry as `exit -1` is a finding (the report says so).
 *
 * WHAT IT CAN SEE (the spellings, in CODE: `stripToCode` blanks comments, strings and a template's text,
 * so a fixture source that merely CONTAINS `timeout:` is not a site): a `timeout:` property; a hand-rolled
 * wall-clock deadline `Date.now() - x < y` / `Date.now() < y`; `AbortSignal.timeout(`; a blocking
 * `Atomics.wait(` sleep; and the helper's own `until(` and `withinBudget(`.
 * WHAT IT CANNOT SEE, stated: a budget passed by SHORTHAND (`{ timeout }`) or through a variable options
 * object built elsewhere; a deadline counted by an accumulator rather than the clock except through
 * `Atomics.wait`; a `setTimeout` that KILLS a child (a budget with no spelling this walk knows); a budget in a
 * shell script or another language; and FLOW — a check is matched by the binding's NAME within the window,
 * so a reassigned binding reads as checked. The GATE is the suites the battery and the UI runner discover,
 * the runners, and the transitive RELATIVE imports of all of them; a module reached only through a computed
 * path or a spawned script other than the runners is OUTSIDE here, and named as such.
 *
 * THE CORPUS is `git ls-files --cached --others --exclude-standard` (tracked, plus untracked files that are
 * not ignored), so an uncommitted suite is swept too; no directory is enumerated here, and the corpus size is
 * printed and floored by the suite.
 *
 *   node scripts/budgetsweep.mjs          print the sweep; exit 1 on an UNCHECKED or UNLEDGERED site
 */
import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { stripToCode, stripComments } from "./walkfloor.mjs";

export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CHECK_WINDOW = 15;

/* The spellings, in code. `until` / `withinBudget` are the helper's own deadlines; a suite's use of them is a
   site like any other and is CHECKED the same way. */
export const SITE_KINDS = [
  { kind: "timeout:", re: /\btimeout\s*:/g },
  { kind: "deadline loop", re: /Date\.now\(\)\s*-\s*[\w.]+\s*<=?\s*[\w.]+|Date\.now\(\)\s*<=?\s*[\w.]+/g },
  { kind: "AbortSignal.timeout", re: /AbortSignal\.timeout\s*\(/g },
  { kind: "Atomics.wait", re: /Atomics\.wait\s*\(/g },
  { kind: "until", re: /(?<![\w.])until\s*\(/g },
  { kind: "withinBudget", re: /(?<![\w.])withinBudget\s*\(/g },
];
/* A hand-rolled deadline and a blocking sleep have no result to check: in a suite they are UNCHECKED by
   construction — the fix is `until()` from `test/budget.mjs`, whose result IS checkable. */
const UNCHECKABLE = new Set(["deadline loop", "AbortSignal.timeout", "Atomics.wait"]);

/* THE LEDGER: gate sites NOT graded by the suite rule, each with WHY. A count, per file and kind, so a new site
   in a ledgered file fails until somebody reads it and says what its expiry means. */
export const BUDGET_LEDGER = {
  "bio-plane/test/budget.mjs": { counts: { "deadline loop": 0, until: 0, withinBudget: 0 },
    why: "THE HELPER ITSELF — its own deadline and race are what every checked site calls" },
  "bio-plane/scripts/battery.mjs": { counts: { "timeout:": 2 },
    why: "CLOSURE — two `lsof` reads: an expiry reads the log path UNVERIFIED (D-425) or an empty held set (best effort, D-186); never a finding" },
  "bio-plane/scripts/residue.mjs": { counts: { "timeout:": 1 },
    why: "CLOSURE — the HELD sample: an expiry is `available: false`, printed UNVERIFIED, never 'nothing held' (D-237)" },
  "bio-plane/scripts/provenance.mjs": { counts: { "timeout:": 1 },
    why: "CLOSURE — a git read: an expiry is `null`, the stated THIRD state UNVERIFIED, never 'clean' (M0-16)" },
  "bio-plane/scripts/coverage.mjs": { counts: { "timeout:": 1 },
    why: "DEFECT, NOT THIS ROW'S — `lastCommitDate`: an expiry returns null and the row DROPS SILENTLY out of the reported staleness distribution (an under-count, not a false RED); named for SCHEDULER by M0-107" },
  "bio-plane/test/battery-residue.test.mjs": { counts: { "Atomics.wait": 1 },
    why: "CHECKED BY HAND — the synchronous holder wait (`waitFor`) inside the budget the suite asserts as `holder-budget`; it cannot see the holder EXIT, which the site states" },
};

const git = (args, repo) => {
  const r = spawnSync("git", args, { cwd: repo, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  return r.status === 0 && typeof r.stdout === "string" ? r.stdout : null;
};

const lineOf = (text, idx) => { let n = 1; for (let i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) n++; return n; };

/* The binding a site's result lands in: the nearest `const|let|var NAME = …` opening the statement the site
   sits in (no `;` between them at the top level of the text we can see). */
function bindingOf(code, idx) {
  const back = code.slice(Math.max(0, idx - 1200), idx);
  const decls = [...back.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?/g)];
  for (let k = decls.length - 1; k >= 0; k--) {
    const d = decls[k];
    const between = back.slice(d.index + d[0].length);
    if (!/;\s*\n/.test(between)) return d[1];
  }
  return null;
}

/* The check: `budgetAssert(…NAME…)` or `expired(NAME)` within CHECK_WINDOW lines AFTER the site. */
function checkOf(code, idx, name) {
  if (!name) return null;
  const from = code.indexOf("\n", idx);
  const lines = code.slice(from < 0 ? idx : from).split("\n").slice(0, CHECK_WINDOW + 1).join("\n");
  const esc = name.replace(/[$]/g, "\\$");
  const m = new RegExp(`budgetAssert\\s*\\([^;]*?(?<![\\w$.])${esc}(?![\\w$])|(?<![\\w.])expired\\s*\\(\\s*${esc}\\s*\\)`).exec(lines);
  if (!m) return null;
  return { how: m[0].startsWith("budgetAssert") ? "budgetAssert" : "expired", at: lineOf(code, idx) + lineOf(lines, m.index) - 1 };
}

/* The gate: the suites the battery and the UI runner discover, the runners, and their relative imports. */
function gateOf(files, repo) {
  const fset = new Set(files);
  const fleetDirs = files.filter((f) => /^[^/]+\/fleet-member\.json$/.test(f)).map((f) => {
    const dir = f.split("/")[0];
    let testDir = "test";
    try { testDir = JSON.parse(readFileSync(join(repo, f), "utf8")).testDir || "test"; } catch { /* default */ }
    return `${dir}/${testDir}`;
  });
  const depthOne = (f, d) => f.startsWith(`${d}/`) && !f.slice(d.length + 1).includes("/");
  const isSuite = (f) => f.endsWith(".test.mjs")
    && (depthOne(f, "bio-plane/test") || depthOne(f, "civicos-ui/test") || fleetDirs.some((d) => depthOne(f, d)));
  const suites = files.filter(isSuite);
  const runners = ["bio-plane/scripts/battery.mjs", "bio-plane/scripts/coverage.mjs", "civicos-ui/test/run.mjs",
    "tools/gates.mjs", "tools/plancheck.mjs", ...files.filter((f) => /^civicos-ui\/check-[\w.-]+\.mjs$/.test(f))]
    .filter((f) => fset.has(f));
  const IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["'`](\.{1,2}\/[^"'`\n]+)["'`]/g;
  const seen = new Set();
  const stack = [...suites, ...runners];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    let src = "";
    try { src = stripComments(readFileSync(join(repo, f), "utf8")); } catch { continue; }
    for (const m of src.matchAll(IMPORT_RE)) {
      const rel = normalize(join(dirname(f), m[1])).split("\\").join("/");
      if (fset.has(rel) && !seen.has(rel)) stack.push(rel);
    }
  }
  return { suites: new Set(suites), gate: seen, fleetDirs };
}

export function sweepBudgets({ repo = REPO, ledger = BUDGET_LEDGER } = {}) {
  const listed = git(["ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", "*.mjs"], repo);
  if (listed === null) return { walkFailed: true, corpus: 0, sites: [], outside: new Map(), ledgerDrift: [] };
  const files = [...new Set(listed.split("\0").filter(Boolean))].sort();
  const { suites, gate } = gateOf(files, repo);
  const sites = [];
  const outside = new Map();
  const counts = new Map();                     /* file -> kind -> n, for the ledger */
  for (const f of files) {
    let src;
    try { src = readFileSync(join(repo, f), "utf8"); } catch { continue; }
    const code = stripToCode(src);
    for (const { kind, re } of SITE_KINDS) {
      for (const m of code.matchAll(re)) {
        const line = lineOf(code, m.index);
        if (!gate.has(f)) { outside.set(f, (outside.get(f) || 0) + 1); continue; }
        if (!counts.has(f)) counts.set(f, new Map());
        counts.get(f).set(kind, (counts.get(f).get(kind) || 0) + 1);
        const site = { file: f, line, kind, zone: suites.has(f) ? "suite" : "helper" };
        if (ledger[f] && ledger[f].counts[kind] !== undefined) { site.state = "LEDGERED"; site.why = ledger[f].why; }
        else if (site.zone === "helper") { site.state = "UNLEDGERED"; }
        else if (UNCHECKABLE.has(kind)) { site.state = "UNCHECKED"; site.why = `a ${kind} has no result to check — use until() from test/budget.mjs`; }
        else {
          const name = bindingOf(code, m.index);
          const chk = checkOf(code, m.index, name);
          if (chk) { site.state = "CHECKED"; site.check = `${chk.how}(${name}) at :${chk.at}`; }
          else { site.state = "UNCHECKED"; site.why = name ? `no budgetAssert/expired of \`${name}\` within ${CHECK_WINDOW} lines` : "no binding to check"; }
        }
        sites.push(site);
      }
    }
  }
  /* A ledgered count that moved is drift in either direction: a site added is unread, a site gone is a ledger
     line describing nothing. Kinds ledgered at 0 (the helper itself) are ungraded by count. */
  const ledgerDrift = [];
  for (const [f, e] of Object.entries(ledger)) {
    for (const [kind, n] of Object.entries(e.counts)) {
      const got = (counts.get(f) && counts.get(f).get(kind)) || 0;
      if (n > 0 && got !== n) ledgerDrift.push(`${f}: ${got} ${kind} site(s), the ledger says ${n}`);
    }
  }
  return { walkFailed: false, corpus: files.length, suites: suites.size, gate: gate.size, sites, outside, ledgerDrift };
}

export function report(res, log = console.log) {
  if (res.walkFailed) { log("budget sweep (M0-107): the corpus could not be listed (git) — says NOTHING about budget sites"); return 1; }
  const by = (s) => res.sites.filter((x) => x.state === s);
  const bad = [...by("UNCHECKED"), ...by("UNLEDGERED")];
  log(`budget sweep (M0-107): corpus ${res.corpus} .mjs file(s) · in the gate ${res.gate} (${res.suites} suite(s))`
    + ` · ${res.sites.length} budget site(s) in the gate: ${by("CHECKED").length} CHECKED · ${by("LEDGERED").length} LEDGERED`
    + ` · ${by("UNCHECKED").length} UNCHECKED · ${by("UNLEDGERED").length} UNLEDGERED`
    + ` · ${[...res.outside.values()].reduce((a, b) => a + b, 0)} OUTSIDE the gate in ${res.outside.size} file(s)`);
  for (const s of res.sites) {
    const tail = s.state === "CHECKED" ? `-> ${s.check}` : s.why ? `— ${s.why}` : "";
    log(`  ${s.state.padEnd(10)} ${`${s.file}:${s.line}`.padEnd(52)} ${s.kind.padEnd(14)} ${tail}`);
  }
  for (const d of res.ledgerDrift) log(`  LEDGER DRIFT  ${d}`);
  log(`  OUTSIDE THE GATE (named, not graded — its expiry cannot reach a gate verdict; a driver reading an expiry as exit -1 is a finding):`);
  for (const [f, n] of [...res.outside].sort()) log(`    ${String(n).padStart(3)}  ${f}`);
  log("  REACH: in CODE only (comments, strings and a template's text blanked); cannot see a shorthand `{ timeout }`, an"
    + " options object built elsewhere, a setTimeout that kills a child, a shell budget, or flow (a check is matched by NAME"
    + ` within ${CHECK_WINDOW} lines); the gate is the discovered suites, the runners and their RELATIVE imports.`);
  return bad.length || res.ledgerDrift.length ? 1 : 0;
}

const IS_CLI = process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
if (IS_CLI) process.exit(report(sweepBudgets()));
