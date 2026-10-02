/* extraction: a member's authored observation indexed as its capture's own text (R61 `indexTestimony`) and the index
   notice it raises (R62 `onIndexed`), at the module's interface (N294, K337). The fixture answers workerd's cursor
   (K316). Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle } from "./fixture.mjs";
import { listenerRefusal, MODULE_ORDER } from "../../../src/membership/index.mjs";
import { CAPTURE_TEXT_UNIT_CAP } from "../../../src/extraction/index.mjs";
import { readingProvenance } from "../../../src/reading-pipeline/index.mjs";

const S1 = "1".repeat(64), S2 = "2".repeat(64);
const WORDS = "I asked the clerk for the minutes and was told they were not kept.";
const layer = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: "unmeasured" }];
async function reading() {
  return { content_type: "t", reader_version: 1, read_from_text: true, found: true, at: "2026-09-27T00:00:00Z", basis: "b",
           entities: [{ kind: "meeting", key: "7", label: "Council", facts: {}, ref: "meeting:7", source: null }], facts: {},
           text_source: layer, text_tier: 1, text_container: "pdf",
           provenance: await readingProvenance({ text: "t", chain: layer, tier: 1, container: "pdf" }) };
}
const READING_TABLES = ["readings", "reading_history", "reading_refs", "reading_ref_terms", "reading_text_source"];
const counts = (w) => Object.fromEntries(READING_TABLES.map((t) => [t, w.one(`SELECT count(*) AS c FROM ${t}`).c]));
const ANSWER_KEYS = ["offered", "written", "truncated", "over_bound", "unaddressable", "chain_kind", "skipped"];

test("R61: indexTestimony replaces the capture's index by R22's rule over one unit (the words whole at {kind: document}, seq 0, chain null) and answers R22's answer", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  /* an index already held for the capture is replaced, not added to */
  w.x.indexUnits("B-1", S1, [{ extent: { kind: "pdf-page", page: 0, rect: null }, text: "older words", seq: 0 },
                             { extent: { kind: "pdf-page", page: 1, rect: null }, text: "more words", seq: 1 }], layer);
  const out = w.core.transact(() => w.x.indexTestimony({ bundleId: "B-1", captureSha: S1, words: WORDS, author: "member:m1" }));
  for (const k of ANSWER_KEYS) assert.ok(k in out, `the answer gives ${k}`);
  assert.deepEqual([out.offered, out.written, out.truncated, out.over_bound, out.unaddressable, out.chain_kind, out.skipped],
                   [1, 1, 0, 0, 0, "undetermined", []]);
  const u = w.x.unitsOf(S1);
  assert.equal(u.state, "whole");
  assert.deepEqual(u.units, [{ extent: { kind: "document" }, ref: u.units[0].ref, text: WORDS, truncated: false, seq: 0,
                               chain_kind: "undetermined" }]);
  assert.equal(w.one(`SELECT bundle_id FROM capture_text WHERE capture_sha=?`, S1).bundle_id, "B-1");
  assert.equal(w.rows(`SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH 'clerk'`).length, 1, "searchable");
  assert.equal(w.rows(`SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH 'older'`).length, 0, "the old rows gone");
  /* R22's per-unit cap holds for the words too */
  const long = "w".repeat(CAPTURE_TEXT_UNIT_CAP + 10);
  const cut = w.x.indexTestimony({ bundleId: "B-1", captureSha: S2, words: long, author: "member:m1" });
  assert.deepEqual([cut.written, cut.truncated], [1, 1]);
  assert.equal(w.one(`SELECT length(text) AS n, truncated FROM capture_text WHERE capture_sha=?`, S2).n, CAPTURE_TEXT_UNIT_CAP);
});

test("R61: words that are not a string holding a glyph index nothing and answer written: 0, the capture's old rows still deleted first; a request naming no bundle or capture writes nothing; none of these throws", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  for (const words of ["   \n\t", "", null, undefined, 42, { text: "x" }, ["x"]]) {
    w.x.indexUnits("B-1", S1, [{ extent: { kind: "document" }, text: "held", seq: 0 }], null);
    const out = w.x.indexTestimony({ bundleId: "B-1", captureSha: S1, words, author: "member:m1" });
    assert.deepEqual([out.offered, out.written], [0, 0], JSON.stringify(words));
    assert.equal(w.rows(`SELECT * FROM capture_text WHERE capture_sha=?`, S1).length, 0, "R22 deletes first, even with no unit");
    assert.equal(w.x.unitsOf(S1).state, "none");
  }
  w.x.indexUnits("B-1", S2, [{ extent: { kind: "document" }, text: "held", seq: 0 }], null);
  for (const [bundleId, captureSha] of [[null, S2], ["B-1", null], ["B-1", ""], ["", S2], [7, S2], ["B-1", 7]]) {
    const out = w.x.indexTestimony({ bundleId, captureSha, words: WORDS });
    assert.equal(out.written, 0);
    assert.equal(typeof out.why, "string");
  }
  assert.equal(w.x.indexTestimony().written, 0);
  assert.deepEqual(w.x.unitsOf(S2).units.map((u) => u.text), ["held"], "nothing written for an unnamed capture");
});

