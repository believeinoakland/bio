/* filings — what the group sends, prepared from the record (requirements: `build/requirements/filings.md`; Design
 * Requirement 8 as amended 2026-09-26, K13, K102). For an action whose governing tier is 1 or 2, a draft pre-filled
 * from the record into the profile's template for its kind, every filled blank naming its source (R1–R5); a member
 * approves it and records that it was sent (R6, R7). For Tier 3, a counsel packet for counsel the group names, marked
 * as prepared for counsel's review, never published and never fileable (R8–R12). Candidate theories are proposals,
 * stored apart and labelled (R14). The evidence package's available-actions block is registered with `publication`
 * (R15) and answered on its own for `escalation` (R21). The AI prepares; a member approves, files and records it.
 *
 * A NEW MODULE (T8, layer 9): nothing moved into it and it writes no legacy file. Its tables are `./schema.mjs`; a
 * deadline's date is `./dates.mjs`.
 *
 * REACHED as `filingsOf(host, deps)` (K61): one instance per host, created on the first call with `deps`. At creation it
 * creates its tables, declares them to record-core's purge (K23, R19) and registers the available-actions block with
 * `publication` (its R36; R15 here). `deps` (the layer-2 to layer-8 modules are reached through their factories on the
 * same host unless given; the layer-9 modules are given, never imported):
 *   record, publication, provenance, content   `getSetting`, `allocId`, `transact`, `textAtSha`, `declarePurge`;
 *                                   `registerEvidenceBlock`, `publishedEditionsOf`; `attestationsOf`; `contentRow`,
 *                                   `captureFor`.
 *   actions        `actionRead` (its R29), `actionCorrespond` (R15, R16), `clockPropose` (R32).
 *   conformance    `determinationRead` (its R9), `determinationsFor` (R11).
 *   standards      `standardRead` (its R5), `inForce` (R7).
 *   consequences   `consequencesOf` (its R7).
 *   producingGroup a function answering the instance's producing group, or null when none is recorded (R3's `group`).
 *   profiles       a function answering the active profiles (ids or profile objects) to combine; default record-core's
 *                  setting `jurisdiction_profiles` (its R26).
 *   now            the clock for the instants it writes, an ISO string (default: the wall clock, to the second).
 *
 * READ CONTRACTS it joins in its own SQL: publication's `cases` and `published_cases` (`case_id`, `edition`,
 * `project_id`, `ratified_at`, its R40); provenance's `register` and `captured_locators` (its R48).
 *
 * No place, law, venue, template or legal organisation is named here (R20): every one comes from the active
 * jurisdiction profiles' combined view (`jurisdictions.combine` over record-core's `jurisdiction_profiles`). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { contentOf } from "../content/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { isMachineIdentity, proposalLabel, parseFrontmatter, MACHINE_CLASS_PREFIX,
         sha256HexSync } from "../../checks/bio-checks.mjs";
import { FILINGS_TABLES, migrateFilings } from "./schema.mjs";
import { rowOf } from "./checks.mjs";
import { deadlineDate, realDate, COUNTED_FROM } from "./dates.mjs";

export { FILINGS_SCHEMA, FILINGS_TABLES } from "./schema.mjs";
export { FILINGS_CHECKS } from "./checks.mjs";
export { deadlineDate, COUNTED_FROM } from "./dates.mjs";

/** R3: the blanks this module fills, a closed set; a template's `{{name}}` outside it is left unfilled and says so. */
export const FILING_BLANKS = Object.freeze({
  counterparty_role: "the official role of the office the action is addressed to (the action's counterparty)",
  counterparty_body: "the body of that office",
  act: "what the government did, as the action's determination states it",
  act_date: "when it did it (a date, or a period from and to)",
  standards: "the citations of the standards the determination names",
  findings: "each finding the determination rests on, with its published case edition",
  governing_laws: "the governing laws a member stated for the action",
  law: "the law a records request is made under, as the action states it",
  clock: "the action's clock entries, each with its basis",
  venue: "where the kind is filed (the profile's venue name)",
  venue_how: "by what means it is filed (the profile's venue means)",
  group: "the producing group",
  date: "the date the draft was prepared",
});
/** R3: the marker a blank the record cannot fill leaves in the text. */
export const unfilledMarker = (name) => `[UNFILLED: ${name}]`;
export const UNFILLED_RE = /\[UNFILLED: [^\]\n]*\]/;
const BLANK_RE = /\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g;
/** R6: the longest approved text, in UTF-8 bytes. */
export const FILING_TEXT_MAX = 65536;
/** R14: the longest `why`; and the longest theory and remedy, in characters. */
export const THEORY_WHY_MAX = 1000;
export const THEORY_TEXT_MAX = 2000;
/** R8: the longest counsel name, organisation or contact. */
export const COUNSEL_FIELD_MAX = 200;
/** R13: the drafts and the packet versions one `filingsFor` read lists, each. */
export const FILINGS_FOR_MAX = 200;
/** R10: the marking every section, the packet's head and every export carry. */
export const counselMarking = (counsel) =>
  `Prepared for review by ${counsel.name}, ${counsel.organisation}. Not legal advice. Not for filing.`;
/** R15: the sentence a Tier 3 kind carries in the evidence package. */
export const COUNSEL_SENTENCE = "Such an action requires competent counsel: no template is offered for it, and the "
  + "group names counsel to evaluate it.";
/** R15: each tier's words, as the package states them beside the kind. */
export const TIER_WORDS = Object.freeze({
  1: "Tier 1: a member may prepare and file it from the record's template.",
  2: "Tier 2: a member may prepare it from the record's template; legal review is recommended before filing.",
  3: "Tier 3: requires competent counsel; no template is offered, and a counsel packet is prepared for counsel the "
    + "group names.",
  undetermined: "The risk tier is undetermined: neither the profile nor a member has stated it.",
});
const CLOSED = Object.freeze(["resolved", "abandoned"]);
const MACHINE_READER = `${MACHINE_CLASS_PREFIX}admin`;
const DRAFT_SAYS = "a draft prepared from the record: nobody has approved or sent it, and nothing is filed until a "
  + "member approves it and files it by the venue's own means";

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const json = (v) => JSON.stringify(v ?? null);
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const utf8 = (s) => new TextEncoder().encode(s).length;
const WELL_FORMED = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
/* DEC-49: a refusal of this module's own carries its code, its C-115 row and the member's translation; one another
   module answered (actions' correspondence refusals, R7) passes through as it came. */
const withRow = (r) => {
  const row = r && r.ok === false && !r.check ? rowOf(r.reason) : null;
  return row ? { ...r, code: r.reason, check: row.check, translation: row.translation } : r;
};
/** The services answered with DEC-49's rows. */
const SERVICES = Object.freeze(["filingPrepare", "filingApprove", "filingRecordSent", "counselPacket", "counselPacketRead",
                                "counselPacketExport", "filingsFor", "theoryPropose", "availableActions"]);
const byDayThenSource = (a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : a.source < b.source ? -1 : a.source > b.source ? 1 : 0);

export class Filings {
  #deps;

  constructor({ storage, record, host = null, publication = null, provenance = null, content = null, actions = null,
                conformance = null, standards = null, consequences = null, producingGroup = null, profiles = null,
                now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.#deps = { host, publication, provenance, content };
    this.actions = actions;
    this.conformance = conformance;
    this.standards = standards;
    this.consequences = consequences;
    this.producingGroup = typeof producingGroup === "function" ? producingGroup : () => null;
    this.profiles = typeof profiles === "function" ? profiles : () => this.record.getSetting("jurisdiction_profiles");
    this.now = typeof now === "function" ? now : () => stampInstant("second");
    for (const m of SERVICES) { const fn = this[m].bind(this); this[m] = (...a) => withRow(fn(...a)); }
  }

  /* The earlier modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }

  migrate() { migrateFilings(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : stampInstant("second"); }
  #call(fn) { try { return fn(); } catch { return null; } }

  /* ---------------------------------------------------------------- the reads of the modules it uses */

  /* R20: the active profiles' combined view (record-core R26, jurisdictions R12–R16), or none, with why. */
  #view() {
    const ids = this.#call(() => this.profiles());
    if (!Array.isArray(ids) || !ids.length)
      return { view: null, conflicts: [], why: "no jurisdiction profile is active on this instance" };
    const c = combine(ids);
    if (!c || !c.ok) return { view: null, conflicts: [], why: "the active jurisdiction profiles do not combine" };
    return { view: c.view, conflicts: c.conflicts || [], why: null };
  }

