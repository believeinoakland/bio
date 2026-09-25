/* The CSV registry entry (QUEUE FW-23) — the ninth format on COFF-1's axis and
 * the first that is NOT a container. Driven against fixtures BUILT HERE; no
 * binary is committed and nothing here reaches the network, so this suite
 * passes on every machine the plane runs on.
 *
 * THE FIXTURES ARE HAND-BUILT AND THE GRAMMAR IS COPIED FROM A MEASURED PAGE,
 * not from RFC 4180. On 2026-09-24 all 166 `.csv` keys of `s3://cao-94612`
 * were fetched WHOLE (90,402,768 B) and read through THIS ENTRY: 166/166
 * detected, 166/166 comma, 146 UTF-8 BOM, 18 ASCII-only, 1 UTF-8 by validity,
 * 1 ENCODING UNDETERMINED, 1 over the size bound, 778,830 cells. Every shape
 * below that says MEASURED is a shape a real corpus body has; the figures are
 * in `measurements/M-144.md`.
 *
 * WHAT THE FIXTURES CANNOT SEE, stated rather than implied: one publisher's
 * pipeline. The corpus is a single Oakland bucket, its CSVs are overwhelmingly
 * one system's exports, and NO body in it carried a UTF-16 BOM, a semicolon, a
 * tab or a pipe delimiter. Those four arms are driven by FIXTURE ONLY and are
 * UNMEASURED IN THE WILD.
 *
 * THE ACCEPTS-WHEN ("a CSV reads as addressed cells with delimiter and
 * encoding recorded"), all present:
 *   - the entry detects by CONTENT TYPE through the registry's own pass 2, and
 *     NEVER by bytes — driven over real CSV bytes and over the planted prose
 *     shapes that make byte detection dishonest
 *   - a body reads as cells addressed `sheet-cell` / `sheet-range`, 1-based,
 *     with row 1 emitted AS row 1 and no header consumed
 *   - the delimiter and the encoding are RECORDED on the reading, both in
 *     structure() and in text(), from ONE builder
 *   - each is UNDETERMINED by name when the bytes do not tell, and the grid
 *     survives an undetermined encoding while the affected CELLS do not
 *   - no new IC-1 union member, and the same key roster the other two
 *     spreadsheet containers emit
 *   - adding the format cost ONE registerFormat call: index.mjs is grepped for
 *     the name and must carry NONE (the D-70 property)
 */
/* NEGATIVE CONTROL: five arms and a baseline, each armed ALONE with every other defence held open, re-runnable in one step with `node test/nc-fw23.mjs [arm]` from `bio-plane/` (the pristine copies go to the SESSION SCRATCHPAD, never into the worktree — BOB #32, 2026-09-24). (1) `guessdelimiter` — THE ROW'S OWN DECLARED ARM: when the signature determines nothing, fall back to a comma. MUST FAIL the undetermined-delimiter assertions BY NAME; MUST NOT move any body whose delimiter IS determined. (2) `guessencoding` — emit the cells of the undetermined-encoding body ANYWAY, i.e. hand out the byte transport's own decoding (latin-1) as if it were the text, instead of stating the undetermined. MUST FAIL the per-cell undetermined assertions and the never-mojibake assertion; MUST NOT move any determined-encoding body. (3) `sniffbytes` — let detect() answer `csv` from the delimiter signature over BYTES, which is the shape this item MEASURED to be dishonest. MUST FAIL the planted-prose assertions and the bytes-answer-null assertions; MUST NOT move the content-type pass. (4) `headerrow` — consume record 1 as a header, so row 1 is not row 1. MUST FAIL the row-1 and the cell-address assertions. (5) OVER-STRICTNESS, the sibling entries: `formats-xlsx`, `formats-odf`, `formats-docx`, `formats-pptx`, `ooxml` and `formats` must be UNMOVED by every arm, because an arm inside csv.mjs that moves another entry's output is an arm that moved two variables. RUN 2026-09-24, ALL FOUR AS DECLARED, baseline csv 75/0 · xlsx 88/0 · odf 142/0 · docx 82/0 · pptx 118/0 · ooxml 167/0 · registry 35/0, every restore verified by sha256 AND by `cmp` against a uniquely-named per-arm pristine copy with a 31,642-byte count printed and an 18,000-byte floor guarded: guessdelimiter 2/2 declared (2 failing), guessencoding 4/4 (4), sniffbytes 3/3 (3), headerrow 5/5 (13). NO SIBLING MOVED UNDER ANY ARM. TWO THINGS RECORDED RATHER THAN SMOOTHED: (a) `headerrow` also broke EIGHT assertions nobody declared — dropping record 1 moves nearly every reading in the suite, which says the row-1 rule is load-bearing rather than decorative, and the five declared ones all fired; (b) the harness's own BASELINE ROW earned its place on its first run, reading `ooxml -1/-1` because that suite prints "N passed, M failed" where every other prints "N pass, M fail" — a green suite reported as no-tally, caught by the baseline and not by any arm. */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
import { detectFormat, getFormat, listFormats } from "../src/formats.mjs";
import {
  csvEntry, csvCellRef, encodingSignature, delimiterSignature, walkRecords,
  CSV_CONTENT_TYPE, CSV_SHEET_NAME, MEASURED_CSV_TEXT_BOUND_BYTES,
} from "../src/csv.mjs";
/* The two sibling spreadsheet containers, for the three-way key-roster pin at
 * the foot: the claim IC-100 rests on is that ONE consumer reads every
 * spreadsheet container by key presence, and a third container is the test of
 * it. Imported rather than described in prose in three files that could drift. */
