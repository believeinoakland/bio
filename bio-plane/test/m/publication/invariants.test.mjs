/* publication — the invariants not driven elsewhere: purge (R31), the check rows that moved here (R33), no place named
   (R34), and the two ids that do not hold yet (R30, R32). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, SIG, NOW } from "./fixture.mjs";
import * as CATALOGUE from "../../../checks/bio-checks.mjs";
import { CASE_RESOLUTION_CHECKS, PUBLISHED_STORE_CHECKS, PUBLISHED_READ_CHECKS, ATTRIBUTION_ACT_CHECKS,
         rowOf } from "../../../src/publication/checks.mjs";
import { PUBLICATION_TABLES, PUBLICATION_EXEMPT, publicationOwns } from "../../../src/publication/index.mjs";
import { migratePublication } from "../../../src/publication/schema.mjs";
import { storage } from "./fixture.mjs";

const F = "INQ-2026-0001";
const MINE = { ...CASE_RESOLUTION_CHECKS, ...PUBLISHED_STORE_CHECKS, ...PUBLISHED_READ_CHECKS, ...ATTRIBUTION_ACT_CHECKS };

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
  w.op("export", {});
  assert.equal(w.count("case_revision_flags"), 1);
  const exempt = w.snapshot(PUBLICATION_EXEMPT);
  /* one bundle's rows: its flags, its attributions and the published graph's edges touching it */
  w.record.purge({ bundleId: F });
  assert.equal(w.count("case_revision_flags"), 0);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM published_edges WHERE from_bundle=?`, F).n, 0);
  w.record.purge({ bundleId: obs });
  assert.equal(w.count("observation_attributions"), 0);
  /* the whole store: unsigned documents and their exclusions go, the signed one and every published row stay */
  w.record.purge({});
  assert.deepEqual(w.rows(`SELECT edition FROM case_documents`), [{ edition: 1 }]);
  assert.deepEqual(w.rows(`SELECT DISTINCT edition FROM case_exclusions`), [{ edition: 1 }]);
  assert.deepEqual(w.snapshot(PUBLICATION_EXEMPT), exempt, "published_* , cases and export_log are never cleared");
  assert.deepEqual([...PUBLICATION_EXEMPT].sort(), ["cases", "export_log", "published_bundles", "published_case_members",
                                                    "published_cases", "published_shas"]);
  assert.deepEqual(PUBLICATION_TABLES.map((t) => t.name || t).sort(),
                   ["case_documents", "case_exclusions", "case_revision_flags", "observation_attributions", "published_edges"]);
  assert.equal(publicationOwns("published_edges"), true);
  assert.equal(publicationOwns({ name: "export_log" }), true);
  assert.equal(publicationOwns("statement_acknowledgements"), false, "case-authoring's");
});

test("R33 each check moved here with its id, code and translation, is held nowhere else, and names this module's site", () => {
  const ids = Object.values(MINE).map((r) => r.check).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  assert.deepEqual(ids, ["C-44.2", "C-68.5", "C-92.1", "C-92.2", "C-92.3", "C-92.4", "C-92.5", "C-92.6", "C-92.7", "C-92.8",
                         "C-92.9", "C-98.1", "C-98.2", "C-98.3", "C-98.4", "C-98.5", "C-98.6", "C-98.7", "C-98.8", "C-98.9"]);
  for (const [code, row] of Object.entries(MINE)) {
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, `${code} has its sentence`);
    assert.match(row.where, /^src\/(publication\/(index|worker)\.mjs|container\.mjs) /, `${code}'s site is this module's`);
    assert.deepEqual(rowOf(code), { code, check: row.check, translation: row.translation });
    for (const [family, rows] of Object.entries(CATALOGUE))
      if (/_CHECKS$/.test(family) && rows && typeof rows === "object") {
        assert.equal(Object.prototype.hasOwnProperty.call(rows, code), false, `${code} is not also in the catalogue's ${family}`);
        assert.ok(!Object.values(rows).some((r) => r && r.check === row.check), `${row.check} is not also in ${family}`);
      }
  }
  /* the families the catalogue keeps keep the rest: C-44.1, C-68.1–.4 */
  assert.equal(CATALOGUE.CASE_DERIVATION_CHECKS.CASE_IDENTITY_AMBIGUOUS.check, "C-44.1");
  assert.equal(CATALOGUE.INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED.check, "C-68.1");
  /* negative control: a code with no row is a defect, and says so loudly rather than shipping no sentence */
  assert.throws(() => rowOf("NOT_A_CODE"), /no row with a canned translation/);
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
  const outward = JSON.stringify([MINE, w.op("publishedcase", { id: "CASE-2026-0001" }), w.op("publishedmanifest"),
    w.op("publishedlist"), w.op("caseflags", {}), w.op("export", {}), w.op("exportlog", {}), w.op("publishedcase", { id: "X" }),
    w.op("casedocument", { case: "CASE-2026-0002", edition: 1 }), w.p.reviewProvider().deadAnswer(),
    w.p.publishedCase({ id: "CASE-2026-0001" }).evidence_package]);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(outward.includes(place), false, `names ${place}`);
});

test("R24 an existing store migrates: every ratified row of the old, edition-less shape survives as edition 1, and nothing is invented", () => {
  const st = storage();
  st.db.exec(`CREATE TABLE published_bundles (bundle_id TEXT PRIMARY KEY, bundle_sha TEXT NOT NULL, ratified_at TEXT NOT NULL,
    attestor_key TEXT NOT NULL, attestor_member TEXT, gate_version TEXT NOT NULL, sig_armored TEXT NOT NULL)`);
  st.sql.exec(`INSERT INTO published_bundles VALUES ('INQ-2026-0001-legacy','legacysha','2026-01-01T00:00:00Z','LEGACYKEY','bob','plane-gate/0.9','sig')`);
  migratePublication(st.sql);
  migratePublication(st.sql);   /* every boot: idempotent */
  const rows = st.sql.exec(`SELECT * FROM published_bundles`);
  assert.equal(rows.length, 1);
  assert.deepEqual([rows[0].edition, rows[0].bundle_sha, rows[0].attestor_member, rows[0].gate_version, rows[0].sig_armored],
                   [1, "legacysha", "bob", "plane-gate/0.9", "sig"]);
  assert.deepEqual([rows[0].strength, rows[0].required, rows[0].delivered_by], [null, null, null], "nothing invented");
  assert.equal(st.sql.exec(`SELECT name FROM sqlite_master WHERE name='published_bundles_preeditions'`).length, 0);
  assert.ok(st.sql.exec(`PRAGMA table_info(published_case_members)`).some((c) => c.name === "version_sha"));
});

test.todo("R30 a published rendering is verified by pixels_sha256 over its normalised samples — NOT YET MET (D-246): nothing in the plane publishes a rendering yet (no `kind: rendering` part is written to published_shas or a container), so there is no rendering to carry the pixel hash; it joins when the rendering path does");

test.todo("R32 an import of an export re-derives every hash, history chain and base link and byte-compares every capture — NOT YET MET (K102): the verifying import has no tranche yet; BOB chooses it");
