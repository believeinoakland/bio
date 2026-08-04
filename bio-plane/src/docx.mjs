/* The DOCX registry entry (I7, QUEUE COFF-4) — the first office format on the
 * FORMAT axis, built on ooxml.mjs's container primitives.
 *
 * WHAT IT EMITS (I2, plus the shared evidentiary envelope — IC-2):
 *
 *   structure(parts) ->
 *     { ok:true, container:"docx", paragraphs:<int>,
 *       links:[ LinkRecord... ],           // the SAME partitions HTML and PDF
 *       counts:{anchor,intra,deferred,refused,undetermined},   // use, wrapped
 *       evidentiary:{ ... },               // IC-2 — the extras a rendered form
 *       notes:[...] }                      //        of the document destroys
 *
 *   - word/_rels/document.xml.rels `TargetMode="External"` -> deferred/refused,
 *     wrapped by importing subresources.mjs's ONE `linkWrapper` — the parity
 *     property pdfstructure.test.mjs pins for PDF is pinned here for DOCX the
 *     same way, so FRAMEWORK consumes all three containers through one path.
 *   - `<w:hyperlink w:anchor>` -> bookmark -> `anchor` (an internal reference
 *     the way a PDF GoTo is); an anchor naming a bookmark the body does not
 *     define is a STATED undetermined, never an invented target.
 *   - word/embeddings/* -> `intra`, content-addressed by sha256 exactly as a
 *     PDF's embedded files are.
 *   - An unreadable .rels part or embedding is CARRIED as an undetermined
 *     LinkRecord naming the part and why — dropped structure is invented
 *     structure's quieter sibling, and both are forbidden.
 *
 *   ELEMENT REFERENCES are `{kind:"doc-para", ref:"¶<1-based>", para:<0-based>,
 *   run:<0-based, optional>}` per IC-1 as RESOLVED: a DOCX has no pages in its
 *   bytes (pagination is a render-time artifact), so the body's `<w:p>`
 *   sequence — every `<w:p>` in document order, including inside tables — is
 *   the honest anchor. `run` appears only when the reference genuinely targets
 *   runs (a hyperlink, a tracked change); run boundaries are producer
 *   artifacts, and the paragraph is what a person is shown.
 *
 *   text(parts) -> { ok:true, container:"docx", document, paragraphs:[
 *     {para, ref, text} ], undetermined:[Marker...], counts:{chars,
 *     undetermined} } — `<w:t>` runs in body order. A DOCX has no pages, so
 *   the per-unit list is `paragraphs`, not PDF's `pages` (the degenerate form
 *   I2's residual anticipated; stated in IC-2). Deleted text (`w:delText`)
 *   is NOT in the text stream — it is not what a reader of the served
 *   document sees — it lives in the evidentiary envelope as the SUPERSEDED
 *   WORDING. Inserted text (`w:ins` > `w:t`) IS in the stream: it is part of
 *   the document as served.
 *
 *   THE EVIDENTIARY CORE (DEC-5). Tracked changes and comments are evidence a
 *   published PDF of the same document is specifically designed to remove:
 *     { kind:"tracked-change", change:"insertion", author, date, text, source }
 *     { kind:"tracked-change", change:"deletion",  author, date,
 *       superseded, source }                  // the wording that was removed
 *     { kind:"comment", id, author, date, initials, text, source }
 *     { kind:"core-properties", creator, lastModifiedBy, revision, ... }
 *   under ONE envelope `evidentiary` shared by the office entries (IC-2):
 *     { container, kinds:[...], items:[...], undetermined:[{part,why}...],
 *       counts:{<kind>:n} }
 *   Absent attributes are null, never invented; an unreadable comments.xml is
 *   a STATED `{part, why}` in the envelope's own `undetermined`.
 *
 * DETECTION — the confidence ladder, decided deliberately (COFF-1's note):
 *   - bytes: ZIP magic + a READABLE central directory + BOTH
 *     `[Content_Types].xml` and `word/document.xml` present -> "likely". Not
 *     "certain": certainty needs the OPC content-type declaration, which is
 *     DEFLATED and so out of reach of the registry's synchronous detect;
 *     `parts()` runs the full async `discriminate()` and tells the truth.
 *   - a bare `PK\x03\x04` sniff (the acquire-time 1 KiB seam: no EOCD, no
 *     central directory) answers NULL — a renamed plain ZIP is not a .docx,
 *     so ZIP magic alone never claims one. The acquire stamp honestly reads
 *     `undetermined` for OOXML captures until a read-time consult sees the
 *     whole container.
 *   - content type alone: the exact .docx MIME type -> "likely" (the
 *     registry's second pass; a declared type is at most likely, per I7).
 *
 * SIZE GUARD: full text extraction is refused as a STATED text-undetermined
 * when the DECLARED UNCOMPRESSED bytes of the text parts we would inflate
 * (word/document.xml + word/comments.xml, summed from the central directory —
 * the COFF-6 metric) exceed ooxml.mjs's bound. Container walk, rels and
 * core-properties still run; nothing is silently truncated.
 *
 * This module ASSERTS nothing about meaning (FRAMEWORK's, through I2) and
 * WRITES nothing. Never invent structure: everything unreadable is stated.
 */

