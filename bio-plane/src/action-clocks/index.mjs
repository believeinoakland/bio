/* action-clocks — the deadlines on the group's actions, read across actions, and the reminders members ask for on them
 * (requirements: `build/requirements/action-clocks.md`; State Rules v1.5 §4.4; `BIO_Action_v0_1.md` §4 rule 5).
 *
 * Split from `actions` (K617, K624 (1); T18 layer 9) by copy: `pendingClocks` and its bounds (R1, was `actions` R31),
 * `clockPropose` with `computeDeadline` and the clock subject of the proposal label (R2, was R32), the
 * `action_clock_proposals` table and `PENDING_CLOCKS_BAD_BEFORE`'s row, with their comments; `actions`' own job deletes
 * its copy. New here: `overdueClocks` (R3, the Action fold's `actions` R50) and the member's reminders (R4–R6, R8;
 * DEC-94, K613–K615, K624 (3)). An action's clock is written in its own document (`actions`); this module reads it,
 * proposes entries apart, and holds the members' reminders in its own table. It never writes an action's document.
 *
 * REACHED as `actionClocksOf(host, deps)` (K61): one instance per host, created on the first call. At creation it
 * creates its tables and declares them to record-core's purge (R9).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership   layer 2: `readFile`, `readImage`, `transact`, `getSetting`, `declarePurge`;
 *                        `viewerPredicate`.
 *   actions              `actionRead` (its R29) and `noSuchAction` (its R43).
 *   conformance          `determinationRead` (its R9): the project of the determination an action rests on (R3, R5;
 *                        K702). A host on which it cannot be created answers every project null.
 *   localFacts           `factStatus` (local-facts R2): each holiday year a business count reads, its status and the
 *                        value that governs here (R10), read through `factReader` (R12). A host on which it cannot be
 *                        created, or whose local-facts has no `factStatus`, reads none, and a business count states
 *                        its calendar `not_read`.
 *   now                  the instance clock, milliseconds (default: `env.BIO_NOW_MS`, else the wall clock).
 *   env                  the instance bindings.
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, `current_state`), its
 * R37; retrieval's projection (`action_clock_next`, its R61), which R1's page seeks. */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { PROJECTION_TABLE } from "../retrieval/index.mjs";
import { conformanceOf } from "../conformance/index.mjs";
import { actionsOf, noSuchAction } from "../actions/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { parseFrontmatter } from "../record-grammar/frontmatter.mjs";
import { normalizeType } from "../record-grammar/types.mjs";
import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { lawProposalLabel } from "../action-grammar/index.mjs";
import { localFactsOf, factPath, LOCAL_FACT_STATUSES } from "../local-facts/index.mjs";
import { ACTION_CLOCK_CHECKS } from "./checks.mjs";
import { ACTION_CLOCKS_TABLES, migrateActionClocks } from "./schema.mjs";

