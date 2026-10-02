/* filings — what the group sends, prepared from the record (requirements: `build/requirements/filings.md`; Design
 * Requirement 8 as amended 2026-09-26, K13, K102; the Action layer, K608; filing templates, K921, K922, K924). For an
 * action whose governing tier is 1 or 2, a draft pre-filled from the record into an offered version of a template
 * (`filing-templates`; the profile's `file` template for the kind by default) or into the member's own words, every
 * filled blank naming its source, the template and version recorded (R1–R5, R28, R29); a member approves it and records
 * that it was sent (R6, R7), and may start a template draft from it (R32). At any tier, a counsel packet (a briefing) for
 * counsel the group names (required at Tier 3) or for the group's own review, marked as prepared for review, never
 * published and never fileable, with a `briefing` section filled from a `brief` template when one is named (R8–R12,
 * R31). A communication to anyone is drafted without a template and goes the same way (R23). Approved bytes and
 * exports carry the in-band quartet (R22); whatever is prepared from an action resting on a premise override says so
 * first (R24); exhibits show their grades beside the venue's standard (R25); deadlines state the calendar's
 * confirmation (R30), read by `action-clocks.factReader` (its R12; N474). Candidate theories are proposals, stored
 * apart and labelled (R14). The evidence package's available-actions block is registered with `public-read` (R15)
 * and answered on its own for `escalation` (R21). The AI prepares; a member approves, files and records it.
 *
 * A NEW MODULE (T8, layer 9): nothing moved into it and it writes no legacy file. Its tables are `./schema.mjs`; a
 * deadline's date is `./dates.mjs`, counted by `action-clocks`' rule. Its R26 library moved to `filing-templates` (T21,
 * K921, K922); its table `filing_templates` stays, written by nothing, as that module's migration's read contract (K986).
 *
 * REACHED as `filingsOf(host, deps)` (K61): one instance per host, created on the first call with `deps`. At creation it
 * creates its tables, declares them to record-core's purge (K23, R19) and registers the available-actions block with
 * `public-read` (its R8; R15 here). `deps` (each module is reached through its factory on the same host unless given):
 *   record, publication, provenance, content   `getSetting`, `allocId`, `transact`, `textAtSha`, `declarePurge`;
 *                                   `publishedEditionsOf`; `captureGrade` (R25); `contentRow`, `captureFor`.
 *   attestation    `attestationsOf` (its R7; R9's exhibits and R25's co-attestation), from `attestationOf` (N512: split
 *                  from `provenance`, whose R49 it was).
 *   publicRead     `registerEvidenceBlock` (its R8; R15), from `publicReadOf` (K651).
 *   strength       `projectBar` (its R14): the floors of R22's quartet.
 *   membership     `inSight` (its R80): the sight of the project a draft, packet or template draws on (R11, R13, K316).
 *   actions        `actionRead` (its R29), `actionCorrespond` (R15, R16), from `actionsOf` (K253); and its module-level
 *                  `noSuchAction` (R43), through which every missing action is answered (N217).
 *   actionClocks   `clockPropose` (its R2, was actions R32; K617), from `actionClocksOf`.
 *   filingTemplates  `offeredVersion` (its R25; R28, R31), `templatesFor`, `templateRead` (its R14; R28, R29),
 *                  `templateDraft` (its R3; R32), from `filingTemplatesOf` (K921, K922).
 *   localFacts     `factStatus` (its R2; R30): each holiday year a packet's business-day deadline reads, as action-clocks
 *                  R10 reads it, from `localFactsOf`.
 *   conformance    `determinationRead` (its R9), `determinationsFor` (R11), from `conformanceOf` (K252).
 *   standards      `standardRead` (its R5), `inForce` (R7), from `standardsOf(host, deps)` (K251).
 *   consequences   `consequencesOf` (its R7), from `consequencesModule(host, deps)` (K171 (17), K250).
 *   promotion      `fact("producingGroup")` (its R40; R3's `group`, N331), from `promotionOf` on the same host unless given.
 *   producingGroup a function answering the instance's producing group, or null when none is recorded (R3's `group`),
 *                  or answering promotion's fact as `fact` answers it. No caller hands one in since the legacy store's
 *                  retirement (a test may); absent, the group is read through `promotion.fact("producingGroup")`.
 *   profiles       a function answering the active profiles (ids or profile objects) to combine; default record-core's
 *                  setting `jurisdiction_profiles` (its R26).
 *   now            the clock for the instants it writes, an ISO string (default: the wall clock, to the second).
 *
 * READ CONTRACTS it joins in its own SQL: publication's `cases` and `published_cases` (`case_id`, `edition`,
 * `project_id`, `ratified_at`, its R40); provenance's `register` and `captured_locators` (its R48).
 *
 * No place, law, venue, template or legal organisation is named here (R20): every one comes from the active
 * jurisdiction profiles' combined view (`jurisdictions.combine` over record-core's `jurisdiction_profiles`), or from
 * the group's own templates (`filing-templates`). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { attestationOf } from "../attestation/index.mjs";
import { contentOf } from "../content/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { publicReadOf } from "../public-read/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { strengthOf } from "../strength/index.mjs";
import { inbandQuartet } from "../inband.mjs";
import { standardsOf } from "../standards/index.mjs";
import { conformanceOf } from "../conformance/index.mjs";
import { consequencesModule } from "../consequences/index.mjs";
import { actionsOf, noSuchAction } from "../actions/index.mjs";
import { actionClocksOf, factReader } from "../action-clocks/index.mjs";
import { localFactsOf } from "../local-facts/index.mjs";
import { filingTemplatesOf, FILING_BLANKS, FILING_TEXT_MAX, blanksOf, withRow as templatesRow }
  from "../filing-templates/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { isMachineIdentity, MACHINE_CLASS_PREFIX } from "../record-grammar/actors.mjs";
import { proposalLabel } from "../record-grammar/labels.mjs";
import { parseFrontmatter } from "../record-grammar/frontmatter.mjs";
import { BASIS_GRADES } from "../record-grammar/grades.mjs";
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { FILINGS_TABLES, migrateFilings } from "./schema.mjs";
import { rowOf } from "./checks.mjs";
import { deadlineDate, realDate, COUNTED_FROM } from "./dates.mjs";

export { FILINGS_SCHEMA, FILINGS_TABLES } from "./schema.mjs";
export { FILINGS_CHECKS } from "./checks.mjs";
export { deadlineDate, COUNTED_FROM } from "./dates.mjs";

/* R3, R28 (K922 (1)): the blanks, the longest text and `blanksOf` are `filing-templates`' (its R19), read there; this
   module holds no copy. */
export { FILING_BLANKS, FILING_TEXT_MAX } from "../filing-templates/index.mjs";
/** R3: the marker a blank the record cannot fill leaves in the text. */
export const unfilledMarker = (name) => `[UNFILLED: ${name}]`;
export const UNFILLED_RE = /\[UNFILLED: [^\]\n]*\]/;
const BLANK_RE = /\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g;
/** R14: the longest `why`; and the longest theory and remedy, in characters. */
export const THEORY_WHY_MAX = 1000;
export const THEORY_TEXT_MAX = 2000;
/** R8: the longest counsel name, organisation or contact. */
export const COUNSEL_FIELD_MAX = 200;
/** R8 (DEC-88): the longest reason a packet's author gives, in characters (code points). */
export const PACKET_REASON_MAX = 2000;
/** R13: the drafts and the packet versions one `filingsFor` read lists, each. */
export const FILINGS_FOR_MAX = 200;
/** R10: the marking every section, the packet's head and every export carry; with no counsel named (Tier 1 or 2, K924),
 *  the group's own. */
export const counselMarking = (counsel) => (counsel && counsel.name
  ? `Prepared for review by ${counsel.name}, ${counsel.organisation}. Not legal advice. Not for filing.`
  : "Prepared for the group's own review. Not legal advice. Not for filing.");
/** R24: the words a draft, packet or communication prepared from an action carrying a premise override opens with. */
export const OVERRIDE_HEAD = "Rests on an unestablished premise:";
/** R24: the disclosure line, from the override as the action's read answers it (actions R8, R25). */
export const overrideDisclosure = (o) =>
  `${OVERRIDE_HEAD} ${o.reason} (stated by ${o.by ?? "an author the record does not name"} at ${o.at ?? "a time the record does not state"})`;
/** R23: the longest purpose, in characters. */
export const COMMUNICATION_PURPOSE_MAX = 500;
/** R28: the most offered `file` templates `TEMPLATE_NOT_NAMED` lists. */
export const TEMPLATES_NAMED_MAX = 20;
/** R22: the line that opens the in-band block below the text of approved or exported bytes. */
export const INBAND_RULE = "---- in-band ----";
/** R22: the in-band block appended to bytes leaving the instance: the quartet's hash, date, author and both floors,
 *  in words and as JSON, so a reader holding only the bytes can re-hash the text above the rule. */
export function inbandBlock(q) {
  const f = q.floors || {};
  return [INBAND_RULE, `Format: ${q.format}.`,
          `Hash: sha256 ${q.hash.sha256} over ${q.hash.over} (${q.hash.bytes} bytes; ${q.hash.canonical}).`,
          `Date: ${q.date ?? "undetermined"}. Author: ${q.author ?? "undetermined"}.`,
          `Floors: capture ${f.capture ?? "none"}, connection ${f.connection ?? "none"}. ${f.detail ?? ""}`.trimEnd(),
          JSON.stringify(q), ""].join("\n");
}
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
const withRowNow = (r) => {
  const row = r && r.ok === false && !r.check ? rowOf(r.reason) : null;
  return row ? { ...r, code: r.reason, check: row.check, translation: row.translation } : r;
};
/* R22: an approval and an export answer a promise (the in-band quartet's hash is crypto.subtle's); the row is added
   when it settles. */
const withRow = (r) => (r && typeof r.then === "function" ? r.then(withRowNow) : withRowNow(r));
/** The services answered with DEC-49's rows. */
const SERVICES = Object.freeze(["filingPrepare", "filingApprove", "filingRecordSent", "counselPacket", "counselPacketRead",
                                "counselPacketExport", "filingsFor", "theoryPropose", "availableActions",
                                "communicationPrepare", "templateSave"]);
const byDayThenSource = (a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : a.source < b.source ? -1 : a.source > b.source ? 1 : 0);

