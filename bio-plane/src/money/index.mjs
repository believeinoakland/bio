/* money (layer 5): money as stated amounts (`build/requirements/money.md`). Each money fact `MNY-` is one source's
   reading of one amount with its kind, phase or stage, basis, period, parties and funds and two grades, written at one
   append site (R1–R6), withdrawn and read (R7–R9); the summation rule (R10), reconciliation by the dimension that
   differs (R11), money sets (R12–R13), committed against paid (R14) and the chain of authority (R15) are reads that
   compute and store no total. The module presents each fact as one edge from payer to payee (R16), tells later
   modules of every change (R23), publishes its closed lists (R17) and its ops (R18), and states the facts table as a
   read contract (R19). One home per fact is checked at the store's gate (R20); a fact follows its source's sight
   (R21). No field marks a fact as the group's own (R6, K1463).

   Reached through `moneyOf(ctx, opts)` (K61). `events` and `lines` are reached through the ports `opts.events` and
   `opts.lines` (their `has`, `eventsFor`, `readEvent`): absent, money fails closed where it needs them. */
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK, listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { entitiesOf, noEntity, noSuchEntity, gradeRank } from "../entities/index.mjs";
import { checkContentExtent, canonicalExtent, describeExtent } from "../content/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { isHypothesisId, canonicalJson, sha256HexSync } from "../record-grammar/index.mjs";
import { bounds, compare, fiscalPeriod, validAt } from "../civil-time/index.mjs";
import { parseFigure, add, subtract, SUM_RULE } from "../calc-grammar/index.mjs";
import { readingOf, cmpD } from "../calc-grammar/decimal.mjs";
import { BOUNDS, LOWEST_GRADE, exhausted, defaultRegistry } from "../connection-grammar/index.mjs";
import { MONEY_SCHEMA, MONEY_TABLES } from "./schema.mjs";
import { MONEY_KINDS, PHASES, STAGES, BASES, PRECISIONS, STAGE_FAMILIES, FUND_TYPES, BALANCE_FAMILIES, METHODS,
  MACHINE_METHODS, SET_PURPOSES, CONCERNS_KINDS, CHANGES, CONNECTION_KIND, CONNECTION_WORD } from "./vocab.mjs";

export { MONEY_SCHEMA, MONEY_TABLES, MONEY_KINDS, PHASES, STAGES, BASES, PRECISIONS, STAGE_FAMILIES, FUND_TYPES,
  BALANCE_FAMILIES, METHODS, SET_PURPOSES, CHANGES, CONNECTION_KIND, CONNECTION_WORD };

/* R9: the bound of a list read. */
export const LIST_LIMIT_DEFAULT = 100;
export const LIST_LIMIT_MAX = 500;
/* R7, R12: a stated reason, at most. */
export const REASON_MAX = 2000;
/* A label or a party's words as written, at most. */
const TEXT_MAX = 2000;
/* How deep a chain of facts citing facts is followed to its capture. */
const SOURCE_DEPTH_MAX = 32;

/* R1, R6: the fields a write may carry, and a party's. Every other field is refused (R6: no field marks a fact as
   the group's own). `fact_id`, `grade` and `at` are the module's to assign, never a caller's. */
const FIELDS = new Set(["amount", "as_read", "currency", "sign", "precision", "kind", "phase", "stage", "adjusts",
  "basis", "period", "from", "to", "codes", "balance_class", "buys", "concerns", "source", "method", "binding", "by"]);
const PARTY_FIELDS = new Set(["entity", "fund", "account", "as_written", "identifier"]);
const PERIOD_FIELDS = new Set(["from", "to", "precision", "zone", "fiscal", "body"]);
const SOURCE_FIELDS = new Set(["capture_sha", "extent", "content_id", "fact"]);
const BUYS_FIELDS = new Set(["quantity", "unit", "what"]);

const SHA_RE = /^[0-9a-f]{64}$/;
const DECIMAL_RE = /^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/;
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const filled = (v) => typeof v === "string" && v.trim() !== "";
const clip = (s, n = TEXT_MAX) => String(s).trim().replace(/\s+/g, " ").slice(0, n);
const isMachine = (by) => typeof by === "string" && by.startsWith("class:");
const isMember = (by) => filled(by) && !isMachine(by);

/** Every refusal: `{ok: false, reason, code, detail}`, a caller's own fields beside them. */
export function refusal(code, detail, extra = {}) {
  return { ...extra, ok: false, reason: code, code, detail };
}
const list = (xs) => xs.join(", ");

/* An exact decimal by calc-grammar's figure parser (R1's BAD_AMOUNT): digits, thousands separators and one point,
   unsigned, unscaled, with no currency sign. Answers its normal value, or null. Never a JavaScript number. */
function exactDecimal(s) {
  if (typeof s !== "string" || !DECIMAL_RE.test(s.trim())) return null;
  const f = parseFigure(s.trim());
  if (!f || f.refused || f.precision !== "exact" || f.sign !== "+" || f.unit !== undefined || f.currency !== undefined)
    return null;
  return f.value;
}
const negate = (v) => (/^0(?:\.0+)?$/.test(v) ? v : `-${v}`);

const instances = new WeakMap();

/** K61: the one Money for this object's storage. `opts` is read on the first call only: `record`, `membership`,
 *  `entities`, `provenance`, `events` and `lines` (ports; absent, money fails closed where it needs them), `now`. */
export function moneyOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let m = instances.get(storage);
  if (!m) {
    const record = opts.record ?? recordOf(ctx);
    const membership = opts.membership ?? membershipOf(ctx, { record });
    m = new Money(storage, { ...opts, record, membership,
      entities: opts.entities ?? (() => entitiesOf(ctx, { record, membership })),
      provenance: opts.provenance ?? (() => provenanceOf(ctx)) });
    instances.set(storage, m);
  }
  return m;
}

export class Money {
  #sql; #record; #membership; #entities; #provenance; #events; #lines; #now;
  #listeners = []; #declared = false; #registered = false; #stepped = false;

  constructor(storage, { record, membership = null, entities = null, provenance = null, events = null, lines = null,
                         now = null } = {}) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#entities = entities;
    this.#provenance = provenance;
    this.#events = events;
    this.#lines = lines;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #ent() { return typeof this.#entities === "function" ? (this.#entities = this.#entities()) : this.#entities; }
  #prov() { return typeof this.#provenance === "function" ? (this.#provenance = this.#provenance()) : this.#provenance; }

  /* ---- boot ---- */

  /** The schema, the table declarations (R21) and the store gates (R20), idempotent. */
  migrate() {
    const bare = MONEY_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    this.declareTables();
  }

