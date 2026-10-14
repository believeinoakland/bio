/* action-replies — what a reply to the group's action did, and what it set off (requirements:
 * `build/requirements/action-replies.md`; `BIO_Action_v0_2.md` §4 rules 1, 8, 16, §6 `arose_from`; Actions D13, D20).
 *
 * New at T45 (K2781 (1)), built fresh after `action-clocks`: a member lays out a reply to a request for comment claim by
 * claim, with any proposed layout stored apart (R1); a member links a matter or project to the response it arose from,
 * read both ways (R2); and at signing each open request for comment on a case is answered once as a line of fact
 * through `case-inputs`' seam (its R8; R3). A member does every act; nothing here rates a reply or counts a chain (R4).
 * T46: a proposal is labelled through `record-grammar`'s `bearing` subject (R5); `aroseFromLink`'s refusals and sight as
 * R6 states them; six rows read their words by key (R7, `./checks.mjs`); each open-request row answers `replied` (R8).
 * T47: the source registers with `case-inputs` (its R8), split from `case-authoring` (N908; R3); `BEARING_REFUSED` answers
 * DEC-199's sentence with its `{item}` filled (R9).
 * T48: a member records that a reply asks not to be quoted, or withdraws it (R10); `bearingsOf` answers it per entry and
 * each open-request row answers `quotable` (R11); a machine records none (R4).
 *
 * REACHED as `actionRepliesOf(host, deps)` (K61): one instance per host, created on the first call. At creation it
 * creates its tables and declares them to record-core's purge (R4), and registers its open-requests source once with
 * `case-inputs.registerOpenRequests` (its R8; R3) where case-inputs is given or the composition root starts it with its
 * environment; a source already held (`PROVIDER_DECLARED`) stands.
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership   layer 2: `transact`, `declarePurge`; `sight`, `inSight`.
 *   actions              `actionRead` (its R29), `actionsFor` (its R30): the action, its kind, legs, ledger, clock and
 *                        state, the viewer's sight of it answered as `actions` answers it.
 *   caseInputs           `registerOpenRequests` (its R8); `null` registers none.
 *   now                  the instance clock, milliseconds (default: `env.BIO_NOW_MS`, else the wall clock).
 *   env                  the instance bindings.
 *
 * Its own tables only: `action_reply_bearings`, `action_bearing_proposals`, `action_arose_from`, `action_reply_quoting`
 * (`./schema.mjs`). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, noSuchProject } from "../membership/index.mjs";
import { actionsOf } from "../actions/index.mjs";
import { caseInputsOf } from "../case-inputs/index.mjs";
import { bearingFindings, BEARINGS, counterpartyName } from "../action-grammar/index.mjs";
import { isMachineIdentity, proposalLabel, BUNDLE_ID_RE, idPattern } from "../record-grammar/index.mjs";
import { ACTION_REPLY_CHECKS, fillWords } from "./checks.mjs";
import { ACTION_REPLIES_TABLES, migrateActionReplies } from "./schema.mjs";

export { ACTION_REPLY_CHECKS, ACTION_REPLY_WORDS } from "./checks.mjs";
export { ACTION_REPLIES_SCHEMA, ACTION_REPLIES_TABLES } from "./schema.mjs";

/** R1: the most standing proposals one entry's read lists (`actions` R28's bound). */
export const BEARING_PROPOSALS_READ_MAX = 12;
/** R2: the longest matter a `{plan, matter}` link names. */
export const MATTER_MAX = 200;
/** R3: the request states in which a request for comment is no longer open. */
export const CLOSED_STATES = Object.freeze(["resolved", "abandoned"]);
/** R3: the bearing that answers nothing. */
const NOT_ADDRESSED = "not_addressed";
/** R3: the actions one `actionsFor` page lists (its R30's bound). */
const PAGE = 200;
/* R10: the longest of a reply's own words that say it may not be quoted. */
export const QUOTING_WORDS_MAX = 500;

