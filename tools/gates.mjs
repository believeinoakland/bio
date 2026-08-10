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
 *      One non-docs path — code, tools, tests, config, anything — and the class
 *      is FULL. Unknown or unclassifiable state is FULL. The narrow profile can
 *      only be reached by a diff that is entirely prose under docs/.
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
 * Usage:
 *   node tools/gates.mjs            classify the change, run the right profile
 *   node tools/gates.mjs --full     force the full four gates
 *   node tools/gates.mjs --explain  classify and print the plan; run nothing
 *
 * Exit: 0 all gates green · 1 a gate failed or the state could not be classified.
 *
 * NEGATIVE CONTROL (run it when you touch the classifier): stage one whitespace
 * edit in bio-plane/src/store.mjs alongside a docs edit and confirm the class
 * reads FULL; drop it and confirm DOCS. Recorded 2026-08-10, both directions.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const sh = (cmd, args) =>
  execFileSync(cmd, args, { cwd: REPO, encoding: "utf-8" }).trim();

const FORCE_FULL = process.argv.includes("--full");
const EXPLAIN = process.argv.includes("--explain");

/* ---- 1 · what changed, measured ---------------------------------------- */
let base = "";
try { base = sh("git", ["merge-base", "HEAD", "origin/main"]); } catch { /* fall through */ }
let changed = new Set();
try {
  if (base) for (const f of sh("git", ["diff", "--name-only", base, "HEAD"]).split("\n")) if (f) changed.add(f);
  // Uncommitted work, tracked and untracked, without parsing porcelain columns.
  for (const f of sh("git", ["diff", "--name-only", "HEAD"]).split("\n")) if (f) changed.add(f);
  for (const f of sh("git", ["ls-files", "--others", "--exclude-standard"]).split("\n")) if (f) changed.add(f);
} catch (e) {
  console.error(`gates: cannot read the diff (${e.message}) — refusing to narrow; class is FULL.`);
  changed = null;
}

const isDocsPath = (p) =>
  p.startsWith("docs/") &&
  (p.endsWith(".md") || p.endsWith(".html") || p.endsWith(".svg"));

let cls = "FULL";
let why = "forced";
if (!FORCE_FULL && changed) {
  if (changed.size === 0) { cls = "DOCS"; why = "empty diff — nothing beyond prose can have moved"; }
  else {
    const nonDocs = [...changed].filter((p) => !isDocsPath(p));
    if (nonDocs.length === 0) { cls = "DOCS"; why = `${changed.size} path(s), all prose under docs/`; }
    else { cls = "FULL"; why = `non-docs path in the diff: ${nonDocs[0]}${nonDocs.length > 1 ? ` (+${nonDocs.length - 1} more)` : ""}`; }
  }
}

/* ---- 2 · the doc-facing suite set, derived ------------------------------ */
function docFacing(dir) {
  const out = [];
  let files = [];
  try { files = readdirSync(join(REPO, dir)).filter((f) => f.endsWith(".test.mjs")); } catch { return out; }
  for (const f of files.sort()) {
    const src = readFileSync(join(REPO, dir, f), "utf-8");
    const ctrl = join(REPO, dir, f.replace(/\.test\.mjs$/, ".control.mjs"));
    const ctrlSrc = existsSync(ctrl) ? readFileSync(ctrl, "utf-8") : "";
    if (src.includes("docs/") || ctrlSrc.includes("docs/")) out.push(f);
  }
  return out;
}

const planeDoc = docFacing("bio-plane/test");
const uiDoc = docFacing("civicos-ui/test");

/* ---- 3 · the plan ------------------------------------------------------- */
const run = (label, cmd, args, opts = {}) => {
  console.log(`\n=== gates · ${label}: ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd: opts.cwd ?? REPO, stdio: "inherit" });
  return r.status === 0;
};

console.log(`gates: change class ${cls} — ${why}`);
if (cls === "DOCS")
  console.log(`gates: doc-facing suites derived fresh — plane [${planeDoc.join(", ")}] · ui [${uiDoc.join(", ")}]`);

if (EXPLAIN) process.exit(0);

let green = true;
if (cls === "FULL") {
  green = run("battery (all)", "npm", ["run", "test:battery"], { cwd: join(REPO, "bio-plane") }) && green;
  green = run("coverage --strict", "node", ["scripts/coverage.mjs", "--strict"], { cwd: join(REPO, "bio-plane") }) && green;
  green = run("civicos-ui (all)", "node", ["civicos-ui/test/run.mjs"]) && green;
} else {
  // battery.mjs positional args are name filters; pass the derived doc-facing names.
  const planeFilters = planeDoc.map((f) => f.replace(/\.test\.mjs$/, ""));
  green = run("battery (doc-facing)", "node", ["scripts/battery.mjs", ...planeFilters], { cwd: join(REPO, "bio-plane") }) && green;
  for (const f of uiDoc)
    green = run(`ui (doc-facing) ${f}`, "node", [join("civicos-ui/test", f)]) && green;
}
// --local skips the publication checks: gates runs MID-TURN, before commit+push,
// and a dirty planning surface is the expected state then. The bare plancheck is
// still owed AFTER the push — it is the handoff gate, not this one.
green = run("plancheck --local", "node", ["tools/plancheck.mjs", "--local"]) && green;

console.log(`\ngates: ${green ? "GREEN" : "RED"} · class ${cls}`);
if (green) console.log("gates: after you push, run `node tools/plancheck.mjs` bare — the publication half runs there.");
process.exit(green ? 0 : 1);
