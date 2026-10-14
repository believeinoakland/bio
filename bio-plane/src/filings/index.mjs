/* filings — what the group sends, prepared from the record (requirements: `build/requirements/filings.md`; Design
 * Requirement 8 as amended 2026-09-26, K13, K102; the Action layer, K608; filing templates, K921, K922, K924). For an
 * action whose governing tier is 1 or 2, a draft pre-filled from the record into an offered version of a template
 * (`filing-templates`; the profile's `file` template for the kind by default) or into the member's own words, every
 * filled blank naming its source, the template and version recorded (R1–R5, R28, R29); a member approves it and records
 * that it was sent (R6, R7), and may start a template draft from it (R32). At any tier, a counsel packet (a briefing) for
 * counsel the group names (required at Tier 3) or for the group's own review, marked as prepared for review, never
 * published and never fileable, with a `briefing` section filled from a `brief` template when one is named (R8–R12,
 * R31); its chronology is `events`' timeline, the world's lane and the group's own acts apart (R33; K1494). A
 * communication to anyone is drafted without a template and goes the same way (R23). Approved bytes and
 * exports carry the in-band quartet (R22); whatever is prepared from an action resting on a premise override says so
 * first (R24); exhibits show their grades beside the venue's standard (R25); deadlines state the calendar's
 * confirmation (R30), read by `action-clocks.factReader` (its R12; N474). Candidate theories are proposals, stored
 * apart and labelled (R14). The evidence package's available-actions block is registered with `public-read` (R15)
 * and answered on its own for `escalation` (R21). The AI prepares; a member approves, files and records it. (T48) A Tier 2
 * filing offers a counsel packet beside its advisory (R58); `filingRead` answers a prepared draft as it was stored, so a
 * reload loses nothing (R59); R40's quoting check is `filing-templates`' (R57, its R33).
 *
 * A NEW MODULE (T8, layer 9): nothing moved into it and it writes no legacy file. Its tables are `./schema.mjs`; a
 * deadline's date is `./dates.mjs`, counted by `action-clocks`' rule. Its R26 library moved to `filing-templates` (T21,
 * K921, K922); its table `filing_templates` stays, written by nothing, as that module's migration's read contract (K986).
 *
 * REACHED as `filingsOf(host, deps)` (K61): one instance per host, created on the first call with `deps`. At creation it
 * creates its tables, declares them to record-core's purge (K23, R19) and registers the available-actions block with
 * `public-read` (its R8; R15 here). `deps` (each module is reached through its factory on the same host unless given):
 *   record, publication, provenance, content   `getSetting`, `allocId`, `transact`, `textAtSha`, `declarePurge`;
 *                                   `publishedEditionsOf`; `captureGrade` (R25); `contentRow`, `captureFor`, `sees`, `passageText` (R8).
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
 *   standards      `standardRead` (its R5), `inForce` (R7), from `standardsOf(host, deps)` (K251); (T35) its `access`,
 *                  `designation`, `edition` (R39, R41) and `editionInForce` (R40), R8's carriage of a standard not free.
 *   consequences   `consequencesOf` (its R7), from `consequencesModule(host, deps)` (K171 (17), K250).
 *   promotion      `fact("producingGroup")` (its R40; R3's `group`, N331), from `promotionOf` on the same host unless given.
 *   events         `timeline` (its R28–R30; R33's chronology) and `readEvent` (its R26; the captures R9's exhibits take from
 *                  the events the chronology lists), from `eventsOf` (T33-75, K1494).
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
import { eventsOf } from "../events/index.mjs";
import { filingTemplatesOf, FILING_BLANKS, FILING_TEXT_MAX, blanksOf, blankUnknownRefusal, withRow as templatesRow,
         RFC_QUOTING_SENTENCE, rfcQuotingRefusal } from "../filing-templates/index.mjs";
import { docketOf } from "../docket/index.mjs";
import { caseCheckOf } from "../case-check/index.mjs";
import { acceptedWorkOf } from "../accepted-work/index.mjs";
import { actionHoldsOf, holdNotInPlace } from "../action-holds/index.mjs";
import { projectRosterOf } from "../project-roster/index.mjs";
/* action-grammar's T45 reads (`pointOut`, its R18; `assertionResolutionFindings`, `assertionsUnresolved`, its R19) are
   read off its namespace, so a read it does not answer yet is undetermined here, never a failed link (K248). */
import * as actionGrammar from "../action-grammar/index.mjs";
import { checkAccount } from "../case-checker/account.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { isMachineIdentity, MACHINE_CLASS_PREFIX } from "../record-grammar/actors.mjs";
import { proposalLabel } from "../record-grammar/labels.mjs";
import { parseFrontmatter } from "../record-grammar/frontmatter.mjs";
import { BASIS_GRADES } from "../record-grammar/grades.mjs";
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { FILINGS_TABLES, migrateFilings } from "./schema.mjs";
import { rowOf } from "./checks.mjs";
import { deadlineDate, realDate, COUNTED_FROM } from "./dates.mjs";
import { KEYED, keyed, sentencesOf, isQuestion, verdictsOf, asks, askAllowed, disclosureLines, OVERRIDE_HEAD,
         overrideDisclosure } from "./outward.mjs";

export { FILINGS_SCHEMA, FILINGS_TABLES } from "./schema.mjs";
export { FILINGS_CHECKS, FILINGS_WORDS } from "./checks.mjs";
export { deadlineDate, COUNTED_FROM } from "./dates.mjs";
export { KEYED, keyed, sentencesOf, OVERRIDE_HEAD, overrideDisclosure } from "./outward.mjs";

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
/** R33: the most items the chronology reads in each lane (events' own bound, its R27, R29). */
export const CHRONOLOGY_MAX = 500;
/** R33: the words that head each lane, as `events` R28 names them. */
export const LANE_WORDS = Object.freeze({ world: "what they did", ours: "what we did" });
/** R54 (T47): the longest venue reference for a sending, in characters (code points). */
export const SENT_REFERENCE_MAX = 100;
/** R13: the drafts and the packet versions one `filingsFor` read lists, each; R53: the most `approvedUnsent` lists. */
export const FILINGS_FOR_MAX = 200;
/** R10: the marking every section, the packet's head and every export carry; with no counsel named (Tier 1 or 2, K924),
 *  the group's own. */
export const counselMarking = (counsel) => (counsel && counsel.name
  ? `Prepared for review by ${counsel.name}, ${counsel.organisation}. Not legal advice. Not for filing.`
  : "Prepared for the group's own review. Not legal advice. Not for filing.");
/** R23: the longest purpose, in characters. */
export const COMMUNICATION_PURPOSE_MAX = 500;
/** R23, R37, R38: the purposes a communication may state by name (any other is the member's own words, R23). */
export const COMMUNICATION_PURPOSES = Object.freeze(["document_infraction", "chance_to_fix"]);
/** R37: the audiences a documenting version may be written for. */
export const AUDIENCES = Object.freeze(["violating_party", "members", "oversight", "public", "broad"]);
/** R44: whose act a public comment or testimony is. */
export const VOICES = Object.freeze(["group", "self"]);
/** R8: what a counsel packet is assembled for. */
export const PACKET_PURPOSES = Object.freeze(["claim", "defence"]);
/** R23: the most findings and inquiries a communication is drafted from; R9: the most challenged statements. */
export const FROM_MAX = 50;
export const CHALLENGED_MAX = 50;
/** R34: the longest reason given for releasing a contradicted sentence; R36: the longest account of a partner's act. */
export const RELEASE_REASON_MAX = 2000;
export const ACCOUNT_MAX = 2000;
/** R9: the most pressure items and docket marks a defence packet reads. */
export const PRESSURE_MAX = 500;
/** R28: the most offered `file` templates `TEMPLATE_NOT_NAMED` lists. */
export const TEMPLATES_NAMED_MAX = 20;
/** R22: the line that opens the in-band block below the text of approved or exported bytes. */
export const INBAND_RULE = "---- in-band ----";
/** R22: the in-band block appended to bytes leaving the instance: the quartet's hash, date, author, both floors and
 *  (T45) the group's public identity and declared stake,
 *  in words and as JSON, so a reader holding only the bytes can re-hash the text above the rule. */
export function inbandBlock(q) {
  const f = q.floors || {};
  return [INBAND_RULE, `Format: ${q.format}.`,
          `Hash: sha256 ${q.hash.sha256} over ${q.hash.over} (${q.hash.bytes} bytes; ${q.hash.canonical}).`,
          `Date: ${q.date ?? "undetermined"}. Author: ${q.author ?? "undetermined"}.`,
          `Floors: capture ${f.capture ?? "none"}, connection ${f.connection ?? "none"}. ${f.detail ?? ""}`.trimEnd(),
          ...(q.group ? [groupLine(q.group)] : []),
          JSON.stringify(q), ""].join("\n");
}
/** R22 (T45): the group's public identity and declared stake in words, as the in-band block states them. */
export function groupLine(g) {
  const who = [g.name, g.domain].filter(Boolean).join(", ");
  return `Group: ${who || "its public identity undetermined"}. Declared stake: ${g.stake == null ? "none declared" : g.stake}.`;
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
/** R58: what a Tier 2 filing offers beside its advisory: a counsel packet (R8), offered and never required. */
export const COUNSEL_OFFER = Object.freeze(["counsel_packet"]);
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
                                "communicationPrepare", "templateSave", "jointSignatory", "filingSecondApprove",
                                "holdNoticePrepare", "templatesForAction", "approvedUnsent", "filingRead"]);

export class Filings {
  #deps;
  #profilesGiven = false;

