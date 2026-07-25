/* BIO retrieval: the query language, S-10 step 3.
 *
 * Probe 2 (docs/development/RETRIEVAL-SUBSTRATE.md) established that the engine
 * already has everything the surface needs, so this is a PARSER AND A COMPILER,
 * not a search engine. Nothing here scores, tokenizes text, or walks a corpus.
 * It turns a member's typed string into SQL and hands it back.
 *
 * The module is deliberately pure and holds no database handle, for two reasons.
 * It makes the whole language testable without a runtime, and it makes the
 * viewer gate below unavoidable: store.mjs contains no search SQL at all, so
 * there is no second place a query could be assembled from.
 *
 * SETTLED, NOT OPTIONS. These come from Bob's decisions recorded in the
 * substrate document and must not drift:
 *   - A bare multi-word string means AND, ranked by relevance.
 *   - When an AND query returns nothing, the caller is offered the OR reading.
 *   - Default order is relevance, which is bm25.
 *   - Every sort compiles to ORDER BY <field> <dir>, bundle_id ASC. Without the
 *     stable tiebreak, paging is WRONG on any field with ties, not merely
 *     inconsistent: a row can appear on two pages or on none.
 *   - Select-all is a distinct request from a page.
 *   - source.locator and source.authority are searchable.
 *
 * Two things this file decides, because requirements plus the measurements left
 * one answer:
 *   1. With no text arm there is no relevance, so a metadata-only query orders
 *      by last_updated DESC with the same id tiebreak. Relevance remains the
 *      default wherever relevance exists.
 *   2. NULLs sort last on every field, in both directions. A sparse column
 *      sorted ascending would otherwise open with a page of rows that have no
 *      value at all, which reads as a broken control. The stable tiebreak is
 *      untouched by this.
 */

/* The field registry: the whole vocabulary of the language in one place.
 *
 *   col   the projected column the field filters on
 *   type  text | time | number | bool, which decides what comparisons mean
 *   fts   set when the field is FREE TEXT rather than an enumeration, in which
 *         case `field:value` is a column-scoped MATCH instead of equality
 *   lower set when corpus values are lowercase tokens, so a member typing
 *         Collected still matches. Done by normalising the ARGUMENT rather than
 *         with COLLATE NOCASE, because a NOCASE comparison cannot use the
 *         column's index and probe 2 recorded that losing the index turns a
 *         seek into a scan.
 */
export const FIELDS = {
  id:             { col: "bundle_id",       type: "text" },
  type:           { col: "object_type",     type: "text", lower: true },
  group:          { col: "group_id",        type: "text", lower: true },
  title:          { col: "title",           type: "text", fts: "title" },
  state:          { col: "current_state",   type: "text", lower: true },
  prior:          { col: "prior_state",     type: "text", lower: true },
  created:        { col: "created",         type: "time" },
  updated:        { col: "last_updated",    type: "time" },
  criticality:    { col: "criticality",     type: "text", lower: true },
  classification: { col: "classification",  type: "text", lower: true },
  sha:            { col: "bundle_sha",      type: "text", lower: true },
  schema:         { col: "schema_id",       type: "text", lower: true },
  mode:           { col: "produced_mode",   type: "text", lower: true },
  tier:           { col: "capability_tier", type: "text", lower: true },
  locator:        { col: "source_locator",  type: "text", fts: "locator" },
  authority:      { col: "source_authority", type: "text", fts: "authority" },
  retrieved:      { col: "source_retrieved", type: "time" },
  status:         { col: "source_status",   type: "text", lower: true },
  hash:           { col: "content_hash",    type: "text", lower: true },
  monitored:      { col: "monitor_enabled", type: "bool" },
  frequency:      { col: "monitor_frequency", type: "text", lower: true },
  checked:        { col: "monitor_last_checked", type: "time" },
  annotations:    { col: "annotations_open", type: "number" },
  reeval:         { col: "reeval_flag",     type: "bool" },
  since:          { col: "reeval_since",    type: "time" },
  reevalsource:   { col: "reeval_source",   type: "text", lower: true },
};

