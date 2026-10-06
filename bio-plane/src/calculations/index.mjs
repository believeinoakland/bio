/* calculations — numbers a finding can rest on (requirements: `build/requirements/calculations.md`; T33-41; K1447,
 * K1448, K1468, K1471, K1491). A calculation (`CALC-`) is computed only by `calc-grammar`'s closed recipe grammar
 * (`bio-calc/1`) over declared canonical tables, money facts, cited figures and counts over the record, with its
 * denominators, grade facts and method, stored under its result key and recomputed at acceptance, at publication and
 * in the checker, never on a read (R8). It holds the tables (R1–R3), the money ingest writer (R14), the recorded draw
 * (R18), fact-based rankings (R17) and the machine's patterns (R22, R23, `./patterns.mjs`), held in the hypothesis
 * layer and shown only after a measured false-alarm rate. A total is a `CALC-` and is never re-entered as a money fact
 * (R13); `compare` yields a labelled computed fact, never a verdict (R5, R27).
 *
 * REACHED as `calculationsOf(host, deps)`: one instance per host, created on the first call with `deps`. At creation
 * it creates its tables, declares them (R29) and registers with the upstream modules `deps` names (R11, R19, R20).
 * `deps`:
 *   record, membership, content, provenance   the modules it uses directly, through their factories on the same host
 *                unless a test passes its own.
 *   money, duties, people, events, progressions, standards, entities, retrieval   the layer-5 modules it reads and
 *                registers with, each an object or a function answering one (reached lazily; absent ones answer
 *                undetermined where a read needs them). They are reached through `deps`, never imported, so this
 *                module reads them only through their public services.
 *   combine      `jurisdictions.combine` (default): the active profiles' view, for fiscal periods, business days and
 *                id spaces.
 *   now          the module's clock, an ISO instant (default: the wall clock).
 *
 * No place is named here (R28): fiscal years, zones, closures and id spaces are profile data. No refusal here has a
 * catalogue row yet (T34 stamps T33's new rows): each answers `{ok: false, reason, detail}`. */

import { canonicalJson, sha256HexSync, isHypothesisId, isMachineIdentity, idPattern } from "../record-grammar/index.mjs";
import { checkRecipe, evaluate as evaluateRecipe, resultKey, METHOD, parseFigure, draw as drawFrame, interval }
  from "../calc-grammar/index.mjs";
import { validAt, fiscalPeriod, isCalendarDate } from "../civil-time/index.mjs";
import { recognise } from "../idspaces.mjs";
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, listenerRefusal, notAnAdmin, MODULE_ORDER } from "../membership/index.mjs";
import { contentOf } from "../content/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { combine as combineProfiles, SPACES } from "../../../jurisdictions/index.mjs";
import { CALCULATIONS_TABLES, migrateCalculations } from "./schema.mjs";
import { TABLE_MAX_BYTES, TABLE_MAX_CELLS, MONEY_ROLES, scanCsv, shaOf, schemaFault, readHeader, rolesFault,
  vintageFault, tableBuilder, asGrammarTable } from "./tables.mjs";
import { PATTERNS, GATE_MAX_RATE, runPattern } from "./patterns.mjs";

export { CALCULATIONS_SCHEMA, CALCULATIONS_TABLES } from "./schema.mjs";
export { ROLES, MONEY_ROLES, KEY_ROLES, ROSTER_ROLES, CROSSWALK_ROLES, TABLE_MAX_BYTES, TABLE_MAX_CELLS, parseCsv,
  canonicalCsv } from "./tables.mjs";
export { PATTERNS, GATE_MAX_RATE } from "./patterns.mjs";

/** R4: the kinds of calculation. */
export const CALCULATION_KINDS = Object.freeze(["count", "total", "share", "ratio", "difference", "comparison", "span",
  "unit_cost", "budget_against_actuals", "ranking", "estimate"]);
/** R8: a calculation's recompute status. */
export const RECOMPUTE_STATES = Object.freeze(["unchecked", "agrees", "differs", "stale"]);
/** R14: the machine's stamp on the money facts the ingest writer records at a member's request (DEC-52). */
export const INGEST_STAMP = "class:daemon";
/** R14 (K1573): the method a machine-written money fact names, money R3's "a figure read by a machine carries that method". */
export const INGEST_METHOD = "table_binding";
/** R11: the cause each listener is told. */
export const INPUT_CHANGED = "calculation_input_changed";
/** R17 (K1471, K1473): words naming a judgment, never a measured quantity a ranking may order by. */
const JUDGMENT_WORDS = /\b(score|importance|important|suspicion|suspicious|significance|significant|severity|severe|risk|centrality|central|most connected|influence|influential|ranking score)\b/i;
/** R17: fields naming a kind of link: a measure over rows of more than one is a measure across mixed kinds. */
const LINK_KIND_FIELDS = Object.freeze(["kind", "link_kind", "relation", "relation_kind"]);
const GRADES = Object.freeze(["A", "B", "C", "D"]);
const TESTIMONY = "D";
const SHA = /^[0-9a-f]{64}$/;
const CALC_RE = idPattern("CALC");
const MONEY_RE = idPattern("MNY");
const READ_LIMIT_MAX = 1000;
const TABLE_CACHE = 8;

const str = (v) => (typeof v === "string" ? v.trim() : "");
const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const json = (v) => (v === undefined ? null : JSON.stringify(v));
const parse = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const sha = (v) => sha256HexSync(canonicalJson(v));
const no = (reason, detail, extra = {}) => ({ ok: false, reason, detail, ...extra });
const weaker = (a, b) => (GRADES.indexOf(a) >= GRADES.indexOf(b) ? a : b);
const isGrade = (g) => GRADES.includes(g);
const randomSeed = () => [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");

/** The member a stamp names: `member:<id>` → `<id>`, bare `admin` → `admin`; a machine or anything else → null. */
export function memberOf(stamp) {
  if (stamp === "admin") return "admin";
  const m = /^member:([A-Za-z0-9._:-]{1,128})$/.exec(typeof stamp === "string" ? stamp : "");
  return m ? m[1] : null;
}
const isMachine = (by) => typeof by === "string" && isMachineIdentity(by);
const stamped = (by) => typeof by === "string" && by.trim() !== "";

/* R4: a period is `{from, to}`, each a date or null, not both null; or a stated period key (such as a fiscal year). */
function periodOf(p) {
  if (typeof p === "string" && p.trim() && p.length <= 100) return { key: p.trim() };
  if (!plain(p)) return null;
  const from = p.from ?? null, to = p.to ?? null;
  if (from === null && to === null) return null;
  for (const d of [from, to]) if (d !== null && !(typeof d === "string" && isCalendarDate(d))) return null;
  if (from && to && to < from) return null;
  return { from, to };
}

/* Every string inside a value, for the hypothesis test (K1467): an input or threshold naming a hypothesis anywhere. */
function stringsIn(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => stringsIn(x, out));
  else if (plain(v)) Object.values(v).forEach((x) => stringsIn(x, out));
  return out;
}

/* The figure a money fact states, as calc-grammar holds one. */
function figureOfFact(f) {
  if (plain(f.amount) && (typeof f.amount.value === "string" || typeof f.amount.low === "string")) {
    const g = { ...f.amount };
    delete g.as_read;
    if (!g.currency && f.currency) g.currency = f.currency;
    return g;
  }
  const raw = typeof f.amount === "string" ? f.amount.trim() : typeof f.amount === "number" && Number.isSafeInteger(f.amount) ? String(f.amount) : null;
  if (raw === null) return null;
  if (f.precision === "range" && plain(f.range)) return { low: String(f.range.low), high: String(f.range.high), sign: f.sign || "+", precision: "range", ...(f.currency && { currency: f.currency }) };
  const neg = raw.startsWith("-");
  const value = neg ? raw.slice(1) : raw;
  if (!/^\d+(?:\.\d+)?$/.test(value)) return null;
  return { value, sign: f.sign === "-" || neg ? "-" : "+", precision: f.precision || "exact", ...(f.currency && { currency: f.currency }) };
}

const partyEntity = (p) => (plain(p) ? (p.entity ?? null) : null);
const partyFund = (p) => (plain(p) ? (p.fund ?? null) : null);

/* The step names that sum their source, and the table each sums. */
function summedTables(recipe) {
  const out = [];
  for (const st of recipe.steps || []) {
    if (!plain(st)) continue;
    if (st.op === "sum") out.push({ step: st.as, from: st.from });
    if (st.op === "share" && st.field !== undefined) out.push({ step: st.as, from: st.whole });
    if (st.op === "group" && plain(st.measure) && st.measure.op === "sum") out.push({ step: st.as, from: st.from });
  }
  return out;
}

/* The inputs each name in a recipe rests on, through its steps. */
function lineage(recipe) {
  const roots = new Map();
  for (const inp of recipe.inputs || []) if (plain(inp)) roots.set(inp.name, new Set([inp.name]));
  const of = (n) => roots.get(n) || new Set();
  for (const st of recipe.steps || []) {
    if (!plain(st) || typeof st.as !== "string") continue;
    const refs = ["from", "a", "b", "numerator", "denominator", "part", "whole", "of", "left", "right"]
      .map((k) => st[k]).filter((x) => typeof x === "string");
    if (plain(st.crosswalk) && typeof st.crosswalk.input === "string") refs.push(st.crosswalk.input);
    roots.set(st.as, new Set(refs.flatMap((r) => [...of(r)])));
  }
  return of;
}

/* The first path at which two results differ, for CALC_RECOMPUTE_DIFFERS (R8). */
function firstDifference(a, b, path = "results") {
  if (canonicalJson(a ?? null) === canonicalJson(b ?? null)) return null;
  if (plain(a) && plain(b)) {
    for (const k of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
      const d = firstDifference(a[k], b[k], `${path}.${k}`);
      if (d) return d;
    }
  }
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    for (let i = 0; i < a.length; i++) { const d = firstDifference(a[i], b[i], `${path}[${i}]`); if (d) return d; }
  }
  return { path, stored: a ?? null, recomputed: b ?? null };
}

export class Calculations {
  #inputListeners = [];     // R11: {module, fn}
  #patternListeners = [];   // R23: {module, fn}
  #tableCache = new Map();  // sha → grammar table, the last few read

  constructor({ storage, record, membership, content, provenance, combine = combineProfiles, now = null,
                clock = null, ...upstream } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.content = content;
    this.provenance = provenance;
    this.combine = combine;
    this.upstream = upstream;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    this.clock = typeof clock === "function" ? clock : () => Date.now();
    migrateCalculations(this.sql);
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  /** An upstream module named in `deps`: the object, or what its function answers; null when absent. */
  dep(name) {
    const d = this.upstream[name];
    try { return typeof d === "function" ? d() || null : d || null; } catch { return null; }
  }

  /* The active profiles' combined view, or null (R28: every local fact is profile data). */
  #view() {
    try {
      const ids = this.record.getSetting("jurisdiction_profiles");
      if (!Array.isArray(ids) || !ids.length) return null;
      const c = this.combine(ids);
      return c && c.ok ? c.view : null;
    } catch { return null; }
  }

