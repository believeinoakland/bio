/* queue-producers — the feed's producers (requirements: `build/requirements/queue-producers.md`, R1–R42).
 * Split out of `queue` by N363 (Bob's K507; seams ruled K531, `build/plan/draft-N363-queue-split.md` §1, §3.2): each
 * producer derives, on read and writing nothing, the items one provider's facts earn for a viewer, naming each item's
 * subjects and home subjects, for `queue` to home, offer, mint and publish.
 *
 *   feedItems      queue's one read of this module (R8): every item R1, R2, R4–R7, R9, R14, R23, R30–R35, R37–R39, R41, R42 derive
 *                  for a member and viewer, every item `machinery-producers.conditionItems` answers (its R1: the
 *                  CONDITIONs about our own machinery, split out by K1850) and every item `action-producers.actionItems`
 *                  answers (its R13: the Action layer's to-dos, was this module's R15–R21, R29, moved by T45, K2781 (1)),
 *                  each homed through queue's walk and carrying queue's options (both passed in),
 *                  with the facts the answer publishes beside them. No item carries `disposition` (queue's mint gives
 *                  it) or `catalogue_id` (queue stamps it from its R2).
 *   proposalFindingItems, CARDINALITY_EXCEEDED   the FINDING producer over `progressions.proposalsFeed` (R2, R10, R11),
 *                  pure, re-exported from `./proposals.mjs`.
 *
 *   registerPlaceArrivals   R38's one door: `instance-setup` registers its `placeArrivals` read here once at start (K31's
 *                  pattern), since it comes later in layer 11.
 *
 * REACHED as `queueProducersOf(ctx, deps)`: one instance per Durable Object storage. It registers nothing with an earlier
 * module and holds no check row: it refuses nothing a member does (draft §3.3); a second registration at R38's door is a
 * programming error answered to its caller.
 * `deps` (each defaults to its module's instance on the same `ctx`, reached lazily when first asked):
 *   record, membership, credentials, provenance, captureRequests, basisVersions, progressions, aiRuns, bias, publication,
 *   corpusExport, reevaluation, intent, monitoring, contradiction, docket, caseImport, wizardScripts, caseTensions,
 *   publishSchedule, projectRoster   the providers; and `machinery` (machinery-producers, K1850) and `actionProducers` (action-producers,
 *   T45), each built lazily over these same deps, so a dep a caller injects reaches them too (the moved producers' own:
 *   governor, capture, captureRequests, monitoring, linkSweep, networkNotices, actions; and actionClocks, escalation,
 *   actionPlans, actions, actionHolds, filingTemplates, localFacts, following, planWork).
 *
 * R7 (queue's homes walk) and R12 (queue's options) stay in queue, one walk and one derivation: `feedItems` takes them
 * as `homesOf(subjectIds)` and `optionsOf(subjectIds)`, closed over the read's viewer and identity by queue, and holds
 * them for the length of that one synchronous read. `#homesAt` (a case at depth 0) is built over `homesOf`, and both are
 * handed on to `machinery-producers.conditionItems` and `action-producers.actionItems` as they were handed here.
 */

import { normalizeType } from "../record-grammar/types.mjs";
import { STATES, vocabFor } from "../record-grammar/document.mjs";
import { MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX } from "../record-grammar/actors.mjs";
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, hiddenBundles, GATE_MARK } from "../membership/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { captureRequestsOf } from "../capture-requests/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { progressionsOf } from "../progressions/index.mjs";
import { aiRunsOf } from "../ai-runs/index.mjs";
import { biasOf } from "../bias/index.mjs";
import { contradictionOf } from "../contradiction/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { caseTensionsOf } from "../case-tensions/index.mjs";
import { publishScheduleOf } from "../publish-schedule/index.mjs";
import { corpusExportOf, EXPORT_LOG_LIMIT_DEFAULT } from "../corpus-export/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { intentOf } from "../intent/index.mjs";
import { monitoringOf } from "../monitoring/index.mjs";
import { isCalendarDate } from "../civil-time/index.mjs";
import { docketOf, DOCKET_UNREADABLE } from "../docket/index.mjs";
import { caseImportOf } from "../case-import/index.mjs";
import { wizardScriptsOf } from "../wizard-scripts/index.mjs";
import { machineryProducersOf, MachineryProducers } from "../machinery-producers/index.mjs";
import { actionProducersOf } from "../action-producers/index.mjs";
import { projectRosterOf } from "../project-roster/index.mjs";
import { word, localize } from "../setup-words/index.mjs";
import { proposalFindingItems } from "./proposals.mjs";

export { proposalFindingItems, CARDINALITY_EXCEEDED } from "./proposals.mjs";

/* The walk queue passes in answers this shape; with none passed, an item is ungrouped rather than given a home. */
const UNGROUPED = Object.freeze({ state: "determined", ungrouped: true, reasons: [], depth_bound: null, ancestors: [] });

export class QueueProducers {
  #host; #deps;
  /* The read's two functions from queue (R8), held for one synchronous `feedItems` call and cleared after it. */
  #homesFn = null; #optionsFn = null;
  constructor({ host, storage, deps = {} } = {}) {
    this.#host = host;
    this.sql = storage.sql;
    this.#deps = deps || {};
  }