/* The text columns of the FTS5 table, in table order. `meta` carries the
   flattened frontmatter so a bare term finds a value no column projects, which
   is what makes the per-schema tail searchable without a schema per version. */
import { parseFrontmatter } from "../checks/bio-checks.mjs";

export const FTS_COLUMNS = ["title", "body", "meta", "locator", "authority"];

/* Sorting is offered on every projected field plus relevance. Naming them
   explicitly is what stops a caller putting arbitrary SQL in an ORDER BY. */
export const SORTABLE = { relevance: null, ...Object.fromEntries(
  Object.entries(FIELDS).map(([k, f]) => [k, f.col])) };

/* Facets the sidebar counts unless the caller names others. Every one is an
   indexed enumeration, which is why the count is an aggregate the measurements
   showed costs 5ms over 20,000 rows. */
export const DEFAULT_FACETS = ["type", "state", "criticality", "classification", "schema", "status"];

/* The marker every generated statement carries. The runtime test asserts that
   each statement the store executes contains it, so a query path that skipped
   the gate would be caught by its absence rather than by an audit of the code.
   It is a SQL comment, so it changes nothing about what runs. */
export const GATE_MARK = "/*viewer-gate*/";

/* ---------------------------------------------------------------------------
 * The viewer gate: D-15, designed in from the first commit.
 *
 * Search ships at flat member scope ahead of the membership model, which is
 * safe only because visibility filtering has exactly ONE compilation point.
 * Today, for a member, the predicate is true. When projects and positions land
 * this function returns a real predicate over project participation and every
 * query shape inherits it, which is a change in one function instead of an
 * audit of every query path.
 *
 * FAIL CLOSED. An unrecognised or absent viewer gets `0=1`, so a caller that
 * reaches the compiler without an identity sees nothing rather than everything.
 * That is not a test convenience: when the membership model arrives, the
 * dangerous default is the permissive one, and this makes the permissive answer
 * something a viewer must earn.
 * ------------------------------------------------------------------------- */
export function viewerPredicate(viewer) {
  const v = typeof viewer === "string" ? viewer : "";
  /* class:<token class> for a machine credential, member:<id> for a session.
     Both are flat member scope today. */
  const m = /^(class:(admin|member|probe)|member:[A-Za-z0-9._:-]{1,128}|admin)$/.exec(v);
  if (!m) return { sql: `${GATE_MARK} 0=1`, args: [], viewer: null, scope: "DENY" };
  return { sql: `${GATE_MARK} 1=1`, args: [], viewer: v, scope: "member" };
}

/* ---- S-10 step 2: the text surface ----
 *
 * What is indexed is what the group WROTE and what the frontmatter SAYS:
 *
 *   title      the frontmatter title, so `title:sewer` can scope to it
 *   locator    source.locator, searchable by Bob's decision. Searching is
 *   authority  source.authority, likewise. The citation surface is part of
 *              what a researcher mines, not a field held back from them.
 *   meta       every frontmatter key and scalar value, flattened. This is how
 *              the per-schema tail becomes searchable free text without a
 *              column per schema version.
 *   body       the prose of bundle.md plus every other INLINE text document in
 *              the bundle.
 *
 * Registered captures are deliberately absent. They live in R2 as bytes the
 * Durable Object never holds, so there is nothing here to index; indexing
 * capture text is its own question with its own cost curve and is not this.
 *
 * JSON data files are excluded from `body` on purpose. They are machine
 * records whose keys would flood the term statistics bm25 depends on, and a
 * gathering queue carries member-typed URLs that belong to intake rather than
 * to the searchable document. Their frontmatter-facing values still reach the
 * index through `meta` where they are part of the bundle's metadata.
 */
