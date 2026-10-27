/* pdf-reader: requirement-named tests for the document's /Title in `metadata`
 * (build/requirements/pdf-reader.md R39; N1202), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractPdfStructure } from "../../../src/pdfstructure.mjs";
import { doc, hex } from "./pdf.mjs";

const ENC = "<< /Filter /Standard /V 1 /R 2 /O (owner) /U (user) /P -4 >>";
const TRAILER = "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n";
const withInfo = (info, opts = {}) => doc([{ content: "" }], { objs: { 91: info }, trailer: TRAILER, ...opts });
const read = (info) => extractPdfStructure(withInfo(info));
const utf16 = (s, bom = true) => "<" + (bom ? "FEFF" : "") + Buffer.from(s, "utf16le").swap16().toString("hex") + ">";

test("R39: a literal /Title is stated exactly, with its source, beside images (top level)", async () => {
  const r = await read("<< /Title (Housing Notice) /Producer (Writer) >>");
  assert.deepEqual(r.metadata, { title: "Housing Notice", source: "/Info" });
  assert.deepEqual(Object.keys(r.metadata), ["title", "source"]);
  assert.ok(!r.notes.includes("title_undecodable"));
  const escaped = await read("<< /Title (Notice \\(Draft\\) \\101) >>");
  assert.equal(escaped.metadata.title, "Notice (Draft) A");
});

test("R39: a UTF-16BE title reads its non-ASCII letters, drops the mark and skips a language tag", async () => {
  const r = await read(`<< /Title ${utf16("Café Étude — Ωmega 😀")} >>`);
  assert.equal(r.metadata.title, "Café Étude — Ωmega 😀");
  const tagged = await read("<< /Title <FEFF001B0065006E001B00480069> >>");
  assert.deepEqual(tagged.metadata, { title: "Hi", source: "/Info" });
});

test("R39: a PDFDocEncoding title decodes each byte by that table (0x80 is a bullet, not a euro)", async () => {
  const r = await read(`<< /Title ${hex("\x80 List \x84 \xe9 \xa0")} >>`);
  assert.equal(r.metadata.title, "• List — é €");
  assert.deepEqual(r.notes.filter((n) => n.startsWith("title")), []);
});

test("R39: no /Title, an empty, whitespace-only or non-string /Title has no title key and no note", async () => {
  for (const info of ["<< /Producer (W) >>", "<< /Title () >>", "<< /Title (   ) >>", "<< /Title 12 >>", "<< /Title /Name >>",
    "<< /Title 99 0 R >>", `<< /Title ${utf16("  ")} >>`, "<< /Title <FEFF> >>"]) {
    const r = await read(info);
    assert.deepEqual(r.metadata, { source: "/Info" }, info);
    assert.ok(!("title" in r.metadata), info);
    assert.ok(!r.notes.includes("title_undecodable"), info);
  }
});

test("R39: an undecodable title is no title and notes title_undecodable, nothing replaced", async () => {
  for (const info of ["<< /Title <FEFF004800> >>", "<< /Title <FEFFD83D> >>", "<< /Title <FEFFDE00> >>",
    "<< /Title <FEFF001B0065006E0048> >>", `<< /Title ${hex("a\x7fb")} >>`, `<< /Title ${hex("a\x9fb")} >>`,
    `<< /Title ${hex("a\xadb")} >>`, `<< /Title ${hex("a\x01b")} >>`]) {
    const r = await read(info);
    assert.deepEqual(r.metadata, { source: "/Info" }, info);
    assert.ok(r.notes.includes("title_undecodable"), info);
  }
});

test("R39: metadata is null with no /Info, a dangling /Info, or an encrypted document", async () => {
  assert.equal((await extractPdfStructure(doc([{ content: "" }]))).metadata, null);
  assert.equal((await extractPdfStructure(doc([{ content: "" }], { trailer: TRAILER }))).metadata, null);
  const enc = await extractPdfStructure(withInfo("<< /Title (Secret) >>", { objs: { 90: ENC, 91: "<< /Title (Secret) >>" },
    trailer: "trailer\n<< /Root 1 0 R /Encrypt 90 0 R /Info 91 0 R >>\n" }));
  assert.equal(enc.metadata, null);
  assert.ok(!enc.notes.includes("title_undecodable"));
});

test("R39: the title comes from the /Info R10 chooses (the last candidate, falling back past a dangling one)", async () => {
  const two = "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n", later = "trailer\n<< /Root 1 0 R /Info 92 0 R >>\n";
  const objs = { 91: "<< /Title (Old) >>", 92: "<< /Title (New) >>" };
  assert.equal((await extractPdfStructure(doc([{ content: "" }], { objs, trailer: two + later }))).metadata.title, "New");
  const dangling = await extractPdfStructure(doc([{ content: "" }], { objs, trailer: two + "trailer\n<< /Root 1 0 R /Info 99 0 R >>\n" }));
  assert.equal(dangling.metadata.title, "Old");
});

test("R39: never throws on a damaged /Info", async () => {
  for (const info of ["<< /Title (unterminated", "<< /Title <FEFF00", "[ /Title (x) ]", "<< /Title 91 0 R >>"]) {
    const r = await read(info);
    assert.equal(r.ok, true, info);
  }
});
