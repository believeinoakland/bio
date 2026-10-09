/* ai-use — what each AI account has spent and may spend (requirements: `build/requirements/ai-use.md`, R1–R13). A new
 * module of layer 6, directly before `ai-runs` (K657, K1043; N812, K2373). Built by copy (K624): the counter, the use
 * figures' checks and the reads come from `ai-runs/index.mjs`:2588–2932 (its R48–R51), re-keyed by the paying account
 * (`owner`) and the kind of use (B8); `ai-runs`' own job deletes its copy and re-points after this module merges. The
 * member ceilings of that block are replaced by the account limits (R2, B4), judged per account (R3, D38, D39, B5); the
 * reads, the told-once reach (R5), the exploring gate and its daily ask (R6, R9; A5, K2350), the cost before and after
 * (R10, R11; D12) and each account's limits panel (R12; DEC-188) are new.
 *
 * It holds no credential and never chooses which account pays (`credentials`' R56): a caller names the `owner` its
 * `accountFor` answered. Every use is still the act of the member who made it (K1755): it is counted to that account and
 * to that member. Nobody reads another member's spending; a cost is answered only to the paying account's owners
 * (K1450 as D12 retires it for them).
 *
 * SHAPE (K61). `aiUseOf(ctx, deps)` answers the one instance for a Durable Object's storage, over `ctx.storage.sql`,
 * reaching record-core, membership, credentials and connections by their factories on the same `ctx`; a test may pass
 * its own as `deps` (`record`, `membership`, `credentials`, `connections`, and `zone`, the group's zone or a function
 * answering it) on the first call. Its first construction migrates and declares its tables (R7). No service throws.
 */
import { isMachineIdentity, normalizeType } from "../record-grammar/index.mjs";
import { localDay } from "../civil-time/index.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, notAnAdmin, notTheOwner } from "../membership/index.mjs";
import { credentialsOf, USE_KINDS } from "../credentials/index.mjs";
import { connectionsOf } from "../connections/index.mjs";
import { retrievalOf } from "../retrieval/index.mjs";
import { AI_RUNS_CHECKS } from "../run-rules/index.mjs";
import { AI_USE_SCHEMA, AI_USE_TABLES } from "./schema.mjs";
import { AI_USE_CHECKS, AI_USE_WORDS, LIMIT_WORD_BY_SCOPE, WHOSE_WORD } from "./checks.mjs";
export { AI_USE_SCHEMA, AI_USE_TABLES } from "./schema.mjs";
export { AI_USE_CHECKS, AI_USE_WORDS, LIMIT_WORD_BY_SCOPE, WHOSE_WORD } from "./checks.mjs";

/** R1 (was ai-runs R48): the figures of one conversation's `usage`, as `agent-model` returns them (its R5, R6: the sum
 *  over its model calls), plus `estimated_cost_usd` (its R13): token figures whole numbers, the costs dollar amounts,
 *  any of them `null` where not stated. */
export const USAGE_TOKEN_FIGURES = Object.freeze(["input_tokens", "output_tokens", "cache_read_input_tokens",
  "cache_creation_input_tokens"]);
export const USAGE_COST_FIGURES = Object.freeze(["total_cost_usd", "estimated_cost_usd"]);
/** R1: the modes an ask's use is counted under (`countAskUsage`): an ask, or a draft (run-rules R21); neither is a run. */
export const ASK_USAGE_MODES = Object.freeze(["ask", "draft"]);
/** R2 (B4): a limit's scopes besides the kinds of use, its units and its periods. */
export const LIMIT_UNITS = Object.freeze(["usd", "tokens", "calls"]);
export const LIMIT_PERIODS = Object.freeze(["day", "month"]);
/** R1, R4 (B8): the owner a row counted before T40 is kept under; it counts toward no limit. */
export const NOT_RECORDED = "not recorded";
/** R10 (D12): an estimate needs at least `min` measured acts of that account, use and mode, and reads the latest `of`. */
export const ESTIMATE_SAMPLE = Object.freeze({ min: 5, of: 20 });
/** R9: the longest statement of what is worth exploring kept with an ask. */
export const EXPLORE_WHAT_MAX = 2000;

/** A member's id from any of the forms a stamp takes (`member:<id>`, `member:<id>/<tokenId>`, `<id>`); null for a
 *  machine identity, an absent value, or a deploy class. (Copied from ai-runs, K624.) */
function memberIdOf(x) {
  if (typeof x !== "string") return null;
  const t = x.trim();
  if (!t || isMachineIdentity(t) || t.startsWith("class:") || t.startsWith("token:")) return null;
  const bare = t.startsWith("member:") ? t.slice(7) : t;
  const id = bare.split("/")[0];
  return /^[A-Za-z0-9._-]{1,128}$/.test(id) ? id : null;
}

/** R1, R2 (`credentials` R54–R56): an owner's spelling, `group`, `project:<id>` or `member:<id>`, parsed; null for any
 *  other. */
export function parseOwner(owner) {
  if (owner === "group") return { kind: "group", owner: "group" };
  if (typeof owner !== "string") return null;
  const m = /^(project|member):([A-Za-z0-9._-]{1,128})$/.exec(owner.trim());
  return m ? { kind: m[1], id: m[2], owner: `${m[1]}:${m[2]}` } : null;
}
const whoseOf = (p) => (p.kind === "group" ? "group" : p.kind === "project" ? "project" : "own");
const tokensOf = (r) => Number(r.input_tokens) + Number(r.output_tokens) + Number(r.cache_read_input_tokens)
  + Number(r.cache_creation_input_tokens);

export class AiUse {
  constructor(ctx, deps = {}) {
    this.ctx = ctx;
    const storage = ctx && ctx.storage ? ctx.storage : ctx;
    this.sql = storage.sql;
    this.#deps = deps || {};
    this.record = this.#deps.record || recordOf(ctx);
    this.membership = this.#deps.membership || membershipOf(ctx, { record: this.record });
  }
  #deps;

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #credentials() { return this.#deps.credentials || credentialsOf(this.ctx); }
  #connections() { return this.#deps.connections || connectionsOf(this.ctx); }
  /** Every write this module makes outside a caller's transaction goes through record-core's `transact` (its R32). */
  #transact(fn) { return typeof this.record.transact === "function" ? this.record.transact(fn) : fn(); }

  /* ===== START: the tables (R7) ===== */

