/* plane R1–R5: the instance's Durable Object class, the composition root. It builds every module on the object's storage
   in the order below (R2), runs their migrations before any request (R3), hands the alarm to `scheduler` (R4), and answers
   every store request through `control-plane`'s `dispatch` over the one route map (R5). It holds no construct of its own:
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
import { credentialsOf, credentialsOps } from "../credentials/index.mjs";
import { observationLogOf, observationLogOps, OBSERVATION_LOG_MODULE } from "../observation-log/index.mjs";
import { runProductionsOf, runProductionsOps } from "../run-productions/index.mjs";
import { captureRequestsOf, captureRequestsOps } from "../capture-requests/index.mjs";
import { recordOf, recordCoreOps } from "../record-core/index.mjs";
import { registerInquiryGrammar } from "../inquiry-grammar/index.mjs";
import { governorOf, governorRoutes } from "../host-governor/index.mjs";
import { captureOf, captureOps } from "../capture/index.mjs";
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
import { publicReadOf, publicReadOps } from "../public-read/index.mjs";
import { projectStageOf, projectStageOps } from "../project-stage/index.mjs";
import { networkNoticesOf, networkNoticesOps } from "../network-notices/index.mjs";
import { corpusExportOf, corpusExportOps } from "../corpus-export/index.mjs";
import { biasOf, biasOps } from "../bias/index.mjs";
import { aiRunsOf, aiRunsOps } from "../ai-runs/index.mjs";
import { contentOf, contentOps } from "../content/index.mjs";
import { retrievalOf, retrievalRoutes } from "../retrieval/index.mjs";
import { queueOf } from "../queue/index.mjs";
import { tasksOf } from "../tasks/index.mjs";
import { instanceSetupOf, instanceSetupOps } from "../setup.mjs";
import { dispatch, controlPlaneRoutes } from "../control-plane/dispatch.mjs";
import { promotionStep } from "../control-plane/step.mjs";
import { registerOwnersCounts, registerStats } from "./stats.mjs";

/* The name control-plane's promotion step (its R42) is registered under. */
const STEP = "control-plane";

/* The order promotion ranks its steps by: the modules' total order (membership R83), with control-plane's step (its R42;
   R10) after every module of layer 10 and before `affordances`' and `tasks`', the rank the step has held since it was
   `legacy-store`'s, so every step's checks and projections, and the order of refusals, are today's. Promotion ranks a name the
   order lacks last (its R39). */