export { ACTION_CLOCK_CHECKS } from "./checks.mjs";
export { ACTION_CLOCKS_SCHEMA, ACTION_CLOCKS_TABLES } from "./schema.mjs";

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

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** A `YYYY-MM-DD` that names a real UTC calendar day. */
function isDay(v) {
  if (typeof v !== "string" || !DAY_RE.test(v)) return false;
  const t = Date.parse(`${v}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === v;
}
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

  constructor({ storage, record, membership, actions = null, conformance = null, localFacts = null, host = null, now = null,
                env = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.#deps = { host, actions, conformance: conformance ?? undefined, localFacts: localFacts ?? undefined };
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
  }

  get actions() { return this.#deps.actions ||= actionsOf(this.#deps.host); }
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
  #today(explicit = null) { return new Date(this.#nowMs(explicit)).toISOString().slice(0, 10); }

  /* R2: the active profiles' combined view (record-core R26), or null with none active or none combinable. */
  #view() {
    let ids = null;
    try { ids = this.record.getSetting("jurisdiction_profiles"); } catch { ids = null; }
    if (typeof ids === "string") { try { ids = JSON.parse(ids); } catch { ids = null; } }
    if (!Array.isArray(ids) || !ids.length) return null;
    const c = combine(ids);
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
   *  `abandoned` whose stored status is `overdue`, or `pending` with a date before the UTC day of the instance clock;
   *  each with the action's project and the member who created it. Paged as R1 (`#entryPage`), over every open action
   *  in id order: an `overdue` entry is not in the projection's clock, so no seek narrows it. R7: overdue is derived at
   *  the read (`past`), and the stored status is reported beside it, never in place of it. Writes nothing. */
  overdueClocks({ after = null, limit = null, viewer = null, now = null } = {}) {
    const today = this.#today(now);
    const max = clampLimit(limit, OVERDUE_CLOCKS_MAX, OVERDUE_CLOCKS_MAX);
    const gate = viewerPredicate(viewer);
    const closed = CLOSED_ACTION_STATES.map(() => "?").join(",");
    const who = new Map();
    const page = this.#entryPage({
      after, max, actionsMax: OVERDUE_CLOCKS_ACTIONS_MAX,
      candidates: (seekId, n) => this.#rows(`SELECT b.bundle_id FROM bundles b
        WHERE b.object_type='action' AND b.current_state NOT IN (${closed}) AND (${gate.sql})
          ${seekId !== null ? "AND b.bundle_id>=?" : ""} ORDER BY b.bundle_id LIMIT ?`,
        ...CLOSED_ACTION_STATES, ...gate.args, ...(seekId !== null ? [seekId] : []), n),
      item: (r, i, e) => {
        if (!e || typeof e !== "object") return null;
        const dated = typeof e.date === "string" && isDay(e.date);
        const past = dated && e.date < today;
        if (!(e.status === "overdue" || (e.status === "pending" && past))) return null;
        if (!who.has(r.bundle_id)) who.set(r.bundle_id, { project: this.#projectOf(this.#heldFm(r.bundle_id), viewer), created_by: this.#createdBy(r.bundle_id) });
        return { action: r.bundle_id, ord: i, date: typeof e.date === "string" ? e.date : null, basis: e.basis ?? null,
                 text: e.text ?? null, status: e.status, past, ...who.get(r.bundle_id) };
      },
    });
    return { ok: true, as_of: today, items: page.items, limit: max, actions_limit: OVERDUE_CLOCKS_ACTIONS_MAX,
             truncated: page.truncated, cursor: page.cursor };
  }

  /* ================================================================ the proposal (R2) */

  /** R2 (was `actions` R32): a clock entry computed from a profile deadline that applies to the action's kind, stored
   *  apart and labelled; never written into `clock[]`. */
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
    const computed = computeDeadline(d, fm, view, { factOf: this.#factOf(viewer) });
    const basis = `${d.citation}${d.basis ? ` (profile basis: ${d.basis}${d.profile ? `, ${d.profile}` : ""})` : ""}`;
    const entry = { text: d.rule, description: `${d.days} ${d.count} day${d.days === 1 ? "" : "s"} from ${d.starts}`,
                    date: computed.date, basis, status: "pending" };
    const at = stampInstant("second", this.#nowMs(null));
    this.sql.exec(`INSERT INTO action_clock_proposals (bundle_id, proposed_by, rule, date, basis, entry_json, why, proposed_at)
      VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(bundle_id, proposed_by, rule) DO UPDATE SET date=excluded.date,
      basis=excluded.basis, entry_json=excluded.entry_json, why=excluded.why, proposed_at=excluded.proposed_at`,
      target, who, rule, computed.date, basis, JSON.stringify(entry), computed.why ?? null, at);
    return { ok: true, target, weight: "single", evidence: false,
             proposal: { ...proposalLabelFor(who), rule, entry, at,
                         ...(computed.start ? { start: computed.start, counted_from: `the day after ${computed.start}` } : {}),
                         ...(computed.calendar ? { calendar: computed.calendar } : {}),
                         ...(computed.date ? {} : { undetermined: computed.why }) },
             says: "this clock entry is proposed and is not on the action's clock: a member states a clock entry by a "
                 + "revision of the action." };
  }

  /* R10, R12: the count's reader of the holiday entries' confirmations is `factReader` over this host's local-facts, the
     one reader (R12): null where local-facts cannot be created or has no `factStatus`, and the count then states its
     calendar `not_read`. */
  #factOf(viewer) { return factReader(this.localFacts, viewer); }

  /** R11 (for `queue-producers` R21, through `local-facts` R4): the `local-facts` paths a live deadline reads, once each,
   *  with the actions that read them. For every visible action not `resolved` or `abandoned` whose kind has a profile
   *  deadline counted in business days: the holiday entries that apply to its offices (R10) for each year from the UTC
   *  year of the instance clock to the year of its latest pending clock entry, and at least the next year; and its
   *  offices' `hours`. Only facts the active profiles hold are paths (a year they do not list has no fact to confirm,
   *  and a count reaching it is undetermined, jurisdictions R33). Each path's actions are `{action, project,
   *  created_by}`, the project and creator as R3 computes them (K1000). At most 500 actions read, `truncated` stated. */
  calendarFactsRead({ viewer = null, now = null } = {}) {
    const today = this.#today(now);
    const view = this.#view();
    const business = new Set((view && Array.isArray(view.deadlines) ? view.deadlines : [])
      .filter((d) => d && d.count === "business" && typeof d.applies_to === "string").map((d) => d.applies_to));
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
      let y1 = y0 + 1;
      for (const e of Array.isArray(fm.clock) ? fm.clock : [])
        if (e && e.status === "pending" && isDay(e.date)) y1 = Math.max(y1, Number(e.date.slice(0, 4)));
      for (let y = y0; y <= y1; y++)
        for (const h of yearEntries(view, offices, y).entries) { try { add(factPath(holidayFact(h)), a); } catch { /* no path */ } }
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
   *  `answered`), in (entry, day, member) order, at most 500 with `truncated`. A reminder changed or removed is gone. */
  remindersFor({ action, viewer = null, now = null } = {}) {
    const a = this.#actionFor(action, viewer);
    if (!a) return noSuchAction(action ?? null);
    const today = this.#today(now);
    const rows = this.#rows(`SELECT entry, day, set_by, set_at, answered_at FROM action_reminders
      WHERE bundle_id=? AND removed_at IS NULL ORDER BY entry, day, set_by, rid LIMIT ?`, a.id, REMINDERS_READ_MAX + 1);
    const reminders = rows.slice(0, REMINDERS_READ_MAX).map((r) => ({
      entry: r.entry, on: r.day, set_by: r.set_by, set_at: r.set_at, answered_at: r.answered_at ?? null,
      state: r.answered_at ? "answered" : r.day <= today ? "due" : "waiting" }));
    return { ok: true, action: a.id, as_of: today, reminders, limit: REMINDERS_READ_MAX,
             truncated: rows.length > REMINDERS_READ_MAX, standing_max: REMINDERS_PER_ACTION_MAX };
  }

  /** R5 (for `queue-producers` R18): every reminder whose day has come at `nowMs` and that is not answered, on an entry
   *  still `pending` of a visible action not `resolved` or `abandoned`, at most 500 per page in (action id, entry
   *  position, day) order (then the member, so the order is total). `cursor` is the last reminder answered,
   *  `<action>#<position>#<day>#<member>`, when `truncated`, else null; `after` is a previous page's cursor or an action
   *  id, read as after all that action's reminders. The entry is read as it stands (an entry a later revision removed
   *  or re-dated is answered only while the entry at that position is pending). Writes nothing. */
  remindersDue({ nowMs = null, after = null, limit = null, viewer = null } = {}) {
    const today = this.#today(nowMs);
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
        today, ...CLOSED_ACTION_STATES, ...gate.args, ...cur.args, max + 1);
      let last = null;
      for (const r of rows) {
        last = r;
        const clock = Array.isArray(fmOf(r.bundle_id).clock) ? fmOf(r.bundle_id).clock : [];
        const e = clock[r.entry];
        if (!e || typeof e !== "object" || e.status !== "pending") continue;
        if (items.length === max) { truncated = true; break; }
        items.push({ action: r.bundle_id, ord: r.entry, date: e.date ?? null, basis: e.basis ?? null, text: e.text ?? null,
                     on: r.day, set_by: r.set_by, project: this.#projectOf(fmOf(r.bundle_id), viewer) });
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
    const today = this.#today(null);
    const pos = typeof entry === "number" ? entry : /^\d+$/.test(String(entry ?? "").trim()) ? Number(String(entry).trim()) : NaN;
    const due = Number.isInteger(pos) && pos >= 0
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

/* R10 (jurisdictions R43; K986): the ONE office a count for an action is for, as a list of none or one: its addressee
   when that is a named office (its `role` and `body`), else the venue its kind is filed at when the view's kind carries
   one (`{venue: <kind>}`); none for any other action, whose count reads only the entries for all offices. */
export function actionOffices(fm, view) {
  const cp = fm && typeof fm === "object" ? fm.counterparty : null;
  if (cp && typeof cp === "object" && cp.state === "named" && (cp.kind === undefined || cp.kind === null || cp.kind === "office")
      && typeof cp.role === "string" && cp.role.trim())
    return [{ role: cp.role.trim(), body: typeof cp.body === "string" ? cp.body.trim() : null }];
  const kind = fm && typeof fm === "object" ? fm.action_kind : null;
  if ((view && Array.isArray(view.action_kinds) ? view.action_kinds : []).some((k) => k && k.kind === kind && k.venue))
    return [{ venue: kind }];
  return [];
}
const officeKey = (o) => (typeof o === "string" ? `role:${o}` : o && typeof o.venue === "string" ? `venue:${o.venue}`
  : o && typeof o.role === "string" ? `role:${o.role}` : null);
const officeWords = (o) => (o.venue ? `the venue of '${o.venue}'` : `'${o.role}'`);

/* R10 (jurisdictions R33, R43): the holiday entries a count for `offices` (`actionOffices`: none or one) reads for
   `year`: the year's entry for all offices and those naming the office. An office covered by neither leaves the year
   undetermined (`uncovered`), as does a year with no entry at all. */
export function yearEntries(view, offices, year) {
  const hs = (view && Array.isArray(view.holidays) ? view.holidays : []).filter((h) => h && Number(h.year) === year);
  const keys = new Set((offices || []).map(officeKey).filter(Boolean));
  const all = hs.filter((h) => !Array.isArray(h.offices));
  const named = hs.filter((h) => Array.isArray(h.offices) && h.offices.some((o) => keys.has(officeKey(o))));
  const uncovered = all.length ? [] : (offices || [])
    .filter((o) => !named.some((h) => h.offices.some((x) => officeKey(x) === officeKey(o))));
  return { entries: [...all, ...named], uncovered };
}
/* R10, R11: the `local-facts` fact of one holiday entry, and those of the offices' `hours` the view holds (its R6). */
const holidayFact = (h) => ({ profile: h.profile ?? null, fact: "holidays", year: Number(h.year),
                              ...(Array.isArray(h.offices) ? { offices: h.offices } : {}) });
function officeHours(view, offices) {
  const out = [];
  for (const o of offices || []) {
    if (o.venue) {
      const k = (view && Array.isArray(view.action_kinds) ? view.action_kinds : []).find((x) => x && x.kind === o.venue);
      if (k && k.venue && k.venue.hours) out.push({ profile: k.profile ?? null, fact: "hours", office: { venue: k.kind } });
    } else {
      const c = (view && Array.isArray(view.counterparties) ? view.counterparties : [])
        .find((x) => x && x.role === o.role && (o.body === null || x.body === o.body));
      if (c && c.hours) out.push({ profile: c.profile ?? null, fact: "hours", office: { role: c.role, body: c.body } });
    }
  }
  return out;
}
/* R10: local-facts' answer for one path (its R2), as the count reads it: its status; the value that governs here
   (`governs.value`: the latest correction's, else the profile's), which the count counts on whatever the status; for a
   correction its member and date (the correcting act is the latest while the status is `corrected`) and its `says`; for
   a lapsed confirmation the date it was made; for a dispute who disputed it and when. A refusal, or a status local-facts
   does not give (its R7's `LOCAL_FACT_STATUSES`), is `absent` with why. */
function factAnswer(path, r) {
  if (!r || typeof r !== "object" || r.ok === false) {
    const why = r && typeof r === "object" ? textOf(r.reason || r.code) : null;
    return { path, status: "absent", why: why ? `local facts refused the read: ${why}` : "local facts did not answer" };
  }
  if (typeof r.status !== "string" || !LOCAL_FACT_STATUSES.includes(r.status))
    return { path, status: "absent", why: `local facts answered no status it gives (${textOf(r.status)?.slice(0, 40) ?? "none"})` };
  const g = r.governs && typeof r.governs === "object" ? r.governs : {};
  const last = r.latest && typeof r.latest === "object" ? r.latest : {};
  const lapsed = r.lapsed && typeof r.lapsed === "object" ? r.lapsed : {};
  const day = (v) => (typeof v === "string" ? v.slice(0, 10) : null);
  return { path, status: r.status, why: r.why ?? null,
           value: g.value ?? null, corrected: g.origin === "corrected", says: g.says ?? null,
           by: last.by ?? null, at: day(last.at), last_at: day(lapsed.at) };
}

/** R12 (K998, N474; for `filings` R30): the `factOf` `computeDeadline` takes, over local-facts' `factStatus` (its R2)
 *  for `viewer`, and the one reader R10's own count uses (`ActionClocks#factOf`). Given a holiday entry, it reads the
 *  entry's path (`factPath`, local-facts R6) and answers as R10's count reads it (`factAnswer`). An entry naming no
 *  local fact, a read that throws or is refused, or an answer local-facts cannot give is `absent` with why. Null when
 *  `localFacts` has no `factStatus`: the count then states its calendar `not_read`. Writes nothing; neither it nor the
 *  reader it answers ever throws. */
export function factReader(localFacts, viewer) {
  let read = null;
  try { read = localFacts && (typeof localFacts === "object" || typeof localFacts === "function") ? localFacts.factStatus : null; }
  catch { read = null; }
  if (typeof read !== "function") return null;
  return (h) => {
    let path = null;
    try { path = factPath(holidayFact(h)); } catch { path = null; }
    if (typeof path !== "string") return { path: null, status: "absent", why: "the holiday entry names no local fact" };
    let r;
    try { r = read.call(localFacts, { path, viewer }); }
    catch (e) {
      let m = null;
      try { m = e && typeof e.message === "string" ? e.message.slice(0, 200) : null; } catch { m = null; }
      return { path, status: "absent", why: `local facts' read failed${m ? `: ${m}` : ""}` };
    }
    try { return factAnswer(path, r); }
    catch { return { path, status: "absent", why: "local facts answered in a shape the count cannot read" }; }
  };
}
const daysOf = (v) => (Array.isArray(v) ? v : null);

/* R10: what a business count states of the calendar it read: each holiday entry read with its status, and the whole
   `confirmed` when every entry is, `corrected` (naming each correction's member and date) when one is and none is
   unconfirmed, `unconfirmed` ("counted on an unconfirmed calendar (<source>, <date>)", the entry's basis and the lapsed
   confirmation's date) when any is. Without a reader of the confirmations (a pure caller), `not_read`. */
function calendarStated(read, readable) {
  const years = read.map((r) => ({ year: r.year, offices: r.offices, path: r.path, status: r.status, basis: r.basis,
                                   ...(r.status === "corrected" ? { corrected_by: r.by, corrected_at: r.at } : {}) }));
  if (!readable) return { status: "not_read", years, says: ["the calendar's confirmation on this instance was not read"] };
  const says = [];
  for (const r of read) {
    if (r.status === "unconfirmed")
      says.push(`counted on an unconfirmed calendar (${r.basis ?? "no source stated"}, ${r.last_at ?? "never confirmed here"})`);
    else if (r.status === "corrected") says.push(`counted on a calendar ${r.says ?? `corrected locally by ${r.by}, ${r.at}`}`);
  }
  const status = read.some((r) => r.status === "unconfirmed") ? "unconfirmed"
    : read.some((r) => r.status === "corrected") ? "corrected" : "confirmed";
  return { status, years, says };
}

/* R2, R10: a deadline's date from its rule, counted from the event the rule names in the action's ledger: `filed` the
   first sent entry, `received` the first received entry; `act` and `known` are not ledger events, so they are
   undetermined. A `business` count reads, for each year it reaches, the holiday entries that apply to the action's
   office (`actionOffices`, `yearEntries`), each through `factOf` (its status on this instance and, when corrected, the value that
   governs); it is undetermined past the years the calendar lists for those offices (jurisdictions R33, R43), and when an
   entry it reads is `disputed` or `absent`. It answers `calendar`, the statement of what it read (`calendarStated`); a
   `calendar` count reads no holiday and states none. Nothing is written. */
export function computeDeadline(d, fm, view, { factOf = null } = {}) {
  const ledger = Array.isArray(fm.correspondence) ? fm.correspondence : [];
  const dir = d.starts === "filed" ? "sent" : d.starts === "received" ? "received" : null;
  if (!dir) return { date: null, why: `the rule starts from '${d.starts}', an event the action's ledger does not record` };
  const e = ledger.find((x) => x && x.direction === dir && typeof x.at === "string" && /^\d{4}-\d{2}-\d{2}/.test(x.at));
  if (!e) return { date: null, why: `the action's ledger holds no ${dir} entry, the event this rule starts from` };
  const start = e.at.slice(0, 10);
  const days = Number(d.days);
  if (!Number.isInteger(days) || days < 0) return { date: null, start, why: "the rule's number of days is not a whole number" };
  const t0 = Date.parse(`${start}T00:00:00Z`);
  const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
  if (d.count === "calendar") return { date: iso(t0 + days * 86400000), start };
  if (d.count !== "business") return { date: null, start, why: `the rule's count '${d.count}' is neither calendar nor business` };
  const offices = actionOffices(fm, view);
  const readable = typeof factOf === "function";
  const read = [];
  const closed = new Map();
  const undetermined = (why) => ({ date: null, start, why, calendar: calendarStated(read, readable) });
  /* One year's closure days, read once: undetermined (a string) where the calendar does not cover it. */
  const yearOf = (y) => {
    if (closed.has(y)) return closed.get(y);
    const { entries, uncovered } = yearEntries(view, offices, y);
    let out;
    if (uncovered.length) out = `the count reaches ${y}, and the profile's holiday calendar for ${y} names no entry for `
      + `${uncovered.map(officeWords).join(" or ")} and none for all offices`;
    else if (!entries.length) out = `the count reaches ${y}, a year the profile's holiday calendar does not list`;
    else {
      const set = new Set();
      for (const h of entries) {
        const f = readable ? factOf(h) || { status: "absent" } : { status: null };
        read.push({ year: y, offices: Array.isArray(h.offices) ? h.offices : null, basis: h.basis ?? null, ...f });
        if (f.status === "disputed" || f.status === "absent") {
          out = `the holiday calendar for ${y}${Array.isArray(h.offices) ? ` (${h.offices.map((o) => officeWords(typeof o === "string" ? { role: o } : o)).join(", ")})` : ""} `
            + (f.status === "disputed" ? `is disputed on this instance${f.by ? ` by ${f.by}` : ""}${f.at ? `, ${f.at}` : ""}`
              : `cannot be read on this instance: ${f.why || "absent"}`);
          break;
        }
        const ds = f.corrected ? daysOf(f.value) || h.days : h.days;
        for (const x of ds || []) if (x && typeof x.date === "string") set.add(x.date);
      }
      if (out === undefined) out = set;
    }
    closed.set(y, out);
    return out;
  };
  let t = t0, n = 0;
  while (n < days) {
    t += 86400000;
    const yd = yearOf(new Date(t).getUTCFullYear());
    if (typeof yd === "string") return undetermined(yd);
    const wd = new Date(t).getUTCDay();
    if (wd === 0 || wd === 6 || yd.has(iso(t))) continue;
    n++;
  }
  return { date: iso(t), start, calendar: calendarStated(read, readable) };
}

/* The reads and acts answer their catalogue-backed refusals with code, check and translation. */
for (const m of ["pendingClocks", "clockPropose", "reminderSet", "reminderAnswer"]) {
  const fn = ActionClocks.prototype[m];
  ActionClocks.prototype[m] = function (...a) { return withRow(fn.apply(this, a)); };
}

const instances = new WeakMap();

/** K61: the one instance per host; at creation it creates and declares its tables (R9), each on its own declaration.
 *  `actions`' copy of `action_clock_proposals` is gone (K914), so this module alone declares it. */
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
    record.declarePurge("action-clocks", ["action_reminders"]);
    record.declarePurge("action-clocks", ["action_clock_proposals"]);
  }
  return a;
}

/** Which purge declaration names one of this module's tables (record-core R21). */
export function actionClocksOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return ACTION_CLOCKS_TABLES.includes(name);
}

/** The module's ops (K3, K671), entries of the route map `plane` composes (its R5) and control-plane's `dispatch` looks
 *  up: `op=reminderset` (R4) and `op=reminderanswer` (R6). `viewer` and `author` are the control plane's stamps, read
 *  from the query, so a caller's own copy never wins. */
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
  };
}
