/* case-tensions — its invariants: no case-level strength composed (R8, a copy of publication R26), the C-92 rows moved
   whole (R9, publication R33's share), the flags and attributions declared to record-core's purge as publication declared
   them (R10, publication R31's share; K23), and no place named (R11, a copy of publication R34). Driven at the module's
   interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, V, NOW, sha } from "./fixture.mjs";
import * as MODULE from "../../../src/case-tensions/index.mjs";
import { ATTRIBUTION_ACT_CHECKS, CASE_TENSIONS_TABLES, caseTensionsOf, caseTensionsOwns, rowOf } from "../../../src/case-tensions/index.mjs";
import { unnamedSourceStatement } from "../../../src/case-grammar/index.mjs";

const F = "INQ-2026-0001", CASE = "CASE-2026-0001";
const CAP = sha("the knocked bytes");

/* A world exercising every answer: a ratified case over F with a revision flag, ann's observation chosen at a level, a
   capture's choice, tensions read. */
function busy() {
  const ctr = { unresolvedRecordOn: ({ finding, sha: s, viewer }) => ({ ok: true, finding, sha: s, truncated: false,
    candidates: [{ candidate: "c-1", a: { text: "a" }, b: { text: "b" }, state: "open", depth: 1 },
                 ...(viewer === V("olive") ? [{ candidate: "c-2", unseen_other_side: true, side: { text: "s" }, state: "open" }] : [])] }) };
  const w = world({ contradiction: ctr });
  w.member("olive"); w.member("ann");
  const proj = w.project("PROJ-1", ["olive"]);
  const obs = w.observe("ann");
  const pin = w.finding(F);
  w.reach.set(F, { self: [obs], via: [] });
  w.actors.set(CAP, [V("ann")]);
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }], attributions: [{ observation: obs }],
                       sources: [{ capture: CAP, stated: unnamedSourceStatement({ capture: CAP, received: NOW }), basis: null }] });
  const outward = [
    w.op("attribute", { by: "ann" }, { caseId: CASE, edition: 1, observation: obs, level: "name", reason: "mine" }),
    w.op("attribute", { by: "ann" }, { caseId: CASE, edition: 1, capture: CAP, level: "cover", reason: "mine" }),
    w.op("attribute", {}, {}), w.op("attribute", { by: "olive" }, { level: "group" }),
    w.op("attribute", { by: "ann" }, { caseId: CASE, edition: 1, observation: obs, level: "x", reason: "r" }),
    w.ct.attributionFacts(w.pub.get(CASE, 1)), w.ct.attributionStatements(CASE, 1, proj), w.ct.attributionInForce(CASE, 1, obs),
    w.ct.caseRelation(F),
  ];
  w.sign(CASE, 1);
  outward.push(w.ct.caseRelation(F), w.ct.attributionStatedFor(obs));
  w.finding(F, "revised");
  outward.push(w.op("caseflags", {}), w.ct.caseTensions({}), w.ct.caseTensions({ project: proj }),
               w.ct.observationsNamingAuthor([obs, F]), world({ provider: false }).ct.caseTensions({}));
  return { w, proj, obs, outward };
}

test("R8 no answer, document or row this module serves composes a case-level strength: no answer carries a strength or grade", () => {
  const { w, outward } = busy();
  assert.equal(w.count("case_revision_flags"), 1, "the flag answer is exercised");
  assert.ok(outward[outward.length - 4].cases[0].tensions.length, "the tensions answer is exercised");
  const keys = new Set();
  const walk = (v) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { keys.add(k); walk(x); } };
  walk(outward);
  for (const k of ["strength", "grade", "case_strength", "strengths", "grades"]) assert.equal(keys.has(k), false, `no ${k}`);
  /* the rows it writes carry none either */
  for (const t of CASE_TENSIONS_TABLES)
    for (const c of w.rows(`PRAGMA table_info(${t.name})`)) assert.equal(/strength|grade/.test(c.name), false, `${t.name}.${c.name}`);
});

