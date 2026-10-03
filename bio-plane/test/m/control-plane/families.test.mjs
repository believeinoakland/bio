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
  /* R43: the catalogue is no source; record-grammar's shared rows come first, the module's own last */
  assert.equal(M.CHECK_FAMILY_FILES.some(([p]) => p.startsWith("checks/")), false);
  assert.equal(M.CHECK_FAMILY_FILES[0][0], "src/record-grammar/acts.mjs");
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

test("R22 (K782, K813, K817, K831, K837): the list reads credentials' three families, basis-versions', inquiry-grammar's, public-read's and action-grammar's (not actions' re-export), and each of their translated rows decorates with its own check and words (negative control: the list without one of them misses its families)", async () => {
  const files = [["src/credentials/checks.mjs", ["SIGNER_ENROLMENT_CHECKS", "AI_CREDENTIAL_CHECKS", "CREDENTIALS_CHECKS"]],
                 ["src/basis-versions/checks.mjs", ["BASIS_VERSION_CHECKS", "VERSION_ACT_CHECKS", "VERSION_KIND_CHECKS", "CONCLUDE_ACT_CHECKS", "NARROW_CHECKS"]],
                 ["src/inquiry-grammar/checks.mjs", ["LEAD_CHECKS", "INQUIRY_GRAMMAR_CHECKS"]],
                 ["src/public-read/checks.mjs", ["CASE_RESOLUTION_CHECKS", "PUBLISHED_STORE_CHECKS", "PUBLISHED_READ_CHECKS"]],
                 ["src/action-grammar/checks.mjs", ["ACTION_FENCE_CHECKS", "ACTION_ACT_CHECKS", "GOVERNING_LAW_CHECKS", "QUOTE_CHECKS",
                                                    "LIFECYCLE_CHECKS", "RISK_TIER_REVISION_CHECKS", "RECORDS_LAW_FENCE_CHECKS", "ACTION_CATALOGUE_CHECKS"]]];
  const listed = new Map(M.CHECK_FAMILY_FILES.map(([p, ns]) => [p, ns]));
  assert.equal(listed.has("src/actions/checks.mjs"), false, "actions' re-export is not a source of its own");
  let rows = 0;
  for (const [path, fams] of files) {
    assert.ok(listed.has(path), path);
    for (const fam of fams) {
      const table = listed.get(path)[fam];
      assert.ok(table && Object.keys(table).length, `${path} ${fam}`);
      for (const [code, row] of Object.entries(table)) if (row.translation) {
        rows++;
        assert.deepEqual(M.dec49Row(code), { check: row.check ?? null, translation: row.translation }, `${fam}.${code}`);
      }
    }
    const missing = await unreached(M.CHECK_FAMILY_FILES.filter(([p]) => p !== path));
    assert.ok(missing.some((m) => m.startsWith(`bio-plane/${path} `)), `without ${path}`);
  }
  assert.ok(rows > 40, String(rows));
  /* K850: inquiry-grammar's own table is found by the reserved suffix in its namespace as it is, with no alias */
  const IG = await import("../../../src/inquiry-grammar/checks.mjs");
  assert.equal(listed.get("src/inquiry-grammar/checks.mjs"), IG);
  for (const code of Object.keys(IG.INQUIRY_GRAMMAR_CHECKS))
    assert.deepEqual(M.dec49Row(code), { check: IG.INQUIRY_GRAMMAR_CHECKS[code].check ?? null,
                                         translation: IG.INQUIRY_GRAMMAR_CHECKS[code].translation }, code);
});

