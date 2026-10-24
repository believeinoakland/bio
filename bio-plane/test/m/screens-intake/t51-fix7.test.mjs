/* screens-intake T51 fix round 6, G43 (K4649, K4651): `promoteDocument` bounds what it embeds in `data/provenance.json`. Promotion refuses a file over
 * its `INLINE_MAX` (1,048,576 B) as `OVERSIZE_INLINE`; a door-read sheet embeds its whole reading, so over the local bound the file is composed
 * again without `reading`, `text_units`, `text_units_over_bound` and `text_units_skipped`, and the answer says `readingDropped`. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { open as openPage, fill, press, ok, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const BOUND = 1048576 - 65536;
const promoteDocument = CAPTURE_SCREEN.parts.promoteDocument;
const SHA = "a".repeat(64);

/* a stub `cs`: allocid answers an id, promote is recorded and answers a bundle */
function stub() {
  const sent = [];
  return { sent, now: () => Date.UTC(2026, 9, 23), digest: async (s) => createHash("sha256").update(s).digest("hex"),
    call: async (op, req) => {
      sent.push({ op, ...req });
      return op === "allocid" ? { ok: true, id: "INFO-2026-0001" } : { ok: true, bundleId: req.body.bundleId, reading_pending: true };
    } };
}
const docWith = (filler, more = filler) => ({ file: "snapshots/x.csv", locator: "", capture: { sha256: SHA, bytes: 10, encoding: "binary" },
  reading: { title: "Sheet", units: filler }, text_units: [{ n: 1, text: more }], text_units_over_bound: false, text_units_skipped: 0, keep: "me" });
const provOf = (cs) => cs.sent.find((s) => s.op === "promote").body.files.find((f) => f.path === "data/provenance.json");
const fits = (doc) => { const full = JSON.stringify({ documents: [doc] }, null, 1); return full.length; };

/* a filler that makes the file just under (or just over) the bound, in code units */
function sized(target) {
  const base = fits(docWith("")), rest = target - base, half = Math.floor(rest / 2);
  return docWith("x".repeat(half), "x".repeat(rest - half));
}

test("R61 (G43) a document whose provenance file is just under the bound keeps its reading, byte-identical to JSON.stringify of the document", async () => {
  const cs = stub(), doc = sized(BOUND);
  assert.equal(fits(doc), BOUND);
  const made = await promoteDocument(cs, { doc, title: "Sheet", locator: "", project: "" });
  assert.equal(made.refused, undefined);
  assert.equal(made.readingDropped, undefined, "nothing is dropped");
  const f = provOf(cs);
  assert.equal(f.text, JSON.stringify({ documents: [doc] }, null, 1));
  assert.equal(f.bytes, BOUND);
  assert.ok(JSON.parse(f.text).documents[0].reading, "the reading is embedded");
});

test("R61 (G43) one code unit over the bound drops reading, text_units, text_units_over_bound and text_units_skipped, keeps the rest, and answers readingDropped", async () => {
  const cs = stub(), doc = sized(BOUND + 1);
  const made = await promoteDocument(cs, { doc, title: "Sheet", locator: "", project: "" });
  assert.equal(made.readingDropped, true);
  assert.equal(made.bundleId, "INFO-2026-0001-sheet");
  assert.equal(made.readingPending, true, "the plane's own answer still passes through");
  const f = provOf(cs), got = JSON.parse(f.text).documents[0];
  for (const k of ["reading", "text_units", "text_units_over_bound", "text_units_skipped"]) assert.ok(!(k in got), `${k} is gone`);
  assert.equal(got.keep, "me");
  assert.deepEqual(got.capture, doc.capture);
  assert.equal(f.text, JSON.stringify({ documents: [got] }, null, 1), "same indent, so stored digests are unchanged in form");
  assert.equal(f.bytes, Buffer.byteLength(f.text));
  assert.equal(f.sha256, createHash("sha256").update(f.text).digest("hex"));
  assert.ok(f.bytes < BOUND, "well under promotion's bound");
});

test("R61 (G43) the bound is on UTF-8 bytes, not code units: a file under it in characters and over it in bytes drops the reading", async () => {
  const cs = stub(), doc = docWith("é".repeat(BOUND / 2 - 1000));
  assert.ok(fits(doc) < BOUND && Buffer.byteLength(JSON.stringify({ documents: [doc] }, null, 1)) > BOUND);
  const made = await promoteDocument(cs, { doc, title: "Sheet", locator: "", project: "" });
  assert.equal(made.readingDropped, true);
});

test("R61 (G43) a document with no reading is never marked dropped (control: a small document, a deferred large file)", async () => {
  const cs = stub(), { reading: _r, text_units: _t, ...bare } = docWith("small");
  const made = await promoteDocument(cs, { doc: bare, title: "Sheet", locator: "", project: "" });
  assert.equal(made.readingDropped, undefined);
  assert.equal(provOf(cs).text, JSON.stringify({ documents: [bare] }, null, 1));
});

/* the three callers, over the real page with the plane scripted: a big reading on the door's document is not embedded, whichever act filed it */
const BIG = (n) => ({ units: "y".repeat(n) });
const OPEN0 = ok({ ok: true, captures: [], truncated: false });
const NOT_HELD = ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } });
const open = (path, o = {}) => openPage(path, { ...o, plane: { heldat: NOT_HELD, ...(o.plane || {}) }, screens: [...SCREENS, DOCUMENT_STUB] });
const PLANE = { opencaptures: OPEN0, allocid: ok({ ok: true, id: "INFO-2026-0001" }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) };
const provOfPage = (p) => p.byOp("promote")[0].body.files.find((f) => f.path === "data/provenance.json");

