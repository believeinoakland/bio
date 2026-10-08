/* doc-clean R5: each copy checked independently of this module. A PDF copy passes `qpdf --check` and opens in pdf.js
 * with the same pages and text as its original; a package copy passes Info-ZIP's `unzip -t` and opens in LibreOffice
 * with the same text as its original. The text pdf-reader, office-readers and odf-reader answer is the same for the
 * copy as for the original, except the metadata R6 removes (and an image's content address, which R2 changes), and
 * none of that metadata is in the copy. A check whose tool is missing is skipped by name, never passed. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { deflateSync } from "node:zlib";
import { pathToFileURL } from "node:url";
import { cleanDocument } from "../../../src/doc-clean/index.mjs";
import { extractPdfStructure } from "../../../src/pdfstructure.mjs";
import { docxEntry } from "../../../src/docx.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { pptxEntry } from "../../../src/pptx.mjs";
import { odtEntry, odsEntry, odpEntry } from "../../../src/odf.mjs";
import { SECRETS, has, jpeg, pdf, incremental, objStm, makePdf, enc, docx, xlsx, pptx, odf } from "./fixtures.mjs";

const ran = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: "utf8" }); return !r.error; };
const NO_QPDF = ran("qpdf", ["--version"]) ? false : "qpdf is not installed";
const NO_UNZIP = ran("unzip", ["-v"]) ? false : "Info-ZIP unzip is not installed";
const NO_SOFFICE = ran("soffice", ["--version"]) ? false : "LibreOffice (soffice) is not installed";
const NO_PDFTOTEXT = ran("pdftotext", ["-v"]) ? false : "pdftotext is not installed";
function pdfjsPath() {
  for (const from of [process.env.PDFJS_DIST, new URL("../../../", import.meta.url).pathname].filter(Boolean)) {
    try { return createRequire(join(from, "x.js")).resolve("pdfjs-dist/legacy/build/pdf.mjs"); } catch {}
    const direct = join(from, "legacy/build/pdf.mjs");
    if (existsSync(direct)) return direct;
  }
  return null;
}
const PDFJS = pdfjsPath();
const NO_PDFJS = PDFJS ? false : "pdfjs-dist is not installed (bio-plane, or $PDFJS_DIST)";
const DIR = mkdtempSync(join(tmpdir(), "doc-clean-oracles-"));

const PDFS = {
  plain: pdf(),
  incremental: incremental(pdf(), jpeg({ meta: false })),
  annotated: pdf({ page: "/Annots [9 0 R]", more: ["<< /Type /Annot /Subtype /Text /Rect [0 0 10 10] /T (COMMENTERSECRET) /M (D:20190304) /Contents (Check this) >>"] }),
  objectStream: makePdf(["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R 9 0 R] /Count 2 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 8 0 R >> /XObject << /Im 5 0 R >> >> /Contents 4 0 R >>",
    { dict: "<< /Filter /FlateDecode >>", data: new Uint8Array(deflateSync("BT /F1 12 Tf 20 150 Td (Page one) Tj ET q 30 0 0 30 20 20 cm /Im Do Q")) },
    { dict: "<< /Type /XObject /Subtype /Image /Width 8 /Height 8 /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /DCTDecode >>", data: jpeg() },
    { dict: "<< >>", data: enc("BT /F1 12 Tf 20 150 Td (Page two) Tj ET") },
    objStm(8, ["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 8 0 R >> >> /Contents 6 0 R >>"])]),
};
/** What each PDF's pages show. */
const SHOWN = { plain: ["Hello"], incremental: ["Hello"], annotated: ["Hello"], objectStream: ["Page one", "Page two"] };

const PACKAGES = { docx: [docx(), docxEntry], xlsx: [xlsx(), xlsxEntry], pptx: [pptx(), pptxEntry], odt: [odf("odt"), odtEntry], ods: [odf("ods"), odsEntry], odp: [odf("odp"), odpEntry] };

async function copies(table) {
  const out = {};
  for (const [k, v] of Object.entries(table)) {
    const original = Array.isArray(v) ? v[0] : v;
    const r = await cleanDocument(original);
    assert.equal(r.ok, true, `${k}: ${r.detail}`);
    assert.equal(r.clean, false);
    out[k] = { original, copy: r.bytes };
  }
  return out;
}

