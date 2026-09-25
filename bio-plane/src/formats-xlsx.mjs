/* The XLSX registry entry (QUEUE COFF-3) — the first real user of I7's
 * `parts` slot, built on COFF-2's container reader (ooxml.mjs) and COFF-1's
 * registry contract (formats.mjs, I7 CONFIRMED 1.0.0).
 *
 * WHAT IT EMITS, and where each piece of doctrine lives:
 *
 *   structure(parts) -> the I2 shape. Outbound links come from each sheet's
 *   `xl/worksheets/_rels/sheetN.xml.rels` joined to the sheet's <hyperlink>
 *   elements (the rels know the TARGET, the sheet XML knows the CELL), and
 *   land in the SAME four partitions HTML and PDF use through the ONE
 *   `linkWrapper` imported from subresources.mjs — never re-derived, the one
 *   way drift cannot happen (`pdfstructure.mjs` makes the identical move, and
 *   both suites pin the parity). Defined names and cross-sheet hyperlink
 *   locations -> `anchor`; `xl/embeddings/` -> `intra`, content-addressed by
 *   sha256 exactly as a bundle companion is; anything unresolvable ->
 *   a STATED `undetermined` carrying WHY, never dropped, never invented.
 *
 *   Element references are IC-1's resolved union (RESOLVED as amended,
 *   2026-08-03): `{ kind:"sheet-cell", ref:"Sheet1!B14", sheet, cell }` —
 *   `kind` the required discriminator, `ref` the human form the container
 *   knows, produced HERE so no consumer ever parses per-container syntax.
 *
 *   text(parts) -> the I2 text shape: `xl/sharedStrings.xml` + each sheet's
 *   cached <v> values (what the published sheet DISPLAYS), per sheet, with
 *   hidden sheets included AND flagged — the record holds what the file
 *   carries; hiding is a fact about the file, not a reason to omit.
 *
 *   THE EVIDENTIARY CORE (DEC-5), carried in the shared `evidentiary`
 *   envelope — IC-2 as ACCEPTED from COFF-4's as-built code (docx.mjs landed
 *   first; this entry CONFIRMS the envelope, inventing no variant):
 *     { container:"xlsx", kinds:[...], items:[{kind, source, ...}],
 *       undetermined:[{part, why, ...}], counts:{<kind>:n} }
 *   The <f> FORMULA is held BESIDE its cached <v> value as two named fields
 *   on one item — never collapsed, never substituted for the value in the
 *   text stream — because the derivation is frequently the finding and every
 *   rendered form of the sheet destroys it. Hidden rows, columns and SHEETS
 *   are emitted flagged hidden: a hidden sheet is a first-class finding
 *   invisible in every rendered form. `docProps/core.xml` rides the envelope
 *   as a `core-properties` item — the SAME kind name DOCX emits, so the
 *   provenance-adjacent metadata is one vocabulary across the office entries.
 *
 * THE CONFIDENCE LADDER for detect(), decided deliberately (the COFF-1
 * handoff requires it): detect is SYNCHRONOUS (the registry does not await
 * it), so it can walk the central directory but can never inflate
 * [Content_Types].xml. Therefore:
 *
 *   bytes, full container in hand : central directory readable AND
 *       [Content_Types].xml AND xl/workbook.xml both present -> "likely".
 *       Never "certain" from this seam — the flavour's declared main content
 *       type lives INSIDE a deflated part, and claiming certainty without
 *       reading it would be claiming what the bytes read so far do not say.
 *       parts() completes the discrimination through ooxml.mjs's
 *       discriminate() (magic + parts + declared type, confidence "high").
 *   bytes, a PREFIX only (the acquire-time 1 KiB seam): the central
 *       directory is out of reach, so the honest answer is NO ANSWER — a
 *       bare PK sniff must NOT claim xlsx (a renamed plain ZIP is not a
 *       .xlsx), and this entry returns null rather than a guess.
 *   content type only: the declared xlsx type -> "likely" at best, per the
 *       registry's own two-pass doctrine (a declared type is a claim).
 *
 * THE SIZE BOUND is COFF-6's measured metric, enacted in ooxml.mjs: 20 MiB
 * of DECLARED UNCOMPRESSED text-part bytes (sheets + sharedStrings), summed
 * from the central directory BEFORE inflation. Over the bound, the container
 * and metadata treatment still runs in full — links from rels (their cell
 * joins honestly undetermined), hidden SHEETS still flagged from the small
 * workbook.xml — but text extraction is refused as a STATED
 * text-undetermined carrying the guard's own marker verbatim. Streaming to
 * 64 MiB is DEFERRED (COFF-6's landed line) and deliberately not built.
 *
 * This module asserts nothing about MEANING (FRAMEWORK's, through I2) and
 * WRITES nothing.
 */

import {
  hasZipMagic, readContainer, readPart, discriminate,
  CONTENT_TYPES_PART, parseRels, relsPartFor, normalizePartName,
  sizeGuard, declaredTextBytes, CORE_PROPERTIES_PART, readCoreProperties,
  withContainerImages,
} from "./ooxml.mjs";
import { linkWrapper } from "./subresources.mjs";

const UTF8 = new TextDecoder("utf-8", { fatal: false });

export const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const WORKBOOK_PART = "xl/workbook.xml";
const SHARED_STRINGS_PART = "xl/sharedStrings.xml";

/* ------------------------------------------------------------------ *
 * Minimal XML extraction for the spreadsheet grammars (worksheet,
 * sharedStrings, workbook). Same dependency-free discipline as ooxml.mjs:
 * what these patterns cannot read yields a stated undetermined, never a
 * guessed structure. None of these grammars nests an element inside an
 * element of the same local name, so a scan to the first closing tag is
 * exact, not an approximation.
 * ------------------------------------------------------------------ */