test("R22, R43 (K921): the list reads local-facts' C-126 and filing-templates' C-125, each in its module's place (local-facts before standards, filing-templates after action-clocks and before filings), and every one of their rows decorates with its own check and words (negative control: the list without either misses its family)", async () => {
  const paths = M.CHECK_FAMILY_FILES.map(([p]) => p);
  const at = (p) => paths.indexOf(p);
  for (const [path, fam, prefix] of [["src/local-facts/checks.mjs", "LOCAL_FACTS_CHECKS", "C-126."],
                                     ["src/filing-templates/checks.mjs", "FILING_TEMPLATE_CHECKS", "C-125."]]) {
    assert.ok(at(path) >= 0, path);
    const table = (await import(`../../../${path}`))[fam];
    assert.ok(Object.values(table).some((r) => r.check.startsWith(prefix)), `${fam} holds ${prefix}`);
    for (const [code, row] of Object.entries(table))
      assert.deepEqual(M.dec49Row(code), { check: row.check, translation: row.translation }, `${fam}.${code}`);
    const missing = await unreached(M.CHECK_FAMILY_FILES.filter(([p]) => p !== path));
    assert.ok(missing.some((m) => m.startsWith(`bio-plane/${path} `)), `without ${path}`);
  }
  assert.ok(at("src/review/checks.mjs") < at("src/local-facts/checks.mjs") && at("src/local-facts/checks.mjs") < at("src/standards/checks.mjs"));
  assert.ok(at("src/action-clocks/checks.mjs") < at("src/filing-templates/checks.mjs") && at("src/filing-templates/checks.mjs") < at("src/filings/checks.mjs"));
  /* the moved rows C-115.31–.33, .35–.38 are decorated from filing-templates', whichever source holds them too */
  for (const code of ["MACHINE_CANNOT_DRAFT_TEMPLATE", "TEMPLATE_TIER3_FILE", "NO_SUCH_TEMPLATE", "NO_TEMPLATE_GRANT"])
    assert.ok(M.dec49Row(code), code);
});

test("R22, R43 (K1150): the list reads network-notices' C-127 in its module's place (after public-read, before ratification), and every one of its rows decorates with its own check and words (negative control: the list without it misses its family)", async () => {
  const paths = M.CHECK_FAMILY_FILES.map(([p]) => p);
  const path = "src/network-notices/checks.mjs";
  assert.ok(paths.indexOf("src/public-read/checks.mjs") < paths.indexOf(path) && paths.indexOf(path) < paths.indexOf("src/ratification/checks.mjs"));
  const table = (await import(`../../../${path}`)).NETWORK_NOTICE_CHECKS;
  assert.equal(Object.keys(table).length, 16);
  for (const [code, row] of Object.entries(table)) {
    assert.match(row.check, /^C-127\.\d+$/, code);
    assert.deepEqual(M.dec49Row(code), { check: row.check, translation: row.translation }, code);
  }
  const missing = await unreached(M.CHECK_FAMILY_FILES.filter(([p]) => p !== path));
  assert.ok(missing.includes(`bio-plane/${path} NETWORK_NOTICE_CHECKS`), missing.join(", "));
});

test("R22, R43 (K1207; N506): the list reads link-sweep's C-18.16–C-18.18 (`SWEEP_CHECKS`) in its module's place (after monitoring, before tasks), and every one of its rows decorates with its own check and words; monitoring's file no longer holds them (negative control: the list without link-sweep's file misses its family)", async () => {
  const paths = M.CHECK_FAMILY_FILES.map(([p]) => p);
  const path = "src/link-sweep/checks.mjs";
  assert.ok(paths.indexOf("src/monitoring/checks.mjs") < paths.indexOf(path) && paths.indexOf(path) < paths.indexOf("src/tasks/checks.mjs"));
  const table = (await import(`../../../${path}`)).SWEEP_CHECKS;
  assert.deepEqual(Object.values(table).map((r) => r.check).sort(), ["C-18.16", "C-18.17", "C-18.18"]);
  for (const [code, row] of Object.entries(table)) assert.deepEqual(M.dec49Row(code), { check: row.check, translation: row.translation }, code);
  const MON = await import("../../../src/monitoring/checks.mjs");
  for (const code of Object.keys(table))
    assert.equal(Object.entries(MON).some(([k, v]) => isFamily(k, v) && Object.hasOwn(v, code)), false, `${code} left monitoring's file`);
  const missing = await unreached(M.CHECK_FAMILY_FILES.filter(([p]) => p !== path));
  assert.ok(missing.includes(`bio-plane/${path} SWEEP_CHECKS`), missing.join(", "));
});

