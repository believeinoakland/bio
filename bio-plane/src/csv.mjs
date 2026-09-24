/* The CSV registry entry (QUEUE FW-23) — the ninth format on COFF-1's axis,
 * and the first one on it that is NOT a container.
 *
 * DESIGNED BY BOB #32, 2026-09-24 (`docs/development/OFFICE-FORMATS.md`, "CSV
 * — DESIGNED 2026-09-24"): the delimiter and the encoding are found BY
 * SIGNATURE and RECORDED ON THE READING; when either cannot be determined the
 * reading SAYS SO and nothing is guessed. The file is ONE sheet. Row 1 is row
 * 1 whether or not it looks like a header, because a header is a READING and
 * is never assumed. Cells are addressed with the existing `sheet-cell` /
 * `sheet-range` extent kinds (IC-1, IC-124), 1-based row and column. The
 * reading carries the CAPTURE's grade, because the bytes are the publisher's
 * — so this entry emits no grade of its own anywhere, and `formats-csv.test`
 * asserts that absence rather than leaving it to be noticed.
 *
 * WRITTEN FROM A MEASURED PAGE, NOT FROM THE SPEC. Every decision below was
 * taken against the 166 `.csv` keys of `s3://cao-94612` — all 166 fetched
 * whole, 90,402,768 bytes, 2026-09-24 (M-144). Where the corpus could not
 * answer a question that is SAID, and the question is answered somewhere the
 * corpus is not.
 *
 * ------------------------------------------------------------------------
 * 1. DETECTION: FROM THE DECLARED CONTENT TYPE, AND NEVER FROM THE BYTES.
 * ------------------------------------------------------------------------
 * A CSV has no magic bytes. It has a SHAPE — lines that partition into the
 * same number of fields — and the whole finding of this item is that PROSE
 * WEARS THAT SHAPE. Measured both ways, because one direction alone would
 * have been the wrong reading:
 *
 *   - over 198 NON-CSV bodies drawn from the same bucket (8 per extension
 *     over 34 extensions, seed 20260924), the candidate byte signature fired
 *     0 times. That looks like a licence to sniff, and it is NOT one: this
 *     corpus holds ONE `.txt` in 43,283 keys and its text-bearing half is
 *     27,764 PDFs. THE CORPUS CANNOT ANSWER THIS QUESTION — what a signature
 *     would false-positive on is exactly what is missing from it.
 *   - so the question was put to the shapes the corpus lacks, planted: a
 *     hard-wrapped prose paragraph with one comma a line, a minutes list
 *     ("Present: Bas, Fife"), a Markdown table, an apache log, an ini file.
 *     At a two-line minimum, 5 of 8 non-CSV shapes FIRED. At three lines,
 *     prose and the minutes list still fire. Raising the minimum only trades
 *     a false claim for a missed one, because there is nothing to find: three
 *     lines of prose each holding one comma and a three-row two-column CSV
 *     ARE THE SAME BYTES.
 *
 * So `detect(bytes, ...)` returns NULL — always, for any bytes. This is the
 * xlsx entry's own move at its prefix seam ("a bare PK sniff must NOT claim
 * xlsx"), arrived at from the other side: there the bytes are out of reach,
 * here they are in hand and DO NOT SAY. A format claimed from a shape prose
 * can wear is the record claiming more than it can support, which this
 * project holds to be worse than a missing feature.
 *
 * `detect(null, contentType)` answers `likely` — the ceiling the registry's
 * two-pass doctrine fixes for a declared type, and MEASURED to be the reach
 * that matters: 166 of 166 keys were served `text/csv` exactly.
 *
 * WHAT THAT COSTS, STATED: a CSV captured with NO declared content type is
 * `undetermined` at the FORMAT axis and this reader never runs on it. In this
 * corpus that population is 0 of 166. It is a real gap and it belongs to the
 * SOURCE's declaration, not to a sniff this entry could honestly make.
 *
 * ------------------------------------------------------------------------
 * 2. THE ENCODING SIGNATURE — four outcomes, one of them undetermined.
 * ------------------------------------------------------------------------
 * MEASURED over the 166: 146 carry a UTF-8 BOM; 18 are ASCII throughout; 1
 * is valid UTF-8 with no BOM; 1 IS NEITHER.
 *
 *   BOM          -> determined, `certain`. The producer said so in the bytes.
 *                  (UTF-16 LE/BE BOMs are read too; 0 of 166 carried one, so
 *                  that arm is DRIVEN BY FIXTURE and unmeasured in this
 *                  corpus, which is said rather than implied.)
 *   ASCII only   -> `us-ascii`, determined. Not "utf-8": the bytes do not say
 *                  utf-8, they say something every 8-bit superset decodes
 *                  IDENTICALLY, and that is the stronger and narrower claim.
 *   valid UTF-8  -> `utf-8`, `likely`, with the signal saying BY VALIDITY —
 *                  multi-byte sequences that validate are strong evidence and
 *                  not a declaration.
 *   none of these-> UNDETERMINED, and this is the arm the corpus paid for.
 *                  `data/20230609update2.csv` carries byte 0x96 with no BOM.
 *                  0x96 is a C1 control in ISO-8859-1, an EN DASH in
 *                  windows-1252, and the letter n-tilde in Mac Roman. The
 *                  byte narrows the encoding and does not TELL it, and the
 *                  two live candidates DISAGREE ABOUT WHAT THE CHARACTER IS.
 *
 * WHAT AN UNDETERMINED ENCODING DOES TO THE READING, and it is deliberately
 * narrow: the grid SURVIVES. Delimiters, quotes and line breaks are ASCII, so
 * rows and cells are determined whatever the high bytes mean. Only the cells
 * that actually CONTAIN a high byte are undetermined, and each is emitted with
 * its own `sheet-cell` reference, a null text and the reason — never mojibake,
 * which would be this reader inventing characters. THE ALTERNATIVE CONSIDERED
 * AND REFUSED: decode as windows-1252, the likeliest producer. It is likely
 * and it is a guess, and a guess here is silent — a reader cannot tell an
 * invented dash from a published one.
 *
 * ------------------------------------------------------------------------
 * 3. THE DELIMITER SIGNATURE — consistency, or undetermined.
 * ------------------------------------------------------------------------
 * A candidate is the delimiter when it occurs AT LEAST ONCE on the first
 * complete line and the SAME NUMBER OF TIMES, outside quotes, on every
 * complete line the signature window holds. Exactly one candidate consistent
 * -> determined. Two or more -> undetermined, TIED, naming them. None ->
 * undetermined, and the file reads as ONE COLUMN: rows are still rows,
 * because a line break is not a candidate for anything.
 *
 * MEASURED: 166 of 166 answer `comma`, over the first 50 complete lines.
 *
 * THE CANDIDATE SET IS A LIST AND THAT IS ITS LIMIT, SAID PLAINLY. Comma,
 * semicolon, tab and pipe are the four separators the format family uses;
 * a file delimited by anything else reads as one column with the delimiter
 * recorded `undetermined`. The set cannot be inverted into a principle —
 * "the byte that partitions every line equally" is satisfied by any character
 * that happens to appear twice on every line, a digit included — so it is
 * bounded on purpose and the bound is on the record.
 *
 * ------------------------------------------------------------------------
 * 4. THE GRID, THE BOUND, AND WHAT THIS FORMAT CANNOT CARRY.
 * ------------------------------------------------------------------------
 * ONE sheet, named by a CONSTANT (`CSV_SHEET_NAME`) because the file carries
 * no name at all. `Sheet1` was refused: that is a name Excel gives a sheet,
 * and putting it in the record would be this reader claiming the publisher
 * spelled something they never wrote. The constant is the same string in the
 * `sheets[]` roster and in every reference, which is what `coversSheetCell`
 * in the check catalogue matches on.
 *
 * `rows`/`cols` — the C-45.1 BOUND — are NULL, for `.ods`'s reason exactly:
 * RFC 4180 fixes no maximum. `usedRows`/`usedCols` are measured and emitted
 * beside them, and `range` is the whole-sheet `sheet-range` unit (IC-124).
 *
 * NO LINKS, NO EMBEDDINGS, NO EVIDENTIARY EXTRAS, NO IMAGES — and every one
 * of those zeroes is a fact about the FORMAT, not a walk that found nothing.
 * That distinction is the one CLAUDE.md §2 makes about `intra` counts, so the
 * zeroes are emitted with `notes` saying which kind of zero they are.
 *
 * THE SIZE BOUND is COFF-6's figure REUSED, and this item measured that the
 * figure does NOT transfer cleanly — which is said at the constant rather than
 * hidden behind the word "measured". See `MEASURED_CSV_TEXT_BOUND_BYTES`.
 *
 * This module asserts nothing about MEANING (FRAMEWORK's, through I2) and
 * WRITES nothing.
 */