const TEXT_PATHS = /\.(md|txt)$/i;
const TEXT_CAP = 128 * 1024;   // per column, so one large bundle cannot make a write unbounded

export function textOf(bundleId, files) {
  const list = (files || []).map((f) => ({ path: f.path, text: typeof f.text === "string" ? f.text : (typeof f.content === "string" ? f.content : null) }));
  const md = list.find((f) => f.path === "bundle.md");
  let fm = null, prose = "";
  if (md && md.text !== null) {
    let p = null;
    try { p = parseFrontmatter(md.text); } catch { p = null; }
    fm = p?.data ?? null;
    prose = typeof p?.body === "string" ? p.body : md.text;
  }
  const bits = [];
  const walk = (v) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v)) { for (const x of v) walk(x); return; }
    if (typeof v === "object") { for (const [k, val] of Object.entries(v)) { bits.push(k); walk(val); } return; }
    bits.push(String(v));
  };
  walk(fm);
  const others = list
    .filter((f) => f.path !== "bundle.md" && f.text !== null && TEXT_PATHS.test(f.path))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const cap = (s) => String(s ?? "").slice(0, TEXT_CAP);
  const nested = (block, key) => {
    const b = fm && typeof fm === "object" ? fm[block] : null;
    return b && typeof b === "object" && !Array.isArray(b) && b[key] != null ? String(b[key]) : "";
  };
  return {
    title: cap(fm && fm.title != null ? String(fm.title) : ""),
    body: cap([prose, ...others.map((f) => f.path + "\n" + f.text)].join("\n\n")),
    /* The identifier is folded into `meta` so pasting a bundle id into the
       search bar finds the bundle, which is the first thing anyone tries. */
    meta: cap([String(bundleId), ...bits].join(" ")),
    locator: cap(nested("source", "locator")),
    authority: cap(nested("source", "authority")),
  };
}

/* ---------------------------------------------------------------------------
 * Tokenizer
 * ------------------------------------------------------------------------- */

const OPERATORS = { AND: "and", OR: "or", NOT: "not" };

function tokenize(input) {
  const src = String(input ?? "");
  const out = [];
  let i = 0;
  const isSpace = (c) => c === " " || c === "\t" || c === "\n" || c === "\r";
  /* Read a value: a quoted run, or a bare run ended by whitespace or a paren. */
  const readValue = () => {
    if (src[i] === '"') {
      i++;
      let s = "";
      while (i < src.length && src[i] !== '"') s += src[i++];
      i++; // closing quote, or end of input, which is tolerated rather than refused
      return { text: s, quoted: true };
    }
    let s = "";
    while (i < src.length && !isSpace(src[i]) && src[i] !== "(" && src[i] !== ")") s += src[i++];
    return { text: s, quoted: false };
  };
  while (i < src.length) {
    const c = src[i];
    if (isSpace(c)) { i++; continue; }
    if (c === "(") { out.push({ k: "(" }); i++; continue; }
    if (c === ")") { out.push({ k: ")" }); i++; continue; }
    /* A leading minus is negation, the shorthand every search box has. `-` on
       its own is not negation of nothing; it is discarded. */
    if (c === "-" && i + 1 < src.length && !isSpace(src[i + 1])) { out.push({ k: "not" }); i++; continue; }
    const start = i;
    const first = readValue();
    /* field:value, where the value may itself be quoted or carry a comparison. */
    if (!first.quoted && first.text.includes(":")) {
      const at = first.text.indexOf(":");
      const field = first.text.slice(0, at);
      let rest = first.text.slice(at + 1);
      /* `field:"two words"` splits at the quote, so back up and read the value
         properly rather than truncating it at the space. */
      if (rest === "" && src[i] === '"') { i = start + at + 1; rest = readValue().text; out.push({ k: "sel", field, value: rest, quoted: true }); continue; }
      out.push({ k: "sel", field, value: rest, quoted: false });
      continue;
    }
    if (!first.quoted && OPERATORS[first.text.toUpperCase()] && first.text === first.text.toUpperCase()) {
      out.push({ k: OPERATORS[first.text.toUpperCase()] });
      continue;
    }
    if (first.text !== "") out.push({ k: "term", value: first.text, quoted: first.quoted });
  }
  return out;
}

