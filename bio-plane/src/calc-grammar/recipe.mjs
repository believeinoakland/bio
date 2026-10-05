/* calc-grammar's recipes (requirements: `build/requirements/calc-grammar.md`, R6–R15, R18, R20). A recipe is data in
 * one closed grammar, `bio-calc/1`: a list of steps, each one of twelve forms, every field of which is checked
 * before anything runs. Nothing in a recipe is ever run as code. `evaluate` reads only its arguments: the same
 * recipe and bindings give the same result, and every row it could not decide is set aside and named, never
 * coerced and never read as zero. */

import { canonicalJson, sha256HexSync } from "../record-grammar/index.mjs";
import { compare as compareTimes, span as spanTimes } from "../civil-time/index.mjs";
import { parseFigure } from "./figures.mjs";
import { MODES, MAX_PLACES, add, subtract, divide, round, relate, figureFault, statedValue, cmpD,
  refusal, undetermined, isRefusal, isUndetermined } from "./decimal.mjs";

export const METHOD = "bio-calc/1";
export const OPS = Object.freeze(["select", "count", "sum", "difference", "ratio", "share", "group", "span", "compare",
  "round", "join", "sort"]);
export const TESTS = Object.freeze(["eq", "ne", "lt", "le", "gt", "ge", "in", "between"]);
export const FIELD_TYPES = Object.freeze(["string", "number", "integer", "date", "datetime", "boolean"]);
export const SPAN_UNITS = Object.freeze(["days", "business days", "hours", "months", "years"]);
export const RATIO_DEFAULT = Object.freeze({ places: 12, mode: "half_even" });
/** R13: a declared field whose values must agree across a sum, and the refusal when they do not. */
export const SUM_RULE = Object.freeze([["kind", "SUM_MIXED_KIND"], ["phase", "SUM_MIXED_STAGE"],
  ["stage", "SUM_MIXED_STAGE"], ["basis", "SUM_MIXED_BASIS"], ["currency", "SUM_MIXED_CURRENCY"],
  ["period", "SUM_MIXED_PERIOD"]]);

const NAME = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
const QUANTITY_TYPES = ["number", "integer", "date", "datetime"];

/* Each op's form: its fields, which are required, and what each holds. `ref:<kind>` names an input or an earlier
   step of that kind (`value` takes a figure or a ratio); `field` a table field; the rest are checked by shape. */
const FORMS = {
  select: { from: "ref:table", where: "conditions" },
  count: { from: "ref:table" },
  sum: { from: "ref:table", field: "field" },
  difference: { a: "ref:value", b: "ref:value" },
  ratio: { numerator: "ref:value", denominator: "ref:value", places: "?places", mode: "?mode" },
  share: { part: "ref:table", whole: "ref:table", field: "?field", places: "?places", mode: "?mode" },
  group: { from: "ref:table", by: "fields", measure: "measure" },
  span: { from: "ref:table", start: "field", end: "field", unit: "unit", into: "?field" },
  compare: { a: "ref:value", b: "ref:value" },
  round: { of: "ref:value", places: "places", mode: "mode" },
  join: { left: "ref:table", right: "ref:table", on: "on", space: "?field", crosswalk: "?crosswalk" },
  sort: { from: "ref:table", by: "field", order: "order" },
};
const PRODUCES = { select: "table", count: "figure", sum: "figure", difference: "figure", ratio: "ratio",
  share: "ratio", group: "table", span: "table", compare: "comparison", round: "figure", join: "table",
  sort: "table" };

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v)
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const isFieldName = (v) => typeof v === "string" && v.length > 0 && v.length <= 200;
const isLiteral = (v) => typeof v === "string" || typeof v === "boolean" || Number.isSafeInteger(v);

function checkConditions(where, bad) {
  if (!Array.isArray(where) || !where.length) return bad("where", "a list of one or more conditions");
  where.forEach((c, i) => {
    if (!plain(c)) return bad(`where[${i}]`, "a condition is {field, test, value}");
    const extra = Object.keys(c).filter((k) => !["field", "test", "value"].includes(k));
    if (extra.length) return bad(`where[${i}].${extra[0]}`, "not a field of a condition");
    if (!isFieldName(c.field)) bad(`where[${i}].field`, "a field name");
    if (!TESTS.includes(c.test)) return bad(`where[${i}].test`, `one of ${TESTS.join(", ")}`);
    const v = c.value;
    if (c.test === "in" ? !(Array.isArray(v) && v.length && v.every(isLiteral))
      : c.test === "between" ? !(Array.isArray(v) && v.length === 2 && v.every(isLiteral)) : !isLiteral(v))
      bad(`where[${i}].value`, c.test === "in" ? "a list of literals" : c.test === "between"
        ? "two literals, low and high" : "a literal: a string, a boolean or a whole number");
  });
}

