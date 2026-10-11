/* extraction, T44-5 at the module's interface: N869 and N876 (DEC-191 (4), (5), DEC-192 (1), (2), (6); K2713, K2719):
   R71's `says`, read by key for every way nothing was filled (nothing sent, a photo not prepared, sent with no reading
   back, a refusal), and R27's `capture.picture.unread` for a picture's one unread page, each with a negative control
   (K874). Words are read by key from `words.json` (`./words.mjs`); a key the list lacks fails the test. The
   transcriber is a stub of the composition root's (plane R36's shape), its `refused` built as plane R36 states it.
   Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, withEntry, i2, noText } from "./fixture.mjs";
import { WORD } from "./words.mjs";

const member1 = { cls: "member", session: true, caps: ["contribute"], viewer: "class:admin", by: "member:m1" };
const writes = (w) => JSON.stringify([w.rows(`SELECT * FROM readings`), w.rows(`SELECT * FROM capture_text`), w.rows(`SELECT * FROM reading_history`)]);
const fill = (key, f = {}) => Object.entries(f).reduce((s, [k, v]) => s.replace(`{${k}}`, v), WORD(key));

/* R27: a reading of `pages` pages written with `format`, its page units the `read` pages. */
function readingWith(w, captureSha, { format, container = format, pages = 1, read = [] }) {
  const unit = (p) => ({ extent: { kind: "pdf-page", page: p, rect: null }, text: `words of page ${p}`, seq: p });
  w.x.writeReading({ bundleId: "PROJ-1", captureSha, profileFormat: format, textUnits: read.map(unit),
    reading: { entities: [], at: "a", page_count: pages, text_container: container } });
  return w.x.readingFor(captureSha, "class:admin");
}

test("R27 (T44; N869, N876; DEC-191 (5), DEC-192 (6)): a jpeg or png reading with its one page unread says capture.picture.unread, by key, in place of document.unread.pages; a PDF's one unread page, a read picture and a hidden bundle are the controls", () => {
  const w = fresh();
  bundle(w.s, "PROJ-1", { type: "project" });
  for (const [i, format] of ["jpeg", "png"].entries()) {
    const r = readingWith(w, String(i + 1).repeat(64), { format });
    assert.deepEqual([r.unread_pages, r.unread_says], [[0], WORD("capture.picture.unread")], format);
  }
  /* a photo profiled before its entry was registered: the reading's own container names the picture */
  const old = readingWith(w, "3".repeat(64), { format: "undetermined", container: "jpeg" });
  assert.deepEqual([old.unread_pages, old.unread_says], [[0], WORD("capture.picture.unread")]);
  /* controls: a PDF's one unread page keeps document.unread.pages; a read picture says nothing; a hidden one withholds */
  const pdf = readingWith(w, "4".repeat(64), { format: "pdf" });
  assert.deepEqual([pdf.unread_pages, pdf.unread_says], [[0], fill("document.unread.pages", { pages: "1" })]);
  assert.notEqual(pdf.unread_says, WORD("capture.picture.unread"));
  const read = readingWith(w, "5".repeat(64), { format: "jpeg", read: [0] });
  assert.deepEqual([read.unread_pages, "unread_says" in read], [[], false]);
  const many = readingWith(w, "6".repeat(64), { format: "pdf", container: "pdf", pages: 3, read: [1] });
  assert.equal(many.unread_says, fill("document.unread.pages", { pages: "1, 3" }));
  const hidden = w.x.readingFor("1".repeat(64), "member:outsider");
  assert.deepEqual(["unread_pages" in hidden, "unread_says" in hidden], [false, false]);
});