/* ---------------------------------------------------------------------------
 * Parser: OR binds loosest, then AND, then unary NOT, then a primary.
 * Adjacent atoms with no operator between them take `implicitOp`, which is AND
 * for a member's query and OR only when the surface re-runs a zero-result query
 * to offer the wider reading.
 * ------------------------------------------------------------------------- */

function parseTokens(tokens, implicitOp, ctx) {
  let p = 0;
  const peek = () => tokens[p];
  const eat = () => tokens[p++];

  const primary = () => {
    const t = peek();
    if (!t) return null;
    if (t.k === "(") {
      eat();
      const e = orExpr();
      if (peek()?.k === ")") eat();
      else ctx.warnings.push("unclosed parenthesis; read to the end of the query");
      return e;
    }
    if (t.k === ")") return null;
    if (t.k === "and" || t.k === "or") { eat(); return primary(); } // a dangling operator is noise
    if (t.k === "not") { eat(); const k = unary(); return k ? { op: "not", kid: k } : null; }
    if (t.k === "term") { eat(); return textAtom(null, t.value, t.quoted, ctx); }
    if (t.k === "sel") { eat(); return selector(t, ctx); }
    eat();
    return null;
  };
  const unary = () => primary();
  const andExpr = () => {
    const kids = [];
    for (;;) {
      const t = peek();
      if (!t || t.k === ")") break;
      if (t.k === "or") break;
      if (t.k === "and") { eat(); continue; }
      const k = unary();
      if (k) kids.push(k);
      else if (!peek() || peek()?.k === ")") break;
    }
    if (!kids.length) return null;
    if (kids.length === 1) return kids[0];
    return { op: implicitOp, kids };
  };
  const orExpr = () => {
    const kids = [];
    for (;;) {
      const k = andExpr();
      if (k) kids.push(k);
      if (peek()?.k === "or") { eat(); continue; }
      break;
    }
    if (!kids.length) return null;
    if (kids.length === 1) return kids[0];
    return { op: "or", kids };
  };
  const ast = orExpr();
  return ast;
}

/* A free-text atom. `column` restricts it to one FTS column; null matches every
   column, which is what a bare word should do. A trailing star is a prefix
   match, the affordance that stands in for a stemmer. */
function textAtom(column, value, quoted, ctx) {
  let v = value;
  let prefix = false;
  if (!quoted && v.endsWith("*") && v.length > 1) { prefix = true; v = v.slice(0, -1); }
  if (v === "") return null;
  /* Punctuation on its own indexes to nothing, so an FTS5 literal built from it
     matches no row and would silently empty the result of an otherwise good
     query. A stray dash or bracket is noise the member did not mean as a term. */
  if (!/[\p{L}\p{N}]/u.test(v)) return null;
  const atom = { op: "text", column, value: v, phrase: quoted && /\s/.test(v), prefix };
  ctx.textAtoms.push(atom);
  return atom;
}

const CMP = [[">=", ">="], ["<=", "<="], [">", ">"], ["<", "<"]];