test("R61 (G43, the address path) an acquired 1 MB CSV whose reading is over the bound is filed without it", async () => {
  const doc = { capture: { sha256: SHA, bytes: 1048576, encoding: "binary", content_type: "text/csv" }, file: "snapshots/a.csv", title: null,
                reading: BIG(BOUND), text_units: [{ n: 1, text: "y".repeat(BOUND) }] };
  const p = await open("/app/capture/address", { plane: { ...PLANE, acquire: ok({ ok: true, document: doc }) } });
  fill(p, { "ci-address": "https://city.example/data/big.csv" });
  await press(p, "acquire");
  await p.settle();
  const f = provOfPage(p), got = JSON.parse(f.text).documents[0];
  assert.ok(f.bytes < BOUND && !("reading" in got) && !("text_units" in got), "no reading embedded");
  assert.equal(got.capture.sha256, SHA);
});

test("R61 (G43, a docx with a large table) a Word document whose reading carries a table over the bound is filed without it; the upload path likewise", async () => {
  const doc = { capture: { sha256: SHA, bytes: 90000, encoding: "binary", content_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
                file: "snapshots/t.docx", locator: "upload:" + SHA, title: null,
                reading: { title: "T", tables: [{ rows: Array.from({ length: 20000 }, (_, i) => ["row " + i, "a cell of some length", "another cell of some length"]) }] },
                text_units: [{ n: 1, text: "z".repeat(200000) }] };
  assert.ok(JSON.stringify({ documents: [doc] }, null, 1).length > BOUND);
  const cs = stub();
  const made = await promoteDocument(cs, { doc, title: "t.docx", locator: doc.locator, project: "" });
  assert.equal(made.readingDropped, true);
  assert.ok(!("reading" in JSON.parse(provOf(cs).text).documents[0]));
  /* the upload path: a member's .docx upload whose door-read document carries the table */
  const FILE = new File(["PK docx bytes"], "t.docx", { type: doc.capture.content_type });
  const up = await open("/app/capture/file", { plane: { ...PLANE, captureupload: ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 90000 }, document: doc }) } });
  fill(up, { "ci-file": FILE, "ci-how-made": true, "ci-where": "the clerk's office, 4 October", "ci-what": "The budget table." });
  await press(up, "captureupload");
  const f = provOfPage(up), got = JSON.parse(f.text).documents[0];
  assert.ok(f.bytes < BOUND && !("reading" in got) && !("text_units" in got), "the upload's promotion embeds no reading");
});

test("R61 (G43) control: a document whose reading fits is filed with it by the address path", async () => {
  const doc = { capture: { sha256: SHA, bytes: 1200, encoding: "binary", content_type: "text/csv" }, file: "snapshots/a.csv", title: null, reading: { title: "Small" }, text_units: [{ n: 1, text: "a,b" }] };
  const p = await open("/app/capture/address", { plane: { ...PLANE, acquire: ok({ ok: true, document: doc }) } });
  fill(p, { "ci-address": "https://city.example/data/small.csv" });
  await press(p, "acquire");
  await p.settle();
  assert.deepEqual(JSON.parse(provOfPage(p).text).documents[0].text_units, [{ n: 1, text: "a,b" }]);
});

/* G126h (fix round 9; R61; K4835): the two arms that judged a reading the door had cut (a unit `truncated`, units over the bound or skipped) are gone: a reading's
   units are chunked and never cut, a sheet is not read at the door past the gate (the job row reads the rest), so the size of the file is the only test of
   a reading that arrives. A small reading is filed as it arrives, whatever those fields say, and not dropped. */
const small = (more) => ({ ...docWith("a,b"), ...more });
for (const [why, more] of [["a unit marked truncated", { text_units: [{ extent: "x", seq: 1, text: "a,b", truncated: true }] }],
                           ["text_units_over_bound", { text_units_over_bound: true }], ["text_units_skipped above zero", { text_units_skipped: 3 }]]) {
  test(`R61 (G126h) a small reading with ${why} is filed as it arrives: the dead arm that dropped it is gone, nothing is marked readingDropped`, async () => {
    const cs = stub(), doc = small(more);
    assert.ok(fits(doc) < BOUND);
    const made = await promoteDocument(cs, { doc, title: "Sheet", locator: "", project: "" });
    assert.equal(made.readingDropped, undefined);
    assert.equal(provOf(cs).text, JSON.stringify({ documents: [doc] }, null, 1), "the document is filed whole, reading and units as they came");
  });
}

test("R61 (G43, B39) control: whole units (none truncated, none over the bound, none skipped) keep the reading", async () => {
  const cs = stub(), doc = { ...docWith("a,b"), text_units: [{ extent: "x", seq: 1, text: "a,b", truncated: false }], text_units_over_bound: false, text_units_skipped: 0 };
  const made = await promoteDocument(cs, { doc, title: "Sheet", locator: "", project: "" });
  assert.equal(made.readingDropped, undefined);
  assert.equal(provOf(cs).text, JSON.stringify({ documents: [doc] }, null, 1));
});