import { xlsxEntry } from "../src/formats-xlsx.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const BOM = [0xef, 0xbb, 0xbf];
const enc = new TextEncoder();
/** A body from a string, optionally with a BOM, optionally with raw bytes
 *  spliced in — the only way to build the encoding arms honestly. */
function body(text, { bom = false, raw = null } = {}) {
  const head = bom ? Uint8Array.from(BOM) : new Uint8Array(0);
  const tail = raw ? Uint8Array.from(raw) : enc.encode(text);
  const out = new Uint8Array(head.length + tail.length);
  out.set(head, 0); out.set(tail, head.length);
  return out;
}
const read = async (b) => {
  const parts = await csvEntry.parts(b);
  return { parts, structure: await csvEntry.structure(parts), text: await csvEntry.text(parts) };
};

/* ---- independent crc32 + zip assembler, for the xlsx package the key-roster
 * pin at the foot compares against (the ooxml.test.mjs pattern: a fixture
 * builder must not inherit a defect from the module under test). Copied from
 * `formats-odf.test.mjs`, which copied it from `ooxml.test.mjs`. ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
function u16le(n) { return Buffer.from([n & 0xff, (n >> 8) & 0xff]); }
function u32le(n) { return Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]); }
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf-8");
    const comp = deflateRawSync(data);
    const crc = crc32(data);
    const local = Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(8), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(8), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0), u32le(0), u32le(offset), nameB,
    ]);
    locals.push(local); centrals.push(central); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    u32le(0x06054b50), u16le(0), u16le(0), u16le(files.length), u16le(files.length),
    u32le(cd.length), u32le(offset), u16le(0),
  ]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

/* THE CORPUS'S OWN SHAPE, hand-copied from `data/CSV-SPARE-status-upload-
   20200220.csv` and `data/20230609update2.csv`: a UTF-8 BOM, CRLF records, a
   three-column header row, and a quoted date field holding a comma — which is
   the shape that broke D-66's first budget reader (M-126 arm N2) and is why the
   count is taken OUTSIDE quotes. */
const SPARE = body('APN,Status,Status Date\r\n15-1281-24,Additional Information Requested,"February 27, 2023"\r\n36-2416-10-1,Exemption Approved,"March 1, 2023"\r\n', { bom: true });

