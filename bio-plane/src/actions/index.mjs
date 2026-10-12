/* actions — the Action object (requirements: `build/requirements/actions.md`; State Rules v1.5 §4.4): what the group
 * sends or does outside the system, to whom, why, under which laws, at what legal exposure, by when, and what came
 * back. A member decides every move; a machine prepares and never advances, testifies, sets a tier or states a law.
 *
 * Extracted from the legacy modules (T8, layer 9; K3, K4, K6, K23, K31, K57, K61, K64, K75 (2), K79, K102):
 * `store.mjs` (the clock rule, `#actionDerived`, `actionMove` … `#spliceCorrespondence`, the governing-laws fence, the
 * action, risk-tier and `responds_to` arms of the promotion step and its three projections, the purge list entries and
 * the dispatch) and `schema.mjs` (the four tables, now `./schema.mjs`). The legacy code's comments moved with it. The
 * action document's grammar, its arms, readers and rows are `action-grammar`'s (T19 layer 9), read from there.
 *
 * REACHED as `actionsOf(host, deps)` (K61): one instance per host, created on the first call. At creation it creates
 * its tables and declares them to record-core's purge (R36), registers its check and projection with promotion (R1–R3,
 * R7, R11, R33), action-grammar's audit arm with record-core (R51), its facts and projection decoration with retrieval (R12,
 * R25; retrieval R53, R56), its "what we did" and trigger sources with events and duties (R66, R67), its none-exists
 * reader with intent (R71), and its own-act reader and own-sending check with consequences and standards (R97). The
 * pressure marks and litigation holds, their reads and their registrations with doorbell and ratification, are
 * `action-holds`' since T45 (R48, R52, R54–R60, R69; K2781 (1)). `place()` and `zoneOf` give R12's zone to other modules
 * (R68: retrieval, queue-producers).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `transact`, `acquireLease`, `releaseLease`, `head`, `readFile`, `livePaths`,
 *                                   `declarePurge`, `registerAuditCheck`, `getSetting`, `bundleInfo`; `viewerPredicate`,
 *                                   `memberFacts`, `listenerRefusal` (R45, R94, R95); `promote`, `registerStep`.
 *   retrieval      `registerActionFacts`, `registerProjectionDecoration` (its R53, R56).
 *   content        `captureFor` (R11).
 *   conformance    `determinationRead` (R8, R30, R75, R76), when provided (see R8 below); its module-level
 *                  `determinationSuperseded` (its R20) and `determinationVoided` (its R33), through which R8 answers.
 *   entities       `readEntity` (its R5): whether an addressee's `entity_id` names a person, an office or an
 *                  organisation (R9, R77, R78).
 *   consequences   `successRecordRead` (its R20; R8 (e), R93), `registerOwnActReader` (its R19; R97).
 *   standards      `standardRead`, `inForceAt` (R64), `registerOwnSendingCheck` (its R53; R97).
 *   project-roster `projectScope` (its R23): a counsel matter's acts are never in R66's items.
 *   local-facts    `governingView` (its R12): the view of kinds, venues, records laws and statuses (R10).
 *   progressions  `readProgression` (its R5): the progressions and stages a records request's `seeks` names (R70).
 *   intent         `registerNoneExistsReader` (its R33): the reader of requests answered that none exists (R71);
 *                  `null` registers none.
 *   now            the instance clock, milliseconds (default: `env.BIO_NOW_MS`, else the wall clock).
 *   env            the instance bindings.
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, `current_state`) and
 * `files` (`bundle_id`, `path`, `content`), its R37; provenance's `register` (`capture_sha`, `bundle_id`), its R48;
 * connections' `refs` (`bundle_id`, `target_id`, `kind`) for R25's `responses`. */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, listenerRefusal } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { contentOf } from "../content/index.mjs";
import { retrievalOf } from "../retrieval/index.mjs";
import { conformanceOf, determinationSuperseded, determinationVoided } from "../conformance/index.mjs";
import { consequencesModule } from "../consequences/index.mjs";
import { projectRosterOf } from "../project-roster/index.mjs";
import { localFactsOf } from "../local-facts/index.mjs";
import { entitiesOf, noSuchEntity, ORGANISATION_KINDS } from "../entities/index.mjs";
import { linesOf } from "../lines/index.mjs";
import { eventsOf } from "../events/index.mjs";
import { standardsOf, noSuchStandard } from "../standards/index.mjs";
import { dutiesOf } from "../duties/index.mjs";
import { progressionsOf } from "../progressions/index.mjs";
import { intentOf } from "../intent/index.mjs";
import { localDay, overdueOn, isCalendarDate } from "../civil-time/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { parseFrontmatter, normalizeType, vocabFor, STATES, OBJECT_TYPES, isMachineIdentity,
         createSha256, BUNDLE_ID_RE, idPattern } from "../record-grammar/index.mjs";
import { RISK_TIERS, riskTierState, RESOLUTIONS, CORRESPONDENCE_DIRECTIONS, actionBasisFindings,
         correspondenceFindings, isQuoteEntry, quoteValue, quoteFindings, lifecycleFindings, lawProposalLabel,
         LAW_LEVELS, GOVERNING_LAWS_MAX, CITATION_MAX, RISK_TIER_REASON_MAX, RISK_TIER_HISTORY_MAX, riskTierHistoryOf,
         governingLawsOf, requestLifecycleOf, consequenceState, respondsToEdgeFindings, checkActionExtension,
         recordsLawRefusal, recordsLawOf, counterpartyName, counterpartyFindings, actionKinds, addresseeIsOffice,
         counterpartyOffice,
         clockMovesNotMechanical, ACTION_FENCE_CHECKS, ACTION_ACT_CHECKS, GOVERNING_LAW_CHECKS, QUOTE_CHECKS,
         LIFECYCLE_CHECKS, RISK_TIER_REVISION_CHECKS, RECORDS_LAW_FENCE_CHECKS,
         ACTION_CATALOGUE_CHECKS, seeksOf, seeksFindings, SEEKS_MAX, OVERRIDE_GROUNDS, PROMISE_KINDS, SUCCESS_RECORD_ID_RE,
         premiseOverrideOf, overrideGroundFindings, copiedFindings, partnersFindings, pressTermsFindings,
         entryFieldFindings, actionFieldFindings, stageInLaw } from "../action-grammar/index.mjs";
import { ACTIONS_TABLES, migrateActions } from "./schema.mjs";

export { ACTIONS_SCHEMA, ACTIONS_TABLES } from "./schema.mjs";

/** R13, R15: the longest reason, account, medium or party (the value of the retired legacy store's `RELEASE_ACK_MAX`). */
export const NOTE_MAX = 500;
/* REC-24: how long op=actioncorrespond holds the courtesy lock while it rewrites one document. Short on purpose — the
   op is a single append with no human step inside it. It is a COURTESY: promote's CAS on `base` is what actually
   prevents a lost update, and this only stops two members interleaving two accounts of the same exchange. */
export const CORRESPOND_LEASE_MS = 30000;
/* REC-195: the most PROPOSALS one action's read returns (each at most GOVERNING_LAWS_MAX citations). A cut, published
   beside the answer — never a claim that no more exist. R28: the same bound for proposed tiers. */
export const LAW_PROPOSALS_READ_MAX = 12;
export const RISK_PROPOSALS_READ_MAX = 12;
/** R73: the most proposals of what a request seeks one action's read lists (R19's bound). */
export const SEEKS_PROPOSALS_READ_MAX = 12;
/** R27: the most quotes one read answers. */
export const QUOTES_MAX = 500;
/** R30: the most actions one page lists. */
export const ACTIONS_PAGE_MAX = 200;
/** R3 (N237, K351): the most `action_basis` and `correspondence` entries one action's document holds. */
export const ACTION_LEGS_MAX = 500;
export const ACTION_LEDGER_MAX = 500;
/** R46, R61 (S0-5): a plan's id, the core record-grammar's one id table answers for `PLN` (its R47), with or without a
 *  slug (`action-plans` mints it). No pattern of this module's own: a counter of four or more digits is accepted. */
const PLAN_ID_RE = new RegExp(`^${idPattern("PLN").source.slice(1, -1)}(-[a-z0-9]+)*$`);
/** R9: an entity id of the registry's `ENT-` form (record-grammar's `idPattern`). */
const ENTITY_ID_RE = idPattern("ENT");
/** R48 (K597 (1)): the kinds of pressure a received entry may be marked with. */
export const PRESSURE_KINDS = Object.freeze(["legal", "retaliation", "discrediting", "other"]);
/** R71 (intent R33): the most answers `noneExistsFor` gives. */
export const NONE_EXISTS_MAX = 50;
/** R28: the longest basis a proposed tier carries. */
export const RISK_PROPOSAL_BASIS_MAX = 500;
/** R74 (T45): the quick route offered beside `OVERRIDE_NO_GROUND` (reconciliation R16). */
export const QUICK_ROUTE = Object.freeze({ kind: "one_finding_case" });
/** R80 (T45): what a receipt record says happened to a sent entry. */
export const RECEIPT_KINDS = Object.freeze(["receipt", "service"]);
/** R80: the longest `how` and `party` of a receipt record. */
export const RECEIPT_TEXT_MAX = 200;
/** R88 (T45): the longest promise. */
export const PROMISE_TEXT_MAX = 500;
/** R92 (T45): the most open items one read answers. */
export const OPEN_ITEMS_MAX = 200;
/** R80, R74: a local date-time, `YYYY-MM-DDTHH:MM`. */
const LOCAL_DT_RE = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d$/;
/* R74: the flat keys a premise override's ground is held under (K2849). */
/* R81, R83, R94: the flat keys an entry's T45 fields are held under (K2849). */
const ENTRY_FIELD_KEYS = Object.freeze(["speaker", "office_words", "office_status", "found_elsewhere", "found_elsewhere_note"]);
const OVERRIDE_KEYS = Object.freeze(["ground_kind", "ground_citation", "ground_date", "ground_what", "ground_when"]);
/* The member-facing sentences T45 adds, each with the key the design stream words it under (filings and the surfaces
   render the key; `says` is the plane's own reading of it). */
export const T45_SENTENCES = Object.freeze({
  ground_not_stated: Object.freeze({ key: "actions.override.ground_not_stated",
    says: "This override was stated before a ground was asked for; it reads as written, with its reason alone." }),
  reply_not_owed: Object.freeze({ key: "actions.reply.not_owed",
    says: "This body owes the group no reply, so silence is never recorded as a non-response." }),
  scope_published_stays: Object.freeze({ key: "actions.scope.published_stays",
    says: "This changes what is published from now on; anything already signed and published stays as it was." }),
  openitems_not_office: Object.freeze({ key: "actions.openitems.not_office",
    says: "This action is not addressed to an office, so no open items with an office are shown." }),
  recognition_promise_only: Object.freeze({ key: "actions.recognition.promise_only",
    says: "This recognition rests on no compliant determination or success record: the fix is only promised." }),
});

/* D-149: the one write that may set or change an action's governing laws is `actionLaws`, and it says so to `promote`
   under this Symbol. A Symbol: no JSON body a caller sends can carry one, so `op=promote` cannot claim to be the act. */
const LAWS_ACT = Symbol("d149-laws-act");
/* REC-214: the one write that may change an action's risk tier after intake, or append to its history, is
   `actionRiskTier`, and it says so to `promote` under this Symbol, for LAWS_ACT's reason. */
const RISK_TIER_ACT = Symbol("rec214-risk-tier-act");

/* The catalogue-backed refusals: each carries its code, check and translation (the Provides' "Terms"). */
const ROWS = Object.assign({}, ACTION_FENCE_CHECKS, ACTION_ACT_CHECKS, GOVERNING_LAW_CHECKS, QUOTE_CHECKS,
  LIFECYCLE_CHECKS, RISK_TIER_REVISION_CHECKS, RECORDS_LAW_FENCE_CHECKS, ACTION_CATALOGUE_CHECKS);
export function withRow(r) {
  if (!r || typeof r !== "object" || r.ok !== false || typeof r.reason !== "string") return r;
  const row = ROWS[r.reason];
  if (!row) return r;
  return { ...r, code: r.code ?? r.reason, check: r.check ?? row.check, translation: r.translation ?? row.translation };
}
const refuse = (code, detail, extra) => withRow({ ok: false, reason: code, detail, ...(extra || {}) });

/* R43 (N217, K275). THE ONE ANSWER TO ONE CONDITION: no action the caller may see answers to `actionId` (absent,
   invisible, or a bundle that is not an action, answered alike). Every act or read of a later module answering that
   condition answers through here (filings R1, R8, R13; escalation R9), so `NO_SUCH_ACTION` is minted at one site and
   its one row is this module's (C-117.2). The detail is one fixed sentence, the same for every caller, so an absent
   id and a hidden one can never be told apart by it. `extra` adds a caller's own fields beside these and never
   replaces one of them. Writes nothing and never throws. */
const NO_SUCH_ACTION_DETAIL = "no action answers to that id here. An action you may not see is answered exactly as one "
  + "that does not exist, so this is not a hint either way.";
const NO_SUCH_ACTION_FIXED = new Set(["ok", "reason", "code", "check", "translation", "action", "detail"]);
export function noSuchAction(actionId, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NO_SUCH_ACTION_FIXED.has(k));
  } catch { own = []; }
  let action = null;
  try { action = actionId === undefined || actionId === null ? null : String(actionId); } catch { action = null; }
  /* DEC-49 REGION is-no-such-action */
  const row = ACTION_CATALOGUE_CHECKS.NO_SUCH_ACTION;
  return { ok: false, reason: "NO_SUCH_ACTION", code: "NO_SUCH_ACTION", check: row.check,
           translation: row.translation, action, ...Object.fromEntries(own), detail: NO_SUCH_ACTION_DETAIL };
  /* END DEC-49 REGION is-no-such-action */
}

/* R45 (N427, K711). THE ONE ANSWER TO ONE CONDITION: an action's stated contact names no member of the instance. This
   write answers it through here, and so does every later module asking it (`action-plans` R18), so
   `CONTACT_NOT_A_MEMBER` is minted at one site with its one row (C-117.11). The detail is this write's own fixed
   sentence; `extra` adds a caller's fields beside these and never replaces one. Writes nothing and never throws. */
const CONTACT_NOT_A_MEMBER_DETAIL = "contact names a member of your group by member id, and this one names none. "
  + "Nothing was written.";
const CONTACT_NOT_A_MEMBER_FIXED = new Set(["ok", "reason", "code", "check", "translation", "detail"]);
export function contactNotAMember(extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !CONTACT_NOT_A_MEMBER_FIXED.has(k));
  } catch { own = []; }
  /* DEC-49 REGION is-contact-member */
  const row = ACTION_CATALOGUE_CHECKS.CONTACT_NOT_A_MEMBER;
  return { ok: false, reason: "CONTACT_NOT_A_MEMBER", code: "CONTACT_NOT_A_MEMBER", check: row.check,
           translation: row.translation, ...Object.fromEntries(own), detail: CONTACT_NOT_A_MEMBER_DETAIL };
  /* END DEC-49 REGION is-contact-member */
}
/** R45 (N427): a stated contact's member id, `member:<id>` or bare, or null. Never throws. */
export function contactId(v) {
  if (typeof v !== "string" || !v.trim()) return null;
  return v.trim().replace(/^member:/, "");
}
const findingsOf = (list) => list.filter((x) => x.severity === "error")
  .map((x) => ({ check: x.check, detail: x.message, ...(x.code ? { code: x.code } : {}), ...(x.repairs ? { repairs: x.repairs } : {}) }));

/* R12, REC-24 (f): the clock, read from the DOCUMENT and never from a second store. The next PENDING deadline is the
   earliest date on a clock[] entry still marked pending. Pure over the frontmatter, so the projection writer, the
   read-time derivation and any later consumer compute one number by construction rather than by agreement. */
export function actionClockNext(fm) {
  const pending = (Array.isArray(fm?.clock) ? fm.clock : [])
    .filter((e) => e && typeof e === "object" && e.status === "pending"
                && typeof e.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    .map((e) => e.date)
    .sort();
  return pending.length ? pending[0] : null;
}
/** An instant of `nowMs`, to the second, in record-grammar's `ISO_TS_RE` form (civil-time reads no other). */
export function instantOf(nowMs) {
  const n = Number(nowMs);
  return new Date(Math.floor((Number.isFinite(n) ? n : 0) / 1000) * 1000).toISOString().replace(".000Z", "Z");
}
/** R12, R68 (N611, K1681): the IANA zone a place states: a view's (`place()`'s) `time_zone` value, or null when it
 *  states none (none held, or the active profiles disagree, so it is withheld). A string is read as the zone itself.
 *  The one spelling of R12's zone read, provided to `retrieval` and `queue-producers`. Writes nothing; never throws. */
export function zoneOf(place) {
  try {
    if (typeof place === "string") return place.trim() || null;
    const tz = place && typeof place === "object" ? place.time_zone : null;
    const v = tz && typeof tz === "object" ? tz.value : tz;
    return typeof v === "string" && v.trim() ? v.trim() : null;
  } catch { return null; }
}
/** R12, R25 (K1444 (iii)): the local day of `nowMs` in `zone`, or null with no zone or an unreadable one. */
export function localToday(nowMs, zone) {
  if (!zone) return null;
  const d = localDay(instantOf(nowMs), zone);
  return typeof d === "string" ? d : null;
}
const COB_RE = /close\s+of\s+business/i;
const WEEKDAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
/* R12 (K1444 (iii); civil-time R14): the close of the counterparty office's hours on `day`, `HH:MM`, from the view's
   `counterparties` entry for its role and body; null when the view holds no hours for it, or none that day. */
function closeOf(fm, day, place) {
  const cp = fm && fm.counterparty && typeof fm.counterparty === "object" ? fm.counterparty : null;
  const list = place && typeof place === "object" && Array.isArray(place.counterparties) ? place.counterparties : [];
  if (!cp) return null;
  const role = typeof cp.role === "string" ? cp.role.trim() : typeof cp.name === "string" ? cp.name.trim() : "";
  const body = typeof cp.body === "string" ? cp.body.trim() : null;
  const office = list.find((c) => c && c.role === role && (body === null || c.body === body));
  const weekly = office && office.hours && Array.isArray(office.hours.weekly) ? office.hours.weekly : null;
  if (!weekly) return null;
  const [y, m, d] = day.split("-").map(Number);
  const wd = WEEKDAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const closes = weekly.filter((h) => h && h.day === wd && typeof h.close === "string").map((h) => h.close).sort();
  return closes.length ? closes[closes.length - 1] : null;
}
/** R12 (K1444 (iii)): whether the next pending deadline has passed at `nowMs`, on the local day of the office's zone,
 *  never the UTC day: a deadline is met by anything on its day, and an entry whose basis says "close of business" is
 *  overdue from the close of the office's hours that day (`civil-time.overdueOn`, side `body`). `place` is the
 *  jurisdiction view (its `time_zone` and `counterparties`) or a zone. True, false, or null when no zone is held or
 *  the comparison is undetermined. */
export function actionOverdue(fm, nowMs, place = null) {
  const next = actionClockNext(fm);
  if (!next) return false;
  const zone = zoneOf(place);
  if (!zone) return null;
  const at = instantOf(nowMs);
  const entries = (Array.isArray(fm.clock) ? fm.clock : [])
    .filter((e) => e && typeof e === "object" && e.status === "pending" && e.date === next);
  let undetermined = false;
  for (const e of entries.length ? entries : [{ date: next }]) {
    const close = typeof e.basis === "string" && COB_RE.test(e.basis) ? closeOf(fm, next, place) : null;
    const due = close ? { value: `${next}T${close}`, precision: "minute", zone } : { value: next, precision: "day", zone };
    let r;
    try { r = overdueOn({ due, at, side: "body" }); } catch { r = null; }
    if (r === "overdue") return true;
    if (r !== "not_overdue") undetermined = true;
  }
  return undetermined ? null : false;
}

/** R12: the six facts retrieval projects for an action, pure; all null for another type or an unparsable document.
 *  `place` is the jurisdiction view (or a zone) the caller passes; without a zone `clock_overdue` is null. */
export function actionFacts(documentText, nowMs, place = null) {
  const none = { kind: null, risk_tier: null, counterparty_state: null, resolution: null, clock_next: null, clock_overdue: null };
  let fm = null;
  try { fm = typeof documentText === "string" ? parseFrontmatter(documentText).data : null; } catch { fm = null; }
  if (!fm || typeof fm !== "object" || normalizeType(fm.object_type) !== "action") return none;
  const tier = riskTierState(fm.risk_tier);
  const cp = fm.counterparty && typeof fm.counterparty === "object" && !Array.isArray(fm.counterparty) ? fm.counterparty : {};
  return { kind: typeof fm.action_kind === "string" ? fm.action_kind : null,
           risk_tier: tier === 1 || tier === 2 || tier === 3 ? tier : null,
           counterparty_state: typeof cp.state === "string" ? cp.state : null,
           resolution: typeof fm.resolution === "string" ? fm.resolution : null,
           clock_next: actionClockNext(fm), clock_overdue: actionOverdue(fm, nowMs, place) };
}

const clampLimit = (v, dflt, max) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(n, max) : dflt; };

export class Actions {
  #deps;
  /* R95 (T45): the response listeners, one per module (K31's pattern). */
  #responseListeners = [];

  constructor({ storage, record, membership, promotion, host = null, retrieval = null, content = null,
                conformance = null, entities = null, lines = null, events = null, standards = null, duties = null,
                progressions = null, consequences = null, projectRoster = null, localFacts = null, now = null,
                env = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, retrieval, content, conformance: conformance ?? undefined, entities, lines, events, standards, duties,
                   progressions, consequences, projectRoster, localFacts };
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
  }