function checkShape(kind, v, bad, field) {
  const optional = kind.startsWith("?");
  const k = optional ? kind.slice(1) : kind;
  if (v === undefined) return optional ? undefined : bad(field, "required");
  switch (k) {
    case "field": return isFieldName(v) ? undefined : bad(field, "a field name");
    case "fields": return Array.isArray(v) && v.length && v.every(isFieldName) ? undefined
      : bad(field, "a list of one or more field names");
    case "places": return Number.isInteger(v) && v >= 0 && v <= MAX_PLACES ? undefined
      : bad(field, `a whole number of places from 0 to ${MAX_PLACES}`);
    case "mode": return MODES.includes(v) ? undefined : bad(field, `one of ${MODES.join(", ")}`);
    case "unit": return SPAN_UNITS.includes(v) ? undefined : bad(field, `one of ${SPAN_UNITS.join(", ")}`);
    case "order": return v === "asc" || v === "desc" ? undefined : bad(field, "asc or desc");
    case "conditions": return checkConditions(v, bad);
    case "measure":
      if (!plain(v) || !(v.op === "count" || v.op === "sum")) return bad(field, "{op: count} or {op: sum, field}");
      if (Object.keys(v).some((x) => !["op", "field"].includes(x))) return bad(field, "{op: count} or {op: sum, field}");
      if (v.op === "sum" ? !isFieldName(v.field) : v.field !== undefined) return bad(`${field}.field`, "a field name for a sum, none for a count");
      return undefined;
    case "on":
      return plain(v) && Object.keys(v).length === 2 && isFieldName(v.left) && isFieldName(v.right) ? undefined
        : bad(field, "{left, right}: the field on each side");
    case "crosswalk":
      return plain(v) && Object.keys(v).length === 3 && typeof v.input === "string" && isFieldName(v.left)
        && isFieldName(v.right) ? undefined : bad(field, "{input, left, right}: a table input and its two fields");
    default: return bad(field, "not a field of this form");
  }
}