function decodeXmlEntities(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[e] ?? m;
  });
}

function parseAttrs(raw) {
  const attrs = {};
  for (const a of String(raw || "").matchAll(/([\w.-]+(?::[\w.-]+)?)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    const local = a[1].includes(":") ? a[1].split(":").pop() : a[1];
    attrs[local] = decodeXmlEntities(a[3] ?? a[4] ?? "");
  }
  return attrs;
}

/** Every element with this LOCAL name (any prefix): `{ attrs, inner }`.
 *  `inner` is the raw content between the tags ("" for self-closing). */
function elements(xml, localName) {
  const out = [];
  const open = new RegExp(`<((?:[\\w.-]+:)?${localName})\\b([^>]*?)(/)?>`, "g");
  let m;
  while ((m = open.exec(xml))) {
    const attrs = parseAttrs(m[2]);
    if (m[3]) { out.push({ attrs, inner: "" }); continue; }
    const close = xml.indexOf(`</${m[1]}>`, open.lastIndex);
    if (close < 0) { out.push({ attrs, inner: "" }); continue; }
    out.push({ attrs, inner: xml.slice(open.lastIndex, close) });
    open.lastIndex = close + m[1].length + 3;
  }
  return out;
}

/** The concatenated <t> text of a run container (an <si> or an <is>). */
function textRuns(inner) {
  return elements(inner, "t").map((t) => decodeXmlEntities(t.inner)).join("");
}

const HEX = "0123456789abcdef";
async function sha256Hex(u8) {
  const d = await crypto.subtle.digest("SHA-256", u8);
  const b = new Uint8Array(d);
  let out = "";
  for (let i = 0; i < b.length; i++) out += HEX[b[i] >> 4] + HEX[b[i] & 15];
  return out;
}

/* IC-1: the sheet-cell element reference, produced by the container that
 * knows it. `ref` is the exact human form a citation surface displays.
 *
 * EXPORTED 2026-09-14 by COFF-10, and the export is the whole change to this
 * file: the `.ods` entry (`odf.mjs`) emits `sheet-cell` references too, and
 * its brief says REUSE the sibling's builder rather than grow a fourth. A
 * second copy of two lines is how two producers of one IC-1 arm drift — the
 * same argument that made `linkWrapper` imported rather than re-derived.
 * Behaviour here is untouched; the over-strictness arm proves this entry's
 * outputs are byte-identical across the change. */
export function sheetCellRef(sheet, cell) {
  return { kind: "sheet-cell", ref: `${sheet}!${cell}`, sheet, cell };
}

/** FW-19 / IC-124 — `{kind:"sheet-range", ref:"Sheet1!A1:C10", sheet, range}`
 *  (EXTRACTION-BREADTH §3.2): a table in a workbook, or a sheet as a unit
 *  (`CONTENT-SEARCH-DESIGN.md` §4.1's workbook unit). `range` is A1:A1
 *  notation with the top-left corner first. EXPORTED for `odf.mjs`'s `.ods`
 *  entry — one builder per arm (COFF-10's rule, which is why `sheetCellRef`
 *  above is exported too). */
export function sheetRangeRef(sheet, range) {
  return { kind: "sheet-range", ref: `${sheet}!${range}`, sheet, range };
}

/** A 1-based column number -> its A1 letters (1 -> A, 27 -> AA). Bijective
 *  base 26 — there is no zero digit, which is the mistake available here. */
export function columnLetters(n) {
  let out = "";
  for (let c = n; c > 0; c = Math.floor((c - 1) / 26)) out = String.fromCharCode(65 + ((c - 1) % 26)) + out;
  return out;
}

/** The WHOLE-SHEET unit a sheet's walk can honestly name: A1 to the far
 *  corner of its USED range, or NULL when that range was not measured or is
 *  empty. The used range and not the grid, deliberately and unlike the
 *  `sheet-cell` BOUND: this is a UNIT a reader is shown ("the sheet"), and a
 *  unit of a million blank rows is not what anybody means by the sheet. The
 *  bound a citation is REFUSED against stays the grid (`rows`/`cols`). */
export function usedSheetRange(name, usedRows, usedCols) {
  if (!(Number.isInteger(usedRows) && usedRows > 0 && Number.isInteger(usedCols) && usedCols > 0)) return null;
  return sheetRangeRef(name, `A1:${columnLetters(usedCols)}${usedRows}`);
}

/* ------------------------------------------------------------------ *
 * D-415 — A WORKBOOK'S NAMED UNITS (EXTRACTION-BREADTH §3.3 item 1).
 * ------------------------------------------------------------------ *
 *
 * `usedSheetRange` names the WHOLE sheet. A workbook also names FINER units
 * itself: a DEFINED NAME (`<definedName>` in workbook.xml; `.ods`'s
 * `<table:named-range>`) and a TABLE (`xl/tables/tableN.xml` reached through a
 * sheet's rels; `.ods`'s `<table:database-range>`). Each that names ONE
 * rectangle on ONE sheet of THIS workbook is emitted as a `sheet-range` unit
 * through the one builder, carrying the name its author gave it. Everything
 * else a name can hold — several areas, a formula or constant, `#REF!`, a
 * whole row or column, another workbook, a sheet this workbook does not have,
 * an address past the grid — is SKIPPED WITH ITS REASON, never dropped and
 * never approximated: a unit this reader widened or guessed would be the
 * record claiming an extent the author did not name.
 *
 * `rangeUnitFor` is the one place a rectangle becomes a unit, for both
 * containers: `a` and `b` are corners already parsed to {col,row}, `sheets`
 * the workbook's sheet names, `grid` the format's bound or null (`.ods` fixes
 * none). A sheet name matches exactly, else case-insensitively when exactly
 * one sheet answers (both formats resolve sheet names without case); the
 * unit carries the WORKBOOK's spelling, the form C-45.1 matches.
 */
/** One A1 corner (`$B$14`, `b14`) -> {col,row}, or null. */
export function a1Corner(s) {
  const m = /^\$?([A-Za-z]{1,3})\$?([1-9]\d{0,6})$/.exec(String(s ?? "").trim());
  if (!m) return null;
  let col = 0;
  for (const ch of m[1].toUpperCase()) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col, row: parseInt(m[2], 10) };
}

