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
/* M0-16 / D-238: THIS INSTRUMENT DISCOVERS OVER THREE DIRECTORIES IT DOES NOT
   CONTROL, AND UNTIL NOW REPORTED NUMBERS FROM ALL THREE WITHOUT SAYING SO.
   `test/` (the suites and therefore the whole negative-control register),
   the repository root twice (fleet manifests, and Worker directories). The
   consequence is not hypothetical and is the reason this was an item: the
   REGISTER_FLOOR below is MOVED BY HAND to a figure a green run PRINTED, so a
   floor moved while a phantom suite was present is PERMANENTLY TOO HIGH — it
   fails every honest run afterwards, and a gate that fails honest runs gets
   switched off, which is VERIFICATION.md's own stated reason for not making
   `--strict` the gate yet. See `provenance.mjs` for the mechanism and, more
   usefully, for what the check cannot see. */
import { readGitProvenance, reportProvenance, repoPath } from "./provenance.mjs";

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
   M0-14 / D-233: `arms` is now `null` for a declaration the detector could not
   classify, and NEVER 0. A missing tally reported as zero is indistinguishable
   from a real zero, which is exactly how four suites declaring 48 arms between
   them read as declaring none for four consecutive re-measurements of this row.
   Zero is a measurement; null is the absence of one, and they are named apart. */
const controlRows = battery.map(({ file, src }) => {
  const c = readControl(src);
  return { suite: file, control: c ? c.text : null, arms: c ? c.arms : null,
           declaredAtLine: c ? c.line : null, declarationLines: c ? c.lines : 0 };
});

/* THE REGISTER'S FLOOR (M0-14). A ceiling is not a ratchet: the arms tally could
   only ever have risen, so a whole declaration style going dark — or a matcher
   narrowed by a later edit — moved it DOWNWARD in silence and nothing failed.
   These three are what this instrument PRINTED on a green run of this tree on
   2026-08-08, never incremented by hand and never given slack, because a floor
   with slack is not a ratchet either (REC-71's census floor sat 19 codes low and
   had already flipped a control from RED to GREEN).

   `corpus` is the REACH: how many suites the register reads at all. A matcher
   narrowed to nothing reports a beautiful 100% over an empty corpus.

   MOVE THESE ONLY UPWARD, and only to a figure a green run PRINTED. */
const REGISTER_FLOOR = {
  /* ONE KEY SET, DELIBERATELY. Nine items moved these figures in parallel on 2026-08-08,
     each correct on its own tree, and keep-both merges left duplicate `arms:` keys in
     this one object literal THREE separate times. That is valid JavaScript: the LAST key
     silently wins, and on the first occasion the last was the LOWEST — so the merge would
     have quietly INSTALLED SLACK in a ratchet whose entire purpose is to have none. No
     error, no warning, nothing red, and **a duplicate object key cannot be seen by
     reading the value you expect to find.**

     IF YOU ARE RESOLVING A CONFLICT HERE: COLLAPSE TO ONE SET and re-read the printed
     figures. Do not keep both. Worker figures, each true of its own branch and none true
     here: M0-11 476 · M0-12 478 · REC-63 480 · REC-66 482 · REC-65 483 · M0-15 486 ·
     REC-77 530 · M0-16 542 · M0-17 553.

     AND SINCE M0-16 THE COMPARISON IS AGAINST THE **REPRODUCIBLE** FIGURE, not the
     counted one — a phantom suite inflates the corpus, and a floor moved while one is
     present would be permanently too high, which is how a ratchet gets switched off.
     Move these only UPWARD, and only to a figure a green run PRINTED. */
  arms:       550,  // arms stated across the classified declarations
  classified: 127,  // declarations the detector could count arms in
  corpus:     128,  // suites the register reads

  arms:       553,  // arms stated across the classified declarations
  classified: 128,  // declarations the detector could count arms in
  corpus:     129,  // suites the register reads
};

/* THE UNCLASSIFIED CEILING, pinned BY NAME rather than by count. A suite whose
   declaration the detector cannot count arms in is not a failure — the register
   states plainly what it cannot see — but a NEW one is, because that is the
   D-233 defect arriving again. Each name carries why it cannot be counted.

   `case-opened.test.mjs` — its head declaration is a pointer, and the fuller
   block at the foot of the file separates its marker from its arms with a
   paragraph of prose, which the extent rule (a declaration is a paragraph, plus
   the list it introduces) deliberately does not cross. */
