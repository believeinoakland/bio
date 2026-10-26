/* reading-pipeline R61 (fix round 10, cause 3; K5055; amends R54): a file declared Word (`application/msword`, or a name ending `.doc`) whose bytes
   are not an OLE compound file is stated final, not repairable, `UNSUPPORTED_FORMAT` `legacy_word`: never "not read as text (non-textual or too
   large)", which extraction would offer "Read it" for. An OLE file is stated as before; a declared type that is not text is not overridden by a name.
   Each test names the id; through `read`, the entry path every caller takes (the walker's case: the text declared Word, walk C4). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";

const TEXT = "legacy word text walk ".repeat(7);
const OLE = Uint8Array.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, ...new Array(56).fill(0)]);
const NOT_THIS = /non-textual|too large|not read as text/i;

async function readDeclared(content, { ct, name, fromText = false, format = "undetermined" }) {
  const b = bucket();
  const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
  const d = await hold(b, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct, format, fromText });
  if (name) document.capture.file_name = name;
  return (await read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio" })).reading;
}

for (const fromText of [false, true]) {
  test(`R61 (cause 3; walk C4): text declared application/msword (profiled from text: ${fromText}) is UNSUPPORTED_FORMAT legacy_word, final, not "not read as text"`, async () => {
    const r = await readDeclared(TEXT, { ct: "application/msword", fromText });
    assert.equal(r.found, false);
    assert.equal(r.failure, "final");
    assert.equal(r.reason, "UNSUPPORTED_FORMAT");
    assert.equal(r.kind, "legacy_word");
    assert.match(r.basis, /Word/);
    assert.match(r.basis, /do not look like one/, "the sentence says the contents are not a Word file");
    assert.doesNotMatch(r.basis, NOT_THIS, "extraction offers 'Read it' for exactly that sentence");
  });

  test(`R61 (cause 3; walk C4): text with no declared type and the name x.doc (profiled from text: ${fromText}) is UNSUPPORTED_FORMAT legacy_word`, async () => {
    const r = await readDeclared(TEXT, { ct: "", name: "x.doc", fromText });
    assert.equal(r.reason, "UNSUPPORTED_FORMAT");
    assert.equal(r.kind, "legacy_word");
    assert.equal(r.failure, "final");
    assert.doesNotMatch(r.basis, NOT_THIS);
  });
}

test("R61 (cause 3): a name .doc under the generic octet-stream type is Word too; a name .DOC likewise", async () => {
  for (const name of ["x.doc", "MINUTES.DOC"]) {
    const r = await readDeclared(TEXT, { ct: "application/octet-stream", name });
    assert.equal(r.kind, "legacy_word", name);
  }
});

test("R61 (cause 3): control: the OLE file is stated as before, legacy_word", async () => {
  const r = await readDeclared(OLE, { ct: "application/msword" });
  assert.equal(r.reason, "UNSUPPORTED_FORMAT");
  assert.equal(r.kind, "legacy_word");
  assert.equal(r.failure, "final");
  assert.doesNotMatch(r.basis, /do not look like/, "an OLE file is a Word file: no such clause");
});

test("R61 (cause 3): controls: a .docx name is not legacy Word, and a declared type that is not text is not overridden by a name", async () => {
  const docx = await readDeclared(TEXT, { ct: "", name: "x.docx" });
  assert.notEqual(docx.kind, "legacy_word", "a .docx is not a .doc");
  const pdfNamedDoc = await readDeclared(TEXT, { ct: "application/pdf", name: "x.doc" });
  assert.notEqual(pdfNamedDoc.kind, "legacy_word", "the declared type decides over the name");
  const plain = await readDeclared(TEXT, { ct: "text/plain", name: "notes.txt", fromText: true, format: "undetermined" });
  assert.notEqual(plain.reason, "UNSUPPORTED_FORMAT", "a text file is read as text");
  assert.equal(plain.found !== undefined, true);
});