/* The catalogue-backed refusals: each carries its code, check and translation. */
export function withRow(r) {
  if (!r || typeof r !== "object" || r.ok !== false || typeof r.reason !== "string") return r;
  const row = ACTION_REPLY_CHECKS[r.reason];
  if (!row) return r;
  return { ...r, code: r.code ?? r.reason, check: r.check ?? row.check, translation: r.translation ?? row.translation };
}
const refuse = (code, detail, extra) => withRow({ ok: false, reason: code, detail, ...(extra || {}) });

/* R9 (T47; N992; DEC-199): the item `BEARING_REFUSED`'s sentence names, from the first finding `action-grammar.bearingFindings`
   pushes (its R24): the list itself when the count is outside 1 to 50 (the finding names no `claims[i]`), else the
   claim's position in `claims`, counted from 1, with the claim when the entry names one. */
const CLAIM_SHOWN_MAX = 60;
function bearingItem(claims, index) {
  if (index === null) return "The list of claims";
  const c = Array.isArray(claims) ? claims[index] : undefined;
  const claim = c && typeof c === "object" && !Array.isArray(c) && typeof c.claim === "string" ? c.claim.trim() : "";
  return claim ? `Claim ${index + 1} (${claim.slice(0, CLAIM_SHOWN_MAX)})` : `Claim ${index + 1}`;
}

