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
 * A suite declares its negative control in a comment ANYWHERE in the file:
 *
 *     NEGATIVE CONTROL: <what to break> -> <what must then fail>
 *
 * and the declaration may run to as many lines and as many arms as it needs. The
 * detector lives in `scripts/control-register.mjs` so the battery can test it —
 * M0-9, after a version of it read a five-arm block as one arm and read two
 * elaborate blocks as no control at all. Read that module's header before
 * changing anything about where a declaration starts, ends, or how arms count.
 *
 * Exit code is 0 unless --strict is passed, under which any op unreachable through
 * the control plane, any check never named, or any suite with no declared control
 * fails the run. Report first, enforce when the floor has been set.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readControl } from "./control-register.mjs";

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

/* M0-9: the whole file, the whole block, every arm — see control-register.mjs.
   `arms` is REPORTED and never gated; the floor is still "declares one". */
const controlRows = battery.map(({ file, src }) => {
  const c = readControl(src);
  return { suite: file, control: c ? c.text : null, arms: c ? c.arms : 0,
           declaredAtLine: c ? c.line : null, declarationLines: c ? c.lines : 0 };
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

/* ---- VF-3, 2026-08-08 (FL-2's turn). D-117 WAS RESOLVED; THIS KEEPS IT TRUE.
 *
 * The walk above discovers members by `fleet-member.json`, which is the right
 * mechanism and had one hole big enough to drive the original defect back
 * through: **DISCOVERY IS THE ONLY EVIDENCE, so a member that stops declaring
 * itself stops existing.** Delete or rename a manifest and the fleet count
 * silently falls, `--strict` passes, and the figure reads exactly as it did
 * before the member was ever written — which is D-117's own sentence: *a whole
 * component goes untested while coverage reports the same percentage*, wrong in
 * the generous direction. That is VF-3's named control and the instrument had no
 * answer to it.
 *
 * Four gates close it, and none of them is a hand-kept list of members:
 *
 *  (1) EVERY WORKER DIRECTORY IS ACCOUNTED FOR. A directory carrying a
 *      `wrangler.jsonc` IS a Worker — that file is what deploys it, and
 *      `CLAUDE.md` requires every one of them to pin `account_id`. So each must
 *      either be the plane (measured in full above), be NAMED here as
 *      deliberately not a fleet member, or declare a `fleet-member.json`. Hiding
 *      a manifest now FAILS rather than shrinking the fleet, because the
 *      `wrangler.jsonc` is still there and the directory is still a Worker. The
 *      named set below is a DECISION SURFACE and not a coverage list: a new
 *      Worker appearing in this repository fails `--strict` until somebody says
 *      which of the two it is, which is the outcome worth having.
 *  (2) A FLOOR ON THE FLEET. (1) cannot see a whole directory deleted, and a
 *      count with no floor is not a ratchet. Both figures below are the ones
 *      this instrument PRINTED on a green run — never a number added to the
 *      previous number. Move them WITH the fleet, in the same turn.
 *  (3) A MEMBER WITH NO READABLE SURFACE FAILS. It used to report `0/0 ops
 *      reached` and a WARNING, and PASS: 0 unreached out of 0 is the emptiest
 *      possible green. Renaming a `SURFACE` table was enough to go dark.
 *  (4) FLEET RULE 2, STRUCTURALLY. `PARALLELISM.md`: *"A fleet member ASSERTS
 *      nothing. It returns derived output and writes nothing."* A member
 *      declaring a `mutating: true` surface op has left the fleet contract, and
 *      that is now a gate rather than a convention somebody remembers. */
const NOT_A_FLEET_MEMBER = {
  "bio-plane": "the plane itself — its OPS table, checks and controls are measured in full above.",
  "newgroup":  "the INSTALLER. It installs the fleet (D-115) and is not in it; it holds no surface the plane calls.",
};

const FLEET_FLOOR = {
  members:    2,   // pdf-worker (I6, CPDF-6) + agent-worker (I8, FL-2).
  surfaceOps: 3,   // pdf-worker: structure. agent-worker: run, version.
};

function discoverFleet() {
  const members = [];
  for (const name of readdirSync(REPO)) {
    const meta = readJSON(join(REPO, name, "fleet-member.json"));
    if (!meta) continue;
    const dir = join(REPO, name);
    const surfBody = tableBody(readText(join(dir, meta.entry || "src/index.mjs")), meta.surface || "SURFACE");
    /* The name matcher stays LOOSE so a row written in a spelling this walk did
       not anticipate is still counted; the brace body is read separately, and a
       row whose declaration cannot be read is REPORTED as unreadable rather than
       quietly treated as non-mutating. Silence about a shape is not evidence
       about it. */
    const surfaceOps = surfBody
      ? [...surfBody.matchAll(/^\s{2}([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(\{[^}]*\})?/gm)]
          .map((m) => ({ op: m[1], decl: m[2] || null }))
      : [];
    let suites = [];
    try { suites = readdirSync(join(dir, meta.testDir || "test")).filter((f) => f.endsWith(".test.mjs")); } catch { /* none */ }
    const suiteSrcs = suites.map((f) => ({ file: f, src: readText(join(dir, meta.testDir || "test", f)) }));
    const allSuiteText = suiteSrcs.map((s) => s.src).join("\n");
    const control = suiteSrcs.some((s) => readControl(s.src) != null);
    const ops = surfaceOps.map(({ op, decl }) => ({
      op,
      reached: surfaceCalled(op, allSuiteText),
      mutating: decl == null ? null : /mutating:\s*true/.test(decl),
    }));
    members.push({ name: meta.name || name, dir: name, ops, control, suites: suites.length, hasSurface: surfBody != null });
  }
  return members;
}
const fleet = discoverFleet();
const fleetUnreached = fleet.flatMap((m) => m.ops.filter((o) => !o.reached).map((o) => ({ member: m.name, op: o.op })));
const fleetUncontrolled = fleet.filter((m) => !m.control);
const fleetSurfaceOps = fleet.reduce((n, m) => n + m.ops.length, 0);
/* (3) — no readable surface table, or a table with nothing in it. */
const fleetSurfaceless = fleet.filter((m) => !m.hasSurface || m.ops.length === 0);
/* (4) — fleet rule 2. `null` is an unreadable declaration and is treated as a
   violation, not as a pass: an instrument that cannot read a shape must not
   report it as conformant. */
const fleetMutating = fleet.flatMap((m) => m.ops.filter((o) => o.mutating !== false)
  .map((o) => ({ member: m.name, op: o.op, mutating: o.mutating })));
/* (1) — every Worker directory accounted for. */
const declaredDirs = new Set(fleet.map((m) => m.dir));
const unaccountedWorkers = readdirSync(REPO)
  .filter((name) => !name.startsWith(".") && readText(join(REPO, name, "wrangler.jsonc")) !== "")
  .filter((name) => !declaredDirs.has(name) && !(name in NOT_A_FLEET_MEMBER));
/* (2) — the floor. */
const fleetBelowFloor = [];
if (fleet.length < FLEET_FLOOR.members)
  fleetBelowFloor.push(`${fleet.length} fleet member(s) discovered, floor is ${FLEET_FLOOR.members}`);
if (fleetSurfaceOps < FLEET_FLOOR.surfaceOps)
  fleetBelowFloor.push(`${fleetSurfaceOps} fleet surface op(s) enumerated, floor is ${FLEET_FLOOR.surfaceOps}`);

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

  const arms = controlRows.reduce((n, r) => n + r.arms, 0);
  const fullest = controlRows.reduce((a, b) => (b.arms > a.arms ? b : a), controlRows[0] || { arms: 0 });
  console.log(`\nNEGATIVE CONTROLS  ${controlRows.length - uncontrolled.length} of ${controlRows.length} suites declare one `
    + `(${pct(controlRows.length - uncontrolled.length, controlRows.length)}%) · `
    + `${arms} arms stated across the register · fullest ${fullest.arms} (${fullest.suite})`);
  console.log(`  An arm is one stated "break this -> that must then fail" transition. The count is`);
  console.log(`  REPORTED, never gated: the floor is still that a suite declares a control at all.`);
  console.log(`  It is here so a declaration that got SHORTER is visible — a register that reads`);
  console.log(`  green while quoting a fraction of what was checked is the generous direction (M0-9).`);
  if (uncontrolled.length) {
    console.log(`\n  No declared control — add one, in a comment anywhere in the file, over as many`);
    console.log(`  lines and arms as it needs:`);
    console.log(`    NEGATIVE CONTROL: <what to break> -> <what must then fail>`);
    for (const r of uncontrolled) console.log(`    ${r.suite}`);
  }

  const fleetOps = fleetSurfaceOps;
  console.log(`\nFLEET  ${fleet.length} member${fleet.length === 1 ? "" : "s"} beside the plane · `
    + `${fleetOps - fleetUnreached.length}/${fleetOps} surface ops reached · `
    + `${fleet.length - fleetUncontrolled.length}/${fleet.length} declaring a negative control · `
    + `floor ${FLEET_FLOOR.members} member(s) / ${FLEET_FLOOR.surfaceOps} op(s)`
    + `${fleet.length > FLEET_FLOOR.members ? ` · GREW by ${fleet.length - FLEET_FLOOR.members} member(s)` : ""}`
    + `${fleetOps > FLEET_FLOOR.surfaceOps ? ` · GREW by ${fleetOps - FLEET_FLOOR.surfaceOps} op(s)` : ""}`);
  console.log(`  A second Worker's surface was uncounted (D-117); each member is held to the`);
  console.log(`  plane's own two behavioural surfaces — every surface op reached by one of the`);
  console.log(`  member's suites, and a declared control. Discovered from fleet-member.json.`);
  console.log(`  VF-3: discovery alone was not enough. A member that stops DECLARING itself used`);
  console.log(`  to stop existing, and the figure held still while a component went dark — D-117's`);
  console.log(`  own sentence. So every Worker directory is now accounted for, the count carries a`);
  console.log(`  FLOOR, an unreadable or empty SURFACE table FAILS instead of reporting 0/0, and`);
  console.log(`  fleet rule 2 (a member ASSERTS nothing) is a gate rather than a convention.`);
  for (const m of fleet) {
    const reached = m.ops.filter((o) => o.reached).length;
    console.log(`\n    ${m.name} (${m.dir}/)  ${reached}/${m.ops.length} ops reached · `
      + `${m.suites} suite${m.suites === 1 ? "" : "s"} · control ${m.control ? "declared" : "MISSING"}`);
    for (const o of m.ops)
      console.log(`      ${o.reached ? "reached  " : "UNREACHED"} ${o.op}`
        + `${o.mutating === false ? "" : o.mutating === true ? "   MUTATING — a fleet member asserts nothing (fleet rule 2)" : "   DECLARATION UNREADABLE — cannot show it is non-mutating"}`);
    if (!m.hasSurface) console.log(`      NO SURFACE TABLE found at its entry (${m.dir}/) — the surface is uncounted, which is the D-117 failure itself`);
    else if (m.ops.length === 0) console.log(`      SURFACE TABLE IS EMPTY — 0 of 0 reached is the emptiest possible green`);
  }
  const accountedNote = Object.entries(NOT_A_FLEET_MEMBER)
    .map(([d, why]) => `${d} (${why.split(".")[0]})`).join(" · ");
  console.log(`\n    Workers accounted for but NOT fleet members: ${accountedNote}`);
  if (unaccountedWorkers.length)
    console.log(`    UNACCOUNTED Worker director${unaccountedWorkers.length === 1 ? "y" : "ies"} `
      + `(a wrangler.jsonc with no fleet-member.json): ${unaccountedWorkers.join(", ")}`);
  console.log("");
}

if (unaccountedWorkers.length) {
  console.error(`\nFLEET: ${unaccountedWorkers.join(", ")} carr${unaccountedWorkers.length === 1 ? "ies" : "y"} a `
    + `wrangler.jsonc and no fleet-member.json. A directory with a wrangler.jsonc IS a Worker — that file is`);
  console.error(`  what deploys it. Either declare it (fleet-member.json, so its surface is counted) or name it`);
  console.error(`  in NOT_A_FLEET_MEMBER in this script with the reason. An undeclared Worker is a component that`);
  console.error(`  can go dark while this figure holds still, which is exactly what D-117 named.`);
}
if (fleetBelowFloor.length)
  console.error(`\nFLEET FLOOR: ${fleetBelowFloor.join("; ")}. THE WALK LOST SIGHT of a member or a surface — this is`
    + `\n  the failure a ceiling cannot see. Establish what stopped being discovered before moving the floor,`
    + `\n  and move it only to a figure this instrument PRINTED on a green run.`);
if (fleetSurfaceless.length)
  console.error(`\nFLEET SURFACE: ${fleetSurfaceless.map((m) => m.name).join(", ")} — no readable SURFACE table, or an`
    + `\n  empty one. It would report 0/0 ops reached and pass; a member whose surface cannot be read is a member`
    + `\n  whose surface is untested.`);
if (fleetMutating.length)
  console.error(`\nFLEET RULE 2: ${fleetMutating.map((o) => `${o.member}.${o.op}`).join(", ")} declare${fleetMutating.length === 1 ? "s" : ""} a`
    + `\n  surface op that is not shown to be non-mutating. A fleet member ASSERTS nothing (PARALLELISM.md): it`
    + `\n  returns derived output and the plane decides what it means, because a hop a component can hand us is a`
    + `\n  hop a component can invent (D-112).`);

if (STRICT && (unreached.length || doOnly.length || unnamed.length || uncontrolled.length
    || fleetUnreached.length || fleetUncontrolled.length
    || unaccountedWorkers.length || fleetBelowFloor.length || fleetSurfaceless.length || fleetMutating.length)) {
  console.error("STRICT: coverage floor not met.");
  process.exit(1);
}