/** R6: whether a recipe is in the closed grammar. `{ok: true}` or `{ok: false, errors: [{code, step, field, why}]}`. */
export function checkRecipe(recipe) {
  const errors = [];
  const err = (code, step, field, why) => errors.push({ code, step, field, why });
  if (!plain(recipe)) return { ok: false, errors: [{ code: "RECIPE_INVALID", step: null, field: null, why: "a recipe is an object" }] };
  for (const k of Object.keys(recipe))
    if (!["method", "inputs", "steps", "output"].includes(k)) err("RECIPE_INVALID", null, k, "not a field of a recipe");
  if (recipe.method !== METHOD) err("METHOD_UNKNOWN", null, "method", `the method must be ${METHOD}`);
  const kinds = new Map();
  if (!Array.isArray(recipe.inputs)) err("RECIPE_INVALID", null, "inputs", "a list of {name, kind}");
  else recipe.inputs.forEach((inp, i) => {
    const f = `inputs[${i}]`;
    if (!plain(inp) || Object.keys(inp).some((k) => !["name", "kind"].includes(k)))
      return err("RECIPE_INVALID", null, f, "an input is {name, kind}");
    if (typeof inp.name !== "string" || !NAME.test(inp.name)) return err("RECIPE_INVALID", null, `${f}.name`, "a name");
    if (kinds.has(inp.name)) return err("RECIPE_INVALID", null, `${f}.name`, `"${inp.name}" is named twice`);
    if (inp.kind !== "table" && inp.kind !== "figure") return err("RECIPE_INVALID", null, `${f}.kind`, "table or figure");
    kinds.set(inp.name, inp.kind);
  });
  const selections = new Map();
  if (!Array.isArray(recipe.steps) || !recipe.steps.length) err("RECIPE_INVALID", null, "steps", "a list of one or more steps");
  else recipe.steps.forEach((st, i) => {
    const label = plain(st) && typeof st.as === "string" ? st.as : i;
    const bad = (field, why) => err("RECIPE_INVALID", label, field, why);
    if (!plain(st)) return bad(null, "a step is an object");
    if (!OPS.includes(st.op)) {
      if (typeof st.as === "string" && NAME.test(st.as) && !kinds.has(st.as)) kinds.set(st.as, "unknown");
      return bad("op", `one of ${OPS.join(", ")}`);
    }
    const form = FORMS[st.op];
    for (const k of Object.keys(st)) if (k !== "op" && k !== "as" && !(k in form)) bad(k, `not a field of ${st.op}`);
    for (const [field, kind] of Object.entries(form)) {
      if (!kind.startsWith("ref:")) { checkShape(kind, st[field], bad, field); continue; }
      const ref = st[field];
      if (typeof ref !== "string") { bad(field, "the name of an input or an earlier step"); continue; }
      if (!kinds.has(ref)) { err("NAME_UNDEFINED", label, field, `"${ref.slice(0, 64)}" is not defined before this step`); continue; }
      const want = kind.slice(4); const got = kinds.get(ref);
      if (got === "unknown") continue;
      if (want === "value" ? !(got === "figure" || got === "ratio") : got !== want)
        bad(field, `"${ref}" is a ${got}, and ${field} takes a ${want === "value" ? "figure or ratio" : want}`);
    }
    if (st.op === "join") {
      if (st.space === undefined && st.crosswalk === undefined)
        err("JOIN_UNKEYED", label, "space", "a join is keyed through an identifier space or a crosswalk");
      else if (st.space !== undefined && st.crosswalk !== undefined) bad("crosswalk", "a join names a space or a crosswalk, not both");
      else if (st.crosswalk && plain(st.crosswalk)) {
        if (!kinds.has(st.crosswalk.input)) err("NAME_UNDEFINED", label, "crosswalk.input", `"${String(st.crosswalk.input).slice(0, 64)}" is not defined before this step`);
        else if (kinds.get(st.crosswalk.input) !== "table") bad("crosswalk.input", "a crosswalk is a table");
      }
    }
    if (st.op === "share" && typeof st.part === "string" && selections.get(st.part) !== st.whole)
      bad("part", "a share's part is a select step over its whole");
    if (typeof st.as !== "string" || !NAME.test(st.as)) return bad("as", "a name");
    if (kinds.has(st.as)) return bad("as", `"${st.as}" is already defined`);
    kinds.set(st.as, PRODUCES[st.op]);
    if (st.op === "select") selections.set(st.as, st.from);
  });
  if (typeof recipe.output !== "string") err("RECIPE_INVALID", null, "output", "the name of the answering step");
  else if (!kinds.has(recipe.output)) err("NAME_UNDEFINED", null, "output", `"${recipe.output.slice(0, 64)}" is not defined`);
  return errors.length ? { ok: false, errors } : { ok: true };
}

// ---- reading cells ----

function tableFault(t) {
  if (!plain(t) || !Array.isArray(t.fields) || !Array.isArray(t.rows)) return "a table is {fields, rows}";
  const names = new Set();
  for (const f of t.fields) {
    if (!plain(f) || !isFieldName(f.name) || !FIELD_TYPES.includes(f.type)) return "each field is {name, type}, type one of " + FIELD_TYPES.join(", ");
    if (names.has(f.name)) return `the field "${f.name}" is declared twice`;
    names.add(f.name);
  }
  if (!t.rows.every(plain)) return "each row is an object keyed by field name";
  return null;
}

const empty = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/** A cell read as its field's type: `{v}` or `{undetermined, why}`. Never coerced: a cell that does not read as
 *  its type is undetermined (R7). */
function readCell(field, raw) {
  if (empty(raw)) return undetermined(`"${field.name}" is empty`);
  switch (field.type) {
    case "string": return typeof raw === "string" ? { v: raw } : undetermined(`"${field.name}" is not a string`);
    case "boolean":
      if (raw === true || raw === "true") return { v: true };
      if (raw === false || raw === "false") return { v: false };
      return undetermined(`"${field.name}" is not true or false`);
    case "number": case "integer": {
      let f;
      if (plain(raw)) f = raw;
      else if (typeof raw === "string") f = parseFigure(raw);
      else if (Number.isSafeInteger(raw)) f = parseFigure(String(raw));
      else return undetermined(`"${field.name}" is not a figure (a floating-point number is never read as one)`);
      if (isRefusal(f) || figureFault(f)) return undetermined(`"${field.name}" does not read as a figure: ${f.why || figureFault(f)}`);
      if (field.type === "integer" && (f.precision === "range" || /\.\d*[1-9]/.test(f.value)))
        return undetermined(`"${field.name}" is not a whole number`);
      const g = { ...f };
      delete g.as_read;
      for (const k of ["unit", "currency"]) {
        if (field[k] === undefined) continue;
        if (g[k] === undefined) g[k] = field[k];
        else if (g[k] !== field[k]) return { ...undetermined(`"${field.name}" names ${k} ${g[k]}, and the field ${field[k]}`), mismatch: true };
      }
      return { v: g };
    }
    default: { // date, datetime
      if (plain(raw) && typeof raw.value === "string" && typeof raw.precision === "string") return { v: raw };
      if (typeof raw !== "string") return undetermined(`"${field.name}" is not a date`);
      return { v: dateTime(raw, field.zone) };
    }
  }
}