/* An entry's position: a non-negative integer, given as a number or its digits; null otherwise. */
function ordOf(v) {
  if (typeof v === "number" && Number.isInteger(v) && v >= 0) return v;
  if (typeof v === "string" && /^\d{1,6}$/.test(v.trim())) return Number(v.trim());
  return null;
}
const dayOf = (v) => {
  const s = typeof v === "string" ? v.slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s ? s : null;
};
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
/* R2: a project's id, and a plan's (`PLN-`, with or without a slug, as `actions` R46 reads it). */
const isProjectId = (x) => typeof x === "string" && BUNDLE_ID_RE.test(x) && x.startsWith("PROJ-");
const PLAN_ID_RE = new RegExp(`^${idPattern("PLN").source.slice(1, -1)}(-[a-z0-9]+)*$`);
const isMatter = (x) => typeof x === "string" && x.trim().length > 0 && x.length <= MATTER_MAX && !/["\\\r\n]/.test(x);

/* R5 (T46; N912; record-grammar R60): the label of a proposed layout is `record-grammar`'s, its `bearing` subject: the
   state from its one rule and the subject's sentence for it, never sentences of this module's own. */
export function bearingProposalLabel(who) {
  return proposalLabel(who, "bearing");
}

export class ActionReplies {
  #deps;

  constructor({ storage, record, membership, actions = null, host = null, now = null, env = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.#deps = { host, actions };
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
  }

  get actions() { return this.#deps.actions ||= actionsOf(this.#deps.host); }

  migrate() { migrateActionReplies(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  #nowMs() {
    if (this.now) { const n = Number(this.now()); if (Number.isFinite(n) && n >= 0) return n; }
    const v = Number(this.env && this.env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }
  #at() { return stampInstant("second", this.#nowMs()); }

  /* The action as `actions` answers it to `viewer` (its R29): absent and invisible alike `NO_SUCH_BUNDLE` (R4). */
  #action(target, viewer) {
    let a = null;
    try { a = this.actions.actionRead({ id: String(target), viewer }); } catch { a = null; }
    if (!a) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (a.ok === false) return { ok: false, reason: a.reason === "NOT_AN_ACTION" ? "NOT_AN_ACTION" : "NO_SUCH_BUNDLE", target,
                                 ...(a.reason === "NOT_AN_ACTION" ? { object_type: a.object_type ?? null } : {}) };
    return a;
  }
  /* The ledger entry at `ord`, or null. */
  static #entry(a, ord) {
    const n = ordOf(ord);
    if (n === null) return null;
    return (Array.isArray(a.correspondence) ? a.correspondence : []).find((e) => e && e.ord === n) || null;
  }
  /* R1: the targets of the action's `advances` and `rests_on` legs. */
  static #legTargets(a) {
    return (Array.isArray(a.legs) ? a.legs : [])
      .filter((l) => l && (l.kind === "advances" || l.kind === "rests_on") && typeof l.target === "string")
      .map((l) => l.target);
  }

  /* R1: the action and the received entry a layout or a proposal is on, or the refusal. */
  #bearingTarget(target, ord, viewer, quoting = false) {
    const a = this.#action(target, viewer);
    if (a.ok === false) return a;
    const e = ActionReplies.#entry(a, ord);
    if (quoting) return this.#quotingTarget(a, e, target, ord);
    /* DEC-49 REGION is-bearing-rfc */
    if (a.kind !== "request_for_comment" || !e || e.direction !== "received")
      return refuse("BEARING_NOT_RFC", a.kind !== "request_for_comment"
        ? "this action is not a request for comment; only a reply to one is laid out claim by claim"
        : "the entry named is not a reply received on this request", { target, ord: ord ?? null, kind: a.kind ?? null });
    /* END DEC-49 REGION is-bearing-rfc */
    return { ok: true, a, ord: e.ord };
  }
  /* R10: the received entry of a request for comment a quoting record is on, or the refusal. */
  #quotingTarget(a, e, target, ord) {
    /* DEC-49 REGION is-quoting-rfc */
    if (a.kind !== "request_for_comment" || !e || e.direction !== "received")
      return refuse("QUOTING_NOT_RFC", a.kind !== "request_for_comment"
        ? "this action is not a request for comment; only a reply to one can ask not to be quoted"
        : "the entry named is not a reply received on this request", { target, ord: ord ?? null, kind: a.kind ?? null });
    /* END DEC-49 REGION is-quoting-rfc */
    return { ok: true, a, ord: e.ord };
  }
  /* R10: `quotable` a boolean; `words` (the reply's own, one line, no quote or backslash) given with `false`. Null for
     `words` when withdrawn. */
  #quotingShape(quotable, words, target) {
    const given = words !== undefined && words !== null;
    const w = typeof words === "string" ? words.trim() : null;
    /* DEC-49 REGION is-quoting-shape */
    const wordsOk = w !== null && w.length >= 1 && w.length <= QUOTING_WORDS_MAX && !/["\\\r\n\u2028\u2029]/.test(w);
    if (typeof quotable !== "boolean" || (quotable === false && !wordsOk) || (given && !wordsOk))
      return refuse("QUOTING_REFUSED", "quotable is true or false, and with false the reply's own words that say so", { target });
    /* END DEC-49 REGION is-quoting-shape */
    return { ok: true, quotable, words: quotable ? null : w };
  }

  /* R1 (action-grammar R24): the layout's shape, its claims among the legs; the claims as stored, or the refusal. */
  #bearingShape(claims, a, target) {
    const findings = [];
    bearingFindings(claims, ActionReplies.#legTargets(a), findings);   /* pure; never throws (action-grammar R24) */
    const errs = findings.filter((f) => f && f.severity !== "warning");
    /* DEC-49 REGION is-bearing-shape */
    if (errs.length) {
      const first = errs[0];
      /* the item the grammar names (`claims[i]` in its message), or null for the list as a whole */
      const named = /claims\[(\d+)\]/.exec(String(first.message ?? first.detail ?? ""));
      const item = first.item ?? (named ? Number(named[1]) : null);
      return refuse("BEARING_REFUSED", first.message ?? first.detail ?? null, { target, item,
        /* R9: DEC-199's sentence, read by key, its `{item}` filled; never answered unfilled */
        translation: fillWords("refusal.BEARING_REFUSED", { item: bearingItem(claims, Number.isInteger(item) ? item : null) }),
        findings: errs.map((f) => ({ check: f.check, detail: f.message ?? f.detail ?? null, ...(f.code ? { code: f.code } : {}),
                                     ...(f.repairs ? { repairs: f.repairs } : {}) })) });
    }
    /* END DEC-49 REGION is-bearing-shape */
    return { ok: true, claims: claims.map((c) => ({ claim: c.claim, bearing: c.bearing,
                                                     ...(typeof c.note === "string" && c.note ? { note: c.note } : {}) })) };
  }

  /* ================================================================ R1: the reply laid out claim by claim */

  /** R1: a member lays out the reply received at `ord` on a request for comment, claim by claim. Appended. */
  actionReplyBearing({ target, ord = null, claims = null, author = null, viewer = null } = {}) {
    const who = typeof author === "string" ? author.trim() : "";
    /* DEC-49 REGION is-machine-bearing */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_RECORD_BEARING", "a reply is laid out by a member; a machine may propose a layout");
    /* END DEC-49 REGION is-machine-bearing */
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const t = this.#bearingTarget(target, ord, viewer);
    if (t.ok === false) return t;
    const s = this.#bearingShape(claims, t.a, target);
    if (s.ok === false) return s;
    const at = this.#at();
    let seq = null;
    const w = this.record.transact(() => {
      this.sql.exec(`INSERT INTO action_reply_bearings (bundle_id, ord, claims_json, laid_by, laid_at) VALUES (?, ?, ?, ?, ?)`,
        target, t.ord, JSON.stringify(s.claims), who, at);
      seq = this.#one(`SELECT MAX(seq) AS s FROM action_reply_bearings WHERE bundle_id=? AND ord=?`, target, t.ord).s;
      return { ok: true };
    });
    if (w && w.ok === false) return w;
    return { ok: true, target, ord: t.ord, claims: s.claims, by: who, at, layout: seq, weight: "single",
             says: "the reply is laid out claim by claim as this member read it. A later layout appends; this one stays." };
  }

  /** R1: a proposed layout, stored apart; any credential may propose, a proposer's restatement replacing its own. */
  actionBearingPropose({ target, ord = null, claims = null, proposer = null, viewer = null } = {}) {
    const who = typeof proposer === "string" ? proposer.trim() : "";
    if (!who)
      return { ok: false, reason: "NO_AUTHOR", detail: "this call carries nobody. The plane stamps the proposer from the "
        + "credential that asked, and a proposal nobody can be named for is one the record could say nothing about." };
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const t = this.#bearingTarget(target, ord, viewer);
    if (t.ok === false) return t;
    const s = this.#bearingShape(claims, t.a, target);
    if (s.ok === false) return s;
    const at = this.#at();
    /* REPLACE THIS PROPOSER'S OWN ROW AND NOBODY ELSE'S. */
    const w = this.record.transact(() => {
      this.sql.exec(`DELETE FROM action_bearing_proposals WHERE bundle_id=? AND ord=? AND proposed_by=?`, target, t.ord, who);
      this.sql.exec(`INSERT INTO action_bearing_proposals (bundle_id, ord, proposed_by, claims_json, proposed_at) VALUES (?, ?, ?, ?, ?)`,
        target, t.ord, who, JSON.stringify(s.claims), at);
      return { ok: true };
    });
    if (w && w.ok === false) return w;
    const latest = this.#layouts(target, t.ord)[0] || null;
    return { ok: true, target, ord: t.ord, weight: "single",
             proposal: { ...bearingProposalLabel(who), at, claims: s.claims },
             layout: latest, evidence: false,
             says: "this is a proposed layout of the reply and not the reply's layout; it changed nothing. "
                 + (latest ? "The layout a member stated stands beside it." : "No member has laid the reply out.") };
  }

  /** R10: a member records that the reply at `ord` says it may not be quoted (`quotable: false`, with its own `words`), or
   *  withdraws that record (`quotable: true`). Appended, never edited; the latest per entry stands. A declaration. */
  actionReplyQuoting({ target, ord = null, quotable = null, words = null, author = null, viewer = null } = {}) {
    const who = typeof author === "string" ? author.trim() : "";
    /* DEC-49 REGION is-machine-quoting */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_RECORD_QUOTING", "what a reply says about being quoted is recorded by a member");
    /* END DEC-49 REGION is-machine-quoting */
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const t = this.#bearingTarget(target, ord, viewer, true);
    if (t.ok === false) return t;
    const s = this.#quotingShape(quotable, words, target);
    if (s.ok === false) return s;
    const at = this.#at();
    const w = this.record.transact(() => {
      this.sql.exec(`INSERT INTO action_reply_quoting (bundle_id, ord, quotable, words, recorded_by, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`,
        target, t.ord, s.quotable ? 1 : 0, s.words, who, at);
      return { ok: true };
    });
    if (w && w.ok === false) return w;
    return { ok: true, target, ord: t.ord, quotable: s.quotable, words: s.words, by: who, at, weight: "single",
             says: s.quotable ? "the record that this reply asks not to be quoted is withdrawn. Nothing else changed."
                              : "this reply is recorded as asking not to be quoted, in its own words. Nothing else changed." };
  }
  /* R10: an entry's latest quoting record, or null when none is held. */
  #quoting(id, ord) {
    const r = this.#one(`SELECT quotable, words, recorded_by, recorded_at FROM action_reply_quoting WHERE bundle_id=? AND ord=?
      ORDER BY seq DESC LIMIT 1`, id, ord);
    return r ? { quotable: r.quotable === 1, words: r.words ?? null, by: r.recorded_by, at: r.recorded_at } : null;
  }

  /* R1: an entry's layouts, newest first. */
  #layouts(id, ord) {
    return this.#rows(`SELECT seq, claims_json, laid_by, laid_at FROM action_reply_bearings WHERE bundle_id=? AND ord=?
      ORDER BY seq DESC`, id, ord).map((r) => ({ layout: r.seq, claims: parse(r.claims_json) || [], by: r.laid_by, at: r.laid_at }));
  }
  #proposals(id, ord) {
    const rows = this.#rows(`SELECT proposed_by, claims_json, proposed_at FROM action_bearing_proposals WHERE bundle_id=? AND ord=?
      ORDER BY proposed_at DESC, proposed_by LIMIT ?`, id, ord, BEARING_PROPOSALS_READ_MAX + 1);
    return { items: rows.slice(0, BEARING_PROPOSALS_READ_MAX)
               .map((r) => ({ ...bearingProposalLabel(r.proposed_by), at: r.proposed_at, claims: parse(r.claims_json) || [] })),
             limit: BEARING_PROPOSALS_READ_MAX, truncated: rows.length > BEARING_PROPOSALS_READ_MAX };
  }

  /** R1: the layouts of the action's received entries (or of the one at `ord`): the latest per entry with the earlier
   *  ones, and the proposals apart. Writes nothing. */
  bearingsOf({ target, ord = null, viewer = null } = {}) {
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const a = this.#action(target, viewer);
    if (a.ok === false) return a;
    const want = ord === null || ord === undefined || ord === "" ? null : ordOf(ord);
    const entries = (Array.isArray(a.correspondence) ? a.correspondence : [])
      .filter((e) => e && e.direction === "received" && (want === null || e.ord === want))
      .map((e) => {
        const all = this.#layouts(target, e.ord);
        const q = this.#quoting(target, e.ord);   /* R10: `true` with nothing recorded */
        return { ord: e.ord, at: e.at ?? null, latest: all[0] || null, earlier: all.slice(1), proposals: this.#proposals(target, e.ord),
                 quotable: q ? q.quotable : true, quoting: q };
      });
    return { ok: true, target, kind: a.kind ?? null, entries };
  }

  /* ================================================================ R2: arose_from */

  /* R2: `arising` in one of its two forms, or null. */
  static #arising(v) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const keys = Object.keys(v).filter((k) => v[k] !== undefined && v[k] !== null);
    if (keys.length === 1 && keys[0] === "project" && isProjectId(v.project)) return { project: v.project };
    if (keys.length === 2 && keys.includes("plan") && keys.includes("matter") && typeof v.plan === "string"
        && PLAN_ID_RE.test(v.plan) && isMatter(v.matter)) return { plan: v.plan, matter: v.matter };
    return null;
  }
  #seesProject(project, viewer) {
    try { return this.membership.sight(project, viewer) === "full"; } catch { return false; }
  }
  #seesBundle(id, viewer) {
    try { return this.membership.inSight(id, viewer); } catch { return false; }
  }
  /* R2: whether `viewer` may see what a link names, whole. */
  #seesArising(r, viewer) {
    return r.project ? this.#seesProject(r.project, viewer) : this.#seesBundle(r.plan, viewer);
  }
  static #arisingOf(r) { return r.project ? { project: r.project } : { plan: r.plan, matter: r.matter }; }

  /** R2: a member records that a matter or project arose from the response at `ord`. Appended, never edited. */
  aroseFromLink({ target, ord = null, arising = null, author = null, viewer = null } = {}) {
    const who = typeof author === "string" ? author.trim() : "";
    /* DEC-49 REGION is-machine-link */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_LINK", "what arose from a response is linked by a member");
    /* END DEC-49 REGION is-machine-link */
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const a = this.#action(target, viewer);
    if (a.ok === false) return a;
    const e = ActionReplies.#entry(a, ord);
    /* DEC-49 REGION is-arose-response */
    if (!e || e.direction !== "received")
      return refuse("AROSE_FROM_NOT_A_RESPONSE", "the entry named is not a reply received", { target, ord: ord ?? null });
    /* END DEC-49 REGION is-arose-response */
    const ar = ActionReplies.#arising(arising);
    /* DEC-49 REGION is-arising-shape */
    if (!ar) return refuse("AROSE_FROM_REFUSED", "arising is {project} or {plan, matter}", { target });
    /* END DEC-49 REGION is-arising-shape */
    if (ar.project && !this.#seesProject(ar.project, who)) return noSuchProject(ar.project, { target });
    const held = ar.project
      ? this.#one(`SELECT seq FROM action_arose_from WHERE bundle_id=? AND ord=? AND project=?`, target, e.ord, ar.project)
      : this.#one(`SELECT seq FROM action_arose_from WHERE bundle_id=? AND ord=? AND plan=? AND matter=?`, target, e.ord, ar.plan, ar.matter);
    /* DEC-49 REGION is-arose-linked */
    if (held) return refuse("AROSE_FROM_LINKED", "this link is already recorded", { target, ord: e.ord, arising: ar });
    /* END DEC-49 REGION is-arose-linked */
    const at = this.#at();
    const w = this.record.transact(() => {
      this.sql.exec(`INSERT INTO action_arose_from (bundle_id, ord, project, plan, matter, linked_by, linked_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        target, e.ord, ar.project ?? null, ar.plan ?? null, ar.matter ?? null, who, at);
      return { ok: true };
    });
    if (w && w.ok === false) return w;
    return { ok: true, target, ord: e.ord, arising: ar, by: who, at, weight: "single" };
  }

  /** R2: what arose from the response at `ord` (every response of the action without one), each link the viewer may
   *  see whole; the rest withheld whole. Writes nothing. */
  aroseFrom({ target, ord = null, viewer = null } = {}) {
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const a = this.#action(target, viewer);
    if (a.ok === false) return a;
    const want = ord === null || ord === undefined || ord === "" ? null : ordOf(ord);
    const rows = this.#rows(`SELECT ord, project, plan, matter, linked_by, linked_at FROM action_arose_from WHERE bundle_id=?
      ORDER BY seq`, target).filter((r) => want === null || r.ord === want);
    return { ok: true, target, ord: want,
             items: rows.filter((r) => this.#seesArising(r, viewer))
               .map((r) => ({ ord: r.ord, arising: ActionReplies.#arisingOf(r), by: r.linked_by, at: r.linked_at })) };
  }

  /** R2: the responses a project, or a plan's matter, arose from, each on an action the viewer may see. Writes nothing. */
  arisenFrom(arising = null, viewerArg = null) {
    const viewer = viewerArg ?? (arising && typeof arising === "object" ? arising.viewer ?? null : null);
    const bare = arising && typeof arising === "object" && !Array.isArray(arising)
      ? Object.fromEntries(Object.entries(arising).filter(([k]) => k !== "viewer")) : arising;
    const ar = ActionReplies.#arising(bare);
    if (!ar) return refuse("AROSE_FROM_REFUSED", "arising is {project} or {plan, matter}");
    if (ar.project && !this.#seesProject(ar.project, viewer)) return noSuchProject(ar.project);
    if (ar.plan && !this.#seesBundle(ar.plan, viewer)) return { ok: false, reason: "NO_SUCH_BUNDLE", target: ar.plan };
    const rows = ar.project
      ? this.#rows(`SELECT bundle_id, ord, linked_by, linked_at FROM action_arose_from WHERE project=? ORDER BY seq`, ar.project)
      : this.#rows(`SELECT bundle_id, ord, linked_by, linked_at FROM action_arose_from WHERE plan=? AND matter=? ORDER BY seq`,
          ar.plan, ar.matter);
    return { ok: true, arising: ar,
             items: rows.filter((r) => this.#seesBundle(r.bundle_id, viewer))
               .map((r) => ({ action: r.bundle_id, ord: r.ord, by: r.linked_by, at: r.linked_at })) };
  }

  /* ================================================================ R3: the open requests at signing */

  /** R3: each request for comment the viewer may see, not resolved or abandoned, whose `advances` or `rests_on` legs
   *  name a bundle among `members`, as `case-inputs` R8's rows. Writes nothing; throws when it cannot read. */
  openRequestsOn({ case: caseId = null, members = [], viewer = null } = {}) {
    void caseId;
    const ids = new Set((Array.isArray(members) ? members : [])
      .map((m) => (typeof m === "string" ? m : m && typeof m === "object" ? m.bundle_id : null))
      .filter((x) => typeof x === "string" && x));
    if (!ids.size) return [];
    const out = [];
    let after = null;
    for (;;) {
      const page = this.actions.actionsFor({ kind: "request_for_comment", after, limit: PAGE, viewer });
      if (!page || page.ok === false || !Array.isArray(page.items))
        throw new Error(`action-replies: the requests for comment could not be read${page && page.reason ? ` (${page.reason})` : ""}`);
      for (const it of page.items) {
        if (CLOSED_STATES.includes(it.state)) continue;
        const a = this.actions.actionRead({ id: it.id, viewer });
        if (!a || a.ok === false) {
          if (a && (a.reason === "NO_SUCH_BUNDLE" || a.reason === "NOT_AN_ACTION")) continue;
          throw new Error(`action-replies: the request ${it.id} could not be read`);
        }
        if (CLOSED_STATES.includes(a.current_state)) continue;
        if (!ActionReplies.#legTargets(a).some((t) => ids.has(t))) continue;
        const row = this.#openRow(a);
        if (row) out.push(row);
      }
      if (!page.truncated || !page.cursor) break;
      after = page.cursor;
    }
    return out;
  }

  /* R3: one open request's line of fact, or null when it was never sent (J1 (b)). */
  #openRow(a) {
    const ledger = (Array.isArray(a.correspondence) ? a.correspondence : []).filter((e) => e && typeof e === "object");
    const sent = ledger.filter((e) => e.direction === "sent").sort((p, q) => p.ord - q.ord)[0];
    const asked = sent ? dayOf(sent.at) : null;
    if (!asked) return null;
    const cp = a.counterparty && typeof a.counterparty === "object" ? a.counterparty : {};
    const whom = counterpartyName(cp)
      || (cp.state === "audience" && typeof cp.description === "string" && cp.description.trim() ? cp.description.trim() : null)
      || "an addressee not yet named";
    /* J1 (a): DEC-13's window, the action's dated clock entry. */
    const win = (Array.isArray(a.clock) ? a.clock : []).find((c) => c && typeof c === "object" && c.status !== "waived" && dayOf(c.date));
    const received = ledger.filter((e) => e.direction === "received").map((e) => e.ord);
    let answers = null;
    if (received.length) {
      const marks = received.map(() => "?").join(",");
      const r = this.#one(`SELECT claims_json FROM action_reply_bearings WHERE bundle_id=? AND ord IN (${marks})
        ORDER BY seq DESC LIMIT 1`, a.id, ...received);
      const claims = r ? parse(r.claims_json) : null;
      if (Array.isArray(claims) && claims.length)
        answers = { answered: claims.filter((c) => c && c.bearing !== NOT_ADDRESSED).length, claims: claims.length };
    }
    /* R11 (T48): `false` when the latest record on any received reply says it may not be quoted. */
    const quotable = !received.some((o) => { const q = this.#quoting(a.id, o); return q && q.quotable === false; });
    /* R8 (K2964): whether a reply is recorded at all, so `answers: null` is never read as no reply when one is held. */
    return { whom, asked_at: asked, window_closes: win ? dayOf(win.date) : null, answers, replied: received.length > 0, quotable };
  }
}

/* The acts answer their catalogue-backed refusals with code, check and translation. */
for (const m of ["actionReplyBearing", "actionBearingPropose", "actionReplyQuoting", "bearingsOf", "aroseFromLink", "aroseFrom", "arisenFrom"]) {
  const fn = ActionReplies.prototype[m];
  ActionReplies.prototype[m] = function (...a) { return withRow(fn.apply(this, a)); };
}

/** R1: the bearings a layout uses (`action-grammar`'s `BEARINGS`, its R2), one binding. */
export { BEARINGS };

const instances = new WeakMap();

/** K61: the one instance per host; at creation it declares its tables (R4) and registers its open-requests source with
 *  `case-inputs` (its R8; R3). */
export function actionRepliesOf(host, deps) {
  let r = instances.get(host);
  if (!r) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    r = new ActionReplies({ ...d, host, storage, record, membership });
    instances.set(host, r);
    r.migrate();
    const declared = record.declarePurge("action-replies", [...ACTION_REPLIES_TABLES]);
    if (declared && declared.ok === false)
      throw new Error(`action-replies: record-core refused its table declaration: ${declared.reason} (${declared.table})`);
    /* R3 (case-inputs R8; N908): once per host, reached as `actions` reaches intent (the composition root's environment,
       or given); `case-inputs`' one instance on the host is the one `case-authoring`'s sign step asks. A source already
       held (`PROVIDER_DECLARED`) stands. */
    let ci = null;
    if (d.caseInputs !== null && (d.caseInputs || d.env)) {
      try { ci = d.caseInputs || caseInputsOf(host); } catch { ci = null; }
    }
    const inst = r;
    if (ci && typeof ci.registerOpenRequests === "function")
      ci.registerOpenRequests("action-replies", { openRequestsOn: (args) => inst.openRequestsOn(args || {}) });
  }
  return r;
}

/** Which purge declaration names one of this module's tables (record-core R21). */
export function actionRepliesOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return ACTION_REPLIES_TABLES.includes(name);
}

/** The module's ops (K3), as entries of the plane's one route map. `viewer`, `author` and `proposer` are the control
 *  plane's stamps, read from the query, so a caller's own copy never wins. */
export function actionRepliesOps(r, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    actionreplybearing: () => r.actionReplyBearing({ target: q("target") || b.target, ord: q("ord") ?? b.ord ?? null,
                                                     claims: b.claims ?? null, viewer: q("viewer"), author: q("author") }),
    actionbearingpropose: () => r.actionBearingPropose({ target: q("target") || b.target, ord: q("ord") ?? b.ord ?? null,
                                                         claims: b.claims ?? null, viewer: q("viewer"), proposer: q("proposer") }),
    /* R10: `quotable` is a boolean in the body, or `true`/`false` in the query; anything else is refused by the act */
    actionreplyquoting: () => r.actionReplyQuoting({ target: q("target") || b.target, ord: q("ord") ?? b.ord ?? null,
      quotable: b.quotable !== undefined ? b.quotable : q("quotable") === "true" ? true : q("quotable") === "false" ? false : q("quotable"),
      words: b.words ?? q("words"), viewer: q("viewer"), author: q("author") }),
    arosefrom: () => r.aroseFromLink({ target: q("target") || b.target, ord: q("ord") ?? b.ord ?? null,
      arising: b.arising ?? (q("project") ? { project: q("project") }
        : q("plan") || q("matter") ? { plan: q("plan"), matter: q("matter") } : null),
      viewer: q("viewer"), author: q("author") }),
  };
}