test("R5 a PDF copy passes qpdf --check", { skip: NO_QPDF }, async () => {
  for (const [k, { copy }] of Object.entries(await copies(PDFS))) {
    const f = join(DIR, `qpdf-${k}.pdf`);
    writeFileSync(f, copy);
    const r = spawnSync("qpdf", ["--check", f], { encoding: "utf8" });
    assert.equal(r.status, 0, `${k}: ${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /No syntax or stream encoding errors found/);
  }
});

test("R5 a PDF copy opens in pdf.js and shows its original's pages and text", { skip: NO_PDFJS }, async () => {
  const pdfjs = await import(pathToFileURL(PDFJS).href);
  const read = async (bytes) => {
    const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), verbosity: 0, isEvalSupported: false }).promise;
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) pages.push((await (await doc.getPage(i)).getTextContent()).items.map((x) => x.str).join(""));
    const info = (await doc.getMetadata()).info;
    await doc.destroy();
    return { pages, author: info.Author ?? null, creator: info.Creator ?? null };
  };
  for (const [k, { copy }] of Object.entries(await copies(PDFS))) {
    const b = await read(copy);
    assert.deepEqual(b.pages, SHOWN[k], k);
    assert.deepEqual([b.author, b.creator], [null, null], `${k}: no /Info in the copy`);
  }
});

test("R5 pdf-reader answers the same text, pages and images for a PDF copy as for its original, and no metadata is in the copy", async () => {
  for (const [k, { original, copy }] of Object.entries(await copies(PDFS))) {
    const a = await extractPdfStructure(original), b = await extractPdfStructure(copy);
    assert.equal(b.ok, true);
    assert.equal(b.pages, a.pages, k);
    assert.deepEqual(b.text.pages, a.text.pages, k);
    assert.equal(b.text.document, a.text.document, k);
    assert.deepEqual(b.images.map(({ rect, mime, width, height }) => ({ rect, mime, width, height })), a.images.map(({ rect, mime, width, height }) => ({ rect, mime, width, height })), k);
    assert.equal(b.text.producer.producer, null, k);
    assert.deepEqual(SECRETS.filter((s) => has(copy, s)), [], k);
  }
});

test("R5 a package copy passes Info-ZIP's unzip -t", { skip: NO_UNZIP }, async () => {
  for (const [k, { copy }] of Object.entries(await copies(PACKAGES))) {
    const f = join(DIR, `unzip-copy.${k}`);
    writeFileSync(f, copy);
    const r = spawnSync("unzip", ["-t", f], { encoding: "utf8" });
    assert.equal(r.status, 0, `${k}: ${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /No errors detected/);
  }
});

test("R5 a package copy opens in LibreOffice and shows its original's text", { skip: NO_SOFFICE || NO_PDFTOTEXT, timeout: 600_000 }, async () => {
  const lo = (to, out, files) => spawnSync("soffice", [`-env:UserInstallation=${pathToFileURL(join(DIR, "lo-profile")).href}`, "--headless", "--convert-to", to, "--outdir", out, ...files], { encoding: "utf8", timeout: 270_000 });
  /* LibreOffice 24 cannot load this file's hand-written .ods (with or without its comment), so the spreadsheet it
   * checks is one LibreOffice writes itself from the .xlsx fixture, metadata, comment and all. */
  const xf = join(DIR, "lo-source.xlsx");
  writeFileSync(xf, xlsx());
  lo("ods", DIR, [xf]);
  const table = { ...PACKAGES, ods: [readFileSync(join(DIR, "lo-source.ods")), odsEntry] };
  const all = await copies(table), files = [];
  for (const [k, { original, copy }] of Object.entries(all)) {
    for (const [which, bytes] of [["original", original], ["copy", copy]]) {
      const f = join(DIR, `lo-${which}-${k}.${k}`);
      writeFileSync(f, bytes);
      files.push(f);
    }
  }
  const out = join(DIR, "lo-out"), sheet = (f) => /(^|\.)(xlsx|ods)$/.test(f);
  for (const [to, group] of [["pdf", files.filter((f) => !sheet(f))], ["csv", files.filter(sheet)]]) {
    const r = lo(to, out, group);
    assert.equal(r.status, 0, r.stderr);
  }
  const shown = (which, k) => {
    const made = join(out, `lo-${which}-${k}.${sheet(k) ? "csv" : "pdf"}`);
    assert.ok(existsSync(made), `${which} ${k} converted`);
    return sheet(k) ? readFileSync(made, "utf8") : spawnSync("pdftotext", [made, "-"], { encoding: "utf8" }).stdout;
  };
  for (const k of Object.keys(all)) {
    const a = shown("original", k), b = shown("copy", k);
    assert.ok(b.trim().length > 0, k);
    assert.equal(b, a, k);
    assert.deepEqual(SECRETS.filter((s) => b.includes(s)), [], k);
  }
});

test("R5 office-readers and odf-reader answer the same text for a package copy as for its original, with none of R6's metadata in the copy", async () => {
  const strip = (t) => JSON.parse(JSON.stringify({ ...t, metadata: undefined, images: t.images?.map(({ mime, name }) => ({ mime, name })) }));
  for (const [k, { original, copy }] of Object.entries(await copies(PACKAGES))) {
    const entry = PACKAGES[k][1];
    const a = await entry.text(original), b = await entry.text(copy);
    assert.equal(b.ok, true, k);
    assert.deepEqual(strip(b), strip(a), k);
    if (b.metadata) assert.deepEqual([b.metadata.author, b.metadata.lastModifiedBy, b.metadata.created, b.metadata.modified], [null, null, null, null], k);
    const s = await entry.structure(copy);
    const items = s.evidentiary?.items ?? [];
    for (const it of items.filter((x) => x.kind === "comment" || x.kind === "tracked-change")) {
      assert.ok(!it.author, `${k}: ${it.kind} author ${it.author}`);
      assert.ok(!it.date, `${k}: ${it.kind} date ${it.date}`);
      if (it.kind === "comment") assert.ok(!it.initials, `${k}: comment initials ${it.initials}`);
    }
    if (k === "docx" || k === "odt") assert.ok(items.some((x) => x.kind === "comment" && /Check this figure/.test(x.text)), `${k}: the comment's text kept`);
    assert.deepEqual(SECRETS.filter((x) => JSON.stringify(s).includes(x) || JSON.stringify(b).includes(x)), [], k);
  }
});