function dateTime(s, zone) {
  const z = typeof zone === "string" && zone ? zone : "UTC";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { value: s, precision: "day", zone: z };
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return { value: s, precision: "minute", zone: z };
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) return { value: s, precision: "second", zone: z };
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s)) return { value: s.slice(0, -1), precision: "second", zone: "UTC" };
  return { value: s, precision: "edtf", zone: z };
}

/* A condition's literal read as the field's type, so a comparison is between like values. */
function readLiteral(field, lit) {
  if (field.type === "number" || field.type === "integer") return readCell({ ...field, type: "number" }, typeof lit === "number" ? String(lit) : lit);
  if (field.type === "date" || field.type === "datetime") return typeof lit === "string" ? { v: dateTime(lit, field.zone) } : undetermined("a date condition takes a date");
  if (field.type === "boolean") return readCell(field, lit);
  return typeof lit === "string" ? { v: lit } : undetermined("a string field compares with a string");
}

const sameDateTime = (a, b) => a.value === b.value && a.precision === b.precision && a.zone === b.zone;

/** -1, 0, 1, or `{undetermined, why}` (or a refusal) for two read values of one field type. */
function order(type, a, b) {
  if (type === "number" || type === "integer") {
    const r = relate(a, b);
    if (isRefusal(r) || isUndetermined(r)) return r;
    return r === "lower" ? -1 : r === "higher" ? 1 : 0;
  }
  if (type === "date" || type === "datetime") {
    if (sameDateTime(a, b)) return 0;
    let r;
    try { r = compareTimes(a, b); } catch (e) { return undetermined(`civil-time could not compare: ${e.message}`); }
    if (r === "before") return -1;
    if (r === "after") return 1;
    return undetermined(r && r.why ? r.why : "civil-time answered undetermined");
  }
  return a === b ? 0 : NaN; // a string or a boolean is equal or not, never ordered (R7 refuses an order test on one)
}

function test(type, cond, cell, literal) {
  const o = (b) => order(type, cell, b);
  const settle = (x, pred) => (typeof x === "number" ? pred(x) : x);
  switch (cond.test) {
    case "eq": return settle(o(literal), (x) => x === 0);
    case "ne": return settle(o(literal), (x) => x !== 0);
    case "lt": return settle(o(literal), (x) => x < 0);
    case "le": return settle(o(literal), (x) => x <= 0);
    case "gt": return settle(o(literal), (x) => x > 0);
    case "ge": return settle(o(literal), (x) => x >= 0);
    case "in": {
      let open = null;
      for (const l of literal) {
        const x = o(l);
        if (x === 0) return true;
        if (typeof x !== "number") open = open || x;
      }
      return open || false;
    }
    default: { // between, inclusive
      const lo = settle(o(literal[0]), (x) => x >= 0);
      const hi = settle(o(literal[1]), (x) => x <= 0);
      if (lo === false || hi === false) return false;
      if (lo === true && hi === true) return true;
      return lo === true ? hi : lo;
    }
  }
}

// ---- evaluating ----

class Refused { constructor(r) { this.r = r; } }
const stop = (code, why, step) => { throw new Refused({ refused: code, why, step }); };

function fieldOf(table, name, step, role) {
  const f = table.fields.find((x) => x.name === name);
  if (!f) stop("RECIPE_INVALID", `${role} "${name}" is not a field of the table`, step);
  return f;
}

const valueOf = (x) => (x && x.kind === "ratio" ? x.value.value : x.value);