  /* ------------------------------------------------------------------ the providers (Uses), reached lazily */
  #dep(name, make) {
    if (!(name in this.#deps) || this.#deps[name] === undefined) this.#deps[name] = make();
    return this.#deps[name];
  }
  get #record() { return this.#dep("record", () => recordOf(this.#host)); }
  get #membership() { return this.#dep("membership", () => membershipOf(this.#host)); }
  get #credentials() { return this.#dep("credentials", () => credentialsOf(this.#host)); }
  get #provenance() { return this.#dep("provenance", () => provenanceOf(this.#host)); }
  get #captureRequests() { return this.#dep("captureRequests", () => captureRequestsOf(this.#host)); }
  get #basisVersions() { return this.#dep("basisVersions", () => basisVersionsOf(this.#host)); }
  get #progressions() { return this.#dep("progressions", () => progressionsOf(this.#host)); }
  get #aiRuns() { return this.#dep("aiRuns", () => aiRunsOf(this.#host)); }
  get #bias() { return this.#dep("bias", () => biasOf(this.#host)); }
  get #contradiction() { return this.#dep("contradiction", () => contradictionOf(this.#host)); }
  get #publication() { return this.#dep("publication", () => publicationOf(this.#host)); }
  get #reevaluation() { return this.#dep("reevaluation", () => reevaluationOf(this.#host)); }
  get #intent() { return this.#dep("intent", () => intentOf(this.#host)); }
  get #monitoring() { return this.#dep("monitoring", () => monitoringOf(this.#host)); }
  /* N483 (K1122): the export log is corpus-export's (its R2), read from the host's one instance. */
  get #corpusExport() { return this.#dep("corpusExport", () => corpusExportOf(this.#host)); }
  /* K1850: the CONDITIONs about our own machinery are machinery-producers' (its R1–R5, was this module's R3, R22, R26, R27),
     built over this module's own deps, so whatever a caller injected here reaches it too. */
  get #machinery() { return this.#dep("machinery", () => machineryProducersOf(this.#host, this.#deps)); }
  /* T45 (K2781 (1)): the Action layer's to-dos are action-producers' (its R1–R12, was this module's R15–R21, R29), built
     over this module's own deps as machinery-producers is, so whatever a caller injected here (queue's providers, a
     test's fakes) reaches it too. */
  get #actionProducers() { return this.#dep("actionProducers", () => actionProducersOf(this.#host, this.#deps)); }
  /* N520: a case's required core is docket's (its R9). */
  get #docket() { return this.#dep("docket", () => docketOf(this.#host)); }
  /* N534: a watch's entries are case-import's (its R20). */
  get #caseImport() { return this.#dep("caseImport", () => caseImportOf(this.#host)); }
  /* N528: a wizard script's breaks and its submissions are wizard-scripts' (its R13, R17). */
  get #wizardScripts() { return this.#dep("wizardScripts", () => wizardScriptsOf(this.#host)); }
  /* N612 (K1505 (1)): a case's tensions after publication are case-tensions' (its R4, was publication R50). Its provider is
     registered by publication at start (K1505 (3)), so publication is reached first, as case-authoring does. */
  get #caseTensions() { return this.#dep("caseTensions", () => { void this.#publication; return caseTensionsOf(this.#host); }); }
  /* N823 (K2438): a case edition set to publish at a time is publish-schedule's (its R4, was publication R69). */
  get #publishSchedule() { return this.#dep("publishSchedule", () => publishScheduleOf(this.#host)); }
  /* T50 (R41, R42; N1091): a project's participants and requests to join are project-roster's (its R1, R14, R26, R34). */
  get #projectRoster() { return this.#dep("projectRoster", () => projectRosterOf(this.#host, { record: this.#record, membership: this.#membership })); }
  /* R38: the read instance-setup registers at start (its R62), or null while none is. */
  #placeArrivals = null;

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ------------------------------------------------------------------ the viewer gate (membership R43, R80)
     membership offers the ONE predicate (`viewerPredicate`) and the one-id answer (`inSight`), so this module compiles
     its own gate from the predicate, as queue did. A machine credential (`scope: member`) is not filtered; an absent or
     unrecognised viewer compiles to DENY. */
  #bundleGate(col, viewer) {
    if (typeof col !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(col))
      throw new Error(`REFUSED: the D-15 bundle gate needs a QUALIFIED column (got ${col}). `
        + "An unqualified name binds to `bundles` inside the gate's own subquery and passes everything.");
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
    if (gate.scope === "DENY") return { sql: gate.sql, args: [] };
    return {
      sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b
              WHERE b.bundle_id = ${col} AND (${gate.sql})))`,
      args: gate.args,
    };
  }

  /** The same question of ONE id, memoised per read: the id when the viewer sees it (membership R80), else null. */
  #bundleRedactor(viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return (id) => id ?? null;
    if (gate.scope === "DENY") return (id) => (id ? null : id ?? null);
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id)) memo.set(id, this.#membership.inSight(id, viewer));
      return memo.get(id) ? id : null;
    };
  }

  /* ------------------------------------------------------------------ the providers' services, by the names the moved
     code already used (connections R22; basis-versions R22, R37; membership R64, R86) */
  #projectsDrawingOn(...a) { return this.#basisVersions.projectsDrawingOn(...a); }
  #conclusionOf(...a) { return this.#basisVersions.conclusionOf(...a); }
  #conclusionRecordOf(...a) { return this.#basisVersions.conclusionRecordOf(...a); }
  #isAdminMember(...a) { return this.#membership.isAdministrator(...a); }
  #activeAdmins(...a) { return this.#membership.activeAdmins(...a); }

  /* queue's R7 walk and R12 options, as this read was handed them (R8). */
  #homesOf(subjectIds) { return this.#homesFn ? this.#homesFn(subjectIds || []) : { ...UNGROUPED }; }
  #optionsOf(subjectIds) { return this.#optionsFn ? this.#optionsFn(subjectIds || []) || [] : []; }

  /* ------------------------------------------------------------------ the bounds */
  /** Which object types can BE a case (queue's R7 vocabulary, through normalizeType): an inquiry or a project. */
  static QUEUE_CASE_TYPES = ["inquiry", "project"];
  /** How many subject bundles one item names (R2: at most 8), the bound queue's options read under too. */
  static QUEUE_OPTION_SUBJECTS_MAX = 8;
  /** R9: the lead's inquiry-grain act, take it up (cite into that inquiry); queue decorates it (its R17) and adds the
   *  set-aside at its mint, where the disposition is known (its R18). */
  static LEAD_TAKE_UP = Object.freeze({ id: "cite", label: word("queue-producers.label.take_up_under"), weight: "report" });
  /** K1850: the five sweep kinds, now machinery-producers' (its R4), kept here as an alias for this module's readers. */
  static SWEEP_CONDITION_KINDS = MachineryProducers.SWEEP_CONDITION_KINDS;
  /** How many pages of one provider's cursor-paged read (each at most 500 entries) one read follows. */
  static QUEUE_PAGES = 20;

  /** A provider's paged read followed by its cursor, at most QUEUE_PAGES pages; `truncated` when it was cut. */
  #pages(read) {
    const items = [];
    let after = null, cut = false;
    for (let page = 0; ; page += 1) {
      if (page === QueueProducers.QUEUE_PAGES) { cut = true; break; }
      const r = read(after);
      if (!r || r.ok === false || !Array.isArray(r.items)) break;
      items.push(...r.items);
      if (!r.truncated || !r.cursor) break;
      after = r.cursor;
    }
    return { items, truncated: cut };
  }

  /* ================================================================== R8 · feedItems
   * queue's ONE read of this module. Every producer here is a pure read, called in the order queue's feed assembled
   * them before the split, so the items and their order are what queue minted from its own producers; queue sorts,
   * mints (the class fence, the disposition, the lead's set-aside), ages, mutes and publishes.
   *
   * `facts` carries what queue's answer publishes BESIDE its items: `objective_gap` and `contradiction`, the project
   * bounds R2 and R4 read under with whether they cut (queue R6 publishes them); `unattributed`, the readings of a
   * shared question no team could be read for (D-266); and `dispositions`, the proposals feed's recorded decisions,
   * from the same `proposalsFeed` read the FINDINGs came from, so R2 and queue R15 cannot disagree; and `action`,
   * action-producers' own facts (its R13: each of its producers' bound and cut, and any provider that failed). */
  feedItems({ member = null, viewer = null, now = null, identity = null, homesOf = null, optionsOf = null } = {}) {
    void identity;        // queue's options are closed over it already (its R12); named here as R8 names it
    const me = typeof member === "string" && member.trim() ? member.trim() : null;
    const at = Number.isFinite(Number(now)) && now !== null && now !== "" ? Number(now) : Date.now();
    this.#homesFn = typeof homesOf === "function" ? homesOf : null;
    this.#optionsFn = typeof optionsOf === "function" ? optionsOf : null;
    try {
      const items = [];
      /* OBLIGATION · R1: the bias debts. */
      items.push(...this.#obligationsBiasDebt(viewer, me, at));
      /* FINDING · R2: the proposals feed, read ONCE (its dispositions are published from this same read). */
      const feed = this.#progressions.proposalsFeed(at) || {};
      const findingSeen = this.#bundleGate("pi.bundle_id", viewer);
      items.push(...proposalFindingItems(feed, {
        subjectsOf: (pk, eid) => this.#rows(`SELECT DISTINCT pi.bundle_id FROM progression_instances pi
            WHERE pi.progression_key=? AND pi.entity_id=? AND (${findingSeen.sql}) ORDER BY pi.bundle_id`,
          pk, eid, ...findingSeen.args).map((r) => r.bundle_id),
        homesOf: (subjects) => this.#homesOf(subjects),
        optionsOf: (subjects) => this.#optionsOf(subjects),
        subjectsMax: QueueProducers.QUEUE_OPTION_SUBJECTS_MAX }));
      /* FINDING · R2 and R9: the lead, the three shared-inquiry kinds, the export, the notices, the gaps, the flags. */
      items.push(...this.#findingsOutOfInquiryLead(viewer, at));
      items.push(...this.#findingsStanceDiverged(viewer, at));
      const fromAnotherTeam = this.#findingsVersionFromAnotherTeam(viewer, at);
      items.push(...fromAnotherTeam);
      items.push(...this.#findingsConcludedElsewhere(viewer, at));
      items.push(...this.#findingsExportPerformed(me, viewer, at));
      items.push(...this.#findingsNewerCapture(viewer, at));
      const gaps = this.#findingsObjectiveGap(me, viewer, at);
      items.push(...gaps);
      items.push(...this.#findingsSourceFlagged(viewer, at));
      /* CONDITION (K1850): our own machinery's, machinery-producers' (its R1–R5), homed and offered through the same
         walk and options this read was handed. */
      const machinery = this.#machinery.conditionItems({ member: me, viewer, now: at, homesOf: this.#homesFn || undefined,
                                                         optionsOf: this.#optionsFn || undefined });
      items.push(...(machinery && Array.isArray(machinery.items) ? machinery.items : []));
      /* N345 · R4–R7: the contradictions. */
      const scope = this.#contradictionProjects(me, viewer);
      items.push(...this.#contradictionItems(scope, viewer, at));
      items.push(...this.#findingsSideCorrected(viewer, at));
      items.push(...this.#findingsTensionAfterPublication(me, viewer, at));
      items.push(...this.#contradictionUnseenItems(me, scope, viewer));
      /* OBLIGATION · R14: a member's own signing key, to the administrators. */
      items.push(...this.#obligationsSignerSelfRegistered(me, viewer, at));
      /* The Action layer (T45; K2781 (1)): its to-dos are action-producers' (its R1–R12, was this module's R15–R21, R29),
         answered as machinery-producers' are, through the same walk and options this read was handed. */
      const action = this.#actionProducers.actionItems({ member: me, viewer, now: at, homesOf: this.#homesFn || undefined,
                                                         optionsOf: this.#optionsFn || undefined });
      items.push(...(action && Array.isArray(action.items) ? action.items : []));
      /* R23 (DEC-102 item 3): an observation of the member's own a prepared case uses, its credit level unchosen. */
      items.push(...this.#obligationsAttributionUnchosen(me, viewer, at));
      /* R30, R31 (N520; DEC-116): a case's required core still due, to its manager; a finding resting on an edition
         withdrawn or contested on its docket. */
      items.push(...this.#obligationsDocketCoreDue(me, viewer, at));
      items.push(...this.#findingsDocketDependents(viewer, at));
      /* R34, R35 (N534; DEC-101 (3)): a finding resting on another group's edition its publisher replaced or withdrew; and
         what a watch saw at the publisher's docket, to the member who set it. */
      items.push(...this.#findingsCitedCaseMoved(viewer, at));
      items.push(...this.#watchItems(me, viewer, at));
      /* R32, R33 (N528; DEC-121 (1), (5)): a group's wizard script withdrawn or restored, told its owners and author; a
         version submitted, to each owner who may approve it. */
      items.push(...this.#findingsWizardBroken(me, viewer, at));
      items.push(...this.#obligationsWizardApproval(me, viewer, at));
      /* R37 (DEC-147; N662): a case edition signed to publish at a set time, while it waits, once published, once stopped. */
      items.push(...this.#scheduledEditionItems(me, viewer, at));
      /* R38 (DEC-150 (3); N665): a held profile for the place the group named, arrived with an update, to the administrators. */
      items.push(...this.#conditionsPlaceArrived(me, viewer, at));
      /* R39 (DEC-158 (4); K1818): a copied wizard whose base has a newer approved version, to the copy's editors. */
      items.push(...this.#findingsWizardBaseUpdated(me, viewer, at));
      /* R41, R42 (T50; N1091; DEC-248, DEC-286): a project's invitation, to the member invited; a request to join it, to its owners. */
      items.push(...this.#obligationsProjectInvitation(me, viewer, at));
      items.push(...this.#obligationsProjectRequest(me, viewer, at));
      return {
        items,
        facts: {
          objective_gap: { bound: gaps.bound, truncated: gaps.truncated === true },
          unattributed: { count: Number(fromAnotherTeam.unattributed) || 0,
                          inquiries: Array.isArray(fromAnotherTeam.unattributed_inquiries)
                            ? fromAnotherTeam.unattributed_inquiries : [] },
          contradiction: { bound: scope.bound, truncated: scope.truncated === true },
          dispositions: Array.isArray(feed.dispositions) ? feed.dispositions : [],
          action: action && action.facts && typeof action.facts === "object" ? action.facts : {},
        },
      };
    } finally {
      this.#homesFn = null;
      this.#optionsFn = null;
      }
  }

  /** PL-15 / D-213 — WHAT THE RECORD CAN SAY ABOUT A CAPTURED DOCUMENT'S PLACE
   *  IN A CASE, MEASURED, and the reason it is measured rather than asserted.
   *
   *  The out-of-inquiry lead's defining property is an ABSENCE: the document is
   *  in the store and is deliberately part of NO claim. `CLAUDE.md` is explicit
   *  that an absence at one level is not evidence of absence at the next, and
   *  that saying WHICH is true is a first-class obligation rather than a
   *  diagnostic detail. A `basis` field simply omitting the leg would say
   *  nothing at all — a reader could not tell "we looked and it is in no case"
   *  from "nobody has read this document yet" from "this producer does not
   *  report that". So this asks BOTH basis projections directly and reports the
   *  counts it got, so the absence in the answer is the record's own and is
   *  dated by the read that made it.
   *
   *  BOTH PROJECTIONS, because there are two and they are different questions.
   *  `inquiry_basis` is the CURRENT basis of an inquiry (D-21's projection of
   *  `basis[]`), and `inquiry_basis_version_legs` holds the legs of every
   *  alternative composition anybody has proposed (PL-1's versions). A document
   *  absent from the first and present in the second IS part of a case — a
   *  suggested one — and reporting only the first would let the item announce
   *  "not part of any claim" about a document a run has already built a reading
   *  on. Neither table is filtered by inquiry: the claim being made is about the
   *  whole record, and narrowing it to inquiry B would make the sentence
   *  narrower than it reads.
   *
   *  A CAPTURE WITH NO REGISTER ROW IS `undetermined`, NOT `absent`. The
   *  register is what says which bundle a capture's bytes were registered
   *  under, so with no row there is no bundle to ask about and the honest answer
   *  is that this producer could not determine it — which is a different fact
   *  from "it is in no case", and the two must never be published as one word. */
  #leadBasisAbsence(captureSha) {
    const sha = typeof captureSha === "string" ? captureSha.trim() : "";
    if (!sha)
      return { state: "undetermined", reason: "no_capture_sha", bundle_id: null, bundle_state: null,
               basis_legs: null, version_legs: null,
               detail: localize("queue-producers.index.the_request_records_no_capture", "the request records no capture digest, so there is no document to ask about. That this producer could not look is a different fact from the document being part of nothing, and it is reported as the first rather than the second.") };
    const home = this.#provenance.homeOf(sha);
    const reg = home ? { bundle_id: home.bundleId } : null;
    if (!reg)
      return { state: "undetermined", reason: "unregistered_capture", bundle_id: null, bundle_state: null,
               basis_legs: null, version_legs: null,
               detail: localize("queue-producers.index.no_register_entry_answers_to", "no register entry answers to this capture, so the bytes are not attached to a document this store can name and there is nothing whose place in a case could be asked. Undetermined, and STATED (D-9/D-45's unbacked-register shape).") };
    const head = this.#record.head(reg.bundle_id);
    const b = head ? { current_state: head.currentState } : null;
    const legs = this.#one(
      `SELECT COUNT(*) AS n FROM inquiry_basis WHERE target_id=?`, reg.bundle_id).n;
    const vlegs = this.#one(
      `SELECT COUNT(*) AS n FROM inquiry_basis_version_legs WHERE target_id=?`, reg.bundle_id).n;
    const none = legs === 0 && vlegs === 0;
    return {
      state: none ? "absent" : "present",
      reason: none ? "not_made_part_of_the_case" : "carried_by_a_reading",
      bundle_id: reg.bundle_id,
      bundle_state: b ? b.current_state : null,
      basis_legs: legs, version_legs: vlegs,
      detail: none
        ? localize("queue-producers.index.looked_for_and_not_there", "LOOKED FOR AND NOT THERE, which is the point of this item rather than an omission. The document was CAPTURED — an entry to the store — and no leg of any inquiry's basis and no leg of any proposed reading points at it (DEC-60, D-213). It was NOT made part of the case, which is a different sentence from nobody having read it, and this producer counted both basis projections to be able to say which.")
        : localize("queue-producers.index.this_document_is_carried_by", "this document IS carried by a reading of some question, so the lead has already been acted on or the document was evidence before the lead was raised. Reported rather than suppressed: the item is still the record of an observation somebody made."),
    };
  }

  /** `out-of-inquiry-lead` (D-213, ANSWERED 2026-08-06 by Bob under DEC-60) —
   *  THE FINDING-CLASS SLUG WITH A PRODUCER, and this is the producer.
   *
   *  THE HOLE IT FILLS. DEC-60's investigative session reads ALL of a project's
   *  inquiries for context and writes only to the SUBJECT one, so evidence it
   *  turns up bearing on a DIFFERENT question — the same vendor holding three
   *  other contracts, met while investigating whether one was competitively bid
   *  — had nowhere to go and was dropped BY CONSTRUCTION. That is D-194's
   *  authored frontier with a PRODUCER generating them continuously rather than
   *  a member noticing one occasionally, which is what makes it worth a kind.
   *
   *  THE FACT IS THE REQUEST ROW'S OWN. `lead_inquiry` is written at the door by
   *  the run that made the observation, and this walk reads it. Nothing here
   *  infers a lead from subject matter, from a shared entity or from a
   *  similarity: an observation a producer can manufacture is one a producer can
   *  invent, and a notification claiming a member's attention on a manufactured
   *  connection is the record claiming more than it can support.
   *
   *  THE `case` SET DERIVES FROM INQUIRY B'S ANCESTORS, NOT A'S, and that IS the
   *  item. Filing a lead under the question the run happened to be working is
   *  what made these homeless in the first place — the evidence is about B, the
   *  people who need it are the people working B, and REC-20's every-ancestor
   *  walk over B is what routes it to them. `#conditionsCaptureRequested` walks
   *  the SAME table and files on `target`, which is correct for what IT
   *  announces (a capture this run asked for has completed) and wrong for this.
   *  Two producers, one table, two different homes, and the difference is the
   *  whole reason both exist.
   *
   *  FINDING AND NOT CONDITION. A CONDITION is a fact about our own machinery
   *  and a member may MUTE it personally (D-125, DEC-16). A lead is a fact about
   *  the world, and muting is exactly what must not be available: one member's
   *  inbox hygiene would remove a real lead from their view while the record
   *  went on believing the team had been told. It leaves the list the way every
   *  finding does — adopted, deferred or dismissed as an authored, attributed
   *  act. queuestate.mjs classes the slug FINDING and the mint refuses anything
   *  else, so this is enforced rather than intended.
   *
   *  GATED ON `lead_inquiry` AND NOT ON `target`. The item is ABOUT question B,
   *  it is FILED under B, and its acts are offered on B — so B is what a viewer
   *  must be able to see for the item to exist for them at all. A member invited
   *  to B and not to A learns nothing about A here beyond the fact that some run
   *  captured this document, which is the same disclosure `basis.source` makes
   *  everywhere else. Withheld WHOLE and with no count, the posture REC-30 set.
   *
   *  ONLY `captured` ROWS. A lead whose capture has not landed is not yet a
   *  lead a member can act on: the point of D-213's answer is that the DOCUMENT
   *  IS IN THE STORE, and announcing one before the bytes arrive would offer a
   *  member acts over something that may still be refused at the drain. */
  #findingsOutOfInquiryLead(viewer, now) {
    const out = [];
    for (const r of this.#captureRequests.leads({ viewer }).requests) {
      const attribution = r.attribution;
      /* THE SAME DEFENCE `#conditionsCaptureRequested` STATES, for the same
         reason and with the same honesty about what it is. The drain refuses to
         capture a row it cannot attribute, so no `captured` row reaching this
         walk can fail the composer today and this `continue` is UNDRIVABLE. It
         is kept because this is a READ over stored rows, which outlive the rules
         that wrote them, and a member-facing item that could not say whose act
         it announces is DEC-27(b)'s defect surfaced to a person. It mints no
         DEC-49 code: an unreachable branch costs a reader a moment, an
         unreachable CODE costs its family the floor that proves codes fire. */
      if (!attribution.ok) continue;
      const basisEntry = this.#leadBasisAbsence(r.capture_sha);
      const capturedMs = Date.parse(r.captured_at);
      const leadTitle = this.#record.bundleInfo(r.lead_inquiry);
      out.push({
        id: `FINDING::out-of-inquiry-lead::${r.request}`,
        class: "FINDING",
        kind: "out-of-inquiry-lead",
        /* INQUIRY B'S ANCESTORS. The one line this item exists for. */
        case: this.#homesOf([r.lead_inquiry]),
        subject: { kind: "capture_request", id: r.request,
                   inquiry: r.lead_inquiry, address: r.address,
                   capture_sha: r.capture_sha ?? null,
                   bundle_id: basisEntry.bundle_id },
        summary: word("queue-producers.summary.evidence_bearing_met", { lead_inquiry: String(leadTitle && leadTitle.title ? leadTitle.title : r.lead_inquiry) }),
        detail: localize("queue-producers.index.address_was_captured_at_an", "{address} was captured at an investigative session's request while it was working {target}, because it bears on {lead_inquiry}. {statement}. The document is IN THE STORE and is part of NO claim: it was captured, which is an entry to the cache, and it was deliberately not made part of any question's basis. Nothing about any conclusion has moved, and nothing here is evidence until somebody decides it is.", { address: String(r.address), target: String(r.target), lead_inquiry: String(r.lead_inquiry), statement: String(attribution.statement) }),
        basis: {
          source: "capture_requests", request: r.request, run: r.run,
          /* NAMED APART, deliberately. `found_while_working` is inquiry A and
             `bears_on` is inquiry B, and a single `inquiry` field would collapse
             the distinction the whole item is about — which is exactly what the
             sibling producer's basis does, correctly, because for IT there is
             only one question. */
          found_while_working: r.target,
          bears_on: r.lead_inquiry,
          address: r.address, host: r.host, purpose: r.purpose, ua_mode: r.ua_mode,
          capture_sha: r.capture_sha ?? null, captured_at: r.captured_at,
          attribution,
          basis_entry: basisEntry,
          detail: localize("queue-producers.index.both_principals_are_named_dec", "BOTH PRINCIPALS ARE NAMED (DEC-27(b), DEC-55.4) and BOTH QUESTIONS ARE NAMED (D-213): the act is the daemon's, performed at the session's request, and the session was working one question when it met evidence for another. The absence of a basis entry is MEASURED and reported on `basis_entry` rather than left to be inferred from an empty field — absence at one level is not evidence of absence at the next, and which one is true is the answer, not a footnote (CLAUDE.md)."),
        },
        age: Number.isFinite(capturedMs)
          ? { state: "determined", since: r.captured_at, ms: Math.max(0, now - capturedMs) }
          : { state: "undetermined", reason: "unparseable_captured_at",
              detail: "the request row carries a completion stamp this producer cannot read as an instant" },
        assignee: null,
        assignee_role: null,
        /* R9 (REC-202; queue R18): THE INQUIRY-GRAIN ACTS ON INQUIRY B, which D-213 named and D-222's grain problem held back:
           take it up (cite the captured document into B, op=cite) and set it aside (the project-scoped disposition,
           queue R27). The set-aside is added at the mint, where the item's disposition is known, and only when that
           disposition is available: no item offers an act its op would refuse NO_PROJECT_SCOPE. */
        options: [QueueProducers.LEAD_TAKE_UP],
      });
    }
    return out;
  }

  /* ======================================================================
   * PL-13 / IS-3 — THE TWO SHARED-INQUIRY SLUGS, AND WHY THE MODEL NEEDS THEM.
   *
   * D-216's MODEL CHECK IS THE PRECONDITION AND ITS ANSWER IS **PER-PROJECT**
   * (landed 2026-08-08, DRIVEN through twelve ops against the real control
   * plane rather than read). §7 is correct and cloning the inquiry on
   * divergence is NOT the honest answer, because a clone duplicates the whole
   * evidence trail and the copies drift, so the shared investigation stops
   * being shared. The sharing edge is a `cites` row in `refs`; the inquiry's
   * own bytes carry NO stance; a read naming no project gets no `current` field
   * at all, which is a refusal to guess rather than a default.
   *
   * THAT ANSWER IS WHAT MAKES THESE TWO KINDS NECESSARY, and stating it the
   * other way round is the whole design. Because the stance is per-project,
   * NOTHING REFUSES A DIVERGENCE — two projects standing on two readings of one
   * question is a legal state that was measured happening with no refusal from
   * the plane. A legal state nobody is told about is a silent one, and the
   * failure mode is concrete: a team builds a case on a reading its partners
   * abandoned, and finds out at publication. So the cost of the correct model
   * is paid HERE, in the feed, by telling people — never by a reconciliation
   * that would quietly re-impose the single shared stance §7 rejected.
   *
   * BOTH ARE DERIVED ON READ AND NEITHER ADDS A TABLE. That is a finding rather
   * than a shortcut and it is worth naming, because a stance-divergence LEDGER
   * is the obvious build and it would be wrong twice over: it would be a second
   * place a stance is stated (D-21), and it would be a derived table that
   * `op=purge` must be taught about or silently leave rows behind (D-113). The
   * facts these two walk are ALREADY the record's own — `refs`, the projects'
   * own frontmatter, `inquiry_basis_versions` — so there is nothing to store,
   * nothing to go stale, and nothing for a purge to miss.
   *
   * WHAT THEY DO NOT DO. Neither refuses anything, neither moves a pointer, and
   * neither writes. `op=versioncurrent` moves ONE project's stance and moves
   * nothing else — PL-2 built it, D-216 measured it, and the plan row's
   * accepts-when says so in terms. These producers report; they do not
   * reconcile. A notification that changed somebody else's stance would be the
   * single shared stance arriving through the back door.
   * ====================================================================== */


  /** THE SHARED QUESTIONS, and the walk is bounded by the edge table rather
   *  than by the corpus. An inquiry is SHARED when two or more distinct bundles
   *  cite it; the `refs_target` index answers that with one grouped read, and
   *  the expensive per-project frontmatter confirmation then runs only over
   *  questions that could possibly diverge. A question ONE project draws on can
   *  hold no divergence and is never opened.
   *
   *  D-480 — THE GROUP RUNS OVER WHAT THE CALLER CAN SEE, AND THE PARAGRAPH
   *  THAT USED TO STAND HERE WAS WRONG IN A WAY WORTH KEEPING ON THE RECORD.
   *  It said the `HAVING COUNT(DISTINCT bundle_id) > 1` was on the UNGATED
   *  table ON PURPOSE — a CANDIDATE filter, not the answer, since
   *  `#projectsDrawingOn` gates afterwards and can take the real count back
   *  below two. **That is true of every candidate the page REACHES and says
   *  nothing about the page's EDGE**, which is the whole defect (found by
   *  D-464's worker, `BIO_Membership_Architecture_v2.md` §7 item 7.9). The
   *  candidate read is BOUNDED at `QUEUE_SHARED_INQUIRIES_MAX` and ordered by
   *  `target_id`, so a hidden project's citations do two things a later gate
   *  cannot undo: they make a question that only ONE visible project draws on
   *  qualify as shared, and that question then TAKES A SLOT — displacing a
   *  visible one past the cap and flipping the `inquiries_truncated` the feed
   *  publishes on every item. A count-shaped side channel, D-447's and D-464's
   *  class: *"Not its existence"* arriving as an aggregate.
   *
   *  THE FIX IS D-464'S AND D-486'S SUBTRACTION, NOT A SECOND SIGHT RULE, and
   *  that is also the answer to the old paragraph's performance objection.
   *  membership's `hiddenBundles(viewer)` (its R88; N352) is the ONE set of bundles the caller's own
   *  `viewerPredicate` does not pass, spelled once and read here as a set —
   *  `NOT IN`, an indexed subtraction SQLite materialises once per statement,
   *  never the per-row correlated gate the old paragraph rightly refused. Who
   *  is filtered is the gate's word, inherited rather than restated: a
   *  credential the gate does not filter (scope `member`) gets `hid` = nothing
   *  and the read it always got; an administrator, the founder included, gets
   *  the hidden projects it neither was invited to nor joined (D54), and a
   *  viewer SENT but unrecognised is DENY, so every bundle is hidden and the
   *  candidate set is empty — fails closed.
   *
   *  BOTH ENDS OF THE EDGE, and the second is not scope creep but the same
   *  sentence: a question the caller cannot see is dropped by
   *  `#queueSharedInquiry` a few lines below, so it never mints an item — but
   *  until this landing it still consumed a slot on the way there. The
   *  subtraction is over `bundles`, so a `target_id` naming NOTHING (a
   *  `references[]` entry for a document nobody has captured — the common case)
   *  is in no hidden set and is kept exactly as before, then dropped by the
   *  same existence check that always dropped it. Nothing here tightens what is
   *  ANSWERED; it decides only which rows are allowed to fill the bounded page.
   *
   *  THE CANDIDATE FILTER IS STILL A CANDIDATE FILTER. The severed-status
   *  confirmation and the per-project frontmatter read still run afterwards in
   *  `#projectsDrawingOn` and can still take the real count back below two, in
   *  which case no item is minted. */
  #queueSharedInquiryCandidates(viewer) {
    const cap = QueueProducers.QUEUE_SHARED_INQUIRIES_MAX;
    const hid = hiddenBundles(viewer);
    /* `hid` is null for a caller the gate does not filter: the statement is then
       BYTE-IDENTICAL to the one this method ran before D-480, which is what
       keeps the unfiltered classes measurably unmoved. */
    const where = hid ? ` AND rf.bundle_id NOT IN ${hid.sql} AND rf.target_id NOT IN ${hid.sql}` : "";
    const args = hid ? [...hid.args, ...hid.args] : [];
    const rows = this.#rows(
      `SELECT rf.target_id AS target_id FROM refs rf WHERE rf.kind='cites'${where}
        GROUP BY rf.target_id HAVING COUNT(DISTINCT rf.bundle_id) > 1
        ORDER BY rf.target_id LIMIT ?`, ...args, cap + 1);
    const out = rows.slice(0, cap).map((r) => r.target_id);
    out.truncated = rows.length > cap;
    out.bound = cap;
    return out;
  }

  /** THE BOUNDS THESE PRODUCERS WALK UNDER. A derivation over an unbounded scan
   *  is a class of defect this record has paid for (D-227, REC-66), and the
   *  first draft of these producers walked straight into it, found by the old
   *  suites' ceiling on unbounded derivations: an unbounded read of `refs` with
   *  per-row work inside the loop. `shared.test.mjs`'s R11 (D-480) test drives
   *  the shared-question page to exactly its bound and one past it.
   *
   *  PUBLIC so a suite can read them and so the bound a member is told about is
   *  the bound that was applied, never a second copy of the number.
   *
   *  WHAT A TRUNCATION MEANS HERE, AND IT IS PUBLISHED RATHER THAN SWALLOWED. A
   *  bounded project set makes `elsewhere` a FLOOR: the projects named really do
   *  stand where the item says, and there may be more the read did not reach. A
   *  divergence reported over a truncated set is still true; the ABSENCE of a
   *  divergence over one is not, so the item says which it had. */
  static QUEUE_SHARED_INQUIRIES_MAX = 64;
  static QUEUE_SHARED_PROJECTS_MAX = 32;
  static QUEUE_SHARED_VERSIONS_MAX = 64;
  /** The page basis-versions' read is asked at (its R9's largest). */
  static QUEUE_SHARED_VERSIONS_READ = 1000;

  /** IS THE QUESTION ITSELF STILL THERE, AND MAY THIS VIEWER SEE IT?
   *
   *  **THIS GUARD EXISTS BECAUSE THE PURGE ARM CAUGHT ITS ABSENCE, and the
   *  defect is worth recording rather than quietly fixed.** The sharing edge
   *  lives in the CITING PROJECT'S OWN BYTES — a `references[]` row and a
   *  `current_versions[]` row — and those OUTLIVE the target. So after
   *  `op=purge` removed the shared question, both producers went on announcing
   *  a divergence about a question that no longer existed, naming a bundle id
   *  nothing answers to. The candidate walk reads `refs`, which is a projection
   *  of the citing side, so nothing in it requires the target to be there.
   *
   *  It is also the VIEWER gate for the subject. `homesOf` and
   *  `#projectsDrawingOn` each gate what they name, but the question the item is
   *  ABOUT is named in its own `summary`, `detail` and `subject` — REC-30's
   *  posture is that an item about a bundle a viewer may not see is withheld
   *  WHOLE, and this is where that happens for these two kinds. */
  #queueSharedInquiry(inquiryId, viewer) {
    const gate = this.#bundleGate("bx.bundle_id", viewer);
    return this.#one(
      `SELECT bx.bundle_id, bx.title, bx.object_type FROM bundles bx
        WHERE bx.bundle_id=? AND (${gate.sql})`, inquiryId, ...gate.args) || null;
  }

  /** `stance-changed-here-not-elsewhere` (PL-13 / IS-3) — ONE ITEM PER
   *  (QUESTION, PROJECT THAT HOLDS A DATED STANCE) THAT STANDS APART.
   *
   *  THE GRAIN IS PER-PROJECT AND THE REASON IS THE DATE. The obvious
   *  alternative is one item per diverging QUESTION, and it fails on the one
   *  thing §7's field actually carries: the pointer is DATED, and the date is
   *  the whole of *changed*. Two projects standing apart have TWO dated
   *  pointers, so a per-question item would have to pick one date, invent one,
   *  or report its age undetermined — throwing away the only fact that makes
   *  this a change rather than a standing difference. Per-project, `age.since`
   *  is the project's OWN authored `at`, read from its OWN bytes.
   *
   *  ONLY A PROJECT THAT HOLDS A STANCE MINTS AN ITEM, and this is what makes
   *  the plan row's accepts-when come out right rather than approximately
   *  right. Project A moves to a reading while B has named none: ONE item, A's,
   *  saying B stands on nothing. B then moves to a different reading: TWO
   *  items, because there are now two dated acts and two teams who each need to
   *  know the other is elsewhere. A project with NO pointer is never the
   *  subject of one of these — it has not changed anything, and announcing "you
   *  stand nowhere" every time a partner moves would be the feed nagging a team
   *  about an act it has not taken.
   *
   *  FILED UNDER THE QUESTION'S ANCESTORS, WHICH IS EVERY PROJECT DRAWING ON
   *  IT. queue R7's walk climbs `refs kind='cites'` upward, so the homes of
   *  an item about a shared question ARE the projects sharing it — both sides
   *  of the divergence, by the same walk every other producer uses. That is the
   *  point: an item only the diverging team could see would tell the one team
   *  that already knows.
   *
   *  `elsewhere` IS ENUMERATED AND NEVER SUMMARISED TO A COUNT. A member needs
   *  to know WHICH reading the other team is on to decide whether the
   *  difference matters, and "2 projects differ" is the shape that reads as
   *  disagreement when it may be one project that simply has not caught up. */
  #findingsStanceDiverged(viewer, now) {
    const out = [];
    const shared = this.#queueSharedInquiryCandidates(viewer);
    for (const inq of shared) {
      const q = this.#queueSharedInquiry(inq, viewer);
      if (!q) continue;
      const drawing = this.#projectsDrawingOn(inq, viewer);
      if (drawing.length < 2) continue;
      const qname = q.title || inq;
      for (const p of drawing) {
        if (!p.current || !p.current.version) continue;
        const elsewhere = drawing
          .filter((q) => q.id !== p.id
                      && (!q.current || q.current.version !== p.current.version))
          .map((q) => ({ project: q.id, title: q.title,
                         version: q.current ? q.current.version : null,
                         at: q.current ? q.current.at : null,
                         by: q.current ? q.current.by : null,
                         state: q.current ? "stands_elsewhere" : "stands_on_nothing" }));
        if (elsewhere.length === 0) continue;
        const movedMs = Date.parse(p.current.at ?? "");
        out.push({
          id: `FINDING::stance-changed-here-not-elsewhere::${inq}::${p.id}`,
          class: "FINDING",
          kind: "stance-changed-here-not-elsewhere",
          case: this.#homesOf([inq]),
          subject: { kind: "project_stance", id: p.id, inquiry: inq,
                     version: p.current.version },
          summary: word("queue-producers.summary.stands_reading", { id: String(p.title || p.id), version: String(p.current.version), qname: String(qname), do: String(elsewhere.length === 1 ? "the other project drawing on it does" : "the other projects drawing on it do") }),
          detail: localize("queue-producers.index.qname_is_drawn_on_by", "{qname} is drawn on by {length} projects and holds NO stance of its own: what a project stands on is that project's own dated, authored property (§7), so this difference is a legal state and nothing in this record refuses it. {id} named '{version}'{v1}{v2}. Nothing here has moved anybody else's stance and nothing here will: this is a report, and moving another project's pointer is that project's own act.", { qname: String(qname), length: String(drawing.length), id: String(p.id), version: String(p.current.version), v1: String(p.current.at ? ` on ${p.current.at}` : ""), v2: String(p.current.by ? ` (${p.current.by})` : "") }),
          basis: {
            source: "project frontmatter (current_versions[]) + refs",
            inquiry: inq,
            here: { project: p.id, title: p.title, version: p.current.version,
                    at: p.current.at, by: p.current.by },
            elsewhere,
            drawing_projects: drawing.map((q) => q.id),
            /* THE BOUNDS, PUBLISHED WITH THE ANSWER THEY SHAPED. A truncated
               project set makes `elsewhere` a FLOOR — what is named really does
               stand there, and there may be more. Said here rather than left
               for a reader to wonder about, because a bounded walk reporting a
               complete-looking answer is the shape REC-57's discipline exists
               to end. */
            bounds: {
              inquiries_examined: shared.length, inquiries_bound: shared.bound,
              inquiries_truncated: shared.truncated === true,
              projects_named: drawing.length, projects_bound: drawing.bound,
              projects_truncated: drawing.truncated === true,
              detail: localize("queue-producers.index.this_feed_examines_a_bounded", "this feed examines a bounded number of shared questions per read and a bounded number of projects per question. Where either is truncated the divergence reported is a FLOOR: the projects named do stand where this says, and the read did not reach every one that might. A divergence over a truncated set is still true; an ABSENCE of one over a truncated set is not, which is why the flags are published rather than the counts alone."),
            },
            /* THE SHAPE OF THE POINTER, PUBLISHED ON THE ITEM. §7's field is a
               project-authored DATED frontmatter row and NEVER a settings row,
               and this producer read it as one — so a member (and a suite) can
               see from the notification itself where the fact came from,
               instead of taking the sentence's word for it. */
            pointer: { kind: "dated_frontmatter_field", field: "current_versions",
                       held_by: word("queue-producers.held_by"), settings_row: false,
                       detail: localize("queue-producers.index.dec_17s_reasoning_a_settings", "DEC-17's reasoning: a settings row would be a way to change the standard with nothing to read afterwards. Every stance named here was read out of a project's own promoted bytes, where the act that wrote it is in the append-only history beside it.") },
            detail: localize("queue-producers.index.d_216_measured_this_model", "D-216 measured this model rather than assuming it (2026-08-08): two projects were driven onto two different readings of one shared question SIMULTANEOUSLY, the plane refused neither, and after divergence each still saw every version and every leg of the other's. The sharing is real and the stance is not shared — which is why this item exists at all."),
          },
          /* THE DATE IS THE PROJECT'S OWN AUTHORED `at`, never this read's
             clock. A pointer whose date cannot be parsed reports UNDETERMINED
             rather than falling back to now: a stance dated by the reader is a
             fact about the reader. */
          age: Number.isFinite(movedMs)
            ? { state: "determined", since: p.current.at, ms: Math.max(0, now - movedMs) }
            : { state: "undetermined", reason: "unparseable_stance_date",
                detail: "this project's pointer carries no date this producer can read as an "
                      + "instant, so how long the two teams have stood apart is undetermined and "
                      + "is reported as such rather than measured from this read" },
          assignee: null,
          assignee_role: null,
          options: this.#optionsOf([inq]),
          options_grain: {
            offered: "document",
            missing: "stance",
            detail: localize("queue-producers.index.the_natural_acts_here_are", "the natural acts here are at STANCE grain — move to the reading the others are on, or record why we are staying — and the first of those is op=versioncurrent on THIS project and nobody else's. It is deliberately not offered as an option on an item another project's members can also see: an act one team performs from a notification another team is reading is the single shared stance §7 rejected, arriving through a button (D-222's grain problem)."),
          },
        });
      }
    }
    return out;
  }

  /** `new-version-arrived-from-another-team` (PL-13 / IS-3) — A READING OF A
   *  SHARED QUESTION, PROPOSED UNDER SOMEBODY ELSE'S WORK.
   *
   *  THE TEAM IS READ, NOT INFERRED, AND WHERE IT CANNOT BE READ NO ITEM IS
   *  MINTED. A version row carries `author` (a member) and `run`. A MEMBER does
   *  not name a team: this record has no member-to-project map and inventing
   *  one from who-has-edited-what is exactly the manufactured connection
   *  `#findingsOutOfInquiryLead` refuses to make. What IS a stored fact is the
   *  RUN's context: `ai_runs.context_type='project'` with a `context_id`, set
   *  when the run was opened. So the source team is the run's context project
   *  or it is nothing, and a version composed by hand — or by a run whose
   *  context is the instance rather than a project — mints NO item at all.
   *
   *  THAT SILENCE IS A REAL COST AND IT IS DECLARED RATHER THAN ABSORBED. A
   *  hand-composed version of a shared question genuinely does reach the other
   *  team unannounced, and this producer cannot fix that without claiming to
   *  know something the record does not hold. Announcing it anyway — "arrived
   *  from another team" about a version whose team is undetermined — is the
   *  record claiming more than it can support, which this project ranks as
   *  worse than a missing feature. The gap is stated here, asserted in
   *  `shared.test.mjs` (R2: a run-less version produces NO item, driven), and
   *  raised as **D-266** so it is a known hole with a name rather than a
   *  surprise for whoever next reads this feed.
   *
   *  THE SOURCE PROJECT IS REMOVED FROM ITS OWN ITEM'S HOMES, and this is the
   *  one place this file filters a walk's result. `homesOf([inquiry])`
   *  returns EVERY project citing the question, including the one the version
   *  came from — and telling a team that a reading "arrived from another team"
   *  when they authored it is a false sentence, not merely noise. So the source
   *  is dropped from `case.ancestors` and the drop is DECLARED on the item
   *  (`case.excluded`) rather than performed quietly: a home set that is
   *  silently shorter is the exact failure DEC-16's truncation rule exists to
   *  prevent, and a filtered set that says so is not one.
   *
   *  HIDDEN VERSIONS ARE INCLUDED AND FLAGGED, NEVER FILTERED (D-214,
   *  DEC-29(b)). Hiding is a display decision one project made; it is not a
   *  reason another project should never learn the reading was proposed. */
  #findingsVersionFromAnotherTeam(viewer, now) {
    const out = [];
    /* D-266 — THE SILENCE, COUNTED. Not attributed: counted.
     *
     * The gap D-266 folds in is this producer's, and it is real — a reading of
     * a shared question composed BY HAND, or by a run whose context is not one
     * of the projects named here, reaches the other team with NO item minted,
     * because the source team is the RUN's stored context or it is nothing and
     * this producer will not guess one. **That much does not change here and
     * must not: attributing a team we cannot read is the record claiming more
     * than it can support, which this project ranks as worse than the silence.**
     *
     * WHAT DOES CHANGE IS THAT THE SILENCE IS NO LONGER SILENT. Absence at one
     * level is not evidence of absence at the next, and saying WHICH is true is
     * a first-class obligation rather than a diagnostic detail (CLAUDE.md). A
     * member reading this feed could not tell *no reading arrived from another
     * team* from *readings arrived and this record cannot say whose they are* —
     * two very different facts that rendered identically as an empty list. The
     * count below is the second one, published on the feed's envelope, and it
     * is deliberately a COUNT AND AN INQUIRY rather than a version name and a
     * guess: it says how much this read could not attribute and where to go and
     * look, and it claims nothing whatever about who authored anything.
     *
     * IT DISTINGUISHES NOTHING FURTHER, AND THAT IS REC-74 RATHER THAN
     * LAZINESS. Telling *the run's context was the instance* from *the run's
     * context was a project this viewer cannot see* would mean PROJECTING a
     * stored column of `ai_runs`, which this reader's declared role forbids —
     * so the two are counted together and the answer says they are. */
    let unattributed = 0;
    const unattributedIn = [];
    const shared = this.#queueSharedInquiryCandidates(viewer);
    for (const inq of shared) {
      const q = this.#queueSharedInquiry(inq, viewer);
      if (!q) continue;
      const drawing = this.#projectsDrawingOn(inq, viewer);
      if (drawing.length < 2) continue;
      const ids = new Set(drawing.map((p) => p.id));
      const qname = q.title || inq;
      /* THE HAND-COMPOSED READINGS, COUNTED AND NEVER READ. A `count(*)` over
         the complement of the predicate below — one aggregate per question
         inside a loop that is already bounded, projecting no column of any
         row, so nothing here reaches a member except the number itself. */
      /* basis-versions R8–R9: the question's versions as the viewer may read them, at its largest page. */
      const held = this.#basisVersions.basisVersions({ id: inq, limit: QueueProducers.QUEUE_SHARED_VERSIONS_READ, viewer });
      const heldVersions = held && held.ok !== false && Array.isArray(held.versions) ? held.versions : [];
      {
        const n = heldVersions.filter((v) => !(typeof v.run === "string" && v.run)).length;
        if (n > 0) { unattributed += n; if (!unattributedIn.includes(inq)) unattributedIn.push(inq); }
      }
      /* BOUNDED, for the reason the bounds above are: a per-question read with
         per-row work inside it is the amplification class D-227 and REC-66
         paid for. One more than may be used, so the truncation is a fact
         rather than an inference. */
      const vcap = QueueProducers.QUEUE_SHARED_VERSIONS_MAX;
      const vrows = heldVersions.filter((v) => typeof v.run === "string" && v.run)
        .map((v) => ({ name: v.name, description: v.description ?? null, state: v.state, hidden: v.hidden ? 1 : 0,
                       author: v.author ?? null, at: v.at ?? null, run: v.run }));
      const vtrunc = vrows.length > vcap || held.truncated === true;
      for (const v of vrows.slice(0, vcap)) {
        /* A MEMBERSHIP TEST AGAINST THE PROJECTS ALREADY NAMED. This producer does
           not want a run's facts: it wants to know WHICH OF THE PROJECTS IT HAS
           ALREADY NAMED the reading came from, so the run's context is matched
           against the drawing set and `from_project` below is `p.id`, which came
           from `refs` and from the project's own frontmatter (REC-74 holds every
           reader of `ai_runs` to a declared role; ai-runs answers this read).

           IT IS ALSO THE STRICTER GATE. Iterating the DRAWING set means a run
           whose context is a project this viewer cannot see can never be
           matched, so the item cannot name it — REC-30's withheld-WHOLE posture
           obtained by construction rather than by a second check. */
        /* ai-runs R28: the run's context, for a run this viewer can see (null otherwise, which names no project). */
        const run = this.#aiRuns.runFor(v.run, viewer);
        const from = run && run.context_type === "project"
          ? drawing.find((p) => p.id === run.context_id) : undefined;
        /* D-266: the OTHER half of the silence — a reading that DOES carry a
           run, whose context this read could not match to any project it
           named. Counted with the hand-composed ones above and never told
           apart from them, for the REC-74 reason stated at the head. */
        if (!from) {
          unattributed += 1;
          if (!unattributedIn.includes(inq)) unattributedIn.push(inq);
          continue;
        }
        const src = from.id;
        if (!ids.has(src)) continue;
        /* THE OTHER TEAMS. If the source is the only project drawing on the
           question that this viewer can see, there is no "another team" for the
           reading to have arrived at, and no item is the honest answer. */
        const receiving = drawing.filter((p) => p.id !== src);
        if (receiving.length === 0) continue;
        const homes = this.#homesOf([inq]);
        const kept = homes.ancestors.filter((a) => a.id !== src);
        const arrivedMs = Date.parse(v.at ?? "");
        const srcRow = from;
        out.push({
          id: `FINDING::new-version-arrived-from-another-team::${inq}::${v.name}`,
          class: "FINDING",
          kind: "new-version-arrived-from-another-team",
          case: {
            ...homes,
            ancestors: kept,
            ungrouped: homes.state === "determined" && kept.length === 0,
            /* DECLARED, NEVER QUIET. The one home this producer removed and the
               reason, so a reader can tell a filtered set from a short one. */
            excluded: [{ id: src, reason: "authored_here",
                         detail: localize("queue-producers.index.the_project_this_reading_was", "the project this reading was proposed under is not a team it arrived FROM, so this item is not filed under it. Stated rather than performed silently: a home set that is quietly shorter is indistinguishable from nobody caring (DEC-16).") }],
          },
          subject: { kind: "basis_version", id: `${inq}::${v.name}`,
                     inquiry: inq, version: v.name },
          summary: word("queue-producers.summary.new_reading_proposed", { qname: String(qname), name: String(v.name), src: String(srcRow && srcRow.title ? srcRow.title : src) }),
          detail: localize("queue-producers.index.qname_is_drawn_on_by_2", "{qname} is drawn on by {length} projects. '{name}' was proposed by a run working under {src}{v1}{v2}, and it is currently {state}{v3}. Nothing about what this project stands on has moved: a reading arriving is not a reading being adopted, and the stance is a per-project act somebody here would have to take (§7).", { qname: String(qname), length: String(drawing.length), name: String(v.name), src: String(src), v1: String(v.author ? `, authored ${v.author}` : ""), v2: String(v.at ? ` on ${v.at}` : ""), state: String(v.state), v3: String(v.hidden === 1 ? " and hidden from that project's display" : "") }),
          basis: {
            source: "inquiry_basis_versions + ai_runs",
            inquiry: inq, version: v.name, description: v.description,
            state: v.state,
            /* RETURNED AND FLAGGED, NEVER FILTERED — D-214 / DEC-29(b). */
            hidden: v.hidden === 1,
            from_project: src,
            from_project_title: srcRow ? srcRow.title : null,
            to_projects: receiving.map((p) => p.id),
            run: v.run, author: v.author ?? null, at: v.at ?? null,
            bounds: {
              inquiries_examined: shared.length, inquiries_bound: shared.bound,
              inquiries_truncated: shared.truncated === true,
              projects_named: drawing.length, projects_bound: drawing.bound,
              projects_truncated: drawing.truncated === true,
              versions_bound: vcap, versions_truncated: vtrunc,
              detail: localize("queue-producers.index.this_feed_examines_a_bounded_2", "this feed examines a bounded number of shared questions per read, a bounded number of projects per question and a bounded number of run-proposed readings per question. A truncation here means READINGS THIS READ DID NOT REACH, never readings that do not exist — the arrival of this one is unaffected by it, and the flag is published so the silence about any other cannot be read as evidence there is none."),
            },
            team_attribution: {
              state: "determined", via: "ai_runs.context",
              detail: localize("queue-producers.index.the_source_team_is_the", "the source team is the RUN's own context project, a fact stored when the run was opened. It is never inferred from who authored the version: a member does not name a team in this record, and a producer that guessed one would be manufacturing the connection the notification is claiming attention for. A version with no run, or a run whose context is not a project, mints NO item — the silence is a declared gap (D-266), not a filtered one."),
            },
            detail: localize("queue-producers.index.d_216_measured_that_one", "D-216 measured that one question sits beneath several projects and that each reads the whole version set (2026-08-08): after two projects diverged, each still saw every version and every leg of the other's. So this item announces an arrival, not a disclosure — the reading was already readable here, and what was missing was anybody being told it had appeared."),
          },
          age: Number.isFinite(arrivedMs)
            ? { state: "determined", since: v.at, ms: Math.max(0, now - arrivedMs) }
            : { state: "undetermined", reason: "unparseable_version_date",
                detail: "the version row carries no authored instant this producer can read, so how "
                      + "long this reading has been standing unanswered is undetermined" },
          assignee: null,
          assignee_role: null,
          options: this.#optionsOf([inq]),
          options_grain: {
            offered: "document",
            missing: "version",
            detail: "the natural acts here are at VERSION grain — consider this reading, accept it, "
                  + "turn it down — and they exist (op=versionconsider / accept / reject), but they "
                  + "move the SHARED question's row and are therefore not this project's to take "
                  + "from a notification about somebody else's proposal. What IS this project's own "
                  + "act is op=versioncurrent, which moves only this project's stance (§7).",
          },
        });
      }
    }
    /* D-266 — CARRIED ON THE ARRAY, the way `#projectsDrawingOn` already
       carries `truncated` and `bound`. The producer's contract is its ITEMS;
       this is a fact ABOUT THE READ that has no item to sit on, precisely
       because the readings it counts minted none. */
    out.unattributed = unattributed;
    out.unattributed_inquiries = unattributedIn;
    return out;
  }

  /** `shared-inquiry-concluded-by-another-project` (REC-124 / INVESTIGATIVE-SESSION.md
   *  §7.1 item 3) — *"Other projects are told, never moved — a FINDING-class
   *  notice, §7's notification pattern: project P concluded this shared inquiry
   *  on version N. Their stance is unchanged until they act."*
   *
   *  ONE ITEM PER (QUESTION, PROJECT THAT CONCLUDED IT), filed under every OTHER
   *  project drawing on the question and NOT under the one that concluded —
   *  `#findingsVersionFromAnotherTeam`'s exclusion, declared on the item for the
   *  same reason (a home set quietly shorter is indistinguishable from nobody
   *  caring). DERIVED ON READ from the projects' own `conclusions[]` rows through
   *  the ONE reader, so it adds no table, needs no purge arm (D-113), and cannot
   *  disagree with op=basisversions about what a project concluded.
   *
   *  FINDING AND NOT CONDITION, for §7's reason: another team having concluded
   *  the question you share is a fact about the world of the work, and one
   *  member's inbox hygiene must not make it vanish for the team. */
  #findingsConcludedElsewhere(viewer, now) {
    const out = [];
    const shared = this.#queueSharedInquiryCandidates(viewer);
    for (const inq of shared) {
      const q = this.#queueSharedInquiry(inq, viewer);
      if (!q) continue;
      const drawing = this.#projectsDrawingOn(inq, viewer);
      if (drawing.length < 2) continue;
      const qname = q.title || inq;
      for (const p of drawing) {
        const c = this.#conclusionOf(p.id, inq, viewer);
        if (!c) continue;
        const receiving = drawing.filter((x) => x.id !== p.id);
        if (receiving.length === 0) continue;
        const homes = this.#homesOf([inq]);
        const kept = homes.ancestors.filter((a) => a.id !== p.id);
        const atMs = Date.parse(c.at ?? "");
        out.push({
          id: `FINDING::shared-inquiry-concluded-by-another-project::${inq}::${p.id}`,
          class: "FINDING",
          kind: "shared-inquiry-concluded-by-another-project",
          case: {
            ...homes,
            ancestors: kept,
            ungrouped: homes.state === "determined" && kept.length === 0,
            excluded: [{ id: p.id, reason: "concluded_here",
                         detail: "the project that concluded is not a team this was concluded ELSEWHERE "
                               + "for, so this item is not filed under it. Stated rather than performed "
                               + "silently (DEC-16)." }],
          },
          subject: { kind: "project_conclusion", id: p.id, inquiry: inq, version: c.version },
          summary: `${p.title || p.id} concluded ${qname} on reading '${c.version}'`,
          detail: localize("queue-producers.index.qname_is_drawn_on_by_3", "{qname} is drawn on by {length} projects. {id} concluded it on reading '{version}'{v1}{v2}, adopting that reading's claim. A conclusion belongs to the project that drew it (§7.1): NOTHING about what any other project stands on or has concluded has moved, and nothing here will move it — this is a report, and concluding is each project's own act.", { qname: String(qname), length: String(drawing.length), id: String(p.id), version: String(c.version), v1: String(c.by ? ` (${c.by})` : ""), v2: String(c.at ? ` on ${c.at}` : "") }),
          basis: {
            source: "project frontmatter (conclusions[]) + refs",
            inquiry: inq,
            concluded_by_project: p.id, concluded_by_project_title: p.title ?? null,
            version: c.version, claim: c.claim, by: c.by, at: c.at,
            to_projects: receiving.map((x) => x.id),
            /* The receiving projects' OWN conclusions, read through the same
               reader and enumerated, never summarised: a team needs to know
               whether it concluded on the same reading, a different one, or not
               at all. */
            elsewhere: receiving.map((x) => {
              /* REC-136: a project that concluded and WITHDREW is said so,
                 never folded into "not concluded" — the two differ in what
                 the team knows, and the history is the record of it. */
              const { stance: o } = this.#conclusionRecordOf(x.id, inq, viewer);
              return { project: x.id, title: x.title ?? null,
                       state: !o ? "not_concluded" : o.act === "concluded" ? "concluded"
                            : o.act === "withdrawn" ? "withdrawn" : "undetermined",
                       version: o ? o.version : null, at: o ? o.at : null };
            }),
            bounds: {
              inquiries_examined: shared.length, inquiries_bound: shared.bound,
              inquiries_truncated: shared.truncated === true,
              projects_named: drawing.length, projects_bound: drawing.bound,
              projects_truncated: drawing.truncated === true,
              detail: localize("queue-producers.index.a_bounded_number_of_shared", "a bounded number of shared questions and of projects per question are read. A conclusion reported over a truncated set is still true; an ABSENCE over one is not, which is why the flags are published."),
            },
            /* R10 (D-82): the derivation, which this producer's basis alone did not state until the split. */
            detail: localize("queue-producers.index.a_conclusion_is_the_concluding", "a conclusion is the concluding project's own dated row (§7.1), read through basis-versions' one reader (its R22) for each project drawing on this shared question, and the others' own conclusions beside it. Derived on read: nothing is stored, and nobody else's stance moved."),
          },
          age: Number.isFinite(atMs)
            ? { state: "determined", since: c.at, ms: Math.max(0, now - atMs) }
            : { state: "undetermined", reason: "unparseable_conclusion_date",
                detail: "the conclusion row carries no authored instant this producer can read" },
          assignee: null,
          assignee_role: null,
          options: this.#optionsOf([inq]),
        });
      }
    }
    return out;
  }

  /** `export-performed` (D-52, catalogue id N-1) — Membership v2 §8.1: *"The export is recorded in
   *  the append-only history, so it can never happen silently, and every administrator is notified."*
   *  The RECORD half was `export_log` and `op=exportlog`, which reach an administrator who LOOKS; this
   *  is the notification half, which reaches one who does not.
   *
   *  ONE ITEM PER `export_log` ROW, IN EVERY ADMINISTRATOR'S FEED AND IN NO OTHER. The reader is an
   *  administrator when `#isAdminMember` says so of the stamped member (the founder's own session is
   *  ROOT_ADMIN and counts), or, for a machine credential, when the credential IS the ADMIN_TOKEN class
   *  — the root of trust that took the export. Every other reader gets nothing, and not a count: an
   *  ordinary member is not told an export exists, since §8.1's audience is the administrators. The
   *  rule is asked of the READER, never of the exporter, so the item cannot collapse to "the person
   *  who exported was told" — the failure this item's control arm is aimed at.
   *
   *  DERIVED ON READ from the log itself, the lead's and the conclusions' precedent: no table, no purge
   *  arm (D-113), and it cannot disagree with `op=exportlog` about what was exported. An administrator
   *  appointed after an export is told of it too, which is the reading of "every administrator" that
   *  leaves no administrator uninformed.
   *
   *  WHAT IT CANNOT YET DO, STATED ON THE ITEM: leave anyone's list. It is a FINDING, and a finding
   *  leaves by an authored disposition or a member's personal mute; the disposition is scoped to a
   *  project and an export has none, and the personal mute of a finding (D-125) is ruled and not built.
   *  So the notice is bounded to the log's newest `EXPORT_LOG_LIMIT_DEFAULT` rows instead, and the bound
   *  is published. */
  #findingsExportPerformed(me, viewer, now) {
    const admin = me ? this.#isAdminMember(me) : viewer === `${MACHINE_CLASS_PREFIX}admin`;
    if (!admin) return [];
    const cap = EXPORT_LOG_LIMIT_DEFAULT;
    /* The export log is `corpus-export`'s (its R1, R2; K1043), read from its own instance since N483 (K1122). */
    const log = this.#corpusExport.exportLog({ limit: cap });
    const page = log && Array.isArray(log.exports) ? log.exports : [];
    if (page.length === 0) return [];
    const truncated = log.truncated === true;
    const raisedTo = this.#activeAdmins();
    const homes = this.#homesOf([]);
    return page.map((r) => {
      const atMs = Date.parse(r.at ?? "");
      return {
        id: `FINDING::export-performed::${r.seq}`,
        class: "FINDING",
        kind: "export-performed",
        case: homes,
        subject: { kind: "export", id: `export_log:${r.seq}`, seq: r.seq },
        summary: word("queue-producers.summary.full_export_taken", { scope: String(r.scope), at: String(r.at), bundles: String(r.bundles), files: String(r.files) }),
        detail: localize("queue-producers.index.an_export_of_the_scope", "An export of the {scope} left your team's Civicsmith with the root-of-trust credential (Membership v2 §8.1). It is row {seq} of the append-only export log{v1}. Every administrator is told; nobody else is. The log is the record of it and nothing here changes the log.", { scope: String(r.scope), seq: String(r.seq), v1: String(r.note ? `, noted "${r.note}"` : ", with no note") }),
        basis: {
          source: "export_log",
          seq: r.seq, at: r.at, scope: r.scope, bundles: r.bundles, files: r.files, note: r.note ?? null,
          raised_to: raisedTo,
          bounds: { limit: cap, truncated,
                    detail: "the newest exports are read up to this bound. An export past it is still "
                          + "in the log (op=exportlog, with a larger limit) and is not told here." },
          detail: localize("queue-producers.index.an_export_of_the_working", "an export of the working corpus is recorded in the append-only export log and every administrator is notified (Membership v2 §8.1). This notice is derived from that log row and reaches every administrator named in raised_to and no one else. No act clears it yet: a disposition is scoped to a project and an export has none, and a member's own mute of a finding (D-125) is ruled but not built."),
        },
        age: Number.isFinite(atMs)
          ? { state: "determined", since: r.at, ms: Math.max(0, now - atMs) }
          : { state: "undetermined", reason: "unparseable_export_instant",
              detail: "the export log row carries an instant this producer cannot read" },
        assignee: null,
        assignee_role: null,
        /* The producer's own option (NOTIFICATIONS.md item contract, rule 1): the act that shows the
           administrator the record behind the notice. Not REC-19's object derivation, because an
           export is not a bundle and has no affordances to derive. */
        options: [{ id: "exportlog", label: word("queue-producers.label.read_export_log"), weight: "single" }],
      };
    });
  }

  /* ======================================================================
   * N172, N229 — THE PRODUCERS THE CATALOGUE NAMED WITHOUT ONE (R2, R3; N172, N229 as queue R1, R9, R10 named them).
   *
   * Each reads the fact its owning module already offers and restates none of it: reevaluation's open notices (its
   * R14), intent's gaps (its R6), monitoring's plan (its R32), its flagged documents (its R48) and the addresses its
   * next archive tick would find eligible (its R47; N330). Each is derived on read and writes nothing, like every producer above it, and each
   * is bounded, the bound stated where a member could otherwise read a short list as a complete one.
   * ====================================================================== */

  /** A home set made of the named cases themselves (each at depth 0, when this viewer sees it and it is a case) and
   *  every ancestor above them (queue R7): for an item that is ABOUT a case rather than about a document under one. */
  #homesAt(caseIds, viewer) {
    const up = this.#homesOf(caseIds);
    const gate = viewerPredicate(viewer);
    const own = [];
    for (const id of [...new Set((caseIds || []).filter((x) => typeof x === "string" && x))]) {
      const row = this.#one(
        `SELECT b.bundle_id, b.object_type, b.current_state, b.title FROM bundles b
          WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
      if (!row) continue;
      const ty = normalizeType(row.object_type);
      if (!QueueProducers.QUEUE_CASE_TYPES.includes(ty)) continue;
      const spec = vocabFor(STATES, row.object_type);
      const edges = spec && spec.edges ? spec.edges : null;
      const terminal = edges && Object.prototype.hasOwnProperty.call(edges, row.current_state)
        ? edges[row.current_state].length === 0 : null;
      own.push({ id: row.bundle_id, type: ty, title: row.title ?? null, state: row.current_state ?? null, terminal, depth: 0 });
    }
    const ancestors = [...own, ...up.ancestors.filter((a) => !own.some((o) => o.id === a.id))]
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return { ...up, ancestors, ungrouped: up.state === "determined" && ancestors.length === 0 };
  }

  /** `newer-capture-affects-reference` (N172; reevaluation R14): one FINDING per open notice on a holder this viewer
   *  sees, read through `reevaluation.notices`, which withholds a notice on a hidden holder and blanks what the viewer
   *  may not see of the newer capture. Homed under the holder and its ancestors. Its door is reevaluation's R15
   *  (`versionadopt`, `versionkeep`), published on its disposition (queue R12). At most one page of notices is read. */
  #findingsNewerCapture(viewer, now) {
    const page = this.#reevaluation.notices({ state: "open", viewer, limit: QueueProducers.QUEUE_NOTICES_MAX });
    const list = page && page.ok !== false && Array.isArray(page.notices) ? page.notices : [];
    const out = [];
    for (const n of list) {
      if (!n || typeof n.notice !== "string" || !n.notice) continue;
      const raisedMs = Date.parse(n.raised_at ?? "");
      out.push({
        id: `FINDING::newer-capture-affects-reference::${n.notice}`,
        class: "FINDING",
        kind: "newer-capture-affects-reference",
        case: this.#homesAt([n.holder], viewer),
        subject: { kind: "notice", id: n.notice, holder: n.holder, target: n.target ?? null, ord: n.ord ?? null,
                   content_id: n.content_id ?? null, capture_sha: n.capture_sha ?? null,
                   newer_capture: n.newer_capture ?? null, newer_bundle: n.newer_bundle ?? null },
        summary: word("queue-producers.summary.newer_version_change", { document: String(n.target || "a document"), holder: String(n.holder) }),
        detail: localize("queue-producers.index.a_newer_capture_of_what", "a newer capture of what this reference is pinned to was read as {v1}{v2}. Nothing about the reference has moved: it stays on the version it names until the member who holds it adopts the newer one or keeps the earlier one.", { v1: String(n.grade ?? "undetermined"), v2: String(n.affects ? ` (${n.affects})` : "") }),
        basis: { source: "reevaluation.notices", notice: n.notice, holder: n.holder, target: n.target ?? null,
                 grade: n.grade ?? null, affects: n.affects ?? null, raised_at: n.raised_at ?? null,
                 bound: { limit: page.limit ?? QueueProducers.QUEUE_NOTICES_MAX, truncated: page.truncated === true },
                 detail: localize("queue-producers.index.a_notice_is_reevaluations_its", "a notice is reevaluation's (its R14): raised when a newer capture of what a reference is pinned to is graded affected or undetermined, never for A or B. It is read here, never raised, and it closes only by the holder's adoption or keeping (its R15).") },
        age: Number.isFinite(raisedMs)
          ? { state: "determined", since: n.raised_at, ms: Math.max(0, now - raisedMs) }
          : { state: "undetermined", reason: "unparseable_raised_at",
              detail: "the notice carries no raised instant this producer can read" },
        assignee: null,
        assignee_role: null,
        options: this.#optionsOf([n.holder]),
      });
    }
    return out;
  }

  /** The projects `objective-gap` asks intent about (N172): those this viewer sees in which the member participates
   *  (joined or leaving; membership R74), or every visible project when there is no member, in id order, at most
   *  QUEUE_OBJECTIVE_GAP_PROJECTS; `truncated` when a further one qualifies. */
  #objectiveGapProjects(me, viewer) {
    return this.#participatingProjects(me, viewer, QueueProducers.QUEUE_OBJECTIVE_GAP_PROJECTS);
  }

  /** The projects this viewer sees in which the member participates (joined or leaving; membership R74), or every
   *  visible project when there is no member, in id order, at most `cap`; `truncated` when a further one qualifies. */
  #participatingProjects(me, viewer, cap) {
    const gate = viewerPredicate(viewer);
    const out = [];
    let after = "", truncated = false;
    for (;;) {
      const rows = this.#rows(
        `SELECT b.bundle_id FROM bundles b WHERE b.object_type='project' AND b.bundle_id > ? AND (${gate.sql})
          ORDER BY b.bundle_id LIMIT ?`, after, ...gate.args, QueueProducers.QUEUE_OBJECTIVE_GAP_PAGE);
      for (const r of rows) {
        const p = me ? this.#membership.participation(r.bundle_id, me) : null;
        if (me && !(p && (p.state === "joined" || p.state === "leaving"))) continue;
        if (out.length === cap) { truncated = true; break; }
        out.push(r.bundle_id);
      }
      if (truncated || rows.length < QueueProducers.QUEUE_OBJECTIVE_GAP_PAGE) break;
      after = rows[rows.length - 1].bundle_id;
    }
    return { projects: out, bound: cap, truncated };
  }

  /** `objective-gap` (N172; intent R6): one FINDING per gap intent answers for each project `#objectiveGapProjects`
   *  names, homed under its project. A gap is a proposal intent derives on read; it is read here and never restated. */
  #findingsObjectiveGap(me, viewer, now) {
    const scope = this.#objectiveGapProjects(me, viewer);
    const items = [];
    for (const project of scope.projects) {
      const g = this.#intent.gaps({ project, viewer });
      if (!g || g.ok !== true || !Array.isArray(g.gaps)) continue;
      for (const gap of g.gaps) {
        const b = gap.basis || {};
        items.push({
          id: `FINDING::objective-gap::${gap.key}`,
          class: "FINDING",
          kind: "objective-gap",
          case: this.#homesAt([project], viewer),
          subject: { kind: "objective", id: project, project, progression: b.progression ?? null,
                     entity: b.entity ?? null },
          summary: b.says ? `${project}'s objective: ${b.says}` : `${project}'s objective has a gap`,
          detail: Array.isArray(b.stages_missing)
            ? localize("queue-producers.index.an_instance_this_projects_objective", "an instance this project's objective counts is short of the stages {stages_missing}.", { stages_missing: String(b.stages_missing.join(", ")) })
            : localize("queue-producers.index.an_instance_this_projects_objective_2", "an instance this project's objective counts reaches {v1} where {v2} is required.", { v1: String(b.grade_reached ?? "an undetermined grade"), v2: String(b.grade_required ?? "a grade") }),
          basis: { source: "intent.gaps", key: gap.key, project, progression: b.progression ?? null,
                   entity: b.entity ?? null, grade: gap.grade ?? null, instances: gap.instances ?? [],
                   gap: b, surfaced_by: gap.surfaced_by ?? "machine",
                   detail: localize("queue-producers.index.a_gap_is_derived_intent", "a gap is DERIVED (intent R6): the objective's satisfaction test read against the record, recomputed at every read. It leaves this project's list by a recorded decision.") },
          age: { state: "undetermined", reason: "derived_on_read",
                 detail: "a gap is recomputed at read time and has no creation instant" },
          assignee: null,
          assignee_role: null,
          options: this.#optionsOf([project]),
        });
      }
    }
    items.bound = scope.bound;
    items.truncated = scope.truncated;
    return items;
  }

  /** `source-modified` and `source-removed` (N229, N330; monitoring R48): one FINDING per monitored document this viewer
   *  may see whose latest tick flagged `reeval_pending` from its `source_status`, read through `monitoring.flagged`,
   *  which gates by sight inside its read (a hidden document is neither listed nor counted) and bounds it, the bound
   *  and whether it cut published on each item. Homed under the document's ancestors. */
  #findingsSourceFlagged(viewer, now) {
    const page = this.#monitoring.flagged({ viewer }) || {};
    const list = page.ok !== false && Array.isArray(page.items) ? page.items : [];
    const out = [];
    for (const r of list) {
      const id = r && typeof r.bundleId === "string" && r.bundleId ? r.bundleId : null;
      if (!id) continue;
      const removed = r.source_status === "removed";
      const kind = removed ? "source-removed" : "source-modified";
      const sinceMs = Date.parse(r.since ?? "");
      const info = this.#record.bundleInfo(id);
      const title = info && typeof info.title === "string" && info.title ? info.title : null;
            out.push({
        id: `FINDING::${kind}::${id}`,
        class: "FINDING",
        kind,
        case: this.#homesOf([id]),
        subject: { kind: "bundle", id },
        title,
        summary: title
          ? (removed ? `${title} is gone from its source` : `${title} has changed at its source`)
          : (removed ? word("queue.source-removed.one") : word("queue-producers.summary.document_changed_source")),
        detail: localize("queue-producers.index.your_teams_civicsmith_noticed_that", "Your team's Civicsmith noticed that the address this document was captured from {v1}, and flagged it for a second look. What the change means is not decided here.", { v1: String(removed
                ? "no longer has it" : "now shows something other than what was captured") }),
        basis: { source: "monitoring.flagged", bundle_id: id, source_status: r.source_status ?? null,
                 since: r.since ?? null,
                 bound: { limit: page.limit ?? null, truncated: page.truncated === true },
                 detail: localize("queue-producers.index.monitorings_tick_records_what_it", "monitoring's tick records what it saw and never decides what a change means (its R8): this item is that flag, as monitoring reads it (its R48).") },
        age: Number.isFinite(sinceMs)
          ? { state: "determined", since: r.since, ms: Math.max(0, now - sinceMs) }
          : { state: "undetermined", reason: "unparseable_since",
              detail: "the flag carries no instant this producer can read" },
        assignee: null,
        assignee_role: null,
        options: this.#optionsOf([id]),
      });
    }
    return out;
  }

  /** The bounds the new producers read under (R2): reevaluation's largest page; R2's fifty projects. The monitored
   *  documents and the archive addresses are bounded by monitoring's reads (its R47, R48), which publish their bounds. */
  static QUEUE_NOTICES_MAX = 1000;
  static QUEUE_OBJECTIVE_GAP_PROJECTS = 50;
  static QUEUE_OBJECTIVE_GAP_PAGE = 200;
  /** D-86: the OBLIGATION items the sweep raised, for `queueFeed`. Synchronous, like every producer there. The
   *  row is gated by `#bundleGate` over the run's `context_id` — the predicate `aiRunRead` compiles for the run
   *  itself, so an item about a run is shown exactly to the readers of that run. A member who is not a recipient
   *  is skipped unless the producer could name nobody, which is stated on the item. */
  #obligationsBiasDebt(viewer, me, now) {
    /* N171: bias's `uncleared` (its R43), gated by membership's predicate over the context, newest raised first. */
    const debts = this.#bias.uncleared({ gate: viewerPredicate(viewer), limit: QueueProducers.BIAS_DEBT_QUEUE_MAX });
    const items = [];
    for (const row of (debts && Array.isArray(debts.debts) ? debts.debts : [])) {
      const named = Array.isArray(row.recipients) ? row.recipients.filter((x) => typeof x === "string") : [];
      if (me && named.length && !named.includes(me)) continue;
      const raisedMs = Date.parse(row.raised);
      items.push({
        id: `OBLIGATION::bias-debt::${row.run}`,
        class: "OBLIGATION",
        kind: "bias-debt",
        case: this.#homesOf([row.context_id]),
        subject: { kind: "run", id: row.run, context: { type: row.context_type, id: row.context_id } },
        summary: word("queue-producers.summary.lens_assistant_run"),
        detail: null,
        basis: { source: "bias.uncleared", computed_by: "aiRunRead", run: row.run, moved: true,
                 moved_basis: row.moved_basis, lens_then: row.lens_then, lens_now: row.lens_now,
                 observed: row.observed,
                 stated: word("queue-producers.stated.run_lens_now", { force: String(row.lens_then ?? "none in force"), handed: String(row.moved_basis === "at_open" ? "the lens in force when it opened" : "the lens it was handed"), force3: String(row.lens_now ?? "none in force") }),
                 detail: localize("queue-producers.index.bias_debt_is_disclosed_and", "bias debt is DISCLOSED and travels with the work; only an uncleared hunch refuses publication (DEC-20). Whether the lens moved is op=airun's own comparison, read by the sweep and never recomputed.") },
        age: Number.isFinite(raisedMs)
          ? { state: "determined", since: row.raised, ms: Math.max(0, now - raisedMs) }
          : { state: "undetermined", reason: "unparseable_raised",
              detail: "the debt row carries a raised stamp this producer cannot read as an instant" },
        assignee: null,
        assignee_role: null,
        recipients: named,
        ...(named.length ? {} : { recipients_stated: "no member could be named inside this run's read gate, so "
                                  + "it is offered to every member who can read the run" }),
        options: this.#optionsOf([row.context_id]),
      });
    }
    return items;
  }
  static BIAS_DEBT_QUEUE_MAX = 200;

  /* ======================================================================
   * N345 — THE CONTRADICTIONS (R4–R7; DEC-76 item 3, DEC-84 items 1–3, 7 and 13, DEC-85 with K456).
   *
   * Each reads the fact its owning module offers and restates none of it: the candidates shown on a project
   * (`contradiction` R25), the notices on a project's own side (its R50), the dependents resting on a side named wrong
   * (`reevaluation` R27) and the tensions a published case did not disclose (`case-tensions` R4). Each is derived on
   * read and writes nothing, and each follows its provider's cursor under a stated bound of pages.
   *
   * WHAT THE PROVIDER WITHHOLDS STAYS WITHHELD. `candidatesFor` answers only a candidate whose two sides the viewer
   * may see, and `conflictNotices` only the side the viewer may see of one they see half; nothing here reads the
   * candidate any other way, so no item, home, count or flag can name the other side (R7, R11).
   * ====================================================================== */

  /** How many projects R4 and R7 ask about (R4: at most 50, in id order), and how many pages of one provider's answer
   *  are followed per project before the read is stated cut. */
  static QUEUE_CONTRADICTION_PROJECTS = 50;
  static QUEUE_CONTRADICTION_PAGES = 20;
  /** R6: how many owned projects `tension-after-publication` asks `case-tensions` about. */
  static QUEUE_TENSION_PROJECTS = 50;
  /** R5: the page `reevaluation.correctedDependents` is read in (its R27's largest). */
  static QUEUE_CORRECTED_PAGE = 200;

  /** The projects R4 and R7 ask about: those this viewer sees that the member has joined (joined or leaving,
   *  membership R74), every visible project when there is no member; at most 50 in id order, `truncated` when a
   *  further one qualifies. The same rule as `objective-gap`'s projects, under R4's own bound. */
  #contradictionProjects(me, viewer) {
    return this.#participatingProjects(me, viewer, QueueProducers.QUEUE_CONTRADICTION_PROJECTS);
  }

  /** The bundles a side lives in, as `contradiction` answers a side (its R25, R50): a claim's, a leg's or a stance's
   *  inquiry, a stance's project, and the document a leg's or an extent's content row is in. Each is a subject the
   *  item is homed from (queue R7, as `#homesAt`: a case side at depth 0 and everything above it). */
  static #sideSubjects(side) {
    if (!side || typeof side !== "object") return [];
    const ids = [side.inquiry, side.kind === "stance" ? side.project : null,
                 side.source && typeof side.source === "object" ? side.source.bundle : null];
    return [...new Set(ids.filter((x) => typeof x === "string" && x))];
  }

  /** R4's kinds: a duty open, taken up or explained and not shown; a lead open; a plurality open. Nothing else is an
   *  item: a dismissed or resolved candidate has left, and `not_shown` is never answered. */
  static #contradictionKind(weight, state) {
    if (weight === "duty" && ["open", "taken_up", "explained_not_shown"].includes(state))
      return { cls: "OBLIGATION", kind: "contradiction-duty" };
    if (weight === "lead" && state === "open") return { cls: "FINDING", kind: "contradiction-lead" };
    if (weight === "plurality" && state === "open") return { cls: "FINDING", kind: "contradiction-plurality" };
    return null;
  }

  /** `contradiction-duty`, `contradiction-lead` and `contradiction-plurality` (R4; N345): one item per candidate
   *  `contradiction.candidatesFor({on: {project}})` answers for each project of `scope`, counted once whatever number
   *  of those projects it reaches, and homed under both sides. */
  #contradictionItems(scope, viewer, now) {
    const found = new Map();
    let cut = false;
    for (const project of scope.projects) {
      let after = null;
      for (let page = 0; ; page += 1) {
        if (page === QueueProducers.QUEUE_CONTRADICTION_PAGES) { cut = true; break; }
        const r = this.#contradiction.candidatesFor({ on: { project }, after, viewer });
        if (!r || r.ok !== true || !Array.isArray(r.candidates)) break;
        for (const c of r.candidates) {
          if (!c || typeof c.candidate !== "string" || !QueueProducers.#contradictionKind(c.weight, c.state)) continue;
          const e = found.get(c.candidate) || { c, projects: [] };
          if (!e.projects.includes(project)) e.projects.push(project);
          found.set(c.candidate, e);
        }
        if (!r.truncated || !r.cursor) break;
        after = r.cursor;
      }
    }
    const out = [];
    for (const { c, projects } of [...found.values()].sort((x, y) => (x.c.candidate < y.c.candidate ? -1 : 1))) {
      const { cls, kind } = QueueProducers.#contradictionKind(c.weight, c.state);
      const subjects = [...new Set([...QueueProducers.#sideSubjects(c.a), ...QueueProducers.#sideSubjects(c.b)])];
      const atMs = Date.parse((c.machine && c.machine.at) ?? "");
      out.push({
        id: `${cls}::contradiction::${c.candidate}`,
        class: cls,
        kind,
        case: this.#homesAt(subjects, viewer),
        /* R8 (K558): the shape queue R46's dispositions read. `between_projects` is contradiction R25's, which names
           only the member's own party projects; `parties` is each of them with its opt-in. */
        subject: { kind: "contradiction_candidate", id: c.candidate, state: c.state,
                   ...(c.inquiry ? { inquiry: c.inquiry } : {}),
                   between_projects: Array.isArray(c.between_projects) ? c.between_projects : [],
                   parties: (Array.isArray(c.between_projects) ? c.between_projects : [])
                     .map((b) => ({ project: b.project, opted_in: b.opted_in ?? null })) },
        summary: kind === "contradiction-duty"
          ? word("queue-producers.summary.two_things_record")
          : kind === "contradiction-plurality"
            ? word("queue-producers.summary.two_projects_conclusions")
            : word("queue-producers.summary.record_noticed_two"),
        detail: kind === "contradiction-duty"
          ? localize("queue-producers.index.the_record_holds_a_conflict", "the record holds a conflict here ({v1}). It leaves only when it is resolved; it is never muted, dismissed or set aside.", { v1: String(c.state === "taken_up" ? "taken up as a question"
              : c.state === "explained_not_shown" ? "explained, not yet shown" : "open") })
          : kind === "contradiction-plurality"
            ? localize("queue-producers.index.two_projects_concluded_one_question", "two projects concluded one question on claims whose text differs. Naming the respect in which they differ clears it; neither project is made to adopt the other's answer.")
            : localize("queue-producers.index.a_machine_judged_these_two", "a machine judged these two may conflict. Its uncertainty asks nothing of you: dismiss it or take it up."),
        basis: { source: "contradiction.candidatesFor", candidate: c.candidate, key: c.key ?? null, why: c.why ?? null,
                 weight: c.weight, state: c.state, a: c.a ?? null, b: c.b ?? null, machine: c.machine ?? null,
                 resolution: c.resolution ?? null, inquiry: c.inquiry ?? null, reach: c.reach ?? null,
                 projects, between_projects: Array.isArray(c.between_projects) ? c.between_projects : [],
                 bound: { projects_bound: scope.bound, projects_truncated: scope.truncated === true,
                          pages_bound: QueueProducers.QUEUE_CONTRADICTION_PAGES, pages_truncated: cut },
                 detail: localize("queue-producers.index.a_candidate_is_contradictions_its", "a candidate is contradiction's (its R24–R26): its weight comes from the machine's label and its key, and its state from the members' acts, both read here and never restated. The machine's label and reason stay the machine's.") },
        age: Number.isFinite(atMs)
          ? { state: "determined", since: c.machine.at, ms: Math.max(0, now - atMs) }
          : { state: "undetermined", reason: "no_candidate_instant",
              detail: "the candidate carries no instant this producer can read" },
        assignee: null,
        assignee_role: null,
        options: this.#optionsOf(subjects),
      });
    }
    return out;
  }

  /** `side-corrected` (R5; N345, DEC-84 item 7): one FINDING per (dependent, candidate) `reevaluation`
   *  `correctedDependents` answers the viewer (its R27, which withholds a hidden dependent and does not count it), homed
   *  under the dependent and its ancestors. It leaves when the cause closes (a recorded re-evaluation, its R16). */
  #findingsSideCorrected(viewer, now) {
    const out = [];
    let after = null, cut = false, read = true;
    for (let page = 0; ; page += 1) {
      if (page === QueueProducers.QUEUE_CONTRADICTION_PAGES) { cut = true; break; }
      const r = this.#reevaluation.correctedDependents({ after, limit: QueueProducers.QUEUE_CORRECTED_PAGE, viewer });
      if (!r || r.ok !== true || !Array.isArray(r.entries)) break;
      if (r.corrections_read === false) read = false;
      for (const e of r.entries) {
        if (!e || typeof e.dependent !== "string" || !e.dependent || typeof e.candidate !== "string" || !e.candidate)
          continue;
        const title = this.#record.bundleInfo(e.dependent);
        const name = title && title.title ? title.title : e.dependent;
        const sinceMs = Date.parse(e.since ?? "");
        out.push({
          id: `FINDING::side-corrected::${e.dependent}::${e.candidate}`,
          class: "FINDING",
          kind: "side-corrected",
          case: this.#homesAt([e.dependent], viewer),
          subject: { kind: "bundle", id: e.dependent, candidate: e.candidate },
          summary: word("queue-producers.summary.something_rests_marked", { name: String(name) }),
          detail: localize("queue-producers.index.a_members_resolution_of_a", "a member's resolution of a contradiction named a side this rests on wrong{v1}. That side still resolves and says it was corrected; nothing resting on it has moved. A recorded re-evaluation closes this.", { v1: String(e.reason ? ` (${e.reason})` : "") }),
          basis: { source: "reevaluation.correctedDependents", dependent: e.dependent, candidate: e.candidate,
                   cause: e.kind ?? "corrected", reason: e.reason ?? null, member: e.member ?? null,
                   since: e.since ?? null, inquiry: e.inquiry ?? null, act: e.act ?? null,
                   legs: Array.isArray(e.legs) ? e.legs : [],
                   bound: { limit: QueueProducers.QUEUE_CORRECTED_PAGE, pages_bound: QueueProducers.QUEUE_CONTRADICTION_PAGES,
                            truncated: cut, corrections_read: read },
                   detail: "the cause is reevaluation's (its R27): a live leg of this finding rests on a side "
                         + "contradiction marks stale. It is read here, never raised, and no strength, conclusion or "
                         + "case moved." },
          age: Number.isFinite(sinceMs)
            ? { state: "determined", since: e.since, ms: Math.max(0, now - sinceMs) }
            : { state: "undetermined", reason: "no_marking_instant",
                detail: "the marking act carries no instant this producer can read" },
          assignee: null,
          assignee_role: null,
          options: this.#optionsOf([e.dependent]),
        });
      }
      if (!r.truncated || !r.cursor) break;
      after = r.cursor;
    }
    return out;
  }

  /** The projects this viewer sees that the member OWNS (membership R65), in id order, at most `cap`. */
  #ownedProjects(me, viewer, cap) {
    const gate = viewerPredicate(viewer);
    const out = [];
    let after = "", truncated = false;
    for (;;) {
      const rows = this.#rows(
        `SELECT b.bundle_id FROM bundles b WHERE b.object_type='project' AND b.bundle_id > ? AND (${gate.sql})
          ORDER BY b.bundle_id LIMIT ?`, after, ...gate.args, QueueProducers.QUEUE_OBJECTIVE_GAP_PAGE);
      for (const r of rows) {
        const owners = this.#membership.projectOwners(r.bundle_id) || [];
        if (!owners.includes(me)) continue;
        if (out.length === cap) { truncated = true; break; }
        out.push(r.bundle_id);
      }
      if (truncated || rows.length < QueueProducers.QUEUE_OBJECTIVE_GAP_PAGE) break;
      after = rows[rows.length - 1].bundle_id;
    }
    return { projects: out, bound: cap, truncated };
  }

  /** `tension-after-publication` (R6; N345, DEC-84 item 13): one FINDING per (case, candidate) `case-tensions`
   *  `caseTensions({project})` answers (its R4, was publication R50; N612), for each project the member owns, at most 50. It goes to those
   *  owners and to nobody else: a caller with no member, or a member who owns no project, gets none. It leaves when a
   *  later edition discloses it or the candidate resolves (the read no longer answers it). */
  #findingsTensionAfterPublication(me, viewer, now) {
    void now;
    if (!me) return [];
    const scope = this.#ownedProjects(me, viewer, QueueProducers.QUEUE_TENSION_PROJECTS);
    const visible = this.#bundleRedactor(viewer);
    const found = new Map();
    let cut = false;
    for (const project of scope.projects) {
      let after = null;
      for (let page = 0; ; page += 1) {
        if (page === QueueProducers.QUEUE_CONTRADICTION_PAGES) { cut = true; break; }
        const r = this.#caseTensions.caseTensions({ project, after });
        if (!r || r.ok !== true || !Array.isArray(r.cases)) break;
        for (const c of r.cases) {
          for (const t of (c && Array.isArray(c.tensions) ? c.tensions : [])) {
            if (!t || typeof t.candidate !== "string" || !t.candidate) continue;
            const key = `${c.case}::${t.candidate}`;
            const e = found.get(key) || { c, t, project, members: [] };
            if (visible(t.member) !== null && typeof t.member === "string" && !e.members.includes(t.member))
              e.members.push(t.member);
            found.set(key, e);
          }
        }
        if (!r.cursor) break;
        after = r.cursor;
      }
    }
    const out = [];
    for (const [key, { c, t, project, members }] of [...found.entries()].sort()) {
      if (members.length === 0) continue;           // R11: a case whose members this viewer cannot see names nothing
      out.push({
        id: `FINDING::tension-after-publication::${key}`,
        class: "FINDING",
        kind: "tension-after-publication",
        case: this.#homesAt([project], viewer),
        subject: { kind: "case", id: c.case, edition: c.edition ?? null, project, candidate: t.candidate,
                   bundles: members.slice(0, QueueProducers.QUEUE_OPTION_SUBJECTS_MAX) },
        summary: word("queue-producers.summary.finding_case_published", { case: String(c.case), edition: String(c.edition ?? "") }).trim(),
        detail: localize("queue-producers.index.a_contradiction_on_what_this", "a contradiction on what this published case's findings rest on, one level deep, was found after its latest edition and is not disclosed there. The signed edition does not change: a later edition discloses or resolves it."),
        basis: { source: "case-tensions.caseTensions", case: c.case, edition: c.edition ?? null, project,
                 candidate: t.candidate, state: t.state ?? null, members, depth: t.depth ?? 1,
                 ...(t.unseen_other_side ? { unseen_other_side: true, side: t.side ?? null }
                                         : { a: t.a ?? null, b: t.b ?? null }),
                 ...(Array.isArray(c.unread) && c.unread.length ? { unread: c.unread } : {}),
                 bound: { projects_bound: scope.bound, projects_truncated: scope.truncated === true,
                          pages_bound: QueueProducers.QUEUE_CONTRADICTION_PAGES, pages_truncated: cut },
                 detail: localize("queue-producers.index.a_tension_after_publication_is", "a tension after publication is case-tensions' (its R4, was publication R50), read under the owning project's owners' sight: a side any owner may not see is answered unseen, with nothing of it. It is told to the project's owners and to nobody else, and it composes no strength.") },
        age: { state: "undetermined", reason: "derived_on_read",
               detail: "a tension is derived at read time from the edition and the candidates; it has no creation instant" },
        assignee: null,
        assignee_role: null,
        options: this.#optionsOf(members),
      });
    }
    return out;
  }

  /** `contradiction-duty-unseen` and `contradiction-plurality-unseen` (R7; DEC-85, K456): for each project of R4's
   *  scope, one item per notice `contradiction.conflictNotices({project})` answers (its R50), counted once whatever
   *  number of the member's projects it reaches. Its only subject is the side the member may see, so its homes are
   *  walked from that side alone. It carries the notice's fixed sentence, `asked_by_another`, each of the member's party
   *  projects with its opt-in, the parties once revealed, and the relay; and no count, bound or flag of its own, since
   *  any would say something of the other side or of how many parties there are (R11). A caller with no member is no
   *  project's joined participant and is told nothing (contradiction R50's refusal). */
  #contradictionUnseenItems(me, scope, viewer) {
    if (!me) return [];
    const found = new Map();
    for (const project of scope.projects) {
      let after = null;
      for (let page = 0; page < QueueProducers.QUEUE_CONTRADICTION_PAGES; page += 1) {
        const r = this.#contradiction.conflictNotices({ project, after, viewer });
        if (!r || r.ok !== true || !Array.isArray(r.notices)) break;
        for (const n of r.notices) {
          if (!n || typeof n.candidate !== "string" || (n.weight !== "duty" && n.weight !== "plurality")) continue;
          const e = found.get(n.candidate) || { n, parties: [] };
          if (!e.parties.some((p) => p.project === n.project))
            e.parties.push({ project: n.project, opted_in: n.opted_in ?? null, asked_by_another: n.asked_by_another === true,
                             revealed: n.revealed === true, ...(n.revealed === true ? { parties: n.parties ?? [] } : {}),
                             responses: Array.isArray(n.responses) ? n.responses : [],
                             ...(n.reveal_undetermined ? { reveal_undetermined: true, reveal_why: n.reveal_why ?? null } : {}) });
          found.set(n.candidate, e);
        }
        if (!r.truncated || !r.cursor) break;
        after = r.cursor;
      }
    }
    const out = [];
    for (const [candidate, { n, parties }] of [...found.entries()].sort()) {
      const duty = n.weight === "duty";
      const cls = duty ? "OBLIGATION" : "FINDING";
      const subjects = QueueProducers.#sideSubjects(n.side);
      const responses = [];
      for (const p of parties)
        for (const x of p.responses)
          if (!responses.some((y) => y.response === x.response)) responses.push(x);
      out.push({
        id: `${cls}::contradiction-unseen::${candidate}`,
        class: cls,
        kind: duty ? "contradiction-duty-unseen" : "contradiction-plurality-unseen",
        case: this.#homesAt(subjects, viewer),
        /* R8 (K558): the member's projects that hold R50's notice, each with its opt-in. */
        subject: { kind: "contradiction_notice", id: candidate,
                   parties: parties.map((p) => ({ project: p.project, opted_in: p.opted_in ?? null })) },
        summary: duty ? word("queue-producers.summary.something_project_rests")
                      : word("queue-producers.summary.project_conclusion_hold"),
        detail: n.says ?? null,
        basis: { source: "contradiction.conflictNotices", candidate, weight: n.weight, state: n.state ?? null,
                 side: n.side ?? null, says: n.says ?? null,
                 asked_by_another: parties.some((p) => p.asked_by_another),
                 projects: parties, responses,
                 detail: localize("queue-producers.index.a_notice_is_contradictions_its", "a notice is contradiction's (its R50): it names the side this project rests on and nothing of the other, nor who holds it, nor how many do. Your project can ask to resolve it; when every project holding a side has asked, the projects are named to each other and each can respond, sharing only what its responder chose.") },
        age: { state: "undetermined", reason: "derived_on_read",
               detail: "a notice is derived at read time and carries no instant of its own" },
        assignee: null,
        assignee_role: null,
        options: this.#optionsOf(subjects),
      });
    }
    return out;
  }

  /* ======================================================================
   * N375 · R14 — A MEMBER'S OWN SIGNING KEY, TOLD TO EVERY ADMINISTRATOR (credentials R9, was membership R89).
   * ====================================================================== */

  /** R14: the act an administrator takes on a self-registered key, credentials R7's revoke (`op=signerset`). */
  static SIGNER_REVOKE = Object.freeze({ id: "signerset", label: word("queue-producers.label.revoke_signing_key"), weight: "single" });

  /** `signer-self-registered` (R14; credentials R8, R9; N375): for an administrator member (membership R64), or the
   *  `admin` machine credential as export-performed's reader is, one OBLIGATION per key `credentials.signerList`
   *  answers `active` with `origin: "self"`, naming the key's comment and its member, aged from its `added` instant, and
   *  offering credentials R7's revoke. Every other reader gets none, and not a count. It leaves when the key is no longer
   *  `active`: the list is read at every read, so nothing is stored to clear. */
  #obligationsSignerSelfRegistered(me, viewer, now) {
    const admin = me ? this.#isAdminMember(me) : viewer === `${MACHINE_CLASS_PREFIX}admin`;
    if (!admin) return [];
    const list = this.#credentials.signerList();
    const keys = (list && Array.isArray(list.signers) ? list.signers : [])
      .filter((k) => k && k.status === "active" && k.origin === "self" && typeof k.key_b64 === "string" && k.key_b64);
    if (keys.length === 0) return [];
    const raisedTo = this.#activeAdmins();
    const homes = this.#homesOf([]);
    return keys.map((k) => {
      const addedMs = Date.parse(k.added ?? "");
      const member = k.registered_by && k.registered_by !== "not recorded" ? k.registered_by : k.member_id;
      return {
        id: `OBLIGATION::signer-self-registered::${k.key_b64}`,
        class: "OBLIGATION",
        kind: "signer-self-registered",
        case: homes,
        subject: { kind: "signer_key", id: k.key_b64, member: k.member_id ?? null, comment: k.comment ?? null,
                   registered_by: member ?? null },
        summary: word("queue-producers.summary.registered_signing_key", { member: String(member || "a member"), comment: String(k.comment ? `: ${k.comment}` : "") }),
        detail: localize("queue-producers.index.a_member_registered_their_own", "a member registered their own browser-held signing key from a signed-in session, and it is active. Every administrator is told; an administrator may revoke it. Nothing here changes the key."),
        basis: { source: "credentials.signerList", key: k.key_b64, member: k.member_id ?? null, comment: k.comment ?? null,
                 registered_by: member ?? null, origin: "self", status: k.status, added: k.added ?? null,
                 attests: k.attests === true, raised_to: raisedTo,
                 detail: localize("queue-producers.index.the_key_is_credentials_own", "the key is credentials' own row (its R8), registered by its member (its R9) and read here at every read: it is told to every administrator and to nobody else, and it leaves when the key is no longer active, by an administrator's revoke (its R7) or otherwise.") },
        age: Number.isFinite(addedMs)
          ? { state: "determined", since: k.added, ms: Math.max(0, now - addedMs) }
          : { state: "undetermined", reason: "unparseable_added",
              detail: "the key's row carries an added stamp this producer cannot read as an instant" },
        assignee: null,
        assignee_role: null,
        options: [QueueProducers.SIGNER_REVOKE],
      };
    });
  }

  /* ======================================================================
   * DEC-102 item 3 · R23 — THE CREDIT LEVEL A MEMBER HAS NOT CHOSEN (publication R2, R17, R56; provenance R48; K1019, K1105).
   * ====================================================================== */

  /** R23: how many prepared, unsigned case editions one read asks about, and the act that answers the item (publication
   *  R17, `op=attribute`: the observation's author chooses the level, with a reason). */
  static QUEUE_PREPARED_EDITIONS_MAX = 200;
  static ATTRIBUTE_CHOOSE = Object.freeze({ id: "attribute", label: word("queue-producers.label.choose_how_case"), weight: "single" });

  /** `attribution-unchosen` (R23; DEC-102 item 3): one OBLIGATION per (case edition, observation) where a prepared,
   *  unsigned case edition reaches an observation the member authored and no credit level is in force for it, to that
   *  member and to nobody else. The editions are listed from `case_documents` (publication R56's read contract:
   *  `sig_armored` null is authored and unsigned), the latest unsigned edition of each case only, since a later edition
   *  replaces an earlier preparation; each is asked of `publication.caseDocumentFacts` under the viewer, whose standing
   *  fence (publication R1) answers nothing to a viewer without standing in the case. Its attribution facts (R17) name
   *  each reached observation and the level in force, null when none can be published; the observation's author is
   *  `register`'s (`authored = 1`, `author`; provenance R48), never publication's. Nothing names the author to anyone
   *  else: the item is the author's alone and carries no count. It leaves when the member chooses a level, or the
   *  edition no longer reaches the observation, or it is signed or replaced (the reads no longer answer it); raised
   *  once (DEC-69, DEC-94). Its age runs from the edition's preparation (`authored_at`). */
  #obligationsAttributionUnchosen(me, viewer, now) {
    if (!me) return [];
    const cap = QueueProducers.QUEUE_PREPARED_EDITIONS_MAX;
    /* A store publication has not migrated holds no case document (the plane migrates it with every module; a caller's
       test world may not), so it prepares none: asked, never thrown over. */
    if (!this.#one(`SELECT 1 AS x FROM sqlite_master WHERE type='table' AND name='case_documents'`)) return [];
    const rows = this.#rows(
      `SELECT cd.case_id, cd.edition, cd.authored_at FROM case_documents cd
        WHERE cd.sig_armored IS NULL
          AND NOT EXISTS (SELECT 1 FROM case_documents later WHERE later.case_id = cd.case_id AND later.edition > cd.edition)
        ORDER BY cd.case_id, cd.edition LIMIT ?`, cap + 1);
    const truncated = rows.length > cap;
    const authorOf = new Map();
    const authored = (obs) => {
      if (!authorOf.has(obs))
        authorOf.set(obs, (this.#one(`SELECT r.author FROM register r WHERE r.bundle_id=? AND r.authored=1 LIMIT 1`, obs) || {}).author ?? null);
      return authorOf.get(obs);
    };
    const out = [];
    for (const e of rows.slice(0, cap)) {
      const facts = this.#publication.caseDocumentFacts(e.case_id, Number(e.edition), viewer);
      if (!facts || facts.ok !== true || !facts.doc || facts.doc.sig_armored) continue;
      const current = facts.attribution && Array.isArray(facts.attribution.current) ? facts.attribution.current : [];
      for (const row of current) {
        const obs = row && typeof row.observation === "string" ? row.observation : "";
        if (!obs || row.level || authored(obs) !== me) continue;
        const preparedMs = Date.parse(e.authored_at ?? "");
        const title = this.#record.bundleInfo(obs);
        const name = title && title.title ? title.title : obs;
        out.push({
          id: `OBLIGATION::attribution-unchosen::${e.case_id}@${e.edition}::${obs}`,
          class: "OBLIGATION",
          kind: "attribution-unchosen",
          case: this.#homesOf([obs]),
          subject: { kind: "case_edition", id: `${e.case_id}@${e.edition}`, case: e.case_id, edition: Number(e.edition),
                     observation: obs },
          summary: word("queue-producers.summary.case_prepared_uses", { case_id: String(e.case_id), name: String(name) }),
          detail: localize("queue-producers.index.edition_edition_of_this_case", "edition {edition} of this case reaches what you observed, and you have chosen no level for how it shows who said it: the team, the project, your cover or your name. Nothing is published until it is signed, and nobody else is told you are its author. This is told once; it leaves when you choose, or the edition no longer uses it, or it is signed or replaced.", { edition: String(e.edition) }),
          basis: { source: "publication.caseDocumentFacts + case_documents + register", case: e.case_id,
                   edition: Number(e.edition), observation: obs, prepared_at: e.authored_at ?? null,
                   level: null, why: row.why ?? null, recipients_rule: "author",
                   bound: { editions_limit: cap, truncated },
                   detail: localize("queue-producers.index.the_edition_is_publications_prepared", "the edition is publication's prepared, unsigned case document (its R56), its attribution facts its own (its R2, R17); the observation's author is the register's (provenance R48). Only the author chooses the level (DEC-102 item 3), so only the author is told.") },
          age: Number.isFinite(preparedMs)
            ? { state: "determined", since: e.authored_at, ms: Math.max(0, now - preparedMs) }
            : { state: "undetermined", reason: "no_preparation_instant",
                detail: "the case document carries no instant this producer can read" },
          assignee: null,
          assignee_role: null,
          recipients: [me],
          options: [QueueProducers.ATTRIBUTE_CHOOSE],
        });
      }
    }
    return out;
  }

  /* ======================================================================
   * N520 · R30, R31 — THE DOCKET (docket R9; reevaluation R30; DEC-116 items 2, 3, 7).
   * Each reads the one fact its owning module offers, derived on read and writing nothing, so an item leaves on the
   * first read after the fact stops holding.
   * ====================================================================== */

  /** R30: the acts that answer a core item (docket R4, R7): placing it, and, for a submission, declining it. */
  static DOCKET_PREPARE = Object.freeze({ id: "docketprepare", label: word("queue-producers.label.place_case_docket"), weight: "single" });
  static DOCKET_DECLINE = Object.freeze({ id: "docketdecline", label: word("queue-producers.label.decline_containing_redactions"), weight: "single" });
  /** R30: how each core item is named to the manager (docket R9 (a)–(c)). */
  static DOCKET_CORE_WORDS = Object.freeze({ response: "a response", statement: "a statement",
                                              edition: "a newer edition", tension: word("queue-producers.tension") });
  /** R31: the item kind of each docket cause (reevaluation R30 (a), (b)). */
  static DOCKET_CAUSE_KINDS = Object.freeze({ withdrawal: "edition-withdrawn", contested: "edition-contested" });
  /** R31: the page `reevaluation.docketDependents` is read in (its R30's largest). */
  static QUEUE_DOCKET_PAGE = 200;

  /** The project a case belongs to, from publication's `cases` (its R40, a stated read contract); null when none. */
  #caseProject(caseId) {
    if (!this.#one(`SELECT 1 AS x FROM sqlite_master WHERE type='table' AND name='cases'`)) return null;
    const r = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, caseId);
    return r && typeof r.project_id === "string" && r.project_id ? r.project_id : null;
  }

  /** `docket-core-due` (R30; docket R9; DEC-116 item 2): one OBLIGATION per core item `docket.coreDue` answers the viewer,
   *  keyed by the case, the item's kind and its reference, to the case's manager (its project's owners, membership R65)
   *  and to nobody else: a caller with no member is none of them. Its subject the case, naming the item and its edition;
   *  offering placement and, for a submission (a response or a statement), the decline; aged from the item's `since`.
   *  It leaves when the item is done (the read no longer answers it); raised once (DEC-69, DEC-94). */
  #obligationsDocketCoreDue(me, viewer, now) {
    if (!me) return [];
    const r = this.#docket.coreDue({ viewer });
    const list = r && r.ok !== false && Array.isArray(r.items) ? r.items : [];
    const visible = this.#bundleRedactor(viewer);
    const owners = new Map();
    const out = [];
    for (const x of list) {
      if (!x || typeof x.case !== "string" || !x.case || typeof x.kind !== "string" || !x.kind
          || x.ref === undefined || x.ref === null || x.ref === "") continue;
      const project = this.#caseProject(x.case);
      if (!project || visible(project) === null) continue;
      if (!owners.has(project)) owners.set(project, this.#membership.projectOwners(project) || []);
      const managers = owners.get(project);
      if (!managers.includes(me)) continue;
      const what = QueueProducers.DOCKET_CORE_WORDS[x.kind] || `an item (${x.kind})`;
      const submission = x.kind === "response" || x.kind === "statement";
      const edition = Number.isInteger(Number(x.edition)) && x.edition !== null ? Number(x.edition) : null;
      const sinceMs = Date.parse(x.since ?? "");
      out.push({
        id: `OBLIGATION::docket-core-due::${x.case}::${x.kind}::${x.ref}`,
        class: "OBLIGATION",
        kind: "docket-core-due",
        case: this.#homesAt([project], viewer),
        subject: { kind: "case", id: x.case, project, item: x.kind, ref: String(x.ref), edition },
        summary: `case ${x.case}'s docket is missing ${what}${edition !== null ? ` on edition ${edition}` : ""}`,
        detail: localize("queue-producers.index.v1_this_is_a_to", "{v1} This is a to do for the case's managers; it is told once, and it leaves when the item is placed, declined, receipted or disclosed.", { v1: String(submission
          ? `${what[0].toUpperCase()}${what.slice(1)} filed on this case is not yet listed. List it whole, or decline it `
            + "for containing redactions, with a reason."
          : x.kind === "edition"
            ? `edition ${edition ?? ""} of this case was ratified with no entry on its docket quoting what changed. `
              + "Place that entry."
            : "a conflict found on a load-bearing finding of this case's latest edition is not disclosed on its docket. "
              + "Place the disclosure.") }),
        basis: { source: "docket.coreDue", case: x.case, project, item: x.kind, ref: String(x.ref), edition,
                 since: x.since ?? null, ...(x.what_changed !== undefined ? { what_changed: x.what_changed } : {}),
                 ...(x.state !== undefined ? { state: x.state } : {}), recipients_rule: "case_managers",
                 detail: "a core item still due is docket's fact (its R9), read here and never stored; the case's project "
                       + "is publication's (its R40). It goes to the case's managers, its project's owners, and to nobody "
                       + "else (DEC-116 item 2), and is raised once (DEC-69, DEC-94)." },
        age: Number.isFinite(sinceMs)
          ? { state: "determined", since: x.since, ms: Math.max(0, now - sinceMs) }
          : { state: "undetermined", reason: "no_due_instant",
              detail: "the item carries no instant this producer can read for when it fell due" },
        assignee: null,
        assignee_role: null,
        recipients: [...managers],
        options: submission ? [QueueProducers.DOCKET_PREPARE, QueueProducers.DOCKET_DECLINE] : [QueueProducers.DOCKET_PREPARE],
      });
    }
    return out;
  }

  /** `edition-withdrawn` and `edition-contested` (R31; reevaluation R30; DEC-116 items 3, 7): one FINDING per
   *  (dependent, entry) `reevaluation.docketDependents` answers the viewer (which withholds a hidden dependent and does
   *  not count it), keyed by the kind, the dependent and the entry the listing names (`<case>#<seq>` for a withdrawal;
   *  for a contesting entry, its record entry id), homed under the dependent and its ancestors. It leaves when the cause
   *  closes (a recorded re-evaluation, reevaluation R16), as R5's. */
  #findingsDocketDependents(viewer, now) {
    const out = [];
    let after = null, cut = false, flags = {};
    for (let page = 0; ; page += 1) {
      if (page === QueueProducers.QUEUE_CONTRADICTION_PAGES) { cut = true; break; }
      const r = this.#reevaluation.docketDependents({ after, limit: QueueProducers.QUEUE_DOCKET_PAGE, viewer });
      if (!r || r.ok !== true || !Array.isArray(r.entries)) break;
      if (r.docket_absent) flags = { ...flags, docket_absent: true };
      if (r.docket_read === false) flags = { ...flags, docket_read: false };
      for (const e of r.entries) {
        const kind = e ? QueueProducers.DOCKET_CAUSE_KINDS[e.kind] : null;
        if (!kind || typeof e.dependent !== "string" || !e.dependent || typeof e.entry !== "string" || !e.entry) continue;
        const title = this.#record.bundleInfo(e.dependent);
        const name = title && title.title ? title.title : e.dependent;
        const withdrawn = kind === "edition-withdrawn";
        const editions = withdrawn
          ? (Array.isArray(e.withdrawn_editions) ? e.withdrawn_editions : [])
          : (e.edition !== undefined && e.edition !== null ? [e.edition] : []);
        const cs = typeof e.case === "string" && e.case ? `case ${e.case}` : "a case";
        const sinceMs = Date.parse(e.since ?? "");
        out.push({
          id: `FINDING::${kind}::${e.dependent}::${e.entry}`,
          class: "FINDING",
          kind,
          case: this.#homesAt([e.dependent], viewer),
          subject: { kind: "bundle", id: e.dependent, case: e.case ?? null, entry: e.entry, editions },
          summary: withdrawn
            ? word("queue-producers.summary.something_rests_case", { name: String(name) })
            : word("queue-producers.summary.response_docket_contests", { cs: String(cs), name: String(name) }),
          detail: localize("queue-producers.index.v1_whether_this_still_stands", "{v1} Whether this still stands is the members' to decide; a recorded re-evaluation closes this.", { v1: String(withdrawn
            ? `${cs}${editions.length ? ` (${editions.length === 1 ? "edition" : "editions"} ${editions.join(", ")})` : ""} `
              + "was withdrawn on its docket. The edition keeps answering as it was signed, and nothing resting on it moved."
            : `a response filed on the docket of ${cs} contests ${editions.length ? `edition ${editions[0]}` : "an edition"}, `
              + "of which this is a finding. Nothing moved, and no docket entry is evidence.") }),
          basis: { source: "reevaluation.docketDependents", dependent: e.dependent, entry: e.entry, cause: e.kind,
                   case: e.case ?? null, editions, since: e.since ?? null, legs: Array.isArray(e.legs) ? e.legs : [],
                   cause_detail: e.detail ?? null, ...flags,
                   bound: { limit: QueueProducers.QUEUE_DOCKET_PAGE, pages_bound: QueueProducers.QUEUE_CONTRADICTION_PAGES,
                            truncated: cut },
                   detail: localize("queue-producers.index.the_cause_is_reevaluations_its", "the cause is reevaluation's (its R30): a live leg of this finding rests on a member finding of a withdrawn case edition, or this finding is a member of an edition a filed response contests. It is read here, never raised, and nothing was regraded.") },
          age: Number.isFinite(sinceMs)
            ? { state: "determined", since: e.since, ms: Math.max(0, now - sinceMs) }
            : { state: "undetermined", reason: "no_cause_instant",
                detail: "the cause carries no instant this producer can read" },
          assignee: null,
          assignee_role: null,
          options: this.#optionsOf([e.dependent]),
        });
      }
      if (!r.truncated || !r.cursor) break;
      after = r.cursor;
    }
    if (cut) for (const it of out) it.basis.bound.truncated = true;
    return out;
  }

  /* ======================================================================
   * N534 · R34, R35 — WATCHED CASES AT THEIR PUBLISHERS (reevaluation R33; case-import R20; DEC-101 (3), DEC-116 item 8).
   * Each reads the one fact its owning module offers, derived on read and writing nothing, so an item leaves on the first
   * read after the fact stops holding. Only a publisher move (a verified `edition` or `withdrawal` entry) is a cause of
   * re-evaluation (R34); every verified entry, a move or not, reaches only the member who set the watch (R35; K1339,
   * K1366 F1).
   * ====================================================================== */

  /** R34: the item kind of each publisher move (reevaluation R33 (a), (b)), and the page its listing is read in (its
   *  largest). */
  static CITED_MOVE_KINDS = Object.freeze({ edition: "cited-newer-edition", withdrawal: "cited-edition-withdrawn" });
  static QUEUE_CITED_PAGE = 200;
  /** R35: the acts a watch's item offers (case-import R4, R17): reading the imported case with its docket entries, and,
   *  for an unreadable docket, setting the watch's address again or ending the watch. */
  static IMPORT_READ = Object.freeze({ id: "importedcase", label: word("queue-producers.label.read_imported_case"), weight: "single" });
  static IMPORT_REWATCH = Object.freeze({ id: "importwatch", label: word("queue-producers.label.set_publisher_address"), weight: "single" });
  static IMPORT_UNWATCH = Object.freeze({ id: "importunwatch", label: word("queue-producers.label.stop_following_case"), weight: "single" });

  /** The sentence naming another group's case, as far as the viewer is told it (reevaluation R33 states the group and
   *  case only where the viewer sees the imported reference). */
  static #citedCaseWords(group, cs) {
    return `${cs ? `case ${cs}` : "a case"}${group ? ` of the team ${group}` : " of another team"}`;
  }

  /** What one entry seen at a publisher's docket says, quoted: a move's `what_changed` or `reason`, and its signing key
   *  and take-back as R34 and R35 state them. */
  static #entryWords(e) {
    const quoted = e.kind === "edition" && typeof e.what_changed === "string" && e.what_changed
      ? localize("queue-producers.index.what_changed_in_its_publishers", " What changed, in its publisher's words: \"{what_changed}\".", { what_changed: String(e.what_changed) })
      : e.kind === "withdrawal" && typeof e.reason === "string" && e.reason
        ? localize("queue-producers.index.the_reason_in_its_publishers", " The reason, in its publisher's words: \"{reason}\".", { reason: String(e.reason) }) : "";
    const key = e.key_listed === false
      ? localize("queue-producers.index.the_entrys_signing_key_is", " The entry's signing key is not among the keys the imported case file lists.") : "";
    const back = e.taken_back && typeof e.taken_back === "object"
      ? localize("queue-producers.index.the_publisher_has_since_taken", " The publisher has since taken this entry back (entry {v1}{v2}).", { v1: String(e.taken_back.seq ?? "unnumbered"), v2: String(e.taken_back.date ? `, dated ${e.taken_back.date}` : "") }) : "";
    return `${quoted}${key}${back}`;
  }

  /** `cited-newer-edition` and `cited-edition-withdrawn` (R34; reevaluation R33; DEC-101 (3)): one FINDING per
   *  (dependent, move) `reevaluation.citedCaseDependents` answers the viewer (which withholds a hidden dependent and does
   *  not count it), by the move's kind, keyed `FINDING::<kind>::<dependent>::<import>#<seq>`, homed under the dependent
   *  and its ancestors. Its detail names the group, the case, the cited edition, the edition the move names, and quotes
   *  `what_changed` or `reason`; it says when the entry's signing key is not among the keys the imported case file lists,
   *  and when the move was taken back (the cause still stands). It leaves when the cause closes (a recorded
   *  re-evaluation, reevaluation R16), as R31's. */
  #findingsCitedCaseMoved(viewer, now) {
    const out = [];
    const seen = new Set();
    let after = null, cut = false, flags = {};
    for (let page = 0; ; page += 1) {
      if (page === QueueProducers.QUEUE_CONTRADICTION_PAGES) { cut = true; break; }
      const r = this.#reevaluation.citedCaseDependents({ after, limit: QueueProducers.QUEUE_CITED_PAGE, viewer });
      if (!r || r.ok !== true || !Array.isArray(r.entries)) break;
      if (r.accepted_work_absent) flags = { ...flags, accepted_work_absent: true };
      if (r.accepted_work_unreadable) flags = { ...flags, accepted_work_unreadable: true };
      for (const e of r.entries) {
        const kind = e ? QueueProducers.CITED_MOVE_KINDS[e.kind] : null;
        if (!kind || typeof e.dependent !== "string" || !e.dependent || typeof e.import !== "string" || !e.import
            || !Number.isInteger(Number(e.seq)) || e.seq === null || e.seq === "") continue;
        const id = `FINDING::${kind}::${e.dependent}::${e.import}#${Number(e.seq)}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const title = this.#record.bundleInfo(e.dependent);
        const name = title && title.title ? title.title : e.dependent;
        const legs = Array.isArray(e.legs) ? e.legs : [];
        const cited = [...new Set(legs.map((l) => l && l.cited_edition).filter((x) => x !== undefined && x !== null))]
          .sort((a, b) => Number(a) - Number(b));
        const edition = e.edition === "all" ? "all" : e.edition === undefined || e.edition === null ? null : Number(e.edition);
        const withdrawn = kind === "cited-edition-withdrawn";
        const whose = QueueProducers.#citedCaseWords(e.group ?? null, e.case ?? null);
        const citedWords = cited.length ? `${cited.length === 1 ? "edition" : "editions"} ${cited.join(", ")}` : "an edition";
        const sinceMs = Date.parse(e.since ?? "");
        out.push({
          id,
          class: "FINDING",
          kind,
          case: this.#homesAt([e.dependent], viewer),
          subject: { kind: "bundle", id: e.dependent, import: e.import, group: e.group ?? null, case: e.case ?? null,
                     move: e.move ?? null, seq: Number(e.seq), cited_editions: cited, edition },
          summary: withdrawn
            ? `${name} cites ${citedWords} of ${whose}, which its publisher has withdrawn`
            : `${name} cites ${citedWords} of ${whose}, and its publisher has published edition ${edition ?? "a later one"}`,
          detail: localize("queue-producers.index.v1_the_cited_edition_keeps", "{v1} The cited edition keeps answering as it was signed, and nothing here moved or was regraded. Whether this still stands is the members' to decide; a recorded re-evaluation closes this.", { v1: String((withdrawn
            ? `The publisher's docket for ${whose} withdrew ${edition === "all" ? "every edition" : `edition ${edition ?? ""}`.trim()}`
              + `${e.date ? ` on ${e.date}` : ""}; what this rests on cites ${citedWords}.`
            : `The publisher's docket for ${whose} lists edition ${edition ?? "(unnumbered)"}${e.date ? `, dated ${e.date}` : ""}; `
              + `what this rests on cites ${citedWords}.`)
            + QueueProducers.#entryWords(e)) }),
          basis: { source: "reevaluation.citedCaseDependents", dependent: e.dependent, move: e.move ?? null, import: e.import,
                   group: e.group ?? null, case: e.case ?? null, move_kind: e.kind, edition, seq: Number(e.seq),
                   date: e.date ?? null, since: e.since ?? null,
                   ...(e.kind === "edition" ? { what_changed: e.what_changed ?? null } : { reason: e.reason ?? null }),
                   key_listed: typeof e.key_listed === "boolean" ? e.key_listed : null, taken_back: e.taken_back ?? null,
                   cited_editions: cited, legs, cause_detail: e.detail ?? null, ...flags,
                   bound: { limit: QueueProducers.QUEUE_CITED_PAGE, pages_bound: QueueProducers.QUEUE_CONTRADICTION_PAGES,
                            truncated: cut },
                   detail: localize("queue-producers.index.the_cause_is_reevaluations_its_2", "the cause is reevaluation's (its R33): a live leg of this finding rests on another team's finding at an edition whose publisher has since listed a later edition or withdrawn it on its docket, a verified entry your team's Civicsmith read. It is read here, never raised, and nothing was regraded.") },
          age: Number.isFinite(sinceMs)
            ? { state: "determined", since: e.since, ms: Math.max(0, now - sinceMs) }
            : { state: "undetermined", reason: "no_cause_instant",
                detail: "the cause carries no instant this producer can read" },
          assignee: null,
          assignee_role: null,
          options: this.#optionsOf([e.dependent]),
        });
      }
      if (!r.truncated || !r.cursor) break;
      after = r.cursor;
    }
    if (cut) for (const it of out) it.basis.bound.truncated = true;
    return out;
  }

  /** Who a watch's items go to (R35): the member who set the watch in force, while an active member (membership R68's
   *  status); else the administrators (membership R86); with the rule that chose them. */
  #watchRecipients(setBy) {
    const who = typeof setBy === "string" ? setBy.trim() : "";
    const facts = who ? this.#membership.memberFacts(who) : null;
    if (facts && facts.status === "active") return { rule: "watch_setter", members: [who] };
    return { rule: "administrators", members: this.#activeAdmins() };
  }

  /** `followed-case-entry`, `cited-docket-entry-refused` and `cited-docket-unreadable` (R35; case-import R20; DEC-101 (3),
   *  DEC-116 item 8): what `case-import.watchItems` answers the viewer, each to the member who set the watch, else (that
   *  member no longer active) the administrators, and to nobody else: a caller with no member is none of them. Each
   *  item's subject is the import, and it has no project home. A verified entry that is not
   *  a publisher move reaches only them here, and never as a cause of re-evaluation (R34 reads moves alone).
   *  - one FINDING per verified entry seen, keyed `FINDING::followed-case-entry::<import>#<seq>`, naming its kind,
   *    edition, date and `key_listed`, and quoting a move's `what_changed` or `reason`;
   *  - one FINDING per refused entry, keyed `FINDING::cited-docket-entry-refused::<import>#<seq>`, naming the check
   *    failed (refused copies of one `seq` are one item, naming every check, aged from the first copy read; a refused
   *    entry with no readable `seq` is keyed `<import>#unnumbered`);
   *  - each finding ages from the instant this copy read its entry (`seen_at`; N546);
   *  - one CONDITION per watch in force whose latest read is unreadable, keyed `CONDITION::cited-docket-unreadable::<import>`,
   *    its detail opening with DOCKET_UNREADABLE's sentence (docket R15) and giving the reason and the instant, aged from
   *    it; it leaves when a read succeeds or the watch ends.
   *  The findings are raised once and leave when their recipient disposes of them (queue's mint). */
  #watchItems(me, viewer, now) {
    if (!me) return [];
    const r = this.#caseImport.watchItems({ viewer });
    if (!r || typeof r !== "object") return [];
    const recipients = new Map();
    const to = (setBy) => {
      const k = typeof setBy === "string" ? setBy : "";
      if (!recipients.has(k)) recipients.set(k, this.#watchRecipients(setBy));
      return recipients.get(k);
    };
    const complete = r.complete === false ? { complete: false } : {};
    const subjectOf = (x) => ({ kind: "import", id: x.import, group: x.group ?? null, case: x.case ?? null });
    const whose = (x) => QueueProducers.#citedCaseWords(x.group ?? null, x.case ?? null);
    const out = [];
    const findings = new Map();
    for (const e of Array.isArray(r.entries) ? r.entries : []) {
      if (!e || typeof e.import !== "string" || !e.import || !Number.isInteger(e.seq)) continue;
      const rec = to(e.set_by);
      if (!rec.members.includes(me)) continue;
      const id = `FINDING::followed-case-entry::${e.import}#${e.seq}`;
      if (findings.has(id)) continue;
      const edition = e.edition === "all" ? "all" : e.edition === undefined || e.edition === null ? null : Number(e.edition);
      const kindWords = e.kind === "edition" ? `edition ${edition ?? "(unnumbered)"}`
        : e.kind === "withdrawal" ? word("queue-producers.text.withdrawal", { unnumbered: String(edition === "all" ? "every edition" : `edition ${edition ?? "(unnumbered)"}`) })
          : word("queue-producers.text.entry_kind", { unstated: String(e.kind || "(unstated)"), edition: String(edition !== null ? ` on edition ${edition}` : "") });
      const it = {
        id,
        class: "FINDING",
        kind: "followed-case-entry",
        case: this.#homesOf([]),
        subject: subjectOf(e),
        summary: word("queue-producers.summary.publisher_docket_follow", { e: String(whose(e)), kind_words: String(kindWords) }),
        detail: localize("queue-producers.index.entry_seq_of_the_docket", "Entry {seq} of the docket, {kindWords}{v1}, was read and verified by your team's Civicsmith. Its signing key {v2} among the keys the imported case file lists.{entryWords}{v3} This is told once.", { seq: String(e.seq), kindWords: String(kindWords), v1: String(e.date ? `, dated ${e.date}` : ""), v2: String(e.key_listed === false ? "is not" : "is"), entryWords: String(QueueProducers.#entryWords({ ...e, key_listed: null })), v3: String(e.move ? " Anything here resting on an edition it moves is told to its own members as well."
                        : " It is not a new edition or a withdrawal, so nothing resting on the case is re-evaluated for it.") }),
        basis: { source: "case-import.watchItems", import: e.import, group: e.group ?? null, case: e.case ?? null,
                 seq: e.seq, entry_kind: e.kind ?? null, edition, date: e.date ?? null,
                 key_listed: typeof e.key_listed === "boolean" ? e.key_listed : null, move: e.move === true,
                 ...(e.kind === "edition" ? { what_changed: e.what_changed ?? null } : {}),
                 ...(e.kind === "withdrawal" ? { reason: e.reason ?? null } : {}),
                 taken_back: e.taken_back ?? null, seen_at: e.seen_at ?? null, set_by: e.set_by ?? null,
                 recipients_rule: rec.rule, ...complete,
                 detail: localize("queue-producers.index.a_verified_entry_of_a", "a verified entry of a followed case's docket is case-import's (its R18, R20), read here and never stored. It goes to the member who set the watch, else the administrators, and to nobody else; only a new edition or a withdrawal is a cause of re-evaluation (K1339, K1366).") },
        age: QueueProducers.#seenAge(e.seen_at, now),
        assignee: null,
        assignee_role: null,
        recipients: [...rec.members],
        options: [QueueProducers.IMPORT_READ],
      };
      findings.set(id, it);
      out.push(it);
    }
    for (const e of Array.isArray(r.refused) ? r.refused : []) {
      if (!e || typeof e.import !== "string" || !e.import) continue;
      const rec = to(e.set_by);
      if (!rec.members.includes(me)) continue;
      const seq = Number.isInteger(e.seq) ? e.seq : null;
      const id = `FINDING::cited-docket-entry-refused::${e.import}#${seq === null ? "unnumbered" : seq}`;
      const failed = typeof e.failed === "string" && e.failed ? e.failed : "an undetermined check";
      const held = findings.get(id);
      if (held) {
        if (!held.basis.failed.includes(failed)) {
          held.basis.failed.push(failed);
          held.detail = QueueProducers.#refusedWords(e, seq, held.basis.failed);
        }
        /* one item for every refused copy of this entry: it ages from the first of them this copy read */
        const age = QueueProducers.#seenAge(e.seen_at, now);
        if (age.state === "determined" && (held.age.state !== "determined" || Date.parse(age.since) < Date.parse(held.age.since))) {
          held.age = age;
          held.basis.seen_at = age.since;
        }
        continue;
      }
      const it = {
        id,
        class: "FINDING",
        kind: "cited-docket-entry-refused",
        case: this.#homesOf([]),
        subject: subjectOf(e),
        summary: word("queue-producers.summary.entry_publisher_docket", { e: String(whose(e)) }),
        detail: QueueProducers.#refusedWords(e, seq, [failed]),
        basis: { source: "case-import.watchItems", import: e.import, group: e.group ?? null, case: e.case ?? null, seq,
                 failed: [failed], entry_detail: e.detail ?? null, seen_at: e.seen_at ?? null, set_by: e.set_by ?? null,
                 recipients_rule: rec.rule,
                 ...complete,
                 detail: localize("queue-producers.index.a_refused_entry_is_case", "a refused entry is case-import's (its R18, R20): an entry of the followed case's docket that failed a check, recorded and never a move. It goes to the member who set the watch, else the administrators, and to nobody else.") },
        age: QueueProducers.#seenAge(e.seen_at, now),
        assignee: null,
        assignee_role: null,
        recipients: [...rec.members],
        options: [QueueProducers.IMPORT_READ],
      };
      findings.set(id, it);
      out.push(it);
    }
    for (const u of Array.isArray(r.unreadable) ? r.unreadable : []) {
      if (!u || typeof u.import !== "string" || !u.import) continue;
      const rec = to(u.set_by);
      if (!rec.members.includes(me)) continue;
      const id = `CONDITION::cited-docket-unreadable::${u.import}`;
      if (findings.has(id)) continue;
      const atMs = Date.parse(u.at ?? "");
      const it = {
        id,
        class: "CONDITION",
        kind: "cited-docket-unreadable",
        case: this.#homesOf([]),
        subject: subjectOf(u),
        summary: word("queue-producers.summary.follow", { docket_unreadable: String(DOCKET_UNREADABLE), u: String(whose(u)) }),
        detail: localize("queue-producers.index.docket_unreadable_v1_v2_this", "{DOCKET_UNREADABLE}{v1}{v2}. This says the read failed, never that nothing changed. It leaves when a read succeeds or the watch ends.", { DOCKET_UNREADABLE: String(DOCKET_UNREADABLE), v1: String(u.reason ? ` (${u.reason})` : ""), v2: String(u.at ? ` at ${u.at}` : "") }),
        basis: { source: "case-import.watchItems", import: u.import, group: u.group ?? null, case: u.case ?? null,
                 docket: u.docket ?? null, reason: u.reason ?? null, at: u.at ?? null, sentence: DOCKET_UNREADABLE,
                 set_by: u.set_by ?? null, recipients_rule: rec.rule, ...complete,
                 detail: "an unreadable docket is case-import's fact about this copy's latest read (its R18, R20), read "
                       + "here and never stored: a signal about our own reading, not about the publisher. It goes to the "
                       + "member who set the watch, else the administrators, and leaves on the first read after it stops "
                       + "holding." },
        age: Number.isFinite(atMs)
          ? { state: "determined", since: u.at, ms: Math.max(0, now - atMs) }
          : { state: "undetermined", reason: "no_read_instant",
              detail: "the read carries no instant this producer can read" },
        assignee: null,
        assignee_role: null,
        recipients: [...rec.members],
        options: [QueueProducers.IMPORT_REWATCH, QueueProducers.IMPORT_UNWATCH],
      };
      findings.set(id, it);
      out.push(it);
    }
    return out;
  }

  /** R35 (N546): an entry's item ages from the instant this copy read it, case-import R20's `seen_at` (the docket read
   *  that first recorded it), never the publisher's date nor this read's clock; undetermined when none can be read. */
  static #seenAge(seenAt, now) {
    const ms = typeof seenAt === "string" && seenAt ? Date.parse(seenAt) : NaN;
    return Number.isFinite(ms)
      ? { state: "determined", since: seenAt, ms: Math.max(0, now - ms) }
      : { state: "undetermined", reason: "no_seen_instant",
          detail: "the entry carries no instant this copy read it at that this producer can read" };
  }

  /** R35: the refused entry's sentence, naming every check its copies failed. */
  static #refusedWords(e, seq, failed) {
    return word("queue-producers.text.docket_read_refused", { seq: String(seq === null ? "An entry with no readable number" : `Entry ${seq}`), checks: String(failed.length === 1 ? "the check" : "the checks"), failed: String(failed.join(", ")) });
  }

  /* ======================================================================
   * N528 · R32, R33 — WIZARD SCRIPTS (wizard-scripts R7, R13, R17; DEC-121 (1), (5); K1397).
   * Each reads the one fact its owning module offers, derived on read and writing nothing.
   * ====================================================================== */

  /** R32: the item kinds of a break and a return (wizard-scripts R13); R33: the act that answers a submission (its R7). */
  static WIZARD_BREAK_KINDS = Object.freeze({ withdrawn: "wizard-withdrawn", restored: "wizard-restored" });
  static WIZARD_APPROVE = Object.freeze({ id: "wizardapprove", label: word("queue-producers.label.read_wizard_script"), weight: "single" });
  static WIZARD_READ = Object.freeze({ id: "wizardread", label: word("queue-producers.label.read_wizard_script_2"), weight: "single" });

  /** `wizard-withdrawn` and `wizard-restored` (R32; wizard-scripts R13; DEC-121 (5): "its owner is told why"): one FINDING
   *  per entry `wizard-scripts.brokenScripts` answers the viewer, keyed `FINDING::wizard-<kind>::<script>@<version>::<at>`,
   *  to the script's project owners (membership R65) and its version's author, and to nobody else; a group script's
   *  owners are the administrators (membership R86; K1397, as wizard-scripts R17's). Its subject the version, naming its
   *  name and, for a withdrawal, the first refusal by its row's translation. Homed under the script's project (none for a
   *  group script). Raised once: it leaves when its recipient disposes of it (queue's mint), never by anything here. */
  #findingsWizardBroken(me, viewer, now) {
    if (!me) return [];
    const page = this.#pages((after) => {
      const r = this.#wizardScripts.brokenScripts({ after, viewer });
      return r && Array.isArray(r.entries) ? { ...r, items: r.entries } : r;
    });
    const visible = this.#bundleRedactor(viewer);
    const owners = new Map();
    const out = [];
    for (const x of page.items) {
      const kind = x ? QueueProducers.WIZARD_BREAK_KINDS[x.kind] : null;
      if (!kind || typeof x.script !== "string" || !x.script || x.version === undefined || x.version === null
          || typeof x.at !== "string" || !x.at) continue;
      const project = typeof x.project === "string" && x.project ? x.project : null;
      if (project && visible(project) === null) continue;       // R11: a script of a project the viewer may not see
      const key = project || "";
      if (!owners.has(key)) owners.set(key, project ? (this.#membership.projectOwners(project) || []) : this.#activeAdmins());
      const author = typeof x.author === "string" && x.author && !x.author.startsWith(MACHINE_AUTHOR_PREFIX)
        && !x.author.startsWith(MACHINE_CLASS_PREFIX) ? x.author : null;
      const recipients = [...new Set([...owners.get(key), ...(author ? [author] : [])])];
      if (!recipients.includes(me)) continue;
      const version = `${x.script}@${x.version}`;
      const withdrawn = kind === "wizard-withdrawn";
      const refusal = withdrawn && x.refusal && typeof x.refusal === "object" ? x.refusal : null;
      const words = refusal && typeof refusal.translation === "string" && refusal.translation ? refusal.translation : null;
      const name = typeof x.name === "string" && x.name ? `"${x.name}"` : version;
      const atMs = Date.parse(x.at);
      out.push({
        id: `FINDING::${kind}::${version}::${x.at}`,
        class: "FINDING",
        kind,
        case: project ? this.#homesAt([project], viewer) : this.#homesOf([]),
        subject: { kind: "wizard_version", id: version, script: x.script, version: x.version, name: x.name ?? null, project,
                   ...(withdrawn ? { refusal: refusal ? { code: refusal.code ?? null, check: refusal.check ?? null, translation: words } : null } : {}) },
        summary: withdrawn
          ? word("queue-producers.summary.wizard_script_longer", { name: String(name) })
          : word("queue-producers.summary.wizard_script_matches", { name: String(name) }),
        detail: withdrawn
          ? localize("queue-producers.index.it_is_not_offered_to", "It is not offered to members while it fails its checks{v1}. A new version that passes them, approved as before, returns it. This is told once.", { v1: String(words ? `. The first thing it failed: ${words}` : "") })
          : localize("queue-producers.index.it_passed_its_checks_again", "It passed its checks again when your team's Civicsmith started, and members are offered it as before. This is told once."),
        basis: { source: "wizard-scripts.brokenScripts", script: x.script, version: x.version, name: x.name ?? null, project,
                 author, at: x.at, break_kind: x.kind, refusal, recipients_rule: project ? "project_owners_and_author" : "administrators_and_author",
                 bound: { pages_bound: QueueProducers.QUEUE_PAGES, truncated: page.truncated },
                 detail: localize("queue-producers.index.a_scripts_break_or_return", "a script's break or return is wizard-scripts' record (its R13), made when its checks are run again at start, read here and never stored. It goes to the script's project owners (for a team script, the administrators) and its version's author, once (DEC-69, DEC-70).") },
        age: Number.isFinite(atMs)
          ? { state: "determined", since: x.at, ms: Math.max(0, now - atMs) }
          : { state: "undetermined", reason: "no_break_instant", detail: "the record carries no instant this producer can read" },
        assignee: null,
        assignee_role: null,
        recipients,
        options: [QueueProducers.WIZARD_READ],
      });
    }
    return out;
  }

  /** `wizard-approval-requested` (R33; wizard-scripts R7, R17; DEC-121 (1)): one OBLIGATION per (version, owner)
   *  `wizard-scripts.submittedFor` answers the viewer, keyed `OBLIGATION::wizard-approval-requested::<script>@<version>::<owner>`,
   *  to that owner and to nobody else; its subject the version, naming its name and author, aged from the
   *  submission, homed under the script's project (none for a group script). It leaves when the version is approved,
   *  withdrawn or its script retired (the read no longer answers it); raised once (DEC-69, DEC-94). */
  #obligationsWizardApproval(me, viewer, now) {
    if (!me) return [];
    const page = this.#pages((after) => {
      const r = this.#wizardScripts.submittedFor({ after, viewer });
      return r && Array.isArray(r.entries) ? { ...r, items: r.entries } : r;
    });
    const visible = this.#bundleRedactor(viewer);
    const out = [];
    for (const x of page.items) {
      if (!x || typeof x.script !== "string" || !x.script || x.version === undefined || x.version === null
          || x.owner !== me) continue;
      const project = typeof x.project === "string" && x.project ? visible(x.project) : null;    // R11
      const version = `${x.script}@${x.version}`;
      const name = typeof x.name === "string" && x.name ? `"${x.name}"` : version;
      const atMs = Date.parse(x.submitted_at ?? "");
      out.push({
        id: `OBLIGATION::wizard-approval-requested::${version}::${x.owner}`,
        class: "OBLIGATION",
        kind: "wizard-approval-requested",
        case: project ? this.#homesAt([project], viewer) : this.#homesOf([]),
        subject: { kind: "wizard_version", id: version, script: x.script, version: x.version, name: x.name ?? null,
                   author: x.author ?? null, project },
        summary: `${x.author || "a member"} submitted the wizard script ${name} for your approval`,
        detail: localize("queue-producers.index.a_version_of_this_wizard", "A version of this wizard script was submitted, and you may approve it. Read its steps and approve it; this is told once, and it leaves when the version is approved or withdrawn, or the script retired."),
        basis: { source: "wizard-scripts.submittedFor", script: x.script, version: x.version, name: x.name ?? null,
                 author: x.author ?? null, owner: x.owner, project, submitted_at: x.submitted_at ?? null,
                 recipients_rule: "approver",
                 bound: { pages_bound: QueueProducers.QUEUE_PAGES, truncated: page.truncated },
                 detail: localize("queue-producers.index.a_submitted_version_is_wizard", "a submitted version is wizard-scripts' fact (its R7, R17): each owner who may approve it is listed. It goes to that owner and to nobody else, and is raised once (DEC-69, DEC-94).") },
        age: Number.isFinite(atMs)
          ? { state: "determined", since: x.submitted_at, ms: Math.max(0, now - atMs) }
          : { state: "undetermined", reason: "no_submission_instant", detail: "the submission carries no instant this producer can read" },
        assignee: null,
        assignee_role: null,
        recipients: [me],
        options: [QueueProducers.WIZARD_APPROVE],
      });
    }
    return out;
  }

  /* ======================================================================
     * DEC-147 · R37 — A CASE EDITION SIGNED TO PUBLISH AT A SET TIME (publish-schedule R1–R4, was publication R66–R69;
   *   N662, K1784, K1785; N823, K2438).
   * DEC-150 (3) · R38 — A HELD PROFILE FOR THE PLACE THE GROUP NAMED (instance-setup R62; N665).
   * DEC-158 (4) · R39 — A COPIED WIZARD WHOSE BASE HAS A NEWER APPROVED VERSION (wizard-scripts R26; N679, K1818).
   * Each reads the one fact its owning module offers, derived on read and writing nothing, so an item leaves on the
   * first read after the fact stops holding; what is told once is raised once and leaves by its recipient's disposition.
   * ====================================================================== */

  /** R37: the acts that answer a waiting edition (publish-schedule R3): moving its time, or cancelling it. */
  static PUBLISH_AT_MOVE = Object.freeze({ id: "publishatmove", label: word("queue-producers.label.move_time_publishes"), weight: "single" });
  static PUBLISH_AT_CANCEL = Object.freeze({ id: "publishatcancel", label: word("queue-producers.label.cancel_publishing_time"), weight: "single" });
  /** R37: each state's class and kind (publish-schedule R2, R4); a cancelled edition earns no item. */
  static SCHEDULED_KINDS = Object.freeze({
    waiting: Object.freeze(["CONDITION", "edition-scheduled"]),
    published: Object.freeze(["FINDING", "edition-published-as-scheduled"]),
    stopped: Object.freeze(["FINDING", "scheduled-edition-stopped"]) });
  /** R38: the act that answers an arrival (instance-setup R14, `op=profilesset`): choosing the profile under Places. */
  static PLACE_CHOOSE = Object.freeze({ id: "profilesset", label: word("queue-producers.label.choose_profile_under"), weight: "single" });
  /** R39: the acts a copy's editors are offered (wizard-scripts R4, R26): seeing what changed (both versions, read), and
   *  bringing it across by their own revision (`adopt: {base}`). */
  static WIZARD_BASE_READ = Object.freeze({ id: "wizardread", label: word("queue-producers.label.see_changed_wizard"), weight: "single" });
  static WIZARD_BASE_ADOPT = Object.freeze({ id: "wizardrevise", label: word("queue-producers.label.bring_change_copy"), weight: "single" });

  /** A person's id, never a machine credential's. */
  static #person(x) {
    return typeof x === "string" && x.trim() !== "" && !x.startsWith(MACHINE_AUTHOR_PREFIX) && !x.startsWith(MACHINE_CLASS_PREFIX);
  }

  /** R37: "<date>, <time>" as set, in the group's zone as publish-schedule R4 carries it, never converted (R36); null when
   *  unreadable. */
  static #setTime(at) {
    const a = at && typeof at === "object" ? at : {};
    return isCalendarDate(a.date) && typeof a.time === "string" && /^\d{2}:\d{2}$/.test(a.time) ? `${a.date}, ${a.time}` : null;
  }

  /** An instant's age, or undetermined for `reason`. */
  static #instantAge(v, now, reason, detail) {
    const ms = typeof v === "string" && v ? Date.parse(v) : NaN;
    return Number.isFinite(ms) ? { state: "determined", since: v, ms: Math.max(0, now - ms) } : { state: "undetermined", reason, detail };
  }

  /** `edition-scheduled`, `edition-published-as-scheduled` and `scheduled-edition-stopped` (R37; publish-schedule R1–R4;
   *  DEC-147 (2), (3), (5)): for each case edition `publishSchedule.scheduledEditions` answers read as the plane (its R4),
   *  paged by its cursor, items to the member who set its time and to the case's project's owners (membership R65), and
   *  to nobody else: a caller with no member is none of them. Each item's subject is the case edition, homed under the
   *  case's project (none when it has none), and a project this viewer may not see yields no item (R11).
   *  - while it is `waiting`, one CONDITION keyed `CONDITION::edition-scheduled::<case>@<edition>`, its summary
   *    "Signed · publishes <date, time>" as set, in the group's zone, never converted (R36); offering the move and the
   *    cancel; a moved time changes its words, never its key; it leaves when the edition leaves `waiting`;
   *  - once `published`, one FINDING keyed `FINDING::edition-published-as-scheduled::<case>@<edition>`, naming the set time
   *    and the instant published;
   *  - once `stopped`, one FINDING keyed `FINDING::scheduled-edition-stopped::<case>@<edition>`, naming each reason in its
   *    own translation and saying nothing was published and publishing needs a new signing.
   *  The two findings are raised once and leave by their recipient's disposition (DEC-69, DEC-70). A cancelled edition
   *  earns no item.
   *  The provider is asked whenever there is a member, never first tested for the read (N823): a provider that lost it
   *  fails loudly rather than leaving every scheduled item silently unraised. */
  #scheduledEditionItems(me, viewer, now) {
    if (!me) return [];
    const page = this.#pages((after) => {
      const r = this.#publishSchedule.scheduledEditions({ after });
      return r && Array.isArray(r.editions) ? { ...r, items: r.editions, truncated: !!r.cursor } : r;
    });
    const visible = this.#bundleRedactor(viewer);
    const owners = new Map();
    const seen = new Set();
    const out = [];
    for (const e of page.items) {
      const k = e ? QueueProducers.SCHEDULED_KINDS[e.state] : null;
      if (!k || typeof e.case !== "string" || !e.case || !Number.isInteger(Number(e.edition)) || e.edition === null) continue;
      const project = typeof e.project === "string" && e.project ? e.project : null;
      if (project && visible(project) === null) continue;        // R11: a case of a project this viewer may not see
      const key = project || "";
      if (!owners.has(key)) owners.set(key, project ? (this.#membership.projectOwners(project) || []) : []);
      const setter = QueueProducers.#person(e.set_by) ? e.set_by : null;
      const recipients = [...new Set([...(setter ? [setter] : []), ...owners.get(key)])];
      if (!recipients.includes(me)) continue;
      const [cls, kind] = k;
      const edition = Number(e.edition);
      const id = `${cls}::${kind}::${e.case}@${edition}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const at = e.at && typeof e.at === "object" ? e.at : {};
      const when = QueueProducers.#setTime(at) || word("queue-producers.text.time_read");
      const zone = typeof at.zone === "string" && at.zone ? at.zone : null;
      const which = localize("queue-producers.index.case_case_edition_edition", "case {case}, edition {edition}", { case: String(e.case), edition: String(edition) });
      const moves = Array.isArray(e.moves) ? e.moves : [];
      const reasons = (Array.isArray(e.reasons) ? e.reasons : []).filter((x) => x && typeof x === "object")
        .map((x) => ({ code: x.code ?? null, translation: typeof x.translation === "string" ? x.translation : null }));
      let summary, detail, age, options;
      if (kind === "edition-scheduled") {
        summary = `Signed · publishes ${when} · ${which}`;
        detail = word("queue-producers.detail.edition_signed_waits", { date: String(when), time: String(zone ? ` (${zone})` : ""), moved_clause: String(moves.length ? `; its time has been moved ${moves.length === 1 ? "once" : `${moves.length} times`}` : "") });
        age = QueueProducers.#instantAge(e.signed_at, now, "no_signing_instant", word("queue-producers.instant_age.edition_carries_signing"));
        options = [QueueProducers.PUBLISH_AT_MOVE, QueueProducers.PUBLISH_AT_CANCEL];
      } else if (kind === "edition-published-as-scheduled") {
        summary = word("queue-producers.summary.published_set_time", { which: String(which), when: String(when) });
        detail = word("queue-producers.detail.signed_publish_published", { when: String(when), zone: String(zone ? ` (${zone})` : ""), read: String(typeof e.outcome_at === "string" && e.outcome_at ? `at ${e.outcome_at}` : "at an instant that cannot be read") });
        age = QueueProducers.#instantAge(e.outcome_at, now, "no_outcome_instant", word("queue-producers.instant_age.edition_carries_publishing"));
        options = [];
      } else {
        const said = reasons.map((x) => x.translation || word("queue-producers.map.reason_recorded_words", { code: String(x.code || "no code") }));
        summary = word("queue-producers.summary.published_set_time_2", { which: String(which), when: String(when) });
        detail = word("queue-producers.detail.time_came_check", { recorded: String(said.length ? said.join(" ") : "no reason was recorded.") });
        age = QueueProducers.#instantAge(e.outcome_at, now, "no_outcome_instant", word("queue-producers.instant_age.edition_carries_stopping"));
        options = [];
      }
      out.push({
        id,
        class: cls,
        kind,
        case: project ? this.#homesAt([project], viewer) : this.#homesOf([]),
        subject: { kind: "case_edition", id: `${e.case}@${edition}`, case: e.case, edition, project },
        summary,
        detail,
        basis: { source: "publish-schedule.scheduledEditions", case: e.case, edition, project, state: e.state,
                 at: { date: at.date ?? null, time: at.time ?? null, zone }, publish_at: e.publish_at ?? null,
                 signed_at: e.signed_at ?? null, signer: e.signer ?? null, set_by: e.set_by ?? null, moves,
                 outcome_at: e.outcome_at ?? null, ...(kind === "scheduled-edition-stopped" ? { reasons } : {}),
                 recipients_rule: "setter_and_project_owners",
                 bound: { pages_bound: QueueProducers.QUEUE_PAGES, truncated: page.truncated },
                 detail: localize("queue-producers.index.a_scheduled_edition_is_publish", "a scheduled edition is publish-schedule's (its R1–R4): its time as set, in the team's zone, and its outcome, read here as the plane and never stored. It goes to the member who set the time and to the case's project's owners, and to nobody else (DEC-147).") },
        age,
        assignee: null,
        assignee_role: null,
        recipients,
        options,
      });
    }
    return out;
  }

  /** R38 (DEC-150 (3); instance-setup R62): the one door through which `instance-setup` registers, once at start, its
   *  `placeArrivals` read (a function, or an object offering `placeArrivals`), K31's pattern since it comes later in
   *  layer 11. A second registration is refused `PLACE_ARRIVALS_REGISTERED`, a read that is neither
   *  `PLACE_ARRIVALS_MALFORMED`: programming errors answered to the caller, never a member's refusal. */
  registerPlaceArrivals(read) {
    const fn = typeof read === "function" ? read
      : read && typeof read === "object" && typeof read.placeArrivals === "function" ? (a) => read.placeArrivals(a) : null;
    if (!fn)
      return { ok: false, reason: "PLACE_ARRIVALS_MALFORMED", detail: "the registered read is placeArrivals, a function" };
    if (this.#placeArrivals)
      return { ok: false, reason: "PLACE_ARRIVALS_REGISTERED", detail: "the read of a named place's arrivals is registered once at start, and it was" };
    this.#placeArrivals = fn;
    return { ok: true };
  }

  /** `place-profile-arrived` (R38; instance-setup R62; DEC-150 (3)): with a read registered (none: no item), for each
   *  arrival it answers read as the plane, one CONDITION keyed `CONDITION::place-profile-arrived::<profile>`, to every
   *  active administrator (membership R64, R86) and to nobody else, with no project home. It names the place the group
   *  named and the held profile's name and coverage, and offers choosing it under Places (instance-setup R14). Raised once
   *  per arrival; it leaves when the arrival leaves (the profile made active, or the name cleared or changed). */
  #conditionsPlaceArrived(me, viewer, now) {
    if (!this.#placeArrivals || !me || !this.#isAdminMember(me)) return [];
    let r;
    try { r = this.#placeArrivals({ viewer: null }); } catch { return []; }
    const list = Array.isArray(r) ? r : r && r.ok !== false && Array.isArray(r.arrivals) ? r.arrivals : [];
    const seen = new Set();
    const out = [];
    let admins = null;
    for (const a of list) {
      if (!a || typeof a !== "object") continue;
      const held = a.profile && typeof a.profile === "object" ? a.profile : null;
      const profile = held ? held.id ?? held.profile ?? null : a.profile;
      if (typeof profile !== "string" || !profile) continue;
      const id = `CONDITION::place-profile-arrived::${profile}`;
      if (seen.has(id)) continue;
      seen.add(id);
      if (admins === null) admins = this.#activeAdmins();
      const place = typeof a.name === "string" && a.name.trim() ? a.name.trim() : null;
      const pname = (held ? held.name : a.profile_name) ?? null;
      const covers = (held ? held.covers : a.covers);
      const coverage = Array.isArray(covers) ? covers.filter((x) => typeof x === "string" && x) : [];
      const named = typeof pname === "string" && pname ? pname : profile;
      out.push({
        id,
        class: "CONDITION",
        kind: "place-profile-arrived",
        case: this.#homesOf([]),
        subject: { kind: "place_profile", id: profile, name: pname ?? null, covers: coverage, place },
        summary: word("queue-producers.summary.profile_now_held", { named: String(place ? `"${place}"` : "the place your team named"), named2: String(named) }),
        detail: localize("queue-producers.index.an_installed_update_brought_a", "An installed update brought a profile that matches the place your team named{v1}: {named}{v2}. An administrator may choose it under Places; the offices your team added stay. This status is told once, and it leaves when the profile is chosen or the place's name is cleared or changed.", { v1: String(place ? `, "${place}"` : ""), named: String(named), v2: String(coverage.length ? `, which covers ${coverage.join(", ")}` : "") }),
        basis: { source: "instance-setup.placeArrivals", profile, profile_name: pname ?? null, covers: coverage, place,
                 found_at: a.found_at ?? null, recipients_rule: "administrators", raised_to: admins,
                 detail: localize("queue-producers.index.an_arrival_is_instance_setups", "an arrival is instance-setup's fact (its R62): a held profile matching the place the team named, first found at a start, read here through the read it registered and never stored. It goes to every administrator and to nobody else (DEC-150 (3)), and leaves when the arrival leaves.") },
        age: QueueProducers.#instantAge(a.found_at, now, "no_found_instant", word("queue-producers.age.arrival_carries_instant")),
        assignee: null,
        assignee_role: null,
        recipients: [...admins],
        options: [QueueProducers.PLACE_CHOOSE],
      });
    }
    return out;
  }

  /** `wizard-base-updated` (R39; wizard-scripts R26; DEC-158 (4), K1818): one FINDING per entry and recipient
   *  `wizard-scripts.baseUpdates` answers (a copy whose base has a newer approved version, to the copy's wizard editors as
   *  it names them), paged by its cursor, keyed `FINDING::wizard-base-updated::<copy>::<base version>::<member>`, to that
   *  recipient and to nobody else: a caller with no member is none of them. Its subject the copy, naming the copy's name,
   *  its base's name and the base's new version, homed under the copy's project, a project this viewer may not see
   *  yielding none (R11); offering to see what changed and to bring it across by the member's own revision (wizard-scripts
   *  R4's `adopt: {base}`). Raised once and never repeated; it leaves when its recipient disposes of it (DEC-69, DEC-70). */
  #findingsWizardBaseUpdated(me, viewer, now) {
    if (!me || typeof this.#wizardScripts.baseUpdates !== "function") return [];
    const page = this.#pages((after) => {
      const r = this.#wizardScripts.baseUpdates({ after, viewer });
      return r && Array.isArray(r.entries) ? { ...r, items: r.entries } : r;
    });
    const visible = this.#bundleRedactor(viewer);
    const seen = new Set();
    const out = [];
    for (const x of page.items) {
      if (!x || typeof x.copy !== "string" || !x.copy || x.base_version === undefined || x.base_version === null
          || x.base_version === "") continue;
      const recipients = (Array.isArray(x.recipients) ? x.recipients : []).filter((m) => QueueProducers.#person(m));
      if (!recipients.includes(me)) continue;
      const project = typeof x.project === "string" && x.project ? x.project : null;
      if (project && visible(project) === null) continue;        // R11: a copy in a project this viewer may not see
      const baseVersion = String(x.base_version);
      const id = `FINDING::wizard-base-updated::${x.copy}::${baseVersion}::${me}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const name = typeof x.name === "string" && x.name ? `"${x.name}"` : x.copy;
      const baseName = typeof x.base_name === "string" && x.base_name ? `"${x.base_name}"` : "the wizard it was copied from";
      out.push({
        id,
        class: "FINDING",
        kind: "wizard-base-updated",
        case: project ? this.#homesAt([project], viewer) : this.#homesOf([]),
        subject: { kind: "wizard", id: x.copy, name: x.name ?? null, copy_version: x.copy_version ?? null,
                   base: x.base ?? null, base_name: x.base_name ?? null, based_on: x.based_on ?? null,
                   base_version: baseVersion, project },
        summary: `${baseName} has a newer approved version, ${baseVersion}, than your team's copy ${name} was made from`,
        detail: localize("queue-producers.index.your_teams_copy_name_was", "Your team's copy {name} was made from {v1}{baseName}, and version {baseVersion} of it has since been approved. See what changed between the two; you may bring the change across to your copy by your own revision, and nothing is changed in your copy unless you do. This is told once.", { name: String(name), v1: String(x.based_on ? `version ${x.based_on} of ` : ""), baseName: String(baseName), baseVersion: String(baseVersion) }),
        basis: { source: "wizard-scripts.baseUpdates", copy: x.copy, copy_version: x.copy_version ?? null, name: x.name ?? null,
                 project, base: x.base ?? null, base_name: x.base_name ?? null, based_on: x.based_on ?? null,
                 base_version: baseVersion, found_at: x.found_at ?? null,
                 ...(x.steps && typeof x.steps === "object" ? { steps: x.steps } : {}),
                 recipients_rule: "copy_editors", raised_to: recipients,
                 bound: { pages_bound: QueueProducers.QUEUE_PAGES, truncated: page.truncated },
                 detail: localize("queue-producers.index.a_newer_approved_version_of", "a newer approved version of a copy's base is wizard-scripts' fact (its R26), listed once per copy and version and read here, never stored. It goes to each of the copy's wizard editors it names, once (DEC-69, DEC-70), and the change is brought across only by a member's own revision (its R4).") },
        age: QueueProducers.#instantAge(x.found_at, now, "no_found_instant", word("queue-producers.age.entry_carries_instant")),
        assignee: null,
        assignee_role: null,
        recipients: [me],
        options: [QueueProducers.WIZARD_BASE_READ, QueueProducers.WIZARD_BASE_ADOPT],
      });
    }
    return out;
  }

  /* ======================================================================
   * T50 · R41, R42 — AN INVITATION TO A PROJECT, AND A REQUEST TO JOIN ONE (project-roster R1, R12, R14, R26, R34; N1091;
   * DEC-248, DEC-286, DEC-309 (1)). Each reads the one fact project-roster offers, derived on read and writing nothing, so
   * an item leaves on the first read after the fact stops holding. Every sentence is a word of setup-words' list (K3366).
   * ====================================================================== */

  /** R41, R42: how many projects each producer asks about (R4's bound). */
  static QUEUE_PROJECT_ITEMS_MAX = 50;

  /** `project-invitation` (R41; DEC-248): one OBLIGATION for each project in which the member's `participation` is
   *  `invited` (project-roster R34, read through `projectList`), at most 50 in id order, keyed
   *  `OBLIGATION::project-invitation::<project>::<member>`, to her and to nobody else, with no project home; it names the
   *  project and offers `projectjoin`. Its `age` is from her own row's `created` in `projectParticipants` (R1: for an
   *  `invited` row, the invitation's instant). No read gives the inviter to the invited member, so the summary is the
   *  unnamed one (DEC-309 (1)) until project-roster answers it (`projectInvitations`, T51). It leaves when her state changes. */
  #obligationsProjectInvitation(me, viewer, now) {
    if (!me) return [];
    const list = this.#projectRoster.projectList({ viewer });
    if (!list || list.ok !== true || !Array.isArray(list.projects)) return [];
    const cap = QueueProducers.QUEUE_PROJECT_ITEMS_MAX;
    const invited = list.projects.filter((p) => p && typeof p.id === "string" && p.id && p.participation === "invited");
    const handle = this.#membership.memberFacts(me)?.handle ?? me;
    const out = [];
    for (const p of invited.slice(0, cap)) {
      const roster = this.#projectRoster.projectParticipants({ projectId: p.id, by: me });
      const own = roster && roster.ok === true && Array.isArray(roster.participants)
        ? roster.participants.find((x) => x && x.handle === handle && x.state === "invited") : null;
      const name = typeof p.name === "string" && p.name ? p.name : p.id;
      out.push({
        id: `OBLIGATION::project-invitation::${p.id}::${me}`,
        class: "OBLIGATION",
        kind: "project-invitation",
        case: this.#homesOf([]),
        subject: { kind: "project", id: p.id, name: p.name ?? null },
        summary: word("queue.project-invitation.summary.unnamed", { project: name }),
        detail: word("queue.project-invitation.detail"),
        basis: { source: "project-roster.projectList", project: p.id, participation: "invited",
                 invited_at: own ? own.created ?? null : null, inviter: null, recipients_rule: "invited_member",
                 bound: { limit: cap, truncated: invited.length > cap, list_truncated: list.truncated === true },
                 detail: localize("queue-producers.index.an_invitation_is_memberships_row", "an invitation is membership's row for the member (project-roster R34, membership R118), read here at every read and never stored. It goes to the member invited and to nobody else, and leaves when her state changes: she joins, is removed, or the invitation is withdrawn.") },
        age: QueueProducers.#instantAge(own ? own.created : null, now, "no_invitation_instant",
                                        "the member's row carries no instant this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: [me],
        options: [{ id: "projectjoin", label: word("act.projectjoin.label.queue"), weight: "single" }],
      });
    }
    return out;
  }

  /** `project-request` (R42; DEC-286): for each project the member owns, at most 50 in id order, one OBLIGATION per open
   *  request `projectRequests({projectId})` answers (project-roster R14), keyed
   *  `OBLIGATION::project-request::<project>::<requester>` (the requester by handle), to each owner of the project
   *  (membership R65) and to nobody else, with no project home. The requester is named by handle; her own comment is
   *  carried apart as `quote`, her words and not this module's. It offers `projectrequestanswer` with its two answers.
   *  Aged from the request's `asked`. It leaves for every owner at once when one owner answers it or the requester
   *  withdraws (the read no longer answers it). */
  #obligationsProjectRequest(me, viewer, now) {
    if (!me) return [];
    /* A store project-roster has not migrated holds no request (the plane migrates it with every module; a caller's test
       world may not), so it holds none: asked, never thrown over, as R23's case documents are. */
    if (!this.#one(`SELECT 1 AS x FROM sqlite_master WHERE type='table' AND name='project_join_requests'`)) return [];
    const cap = QueueProducers.QUEUE_PROJECT_ITEMS_MAX;
    const scope = this.#ownedProjects(me, viewer, cap);
    const out = [];
    for (const project of scope.projects) {
      const r = this.#projectRoster.projectRequests({ projectId: project, by: me, viewer });
      if (!r || r.ok !== true || !Array.isArray(r.requests)) continue;
      const owners = this.#membership.projectOwners(project) || [];
      const info = this.#record.bundleInfo(project);
      const name = info && typeof info.title === "string" && info.title ? info.title : project;
      for (const q of r.requests) {
        if (!q || q.state !== "open" || typeof q.handle !== "string" || !q.handle) continue;
        const text = typeof q.comment === "string" && q.comment.trim() ? q.comment : null;
        out.push({
          id: `OBLIGATION::project-request::${project}::${q.handle}`,
          class: "OBLIGATION",
          kind: "project-request",
          case: this.#homesOf([]),
          subject: { kind: "project", id: project, name: info?.title ?? null, requester: q.handle },
          summary: word("queue.project-request.summary", { who: q.handle, project: name }),
          detail: word("queue.project-request.detail"),
          quote: text === null ? null : { by: q.handle, text },
          basis: { source: "project-roster.projectRequests", project, requester: q.handle, comment: text, asked: q.asked ?? null,
                   recipients_rule: "project_owners",
                   bound: { projects_bound: scope.bound, projects_truncated: scope.truncated === true,
                            requests_limit: r.limit ?? null, requests_truncated: r.truncated === true },
                   detail: localize("queue-producers.index.an_open_request_to_join", "an open request to join is project-roster's row (its R12, R14), read here at every read and never stored. It goes to each owner of the project and to nobody else, and leaves for all of them when one owner answers it or the requester withdraws.") },
          age: QueueProducers.#instantAge(q.asked, now, "no_request_instant", "the request carries no instant this producer can read"),
          assignee: null,
          assignee_role: null,
          recipients: [...owners],
          options: [{ id: "projectrequestanswer", label: word("act.projectrequestanswer.label.queue"), weight: "single",
                      answers: [{ answer: "grant", label: word("screen.home.request.grant") },
                                { answer: "decline", label: word("screen.home.request.decline") }] }],
        });
      }
    }
    return out;
  }

}

const OF = new WeakMap();

/** The one producers instance for this Durable Object's storage (`ctx`, or the storage itself). It registers nothing. */
export function queueProducersOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let p = OF.get(storage);
  if (!p) {
    p = new QueueProducers({ host: ctx, storage, deps: { ...(deps || {}) } });
    OF.set(storage, p);
  }
  return p;
}