function selector(tok, ctx) {
  const name = tok.field.toLowerCase();
  /* `has:field` asks whether a field carries any value at all, which is the
     question a member actually has about a sparse column. */
  if (name === "has") {
    const f = FIELDS[String(tok.value).toLowerCase()];
    if (!f) { ctx.warnings.push(`has: unknown field ${JSON.stringify(tok.value)}`); return null; }
    return { op: "meta", col: f.col, cmp: "present", value: null };
  }
  /* `sort:` is a directive, not a predicate. Consumed here so it never becomes
     part of the boolean and never reaches a WHERE clause. */
  if (name === "sort") { applySort(tok.value, ctx); return null; }
  /* `text:` forces free text even where a field of the same name exists. */
  if (name === "text") return textAtom(null, tok.value, tok.quoted, ctx);
  /* `fm:<path>` reaches the per-schema tail through json_extract. The path is
     bounded to identifier characters so it cannot carry SQL, and it is passed
     as an ARGUMENT rather than interpolated. */
  if (name === "fm") {
    const at = tok.value.indexOf("=");
    const path = at < 0 ? tok.value : tok.value.slice(0, at);
    const val = at < 0 ? null : tok.value.slice(at + 1);
    if (!/^[A-Za-z0-9_.[\]]{1,120}$/.test(path)) {
      ctx.warnings.push(`fm: path ${JSON.stringify(path)} is not a frontmatter path`);
      return null;
    }
    return val === null
      ? { op: "meta", json: "$." + path, cmp: "present", value: null }
      : { op: "meta", json: "$." + path, cmp: "=", value: val };
  }
  const f = FIELDS[name];
  if (!f) {
    /* An unknown selector is treated as free text rather than refused. A member
       typing `sewer:fund` meant to search, and answering "no such field" for a
       string that is obviously a search is the control feeling broken. The
       warning still says what happened. */
    ctx.warnings.push(`unknown field ${JSON.stringify(tok.field)}; read as free text`);
    return textAtom(null, `${tok.field} ${tok.value}`.trim(), true, ctx);
  }
  let raw = String(tok.value);
  /* Comparisons and ranges are metadata predicates on every field, including the
     free-text ones: `created:>2026-01-01` is an ordering question and MATCH
     cannot answer it. */
  const range = raw.split("..");
  if (range.length === 2 && range[0] !== "" && range[1] !== "" && (f.type === "time" || f.type === "number")) {
    return { op: "and", kids: [
      { op: "meta", col: f.col, cmp: ">=", value: coerce(f, range[0]) },
      { op: "meta", col: f.col, cmp: "<=", value: coerce(f, range[1]) },
    ] };
  }
  for (const [lead, cmp] of CMP)
    if (raw.startsWith(lead)) return { op: "meta", col: f.col, cmp, value: coerce(f, raw.slice(lead.length)) };
  if (raw === "" || raw === "*") return { op: "meta", col: f.col, cmp: "present", value: null };
  /* A free-text field is column-scoped MATCH, not equality. Nobody types a whole
     title, so equality on a title is a control that never answers. An
     enumeration is equality, which is what keeps it an indexed seek. */
  if (f.fts) return textAtom(f.fts, raw, tok.quoted, ctx);
  return { op: "meta", col: f.col, cmp: "=", value: coerce(f, raw) };
}

function coerce(f, v) {
  if (f.type === "number") { const n = Number(v); return Number.isFinite(n) ? n : v; }
  if (f.type === "bool") return /^(1|true|yes|y|on)$/i.test(v) ? 1 : /^(0|false|no|n|off)$/i.test(v) ? 0 : v;
  return f.lower ? String(v).toLowerCase() : String(v);
}

function applySort(spec, ctx) {
  let s = String(spec || "");
  let dir = null;
  if (s.startsWith("-")) { dir = "DESC"; s = s.slice(1); }
  const [name, tail] = s.split(":");
  if (tail) dir = /^d/i.test(tail) ? "DESC" : "ASC";
  const key = String(name || "").toLowerCase();
  if (!(key in SORTABLE)) { ctx.warnings.push(`sort: unknown field ${JSON.stringify(name)}`); return; }
  ctx.sort = { field: key, dir: dir || (key === "relevance" ? "ASC" : "DESC") };
}