test("R9 this module's table holds exactly C-92.1–.9 and C-92.13, moved with their numbers, codes and translations unchanged, each raised by this module's act", () => {
  const tables = Object.entries(MODULE).filter(([, v]) => v && typeof v === "object" && !Array.isArray(v)
    && Object.values(v).some((r) => r && typeof r.check === "string"));
  assert.deepEqual(tables.map(([k]) => k), ["ATTRIBUTION_ACT_CHECKS"], "one table, and no other row held here");
  const rows = Object.entries(ATTRIBUTION_ACT_CHECKS).map(([code, r]) => ({ code, check: r.check, translation: r.translation }));
  assert.deepEqual(rows.map((r) => [r.check, r.code]), [
    ["C-92.1", "ATTRIBUTION_NOT_A_MEMBER"], ["C-92.2", "ATTRIBUTION_NO_LEVEL"], ["C-92.3", "ATTRIBUTION_LEVEL_UNKNOWN"],
    ["C-92.4", "ATTRIBUTION_NOT_AN_OBSERVATION"], ["C-92.5", "ATTRIBUTION_NOT_THE_AUTHOR"], ["C-92.6", "ATTRIBUTION_AUTHOR_NOT_ACTIVE"],
    ["C-92.7", "ATTRIBUTION_NOT_REACHED"], ["C-92.8", "ATTRIBUTION_EDITION_RATIFIED"], ["C-92.9", "ATTRIBUTION_NAME_NO_HANDLE"],
    ["C-92.13", "ATTRIBUTION_NO_REASON"]]);
  /* the translations exactly as publication's table held them at the copy (tranche/T33 @ f3c5790), by their digest */
  const digest = createHash("sha256").update(JSON.stringify(rows)).digest("hex");
  assert.equal(digest, TRANSLATIONS_AT_COPY, "a translation changed: that is a row change, which moves CATALOG_VERSION");
  for (const { code, check, translation } of rows) {
    assert.ok(translation.length > 40, `${code} has its sentence`);
    assert.match(ATTRIBUTION_ACT_CHECKS[code].where, /^src\/case-tensions\/index\.mjs attributeObservation > is-attribute-(act|author|edition)$/);
    assert.deepEqual(rowOf(code), { code, check, translation });
  }
  assert.throws(() => rowOf("SOURCE_CONSENT_WITHDRAWN"), /no row with a canned translation/, "publication's C-122 rows stay there");
  assert.throws(() => rowOf("ATTRIBUTION_UNCHOSEN"), /no row with a canned translation/, "C-92.10–.12 are ratification's");
});
/* sha256 of the ten rows `{code, check, translation}` in table order, as publication held them at the copy. */
const TRANSLATIONS_AT_COPY = "7073162639ab78ac35b926d374937a9fa804f46a124097aa68beed912afaac13";

test("R10 the case flags and the attribution choices are declared to record-core as publication declared them: flags and observation attributions cleared with their bundle, capture attributions by the whole-store purge only", () => {
  const { w, obs } = busy();
  assert.deepEqual(w.ct.purgeDeclaration, { ok: true });
  assert.equal(caseTensionsOf(w.host), w.ct, "one instance per host (K61)");
  const declared = w.record.declaredTables().filter((d) => d.module === "case-tensions");
  assert.deepEqual(declared.map((d) => [d.name, d.keys, d.purge, d.expunge, d.export, d.sight, d.derive, d.version_chain]), [
    ["case_revision_flags", ["bundle_id"], "clear", "none", "admin-only", "bundle", "stored", false],
    ["observation_attributions", ["bundle_id"], "clear", "none", "admin-only", "bundle", "stored", false],
    ["capture_attributions", [], "clear", "none", "admin-only", "group", "stored", false]]);
  for (const t of ["case_revision_flags", "observation_attributions", "capture_attributions"]) {
    assert.equal(caseTensionsOwns(t), true);
    assert.equal(w.record.declarePurge(`probe-${t}`, [t]).reason, "TABLE_DECLARED", `${t} is held under this module's name`);
  }
  assert.equal(caseTensionsOwns({ name: "case_documents" }), false, "publication's");
  /* another bundle's purge touches nothing here */
  w.finding("INQ-2026-0099");
  const kept = w.snapshot(["case_revision_flags", "observation_attributions", "capture_attributions"]);
  w.record.purge({ bundleId: "INQ-2026-0099" });
  assert.deepEqual(w.snapshot(["case_revision_flags", "observation_attributions", "capture_attributions"]), kept);
  /* one bundle's rows: its flags; the observation's attributions */
  assert.deepEqual([w.count("case_revision_flags"), w.count("observation_attributions"), w.count("capture_attributions")], [1, 1, 1]);
  w.record.purge({ bundleId: F });
  assert.deepEqual([w.count("case_revision_flags"), w.count("observation_attributions"), w.count("capture_attributions")], [0, 1, 1]);
  w.record.purge({ bundleId: obs });
  assert.deepEqual([w.count("observation_attributions"), w.count("capture_attributions")], [0, 1], "no bundle names a capture");
  w.record.purge({});
  assert.equal(w.count("capture_attributions"), 0, "the whole-store purge clears them");
});

test("R11 no place is named in this module's behaviour or outward text", () => {
  const { outward } = busy();
  const text = JSON.stringify([ATTRIBUTION_ACT_CHECKS, outward]);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(text.includes(place), false, `names ${place}`);
});
