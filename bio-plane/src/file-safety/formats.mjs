/* file-safety: what a captured file IS, read from its own bytes through the readers that own each format (R6's format
 * and `active` list, R11's route and cells, R14's structure check). Nothing here runs, renders or changes the file: the
 * readers read names and structure only (`pdf-reader` R36, `office-readers` R32–R33, `odf-reader` R47), and a cell's
 * value is the one the file holds, never computed (`office-readers` R30). Never throws. */
import { extractPdfStructure } from "../pdfstructure.mjs";
import { docxEntry } from "../docx.mjs";
import { pptxEntry } from "../pptx.mjs";
import { xlsxEntry } from "../formats-xlsx.mjs";
import { csvEntry } from "../csv.mjs";
import { odtEntry, odsEntry, odpEntry } from "../odf.mjs";
import { hasZipMagic, readContainer, declaredTextBytes } from "../ooxml.mjs";

const LATIN1 = new TextDecoder("latin1");

/* R45 (T50; N1163 M-F2; K3480): the characters of a plain-text file a safe view shows, and the most of the stored object
   read to decide a file's format and show them: four bytes for each character kept (a UTF-8 character is at most four). */
export const SAFE_VIEW_TEXT_MAX = 262_144;
export const HEAD_MAX = 4 * SAFE_VIEW_TEXT_MAX;

/* The office and OpenDocument entries in the order a container is asked to name itself. */
const CONTAINERS = Object.freeze([["docx", docxEntry], ["xlsx", xlsxEntry], ["pptx", pptxEntry],
                                  ["odt", odtEntry], ["ods", odsEntry], ["odp", odpEntry]]);

/* R11: the routes of a safe view, by format. `pdf` and `office` are rendered as page images (`file-scanner` R7); `data`
   is the cells the reader read. */
const ROUTE = Object.freeze({ pdf: "pdf", docx: "office", pptx: "office", odt: "office", odp: "office",
                              xlsx: "data", ods: "data", csv: "data" });
export const safeViewRoute = (format) => ROUTE[format] || null;

/* R6: the formats with an `active` list from their reader, and those low by their kind alone. */
export const ACTIVE_FORMATS = Object.freeze(["pdf", "docx", "xlsx", "pptx", "odt", "ods", "odp", "csv"]);
export const PLAIN_FORMATS = Object.freeze(["image", "text", "html"]);

const startsWith = (b, sig) => sig.every((x, i) => b[i] === x);
function isImage(b) {
  return startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])            // PNG
    || startsWith(b, [0xff, 0xd8, 0xff])                                               // JPEG
    || startsWith(b, [0x47, 0x49, 0x46, 0x38])                                         // GIF8
    || (startsWith(b, [0x52, 0x49, 0x46, 0x46]) && LATIN1.decode(b.subarray(8, 12)) === "WEBP");
}