/* ================================================================== */
console.log("\n--- the registry carries a ninth entry, and that is the WHOLE cost (D-70) ---");
{
  const roster = listFormats();
  t("csv is registered", roster.includes("csv"), true);
  t("reachable by name through the registry", getFormat("csv") === csvEntry, true);
  t("it fills all four I7 slots",
    ["detect", "parts", "structure", "text"].every((s) => typeof getFormat("csv")[s] === "function"), true);

  /* THE D-70 PROPERTY, DRIVEN AND NOT ASSERTED: the control plane must never
     have learned this name. Measured before the landing: index.mjs held the
     substring "csv" zero times. */
  const indexSrc = readFileSync(new URL("../src/index.mjs", import.meta.url), "utf-8");
  t("index.mjs never names the format — the registry is the only dispatch",
    /csv/i.test(indexSrc), false);
  const formatsSrc = readFileSync(new URL("../src/formats.mjs", import.meta.url), "utf-8");
  t("formats.mjs registers it exactly once",
    (formatsSrc.match(/registerFormat\(csvEntry\)/g) ?? []).length, 1);
}

/* ================================================================== */
console.log("\n--- detection: the DECLARED TYPE answers, and the BYTES never do ---");
{
  t("bytes alone: the entry declines, over a real corpus shape",
    csvEntry.detect(SPARE, null), null);
  t("and the REGISTRY's pass 1 therefore answers undetermined for those bytes",
    detectFormat(SPARE, null).format, "undetermined");
  t("with the declared type, pass 2 answers csv at LIKELY — never certain",
    [detectFormat(SPARE, CSV_CONTENT_TYPE).format, detectFormat(SPARE, CSV_CONTENT_TYPE).confidence],
    ["csv", "likely"]);
  t("the type is folded for case (RFC 2045), which no corpus body needed",
    detectFormat(null, "TEXT/CSV").format, "csv");
  t("and its parameters are the caller's to strip, exactly as for text/html",
    detectFormat(null, "text/csv; charset=utf-8").format, "undetermined");
  t("the two older spellings answer, LABELLED unmeasured in this corpus",
    [detectFormat(null, "application/csv").format, detectFormat(null, "text/comma-separated-values").format],
    ["csv", "csv"]);
  t("a type nobody registered is still undetermined, not swept up by csv",
    detectFormat(null, "text/tab-separated-values").format, "undetermined");

  /* THE FINDING, DRIVEN. These are the shapes the corpus does not hold — it
     carries ONE .txt in 43,283 keys — and they are why detect() ignores bytes:
     at a two-line minimum 5 of these 8 fired the candidate signature, a
     hard-wrapped prose paragraph among them. Every one must be declined. */
  const PROSE = {
    "hard-wrapped prose, one comma a line":
      "The council met on Tuesday, and the item was held.\r\nThe report was filed by staff, who recommended approval.\r\nA member objected to the schedule, citing the notice period.\r\n",
    "a minutes roll-call": "Present: Bas, Fife\r\nAbsent: Kalb, Reid\r\nAbstain: Gallo, Taylor\r\n",
    "a markdown table": "| item | vote |\n| ---- | ---- |\n| A | yes |\n",
    "an apache log": '1.2.3.4 - - [01/Jan/2026] "GET /a" 200, 12\n5.6.7.8 - - [01/Jan/2026] "GET /b" 200, 34\n',
    "an ini file": "host = a, b\nport = c, d\n",
  };
  t("every planted non-CSV text shape is DECLINED by bytes — the whole reason detect ignores them",
    Object.keys(PROSE).filter((k) => csvEntry.detect(body(PROSE[k]), null) !== null), []);
  t("and the delimiter signature DOES fire on them, which is the finding itself",
    Object.keys(PROSE).filter((k) => delimiterSignature(PROSE[k]).delimiter !== null).length, 5);
}

