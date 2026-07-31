#!/usr/bin/env node
/* Coverage, measured in the units this project actually fails in.
 *
 * WHY NOT LINE COVERAGE. 36 of the 38 suites drive the plane through Miniflare,
 * which runs `src/**` inside WORKERD, not inside this node process. NODE_V8_COVERAGE
 * therefore sees the harness and not the subject: it would report high coverage of
 * the test files and nothing at all about `store.mjs`. A line-coverage number
 * produced that way would be a fabrication in exactly the sense `cpu.mjs` records
 * for a Worker timing itself, so this instrument does not produce one.
 *
 * WHAT IT MEASURES INSTEAD. The three surfaces whose gaps have actually shipped
 * defects in this repository:
 *
 *   1. OPS.  `op=invitelook` shipped with a ReferenceError while 1276 assertions
 *      passed, because the suite drove the STORE and the control plane was the only
 *      route a real caller had (D-43). So an op is reported at three levels: reached
 *      through the control plane, reached only at the Durable Object, or not reached
 *      at all. The middle level is the D-43 class and is reported as a WARNING
 *      rather than a pass.
 *
 *   2. CHECKS.  The catalog is the conformance contract. A check no assertion ever
 *      names is a rule nobody is enforcing, which is the same defect class as an
 *      exempted test (CLAUDE.md).
 *
 *   3. NEGATIVE CONTROLS.  "A suite that does not fail when you break its subject is
 *      testing something else." That discipline has been real and unrecorded, so
 *      nobody could answer which suites had been controlled and when. A suite
 *      declares its control in a header line and this instrument keeps the register.
 *
 * A suite declares its negative control with one line anywhere in its first 60 lines:
 *
 *     NEGATIVE CONTROL: <what to break> -> <what must then fail>
 *
 * Exit code is 0 unless --strict is passed, under which any op unreachable through
 * the control plane, any check never named, or any suite with no declared control
 * fails the run. Report first, enforce when the floor has been set.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(ROOT, ".."); // the fleet lives BESIDE the plane, not inside it.
const STRICT = process.argv.includes("--strict");
const JSON_OUT = process.argv.includes("--json");

/* ---------------------------------------------------------------- inventory */

const indexSrc = readFileSync(join(ROOT, "src/index.mjs"), "utf8");
const checksSrc = readFileSync(join(ROOT, "checks/bio-checks.mjs"), "utf8");

/* The body of a `<name> = { ... }` object literal, brace-matched out of source
   so a table read this way cannot fall behind a hand-kept list (D-113/D-93). The
   plane's OPS table and a fleet member's SURFACE table are both read this way. */