import { sheetCellRef, usedSheetRange, columnLetters } from "./formats-xlsx.mjs";
import { MEASURED_OOXML_TEXT_BOUND_BYTES } from "./ooxml.mjs";

/* The declared types this entry answers to, folded for case because RFC 2045
   makes a media type case-insensitive. MEASURED: all 166 corpus keys were
   served `text/csv` exactly, so the folding changes nothing here and is for
   the publisher who writes `TEXT/CSV`. The two synonyms are the same media
   type under older spellings; NEITHER OCCURS IN THIS CORPUS and both are
   labelled unmeasured in the signal they produce. */
export const CSV_CONTENT_TYPE = "text/csv";
const CSV_CONTENT_TYPE_SYNONYMS = ["application/csv", "text/comma-separated-values"];

/** The ONE sheet's name. A CSV carries none, so this is a CONVENTION of the
 *  reader and is documented as one — see §4 of the header. Exported because
 *  the suite and any consumer comparing an extent's sheet must use the same
 *  string rather than spell it twice. */
export const CSV_SHEET_NAME = "csv";

/* THE SIZE BOUND, AND THE HONEST STATE OF IT.
 *
 * THE METRIC IS THIS FORMAT'S AND IS NOT BORROWED: a CSV body IS its text, so
 * there is no central directory to sum and nothing to inflate, and what is
 * compared is the body's own length (`metric: "body_bytes"`, never OOXML's
 * `declared_uncompressed_text_part_bytes`, which would be a false statement
 * about how this figure was obtained).
 *
 * THE FIGURE IS COFF-6'S, REUSED — and MEASURED NOT TO TRANSFER CLEANLY, in
 * BOTH directions, which is why this block is long. Two instruments, FW-23,
 * 2026-09-24, both over prefixes of a real corpus body cut at a record
 * boundary (`documents/OPD_PublicCallData_2019.csv`):
 *
 *   - NODE (v26, this container): the record walk at the bound, 20,971,498 B,
 *     costs 254.5 MiB of heap and 686 ms; 7,969,681 B costs 98.5 MiB; the
 *     whole 73,585,498-byte body costs 878.7 MiB and 4.9 s. About 12x the
 *     body, consistently. Against Cloudflare's documented 128 MiB isolate
 *     limit — THEIR claim, not our measurement — that says the bound is too
 *     HIGH.
 *   - WORKERD, via miniflare (the runtime that actually matters): the same
 *     walk completed at 1, 2, 4, 8, 12, 16, 20, 24, 32, 48, 64 MiB AND over
 *     the whole 73,585,498-byte body, in 2,072 ms, without the isolate dying.
 *     That says the bound is too LOW. BUT local workerd does not apply the
 *     production memory cap, so this instrument cannot see the limit it would
 *     need to see, and a run that does not die is not a run that fits.
 *
 * SO THE DECIDING MEASUREMENT HAS NOT BEEN TAKEN, and saying so is the point
 * of this block. It is a deployed plane reading a >20 MiB CSV in its own
 * scratch namespace under production limits; deploying is DIST's (CLAUDE.md
 * §4) and is not this item's to do. Until it is taken the bound stays at the
 * one figure the plane already enforces for text a reader must hold, because
 * a second, differently-derived bound for the same resource is how two
 * answers to one question learn to disagree.
 *
 * WHAT IT COSTS, COUNTED: exactly 1 of the 166 corpus keys is over it
 * (`documents/OPD_PublicCallData_2019.csv`, 73,585,498 B) and 165 are under;
 * the largest under is 7,969,780 B. That one file's text is refused with the
 * marker below and its DIALECT is still stated, so the record says which of
 * the two it is — never a silent truncation. */