test("R22, R43 (N512; K1193): the list reads attestation's C-89 (`ATTEST_CHECKS`) and provenance-routes' C-34 (`ROUTE_MARK_CHECKS`) from their own modules' files, in the module order (provenance, attestation, provenance-routes, before capture-sources), every one of their rows decorates with its own check and words, and provenance's file holds neither family (negative control: the list without either file misses its family)", async () => {
  const paths = M.CHECK_FAMILY_FILES.map(([p]) => p);
  const at = (p) => paths.indexOf(p);
  assert.ok(at("src/provenance/checks.mjs") < at("src/attestation/checks.mjs")
            && at("src/attestation/checks.mjs") < at("src/provenance-routes/checks.mjs")
            && at("src/provenance-routes/checks.mjs") < at("src/capture-sources/credentials.mjs"), paths.join(", "));
  const PROV = await import("../../../src/provenance/checks.mjs");
  for (const [path, fam, prefix] of [["src/attestation/checks.mjs", "ATTEST_CHECKS", "C-89."],
                                     ["src/provenance-routes/checks.mjs", "ROUTE_MARK_CHECKS", "C-34."]]) {
    const table = (await import(`../../../${path}`))[fam];
    assert.ok(table && Object.keys(table).length, `${path} ${fam}`);
    for (const [code, row] of Object.entries(table)) {
      assert.ok(row.check.startsWith(prefix), `${fam}.${code} ${row.check}`);
      assert.deepEqual(M.dec49Row(code), { check: row.check, translation: row.translation }, `${fam}.${code}`);
      assert.equal(Object.entries(PROV).some(([k, v]) => isFamily(k, v) && Object.hasOwn(v, code)), false, `${code} left provenance's file`);
    }
    const missing = await unreached(M.CHECK_FAMILY_FILES.filter(([p]) => p !== path));
    assert.ok(missing.includes(`bio-plane/${path} ${fam}`), missing.join(", "));
  }
  for (const code of ["CAPTURE_HELD_IN_PARTS", "ROUTE_MARK_NO_AUTHOR", "ROUTE_MARK_NO_BUNDLE", "ROUTE_MARK_NO_SUCH_BUNDLE", "ROUTE_MARK_NOT_A_DOCUMENT"])
    assert.ok(M.dec49Row(code), code);
});

test("R22, R43 (N520, N522, N526, N533; K1310, K1331): the list reads accepted-work's C-21.4 and C-21.5 (after inquiry-grammar, before inquiry), case-import's C-130 (after ratification, before case-authoring) and docket's C-129 (directly after publication, before public-read), each in its module's place, and every one of their rows decorates with its own check and words; case-checker holds no family and has no entry; docket's pressure codes are its own (`MACHINE_CANNOT_MARK_DOCKET_PRESSURE` C-129.10, `DOCKET_PRESSURE_MARKED` C-129.12, `DOCKET_PRESSURE_REFUSED` C-129.13), no code is in both docket's and action-grammar's families, and action-grammar's `PRESSURE_MARKED`, `PRESSURE_REFUSED` and `MACHINE_CANNOT_MARK_PRESSURE` keep their own rows (negative control: the list without any of the three files misses its family)", async () => {
  const paths = M.CHECK_FAMILY_FILES.map(([p]) => p);
  const at = (p) => paths.indexOf(p);
  assert.ok(at("src/inquiry-grammar/checks.mjs") < at("src/accepted-work/checks.mjs") && at("src/accepted-work/checks.mjs") < at("src/inquiry/index.mjs"), paths.join(", "));
  assert.ok(at("src/ratification/checks.mjs") < at("src/case-import/checks.mjs") && at("src/case-import/checks.mjs") < at("src/case-authoring/checks.mjs"), paths.join(", "));
  assert.equal(at("src/docket/checks.mjs"), at("src/publication/checks.mjs") + 1, paths.join(", "));
  assert.ok(at("src/docket/checks.mjs") < at("src/public-read/checks.mjs"), paths.join(", "));
  assert.equal(paths.some((p) => p.startsWith("src/case-checker/")), false);
  for (const [path, fam, checks] of [["src/accepted-work/checks.mjs", "ACCEPTED_WORK_CHECKS", /^C-21\.[45]$/],
                                     ["src/case-import/checks.mjs", "CASE_IMPORT_CHECKS", /^C-130\.\d+$/],
                                     ["src/docket/checks.mjs", "DOCKET_CHECKS", /^C-129\.\d+$/]]) {
    const table = (await import(`../../../${path}`))[fam];
    assert.ok(Object.keys(table).length >= 2, `${path} ${fam}`);
    for (const [code, row] of Object.entries(table)) {
      assert.match(row.check, checks, code);
      assert.deepEqual(M.dec49Row(code), { check: row.check, translation: row.translation }, code);
    }
    const missing = await unreached(M.CHECK_FAMILY_FILES.filter(([p]) => p !== path));
    assert.ok(missing.includes(`bio-plane/${path} ${fam}`), missing.join(", "));
  }
  assert.deepEqual(Object.values((await import("../../../src/accepted-work/checks.mjs")).ACCEPTED_WORK_CHECKS).map((r) => r.check).sort(), ["C-21.4", "C-21.5"]);
  /* docket: its own pressure codes, no code shared with action-grammar, whose rows stay its own */
  const AG = (await import("../../../src/action-grammar/checks.mjs"));
  const agFams = Object.entries(AG).filter(([k, v]) => isFamily(k, v)).map(([, v]) => v);
  const agRow = (code) => agFams.filter((v) => v[code]).map((v) => v[code])[0];
  for (const code of ["PRESSURE_MARKED", "PRESSURE_REFUSED", "MACHINE_CANNOT_MARK_PRESSURE"])
    assert.deepEqual(M.dec49Row(code), { check: agRow(code).check, translation: agRow(code).translation }, code);
  const DK = (await import("../../../src/docket/checks.mjs")).DOCKET_CHECKS;
  for (const code of Object.keys(DK)) assert.equal(agFams.some((v) => Object.hasOwn(v, code)), false, `${code} is in both docket's and action-grammar's families`);
  for (const code of ["MACHINE_CANNOT_MARK_PRESSURE", "PRESSURE_MARKED", "PRESSURE_REFUSED"])
    assert.equal(Object.hasOwn(DK, code), false, `docket's shared ${code} is gone (N526, N533)`);
  for (const [code, check] of [["MACHINE_CANNOT_MARK_DOCKET_PRESSURE", "C-129.10"], ["DOCKET_PRESSURE_MARKED", "C-129.12"], ["DOCKET_PRESSURE_REFUSED", "C-129.13"]])
    assert.deepEqual(M.dec49Row(code), { check, translation: DK[code].translation }, code);
});