/* ---------------------------------------------------------------------------
 * FTS5 expression building.
 *
 * A subtree made entirely of text atoms compiles to ONE MATCH rather than a set
 * intersection per word, because that is the case FTS5 is built for and it is
 * the commonest query there is: a bare multi-word string. Set algebra is used
 * only where the tree genuinely mixes text with metadata, which MATCH cannot
 * express because it only knows the text table.
 * ------------------------------------------------------------------------- */

const ftsLiteral = (s) => `"${String(s).replace(/"/g, '""')}"`;

function ftsAtom(a) {
  const lit = ftsLiteral(a.value) + (a.prefix ? "*" : "");
  return a.column ? `{${a.column}} : ${lit}` : lit;
}

/* Returns an FTS5 expression for a subtree that is pure text, or null. */
function ftsExpr(node) {
  if (!node) return null;
  if (node.op === "text") return ftsAtom(node);
  if (node.op === "not") return null; // a bare negation has no positive set to subtract from
  if (node.op === "or") {
    const parts = node.kids.map(ftsExpr);
    if (parts.some((x) => x === null)) return null;
    return "(" + parts.join(" OR ") + ")";
  }
  if (node.op === "and") {
    const pos = [], neg = [];
    for (const k of node.kids) {
      if (k.op === "not") { const e = ftsExpr(k.kid); if (e === null) return null; neg.push(e); }
      else { const e = ftsExpr(k); if (e === null) return null; pos.push(e); }
    }
    if (!pos.length) return null;
    /* FTS5's NOT is binary: `a NOT b` is "a and not b". Parenthesised on both
       sides so the compiled expression does not depend on FTS5's precedence. */
    let e = "(" + pos.join(" AND ") + ")";
    for (const n of neg) e = `(${e} NOT ${n})`;
    return e;
  }
  return null;
}

/* Every positive text atom in the tree, OR'd, is the expression relevance is
   computed from: bm25 should score the words the member asked for, and a
   negation contributes nothing to how well a row matches. */
function rankExpr(atoms) {
  if (!atoms.length) return null;
  const seen = new Set(), parts = [];
  for (const a of atoms) { const e = ftsAtom(a); if (!seen.has(e)) { seen.add(e); parts.push(e); } }
  return parts.length === 1 ? parts[0] : "(" + parts.join(" OR ") + ")";
}

/* ---------------------------------------------------------------------------
 * Set compilation: text arms and metadata arms into one row-id set.
 *
 * SQLite's compound operators are all one precedence and associate left, so a
 * mixed INTERSECT/UNION/EXCEPT chain without parentheses means something other
 * than the tree. A compound operand is therefore always wrapped as
 * `SELECT fid FROM (...)`, which is the parenthesis SQLite does allow.
 * ------------------------------------------------------------------------- */

const ALL = `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL`;

function metaSql(node) {
  const lhs = node.json ? `json_extract(fm_json, ?)` : node.col;
  const args = node.json ? [node.json] : [];
  if (node.cmp === "present")
    return { sql: `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL AND ${lhs} IS NOT NULL AND ${lhs} <> ''`,
             args: node.json ? [node.json, node.json] : [] };
  return { sql: `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL AND ${lhs} ${node.cmp} ?`,
           args: [...args, node.value] };
}