export const STEP_ORDER = Object.freeze((() => {
  const o = MODULE_ORDER.filter((m) => m !== STEP);
  const at = o.indexOf("affordances");
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
    /* R10 (K861): the stats figures, each owner's registered under its own name (record-core R63), and the plane's own
       stats sight (record-core R65). */
    registerOwnersCounts(ctx);
    registerStats(ctx);
    /* promotion, built first with the order its steps rank by (membership, then promotion, as provenance's first call
       built them), so control-plane's step ranks after layer 10 and before `affordances` (STEP_ORDER). */
    const promotion = promotionOf(ctx, { order: STEP_ORDER });
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
    /* retrieval: its projection and text index join every promotion. */
    const retrieval = retrievalOf(ctx, { now: () => this.#nowMs(null) });
    registerInquiryGrammar(recordOf(ctx));   /* inquiry-grammar R6 (K812): before basis-versions, whose R43 runs at its sub-slot */
    basisVersionsOf(ctx, { retrieval });   /* basis-versions registers its projection decoration (its R42) */
    aiRunsOf(ctx, env);   /* ai-runs registers with retrieval, in the modules' order */
    /* reevaluation before actions: actions reaches conformance, which reaches reevaluation, and a factory reads its
       `deps` on the first call only, so created there it would never see `env` (its R25). */
    reevaluationOf(ctx, { env });
    /* publication (K365): built here, after reevaluation, so its case reads are registered with reevaluation (its R41,
       R43; reevaluation R26) before anything runs. Built lazily, a sweep an alarm reached before any op found none. */
    publicationOf(ctx);
    /* network-notices (DEC-111, K1100), at its place after project-stage: at creation it creates and declares its tables,
       registers its notice ids' mint seed and its three public reads (public-read R18), all before the first request;
       the scheduler reaches it for `working-on-seal` and `working-on-attest` (scheduler R5), with this environment. */
    networkNoticesOf(ctx, { env, attestation });
    actionsOf(ctx, { env });
    retrieval.registerLegGrades("inquiry", inquiryLegGrades(ctx));   /* R10 (K861): inquiry's leg grades (its R52, retrieval R55) */
    observationLogOf(ctx).attachMeaning({ connections: connectionsOf(ctx, { env }) });
    ratificationOf(ctx);   /* ratification: its case catalogue and C-2.8's case-member arm, registered at start (R8, R9) */
    strengthOf(ctx, { retrieval });   /* strength: registers its pair (R17), its cache projection (R13) and, with retrieval, the cache's fields (R23) */
    biasOf(ctx, { env });
    /* R12 (K1061; inquiry R53, bias R40): inquiry's findings registered with bias as kind `finding`, after bias is built
       with its environment above (its factory reads its deps on the first call only), so a lens change raises a debt on
       a finding concluded under it. */
    biasOf(ctx).registerWorkProducts("finding", inquiryFindings(ctx, biasOf(ctx)));
    /* run-productions: created after content, connections, strength and citation, so it declares its tables to purge
       (R17) and registers its candidates with basis-versions (R14). ai-runs is handed over as its own module (its
       R28–R29). */
    runProductionsOf(ctx, { aiRuns: aiRunsOf(ctx, env) });
    reviewOf(ctx);
    intentOf(ctx);   /* intent: its check (R1, R2, R26) joins every promotion; its audit check keeps C-2.9 (R22) */
    caseAuthoringOf(ctx, { attestation });   /* its `attestationsOf` (its R35; attestation R7) */
    /* layer 9, in the modules' order, each registering at start what its factory registers (checks, projections,
       purge, filings' evidence block). standards creates its own tables at construction. R11 (K921): local-facts heads
       the layer, creating its table and declaring it to purge (record-core K23). */
    const localFacts = localFactsOf(ctx);
    const conformance = conformanceOf(ctx);
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
    /* capture-requests: its table, its `sweep` resolver and its drain; the run sight it reads is ai-runs' (its R28),
       and it registers its wait source with ai-runs (ai-runs R41). Built before link-sweep and handed to it, so
       link-sweep's sweep scope check (its R12) is registered at construction and a sweep-named request drained before
       the first sweep service is judged, never refused for want of a check (K1163). */
    const captureRequests = captureRequestsOf(ctx, { env, storeName: () => this.#ownNamespace() || "bio",
      now: () => this.#nowMs(null), runs: aiRunsOf(ctx, env), aiRuns: aiRunsOf(ctx, env) });
    const monitoring = monitoringOf(ctx, { env });
    /* link-sweep (N506), after monitoring, whose seam it registers with at creation (`registerSweep`, monitoring R66:
       C-18.5's sweep arm, the fence and the slate share), handed the composed capture-requests (its R12) and capture.
       Built before the scheduler, whose `gathering-sweep` owner (`linkSweepOf(ctx)`, scheduler R5) then reaches this
       instance, the one per storage (K1210). */
    linkSweepOf(ctx, { monitoring, captureRequests, capture });
    promotion.registerStep(STEP, promotionStep(ctx));   /* R10 (K861): control-plane's step (its R42), the testimony slot and the sight index */
    observationLogOf(ctx).listenToCapture(capture);
    schedulerOf(ctx, env);
    /* R3: the migration pass, then scheduler's start. */
    ctx.blockConcurrencyWhile(async () => this.#migrate());
    ctx.blockConcurrencyWhile(async () => schedulerOf(ctx, env).start());
    /* queue, then tasks, each creating its own tables (queue R36, tasks R8). R11: queue is handed the two modules
       `queue-producers` R20 and R21 read (`Queue.PRODUCER_DEPS`). */
    queueOf(ctx, { env, filingTemplates, localFacts }).migrate();
    tasksOf(ctx, { env }).migrate();
    /* R1: instance-setup started once per object (its `start` is idempotent on one storage). */
    ctx.blockConcurrencyWhile(async () => instanceSetupOf(ctx, env).start());
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
    extractionOf(this.ctx).migrate();
    observationLogOf(this.ctx).migrate();   /* before the run log folds into its tables below */
    runProductionsOf(this.ctx).migrate();
    captureRequestsOf(this.ctx).migrate();
    aiRunsOf(this.ctx, this.env).migrate();   /* ai-runs' two late columns and the ai_run_log fold (its R38) */
    entitiesOf(this.ctx).migrate();
    contradictionOf(this.ctx).migrate();
    progressionsOf(this.ctx).migrate();
    biasOf(this.ctx).migrate();
    intentOf(this.ctx).migrate();
    networkNoticesOf(this.ctx).migrate();   /* its tables, in the modules' order (after project-stage) */
    /* R11 (K921): layer 9's two new modules, in the modules' order: local-facts' table, then filing-templates' tables
       and its take of the library `filings` R26 kept (a template already taken is passed over). */
    localFactsOf(this.ctx).migrate();
    filingTemplatesOf(this.ctx).migrate();
    filingTemplatesOf(this.ctx).migrateFromFilings();

    addColumns();   /* REC-143: the second pass */
    retrievalOf(this.ctx).migrate();   /* retrieval's projection columns, text index and selections, and its backfill */

    recordOf(this.ctx).seedMintLedger(MINT_LEDGER_LIVE);
  }

  /* R4: scheduler's. */
  async alarm() { await schedulerOf(this.ctx, this.env).alarm(); }
  async onAlarm(now) { return await schedulerOf(this.ctx, this.env).onAlarm(now); }
  /* scheduler's alarm read (its R13), reached over the object's RPC by scheduler's plane test. */
  async schedAlarmAt() { return await schedulerOf(this.ctx, this.env).alarmAt(); }

  /* R1, R5: every store request passes control-plane's one frame. */
  async fetch(req) {
    return dispatch(req, { routes: (url, body) => this.routes(url, body), membership: () => membershipOf(this.ctx) });
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
  routes(url, body) {
    const ctx = this.ctx, env = this.env;
    return {
      ...membershipOps(membershipOf(ctx), url, body, env),
      ...credentialsOps(credentialsOf(ctx), url, body, env),
      ...captureOps(captureOf(ctx), url, body, env),
      ...calibrationOps(calibrationOf(ctx), url, body),
      ...biasOps(biasOf(ctx), url, body),
      ...extractionOps(extractionOf(ctx), url, body, env),
      ...connectionsOps(connectionsOf(ctx), url, body, env),
      ...inquiryOps(inquiryOf(ctx), url, body),
      ...citationOps(citationOf(ctx), url),
      ...observationLogOps(observationLogOf(ctx), url, body),
      ...runProductionsOps(runProductionsOf(ctx), url, body),
      ...entitiesOps(entitiesOf(ctx), url, body),
      ...contradictionOps(contradictionOf(ctx), url, body),
      ...progressionOps(progressionsOf(ctx), url, body),
      ...intentOps(intentOf(ctx), url, body),
      ...basisVersionsOps(basisVersionsOf(ctx), url, body),
      ...strengthOps(strengthOf(ctx), url, body),
      ...reevaluationOps(reevaluationOf(ctx), url, body),
      ...caseAuthoringOps(caseAuthoringOf(ctx), url, body),
      ...ratificationOps(ratificationOf(ctx), url, body),
      /* N483 (K1122): `export` and `exportlog` are corpus-export's (its R6), on the one instance publication created. */
      ...corpusExportOps(corpusExportOf(ctx), (k) => url.searchParams.get(k)),
      ...publicationOps(publicationOf(ctx), url, body),
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
      ...reviewOps(reviewOf(ctx), url, body),
      ...instanceSetupOps(instanceSetupOf(ctx, env), url, body),
      ...controlPlaneRoutes(ctx, url, body),
    };
  }
}