export function rangeUnitFor(sheetName, a, b, sheets, grid) {
  let sheet = sheets.includes(sheetName) ? sheetName : null;
  if (sheet == null) {
    const ci = sheets.filter((s) => s.toLowerCase() === String(sheetName).toLowerCase());
    if (ci.length === 1) sheet = ci[0];
  }
  if (sheet == null) return { why: "no_such_sheet" };
  const c1 = Math.min(a.col, b.col), c2 = Math.max(a.col, b.col);
  const r1 = Math.min(a.row, b.row), r2 = Math.max(a.row, b.row);
  if (grid && (c2 > grid.cols || r2 > grid.rows)) return { why: "outside_grid" };
  return { unit: sheetRangeRef(sheet, `${columnLetters(c1)}${r1}:${columnLetters(c2)}${r2}`) };
}

/** Split at every top-level `sep` — outside a quoted sheet name and outside
 *  parentheses — so `'a,b'!A1` is one area and `A1,B2` is two. */
function splitTopLevel(s, sep) {
  const out = [];
  let depth = 0, quoted = false, cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'") {
      if (quoted && s[i + 1] === "'") { cur += "''"; i++; continue; }
      quoted = !quoted;
    } else if (!quoted && ch === "(") depth++;
    else if (!quoted && ch === ")") depth--;
    else if (!quoted && depth === 0 && ch === sep) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

/** An XLSX defined name's formula text -> {unit} or {why}. The ONE grammar
 *  read is `Sheet!A1` / `Sheet!A1:B2` / `'Quoted ''Sheet'''!$A$1:$B$2`;
 *  anything else is a stated reason. A sheet name cannot hold `:` or `[`
 *  in either format, so a `:` before the `!` is a 3-D (multi-sheet)
 *  reference and a `[..]` is another workbook. */
export function xlsxDefinedNameUnit(formula, sheets) {
  const f = String(formula ?? "").trim();
  if (!f) return { why: "empty_reference" };
  if (/#REF!/i.test(f)) return { why: "broken_reference" };
  if (splitTopLevel(f, ",").length > 1 || /^\(.*\)$/.test(f)) return { why: "multi_area" };
  const m = /^(?:'((?:[^']|'')+)'|([^'!\s,()]+))!(.+)$/.exec(f);
  if (!m) return { why: "not_a_range_reference" };
  const sheetName = m[1] != null ? m[1].replace(/''/g, "'") : m[2];
  if (/\[[^\]]*\]/.test(sheetName)) return { why: "external_workbook" };
  if (sheetName.includes(":")) return { why: "multi_sheet_reference" };
  const corners = m[3].split(":");
  if (corners.length > 2) return { why: "not_a_range_reference" };
  const a = a1Corner(corners[0]);
  const b = corners.length === 2 ? a1Corner(corners[1]) : a;
  if (!a || !b) {
    if (corners.every((c) => /^\$?(?:[A-Za-z]{1,3}|\d+)$/.test(c.trim()))) return { why: "whole_row_or_column" };
    return { why: "not_a_range_reference" };
  }
  return rangeUnitFor(sheetName, a, b, sheets, { rows: XLSX_GRID_ROWS, cols: XLSX_GRID_COLS });
}

/* ------------------------------------------------------------------ *
 * COFF-11 / IC-100 / D-359 — A SHEET'S BOUND, AND THE DECISION IT CARRIES.
 * ------------------------------------------------------------------ *
 *
 * THE BOUND IS THE GRID, NEVER THE USED RANGE, and that is a decision rather
 * than a convenience. `walkSheetXml` can say exactly how far this workbook's
 * cells reach, and feeding THAT to the `sheet-cell` arm of C-45.1 would refuse
 * `Summary!D500` on a sheet filled to row 12 — a cell that EXISTS in the
 * workbook and was EMPTY at capture. That is the record refusing a TRUE
 * statement, and in this product an empty cell is routinely the finding
 * ("the disclosure's Schedule B was left blank"). Worse, the refusal does not
 * stop a member citing the document: it pushes them up to the WHOLE DOCUMENT,
 * which claims MORE and not less — the reason already ruled twice in this
 * plane, at the store's `#pageSetForCapture` and `#containerExtentForCapture`.
 * So the bound refuses only the IMPOSSIBLE, and `NoSuchSheet!ZZ9999999` — the
 * address D-354 and D-359 both cite as the measured cost of the unfed arm — is
 * impossible on its ROW and is refused here.
 *
 * THE USED RANGE IS STILL EMITTED, BESIDE IT AND UNDER ITS OWN NAME
 * (`usedRows`/`usedCols`), because the two facts are different and a later
 * reader must be able to tell "empty at capture" from "outside the grid"
 * without either figure pretending to be the other. Nothing consumes the used
 * range today; it is emitted because this walk is the only place that knows it
 * and re-walking the container to ask again would be a second opinion about
 * one number (CAP-12's own rule at the acquire wire).
 *
 * THE FIGURES ARE THE FORMAT'S, MEASURED AGAINST A REAL PRODUCER ON THIS
 * MACHINE rather than cited from a vendor's documentation — see
 * `MEASUREMENTS.md`, 2026-09-15. `.ods` does NOT get a bound: OpenDocument
 * fixes no maximum table size at all, so `odf.mjs` emits a NULL there and says
 * so, which is undetermined-is-first-class at this construct and not a gap in
 * that reader. */
