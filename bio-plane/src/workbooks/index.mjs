/* workbooks — the second engine of the calculation (requirements: `build/requirements/workbooks.md`). A member's own
 * spreadsheet analysis held in the record: its input cells bound, cell for cell, to captured sources; its formulas
 * recomputed by the instance's pinned engine (`sheet-worker`, through `ctx.recompute`) and compared with the file's
 * cached values, which is agreement between two engines, never accuracy; linted; carrying a method note and,
 * optionally, a second member's check. A recipe calculation can be exported to XLSX. Nothing here is a gate (R16): no
 * act of any module waits on, or is refused for, anything this module holds.
 *
 * REACHED as `workbooksOf(ctx, deps)`: one instance per host (the Durable Object's storage), made on the first call.
 * At creation it creates and declares its tables (R18). `ctx.recompute(captureSha)` is the plane's call to the
 * `SHEET_WORKER` binding; absent, a recompute records "not recomputed here: no engine bound" (R7).
 * `deps`:
 *   record, membership     record-core and membership on the same host unless a test passes its own.
 *   provenance             whether a capture is held, its home, its origin and its capture grade (R1, R12, R13).
 *   content                a cited figure's extent: its sight, its text and its capture (R3, R4, R12, R13).
 *   calculations           `readTable` and `read` (R3, R4, R12, R14), read through one adapter each.
 *   bytesOf(sha)           a capture's bytes (default: the record's evidence store).
 *   now                    the module's clock, an ISO instant (default: the wall clock). */

import { recordOf } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { xlsxEntry, rangeUnitFor, a1Corner } from "../formats-xlsx.mjs";
import { ENGINE_NAME, ENGINE_VERSION } from "../../../sheet-worker/src/contract.mjs";
import { WORKBOOKS_TABLES, migrateWorkbooks } from "./schema.mjs";
import { GRID, cellAt, cellName, splitRange, cellValue, sourceValue, sameValue, closeNumbers } from "./cells.mjs";
import { indexWorkbook, inputCells, lintFindings, LINT_KINDS } from "./lint.mjs";
import { buildExport } from "./export.mjs";
import { XLSX_CONTENT_TYPE } from "./xlsxwrite.mjs";

export { WORKBOOKS_SCHEMA, WORKBOOKS_TABLES } from "./schema.mjs";
export { LINT_KINDS } from "./lint.mjs";
export { COMPUTED_LABEL, FORMULA_LABEL } from "./export.mjs";
export { workbooksOps, WORKBOOKS_OPS } from "./ops.mjs";

export const RECOMPUTE_STATUSES = Object.freeze(["agrees", "differs", "partial", "not recomputed here"]);
export const CHECK_OUTCOMES = Object.freeze(["agrees", "disagrees", "could_not_check"]);
export const NOT_RECOMPUTED = "not recomputed here";
/** R6: how many cells each recorded list keeps; the counts are always whole, and a cut list says how many it left. */
export const LIST_MAX = 2000;
/** R8: the meaning every recompute statement carries. */
export const RECOMPUTE_MEANING = "agreement between the file's engine and the instance's engine, never accuracy";
/** R8: the engine's measured agreement on the corpus, as `sheet-worker`'s job recorded it (T33-18, K1531), for the
 *  engine build it was measured on. Another build answers that it is not measured. */
export const ENGINE_MEASURE = Object.freeze({
  engine: ENGINE_NAME, engine_version: ENGINE_VERSION,
  corpus: "the 111 link-free corpus workbooks with formulas",
  cells: "98.85% of 200,551 cells", workbooks: "81 of 111 workbooks whole (73%)",
  within_bounds: { cells: "97.96% of 82,985 cells", workbooks: "73 of 99 workbooks whole (74%)" },
  recorded_by: "sheet-worker's job, T33 (K1531)",
});
/** R12: the derivation step every formula result carries, and its grade until the engine's measure is ruled enough. */
export const ENGINE_STEP = Object.freeze({ step: "third-party engine", grade: "undetermined" });

const GRADE_RANK = { A: 4, B: 3, C: 2, D: 1 };
const weaker = (a, b) => (!a ? b : !b ? a : (GRADE_RANK[a] || 0) <= (GRADE_RANK[b] || 0) ? a : b);
const SHA_RE = /^[0-9a-f]{64}$/;
const str = (v) => (typeof v === "string" ? v.trim() : "");
const json = (v) => JSON.stringify(v ?? null);
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
const refusal = (reason, detail, extra = {}) => ({ ok: false, reason, detail, ...extra });
const cut = (list) => (list.length > LIST_MAX ? { list: list.slice(0, LIST_MAX), left: list.length - LIST_MAX } : { list, left: 0 });

/* The calculations contract, read through one adapter each (J1): a table `{sha, fields, rows, grade_facts}` or null;
   a calculation `{calc_id, question, period, recipe, method_version, result_key, inputs, results}` or null. */