export class Filings {
  #deps;

  constructor({ storage, record, host = null, membership = null, publication = null, publicRead = null, provenance = null,
                attestation = null, content = null,
                actions = null, conformance = null, standards = null, consequences = null, promotion = null, strength = null, actionClocks = null,
                localFacts = null, filingTemplates = null,
                producingGroup = null, profiles = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.#deps = { host, membership, publication, publicRead, provenance, attestation, content, actions, conformance, standards, consequences, promotion, strength, actionClocks, localFacts, filingTemplates };
    /* R3 (N331): the producing group is promotion's fact `producingGroup` (its R40), read as `fact` answers it; a
       function handed in (as the retired legacy store's was) is kept and may answer a value, null, or the fact's answer.
       Absent, `#group` asks promotion itself, and says so when no promotion module is reachable (N355: no refusal code
       of promotion's is spelled here). */
    this.producingGroup = typeof producingGroup === "function" ? producingGroup : null;
    this.profiles = typeof profiles === "function" ? profiles : () => this.record.getSetting("jurisdiction_profiles");
    this.now = typeof now === "function" ? now : () => stampInstant("second");
    for (const m of SERVICES) { const fn = this[m].bind(this); this[m] = (...a) => withRow(fn(...a)); }
  }

  /* The earlier modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get membership() { return this.#deps.membership ||= (this.#deps.host ? membershipOf(this.#deps.host, { record: this.record }) : null); }
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host); }
  get publicRead() { return this.#deps.publicRead ||= publicReadOf(this.#deps.host, { publication: this.publication }); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  /* R9, R25: the attestations a capture holds (attestation R7); with no host and none given, absent, and every exhibit's
     attestations are undetermined, said so. */
  get attestation() {
    return this.#deps.attestation ||= (this.#deps.host
      ? attestationOf(this.#deps.host, { record: this.record, provenance: this.provenance }) : null);
  }
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }
  get promotion() { return this.#deps.promotion ||= (this.#deps.host ? promotionOf(this.#deps.host) : null); }
  get strength() { return this.#deps.strength ||= (this.#deps.host ? strengthOf(this.#deps.host) : null); }
  /* The layer-9 modules, each its own factory on the same host unless given (K253); with no host, absent, and every
     service that needs one refuses (K248). */
  get standards() { return this.#deps.standards ||= (this.#deps.host ? standardsOf(this.#deps.host) : null); }
  get conformance() { return this.#deps.conformance ||= (this.#deps.host ? conformanceOf(this.#deps.host) : null); }
  get consequences() { return this.#deps.consequences ||= (this.#deps.host ? consequencesModule(this.#deps.host) : null); }
  get actions() { return this.#deps.actions ||= (this.#deps.host ? actionsOf(this.#deps.host) : null); }
  get actionClocks() { return this.#deps.actionClocks ||= (this.#deps.host ? actionClocksOf(this.#deps.host) : null); }
  /* R30: local-facts' `factStatus` (its R2), the confirmation of each holiday year a business count reads; with no host
     and none given, absent, and a business count states its calendar `not_read`. */
  get localFacts() { return this.#deps.localFacts ||= (this.#deps.host ? localFactsOf(this.#deps.host) : null); }

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
      premise_override: Filings.#override(a.premise_override),
    };
  }

  /* R24: the premise override an action carries (actions R8, shown in its read, R25: `{reason, by, at}`); null when it
     carries none. */
  static #override(o) {
    if (!isObj(o) || !str(o.reason)) return null;
    return { reason: str(o.reason), by: str(o.by), at: str(o.at) };
  }

  /* R1, R8, R13, R14: the one answer for an action that is absent, invisible, not an action, or unreadable because no
     module answers actions' read (K248: refused, never passed). The code is actions' (its R43; N217, K275): its row, its
     fixed sentence; where no module answers the read, `why` says so as an extra field (K351). */
  #noAction(id) {
    return noSuchAction(str(id), this.actions && typeof this.actions.actionRead === "function" ? undefined
      : { why: "no module answers an action's read here, so no action is readable" });
  }

  /* R6, R7, R19: the one answer for a draft that is absent or whose action the viewer may not see. */
  #noFiling(id) {
    /* DEC-49 REGION is-no-such-filing */
    return { ok: false, reason: "NO_SUCH_FILING", filing: str(id),
             detail: "no draft by that id is readable here; one you may not see answers the same" };
    /* END DEC-49 REGION is-no-such-filing */
  }

  /* R11, R14, R19: the one answer for a packet (or version) that is absent or whose action the viewer may not see. */
  #noPacket(id) {
    /* DEC-49 REGION is-no-such-packet */
    return { ok: false, reason: "NO_SUCH_PACKET", id: str(id),
             detail: "no counsel packet by that id and version is readable here; one you may not see answers the same" };
    /* END DEC-49 REGION is-no-such-packet */
  }

  /* R11, R13 (K316): whether `viewer` may see the project of every determination and consequence a draft's or a packet
     version's `basis` draws on. A basis draws on at most its one determination, and a consequence is a part of that
     determination (consequences R1), so in its project: the project stored on the basis, else the determination's as
     the plane reads it. A draft that drew on no determination draws on no project. Fails closed: a project not readable,
     or no membership module to ask, is not seen. membership's `inSight` is the sight conformance R15 and consequences
     R13 withhold by. */
  #sees(basis, viewer) {
    const det = isObj(basis) ? str(basis.determination) : null;
    if (!det) return true;
    const project = str(basis.project) || (this.#det(det, MACHINE_READER) || {}).project || null;
    return this.#inSight(project, viewer);
  }

  #inSight(id, viewer) {
    const m = this.membership;
    return !!str(id) && !!m && typeof m.inSight === "function" && this.#call(() => m.inSight(id, viewer)) === true;
  }

  /* A determination as conformance's read answers it (its R9), or null. R27 (DEC-36): what conformance withholds from
     `viewer` (its R24: left out, `out_of_view: true`) is carried as `withheld`, and nothing stands in for it; an item
     answered without an id (a placeholder) is read the same way, left out. */
  #det(id, viewer) {
    if (!str(id) || !this.conformance || typeof this.conformance.determinationRead !== "function") return null;
    const d = this.#call(() => this.conformance.determinationRead({ id: str(id), viewer }));
    if (!d || d.ok === false) return null;
    /* K252: conformance names a finding `finding` and a standard `standard`; each is read here under `id`. */
    const named = (key) => (Array.isArray(d[key]) ? d[key] : [])
      .map((x) => (isObj(x) ? { ...x, id: str(key === "findings" ? x.finding : x.standard) || str(x.id) } : null));
    const findings = named("findings"), standards = named("standards");
    const seen = (x) => !!(x && x.id);
    return {
      id: str(d.id) || str(id), project: str(d.project), act: isObj(d.act) ? d.act : {},
      findings: findings.filter(seen), standards: standards.filter(seen),
      withheld: d.out_of_view === true || !findings.every(seen) || !standards.every(seen),
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
    /* actions R9: the addressee's arm decides which blanks it holds: an office its role and body, a reporter, an
       organisation or another group its role and organisation, an audience its description. A blank its arm does not
       hold is left unfilled, saying which arm the addressee is. */
    const cp = action.counterparty;
    const arm = !cp ? null : cp.state === "named" ? (str(cp.kind) || "office") : str(cp.state);
    const cpWhy = !cp ? "the action states no counterparty" : cp.state === "undetermined"
      ? "the action's counterparty is undetermined" : "the action's counterparty names no such part";
    const notHeld = (part) => none(arm === "audience" ? `the action is addressed to an audience, which holds no ${part}`
      : arm === "office" ? `the action is addressed to an office, which holds no ${part}`
      : cp && cp.state === "named" ? `the action is addressed to a ${arm}, whose arm holds no ${part}` : cpWhy);
    const held = (v, part) => (str(v) ? { value: str(v), source: action.id } : none(`the action's addressee states no ${part}`));
    const named = cp && cp.state === "named";
    out.counterparty_role = named ? held(str(cp.role) || str(cp.name), "role") : arm === "audience" ? notHeld("role") : none(cpWhy);
    out.counterparty_body = arm === "office" ? held(cp.body, "body") : named || arm === "audience" ? notHeld("body") : none(cpWhy);
    out.counterparty_organisation = named && arm !== "office" ? held(cp.organisation, "organisation")
      : named || arm === "audience" ? notHeld("organisation") : none(cpWhy);
    out.counterparty_description = arm === "audience" ? held(cp.description, "description")
      : named ? notHeld("description") : none(cpWhy);
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
      /* R27: conformance states only that something was withheld (`det.withheld`), never which list it left, so neither
         list is given as though whole; the why names nothing of what was withheld. */
      const cut = "a finding or standard the determination rests on is not one you may see, so this list would not be whole";
      const cites = [], srcs = [];
      let withheld = false;
      for (const s of det.standards) {
        const r = this.#standard(s.id, viewer);
        if (!r || !str(r.cite)) { withheld = true; continue; }
        cites.push(str(r.cite)); srcs.push(s.id);
      }
      out.standards = withheld ? none("a standard the determination names is not one you may see")
        : det.withheld ? none(cut)
        : cites.length ? { value: cites.join("; "), source: srcs.join(", ") } : none("the determination names no standard");
      const fs = det.findings;
      out.findings = det.withheld ? none(cut)
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
    out.group = this.#group();
    out.date = { value: when.slice(0, 10), source: `clock:${when}` };
    return out;
  }

  /* R3's `group` (N331): promotion's fact `producingGroup` (its R40). While no provider answers (promotion's refusal,
     no promotion module reachable, or a reader that throws) the group is undetermined, never unrecorded; a provider
     answering no value says none is recorded. */
  #group() {
    const SOURCE = "fact:producingGroup";
    const read = this.producingGroup
      || (this.promotion && typeof this.promotion.fact === "function" ? () => this.promotion.fact("producingGroup") : null);
    if (!read) return { why: "no promotion module is reachable here to answer the fact producingGroup, so the producing group is undetermined" };
    let g;
    try { g = read(); }
    catch { return { why: "the producing group could not be read (its reader failed), so it is undetermined" }; }
    if (isObj(g) && "ok" in g) {
      if (g.ok !== true)
        return { why: `no module answers the fact producingGroup (${g.reason === "FACT_FAILED" ? "its provider failed"
          : "no provider is registered"}), so the producing group is undetermined` };
      g = g.value;
    }
    const v = str(g);
    return v ? { value: v, source: SOURCE } : { why: "no producing group is recorded for this instance" };
  }

  /* R1, R8, R23: the one answer for an action that is resolved or abandoned: nothing is prepared for it. */
  #closed(a) {
    /* DEC-49 REGION is-action-closed */
    if (CLOSED.includes(a.current_state))
      return { ok: false, reason: "ACTION_CLOSED", action: a.id, state: a.current_state,
               detail: `the action is ${a.current_state}; nothing is prepared for a closed action` };
    /* END DEC-49 REGION is-action-closed */
    return null;
  }

