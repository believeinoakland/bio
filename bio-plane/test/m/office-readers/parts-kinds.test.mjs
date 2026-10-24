/* office-readers, R38, R39 (fix round 9, G134a, G134d): every part of a document is a unit with its kind; a picture
 * that is the only content of a place is listed and stated unread. */
import test from "node:test";
import assert from "node:assert/strict";
import * as F from "./fixtures.mjs";
import { docxEntry } from "../../../src/docx.mjs";
import { pptxEntry } from "../../../src/pptx.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";

const KINDS = ["body", "footnote", "endnote", "header", "footer", "comment", "tracked_deletion", "text_box", "speaker_note", "master_text", "cell_note"];
const RT_W = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const byKind = (parts, kind) => parts.filter((p) => p.kind === kind);

function wordPackage() {
  const body = F.wp(F.wr("Body line one"), `<w:r><w:footnoteReference w:id="2"/></w:r>`)
    + F.wp(F.wr("Before "), `<w:del w:id="9" w:author="A" w:date="2024-01-01T00:00:00Z"><w:r><w:delText>struck wording</w:delText></w:r></w:del>`, F.wr("after"))
    + F.wp(`<w:r><w:endnoteReference w:id="3"/></w:r>`)
    + F.wp(`<w:r><w:txbxContent>${F.wp(F.wr("Inside the box"))}</w:txbxContent></w:r>`)
    + F.wp(`<w:r><w:commentReference w:id="0"/></w:r>`, F.wr("Commented"))
    + `<w:sectPr><w:headerReference w:type="default" r:id="rIdH"/><w:footerReference w:type="default" r:id="rIdF"/></w:sectPr>`;
  const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  return F.docx({
    body,
    rels: F.rels([
      { id: "rIdH", type: `${RT_W}/header`, target: "header1.xml" },
      { id: "rIdF", type: `${RT_W}/footer`, target: "footer1.xml" },
      { id: "rIdFn", type: `${RT_W}/footnotes`, target: "footnotes.xml" },
      { id: "rIdEn", type: `${RT_W}/endnotes`, target: "endnotes.xml" },
    ]),
    comments: `<w:comments ${W}><w:comment w:id="0" w:author="Pat" w:initials="P"><w:p><w:r><w:t>Margin remark $4,200</w:t></w:r></w:p></w:comment></w:comments>`,
    extra: [
      { name: "word/header1.xml", data: `<w:hdr ${W}><w:p><w:r><w:t>Running head</w:t></w:r></w:p></w:hdr>` },
      { name: "word/footer1.xml", data: `<w:ftr ${W}><w:p><w:r><w:t>Page foot</w:t></w:r></w:p></w:ftr>` },
      { name: "word/footnotes.xml", data: `<w:footnotes ${W}><w:footnote w:type="separator" w:id="0"><w:p><w:r><w:separator/></w:r></w:p></w:footnote><w:footnote w:id="2"><w:p><w:r><w:t>Footnote costs $1,234,567</w:t></w:r></w:p></w:footnote></w:footnotes>` },
      { name: "word/endnotes.xml", data: `<w:endnotes ${W}><w:endnote w:id="3"><w:p><w:r><w:t>An endnote</w:t></w:r></w:p></w:endnote></w:endnotes>` },
    ],
  });
}

test("R38 docx: footnotes, endnotes, headers, footers, comments, tracked deletions and text boxes are units, each with its kind, ref and part; document stays the body", async () => {
  const t = await docxEntry.text(wordPackage());
  assert.equal(t.ok, true);
  for (const p of t.parts) assert.ok(KINDS.includes(p.kind), p.kind);
  const one = (k) => { const l = byKind(t.parts, k); assert.equal(l.length, 1, `${k}: one unit`); return l[0]; };
  assert.equal(one("footnote").text, "Footnote costs $1,234,567");
  assert.equal(one("footnote").part, "word/footnotes.xml");
  assert.deepEqual(one("footnote").ref, { kind: "doc-para", ref: "¶1", para: 0, run: 1 });
  assert.equal(one("endnote").text, "An endnote");
  assert.equal(one("endnote").part, "word/endnotes.xml");
  assert.equal(one("header").text, "Running head");
  assert.equal(one("footer").text, "Page foot");
  assert.equal(one("comment").text, "Margin remark $4,200");
  assert.equal(one("comment").part, "word/comments.xml");
  assert.equal(one("tracked_deletion").text, "struck wording");
  assert.equal(one("text_box").text, "Inside the box");
  /* the lists R11 describes are unchanged: the body's text, no deleted wording, no part text */
  assert.ok(t.document.includes("Body line one") && t.document.includes("Before after"));
  assert.ok(!t.document.includes("struck wording") && !t.document.includes("Footnote costs") && !t.document.includes("Running head"));
  /* the same on a second call and from parts() */
  const again = await docxEntry.text(await docxEntry.parts(wordPackage()));
  assert.deepEqual(again.parts, t.parts);
});

test("R38 docx: a package with no part outside the body has parts: []; a part the reader cannot read is stated, never a reading that says it is whole", async () => {
  const plain = await docxEntry.text(F.docx());
  assert.deepEqual(plain.parts, []);
  const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  const t = await docxEntry.text(F.docx({ extra: [{ name: "word/diagrams/data1.xml", data: "<dgm/>" }, { name: "word/footnotes.xml", data: `<w:footnotes ${W}/>` }] }));
  assert.ok(t.undetermined.some((u) => u.part === "word/diagrams/data1.xml" && u.why === "part_unread"));
});

