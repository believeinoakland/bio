import { DurableObject } from "cloudflare:workers";
import { actionsOf, actionsOps } from "./actions/index.mjs";
import { actionClocksOf, actionClocksOps } from "./action-clocks/index.mjs";
/* N216 (K250): the layer-9 modules built with no `from`, constructed on this object's host and their ops dispatched here. */
import { standardsOf, standardsOps } from "./standards/index.mjs";
import { conformanceOf, conformanceOps } from "./conformance/index.mjs";
import { consequencesModule, consequencesOps } from "./consequences/index.mjs";
import { filingsOf, filingsOps } from "./filings/index.mjs";
import { escalationOf, escalationOps } from "./escalation/index.mjs";
import { actionPlansOf, actionPlansOps } from "./action-plans/index.mjs";
/* K31: the one write path, extracted to `promotion`; this store registers its share of every promotion there. */
import { promotionOf, promotionOps, stepContext } from "./promotion/index.mjs";
import { provenanceOf } from "./provenance/index.mjs";
import { provenanceOps } from "./provenance/ops.mjs";
/* The D-15 viewer gate (membership R43), handed to record-core's audit as its sight; this file builds no query of its own. */
import { membershipOf, membershipOps, hiddenBundles, viewerPredicate } from "./membership/index.mjs";
import { credentialsOf, credentialsOps } from "./credentials/index.mjs";
import { observationLogOf, observationLogOps, OBSERVATION_LOG_MODULE } from "./observation-log/index.mjs";
import { runProductionsOf, runProductionsOps } from "./run-productions/index.mjs";
import { captureRequestsOf, captureRequestsOps } from "./capture-requests/index.mjs";
import { recordOf, recordCoreOps } from "./record-core/index.mjs";
import { registerInquiryGrammar } from "./inquiry-grammar/index.mjs";
export { stampInstant, instantOrder } from "./record-core/index.mjs";
import { governorOf, governorRoutes } from "./host-governor/index.mjs";
import { captureOf, captureOps } from "./capture/index.mjs";
import { monitoringOf, monitoringOps } from "./monitoring/index.mjs";
import { connectionsOf, connectionsOps } from "./connections/index.mjs";
import { inquiryOf, inquiryOps, legCapped } from "./inquiry/index.mjs";
import { citationOf, citationOps } from "./citation/index.mjs";
import { extractionOf, extractionOps } from "./extraction/index.mjs";
import { entitiesOf, entitiesOps } from "./entities/index.mjs";
import { basisVersionsOf, basisVersionsOps } from "./basis-versions/index.mjs";
import { contradictionOf, contradictionOps } from "./contradiction/index.mjs";
import { calibrationOf, calibrationOps } from "./calibration/index.mjs";
import { schedulerOf } from "./scheduler/index.mjs";
import { progressionsOf, progressionOps } from "./progressions/index.mjs";
import { intentOf, intentOps } from "./intent/index.mjs";
import { strengthOf as strengthModule, strengthOps } from "./strength/index.mjs";
import { reevaluationOf, reevaluationOps } from "./reevaluation/index.mjs";
import { reviewOf, reviewOps } from "./review/index.mjs";
import { caseAuthoringOf, caseAuthoringOps } from "./case-authoring/index.mjs";
import { ratificationOf, ratificationOps } from "./ratification/index.mjs";
import { publicationOf, publicationOps } from "./publication/index.mjs";
import { publicReadOf, publicReadOps } from "./public-read/index.mjs";
import { projectStageOf, projectStageOps } from "./project-stage/index.mjs";
import { biasOf, biasOps } from "./bias/index.mjs";
import { aiRunsOf, aiRunsOps, hiddenRuns } from "./ai-runs/index.mjs";
import { contentOf, contentOps } from "./content/index.mjs";
/* retrieval (K61): the projection, the text index, search, selections, the content axis and the frontier are its. */
import { retrievalOf, retrievalRoutes } from "./retrieval/index.mjs";

/* BIO store, plane layer, step 1.
 *
 * Replaces storeReadAdapter_, storeWriteAdapter_, indexWriteAdapter_ and the
 * Drive traversal helpers from promotion-service.gs (about 890 lines) with SQL
 * against the Durable Object's embedded SQLite.
 *
 * What is deliberately absent, because the plane makes it unnecessary:
 *   - findBundleFolder_ / allBundleFolders_ / typeRootFor_ traversal: a primary
 *     key replaces four type roots and getFoldersByName.
 *   - duplicateBundleIds_ / duplicatePaths_ / duplicatePathError_: the refusal
 *     machinery for Drive's same-name defect. A primary key cannot collide.
 *   - completeInterruptedCreation_ and the .pending manifest-last marker: one
 *     transaction cannot be half applied.
 *   - the deadline, checkpoint, cursor and budget parameters: no execution
 *     ceiling.
 *
 * What is preserved exactly: promotion is the sole writer of live state, the
 * CAS is the lost-update floor, history is append-only, the register is the
 * root of trust, and the gate runs over a byte-complete image.
 */