/* Text the file holds, or null when it is not UTF-8 text (a NUL, or bytes that do not decode). */
function textOf(b) {
  if (b.length > 0 && b.subarray(0, Math.min(b.length, 8192)).includes(0)) return null;
  try { return new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { return null; }
}

/* A comma- or tab-separated table: at least two lines, each with the same number of separators, at least one. */
function looksDelimited(text) {
  const lines = text.split(/\r?\n/).filter((l) => l !== "").slice(0, 50);
  if (lines.length < 2) return false;
  for (const sep of [",", "\t", ";"]) {
    const n = lines[0].split(sep).length - 1;
    if (n >= 1 && lines.every((l) => l.split(sep).length - 1 === n)) return true;
  }
  return false;
}

/** The file's format, by its own bytes: `pdf`, an office or OpenDocument flavour, `zip` (an archive that is no office
 *  file), `ole` (a compound file: a legacy office file or an encrypted modern one), `image`, `svg`, `html`, `csv`,
 *  `text`, or `unknown`. */
export function formatOf(bytes) {
  try {
    if (!(bytes instanceof Uint8Array) || bytes.length === 0) return "unknown";
    if (/%PDF-\d+\.\d+/.test(LATIN1.decode(bytes.subarray(0, 1024)))) return "pdf";
    if (hasZipMagic(bytes)) {
      for (const [format, entry] of CONTAINERS) {
        try { if (entry.detect(bytes)) return format; } catch { /* not this one */ }
      }
      return "zip";
    }
    if (startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return "ole";
    if (isImage(bytes)) return "image";
    const text = textOf(bytes);
    if (text === null) return "unknown";
    const head = text.slice(0, 4096).toLowerCase();
    if (/<svg[\s>]/.test(head)) return "svg";
    if (/^\s*(<!doctype html|<html[\s>])/.test(head) || /<html[\s>]/.test(head)) return "html";
    if (looksDelimited(text)) return "csv";
    return "text";
  } catch { return "unknown"; }
}

const ENTRY = Object.freeze({ docx: docxEntry, xlsx: xlsxEntry, pptx: pptxEntry, odt: odtEntry, ods: odsEntry, odp: odpEntry });

/** The reader's whole structure read (R6, R14): `{ok:true, active, variant}` or `{ok:false, why}`. A reader that
 *  refuses, or answers no `active` list, is `ok:false`: the list is never read as empty. */
export async function readActive(format, bytes) {
  try {
    if (format === "csv") return { ok: true, active: [], variant: null };
    if (format === "pdf") {
      const s = await extractPdfStructure(bytes);
      return s && s.ok === true && Array.isArray(s.active) ? { ok: true, active: s.active, variant: null }
        : { ok: false, why: (s && (s.reason || s.why)) || "reader_failed" };
    }
    const entry = ENTRY[format];
    if (!entry) return { ok: false, why: "no_reader" };
    const s = await entry.structure(bytes);
    return s && s.ok !== false && Array.isArray(s.active) ? { ok: true, active: s.active, variant: s.variant ?? null }
      : { ok: false, why: (s && (s.why || s.reason || s.error)) || "reader_failed" };
  } catch (e) {
    return { ok: false, why: "reader_failed" };
  }
}

/* G44 (K4655, K4662, K4665; R11 amended, R21): the first screen of a spreadsheet's safe view, and what bounds it. A sheet shows at most
   `SAFE_VIEW_CELLS_MAX` cells (whole rows, from row 1; a first row alone over it is shown whole), a workbook at most
   `SAFE_VIEW_SHEETS_MAX` sheets and `SAFE_VIEW_TOTAL_CELLS_MAX` cells together, the cut stated. `SAFE_VIEW_INLINE_CELLS_MAX_BYTES` is the
   figure handed the entries' `text()` (bytes of the cells' JSON it may list; this module's own, it has no edge to reading-pipeline's):
   past it the cells are held and `cellsIn` makes the first rows. `SAFE_VIEW_ODS_DECLARED_MAX` is the declared size of an OpenDocument
   sheet's content.xml above which no preview is drawn (its entry has neither slot, so it lists every cell; measured, G44). */
export const SAFE_VIEW_CELLS_MAX = 1000;
export const SAFE_VIEW_SHEETS_MAX = 20;
export const SAFE_VIEW_TOTAL_CELLS_MAX = 5000;
export const SAFE_VIEW_INLINE_CELLS_MAX_BYTES = 512 * 1024;
export const SAFE_VIEW_ODS_DECLARED_MAX = 8 * 1024 * 1024;

const DATA_ENTRY = Object.freeze({ xlsx: xlsxEntry, ods: odsEntry, csv: csvEntry });
const cellOf = (c) => ({ ref: c.source && c.source.cell ? c.source.cell : null, value: c.value, type: c.type });
const rowOfCell = (c) => { const m = /(\d+)$/.exec(c.ref ?? ""); return m ? Number(m[1]) : null; };
/* R51 / R11: a spreadsheet above what a preview can show: its size and the bound, never an empty view (K4571). */
const notDrawn = (size, bound) => ({ ok: false, why: "PREVIEW_NOT_DRAWN", size, bound });

/* The first whole rows of `cells` (in row order) within `max` cells: the first row always, a later one only if it fits. A first row
   alone over `max` is cut to its first `max` cells, and `cut` says so (the sheet is then truncated though no row follows). */
function firstRows(cells, max) {
  const rows = [];
  for (let i = 0; i < cells.length; i++) {
    const r = rowOfCell(cells[i]);
    const last = rows[rows.length - 1];
    if (last && (r === null || r === last.row)) last.to = i + 1; else rows.push({ row: r, from: i, to: i + 1 });
  }
  let take = 0;
  while (take < rows.length && (take === 0 || rows[take].to <= max)) take++;
  const end = take ? rows[take - 1].to : 0;
  const cut = end > max;
  return { cells: cells.slice(0, cut ? max : end), next_row: take < rows.length ? rows[take].row : null, cut };
}

/* One sheet of the answer: `{name, cells, rows, total_rows, truncated, next_row}` and, for a sheet that could not be shown, a `reason`
   with no cells and no size. */
const sheetAnswer = (s, cells, nextRow, cut = false) => ({ name: s.name, cells,
  rows: cells.length ? { from: rowOfCell(cells[0]), to: rowOfCell(cells[cells.length - 1]) } : null,
  total_rows: Number.isInteger(s.usedRows) ? s.usedRows : null, truncated: nextRow != null || cut, next_row: nextRow ?? null });
const unreadable = (s, reason) => ({ name: s.name, cells: [], rows: null, total_rows: null, truncated: false, next_row: null, reason });

async function firstScreen(entry, parts, s, max) {
  if (Array.isArray(s.cells)) { const f = firstRows(s.cells.map(cellOf), max); return sheetAnswer(s, f.cells, f.next_row, f.cut); }
  if (!s.cells_held || typeof entry.cellsIn !== "function") return unreadable(s, "sheet_unreadable");
  /* a row is shown to `SAFE_VIEW_CELLS_MAX` columns at most, so a row of a million fields is cut, and says so */
  const r = await entry.cellsIn(parts, { sheet: s.sheet, fromRow: 1, ...(s.usedRows >= 1 ? { toRow: s.usedRows } : {}), toCol: SAFE_VIEW_CELLS_MAX, maxCells: max });
  if (!r || r.ok !== true || !Array.isArray(r.cells)) return unreadable(s, "cells_unreadable");
  return sheetAnswer(s, r.cells.map(cellOf), r.next_row, Number.isInteger(s.usedCols) && s.usedCols > SAFE_VIEW_CELLS_MAX);
}

/** R11's data view: each sheet's first whole rows as the reader read them, `{name, cells:[{ref, value, type}], rows, total_rows,
 *  truncated, next_row}`, the value the file holds (a formula's cached value), never computed, with `sheets_total` and
 *  `sheets_truncated`; a sheet that could not be shown carries a `reason`; or `{ok:false, why}`, with `size` and `bound` when the
 *  file is above what a preview can show (`why` `PREVIEW_NOT_DRAWN`). `entries` is the readers by format (the tests'). */
export async function sheetsOf(format, bytes, entries = DATA_ENTRY) {
  try {
    const entry = entries[format];
    if (!entry || safeViewRoute(format) !== "data") return { ok: false, why: "no_sheets" };
    if (format === "ods") {
      const declared = declaredTextBytes(readContainer(bytes), (n) => n === "content.xml").total;
      if (!(declared <= SAFE_VIEW_ODS_DECLARED_MAX)) return notDrawn(declared, SAFE_VIEW_ODS_DECLARED_MAX);
    }
    const parts = await entry.parts(bytes);
    if (!parts || parts.ok === false) return { ok: false, why: (parts && (parts.why || parts.reason)) || "reader_failed" };
    if (parts.guard) return notDrawn(parts.guard.size, parts.guard.bound);
    if (parts.piecewise) return notDrawn(parts.piecewise.declared, parts.piecewise.bound);
    const t = await entry.text(parts, { inlineCellsMax: SAFE_VIEW_INLINE_CELLS_MAX_BYTES });
    if (!t || t.ok === false || !Array.isArray(t.sheets)) return { ok: false, why: (t && (t.why || t.reason)) || "reader_failed" };
    if (!t.sheets.length) {
      /* no sheet came back: the entry stated why (a size guard, a repeat bound), never an empty view */
      const u = (Array.isArray(t.undetermined) ? t.undetermined : []).map((x) => (x && x.guard) || x).find((x) => x && Number.isFinite(x.bound));
      return notDrawn(u ? (Number.isFinite(u.size) ? u.size : u.units) : bytes.length, u ? u.bound : null);
    }
    const sheets = [];
    let budget = SAFE_VIEW_TOTAL_CELLS_MAX;
    for (const s of t.sheets.slice(0, SAFE_VIEW_SHEETS_MAX)) {
      if (sheets.length && budget <= 0) break;
      const a = await firstScreen(entry, parts, s, Math.min(SAFE_VIEW_CELLS_MAX, Math.max(1, budget)));
      sheets.push(a);
      budget -= a.cells.length;
    }
    return { ok: true, sheets, sheets_total: t.sheets.length, sheets_truncated: sheets.length < t.sheets.length };
  } catch { return { ok: false, why: "reader_failed" }; }
}

/** R14 (K1928 Q2): the structure check over the reader's whole read: what it flags, by name. An archive is checked
 *  by its listing (`archiveFlags`), and a file no reader reads could not be checked. */
const FLAGGED_KINDS = new Set(["launch", "activex", "ole-object", "embedded-file", "xl4-macrosheet", "external-target"]);
export function structureFlags(read) {
  if (!read.ok) return { ran: true, flags: [/ambiguous/i.test(String(read.why)) ? `ambiguous:${read.why}` : `refused:${read.why}`] };
  const flags = [];
  for (const item of read.active) {
    if (!item || typeof item !== "object") continue;
    if (item.kind === "unread") flags.push("unread");
    else if (item.kind === "encryption") flags.push("encrypted");
    else if (FLAGGED_KINDS.has(item.kind)) flags.push(item.kind);
    else if (item.kind === "vba-project") {
      if (item.read === false) flags.push("vba-project:unread");
      if (Array.isArray(item.suspicious) && item.suspicious.length) flags.push("vba-project:suspicious");
      if (Array.isArray(item.undetermined) && item.undetermined.length) flags.push("vba-project:undetermined");
    }
  }
  return { ran: true, flags: [...new Set(flags)] };
}

/** R45: whether the first bytes of a file say it is one whose format only the whole file can tell (a PDF, a ZIP container
 *  such as an office or OpenDocument file or an archive, or a compound file), so a file longer than `HEAD_MAX` is read whole. */
export function needsWholeFile(head) {
  if (!(head instanceof Uint8Array)) return true;
  return /%PDF-\d+\.\d+/.test(LATIN1.decode(head.subarray(0, 1024))) || hasZipMagic(head)
    || startsWith(head, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
}

/** R45: the bytes cut back to the end of their last whole UTF-8 character, for a head that stops mid-character. */
export function wholeCharacters(bytes) {
  let i = bytes.length - 1, back = 0;
  while (i >= 0 && back < 3 && (bytes[i] & 0xc0) === 0x80) { i--; back++; }
  if (i < 0) return bytes;
  const lead = bytes[i], need = lead >= 0xf0 ? 4 : lead >= 0xe0 ? 3 : lead >= 0xc0 ? 2 : 1;
  return bytes.length - i < need ? bytes.subarray(0, i) : bytes;
}

/** R45: the file's own characters exactly as it holds them (a byte order mark kept, nothing interpreted), cut at
 *  `SAFE_VIEW_TEXT_MAX` characters: `{text, truncated}`, `truncated` true when the file goes on past the cut. `more` says
 *  the bytes are only the start of a longer file. `{ok:false}` when the bytes are not UTF-8. */
export function textView(bytes, more = false) {
  try {
    const all = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    let end = all.length, kept = 0;
    for (let i = 0; i < all.length; kept++) {
      if (kept === SAFE_VIEW_TEXT_MAX) { end = i; break; }
      i += all.codePointAt(i) > 0xffff ? 2 : 1;
    }
    return { ok: true, text: all.slice(0, end), truncated: end < all.length || more };
  } catch { return { ok: false }; }
}
