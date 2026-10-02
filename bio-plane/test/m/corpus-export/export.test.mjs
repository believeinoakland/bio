/* corpus-export — the verified export (R1) and its append-only log (R2), Membership v2 §8. Moved from
   `test/m/publication/export.test.mjs` (R18 → R1, R19 → R2) with every assertion; its methods are driven directly (its
   route arms, R6, are `ops.test.mjs`'s). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW } from "./fixture.mjs";
import { EXPORT_LOG_LIMIT_DEFAULT, EXPORT_LOG_LIMIT_MAX, EXPORT_NOTE_MAX } from "../../../src/corpus-export/index.mjs";

test("R1 exportManifest answers every bundle with its files, promotions in write order, snapshots and references, and the register, with counts, and logs itself in the same act", () => {
  const w = world();
  w.member("olive");
  w.doc("INFO-2026-0001-minutes", ["the text of INFO-2026-0001-minutes"]);
  w.inquiry("INQ-2026-0001", { cites: ["INFO-2026-0001-minutes"] });
  w.inquiry("INQ-2026-0001", { question: "Revised?", cites: ["INFO-2026-0001-minutes"] });
  const x = w.ce.exportManifest({ note: "n".repeat(400) });
  assert.equal(x.ok, true);
  assert.equal(x.scope, "working-corpus");
  const ids = w.rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`).map((r) => r.bundle_id);
  assert.deepEqual(x.bundles.map((b) => b.bundle_id), ids, "every bundle, in id order");
  const inq = x.bundles.find((b) => b.bundle_id === "INQ-2026-0001");
  assert.deepEqual(inq.files.map((f) => Object.keys(f).sort()), [["blobSha", "bytes", "inline", "path", "sha256"]]);
  assert.equal(inq.files[0].inline, true);
  assert.equal(inq.promotions.length, 2, "both promotions");
  assert.ok(inq.promotions[0].created <= inq.promotions[1].created);
  assert.equal(inq.promotions[1].base, w.rows(`SELECT sha256 FROM history WHERE bundle_id='INQ-2026-0001'`)[0].sha256,
               "the base links let a receiver re-derive the chain");
  assert.equal(inq.snapshots.length, 1);
  assert.deepEqual(inq.refs.map((r) => [r.target_id, r.kind]), [["INFO-2026-0001-minutes", "cites"]]);
  assert.deepEqual(x.register.map((r) => r.bundle_id), ["INFO-2026-0001-minutes"]);
  const files = x.bundles.reduce((n, b) => n + b.files.length, 0);
  assert.deepEqual(x.counts, { bundles: ids.length, files });
  const log = w.rows(`SELECT * FROM export_log`);
  assert.equal(log.length, 1);
  assert.deepEqual([log[0].scope, log[0].bundles, log[0].files, log[0].note.length], ["working-corpus", ids.length, files, EXPORT_NOTE_MAX]);
  assert.equal(EXPORT_NOTE_MAX, 280);
  assert.match(x.recorded, /append-only export log/);
  assert.match(x.verify, /Re-derive/);
  assert.match(x.verify, /every record its history chain and base links/, "K899 (1): the text a member reads says record");
  for (const said of [x.recorded, x.verify]) assert.doesNotMatch(said, /bundle/i, "no member-read sentence says bundle");
  w.ce.exportManifest({});
  assert.equal(w.rows(`SELECT note FROM export_log ORDER BY seq`)[1].note, null, "no note is stored as none");
});

test("R2 exportLog answers the newest rows first, limit clamped to [1, 1000] and 200 by default, with truncated", () => {
  const w = world();
  for (let i = 0; i < 3; i++)
    w.st.sql.exec(`INSERT INTO export_log (at, scope, bundles, files, note) VALUES (?, 'working-corpus', ?, 0, NULL)`, NOW, i);
  const all = w.ce.exportLog({});
  assert.deepEqual(all.exports.map((e) => e.bundles), [2, 1, 0]);
  assert.deepEqual([all.limit, all.truncated], [EXPORT_LOG_LIMIT_DEFAULT, false]);
  assert.deepEqual([EXPORT_LOG_LIMIT_DEFAULT, EXPORT_LOG_LIMIT_MAX], [200, 1000]);
  const two = w.ce.exportLog({ limit: 2 });
  assert.deepEqual([two.exports.map((e) => e.bundles), two.limit, two.truncated], [[2, 1], 2, true]);
  for (const [asked, got] of [[0, 200], [-5, 1], [5000, 1000], ["x", 200], [2.9, 2]])
    assert.equal(w.ce.exportLog({ limit: asked }).limit, got, `limit ${asked}`);
  assert.deepEqual(Object.keys(all.exports[0]).sort(), ["at", "bundles", "files", "note", "scope", "seq"]);
});
