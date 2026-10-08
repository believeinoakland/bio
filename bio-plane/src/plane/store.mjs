/* plane R1–R5: the instance's Durable Object class, the composition root. It builds every module on the object's storage
   in the order below (R2), runs their migrations before any request (R3), hands the alarm to `scheduler` (R4), and answers
   every store request through `store-door`'s `dispatch` over the one route map (R5; K2043). It holds no construct of its own:
   no table, no row, no refusal, no op (R9); its own stats sight is `stats.mjs`' (R10). Moved from
   `store.mjs`' constructor, `#migrate`, `alarm`, `onAlarm`, `#nowMs`, `#ownNamespace` and `routes`, and from
   `control-plane/dispatch.mjs`' `Store` (control-plane R35, now this module's R1), with their behaviour unchanged. */
import { DurableObject } from "cloudflare:workers";
import { actionsOf, actionsOps } from "../actions/index.mjs";
import { actionClocksOf, actionClocksOps } from "../action-clocks/index.mjs";
import { localFactsOf, localFactsOps } from "../local-facts/index.mjs";
import { filingTemplatesOf, filingTemplatesOps } from "../filing-templates/index.mjs";
import { standardsOf, standardsOps } from "../standards/index.mjs";
import { conformanceOf, conformanceOps } from "../conformance/index.mjs";
import { consequencesModule, consequencesOps } from "../consequences/index.mjs";
import { filingsOf, filingsOps } from "../filings/index.mjs";
import { escalationOf, escalationOps } from "../escalation/index.mjs";
import { actionPlansOf, actionPlansOps } from "../action-plans/index.mjs";
import { promotionOf, promotionOps } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { provenanceOps } from "../provenance/ops.mjs";
import { attestationOf } from "../attestation/index.mjs";
import { provenanceRoutesOf, provenanceRouteOps } from "../provenance-routes/index.mjs";
import { membershipOf, membershipOps, viewerPredicate, MODULE_ORDER } from "../membership/index.mjs";
import { projectRosterOf, projectRosterOps } from "../project-roster/index.mjs";
import { credentialsOf, credentialsOps } from "../credentials/index.mjs";
import { observationLogOf, observationLogOps, OBSERVATION_LOG_MODULE } from "../observation-log/index.mjs";
import { runProductionsOf, runProductionsOps } from "../run-productions/index.mjs";
import { captureRequestsOf, captureRequestsOps } from "../capture-requests/index.mjs";
import { recordOf, recordCoreOps } from "../record-core/index.mjs";
import { registerInquiryGrammar } from "../inquiry-grammar/index.mjs";
import { governorOf, governorRoutes } from "../host-governor/index.mjs";
import { acquisitionOf } from "../acquisition/index.mjs";
import { captureOf, captureOps } from "../capture/index.mjs";
import { fileSafetyOf, fileSafetyOps } from "../file-safety/index.mjs";
import { monitoringOf, monitoringOps } from "../monitoring/index.mjs";
import { linkSweepOf, linkSweepOps } from "../link-sweep/index.mjs";
import { connectionsOf, connectionsOps } from "../connections/index.mjs";
import { inquiryOf, inquiryOps, inquiryLegGrades, inquiryFindings } from "../inquiry/index.mjs";
import { citationOf, citationOps } from "../citation/index.mjs";
import { extractionOf, extractionOps } from "../extraction/index.mjs";
import { entitiesOf, entitiesOps } from "../entities/index.mjs";
import { basisVersionsOf, basisVersionsOps } from "../basis-versions/index.mjs";
import { contradictionOf, contradictionOps } from "../contradiction/index.mjs";
import { calibrationOf, calibrationOps } from "../calibration/index.mjs";
import { schedulerOf } from "../scheduler/index.mjs";
import { progressionsOf, progressionOps } from "../progressions/index.mjs";
import { intentOf, intentOps } from "../intent/index.mjs";
import { strengthOf, strengthOps } from "../strength/index.mjs";
import { reevaluationOf, reevaluationOps } from "../reevaluation/index.mjs";
import { reviewOf, reviewOps } from "../review/index.mjs";
import { caseAuthoringOf, caseAuthoringOps } from "../case-authoring/index.mjs";
import { ratificationOf, ratificationOps } from "../ratification/index.mjs";
import { publicationOf, publicationOps } from "../publication/index.mjs";
import { docketOf, docketOps } from "../docket/index.mjs";
import { acceptedWorkOf } from "../accepted-work/index.mjs";
import { checkCaseFile, registerCaseCheckerPublicReads } from "../case-checker/index.mjs";
import { caseImportOf, caseImportOps } from "../case-import/index.mjs";
import { caseDisclosuresOf } from "../case-disclosures/index.mjs";
import { caseCarriageOps } from "../case-carriage/index.mjs";
import { publicReadOf, publicReadOps } from "../public-read/index.mjs";
import { projectStageOf, projectStageOps } from "../project-stage/index.mjs";
import { networkNoticesOf, networkNoticesOps } from "../network-notices/index.mjs";
import { corpusExportOf, corpusExportOps } from "../corpus-export/index.mjs";
import { biasOf, biasOps } from "../bias/index.mjs";
import { aiRunsOf, aiRunsOps } from "../ai-runs/index.mjs";
import { contentOf, contentOps } from "../content/index.mjs";
import { retrievalOf, retrievalRoutes } from "../retrieval/index.mjs";
import { queueOf, Queue } from "../queue/index.mjs";
import { queueProducersOf } from "../queue-producers/index.mjs";
import { tasksOf } from "../tasks/index.mjs";
import { wizardScriptsOf, wizardScriptsOps } from "../wizard-scripts/index.mjs";
import { instanceSetupOf, instanceSetupOps } from "../setup.mjs";
import { dispatch, controlPlaneRoutes } from "../store-door/dispatch.mjs";   /* K1907, K2041: the store's door */
import { promotionStep } from "../store-door/step.mjs";
import { registerOwnersCounts, registerStats } from "./stats.mjs";
import { wizardRegistration } from "./wizards.mjs";
import { SCREENS } from "./screens.mjs";
import { eventsOf, eventsOps } from "../events/index.mjs";
import { linesOf, linesOps } from "../lines/index.mjs";
import { moneyOf, moneyOps } from "../money/index.mjs";
import { moneyChecksOf, moneyChecksOps } from "../money-checks/index.mjs";
import { dutiesOf, dutiesOps } from "../duties/index.mjs";
import { peopleOf, peopleOps } from "../people/index.mjs";
import { exploreOf, exploreOps } from "../explore/index.mjs";
import { calculationsOf, calculationsOps } from "../calculations/index.mjs";
import { workbooksOf, workbooksOps } from "../workbooks/index.mjs";
import { legEarningOf, legEarningOps } from "../leg-earning/index.mjs";
import { hypothesesOf, hypothesesOps } from "../hypotheses/index.mjs";
import { answersOf, answersOps } from "../answers/index.mjs";
import { caseTensionsOf, caseTensionsOps } from "../case-tensions/index.mjs";
import { followingOf, followingOps } from "../following/index.mjs";
import { noticeProducersOf } from "../notice-producers/index.mjs";
import { askOnObject, draftOnObject } from "./ask.mjs";
import { admissionOf, admissionOps } from "../admission/window.mjs";
import { archiveUnpackConsumer } from "./unpack.mjs";
import { rosterSource } from "../../../roster-reader/index.mjs";
import { credentialsOf as captureCredentialsOf } from "../capture-sources/credentials.mjs";
import { registerReaders, rosterReads, ownHostsOf, officePorts, dutiesFactOf, retrievalTerms, sheetRecompute,
         ratificationWorker } from "./wiring.mjs";