function setSql(node) {
  if (!node) return { sql: ALL, args: [], compound: false };
  /* Whole subtree expressible as text: one MATCH. */
  const fe = ftsExpr(node);
  if (fe !== null)
    return { sql: `SELECT rowid AS fid FROM bundles_fts WHERE bundles_fts MATCH ?`, args: [fe], compound: false };
  if (node.op === "meta") return { ...metaSql(node), compound: false };
  if (node.op === "text")
    return { sql: `SELECT rowid AS fid FROM bundles_fts WHERE bundles_fts MATCH ?`, args: [ftsAtom(node)], compound: false };
  if (node.op === "not") {
    /* Negation with nothing to subtract from is the complement of the corpus. */
    const inner = operand(setSql(node.kid));
    return { sql: `${ALL} EXCEPT ${inner.sql}`, args: inner.args, compound: true };
  }
  if (node.op === "or") {
    const parts = node.kids.map((k) => operand(setSql(k)));
    return { sql: parts.map((p) => p.sql).join(" UNION "), args: parts.flatMap((p) => p.args), compound: true };
  }
  if (node.op === "and") {
    const pos = node.kids.filter((k) => k.op !== "not");
    const neg = node.kids.filter((k) => k.op === "not").map((k) => k.kid);
    const posParts = (pos.length ? pos : [null]).map((k) => operand(setSql(k)));
    let sql = posParts.map((p) => p.sql).join(" INTERSECT ");
    let args = posParts.flatMap((p) => p.args);
    if (neg.length) {
      /* The positive side is a compound in its own right when there was more
         than one arm, so it is wrapped before EXCEPT is applied to it. */
      if (posParts.length > 1) sql = `SELECT fid FROM (${sql})`;
      for (const n of neg) { const o = operand(setSql(n)); sql += ` EXCEPT ${o.sql}`; args = args.concat(o.args); }
    }
    return { sql, args, compound: posParts.length > 1 || neg.length > 0 };
  }
  return { sql: ALL, args: [], compound: false };
}

const operand = (s) => (s.compound ? { sql: `SELECT fid FROM (${s.sql})`, args: s.args } : { sql: s.sql, args: s.args });

/* ---------------------------------------------------------------------------
 * compile: the only entry point. Returns the parsed query plus the four
 * statements the surface runs, every one of which carries the viewer gate.
 * ------------------------------------------------------------------------- */

export const PROVENANCE_COLS = [
  "bundle_id", "object_type", "group_id", "title", "current_state", "prior_state",
  "created", "last_updated", "criticality", "classification", "bundle_sha",
  "schema_id", "produced_mode", "capability_tier", "source_locator",
  "source_authority", "source_retrieved", "source_status", "content_hash",
  "monitor_enabled", "monitor_frequency", "monitor_last_checked",
  "annotations_open", "reeval_flag", "reeval_since", "reeval_source",
];

export const LIMIT_DEFAULT = 50, LIMIT_MAX = 500, IDS_MAX = 50000;

