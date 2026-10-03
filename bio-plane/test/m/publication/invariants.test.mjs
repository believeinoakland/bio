/* publication — the invariants not driven elsewhere: purge (R31) beside corpus-export's declaration (K1024), the check
   rows that moved here (R33), no place named (R34), and the id that does not hold yet (R30). The export and its log are
   corpus-export's, written here through it (its R1), never through this module (N483). Driven at the module's
   interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V, SIG, NOW } from "./fixture.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { corpusExportOf } from "../../../src/corpus-export/index.mjs";
import * as CHECKS from "../../../src/publication/checks.mjs";
import { ATTRIBUTION_ACT_CHECKS, CASE_SOURCES_CHECKS, rowOf } from "../../../src/publication/checks.mjs";
import { PUBLICATION_TABLES, PUBLICATION_EXEMPT, publicationOwns, publicationOps } from "../../../src/publication/index.mjs";
import { migratePublication } from "../../../src/publication/schema.mjs";
import { storage } from "./fixture.mjs";

const F = "INQ-2026-0001";
const MINE = { ...ATTRIBUTION_ACT_CHECKS, ...CASE_SOURCES_CHECKS };

test("R31 published bytes are exempt from purge; the derived and working tables are declared as the store declared them", () => {
  const w = world();
  w.member("olive"); w.member("ann");
  const proj = w.project("Parks", "olive");
  const obs = w.observe("ann");
  w.inquiry(F, { legs: [{ target: obs }] });
  const pin = w.head(F);
  const roles = [{ target: F, version_sha: pin }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, excluded: [{ target: obs }], attributions: [{ observation: obs }] });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  w.signFinding(F, { edges: [{ to: obs, kind: "cites", disclosure: "name" }] });
  w.prepare("CASE-2026-0001", 2, { project: proj, roles, excluded: [{ target: obs }] });
  w.st.sql.exec(`INSERT INTO observation_attributions (case_id, edition, bundle_id, level, chosen_by, chosen_at)
                 VALUES ('CASE-2026-0001', 2, ?, 'group', 'ann', ?)`, obs, NOW);
  w.inquiry(F, { question: "Revised?", legs: [{ target: obs }] });
  corpusExportOf(w.host).exportManifest({});
  assert.equal(w.count("case_revision_flags"), 1);
  const KEPT = [...PUBLICATION_EXEMPT, "export_log"];
  assert.equal(w.count("export_log"), 1);
  const exempt = w.snapshot(KEPT);
  /* one bundle's rows: its flags, its attributions and the published graph's edges touching it */
  /* a reference F holds privately to evidence not yet published (N256) is working material, purged with either end */
  w.doc("INFO-2026-0003-annex");
  w.record.transact(() => w.p.publishEdges(F, [{ to: "INFO-2026-0003-annex", kind: "cites", disclosure: "serve" }], NOW));
  assert.equal(w.count("published_held_references"), 1);
  w.record.purge({ bundleId: F });
  assert.equal(w.count("case_revision_flags"), 0);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM published_edges WHERE from_bundle=?`, F).n, 0);
  assert.equal(w.count("published_held_references"), 0);
  w.record.purge({ bundleId: obs });
  assert.equal(w.count("observation_attributions"), 0);
  /* the whole store: unsigned documents and their exclusions go, the signed one and every published row stay */
  w.record.purge({});
  assert.deepEqual(w.rows(`SELECT edition FROM case_documents`), [{ edition: 1 }]);
  assert.deepEqual(w.rows(`SELECT DISTINCT edition FROM case_exclusions`), [{ edition: 1 }]);
  assert.deepEqual(w.snapshot(KEPT), exempt, "published_*, cases and corpus-export's export_log are never cleared");
  assert.deepEqual([...PUBLICATION_EXEMPT].sort(), ["cases", "published_bundles", "published_case_members",
                                                    "published_cases", "published_material_texts", "published_shas"]);
  assert.deepEqual(PUBLICATION_TABLES.map((t) => t.name || t).sort(),
                   ["capture_attributions", "case_documents", "case_exclusions", "case_revision_flags",
                    "observation_attributions", "published_edges", "published_held_references"]);
  assert.equal(publicationOwns("published_edges"), true);
  assert.equal(publicationOwns({ name: "export_log" }), false, "corpus-export's since K1024");
  assert.equal(publicationOwns("statement_acknowledgements"), false, "case-authoring's");
});

/* A bare host: record-core alone, so a declaration can be made before corpus-export's on it. */
function bareHost() {
  const st = storage({ workerd: true });
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const host = { storage: st };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  return { host, st, record };
}

test("R31 (K1024) on one host publication's purge declaration and corpus-export's both answer ok: export_log is declared once, by corpus-export, and a whole-store purge leaves it and this module's exempt tables byte-identical", () => {
  const w = world();
  assert.deepEqual(w.p.purgeDeclaration, { ok: true });
  assert.equal(w.p.corpusExport, corpusExportOf(w.host), "created eagerly at this module's creation, one per host");
  assert.deepEqual(w.p.corpusExport.purgeDeclaration, { ok: true });
  assert.equal(w.count("export_log"), 0, "export_log exists at boot, before any export");
  corpusExportOf(w.host).exportManifest({ note: "kept" });
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES ('CASE-2026-0009', 'PROJ-1', ?)`, NOW);
  const kept = w.snapshot(["export_log", ...PUBLICATION_EXEMPT]);
  w.record.purge({});
  assert.deepEqual(w.snapshot(["export_log", ...PUBLICATION_EXEMPT]), kept);
  assert.equal(w.count("export_log"), 1);
  /* the same order on a bare host, with this module's exempt list as it is: both declarations answer ok */
  const ok = bareHost();
  assert.deepEqual(ok.record.declarePurge("publication", PUBLICATION_TABLES, { exempt: PUBLICATION_EXEMPT }), { ok: true });
  assert.deepEqual(corpusExportOf(ok.host, { record: ok.record }).purgeDeclaration, { ok: true });
  /* negative control: export_log restored to this module's exempt list, corpus-export's declaration is refused */
  const bad = bareHost();
  assert.deepEqual(bad.record.declarePurge("publication", PUBLICATION_TABLES, { exempt: [...PUBLICATION_EXEMPT, "export_log"] }),
                   { ok: true });
  const refused = corpusExportOf(bad.host, { record: bad.record }).purgeDeclaration;
  assert.deepEqual([refused.ok, refused.reason, refused.table, refused.declaredBy], [false, "TABLE_DECLARED", "export_log", "publication"]);
});