export const MEASURED_CSV_TEXT_BOUND_BYTES = MEASURED_OOXML_TEXT_BOUND_BYTES;

/** How much of the body a SIGNATURE may look at. The signature runs over the
 *  head so that a body over the size bound still yields a dialect: a reading
 *  that cannot state its text can still state how it would have been read. */
const SIGNATURE_WINDOW_BYTES = 1 << 20;
/** How many complete lines the delimiter signature examines. */
const SIGNATURE_LINES = 50;

/* The candidate delimiters — §3's list, and its limit is in §3. */
const DELIMITERS = [
  { ch: ",", name: "comma" },
  { ch: ";", name: "semicolon" },
  { ch: "\t", name: "tab" },
  { ch: "|", name: "pipe" },
];

/* ------------------------------------------------------------------ *
 * The encoding signature
 * ------------------------------------------------------------------ */

/** The BOM, or null. Returns `{ encoding, bomBytes, signal }`. */
function readBom(b) {
  if (b.length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf)
    return { encoding: "utf-8", bomBytes: 3, signal: "BOM: EF BB BF" };
  /* Order matters: FF FE 00 00 is UTF-32LE, which this reader does not read
     and must not mistake for UTF-16LE. It is refused into the undetermined
     arm rather than decoded as something else. */
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xfe && b[2] === 0x00 && b[3] === 0x00)
    return null;
  if (b.length >= 2 && b[0] === 0xff && b[1] === 0xfe)
    return { encoding: "utf-16le", bomBytes: 2, signal: "BOM: FF FE" };
  if (b.length >= 2 && b[0] === 0xfe && b[1] === 0xff)
    return { encoding: "utf-16be", bomBytes: 2, signal: "BOM: FE FF" };
  return null;
}

