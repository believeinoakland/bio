/* case-carriage — its invariants: the two tables of held materials declared exempt to record-core's purge and never
   rewritten (R6, was `publication` R31's clause; K1316), and no place named (R7, copied from `publication` R34). Driven
   at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseFm, caseText, sha, V, NOW } from "./fixture.mjs";
import { caseCarriageOf, CASE_CARRIAGE_EXEMPT } from "../../../src/case-carriage/index.mjs";

const DOC = "INFO-2026-0001-minutes", CASE = "CASE-2026-0001";
const KEPT = ["published_material_texts", "published_case_materials"];
const row = (ref, s, kind = "document") => ({ ref, kind, sha: s, text_sha: null, origin: null, archived_copy: null,
                                              included: true, rests_under: "load_bearing" });

test("R6 published_material_texts and published_case_materials are declared exempt to record-core's purge: a record's purge and the whole-store purge leave them byte-identical", () => {
  const w = world();
  assert.deepEqual(w.cc.purgeDeclaration, { ok: true }, "declared at creation");
  assert.deepEqual([...CASE_CARRIAGE_EXEMPT], KEPT);
  assert.equal(caseCarriageOf(w.host), w.cc, "one instance per host (K61)");
  assert.ok(KEPT.every((t) => w.tables().includes(t)), "created at creation");
  /* record-core holds the declaration under this module's name: another declaring either table is refused */
  for (const t of KEPT)
    assert.deepEqual(w.record.declarePurge(`probe-${t}`, [t]),
                     { ok: false, reason: "TABLE_DECLARED", table: t, module: `probe-${t}`, declaredBy: "case-carriage" });
  const docSha = w.doc(DOC);
  const obs = w.observe("ann");
  w.cc.holdMaterials(caseFm({ materials: [row(DOC, docSha), row(obs.id, obs.sha, "observation")] }), { caseId: CASE, edition: 1, at: NOW });
  const kept = w.snapshot();
  assert.equal(w.count("published_material_texts"), 2);
  assert.equal(w.count("published_case_materials"), 2);
  w.record.purge({ bundleId: DOC });
  w.record.purge({ bundleId: obs.id });
  assert.equal(w.record.head(DOC), null, "the record's own rows went");
  for (const t of KEPT) assert.equal(w.snapshot()[t], kept[t], `a record's purge leaves ${t}`);
  w.record.purge({});
  assert.equal(w.count("bundles"), 0, "the whole store's records went");
  for (const t of KEPT) assert.equal(w.snapshot()[t], kept[t], `the whole-store purge leaves ${t}`);
  /* the texts stay readable after their records are gone */
  assert.equal(w.cc.publishedMaterialText(docSha).found, true);
  /* creation again over the same storage keeps the rows: CREATE TABLE IF NOT EXISTS */
  w.cc.migrate();
  for (const t of KEPT) assert.equal(w.snapshot()[t], kept[t]);
});

test("R6 content-addressed and append-only: a held text or an edition's list is never rewritten or removed by a later hold", () => {
  const w = world();
  const docSha = w.doc(DOC);
  w.cc.holdMaterials(caseFm({ materials: [row(DOC, docSha)] }), { caseId: CASE, edition: 1, at: NOW });
  const kept = w.snapshot();
  const annex = w.doc("INFO-2026-0002-annex");
  for (const [edition, at, materials] of [[1, "2026-10-01T00:00:00Z", [row("INFO-2026-0002-annex", annex)]],
                                          [1, "2026-10-01T00:00:00Z", []], [2, "2026-10-02T00:00:00Z", [row(DOC, docSha)]]])
    w.cc.holdMaterials(caseFm({ materials }), { caseId: CASE, edition, at });
  const now = w.snapshot();
  const texts = JSON.parse(now.published_material_texts), lists = JSON.parse(now.published_case_materials);
  for (const r of JSON.parse(kept.published_material_texts)) assert.deepEqual(texts.find((x) => x.sha256 === r.sha256), r, "not rewritten");
  for (const r of JSON.parse(kept.published_case_materials))
    assert.deepEqual(lists.find((x) => x.case_id === r.case_id && x.edition === r.edition && x.ord === r.ord), r, "not rewritten");
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 1), [{ sha: docSha, held: "inline" }]);
});

test("R7 no place is named in this module's behaviour or outward text", () => {
  const w = world();
  w.member("olive");
  const docSha = w.doc(DOC);
  const big = sha("evidence only");
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, 'snapshots/big.pdf', 'binary', 9, ?)`,
                big, DOC, NOW);
  const held = w.cc.holdMaterials(caseFm({ materials: [row(DOC, docSha), row(DOC, big), row(DOC, null), row("INFO-2026-0404-x", sha("x")),
                                                        row("INFO-2026-0405-y", sha("y"), "observation")] }), { caseId: CASE, edition: 1, at: NOW });
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`,
                JSON.stringify({ documents: [{ capture: { sha256: docSha }, timestamp: { token_file: "attestations/none.tsr" } }] }), DOC);
  const tokens = w.cc.holdMaterials(caseFm({ materials: [row(DOC, docSha)] }), { caseId: CASE, edition: 2, at: NOW });
  const ref = `imported:${"a".repeat(64)}/INQ-2026-0042-x`;
  w.importer({ finding: () => null, openFlags: () => null });
  const aw = w.cc.acceptedWorkLapsed(caseFm({ acceptedWork: [{ member: "INQ-2026-0001", leg_of: "INQ-2026-0001", ref, group: "g",
    case: "CASE-2026-0042", edition: 2, finding: "INQ-2026-0042-x", manifest_sha: "b".repeat(64), pair: {}, result: "recreated",
    gaps: [], accepted_by: V("olive"), accepted_at: NOW, reason: "r" }] }), "olive");
  const cap = sha("knocked");
  w.knock(cap);
  const lapsed = w.cc.sourcesLapsed(caseText({ sources: [{ capture: cap, stated: "name: someone", basis: "consent" }] }), NOW);
  assert.ok(held.unheld.length >= 3 && tokens.unheld.length && aw && lapsed.length, "every outward answer is exercised");
  const outward = JSON.stringify([held, tokens, aw, lapsed, w.cc.heldMaterialsOf(CASE, 1), w.cc.publishedMaterialText(docSha),
                                  w.cc.publishedMaterialText(big), w.cc.purgeDeclaration]);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(outward.includes(place), false, `names ${place}`);
});