/* R13 then an exact total: a figure, `{undetermined}`, or a refusal by name. */
function total(table, rows, fieldName, step) {
  const f = fieldOf(table, fieldName, step, "sum's field");
  if (f.type !== "number" && f.type !== "integer") stop("RECIPE_INVALID", `"${fieldName}" is not a numeric field`, step);
  for (const [name, code] of SUM_RULE) {
    const rf = table.fields.find((x) => x.name === name);
    if (!rf) continue;
    const seen = [];
    const blank = [];
    rows.forEach(({ row, i }) => {
      const v = row[name];
      if (empty(v)) blank.push(i);
      else if (!seen.includes(String(v))) seen.push(String(v));
    });
    if (seen.length > 1) stop(code, `the rows differ in ${name}: ${seen.slice(0, 10).join(", ")}`, step);
    if (blank.length) return { u: undetermined(`${name} is not stated on row${blank.length > 1 ? "s" : ""} ${blank.join(", ")}`), rows: blank.map((row) => ({ row, why: `${name} is empty` })) };
  }
  let acc = { value: "0", sign: "+", precision: "exact", ...(f.unit && { unit: f.unit }), ...(f.currency && { currency: f.currency }) };
  const set = [];
  for (const { row, i } of rows) {
    const c = readCell(f, row[fieldName]);
    if (isUndetermined(c)) { set.push({ row: i, why: c.why }); continue; }
    if (set.length) continue;
    const next = add(acc, c.v);
    if (isRefusal(next)) stop(next.refused === "UNIT_MISMATCH" ? "SUM_MIXED_CURRENCY" : next.refused, next.why, step);
    acc = next;
  }
  if (set.length) return { u: undetermined(`${set.length} amount${set.length > 1 ? "s are" : " is"} undetermined, so the total is undetermined (never read as zero)`), rows: set };
  return { v: acc, rows: [] };
}

const countFigure = (n) => ({ value: String(n), sign: "+", precision: "exact" });
const indexed = (rows) => rows.map((row, i) => ({ row, i }));

function makeRatio(num, den, places, mode) {
  const value = divide(num, den, { places, mode });
  if (isRefusal(value)) return value;
  return { numerator: num, denominator: den, value };
}