/** Does this run of bytes hold any byte >= 0x80? */
function hasHighBytes(b) {
  for (let i = 0; i < b.length; i++) if (b[i] >= 0x80) return true;
  return false;
}

/** Is this run valid UTF-8? `TextDecoder` with `fatal` is the one decision
 *  procedure available in the runtime, so it is asked rather than reimplemented. */
function isValidUtf8(b) {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(b);
    return true;
  } catch {
    return false;
  }
}

/** THE ENCODING SIGNATURE (header §2). Returns
 *  `{ encoding, confidence, bomBytes, signals, undetermined }` where
 *  `encoding` is null exactly when the bytes do not tell. */
export function encodingSignature(bytes) {
  const bom = readBom(bytes);
  if (bom) {
    return { encoding: bom.encoding, confidence: "certain", bomBytes: bom.bomBytes,
      signals: [bom.signal, "declared by the producer in the bytes"], undetermined: null };
  }
  const window = bytes.subarray(0, SIGNATURE_WINDOW_BYTES);
  if (!hasHighBytes(window)) {
    return { encoding: "us-ascii", confidence: "certain", bomBytes: 0,
      signals: [`no byte >= 0x80 in the first ${window.length} bytes`,
        "us-ascii, not utf-8: every 8-bit superset decodes these bytes identically"],
      undetermined: null };
  }
  if (isValidUtf8(window)) {
    return { encoding: "utf-8", confidence: "likely", bomBytes: 0,
      signals: ["no BOM", "every multi-byte sequence in the signature window is valid utf-8",
        "likely, not certain: validity is evidence, not the producer's declaration"],
      undetermined: null };
  }
  return { encoding: null, confidence: "none", bomBytes: 0,
    signals: ["no BOM", "a byte >= 0x80 that is not part of a valid utf-8 sequence"],
    undetermined: "encoding_undetermined" };
}