  constructor({ storage, record, host = null, membership = null, publication = null, publicRead = null, provenance = null,
                attestation = null, content = null,
                actions = null, conformance = null, standards = null, consequences = null, promotion = null, strength = null, actionClocks = null,
                localFacts = null, filingTemplates = null, events = null, docket = null, projectRoster = null,
                actionHolds = null, caseCheck = null, acceptedWork = null, grammar = null, accountCheck = null,
                producingGroup = null, profiles = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.#deps = { host, membership, publication, publicRead, provenance, attestation, content, actions, conformance, standards, consequences, promotion, strength, actionClocks, localFacts, filingTemplates, events, docket, projectRoster, actionHolds, caseCheck, acceptedWork };
    /* R38, R39, R43: action-grammar's pure reads (its R18, R19), its module unless a test hands in its own; R34: the
       sentence judgment, `case-checker.checkAccount` (its R24) unless handed in. */
    this.grammar = grammar && typeof grammar === "object" ? grammar : actionGrammar;
    this.accountCheck = typeof accountCheck === "function" ? accountCheck : checkAccount;
    /* R3 (N331): the producing group is promotion's fact `producingGroup` (its R40), read as `fact` answers it; a
       function handed in (as the retired legacy store's was) is kept and may answer a value, null, or the fact's answer.
       Absent, `#group` asks promotion itself, and says so when no promotion module is reachable (N355: no refusal code
       of promotion's is spelled here). */
    this.producingGroup = typeof producingGroup === "function" ? producingGroup : null;
    this.#profilesGiven = typeof profiles === "function";
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
  /* R33: events' timeline (its R28–R30); with no host and none given, absent, and the chronology says it is unread. */
  get events() { return this.#deps.events ||= (this.#deps.host ? eventsOf(this.#deps.host) : null); }
  /* R9 (T45): docket's `legal` marks (its R27), a defence packet's pressure received. */
  get docket() { return this.#deps.docket ||= (this.#deps.host ? docketOf(this.#deps.host) : null); }
  /* R10, R42 (T45): project-roster's scope (its R23) and second-approval setting (its R24). */
  get projectRoster() {
    return this.#deps.projectRoster ||= (this.#deps.host ? projectRosterOf(this.#deps.host, { record: this.record }) : null);
  }
  /* R9, R47 (T45): action-holds' `pressureFor` (its R12) and the hold at a place (its R2), from `actionHoldsOf` on the
     same host unless given; with none, a defence packet's pressure and a hold notice are undetermined, said so (K248). */
  get actionHolds() { return this.#deps.actionHolds ||= (this.#deps.host ? actionHoldsOf(this.#deps.host) : null); }
  /* R9 (T45; K2858): an unpublished finding's kind read alone: checked for publication and held (`case-check`'s
     `heldFindingVersions`, its R3), or another group's accepted (`accepted-work`'s `acceptedFinding`, its R2). */
  get caseCheck() { return this.#deps.caseCheck ||= (this.#deps.host ? caseCheckOf(this.#deps.host) : null); }
  get acceptedWork() { return this.#deps.acceptedWork ||= (this.#deps.host ? acceptedWorkOf(this.#deps.host) : null); }

  migrate() { migrateFilings(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : stampInstant("second"); }
  #call(fn) { try { return fn(); } catch { return null; } }

  /* ---------------------------------------------------------------- the reads of the modules it uses */

  /* R20: the active profiles' combined view (record-core R26, jurisdictions R12–R16), or none, with why. (T45; R9, R39,
     R49) The view that governs on this instance is `local-facts.governingView` (its R12: the profiles' view with the
     group's confirmed rules); a caller that hands in its own active profiles (`profiles`) is answered their combined
     view, as before. */
  #view() {
    const ids = this.#call(() => this.profiles());
    if (!Array.isArray(ids) || !ids.length)
      return { view: null, conflicts: [], why: "your group's Civicsmith has no active jurisdiction profile" };
    const lf = this.#profilesGiven ? null : this.localFacts;
    const c = lf && typeof lf.governingView === "function" ? this.#call(() => lf.governingView()) : combine(ids);
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
      /* T45: R24, R35 (`actions` R75's disclosures, in its order; null for a read that answers none), R36 (R78's
         partners), R46 (R79's press terms), R43 (R8's breach), R10 and R42 (the action's project) */
      disclosures: Array.isArray(a.disclosures) ? a.disclosures.filter(isObj) : null,
      partners: Array.isArray(a.partners) ? a.partners.filter(isObj) : [],
      press_terms: isObj(a.press_terms) ? a.press_terms : null,
      breach: a.breach === true,
      project: this.#bundleProject(target),
    };
  }

  /* R10, R42 (T45): the project the action belongs to, as record-core holds it for its bundle (its R34); null when it
     names none, and the project of the determination it rests on is read in its place (`#projectOf`). */
  #bundleProject(id) {
    const b = this.#call(() => this.record.bundleInfo(id));
    return b ? str(b.project) : null;
  }

  /* R24: the premise override an action carries (actions R8, shown in its read, R25: `{reason, by, at}`; R74 (T45): its
     `ground`); null when it carries none. */
  static #override(o) {
    if (!isObj(o) || !str(o.reason)) return null;
    return { reason: str(o.reason), by: str(o.by), at: str(o.at), ground: isObj(o.ground) ? o.ground : null };
  }

  /* R24, R35: what is printed first on everything prepared from the action: every disclosure its read answers, in its
     order, else its override alone; null when there is none. */
  static #disclosure(a) {
    const lines = disclosureLines(a.disclosures, a.premise_override);
    return lines.length ? lines.map((l) => l.text).join("\n") : null;
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
      /* conformance R25: the act's event as the viewer reads it (null when withheld or when a pre-T33 act names none) */
      event: isObj(d.event) ? d.event : null,
      findings: findings.filter(seen), standards: standards.filter(seen),
      withheld: d.out_of_view === true || !findings.every(seen) || !standards.every(seen),
      live: d.live !== false && !str(d.superseded_by), superseded_by: str(d.superseded_by),
      basis_changed: isObj(d.basis_changed) ? d.basis_changed : d.basis_changed === true ? { causes: [] } : null,
    };
  }

  /* The act's day (conformance R3, R25): its event's `when` read as one local day (a value at day precision or finer),
     or a pre-T33 act's stated date (R26); null for a band, an undetermined `when` or an event placed nowhere. */
  static #actDay(act) {
    const w = isObj(act.when) ? act.when : null;
    return realDate(act.at) || (w && str(w.value) ? realDate(str(w.value).slice(0, 10)) : null);
  }

  /* Why the act has no single day, in words (R3's `act_date`, R9's deadlines). */
  static #actDayWhy(act) {
    const w = act.when;
    if (isObj(act.period)) return "the determination states the act over a period, so no single day starts it";
    if (!w || w === "undetermined") return `the act's event ${w === "undetermined" ? "has an undetermined date" : "is placed nowhere: no record dates it"}`;
    return "the act's event is dated only within a band, so no single day starts it";
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
      /* conformance R25: a T33 act is its event (named by its kind and id); a pre-T33 act keeps its description (R26) */
      const evId = str(act.event);
      const ev = det.event;
      out.act = str(act.description) ? { value: str(act.description), source: det.id }
        : evId && ev && str(ev.kind) ? { value: `the ${ev.kind} recorded as ${evId}`, source: evId }
        : evId ? none("the act's event is not one you may see")
        : none("the determination states no act");
      const period = isObj(act.period) ? act.period : null;
      const day = Filings.#actDay(act);
      out.act_date = day ? { value: day, source: str(act.at) ? det.id : evId }
        : period && (str(period.from) || str(period.to))
          ? { value: `${str(period.from) || "undetermined"} to ${str(period.to) || "undetermined"}`, source: det.id }
          : none(`${Filings.#actDayWhy(act)}, so the act's date is undetermined`);
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
    return v ? { value: v, source: SOURCE } : { why: "no producing group is recorded" };
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
     why. A name outside `FILING_BLANKS` (a profile's text `filing-templates` would not offer) is left unfilled too.
     R55 (T47; DEC-209 (3)): a blank the member filled (`fills`, read by `#fills`) takes the member's own value, labelled
     the member's, in place of the record's. */
  #fill(text, values, fills = null) {
    const names = blanksOf(text).blanks;
    const blanks = [], unfilled = [];
    for (const n of names) {
      const own = fills && fills.values.has(n) ? { value: fills.values.get(n), source: fills.source, label: fills.label } : null;
      /* a blank of `FILING_BLANKS` the record never fills (a member-filled one, filing-templates R31: records, period,
         form, cost_limit) is left unfilled until the member fills it, never read as a value */
      const val = own || (!Object.prototype.hasOwnProperty.call(FILING_BLANKS, n)
        ? { why: "filings fills no blank by this name, so the record holds no value for it" }
        : values[n] || { why: "the record holds no value for this blank: the member fills it in (fills)" });
      if (val && "value" in val) blanks.push({ name: n, value: val.value, source: val.source, ...(val.label ? { label: val.label } : {}) });
      else unfilled.push({ name: n, why: val.why });
    }
    const filled = new Map(blanks.map((b) => [b.name, b.value]));
    return { text: text.replace(BLANK_RE, (_, n) => (filled.has(n) ? filled.get(n) : unfilledMarker(n))), blanks, unfilled };
  }

  /* R55 (T47; DEC-209 (3)): the member's own values for blanks `text` names, `fills: {<blank>: text}`, read whole before
     anything is written: a name `text` does not name (or `fills` not a map of names) is refused `FILL_UNKNOWN_BLANK`,
     naming it; a value that is not non-empty UTF-8 text of at most `FILING_TEXT_MAX` bytes `TEXT_UNWRITABLE`, naming its
     blank. Answers `{ok: true, fills}`, `fills` null when none is given: its values by name, the source each filled blank
     names (`fills:<preparer>`: the preparer's own word, never a record id) and its label, the member's own value. */
  static #fills(fills, text, who, extra = {}) {
    if (fills == null || (isObj(fills) && !Object.keys(fills).length)) return { ok: true, fills: null };
    const named = new Set(blanksOf(text).blanks);
    const unknown = !isObj(fills) ? null : Object.keys(fills).find((n) => !named.has(n));
    /* DEC-49 REGION is-fill-unknown-blank */
    if (!isObj(fills) || unknown !== undefined)
      return { ok: false, reason: "FILL_UNKNOWN_BLANK", ...extra, blank: isObj(fills) ? unknown : null, blanks: [...named],
               detail: isObj(fills) ? `the text names no blank {{${unknown}}}: a member fills only the blanks the text names`
                 : "fills is a map of the text's blank names to your own words for each" };
    /* END DEC-49 REGION is-fill-unknown-blank */
    for (const [n, v] of Object.entries(fills)) {
      const bad = Filings.#unwritable(v, { ...extra, blank: n });
      if (bad) return bad;
    }
    return { ok: true, fills: {
      values: new Map(Object.entries(fills)), source: `fills:${who}`,
      label: { kind: "member_fill", by: who, machine_work: isMachineIdentity(who),
               says: "the preparer's own value for this blank, written at preparation: not read from the record" } } };
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
  filingPrepare({ action = null, template = null, text = undefined, preparer = null, viewer = null, voice = null, audience = null,
                  language = null, own_doing = null, names_pending = null, textcheck = null, fills = null } = {}) {
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
      /* R56 (T47; K3124): a blank outside `FILING_BLANKS` is refused through filing-templates' one site (its R32),
         answered as it gives it; this module never spells its code */
      const unknown = blankUnknownRefusal(text, { blanks: Object.keys(FILING_BLANKS) });
      if (unknown) return unknown;
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
    /* R55 (T47): the member's own values for the blanks the template or the words name */
    const mf = Filings.#fills(fills, own ? text : used.text, who, { action: a.id });
    if (!mf.ok) return mf;
    /* T45: the marks the member states (R34, R39, R43, R44, R48), refused whole when malformed */
    const mk = Filings.#marks({ voice, audience, language, own_doing, names_pending, textcheck });
    if (!mk.ok) return mk;
    const when = this.#when();
    const { det, hidden } = this.#restsOn(a, viewer);
    const values = this.#values(a, det, hidden, entry, viewer, when);
    const filled = this.#fill(own ? text : used.text, values, mf.fills);
    const { blanks, unfilled } = filled;
    /* R40, R57: a request for comment carries the sentence that the reply may be quoted unless it says otherwise,
       `filing-templates`' (its R33) */
    const rfc = Filings.#isRfc(a, mk.marks, null);
    const content = rfc && !filled.text.includes(RFC_QUOTING_SENTENCE) ? `${filled.text}\n\n${RFC_QUOTING_SENTENCE}` : filled.text;
    /* R46: a press action's review copy carries its embargo and release times on its face */
    const review = Filings.#reviewCopy(a);
    let body = review ? `${review.text}\n\n${content}` : content;
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
    const disclosure = Filings.#disclosure(a);
    if (disclosure) body = `${disclosure}\n\n${body}`;
    const venue = entry && isObj(entry.venue) ? { name: entry.venue.name ?? null, how: entry.venue.how ?? null,
                                                  source: `profile:${entry.venue.profile || entry.profile}/action_kinds/${entry.kind}/venue` }
      : { state: "undetermined", why: "the profile gives this kind no venue" };
    /* R25: the exhibits the draft rests on, each with its grade and co-attestation, read against the venue's standard. */
    const standard = this.#venueStandard(v, a.kind);
    const facts = det ? det.findings.map((f) => this.#fact(f)) : [];
    const exhibits = this.#exhibits(this.#citesOf(a, det, facts), standard);
    const basis = this.#basisOf(a, det, gov);
    /* T45: R34's record check and R38, R39, R43, R48's pointers over the text the template or the member wrote (what
       this module printed first is not judged), and R39, R45, R49's notices */
    const outward = this.#outward(content, { a, facts: this.#matterFacts(a, det, viewer).facts, det, view: v.view, marks: mk.marks,
                                             textcheck: mk.textcheck, form: "filing", viewer });
    const notices = Filings.#notices(a, v.view, mk.marks);
    const marks = { ...mk.marks, textcheck: mk.textcheck, printed: [disclosure, advisory && gov.tier === 2 ? advisory : null, notFor, review ? review.text : null].filter(Boolean),
                    ...(review ? { review_copy: review } : {}), rfc };
    /* R29: the template and version, or null for the member's own words */
    const tpl = used ? Filings.#templateOf(used) : null;
    const year = when.slice(0, 4);
    return this.record.transact(() => {
      const { id } = this.record.allocId("FIL", year);
      this.sql.exec(`INSERT INTO filing_drafts (filing_id, action_id, kind, tier, governing, text, blanks, unfilled,
                       advisory, venue, preparer, prepared_at, basis, exhibits, venue_standard, disclosure, template, outward, marks)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id, a.id, a.kind, gov.tier, json(gov), body, json(blanks), json(unfilled), advisory, json(venue), who, when, json(basis),
        json(exhibits), json(standard), disclosure, json(tpl), json({ ...outward, notices }), json(marks));
      return { ok: true, id, action: a.id, tier: gov.tier, governing: gov, text: body, blanks, unfilled,
               ...(gov.tier === 2 ? { advisory, offers: COUNSEL_OFFER } : {}), venue, template: tpl,
               ...(used ? { template_version: { name: used.name, state: used.state, profiles: used.profiles,
                                                  ...(used.default ? { default: true } : {}),
                                                  ...(used.updated_by ? { updated_by: used.updated_by,
                                                    says: `version ${used.number} is updated by ${used.updated_by}` } : {}) } } : {}),
               ...(notFor ? { not_written_for: notFor } : {}), disclosure,
               exhibits, venue_standard: standard, label: proposalLabel(who, "filing_draft"),
               outward, notices, marks: mk.marks, ...(review ? { review_copy: review } : {}),
               ...Filings.#voiceSays(mk.marks.voice),
               prepared_by: who, at: when, evidence: false, says: DRAFT_SAYS };
    });
  }

  /* ---------------------------------------------------------------- R23: communicationPrepare */

  /** R23, R24, R37, R38 (T45): a draft message, briefing or statement for an action whose addressee is anyone, from no
   *  template, drafted from the findings and inquiries the member chooses (`from`, published or not); a documenting
   *  version (`purpose: "document_infraction"`, for an `audience`) or a chance-to-fix notice (`"chance_to_fix"`) is
   *  assembled from the record when no words are given. Stored apart, labelled as R5's drafts are; R6's approval and
   *  R7's sending apply to it unchanged. */
  communicationPrepare({ action = null, text = null, purpose = null, from = null, audience = null, voice = null, language = null,
                         own_doing = null, names_pending = null, textcheck = null, fills = null, preparer = null, viewer = null } = {}) {
    const who = str(preparer);
    const named = typeof purpose === "string" ? purpose.trim() : "";
    const assembled = COMMUNICATION_PURPOSES.includes(named) && (text === null || text === undefined);
    /* DEC-49 REGION is-communication-prepare */
    if (!who) return { ok: false, reason: "COMMUNICATION_NO_PREPARER", detail: "no stamped preparer: a draft names who prepared it" };
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    const closed = this.#closed(a);
    if (closed) return closed;
    if (!assembled && (typeof text !== "string" || !text.trim() || WELL_FORMED.test(text) || utf8(text) > FILING_TEXT_MAX))
      return { ok: false, reason: "COMMUNICATION_TEXT_REFUSED", max_bytes: FILING_TEXT_MAX,
               detail: `the communication's words must be non-empty UTF-8 text of at most ${FILING_TEXT_MAX} bytes` };
    const why = named;
    if (!why || why.length > COMMUNICATION_PURPOSE_MAX || WELL_FORMED.test(why))
      return { ok: false, reason: "COMMUNICATION_PURPOSE_REFUSED", max: COMMUNICATION_PURPOSE_MAX,
               detail: `say what the communication is for, in at most ${COMMUNICATION_PURPOSE_MAX} characters` };
    /* END DEC-49 REGION is-communication-prepare */
    const mk = Filings.#marks({ voice, audience, language, own_doing, names_pending, textcheck });
    if (!mk.ok) return mk;
    if (why === "document_infraction" && !mk.marks.audience)
      return { ok: false, reason: "FILING_MARK_REFUSED", field: "audience",
               detail: `a documenting version names its audience: one of ${AUDIENCES.join(", ")}` };
    /* R23: the findings and inquiries chosen, each the preparer may see; one not seen answers as one absent */
    const chosen = from == null ? [] : Array.isArray(from) ? from : null;
    if (chosen === null || chosen.length > FROM_MAX || !chosen.every((x) => typeof x === "string" && x.trim()))
      return { ok: false, reason: "FILING_MARK_REFUSED", field: "from", detail: `from lists at most ${FROM_MAX} finding or inquiry ids` };
    const fromFacts = [];
    for (const id of [...new Set(chosen.map((x) => x.trim()))]) {
      const f = this.#findingRead(id, viewer);
      /* DEC-49 REGION is-communication-from */
      if (!f) return { ok: false, reason: "NO_SUCH_BUNDLE", target: id,
                       detail: "no finding or inquiry by that id is readable here; one you may not see answers the same" };
      /* END DEC-49 REGION is-communication-from */
      fromFacts.push(f);
    }
    /* R55 (T47; DEC-209 (3)): the member's own values for the blanks the member's words name; a communication reads no
       template and fills nothing from the record (R23), so a blank no fill names stays as written */
    const mf = Filings.#fills(fills, assembled ? "" : text, who, { action: a.id });
    if (!mf.ok) return mf;
    const own = mf.fills ? [...new Set(blanksOf(text).blanks)].filter((n) => mf.fills.values.has(n))
      .map((n) => ({ name: n, value: mf.fills.values.get(n), source: mf.fills.source, label: mf.fills.label })) : [];
    const words = mf.fills ? text.replace(BLANK_RE, (m, n) => (mf.fills.values.has(n) ? mf.fills.values.get(n) : m)) : text;
    const when = this.#when();
    const { det, hidden } = this.#restsOn(a, viewer);
    const v = this.#view();
    const basis = this.#basisOf(a, det, this.governingTier(a, v));
    const disclosure = Filings.#disclosure(a);
    const matters = this.#matterFacts(a, det, viewer).facts;
    const facts = [...matters, ...fromFacts.filter((f) => !matters.some((x) => x.finding === f.finding))];
    const rfc = Filings.#isRfc(a, mk.marks, why);
    /* R37, R38: assembled from the record without AI, each part naming its source */
    const parts = assembled ? this.#assembled(why, a, det, hidden, v, facts, mk.marks, viewer, when) : null;
    let content = parts ? parts.map((x) => x.text).join("\n") : words;
    if (rfc && !content.includes(RFC_QUOTING_SENTENCE)) content = `${content}\n\n${RFC_QUOTING_SENTENCE}`;
    const review = Filings.#reviewCopy(a);
    let body = review ? `${review.text}\n\n${content}` : content;
    if (disclosure) body = `${disclosure}\n\n${body}`;
    /* R23: a request for comment's claims, from the chosen findings: a sourced list, machine work */
    const claims = rfc && fromFacts.length ? {
      items: fromFacts.map((f) => ({ finding: f.finding, kind: f.kind, claim: f.claim && (f.claim.conclusion || f.claim.question) || null,
                                     source: f.source })),
      label: { kind: "machine", machine_work: true, says: "the claims are assembled by the machine from the findings chosen: a proposal" } } : null;
    const outward = this.#outward(content, { a, facts, det, view: v.view, marks: mk.marks, textcheck: mk.textcheck, purpose: why,
                                             form: "communication", viewer });
    const notices = Filings.#notices(a, v.view, mk.marks);
    const marks = { ...mk.marks, textcheck: mk.textcheck, from: fromFacts.map((f) => f.finding), printed: [disclosure, review ? review.text : null].filter(Boolean),
                    ...(review ? { review_copy: review } : {}), rfc, ...(parts ? { parts } : {}), ...(claims ? { claims } : {}),
                    ...(own.length ? { blanks: own } : {}) };
    return this.record.transact(() => {
      const { id } = this.record.allocId("FIL", when.slice(0, 4));
      this.sql.exec(`INSERT INTO communication_drafts (filing_id, action_id, text, purpose, disclosure, preparer, prepared_at, basis,
                       outward, marks) VALUES (?,?,?,?,?,?,?,?,?,?)`, id, a.id, body, why, disclosure, who, when, json(basis),
                    json({ ...outward, notices }), json(marks));
      return { ok: true, id, action: a.id, form: "communication", text: body, purpose: why, disclosure,
               addressee: a.counterparty ?? null, label: proposalLabel(who, "communication"), prepared_by: who, at: when,
               from: marks.from, ...(parts ? { parts } : {}), ...(claims ? { claims } : {}), ...(own.length ? { blanks: own } : {}),
               outward, notices, marks: mk.marks,
               ...(review ? { review_copy: review } : {}),
               ...Filings.#voiceSays(mk.marks.voice),
               evidence: false, says: "a draft communication: nobody has approved or sent it, and nothing is sent until a "
                 + "member approves it and sends it by their own hand" };
    });
  }

  /* R37 (Actions v0.2 rule 19): a documenting version assembled from the record, without AI: the act and its office,
     the standard it is measured against, the evidence for each point with its grade, and what is still uncertain, each
     part naming its source and an undetermined part said so; for the violating party, a time for review and response
     (the action's own clock entry, its date and basis). R38 (rules 19, 21): a chance-to-fix notice: what correcting the
     act and remedying its harm would look like under the standard, and a time: the law's period (a profile deadline for
     the kind, cited) or the group's window (a clock entry whose basis is the group's own). */
  #assembled(purpose, a, det, hidden, v, facts, marks, viewer, when) {
    const entry = v.view && Array.isArray(v.view.action_kinds) ? v.view.action_kinds.find((k) => k.kind === a.kind) || null : null;
    const val = this.#values(a, det, hidden, entry, viewer, when);
    const part = (name, x, words) => ("value" in x ? { part: name, text: words(x.value), source: x.source }
      : { part: name, text: `${name[0].toUpperCase()}${name.slice(1)}: undetermined, because ${x.why}.`, source: null, undetermined: true });
    const office = [val.counterparty_role.value, val.counterparty_body.value].filter(Boolean).join(", ");
    const out = [];
    out.push(part("the act", val.act, (w) => `The act: ${w}${office ? `, by ${office}` : ""}.`));
    out.push(part("the standard", val.standards, (w) => `The standard it is measured against: ${w}.`));
    if (purpose === "document_infraction") {
      const standard = this.#venueStandard(v, a.kind);
      const exhibits = this.#exhibits(this.#citesOf(a, det, facts), standard);
      for (const f of facts) {
        const g = f.grade && f.grade.pair ? Object.entries(f.grade.pair).map(([k, x]) => `${k} ${x && x.grade ? x.grade : "undetermined"}`).join(", ") : "undetermined";
        out.push({ part: "a point", text: `Point: ${f.claim && (f.claim.conclusion || f.claim.question) || f.finding} (finding ${f.finding}, ${f.kind}; grade ${g}).`, source: f.source });
      }
      for (const e of exhibits)
        out.push({ part: "evidence", text: `Evidence: ${e.locator ?? e.sha256} (capture grade ${e.grade && e.grade.grade ? e.grade.grade : "undetermined"}).`,
                   source: e.sha256 });
      const unsure = [...facts.filter((f) => f.kind === "unpublished").map((f) => `finding ${f.finding} is not published`),
                      ...exhibits.filter((e) => !(e.grade && e.grade.grade)).map((e) => `the grade of ${e.locator ?? e.sha256}`)];
      out.push({ part: "still uncertain", text: unsure.length ? `Still uncertain: ${unsure.join("; ")}.` : "Still uncertain: nothing the record marks undetermined.",
                 source: null });
      if (marks.audience === "violating_party") {
        const c = a.clock.find((x) => realDate(x.date) && str(x.basis) && (x.status ?? "pending") === "pending");
        out.push(c ? { part: "a time for review and response", text: `We invite your review and response by ${c.date} (${c.basis}).`, source: `${a.id}/clock` }
          : { part: "a time for review and response", text: "A time for review and response: undetermined, because the action's clock states none.",
              source: null, undetermined: true });
      }
      return out;
    }
    /* chance_to_fix */
    const asks = this.#allowedAsks(det, v.view, viewer).filter((x) => x.what !== "a route the profile names");
    const requires = asks.filter((x) => x.what === "the standard's requirement");
    out.push(requires.length ? { part: "correcting the act", text: `Correcting the act would look like this: ${requires.map((r) => r.words).join("; ")}.`,
                                 source: requires.map((r) => r.source).join(", ") }
      : { part: "correcting the act", text: "Correcting the act: undetermined, because no determination states what the standard requires.", source: null, undetermined: true });
    const harm = asks.filter((x) => x.what === "remedy of a recorded consequence");
    out.push(harm.length ? { part: "remedying the harm", text: `Remedying its harm would look like this: remedy for ${harm.map((r) => r.words).join("; ")}.`,
                             source: harm.map((r) => r.source).join(", ") }
      : { part: "remedying the harm", text: "Remedying its harm: no consequence of the act is recorded.", source: null });
    const law = v.view && Array.isArray(v.view.deadlines) ? v.view.deadlines.find((d) => d.applies_to === a.kind && !d.defends) : null;
    const window = a.clock.find((x) => realDate(x.date) && (x.basis_kind === "window"));
    out.push(law ? { part: "a time", text: `The time the law allows: ${law.days ?? law.amount ?? "a period"} ${law.count ?? law.units ?? "days"} (${law.citation ?? "its citation not stated"}).`,
                     source: `profile:${law.profile}/deadlines/${law.rule}` }
      : window ? { part: "a time", text: `The time we set: by ${window.date} (${window.basis}).`, source: `${a.id}/clock` }
      : { part: "a time", text: "A time: undetermined, because neither the profile nor the action's clock states one.", source: null, undetermined: true });
    return out;
  }

