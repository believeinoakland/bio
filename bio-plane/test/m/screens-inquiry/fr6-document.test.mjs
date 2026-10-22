/* screens-inquiry fix round 6 (T51), the document screen: G6 (a stored statement that a copy was not read is drawn as that statement, with its size, and
 * offers no OCR re-read after it), G8 (a statement extraction states `repairable` offers "Read it"; a plain final does not), G13 (a text reading with `more` is
 * drawn as being read, with its progress, never as complete). On interface-shell's served page over a scripted plane whose reading answers are copied from the
 * real op (the shapes `fr6-seam.test.mjs` makes by the member's own acts); every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, says, word, D, SHA, DOCUMENT_MD } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const text = (el) => String(el && el.textContent || "");
/* a capture of five parts: the provenance document's `capture.sha256` is the WHOLE, its parts listed beside it (capture's `#uploadedDocument`, acquisition R10) */
const WHOLE = "a05b3f74" + "4".repeat(56);
const PARTS = Array.from({ length: 5 }, (_, i) => ({ file: `snapshots/upload-${WHOLE}.part00${i}`, sha256: String(i + 1).repeat(64), bytes: 8388608 }));
const BYTES = 41942040;
const five = { [D]: { "bundle.md": DOCUMENT_MD, "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: WHOLE, bytes: BYTES }, parts: PARTS }] }) } };
/* the statement as the real `op=reading` answers it for a capture over the reader's size (the seam test makes it by a 40 MB upload) */
const BASIS = "the capture is 41942040 bytes in 5 parts, over the 25165824 B a format entry is handed here, so it was not read";
const stated = (o = {}) => ok({ ok: true, found: true, capture_sha: WHOLE, bundle_id: D, content_type: "generic", reader_version: 1, reader_found: false, entity_count: 0,
  at: "2026-10-22T15:22:10Z", reading: { content_type: "generic", reader_version: 1, found: false, basis: BASIS, failure: "final", metadata: null },
  text_units: [], bytes: BYTES, format: "undetermined", ...o });
const sizeWord = () => word("size.mb", { n: (BYTES / 1048576).toFixed(1) });

test("R96 R129 G6 a 5-part capture whose reading is stored under the whole as a final statement draws that statement with the file's size; no 'Nothing here', no OCR re-read, nothing offered after it", async () => {
  const p = await open(at, { images: five, plane: { reading: stated(), heldcaptures: ok({ ok: true, held: [] }) } });
  const reads = p.byOp("reading").map((r) => r.query.sha256);
  assert.deepEqual(reads, [WHOLE], "the reading is asked of the whole's digest, never a part's");
  const m = main(p);
  assert.ok(text(m).includes(BASIS), "the statement the plane stored is drawn, in the plane's own words");
  assert.ok(text(m).includes(sizeWord()), "with the file's size");
  assert.ok(!says(m, "state.empty"), "the section is not 'Nothing here'");
  const acts = actsIn(m);
  assert.ok(!acts.includes("pdfstructure"), "no OCR re-read after a final statement");
  assert.ok(!acts.includes("readheld"), "and no 'Read it' for a statement that stands");
  assert.notEqual(m.querySelector("[data-text-state]") && m.querySelector("[data-text-state]").getAttribute("data-text-state"), "none", "and the fact line does not say the copy holds no text");
  assert.ok(m.querySelector('[data-reading="stated"]'), "the statement is its own element");
});

test("R96 G6 control: a reading that found no words and states no failure still offers the OCR re-read, as before; a full reading offers none", async () => {
  const none = await open(at, { plane: { reading: ok({ ok: true, found: true, capture_sha: SHA, reading: { content_type: "application/pdf", found: true, page_count: 2 }, text_units: [], unread_pages: [0, 1] }) } });
  assert.ok(actsIn(main(none)).includes("pdfstructure"), "blind pages offer OCR");
  const full = await open(at, { plane: { reading: ok({ ok: true, found: true, capture_sha: SHA, reading: { content_type: "application/pdf", found: true },
    text_units: [{ seq: 1, extent: { kind: "pdf-page", page: 0 }, reference: "u1", truncated: false, text: "Words of the page." }], unread_pages: [] }) } });
  assert.ok(!actsIn(main(full)).includes("pdfstructure"), "a full reading offers no OCR");
});

test("R96 R129 G8 a statement extraction states repairable (the old '(multipart)' final) offers 'Read it'; a plain final does not; pressing it sends readheld with the digest", async () => {
  const rep = await open(at, { images: five, plane: { reading: stated({ repairable: true }), readheld: ok({ ok: true, read: true }) } });
  assert.ok(actsIn(main(rep)).includes("readheld"), "Read it is offered for a repairable statement");
  assert.ok(text(main(rep)).includes(BASIS), "the statement is still said");
  assert.ok(!actsIn(main(rep)).includes("pdfstructure"), "and no OCR re-read");
  const plain = await open(at, { images: five, plane: { reading: stated() } });
  assert.ok(!actsIn(main(plain)).includes("readheld"), "a plain final is not offered Read it");
  const b = main(rep).querySelector('button[data-act="readheld"]');
  assert.equal(b.getAttribute("data-sha"), WHOLE, "it carries the whole's digest");
});

test("R96 G13 a text reading with more is drawn as being read with its progress, never as complete; its passages stay citable and the page says search and Cite cover what is read; no OCR, no Read it", async () => {
  const words = Array.from({ length: 3 }, (_, i) => ({ seq: i + 1, extent: { kind: "line", line: i }, reference: "u" + i, truncated: false, text: "Line " + i + " of the long text." }));
  const reading = (more) => ok({ ok: true, found: true, capture_sha: SHA, bundle_id: D, content_type: "text/plain", reader_found: true,
    reading: { content_type: "text/plain", found: true, words_read: 400, words_total: 2000 }, text_units: words, bytes: 12000060, ...(more ? { more: true } : {}), words_read: 400, words_total: 2000 });
  const p = await open(at, { plane: { reading: reading(true) } });
  const m = main(p);
  assert.equal(m.querySelector("[data-text-state]").getAttribute("data-text-state"), "reading", "being read, not full");
  assert.ok(says(m, "state.loading"), "said as being read (the nearest held row stands in until the design's)");
  assert.ok(says(m, "screen.document.text.read", { read: "400", total: "2000" }), "with its progress");
  assert.ok(m.querySelector('[data-reading="more"]'), "and the coverage of what is read");
  assert.ok(text(m).includes("Line 1 of the long text."), "what is read is shown");
  assert.ok(actsIn(m).includes("cite"), "and citable");
  assert.ok(!actsIn(m).includes("pdfstructure") && !actsIn(m).includes("readheld"));
  /* control: the same reading without `more` is complete and says nothing of being read */
  const done = await open(at, { plane: { reading: reading(false) } });
  assert.equal(done.doc.getElementById("cs-main").querySelector("[data-text-state]").getAttribute("data-text-state"), "full");
  assert.ok(!done.doc.getElementById("cs-main").querySelector('[data-reading="more"]'));
});

test("R96 G13 while more, the reading is asked again on the page clock (at most every 10 seconds) until it is whole; then it is not asked again", async () => {
  let more = true, n = 0;
  const reading = () => { n++; return ok({ ok: true, found: true, capture_sha: SHA, bundle_id: D, content_type: "text/plain", reader_found: true,
    reading: { content_type: "text/plain", found: true }, text_units: [{ seq: 1, extent: { kind: "line", line: 0 }, reference: "u0", truncated: false, text: "A line." }],
    bytes: 100, words_read: more ? 1 : 2, words_total: 2, ...(more ? { more: true } : {}) }); };
  const p = await open(at, { plane: { reading } });
  const first = p.byOp("reading").length;
  await p.clock.tick(9000);
  assert.equal(p.byOp("reading").length, first, "not before 10 seconds");
  await p.clock.tick(1000);
  assert.equal(p.byOp("reading").length, first + 1, "once at 10 seconds");
  more = false;
  await p.clock.tick(10000);
  assert.equal(main(p).querySelector("[data-text-state]").getAttribute("data-text-state"), "full", "whole once the plane says it is");
  const whole = p.byOp("reading").length;
  await p.clock.tick(60000);
  assert.equal(p.byOp("reading").length, whole, "a whole reading is not asked again");
});