/* ------------------------------------------------------------------ *
 * The delimiter signature
 * ------------------------------------------------------------------ */

/** Count `ch` in `line`, OUTSIDE RFC 4180 double quotes. A line the signature
 *  sees may of course begin inside a quoted field that opened on an earlier
 *  line; that makes the count inconsistent and the candidate is dropped,
 *  which is the safe direction (it yields undetermined, never a wrong answer). */
function countOutsideQuotes(line, ch) {
  let n = 0, inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (!inQuotes && c === ch) n++;
  }
  return n;
}

/** THE DELIMITER SIGNATURE (header §3). `text` is the decoded signature
 *  window with any BOM already removed. Returns
 *  `{ delimiter, name, confidence, lines, signals, undetermined, tied }`. */
export function delimiterSignature(text) {
  /* COMPLETE lines only — the last fragment of a truncated window has no
     terminator, so its field count is not a fact about a record. */
  const raw = text.split("\n");
  const complete = raw.slice(0, -1).map((l) => (l.endsWith("\r") ? l.slice(0, -1) : l));
  const lines = complete.filter((l) => l !== "").slice(0, SIGNATURE_LINES);
  if (lines.length < 2) {
    return { delimiter: null, name: null, confidence: "none", lines: lines.length,
      signals: [`${lines.length} complete line(s) in the signature window; a delimiter needs at least 2 to be consistent with anything`],
      undetermined: "delimiter_undetermined_too_few_lines", tied: [] };
  }
  const consistent = [];
  const counted = {};
  for (const d of DELIMITERS) {
    const per = lines.map((l) => countOutsideQuotes(l, d.ch));
    counted[d.name] = per[0];
    if (per[0] >= 1 && per.every((n) => n === per[0])) consistent.push(d);
  }
  if (consistent.length === 1) {
    const d = consistent[0];
    return { delimiter: d.ch, name: d.name, confidence: "certain", lines: lines.length,
      signals: [`${d.name} occurs ${counted[d.name]} time(s) outside quotes on every one of the first ${lines.length} complete lines`],
      undetermined: null, tied: [] };
  }
  if (consistent.length > 1) {
    return { delimiter: null, name: null, confidence: "none", lines: lines.length,
      signals: [`${consistent.length} candidates are equally consistent over ${lines.length} lines: `
        + consistent.map((d) => `${d.name} (${counted[d.name]}/line)`).join(", ")],
      undetermined: "delimiter_undetermined_tied", tied: consistent.map((d) => d.name) };
  }
  return { delimiter: null, name: null, confidence: "none", lines: lines.length,
    signals: [`no candidate (${DELIMITERS.map((d) => d.name).join(", ")}) occurs a consistent, non-zero number of times over ${lines.length} lines`],
    undetermined: "delimiter_undetermined_none_consistent", tied: [] };
}

/* ------------------------------------------------------------------ *
 * The record walk — RFC 4180, one pass, quote-aware
 * ------------------------------------------------------------------ */

/** Split `text` into records of fields. `delimiter` may be NULL, which is the
 *  undetermined case and yields ONE field per record — the rows survive
 *  because a line break is not a candidate for anything (header §3).
 *
 *  RFC 4180 as real producers write it: a field may be quoted; inside quotes a
 *  doubled `""` is one quote and CR, LF and the delimiter are literal; a CR, an
 *  LF or a CRLF outside quotes ends the record. MEASURED against the corpus —
 *  `documents/Oakland-E-scooter-Survey_7-15-Filtered-1.csv` carries 934 LFs
 *  against 867 CRLFs because free-text survey answers hold bare LFs INSIDE
 *  quoted fields, so a line-oriented split would have shredded 67 records. */