export function tableFrom(answer) {
  if (!answer || answer.ok === false || answer.found === false) return null;
  const t = answer.table && typeof answer.table === "object" ? answer.table : answer;
  if (!Array.isArray(t.fields) || !Array.isArray(t.rows)) return null;
  return { sha: t.sha ?? null, fields: t.fields, rows: t.rows, grade_facts: t.grade_facts ?? answer.grade_facts ?? null };
}
export function calculationFrom(answer) {
  if (!answer || answer.ok === false || answer.found === false) return null;
  const c = answer.calculation && typeof answer.calculation === "object" ? answer.calculation : answer;
  return c && c.recipe && Array.isArray(c.inputs) ? c : null;
}

const instances = new WeakMap();

/** One instance per host (the Durable Object's storage). */
export function workbooksOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let w = instances.get(storage);
  if (!w) {
    w = new Workbooks({ storage, recompute: ctx && typeof ctx.recompute === "function" ? ctx.recompute : null, ...deps });
    instances.set(storage, w);
  }
  return w;
}

export class Workbooks {
  constructor({ storage, record, membership, provenance, content, calculations = null, recompute = null, bytesOf = null, now } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record || recordOf({ storage });
    this.membership = membership || membershipOf({ storage }, { record: this.record });
    this.provenance = provenance || (content && content.provenance) || null;
    this.content = content || null;
    this.calculations = calculations;
    this.engine = typeof recompute === "function" ? recompute : null;
    this.bytesOf = typeof bytesOf === "function" ? bytesOf : (sha) => this.#evidenceBytes(sha);
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    migrateWorkbooks(this.sql);
    const d = this.record.declareTable("workbooks", WORKBOOKS_TABLES);
    if (d && d.ok === false && d.reason !== "TABLE_DECLARED") throw new Error(`workbooks: ${d.reason}`);
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  async #evidenceBytes(sha) {
    const store = this.record.evidenceStore && this.record.evidenceStore();
    if (!store) return null;
    const obj = await store.get(sha);
    return obj ? new Uint8Array(await obj.arrayBuffer()) : null;
  }

  /* ---- sight (R13) ---- */