/* Each op: (step, env, opts) → {kind, value, inputRows, set: [{row, why}]}. */
const RUN = {
  select(st, env) {
    const t = env.table(st.from);
    const conds = st.where.map((c) => {
      const field = fieldOf(t, c.field, st.as, "the condition's field");
      if (["lt", "le", "gt", "ge", "between"].includes(c.test) && !QUANTITY_TYPES.includes(field.type))
        stop("RECIPE_INVALID", `"${c.field}" is a ${field.type}, which has no order`, st.as);
      const lits = (c.test === "in" || c.test === "between" ? c.value : [c.value]).map((l) => readLiteral(field, l));
      const badLit = lits.find((l) => isUndetermined(l) || isRefusal(l));
      if (badLit) stop(badLit.mismatch ? "UNIT_MISMATCH" : "RECIPE_INVALID", `a condition on "${c.field}": ${badLit.why}`, st.as);
      const vs = lits.map((l) => l.v);
      return { c, field, literal: c.test === "in" || c.test === "between" ? vs : vs[0] };
    });
    const kept = []; const set = [];
    t.rows.forEach((row, i) => {
      let open = null;
      for (const { c, field, literal } of conds) {
        const cell = readCell(field, row[c.field]);
        if (isUndetermined(cell)) { open = open || cell.why; continue; }
        const r = test(field.type, c, cell.v, literal);
        if (isRefusal(r)) stop(r.refused, `"${c.field}": ${r.why}`, st.as);
        if (r === false) return;
        if (r !== true) open = open || r.why;
      }
      if (open) set.push({ row: i, why: open });
      else kept.push(row);
    });
    return { kind: "table", value: { fields: t.fields, rows: kept }, inputRows: t.rows.length, set };
  },
  count(st, env) {
    const t = env.table(st.from);
    return { kind: "figure", value: countFigure(t.rows.length), inputRows: t.rows.length, set: [] };
  },
  sum(st, env) {
    const t = env.table(st.from);
    const r = total(t, indexed(t.rows), st.field, st.as);
    return { kind: "figure", value: r.u || r.v, inputRows: t.rows.length, set: r.rows };
  },
  difference(st, env) {
    const r = subtract(env.value(st.a), env.value(st.b));
    if (isRefusal(r)) stop(r.refused, r.why, st.as);
    return { kind: "figure", value: r, set: [] };
  },
  ratio(st, env) {
    const r = makeRatio(env.value(st.numerator), env.value(st.denominator), st.places ?? RATIO_DEFAULT.places, st.mode ?? RATIO_DEFAULT.mode);
    if (isRefusal(r)) stop(r.refused, r.why, st.as);
    return { kind: "ratio", value: r, set: [] };
  },
  share(st, env) {
    const part = env.table(st.part); const whole = env.table(st.whole);
    let num; let den; const set = [];
    if (st.field === undefined) { num = countFigure(part.rows.length); den = countFigure(whole.rows.length); }
    else {
      const a = total(part, indexed(part.rows), st.field, st.as);
      const b = total(whole, indexed(whole.rows), st.field, st.as);
      set.push(...b.rows);
      num = a.u || a.v; den = b.u || b.v;
    }
    if (isUndetermined(num) || isUndetermined(den))
      return { kind: "ratio", value: { numerator: num, denominator: den, value: undetermined("a total is undetermined") }, inputRows: whole.rows.length, set };
    const r = makeRatio(num, den, st.places ?? RATIO_DEFAULT.places, st.mode ?? RATIO_DEFAULT.mode);
    if (isRefusal(r)) stop(r.refused, r.why, st.as);
    return { kind: "ratio", value: r, inputRows: whole.rows.length, set };
  },
  group(st, env) {
    const t = env.table(st.from);
    const by = st.by.map((n) => fieldOf(t, n, st.as, "the grouping field"));
    const groups = new Map(); const set = [];
    t.rows.forEach((row, i) => {
      const cells = by.map((f) => readCell(f, row[f.name]));
      const open = cells.find(isUndetermined);
      if (open) return set.push({ row: i, why: open.why });
      const key = canonicalJson(cells.map(({ v }) => v));
      if (!groups.has(key)) groups.set(key, { cells: by.map((f) => row[f.name]), rows: [] });
      groups.get(key).rows.push({ row, i });
    });
    let mfield;
    if (st.measure.op === "count") mfield = { name: "count", type: "integer" };
    else {
      const sf = fieldOf(t, st.measure.field, st.as, "the measure's field");
      mfield = { name: "sum", type: "number", ...(sf.unit && { unit: sf.unit }), ...(sf.currency && { currency: sf.currency }) };
    }
    const rows = [];
    for (const g of groups.values()) {
      const out = {};
      by.forEach((f, k) => { out[f.name] = g.cells[k]; });
      if (st.measure.op === "count") out.count = String(g.rows.length);
      else {
        const r = total(t, g.rows, st.measure.field, st.as);
        if (r.u) { out.sum = null; set.push(...r.rows.map((x) => ({ ...x, why: `${x.why}; its group's sum is undetermined` }))); }
        else out.sum = r.v;
      }
      rows.push(out);
    }
    return { kind: "table", value: { fields: [...by, mfield], rows }, inputRows: t.rows.length, set };
  },
  span(st, env, opts) {
    const t = env.table(st.from);
    const fs = fieldOf(t, st.start, st.as, "span's start"); const fe = fieldOf(t, st.end, st.as, "span's end");
    for (const f of [fs, fe]) if (f.type !== "date" && f.type !== "datetime") stop("RECIPE_INVALID", `"${f.name}" is not a date field`, st.as);
    const into = st.into ?? st.as;
    if (t.fields.some((f) => f.name === into)) stop("RECIPE_INVALID", `"${into}" is already a field of the table`, st.as);
    const set = [];
    const rows = t.rows.map((row, i) => {
      const a = readCell(fs, row[fs.name]); const b = readCell(fe, row[fe.name]);
      const open = [a, b].find(isUndetermined);
      if (open) { set.push({ row: i, why: open.why }); return { ...row, [into]: null }; }
      let r;
      try { r = spanTimes(a.v, b.v, { unit: st.unit, ...(opts.view && { view: opts.view }), ...(opts.office && { office: opts.office }) }); } catch (e) { r = undetermined(`civil-time could not count: ${e.message}`); }
      if (!r || !Number.isSafeInteger(r.min) || !Number.isSafeInteger(r.max)) {
        set.push({ row: i, why: (r && r.why) || "civil-time gave no span" });
        return { ...row, [into]: null };
      }
      const cell = r.min === r.max ? { value: String(Math.abs(r.min)), sign: r.min < 0 ? "-" : "+", precision: "exact", unit: st.unit }
        : { low: String(r.min), high: String(r.max), sign: r.min < 0 ? "-" : "+", precision: "range", unit: st.unit };
      return { ...row, [into]: cell };
    });
    return { kind: "table", value: { fields: [...t.fields, { name: into, type: "number", unit: st.unit }], rows }, inputRows: t.rows.length, set };
  },
  compare(st, env) {
    const r = relate(env.value(st.a), env.value(st.b));
    if (isRefusal(r)) stop(r.refused, r.why, st.as);
    const value = isUndetermined(r) ? { relation: "undetermined", why: r.why, label: "computed fact" } : { relation: r, label: "computed fact" };
    return { kind: "comparison", value, set: [] };
  },
  round(st, env) {
    const r = round(env.value(st.of), { places: st.places, mode: st.mode });
    if (isRefusal(r)) stop(r.refused, r.why, st.as);
    return { kind: "figure", value: r, set: [] };
  },
  join(st, env, opts) {
    const L = env.table(st.left); const R = env.table(st.right);
    const lf = fieldOf(L, st.on.left, st.as, "the join's left field"); const rf = fieldOf(R, st.on.right, st.as, "the join's right field");
    const set = [];
    let keyOf;
    if (st.space !== undefined) {
      if (typeof opts.resolveId !== "function") {
        return { kind: "table", value: undetermined(`no resolver for the space "${st.space}"`), inputRows: L.rows.length, set };
      }
      keyOf = (v) => {
        let k;
        try { k = opts.resolveId(st.space, v); } catch (e) { return undetermined(`the resolver failed: ${e.message}`); }
        return typeof k === "string" && k ? [k] : undetermined(`"${String(v).slice(0, 64)}" does not resolve in the space "${st.space}"`);
      };
    } else {
      const cw = env.table(st.crosswalk.input);
      const cl = fieldOf(cw, st.crosswalk.left, st.as, "the crosswalk's left field"); const cr = fieldOf(cw, st.crosswalk.right, st.as, "the crosswalk's right field");
      const pairs = new Map();
      for (const row of cw.rows) {
        if (empty(row[cl.name]) || empty(row[cr.name])) continue;
        const a = String(row[cl.name]);
        if (!pairs.has(a)) pairs.set(a, []);
        pairs.get(a).push(`\u0000${String(row[cr.name])}`);
      }
      keyOf = (v, side) => {
        if (side === "right") return [`\u0000${String(v)}`];
        return pairs.has(String(v)) ? pairs.get(String(v)) : undetermined(`"${String(v).slice(0, 64)}" is not in the crosswalk`);
      };
    }
    const rightKeys = R.rows.map((row, i) => {
      if (empty(row[rf.name])) { set.push({ side: "right", row: i, why: `"${rf.name}" is empty` }); return null; }
      const k = keyOf(row[rf.name], "right");
      if (isUndetermined(k)) { set.push({ side: "right", row: i, why: k.why }); return null; }
      return k;
    });
    const fields = [...L.fields, ...R.fields.map((f) => ({ ...f, name: `${st.right}.${f.name}` }))];
    const rows = [];
    L.rows.forEach((lrow, i) => {
      if (empty(lrow[lf.name])) return set.push({ side: "left", row: i, why: `"${lf.name}" is empty` });
      const ks = keyOf(lrow[lf.name], "left");
      if (isUndetermined(ks)) return set.push({ side: "left", row: i, why: ks.why });
      R.rows.forEach((rrow, j) => {
        if (rightKeys[j] && rightKeys[j].some((k) => ks.includes(k))) {
          const out = { ...lrow };
          for (const f of R.fields) out[`${st.right}.${f.name}`] = rrow[f.name];
          rows.push(out);
        }
      });
    });
    return { kind: "table", value: { fields, rows }, inputRows: L.rows.length + R.rows.length, set };
  },
  sort(st, env) {
    const t = env.table(st.from);
    const f = fieldOf(t, st.by, st.as, "the sort's field");
    if (!QUANTITY_TYPES.includes(f.type) || f.composed === true)
      stop("SORT_NOT_QUANTITY", `"${st.by}" is ${f.composed ? "composed from more than one quantity" : `a ${f.type}`}, not one stated quantity`, st.as);
    const set = []; const keyed = [];
    t.rows.forEach((row, i) => {
      const c = readCell(f, row[f.name]);
      if (isUndetermined(c)) return set.push({ row: i, why: c.why });
      if ((f.type === "number" || f.type === "integer") && c.v.precision === "range") return set.push({ row: i, why: `"${f.name}" is a range, which has no one place in an order` });
      keyed.push({ row, v: c.v });
    });
    const sign = st.order === "desc" ? -1 : 1;
    const cmp = (a, b) => {
      if (f.type === "number" || f.type === "integer") {
        if (a.v.unit !== b.v.unit || a.v.currency !== b.v.currency) stop("UNIT_MISMATCH", `"${f.name}" mixes units or currencies`, st.as);
        return sign * cmpD(statedValue(a.v), statedValue(b.v));
      }
      const o = order(f.type, a.v, b.v);
      return typeof o === "number" ? sign * o : 0; // an undecided pair keeps its input order
    };
    return { kind: "table", value: { fields: t.fields, rows: mergeSort(keyed, cmp).map((x) => x.row) }, inputRows: t.rows.length, set };
  },
};