/* ================================================================== */
console.log("\n--- the reading: addressed cells, row 1 as row 1, the dialect recorded ---");
{
  const { structure: st, text: tx } = await read(SPARE);
  t("the body reads", [st.ok, tx.ok, st.container, tx.container], [true, true, "csv", "csv"]);
  t("ONE sheet, named by the reader's constant because the file names none",
    [tx.sheets.length, tx.sheets[0].name, st.sheets[0].name], [1, CSV_SHEET_NAME, CSV_SHEET_NAME]);
  t("ROW 1 IS ROW 1: the header-looking record is a ROW, not a consumed header",
    tx.sheets[0].text.split("\n")[0], "APN\tStatus\tStatus Date");
  t("three records, three columns — the used extent, measured from the cells",
    [tx.sheets[0].usedRows, tx.sheets[0].usedCols], [3, 3]);
  t("the BOUND is NULL: RFC 4180 fixes no maximum, so the reader states none",
    [tx.sheets[0].rows, tx.sheets[0].cols], [null, null]);
  t("the sheet is a sheet-range unit (IC-124), 1-based and A1-spelled",
    tx.sheets[0].range, { kind: "sheet-range", ref: "csv!A1:C3", sheet: "csv", range: "A1:C3" });
  t("a cell is a sheet-cell reference (IC-1), 1-based, no new union member",
    csvCellRef(2, 3), { kind: "sheet-cell", ref: "csv!C2", sheet: "csv", cell: "C2" });
  t("the quoted field keeps its comma — the count is taken OUTSIDE quotes",
    tx.sheets[0].text.split("\n")[1].split("\t")[2], "February 27, 2023");
  t("cells counted, and an empty cell is not one",
    [tx.counts.cells, tx.counts.formulas, tx.counts.undetermined], [9, 0, 0]);

  /* RECORDED ON THE READING (BOB #32), and from ONE builder — structure() and
     text() cannot state two dialects for one body. */
  t("the dialect rides BOTH projections and is byte-identical across them",
    JSON.stringify(st.dialect) === JSON.stringify(tx.dialect), true);
  t("the encoding is CERTAIN from the BOM the producer wrote",
    [tx.dialect.encoding, tx.dialect.encodingConfidence], ["utf-8", "certain"]);
  t("the delimiter is named and CERTAIN from the consistency signature",
    [tx.dialect.delimiter, tx.dialect.delimiterConfidence], ["comma", "certain"]);
  t("and nothing is undetermined about this body", tx.dialect.undetermined, []);
}

/* ================================================================== */
console.log("\n--- the ENCODING signature: four outcomes, one of them undetermined ---");
{
  t("BOM: certain, and the BOM is not left in the first cell",
    (() => { const s = encodingSignature(SPARE); return [s.encoding, s.confidence, s.bomBytes]; })(),
    ["utf-8", "certain", 3]);
  t("ASCII throughout: us-ascii, NOT utf-8 — the narrower true claim (18 of 166)",
    (() => { const s = encodingSignature(body("a,b\r\nc,d\r\n")); return [s.encoding, s.confidence]; })(),
    ["us-ascii", "certain"]);
  t("high bytes that validate: utf-8 at LIKELY, by validity and not by declaration (1 of 166)",
    (() => { const s = encodingSignature(body("a,b\r\nSchöne,d\r\n")); return [s.encoding, s.confidence]; })(),
    ["utf-8", "likely"]);
  t("a UTF-16LE BOM is read — FIXTURE ONLY, zero corpus bodies carried one",
    (() => { const s = encodingSignature(Uint8Array.from([0xff, 0xfe, 0x61, 0x00])); return [s.encoding, s.bomBytes]; })(),
    ["utf-16le", 2]);
  t("a UTF-32LE BOM is NOT mistaken for UTF-16LE: it falls to undetermined",
    encodingSignature(Uint8Array.from([0xff, 0xfe, 0x00, 0x00, 0x96])).encoding, null);

  /* THE ARM THE CORPUS PAID FOR. `data/20230609update2.csv` carries byte 0x96
     with no BOM. 0x96 is a C1 control in ISO-8859-1, an EN DASH in
     windows-1252 and the letter n-tilde in Mac Roman — MEASURED on the real
     body, where the two live candidates read "Exemption Approved – School" and
     "Exemption Approved ñ School". The byte narrows the encoding and does not
     TELL it, so nothing is decoded and nothing is guessed. */
  const MIXED = body(null, { raw: [
    ...enc.encode("APN,Status\r\n15-1281-24,Approved "), 0x96, ...enc.encode(" School\r\n99-1,Plain\r\n")] });
  const s = encodingSignature(MIXED);
  t("no BOM and a byte that is not valid utf-8: UNDETERMINED, by name",
    [s.encoding, s.confidence, s.undetermined], [null, "none", "encoding_undetermined"]);
  const { text: tx } = await read(MIXED);
  t("THE GRID SURVIVES: delimiters and line breaks are ascii, so the rows are still rows",
    [tx.sheets[0].usedRows, tx.sheets[0].usedCols], [3, 2]);
  t("and ONLY the affected CELL is undetermined, named with its own address",
    tx.undetermined, [{ sheet: 0, cell: "B2", reason: "encoding_undetermined" }]);
  t("the cell's text is ABSENT from the stream, never mojibake",
    [/Approved/.test(tx.document), /�/.test(tx.document), /ñ|–/.test(tx.document)],
    [false, false, false]);
  t("its neighbours are read exactly as published",
    tx.document.split("\n"), ["APN\tStatus", "15-1281-24", "99-1\tPlain"]);
  t("and the reading SAYS SO in its counts and its dialect",
    [tx.counts.undetermined, tx.dialect.undetermined], [1, ["encoding_undetermined"]]);
}