  /* An action the viewer may see, as actions' read answers it (its R29), or null: absent, invisible and not an action
     are one answer (R1, R19). */
  #action(id, viewer) {
    const target = str(id);
    if (!target || !this.actions || typeof this.actions.actionRead !== "function") return null;
    const a = this.#call(() => this.actions.actionRead({ id: target, viewer }));
    if (!a || a.ok === false) return null;
    const cp = isObj(a.counterparty) ? a.counterparty : null;
    return {
      id: str(a.id) || target, kind: str(a.kind), risk_tier: [1, 2, 3].includes(Number(a.risk_tier)) ? Number(a.risk_tier) : "undetermined",
      current_state: str(a.current_state), counterparty: cp,
      clock: Array.isArray(a.clock) ? a.clock.filter(isObj) : [],
      legs: Array.isArray(a.legs) ? a.legs.filter(isObj) : [],
      correspondence: Array.isArray(a.correspondence) ? a.correspondence.filter(isObj)
        : Array.isArray(a.ledger) ? a.ledger.filter(isObj) : [],
      state_history: Array.isArray(a.state_history) ? a.state_history.filter(isObj) : null,
      governing_laws: isObj(a.governing_laws) ? a.governing_laws : null,
      law: str(a.law),
    };
  }

  /* R1, R8, R13, R14: the one answer for an action that is absent, invisible, not an action, or unreadable because no
     module answers actions' read (K248: refused, never passed). */
  #noAction(id) {
    return { ok: false, reason: "NO_SUCH_ACTION", action: str(id),
             detail: this.actions && typeof this.actions.actionRead === "function"
               ? "no action by that id is readable here; one you may not see answers the same"
               : "no module answers an action's read here, so no action is readable" };
  }

  /* A determination as conformance's read answers it (its R9), or null. */
  #det(id, viewer) {
    if (!str(id) || !this.conformance || typeof this.conformance.determinationRead !== "function") return null;
    const d = this.#call(() => this.conformance.determinationRead({ id: str(id), viewer }));
    if (!d || d.ok === false) return null;
    return {
      id: str(d.id) || str(id), project: str(d.project), act: isObj(d.act) ? d.act : {},
      findings: Array.isArray(d.findings) ? d.findings : [], standards: Array.isArray(d.standards) ? d.standards : [],
      live: d.live !== false && !str(d.superseded_by), superseded_by: str(d.superseded_by),
      basis_changed: isObj(d.basis_changed) ? d.basis_changed : d.basis_changed === true ? { causes: [] } : null,
    };
  }

  /** R3, R8: the live determination the action rests on (its `rests_on` legs, in leg order), with `hidden` true when one
   *  exists that the viewer may not see. */
  #restsOn(action, viewer) {
    let hidden = false;
    for (const l of action.legs) {
      if (l.kind && l.kind !== "rests_on") continue;
      const d = this.#det(l.target, viewer);
      if (d) { if (d.live) return { det: d, hidden: false }; continue; }
      const m = this.#det(l.target, MACHINE_READER);
      if (m && m.live) hidden = true;
    }
    return { det: null, hidden };
  }

  #standard(id, viewer) {
    if (!str(id) || !this.standards || typeof this.standards.standardRead !== "function") return null;
    const s = this.#call(() => this.standards.standardRead({ id: str(id), viewer }));
    return s && s.ok !== false ? s : null;
  }

  /* standards R7, read as `{state, why}` whatever its spelling. */
  #inForce(id, date) {
    if (!date) return { state: "undetermined", why: "the act's date is not a single day, so which standard was in force is not asked" };
    if (!this.standards || typeof this.standards.inForce !== "function")
      return { state: "undetermined", why: "no module answers whether a standard was in force" };
    const r = this.#call(() => this.standards.inForce(id, date));
    if (typeof r === "string") return { state: r, why: null };
    if (isObj(r) && str(r.state)) return { state: r.state, why: r.why ?? null };
    return { state: "undetermined", why: "whether the standard was in force could not be read" };
  }

  /** The governing tier (Terms, R2; K102): the stricter of the kind's tier in the profile and the action's own;
   *  `undetermined` when the action's is; the action's alone when the profile gives the kind none, stated so. */
  governingTier(action, v = this.#view()) {
    const entry = v.view && Array.isArray(v.view.action_kinds) ? v.view.action_kinds.find((k) => k.kind === action.kind) : null;
    const kindTier = entry && [1, 2, 3].includes(entry.tier) ? entry.tier : null;
    const withheld = v.conflicts.some((c) => c.at === `action_kinds[${action.kind}].tier`);
    const base = { action_tier: action.risk_tier, kind_tier: kindTier };
    if (action.risk_tier === "undetermined")
      return { tier: "undetermined", ...base,
               says: "the action's risk tier is undetermined, and it is never read as 1: a member states it first" };
    if (kindTier === null)
      return { tier: action.risk_tier, ...base,
               says: `${withheld ? "the active profiles disagree on this kind's tier, so none is given" : v.view ? "the profile gives this kind no tier" : v.why}; `
                   + "the action's own tier alone governs" };
    const tier = Math.max(kindTier, action.risk_tier);
    return { tier, ...base, says: `the stricter of the kind's tier in the profile (${kindTier}) and the action's (${action.risk_tier}) governs` };
  }

  /* ---------------------------------------------------------------- R1–R5: filingPrepare */

  /* R3: every blank's value and source, or why it has none. `det` the determination (null), `hidden` whether one the
     viewer may not see exists. */
  #values(action, det, hidden, entry, viewer, when) {
    const out = {};
    const none = (why) => ({ why });
    const cp = action.counterparty;
    const cpNamed = cp && cp.state === "named";
    const role = cpNamed ? str(cp.role) || str(cp.name) : null;
    const cpWhy = !cp ? "the action states no counterparty" : cp.state === "undetermined"
      ? "the action's counterparty is undetermined" : "the action's counterparty names no such part";
    out.counterparty_role = role ? { value: role, source: action.id } : none(cpWhy);
    out.counterparty_body = cpNamed && str(cp.body) ? { value: str(cp.body), source: action.id } : none(cpWhy);
    const detWhy = hidden ? "the determination the action rests on is not one you may see"
      : !this.conformance ? "no module answers determinations here, so the record's value cannot be read"
      : "the action rests on no live determination, so the record holds no value for it";
    if (det) {
      const act = det.act || {};
      out.act = str(act.description) ? { value: str(act.description), source: det.id } : none("the determination states no act");
      const period = isObj(act.period) ? act.period : null;
      out.act_date = str(act.at) ? { value: str(act.at), source: det.id }
        : period && (str(period.from) || str(period.to))
          ? { value: `${str(period.from) || "undetermined"} to ${str(period.to) || "undetermined"}`, source: det.id }
          : none("the determination states no date for the act, so it is undetermined");
      const cites = [], srcs = [];
      let withheld = false;
      for (const s of det.standards) {
        const sid = str(isObj(s) ? s.id : s);
        const r = sid ? this.#standard(sid, viewer) : null;
        if (!r || !str(r.cite)) { withheld = true; continue; }
        cites.push(str(r.cite)); srcs.push(sid);
      }
      out.standards = withheld ? none("a standard the determination names is not one you may see")
        : cites.length ? { value: cites.join("; "), source: srcs.join(", ") } : none("the determination names no standard");
      const fs = det.findings.filter((f) => isObj(f) && str(f.id));
      out.findings = fs.length !== det.findings.length ? none("a finding the determination rests on is not one you may see")
        : fs.length ? { value: fs.map((f) => `${f.id} (case ${f.case ?? "undetermined"}, edition ${f.edition ?? "undetermined"})`).join("; "),
                        source: fs.map((f) => `${f.id}@${f.case ?? "?"}/${f.edition ?? "?"}`).join(", ") }
          : none("the determination names no finding");
    } else for (const k of ["act", "act_date", "standards", "findings"]) out[k] = none(detWhy);
    const gl = action.governing_laws;
    const laws = gl && gl.state === "stated" && Array.isArray(gl.laws) ? gl.laws.map((l) => str(isObj(l) ? l.citation : l)).filter(Boolean) : [];
    out.governing_laws = laws.length ? { value: laws.join("; "), source: action.id }
      : none("no member has stated the action's governing laws, so they are undetermined");
    out.law = action.law ? { value: action.law, source: action.id }
      : none("the action states no law it is made under, so it is undetermined");
    const clock = action.clock.filter((c) => str(c.date) && str(c.basis));
    out.clock = clock.length
      ? { value: clock.map((c) => `${c.date}: ${str(c.text) || str(c.description) || "a deadline"} (${c.basis})`).join("; "), source: action.id }
      : none("the action holds no clock entry with a date and a basis");
    const venue = entry && isObj(entry.venue) ? entry.venue : null;
    const vsrc = venue ? `profile:${venue.profile || entry.profile}/action_kinds/${entry.kind}/venue` : null;
    out.venue = venue && str(venue.name) ? { value: str(venue.name), source: vsrc }
      : none("the profile gives this kind no venue (or its profiles disagree), so it is undetermined");
    out.venue_how = venue && str(venue.how) ? { value: str(venue.how), source: vsrc } : none("the profile gives no means of filing");
    const g = str(this.#call(() => this.producingGroup()));
    out.group = g ? { value: g, source: "setting:producing_group" } : none("no producing group is recorded for this instance");
    out.date = { value: when.slice(0, 10), source: `clock:${when}` };
    return out;
  }

  /** R1–R5: a draft pre-filled from the record into the profile's template for the action's kind. */
  filingPrepare({ action = null, preparer = null, viewer = null } = {}) {
    const who = str(preparer);
    /* DEC-49 REGION is-filing-prepare */
    if (!who) return { ok: false, reason: "NO_AUTHOR", detail: "no stamped preparer: a draft names who prepared it" };
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    if (CLOSED.includes(a.current_state))
      return { ok: false, reason: "ACTION_CLOSED", action: a.id, state: a.current_state,
               detail: `the action is ${a.current_state}; nothing is prepared for a closed action` };
    const v = this.#view();
    const gov = this.governingTier(a, v);
    if (gov.tier === "undetermined")
      return { ok: false, reason: "FILING_TIER_UNDETERMINED", action: a.id, governing: gov,
               detail: "the action's risk tier is undetermined and is never read as 1: a member states it first (op=actionrisktier)" };
    if (gov.tier === 3)
      return { ok: false, reason: "TIER3_COUNSEL_PACKET", action: a.id, governing: gov,
               detail: "the governing tier is 3: no filing is prepared; a member names counsel and assembles a counsel packet" };
    const entry = v.view && Array.isArray(v.view.action_kinds) ? v.view.action_kinds.find((k) => k.kind === a.kind) : null;
    const conflicted = v.conflicts.some((c) => c.at === `action_kinds[${a.kind}].template`);
    if (!entry || typeof entry.template !== "string" || !entry.template.trim())
      return { ok: false, reason: "KIND_NO_TEMPLATE", action: a.id, kind: a.kind,
               detail: conflicted ? "the active profiles give different templates for this kind, so none is given"
                 : !v.view ? `${v.why}, so no template is held for this kind` : "the profile holds no template for this kind" };
    /* END DEC-49 REGION is-filing-prepare */
    const when = this.#when();
    const { det, hidden } = this.#restsOn(a, viewer);
    const values = this.#values(a, det, hidden, entry, viewer, when);
    const names = [...new Set([...entry.template.matchAll(BLANK_RE)].map((m) => m[1]))];
    const blanks = [], unfilled = [];
    for (const n of names) {
      const val = Object.prototype.hasOwnProperty.call(FILING_BLANKS, n) ? values[n]
        : { why: "filings fills no blank by this name, so the record holds no value for it" };
      if (val && "value" in val) blanks.push({ name: n, value: val.value, source: val.source });
      else unfilled.push({ name: n, why: val.why });
    }
    const filled = new Map(blanks.map((b) => [b.name, b.value]));
    let text = entry.template.replace(BLANK_RE, (_, n) => (filled.has(n) ? filled.get(n) : unfilledMarker(n)));
    let advisory = null;
    if (gov.tier === 2) {
      advisory = str(entry.advisory);
      if (advisory) text = `${advisory}\n\n${text}`;
      else {
        text = `${unfilledMarker("advisory")}\n\n${text}`;
        unfilled.unshift({ name: "advisory", why: "the profile gives no advisory note for this kind (or its profiles "
          + "disagree), so it is undetermined; a member writes one in before the draft can be approved" });
      }
    }
    const venue = isObj(entry.venue) ? { name: entry.venue.name ?? null, how: entry.venue.how ?? null,
                                         source: `profile:${entry.venue.profile || entry.profile}/action_kinds/${entry.kind}/venue` }
      : { state: "undetermined", why: "the profile gives this kind no venue" };
    const basis = this.#basisOf(a, det, gov);
    const year = when.slice(0, 4);
    return this.record.transact(() => {
      const { id } = this.record.allocId("FIL", year);
      this.sql.exec(`INSERT INTO filing_drafts (filing_id, action_id, kind, tier, governing, text, blanks, unfilled,
                       advisory, venue, preparer, prepared_at, basis) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id, a.id, a.kind, gov.tier, json(gov), text, json(blanks), json(unfilled), advisory, json(venue), who, when, json(basis));
      return { ok: true, id, action: a.id, tier: gov.tier, governing: gov, text, blanks, unfilled,
               ...(gov.tier === 2 ? { advisory } : {}), venue, label: proposalLabel(who, "filing_draft"),
               prepared_by: who, at: when, evidence: false, says: DRAFT_SAYS };
    });
  }

  /* R6: what a draft read, so its staleness is stated by name. */
  #basisOf(a, det, gov) {
    return { tier: gov.tier, counterparty: a.counterparty ?? null, determination: det ? det.id : null,
             governing_laws: a.governing_laws && a.governing_laws.state === "stated" ? a.governing_laws.laws ?? [] : null };
  }

  /* R6: what changed since the draft, by name; [] when nothing did. Read as the plane reads it, so a change the
     approving member cannot see is still named. */
  #staleness(draft) {
    const was = parse(draft.basis) || {};
    const a = this.#action(draft.action_id, MACHINE_READER);
    if (!a) return ["the action is no longer held"];
    const changed = [];
    const gov = this.governingTier(a);
    if (gov.tier !== was.tier) changed.push(`the governing tier (was ${was.tier}, now ${gov.tier})`);
    if (json(a.counterparty ?? null) !== json(was.counterparty ?? null)) changed.push("the counterparty");
    const then = was.determination ? this.#det(was.determination, MACHINE_READER) : null;
    const now = this.#restsOn(a, MACHINE_READER).det;
    if (was.determination && (!then || !then.live))
      changed.push(`the determination ${was.determination} was superseded${then && then.superseded_by ? ` by ${then.superseded_by}` : ""}`);
    else if ((now ? now.id : null) !== (was.determination ?? null)) changed.push("the determination the action rests on");
    const laws = a.governing_laws && a.governing_laws.state === "stated" ? a.governing_laws.laws ?? [] : null;
    if (json(laws) !== json(was.governing_laws ?? null)) changed.push("the governing laws");
    return changed;
  }

  /* A draft the viewer may see (through its action), or null (R19). */
  #draft(id, viewer) {
    const f = str(id);
    const d = f ? this.#one(`SELECT * FROM filing_drafts WHERE filing_id=?`, f) : null;
    return d && this.#action(d.action_id, viewer) ? d : null;
  }

  /* ---------------------------------------------------------------- R6: filingApprove */

  /** R6: a member approves the draft's text or an edited text, at most once; the approved text is the member's. */
  filingApprove({ filing = null, text = undefined, author = null, viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-filing-approve */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_APPROVE",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: a machine prepares, and a member approves`
                           : "no member is named as the one approving" };
    const d = this.#draft(filing, viewer);
    if (!d) return { ok: false, reason: "NO_SUCH_FILING", filing: str(filing),
                     detail: "no draft by that id is readable here; one you may not see answers the same" };
    const held = this.#one(`SELECT approved_by, at FROM filing_approvals WHERE filing_id=?`, d.filing_id);
    if (held) return { ok: false, reason: "ALREADY_APPROVED", filing: d.filing_id, approved_by: held.approved_by, at: held.at,
                       detail: "a draft is approved at most once; prepare a new draft to approve another text" };
    const changed = this.#staleness(d);
    if (changed.length)
      return { ok: false, reason: "FILING_STALE", filing: d.filing_id, changed,
               detail: `since the draft was prepared: ${changed.join("; ")} changed. Prepare it again.` };
    const body = text === undefined || text === null ? d.text : text;
    if (typeof body === "string" && UNFILLED_RE.test(body))
      return { ok: false, reason: "STILL_UNFILLED", filing: d.filing_id, unfilled: [...body.matchAll(/\[UNFILLED: ([^\]\n]*)\]/g)].map((m) => m[1]),
               detail: "the text still holds a blank the record could not fill; a member writes it in first" };
    if (typeof body !== "string" || !body.trim() || WELL_FORMED.test(body) || utf8(body) > FILING_TEXT_MAX)
      return { ok: false, reason: "TEXT_UNWRITABLE", filing: d.filing_id, max_bytes: FILING_TEXT_MAX,
               detail: `the approved text must be non-empty UTF-8 text of at most ${FILING_TEXT_MAX} bytes` };
    /* END DEC-49 REGION is-filing-approve */
    const at = this.#when();
    const sha = sha256HexSync(body);
    this.sql.exec(`INSERT INTO filing_approvals (filing_id, action_id, text, sha, approved_by, at) VALUES (?,?,?,?,?,?)`,
                  d.filing_id, d.action_id, body, sha, who, at);
    return { ok: true, filing: d.filing_id, action: d.action_id, approved_by: who, at, sha, edited: body !== d.text,
             says: "approved by the member named: the text is theirs. The instance transmits nothing; a member files it "
                 + "by the venue's own means and records that it was sent" };
  }

  /* ---------------------------------------------------------------- R7: filingRecordSent */

  /** R7: records the sending as one `sent` correspondence entry on the action (actions R15, R16), linked to the draft
   *  both ways. It moves no action state and writes no clock entry: `proposed` carries what a member may choose. */
  filingRecordSent({ filing = null, at = null, medium = null, artifactSha = null, account = null, author = null,
                     viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-filing-sent */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_FILE",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: only a member files and records it`
                           : "no member is named as the one who sent it" };
    const d = this.#draft(filing, viewer);
    if (!d) return { ok: false, reason: "NO_SUCH_FILING", filing: str(filing),
                     detail: "no draft by that id is readable here; one you may not see answers the same" };
    if (!this.#one(`SELECT 1 AS x FROM filing_approvals WHERE filing_id=?`, d.filing_id))
      return { ok: false, reason: "NOT_APPROVED", filing: d.filing_id, detail: "a member approves the draft before it is recorded as sent" };
    const sent = this.#one(`SELECT ord, sent_on, recorded_by FROM filing_sendings WHERE filing_id=?`, d.filing_id);
    if (sent) return { ok: false, reason: "ALREADY_SENT", filing: d.filing_id, ord: sent.ord, at: sent.sent_on,
                       recorded_by: sent.recorded_by, detail: "this draft is already recorded as sent" };
    /* END DEC-49 REGION is-filing-sent */
    if (!this.actions || typeof this.actions.actionCorrespond !== "function")
      return { ok: false, reason: "NO_SUCH_ACTION", action: d.action_id, detail: "no module records an action's correspondence" };
    const now = this.#when();
    const out = this.record.transact(() => {
      const c = this.actions.actionCorrespond({ target: d.action_id, direction: "sent", at,
        ...(medium != null ? { medium } : {}), ...(artifactSha != null ? { artifactSha } : {}),
        ...(account != null ? { account } : {}), viewer, author: who });
      if (!c || c.ok === false) return c || { ok: false, reason: "NO_SUCH_ACTION", action: d.action_id };
      const ord = Number.isInteger(Number(c.ord)) ? Number(c.ord) : null;
      this.sql.exec(`INSERT INTO filing_sendings (filing_id, action_id, ord, sent_on, medium, artifact_sha, account,
                       recorded_by, recorded_at) VALUES (?,?,?,?,?,?,?,?,?)`,
        d.filing_id, d.action_id, ord, String(at ?? ""), medium, artifactSha, account, who, now);
      return { ok: true, ord, entry: c };
    });
    if (!out || out.ok === false) return out;
    return { ok: true, filing: d.filing_id, action: d.action_id, ord: out.ord, recorded_by: who, at: now,
             held_as: out.entry.held_as ?? (artifactSha ? "capture" : "testimony"),
             proposed: this.#proposed(d, who, viewer),
             says: "recorded as sent by the member named. No action state moved and no clock entry was written: "
                 + "`proposed` is what a member may choose next" };
  }

  /* R7: the next state a member may choose, and the clock entries actions offers for the kind's deadlines that start
     at filing or receipt (its R32), each stored apart by actions, none written into the clock. */
  #proposed(d, who, viewer) {
    const a = this.#action(d.action_id, viewer);
    const state = a ? a.current_state : null;
    const next = state === "planned" ? "active" : state === "active" ? "awaiting_response" : null;
    const v = this.#view();
    const rules = v.view && Array.isArray(v.view.deadlines)
      ? v.view.deadlines.filter((r) => a && r.applies_to === a.kind && (r.starts === "filed" || r.starts === "received")) : [];
    const clocks = rules.map((r) => {
      const p = this.actions && typeof this.actions.clockPropose === "function"
        ? this.#call(() => this.actions.clockPropose({ target: d.action_id, rule: r.rule, proposer: who, viewer })) : null;
      return { rule: r.rule, starts: r.starts, citation: r.citation ?? null,
               offered: p ?? { ok: false, reason: "UNAVAILABLE", detail: "no module offers a clock entry" } };
    });
    return {
      next_state: next
        ? { to: next, from: state, says: `a member may move the action from ${state} to ${next} (op=actionmove); nothing moved it` }
        : { to: null, from: state, says: "no next state follows from recording the sending; the action's state stays as a member left it" },
      clocks,
      clocks_says: clocks.length ? "clock entries offered for the kind's deadlines that start at filing or receipt; a member "
        + "states one by a revision of the action" : "the profile gives this kind no deadline that starts at filing or receipt",
    };
  }

  /* ---------------------------------------------------------------- R8–R12: the counsel packet */

  /* R9's facts: the finding at its pinned bytes (record-core R60): its question, its conclusion and its citations. */
  #fact(f, det) {
    if (!isObj(f) || !str(f.id))
      return { finding: null, withheld: "an object you may not see", source: det.id };
    const source = `${f.id}@${f.case ?? "?"}/${f.edition ?? "?"}`;
    const text = f.version_sha ? this.#call(() => this.record.textAtSha(f.id, f.version_sha)) : null;
    const base = { finding: f.id, case: f.case ?? null, edition: f.edition ?? null, version_sha: f.version_sha ?? null, source };
    if (typeof text !== "string")
      return { ...base, claim: { state: "undetermined", why: "the finding's published bytes are not held here as text" }, citations: [] };
    let fm = null;
    try { fm = parseFrontmatter(text).data; } catch { fm = null; }
    const m = /\n## Conclusion\s*\n([\s\S]*?)(?=\n## |\s*$)/.exec(text);
    const conclusion = m && m[1].trim() ? m[1].trim() : null;
    const legs = fm && Array.isArray(fm.basis) ? fm.basis.filter(isObj) : [];
    return { ...base,
             claim: { question: str(fm && fm.title), conclusion,
                      ...(conclusion ? {} : { conclusion_why: "the published finding states no conclusion section" }) },
             citations: legs.map((l) => ({ target: str(l.target), ...(str(l.content_id) ? { content_id: str(l.content_id) } : {}),
                                           ...(str(l.role) ? { role: str(l.role) } : {}), source })) };
  }

  /* R9's exhibits: each capture a fact or event cites, with its digest, locator, capture time and attestations. */
  #exhibits(cites) {
    const byCapture = new Map();
    for (const c of cites) {
      let sha = str(c.capture_sha);
      if (!sha && str(c.content_id)) { const row = this.#call(() => this.content.contentRow(c.content_id)); sha = row ? str(row.capture_sha) : null; }
      if (!sha && str(c.target)) sha = str(this.#call(() => this.content.captureFor(c.target)));
      if (!sha) continue;
      if (!byCapture.has(sha)) byCapture.set(sha, []);
      byCapture.get(sha).push(c.source);
    }
    return [...byCapture.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([sha, from]) => {
      const reg = this.#one(`SELECT bundle_id, path, registered FROM register WHERE capture_sha=?`, sha);
      const loc = this.#one(`SELECT address, retrieval_locator, first_retrieved FROM captured_locators WHERE capture_sha=?
                              ORDER BY first_retrieved LIMIT 1`, sha);
      const att = this.#call(() => this.provenance.attestationsOf(sha));
      return { sha256: sha, cited_by: [...new Set(from)].sort(),
               locator: loc ? (loc.retrieval_locator || loc.address)
                 : reg ? `${reg.bundle_id}/${reg.path}` : null,
               ...(loc || reg ? {} : { locator_why: "the record holds no address or register row for this capture" }),
               captured_at: loc ? loc.first_retrieved : reg ? reg.registered : null,
               home: reg ? reg.bundle_id : null,
               attestations: att && att.ok ? { items: att.attestations, ...(att.undetermined ? { undetermined: att.undetermined } : {}), note: att.note }
                 : { items: [], undetermined: "the attestations could not be read" } };
    });
  }

  /* R9's deadlines: every claim deadline of the view, its date from a recorded start event only. */
  #deadlines(v, a, det) {
    const rules = v.view && Array.isArray(v.view.deadlines) ? v.view.deadlines.filter((r) => r.applies_to === "claim") : [];
    const entries = a.correspondence.map((e, i) => ({ ...e, ord: Number.isInteger(e.ord) ? e.ord : i }));
    const first = (dir) => entries.filter((e) => e.direction === dir && realDate(String(e.at ?? "").slice(0, 10)))
      .sort((x, y) => (String(x.at) < String(y.at) ? -1 : String(x.at) > String(y.at) ? 1 : x.ord - y.ord))[0] || null;
    return rules.map((r) => {
      let start;
      const act = det ? det.act || {} : {};
      if (r.starts === "act")
        start = realDate(act.at) ? { event: "act", date: act.at, source: det.id }
          : { event: "act", state: "undetermined", why: det ? "the determination states the act over a period or not at all, so no single day starts the count" : "no live determination states the act" };
      else if (r.starts === "received" || r.starts === "filed") {
        const e = first(r.starts === "received" ? "received" : "sent");
        start = e ? { event: r.starts, date: String(e.at).slice(0, 10), source: `${a.id}#${e.ord}` }
          : { event: r.starts, state: "undetermined", why: `the action's correspondence holds no ${r.starts === "received" ? "received" : "sent"} entry` };
      } else start = { event: r.starts ?? null, state: "undetermined",
                       why: r.starts === "known" ? "the record holds no date on which the group knew of the act" : "the rule names no start event this record holds" };
      const date = deadlineDate({ start: start.date ?? null, days: r.days, count: r.count, holidays: v.view.holidays });
      return { rule: r.rule, days: r.days ?? null, count: r.count ?? null, starts: r.starts ?? null,
               ...(r.extension ? { extension: r.extension } : {}), citation: r.citation ?? null,
               basis: r.basis ?? null, profile: r.profile ?? null, source: `profile:${r.profile}/deadlines/${r.rule}`,
               start, date: date.state === "determined" ? { ...date, start_source: start.source } : date };
    });
  }

  /* R9: the six sections and the consequences, each item naming its source. */
  #assemble(a, det, viewer, marking) {
    const v = this.#view();
    const section = (title, items, extra = {}) => ({ title, marking, items, ...extra });
    const facts = det.findings.map((f) => this.#fact(f, det));
    const events = [], undated = [];
    const act = det.act || {};
    const actDay = realDate(act.at) || (isObj(act.period) ? realDate(act.period.from) : null);
    const push = (day, e) => (day ? events.push({ day, ...e }) : undated.push({ ...e, why: "the record states no date for it" }));
    push(actDay, { event: `the act: ${str(act.description) || "undescribed"}`, source: det.id,
                   ...(isObj(act.actor) ? { actor: { role: act.actor.role ?? null, body: act.actor.body ?? null } } : {}) });
    for (const f of facts) {
      if (!f.finding) continue;
      const r = f.case != null ? this.#one(`SELECT ratified_at FROM published_cases WHERE case_id=? AND edition=?`, f.case, Number(f.edition)) : null;
      push(r ? realDate(String(r.ratified_at).slice(0, 10)) : null,
           { event: `${f.finding} published in case ${f.case} edition ${f.edition}`, source: f.source });
    }
    if (a.state_history === null)
      undated.push({ event: "the action's state history", source: a.id, why: "the action's read does not answer its state history" });
    for (const [i, h] of (a.state_history || []).entries())
      push(realDate(String(h.at ?? "").slice(0, 10)), { event: `the action moved from ${h.from ?? "undetermined"} to ${h.to ?? "undetermined"}`,
                                                        source: `${a.id}/state_history[${i}]` });
    for (const [i, e] of a.correspondence.entries()) {
      const ord = Number.isInteger(e.ord) ? e.ord : i;
      push(realDate(String(e.at ?? "").slice(0, 10)), { event: `correspondence ${e.direction ?? "undetermined"}${str(e.party) ? ` (${e.party})` : ""}`,
                                                        source: `${a.id}#${ord}` });
    }
    for (const [i, c] of a.clock.entries())
      push(realDate(c.date), { event: `clock: ${str(c.text) || str(c.description) || "a deadline"} (${c.status ?? "undetermined"})`,
                               basis: c.basis ?? null, source: `${a.id}/clock[${i}]` });
    events.sort(byDayThenSource);
    const cites = [];
    for (const f of facts) for (const c of f.citations || []) cites.push({ content_id: c.content_id, target: c.content_id ? null : c.target, source: f.source });
    for (const cid of Array.isArray(act.evidence) ? act.evidence : []) cites.push({ content_id: str(cid), source: det.id });
    for (const [i, e] of a.correspondence.entries())
      if (str(e.artifact_sha)) cites.push({ capture_sha: str(e.artifact_sha), source: `${a.id}#${Number.isInteger(e.ord) ? e.ord : i}` });
    const standards = det.standards.map((s) => {
      const sid = str(isObj(s) ? s.id : s);
      const r = sid ? this.#standard(sid, viewer) : null;
      if (!r) return { standard: null, withheld: "an object you may not see", source: det.id };
      return { standard: sid, cite: r.cite ?? null, kind: r.kind ?? null, issuer: r.issuer ?? null,
               text: Array.isArray(r.text) ? r.text : [], outcome: isObj(s) ? s.outcome ?? null : null,
               in_force: this.#inForce(sid, realDate(act.at)), source: sid };
    });
    const theories = this.#rows(`SELECT * FROM theory_proposals WHERE action_id=? ORDER BY theory_id`, a.id).map((t) => ({
      theory_id: t.theory_id, candidate: true, theory: t.theory, remedy: t.remedy, standards: parse(t.standards) || [],
      why: t.why, label: proposalLabel(t.proposer, "theory"), at: t.at, source: t.theory_id }));
    const cons = this.consequences && typeof this.consequences.consequencesOf === "function"
      ? this.#call(() => this.consequences.consequencesOf({ determination: det.id, viewer })) : null;
    return {
      facts: section("Facts", facts),
      chronology: section("Chronology", events.map(({ day, ...e }) => ({ date: day, ...e })),
                          { undated, order: "by date; events on the same day by source id" }),
      exhibits: section("Exhibits", this.#exhibits(cites)),
      standards: section("Standards", standards),
      theories: section("Candidate theories and remedies", theories,
        { says: theories.length ? "each is a candidate for counsel to weigh, never the group's position or a conclusion"
                                : "no candidate theory or remedy has been proposed for this action" }),
      deadlines: section("Deadlines", this.#deadlines(v, a, det),
        { says: v.view ? `each date is computed only from a recorded start event (${COUNTED_FROM}), else undetermined with why`
                       : `${v.why}, so no claim deadline is known` }),
      consequences: section("Consequences of the breach",
        cons && cons.ok !== false ? [{ recorded: cons, source: det.id }] : [],
        { says: cons && cons.ok !== false ? "as recorded, each part in its own state; nothing summed across states"
                                          : "the consequences could not be read, so they are undetermined" }),
    };
  }

  /* R12: what a version drew on. */
  #packetBasis(det) {
    return { determination: det.id, project: det.project,
             findings: det.findings.filter((f) => isObj(f) && str(f.id)).map((f) => ({ id: f.id, case: f.case ?? null, edition: f.edition ?? null })),
             standards: det.standards.map((s) => str(isObj(s) ? s.id : s)).filter(Boolean) };
  }

  /** R12: each cause a version's basis changed since it was assembled, read now; nothing in the version changes. */
  #basisChanged(basis) {
    const causes = [];
    const d = this.#det(basis.determination, MACHINE_READER);
    if (!d || !d.live) causes.push({ cause: "determination_superseded", determination: basis.determination,
                                     ...(d && d.superseded_by ? { by: d.superseded_by } : {}) });
    else if (d.basis_changed) causes.push({ cause: "determination_flagged", determination: basis.determination,
                                            causes: d.basis_changed.causes ?? [] });
    for (const f of basis.findings || []) {
      const e = this.#call(() => this.publication.publishedEditionsOf({ finding: f.id, project: basis.project || null }));
      const later = e && e.ok ? e.items.filter((i) => i.case === f.case && Number(i.edition) > Number(f.edition)) : [];
      if (later.length) causes.push({ cause: "finding_later_edition", finding: f.id, case: f.case, edition: f.edition,
                                      later: Math.max(...later.map((i) => Number(i.edition))) });
    }
    for (const s of basis.standards || []) {
      const r = this.#standard(s, MACHINE_READER);
      if (r && str(r.superseded_by)) causes.push({ cause: "standard_superseded", standard: s, by: str(r.superseded_by) });
    }
    return causes;
  }

  #counsel(c) {
    if (!isObj(c)) return null;
    const ok = (v) => typeof v === "string" && v.trim() && v.trim().length <= COUNSEL_FIELD_MAX && !/[\n\r]/.test(v);
    if (!ok(c.name) || !ok(c.organisation)) return null;
    if (c.contact != null && !ok(c.contact)) return null;
    return { name: c.name.trim(), organisation: c.organisation.trim(), ...(c.contact != null ? { contact: c.contact.trim() } : {}) };
  }

  /** R8–R10, R12: a counsel packet for the counsel a member names; assembling again makes a new version. */
  counselPacket({ action = null, counsel = null, author = null, viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-counsel-packet */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_NAME_COUNSEL",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: the group names its counsel`
                           : "no member is named as the one naming counsel" };
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    const gov = this.governingTier(a);
    if (gov.tier !== 3)
      return { ok: false, reason: "NOT_TIER3", action: a.id, governing: gov,
               detail: "a counsel packet is assembled only for a governing tier of 3" };
    const c = this.#counsel(counsel);
    if (!c) return { ok: false, reason: "NO_COUNSEL", max: COUNSEL_FIELD_MAX,
                     detail: "counsel is named by a name and an organisation (contact optional), each one line of at most "
                           + `${COUNSEL_FIELD_MAX} characters` };
    const { det } = this.#restsOn(a, viewer);
    if (!det) return { ok: false, reason: "NO_DETERMINATION", action: a.id,
                       detail: this.conformance ? "the action rests on no live determination you may see, so there are no facts to assemble"
                         : "no module answers determinations here, so no live determination can be read" };
    /* END DEC-49 REGION is-counsel-packet */
    const marking = counselMarking(c);
    const sections = this.#assemble(a, det, viewer, marking);
    const basis = this.#packetBasis(det);
    const at = this.#when();
    return this.record.transact(() => {
      const held = this.#one(`SELECT packet_id, MAX(version) AS v FROM counsel_packets WHERE action_id=? GROUP BY packet_id
                               ORDER BY packet_id LIMIT 1`, a.id);
      const id = held ? held.packet_id : this.record.allocId("CPK", at.slice(0, 4)).id;
      const version = held ? Number(held.v) + 1 : 1;
      this.sql.exec(`INSERT INTO counsel_packets (packet_id, version, action_id, counsel, author, at, sections, basis)
                     VALUES (?,?,?,?,?,?,?,?)`, id, version, a.id, json(c), who, at, json(sections), json(basis));
      return { ok: true, id, version, action: a.id, head: this.#head(id, version, a.id, c, who, at, marking),
               sections, marking, fileable: false, basis_changed: null };
    });
  }

  #head(id, version, action, counsel, author, at, marking) {
    return { packet: id, version, action, counsel, assembled_by: author, at, marking, fileable: false,
             says: "prepared for counsel's review from the record; it is never published and is not in a form that can be filed" };
  }

  /* A packet the viewer may see, through its action (R11, R19): its rows, or null. */
  #packet(id, viewer) {
    const p = str(id);
    const rows = p ? this.#rows(`SELECT * FROM counsel_packets WHERE packet_id=? ORDER BY version`, p) : [];
    return rows.length && this.#action(rows[0].action_id, viewer) ? rows : null;
  }

  #version(r, rows) {
    const counsel = parse(r.counsel) || {};
    const marking = counselMarking(counsel);
    const causes = this.#basisChanged(parse(r.basis) || {});
    return { ok: true, id: r.packet_id, version: Number(r.version), action: r.action_id,
             head: this.#head(r.packet_id, Number(r.version), r.action_id, counsel, r.author, r.at, marking),
             sections: parse(r.sections), marking, fileable: false,
             basis_changed: causes.length ? { causes } : null,
             versions: rows.map((x) => Number(x.version)) };
  }

  /** R11, R12: a packet's version (the latest unless one is named), read only by a member who may see the action. */
  counselPacketRead({ id = null, version = null, viewer = null } = {}) {
    const rows = this.#packet(id, viewer);
    /* DEC-49 REGION is-packet-read */
    const r = rows ? (version == null || version === "" ? rows[rows.length - 1] : rows.find((x) => Number(x.version) === Number(version))) : null;
    if (!r) return { ok: false, reason: "NO_SUCH_PACKET", id: str(id),
                     detail: "no counsel packet by that id and version is readable here; one you may not see answers the same" };
    /* END DEC-49 REGION is-packet-read */
    const exports = this.#rows(`SELECT author, at, counsel, sha FROM counsel_packet_exports WHERE packet_id=? AND version=?
                                 ORDER BY export_id`, r.packet_id, r.version)
      .map((e) => ({ exported_by: e.author, at: e.at, counsel: parse(e.counsel), sha: e.sha }));
    return { ...this.#version(r, rows), exports };
  }

  /** R10: the packet's bytes: one Markdown document, the marking on its head, every section and its manifest. */
  static render(v) {
    const lines = [`# Counsel packet ${v.id}, version ${v.version}`, "", v.marking, "",
                   `Action: ${v.action}. Assembled by ${v.head.assembled_by} at ${v.head.at}.`, ""];
    const item = (x) => `- ${JSON.stringify(x)}`;
    for (const s of Object.values(v.sections || {})) {
      lines.push(`## ${s.title}`, "", s.marking, "");
      if (s.says) lines.push(s.says, "");
      for (const x of s.items || []) lines.push(item(x));
      for (const x of s.undated || []) lines.push(item({ undated: true, ...x }));
      lines.push("");
    }
    lines.push("## Manifest of exhibits", "", v.marking, "");
    for (const e of (v.sections && v.sections.exhibits ? v.sections.exhibits.items : [])) lines.push(`- ${e.sha256}`);
    lines.push("");
    return lines.join("\n");
  }

  /** R11: hands a member the packet's bytes, and records who exported which version, when and for which counsel. */
  counselPacketExport({ id = null, version = null, author = null, viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-packet-export */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_EXPORT",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: only a member hands a packet to counsel`
                           : "no member is named as the one exporting" };
    const read = this.counselPacketRead({ id, version, viewer });
    if (!read.ok) return read;
    /* END DEC-49 REGION is-packet-export */
    const bytes = Filings.render(read);
    const sha = sha256HexSync(bytes);
    const at = this.#when();
    this.sql.exec(`INSERT INTO counsel_packet_exports (packet_id, version, action_id, author, at, counsel, sha)
                   VALUES (?,?,?,?,?,?,?)`, read.id, read.version, read.action, who, at, json(read.head.counsel), sha);
    return { ok: true, id: read.id, version: read.version, action: read.action, format: "text/markdown", bytes, sha,
             counsel: read.head.counsel, exported_by: who, at, marking: read.marking, fileable: false };
  }

  /* ---------------------------------------------------------------- R13: filingsFor */

  /** R13: the action's drafts and counsel packets, in creation order; the read `escalation` uses. */
  filingsFor({ action = null, viewer = null } = {}) {
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    const drafts = this.#rows(
      `SELECT d.filing_id, d.tier, d.preparer, d.prepared_at, ap.approved_by, ap.at AS approved_at, ap.sha,
              s.ord, s.sent_on, s.recorded_by, s.recorded_at
         FROM filing_drafts d LEFT JOIN filing_approvals ap ON ap.filing_id=d.filing_id
         LEFT JOIN filing_sendings s ON s.filing_id=d.filing_id
        WHERE d.action_id=? ORDER BY d.prepared_at, d.filing_id LIMIT ?`, a.id, FILINGS_FOR_MAX + 1);
    const versions = this.#rows(`SELECT * FROM counsel_packets WHERE action_id=? ORDER BY at, packet_id, version LIMIT ?`,
                                a.id, FILINGS_FOR_MAX + 1);
    return {
      ok: true, action: a.id,
      drafts: drafts.slice(0, FILINGS_FOR_MAX).map((d) => ({
        filing: d.filing_id, tier: d.tier, label: proposalLabel(d.preparer, "filing_draft"), at: d.prepared_at,
        approval: d.approved_by ? { approved_by: d.approved_by, at: d.approved_at, sha: d.sha } : null,
        sending: d.recorded_by ? { ord: d.ord, sent_on: d.sent_on, recorded_by: d.recorded_by, at: d.recorded_at } : null })),
      drafts_truncated: drafts.length > FILINGS_FOR_MAX,
      packets: versions.slice(0, FILINGS_FOR_MAX).map((r) => {
        const causes = this.#basisChanged(parse(r.basis) || {});
        return { packet: r.packet_id, version: Number(r.version), counsel: parse(r.counsel), assembled_by: r.author, at: r.at,
                 basis_changed: causes.length ? { causes } : null,
                 exports: this.#rows(`SELECT author, at, counsel, sha FROM counsel_packet_exports WHERE packet_id=? AND version=?
                                       ORDER BY export_id`, r.packet_id, r.version)
                   .map((e) => ({ exported_by: e.author, at: e.at, counsel: parse(e.counsel), sha: e.sha })) };
      }),
      packets_truncated: versions.length > FILINGS_FOR_MAX,
    };
  }

  /* ---------------------------------------------------------------- R14: candidate theories */

  /** R14: a candidate theory and remedy against named standards, stored apart and labelled; any credential may propose. */
  theoryPropose({ packet = null, action = null, theory = null, remedy = null, standards = null, why = null,
                  proposer = null, viewer = null } = {}) {
    const who = str(proposer);
    /* DEC-49 REGION is-theory-propose */
    if (!who) return { ok: false, reason: "NO_AUTHOR", detail: "no stamped proposer: a proposal names who made it" };
    let actionId = str(action), packetId = null;
    if (str(packet)) {
      const rows = this.#packet(packet, viewer);
      if (!rows) return { ok: false, reason: "NO_SUCH_PACKET", id: str(packet),
                          detail: "no counsel packet by that id is readable here; one you may not see answers the same" };
      packetId = rows[0].packet_id; actionId = rows[0].action_id;
    }
    const a = this.#action(actionId, viewer);
    if (!a) return this.#noAction(actionId);
    const t = typeof theory === "string" ? theory.trim() : "";
    if (!t || t.length > THEORY_TEXT_MAX)
      return { ok: false, reason: "NO_THEORY", max: THEORY_TEXT_MAX, detail: `state the candidate theory in at most ${THEORY_TEXT_MAX} characters` };
    const rem = remedy == null ? null : String(remedy).trim() || null;
    if (rem !== null && rem.length > THEORY_TEXT_MAX)
      return { ok: false, reason: "NO_THEORY", max: THEORY_TEXT_MAX, detail: `the remedy is over ${THEORY_TEXT_MAX} characters` };
    const list = (Array.isArray(standards) ? standards : typeof standards === "string" ? standards.split(",") : [])
      .map((s) => String(s ?? "").trim()).filter(Boolean);
    if (!list.length) return { ok: false, reason: "NO_STANDARDS", detail: "a candidate theory names the standards it rests on" };
    for (const s of list)
      if (!this.#standard(s, viewer))
        return { ok: false, reason: "NO_SUCH_STANDARD", standard: s, detail: `no standard by the id '${s.slice(0, 60)}' is readable here` };
    const w = typeof why === "string" ? why.trim() : "";
    if (!w || w.length > THEORY_WHY_MAX)
      return { ok: false, reason: "THEORY_WHY_REFUSED", max: THEORY_WHY_MAX, detail: `say why in at most ${THEORY_WHY_MAX} characters` };
    /* END DEC-49 REGION is-theory-propose */
    const at = this.#when();
    return this.record.transact(() => {
      const { id } = this.record.allocId("THY", at.slice(0, 4));
      this.sql.exec(`INSERT INTO theory_proposals (theory_id, action_id, packet_id, theory, remedy, standards, why, proposer, at)
                     VALUES (?,?,?,?,?,?,?,?,?)`, id, a.id, packetId, t, rem, json([...new Set(list)]), w, who, at);
      return { ok: true, proposal: { id, action: a.id, packet: packetId, theory: t, remedy: rem, standards: [...new Set(list)],
                                     why: w, label: proposalLabel(who, "theory"), at },
               evidence: false,
               says: "a candidate theory and remedy, stored apart: it is not the group's position, and it enters the next "
                   + "counsel packet version as a candidate" };
    });
  }

  /* ---------------------------------------------------------------- R15, R21: the available-actions block */

  /** R15's block for these live determinations: the kinds of the view against each determination's offices, each with
   *  its tier and words; for Tier 3 kinds the standards, the factual basis, the counsel sentence and the legal
   *  organisations; the risk classification in the metadata. Never a template or packet content. */
  #block(dets, v) {
    const kinds = (v.view && Array.isArray(v.view.action_kinds) ? v.view.action_kinds : []).map((k) => {
      const tier = [1, 2, 3].includes(k.tier) ? k.tier : "undetermined";
      const out = { kind: k.kind, label: k.label ?? null, tier, words: TIER_WORDS[tier], source: `profile:${k.profile}/action_kinds/${k.kind}` };
      if (tier === 3) {
        const orgs = (Array.isArray(v.view.legal_organisations) ? v.view.legal_organisations : [])
          .filter((o) => Array.isArray(o.evaluates) && o.evaluates.includes(k.kind))
          .map((o) => ({ name: o.name, contacts: o.contacts, source: `profile:${o.profile}/legal_organisations` }));
        out.counsel = COUNSEL_SENTENCE;
        out.legal_organisations = orgs;
        if (!orgs.length) out.legal_organisations_says = "the profile names no legal organisation equipped to evaluate this kind";
      }
      return out;
    });
    const offices = Array.isArray(v.view && v.view.counterparties) ? v.view.counterparties : [];
    const tier3 = kinds.some((k) => k.tier === 3);
    return {
      kinds,
      metadata: { risk_classification: Object.fromEntries(kinds.map((k) => [k.kind, k.tier])) },
      determinations: dets.map((d) => {
        const actor = isObj(d.act && d.act.actor) ? d.act.actor : {};
        const match = offices.find((o) => o.role === actor.role && o.body === actor.body) || null;
        return {
          determination: d.id,
          office: { role: actor.role ?? null, body: actor.body ?? null,
                    in_profile: !!match, ...(match ? { level: match.level ?? null, elected: match.elected ?? null } : {}),
                    says: match ? "an office of the active profile" : "not an office the active profile lists; the kinds are the profile's all the same" },
          ...(tier3 ? { tier3: {
            standards: d.standards.filter((s) => isObj(s) && s.outcome === "noncompliant").map((s) => s.id),
            factual_basis: d.findings.filter((f) => isObj(f) && str(f.id)).map((f) => ({ finding: f.id, case: f.case ?? null, edition: f.edition ?? null })),
            counsel: COUNSEL_SENTENCE } } : {}),
        };
      }),
      says: !v.view ? `${v.why}, so no kind is listed`
        : dets.length ? "the kinds a group may pursue against these offices, from the jurisdiction profile; a Tier 3 kind "
                      + "requires competent counsel, and no template or legal strategy is part of this block"
        : "no live determination rests on this case's findings, so no action is listed against an office",
    };
  }

  /** R21: R15's block for one determination, for `escalation` (its R8). */
  availableActions({ determination = null, viewer = null } = {}) {
    /* DEC-49 REGION is-available-actions */
    const d = this.#det(determination, viewer);
    if (!d) return { ok: false, reason: "NO_SUCH_DETERMINATION", determination: str(determination),
                     detail: "no determination by that id is readable here; one you may not see answers the same" };
    /* END DEC-49 REGION is-available-actions */
    return { ok: true, determination: d.id, live: d.live, ...this.#block([d], this.#view()) };
  }

  /** R15: the block `publication` carries beside a published case edition (its R36): the live determinations of the
   *  case's own project resting on any of its findings, read by the plane. */
  evidenceBlock({ caseId = null, edition = null, findings = [] } = {}) {
    const owner = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, String(caseId ?? ""));
    const seen = new Map();
    if (this.conformance && typeof this.conformance.determinationsFor === "function")
      for (const f of Array.isArray(findings) ? findings : []) {
        const page = this.#call(() => this.conformance.determinationsFor({ finding: f, live: true, viewer: MACHINE_READER }));
        for (const it of page && page.ok !== false && Array.isArray(page.items) ? page.items : []) {
          const id = str(isObj(it) ? it.id : it);
          if (!id || seen.has(id)) continue;
          const d = this.#det(id, MACHINE_READER);
          if (!d || !d.live) continue;
          if (owner && d.project && d.project !== owner.project_id) continue;
          if (!d.findings.some((x) => isObj(x) && x.case === caseId)) continue;
          seen.set(id, d);
        }
      }
    const dets = [...seen.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
    const b = this.#block(dets, this.#view());
    if (!this.conformance || typeof this.conformance.determinationsFor !== "function")
      return { case: caseId, edition, ...b, determinations_read: false,
               says: "no module answers determinations here, so whether one rests on this case is undetermined and no "
                   + "action is listed against an office" };
    return { case: caseId, edition, ...b, determinations_read: true };
  }
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It creates its tables, declares them to purge
 *  (K23, R19) and registers the available-actions block with `publication` (its R36; R15). */
export function filingsOf(host, deps) {
  let f = instances.get(host);
  if (!f) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    f = new Filings({ ...d, host, storage, record });
    instances.set(host, f);
    f.migrate();
    record.declarePurge("filings", FILINGS_TABLES);
    f.publication.registerEvidenceBlock("filings", "available_actions", (arg) => f.evidenceBlock(arg));
  }
  return f;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function filingsOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return FILINGS_TABLES.some((x) => x.name === name);
}

/** The module's ops (K3), as entries of the legacy store's op map, for legacy-index to route. `viewer` and `author` are
 *  the control plane's stamps, read from the query after the body, so a caller's own copy never wins. */
export function filingsOps(f, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    filingprepare: () => f.filingPrepare({ action: b.action ?? q("action"), preparer: q("author"), viewer: q("viewer") }),
    filingapprove: () => f.filingApprove({ filing: b.filing ?? q("filing"), text: b.text, author: q("author"), viewer: q("viewer") }),
    filingsent: () => f.filingRecordSent({ filing: b.filing ?? q("filing"), at: b.at ?? q("at"), medium: b.medium ?? null,
                                           artifactSha: b.artifactSha ?? b.artifact_sha ?? null, account: b.account ?? null,
                                           author: q("author"), viewer: q("viewer") }),
    counselpacket: () => f.counselPacket({ action: b.action ?? q("action"), counsel: b.counsel ?? null, author: q("author"),
                                           viewer: q("viewer") }),
    counselpacketread: () => f.counselPacketRead({ id: q("id"), version: q("version"), viewer: q("viewer") }),
    counselpacketexport: () => f.counselPacketExport({ id: b.id ?? q("id"), version: b.version ?? q("version"),
                                                       author: q("author"), viewer: q("viewer") }),
    filingsfor: () => f.filingsFor({ action: q("action"), viewer: q("viewer") }),
    theorypropose: () => f.theoryPropose({ packet: b.packet ?? null, action: b.action ?? null, theory: b.theory, remedy: b.remedy,
                                           standards: b.standards, why: b.why, proposer: q("author"), viewer: q("viewer") }),
    availableactions: () => f.availableActions({ determination: q("determination"), viewer: q("viewer") }),
  };
}
