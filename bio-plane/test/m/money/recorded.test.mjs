/* Who recorded a money fact from a passage, at money's interface: R24 (T36-16; N715, DEC-164 (4)), in events R49's
   shape. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, sha, MACHINE, ANN, BOB, OUTSIDER } from "./fixture.mjs";

const page = (n) => ({ kind: "pdf-page", page: n });
const KEYS = ["module", "record", "kind", "field", "extent", "relation", "by", "at", "withdrawn"].sort();

test("R24 answers events R49's shape over the facts whose source is an extent of the capture: kind money_fact, field source, by, at and withdrawn", () => {
  const s = seeded();
  const a = s.rec({ source: { capture_sha: s.cap, extent: page(3) } });
  const b = s.rec({ source: { capture_sha: s.cap, extent: page(1) }, by: BOB });
  const found = s.rec({ source: { kind: "money", origin: "search", capture_sha: s.cap, extent: page(3), words: "paid" } });
  s.rec({ source: { fact: a } });
  s.m.withdrawFact({ factId: b, reason: "misread", by: ANN });
  const r = s.m.recordedBy({ captureSha: s.cap, viewer: ANN });
  assert.deepEqual(Object.keys(r).sort(), ["capture_sha", "items", "module", "ok", "truncated"]);
  assert.deepEqual([r.ok, r.module, r.capture_sha, r.truncated], [true, "money", s.cap, false]);
  for (const i of r.items) assert.deepEqual(Object.keys(i).sort(), KEYS);
  assert.deepEqual(r.items.map((i) => [i.record, i.kind, i.field, i.extent, i.relation, i.by, i.withdrawn]), [
    [b, "money_fact", "source", { kind: "pdf-page", page: 1, rect: null }, null, BOB, true],
    ...[a, found].sort().map((id) => [id, "money_fact", "source", { kind: "pdf-page", page: 3, rect: null }, null, ANN, false]),
  ], "in canonical extent order, then record; a fact on a fact is no item; the found passage named with its member");
  assert.equal(r.items[0].at, s.m.readFact({ factId: b, viewer: ANN }).fact.at);
});

test("R24 a machine's table-row fact is named class:<cls>, its extent read as the document; the extent filter answers same, narrower or wider", () => {
  const s = seeded();
  s.bindings.set("BND-1", { adopted: ANN, table: "TBL-payments", roles: {}, capture_sha: s.cap });
  const machine = s.m.recordFact(s.fact({ by: MACHINE, method: "table_binding", source: { table: "TBL-payments", row: 4, binding: "BND-1" } })).fact_id;
  const p3 = s.rec({ source: { capture_sha: s.cap, extent: page(3) } });
  s.rec({ source: { capture_sha: s.cap, extent: page(5) } });
  const all = s.m.recordedBy({ captureSha: s.cap, viewer: ANN }).items;
  const m = all.find((i) => i.record === machine);
  assert.deepEqual([m.by, m.extent], [MACHINE, { kind: "document" }]);
  const on3 = s.m.recordedBy({ captureSha: s.cap, extent: page(3), viewer: ANN }).items;
  assert.deepEqual(on3.map((i) => [i.record, i.relation]).sort(), [[machine, "wider"], [p3, "same"]].sort());
  const whole = s.m.recordedBy({ captureSha: s.cap, extent: { kind: "document" }, viewer: ANN }).items;
  assert.equal(whole.length, 3);
  assert.equal(whole.find((i) => i.record === p3).relation, "narrower");
});

test("R24 sight is R21's: a hidden fact is neither answered nor counted, and a capture not held or not visible answers no items", () => {
  const s = seeded();
  s.project("PROJ-1", "bob");
  const hidden = s.held("INFO-H", sha("hidden"), { project: "PROJ-1" });
  const h = s.rec({ source: { capture_sha: hidden, extent: page(1) }, by: BOB });
  assert.deepEqual(s.m.recordedBy({ captureSha: hidden, viewer: BOB }).items.map((i) => i.record), [h]);
  assert.deepEqual(s.m.recordedBy({ captureSha: hidden, viewer: OUTSIDER }), { ok: true, module: "money", capture_sha: hidden, items: [], truncated: false });
  assert.deepEqual(s.m.recordedBy({ captureSha: sha("never held"), viewer: ANN }).items, []);
  // K2114: a viewer membership refuses is no VIEWER_MISSING: it sees nothing
  assert.deepEqual(s.m.recordedBy({ captureSha: s.cap, viewer: "not a member" }).items, []);
});

test("R24 limit clamped 1–500 (default 100) with truncated; VIEWER_MISSING and EXTENT_MALFORMED in events R49's refusal shape, NO_SHA; it writes nothing and never throws", () => {
  const s = seeded();
  for (let i = 0; i < 3; i++) s.rec({ source: { capture_sha: s.cap, extent: page(i + 1) } });
  const one = s.m.recordedBy({ captureSha: s.cap, limit: 1, viewer: ANN });
  assert.deepEqual([one.items.length, one.truncated], [1, true]);
  assert.deepEqual([s.m.recordedBy({ captureSha: s.cap, limit: 0, viewer: ANN }).items.length, s.m.recordedBy({ captureSha: s.cap, limit: 3, viewer: ANN }).truncated], [1, false]);
  assert.equal(s.m.recordedBy({ captureSha: s.cap, limit: 9999, viewer: ANN }).items.length, 3);
  const before = s.one(`SELECT count(*) AS n FROM money_facts`).n;
  for (const viewer of [undefined, null, ""]) {
    const r = s.m.recordedBy({ captureSha: s.cap, viewer });
    assert.deepEqual(Object.keys(r).sort(), ["code", "ok", "reason", "refused", "why"], "events R49's refusal shape (K2116)");
    assert.deepEqual([r.ok, r.refused, r.code, r.reason], [false, "VIEWER_MISSING", "VIEWER_MISSING", "VIEWER_MISSING"]);
  }
  assert.equal(s.m.recordedBy({ captureSha: "", viewer: ANN }).reason, "NO_SHA");
  for (const bad of [{ kind: "bogus" }, "page 3", 3, { page: 3 }]) {
    const r = s.m.recordedBy({ captureSha: s.cap, extent: bad, viewer: ANN });
    assert.deepEqual(Object.keys(r).sort(), ["code", "ok", "reason", "refused", "why"]);
    assert.equal(r.refused, "EXTENT_MALFORMED", JSON.stringify(bad));
  }
  assert.doesNotThrow(() => s.m.recordedBy());
  assert.equal(s.one(`SELECT count(*) AS n FROM money_facts`).n, before);
});