  get retrieval() { return this.#deps.retrieval ||= retrievalOf(this.#deps.host); }
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }
  /* R9: the subject registry's `readEntity` (entities R5), for an addressee's `entity_id`. */
  get entities() { return this.#deps.entities ||= entitiesOf(this.#deps.host); }

  /* R9, R62, R65 (T33-73): the dated lines (`holderAt`, `structureAt`, `linesOf`), the events (`proceedingStatusAt`,
     `registerEventSource`), the held standards (`standardRead`, `inForceAt`) and the duties (`registerTriggerSource`),
     each reached on the same host unless a test passes its own; a host on which one cannot be created answers null, and
     what it would have answered is answered undetermined, never guessed. */
  #reach(name, make) {
    if (this.#deps[name] === undefined || this.#deps[name] === null) {
      try { this.#deps[name] = make(this.#deps.host); } catch { this.#deps[name] = false; }
    }
    return this.#deps[name] || null;
  }
  get lines() { return this.#reach("lines", (h) => linesOf(h)); }
  get events() { return this.#reach("events", (h) => eventsOf(h)); }
  get standards() { return this.#reach("standards", (h) => standardsOf(h)); }
  get duties() { return this.#reach("duties", (h) => dutiesOf(h)); }
  /* R70: the progression definitions (`readProgression`, its R5), reached on the same host unless a test passes its own. */
  get progressions() { return this.#reach("progressions", (h) => progressionsOf(h)); }
  /* T45: the success records and the own-act registration (consequences R19, R20), the projects' scopes (project-roster
     R23) and the group's governing view (local-facts R12), each reached on the same host unless a test passes its own. */
  get consequences() {
    return this.#reach("consequences", (h) => consequencesModule(h, { record: this.record, membership: this.membership,
                                                                      promotion: this.promotion }));
  }
  get projectRoster() { return this.#reach("projectRoster", (h) => projectRosterOf(h, { record: this.record, membership: this.membership })); }
  get localFacts() { return this.#reach("localFacts", (h) => localFactsOf(h, { record: this.record, membership: this.membership })); }

  /* R9: the kind the registry holds `entityId` as, or null when it holds none or cannot be read. */
  #entityKind(entityId) {
    let r = null;
    try { r = this.entities.readEntity({ entityId }); } catch { r = null; }
    return r && r.ok && r.found && r.entity && typeof r.entity.kind === "string" ? r.entity.kind : null;
  }
  #namesPerson(entityId) { return this.#entityKind(entityId) === "person"; }
  /* R8, R30: conformance's `determinationRead` (its R9; K252). Reached on the same host unless a test passes its own; a
     host on which it cannot be created answers null, and R8 then refuses, never passes. */
  get conformance() {
    if (this.#deps.conformance === undefined || this.#deps.conformance === null) {
      try { this.#deps.conformance = conformanceOf(this.#deps.host); } catch { this.#deps.conformance = false; }
    }
    return this.#deps.conformance || null;
  }

  migrate() {
    migrateActions(this.sql);
    /* R11: the leg's pinned capture, on a table created before it had the column. */
    const cols = [...this.sql.exec(`PRAGMA table_info(action_basis)`)].map((r) => r.name);
    if (!cols.includes("extent_capture")) this.sql.exec(`ALTER TABLE action_basis ADD COLUMN extent_capture TEXT`);
    /* R64, R19: a proposed law's held standard, on a table created before it had the column. */
    const pcols = [...this.sql.exec(`PRAGMA table_info(action_law_proposals)`)].map((r) => r.name);
    if (!pcols.includes("standard")) this.sql.exec(`ALTER TABLE action_law_proposals ADD COLUMN standard TEXT`);
    /* R74 (T45): an override's ground, on a table created before it had the column. */
    const ocols = [...this.sql.exec(`PRAGMA table_info(action_overrides)`)].map((r) => r.name);
    if (!ocols.includes("ground")) this.sql.exec(`ALTER TABLE action_overrides ADD COLUMN ground TEXT`);
  }

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

  /* R10: the active profiles' combined view (record-core R26), or null with none active or none combinable. */
  #view() {
    let ids = null;
    try { ids = this.record.getSetting("jurisdiction_profiles"); } catch { ids = null; }
    if (typeof ids === "string") { try { ids = JSON.parse(ids); } catch { ids = null; } }
    if (!Array.isArray(ids) || !ids.length) return null;
    const c = combine(ids);
    return c && c.ok ? c.view : null;
  }
  /** R12, R68 (K1444 (iii); N611, K1681): the active profiles' combined view as they stand at the call (K1649), the
   *  place a clock is read in (its `time_zone`, its offices' hours), or null when none can be read. Provided to
   *  `retrieval` and `queue-producers` with `zoneOf`, so none spells its own. Writes nothing; never throws. */
  place() {
    try { return this.#view(); } catch { return null; }
  }
  /** R10 (T45; N858; reconciliation R7): the view this module reads for kinds, counterparties, venues, records laws and
   *  response statuses: `local-facts.governingView` (its R12), so a group's confirmed rule governs here as in
   *  `action-clocks`; with no group rule it is `combine`'s own answer. A host on which local-facts cannot be reached, or
   *  a view it cannot answer, reads the combined view. Null with none. */
  #governing() {
    const lf = this.localFacts;
    let v = null;
    try { v = lf && typeof lf.governingView === "function" ? lf.governingView() : null; } catch { v = null; }
    if (v && v.ok === true && v.view && typeof v.view === "object") return v.view;
    return this.#view();
  }
  /* R81 (T45): the response statuses the governing view holds for `kind` (jurisdictions R58, R77: an entry with no
     `applies_to` applies to every kind), as tokens; null when the view holds none. */
  #responseStatuses(kind) {
    const v = this.#governing();
    const list = v && v.vocabulary && Array.isArray(v.vocabulary.response_statuses) ? v.vocabulary.response_statuses : [];
    const held = list.filter((s) => s && typeof s.status === "string"
      && (s.applies_to === undefined || s.applies_to === null || s.applies_to === kind)).map((s) => s.status);
    return held.length ? held : null;
  }
  /* R85 (T45; my reading, J1 7): the stages the governing view's records law for `law` lists (jurisdictions R76): the
     entry whose citation is `law`, else whose name is; null when none is matched or it lists none. */
  #lawStages(law) {
    if (typeof law !== "string" || !law.trim()) return null;
    const v = this.#governing();
    const laws = v && Array.isArray(v.records_laws) ? v.records_laws : [];
    const t = law.trim();
    const e = laws.find((l) => l && l.citation === t) || laws.find((l) => l && l.name === t);
    return e && Array.isArray(e.stages) ? e.stages : null;
  }
  /* R9, R93 (T45): the governing view's entry for an action kind, or null. */
  #kindEntry(kind) {
    const v = this.#governing();
    const list = v && Array.isArray(v.action_kinds) ? v.action_kinds : [];
    return list.find((k) => k && k.kind === kind) || null;
  }
  /** R10, R42 (N231; action-grammar R1's `actionKinds`): the kinds this instance accepts now: the product's own and the active profiles' combined
   *  view. Writes nothing and never throws: a view that cannot be read answers the product's kinds alone. */
  kinds() {
    let view = null;
    try { view = this.#governing(); } catch { view = null; }
    try { return actionKinds(view); } catch { return actionKinds(null); }
  }

  /* The held version's `bundle_sha`, the compare-and-swap base (record-core R41). */
  #baseOf(id) { const h = this.record.head(id); return h ? h.bundleSha : null; }
  /* Every live file but bundle.md, carried byte for byte into a revision (record-core R13, R43). */
  #carried(id) {
    const out = [];
    for (const path of this.record.livePaths(id) || []) {
      if (path === "bundle.md") continue;
      const f = this.record.readFile(id, path);
      if (!f) continue;
      out.push(typeof f.text === "string" ? { path, text: f.text, bytes: new TextEncoder().encode(f.text).length, sha256: f.sha256 }
                                          : { path, blobSha: f.blobSha, sha256: f.sha256, bytes: f.bytes });
    }
    return out;
  }
  /* R16 (N261): the courtesy lock is given back through record-core's own release (its R61), which never throws. */
  #releaseLease(id, who) { this.record.releaseLease(id, who); }
  #heldFm(id) {
    const f = this.record.readFile(id, "bundle.md");
    if (!f || typeof f.text !== "string") return null;
    const fm = parseFrontmatter(f.text).data;
    return fm && typeof fm === "object" ? fm : null;
  }
  #visibleAction(id, viewer) {
    const gate = viewerPredicate(viewer);
    return this.#one(`SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                     id, ...gate.args);
  }

  /* K57's small helpers, copied from the retired legacy store at the extraction; this module keeps its own copy. */
  static #appendStateHistory(text, e) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = [`  - timestamp: "${e.timestamp}"`,
                   `    from_state: ${e.from_state}`,
                   `    to_state: ${e.to_state}`,
                   `    blurb: "${e.blurb}"`,
                   `    author: ${e.author}`];
    let at = -1;
    for (let i = 1; i < end; i++) if (/^state_history:/.test(lines[i])) { at = i; break; }
    if (at === -1) return [...lines.slice(0, end), "state_history:", ...block, ...lines.slice(end)].join("\n");
    const rest = lines[at].slice("state_history:".length).trim();
    if (rest === "[]") return [...lines.slice(0, at), "state_history:", ...block, ...lines.slice(at + 1)].join("\n");
    if (rest !== "") return null;
    let last = at;
    for (let i = at + 1; i < end; i++) {
      if (/^\s/.test(lines[i]) && lines[i].trim() !== "") last = i;
      else break;
    }
    return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
  }
  static #setScalar(text, key, value) {
    const lines = text.split("\n");
    const end = lines.indexOf("---", 1);
    for (let i = 1; i < (end === -1 ? lines.length : end); i++) {
      if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
    }
    return text;
  }
  static #setOrAddScalar(text, key, value) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return text;
    const end = lines.indexOf("---", 1);
    if (end === -1) return text;
    for (let i = 1; i < end; i++)
      if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
    return [...lines.slice(0, end), `${key}: ${value}`, ...lines.slice(end)].join("\n");
  }
  static #spliceReferences(text, additions) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = additions.map((a) =>
      `  - rel: ${a.rel}\n    target: ${a.target}\n    status: ${a.status}\n    note: "${a.note ?? ""}"`);
    let ref = -1;
    for (let i = 1; i < end; i++) if (/^references:/.test(lines[i])) { ref = i; break; }
    if (ref === -1) return [...lines.slice(0, end), "references:", ...block, ...lines.slice(end)].join("\n");
    const rest = lines[ref].slice("references:".length).trim();
    if (rest === "[]") return [...lines.slice(0, ref), "references:", ...block, ...lines.slice(ref + 1)].join("\n");
    if (rest !== "") return null;
    let last = ref;
    for (let i = ref + 1; i < end; i++) {
      if (lines[i].trim() === "") continue;
      if (/^\s/.test(lines[i])) { last = i; continue; }
      break;
    }
    return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
  }
  static #fmSafe(s) { return String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim(); }
  static #rand(n = 32) {
    return [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  /* One Session Log appender for this module's writers. */
  static #appendSessionLog(text, entry) {
    const at = text.indexOf("## Session Log");
    if (at < 0) return text + "\n## Session Log\n\n" + entry;
    const nxt = text.indexOf("\n## ", at + 1);
    const cut = nxt === -1 ? text.length : nxt + 1;
    return text.slice(0, cut) + entry + "\n" + text.slice(cut);
  }
  /* A revision of `id` through promotion, carrying every other live file (R14, R16, R18, R24). */
  #revise(id, text, fm, b, when, who, marks = {}, state = null) {
    const bytes = new TextEncoder().encode(text);
    return this.promotion.promote({
      bundleId: id, base: this.#baseOf(id), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who, viewer: marks.viewer ?? who, ...marks,
      files: [{ path: "bundle.md", text, bytes: bytes.length, sha256: createSha256().update(bytes).hex() },
              ...this.#carried(id)],
      meta: { object_type: fm.object_type ?? b.object_type, title: fm.title,
              current_state: state ?? fm.current_state ?? b.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
  }

  /* ================================================================ the write: promotion's step (R1–R3, R7, R11, R33) */

  /** R2: the governing-laws block as one comparable value (`[]` and absent are one state). */
  static #lawsKey(fm) {
    if (!fm || typeof fm !== "object") return "unreadable";
    const g = fm.governing_laws;
    const l = Array.isArray(g) && g.length ? g : (g === undefined || g === null || (Array.isArray(g) && !g.length)) ? null : g;
    return JSON.stringify([l, fm.governing_laws_by ?? null, fm.governing_laws_at ?? null]);
  }

  /* D-149 / C-73.1 (R2) — AN ACTION'S GOVERNING LAWS ARE SET BY `op=actionlaws` AND BY NOTHING ELSE. Asked of every
     creation and revision of an action, replay included: any difference not carried under LAWS_ACT is refused. */
  #lawsFence(c, heldFm, nextFm, isAction) {
    const { pkg, bundleId, head } = c;
    const heldAction = head && normalizeType(head.type) === "action";
    if (pkg[LAWS_ACT] || !(heldAction || (!head && isAction))) return null;
    const was = head ? Actions.#lawsKey(heldFm) : JSON.stringify([null, null, null]);
    const now = Actions.#lawsKey(nextFm);
    /* DEC-49 REGION is-promote-governing-laws */
    if (was !== now)
      return refuse("GOVERNING_LAWS_REWRITTEN",
        `${head ? "this revision of" : "this creation of"} ${bundleId} sets or changes its governing laws without `
        + "op=actionlaws. The laws that govern a request are a member's authored statement, set by that act and "
        + "carried forward unchanged by every other write. Nothing was written.", { bundleId });
    /* END DEC-49 REGION is-promote-governing-laws */
    return null;
  }

  /* REC-189 / C-32.19 — ONLY A MEMBER'S AUTHORED ACT SETS OR REVISES A RISK TIER. Two callers ask it: the write's
   * tier fence (`act` false) and `actionRiskTier` (`act` true). At the write it asks a CHANGE, never a presence: a
   * machine may carry a member's tier forward unchanged, and may leave undetermined a tier no member ever set; it may
   * not set one, change one, or drop a member's 1, 2 or 3. At the act a machine is refused whatever it asks for. */
  #machineRiskTierRefusal({ who, nextTier, heldTier, cur, act }) {
    const heldSet = heldTier === 1 || heldTier === 2 || heldTier === 3;
    /* DEC-49 REGION is-machine-set-risk-tier */
    if ((!who || isMachineIdentity(who))
        && (act || (((nextTier === 1 || nextTier === 2 || nextTier === 3) || heldSet) && nextTier !== heldTier)))
      return refuse("MACHINE_CANNOT_SET_RISK_TIER",
        (act ? `op=actionrisktier is a member's authored revision of this action's risk tier (held: ${heldTier}).`
             : cur ? `this revision states risk_tier ${nextTier} where the version it replaces states ${heldTier}.`
                   : `this creation states risk_tier ${nextTier}.`)
        + " A risk tier is a member's assessment of the legal exposure of filing this action, and only a member's "
        + "authored act sets 1, 2 or 3. A machine credential may carry a member's tier forward unchanged, and may "
        + "leave the tier unstated (undetermined) only where no member has set one; it may not remove a member's "
        + "tier. Nothing was written.", { risk_tier: nextTier, held: cur ? heldTier : null });
    /* END DEC-49 REGION is-machine-set-risk-tier */
    return null;
  }

  /* REC-214 / C-90.1 (R1) — AFTER INTAKE, A TIER CHANGES THROUGH `op=actionrisktier` AND NOTHING ELSE. */
  #tierFence(c, heldFm, nextFm, who) {
    const { pkg, bundleId, head } = c;
    const nextTier = riskTierState(nextFm.risk_tier);
    const heldTier = riskTierState(heldFm ? heldFm.risk_tier : undefined);
    const machine = this.#machineRiskTierRefusal({ who, nextTier, heldTier, cur: !!head, act: false });
    if (machine) return machine;
    if (pkg[RISK_TIER_ACT]) return null;
    const histKey = (x) => JSON.stringify(x && typeof x === "object" && x.risk_tier_history !== undefined
                                          && x.risk_tier_history !== null ? x.risk_tier_history : []);
    const tierMoved = head ? nextTier !== heldTier : false;
    const histMoved = histKey(nextFm) !== (head ? histKey(heldFm) : "[]");
    /* DEC-49 REGION is-promote-risk-tier */
    if (tierMoved || histMoved)
      return refuse("RISK_TIER_REWRITTEN",
        (tierMoved ? `this revision of ${bundleId} states risk_tier ${nextTier} where the version it replaces states ${heldTier}`
                   : `this ${head ? "revision" : "creation"} of ${bundleId} ${head ? "changes" : "states"} its risk_tier_history`)
        + " without op=actionrisktier. After intake a risk tier is revised by that act alone — it records who, when "
        + "and why, and keeps every earlier tier readable. Nothing was written.",
        { bundleId, ...(head ? { held: heldTier } : {}), risk_tier: nextTier });
    /* END DEC-49 REGION is-promote-risk-tier */
    return null;
  }

  /* D-689 / C-32.20 (R5): a machine or unstamped author may not state `law` on a creation, nor change or remove it. */
  #machineRecordsLawRefusal(heldFm, nextFm, who, creation) {
    const lawOf = (fm) => (fm && typeof fm.law === "string" && fm.law.trim() ? fm.law.trim() : null);
    const was = creation ? null : lawOf(heldFm), now = lawOf(nextFm);
    /* DEC-49 REGION is-machine-state-records-law */
    if ((!who || isMachineIdentity(who)) && was !== now)
      return refuse("MACHINE_CANNOT_STATE_RECORDS_LAW",
        "which law governs a records request is a member's statement. A machine credential may write a "
        + "records_request stating no law, and may propose one (op=actionlawspropose); it may not state, change or "
        + "remove the law. Nothing was written.", { held: was, law: now });
    /* END DEC-49 REGION is-machine-state-records-law */
    return null;
  }

  /* R6, R7, R9, R10, R33: the C-2.10 arms enforced at the write (C-73.6, C-101), each by its own name, carrying the
     arm's own findings. A MISSING counterparty and a pending entry PAST its date land; the audit reports them (R51). */
  #writeArms(c, heldFm, nextFm, who) {
    const { head, writer, operation } = c;
    const creation = !head;
    /* R6 (N297; action-grammar R3): the law arm's one refusal, minted by `recordsLawRefusal` alone. */
    const law = recordsLawRefusal(nextFm);
    if (law) return law;
    /* DEC-49 REGION is-promote-action-kind */
    const kindMoved = creation || !heldFm || heldFm.action_kind !== nextFm.action_kind;
    if (kindMoved) {
      const kinds = this.kinds();
      if (!kinds.includes(nextFm.action_kind))
        return refuse("ACTION_KIND_UNKNOWN", `action_kind '${String(nextFm.action_kind).slice(0, 40)}' is not a kind your `
          + `group's Civicsmith offers: one of ${kinds.join(", ")}. Nothing was written.`, { legal: kinds });
    }
    /* END DEC-49 REGION is-promote-action-kind */
    /* DEC-49 REGION is-promote-tier-vocabulary */
    if (riskTierState(nextFm.risk_tier) === null)
      return refuse("RISK_TIER_REFUSED", `risk_tier '${String(nextFm.risk_tier).slice(0, 20)}' is not 1, 2, 3 or `
        + "undetermined. Nothing was written.", { legal: Object.keys(RISK_TIERS) });
    /* END DEC-49 REGION is-promote-tier-vocabulary */
    /* DEC-49 REGION is-promote-counterparty */
    const cp = nextFm.counterparty;
    const cpMoved = creation || !heldFm || JSON.stringify(heldFm.counterparty ?? null) !== JSON.stringify(cp ?? null);
    if (cpMoved && cp !== undefined && cp !== null) {
      const cf = [];
      counterpartyFindings(nextFm, cf);
      /* R9: a NEW named office states its role and body (the earlier `{state: named, name}` reads, never written). */
      const office = cp && typeof cp === "object" && !Array.isArray(cp) && cp.state === "named"
        && (cp.kind === undefined || cp.kind === null || cp.kind === "office")
        && !(typeof cp.role === "string" && cp.role.trim() && typeof cp.body === "string" && cp.body.trim());
      /* R9: never a private individual: an `entity_id` the subject registry holds as a person (entities R5). */
      const eid = cp && typeof cp === "object" && !Array.isArray(cp) && typeof cp.entity_id === "string" ? cp.entity_id.trim() : "";
      const eidKind = !cf.length && eid ? this.#entityKind(eid) : null;
      if (!cf.length && eid && eidKind === "person")
        cf.push({ check: "C-2.10", severity: "error", message: `counterparty.entity_id '${eid.slice(0, 40)}' names a person `
          + "in the subject registry: an action is addressed to an office, an organisation or an audience, never a private "
          + "individual (R9, arm: person)" });
      /* R9 (K1484 row 5; B1a.14): an office arm's entity id names an office entity the registry holds. */
      else if (!cf.length && eid && addresseeIsOffice(cp) && eidKind !== "office")
        cf.push({ check: "C-2.10", severity: "error", message: `counterparty.entity_id '${eid.slice(0, 40)}' names `
          + `${eidKind ? `an entity of kind ${eidKind}` : "no entity the subject registry holds"}: an office addressee's entity `
          + "is an office entity (R9, arm: office)" });
      if (cf.length || office)
        return refuse("COUNTERPARTY_REFUSED", cf.length ? cf[0].message
          : "a named counterparty is an office, stated by its official role and the body it belongs to (R9). Nothing was written.",
          { findings: findingsOf(cf.length ? cf : [{ check: "C-2.10", severity: "error", message: "counterparty names no office (role and body)" }]) });
    }
    /* END DEC-49 REGION is-promote-counterparty */
    /* DEC-49 REGION is-promote-action-resolution */
    if (nextFm.current_state === "resolved" && !RESOLUTIONS.includes(nextFm.resolution))
      return refuse("ACTION_RESOLUTION_REFUSED", `a resolved action names how it ended: one of ${RESOLUTIONS.join(", ")}. `
        + "Nothing was written.", { legal: RESOLUTIONS });
    /* END DEC-49 REGION is-promote-action-resolution */
    /* DEC-49 REGION is-promote-clock */
    const clock = nextFm.clock;
    if (clock !== undefined && clock !== null) {
      const bad = [];
      if (!Array.isArray(clock)) bad.push({ check: "C-11.1", detail: "clock is not a list of entries" });
      else clock.forEach((e, i) => {
        if (!e || typeof e !== "object" || !e.text || !e.description) bad.push({ check: "C-11.1", detail: `clock[${i}] lacks the {text, description} shape` });
        else {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) bad.push({ check: "C-11.1", detail: `clock[${i}].date '${e.date}' is not YYYY-MM-DD` });
          if (typeof e.basis !== "string" || !e.basis.trim()) bad.push({ check: "C-11.1", detail: `clock[${i}] has no basis (the statute, order, or commitment the date derives from)` });
          if (!["pending", "met", "overdue", "waived"].includes(e.status)) bad.push({ check: "C-11.1", detail: `clock[${i}].status '${e.status}' is not one of: pending, met, overdue, waived` });
        }
      });
      if (bad.length) return refuse("CLOCK_REFUSED", bad[0].detail, { findings: bad });
    }
    /* END DEC-49 REGION is-promote-clock */
    /* DEC-49 REGION is-promote-clock-mechanical */
    if (!creation && (!who || isMachineIdentity(who) || writer === "mechanical")) {
      /* R33 (K1444 (iii)): "passed" on the office's local day; with no zone held no entry has passed. */
      const today = localToday(this.#nowMs(null), zoneOf(this.place())) ?? "0000-00-00";
      const heldClock = heldFm && Array.isArray(heldFm.clock) ? heldFm.clock : [];
      const nextClock = Array.isArray(clock) ? clock : [];
      const recheck = writer === "mechanical" && operation === "deadline-recheck";
      const moved = clockMovesNotMechanical(heldClock, nextClock, today);
      const reshaped = heldClock.length !== nextClock.length
        || heldClock.some((e, i) => Actions.#clockShape(e) !== Actions.#clockShape(nextClock[i]));
      if (moved.length || reshaped || (!recheck && JSON.stringify(heldClock) !== JSON.stringify(nextClock)))
        return refuse("CLOCK_STATUS_NOT_MECHANICAL", "a machine write may move a pending clock entry whose date has "
          + "passed to overdue, and nothing else: it never adds, removes or re-dates an entry or sets another status. "
          + "Nothing was written.", { moves: moved });
    }
    /* END DEC-49 REGION is-promote-clock-mechanical */
    return null;
  }

  /* R33: a clock entry with its status left out, so a comparison sees every other key. */
  static #clockShape(e) {
    if (!e || typeof e !== "object") return JSON.stringify(e ?? null);
    return JSON.stringify(Object.keys(e).filter((k) => k !== "status").sort().map((k) => [k, e[k]]));
  }

  /** R8, R74 (T45): the premise override a document states, `{ground, reason}`, or null when it states none. The bytes
   *  hold the ground flat on the override (`ground_kind`, `ground_citation`, `ground_date`, `ground_what`,
   *  `ground_when`: the restricted grammar holds no map inside a map; K2849), presented as R74's object by
   *  action-grammar's `premiseOverrideOf`; `ground` is null for an override written before T45 with its reason alone. */
  static overrideOf(fm) {
    const o = fm && typeof fm === "object" ? fm.premise_override : null;
    if (!(o && typeof o === "object" && !Array.isArray(o) && typeof o.reason === "string" && o.reason.trim())) return null;
    return { ground: premiseOverrideOf(o).ground, reason: o.reason.trim() };
  }

  /* R8 (K600 (a)), R74 (T45), R9 (D1): the premise override and a breach action's addressee. The override is stated by
     a member on the write that first sets `breach: true`, with a ground and a reason, and then never edited, removed or
     added; a breach action that states its addressee addresses an office. */
  #overrideAndAddressee(heldFm, nextFm, who) {
    const key = (fm) => JSON.stringify(fm && fm.premise_override !== undefined ? fm.premise_override : null);
    const held = key(heldFm), next = key(nextFm);
    if (held !== next) {
      /* DEC-49 REGION is-machine-override */
      if (!who || isMachineIdentity(who))
        return refuse("MACHINE_CANNOT_OVERRIDE", "a premise override is a member's open statement that the group acts on "
          + "a breach it has not determined, on a stated ground and with the reason why. A machine credential may not "
          + "state or change one. Nothing was written.");
      /* END DEC-49 REGION is-machine-override */
      const o = nextFm.premise_override;
      /* DEC-49 REGION is-premise-override */
      const firstBreach = nextFm.breach === true && !(heldFm && heldFm.breach === true);
      if (held !== "null" || !firstBreach)
        return refuse("PREMISE_OVERRIDE_REWRITTEN", held !== "null"
          ? "this write edits or removes the action's premise override. It is stated once and kept as it was. Nothing was written."
          : "a premise override is stated on the creation or revision that first marks the action a breach, and on no "
            + "other write. Nothing was written.");
      const keys = o && typeof o === "object" && !Array.isArray(o) ? Object.keys(o) : null;
      if (!keys || keys.some((k) => k !== "reason" && !OVERRIDE_KEYS.includes(k)) || typeof o.reason !== "string"
          || !o.reason.trim() || o.reason.length > NOTE_MAX || /["\\\r\n]/.test(o.reason))
        return refuse("PREMISE_OVERRIDE_REFUSED", `premise_override is {ground, reason}: the reason 1 to ${NOTE_MAX} `
          + "characters with no quote, backslash or line break, and nothing else beside them. Nothing was written.",
          { max: NOTE_MAX });
      /* END DEC-49 REGION is-premise-override */
      /* R74 (T45; N884; v0.2 rule 2): one of two grounds (action-grammar R15). With none, or another kind, the refusal
         names both and carries the quick route (a case of one finding run through every publication check, on which a
         member may determine; `action-clocks` answers the deadline's window beside it, reconciliation R16); a malformed
         ground is refused by the grammar's first finding, naming the part. */
      const found = [];
      overrideGroundFindings(Actions.overrideOf(nextFm), found);
      const errors = found.filter((x) => x.severity === "error");
      /* DEC-49 REGION is-override-ground */
      if (errors.length)
        return refuse(errors[0].code, errors[0].message + ". Nothing was written.", { findings: findingsOf(errors),
          ...(errors[0].code === "OVERRIDE_NO_GROUND" ? { grounds: [...OVERRIDE_GROUNDS], quick_route: { ...QUICK_ROUTE } } : {}) });
      /* END DEC-49 REGION is-override-ground */
    }
    const cp = nextFm.counterparty;
    /* DEC-49 REGION is-breach-addressee */
    if (nextFm.breach === true && cp !== undefined && cp !== null && !addresseeIsOffice(cp))
      return refuse("ADDRESSEE_NOT_AN_OFFICE", "an action recorded for a breach is addressed to the office responsible, "
        + "by its official role and body; this one is addressed to "
        + `${cp && typeof cp === "object" && cp.state === "named" ? `a ${cp.kind}` : `${cp && cp.state ? `an addressee ${cp.state}` : "no office"}`}. `
        + "Nothing was written.", { counterparty_state: cp && typeof cp === "object" ? cp.state ?? null : null });
    /* END DEC-49 REGION is-breach-addressee */
    return null;
  }

  /* R45 (D5), R46 (Bob's ruling 1 of 2026-09-29): the group's contact, set or changed by a member and naming one; the
     plan and option an action was started from, set on its creation and never changed or removed. */
  #contactAndPlan(c, heldFm, nextFm, who) {
    const same = (k) => JSON.stringify(heldFm && heldFm[k] !== undefined ? heldFm[k] : null)
      === JSON.stringify(nextFm[k] !== undefined ? nextFm[k] : null);
    if (!same("contact")) {
      /* DEC-49 REGION is-machine-contact */
      if (!who || isMachineIdentity(who))
        return refuse("MACHINE_CANNOT_SET_CONTACT", "the group's contact for an action is a member's choice; a machine "
          + "credential may not set or change it. Nothing was written.");
      /* END DEC-49 REGION is-machine-contact */
      const id = contactId(nextFm.contact);
      let facts = null;
      if (id) { try { facts = this.membership.memberFacts(id); } catch { facts = null; } }
      if ((nextFm.contact !== undefined && nextFm.contact !== null) && !facts) return contactNotAMember();
    }
    const has = (fm, k) => fm && fm[k] !== undefined && fm[k] !== null && fm[k] !== "";
    /* DEC-49 REGION is-plan-link */
    if (c.head) {
      if (!same("plan") || !same("option"))
        return refuse("PLAN_LINK_REWRITTEN", "the plan and option an action was started from are set when it is created "
          + "and never set, changed or removed by a revision. Nothing was written.");
    } else if (has(nextFm, "plan") || has(nextFm, "option")) {
      const plan = nextFm.plan, option = nextFm.option;
      if (typeof plan !== "string" || !PLAN_ID_RE.test(plan)
          || !((typeof option === "string" && /^[A-Za-z0-9_.:-]{1,80}$/.test(option)) || Number.isInteger(option)))
        return refuse("PLAN_LINK_REFUSED", "plan is a PLN- id and option a token of 1 to 80 letters, digits, '_', '.', ':' "
          + "or '-', stated together. Nothing was written.");
    }
    /* END DEC-49 REGION is-plan-link */
    return null;
  }

  /* R64 (K1446), R65 (C1): the records-request law's held standard (`law_standard`) and the `proceeding`, each set or
     changed only by a member and naming a record the author may see: a standard through `standards.standardRead`
     (`NO_SUCH_STANDARD`, minted by `standards.noSuchStandard`), a proceeding through the registry (`NO_SUCH_ENTITY`,
     minted by `entities.noSuchEntity`; another kind `NOT_A_PROCEEDING`). Asked only when the value moved. */
  #heldLinks(heldFm, nextFm, who, viewer) {
    const val = (fm, k) => (fm && typeof fm[k] === "string" && fm[k].trim() ? fm[k].trim() : fm && fm[k] !== undefined && fm[k] !== null && fm[k] !== "" ? fm[k] : null);
    const lawStd = val(nextFm, "law_standard");
    if (JSON.stringify(val(heldFm, "law_standard")) !== JSON.stringify(lawStd)) {
      if (!who || isMachineIdentity(who))
        return refuse("MACHINE_CANNOT_STATE_RECORDS_LAW", "which law governs a records request, and the held standard it "
          + "names, are a member's statement. A machine credential may propose one (op=actionlawspropose); it may not "
          + "state, change or remove it. Nothing was written.", { held: val(heldFm, "law_standard"), law_standard: lawStd });
      if (lawStd !== null && (nextFm.action_kind !== "records_request" || typeof nextFm.law !== "string" || !nextFm.law.trim()))
        return refuse("RECORDS_LAW_REFUSED", "law_standard names the held standard of a records request's stated law; "
          + "this action states no law, or is not a records_request. Nothing was written.",
          { findings: [{ check: "C-2.10", detail: "law_standard is stated with no law on a records_request (R64)",
                         repairs: ["state the law by its citation", "or remove law_standard"] }] });
      if (lawStd !== null) {
        const r = this.#standardSeen(lawStd, viewer);
        if (r) return r;
      }
    }
    const proc = val(nextFm, "proceeding");
    if (JSON.stringify(val(heldFm, "proceeding")) !== JSON.stringify(proc)) {
      /* DEC-49 REGION is-machine-set-proceeding */
      if (!who || isMachineIdentity(who))
        return refuse("MACHINE_CANNOT_SET_PROCEEDING", "the proceeding an action belongs to is a member's statement; a "
          + "machine credential may not set, change or remove it. Nothing was written.");
      /* END DEC-49 REGION is-machine-set-proceeding */
      if (proc !== null) {
        const r = this.#proceedingRefusal(proc);
        if (r) return r;
      }
    }
    return null;
  }
  /* R64: null when `id` is a standard the viewer may read, else `standards.noSuchStandard`'s one answer. */
  #standardSeen(id, viewer) {
    const sid = typeof id === "string" ? id.trim() : "";
    const st = this.standards;
    let r = null;
    if (sid && BUNDLE_ID_RE.test(sid) && sid.startsWith("STD-") && st) {
      try { r = st.standardRead({ id: sid, viewer }); } catch { r = null; }
    }
    return r && r.ok ? null : noSuchStandard(sid || (typeof id === "string" ? id : null));
  }
  /* R65: null when `id` is a registered entity of kind `proceeding`, else the refusal. */
  #proceedingRefusal(id) {
    const pid = typeof id === "string" ? id.trim() : "";
    const kind = pid ? this.#entityKind(pid) : null;
    if (!kind) return noSuchEntity(pid || null, { end: "proceeding" });
    /* DEC-49 REGION is-proceeding-kind */
    if (kind !== "proceeding")
      return refuse("NOT_A_PROCEEDING", `proceeding names an entity of kind ${kind}; an action belongs to an entity of `
        + "kind proceeding. Nothing was written.", { entity_id: pid, kind });
    /* END DEC-49 REGION is-proceeding-kind */
    return null;
  }

  /* R70, R72 (H30 (1); K2505, K2552, K2553, K2561): a creation or revision stating `seeks`, or changing or removing it,
     is judged before any write: a machine or unstamped author may not (R72: what a request asks the records for is a
     member's statement; a machine proposes it, R73); then `#seeksRefusal` (R70). Asked only when `seeks` moved, so a later
     revision is never refused for a progression's later version. */
  #seeksFence(heldFm, nextFm, who) {
    const key = (fm) => JSON.stringify(fm && fm.seeks !== undefined && fm.seeks !== null ? fm.seeks : null);
    if (key(heldFm) === key(nextFm)) return null;
    /* DEC-49 REGION is-machine-state-seeks */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_STATE_SEEKS", "which stages a records request asks the records for is a member's "
        + "statement; a machine credential may not state, change or remove it, and may propose it "
        + "(op=actionseekspropose). Nothing was written.");
    /* END DEC-49 REGION is-machine-state-seeks */
    return this.#seeksRefusal(nextFm);
  }

  /* R70, R73: action-grammar's `seeksFindings` (its R13) over `fm`, with the facts read here through
     `progressions.readProgression`, one entry per distinct progression an item names: its declared stage keys, or null
     for a progression the record does not hold. A definition that cannot be read is read as not held (fail closed), and
     the refusal says so. The refusal is the grammar's own (C-117.29), relayed with every finding; null when none. */
  #seeksRefusal(fm) {
    const stages = {};
    let unreadable = false;
    const items = Array.isArray(fm.seeks) ? fm.seeks : [];
    for (const p of new Set(items.map((x) => (x && typeof x === "object" ? x.progression : null))
                              .filter((x) => typeof x === "string" && x.trim()))) {
      let r = null;
      try { r = this.progressions ? this.progressions.readProgression({ progressionKey: p }) : null; } catch { r = null; }
      if (!r || r.ok === false) { unreadable = true; stages[p] = null; continue; }
      stages[p] = r.found ? (r.stages || []).map((st) => st.stage_key) : null;
    }
    const found = [];
    seeksFindings(fm, { stages }, found);
    const errors = found.filter((x) => x.severity === "error");
    if (!errors.length) return null;
    return refuse(errors[0].code, errors[0].message, { findings: findingsOf(errors),
      ...(unreadable ? { cause: "PROGRESSIONS_UNREADABLE" } : {}) });
  }

  /* T45: the errors of an action-grammar arm (R15, R20–R23), as the refusal reads them. */
  static #errors(list) { return (Array.isArray(list) ? list : []).filter((x) => x && x.severity === "error"); }
  static #pushed(fn, ...args) { const out = []; fn(...args, out); return Actions.#errors(out); }
  /* T45: the refusal minted from a grammar arm's first finding, every finding carried; `dflt` when it names no code. */
  static #fromFindings(errors, dflt, extra = {}) {
    return errors.length ? refuse(errors[0].code || dflt, errors[0].message, { findings: findingsOf(errors), ...extra }) : null;
  }

  /* T45 (R33, R77–R79, R82, R86, R94; R81, R83 at the write): the fields an action states beside its addressee, each
     asked only when it moved, so a later revision is never refused for a field it carries forward. A machine or
     unstamped author states none of them (R33); each shape is action-grammar's (R20–R23), each refusal minted here from
     its first finding; what only the record can answer (an entity's kind, a member, an action the author may see) is
     asked here. */
  #t45Fields(c, heldFm, nextFm, who, viewer) {
    const machine = !who || isMachineIdentity(who);
    const moved = (k) => JSON.stringify(heldFm && heldFm[k] !== undefined ? heldFm[k] : null)
      !== JSON.stringify(nextFm[k] !== undefined ? nextFm[k] : null);
    const stated = (k) => nextFm[k] !== undefined && nextFm[k] !== null;
    /* R77: copied offices, checked as the counterparty is; never the addressee. */
    if (moved("copied")) {
      /* DEC-49 REGION is-machine-set-copied */
      if (machine) return refuse("MACHINE_CANNOT_SET_COPIED", "the offices an action copies are a member's statement; a "
        + "machine credential may not set or change them. Nothing was written.");
      /* END DEC-49 REGION is-machine-set-copied */
      if (stated("copied")) {
        const r = Actions.#fromFindings(Actions.#pushed(copiedFindings, nextFm), "COUNTERPARTY_REFUSED");
        if (r) return r;
        const bad = (Array.isArray(nextFm.copied) ? nextFm.copied : []).map((e, i) => ({ e, i }))
          .find(({ e }) => e && typeof e.entity_id === "string" && e.entity_id.trim()
            && (this.#entityKind(e.entity_id.trim()) === "person"
                || (addresseeIsOffice(e) && this.#entityKind(e.entity_id.trim()) !== "office")));
        if (bad) return refuse("COUNTERPARTY_REFUSED", `copied[${bad.i}].entity_id names a person or no office the subject `
          + "registry holds: a copied office is an office, never a private individual (R77, R9). Nothing was written.",
          { findings: [{ check: "C-2.10", detail: `copied[${bad.i}].entity_id: not an office entity (R9, arm: office)` }] });
      }
    }
    /* R78: partners, organisations by role, stated by a member. */
    if (moved("partners")) {
      /* DEC-49 REGION is-machine-set-partners */
      if (machine) return refuse("MACHINE_CANNOT_SET_PARTNERS", "the partner organisations of a joint action are a "
        + "member's statement; a machine credential may not set or change them. Nothing was written.");
      /* END DEC-49 REGION is-machine-set-partners */
      if (stated("partners")) {
        const r = Actions.#fromFindings(Actions.#pushed(partnersFindings, nextFm), "PARTNERS_REFUSED");
        if (r) return r;
        const list = Array.isArray(nextFm.partners) ? nextFm.partners : [];
        for (let i = 0; i < list.length; i++) {
          const eid = list[i] && typeof list[i].entity_id === "string" ? list[i].entity_id.trim() : "";
          if (!eid) continue;
          const kind = this.#entityKind(eid);
          /* DEC-49 REGION is-partners-entity */
          if (!ORGANISATION_KINDS.includes(kind))
            return refuse("PARTNERS_REFUSED", `partners[${i}].entity_id names ${kind ? `an entity of kind ${kind}` : "no entity "
              + "the subject registry holds"}: a partner is an organisation, never a person. Nothing was written.`,
              { entry: i, findings: [{ check: "C-2.10", detail: `partners[${i}].entity_id is not an organisation (R78)` }] });
          /* END DEC-49 REGION is-partners-entity */
        }
      }
    }
    /* R79: press terms, on a press action, stated by a member; each change kept in the history (R36). */
    if (moved("press_terms")) {
      /* DEC-49 REGION is-machine-set-press-terms */
      if (machine) return refuse("MACHINE_CANNOT_SET_PRESS_TERMS", "the terms agreed with the press are a member's "
        + "statement; a machine credential may not set or change them. Nothing was written.");
      /* END DEC-49 REGION is-machine-set-press-terms */
      if (stated("press_terms")) {
        const r = Actions.#fromFindings(Actions.#pushed(pressTermsFindings, nextFm), "PRESS_TERMS_REFUSED");
        if (r) return r;
      }
    }
    /* R82: whether the body owes the group a reply, with the member's reason (`reply_owed_reason`). */
    if (moved("reply_owed") || moved("reply_owed_reason")) {
      /* DEC-49 REGION is-machine-set-reply-owed */
      if (machine) return refuse("MACHINE_CANNOT_SET_REPLY_OWED", "whether a body owes the group a reply is a member's "
        + "statement; a machine credential may not set or change it. Nothing was written.");
      /* END DEC-49 REGION is-machine-set-reply-owed */
      /* the value and its reason are judged together by action-grammar R23 (K2861): one site for REPLY_OWED_REFUSED */
      const r = Actions.#fromFindings(Actions.#pushed(actionFieldFindings,
        { reply_owed: nextFm.reply_owed, reply_owed_reason: nextFm.reply_owed_reason }, { bundleId: c.bundleId }), "REPLY_OWED_REFUSED");
      if (r) return r;
    }
    /* R86: the earlier action this one follows, stated on its creation and never changed. */
    if (moved("follows_action")) {
      /* DEC-49 REGION is-follows-action-rewritten */
      if (heldFm) return refuse("FOLLOWS_ACTION_REWRITTEN", "the action an action follows is stated when it is created "
        + "and never set, changed or removed by a revision. Nothing was written.");
      /* END DEC-49 REGION is-follows-action-rewritten */
      if (stated("follows_action")) {
        const r = Actions.#fromFindings(Actions.#pushed(actionFieldFindings, { follows_action: nextFm.follows_action },
          { bundleId: c.bundleId }), "FOLLOWS_ACTION_REFUSED");
        if (r) return r;
        const f = nextFm.follows_action;
        const target = f && typeof f === "object" && typeof f.action === "string" ? f.action.trim() : "";
        const b = target ? this.#visibleAction(target, viewer) : null;
        if (!b || normalizeType(b.object_type) !== "action") return noSuchAction(target || null);
      }
    }
    /* R81, R83, R94: the fields of an entry new or changed in this version (speaker, office_status, found_elsewhere). */
    const heldLedger = heldFm && Array.isArray(heldFm.correspondence) ? heldFm.correspondence : [];
    const ledger = Array.isArray(nextFm.correspondence) ? nextFm.correspondence : [];
    for (let i = 0; i < ledger.length; i++) {
      const e = ledger[i];
      if (!e || typeof e !== "object" || JSON.stringify(e) === JSON.stringify(heldLedger[i] ?? null)) continue;
      if (!ENTRY_FIELD_KEYS.some((k) => e[k] !== undefined)) continue;
      const r = this.#entryFieldRefusal(ledger, i, nextFm.action_kind, who,
        JSON.stringify(e.speaker ?? null) !== JSON.stringify(heldLedger[i] ? heldLedger[i].speaker ?? null : null));
      if (r) return r;
    }
    return null;
  }

  /* R81, R83, R94 (T45): an entry's T45 fields, as the act and the write judge them: a speaker set by a member only and
     naming one (`contactNotAMember`), then action-grammar's R22 over the entry with the governing view's response
     statuses for the action's kind. */
  #entryFieldRefusal(ledger, i, kind, who, speakerMoved) {
    const e = ledger[i];
    if (speakerMoved && e.speaker !== undefined && e.speaker !== null) {
      /* DEC-49 REGION is-machine-contact-speaker */
      if (!who || isMachineIdentity(who))
        return refuse("MACHINE_CANNOT_SET_CONTACT", "who spoke for the group in a sending is a member's statement; a "
          + "machine credential may not set it. Nothing was written.");
      /* END DEC-49 REGION is-machine-contact-speaker */
    }
    const r = Actions.#fromFindings(Actions.#errors(entryFieldFindings(ledger, i,
      { responseStatuses: this.#responseStatuses(kind) || [] })), "CORRESPONDENCE_REFUSED");
    if (r) return r;
    if (speakerMoved && e.speaker !== undefined && e.speaker !== null) {
      const id = contactId(e.speaker);
      let facts = null;
      if (id) { try { facts = this.membership.memberFacts(id); } catch { facts = null; } }
      if (!facts) return contactNotAMember({ field: `correspondence[${i}].speaker` });
    }
    return null;
  }

  /** R81, R83, R94 (T45): an entry with its T45 fields as R22 names them: `office_status: {words, status?}` and
   *  `found_elsewhere: {kind, note?}` from the flat keys the bytes hold (`office_words`, `office_status`,
   *  `found_elsewhere`, `found_elsewhere_note`; J2's reading), `speaker` as written. Other keys as they are. */
  static entryFields(e) {
    if (!e || typeof e !== "object") return e;
    const { office_words, office_status, found_elsewhere, found_elsewhere_note, pressure_kind, pressure_note, ...rest } = e;
    const out = { ...rest };
    if (pressure_kind !== undefined || pressure_note !== undefined)
      out.pressure = { ...(pressure_kind !== undefined ? { kind: pressure_kind } : {}),
                       ...(pressure_note !== undefined ? { note: pressure_note } : {}) };
    if (office_words !== undefined || office_status !== undefined)
      out.office_status = { ...(office_words !== undefined ? { words: office_words } : {}),
                            ...(office_status !== undefined ? { status: office_status } : {}) };
    if (found_elsewhere !== undefined || found_elsewhere_note !== undefined)
      out.found_elsewhere = { ...(found_elsewhere !== undefined ? { kind: found_elsewhere } : {}),
                              ...(found_elsewhere_note !== undefined ? { note: found_elsewhere_note } : {}) };
    return out;
  }

  /* R3 (N237, K351): a document holding more legs or entries than the projection reads is refused where it is authored
     or revised, with the count and the limit; a replay is never asked (the projection skips it whole). */
  #tooLarge(fm) {
    const legs = Array.isArray(fm.action_basis) ? fm.action_basis.length : 0;
    const ledger = Array.isArray(fm.correspondence) ? fm.correspondence.length : 0;
    if (legs <= ACTION_LEGS_MAX && ledger <= ACTION_LEDGER_MAX) return null;
    const part = legs > ACTION_LEGS_MAX ? "action_basis" : "correspondence";
    const count = part === "action_basis" ? legs : ledger;
    const limit = part === "action_basis" ? ACTION_LEGS_MAX : ACTION_LEDGER_MAX;
    /* DEC-49 REGION is-action-too-large */
    return refuse("ACTION_TOO_LARGE", `this action's ${part} holds ${count} entries; an action holds at most ${limit}. `
      + "Nothing was written.", { part, count, limit });
    /* END DEC-49 REGION is-action-too-large */
  }

  /** R1–R3, R5–R8, R33: this module's check, run inside every promotion before the write (promotion R39). */
  check(c) {
    const { pkg, meta, author, bundleId, files, head } = c;
    const md = (files || []).find((f) => f && f.path === "bundle.md");
    const nextFm = c.docFm && typeof c.docFm === "object" ? c.docFm
      : (md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null);
    const heldFm = head ? this.#heldFm(bundleId) : null;
    const isAction = normalizeType(meta && meta.object_type) === "action"
      || (nextFm && typeof nextFm === "object" && normalizeType(nextFm.object_type) === "action");
    const laws = this.#lawsFence(c, heldFm, nextFm, isAction);
    if (laws) return laws;
    const who = String(author ?? "").trim();
    /* D-505: both spellings of "this is an action", and the union can only add refusals. Replay is exempt from the
       shape arms: the record's own history must be holdable verbatim. */
    if (isAction && nextFm && typeof nextFm === "object" && !pkg.replay) {
      const tier = this.#tierFence(c, heldFm, nextFm, who);
      if (tier) return tier;
      const law = this.#machineRecordsLawRefusal(heldFm, nextFm, who, !head);
      if (law) return law;
      const arms = this.#writeArms(c, heldFm, nextFm, who);
      if (arms) return arms;
      const premise = this.#overrideAndAddressee(heldFm, nextFm, who);
      if (premise) return premise;
      const link = this.#contactAndPlan(c, heldFm, nextFm, who);
      if (link) return link;
      const t33 = this.#heldLinks(heldFm, nextFm, who, pkg.actorViewer ?? pkg.viewer ?? c.viewer ?? (who || null));
      if (t33) return t33;
      const seeks = this.#seeksFence(heldFm, nextFm, who);
      if (seeks) return seeks;
      const t45 = this.#t45Fields(c, heldFm, nextFm, who, pkg.actorViewer ?? pkg.viewer ?? c.viewer ?? (who || null));
      if (t45) return t45;
      const large = this.#tooLarge(nextFm);
      if (large) return large;
      /* REC-24: the legs (ACTION_BASIS_REFUSED), the ledger (CORRESPONDENCE_REFUSED) and what only the record can
         resolve — a leg or a hash naming nothing it holds. */
      const af = []; actionBasisFindings(nextFm, af);
      if (af.some((x) => x.severity === "error")) return refuse("ACTION_BASIS_REFUSED", undefined, { findings: findingsOf(af) });
      const cf = []; correspondenceFindings(nextFm, cf);
      if (cf.some((x) => x.severity === "error")) return refuse("CORRESPONDENCE_REFUSED", undefined, { findings: findingsOf(cf) });
      for (const leg of (Array.isArray(nextFm.action_basis) ? nextFm.action_basis : [])) {
        if (!leg || typeof leg.target !== "string") continue;
        if (!this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, leg.target)
            && !(leg.kind === "rests_on" && this.#successRecord(leg.target, pkg.actorViewer ?? pkg.viewer ?? c.viewer ?? (who || null))))
          return refuse("ACTION_BASIS_REFUSED", undefined, { target: leg.target, findings: [{ check: "C-2.10",
            detail: `action_basis target '${leg.target}' does not resolve in this store: an action that names why it `
                  + "exists names something that exists, or it points a reader at nothing while claiming a reason" }] });
      }
      for (const e of (Array.isArray(nextFm.correspondence) ? nextFm.correspondence : [])) {
        if (!e || typeof e.artifact_sha !== "string" || !e.artifact_sha.trim()) continue;
        const sha = e.artifact_sha.trim().replace(/^sha256:/, "").toLowerCase();
        if (!this.#one(`SELECT capture_sha FROM register WHERE capture_sha=?`, sha))
          return refuse("CORRESPONDENCE_REFUSED", undefined, { artifact_sha: sha, findings: [{ check: "C-2.10",
            detail: `correspondence artifact_sha '${sha.slice(0, 16)}...' does not resolve in the register: an entry `
                  + "claiming captured bytes names bytes this store holds, or it is testimony and says so with an "
                  + "account and an author (DEC-13)",
            repairs: ["capture the artifact first (op=capture), then record its sha", "or record a named account instead"] }] });
      }
      /* R8 (K256, N271): the determination is read as the act's viewer sees it: the session's viewer the control plane
         stamps on `op=promote` (`actorViewer`, promotion's "For callers"), else the viewer this module's own acts pass;
         a write that names neither reads as its author. */
      const breach = this.#breachRefusal(nextFm, pkg.actorViewer ?? pkg.viewer ?? c.viewer ?? (who || null));
      if (breach) return breach;
    }
    /* REC-24 (g) / C-6.1: a responds_to edge's shape from the catalogue, its resolution from the record. */
    if (nextFm && typeof nextFm === "object" && !pkg.replay) {
      const rf = []; respondsToEdgeFindings(nextFm, rf);
      if (rf.some((x) => x.severity === "error")) return refuse("RESPONDS_TO_REFUSED", undefined, { findings: findingsOf(rf) });
      for (const r of (Array.isArray(nextFm.references) ? nextFm.references : [])) {
        if (!r || typeof r !== "object" || r.rel !== "responds_to") continue;
        if (!this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, r.target))
          return refuse("RESPONDS_TO_REFUSED", undefined, { target: r.target, findings: [{ check: "C-6.1",
            detail: `responds_to target '${r.target}' does not resolve in this store: this document claims to be `
                  + "what came back from an ask that is not here" }] });
      }
    }
    return null;
  }

  /* R8 (e), R93 (T45): the live success record `id` names, as the viewer reads it (`consequences.successRecordRead`, its
     R20), or null when it names none the viewer may see, none is live, or no success record can be read here. */
  #successRecord(id, viewer) {
    const cons = this.consequences;
    if (!cons || typeof cons.successRecordRead !== "function" || typeof id !== "string" || !SUCCESS_RECORD_ID_RE.test(id)) return null;
    let r = null;
    try { r = cons.successRecordRead({ id, viewer }); } catch { r = null; }
    return r && r.ok !== false && !r.superseded_by ? r : null;
  }

  /* R8: an action recorded for a breach (`breach: true`) rests on a live conformance determination the author may see,
     noncompliant for at least one standard it names (T45 (a); K2781 (4)) and not void (T45 (b), conformance R33). With no
     conformance provider the determination cannot be read, and the write is refused, never passed. Each leg is asked
     superseded, then void, then noncompliant (J1 1: a void determination reads every outcome undetermined); the act
     passes on any leg that is all three, else the first condition found in that order answers. */
  #breachRefusal(fm, viewer) {
    if (fm.breach !== true) return null;
    /* R8 (K600 (a)), R74: a member's premise override, judged by `#overrideAndAddressee` before this, stands in for the
       determination; it is disclosed on everything prepared from the action (`filings` R24, R75 here). */
    if (Actions.overrideOf(fm)) return null;
    const legs = (Array.isArray(fm.action_basis) ? fm.action_basis : [])
      .filter((l) => l && typeof l === "object" && l.kind === "rests_on" && typeof l.target === "string");
    const conf = this.conformance;
    const readable = !!conf && typeof conf.determinationRead === "function";
    let superseded = null, voided = null, notNoncompliant = null;
    for (const l of (readable ? legs : [])) {
      let d = null;
      try { d = conf.determinationRead({ id: l.target, viewer }); } catch { d = null; }
      if (!d || d.ok === false) continue;
      if (d.live === false || d.superseded_by) { superseded ||= { id: l.target, by: d.superseded_by ?? null }; continue; }
      if (d.void) { voided ||= { id: l.target, causes: Array.isArray(d.void.causes) ? d.void.causes : [] }; continue; }
      if (!Actions.#noncompliant(d)) { notNoncompliant ||= l.target; continue; }
      return null;
    }
    /* N312 (K275): the condition is conformance's, and its answer is minted there (its R20). */
    if (superseded) return determinationSuperseded(superseded.id, superseded.by);
    /* T45 (b): the void determination's answer is conformance's own (its R33). */
    if (voided) return determinationVoided(voided.id, voided.causes);
    /* DEC-49 REGION is-breach-not-noncompliant */
    if (notNoncompliant)
      return refuse("DETERMINATION_NOT_NONCOMPLIANT", "an action recorded for a breach rests on a determination that the "
        + "government acted out of conformance with at least one standard it names; the determination it names records "
        + "no noncompliant outcome. Nothing was written.", { determination: notNoncompliant });
    /* END DEC-49 REGION is-breach-not-noncompliant */
    /* DEC-49 REGION is-breach-determination */
    return refuse("ACTION_NO_DETERMINATION", readable
      ? "an action recorded for a breach rests on a live conformance determination you may see, as a rests_on leg. "
        + "None of its legs names one. Nothing was written."
      : "an action recorded for a breach rests on a conformance determination, and no determination can be read on "
        + "your group's Civicsmith yet, so none could be found. Nothing was written.",
      readable ? {} : { cause: "CONFORMANCE_UNAVAILABLE" });
    /* END DEC-49 REGION is-breach-determination */
  }
  /* R8 (a): a determination noncompliant for at least one standard, as `determinationRead` answers its outcomes. */
  static #noncompliant(d) {
    return (Array.isArray(d.outcomes) ? d.outcomes : []).some((o) => o && o.outcome === "noncompliant");
  }
  /* R8, R75, R76, R93: each `rests_on` leg's determination as the viewer reads it, `{id, d}`; legs naming none skipped. */
  #legDeterminations(fm, viewer) {
    const conf = this.conformance;
    if (!conf || typeof conf.determinationRead !== "function") return [];
    const out = [];
    for (const l of (Array.isArray(fm && fm.action_basis) ? fm.action_basis : [])) {
      if (!l || typeof l !== "object" || l.kind !== "rests_on" || typeof l.target !== "string") continue;
      let d = null;
      try { d = conf.determinationRead({ id: l.target, viewer }); } catch { d = null; }
      if (d && d.ok !== false) out.push({ id: l.target, d });
    }
    return out;
  }

  /** R3, R11: this module's projection, in the promotion's transaction after the write: legs, ledger and quotes
   *  replaced whole from the document. A malformed replayed entry is skipped, never half-written. It reads at most
   *  `ACTION_LEGS_MAX` legs and `ACTION_LEDGER_MAX` entries (N237): a replayed document holding more is skipped whole,
   *  its rows cleared and none written, never half-projected (the write refuses one, `#tooLarge`). */
  project(c) {
    const { bundleId, promotedType } = c;
    const fm = c.docFm;
    /* R11: a leg's pinned capture is kept as it was first stamped; a leg new in this version is stamped now. The rows
       held are this projection's own, so never more than it writes. */
    const held = new Map(this.#rows(`SELECT target_id, kind, extent_capture FROM action_basis WHERE bundle_id=?
      ORDER BY ord LIMIT ?`, bundleId, ACTION_LEGS_MAX)
      .map((r) => [`${r.target_id}\u0000${r.kind}`, r.extent_capture]));
    this.sql.exec(`DELETE FROM action_basis WHERE bundle_id=?`, bundleId);
    this.sql.exec(`DELETE FROM correspondence WHERE bundle_id=?`, bundleId);
    this.sql.exec(`DELETE FROM action_quotes WHERE bundle_id=?`, bundleId);
    if (promotedType !== "action" || !fm || typeof fm !== "object") return null;
    /* R8: who stated the premise override and when, stamped once, the first time a version carries it. */
    const ov = Actions.overrideOf(fm);
    if (ov) this.sql.exec(`INSERT INTO action_overrides (bundle_id, reason, ground, stated_by, at) VALUES (?,?,?,?,?)
      ON CONFLICT(bundle_id) DO NOTHING`, bundleId, ov.reason, ov.ground ? JSON.stringify(ov.ground) : null,
      c.author ? String(c.author) : null, stampInstant("second", this.#nowMs(null)));
    /* R79, R82 (T45): who changed the press terms or the reply-owed state, and when, appended when this version's value
       differs from the latest held; never rewritten (R36). */
    for (const [field, value, reason] of [["press_terms", fm.press_terms ?? null, null],
                                          ["reply_owed", fm.reply_owed ?? null, fm.reply_owed_reason ?? null]]) {
      const last = this.#one(`SELECT seq, value FROM action_field_history WHERE bundle_id=? AND field=? ORDER BY seq DESC
        LIMIT 1`, bundleId, field);
      const v = JSON.stringify(value);
      if (last ? last.value === v : value === null) continue;
      this.sql.exec(`INSERT INTO action_field_history (bundle_id, field, seq, value, reason, by, at) VALUES (?,?,?,?,?,?,?)`,
        bundleId, field, last ? last.seq + 1 : 1, v, typeof reason === "string" ? reason : null,
        c.author ? String(c.author) : null, stampInstant("second", this.#nowMs(null)));
    }
    if ((Array.isArray(fm.action_basis) && fm.action_basis.length > ACTION_LEGS_MAX)
        || (Array.isArray(fm.correspondence) && fm.correspondence.length > ACTION_LEDGER_MAX)) return null;
    const alegs = Array.isArray(fm.action_basis) ? fm.action_basis : [];
    for (let i = 0; i < alegs.length; i++) {
      const leg = alegs[i];
      if (!leg || typeof leg.target !== "string") continue;
      const type = normalizeType(OBJECT_TYPES[leg.target.split("-")[0]]) ?? "";
      const key = `${leg.target}\u0000${typeof leg.kind === "string" ? leg.kind : ""}`;
      let pinned = typeof leg.extent_capture === "string" && /^[0-9a-f]{64}$/.test(leg.extent_capture) ? leg.extent_capture : null;
      if (!pinned && held.has(key)) pinned = held.get(key) ?? null;
      else if (!pinned && !held.has(key) && type === "information") {
        try { pinned = this.content.captureFor(leg.target) || null; } catch { pinned = null; }
      }
      this.sql.exec(`INSERT INTO action_basis (bundle_id,ord,target_id,target_type,kind,note,at,extent_capture) VALUES (?,?,?,?,?,?,?,?)`,
        bundleId, i, leg.target, type, typeof leg.kind === "string" ? leg.kind : "",
        typeof leg.note === "string" ? leg.note : null, leg.date != null ? String(leg.date) : null, pinned);
    }
    const entries = Array.isArray(fm.correspondence) ? fm.correspondence : [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e || typeof e !== "object") continue;
      const sha = typeof e.artifact_sha === "string" && e.artifact_sha.trim()
        ? e.artifact_sha.trim().replace(/^sha256:/, "").toLowerCase() : null;
      const reg = sha ? this.#one(`SELECT bundle_id FROM register WHERE capture_sha=?`, sha) : null;
      this.sql.exec(
        `INSERT INTO correspondence (bundle_id,ord,direction,at,medium,party,artifact_bundle_id,artifact_sha,account,author,recorded_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        bundleId, i, typeof e.direction === "string" ? e.direction : "", e.at != null ? String(e.at) : "",
        typeof e.medium === "string" ? e.medium : null, typeof e.party === "string" ? e.party : null,
        reg ? reg.bundle_id : (typeof e.artifact_bundle_id === "string" ? e.artifact_bundle_id : null), sha,
        typeof e.account === "string" && e.account.trim() ? e.account : null,
        typeof e.author === "string" && e.author.trim() ? e.author : null,
        typeof e.recorded_at === "string" ? e.recorded_at : null);
    }
    const cpName = counterpartyName(fm.counterparty);
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!isQuoteEntry(e) || quoteFindings(entries, i).length) continue;
      this.sql.exec(
        `INSERT INTO action_quotes (bundle_id,ord,amount,value,currency,basis,answers_ord,revises_ord,counterparty,at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        bundleId, i, String(e.quote_amount).trim(), quoteValue(e.quote_amount), String(e.quote_currency).trim(),
        e.quote_basis !== undefined && e.quote_basis !== null && String(e.quote_basis).trim() ? String(e.quote_basis) : null,
        Number(String(e.quote_answers).trim()),
        e.quote_revises !== undefined && e.quote_revises !== null && String(e.quote_revises).trim() !== ""
          ? Number(String(e.quote_revises).trim()) : null,
        cpName, e.at != null ? String(e.at) : "");
    }
    return null;
  }

  /** R51: the audit's action arm over one bundle image (record-core R59): C-2.10's arms and C-11.1 over an action,
   *  and C-6.1's `responds_to` arm over any document. */
  audit(image) {
    const files = image && image.files instanceof Map ? image.files : null;
    const md = files ? files.get("bundle.md") : null;
    const text = typeof md === "string" ? md : md instanceof Uint8Array ? new TextDecoder().decode(md) : null;
    if (text === null) return [];
    let fm = null;
    try { fm = parseFrontmatter(text).data; } catch { fm = null; }
    if (!fm || typeof fm !== "object") return [];
    const findings = [];
    respondsToEdgeFindings(fm, findings);
    if (fm.object_type === "action")
      /* R51 (K1444 (iii)): the zone of the action's office or venue, as R12 reads it; none held, none handed. */
      checkActionExtension({ fm, nowMs: this.#nowMs(null), actionKinds: this.kinds(), zone: zoneOf(this.place()) }, findings);
    return findings;
  }

  /* REC-24 (c): MOVING AN ACTION THROUGH ITS OWN STATE MACHINE — the first op
   * in this plane whose subject is an action at all.
   *
   * WHY IT EXISTS. `STATES.action` has carried five states and seven edges since
   * the catalog was written, and NOTHING wrote them: SB-OUTPUT §4 measured the
   * whole diagram as dashed, with the creation of the bundle the only node that
   * ran. An act the table permits and no caller can perform is the state machine
   * lying, which is exactly what REC-31 said about `deferred -> open`.
   *
   * THE EDGE TABLE IS THE CATALOG'S AND THERE IS NO SECOND COPY. This is the
   * NAMED hazard of this item, not a general principle: `op=dispose` held its own
   * literal copy of the disposition set until REC-10 rewired it, and the whole
   * cost of that copy was that the publication and the refusal could disagree
   * about what was legal. So legality here comes from `vocabFor(STATES, …)` over
   * the DECLARED object_type — the MAP RULE, sixth consulting site — and this
   * method contains no state list of its own. Grep it: NO string from the action
   * vocabulary appears in this method at all.
   *
   * CORRECTED 2026-08-05 (REC-39), and the old sentence is worth keeping as the
   * receipt: it read "the only strings from the action vocabulary in this file
   * below are the four RESOLUTIONS, which are C-2.10's and are imported nowhere
   * because they are checked by the catalog itself a moment later". Every clause
   * was true and the conclusion was wrong. Being re-checked downstream makes a
   * copy HARMLESS at the write; it does not make it one array. The refusal this
   * method returns carries `legal:` — the option set a surface renders — so the
   * copy was load-bearing on the way OUT even though it was redundant on the way
   * in, and a word changed in the catalog would have left this act offering the
   * old one. RESOLUTIONS is imported now.
   *
   * THE REASON IS REQUIRED AND NEVER PREFILLED, op=reopen's rule and for its
   * reason: an action moving is the group deciding to send something outside the
   * system, or deciding it is finished, and a move with no account of why cannot
   * be checked by anyone including its author. Nothing is derived, defaulted or
   * proposed.
   *
   * A NAMED MEMBER MOVES IT. The author stamp arrives from the session and a
   * machine credential's is `token:<class>`, refused BY SHAPE. This follows
   * MACHINE_CANNOT_CONCLUDE / _RELEASE / _REOPEN and it is the same judgement:
   * an action is the one construct that reaches OUTSIDE this system and touches
   * people who never agreed to be in it, so a scheduler must not be able to
   * advance one. A machine may surface, gather and prepare (D-78, DEC-24); it
   * may not decide that the group is now asking somebody for something.
   *
   * WHAT IT DELIBERATELY DOES NOT DO: it does not touch the clock. A clock entry
   * that has fallen past due is a REAL finding about the document (C-11.1) and
   * this op neither suppresses it nor quietly marks it met — that would be the
   * machine authoring the answer to the question the deadline asked. Overdue is
   * DERIVED on read (see #actionDerived) and what to do about it is the member's. */
  actionMove({ target, to, reason = "", resolution = "", viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-move-action — REC-64/C-32.3. The fence alone. */
    if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
      return { ok: false, reason: "MACHINE_CANNOT_MOVE_ACTION",
               detail: "moving an action is a named member's decision to reach outside this system, or to "
                     + "declare that reaching out is finished. A machine credential may prepare an action and "
                     + "may never advance one. Sign in as a member." };
    /* END DEC-49 REGION is-machine-move-action */
    const why = String(reason ?? "").trim();
    /* DEC-49 REGION is-move-reason — R13 (N217, K275): this act's own condition, under its own code. */
    if (!why)
      return { ok: false, reason: "ACTION_MOVE_NO_REASON",
               detail: "an action moves for a stated reason, authored by the member moving it and never "
                     + "prefilled. A state change with no account of why cannot be checked by anyone." };
    /* END DEC-49 REGION is-move-reason */
    if (why.length > NOTE_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `reason is at most ${NOTE_MAX} characters and cannot contain a quote, a `
                     + `backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one action moves at a time: pass target=<action id>" };

    /* REC-25 / D-15: the same fail-closed viewer gate every read takes; an
       invisible action answers exactly as an absent one. */
    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "only an action has an action's state machine." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this action has no readable bundle.md, so its state cannot be moved" };
    let text = liveMd.content;
    const fm = parseFrontmatter(text).data || {};

    /* THE MAP RULE. The declared spelling first, so a document is judged by the
       contract it was authored under and not by the type its id prefix implies. */
    const spec = vocabFor(STATES, fm.object_type ?? b.object_type);
    const legal = spec?.legal || [];
    if (!legal.includes(to))
      return { ok: false, reason: "BAD_TARGET_STATE", to, target, legal,
               detail: `an action's state is one of ${legal.join(", ")}` };
    const legalFrom = (spec?.edges?.[b.current_state]) || [];
    if (!legalFrom.includes(to))
      return { ok: false, reason: "ILLEGAL_TRANSITION", to, target, from: b.current_state,
               object_type: fm.object_type ?? b.object_type, legal_from: legalFrom,
               detail: "this is not a legal move in the catalog's state table for this document's own "
                     + "vocabulary. The table is the catalog's and this op holds no copy of it." };

    /* C-2.10's entry requirement for `resolved`, checked BEFORE anything moves so
       this op never mints a bundle the catalog immediately rejects (conclude's
       fourth property). The four words are the catalog's; they are compared
       here and enforced again by C-2.10 on the document that lands.
       REC-39: they are now IMPORTED rather than transcribed. The line that
       stood here was a local literal copy, and the comment above it said the
       words were the catalog's while the array was this file's — which is the
       DISPOSITIONS arrangement REC-11 unwound, and it survived here because
       nothing published the set, so nothing could pin the two identical. */
    const res = String(resolution ?? "").trim();
    /* DEC-49 REGION is-move-resolution — REC-64/C-33.3-4. The two conditions on
       HOW an action ended, which are this pair's whole subject. */
    if (to === "resolved" && !RESOLUTIONS.includes(res))
      return { ok: false, reason: "NO_RESOLUTION", target, legal: RESOLUTIONS,
               detail: "an action that is resolved says HOW it resolved: one of "
                     + `${RESOLUTIONS.join(", ")}. C-2.10 requires it in the resolved state, so a move `
                     + "without one would produce a record the catalog rejects." };
    if (to !== "resolved" && res)
      return { ok: false, reason: "RESOLUTION_WITHOUT_RESOLVING", target, to,
               detail: "a resolution describes how an action ENDED; supplying one on a move to "
                     + `${to} would record an outcome the action has not reached.` };
    /* END DEC-49 REGION is-move-resolution */

    const when = stampInstant("second", this.#nowMs(null));
    const withHistory = Actions.#appendStateHistory(text, {
      timestamp: when, from_state: b.current_state, to_state: to, blurb: why, author: who });
    if (!withHistory)
      return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", target,
               detail: "this document's state_history block cannot be extended in place, and a move recording "
                     + "no transition would leave prior_state pointing at a history the document does not "
                     + "carry (C-4.2)" };
    text = withHistory;
    text = Actions.#setOrAddScalar(text, "prior_state", b.current_state);   /* R14: set, or added where absent */
    text = Actions.#setScalar(text, "current_state", to);
    /* setOrAdd, not set: an action authored before this op existed carries no
       `resolution` key at all, and #setScalar alone would move the state and
       leave the requirement unmet — the bundle the catalog then rejects (the
       REC-13 lesson, verbatim). */
    if (to === "resolved") text = Actions.#setOrAddScalar(text, "resolution", res);
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    const entry = `### Session ${when} | Action ${b.current_state} to ${to} | ${who}\n`
                + `Trigger: op=actionmove on ${target}\n`
                + `Changes: state ${b.current_state} to ${to}.`
                + `${to === "resolved" ? ` Resolution: ${res}.` : ""}\n`
                + `Reason: ${why}\n`;
    text = Actions.#appendSessionLog(text, entry);

    const carried = this.#carried(target);

    const bytes = new TextEncoder().encode(text);
    const promoted = this.promotion.promote({
      bundleId: target, base: this.#baseOf(target), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who, viewer: viewer ?? who,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type,
              title: fm.title, current_state: to, prior_state: b.current_state,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    return { ok: true, target, from: b.current_state, to, reason: why,
             ...(to === "resolved" ? { resolution: res } : {}),
             author: who, at: when, weight: "single" };
  }

  /* REC-24 (d): APPENDING ONE ENTRY TO AN ACTION'S CORRESPONDENCE LEDGER.
   *
   * APPEND ONLY, AND THAT IS THE WHOLE DESIGN. This op adds an entry and can
   * never rewrite one: a correspondence entry that changed is ITSELF A FACT, so
   * a correction is a new dated entry saying so and the earlier statement stays
   * where it was. #spliceCorrespondence appends after the block's last line and
   * touches nothing else, exactly as #spliceBasis does for legs.
   *
   * LEASE THEN PROMOTE. The courtesy lock is taken under the acting member
   * before the document is rewritten, so two members recording what came back at
   * the same moment do not silently lose one entry — and promote's CAS on `base`
   * is still the integrity mechanism, because a lease is a courtesy and not a
   * guarantee (D-61's own wording).
   *
   * CAPTURE OR TESTIFY, REFUSED HERE AND AT THE GATE. The entry carries the
   * bytes we hashed OR a named member's account, never neither and never both.
   * It is refused at this op so the member is told before anything is written,
   * and again by C-2.10 over the document that lands, and again at promote where
   * the hash is resolved against the register — three gates, one rule, in the
   * one construct where "we have it in writing" and "somebody remembers it" are
   * different kinds of evidence and must not be able to be confused.
   *
   * AND THE NON-RESPONSE IS A FIRST-CLASS ENTRY (DEC-13). A refusal to reply is
   * a dated first-party fact about the body and is frequently the more useful
   * one, so it is RECORDED with the date it was due rather than left as an
   * absence a reader has to infer. It takes the testimony arm by construction:
   * nothing arrived, so there are no bytes to hash.
   *
   * THE PRODUCER OF `responds_to` IS HERE. A RECEIVED entry whose artifact
   * resolves to a bundle in this store writes a responds_to edge on THAT
   * document, pointing back at this action — the direction SB-OUTPUT's A10 row
   * specifies, and the reason the relation is no longer a string the vocabulary
   * merely tolerates. Idempotent: an edge already there is not written twice.
   *
   * D-148: A RECEIVED ENTRY MAY CARRY A QUOTE (`quote_amount`, `quote_currency`,
   * `quote_basis`, `quote_answers`, `quote_revises`). The rule is the catalog's
   * `quoteFindings`, run here over the ledger as it WOULD stand, so a member is
   * refused by the C-72 name before anything is written, and the same function
   * reports C-2.10 over the document that lands. An entry with no quote
   * parameter writes exactly the bytes it wrote before D-148.
   *
   * D-147: AND IT MAY CARRY ITS PLACE IN THE RECORDS-REQUEST LIFECYCLE (`stage`,
   * `follows`, `outcome`, `exemptions`, `due_by`, `due_cite`) — the catalog's
   * `lifecycleFindings`, run here the same way. A due date's citation is judged
   * HERE against the action's governing laws as they stand when it is stated
   * (DUE_CITE_NOT_GOVERNING), and only here: see the catalog's comment for why
   * the document-level rule does not. No due date is ever computed. An entry
   * with no lifecycle parameter writes exactly the bytes it wrote before. */
  actionCorrespond({ target, direction = "", at = "", medium = "", party = "",
                     artifactSha = "", account = "", quoteAmount = "", quoteCurrency = "",
                     quoteBasis = "", quoteAnswers = "", quoteRevises = "",
                     stage = "", follows = "", outcome = "", exemptions = "", dueBy = "", dueCite = "",
                     speaker = "", officeStatus = null, foundElsewhere = null,
                     pressure = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-correspond — REC-64/C-32.4. The fence alone. */
    if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
      return { ok: false, reason: "MACHINE_CANNOT_CORRESPOND",
               detail: "a correspondence entry is a named member's statement that this exchange happened — "
                     + "and on the testimony arm it IS the evidence. A machine credential may capture bytes "
                     + "and may not testify to an exchange. Sign in as a member." };
    /* END DEC-49 REGION is-machine-correspond */
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one entry at a time: pass target=<action id>" };
    /* DEC-49 REGION is-correspond-entry — REC-64/C-33.5-8. The four conditions
       on the ENTRY's own shape. The target guard above and the hash checks below
       refuse with codes minted at several other sites, so they are outside this
       span: a `where` claims ONE span, and a code enforced in eight places
       cannot honestly name one of them as the site. */
    if (!CORRESPONDENCE_DIRECTIONS.includes(direction))
      return { ok: false, reason: "BAD_DIRECTION", legal: CORRESPONDENCE_DIRECTIONS, direction,
               detail: `direction is one of ${CORRESPONDENCE_DIRECTIONS.join(", ")}. A reply that never came `
                     + "is recorded as no_response with the date it was due, not omitted (DEC-13)." };
    const day = String(at ?? "").trim();
    /* R15 (civil-time R6): a YYYY-MM-DD naming a real calendar day; 2026-02-31 is no day. */
    if (!isCalendarDate(day))
      return { ok: false, reason: "BAD_DATE", at: day,
               detail: "every entry in this ledger is dated YYYY-MM-DD, a day the calendar has, including a "
                     + "non-response, which is dated by when the reply was due" };
    const sha = String(artifactSha ?? "").trim().replace(/^sha256:/, "").toLowerCase();
    const acct = String(account ?? "").trim();
    if (sha && acct)
      return { ok: false, reason: "CAPTURE_AND_TESTIMONY", target,
               detail: "an entry carries the captured bytes OR a named account, never both: what comes back "
                     + "is CAPTURED, not summarised (DEC-13). A paraphrase beside the bytes is what a reader "
                     + "would quote instead of the thing the group can defend." };
    if (!sha && !acct)
      return { ok: false, reason: "NEITHER_CAPTURE_NOR_TESTIMONY", target,
               detail: "an entry carries either an artifact_sha that resolves in the register or an account "
                     + "with an author. Neither is an entry that asserts an exchange and offers no way to "
                     + "check that it happened." };
    /* END DEC-49 REGION is-correspond-entry */
    if (sha && !/^[0-9a-f]{64}$/.test(sha))
      return { ok: false, reason: "BAD_SHA", detail: "artifact_sha is a sha256 hash (64 hex characters)" };
    if (sha && direction === "no_response")
      return { ok: false, reason: "NO_RESPONSE_HAS_NO_BYTES", target,
               detail: "nothing arrived, so there are no bytes to hash. A non-response is recorded as a named "
                     + "account with its date (DEC-13)." };
    for (const [name, v] of [["account", acct], ["medium", String(medium ?? "")], ["party", String(party ?? "")]])
      if (v.length > NOTE_MAX || /["\\\r\n]/.test(v))
        return { ok: false, reason: `BAD_${name.toUpperCase()}`,
                 detail: `${name} is at most ${NOTE_MAX} characters and cannot contain a quote, `
                       + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    /* D-148: the quote, as the entry will carry it. Only keys a caller SENT are
       written, so an entry with no quote parameter is byte-identical to before. */
    const quote = {};
    for (const [k, v] of [["quote_amount", quoteAmount], ["quote_currency", quoteCurrency],
                          ["quote_basis", quoteBasis], ["quote_answers", quoteAnswers],
                          ["quote_revises", quoteRevises]]) {
      const t = String(v ?? "").trim();
      if (t) quote[k] = t;
    }
    /* D-147: the lifecycle keys, likewise only those a caller SENT. */
    const life = {};
    for (const [k, v] of [["stage", stage], ["follows", follows], ["outcome", outcome],
                          ["exemptions", exemptions], ["due_by", dueBy], ["due_cite", dueCite]]) {
      const t = String(v ?? "").trim();
      if (t) life[k] = t;
    }
    const refusal = (code, detail, extra) => {
      const row = QUOTE_CHECKS[code] || LIFECYCLE_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation,
               target, detail, ...(extra || {}) };
    };
    /* DEC-49 REGION is-lifecycle-writable — D-147/C-94.11. The two prose values
       a stage carries are written quoted into a grammar with no escapes; the four
       tokens are bare, so each must be the token its grammar names before any
       byte is spliced (the grammar below judges which token). */
    for (const [k, max] of [["exemptions", NOTE_MAX], ["due_cite", CITATION_MAX]])
      if (life[k] !== undefined && (life[k].length > max || /["\\\r\n]/.test(life[k])))
        return refusal("LIFECYCLE_TEXT_UNWRITABLE",
          `${k} is at most ${max} characters and cannot contain a quote, a backslash, or a newline: the `
          + `restricted frontmatter grammar has no escapes`, { field: k });
    /* END DEC-49 REGION is-lifecycle-writable */
    for (const k of ["stage", "follows", "outcome", "due_by"])
      if (life[k] !== undefined && !/^[a-z0-9_-]{1,40}$/.test(life[k])) {
        /* DEC-49 REGION is-lifecycle-token — D-688/C-94.12 (R22): the token case, under its own name. */
        return refusal("LIFECYCLE_TOKEN_MALFORMED",
          `${k} is a single token of 1 to 40 lower-case letters, digits, underscores or hyphens`, { field: k });
        /* END DEC-49 REGION is-lifecycle-token */
      }
    /* DEC-49 REGION is-quote-writable — D-148/C-72.6. The two prose values a
       quote carries are written quoted into a grammar with no escapes. */
    for (const k of ["quote_currency", "quote_basis"])
      if (quote[k] !== undefined && (quote[k].length > NOTE_MAX || /["\\\r\n]/.test(quote[k])))
        return refusal("QUOTE_TEXT_UNWRITABLE",
          `${k} is at most ${NOTE_MAX} characters and cannot contain a quote, a backslash, or a `
          + `newline: the restricted frontmatter grammar has no escapes`, { field: k });
    /* END DEC-49 REGION is-quote-writable */
    /* R48 (`action-holds` R1): a pressure mark stated with the entry, judged as `action-holds`' `actionPressure` judges one. */
    const mark = pressure === null || pressure === undefined || pressure === "" ? null : Actions.#pressureOf(pressure);
    if (pressure !== null && pressure !== undefined && pressure !== "") {
      const pr = this.#pressureRefusal({ who, mark, direction });
      if (pr) return { ...pr, target };
    }

    /* R81, R83, R94 (T45): the entry's own fields, as given, held flat in the bytes (J2's reading). */
    const t45 = Actions.#entryT45(speaker, officeStatus, foundElsewhere);
    if (!t45.ok) return { ...t45, target };
    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "a correspondence ledger belongs to an action: it records what that ask sent and what "
                     + "came back." };
    /* Resolved here as well as at promote, so the member is told which half of
       the capture-or-testify choice failed rather than being handed a write
       refusal after the lease was taken. */
    /* DEC-49 REGION is-correspond-artifact — REC-64/C-33.9. */
    if (sha && !this.#one(`SELECT capture_sha FROM register WHERE capture_sha=?`, sha))
      return { ok: false, reason: "UNREGISTERED_ARTIFACT", target, artifact_sha: sha,
               detail: "this hash names no capture in this store. Capture the artifact first (op=capture), or "
                     + "record a named account instead — those are the two honest ways to hold an exchange." };
    /* END DEC-49 REGION is-correspond-artifact */

    /* THE COURTESY LOCK, under the acting member. */
    const lease = this.record.acquireLease(target, who, CORRESPOND_LEASE_MS);
    if (!lease.ok)
      return { ok: false, reason: "LEASE_HELD", target, heldBy: lease.heldBy, until: lease.until,
               detail: "another member is writing to this action right now. The ledger is append-only, so a "
                     + "second writer would not lose an entry — but it would interleave two accounts of the "
                     + "same exchange with no way to tell which was written first." };

    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null) {
      this.#releaseLease(target, who);
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this action has no readable bundle.md, so nothing can be appended to it" };
    }
    const fm = parseFrontmatter(liveMd.content).data || {};
    /* R82 (T45; v0.2 rule 6): a body that owes the group no reply is never recorded as not replying. */
    /* DEC-49 REGION is-no-reply-owed */
    if (direction === "no_response" && fm.reply_owed === false) {
      this.#releaseLease(target, who);
      return refuse("NO_REPLY_OWED", "this action states that the body owes the group no reply, so silence is never "
        + "recorded as a non-response. Nothing was written.", { target, reply_owed: false, ...T45_SENTENCES.reply_not_owed });
    }
    /* END DEC-49 REGION is-no-reply-owed */
    const when = stampInstant("second", this.#nowMs(null));
    const ledgerNow = Array.isArray(fm.correspondence) ? fm.correspondence : [];
    const ord = ledgerNow.length;
    const entryFm = {
      direction, at: day,
      ...(String(medium ?? "").trim() ? { medium: String(medium).trim() } : {}),
      ...(String(party ?? "").trim() ? { party: String(party).trim() } : {}),
      ...(sha ? { artifact_sha: sha } : {}),
      ...(acct ? { account: acct } : {}),
      ...quote,
      ...life,
      ...t45.fields,
      /* R48 (moved to `action-holds` R1, T45; K2781 (1)): a pressure mark stated with the entry stays on the entry, flat
         (K2849), and `action-holds` reads it through `actionRead`; its act and table are that module's. */
      ...(mark ? { pressure_kind: mark.kind, pressure_note: mark.note } : {}),
      /* SERVER-STAMPED. Present on both arms — who put this entry on the record
         is part of the record even when the record is bytes. */
      author: who,
      recorded_at: when,
    };
    /* D-148: the catalog's ONE quote rule, over the ledger as it would stand with
       this entry appended. The lease is given back on a refusal: nothing was
       written and a refused write holds nothing worth protecting. */
    const qf = quoteFindings([...ledgerNow, entryFm], ord);
    if (qf.length) {
      this.#releaseLease(target, who);
      const has = (c) => qf.find((x) => x.code === c);
      const all = { findings: qf };
      /* DEC-49 REGION is-quote-grammar — D-148/C-72.1-5. The first finding, by the
         name the catalog reports over the document too. */
      if (has("QUOTE_NOT_ON_RECEIVED"))
        return refusal("QUOTE_NOT_ON_RECEIVED", has("QUOTE_NOT_ON_RECEIVED").message, all);
      if (has("QUOTE_AMOUNT_NOT_A_NUMBER"))
        return refusal("QUOTE_AMOUNT_NOT_A_NUMBER", has("QUOTE_AMOUNT_NOT_A_NUMBER").message, all);
      if (has("QUOTE_NO_CURRENCY"))
        return refusal("QUOTE_NO_CURRENCY", has("QUOTE_NO_CURRENCY").message, all);
      if (has("QUOTE_ANSWERS_NO_SENT"))
        return refusal("QUOTE_ANSWERS_NO_SENT", has("QUOTE_ANSWERS_NO_SENT").message, all);
      if (has("QUOTE_REVISES_NO_QUOTE"))
        return refusal("QUOTE_REVISES_NO_QUOTE", has("QUOTE_REVISES_NO_QUOTE").message, all);
      /* END DEC-49 REGION is-quote-grammar */
    }
    /* D-147: the catalog's ONE lifecycle rule, over the ledger as it would stand. */
    const lf = lifecycleFindings([...ledgerNow, entryFm], ord);
    if (lf.length) {
      this.#releaseLease(target, who);
      const has = (c) => lf.find((x) => x.code === c);
      const all = { findings: lf };
      /* DEC-49 REGION is-lifecycle-grammar — D-147/C-94.1-9. The first finding, by
         the name the catalog reports over the document too. */
      if (has("STAGE_NOT_OF_DIRECTION"))
        return refusal("STAGE_NOT_OF_DIRECTION", has("STAGE_NOT_OF_DIRECTION").message, all);
      if (has("FOLLOWS_NO_ENTRY"))
        return refusal("FOLLOWS_NO_ENTRY", has("FOLLOWS_NO_ENTRY").message, all);
      if (has("APPEAL_NAMES_NO_DECISION"))
        return refusal("APPEAL_NAMES_NO_DECISION", has("APPEAL_NAMES_NO_DECISION").message, all);
      if (has("OUTCOME_NOT_ON_RECEIVED"))
        return refusal("OUTCOME_NOT_ON_RECEIVED", has("OUTCOME_NOT_ON_RECEIVED").message, all);
      if (has("OUTCOME_NOT_IN_VOCABULARY"))
        return refusal("OUTCOME_NOT_IN_VOCABULARY", has("OUTCOME_NOT_IN_VOCABULARY").message, all);
      if (has("DECISION_WITHOUT_OUTCOME"))
        return refusal("DECISION_WITHOUT_OUTCOME", has("DECISION_WITHOUT_OUTCOME").message, all);
      if (has("FEE_ESTIMATE_WITHOUT_QUOTE"))
        return refusal("FEE_ESTIMATE_WITHOUT_QUOTE", has("FEE_ESTIMATE_WITHOUT_QUOTE").message, all);
      if (has("DUE_HALF_STATED"))
        return refusal("DUE_HALF_STATED", has("DUE_HALF_STATED").message, all);
      if (has("DUE_NOT_A_DATE"))
        return refusal("DUE_NOT_A_DATE", has("DUE_NOT_A_DATE").message, all);
      /* END DEC-49 REGION is-lifecycle-grammar */
    }
    /* D-147: a stated due date names ONE OF THE ACTION'S citations (D-149), read
       from the action's own bytes as they stand now. With no list stated, no
       citation can be one of it, so the date cannot be stated yet — the refusal
       says to state the laws first. Nothing is inferred from the kind. */
    const cited = life.due_cite;
    const listed = governingLawsOf(fm).laws.map((l) => l.citation);
    const onList = cited ? listed.includes(cited) : true;
    if (!onList) {
      this.#releaseLease(target, who);
      /* DEC-49 REGION is-lifecycle-due-cite — D-147/C-94.10. */
      return refusal("DUE_CITE_NOT_GOVERNING",
        `due_cite '${cited.slice(0, 60)}' is not one of this action's stated governing laws`,
        { governing_laws: listed });
      /* END DEC-49 REGION is-lifecycle-due-cite */
    }
    /* R81, R83, R94 (T45): the entry's T45 fields, by action-grammar's R22, then the speaker a member. */
    if (Object.keys(t45.fields).length) {
      const r = this.#entryFieldRefusal([...ledgerNow, entryFm], ord, fm.action_kind, who, t45.fields.speaker !== undefined);
      if (r) { this.#releaseLease(target, who); return { ...r, target }; }
    }
    /* R85 (T45; S1 §C 18, §D 15): a records request's stage is one its law lists, where the profile lists them. */
    if (life.stage !== undefined && fm.action_kind === "records_request") {
      const inLaw = stageInLaw(life.stage, this.#lawStages(fm.law));
      /* DEC-49 REGION is-stage-in-law */
      if (inLaw === "not_in_law") {
        this.#releaseLease(target, who);
        return refuse("STAGE_NOT_IN_LAW", `stage '${life.stage}' is not one the law this request is made under lists, as `
          + "your group's jurisdiction states it. Nothing was written.", { target, stage: life.stage,
            stages: (this.#lawStages(fm.law) || []).map((x) => x && x.stage) });
      }
      /* END DEC-49 REGION is-stage-in-law */
    }
    let text = Actions.#spliceCorrespondence(liveMd.content, entryFm);
    if (!text) this.#releaseLease(target, who);
    if (!text)
      return { ok: false, reason: "UNSPLICEABLE_CORRESPONDENCE", target,
               detail: "this action's correspondence block is not in a shape this grammar can extend in "
                     + "place. Appending never rewrites the rest of the document, so nothing was written." };
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    text = Actions.#appendSessionLog(text,
      `### Session ${when} | Correspondence ${direction} | ${who}\n`
      + `Trigger: op=actioncorrespond on ${target}\n`
      + `Changes: correspondence[${ord}] recorded, dated ${day}`
      + `${String(party ?? "").trim() ? `, with ${String(party).trim()}` : ""}.\n`
      + `Held as: ${sha ? `captured bytes ${sha.slice(0, 16)}...` : `testimony from ${who}`}\n`
      + `${life.stage ? `Stage: ${life.stage}${life.follows !== undefined ? `, following correspondence[${life.follows}]` : ""}.\n` : ""}`);

    const carried = this.#carried(target);
    const bytes = new TextEncoder().encode(text);
    const promoted = this.promotion.promote({
      bundleId: target, base: this.#baseOf(target), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who, viewer: viewer ?? who,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type,
              title: fm.title, current_state: b.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
    /* THE LOCK IS GIVEN BACK, and this is not tidiness. The lease exists to
       stop two members interleaving two accounts of ONE exchange inside one
       write; the write is over. Leaving it to expire would lock the ledger for
       the rest of the TTL against the second member recording what they heard,
       which is the opposite of what an append-only ledger is for — and the
       member would be told "another member is writing to this action right now"
       when nobody is. Released whether the promote succeeded or failed, for the
       same reason: a refused write holds nothing worth protecting. */
    this.#releaseLease(target, who);
    if (!promoted.ok) return { ...promoted, target };

    /* REC-24 (g)'s PRODUCER. Only on a RECEIVED entry: a SENT artifact is our
       own letter and responds to nothing. */
    /* R83 (T45): a response found elsewhere is linked by the member to the action, never by a responds_to edge. */
    const responded = direction === "received" && sha && t45.fields.found_elsewhere === undefined
      ? this.#respondsToInto(sha, target, who) : null;
    const marked = mark ? { kind: mark.kind, note: mark.note } : null;
    const answer = { ok: true, target, ord, direction, at: day, author: who, recorded_at: when,
             held_as: sha ? "capture" : "testimony",
             ...(sha ? { artifact_sha: sha } : { account: acct }),
             ...(Object.keys(quote).length ? { quote } : {}),
             ...(Object.keys(life).length ? { lifecycle: life } : {}),
             ...(responded ? { responds_to: responded } : {}),
             ...(marked ? { pressure: marked } : {}),
             ...(t45.fields.speaker !== undefined ? { speaker: t45.fields.speaker } : {}),
             ...Actions.#presentedT45(t45.fields),
             weight: "single" };
    if (direction === "received") this.#tellResponse({ action: target, ord, recorder: who, at: day });
    return answer;
  }

  /* R81, R83, R94 (T45): the entry's T45 fields as the act is given them, flat for the bytes (K2849): `speaker` a member
     id; `officeStatus` `{words, status?}` and `foundElsewhere` `{kind, note?}`, each an object or its JSON. Their shape is
     action-grammar's R22, asked with the ledger before any byte is spliced; what the restricted grammar cannot hold in
     its quoted text (a quote or backslash, which R22's line rule lets through) is refused here first by R22's code. */
  static #entryT45(speaker, officeStatus, foundElsewhere) {
    const obj = (v) => {
      if (v === null || v === undefined || v === "") return null;
      if (typeof v === "string") { try { v = JSON.parse(v); } catch { return { bad: true }; } }
      return v && typeof v === "object" && !Array.isArray(v) ? v : { bad: true };
    };
    const text = (v) => v === undefined || (typeof v === "string" && !/["\\\r\n]/.test(v));
    const tok = (v) => v === undefined || /^[A-Za-z0-9_.:-]{1,200}$/.test(String(v));
    const fields = {};
    const sp = String(speaker ?? "").trim();
    if (sp) fields.speaker = sp;
    const os = obj(officeStatus), fe = obj(foundElsewhere);
    /* DEC-49 REGION is-entry-writable */
    if (sp && !tok(sp))
      return refuse("SPEAKER_REFUSED", "speaker is the member id of the member who spoke for the group in this sending. "
        + "Nothing was written.");
    if (os && (os.bad || !text(os.words) || !tok(os.status)))
      return refuse("OFFICE_STATUS_WITHOUT_OUTCOME", "office_status is {words, status?}: the office's own wording, with no "
        + "quote, backslash or line break, and a status the profile holds. Nothing was written.");
    if (fe && (fe.bad || !tok(fe.kind ?? "") || !text(fe.note)))
      return refuse("FOUND_ELSEWHERE_REFUSED", "found_elsewhere is {kind, note?}: a kind and a note with no quote, backslash "
        + "or line break. Nothing was written.");
    /* END DEC-49 REGION is-entry-writable */
    if (os && os.words !== undefined) fields.office_words = os.words;
    if (os && os.status !== undefined) fields.office_status = String(os.status);
    if (fe) fields.found_elsewhere = String(fe.kind);
    if (fe && fe.note !== undefined) fields.found_elsewhere_note = fe.note;
    return { ok: true, fields };
  }
  /* R25: the T45 fields of an entry, presented as R22 names them. */
  static #presentedT45(e) {
    const p = Actions.entryFields(e);
    return { ...(p.office_status ? { office_status: p.office_status } : {}),
             ...(p.found_elsewhere ? { found_elsewhere: p.found_elsewhere } : {}) };
  }

  /** R48: a pressure mark as given (`{kind, note}`, or its JSON), trimmed, or null when it is not one. */
  static #pressureOf(p) {
    let v = p;
    if (typeof v === "string") { try { v = JSON.parse(v); } catch { return null; } }
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    return { kind: typeof v.kind === "string" ? v.kind.trim() : "", note: typeof v.note === "string" ? v.note.trim() : "",
             raw: typeof v.note === "string" ? v.note : "" };
  }

  /* R48 (K597 (1); `action-holds` R1): the conditions on a pressure mark stated at `actionCorrespond`; `actionPressure` is
     `action-holds`' since T45 and judges its own. */
  #pressureRefusal({ who, mark, direction }) {
    /* DEC-49 REGION is-pressure */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_MARK_PRESSURE", "marking pressure directed at the group is a member's judgement; a "
        + "machine credential may not mark it. Nothing was written.");
    if (!mark || !PRESSURE_KINDS.includes(mark.kind) || !mark.note || mark.note.length > NOTE_MAX || /["\\\r\n]/.test(mark.raw))
      return refuse("PRESSURE_REFUSED", `a pressure mark is {kind, note}: kind one of ${PRESSURE_KINDS.join(", ")}, the note `
        + `1 to ${NOTE_MAX} characters with no quote, backslash or line break. Nothing was written.`,
        { legal: PRESSURE_KINDS, max: NOTE_MAX });
    if (direction !== "received")
      return refuse("PRESSURE_NOT_RECEIVED", `pressure is marked on a received entry; this one is ${direction || "not one"}. `
        + "Nothing was written.");
    /* END DEC-49 REGION is-pressure */
    return null;
  }

  /** R47: `actionCreate` is the same write as a promotion of an action document (R1–R3, R5–R11, R45, R46 and action-grammar R3 and R6 at the act): the plane
   *  mints the action's id and writes it into the document; the refusals are the promotion's. Answers `{ok, id}`. */
  actionCreate({ document = null, viewer = null, author = null } = {}) {
    const text = typeof document === "string" ? document : null;
    let fm = null;
    try { fm = text ? parseFrontmatter(text).data : null; } catch { fm = null; }
    if (!fm || typeof fm !== "object" || normalizeType(fm.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", detail: "op=actioncreate takes an action's bundle.md, whose object_type "
        + "is action. Nothing was written." };
    const when = stampInstant("second", this.#nowMs(null));
    const minted = this.record.allocId("ACTN", when.slice(0, 4));
    const id = minted && minted.id;
    if (!id) return { ok: false, reason: "NO_ID", detail: "no action id could be allocated. Nothing was written." };
    let withId = Actions.#setOrAddScalar(text, "id", id);
    const who = String(author ?? "").trim();
    /* R9 (K1484 row 5): an office arm stating no entity id has it filled from the office entity held for its role and
       body (the bridge), here where this module writes the bytes; written without one, and said so, when none is. */
    const office = counterpartyOffice(fm.counterparty);
    let addressee = null;
    if (office && !office.legacy && !office.entity_id) {
      addressee = this.#bridge(office.role, office.body, viewer ?? (who || null));
      if (addressee.entity_id) {
        const filled = Actions.#fillEntityId(withId, addressee.entity_id);
        if (filled) withId = filled;
        else addressee = { entity_id: null, filled: "unspliceable",
                           says: "the office entity was found, and this document's counterparty block cannot be extended in "
                               + "place, so it was written without one" };
      }
    }
    const bytes = new TextEncoder().encode(withId);
    const r = this.promotion.promote({
      bundleId: id, base: null, snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who || null, viewer: viewer ?? (who || null),
      files: [{ path: "bundle.md", text: withId, bytes: bytes.length, sha256: createSha256().update(bytes).hex() }],
      meta: { object_type: fm.object_type, title: fm.title, current_state: fm.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created ?? when, last_updated: fm.last_updated ?? when, criticality: fm.criticality ?? null },
    });
    if (!r.ok) return r;
    return { ok: true, id, ...(addressee ? { addressee } : {}) };
  }

  /* R9: add `entity_id` as the last line of the top-level `counterparty:` block; null for any other shape. */
  static #fillEntityId(text, entityId) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    let ci = -1;
    for (let i = 1; i < end; i++) if (/^counterparty:\s*$/.test(lines[i])) { ci = i; break; }
    if (ci === -1) return null;
    let last = ci, indent = null;
    for (let i = ci + 1; i < end; i++) {
      if (/^\s+\S/.test(lines[i])) { last = i; indent ??= lines[i].match(/^\s+/)[0]; continue; }
      break;
    }
    if (last === ci || /^\s+entity_id:/m.test(lines.slice(ci + 1, last + 1).join("\n"))) return null;
    return [...lines.slice(0, last + 1), `${indent}entity_id: ${entityId}`, ...lines.slice(last + 1)].join("\n");
  }

  /** R9 (K1484 row 5; the bridge, `instance-setup` R50): the office entity held for `{role, body}`: the one entity of
   *  kind `office` holding the role as an alias with a live `post_in` line to an entity holding the body as an alias.
   *  Answers `{entity_id, filled, says}`, `filled` `bridge`, `none` or `ambiguous` (never a guess between several). */
  #bridge(role, body, viewer) {
    const none = (filled, says) => ({ entity_id: null, filled, says });
    if (!role || !body) return none("none", "an office is found by its role and body, and this one does not state both");
    let offices = [], bodies = new Set();
    try {
      offices = (this.entities.entitiesByAlias({ alias: role }).entities || []).filter((e) => e.kind === "office").map((e) => e.entity_id);
      bodies = new Set((this.entities.entitiesByAlias({ alias: body }).entities || []).map((e) => e.entity_id));
    } catch { return none("none", "the subject registry could not be read, so no office entity was looked for"); }
    const lines = this.lines;
    const found = [];
    for (const o of offices) {
      let r = null;
      try { r = lines ? lines.linesOf({ entity: o, kinds: ["post_in"], direction: "from", limit: 500, viewer: viewer ?? "class:admin" }) : null; }
      catch { r = null; }
      if (r && r.ok && (r.lines || []).some((l) => !l.withdrawn && bodies.has(l.to))) found.push(o);
    }
    if (found.length === 1)
      return { entity_id: found[0], filled: "bridge", says: "the office entity the record holds for this role and body" };
    return found.length
      ? none("ambiguous", `${found.length} office entities are held for this role and body, so none was chosen`)
      : none("none", "no office entity is held for this role and body; the action is addressed to it by role and body alone");
  }

  /* D-149 (Bob, 2026-09-22; BIO_Case_Making_v0_1.md §2, *A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*):
   * SETTING THE LIST OF LAWS THAT GOVERN AN ACTION.
   *
   * *"ALL records laws apply."* The layers follow the AGENCY ASKED — federal FOIA governs federal agencies, the
   * CPRA a California state or local agency, and a city's sunshine ordinance adds its own — so a request carries
   * a LIST, each law named by CITATION and stated at its level. This act is how the list is set, and the ONLY
   * way: `promote` refuses a creation or a revision that sets or changes it without this act
   * (GOVERNING_LAWS_REWRITTEN), so an action nobody stated a list for is undetermined IN ITS BYTES.
   *
   * A NAMED MEMBER SETS IT. The design: *set by a member's authored act; the machine may propose the list from
   * the counterparty, labelled as machine work, and never sets it*. So a machine credential is refused BY NAME
   * (MACHINE_CANNOT_SET_LAWS), the actionMove precedent. No proposal is built.
   *
   * THE WHOLE LIST, REPLACED. A member states the laws that govern the request as a set; adding one later is a
   * new statement of the set, attributed and dated anew, and the Session Log keeps what it replaced. There is
   * no act that clears it: an empty list is the undetermined state, and a member does not "set" it — nobody
   * having stated the laws is what it means.
   *
   * THE PLANE ENCODES NO LAW'S RULES. A citation is stored as the member wrote it and never parsed for a fee,
   * a clock or an appeal route, and nothing is inferred from the counterparty or the kind. */
  actionLaws({ target, laws = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-set-laws — D-149/C-32.18. The fence alone. */
    if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
      return { ok: false, reason: "MACHINE_CANNOT_SET_LAWS",
               detail: "which laws govern a request is a named member's authored statement (D-149). A machine "
                     + "credential may gather what the agency is and may not state the laws. Sign in as a member." };
    /* END DEC-49 REGION is-machine-set-laws */
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const read = this.#lawEntries(laws);
    if (!read.ok) return read;
    const entries = read.entries;

    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "governing laws belong to an action: they are the laws its request is made under." };
    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this action has no readable bundle.md, so its governing laws cannot be set" };
    const fm = parseFrontmatter(liveMd.content).data || {};
    /* R64: each named standard is one the author may read, else standards' one answer. */
    for (const e of entries) {
      if (!e.standard) continue;
      const r = this.#standardSeen(e.standard, viewer ?? who);
      if (r) return { ...r, target };
    }
    const before = governingLawsOf(fm);
    const when = stampInstant("second", this.#nowMs(null));
    let text = Actions.#replaceGoverningLaws(liveMd.content, entries);
    if (!text)
      return { ok: false, reason: "UNSPLICEABLE_GOVERNING_LAWS", target,
               detail: "this action's governing_laws block is not in a shape this grammar can replace in place, "
                     + "so nothing was written." };
    text = Actions.#setOrAddScalar(text, "governing_laws_by", `"${Actions.#fmSafe(who)}"`);
    text = Actions.#setOrAddScalar(text, "governing_laws_at", `"${when}"`);
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    text = Actions.#appendSessionLog(text,
      `### Session ${when} | Governing laws stated | ${who}\n`
      + `Trigger: op=actionlaws on ${target}\n`
      + `Changes: governing_laws set to ${entries.map((e) => `${e.level} ${e.citation}`).join("; ")}.\n`
      + `Replaced: ${before.state === "stated"
          ? before.laws.map((e) => `${e.level} ${e.citation}`).join("; ") + ` (stated by ${before.by ?? "nobody recorded"})`
          : "nothing: the list was undetermined"}\n`);

    const carried = this.#carried(target);
    const bytes = new TextEncoder().encode(text);
    const promoted = this.promotion.promote({
      bundleId: target, base: this.#baseOf(target), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who, viewer: viewer ?? who, [LAWS_ACT]: true,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type,
              title: fm.title, current_state: b.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    return { ok: true, target, laws: entries, by: who, at: when,
             replaced: before.state === "stated" ? before.laws : null, weight: "single" };
  }

  /* D-149 — WHAT A WELL-FORMED LIST OF GOVERNING LAWS IS, decided in ONE place.
   *
   * EXTRACTED FROM `actionLaws` BY REC-195, and the extraction is the point rather than tidiness. REC-195 adds a
   * SECOND caller — `actionLawsPropose`, the machine's proposal — and a second caller judging the same shape is
   * how REC-46's eleven-copies-of-one-predicate failure arrives at a grammar. The alternative was a second family
   * of refusal codes saying the same four things about the same four conditions, which would have made the
   * catalogue claim the plane draws a distinction it does not draw. So both acts ask this, both refuse with
   * C-73.2..5, and a change to what a citation may be cannot reach one act and miss the other.
   *
   * IT JUDGES THE SHAPE AND NEVER THE LAW. Whether a citation is the RIGHT law for the agency asked is a member's
   * reading and the plane does not try (D-149: the plane encodes no law's rules). Returns the parsed entries or
   * the refusal, and writes nothing. */
  /* An instance method that reads no instance state: written so for the legacy refusal-code guard, which could not
     see a static method (deleted in T20, K879). DEC-49's totality over these codes is control-plane's
     `test/m/control-plane/families.test.mjs` (its R22). */
  #lawEntries(laws) {
    let list = laws;
    if (typeof list === "string") { try { list = JSON.parse(list); } catch { list = null; } }
    const entries = [];
    /* DEC-49 REGION is-laws-entry — D-149/C-73.2-5. The conditions on the LIST's own shape. */
    if (!Array.isArray(list) || !list.length)
      return { ok: false, reason: "NO_LAWS", legal_levels: LAW_LEVELS,
               detail: "the act names at least one law as {level, citation}. An action whose laws nobody has "
                     + "stated reads UNDETERMINED on its own; an empty list is not a statement." };
    if (list.length > GOVERNING_LAWS_MAX)
      return { ok: false, reason: "TOO_MANY_LAWS", count: list.length, max: GOVERNING_LAWS_MAX,
               detail: `one act states at most ${GOVERNING_LAWS_MAX} governing laws` };
    const seen = new Set();
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const level = e && typeof e === "object" ? String(e.level ?? "").trim() : "";
      const citation = e && typeof e === "object" && typeof e.citation === "string" ? e.citation.trim() : "";
      if (!LAW_LEVELS.includes(level))
        return { ok: false, reason: "BAD_LAW_LEVEL", index: i, level, legal: LAW_LEVELS,
                 detail: `laws[${i}].level is one of ${LAW_LEVELS.join(", ")}` };
      if (!citation || citation.length > CITATION_MAX || /["\\\r\n]/.test(citation))
        return { ok: false, reason: "BAD_CITATION", index: i,
                 detail: `laws[${i}].citation is 1 to ${CITATION_MAX} characters with no quote, backslash or `
                       + "newline: the restricted frontmatter grammar has no escapes" };
      const key = `${level}\u0000${citation.toLowerCase()}`;
      if (seen.has(key))
        return { ok: false, reason: "BAD_CITATION", index: i,
                 detail: `laws[${i}] repeats an earlier entry: a law is named once at its level` };
      seen.add(key);
      /* R64 (K1446): an entry may name a held standard; the citation stays the member's own statement. Whether the
         standard is one the caller may read is asked by each act once the action is found. */
      const std = e.standard === undefined || e.standard === null || e.standard === "" ? null : String(e.standard).trim();
      entries.push({ level, citation, ...(std ? { standard: std } : {}) });
    }
    /* END DEC-49 REGION is-laws-entry */
    return { ok: true, entries };
  }

  /* D-149: REPLACE the top-level `governing_laws:` block (the key line and its indented rows) with `entries`,
     or open it before the closing fence when absent — `#spliceCorrespondence`'s grammar, whole-block. Returns
     null for a block it cannot read as that shape (an inline value other than `[]`), refusing rather than
     guessing: the grammar has no escapes and a wrong guess corrupts the document silently. */
  static #replaceGoverningLaws(text, entries) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = ["governing_laws:", ...entries.flatMap((e) => [
      `  - level: ${e.level}`,
      `    citation: "${e.citation}"`,
      ...(e.standard ? [`    standard: ${e.standard}`] : []),
    ])];
    let gi = -1;
    for (let i = 1; i < end; i++) if (/^governing_laws:/.test(lines[i])) { gi = i; break; }
    if (gi === -1) return [...lines.slice(0, end), ...block, ...lines.slice(end)].join("\n");
    const rest = lines[gi].slice("governing_laws:".length).trim();
    if (rest !== "" && rest !== "[]") return null;
    let last = gi;
    if (rest === "")
      for (let i = gi + 1; i < end; i++) {
        if (lines[i].trim() === "") continue;
        if (/^\s/.test(lines[i])) { last = i; continue; }
        break;
      }
    return [...lines.slice(0, gi), ...block, ...lines.slice(last + 1)].join("\n");
  }

  /** op=actionrisktier — REC-214 (BOB #33, 2026-09-24, "Risk-tier revision"; `BIO_Case_Making_v0_1.md` §2,
   *  `risk_tier`): A MEMBER REVISES AN ACTION'S RISK TIER, AS AN AUTHORED, APPEND-ONLY ACT.
   *
   *  The tier carries legal exposure — 3 is "do not file without counsel" — so the record must show that it was
   *  changed, by whom, when and why. A member may revise ANY tier, up or down, and the act:
   *   - writes `risk_tier` through the one front-matter path every reader derives the tier from (`riskTierState`
   *     over the document's own bytes; `#projectRow`'s `action_risk_tier` column; `op=search q=risk:`);
   *   - APPENDS one entry to `risk_tier_history[]` — the tier set, the tier replaced (`prior`), who, when and the
   *     REQUIRED reason — and never edits or drops an earlier one, so the prior tier, its author and its reason stay
   *     readable (`riskTierHistoryOf`); `promote` refuses any other writer that changes either (C-90.1);
   *   - records the revision in the Session Log as well, as every act on an action does.
   *  A machine credential is refused by C-32.19's own code. The act states 1, 2 or 3: `undetermined` is what an
   *  action reads when nobody has assessed it, and a member does not "set" it — actionLaws' rule for an empty list.
   *  A revision to the tier already held is refused: it would append a change that is not one. What a machine may
   *  PROPOSE is REC-215's, read beside this history and never written into it. */
  actionRiskTier({ target, tier = null, reason = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    const machine = this.#machineRiskTierRefusal({ who, nextTier: riskTierState(tier), heldTier: null,
                                                   cur: false, act: true });
    if (machine) return { ...machine, target };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
       WHERE b.bundle_id=? AND (${gate.sql})`, target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "a risk tier belongs to an action: it is the legal exposure of filing it." };
    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    if (!liveMd || liveMd.content === null)
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this action has no readable bundle.md, so its risk tier cannot be revised" };
    const fm = parseFrontmatter(liveMd.content).data || {};
    const held = riskTierState(fm.risk_tier);
    const before = riskTierHistoryOf(fm);
    /* The query string carries every value as a string; the act's tier is a NUMBER in the bytes (a quoted "2" is
       refused by C-2.10), so the wire's "2" is read as 2 here and nowhere else. */
    const asked = typeof tier === "string" && /^[123]$/.test(tier.trim()) ? Number(tier.trim()) : tier;
    const next = riskTierState(asked);
    const why = typeof reason === "string" ? reason.trim() : "";
    const text0 = Actions.#appendRiskTierHistory(liveMd.content, null);
    if (next !== 1 && next !== 2 && next !== 3) return this.#badRiskTier(target, tier, "the act");
    /* DEC-49 REGION is-risk-tier-act */
    if (!why || why.length > RISK_TIER_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "RISK_TIER_REASON_REFUSED", target, max: RISK_TIER_REASON_MAX,
               detail: `a revision of a risk tier carries a reason of 1 to ${RISK_TIER_REASON_MAX} characters, with no `
                     + "quote, backslash or line break: the restricted frontmatter grammar has no escapes. It is kept "
                     + "beside the change for as long as the record lasts." };
    if (next === held)
      return { ok: false, reason: "RISK_TIER_UNCHANGED", target, risk_tier: held,
               detail: `this action's risk tier is already ${held}; a revision changes it, and the history was not touched.` };
    if (text0 === null || before.revisions.length >= RISK_TIER_HISTORY_MAX)
      return { ok: false, reason: "RISK_TIER_HISTORY_UNSPLICEABLE", target, revisions: before.revisions.length,
               max: RISK_TIER_HISTORY_MAX,
               detail: "this action's risk_tier_history is not a block the act can append to in place (or it holds "
                     + `${RISK_TIER_HISTORY_MAX} revisions already); the act only appends, so nothing was written.` };
    /* END DEC-49 REGION is-risk-tier-act */

    const when = stampInstant("second", this.#nowMs(null));
    const entry = { tier: next, prior: held, by: Actions.#fmSafe(who), at: when, reason: why };
    let text = Actions.#appendRiskTierHistory(liveMd.content, entry);
    text = Actions.#setOrAddScalar(text, "risk_tier", String(next));
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    text = Actions.#appendSessionLog(text,
      `### Session ${when} | Risk tier revised | ${who}\n`
      + `Trigger: op=actionrisktier on ${target}\n`
      + `Changes: risk_tier ${held} (${RISK_TIERS[held]}) -> ${next} (${RISK_TIERS[next]}).\n`
      + `Reason: ${why}\n`);

    const carried = this.#carried(target);
    const bytes = new TextEncoder().encode(text);
    const promoted = this.promotion.promote({
      bundleId: target, base: this.#baseOf(target), snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`,
      author: who, viewer: viewer ?? who, [RISK_TIER_ACT]: true,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? b.object_type,
              title: fm.title, current_state: b.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    const after = parseFrontmatter(text).data || {};
    return { ok: true, target, risk_tier: next, risk_tier_words: RISK_TIERS[next], prior: held,
             prior_words: RISK_TIERS[held] ?? null, by: who, at: when, reason: why,
             risk_tier_history: riskTierHistoryOf(after), weight: "single" };
  }

  /* R23, R28 (C-90.2): the one site that answers a tier that is not 1, 2 or 3, for the act and for a proposal alike
     (one condition, one code). */
  #badRiskTier(target, tier, who) {
    /* DEC-49 REGION is-bad-risk-tier */
    return refuse("BAD_RISK_TIER", `${who} states a tier of 1 (file freely), 2 (file with caution) or 3 (do not file `
      + "without counsel). Undetermined is what an action reads when nobody has assessed it, not a tier to set.",
      { target, tier: tier ?? null, legal: [1, 2, 3] });
    /* END DEC-49 REGION is-bad-risk-tier */
  }

  /* REC-214: APPEND one entry to the top-level `risk_tier_history:` block, or open the block before the closing
     fence when absent — `#replaceGoverningLaws`' grammar, but it only ever ADDS rows after the last one. With
     `entry` null it answers only whether the block can be appended to (the act asks before it refuses anything
     that would write). Returns null for a block it cannot read as that shape — an inline value other than `[]` —
     refusing rather than guessing: the grammar has no escapes, and a wrong guess rewrites history silently. */
  static #appendRiskTierHistory(text, entry) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const rows = entry ? [
      `  - tier: ${entry.tier}`,
      `    prior: ${entry.prior}`,
      `    by: "${entry.by}"`,
      `    at: "${entry.at}"`,
      `    reason: "${entry.reason}"`,
    ] : [];
    let hi = -1;
    for (let i = 1; i < end; i++) if (/^risk_tier_history:/.test(lines[i])) { hi = i; break; }
    if (hi === -1) return [...lines.slice(0, end), "risk_tier_history:", ...rows, ...lines.slice(end)].join("\n");
    const rest = lines[hi].slice("risk_tier_history:".length).trim();
    if (rest !== "" && rest !== "[]") return null;
    let last = hi;
    if (rest === "")
      for (let i = hi + 1; i < end; i++) {
        if (lines[i].trim() === "") continue;
        if (/^\s/.test(lines[i])) { last = i; continue; }
        break;
      }
    return [...lines.slice(0, hi), "risk_tier_history:", ...lines.slice(hi + 1, last + 1), ...rows,
            ...lines.slice(last + 1)].join("\n");
  }

  /** op=actionlawspropose — REC-195 (D-149's remaining half; `BIO_Case_Making_v0_1.md` §2, *A RECORDS REQUEST
   *  NAMES EVERY LAW THAT GOVERNS IT*): A PROPOSAL OF CITATIONS AND LEVELS, STORED APART FROM THE MEMBER'S
   *  LIST AND LABELLED MACHINE WORK.
   *
   *  THE RULING'S OWN WORDS: *the machine may propose the list from the counterparty, labelled as machine work,
   *  and never sets it.* D-149 built the half that REFUSES (the machine fence at C-32.18) and said in this
   *  file's own comment that no proposal was built. This is that proposal, and every line of it is about the
   *  difference between the two halves.
   *
   *  IT NEVER SETS THE LIST, AND THAT IS STRUCTURAL RATHER THAN POLICED. This method does not call `promote`, it
   *  writes no file, and it never touches `governing_laws`, `governing_laws_by` or `governing_laws_at`. The list
   *  is the member's and moves only through `actionLaws`; the fence that keeps a revision from moving it
   *  (C-73.1) is untouched and unreachable from here, because nothing here writes bytes at all. The module test of
   *  R18 and R19 (`test/m/actions/acts.test.mjs`) holds that a proposal leaves the list as it stands.
   *
   *  ANY CREDENTIAL MAY PROPOSE, AND THE LABEL CARRIES THE MEANING — `themePropose`'s shape, for its reason
   *  (§8.4 fence 3). A fence admitting only machines would be a fence TIGHTER THAN ITS RULE: D-149 says a
   *  machine MAY propose, not that nobody else may, and a member's proposal to whoever states the list is a
   *  real act with an obvious surface. What the record owes is the LABEL, and `lawProposalLabel` composes it in
   *  one place so the plane answers the question rather than publishing an identity for a surface to judge.
   *
   *  THE WHOLE PROPOSAL, REPLACED, PER PROPOSER. A proposer restating replaces its OWN standing proposal and
   *  nobody else's: two machines proposing different lists are two proposals, and the record says who proposed
   *  which. There is no act that clears one and none that adopts one — adopting is `op=actionlaws`, which is a
   *  member's authored statement of the laws and not an acceptance of anybody's suggestion. **NOTHING HERE OR
   *  IN THE READ DERIVES A RELATION BETWEEN A PROPOSAL AND THE LIST**, even when they hold the same citations:
   *  that a member's list came FROM a machine's proposal is a claim about why somebody acted, and the record
   *  cannot support it. */
  actionLawsPropose({ target, laws = null, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who)
      return { ok: false, reason: "NO_AUTHOR",
               detail: "this call carries nobody. The plane stamps the proposer from the credential that "
                     + "asked, and a proposal nobody can be named for is one the record could say nothing "
                     + "about: the label IS the act." };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const read = this.#lawEntries(laws);
    if (!read.ok) return read;
    const entries = read.entries;

    const gate = viewerPredicate(viewer);
    const b = this.#one(
      `SELECT b.bundle_id, b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
      target, ...gate.args);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "governing laws belong to an action: they are the laws its request is made under." };
    /* R64, R19: a proposal may name a held standard with a law; it is one the proposer may read. */
    for (const e of entries) {
      if (!e.standard) continue;
      const r = this.#standardSeen(e.standard, viewer ?? who);
      if (r) return { ...r, target };
    }
    const at = stampInstant("second", this.#nowMs(null));
    /* REPLACE THIS PROPOSER'S OWN ROWS AND NOBODY ELSE'S. Keyed on both columns, never on the bundle alone. */
    this.sql.exec(`DELETE FROM action_law_proposals WHERE bundle_id=? AND proposed_by=?`, target, who);
    entries.forEach((e, i) => this.sql.exec(
      `INSERT INTO action_law_proposals (bundle_id, proposed_by, ord, level, citation, standard, proposed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, target, who, i, e.level, e.citation, e.standard ?? null, at));

    /* THE ACT'S OWN ANSWER SAYS WHAT IT DID NOT DO, read through the ONE reader of the list (`governingLawsOf`)
       so the act and the action's own read cannot disagree about whose the list is. */
    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    const fm = liveMd && liveMd.content !== null ? (parseFrontmatter(liveMd.content).data || {}) : null;
    const listed = governingLawsOf(fm);
    return { ok: true, target, weight: "single",
             proposal: { ...lawProposalLabel(who), at, laws: entries },
             governing_laws: listed, evidence: false,
             says: `${entries.length} citation${entries.length === 1 ? " is" : "s are"} proposed for this `
                 + `action. This is not the action's list of governing laws and did not change it: that list `
                 + `${listed.state === "stated" ? `is ${listed.laws.length} law(s) stated by a member` : "is UNDETERMINED"}`
                 + ", and only a member's own act states it." };
  }

  /* REC-24 (g): write the `responds_to` edge onto the CAPTURED REPLY, pointing
     back at the action it answered. The edge lives on the responding document
     because that is what the relation says — this document is what came back —
     and because refs is a projection of the CITING document's own frontmatter,
     so an edge stated anywhere else would be a second place the relationship
     lives (D-21).
     Returns null when the capture is not part of a bundle in this store, which
     is a legitimate state rather than a failure: bytes may be registered against
     a bundle that has since been purged, and the ledger entry stands on its own
     hash either way. Idempotent by inspection, so re-recording does not
     duplicate an edge. */
  #respondsToInto(captureSha, actionId, who) {
    const reg = this.#one(`SELECT bundle_id FROM register WHERE capture_sha=?`, captureSha);
    if (!reg || !reg.bundle_id || reg.bundle_id === actionId) return null;
    const doc = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, f.content
         FROM bundles b JOIN files f ON f.bundle_id=b.bundle_id AND f.path='bundle.md'
        WHERE b.bundle_id=?`, reg.bundle_id);
    if (!doc || doc.content === null) return null;
    const fm = parseFrontmatter(doc.content).data || {};
    const refs = Array.isArray(fm.references) ? fm.references : [];
    if (refs.some((r) => r && typeof r === "object" && r.rel === "responds_to" && r.target === actionId))
      return { bundle_id: doc.bundle_id, already: true };
    const when = stampInstant("second", this.#nowMs(null));
    let text = Actions.#spliceReferences(doc.content,
      [{ rel: "responds_to", target: actionId, status: "confirmed", note: "" }]);
    if (!text) return null;
    text = Actions.#setScalar(text, "last_updated", `"${when}"`);
    text = Actions.#appendSessionLog(text,
      `### Session ${when} | Recorded as a response | ${who}\n`
      + `Trigger: op=actioncorrespond on ${actionId}\n`
      + `Changes: responds_to edge added to ${actionId}.\n`);
    const carried = this.#carried(doc.bundle_id);
    const bytes = new TextEncoder().encode(text);
    const p = this.promotion.promote({
      bundleId: doc.bundle_id, base: this.#baseOf(doc.bundle_id),
      snapKey: `${when.replace(/[-:]/g, "")}_${Actions.#rand(4)}`, author: who, viewer: who,
      files: [{ path: "bundle.md", text, bytes: bytes.length,
                sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: { object_type: fm.object_type ?? doc.object_type,
              title: fm.title, current_state: fm.current_state ?? doc.current_state,
              prior_state: fm.prior_state ?? null, created: fm.created, last_updated: when,
              criticality: fm.criticality ?? null },
    });
    return p.ok ? { bundle_id: doc.bundle_id, already: false } : { bundle_id: doc.bundle_id, refused: p.reason };
  }

  /* D-148: A FEE QUOTE IS EVIDENCE — THE READ (`BIO_Case_Making_v0_1.md` §2).
   *
   * Quotes set side by side by ONE axis at a time: `counterparty=` (the action's
   * own named counterparty, matched exactly as written) or `request=` (an action,
   * optionally `answers=` one sent entry of it). One indexed lookup each, over
   * the `action_quotes` projection and gated by the viewer through the action.
   *
   * IT JUDGES NOTHING. Each row says what was quoted, by whom, when, for which
   * request, how it is held (captured bytes or a member's account), and which
   * later quotes revise it — a waiver is a revision to zero, and both rows are
   * returned. Whether two requests sought the same records, or a quote exceeds
   * what a law allows, is a member's claim in an inquiry (DEC-24), so no field
   * here compares one quote to another.
   *
   * AN EMPTY ANSWER SAYS WHICH LEVEL WAS EMPTY. By request, it names how many
   * sent and received entries the ledger holds, so "no quote" is distinguishable
   * from "no reply". By counterparty, it says an action whose counterparty is
   * stated undetermined is reachable only by its request. */
  actionQuotes({ counterparty = null, request = null, answers = null, viewer = null } = {}) {
    const cp = String(counterparty ?? "").trim();
    const req = String(request ?? "").trim();
    const ans = String(answers ?? "").trim();
    const refusal = (code, detail, extra) => {
      const row = QUOTE_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation,
               detail, ...(extra || {}) };
    };
    /* DEC-49 REGION is-quote-read-axis — D-148/C-72.7-8. One axis at a time: a read
       answering from both would be neither question the caller asked; and answers=
       names a position in a ledger, so it is a whole number or it names nothing. */
    if ((!cp && !req) || (cp && req))
      return refusal("QUOTE_READ_UNASKED",
        "quotes are read by counterparty= or by request= (optionally with answers=), one at a time",
        { axes: ["counterparty", "request"] });
    if (ans && !/^\d+$/.test(ans))
      return refusal("QUOTE_ANSWERS_NOT_AN_ORD",
        "answers= is the position of a sent entry in the action's correspondence, a whole number",
        { answers: ans.slice(0, 20) });
    /* END DEC-49 REGION is-quote-read-axis */
    const gate = viewerPredicate(viewer);
    const max = QUOTES_MAX;
    let rows;
    let absence = null;
    if (req) {
      const b = this.#one(
        `SELECT b.bundle_id, b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
        req, ...gate.args);
      if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: req };
      if (normalizeType(b.object_type) !== "action")
        return { ok: false, reason: "NOT_AN_ACTION", target: req, object_type: b.object_type };
      rows = this.#rows(
        `SELECT q.* FROM action_quotes q WHERE q.bundle_id=?${ans ? " AND q.answers_ord=?" : ""}
          ORDER BY q.ord LIMIT ?`, req, ...(ans ? [Number(ans)] : []), max + 1);
      if (!rows.length) {
        const n = (d) => this.#one(`SELECT COUNT(*) AS n FROM correspondence WHERE bundle_id=? AND direction=?`,
          req, d).n;
        const sent = n("sent"), received = n("received");
        absence = { level: sent === 0 ? "no_request" : received === 0 ? "no_reply" : "no_quote",
                    sent, received,
                    says: sent === 0 ? "this action's ledger records no sent entry, so nothing here could be quoted"
                      : received === 0 ? "this action's ledger records no reply, so no quote has been received"
                      : "this action's ledger records replies and none of them carries a quote" };
      }
    } else {
      rows = this.#rows(
        `SELECT q.* FROM action_quotes q JOIN bundles b ON b.bundle_id=q.bundle_id
          WHERE q.counterparty=? AND (${gate.sql}) ORDER BY q.bundle_id, q.ord LIMIT ?`,
        cp, ...gate.args, max + 1);
      if (!rows.length)
        absence = { level: "no_quote_by_name",
                    says: "no action you may read names this counterparty and carries a quote. The name is "
                        + "matched exactly as written, and an action whose counterparty is stated undetermined "
                        + "is reachable only by its request" };
    }
    const truncated = rows.length > max;
    const quotes = rows.slice(0, max).map((q) => {
      const entry = this.#one(
        `SELECT artifact_sha, artifact_bundle_id, account, author, party FROM correspondence
          WHERE bundle_id=? AND ord=?`, q.bundle_id, q.ord) || {};
      const sent = this.#one(
        `SELECT at, artifact_sha, account FROM correspondence WHERE bundle_id=? AND ord=?`,
        q.bundle_id, q.answers_ord) || {};
      return {
        action: q.bundle_id, ord: q.ord, at: q.at,
        amount: q.amount, value: q.value, currency: q.currency, basis: q.basis,
        counterparty: q.counterparty, party: entry.party ?? null,
        held_as: entry.artifact_sha ? "capture" : "testimony",
        ...(entry.artifact_sha ? { artifact_sha: entry.artifact_sha, artifact_bundle_id: entry.artifact_bundle_id ?? null }
                               : { account: entry.account ?? null }),
        author: entry.author ?? null,
        answers: { ord: q.answers_ord, at: sent.at ?? null },
        revises: q.revises_ord,
        revised_by: this.#rows(`SELECT ord FROM action_quotes WHERE bundle_id=? AND revises_ord=? ORDER BY ord`,
          q.bundle_id, q.ord).map((r) => r.ord),
      };
    });
    return { ok: true, by: req ? "request" : "counterparty", ...(req ? { request: req } : { counterparty: cp }),
             ...(ans ? { answers: Number(ans) } : {}),
             quotes, count: quotes.length, truncated, max,
             ...(absence ? { absence } : {}),
             says: "the record asserts only what was quoted, by whom, when, and for which request. It sets "
                 + "quotes side by side and judges none of them (DEC-24)." };
  }

  /* REC-24 (d): APPEND one entry to the `correspondence` block, touching nothing
     else — #spliceBasis line for line, and a twin rather than a generalisation
     for the reason stated there: the ELEMENT shapes differ, and a parameterised
     splicer would hide that behind an option in a grammar with no serializer.
     A KEY IS RENDERED ONLY IF THE ENTRY CARRIES IT, so an entry held as
     testimony carries no artifact_sha at all rather than an empty one — the
     capture-or-testify choice is visible in the bytes and not only in a table.
     Values are emitted quoted where they are prose (account, medium, party) and
     bare where they are tokens, matching what the restricted grammar's parser
     reads back. */
  static #spliceCorrespondence(text, e) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = [
      `  - direction: ${e.direction}`,
      `    at: ${e.at}`,
      ...(e.medium ? [`    medium: "${e.medium}"`] : []),
      ...(e.party ? [`    party: "${e.party}"`] : []),
      ...(e.artifact_sha ? [`    artifact_sha: ${e.artifact_sha}`] : []),
      ...(e.account ? [`    account: "${e.account}"`] : []),
      /* D-148: a quote's keys, each only if carried. The amount is QUOTED so the
         parser keeps the text as the body wrote it (`1083.00` stays `1083.00`);
         the two ords are bare tokens. */
      ...(e.quote_amount !== undefined ? [`    quote_amount: "${e.quote_amount}"`] : []),
      ...(e.quote_currency !== undefined ? [`    quote_currency: "${e.quote_currency}"`] : []),
      ...(e.quote_basis !== undefined ? [`    quote_basis: "${e.quote_basis}"`] : []),
      ...(e.quote_answers !== undefined ? [`    quote_answers: ${e.quote_answers}`] : []),
      ...(e.quote_revises !== undefined ? [`    quote_revises: ${e.quote_revises}`] : []),
      /* D-147: the lifecycle keys, each only if carried. Stage, follows and
         outcome are bare tokens (judged tokens before this splice); the date and
         the two prose values are quoted so the parser keeps them as written. */
      ...(e.stage !== undefined ? [`    stage: ${e.stage}`] : []),
      ...(e.follows !== undefined ? [`    follows: ${e.follows}`] : []),
      ...(e.outcome !== undefined ? [`    outcome: ${e.outcome}`] : []),
      ...(e.exemptions !== undefined ? [`    exemptions: "${e.exemptions}"`] : []),
      ...(e.due_by !== undefined ? [`    due_by: "${e.due_by}"`] : []),
      ...(e.due_cite !== undefined ? [`    due_cite: "${e.due_cite}"`] : []),
      /* R81, R83, R94 (T45): the entry's T45 fields, flat (J2's reading): tokens bare, text quoted. */
      ...(e.speaker !== undefined ? [`    speaker: ${e.speaker}`] : []),
      ...(e.office_words !== undefined ? [`    office_words: "${e.office_words}"`] : []),
      ...(e.office_status !== undefined ? [`    office_status: ${e.office_status}`] : []),
      ...(e.found_elsewhere !== undefined ? [`    found_elsewhere: ${e.found_elsewhere}`] : []),
      ...(e.found_elsewhere_note !== undefined ? [`    found_elsewhere_note: "${e.found_elsewhere_note}"`] : []),
      ...(e.pressure_kind !== undefined ? [`    pressure_kind: ${e.pressure_kind}`] : []),
      ...(e.pressure_note !== undefined ? [`    pressure_note: "${e.pressure_note}"`] : []),
      `    author: ${e.author}`,
      `    recorded_at: "${e.recorded_at}"`,
    ];
    let ci = -1;
    for (let i = 1; i < end; i++) if (/^correspondence:/.test(lines[i])) { ci = i; break; }
    if (ci === -1)
      return [...lines.slice(0, end), "correspondence:", ...block, ...lines.slice(end)].join("\n");
    const rest = lines[ci].slice("correspondence:".length).trim();
    if (rest === "[]")
      return [...lines.slice(0, ci), "correspondence:", ...block, ...lines.slice(ci + 1)].join("\n");
    if (rest !== "") return null;
    let last = ci;
    for (let i = ci + 1; i < end; i++) {
      if (lines[i].trim() === "") continue;
      if (/^\s/.test(lines[i])) { last = i; continue; }
      break;
    }
    return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
  }
  /* ================================================================ the read (R25, R26, R29, R30) */

  /** R25, REC-24 (f)/(g): everything about ONE action that is DERIVED rather than stored — the clock's verdict at a
   *  named instant, the action's own outcome (DEC-14), the ledger, the legs, and what responded. `row` is the
   *  projection row retrieval answers (`bundle_id`, `fm_json`, `action_*` columns); the cached flag is reported beside
   *  the derivation, never in place of it (R35). */
  derived(row, nowMs = null, viewer = null) {
    let fm = {};
    try { fm = row && row.fm_json ? (JSON.parse(row.fm_json) || {}) : {}; } catch { fm = {}; }
    if ((!fm || !Object.keys(fm).length) && row && row.bundle_id) fm = this.#heldFm(row.bundle_id) || {};
    const now = this.#nowMs(nowMs);
    const place = this.place();
    const ledger = this.#rows(
      `SELECT ord, direction, at, medium, party, artifact_bundle_id, artifact_sha, account, author, recorded_at
         FROM correspondence WHERE bundle_id=? ORDER BY ord`, row.bundle_id);
    const legs = this.#rows(
      `SELECT ord, target_id, target_type, kind, note, at, extent_capture FROM action_basis WHERE bundle_id=? ORDER BY ord`,
      row.bundle_id).map((l) => ({ ...l, extent_capture: l.extent_capture ?? null,
        ...(l.target_type === "information" && !l.extent_capture ? { version: "undetermined" } : {}) }));
    const tier = riskTierState(fm.risk_tier);
    const cp = fm.counterparty && typeof fm.counterparty === "object" && !Array.isArray(fm.counterparty) ? fm.counterparty : {};
    return {
      kind: typeof fm.action_kind === "string" ? fm.action_kind : (row.action_kind ?? null),
      /* D-182: read from the stored DOCUMENT, never defaulted; the words travel with the value. */
      risk_tier: tier, risk_tier_words: RISK_TIERS[tier] ?? null,
      risk_tier_history: riskTierHistoryOf(fm),
      counterparty_state: typeof cp.state === "string" ? cp.state : (row.action_counterparty_state ?? null),
      resolution: typeof fm.resolution === "string" ? fm.resolution : (row.action_resolution ?? null),
      clock_next: actionClockNext(fm),
      clock_overdue: actionOverdue(fm, now, place),
      clock_overdue_cached: row.action_clock_overdue === null || row.action_clock_overdue === undefined
        ? null : !!row.action_clock_overdue,
      as_of: new Date(now).toISOString(),
      basis: legs,
      correspondence: ledger,
      governing_laws: governingLawsOf(fm),
      governing_laws_proposals: this.#lawProposalsFor(row.bundle_id),
      risk_tier_proposals: this.#riskProposalsFor(row.bundle_id),
      /* R70, R73: what a records request seeks, as a member stated it, and the proposals of it stored apart. */
      seeks: seeksOf(fm),
      seeks_proposals: this.#seeksProposalsFor(row.bundle_id),
      records_law: fm.action_kind === "records_request" ? recordsLawOf(fm, this.#lawAuthor(row.bundle_id, fm)) : null,
      lifecycle: requestLifecycleOf(fm, localToday(now, zoneOf(place)) ?? ""),
      /* R26, DEC-14: the ACTION'S OWN OUTCOME, never the breach's consequence (which `consequences` holds). */
      own_outcome: consequenceState(fm),
      responses: this.#rows(`SELECT bundle_id FROM refs WHERE target_id=? AND kind='responds_to' ORDER BY bundle_id`,
        row.bundle_id).map((r) => r.bundle_id),
      /* R45: the group's contact, a member id; it grants nothing. */
      contact: typeof fm.contact === "string" && fm.contact.trim() ? fm.contact.trim() : null,
      /* R46: the plan and option the action was started from, as created. */
      plan: typeof fm.plan === "string" ? fm.plan : null,
      option: fm.option === undefined || fm.option === null ? null : fm.option,
      /* R8: the premise override, with who stated it and when. */
      premise_override: this.#overrideRead(row.bundle_id, fm),
      /* T33-73: the action's date (R9, R64, R65), the office addressee's entity and holder on it (R9), each law's held
         standard with its in-force state on it (R64), and the proceeding with its status on it (R65). */
      ...this.#t33Read(fm, viewer),
      ...this.#t45Read(row.bundle_id, fm, viewer, ledger),
    };
  }

  /* R25 (T45): what T45 adds to the read: the gate's ground and its disclosures (R74–R76, R8 (d)), the addressing
     (R9's press holder and venue delivery point, R77–R79), receipt, reply owed and responses (R80–R83, R85, R86, R94),
     the scope and promises (R87, R88), and recognition's basis (R93). Each derived on read, never written. */
  #t45Read(id, fm, viewer, ledger) {
    const dets = this.#legDeterminations(fm, viewer);
    const live = dets.filter(({ d }) => d.live !== false && !d.superseded_by);
    const cp = fm.counterparty && typeof fm.counterparty === "object" && !Array.isArray(fm.counterparty) ? fm.counterparty : null;
    const kindEntry = this.#kindEntry(fm.action_kind);
    const stages = fm.action_kind === "records_request" ? this.#lawStages(fm.law) : null;
    const history = (field) => this.#rows(`SELECT seq, value, reason, by, at FROM action_field_history WHERE bundle_id=? AND field=?
      ORDER BY seq`, id, field).map((r) => { let v = null; try { v = JSON.parse(r.value); } catch { v = null; }
        return { seq: r.seq, value: v, ...(r.reason !== null ? { reason: r.reason } : {}), by: r.by, at: r.at }; });
    const owed = fm.reply_owed === false ? false : true;
    const out = {
      /* R8 (d): the live noncompliant determinations a breach action rests on, beside any override. */
      breach_rests_on: live.filter(({ d }) => !d.void && Actions.#noncompliant(d)).map(({ id: x }) => x),
      disclosures: this.#disclosures(fm, live, id),
      basis_void: dets.filter(({ d }) => d.void).map(({ id: x, d }) => ({ determination: x,
        causes: Array.isArray(d.void.causes) ? d.void.causes : [] })),
      press_holder: cp && cp.kind === "press" && typeof cp.holder === "string" && cp.holder.trim() ? { name: cp.holder.trim() } : null,
      copied: Array.isArray(fm.copied) ? fm.copied : [],
      partners: Array.isArray(fm.partners) ? fm.partners : [],
      press_terms: fm.press_terms && typeof fm.press_terms === "object" ? fm.press_terms : null,
      press_terms_history: history("press_terms"),
      reply_owed: { owed, ...(owed ? {} : T45_SENTENCES.reply_not_owed), history: history("reply_owed") },
      receipts: this.#receiptsOf(id),
      entries: (Array.isArray(fm.correspondence) ? fm.correspondence : []).map((e, ord) => {
        const p = Actions.entryFields(e) || {};
        return { ord, ...(p.speaker !== undefined ? { speaker: p.speaker } : {}),
                 ...(p.office_status ? { office_status: p.office_status } : {}),
                 ...(p.found_elsewhere ? { found_elsewhere: p.found_elsewhere } : {}),
                 ...(p.pressure ? { pressure: p.pressure } : {}),
                 ...(fm.action_kind === "records_request" && typeof p.stage === "string"
                   ? { stage_in_law: stageInLaw(p.stage, stages) } : {}) };
      }).filter((x) => Object.keys(x).length > 1),
      follows_action: fm.follows_action && typeof fm.follows_action === "object" ? fm.follows_action : null,
      followed_by: this.#followedBy(id, viewer),
      /* R87 (K2850): the latest scope statement, false with none, and its statements. */
      confidential: this.#confidential(id),
      scope: this.#scopeOf(id),
      promises: this.#promisesOf(id),
    };
    /* R9 (T45): the venue's delivery point beside an office addressee, where the profile's venue for the kind states one. */
    const facts = kindEntry && kindEntry.venue && Array.isArray(kindEntry.venue.facts) ? kindEntry.venue.facts : [];
    const dp = facts.find((f) => f && f.fact === "delivery_point");
    if (dp && counterpartyOffice(cp))
      out.delivery_point = { value: dp.value, citation: dp.citation ?? null,
                             says: "where it is delivered, as the venue states it; never the addressee" };
    /* R93: a kind the view marks `shape: recognition`: what the recognition rests on. Nothing is refused for it. */
    if (kindEntry && kindEntry.shape === "recognition") {
      const compliant = live.some(({ d }) => !d.void && (Array.isArray(d.outcomes) ? d.outcomes : []).some((o) => o && o.outcome === "compliant"));
      const success = !compliant && (Array.isArray(fm.action_basis) ? fm.action_basis : [])
        .some((l) => l && l.kind === "rests_on" && typeof l.target === "string" && this.#successRecord(l.target, viewer));
      out.recognition_basis = compliant ? { basis: "compliant" } : success ? { basis: "success" }
        : { basis: "promise_only", ...T45_SENTENCES.recognition_promise_only };
    }
    void ledger;
    return out;
  }

  /* R75 (T45; N828, N883; v0.2 rule 3): one disclosure per distinct held check and per distinct accepted source edition
     among the live determinations' findings (conformance R9's `basis`, read as the viewer reads each determination,
     J1 8), and the override's; published findings carry none. */
  #disclosures(fm, live, id) {
    const out = [], seen = new Set();
    for (const { d } of live)
      for (const f of Array.isArray(d.findings) ? d.findings : []) {
        const b = f && f.basis && typeof f.basis === "object" ? f.basis : null;
        if (!b) continue;
        if (b.kind === "checked_held") {
          const k = `c\u0000${b.check ?? ""}\u0000${b.checked_at ?? ""}`;
          if (!seen.has(k)) { seen.add(k); out.push({ kind: "checked_held", checked_at: b.checked_at ?? null }); }
        } else if (b.kind === "accepted") {
          const k = `a\u0000${b.group ?? ""}\u0000${b.case ?? ""}\u0000${b.edition ?? ""}`;
          if (!seen.has(k)) {
            seen.add(k);
            out.push({ kind: "accepted", group: b.group ?? null, edition_date: b.edition_date ?? null,
                       accepted_at: b.accepted_at ?? null, identity: b.identity ?? null, stake: b.stake ?? "undetermined" });
          }
        }
      }
    const o = this.#overrideRead(id, fm);
    if (o) out.push({ kind: "override", ground: o.ground, reason: o.reason, by: o.by, at: o.at });
    return out;
  }

  /* R86 (T45): the actions the viewer may see that state they follow `id`. */
  #followedBy(id, viewer) {
    if (viewer === null || viewer === undefined || viewer === "") return [];
    const gate = viewerPredicate(viewer);
    const out = [];
    for (const r of this.#rows(`SELECT b.bundle_id, f.content FROM bundles b JOIN files f ON f.bundle_id = b.bundle_id
        AND f.path = 'bundle.md' WHERE b.object_type = 'action' AND (${gate.sql}) AND f.content LIKE '%follows_action%'
        ORDER BY b.bundle_id`, ...gate.args)) {
      let fm = null;
      try { fm = parseFrontmatter(r.content).data; } catch { fm = null; }
      const f = fm && fm.follows_action;
      if (f && typeof f === "object" && f.action === id) out.push({ action: r.bundle_id, ...(f.ord !== undefined ? { ord: f.ord } : {}) });
    }
    return out;
  }

  /** R9, R64, R65: "the action's date": the first `sent` entry's day, else the day it was created; null when neither
   *  is a calendar day. Answered with its basis. */
  static actionDate(fm) {
    const sent = (Array.isArray(fm && fm.correspondence) ? fm.correspondence : [])
      .find((e) => e && typeof e === "object" && e.direction === "sent" && isCalendarDate(String(e.at ?? "").slice(0, 10)));
    if (sent) return { date: String(sent.at).slice(0, 10), basis: "the first sent correspondence entry" };
    const c = typeof (fm && fm.created) === "string" ? fm.created.slice(0, 10) : "";
    return isCalendarDate(c) ? { date: c, basis: "the day the action was created; nothing has been sent" }
      : { date: null, basis: "the action states no date it was sent or created" };
  }

  #t33Read(fm, viewer) {
    const asOf = Actions.actionDate(fm);
    const date = asOf.date;
    /* R9: an office addressee, its entity (stated, or the bridge's at read), and who held it on the action's date. */
    const office = counterpartyOffice(fm.counterparty);
    let addressee = null;
    if (office) {
      const stated = office.entity_id ? { entity_id: office.entity_id, filled: "stated" }
        : office.legacy ? { entity_id: null, filled: "none", says: "an earlier addressee named by a name alone, read as written" }
        : this.#bridge(office.role, office.body, viewer);
      let holder;
      if (!stated.entity_id) holder = { holder: null, undetermined: "no office entity is held for this addressee" };
      else if (!date) holder = { holder: null, undetermined: asOf.basis };
      else {
        let h = null;
        try { h = this.lines ? this.lines.holderAt({ office: stated.entity_id, at: date, viewer }) : null; } catch { h = null; }
        holder = !h ? { holder: null, undetermined: "the dated lines could not be read" }
          : h.ok === false ? { holder: null, undetermined: h.detail || h.reason }
          : h.holder ? { holder: h.holder, line: h.line ? h.line.line_id : null, capacity: h.capacity ?? null }
          : { holder: null, undetermined: h.undetermined, ...(h.lines ? { lines: h.lines } : {}) };
      }
      addressee = { role: office.role, body: office.body, ...stated,
                    holder_on_date: { ...holder, on: date,
                      says: "who held this office on the action's date. The action is addressed to the office, never to them." } };
    }
    /* R64: each law naming a held standard, with that standard's in-force state on the action's date. */
    const named = [];
    for (const l of Array.isArray(fm.governing_laws) ? fm.governing_laws : [])
      if (l && typeof l === "object" && typeof l.standard === "string" && l.standard.trim())
        named.push({ law: "governing", level: l.level ?? null, citation: l.citation ?? null, standard: l.standard.trim() });
    if (typeof fm.law_standard === "string" && fm.law_standard.trim())
      named.push({ law: "records", citation: typeof fm.law === "string" ? fm.law : null, standard: fm.law_standard.trim() });
    const law_standards = named.map((n) => {
      if (this.#standardSeen(n.standard, viewer))
        return { ...n, in_force: null, says: "no standard you may read answers to this id" };
      let f = null;
      try { f = date ? this.standards.inForceAt({ standard: n.standard, date, viewer }) : null; } catch { f = null; }
      return { ...n, in_force: f ? { state: f.state ?? "undetermined", why: f.why ?? null, on: date }
                                 : { state: "undetermined", why: date ? "the standard's period could not be read" : asOf.basis, on: date } };
    });
    /* R65: the proceeding, with its status on the action's date. */
    let proceeding = null;
    if (typeof fm.proceeding === "string" && fm.proceeding.trim()) {
      const pid = fm.proceeding.trim();
      let st = null;
      try { st = date && this.events ? this.events.proceedingStatusAt({ proceeding: pid, at: date, viewer }) : null; } catch { st = null; }
      proceeding = { entity_id: pid, on: date,
                     status: !st ? { stage: "undetermined", why: date ? "the events could not be read" : asOf.basis }
                       : st.ok === false ? { stage: "undetermined", why: st.detail || st.reason }
                       : { stage: st.stage, ...(st.why ? { why: st.why } : {}), ...(st.label ? { label: st.label } : {}) } };
    }
    return { as_of_date: asOf, addressee, law_standards, proceeding };
  }

  /** R71 (H30 (1); intent R33; K2505): registered with `intent.registerNoneExistsReader`: the `records_request` actions
   *  the viewer may see whose `seeks` (action-grammar's `seeksOf`) names that progression, entity and stage and whose
   *  correspondence holds a `received` entry with outcome `none_exists`, each `{action, ord, at}` (the entry's position
   *  and date), oldest first, at most 50. No viewer sees none. Writes nothing and never throws; a read that fails
   *  answers `[]`, so no stage is met this way. */
  noneExistsFor({ progression = null, entity = null, stage = null, viewer = null } = {}) {
    try {
      const want = [progression, entity, stage];
      if (want.some((x) => typeof x !== "string" || !x) || viewer === null || viewer === undefined || viewer === "") return [];
      const gate = viewerPredicate(viewer);
      const rows = this.#rows(`SELECT b.bundle_id, f.content FROM bundles b
        JOIN files f ON f.bundle_id = b.bundle_id AND f.path = 'bundle.md'
        WHERE b.object_type = 'action' AND (${gate.sql}) AND f.content LIKE '%none_exists%' AND f.content LIKE '%seeks%'
        ORDER BY b.bundle_id`, ...gate.args);
      const out = [];
      for (const r of rows) {
        let fm = null;
        try { fm = parseFrontmatter(r.content).data; } catch { fm = null; }
        if (!fm || typeof fm !== "object" || fm.action_kind !== "records_request") continue;
        if (!seeksOf(fm).some((x) => x.progression === progression && x.entity === entity && x.stage === stage)) continue;
        (Array.isArray(fm.correspondence) ? fm.correspondence : []).forEach((e, ord) => {
          if (e && typeof e === "object" && e.direction === "received" && e.outcome === "none_exists")
            out.push({ action: r.bundle_id, ord, at: e.at === undefined || e.at === null ? null : String(e.at) });
        });
      }
      out.sort((p, q) => (String(p.at) < String(q.at) ? -1 : String(p.at) > String(q.at) ? 1
        : p.action < q.action ? -1 : p.action > q.action ? 1 : p.ord - q.ord));
      return out.slice(0, NONE_EXISTS_MAX);
    } catch { return []; }
  }

  /* R8: the override as the document states it, stamped with who and when from this module's table; null when the
     document states none. */
  #overrideRead(id, fm) {
    const o = Actions.overrideOf(fm);
    if (!o) return null;
    const r = this.#one(`SELECT stated_by, at FROM action_overrides WHERE bundle_id=?`, id);
    return { ground: o.ground, reason: o.reason, by: r ? r.stated_by : null, at: r ? r.at : null,
             /* R74: an override written before T45 reads as written, its ground not stated, never re-asked. */
             ...(o.ground ? {} : { ground_not_stated: T45_SENTENCES.ground_not_stated }),
             says: "Rests on an unestablished premise: a member chose to act on this breach without a determination, "
                 + "on the ground and for the reason stated." };
  }

  /* R5: the recorded author class of the action's creation (record-core R15–R16's manifest, first by `seq`): a law
     written before C-32.20's fence was written with the action, and since the fence no machine can state one. */
  #lawAuthor(id, fm) {
    if (!fm || typeof fm.law !== "string" || !fm.law.trim()) return null;
    let entries = [];
    try {
      const im = this.record.readImage(id);
      const m = im ? im["_history/manifest.json"] : null;
      entries = (JSON.parse(typeof m === "string" ? m : m && m.text ? m.text : "{}").entries) || [];
    } catch { entries = []; }
    const first = [...entries].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))[0];
    return first && typeof first.author === "string" ? first.author : null;
  }

  /** R29: one action's block (R25) for a viewer. */
  actionRead({ id, viewer = null, now = null } = {}) {
    const b = id ? this.#visibleAction(id, viewer) : null;
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: id ?? null };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target: id, object_type: b.object_type };
    const fm = this.#heldFm(id) || {};
    const d = this.derived({ bundle_id: id }, now, viewer);
    /* R29 (K248): R25's keys, and the document's own values its users read (filings, escalation). */
    return { ok: true, id, current_state: b.current_state, ...d,
             counterparty: fm.counterparty ?? null, clock: Array.isArray(fm.clock) ? fm.clock : [],
             legs: d.basis.map((l) => ({ target: l.target_id, kind: l.kind, note: l.note ?? null, at: l.at ?? null,
                                         target_type: l.target_type, extent_capture: l.extent_capture })),
             law: typeof fm.law === "string" ? fm.law : null, breach: fm.breach === true,
             /* K248, B4 (filings R9's chronology): the state moves in order, each {state, at, by}. */
             state_history: (Array.isArray(fm.state_history) ? fm.state_history : [])
               .filter((e) => e && typeof e === "object")
               .map((e) => ({ state: e.to_state ?? null, at: e.timestamp ?? null, by: e.author ?? null })) };
  }

  /** R30: visible actions by filters, in id order, at most 200 per page, `truncated` by reading one past. */
  actionsFor({ determination = null, counterparty = null, state = null, kind = null, after = null, limit = null,
               proceeding = null, basis_void = null, follows = null, viewer = null } = {}) {
    const max = clampLimit(limit, ACTIONS_PAGE_MAX, ACTIONS_PAGE_MAX);
    const gate = viewerPredicate(viewer);
    const where = [`b.object_type='action'`, `(${gate.sql})`, `b.bundle_id>?`], fixed = [...gate.args];
    const tail = [];
    if (state) { where.push(`b.current_state=?`); tail.push(String(state)); }
    if (determination) { where.push(`EXISTS (SELECT 1 FROM action_basis l WHERE l.bundle_id=b.bundle_id AND l.kind='rests_on' AND l.target_id=?)`); tail.push(String(determination)); }
    const out = [];
    let truncated = false;
    /* kind and counterparty are read from the document, so the page is filled by reading on in id order. */
    let from = after ? String(after) : "";
    for (;;) {
      const rows = this.#rows(`SELECT b.bundle_id, b.current_state FROM bundles b WHERE ${where.join(" AND ")}
        ORDER BY b.bundle_id LIMIT ?`, ...fixed, from, ...tail, max + 1);
      for (const r of rows) {
        from = r.bundle_id;
        const fm = this.#heldFm(r.bundle_id) || {};
        if (kind && fm.action_kind !== kind) continue;
        if (counterparty && counterpartyName(fm.counterparty) !== counterparty) continue;
        /* R65: the actions belonging to a proceeding. */
        if (proceeding && fm.proceeding !== proceeding) continue;
        /* R86 (T45): the actions that follow `follows`. */
        if (follows && !(fm.follows_action && typeof fm.follows_action === "object" && fm.follows_action.action === follows)) continue;
        /* R76 (T45): the actions resting on a determination conformance answers void, derived on this read. */
        const voids = basis_void === true || basis_void === "true"
          ? this.#legDeterminations(fm, viewer).filter(({ d }) => d.void).map(({ id: x, d }) =>
              ({ determination: x, causes: Array.isArray(d.void.causes) ? d.void.causes : [] })) : null;
        if (voids && !voids.length) continue;
        if (out.length === max) { truncated = true; break; }
        const cp = fm.counterparty && typeof fm.counterparty === "object" ? fm.counterparty : null;
        out.push({ id: r.bundle_id, state: r.current_state, kind: fm.action_kind ?? null,
                   counterparty: counterpartyName(fm.counterparty), counterparty_state: fm.counterparty?.state ?? null,
                   /* R9 (T45): a press addressee's holder, kept inside the group: the read and this list only. */
                   ...(cp && cp.kind === "press" && typeof cp.holder === "string" && cp.holder.trim() ? { holder: { name: cp.holder.trim() } } : {}),
                   ...(voids ? { basis_void: voids } : {}), confidential: this.#confidential(r.bundle_id) });
      }
      if (truncated || rows.length <= max) break;
    }
    const cursor = out.length ? out[out.length - 1].id : null;
    return { ok: true, items: out, limit: max, truncated, cursor,
             ...(determination && !this.conformance ? { determination_read: "undetermined",
                 says: "the legs are matched by the determination named; whether it is live is conformance's to say, and it is not provided on this instance" } : {}) };
  }

  /** R62 (A ORG): the offices the record holds as `custodian_of` or `responsible_for` a subject (an entity, or a record
   *  the action rests on, read through the entities its captures resolve to at an established grade), each as R9's
   *  office arm with the line it rests on and that line's two grades, valid on the action's date or today
   *  (`lines.structureAt`); undetermined ones apart, with why. A suggestion: it writes nothing and sets nothing. */
  addresseeSuggest({ action = null, subject = null, viewer = null } = {}) {
    const subj = typeof subject === "string" ? subject.trim() : "";
    /* DEC-49 REGION is-addressee-subject */
    if (!subj) return refuse("NO_SUBJECT", "an addressee is suggested for a subject: an entity (ENT-) or a record the "
      + "action rests on. Nothing was read.");
    /* END DEC-49 REGION is-addressee-subject */
    let at = null, basis = "today";
    if (action) {
      const b = this.#visibleAction(String(action), viewer);
      if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: action };
      if (normalizeType(b.object_type) !== "action") return { ok: false, reason: "NOT_AN_ACTION", target: action };
      const d = Actions.actionDate(this.#heldFm(String(action)) || {});
      if (d.date) { at = d.date; basis = d.basis; }
    }
    if (!at) at = localToday(this.#nowMs(null), zoneOf(this.place())) ?? instantOf(this.#nowMs(null));
    let entities;
    if (ENTITY_ID_RE.test(subj)) {
      if (!this.#entityKind(subj)) return noSuchEntity(subj, { end: "subject" });
      entities = [subj];
    } else {
      const b = this.#visibleAction(subj, viewer);
      if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: subj };
      try {
        entities = this.#rows(`SELECT DISTINCT entity_id FROM resolutions WHERE bundle_id=? AND established=1 ORDER BY entity_id LIMIT 51`, subj)
          .map((r) => r.entity_id);
      } catch { entities = []; }
    }
    const lines = this.lines;
    const offices = [], undetermined = [];
    const seen = new Set();
    const label = (id) => { let r = null; try { r = this.entities.readEntity({ entityId: id }); } catch { r = null; }
                            return r && r.found && r.entity ? r.entity.label : null; };
    const bodyOf = (office) => {
      let r = null;
      try { r = lines.structureAt({ entity: office, at, kinds: ["post_in"], viewer }); } catch { r = null; }
      const held = r && r.ok ? (r.held || []).filter((l) => l.from === office) : [];
      return held.length === 1 ? { body: label(held[0].to) } : { why: held.length ? "the office is held in more than one body on that date"
        : "no line on that date places the office in a body" };
    };
    for (const e of entities.slice(0, 50)) {
      let r = null;
      try { r = lines ? lines.structureAt({ entity: e, at, kinds: ["custodian_of", "responsible_for"], viewer }) : null; } catch { r = null; }
      if (!r || r.ok === false) { undetermined.push({ subject: e, why: "the dated lines could not be read" }); continue; }
      for (const l of r.held || []) {
        if (l.to !== e || this.#entityKind(l.from) !== "office" || seen.has(`${l.from}|${l.line_id}`)) continue;
        seen.add(`${l.from}|${l.line_id}`);
        const line = { line_id: l.line_id, kind: l.kind, grades: { assertion: l.assertion, ends: l.ends } };
        const b = bodyOf(l.from);
        if (b.body) offices.push({ addressee: { state: "named", kind: "office", role: label(l.from), body: b.body, entity_id: l.from },
                                   concerns: e, line });
        else undetermined.push({ office: l.from, concerns: e, line, why: b.why });
      }
      for (const u of r.undetermined || [])
        if (u.line && u.line.to === e) undetermined.push({ office: u.line.from, concerns: e,
          line: { line_id: u.line.line_id, kind: u.line.kind, grades: { assertion: u.line.assertion, ends: u.line.ends } }, why: u.why });
    }
    return { ok: true, subject: subj, at, at_basis: basis, offices, undetermined, suggestion: true,
             says: offices.length || undetermined.length
               ? "offices the record holds as custodian of or responsible for this subject on that date. A suggestion: "
                 + "nothing was set, and a member chooses the addressee."
               : "the record holds no custodian_of or responsible_for line to this subject on that date. That is a "
                 + "statement about the lines held and about nothing else." };
  }

  /* R66, R67: the visible actions, each with its document, in id order (the sources read the group's own acts). */
  #visibleActions(viewer) {
    if (viewer === null || viewer === undefined || viewer === "") return [];
    const gate = viewerPredicate(viewer);
    return this.#rows(`SELECT b.bundle_id FROM bundles b WHERE b.object_type='action' AND (${gate.sql}) ORDER BY b.bundle_id`,
      ...gate.args).map((r) => ({ id: r.bundle_id, fm: this.#heldFm(r.bundle_id) || {} }));
  }
  static #inWindow(day, from, to) {
    const d = String(day ?? "").slice(0, 10);
    if (!isCalendarDate(d)) return false;
    if (from && d < String(from).slice(0, 10)) return false;
    if (to && d > String(to).slice(0, 10)) return false;
    return true;
  }

  /** R66 (EVENTS 2a; K1494): "what we did", for `events.timeline`: the group's own acts (each correspondence entry and
   *  each move) on the actions the viewer may see whose office entity, `proceeding` or a leg's target is in `set`, each
   *  `{at, label, ref, kind}` at the entry's own date, within `from`–`to`, at most `limit`. No viewer: nothing (R36).
   *  (T45; S1 §D 9; v0.2 rule 15) For every caller it never answers a confidential action (R87), an action of a counsel
   *  matter (`project-roster.projectScope`, its R23), an action never sent (plan deliberation), nor a move before the
   *  action's first sending; no item carries a contact, speaker, press holder, promise, pressure note or hold. Under
   *  `audience: "public"` it answers the group's outward acts only (its sent entries and its moves from the first
   *  sending; J1 9), each marked `public: true` (case-authoring R57). */
  eventSource({ set = null, from = null, to = null, limit = null, viewer = null, audience = null } = {}) {
    const ids = new Set((Array.isArray(set) ? set : typeof set === "string" ? set.split(",") : []).map((x) => String(x).trim()).filter(Boolean));
    const max = clampLimit(limit, 100, 500);
    const pub = audience === "public";
    const items = [];
    if (!ids.size) return items;
    for (const { id, fm } of this.#visibleActions(viewer)) {
      const office = counterpartyOffice(fm.counterparty);
      const ends = [office && office.entity_id, typeof fm.proceeding === "string" ? fm.proceeding : null,
                    ...(Array.isArray(fm.action_basis) ? fm.action_basis : []).map((l) => (l && typeof l.target === "string" ? l.target : null))];
      if (!ends.some((x) => x && ids.has(x))) continue;
      const ledger = Array.isArray(fm.correspondence) ? fm.correspondence : [];
      const firstSent = ledger.filter((e) => e && typeof e === "object" && e.direction === "sent")
        .map((e) => String(e.at ?? "").slice(0, 10)).filter(isCalendarDate).sort()[0];
      if (!firstSent || this.#confidential(id) || this.#counselMatter(id)) continue;
      ledger.forEach((e, ord) => {
        if (!e || typeof e !== "object" || !Actions.#inWindow(e.at, from, to)) return;
        if (pub && e.direction !== "sent") return;
        items.push({ at: String(e.at).slice(0, 10), kind: `correspondence_${e.direction}`, ref: `${id}#correspondence/${ord}`,
                     label: `${e.direction === "sent" ? "we sent" : e.direction === "received" ? "we received" : "no response recorded"}`
                       + ` (${counterpartyName(fm.counterparty) ?? "addressee undetermined"})`, ...(pub ? { public: true } : {}) });
      });
      (Array.isArray(fm.state_history) ? fm.state_history : []).forEach((h, i) => {
        if (!h || typeof h !== "object" || !Actions.#inWindow(h.timestamp, from, to)) return;
        if (String(h.timestamp).slice(0, 10) < firstSent) return;
        items.push({ at: String(h.timestamp), kind: "move", ref: `${id}#move/${i}`,
                     label: `we moved the action from ${h.from_state} to ${h.to_state}`, ...(pub ? { public: true } : {}) });
      });
    }
    items.sort((p, q) => (String(p.at) < String(q.at) ? -1 : String(p.at) > String(q.at) ? 1 : p.ref < q.ref ? -1 : 1));
    return items.slice(0, max);
  }
  /* R66 (T45; reconciliation R8): whether the action's project (record-core R34) is a counsel matter (project-roster
     R23). A project that cannot be read is read as one, so nothing of a counsel matter is answered by chance. */
  #counselMatter(id) {
    try {
      const project = this.record.bundleInfo(id)?.project ?? null;
      if (!project) return false;
      const roster = this.projectRoster;
      if (!roster || typeof roster.projectScope !== "function") return false;
      return roster.projectScope(project).scope === "counsel_matter";
    } catch { return true; }
  }

  /** R67 (K1466; duties R16): the items that trigger a body's response duty: each `sent` correspondence entry of an
   *  action of the duty's trigger kinds (`trigger.action_kinds`, else `records_request`) addressed to the duty's obligor
   *  office, `{ref, date, label}`, within `from`–`to`. An action the viewer may not see contributes nothing. */
  triggerSource({ duty = null, from = null, to = null, viewer = null } = {}) {
    const obligor = duty && typeof duty.obligor === "string" ? duty.obligor : null;
    if (!obligor) return [];
    const t = duty.trigger && typeof duty.trigger === "object" ? duty.trigger : {};
    const kinds = Array.isArray(t.action_kinds) && t.action_kinds.length ? t.action_kinds
      : typeof t.action_kind === "string" ? [t.action_kind] : ["records_request"];
    const out = [];
    for (const { id, fm } of this.#visibleActions(viewer)) {
      const office = counterpartyOffice(fm.counterparty);
      if (!kinds.includes(fm.action_kind) || !office || office.entity_id !== obligor) continue;
      (Array.isArray(fm.correspondence) ? fm.correspondence : []).forEach((e, ord) => {
        if (!e || e.direction !== "sent" || !Actions.#inWindow(e.at, from, to)) return;
        out.push({ ref: `${id}#correspondence/${ord}`, date: String(e.at).slice(0, 10),
                   label: `the group's ${fm.action_kind} sent to ${counterpartyName(fm.counterparty)}` });
      });
    }
    return out;
  }

  /* ================================================================ T45: receipt, scope, promises, open items, listeners */

  /** R95 (T45; Actions D21; v0.2 rule 16): `registerResponseListener(module, fn)`, one registration per module (K31's
   *  pattern, `membership.listenerRefusal`). After a `received` entry is promoted by `actionCorrespond`, each `fn({action,
   *  ord, project, recorder, at})` is called once, after the write's transaction. */
  registerResponseListener(module, fn) {
    const refused = listenerRefusal(this.#responseListeners, module, fn, { slot: "response_listener" });
    if (refused) return refused;
    this.#responseListeners.push({ module, fn });
    return { ok: true, module };
  }
  /* R95: a listener that throws is logged and never undoes or refuses the entry; a Promise's rejection likewise. */
  #tellResponse({ action, ord, recorder, at }) {
    if (!this.#responseListeners.length) return;
    let project = null;
    try { project = this.record.bundleInfo(action)?.project ?? null; } catch { project = null; }
    for (const l of this.#responseListeners) {
      try {
        const r = l.fn({ action, ord, project, recorder, at });
        if (r && typeof r.then === "function") r.then(null, (e) => Actions.#logListener(l.module, e));
      } catch (e) { Actions.#logListener(l.module, e); }
    }
  }
  static #logListener(module, e) {
    try { console.error(`actions: response listener of ${module} threw: ${String(e && e.message || e).slice(0, 200)}`); } catch { /* the entry stands */ }
  }

  /** R80 (T45; S1 §C 9; v0.2 rule 6): a member records that the `sent` entry at `ord` was received by the addressee
   *  (`receipt`) or that a party was served (`service`), how and when, held as a capture or her account (R34's rule).
   *  Its own table, appended; the ledger entry is never rewritten. `action-clocks` R2 reads it as the start of a count
   *  from receipt or service. */
  actionReceipt({ target, ord = null, kind = "receipt", at = "", how = "", party = "", artifactSha = "", account = "",
                  viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    if (!who || isMachineIdentity(who))
      return withRow({ ok: false, reason: "MACHINE_CANNOT_CORRESPOND", target: target ?? null,
               detail: "a receipt is a named member's record that the group's sending reached its addressee. A machine "
                     + "credential may not record one. Sign in as a member." });
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const when = String(at ?? "").trim();
    const m = LOCAL_DT_RE.exec(when);
    if (!(isCalendarDate(when) || (m && isCalendarDate(m[1]))))
      return withRow({ ok: false, reason: "BAD_DATE", at: when, target,
               detail: "a receipt is dated YYYY-MM-DD, or YYYY-MM-DDTHH:MM in the office's local time, a day the calendar has" });
    const sha = String(artifactSha ?? "").trim().replace(/^sha256:/, "").toLowerCase();
    const acct = String(account ?? "").trim();
    if (sha && acct) return withRow({ ok: false, reason: "CAPTURE_AND_TESTIMONY", target,
      detail: "a receipt is held as the captured bytes OR a named member's account, never both." });
    if (!sha && !acct) return withRow({ ok: false, reason: "NEITHER_CAPTURE_NOR_TESTIMONY", target,
      detail: "a receipt is held as captured bytes the register holds, or as a named member's account." });
    if (sha && !/^[0-9a-f]{64}$/.test(sha)) return { ok: false, reason: "BAD_SHA", target, detail: "artifact_sha is a sha256 hash (64 hex characters)" };
    const k = String(kind ?? "").trim() || "receipt";
    const h = String(how ?? "").trim(), pty = String(party ?? "").trim();
    for (const [name, v, need] of [["how", h, true], ["party", pty, k === "service"], ["account", acct, false]])
      if ((need && !v) || v.length > (name === "account" ? NOTE_MAX : RECEIPT_TEXT_MAX))
        return { ok: false, reason: `BAD_${name.toUpperCase()}`, target,
                 detail: `${name} is ${need ? "1" : "0"} to ${name === "account" ? NOTE_MAX : RECEIPT_TEXT_MAX} characters` };
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action") return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const ledger = (this.#heldFm(target) || {}).correspondence;
    const n = typeof ord === "number" ? ord : /^\d+$/.test(String(ord ?? "").trim()) ? Number(String(ord).trim()) : NaN;
    const entry = Array.isArray(ledger) && Number.isInteger(n) ? ledger[n] : undefined;
    /* DEC-49 REGION is-receipt-on-sent */
    if (!entry || typeof entry !== "object" || entry.direction !== "sent" || !RECEIPT_KINDS.includes(k))
      return refuse("RECEIPT_NOT_ON_SENT", `a receipt is recorded on a sent entry of this action, as ${RECEIPT_KINDS.join(" or ")}; `
        + "the entry named is not a sent one. Nothing was written.", { target, ord: ord ?? null, legal: [...RECEIPT_KINDS] });
    /* END DEC-49 REGION is-receipt-on-sent */
    if (sha && !this.#one(`SELECT capture_sha FROM register WHERE capture_sha=?`, sha))
      return withRow({ ok: false, reason: "UNREGISTERED_ARTIFACT", target, artifact_sha: sha,
               detail: "this hash names no capture in this store. Capture it first, or record a named account instead." });
    const recorded = stampInstant("second", this.#nowMs(null));
    const seq = this.record.transact(() => {
      const next = this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM action_receipts WHERE bundle_id=? AND ord=?`, target, n).n;
      this.sql.exec(`INSERT INTO action_receipts (bundle_id, ord, seq, kind, at, how, party, artifact_sha, account, author,
        recorded_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, target, n, next, k, when, h, pty || null, sha || null, acct || null,
        who, recorded);
      return next;
    });
    return { ok: true, target, ord: n, seq, kind: k, at: when, how: h, ...(pty ? { party: pty } : {}),
             held_as: sha ? "capture" : "testimony", ...(sha ? { artifact_sha: sha } : { account: acct }),
             author: who, recorded_at: recorded, weight: "single" };
  }
  /* R80, R25 (K2845): every receipt record, oldest first, so an entry's latest is its last. */
  #receiptsOf(id) {
    return this.#rows(`SELECT ord, seq, kind, at, how, party, artifact_sha, account, author, recorded_at
      FROM action_receipts WHERE bundle_id=? ORDER BY recorded_at, ord, seq`, id)
      .map((r) => ({ ord: r.ord, seq: r.seq, kind: r.kind, at: r.at, how: r.how, ...(r.party !== null ? { party: r.party } : {}),
        held_as: r.artifact_sha ? "capture" : "testimony", ...(r.artifact_sha ? { artifact_sha: r.artifact_sha } : { account: r.account }),
        by: r.author, recorded_at: r.recorded_at }));
  }

  /** R87 (T45; Actions D4; v0.2 rule 15): a member sets (`true`) or removes (`false`) the action's confidential scope,
   *  with a reason, each statement appended. A confidential action is seen inside the group as before and never answered
   *  by R66 or anything that feeds published output; the change never touches a signed edition (`publication` R63). */
  actionScope({ target, confidential = null, reason = "", viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    const why = String(reason ?? "").trim();
    /* DEC-49 REGION is-scope */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_SET_SCOPE", "whether an action is confidential is a member's act; a machine credential "
        + "may not set or remove it. Nothing was written.", { target: target ?? null });
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const want = confidential === true || confidential === "true" ? 1 : confidential === false || confidential === "false" ? 0 : null;
    if (want === null) return { ok: false, reason: "BAD_SCOPE", target, legal: [true, false],
                                detail: "confidential is true (set the scope) or false (remove it)" };
    if (!why) return refuse("SCOPE_NO_REASON", "setting or removing an action's confidential scope carries the member's "
      + "reason. Nothing was written.", { target });
    if (why.length > NOTE_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON", target, detail: `reason is at most ${NOTE_MAX} characters with no quote, backslash or line break` };
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action") return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    if (this.#confidential(target) === !!want)
      return refuse("SCOPE_UNCHANGED", `this action is already ${want ? "confidential" : "not confidential"}; nothing was `
        + "written.", { target, confidential: !!want });
    /* END DEC-49 REGION is-scope */
    const at = stampInstant("second", this.#nowMs(null));
    this.record.transact(() => {
      const seq = this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM action_scopes WHERE bundle_id=?`, target).n;
      this.sql.exec(`INSERT INTO action_scopes (bundle_id, seq, confidential, reason, by, at) VALUES (?,?,?,?,?,?)`,
        target, seq, want, why, who, at);
    });
    return { ok: true, target, confidential: !!want, reason: why, by: who, at, scope: this.#scopeOf(target),
             published: T45_SENTENCES.scope_published_stays, weight: "single" };
  }
  /* R87, R66: whether the action's latest scope statement is confidential. */
  #confidential(id) {
    const r = this.#one(`SELECT confidential FROM action_scopes WHERE bundle_id=? ORDER BY seq DESC LIMIT 1`, id);
    return !!(r && r.confidential);
  }
  /* R87, R25: the scope and its statements, oldest first. */
  #scopeOf(id) {
    const statements = this.#rows(`SELECT seq, confidential, reason, by, at FROM action_scopes WHERE bundle_id=? ORDER BY seq`, id)
      .map((r) => ({ seq: r.seq, confidential: !!r.confidential, reason: r.reason, by: r.by, at: r.at }));
    return { confidential: statements.length ? statements[statements.length - 1].confidential : false, statements };
  }

  /** R88 (T45; Actions D4; v0.2 rule 15): a member records a promise the group made to a person (`PROMISE_KINDS`), or
   *  one ending an earlier promise (`ends`, its position, with `text` its reason). Appended, never edited; every viewer
   *  who may see the action reads every promise; nothing published carries one (R66). */
  actionPromise({ target, kind = "", text = "", ends = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    const k = String(kind ?? "").trim(), t = String(text ?? "").trim();
    const endsAt = ends === null || ends === undefined || ends === "" ? null
      : Number.isInteger(ends) ? ends : /^\d+$/.test(String(ends).trim()) ? Number(String(ends).trim()) : NaN;
    const kinds = PROMISE_KINDS;
    const promiseRefused = (why) => refuse("PROMISE_REFUSED", `${why} Nothing was written.`,
      { target: target ?? null, legal: [...kinds], max: PROMISE_TEXT_MAX });
    /* DEC-49 REGION is-promise */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_RECORD_PROMISE", "a promise the group made to a person is recorded by a member; a "
        + "machine credential may not record one. Nothing was written.", { target: target ?? null });
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    if (!kinds.includes(k) || !t || t.length > PROMISE_TEXT_MAX || Number.isNaN(endsAt))
      return promiseRefused(`a promise is {kind, text, ends?}: kind one of ${kinds.join(", ")}, the text 1 to `
        + `${PROMISE_TEXT_MAX} characters, and ends the position of an earlier promise it ends.`);
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action") return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    if (endsAt !== null && !this.#promisesOf(target).standing.some((p) => p.seq === endsAt))
      return promiseRefused(`ends names promise ${endsAt}, and no promise standing on this action is at that position.`);
    /* END DEC-49 REGION is-promise */
    const at = stampInstant("second", this.#nowMs(null));
    const seq = this.record.transact(() => {
      const next = this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM action_promises WHERE bundle_id=?`, target).n;
      this.sql.exec(`INSERT INTO action_promises (bundle_id, seq, kind, text, ends, by, at) VALUES (?,?,?,?,?,?,?)`,
        target, next, k, t, endsAt, who, at);
      return next;
    });
    return { ok: true, target, seq, kind: k, text: t, ...(endsAt !== null ? { ends: endsAt } : {}), by: who, at,
             promises: this.#promisesOf(target), weight: "single" };
  }
  /* R88, R25: every promise on the action, standing apart from ended (one a later statement ends). */
  #promisesOf(id) {
    const all = this.#rows(`SELECT seq, kind, text, ends, by, at FROM action_promises WHERE bundle_id=? ORDER BY seq`, id)
      .map((r) => ({ seq: r.seq, kind: r.kind, text: r.text, ...(r.ends !== null ? { ends: r.ends } : {}), by: r.by, at: r.at }));
    const ended = new Map(all.filter((p) => p.ends !== undefined).map((p) => [p.ends, p]));
    const notes = all.filter((p) => p.ends === undefined);
    return { standing: notes.filter((p) => !ended.has(p.seq)),
             ended: notes.filter((p) => ended.has(p.seq)).map((p) => ({ ...p, ended_by: ended.get(p.seq) })) };
  }

  /** R92 (T45; N892 (a); Actions D28a; v0.2 rule 21): the group's open actions the viewer may see addressed to the same
   *  office as `counterparty` (an addressee, or its JSON) or as `action`'s addressee: equal `entity_id`, else equal role
   *  and body. Each with its kind, state, first sent date and whether its reply is overdue (R12), and the count of
   *  overdue replies. Facts, never a block: no act is refused on it. */
  openItemsWith({ counterparty = null, action = null, viewer = null } = {}) {
    let cp = counterparty;
    if (typeof cp === "string") { try { cp = JSON.parse(cp); } catch { cp = null; } }
    let self = null;
    if (!cp && action) {
      const b = this.#visibleAction(String(action), viewer);
      if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: action };
      if (normalizeType(b.object_type) !== "action") return { ok: false, reason: "NOT_AN_ACTION", target: action };
      self = String(action);
      cp = (this.#heldFm(self) || {}).counterparty ?? null;
    }
    if (!cp && !action) return { ok: false, reason: "NO_TARGET", detail: "pass counterparty=<an addressee> or action=<action id>" };
    const office = counterpartyOffice(cp);
    if (!office || office.legacy)
      return { ok: true, items: [], overdue_replies: 0, truncated: false, ...T45_SENTENCES.openitems_not_office };
    const now = this.#nowMs(null), place = this.place();
    const items = [];
    let truncated = false;
    for (const { id, fm } of this.#visibleActions(viewer)) {
      if (id === self || !Actions.#sameOffice(office, counterpartyOffice(fm.counterparty))) continue;
      const st = this.#one(`SELECT current_state FROM bundles WHERE bundle_id=?`, id);
      const state = st ? st.current_state : fm.current_state ?? null;
      if (state === "resolved" || state === "abandoned") continue;
      if (items.length === OPEN_ITEMS_MAX) { truncated = true; break; }
      const sent = (Array.isArray(fm.correspondence) ? fm.correspondence : []).find((e) => e && e.direction === "sent");
      items.push({ action: id, kind: fm.action_kind ?? null, state, first_sent: sent ? String(sent.at).slice(0, 10) : null,
                   clock_overdue: actionOverdue(fm, now, place) });
    }
    return { ok: true, office: { role: office.role, body: office.body, entity_id: office.entity_id ?? null }, items,
             overdue_replies: items.filter((x) => x.clock_overdue === true).length, truncated, limit: OPEN_ITEMS_MAX,
             says: "the group's open actions with this office, shown as facts. Nothing is refused because of them." };
  }
  /* R92: R9's office equality: equal entity ids where both state one, else equal role and body. */
  static #sameOffice(a, b) {
    if (!a || !b || b.legacy) return false;
    if (a.entity_id && b.entity_id) return a.entity_id === b.entity_id;
    return !!a.role && !!a.body && a.role === b.role && a.body === b.body;
  }

  /** R97 (T45; consequences R19): of `ids`, those that are an action bundle of this instance or the capture of one of its
   *  `sent` entries, whatever the viewer; it names nothing back but what it was given, and throws only when it cannot read. */
  ownActIds({ ids = [] } = {}) {
    const asked = [...new Set((Array.isArray(ids) ? ids : []).filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()))];
    return asked.filter((x) => this.#one(`SELECT 1 AS y FROM bundles WHERE bundle_id=? AND object_type='action'`, x)
      || this.#one(`SELECT 1 AS y FROM correspondence WHERE direction='sent' AND artifact_sha=?`,
                   x.replace(/^sha256:/, "").toLowerCase()));
  }
  /** R97 (T45; standards R53): whether `captureSha` is the capture of one of this instance's `sent` entries; throws only
   *  when it cannot read (standards then reads the capture as the group's own). */
  ownSending({ captureSha = null } = {}) {
    const sha = typeof captureSha === "string" ? captureSha.trim().replace(/^sha256:/, "").toLowerCase() : "";
    if (!sha) return false;
    return !!this.#one(`SELECT 1 AS y FROM correspondence WHERE direction='sent' AND artifact_sha=?`, sha);
  }

  /* ================================================================ proposals (R19, R28) */

  /** R28 (REC-215): a proposed tier, stored apart, labelled; it never touches `risk_tier` or its history. */
  actionRiskPropose({ target, tier = null, basis = null, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who) return { ok: false, reason: "NO_AUTHOR", detail: "this call carries nobody: the proposer is stamped from the credential that asked." };
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const asked = typeof tier === "string" && /^[123]$/.test(tier.trim()) ? Number(tier.trim()) : tier;
    if (asked !== 1 && asked !== 2 && asked !== 3) return this.#badRiskTier(target, tier, "a proposal");
    const why = typeof basis === "string" ? basis.trim() : "";
    /* DEC-49 REGION is-risk-propose-basis */
    if (!why || why.length > RISK_PROPOSAL_BASIS_MAX || /["\\\r\n]/.test(why))
      return refuse("RISK_PROPOSAL_BASIS_REFUSED", `a proposed tier carries its basis: 1 to ${RISK_PROPOSAL_BASIS_MAX} `
        + "characters with no quote, backslash or line break", { target, max: RISK_PROPOSAL_BASIS_MAX });
    /* END DEC-49 REGION is-risk-propose-basis */
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const at = stampInstant("second", this.#nowMs(null));
    this.sql.exec(`INSERT INTO action_risk_proposals (bundle_id, proposed_by, tier, basis, proposed_at) VALUES (?,?,?,?,?)
      ON CONFLICT(bundle_id, proposed_by) DO UPDATE SET tier=excluded.tier, basis=excluded.basis, proposed_at=excluded.proposed_at`,
      target, who, asked, why, at);
    const held = riskTierState((this.#heldFm(target) || {}).risk_tier);
    return { ok: true, target, weight: "single", evidence: false,
             proposal: { ...proposalLabelFor(who, "risk_tier"), tier: asked, tier_words: RISK_TIERS[asked], basis: why, at },
             risk_tier: held, risk_tier_words: RISK_TIERS[held] ?? null,
             says: `a tier of ${asked} is proposed for this action. This is not the action's risk tier and did not change `
                 + `it: the tier is ${held === "undetermined" ? "undetermined" : held}, and only a member's own act sets it.` };
  }

  /** R73 (K2561; R70): a proposal of what a records request seeks, as R19 is to `actionLaws`: stored apart, labelled,
   *  replacing only its proposer's own standing proposal; it writes no file and never changes `seeks`. Its items are
   *  judged as R70 judges a statement (`SEEKS_REFUSED`, C-117.29, every finding carried), on the target's own kind. */
  actionSeeksPropose({ target, seeks = null, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who) return { ok: false, reason: "NO_AUTHOR", detail: "this call carries nobody: the proposer is stamped from the credential that asked." };
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const held = this.#heldFm(target) || {};
    let list = seeks;
    if (typeof list === "string") { try { list = JSON.parse(list); } catch { /* judged as given: not a list */ } }
    const asked = { action_kind: held.action_kind, seeks: list === undefined || list === null ? [] : list };
    const r = this.#seeksRefusal(asked);
    if (r) return { ...r, target };
    const items = seeksOf(asked);
    const at = stampInstant("second", this.#nowMs(null));
    this.record.transact(() => {
      this.sql.exec(`DELETE FROM action_seeks_proposals WHERE bundle_id=? AND proposed_by=?`, target, who);
      items.forEach((x, i) => this.sql.exec(`INSERT INTO action_seeks_proposals (bundle_id, proposed_by, ord, progression,
        entity, stage, proposed_at) VALUES (?,?,?,?,?,?,?)`, target, who, i, x.progression, x.entity, x.stage, at));
    });
    const stated = seeksOf(held);
    return { ok: true, target, weight: "single", evidence: false,
             proposal: { ...proposalLabelFor(who, "seeks"), at, seeks: items },
             seeks: stated,
             says: `${items.length} stage${items.length === 1 ? " is" : "s are"} proposed as what this request seeks. This `
                 + `is not the action's seeks and did not change it: ${stated.length ? `it names ${stated.length} stage(s) a `
                 + "member stated" : "no member has stated what it seeks"}, and only a member's own write states it.` };
  }

  /* R73: the standing proposals of what the request seeks, newest first, at most 12, with `truncated` and a sentence. */
  #seeksProposalsFor(id) {
    const cap = SEEKS_PROPOSALS_READ_MAX;
    const rows = this.#rows(`SELECT proposed_by, ord, progression, entity, stage, proposed_at FROM action_seeks_proposals
      WHERE bundle_id=? ORDER BY proposed_at DESC, proposed_by, ord LIMIT ?`, id, (cap + 1) * SEEKS_MAX + 1);
    const by = new Map();
    for (const r of rows) {
      if (!by.has(r.proposed_by)) by.set(r.proposed_by, { ...proposalLabelFor(r.proposed_by, "seeks"), at: r.proposed_at, seeks: [] });
      by.get(r.proposed_by).seeks.push({ progression: r.progression, entity: r.entity, stage: r.stage });
    }
    const all = [...by.values()];
    const proposals = all.slice(0, cap);
    return { proposals, limit: cap, truncated: all.length > cap,
             says: proposals.length
               ? `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} of what this request seeks. A proposal is `
                 + "not the action's seeks: that is a member's own statement, shown beside this one."
               : "no proposal of what this request seeks stands in the record. That is a statement about proposals and "
                 + "about nothing else." };
  }

  /* R28: the standing tier proposals, newest first, at most 12, with `truncated` and a sentence also when empty. */
  #riskProposalsFor(id) {
    const cap = RISK_PROPOSALS_READ_MAX;
    const rows = this.#rows(`SELECT proposed_by, tier, basis, proposed_at FROM action_risk_proposals WHERE bundle_id=?
      ORDER BY proposed_at DESC, proposed_by LIMIT ?`, id, cap + 1);
    const proposals = rows.slice(0, cap).map((r) => ({ ...proposalLabelFor(r.proposed_by, "risk_tier"), tier: r.tier,
      tier_words: RISK_TIERS[r.tier] ?? null, basis: r.basis, at: r.proposed_at }));
    return { proposals, limit: cap, truncated: rows.length > cap,
             says: proposals.length
               ? `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} of this action's risk tier. A proposal is `
                 + "not the tier: the tier is the member's own act, stated beside this one."
               : "no proposal of this action's risk tier stands in the record. That is a statement about proposals and "
                 + "about nothing else." };
  }

  #lawProposalsFor(bundleId) {
    const cap = LAW_PROPOSALS_READ_MAX;
    const rowCap = (cap + 1) * GOVERNING_LAWS_MAX;
    const rows = this.#rows(
      `SELECT proposed_by, ord, level, citation, standard, proposed_at FROM action_law_proposals
        WHERE bundle_id=? ORDER BY proposed_at DESC, proposed_by, ord LIMIT ?`, bundleId, rowCap + 1);
    const byProposer = new Map();
    for (const r of rows) {
      if (!byProposer.has(r.proposed_by))
        byProposer.set(r.proposed_by, { ...lawProposalLabel(r.proposed_by), at: r.proposed_at, laws: [] });
      byProposer.get(r.proposed_by).laws.push({ level: r.level, citation: r.citation, ...(r.standard ? { standard: r.standard } : {}) });
    }
    const all = [...byProposer.values()];
    const proposals = all.slice(0, cap);
    const machine = proposals.filter((p) => p.machine_work).length;
    return {
      proposals, limit: cap, truncated: all.length > cap,
      says: proposals.length
        ? `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} of the laws that govern this `
          + `action, ${machine} of them machine work. A proposal is not this action's list of governing laws `
          + `and nothing here states which laws apply: the list is the member's own act, and it is stated `
          + `beside this one.`
        : "no proposal of the laws governing this action stands in the record. That is a statement about "
          + "proposals and about nothing else: whether any law governs this request is answered beside this, "
          + "and a member states it.",
    };
  }
}

/* The acts answer their catalogue-backed refusals with code, check and translation (the Provides' "Terms"). */
for (const m of ["actionMove", "actionCorrespond", "actionLaws", "actionLawsPropose", "actionRiskTier", "actionQuotes",
                 "actionReceipt", "actionScope", "actionPromise",
                 "actionRiskPropose", "actionSeeksPropose", "actionCreate", "check"]) {
  const fn = Actions.prototype[m];
  Actions.prototype[m] = function (...a) { return withRow(fn.apply(this, a)); };
}

/* R19, R28: the label of a proposal stored apart. The governing-laws sentence is action-grammar's `lawProposalLabel`
   (REC-195); the tier's says, in each state, what the proposal is not. (The clock entry's moved to `action-clocks` with
   R32, K617.) */
const PROPOSAL_SAYS = {
  risk_tier: {
    machine_proposed: "a machine credential proposed this risk tier. That is machine work, labelled as machine work: it "
      + "can set a tier beside the action for members to weigh and it can never set the tier. Nothing here is this "
      + "action's risk tier, and nothing becomes it until a member states it themselves",
    member_proposed: "a member proposed this risk tier to whoever states it. It is a proposal and not the tier: only the "
      + "risk-tier act sets that, and the record holds who made the proposal",
    unstated: "the record does not say who proposed this risk tier",
  },
  seeks: {
    machine_proposed: "a machine credential proposed what this records request seeks. That is machine work, labelled as "
      + "machine work: it sets stages beside the action for members to weigh and never states what it seeks; nothing "
      + "becomes it until a member states it themselves",
    member_proposed: "a member proposed what this records request seeks to whoever states it. It is a proposal and not "
      + "the action's seeks: only a member's own write states that, and the record holds who made the proposal",
    unstated: "the record does not say who proposed what this records request seeks",
  },
};
function proposalLabelFor(who, subject) {
  const base = lawProposalLabel(who);
  return { by: base.by, state: base.state, machine_work: base.machine_work, says: PROPOSAL_SAYS[subject][base.state] };
}

const instances = new WeakMap();

/** K61: the one instance per host; at creation it declares its tables, registers its step, audit, facts and
 *  decoration (R3, R12, R25, R36, R51; retrieval R53, R56), its litigation-hold reader (R55; doorbell R3), its reader of
 *  holds over a project (R69; ratification R45) and its none-exists reader (R71; intent R33). */
export function actionsOf(host, deps) {
  let a = instances.get(host);
  if (!a) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    a = new Actions({ ...d, host, storage, record, membership, promotion });
    instances.set(host, a);
    a.migrate();
    void a.conformance;   /* R8: conformance joins the host before this module's step runs (K252) */
    record.declarePurge("actions", [...ACTIONS_TABLES]);
    promotion.registerStep("actions", { check: (c) => a.check(c), project: (c) => a.project(c) });
    record.registerAuditCheck("actions", (image) => a.audit(image));
    const retrieval = d.retrieval === null ? null : a.retrieval;
    if (retrieval) {
      retrieval.registerActionFacts("actions", (md, nowMs) => actionFacts(md, nowMs, a.place()));
      retrieval.registerProjectionDecoration("actions", (row, { nowMs, viewer } = {}) =>
        (normalizeType(row && row.object_type) === "action" ? { action: a.derived(row, nowMs, viewer ?? null) } : {}));
    }
    /* R66, R67 (T33-73): the "what we did" source with events and the trigger source with duties, once per host; a
       registration either refuses (this module's already held) leaves the earlier one standing. A host on which either
       cannot be created registers nothing there. */
    const events = d.events === null ? null : a.events;
    if (events && typeof events.registerEventSource === "function")
      events.registerEventSource("actions", (args) => a.eventSource(args || {}));
    const duties = d.duties === null ? null : a.duties;
    if (duties && typeof duties.registerTriggerSource === "function")
      duties.registerTriggerSource("actions", (args) => a.triggerSource(args || {}));
    /* R97 (T45; consequences R19, standards R53): once per host, the reader of the group's own acts and the check of its
       own sendings, each reached as ratification is (the composition root's environment, or given), so this module never
       makes either before its composer does. A registration either refuses (this module's already held) leaves the
       earlier one standing; a host on which either cannot be created registers nothing there. */
    const consequences = d.consequences === null || !(d.consequences || d.env) ? null : a.consequences;
    if (consequences && typeof consequences.registerOwnActReader === "function")
      consequences.registerOwnActReader((args) => a.ownActIds(args || {}));
    const standards = d.standards === null || !(d.standards || d.env) ? null : a.standards;
    if (standards && typeof standards.registerOwnSendingCheck === "function")
      standards.registerOwnSendingCheck("actions", (args) => a.ownSending(args || {}));
    /* R71 (intent R33; K2505): once per host, the reader of records requests answered that no such record exists,
       reached as ratification is (the composition root's environment, or given); a reader already held
       (`NONE_EXISTS_READER_DECLARED`) stands. */
    let intent = null;
    if (d.intent !== null && (d.intent || d.env)) {
      try { intent = d.intent || intentOf(host); } catch { intent = null; }
    }
    if (intent && typeof intent.registerNoneExistsReader === "function")
      intent.registerNoneExistsReader((args) => a.noneExistsFor(args || {}));
  }
  return a;
}

/** Which purge declaration names one of this module's tables (record-core R21). */
export function actionsOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return ACTIONS_TABLES.includes(name);
}