const XLSX_GRID_ROWS = 1048576;
const XLSX_GRID_COLS = 16384;

/** The 1-based column number of an A1 reference's column letters, or null.
 *  `$B$14` and `B14` both answer 2 — the absolute markers are notation, not
 *  address, exactly as `CONTENT_EXTENT_A1_RE` in the check catalog treats
 *  them. Anything this cannot read is null and is SKIPPED by the caller,
 *  never scored zero: a reference this helper does not understand must not
 *  silently shrink a sheet's measured extent. */
function a1Col(ref) {
  const m = /^\$?([A-Za-z]{1,3})\$?\d+$/.exec(String(ref ?? "").trim());
  if (!m) return null;
  let n = 0;
  for (const ch of m[1].toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

/* http/https are addresses the record may hold a capture of elsewhere:
 * deferred. Everything else a hyperlink rel can carry (mailto:, file:, ...)
 * is refused — the same partition rule HTML and PDF apply. */
function classifyUrl(url) {
  const m = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/.exec(url || "");
  const scheme = m ? m[1].toLowerCase() : null;
  if (scheme === "http" || scheme === "https") return "deferred";
  if (!scheme && url) return "deferred"; // scheme-relative / bare address: resolvable against the record
  return "refused";
}

/* A worksheet rels target is resolved against the part's own directory
 * (OPC convention): "../drawings/x.xml" from "xl/worksheets/" -> "xl/...". */
function resolveTarget(fromPart, target) {
  if (/^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(target) || target.startsWith("/")) {
    return normalizePartName(target);
  }
  const base = fromPart.split("/").slice(0, -1);
  for (const seg of target.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") base.pop();
    else base.push(seg);
  }
  return base.join("/");
}

/* ------------------------------------------------------------------ *
 * parts() — the container walk, run ONCE; structure() and text() are
 * projections of what it assembled.
 * ------------------------------------------------------------------ */

async function xlsxParts(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const undetermined = [];

  /* The full discrimination (magic + parts + declared main content type). A
   * container that is not honestly an xlsx yields a stated refusal, never a
   * walk of something else's parts. */
  const disc = await discriminate(b);
  if (!disc.ok) return { ok: false, why: disc.why, signals: disc.signals };
  if (disc.format !== "xlsx") {
    return { ok: false, why: `not_xlsx:${disc.format}`, signals: disc.signals };
  }
  const container = readContainer(b);

  /* The workbook part: sheet order, names, and the HIDDEN state (DEC-5 —
   * state="hidden"|"veryHidden" is invisible in every rendered form). */
  const wbRead = await readPart(b, container, WORKBOOK_PART);
  if (!wbRead.ok) return { ok: false, why: `workbook_unreadable:${wbRead.why}` };
  const wbXml = UTF8.decode(wbRead.bytes);

  /* workbook.xml.rels: r:id -> worksheet part, resolved against xl/. */
  const relsById = new Map();
  const wbRelsRead = await readPart(b, container, relsPartFor(WORKBOOK_PART));
  if (wbRelsRead.ok) {
    const parsed = parseRels(UTF8.decode(wbRelsRead.bytes));
    if (parsed.ok) {
      for (const r of parsed.relationships) if (r.id) relsById.set(r.id, r);
    } else undetermined.push({ part: relsPartFor(WORKBOOK_PART), why: parsed.why });
  } else undetermined.push({ part: relsPartFor(WORKBOOK_PART), why: wbRelsRead.why });

  const sheets = elements(wbXml, "sheet").map((s, index) => {
    const state = s.attrs.state === "hidden" || s.attrs.state === "veryHidden" ? s.attrs.state : "visible";
    const rel = s.attrs.id ? relsById.get(s.attrs.id) : null;
    return {
      index,
      name: s.attrs.name ?? `sheet${index + 1}`,
      sheetId: s.attrs.sheetId ?? null,
      state,
      hidden: state === "visible" ? false : state,
      part: rel && !rel.external ? resolveTarget(WORKBOOK_PART, rel.target) : null,
      xml: null,
      why: rel ? null : "sheet_rel_unresolved",
    };
  });

  /* Defined names -> anchor material (workbook-scoped). `localSheetId` and
   * `hidden` ride along for D-415's units; the anchor links read name/ref
   * only, as before. */
  const definedNames = elements(wbXml, "definedName")
    .filter((d) => d.attrs.name != null)
    .map((d) => ({ name: d.attrs.name, ref: decodeXmlEntities(d.inner).trim(),
      localSheetId: /^\d+$/.test(d.attrs.localSheetId ?? "") ? parseInt(d.attrs.localSheetId, 10) : null,
      hidden: d.attrs.hidden === "1" || d.attrs.hidden === "true" }));

  /* D-415 — TABLE PARTS, reached through each sheet's OWN rels (the target
   * lives there, as a hyperlink's does). Workbook metadata, so read even over
   * the text bound, as hidden SHEETS are: a table part is a few hundred bytes
   * and names an address, not text. An unreadable sheet rels part is stated
   * by structure(); an unreadable TABLE part is stated here, as a skip. */
  const tables = [];
  for (const sheet of sheets) {
    if (!sheet.part) continue;
    const relsPart = relsPartFor(sheet.part);
    if (!container.byName.has(relsPart)) continue;
    const rr = await readPart(b, container, relsPart);
    const parsed = rr.ok ? parseRels(UTF8.decode(rr.bytes)) : null;
    if (!parsed || !parsed.ok) continue;
    for (const r of parsed.relationships) {
      if (r.external || !/\/relationships\/table$/.test(String(r.type ?? ""))) continue;
      const part = resolveTarget(sheet.part, r.target);
      const tr = await readPart(b, container, part);
      if (!tr.ok) { tables.push({ sheet: sheet.name, part, name: null, ref: null, why: `table_part_unreadable:${tr.why}` }); continue; }
      const t = elements(UTF8.decode(tr.bytes), "table")[0];
      tables.push({ sheet: sheet.name, part,
        name: t ? (t.attrs.displayName ?? t.attrs.name ?? null) : null, ref: t ? (t.attrs.ref ?? null) : null,
        why: t ? null : "table_element_absent" });
    }
  }

  /* THE MEASURED BOUND (COFF-6, enacted in ooxml.mjs): declared uncompressed
   * text-part bytes — the sheets and sharedStrings — summed from the central
   * directory BEFORE any inflation. `guard` is null under the bound, the
   * stated marker over it (the docx.mjs pattern, so the two entries carry the
   * refusal identically). */
  const sheetParts = new Set(sheets.map((s) => s.part).filter(Boolean));
  const isTextPart = (n) => sheetParts.has(n) || n === SHARED_STRINGS_PART;
  const declared = declaredTextBytes(container, isTextPart);
  const guardR = sizeGuard(declared.total);
  const guard = guardR.ok ? null : guardR;

  let sharedStrings = null;
  if (!guard) {
    /* sharedStrings, if the package has one. Absence is normal; presence
     * that cannot be read is a stated undetermined every t="s" cell will
     * inherit rather than a guessed string. */
    if (container.byName.has(SHARED_STRINGS_PART)) {
      const ss = await readPart(b, container, SHARED_STRINGS_PART);
      if (ss.ok) sharedStrings = elements(UTF8.decode(ss.bytes), "si").map((si) => textRuns(si.inner));
      else undetermined.push({ part: SHARED_STRINGS_PART, why: ss.why });
    }
    for (const sheet of sheets) {
      if (!sheet.part) { undetermined.push({ part: `(sheet ${sheet.name})`, why: sheet.why }); continue; }
      const read = await readPart(b, container, sheet.part);
      if (read.ok) sheet.xml = UTF8.decode(read.bytes);
      else { sheet.why = read.why; undetermined.push({ part: sheet.part, why: read.why }); }
    }
  }
  /* Over the bound, nothing is inflated and nothing is pushed here: the guard
   * marker itself is the statement, carried by structure()'s envelope and by
   * text() verbatim (the docx.mjs pattern). */

  /* docProps/core.xml: absent is normal OPC; present-but-unreadable is a
   * stated undetermined, distinct from absence. */
  let core = null;
  if (container.byName.has(CORE_PROPERTIES_PART)) {
    const c = await readCoreProperties(b, container);
    if (c.ok) core = c;
    else undetermined.push({ part: CORE_PROPERTIES_PART, why: c.why });
  }

  return {
    ok: true, format: "xlsx", bytes: b, container,
    sheets, definedNames, tables, sharedStrings, core, declared, guard, undetermined,
  };
}

/* ------------------------------------------------------------------ *
 * The per-sheet cell walk, shared by structure() (formulas, hidden rows/
 * cols, hyperlink cell joins) and text() (values). Returns per-sheet:
 *   rows: [{ r, hidden, cells: [{ cell, t, v, f, is }] }]
 *   hiddenRows, hiddenCols, hyperlinks
 * ------------------------------------------------------------------ */

function walkSheetXml(xml) {
  const rows = elements(xml, "row").map((row) => ({
    r: row.attrs.r != null ? parseInt(row.attrs.r, 10) : null,
    hidden: row.attrs.hidden === "1" || row.attrs.hidden === "true",
    cells: elements(row.inner, "c").map((c) => {
      const f = elements(c.inner, "f");
      const v = elements(c.inner, "v");
      const is = elements(c.inner, "is");
      return {
        cell: c.attrs.r ?? null,
        t: c.attrs.t ?? null,
        f: f.length ? decodeXmlEntities(f[0].inner) : null,
        v: v.length ? decodeXmlEntities(v[0].inner) : null,
        is: is.length ? textRuns(is[0].inner) : null,
      };
    }),
  }));
  const hiddenRows = rows.filter((r) => r.hidden && r.r != null).map((r) => r.r);
  const hiddenCols = elements(xml, "col")
    .filter((c) => c.attrs.hidden === "1" || c.attrs.hidden === "true")
    .map((c) => ({ min: parseInt(c.attrs.min, 10), max: parseInt(c.attrs.max, 10) }));
  const hyperlinks = elements(xml, "hyperlink").map((h) => ({
    cell: h.attrs.ref ?? null,
    relId: h.attrs.id ?? null,
    location: h.attrs.location ?? null,
    display: h.attrs.display ?? null,
  }));
  /* COFF-11 — THE USED EXTENT, accumulated over the cells this walk has
     already read. It is taken from the CELLS and not from the `<row>`
     elements: a producer may declare a row to carry formatting and put no
     cell in it, and counting that as reach would make the used range a
     statement about styling. A row whose `r` is unreadable, and a cell whose
     A1 reference `a1Col` does not understand, are SKIPPED rather than scored
     zero — the WORKER.md rule that a thing the matcher cannot classify is
     named, not silently counted. A sheet with no cells at all measures 0/0,
     which is a MEASURED zero (this sheet holds nothing) and is a different
     fact from the NULL the bound carries when the format fixes no maximum. */
  let usedRows = 0, usedCols = 0;
  for (const row of rows) {
    if (!row.cells.length) continue;
    if (Number.isInteger(row.r) && row.r > usedRows) usedRows = row.r;
    for (const c of row.cells) {
      const col = a1Col(c.cell);
      if (col != null && col > usedCols) usedCols = col;
    }
  }
  return { rows, hiddenRows, hiddenCols, hyperlinks, usedRows, usedCols };
}

/** One cell's DISPLAYED value (the cached claim the published sheet shows).
 *  Returns { value } or { undetermined: why }; an empty cell is null value. */
function cellValue(c, sharedStrings) {
  if (c.t === "s") {
    const i = c.v != null ? parseInt(c.v, 10) : NaN;
    if (sharedStrings && Number.isInteger(i) && i >= 0 && i < sharedStrings.length)
      return { value: sharedStrings[i] };
    return { undetermined: sharedStrings ? "shared_string_index_out_of_range" : "shared_strings_unreadable" };
  }
  if (c.t === "inlineStr") return { value: c.is ?? "" };
  if (c.t === "b") return { value: c.v === "1" ? "TRUE" : c.v === "0" ? "FALSE" : c.v };
  /* t="str" (formula string result), t="e" (an error like #DIV/0! — itself a
   * fact the sheet published), t="n" and untyped numerics: the raw <v>. */
  return { value: c.v };
}

/* ------------------------------------------------------------------ *
 * structure(parts) -> the I2 shape (+ the IC-2 evidentiary envelope)
 * ------------------------------------------------------------------ */

async function xlsxStructure(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "xlsx", reason: parts ? parts.why : "PARTS_ABSENT" };
  }
  const { bytes, container, sheets, definedNames, guard } = parts;
  const links = [];
  const notes = [];
  const evItems = [];
  const evUndetermined = [...parts.undetermined];

  for (const sheet of sheets) {
    /* The rels half: this sheet's own .rels, where the TARGETS live. */
    const relTargets = new Map();
    if (sheet.part) {
      const relsPart = relsPartFor(sheet.part);
      if (container.byName.has(relsPart)) {
        const read = await readPart(bytes, container, relsPart);
        const parsed = read.ok ? parseRels(UTF8.decode(read.bytes)) : null;
        if (parsed && parsed.ok) {
          for (const r of parsed.relationships) if (r.id) relTargets.set(r.id, r);
        } else {
          evUndetermined.push({ part: relsPart, why: read.ok ? parsed.why : read.why });
        }
      }
    }

    if (sheet.xml == null) {
      /* Over the bound, or an unreadable sheet: the rels still name every
       * EXTERNAL target this sheet carries, so the outbound graph survives —
       * but the cell join lives in the unread sheet XML, so each link's
       * element reference is honestly null and the reason is on the record. */
      const why = guard == null ? (sheet.why ?? "sheet_unreadable") : "over_size_bound";
      for (const [, r] of relTargets) {
        if (!r.external) continue;
        const partition = classifyUrl(r.target);
        links.push({
          partition,
          wrapper: partition === "deferred" ? linkWrapper.deferred(r.target) : linkWrapper.refused(),
          target: { url: r.target },
          source: null,
          note: `cell_join_unavailable:${why}`,
        });
      }
      continue;
    }

    const walked = walkSheetXml(sheet.xml);

    /* Hyperlinks: the sheet XML knows the CELL, the rels know the TARGET. */
    for (const h of walked.hyperlinks) {
      const source = h.cell ? sheetCellRef(sheet.name, h.cell) : null;
      if (h.relId) {
        const rel = relTargets.get(h.relId);
        if (!rel) {
          links.push({ partition: "undetermined", wrapper: null,
            target: { why: "hyperlink_rel_unresolved", relId: h.relId }, source });
          continue;
        }
        if (!rel.external) {
          links.push({ partition: "undetermined", wrapper: null,
            target: { why: "hyperlink_rel_not_external", relId: h.relId, part: rel.target }, source });
          continue;
        }
        const partition = classifyUrl(rel.target);
        links.push({
          partition,
          wrapper: partition === "deferred" ? linkWrapper.deferred(rel.target) : linkWrapper.refused(),
          target: { url: rel.target },
          source,
        });
        continue;
      }
      if (h.location) {
        /* A cross-sheet reference: internal, final at capture -> anchor. */
        const fragment = `#${h.location}`;
        links.push({ partition: "anchor", wrapper: linkWrapper.anchor(fragment),
          target: { location: h.location, fragment }, source });
        continue;
      }
      links.push({ partition: "undetermined", wrapper: null,
        target: { why: "hyperlink_without_target" }, source });
    }

    /* DEC-5: formulas BESIDE their cached values — two named fields on one
     * item, never collapsed. The value in the TEXT stream stays the cached
     * <v> (what the sheet displays); the derivation lives here, cell-keyed. */
    for (const row of walked.rows) {
      for (const c of row.cells) {
        if (c.f == null) continue;
        evItems.push({
          kind: "formula",
          source: c.cell ? sheetCellRef(sheet.name, c.cell) : null,
          formula: c.f,
          value: c.v, // the cached result, null when the file carries none — stated, not invented
        });
      }
    }

    /* DEC-5: hidden rows and columns, flagged per sheet. */
    if (walked.hiddenRows.length) {
      evItems.push({ kind: "hidden-rows", sheet: sheet.name,
        rows: walked.hiddenRows, count: walked.hiddenRows.length, source: null });
    }
    if (walked.hiddenCols.length) {
      evItems.push({ kind: "hidden-cols", sheet: sheet.name,
        cols: walked.hiddenCols, count: walked.hiddenCols.length, source: null });
    }
  }

  /* DEC-5: a hidden SHEET is a first-class finding — from workbook.xml,
   * which is small and read even over the text bound. */
  for (const sheet of sheets) {
    if (sheet.hidden) {
      evItems.push({ kind: "hidden-sheet", sheet: sheet.name, state: sheet.state, source: null });
    }
  }
  if (guard) {
    notes.push("text_parts_over_bound");
    evUndetermined.push({ part: "(text parts: worksheets + sharedStrings)", why: "over_size_bound", guard });
  }

  /* Defined names -> anchor (workbook-scoped: no single source cell, and a
   * null source is a statement, never a guess). */
  for (const dn of definedNames) {
    const fragment = `#${dn.ref}`;
    links.push({ partition: "anchor", wrapper: linkWrapper.anchor(fragment),
      target: { definedName: dn.name, ref: dn.ref, fragment }, source: null });
  }

  /* xl/embeddings/ -> intra, content-addressed exactly as a bundle companion. */
  for (const entry of container.entries) {
    const name = normalizePartName(entry.name);
    if (!/^xl\/embeddings\//.test(name)) continue;
    const read = await readPart(bytes, container, name);
    if (!read.ok) {
      links.push({ partition: "undetermined", wrapper: null,
        target: { why: `embedding_unreadable:${read.why}`, name }, source: null });
      continue;
    }
    const sha = await sha256Hex(read.bytes);
    links.push({ partition: "intra", wrapper: linkWrapper.intra(sha),
      target: { sha256: sha, name, bytes: read.bytes.length }, source: null });
  }

  const counts = { anchor: 0, intra: 0, deferred: 0, refused: 0, undetermined: 0 };
  for (const l of links) counts[l.partition]++;

  /* docProps/core.xml as a `core-properties` ITEM — the same kind, with the
   * same fields, that docx.mjs emits (IC-2 as accepted): the provenance-
   * adjacent metadata is one vocabulary, not a per-format field. Absence is
   * normal OPC and emits nothing; unreadable is already in `undetermined`
   * from parts(). */
  if (parts.core) {
    evItems.push({
      kind: "core-properties",
      creator: parts.core.creator, lastModifiedBy: parts.core.lastModifiedBy,
      revision: parts.core.revision, revisionNumber: parts.core.revisionNumber,
      created: parts.core.created, modified: parts.core.modified, title: parts.core.title,
      source: null,
    });
  }

  const evCounts = {};
  for (const it of evItems) evCounts[it.kind] = (evCounts[it.kind] ?? 0) + 1;

  return {
    ok: true,
    container: "xlsx",
    sheets: sheets.map((s) => ({ sheet: s.index, name: s.name, sheetId: s.sheetId,
      state: s.state, hidden: s.hidden })),
    links,
    counts,
    /* The IC-2 envelope AS ACCEPTED (COFF-4 filed it first, from docx.mjs as
     * built; this entry CONFIRMS — same key, same fields, no variant). */
    evidentiary: {
      container: "xlsx",
      kinds: [...new Set(evItems.map((it) => it.kind))],
      items: evItems,
      undetermined: evUndetermined,
      counts: evCounts,
    },
    notes,
  };
}

/* ------------------------------------------------------------------ *
 * text(parts) -> the I2 text shape
 * ------------------------------------------------------------------ */

/* D-415 — the workbook's NAMED units: every defined name and every table part
 * that names one rectangle on one sheet of this workbook, as a `sheet-range`
 * unit carrying its author's name; every other one SKIPPED with its reason.
 * `scope` is the sheet a sheet-scoped name belongs to (`localSheetId`), null
 * for a workbook-scoped one; `hidden` is the file's own flag (Excel hides the
 * names it manages itself, e.g. `_xlnm._FilterDatabase`) — carried, not a
 * reason to omit, the hidden-sheet rule. Emitted over the text bound too:
 * none of it is read from a text part. */
export function xlsxRangeUnits(parts) {
  const names = parts.sheets.map((s) => s.name);
  const units = [], skipped = [];
  for (const dn of parts.definedNames) {
    const r = xlsxDefinedNameUnit(dn.ref, names);
    const scope = dn.localSheetId != null ? (parts.sheets[dn.localSheetId]?.name ?? null) : null;
    if (r.unit) units.push({ source: "defined-name", name: dn.name, scope, hidden: dn.hidden, unit: r.unit });
    else skipped.push({ source: "defined-name", name: dn.name, ref: dn.ref, why: r.why });
  }
  for (const t of parts.tables ?? []) {
    if (t.why) { skipped.push({ source: "table", name: t.name, ref: t.ref, part: t.part, why: t.why }); continue; }
    const corners = String(t.ref ?? "").split(":");
    const a = corners.length <= 2 ? a1Corner(corners[0]) : null;
    const b = corners.length === 2 ? a1Corner(corners[1]) : a;
    const r = a && b ? rangeUnitFor(t.sheet, a, b, names, { rows: XLSX_GRID_ROWS, cols: XLSX_GRID_COLS })
                     : { why: "not_a_range_reference" };
    if (r.unit) units.push({ source: "table", name: t.name, scope: t.sheet, hidden: false, unit: r.unit });
    else skipped.push({ source: "table", name: t.name, ref: t.ref, part: t.part, why: r.why });
  }
  return { rangeUnits: units, rangeUnitsSkipped: skipped };
}

function xlsxText(parts) {
  /* The shapes below are IC-2's pageless degenerate form AS ACCEPTED from
   * docx.mjs (paragraphs[] there, sheets[] here — the per-unit list named for
   * what the unit IS; `ok`/`container`/`document`/`undetermined`/`counts`
   * shared wherever the meaning transfers). */
  if (!parts || !parts.ok) {
    return { ok: false, container: "xlsx", reason: parts?.why ?? "PARTS_ABSENT" };
  }
  const { sheets, sharedStrings, guard } = parts;

  if (guard) {
    /* Over the measured bound: the sizeGuard marker carried VERBATIM inside
     * `undetermined` (the docx.mjs pattern — ooxml.mjs shaped the marker for
     * exactly this), never a silent truncation. */
    return {
      ok: true, container: "xlsx", document: null, sheets: [],
      ...xlsxRangeUnits(parts),
      undetermined: [guard],
      counts: { chars: 0, cells: 0, formulas: 0, undetermined: 1 },
    };
  }

  const outSheets = [];
  const allUndetermined = [];
  let cellCount = 0, formulaCount = 0;

  for (const sheet of sheets) {
    if (sheet.xml == null) {
      const marker = { sheet: sheet.index, cell: null, reason: sheet.why ?? "sheet_unreadable" };
      /* COFF-11: the BOUND still stands — this is a sheet of an XLSX workbook
         whether or not its part could be read, so an impossible address is
         still impossible and is still refused. The USED range is NULL rather
         than 0, because nothing walked it: a zero here would say "this sheet
         holds nothing", which is the one thing an unread sheet cannot say. */
      outSheets.push({ sheet: sheet.index, name: sheet.name, hidden: sheet.hidden,
        rows: XLSX_GRID_ROWS, cols: XLSX_GRID_COLS, usedRows: null, usedCols: null,
        range: null, text: "", undetermined: [marker] });
      allUndetermined.push(marker);
      continue;
    }
    const walked = walkSheetXml(sheet.xml);
    const undetermined = [];
    const lines = [];
    for (const row of walked.rows) {
      const vals = [];
      for (const c of row.cells) {
        if (c.f != null) formulaCount++;
        const r = cellValue(c, sharedStrings);
        if (r.undetermined) {
          undetermined.push({ sheet: sheet.index, cell: c.cell, reason: r.undetermined });
          continue;
        }
        if (r.value == null || r.value === "") continue;
        cellCount++;
        vals.push(r.value);
      }
      if (vals.length) lines.push(vals.join("\t"));
    }
    const text = lines.join("\n");
    /* COFF-11 / IC-100 — the sheet's own extent, in TWO figures that are two
       different facts: `rows`/`cols` is the BOUND (the grid this format makes
       addressable, which is what C-45.1's inner bound compares against), and
       `usedRows`/`usedCols` is how far this workbook's cells actually reach.
       See the decision block above `XLSX_GRID_ROWS`. */
    outSheets.push({ sheet: sheet.index, name: sheet.name, hidden: sheet.hidden,
      rows: XLSX_GRID_ROWS, cols: XLSX_GRID_COLS,
      usedRows: walked.usedRows, usedCols: walked.usedCols,
      /* FW-19 / IC-124: the sheet as a `sheet-range` unit, or NULL. */
      range: usedSheetRange(sheet.name, walked.usedRows, walked.usedCols),
      text, undetermined });
    for (const u of undetermined) allUndetermined.push(u);
  }

  const document = outSheets.map((s) => s.text).filter((t) => t.length).join("\n");
  return {
    ok: true,
    container: "xlsx",
    document,
    sheets: outSheets,
    /* D-415: the defined names and tables as `sheet-range` units, beside
       each sheet's whole-sheet `range`. */
    ...xlsxRangeUnits(parts),
    undetermined: allUndetermined,
    counts: { chars: document.length, cells: cellCount, formulas: formulaCount,
      undetermined: allUndetermined.length },
  };
}

/* ------------------------------------------------------------------ *
 * The I7 entry (registered by formats.mjs — one registerFormat call there,
 * nothing anywhere else; that is the D-70 property this axis exists to keep)
 * ------------------------------------------------------------------ */

export const xlsxEntry = {
  format: "xlsx",
  detect(bytes, contentType) {
    if (bytes) {
      if (!hasZipMagic(bytes)) return null;
      /* readContainer is synchronous (a directory walk, no inflation), so a
       * FULL container can answer here. A prefix — the acquire-time 1 KiB
       * seam — has no reachable central directory, and a bare PK sniff must
       * NOT claim xlsx: null, honestly, and the content-type pass may speak. */
      const c = readContainer(bytes);
      if (!c.ok) return null;
      if (c.byName.has(CONTENT_TYPES_PART) && c.byName.has(WORKBOOK_PART)) {
        return { format: "xlsx", confidence: "likely", signals: [
          "magic: PK\\x03\\x04 with a readable central directory",
          `parts: ${CONTENT_TYPES_PART} and ${WORKBOOK_PART} present`,
          "likely, not certain: the declared main content type lives in a deflated part; parts() completes the discrimination",
        ] };
      }
      return null;
    }
    if (contentType === XLSX_CONTENT_TYPE) {
      return { format: "xlsx", confidence: "likely",
        signals: [`content type "${contentType}"`] };
    }
    return null;
  },
  parts: (bytes) => xlsxParts(bytes),
  /* Accept either parts() output or raw bytes, exactly as docx.mjs does, so
     detect→structure works uniformly at the registry seam while a caller that
     already paid for parts() does not pay twice. */
  structure: async (partsOrBytes) => {
    const parts = partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
      ? await xlsxParts(partsOrBytes)
      : partsOrBytes;
    return xlsxStructure(parts);
  },
  text: async (partsOrBytes) => {
    const parts = partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
      ? await xlsxParts(partsOrBytes)
      : partsOrBytes;
    /* FW-19 / IC-124: `images` under xl/media/, exhaustive or NULL. */
    return withContainerImages(xlsxText(parts), parts, "xl/media/");
  },
};