import { linkWrapper } from "./subresources.mjs";
import {
  hasZipMagic, readContainer, readPart, normalizePartName,
  discriminate, walkRels, relsPartFor, sizeGuard,
  CORE_PROPERTIES_PART, readCoreProperties,
} from "./ooxml.mjs";

const UTF8 = new TextDecoder("utf-8", { fatal: false });

export const DOCX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const CONTENT_TYPES_PART = "[Content_Types].xml";
const MAIN_PART = "word/document.xml";
const COMMENTS_PART = "word/comments.xml";
const EMBEDDINGS_DIR = "word/embeddings/";

/* ------------------------------------------------------------------ *
 * The IC-1 element reference
 * ------------------------------------------------------------------ */

/** `{kind:"doc-para", ref:"¶<1-based>", para:<0-based>[, run:<0-based>]}`.
 *  `run` is included only when the caller genuinely has one (IC-1: run
 *  boundaries are producer artifacts; the paragraph is what a person is
 *  shown). */
export function docParaRef(para, run = null) {
  const ref = { kind: "doc-para", ref: `¶${para + 1}`, para };
  if (run != null) ref.run = run;
  return ref;
}

/* ------------------------------------------------------------------ *
 * Minimal XML plumbing (local: ooxml.mjs's helpers are private, and the
 * body walk needs NESTING, which its flat matchers deliberately avoid)
 * ------------------------------------------------------------------ */

function decodeEntities(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[e] ?? m;
  });
}

