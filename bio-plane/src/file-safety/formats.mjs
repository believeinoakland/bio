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
import { hasZipMagic } from "../ooxml.mjs";

const LATIN1 = new TextDecoder("latin1");

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

/** R11's data view: each sheet's cells as the reader read them, `{name, cells:[{ref, value, type}]}`, the value the
 *  file holds (a formula's cached value), never computed; or `{ok:false, why}`. */
export async function sheetsOf(format, bytes) {
  try {
    const entry = format === "csv" ? csvEntry : ENTRY[format];
    if (!entry || safeViewRoute(format) !== "data") return { ok: false, why: "no_sheets" };
    const t = await entry.text(bytes);
    if (!t || t.ok === false || !Array.isArray(t.sheets)) return { ok: false, why: (t && (t.why || t.reason)) || "reader_failed" };
    return { ok: true, sheets: t.sheets.map((s) => ({
      name: s.name,
      cells: Array.isArray(s.cells) ? s.cells.map((c) => ({ ref: c.source && c.source.cell ? c.source.cell : null, value: c.value, type: c.type })) : null,
    })) };
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