/* ================================================================== */
console.log("\n--- the DELIMITER signature: consistency, or undetermined by name ---");
{
  const of = (s) => { const d = delimiterSignature(s); return [d.name, d.undetermined]; };
  t("comma — 166 of 166 corpus bodies", of("a,b\r\nc,d\r\n"), ["comma", null]);
  t("semicolon — FIXTURE ONLY, unmeasured in this corpus", of("a;b\nc;d\n"), ["semicolon", null]);
  t("tab — FIXTURE ONLY", of("a\tb\nc\td\n"), ["tab", null]);
  t("pipe — FIXTURE ONLY", of("a|b\nc|d\n"), ["pipe", null]);
  t("TIED: two candidates equally consistent -> undetermined, naming both",
    (() => { const d = delimiterSignature("a,b;c\nd,e;f\n"); return [d.name, d.undetermined, d.tied]; })(),
    [null, "delimiter_undetermined_tied", ["comma", "semicolon"]]);
  t("INCONSISTENT: no candidate holds a steady count -> undetermined",
    of("a,b,c\nd,e\nf\n"), [null, "delimiter_undetermined_none_consistent"]);
  t("ONE complete line is not enough to be consistent WITH anything",
    of("a,b,c\n"), [null, "delimiter_undetermined_too_few_lines"]);

  /* AND NOTHING IS GUESSED: the rows survive, because a line break is not a
     candidate for anything. This is the assertion the row's own negative
     control arms against. */
  const { text: tx } = await read(body("only one column\r\nand another line\r\n"));
  t("no delimiter determined: the file reads as ONE column and SAYS the delimiter is undetermined",
    [tx.sheets[0].usedRows, tx.sheets[0].usedCols, tx.dialect.delimiter, tx.dialect.undetermined],
    [2, 1, null, ["delimiter_undetermined_none_consistent"]]);
  t("and the one column is the whole line, not a comma-split guess",
    tx.sheets[0].text.split("\n"), ["only one column", "and another line"]);

  /* AN INCONSISTENT BODY, READ END TO END — and this pair is what the row's own
     negative control arms against. A comma FALLBACK would read 3 cells then 2
     here and look perfectly reasonable; the honest reading is one column a row
     with the delimiter named undetermined, because nothing in these bytes says
     which of the two the publisher meant. */
  const ragged = await read(body("a,b,c\r\nd,e\r\n"));
  t("inconsistent counts: ONE column a row, with the delimiter undetermined BY NAME",
    [ragged.text.sheets[0].usedRows, ragged.text.sheets[0].usedCols,
      ragged.text.dialect.delimiter, ragged.text.dialect.undetermined],
    [2, 1, null, ["delimiter_undetermined_none_consistent"]]);
  t("and each cell is the WHOLE line — a fallback comma would have split them",
    ragged.text.sheets[0].text.split("\n"), ["a,b,c", "d,e"]);
}