function deckWith(extra = {}) {
  return F.pptx({
    slides: [
      { file: "slide1.xml", texts: ["Public slide"], notes: "Speaker says $9,876,543" },
      { file: "slide2.xml", texts: ["Secret hidden slide"], show: "0" },
      { file: "slide3.xml", xml: `<?xml version="1.0"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:sp><p:nvSpPr><p:cNvPr id="2" name="Box"/><p:cNvSpPr txBox="1"/></p:nvSpPr><p:txBody><a:p><a:r><a:t>Text box words</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>` },
    ],
    extra: [
      { name: "ppt/slideMasters/slideMaster1.xml", data: F.slideXml(["Master title style"]) },
      { name: "ppt/slideLayouts/slideLayout1.xml", data: F.slideXml(["Layout body text"]) },
      ...(extra.members ?? []),
    ],
  });
}

test("R38 pptx: speaker notes, master and layout text, text boxes and a hidden slide's text are units with their kind; hidden is marked", async () => {
  const t = await pptxEntry.text(deckWith());
  assert.equal(t.ok, true);
  for (const p of t.parts) assert.ok(KINDS.includes(p.kind), p.kind);
  const note = byKind(t.parts, "speaker_note");
  assert.equal(note.length, 1);
  assert.equal(note[0].text, "Speaker says $9,876,543");
  assert.deepEqual(note[0].ref, { kind: "slide-shape", ref: "slide 1", slide: 1 });
  assert.deepEqual(byKind(t.parts, "master_text").map((p) => p.text).sort(), ["Layout body text", "Master title style"]);
  const box = byKind(t.parts, "text_box");
  assert.equal(box.length, 1);
  assert.equal(box[0].text, "Text box words");
  assert.equal(box[0].ref.slide, 3);
  const hidden = t.parts.filter((p) => p.hidden === true);
  assert.deepEqual(hidden.map((p) => [p.kind, p.text]), [["body", "Secret hidden slide"]]);
  assert.ok(t.document.includes("Secret hidden slide"), "R23: a hidden slide is still in the document");
  assert.ok(!t.document.includes("Speaker says") && !t.document.includes("Master title"), "document stays the slides' text");
});

test("R38 xlsx: a cell comment is a cell_note unit citing its cell; a part that can hold other text is stated unread", async () => {
  const S = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
  const bytes = F.xlsx({
    sheets: [{ name: "Sheet1", data: { rows: [{ r: 1, cells: [{ r: "A1", t: "inlineStr", is: "x" }] }] }, rels: [{ id: "rIdC", type: `${RT_W}/comments`, target: "../comments1.xml" }] }],
    extra: [
      { name: "xl/comments1.xml", data: `<comments ${S}><authors><author>Pat</author></authors><commentList><comment ref="B2" authorId="0"><text><r><t>Check the $5,000 total</t></r></text></comment></commentList></comments>` },
      { name: "xl/drawings/drawing1.xml", data: "<d/>" },
    ],
  });
  const t = await xlsxEntry.text(bytes);
  assert.equal(t.ok, true);
  assert.equal(t.parts.length, 1);
  assert.equal(t.parts[0].kind, "cell_note");
  assert.equal(t.parts[0].text, "Check the $5,000 total");
  assert.equal(t.parts[0].part, "xl/comments1.xml");
  assert.deepEqual(t.parts[0].ref, { kind: "sheet-cell", ref: "Sheet1!B2", sheet: "Sheet1", cell: "B2" });
  assert.ok(t.undetermined.some((u) => u.part === "xl/drawings/drawing1.xml" && u.why === "part_unread"));
  assert.ok(!t.document.includes("Check the"), "document stays the sheets' text");
});

test("R39 a docx paragraph or a pptx slide whose only content is a picture lists the picture and states it unread with its ref", async () => {
  const body = F.wp(F.wr("Words")) + F.wp(`<w:r><w:drawing><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData><pic:pic xmlns:pic="p"><pic:blipFill><a:blip r:embed="rIdImg"/></pic:blipFill></pic:pic></a:graphicData></a:graphic></w:drawing></w:r>`);
  const d = await docxEntry.text(F.docx({
    body,
    rels: F.rels([{ id: "rIdImg", type: F.RT.image, target: "media/pic.png" }]),
    extra: [{ name: "word/media/pic.png", data: "PNGDATA" }],
  }));
  assert.equal(d.ok, true);
  assert.ok(d.images && d.images.length === 1, "the picture is listed");
  const marker = d.undetermined.find((u) => u.why === "image_unread");
  assert.ok(marker);
  assert.deepEqual(marker.ref, { kind: "doc-para", ref: "¶2", para: 1 });
  const p = await pptxEntry.text(F.pptx({
    slides: [{ file: "slide1.xml", xml: `<?xml version="1.0"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:cSld><p:spTree><p:pic><p:blipFill><a:blip r:embed="rId2"/></p:blipFill></p:pic></p:spTree></p:cSld></p:sld>` }],
    extra: [{ name: "ppt/media/p.png", data: "PNG" }],
  }));
  assert.equal(p.ok, true);
  assert.ok(p.images.length === 1);
  const pm = p.undetermined.find((u) => u.why === "image_unread");
  assert.ok(pm);
  assert.equal(pm.ref.slide, 1);
  /* control: a slide with words and a picture states nothing */
  const ok = await pptxEntry.text(F.pptx({ slides: [{ file: "slide1.xml", texts: ["Words"] }] }));
  assert.ok(!ok.undetermined.some((u) => u.why === "image_unread"));
});
