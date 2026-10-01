/* control-plane: the composed catalogue (R22; K585 (1), N245, N272, N414, K704, K717). `CHECK_FAMILIES` holds every
   DEC-49 family a product module of the plane exports, each code once, and `dec49Row` reads it. The totality arm walks
   every `modules.json` path of the plane (`bio-plane/src`, `bio-plane/checks`), imports each file and requires every
   exported `*_CHECKS` table to be one the list reaches, so a module that opens a new file of families fails here until
   the list names it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { M } from "./harness.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MODULES = JSON.parse(readFileSync(join(REPO, "build/modules.json"), "utf8")).modules;
const isFamily = (k, v) => /_CHECKS$/.test(k) && !!v && typeof v === "object" && !Array.isArray(v);

/* Every plane file of a module, with the module that owns it. */
function planeFiles() {
  const out = [];
  const walk = (p, id) => {
    const abs = join(REPO, p);
    if (!existsSync(abs)) return;
    if (statSync(abs).isDirectory()) { for (const f of readdirSync(abs)) if (!["node_modules", "dist", "test"].includes(f)) walk(join(p, f), id); }
    else if (p.endsWith(".mjs")) out.push([p, id]);
  };
  for (const m of MODULES) for (const p of m.paths || []) if (/^bio-plane\/(src|checks)(\/|$)/.test(p)) walk(p, m.id);
  return out;
}

/* The rows a list of sources reaches, by identity (a view composed of listed rows, `run-rules`' merged `AI_RUN_CHECKS`
   among them, reaches nothing new). */
const reached = (files) => new Set(files.flatMap(([, ns]) => Object.entries(ns).filter(([k, v]) => isFamily(k, v))
  .flatMap(([, v]) => Object.values(v))));

/* The rows exported anywhere in the plane that `files` does not reach: `<file> <family>`, once per family. */
async function unreached(files) {
  const have = reached(files);
  const missing = new Set();
  for (const [p] of planeFiles()) {
    const ns = await import(join(REPO, p));
    for (const [k, v] of Object.entries(ns))
      if (isFamily(k, v) && Object.values(v).some((row) => row && typeof row === "object" && !have.has(row))) missing.add(`${p} ${k}`);
  }
  return [...missing];
}

test("R22 (K585 (1)): CHECK_FAMILIES is total — every DEC-49 row any module of the plane exports is reached by the list (negative control: the list without one module's file misses its families)", async () => {
  assert.deepEqual(await unreached(M.CHECK_FAMILY_FILES), []);
  /* the list names only files that exist, each in a module's paths, each exporting a family; the catalogue first, the module's own last */
  const owned = new Set(planeFiles().map(([p]) => p));
  for (const [path, ns] of M.CHECK_FAMILY_FILES) {
    assert.ok(owned.has(`bio-plane/${path}`), path);
    assert.ok(Object.entries(ns).some(([k, v]) => isFamily(k, v)), path);
  }
  assert.equal(M.CHECK_FAMILY_FILES[0][0], "checks/bio-checks.mjs");
  assert.equal(M.CHECK_FAMILY_FILES.at(-1)[0], "src/control-plane/checks.mjs");
  for (const dropped of ["src/textchain.mjs", "src/action-clocks/checks.mjs", "src/monitoring/checks.mjs", "src/connections/checks.mjs"]) {
    const missing = await unreached(M.CHECK_FAMILY_FILES.filter(([p]) => p !== dropped));
    assert.ok(missing.some((m) => m.startsWith(`bio-plane/${dropped} `)), dropped);
  }
});

test("R22: CHECK_FAMILIES holds each code once, the first source's translated row; dec49Row answers exactly its rows — the families T18 moved among them (C-35 text chain, C-74 connections, C-52 content, C-123 and C-117.5 action clocks, C-18.10 and C-48.8/.9 monitoring, C-124 action plans, C-119 instance setup)", async () => {
  const seen = new Map();
  for (const [fam, rows] of Object.entries(M.CHECK_FAMILIES)) {
    assert.ok(/_CHECKS$/.test(fam), fam);
    for (const [code, row] of Object.entries(rows)) {
      assert.equal(seen.has(code), false, `${code} in ${fam} and ${seen.get(code)}`);
      seen.set(code, fam);
      const got = M.dec49Row(code);
      if (typeof row.translation === "string" && row.translation) assert.deepEqual(got, { check: row.check ?? null, translation: row.translation }, code);
      else assert.equal(got, null, code);
    }
  }
  assert.ok(seen.size > 900, String(seen.size));
  /* the first source wins: for every code, no earlier source holds a translated row the composition passed over */
  for (const [code, fam] of seen) {
    const kept = M.CHECK_FAMILIES[fam][code];
    for (const [, ns] of M.CHECK_FAMILY_FILES) {
      const hit = Object.entries(ns).filter(([k, v]) => isFamily(k, v) && v[code]).map(([, v]) => v[code]);
      if (hit.length) { if (kept.translation) assert.ok(hit.some((r) => r === kept) || !hit.some((r) => r.translation), code); break; }
    }
  }
  const moved = [
    ["../../../src/textchain.mjs", "TEXT_CHAIN_CHECKS"], ["../../../src/connections/checks.mjs", "CONNECTION_CHOICE_CHECKS"],
    ["../../../src/content/checks.mjs", "TRANSCRIBE_CHECKS"], ["../../../src/action-clocks/checks.mjs", "ACTION_CLOCK_CHECKS"],
    ["../../../src/monitoring/checks.mjs", "MONITORING_CHECKS"], ["../../../src/action-plans/checks.mjs", "ACTION_PLAN_CHECKS"],
    ["../../../src/setup.mjs", "INSTANCE_SETUP_CHECKS"], ["../../../src/run-rules/checks.mjs", "AI_RUN_OWN_CHECKS"],
    ["../../../src/acquisition/checks.mjs", "ACQUISITION_CHECKS"]];
  for (const [file, fam] of moved) {
    const rows = (await import(file))[fam];
    assert.ok(rows && Object.keys(rows).length, `${file} ${fam}`);
    for (const [code, row] of Object.entries(rows)) if (row.translation)
      assert.ok(M.dec49Row(code), `${fam}.${code} reaches the wire`);
  }
  const checksOf = async (file, fam) => Object.values((await import(file))[fam]).map((r) => r.check);
  assert.ok((await checksOf("../../../src/action-clocks/checks.mjs", "ACTION_CLOCK_CHECKS")).some((c) => /^C-123\./.test(c)));
  assert.ok((await checksOf("../../../src/monitoring/checks.mjs", "MONITORING_CHECKS")).some((c) => /^C-48\.[89]$/.test(c)));
  /* negative control: a code no source holds has no row */
  assert.equal(M.dec49Row("NO_SUCH_CODE_ANYWHERE"), null);
  /* the composition is frozen: a reader cannot change what the door decorates with */
  assert.ok(Object.isFrozen(M.CHECK_FAMILIES) && Object.values(M.CHECK_FAMILIES).every(Object.isFrozen));
});
