/* THE NEGATIVE CONTROL FOR D-265's BRAND.  Run: `node test/walkfigure.control.mjs [arm]`
 * from `bio-plane/`.  Arms: baseline · newfloor · neuter · overstrict · unbranded · all.
 *
 * DELIBERATELY NOT A `.test.mjs`.  `scripts/battery.mjs` discovers `.endsWith(".test.mjs")`
 * and nothing else, and this harness EDITS REAL SOURCES while it runs.
 * `register.control.mjs` and `walkfloor.control.mjs` are the precedent.
 *
 * Each arm is armed ALONE with every other defence held OPEN, each DECLARES BEFORE IT
 * RUNS what must fail and what must not, and every restore is verified by sha256 AND by
 * a byte compare against a UNIQUELY-NAMED per-arm pristine copy, with the byte count
 * PRINTED and floored — the `e3b0c442…` incident (a restore reported byte-identical over
 * an EMPTY manifest) is the reason both checks and the floor are here rather than one.
 *
 * Suites are captured to a FILE and not through a pipe.  That is D-282, measured on this
 * estate: a suite's own `process.exit()` discards unflushed PIPE writes on darwin, and a
 * control arm's tally read `-1` because of it.  A missing tally is reported as -1 here and
 * never as 0.
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const MIN_BYTES = 1000;

const FILES = {
  figure: join(PLANE, "scripts", "walkfigure.mjs"),
  opclaims: join(PLANE, "scripts", "op-claims.mjs"),
};

/* The two suites every arm reads, and the two figures every row carries. */
const SUITES = {
  walkfigure: join(DIR, "walkfigure.test.mjs"),
  hygiene: join(DIR, "hygiene.test.mjs"),
};

const OUT = mkdtempSync(join(tmpdir(), "walkfigure-control-"));
process.on("exit", () => { try { rmSync(OUT, { recursive: true, force: true }); } catch {} });

function runSuite(name) {
  const out = join(OUT, `${name}-${Date.now()}.txt`);
  let code = 0;
  /* ONE run, captured to a FILE. D-282: a suite's own `process.exit()` discards
     unflushed PIPE writes on darwin, and a control arm's tally read -1 because of it. */
  try {
    const res = execFileSync(process.execPath, [SUITES[name]],
      { cwd: PLANE, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024 });
    writeFileSync(out, res);
  } catch (e) {
    code = e.status === undefined ? -1 : e.status;
    writeFileSync(out, String(e.stdout || "") + String(e.stderr || ""));
  }
  const text = readFileSync(out, "utf8");
  const m = text.match(new RegExp(`${name}:\\s+(\\d+) pass,\\s+(\\d+) fail`));
  /* A TypeError inside an assertion goes through NO assertion at all and ends the
     module while the tally reads clean — so a missing FOOT is -1, never 0. */
  return { pass: m ? Number(m[1]) : -1, fail: m ? Number(m[2]) : -1, exit: code, text, file: out };
}

function snapshot(keys, arm) {
  const snap = {};
  for (const k of keys) {
    const body = readFileSync(FILES[k]);
    const copy = join(OUT, `pristine-${arm}-${k}`);
    writeFileSync(copy, body);
    snap[k] = { body, sha: sha(body), copy, bytes: body.length };
    console.log(`    pristine ${arm}/${k}: ${body.length} bytes, sha256 ${sha(body).slice(0, 16)}…`);
    if (body.length < MIN_BYTES) { console.error(`    ABORT: ${k} is ${body.length} bytes, below the ${MIN_BYTES}-byte floor`); process.exit(2); }
  }
  return snap;
}

function restore(snap, arm) {
  let bad = 0;
  for (const [k, s] of Object.entries(snap)) {
    writeFileSync(FILES[k], s.body);
    const now = readFileSync(FILES[k]);
    const okSha = sha(now) === s.sha;
    const okBytes = Buffer.compare(now, readFileSync(s.copy)) === 0;
    console.log(`    restored ${arm}/${k}: ${now.length} bytes · sha256 ${okSha ? "EQUAL" : "DIFFERENT"} · cmp ${okBytes ? "IDENTICAL" : "DIFFERS"}`);
    if (!okSha || !okBytes) bad++;
  }
  return bad;
}

/* A file written into the real estate, removed by the arm that wrote it. */
const planted = [];
function plant(rel, body) {
  const p = join(DIR, rel);
  if (existsSync(p)) { console.error(`    ABORT: ${rel} already exists; refusing to overwrite`); process.exit(2); }
  writeFileSync(p, body);
  planted.push(p);
  console.log(`    planted ${rel} (${body.length} bytes)`);
  return p;
}
function unplant() { for (const p of planted.splice(0)) { try { unlinkSync(p); } catch {} } }
process.on("exit", unplant);

const ARMS = {};