  /* May `viewer` see the bundle? A machine stamp sees every held bundle (membership R43); a null bundle is group-wide. */
  #sees(bundleId, viewer) {
    if (bundleId === null || bundleId === undefined || bundleId === "") return stamped(viewer) && (isMachine(viewer) || memberOf(viewer) !== null);
    try { return this.content.sees(bundleId, viewer); } catch { return false; }
  }

  /* ===================================================================== *
   * TABLES (R1–R3)
   * ===================================================================== */

  /* R1: the source's rows: a sheet range's typed cells, a passage's text read as CSV, or a whole document's bytes. */
  async #sourceRows(row) {
    if (row.extent_kind === "sheet-range" || row.extent_kind === "sheet-cell") {
      const got = this.content.cellsAt(row.content_id);
      if (!got || !Array.isArray(got.cells)) return { fault: `the range's cells are not held (${got && got.reason ? got.reason : "unread"})` };
      const byRow = new Map();
      for (const c of got.cells) {
        const m = /^([A-Z]+)(\d+)$/.exec(String((plain(c.source) ? c.source.cell : c.source) ?? "").replace(/\$/g, "").toUpperCase());
        const r = m ? Number(m[2]) : (c.row ?? 0);
        const col = m ? [...m[1]].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) : (c.col ?? 0);
        if (!byRow.has(r)) byRow.set(r, new Map());
        byRow.get(r).set(col, c.value === null || c.value === undefined ? "" : String(c.value));
      }
      const cols = [...new Set([...byRow.values()].flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);
      const rows = [...byRow.keys()].sort((a, b) => a - b).map((r) => cols.map((c) => byRow.get(r).get(c) ?? ""));
      return { rows, bytes: null };
    }
    let text = null;
    try { text = this.content.passageText(row.content_id); } catch { text = null; }
    if (typeof text !== "string" && row.extent_kind === "document") {
      const ev = this.record.evidenceStore();
      try {
        const obj = ev ? await ev.get(row.capture_sha) : null;
        if (obj) text = typeof obj.text === "function" ? await obj.text() : new TextDecoder().decode(await obj.arrayBuffer());
      } catch { text = null; }
    }
    if (typeof text !== "string") return { fault: "the source's text is not held: the passage was not read, or its capture's bytes are not in the evidence store" };
    if (text.length > TABLE_MAX_BYTES * 2) return { tooLarge: true };
    return { text };
  }

  /** R1–R3: `declareTable({source, schema, header, roles?, vintage?, by})`. `source` is a content id (a CSV
   *  capture's document, a passage, a workbook range or a portal export). Async: the bytes go to the evidence store. */
  async declareTable({ source = null, schema = null, header = null, roles = null, vintage = null, by = null } = {}) {
    if (!stamped(by) || isMachine(by))
      return no("MEMBER_ACT_ONLY", "a table is declared by a member; a machine may not declare one (K1468). Nothing was written.");
    const contentId = typeof source === "string" ? source.trim() : plain(source) ? str(source.content) : "";
    if (!contentId) return no("NO_SOURCE", "a table names its captured source: the content id of a CSV, a workbook range or a portal export. Nothing was written.");
    const row = this.content.contentRow(contentId);
    if (!row || !this.#sees(row.bundle_id, by))
      return no("NO_SUCH_CONTENT", "no content row is addressed by this id in this record, or it is not one you may see. Nothing was written.", { content_id: contentId });
    if (row.stale) return no("CONTENT_STALE", "the passage was cited under an earlier reading of its document; cite it again under the current one. Nothing was written.", { content_id: contentId });
    const names = readHeader(header);
    if (!names) return no("NO_HEADER", "a table declares its header: a list of distinct, non-empty column names. Nothing was written.");
    const sf = schemaFault(schema, names);
    if (sf) return no("BAD_SCHEMA", `the schema does not describe the table${sf.field ? ` (field "${sf.field}")` : ""}: ${sf.why}. Nothing was written.`, { field: sf.field });
    const rf = rolesFault(roles, names);
    if (rf) return no("BAD_SCHEMA", `the roles do not fit the table (${rf.field}): ${rf.why}. Nothing was written.`, { field: rf.field });
    const vf = vintageFault(vintage);
    if (vf) return no("BAD_SCHEMA", `the vintage is not one this module holds: ${vf}. Nothing was written.`, { field: "vintage" });
    if (vintage && vintage.supersedes && !this.#one(`SELECT 1 AS x FROM calc_tables WHERE sha=?`, vintage.supersedes))
      return no("BAD_SCHEMA", "the table this vintage supersedes is not held. Nothing was written.", { field: "vintage.supersedes" });
    for (const [col, r] of Object.entries(roles || {})) {
      if (!r.crosswalk) continue;
      const cw = this.#one(`SELECT roles_json FROM calc_tables WHERE sha=?`, r.crosswalk.table);
      const cr = cw ? Object.entries(parse(cw.roles_json) || {}) : [];
      const has = (role, c) => cr.some(([k, v]) => k === c && v.role === role);
      if (!has("crosswalk_from", r.crosswalk.from) || !has("crosswalk_to", r.crosswalk.to))
        return no("BAD_SCHEMA", `the crosswalk "${col}" names is not a declared crosswalk with those two ends. Nothing was written.`, { field: col });
    }
    const src = await this.#sourceRows(row);
    if (src.tooLarge) return no("TABLE_TOO_LARGE", `the source is over the bound of ${TABLE_MAX_BYTES} bytes (20 MiB). Nothing was written.`, { bound: "bytes", max: TABLE_MAX_BYTES });
    if (src.fault) return no("SOURCE_NOT_READ", `${src.fault}. Nothing was written.`, { content_id: contentId });
    const tb = tableBuilder(names, schema.fields);
    if (src.rows) for (const r of src.rows) tb.push(r);
    else {
      const sc = scanCsv(src.text, (r) => tb.push(r));
      src.text = null;
      if (sc.error) return no("SOURCE_NOT_READ", `the source does not read as CSV: ${sc.error}. Nothing was written.`, { content_id: contentId });
    }
    const built = tb.finish();
    if (built.fault) return no("BAD_SCHEMA", `the source does not fit the declared header: ${built.fault.why}. Nothing was written.`, { field: built.fault.field });
    if (built.tooLarge) return no("TABLE_TOO_LARGE", built.tooLarge.bound === "cells"
      ? `the table holds over ${TABLE_MAX_CELLS} cells, the bound. Nothing was written.`
      : `the canonical table is over ${TABLE_MAX_BYTES} bytes (20 MiB), the bound. Nothing was written.`, { bound: built.tooLarge.bound, max: built.tooLarge.max });
    const bytes = built.bytes;
    const tableSha = built.sha;
    const held = this.#one(`SELECT sha FROM calc_tables WHERE sha=?`, tableSha);
    if (held) return { ok: true, already: true, ...this.#tableAnswer(this.#one(`SELECT * FROM calc_tables WHERE sha=?`, tableSha)) };
    const ev = this.record.evidenceStore();
    if (!ev) return no("NO_EVIDENCE_STORE", "this instance has no evidence store bound, so a table's bytes cannot be held. Nothing was written.");
    try { await ev.put(tableSha, bytes); } catch (e) { return no("EVIDENCE_WRITE_FAILED", `the table's bytes could not be stored: ${String(e && e.message || e).slice(0, 200)}. Nothing was written.`); }
    const at = this.now();
    const superseded = vintage && vintage.supersedes ? vintage.supersedes : null;
    const out = this.record.transact(() => {
      this.sql.exec(`INSERT INTO calc_tables (sha, bundle_id, source_json, schema_json, header_json, roles_json, vintage_key,
                       vintage_json, superseded_by, rows, bytes, undetermined_json, undetermined_count, declared_by, declared_at)
                     VALUES (?,?,?,?,?,?,?,?,NULL,?,?,?,?,?,?)`,
        tableSha, row.bundle_id ?? null, json({ content_id: contentId, capture_sha: row.capture_sha, extent_kind: row.extent_kind }),
        json(schema), json(names), roles ? json(roles) : null, vintage ? vintage.key.trim() : null, vintage ? json(vintage) : null,
        built.rows, bytes.byteLength, json(built.undetermined), built.count, by, at);
      if (superseded) {
        this.sql.exec(`UPDATE calc_tables SET superseded_by=? WHERE sha=? AND superseded_by IS NULL`, tableSha, superseded);
        this.#stale(superseded, "table_superseded");
      }
      return { ok: true };
    });
    if (!out.ok) return out;
    return { ok: true, ...this.#tableAnswer(this.#one(`SELECT * FROM calc_tables WHERE sha=?`, tableSha)) };
  }

  #tableAnswer(r) {
    return { sha: r.sha, source: parse(r.source_json), schema: parse(r.schema_json), header: parse(r.header_json),
      roles: parse(r.roles_json), vintage: parse(r.vintage_json), superseded_by: r.superseded_by ?? null, rows: r.rows,
      bytes: r.bytes, undetermined: { count: r.undetermined_count, cells: parse(r.undetermined_json) || [],
        why: "a cell that does not read as its column's declared type is held as written and counted undetermined, never coerced" },
      declared_by: r.declared_by, declared_at: r.declared_at };
  }

  /* A held table's rows as calc-grammar reads them, from the evidence store (cached). */
  async #grammarTable(tableSha) {
    if (this.#tableCache.has(tableSha)) {
      const t = this.#tableCache.get(tableSha);
      this.#tableCache.delete(tableSha); this.#tableCache.set(tableSha, t);
      return t;
    }
    const r = this.#one(`SELECT schema_json, header_json FROM calc_tables WHERE sha=?`, tableSha);
    if (!r) return null;
    const ev = this.record.evidenceStore();
    let text = null;
    try {
      const obj = ev ? await ev.get(tableSha) : null;
      if (obj) text = typeof obj.text === "function" ? await obj.text() : new TextDecoder().decode(await obj.arrayBuffer());
    } catch { text = null; }
    if (typeof text !== "string" || shaOf(text) !== tableSha) return null;
    const fields = parse(r.schema_json).fields;
    const names = fields.map((f) => f.name);
    const rows = [];
    let header = true;
    const sc = scanCsv(text, (row) => {
      if (header) { header = false; return; }
      const o = {};
      for (let k = 0; k < names.length; k++) o[names[k]] = row[k] ?? "";
      rows.push(o);
    });
    text = null;
    if (sc.error) return null;
    const t = { ...asGrammarTable(fields, []), rows };
    this.#tableCache.set(tableSha, t);
    while (this.#tableCache.size > TABLE_CACHE) this.#tableCache.delete(this.#tableCache.keys().next().value);
    return t;
  }

  /** R1: `readTable({sha, viewer, limit?, after?})`: the table's declaration and a page of its rows. A table whose
   *  source the viewer may not see answers as an absent one. */
  async readTable({ sha: tableSha = null, viewer = null, limit = 100, after = 0 } = {}) {
    if (!str(tableSha)) return no("NO_TABLE", "a table is read by its sha256.");
    const r = this.#one(`SELECT * FROM calc_tables WHERE sha=?`, str(tableSha));
    if (!r || !this.#sees(r.bundle_id, viewer)) return { ok: true, found: false, sha: str(tableSha) };
    const lim = Math.max(1, Math.min(READ_LIMIT_MAX, Number.isInteger(Number(limit)) ? Number(limit) : 100));
    const from = Math.max(0, Number.isInteger(Number(after)) ? Number(after) : 0);
    const t = await this.#grammarTable(r.sha);
    const header = parse(r.header_json);
    const src = parse(r.source_json);
    const crow = src ? this.content.contentRow(src.content_id) : null;
    let cg = null;
    try { cg = crow ? this.provenance.captureGrade(crow.capture_sha) : null; } catch { cg = null; }
    const g = crow ? this.#contentGrade(crow) : { grade: null, why: "the table's source is not held" };
    return { ok: true, found: true, ...this.#tableAnswer(r),
      table: { sha: r.sha, fields: parse(r.schema_json).fields, rows: t ? t.rows.map((x) => Object.fromEntries(header.map((h) => [h, String(x[h] ?? "")]))) : null,
        grade_facts: { capture_grade: cg && isGrade(cg.grade) ? cg.grade : null, derivation: crow && isGrade(crow.derivation_cap) ? crow.derivation_cap : null,
          grade: g.grade, why: g.why } },
      page: t ? { after: from, limit: lim, rows: t.rows.slice(from, from + lim).map((x) => header.map((h) => x[h])),
        truncated: from + lim < t.rows.length } : { rows: null, why: "the table's bytes are not held in the evidence store" } };
  }

  /** R3: `tablesAt({key, at, viewer})`: the vintage under `key` valid at `at` (`civil-time.validAt`), or undetermined
   *  with the reason; never the latest by default. */
  tablesAt({ key = null, at = null, viewer = null } = {}) {
    if (!str(key)) return no("NO_KEY", "name the vintage key the tables were declared under.");
    if (!(typeof at === "string" && isCalendarDate(at))) return no("NO_DATE", "name the date, YYYY-MM-DD.");
    const view = this.#view();
    const rows = this.#rows(`SELECT * FROM calc_tables WHERE vintage_key=? ORDER BY sha`, str(key)).filter((r) => this.#sees(r.bundle_id, viewer));
    if (!rows.length) return { ok: true, key: str(key), at, state: "undetermined", table: null, why: `no table is held under the key "${str(key)}"` };
    const judged = rows.map((r) => {
      const v = parse(r.vintage_json);
      let a;
      try { a = validAt({ valid: { from: v.valid.from ?? null, to: v.valid.to ?? null, precision: "day", zone: "UTC" }, basis: v.basis ?? null }, { value: at, precision: "day", zone: "UTC" }, { view }); }
      catch (e) { a = { undetermined: true, why: String(e && e.message || e) }; }
      return { sha: r.sha, valid: v.valid, superseded_by: r.superseded_by ?? null, answer: a };
    });
    const inside = judged.filter((j) => j.answer === "in");
    const open = judged.filter((j) => j.answer !== "in" && j.answer !== "out");
    const listed = judged.map((j) => ({ sha: j.sha, valid: j.valid, superseded_by: j.superseded_by, at: typeof j.answer === "string" ? j.answer : "undetermined", ...(typeof j.answer === "string" ? {} : { why: j.answer.why }) }));
    if (inside.length === 1 && !open.length) return { ok: true, key: str(key), at, state: "determined", table: inside[0].sha, vintages: listed };
    const why = inside.length > 1 ? `${inside.length} vintages are each valid on ${at}, and none is chosen between them`
      : open.length ? `whether ${open.map((j) => j.sha.slice(0, 12)).join(", ")} ${open.length > 1 ? "were" : "was"} valid on ${at} is undetermined: ${open.map((j) => j.answer.why).join("; ")}`
      : `no vintage under "${str(key)}" is valid on ${at}`;
    return { ok: true, key: str(key), at, state: "undetermined", table: null, why, vintages: listed };
  }

  /* ===================================================================== *
   * BINDING INPUTS (R4, R5, R9, R10, R12)
   * ===================================================================== */

  /* The money facts named, read for `viewer`, as a calc-grammar table: one row per fact not withdrawn. */
  async #moneyInput(ids, viewer, missing) {
    const money = this.dep("money");
    const view = this.#view();
    const facts = [], withdrawn = [];
    for (const id of ids) {
      let f = null;
      try { f = money ? await money.readFact({ factId: id, viewer }) : null; } catch { f = null; }
      const fact = f && f.ok !== false && f.found !== false ? (f.fact || f) : null;
      if (!fact || !fact.fact_id && !fact.factId) { missing(id); continue; }
      if (fact.withdrawn) { withdrawn.push({ fact_id: id, why: "withdrawn, so never counted (money R7)" }); continue; }
      facts.push({ ...fact, fact_id: fact.fact_id ?? fact.factId });
    }
    const currencies = [...new Set(facts.map((f) => f.currency).filter(Boolean))];
    const fiscal = (f) => {
      const p = f.period;
      const from = plain(p) ? (typeof p.from === "string" ? p.from.slice(0, 10) : plain(p.from) ? String(p.from.value).slice(0, 10) : null) : null;
      if (!view || !from || !isCalendarDate(from)) return "";
      const body = partyEntity(f.from) || "*";
      try { const r = fiscalPeriod({ date: from, body, view }); return r && r.label ? r.label : ""; } catch { return ""; }
    };
    const periodText = (p) => (plain(p) ? `${plain(p.from) ? p.from.value : p.from ?? ""}/${plain(p.to) ? p.to.value : p.to ?? ""}` : String(p ?? ""));
    const buys = (f) => (plain(f.buys) ? f.buys : null);
    const table = {
      fields: [{ name: "fact_id", type: "string" },
        { name: "amount", type: "number", ...(currencies.length === 1 && { currency: currencies[0] }) },
        { name: "currency", type: "string" }, { name: "kind", type: "string" }, { name: "phase", type: "string" },
        { name: "stage", type: "string" }, { name: "basis", type: "string" }, { name: "period", type: "string" },
        { name: "fund", type: "string" }, { name: "payer", type: "string" }, { name: "payee", type: "string" },
        { name: "buys_quantity", type: "number" }, { name: "buys_unit", type: "string" },
        { name: "fiscal_period", type: "string" }],
      rows: facts.map((f) => ({
        fact_id: f.fact_id, amount: figureOfFact(f) ?? "", currency: f.currency ?? "", kind: f.kind ?? "",
        phase: f.phase ?? "", stage: f.stage ? `${f.phase}/${f.stage}` : (f.phase ?? ""), basis: f.basis ?? "",
        period: periodText(f.period), fund: partyFund(f.from) ?? partyFund(f.to) ?? "", payer: partyEntity(f.from) ?? "",
        payee: partyEntity(f.to) ?? "", buys_quantity: buys(f) && buys(f).quantity != null ? String(buys(f).quantity) : "",
        buys_unit: buys(f) && buys(f).unit ? String(buys(f).unit) : "", fiscal_period: fiscal(f) })),
    };
    const grade = facts.reduce((g, f) => {
      const r = plain(f.grade) ? f.grade.reading : f.grade;
      return isGrade(r) ? (g === null ? r : weaker(g, r)) : g === null ? undefined : g;
    }, null);
    const hash = sha({ facts: facts.map((f) => ({ id: f.fact_id, amount: figureOfFact(f), currency: f.currency ?? null,
      kind: f.kind ?? null, phase: f.phase ?? null, stage: f.stage ?? null, basis: f.basis ?? null, period: f.period ?? null,
      buys: buys(f) })), withdrawn: withdrawn.map((w) => w.fact_id) });
    return { table, facts, withdrawn, hash, grade: grade === undefined ? null : grade, currencies };
  }

  /* A content row's capture grade, capped by its derivation (K1447 (ii)). */
  #contentGrade(row) {
    let g = null, why = "";
    try { g = this.provenance.captureGrade(row.capture_sha); } catch { g = null; }
    const capture = g && isGrade(g.grade) ? g.grade : null;
    const cap = isGrade(row.derivation_cap) ? row.derivation_cap : null;
    if (!capture) return { grade: null, why: `the capture grade is undetermined${g && g.why ? `: ${g.why}` : ""}` };
    const grade = cap ? weaker(capture, cap) : capture;
    why = cap && grade !== capture ? `capture ${capture}, capped by its derivation at ${cap}` : `capture ${capture}${cap ? `, its derivation capped at ${cap}` : ""}`;
    return { grade, why };
  }

  /* R4: each input bound for `viewer`. `{ok: false}` with NO_SUCH_INPUT or HYPOTHESIS_NOT_A_FACT, or
     `{bound, hashes, refs, inputs, apart}`. */
  async #bind(inputs, viewer, { threshold = null } = {}) {
    const KINDS = ["table", "money", "figure", "value", "calculation", "set", "draw"];
    const hyps = [];
    for (const inp of inputs) for (const s of stringsIn(inp)) if (isHypothesisId(s)) hyps.push(s);
    if (threshold) for (const s of stringsIn(threshold)) if (isHypothesisId(s)) hyps.push(s);
    const bound = {}, hashes = {}, refs = [], described = [], apart = { withdrawn: [], out_of_view: [] };
    const names = new Set();
    let refused = null;
    const missing = (name, ref) => { if (!refused) refused = no("NO_SUCH_INPUT", `the input "${name}"${ref ? ` names ${ref}, which` : ""} is not held, or is not one you may see. Nothing was written.`, { input: name, ...(ref ? { ref } : {}) }); };
    for (const inp of inputs) {
      if (refused) break;
      if (!plain(inp) || typeof inp.name !== "string" || !/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(inp.name)) { missing(plain(inp) && typeof inp.name === "string" ? inp.name : "(unnamed)"); break; }
      const kinds = KINDS.filter((k) => inp[k] !== undefined);
      if (kinds.length !== 1 || names.has(inp.name)) { missing(inp.name); break; }
      names.add(inp.name);
      const kind = kinds[0], ref = inp[kind];
      if (stringsIn(ref).some(isHypothesisId)) { described.push({ name: inp.name, kind, ref, hypothesis: true }); continue; }
      if (kind === "table") {
        const r = typeof ref === "string" ? this.#one(`SELECT sha, bundle_id, source_json, roles_json FROM calc_tables WHERE sha=?`, ref) : null;
        if (!r || !this.#sees(r.bundle_id, viewer)) { missing(inp.name, String(ref)); break; }
        const t = await this.#grammarTable(r.sha);
        if (!t) { missing(inp.name, r.sha); break; }
        const src = parse(r.source_json);
        const crow = this.content.contentRow(src.content_id);
        const g = crow ? this.#contentGrade(crow) : { grade: null, why: "the source's content row is not held" };
        bound[inp.name] = t; hashes[inp.name] = r.sha; refs.push({ name: inp.name, kind, ref: r.sha });
        described.push({ name: inp.name, kind, ref: r.sha, grade: g.grade, why: g.why, roles: parse(r.roles_json) });
      } else if (kind === "money") {
        const ids = Array.isArray(ref) ? ref : [ref];
        if (!ids.length || !ids.every((x) => typeof x === "string" && MONEY_RE.test(x))) { missing(inp.name, ids.join(", ")); break; }
        let first = null;
        const m = await this.#moneyInput(ids, viewer, (id) => { first = first || id; });
        if (first) { missing(inp.name, first); break; }
        bound[inp.name] = m.table; hashes[inp.name] = m.hash;
        for (const id of ids) refs.push({ name: inp.name, kind, ref: id });
        apart.withdrawn.push(...m.withdrawn.map((w) => ({ input: inp.name, ...w })));
        described.push({ name: inp.name, kind, ref: ids, facts: m.facts.map((f) => f.fact_id), grade: m.grade,
          why: m.grade ? `the weakest reading grade of its money facts is ${m.grade}` : "no money fact states its reading grade" });
      } else if (kind === "figure") {
        const row = typeof ref === "string" ? this.content.contentRow(ref) : null;
        if (!row || !this.#sees(row.bundle_id, viewer)) { missing(inp.name, String(ref)); break; }
        let text = null;
        if (row.extent_kind === "sheet-cell") { const c = this.content.cellsAt(ref); text = c && Array.isArray(c.cells) && c.cells.length === 1 ? String(c.cells[0].value ?? "") : null; }
        else { try { text = this.content.passageText(ref); } catch { text = null; } }
        const f = typeof text === "string" ? parseFigure(text) : { refused: "FIGURE_INVALID", why: "the passage's text is not held" };
        if (f.refused) { refused = no("FIGURE_NOT_READ", `the input "${inp.name}" cites a passage that does not read as one figure: ${f.why}. Nothing was written.`, { input: inp.name, ref }); break; }
        const fig = { ...f }; delete fig.as_read;
        const g = this.#contentGrade(row);
        bound[inp.name] = fig; hashes[inp.name] = sha({ content: ref, figure: fig }); refs.push({ name: inp.name, kind, ref });
        described.push({ name: inp.name, kind, ref, as_read: f.as_read, grade: g.grade, why: g.why });
      } else if (kind === "value") {
        const f = typeof ref === "string" ? parseFigure(ref) : { refused: "FIGURE_INVALID", why: "a typed figure is text" };
        if (f.refused) { refused = no("FIGURE_NOT_READ", `the input "${inp.name}" is not a figure: ${f.why}. Nothing was written.`, { input: inp.name }); break; }
        const fig = { ...f }; delete fig.as_read;
        bound[inp.name] = fig; hashes[inp.name] = sha({ value: fig });
        described.push({ name: inp.name, kind, ref, as_read: f.as_read, grade: TESTIMONY, unbound: true,
          why: "a figure typed with no cited source is unbound, and an unbound input is testimony (D)" });
      } else if (kind === "calculation") {
        const c = typeof ref === "string" && CALC_RE.test(ref) ? this.#one(`SELECT * FROM calculations WHERE calc_id=?`, ref) : null;
        if (!c || !(await this.#visible(c, viewer))) { missing(inp.name, String(ref)); break; }
        const out = parse(c.results_json);
        const v = out ? out.output : null;
        let b = null;
        if (plain(v) && Array.isArray(v.fields) && Array.isArray(v.rows)) b = v;
        else if (plain(v) && plain(v.value) && v.numerator !== undefined) b = v.value;
        else if (plain(v) && (typeof v.value === "string" || typeof v.low === "string" || v.undetermined)) b = v;
        if (!b) { refused = no("FIGURE_NOT_READ", `the calculation "${ref}" answers no figure or table an input can take. Nothing was written.`, { input: inp.name, ref }); break; }
        const axis = await this.#gradeFacts(c, viewer);
        bound[inp.name] = b; hashes[inp.name] = c.result_key; refs.push({ name: inp.name, kind, ref });
        described.push({ name: inp.name, kind, ref, grade: axis.capture.grade, why: `its own capture axis: ${axis.capture.why}` });
      } else if (kind === "set") {
        const s = typeof ref === "string" ? this.#one(`SELECT * FROM calc_sets WHERE set_sha=?`, ref) : null;
        if (!s || !this.#sees(s.project, viewer)) { missing(inp.name, String(ref)); break; }
        const ids = parse(s.ids_json) || [];
        const seen = ids.filter((id) => this.#sees(id, viewer));
        if (seen.length !== ids.length) apart.out_of_view.push({ input: inp.name, count: ids.length - seen.length, why: "members of the frozen set out of your view at evaluation, counted apart and never as zero" });
        bound[inp.name] = { fields: [{ name: "id", type: "string" }], rows: seen.map((id) => ({ id })) };
        hashes[inp.name] = s.set_sha; refs.push({ name: inp.name, kind, ref: s.set_sha });
        described.push({ name: inp.name, kind, ref: s.set_sha, n: ids.length, grade: null, not_graded: true,
          why: "a frozen set of the record's own ids carries no capture grade; the method that froze it is disclosed" });
      } else {
        const d = typeof ref === "string" ? this.#one(`SELECT * FROM calc_draws WHERE draw_key=?`, ref) : null;
        if (!d || !this.#sees(d.project, viewer)) { missing(inp.name, String(ref)); break; }
        const sample = parse(d.sample_json) || [];
        let table;
        if (d.set_kind === "table") {
          const r = this.#one(`SELECT bundle_id FROM calc_tables WHERE sha=?`, d.set_sha);
          const t = r && this.#sees(r.bundle_id, viewer) ? await this.#grammarTable(d.set_sha) : null;
          if (!t) { missing(inp.name, d.set_sha); break; }
          table = { fields: t.fields, rows: sample.map((k) => t.rows[Number(k)]).filter(Boolean) };
        } else {
          const seen = sample.filter((id) => this.#sees(id, viewer));
          if (seen.length !== sample.length) apart.out_of_view.push({ input: inp.name, count: sample.length - seen.length, why: "drawn members out of your view at evaluation, counted apart" });
          table = { fields: [{ name: "id", type: "string" }], rows: seen.map((id) => ({ id })) };
        }
        bound[inp.name] = table; hashes[inp.name] = d.draw_key; refs.push({ name: inp.name, kind, ref: d.draw_key });
        described.push({ name: inp.name, kind, ref: d.draw_key, draw: { frame_size: d.frame_size, n: d.n, seed: d.seed, method: d.method, set: d.set_sha },
          grade: null, not_graded: true, why: "a recorded draw is graded as the set it was drawn from; the draw itself is a mechanical, reproducible step" });
      }
    }
    if (refused) return refused;
    if (hyps.length) return no("HYPOTHESIS_NOT_A_FACT", `"${hyps[0]}" is a hypothesis: hunches and hypotheses are held in the working inquiry and are never a calculation's input or threshold (K1467). Nothing was written.`, { hypothesis: hyps[0] });
    return { ok: true, bound, hashes, refs, inputs: described, apart };
  }

  /* R6: the threshold, as a figure bound under the name `threshold`, with its standing. */
  #threshold(threshold, period, viewer) {
    if (threshold === null || threshold === undefined) return { ok: true, figure: null };
    if (!plain(threshold)) return no("BAD_THRESHOLD", "a threshold is {value} or {standard, figure?, portion?}. Nothing was written.");
    let fig = null, as_read = null, grade = null, contentRef = null;
    if (typeof threshold.value === "string") {
      const f = parseFigure(threshold.value);
      if (f.refused) return no("BAD_THRESHOLD", `the threshold is not a figure: ${f.why}. Nothing was written.`);
      fig = { ...f }; delete fig.as_read; as_read = f.as_read; grade = TESTIMONY;
    }
    if (typeof threshold.figure === "string") {
      const row = this.content.contentRow(threshold.figure);
      if (!row || !this.#sees(row.bundle_id, viewer)) return no("BAD_THRESHOLD", "the threshold's cited figure is not held, or is not one you may see. Nothing was written.");
      let text = null;
      try { text = this.content.passageText(threshold.figure); } catch { text = null; }
      const f = typeof text === "string" ? parseFigure(text) : { refused: "FIGURE_INVALID", why: "its text is not held" };
      if (f.refused) return no("BAD_THRESHOLD", `the threshold's cited passage is not one figure: ${f.why}. Nothing was written.`);
      fig = { ...f }; delete fig.as_read; as_read = f.as_read; contentRef = threshold.figure; grade = this.#contentGrade(row).grade;
    }
    let standing = null;
    if (threshold.standard !== undefined) {
      const standards = this.dep("standards");
      const dates = period.key ? [] : [period.from, period.to].filter(Boolean);
      if (!standards || typeof standards.inForceAt !== "function" || !dates.length)
        standing = { state: "undetermined", why: !dates.length ? "the calculation's period is a key with no stated dates, so whether the standard was in force for it is undetermined" : "the standards module is not reachable here, so whether the standard was in force is undetermined" };
      else {
        const answers = dates.map((date) => { try { return standards.inForceAt({ standard: threshold.standard, ...(threshold.portion ? { portion: threshold.portion } : {}), date, viewer }); } catch (e) { return { state: "undetermined", why: String(e && e.message || e) }; } });
        const refused = answers.find((a) => a && a.ok === false);
        if (refused) return no(refused.reason || "NO_SUCH_STANDARD", `the standard cited as the threshold is not one held that you may see: ${refused.detail || refused.why || "standards refused it"}. Nothing was written.`, { standard: threshold.standard });
        const notIn = answers.find((a) => a && a.state === "not_in_force");
        if (notIn) return no("THRESHOLD_NOT_IN_FORCE", `the standard cited as the threshold was not in force for the calculation's period: ${notIn.why}. Nothing was written.`, { standard: threshold.standard });
        const open = answers.find((a) => !a || a.state !== "in_force");
        standing = open ? { state: "undetermined", why: open && open.why ? open.why : "the standards module gave no answer" }
          : { state: "in_force", why: answers.map((a) => a.why).filter(Boolean).join("; ") };
      }
    }
    if (!fig) return no("BAD_THRESHOLD", "a threshold states its figure: a value, or a cited figure of the standard. Nothing was written.");
    return { ok: true, figure: fig, held: { ...threshold, as_read, grade, content: contentRef, standing } };
  }

  /* R15: every join runs through an id space or a declared crosswalk. */
  #joinFault(recipe, described) {
    const tableInputs = new Map(described.filter((d) => d.kind === "table").map((d) => [d.name, d]));
    for (const st of Array.isArray(recipe.steps) ? recipe.steps : []) {
      if (!plain(st) || st.op !== "join") continue;
      if (typeof st.space === "string" && SPACES.includes(st.space) && st.crosswalk === undefined) continue;
      if (st.space === undefined && plain(st.crosswalk)) {
        const d = tableInputs.get(st.crosswalk.input);
        const roles = d && d.roles ? Object.entries(d.roles) : [];
        const end = (role, col) => roles.some(([c, r]) => c === col && r.role === role);
        if (d && end("crosswalk_from", st.crosswalk.left) && end("crosswalk_to", st.crosswalk.right)) continue;
      }
      return no("JOIN_NOT_BY_IDENTIFIER", `the join "${st.as}" is not keyed through an id space (${SPACES.join(", ")}) or a captured crosswalk declared as one (its crosswalk_from and crosswalk_to columns); a join on a name alone is refused (K1452). Nothing was written.`, { step: st.as ?? null });
    }
    return null;
  }

  /* R16–R18: a kind's own conditions over the recipe and its inputs, and the recipe it composes when none is given. */
  #kindPlan(kind, recipe, terms, described, bound) {
    if (!CALCULATION_KINDS.includes(kind)) return no("UNKNOWN_KIND", `a calculation's kind is one of ${CALCULATION_KINDS.join(", ")}. Nothing was written.`);
    const money = described.filter((d) => d.kind === "money");
    if (kind === "estimate") {
      if (!described.some((d) => d.kind === "draw"))
        return no("ESTIMATE_WITHOUT_DRAW", "a population estimate is answered only over a recorded draw (a seeded draw over a frozen set), with its exact interval (K1448). Nothing was written.");
    }
    if (kind === "unit_cost") {
      if (money.length !== 1) return no("NO_BUYS", "a unit cost is one money input's amount over what it buys. Nothing was written.");
      const t = bound[money[0].name];
      const units = [...new Set(t.rows.map((r) => r.buys_unit).filter(Boolean))];
      if (!t.rows.length || t.rows.some((r) => !r.buys_quantity || !r.buys_unit) || units.length !== 1)
        return no("NO_BUYS", "a unit cost needs every money fact to state what it buys, a quantity in one stated unit (money's `buys`). Nothing was written.");
      if (!recipe) recipe = { method: METHOD, inputs: [{ name: money[0].name, kind: "table" }],
        steps: [{ op: "sum", from: money[0].name, field: "amount", as: "cost" },
          { op: "sum", from: money[0].name, field: "buys_quantity", as: "quantity" },
          { op: "ratio", numerator: "cost", denominator: "quantity", as: "unit_cost" }], output: "unit_cost" };
      return { ok: true, recipe, unit: `${t.rows[0].currency || "amount"} per ${units[0]}` };
    }
    if (kind === "budget_against_actuals") {
      const a = money.find((d) => d.name === "adopted"), b = money.find((d) => d.name === "actual");
      if (!a || !b) return no("BUDGET_INPUTS", "budget against actuals takes two money inputs, named adopted and actual. Nothing was written.");
      for (const [d, phase] of [[a, "adopted"], [b, "actual"]]) {
        const phases = [...new Set(bound[d.name].rows.map((r) => r.phase))];
        if (phases.length !== 1 || phases[0] !== phase)
          return no("BUDGET_INPUTS", `the input "${d.name}" holds facts of phase ${phases.join(", ") || "none"}; it holds only ${phase} facts (each total within one phase, R12). Nothing was written.`);
      }
      const periods = [...new Set([...bound.adopted.rows, ...bound.actual.rows].map((r) => r.fiscal_period).filter(Boolean))].sort();
      if (!periods.length) return no("BUDGET_INPUTS", "no fiscal period could be read for these facts from the profile's fiscal year. Nothing was written.");
      const bases = { adopted: [...new Set(bound.adopted.rows.map((r) => r.basis))], actual: [...new Set(bound.actual.rows.map((r) => r.basis))] };
      if (!recipe) {
        const steps = [];
        periods.forEach((p, i) => {
          steps.push({ op: "select", from: "adopted", where: [{ field: "fiscal_period", test: "eq", value: p }], as: `adopted_${i}` },
            { op: "sum", from: `adopted_${i}`, field: "amount", as: `adopted_total_${i}` },
            { op: "select", from: "actual", where: [{ field: "fiscal_period", test: "eq", value: p }], as: `actual_${i}` },
            { op: "sum", from: `actual_${i}`, field: "amount", as: `actual_total_${i}` },
            { op: "difference", a: `actual_total_${i}`, b: `adopted_total_${i}`, as: `difference_${i}` },
            { op: "compare", a: `actual_total_${i}`, b: `adopted_total_${i}`, as: `comparison_${i}` });
        });
        recipe = { method: METHOD, inputs: [{ name: "adopted", kind: "table" }, { name: "actual", kind: "table" }], steps,
          output: `comparison_${periods.length - 1}` };
      }
      return { ok: true, recipe, periods, bases };
    }
    if (kind === "ranking") {
      const q = terms ? terms.quantity : undefined;
      if (Array.isArray(q) && q.length > 1)
        return no("SCORE_NOT_A_FACT", "a ranking orders by one stated, measured quantity; several measures composed into one figure are refused (K1471, K1473). Nothing was written.");
      const quantity = Array.isArray(q) ? q[0] : q;
      if (!str(quantity) || !str(terms.scope) || !terms.period)
        return no("RANKING_TERMS", "a ranking names its quantity, its scope and its period in its terms. Nothing was written.");
      if (JUDGMENT_WORDS.test(String(quantity)))
        return no("SCORE_NOT_A_FACT", "the quantity named stands for a judgment, not a measured quantity; a figure standing for importance, suspicion, significance or severity never orders a ranking (K1471, K1473). Nothing was written.");
      if (!recipe || !Array.isArray(recipe.steps)) return null;
      const last = recipe.steps.find((s) => plain(s) && s.as === recipe.output);
      if (!last || last.op !== "sort") return no("NOT_A_RANKING", "a ranking's answer is a sort by its one stated quantity. Nothing was written.");
      return { ok: true, recipe, ranking: { quantity: str(quantity), scope: str(terms.scope), period: terms.period } };
    }
    return recipe ? { ok: true, recipe } : null;
  }

  /* R17: a measure across mixed kinds of link: the table a ranking's grouped measure counts holds rows of more than
     one kind. */
  #mixedKinds(recipe, bound, opts) {
    const sort = recipe.steps.find((s) => plain(s) && s.as === recipe.output);
    const group = recipe.steps.find((s) => plain(s) && s.as === sort.from && s.op === "group");
    if (!group) return null;
    const prefix = { ...recipe, steps: recipe.steps.slice(0, recipe.steps.indexOf(group)), output: group.from };
    let t = bound[group.from];
    if (!t && prefix.steps.length) { const r = evaluateRecipe(prefix, bound, opts); t = r && r.result; }
    if (!t || !Array.isArray(t.rows)) return null;
    for (const f of LINK_KIND_FIELDS) {
      if (!t.fields.some((x) => x.name === f) || group.by.includes(f)) continue;
      const kinds = [...new Set(t.rows.map((r) => r[f]).filter((v) => v !== "" && v != null).map(String))];
      if (kinds.length > 1)
        return no("SCORE_NOT_A_FACT", `the ranking counts rows of ${kinds.length} kinds (${kinds.slice(0, 5).join(", ")}) as one measure; a measure across mixed kinds of link is refused, a count of one kind is a fact (K1471). Nothing was written.`, { field: f });
    }
    return null;
  }

  /* The whole computation of R4–R7, R12, R15–R18, for `create` and `evaluate`: refusals in R4's order, else what
     `create` stores. */
  async #compute({ kind = null, recipe = null, inputs = null, threshold = null, period = null, terms = null, viewer, requireKind = true }) {
    if (!Array.isArray(inputs) || !inputs.length) return no("NO_INPUTS", "a calculation names its inputs: declared tables, money facts, cited figures, other calculations or frozen sets. Nothing was written.");
    const b = await this.#bind(inputs, viewer, { threshold });
    if (!b.ok) return b;
    const th = this.#threshold(threshold, period || {}, viewer);
    if (!th.ok) return th;
    const plan = kind === null && !requireKind ? null : this.#kindPlan(kind, recipe, terms, b.inputs, b.bound);
    if (plan && !plan.ok) return plan;
    const r = plan && plan.recipe ? plan.recipe : recipe;
    if (plain(r)) {
      const jf = this.#joinFault(r, b.inputs);
      if (jf) return jf;
    }
    const checked = checkRecipe(r);
    if (!checked.ok) {
      const e = checked.errors[0];
      return no(e.code, `the recipe is not in calc-grammar's closed grammar (${METHOD}): ${e.why}${e.step !== null ? ` (step ${e.step}${e.field ? `, ${e.field}` : ""})` : ""}. Nothing was written.`, { errors: checked.errors });
    }
    const bound = { ...b.bound };
    const hashes = { ...b.hashes };
    if (th.figure) { bound.threshold = th.figure; hashes.threshold = sha({ threshold: th.held }); }
    const view = this.#view();
    const opts = { resolveId: (space, v) => { const rec = recognise(view, space, String(v)); return rec ? rec.normal : null; }, ...(view && { view }) };
    if (kind === "ranking") { const mk = this.#mixedKinds(r, bound, opts); if (mk) return mk; }
    /* R12: a money input summed whole is summable as money states it, or refused by its name. */
    const money = this.dep("money");
    const interfund = [];
    const roots = lineage(r);
    for (const d of b.inputs.filter((x) => x.kind === "money")) {
      const sums = summedTables(r).filter((s) => roots(s.from).has(d.name));
      if (!sums.length) continue;
      let s = null;
      try { s = money && typeof money.summable === "function" ? await money.summable({ factIds: d.facts }) : null; } catch { s = null; }
      if (s && s.ok === false && sums.some((x) => x.from === d.name))
        return no(s.reason || s.refused || s.code, `${s.detail || s.why || "the money facts cannot be summed"} (money's summation rule). Nothing was written.`, { input: d.name, ...(s.facts ? { facts: s.facts } : {}) });
      if (s && s.ok && Array.isArray(s.interfund) && s.interfund.length) interfund.push({ input: d.name, transfers: s.interfund,
        says: "the total includes transfers between funds, flagged so a total across funds can net them" });
    }
    const e = evaluateRecipe(r, bound, opts);
    if (e.refused) return no(e.refused, `calc-grammar refused the recipe: ${e.why}${e.step ? ` (step ${e.step})` : ""}. Nothing was written.`, { step: e.step ?? null, ...(e.errors ? { errors: e.errors } : {}) });
    const counted = e.trace.filter((t) => t.undetermined.length).map((t) => ({ step: t.step, op: t.op, rows: t.undetermined.length, set_aside: t.undetermined.slice(0, 50) }));
    const steps = Object.fromEntries(e.trace.map((t) => [t.step, t.step === r.output ? e.result : t.output]));
    const results = { output: e.result, steps, undetermined_rows: e.undetermined_rows, counted_apart: counted,
      ...(b.apart.withdrawn.length && { withdrawn_apart: b.apart.withdrawn }),
      ...(b.apart.out_of_view.length && { out_of_view: b.apart.out_of_view }),
      ...(interfund.length && { interfund }),
      says: e.undetermined_rows || b.apart.out_of_view.length || b.apart.withdrawn.length
        ? "values that could not be counted are counted apart and stated here, never as zero"
        : "every value was counted" };
    if (plain(e.result) && e.result.relation !== undefined) results.label = "computed fact";
    if (plan && plan.unit) results.unit = plan.unit;
    if (plan && plan.ranking) results.ranking = { ...plan.ranking, could_not_count: e.undetermined_rows };
    if (plan && plan.periods) {
      results.periods = plan.periods.map((p, i) => {
        const at = (n) => (e.trace.find((t) => t.step === n) || {}).output ?? null;
        return { fiscal_period: p, adopted: at(`adopted_total_${i}`), actual: at(`actual_total_${i}`), difference: at(`difference_${i}`), comparison: at(`comparison_${i}`) };
      });
      results.bases = plan.bases;
      results.bases_says = `adopted on ${plan.bases.adopted.join(", ")} basis; actual on ${plan.bases.actual.join(", ")} basis`;
    }
    if (kind === "estimate") {
      const dr = b.inputs.find((d) => d.kind === "draw").draw;
      const succ = e.result;
      const x = plain(succ) && succ.precision === "exact" && succ.sign === "+" && /^\d+$/.test(succ.value || "") ? Number(succ.value) : null;
      const confidence = terms && terms.confidence !== undefined ? String(terms.confidence) : "0.95";
      const iv = x === null ? { refused: "INTERVAL_INVALID", why: "the recipe's answer is not a whole count of successes" }
        : interval({ frame_size: dr.frame_size, sample_size: dr.n, successes: x, confidence });
      if (iv.refused) return no(iv.refused, `the estimate's interval cannot be computed: ${iv.why}. Nothing was written.`);
      results.interval = { ...iv, confidence, frame_size: dr.frame_size, sample_size: dr.n, successes: x, seed: dr.seed,
        says: "an estimate over a recorded random draw, read as a mechanical draw, not the machine choosing what to look into" };
    }
    const figures = Object.fromEntries(b.inputs.filter((d) => d.kind === "figure" || d.kind === "value").map((d) => [d.name, bound[d.name]]));
    if (Object.keys(figures).length) results.inputs_bound = figures;
    const key = resultKey(r, hashes);
    return { ok: true, recipe: r, results, result_key: key, inputs: b.inputs, refs: b.refs, threshold: th.held ?? null };
  }

  /* ===================================================================== *
   * CALCULATIONS (R4–R11)
   * ===================================================================== */

  /** R4: `create({question, terms, period, inputs, recipe, kind, threshold?, methodNote?, evidences?, project, by})`.
   *  Async (inputs may be read from the evidence store). */
  async create({ question = null, terms = null, period = null, inputs = null, recipe = null, kind = null, threshold = null,
                 methodNote = null, evidences = null, project = null, by = null } = {}) {
    if (!stamped(by)) return no("NO_AUTHOR", "a calculation is recorded under the control plane's stamp. Nothing was written.");
    if (!str(question)) return no("NO_QUESTION", "a calculation states the question it answers. Nothing was written.");
    const p = periodOf(period);
    if (!p) return no("NO_PERIOD", "a calculation states its period: {from, to}, each a date YYYY-MM-DD or null (not both), or a period key. Nothing was written.");
    const c = await this.#compute({ kind, recipe, inputs, threshold, period: p, terms, viewer: by });
    if (!c.ok) return c;
    /* after R4's ordered refusals, the fields it adds: */
    if (project !== null && project !== undefined && (!str(project) || !this.#sees(project, by)))
      return no("NO_SUCH_PROJECT", "no project answers to that id here, or it is not one you may see. Nothing was written.", { project });
    if (evidences !== null && evidences !== undefined && !(Array.isArray(evidences) && evidences.every((x) => plain(x) && str(x.duty) && str(x.occurrence))))
      return no("BAD_EVIDENCES", "evidences name the duty occurrences a calculation measures, each {duty, occurrence}. Nothing was written.");
    const at = this.now();
    const year = at.slice(0, 4);
    let calcId = null;
    const out = this.record.transact(() => {
      const id = this.record.allocId("CALC", year);
      if (!id || !id.id) return id && id.ok === false ? id : no("MINT_FAILED", "no calculation id could be drawn. Nothing was written.");
      calcId = id.id;
      this.sql.exec(`INSERT INTO calculations (calc_id, project, question, terms_json, period_json, kind, recipe_json, inputs_json,
                       threshold_json, method_version, method_note, evidences_json, result_key, results_json, computed_at,
                       recompute_status, recompute_json, accepted_by, accepted_at, created_by, created_at)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'unchecked',NULL,NULL,NULL,?,?)`,
        calcId, project ? str(project) : null, str(question), json(terms), json(p), kind, json(c.recipe), json(inputs),
        c.threshold ? json(c.threshold) : null, METHOD, str(methodNote) || null, evidences ? json(evidences) : null,
        c.result_key, json(c.results), at, by, at);
      for (const ref of c.refs)
        this.sql.exec(`INSERT OR IGNORE INTO calc_inputs (calc_id, project, input_name, input_kind, ref) VALUES (?,?,?,?,?)`,
          calcId, project ? str(project) : null, ref.name, ref.kind, ref.ref);
      if (c.threshold && c.threshold.content)
        this.sql.exec(`INSERT OR IGNORE INTO calc_inputs (calc_id, project, input_name, input_kind, ref) VALUES (?,?,?,?,?)`,
          calcId, project ? str(project) : null, "threshold", "figure", c.threshold.content);
      this.#appendRecompute(calcId, project ? str(project) : null, "created", c.result_key, null, at);
      return { ok: true };
    });
    if (!out.ok) return out;
    return { ok: true, calc_id: calcId, kind, result_key: c.result_key, results: c.results, method_version: METHOD,
      computed_at: at, recompute_status: "unchecked" };
  }

  /** R7: `evaluate({recipe, inputs, viewer, kind?, threshold?, period?, terms?})`: what `create` would store, writing
   *  nothing. */
  async evaluate({ recipe = null, inputs = null, viewer = null, kind = null, threshold = null, period = null, terms = null } = {}) {
    if (!stamped(viewer)) return no("NO_VIEWER", "an evaluation is asked under the control plane's stamp.");
    const p = period === null || period === undefined ? {} : periodOf(period) || {};
    const c = await this.#compute({ kind, recipe, inputs, threshold, period: p, terms, viewer, requireKind: false });
    if (!c.ok) return { ...c, detail: String(c.detail || "").replace(/ Nothing was written\.$/, "") };
    return { ok: true, writes: "nothing", result_key: c.result_key, results: c.results, method_version: METHOD, recipe: c.recipe };
  }

  #appendRecompute(calcId, project, status, key, detail, at) {
    const n = this.#one(`SELECT COALESCE(MAX(seq), 0) AS n FROM calc_recomputes WHERE calc_id=?`, calcId).n;
    this.sql.exec(`INSERT INTO calc_recomputes (calc_id, project, seq, status, result_key, detail_json, at) VALUES (?,?,?,?,?,?,?)`,
      calcId, project, n + 1, status, key, detail ? json(detail) : null, at);
  }

  /* R8: recompute under the machine's view (every input as held now), compared with what is stored. */
  async #recomputeRow(c) {
    const r = await this.#compute({ kind: c.kind, recipe: parse(c.recipe_json), inputs: parse(c.inputs_json),
      threshold: (() => { const t = parse(c.threshold_json); if (!t) return null; const { as_read, grade, content, standing, ...rest } = t; return rest; })(),
      period: parse(c.period_json), terms: parse(c.terms_json), viewer: INGEST_STAMP });
    if (!r.ok) return { agrees: false, results: null, refused: { reason: r.reason, detail: r.detail }, differing: { path: "inputs", why: r.detail } };
    const stored = parse(c.results_json);
    const diff = r.result_key === c.result_key ? firstDifference(stored, r.results) : firstDifference({ result_key: c.result_key, ...stored }, { result_key: r.result_key, ...r.results });
    return { agrees: !diff, results: r.results, result_key: r.result_key, differing: diff };
  }

  /** R8: `recompute({calcId})` → `{agrees, results}`; writes only the recompute status. */
  async recompute({ calcId = null } = {}) {
    const c = str(calcId) ? this.#one(`SELECT * FROM calculations WHERE calc_id=?`, str(calcId)) : null;
    if (!c) return no("NO_SUCH_CALCULATION", "no calculation answers to that id here.");
    const r = await this.#recomputeRow(c);
    const at = this.now();
    const status = r.agrees ? "agrees" : "differs";
    this.record.transact(() => {
      this.sql.exec(`UPDATE calculations SET recompute_status=?, recompute_json=? WHERE calc_id=?`, status,
        json({ at, result_key: r.result_key ?? null, differing: r.differing ?? null }), c.calc_id);
      this.#appendRecompute(c.calc_id, c.project, status, r.result_key ?? null, r.differing ?? null, at);
      return { ok: true };
    });
    return { ok: true, calc_id: c.calc_id, agrees: r.agrees, results: r.results, ...(r.differing ? { differing: r.differing } : {}),
      ...(r.refused ? { refused: r.refused } : {}), recomputed_at: at };
  }

  /** R8: `accept({calcId, by})`: a member's act; recomputes first and is refused CALC_RECOMPUTE_DIFFERS, naming the
   *  differing result, when the recompute differs from what is stored. */
  async accept({ calcId = null, by = null } = {}) {
    if (!stamped(by) || isMachine(by)) return no("MEMBER_ACT_ONLY", "accepting a calculation is a member's act. Nothing was written.");
    const c = str(calcId) ? this.#one(`SELECT * FROM calculations WHERE calc_id=?`, str(calcId)) : null;
    if (!c || !(await this.#visible(c, by))) return no("NO_SUCH_CALCULATION", "no calculation answers to that id here, or it is not one you may see. Nothing was written.");
    if (c.accepted_by) return { ok: true, already: true, calc_id: c.calc_id, accepted_by: c.accepted_by, accepted_at: c.accepted_at };
    const r = await this.recompute({ calcId: c.calc_id });
    if (!r.agrees) return no("CALC_RECOMPUTE_DIFFERS", `the recompute differs from what is stored at ${r.differing ? r.differing.path : "its results"}, so the calculation is not accepted. Nothing was accepted.`, { calc_id: c.calc_id, differing: r.differing ?? null });
    const at = this.now();
    this.record.transact(() => {
      this.sql.exec(`UPDATE calculations SET accepted_by=?, accepted_at=? WHERE calc_id=? AND accepted_by IS NULL`, by, at, c.calc_id);
      this.#appendRecompute(c.calc_id, c.project, "accepted", c.result_key, { by }, at);
      return { ok: true };
    });
    return { ok: true, calc_id: c.calc_id, accepted_by: by, accepted_at: at, recompute_status: "agrees" };
  }

  /* R10: may `viewer` see every input (and the project) of this calculation? */
  async #visible(c, viewer, memo = new Map()) {
    if (memo.has(c.calc_id)) return memo.get(c.calc_id);
    memo.set(c.calc_id, false);
    if (!stamped(viewer)) return false;
    if (c.project && !this.#sees(c.project, viewer)) return false;
    const money = this.dep("money");
    for (const i of this.#rows(`SELECT input_kind, ref FROM calc_inputs WHERE calc_id=?`, c.calc_id)) {
      let ok = false;
      if (i.input_kind === "table") { const t = this.#one(`SELECT bundle_id FROM calc_tables WHERE sha=?`, i.ref); ok = !!t && this.#sees(t.bundle_id, viewer); }
      else if (i.input_kind === "money") {
        try { const f = money ? await money.readFact({ factId: i.ref, viewer }) : null; ok = !!f && f.ok !== false && f.found !== false; } catch { ok = false; }
      } else if (i.input_kind === "figure") { const r = this.content.contentRow(i.ref); ok = !!r && this.#sees(r.bundle_id, viewer); }
      else if (i.input_kind === "calculation") { const o = this.#one(`SELECT * FROM calculations WHERE calc_id=?`, i.ref); ok = !!o && await this.#visible(o, viewer, memo); }
      else if (i.input_kind === "set") { const s = this.#one(`SELECT project, ids_json FROM calc_sets WHERE set_sha=?`, i.ref); ok = !!s && this.#sees(s.project, viewer) && (parse(s.ids_json) || []).every((id) => this.#sees(id, viewer)); }
      else if (i.input_kind === "draw") {
        const d = this.#one(`SELECT project, set_kind, set_sha, sample_json FROM calc_draws WHERE draw_key=?`, i.ref);
        if (d && d.set_kind === "table") { const t = this.#one(`SELECT bundle_id FROM calc_tables WHERE sha=?`, d.set_sha); ok = this.#sees(d.project, viewer) && !!t && this.#sees(t.bundle_id, viewer); }
        else ok = !!d && this.#sees(d.project, viewer) && (parse(d.sample_json) || []).every((id) => this.#sees(id, viewer));
      }
      if (!ok) return false;
    }
    memo.set(c.calc_id, true);
    return true;
  }

  /* R9 (K1447 (ii)): the grade facts, from the inputs as held. */
  async #gradeFacts(c) {
    const inputs = parse(c.inputs_json) || [];
    const per = [];
    const money = this.dep("money");
    for (const inp of inputs) {
      if (!plain(inp)) continue;
      if (inp.value !== undefined) { per.push({ name: inp.name, kind: "value", grade: TESTIMONY, unbound: true, why: "an unbound input is testimony (D)" }); continue; }
      if (inp.table !== undefined) {
        const t = this.#one(`SELECT source_json FROM calc_tables WHERE sha=?`, inp.table);
        const row = t ? this.content.contentRow(parse(t.source_json).content_id) : null;
        const g = row ? this.#contentGrade(row) : { grade: null, why: "the table's source is not held" };
        per.push({ name: inp.name, kind: "table", ref: inp.table, ...g }); continue;
      }
      if (inp.figure !== undefined) {
        const row = this.content.contentRow(inp.figure);
        const g = row ? this.#contentGrade(row) : { grade: null, why: "the cited passage is not held" };
        per.push({ name: inp.name, kind: "figure", ref: inp.figure, ...g }); continue;
      }
      if (inp.money !== undefined) {
        let grade = null;
        for (const id of Array.isArray(inp.money) ? inp.money : [inp.money]) {
          let f = null;
          try { f = money ? await money.readFact({ factId: id, viewer: INGEST_STAMP }) : null; } catch { f = null; }
          const fact = f && f.ok !== false && f.found !== false ? (f.fact || f) : null;
          const r = fact && plain(fact.grade) ? fact.grade.reading : fact ? fact.grade : null;
          grade = isGrade(r) ? (grade ? weaker(grade, r) : r) : grade;
        }
        per.push({ name: inp.name, kind: "money", ref: inp.money, grade, why: grade ? `the weakest reading grade of its money facts is ${grade}` : "no reading grade is stated" }); continue;
      }
      if (inp.calculation !== undefined) {
        const o = this.#one(`SELECT * FROM calculations WHERE calc_id=?`, inp.calculation);
        const g = o ? (await this.#gradeFacts(o)).capture : { grade: null, why: "not held" };
        per.push({ name: inp.name, kind: "calculation", ref: inp.calculation, grade: g.grade, why: `its own capture axis: ${g.why}` }); continue;
      }
      per.push({ name: inp.name, kind: inp.set !== undefined ? "set" : "draw", ref: inp.set ?? inp.draw, grade: null, not_graded: true,
        why: "the record's own ids carry no capture grade; the method that froze or drew them is disclosed" });
    }
    const t = parse(c.threshold_json);
    if (t) per.push({ name: "threshold", kind: "threshold", grade: t.grade ?? (t.content ? null : TESTIMONY), ...(t.content ? {} : { unbound: true }),
      why: t.content ? "the threshold's cited figure" : "a threshold typed with no cited source is testimony (D)" });
    const graded = per.filter((p) => !p.not_graded);
    const open = graded.filter((p) => !isGrade(p.grade));
    const weakest = graded.filter((p) => isGrade(p.grade)).reduce((g, p) => (g ? weaker(g, p.grade) : p.grade), null);
    const capture = open.length ? { grade: null, why: `undetermined: ${open.map((p) => `${p.name}, ${p.why}`).join("; ")}` }
      : weakest ? { grade: weakest, why: `the weakest input capture, ${weakest}; recipe arithmetic is not a weakening step` }
      : { grade: null, why: "no input carries a capture grade" };
    return { inputs: per, capture, method: { version: c.method_version, note: c.method_note ?? null, recipe: parse(c.recipe_json),
      disclosed: true, graded: false, says: "the method is disclosed, not graded" } };
  }

  /** R8–R10: `read({calcId, viewer})`: the stored results, with `computed_at` and the method version, never a
   *  recompute; its grade facts; a calculation with an input the viewer may not see answers exactly as an absent one. */
  async read({ calcId = null, viewer = null } = {}) {
    if (!str(calcId)) return no("NO_CALC", "a calculation is read by its id.");
    const c = this.#one(`SELECT * FROM calculations WHERE calc_id=?`, str(calcId));
    if (!c || !(await this.#visible(c, viewer))) return { ok: true, found: false, calc_id: str(calcId) };
    const results = parse(c.results_json);
    const inputs = (parse(c.inputs_json) || []).map((i) => {
      if (i.table !== undefined) return { name: i.name, kind: "table", sha: i.table };
      if (i.figure !== undefined || i.value !== undefined) {
        const step = (results && results.inputs_bound && results.inputs_bound[i.name]) || null;
        return { name: i.name, kind: "figure", figure: step, ...(i.figure !== undefined ? { content_id: i.figure } : { as_read: i.value }) };
      }
      const kind = ["money", "calculation", "set", "draw"].find((k) => i[k] !== undefined);
      return { name: i.name, kind, [kind]: i[kind] };
    });
    const calculation = { calc_id: c.calc_id, question: c.question, period: parse(c.period_json), recipe: parse(c.recipe_json),
      method_version: c.method_version, result_key: c.result_key, inputs, results: results ? results.steps || {} : {} };
    return { ok: true, found: true, calculation, calc_id: c.calc_id, project: c.project, question: c.question, terms: parse(c.terms_json),
      period: parse(c.period_json), kind: c.kind, inputs: parse(c.inputs_json), threshold: parse(c.threshold_json),
      evidences: parse(c.evidences_json), result_key: c.result_key, results: parse(c.results_json), computed_at: c.computed_at,
      method_version: c.method_version, method_note: c.method_note ?? null, recompute_status: c.recompute_status,
      recompute: parse(c.recompute_json), accepted_by: c.accepted_by ?? null, accepted_at: c.accepted_at ?? null,
      created_by: c.created_by, created_at: c.created_at, grade: await this.#gradeFacts(c),
      says: "results are recomputed at acceptance, at publication and in the checker, never on a read" };
  }

  /* ===================================================================== *
   * CHANGE NOTICES (R11)
   * ===================================================================== */

  /** R11: `onInputChanged(module, fn)`, one registration per module (membership's `listenerRefusal`). */
  onInputChanged(module, fn) {
    const r = listenerRefusal(this.#inputListeners, module, fn);
    if (r) return r;
    this.#inputListeners.push({ module, fn });
    return { ok: true, module };
  }

  #ordered(list) {
    const rank = (m) => { const i = MODULE_ORDER.indexOf(m); return i < 0 ? MODULE_ORDER.length : i; };
    return [...list].sort((a, b) => rank(a.module) - rank(b.module));
  }

  /* R11: every held calculation naming `ref` becomes stale, inside the caller's transaction; each listener is told once
     per calculation after commit. Nothing is recomputed. Never throws. */
  #stale(ref, cause) {
    try {
      const at = this.now();
      const calcs = this.#rows(`SELECT DISTINCT i.calc_id, c.project, c.recompute_status FROM calc_inputs i
                                 JOIN calculations c ON c.calc_id = i.calc_id WHERE i.ref=? ORDER BY i.calc_id`, ref);
      for (const c of calcs) {
        this.sql.exec(`UPDATE calculations SET recompute_status='stale' WHERE calc_id=?`, c.calc_id);
        this.#appendRecompute(c.calc_id, c.project, "stale", null, { input: ref, cause }, at);
      }
      if (!calcs.length) return 0;
      const listeners = this.#ordered(this.#inputListeners);
      this.record.afterCommit(() => {
        for (const c of calcs) for (const l of listeners) {
          try { l.fn({ calcId: c.calc_id, input: ref, cause: INPUT_CHANGED }); } catch { /* one listener's failure stops no other */ }
        }
      });
      return calcs.length;
    } catch { return 0; }
  }

  /** R11: money's change notice (`money.onFactChanged`), registered at start. */
  moneyChanged({ factId = null, change = null } = {}) {
    if (typeof factId === "string" && factId) this.#stale(factId, change ? `money_${change}` : "money_changed");
  }

  /* ===================================================================== *
   * THE MONEY INGEST WRITER (R13, R14)
   * ===================================================================== */

  /** R14: `adoptBinding({table, roles, by})`: a member adopts a table's money roles. `roles` maps each money role to a
   *  column of the table carrying that role, or to `{value}`, one value for every row (kind, phase, stage, basis,
   *  currency, period). The payer and payee are columns declared with a way to resolve (an entity scheme or crosswalk). */
  adoptBinding({ table = null, roles = null, by = null } = {}) {
    if (!stamped(by) || isMachine(by)) return no("MEMBER_ACT_ONLY", "a binding is adopted by a member (K1468). Nothing was written.");
    const t = typeof table === "string" ? this.#one(`SELECT * FROM calc_tables WHERE sha=?`, table) : null;
    if (!t || !this.#sees(t.bundle_id, by)) return no("NO_SUCH_TABLE", "no table answers to that sha here, or it is not one you may see. Nothing was written.");
    if (!plain(roles)) return no("BINDING_ROLES", "a binding maps each money role to a column or to one value. Nothing was written.");
    const declared = parse(t.roles_json) || {};
    const header = parse(t.header_json);
    for (const [role, v] of Object.entries(roles)) {
      if (!MONEY_ROLES.includes(role)) return no("BINDING_ROLES", `"${role}" is not a money role (${MONEY_ROLES.join(", ")}). Nothing was written.`, { role });
      if (typeof v === "string") {
        if (!header.includes(v)) return no("BINDING_ROLES", `the role ${role} names "${v}", not a column of the table. Nothing was written.`, { role });
        if (!declared[v] || declared[v].role !== role) return no("BINDING_ROLES", `the column "${v}" is not declared with the role ${role}; the table's declaration is the member's (R2). Nothing was written.`, { role });
      } else if (!(plain(v) && typeof v.value === "string" && v.value.trim() && ["kind", "phase", "stage", "basis", "currency", "period"].includes(role)))
        return no("BINDING_ROLES", `the role ${role} maps to a column, or (for kind, phase, stage, basis, currency, period) to one value. Nothing was written.`, { role });
    }
    for (const role of ["amount", "payer", "payee", "kind", "phase", "basis", "currency", "period"])
      if (roles[role] === undefined) return no("BINDING_ROLES", `a binding names the role ${role}. Nothing was written.`, { role });
    for (const role of ["amount", "payer", "payee"])
      if (typeof roles[role] !== "string") return no("BINDING_ROLES", `the role ${role} maps to a column. Nothing was written.`, { role });
    const key = sha({ table: t.sha, roles });
    if (this.#one(`SELECT 1 AS x FROM calc_bindings WHERE binding_key=?`, key)) return { ok: true, already: true, binding: key, table: t.sha, roles };
    const at = this.now();
    this.record.transact(() => {
      this.sql.exec(`INSERT INTO calc_bindings (binding_key, table_sha, bundle_id, roles_json, adopted_by, adopted_at) VALUES (?,?,?,?,?,?)`,
        key, t.sha, t.bundle_id ?? null, json(roles), by, at);
      return { ok: true };
    });
    return { ok: true, binding: key, table: t.sha, roles, adopted_by: by, adopted_at: at };
  }

  /** R14: the binding money reads to check a machine-written fact's source (money R4). */
  bindingOf(key) {
    const b = typeof key === "string" ? this.#one(`SELECT * FROM calc_bindings WHERE binding_key=?`, key) : null;
    if (!b) return null;
    const t = this.#one(`SELECT source_json FROM calc_tables WHERE sha=?`, b.table_sha);
    const src = t ? parse(t.source_json) : null;
    return { adopted: true, binding: b.binding_key, table: b.table_sha, roles: parse(b.roles_json), capture_sha: src ? src.capture_sha ?? null : null,
      adopted_by: b.adopted_by, adopted_at: b.adopted_at };
  }

  /* A party value resolved to an entity through its column's identifier: an entity scheme or a captured crosswalk. */
  async #resolveParty(spec, value) {
    if (!value || !String(value).trim()) return { why: "the cell is empty" };
    const entities = this.dep("entities");
    if (spec.scheme) {
      let e = null;
      try { e = entities ? await entities.entityByIdentifier({ scheme: spec.scheme, id: String(value).trim() }) : null; } catch { e = null; }
      if (plain(e) && e.undetermined) return { why: `"${String(value).slice(0, 64)}" through the scheme ${spec.scheme} is undetermined: ${e.why || "more than one entity"}` };
      const id = typeof e === "string" ? e : plain(e) ? (e.entity_id ?? e.entityId ?? null) : null;
      return id ? { entity: id } : { why: `"${String(value).slice(0, 64)}" resolves to no registered entity through the scheme ${spec.scheme}` };
    }
    if (spec.crosswalk) {
      const t = await this.#grammarTable(spec.crosswalk.table);
      const hit = t ? t.rows.filter((r) => String(r[spec.crosswalk.from]).trim() === String(value).trim()).map((r) => String(r[spec.crosswalk.to]).trim()) : [];
      const ids = [...new Set(hit)];
      if (ids.length === 1 && idPattern("ENT").test(ids[0])) return { entity: ids[0] };
      return { why: ids.length > 1 ? `"${String(value).slice(0, 64)}" maps to ${ids.length} entities in the crosswalk` : `"${String(value).slice(0, 64)}" is not in the crosswalk, or maps to no entity id` };
    }
    return { why: "an id space normalises a value but names no entity; declare the column's entity scheme or a captured crosswalk" };
  }

  /** R14: `ingestMoney({binding, rows, reason?, by})`: money facts written through `money.recordFact`, machine-attributed,
   *  only at a member's request, only from an adopted binding, and only for rows whose payer and payee each resolve
   *  through an identifier. `rows` lists row numbers (0-based); every row only with `rows: "all"` and a reason. */
  async ingestMoney({ binding = null, rows = null, reason = null, by = null } = {}) {
    if (!stamped(by) || isMachine(by)) return no("MEMBER_ACT_ONLY", "money facts are read from a table only at a member's request (K1468). Nothing was written.");
    const b = typeof binding === "string" ? this.#one(`SELECT * FROM calc_bindings WHERE binding_key=?`, binding) : null;
    if (!b || !this.#sees(b.bundle_id, by)) return no("NO_SUCH_BINDING", "no adopted binding answers to that key here, or it is not one you may see. Nothing was written.");
    const t = await this.#grammarTable(b.table_sha);
    if (!t) return no("NO_SUCH_TABLE", "the binding's table bytes are not held. Nothing was written.");
    let picked;
    if (rows === "all") {
      if (!str(reason)) return no("NO_REASON", "taking every row of a table is the rare case; state the reason (K1468). Nothing was written.");
      picked = t.rows.map((_, i) => i);
    } else if (Array.isArray(rows) && rows.length && rows.every((n) => Number.isSafeInteger(n) && n >= 0)) picked = [...new Set(rows)].sort((x, y) => x - y);
    else return no("NO_ROWS", "name the rows to read into money facts, by number, or every row with rows: \"all\" and a reason. Nothing was written.");
    const money = this.dep("money");
    if (!money || typeof money.recordFact !== "function") return no("MONEY_NOT_REACHABLE", "the money module is not reachable here. Nothing was written.");
    const roles = parse(b.roles_json);
    const declared = parse(this.#one(`SELECT roles_json FROM calc_tables WHERE sha=?`, b.table_sha).roles_json) || {};
    const val = (row, role) => (typeof roles[role] === "string" ? String(row[roles[role]] ?? "").trim() : roles[role] ? roles[role].value : null);
    const written = [], notWritten = [];
    for (const i of picked) {
      const row = t.rows[i];
      if (!row) { notWritten.push({ row: i, reason: "NO_SUCH_ROW", detail: "the table holds no such row" }); continue; }
      const payer = await this.#resolveParty(declared[roles.payer] || {}, row[roles.payer]);
      if (!payer.entity) { notWritten.push({ row: i, reason: "PAYER_NOT_IDENTIFIED", detail: payer.why }); continue; }
      const payee = await this.#resolveParty(declared[roles.payee] || {}, row[roles.payee]);
      if (!payee.entity) { notWritten.push({ row: i, reason: "PAYEE_NOT_IDENTIFIED", detail: payee.why }); continue; }
      const asRead = String(row[roles.amount] ?? "");
      const f = parseFigure(asRead);
      if (f.refused) { notWritten.push({ row: i, reason: "AMOUNT_NOT_READ", detail: f.why }); continue; }
      const currency = val(row, "currency") || f.currency || null;
      const fact = { amount: f.precision === "range" ? f.low : f.value, as_read: asRead, currency, sign: f.sign, precision: f.precision,
        ...(f.precision === "range" ? { range: { low: f.low, high: f.high } } : {}),
        kind: val(row, "kind"), phase: val(row, "phase"), ...(val(row, "stage") ? { stage: val(row, "stage") } : {}),
        basis: val(row, "basis"), period: val(row, "period"),
        from: { entity: payer.entity, as_written: String(row[roles.payer]), ...(roles.fund ? { fund: val(row, "fund") } : {}),
          ...(roles.account ? { account: val(row, "account") } : {}) },
        to: { entity: payee.entity, as_written: String(row[roles.payee]) },
        source: { table: b.table_sha, row: i, binding: b.binding_key }, method: INGEST_METHOD, by: INGEST_STAMP };
      let r;
      try { r = await money.recordFact(fact); } catch (e) { r = { ok: false, reason: "MONEY_THREW", detail: String(e && e.message || e).slice(0, 200) }; }
      if (r && r.ok !== false && (r.fact_id || r.factId)) written.push({ row: i, fact_id: r.fact_id ?? r.factId });
      else notWritten.push({ row: i, reason: r && r.reason ? r.reason : "NOT_RECORDED", detail: r && r.detail ? r.detail : "money did not record the fact" });
    }
    const at = this.now();
    const key = sha({ binding: b.binding_key, rows: picked, by, at });
    this.record.transact(() => {
      this.sql.exec(`INSERT OR IGNORE INTO calc_ingests (ingest_key, binding_key, bundle_id, rows_json, reason, written_json, not_written_json, asked_by, at)
                     VALUES (?,?,?,?,?,?,?,?,?)`, key, b.binding_key, b.bundle_id ?? null, json(rows === "all" ? "all" : picked),
        str(reason) || null, json(written), json(notWritten), by, at);
      return { ok: true };
    });
    return { ok: true, ingest: key, binding: b.binding_key, written, not_written: notWritten, by: INGEST_STAMP, asked_by: by };
  }

  /* ===================================================================== *
   * DRAWS AND FROZEN SETS (R18, R21)
   * ===================================================================== */

  /** R18: `draw({set, n, seed?, by, project?})` over a frozen set: a table's sha or a frozen record set's sha. */
  draw({ set = null, n = null, seed = null, by = null, project = null } = {}) {
    if (!stamped(by)) return no("NO_AUTHOR", "a draw is recorded under the control plane's stamp. Nothing was written.");
    const ref = typeof set === "string" ? set : plain(set) ? (set.table ?? set.set ?? null) : null;
    if (!SHA.test(ref ?? "")) return no("NO_SET", "a draw is over a frozen set: a table's sha256 or a frozen record set's sha256. Nothing was written.");
    if (project !== null && project !== undefined && (!str(project) || !this.#sees(project, by))) return no("NO_SUCH_PROJECT", "no project answers to that id here, or it is not one you may see. Nothing was written.");
    let kind, frame;
    const t = this.#one(`SELECT sha, bundle_id, rows FROM calc_tables WHERE sha=?`, ref);
    const s = t ? null : this.#one(`SELECT set_sha, project, ids_json FROM calc_sets WHERE set_sha=?`, ref);
    if (t && this.#sees(t.bundle_id, by)) { kind = "table"; frame = Array.from({ length: t.rows }, (_, i) => String(i)); }
    else if (s && this.#sees(s.project, by)) { kind = "set"; frame = parse(s.ids_json) || []; }
    else return no("NO_SUCH_SET", "no frozen set answers to that sha here, or it is not one you may see. Nothing was written.");
    if (!Number.isSafeInteger(n)) return no("BAD_N", "a draw names how many to draw, a whole number. Nothing was written.");
    const usedSeed = seed === null || seed === undefined ? randomSeed() : seed;
    if (typeof usedSeed !== "string") return no("BAD_SEED", "a seed is text. Nothing was written.");
    const d = drawFrame({ frame, n, seed: usedSeed });
    if (d.refused) return no(d.refused, `${d.why}. Nothing was written.`);
    const key = sha({ set: ref, kind, seed: usedSeed, n, method: d.method });
    const held = this.#one(`SELECT * FROM calc_draws WHERE draw_key=?`, key);
    const answer = (r) => ({ ok: true, draw: r.draw_key, set: r.set_sha, set_kind: r.set_kind, seed: r.seed, n: r.n, frame_size: r.frame_size,
      frame_hash: r.frame_hash, method: r.method, sample: parse(r.sample_json), drawn_by: r.drawn_by, drawn_at: r.drawn_at,
      says: "a seeded, recorded random draw over a frozen set: anyone with the set, the seed and SHA-256 reproduces it" });
    if (held) return { ...answer(held), already: true };
    const at = this.now();
    this.record.transact(() => {
      this.sql.exec(`INSERT INTO calc_draws (draw_key, project, set_kind, set_sha, frame_hash, frame_size, n, seed, method, sample_json, drawn_by, drawn_at)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, key, project ? str(project) : null, kind, ref, d.frame_hash, frame.length, n, usedSeed,
        d.method, json(d.sample), by, at);
      return { ok: true };
    });
    return answer(this.#one(`SELECT * FROM calc_draws WHERE draw_key=?`, key));
  }

  /** R18: a recorded draw, reproduced from its set, seed and method: `{reproduced, sample}`. */
  reproduceDraw({ draw: key = null, viewer = null } = {}) {
    const d = typeof key === "string" ? this.#one(`SELECT * FROM calc_draws WHERE draw_key=?`, key) : null;
    if (!d || !this.#sees(d.project, viewer)) return { ok: true, found: false };
    const frame = d.set_kind === "table" ? Array.from({ length: d.frame_size }, (_, i) => String(i))
      : parse((this.#one(`SELECT ids_json FROM calc_sets WHERE set_sha=?`, d.set_sha) || {}).ids_json) || [];
    const again = drawFrame({ frame, n: d.n, seed: d.seed });
    return { ok: true, found: true, draw: d.draw_key, reproduced: !again.refused && canonicalJson(again.sample) === d.sample_json.replace(/\s/g, "")
      && again.frame_hash === d.frame_hash, sample: again.sample ?? null };
  }

  /** R21: `freezeSet({query, by, project?})`: the ids a saved query answers for the asking member (`retrieval`'s
   *  `runSaved`), frozen as a record set with its sha. */
  async freezeSet({ query = null, by = null, project = null } = {}) {
    if (!stamped(by) || isMachine(by)) return no("MEMBER_ACT_ONLY", "a record set is frozen from a member's own saved query. Nothing was written.");
    if (query === null || query === undefined || (typeof query !== "string" && !plain(query))) return no("NO_QUERY", "name the saved query whose answer is frozen. Nothing was written.");
    if (project !== null && project !== undefined && (!str(project) || !this.#sees(project, by))) return no("NO_SUCH_PROJECT", "no project answers to that id here, or it is not one you may see. Nothing was written.");
    const retrieval = this.dep("retrieval");
    if (!retrieval || typeof retrieval.runSaved !== "function") return no("RETRIEVAL_NOT_REACHABLE", "the saved query cannot be run here. Nothing was written.");
    let r;
    try { r = await retrieval.runSaved({ form: query, owner: by, viewer: by, limit: 10000 }); } catch (e) { r = { ok: false, reason: "RETRIEVAL_THREW", detail: String(e && e.message || e).slice(0, 200) }; }
    if (!r || r.ok === false) return { ...(r || no("RETRIEVAL_FAILED", "the saved query answered nothing.")), detail: `${(r && r.detail) || "the saved query was refused"}. Nothing was written.` };
    if (r.truncated) return no("SET_TOO_LARGE", "the saved query answers more ids than one frozen set holds; narrow it, so the count's denominator is whole. Nothing was written.", { total: r.total ?? null });
    const ids = [...new Set((r.ids || []).filter((x) => typeof x === "string"))].sort();
    const setSha = sha(ids);
    const held = this.#one(`SELECT * FROM calc_sets WHERE set_sha=?`, setSha);
    if (held) return { ok: true, already: true, set: setSha, n: held.n, ids };
    const at = this.now();
    this.record.transact(() => {
      this.sql.exec(`INSERT INTO calc_sets (set_sha, project, query_json, ids_json, n, frozen_by, frozen_at) VALUES (?,?,?,?,?,?,?)`,
        setSha, project ? str(project) : null, json(query), json(ids), ids.length, by, at);
      return { ok: true };
    });
    return { ok: true, set: setSha, n: ids.length, ids, frozen_by: by, frozen_at: at, digest: r.digest ?? null,
      says: "a count over this set is reproducible from the set: its ids are frozen with their sha" };
  }

  /* ===================================================================== *
   * REGISTRATIONS IT FILLS (R19, R20)
   * ===================================================================== */

  /** R19: `duties.registerOccurrenceEvidence`'s answer: the accepted calculations naming the occurrence in `evidences`. */
  async occurrenceEvidence({ duty = null, occurrence = null, viewer = null } = {}) {
    const dutyId = plain(duty) ? (duty.duty_id ?? duty.dutyId ?? null) : duty;
    const key = plain(occurrence) ? (occurrence.key ?? occurrence.occurrence_key ?? null) : occurrence;
    if (!str(dutyId) || !str(key)) return [];
    const out = [];
    for (const c of this.#rows(`SELECT * FROM calculations WHERE accepted_by IS NOT NULL AND evidences_json IS NOT NULL ORDER BY calc_id`)) {
      const ev = parse(c.evidences_json) || [];
      if (!ev.some((e) => e.duty === dutyId && e.occurrence === key)) continue;
      if (viewer !== null && !(await this.#visible(c, viewer))) { out.push({ withheld: true, says: "a calculation measuring this occurrence rests on an input you may not see, and is withheld whole" }); continue; }
      const g = await this.#gradeFacts(c);
      out.push({ calc_id: c.calc_id, kind: c.kind, results: parse(c.results_json), grade: g.capture, state: c.recompute_status === "stale" ? "stale" : "current",
        cited_as: "measured evidence (a calculation output)", accepted_by: c.accepted_by, accepted_at: c.accepted_at });
    }
    return out;
  }

  /** R20: `people.registerRosterSource`'s answer for an organisation and a date: the rows of tables with roster roles
   *  whose vintage is valid at that date, by person key, with the table's sha. No row is read into a line. Async. */
  async rosterRows({ organisation = null, at = null, viewer = null } = {}) {
    if (!str(organisation) || !(typeof at === "string" && isCalendarDate(at.slice(0, 10)))) return { rows: [], tables: [], not_read: [], why: "an organisation and a date are needed" };
    const day = at.slice(0, 10);
    const view = this.#view();
    const rows = [], tables = [], notRead = [];
    for (const t of this.#rows(`SELECT * FROM calc_tables WHERE roles_json IS NOT NULL ORDER BY sha`)) {
      const roles = parse(t.roles_json) || {};
      const col = (role) => (Object.entries(roles).find(([, r]) => r.role === role) || [])[0];
      const org = col("roster_organisation"), person = col("roster_person");
      if (!org || !person) continue;
      if (viewer !== null && !this.#sees(t.bundle_id, viewer)) continue;
      const v = parse(t.vintage_json);
      let a = "undetermined";
      if (v) { try { a = validAt({ valid: { from: v.valid.from ?? null, to: v.valid.to ?? null, precision: "day", zone: "UTC" }, basis: v.basis ?? null }, { value: day, precision: "day", zone: "UTC" }, { view }); } catch { a = "undetermined"; } }
      if (a === "out") continue;
      if (a !== "in") { notRead.push({ table: t.sha, why: v ? `whether its vintage was valid on ${day} is undetermined${a && a.why ? `: ${a.why}` : ""}` : "the table states no vintage, so its validity is not stated" }); continue; }
      const g = await this.#grammarTable(t.sha);
      if (!g) { notRead.push({ table: t.sha, why: "the table's bytes are not held" }); continue; }
      tables.push(t.sha);
      const post = col("roster_post"), period = col("roster_period");
      for (let i = 0; i < g.rows.length; i++) {
        const r = g.rows[i];
        const o = await this.#resolveParty(roles[org], r[org]);
        if (!o.entity) { if (String(r[org] ?? "").trim()) notRead.push({ table: t.sha, row: i, why: o.why }); continue; }
        if (o.entity !== str(organisation)) continue;
        rows.push({ person_key: String(r[person] ?? ""), ...(post ? { post: String(r[post] ?? "") } : {}), ...(period ? { period: String(r[period] ?? "") } : {}),
          table: t.sha, row: i });
      }
    }
    return { rows, tables, not_read: notRead, level: "held as a table", says: "roster rows are answered from their tables and never copied into lines" };
  }

  /* ===================================================================== *
   * THE MACHINE'S PATTERNS (R22, R23; ./patterns.mjs)
   * ===================================================================== */

  /** R22: `runPatterns({budgetMs})`: evaluate the shipped patterns within the budget into their own result table,
   *  never onto a person or entity row; resumes from where it stopped. Async. */
  async runPatterns({ budgetMs = 1000 } = {}) {
    const start = this.clock();
    const budget = Number.isFinite(Number(budgetMs)) && Number(budgetMs) > 0 ? Number(budgetMs) : 1000;
    const cur = this.#one(`SELECT next_index FROM calc_pattern_cursor WHERE slot='run'`);
    let i = cur ? cur.next_index : 0;
    let evaluated = 0;
    const deps = { money: this.dep("money"), duties: this.dep("duties"), events: this.dep("events"), progressions: this.dep("progressions"),
      viewer: INGEST_STAMP, now: this.now(), view: this.#view() };
    while (i < PATTERNS.length) {
      if (evaluated > 0 && this.clock() - start >= budget) break;
      const p = PATTERNS[i];
      let out;
      try { out = await runPattern(p, deps); } catch (e) { out = { results: [], denominator: { n: null, why: `the pattern could not be evaluated: ${String(e && e.message || e).slice(0, 200)}` }, evaluated: 0 }; }
      const at = this.now();
      this.record.transact(() => {
        const seq = this.#one(`SELECT COALESCE(MAX(seq), 0) AS n FROM calc_pattern_runs WHERE pattern=? AND version=?`, p.pattern, p.version).n + 1;
        this.sql.exec(`INSERT INTO calc_pattern_runs (pattern, version, seq, evaluated, denominator_json, at) VALUES (?,?,?,?,?,?)`,
          p.pattern, p.version, seq, out.evaluated || 0, json(out.denominator), at);
        for (const r of out.results) {
          const key = sha({ pattern: p.pattern, version: p.version, subject: r.subject ?? null, value: r.value, rests_on: r.rests_on });
          this.sql.exec(`INSERT OR IGNORE INTO calc_pattern_results (result_key, pattern, version, subject, value_json, denominator_json,
                           derivation_json, rests_on_json, told, at) VALUES (?,?,?,?,?,?,?,?,0,?)`,
            key, p.pattern, p.version, r.subject ?? null, json(r.value), json(r.denominator ?? out.denominator), json(r.derivation), json(r.rests_on || []), at);
        }
        i++;
        this.sql.exec(`INSERT INTO calc_pattern_cursor (slot, next_index) VALUES ('run', ?) ON CONFLICT(slot) DO UPDATE SET next_index=?`, i, i);
        return { ok: true };
      });
      evaluated++;
    }
    const remaining = i < PATTERNS.length;
    if (!remaining) this.record.transact(() => { this.sql.exec(`DELETE FROM calc_pattern_cursor WHERE slot='run'`); return { ok: true }; });
    await this.#tellPatternResults();
    return { ok: true, evaluated, remaining };
  }

  #gate(pattern, version) {
    const g = this.#one(`SELECT * FROM calc_pattern_gates WHERE pattern=? AND version=? ORDER BY seq DESC LIMIT 1`, pattern, version);
    if (!g) return { open: false, reason: "this pattern's false-alarm rate has not been measured on a gold set, so its results are not shown (K1504, M-C8)" };
    const rate = Number(g.false_alarm_rate);
    if (!(rate <= GATE_MAX_RATE)) return { open: false, reason: `this pattern's measured false-alarm rate, ${g.false_alarm_rate}, is above ${GATE_MAX_RATE}, so its results are not shown`, gate: g };
    return { open: true, gate: g };
  }

  /** R23: `recordPatternGate({pattern, goldSet, falseAlarmRate, by})`, an administrator's act. */
  async recordPatternGate({ pattern = null, goldSet = null, falseAlarmRate = null, by = null } = {}) {
    const member = memberOf(by);
    if (!member || !this.membership.isAdministrator(member)) return notAnAdmin(by, "Recording a pattern's gate");
    const p = PATTERNS.find((x) => x.pattern === pattern);
    if (!p) return no("NO_SUCH_PATTERN", `no shipped pattern is named "${String(pattern).slice(0, 64)}". Nothing was written.`);
    if (!str(goldSet)) return no("NO_GOLD_SET", "a gate names the gold set its false-alarm rate was measured on. Nothing was written.");
    const rate = typeof falseAlarmRate === "number" ? falseAlarmRate : typeof falseAlarmRate === "string" && /^\d+(\.\d+)?$/.test(falseAlarmRate) ? Number(falseAlarmRate) : NaN;
    if (!(rate >= 0 && rate <= 1)) return no("BAD_RATE", "a false-alarm rate is a number from 0 to 1. Nothing was written.");
    const at = this.now();
    this.record.transact(() => {
      const seq = this.#one(`SELECT COALESCE(MAX(seq), 0) AS n FROM calc_pattern_gates WHERE pattern=? AND version=?`, p.pattern, p.version).n + 1;
      this.sql.exec(`INSERT INTO calc_pattern_gates (pattern, version, seq, gold_set, false_alarm_rate, recorded_by, at) VALUES (?,?,?,?,?,?,?)`,
        p.pattern, p.version, seq, str(goldSet), String(falseAlarmRate), by, at);
      return { ok: true };
    });
    await this.#tellPatternResults();
    const g = this.#gate(p.pattern, p.version);
    return { ok: true, pattern: p.pattern, version: p.version, false_alarm_rate: String(falseAlarmRate), gold_set: str(goldSet), open: g.open,
      ...(g.open ? {} : { reason: g.reason }) };
  }

  /** R23: `switchPattern({pattern, project, on, by})`: a member of the project switches a pattern off (or back on) for it. */
  switchPattern({ pattern = null, project = null, on = null, by = null } = {}) {
    const member = memberOf(by);
    if (!member) return no("MEMBER_ACT_ONLY", "a pattern is switched by a member. Nothing was written.");
    if (!PATTERNS.some((x) => x.pattern === pattern)) return no("NO_SUCH_PATTERN", `no shipped pattern is named "${String(pattern).slice(0, 64)}". Nothing was written.`);
    if (!str(project) || !this.#sees(project, by)) return no("NO_SUCH_PROJECT", "no project answers to that id here, or it is not one you may see. Nothing was written.");
    if (!this.membership.isJoinedParticipant(str(project), member) && !this.membership.isAdministrator(member))
      return no("NOT_A_PARTICIPANT", "only a member of the project switches a pattern for it. Nothing was written.");
    if (typeof on !== "boolean") return no("BAD_SWITCH", "say on: true or on: false. Nothing was written.");
    const at = this.now();
    this.record.transact(() => {
      const seq = this.#one(`SELECT COALESCE(MAX(seq), 0) AS n FROM calc_pattern_switches WHERE pattern=? AND project=?`, pattern, str(project)).n + 1;
      this.sql.exec(`INSERT INTO calc_pattern_switches (pattern, project, seq, on_state, switched_by, at) VALUES (?,?,?,?,?,?)`,
        pattern, str(project), seq, on ? 1 : 0, by, at);
      return { ok: true };
    });
    return { ok: true, pattern, project: str(project), on, switched_by: by, at };
  }

  #switchedOff(pattern, project) {
    if (!project) return false;
    const s = this.#one(`SELECT on_state FROM calc_pattern_switches WHERE pattern=? AND project=? ORDER BY seq DESC LIMIT 1`, pattern, project);
    return !!s && s.on_state === 0;
  }

  /* Whether `viewer` may see every row a result rests on (K1489): a result resting on a hidden row is withheld whole. */
  async #seesRef(ref, viewer) {
    if (typeof ref !== "string" || !ref) return false;
    try {
      if (/^DUT-/.test(ref)) { const d = this.dep("duties"); const r = d ? await d.readDuty({ dutyId: ref, viewer }) : null; return !!r && r.ok !== false && r.found !== false; }
      if (/^EVT-/.test(ref)) { const e = this.dep("events"); const r = e ? await e.readEvent({ eventId: ref, viewer }) : null; return !!r && r.ok !== false && r.found !== false; }
      if (/^MNY-/.test(ref)) { const m = this.dep("money"); const r = m ? await m.readFact({ factId: ref, viewer }) : null; return !!r && r.ok !== false && r.found !== false; }
      if (/^ENT-/.test(ref)) return true;   /* an entity is not gated (K102) */
      if (/^[0-9a-f]{64}$/.test(ref)) { const r = this.content.contentRow(ref); return r ? this.#sees(r.bundle_id, viewer) : false; }
      return this.#sees(ref, viewer);
    } catch { return false; }
  }

  #resultAnswer(r) {
    return { result: r.result_key, pattern: r.pattern, version: r.version, subject: r.subject ?? null, value: parse(r.value_json),
      denominator: parse(r.denominator_json), derivation: parse(r.derivation_json), rests_on: parse(r.rests_on_json),
      layer: "hypothesis", label: "Noticed", by: "the machine", at: r.at,
      says: "noticed by the machine: worth a look, never a fact, never a finding, and never stored on a person or entity" };
  }

  /** R23: `patternResults({pattern?, project?, viewer})`: a pattern's results only once its gate is recorded at a
   *  false-alarm rate of at most 20%; until then `{gated: true, reason}`. Each result is the machine's, `layer:
   *  "hypothesis"`, "Noticed"; one resting on a row the viewer may not see is withheld whole and not counted. */
  async patternResults({ pattern = null, project = null, viewer = null } = {}) {
    if (!stamped(viewer)) return no("NO_VIEWER", "pattern results are read under the control plane's stamp.");
    const list = pattern ? PATTERNS.filter((p) => p.pattern === pattern) : PATTERNS;
    if (!list.length) return no("NO_SUCH_PATTERN", `no shipped pattern is named "${String(pattern).slice(0, 64)}".`);
    const out = [];
    for (const p of list) {
      const head = { pattern: p.pattern, version: p.version, label: p.label, denominator: p.denominator, method: p.method };
      if (this.#switchedOff(p.pattern, str(project) || null)) { out.push({ ...head, switched_off: true, says: "switched off for this project by a member" }); continue; }
      const g = this.#gate(p.pattern, p.version);
      if (!g.open) { out.push({ ...head, gated: true, reason: g.reason }); continue; }
      const results = [];
      for (const r of this.#rows(`SELECT * FROM calc_pattern_results WHERE pattern=? AND version=? ORDER BY result_key`, p.pattern, p.version)) {
        const refs = parse(r.rests_on_json) || [];
        let all = true;
        for (const ref of refs) if (!(await this.#seesRef(ref, viewer))) { all = false; break; }
        if (all) results.push(this.#resultAnswer(r));
      }
      const run = this.#one(`SELECT * FROM calc_pattern_runs WHERE pattern=? AND version=? ORDER BY seq DESC LIMIT 1`, p.pattern, p.version);
      out.push({ ...head, gated: false, false_alarm_rate: g.gate.false_alarm_rate, gold_set: g.gate.gold_set, results, count: results.length,
        last_run: run ? { at: run.at, evaluated: run.evaluated, denominator: parse(run.denominator_json) } : null });
    }
    return { ok: true, patterns: out };
  }

  /** R23: `onPatternResult(module, fn)`: told once per new result whose gate is open (`notice-producers`). */
  onPatternResult(module, fn) {
    const r = listenerRefusal(this.#patternListeners, module, fn);
    if (r) return r;
    this.#patternListeners.push({ module, fn });
    return { ok: true, module };
  }

  async #tellPatternResults() {
    const listeners = this.#ordered(this.#patternListeners);
    for (const p of PATTERNS) {
      if (!this.#gate(p.pattern, p.version).open) continue;
      const fresh = this.#rows(`SELECT * FROM calc_pattern_results WHERE pattern=? AND version=? AND told=0 ORDER BY result_key`, p.pattern, p.version);
      if (!fresh.length) continue;
      this.record.transact(() => { for (const r of fresh) this.sql.exec(`UPDATE calc_pattern_results SET told=1 WHERE result_key=?`, r.result_key); return { ok: true }; });
      for (const r of fresh) for (const l of listeners) { try { await l.fn(this.#resultAnswer(r)); } catch { /* one listener's failure stops no other */ } }
    }
  }
}

/* One instance per host (R29: the tables are declared once). */
const instances = new WeakMap();

/** The module's instance for a host: created on the first call with `deps`, its tables made and declared, and its
 *  registrations made with the upstream modules `deps` names (R11, R19, R20). */
export function calculationsOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const content = d.content || contentOf(host, { record, membership });
    const provenance = d.provenance || content.provenance || provenanceOf(host, { record, membership });
    c = new Calculations({ ...d, storage: d.storage || host.storage, record, membership, content, provenance });
    instances.set(host, c);
    const declared = record.declareTable("calculations", CALCULATIONS_TABLES);
    if (!declared || declared.ok === false) throw new Error(`calculations' tables could not be declared: ${JSON.stringify(declared)}`);
    joinUpstream(c);
  }
  return c;
}

/** R11, R19, R20: the registrations with money, duties and people, made once each when the module is reachable. A
 *  module not yet reachable is joined by a later call (the composition root calls it after building them). */
export function joinUpstream(c) {
  const joined = c.joined || (c.joined = new Set());
  const money = c.dep("money");
  if (money && !joined.has("money") && typeof money.onFactChanged === "function") {
    const r = money.onFactChanged("calculations", (e) => c.moneyChanged(e || {}));
    if (!r || r.ok !== false) joined.add("money");
  }
  const duties = c.dep("duties");
  if (duties && !joined.has("duties") && typeof duties.registerOccurrenceEvidence === "function") {
    const r = duties.registerOccurrenceEvidence("calculations", (q) => c.occurrenceEvidence(q || {}));
    if (!r || r.ok !== false) joined.add("duties");
  }
  const people = c.dep("people");
  if (people && !joined.has("people") && typeof people.registerRosterSource === "function") {
    const r = people.registerRosterSource("calculations", (q) => c.rosterRows(q || {}));
    if (!r || r.ok !== false) joined.add("people");
  }
  return [...joined];
}

/* ===================================================================== *
 * THE OPS MAP (R24)
 * ===================================================================== */

const q = (url, k) => { const v = url && url.searchParams ? url.searchParams.get(k) : null; return v === null ? null : v; };

/** R24: `calculationsOps(calculations, url, body)`: route arms keyed by op name, each a function of no arguments
 *  answering what its service answers. The stamps (`viewer`, `by`) are the control plane's, read from `url`, never
 *  from the body; an act's arguments are read from the body. Which credential reaches each op is `op-declarations`'. */
export function calculationsOps(c, url, body) {
  const b = plain(body) ? body : {};
  const viewer = q(url, "viewer");
  const by = viewer;
  const strip = (o) => { const { by: _b, viewer: _v, author: _a, ...rest } = o; return rest; };
  return {
    tabledeclare: () => c.declareTable({ ...strip(b), by }),
    table: () => c.readTable({ sha: q(url, "sha") ?? b.sha, viewer, limit: q(url, "limit") ?? b.limit ?? 100, after: q(url, "after") ?? b.after ?? 0 }),
    tablesat: () => c.tablesAt({ key: q(url, "key") ?? b.key, at: q(url, "at") ?? b.at, viewer }),
    bindingadopt: () => c.adoptBinding({ ...strip(b), by }),
    moneyingest: () => c.ingestMoney({ ...strip(b), by }),
    calculationcreate: () => c.create({ ...strip(b), by }),
    calculationevaluate: () => c.evaluate({ ...strip(b), viewer }),
    calculationaccept: () => c.accept({ calcId: q(url, "id") ?? b.calcId, by }),
    calculation: () => c.read({ calcId: q(url, "id") ?? b.calcId, viewer }),
    calculationdraw: () => c.draw({ ...strip(b), by }),
    recordset: () => c.freezeSet({ ...strip(b), by }),
    patterns: () => c.patternResults({ pattern: q(url, "pattern") ?? b.pattern ?? null, project: q(url, "project") ?? b.project ?? null, viewer }),
    patterngate: () => c.recordPatternGate({ ...strip(b), by }),
    patternswitch: () => c.switchPattern({ ...strip(b), by }),
  };
}
