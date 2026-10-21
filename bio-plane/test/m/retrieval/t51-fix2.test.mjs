/* retrieval, T51 fix round 2 (C21): each hit names its document, and a question hit's excerpt is drawn from the
 * question's title and conclusion, never from `bundle.md` (R92, proposed to BOB in a QUESTION). Through the module's
 * interface: `search` and `meaningRows` over a world with real promotions. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const LOG = "\n## Session log\n\nINQ-SEWER opened by member:ann; bundle sha256:" + "ab12cd34".repeat(8)
  + " read the sewer ledger twice; the sewer fund was never opened.\n";
const question = (w, id, extra = {}) => w.doc(id, { object_type: "inquiry", title: "Who pays for the sewer repair?", ...extra }, { body: LOG });
const unit = (w, cap, bundle, seq, text) => w.st.sql.exec(
  `INSERT INTO capture_text (capture_sha, bundle_id, extent_kind, extent, ref, seq, text, truncated, chain_kind)
   VALUES (?,?,?,?,?,?,?,?,?)`, cap.sha, bundle, "pdf-page", JSON.stringify({ kind: "pdf-page", page: seq }), `page ${seq + 1}`, seq, text, 0, "layer");

test("R92: a question hit's excerpt is drawn from its title and conclusion: no markdown heading, no INQ- id, no hash and no session log; the match is marked", () => {
  const w = world();
  question(w, "INQ-SEWER", { conclusion: "The city pays for the sewer repair from the general fund." });
  const hit = w.retrieval.search({ q: "sewer", viewer: V("vera") }).hits[0];
  assert.equal(hit.bundle_id, "INQ-SEWER");
  assert.equal(hit.snippet_from, "text");
  assert.match(hit.snippet, /\[sewer\]/i);
  assert.doesNotMatch(hit.snippet, /##|INQ-|sha256|[0-9a-f]{16}|session log|opened by/i);
  const source = "Who pays for the sewer repair? The city pays for the sewer repair from the general fund.";
  for (const word of hit.snippet.replace(/[\[\]…]/g, "").split(/\s+/).filter(Boolean))
    assert.ok(source.includes(word), `${word} is in the title or the conclusion`);
});

test("R92: a question without a conclusion has its title as the excerpt; a conclusion alone is found through its words", () => {
  const w = world();
  question(w, "INQ-OPEN");
  const hit = w.retrieval.search({ q: "repair", viewer: V("vera") }).hits[0];
  assert.equal(hit.bundle_id, "INQ-OPEN");
  assert.match(hit.snippet, /\[repair\]/);
  assert.doesNotMatch(hit.snippet, /##|INQ-|sha256|session log/i);
});

test("R92 control: a document hit's excerpt is unchanged, cut from its own text", () => {
  const w = world();
  w.doc("INFO-NOTE", {}, { body: "\n## Summary\n\nthe sewer fund holds nothing\n" });
  const hit = w.retrieval.search({ q: "sewer", viewer: V("vera") }).hits[0];
  assert.equal(hit.snippet_from, "text");
  assert.match(hit.snippet, /\[sewer\] fund holds nothing/);
});

test("R92: every search hit names its document, a passage hit included, and a decoration cannot replace it", () => {
  const w = world();
  const pkt = w.cap("packet.pdf", "packet bytes");
  w.doc("INFO-PKT", { title: "Water board packet" }, { captures: [pkt] });
  unit(w, pkt, "INFO-PKT", 0, "quorum absent and hydrostatic pressure rising");
  question(w, "INQ-SEWER");
  const all = w.retrieval.search({ q: "passage:hydrostatic OR passage:quorum", viewer: V("vera") }).hits;
  assert.equal(all.length, 1);
  assert.equal(all[0].snippet_from, "passage");
  assert.deepEqual(all[0].document, { bundle_id: "INFO-PKT", title: "Water board packet" });
  const page = w.retrieval.search({ q: "state:collected OR state:open", viewer: V("vera"), widen: false }).hits;
  for (const h of page) assert.deepEqual(h.document, { bundle_id: h.bundle_id, title: h.title });
  w.retrieval.registerSearchDecoration("people", () => [{ document: "replaced", extra: 1 }]);
  const dec = w.retrieval.search({ q: "passage:hydrostatic", viewer: V("vera") }).hits[0];
  assert.equal(dec.document.title, "Water board packet");
  assert.equal(dec.extra, 1);
});

test("R92: every passage row of meaningRows names its document by title; control: other arms' rows are unchanged", () => {
  const w = world();
  const pkt = w.cap("packet.pdf", "packet bytes");
  w.doc("INFO-PKT", { title: "Water board packet" }, { captures: [pkt] });
  unit(w, pkt, "INFO-PKT", 0, "quorum absent and hydrostatic pressure rising");
  unit(w, pkt, "INFO-PKT", 1, "hydrostatic test passed");
  const a = w.retrieval.meaningRows({ q: "passage:hydrostatic", rows: "passage", viewer: V("vera") });
  assert.equal(a.rows.length, 2);
  for (const r of a.rows) assert.deepEqual(r.document, { bundle_id: "INFO-PKT", title: "Water board packet" });
  const hid = w.retrieval.meaningRows({ q: "passage:hydrostatic", rows: "passage", viewer: null });
  assert.equal(hid.rows.length, 0, "a hidden document names nothing");
});
