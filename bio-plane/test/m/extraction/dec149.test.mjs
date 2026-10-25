/* extraction: DEC-149's wording (N664, the L1–L7 sweep, `plan/draft-T35-dec149-l1-l7.md`), at the module's interface.
   Every member-facing sentence this module answers names the member's group's Civicsmith or the thing itself, never
   "this instance", "the instance" or "the plane"; field and identifier names stay. One arm per swept string, each read
   where a member reads it: C-51.1 and C-51.4's translations (R32, R47), R52's membership basis, R27's origin (R21),
   R34's re-read candidates. The migration's no-store reason (R66) is n26.test.mjs's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, member, withEntry, i2, noText, ocrAnswer, pageUnits, pressThenPass } from "./fixture.mjs";
import { REEXTRACT_CHECKS } from "../../../src/extraction/index.mjs";
import { deriveMembership } from "../../../src/extraction/filemembership.mjs";
import { WORD } from "./words.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { notAPdf } from "../pdf-reader/fixtures.mjs";

const OLD = /\b(this|the) (instance|plane)\b|\binstance's\b|\bplane's\b/i;

const pdf = (text, pages) => ({ format: "pdf", structure: async (b) => (new TextDecoder().decode(b).startsWith("%PDF")
  ? { ok: true, text: structuredClone(text), pages: pages ?? (text.pages || []).length, notes: [] }
  : await notAPdf()) });

async function held(text) {
  const w = fresh();
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  const reading = { content_type: "generic", reader_version: 1, read_from_text: false, found: false, entities: [], facts: {},
                    at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: 2, tier3_candidate: true };
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading, textUnits: text ? pageUnits(text) : null });
  return { w, d };
}

test("R32 R47 (DEC-149, C-51.1): a malformed re-read flag is a re-read in a form your team's Civicsmith does not recognize", async () => {
  const { w, d } = await held(i2([{ page: 0, text: "x" }]));
  const r = await w.x.pdfStructure({ ocr: "yes", sha: d });
  assert.equal(r.body.check, "C-51.1");
  assert.equal(r.body.translation, WORD("refusal.REEXTRACT_FLAG_MALFORMED"), "read by key (T50)");
  assert.match(r.body.translation, /a re-read in a form your team's Civicsmith does not recognize/);
  assert.doesNotMatch(r.body.translation, OLD);
  assert.equal(REEXTRACT_CHECKS.REEXTRACT_FLAG_MALFORMED.translation, r.body.translation);
});

test("R32 R47 (DEC-149, C-51.4): with no OCR member, your team's Civicsmith has no OCR engine installed", async () => {
  const { w, d } = await held(i2([{ page: 0, text: "x" }]));
  const r = await w.x.pdfStructure({ ocr: "1", sha: d, cls: "member", session: true, caps: ["contribute"], env: {} });
  assert.equal(r.body.check, "C-51.4");
  assert.equal(r.body.translation, WORD("refusal.REEXTRACT_NO_OCR_MEMBER"), "read by key (T50)");
  assert.match(r.body.translation, /^Your team's Civicsmith has no OCR engine installed, so it cannot re-read a scanned page as text\./);
  assert.doesNotMatch(r.body.translation, OLD);
  for (const row of Object.values(REEXTRACT_CHECKS)) assert.doesNotMatch(row.translation, OLD, row.check);
});

test("R52 (DEC-149): the membership's basis calls the pairing an inference from position, to be confirmed", () => {
  const view = { systems: [{ origin: "t.clerk", hosts: ["records.t.example"],
    links: { item: { re: "^/item\\?id=\\d+", flags: "i" }, file: { re: "^/file\\?id=\\w+", flags: "i" } } }] };
  const L = (url, y) => ({ partition: "deferred", target: { url }, source: { page: 0, rect: [10, y - 10, 100, y] } });
  const { membership: m } = deriveMembership({ links: [L("https://records.t.example/item?id=1", 700),
                                                       L("https://records.t.example/file?id=a", 600)] }, view);
  assert.equal(m.basis, WORD("extraction.basis.file_link_assigned"), "read by key (T50)");
  assert.match(m.basis, /this pairing is an inference from position, to be confirmed, never the publisher's own link\./);
  assert.doesNotMatch(m.basis, OLD);
});

test("R27 R21 (DEC-149): a reading's origin says your team's Civicsmith composed it, or did not and a caller carried it in", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  const reading = { content_type: "generic", reader_version: 1, found: false, entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b" };
  w.x.writeReading({ bundleId: "B-1", captureSha: "a".repeat(64), reading, composed: true });
  w.x.writeReading({ bundleId: "B-1", captureSha: "b".repeat(64), reading, composed: false, author: "member:m1", justification: "read aloud" });
  const composed = w.x.readingFor("a".repeat(64)).origin;
  const asserted = w.x.readingFor("b".repeat(64)).origin;
  assert.equal(composed.state, "composed");
  assert.equal(composed.why, WORD("extraction.why.group_civicsmith_read"), "read by key (T50)");
  assert.equal(composed.why, word("extraction.why.group_civicsmith_read"));
  assert.equal(asserted.state, "asserted");
  assert.equal(asserted.why, WORD("extraction.why.group_civicsmith_did"), "read by key (T50)");
  assert.match(asserted.why, /^your team's Civicsmith did not compose this reading: a caller carried it in/);
  for (const o of [composed, asserted]) assert.doesNotMatch(o.why, OLD);
});

test("R34 (DEC-149): a written re-read names its candidates as what your group's Civicsmith can read", async () => {
  const text = i2([{ page: 0, text: "Text" }, { page: 1, text: "", undetermined: [noText(1)] }]);
  const { w, d } = await held(text);
  const { x } = await pressThenPass(w, d, { OCR_WORKER: member(() => ocrAnswer([1])) });
  assert.equal(x.written, true);
  assert.match(x.candidates, /what your team's Civicsmith can read; this one is re-read now$/);
  assert.doesNotMatch(x.candidates, OLD);
});