/* The name store-door's promotion step (its R5, was control-plane R42) is registered under (K2037). */
const STEP = "store-door";

/* The first module of layer 11 in the modules' total order. `MODULE_ORDER` carries no layers and product code cannot read
   `build/` at run time, so it is named here; `store.test.mjs`' R2 test holds it to `build/modules.json`'s layers. */
const FIRST_LAYER_11 = "wizard-scripts";

/* The order promotion ranks its steps by: the modules' total order (membership R83), with store-door's step (its R5;
   R10) after every module of layers 1–10 and before every later one (K1416: before the first layer-11 module, now
   `wizard-scripts`, N544), the rank the step has held since it was `legacy-store`'s, so every step's checks and
   projections, and the order of refusals, are today's. Promotion ranks a name the order lacks last (its R39). */
export const STEP_ORDER = Object.freeze((() => {
  const o = MODULE_ORDER.filter((m) => m !== STEP);
  const at = o.indexOf(FIRST_LAYER_11);
  return at === -1 ? [...o, STEP] : [...o.slice(0, at), STEP, ...o.slice(at)];
})());

/* D-432: the live rows the PROJ mint site's `taken` reads, as `[prefix, table, column]`, seeded at every boot (record-core
   R40). The CASE rows are ratification's and publication's registered seeds (record-core R70). */
const MINT_LEDGER_LIVE = Object.freeze([["PROJ", "bundles", "bundle_id"]]);