function tableBody(src, name) {
  const decl = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\{`);
  const m = decl.exec(src);
  if (!m) return null;
  let i = src.indexOf("{", m.index), depth = 0;
  for (let p = i; p < src.length; p++) {
    if (src[p] === "{") depth++;
    else if (src[p] === "}") { depth--; if (depth === 0) return src.slice(i + 1, p); }
  }
  return null;
}

/* The op table, read out of the module rather than hand-listed, so an op added
   later cannot pass by not being mentioned. Same reasoning as the capability
   completeness test. */
function opTable(src) {
  const body = tableBody(src, "OPS");
  if (body == null) throw new Error("OPS table not found in src/index.mjs");
  const ops = new Map();
  for (const m of body.matchAll(/^\s{2}([a-z][a-z0-9]*)\s*:\s*\{([^}]*)\}/gm)) {
    const mutating = /mutating:\s*true/.test(m[2]);
    const classes = /classes:\s*null/.test(m[2]) ? null
      : [...m[2].matchAll(/"([a-z]+)"/g)].map((c) => c[1]);
    ops.set(m[1], { mutating, classes });
  }
  return ops;
}

const OPS = opTable(indexSrc);
const CHECKS = [...new Set([...checksSrc.matchAll(/C-\d+\.\d+/g)].map((m) => m[0]))]
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

const suites = readdirSync(join(ROOT, "test"))
  .filter((f) => f.endsWith(".test.mjs")).sort();

/* Probes and benches are deliberately excluded: they are instruments, not the
   battery, and `npm test` does not run them. Counting them would inflate the
   figure with work no gate depends on. */

/* ------------------------------------------------------------- measurement */

const battery = suites.map((f) => ({ file: f, src: readFileSync(join(ROOT, "test", f), "utf8") }));

/* A call-shaped occurrence, not a mention. `index.mjs` resolves the op as
   `searchParams.get("op") || path.slice(1)`, so `/api/?op=cite` and a bare
   `/cite` are the SAME dispatch and both count; the word "monitor" appearing in
   a field name does not. Getting this wrong in the generous direction would
   report coverage this battery does not have, so the two exact buckets below are
   the ones to trust. */
const called = (op, src) =>
  new RegExp(`\\bop=${op}(?=[&"'\`\\s]|$)`, "m").test(src)
  || new RegExp(`/${op}(?=[?&"'\`])`).test(src)
  || new RegExp(`\\(\\s*["'\`]${op}["'\`]\\s*[,)]`).test(src);  // doGet("tasks"), doPost("taskdrain", …)

/* A suite reaches the CONTROL PLANE if it drives the worker entry at all, and
   the Durable Object only if it never does. The DO-only and unreached buckets are
   therefore exact; the control-plane bucket is an UPPER BOUND, because a suite
   that uses both routes is credited to the worker for every op it names. Stated
   here rather than smoothed over: an over-credited coverage figure is the kind of
   equality that costs nothing to produce. */
const opRows = [...OPS.entries()].map(([op, meta]) => {
  const hits = battery.filter((s) => called(op, s.src));
  const level = hits.length === 0 ? "unreached"
    : hits.some((s) => /dispatchFetch/.test(s.src)) ? "control-plane"
    : "durable-object-only";
  return { op, ...meta, level, suites: hits.map((s) => s.file) };
});

const allText = battery.map((s) => s.src).join("\n");
const checkRows = CHECKS.map((c) => ({
  check: c,
  named: new RegExp(c.replace(".", "\\.")).test(allText),
}));

const NEG = /NEGATIVE CONTROL:\s*(.+?)\s*(?:\*\/|$)/;
const controlRows = battery.map(({ file, src }) => {
  const head = src.split("\n").slice(0, 60).join("\n");
  const m = head.match(NEG);
  return { suite: file, control: m ? m[1].trim() : null };
});

/* ------------------------------------------------------------------ fleet */
/* D-117: the topology decision (I6) puts Workers BESIDE the plane. `coverage.mjs`
   read only the plane's OPS table, so the day a second Worker ships its surface
   is uncounted and the figure stays flat while a whole component goes untested —
   wrong in the generous direction, the one failure this instrument exists to
   prevent. A fleet member declares itself with a `fleet-member.json` at its root;
   members are DISCOVERED, never hand-listed, so a new one cannot escape the count
   by not being mentioned (the same lesson as the OPS table above). Each is held
   to the plane's own two behavioural surfaces: every surface op reached by one of
   the member's suites, and a declared negative control. (Checks are the plane's
   conformance catalog; a fleet member has none, so that surface is N/A to it.) */
function readJSON(p) { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } }
function readText(p) { try { return readFileSync(p, "utf8"); } catch { return ""; } }

/* A surface op is REACHED if a member suite names it path- or string-shaped
   (`/structure`, `"structure"`), the fleet analog of the plane's call-shaped
   matcher — a bare word in a comment does not count. */
const surfaceCalled = (op, src) =>
  new RegExp(`[/"'\`]${op}(?=[?"'\`&/\\s]|$)`).test(src);

function discoverFleet() {
  const members = [];
  for (const name of readdirSync(REPO)) {
    const meta = readJSON(join(REPO, name, "fleet-member.json"));
    if (!meta) continue;
    const dir = join(REPO, name);
    const surfBody = tableBody(readText(join(dir, meta.entry || "src/index.mjs")), meta.surface || "SURFACE");
    const surfaceOps = surfBody
      ? [...surfBody.matchAll(/^\s{2}([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm)].map((m) => m[1])
      : [];
    let suites = [];
    try { suites = readdirSync(join(dir, meta.testDir || "test")).filter((f) => f.endsWith(".test.mjs")); } catch { /* none */ }
    const suiteSrcs = suites.map((f) => ({ file: f, src: readText(join(dir, meta.testDir || "test", f)) }));
    const allSuiteText = suiteSrcs.map((s) => s.src).join("\n");
    const control = suiteSrcs.some((s) => NEG.test(s.src.split("\n").slice(0, 60).join("\n")));
    const ops = surfaceOps.map((op) => ({ op, reached: surfaceCalled(op, allSuiteText) }));
    members.push({ name: meta.name || name, dir: name, ops, control, suites: suites.length, hasSurface: surfBody != null });
  }
  return members;
}
const fleet = discoverFleet();
const fleetUnreached = fleet.flatMap((m) => m.ops.filter((o) => !o.reached).map((o) => ({ member: m.name, op: o.op })));
const fleetUncontrolled = fleet.filter((m) => !m.control);

/* ----------------------------------------------------------------- report */

const unreached = opRows.filter((r) => r.level === "unreached");
const doOnly = opRows.filter((r) => r.level === "durable-object-only");
const unnamed = checkRows.filter((r) => !r.named);
const uncontrolled = controlRows.filter((r) => !r.control);

const pct = (n, d) => d === 0 ? "100.0" : ((n / d) * 100).toFixed(1);

if (JSON_OUT) {
  console.log(JSON.stringify({ opRows, checkRows, controlRows, fleet }, null, 2));
} else {
  console.log(`\nBIO plane coverage — ${suites.length} battery suites\n`);

  console.log(`OPS  ${OPS.size} declared · `
    + `${opRows.filter((r) => r.level === "control-plane").length} reached through the control plane `
    + `(${pct(opRows.filter((r) => r.level === "control-plane").length, OPS.size)}%) · `
    + `${doOnly.length} at the Durable Object only · ${unreached.length} unreached`);
  if (doOnly.length) {
    console.log(`\n  WARNING — reached only at the Durable Object (the D-43 class: a real`);
    console.log(`  caller uses the control plane, and that route is untested):`);
    for (const r of doOnly) console.log(`    ${r.op}${r.mutating ? "  (mutating)" : ""}`);
  }
  if (unreached.length) {
    console.log(`\n  UNREACHED by any battery suite:`);
    for (const r of unreached) console.log(`    ${r.op}${r.mutating ? "  (mutating)" : ""}`);
  }

  console.log(`\nCHECKS  ${CHECKS.length} in the catalog · ${CHECKS.length - unnamed.length} named by an assertion `
    + `(${pct(CHECKS.length - unnamed.length, CHECKS.length)}%) · ${unnamed.length} never named`);
  console.log(`  Every check EXECUTES: the conformance suite runs the whole catalog and asserts`);
  console.log(`  zero findings. Never NAMED means no assertion proves the check FIRES on a`);
  console.log(`  violation, so it is exercised only in the direction that passes. That is the`);
  console.log(`  C-20.1 defect class exactly: the audit was clean because it was not looking.`);
  if (unnamed.length) console.log(`\n    ${unnamed.map((r) => r.check).join(" ")}`);

  console.log(`\nNEGATIVE CONTROLS  ${controlRows.length - uncontrolled.length} of ${controlRows.length} suites declare one `
    + `(${pct(controlRows.length - uncontrolled.length, controlRows.length)}%)`);
  if (uncontrolled.length) {
    console.log(`\n  No declared control — add one line in the first 60 lines:`);
    console.log(`    NEGATIVE CONTROL: <what to break> -> <what must then fail>`);
    for (const r of uncontrolled) console.log(`    ${r.suite}`);
  }

  const fleetOps = fleet.reduce((n, m) => n + m.ops.length, 0);
  console.log(`\nFLEET  ${fleet.length} member${fleet.length === 1 ? "" : "s"} beside the plane · `
    + `${fleetOps - fleetUnreached.length}/${fleetOps} surface ops reached · `
    + `${fleet.length - fleetUncontrolled.length}/${fleet.length} declaring a negative control`);
  console.log(`  A second Worker's surface was uncounted (D-117); each member is now held to`);
  console.log(`  the plane's own two behavioural surfaces — every surface op reached by one of`);
  console.log(`  the member's suites, and a declared control. Discovered from fleet-member.json.`);
  for (const m of fleet) {
    const reached = m.ops.filter((o) => o.reached).length;
    console.log(`\n    ${m.name} (${m.dir}/)  ${reached}/${m.ops.length} ops reached · `
      + `${m.suites} suite${m.suites === 1 ? "" : "s"} · control ${m.control ? "declared" : "MISSING"}`);
    for (const o of m.ops) console.log(`      ${o.reached ? "reached  " : "UNREACHED"} ${o.op}`);
    if (!m.hasSurface) console.log(`      WARNING — no ${"surface"} table found at its entry; surface is uncounted`);
  }
  console.log("");
}

if (STRICT && (unreached.length || doOnly.length || unnamed.length || uncontrolled.length
    || fleetUnreached.length || fleetUncontrolled.length)) {
  console.error("STRICT: coverage floor not met.");
  process.exit(1);
}