  /** R21 (plan T33, Rules (6)): each table declared explicitly. The facts and their child rows follow their source's
   *  sight and are keyed to its bundle by `sight_bundle`, so a bundle's purge clears them; sets and fund types are
   *  group-wide and cleared by the whole-store purge only. R20: the facts' and concerns' one-home checks. */
  declareTables() {
    if (this.#declared) return { ok: true, already: true };
    const cls = { expunge: "none", export: "yes", derive: "stored", version_chain: false, purge: "clear" };
    const bySource = ["money_facts", "money_codes", "money_concerns", "money_withdrawals"]
      .map((name) => ({ name, keys: ["sight_bundle"], sight: "source", ...cls }));
    const group = ["money_sets", "money_set_acts", "money_set_proposals", "money_fund_types"]
      .map((name) => ({ name, keys: [], sight: "group", ...cls }));
    const r = this.#record.declareTable("money", [...bySource, ...group]);
    if (r && r.ok === false) throw new Error(`money: record-core refused its tables: ${r.reason} (${r.table})`);
    for (const [table, check] of [["money_facts", factGate], ["money_concerns", concernsGate]]) {
      const g = this.#record.registerStoreGate("money", table, check);
      if (g && g.ok === false) throw new Error(`money: record-core refused its store gate: ${g.reason}`);
    }
    this.#declared = true;
    return { ok: true };
  }

  /* ---- sight (R21) ---- */

  #gate(col, viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
    if (g.scope === "DENY") return { sql: g.sql, args: [] };
    return { sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = ${col} AND (${g.sql})))`,
             args: g.args };
  }
  #visibleBundle(bundleId, viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return true;
    if (g.scope === "DENY") return false;
    if (bundleId === null || bundleId === undefined) return true;
    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id = ? AND (${g.sql})`, bundleId, ...g.args);
  }
  #factRow(factId, viewer = null) {
    if (!filled(factId)) return null;
    const row = this.#one(`SELECT * FROM money_facts WHERE fact_id=?`, factId);
    if (!row) return null;
    if (viewer !== null && !this.#visibleBundle(row.sight_bundle, viewer)) return null;
    return row;
  }

  /* ---- the jurisdiction view (fiscal years, classification schemes, time zone) ---- */

  #view() {
    const ids = typeof this.#record.getSetting === "function" ? this.#record.getSetting("jurisdiction_profiles") : null;
    const c = combine(Array.isArray(ids) ? ids : []);
    return c && c.ok ? c.view : {};
  }

  /* ---- the period (Terms; R1) ---- */

  /* A period: `{from, to?, precision?, zone?}` (a date-time range, `to` null when no end is stated) or `{fiscal, body?}`
     (a fiscal key `civil-time` maps from the profile's `fiscal_year` for the body). Answers the period with its start
     and end instants, or a refusal. */
  #period(p, view) {
    if (p === undefined || p === null) return refusal("NO_PERIOD", "a money fact states the accounting period it covers");
    if (!isObj(p)) return refusal("BAD_PERIOD", "a period is {from, to, precision, zone} or {fiscal, body}");
    const extra = Object.keys(p).find((k) => !PERIOD_FIELDS.has(k));
    if (extra) return refusal("BAD_PERIOD", `a period has no field ${extra.slice(0, 40)}`);
    const tz = view && view.time_zone && typeof view.time_zone.value === "string" ? view.time_zone.value : null;
    const zone = filled(p.zone) ? p.zone : tz;
    if (!zone) return refusal("BAD_PERIOD", "the period states no zone and the active profiles give no time zone");
    if (p.fiscal !== undefined) {
      if (!filled(p.fiscal)) return refusal("BAD_PERIOD", "a fiscal key is a non-empty string, such as the profile's label for a fiscal year");
      const body = filled(p.body) ? p.body : "*";
      const fy = Array.isArray(view.fiscal_year) ? view.fiscal_year : [];
      const entry = fy.find((f) => f && f.body === body) || fy.find((f) => f && f.body === "*");
      if (!entry || typeof entry.start !== "string")
        return refusal("BAD_PERIOD", `the active profiles hold no fiscal year for ${body}, so ${p.fiscal} cannot be mapped`);
      const years = [...p.fiscal.matchAll(/\d{4}/g)].map((m) => Number(m[0]));
      for (const y of years.flatMap((y) => [y - 1, y])) {
        let fp;
        try { fp = fiscalPeriod({ date: `${y}-${entry.start}`, body, view }); } catch { fp = null; }
        if (fp && !fp.undetermined && fp.label === p.fiscal) {
          const r = this.#range({ from: fp.start, to: fp.end, precision: "day", zone });
          return r.ok === false ? r : { ...r, key: p.fiscal, body };
        }
      }
      return refusal("BAD_PERIOD", `the profile's fiscal year for ${body} names no period ${p.fiscal}`);
    }
    return this.#range({ from: p.from, to: p.to ?? null, precision: p.precision || "day", zone });
  }
  #range({ from, to, precision, zone }) {
    if (!filled(from)) return refusal("BAD_PERIOD", "a period states its start (from)");
    if (!["day", "minute", "second"].includes(precision))
      return refusal("BAD_PERIOD", "a period's precision is day, minute or second");
    let a, b = null;
    try { a = bounds({ value: from, precision, zone }); } catch { a = { refused: "DATE_INVALID", why: "unreadable" }; }
    if (a.refused || a.undetermined) return refusal("BAD_PERIOD", `the period's start: ${a.why}`);
    if (to !== null) {
      if (typeof to !== "string") return refusal("BAD_PERIOD", "a period's end is a value of its precision, or null when unstated");
      try { b = bounds({ value: to, precision, zone }); } catch { b = { refused: "DATE_INVALID", why: "unreadable" }; }
      if (b.refused || b.undetermined) return refusal("BAD_PERIOD", `the period's end: ${b.why}`);
      if (b.latest <= a.earliest) return refusal("BAD_PERIOD", "the period ends before it starts");
    }
    return { from, to, precision, zone, start: a.earliest, end: b ? b.latest : null };
  }
  /* Overlap of a fact's period with an asked one: true, false, or undetermined (an unstated end). */
  static #overlap(f, q) {
    if (f.end !== null && f.end <= q.start) return false;
    if (q.end !== null && q.end <= f.start) return false;
    if (f.end === null || q.end === null) return "undetermined";
    return true;
  }

  /* ---- R1–R6: the one append site ---- */

  /** R1–R6: `recordFact({...fields, by})`. Every write of a money fact passes here. */
  recordFact(input = {}) {
    const v = this.#validate(input);
    if (v.ok === false) return v;
    return this.#record.transact(() => this.#write(v));
  }

  #validate(input, { viewer } = {}) {
    if (!isObj(input)) return refusal("NO_AMOUNT", "a money fact is an object of its fields");
    /* R6: every field outside the row's shape, a mark of the group's own among them. */
    const unknown = (keys, allowed, where) => {
      const k = keys.find((x) => !allowed.has(x));
      return k === undefined ? null : refusal("UNKNOWN_FIELD", `${where} has no field ${String(k).slice(0, 60)}; `
        + `a money fact holds only ${list([...allowed])}. Nothing was written.`, { field: k });
    };
    const u = unknown(Object.keys(input), FIELDS, "a money fact");
    if (u) return u;
    for (const end of ["from", "to"]) if (isObj(input[end])) {
      const up = unknown(Object.keys(input[end]), PARTY_FIELDS, `the party ${end}`);
      if (up) return up;
    }
    const by = typeof input.by === "string" && input.by ? input.by : null;
    const who = viewer ?? by;
    const view = this.#view();

    /* R1, in order. */
    const { amount } = input;
    if (amount === undefined || amount === null || amount === "") return refusal("NO_AMOUNT", "a money fact states its amount");
    let value = null, low = null, high = null;
    if (isObj(amount)) {
      low = exactDecimal(amount.low); high = exactDecimal(amount.high);
      if (low === null || high === null || Object.keys(amount).some((k) => k !== "low" && k !== "high"))
        return refusal("BAD_AMOUNT", "a range's amount is {low, high}, each an exact decimal written as a string");
    } else {
      value = exactDecimal(amount);
      if (value === null)
        return refusal("BAD_AMOUNT", "an amount is an exact decimal written as a string of digits (thousands separators and "
          + "one point allowed), unsigned and unscaled; never a number with a binary fraction. The sign is its own field");
    }
    if (!filled(input.as_read)) return refusal("NO_AS_READ", "a money fact keeps the figure exactly as its source printed it (as_read)");
    if (!filled(input.currency)) return refusal("NO_CURRENCY", "a money fact names its currency");
    if (input.sign !== "+" && input.sign !== "-") return refusal("NO_SIGN", "a money fact's sign is explicit: + or -");
    if (!PRECISIONS.includes(input.precision))
      return refusal("UNKNOWN_PRECISION", `precision is one of ${list(PRECISIONS)}`, { list: PRECISIONS });
    if ((input.precision === "range") !== (value === null))
      return refusal("BAD_RANGE", input.precision === "range" ? "a range carries its low and high as {low, high}"
        : "only a fact of precision range carries {low, high}");
    if (low !== null && cmpD(dec(low), dec(high)) > 0) return refusal("BAD_RANGE", "a range's low is above its high");
    if (!MONEY_KINDS.includes(input.kind))
      return refusal("UNKNOWN_MONEY_KIND", `kind is one of ${list(MONEY_KINDS)}`, { list: MONEY_KINDS });
    if (!PHASES.includes(input.phase)) return refusal("UNKNOWN_PHASE", `phase is one of ${list(PHASES)}`, { list: PHASES });
    if (!BASES.includes(input.basis)) return refusal("UNKNOWN_BASIS", `basis is one of ${list(BASES)}`, { list: BASES });
    const stage = input.stage === undefined || input.stage === null || input.stage === "" ? null : input.stage;
    if (input.phase === "actual" && stage === null)
      return refusal("NO_STAGE", `an actual amount names its stage: one of ${list(STAGE_FAMILIES[input.kind])} for ${input.kind}`);
    if (input.phase !== "actual" && stage !== null)
      return refusal("STAGE_NOT_ACTUAL", `only an actual amount has a stage; this one is ${input.phase}`);
    if (stage !== null && !STAGE_FAMILIES[input.kind].includes(stage))
      return refusal("UNKNOWN_STAGE", `a ${input.kind} takes a stage of ${list(STAGE_FAMILIES[input.kind])}`,
        { list: STAGE_FAMILIES[input.kind] });
    const period = this.#period(input.period, view);
    if (period.ok === false) return period;
    const codes = input.codes === undefined || input.codes === null ? [] : input.codes;
    const schemes = new Set((Array.isArray(view.classification_schemes) ? view.classification_schemes : []).map((s) => s && s.scheme));
    if (!Array.isArray(codes)) return refusal("UNKNOWN_CODE_SCHEME", "codes are a list of {scheme, code}");
    for (const c of codes) {
      if (!isObj(c) || !filled(c.code) || !schemes.has(c.scheme))
        return refusal("UNKNOWN_CODE_SCHEME", `a code names one of the active profiles' classification schemes`
          + `${schemes.size ? ` (${list([...schemes])})` : " (they hold none)"} and its code`,
          { scheme: isObj(c) ? c.scheme ?? null : null });
    }
    const parties = {};
    for (const end of ["from", "to"]) {
      const p = input[end];
      if (p === undefined || p === null) { parties[end] = null; continue; }
      if (!isObj(p)) return refusal("UNKNOWN_FIELD", `the party ${end} is {entity?, fund?, account?, as_written}`, { field: end });
      parties[end] = p;
    }
    const balanceClass = input.balance_class === undefined || input.balance_class === null ? null : input.balance_class;
    if (balanceClass !== null) {
      const fund = [parties.to, parties.from].map((p) => p && p.fund).find(filled) || null;
      const type = fund ? this.fundTypeOf(fund) : null;
      const family = type ? BALANCE_FAMILIES[type] : null;
      if (input.kind !== "balance" || !family || !family.includes(balanceClass))
        return refusal("BALANCE_CLASS_NOT_IN_FAMILY", input.kind !== "balance" ? "only a balance carries a balance class"
          : !fund ? "a balance class is read against a fund a party names, and none is named"
          : !type ? `no type is held for the fund ${fund}, so its balance-class family is not known (setFundType)`
          : `a ${type} fund's classes are ${list(family)}`, { fund, fund_type: type });
    }
    const ent = this.#ent();
    for (const end of ["from", "to"]) {
      const p = parties[end];
      if (!p) continue;
      for (const k of ["entity", "fund"]) if (p[k] !== undefined && p[k] !== null) {
        if (!filled(p[k]) || !ent.has(p[k])) return noSuchEntityAt(ent, p[k], `${end}.${k}`);
        if (k === "fund" && kindOf(ent, p[k]) !== "fund")
          return refusal("NOT_A_FUND", `${end}.fund names ${p[k]}, which is not registered as a fund`, { end });
      }
      if (p.as_written !== undefined && p.as_written !== null && typeof p.as_written !== "string")
        return refusal("UNKNOWN_FIELD", `${end}.as_written is the party's name as the source writes it`, { field: "as_written" });
    }
    const concerns = input.concerns === undefined || input.concerns === null ? [] : input.concerns;
    if (!Array.isArray(concerns)) return refusal("CONCERNS_UNKNOWN", "concerns is a list of ids");
    const refs = [];
    for (const id of concerns) {
      if (typeof id !== "string") return refusal("CONCERNS_UNKNOWN", "each id concerned is a string");
      if (id.startsWith("DUT-")) { refs.push({ id, kind: "duty" }); continue; }
      if (isHypothesisId(id)) { refs.push({ id, kind: "hypothesis" }); continue; }
      if (id.startsWith("EVT-")) {
        if (!this.#events || typeof this.#events.has !== "function" || !this.#events.has(id))
          return refusal("NO_SUCH_EVENT", `${id} is not an event the record holds${this.#events ? "" : " (events is not wired here)"}`, { event_id: id });
        refs.push({ id, kind: "event" });
      } else if (id.startsWith("ENT-")) {
        if (!ent.has(id)) return noSuchEntityAt(ent, id, "concerns");
        const k = kindOf(ent, id);
        if (!CONCERNS_KINDS.includes(k))
          return refusal("CONCERNS_KIND", `a money fact concerns an entity of kind ${list(CONCERNS_KINDS)}; ${id} is a ${k}`, { entity_id: id });
        refs.push({ id, kind: "entity" });
      } else if (id.startsWith("LIN-")) {
        if (!this.#lines || typeof this.#lines.has !== "function" || !this.#lines.has(id))
          return refusal("NO_SUCH_LINE", `${id} is not a line the record holds${this.#lines ? "" : " (lines is not wired here)"}`, { line_id: id });
        refs.push({ id, kind: "line" });
      } else {
        return refusal("CONCERNS_UNKNOWN", "a money fact concerns events, entities of kind contract, fund, program or "
          + `proceeding, or lines; ${id.slice(0, 60)} is none of them`, { id });
      }
    }
    if (refs.some((r) => r.kind === "duty"))
      return refusal("CONCERNS_DUTY", "a money fact never names a duty; the duty names the fact it cites", { id: refs.find((r) => r.kind === "duty").id });

    /* R2: the one source. */
    const src = this.#source(input.source, who);
    if (src.ok === false) return src;
    let adjusts = null;
    if (input.adjusts !== undefined && input.adjusts !== null) {
      if (!this.#factRow(input.adjusts, who))
        return refusal("ADJUSTS_NOT_HELD", `the fact an adjustment names (${String(input.adjusts).slice(0, 60)}) is not held`);
      adjusts = input.adjusts;
    }

    /* R3: how the figure was read. */
    const method = input.method === undefined || input.method === null ? (isMachine(by) ? null : "typed") : input.method;
    if (!METHODS.includes(method))
      return refusal("NO_METHOD", `a figure states how it was read: ${list(METHODS)}${isMachine(by) ? "; a machine's write names its reading" : ""}`, { list: METHODS });
    if (method === "typed" && !isMember(by))
      return refusal("TYPED_NOT_MEMBER", "a typed transcription is a member's act; a machine's reading names its method");
    if (isMember(by) === false && !MACHINE_METHODS.includes(method) && by !== null)
      return refusal("NO_METHOD", `a machine's reading is one of ${list(MACHINE_METHODS)}`);

    /* R4: the machine writes only from an adopted table binding, every party by a scheme identifier (K1443). */
    let binding = null;
    if (isMachine(by)) {
      const b = input.binding;
      const lacks = [];
      if (!isObj(b) || !filled(b.id) || !isMember(b.adopted_by)) lacks.push("a table binding a member adopted ({id, adopted_by})");
      for (const end of ["from", "to"]) {
        const p = parties[end];
        const node = p && (p.entity || p.fund);
        if (!node) { lacks.push(`the party ${end} identified`); continue; }
        const idf = p.identifier;
        let held = null;
        try { held = isObj(idf) && typeof ent.entityByIdentifier === "function" ? ent.entityByIdentifier({ scheme: idf.scheme, id: idf.id }) : null; }
        catch { held = null; }
        const heldId = held && typeof held === "object" ? held.entity_id ?? held.entityId ?? null : held;
        if (heldId !== node) lacks.push(`the party ${end} identified by a scheme identifier its entity holds`);
      }
      if (lacks.length)
        return refusal("MACHINE_NEEDS_IDENTIFIERS", `a machine records a money fact only with ${list(lacks)}; anything else `
          + "is proposed to a member, never written", { lacks });
      binding = { id: b.id, adopted_by: b.adopted_by };
    }
    let buys = null;
    if (input.buys !== undefined && input.buys !== null) {
      if (!isObj(input.buys) || Object.keys(input.buys).some((k) => !BUYS_FIELDS.has(k))
          || (input.buys.quantity !== undefined && exactDecimal(input.buys.quantity) === null))
        return refusal("UNKNOWN_FIELD", "buys is {quantity, unit, what}, the quantity an exact decimal", { field: "buys" });
      buys = { ...input.buys };
    }
    return { ok: true, by, value, low, high, input, stage, period, codes, parties, balanceClass, refs, src, adjusts,
             method, binding, buys };
  }

  /* R2: exactly one source, never a calculation; held and visible to the writer. Answers the source with its grade
     (R3: the source's own, never raised) and the bundle whose sight the fact follows (R21). */
  #source(s, who) {
    const items = Array.isArray(s) ? s : s === undefined || s === null ? [] : [s];
    if (!items.length) return refusal("NO_SOURCE", "a money fact rests on exactly one source: a content extent or another money fact");
    if (items.length > 1) return refusal("TWO_SOURCES", "a money fact rests on exactly one source");
    const x = items[0];
    if (typeof x === "string" && x.startsWith("CALC-") || isObj(x) && Object.values(x).some((v) => typeof v === "string" && v.startsWith("CALC-"))
        || isObj(x) && x.calculation !== undefined)
      return refusal("SOURCE_IS_CALCULATION", "a calculation is never a money fact's source: its result is a calculation, "
        + "and the facts it read are the sources (K1468)");
    if (!isObj(x)) return refusal("NO_SOURCE", "a source is {capture_sha, extent}, {content_id} or {fact}");
    const k = Object.keys(x).find((f) => !SOURCE_FIELDS.has(f));
    if (k) return refusal("UNKNOWN_FIELD", `a source has no field ${k.slice(0, 40)}`, { field: k });
    const forms = [x.capture_sha !== undefined || x.extent !== undefined, x.content_id !== undefined, x.fact !== undefined]
      .filter(Boolean).length;
    if (forms === 0) return refusal("NO_SOURCE", "a source is {capture_sha, extent}, {content_id} or {fact}");
    if (forms > 1) return refusal("TWO_SOURCES", "a source is one of a content extent or a money fact, never both");
    const notHeld = (what) => refusal("SOURCE_NOT_HELD", `${what} is not held here, or not visible to the writer`);
    if (x.fact !== undefined) {
      const row = this.#factRow(x.fact, who);
      if (!row) return notHeld(`the money fact ${String(x.fact).slice(0, 60)}`);
      return { ok: true, fact: row.fact_id, grade: row.grade_reading, grade_basis: `the source fact ${row.fact_id}'s reading grade`,
               sight: row.sight_bundle };
    }
    let capture = x.capture_sha, extent = x.extent ?? { kind: "document" }, contentId = null;
    if (x.content_id !== undefined) {
      const c = typeof x.content_id === "string" ? this.#one(`SELECT capture_sha, extent FROM content WHERE content_id=?`, x.content_id) : null;
      if (!c) return notHeld(`the content ${String(x.content_id).slice(0, 64)}`);
      capture = c.capture_sha; contentId = x.content_id;
      try { extent = JSON.parse(c.extent); } catch { extent = { kind: "document" }; }
    }
    if (typeof capture !== "string" || !SHA_RE.test(capture)) return notHeld("the capture named");
    const bad = checkContentExtent(extent, {});
    /* Only the grammar is asked here: a bound the capture's reading does not hold is not a refusal (content R8). */
    if (bad && bad.ok === false && ["CONTENT_EXTENT_UNREADABLE", "CONTENT_EXTENT_NO_PRODUCER"].includes(bad.code)) return refusal("SOURCE_EXTENT_UNREADABLE", `the source's extent: ${bad.detail}`, { extent_code: bad.code });
    const reg = this.#one(`SELECT bundle_id FROM register WHERE capture_sha=?`, capture);
    if (!reg || !this.#visibleBundle(reg.bundle_id, who)) return notHeld(`the capture ${capture}`);
    let g = null;
    try { g = this.#prov() && typeof this.#prov().captureGrade === "function" ? this.#prov().captureGrade(capture) : null; } catch { g = null; }
    return { ok: true, capture, extent: JSON.parse(canonicalExtent(extent)), contentId, sight: reg.bundle_id,
             grade: g && typeof g.grade === "string" ? g.grade : null,
             grade_basis: g ? `${g.route ?? "unrecorded"} capture${g.determined === false ? ", not measured" : ""}` : "undetermined" };
  }

  #write(v, { projectedKey = null } = {}) {
    const at = this.#now();
    const { input, by, src, parties } = v;
    const minted = this.#record.allocId("MNY", at.slice(0, 4));
    if (!minted || minted.ok === false || !minted.id) return minted && minted.ok === false ? minted : refusal("MINT_EXHAUSTED", "no money fact id could be drawn");
    const id = minted.id;
    const signed = (d) => (input.sign === "-" ? negate(d) : d);
    const party = (p, k) => (p && p[k] !== undefined && p[k] !== null ? (k === "as_written" ? clip(p[k]) : k === "identifier" ? JSON.stringify(p[k]) : String(p[k])) : null);
    const row = {
      fact_id: id, amount: v.value === null ? null : signed(v.value),
      amount_low: v.low === null ? null : (input.sign === "-" ? negate(v.high) : v.low),
      amount_high: v.high === null ? null : (input.sign === "-" ? negate(v.low) : v.high),
      sign: input.sign, precision: input.precision, as_read: input.as_read, currency: input.currency.trim().toUpperCase(),
      kind: input.kind, phase: input.phase, stage: v.stage, adjusts: v.adjusts, basis: input.basis,
      period_from: v.period.from, period_to: v.period.to, period_precision: v.period.precision, period_zone: v.period.zone,
      period_start: v.period.start, period_end: v.period.end, period_key: v.period.key ?? null, period_body: v.period.body ?? null,
      from_entity: party(parties.from, "entity"), from_fund: party(parties.from, "fund"), from_account: party(parties.from, "account"),
      from_as_written: party(parties.from, "as_written"), from_identifier: party(parties.from, "identifier"),
      to_entity: party(parties.to, "entity"), to_fund: party(parties.to, "fund"), to_account: party(parties.to, "account"),
      to_as_written: party(parties.to, "as_written"), to_identifier: party(parties.to, "identifier"),
      balance_class: v.balanceClass, buys: v.buys ? JSON.stringify(v.buys) : null,
      source_capture: src.capture ?? null, source_extent: src.extent ? JSON.stringify(src.extent) : null,
      source_content_id: src.contentId ?? null, source_fact: src.fact ?? null,
      method: v.method, binding: v.binding ? JSON.stringify(v.binding) : null,
      grade_reading: src.grade ?? null, grade_basis: src.grade_basis ?? null,
      by, at, sight_bundle: src.sight ?? null, withdrawn_at: null, projected_key: projectedKey,
    };
    const gated = this.#record.storeGate("money", "money_facts", row, "insert");
    if (gated) return gated;
    const cols = Object.keys(row);
    this.#sql.exec(`INSERT INTO money_facts (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`, ...cols.map((c) => row[c]));
    for (const c of v.codes)
      this.#sql.exec(`INSERT OR IGNORE INTO money_codes (fact_id, scheme, code, sight_bundle) VALUES (?,?,?,?)`, id, c.scheme, String(c.code), row.sight_bundle);
    for (const r of v.refs) {
      const crow = { fact_id: id, ref_id: r.id, ref_kind: r.kind, sight_bundle: row.sight_bundle };
      const g = this.#record.storeGate("money", "money_concerns", crow, "insert");
      if (g) return g;
      this.#sql.exec(`INSERT OR IGNORE INTO money_concerns (fact_id, ref_id, ref_kind, sight_bundle) VALUES (?,?,?,?)`, id, r.id, r.kind, row.sight_bundle);
    }
    const told = this.#tell([{ factId: id, change: "added" }, ...(v.adjusts ? [{ factId: v.adjusts, change: "adjusted" }] : [])]);
    if (told) return told;
    return { ok: true, fact_id: id, at, grade: { reading: row.grade_reading } };
  }

  /* ---- R23: the change notice ---- */

  /** R23: a later module registers once; listeners run in the modules' total order inside the writing transaction. */
  onFactChanged(module, fn) {
    const refused = listenerRefusal(this.#listeners, module, fn);
    if (refused) return refused;
    this.#listeners.push({ module, fn, seq: this.#listeners.length });
    const rank = (m) => { const i = MODULE_ORDER.indexOf(m); return i === -1 ? Infinity : i; };
    this.#listeners.sort((a, b) => (rank(a.module) - rank(b.module)) || (a.seq - b.seq));
    return { ok: true, module };
  }
  #tell(notices) {
    for (const n of notices) for (const l of this.#listeners) {
      try { l.fn({ ...n }); } catch (e) {
        return refusal("LISTENER_FAILED", `${l.module}'s listener failed on ${n.change} of ${n.factId}: `
          + `${String(e && e.message ? e.message : e).slice(0, 200)}. Nothing was written.`, { module: l.module });
      }
    }
    return null;
  }

  /* ---- R5: facts projected from a capture's reading ride the promotion ---- */

  /** R5: joins promotion's step (its R39). A promoted bundle's `data/money.json`, `{facts: [...]}`, is checked by R1–R4
   *  before the write (a refusal refuses the promotion, naming the fact) and written after it, each fact once. */
  joinPromotion(promotion) {
    if (this.#stepped || !promotion || typeof promotion.registerStep !== "function") return false;
    const r = promotion.registerStep("money", {
      check: (c) => { for (const [i, f] of factsOf(c).entries()) { const v = this.#validate({ ...f, by: c.author ?? null }); if (v.ok === false) return { ...v, fact_index: i }; } return null; },
      project: (c) => {
        const written = [];
        for (const f of factsOf(c)) {
          const key = sha256HexSync(canonicalJson({ bundle: c.bundleId ?? null, fact: f }));
          if (this.#one(`SELECT 1 AS x FROM money_facts WHERE projected_key=?`, key)) continue;
          const v = this.#validate({ ...f, by: c.author ?? null });
          if (v.ok === false) return v;
          const w = this.#write(v, { projectedKey: key });
          if (w.ok === false) return w;
          written.push(w.fact_id);
        }
        return written.length ? { money_facts: written } : null;
      } });
    this.#stepped = !(r && r.ok === false);
    return this.#stepped;
  }

  /* ---- R7: withdrawal ---- */

  withdrawFact({ factId, reason, by } = {}) {
    if (!filled(reason)) return refusal("NO_REASON", "a withdrawal states why");
    const row = this.#factRow(factId);
    if (!row) return refusal("NO_SUCH_FACT", `no money fact ${String(factId ?? "").slice(0, 60)} is held`);
    if (row.withdrawn_at) return { ok: true, already: true, fact_id: row.fact_id };
    const at = this.#now();
    return this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO money_withdrawals (fact_id, reason, by, at, sight_bundle) VALUES (?,?,?,?,?)`,
        row.fact_id, clip(reason, REASON_MAX), by ?? null, at, row.sight_bundle);
      this.#sql.exec(`UPDATE money_facts SET withdrawn_at=? WHERE fact_id=?`, at, row.fact_id);
      const told = this.#tell([{ factId: row.fact_id, change: "withdrawn" }]);
      if (told) return told;
      return { ok: true, fact_id: row.fact_id, withdrawn: { by: by ?? null, at, reason: clip(reason, REASON_MAX) } };
    });
  }

  /* ---- R8: one fact ---- */

  readFact({ factId, viewer } = {}) {
    if (!filled(factId)) return refusal("NO_FACT", "a money fact is read by its id (MNY-...)");
    const row = this.#factRow(factId, viewer ?? "");
    if (!row) return { ok: true, found: false, fact_id: factId, fact: null };
    const g = this.#gate("f.sight_bundle", viewer ?? "");
    const adjustments = this.#rows(`SELECT f.fact_id FROM money_facts f WHERE f.adjusts=? AND (${g.sql}) ORDER BY f.at, f.fact_id`, row.fact_id, ...g.args).map((r) => r.fact_id);
    const citing = this.#rows(`SELECT f.fact_id FROM money_facts f WHERE f.source_fact=? AND (${g.sql}) ORDER BY f.at, f.fact_id`, row.fact_id, ...g.args).map((r) => r.fact_id);
    return { ok: true, found: true, fact: { ...this.#view_(row), adjustments, cited_by: citing } };
  }

  #view_(row) {
    const codes = this.#rows(`SELECT scheme, code FROM money_codes WHERE fact_id=? ORDER BY scheme, code`, row.fact_id);
    const concerns = this.#rows(`SELECT ref_id FROM money_concerns WHERE fact_id=? ORDER BY ref_id`, row.fact_id).map((r) => r.ref_id);
    const w = row.withdrawn_at ? this.#one(`SELECT reason, by, at FROM money_withdrawals WHERE fact_id=?`, row.fact_id) : null;
    const party = (p) => {
      const out = {};
      for (const k of ["entity", "fund", "account", "as_written"]) if (row[`${p}_${k}`] !== null) out[k] = row[`${p}_${k}`];
      if (row[`${p}_identifier`]) out.identifier = JSON.parse(row[`${p}_identifier`]);
      return Object.keys(out).length ? out : null;
    };
    const unsigned = (d) => (d && d.startsWith("-") ? d.slice(1) : d);
    const capture = this.#rootCapture(row);
    const source = row.source_fact ? { fact: row.source_fact }
      : { capture_sha: row.source_capture, extent: JSON.parse(row.source_extent), ...(row.source_content_id ? { content_id: row.source_content_id } : {}) };
    return {
      fact_id: row.fact_id,
      amount: row.precision === "range" ? { low: unsigned(row.sign === "-" ? row.amount_high : row.amount_low), high: unsigned(row.sign === "-" ? row.amount_low : row.amount_high) } : unsigned(row.amount),
      as_read: row.as_read, currency: row.currency, sign: row.sign, precision: row.precision, kind: row.kind, phase: row.phase,
      ...(row.stage ? { stage: row.stage } : {}), ...(row.adjusts ? { adjusts: row.adjusts } : {}), basis: row.basis,
      period: { from: row.period_from, to: row.period_to, precision: row.period_precision, zone: row.period_zone,
                ...(row.period_key ? { fiscal: row.period_key, body: row.period_body } : {}) },
      from: party("from"), to: party("to"), codes, ...(row.balance_class ? { balance_class: row.balance_class } : {}),
      ...(row.buys ? { buys: JSON.parse(row.buys) } : {}), concerns, source,
      citation: row.source_fact ? `money fact ${row.source_fact}`
        : `${describeExtent(JSON.parse(row.source_extent))} of capture ${row.source_capture}`,
      method: row.method, ...(row.binding ? { binding: JSON.parse(row.binding) } : {}),
      grade: { reading: row.grade_reading, reading_basis: row.grade_basis,
               parties: { from: this.#partyGrade(capture, row.from_entity ?? row.from_fund),
                          to: this.#partyGrade(capture, row.to_entity ?? row.to_fund) } },
      by: row.by, at: row.at, withdrawn: w ? { by: w.by, at: w.at, reason: w.reason } : null,
    };
  }
  /* The capture a fact finally rests on, through the facts it cites. */
  #rootCapture(row) {
    let r = row;
    for (let i = 0; r && i < SOURCE_DEPTH_MAX; i++) {
      if (r.source_capture) return r.source_capture;
      r = this.#one(`SELECT source_capture, source_fact FROM money_facts WHERE fact_id=?`, r.source_fact);
    }
    return null;
  }
  /* A party's entity resolution grade (Terms, `grade.parties`): the strongest resolution of that entity in the
     capture the fact rests on, read from entities' `resolutions` (its R35 read contract); null when none is held. */
  #partyGrade(capture, entityId) {
    if (!capture || !entityId) return null;
    let best = null;
    for (const r of this.#rows(`SELECT grade FROM resolutions WHERE capture_sha=? AND entity_id=?`, capture, entityId))
      if (best === null || (gradeRank[r.grade] ?? 0) > (gradeRank[best] ?? 0)) best = r.grade;
    return best;
  }

  /* ---- R9: an entity's money ---- */

  moneyOf({ entity, period, kinds, phases, limit, viewer } = {}) {
    if (!filled(entity)) return noEntity("an entity's money is read by the entity's id (moneyof&entity=ENT-...)");
    const n = Number.parseInt(limit ?? LIST_LIMIT_DEFAULT, 10);
    const lim = Number.isFinite(n) ? Math.min(Math.max(n, 1), LIST_LIMIT_MAX) : LIST_LIMIT_DEFAULT;
    const ks = toList(kinds), ps = toList(phases);
    for (const k of ks) if (!MONEY_KINDS.includes(k)) return refusal("UNKNOWN_MONEY_KIND", `kind is one of ${list(MONEY_KINDS)}`);
    for (const p of ps) if (!PHASES.includes(p)) return refusal("UNKNOWN_PHASE", `phase is one of ${list(PHASES)}`);
    let q = null;
    if (period !== undefined && period !== null && period !== "") {
      q = this.#period(typeof period === "string" ? safeJson(period) : period, this.#view());
      if (q.ok === false) return q;
    }
    const g = this.#gate("f.sight_bundle", viewer ?? "");
    const rows = this.#rows(`SELECT f.* FROM money_facts f
       WHERE f.withdrawn_at IS NULL AND (f.from_entity=? OR f.from_fund=? OR f.to_entity=? OR f.to_fund=?
             OR f.fact_id IN (SELECT fact_id FROM money_concerns WHERE ref_id=?))
         ${ks.length ? `AND f.kind IN (${ks.map(() => "?").join(",")})` : ""}
         ${ps.length ? `AND f.phase IN (${ps.map(() => "?").join(",")})` : ""}
         AND (${g.sql})
       ORDER BY f.period_start, f.fact_id`, entity, entity, entity, entity, entity, ...ks, ...ps, ...g.args);
    const facts = [], undetermined = [];
    let truncated = false;
    for (const r of rows) {
      const o = q ? Money.#overlap({ start: r.period_start, end: r.period_end }, q) : true;
      if (o === false) continue;
      const into = o === true ? facts : undetermined;
      if (into.length >= lim) { truncated = true; continue; }
      into.push(this.#view_(r));
    }
    return { ok: true, entity, count: facts.length, facts, undetermined,
             ...(undetermined.length ? { undetermined_why: "these facts' periods state no end, so whether they overlap the period asked is not settled" } : {}),
             limit: lim, truncated, says: "facts, never a total" };
  }

  /* ---- R10: the summation rule ---- */

  summable({ factIds, viewer } = {}) {
    const got = this.#facts(factIds, viewer);
    if (got.ok === false) return got;
    const rows = got.rows;
    const value = (r, dim) => (dim === "period" ? `${r.period_start}/${r.period_end ?? ""}` : r[dim] ?? null);
    for (const [dim, code] of SUM_RULE) {
      const a = rows[0];
      const b = rows.find((r) => value(r, dim) !== value(a, dim));
      if (b) {
        const show = (r) => (dim === "period" ? { from: r.period_from, to: r.period_to, precision: r.period_precision, zone: r.period_zone } : r[dim] ?? null);
        return refusal(code, `these facts differ in ${dim === "phase" || dim === "stage" ? "phase or stage" : dim}: `
          + `${a.fact_id} and ${b.fact_id}; a sum is taken only over one kind, phase and stage, basis, currency and period`,
          { dimension: dim, facts: [a.fact_id, b.fact_id], values: [show(a), show(b)] });
      }
    }
    const interfund = rows.filter((r) => r.kind === "transfer" && r.from_fund && r.to_fund)
      .map((r) => ({ fact_id: r.fact_id, from_fund: r.from_fund, to_fund: r.to_fund, interfund: true,
                     says: "a transfer between two funds; a sum across both funds nets it" }));
    return { ok: true, interfund, says: "these facts may be summed; the sum is a calculation, never stored here" };
  }
  #facts(ids, viewer) {
    if (!Array.isArray(ids) || !ids.length) return refusal("NO_FACTS", "name the money facts by their ids");
    const rows = [];
    for (const id of ids) {
      const r = this.#factRow(id, viewer === undefined ? null : viewer);
      if (!r) return refusal("NO_SUCH_FACT", `no money fact ${String(id).slice(0, 60)} is held`, { fact_id: id });
      if (r.withdrawn_at) return refusal("FACT_WITHDRAWN", `${r.fact_id} is withdrawn and is never counted`, { fact_id: r.fact_id });
      rows.push(r);
    }
    return { ok: true, rows };
  }

  /* ---- R11: reconciliation ---- */

  reconcile({ a, b, viewer } = {}) {
    const got = this.#facts([a, b], viewer);
    if (got.ok === false) return got;
    const [x, y] = got.rows;
    const differs = [];
    const push = (dimension, va, vb) => differs.push({ dimension, a: va, b: vb });
    if (x.basis !== y.basis) push("basis", x.basis, y.basis);
    if (x.period_start !== y.period_start || x.period_end !== y.period_end)
      push("period", { from: x.period_from, to: x.period_to }, { from: y.period_from, to: y.period_to });
    if (x.kind !== y.kind) push("kind", x.kind, y.kind);
    if (x.phase !== y.phase || x.stage !== y.stage) push("phase or stage", { phase: x.phase, stage: x.stage }, { phase: y.phase, stage: y.stage });
    if (x.currency !== y.currency) push("currency", x.currency, y.currency);
    const ends = (r) => ({ from: r.from_entity ?? r.from_fund ?? null, to: r.to_entity ?? r.to_fund ?? null });
    if (canonicalJson(ends(x)) !== canonicalJson(ends(y))) push("parties", ends(x), ends(y));
    const ix = interval(x), iy = interval(y);
    const overlap = cmpD(ix.hi, iy.lo) >= 0 && cmpD(iy.hi, ix.lo) >= 0;
    const equal = x.precision !== "range" && y.precision !== "range" && x.amount === y.amount;
    const amounts = equal ? "equal" : overlap ? "within the coarser fact's precision" : "differ";
    if (!overlap) {
      if (x.precision !== y.precision) push("rounding", x.precision, y.precision);
      else push("amount", x.amount ?? { low: x.amount_low, high: x.amount_high }, y.amount ?? { low: y.amount_low, high: y.amount_high });
    }
    return { ok: true, a: x.fact_id, b: y.fact_id, consistent: differs.length === 0, amounts, differs,
             says: differs.length ? "the two readings differ in the dimensions named" : "the two readings are consistent" };
  }

  /* ---- R12, R13: money sets ---- */

  createSet({ purpose, label, concerns, by } = {}) {
    if (!SET_PURPOSES.includes(purpose)) return refusal("UNKNOWN_PURPOSE", `a money set's purpose is ${list(SET_PURPOSES)}`);
    if (!filled(label)) return refusal("NO_LABEL", "a money set has a label a person can read");
    let c = null;
    if (purpose === "attribution") {
      const ent = this.#ent();
      if (!filled(concerns) || !ent.has(concerns) || kindOf(ent, concerns) !== "contract")
        return refusal("NO_CONTRACT", "an attribution set concerns one registered entity of kind contract");
      c = concerns;
    } else if (concerns !== undefined && concerns !== null && concerns !== "") {
      if (typeof concerns !== "string") return refusal("NO_LABEL", "a trail concerns one id, or none");
      c = concerns;
    }
    const at = this.#now();
    return this.#record.transact(() => {
      const { id } = this.#record.allocId("MSR", at.slice(0, 4));
      this.#sql.exec(`INSERT INTO money_sets (set_id, purpose, label, concerns, by, at) VALUES (?,?,?,?,?,?)`, id, purpose, clip(label), c, by ?? null, at);
      return { ok: true, set_id: id, purpose, label: clip(label), concerns: c, at };
    });
  }
  include(args = {}) { return this.#setAct("include", args); }
  exclude(args = {}) { return this.#setAct("exclude", args); }
  #setAct(act, { setId, factId, reason, by } = {}) {
    if (!isMember(by)) return refusal("MEMBER_ACT_ONLY", `to ${act} a fact is a member's act; a machine proposes (proposeInclusion)`);
    if (!filled(reason)) return refusal("NO_REASON", `to ${act} a fact states why`);
    const set = filled(setId) ? this.#one(`SELECT * FROM money_sets WHERE set_id=?`, setId) : null;
    if (!set) return refusal("NO_SUCH_SET", `no money set ${String(setId ?? "").slice(0, 60)} is held`);
    const fact = this.#factRow(factId, by);
    if (!fact) return refusal("NO_SUCH_FACT", `no money fact ${String(factId ?? "").slice(0, 60)} is held`);
    const at = this.#now();
    return this.#record.transact(() => {
      const open = act === "include" ? this.#one(`SELECT proposal_id FROM money_set_proposals WHERE set_id=? AND fact_id=? AND adopted_act IS NULL ORDER BY proposal_id LIMIT 1`, setId, fact.fact_id) : null;
      this.#sql.exec(`INSERT INTO money_set_acts (set_id, fact_id, act, reason, by, at, proposal_id) VALUES (?,?,?,?,?,?,?)`,
        setId, fact.fact_id, act, clip(reason, REASON_MAX), by, at, open ? open.proposal_id : null);
      const actId = this.#one(`SELECT max(act_id) AS id FROM money_set_acts`).id;
      if (open) this.#sql.exec(`UPDATE money_set_proposals SET adopted_act=? WHERE proposal_id=?`, actId, open.proposal_id);
      const told = this.#tell([{ factId: fact.fact_id, change: "set_changed", setId }]);
      if (told) return told;
      return { ok: true, set_id: setId, fact_id: fact.fact_id, act, by, at, ...(open ? { adopted_proposal: open.proposal_id } : {}) };
    });
  }
  proposeInclusion({ setId, factId, method, by } = {}) {
    if (!filled(method)) return refusal("NO_METHOD", "a proposal names the method that proposed it");
    const set = filled(setId) ? this.#one(`SELECT 1 AS x FROM money_sets WHERE set_id=?`, setId) : null;
    if (!set) return refusal("NO_SUCH_SET", `no money set ${String(setId ?? "").slice(0, 60)} is held`);
    const fact = this.#factRow(factId, by ?? "");
    if (!fact) return refusal("NO_SUCH_FACT", `no money fact ${String(factId ?? "").slice(0, 60)} is held`);
    const at = this.#now();
    this.#sql.exec(`INSERT INTO money_set_proposals (set_id, fact_id, method, by, at) VALUES (?,?,?,?,?)`, setId, fact.fact_id, clip(method), by ?? null, at);
    return { ok: true, set_id: setId, fact_id: fact.fact_id, proposal_id: this.#one(`SELECT max(proposal_id) AS id FROM money_set_proposals`).id,
             says: "held apart as a proposal; nothing is included until a member includes it" };
  }
  readSet({ setId, viewer, at } = {}) {
    if (!filled(setId)) return refusal("NO_SET", "a money set is read by its id (MSR-...)");
    const set = this.#one(`SELECT * FROM money_sets WHERE set_id=?`, setId);
    if (!set) return { ok: true, found: false, set_id: setId };
    const st = this.#setState(setId, viewer ?? "", at);
    const props = this.#rows(`SELECT * FROM money_set_proposals WHERE set_id=? AND adopted_act IS NULL ORDER BY proposal_id`, setId)
      .filter((p) => this.#factRow(p.fact_id, viewer ?? ""))
      .map((p) => ({ proposal_id: p.proposal_id, fact_id: p.fact_id, method: p.method, by: p.by, at: p.at, label: "proposed by the machine; not included" }));
    return { ok: true, found: true, set: { set_id: set.set_id, purpose: set.purpose, label: set.label, concerns: set.concerns, by: set.by, at: set.at },
             inclusions: st.inclusions, exclusions: st.exclusions, proposals: props };
  }
  /* The latest act on each fact governs; every earlier one is kept (R12). */
  #setState(setId, viewer, at = null) {
    const acts = this.#rows(`SELECT * FROM money_set_acts WHERE set_id=? ${at ? "AND at <= ?" : ""} ORDER BY act_id`, setId, ...(at ? [at] : []));
    const latest = new Map(), history = new Map();
    for (const a of acts) {
      latest.set(a.fact_id, a);
      history.set(a.fact_id, [...(history.get(a.fact_id) || []), { act: a.act, reason: a.reason, by: a.by, at: a.at }]);
    }
    const inclusions = [], exclusions = [];
    for (const [fid, a] of latest) {
      if (!this.#factRow(fid, viewer)) continue;
      const e = { fact_id: fid, reason: a.reason, by: a.by, at: a.at, history: history.get(fid) };
      (a.act === "include" ? inclusions : exclusions).push(e);
    }
    return { inclusions, exclusions };
  }

  /* ---- R14: committed against paid ---- */

  committedAgainstPaid({ contract, at, viewer } = {}) {
    if (!filled(contract)) return noEntity("committed against paid is read for one contract (committedagainstpaid&contract=ENT-...)");
    const ent = this.#ent();
    if (!ent.has(contract) || kindOf(ent, contract) !== "contract")
      return refusal("NOT_A_CONTRACT", `${contract.slice(0, 60)} is not a registered contract`);
    const v = viewer ?? "";
    const asOf = filled(at) ? at : null;
    /* As of `at`: a fact recorded by then and not withdrawn by then. */
    const live = (r) => !!r && (!asOf || r.at <= asOf) && (!r.withdrawn_at || (!!asOf && r.withdrawn_at > asOf));
    const concerning = (refId, stage) => this.#rows(`SELECT f.* FROM money_facts f JOIN money_concerns c ON c.fact_id=f.fact_id
        WHERE c.ref_id=? AND f.phase='actual' AND f.stage=? ORDER BY f.period_start, f.fact_id`, refId, stage)
      .filter((r) => live(r) && this.#visibleBundle(r.sight_bundle, v));
    let committed;
    if (!this.#events) committed = { undetermined: true, why: "events is not wired here, so the award and its change orders are not read" };
    else {
      const awards = (this.#events.eventsFor({ entity: contract, kinds: ["award"], limit: LIST_LIMIT_MAX, viewer: v })?.events || []).map((e) => e.event_id);
      const rows = [], seen = new Set();
      const take = (r, label) => { if (!seen.has(r.fact_id)) { seen.add(r.fact_id); rows.push({ r, label }); } };
      for (const award of awards) {
        for (const r of concerning(award, "encumbered")) take(r, `committed at the award ${award}`);
        for (const rel of this.#relations(award, "amends", "in", v))
          for (const r of concerning(rel.from, "encumbered")) take(r, `a change order ${rel.from} that amends the award ${award}`);
      }
      committed = this.#side(rows, v);
      committed.awards = awards;
    }
    const paidRows = [], seenPaid = new Set();
    for (const r of concerning(contract, "paid")) { seenPaid.add(r.fact_id); paidRows.push({ r, label: "paid, concerning the contract" }); }
    for (const s of this.#rows(`SELECT set_id FROM money_sets WHERE purpose='attribution' AND concerns=? ORDER BY set_id`, contract))
      for (const inc of this.#setState(s.set_id, v, asOf).inclusions) {
        const r = this.#factRow(inc.fact_id, v);
        if (!r || seenPaid.has(r.fact_id) || !live(r)) continue;
        if (!(r.phase === "actual" && r.stage === "paid")) continue;
        seenPaid.add(r.fact_id);
        paidRows.push({ r, label: `attributed by a member, reason: ${inc.reason}`, set_id: s.set_id });
      }
    const paid = this.#side(paidRows, v);
    let difference;
    if (committed.undetermined || paid.refused || committed.refused || !committed.sum || !paid.sum)
      difference = { undetermined: true, why: committed.undetermined ? committed.why : committed.refused || paid.refused ? "a side's sum is refused by the summation rule" : "a side holds no fact, and an absent sum is never zero" };
    else {
      const d = subtract(committed.sum, paid.sum);
      difference = d.refused ? { ...d } : { figure: d, says: "committed less paid, a figure; computed here and not stored" };
    }
    return { ok: true, contract, at: asOf, committed, paid, difference };
  }
  /* One side: its facts and their sum through calc-grammar, under R10's rule (a refused sum is answered as such). */
  #side(entries, viewer) {
    const facts = entries.map(({ r, label, set_id }) => ({ ...this.#view_(r), label, ...(set_id ? { set_id } : {}) }));
    if (!entries.length) return { facts, sum: null, says: "no fact is held on this side" };
    const ok = this.summable({ factIds: entries.map((e) => e.r.fact_id), viewer });
    if (ok.ok === false) return { facts, sum: null, refused: ok };
    let sum = null;
    for (const { r } of entries) {
      const f = figureOf(r);
      sum = sum === null ? f : add(sum, f);
      if (sum.refused) return { facts, sum: null, refused: sum };
    }
    return { facts, sum, says: "summed through calc-grammar; not stored" };
  }
  /* Events' relations of one kind at an event, from its read (events R26): in or out. */
  #relations(eventId, kind, direction, viewer) {
    if (!this.#events || typeof this.#events.readEvent !== "function") return [];
    let r;
    try { r = this.#events.readEvent({ eventId, viewer }); } catch { return []; }
    const rels = r && r.found && r.event && Array.isArray(r.event.relations) ? r.event.relations : [];
    return rels.filter((x) => x && x.kind === kind && x.direction === direction && !x.withdrawn);
  }

  /* ---- R15: the chain of authority ---- */

  authorityChain({ factId, viewer } = {}) {
    if (!filled(factId)) return refusal("NO_FACT", "a chain of authority is read for one money fact (MNY-...)");
    const row = this.#factRow(factId, viewer ?? "");
    if (!row) return { ok: true, found: false, fact_id: factId };
    const events = this.#rows(`SELECT ref_id FROM money_concerns WHERE fact_id=? AND ref_kind='event' ORDER BY ref_id`, row.fact_id).map((r) => r.ref_id);
    if (!events.length) return { ok: true, found: true, fact_id: row.fact_id, chains: [], says: "the fact concerns no event, so no chain of authority is read" };
    if (!this.#events) return { ok: true, found: true, fact_id: row.fact_id, chains: [], undetermined: true, why: "events is not wired here" };
    const chains = events.map((e) => this.#walk(e, viewer ?? ""));
    return { ok: true, found: true, fact_id: row.fact_id, chains };
  }
  #walk(start, viewer) {
    const hops = [], seen = new Set([start]);
    let frontier = [start], depth = 0, stop = null;
    while (frontier.length && !stop) {
      if (depth >= BOUNDS.depth_default) { stop = "depth"; break; }
      const next = [];
      for (const node of frontier) {
        const rels = this.#relations(node, "authorises", "in", viewer);
        if (rels.length > BOUNDS.fanout) { stop = "fanout"; break; }
        for (const rel of rels) {
          hops.push({ from: rel.from, to: node, relation_id: rel.relation_id ?? null, kind: "authorises",
                      citation: rel.attestation ?? null, grade: rel.grade ?? null });
          if (!seen.has(rel.from)) {
            seen.add(rel.from); next.push(rel.from);
            if (seen.size > BOUNDS.nodes) { stop = "nodes"; break; }
          }
        }
        if (stop) break;
      }
      frontier = next; depth += 1;
    }
    const out = { event_id: start, hops, authorising_held: hops.length > 0,
                  says: hops.length ? "the authorising events held toward this event" : "no authorising event is held for this event" };
    return stop ? { ...out, ...exhausted({ visited: seen.size, reason: stop }) } : out;
  }

  /* ---- R16: the connection owner ---- */

  /** R16: registers once with a registry (the plane's default when none is given), owner `money`. */
  registerConnections(registry = defaultRegistry) {
    if (this.#registered) return { ok: true, already: true };
    const r = registry.registerOwner({ owner: "money", kinds: Money.CONNECTION_KINDS, neighbours: (a) => this.neighbours(a) });
    if (r && r.ok) this.#registered = true;
    return r;
  }
  static CONNECTION_KINDS = Object.freeze([Object.freeze({ kind: CONNECTION_KIND, word: CONNECTION_WORD, class: "evidentiary" })]);

  /** R16: each fact as one edge from payer to payee (entity, else fund), valid over its period, as of `at`. */
  neighbours({ node, kinds, at, page, viewer } = {}) {
    if (viewer === undefined || viewer === null || viewer === "")
      return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
    if (Array.isArray(kinds) && !kinds.includes(CONNECTION_KIND)) return { items: [] };
    if (!filled(node)) return { items: [] };
    const g = this.#gate("f.sight_bundle", viewer);
    const rows = this.#rows(`SELECT f.* FROM money_facts f WHERE f.withdrawn_at IS NULL
        AND COALESCE(f.from_entity, f.from_fund) IS NOT NULL AND COALESCE(f.to_entity, f.to_fund) IS NOT NULL
        AND (f.fact_id IN (SELECT fact_id FROM money_facts WHERE from_entity=? OR (from_entity IS NULL AND from_fund=?)
                           UNION SELECT fact_id FROM money_facts WHERE to_entity=? OR (to_entity IS NULL AND to_fund=?)))
        AND (${g.sql}) ORDER BY f.fact_id`, node, node, node, node, ...g.args);
    if (rows.length > BOUNDS.hub) return { items: [], hub: { set_size: rows.length, why: `more than ${BOUNDS.hub} money facts name this node` } };
    const items = [];
    for (const r of rows) {
      const valid = { from: r.period_from, to: r.period_to, precision: r.period_precision, zone: r.period_zone };
      let v;
      try { v = validAt({ valid }, at); } catch (e) { v = { undetermined: true, why: String(e && e.message ? e.message : e) }; }
      if (v === "out") continue;
      if (v && v.refused) continue;
      const capture = this.#rootCapture(r);
      const ends = [this.#partyGrade(capture, r.from_entity ?? r.from_fund), this.#partyGrade(capture, r.to_entity ?? r.to_fund)];
      items.push({
        id: r.fact_id, from: r.from_entity ?? r.from_fund, to: r.to_entity ?? r.to_fund, kind: CONNECTION_KIND, owner: "money",
        valid, evidence: [r.source_fact ? { source: r.source_fact } : { source: r.source_capture, extent: JSON.parse(r.source_extent) }],
        grade: { assertion: r.grade_reading ?? LOWEST_GRADE, ends: ends.map((x) => x ?? LOWEST_GRADE) },
        derived: null,
        money: { kind: r.kind, phase: r.phase, ...(r.stage ? { stage: r.stage } : {}), fund: r.from_fund ?? r.to_fund ?? null,
                 period: valid, grades_stated: { reading: r.grade_reading, ends } },
        ...(v === "in" ? {} : { undetermined: { why: v.why } }),
      });
    }
    const after = isObj(page) && typeof page.after === "string" ? page.after : null;
    const start = after ? items.findIndex((i) => i.id > after) : 0;
    const from = start === -1 ? items.length : start;
    const slice = items.slice(from, from + BOUNDS.fanout);
    const more = from + BOUNDS.fanout < items.length;
    return { items: slice, ...(more ? { next: { after: slice[slice.length - 1].id } } : {}) };
  }

  /* ---- fund types (Terms, `balance_class`; K1505 (10)) ---- */

  /** A fund's type, held here with its history; the latest governs. */
  setFundType({ fund, type, basis, by } = {}) {
    if (!FUND_TYPES.includes(type)) return refusal("UNKNOWN_FUND_TYPE", `a fund's type is ${list(FUND_TYPES)}`, { list: FUND_TYPES });
    if (!filled(basis)) return refusal("NO_BASIS", "a fund's type names its basis: the source that states it");
    const ent = this.#ent();
    if (!filled(fund) || !ent.has(fund)) return noSuchEntityAt(ent, fund, "fund");
    if (kindOf(ent, fund) !== "fund") return refusal("NOT_A_FUND", `${fund} is not registered as a fund`);
    const at = this.#now();
    this.#sql.exec(`INSERT INTO money_fund_types (fund, fund_type, basis, by, at) VALUES (?,?,?,?,?)`, fund, type, clip(basis), by ?? null, at);
    return { ok: true, fund, type, at, family: BALANCE_FAMILIES[type] };
  }
  fundTypeOf(fund) {
    const r = filled(fund) ? this.#one(`SELECT fund_type FROM money_fund_types WHERE fund=? ORDER BY seq DESC LIMIT 1`, fund) : null;
    return r ? r.fund_type : null;
  }

  /* ---- R17: the closed lists ---- */

  kinds() { return MONEY_KINDS; }
  phases() { return PHASES; }
  stages() { return STAGES; }
  bases() { return BASES; }
  precisions() { return PRECISIONS; }
}

/* ---- helpers ---- */

function dec(s) {
  const [i, f = ""] = s.replace(/,/g, "").split(".");
  return { n: BigInt(i + f), s: f.length };
}
function toList(v) {
  if (v === undefined || v === null || v === "") return [];
  return (Array.isArray(v) ? v : String(v).split(",")).map((x) => String(x).trim()).filter(Boolean);
}
function safeJson(s) { try { return JSON.parse(s); } catch { return s; } }
function kindOf(ent, id) {
  try { const r = ent.readEntity({ entityId: id }); return r && r.found && r.entity ? r.entity.kind : null; } catch { return null; }
}
/* entities' one answer to an unregistered id (its R36), naming where it was named. */
function noSuchEntityAt(_ent, id, end) {
  return noSuchEntity(typeof id === "string" ? id : null, { end });
}

/* A fact's figure for calc-grammar (R14): signed, with its precision and currency. */
function figureOf(r) {
  if (r.precision === "range")
    return { low: r.amount_low, high: r.amount_high, sign: r.amount_low.startsWith("-") ? "-" : "+", precision: "range", currency: r.currency };
  const neg = r.amount.startsWith("-");
  return { value: neg ? r.amount.slice(1) : r.amount, sign: neg ? "-" : "+", precision: r.precision, currency: r.currency };
}
/* The interval a fact's amount may stand for (R11): a rounded or approximate figure stands for half its printed unit
   either side, a range for its bounds, an exact figure for itself. */
function interval(r) {
  const f = figureOf(r);
  if (f.precision === "approximate") f.precision = "rounded";
  const x = readingOf(f);
  return { lo: x.lo, hi: x.hi };
}
/* R5: the facts a promoted bundle carries in `data/money.json`. */
function factsOf(c) {
  const files = c && Array.isArray(c.files) ? c.files : [];
  const f = files.find((x) => x && x.path === "data/money.json");
  if (!f || typeof f.text !== "string") return [];
  try { const j = JSON.parse(f.text); return Array.isArray(j.facts) ? j.facts.filter(isObj) : []; } catch { return []; }
}

/* ---- R20: the one-home checks at the store's gate ---- */

const HAS_ID_FIELDS = ["adjusts", "from_entity", "from_fund", "to_entity", "to_fund", "source_fact", "by"];
function factGate(row) {
  const sources = [row.source_capture, row.source_fact].filter((x) => x !== null && x !== undefined);
  if (sources.length !== 1) return { code: "ONE_SOURCE", detail: "a money fact rests on exactly one source" };
  if ([row.source_capture, row.source_fact, row.source_content_id].some((x) => typeof x === "string" && x.startsWith("CALC-")))
    return { code: "SOURCE_IS_CALCULATION", detail: "a calculation is never a money fact's source" };
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string" && isHypothesisId(v)) return { code: "HYPOTHESIS_ID", detail: `a hypothesis is never named in a money fact (${k})` };
    if (/total|sum/i.test(k)) return { code: "TOTAL_NOT_STORED", detail: "a total is a calculation, never stored as a money fact" };
  }
  for (const k of HAS_ID_FIELDS) if (typeof row[k] === "string" && row[k].startsWith("DUT-"))
    return { code: "CONCERNS_DUTY", detail: "a duty is never named in a money fact" };
  return null;
}
function concernsGate(row) {
  if (typeof row.ref_id === "string" && row.ref_id.startsWith("DUT-")) return { code: "CONCERNS_DUTY", detail: "a money fact never concerns a duty" };
  if (typeof row.ref_id === "string" && isHypothesisId(row.ref_id)) return { code: "HYPOTHESIS_ID", detail: "a hypothesis is never named in a money fact" };
  return null;
}

/* ---- R18: the ops map ---- */

/** R18: one route arm per act and read, on entities R40's pattern: parameters from `url`'s query (the control plane's
 *  stamps among them), acts' arguments from the body. Every write goes through R1's one append site. */
export function moneyOps(money, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const ids = (k) => (q(k) || "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    moneyrecord: () => money.recordFact(b),
    moneywithdraw: () => money.withdrawFact(b),
    money: () => money.readFact({ factId: q("id"), viewer: q("viewer") }),
    moneyof: () => money.moneyOf({ entity: q("entity"), period: q("period"), kinds: q("kinds"), phases: q("phases"),
                                   limit: q("limit"), viewer: q("viewer") }),
    moneysummable: () => money.summable({ factIds: ids("ids"), viewer: q("viewer") }),
    moneyreconcile: () => money.reconcile({ a: q("a"), b: q("b"), viewer: q("viewer") }),
    moneysetcreate: () => money.createSet(b),
    moneyset: () => money.readSet({ setId: q("id"), viewer: q("viewer") }),
    moneysetinclude: () => money.include(b),
    moneysetexclude: () => money.exclude(b),
    moneysetpropose: () => money.proposeInclusion(b),
    moneyfundtype: () => money.setFundType(b),
    committedagainstpaid: () => money.committedAgainstPaid({ contract: q("contract"), at: q("at"), viewer: q("viewer") }),
    authoritychain: () => money.authorityChain({ factId: q("id"), viewer: q("viewer") }),
  };
}