/* Attributes by LOCAL name (prefix-agnostic, entity-decoded). */
function attrsOf(raw) {
  const attrs = {};
  for (const a of (raw || "").matchAll(/([\w.-]+(?::[\w.-]+)?)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    const local = a[1].includes(":") ? a[1].split(":").pop() : a[1];
    attrs[local] = decodeEntities(a[3] ?? a[4] ?? "");
  }
  return attrs;
}

/* One tag / comment / PI / CDATA at a time; character data is the gap between
 * matches. Local names only — WordprocessingML always prefixes, but the walk
 * must not depend on which prefix a producer chose. */
const TOKEN_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<\/?([\w.-]+(?::[\w.-]+)?)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
const localOf = (name) => (name.includes(":") ? name.split(":").pop() : name);

/* ------------------------------------------------------------------ *
 * The body walk — ONE pass over word/document.xml collecting everything
 * structure(), text() and the evidentiary envelope need, in body order
 * ------------------------------------------------------------------ */

/** Walk a WordprocessingML document. Returns
 *  { paragraphs:[{para,text}], hyperlinks:[{rid,anchor,para,run}],
 *    bookmarks:Map(name -> para), changes:[{change,author,date,text,para,run}],
 *    commentRefs:Map(id -> {para,run}), ridUsage:Map(rid -> {para,run}) }.
 *
 *  Paragraph index: EVERY `<w:p>` in document order (paragraphs never nest in
 *  WordprocessingML — a table cell's paragraphs are `<w:p>` elements too, and
 *  they count). Run index: `<w:r>` opens within the current paragraph,
 *  0-based, wherever they sit (inside hyperlinks and tracked changes
 *  included) — one sequence per paragraph, so a run index means the same
 *  thing to every reference into that paragraph. */
export function walkDocumentBody(xml) {
  const paragraphs = [];
  const hyperlinks = [];
  const bookmarks = new Map();
  const changes = [];
  const commentRefs = new Map();
  const ridUsage = new Map();

  let para = -1;   // current 0-based paragraph index
  let run = -1;    // current 0-based run index within the paragraph
  let inPara = false;
  let textTarget = null;            // "t" | "delText" | null, while inside one
  const hyperStack = [];            // open <w:hyperlink> contexts
  const insStack = [];              // open <w:ins> contexts
  const delStack = [];              // open <w:del> contexts

  const noteRid = (attrs) => {
    if (!inPara) return;
    for (const key of ["id", "embed", "link"]) {
      const v = attrs[key];
      if (typeof v === "string" && /^rId/.test(v) && !ridUsage.has(v))
        ridUsage.set(v, { para, run: run >= 0 ? run : null });
    }
  };
  const appendVisible = (s) => {
    if (!inPara || !s) return;
    paragraphs[para].text += s;
    for (const c of insStack) c.text += s;
  };

  TOKEN_RE.lastIndex = 0;
  let m, prev = 0;
  while ((m = TOKEN_RE.exec(xml)) !== null) {
    /* Character data between the previous token and this one. */
    if (textTarget && m.index > prev) {
      const data = decodeEntities(xml.slice(prev, m.index));
      if (textTarget === "t") appendVisible(data);
      else if (textTarget === "delText" && delStack.length) delStack[delStack.length - 1].text += data;
    }
    prev = TOKEN_RE.lastIndex;
    if (m[1] === undefined) continue; // comment / CDATA / PI
    const name = localOf(m[1]);
    const selfClosed = m[3] === "/";
    const closing = m[0][1] === "/";

    if (closing) {
      if (name === "t" || name === "delText") textTarget = null;
      else if (name === "p") { inPara = false; }
      else if (name === "hyperlink") { const h = hyperStack.pop(); if (h) hyperlinks.push(h); }
      else if (name === "ins") { const c = insStack.pop(); if (c) changes.push(c); }
      else if (name === "del") { const c = delStack.pop(); if (c) changes.push(c); }
      continue;
    }

    const attrs = m[2] && m[2].includes("=") ? attrsOf(m[2]) : {};
    switch (name) {
      case "p":
        if (!selfClosed) { para++; run = -1; inPara = true; paragraphs.push({ para, text: "" }); }
        else { para++; run = -1; paragraphs.push({ para, text: "" }); }
        break;
      case "r":
        if (inPara && !selfClosed) {
          run++;
          for (const c of hyperStack) if (c.run == null) c.run = run;
          for (const c of insStack) if (c.run == null) c.run = run;
          for (const c of delStack) if (c.run == null) c.run = run;
        }
        break;
      case "t":
        if (!selfClosed) textTarget = "t";
        break;
      case "delText":
        if (!selfClosed) textTarget = "delText";
        break;
      case "tab":
        appendVisible("\t");
        break;
      case "br":
      case "cr":
        appendVisible("\n");
        break;
      case "hyperlink":
        noteRid(attrs);
        if (!selfClosed && inPara)
          hyperStack.push({ rid: attrs.id ?? null, anchor: attrs.anchor ?? null, para, run: null });
        else if (selfClosed && inPara)
          hyperlinks.push({ rid: attrs.id ?? null, anchor: attrs.anchor ?? null, para, run: null });
        break;
      case "ins":
        if (!selfClosed && inPara)
          insStack.push({ change: "insertion", author: attrs.author ?? null, date: attrs.date ?? null, text: "", para, run: null });
        break;
      case "del":
        if (!selfClosed && inPara)
          delStack.push({ change: "deletion", author: attrs.author ?? null, date: attrs.date ?? null, text: "", para, run: null });
        break;
      case "bookmarkStart":
        if (attrs.name != null && !bookmarks.has(attrs.name))
          bookmarks.set(attrs.name, para >= 0 ? para : 0);
        break;
      case "commentReference":
        if (attrs.id != null && !commentRefs.has(attrs.id))
          commentRefs.set(attrs.id, { para, run: run >= 0 ? run : null });
        break;
      default:
        noteRid(attrs);
    }
  }
  return { paragraphs, hyperlinks, bookmarks, changes, commentRefs, ridUsage };
}

/* ------------------------------------------------------------------ *
 * word/comments.xml
 * ------------------------------------------------------------------ */

/** Every `<w:comment>`: id, author, date, initials (each null when absent —
 *  never invented) and the comment's own text (its `<w:t>` runs, paragraphs
 *  newline-joined). */
export function parseComments(xml) {
  if (typeof xml !== "string" || !/<(?:[\w.-]+:)?comments\b/.test(xml)) {
    return { ok: false, why: "comments_unparseable" };
  }
  const comments = [];
  const re = /<(?:[\w.-]+:)?comment\b((?:[^>"']|"[^"]*"|'[^']*')*?)>([\s\S]*?)<\/(?:[\w.-]+:)?comment>/g;
  for (const m of xml.matchAll(re)) {
    const a = attrsOf(m[1]);
    const paras = [];
    for (const pm of m[2].split(/<\/(?:[\w.-]+:)?p>/)) {
      let text = "";
      for (const t of pm.matchAll(/<(?:[\w.-]+:)?t\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?t>/g))
        text += decodeEntities(t[1]);
      if (text) paras.push(text);
    }
    comments.push({
      id: a.id ?? null,
      author: a.author ?? null,
      date: a.date ?? null,
      initials: a.initials ?? null,
      text: paras.join("\n"),
    });
  }
  return { ok: true, comments };
}

/* ------------------------------------------------------------------ *
 * Link classification — the same partition rule pdfstructure applies
 * (http/https and bare relatives -> deferred; every other scheme refused)
 * ------------------------------------------------------------------ */

function classifyUri(uri) {
  const m = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/.exec(uri || "");
  const scheme = m ? m[1].toLowerCase() : null;
  if (scheme === "http" || scheme === "https") return "deferred";
  if (!scheme && uri) return "deferred";
  return "refused";
}

function deferredOrRefusedRecord(uri, source) {
  const partition = classifyUri(uri);
  return {
    partition,
    wrapper: partition === "deferred" ? linkWrapper.deferred(uri) : linkWrapper.refused(uri),
    target: { url: uri },
    source,
  };
}

function undeterminedRecord(source, why, extra = {}) {
  return { partition: "undetermined", wrapper: null, target: { why, ...extra }, source };
}

const HEX = "0123456789abcdef";
async function sha256Hex(u8) {
  const d = await crypto.subtle.digest("SHA-256", u8);
  const b = new Uint8Array(d);
  let out = "";
  for (let i = 0; i < b.length; i++) out += HEX[b[i] >> 4] + HEX[b[i] & 15];
  return out;
}

/* Resolve a rels Target against the source part's directory ("media/x.png"
 * relative to "word/" -> "word/media/x.png"; a leading "/" is package-root). */
function resolveRelTarget(relsPart, target) {
  const t = String(target || "");
  if (t.startsWith("/")) return normalizePartName(t);
  const baseDir = relsPart.replace(/_rels\/[^/]*\.rels$/, "");
  const segs = (baseDir + t).split("/");
  const out = [];
  for (const s of segs) {
    if (s === "" || s === ".") continue;
    if (s === "..") out.pop();
    else out.push(s);
  }
  return out.join("/");
}

/* ------------------------------------------------------------------ *
 * parts() — the container walk (I7 slot 2)
 * ------------------------------------------------------------------ */

/** Read everything structure()/text() will need, honestly:
 *  { ok:true, format:"docx", bytes, container, mainPart,
 *    documentXml|null, commentsXml|null, rels, core|null,
 *    guard|null,                       // the sizeGuard marker when over bound
 *    undetermined:[{part,why}...] }    // parts that exist but cannot be read
 *  or { ok:false, why, signals } when the bytes are not a readable DOCX. */
async function docxParts(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const d = await discriminate(b);
  if (!d.ok) return { ok: false, why: d.why, signals: d.signals };
  if (d.format !== "docx") {
    return {
      ok: false,
      why: d.format === "undetermined" ? d.why : `not_docx:${d.format}`,
      signals: d.signals,
    };
  }
  const container = readContainer(b);
  if (!container.ok) return { ok: false, why: container.why, signals: d.signals };

  const undetermined = [];
  const mainPart = normalizePartName(d.mainPart || MAIN_PART);

  /* The COFF-6 metric: DECLARED UNCOMPRESSED bytes of the text parts we would
   * inflate, summed from the central directory BEFORE any inflation. */
  let declaredTextBytes = 0;
  for (const partName of [mainPart, COMMENTS_PART]) {
    const e = container.byName.get(partName);
    if (e) declaredTextBytes += e.uncompressedSize;
  }
  const guardR = sizeGuard(declaredTextBytes);
  const guard = guardR.ok ? null : guardR;

  let documentXml = null;
  let commentsXml = null;
  if (!guard) {
    const main = await readPart(b, container, mainPart);
    if (main.ok) documentXml = UTF8.decode(main.bytes);
    else undetermined.push({ part: mainPart, why: main.why });
    if (container.byName.has(COMMENTS_PART)) {
      const com = await readPart(b, container, COMMENTS_PART);
      if (com.ok) commentsXml = UTF8.decode(com.bytes);
      else undetermined.push({ part: COMMENTS_PART, why: com.why });
    }
  }

  const rels = await walkRels(b, container);

  let core = null;
  if (container.byName.has(CORE_PROPERTIES_PART)) {
    const c = await readCoreProperties(b, container);
    if (c.ok) core = c;
    else undetermined.push({ part: CORE_PROPERTIES_PART, why: c.why });
  }

  return { ok: true, format: "docx", bytes: b, container, mainPart, documentXml, commentsXml, rels, core, guard, undetermined };
}

/* ------------------------------------------------------------------ *
 * structure() — I2 links + the evidentiary envelope (I7 slot 3)
 * ------------------------------------------------------------------ */

async function docxStructure(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "docx", reason: parts?.why ?? "PARTS_ABSENT" };
  }
  const notes = [];
  const links = [];
  const walk = parts.documentXml ? walkDocumentBody(parts.documentXml) : null;
  if (!walk) {
    notes.push(parts.guard
      ? "word/document.xml not read: over the size bound (stated in evidentiary.undetermined and by text())"
      : "word/document.xml unreadable: element references unavailable (stated)");
  }

  /* Outbound rels -> deferred/refused, through the ONE linkWrapper. The
   * document part's rels get paragraph attribution from the body walk; every
   * other part's outbound rels are carried with source:null (a document-level
   * fact, not an invented location). One record per body USAGE when a rel is
   * used; a rel no usage was found for is still carried once. */
  const docRelsPart = relsPartFor(parts.mainPart);
  for (const rel of parts.rels.outbound) {
    if (rel.part === docRelsPart && walk) {
      const usages = walk.hyperlinks.filter((h) => h.rid === rel.id);
      if (usages.length) {
        for (const u of usages)
          links.push(deferredOrRefusedRecord(rel.target, docParaRef(u.para, u.run)));
        continue;
      }
    }
    links.push(deferredOrRefusedRecord(rel.target, null));
  }
  /* An unreadable .rels part means links may be MISSING: stated, not dropped. */
  for (const u of parts.rels.undetermined) {
    links.push(undeterminedRecord(null, "rels_unreadable", { part: u.part, detail: u.why }));
  }

  /* Internal `<w:hyperlink w:anchor>` -> bookmark -> anchor. */
  if (walk) {
    for (const h of walk.hyperlinks) {
      if (h.rid != null || h.anchor == null) continue;
      const source = docParaRef(h.para, h.run);
      if (walk.bookmarks.has(h.anchor)) {
        const targetPara = walk.bookmarks.get(h.anchor);
        const fragment = `#para=${targetPara + 1}`;
        links.push({
          partition: "anchor",
          wrapper: linkWrapper.anchor(fragment),
          target: { para: targetPara, fragment, bookmark: h.anchor },
          source,
        });
      } else {
        links.push(undeterminedRecord(source, "bookmark_unresolved", { bookmark: h.anchor }));
      }
    }
  }

  /* word/embeddings/* -> intra, content-addressed. Located back to a
   * paragraph through the rels id when the body uses it; else source:null. */
  const embeddingRids = new Map(); // resolved part name -> rel id (document rels)
  for (const bp of parts.rels.byPart) {
    if (bp.part !== docRelsPart) continue;
    for (const r of bp.relationships) {
      if (r.external || !r.target) continue;
      const resolved = resolveRelTarget(bp.part, r.target);
      if (resolved.startsWith(EMBEDDINGS_DIR)) embeddingRids.set(resolved, r.id);
    }
  }
  for (const entry of parts.container.entries) {
    const name = normalizePartName(entry.name);
    if (!name.startsWith(EMBEDDINGS_DIR) || name === EMBEDDINGS_DIR) continue;
    const rid = embeddingRids.get(name) ?? null;
    const at = rid != null && walk ? walk.ridUsage.get(rid) ?? null : null;
    const source = at ? docParaRef(at.para, at.run) : null;
    const read = await readPart(parts.bytes, parts.container, name);
    if (!read.ok) {
      links.push(undeterminedRecord(source, "embedded_part_unreadable", { part: name, detail: read.why }));
      continue;
    }
    const sha = await sha256Hex(read.bytes);
    links.push({
      partition: "intra",
      wrapper: linkWrapper.intra(sha),
      target: { sha256: sha, name: name.slice(name.lastIndexOf("/") + 1), bytes: read.bytes.length },
      source,
    });
  }

  const counts = { anchor: 0, intra: 0, deferred: 0, refused: 0, undetermined: 0 };
  for (const l of links) counts[l.partition]++;

  /* ---- the evidentiary envelope (DEC-5, filed against I2 as IC-2) ---- */
  const items = [];
  if (walk) {
    for (const c of walk.changes) {
      const item = {
        kind: "tracked-change",
        change: c.change,
        author: c.author,
        date: c.date,
        source: docParaRef(c.para, c.run),
      };
      if (c.change === "deletion") item.superseded = c.text; // THE SUPERSEDED WORDING
      else item.text = c.text;
      items.push(item);
    }
  }
  const evUndetermined = [...parts.undetermined];
  if (parts.guard) evUndetermined.push({ part: parts.mainPart, why: "over_size_bound", guard: parts.guard });
  if (parts.commentsXml != null) {
    const parsed = parseComments(parts.commentsXml);
    if (!parsed.ok) evUndetermined.push({ part: COMMENTS_PART, why: parsed.why });
    else {
      for (const c of parsed.comments) {
        const at = walk && c.id != null ? walk.commentRefs.get(c.id) ?? null : null;
        items.push({
          kind: "comment",
          id: c.id, author: c.author, date: c.date, initials: c.initials, text: c.text,
          source: at ? docParaRef(at.para, at.run) : null,
        });
      }
    }
  }
  if (parts.core) {
    items.push({
      kind: "core-properties",
      creator: parts.core.creator, lastModifiedBy: parts.core.lastModifiedBy,
      revision: parts.core.revision, revisionNumber: parts.core.revisionNumber,
      created: parts.core.created, modified: parts.core.modified, title: parts.core.title,
      source: null,
    });
  }
  const evCounts = {};
  for (const it of items) evCounts[it.kind] = (evCounts[it.kind] ?? 0) + 1;
  const evidentiary = {
    container: "docx",
    kinds: [...new Set(items.map((it) => it.kind))],
    items,
    undetermined: evUndetermined,
    counts: evCounts,
  };

  return {
    ok: true,
    container: "docx",
    paragraphs: walk ? walk.paragraphs.length : null, // null = honestly unknown
    links,
    counts,
    evidentiary,
    notes,
  };
}

/* ------------------------------------------------------------------ *
 * text() — <w:t> runs in body order (I7 slot 4)
 * ------------------------------------------------------------------ */

async function docxText(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "docx", reason: parts?.why ?? "PARTS_ABSENT" };
  }
  if (parts.guard) {
    /* Over the bound: the sizeGuard marker carried VERBATIM (COFF-2 shaped it
     * for exactly this), never a silent truncation. */
    return {
      ok: true, container: "docx", document: null, paragraphs: [],
      undetermined: [parts.guard],
      counts: { chars: 0, undetermined: 1 },
    };
  }
  if (parts.documentXml == null) {
    const stated = parts.undetermined.find((u) => u.part === parts.mainPart);
    return {
      ok: true, container: "docx", document: null, paragraphs: [],
      undetermined: [{ reason: "main_part_unreadable", part: parts.mainPart, why: stated?.why ?? "unreadable" }],
      counts: { chars: 0, undetermined: 1 },
    };
  }
  const walk = walkDocumentBody(parts.documentXml);
  const paragraphs = walk.paragraphs.map((p) => ({ para: p.para, ref: `¶${p.para + 1}`, text: p.text }));
  const document = paragraphs.map((p) => p.text).filter((t) => t.length).join("\n");
  return {
    ok: true, container: "docx", document, paragraphs,
    undetermined: [],
    counts: { chars: document.length, undetermined: 0 },
  };
}