/* ------------------------------------------------------------------- baseline */
ARMS.baseline = () => {
  console.log("\n(1) baseline — NOTHING ARMED.");
  console.log("    DECLARED: walkfigure GREEN, hygiene GREEN. This row is what distinguishes");
  console.log("    five-arms-working from five-arms-broken, and it is not decoration.");
  const wfg = runSuite("walkfigure"), hyg = runSuite("hygiene");
  console.log(`    ACTUAL: walkfigure ${wfg.pass}/${wfg.fail} · hygiene ${hyg.pass}/${hyg.fail}`);
  return { wfg, hyg };
};

/* -------------------------------------------------- newfloor: THE ITEM'S OWN ARM */
ARMS.newfloor = () => {
  console.log("\n(2) newfloor — THE ARM THIS ITEM EXISTS FOR.");
  console.log("    A NEW file imports a walk and FLOORS on it, in a spelling the static");
  console.log("    detector STATES it cannot see: the figure goes through a DATA STRUCTURE");
  console.log("    and through a FUNCTION PARAMETER before it is compared.");
  console.log("    DECLARED: the static detector `walkfloor.mjs` reports ZERO sites for the");
  console.log("    new file — that is the blindness, measured rather than asserted — WHILE");
  console.log("    running the file THROWS a WalkFloorError naming it. It must never be");
  console.log("    silently graded harmless by both halves at once.");
  const rel = "d265-unanticipated.probe.mjs";
  const p = plant(rel,
`/* D-265 control arm (newfloor). Planted and removed by test/walkfigure.control.mjs. */
import { sweep } from "../scripts/op-claims.mjs";

const r = sweep({ root: "${PLANE.split("\\").join("/")}", roots: ["scripts"] });

/* Through a DATA STRUCTURE — walkfloor.mjs pins this as a shape it cannot see. */
const held = [];
held.push(r.chars);

/* ...and then through a FUNCTION PARAMETER, which is the other stated gap. */
const atLeast = (value, bar) => value >= bar;

if (atLeast(held[0], 1000)) console.log("FLOOR PASSED — the corpus is big enough");
`);
  /* the STATIC half */
  let staticSites = -1, staticUnknowns = -1;
  try {
    const mod = execFileSync(process.execPath, ["-e",
      /* `sites` is a `safe` bucket entry and therefore a bare array — it is enumerated
         by name and never floored on. The first draft of this line unwrapped it as
         though it were branded and died with a TypeError; the ARM was right and the
         HARNESS was wrong, recorded rather than quietly fixed. */
      `import("./scripts/walkfloor.mjs").then((m)=>{const r=m.sweepWalkFloors({});`
      + `const n=r.sites.filter((s)=>s.file.includes("d265-unanticipated")).length;`
      + `const u=r.unknowns.filter((s)=>s.file.includes("d265-unanticipated")).length;`
      + `console.log("SITES="+n+" UNKNOWNS="+u);})`],
      { cwd: PLANE, encoding: "utf8" });
    staticSites = Number((mod.match(/SITES=(\d+)/) || [])[1] ?? -1);
    staticUnknowns = Number((mod.match(/UNKNOWNS=(\d+)/) || [])[1] ?? -1);
  } catch (e) { console.log(`    static half errored: ${String(e.stderr || e).slice(0, 300)}`); }
  /* the RUNTIME half */
  let threw = "NO THROW", name = "";
  try { execFileSync(process.execPath, [p], { cwd: PLANE, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) {
    const txt = String(e.stdout || "") + String(e.stderr || "");
    threw = /WalkFloorError/.test(txt) ? "WalkFloorError" : "other error";
    name = (txt.match(/d265-unanticipated\.probe\.mjs:\d+:\d+/) || [])[0] || "(unnamed)";
  }
  console.log(`    ACTUAL: static detector sites for the new file = ${staticSites}, unclassified = ${staticUnknowns}`
    + ` · running it → ${threw} · named at ${name}`);
  unplant();
  return { staticSites, staticUnknowns, threw, name };
};

/* --------------------------------------------------------------------- neuter */
ARMS.neuter = () => {
  console.log("\n(3) neuter — the brand stops refusing: ToPrimitive hands back the number.");
  console.log("    DECLARED: hygiene's REACH arm FAILS as a DELTA and PRINTS the planted");
  console.log("    corpus size, while the walk-export TOTALITY arms stay green — a brand");
  console.log("    that refuses nothing still declares its buckets, which is exactly why a");
  console.log("    reach delta is needed beside them.");
  const snap = snapshot(["figure"], "neuter");
  const src = readFileSync(FILES.figure, "utf8");
  const armed = src.replace(
    `      if (hint === "string") return String(n);
      throw new WalkFloorError(`,
    `      if (hint === "string") return String(n);
      if (true) return n;   /* ARMED BY walkfigure.control.mjs — neuter */
      throw new WalkFloorError(`);
  if (armed === src) { console.error("    ABORT: the neuter patch matched ZERO times — an arm that did not arm is a finding"); process.exit(2); }
  writeFileSync(FILES.figure, armed);
  const wfg = runSuite("walkfigure"), hyg = runSuite("hygiene");
  const reachLine = (hyg.text.match(/D-265 brand REACH:[^\n]*/) || ["(reach line absent)"])[0];
  const deltaFail = (hyg.text.match(/FAIL\s+the brand REFUSES every planted floor spelling[^\n]*/) || ["(no delta failure)"])[0];
  console.log(`    ACTUAL: walkfigure ${wfg.pass}/${wfg.fail} · hygiene ${hyg.pass}/${hyg.fail}`);
  console.log(`    ACTUAL reach line: ${reachLine.trim()}`);
  console.log(`    ACTUAL delta arm : ${deltaFail.trim().slice(0, 200)}`);
  const bad = restore(snap, "neuter");
  return { wfg, hyg, reachLine, deltaFail, bad };
};

/* ---------------------------------------------------------------- overstrict */
ARMS.overstrict = () => {
  console.log("\n(4) overstrict — a NEW file that merely IMPORTS a walking module and never");
  console.log("    floors on it. Correct work in a spelling nothing was written against.");
  console.log("    DECLARED: walkfigure GREEN and hygiene GREEN, both unchanged from the");
  console.log("    baseline row. A fence tighter than its rule is not a safer fence.");
  const rel = "d265-benign.probe.mjs";
  plant(rel,
`/* D-265 control arm (overstrict). Planted and removed by test/walkfigure.control.mjs. */
import { sweep, LEDGER_STATE } from "../scripts/op-claims.mjs";

/* Imports a walking module. Never floors on the walk. Reports, and floors on a
   STATIC export — the benign shape a module-granularity detector cries wolf on.
   CORRECTED 2026-09-22 (M0-116): the static export was LEDGER, which left this
   module for op-claims-ledger.mjs; LEDGER_STATE is a static export of the SAME
   walking module, so the arm asks what it asked. */
const r = sweep({ root: "${PLANE.split("\\").join("/")}", roots: ["scripts"] });
console.log("swept " + r.files + " files over " + r.names.count + " names");
if (LEDGER_STATE.length >= 5) console.log("the ledger is populated");
`);
  const wfg = runSuite("walkfigure"), hyg = runSuite("hygiene");
  console.log(`    ACTUAL: walkfigure ${wfg.pass}/${wfg.fail} · hygiene ${hyg.pass}/${hyg.fail}`);
  unplant();
  return { wfg, hyg };
};

/* ----------------------------------------------------------------- unbranded */
ARMS.unbranded = () => {
  console.log("\n(5) unbranded — `sweep()` stops classifying its boundary and returns a bare");
  console.log("    object, which is the pre-D-265 state of the world.");
  console.log("    DECLARED: hygiene's TOTALITY arm FAILS naming op-claims.mjs · sweep(),");
  console.log("    and it must fail on `declared: false` rather than on a missing key —");
  console.log("    a brand removed must not look like a brand that is merely incomplete.");
  const snap = snapshot(["opclaims"], "unbranded");
  const src = readFileSync(FILES.opclaims, "utf8");
  const armed = src.replace("  return walkResult({\n    about: \"op-claims sweep()",
    "  if (true) return { table, files: files.length, chars, mentions, dynamic, offLedger,\n"
    + "    names: [...names].sort(), findings, attributions, ledgerDrift, plannedBuilt, skipped, prov,\n"
    + "    filesRepro: repro.length, charsRepro, mentionsRepro, namesRepro: [...namesRepro].sort() };\n"
    + "  return walkResult({\n    about: \"op-claims sweep()");
  if (armed === src) { console.error("    ABORT: the unbranded patch matched ZERO times — an arm that did not arm is a finding"); process.exit(2); }
  writeFileSync(FILES.opclaims, armed);
  const hyg = runSuite("hygiene");
  const totality = (hyg.text.match(/FAIL\s+bio-plane\/scripts\/op-claims\.mjs · sweep\(\)[^\n]*(\n[^\n]*){0,2}/) || ["(no totality failure)"])[0];
  console.log(`    ACTUAL: hygiene ${hyg.pass}/${hyg.fail}`);
  console.log(`    ACTUAL totality arm: ${String(totality).trim().slice(0, 300)}`);
  const bad = restore(snap, "unbranded");
  return { hyg, totality, bad };
};

const which = process.argv[2] || "all";
const order = which === "all" ? ["baseline", "newfloor", "neuter", "overstrict", "unbranded"] : [which];
for (const a of order) {
  if (!ARMS[a]) { console.error(`unknown arm: ${a}`); process.exit(2); }
  ARMS[a]();
}
console.log("\ndone.");
