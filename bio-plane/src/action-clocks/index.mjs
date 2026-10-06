/* action-clocks — the deadlines on the group's actions, read across actions, and the reminders members ask for on them
 * (requirements: `build/requirements/action-clocks.md`; State Rules v1.5 §4.4; `BIO_Action_v0_1.md` §4 rule 5).
 *
 * Split from `actions` (K617, K624 (1); T18 layer 9) by copy: `pendingClocks` and its bounds (R1, was `actions` R31),
 * `clockPropose` with `computeDeadline` and the clock subject of the proposal label (R2, was R32), the
 * `action_clock_proposals` table and `PENDING_CLOCKS_BAD_BEFORE`'s row, with their comments; `actions`' own job deleted
 * its copy. New here: `overdueClocks` (R3, the Action fold's `actions` R50) and the member's reminders (R4–R6, R8;
 * DEC-94, K613–K615, K624 (3)). T33-74: the count delegates to `civil-time` (`count.mjs`; C-1, C-2, C-4), every day is
 * the local day of the action's jurisdiction (K1444 (iii)), every deadline names its basis kind (R7, K1431), a computed
 * deadline is adopted in one member act (R13, K1440), a member downloads their deadlines as one calendar file (R14,
 * K1451; `ics.mjs`), and the group's own lateness is counted, never a finding about government (R15, D234). T34-50:
 * R3 and R5 items carry the zone they were judged in (N609); a named closure list's entry is read at its own local fact
 * (R12, N562; `count.mjs`). An
 * action's clock is written in its own document (`actions`); this module reads it, proposes entries apart, holds the
 * members' reminders in its own table, and writes the document only through R13's adoption, a member's revision.
 *
 * REACHED as `actionClocksOf(host, deps)` (K61): one instance per host, created on the first call. At creation it
 * creates its tables and declares them, with their classes, to record-core (R9).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership   layer 2: `readFile`, `readImage`, `textAtSha`, `head`, `livePaths`, `transact`, `getSetting`,
 *                        `acquireLease`, `releaseLease`, `declareTable`; `viewerPredicate`.
 *   promotion            `promote`: R13's revision of the action, which `actions`' check judges (its R1–R3, R7).
 *   actions              `actionRead` (its R29) and `noSuchAction` (its R43).
 *   conformance          `determinationRead` (its R9): the project of the determination an action rests on (R3, R5;
 *                        K702). A host on which it cannot be created answers every project null.
 *   localFacts           `factStatus` (local-facts R2): each holiday year a business count reads, its status and the
 *                        value that governs here (R10), read through `factReader` (R12). A host on which it cannot be
 *                        created, or whose local-facts has no `factStatus`, reads none, and a business count states
 *                        its calendar `not_read`.
 *   standards            `standardRead` and `inForceAt` (R7, K1446): a deadline whose basis names a held standard. A
 *                        host on which it cannot be created answers such a standard undetermined.
 *   combine              `jurisdictions.combine` over the active profiles' ids (record-core's `jurisdiction_profiles`);
 *                        a test passes its own, as local-facts takes one.
 *   now                  the instance clock, milliseconds (default: `env.BIO_NOW_MS`, else the wall clock).
 *   env                  the instance bindings.
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, `current_state`), its
 * R37; retrieval's projection (`action_clock_next`, its R61), which R1's page seeks. */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { PROJECTION_TABLE } from "../retrieval/index.mjs";
import { conformanceOf } from "../conformance/index.mjs";
import { actionsOf, noSuchAction } from "../actions/index.mjs";
import { standardsOf, noSuchStandard } from "../standards/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { parseFrontmatter } from "../record-grammar/frontmatter.mjs";
import { normalizeType } from "../record-grammar/types.mjs";
import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { createSha256 } from "../record-grammar/index.mjs";
import { lawProposalLabel } from "../action-grammar/index.mjs";
import { localFactsOf, factPath } from "../local-facts/index.mjs";
import { isCalendarDate, span } from "../civil-time/index.mjs";
import { evaluate as calcEvaluate } from "../calc-grammar/index.mjs";
import { ACTION_CLOCK_CHECKS } from "./checks.mjs";
import { ACTION_CLOCKS_TABLES, ACTION_CLOCKS_TABLE_CLASSES, migrateActionClocks } from "./schema.mjs";
import { actionOffices, actionZone, localDayOf, yearEntries, holidayFact, officeHours, readsOfficeCalendar, factReader,
         computeDeadline, traceLine } from "./count.mjs";
import { icsCalendar } from "./ics.mjs";

export { ACTION_CLOCK_CHECKS } from "./checks.mjs";
export { ACTION_CLOCKS_SCHEMA, ACTION_CLOCKS_TABLES, ACTION_CLOCKS_TABLE_CLASSES } from "./schema.mjs";
export { actionOffices, actionZone, yearEntries, factReader, computeDeadline } from "./count.mjs";
export { icsCalendar } from "./ics.mjs";

/** R1: the most pending clock entries one page answers, and the most actions one page reads. */
export const PENDING_CLOCKS_MAX = 500;
export const PENDING_CLOCKS_ACTIONS_MAX = 500;
/** R3: the same two bounds for the overdue entries. */
export const OVERDUE_CLOCKS_MAX = 500;
export const OVERDUE_CLOCKS_ACTIONS_MAX = 500;
/** R5: the most due reminders one page answers. */
export const REMINDERS_DUE_MAX = 500;
/** R4: the most standing reminders one action holds; and the most reminders `remindersFor` answers. */
export const REMINDERS_PER_ACTION_MAX = 50;
export const REMINDERS_READ_MAX = 500;
/** R11: the most actions `calendarFactsRead` reads. */
export const CALENDAR_FACTS_ACTIONS_MAX = 500;
/** R14: the most actions one calendar file holds. R15: the most actions one lateness index reads, and the most versions
 *  of one action it reads for the day an entry was met. */
export const CLOCKS_ICS_ACTIONS_MAX = 200;
export const LATENESS_ACTIONS_MAX = 500;
export const LATENESS_VERSIONS_MAX = 200;
/** R13: the lease on the action while its revision is written (as `actions`' acts take theirs, its R16). */
export const ADOPT_LEASE_MS = 30000;

/** R7 (K1431): the basis kinds of a deadline: a law or order, an undertaking, the event it must precede, the group's
 *  own window. R15 (D234): the kinds that are the group's own deadlines, the only ones its lateness index counts. */
export const BASIS_KINDS = Object.freeze(["rule", "commitment", "dependency", "window"]);
export const GROUP_OWN_KINDS = Object.freeze(["commitment", "dependency", "window"]);

/** R3, R5: the lifecycle states in which an action's deadlines no longer call for anything. */
export const CLOSED_ACTION_STATES = Object.freeze(["resolved", "abandoned"]);

/* The catalogue-backed refusals: each carries its code, check and translation (the Provides' "Terms"). */
export function withRow(r) {
  if (!r || typeof r !== "object" || r.ok !== false || typeof r.reason !== "string") return r;
  const row = ACTION_CLOCK_CHECKS[r.reason];
  if (!row) return r;
  return { ...r, code: r.code ?? r.reason, check: r.check ?? row.check, translation: r.translation ?? row.translation };
}
const refuse = (code, detail, extra) => withRow({ ok: false, reason: code, detail, ...(extra || {}) });

/** A `YYYY-MM-DD` that names a real calendar day (`civil-time.isCalendarDate`, its R6). */
const isDay = (v) => typeof v === "string" && isCalendarDate(v);
const clampLimit = (v, dflt, max) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(n, max) : dflt; };

/* R4 (N427, K711): the one site minting `REMINDER_REFUSED`, the refusal of a reminder request's own shape, its detail
   naming the arm (`entry`, `on`, `from`, `held`, `bound`). Exported as `actions`' `noSuchAction` is, so a later module
   judging a request's shape before the action exists (`action-plans` R29) answers through it. `extra` adds a caller's
   own fields beside these and never replaces one of them. Writes nothing and never throws. */
const REMINDER_REFUSED_FIXED = new Set(["ok", "reason", "code", "check", "translation", "detail", "arm"]);
const textOf = (v) => { try { return v === undefined || v === null ? null : String(v); } catch { return null; } };
export function reminderRefused(arm, detail, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !REMINDER_REFUSED_FIXED.has(k));
  } catch { own = []; }
  /* DEC-49 REGION is-reminder-refused */
  const row = ACTION_CLOCK_CHECKS.REMINDER_REFUSED;
  return { ok: false, reason: "REMINDER_REFUSED", code: "REMINDER_REFUSED", check: row.check, translation: row.translation,
           ...Object.fromEntries(own), detail: textOf(detail), arm: textOf(arm) };
  /* END DEC-49 REGION is-reminder-refused */
}

export class ActionClocks {
  #deps;

