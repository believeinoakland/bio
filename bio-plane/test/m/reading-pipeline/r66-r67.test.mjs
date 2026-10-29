/* reading-pipeline R66 and R67 (T53; N1266, N1267; K5427, K5436; T53-124): the text bound is 100 MB and a text between the whole-read figure and the bound is read in windows
   to its last line; a file held and named is a stated reading (`held_unread`, no failure, no units) and is read by the next `read` once a reader for its type is registered.
   The bound's own edges are R50's tests (r10-text); the HTML windows are R51's (r51-large, r51-windows). Each test names the ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boundOf } from "../../../src/read-bounds.mjs";
import { registerFormat, unregisterFormat } from "../../../src/formats.mjs";
import { read, plan, rangeSource, TEXT_WINDOW_FROM } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";

const readOf = (b, document, opts = {}) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...opts });
const MAILBOX = new Uint8Array(4096).fill(0x20).map((x, i) => (i < 4 ? [0x21, 0x42, 0x44, 0x4e][i] : x));

test("R66: the text row of READ_BOUNDS is 100 MB, and the whole-read figure under it is the row's alpha, quoted and never a literal", () => {
  assert.equal(boundOf("text", "bytes"), 104857600);
  assert.ok(TEXT_WINDOW_FROM < boundOf("text", "bytes"));
});

test("R66 (control): a text of more than 50 MB, within the bound, is read to its last line in windows, never loaded whole, the bytes pulled at most twice the file's", async () => {
  const n = Math.ceil((52428800 + 1024) / 100);
  const line = (i) => `line ${String(i).padStart(7, "0")} ` + "council minutes ".repeat(5).padEnd(86, ".");
  const body = Array.from({ length: n }, (_, i) => line(i));
  body.push("LASTTOKEN-BIG");
  const text = body.join("\n");
  const size = Buffer.byteLength(text);
  assert.ok(size > 52428800 && size <= boundOf("text", "bytes"));
  const b = bucket();
  const d = await hold(b, text);
  const document = doc({ digest: d, bytes: size, ct: "text/plain", format: "undetermined", fromText: true });
  let cursor = null, last = null, units = 0;
  for (let guard = 0; guard < 20000; guard++) {
    const out = await readOf(b, document, { unitsBudget: 512 * 1024, maxUnits: 4096, cursor });
    units += (out.text_units || []).length;
    if (out.more !== true) { last = out; break; }
    cursor = out.cursor;
  }
  assert.ok(last, "the read ended");
  assert.equal(units, n + 1, "every line once");
  assert.match(last.text_units.at(-1).text, /LASTTOKEN-BIG/);
  assert.ok(b.served <= 2 * size, `${b.served} bytes pulled of ${size}`);
});

test("R67: a file held and named (an Outlook mailbox) is a stated reading: held_unread with its plain name, no units, no failure, no size refusal", async () => {
  const b = bucket();
  const d = await hold(b, MAILBOX);
  const document = doc({ digest: d, bytes: MAILBOX.length, ct: "application/octet-stream", format: "undetermined" });
  const out = await readOf(b, document);
  assert.equal(out.reading.held_unread.name, "pst");
  assert.equal(typeof out.reading.held_unread.kind_key, "string");
  assert.equal(out.reading.failure, undefined);
  assert.equal(out.reading.reason, undefined);
  assert.equal(out.text_units, undefined);
  assert.equal(out.more, undefined);
  const p = await plan(rangeSource(evidenceStore(b), document), { declared: "application/octet-stream" });
  assert.equal(p.kind, "unlisted");
  assert.equal(p.verdict.ok, true);
  assert.equal(p.mode, "held");
});

test("R67: the same bytes read after a reader for the type is registered are read as any file of it, with no second upload; read keeps nothing", async () => {
  const b = bucket();
  const d = await hold(b, MAILBOX);
  const document = doc({ digest: d, bytes: MAILBOX.length, ct: "application/octet-stream", format: "undetermined" });
  assert.ok((await readOf(b, document)).reading.held_unread);
  const reader = {
    format: "pst",
    detect: (bytes) => (bytes && bytes[0] === 0x21 && bytes[1] === 0x42 && bytes[2] === 0x44 && bytes[3] === 0x4e
      ? { format: "pst", confidence: "certain", signals: ["test reader"] } : null),
    parts: null, structure: null,
    text: async () => ({ ok: true, container: "pst", document: "mailbox text read by a test reader", encoding: "utf-8", counts: { chars: 33, undetermined: 0 }, undetermined: [] }),
  };
  registerFormat(reader);
  try {
    const after = await readOf(b, document);
    assert.equal(after.reading.held_unread, undefined);
    assert.ok(after.reading.found !== undefined);
    assert.notEqual(after.reading.basis, undefined);
  } finally { unregisterFormat("pst"); }
  assert.ok((await readOf(b, document)).reading.held_unread, "removed again, held again: a pure function of the bytes and the roster");
});

test("R67 (control): valid text with no other structure is text and is read, not held; a listed type reads as before", async () => {
  const b = bucket();
  const d = await hold(b, "one short line of text\nanother line\n");
  const document = doc({ digest: d, bytes: 34, ct: "text/plain", format: "undetermined", fromText: true });
  const out = await readOf(b, document);
  assert.equal(out.reading.held_unread, undefined);
  assert.equal(out.reading.failure, undefined);
});