/** The module's ops (K3), as entries of the plane's one route map (plane R5: `routes` spreads them in, and
 *  control-plane's `dispatch` answers every store request over it). `viewer`, `author` and `proposer` are the control
 *  plane's stamps, read from the query, so a caller's own copy never wins. */
export function actionsOps(a, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    actionmove: () => a.actionMove({ target: q("target"), to: q("to"), reason: q("reason"), resolution: q("resolution"),
                                     viewer: q("viewer"), author: q("author") }),
    actionlaws: () => a.actionLaws({ target: q("target") || b.target, laws: b.laws, viewer: q("viewer"), author: q("author") }),
    actionrisktier: () => a.actionRiskTier({ target: q("target") || b.target, tier: q("tier") ?? b.tier ?? null,
                                             reason: q("reason") ?? b.reason ?? null, viewer: q("viewer"), author: q("author") }),
    actionlawspropose: () => a.actionLawsPropose({ target: q("target") || b.target, laws: b.laws, viewer: q("viewer"),
                                                   proposer: q("proposer") }),
    /* R73 (K2561): a proposal of what a records request seeks (declared and routed by L11). */
    actionseekspropose: () => a.actionSeeksPropose({ target: q("target") || b.target, seeks: b.seeks ?? q("seeks"),
                                                     viewer: q("viewer"), proposer: q("proposer") }),
    actionriskpropose: () => a.actionRiskPropose({ target: q("target") || b.target, tier: q("tier") ?? b.tier ?? null,
                                                   basis: q("basis") ?? b.basis ?? null, viewer: q("viewer"),
                                                   proposer: q("proposer") }),
    actioncorrespond: () => a.actionCorrespond({ target: q("target"), direction: q("direction"), at: q("at"),
      medium: q("medium"), party: q("party"), artifactSha: q("artifact_sha"), account: q("account"),
      quoteAmount: q("quote_amount"), quoteCurrency: q("quote_currency"), quoteBasis: q("quote_basis"),
      quoteAnswers: q("quote_answers"), quoteRevises: q("quote_revises"),
      stage: q("stage"), follows: q("follows"), outcome: q("outcome"), exemptions: q("exemptions"),
      dueBy: q("due_by"), dueCite: q("due_cite"),
      speaker: q("speaker") ?? b.speaker ?? "", officeStatus: b.office_status ?? q("office_status"),
      foundElsewhere: b.found_elsewhere ?? q("found_elsewhere"),
      pressure: b.pressure ?? (q("pressure_kind") !== null || q("pressure_note") !== null
        ? { kind: q("pressure_kind") ?? "", note: q("pressure_note") ?? "" } : null),
      viewer: q("viewer"), author: q("author") }),
    /* R47: the action's creation as a promotion, its read and its list, with the stamps the control plane makes. */
    actioncreate: () => a.actionCreate({ document: typeof b.document === "string" ? b.document : null,
                                         viewer: q("viewer"), author: q("author") }),
    action: () => a.actionRead({ id: q("id") || q("target") || b.id || null, viewer: q("viewer"), now: q("now") }),
    actions: () => a.actionsFor({ determination: q("determination"), counterparty: q("counterparty"), state: q("state"),
                                  kind: q("kind"), after: q("after"), limit: q("limit"),
                                  proceeding: q("proceeding"), basis_void: q("basis_void"), follows: q("follows"),
                                  viewer: q("viewer") }),
    /* R62: the offices the record holds as custodian of or responsible for a subject, suggested; a read. */
    addresseesuggest: () => a.addresseeSuggest({ action: q("action") || b.action || null, subject: q("subject") || b.subject || null,
                                                 viewer: q("viewer") }),
    actionquotes: () => a.actionQuotes({ counterparty: q("counterparty"), request: q("request"), answers: q("answers"),
                                         viewer: q("viewer") }),
    /* R42 (N231): the kinds this instance accepts, a read for every signed-in class (the op's spec is the control
       plane's). */
    actionkinds: () => ({ ok: true, kinds: a.kinds() }),
    /* T45: receipt or service of a sent entry (R80), the confidential scope (R87), a promise (R88), and the open items
       with an office (R92, a read), each with the stamps the control plane makes (declared by op-declarations). */
    actionreceipt: () => a.actionReceipt({ target: q("target") || b.target, ord: q("ord") ?? b.ord ?? null,
      kind: q("kind") ?? b.kind ?? "receipt", at: q("at") ?? b.at ?? "", how: q("how") ?? b.how ?? "",
      party: q("party") ?? b.party ?? "", artifactSha: q("artifact_sha") ?? b.artifact_sha ?? "",
      account: q("account") ?? b.account ?? "", viewer: q("viewer"), author: q("author") }),
    actionscope: () => a.actionScope({ target: q("target") || b.target, confidential: q("confidential") ?? b.confidential ?? null,
      reason: q("reason") ?? b.reason ?? "", viewer: q("viewer"), author: q("author") }),
    actionpromise: () => a.actionPromise({ target: q("target") || b.target, kind: q("kind") ?? b.kind ?? "",
      text: q("text") ?? b.text ?? "", ends: q("ends") ?? b.ends ?? null, viewer: q("viewer"), author: q("author") }),
    openitemswith: () => a.openItemsWith({ counterparty: b.counterparty ?? q("counterparty"), action: q("action") ?? b.action ?? null,
      viewer: q("viewer") }),
  };
}