  constructor({ storage, record, membership, promotion = null, actions = null, conformance = null, localFacts = null,
                standards = null, combine: combineProfiles = combine, host = null, now = null, env = null } = {}) {
    this.sql = storage.sql;
    this.combine = typeof combineProfiles === "function" ? combineProfiles : combine;
    this.record = record;
    this.membership = membership;
    this.#deps = { host, promotion, actions, conformance: conformance ?? undefined, localFacts: localFacts ?? undefined,
                   standards: standards ?? undefined };
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
  }

  get actions() { return this.#deps.actions ||= actionsOf(this.#deps.host); }
  /* R13: the revision is a promotion, judged by `actions`' check (its R1–R3, R7) like any other. */
  get promotion() { return this.#deps.promotion ||= promotionOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  /* R3, R5 (K702): conformance's `determinationRead`, reached on the same host unless a test passes its own; null where
     it cannot be created, and every project then reads null. */
  get conformance() {
    if (this.#deps.conformance === undefined || this.#deps.conformance === null) {
      try { this.#deps.conformance = conformanceOf(this.#deps.host); } catch { this.#deps.conformance = false; }
    }
    return this.#deps.conformance || null;
  }

  /* R10: local-facts' `factStatus`, reached on the same host unless a test passes its own; null where it cannot be
     created, and a business count then states its calendar `not_read` (R12). */
  get localFacts() {
    if (this.#deps.localFacts === undefined || this.#deps.localFacts === null) {
      try { this.#deps.localFacts = localFactsOf(this.#deps.host); } catch { this.#deps.localFacts = false; }
    }
    return this.#deps.localFacts || null;
  }

  /* R7 (K1446): standards' `standardRead` and `inForceAt`, reached on the same host unless a test passes its own; null
     where it cannot be created, and a standard a deadline names then reads undetermined. */
  get standards() {
    if (this.#deps.standards === undefined || this.#deps.standards === null) {
      try { this.#deps.standards = standardsOf(this.#deps.host); } catch { this.#deps.standards = false; }
    }
    return this.#deps.standards || null;
  }

  migrate() { migrateActionClocks(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  /* The instance clock: an explicit `now` (the caller's as-of), then the injected clock, then `env.BIO_NOW_MS`, then
     the wall. An ABSENT param is null or "" and falls through, never read as the epoch. */
  #nowMs(explicit) {
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      const e = Number(explicit);
      if (Number.isFinite(e) && e >= 0) return e;
    }
    if (this.now) { const n = Number(this.now()); if (Number.isFinite(n) && n >= 0) return n; }
    const v = Number(this.env && this.env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }
  /* The UTC day of the instance clock: only R11's horizon of years reads it (its "UTC year"); every day a deadline or a
     reminder is judged on is the action's local day (`#localToday`). */
  #today(explicit = null) { return new Date(this.#nowMs(explicit)).toISOString().slice(0, 10); }
  /* R3, R5, R6 (K1444 (iii); actions R12): the local day of the instance clock in the action's zone (`actionZone`), or
     null when no zone is held: undetermined, never the UTC day. */
  #localToday(fm, view, explicit = null) { return this.#judged(fm, view, explicit).day; }
  /* R3, R5 (N609, K1675): the zone an action's day is judged in at this call and that local day, which each item
     carries so its reader dates and ages it in the zone this module counted in; both null when no zone is held. */
  #judged(fm, view, explicit = null) {
    const zone = actionZone(fm, view);
    return { zone, day: localDayOf(this.#nowMs(explicit), zone) };
  }

  /* R7 (K1431, K1446): what an entry names as its basis: its kind (null when it states none, as every entry written
     before T33-74), its citation, and the kind's own fields; a `rule` naming a held standard answers that standard's
     in-force state on the entry's date (`standards.inForceAt`), the member's citation staying their statement. */
  #basisOf(e, viewer) {
    const kind = e && BASIS_KINDS.includes(e.basis_kind) ? e.basis_kind : null;
    const out = { kind, citation: e && typeof e.basis === "string" ? e.basis : null };
    if (kind === "commitment" && e.committed_by) out.committed_by = String(e.committed_by);
    if (kind === "dependency") Object.assign(out, { precedes: e.precedes ?? null, lead: e.lead ?? null, why: e.why ?? null,
      says: "a date derived from the event it must precede; missing it is a dated fact about sequence, never a violation" });
    if (kind === "rule" && typeof e.standard === "string" && e.standard) {
      const st = this.standards;
      let f = null;
      try { f = st && typeof st.inForceAt === "function" ? st.inForceAt({ standard: e.standard, date: e.date, viewer }) : null; }
      catch { f = null; }
      out.standard = { id: e.standard, state: f && typeof f.state === "string" ? f.state : "undetermined",
                       why: f && f.why ? String(f.why) : f ? null : "the standards module cannot be read here" };
    }
    return out;
  }

  /* R2: the active profiles' combined view (record-core R26), or null with none active or none combinable. */
  #view() {
    let ids = null;
    try { ids = this.record.getSetting("jurisdiction_profiles"); } catch { ids = null; }
    if (typeof ids === "string") { try { ids = JSON.parse(ids); } catch { ids = null; } }
    if (!Array.isArray(ids) || !ids.length) return null;
    let c = null;
    try { c = this.combine(ids); } catch { c = null; }
    return c && c.ok ? c.view : null;
  }

  /* The action's document, the authority for its clock. */
  #heldFm(id) {
    const f = this.record.readFile(id, "bundle.md");
    if (!f || typeof f.text !== "string") return null;
    let fm = null;
    try { fm = parseFrontmatter(f.text).data; } catch { fm = null; }
    return fm && typeof fm === "object" ? fm : null;
  }
  #visibleAction(id, viewer) {
    const gate = viewerPredicate(viewer);
    return this.#one(`SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                     id, ...gate.args);
  }
  /* R3: the member whose write created the action, from its first manifest entry in write order (record-core R16). */
  #createdBy(id) {
    let entries = [];
    try {
      const im = this.record.readImage(id);
      const m = im ? im["_history/manifest.json"] : null;
      entries = (JSON.parse(typeof m === "string" ? m : "{}").entries) || [];
    } catch { entries = []; }
    const first = [...entries].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))[0];
    return first && typeof first.author === "string" ? first.author : null;
  }
  /* R3, R5 (K702): the action's project is the project of the first determination among its `rests_on` legs, in the
     document's order, read through `conformance.determinationRead` as the read's viewer sees it (a leg naming no
     determination, or one the viewer may not see, is passed over); null when it rests on none. */
  #projectOf(fm, viewer) {
    const conf = this.conformance;
    if (!conf || typeof conf.determinationRead !== "function") return null;
    for (const l of (Array.isArray(fm && fm.action_basis) ? fm.action_basis : [])) {
      if (!l || typeof l !== "object" || l.kind !== "rests_on" || typeof l.target !== "string") continue;
      let d = null;
      try { d = conf.determinationRead({ id: l.target, viewer }); } catch { d = null; }
      if (d && d.ok !== false && typeof d.project === "string" && d.project) return d.project;
    }
    return null;
  }

  /* R1, R3: ONE PAGING RULE over the clock entries of the actions `candidates` reads, in (action id, entry position)
     order after `after`: a previous page's `cursor` (`<action>#<position>`), or an action id, read as after all that
     action's entries. A page reads at most `actionsMax` actions and may end inside one; `cursor` is the last entry
     answered when `truncated`, else null, and when the action bound ends a page past an action with no qualifying
     entry, that action's last position instead, so a page always moves on and paging from the start through each
     `cursor` to null reaches every entry. `candidates(seekId, n)` answers up to `n` rows `{bundle_id}` at or after
     `seekId` in id order; `item(r, i, e)` answers the entry's item, or null when it does not qualify. */
  #entryPage({ after, max, actionsMax, candidates, item }) {
    const from = after === null || after === undefined || after === "" ? null : String(after);
    const at = from ? /^(.+)#(\d+)$/.exec(from) : null;
    const seek = at ? { id: at[1], pos: Number(at[2]) } : from ? { id: from, pos: Infinity } : null;
    const rows = candidates(seek ? seek.id : null, actionsMax + 1);
    const items = [];
    let truncated = rows.length > actionsMax;
    let full = false, lastRead = null;
    read: for (const r of rows.slice(0, actionsMax)) {
      const fm = this.#heldFm(r.bundle_id) || {};
      const clock = Array.isArray(fm.clock) ? fm.clock : [];
      const skip = seek && r.bundle_id === seek.id ? seek.pos : -1;
      for (let i = skip + 1; i < clock.length; i++) {
        const it = item(r, i, clock[i]);
        if (!it) continue;
        /* The page is full and an entry remains: the next page resumes after the last one answered. */
        if (items.length === max) { full = truncated = true; break read; }
        items.push(it);
      }
      lastRead = { id: r.bundle_id, end: Math.max(clock.length - 1, Number.isFinite(skip) ? skip : 0, 0) };
    }
    /* The last entry answered; when the page ends on the action bound past an action whose document holds none (its
       projection behind it), the end of that action instead, so the next page still moves on. */
    const tail = items[items.length - 1];
    const cursor = !truncated ? null
      : tail && (full || !lastRead || tail.action === lastRead.id) ? `${tail.action}#${tail.ord}`
        : lastRead ? `${lastRead.id}#${lastRead.end}` : null;
    return { items, truncated, cursor };
  }

  /* ================================================================ the reads across actions (R1, R3, R7) */

  /** R1 (N237, N311): every `pending` clock entry dated before `before` across visible actions, at most 500 per page,
   *  in (action id, entry position) order after `after` (`#entryPage`). The seek is retrieval's projection
   *  (`bundle_projection`, its R61), joined on `bundle_id`; the entries are read from the document, the authority. */
  pendingClocks({ before, limit = null, after = null, viewer = null } = {}) {
    const day = String(before ?? "").slice(0, 10);
    /* DEC-49 REGION is-pending-before */
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day))
      return refuse("PENDING_CLOCKS_BAD_BEFORE", "before= is a date, YYYY-MM-DD", { before: before ?? null });
    /* END DEC-49 REGION is-pending-before */
    const max = clampLimit(limit, PENDING_CLOCKS_MAX, PENDING_CLOCKS_MAX);
    const gate = viewerPredicate(viewer);
    const page = this.#entryPage({
      after, max, actionsMax: PENDING_CLOCKS_ACTIONS_MAX,
      candidates: (seekId, n) => this.#rows(`SELECT b.bundle_id FROM bundles b JOIN ${PROJECTION_TABLE} bp ON bp.bundle_id = b.bundle_id
        WHERE b.object_type='action' AND (${gate.sql}) ${seekId !== null ? "AND b.bundle_id>=?" : ""}
          AND bp.action_clock_next IS NOT NULL AND bp.action_clock_next < ? ORDER BY b.bundle_id LIMIT ?`,
        ...gate.args, ...(seekId !== null ? [seekId] : []), day, n),
      item: (r, i, e) => (!e || e.status !== "pending" || typeof e.date !== "string" || !(e.date < day)) ? null
        : { action: r.bundle_id, ord: i, date: e.date, basis: e.basis ?? null, text: e.text ?? null, past: e.date < day },
    });
    return { ok: true, before: day, items: page.items, limit: max, actions_limit: PENDING_CLOCKS_ACTIONS_MAX,
             truncated: page.truncated, cursor: page.cursor };
  }

  /** R3 (monitoring R34; for `queue-producers` R15): every clock entry of a visible action that is not `resolved` or
   *  `abandoned` whose stored status is `overdue`, or `pending` with a date before the local day of the instance clock
   *  in the action's zone (K1444 (iii); `actions` R12); each with the action's project, the member who created it and
   *  the entry's basis (R7). Paged as R1 (`#entryPage`), over every open action in id order: an `overdue` entry is not
   *  in the projection's clock, so no seek narrows it. R7: overdue is derived at the read (`past`), and the stored
   *  status is reported beside it, never in place of it. An action whose zone is not held has its pending entries'
   *  lateness undetermined: they are left out and counted in `zone_undetermined`. Each item carries `zone`, the zone
   *  whose local day (`local_day`) it was judged on (N609; null for a stored `overdue` of an action with none held), so
   *  `queue-producers` R15 dates and ages it in the same zone. Writes nothing. */
  overdueClocks({ after = null, limit = null, viewer = null, now = null } = {}) {
    const asOf = this.#today(now);
    const view = this.#view();
    const max = clampLimit(limit, OVERDUE_CLOCKS_MAX, OVERDUE_CLOCKS_MAX);
    const gate = viewerPredicate(viewer);
    const closed = CLOSED_ACTION_STATES.map(() => "?").join(",");
    const who = new Map(), judged = new Map();
    let undetermined = 0;
    const page = this.#entryPage({
      after, max, actionsMax: OVERDUE_CLOCKS_ACTIONS_MAX,
      candidates: (seekId, n) => this.#rows(`SELECT b.bundle_id FROM bundles b
        WHERE b.object_type='action' AND b.current_state NOT IN (${closed}) AND (${gate.sql})
          ${seekId !== null ? "AND b.bundle_id>=?" : ""} ORDER BY b.bundle_id LIMIT ?`,
        ...CLOSED_ACTION_STATES, ...gate.args, ...(seekId !== null ? [seekId] : []), n),
      item: (r, i, e) => {
        if (!e || typeof e !== "object") return null;
        if (!judged.has(r.bundle_id)) judged.set(r.bundle_id, this.#judged(this.#heldFm(r.bundle_id) || {}, view, now));
        const { zone, day: today } = judged.get(r.bundle_id);
        const dated = typeof e.date === "string" && isDay(e.date);
        if (e.status === "pending" && dated && today === null) { undetermined++; return null; }
        const past = dated && today !== null ? e.date < today : today === null ? null : false;
        if (!(e.status === "overdue" || (e.status === "pending" && past === true))) return null;
        if (!who.has(r.bundle_id)) who.set(r.bundle_id, { project: this.#projectOf(this.#heldFm(r.bundle_id), viewer), created_by: this.#createdBy(r.bundle_id) });
        return { action: r.bundle_id, ord: i, date: typeof e.date === "string" ? e.date : null, basis: e.basis ?? null,
                 text: e.text ?? null, status: e.status, past, ...who.get(r.bundle_id), basis_of: this.#basisOf(e, viewer),
                 local_day: today, zone };
      },
    });
    return { ok: true, as_of: asOf, items: page.items, limit: max, actions_limit: OVERDUE_CLOCKS_ACTIONS_MAX,
             truncated: page.truncated, cursor: page.cursor, zone_undetermined: undetermined };
  }

  /* ================================================================ the proposal (R2) */

  /** R2 (was `actions` R32; C-1, C-2, C-4, K1444, K1445): a clock entry computed from a profile deadline that applies
   *  to the action's kind, by `civil-time` (`computeDeadline`), stored apart with its trace and labelled; never written
   *  into `clock[]` (R13's adoption, a member's act, is the one way it reaches the document). Its basis kind is `rule`
   *  (R7). A rule whose basis is absent or `UNMEASURED` is no basis: its date is undetermined (K1445). */
  clockPropose({ target, rule, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who) return { ok: false, reason: "NO_AUTHOR", detail: "this call carries nobody: the proposer is stamped from the credential that asked." };
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    /* R2 (N246): an absent `rule` has no code of its own; it is answered `NO_SUCH_RULE` at that code's place. */
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const fm = this.#heldFm(target) || {};
    const view = this.#view();
    const d = rule ? (view && Array.isArray(view.deadlines) ? view.deadlines : [])
      .find((x) => x && x.rule === rule && x.applies_to === fm.action_kind) : null;
    if (!d) return { ok: false, reason: "NO_SUCH_RULE", target, rule: rule || null,
      detail: rule ? `no active profile states a deadline '${String(rule).slice(0, 60)}' for an action of kind '${fm.action_kind}'`
                   : `no rule was named: name the profile deadline's rule (rule=<rule>) for an action of kind '${fm.action_kind}'` };
    const sourced = typeof d.basis === "string" && d.basis.trim() && d.basis !== "UNMEASURED";
    const computed = sourced ? computeDeadline(d, fm, view, { factOf: this.#factOf(viewer) })
      : { date: null, why: "the rule is not held with a primary source: UNMEASURED is not a basis (K1445; jurisdictions R44)" };
    const basis = `${d.citation}${d.basis ? ` (profile basis: ${d.basis}${d.profile ? `, ${d.profile}` : ""})` : ""}`;
    const amount = d.amount ?? d.days;
    const unit = (d.units ?? "days") === "days" ? `${d.count ?? ""} day${amount === 1 ? "" : "s"}`.trim() : String(d.units).replace(/_/g, " ");
    const entry = { text: d.rule, description: `${amount} ${unit} ${d.direction === "backward" ? "before" : "from"} ${d.starts}`,
                    date: computed.date, basis, status: "pending", basis_kind: "rule" };
    const at = stampInstant("second", this.#nowMs(null));
    const kept = { trace: computed.trace ?? null, due: computed.due ?? null, candidates: computed.candidates ?? null,
                   extension: computed.extension ?? null, observed: computed.observed ?? null, calendar: computed.calendar ?? null,
                   start: computed.start ?? null, trace_line: computed.date ? traceLine(computed) : null };
    this.sql.exec(`INSERT INTO action_clock_proposals (bundle_id, proposed_by, rule, date, basis, entry_json, why, proposed_at,
        trace_json, adopted_by, adopted_at, adopted_ord)
      VALUES (?,?,?,?,?,?,?,?,?,NULL,NULL,NULL) ON CONFLICT(bundle_id, proposed_by, rule) DO UPDATE SET date=excluded.date,
      basis=excluded.basis, entry_json=excluded.entry_json, why=excluded.why, proposed_at=excluded.proposed_at,
      trace_json=excluded.trace_json, adopted_by=NULL, adopted_at=NULL, adopted_ord=NULL`,
      target, who, rule, computed.date, basis, JSON.stringify(entry), computed.why ?? null, at, JSON.stringify(kept));
    return { ok: true, target, weight: "single", evidence: false,
             proposal: { ...proposalLabelFor(who), key: `${rule}@${who}`, rule, entry, at,
                         ...(computed.start ? { start: computed.start, counted_from: `the day after ${computed.start}` } : {}),
                         ...(computed.candidates ? { candidates: computed.candidates } : {}),
                         ...(computed.due ? { due: computed.due } : {}),
                         ...(computed.extension ? { extension: computed.extension } : {}),
                         ...(computed.observed ? { observed: computed.observed } : {}),
                         ...(computed.trace ? { trace: computed.trace } : {}),
                         ...(computed.calendar ? { calendar: computed.calendar } : {}),
                         ...(computed.date ? {} : { undetermined: computed.why }) },
             says: "this clock entry is proposed and is not on the action's clock: a member adopts it (op=clockadopt) "
                 + "or states a clock entry by a revision of the action." };
  }

  /* R10, R12: the count's reader of the holiday entries' confirmations is `factReader` over this host's local-facts, the
     one reader (R12): null where local-facts cannot be created or has no `factStatus`, and the count then states its
     calendar `not_read`. */
  #factOf(viewer) { return factReader(this.localFacts, viewer); }

  /** R11 (for `queue-producers` R21, through `local-facts` R4): the `local-facts` paths a live deadline reads, once each,
   *  with the actions that read them. For every visible action not `resolved` or `abandoned` whose kind has a profile
   *  deadline counted in business days: its offices' `hours`; and, when one of its kind's deadlines reads the office
   *  calendar (`readsOfficeCalendar`: a count that skips or rolls past closed days and names no closure list), the
   *  office-calendar entries that apply to its offices (R10) for each year from the UTC year of the instance clock to
   *  the year of its latest pending clock entry, and at least the next year. A closure-list entry is never a path
   *  (K1519; local-facts R6). Only facts the active profiles hold are paths (a year they do not list has no fact to
   *  confirm, and a count reaching it is undetermined, jurisdictions R33). Each path's actions are `{action, project,
   *  created_by}`, the project and creator as R3 computes them (K1000). At most 500 actions read, `truncated` stated. */
  calendarFactsRead({ viewer = null, now = null } = {}) {
    const today = this.#today(now);
    const view = this.#view();
    const deadlines = (view && Array.isArray(view.deadlines) ? view.deadlines : []).filter((d) => d && typeof d.applies_to === "string");
    const business = new Set(deadlines.filter((d) => d.count === "business").map((d) => d.applies_to));
    const calendarKinds = new Set(deadlines.filter(readsOfficeCalendar).map((d) => d.applies_to));
    const gate = viewerPredicate(viewer);
    const closed = CLOSED_ACTION_STATES.map(() => "?").join(",");
    const rows = business.size ? this.#rows(`SELECT b.bundle_id FROM bundles b
      WHERE b.object_type='action' AND b.current_state NOT IN (${closed}) AND (${gate.sql}) ORDER BY b.bundle_id LIMIT ?`,
      ...CLOSED_ACTION_STATES, ...gate.args, CALENDAR_FACTS_ACTIONS_MAX + 1) : [];
    const read = new Map();
    const add = (path, a) => {
      if (typeof path !== "string" || !path) return;
      if (!read.has(path)) read.set(path, []);
      if (!read.get(path).includes(a)) read.get(path).push(a);
    };
    const y0 = Number(today.slice(0, 4));
    for (const r of rows.slice(0, CALENDAR_FACTS_ACTIONS_MAX)) {
      const fm = this.#heldFm(r.bundle_id) || {};
      if (!business.has(fm.action_kind)) continue;
      /* K1000: the action as its paths answer it, one object shared by every path it reads. */
      const a = { action: r.bundle_id, project: this.#projectOf(fm, viewer), created_by: this.#createdBy(r.bundle_id) };
      const offices = actionOffices(fm, view);
      if (calendarKinds.has(fm.action_kind)) {
        let y1 = y0 + 1;
        for (const e of Array.isArray(fm.clock) ? fm.clock : [])
          if (e && e.status === "pending" && isDay(e.date)) y1 = Math.max(y1, Number(e.date.slice(0, 4)));
        for (let y = y0; y <= y1; y++)
          for (const h of yearEntries(view, offices, y).entries) { try { add(factPath(holidayFact(h)), a); } catch { /* no path */ } }
      }
      for (const f of officeHours(view, offices)) { try { add(factPath(f), a); } catch { /* no path */ } }
    }
    const paths = [...read.keys()].sort().map((path) => ({ path, actions: read.get(path).map((a) => ({ ...a })) }));
    return { ok: true, as_of: today, paths, actions_limit: CALENDAR_FACTS_ACTIONS_MAX,
             truncated: rows.length > CALENDAR_FACTS_ACTIONS_MAX };
  }

  /* ================================================================ the reminders (R4–R6, R8) */

  /* R4, R6, R8: a reminder is a member's own request. A machine credential, or a call stamped with nobody, is refused
     by shape (REC-46's one predicate) before anything else is asked. */
  #machineReminder(author) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-reminder */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_SET_REMINDER", "a reminder is a member's own request to be reminded, set, changed "
        + "and answered by that member alone. A machine credential never sets one, and a call that carries nobody "
        + "is not a member. Nothing was changed.");
    /* END DEC-49 REGION is-machine-reminder */
    return null;
  }
  /* R4, R6: the action as the viewer may see it, through `actions`' read (its R29); absent, invisible and not an action
     are answered alike, through `actions`' one answer (its R43). */
  #actionFor(target, viewer) {
    const r = target ? this.actions.actionRead({ id: String(target), viewer }) : null;
    return r && r.ok ? r : null;
  }
  #standing(target) {
    return this.#one(`SELECT COUNT(*) AS n FROM action_reminders WHERE bundle_id=? AND answered_at IS NULL
                       AND removed_at IS NULL`, target).n;
  }
  #held(target, entry, day, who) {
    return this.#one(`SELECT rid, day FROM action_reminders WHERE bundle_id=? AND entry=? AND day=? AND set_by=?
                       AND answered_at IS NULL AND removed_at IS NULL ORDER BY rid LIMIT 1`, target, entry, day, who);
  }

  /** R4 (`op=reminderset`; DEC-94, K624 (3)): a member asks to be reminded of the dated clock entry at position `entry`
   *  of the action `target` on the day `on`; with `from`, changes their own reminder on that entry from `from` to `on`,
   *  or with `on: null` removes it. A row of this module's own table, never a field or a revision of the action's
   *  document, which this act leaves unchanged. */
  reminderSet({ target, entry, on = null, from = null, author = null, viewer = null } = {}) {
    const machine = this.#machineReminder(author);
    if (machine) return { ...machine, target: target ?? null };
    const who = String(author).trim();
    const a = this.#actionFor(target, viewer);
    if (!a) return noSuchAction(target ?? null);
    const pos = typeof entry === "number" ? entry : /^\d+$/.test(String(entry ?? "").trim()) ? Number(String(entry).trim()) : NaN;
    const e = Number.isInteger(pos) && pos >= 0 ? a.clock[pos] : undefined;
    if (!e || typeof e !== "object" || !isDay(e.date))
      return reminderRefused("entry", `entry ${String(entry ?? "").slice(0, 20) || "(none)"} names no clock entry of `
        + "this action with a YYYY-MM-DD date: a reminder is set on a dated deadline. Nothing was changed.",
        { target: a.id, entry: entry ?? null });
    const day = on === null || on === undefined || on === "" ? null : String(on).trim();
    const was = from === null || from === undefined || from === "" ? null : String(from).trim();
    if (day === null && was === null)
      return reminderRefused("on", "on= is the day to be reminded, YYYY-MM-DD; with no day, name the reminder "
        + "to remove as from=. Nothing was changed.", { target: a.id, entry: pos });
    if (day !== null && !isDay(day))
      return reminderRefused("on", `on '${day.slice(0, 20)}' is not a date written YYYY-MM-DD. Nothing was changed.`,
        { target: a.id, entry: pos, on: day.slice(0, 20) });
    const at = stampInstant("second", this.#nowMs(null));
    return this.record.transact(() => {
      const old = was === null ? null : this.#held(a.id, pos, was, who);
      if (was !== null && !old)
        return reminderRefused("from", `from ${was.slice(0, 20)} names no reminder of yours on this entry: you `
          + "change or remove only a reminder you set. Nothing was changed.", { target: a.id, entry: pos, from: was.slice(0, 20) });
      if (day !== null && this.#held(a.id, pos, day, who))
        return reminderRefused("held", `you already hold a reminder on this entry for ${day}. Nothing was changed.`,
          { target: a.id, entry: pos, on: day });
      if (day !== null && !old && this.#standing(a.id) >= REMINDERS_PER_ACTION_MAX)
        return reminderRefused("bound", `this action holds ${REMINDERS_PER_ACTION_MAX} reminders, the most it `
          + "holds. Nothing was changed.", { target: a.id, entry: pos, max: REMINDERS_PER_ACTION_MAX });
      if (old) this.sql.exec(`UPDATE action_reminders SET removed_at=? WHERE rid=?`, at, old.rid);
      if (day !== null)
        this.sql.exec(`INSERT INTO action_reminders (bundle_id, entry, day, set_by, set_at) VALUES (?,?,?,?,?)`,
          a.id, pos, day, who, at);
      return { ok: true, target: a.id, entry: pos, on: day, from: was };
    });
  }

  /** R4: an action's reminders, each with its entry, its day, who set it, when, and its state (`waiting`, `due` or
   *  `answered`; `undetermined` while the action's zone is not held), in (entry, day, member) order, at most 500 with
   *  `truncated`; `as_of` is the action's local day. A reminder changed or removed is gone. */
  remindersFor({ action, viewer = null, now = null } = {}) {
    const a = this.#actionFor(action, viewer);
    if (!a) return noSuchAction(action ?? null);
    /* R5 (K1444 (iii)): due on the action's local day; with no zone held, a standing reminder's state is undetermined. */
    const today = this.#localToday(this.#heldFm(a.id) || {}, this.#view(), now);
    const rows = this.#rows(`SELECT entry, day, set_by, set_at, answered_at FROM action_reminders
      WHERE bundle_id=? AND removed_at IS NULL ORDER BY entry, day, set_by, rid LIMIT ?`, a.id, REMINDERS_READ_MAX + 1);
    const reminders = rows.slice(0, REMINDERS_READ_MAX).map((r) => ({
      entry: r.entry, on: r.day, set_by: r.set_by, set_at: r.set_at, answered_at: r.answered_at ?? null,
      state: r.answered_at ? "answered" : today === null ? "undetermined" : r.day <= today ? "due" : "waiting" }));
    return { ok: true, action: a.id, as_of: today, reminders, limit: REMINDERS_READ_MAX,
             truncated: rows.length > REMINDERS_READ_MAX, standing_max: REMINDERS_PER_ACTION_MAX };
  }

  /** R5 (for `queue-producers` R18): every reminder whose day has come at `nowMs` and that is not answered, on an entry
   *  still `pending` of a visible action not `resolved` or `abandoned`, at most 500 per page in (action id, entry
   *  position, day) order (then the member, so the order is total). `cursor` is the last reminder answered,
   *  `<action>#<position>#<day>#<member>`, when `truncated`, else null; `after` is a previous page's cursor or an action
   *  id, read as after all that action's reminders. The entry is read as it stands (an entry a later revision removed
   *  or re-dated is answered only while the entry at that position is pending). A day "has come" on the local day of
   *  `nowMs` in the action's zone (Terms; K1444 (iii)): never the UTC day, and not at all while no zone is held. Each
   *  item carries `zone`, the zone whose local day its reminder was judged due on (N609), for `queue-producers` R18.
   *  Writes nothing. */
  remindersDue({ nowMs = null, after = null, limit = null, viewer = null } = {}) {
    const today = this.#today(nowMs);
    const view = this.#view();
    /* K1444 (iii): a reminder's day has come on the action's local day. The SQL bound is the latest local day any zone
       has reached (UTC+14), each row then judged on its own action's day; an action with no zone held is not due. */
    const bound = new Date(this.#nowMs(nowMs) + 14 * 3600000).toISOString().slice(0, 10);
    const judged = new Map();
    const judgedOf = (id) => { if (!judged.has(id)) judged.set(id, this.#judged(fmOf(id), view, nowMs)); return judged.get(id); };
    const max = clampLimit(limit, REMINDERS_DUE_MAX, REMINDERS_DUE_MAX);
    const gate = viewerPredicate(viewer);
    const closed = CLOSED_ACTION_STATES.map(() => "?").join(",");
    const from = after === null || after === undefined || after === "" ? null : String(after);
    const at = from ? /^(.+)#(\d+)#(\d{4}-\d{2}-\d{2})#(.*)$/.exec(from) : null;
    /* The seek: strictly after the named reminder, or after every reminder of the named action. */
    const seek = at ? { sql: `AND (r.bundle_id > ? OR (r.bundle_id = ? AND (r.entry > ? OR (r.entry = ? AND (r.day > ?
                               OR (r.day = ? AND r.set_by > ?))))))`,
                        args: [at[1], at[1], Number(at[2]), Number(at[2]), at[3], at[3], at[4]] }
      : from ? { sql: "AND r.bundle_id > ?", args: [from] } : { sql: "", args: [] };
    const docs = new Map();
    const fmOf = (id) => { if (!docs.has(id)) docs.set(id, this.#heldFm(id) || {}); return docs.get(id); };
    const items = [];
    let truncated = false;
    let cur = { sql: seek.sql, args: seek.args };
    /* Read on in order until the page is full or the reminders run out; a due reminder whose entry is no longer
       pending is passed over. Each batch reads one more than the page can still take. */
    for (;;) {
      const rows = this.#rows(`SELECT r.bundle_id, r.entry, r.day, r.set_by FROM action_reminders r
        JOIN bundles b ON b.bundle_id = r.bundle_id
        WHERE r.answered_at IS NULL AND r.removed_at IS NULL AND r.day <= ? AND b.object_type='action'
          AND b.current_state NOT IN (${closed}) AND (${gate.sql}) ${cur.sql}
        ORDER BY r.bundle_id, r.entry, r.day, r.set_by LIMIT ?`,
        bound, ...CLOSED_ACTION_STATES, ...gate.args, ...cur.args, max + 1);
      let last = null;
      for (const r of rows) {
        last = r;
        const clock = Array.isArray(fmOf(r.bundle_id).clock) ? fmOf(r.bundle_id).clock : [];
        const e = clock[r.entry];
        if (!e || typeof e !== "object" || e.status !== "pending") continue;
        const { zone, day: local } = judgedOf(r.bundle_id);
        if (local === null || r.day > local) continue;
        if (items.length === max) { truncated = true; break; }
        items.push({ action: r.bundle_id, ord: r.entry, date: e.date ?? null, basis: e.basis ?? null, text: e.text ?? null,
                     on: r.day, set_by: r.set_by, project: this.#projectOf(fmOf(r.bundle_id), viewer), zone });
      }
      if (truncated || rows.length <= max || !last) break;
      cur = { sql: `AND (r.bundle_id > ? OR (r.bundle_id = ? AND (r.entry > ? OR (r.entry = ? AND (r.day > ?
                     OR (r.day = ? AND r.set_by > ?))))))`,
              args: [last.bundle_id, last.bundle_id, last.entry, last.entry, last.day, last.day, last.set_by] };
    }
    const tail = items[items.length - 1];
    const cursor = truncated && tail ? `${tail.action}#${tail.ord}#${tail.on}#${tail.set_by}` : null;
    return { ok: true, as_of: today, items, limit: max, truncated, cursor };
  }

  /** R6 (`op=reminderanswer`; DEC-10, DEC-94 (1)): the member who set a due reminder answers it, with `on` another
   *  reminder on that later day, or without it no further reminder. Every due, unanswered reminder of the author's on
   *  that entry is recorded answered; the action's document is unchanged. */
  reminderAnswer({ target, entry, on = null, author = null, viewer = null } = {}) {
    const machine = this.#machineReminder(author);
    if (machine) return { ...machine, target: target ?? null };
    const who = String(author).trim();
    const a = this.#actionFor(target, viewer);
    if (!a) return noSuchAction(target ?? null);
    /* K1444 (iii): due, and later, on the action's local day; with no zone held nothing is due. */
    const today = this.#localToday(this.#heldFm(a.id) || {}, this.#view(), null);
    const pos = typeof entry === "number" ? entry : /^\d+$/.test(String(entry ?? "").trim()) ? Number(String(entry).trim()) : NaN;
    const due = Number.isInteger(pos) && pos >= 0 && today !== null
      ? this.#rows(`SELECT rid, day FROM action_reminders WHERE bundle_id=? AND entry=? AND set_by=? AND day <= ?
                      AND answered_at IS NULL AND removed_at IS NULL ORDER BY day, rid`, a.id, pos, who, today) : [];
    /* DEC-49 REGION is-no-such-reminder */
    if (!due.length)
      return refuse("NO_SUCH_REMINDER", "no reminder of yours on this entry has come due and is waiting for an answer. "
        + "Nothing was answered.", { target: a.id, entry: Number.isInteger(pos) ? pos : (entry ?? null) });
    /* END DEC-49 REGION is-no-such-reminder */
    const day = on === null || on === undefined || on === "" ? null : String(on).trim();
    if (day !== null && (!isDay(day) || !(day > today)))
      return reminderRefused("on", `on '${day.slice(0, 20)}' is not a date written YYYY-MM-DD after today `
        + `(${today}): a further reminder is for a later day. Nothing was answered.`, { target: a.id, entry: pos, today });
    const at = stampInstant("second", this.#nowMs(null));
    return this.record.transact(() => {
      for (const r of due) this.sql.exec(`UPDATE action_reminders SET answered_at=? WHERE rid=?`, at, r.rid);
      /* R4's add, under its own rules: a day already held is held once; the answered ones freed their places. */
      if (day !== null && !this.#held(a.id, pos, day, who)) {
        if (this.#standing(a.id) >= REMINDERS_PER_ACTION_MAX)
          return reminderRefused("bound", `this action holds ${REMINDERS_PER_ACTION_MAX} reminders, the most it `
            + "holds. Nothing was answered.", { target: a.id, entry: pos, max: REMINDERS_PER_ACTION_MAX });
        this.sql.exec(`INSERT INTO action_reminders (bundle_id, entry, day, set_by, set_at) VALUES (?,?,?,?,?)`,
          a.id, pos, day, who, at);
      }
      return { ok: true, target: a.id, entry: pos, answered: due.map((r) => r.day), next: day };
    });
  }

  /* ================================================================ adopting a computed deadline (R13, R7, R8) */

  /** R13 (K1440; `op=clockadopt`): a member adopts a standing proposal of R2 as a clock entry of the action, in one act:
   *  the entry, with its basis (R7: kind `rule`, the rule's citation, a held standard the member names) and the trace
   *  R2 answered, is appended to the document's `clock[]` by a revision of the action (`promotion`, judged by `actions`'
   *  check, its R1–R3, R7), and the proposal is recorded adopted with who, when and the entry's position. `proposal` is
   *  the key R2 answered (`<rule>@<proposer>`); `date`, `text` and `description` amend the entry before it is adopted
   *  (`amended` then marks it). Refusals in order: `MACHINE_CANNOT_ADOPT_CLOCK`; `NO_SUCH_ACTION`;
   *  `NO_SUCH_CLOCK_PROPOSAL` (none standing on this action by that key: never proposed, or already adopted);
   *  `CLOCK_PROPOSAL_UNDETERMINED`; then `NO_SUCH_STANDARD` for a `standard` the author may not see; then the
   *  revision's own refusals (the lease's, and the promotion's, `actions`' among them). */
  clockAdopt({ target, proposal, why = null, date = null, text = null, description = null, standard = null,
               author = null, viewer = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-adopt */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_ADOPT_CLOCK", "a deadline is put on an action's clock by a member, in their own act; "
        + "a machine credential proposes one and never adopts it, and a call that carries nobody is not a member. "
        + "Nothing was written.", { target: target ?? null });
    /* END DEC-49 REGION is-machine-adopt */
    const a = this.#actionFor(target, viewer);
    if (!a) return noSuchAction(target ?? null);
    const key = String(proposal ?? "");
    const at = key.indexOf("@");
    const p = at > 0 ? this.#one(`SELECT * FROM action_clock_proposals WHERE bundle_id=? AND rule=? AND proposed_by=?
                                    AND adopted_at IS NULL`, a.id, key.slice(0, at), key.slice(at + 1)) : null;
    /* DEC-49 REGION is-no-such-clock-proposal */
    if (!p)
      return refuse("NO_SUCH_CLOCK_PROPOSAL", `no standing proposal '${key.slice(0, 120)}' on this action: name the key `
        + "op=clockpropose answered (<rule>@<proposer>), for a proposal not yet adopted. Nothing was written.",
        { target: a.id, proposal: key.slice(0, 200) || null });
    /* END DEC-49 REGION is-no-such-clock-proposal */
    /* DEC-49 REGION is-clock-proposal-undetermined */
    if (p.date === null || p.date === undefined)
      return refuse("CLOCK_PROPOSAL_UNDETERMINED", `the proposed deadline has no date: ${p.why || "it is undetermined"}. `
        + "A member states such an entry by their own revision of the action, with its basis. Nothing was written.",
        { target: a.id, proposal: key, why: p.why ?? null });
    /* END DEC-49 REGION is-clock-proposal-undetermined */
    let entry = {};
    try { entry = JSON.parse(p.entry_json) || {}; } catch { entry = {}; }
    let kept = {};
    try { kept = JSON.parse(p.trace_json || "{}") || {}; } catch { kept = {}; }
    const amend = {};
    if (date !== null && date !== undefined && date !== "") {
      if (!isDay(String(date))) return refuse("CLOCK_ENTRY_REFUSED", `date '${String(date).slice(0, 20)}' is not a calendar day `
        + "written YYYY-MM-DD. Nothing was written.", { target: a.id, proposal: key });
      amend.date = String(date);
    }
    for (const [k, v] of [["text", text], ["description", description]])
      if (v !== null && v !== undefined && String(v).trim()) amend[k] = String(v);
    const std = standard === null || standard === undefined || standard === "" ? null : String(standard).trim();
    if (std) {
      const st = this.standards;
      let r = null;
      try { r = st ? st.standardRead({ id: std, viewer: who }) : null; } catch { r = null; }
      if (!r || r.ok === false) return noSuchStandard(std, { target: a.id });
    }
    const when = stampInstant("second", this.#nowMs(null));
    const written = { text: amend.text ?? entry.text, description: amend.description ?? entry.description,
      date: amend.date ?? entry.date, basis: entry.basis, status: "pending", basis_kind: "rule",
      ...(std ? { standard: std } : {}), trace: kept.trace_line || traceLine({ trace: kept.trace, start: kept.start }),
      proposal: key, proposed_by: p.proposed_by, adopted_by: who, adopted_at: when,
      ...(Object.keys(amend).length ? { amended: Object.keys(amend).sort().join(",") } : {}),
      ...(why !== null && why !== undefined && String(why).trim() ? { adopted_why: String(why) } : {}) };
    return this.#reviseClock(a.id, written, who, viewer, when, (ord) => {
      this.sql.exec(`UPDATE action_clock_proposals SET adopted_by=?, adopted_at=?, adopted_ord=? WHERE bundle_id=? AND
                      proposed_by=? AND rule=?`, who, when, ord, a.id, p.proposed_by, p.rule);
      return { ok: true, target: a.id, proposal: key, ord, entry: written, adopted_by: who, adopted_at: when,
               says: "the deadline is now on the action's clock, stated by you; it is tracked and told once like any other." };
    });
  }

  /* R13: one revision of the action appending `e` to `clock[]`, under a 30-second lease the member holds (released on
     every path), on the held version, carrying every other live file. `done(ord)` answers once the promotion lands. */
  #reviseClock(id, e, who, viewer, when, done) {
    const lease = this.record.acquireLease(id, who, ADOPT_LEASE_MS);
    if (!lease || !lease.ok)
      return { ok: false, reason: "LEASE_HELD", target: id, heldBy: lease && lease.heldBy, until: lease && lease.until,
               detail: "another member is writing to this action right now. Nothing was written; try again shortly." };
    try {
      const f = this.record.readFile(id, "bundle.md");
      if (!f || typeof f.text !== "string")
        return { ok: false, reason: "NO_DOCUMENT", target: id, detail: "this action has no readable bundle.md. Nothing was written." };
      let fm = {};
      try { fm = parseFrontmatter(f.text).data || {}; } catch { fm = {}; }
      const ord = Array.isArray(fm.clock) ? fm.clock.length : 0;
      let text = spliceClock(f.text, e);
      let check = null;
      try { check = text ? parseFrontmatter(text).data : null; } catch { check = null; }
      if (!text || !check || !Array.isArray(check.clock) || check.clock.length !== ord + 1 || check.clock[ord].date !== e.date)
        return { ok: false, reason: "UNSPLICEABLE_CLOCK", target: id,
                 detail: "this action's clock block is not in a shape this grammar can extend in place; appending never "
                       + "rewrites the rest of the document, so nothing was written." };
      text = setScalar(text, "last_updated", `"${when}"`);
      const bytes = new TextEncoder().encode(text);
      const carried = [];
      for (const path of this.record.livePaths(id) || []) {
        if (path === "bundle.md") continue;
        const c = this.record.readFile(id, path);
        if (!c) continue;
        carried.push(typeof c.text === "string" ? { path, text: c.text, bytes: new TextEncoder().encode(c.text).length, sha256: c.sha256 }
                                                : { path, blobSha: c.blobSha, sha256: c.sha256, bytes: c.bytes });
      }
      const head = this.record.head(id);
      const b = this.#one(`SELECT current_state FROM bundles WHERE bundle_id=?`, id) || {};
      const promoted = this.promotion.promote({
        bundleId: id, base: head ? head.bundleSha : null, snapKey: `${when.replace(/[-:]/g, "")}_clock${ord}`,
        author: who, viewer: viewer ?? who,
        files: [{ path: "bundle.md", text, bytes: bytes.length, sha256: createSha256().update(bytes).hex() }, ...carried],
        meta: { object_type: fm.object_type ?? "action", title: fm.title, current_state: b.current_state ?? fm.current_state,
                prior_state: fm.prior_state ?? null, created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
      });
      if (!promoted || !promoted.ok) return { ...(promoted || { ok: false, reason: "PROMOTION_FAILED" }), target: id };
      return done(ord);
    } finally {
      try { this.record.releaseLease(id, who); } catch { /* record-core R61 never throws */ }
    }
  }

  /* ================================================================ the calendar file (R14) */

  /** R14 (K1451; `op=clocksics`, a read): one iCalendar file of the pending dated clock entries of each named action the
   *  viewer may see: an all-day event on the entry's day in the action's zone, its summary the entry's text, its
   *  description the basis (R7) and the action's id, a stable `UID` per (action, entry position). A one-off file for
   *  the member to save: no address is published, nothing is pushed, no outside channel is used (DEC-94 (3)). An
   *  action absent or invisible answers `actions.noSuchAction`; an entry with no date is left out and counted. At most
   *  200 actions. Writes nothing. */
  clocksIcs({ actions = null, viewer = null } = {}) {
    const ids = (Array.isArray(actions) ? actions : String(actions ?? "").split(","))
      .map((x) => String(x ?? "").trim()).filter(Boolean);
    const unique = [...new Set(ids)];
    if (!unique.length || unique.length > CLOCKS_ICS_ACTIONS_MAX)
      return { ok: false, reason: "CLOCKS_ICS_REFUSED", code: "CLOCKS_ICS_REFUSED", max: CLOCKS_ICS_ACTIONS_MAX,
               detail: `name one to ${CLOCKS_ICS_ACTIONS_MAX} actions (actions=<id>,<id>). Nothing was read.` };
    const view = this.#view();
    const events = [];
    let undated = 0;
    for (const id of unique) {
      const a = this.#actionFor(id, viewer);
      if (!a) return noSuchAction(id);
      const fm = this.#heldFm(a.id) || {};
      const zone = actionZone(fm, view);
      (Array.isArray(fm.clock) ? fm.clock : []).forEach((e, i) => {
        if (!e || typeof e !== "object" || e.status !== "pending") return;
        if (!isDay(e.date)) { undated++; return; }
        events.push({ uid: `${a.id}.${i}@civicos`, day: e.date, zone,
                      summary: String(e.text ?? "Deadline"), description: `${basisWords(this.#basisOf(e, viewer))}\nAction: ${a.id}` });
      });
    }
    const ics = icsCalendar({ events, stampMs: this.#nowMs(null) });
    return { ok: true, filename: "deadlines.ics", content_type: "text/calendar; charset=utf-8", ics, events: events.length,
             left_out: { undated }, says: "a file for you to save; nothing is published or sent." };
  }

  /* ================================================================ the group's own lateness (R15) */

  /* R15: the local day an entry at `ord` was met: its `met_on` when stated, else the action's `last_updated` in the first
     version of its document that shows the entry `met` (the record's history, read in write order), as a local day in
     the action's zone; null when neither is held. */
  #metDay(id, ord, e, zone) {
    if (e && isDay(e.met_on)) return { day: e.met_on, from: "met_on" };
    let im = null;
    try { im = this.record.readImage(id); } catch { im = null; }
    let entries = [];
    try { entries = (JSON.parse(im && typeof im["_history/manifest.json"] === "string" ? im["_history/manifest.json"] : "{}").entries) || []; }
    catch { entries = []; }
    for (const m of [...entries].sort((x, y) => (x.seq ?? 0) - (y.seq ?? 0)).slice(0, LATENESS_VERSIONS_MAX)) {
      let files = [];
      try { files = JSON.parse(im[`_history/promotion_${m.key}.json`] || "{}").files || []; } catch { files = []; }
      const md = files.find((f) => f && f.name === "bundle.md");
      const t = md ? this.record.textAtSha(id, md.sha256) : null;
      if (typeof t !== "string") continue;
      let fm = null;
      try { fm = parseFrontmatter(t).data; } catch { fm = null; }
      const x = fm && Array.isArray(fm.clock) ? fm.clock[ord] : null;
      if (x && x.status === "met") {
        const lu = typeof fm.last_updated === "string" ? fm.last_updated : null;
        const ms = lu ? Date.parse(lu) : NaN;
        const day = Number.isFinite(ms) && /T/.test(lu) ? localDayOf(ms, zone) : lu && isDay(lu.slice(0, 10)) ? lu.slice(0, 10) : null;
        return day ? { day, from: "the version that first shows it met" } : null;
      }
    }
    return null;
  }

  /** R15 (D234, K1471; `op=clocklateness`, a read): an index over the group's own clocks only. For the clock entries of
   *  the actions the viewer may see (in `project` when named) whose basis kind is `commitment`, `dependency` or `window`
   *  and whose date falls in `from`–`to`: the count met on time, the count met late with the days late each
   *  (`civil-time.span`), the count still pending past their date, and the denominator, each a computed fact
   *  (`calc-grammar`'s `evaluate`, its recipe and trace answered), with what it could not count named. Never a finding
   *  about government: no `rule` entry is counted, no counterparty is named, and nothing is written or raised. */
  lateness({ from = null, to = null, project = null, viewer = null, now = null } = {}) {
    const f0 = String(from ?? ""), t0 = String(to ?? "");
    if (!isDay(f0) || !isDay(t0) || f0 > t0)
      return { ok: false, reason: "LATENESS_REFUSED", code: "LATENESS_REFUSED",
               detail: "from= and to= are calendar days written YYYY-MM-DD, from not after to. Nothing was read." };
    const view = this.#view();
    const gate = viewerPredicate(viewer);
    const rows = this.#rows(`SELECT b.bundle_id FROM bundles b WHERE b.object_type='action' AND (${gate.sql})
      ORDER BY b.bundle_id LIMIT ?`, ...gate.args, LATENESS_ACTIONS_MAX + 1);
    const table = [], notCounted = [];
    for (const r of rows.slice(0, LATENESS_ACTIONS_MAX)) {
      const fm = this.#heldFm(r.bundle_id) || {};
      if (project !== null && project !== undefined && project !== "" && this.#projectOf(fm, viewer) !== String(project)) continue;
      const zone = actionZone(fm, view);
      const today = localDayOf(this.#nowMs(now), zone);
      (Array.isArray(fm.clock) ? fm.clock : []).forEach((e, i) => {
        if (!e || typeof e !== "object" || !isDay(e.date) || e.date < f0 || e.date > t0) return;
        const kind = BASIS_KINDS.includes(e.basis_kind) ? e.basis_kind : null;
        if (kind === "rule") return;
        const ref = { action: r.bundle_id, ord: i, date: e.date };
        if (!kind) { notCounted.push({ ...ref, why: "the entry names no basis kind, so whether it is the group's own is not stated" }); return; }
        if (e.status === "met") {
          const m = this.#metDay(r.bundle_id, i, e, zone);
          if (!m) { notCounted.push({ ...ref, kind, why: "met, and the day it was met is not held" }); return; }
          const sp = span({ value: e.date, precision: "day", zone: zone || "UTC" }, { value: m.day, precision: "day", zone: zone || "UTC" }, { unit: "days" });
          const late = sp && Number.isInteger(sp.min) && sp.min === sp.max ? sp.min : null;
          if (late === null) { notCounted.push({ ...ref, kind, why: "the span from its date to the day it was met is undetermined" }); return; }
          table.push({ action: r.bundle_id, ord: i, date: e.date, kind, state: late > 0 ? "late" : "on_time", days_late: late > 0 ? late : 0, met_on: m.day, met_from: m.from });
          return;
        }
        if (e.status === "pending" || e.status === "overdue") {
          if (today === null) { notCounted.push({ ...ref, kind, why: "the action's zone is not held, so whether its date has passed is undetermined" }); return; }
          table.push({ action: r.bundle_id, ord: i, kind, state: e.date < today ? "pending_past" : "not_yet_due", days_late: null });
          return;
        }
        table.push({ action: r.bundle_id, ord: i, kind, state: e.status === "waived" ? "waived" : "other", days_late: null });
      });
    }
    const input = { fields: [{ name: "state", type: "string" }, { name: "days_late", type: "integer" }],
                    rows: table.map((x) => ({ state: x.state, days_late: x.days_late })) };
    const sel = (as, state) => ({ op: "select", as, from: "entries", where: [{ field: "state", test: "eq", value: state }] });
    const recipe = { method: "bio-calc/1", inputs: [{ name: "entries", kind: "table" }], steps: [
      sel("on_time_rows", "on_time"), { op: "count", as: "on_time", from: "on_time_rows" },
      sel("late_rows", "late"), { op: "count", as: "late", from: "late_rows" },
      { op: "sum", as: "days_late", from: "late_rows", field: "days_late" },
      sel("pending_rows", "pending_past"), { op: "count", as: "pending_past", from: "pending_rows" },
      { op: "count", as: "denominator", from: "entries" }], output: "denominator" };
    const ev = table.length ? calcEvaluate(recipe, { entries: input }) : null;
    const zero = { value: "0", sign: "+", precision: "exact" };
    const out = (name) => {
      if (!ev || !Array.isArray(ev.trace)) return zero;
      const st = ev.trace.find((x) => x.step === name);
      return st && st.output ? st.output : zero;
    };
    const fact = (name) => ({ ...out(name), label: "computed fact" });
    return { ok: true, from: f0, to: t0, project: project || null, kinds: [...GROUP_OWN_KINDS],
             on_time: fact("on_time"), late: { ...fact("late"), days_late_total: fact("days_late"),
               each: table.filter((x) => x.state === "late").map((x) => ({ action: x.action, ord: x.ord, date: x.date, days_late: x.days_late, met_on: x.met_on })) },
             pending_past: fact("pending_past"), denominator: fact("denominator"),
             entries: table.map((x) => ({ action: x.action, ord: x.ord, kind: x.kind, state: x.state, ...(x.days_late ? { days_late: x.days_late } : {}) })),
             not_counted: notCounted, actions_limit: LATENESS_ACTIONS_MAX, truncated: rows.length > LATENESS_ACTIONS_MAX,
             method: ev ? { recipe, trace: ev.trace } : { recipe, trace: [] },
             says: "an index over the group's own deadlines (commitments, dependencies and its own windows): never a "
                 + "finding about anyone else's conduct." };
  }
}

/* R2: the label of a clock entry proposed apart; it says, in each state, what the proposal is not. The governing-laws
   label's states are action-grammar's (REC-195, its R2). */
const PROPOSAL_SAYS = {
  machine_proposed: "a machine credential computed this clock entry from the jurisdiction profile. That is machine "
    + "work, labelled as machine work: it is not on the action's clock, and nothing puts it there until a member "
    + "revises the action to state it",
  member_proposed: "a member asked for this clock entry to be computed from the jurisdiction profile. It is a proposal "
    + "and not a clock entry: a member states one by revising the action",
  unstated: "the record does not say who asked for this clock entry",
};
function proposalLabelFor(who) {
  const base = lawProposalLabel(who);
  return { by: base.by, state: base.state, machine_work: base.machine_work, says: PROPOSAL_SAYS[base.state] };
}

/* R13: a scalar of the restricted front-matter grammar, which has no escapes: a line break becomes a space, and a
   value holding a double quote is written in single quotes, or with its double quotes made single when it holds both. */
function fmScalar(v) {
  const t = String(v ?? "").replace(/[\r\n]+/g, " ").trim();
  if (!t.includes('"')) return `"${t}"`;
  if (!t.includes("'")) return `'${t}'`;
  return `"${t.replace(/"/g, "'")}"`;
}
const TOKEN_KEYS = new Set(["date", "status", "basis_kind", "standard", "adopted_at", "met_on"]);
/* R13: `clock[]` with `e` appended after the block's last line, or the block opened before the closing fence when
   absent (as `actions` splices its ledger): the rest of the document is never rewritten. Null for a block this grammar
   cannot extend in place (an inline value other than `[]`). Keys in a fixed order, each only when carried. */
function spliceClock(text, e) {
  const lines = String(text).split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  const order = ["text", "description", "date", "basis", "status", "basis_kind", "standard", "trace", "proposal",
                 "proposed_by", "adopted_by", "adopted_at", "amended", "adopted_why"];
  const kv = order.filter((k) => e[k] !== undefined && e[k] !== null && e[k] !== "")
    .map((k) => `${k}: ${TOKEN_KEYS.has(k) && /^[A-Za-z0-9:._-]+$/.test(String(e[k])) ? (k === "adopted_at" ? `"${e[k]}"` : e[k]) : fmScalar(e[k])}`);
  const block = kv.map((l, i) => (i === 0 ? `  - ${l}` : `    ${l}`));
  let ci = -1;
  for (let i = 1; i < end; i++) if (/^clock:/.test(lines[i])) { ci = i; break; }
  if (ci === -1) return [...lines.slice(0, end), "clock:", ...block, ...lines.slice(end)].join("\n");
  const rest = lines[ci].slice("clock:".length).trim();
  if (rest === "[]") return [...lines.slice(0, ci), "clock:", ...block, ...lines.slice(ci + 1)].join("\n");
  if (rest !== "") return null;
  let last = ci;
  for (let i = ci + 1; i < end; i++) {
    if (lines[i].trim() === "") continue;
    if (/^\s/.test(lines[i])) { last = i; continue; }
    break;
  }
  return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
}
/* A top-level scalar of the front matter replaced in place (left as it is when the key is absent). */
function setScalar(text, key, value) {
  const lines = String(text).split("\n");
  const end = lines.indexOf("---", 1);
  for (let i = 1; i < (end === -1 ? lines.length : end); i++)
    if (lines[i].startsWith(`${key}:`)) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
  return text;
}
/* R7, R14: the basis of an entry in words, for the calendar file. */
function basisWords(b) {
  const cite = b.citation ? `: ${b.citation}` : "";
  if (b.kind === "rule") return `Basis: a law or order${cite}${b.standard ? ` (standard ${b.standard.id}, ${b.standard.state.replace(/_/g, " ")})` : ""}`;
  if (b.kind === "commitment") return `Basis: a commitment${b.committed_by ? ` by ${b.committed_by}` : ""}${cite}`;
  if (b.kind === "dependency") return `Basis: it must precede ${b.precedes ?? "a later event"}${b.lead ? ` (lead ${b.lead})` : ""}${b.why ? `, because ${b.why}` : ""}${cite}`;
  if (b.kind === "window") return `Basis: the group's own window${cite}`;
  return `Basis${cite || ": not stated"}`;
}

/* The reads and acts answer their catalogue-backed refusals with code, check and translation. */
for (const m of ["pendingClocks", "clockPropose", "reminderSet", "reminderAnswer", "clockAdopt"]) {
  const fn = ActionClocks.prototype[m];
  ActionClocks.prototype[m] = function (...a) { return withRow(fn.apply(this, a)); };
}

const instances = new WeakMap();

/** K61: the one instance per host; at creation it creates and declares its tables with their classes (R9), each on
 *  its own declaration. `actions`' copy of `action_clock_proposals` is gone (K914), so this module alone declares it. */
export function actionClocksOf(host, deps) {
  let a = instances.get(host);
  if (!a) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    a = new ActionClocks({ ...d, host, storage, record, membership });
    instances.set(host, a);
    a.migrate();
    void a.actions;   /* `actions` joins the host first, so its declarations and steps stand before this module's */
    /* R9 (plan T33 Rules (6)): each table declared with its classes (record-core R21), in the order they were before. */
    for (const t of ["action_reminders", "action_clock_proposals"])
      record.declareTable("action-clocks", [{ ...ACTION_CLOCKS_TABLE_CLASSES.find((x) => x.name === t) }]);
  }
  return a;
}

/** Which purge declaration names one of this module's tables (record-core R21). */
export function actionClocksOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return ACTION_CLOCKS_TABLES.includes(name);
}

/** The module's ops (K3, K671), entries of the route map `plane` composes (its R5) and control-plane's `dispatch` looks
 *  up: `op=reminderset` (R4), `op=reminderanswer` (R6), `op=clockadopt` (R13), and the reads `op=clocksics` (R14) and
 *  `op=clocklateness` (R15). `viewer` and `author` are the control plane's stamps, read from the query, so a caller's
 *  own copy never wins. */
export function actionClocksOps(m, url, body) {
  const q = (k) => url.searchParams.get(k);
  const has = (k) => url.searchParams.has(k);
  const b = body && typeof body === "object" ? body : {};
  const pick = (k) => (has(k) ? q(k) : b[k] ?? null);
  return {
    reminderset: () => m.reminderSet({ target: pick("target"), entry: pick("entry"), on: pick("on"), from: pick("from"),
                                       author: q("author"), viewer: q("viewer") }),
    reminderanswer: () => m.reminderAnswer({ target: pick("target"), entry: pick("entry"), on: pick("on"),
                                             author: q("author"), viewer: q("viewer") }),
    clockadopt: () => m.clockAdopt({ target: pick("target"), proposal: pick("proposal"), why: pick("why"), date: pick("date"),
                                     text: pick("text"), description: pick("description"), standard: pick("standard"),
                                     author: q("author"), viewer: q("viewer") }),
    clocksics: () => m.clocksIcs({ actions: has("actions") ? url.searchParams.getAll("actions").join(",") : b.actions ?? null,
                                   viewer: q("viewer") }),
    clocklateness: () => m.lateness({ from: pick("from"), to: pick("to"), project: pick("project"), viewer: q("viewer") }),
  };
}