export class Store extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sql = ctx.storage.sql;
    /* R2. record-core: the evidence bucket and its key prefix, handed over at its first construction. */
    recordOf(ctx, { evidence: env.CAPTURES ?? null, evidencePrefix: () => `${this.#ownNamespace() || "bio"}/captures/` });
    /* R21 (K1541; credentials R23, R29): credentials holds the Worker secret its seal is derived from, built here before
       any module reaches it (its instance is one per storage, its deps read on the first call only). Unbound, setting a
       member's reference is refused ACCOUNT_SEAL_UNAVAILABLE. */
    credentialsOf(ctx, { sealSecret: env.ACCOUNT_SEAL_SECRET ?? null });
    /* R22 (T33-12; docprofile R36): the content types registered into docprofile's registry, once, generic last. */
    registerReaders();
    /* R10 (K861): the stats figures, each owner's registered under its own name (record-core R63), and the plane's own
       stats sight (record-core R65). */
    registerOwnersCounts(ctx);
    registerStats(ctx);
    /* promotion, built first with the order its steps rank by (membership, then promotion, as provenance's first call
       built them), so store-door's step ranks after layer 10 and before every layer-11 module (STEP_ORDER). */
    const promotion = promotionOf(ctx, { order: STEP_ORDER });
    /* R16 (N522; K1307): accepted-work's one instance on this host, made here, before inquiry's factory and every reader,
       on this promotion, so its promotion check (its R4) is registered at its rank before the first request. The same
       instance is handed to every module that reads accepted work (strength, basis-versions, reevaluation,
       publication) and to case-import, which fills its one registration (R17), so one registration serves them all. */
    const acceptedWork = acceptedWorkOf(ctx, { record: recordOf(ctx), promotion });
    /* provenance declares its tables and joins every promotion first, so its register write runs before the
       projections that read it. observation-log registers its look on each receipt (its R5, provenance R47), and
       listens to extraction's reading notice once extraction exists (below). */
    const provenance = provenanceOf(ctx);
    const instanceName = env.INSTANCE_NAME || "unnamed";
    /* attestation (N512), next in the modules' order, built here with the instance's receipt-signing key (its R4, K59)
       before any module reaches it, so the one instance every user is handed holds the key: acquisition's receipt
       through capture (`cap.attestation`), case-authoring's and filings' `attestationsOf`, network-notices' signing. */
    const attestation = attestationOf(ctx, { provenance, signingKey: env.RECEIPT_SIGNING_KEY ?? null, instanceName });
    /* provenance-routes (N512), after attestation: at creation it declares its table to purge and registers its audit
       finding `route` and its figure `routeMarks` (its R6, R10, R12); a reconstructed hop names this instance (its R1). */
    provenanceRoutesOf(ctx, { instanceName });
    observationLogOf(ctx, { extraction: null, provenance });
    /* extraction: its projection joins every promotion. content: created on extraction's instance here, so its stale
       mark (REC-82, its R22) is registered before observation-log's rows (its R6–R8), in the modules' total order
       (extraction R24). */
    observationLogOf(ctx).listenTo(contentOf(ctx, { extraction: extractionOf(ctx, { env, promotion, calibration: calibrationOf(ctx) }) }).extraction);
    /* entities (R13): observation-log records each resolution attempt on entities' notice (its R8). */
    observationLogOf(ctx).attachMeaning({ entities: entitiesOf(ctx) });
    /* R21 (T33-90; K1563): layer 5's new modules, in the modules' order, each built here with the instances it reads
       before any other module's factory reaches it (a factory reads its deps on its first call only). events starts at
       creation (its after-read hook and connection owner); lines reads events' `when` (its R6). */
    const events = eventsOf(ctx);
    const lines = linesOf(ctx, { events });
    /* K1563 (10), K1654: the seeded offices' reads (instance-setup R50), for local-facts here and conformance below. */
    const offices = officePorts(() => instanceSetupOf(ctx, env));
    /* local-facts (moved to layer 5, T33-28): its `part_of` walk over lines, and the seeded offices it maps to. */
    const localFacts = localFactsOf(ctx, { lines, officeOf: offices.officeOf });
    /* standards (moved to layer 5, T33-31; K1571): its dated reads over events, and the keyed store its citation lookup
       reads the group's key through (`{credentials, env, governor}`, its R25), the sealed credentials above. */
    const standards = standardsOf(ctx, { events, keyedStore: () => ({ credentials: credentialsOf(ctx), env,
                                                                       governor: governorOf(ctx, { env }) }) });
    /* money (K1573): built before every module that reaches it, with calculations' `bindingOf` as its port
       (calculations comes later in the order, so the port is asked of its instance when read); its projection step
       joins the promotion. */
    const money = moneyOf(ctx, { calculations: { bindingOf: (key) => calculationsOf(ctx).bindingOf(key) } });
    money.joinPromotion(promotion);
    /* money-checks, with the progressions the scheduler builds (its environment), so neither loses its deps. */
    moneyChecksOf(ctx, { money, progressions: progressionsOf(ctx, { env }) });
    /* duties (K1569): the real services by default, the active combined view by default, and the status of a calendar
       entry from local-facts (civil-time R9). Before people, whose duties read would otherwise build it bare. */
    const duties = dutiesOf(ctx, { factOf: dutiesFactOf(() => localFacts) });
    const people = peopleOf(ctx, { money, duties, events, lines });
    /* R23 (K1505 (6); N633, K1730): roster-reader's source registered into people (its R19), reading the held rosters
       of an organisation through the store's read composed here (roster-reader R12). */
    people.registerRosterSource("roster-reader", rosterSource(rosterReads({ sql: () => this.sql })));
    /* explore (K1566): the one read across the registered owners; it holds nothing, so it is kept for the route map. */
    this.explore = exploreOf(ctx, { events, money });
    /* retrieval: its projection and text index join every promotion; R21 (K1593): the projected fields' providers,
       each its owner's rule (`standards.standardsFor`, `lines.holderAt`). */
    const retrieval = retrievalOf(ctx, { now: () => this.#nowMs(null),
      terms: retrievalTerms({ standards: () => standards, lines: () => lines, sql: () => this.sql }) });
    /* calculations (T33-41): over the instances it reads, filling at creation money's change notice, duties'
       occurrence evidence and people's roster source (its R19, R20). Built before reevaluation, which registers on its
       input notice. workbooks (K1570) after it, recomputing through SHEET_WORKER. */
    const calculations = calculationsOf(ctx, { money, duties, people, events, lines, standards, retrieval,
      entities: entitiesOf(ctx), progressions: progressionsOf(ctx) });
    workbooksOf(ctx, { provenance, content: contentOf(ctx), calculations,
                       recompute: sheetRecompute(env, () => this.#ownNamespace() || "bio") });
    registerInquiryGrammar(recordOf(ctx));   /* inquiry-grammar R6 (K812): before basis-versions, whose R43 runs at its sub-slot */
    basisVersionsOf(ctx, { retrieval, acceptedWork });   /* basis-versions registers its projection decoration (its R42) */
    aiRunsOf(ctx, env);   /* ai-runs registers with retrieval, in the modules' order */
    /* R21 (T33-44, K1619): leg-earning, before inquiry's factory reaches it, with the standards and duties above. */
    legEarningOf(ctx, { standards, duties });
    /* R21 (K1607): hypotheses at boot, so its leg check joins the promotion (its R5, R6) and the `hunch` owner, which
       registered at load, finds its one instance; explore is the instance above (its R6 rederives through it). */
    hypothesesOf(ctx, { explore: this.explore });
    /* R21 (K1609; answers R7–R12, R15–R21): the owners its rule services read, the saved query's runner (retrieval,
       whose `relations()` and `zone()` answers reads itself, K1788, K1803), the account reads and ai-runs' ceiling. */
    answersOf(ctx, { standards, content: contentOf(ctx), events, entities: entitiesOf(ctx), lines, people, duties,
      calculations, retrieval, credentials: credentialsOf(ctx),
      ceilingRefusal: (member, at) => aiRunsOf(ctx, env).aiUseCheck({ member, at }),
      /* R24 (Q1-7): the screens registry the plane carries, for its explain read. */
      screens: SCREENS });
    /* reevaluation before actions: actions reaches conformance, which reaches reevaluation, and a factory reads its
       `deps` on the first call only, so created there it would never see `env` (its R25). */
    reevaluationOf(ctx, { env, acceptedWork, calculations });
    /* publication (K365): built here, after reevaluation, so its case reads are registered with reevaluation (its R41,
       R43; reevaluation R26) before anything runs. Built lazily, a sweep an alarm reached before any op found none.
       R18 (T37; K2226): handed the evidence bucket (`CAPTURES`) and the store's namespace, read as record-core's evidence
       prefix reads it (R2), which its factory forwards to the case-carriage it creates, so a photo's obscured copy is held
       (case-carriage R11; without them the mark is recorded with no copy, fail closed). */
    publicationOf(ctx, { acceptedWork, bucket: env.CAPTURES ?? null, store: () => this.#ownNamespace() || "bio" });
    /* R23 (K1505 (3), K1643; publication R61): case-tensions, which publication's factory builds and registers its
       provider with (the seven doors), is the one instance per host the route map reaches. */
    caseTensionsOf(ctx);
    /* R15 (N520; DEC-116): docket, directly after publication in the modules' order, built here with this environment
       (its factory reads its deps on the first call only). At creation it creates and declares its tables to purge
       (whole store only, its R16) and starts, filling reevaluation's docket registration (its R13, reevaluation R30)
       before the first request. public-read and network-notices are handed this instance, the docket they read
       (public-read R20, R21; network-notices R21). */
    const docket = docketOf(ctx, { env });
    publicReadOf(ctx, { docket });
    /* network-notices (DEC-111, K1100), at its place after project-stage: at creation it creates and declares its tables,
       registers its notice ids' mint seed and its three public reads (public-read R18), all before the first request;
       the scheduler reaches it for `working-on-seal` and `working-on-attest` (scheduler R5), with this environment. */
    networkNoticesOf(ctx, { env, attestation, docket });
    /* ratification: its case catalogue and C-2.8's case-member arm, registered at start (its R8, R9). Built here, before
       actions, whose factory reaches it for its hold reader (actions R69), since a factory reads its deps on its first
       call only. K1832 (its R42): handed the Worker's reach, the environment and a stub over this object's own door, so
       a scheduled edition's commit copies its materials (its R39) and assembles its container (its R6) in-process, as
       `op=caseratify` does. */
    ratificationOf(ctx, { worker: ratificationWorker({ env, door: (req) => this.fetch(req),
                                                       namespace: () => this.#ownNamespace() || "bio" }) });
    actionsOf(ctx, { env });
    retrieval.registerLegGrades("inquiry", inquiryLegGrades(ctx));   /* R10 (K861): inquiry's leg grades (its R52, retrieval R55) */
    observationLogOf(ctx).attachMeaning({ connections: connectionsOf(ctx, { env }) });
    strengthOf(ctx, { retrieval, acceptedWork });   /* strength: registers its pair (R17), its cache projection (R13) and, with retrieval, the cache's fields (R23) */
    /* R17 (N520, N522): case-checker, then case-import, at their places after ratification in the modules' order, built
       here once strength (with its retrieval, above) and reevaluation (with its environment) exist, since a factory reads
       its deps on its first call only. case-checker starts by registering its two public reads with public-read (its
       R15; public-read R18). case-import is built with the deps it reads (case-checker's `checkCaseFile`, strength,
       accepted-work's one instance (R16), reevaluation) and this environment; its case-file bytes are held in its own
       tables, so no object store is handed to it (K1319). At creation it creates its tables, declares them to purge
       (whole store only, its R13) and starts, filling accepted-work's registration (its R16), `moves` among it (R20;
       accepted-work R8), before the first request. */
    registerCaseCheckerPublicReads(ctx, { publicRead: publicReadOf(ctx) });
    caseImportOf(ctx, { env, checkCaseFile, strength: strengthOf(ctx), acceptedWork, reevaluation: reevaluationOf(ctx) });
    /* R18 (N529; K1333): case-disclosures, at its place after case-import and before case-authoring in the modules'
       order, built here with the attestation instance above, so case-authoring's lazy getter finds that one instance per
       host (case-disclosures R23). It holds no table and no op. case-carriage (N532) needs no line here: publication's
       factory (above) creates it eagerly, with the bucket and namespace handed there, its tables made and declared at
       every boot (case-carriage R6, R12; K1024); its ops are routed in R5's map over that one instance. */
    caseDisclosuresOf(ctx, { attestation });
    biasOf(ctx, { env });
    /* R12 (K1061; inquiry R53, bias R40): inquiry's findings registered with bias as kind `finding`, after bias is built
       with its environment above (its factory reads its deps on the first call only), so a lens change raises a debt on
       a finding concluded under it. */
    biasOf(ctx).registerWorkProducts("finding", inquiryFindings(ctx, biasOf(ctx)));
    /* K2141 (citation R13, retrieval R76): citation made here, explicitly, before run-productions and before the first
       request, so its `recordedBy` read is registered with retrieval at boot and does not wait on run-productions'
       factory reaching it. */
    citationOf(ctx);
    /* run-productions: created after content, connections, strength and citation, so it declares its tables to purge
       (R17) and registers its candidates with basis-versions (R14). ai-runs is handed over as its own module (its
       R28–R29). */
    runProductionsOf(ctx, { aiRuns: aiRunsOf(ctx, env) });
    reviewOf(ctx);
    intentOf(ctx);   /* intent: its check (R1, R2, R26) joins every promotion; its audit check keeps C-2.9 (R22) */
    caseAuthoringOf(ctx);   /* R18: its disclosures, with their attestation, are case-disclosures' (built above) */
    /* layer 9, in the modules' order, each registering at start what its factory registers (checks, projections,
       purge, filings' evidence block). standards creates its own tables at construction. R11 (K921): local-facts heads
       the layer, creating its table and declaring it to purge (record-core K23). */
    /* K1654: conformance names an office's entity through the seeded offices (instance-setup R50). */
    const conformance = conformanceOf(ctx, { officeEntityOf: offices.officeEntityOf });
    const consequences = consequencesModule(ctx, { conformance });
    actionClocksOf(ctx);   /* action-clocks (K704): after actions, which it reads and which joins the host first (its R9) */
    /* R11 (K921): filing-templates, after action-clocks and before filings: it creates its tables, declares them to purge
       (record-core K23), registers its opaque ids' seed and takes the library `filings` R26 kept (its migration). */
    const filingTemplates = filingTemplatesOf(ctx);
    filingsOf(ctx, { actions: actionsOf(ctx), conformance, standards: standardsOf(ctx), consequences, attestation });
    escalationOf(ctx);   /* on this host, it reaches conformance, consequences, actions and filings through their factories */
    /* action-plans (K711): built before any route can run, so ai-runs holds its plan-mode open check (its R30) when the
       first `airunopen` arrives; built lazily, that open is refused AI_RUN_MODE_UNCHECKED. */
    actionPlansOf(ctx);
    const capture = captureOf(ctx, { env, attestation });   /* the acquisition act signs its receipt through `cap.attestation` */
    /* R26 (rev. 2 §4; K2063 (10)): file-safety, directly after capture in the modules' order, built here with this
       environment (the `FILE_SCANNER` binding and the `CAPTURES` bucket; the evidence store and its prefix are
       record-core's, R2) and the object's own namespace, since its factory reads its deps on the first call only. Its
       first construction is its start: its `provenance.onReceipt` listener (its R1) is registered before the first
       request. Its tables are made and declared to purge in R3's pass. */
    const fileSafety = fileSafetyOf(ctx, { env, store: this.#ownNamespace() || "bio" });
    /* capture-requests: its table, its `sweep` resolver and its drain; the run sight it reads is ai-runs' (its R28),
       and it registers its wait source with ai-runs (ai-runs R41). Built before link-sweep and handed to it, so
       link-sweep's sweep scope check (its R12) is registered at construction and a sweep-named request drained before
       the first sweep service is judged, never refused for want of a check (K1163). */
    const captureRequests = captureRequestsOf(ctx, { env, storeName: () => this.#ownNamespace() || "bio",
      now: () => this.#nowMs(null), runs: aiRunsOf(ctx, env), aiRuns: aiRunsOf(ctx, env) });
    /* R20 (N534; DEC-101 (3)): monitoring is handed the case-import instance built above, whose watches its cadence tick
       reads and whose `recordDocketRead` records each docket read (monitoring R67, R68). */
    const caseImport = caseImportOf(ctx);
    const monitoring = monitoringOf(ctx, { env, caseImport });
    /* link-sweep (N506), after monitoring, whose seam it registers with at creation (`registerSweep`, monitoring R66:
       C-18.5's sweep arm, the fence and the slate share), handed the composed capture-requests (its R12) and capture.
       Built before the scheduler, whose `gathering-sweep` owner (`linkSweepOf(ctx)`, scheduler R5) then reaches this
       instance, the one per storage (K1210). */
    linkSweepOf(ctx, { monitoring, captureRequests, capture });
    /* R21 (T33-79): following, after monitoring whose sweep host it reads, built before the scheduler reaches it
       (scheduler R21's `follow` consumer and its `onFollowed` notice). */
    followingOf(ctx, { monitoring, events, entities: entitiesOf(ctx), capture });
    /* R19 (N528; DEC-120, DEC-121): wizard-scripts, first in layer 11, built here before every layer-11 reader
       (affordances, queue-producers, control-plane). At creation it creates its tables, declares them to purge (K23) and
       registers its ids' seed; it is then registered, once and before the first request, with the bundle's screens and
       library, the member op table, the acts a machine is refused and the labelled machine drafts (its R13). */
    wizardScriptsOf(ctx, { env }).wizardRegister(wizardRegistration());
    /* K2044, K2054 (admission R21): admission's door window, built at its place in layer 11 so its table is made and
       declared through record-core before the first request; its fingerprint is capture's (its R56). */
    admissionOf(ctx);
    promotion.registerStep(STEP, promotionStep(ctx));   /* R10 (K861, K2037): store-door's step (its R5), the testimony slot and the sight index */
    observationLogOf(ctx).listenToCapture(capture);
    /* R26 (K2153; scheduler R24): file-safety handed to the scheduler as the owner of its four batch consumers
       (`file-scan`, `file-render`, `file-deeper`, `file-forward`) before its start, since its default owners do not
       build it. */
    schedulerOf(ctx, env, { fileSafety });
    /* R3: the migration pass, then scheduler's start. */
    ctx.blockConcurrencyWhile(async () => this.#migrate());
    ctx.blockConcurrencyWhile(async () => schedulerOf(ctx, env).start());
    /* queue, then tasks, each creating its own tables (queue R36, tasks R8). R11: queue is handed the two modules
       `queue-producers` R20 and R21 read, R15 the docket its R30's items read (`Queue.PRODUCER_DEPS`), and R20 the
       case-import its R35's watch items read. */
    /* R21 (T33-82; queue R51; K1683): notice-producers, over the instances it reads, handed to queue beside
       queue-producers' deps. */
    const noticeProducers = noticeProducersOf(ctx, { membership: membershipOf(ctx), people, moneyChecks: moneyChecksOf(ctx), duties,
                                                     answers: answersOf(ctx), inquiry: inquiryOf(ctx) });
    /* K1868 (2): queue-producers' one instance per storage, built here with the providers queue would hand it
       (`Queue.PRODUCER_DEPS`), since its factory reads its deps on the first call only; handed to queue as its producers
       and to instance-setup, whose start registers `placeArrivals` through it (instance-setup R62, queue-producers R38),
       so neither builds it bare. */
    const queueDeps = { env, filingTemplates, localFacts, docket, caseImport, noticeProducers };
    const queueProducers = queueProducersOf(ctx, Object.fromEntries(
      Queue.PRODUCER_DEPS.filter((k) => queueDeps[k] !== undefined).map((k) => [k, queueDeps[k]])));
    queueOf(ctx, { ...queueDeps, producers: queueProducers }).migrate();
    tasksOf(ctx, { env }).migrate();
    /* K1951, K2042, K2046: the daemon's drain of capture's `archive-unpack` events, registered with the scheduler after
       tasks' `task-drain` (scheduler R8), each event asked of the Worker as `op=unpack` through `SELF`. */
    schedulerOf(ctx, env).register("plane", archiveUnpackConsumer({ capture: () => captureOf(ctx), env }));
    /* R1: instance-setup started once per object (its `start` is idempotent on one storage), built here first, with the
       queue's producers (K1868 (2)). */
    const instanceSetup = instanceSetupOf(ctx, env, { queueProducers });
    ctx.blockConcurrencyWhile(async () => {
      const started = await instanceSetup.start();
      /* F16 (K2038; capture R73, capture-sources R65): the group's own hosts, once the store is migrated and started so
         instance-setup's claim reads, handed once to capture (for acquisition R42, adopted from the first caller that
         names them) and to capture-sources' credentials (R55, R56); a claim made later is read at the next
         construction. */
      let identity = null;
      try { identity = instanceSetup.groupIdentity(); } catch { identity = null; }
      /* R28 (N745; installer R47): the copy's own hosts the installer binds, `OWN_HOSTS`, joined with the claim's. */
      const ownHosts = ownHostsOf(identity, env.OWN_HOSTS);
      /* R29 (K2087, K2130; acquisition R44): capture (for acquisition) is handed the `FILE_SCANNER` binding and a reader
         of file-safety's reputation tool, asked at each acquisition, never a value read once here. */
      captureOf(ctx, { ownHosts, fileScanner: env.FILE_SCANNER ?? null, reputation: () => fileSafety.reputationTool() });
      captureCredentialsOf(ctx, { key: env.CAPTURE_CREDENTIALS_KEY ?? null, ownHosts });
      return started;   /* R1: the blocked work answers instance-setup's start */
    });
  }

  /* R3: record-core's `RECORD_SCHEMA` first, then each owner's `migrate()` in this order. */
  #migrate() {
    recordOf(this.ctx).migrate();
    /* REC-143 — THE ADDITIVE COLUMNS ARE ADDED BEFORE THE OWNERS' TABLES RUN, AND AGAIN AFTER THEM.
       CREATE TABLE IF NOT EXISTS does nothing to a table that already exists, so a column added after a store was first
       written needs adding by hand; these are additive and nullable, so an older row simply has no writer. Every
       release from 0.59.0 to 0.63.0 bricked an existing store because an index on such a column ran before the column
       was added: so the whole list runs first, for every table that already exists, and again after the tables are
       created, for a table created on this boot. Both passes are guarded on PRAGMA and so idempotent on every boot. */
    const ADDITIVE_COLUMNS = [
      /* REC-18 / DATA-MODEL D1(b): the registry ENTITY a question is about, one nullable projection column derived from
         bundle.md's `subject_entity`, written in the same transaction as inquiry_basis (D-21). Not indexed (REC-17). */
      ["bundles", "inquiry_subject_entity", "TEXT"],
    ];
    const addColumns = () => {
      for (const [table, column, decl] of ADDITIVE_COLUMNS) {
        const have = [...this.sql.exec(`PRAGMA table_info(${table})`)].map((r) => r.name);
        /* An absent table reads as no columns: it is skipped here and its owner creates it. */
        if (have.length && !have.includes(column)) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
      }
    };
    addColumns();

    calibrationOf(this.ctx).migrate();
    membershipOf(this.ctx).migrate();
    /* N783 (K2270, K2294): project-roster, split from membership, directly after it in the modules' order: its three
       tables (`project_join_requests`, `project_owner_votes`, `project_owner_decisions`), so a fresh store holds them as
       a migrated one does, declared to purge (its R18). Its first construction is its start: its invitation and hiding
       listeners (its R15, R16) are registered with membership before the first request. */
    projectRosterOf(this.ctx).migrate();
    credentialsOf(this.ctx).migrate();   /* after membership's: its listener and claim fact registered */
    provenanceOf(this.ctx).migrate();
    attestationOf(this.ctx).migrate();   /* `receipt_keys`, `signed_receipts` (N512; attestation R10) */
    provenanceRoutesOf(this.ctx).migrate();   /* `provenance_route_marks` (N512; provenance-routes R12) */
    contentOf(this.ctx).migrate();
    connectionsOf(this.ctx).migrate();
    basisVersionsOf(this.ctx).migrate();
    inquiryOf(this.ctx).migrate();
    governorOf(this.ctx, { env: this.env }).migrate();
    captureOf(this.ctx).migrate();
    fileSafetyOf(this.ctx).migrate();   /* R26: its tables, declared to purge (its R25), directly after capture's */
    extractionOf(this.ctx).migrate();
    observationLogOf(this.ctx).migrate();   /* before the run log folds into its tables below */
    runProductionsOf(this.ctx).migrate();
    captureRequestsOf(this.ctx).migrate();
    aiRunsOf(this.ctx, this.env).migrate();   /* ai-runs' two late columns and the ai_run_log fold (its R38) */
    entitiesOf(this.ctx).migrate();
    /* R21 (T33-90): layer 5's new modules' tables, in the modules' order, after entities and before retrieval, whose
       views read them (each idempotent; money's, people's, events' and lines' factories create none). */
    eventsOf(this.ctx).migrate();
    linesOf(this.ctx).migrate();
    standardsOf(this.ctx).migrate();
    moneyOf(this.ctx).migrate();
    moneyChecksOf(this.ctx).migrate();
    dutiesOf(this.ctx).migrate();
    peopleOf(this.ctx).migrate();
    legEarningOf(this.ctx).migrate();   /* `inquiry_basis`, leg-earning's since T33-45 (its R12) */
    hypothesesOf(this.ctx).migrate();
    contradictionOf(this.ctx).migrate();
    progressionsOf(this.ctx).migrate();
    biasOf(this.ctx).migrate();
    intentOf(this.ctx).migrate();
    docketOf(this.ctx).migrate();   /* R15: its tables, in the modules' order (directly after publication) */
    caseImportOf(this.ctx).migrate();   /* R17: its tables, in the modules' order (after ratification and case-checker) */
    networkNoticesOf(this.ctx).migrate();   /* its tables, in the modules' order (after project-stage) */
    /* R11 (K921): layer 9's two new modules, in the modules' order: local-facts' table, then filing-templates' tables
       and its take of the library `filings` R26 kept (a template already taken is passed over). */
    localFactsOf(this.ctx).migrate();
    filingTemplatesOf(this.ctx).migrate();
    filingTemplatesOf(this.ctx).migrateFromFilings();
    wizardScriptsOf(this.ctx).migrate();   /* R19: its tables, in the modules' order (first in layer 11) */

    addColumns();   /* REC-143: the second pass */
    retrievalOf(this.ctx).migrate();   /* retrieval's projection columns, text index and selections, and its backfill */

    recordOf(this.ctx).seedMintLedger(MINT_LEDGER_LIVE);
  }

  /* B2 (K1674, K1684): `op=ask`'s work on the `bio` object, reached over the object's RPC from the door's arm (no route:
     R5). */
  async ask(args) { return askOnObject(this.ctx, this.env, args || {}); }
  /* R19 (N686; K2038; control-plane R57): a draft's account and grant on the `bio` object, reached over the object's
     RPC by control-plane's door (no route: R5). */
  async draft(args) { return draftOnObject(this.ctx, this.env, args || {}); }

  /* R4: scheduler's. */
  async alarm() { await schedulerOf(this.ctx, this.env).alarm(); }
  async onAlarm(now) { return await schedulerOf(this.ctx, this.env).onAlarm(now); }
  /* scheduler's alarm read (its R13), reached over the object's RPC by scheduler's plane test. */
  async schedAlarmAt() { return await schedulerOf(this.ctx, this.env).alarmAt(); }

  /* R1, R5: every store request passes store-door's one frame (K2043). R14 (DEC-113; control-plane R46): it is handed the
     object's namespace, R2's own name (`bio` or `scratch`, else `bio`, so an object whose name is unknown is the real
     record's and fails closed), and `actions`' `purgeHeld` (its R60) on this storage, each asked at the purge only. */
  async fetch(req) {
    return dispatch(req, { routes: (url, body, grant) => this.routes(url, body, grant), membership: () => membershipOf(this.ctx),
      namespace: () => this.#ownNamespace() || "bio", purgeHeld: (q) => actionsOf(this.ctx).purgeHeld(q),
      /* B5 (K1685; answers R1, R2): a read served under a grant is recorded in this object's read log, scrubbed. */
      logRead: (entry) => answersOf(this.ctx).logRead(entry) });
  }

  /* The injectable clock: an explicit instant, else `BIO_NOW_MS` (so a suite pins "now"), else the wall clock.
     Milliseconds. An absent param (null or "") falls through to env, not to Number(null) === 0. */
  #nowMs(explicit) {
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      const e = Number(explicit);
      if (Number.isFinite(e) && e >= 0) return e;
    }
    const v = Number(this.env && this.env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }

  /** The namespace this Durable Object IS, asked of the runtime rather than remembered: the door routes every call to
   *  `idFromName("bio")` or `idFromName("scratch")`, and a Durable Object's id equals the one it was named by. Null for
   *  any other object (a suite's private instance), never a guess: a default here would let a resumed run touch the
   *  real record while the run lived in scratch. */
  #ownNamespace() {
    const ns = this.env && this.env.STORE;
    if (!ns || typeof ns.idFromName !== "function" || !this.ctx.id || typeof this.ctx.id.equals !== "function")
      return null;
    for (const name of ["bio", "scratch"]) if (this.ctx.id.equals(ns.idFromName(name))) return name;
    return null;
  }

  /* R5: the one route map, every module's own ops map (the `membershipOps` pattern), then instance-setup's, then
     control-plane's, in this order; this module holds no route of its own. */
  routes(url, body, grant = null) {
    const ctx = this.ctx, env = this.env;
    return {
      ...membershipOps(membershipOf(ctx), url, body, env),
      /* N783 (K2270): project-roster's ops (`projectowner*`, `projectvisibility`, `projectdirectory`,
         `projectparticipants`, `projectrequest*`), split from membership, directly after its map. */
      ...projectRosterOps(projectRosterOf(ctx), url, body, env),
      ...credentialsOps(credentialsOf(ctx), url, body, env),
      /* K2042 (acquisition R43; CONTROL-PLANE #24 J3): the group's co-archive setting, acquisition's one instance per
         host, at acquisition's place before capture's map; `by` is the door's stamp. */
      coarchiveset: () => acquisitionOf(ctx).coArchiveSet({ on: body ? body.on : undefined, by: url.searchParams.get("by") }),
      coarchivestate: () => acquisitionOf(ctx).coArchiveState(),
      ...captureOps(captureOf(ctx), url, body, env),
      /* R26: file-safety's ops (op-declarations R32), at its place directly after capture's map. */
      ...fileSafetyOps(fileSafetyOf(ctx), url, body, env),
      ...calibrationOps(calibrationOf(ctx), url, body),
      ...biasOps(biasOf(ctx), url, body),
      ...extractionOps(extractionOf(ctx), url, body, env),
      ...connectionsOps(connectionsOf(ctx), url, body, env),
      ...inquiryOps(inquiryOf(ctx), url, body),
      /* K1619: `basis`, `restson`, `earnedbasis` are leg-earning's, after inquiry's delegating entries so its own win. */
      ...legEarningOps(legEarningOf(ctx), url),
      ...hypothesesOps(hypothesesOf(ctx), url, body),   /* K1607 */
      ...citationOps(citationOf(ctx), url),
      ...observationLogOps(observationLogOf(ctx), url, body),
      ...runProductionsOps(runProductionsOf(ctx), url, body),
      ...entitiesOps(entitiesOf(ctx), url, body),
      /* R21 (T33-90): layer 5's new modules' maps, in the modules' order (control-plane R53 routes them). */
      ...eventsOps(eventsOf(ctx), url, body),
      ...linesOps(linesOf(ctx), url, body),
      ...moneyOps(moneyOf(ctx), url, body),
      ...moneyChecksOps(moneyChecksOf(ctx), url, body),
      ...dutiesOps(dutiesOf(ctx), url, body),
      ...peopleOps(peopleOf(ctx), url, body),
      ...exploreOps(this.explore, url, body),
      ...calculationsOps(calculationsOf(ctx), url, body),
      ...workbooksOps(workbooksOf(ctx), url, body),
      ...contradictionOps(contradictionOf(ctx), url, body),
      ...progressionOps(progressionsOf(ctx), url, body),
      ...intentOps(intentOf(ctx), url, body),
      ...basisVersionsOps(basisVersionsOf(ctx), url, body),
      ...strengthOps(strengthOf(ctx), url, body),
      ...reevaluationOps(reevaluationOf(ctx), url, body),
      ...caseAuthoringOps(caseAuthoringOf(ctx), url, body),
      ...ratificationOps(ratificationOf(ctx), url, body),
      /* R17 (N520, N522): case-import's ten member ops (`importwatch` and `importunwatch` the watch's, R20);
         case-checker's public reads `casechecker` and `casefilespec` are public-read's (its R18). */
      ...caseImportOps(caseImportOf(ctx), url, body),
      /* N483 (K1122): `export` and `exportlog` are corpus-export's (its R6), on the one instance publication created. */
      ...corpusExportOps(corpusExportOf(ctx), (k) => url.searchParams.get(k)),
      /* K1643: `caseflags` and `attribute` are case-tensions', on the one instance publication's factory made. */
      ...caseTensionsOps(caseTensionsOf(ctx), url, body),
      ...publicationOps(publicationOf(ctx), url, body),
      /* R18 (T37; K2226): case-carriage's `obscuremark`, `photomarks` and `obscuremarkwithdraw` (its R9, R10, R14), directly after publication's, over
         the one instance publication's factory made. */
      ...caseCarriageOps(publicationOf(ctx).caseCarriage, url, body),
      /* R15 (N520): docket's member ops; its public reads `docketpublic` and `docketfeed` are public-read's (its R21). */
      ...docketOps(docketOf(ctx), url, body),
      ...publicReadOps(publicReadOf(ctx), url),
      ...projectStageOps(projectStageOf(ctx), url),
      ...networkNoticesOps(networkNoticesOf(ctx), url, body),   /* noticeprepare, noticepost, notices, directorysubmission */
      ...promotionOps(promotionOf(ctx), url, body),
      /* record-core's audit gated by membership's sight (record-core R73). */
      ...recordCoreOps(recordOf(ctx), url, body, { sight: viewerPredicate }),
      /* `recordcapturedlocator` reports observation-log's receipt listener. */
      ...provenanceOps(provenanceOf(ctx), url, body, { observer: OBSERVATION_LOG_MODULE }),
      /* `provenancechain`, `provenanceroute`, `provenanceroutes`: provenance-routes' (its R9; N512), at the place
         provenance's map held them. */
      ...provenanceRouteOps(provenanceRoutesOf(ctx), url, body),
      ...contentOps(contentOf(ctx), url, body),
      ...captureRequestsOps(captureRequestsOf(ctx), url, body),
      ...governorRoutes(governorOf(ctx), url, body),
      ...aiRunsOps(aiRunsOf(ctx, env), url, body),
      ...answersOps(answersOf(ctx), url, body),   /* R21 (K1609) */
      ...retrievalRoutes(retrievalOf(ctx), url, body),
      ...actionsOps(actionsOf(ctx), url, body),
      ...actionClocksOps(actionClocksOf(ctx), url, body),
      ...localFactsOps(localFactsOf(ctx), url, body),   /* R11 (K921) */
      ...standardsOps(standardsOf(ctx), url, body),
      ...conformanceOps(conformanceOf(ctx), url, body),
      ...consequencesOps(consequencesModule(ctx), url, body),
      ...filingsOps(filingsOf(ctx), url, body),
      /* R11 (K921): after filings', so `op=templates`, in both maps until filings drops its arm, is filing-templates' (K991). */
      ...filingTemplatesOps(filingTemplatesOf(ctx), url, body),
      ...actionPlansOps(actionPlansOf(ctx), url, body),   /* `optionpropose` answers a promise, which the frame awaits */
      ...escalationOps(escalationOf(ctx), url, body),
      ...monitoringOps(monitoringOf(ctx), url, body),
      ...linkSweepOps(linkSweepOf(ctx), url),   /* `sweeps` (link-sweep R9), at the place monitoring's map held it (N506) */
      ...followingOps(followingOf(ctx), url, body),   /* R21 (T33-79) */
      ...reviewOps(reviewOf(ctx), url, body),
      ...wizardScriptsOps(wizardScriptsOf(ctx), url, body),   /* R19 (N528): the wizard scripts' ops, layer 11 */
      ...instanceSetupOps(instanceSetupOf(ctx, env), url, body),
      /* K2044, K2054 (admission R21): the Worker's count of a request to a public op, `doorwindow`, store-internal */
      ...admissionOps(admissionOf(ctx), url, body),
      /* store-door's map (its R1); the grant its door read from the header is handed on (its R11, K2041) */
      ...controlPlaneRoutes(ctx, url, body, grant),
    };
  }
}