export function walkRecords(text, delimiter) {
  const records = [];
  let row = [], field = "", inQuotes = false, started = false;
  const endField = () => { row.push(field); field = ""; };
  const endRecord = () => { endField(); records.push(row); row = []; started = false; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    started = true;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (delimiter && c === delimiter) { endField(); continue; }
    if (c === "\r") { if (text[i + 1] === "\n") i++; endRecord(); continue; }
    if (c === "\n") { endRecord(); continue; }
    field += c;
  }
  /* A trailing fragment with no terminator is still a record — a producer that
     omits the final CRLF has published a last row, not half of one. An EMPTY
     trailing fragment is not: that is the terminator of the record before it. */
  if (started || field !== "" || row.length) endRecord();
  return records;
}

/* ------------------------------------------------------------------ *
 * parts() — read once; structure() and text() are projections of it
 * ------------------------------------------------------------------ */

/** A byte-preserving transport, NOT a claim about the encoding: latin1 maps
 *  0x00-0xFF onto U+0000-U+00FF bijectively, so parsing a latin1 decode is
 *  byte-level parsing done by the one string parser this module has. A cell is
 *  then ASCII-clean exactly when every code unit is below 0x80. */
const BYTE_TRANSPORT = new TextDecoder("latin1");

async function csvParts(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (!b.length) {
    return { ok: false, why: "empty_body" };
  }
  const enc = encodingSignature(b);
  const body = b.subarray(enc.bomBytes);

  /* The signature window, decoded the way the reading will be decoded, so the
     delimiter is found in exactly the text the records are walked over. */
  const head = body.subarray(0, SIGNATURE_WINDOW_BYTES);
  let headText;
  try {
    headText = enc.encoding
      ? new TextDecoder(enc.encoding, { fatal: false }).decode(head)
      : BYTE_TRANSPORT.decode(head);
  } catch {
    /* A runtime without a decoder for a BOM-declared encoding: STATED, never
       substituted with another decoder's answer. */
    return { ok: false, why: `decoder_unavailable:${enc.encoding}`, encoding: enc };
  }
  const delim = delimiterSignature(headText);

  /* THE BOUND, on the body's own length — the metric a CSV has (header §4). */
  const guard = body.length > MEASURED_CSV_TEXT_BOUND_BYTES
    ? { ok: false, text: "undetermined", why: "over_size_bound", size: body.length,
        bound: MEASURED_CSV_TEXT_BOUND_BYTES, boundName: "MEASURED_CSV_TEXT_BOUND_BYTES",
        metric: "body_bytes" }
    : null;

  let records = null;
  if (!guard) {
    const text = enc.encoding
      ? new TextDecoder(enc.encoding, { fatal: false }).decode(body)
      : BYTE_TRANSPORT.decode(body);
    records = walkRecords(text, delim.delimiter);
  }

  return {
    ok: true, format: "csv", bytes: b,
    bodyBytes: body.length, encoding: enc, delimiter: delim, guard, records,
  };
}

/** The dialect AS RECORDED ON THE READING (BOB #32: "found by signature and
 *  RECORDED on the reading"). One builder, so `structure()` and `text()`
 *  cannot state two different dialects for one body.
 *
 *  IC-283 (I2 2.8.0 proposed, MINOR ADDITIVE) is this key. READ ITS RESIDUE
 *  BEFORE BELIEVING THE KEY ARRIVES ANYWHERE: the acquire wire's
 *  `containerExtent` projection in `index.mjs` writes a NAMED key list and
 *  `dialect` is not in it, so today the dialect reaches a caller that invokes
 *  this entry and does NOT reach the record. COFF-11's finding one construct
 *  over, named here rather than left for somebody to discover from an empty
 *  column. The passthrough is another area's path and is rowed, not done. */