export function compile({ q = "", viewer = null, sort = null, dir = null,
                          limit = LIMIT_DEFAULT, offset = 0,
                          facets = null, implicitOp = "and", snippetChars = 12 } = {}) {
  const ctx = { warnings: [], textAtoms: [], sort: null };
  const ast = parseTokens(tokenize(q), implicitOp === "or" ? "or" : "and", ctx);
  /* An explicit sort parameter outranks a `sort:` token in the query string:
     the parameter is a header the member just clicked, the token is what they
     typed earlier. */
  if (sort && sort in SORTABLE) ctx.sort = { field: sort, dir: /^d/i.test(dir || "") ? "DESC" : dir ? "ASC" : (sort === "relevance" ? "ASC" : "DESC") };

  const gate = viewerPredicate(viewer);
  const rank = rankExpr(ctx.textAtoms);
  const set = setSql(ast);

  /* Whether the query is a bare implicit conjunction of more than one atom,
     which is the only case where offering the OR reading makes sense. */
  const widenable = implicitOp !== "or" && ast?.op === "and"
                 && Array.isArray(ast.kids) && ast.kids.length > 1;

  const lim = Math.max(1, Math.min(LIMIT_MAX, Math.floor(Number(limit) || LIMIT_DEFAULT)));
  const off = Math.max(0, Math.floor(Number(offset) || 0));

  /* One CTE prefix, shared by every statement. `scope` is the query intersected
     with what the viewer may see, so the gate bounds the page, the count, the
     facets, and select-all identically. There is no path to `hits` that does
     not go through `scope`. */
  const cte = (withRanked) => {
    const parts = [
      `gated(fid) AS (SELECT fts_id AS fid FROM bundles WHERE ${gate.sql} AND fts_id IS NOT NULL)`,
      `hits(fid) AS (${set.sql})`,
      `scope(fid) AS (SELECT fid FROM hits INTERSECT SELECT fid FROM gated)`,
    ];
    const args = [...gate.args, ...set.args];
    if (withRanked && rank) {
      parts.push(`ranked(fid, score, snip) AS (SELECT rowid AS fid, bm25(bundles_fts) AS score, `
               + `snippet(bundles_fts, -1, '[', ']', '\u2026', ?) AS snip FROM bundles_fts WHERE bundles_fts MATCH ?)`);
      args.push(Math.max(4, Math.min(64, Math.floor(snippetChars))), rank);
    }
    return { sql: "WITH " + parts.join(",\n     "), args };
  };

  /* ORDER BY. Relevance where relevance exists, last_updated otherwise, and in
     every case the declared id tiebreak, without which paging is wrong rather
     than untidy. NULLs last in both directions so a sparse column does not open
     on rows that have no value. */
  const sortField = ctx.sort?.field || (rank ? "relevance" : "updated");
  const sortDir = ctx.sort?.dir || (sortField === "relevance" ? "ASC" : "DESC");
  let order;
  if (sortField === "relevance" && rank) order = `COALESCE(r.score, 0) ${sortDir}, b.bundle_id ASC`;
  else if (sortField === "relevance") order = `b.last_updated DESC, b.bundle_id ASC`;
  else {
    const col = `b.${SORTABLE[sortField]}`;
    order = `(${col} IS NULL) ASC, ${col} ${sortDir}, b.bundle_id ASC`;
  }

  const cols = PROVENANCE_COLS.map((c) => `b.${c}`).join(", ");
  const joinRanked = rank ? ` LEFT JOIN ranked r ON r.fid = s.fid` : "";
  const scored = rank ? `, r.score AS score, r.snip AS snippet` : `, NULL AS score, NULL AS snippet`;

  const page = () => {
    const c = cte(true);
    return { sql: `${c.sql}\nSELECT ${cols}${scored} FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}\n`
                + `ORDER BY ${order} LIMIT ? OFFSET ?`, args: [...c.args, lim, off] };
  };
  const count = () => {
    const c = cte(false);
    return { sql: `${c.sql}\nSELECT count(*) AS n FROM scope`, args: c.args };
  };
  /* Select-all: every id in the set in the presentation order, which is a
     different request from a page and is treated as one. Ordered identically so
     the set an operator selected is the set they were looking at. */
  const ids = () => {
    const c = cte(true);
    return { sql: `${c.sql}\nSELECT b.bundle_id FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}\n`
                + `ORDER BY ${order} LIMIT ?`, args: [...c.args, IDS_MAX] };
  };
  const facetList = (Array.isArray(facets) && facets.length ? facets : DEFAULT_FACETS)
    .map((f) => String(f).toLowerCase()).filter((f) => f in FIELDS);
  const facet = (name) => {
    const f = FIELDS[name];
    if (!f) return null;
    const c = cte(false);
    return { sql: `${c.sql}\nSELECT b.${f.col} AS value, count(*) AS n FROM scope s JOIN bundles b ON b.fts_id = s.fid\n`
                + `WHERE b.${f.col} IS NOT NULL GROUP BY b.${f.col} ORDER BY n DESC, value ASC LIMIT 64`, args: c.args };
  };

  return {
    ast, warnings: ctx.warnings, gate: gate.scope, viewer: gate.viewer,
    sort: { field: sortField, dir: sortDir }, limit: lim, offset: off,
    match: rank, terms: ctx.textAtoms.map((a) => a.value), widenable,
    facetFields: facetList,
    statements: { page, count, ids, facet },
  };
}