test("R22, R43 (N529; K1331, K1333): the list reads case-disclosures' C-120 (`CASE_DISCLOSURE_CHECKS`) in its module's place (after case-import, directly before case-authoring), every one of its rows (C-120.1–C-120.8, C-120.10–C-120.13) decorates with its own check and words, case-authoring's file no longer holds them, and C-120.9 is held by no code (negative control: the list without case-disclosures' file misses its family)", async () => {
  const paths = M.CHECK_FAMILY_FILES.map(([p]) => p);
  const path = "src/case-disclosures/checks.mjs";
  assert.ok(paths.indexOf("src/case-import/checks.mjs") < paths.indexOf(path), paths.join(", "));
  assert.equal(paths.indexOf(path) + 1, paths.indexOf("src/case-authoring/checks.mjs"), paths.join(", "));
  const table = (await import(`../../../${path}`)).CASE_DISCLOSURE_CHECKS;
  assert.deepEqual(Object.values(table).map((r) => r.check).sort((a, b) => Number(a.split(".")[1]) - Number(b.split(".")[1])),
    ["C-120.1", "C-120.2", "C-120.3", "C-120.4", "C-120.5", "C-120.6", "C-120.7", "C-120.8", "C-120.10", "C-120.11", "C-120.12", "C-120.13"]);
  for (const [code, row] of Object.entries(table)) assert.deepEqual(M.dec49Row(code), { check: row.check, translation: row.translation }, code);
  const CA = await import("../../../src/case-authoring/checks.mjs");
  for (const code of Object.keys(table))
    assert.equal(Object.entries(CA).some(([k, v]) => isFamily(k, v) && Object.hasOwn(v, code)), false, `${code} left case-authoring's file`);
  const held = Object.values(M.CHECK_FAMILIES).flatMap((rows) => Object.values(rows)).map((r) => r.check);
  assert.equal(held.includes("C-120.9"), false, "C-120.9 is withdrawn and never reused (K1275)");
  const missing = await unreached(M.CHECK_FAMILY_FILES.filter(([p]) => p !== path));
  assert.ok(missing.includes(`bio-plane/${path} CASE_DISCLOSURE_CHECKS`), missing.join(", "));
});