test("N483 N501 (K1119) this module answers no export: no op `export` or `exportlog`, no delegate, and no corpus-export constant re-exported; corpus-export is still created at boot", async () => {
  const w = world();
  const ops = Object.keys(publicationOps(w.p, new URL("http://do/x"), null));
  assert.deepEqual(ops.filter((k) => /export/i.test(k)), [], "no export op is this module's");
  assert.ok(ops.includes("caseflags") && ops.includes("casedocument"), "the map itself is still answered");
  for (const name of ["exportManifest", "exportLog"]) assert.equal(name in w.p, false, `${name}: no delegate`);
  assert.equal(w.p.corpusExport, corpusExportOf(w.host), "created at this module's creation, one per host");
  assert.equal(w.count("export_log"), 0, "export_log exists at boot");
  const pub = await import("../../../src/publication/index.mjs");
  const ce = await import("../../../src/corpus-export/index.mjs");
  /* every constant corpus-export exports is its alone (N501: the last re-export, its log's default page, retired) */
  const constants = Object.keys(ce).filter((k) => /^[A-Z][A-Z0-9_]*$/.test(k));
  assert.ok(constants.includes("EXPORT_LOG_LIMIT_DEFAULT") && constants.length >= 3, "the control: corpus-export's own constants");
  for (const name of constants) assert.equal(name in pub, false, `${name} is corpus-export's alone`);
});