  /* ---------------------------------------------------------------- T45: what an outward text is checked for */

  /* R34, R37, R39, R43, R44, R48: the marks a member states at preparation, read and refused whole when malformed
     (`FILING_MARK_REFUSED`, naming the field): `voice` (R44), `audience` (R37, R42), `language` (R43, a BCP 47 tag the
     member states; never defaulted), `own_doing` (R34, sentence indexes the member marks as about the group's own
     doing), `names_pending` (R39, the text names a pending measure or a candidate), `textcheck` (R43, R48: the
     assistant's `textcheck` answer, handed in by the caller where enabled). */
  static #marks({ voice, audience, language, own_doing: ownDoing, names_pending: pending, textcheck } = {}) {
    const bad = (field, detail) => {
      /* DEC-49 REGION is-filing-mark-refused */
      return { ok: false, reason: "FILING_MARK_REFUSED", field, detail };
      /* END DEC-49 REGION is-filing-mark-refused */
    };
    if (voice != null && !VOICES.includes(voice)) return bad("voice", `voice is one of ${VOICES.join(", ")}`);
    if (audience != null && !AUDIENCES.includes(audience)) return bad("audience", `audience is one of ${AUDIENCES.join(", ")}`);
    if (language != null && (typeof language !== "string" || !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{1,8})*$/.test(language)))
      return bad("language", "language is a language tag, such as en or en-GB");
    if (ownDoing != null && (!Array.isArray(ownDoing) || ownDoing.length > 5000 || !ownDoing.every((i) => Number.isInteger(i) && i >= 0)))
      return bad("own_doing", "own_doing lists the indexes of sentences about the group's own doing");
    if (pending != null && typeof pending !== "boolean") return bad("names_pending", "names_pending is true or false");
    let tc = null;
    if (textcheck != null) {
      const items = isObj(textcheck) && Array.isArray(textcheck.sentences) ? textcheck.sentences : null;
      if (!items || items.length > 5000 || !items.every((x) => isObj(x) && typeof x.quote === "string" && x.quote.trim() && typeof x.reads_as === "string"))
        return bad("textcheck", "textcheck is the assistant's answer: {sentences: [{quote, reads_as, why}]}");
      tc = items.map((x) => ({ quote: x.quote, reads_as: x.reads_as, ...(typeof x.why === "string" ? { why: x.why } : {}) }));
    }
    return { ok: true, marks: { voice: voice ?? null, audience: audience ?? null, language: language ?? null,
                                own_doing: [...new Set(ownDoing || [])].sort((x, y) => x - y), names_pending: pending === true },
             textcheck: tc };
  }

  /* R34: what each sentence is judged against: the findings of R35's three kinds the text rests on (`facts`, each read
     at its pinned bytes by `#fact`, its question and conclusion) and the group's own dated correspondence on the action,
     each a cite as `case-grammar` R23 spells one (a finding, or a material: the entry). */
  static #recordCited(a, facts) {
    const cited = [], conclusions = [];
    for (const f of facts) {
      if (!f || !f.finding || f.kind === "unpublished") continue;
      const claim = f.claim && str(f.claim.conclusion);
      cited.push({ kind: "finding", ref: f.finding, text: [f.claim && f.claim.question, claim].filter(Boolean).join(" ") });
      if (claim) conclusions.push({ finding: f.finding, claim, claim_state: "adopted", legs: [] });
    }
    for (const [i, e] of a.correspondence.entries()) {
      const at = realDate(String(e.at ?? "").slice(0, 10));
      if (!at) continue;
      const ord = Number.isInteger(e.ord) ? e.ord : i;
      cited.push({ kind: "material", ref: `${a.id}#${ord}`,
                   text: [at, e.direction, str(e.account), str(e.medium), str(e.party), isObj(e.quote) ? str(e.quote.text) : str(e.quote)]
                     .filter(Boolean).join(" ") });
    }
    return { cited, conclusions };
  }

  /* R34 (Actions v0.2 rule 3): the record check, sentence by sentence over `sentences` (R34's one split): a question and
     a sentence the member marks about the group's own doing are classed here and never judged; every other sentence is
     judged by `case-checker.checkAccount` (its R24) against `#recordCited`'s cites: `supported` naming them,
     `unsupported`, or `contradicted` naming what contradicts it. A judgment that throws reads every judged sentence
     undetermined, never supported. */
  #recordCheck(sentences, a, facts, ownDoing) {
    const { cited, conclusions } = Filings.#recordCited(a, facts);
    const judged = [];
    const items = sentences.map((text, index) => {
      if (isQuestion(text)) return { index, verdict: "question" };
      if (ownDoing.includes(index)) return { index, verdict: "own_doing" };
      judged.push(index);
      return { index };
    });
    const refs = cited.map((c) => ({ kind: c.kind, ref: c.ref }));
    let answer = null;
    if (judged.length) {
      try {
        answer = this.accountCheck({ account: judged.map((i) => ({ ord: i, text: sentences[i], cites: refs, kind: "claim" })),
                                     cited, printed: [], conclusions });
      } catch { answer = null; }
    }
    const v = verdictsOf(judged, answer, refs.map((c) => c.ref));
    for (const it of items) if (!it.verdict) Object.assign(it, v.get(it.index));
    /* R52 (T46): each judged sentence answers its pointer in `words.json`'s words, read by key; a question, the group's
       own doing and a sentence not judged answer none */
    for (const it of items) {
      if (it.verdict === "supported")
        it.pointer = { key: "pointer.record.supported",
                       text: keyed("pointer.record.supported", { findings: (it.by || []).join(", ") || "nothing it names" }) };
      else if (it.verdict === "unsupported" || it.verdict === "contradicted")
        it.pointer = { key: `pointer.record.${it.verdict}`, text: KEYED[`pointer.record.${it.verdict}`] };
    }
    const count = (k) => items.filter((i) => i.verdict === k).length;
    return { state: judged.length && (!answer || answer.ok !== true) ? "undetermined" : "read", items, cites: refs.map((c) => c.ref),
             says: `${count("supported")} supported, ${count("unsupported")} not supported by the record (pointed out, never `
                 + `refused), ${count("contradicted")} contradicted by it (held back unless a member releases it with a reason)`
                 + `${count("undetermined") ? `, ${count("undetermined")} not judged` : ""}; questions are never flagged` };
  }

  /* R39, R43, R38: action-grammar's `pointOut` (its R18) for one phrasing kind over the sentences, in the member's
     language, with the view's phrasings; a read it does not answer, or a language not stated, is undetermined, never
     "nothing found". */
  #pointOut(sentences, kind, language, view) {
    const fn = this.grammar && this.grammar.pointOut;
    if (typeof fn !== "function") return { state: "undetermined", why: "no module answers the phrasing lists here" };
    if (!language) return { state: "undetermined", why: "no_list", says: "no language is stated for the draft, so no list is read" };
    const r = this.#call(() => fn({ sentences, language, kind, ...(view ? { view } : {}) }));
    return isObj(r) && str(r.state) ? r : { state: "undetermined", why: "the phrasing lists could not be read" };
  }

  /* R43, R48: the assistant's `textcheck` sentences of one reading, each matched to a sentence of R34's split by its
     verbatim `quote` (K2824), never by its index, and labelled machine work; a quote no sentence holds is listed apart. */
  static #machine(sentences, textcheck, readsAs) {
    const items = [], unmatched = [];
    for (const x of textcheck || []) {
      if (x.reads_as !== readsAs) continue;
      const index = sentences.findIndex((s) => s.includes(x.quote));
      (index >= 0 ? items : unmatched).push({ ...(index >= 0 ? { index } : {}), quote: x.quote, ...(x.why ? { why: x.why } : {}),
                                             label: { kind: "machine", machine_work: true, says: "pointed out by the assistant: machine work, a proposal" } });
    }
    return { items, unmatched };
  }

  /* R38: what a notice or demand may ask for: what a standard requires (the determination's comparison rows), remedy of
     a recorded consequence (its affected part) and a route the profile names (a kind's label). */
  #allowedAsks(det, view, viewer) {
    const out = [];
    const cdet = det && this.conformance ? this.#call(() => this.conformance.determinationRead({ id: det.id, viewer })) : null;
    for (const s of cdet && Array.isArray(cdet.standards) ? cdet.standards : [])
      for (const r of Array.isArray(s.rows) ? s.rows : [])
        if (isObj(r) && str(r.requires)) out.push({ what: "the standard's requirement", words: str(r.requires), source: str(s.standard) });
    const cons = det && this.consequences && typeof this.consequences.consequencesOf === "function"
      ? this.#call(() => this.consequences.consequencesOf({ determination: det.id, viewer })) : null;
    for (const p of cons && Array.isArray(cons.parts) ? cons.parts : [])
      if (isObj(p.affected) && str(p.affected.description)) out.push({ what: "remedy of a recorded consequence", words: str(p.affected.description), source: p.id });
    for (const k of view && Array.isArray(view.action_kinds) ? view.action_kinds : [])
      if (str(k.label)) out.push({ what: "a route the profile names", words: str(k.label), source: `profile:${k.profile}/action_kinds/${k.kind}` });
    return out;
  }

  /* R39, R45, R49: the notices shown once with a draft, never refusing: the election notice (a pending measure or a
     candidate the member marks; the governing view's `legal_facts` of trigger `pending_measure_or_candidate`, its
     citation), the recognition reminder (a kind the view marks `shape: recognition`), and each legal fact whose
     `applies_to` names the kind. */
  static #notices(a, view, marks) {
    const out = [];
    const facts = view && Array.isArray(view.legal_facts) ? view.legal_facts.filter(isObj) : [];
    if (marks.names_pending) {
      const election = facts.filter((f) => f.trigger === "pending_measure_or_candidate");
      /* R52 (T46): `words.json`'s words, read by key, `{fact}` and `{citation}` filled from the legal fact */
      for (const f of election)
        out.push({ kind: "election", key: "filings.election.notice",
                   text: keyed("filings.election.notice", { fact: str(f.statement) || str(f.key) || "The governing view states the rule without words.",
                                                            citation: str(f.citation) || "its citation not stated" }),
                   fact: f.key ?? null, citation: f.citation ?? null, statement: f.statement ?? null, source: `profile:${f.profile}/legal_facts/${f.key}` });
      if (!election.length)
        out.push({ kind: "election", key: "filings.election.notice",
                   text: keyed("filings.election.notice", { fact: "The governing view holds no rule for it.", citation: "its citation undetermined" }),
                   citation: null, says: "the governing view holds no campaign-spending rule, so its citation is undetermined" });
    }
    const entry = view && Array.isArray(view.action_kinds) ? view.action_kinds.find((k) => k.kind === a.kind) : null;
    if (entry && entry.shape === "recognition")
      out.push({ kind: "reminder", key: "recognition.staff_public", text: KEYED["recognition.staff_public"] });
    for (const f of facts)
      if (Array.isArray(f.applies_to) && f.applies_to.includes(a.kind))
        out.push({ kind: "legal_fact", key: f.key ?? null, citation: f.citation ?? null, statement: f.statement ?? null,
                   source: `profile:${f.profile}/legal_facts/${f.key}` });
    return out;
  }

  /* R34, R38, R39, R43, R48: everything an outward text is checked for, over R34's one split of `body` (the text
     without what this module printed first): the record check; the assertion phrasings (R43, the assistant's unioned,
     labelled), own-benefit asks (R38: every text; a chance-to-fix notice's other asks too), position sentences (R39: a
     text prepared as the group's comment or testimony), the staff the assistant names (R48, or that its check did not
     run); `asks` only for a chance-to-fix notice. `form` is `filing`, `communication` or `briefing` (R34 alone). */
  #outward(body, { a, facts, det = null, view = null, marks, textcheck = null, purpose = null, form, viewer }) {
    const sentences = sentencesOf(body);
    const out = { sentences, record_check: this.#recordCheck(sentences, a, facts, marks.own_doing) };
    if (form === "briefing") return out;
    const lang = marks.language;
    const assertion = this.#pointOut(sentences, "assertion", lang, view);
    const ownBenefit = this.#pointOut(sentences, "own_benefit_ask", lang, view);
    out.pointed = {
      assertion, assertion_machine: Filings.#machine(sentences, textcheck, "assertion"),
      own_benefit_ask: Filings.#pointer(ownBenefit, "pointer.selfbenefit"),
      ...(marks.voice === "group" ? { position: Filings.#pointer(this.#pointOut(sentences, "position", lang, view), "pointer.position") } : {}),
      staff_named: textcheck ? Filings.#pointer(Filings.#machine(sentences, textcheck, "staff_named"), "pointer.staff", "items")
        : { items: [], ran: false, key: "pointer.staff.notrun", says: KEYED["pointer.staff.notrun"] },
    };
    if (purpose === "chance_to_fix") {
      const allowed = this.#allowedAsks(det, view, viewer);
      out.asks = sentences.flatMap((s, index) => {
        if (!asks(s)) return [];
        const ok = askAllowed(s, allowed);
        return [ok ? { index, allowed: ok } : { index, pointed: true, says: "this sentence asks for something the standard, a recorded consequence or a profile route does not name" }];
      });
    }
    if (assertion.state !== "read") out.no_list = { key: "phrasing.no_list", text: KEYED["phrasing.no_list"], why: assertion.why ?? null };
    return out;
  }

  /* R38, R39, R48, R52 (T46): each sentence a reading points out answers its pointer, `words.json`'s words read by key
     (`pointer.selfbenefit`, `pointer.position`, `pointer.staff`), beside what the reading answered of it; a reading not
     read (undetermined) is answered as it came. */
  static #pointer(r, key, list = "pointed") {
    if (!isObj(r) || !Array.isArray(r[list])) return r;
    return { ...r, [list]: r[list].map((p) => (isObj(p) ? { ...p, pointer: { key, text: KEYED[key] } } : p)) };
  }

  /* R43: the pointed sentences R19 reads: the phrasing list's and the assistant's, unioned by sentence. */
  static #assertionPointed(o) {
    const list = o.pointed && o.pointed.assertion;
    const machine = (o.pointed && o.pointed.assertion_machine && o.pointed.assertion_machine.items) || [];
    if ((!list || list.state !== "read") && !machine.length) return null;
    const pointed = [...(list && list.state === "read" ? list.pointed || [] : []),
                     ...machine.map((m) => ({ index: m.index, phrase: m.quote, origin: "machine" }))];
    return { state: "read", language: list && list.language, kind: "assertion", pointed };
  }

  /* R34, R38, R40, R43: the approval's refusals over the check of the approved text, in order after R6's own:
     `ASSERTION_RESOLUTION_REFUSED`, `ASSERTION_UNRESOLVED` (R43), `CONTRADICTED_HELD` unless released (R34),
     `SELF_BENEFIT_ASK` (R38), `RFC_QUOTING_MISSING` (R40, R57: `filing-templates`'). Answers `{refusal}` or `{released, resolutions, breach}`. */
  #outwardRefusal(o, { filing, release, resolutions, rfc, body }) {
    const sentences = o.sentences;
    const pointed = Filings.#assertionPointed(o);
    let breach = false, recorded = [];
    if (pointed) {
      const findings = [];
      const res = Array.isArray(resolutions) ? resolutions : resolutions == null ? [] : null;
      const g = this.grammar;
      if (res === null) findings.push({ detail: "resolutions is a list" });
      else if (typeof g.assertionResolutionFindings === "function")
        this.#call(() => g.assertionResolutionFindings({ sentences, pointed, resolutions: res }, findings));
      /* DEC-49 REGION is-assertion-resolution-refused */
      if (findings.length)
        return { refusal: { ok: false, reason: "ASSERTION_RESOLUTION_REFUSED", filing, findings,
                            detail: "a resolution names no pointed sentence, names one twice, or is malformed" } };
      /* END DEC-49 REGION is-assertion-resolution-refused */
      const u = typeof g.assertionsUnresolved === "function" ? this.#call(() => g.assertionsUnresolved({ sentences, pointed, resolutions: res })) : null;
      /* DEC-49 REGION is-assertion-unresolved */
      if (u && Array.isArray(u.unresolved) && u.unresolved.length)
        return { refusal: { ok: false, reason: "ASSERTION_UNRESOLVED", filing,
                            sentences: u.unresolved.map((i) => ({ index: i, text: sentences[i] })),
                            detail: "each sentence pointed out as asserting a breach is resolved: rewritten, said to only ask, or the act treated as a breach claim" } };
      /* END DEC-49 REGION is-assertion-unresolved */
      breach = !!(u && u.breach_claim);
      recorded = res;
    }
    const held = o.record_check.items.filter((i) => i.verdict === "contradicted");
    const rel = Array.isArray(release) ? release : [];
    const released = held.map((h) => rel.find((r) => isObj(r) && r.ord === h.index && typeof r.reason === "string" && r.reason.trim()
                                                    && r.reason.trim().length <= RELEASE_REASON_MAX))
      .filter(Boolean).map((r) => ({ ord: r.ord, reason: r.reason.trim() }));
    /* DEC-49 REGION is-contradicted-held */
    if (released.length < held.length)
      return { refusal: { ok: false, reason: "CONTRADICTED_HELD", filing,
                          sentences: held.filter((h) => !released.some((r) => r.ord === h.index))
                            .map((h) => ({ index: h.index, text: sentences[h.index], contradicted_by: h.contradicted_by ?? null })),
                          detail: "a contradicted sentence is held back unless the approval names it with a reason (release: [{ord, reason}])" } };
    /* END DEC-49 REGION is-contradicted-held */
    const own = o.pointed && o.pointed.own_benefit_ask && o.pointed.own_benefit_ask.state === "read" ? o.pointed.own_benefit_ask.pointed || [] : [];
    /* DEC-49 REGION is-self-benefit-ask */
    if (own.length)
      return { refusal: { ok: false, reason: "SELF_BENEFIT_ASK", filing,
                          sentences: [...new Set(own.map((p) => p.index))].map((i) => ({ index: i, text: sentences[i] })),
                          detail: "rewrite each sentence that asks for the benefit of the group or its members; there is no override" } };
    /* END DEC-49 REGION is-self-benefit-ask */
    /* R57: the check is `filing-templates`' one (its R33), asked on the approved text and answered with its row */
    const unquoted = rfc ? rfcQuotingRefusal(String(body ?? ""), { filing }) : null;
    if (unquoted) return { refusal: unquoted };
    return { released, resolutions: recorded, breach };
  }

  /* R43: a `breach_claim` resolution makes the action a breach action through `actions`' revision: its `bundle.md`
     promoted with `breach: true` under a short lease, so `actions`' step judges it (its R1, R8's gate) and its refusals
     pass through as they came. An action already a breach action is left as it is. */
  #breachRevision(id, who, viewer, when) {
    const lease = this.record.acquireLease(id, who, 30000);
    if (!lease || !lease.ok)
      return { ok: false, reason: "LEASE_HELD", target: id, detail: "another member is writing to this action right now; nothing was approved" };
    try {
      const f = this.record.readFile(id, "bundle.md");
      if (!f || typeof f.text !== "string") return { ok: false, reason: "NO_DOCUMENT", target: id, detail: "the action has no readable bundle.md" };
      const lines = f.text.split("\n");
      const end = lines[0] === "---" ? lines.indexOf("---", 1) : -1;
      if (end === -1) return { ok: false, reason: "NO_DOCUMENT", target: id, detail: "the action's bundle.md has no front matter" };
      const at = lines.findIndex((l, i) => i > 0 && i < end && /^breach:/.test(l));
      if (at >= 0) lines[at] = "breach: true"; else lines.splice(end, 0, "breach: true");
      const li = lines.findIndex((l, i) => i > 0 && i < lines.indexOf("---", 1) && /^last_updated:/.test(l));
      if (li >= 0) lines[li] = `last_updated: "${when}"`;
      const text = lines.join("\n");
      let fm = {};
      try { fm = parseFrontmatter(text).data || {}; } catch { fm = {}; }
      const carried = [];
      for (const path of this.record.livePaths(id) || []) {
        if (path === "bundle.md") continue;
        const c = this.record.readFile(id, path);
        if (c) carried.push(typeof c.text === "string" ? { path, text: c.text } : { path, blobSha: c.blobSha, sha256: c.sha256, bytes: c.bytes });
      }
      const head = this.record.head(id);
      const p = this.promotion.promote({ bundleId: id, base: head ? head.bundleSha : null,
        snapKey: `${when.replace(/[-:]/g, "")}_breach`, author: who, viewer: viewer ?? who,
        files: [{ path: "bundle.md", text }, ...carried],
        meta: { object_type: fm.object_type ?? "action", title: fm.title, current_state: head ? head.currentState : fm.current_state,
                prior_state: fm.prior_state ?? null, created: fm.created, last_updated: when } });
      return p && p.ok ? { ok: true } : { ...(p || { ok: false, reason: "PROMOTION_FAILED" }), target: id };
    } finally {
      try { this.record.releaseLease(id, who); } catch { /* record-core never throws here */ }
    }
  }

  /* R44: a text prepared as the member's own notes is not the group's act: never approved or recorded as sent. */
  static #notTheGroups(d) {
    const marks = parse(d.marks) || {};
    /* DEC-49 REGION is-not-the-groups-act */
    if (marks.voice === "self")
      return { ok: false, reason: "NOT_THE_GROUPS_ACT", filing: d.filing_id, voice: "self",
               detail: "prepared as yourself: your own notes are never approved, stamped or recorded as the group's act" };
    /* END DEC-49 REGION is-not-the-groups-act */
    return null;
  }

  /* R44, R52 (T46): whose act a text is, in `words.json`'s words read by key: the voice's name (`voice.group`,
     `voice.self`) and what it means (`voice.group.means`; `voice.self.means`, in place of T45's `filings.voice.self`),
     answered for a text whose voice the member stated; none for a text stating none. */
  static #voiceSays(voice) {
    if (voice !== "group" && voice !== "self") return {};
    return { voice_says: { key: `voice.${voice}.means`, text: KEYED[`voice.${voice}.means`],
                           voice: { key: `voice.${voice}`, text: KEYED[`voice.${voice}`] } } };
  }

  /* R40, R37: whether a text is a request for comment: an action of the product kind `request_for_comment`, or a
     documenting version for the violating party. */
  static #isRfc(a, marks, purpose) {
    return a.kind === "request_for_comment" || (purpose === "document_infraction" && marks.audience === "violating_party");
  }

  /* R46: a press action's review-copy line (actions R79's terms, as its read answers them), or null for an action that
     is not a press action. */
  static #reviewCopy(a) {
    const press = isObj(a.counterparty) && a.counterparty.kind === "press";
    if (!press) return null;
    const t = a.press_terms;
    const embargo = t && str(t.embargo_until), release = t && str(t.release_at);
    if (!embargo && !release) return { embargo_until: null, release_at: null, key: "filings.review_copy.no_embargo", text: KEYED["filings.review_copy.no_embargo"] };
    return { embargo_until: embargo, release_at: release, key: "filings.review_copy.terms",
             text: keyed("filings.review_copy.terms", { embargo: embargo ?? "a time not stated", release: release ?? "a time not stated" }) };
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

  /* R34, R43: the approved text without what this module printed first on the draft (a disclosure, an advisory, the
     not-written-for statement, a review copy's line), each removed only where it still opens the text as printed. */
  static #content(body, printed) {
    let t = body;
    for (const p of Array.isArray(printed) ? printed : []) {
      if (typeof p === "string" && p && t.startsWith(p)) t = t.slice(p.length).replace(/^\n+/, "");
    }
    return t;
  }

  /** R6, R22, R24, R34, R36, R38, R40, R43, R44, R46: a member approves the draft's text or an edited text, at most once;
   *  the approved text is the member's. Its check is run again on the approved text: an assertion pointed out is
   *  resolved (`resolutions`), a contradicted sentence released by name with a reason (`release`), an own-benefit ask
   *  rewritten, a request for comment keeps its quoting sentence. The approved bytes carry R24's disclosure first where
   *  the draft did, and the in-band quartet with the group's public fields (R22), a press review copy's times in its
   *  subject (R46). A `breach_claim` resolution makes the action a breach action (R43). */
  async filingApprove({ filing = null, text = undefined, release = null, resolutions = null, textcheck = null, author = null,
                        viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-filing-approve */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_APPROVE",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: a machine prepares, and a member approves`
                           : "no member is named as the one approving" };
    const d = this.#draft(filing, viewer);
    if (!d) return this.#noFiling(filing);
    const self = Filings.#notTheGroups(d);
    if (self) return self;
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
    /* T45: the check of the approved text (R34, R38, R39, R43, R48), the marks stated at preparation, and the
       assistant's sentences handed in now (or those handed in at preparation) */
    const marks = parse(d.marks) || {};
    const tc = textcheck != null ? Filings.#marks({ textcheck }) : { ok: true, textcheck: marks.textcheck ?? null };
    if (!tc.ok) return tc;
    const a = this.#action(d.action_id, viewer);
    const { det } = this.#restsOn(a, viewer);
    const v = this.#view();
    const fromFacts = (Array.isArray(marks.from) ? marks.from : []).map((id) => this.#findingRead(id, viewer)).filter(Boolean);
    const matters = this.#matterFacts(a, det, viewer).facts;
    const content = Filings.#content(body, marks.printed);
    const checked = this.#outward(content, { a, facts: [...matters, ...fromFacts], det, view: v.view,
      marks: { voice: marks.voice ?? null, audience: marks.audience ?? null, language: marks.language ?? null,
               own_doing: Array.isArray(marks.own_doing) ? marks.own_doing : [], names_pending: marks.names_pending === true },
      textcheck: tc.textcheck, purpose: d.purpose ?? null, form: d.form, viewer });
    const gate = this.#outwardRefusal(checked, { filing: d.filing_id, release, resolutions, rfc: marks.rfc === true, body });
    if (gate.refusal) return gate.refusal;
    const at = this.#when();
    if (gate.breach && !a.breach) {
      const r = this.#breachRevision(a.id, who, viewer, at);
      if (!r.ok) return r;
    }
    const sha = sha256HexSync(body);
    const face = d.disclosure && !body.startsWith(d.disclosure) ? `${d.disclosure}\n\n${body}` : body;
    const review = isObj(marks.review_copy) ? marks.review_copy : null;
    const { bytes, inband } = await this.#stamped(face, {
      what: `the approved ${d.form === "communication" ? "communication" : "filing"} ${d.filing_id}`, date: at, author: who,
      project: (parse(d.basis) || {}).project ?? null, review });
    const again = this.#alreadyApproved(d.filing_id);
    if (again) return again;
    const record = { check: checked, released: gate.released, resolutions: gate.resolutions, breach_claim: gate.breach };
    this.sql.exec(`INSERT INTO filing_approvals (filing_id, action_id, text, sha, approved_by, at, inband, outward, body_sha)
                   VALUES (?,?,?,?,?,?,?,?,?)`, d.filing_id, d.action_id, body, sha, who, at, json(inband), json(record), sha);
    return { ok: true, filing: d.filing_id, action: d.action_id, form: d.form, approved_by: who, at, sha, body_sha: sha,
             edited: body !== d.text, bytes, inband, disclosure: d.disclosure ?? null,
             check: checked, released: gate.released, resolutions: gate.resolutions, ...(gate.breach ? { breach_claim: true } : {}),
             ...(checked.no_list ? { no_list: checked.no_list } : {}),
             says: "approved by the member named: the text is theirs. Your group's Civicsmith transmits nothing; a member files it "
                 + "by the venue's own means and records that it was sent" };
  }

  /* ---------------------------------------------------------------- R59: filingRead */

  /** R59 (T48; N1034, K3145): one prepared draft or communication as it was stored, so a reload between preparing and
   *  approving loses nothing: its text, blanks with their sources, unfilled blanks with why, the member's own fills
   *  (R55, each labelled the member's), template (R29), advisory and offers (R4, R58), notices, label (R5) and action,
   *  beside its approval (R6), second approval (R42) and sending (R7) when recorded. Nothing is filled again from the
   *  record and nothing is written; a draft that is absent, or whose action or basis the viewer may not see (R13, R27),
   *  is `NO_SUCH_FILING`, one answer. */
  filingRead({ filing = null, viewer = null } = {}) {
    const d = this.#draft(filing, viewer);
    if (!d) return this.#noFiling(filing);
    const comm = d.form === "communication";
    const marks = parse(d.marks) || {};
    const { notices = [], ...checked } = parse(d.outward) || {};
    const blanks = comm ? (Array.isArray(marks.blanks) ? marks.blanks : []) : (parse(d.blanks) || []);
    const own = (b) => isObj(b) && isObj(b.label) && b.label.kind === "member_fill";
    const ap = this.#one(`SELECT approved_by, at, sha, text FROM filing_approvals WHERE filing_id=?`, d.filing_id);
    const second = this.#one(`SELECT approved_by, at FROM filing_second_approvals WHERE filing_id=?`, d.filing_id);
    const sent = this.#one(`SELECT ord, sent_on, recorded_by, recorded_at, review_copy, reference FROM filing_sendings WHERE filing_id=?`, d.filing_id);
    const review = isObj(marks.review_copy) ? marks.review_copy : null;
    return {
      ok: true, id: d.filing_id, filing: d.filing_id, action: d.action_id, form: d.form,
      ...(comm ? { purpose: d.purpose } : { tier: d.tier, venue: parse(d.venue) }),
      text: d.text, blanks, unfilled: comm ? [] : (parse(d.unfilled) || []), fills: blanks.filter(own),
      template: comm ? null : parse(d.template),
      ...(!comm && d.tier === 2 ? { advisory: d.advisory ?? null, offers: COUNSEL_OFFER } : {}),
      disclosure: d.disclosure ?? null, notices,
      outward: checked,
      marks: { voice: marks.voice ?? null, audience: marks.audience ?? null, language: marks.language ?? null,
               own_doing: Array.isArray(marks.own_doing) ? marks.own_doing : [], names_pending: marks.names_pending === true },
      ...(review ? { review_copy: review } : {}),
      ...Filings.#voiceSays(marks.voice ?? null),
      label: proposalLabel(d.preparer, comm ? "communication" : "filing_draft"), prepared_by: d.preparer, at: d.prepared_at,
      approval: ap ? { approved_by: ap.approved_by, at: ap.at, sha: ap.sha, text: ap.text } : null,
      second_approval: second ? { approved_by: second.approved_by, at: second.at, given: Filings.#secondGiven(second.approved_by, second.at) } : null,
      sending: sent ? { ord: sent.ord, sent_on: sent.sent_on, recorded_by: sent.recorded_by, at: sent.recorded_at, reference: sent.reference ?? null,
                        ...(sent.review_copy ? { review_copy: parse(sent.review_copy) } : {}) } : null,
      evidence: false,
      ...(ap ? {} : { says: DRAFT_SAYS }),
    };
  }

  /* ---------------------------------------------------------------- R7: filingRecordSent */

  /** R7: records the sending as one `sent` correspondence entry on the action (actions R15, R16), linked to the draft
   *  both ways. It moves no action state and writes no clock entry: `proposed` carries what a member may choose. */
  filingRecordSent({ filing = null, at = null, medium = null, artifactSha = null, account = null, reference = null, author = null,
                     viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-filing-sent */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_FILE",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: only a member files and records it`
                           : "no member is named as the one who sent it" };
    const d = this.#draft(filing, viewer);
    if (!d) return this.#noFiling(filing);
    const self = Filings.#notTheGroups(d);
    if (self) return self;
    if (!this.#one(`SELECT 1 AS x FROM filing_approvals WHERE filing_id=?`, d.filing_id))
      return { ok: false, reason: "NOT_APPROVED", filing: d.filing_id, detail: "a member approves the draft before it is recorded as sent" };
    const sent = this.#one(`SELECT ord, sent_on, recorded_by FROM filing_sendings WHERE filing_id=?`, d.filing_id);
    if (sent) return { ok: false, reason: "ALREADY_SENT", filing: d.filing_id, ord: sent.ord, at: sent.sent_on,
                       recorded_by: sent.recorded_by, detail: "this draft is already recorded as sent" };
    /* R42: where the project names this act as needing a second member's approval, it is sent only once one is recorded */
    const second = this.#secondNeeded(d, viewer);
    if (second.needed && !this.#one(`SELECT 1 AS x FROM filing_second_approvals WHERE filing_id=?`, d.filing_id))
      return { ok: false, reason: "SECOND_APPROVAL_NEEDED", filing: d.filing_id, matched: second.matched,
               detail: "your project asks a second member to approve this act (op=filingsecondapprove) before it is sent" };
    /* END DEC-49 REGION is-filing-sent */
    /* R54 (T47; DEC-209 (4)): the venue's own number for the sending (a portal's request number), as the member gives it:
       one line of 1 to 100 characters (code points), kept as written; asked before actions is written to */
    const ref = reference == null ? null : reference;
    /* DEC-49 REGION is-sent-reference-malformed */
    if (ref !== null && (typeof ref !== "string" || !ref.trim() || [...ref].length > SENT_REFERENCE_MAX || /[\r\n\u2028\u2029]/.test(ref)
                         || WELL_FORMED.test(ref)))
      return { ok: false, reason: "SENT_REFERENCE_MALFORMED", filing: d.filing_id, max: SENT_REFERENCE_MAX,
               detail: `the venue's reference is one line of 1 to ${SENT_REFERENCE_MAX} characters, as the venue gave it` };
    /* END DEC-49 REGION is-sent-reference-malformed */
    if (!this.actions || typeof this.actions.actionCorrespond !== "function")
      return this.#noAction(d.action_id);
    const now = this.#when();
    /* R46: a press review copy recorded sent before its release time is recorded as the review copy, saying so */
    const review = isObj((parse(d.marks) || {}).review_copy) ? parse(d.marks).review_copy : null;
    const asReview = review && str(review.release_at) && String(at ?? "") < str(review.release_at)
      ? { review_copy: true, release_at: review.release_at, says: `recorded as the review copy: sent before its release time, ${review.release_at}` } : null;
    const out = this.record.transact(() => {
      const c = this.actions.actionCorrespond({ target: d.action_id, direction: "sent", at,
        ...(medium != null ? { medium } : {}), ...(artifactSha != null ? { artifactSha } : {}),
        ...(account != null ? { account } : {}), viewer, author: who });
      if (!c || c.ok === false) return c || this.#noAction(d.action_id);
      const ord = Number.isInteger(Number(c.ord)) ? Number(c.ord) : null;
      this.sql.exec(`INSERT INTO filing_sendings (filing_id, action_id, ord, sent_on, medium, artifact_sha, account,
                       recorded_by, recorded_at, review_copy, reference) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        d.filing_id, d.action_id, ord, String(at ?? ""), medium, artifactSha, account, who, now, asReview ? json(asReview) : null, ref);
      return { ok: true, ord, entry: c };
    });
    if (!out || out.ok === false) return out;
    return { ok: true, filing: d.filing_id, action: d.action_id, ord: out.ord, recorded_by: who, at: now,
             held_as: out.entry.held_as ?? (artifactSha ? "capture" : "testimony"),
             reference: ref, proposed: this.#proposed(d, who, viewer), ...(asReview ? { review_copy: asReview } : {}),
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

  /* ---------------------------------------------------------------- T45: R36, R41, R42, R47 */

  /* R42: whether the action's project names this act as needing a second member's approval
     (`project-roster.secondApprovalNeeded`, its R24): by the action's kind, the draft's governing tier, and whether it
     is public (a text for the public or broadly, or the group's own comment or testimony). With no project or no module
     answering, one approval sends. `read` is the action as the plane reads it, when the caller has read it already
     (R50: `filingsFor` reads it once for every draft it lists). */
  #secondNeeded(d, viewer, read = undefined) {
    const roster = this.projectRoster;
    const a = read !== undefined ? read : this.#action(d.action_id, MACHINE_READER);
    const project = (a && a.project) || (parse(d.basis) || {}).project || null;
    if (!a || !project || !roster || typeof roster.secondApprovalNeeded !== "function") return { needed: false, matched: [] };
    const marks = parse(d.marks) || {};
    const tier = Number.isInteger(d.tier) ? d.tier : this.governingTier(a).tier;
    const r = this.#call(() => roster.secondApprovalNeeded({ projectId: project, kind: a.kind, tier,
      public: ["public", "broad"].includes(marks.audience) || marks.voice === "group" }));
    return isObj(r) && r.needed === true ? { needed: true, matched: Array.isArray(r.matched) ? r.matched : [] } : { needed: false, matched: [] };
  }

  /** R42: a second member's approval of an approved draft, by a member other than the approver; at most one. */
  filingSecondApprove({ filing = null, author = null, viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-second-approve */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_APPROVE",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: a member approves` : "no member is named as the one approving" };
    const d = this.#draft(filing, viewer);
    if (!d) return this.#noFiling(filing);
    const ap = this.#one(`SELECT approved_by FROM filing_approvals WHERE filing_id=?`, d.filing_id);
    if (!ap) return { ok: false, reason: "NOT_APPROVED", filing: d.filing_id, detail: "a member approves the draft before a second member does" };
    if (ap.approved_by === who)
      return { ok: false, reason: "SAME_APPROVER", filing: d.filing_id, approved_by: who,
               detail: "the second approval is made by a member other than the one who approved the text" };
    /* END DEC-49 REGION is-second-approve */
    const held = this.#one(`SELECT approved_by, at FROM filing_second_approvals WHERE filing_id=?`, d.filing_id);
    if (held) return { ok: false, reason: "ALREADY_APPROVED", filing: d.filing_id, approved_by: held.approved_by, at: held.at,
                       detail: "a second member has already approved this draft, and that approval stands" };
    const at = this.#when();
    this.sql.exec(`INSERT INTO filing_second_approvals (filing_id, action_id, approved_by, at) VALUES (?,?,?,?)`, d.filing_id, d.action_id, who, at);
    return { ok: true, filing: d.filing_id, action: d.action_id, second_approved_by: who, at, approved_by: ap.approved_by,
             given: Filings.#secondGiven(who, at),
             says: "approved a second time by the member named; a member records the sending by their own hand" };
  }

  /* R42, R52 (T46): the sentence a recorded second approval answers, `words.json`'s `filings.secondapproval.given` read by
     key, `{member}` and `{date}` (the day of its instant) filled from the record. */
  static #secondGiven(member, at) {
    return { key: "filings.secondapproval.given",
             text: keyed("filings.secondapproval.given", { member, date: String(at ?? "").slice(0, 10) || "a date not stated" }) };
  }

  /** R36: a member records that a partner organisation approved the same text in its own copy, by its own act:
   *  `body_sha` the approved text's fingerprint (SHA-256 over the text without the per-group fields, R22). */
  jointSignatory({ filing = null, organisation = null, body_sha = null, account = null, author = null, viewer = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-joint-signatory */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_APPROVE",
               detail: who ? `'${who.slice(0, 60)}' is a machine identity: a member records a partner's signature` : "no member is named" };
    const d = this.#draft(filing, viewer);
    if (!d) return this.#noFiling(filing);
    const ap = this.#one(`SELECT sha, body_sha FROM filing_approvals WHERE filing_id=?`, d.filing_id);
    if (!ap) return { ok: false, reason: "NOT_APPROVED", filing: d.filing_id, detail: "a joint text is approved here before a partner's signature is recorded" };
    const a = this.#action(d.action_id, viewer);
    const org = str(organisation);
    const partner = a && org ? a.partners.find((p) => str(p.organisation) === org) : null;
    if (!partner)
      return { ok: false, reason: "NOT_A_PARTNER", filing: d.filing_id, organisation: org,
               partners: a ? a.partners.map((p) => p.organisation) : [], detail: "the organisation is not among the action's partners" };
    const fp = ap.body_sha || ap.sha;
    if (str(body_sha) !== fp)
      return { ok: false, reason: "JOINT_FINGERPRINT_MISMATCH", filing: d.filing_id, organisation: org, body_sha: fp,
               detail: "the partner's text has another fingerprint: the same text was not approved" };
    /* END DEC-49 REGION is-joint-signatory */
    const how = typeof account === "string" ? account.trim() : "";
    if (!how || how.length > ACCOUNT_MAX || /[\r\n]/.test(how))
      return { ok: false, reason: "FILING_MARK_REFUSED", field: "account", detail: `say how the partner's act is known, on one line of at most ${ACCOUNT_MAX} characters` };
    if (this.#one(`SELECT 1 AS x FROM joint_signatories WHERE filing_id=? AND organisation=?`, d.filing_id, org))
      return { ok: false, reason: "ALREADY_APPROVED", filing: d.filing_id, organisation: org, detail: "this partner's signature is already recorded" };
    const at = this.#when();
    this.sql.exec(`INSERT INTO joint_signatories (filing_id, action_id, organisation, role, body_sha, account, recorded_by, at)
                   VALUES (?,?,?,?,?,?,?,?)`, d.filing_id, d.action_id, org, str(partner.role), fp, how, who, at);
    return { ok: true, filing: d.filing_id, action: d.action_id, organisation: org, role: str(partner.role), body_sha: fp, account: how,
             recorded_by: who, at, says: "the partner approved the same text in its own copy, by its own act; no shared plan is made" };
  }

  /** R47 (Actions v0.2 rule 12): for a hold in place (`action-holds` R2, at an action, an entry or a project), a plain
   *  notice telling members what to keep outside Civicsmith: the place, the reason as stated, the date and what kinds
   *  of material to keep, assembled from the record and labelled as R5's drafts. It names no member as a recipient and
   *  records nothing of any member's compliance; a member sends it by their own hand and records it (`action-holds`
   *  R11). `HOLD_NOT_IN_PLACE` passed through. */
  holdNoticePrepare({ place = null, preparer = null, viewer = null } = {}) {
    const who = str(preparer);
    /* DEC-49 REGION is-hold-notice-prepare */
    if (!who) return { ok: false, reason: "FILING_NO_PREPARER", detail: "no stamped preparer: a notice names who prepared it" };
    /* END DEC-49 REGION is-hold-notice-prepare */
    const h = this.actionHolds;
    const p = isObj(place) ? { ...(str(place.target) ? { target: str(place.target) } : {}),
                               ...(Number.isInteger(place.ord) ? { ord: place.ord } : {}),
                               ...(str(place.project) ? { project: str(place.project) } : {}) } : {};
    if (!h || typeof h.holdsOf !== "function")
      return { ...holdNotInPlace(p), why: "no module answers holds here, so no hold is read as in place" };
    const r = this.#call(() => h.holdsOf({ ...p, viewer }));
    if (!r || r.ok === false) return r || { ...holdNotInPlace(p), why: "the hold could not be read" };
    const list = Array.isArray(r.statements) ? r.statements : Array.isArray(r.holds) ? r.holds : Array.isArray(r.items) ? r.items : [];
    const latest = list.length ? list[list.length - 1] : null;
    if (!latest || latest.hold !== "in_place")
      return holdNotInPlace(p);
    const where = p.project ? `the project ${p.project}` : Number.isInteger(p.ord) ? `entry ${p.ord} of the action ${p.target}` : `the action ${p.target}`;
    const kinds = "documents, letters and emails, messages, notes, recordings, photographs and files, in any form and on any device";
    const lines = [
      "Litigation hold notice.",
      `A hold is in place on ${where}, since ${latest.at ?? "a date the record does not state"}.`,
      `The reason, as stated: ${latest.reason ?? "no reason is recorded"}.`,
      `Keep, outside Civicsmith, every ${kinds} that concern it. Do not delete, alter or discard any of them until a member tells you the hold is released.`,
    ];
    const sources = [{ part: "the place", source: p.project || p.target }, { part: "the reason and the date", source: `hold:${p.project || p.target}${Number.isInteger(p.ord) ? `#${p.ord}` : ""}` }];
    const at = this.#when();
    const text = lines.join("\n");
    return this.record.transact(() => {
      const { id } = this.record.allocId("HLN", at.slice(0, 4));
      this.sql.exec(`INSERT INTO filing_hold_notices (notice_id, action_id, place, text, sources, preparer, prepared_at) VALUES (?,?,?,?,?,?,?)`,
                    id, p.target ?? null, json(p), text, json(sources), who, at);
      return { ok: true, id, place: p, text, sources, label: proposalLabel(who, "communication"), prepared_by: who, at, evidence: false,
               says: "a notice prepared from the record: it names no recipient and records no one's compliance; a member sends it "
                   + "by their own hand and records the sending (op=holdnoticesent)" };
    });
  }

  /** R41 (Actions v0.2 rule 11): templates are offered only after the act is chosen: the offered `file` versions
   *  (`filing-templates` R14, R25) for this action's kind at a governing tier of 1 or 2, latest first. It takes an
   *  action, never a kind alone, and lists no kind or template as a suggestion of what to do. */
  templatesForAction({ action = null, viewer = null } = {}) {
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    const gov = this.governingTier(a);
    if (gov.tier !== 1 && gov.tier !== 2)
      return { ok: true, action: a.id, kind: a.kind, governing: gov, versions: [],
               says: gov.tier === 3 ? "the governing tier is 3: no file template is offered; counsel is briefed by a counsel packet"
                 : "the governing tier is undetermined: a member states it first, and no template is offered until then" };
    const t = this.filingTemplates;
    const list = t && typeof t.templatesFor === "function" ? this.#call(() => t.templatesFor({ kind: a.kind, use: "file", viewer })) : null;
    if (!list || list.ok === false)
      return { ok: true, action: a.id, kind: a.kind, governing: gov, versions: [], read: false,
               says: "the group's templates could not be read here, so none is offered" };
    const versions = list.templates.filter((x) => (x.use ?? "file") === "file")
      .flatMap((x) => (x.versions || []).map((y) => ({ template: x.id, name: x.name ?? null, origin: x.origin ?? null, profiles: x.profiles ?? null,
                                                       version: y.version ?? null, number: y.number ?? null, state: y.state ?? null,
                                                       approved_at: y.approved ? y.approved.at ?? null : y.approved_at ?? null,
                                                       ...(y.default ? { default: true } : {}) })))
      .sort((p, q) => String(q.approved_at ?? "").localeCompare(String(p.approved_at ?? "")) || Number(q.number ?? 0) - Number(p.number ?? 0));
    return { ok: true, action: a.id, kind: a.kind, governing: gov, versions, ...(list.truncated ? { truncated: true } : {}),
             says: "the file templates offered for this action's kind, latest first" };
  }

  /* ---------------------------------------------------------------- R8–R12: the counsel packet */

  /* R9's facts: the finding at its pinned bytes (record-core R60): its question, its conclusion and its citations, and
     the entity it concerns (its own `subject_entity`, R33's set). Only a finding `#det` kept is asked (R27: one withheld
     is no item). */
  #fact(f, live = undefined) {
    const source = f.case ? `${f.id}@${f.case ?? "?"}/${f.edition ?? "?"}` : f.id;
    const text = live !== undefined ? live : f.version_sha ? this.#call(() => this.record.textAtSha(f.id, f.version_sha)) : null;
    /* T45 (R9, R34, R35): the kind of finding it is, as conformance's per-finding `basis` holds it (its R9, R31, R32):
       published, checked for publication and held, or accepted from another group; a finding a determination holds
       before T45 is published (conformance R2 admitted no other) */
    const kind = f.kind ?? (isObj(f.basis) && ["checked_held", "accepted"].includes(f.basis.kind) ? f.basis.kind : "published");
    const base = { finding: f.id, case: f.case ?? null, edition: f.edition ?? null, version_sha: f.version_sha ?? null, kind,
                   ...(isObj(f.basis) && f.basis.kind === "accepted" ? { accepted: { group: f.basis.group ?? null, edition_date: f.basis.edition_date ?? null,
                                                                                     accepted_at: f.basis.accepted_at ?? null } } : {}),
                   ...(f.grade ? { grade: f.grade } : {}), source };
    if (typeof text !== "string")
      return { ...base, claim: { state: "undetermined", why: "the finding's published bytes are not held here as text" }, citations: [] };
    let fm = null;
    try { fm = parseFrontmatter(text).data; } catch { fm = null; }
    const m = /\n## Conclusion\s*\n([\s\S]*?)(?=\n## |\s*$)/.exec(text);
    const conclusion = m && m[1].trim() ? m[1].trim() : null;
    const legs = fm && Array.isArray(fm.basis) ? fm.basis.filter(isObj) : [];
    return { ...base, ...(str(fm && fm.subject_entity) ? { subject_entity: str(fm.subject_entity) } : {}),
             claim: { question: str(fm && fm.title), conclusion,
                      ...(conclusion ? {} : { conclusion_why: "the published finding states no conclusion section" }) },
             citations: legs.map((l) => ({ target: str(l.target), ...(str(l.content_id) ? { content_id: str(l.content_id) } : {}),
                                           ...(l.target_edition != null ? { edition: l.target_edition } : {}),
                                           ...(str(l.role) ? { role: str(l.role) } : {}), source })) };
  }

  /* R9 (T45), R23, R34: one finding or inquiry as it stands, read only when `viewer` may see it (`content.sees`, its
     R37; null otherwise): at its latest published edition (case, edition, pinned bytes, the pair that edition froze) as
     `publication.publishedEditionsOf` answers it (its R37), or, never published, at its live bytes with the grade
     `strength.inquiryStrength` answers (its R6), its kind `unpublished`, or `checked_held` when a held check names it
     (case-check R3; K2858), read at the version that check pins. */
  #findingRead(id, viewer) {
    const c = this.content;
    const target = str(id);
    if (!target || !c || typeof c.sees !== "function" || this.#call(() => c.sees(target, viewer)) !== true) return null;
    const info = this.#call(() => this.record.bundleInfo(target));
    if (!info || info.type !== "inquiry") return null;
    const e = this.publication && typeof this.publication.publishedEditionsOf === "function"
      ? this.#call(() => this.publication.publishedEditionsOf({ finding: target })) : null;
    const last = e && e.ok && e.items.length ? e.items[e.items.length - 1] : null;
    if (last)
      return this.#fact({ id: target, case: last.case, edition: last.edition, version_sha: last.version_sha, kind: "published",
                          grade: last.strength ? { pair: last.strength, source: `${target}@${last.case}/${last.edition}` }
                            : { state: "undetermined", why: "the edition states no frozen pair" } });
    /* checked for publication and held (case-check R3): read at the version the latest held check pins */
    const cc = this.caseCheck;
    const held = cc && typeof cc.heldFindingVersions === "function" ? this.#call(() => cc.heldFindingVersions({ finding: target })) : null;
    const h = held && held.ok !== false && Array.isArray(held.items) && held.items.length ? held.items[held.items.length - 1] : null;
    const f = this.#call(() => this.record.readFile(target, "bundle.md"));
    const s = this.strength && typeof this.strength.inquiryStrength === "function"
      ? this.#call(() => this.strength.inquiryStrength({ id: target, viewer })) : null;
    const grade = s && s.ok !== false && (s.capture || s.connection)
      ? { pair: { capture: s.capture ?? null, connection: s.connection ?? null }, source: `strength:${target}` }
      : { state: "undetermined", why: "the finding's grade could not be read" };
    if (h) {
      const pinned = h.version_sha ? this.#call(() => this.record.textAtSha(target, h.version_sha)) : null;
      return { ...this.#fact({ id: target, kind: "checked_held", version_sha: h.version_sha ?? null, grade },
                             typeof pinned === "string" ? pinned : f && typeof f.text === "string" ? f.text : null),
               held: { case: h.case, edition: h.edition, check: h.check, checked_at: h.checked_at, source: `check:${h.check}` } };
    }
    return this.#fact({ id: target, kind: "unpublished", grade }, f && typeof f.text === "string" ? f.text : null);
  }

  /* R9 (T45; K2858): another group's finding a leg names, accepted by this group (`accepted-work.acceptedFinding`, its
     R2, as `viewer` may see it, with an acceptance in force), its kind `accepted`, its grade the pair the source edition
     publishes; null otherwise. */
  #acceptedRead(ref, edition, viewer) {
    const w = this.acceptedWork;
    if (!str(ref) || !w || typeof w.acceptedFinding !== "function") return null;
    const r = this.#call(() => w.acceptedFinding({ ref: str(ref), edition, viewer }));
    if (!isObj(r) || r.absent || r.unreadable || !isObj(r.acceptance)) return null;
    return { finding: str(ref), case: r.case ?? null, edition: r.edition ?? edition ?? null, version_sha: null, kind: "accepted",
             accepted: { group: r.group ?? null, import: r.import ?? null, accepted_at: r.acceptance.at ?? null, accepted_by: r.acceptance.by ?? null },
             grade: r.pair ? { pair: r.pair, source: `accepted:${r.import ?? ref}` } : { state: "undetermined", why: "the source edition states no pair" },
             claim: { question: null, conclusion: str(r.result) || null }, citations: [], source: `accepted:${str(ref)}${r.edition != null ? `@${r.edition}` : ""}` };
  }

  /* R9 (T45; Actions D9, v0.2 rule 12): each matter the action rests on, its support as it stands: with a live
     determination, its findings (as R9 had them), each with its kind; with none, each inquiry an `action_basis` leg
     names (rests on or advances), with the findings its own legs name, each with its kind and grade, stated as not
     determined. What the viewer may not see is left out (R27). */
  #matterFacts(a, det, viewer) {
    if (det) return { facts: det.findings.map((f) => this.#fact(f)), determined: true };
    const facts = [];
    for (const l of a.legs) {
      if (l.kind && !["rests_on", "advances"].includes(l.kind)) continue;
      const inq = this.#findingRead(l.target, viewer);
      if (!inq) continue;
      facts.push({ ...inq, matter: inq.finding, determined: false, says: "not determined: no member has made a determination on it" });
      for (const c of inq.citations || []) {
        const f = c.target && c.target !== inq.finding
          ? this.#findingRead(c.target, viewer) || this.#acceptedRead(c.target, c.edition ?? null, viewer) : null;
        if (f && !facts.some((x) => x.finding === f.finding))
          facts.push({ ...f, matter: inq.finding, determined: false, says: "a finding the inquiry holds, not determined" });
      }
    }
    return { facts, determined: false };
  }

  /* R9, R25: the captures a draft or packet rests on: each a fact's citation cites, each piece of evidence the act
     names, each artifact the action's correspondence holds and each capture attesting an event of R33's chronology
     (as `events.readEvent` answers it to the reader, its R26), with the source that cites it. */
  #citesOf(a, det, facts, events = []) {
    const cites = [];
    for (const f of facts) for (const c of f.citations || []) cites.push({ content_id: c.content_id, target: c.content_id ? null : c.target, source: f.source });
    const act = det ? det.act || {} : {};
    for (const cid of Array.isArray(act.evidence) ? act.evidence : []) cites.push({ content_id: str(cid), source: det.id });
    for (const [i, e] of a.correspondence.entries())
      if (str(e.artifact_sha)) cites.push({ capture_sha: str(e.artifact_sha), source: `${a.id}#${Number.isInteger(e.ord) ? e.ord : i}` });
    for (const ev of events) for (const sha of ev.captures) cites.push({ capture_sha: sha, source: ev.event_id });
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
  #deadlines(v, a, det, viewer, defence = false) {
    /* T45 (R9; jurisdictions R87 (c)): a deadline marked `defends: true` is a defence deadline, set out only in a defence
       packet's own section; every other deadline applying to `claim` is a claim deadline */
    const rules = v.view && Array.isArray(v.view.deadlines)
      ? v.view.deadlines.filter((r) => (defence ? r.defends === true : r.applies_to === "claim" && r.defends !== true)) : [];
    const entries = a.correspondence.map((e, i) => ({ ...e, ord: Number.isInteger(e.ord) ? e.ord : i }));
    const first = (dir) => entries.filter((e) => e.direction === dir && realDate(String(e.at ?? "").slice(0, 10)))
      .sort((x, y) => (String(x.at) < String(y.at) ? -1 : String(x.at) > String(y.at) ? 1 : x.ord - y.ord))[0] || null;
    return rules.map((r) => {
      let start;
      const act = det ? det.act || {} : {};
      if (r.starts === "act")
        start = Filings.#actDay(act) ? { event: "act", date: Filings.#actDay(act), source: str(act.at) ? det.id : str(act.event) }
          : { event: "act", state: "undetermined", why: det ? `${Filings.#actDayWhy(act)}, so no single day starts the count` : "no live determination states the act" };
      else if (r.starts === "received" || r.starts === "filed") {
        const e = first(r.starts === "received" ? "received" : "sent");
        start = e ? { event: r.starts, date: String(e.at).slice(0, 10), source: `${a.id}#${e.ord}` }
          : { event: r.starts, state: "undetermined", why: `the action's correspondence holds no ${r.starts === "received" ? "received" : "sent"} entry` };
      } else start = { event: r.starts ?? null, state: "undetermined",
                       why: r.starts === "known" ? "the record holds no date on which the group knew of the act" : "the rule names no start event this record holds" };
      /* R30: counted as action-clocks R10 counts, on the entries for the action's office, each read through local-facts
         by action-clocks' own reader (its R12), this module holding no copy (N474) */
      const date = deadlineDate({ start: start.date ?? null, days: r.days, count: r.count, rule: r, view: v.view,
                                  counterparty: a.counterparty, kind: a.kind, factOf: factReader(this.localFacts, viewer) });
      return { rule: r.rule, days: r.days ?? null, count: r.count ?? null, starts: r.starts ?? null,
               ...(r.extension ? { extension: r.extension } : {}), citation: r.citation ?? null,
               basis: r.basis ?? null, profile: r.profile ?? null, source: `profile:${r.profile}/deadlines/${r.rule}`,
               start, date: date.state === "determined" ? { ...date, start_source: start.source } : date };
    });
  }

  /* R33 (EVENTS 2a; K1494): the chronology as `events.timeline` (its R28–R30) over the set of the determination's act
     event (conformance R25), the counterparty office entity (the action's addressee, actions R9, else the act's actor)
     and the entities the findings concern (each finding's `subject_entity`, from its published bytes), from the act's
     date (or, with none, the earliest `when` among them) to the packet's assembly. The world's lane ("what they did")
     and the registered sources' lane ("what we did") are kept apart, each in events' order, never interleaved; an item
     whose order is undetermined carries events' `order` with its bounds. An item placed nowhere has no `when` to fall
     within the dates, and events' dated read lists it apart all the same (its R29; N602), so one read answers both.
     Each item names its record source (R18). R27: an event of the set the reader may not see is left out, never stood in for, and the lane states
     `out_of_view: true`, read against the plane's own read. */
  #chronology(a, det, facts, viewer, at, marking) {
    const act = det ? det.act || {} : {};
    const set = [];
    const add = (id, is, source) => { if (id && !set.some((x) => x.id === id)) set.push({ id, is, source }); };
    add(isObj(act.event) ? str(act.event.event_id) || str(act.event.id) : str(act.event), "the act's event", det && det.id);
    const cp = isObj(a.counterparty) ? str(a.counterparty.entity_id) : null;
    const actor = isObj(act.actor) ? str(act.actor.entity_id) : null;
    add(cp || actor, "the counterparty office", cp ? a.id : det && det.id);
    for (const f of facts) add(f.subject_entity, "an entity a finding concerns", f.source);
    const from = Filings.#actDay(act) || (isObj(act.period) ? realDate(act.period.from) : null);
    const to = at.slice(0, 10);
    const base = { title: "Chronology", marking, set, from, to,
                   ...(from ? {} : { from_says: "the act states no date, so the chronology reads from the earliest event of the set" }) };
    const empty = (says) => ({ ...base, lanes: { world: { label: LANE_WORDS.world, items: [], placed_nowhere: [], truncated: false },
                                                 ours: { label: LANE_WORDS.ours, sources: [] } }, events: [], says });
    if (!set.length)
      return empty("the record names no act event, counterparty office or subject entity for this action, so the timeline has no set to read");
    const t = this.events;
    if (!t || typeof t.timeline !== "function")
      return { ...empty("no module answers the timeline here, so the chronology is undetermined"), unread: true };
    const ids = set.map((x) => x.id);
    const read = (who, o) => this.#call(() => t.timeline({ set: ids, limit: CHRONOLOGY_MAX, viewer: who, ...o }));
    const dated = read(viewer, { from, to });
    if (!dated || dated.ok === false || !dated.world)
      return { ...empty(`the timeline could not be read${dated && dated.reason ? ` (${dated.reason})` : ""}, so the chronology is undetermined`),
               unread: true };
    const lane = (r) => [...(r.world.items || []), ...(r.world.placed_nowhere || [])];
    const seen = new Set(lane(dated).map((i) => i.event_id));
    const plane = read(MACHINE_READER, { from, to, lanes: ["world"] });
    const hidden = !plane || plane.ok === false || !plane.world || lane(plane).some((i) => !seen.has(i.event_id));
    const world = { label: LANE_WORDS.world,
                    items: (dated.world.items || []).map((i) => ({ ...i, source: i.event_id })),
                    placed_nowhere: (dated.world.placed_nowhere || []).map((i) => ({ ...i, placed_nowhere: true, source: i.event_id })),
                    truncated: !!dated.world.truncated,
                    ...(hidden ? { out_of_view: true } : {}) };
    if (world.truncated) world.says = `more events than the ${CHRONOLOGY_MAX} this lane lists are held: the lane is truncated`;
    const ours = { label: LANE_WORDS.ours, sources: (dated.ours && Array.isArray(dated.ours.sources) ? dated.ours.sources : []).map((s) => (s.error
      ? { source: s.source, error: s.error, says: "this source could not be read, so its acts are not listed" }
      : { source: s.source, items: (s.items || []).map((x) => ({ ...x, source: `${s.source}:${x.ref}` })), truncated: !!s.truncated,
          ...(s.truncated ? { says: `more acts than the ${CHRONOLOGY_MAX} this source lists are held: it is truncated` } : {}) })) };
    /* R9's exhibits: the captures attesting each event listed, as the reader may see them */
    const events = [...world.items, ...world.placed_nowhere].map((i) => {
      const r = typeof t.readEvent === "function" ? this.#call(() => t.readEvent({ eventId: i.event_id, viewer })) : null;
      const atts = r && r.ok !== false && r.event && Array.isArray(r.event.attestations) ? r.event.attestations : [];
      return { event_id: i.event_id, captures: [...new Set(atts.map((x) => str(x.capture_sha)).filter(Boolean))] };
    });
    return { ...base, lanes: { world, ours }, events,
             says: "what they did (the world's events) and what we did (the group's own acts, each source apart) are answered "
                 + "apart, each in its own order, never interleaved into one list" };
  }

  /* R8 (T35, N653; K1739, K2019): a standard whose access, as `standards` holds it (its R41), is not `free` (for kind
     `standard`, an access it does not state included; a law kind stating none is free) is carried by its designation, edition, issuer, citation, adoption and access, and only the
     passages relied on: those the determination's comparison rows for it quote as what it requires (conformance's
     `requires`, with each of the row's content ids that is a passage of the standard's text) and those the findings'
     legs target among its text, each with its content id, quoted. Its other text content ids are not listed. A passage
     whose extent is the whole document is named but never quoted: quoting it would carry the whole text. */
  #heldBack(r, s, act, facts, viewer) {
    const textIds = new Set(Array.isArray(r.text) ? r.text.map(str).filter(Boolean) : []);
    const relied = new Map();
    const rely = (cid, by) => { if (!relied.has(cid)) relied.set(cid, []); relied.get(cid).push(by); };
    const requires = (Array.isArray(s.rows) ? s.rows : []).filter(isObj).map((row, i) => {
      const ids = [...new Set((Array.isArray(row.content) ? row.content : []).map(str).filter((c) => c && textIds.has(c)))];
      for (const c of ids) rely(c, { comparison_row: i, source: s.id });
      return { requires: str(row.requires), content_ids: ids, row: i, source: s.id };
    });
    for (const f of facts) for (const c of f.citations || [])
      if (str(c.content_id) && textIds.has(str(c.content_id))) rely(str(c.content_id), { finding_leg: c.target ?? null, source: f.source });
    const passages = [...relied.entries()].map(([cid, by]) => ({ content_id: cid, ...this.#quote(cid, viewer), relied_on_by: by }));
    const access = str(r.access) || "undetermined";
    const words = isObj(r.says) && str(r.says.access);
    return {
      designation: str(r.designation), edition: str(r.edition),
      ...(str(r.edition) ? {} : { edition_says: "the record states no edition of this standard" }),
      adoption: this.#adoption(r.id ?? s.id, act, viewer), access,
      access_says: words ? `${words}: only the passages relied on are carried, never the whole text`
        : "how this standard's text can be read is not stated, so it is carried as not free: only the passages relied on, never the whole text",
      requires, passages,
      says: passages.length ? "only the passages the determination's comparison and the findings rely on are carried, each quoted"
        : "no passage of its text is relied on by a comparison row or a finding, so none is carried",
    };
  }

  /* R8: one relied-on passage's words (`content.passageText`, its R46), or null with why; a passage whose document the
     reader may not see is answered as unquoted, naming nothing of it. */
  #quote(cid, viewer) {
    const c = this.content;
    const row = c && typeof c.contentRow === "function" ? this.#call(() => c.contentRow(cid)) : null;
    if (!row) return { text: null, text_why: "the record holds no passage by this content id" };
    if (str(row.bundle_id) && typeof c.sees === "function" && !this.#call(() => c.sees(row.bundle_id, viewer)))
      return { text: null, text_why: "the passage is not one you may see" };
    if (row.extent_kind === "document")
      return { text: null, text_why: "the passage cited is the whole document, so it is not quoted: only passages relied on travel" };
    const t = typeof c.passageText === "function" ? this.#call(() => c.passageText(cid)) : null;
    return typeof t === "string" ? { text: t } : { text: null, text_why: "the passage's words are not held as text here" };
  }

  /* R8: the edition the act's body had adopted on the act's day (`standards.editionInForce`, its R40), or undetermined
     with why. */
  #adoption(id, act, viewer) {
    const day = Filings.#actDay(act);
    const body = isObj(act.actor) ? str(act.actor.body) : null;
    if (!day) return { state: "undetermined", why: "the act has no single day, so which edition was adopted is not asked" };
    if (!body) return { state: "undetermined", why: "the determination names no body, so no adoption is read" };
    const s = this.standards;
    if (!s || typeof s.editionInForce !== "function") return { state: "undetermined", why: "no module answers a standard's adoptions here" };
    const e = this.#call(() => s.editionInForce({ standard: id, body, date: day, viewer }));
    if (!isObj(e) || e.ok === false) return { state: "undetermined", why: "the adoptions could not be read" };
    const a = isObj(e.adoption) ? e.adoption : null;
    return { state: e.state ?? "undetermined", body, date: day, edition: e.edition ?? null,
             ...(a ? { adoption: { id: a.id, mode: a.mode ?? null, from: a.from ?? null, citation: a.citation ?? null } } : {}),
             why: e.why ?? null, source: a ? a.id : id };
  }

  /* R9: the six sections and the consequences, each item naming its source. R8, R24: for an action resting on a
     premise override and no live determination, `det` is null: the facts section says in words that no determination
     is held, and nothing is drawn from one. R25: each exhibit read against the venue's standard. R33: the chronology. */
  #assemble(a, det, viewer, marking, at, { purpose = "claim", challenged = [], privileged = null } = {}) {
    const v = this.#view();
    const section = (title, items, extra = {}) => ({ title, marking, ...(privileged ? { privileged } : {}), items, ...extra });
    /* R9 (T45): with no determination, each matter's support as it stands, not determined */
    const matters = this.#matterFacts(a, det, viewer);
    const facts = matters.facts;
    const act = det ? det.act || {} : {};
    const { events, ...chronology } = this.#chronology(a, det, facts, viewer, at, marking);
    const standard = this.#venueStandard(v, a.kind);
    /* R27 (DEC-36): a standard conformance withheld, or one standards' read refuses here, is no item; the section
       states only that something was withheld. */
    let refused = false;
    const standards = (det ? det.standards : []).flatMap((s) => {
      const r = this.#standard(s.id, viewer);
      if (!r) { refused = true; return []; }
      const base = { standard: s.id, cite: r.cite ?? null, kind: r.kind ?? null, issuer: r.issuer ?? null };
      const tail = { outcome: s.outcome ?? null, in_force: this.#inForce(s.id, Filings.#actDay(act)), source: s.id };
      /* R8 (K2019): a law kind stating no access is public law, free to read; kind `standard` only when stated free */
      if (r.access === "free" || (r.access == null && r.kind !== "standard"))
        return [{ ...base, text: Array.isArray(r.text) ? r.text : [], access: r.access ?? null, ...tail }];
      return [{ ...base, ...this.#heldBack(r, s, act, facts, viewer), ...tail }];
    });
    const unseen = { out_of_view: true };
    const theories = this.#rows(`SELECT * FROM theory_proposals WHERE action_id=? ORDER BY theory_id`, a.id).map((t) => ({
      theory_id: t.theory_id, candidate: true, theory: t.theory, remedy: t.remedy, standards: parse(t.standards) || [],
      why: t.why, label: proposalLabel(t.proposer, "theory"), at: t.at, source: t.theory_id }));
    const cons = det && this.consequences && typeof this.consequences.consequencesOf === "function"
      ? this.#call(() => this.consequences.consequencesOf({ determination: det.id, viewer })) : null;
    return {
      facts: section("Facts", facts, det ? (det.withheld ? unseen : {}) : { says: facts.length
        ? "no determination is held: each matter's support is set out as it stands, each finding with its kind and grade, not determined"
        : "no determination is held, and the action names no inquiry it rests on, so no finding is set out" }),
      chronology: privileged ? { ...chronology, privileged } : chronology,
      exhibits: section("Exhibits", this.#exhibits(this.#citesOf(a, det, facts, events), standard), {
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
      /* R9 (T45): a defence packet's three sections */
      ...(purpose === "defence" ? this.#defenceSections(a, det, facts, v, viewer, section, challenged) : {}),
    };
  }

  /* R9 (T45; Actions D9, v0.2 rule 12): a defence packet's three sections. **Challenged statements**: each statement of
     the group the opposition challenges, as the member names it, with the findings it rests on (each read as the reader
     may see it, its sources its own legs) and its sources. **Pressure received**: each pressure mark and record on the
     action and its project (`action-holds.pressureFor`, its R12) and each `legal` mark on the case's docket
     (`docket.docketPressureMarks`, its R27, read as the plane and kept to the action's cases and project, and to the
     projects the reader may see), with its date. **Defence deadlines**: each deadline marked `defends: true`
     (jurisdictions R87 (c)), dated by R9's rule. No sentence here states that the group has a claim, or whether a
     protection applies. */
  #defenceSections(a, det, facts, v, viewer, section, challenged) {
    let hidden = false;
    const statements = challenged.map((c, i) => {
      const fs = (c.findings || []).map((id) => { const f = this.#findingRead(id, viewer); if (!f) hidden = true; return f; }).filter(Boolean);
      return { statement: c.statement, findings: fs.map((f) => ({ finding: f.finding, kind: f.kind, claim: f.claim, source: f.source })),
               sources: fs.flatMap((f) => (f.citations || []).map((x) => ({ target: x.target, ...(x.content_id ? { content_id: x.content_id } : {}), source: f.source }))),
               named_by: "the member", source: `challenged#${i}` };
    });
    const pressure = [];
    let pressureSays = null;
    const h = this.actionHolds;
    if (h && typeof h.pressureFor === "function") {
      for (const q of [{ action: a.id }, ...(a.project ? [{ project: a.project }] : [])]) {
        const r = this.#call(() => h.pressureFor({ ...q, limit: PRESSURE_MAX, viewer }));
        if (!r || r.ok === false) { pressureSays = "the pressure recorded could not be read in full"; continue; }
        for (const x of Array.isArray(r.items) ? r.items : []) {
          const where = isObj(x.arrived) ? x.arrived : {};
          if (!pressure.some((p) => json(p.item) === json(x))) pressure.push({ from: "action-holds", item: x, at: x.at ?? null,
            source: str(where.pressure) ?? (str(where.action) ? `${where.action}#${where.ord ?? "?"}` : a.id) });
        }
        if (r.truncated) pressureSays = `more than the ${PRESSURE_MAX} pressure items read are held: the list is truncated`;
      }
    } else pressureSays = "no module answers the pressure recorded on actions here, so it is undetermined";
    const cases = new Set(facts.map((f) => f.case).filter(Boolean));
    const dk = this.docket;
    if (dk && typeof dk.docketPressureMarks === "function") {
      let after = null;
      for (let n = 0; n < 20; n++) {
        const r = this.#call(() => dk.docketPressureMarks({ kind: "legal", ...(after ? { after } : {}) }));
        if (!r || r.ok === false) { pressureSays = "the docket's legal marks could not be read, so they are undetermined"; break; }
        for (const m of r.marks || []) {
          if (!(cases.has(m.case) || (a.project && m.project === a.project))) continue;
          if (m.project && !this.#inSight(m.project, viewer)) { hidden = true; continue; }
          pressure.push({ from: "docket", kind: m.kind, note: m.note ?? null, case: m.case, entry: m.entry, at: m.at ?? null, source: `docket:${m.entry}` });
        }
        if (!r.cursor) break;
        after = r.cursor;
      }
    } else pressureSays = pressureSays || "no module answers the docket's marks here, so they are undetermined";
    return {
      challenged: section("Challenged statements", statements, {
        says: statements.length ? "each statement of the group that is challenged, as a member names it, with the findings and sources it rests on"
          : "no member has named a challenged statement", ...(hidden ? { out_of_view: true } : {}) }),
      pressure: section("Pressure received", pressure, {
        says: pressureSays || (pressure.length ? "each pressure mark and record, and each legal mark on the case's docket, with its date"
          : "no pressure is recorded on this action, its project or its case's docket") }),
      defence_deadlines: section("Defence deadlines", this.#deadlines(v, a, det, viewer, true),
        { says: v.view ? `each deadline that applies to a defence; its date only from a recorded start event (${COUNTED_FROM}), else undetermined with why`
                       : `${v.why}, so no defence deadline is known` }),
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
  counselPacket({ action = null, counsel = null, template = null, reason = undefined, purpose = null, challenged = null,
                  author = null, viewer = null } = {}) {
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
    /* R8 (T45): what the packet is for, `claim` (the default) or `defence`; a defence packet's challenged statements as
       the member names them. `NO_DETERMINATION` is retired: a packet needs no determination and no override. */
    const goal = purpose == null ? "claim" : purpose;
    if (!PACKET_PURPOSES.includes(goal))
      return { ok: false, reason: "FILING_MARK_REFUSED", field: "purpose", detail: `purpose is one of ${PACKET_PURPOSES.join(", ")}` };
    const named = challenged == null ? [] : Array.isArray(challenged) ? challenged : null;
    const okStatement = (x) => isObj(x) && typeof x.statement === "string" && x.statement.trim() && x.statement.length <= 2000
      && (x.findings == null || (Array.isArray(x.findings) && x.findings.length <= FROM_MAX && x.findings.every((f) => typeof f === "string" && f.trim())));
    if (named === null || named.length > CHALLENGED_MAX || !named.every(okStatement) || (named.length && goal !== "defence"))
      return { ok: false, reason: "FILING_MARK_REFUSED", field: "challenged",
               detail: `a defence packet names at most ${CHALLENGED_MAX} challenged statements, each {statement, findings?}` };
    const { det, hidden } = this.#restsOn(a, viewer);
    const marking = counselMarking(c);
    /* R10 (T45; v0.2 rule 15): a packet for an action of a counsel-matter project carries the privilege marking and a
       warning on sharing outside, beside the marking */
    const project = a.project || (det ? det.project : null);
    const privileged = this.#counselMatter(project)
      ? { key: "packet.privileged", text: KEYED["packet.privileged"], warning: { key: "packet.privileged.warning", text: KEYED["packet.privileged.warning"] } }
      : null;
    const at = this.#when();
    const sections = this.#assemble(a, det, viewer, marking, at, { purpose: goal,
      challenged: named.map((x) => ({ statement: x.statement.trim(), findings: [...new Set((x.findings || []).map((f) => f.trim()))] })), privileged });
    if (used) sections.briefing = this.#briefing(used, a, det, hidden, viewer, at, marking, privileged);
    const tpl = used ? Filings.#templateOf(used) : null;
    const basis = this.#packetBasis(det, a);
    const disclosure = Filings.#disclosure(a);
    return this.record.transact(() => {
      const held = this.#one(`SELECT packet_id, MAX(version) AS v FROM counsel_packets WHERE action_id=? GROUP BY packet_id
                               ORDER BY packet_id LIMIT 1`, a.id);
      const id = held ? held.packet_id : this.record.allocId("CPK", at.slice(0, 4)).id;
      const version = held ? Number(held.v) + 1 : 1;
      this.sql.exec(`INSERT INTO counsel_packets (packet_id, version, action_id, counsel, author, at, sections, basis, disclosure,
                       template, reason, purpose) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                    id, version, a.id, json(c), who, at, json(sections), json(basis), disclosure, json(tpl), why, goal);
      return { ok: true, id, version, action: a.id, head: this.#head(id, version, a.id, c, who, at, marking, disclosure, privileged, goal),
               sections, marking, ...(privileged ? { privileged } : {}), purpose: goal, disclosure, fileable: false, template: tpl,
               reason: why, basis_changed: null };
    });
  }

  /* R31: the packet's seventh section: a `brief` template's text filled from the record as R3 fills a filing, each filled
     blank naming its source, carrying R10's marking and, as R29's draft does, the statement that the template was not
     written for the kind's jurisdiction. */
  #briefing(used, a, det, hidden, viewer, at, marking, privileged = null) {
    const v = this.#view();
    const entry = v.view && Array.isArray(v.view.action_kinds) ? v.view.action_kinds.find((k) => k.kind === a.kind) || null : null;
    const filled = this.#fill(used.text, this.#values(a, det, hidden, entry, viewer, at));
    const notFor = Filings.#notWrittenFor(used, entry);
    /* R34 (T45): the briefing is checked sentence by sentence against the record, its unsupported sentences pointed out */
    const check = this.#outward(filled.text, { a, facts: this.#matterFacts(a, det, viewer).facts, det, view: v.view,
      marks: { own_doing: [], voice: null, language: null, audience: null, names_pending: false }, form: "briefing", viewer });
    return { title: "Briefing", marking, ...(privileged ? { privileged } : {}), text: notFor ? `${notFor}\n\n${filled.text}` : filled.text,
             items: filled.blanks, unfilled: filled.unfilled, template: Filings.#templateOf(used), record_check: check.record_check,
             ...(notFor ? { not_written_for: notFor } : {}),
             says: "the group's briefing to counsel, filled from the record from a brief template; it is not a filing and "
                 + "cannot be filed as it stands" };
  }

  /* R10 (T45): whether a project is a counsel matter (`project-roster.projectScope`, its R23); with no project or no
     module answering, it is not read as one. */
  #counselMatter(project) {
    const r = this.projectRoster;
    if (!str(project) || !r || typeof r.projectScope !== "function") return false;
    const s = this.#call(() => r.projectScope(str(project)));
    return isObj(s) && s.scope === "counsel_matter";
  }

  #head(id, version, action, counsel, author, at, marking, disclosure = null, privileged = null, purpose = null) {
    return { packet: id, version, action, counsel: counsel && counsel.name ? counsel : null, assembled_by: author, at,
             ...(disclosure ? { disclosure } : {}), marking, ...(privileged ? { privileged } : {}),
             ...(purpose ? { purpose } : {}), fileable: false,
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
    const sections = parse(r.sections);
    /* R10: the privilege marking, as the version was assembled with it (every section carries it) */
    const privileged = Object.values(sections || {}).map((x) => x && x.privileged).find(Boolean) || null;
    return { ok: true, id: r.packet_id, version: Number(r.version), action: r.action_id,
             head: this.#head(r.packet_id, Number(r.version), r.action_id, counsel, r.author, r.at, marking, r.disclosure ?? null,
                              privileged, r.purpose ?? null),
             sections, marking, ...(privileged ? { privileged } : {}), purpose: r.purpose ?? "claim",
             disclosure: r.disclosure ?? null, fileable: false,
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
    /* R10 (T45): a counsel matter's privilege marking and warning beside the marking, on the head and every section */
    const priv = (p) => (p ? [p.text, p.warning ? p.warning.text : null].filter(Boolean).flatMap((t) => [t, ""]) : []);
    const lines = [...(v.disclosure ? [v.disclosure, ""] : []), `# Counsel packet ${v.id}, version ${v.version}`, "", v.marking, "",
                   ...priv(v.privileged), `Action: ${v.action}. Assembled by ${v.head.assembled_by} at ${v.head.at}.`, ""];
    const item = (x) => `- ${JSON.stringify(x)}`;
    for (const s of Object.values(v.sections || {})) {
      lines.push(`## ${s.title}`, "", s.marking, "", ...priv(s.privileged));
      if (s.says) lines.push(s.says, "");
      if (typeof s.text === "string") lines.push(s.text, "");
      for (const x of s.items || []) lines.push(item(x));
      for (const x of s.undated || []) lines.push(item({ undated: true, ...x }));
      /* R33: the chronology's two lanes, each apart and in its own order */
      if (isObj(s.lanes)) {
        const w = s.lanes.world || {}, o = s.lanes.ours || {};
        for (const x of w.items || []) lines.push(item({ lane: w.label, ...x }));
        for (const x of w.placed_nowhere || []) lines.push(item({ lane: w.label, ...x }));
        for (const src of o.sources || []) {
          if (src.error) lines.push(item({ lane: o.label, source: src.source, error: src.error }));
          for (const x of src.items || []) lines.push(item({ lane: o.label, ...x }));
        }
      }
      lines.push("");
    }
    lines.push("## Manifest of exhibits", "", v.marking, "", ...priv(v.privileged));
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
  async #stamped(face, { what, date, author, project, review = null }) {
    /* R46 (K2832): a press review copy's embargo and release times ride in the stamp's subject content beside the text */
    const subject = review ? { text: face, embargo_until: review.embargo_until ?? null, release_at: review.release_at ?? null } : face;
    const { quartet } = await inbandQuartet({
      subject,
      over: review
        ? `${what}: an object of the text above the line "${INBAND_RULE}" (without the line break before it) as \`text\`, with `
          + "the review copy's `embargo_until` and `release_at`; hash JSON.stringify(object, null, 1) as UTF-8"
        : `${what}: the text above the line "${INBAND_RULE}", without the line break before it, as a JSON string; `
          + "hash JSON.stringify(text, null, 1) as UTF-8",
      date, author, bar: this.#bar(project), group: this.#groupFields() });
    return { bytes: `${face}\n${inbandBlock(quartet)}`, inband: quartet };
  }

  /* R22 (T45): the group's public identity and declared stake (`public-read.groupFields`, its R34), passed as the
     quartet's `group`, outside what its hash covers (so a joint text's fingerprint, R36, is computed without them); with
     no module answering, null, and the quartet carries no group. */
  #groupFields() {
    const p = this.publicRead;
    const g = p && typeof p.groupFields === "function" ? this.#call(() => p.groupFields()) : null;
    return isObj(g) ? g : null;
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
   *  it is named (K316). R50 (T46): each draft answers `second_needed`, so `affordances` offers `filingsent` only on a
   *  draft that needs no further approval. */
  filingsFor({ action = null, viewer = null } = {}) {
    const a = this.#action(action, viewer);
    if (!a) return this.#noAction(action);
    /* R50 (T46; N930): the action as the plane reads it, read once for R42's rule over every draft listed */
    const plane = this.#action(a.id, MACHINE_READER);
    /* R23: the action's communications are listed among its drafts, marked a communication. */
    const drafts = this.#seenRows(FILINGS_FOR_MAX + 1, viewer,
      `SELECT d.filing_id, d.tier, d.preparer, d.prepared_at, d.basis, d.form, d.purpose, d.template, d.marks, ap.approved_by,
              ap.at AS approved_at, ap.sha, s.ord, s.sent_on, s.recorded_by, s.recorded_at, s.review_copy, s.reference,
              sa.approved_by AS second_by, sa.at AS second_at
         FROM (SELECT filing_id, tier, preparer, prepared_at, basis, 'filing' AS form, NULL AS purpose, template, marks
                 FROM filing_drafts WHERE action_id=?
               UNION ALL
               SELECT filing_id, NULL AS tier, preparer, prepared_at, basis, 'communication' AS form, purpose, NULL AS template, marks
                 FROM communication_drafts WHERE action_id=?) d
         LEFT JOIN filing_approvals ap ON ap.filing_id=d.filing_id
         LEFT JOIN filing_sendings s ON s.filing_id=d.filing_id
         LEFT JOIN filing_second_approvals sa ON sa.filing_id=d.filing_id
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
        /* T45: R42's second approval, R36's partners' signatures, R44's voice, R46's review copy */
        second_approval: d.second_by ? { approved_by: d.second_by, at: d.second_at, given: Filings.#secondGiven(d.second_by, d.second_at) } : null,
        /* R50 (T46; N930): true exactly when R42 would ask a second approval of its sending not yet recorded; a draft
           already sent, or the member's own notes (never sent, R44), is asked none */
        second_needed: !d.second_by && !d.recorded_by && (parse(d.marks) || {}).voice !== "self"
          && this.#secondNeeded({ ...d, action_id: a.id }, viewer, plane).needed,
        signatories: this.#rows(`SELECT organisation, role, body_sha, account, recorded_by, at FROM joint_signatories WHERE filing_id=?
                                  ORDER BY at, organisation`, d.filing_id),
        voice: (parse(d.marks) || {}).voice ?? null,
        /* R54 (T47): the venue's reference, null when the member gave none */
        sending: d.recorded_by ? { ord: d.ord, sent_on: d.sent_on, recorded_by: d.recorded_by, at: d.recorded_at, reference: d.reference ?? null,
                                   ...(d.review_copy ? { review_copy: parse(d.review_copy) } : {}) } : null })),
      drafts_truncated: drafts.length > FILINGS_FOR_MAX,
      packets: versions.slice(0, FILINGS_FOR_MAX).map((r) => {
        const causes = this.#basisChanged(parse(r.basis) || {}, viewer);
        return { packet: r.packet_id, version: Number(r.version), purpose: r.purpose ?? "claim", counsel: parse(r.counsel), assembled_by: r.author, at: r.at,
                 reason: r.reason ?? null, template: this.#templateShown(parse(r.template), viewer),
                 basis_changed: causes.length ? { causes } : null,
                 exports: this.#rows(`SELECT author, at, counsel, sha FROM counsel_packet_exports WHERE packet_id=? AND version=?
                                       ORDER BY export_id`, r.packet_id, r.version)
                   .map((e) => ({ exported_by: e.author, at: e.at, counsel: parse(e.counsel), sha: e.sha })) };
      }),
      packets_truncated: versions.length > FILINGS_FOR_MAX,
    };
  }

  /** R53 (T47; DEC-212): each filing draft or communication a member approved (R6) and nobody has recorded sent (R7), on
   *  an action the viewer may see, drawing on no project the viewer may not see (K316, as R13 lists them), oldest
   *  approval first: `{filing, action, project, approved_by, approved_at}`, `project` the action's (else the one its
   *  draft drew on, else null); at most `FILINGS_FOR_MAX`, `truncated` saying more are held. The read `action-producers`
   *  R25's "request left unsent" item draws on. Writes nothing. */
  approvedUnsent({ viewer = null } = {}) {
    const items = [];
    let truncated = false;
    for (let offset = 0; !truncated; offset += FILINGS_FOR_MAX) {
      const page = this.#rows(`SELECT ap.filing_id, ap.action_id, ap.approved_by, ap.at,
                                      COALESCE(d.basis, c.basis) AS basis
                                 FROM filing_approvals ap
                                 LEFT JOIN filing_sendings s ON s.filing_id=ap.filing_id
                                 LEFT JOIN filing_drafts d ON d.filing_id=ap.filing_id
                                 LEFT JOIN communication_drafts c ON c.filing_id=ap.filing_id
                                WHERE s.filing_id IS NULL
                                ORDER BY ap.at, ap.filing_id LIMIT ? OFFSET ?`, FILINGS_FOR_MAX, offset);
      for (const r of page) {
        const a = this.#action(r.action_id, viewer);
        const basis = parse(r.basis);
        if (!a || !this.#sees(basis, viewer)) continue;
        if (items.length === FILINGS_FOR_MAX) { truncated = true; break; }
        items.push({ filing: r.filing_id, action: r.action_id, project: a.project || (isObj(basis) ? str(basis.project) : null),
                     approved_by: r.approved_by, approved_at: r.at });
      }
      if (page.length < FILINGS_FOR_MAX) break;
    }
    return { ok: true, items, truncated,
             says: items.length ? "approved and not yet recorded as sent, oldest approval first"
               : "no approved draft or communication you may see waits to be recorded as sent" };
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
/* T45: the marks a member states at preparation, read from the body (R34, R37, R39, R43, R44, R48). */
const marksOf = (b) => ({ voice: b.voice ?? null, audience: b.audience ?? null, language: b.language ?? null,
                          own_doing: b.own_doing ?? null, names_pending: b.names_pending ?? null, textcheck: b.textcheck ?? null });

export function filingsOps(f, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    filingprepare: () => f.filingPrepare({ action: b.action ?? q("action"), template: b.template ?? q("template"),
                                           text: b.text ?? null, fills: b.fills ?? null, ...marksOf(b), preparer: q("author"), viewer: q("viewer") }),
    communicationprepare: () => f.communicationPrepare({ action: b.action ?? q("action"), text: b.text, purpose: b.purpose,
                                                         from: b.from ?? null, fills: b.fills ?? null, ...marksOf(b), preparer: q("author"),
                                                         viewer: q("viewer") }),
    templatesave: () => f.templateSave({ filing: b.filing ?? q("filing"), template: b.template ?? q("template"),
                                         project: b.project ?? null, name: b.name ?? null, kind: b.kind ?? null, use: b.use ?? null,
                                         profiles: b.profiles ?? null, notes: b.notes ?? null, author: q("author"), viewer: q("viewer") }),
    filingapprove: () => f.filingApprove({ filing: b.filing ?? q("filing"), text: b.text, release: b.release ?? null,
                                           resolutions: b.resolutions ?? null, textcheck: b.textcheck ?? null,
                                           author: q("author"), viewer: q("viewer") }),
    filingsecondapprove: () => f.filingSecondApprove({ filing: b.filing ?? q("filing"), author: q("author"), viewer: q("viewer") }),
    jointsignatory: () => f.jointSignatory({ filing: b.filing ?? q("filing"), organisation: b.organisation ?? null, body_sha: b.body_sha ?? null,
                                             account: b.account ?? null, author: q("author"), viewer: q("viewer") }),
    holdnoticeprepare: () => f.holdNoticePrepare({ place: b.place ?? null, preparer: q("author"), viewer: q("viewer") }),
    templatesforaction: () => f.templatesForAction({ action: q("action") ?? b.action ?? null, viewer: q("viewer") }),
    filingsent: () => f.filingRecordSent({ filing: b.filing ?? q("filing"), at: b.at ?? q("at"), medium: b.medium ?? null,
                                           artifactSha: b.artifactSha ?? b.artifact_sha ?? null, account: b.account ?? null,
                                           reference: b.reference ?? null,
                                           author: q("author"), viewer: q("viewer") }),
    counselpacket: () => f.counselPacket({ action: b.action ?? q("action"), counsel: b.counsel ?? null,
                                           template: b.template ?? q("template"), reason: b.reason, purpose: b.purpose ?? null,
                                           challenged: b.challenged ?? null, author: q("author"), viewer: q("viewer") }),
    counselpacketread: () => f.counselPacketRead({ id: q("id"), version: q("version"), viewer: q("viewer") }),
    counselpacketexport: () => f.counselPacketExport({ id: b.id ?? q("id"), version: b.version ?? q("version"),
                                                       author: q("author"), viewer: q("viewer") }),
    filingsfor: () => f.filingsFor({ action: q("action"), viewer: q("viewer") }),
    filingread: () => f.filingRead({ filing: b.filing ?? q("filing"), viewer: q("viewer") }),
    theorypropose: () => f.theoryPropose({ packet: b.packet ?? null, action: b.action ?? null, theory: b.theory, remedy: b.remedy,
                                           standards: b.standards, why: b.why, proposer: q("author"), viewer: q("viewer") }),
    availableactions: () => f.availableActions({ determination: q("determination"), viewer: q("viewer") }),
  };
}
