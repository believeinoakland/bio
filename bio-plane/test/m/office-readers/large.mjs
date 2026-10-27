/* Large-file fixtures for the office-readers suite (fix round 4b, F7; R35): real
 * packages whose declared text parts are over the 20 MiB bound, each built from
 * a seeded generator so a run draws nothing from a clock or the system's
 * randomness, and each returned with the document text its reader must give
 * back, computed here by a route that shares no code with the reader. */
import { zip, enc, sheetXml, slideXml, skeleton, wdoc, xlsx, pptx, docx, sst, rels, RT, CORRUPT } from "./fixtures.mjs";

const ALNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** xorshift32: the same sequence for the same seed. */
export function prng(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return x;
  };
}

/** `n` characters of letters and digits: close to incompressible, so the
 *  package is nearly as large as the text it carries. */
export function randomText(rand, n) {
  let s = "";
  for (let i = 0; i < n; i++) s += ALNUM[rand() % 62];
  return s;
}

export const MIB = 1024 * 1024;

/** An XLSX with one sheet of `rows` rows: a number, five inline strings of
 *  `strLen` characters, and every 50th row a formula with its cached value.
 *  `expected` is the document text the reader must give, `declared` the sheet
 *  part's size, `formulas` how many formula cells it holds. */
export function bigXlsx({ rows, strLen = 400, seed = 7 }) {
  const rand = prng(seed);
  const parts = [];
  const lines = [];
  let formulas = 0;
  for (let r = 1; r <= rows; r++) {
    const strs = [0, 1, 2, 3, 4].map(() => randomText(rand, strLen));
    const cells = [`<c r="A${r}"><v>${r}</v></c>`];
    const vals = [String(r)];
    strs.forEach((s, i) => {
      cells.push(`<c r="${"BCDEF"[i]}${r}" t="inlineStr"><is><t>${s}</t></is></c>`);
      vals.push(s);
    });
    if (r % 50 === 0) {
      cells.push(`<c r="G${r}"><f>A${r}*2</f><v>${r * 2}</v></c>`);
      vals.push(String(r * 2));
      formulas++;
    }
    parts.push(`<row r="${r}">${cells.join("")}</row>`);
    lines.push(vals.join("\t"));
  }
  const xml = sheetXml({}).replace("<sheetData></sheetData>", `<sheetData>${parts.join("")}</sheetData>`);
  const bytes = xlsx({ sheets: [{ name: "Big", xml }] });
  return { bytes, expected: lines.join("\n"), declared: enc(xml).length, formulas, rows, usedCols: formulas ? 7 : 6 };
}

/** A DOCX of `paras` paragraphs of `strLen` characters, a 2x2 table every 200
 *  paragraphs and an insertion every 500. */
export function bigDocx({ paras, strLen = 600, seed = 11 }) {
  const rand = prng(seed);
  const body = [];
  const texts = [];
  let tables = 0, insertions = 0;
  const p = (t) => { body.push(`<w:p><w:r><w:t>${t}</w:t></w:r></w:p>`); texts.push(t); };
  for (let i = 1; i <= paras; i++) {
    const t = randomText(rand, strLen);
    if (i % 500 === 0) {
      body.push(`<w:p><w:ins w:author="A" w:date="2026-01-01T00:00:00Z"><w:r><w:t>${t}</w:t></w:r></w:ins></w:p>`);
      texts.push(t);
      insertions++;
    } else p(t);
    if (i % 200 === 0) {
      body.push(`<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/></w:tblGrid>`);
      for (let r = 0; r < 2; r++) {
        body.push(`<w:tr>`);
        for (let c = 0; c < 2; c++) {
          const ct = randomText(rand, 20);
          body.push(`<w:tc><w:p><w:r><w:t>${ct}</w:t></w:r></w:p></w:tc>`);
          texts.push(ct);
        }
        body.push(`</w:tr>`);
      }
      body.push(`</w:tbl>`);
      tables++;
    }
  }
  const document = wdoc(body.join(""));
  return { bytes: docx({ document }), expected: texts.filter((t) => t.length).join("\n"),
    declared: enc(document).length, paragraphs: texts.length, tables, insertions };
}

/** A PPTX of `slides` slides, each of `shapes` text shapes of `strLen` characters. */
export function bigPptx({ slides, shapes = 100, strLen = 5000, seed = 13 }) {
  const rand = prng(seed);
  const deck = [];
  const slideTexts = [];
  let declared = 0;
  for (let i = 1; i <= slides; i++) {
    const texts = Array.from({ length: shapes }, () => randomText(rand, strLen));
    const xml = slideXml(texts);
    declared += enc(xml).length;
    deck.push({ file: `slide${i}.xml`, xml });
    slideTexts.push(texts.join("\n"));
  }
  return { bytes: pptx({ slides: deck }), slideTexts, expected: slideTexts.join("\n"), declared };
}