function dialectOf(parts) {
  return {
    encoding: parts.encoding.encoding,
    encodingConfidence: parts.encoding.confidence,
    encodingSignals: parts.encoding.signals,
    delimiter: parts.delimiter.name,
    delimiterConfidence: parts.delimiter.confidence,
    delimiterSignals: parts.delimiter.signals,
    undetermined: [parts.encoding.undetermined, parts.delimiter.undetermined].filter(Boolean),
  };
}

/* ------------------------------------------------------------------ *
 * structure(parts) -> the I2 shape (+ the IC-2 evidentiary envelope)
 * ------------------------------------------------------------------ */

function csvStructure(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "csv", reason: parts ? parts.why : "PARTS_ABSENT" };
  }
  const dialect = dialectOf(parts);
  /* EVERY ZERO BELOW IS A FACT ABOUT THE FORMAT, NOT A WALK THAT FOUND
     NOTHING, and the notes say so because CLAUDE.md §2's rule about a zero
     `intra` count is exactly the confusion available here. A CSV declares no
     relationships, embeds no files and holds no metadata part: there is
     nowhere for a link to BE. A URL sitting in a cell is the document's TEXT
     and FRAMEWORK's to read; treating it as a declared link would be this
     entry deciding what a string MEANS. */
  const notes = [
    "the csv format declares no relationships, so the zero link counts are the format's and not a walk's",
    "a url in a cell is text, not a declared link: reading it as one would be this entry deciding what a string means",
  ];
  if (parts.guard) notes.push("text_body_over_bound");
  return {
    ok: true,
    container: "csv",
    sheets: [{ sheet: 0, name: CSV_SHEET_NAME, sheetId: null, state: "visible", hidden: false }],
    links: [],
    counts: { anchor: 0, intra: 0, deferred: 0, refused: 0, undetermined: 0 },
    /* The IC-2 envelope in the shape the office entries accepted. A CSV
       carries none of DEC-5's extras — no formula beside a value, no tracked
       change, no comment, no hidden row, no core properties — because the
       format has no place for any of them. `kinds: []` is exhaustive by the
       FORMAT's definition, which the note records. */
    evidentiary: {
      container: "csv",
      kinds: [],
      items: [],
      undetermined: parts.guard ? [{ part: "(body)", why: "over_size_bound", guard: parts.guard }] : [],
      counts: {},
    },
    dialect,
    notes,
  };
}

/* ------------------------------------------------------------------ *
 * text(parts) -> the I2 text shape
 * ------------------------------------------------------------------ */

/** Is every code unit of this field below 0x80? Under an undetermined
 *  encoding that is the difference between a cell whose characters are known
 *  and one whose characters are not. */
function asciiClean(s) {
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) >= 0x80) return false;
  return true;
}

