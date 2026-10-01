/* extraction, the testimony path's index (R65): registered once in `provenance`'s testimony slot (provenance R52) as
   a projection that runs R61's `indexTestimony` over the path's own fields, inside the promotion's transaction. The
   slot is the real provenance's, run as the composition root runs it (where legacy-store's step runs it today). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, storage } from "./fixture.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { provenanceOf, TESTIMONY_PATH } from "../../../src/provenance/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";

const stepRecorder = () => ({ registerStep: () => ({ ok: true }) });
const withProvenance = () => {
  let prov = null;
  const f = fresh({ provenance: (ctx, record, membership) =>
    (prov = provenanceOf(ctx, { record, membership, promotion: stepRecorder() })) });
  return { ...f, prov };
};
const path = (o = {}) => ({ captureSha: "c".repeat(64), words: "The clerk read the item twice.", author: "member:ruth",
                            observedAt: "2026-09-20", recordedAt: "2026-09-21T00:00:00Z", ...o });
const promotionOn = (bundleId, t) => ({ bundleId, pkg: { [TESTIMONY_PATH]: t } });

test("R65: the projection is registered once in provenance's testimony slot; a second registration is refused by provenance and registers nothing", () => {
  const f = withProvenance();
  assert.equal(f.x.joinTestimony(f.prov), false);
  const r = f.prov.onTestimony("extraction", { project: () => null });
  assert.deepEqual([r.ok, r.reason], [false, "LISTENER_DECLARED"]);
  /* a provenance with no seam is left alone */
  assert.equal(fresh().x.joinTestimony({}), false);
});

test("R65 R61: the slot's projection indexes the words as the capture's own text inside the promotion's transaction and answers {indexed}, R61's written", () => {
  const f = withProvenance();
  const t = path();
  const out = f.core.transact(() => f.prov.testimonySlot().project(promotionOn("INFO-2026-0001-observation", t)));
  assert.deepEqual(out, { testimony: { indexed: 1 } });
  assert.deepEqual(f.rows(`SELECT bundle_id, extent_kind, seq, text, chain_kind FROM capture_text WHERE capture_sha=?`, t.captureSha)
                     .map((r) => ({ ...r })),
                   [{ bundle_id: "INFO-2026-0001-observation", extent_kind: "document", seq: 0, text: t.words, chain_kind: "undetermined" }]);
  /* no reading, history, reference or text-source row: no reader ran over the words */
  for (const tb of ["readings", "reading_history", "reading_refs", "reading_text_source"])
    assert.equal(f.one(`SELECT count(*) c FROM ${tb}`).c, 0, tb);
  /* words with no glyph index nothing */
  const blank = f.core.transact(() => f.prov.testimonySlot().project(promotionOn("INFO-2026-0002-observation", path({ captureSha: "d".repeat(64), words: "  " }))));
  assert.deepEqual(blank, { testimony: { indexed: 0 } });
  /* a promotion without the testimony path runs nothing */
  assert.equal(f.prov.testimonySlot().project({ bundleId: "X", pkg: {} }), null);
});

test("R65 R62: the index notice runs with the path's author; a notice that throws rolls the whole promotion back", () => {
  const f = withProvenance();
  const seen = [];
  f.x.onIndexed("observation-log", (e) => { seen.push(e); if (e.author === "member:boom") throw new Error("no index row"); });
  const t = path();
  f.core.transact(() => f.prov.testimonySlot().project(promotionOn("INFO-1", t)));
  assert.deepEqual(seen.map((e) => [e.bundleId, e.captureSha, e.author, e.container, e.indexed.written]),
                   [["INFO-1", t.captureSha, "member:ruth", "document", 1]]);
  const bad = path({ captureSha: "e".repeat(64), author: "member:boom" });
  assert.throws(() => f.core.transact(() => {
    f.s.sql.exec(`INSERT INTO settings (name,value,set_by,set_at) VALUES ('promotion-ran','1','t','t')`);
    return f.prov.testimonySlot().project(promotionOn("INFO-2", bad));
  }), /no index row/);
  assert.equal(f.one(`SELECT count(*) c FROM capture_text WHERE capture_sha=?`, bad.captureSha).c, 0);
  assert.equal(f.one(`SELECT count(*) c FROM settings WHERE name='promotion-ran'`).c, 0);
});

test("R65: on a Durable Object, extractionOf registers the projection with the object's provenance once at start; a test's stand-in registers none", () => {
  const s = storage();
  const host = { storage: s, blockConcurrencyWhile: async (fn) => fn(), waitUntil: () => {} };
  const record = recordOf(host);
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const prov = provenanceOf(host, { record, membership, promotion: stepRecorder() });
  const x = extractionOf(host, { calibration: { onCalibration: () => ({ ok: true }) } });
  x.migrate();
  assert.equal(extractionOf(host), x);
  assert.deepEqual(prov.onTestimony("extraction", { project: () => null }).reason, "LISTENER_DECLARED");
  const out = record.transact(() => prov.testimonySlot().project(promotionOn("INFO-9", path())));
  assert.deepEqual(out, { testimony: { indexed: 1 } });
  /* the stand-in: no provenance composed */
  const s2 = storage();
  const host2 = { storage: s2 };
  const r2 = recordOf(host2); r2.migrate();
  membershipOf(host2, { record: r2 }).migrate();
  const prov2 = provenanceOf(host2, { record: r2, membership: membershipOf(host2), promotion: stepRecorder() });
  extractionOf(host2, { calibration: { onCalibration: () => ({ ok: true }) } });
  assert.deepEqual(prov2.onTestimony("extraction", { project: () => null }), { ok: true, module: "extraction" });
});
