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
 * knows it. `ref` is the exact human form a citation surface displays. */
function sheetCellRef(sheet, cell) {
  return { kind: "sheet-cell", ref: `${sheet}!${cell}`, sheet, cell };
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

  /* Defined names -> anchor material (workbook-scoped). */
  const definedNames = elements(wbXml, "definedName")
    .filter((d) => d.attrs.name != null)
    .map((d) => ({ name: d.attrs.name, ref: decodeXmlEntities(d.inner).trim() }));

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
    sheets, definedNames, sharedStrings, core, declared, guard, undetermined,
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
  return { rows, hiddenRows, hiddenCols, hyperlinks };
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
      outSheets.push({ sheet: sheet.index, name: sheet.name, hidden: sheet.hidden,
        text: "", undetermined: [marker] });
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
    outSheets.push({ sheet: sheet.index, name: sheet.name, hidden: sheet.hidden, text, undetermined });
    for (const u of undetermined) allUndetermined.push(u);
  }

  const document = outSheets.map((s) => s.text).filter((t) => t.length).join("\n");
  return {
    ok: true,
    container: "xlsx",
    document,
    sheets: outSheets,
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
    return xlsxText(parts);
  },
};