/** An XLSX of 28,000 numbered rows, `rows` of them carrying a shared-string cell, with a hidden row, a hidden
 *  column, hyperlinks after the rows and a sharedStrings part: what a sheet read in pieces has to carry across its
 *  pieces. `expected` is the document text. */
export function structuredXlsx({ rows = 28000 } = {}) {
  const strings = Array.from({ length: 5 }, (_, i) => `shared ${i} & more`);
  const parts = [];
  const lines = [];
  for (let r = 1; r <= rows; r++) {
    const si = r % 5;
    const filler = "x".repeat(700);
    parts.push(`<row r="${r}"${r === 9 ? ' hidden="1"' : ""}><c r="A${r}" t="s"><v>${si}</v></c><c r="B${r}" t="inlineStr"><is><t>${filler}</t></is></c></row>`);
    lines.push(`${strings[si]}\t${filler}`);
  }
  const xml = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">`
    + `<cols><col min="2" max="2" hidden="1"/></cols><sheetData>${parts.join("")}</sheetData>`
    + `<hyperlinks><hyperlink ref="A1" r:id="rId1"/><hyperlink ref="A${rows}" location="Sheet1!A1"/></hyperlinks></worksheet>`;
  const bytes = xlsx({
    sheets: [{ name: "Sheet1", xml, rels: [{ id: "rId1", type: RT.hyperlink, target: "http://example.org/", external: true }] }],
    sharedStrings: sst(strings.map((t) => t.replace("&", "&amp;"))),
  });
  return { bytes, expected: lines.join("\n"), declared: enc(xml).length, rows };
}

/** An XLSX whose one sheet is `megabytes` MiB of rows, its CRC declared wrong. */
export function corruptBigXlsx(megabytes = 21) {
  const row = (i) => `<row r="${i}"><c r="A${i}"><v>${i}</v></c></row>`;
  let body = "";
  for (let i = 1; body.length < megabytes * MIB; i++) body += row(i);
  const xml = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
  return xlsx({ sheets: [{ name: "Big", xml, cd: CORRUPT }] });
}

/** An XLSX whose one sheet is a single row of `megabytes` MiB of cells: no place to end a piece. */
export function oneRowXlsx(megabytes = 21) {
  let cells = "";
  for (let i = 1; cells.length < megabytes * MIB; i++) cells += `<c r="A${i}"><v>${i}</v></c>`;
  const xml = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1">${cells}</row></sheetData></worksheet>`;
  return { bytes: xlsx({ sheets: [{ name: "Wide", xml }] }), declared: enc(xml).length };
}

/** A DOCX whose paragraphs carry a `>` inside an attribute value and in their text, with a comment, so a piece cut
 *  at a `>` falls inside a tag now and then. */
export function angleDocx({ paras = 36000, strLen = 640, seed = 19 } = {}) {
  const rand = prng(seed);
  const body = [];
  const texts = [];
  for (let i = 1; i <= paras; i++) {
    const t = randomText(rand, strLen);
    body.push(`<w:p w:rsidR="a>b${i}"><w:r><w:t>${t}</w:t></w:r><w:r><w:t xml:space="preserve"> 1 > 0 </w:t></w:r></w:p>`);
    texts.push(`${t} 1 > 0 `);
  }
  const document = wdoc(body.join("")).replace("<w:body>", `<w:body><w:p><w:commentRangeStart w:id="0"/><w:r><w:t>commented</w:t></w:r><w:r><w:commentReference w:id="0"/></w:r></w:p>`);
  texts.unshift("commented");
  const comments = `<?xml version="1.0"?><w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:comment w:id="0" w:author="Reviewer" w:date="2026-02-02T00:00:00Z" w:initials="R"><w:p><w:r><w:t>check this</w:t></w:r></w:p></w:comment></w:comments>`;
  return { bytes: docx({ document, comments }), expected: texts.join("\n"), declared: enc(document).length, paragraphs: texts.length };
}

/** A PPTX of `slides` slides of `strLen`-character shapes, slide 3 hidden by its own root and slide 2 with notes. */
export function hiddenPptx({ slides = 64, shapes = 100, strLen = 5000, seed = 23 } = {}) {
  const rand = prng(seed);
  const deck = [];
  for (let i = 1; i <= slides; i++) {
    const texts = Array.from({ length: shapes }, () => randomText(rand, strLen));
    deck.push({ file: `slide${i}.xml`, texts, show: i === 3 ? "0" : null, notes: i === 2 ? "speaker words" : undefined });
  }
  return { bytes: pptx({ slides: deck }), slides };
}

/** A PPTX with one slide of `megabytes` MiB: over the bound by itself. */
export function oneBigSlidePptx(megabytes = 21) {
  const rand = prng(29);
  const texts = Array.from({ length: Math.ceil(megabytes * MIB / 5000) }, () => randomText(rand, 5000));
  const xml = slideXml(texts);
  return { bytes: pptx({ slides: [{ file: "slide1.xml", xml }, { file: "slide2.xml", texts: ["after"] }] }), declared: enc(xml).length };
}

export { skeleton, rels };