test("R61 R24: indexTestimony writes no reading, reading history, reference, name term or text-source row, touches a stored reading not at all, and calls no R24 listener", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  const heard = [];
  assert.equal(w.x.onReading("observation-log", (e) => { heard.push(e); return null; }).ok, true);
  w.x.indexTestimony({ bundleId: "B-1", captureSha: S1, words: WORDS, author: "member:m1" });
  assert.deepEqual(counts(w), Object.fromEntries(READING_TABLES.map((t) => [t, 0])));
  w.x.writeReading({ bundleId: "B-1", captureSha: S2, reading: await reading() });
  heard.length = 0;
  const before = counts(w);
  const row = w.one(`SELECT * FROM readings WHERE capture_sha=?`, S2);
  w.x.indexTestimony({ bundleId: "B-1", captureSha: S2, words: WORDS, author: "member:m1" });
  assert.deepEqual(counts(w), before);
  assert.deepEqual(w.one(`SELECT * FROM readings WHERE capture_sha=?`, S2), row);
  assert.deepEqual(heard, [], "R24's listeners are not called");
});

test("R61 R62: inside the caller's transaction: a caller that fails after it takes the index with it; a listener that throws fails the write and the caller's", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  w.x.indexUnits("B-1", S1, [{ extent: { kind: "document" }, text: "held", seq: 0 }], null);
  assert.throws(() => w.core.transact(() => {
    w.x.indexTestimony({ bundleId: "B-1", captureSha: S1, words: WORDS, author: "member:m1" });
    w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                  VALUES ('B-2','information','g','t','collected','x','x','x',1)`);
    throw new Error("the caller fails later");
  }), /the caller fails later/);
  assert.deepEqual(w.x.unitsOf(S1).units.map((u) => u.text), ["held"], "the caller's rollback takes the index back");
  assert.equal(w.one(`SELECT count(*) AS c FROM bundles WHERE bundle_id='B-2'`).c, 0);
  assert.equal(w.x.onIndexed("content", () => { throw new Error("listener refused"); }).ok, true);
  assert.throws(() => w.x.indexTestimony({ bundleId: "B-1", captureSha: S1, words: WORDS }), /listener refused/);
  assert.deepEqual(w.x.unitsOf(S1).units.map((u) => u.text), ["held"], "nothing of the failed write survives");
  assert.throws(() => w.core.transact(() => {
    w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                  VALUES ('B-3','information','g','t','collected','x','x','x',1)`);
    return w.x.indexTestimony({ bundleId: "B-1", captureSha: S1, words: WORDS });
  }), /listener refused/);
  assert.equal(w.one(`SELECT count(*) AS c FROM bundles WHERE bundle_id='B-3'`).c, 0, "the whole write fails, the caller's with it");
});

test("R62: onIndexed registers once per module; a malformed or repeated registration is membership's listenerRefusal answer; separate from R24's registrations", async () => {
  const w = fresh();
  const f = () => null;
  assert.deepEqual(w.x.onIndexed("observation-log", f), { ok: true, module: "observation-log" });
  for (const [m, fn] of [["", f], [null, f], [7, f], ["content", null], ["content", "fn"]])
    assert.deepEqual(w.x.onIndexed(m, fn), listenerRefusal([], m, fn), `malformed ${JSON.stringify(m)}`);
  const again = w.x.onIndexed("observation-log", () => 1);
  assert.deepEqual(again, listenerRefusal([{ module: "observation-log" }], "observation-log", () => 1));
  assert.deepEqual([again.ok, again.reason, again.code, again.module], [false, "LISTENER_DECLARED", "LISTENER_DECLARED", "observation-log"]);
  assert.equal(w.x.onReading("observation-log", f).ok, true, "R24's slot is its own");
  assert.equal(w.x.onIndexed("content", f).ok, true);
});

test("R62: after each R61 write every listener runs in the same transaction, in MODULE_ORDER whatever order they registered in, with {bundleId, captureSha, indexed, author, container: document}; R19's writer raises no index notice", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  const ran = [];
  const listen = (m) => (e) => {
    ran.push([m, e, w.one(`SELECT count(*) AS c FROM capture_text WHERE capture_sha=?`, e.captureSha).c]);
    return null;
  };
  for (const m of ["retrieval", "zz-unlisted", "observation-log", "content"]) assert.equal(w.x.onIndexed(m, listen(m)).ok, true);
  const out = w.x.indexTestimony({ bundleId: "B-1", captureSha: S1, words: WORDS, author: "member:m1" });
  const known = ["content", "observation-log", "retrieval"].sort((a, b) => MODULE_ORDER.indexOf(a) - MODULE_ORDER.indexOf(b));
  assert.deepEqual(ran.map((r) => r[0]), [...known, "zz-unlisted"]);
  for (const [, e, held] of ran) {
    assert.deepEqual(e, { bundleId: "B-1", captureSha: S1, indexed: out, author: "member:m1", container: "document" });
    assert.equal(held, 1, "runs after the write, inside it");
  }
  /* an index of nothing is still a write, and still noticed */
  ran.length = 0;
  w.x.indexTestimony({ bundleId: "B-1", captureSha: S1, words: " ", author: null });
  assert.equal(ran.length, 4);
  assert.deepEqual([ran[0][1].indexed.written, ran[0][1].author, ran[0][1].container], [0, null, "document"]);
  /* R19's writer does not raise it */
  ran.length = 0;
  w.x.writeReading({ bundleId: "B-1", captureSha: S2, reading: await reading(),
                     textUnits: [{ extent: { kind: "pdf-page", page: 0, rect: null }, text: "words", seq: 0 }] });
  assert.deepEqual(ran, []);
});