/* ================================================================== */
console.log("\n--- RFC 4180 as real producers write it ---");
{
  t("a doubled quote inside a quoted field is ONE quote",
    walkRecords('a,"he said ""no""",c\r\n', ","), [["a", 'he said "no"', "c"]]);
  t("a quoted field may hold the delimiter AND a CRLF",
    walkRecords('a,"one,two\r\nthree",c\r\n', ","), [["a", "one,two\r\nthree", "c"]]);
  /* MEASURED: `documents/Oakland-E-scooter-Survey_7-15-Filtered-1.csv` holds
     934 physical LFs and 867 records, because 16 free-text survey answers
     carry a bare LF inside a quoted field. A line-oriented split would have
     shredded 67 records into fragments. */
  t("a BARE LF inside quotes does not end the record (the survey body's shape)",
    walkRecords('a,"line one\nline two"\r\nb,c\r\n', ","), [["a", "line one\nline two"], ["b", "c"]]);
  t("a final record with no terminator is still a record",
    walkRecords("a,b\r\nc,d", ","), [["a", "b"], ["c", "d"]]);
  t("but an empty trailing fragment is the terminator of the record before it",
    walkRecords("a,b\r\n", ",").length, 1);
  t("a NULL delimiter yields one field per record — rows without a guess",
    walkRecords("a,b\r\nc,d\r\n", null), [["a,b"], ["c,d"]]);
  t("a bare CR ends a record too (an old Mac producer)",
    walkRecords("a,b\rc,d\r", ","), [["a", "b"], ["c", "d"]]);
}

/* ================================================================== */
console.log("\n--- the size bound, on the metric a CSV has ---");
{
  t("the bound is the OOXML figure REUSED, and the reuse is a named constant",
    MEASURED_CSV_TEXT_BOUND_BYTES, 20 * 1024 * 1024);
  /* Built at the bound + 1 line rather than at 73 MB: the refusal is a
     comparison, and paying 73 MB in every battery run to watch a `>` fire
     would be buying nothing. */
  const over = body("a,b\r\n".repeat(Math.ceil((MEASURED_CSV_TEXT_BOUND_BYTES + 64) / 5)));
  t("the fixture really is over the bound", over.length > MEASURED_CSV_TEXT_BOUND_BYTES, true);
  const { structure: st, text: tx } = await read(over);
  t("text is REFUSED with the marker carried verbatim, never a silent truncation",
    [tx.ok, tx.document, tx.sheets, tx.undetermined[0].why, tx.undetermined[0].metric,
      tx.undetermined[0].boundName],
    [true, null, [], "over_size_bound", "body_bytes", "MEASURED_CSV_TEXT_BOUND_BYTES"]);
  t("and the METRIC is this format's, never OOXML's declared-uncompressed one",
    tx.undetermined[0].metric === "declared_uncompressed_text_part_bytes", false);
  t("THE DIALECT STILL STANDS — it came from the head, which is under any bound",
    [tx.dialect.encoding, tx.dialect.delimiter], ["us-ascii", "comma"]);
  t("structure says which kind of silence this is",
    [st.notes.includes("text_body_over_bound"), st.evidentiary.undetermined[0].why],
    [true, "over_size_bound"]);
}

/* ================================================================== */
console.log("\n--- what this format CANNOT carry, and what kind of zero that is ---");
{
  const { structure: st, text: tx } = await read(SPARE);
  t("no links, and every partition counted at zero",
    [st.links, st.counts], [[], { anchor: 0, intra: 0, deferred: 0, refused: 0, undetermined: 0 }]);
  /* CLAUDE.md §2's rule: a zero `intra` count means NOT LOOKED, never NONE
     PRESENT — unless the reading SAYS which. It says. */
  t("and the notes say the zeroes are the FORMAT's, not a walk that found nothing",
    st.notes.some((n) => /declares no relationships/.test(n)), true);
  t("a url in a cell stays TEXT: reading it as a link would be deciding what a string means",
    (await read(body("a,b\r\nhttps://oaklandca.gov/x,d\r\n"))).structure.links, []);
  t("the IC-2 envelope is present and EXHAUSTIVELY empty: a CSV has no DEC-5 extras",
    [st.evidentiary.container, st.evidentiary.kinds, st.evidentiary.items, st.evidentiary.counts],
    ["csv", [], [], {}]);
  t("images is an empty list, not NULL: there is no media container to have looked in",
    tx.images, []);
  /* THE CAPTURE'S GRADE (BOB #32): the bytes are the publisher's, so the
     reading inherits the capture's grade and this entry assigns none. Asserted
     as an ABSENCE rather than left to be noticed. */
  t("the entry emits no grade of its own, anywhere in either projection",
    /"grade"/.test(JSON.stringify(st) + JSON.stringify(tx)), false);
}