test("R33 this module's table holds exactly C-92.1–.9, C-92.13 and C-122.1–.4, each with its code, sentence and its raiser's site here; C-44.2, C-68.5 and C-98 left it for public-read's (its R17)", () => {
  /* every table this file exports, not a sample: two, and every row in them is one of the fourteen */
  const tables = Object.entries(CHECKS).filter(([, v]) => v && typeof v === "object" && !Array.isArray(v)
    && Object.values(v).some((r) => r && typeof r.check === "string"));
  assert.deepEqual(tables.map(([k]) => k).sort(), ["ATTRIBUTION_ACT_CHECKS", "CASE_SOURCES_CHECKS"]);
  const ids = Object.values(MINE).map((r) => r.check).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  assert.deepEqual(ids, ["C-92.1", "C-92.2", "C-92.3", "C-92.4", "C-92.5", "C-92.6", "C-92.7", "C-92.8", "C-92.9", "C-92.13",
                         "C-122.1", "C-122.2", "C-122.3", "C-122.4"]);
  for (const [code, row] of Object.entries(MINE)) {
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, `${code} has its sentence`);
    assert.match(row.where, /^src\/publication\/index\.mjs \w+ > is-[a-z-]+$/, `${code}'s site is this module's`);
    assert.deepEqual(rowOf(code), { code, check: row.check, translation: row.translation });
  }
  /* the moved rows answer nothing here: a code with no row in this table is a defect, and says so loudly */
  for (const code of ["FINDING_IN_SEVERAL_CASES", "NO_PUBLISHED_STORE", "NO_PUBLISHED_PART", "OBJECT_MISSING", "NOT_A_CONTAINER",
                      "MANIFEST_UNREADABLE", "PART_MISSING", "DUPLICATE_PATH", "CONTAINER_TOO_LARGE", "NOT_PUBLISHED",
                      "CASE_DOCUMENT_UNSERVABLE", "NOT_A_CODE"])
    assert.throws(() => rowOf(code), /no row with a canned translation/, code);
  for (const id of ["C-44.2", "C-68.5", ...Array.from({ length: 9 }, (_, i) => `C-98.${i + 1}`)])
    assert.equal(tables.some(([, t]) => Object.values(t).some((r) => r.check === id)), false, `${id} is not held here`);
});

test("R34 no place is named in this module's behaviour or outward text", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  w.signFinding(F);
  const outward = JSON.stringify([MINE, w.p.caseEditionState("CASE-2026-0001", 1), w.op("publishedtargets", { ids: F }),
    w.op("caseflags", {}), w.op("excludedby", { id: F, viewer: V("olive") }),
    w.op("casedocument", { case: "CASE-2026-0001", edition: 1 }), w.op("casedocument", { case: "CASE-2026-0002", edition: 1 }),
    w.p.reviewProvider().deadAnswer(), w.p.publishedEditionsOf({ finding: F }), w.p.caseTensions({}),
    w.p.caseFlags({}).doctrine, w.op("attribute", {}, {}), w.op("attribute", { by: "olive" }, { level: "group" })]);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(outward.includes(place), false, `names ${place}`);
});

test("R24 an existing store migrates: every ratified row of the old, edition-less shape survives as edition 1, and nothing is invented", () => {
  const st = storage({ workerd: true });
  st.db.exec(`CREATE TABLE published_bundles (bundle_id TEXT PRIMARY KEY, bundle_sha TEXT NOT NULL, ratified_at TEXT NOT NULL,
    attestor_key TEXT NOT NULL, attestor_member TEXT, gate_version TEXT NOT NULL, sig_armored TEXT NOT NULL)`);
  st.sql.exec(`INSERT INTO published_bundles VALUES ('INQ-2026-0001-legacy','legacysha','2026-01-01T00:00:00Z','LEGACYKEY','bob','plane-gate/0.9','sig')`);
  migratePublication(st.sql);
  migratePublication(st.sql);   /* every boot: idempotent */
  const rows = st.sql.exec(`SELECT * FROM published_bundles`).toArray();
  assert.equal(rows.length, 1);
  assert.deepEqual([rows[0].edition, rows[0].bundle_sha, rows[0].attestor_member, rows[0].gate_version, rows[0].sig_armored],
                   [1, "legacysha", "bob", "plane-gate/0.9", "sig"]);
  assert.deepEqual([rows[0].strength, rows[0].required, rows[0].delivered_by], [null, null, null], "nothing invented");
  assert.equal(st.sql.exec(`SELECT name FROM sqlite_master WHERE name='published_bundles_preeditions'`).toArray().length, 0);
  assert.ok(st.sql.exec(`PRAGMA table_info(published_case_members)`).toArray().some((c) => c.name === "version_sha"));
});

test.todo("R30 a published rendering is verified by pixels_sha256 over its normalised samples — NOT YET MET (D-246): nothing in the plane publishes a rendering yet (no `kind: rendering` part is written to published_shas or a container), so there is no rendering to carry the pixel hash; it joins when the rendering path does");