/* A stable merge sort: ties keep their input order whatever the comparator's partiality. */
function mergeSort(xs, cmp) {
  if (xs.length < 2) return xs.slice();
  const mid = xs.length >> 1;
  const a = mergeSort(xs.slice(0, mid), cmp); const b = mergeSort(xs.slice(mid), cmp);
  const out = [];
  let i = 0; let j = 0;
  while (i < a.length && j < b.length) out.push(cmp(b[j], a[i]) < 0 ? b[j++] : a[i++]);
  return out.concat(a.slice(i), b.slice(j));
}

function summary(r) {
  if (r.kind === "table") return isUndetermined(r.value) ? r.value : { rows: r.value.rows.length };
  return r.value;
}

/** R7–R14: run a checked recipe over its bound inputs. `{result, undetermined_rows, trace}`, or a refusal
 *  `{refused, why, step?, errors?}`. `opts.resolveId(space, value)` is the caller's normaliser for a join (R11);
 *  `opts.view` and `opts.office` pass to civil-time's `span` for a business-day count (R9). */
export function evaluate(recipe, bound, opts = {}) {
  if (bound === null || typeof bound !== "object") throw new TypeError("evaluate's bindings are an object");
  if (opts === null || typeof opts !== "object") throw new TypeError("evaluate's options are an object");
  if (opts.resolveId !== undefined && typeof opts.resolveId !== "function") throw new TypeError("resolveId is a function");
  const checked = checkRecipe(recipe);
  if (!checked.ok) return { refused: checked.errors[0].code, why: checked.errors[0].why, errors: checked.errors };
  const env = new Map();
  for (const inp of recipe.inputs) {
    if (!Object.prototype.hasOwnProperty.call(bound, inp.name)) return refusal("INPUT_UNBOUND", `the input "${inp.name}" is not bound`);
    const v = bound[inp.name];
    const why = inp.kind === "table" ? tableFault(v) : figureFault(v);
    if (why) return { refused: "INPUT_INVALID", why: `the input "${inp.name}": ${why}` };
    env.set(inp.name, { kind: inp.kind, value: v });
  }
  const trace = [];
  let undeterminedRows = 0;
  const access = {
    table: (n) => { const x = env.get(n); if (isUndetermined(x.value)) throw x; return x.value; },
    value: (n) => { const x = env.get(n); const v = valueOf(x); if (isUndetermined(v)) throw { value: v }; return v; },
  };
  try {
    for (const st of recipe.steps) {
      let r;
      try { r = RUN[st.op](st, access, opts); } catch (e) {
        if (e instanceof Refused) throw e;
        if (e && isUndetermined(e.value)) r = { kind: PRODUCES[st.op], value: undetermined(`an input is undetermined: ${e.value.why}`), set: [] };
        else throw e;
      }
      env.set(st.as, r);
      undeterminedRows += r.set.length;
      trace.push({ step: st.as, op: st.op, input_rows: r.inputRows ?? null, output: summary(r), undetermined: r.set, method: METHOD });
    }
  } catch (e) {
    if (e instanceof Refused) return { ...e.r, trace };
    throw e;
  }
  return { result: env.get(recipe.output).value, undetermined_rows: undeterminedRows, trace };
}

/** R15: the result key: SHA-256 of the canonical JSON of `{recipe, inputs, method_version}`. */
export function resultKey(recipe, inputHashes, { methodVersion = METHOD } = {}) {
  if (recipe === null || typeof recipe !== "object") throw new TypeError("resultKey takes a recipe object");
  if (inputHashes === null || typeof inputHashes !== "object") throw new TypeError("resultKey takes the inputs' hashes as an object");
  if (typeof methodVersion !== "string") throw new TypeError("methodVersion is a string");
  return sha256HexSync(canonicalJson({ recipe, inputs: inputHashes, method_version: methodVersion }));
}