  /* R3, R31: `text`'s blanks filled from the record, each naming its source, or left as a visible marker listed with
     why. A name outside `FILING_BLANKS` (a profile's text `filing-templates` would not offer) is left unfilled too. */
  #fill(text, values) {
    const names = blanksOf(text).blanks;
    const blanks = [], unfilled = [];
    for (const n of names) {
      const val = Object.prototype.hasOwnProperty.call(FILING_BLANKS, n) ? values[n]
        : { why: "filings fills no blank by this name, so the record holds no value for it" };
      if (val && "value" in val) blanks.push({ name: n, value: val.value, source: val.source });
      else unfilled.push({ name: n, why: val.why });
    }
    const filled = new Map(blanks.map((b) => [b.name, b.value]));
    return { text: text.replace(BLANK_RE, (_, n) => (filled.has(n) ? filled.get(n) : unfilledMarker(n))), blanks, unfilled };
  }

  /* The module that holds the group's templates (`filing-templates`), on the same host unless given; null with none. */
  get filingTemplates() { return this.#deps.filingTemplates ||= (this.#deps.host ? filingTemplatesOf(this.#deps.host) : null); }

  /* R28, R31: the version of a named template a filing or briefing may use (`filing-templates.offeredVersion`, its R25),
     its refusals passed through as that module's; `asked` is `{id, version?}` or a bare id. */
  #offered(asked, viewer) {
    const t = this.filingTemplates;
    const id = isObj(asked) ? str(asked.id) : str(asked);
    const version = isObj(asked) && asked.version != null && asked.version !== "" ? asked.version : null;
    if (!t || typeof t.offeredVersion !== "function")
      return templatesRow({ ok: false, reason: "NO_SUCH_TEMPLATE", template: id,
                            detail: "no module answers the group's templates here, so none is readable" });
    return t.offeredVersion({ template: id, version, viewer });
  }

  /* R28, R31: a template of another kind than the action's. */
  static #kindMismatch(v, a) {
    /* DEC-49 REGION is-template-kind-mismatch */
    if (v.kind && v.kind !== a.kind)
      return { ok: false, reason: "TEMPLATE_KIND_MISMATCH", template: v.template, template_kind: v.kind, kind: a.kind,
               detail: `the template is written for ${v.kind}, and this action is ${a.kind}` };
    /* END DEC-49 REGION is-template-kind-mismatch */
    return null;
  }

  /* R6, R28: a text that is empty, over `FILING_TEXT_MAX` or not UTF-8 text. */
  static #unwritable(body, extra = {}) {
    /* DEC-49 REGION is-text-unwritable */
    if (typeof body !== "string" || !body.trim() || WELL_FORMED.test(body) || utf8(body) > FILING_TEXT_MAX)
      return { ok: false, reason: "TEXT_UNWRITABLE", ...extra, max_bytes: FILING_TEXT_MAX,
               detail: `the text must be non-empty UTF-8 text of at most ${FILING_TEXT_MAX} bytes` };
    /* END DEC-49 REGION is-text-unwritable */
    return null;
  }

  /* R29: what a draft or packet records of the template it was filled from: `{id, version, sha, origin}`. */
  static #templateOf(v) { return { id: v.template, version: v.number, sha: v.sha, origin: v.origin }; }

  /* R29: the statement a draft or packet carries first (after any advisory) when its template names profiles none of
     which gave the action's kind (its `profile` tag, jurisdictions R13); null for a `general` template or one written
     for the kind's profile. */
  static #notWrittenFor(v, entry) {
    if (!Array.isArray(v.profiles)) return null;
    const givers = entry ? [entry.profile, ...(Array.isArray(entry.bases) ? entry.bases.map((b) => b.profile) : [])].filter(Boolean) : [];
    if (givers.some((p) => v.profiles.includes(p))) return null;
    return givers.length
      ? `This template was not written for ${givers[0]}, the jurisdiction this action's kind comes from: it was written for ${v.profiles.join(", ")}.`
      : `This template was not written for this action's jurisdiction (no active profile gives its kind): it was written for ${v.profiles.join(", ")}.`;
  }

  /** R1–R5, R24, R25, R28, R29: a draft pre-filled from the record into an offered version of a template the preparer
   *  names (`filing-templates`, the latest approved by default), into the member's own words (`text`), or, naming
   *  neither, into the latest approved version of the profile's `file` template for the action's kind. */
  filingPrepare({ action = null, template = null, text = undefined, preparer = null, viewer = null } = {}) {
    const who = str(preparer);
    /* DEC-49 REGION is-filing-prepare */
    if (!who) return { ok: false, reason: "FILING_NO_PREPARER", detail: "no stamped preparer: a draft names who prepared it" };
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    const closed = this.#closed(a);
    if (closed) return closed;
    const v = this.#view();
    const gov = this.governingTier(a, v);
    if (gov.tier === "undetermined")
      return { ok: false, reason: "FILING_TIER_UNDETERMINED", action: a.id, governing: gov,
               detail: "the action's risk tier is undetermined and is never read as 1: a member states it first (op=actionrisktier)" };
    if (gov.tier === 3)
      return { ok: false, reason: "TIER3_COUNSEL_PACKET", action: a.id, governing: gov,
               detail: "the governing tier is 3: no filing is prepared; a member names counsel and assembles a counsel packet" };
    const named = isObj(template) ? !!str(template.id) || Object.keys(template).length > 0 : template != null && template !== "";
    const own = text !== undefined && text !== null;
    if (named && own)
      return { ok: false, reason: "TEMPLATE_AND_TEXT", action: a.id,
               detail: "name a template or write the words, not both" };
    /* END DEC-49 REGION is-filing-prepare */
    const entry = v.view && Array.isArray(v.view.action_kinds) ? v.view.action_kinds.find((k) => k.kind === a.kind) || null : null;
    let used = null;
    if (own) {
      const bad = Filings.#unwritable(text, { action: a.id });
      if (bad) return bad;
      const { unknown } = blanksOf(text);
      if (unknown) return templatesRow({ ok: false, reason: "TEMPLATE_BLANK_UNKNOWN", blank: unknown, blanks: Object.keys(FILING_BLANKS),
                                         detail: `{{${unknown}}} is not a blank filings fill` });
    } else {
      const profileTpl = entry && isObj(entry.template) && entry.template.use === "file" && str(entry.template.id) ? entry.template : null;
      if (!named && !profileTpl) {
        const t = this.filingTemplates;
        const list = t && typeof t.templatesFor === "function" ? this.#call(() => t.templatesFor({ kind: a.kind, use: "file", viewer })) : null;
        const offered = list && list.ok ? list.templates.slice(0, TEMPLATES_NAMED_MAX).map((x) => {
          const d = (x.versions || []).find((y) => y.default) || (x.versions || [])[0] || {};
          return { template: x.id, name: x.name, origin: x.origin, profiles: x.profiles, version: d.version ?? null };
        }) : [];
        const conflicted = v.conflicts.some((c) => c.at === `action_kinds[${a.kind}].template`);
        /* DEC-49 REGION is-template-not-named */
        return { ok: false, reason: "TEMPLATE_NOT_NAMED", action: a.id, kind: a.kind, templates: offered,
                 ...(list && list.ok && list.templates.length > TEMPLATES_NAMED_MAX ? { truncated: true } : {}),
                 detail: `${conflicted ? "the active profiles give different templates for this kind, so none is given"
                   : !v.view ? v.why : "the profile holds no file template for this kind"}: name a template${offered.length
                   ? " (the offered ones are listed)" : ""} or write the words` };
        /* END DEC-49 REGION is-template-not-named */
      }
      used = this.#offered(named ? template : { id: profileTpl.id }, viewer);
      if (!used || used.ok === false) return used;
      /* DEC-49 REGION is-template-use-brief */
      if (used.use === "brief")
        return { ok: false, reason: "TEMPLATE_USE_BRIEF", template: used.template, version: used.version,
                 detail: "this template is a briefing to counsel: it serves a counsel packet (op=counselpacket), never a filing" };
      /* END DEC-49 REGION is-template-use-brief */
      const mismatch = Filings.#kindMismatch(used, a);
      if (mismatch) return mismatch;
    }
    const when = this.#when();
    const { det, hidden } = this.#restsOn(a, viewer);
    const values = this.#values(a, det, hidden, entry, viewer, when);
    const filled = this.#fill(own ? text : used.text, values);
    const { blanks, unfilled } = filled;
    let body = filled.text;
    /* R29: a template not written for the kind's jurisdiction says so first, after any advisory */
    const notFor = used ? Filings.#notWrittenFor(used, entry) : null;
    if (notFor) body = `${notFor}\n\n${body}`;
    let advisory = null;
    if (gov.tier === 2) {
      advisory = entry ? str(entry.advisory) : null;
      if (advisory) body = `${advisory}\n\n${body}`;
      else {
        body = `${unfilledMarker("advisory")}\n\n${body}`;
        unfilled.unshift({ name: "advisory", why: "the profile gives no advisory note for this kind (or its profiles "
          + "disagree), so it is undetermined; a member writes one in before the draft can be approved" });
      }
    }
    /* R24: the override's disclosure, first on the face. */
    const disclosure = a.premise_override ? overrideDisclosure(a.premise_override) : null;
    if (disclosure) body = `${disclosure}\n\n${body}`;
    const venue = entry && isObj(entry.venue) ? { name: entry.venue.name ?? null, how: entry.venue.how ?? null,
                                                  source: `profile:${entry.venue.profile || entry.profile}/action_kinds/${entry.kind}/venue` }
      : { state: "undetermined", why: "the profile gives this kind no venue" };
    /* R25: the exhibits the draft rests on, each with its grade and co-attestation, read against the venue's standard. */
    const standard = this.#venueStandard(v, a.kind);
    const facts = det ? det.findings.map((f) => this.#fact(f)) : [];
    const exhibits = this.#exhibits(this.#citesOf(a, det, facts), standard);
    const basis = this.#basisOf(a, det, gov);
    /* R29: the template and version, or null for the member's own words */
    const tpl = used ? Filings.#templateOf(used) : null;
    const year = when.slice(0, 4);
    return this.record.transact(() => {
      const { id } = this.record.allocId("FIL", year);
      this.sql.exec(`INSERT INTO filing_drafts (filing_id, action_id, kind, tier, governing, text, blanks, unfilled,
                       advisory, venue, preparer, prepared_at, basis, exhibits, venue_standard, disclosure, template)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id, a.id, a.kind, gov.tier, json(gov), body, json(blanks), json(unfilled), advisory, json(venue), who, when, json(basis),
        json(exhibits), json(standard), disclosure, json(tpl));
      return { ok: true, id, action: a.id, tier: gov.tier, governing: gov, text: body, blanks, unfilled,
               ...(gov.tier === 2 ? { advisory } : {}), venue, template: tpl,
               ...(used ? { template_version: { name: used.name, state: used.state, profiles: used.profiles,
                                                  ...(used.default ? { default: true } : {}),
                                                  ...(used.updated_by ? { updated_by: used.updated_by,
                                                    says: `version ${used.number} is updated by ${used.updated_by}` } : {}) } } : {}),
               ...(notFor ? { not_written_for: notFor } : {}), disclosure,
               exhibits, venue_standard: standard, label: proposalLabel(who, "filing_draft"),
               prepared_by: who, at: when, evidence: false, says: DRAFT_SAYS };
    });
  }

  /* ---------------------------------------------------------------- R23: communicationPrepare */

  /** R23, R24: a draft message, briefing or statement for an action whose addressee is anyone, from no template: the
   *  words are the preparer's (a machine's from the published case and the plan). Stored apart, labelled as R5's
   *  drafts are; R6's approval and R7's sending apply to it unchanged. */
  communicationPrepare({ action = null, text = null, purpose = null, preparer = null, viewer = null } = {}) {
    const who = str(preparer);
    /* DEC-49 REGION is-communication-prepare */
    if (!who) return { ok: false, reason: "COMMUNICATION_NO_PREPARER", detail: "no stamped preparer: a draft names who prepared it" };
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    const closed = this.#closed(a);
    if (closed) return closed;
    if (typeof text !== "string" || !text.trim() || WELL_FORMED.test(text) || utf8(text) > FILING_TEXT_MAX)
      return { ok: false, reason: "COMMUNICATION_TEXT_REFUSED", max_bytes: FILING_TEXT_MAX,
               detail: `the communication's words must be non-empty UTF-8 text of at most ${FILING_TEXT_MAX} bytes` };
    const why = typeof purpose === "string" ? purpose.trim() : "";
    if (!why || why.length > COMMUNICATION_PURPOSE_MAX || WELL_FORMED.test(why))
      return { ok: false, reason: "COMMUNICATION_PURPOSE_REFUSED", max: COMMUNICATION_PURPOSE_MAX,
               detail: `say what the communication is for, in at most ${COMMUNICATION_PURPOSE_MAX} characters` };
    /* END DEC-49 REGION is-communication-prepare */
    const when = this.#when();
    const { det } = this.#restsOn(a, viewer);
    const basis = this.#basisOf(a, det, this.governingTier(a));
    const disclosure = a.premise_override ? overrideDisclosure(a.premise_override) : null;
    const body = disclosure ? `${disclosure}\n\n${text}` : text;
    return this.record.transact(() => {
      const { id } = this.record.allocId("FIL", when.slice(0, 4));
      this.sql.exec(`INSERT INTO communication_drafts (filing_id, action_id, text, purpose, disclosure, preparer, prepared_at, basis)
                     VALUES (?,?,?,?,?,?,?,?)`, id, a.id, body, why, disclosure, who, when, json(basis));
      return { ok: true, id, action: a.id, form: "communication", text: body, purpose: why, disclosure,
               addressee: a.counterparty ?? null, label: proposalLabel(who, "communication"), prepared_by: who, at: when,
               evidence: false, says: "a draft communication: nobody has approved or sent it, and nothing is sent until a "
                 + "member approves it and sends it by their own hand" };
    });
  }

  /* R6: what a draft read, so its staleness is stated by name. */
  #basisOf(a, det, gov) {
    return { tier: gov.tier, counterparty: a.counterparty ?? null, determination: det ? det.id : null,
             project: det ? det.project : null,
             governing_laws: a.governing_laws && a.governing_laws.state === "stated" ? a.governing_laws.laws ?? [] : null,
             ...(a.premise_override ? { premise_override: a.premise_override } : {}) };
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

  /* A draft the viewer may see (through its action and the project it draws on), or null (R6, R7, R19; K316). A
     communication (R23) is a draft of the same id space, `form` telling them apart. */
  #draft(id, viewer) {
    const f = str(id);
    const filing = f ? this.#one(`SELECT * FROM filing_drafts WHERE filing_id=?`, f) : null;
    const d = filing ? { ...filing, form: "filing" }
      : f ? (((c) => (c ? { ...c, form: "communication" } : null))(this.#one(`SELECT * FROM communication_drafts WHERE filing_id=?`, f)))
      : null;
    return d && this.#action(d.action_id, viewer) && this.#sees(parse(d.basis), viewer) ? d : null;
  }

  /* R6: a draft is approved at most once; asked before the approval and again as it is written, since computing the
     in-band quartet yields (R22). */
  #alreadyApproved(id) {
    const held = this.#one(`SELECT approved_by, at FROM filing_approvals WHERE filing_id=?`, id);
    /* DEC-49 REGION is-already-approved */
    if (held) return { ok: false, reason: "ALREADY_APPROVED", filing: id, approved_by: held.approved_by, at: held.at,
                       detail: "a draft is approved at most once; prepare a new draft to approve another text" };
    /* END DEC-49 REGION is-already-approved */
    return null;
  }

  /* ---------------------------------------------------------------- R6: filingApprove */

  /** R6, R22, R24: a member approves the draft's text or an edited text, at most once; the approved text is the
   *  member's. The approved bytes carry R24's disclosure first where the draft did, and the in-band quartet (R22). */
  async filingApprove({ filing = null, text = undefined, author = null, viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-filing-approve */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_APPROVE",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: a machine prepares, and a member approves`
                           : "no member is named as the one approving" };
    const d = this.#draft(filing, viewer);
    if (!d) return this.#noFiling(filing);
    const held = this.#alreadyApproved(d.filing_id);
    if (held) return held;
    const changed = this.#staleness(d);
    if (changed.length)
      return { ok: false, reason: "FILING_STALE", filing: d.filing_id, changed,
               detail: `since the draft was prepared: ${changed.join("; ")} changed. Prepare it again.` };
    const body = text === undefined || text === null ? d.text : text;
    if (typeof body === "string" && UNFILLED_RE.test(body))
      return { ok: false, reason: "STILL_UNFILLED", filing: d.filing_id, unfilled: [...body.matchAll(/\[UNFILLED: ([^\]\n]*)\]/g)].map((m) => m[1]),
               detail: "the text still holds a blank the record could not fill; a member writes it in first" };
    const unwritable = Filings.#unwritable(body, { filing: d.filing_id });
    if (unwritable) return unwritable;
    /* END DEC-49 REGION is-filing-approve */
    const at = this.#when();
    const sha = sha256HexSync(body);
    const face = d.disclosure && !body.startsWith(d.disclosure) ? `${d.disclosure}\n\n${body}` : body;
    const { bytes, inband } = await this.#stamped(face, {
      what: `the approved ${d.form === "communication" ? "communication" : "filing"} ${d.filing_id}`, date: at, author: who,
      project: (parse(d.basis) || {}).project ?? null });
    const again = this.#alreadyApproved(d.filing_id);
    if (again) return again;
    this.sql.exec(`INSERT INTO filing_approvals (filing_id, action_id, text, sha, approved_by, at, inband) VALUES (?,?,?,?,?,?,?)`,
                  d.filing_id, d.action_id, body, sha, who, at, json(inband));
    return { ok: true, filing: d.filing_id, action: d.action_id, form: d.form, approved_by: who, at, sha, edited: body !== d.text,
             bytes, inband, disclosure: d.disclosure ?? null,
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
    if (!d) return this.#noFiling(filing);
    if (!this.#one(`SELECT 1 AS x FROM filing_approvals WHERE filing_id=?`, d.filing_id))
      return { ok: false, reason: "NOT_APPROVED", filing: d.filing_id, detail: "a member approves the draft before it is recorded as sent" };
    const sent = this.#one(`SELECT ord, sent_on, recorded_by FROM filing_sendings WHERE filing_id=?`, d.filing_id);
    if (sent) return { ok: false, reason: "ALREADY_SENT", filing: d.filing_id, ord: sent.ord, at: sent.sent_on,
                       recorded_by: sent.recorded_by, detail: "this draft is already recorded as sent" };
    /* END DEC-49 REGION is-filing-sent */
    if (!this.actions || typeof this.actions.actionCorrespond !== "function")
      return this.#noAction(d.action_id);
    const now = this.#when();
    const out = this.record.transact(() => {
      const c = this.actions.actionCorrespond({ target: d.action_id, direction: "sent", at,
        ...(medium != null ? { medium } : {}), ...(artifactSha != null ? { artifactSha } : {}),
        ...(account != null ? { account } : {}), viewer, author: who });
      if (!c || c.ok === false) return c || this.#noAction(d.action_id);
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

  /* R7: the next state a member may choose, and the clock entries action-clocks offers for the kind's deadlines that
     start at filing or receipt (its R2, moved from actions R32 by K617), each stored apart there, none written into the
     clock. */
  #proposed(d, who, viewer) {
    const a = this.#action(d.action_id, viewer);
    const state = a ? a.current_state : null;
    const next = state === "planned" ? "active" : state === "active" ? "awaiting_response" : null;
    const v = this.#view();
    const rules = v.view && Array.isArray(v.view.deadlines)
      ? v.view.deadlines.filter((r) => a && r.applies_to === a.kind && (r.starts === "filed" || r.starts === "received")) : [];
    const clocks = rules.map((r) => {
      const c = this.actionClocks;
      const p = c && typeof c.clockPropose === "function"
        ? this.#call(() => c.clockPropose({ target: d.action_id, rule: r.rule, proposer: who, viewer })) : null;
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

  /* R9's facts: the finding at its pinned bytes (record-core R60): its question, its conclusion and its citations. Only
     a finding `#det` kept is asked (R27: one withheld is no item). */
  #fact(f) {
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

  /* R9, R25: the captures a draft or packet rests on: each a fact's citation cites, each piece of evidence the act
     names, and each artifact the action's correspondence holds, with the source that cites it. */
  #citesOf(a, det, facts) {
    const cites = [];
    for (const f of facts) for (const c of f.citations || []) cites.push({ content_id: c.content_id, target: c.content_id ? null : c.target, source: f.source });
    const act = det ? det.act || {} : {};
    for (const cid of Array.isArray(act.evidence) ? act.evidence : []) cites.push({ content_id: str(cid), source: det.id });
    for (const [i, e] of a.correspondence.entries())
      if (str(e.artifact_sha)) cites.push({ capture_sha: str(e.artifact_sha), source: `${a.id}#${Number.isInteger(e.ord) ? e.ord : i}` });
    return cites;
  }

  /* R9's exhibits: each capture a fact or event cites, with its digest, locator, capture time and attestations; R25:
     its capture grade (provenance's `captureGrade`), whether it is co-attested, and how it reads against `standard`,
     the venue's (`#venueStandard`). */
  #exhibits(cites, standard) {
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
      const attestations = this.#attestations(sha);
      const grade = this.#grade(sha);
      const co = Filings.#coattested(attestations);
      return { sha256: sha, cited_by: [...new Set(from)].sort(),
               locator: loc ? (loc.retrieval_locator || loc.address)
                 : reg ? `${reg.bundle_id}/${reg.path}` : null,
               ...(loc || reg ? {} : { locator_why: "the record holds no address or register row for this capture" }),
               captured_at: loc ? loc.first_retrieved : reg ? reg.registered : null,
               home: reg ? reg.bundle_id : null,
               attestations, grade, ...co, venue: Filings.#venueReading(grade, co.coattested, standard) };
    });
  }

  /* R9: every attestation the record holds for one capture, as `attestation.attestationsOf` answers it (its R7), never
     read from the bundle document here; undetermined, with why, when no module answers it or its read fails. */
  #attestations(sha) {
    const a = this.attestation;
    if (!a || typeof a.attestationsOf !== "function")
      return { items: [], undetermined: "no module answers a capture's attestations here, so they are undetermined" };
    const att = this.#call(() => a.attestationsOf(sha));
    return att && att.ok ? { items: att.attestations, ...(att.undetermined ? { undetermined: att.undetermined } : {}), note: att.note }
      : { items: [], undetermined: "the attestations could not be read" };
  }

  /* R25: the capture axis for one capture, as provenance answers it (its R24–R27, R51), never computed here. */
  #grade(sha) {
    const g = this.provenance && typeof this.provenance.captureGrade === "function" ? this.#call(() => this.provenance.captureGrade(sha)) : null;
    if (!isObj(g)) return { grade: null, determined: false, why: "the capture grade could not be read, so it is undetermined" };
    return { grade: g.grade ?? null, route: g.route ?? null, determined: g.determined === true, basis: g.basis ?? null,
             ...(g.why ? { why: g.why } : {}) };
  }

  /* R25 (`jurisdictions` R39): a capture is co-attested when the record holds both its trusted timestamp (an RFC 3161
     token, or the daemon era's `timestamp`) and its co-archive; undetermined when its attestations cannot be read. */
  static #coattested(att) {
    if (att.undetermined) return { coattested: null, coattested_why: `whether it is co-attested is undetermined: ${att.undetermined}` };
    const kinds = new Set(att.items.map((x) => x && x.kind));
    const stamp = kinds.has("rfc3161") || kinds.has("timestamp"), archive = kinds.has("co_archive");
    return { coattested: stamp && archive,
             ...(stamp && archive ? {} : { coattested_why: `the record holds ${stamp ? "a trusted timestamp but no co-archive"
               : archive ? "a co-archive but no trusted timestamp" : "neither a trusted timestamp nor a co-archive"} for it` }) };
  }

  /* R25: the venue's standard of evidence for a kind (`jurisdictions` R39), or undetermined with why. */
  #venueStandard(v, kind) {
    const none = (why) => ({ state: "undetermined", why: `${why}, so the venue's standard is undetermined and the grades are shown alone` });
    if (!v.view) return none(v.why);
    if (v.conflicts.some((c) => c.at === `action_kinds[${kind}].evidence`)) return none("the active profiles give different evidence standards for this kind");
    const entry = Array.isArray(v.view.action_kinds) ? v.view.action_kinds.find((k) => k.kind === kind) : null;
    if (!entry || !isObj(entry.evidence)) return none("the profile states no standard of evidence for this kind's venue");
    const ev = entry.evidence;
    const list = (l) => (Array.isArray(l) ? l.filter(isObj).map((x) => ({ grade: x.grade, ...(x.coattested ? { coattested: true } : {}) })) : []);
    return { state: "stated", standard: ev.standard, accepts: list(ev.accepts), contestable: list(ev.contestable),
             source: `profile:${ev.profile || entry.profile}/action_kinds/${kind}/evidence` };
  }

  /* R25: how one exhibit reads against the venue's standard. Never a refusal: `flagged` marks an exhibit below every
     grade the venue accepts, or at a grade the profile marks contestable, so counsel and members can prepare. */
  static #venueReading(grade, coattested, standard) {
    if (standard.state !== "stated") return { state: "undetermined", flagged: false, why: standard.why };
    const letter = grade.grade;
    if (!BASIS_GRADES.includes(letter))
      return { state: "undetermined", flagged: false,
               why: "the exhibit's capture grade is not measured, so it is not read against the venue's standard" };
    const rank = (g) => BASIS_GRADES.indexOf(g);
    const co = (e) => (!e.coattested ? true : coattested === true ? true : coattested === null ? null : false);
    const contest = standard.contestable.find((e) => e.grade === letter && co(e) === true);
    if (contest) return { state: "contestable", flagged: true, at: contest,
                          says: `the venue admits grade ${letter}, and the profile marks it contestable: the opposition may contest it` };
    const fits = standard.accepts.filter((e) => BASIS_GRADES.includes(e.grade) && rank(letter) <= rank(e.grade));
    if (fits.some((e) => co(e) === true)) return { state: "accepted", flagged: false, says: "within the grades the venue accepts" };
    if (fits.some((e) => co(e) === null))
      return { state: "undetermined", flagged: false,
               why: "the venue accepts this grade only co-attested, and whether the exhibit is co-attested is undetermined" };
    return { state: "below", flagged: true,
             says: fits.length ? "the venue accepts this grade only co-attested, and the exhibit is not co-attested"
                               : "below every grade the venue accepts" };
  }

  /* R9's deadlines: every claim deadline of the view, its date from a recorded start event only. */
  #deadlines(v, a, det, viewer) {
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
      /* R30: counted as action-clocks R10 counts, on the entries for the action's office, each read through local-facts
         by action-clocks' own reader (its R12), this module holding no copy (N474) */
      const date = deadlineDate({ start: start.date ?? null, days: r.days, count: r.count, view: v.view,
                                  counterparty: a.counterparty, kind: a.kind, factOf: factReader(this.localFacts, viewer) });
      return { rule: r.rule, days: r.days ?? null, count: r.count ?? null, starts: r.starts ?? null,
               ...(r.extension ? { extension: r.extension } : {}), citation: r.citation ?? null,
               basis: r.basis ?? null, profile: r.profile ?? null, source: `profile:${r.profile}/deadlines/${r.rule}`,
               start, date: date.state === "determined" ? { ...date, start_source: start.source } : date };
    });
  }

  /* R9: the six sections and the consequences, each item naming its source. R8, R24: for an action resting on a
     premise override and no live determination, `det` is null: the facts section says in words that no determination
     is held, and nothing is drawn from one. R25: each exhibit read against the venue's standard. */
  #assemble(a, det, viewer, marking) {
    const v = this.#view();
    const section = (title, items, extra = {}) => ({ title, marking, items, ...extra });
    const facts = det ? det.findings.map((f) => this.#fact(f)) : [];
    const events = [], undated = [];
    const act = det ? det.act || {} : {};
    const actDay = realDate(act.at) || (isObj(act.period) ? realDate(act.period.from) : null);
    const push = (day, e) => (day ? events.push({ day, ...e }) : undated.push({ ...e, why: "the record states no date for it" }));
    if (det)
      push(actDay, { event: `the act: ${str(act.description) || "undescribed"}`, source: det.id,
                     ...(isObj(act.actor) ? { actor: { role: act.actor.role ?? null, body: act.actor.body ?? null } } : {}) });
    for (const f of facts) {
      const r = f.case != null ? this.#one(`SELECT ratified_at FROM published_cases WHERE case_id=? AND edition=?`, f.case, Number(f.edition)) : null;
      push(r ? realDate(String(r.ratified_at).slice(0, 10)) : null,
           { event: `${f.finding} published in case ${f.case} edition ${f.edition}`, source: f.source });
    }
    if (a.state_history === null)
      undated.push({ event: "the action's state history", source: a.id, why: "the action's read does not answer its state history" });
    /* actions R29 (K253): each move `{state, at, by}`, in order. */
    for (const [i, h] of (a.state_history || []).entries())
      push(realDate(String(h.at ?? "").slice(0, 10)), { event: `the action entered ${h.state ?? h.to ?? "an undetermined state"}`,
                                                        ...(h.by ? { by: h.by } : {}), source: `${a.id}/state_history[${i}]` });
    for (const [i, e] of a.correspondence.entries()) {
      const ord = Number.isInteger(e.ord) ? e.ord : i;
      push(realDate(String(e.at ?? "").slice(0, 10)), { event: `correspondence ${e.direction ?? "undetermined"}${str(e.party) ? ` (${e.party})` : ""}`,
                                                        source: `${a.id}#${ord}` });
    }
    for (const [i, c] of a.clock.entries())
      push(realDate(c.date), { event: `clock: ${str(c.text) || str(c.description) || "a deadline"} (${c.status ?? "undetermined"})`,
                               basis: c.basis ?? null, source: `${a.id}/clock[${i}]` });
    events.sort(byDayThenSource);
    const standard = this.#venueStandard(v, a.kind);
    /* R27 (DEC-36): a standard conformance withheld, or one standards' read refuses here, is no item; the section
       states only that something was withheld. */
    let refused = false;
    const standards = (det ? det.standards : []).flatMap((s) => {
      const r = this.#standard(s.id, viewer);
      if (!r) { refused = true; return []; }
      return [{ standard: s.id, cite: r.cite ?? null, kind: r.kind ?? null, issuer: r.issuer ?? null,
                text: Array.isArray(r.text) ? r.text : [], outcome: s.outcome ?? null,
                in_force: this.#inForce(s.id, realDate(act.at)), source: s.id }];
    });
    const unseen = { out_of_view: true };
    const theories = this.#rows(`SELECT * FROM theory_proposals WHERE action_id=? ORDER BY theory_id`, a.id).map((t) => ({
      theory_id: t.theory_id, candidate: true, theory: t.theory, remedy: t.remedy, standards: parse(t.standards) || [],
      why: t.why, label: proposalLabel(t.proposer, "theory"), at: t.at, source: t.theory_id }));
    const cons = det && this.consequences && typeof this.consequences.consequencesOf === "function"
      ? this.#call(() => this.consequences.consequencesOf({ determination: det.id, viewer })) : null;
    return {
      facts: section("Facts", facts, det ? (det.withheld ? unseen : {}) : { says: "no determination is held: the action rests "
        + "on a premise a member overrode, so no finding is set out as a fact" }),
      chronology: section("Chronology", events.map(({ day, ...e }) => ({ date: day, ...e })),
                          { undated, order: "by date; events on the same day by source id" }),
      exhibits: section("Exhibits", this.#exhibits(this.#citesOf(a, det, facts), standard), {
        venue_standard: standard,
        says: standard.state === "stated" ? "each exhibit's capture grade and co-attestation, beside the venue's standard; "
          + "an exhibit below it, or at a grade the profile marks contestable, is flagged, and nothing is refused for its grade"
          : "each exhibit's capture grade and co-attestation, shown alone: the venue's standard is undetermined" }),
      standards: section("Standards", standards, det ? (det.withheld || refused ? unseen : {})
        : { says: "no determination is held, so no standard is set out" }),
      theories: section("Candidate theories and remedies", theories,
        { says: theories.length ? "each is a candidate for counsel to weigh, never the group's position or a conclusion"
                                : "no candidate theory or remedy has been proposed for this action" }),
      deadlines: section("Deadlines", this.#deadlines(v, a, det, viewer),
        { says: v.view ? `each date is computed only from a recorded start event (${COUNTED_FROM}), else undetermined with why`
                       : `${v.why}, so no claim deadline is known` }),
      consequences: section("Consequences of the breach",
        cons && cons.ok !== false ? [{ recorded: cons, source: det.id }] : [],
        { says: !det ? "no determination is held, so no breach consequence is recorded against one"
            : cons && cons.ok !== false ? "as recorded, each part in its own state; nothing summed across states"
            : "the consequences could not be read, so they are undetermined" }),
    };
  }

  /* R12: what a version drew on. */
  #packetBasis(det, a) {
    const over = a.premise_override ? { premise_override: a.premise_override } : {};
    if (!det) return { determination: null, project: null, findings: [], standards: [], ...over };
    return { determination: det.id, project: det.project,
             findings: det.findings.map((f) => ({ id: f.id, case: f.case ?? null, edition: f.edition ?? null })),
             standards: det.standards.map((s) => s.id), ...over };
  }

  /** R12: each cause a version's basis changed since it was assembled, read now; nothing in the version changes. Asked
   *  only for a version `viewer` may see (R11, R13). R27 (DEC-36): whether the determination was superseded is read as
   *  the plane reads it, so a superseded one is named, and its successor only when `viewer` may read it; its flag's
   *  causes are the ones conformance answers `viewer` (its R24), never read as the machine; a superseding standard
   *  `viewer` may not see is left out of its cause, which states `out_of_view: true`. */
  #basisChanged(basis, viewer) {
    const causes = [];
    const d = basis.determination ? this.#det(basis.determination, MACHINE_READER) : null;
    if (!basis.determination) { /* R8: an overridden premise drew on no determination, so none can change */ }
    else if (!d || !d.live) {
      const by = d && d.superseded_by;
      causes.push({ cause: "determination_superseded", determination: basis.determination,
                    ...(!by ? {} : this.#det(by, viewer) ? { by } : { out_of_view: true }) });
    } else {
      const seen = this.#det(basis.determination, viewer);
      if (seen && seen.basis_changed)
        causes.push({ cause: "determination_flagged", determination: basis.determination, causes: seen.basis_changed.causes ?? [] });
    }
    for (const f of basis.findings || []) {
      const e = this.#call(() => this.publication.publishedEditionsOf({ finding: f.id, project: basis.project || null }));
      const later = e && e.ok ? e.items.filter((i) => i.case === f.case && Number(i.edition) > Number(f.edition)) : [];
      if (later.length) causes.push({ cause: "finding_later_edition", finding: f.id, case: f.case, edition: f.edition,
                                      later: Math.max(...later.map((i) => Number(i.edition))) });
    }
    for (const s of basis.standards || []) {
      const r = this.#standard(s, MACHINE_READER);
      const by = r && str(r.superseded_by);
      if (by) causes.push({ cause: "standard_superseded", standard: s, ...(this.#inSight(by, viewer) ? { by } : { out_of_view: true }) });
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

  /** R8–R10, R12, R31: a counsel packet, for the counsel a member names or (below Tier 3) for the group's own review,
   *  with a `briefing` section filled from a `brief` template when one is named; assembling again makes a new version.
   *  `reason` is the author's words on why it is assembled, recorded with the version (DEC-88). */
  counselPacket({ action = null, counsel = null, template = null, reason = undefined, author = null, viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-counsel-packet */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_NAME_COUNSEL",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: the group names its counsel`
                           : "no member is named as the one naming counsel" };
    /* R8 (DEC-88, C-115.44): the author's words on why, kept as written. Blank is empty after trim; the bound counts
       code points, as publication's attribution reason does (K1030). Asked before the action, so nothing is read or
       written for a packet with no reason. */
    const why = typeof reason === "string" ? reason : null;
    const chars = why == null ? 0 : [...why].length;
    if (why == null || !why.trim() || chars > PACKET_REASON_MAX)
      return { ok: false, reason: "PACKET_NO_REASON", max: PACKET_REASON_MAX,
               detail: why == null
                 ? (reason === undefined || reason === null ? "say in your own words why this packet is assembled (reason)"
                   : `the reason must be your words, as text; a ${typeof reason} was sent`)
                 : !why.trim() ? "the reason is blank: say in your own words why this packet is assembled"
                 : `the reason is ${chars} characters, over the ${PACKET_REASON_MAX} a packet's reason is kept to; refused rather than cut` };
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    /* R8 (K924): a packet at every governing tier; counsel is required at Tier 3 or an undetermined tier (never read as
       1, D-182), optional below it, and one given is named by both a name and an organisation. */
    const gov = this.governingTier(a);
    const needed = gov.tier === 3 || gov.tier === "undetermined";
    const c = counsel == null && !needed ? null : this.#counsel(counsel);
    if (counsel == null ? needed : !c)
      return { ok: false, reason: "NO_COUNSEL", max: COUNSEL_FIELD_MAX, action: a.id, governing: gov,
               detail: `${needed ? `at a governing tier of ${gov.tier === 3 ? "3" : "undetermined"} counsel is named` : "counsel, when named,"} `
                     + `by a name and an organisation (contact optional), each one line of at most ${COUNSEL_FIELD_MAX} characters` };
    /* END DEC-49 REGION is-counsel-packet */
    /* R31: a `brief` template, its version and refusals as R28's */
    let used = null;
    if (template != null && template !== "") {
      used = this.#offered(template, viewer);
      if (!used || used.ok === false) return used;
      /* DEC-49 REGION is-template-use-file */
      if (used.use !== "brief")
        return { ok: false, reason: "TEMPLATE_USE_FILE", template: used.template, version: used.version,
                 detail: "this template is wording the group files in its own name: a briefing takes a brief template" };
      /* END DEC-49 REGION is-template-use-file */
      const mismatch = Filings.#kindMismatch(used, a);
      if (mismatch) return mismatch;
    }
    const { det, hidden } = this.#restsOn(a, viewer);
    /* DEC-49 REGION is-counsel-packet-basis */
    if (!det && !a.premise_override)
      return { ok: false, reason: "NO_DETERMINATION", action: a.id,
               detail: this.conformance ? "the action rests on no live determination you may see, and states no premise override, so there are no facts to assemble"
                 : "no module answers determinations here, so no live determination can be read" };
    /* END DEC-49 REGION is-counsel-packet-basis */
    const marking = counselMarking(c);
    const sections = this.#assemble(a, det, viewer, marking);
    const at = this.#when();
    if (used) sections.briefing = this.#briefing(used, a, det, hidden, viewer, at, marking);
    const tpl = used ? Filings.#templateOf(used) : null;
    const basis = this.#packetBasis(det, a);
    const disclosure = a.premise_override ? overrideDisclosure(a.premise_override) : null;
    return this.record.transact(() => {
      const held = this.#one(`SELECT packet_id, MAX(version) AS v FROM counsel_packets WHERE action_id=? GROUP BY packet_id
                               ORDER BY packet_id LIMIT 1`, a.id);
      const id = held ? held.packet_id : this.record.allocId("CPK", at.slice(0, 4)).id;
      const version = held ? Number(held.v) + 1 : 1;
      this.sql.exec(`INSERT INTO counsel_packets (packet_id, version, action_id, counsel, author, at, sections, basis, disclosure,
                       template, reason) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                    id, version, a.id, json(c), who, at, json(sections), json(basis), disclosure, json(tpl), why);
      return { ok: true, id, version, action: a.id, head: this.#head(id, version, a.id, c, who, at, marking, disclosure),
               sections, marking, disclosure, fileable: false, template: tpl, reason: why, basis_changed: null };
    });
  }

  /* R31: the packet's seventh section: a `brief` template's text filled from the record as R3 fills a filing, each filled
     blank naming its source, carrying R10's marking and, as R29's draft does, the statement that the template was not
     written for the kind's jurisdiction. */
  #briefing(used, a, det, hidden, viewer, at, marking) {
    const v = this.#view();
    const entry = v.view && Array.isArray(v.view.action_kinds) ? v.view.action_kinds.find((k) => k.kind === a.kind) || null : null;
    const filled = this.#fill(used.text, this.#values(a, det, hidden, entry, viewer, at));
    const notFor = Filings.#notWrittenFor(used, entry);
    return { title: "Briefing", marking, text: notFor ? `${notFor}\n\n${filled.text}` : filled.text,
             items: filled.blanks, unfilled: filled.unfilled, template: Filings.#templateOf(used),
             ...(notFor ? { not_written_for: notFor } : {}),
             says: "the group's briefing to counsel, filled from the record from a brief template; it is not a filing and "
                 + "cannot be filed as it stands" };
  }

  #head(id, version, action, counsel, author, at, marking, disclosure = null) {
    return { packet: id, version, action, counsel: counsel && counsel.name ? counsel : null, assembled_by: author, at,
             ...(disclosure ? { disclosure } : {}), marking, fileable: false,
             says: `prepared ${counsel && counsel.name ? "for counsel's review" : "for the group's own review, no counsel named"} `
                 + "from the record; it is never published and is not in a form that can be filed" };
  }

  /* A packet's versions the viewer may see, through its action and the project each version draws on (R11, R19;
     K316): its rows, or null when it may see none. */
  #packet(id, viewer) {
    const p = str(id);
    const rows = p ? this.#rows(`SELECT * FROM counsel_packets WHERE packet_id=? ORDER BY version`, p) : [];
    if (!rows.length || !this.#action(rows[0].action_id, viewer)) return null;
    const seen = rows.filter((r) => this.#sees(parse(r.basis), viewer));
    return seen.length ? seen : null;
  }

  /* R29, R31: the template a draft or packet version recorded, shown with the version's state, approver and reviews as
     `filing-templates` reads it now (`templateRead`, its R14), and flagged when that version was since updated or its
     template retired. Nothing in the draft or packet changes, and no approval is refused for it. A draft filled from
     the member's own words recorded `template: null`; one stored before T21 recorded no version, and is shown as stored. */
  #templateShown(stored, viewer) {
    if (!isObj(stored) || !str(stored.id) || stored.version == null) return stored ?? null;
    const t = this.filingTemplates;
    const r = t && typeof t.templateRead === "function"
      ? this.#call(() => t.templateRead({ template: stored.id, version: stored.version, viewer })) : null;
    if (!r || r.ok === false) return { ...stored, read: false, says: "the template is not readable here now" };
    const ver = r.version || {};
    const retired = r.template && r.template.retired ? r.template.retired : null;
    const flags = [
      ...(ver.updated_by ? [{ flag: "updated", by: ver.updated_by,
                              says: `prepared from version ${stored.version}, since updated by version ${String(ver.updated_by).split("@").pop()}` }] : []),
      ...(retired ? [{ flag: "retired", reason: retired.reason ?? null, at: retired.at ?? null,
                       says: `prepared from a template since retired: ${retired.reason ?? "no reason stated"}` }] : []),
    ];
    return { ...stored, name: r.template ? r.template.name : null, state: ver.state ?? null,
             approved: ver.approved ? { by: ver.approved.by, at: ver.approved.at } : null,
             reviews: ver.reviews_summary ?? null, ...(flags.length ? { flags } : {}) };
  }

  #version(r, rows, viewer) {
    const counsel = parse(r.counsel);
    const marking = counselMarking(counsel);
    const causes = this.#basisChanged(parse(r.basis) || {}, viewer);
    return { ok: true, id: r.packet_id, version: Number(r.version), action: r.action_id,
             head: this.#head(r.packet_id, Number(r.version), r.action_id, counsel, r.author, r.at, marking, r.disclosure ?? null),
             sections: parse(r.sections), marking, disclosure: r.disclosure ?? null, fileable: false,
             template: this.#templateShown(parse(r.template), viewer), reason: r.reason ?? null,
             basis_changed: causes.length ? { causes } : null,
             versions: rows.map((x) => Number(x.version)) };
  }

  /** R11, R12: a packet's version (the latest the viewer may see unless one is named), read only by a member who may see
   *  the action and the project of every determination and consequence it draws on (K316). */
  counselPacketRead({ id = null, version = null, viewer = null } = {}) {
    const rows = this.#packet(id, viewer);
    const r = rows ? (version == null || version === "" ? rows[rows.length - 1] : rows.find((x) => Number(x.version) === Number(version))) : null;
    if (!r) return this.#noPacket(id);
    const exports = this.#rows(`SELECT author, at, counsel, sha FROM counsel_packet_exports WHERE packet_id=? AND version=?
                                 ORDER BY export_id`, r.packet_id, r.version)
      .map((e) => ({ exported_by: e.author, at: e.at, counsel: parse(e.counsel), sha: e.sha }));
    return { ...this.#version(r, rows, viewer), exports };
  }

  /** R10: the packet's bytes: one Markdown document, the marking on its head, every section and its manifest. */
  static render(v) {
    /* R24: the override's disclosure is the first line of the face. */
    const lines = [...(v.disclosure ? [v.disclosure, ""] : []), `# Counsel packet ${v.id}, version ${v.version}`, "", v.marking, "",
                   `Action: ${v.action}. Assembled by ${v.head.assembled_by} at ${v.head.at}.`, ""];
    const item = (x) => `- ${JSON.stringify(x)}`;
    for (const s of Object.values(v.sections || {})) {
      lines.push(`## ${s.title}`, "", s.marking, "");
      if (s.says) lines.push(s.says, "");
      if (typeof s.text === "string") lines.push(s.text, "");
      for (const x of s.items || []) lines.push(item(x));
      for (const x of s.undated || []) lines.push(item({ undated: true, ...x }));
      lines.push("");
    }
    lines.push("## Manifest of exhibits", "", v.marking, "");
    for (const e of (v.sections && v.sections.exhibits ? v.sections.exhibits.items : [])) lines.push(`- ${e.sha256}`);
    lines.push("");
    return lines.join("\n");
  }

  /* R22: the two floors the in-band quartet carries: the bar of the project a draft or packet draws on (`strength`
     R14, as `review` and `case-authoring` read it); with no project (an overridden premise, no determination), or no
     module answering, none is declared, and `floorsOf` says that is not a floor of zero. */
  #bar(project) {
    if (!str(project) || !this.strength || typeof this.strength.projectBar !== "function") return null;
    const b = this.#call(() => this.strength.projectBar(str(project)));
    return isObj(b) ? b : null;
  }

  /* R22: bytes leaving the instance: `face` (the text a member approved or the packet's rendering, R24's disclosure
     first where it applies), then the in-band block, its hash over `face` by the one hasher (`inbandQuartet`). */
  async #stamped(face, { what, date, author, project }) {
    const { quartet } = await inbandQuartet({
      subject: face,
      over: `${what}: the text above the line "${INBAND_RULE}", without the line break before it, as a JSON string; `
          + "hash JSON.stringify(text, null, 1) as UTF-8",
      date, author, bar: this.#bar(project) });
    return { bytes: `${face}\n${inbandBlock(quartet)}`, inband: quartet };
  }

  /** R11, R22: hands a member the packet's bytes, carrying the in-band quartet, and records who exported which version,
   *  when and for which counsel, with the digest of the bytes handed over. */
  async counselPacketExport({ id = null, version = null, author = null, viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-packet-export */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_EXPORT",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: only a member hands a packet to counsel`
                           : "no member is named as the one exporting" };
    const read = this.counselPacketRead({ id, version, viewer });
    if (!read.ok) return read;
    /* END DEC-49 REGION is-packet-export */
    const at = this.#when();
    const row = this.#one(`SELECT basis FROM counsel_packets WHERE packet_id=? AND version=?`, read.id, read.version);
    const project = (parse(row && row.basis) || {}).project ?? null;
    const { bytes, inband } = await this.#stamped(Filings.render(read),
      { what: `counsel packet ${read.id} version ${read.version}`, date: at, author: who, project });
    const sha = sha256HexSync(bytes);
    this.sql.exec(`INSERT INTO counsel_packet_exports (packet_id, version, action_id, author, at, counsel, sha, inband)
                   VALUES (?,?,?,?,?,?,?,?)`, read.id, read.version, read.action, who, at, json(read.head.counsel), sha, json(inband));
    return { ok: true, id: read.id, version: read.version, action: read.action, format: "text/markdown", bytes, sha, inband,
             counsel: read.head.counsel, exported_by: who, at, marking: read.marking, disclosure: read.disclosure,
             fileable: false };
  }

  /* ---------------------------------------------------------------- R13: filingsFor */

  /* R13 (K316): the first `n` rows of `q` (ordered, without LIMIT) whose basis the viewer may see; the others are read
     past, never named or counted. Read a page at a time, each page spread before the next read, so no cursor is left
     open while sight is asked. */
  #seenRows(n, viewer, q, ...a) {
    const out = [];
    for (let offset = 0; out.length < n; offset += FILINGS_FOR_MAX) {
      const page = this.#rows(`${q} LIMIT ? OFFSET ?`, ...a, FILINGS_FOR_MAX, offset);
      for (const r of page) if (out.length < n && this.#sees(parse(r.basis), viewer)) out.push(r);
      if (page.length < FILINGS_FOR_MAX) break;
    }
    return out;
  }

  /** R13: the action's drafts and counsel packets, in creation order; the read `escalation` uses. A draft or packet
   *  version drawing on a determination or consequence in a project the viewer may not see is left out, and nothing of
   *  it is named (K316). */
  filingsFor({ action = null, viewer = null } = {}) {
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    /* R23: the action's communications are listed among its drafts, marked a communication. */
    const drafts = this.#seenRows(FILINGS_FOR_MAX + 1, viewer,
      `SELECT d.filing_id, d.tier, d.preparer, d.prepared_at, d.basis, d.form, d.purpose, d.template, ap.approved_by,
              ap.at AS approved_at, ap.sha, s.ord, s.sent_on, s.recorded_by, s.recorded_at
         FROM (SELECT filing_id, tier, preparer, prepared_at, basis, 'filing' AS form, NULL AS purpose, template
                 FROM filing_drafts WHERE action_id=?
               UNION ALL
               SELECT filing_id, NULL AS tier, preparer, prepared_at, basis, 'communication' AS form, purpose, NULL AS template
                 FROM communication_drafts WHERE action_id=?) d
         LEFT JOIN filing_approvals ap ON ap.filing_id=d.filing_id
         LEFT JOIN filing_sendings s ON s.filing_id=d.filing_id
        ORDER BY d.prepared_at, d.filing_id`, a.id, a.id);
    const versions = this.#seenRows(FILINGS_FOR_MAX + 1, viewer,
      `SELECT * FROM counsel_packets WHERE action_id=? ORDER BY at, packet_id, version`, a.id);
    return {
      ok: true, action: a.id,
      drafts: drafts.slice(0, FILINGS_FOR_MAX).map((d) => ({
        filing: d.filing_id, form: d.form,
        ...(d.form === "communication" ? { purpose: d.purpose } : { tier: d.tier, template: this.#templateShown(parse(d.template), viewer) }),
        label: proposalLabel(d.preparer, d.form === "communication" ? "communication" : "filing_draft"), at: d.prepared_at,
        approval: d.approved_by ? { approved_by: d.approved_by, at: d.approved_at, sha: d.sha } : null,
        sending: d.recorded_by ? { ord: d.ord, sent_on: d.sent_on, recorded_by: d.recorded_by, at: d.recorded_at } : null })),
      drafts_truncated: drafts.length > FILINGS_FOR_MAX,
      packets: versions.slice(0, FILINGS_FOR_MAX).map((r) => {
        const causes = this.#basisChanged(parse(r.basis) || {}, viewer);
        return { packet: r.packet_id, version: Number(r.version), counsel: parse(r.counsel), assembled_by: r.author, at: r.at,
                 reason: r.reason ?? null, template: this.#templateShown(parse(r.template), viewer),
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
    if (!who) return { ok: false, reason: "THEORY_NO_PROPOSER", detail: "no stamped proposer: a proposal names who made it" };
    let actionId = str(action), packetId = null;
    if (str(packet)) {
      const rows = this.#packet(packet, viewer);
      if (!rows) return this.#noPacket(packet);
      packetId = rows[0].packet_id; actionId = rows[0].action_id;
    }
    const a = this.#action(actionId, viewer);
    if (!a) return this.#noAction(actionId);
    const t = typeof theory === "string" ? theory.trim() : "";
    const rem = remedy == null ? null : String(remedy).trim() || null;
    if (!t || t.length > THEORY_TEXT_MAX || (rem !== null && rem.length > THEORY_TEXT_MAX))
      return { ok: false, reason: "NO_THEORY", max: THEORY_TEXT_MAX,
               detail: `state the candidate theory, and any remedy, each in at most ${THEORY_TEXT_MAX} characters` };
    const list = (Array.isArray(standards) ? standards : typeof standards === "string" ? standards.split(",") : [])
      .map((s) => String(s ?? "").trim()).filter(Boolean);
    if (!list.length) return { ok: false, reason: "THEORY_NO_STANDARDS", detail: "a candidate theory names the standards it rests on" };
    const reads = this.standards && typeof this.standards.standardRead === "function"
      ? list.map((s) => this.#call(() => this.standards.standardRead({ id: s, viewer }))) : null;
    if (!reads || reads.some((r) => !r))
      return { ok: false, reason: "THEORY_STANDARD_UNREADABLE",
               detail: "no module answers a standard's read here, so the standards named cannot be read" };
    /* standards' own refusal (its NO_SUCH_STANDARD, C-112) passes through as it came, naming the standard. */
    const refused = reads.find((r) => r.ok === false);
    if (refused) return refused;
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

  /* ---------------------------------------------------------------- R32: a template from an approved draft */

  /** R32 (K922 (1)): a member starts a template draft from an approved filing draft (R6), or a draft of a new version of a
   *  named template, by handing the approved text and `from: {filing, sha}` to `filing-templates.templateDraft` (its R3)
   *  and answering its answer. A new template's `project` defaults to the project the draft drew on, its `kind` to the
   *  action's, its `use` to `file` and its `profiles` to those that give the action's kind (else `general`); the R26
   *  library is gone (K921), and its rows are `filing-templates`' to migrate (K927). */
  templateSave({ filing = null, template = null, project = null, name = null, kind = null, use = null, profiles = null,
                 notes = null, author = null, viewer = null } = {}) {
    const d = this.#draft(filing, viewer);
    if (!d) return this.#noFiling(filing);
    const approved = this.#one(`SELECT text, sha FROM filing_approvals WHERE filing_id=?`, d.filing_id);
    /* DEC-49 REGION is-template-save */
    if (!approved) return { ok: false, reason: "TEMPLATE_FROM_UNAPPROVED", filing: d.filing_id,
                            detail: "a template is drafted from a draft a member has approved" };
    /* END DEC-49 REGION is-template-save */
    const t = this.filingTemplates;
    if (!t || typeof t.templateDraft !== "function")
      return templatesRow({ ok: false, reason: "NO_SUCH_TEMPLATE", template: str(template),
                            detail: "no module answers the group's templates here, so no template can be drafted" });
    const named = template != null && template !== "";
    const defaults = {};
    if (!named) {
      const v = this.#view();
      const actionKind = d.kind || (this.#action(d.action_id, viewer) || {}).kind || null;
      const entry = v.view && Array.isArray(v.view.action_kinds) ? v.view.action_kinds.find((k) => k.kind === (kind ?? actionKind)) : null;
      const givers = entry ? [entry.profile, ...(Array.isArray(entry.bases) ? entry.bases.map((b) => b.profile) : [])].filter(Boolean) : [];
      defaults.project = project ?? (parse(d.basis) || {}).project ?? null;
      defaults.kind = kind ?? actionKind;
      defaults.use = use ?? "file";
      defaults.profiles = profiles ?? (givers.length ? [...new Set(givers)] : "general");
      defaults.name = name;
    }
    return t.templateDraft({ ...(named ? { template } : defaults), text: approved.text, notes,
                             from: { filing: d.filing_id, sha: approved.sha }, author, viewer });
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
            standards: d.standards.filter((s) => s.outcome === "noncompliant").map((s) => s.id),
            factual_basis: d.findings.map((f) => ({ finding: f.id, case: f.case ?? null, edition: f.edition ?? null })),
            counsel: COUNSEL_SENTENCE } } : {}),
          /* R27 (DEC-36): what conformance withheld from the viewer is left out; this states only that it was. */
          ...(d.withheld ? { out_of_view: true } : {}),
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
    const raw = this.conformance && typeof this.conformance.determinationRead === "function"
      ? this.#call(() => this.conformance.determinationRead({ id: str(determination), viewer })) : null;
    if (!raw)
      return { ok: false, reason: "DETERMINATION_UNREADABLE", determination: str(determination),
               detail: "no module answers a determination's read here, so none is readable" };
    /* conformance's own refusal (its NO_SUCH_DETERMINATION) passes through as it came: absent and unseen, one answer. */
    if (raw.ok === false) return raw;
    const d = this.#det(determination, viewer);
    /* END DEC-49 REGION is-available-actions */
    return { ok: true, determination: d.id, live: d.live, ...this.#block([d], this.#view()) };
  }

  /** R15: the block `public-read` carries beside a published case edition (its R8, was publication R36; K651): the live determinations of the
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
          if (!d.findings.some((x) => x.case === caseId)) continue;
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
 *  (K23, R19) and registers the available-actions block with `public-read` (its R8, was publication R36; K651; R15). */
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
    f.publicRead.registerEvidenceBlock("filings", "available_actions", (arg) => f.evidenceBlock(arg));
  }
  return f;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function filingsOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return FILINGS_TABLES.some((x) => x.name === name);
}

/** The module's ops (K3), as entries of the plane's one op map, which the plane composes and control-plane's routes
 *  spread (`control-plane/dispatch.mjs`). `viewer` and `author` are the control plane's stamps, read from the query after
 *  the body, so a caller's own copy never wins. */
export function filingsOps(f, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    filingprepare: () => f.filingPrepare({ action: b.action ?? q("action"), template: b.template ?? q("template"),
                                           text: b.text ?? null, preparer: q("author"), viewer: q("viewer") }),
    communicationprepare: () => f.communicationPrepare({ action: b.action ?? q("action"), text: b.text, purpose: b.purpose,
                                                         preparer: q("author"), viewer: q("viewer") }),
    templatesave: () => f.templateSave({ filing: b.filing ?? q("filing"), template: b.template ?? q("template"),
                                         project: b.project ?? null, name: b.name ?? null, kind: b.kind ?? null, use: b.use ?? null,
                                         profiles: b.profiles ?? null, notes: b.notes ?? null, author: q("author"), viewer: q("viewer") }),
    filingapprove: () => f.filingApprove({ filing: b.filing ?? q("filing"), text: b.text, author: q("author"), viewer: q("viewer") }),
    filingsent: () => f.filingRecordSent({ filing: b.filing ?? q("filing"), at: b.at ?? q("at"), medium: b.medium ?? null,
                                           artifactSha: b.artifactSha ?? b.artifact_sha ?? null, account: b.account ?? null,
                                           author: q("author"), viewer: q("viewer") }),
    counselpacket: () => f.counselPacket({ action: b.action ?? q("action"), counsel: b.counsel ?? null,
                                           template: b.template ?? q("template"), reason: b.reason,
                                           author: q("author"), viewer: q("viewer") }),
    counselpacketread: () => f.counselPacketRead({ id: q("id"), version: q("version"), viewer: q("viewer") }),
    counselpacketexport: () => f.counselPacketExport({ id: b.id ?? q("id"), version: b.version ?? q("version"),
                                                       author: q("author"), viewer: q("viewer") }),
    filingsfor: () => f.filingsFor({ action: q("action"), viewer: q("viewer") }),
    theorypropose: () => f.theoryPropose({ packet: b.packet ?? null, action: b.action ?? null, theory: b.theory, remedy: b.remedy,
                                           standards: b.standards, why: b.why, proposer: q("author"), viewer: q("viewer") }),
    availableactions: () => f.availableActions({ determination: q("determination"), viewer: q("viewer") }),
  };
}