function csvText(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "csv", reason: parts?.why ?? "PARTS_ABSENT" };
  }
  const dialect = dialectOf(parts);
  const base = {
    ok: true, container: "csv",
    /* Exhaustive and EMPTY, not null: the format has no media container to
       have looked in, so this is a zero of the format and not of a walk. */
    images: [],
    dialect,
  };

  if (parts.guard) {
    /* Over the bound: the marker carried VERBATIM (the docx/xlsx pattern),
       never a silent truncation. The dialect still stands — it was taken from
       the head, which is under any bound. */
    return {
      ...base, document: null, sheets: [],
      undetermined: [parts.guard],
      counts: { chars: 0, cells: 0, formulas: 0, undetermined: 1 },
    };
  }

  const undetermined = [];
  const lines = [];
  let cellCount = 0, usedRows = 0, usedCols = 0;
  const encodingUndetermined = parts.encoding.encoding == null;

  parts.records.forEach((record, r0) => {
    /* ROW 1 IS ROW 1 (BOB #32). No header is consumed, skipped or renamed:
       whether record 1 names the columns is a READING, and this entry makes
       no readings. 1-BASED, because A1 notation is. */
    const row = r0 + 1;
    const vals = [];
    record.forEach((field, c0) => {
      const col = c0 + 1;
      if (encodingUndetermined && !asciiClean(field)) {
        /* The grid survives an undetermined encoding; these characters do
           not. Named per cell with its own reference, never mojibake. */
        undetermined.push({ sheet: 0, cell: `${columnLetters(col)}${row}`,
          reason: "encoding_undetermined" });
        if (row > usedRows) usedRows = row;
        if (col > usedCols) usedCols = col;
        return;
      }
      if (field === "") return;   // an empty cell is a measured emptiness, not text
      cellCount++;
      if (row > usedRows) usedRows = row;
      if (col > usedCols) usedCols = col;
      vals.push(field);
    });
    /* TAB-joined, which is what `xlsxText` and `odf.mjs` emit for a sheet's
       row: one text stream shape across every spreadsheet container, so a
       consumer does not learn three. */
    if (vals.length) lines.push(vals.join("\t"));
  });

  const text = lines.join("\n");
  const sheet = {
    sheet: 0, name: CSV_SHEET_NAME, hidden: false,
    /* THE BOUND IS NULL — `.ods`'s reason exactly: RFC 4180 fixes no maximum
       number of rows or columns, so a CSV has no capacity to state, and
       borrowing OOXML's grid would be this reader inventing a bound the
       format never fixed. The USED range is measured and emitted beside it. */
    rows: null, cols: null, usedRows, usedCols,
    range: usedSheetRange(CSV_SHEET_NAME, usedRows, usedCols),
    text, undetermined,
  };
  return {
    ...base,
    document: text,
    sheets: [sheet],
    undetermined,
    counts: { chars: text.length, cells: cellCount, formulas: 0,
      undetermined: undetermined.length },
  };
}

/** The `sheet-cell` reference for a 1-based row and column of THE one sheet.
 *  Built on the sibling spreadsheet entry's exported builder rather than a
 *  fourth copy of two lines (COFF-10's rule). */
export function csvCellRef(row, col) {
  return sheetCellRef(CSV_SHEET_NAME, `${columnLetters(col)}${row}`);
}

/* ------------------------------------------------------------------ *
 * The I7 entry (registered by formats.mjs — one registerFormat call there
 * and nothing anywhere else; that is the D-70 property)
 * ------------------------------------------------------------------ */

export const csvEntry = {
  format: "csv",
  detect(bytes, contentType) {
    /* BYTES NEVER ANSWER — header §1, measured both ways. This is not a
       missing branch; it is the finding. */
    if (bytes) return null;
    if (typeof contentType !== "string") return null;
    const ct = contentType.trim().toLowerCase();
    if (ct === CSV_CONTENT_TYPE) {
      return { format: "csv", confidence: "likely", signals: [
        `content type "${contentType}"`,
        "likely, not certain: a declared type is a claim, and a csv has no magic bytes to check it against",
        "measured: 166 of 166 .csv keys in s3://cao-94612 were served this type exactly (M-144)",
      ] };
    }
    if (CSV_CONTENT_TYPE_SYNONYMS.includes(ct)) {
      return { format: "csv", confidence: "likely", signals: [
        `content type "${contentType}"`,
        `an older spelling of ${CSV_CONTENT_TYPE}; UNMEASURED in s3://cao-94612, where all 166 keys declared ${CSV_CONTENT_TYPE}`,
      ] };
    }
    return null;
  },
  parts: (bytes) => csvParts(bytes),
  /* Accept either parts() output or raw bytes, exactly as the office entries
     do, so detect->structure works uniformly at the registry seam while a
     caller that already paid for parts() does not pay twice. */
  structure: async (partsOrBytes) => {
    const parts = partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
      ? await csvParts(partsOrBytes)
      : partsOrBytes;
    return csvStructure(parts);
  },
  text: async (partsOrBytes) => {
    const parts = partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
      ? await csvParts(partsOrBytes)
      : partsOrBytes;
    return csvText(parts);
  },
};