const REGISTER_UNCLASSIFIED = ["case-opened.test.mjs"];

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
  surfaceOps: 4,   // pdf-worker: structure, version (CPDF-9). agent-worker: run, version.
};

function discoverFleet() {
  const members = [];
  /* M0-16: `!name.startsWith(".")`, ADDED HERE, and it is a correction rather
     than a tidy-up. `scripts/battery.mjs`'s fleet walk has always carried this
     filter and this one did not, so this instrument could ENROL A MEMBER THE
     RUNNER IT REPORTS ON WOULD NEVER RUN — a manifest under any dot-directory,
     and `.claude/worktrees/` (sixty checkouts of this same repository) is a
     dot-directory that is also GITIGNORED. Coverage credited from a source read
     while the battery never executed a line of it is D-117's failure exactly,
     one directory out, and in the generous direction. The two walks now agree;
     measured before and after on this tree, the fleet is 2 members either way. */
  for (const name of readdirSync(REPO).filter((d) => !d.startsWith("."))) {
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
    members.push({ name: meta.name || name, dir: name, ops, control, suites: suites.length, hasSurface: surfBody != null,
      /* M0-16: the paths this walk was ADMITTED BY and the paths it READ, kept so
         their provenance can be asked. The manifest is the larger hole of the two
         because it enrols a whole DIRECTORY rather than one file. */
      manifestPath: join(REPO, name, "fleet-member.json"),
      suitePaths: suites.map((f) => join(dir, meta.testDir || "test", f)) });
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

/* ---- M0-16 / D-238: WHAT DID THESE THREE WALKS COUNT, AND IS IT IN A COMMIT?
 *
 * Every path this instrument was ADMITTED BY or READ FROM, gathered here at the
 * moment it was counted rather than re-derived from the directory afterwards —
 * the suites (which are the whole register corpus), the fleet manifests (the
 * larger hole, because a manifest enrols a DIRECTORY), the fleet members' own
 * suites, and the `wrangler.jsonc` files by which a directory is judged to be a
 * Worker at all. Three walks, one report. */
const PROV = readGitProvenance(REPO);
const inCommit = (abs) => PROV.inHead === null ? true : PROV.inHead.has(repoPath(REPO, abs));
const discovered = [
  ...suites.map((f) => ({ path: repoPath(REPO, join(ROOT, "test", f)), what: f,
    counted: "a battery suite, and one row of the negative-control register" })),
  ...fleet.flatMap((m) => [
    { path: repoPath(REPO, m.manifestPath), what: `${m.name}'s fleet manifest`,
      counted: `enrols a whole directory — ${m.ops.length} surface op(s), ${m.suites} suite(s)` },
    ...m.suitePaths.map((p) => ({ path: repoPath(REPO, p), what: `${m.name}'s suite`,
      counted: "reach for that member's surface ops" })),
  ]),
  ...readdirSync(REPO).filter((n) => !n.startsWith(".") && readText(join(REPO, n, "wrangler.jsonc")) !== "")
    .map((n) => ({ path: repoPath(REPO, join(REPO, n, "wrangler.jsonc")), what: `${n}'s wrangler.jsonc`,
      counted: "is what makes this directory a Worker that must be accounted for" })),
];

/* ----------------------------------------------------------------- report */

const unreached = opRows.filter((r) => r.level === "unreached");
const doOnly = opRows.filter((r) => r.level === "durable-object-only");
const unnamed = checkRows.filter((r) => !r.named);
const uncontrolled = controlRows.filter((r) => !r.control);

/* The register, split into what was MEASURED and what could not be (M0-14). A
   declaration with no countable arms is UNCLASSIFIED, and it is never summed in
   as a zero. */
const classified = controlRows.filter((r) => typeof r.arms === "number");
const unclassified = controlRows.filter((r) => r.control && r.arms == null);
const registerArms = classified.reduce((n, r) => n + r.arms, 0);
const fullest = classified.reduce((a, b) => (b.arms > a.arms ? b : a), classified[0] || { arms: 0, suite: "(none)" });

/* THE SAME THREE FIGURES OVER THE COMMITTED CORPUS ALONE — the numbers another
   checkout at this HEAD reproduces. These are the figures the floor is compared
   against and the figures a reader must move the floor to, and the reason is the
   whole of D-238: a floor moved to a CONTAMINATED figure is permanently too high
   and fails every honest run afterwards. When git cannot answer, `inCommit` says
   true for everything and these collapse onto the contaminated figures — which
   is stated as UNVERIFIED below and never as clean. */
const repro = controlRows.filter((r) => inCommit(join(ROOT, "test", r.suite)));
const reproClassified = repro.filter((r) => typeof r.arms === "number");
const reproArms = reproClassified.reduce((n, r) => n + r.arms, 0);
const contaminated = PROV.inHead !== null && repro.length !== controlRows.length;

const registerBelowFloor = [];
if (reproArms < REGISTER_FLOOR.arms)
  registerBelowFloor.push(`${reproArms} arms stated, floor is ${REGISTER_FLOOR.arms}`);
if (reproClassified.length < REGISTER_FLOOR.classified)
  registerBelowFloor.push(`${reproClassified.length} classified declaration(s), floor is ${REGISTER_FLOOR.classified}`);
if (repro.length < REGISTER_FLOOR.corpus)
  registerBelowFloor.push(`the register READ ${repro.length} suite(s) that are in a commit, floor is ${REGISTER_FLOOR.corpus}`);
/* A NEW unclassified declaration is the D-233 defect arriving again. */
const newlyUnclassified = unclassified.filter((r) => !REGISTER_UNCLASSIFIED.includes(r.suite));

const pct = (n, d) => d === 0 ? "100.0" : ((n / d) * 100).toFixed(1);

if (JSON_OUT) {
  console.log(JSON.stringify({ opRows, checkRows, controlRows, fleet,
    provenance: { headSha: PROV.headSha, verified: PROV.inHead !== null, discovered } }, null, 2));
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
    + `(${pct(controlRows.length - uncontrolled.length, controlRows.length)}%) · `
    + `${registerArms} arms stated across ${classified.length} classified declaration(s) · `
    + `fullest ${fullest.arms} (${fullest.suite}) · ${unclassified.length} UNCLASSIFIED`);
  console.log(`  An arm is one MARKED item of the list a declaration states — a "break this -> that`);
  console.log(`  must then fail" transition, or a parenthesised ordinal opening a segment. The count`);
  console.log(`  is a FLOOR on arms stated, not an exact count: an arm given a LABEL rather than an`);
  console.log(`  ordinal ("(D-231a)") is not counted, because widening the ordinal to any bracketed`);
  console.log(`  token would count every "(D-113)" and "(DEC-46)" this prose is full of. It is here`);
  console.log(`  so a declaration that got SHORTER is visible — a register that reads green while`);
  console.log(`  quoting a fraction of what was checked is the generous direction (M0-9).`);
  if (unclassified.length) {
    console.log(`\n  UNCLASSIFIED — a declaration this register could NOT count arms in. NAMED here`);
    console.log(`  rather than scored zero, which is the whole of D-233: a suite silently scored 0`);
    console.log(`  reads as "declares no arms" when the truth is "this instrument cannot read this`);
    console.log(`  suite's arms", and four suites declaring 48 arms between them read that way for`);
    console.log(`  four consecutive re-measurements of this row.`);
    for (const r of unclassified) console.log(`    ${r.suite}`);
  }
  console.log(`\n  REGISTER FLOOR  arms ${reproArms}/${REGISTER_FLOOR.arms} · `
    + `classified ${reproClassified.length}/${REGISTER_FLOOR.classified} · `
    + `corpus (suites read) ${repro.length}/${REGISTER_FLOOR.corpus}`
    + `${reproArms > REGISTER_FLOOR.arms ? ` · GREW by ${reproArms - REGISTER_FLOOR.arms} arm(s)` : ""}`);
  console.log(`  The tally rises on its own and can only FALL by an edit — so a ceiling would never`);
  console.log(`  have fired. The floor is what makes this figure worth reading (M0-14).`);
  /* M0-16: the floor is compared against — and must be moved to — the REPRODUCIBLE
     figure. When they differ, both are printed and the difference is named, because
     a reader about to move a floor by hand is exactly the reader this defect hurts. */
  if (contaminated) {
    console.log(`\n  THE THREE FIGURES ABOVE ARE THE REPRODUCIBLE ONES. This tree also holds work that is`);
    console.log(`  in no commit, so the CONTAMINATED figures — what this run actually read — are higher:`);
    console.log(`    arms ${registerArms} · classified ${classified.length} · corpus ${controlRows.length}`
      + `   (contaminated: ${controlRows.length - repro.length} suite(s) no other checkout has)`);
    console.log(`  MOVE THE FLOOR TO THE REPRODUCIBLE FIGURES AND NEVER TO THESE (D-238). A floor moved`);
    console.log(`  while a phantom was present is permanently too high: it fails every honest run`);
    console.log(`  afterwards, and a gate that fails honest runs gets switched off. The suites are`);
    console.log(`  named by the provenance line at the foot of this report.`);
  } else if (PROV.inHead === null) {
    console.log(`  UNVERIFIED: git could not answer, so the figures above are what this tree holds and`);
    console.log(`  NOT a claim that another checkout reproduces them. Do not move a floor from them.`);
  }
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

  /* M0-16 / D-238. The corpus size is PRINTED beside the verdict on purpose: a
     walk narrowed to nothing reports a beautiful clean provenance over an empty
     corpus, and this project has already caught a headline assertion passing that
     way (M0-15's own restore check compared two EMPTY files and called them
     byte-identical). `discovered` is what these three walks actually counted. */
  console.log("");
  reportProvenance({
    prov: PROV, items: discovered, instrument: "this instrument",
    corpus: `${suites.length} plane suite(s) · ${fleet.length} fleet manifest(s) · `
      + `${fleet.reduce((n, m) => n + m.suitePaths.length, 0)} fleet suite(s) · `
      + `${discovered.length - suites.length - fleet.length - fleet.reduce((n, m) => n + m.suitePaths.length, 0)} wrangler.jsonc`,
    totals: PROV.inHead === null ? [] : [
      { label: "register arms", contaminated: registerArms, reproducible: reproArms, source: "suites" },
      { label: "suites read by the register", contaminated: controlRows.length, reproducible: repro.length, source: "suites" },
    ],
  });
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

if (registerBelowFloor.length)
  console.error(`\nREGISTER FLOOR: ${registerBelowFloor.join("; ")}. THE ESTATE'S DECLARED CONTROLS SHRANK, or the`
    + `\n  detector stopped seeing them. This figure rises on its own and can only fall by an edit, so a`
    + `\n  ceiling could never have fired on it — which is how a whole declaration style went dark and the`
    + `\n  published number moved not at all (D-233). Establish WHICH declaration got shorter, or which`
    + `\n  suites the walk stopped reading, before moving the floor — and move it only to a figure this`
    + `\n  instrument PRINTED on a green run.`);
if (newlyUnclassified.length)
  console.error(`\nREGISTER: ${newlyUnclassified.map((r) => r.suite).join(", ")} declare${newlyUnclassified.length === 1 ? "s" : ""} a`
    + `\n  negative control this register cannot count the arms of, and ${newlyUnclassified.length === 1 ? "it is" : "they are"} not on the named list in`
    + `\n  this script. That is D-233 arriving again: a declaration the instrument cannot read used to be`
    + `\n  scored ZERO and folded silently into the tally. Either state the arms as a marked list — an`
    + `\n  arrow per arm, or a parenthesised ordinal per arm, in the paragraph the marker opens — or add`
    + `\n  the suite to REGISTER_UNCLASSIFIED with the reason it cannot be counted.`);

if (STRICT && (unreached.length || doOnly.length || unnamed.length || uncontrolled.length
    || registerBelowFloor.length || newlyUnclassified.length
    || fleetUnreached.length || fleetUncontrolled.length
    || unaccountedWorkers.length || fleetBelowFloor.length || fleetSurfaceless.length || fleetMutating.length)) {
  console.error("STRICT: coverage floor not met.");
  process.exit(1);
}