/* ================================================================== */
console.log("\n--- a body the entry cannot read says so, and never half-reads ---");
{
  const empty = await read(new Uint8Array(0));
  t("an empty body: ok:false with the reason, never an empty grid that claims a reading",
    [empty.parts.ok, empty.parts.why, empty.structure.ok, empty.structure.reason,
      empty.text.ok, empty.text.reason],
    [false, "empty_body", false, "empty_body", false, "empty_body"]);
  t("and structure()/text() handed no parts at all say PARTS_ABSENT",
    [(await csvEntry.structure(null)).reason, (await csvEntry.text(null)).reason],
    ["PARTS_ABSENT", "PARTS_ABSENT"]);
  t("the entry accepts raw bytes at the registry seam as the office entries do",
    (await csvEntry.text(SPARE)).counts.cells, 9);
}

/* ================================================================== */
console.log("\n--- COFF-11 / IC-100: a THIRD spreadsheet container, and the SAME key roster ---");
{
  /* The claim IC-100 rests on is that ONE consumer reads every spreadsheet
     container by KEY PRESENCE, and a third container — read by a different
     module, from bytes that are not even a container — is the test of it.
     THE COMPARISON IS AGAINST THE OTHER ENTRY'S ACTUAL OUTPUT, never against a
     key list spelled again here: a hand copy agrees for free, and this project
     has measured that costing-nothing agreement five times. The `.ods` hop is
     NOT re-driven here; `formats-odf.test.mjs` pins xlsx against ods with the
     same comparison, so xlsx is the hinge and the three agree through a real
     comparison at each hop rather than through one file's say-so. */
  const XM = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml";
  const XLSX_FIXTURE = zip([
    { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${XM}"/></Types>` },
    { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Appropriations" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>` },
    { name: "xl/worksheets/sheet1.xml", data: `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Department</t></is></c><c r="B1" t="inlineStr"><is><t>Amount</t></is></c></row></sheetData></worksheet>` },
  ]);
  const xlsxSheet = (await xlsxEntry.text(await xlsxEntry.parts(XLSX_FIXTURE))).sheets[0];
  const csv = (await read(SPARE)).text.sheets[0];
  const keys = (s) => ["rows", "cols", "usedRows", "usedCols", "range", "text", "undetermined"]
    .filter((k) => k in s);
  t("the csv sheet's key roster IS the xlsx sheet's, taken from the xlsx entry's own output",
    keys(csv), keys(xlsxSheet));
  t("and the ONLY divergence is the bound: xlsx states one, csv states that it has none",
    [Number.isInteger(xlsxSheet.rows), Number.isInteger(xlsxSheet.cols), csv.rows, csv.cols],
    [true, true, null, null]);
  t("both measure a used extent, and both name the sheet as a sheet-range unit",
    [Number.isInteger(csv.usedRows), Number.isInteger(xlsxSheet.usedRows),
      csv.range.kind, xlsxSheet.range.kind],
    [true, true, "sheet-range", "sheet-range"]);
  t("the two sheet-cell builders agree on the reference SHAPE, key for key",
    Object.keys(csvCellRef(2, 3)).sort(), ["cell", "kind", "ref", "sheet"]);
}

/* ================================================================== */
/* THE SUITE REACHED ITS OWN FOOT. A TypeError inside an assertion goes through
 * no assertion at all and ends the module with the tally reading clean, so this
 * line is the proof the count above is a count of a COMPLETE run. */
console.log(`\nformats-csv: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