export class Store extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sql = ctx.storage.sql;
    // record-core: the evidence bucket and its key prefix, handed over at its first construction. legacy-store
    // declares no table to purge: each owner declares its own (K23).
    recordOf(ctx, { evidence: env.CAPTURES ?? null, evidencePrefix: () => `${this.#ownNamespace() || "bio"}/captures/` });
    recordOf(ctx).registerStatsSource("legacy-store", ({ viewer, proof }) => this.#counts({ proof, viewer }));
    /* K31: promotion, which reaches record-core and membership through their factories on this ctx; legacy-store
       registers its share of every promotion (later modules' checks, projections and facts) until each is extracted. */
    /* provenance (K61): declares its tables and joins every promotion before legacy-store does, so its register write
       runs before the store's projections that read it. observation-log registers its look on each receipt (its R5,
       provenance R47), and listens to extraction's reading notice once extraction exists (below). */
    observationLogOf(ctx, { extraction: null,
      provenance: provenanceOf(ctx, { signingKey: env.RECEIPT_SIGNING_KEY ?? null, instanceName: env.INSTANCE_NAME || "unnamed" }) });
    const promotion = promotionOf(ctx);
    /* extraction (K31, K61): its projection joins every promotion before legacy-store's (R20). */
    /* content (K61): created on extraction's instance here, so its stale mark (REC-82, its R22) is registered before
     * observation-log's rows (its R6–R8), in the modules' total order (extraction R24). */
    observationLogOf(ctx).listenTo(contentOf(ctx, { extraction: extractionOf(ctx, { env, promotion, calibration: calibrationOf(ctx) }) }).extraction);
    /* entities (K61, R13): observation-log records each resolution attempt on entities' notice (its R8). */
    observationLogOf(ctx).attachMeaning({ entities: entitiesOf(ctx) });
    /* retrieval (K31, K61): its projection and text index join every promotion before legacy-store's step. legacy-store
       registers with it what later modules own until each is extracted (K75 (2), K80, K96): the action facts (actions
       R12, over the clock rule `#actionDerived` reads), the leg grades (inquiry's earned registry and `legCapped`),
       the single-bundle projection's decorations (actions, inquiry, ai-runs), the frontier's hidden-run tail (ai-runs,
       D-486) and the selection sweep's arming (scheduler). */
    const retrieval = retrievalOf(ctx, { now: () => this.#nowMs(null) });
    registerInquiryGrammar(recordOf(ctx));   /* inquiry-grammar R6 (K812): before basis-versions, whose R43 runs at its sub-slot */
    basisVersionsOf(ctx, { retrieval });   /* basis-versions registers its projection decoration (its R42) */
    aiRunsOf(ctx, env);   /* ai-runs (K61) registers with retrieval before legacy-store does, in the modules' order */
    /* reevaluation before actions: actions reaches conformance, which reaches reevaluation, and a factory reads its
       `deps` on the first call only, so created there it would never see `env` (its R25). */
    reevaluationOf(ctx, { env });
    /* publication (K365): built here, after reevaluation, so its case reads are registered with reevaluation (its R41,
       R43; reevaluation R26) before anything runs. Built lazily, a sweep an alarm reached before any op found none. */
    publicationOf(ctx);
    actionsOf(ctx, { env });
    retrieval.registerLegGrades("legacy-store", (legs) => {
      const cap = inquiryOf(ctx).earned(null, [...new Set(legs.map((l) => l.target_id))])?.earned?.capture || {};
      return legs.map((l) => legCapped(l.grade, cap[l.target_id], l.target_id));
    });
    observationLogOf(ctx).attachMeaning({ connections: connectionsOf(ctx, { env }) });
    /* inquiry (K31, K61): its check and projection join promotion before legacy-store's step; strength R28 here. */
    ratificationOf(ctx);   /* ratification (K61): its case catalogue and C-2.8's case-member arm, registered at start (R8, R9) */
    strengthModule(ctx, { retrieval });   /* strength (K61): registers its pair (R17), its cache projection (R13) and, with retrieval, the cache's fields (R23) */
    /* bias (K61): joins every promotion before legacy-store (R8–R10). */
    biasOf(ctx, { env });
    /* run-productions (K61, K120): created here, after content, connections, strength and citation, so it declares its
       tables to purge (R17) and registers its candidates with basis-versions (R14). ai-runs is handed over
       as its own module (its R28–R29). */
    runProductionsOf(ctx, { aiRuns: aiRunsOf(ctx, env) });
    reviewOf(ctx);
    intentOf(ctx);   /* intent (K61, K198): its check (R1, R2, R26) joins every promotion before legacy-store's; its audit check keeps C-2.9 (R22) */
    caseAuthoringOf(ctx);
    /* N216 (K250): layer 9, in the modules' order, each registering at start what its factory registers (checks,
       projections, purge, filings' evidence block). standards creates its own tables at construction (N267). */
    const conformance = conformanceOf(ctx);
    const consequences = consequencesModule(ctx, { conformance });
    actionClocksOf(ctx);   /* action-clocks (K704): after actions, which it reads and which joins the host first (its R9) */
    filingsOf(ctx, { actions: actionsOf(ctx), conformance, standards: standardsOf(ctx), consequences });
    escalationOf(ctx);   /* on this host, it reaches conformance, consequences, actions and filings through their factories */
    /* action-plans (K711): built after layer 9, before any route can run, so ai-runs holds its plan-mode open check
       (its R30) when the first `airunopen` arrives; built lazily, that open is refused AI_RUN_MODE_UNCHECKED. */
    actionPlansOf(ctx);
    monitoringOf(ctx, { env });
    promotion.registerStep("legacy-store", { check: (c) => this.#promoteChecks(c), project: (c) => this.#promoteProjections(c) });
    const capture = captureOf(ctx, { env });
    /* capture-requests (K58, K61): its table, its `sweep` resolver and its drain; the run sight it reads is ai-runs'
       (its R28), and it registers its wait source with ai-runs (ai-runs R41). */
    captureRequestsOf(ctx, { env, storeName: () => this.#ownNamespace() || "bio", now: () => this.#nowMs(null),
      runs: aiRunsOf(ctx, env), aiRuns: aiRunsOf(ctx, env) });
    observationLogOf(ctx).listenToCapture(capture);
    schedulerOf(ctx, env);
    ctx.blockConcurrencyWhile(async () => this.#migrate());
    ctx.blockConcurrencyWhile(async () => schedulerOf(ctx, env).start());
  }

  #migrate() {
    recordOf(this.ctx).migrate();
    /* CREATE TABLE IF NOT EXISTS does nothing to a table that already exists, so
       columns added after a store was first written need adding by hand. Done
       here rather than in a versioned migration ladder because these are
       additive and nullable: an older row simply has no writer, which is exactly
       what a hand-authored promotion means. */
    /* REC-143 — THE ADDITIVE COLUMNS ARE ADDED BEFORE THE SCHEMA RUNS, AND AGAIN AFTER IT.
       Every release from 0.59.0 to 0.63.0 BRICKED an existing store: the schema carries
       `CREATE INDEX IF NOT EXISTS inquiry_basis_content ON inquiry_basis(content_id)` (REC-90),
       this list is what adds `content_id` to an `inquiry_basis` written before REC-82, and this
       list used to run AFTER the schema — so on every pre-REC-82 store the index hit the OLD
       table, threw `no such column: content_id` inside blockConcurrencyWhile, and the Durable
       Object answered nothing.
       *
       * ONE MECHANISM, NOT A SPECIAL CASE PER COLUMN. The sweep (MEASUREMENTS.md, REC-143) found
       * three schema indexes on a column only this list adds — `inquiry_basis(content_id)`,
       * `inquiry_basis_version_legs(content_id)`, `reading_text_source(calibrations)` — and the
       * next one will be written by somebody who does not know this paragraph exists. So the
       * WHOLE list runs first, for every table that already exists, and nothing a later landing
       * appends to it can reintroduce the defect.
       *
       * THE SECOND PASS, AFTER THE SCHEMA, IS NOT REDUNDANT. A table the schema creates on this
       * boot does not exist during the first pass, and many columns below live ONLY here and not
       * in their table's CREATE (every `bundles` projection column, `members.handle`) — so a
       * fresh store, or an old store gaining a table, gets them from the second pass. Both passes
       * are guarded on PRAGMA and are therefore idempotent on every boot. */
    const ADDITIVE_COLUMNS = [
      /* REC-18 / DATA-MODEL D1(b): the registry ENTITY this question is about,
         and it is the whole of the subject-entity linkage — one nullable
         projection column, no new table, no join row, no ordinal.
         WHY A COLUMN AND NOT A TABLE. D4's reasoning for giving inquiry_basis
         its own table was that a basis needs an ORDINAL (one document, two
         legs) and a place to put a GRADE. A subject has neither: it is one
         optional scalar fact about one bundle, exactly the shape S-10's
         projection columns exist for, and a table would be a second place to
         state it with nothing extra to hold.
         WHY NOT `refs`. refs targets are BUNDLE ids and an ENT- key is not one;
         widening the universal edge projection to carry registry keys is the
         blast-radius argument D4 already made about grades on edges.
         DERIVED from bundle.md's `subject_entity`, written in the same
         transaction as inquiry_basis by the same discipline (D-21). Nullable
         and additive: a question with no subject entity has none, and DEC-15
         states exactly what that costs — no A/B/C on its connection axis.
         NOT INDEXED, on REC-17's stated reasoning: it is read BY bundle_id
         (the primary key) while building a write's earned registry, and no
         seek anybody makes is on its value. */
      ["bundles", "inquiry_subject_entity", "TEXT"],
      /* REC-42: `inquiry_basis.ground` is inquiry's migration now (its R36). */
      /* REC-82: `inquiry_basis.content_id` is inquiry's migration now (its R36). */
    ];
    const addColumns = () => {
      for (const [table, column, decl] of ADDITIVE_COLUMNS) {
        const have = [...this.sql.exec(`PRAGMA table_info(${table})`)].map((r) => r.name);
        /* An absent table reads as no columns: it is skipped here and the schema creates it. */
        if (have.length && !have.includes(column)) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
      }
    };
    addColumns();

    /* Each owner runs its own tables (`schema.mjs` holds no fragment): record-core's first, above, then the rest. */
    calibrationOf(this.ctx).migrate();   /* calibration's tables (R20) */
    membershipOf(this.ctx).migrate();   /* membership's tables (R57–R59) */
    credentialsOf(this.ctx).migrate();   /* credentials' tables (R18), after membership's: its listener and claim fact registered */
    provenanceOf(this.ctx).migrate();   /* provenance's tables (R41), likewise: its schema is its own */
    contentOf(this.ctx).migrate();      /* content's tables (R39), likewise, with the chain_kind and cited_as migrations */
    connectionsOf(this.ctx).migrate();  /* connections' tables (R36), likewise, with the pair columns' migrations */
    basisVersionsOf(this.ctx).migrate();   /* basis-versions' tables (R34) and their additive columns */
    inquiryOf(this.ctx).migrate();      /* inquiry's tables (R36), their columns' migrations and the superseded-by backfill */
    governorOf(this.ctx, { env: this.env }).migrate();   /* host-governor's table and its purge exemption (R24) */
    captureOf(this.ctx).migrate();      /* capture's tables, likewise */
    extractionOf(this.ctx).migrate();   /* extraction's tables, their migrations and the name-term backfill (R37) */
    observationLogOf(this.ctx).migrate();   /* observation-log's tables (R22, R23), before the run log folds into them below */
    runProductionsOf(this.ctx).migrate();   /* run-productions' tables (R17) */
    captureRequestsOf(this.ctx).migrate();   /* capture-requests' table, its additive columns and indexes (R35) */
    aiRunsOf(this.ctx, this.env).migrate();   /* ai-runs' two late columns and the ai_run_log fold (its R38) */
    entitiesOf(this.ctx).migrate();     /* entities' tables, R8's withdrawal columns and their purge declaration (R30) */
    contradictionOf(this.ctx).migrate();   /* contradiction's table and its purge declaration (R22) */
    progressionsOf(this.ctx).migrate();   /* progressions' tables and REC-184's column (R29) */
    biasOf(this.ctx).migrate();   /* bias's tables and its settled_kind column (R45) */
    intentOf(this.ctx).migrate();   /* intent's tables (R24) */

    /* REC-143: the second pass — see ADDITIVE_COLUMNS above the schema for why there are two. */
    addColumns();
    retrievalOf(this.ctx).migrate();   /* retrieval's projection columns, text index and selections, and its backfill (K4, R3) */

    recordOf(this.ctx).seedMintLedger(Store.#MINT_LEDGER_LIVE);
  }

  async alarm() { await schedulerOf(this.ctx, this.env).alarm(); }
  async onAlarm(now) { return await schedulerOf(this.ctx, this.env).onAlarm(now); }
  /* scheduler's alarm read, reached over the object's RPC by scheduler's plane test. */
  async schedAlarmAt() { return await schedulerOf(this.ctx, this.env).alarmAt(); }

  /* K31 (promotion R39): legacy-store's share of every promotion's checks. Registered with `promotion` in the
     constructor; a refusal here refuses the whole promotion. Provenance's testimony slot (its R52) runs its registered
     checks (content's C-45 extent check, asked before anything is written) where that check stood. */
  #promoteChecks(c) {
    return provenanceOf(this.ctx).testimonySlot().check(c);
  }

  /* K31 (promotion R39): legacy-store's share of every promotion's projections, run after `record-core.commit`
     inside the same transaction. The answer's keys promotion does not already carry are added to its answer. */
  #promoteProjections(c) {
    const { bundleId, meta, owner } = stepContext(c);
    const cur = c.head;
      /* D-497: the SIGHT INDEX follows the bundle row that decides whether this is a project at all. ONE call
         covers all three arrivals — a project created here gains a row carrying the derivation's default, a
         bundle promoted INTO a project gains one, and a bundle promoted OUT of `project` loses its row rather
         than leaving a sight row standing over something that is no longer a project. It is a derivation, so
         it is idempotent: a revision that changes neither recomputes the same row. */
      membershipOf(this.ctx).reindexProjectSight(bundleId);

      /* MK-1 / D-184: the testimony path's own writes (extraction's index, content's row, observation-log's look),
         provenance's testimony slot (its R52), IN THIS TRANSACTION, so an authored bundle never exists without the
         content its readers expect. A refusal throws to roll the whole promotion back rather than return a half. */
      const slot = provenanceOf(this.ctx).testimonySlot().project(c);
      if (slot && slot.ok === false)
        throw new Error(`MK-1: the observation's testimony work was refused: ${slot.code || slot.reason}`);

      const after = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      return { ok: true, bundleId, bundleSha: after.bundle_sha, rowVersion: after.row_version, owner,
        /* REC-197: present ONLY on a project's creation — the setting it was created with, READ BACK through
           membership's `visibilityOf` (the one reader) rather than echoed from the request, so an absent field
           answers `hidden` because the record says so. */
        ...(!cur && meta.object_type === "project" ? { visibility: membershipOf(this.ctx).visibilityOf(bundleId) } : {}),
        /* MK-1: present ONLY on the testimony path, so no other caller's answer gains a key. */
        ...(slot && slot.testimony ? { testimony: slot.testimony } : {}),
      };
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* The injectable clock. Env-overridable exactly as REC-5 made its cadence/batch env-overridable
     (BIO_NOW_MS), so a suite pins "now" and the overdue computation is deterministic; a caller may
     also pass an explicit instant (op=proposals&now=<ms>, an as-of read, the same seam op=sourcereach
     opened for its time-armed verdict). Falls through to the wall clock in production. Milliseconds. */
  #nowMs(explicit) {
    /* an ABSENT param is null (or "") -- fall through to env, NOT to Number(null)===0 (epoch). */
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      const e = Number(explicit);
      if (Number.isFinite(e) && e >= 0) return e;
    }
    const v = Number(this.env && this.env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }




  /* D-432: the live rows the PROJ mint site's `taken` reads, as `[prefix, table, column]`, seeded at every boot (record-core
     R40). The CASE rows are ratification's and publication's registered seeds (record-core R70). */
  static #MINT_LEDGER_LIVE = Object.freeze([["PROJ", "bundles", "bundle_id"]]);

  /** The one body behind both answers, so the wire's counts and purge's proof cannot drift apart
   *  on any key but the ones the ruling names. `proof` is PRIVATE: only `purge` passes it, because
   *  its before/after ARE D-113's proof that it took what it says it took, and that proof stays
   *  WHOLE (§5: *the purge proof's own count stays whole*) — `observations` over the whole log,
   *  `leads`, and `dbBytes`, exactly as `op=purge` has always answered. No route reaches it. */
  #counts({ proof, viewer }) {
    /* D-464 — A COUNT IS TAKEN THROUGH THE CALLER'S OWN SIGHT (Membership v2 §7.9, *"Not its existence"*).
     *
     * WHAT WAS WRONG, measured at the op (`project-sight.test.mjs` §8; MEASUREMENTS M-122 first saw it): every
     * counter here was `count(*)` over the whole table, so a member diffing their own `op=stats` across a colleague's
     * work learned that a project they were never invited to had been CREATED (`bundles`, `files`, `refs`, `indexed`,
     * `projectParticipants`) and REVISED (`history`, `files`, `refs`). BOB #15's rule (MEMBER-KNOWLEDGE-DESIGN §5, *A
     * COUNT IS A DISCLOSURE OF EXISTENCE*) is the same sentence: a count over rows the caller could not all read.
     *
     * THE FIX IS SUBTRACTION, NEVER A SECOND RULE. `hid` is every bundle the caller's `viewerPredicate` does NOT pass
     * — the complement of the one compiled gate, interpolated (a use, not a mint) — and every counter whose rows NAME
     * a bundle drops the rows naming one in `hid`. Today the gate hides PROJECTS only, so `hid` is the projects the
     * caller cannot see; were the gate ever to hide more, these counts follow it without an edit. A key is named per
     * counter below (which column names a bundle); a counter with no such column counts rows that name no bundle —
     * an instance fact (REC-110) — and is untouched.
     *
     * WHO IS FILTERED IS THE GATE'S WORD, NOT THIS FUNCTION'S. A credential the gate does not filter (scope `member`:
     * the four token classes and an organisation `ai` key) gets `hid` = nothing, i.e. exactly the count it always got,
     * and an enrolled ADMINISTRATOR's session passes every project (§7.9). A viewer SENT but not
     * recognised (an empty stamp included) is DENY, so `hid` is every bundle — fails closed. A viewer NEVER SENT
     * (`undefined`: the DO route passes one only when the parameter is present) is a direct INTERNAL call and stays
     * WHOLE — purge's proof, and the suites that read the store's own counters — `Store#rosterInSight`'s never-sent
     * precedent. So the stamp is LOAD-BEARING at the control plane: every door (`op=stats`, `op=selftest`,
     * `op=livefire`) sets it, and the `stats-stamp-dropped` control arm measures what dropping it discloses.
     * CORRECTED before landing: the first draft read an absent parameter as DENY, which zeroed the counters four
     * store-level suites read straight off the DO route (projects, search, selection, status) — a direct internal
     * call is not a caller. */
    /* D-464's bundle subtraction is membership's `hiddenBundles` (its R88, N352); D-486's run subtraction is ai-runs'
       R42 (N191), for `observationsNonLead`. Both keep D-464's
       reading of the never-sent stamp: `undefined` is a direct internal call and stays WHOLE, so it is not asked. */
    const hid = viewer === undefined ? null : hiddenBundles(viewer);
    const runTail = viewer === undefined ? { sql: "", args: [] } : hiddenRuns(viewer);
    /* `COALESCE(k, '')`: a NULL key names no bundle, and `NULL NOT IN (…)` is NULL — the row would be dropped. */
    const nx = (t, where, keys = []) => {
      const conds = where ? [where] : [], args = [];
      if (hid) for (const k of keys) { conds.push(`COALESCE(${k}, '') NOT IN ${hid.sql}`); args.push(...hid.args); }
      return this.#one(`SELECT count(*) c FROM ${t}${conds.length ? ` WHERE ${conds.join(" AND ")}` : ""}`, ...args).c;
    };
    const n = (t, ...keys) => nx(t, null, keys);
    const mon = monitoringOf(this.ctx).counts();
    /* Each provider's counts asked once per answer, not once per key. The figures a module registers with record-core
       (its R63) are its own, spread after these: provenance, extraction, capture, content, entities, connections,
       progressions, bias, retrieval, ai-runs and capture-requests take none here. */
    const prod = runProductionsOf(this.ctx).counts(hid);
    return {
      bundles: n("bundles", "bundle_id"), files: n("files", "bundle_id"), history: n("history", "bundle_id"),
      refs: n("refs", "bundle_id", "target_id"),
      textIndexOk: extractionOf(this.ctx).textIndexOk(),
      /* REC-26: the monitoring consumers' idempotence state, reported so a purge
         can PROVE it took them (D-113) and so an operator can see a tick that is
         still open — a non-zero monitorTickEpoch means the last tick failed on
         something and the next one will be its retry. */
      /* REC-191: and the address types. The three are monitoring's tables, counted whole-store by its R46 (N266). */
      monitorFired: mon.monitorFired, monitorTickEpoch: mon.monitorTickEpoch, monitorAddressType: mon.monitorAddressType,
      /* REC-27 / D-137: the participation graph and the pending owner-governance
         votes, reported so a purge can PROVE it took them (both are keyed on
         project_id, a bundle id, and were the silent-leftover the D-113 check
         could not see). */
      projectParticipants: n("project_participants", "project_id"),
      projectOwnerVotes: n("project_owner_votes", "project_id"),
      /* SK-8: the EXTRACT role's proposed readings, reported so a purge can
         PROVE it took them (D-113) and — the part that is not housekeeping — so
         an operator can see the assistant's production volume beside the content
         axis it feeds, without opening one. A COUNT AND NOTHING ELSE: what a
         machine proposed is not an operator surface, the same line `queueState`
         and `aiRuns` draw. The minted-to-cited ratio §7.3 (6) asks for is NOT
         here and is deliberately not: it is scoped to a run or a document
         (`op=extractproposals`), and an instance-wide fraction would average
         across projects that have nothing to do with each other. */
      proposedReadings: prod.proposedReadings,
      /* REC-173: the questions whose creation was a verified migration replay, counted for D-85's reason one line up. */
      inquiryMigrationReplays: n("inquiry_migration_replays", "bundle_id"),
      /* REC-131 / IC-148 — `leads` IS NOT ON THE WIRE FOR ANY CLASS, AND THE WIRE'S LOG COUNT IS A
         DIFFERENT KEY FROM PURGE'S. BOB #15's CORRECTED ruling (`MEMBER-KNOWLEDGE-DESIGN.md` §5, *A
         COUNT IS A DISCLOSURE OF EXISTENCE*): a counter over rows a caller could not all read goes
         only to a caller who could read them all, and for leads THAT CALLER DOES NOT EXIST —
         `#leadVisibleTo` reaches no `class:*` credential and skips the administrator arm on purpose,
         so the admin token reads no lead either. REC-129 (IC-144) handed both keys to the admin
         class; that was the overclaim, and this supersedes it.
         *
         * ONE KEY NEVER CARRIES TWO MEANINGS (BOB.md rule 7, BOB #15 resuming REC-131). The wire's
         * count EXCLUDES lead looks, so it is published as `observationsNonLead` — a name that
         * states its predicate (`authority_kind <> 'lead'`), so that a later construct ruled
         * existence-private cannot join the exclusion without a rename, i.e. without an IC. Purge's
         * `observations` keeps the WHOLE-log meaning it has always had. The wire carries no
         * `observations` key at all, so no reader can compare the two under one name. It stays on
         * the wire because OBSERVATION-LOG-DESIGN §6's REC-110 ruling rests on it (premise 1): the
         * three built frontier levels' tallies count no lead row either. `aiRunLog` above is
         * untouched: no lead act writes a 'run' row. */
      ...(proof
        ? { observations: n("observation_log") }   /* PURGE'S PROOF: the WHOLE log. The TABLE it counts is `observation_log` — renamed by CONDUCT #11 at integration on BOB #11's correction, because one word over three unrelated things is the defect, not the noun */
        : { observationsNonLead: this.#one(
              /* D-486 / BOB #32: the wire's log count subtracts a hidden project's RUN rows for the same reason
                 `aiRunLog` does — and ONLY those. The lead exclusion and this one are two predicates over one
                 table and are deliberately not folded: `authority_kind <> 'lead'` states the key's NAME (REC-131:
                 a key never carries two meanings), while the run subtraction is the CALLER's sight and moves with
                 the viewer. A rename would be an IC; this is a subtraction inside the name the key already has. */
              `SELECT count(*) c FROM observation_log WHERE authority_kind <> 'lead'${runTail.sql}`, ...runTail.args).c }),
      /* MK-4 / IC-136: a COUNT of members' leads and nothing else, so a purge can
         PROVE it took them (D-113). What any lead says is not an operator fact —
         and since REC-131, neither is how many there are: purge's proof only. */
      ...(proof ? { leads: n("leads") } : {}),
      /* PL-1 / IS-1: the inquiry's alternative accounts of its evidence and
         their legs, reported so a purge can PROVE it took them (D-113). A COUNT
         AND NOTHING ELSE, the same line queueState and aiRuns draw: how many
         readings of the evidence exist is an operator fact, and what they say is
         not an operator surface. */
      basisVersions: n("inquiry_basis_versions", "bundle_id"),
      basisVersionLegs: n("inquiry_basis_version_legs", "bundle_id", "target_id"),
      /* PL-3 / IS-4: F10's stored refusals, reported so a purge can PROVE it
         took them (D-113) and so an operator can see that a run is looping
         against a refusal without opening one. A COUNT AND NOTHING ELSE — the
         same line queueState, aiRuns and basisVersions draw. */
      suggestRefusals: prod.suggestRefusals,
      /* N342 (K445): every module's registered figures (record-core R63), after the literal keys: queue's `tasks`,
         `findingDispositions`, `queueState` and `queueItemMutes` (its R42) among them. */
      ...recordOf(this.ctx).counts(hid),
    };
  }

  /** The namespace this Durable Object IS, asked of the runtime rather than remembered: `index.mjs`'s
   *  `scopeFor` routes every call to `idFromName("bio")` or `idFromName("scratch")`, and a DO's id equals the one
   *  it was named by. Null for any other object (a suite's private instance) — the dispatch then says it could
   *  not name the namespace, rather than guessing one: a default here would let a resumed run touch the real
   *  record while the run lived in scratch. */
  #ownNamespace() {
    const ns = this.env && this.env.STORE;
    if (!ns || typeof ns.idFromName !== "function" || !this.ctx.id || typeof this.ctx.id.equals !== "function")
      return null;
    for (const name of ["bio", "scratch"]) if (this.ctx.id.equals(ns.idFromName(name))) return name;
    return null;
  }

  routes(url, body) {
      const map = {
        ...membershipOps(membershipOf(this.ctx), url, body, this.env),
        ...credentialsOps(credentialsOf(this.ctx), url, body, this.env),
        ...captureOps(captureOf(this.ctx), url, body, this.env),
        ...calibrationOps(calibrationOf(this.ctx), url, body),
        ...biasOps(biasOf(this.ctx), url, body),
        ...extractionOps(extractionOf(this.ctx), url, body, this.env),
        ...connectionsOps(connectionsOf(this.ctx), url, body, this.env),
        ...inquiryOps(inquiryOf(this.ctx), url, body),
        ...citationOps(citationOf(this.ctx), url),
        /* MK-4 / D-681: the lead's ops, observation-log's (K3); the stamps are the control plane's, read from the query. */
        ...observationLogOps(observationLogOf(this.ctx), url, body),
        /* run-productions' ops (K3): op=suggest and the extract productions; the stamps are the control plane's. */
        ...runProductionsOps(runProductionsOf(this.ctx), url, body),
        ...entitiesOps(entitiesOf(this.ctx), url, body),
        ...contradictionOps(contradictionOf(this.ctx), url, body),
        ...progressionOps(progressionsOf(this.ctx), url, body),
        ...intentOps(intentOf(this.ctx), url, body),
        ...basisVersionsOps(basisVersionsOf(this.ctx), url, body),
        ...strengthOps(strengthModule(this.ctx), url, body),
        ...reevaluationOps(reevaluationOf(this.ctx), url, body),
        ...caseAuthoringOps(caseAuthoringOf(this.ctx), url, body),
        ...ratificationOps(ratificationOf(this.ctx), url, body),
        ...publicationOps(publicationOf(this.ctx), url, body),
        /* public-read and project-stage (K651, K671): their unstamped published reads and `op=projectstage`. */
        ...publicReadOps(publicReadOf(this.ctx), url),
        ...projectStageOps(projectStageOf(this.ctx), url),
        /* promotion's `promote`, `reopen`, `projectfork` (its R54). */
        ...promotionOps(promotionOf(this.ctx), url, body),
        /* record-core's `allocid`, `lease`, `snapkeycensus`, `digestcensus`, `stats`, `audit`, `purge` (its R72), the audit
           gated by membership's sight (R73). */
        ...recordCoreOps(recordOf(this.ctx), url, body, { sight: viewerPredicate }),
        /* provenance's nine (its R53); `recordcapturedlocator` reports observation-log's receipt listener. */
        ...provenanceOps(provenanceOf(this.ctx), url, body, { observer: OBSERVATION_LOG_MODULE }),
        /* content's eight (its R50). */
        ...contentOps(contentOf(this.ctx), url, body),
        ...captureRequestsOps(captureRequestsOf(this.ctx), url, body),
        ...governorRoutes(governorOf(this.ctx), url, body),
        ...aiRunsOps(aiRunsOf(this.ctx, this.env), url, body),
        /* retrieval's ops (K3): frontier, contentaxis, projection, search, meaningrows, searchfields, select, selection,
           selectionlist, selectionrelease, searchindexcheck, projectionplan, projectionclear, reproject, list, index,
           image, file. */
        ...retrievalRoutes(retrievalOf(this.ctx), url, body),
        ...actionsOps(actionsOf(this.ctx), url, body),
        ...actionClocksOps(actionClocksOf(this.ctx), url, body),   /* K704: op=reminderset, op=reminderanswer */
        /* N216 (K250, K263): layer 9's ops. */
        ...standardsOps(standardsOf(this.ctx), url, body),
        ...conformanceOps(conformanceOf(this.ctx), url, body),
        ...consequencesOps(consequencesModule(this.ctx), url, body),
        ...filingsOps(filingsOf(this.ctx), url, body),
        /* action-plans (K671, K711): its ops; `optionpropose` answers a promise, which the frame awaits as `airun`'s. */
        ...actionPlansOps(actionPlansOf(this.ctx), url, body),
        ...escalationOps(escalationOf(this.ctx), url, body),   /* its ten (its R25) */
        ...monitoringOps(monitoringOf(this.ctx), url, body),
        /* CASE-5b: the case ceremony's three hops. */
        ...reviewOps(reviewOf(this.ctx), url, body),
      };
      return map;
  }
}