/* ------------------------------------------------------------------ *
 * The I7 entry
 * ------------------------------------------------------------------ */

export const docxEntry = {
  format: "docx",
  detect(bytes, contentType) {
    if (bytes) {
      if (!hasZipMagic(bytes)) return null;
      /* Sync, so the central directory NAMES are the strongest honest signal:
       * an OPC content-type map plus the conventional main part. At the 1 KiB
       * acquire seam there is no EOCD, readContainer refuses, and this entry
       * answers null — ZIP magic alone NEVER claims a docx. */
      const container = readContainer(bytes);
      if (!container.ok) return null;
      if (container.byName.has(CONTENT_TYPES_PART) && container.byName.has(MAIN_PART)) {
        return {
          format: "docx", confidence: "likely",
          signals: [
            "magic: PK\\x03\\x04 with a readable central directory",
            `part: ${CONTENT_TYPES_PART} present`,
            `part: ${MAIN_PART} present`,
            "likely, not certain: the OPC content-type declaration is deflated — parts() discriminates",
          ],
        };
      }
      return null;
    }
    if (contentType === DOCX_CONTENT_TYPE) {
      return { format: "docx", confidence: "likely", signals: [`content type "${contentType}"`] };
    }
    return null;
  },
  parts: (bytes) => docxParts(bytes),
  structure: async (partsOrBytes) => {
    /* Accept either parts() output or raw bytes, so detect→structure works
     * uniformly at the registry seam (formats.test.mjs's stub pattern) while
     * a caller that already paid for parts() does not pay twice. */
    const parts = partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
      ? await docxParts(partsOrBytes)
      : partsOrBytes;
    return docxStructure(parts);
  },
  text: async (partsOrBytes) => {
    const parts = partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
      ? await docxParts(partsOrBytes)
      : partsOrBytes;
    return docxText(parts);
  },
};