  #sees(bundleId, viewer) {
    if (!bundleId || typeof viewer !== "string" || !viewer) return false;
    try { return !!this.membership.inSight(bundleId, viewer); } catch { return false; }
  }

  #home(sha) {
    try { return this.provenance ? this.provenance.homeOf(sha) : null; } catch { return null; }
  }

  #captureSeen(sha, viewer) {
    const h = this.#home(sha);
    return !!h && this.#sees(h.bundleId, viewer);
  }

  async #readTable(sha, viewer) {
    if (!this.calculations || typeof this.calculations.readTable !== "function") return null;
    try { return tableFrom(await this.calculations.readTable({ sha, viewer, limit: 1 })); } catch { return null; }
  }

  #readExtent(id, viewer) {
    if (!this.content || typeof id !== "string" || !id) return null;
    try {
      const r = this.content.contentRead({ id, viewer });
      return r && r.ok ? r : null;
    } catch { return null; }
  }

  async #sourceSeen(input, viewer) {
    if (input && input.table) return !!(await this.#readTable(input.table, viewer));
    if (input && input.extent) return !!this.#readExtent(input.extent, viewer);
    return false;
  }

  /** R13: the workbook row, or null when it is absent or withheld: its project, its capture, or any source it is bound
   *  to, out of the viewer's sight. Every read and act answers both alike. */
  async #workbook(captureSha, project, viewer) {
    const sha = str(captureSha).toLowerCase(), p = str(project);
    if (!SHA_RE.test(sha) || !p) return null;
    const row = this.#one(`SELECT * FROM workbooks WHERE capture_sha=? AND project=?`, sha, p);
    if (!row || !this.#sees(p, viewer) || !this.#captureSeen(sha, viewer)) return null;
    for (const b of this.#rows(`SELECT input FROM workbook_bindings WHERE capture_sha=? AND project=?`, sha, p))
      if (!(await this.#sourceSeen(parse(b.input), viewer))) return null;
    return { ...row, period: parse(row.period), origin: parse(row.origin), facts: parse(row.facts) || {} };
  }

  #absent(captureSha, project) {
    return refusal("NO_SUCH_WORKBOOK", "no workbook is held for this capture in this project", {
      capture_sha: typeof captureSha === "string" ? captureSha : null, project: typeof project === "string" ? project : null });
  }

  #cells(wb) {
    return this.#rows(`SELECT sheet, cell, r, c, type, value, formula, cached FROM workbook_cells
                        WHERE capture_sha=? AND project=? ORDER BY sheet, r, c`, wb.capture_sha, wb.project);
  }

  /* ================================================================ R1 */

  /** R1: hold a workbook. Refusals in order: NO_SHA, CAPTURE_NOT_HELD, NOT_A_WORKBOOK, NO_QUESTION, NO_PERIOD,
   *  NO_PROJECT. A repeat answers `already: true`. */
  async addWorkbook({ captureSha, question, period, project, by } = {}) {
    const sha = str(captureSha).toLowerCase();
    if (!SHA_RE.test(sha)) return refusal("NO_SHA", "a workbook is named by its capture's sha256, 64 hex characters");
    const home = this.#home(sha);
    const notHeld = () => refusal("CAPTURE_NOT_HELD", "no capture with this sha is held in this record");
    if (!home || !this.#sees(home.bundleId, by)) return notHeld();
    let bytes = null;
    try { bytes = await this.bytesOf(sha); } catch { bytes = null; }
    if (!bytes) return notHeld();
    let text, structure;
    try { text = await xlsxEntry.text(bytes); } catch (e) { text = { ok: false, reason: `unreadable: ${e && e.message}` }; }
    const sheets = text && text.ok && Array.isArray(text.sheets) ? text.sheets : null;
    if (!sheets || !sheets.length || sheets.some((s) => !Array.isArray(s.cells))) {
      const marks = (sheets || []).flatMap((s) => s.undetermined || []).concat(text && Array.isArray(text.undetermined) ? text.undetermined : []);
      const why = !text || !text.ok ? text?.reason || "not an xlsx workbook"
        : marks.map((m) => (m && typeof m === "object" ? m.why || JSON.stringify(m) : String(m)))[0] || "no cells were read";
      return refusal("NOT_A_WORKBOOK", "office-readers gives no cells for this capture", { why });
    }
    if (!str(question)) return refusal("NO_QUESTION", "a workbook answers a question; state it");
    if (period === undefined || period === null || (typeof period === "string" && !period.trim())
        || (typeof period === "object" && !Object.values(period).some((v) => typeof v === "string" && v.trim())))
      return refusal("NO_PERIOD", "a workbook covers a period; state it");
    const p = str(project);
    const info = p ? this.record.bundleInfo(p) : null;
    if (!info || info.type !== "project" || !this.#sees(p, by)) return refusal("NO_PROJECT", "name a project this workbook is added to");
    if (this.#one(`SELECT 1 AS x FROM workbooks WHERE capture_sha=? AND project=?`, sha, p))
      return { ok: true, already: true, capture_sha: sha, project: p };
    try { structure = await xlsxEntry.structure(bytes); } catch { structure = null; }
    const items = structure && structure.evidentiary && Array.isArray(structure.evidentiary.items) ? structure.evidentiary.items : [];
    const hidden_rows = {}, hidden_cols = {};
    for (const it of items) {
      if (it.kind === "hidden-rows") hidden_rows[it.sheet] = it.rows;
      if (it.kind === "hidden-cols") hidden_cols[it.sheet] = it.cols;
    }
    const names = {};
    for (const l of structure && Array.isArray(structure.links) ? structure.links : [])
      if (l.partition === "anchor" && l.target && l.target.definedName && typeof l.target.ref === "string") names[l.target.definedName] = l.target.ref;
    let origin = { bundle_id: home.bundleId, route: null, system: null };
    try { origin.route = this.provenance.captureGrade(sha)?.route ?? null; } catch { /* stated as null */ }
    try { origin.system = this.provenance.originOf(home.bundleId)?.system ?? null; } catch { /* stated as null */ }
    const facts = { sheets: sheets.map((s) => ({ name: s.name, hidden: !!s.hidden })), hidden_rows, hidden_cols, names };
    const at = this.now();
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO workbooks (capture_sha, project, question, period, origin, author, at, facts) VALUES (?,?,?,?,?,?,?,?)`,
                    sha, p, str(question), json(period), json(origin), by, at, json(facts));
      for (const s of sheets) for (const c of s.cells) {
        const pos = cellAt(c.source.cell);
        if (!pos) continue;
        this.sql.exec(`INSERT OR IGNORE INTO workbook_cells (capture_sha, project, sheet, cell, r, c, type, value, formula, cached)
                       VALUES (?,?,?,?,?,?,?,?,?,?)`, sha, p, s.name, c.source.cell, pos.row, pos.col, c.type ?? null,
                       c.value ?? null, c.formula ?? null, c.cached ?? null);
      }
      return { ok: true, already: false, capture_sha: sha, project: p, question: str(question), period, origin, author: by, at,
               sheets: facts.sheets };
    });
  }

  /* ================================================================ R3, R4 */

  /* A source's grid: `{rows, cols, at(r, c) → {kind, value, figure?}}` or a refusal's detail. */
  async #source(input, viewer) {
    if (input && typeof input.table === "string") {
      const t = await this.#readTable(input.table, viewer);
      if (!t || !Array.isArray(t.rows)) return { why: "no declared table with this sha is held" };
      const r = splitRange(`x!${input.range ?? ""}`);
      const a = r && a1Corner(r.a), b = r && a1Corner(r.b);
      if (!a || !b) return { why: "a table range is A1 over the table's fields (A the first) and data rows (1 the first)" };
      const r1 = Math.min(a.row, b.row), r2 = Math.max(a.row, b.row), c1 = Math.min(a.col, b.col), c2 = Math.max(a.col, b.col);
      if (r2 > t.rows.length || c2 > t.fields.length) return { why: `the range lies outside the table (${t.rows.length} rows, ${t.fields.length} fields)` };
      return { kind: "table", table: t, rows: r2 - r1 + 1, cols: c2 - c1 + 1,
               at: (i, j) => { const f = t.fields[c1 - 1 + j]; return sourceValue(t.rows[r1 - 1 + i]?.[f.name], f.type); },
               label: (i, j) => `${input.table.slice(0, 12)}…!${cellName(r1 + i, c1 + j)}` };
    }
    if (input && typeof input.extent === "string") {
      const row = this.#readExtent(input.extent, viewer);
      if (!row) return { why: "no content extent with this id is held" };
      let text = null;
      try { text = this.content.passageText(input.extent); } catch { text = null; }
      const v = text === null || text === undefined ? { kind: "empty", value: null } : sourceValue(String(text).trim(), "number");
      return { kind: "extent", row, rows: 1, cols: 1, at: () => v, label: () => input.extent };
    }
    return { why: "an input is {table, range} or {extent}" };
  }

  /** R3: bind a rectangle of input cells to a source. */
  async bind({ captureSha, project, range, input, by } = {}) {
    const wb = await this.#workbook(captureSha, project, by);
    if (!wb) return this.#absent(captureSha, project);
    const r = splitRange(range);
    const sheets = (wb.facts.sheets || []).map((s) => s.name);
    const a = r && a1Corner(r.a), b = r && a1Corner(r.b);
    const unit = a && b ? rangeUnitFor(r.sheet, a, b, sheets, GRID) : null;
    if (!unit || !unit.unit) return refusal("BAD_RANGE", "a binding is one rectangle on one sheet of the workbook, as Sheet!A1:B2",
                                            { why: unit?.why || "not a sheet-qualified A1 range" });
    const sheet = unit.unit.sheet, rect = unit.unit.range;
    const [ra, rb] = rect.split(":");
    const p1 = cellAt(ra), p2 = cellAt(rb ?? ra);
    const formulas = this.#rows(`SELECT cell FROM workbook_cells WHERE capture_sha=? AND project=? AND sheet=? AND formula IS NOT NULL
                                  AND r BETWEEN ? AND ? AND c BETWEEN ? AND ? ORDER BY r, c`,
                                wb.capture_sha, wb.project, sheet, p1.row, p2.row, p1.col, p2.col);
    if (formulas.length) return refusal("RANGE_HOLDS_FORMULAS", "an input is a constant, never a formula cell",
                                        { cells: formulas.map((x) => `${sheet}!${x.cell}`) });
    const src = await this.#source(input, by);
    if (src.why) return refusal("NO_SUCH_INPUT", src.why);
    const rows = p2.row - p1.row + 1, cols = p2.col - p1.col + 1;
    if (rows !== src.rows || cols !== src.cols)
      return refusal("SHAPE_MISMATCH", `the range is ${rows}×${cols} and the input ${src.rows}×${src.cols} (rows × columns)`);
    const stored = input.table ? { table: input.table, range: String(input.range).toUpperCase().replace(/\$/g, "") } : { extent: input.extent };
    const at = this.now();
    const row = this.record.transact(() => {
      this.sql.exec(`INSERT INTO workbook_bindings (capture_sha, project, sheet, range, input, bound_by, bound_at) VALUES (?,?,?,?,?,?,?)`,
                    wb.capture_sha, wb.project, sheet, rect, json(stored), by, at);
      return this.#one(`SELECT * FROM workbook_bindings WHERE binding_id=last_insert_rowid()`);
    });
    return { ok: true, binding: await this.#bindingView(wb, row, by) };
  }

  /** R3: an unbound binding stays, shown with who, when and why. */
  async unbind({ bindingId, reason, by } = {}) {
    const row = Number.isSafeInteger(Number(bindingId)) ? this.#one(`SELECT * FROM workbook_bindings WHERE binding_id=?`, Number(bindingId)) : null;
    const wb = row && await this.#workbook(row.capture_sha, row.project, by);
    if (!wb) return refusal("NO_SUCH_BINDING", "no binding with this id is held");
    if (!str(reason)) return refusal("NO_REASON", "say why the binding is taken back");
    if (row.unbound_at) return { ok: true, already: true, binding: await this.#bindingView(wb, row, by) };
    const at = this.now();
    this.record.transact(() => {
      this.sql.exec(`UPDATE workbook_bindings SET unbound_by=?, unbound_at=?, unbind_reason=? WHERE binding_id=? AND unbound_at IS NULL`,
                    by, at, str(reason), row.binding_id);
    });
    const now = this.#one(`SELECT * FROM workbook_bindings WHERE binding_id=?`, row.binding_id);
    return { ok: true, already: false, binding: await this.#bindingView(wb, now, by) };
  }

  /** R4: a binding compared with its source, cell for cell. */
  async #compare(wb, row, viewer) {
    const [ra, rb] = row.range.split(":");
    const p1 = cellAt(ra), p2 = cellAt(rb ?? ra);
    const src = await this.#source(parse(row.input), viewer);
    if (src.why) return { agrees: false, compared: 0, differing: [], undetermined: src.why };
    const cells = new Map(this.#rows(`SELECT * FROM workbook_cells WHERE capture_sha=? AND project=? AND sheet=? AND r BETWEEN ? AND ?
                                       AND c BETWEEN ? AND ?`, wb.capture_sha, wb.project, row.sheet, p1.row, p2.row, p1.col, p2.col)
      .map((c) => [`${c.r},${c.c}`, c]));
    const differing = [];
    let compared = 0;
    for (let i = 0; i <= p2.row - p1.row; i++) for (let j = 0; j <= p2.col - p1.col; j++) {
      const w = cellValue(cells.get(`${p1.row + i},${p1.col + j}`)), s = src.at(i, j);
      compared++;
      if (!sameValue(w, s)) differing.push({ cell: `${row.sheet}!${cellName(p1.row + i, p1.col + j)}`, workbook_value: w.value, source_value: s.value });
    }
    return { agrees: differing.length === 0, compared, differing };
  }

  async #bindingView(wb, row, viewer) {
    return { binding_id: row.binding_id, range: `${row.sheet}!${row.range}`, input: parse(row.input),
             bound_by: row.bound_by, bound_at: row.bound_at, state: row.unbound_at ? "unbound" : "bound",
             ...(row.unbound_at ? { unbound_by: row.unbound_by, unbound_at: row.unbound_at, unbind_reason: row.unbind_reason } : {}),
             ...(await this.#compare(wb, row, viewer)) };
  }

  async #bindings(wb, viewer) {
    const out = [];
    for (const r of this.#rows(`SELECT * FROM workbook_bindings WHERE capture_sha=? AND project=? ORDER BY binding_id`, wb.capture_sha, wb.project))
      out.push(await this.#bindingView(wb, r, viewer));
    return out;
  }

  /* ================================================================ R5 */

  #inputs(wb, cells) {
    const ix = indexWorkbook(cells, wb.facts);
    const active = this.#rows(`SELECT * FROM workbook_bindings WHERE capture_sha=? AND project=? AND unbound_at IS NULL ORDER BY binding_id`,
                              wb.capture_sha, wb.project).map((b) => {
      const [ra, rb] = b.range.split(":");
      return { id: b.binding_id, sheet: b.sheet, p1: cellAt(ra), p2: cellAt(rb ?? ra) };
    });
    const list = inputCells(ix).map((c) => {
      const b = active.find((x) => x.sheet === c.sheet && c.r >= x.p1.row && c.r <= x.p2.row && c.c >= x.p1.col && c.c <= x.p2.col);
      return { cell: `${c.sheet}!${c.cell}`, type: c.type, value: c.value, bound: !!b, binding_id: b ? b.id : null,
               ...(b ? {} : { grade: "D", basis: "testimony: an unbound input (K1447 (ii))" }) };
    });
    return { ix, list };
  }

  /** R5: every input cell, bound (naming its binding) or unbound (testimony, grade D). */
  async inputsOf({ captureSha, project, viewer } = {}) {
    const wb = await this.#workbook(captureSha, project, viewer);
    if (!wb) return this.#absent(captureSha, project);
    const { list } = this.#inputs(wb, this.#cells(wb));
    return { ok: true, capture_sha: wb.capture_sha, project: wb.project, inputs: list,
             counts: { inputs: list.length, bound: list.filter((x) => x.bound).length, unbound: list.filter((x) => !x.bound).length } };
  }

  /* ================================================================ R6–R8 */

  /** R6, R7: recompute through the instance's engine and record the comparison. Results are recomputed only here. */
  async recompute({ captureSha, project, by } = {}) {
    const wb = await this.#workbook(captureSha, project, by);
    if (!wb) return this.#absent(captureSha, project);
    let answer = null, why = null, reason = null;
    if (!this.engine) { reason = "NO_ENGINE"; why = "no engine bound"; }
    else {
      try { answer = await this.engine(wb.capture_sha); } catch (e) { answer = null; why = `no answer: ${e && e.message ? e.message : e}`; }
      if (!answer || typeof answer !== "object") { reason = "NO_ANSWER"; why = why || "no answer"; answer = null; }
      else if (answer.ok !== true) { reason = typeof answer.reason === "string" ? answer.reason : "NO_ANSWER"; why = typeof answer.why === "string" ? answer.why : reason; answer = null; }
      else if (!Array.isArray(answer.cells)) { reason = "NO_ANSWER"; why = "the engine's answer holds no cells"; answer = null; }
    }
    const at = this.now();
    let rec;
    if (!answer) rec = { status: NOT_RECOMPUTED, engine: null, engine_version: null, reason, why,
                         body: { counts: { compared: 0, agreed: 0, differed: 0, not_recomputed: 0, volatile: 0, cache_stale: 0 },
                                 differing: [], not_recomputed: [], volatile: [], cache_stale: [] } };
    else rec = { ...pair(answer, this.#cells(wb)), engine: answer.engine ?? null, engine_version: answer.engine_version ?? null, reason: null, why: null };
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO workbook_recomputes (capture_sha, project, status, engine, engine_version, at, by, reason, why, answer)
                     VALUES (?,?,?,?,?,?,?,?,?,?)`, wb.capture_sha, wb.project, rec.status, rec.engine, rec.engine_version, at, by,
                    rec.reason, rec.why, json(rec.body));
      const row = this.#one(`SELECT * FROM workbook_recomputes WHERE recompute_id=last_insert_rowid()`);
      return { ok: true, recompute: recomputeView(row) };
    });
  }

  #latestRecompute(wb) {
    const row = this.#one(`SELECT * FROM workbook_recomputes WHERE capture_sha=? AND project=? ORDER BY recompute_id DESC LIMIT 1`,
                          wb.capture_sha, wb.project);
    return row ? recomputeView(row) : null;
  }

  /* ================================================================ R9 */

  #lint(wb, cells, inputs) {
    const ix = inputs ? inputs.ix : indexWorkbook(cells, wb.facts);
    const inputList = inputCells(ix);
    const notes = this.#rows(`SELECT kind, cell, note, by, at FROM workbook_lint_notes WHERE capture_sha=? AND project=? ORDER BY note_id`,
                             wb.capture_sha, wb.project);
    return lintFindings(ix, inputList).map((f) => ({ ...f, notes: notes.filter((n) => n.kind === f.kind && n.cell === f.cell)
      .map(({ note, by, at }) => ({ note, by, at })) }));
  }

  /** R9: the lint findings, each with the notes members hold against it. Changes nothing, blocks nothing. */
  async lint({ captureSha, project, viewer } = {}) {
    const wb = await this.#workbook(captureSha, project, viewer);
    if (!wb) return this.#absent(captureSha, project);
    const findings = this.#lint(wb, this.#cells(wb));
    return { ok: true, capture_sha: wb.capture_sha, project: wb.project, findings,
             counts: Object.fromEntries(LINT_KINDS.map((k) => [k, findings.filter((f) => f.kind === k).length])) };
  }

  /** R9: a member's note against a finding (`{kind, cell}`), kept and never erased. */
  async explainLint({ captureSha, project, finding, note, by } = {}) {
    const wb = await this.#workbook(captureSha, project, by);
    if (!wb) return this.#absent(captureSha, project);
    if (!str(note)) return refusal("NO_NOTE", "a note says what the member found; write it");
    const f = finding && typeof finding === "object" ? finding : {};
    const held = this.#lint(wb, this.#cells(wb)).find((x) => x.kind === f.kind && x.cell === f.cell);
    if (!held) return refusal("NO_SUCH_FINDING", "lint gives no such finding for this workbook", { kind: f.kind ?? null, cell: f.cell ?? null });
    const at = this.now();
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO workbook_lint_notes (capture_sha, project, kind, cell, note, by, at) VALUES (?,?,?,?,?,?,?)`,
                    wb.capture_sha, wb.project, held.kind, held.cell, str(note), by, at);
      return { ok: true, finding: { kind: held.kind, cell: held.cell, detail: held.detail }, note: { note: str(note), by, at } };
    });
  }

  /* ================================================================ R10, R11 */

  /** R10: a method note, every field required; the latest stands and every note is kept. */
  async recordMethodNote({ captureSha, project, purpose, sources, steps, limitations, by } = {}) {
    const wb = await this.#workbook(captureSha, project, by);
    if (!wb) return this.#absent(captureSha, project);
    const srcs = Array.isArray(sources) ? sources.map(str).filter(Boolean) : str(sources) ? [str(sources)] : [];
    if (!str(purpose)) return refusal("NO_PURPOSE", "say what the workbook is for");
    if (!srcs.length) return refusal("NO_SOURCES", "name the sources its inputs come from");
    if (!str(steps)) return refusal("NO_STEPS", "describe the steps the workbook takes");
    if (!str(limitations)) return refusal("NO_LIMITATIONS", "state the limitations of the data and the method");
    const at = this.now();
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO workbook_method_notes (capture_sha, project, purpose, sources, steps, limitations, by, at) VALUES (?,?,?,?,?,?,?,?)`,
                    wb.capture_sha, wb.project, str(purpose), json(srcs), str(steps), str(limitations), by, at);
      return { ok: true, note: { purpose: str(purpose), sources: srcs, steps: str(steps), limitations: str(limitations), by, at, current: true } };
    });
  }

  #methodNotes(wb) {
    const rows = this.#rows(`SELECT * FROM workbook_method_notes WHERE capture_sha=? AND project=? ORDER BY note_id`, wb.capture_sha, wb.project);
    return rows.map((r, i) => ({ purpose: r.purpose, sources: parse(r.sources), steps: r.steps, limitations: r.limitations, by: r.by,
                                 at: r.at, current: i === rows.length - 1 }));
  }

  /** R11: a second member's check, disclosed on every read; nothing waits for one. */
  async recordCheck({ captureSha, project, outcome, note, by } = {}) {
    const wb = await this.#workbook(captureSha, project, by);
    if (!wb) return this.#absent(captureSha, project);
    if (by === wb.author) return refusal("SELF_CHECK", "a check is a second member's; the workbook's author cannot check it");
    if (!CHECK_OUTCOMES.includes(outcome)) return refusal("UNKNOWN_OUTCOME", `an outcome is one of ${CHECK_OUTCOMES.join(", ")}`);
    const at = this.now();
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO workbook_checks (capture_sha, project, outcome, note, by, at) VALUES (?,?,?,?,?,?)`,
                    wb.capture_sha, wb.project, outcome, str(note) || null, by, at);
      return { ok: true, check: { outcome, note: str(note) || null, by, at } };
    });
  }

  #checks(wb) {
    return this.#rows(`SELECT outcome, note, by, at FROM workbook_checks WHERE capture_sha=? AND project=? ORDER BY check_id`,
                      wb.capture_sha, wb.project);
  }

  /* ================================================================ R2, R12 */

  /** R12: the grade facts (K1447 (ii)). */
  async #gradeFacts(wb, cells, inputs, bindings, viewer) {
    const byBinding = new Map();
    for (const b of bindings) {
      if (b.state !== "bound") continue;
      const input = b.input || {};
      let capture = null, derivation = null, source = null;
      if (input.table) {
        const t = await this.#readTable(input.table, viewer);
        const g = t && t.grade_facts ? t.grade_facts : null;
        source = { table: input.table, range: input.range };
        capture = g ? g.capture_grade ?? g.grade ?? null : null;
        derivation = g ? g.derivation ?? null : null;
      } else if (input.extent) {
        const row = this.#readExtent(input.extent, viewer);
        source = { extent: input.extent };
        try { capture = row && row.capture_sha ? this.provenance.captureGrade(row.capture_sha)?.grade ?? null : null; } catch { capture = null; }
        derivation = row && row.transcription && typeof row.transcription.ceiling === "string" ? row.transcription.ceiling : null;
      }
      byBinding.set(b.binding_id, { source, capture_grade: capture, derivation: derivation ?? "undetermined",
        grade: capture ? (derivation && GRADE_RANK[derivation] ? weaker(capture, derivation) : capture) : "undetermined" });
    }
    return {
      inputs: inputs.map((x) => (x.bound
        ? { cell: x.cell, binding_id: x.binding_id, ...byBinding.get(x.binding_id) }
        : { cell: x.cell, grade: "D", basis: "testimony: an unbound input (K1447 (ii))" })),
      results: cells.filter((c) => c.formula !== null && c.formula !== undefined)
        .map((c) => ({ cell: `${c.sheet}!${c.cell}`, derivation_step: ENGINE_STEP.step, grade: ENGINE_STEP.grade })),
      method: { graded: false, disclosed: this.#methodNotes(wb).find((n) => n.current) || null },
      rule: "K1447 (ii): each bound input at its capture grade capped by its derivation; an unbound input is testimony (D); "
        + "a third-party engine's value is a derivation step, undetermined until measured; the method is disclosed, not graded",
    };
  }

  /** R2: the workbook whole. It never recomputes. */
  async readWorkbook({ captureSha, project, viewer } = {}) {
    const wb = await this.#workbook(captureSha, project, viewer);
    if (!wb) return this.#absent(captureSha, project);
    const cells = this.#cells(wb);
    const inputs = this.#inputs(wb, cells);
    const bindings = await this.#bindings(wb, viewer);
    const recompute = this.#latestRecompute(wb);
    return {
      ok: true,
      workbook: { capture_sha: wb.capture_sha, project: wb.project, question: wb.question, period: wb.period, origin: wb.origin,
                  author: wb.author, at: wb.at, sheets: wb.facts.sheets || [],
                  counts: { cells: cells.length, formulas: cells.filter((c) => c.formula !== null).length } },
      bindings,
      inputs: inputs.list,
      recompute,
      lint: this.#lint(wb, cells, inputs),
      method_notes: this.#methodNotes(wb),
      checks: this.#checks(wb),
      grade_facts: await this.#gradeFacts(wb, cells, inputs.list, bindings, viewer),
      disclosure: recompute ? recompute.disclosure : disclosure(null),
    };
  }

  /* ================================================================ R14 */

  /** R14: a calculation the viewer may see, as an XLSX workbook. */
  async exportRecipe({ calcId, viewer } = {}) {
    const absent = { ok: true, found: false };
    if (!this.calculations || typeof this.calculations.read !== "function" || typeof viewer !== "string" || !viewer) return absent;
    let calc;
    try { calc = calculationFrom(await this.calculations.read({ calcId, viewer })); } catch { calc = null; }
    if (!calc) return absent;
    const tables = {};
    for (const inp of calc.inputs) {
      if (inp.kind !== "table") continue;
      const t = await this.#readTable(inp.sha, viewer);
      if (!t || !Array.isArray(t.rows)) return absent;
      tables[inp.name] = t;
    }
    const out = buildExport(calc, tables);
    const id = String(calc.calc_id ?? calcId ?? "calculation").replace(/[^A-Za-z0-9._-]/g, "_");
    return { ok: true, found: true, calc_id: calc.calc_id ?? calcId, filename: `${id}.xlsx`, content_type: XLSX_CONTENT_TYPE,
             bytes: out.bytes, sheets: out.sheets, formulas: out.formulas, labelled: out.labelled };
  }
}

/* R6, R7: the engine's cells paired with the file's cached values. */
function pair(answer, cells) {
  const held = new Map(cells.map((c) => [`${c.sheet}!${c.cell}`, c]));
  const counts = { compared: 0, agreed: 0, differed: 0, not_recomputed: 0, volatile: 0, cache_stale: 0 };
  const differing = [], notRecomputed = [], volatile = [], cacheStale = [];
  const seen = new Set();
  for (const e of answer.cells) {
    const ref = e && e.source && typeof e.source.ref === "string" ? e.source.ref : null;
    if (!ref) continue;
    seen.add(ref);
    const c = held.get(ref);
    if (e.volatile) { counts.volatile++; volatile.push({ cell: ref, formula: e.formula ?? null }); continue; }
    if (e.type === "error") {
      counts.not_recomputed++;
      notRecomputed.push({ cell: ref, error: e.error ?? null, cause: e.cause ?? "undetermined", ...(e.function ? { function: e.function } : {}) });
      continue;
    }
    if (!c || c.formula === null || c.formula === undefined) {
      counts.not_recomputed++;
      notRecomputed.push({ cell: ref, error: null, cause: "not_in_file", detail: "the file's reading holds no formula here" });
      continue;
    }
    const cachedErr = c.type === "error" || (typeof c.cached === "string" && /^#/.test(c.cached) && c.type !== "text");
    if (cachedErr || c.cached === null || c.cached === undefined) {
      counts.cache_stale++;
      cacheStale.push({ cell: ref, cached: c.cached ?? null, engine_value: e.value ?? null,
                        why: cachedErr ? "the file caches an error where the engine gives a value" : "the file caches no value" });
      continue;
    }
    counts.compared++;
    let same;
    if (e.type === "number" && c.type === "number") same = closeNumbers(e.value, c.cached);
    else if (e.type === "boolean" && c.type === "boolean") same = String(e.value).toLowerCase() === (c.cached === "1" || /^true$/i.test(c.cached) ? "true" : "false");
    else if (e.type === "text" && c.type === "text") same = String(e.value) === c.cached;
    else same = false;
    if (same) counts.agreed++;
    else { counts.differed++; differing.push({ cell: ref, cached: c.cached, cached_type: c.type, engine_value: e.value ?? null, engine_type: e.type ?? null }); }
  }
  for (const c of cells)
    if (c.formula !== null && c.formula !== undefined && !seen.has(`${c.sheet}!${c.cell}`)) {
      counts.not_recomputed++;
      notRecomputed.push({ cell: `${c.sheet}!${c.cell}`, error: null, cause: "no_engine_value", detail: "the engine answered no value for this formula" });
    }
  const status = counts.differed ? "differs"
    : counts.not_recomputed || counts.volatile || counts.cache_stale ? "partial"
    : counts.compared ? "agrees" : "partial";
  const lists = { differing: cut(differing), not_recomputed: cut(notRecomputed), volatile: cut(volatile), cache_stale: cut(cacheStale) };
  return { status, body: { counts, ...Object.fromEntries(Object.entries(lists).map(([k, v]) => [k, v.list])),
                           truncated: Object.fromEntries(Object.entries(lists).filter(([, v]) => v.left).map(([k, v]) => [k, v.left])) } };
}

/** R8: the disclosure a recompute statement carries. */
function disclosure(rec) {
  if (!rec || rec.status === NOT_RECOMPUTED) {
    const why = rec ? rec.why || rec.reason : "no recompute is recorded";
    return { text: `${NOT_RECOMPUTED}: ${why}; open it in any spreadsheet program`, status: NOT_RECOMPUTED };
  }
  const measured = rec.engine === ENGINE_MEASURE.engine && rec.engine_version === ENGINE_MEASURE.engine_version;
  return { text: `recomputed by the instance's engine (${rec.engine} ${rec.engine_version}); open it in any spreadsheet program`,
           meaning: RECOMPUTE_MEANING, status: rec.status,
           measure: measured ? ENGINE_MEASURE : { measured: false, why: `no corpus measure is recorded for ${rec.engine} ${rec.engine_version}` } };
}

function recomputeView(row) {
  const body = parse(row.answer) || {};
  const rec = { status: row.status, engine: row.engine, engine_version: row.engine_version, at: row.at, by: row.by,
                ...(row.reason ? { reason: row.reason, why: row.why } : {}), counts: body.counts, differing: body.differing || [],
                not_recomputed: body.not_recomputed || [], volatile: body.volatile || [], cache_stale: body.cache_stale || [],
                ...(body.truncated && Object.keys(body.truncated).length ? { truncated: body.truncated } : {}) };
  if (rec.status !== NOT_RECOMPUTED) rec.meaning = RECOMPUTE_MEANING;
  rec.disclosure = disclosure(rec);
  return rec;
}