  /** R1, R2, R7: this module's tables, created if absent, the pre-T40 counter and ceilings carried over once, then
   *  declared to record-core. Idempotent; run at the first construction (`aiUseOf`). */
  migrate() {
    const cols = (t) => this.#rows(`PRAGMA table_info(${t})`).map((r) => r.name);
    const before = cols("ai_usage");
    const carried = before.length && !before.includes("owner");
    if (carried) this.sql.exec(`ALTER TABLE ai_usage RENAME TO ai_usage_before_t40`);
    const bare = AI_USE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.sql.exec(t); }
    if (carried) this.#carryCounter();
    this.#carryCeilings();
    this.declareTables();
  }

  /** R1 (B8): rows counted before T40 named no payer: each is kept, owner "not recorded", its kind of use read from its
   *  mode (an ask's or a draft's own, else a run's), so it counts toward no limit. */
  #carryCounter() {
    this.sql.exec(
      `INSERT INTO ai_usage (owner, member, day, use, mode, calls, input_tokens, output_tokens, cache_read_input_tokens,
         cache_creation_input_tokens, cost_micro_usd, tokens_unstated, cost_unstated)
       SELECT ?, member, day, CASE WHEN mode IN ('ask', 'draft') THEN mode ELSE 'run' END, mode, calls, input_tokens,
         output_tokens, cache_read_input_tokens, cache_creation_input_tokens, cost_micro_usd, tokens_unstated, cost_unstated
       FROM ai_usage_before_t40`, NOT_RECORDED);
    this.sql.exec(`DROP TABLE ai_usage_before_t40`);
  }

  /** R2 (B4): today's ceilings, once: a member's own daily ceiling becomes that member's account's `overall` day limits
   *  in tokens and calls; the copy-wide ceiling the group account's `per_member` day limits. Each is recorded in the
   *  history as set by the migration. */
  #carryCeilings() {
    if (this.#one(`SELECT name FROM ai_use_migrations WHERE name='ceilings'`)) return;
    const now = stampInstant("second", Date.now());
    const held = this.#rows(`SELECT name FROM sqlite_master WHERE type='table' AND name='ai_ceilings'`).length
      ? this.#rows(`SELECT holder, tokens, calls FROM ai_ceilings ORDER BY holder`) : [];
    for (const c of held) {
      const own = typeof c.holder === "string" && c.holder.startsWith("member:") ? parseOwner(c.holder) : null;
      const target = c.holder === "copy" ? { owner: "group", scope: "per_member" } : own ? { owner: own.owner, scope: "overall" } : null;
      if (!target) continue;
      for (const unit of ["tokens", "calls"]) {
        const v = Number(c[unit]);
        if (c[unit] == null || !Number.isSafeInteger(v) || v < 1) continue;
        if (this.#limit(target.owner, target.scope, unit, "day")) continue;
        this.#write(target.owner, target.scope, unit, "day", v, null, "migration:ceilings", now);
      }
    }
    this.sql.exec(`INSERT INTO ai_use_migrations (name, at) VALUES ('ceilings', ?)`, now);
  }

  /** R7: the tables declared once through record-core (its R21): `admin-only`, `sight: "group"`, purged only with the
   *  whole store, a project's limits, their history, its reached rows and its asks also with the project. */
  declareTables() {
    if (this.#declared) return false;
    const answer = this.record.declareTable("ai-use", AI_USE_TABLES.map((t) => ({ ...t, keys: [...t.keys] })));
    if (answer && answer.ok === false)
      throw new Error(`ai-use: record-core refused its table declaration: ${answer.reason} (${answer.table})`);
    this.#declared = true;
    return true;
  }
  #declared = false;

  /* ===== The refusals (R8, R13) ===== */

  /** One refusal with its row: this module's (R8), or `run-rules`' by key (`AI_RUN_CONSUME_INVALID`,
   *  `NOT_YOUR_CEILING`; its R11, R20). */
  #refuse(code, detail, extra = {}) {
    const row = AI_USE_CHECKS[code] || AI_RUNS_CHECKS[code] || { check: null, translation: null };
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra };
  }

  /** R13: `AI_LIMIT_REACHED`, the one site that mints it (K231): its sentence read by its scope, `{whose}` filled from
   *  `ai.whose.*`; never a cost. `lim` null is R3's fail-closed answer (no account named, or the counter unreadable),
   *  read as the overall one. */
  #limitReached(p, lim, use, start, why = null) {
    const whose = p ? whoseOf(p) : null;
    const scope = lim ? lim.scope : "overall";
    const key = LIMIT_WORD_BY_SCOPE[scope] || "ai.refused.limit";
    const translation = AI_USE_WORDS[key].replace("{whose}", AI_USE_WORDS[WHOSE_WORD[whose || "group"]]);
    /* DEC-49 REGION is-ai-limit-reached */
    return { ...this.#refuse("AI_LIMIT_REACHED", lim ? `${p.owner}'s ${lim.period} limit (${scope}, in ${lim.unit}) is `
      + `reached for the period from ${start}. Nothing was started.` : `${why} Nothing was started.`), translation, word: key,
      whose, scope, unit: lim ? lim.unit : null, period: lim ? lim.period : null, period_start: start ?? null, use: use ?? null };
    /* END DEC-49 REGION is-ai-limit-reached */
  }

  /** R2: an invalid limit, naming the field. */
  #invalid(field, detail) {
    /* DEC-49 REGION is-ai-limit-invalid */
    return this.#refuse("AI_LIMIT_INVALID", `${detail} Nothing was changed.`, { field, word: "ai.refused.limitinvalid" });
    /* END DEC-49 REGION is-ai-limit-invalid */
  }

  /** R3, R6, R9: exploring is `no` on the account. */
  #exploreOff(p) {
    const whose = whoseOf(p);
    /* DEC-49 REGION is-explore-not-enabled */
    return { ...this.#refuse("EXPLORE_NOT_ENABLED", `exploring is set to no on ${p.owner}'s account, so it pays for no `
      + "exploring. Nothing was started."), translation: AI_USE_WORDS["ai.refused.explorenotenabled"]
      .replace("{whose}", AI_USE_WORDS[WHOSE_WORD[whose]]), word: "ai.refused.explorenotenabled", whose, owner: p.owner };
    /* END DEC-49 REGION is-explore-not-enabled */
  }

  /** R9: an ask or approval naming no day or no thing worth exploring. */
  #askFault(field, detail) {
    /* DEC-49 REGION is-explore-ask-invalid */
    return this.#refuse("EXPLORE_ASK_INVALID", `${detail} Nothing was recorded.`, { field });
    /* END DEC-49 REGION is-explore-ask-invalid */
  }

  /* ===== Time (R1–R5, R9) ===== */

  /** The group's zone (`retrieval` R69, as ai-runs reads it; K2480), or the one a test hands in; UTC when it cannot be
   *  read. */
  #zone() {
    const z0 = this.#deps.zone;
    try {
      const z = typeof z0 === "function" ? z0() : z0 !== undefined ? z0 : retrievalOf(this.ctx).zone();
      return typeof z === "string" && z ? z : "UTC";
    } catch { return "UTC"; }
  }

  /** An instant (ms, or an ISO string) as the record's spelling; now when absent or unreadable. */
  static #ms(at) { const ms = typeof at === "string" ? Date.parse(at) : typeof at === "number" ? at : NaN; return Number.isFinite(ms) ? ms : Date.now(); }
  static #iso(ms) { return stampInstant("second", ms); }

  /** R1: the local day, in the group's zone, on which an instant falls (`civil-time.localDay`); UTC's when the zone
   *  cannot be read. */
  #dayOf(at) {
    const iso = AiUse.#iso(AiUse.#ms(at));
    const zone = this.#zone();
    const d = localDay(iso, zone);
    if (typeof d === "string") return { day: d, zone };
    return { day: localDay(iso, "UTC"), zone: "UTC" };
  }

  /** R2: a period's start for the day `day` (`YYYY-MM-DD`): the day itself, or the 1st of its month. */
  static #start(period, day) { return period === "month" ? `${day.slice(0, 7)}-01` : day; }
  /** The SQL that keeps a counter row inside the period starting `start`. */
  static #inPeriod(period) { return period === "month" ? "substr(day, 1, 7) = substr(?, 1, 7)" : "day = ?"; }

  /* ===== COUNTING (R1) ===== */

  /** R1 (was ai-runs R48): one entry `{mode, usage, calls}`: null when well formed, else run-rules R3's refusal of a
   *  malformed consumption (C-22.13), naming what. `calls` absent is malformed; `estimated_cost_usd` absent reads as
   *  not stated (agent-model R13 not yet met; K2480). */
  #entryRefusal(e) {
    const bad = (detail) => this.#refuse("AI_RUN_CONSUME_INVALID", `${detail} Nothing was counted.`);
    if (!e || typeof e !== "object" || Array.isArray(e)) return bad("the use is not an object {mode, usage, calls}.");
    if (typeof e.mode !== "string" || !e.mode.trim() || e.mode.length > 40) return bad("the use names no mode.");
    if (e.model != null && (typeof e.model !== "string" || e.model.length > 120)) return bad("its model is not a model's name.");
    const u = e.usage;
    if (!u || typeof u !== "object" || Array.isArray(u)) return bad("its usage is not an object of the call's figures.");
    for (const f of [...USAGE_TOKEN_FIGURES, ...USAGE_COST_FIGURES]) {
      const absent = !Object.prototype.hasOwnProperty.call(u, f);
      if (absent && f === "estimated_cost_usd") continue;
      if (absent) return bad(`its usage names no '${f}' (null when the provider did not state it).`);
      const v = u[f];
      if (v === null) continue;
      const cost = USAGE_COST_FIGURES.includes(f);
      const ok = cost ? typeof v === "number" && Number.isFinite(v) && v >= 0 : typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
      if (!ok) return bad(`its '${f}' is not ${cost ? "an amount" : "a whole number"} of zero or more.`);
    }
    if (!Object.prototype.hasOwnProperty.call(e, "calls"))
      return bad("it names no 'calls', the model calls its usage covers (null when the runner stated none).");
    const c = e.calls;
    if (!(c === null || (typeof c === "number" && Number.isSafeInteger(c) && c >= 1)))
      return bad("its 'calls' is not a whole number of one or more, or null.");
    return null;
  }

  /** R1: the calls an entry adds: its `calls`, a `null` counting as one, never none. */
  static #callsOf(e) { return e.calls === null || e.calls === undefined ? 1 : e.calls; }
  /** R1: an entry's cost, the figure `usage` carries: `estimated_cost_usd` when stated, else `total_cost_usd`, else
   *  null (not stated). Never a price table (K2376). */
  static #costOf(u) {
    if (typeof u.estimated_cost_usd === "number") return u.estimated_cost_usd;
    if (typeof u.total_cost_usd === "number") return u.total_cost_usd;
    return null;
  }

  /** R1 `countUsage({owner, member, use, mode, model, usage, calls, at, act?})`, in the caller's transaction: adds to
   *  the counter for that owner, member, local day, use and mode; with `act` (a run's id, or an act's own) also to that
   *  act's measure (R10, R11; K2480); then notes any limit of the owner this reached (R5). A malformed entry is refused
   *  `AI_RUN_CONSUME_INVALID`, counting nothing. Never throws. */
  countUsage({ owner = null, member = null, use = null, mode = null, model = null, usage = null, calls = undefined,
               at = null, act = null } = {}) {
    try {
      const p = owner === NOT_RECORDED ? { kind: "none", owner: NOT_RECORDED } : parseOwner(owner);
      const bad = (detail) => this.#refuse("AI_RUN_CONSUME_INVALID", `${detail} Nothing was counted.`);
      if (!p) return bad("the use names no paying account: 'group', 'project:<id>' or 'member:<id>'.");
      const id = memberIdOf(member);
      if (!id) return bad("the use names no member whose act it was.");
      if (!USE_KINDS.includes(use)) return bad(`the use '${String(use).slice(0, 40)}' is not a kind of use (${USE_KINDS.join(", ")}).`);
      if (act !== null && act !== undefined && (typeof act !== "string" || !/^[A-Za-z0-9._:-]{1,128}$/.test(act)))
        return bad("its act is not a run's or an act's id.");
      const e = { mode, model, usage, calls };
      const fault = this.#entryRefusal(e);
      if (fault) return fault;
      const ms = AiUse.#ms(at);
      const { day } = this.#dayOf(ms);
      const u = usage;
      const n = (f) => (u[f] === null ? 0 : u[f]);
      const cost = AiUse.#costOf(u);
      const micro = cost === null ? 0 : Math.round(cost * 1e6);
      const tokensUnstated = USAGE_TOKEN_FIGURES.some((f) => u[f] === null) ? 1 : 0;
      const costUnstated = cost === null ? 1 : 0;
      const callCount = AiUse.#callsOf(e);
      this.sql.exec(
        `INSERT INTO ai_usage (owner, member, day, use, mode, calls, input_tokens, output_tokens, cache_read_input_tokens,
           cache_creation_input_tokens, cost_micro_usd, tokens_unstated, cost_unstated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(owner, member, day, use, mode) DO UPDATE SET calls = calls + excluded.calls,
           input_tokens = input_tokens + excluded.input_tokens, output_tokens = output_tokens + excluded.output_tokens,
           cache_read_input_tokens = cache_read_input_tokens + excluded.cache_read_input_tokens,
           cache_creation_input_tokens = cache_creation_input_tokens + excluded.cache_creation_input_tokens,
           cost_micro_usd = cost_micro_usd + excluded.cost_micro_usd,
           tokens_unstated = tokens_unstated + excluded.tokens_unstated, cost_unstated = cost_unstated + excluded.cost_unstated`,
        p.owner, id, day, use, String(mode).trim(), callCount, n("input_tokens"), n("output_tokens"),
        n("cache_read_input_tokens"), n("cache_creation_input_tokens"), micro, tokensUnstated, costUnstated);
      const now = AiUse.#iso(ms);
      if (act) {
        const tokens = USAGE_TOKEN_FIGURES.reduce((s, f) => s + n(f), 0);
        this.sql.exec(
          `INSERT INTO ai_use_acts (owner, act, use, mode, calls, tokens, cost_micro_usd, tokens_unstated, cost_unstated,
             first_at, last_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(owner, act) DO UPDATE SET calls = calls + excluded.calls, tokens = tokens + excluded.tokens,
             cost_micro_usd = cost_micro_usd + excluded.cost_micro_usd,
             tokens_unstated = tokens_unstated + excluded.tokens_unstated, cost_unstated = cost_unstated + excluded.cost_unstated,
             last_at = excluded.last_at`,
          p.owner, act, use, String(mode).trim(), callCount, tokens, micro, tokensUnstated, costUnstated, now, now);
      }
      if (p.kind !== "none") this.#noteReached(p, ms);
      return { ok: true, counted: 1, owner: p.owner, member: id, use, day, calls: callCount, act: act || null };
    } catch (err) {
      return this.#refuse("AI_RUN_CONSUME_INVALID", `the use could not be counted (${String(err && err.message || err).slice(0, 200)}). Nothing was counted.`);
    }
  }

  /** R1 `countAskUsage({member, mode, usage, calls, at, owner?, act?})` (was ai-runs R48's; K2400): an ask or a draft
   *  (no run), counted as `countUsage` counts, its use its mode, in its own transaction. `owner` is the account the
   *  caller's `accountFor` answered; without one the use is kept as "not recorded" and counts toward no limit (K2480).
   *  Any mode but `ask` or `draft` is refused `AI_RUN_CONSUME_INVALID`. */
  countAskUsage({ member = null, mode = null, usage = null, calls = null, at = null, owner = null, act = null } = {}) {
    if (!ASK_USAGE_MODES.includes(typeof mode === "string" ? mode.trim() : mode))
      return this.#refuse("AI_RUN_CONSUME_INVALID", `the mode '${String(mode).slice(0, 40)}' is not one an ask's use is `
        + "counted under: an ask counts as 'ask' and a draft as 'draft'; a run's use arrives on its own ticks. Nothing was counted.");
    const m = mode.trim();
    let out = null;
    try {
      this.#transact(() => { out = this.countUsage({ owner: owner ?? NOT_RECORDED, member, use: m, mode: m, usage, calls, at, act }); return out; });
    } catch { /* a refusal rolled back; `out` carries it */ }
    return out ?? this.#refuse("AI_RUN_CONSUME_INVALID", "the use could not be counted. Nothing was counted.");
  }

  /* ===== The sums ===== */

  /** The uses of `owner` whose limit is exclusive (B5): a use with any limit held `inclusive` false. */
  #exclusive(owner) {
    return new Set(this.#rows(`SELECT DISTINCT scope FROM ai_limits WHERE owner=? AND inclusive=0`, owner).map((r) => r.scope));
  }

  /** The figure of `unit` used by `owner` in the period of `period` holding `day`: over `uses` (null: every use but
   *  `excluded`), for `member` alone when named. `usd` in whole cents, rounded up so a limit is never reached late. */
  #used(owner, unit, period, day, { use = null, member = null, excluded = null } = {}) {
    const where = [`owner = ?`, AiUse.#inPeriod(period)], args = [owner, day];
    if (use) { where.push("use = ?"); args.push(use); }
    if (member) { where.push("member = ?"); args.push(member); }
    if (!use && excluded && excluded.size) { where.push(`use NOT IN (${[...excluded].map(() => "?").join(",")})`); args.push(...excluded); }
    const r = this.#one(`SELECT COALESCE(SUM(input_tokens + output_tokens + cache_read_input_tokens + cache_creation_input_tokens), 0) t,
                                COALESCE(SUM(calls), 0) c, COALESCE(SUM(cost_micro_usd), 0) m FROM ai_usage WHERE ${where.join(" AND ")}`, ...args);
    if (unit === "tokens") return Number(r.t);
    if (unit === "calls") return Number(r.c);
    return Math.ceil(Number(r.m) / 1e4);
  }

  /** The greatest figure any one member used of a per-member limit, naming none (R12). */
  #mostByAMember(owner, unit, period, day) {
    const ids = this.#rows(`SELECT DISTINCT member FROM ai_usage WHERE owner = ? AND ${AiUse.#inPeriod(period)}`, owner, day);
    return ids.reduce((m, r) => Math.max(m, this.#used(owner, unit, period, day, { member: r.member })), 0);
  }

  /** The limits held for `owner`, every one or one scope's. */
  #limits(owner, scope = null) {
    return scope ? this.#rows(`SELECT * FROM ai_limits WHERE owner=? AND scope=? ORDER BY scope, unit, period`, owner, scope)
      : this.#rows(`SELECT * FROM ai_limits WHERE owner=? ORDER BY scope, unit, period`, owner);
  }
  #limit(owner, scope, unit, period) {
    return this.#one(`SELECT * FROM ai_limits WHERE owner=? AND scope=? AND unit=? AND period=?`, owner, scope, unit, period);
  }

  /** R3: the first limit of `p` reached for `use` (and `member`) at `ms`, as `{lim, start}`, else null: the use's own,
   *  then the overall one (unless the use is exclusive), then the per-member one. */
  #reachedFor(p, use, member, ms) {
    const { day } = this.#dayOf(ms);
    const excluded = this.#exclusive(p.owner);
    const over = (lim, opts) => this.#used(p.owner, lim.unit, lim.period, day, opts) >= Number(lim.amount);
    for (const lim of use ? this.#limits(p.owner, use) : [])
      if (over(lim, { use })) return { lim, start: AiUse.#start(lim.period, day) };
    if (!use || !excluded.has(use))
      for (const lim of this.#limits(p.owner, "overall"))
        if (over(lim, { excluded })) return { lim, start: AiUse.#start(lim.period, day) };
    if (member)
      for (const lim of this.#limits(p.owner, "per_member"))
        if (over(lim, { member })) return { lim, start: AiUse.#start(lim.period, day) };
    return null;
  }

  /** R5 (B7): every limit of `p` reached at `ms` and not yet noted for its period is noted, once, with the instant. */
  #noteReached(p, ms) {
    const { day } = this.#dayOf(ms);
    const at = AiUse.#iso(ms);
    const excluded = this.#exclusive(p.owner);
    for (const lim of this.#limits(p.owner)) {
      const start = AiUse.#start(lim.period, day);
      if (this.#one(`SELECT owner FROM ai_limit_reached WHERE owner=? AND scope=? AND unit=? AND period=? AND period_start=?`,
                    p.owner, lim.scope, lim.unit, lim.period, start)) continue;
      const used = lim.scope === "overall" ? this.#used(p.owner, lim.unit, lim.period, day, { excluded })
        : lim.scope === "per_member" ? this.#mostByAMember(p.owner, lim.unit, lim.period, day)
        : this.#used(p.owner, lim.unit, lim.period, day, { use: lim.scope });
      if (used >= Number(lim.amount))
        this.sql.exec(`INSERT INTO ai_limit_reached (owner, scope, unit, period, period_start, reached_at, project_id)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`, p.owner, lim.scope, lim.unit, lim.period, start, at,
                       p.kind === "project" ? p.id : null);
    }
  }

  /* ===== Who acts (R2, R4, R9, R12) ===== */

  /** R2: the owner's own act: the member (`NOT_YOUR_CEILING`); a project's owner (`credentials`' R54 refusals); an
   *  active administrator (`NOT_AN_ADMIN`). A project's and the group's refusals are `credentials`' own, relayed from
   *  its R60 read; when that cannot be read, membership's own refusals (fail closed). Null when `by` may act. */
  #ownerBar(p, by, act) {
    if (p.kind === "member") {
      const id = memberIdOf(by);
      /* the member's account is theirs alone: anyone else, an administrator or a machine included */
      return id !== null && id === p.id ? null
        : this.#refuse("NOT_YOUR_CEILING", `a member's limits and use of the assistant are that member's alone to ${act}. Nothing was changed.`);
    }
    if (p.kind === "group")
      return this.#owns(p, by) && !isMachineIdentity(String(by)) ? null : notAnAdmin(by ?? null, `${act} the group account's limits and use`);
    return this.#accountsBar(p, by, act);
  }

  /** R12 (`credentials` R60): the account's owners and refusals as `credentials.accountUses` states them. */
  #accountsBar(p, by, act) {
    let a = null;
    try { a = this.#credentials().accountUses({ owner: p.owner, viewer: by ?? null }); } catch { a = null; }
    if (a && a.ok === false) return a;
    if (a && a.ok === true && !a.unreadable) return null;
    return this.#owns(p, by) ? null
      : p.kind === "group" ? notAnAdmin(by ?? null, act) : p.kind === "project" ? notTheOwner(by ?? null, p.id) : this.#refuse("NOT_YOUR_CEILING", "Nothing was read.");
  }

  /** Whether `viewer` is one of `p`'s owners: the member; an active administrator for the group; an owner of the
   *  project. False for a machine or an absent viewer. */
  #owns(p, viewer) {
    const id = memberIdOf(viewer);
    if (!id) return false;
    try {
      if (p.kind === "member") return id === p.id;
      if (p.kind === "group") return this.membership.isAdministrator(id);
      if (p.kind === "project") return this.membership.isProjectOwner(p.id, id);
    } catch { return false; }
    return false;
  }

  /** R3, R6, R9: the owner's `explore` value (`credentials` R55): `no`, `ask` or `yes`; `no` when no account is held or
   *  it cannot be read (fail closed). Read through `accountUses` as the account's own owner until credentials offers a
   *  read that takes no viewer (K2480). */
  #exploreOf(p) {
    try {
      const as = p.kind === "member" ? `member:${p.id}`
        : p.kind === "project" ? this.membership.projectOwners(p.id)[0] : this.membership.activeAdmins()[0];
      if (!as) return "no";
      const a = this.#credentials().accountUses({ owner: p.owner, viewer: as.startsWith("member:") || as === "admin" ? as : `member:${as}` });
      const v = a && a.ok === true && a.held && a.uses ? a.uses.explore : "no";
      return ["no", "ask", "yes"].includes(v) ? v : "no";
    } catch { return "no"; }
  }

  /* ===== LIMITS (R2) ===== */

  /** R2: append one change to the history and hold the limit (or remove it, `amount` null). */
  #write(owner, scope, unit, period, amount, inclusive, by, at) {
    const p = parseOwner(owner);
    const project = p && p.kind === "project" ? p.id : null;
    const held = this.#limit(owner, scope, unit, period);
    const change = amount === null ? "removed" : held ? "changed" : "set";
    if (amount === null) this.sql.exec(`DELETE FROM ai_limits WHERE owner=? AND scope=? AND unit=? AND period=?`, owner, scope, unit, period);
    else this.sql.exec(`INSERT INTO ai_limits (owner, scope, unit, period, amount, inclusive, project_id, set_by, set_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(owner, scope, unit, period) DO UPDATE SET amount=excluded.amount,
                          inclusive=excluded.inclusive, set_by=excluded.set_by, set_at=excluded.set_at`,
                        owner, scope, unit, period, amount, inclusive === null ? null : inclusive ? 1 : 0, project, by, at);
    this.sql.exec(`INSERT INTO ai_limit_history (owner, scope, unit, period, change, amount, inclusive, project_id, by, at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, owner, scope, unit, period, change, amount,
                   inclusive === null ? null : inclusive ? 1 : 0, project, by, at);
    return change;
  }

  /** R2: whether `p`'s account is served by a sign-in, which reports no cost (`usd` unavailable). Read as `by`, one of
   *  its owners. */
  #isSignin(p, by) {
    if (p.kind === "group") return false;
    let a = null;
    try { a = this.#credentials().accountUses({ owner: p.owner, viewer: by }); } catch { a = null; }
    if (!a || a.ok !== true) return false;
    if (p.kind === "project") return a.kind === "signin";
    return !!(a.accounts && a.accounts.signin && a.accounts.signin.held && !(a.accounts.reference && a.accounts.reference.held));
  }

  /** R2 `aiLimitSet({owner, scope, unit, period, amount, inclusive?, by, at?})` (`op=ailimitset`): sets, changes or
   *  (`amount` null) removes one limit of one account, by that account's owner, appended to its history with who and
   *  when. Answers `{ok, owner, scope, unit, period, amount, inclusive, change, set_at}`. Never throws. */
  aiLimitSet({ owner = null, scope = null, unit = null, period = null, amount = undefined, inclusive = undefined,
               by = null, at = null } = {}) {
    try {
      const p = parseOwner(owner);
      if (!p) return this.#invalid("owner", "a limit's owner is 'group', 'project:<id>' or 'member:<id>'.");
      const bar = this.#ownerBar(p, by, "set");
      if (bar) return bar;
      const scopes = ["overall", ...USE_KINDS, ...(p.kind === "member" ? [] : ["per_member"])];
      if (!scopes.includes(scope))
        return this.#invalid("scope", `a limit's scope is one of ${scopes.join(", ")}${p.kind === "member" ? " (per_member only for a group's or a project's account)" : ""}.`);
      if (!LIMIT_UNITS.includes(unit)) return this.#invalid("unit", "a limit's unit is usd, tokens or calls.");
      if (!LIMIT_PERIODS.includes(period)) return this.#invalid("period", "a limit's period is day or month.");
      let stored = null;
      if (amount === undefined) return this.#invalid("amount", "a limit's amount is a positive number, or null to remove it.");
      if (amount !== null) {
        const okNum = typeof amount === "number" && Number.isFinite(amount) && amount > 0;
        if (unit === "usd") {
          const cents = okNum ? Math.round(amount * 100) : NaN;
          if (!okNum || cents < 1 || Math.abs(cents - amount * 100) > 1e-6)
            return this.#invalid("amount", "a limit in usd is a positive amount to the cent, or null to remove it.");
          stored = cents;
        } else {
          if (!okNum || !Number.isSafeInteger(amount))
            return this.#invalid("amount", `a limit in ${unit} is a whole number of one or more, or null to remove it.`);
          stored = amount;
        }
      }
      const useScope = USE_KINDS.includes(scope);
      if (inclusive !== undefined && inclusive !== null && (!useScope || typeof inclusive !== "boolean"))
        return this.#invalid("inclusive", useScope ? "inclusive is true or false." : "inclusive is set only for a limit on one kind of use.");
      /* DEC-49 REGION is-limit-unit-unavailable */
      if (unit === "usd" && stored !== null && this.#isSignin(p, by))
        return { ...this.#refuse("LIMIT_UNIT_UNAVAILABLE", "this account is a sign-in, which reports no cost; set the limit "
          + "in tokens or calls. Nothing was changed."), word: "ai.refused.unitunavailable" };
      /* END DEC-49 REGION is-limit-unit-unavailable */
      const ms = AiUse.#ms(at);
      const now = AiUse.#iso(ms);
      const incl = useScope ? (inclusive === undefined || inclusive === null ? true : inclusive) : null;
      if (stored === null && !this.#limit(p.owner, scope, unit, period))
        return { ok: true, owner: p.owner, scope, unit, period, amount: null, inclusive: null, change: "none", set_at: null };
      const by0 = memberIdOf(by) === "admin" ? "admin" : `member:${memberIdOf(by)}`;
      let change = null;
      this.#transact(() => { change = this.#write(p.owner, scope, unit, period, stored, incl, by0, now); this.#noteReached(p, ms); return { ok: true }; });
      return { ok: true, owner: p.owner, scope, unit, period, amount: stored === null ? null : unit === "usd" ? stored / 100 : stored,
               inclusive: stored === null ? null : incl, change, set_at: now };
    } catch (err) {
      return this.#invalid("owner", `the limit could not be set (${String(err && err.message || err).slice(0, 200)}).`);
    }
  }

  /* ===== JUDGING (R3) ===== */

  /** R3 `useCheck({owner, member, use, at})`: null while every limit of the paying account that bears on this use is
   *  under its amount for its current period; else `AI_LIMIT_REACHED` (R13's sentence, naming no cost). For `explore`,
   *  `EXPLORE_NOT_ENABLED` when the owner's `explore` is `no`; with `yes` and no `explore` limit held, the overall limit
   *  alone judges it. Judges only the paying account's limits (D38). Writes nothing; never throws; a counter that cannot
   *  be read answers the refusal (fail closed). */
  useCheck({ owner = null, member = null, use = null, at = null } = {}) {
    const p = parseOwner(owner);
    const failClosed = (why) => this.#limitReached(p, null, use, null, why);
    if (!p) return failClosed("the use names no paying account, so its limits cannot be judged.");
    if (!USE_KINDS.includes(use)) return failClosed(`'${String(use).slice(0, 40)}' is not a kind of use, so its limits cannot be judged.`);
    try {
      if (use === "explore" && this.#exploreOf(p) === "no") return this.#exploreOff(p);
      const hit = this.#reachedFor(p, use, memberIdOf(member), AiUse.#ms(at));
      return hit ? this.#limitReached(p, hit.lim, use, hit.start) : null;
    } catch { return failClosed("the use counted so far could not be read."); }
  }

  /* ===== READS (R4, R5) ===== */

  /** One use's sums, as a read answers them; `cost` only to the paying account's owners (D12). */
  static #sums(r, cost) {
    return { calls: Number(r.calls), input_tokens: Number(r.input_tokens), output_tokens: Number(r.output_tokens),
             cache_read_input_tokens: Number(r.cache_read_input_tokens),
             cache_creation_input_tokens: Number(r.cache_creation_input_tokens), tokens: tokensOf(r),
             tokens_unstated: Number(r.tokens_unstated),
             ...(cost ? { total_cost_usd: Number(r.cost_micro_usd) / 1e6, cost_unstated: Number(r.cost_unstated) } : {}) };
  }
  static #SUMS = `SUM(calls) calls, SUM(input_tokens) input_tokens, SUM(output_tokens) output_tokens,
    SUM(cache_read_input_tokens) cache_read_input_tokens, SUM(cache_creation_input_tokens) cache_creation_input_tokens,
    SUM(cost_micro_usd) cost_micro_usd, SUM(tokens_unstated) tokens_unstated, SUM(cost_unstated) cost_unstated`;

  /** R4 `aiUsage({owner, viewer, month})` (`op=aiusage` with `owner`): the account's month of use per kind of use,
   *  summed over members and naming none, to that account's owners (R2's refusals otherwise). `month` is `YYYY-MM`, this
   *  month in the group's zone by default. Writes nothing. */
  aiUsage({ owner = null, viewer = null, month = null, at = null } = {}) {
    const p = parseOwner(owner);
    if (!p) return this.#invalid("owner", "use is read for 'group', 'project:<id>' or 'member:<id>'.");
    const bar = this.#ownerBar(p, viewer, "read");
    if (bar) return bar;
    const { day, zone } = this.#dayOf(at);
    const m = typeof month === "string" && /^\d{4}-\d{2}$/.test(month.trim()) ? month.trim() : day.slice(0, 7);
    const rows = this.#rows(`SELECT use, ${AiUse.#SUMS} FROM ai_usage WHERE owner = ? AND substr(day, 1, 7) = ?
                             GROUP BY use ORDER BY use`, p.owner, m);
    return { ok: true, owner: p.owner, month: m, zone, uses: rows.map((r) => ({ use: r.use, ...AiUse.#sums(r, true) })) };
  }

  /** R4 `aiUsageMine({viewer, day?, month?})` (`op=aiusage` without `owner`): a member's own use, per paying account and
   *  per kind of use, for a local day (today by default) or, with `month`, a month; against each limit of those
   *  accounts that bound them, each with whether it is reached; a cost only for the accounts the member owns (D12).
   *  Nobody sees another member's spending. Writes nothing. */
  aiUsageMine({ viewer = null, day = null, month = null, at = null } = {}) {
    const id = memberIdOf(viewer);
    if (!id) return this.#refuse("NOT_YOUR_CEILING", "a member's use of the assistant is read only by that member. Nothing was read.");
    const today = this.#dayOf(at);
    const m = typeof month === "string" && /^\d{4}-\d{2}$/.test(month.trim()) ? month.trim() : null;
    const d = m ? null : typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day.trim()) ? day.trim() : today.day;
    const rows = this.#rows(`SELECT owner, use, ${AiUse.#SUMS} FROM ai_usage WHERE member = ? AND
                             ${m ? "substr(day, 1, 7) = ?" : "day = ?"} GROUP BY owner, use ORDER BY owner, use`, id, m ?? d);
    const owners = [...new Set(rows.map((r) => r.owner))];
    const payers = owners.map((o) => {
      const p = parseOwner(o);
      const mine = p ? this.#owns(p, `member:${id}`) : false;
      const limits = p ? this.#limits(o).filter((l) => l.scope === "overall" || l.scope === "per_member"
        || rows.some((r) => r.owner === o && r.use === l.scope)).map((l) => {
        const hit = this.#reachedFor(p, l.scope === "overall" || l.scope === "per_member" ? null : l.scope, id, AiUse.#ms(at));
        return { scope: l.scope, unit: l.unit, period: l.period, amount: l.unit === "usd" ? Number(l.amount) / 100 : Number(l.amount),
                 inclusive: l.inclusive === null ? null : !!l.inclusive,
                 reached: !!(hit && hit.lim.scope === l.scope && hit.lim.unit === l.unit && hit.lim.period === l.period) };
      }) : [];
      return { owner: o, whose: p ? whoseOf(p) : null, uses: rows.filter((r) => r.owner === o).map((r) => ({ use: r.use, ...AiUse.#sums(r, mine) })),
               limits };
    });
    return { ok: true, member: id, ...(m ? { month: m } : { day: d }), zone: today.zone, payers };
  }

  /** R5 `limitsReached({viewer, at})`: for each account the viewer owns, each limit first reached in its current period,
   *  `{key, owner, scope, unit, period, period_start, reached_at}`, the key stable per owner, limit and period. For
   *  `notice-producers` R16. Writes nothing; never throws. */
  limitsReached({ viewer = null, at = null } = {}) {
    try {
      if (!memberIdOf(viewer)) return { ok: true, reached: [] };
      const { day } = this.#dayOf(at);
      const out = [];
      for (const r of this.#rows(`SELECT * FROM ai_limit_reached ORDER BY reached_at, owner, scope, unit, period`)) {
        const p = parseOwner(r.owner);
        if (!p || r.period_start !== AiUse.#start(r.period, day) || !this.#owns(p, viewer)) continue;
        if (!this.#limit(r.owner, r.scope, r.unit, r.period)) continue;
        out.push({ key: `ai-limit:${r.owner}:${r.scope}:${r.unit}:${r.period}:${r.period_start}`, owner: r.owner,
                   scope: r.scope, unit: r.unit, period: r.period, period_start: r.period_start, reached_at: r.reached_at });
      }
      return { ok: true, reached: out };
    } catch { return { ok: true, reached: [], unreadable: true }; }
  }

  /* ===== EXPLORING (R6, R9) ===== */

  /** R6: whether `question` lies in `p`'s scope (B6): the group's, a question the record holds; a project's, a
   *  question it draws on (its citers through `connections.citesInto`); a member's, none yet (D36). */
  #inScope(p, question) {
    if (typeof question !== "string" || !question.trim() || p.kind === "member") return false;
    const info = this.record.bundleInfo(question);
    if (!info || normalizeType(info.type) !== "inquiry") return false;
    if (p.kind === "group") return true;
    return this.#connections().citesInto(question).confirmed.includes(p.id);
  }

  /** R6 `exploreAllowed({owner, question, at})`, for the explorer (B9): `{ok: true, ask: false, label}` when exploring
   *  `question` on `owner`'s account may run now (`label` `{kind: "machine", enabled_by: owner}`, which the explorer
   *  attaches to what it offers); `{ok: true, ask: true}` when the owner's `explore` is `ask` and that local day is not
   *  approved (R9); else a refusal: `EXPLORE_NOT_ENABLED`, `credentials.aiKeptAway`'s, `EXPLORE_OUT_OF_SCOPE`, R3's
   *  `AI_LIMIT_REACHED`. Writes nothing; never throws. */
  exploreAllowed({ owner = null, question = null, at = null } = {}) {
    const p = parseOwner(owner);
    try {
      if (!p) return this.#exploreOff({ kind: "group", owner: String(owner) });
      const value = this.#exploreOf(p);
      if (value === "no") return this.#exploreOff(p);
      const c = this.#credentials();
      const away = c.aiKeptAway({ use: "explore", ...(p.kind === "project" ? { project: p.id } : {}) });
      if (away) return away;
      /* DEC-49 REGION is-explore-out-of-scope */
      if (!this.#inScope(p, question))
        return this.#refuse("EXPLORE_OUT_OF_SCOPE", `the question is not one ${p.owner}'s account explores. Nothing was started.`,
          { owner: p.owner });
      /* END DEC-49 REGION is-explore-out-of-scope */
      if (p.kind === "group") {
        const drawn = this.#connections().citesInto(question).confirmed
          .filter((b) => { const i = this.record.bundleInfo(b); return i && normalizeType(i.type) === "project"; });
        const kept = new Set(c.projectsKeptAway({ use: "explore" }) || []);
        if (drawn.length && drawn.every((b) => kept.has(b))) return c.aiKeptAway({ project: drawn[0], use: "explore" });
      }
      const limit = this.useCheck({ owner: p.owner, member: null, use: "explore", at });
      if (limit) return limit;
      if (value === "ask" && !this.#approved(p, this.#dayOf(at).day)) return { ok: true, ask: true, owner: p.owner };
      return { ok: true, ask: false, owner: p.owner, label: { kind: "machine", enabled_by: p.owner } };
    } catch {
      return this.#exploreOff(p || { kind: "group", owner: String(owner) });
    }
  }

  #approved(p, day) { return !!this.#one(`SELECT approved_at FROM ai_explore_asks WHERE owner=? AND day=? AND approved_at IS NOT NULL`, p.owner, day); }

  /** R9 `exploreAsk({owner, at, what})`: for an owner whose `explore` is `ask`, records at most one pending ask a local
   *  day stating what is worth exploring (`what`, a statement or a list of the questions); a second ask that day answers
   *  the first's key and mints nothing. Answers `{ok, key, owner, day, minted}`. */
  exploreAsk({ owner = null, at = null, what = null } = {}) {
    const p = parseOwner(owner);
    if (!p) return this.#exploreOff({ kind: "group", owner: String(owner) });
    if (this.#exploreOf(p) !== "ask") return this.#exploreOff(p);
    const list = Array.isArray(what) ? what.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()) : null;
    const text = list ? (list.length === what.length && list.length ? JSON.stringify(list) : null)
      : typeof what === "string" && what.trim() ? what.trim() : null;
    if (!text || text.length > EXPLORE_WHAT_MAX)
      return this.#askFault("what", `an ask states what is worth exploring, a statement or a list of questions, at most ${EXPLORE_WHAT_MAX} characters.`);
    const ms = AiUse.#ms(at);
    const { day } = this.#dayOf(ms);
    const key = `explore-ask:${p.owner}:${day}`;
    const held = this.#one(`SELECT asked_at FROM ai_explore_asks WHERE owner=? AND day=?`, p.owner, day);
    if (held && held.asked_at) return { ok: true, key, owner: p.owner, day, minted: false };
    this.#transact(() => {
      if (held) this.sql.exec(`UPDATE ai_explore_asks SET what=?, asked_at=? WHERE owner=? AND day=?`, text, AiUse.#iso(ms), p.owner, day);
      else this.sql.exec(`INSERT INTO ai_explore_asks (owner, day, what, asked_at, project_id) VALUES (?, ?, ?, ?, ?)`,
        p.owner, day, text, AiUse.#iso(ms), p.kind === "project" ? p.id : null);
      return { ok: true };
    });
    return { ok: true, key, owner: p.owner, day, minted: true };
  }

  /** R9 `exploreAsksPending({viewer, at})`: today's asks not yet approved, of the accounts the viewer owns, each
   *  `{key, owner, day, what, asked_at, word, text, estimate}`: `text` `words.json`'s `ai.queue.exploreask` with `{what}`
   *  filled and `{scope}`, `{account}` left for the screen; `estimate` R10's rough cost of one exploring run. For
   *  `notice-producers` R16. Writes nothing; never throws. */
  exploreAsksPending({ viewer = null, at = null } = {}) {
    try {
      if (!memberIdOf(viewer)) return { ok: true, asks: [] };
      const { day } = this.#dayOf(at);
      const asks = [];
      for (const r of this.#rows(`SELECT * FROM ai_explore_asks WHERE day=? AND asked_at IS NOT NULL AND approved_at IS NULL
                                  ORDER BY asked_at, owner`, day)) {
        const p = parseOwner(r.owner);
        if (!p || !this.#owns(p, viewer)) continue;
        let what = r.what;
        try { const j = JSON.parse(r.what); if (Array.isArray(j)) what = j; } catch { /* a statement */ }
        const shown = Array.isArray(what) ? what.join("; ") : what;
        asks.push({ key: `explore-ask:${r.owner}:${r.day}`, owner: r.owner, day: r.day, what, asked_at: r.asked_at,
                    word: "ai.queue.exploreask", text: AI_USE_WORDS["ai.queue.exploreask"].replace("{what}", shown),
                    estimate: this.#estimate(p, "explore", "explore", 1) });
      }
      return { ok: true, asks };
    } catch { return { ok: true, asks: [], unreadable: true }; }
  }

  /** R9 `exploreApprove({owner, day, by})` (`op=exploreapprove`): one of the account's owners approves exploring on it
   *  for that local day (R2's refusals for anyone else). */
  exploreApprove({ owner = null, day = null, by = null, at = null } = {}) {
    const p = parseOwner(owner);
    if (!p) return this.#invalid("owner", "exploring is approved for 'group', 'project:<id>' or 'member:<id>'.");
    const bar = this.#ownerBar(p, by, "approve exploring on");
    if (bar) return bar;
    if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day.trim()))
      return this.#askFault("day", "an approval names its local day, YYYY-MM-DD.");
    const d = day.trim();
    const now = AiUse.#iso(AiUse.#ms(at));
    const who = memberIdOf(by) === "admin" ? "admin" : `member:${memberIdOf(by)}`;
    this.#transact(() => {
      if (this.#one(`SELECT day FROM ai_explore_asks WHERE owner=? AND day=?`, p.owner, d))
        this.sql.exec(`UPDATE ai_explore_asks SET approved_by=COALESCE(approved_by, ?), approved_at=COALESCE(approved_at, ?)
                       WHERE owner=? AND day=?`, who, now, p.owner, d);
      else this.sql.exec(`INSERT INTO ai_explore_asks (owner, day, approved_by, approved_at, project_id) VALUES (?, ?, ?, ?, ?)`,
        p.owner, d, who, now, p.kind === "project" ? p.id : null);
      return { ok: true };
    });
    const r = this.#one(`SELECT approved_by, approved_at FROM ai_explore_asks WHERE owner=? AND day=?`, p.owner, d);
    return { ok: true, owner: p.owner, day: d, approved_by: r.approved_by, approved_at: r.approved_at };
  }

  /* ===== COST BEFORE AND AFTER (R10, R11; D12) ===== */

  /** R10: the range for `count` acts of `use` and `mode` on `p`'s account, from its latest measured acts: `"not known
   *  yet"` under `ESTIMATE_SAMPLE.min`; money when every act in the sample stated a cost, else tokens with calls. */
  #estimate(p, use, mode, count) {
    const acts = this.#rows(`SELECT calls, tokens, cost_micro_usd, cost_unstated FROM ai_use_acts WHERE owner=? AND use=? AND mode=?
                             ORDER BY last_at DESC, act DESC LIMIT ?`, p.owner, use, mode, ESTIMATE_SAMPLE.of);
    if (acts.length < ESTIMATE_SAMPLE.min) return "not known yet";
    const range = (f) => { const v = acts.map(f); return { low: Math.min(...v) * count, high: Math.max(...v) * count }; };
    if (acts.every((a) => Number(a.cost_unstated) === 0)) {
      const r = range((a) => Number(a.cost_micro_usd));
      return { low: r.low / 1e6, high: r.high / 1e6, unit: "usd", measured: acts.length };
    }
    return { ...range((a) => Number(a.tokens)), unit: "tokens", calls: { ...range((a) => Number(a.calls)), unit: "calls" },
             measured: acts.length };
  }

  /** R10 `estimate({owner, use, mode, count?, viewer, at?})`: before an AI act or exploring run (or a batch of `count`),
   *  a range `{low, high, unit}` from that account's measured acts of that use and mode, or `"not known yet"`; answered
   *  only to the account's owners (R2's refusals otherwise). Writes nothing. */
  estimate({ owner = null, use = null, mode = null, count = 1, viewer = null } = {}) {
    const p = parseOwner(owner);
    if (!p) return this.#invalid("owner", "an estimate is for 'group', 'project:<id>' or 'member:<id>'.");
    const bar = this.#ownerBar(p, viewer, "read");
    if (bar) return bar;
    if (!USE_KINDS.includes(use)) return this.#invalid("use", `an estimate names a kind of use (${USE_KINDS.join(", ")}).`);
    const m = typeof mode === "string" && mode.trim() ? mode.trim() : use;
    const n = count === undefined || count === null ? 1 : count;
    if (!Number.isSafeInteger(n) || n < 1) return this.#invalid("count", "an estimate's count is a whole number of one or more.");
    return { ok: true, owner: p.owner, use, mode: m, count: n, estimate: this.#estimate(p, use, m, n) };
  }

  /** R11 `actualOf({run | act, viewer})`: the actual cost of one run or act after, in R10's units, only to the paying
   *  account's owners. An act not measured, or not on an account the viewer owns, answers `found: false`. Writes
   *  nothing. */
  actualOf({ run = null, act = null, viewer = null } = {}) {
    const id = typeof run === "string" && run ? run : typeof act === "string" && act ? act : null;
    if (!id || !memberIdOf(viewer)) return { ok: true, found: false };
    const rows = this.#rows(`SELECT * FROM ai_use_acts WHERE act=? ORDER BY owner`, id)
      .filter((r) => { const p = parseOwner(r.owner); return p && this.#owns(p, viewer); });
    if (!rows.length) return { ok: true, found: false };
    const r = rows[0];
    return { ok: true, found: true, act: id, owner: r.owner, use: r.use, mode: r.mode, calls: Number(r.calls), tokens: Number(r.tokens),
             tokens_unstated: Number(r.tokens_unstated) > 0,
             cost: Number(r.cost_unstated) === 0 ? { usd: Number(r.cost_micro_usd) / 1e6 } : null,
             unit: Number(r.cost_unstated) === 0 ? "usd" : "tokens", first_at: r.first_at, last_at: r.last_at };
  }

  /* ===== THE PANEL'S READ (R12; DEC-188) ===== */

  /** R12 `aiLimits({owner, viewer})` (`op=ailimits`): each limit held on one account, with its use in the current period
   *  (R5's sums, naming no member: a per-member limit answers the most any one member used) and the account's history
   *  of limits (set, changed, removed; who and when), to that account's owners only, as `credentials` R60 states them;
   *  anyone else is refused as R60 refuses them. Writes nothing. */
  aiLimits({ owner = null, viewer = null, at = null } = {}) {
    const p = parseOwner(owner);
    if (!p) return this.#invalid("owner", "limits are read for 'group', 'project:<id>' or 'member:<id>'.");
    const bar = this.#accountsBar(p, viewer, "reading an account's limits");
    if (bar) return bar;
    try {
      const { day, zone } = this.#dayOf(at);
      const excluded = this.#exclusive(p.owner);
      const money = (unit, v) => (v === null ? null : unit === "usd" ? Number(v) / 100 : Number(v));
      const limits = this.#limits(p.owner).map((l) => {
        const used = l.scope === "overall" ? this.#used(p.owner, l.unit, l.period, day, { excluded })
          : l.scope === "per_member" ? this.#mostByAMember(p.owner, l.unit, l.period, day)
          : this.#used(p.owner, l.unit, l.period, day, { use: l.scope });
        return { scope: l.scope, use: USE_KINDS.includes(l.scope) ? l.scope : null, unit: l.unit, period: l.period,
                 amount: money(l.unit, l.amount), inclusive: l.inclusive === null ? null : !!l.inclusive,
                 on_top: l.inclusive === null ? null : !l.inclusive, period_start: AiUse.#start(l.period, day),
                 used: money(l.unit, used), reached: used >= Number(l.amount), set_by: l.set_by, set_at: l.set_at };
      });
      const history = this.#rows(`SELECT * FROM ai_limit_history WHERE owner=? ORDER BY seq`, p.owner)
        .map((h) => ({ change: h.change, scope: h.scope, unit: h.unit, period: h.period, amount: money(h.unit, h.amount),
                       inclusive: h.inclusive === null ? null : !!h.inclusive, by: h.by, at: h.at }));
      return { ok: true, owner: p.owner, zone, limits, history };
    } catch {
      return { ok: true, owner: p.owner, limits: null, history: null, unreadable: true };
    }
  }
}

/* K61: the one AiUse of a Durable Object's storage, made, migrated and declared on first use. `deps` (a test's own
   modules, or the group's `zone`) are read on the first call only. */
const OF = new WeakMap();
export function aiUseOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let u = OF.get(storage);
  if (!u) {
    u = new AiUse(ctx, deps);
    OF.set(storage, u);
    u.migrate();
  }
  return u;
}

/** The ops this module answers (`op-declarations` R41): `ailimitset`, `ailimits`, `aiusage` (with `owner` an account's
 *  month, R4; without, the viewer's own) and `exploreapprove`. Every identity (`by`, `viewer`) is the control plane's
 *  stamp, read from the QUERY after the body is spread, so a caller's own copy never wins (D-136). */
export function aiUseOps(use, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  return {
    ailimitset: () => use.aiLimitSet({ ...b, by: q("by") }),
    ailimits: () => use.aiLimits({ owner: q("owner") ?? b.owner ?? null, viewer: q("viewer") }),
    aiusage: () => (q("owner") != null
      ? use.aiUsage({ owner: q("owner"), viewer: q("viewer"), month: q("month") })
      : use.aiUsageMine({ viewer: q("viewer"), day: q("day"), month: q("month") })),
    exploreapprove: () => use.exploreApprove({ ...b, by: q("by") }),
  };
}
