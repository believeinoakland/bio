/* ai-runs — THE AI RUN (requirements: `build/requirements/ai-runs.md`, R9–R53). Extracted from `store.mjs` at T7
 * (T6-6's entry; the map is `build/extraction/ai-runs.md`). The vocabulary and pure rules, the deployment order and the
 * rows are `run-rules`' since the split (K617, K649 (1)); this file is the mechanism: the one exit, open, tick,
 * close, the reaper and the wake, the reads, and the services later modules produce under a run through (R28, R29).
 * Since T33-50 it also holds the assistant's use: the counter of every model call's figures per member and local day
 * (R48, R49; since T34-33 one entry per conversation, carrying the calls its sum covers), each member's own daily ceiling
 * and the administrator's lower one for the copy (R50), the two reads of use (R51), and the account a run carries (R52):
 * the one `credentials.accountFor` answers for the act of the member who started it, their own or the group's API key
 * (K1755), the act and its use still that member's; refused by name when no account serves them.
 *
 * THE ONE EXIT (R14, R31) is `#aiRunTerminate`, and it is the only thing that moves a run out of `running`: the
 * terminal log entry and the status change are one transaction, so no run is over while its log is silent. The
 * reaper (`reap`) takes that exit for a run that was killed and called nothing.
 *
 * Reached as `aiRunsOf(ctx, env)` (K61), one instance per Durable Object storage; it reaches record-core,
 * membership, credentials, connections, bias and observation-log through their factories on the same `ctx`. */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK, listenerRefusal, MODULE_ORDER, notAnAdmin } from "../membership/index.mjs";
import { connectionsOf } from "../connections/index.mjs";
import { biasOf } from "../bias/index.mjs";
import { observationLogOf } from "../observation-log/index.mjs";
import { retrievalOf } from "../retrieval/index.mjs";
import { contradictionOf } from "../contradiction/index.mjs";
import { CONDITION_KINDS } from "../observation-log/vocabulary.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { normalizeType, OBJECT_TYPES, isMachineIdentity, MACHINE_CLASS_PREFIX } from "../record-grammar/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { sha256hex, instanceAiCredential } from "../tokens.mjs";
import { localDay } from "../civil-time/index.mjs";
/* The run's vocabulary, pure rules, deployment order and rows are `run-rules`' (K617, K649 (1)); read there, never
   re-exported from here. */
import { RUN_BOUNDS, RUN_ENDINGS, RUN_CONTEXTS, STANDARD_BASIS, OBSERVATION_STATES, OBSERVATION_LEVELS,
         OBSERVATION_COVERAGE, OBSERVATION_COVERAGE_UNDETERMINED, observationCoverage, checkBound, checkCondition,
         checkConsume, checkRunState, finishedBound, runStatusFor, projectGate, runConsultsProjects, checkRunContextKind,
         runPrincipalGate, checkSkillVersion, DEPLOYED_MODES, DEFAULT_MODE, AI_RUNS_CHECKS, RUN_MODES, startAllowed,
         checkVerification, deployable, ASK_MODE, DRAFT_MODE } from "../run-rules/index.mjs";
import * as RUN_RULES from "../run-rules/index.mjs";
import { AI_RUNS_SCHEMA, AI_RUNS_TABLES, AI_RUNS_ADDED_COLUMNS } from "./schema.mjs";

export { AI_RUNS_SCHEMA, AI_RUNS_TABLES } from "./schema.mjs";

/** R50: the provisional daily ceiling per member, in force until a member sets their own, and until M-Q6 measures the
 *  default at the release (plan T33). `tokens` counts every token a call processed (input, output, cache read and cache
 *  write); `calls` counts model calls. */
export const AI_CEILING_DEFAULT = Object.freeze({ tokens: 2_000_000, calls: 200 });
/** R48: the figures of one conversation's `usage`, as `agent-model` returns them (its R5, R6: the sum over its model
 *  calls); token figures are whole numbers, the cost a dollar amount, and any of them `null` where the provider did not
 *  state it. */
export const USAGE_TOKEN_FIGURES = Object.freeze(["input_tokens", "output_tokens", "cache_read_input_tokens",
  "cache_creation_input_tokens"]);
export const USAGE_FIGURES = Object.freeze([...USAGE_TOKEN_FIGURES, "total_cost_usd"]);
/** R50: a provider's refusal for a spent limit (Anthropic's 429 `enforced_spend_limit_reached`), recognised in a reason
 *  or type a caller relays. */
const PROVIDER_LIMIT = /enforced_spend_limit_reached/;

/** A member's id from any of the forms a stamp takes (`member:<id>`, `member:<id>/<tokenId>`, `<id>`); null for a
 *  machine identity, an absent value, or a deploy class. */
function memberIdOf(x) {
  if (typeof x !== "string") return null;
  const t = x.trim();
  if (!t || isMachineIdentity(t) || t.startsWith("class:") || t.startsWith("token:")) return null;
  const bare = t.startsWith("member:") ? t.slice(7) : t;
  const id = bare.split("/")[0];
  return /^[A-Za-z0-9._-]{1,128}$/.test(id) ? id : null;
}

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };

/** R19's SIGHT OF A RUN, as SQL over the run's context column (D-15's bundle gate, the store's `#bundleGate`, a copy of
 *  the small helper, K57): the column must be qualified; a machine credential (membership's `member` scope) sees every
 *  run; an absent or unrecognised viewer none (fail closed); a member a run whose context bundle it may see. The ONE
 *  spelling of "may this viewer see this run": `read`, the tick and close, `runFor` and `hiddenRuns` all compile it. */
function runSight(col, viewer) {
  if (typeof col !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(col))
    throw new Error(`REFUSED: the D-15 bundle gate needs a QUALIFIED column (got ${col}).`);
  const gate = viewerPredicate(viewer);
  if (gate.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [], scope: gate.scope };
  if (gate.scope === "DENY") return { sql: gate.sql, args: [], scope: gate.scope };
  return {
    sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b
            WHERE b.bundle_id = ${col} AND (${gate.sql})))`,
    args: gate.args, scope: gate.scope,
  };
}

/** R42 (N191, N276, D-486): THE ONE PREDICATE FOR "RUNS THIS VIEWER CANNOT SEE", as a WHERE tail over a run id: a
 *  run is kept only when it is one R19 answers `found: true` for, compiled from `runSight` itself, so the tallies and
 *  the reads cannot disagree about a run. A machine credential gets the empty tail; an absent or unrecognised viewer
 *  loses every run (fail closed), as R19 answers it nothing. This is the one place the subtraction is written.
 *
 *  Without `column` it is the tail over `observation_log` that retrieval takes (its R57): rows that are not a run's are
 *  never touched (`authority` also holds sweep, lead and document ids, so the `authority_kind` conjunct is
 *  load-bearing), and `COALESCE` keeps a NULL authority from deciding the answer by accident. With `column` (K333, for
 *  legacy-store's `ai_run_bounds` count) it is the same predicate and args over that column naming a run id; the
 *  column must be a plain identifier, and anything else is refused by the tail that keeps nothing, never
 *  interpolated. Pure over its arguments; never throws (a failure is the fail-closed tail). */
export function hiddenRuns(viewer, column = undefined) {
  const byColumn = column !== undefined;
  const closed = byColumn ? { sql: " AND 0=1", args: [] } : { sql: " AND COALESCE(authority_kind, '') <> 'run'", args: [] };
  try {
    if (byColumn && !(typeof column === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(column))) return closed;
    const seen = runSight("r.context_id", viewer);
    if (seen.scope === "member") return { sql: "", args: [] };
    const inSight = `(SELECT r.run FROM ai_runs r WHERE ${seen.sql})`;
    return byColumn
      ? { sql: ` AND COALESCE(${column}, '') IN ${inSight}`, args: seen.args }
      : { sql: ` AND NOT (authority_kind = 'run' AND COALESCE(authority, '') NOT IN ${inSight})`, args: seen.args };
  } catch {
    return closed;
  }
}

export class AiRuns {
  #waitSource = null;
  #runListeners = [];     // R43: {module, fn, seq}, in the modules' total order
  #openChecks = [];       // R47: {module, mode, fn}, one per mode and one per module
  #deps;
  /** `deps` is for in-process wiring only (never the wire or `env`): `inquiry` (R27's `migratedSurfacing`) and, for a
   *  module test alone, `deployedModes` in place of `run-rules`' `DEPLOYED_MODES`. */
  constructor(ctx, env = {}, deps = {}) {
    this.ctx = ctx;
    this.env = env || {};
    this.#deps = deps || {};
    this.sql = ctx.storage.sql;
    /* R38, R53 (plan T33, Rules (6)): this module's tables, declared explicitly to record-core (its R21). The
       surfacing rows are cleared by the question they name; the runs and their bounds by the whole-store purge only,
       each with the sight R19 gives a run (its context bundle's); the use counter and the ceilings group-wide,
       `admin-only`, cleared only with the whole store. */
    const cls = { expunge: "none", export: "admin-only", derive: "stored", version_chain: false, purge: "clear" };
    recordOf(ctx).declareTable("ai-runs", [
      { name: "inquiry_run_surfacings", ...cls, sight: "bundle" },
      { name: "ai_run_bounds", keys: [], ...cls, sight: "bundle" },
      { name: "ai_runs", keys: [], ...cls, sight: "bundle" },
      { name: "ai_usage", keys: [], ...cls, sight: "group" },
      { name: "ai_ceilings", keys: [], ...cls, sight: "group" },
      { name: "ai_mode_verifications", keys: [], ...cls, sight: "group" },
      /* T41: a step-run's looks (R73), keyed by the observation's seq; the test bar's results and a group's own test
         matters (R75), group-wide, cleared only with the whole store. */
      { name: "ai_run_looks", keys: [], ...cls, sight: "group" },
      { name: "ai_test_bar", keys: [], ...cls, sight: "group" },
      { name: "ai_group_tests", keys: [], ...cls, sight: "group" }]);
    /* R36: observation-log's `run` resolver (a run's log rows are visible to whoever may read the run) and
       retrieval's hidden-run tail (R42's `hiddenRuns`) and `surfaced_in` decoration; R30: the runs as bias's work
       products. */
    observationLogOf(ctx).registerAuthority("run", (run, viewer) => !!this.runFor(run, viewer));
    const retrieval = retrievalOf(ctx);
    retrieval.registerHiddenRunTail("ai-runs", hiddenRuns);
    retrieval.registerProjectionDecoration("ai-runs", (row, { viewer }) => (
      normalizeType(row.object_type) === "inquiry"
        ? this.surfacedIn(row.bundle_id, viewer).then((s) => ({ surfaced_in: s }))
        : { surfaced_in: null }));
    biasOf(ctx, { env: this.env }).registerWorkProducts("ai-run", this.workProducts());
    /* R37: the run gate contradiction offers (its R21, K182), filled from R28 and R5. */
    contradictionOf(ctx).registerRunGate("ai-runs", (run, viewer, caller) => {
      const g = this.runGate(run, viewer, caller, "proposing contradictions under a run");
      return { found: g.found, running: g.running, refusal: g.refusal };
    });
    /* R25–R26: the surfacing step, joining every promotion (promotion R39, K31). */
    promotionOf(ctx).registerStep("ai-runs", { check: (c) => this.#surfacingCheck(c), project: (c) => this.#surfacingProject(c) });
    /* R38: this module's tables' figures, for `op=stats` and purge's proof (record-core R63; moved from the legacy
       store's `#counts`, its `#hiddenRunTail` with them). */
    recordOf(ctx).registerCounts("ai-runs", [...AiRuns.COUNT_KEYS], (hid) => this.counts(hid));
    /* B2 (K2480; steps R1, R8): steps answers "a run it holds" through this module's resolver, registered once at start.
       `steps` is reached as an in-process dependency until its merge re-points it to its factory. */
    const steps = this.#steps();
    if (steps && typeof steps.registerRunHolder === "function")
      steps.registerRunHolder("ai-runs", (by, run) => this.runHolder(by, run));
  }

  /** The `steps` module (T41; R73, R74, B2), or null where it is not reachable. */
  #steps() { return this.#deps.steps || null; }

  /** B2 (K2480): whether `by` holds `run`, for steps' machine arm: `{enabled_by, principal}` for a running run whose
   *  principal `by` is (run-rules R5), `enabled_by` the paying owner the run records (`principal_claude`, R52; ai-use R6's
   *  label) and `principal` its plane principal; null for a blank, unknown or ended run, or one another principal holds.
   *  Writes nothing and never throws. */
  runHolder(by, run) {
    try {
      const id = run == null ? "" : String(run).trim();
      if (!id || typeof by !== "string" || !by.trim()) return null;
      const r = this.#one(`SELECT status, principal_plane, principal_claude FROM ai_runs WHERE run = ?`, id);
      if (!r || r.status !== "running") return null;
      if (runPrincipalGate({ caller: by, principal: r.principal_plane })) return null;
      return { enabled_by: r.principal_claude ?? null, principal: r.principal_plane };
    } catch { return null; }
  }

  /** R38 (D-113, D-464, D-486): the figures of this module's tables, through the caller's sight. `hid` is record-core
   *  R63's: membership's `hiddenBundles` (its R88, the bundles the viewer may not see), or null for a viewer that sees
   *  every bundle and for the direct internal call, which count whole. `aiRuns` drops a run whose context is hidden and
   *  `inquiryRunSurfacings` a row whose question is; `aiRunBounds` and `aiRunLog` (the observation log's run rows) keep
   *  only the rows of a run R19 would answer `found: true` for, as R42's `hiddenRuns` does: with `hid` given, a run is in
   *  sight exactly when its context is a bundle not in `hid`, which is `runSight`'s gate, since `hid` is every bundle the
   *  gate does not pass (every one, for a viewer it refuses). Synchronous; writes nothing. */
  static COUNT_KEYS = Object.freeze(["aiRuns", "aiRunBounds", "inquiryRunSurfacings", "aiRunLog"]);
  counts(hid = null) {
    const c = (q, ...a) => this.#one(q, ...a).c;
    if (!hid) return { aiRuns: c(`SELECT count(*) c FROM ai_runs`), aiRunBounds: c(`SELECT count(*) c FROM ai_run_bounds`),
      inquiryRunSurfacings: c(`SELECT count(*) c FROM inquiry_run_surfacings`),
      aiRunLog: c(`SELECT count(*) c FROM observation_log WHERE authority_kind = 'run'`) };
    const seen = `(SELECT r.run FROM ai_runs r WHERE r.context_id IS NULL OR (r.context_id IN (SELECT bundle_id FROM bundles)
                   AND r.context_id NOT IN ${hid.sql}))`;
    return {
      aiRuns: c(`SELECT count(*) c FROM ai_runs WHERE COALESCE(context_id, '') NOT IN ${hid.sql}`, ...hid.args),
      aiRunBounds: c(`SELECT count(*) c FROM ai_run_bounds WHERE COALESCE(run, '') IN ${seen}`, ...hid.args),
      inquiryRunSurfacings: c(`SELECT count(*) c FROM inquiry_run_surfacings WHERE COALESCE(bundle_id, '') NOT IN ${hid.sql}`,
        ...hid.args),
      aiRunLog: c(`SELECT count(*) c FROM observation_log WHERE authority_kind = 'run' AND COALESCE(authority, '') IN ${seen}`,
        ...hid.args),
    };
  }

  /** R30: the runs as the bias debt's work products (bias R33): `list(after, limit)` the run ids after `after`,
   *  ascending; `read(run)` the run's context, member principal, the lens recorded when it began (the lens in force
   *  at its open where the open recorded one, else the manifest it was handed; null when neither can be read, R32),
   *  the manifest it ran under when that was the lens in force, its `rerun_of`, and `registered` (N284): the run's
   *  `created`, the open's instant, which bias offers the scheduler's rank as the product's `waitingSince` (null
   *  when the stored instant cannot be read, never filled in); `visible(run, viewer)` R19's sight. Read as the
   *  administrator viewer, as bias reads every work product. */
  workProducts() {
    const MEMBER = /^member:([A-Za-z0-9._:-]{1,128}?)(?:\/.*)?$/;
    return {
      list: (after, limit) => this.#rows(`SELECT run FROM ai_runs WHERE run > ? ORDER BY run LIMIT ?`,
        String(after ?? ""), Math.max(1, Math.floor(Number(limit) || 50))).map((r) => String(r.run)),
      read: async (run) => {
        const row = this.#one(`SELECT rerun_of, created FROM ai_runs WHERE run = ?`, String(run ?? ""));
        if (!row) return null;
        /* An internal read, as bias reads every work product: a machine viewer, which sees every run (K2442: the
           founder's `admin` viewer no longer sees a hidden project it is not in, D54). */
        const a = await this.read({ run, viewer: AiRuns.#INTERNAL_VIEWER });
        const s = a && a.found === true ? a.session : null;
        if (!s) return null;
        const bias = s.bias || {};
        const sha = (m) => (m && typeof m.statements_sha === "string" ? m.statements_sha : null);
        const lens = bias.moved_basis === "at_open" ? { basis: "at_open", statements_sha: sha(bias.at_open) }
          : bias.moved_basis === "handed" ? { basis: "handed", statements_sha: sha(bias.manifest) } : null;
        const pm = MEMBER.exec(String((s.principal && s.principal.plane) || ""));
        return {
          context: s.context ? { type: s.context.type, id: s.context.id } : null,
          principal: pm ? pm[1] : null,
          lens,
          ranUnder: bias.in_force === true ? sha(bias.manifest) : null,
          rerunOf: row.rerun_of != null && String(row.rerun_of).trim() ? String(row.rerun_of).trim() : null,
          registered: typeof row.created === "string" && Number.isFinite(Date.parse(row.created)) ? row.created : null,
        };
      },
      visible: async (run, viewer) => !!this.runFor(run, viewer),
    };
  }

  /** The viewer of this module's own internal reads (K2442): a machine identity, never a person's sight. */
  static #INTERNAL_VIEWER = `${MACHINE_CLASS_PREFIX}daemon`;

  /** R35: the row of one of this module's acts' codes, read by key from `run-rules`' table (its R11, R15, R20). */
  #checkRow(code) { return AI_RUNS_CHECKS[code] || AiRuns.#PENDING_ROWS[code]; }

  /** T41 (R73, R75): the codes this job's new acts mint, read from `run-rules`' table by key once it holds them (its R11);
   *  until then each refuses with this row, its number not yet given (J1 (2), J2 (6) to BOB). */
  static #PENDING_ROWS = Object.freeze({
    AI_RUN_ORIGIN_UNKNOWN: { check: null, translation: "A run starts either at a member's act or as exploring; this one named "
      + "neither. Nothing was started." },
    AI_RUN_EXPLORE_NEEDS_STEP: { check: null, translation: "An exploring run works on a step of its own, and none was named. "
      + "Nothing was started." },
    AI_RUN_EXPLORE_NOT_DEPLOYABLE: { check: null, translation: "Exploring is not available yet: it opens only after the assistant "
      + "has passed its tests. Nothing was started." },
    AI_RUN_STEP_UNKNOWN: { check: null, translation: "No such step is open to you. Nothing was started." },
    AI_TEST_BAR_UNFIT: { check: null, translation: "That test result is not complete, so it was not recorded." },
    AI_GROUP_TEST_INVALID: { check: null, translation: "A test investigation needs its matter and the answers your members wrote. "
      + "Nothing was added." },
  });

  /** run-rules R23's `RUN_ORIGINS`, read here until that module's merge carries it (T41-21). */
  static ORIGINS = Object.freeze(["member", "explore"]);

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #membership() { return membershipOf(this.ctx); }
  /** N418 (K650): every write this module makes goes through record-core's `transact` (its R32), so the store's one
   *  transaction, its savepoints and its `afterCommit` (R66) hold over them; never `transactionSync` directly. */
  #transact(fn) { return recordOf(this.ctx).transact(fn); }
  #connections() { return connectionsOf(this.ctx); }
  #bias() { return biasOf(this.ctx); }
  #observations() { return observationLogOf(this.ctx); }

  /** D-15's bundle gate over a run's context column: `runSight`, the one spelling. */
  #bundleGate(col, viewer) { const { sql, args } = runSight(col, viewer); return { sql, args }; }

  /* ---- R16, R17: THE WAIT SOURCE `capture-requests` registers (K71, N39) ---------------------------------------
   * The wake reads the requests a run waits on through this, never `capture_requests` by name. `source` is
   * `{ tickMs(), holds(iso, limit), woken(limit), completions(run, limit), markWoken(requests, iso) }`, all
   * synchronous; `configured()` may be added, and answers whether anything drains at all (the hold is inert where
   * nothing will ever complete). With none registered the wake holds and wakes nothing (R17). */
  registerWaitSource(module, source) {
    const fns = ["tickMs", "holds", "woken", "completions", "markWoken"];
    if (typeof module !== "string" || !module || !source || fns.some((f) => typeof source[f] !== "function"))
      return { ok: false, reason: "WAIT_SOURCE_MALFORMED", detail: `a wait source names its module and ${fns.join(", ")}` };
    if (this.#waitSource) return { ok: false, reason: "WAIT_SOURCE_DECLARED", module, declaredBy: this.#waitSource.module };
    this.#waitSource = { module, source };
    return { ok: true, module };
  }
  #wait() { return this.#waitSource ? this.#waitSource.source : null; }

  /** R43 (N223, K259): a later module's post-write notice (`scheduler`'s R9), called after each successful `open`
   *  commits with `{run, contextType, contextId, expires}`, once per listener, in the modules' total order
   *  (membership's `MODULE_ORDER`, R83). A malformed registration, or a second by the same module, is refused by
   *  membership's `listenerRefusal` (its R81), the one site of LISTENER_MALFORMED and LISTENER_DECLARED. */
  onRunOpened(module, fn) {
    const refused = listenerRefusal(this.#runListeners, module, fn);
    if (refused) return refused;
    const rank = (m) => { const i = MODULE_ORDER.indexOf(m); return i === -1 ? Infinity : i; };
    this.#runListeners.push({ module, fn, seq: this.#runListeners.length });
    this.#runListeners.sort((a, b) => (rank(a.module) - rank(b.module)) || (a.seq - b.seq));
    return { ok: true, module };
  }
  /** R47 (K660): a later module's check for one mode (`action-plans` for `plan`, its R30), registered once at start: a
   *  synchronous `fn({contextType, contextId, plan, actor, viewer}) → null | refusal` that `open` applies last and passes
   *  on unchanged. A malformed registration, or a second (by the same module, or for a mode already held), is refused by
   *  membership's `listenerRefusal` (LISTENER_MALFORMED, LISTENER_DECLARED). */
  registerOpenCheck(module, mode, fn) {
    const m = typeof mode === "string" ? mode.trim() : "";
    const refused = listenerRefusal(this.#openChecks, module, m ? fn : null)
      || listenerRefusal(this.#openChecks.find((c) => c.mode === m) || null, module, fn);
    if (refused) return refused;
    this.#openChecks.push({ module, mode: m, fn });
    return { ok: true, module, mode: m };
  }
  #deployedModes() { return Array.isArray(this.#deps.deployedModes) ? this.#deps.deployedModes : DEPLOYED_MODES; }
  #captureRequestConfigured() {
    const w = this.#wait();
    return !!w && (typeof w.configured !== "function" || w.configured() === true);
  }
  #captureRequestTickMs() { const w = this.#wait(); return w ? Number(w.tickMs()) || 0 : 0; }

  /* An hour, matching capture_sessions' own TTL, and it is a LEASE rather than
     a lifetime: every tick pushes it out. A run that heartbeats lives; a run
     that stops heartbeating is dead within the lease and is reaped. */
  static AI_RUN_LEASE_MS = 3600000;

  /* REC-70 — THE OBSERVATION LOG'S BOUND. NEITHER FIGURE IS NEW, and the PAIR
     is deliberately not copied whole from either sibling, because this log has
     TWO READERS WITH OPPOSITE NEEDS and no single existing pair serves both.

     200 is `op=exportlog`'s default (`EXPORT_LOG_LIMIT_DEFAULT`, REC-57), and
     it is the plane's ONLY other append-only, `seq`-ordered log read. The
     default belongs to the reader who is CHECKING a run — §11's "the log is
     what lets anyone else CHECK" — and a checker wants a page, not a replay.

     5000 is the plane's shared READ CEILING: `op=list`'s, which `op=projection`
     reused at REC-59 and the meaning layer reused at REC-60 rather than minting
     a second. The ceiling belongs to the OTHER reader — §14b.7's RESUMED run,
     which reads its own log to continue rather than restart, and for which a
     cut answer is a run that redoes work it already did. `op=exportlog`'s 1000
     was sized for an administrator scrolling exports; it is the wrong ceiling
     for a machine replaying its own history, and the meaning layer's 500
     default is sized for a member exploring a subject graph that grows on
     D-224's quadratic curve, which a run log does not.

     WHAT THIS DOES NOT GIVE, said plainly rather than left to be discovered
     (REC-60's own sentence, and it applies unchanged): a caller cut at the
     CEILING has no way past it. A run that emits more than 5000 observations
     cannot replay its log whole through this op. No cursor is minted here —
     REC-55's declined-second-copy rule — and the honest bound is published
     instead of the complete answer being promised. */
  static AI_RUN_LOG_LIMIT_DEFAULT = 200;
  static AI_RUN_LOG_LIMIT_MAX = 5000;

  /* REC-69 — THE CONTEXT-KEYED RUN LIST'S PAIR, AND NEITHER FIGURE IS NEW.
   *
   * 200/1000 is `op=versionchain`'s pair, which `op=basisversions` reused
   * rather than minting a second, and this read is the SAME KIND as both: a
   * KEYED lookup — one context, not a query a caller pages through a corpus
   * with — whose answer is a list of the objects hanging off that key. The log
   * pair above is deliberately NOT reused: it bounds ONE RUN'S OBSERVATIONS,
   * which grow one row per tick with nothing capping the tick count, and this
   * bounds THE RUNS IN A CONTEXT, which grow one row per investigation a member
   * launched. Different populations at different rates, so borrowing the log's
   * 5000 ceiling here would be a figure carried across on the strength of the
   * table name alone.
   *
   * WHAT THIS DOES NOT GIVE, on REC-60's sentence and `aiRunLog`'s above: a
   * caller cut at the CEILING has no way past it. No cursor is minted (REC-55's
   * declined-second-copy rule); the honest bound is published instead of the
   * complete answer being promised. */
  static AI_RUNS_LIMIT_DEFAULT = 200;
  static AI_RUNS_LIMIT_MAX = 1000;

  static #aiIso(ms) { return stampInstant("second", ms); }

  /** Append ONE run-log observation. **THE FOLD** (`OBSERVATION-LOG-DESIGN.md`
   *  §4.4): `ai_run_log`'s rows ARE rows of `observations` with
   *  `authority_kind = run`, `authority = <run>`, `actor_class = machine`. This
   *  method is no longer a writer — it is the run's DOOR onto the one writer, and
   *  that is what §4.4 means by *"two writers is not [the landing's call]"*.
   *
   *  ITS BEHAVIOUR DID NOT CHANGE AND THAT IS ASSERTED RATHER THAN CLAIMED:
   *  every entry that was accepted before this landing is accepted now, the
   *  refusal object comes back in the same shape, and `op=airunlog` answers
   *  byte-identically over rows written before the fold. C-22.10 did not fire
   *  on `run` for exactly this reason UNTIL REC-100 (2026-09-18, IC-130): the
   *  rollup ruling gave the run's two rollup writers a referent, and a bare
   *  `run` PRESENT is now refused here like any other — see its catalogue row. */
  #aiRunAppend(run, entry, at, terminal = 0, actor = null, step = null) {
    /* R73: a step-run's entries name its step (observation-log R1, steps R9): its looks, and its wake and terminal
       rollups too, since a rollup's `observation` referent must be a row of its own authority (C-22.10). Each is tied to
       the run here, so the run's log and rollup read them and no other run's. */
    if (step) {
      return this.#appendAs(run, entry, at, terminal, actor, step);
    }
    return this.#appendAs(run, entry, at, terminal, actor);
  }

  #appendAs(run, entry, at, terminal, actor, step = null) {
    const bad = this.#observations().observe({
      actorClass: "machine",
      /* WHO the machine was, PASSED IN BY THE CALLER RATHER THAN LOOKED UP
         HERE, and the change of shape is a finding rather than a preference.
         §4.4 says `actor` is *"the run's credential"*; `ai_runs` HAS NO SUCH
         COLUMN — measured, not assumed — and the column that actually carries
         the machine identity is `principal_claude`, IS-6's Claude principal.
         Reported as a DESIGN GAP against §4.4.
         THE FIRST DRAFT READ IT HERE, with `SELECT principal_claude FROM
         ai_runs`, and `run-conditions.test.mjs` ARM W3 caught it BY NAME: that
         made this method a THIRTEENTH reader of `ai_runs`, and ARM W9 then
         refused the only role that could have fitted, because an ATTRIBUTES
         reader must project nothing but the key. The arms were right twice over.
         The honest fix was not a role but to stop reading: every caller already
         holds the run row it is appending under, so the lookup was also one
         EXTRA SELECT PER APPENDED ENTRY — `op=airuntick` appends N and was
         paying N of them for a value it had in hand.
         A CALLER THAT DOES NOT SAY WRITES NULL, and that is correct rather than
         lossy: attributing a machine's look to the plane's own scheduler would
         be a false attribution in the one field that says who looked. */
      actor: actor || null,
      authorityKind: step ? "step" : "run",
      authority: step ? String(step) : run == null ? null : String(run),
      level: entry && entry.level ? entry.level : "document",
      /* `unstated`, and it is the honest word rather than a derived one.
         `ai_run_log` never recorded what KIND of subject a row was about, so
         deriving one from the level would be the record claiming more than it
         can support — see `OBSERVATION_SUBJECT_KINDS` in run-rules. */
      subjectKind: "unstated",
      subject: entry ? entry.subject : null,
      state: entry ? entry.state : undefined,
      governed: entry ? entry.governed === true : false,
      condition: entry ? entry.condition : null,
      bound: entry ? entry.bound : null,
      resultKind: entry ? (entry.result_kind ?? null) : null,
      resultRef: entry ? (entry.result_ref ?? null) : null,
      detail: entry ? entry.detail : null,
      /* C-22.6 travels through UNCHANGED: the bundle key is what the refusal
         reads, and it is passed rather than dropped here. */
      bundle: entry ? entry.bundle : null,
    }, at, terminal);
    if (!bad && step) {
      const r = this.#one(`SELECT MAX(seq) seq FROM observation_log WHERE authority_kind = 'step' AND authority = ?`, String(step));
      if (r && r.seq != null) this.sql.exec(`INSERT OR IGNORE INTO ai_run_looks (seq, run) VALUES (?, ?)`, r.seq, String(run));
    }
    return bad;
  }

  /** What the run's SEARCH established overall, reduced from the log the run
   *  actually wrote rather than declared by the run about itself.
   *
   *  The order is a strength order over D-129's vocabulary and it is stated
   *  here because it is a judgement: a run that found something says PRESENT
   *  (that is a positive finding, not a coverage claim); otherwise the weakest
   *  honest word wins, and a run with no observations at all says NEVER_LOOKED.
   *
   *  THE OVERRIDE IS THE POINT. When a BOUND stopped the run, a definitive
   *  absence is unavailable to it — not finding something and not finishing the
   *  search are different facts, and only one licenses a conclusion
   *  (`heldMatch`'s lesson, §14b.6's own citation). So LOOKED_ABSENT and
   *  NEVER_LOOKED both become LOOKED_INDETERMINATE on a bounded stop. PRESENT
   *  survives, because a document the run did hold does not stop existing
   *  because the run ran out of time afterwards. */
  /*  REC-100 / IC-130 — AND THE ROLLUP'S REFERENT COMES OUT OF THE SAME READ.
   *  `OBSERVATION-LOG-DESIGN.md` §3, RULED 2026-09-18 by BOB #14: a rollup's
   *  PRESENT carries `result_kind = observation` and `result_ref` = the `seq` of
   *  the LATEST non-terminal PRESENT row of this run, computed HERE and never
   *  supplied by a caller. So this returns `{ state, result_kind, result_ref }`
   *  and both rollup writers (`#aiRunTerminate`, `#aiRunWake`) spread it, rather
   *  than each deriving the pointer beside a state derived elsewhere.
   *
   *  THE INVARIANT THE RULING RESTS ON, and it is structural rather than
   *  checked: `state` is PRESENT exactly when the grouped read returned a PRESENT
   *  group, and that group's `MAX(seq)` IS the referent — one row of one query,
   *  so there is no second read for the two to disagree across. The bound
   *  override below only ever turns LOOKED_ABSENT / NEVER_LOOKED into
   *  LOOKED_INDETERMINATE and never produces or removes PRESENT. A rollup that
   *  is not PRESENT owes no referent and carries none. */
  /** A non-terminal restatement of the rollup (the wake's entry, a dispatch that did not complete): `NEVER_LOOKED` is
   *  never stored as a look (observation-log R3; only a run's terminal rollup may say it, K148), so a run whose own log
   *  holds no look yet restates LOOKED_INDETERMINATE — what its search established is not yet known from its log. */
  #aiRunRestatedState(run) {
    const s = this.#aiRunSearchState(run, false);
    return s.state === "NEVER_LOOKED" ? { ...s, state: "LOOKED_INDETERMINATE" } : s;
  }

  #aiRunSearchState(run, stoppedByBound) {
    const latest = new Map(this.#rows(
      `SELECT state, MAX(seq) seq FROM observation_log
        WHERE ${AiRuns.#ownRows()} AND terminal = 0
        GROUP BY state`, run, run).map((r) => [r.state, r.seq]));
    let s = latest.has("PRESENT") ? "PRESENT"
          : latest.has("partial") ? "partial"
          : latest.has("LOOKED_INDETERMINATE") ? "LOOKED_INDETERMINATE"
          : latest.has("LOOKED_ABSENT") ? "LOOKED_ABSENT"
          : "NEVER_LOOKED";
    if (stoppedByBound && (s === "LOOKED_ABSENT" || s === "NEVER_LOOKED")) s = "LOOKED_INDETERMINATE";
    return s === "PRESENT"
      ? { state: s, result_kind: "observation", result_ref: String(latest.get("PRESENT")) }
      : { state: s, result_kind: null, result_ref: null };
  }

  /** THE ONE EXIT. Every ending goes through here, and the terminal log entry
   *  is written in the same transaction as the status change.
   *
   *  `offered` is what the caller SAYS stopped the run; it is honoured when
   *  given and otherwise derived from the budget rows. Either way the answer
   *  comes out of `finishedBound`, so the reaper holds no arithmetic of its
   *  own. */
  /*  `derive` is the difference between the two kinds of caller, and it is the
   *  thing that makes C-22.5 REACHABLE rather than dead code. Found by this
   *  item's own suite on its first run: with derivation on every path, a close
   *  offering NO bound fell through `finishedBound` to "completed" — a legal
   *  answer — so the refusal that IS §14b.6 could never fire, and an ending
   *  nobody named would have been recorded as a run that finished. So:
   *
   *    - `aiRunClose` derives NOTHING. It is a caller SAYING why the run ended,
   *      and a caller who does not say is refused by name. Inferring "completed"
   *      from silence is exactly the manufactured fact this design refuses
   *      everywhere else.
   *    - `aiRunTick` and `#aiRunReap` DO derive, because there is no caller to
   *      ask: the budget rows and the clock are the only evidence there is, and
   *      `finishedBound` is the one function that reads them.
   */
  #aiRunTerminate({ run, offered = null, condition = null, at, expired = false, derive = true }) {
    const row = this.#one(`SELECT * FROM ai_runs WHERE run = ?`, run);
    if (!row) return { run, found: false,
      note: "no such run: it either never existed or was purged" };
    if (row.status !== "running")
      return { run, found: true, terminated: false, status: row.status,
               bound: row.stopped_bound, condition: row.stopped_condition,
               note: "this run already ended; a second ending would overwrite the first, "
                   + "and the log is append-only for the same reason state history is" };

    const bounds = this.#rows(`SELECT bound, allowed, consumed FROM ai_run_bounds WHERE run = ?`, run);
    const bound = derive ? finishedBound(bounds, { expired, offered })
                         : (offered == null ? "" : String(offered));

    /* C-22.5 — the refusal that IS §14b.6. A run may not leave `running`
       without saying what stopped it. */
    const badBound = checkBound(bound);
    if (badBound) return { run, found: true, terminated: false, ...badBound };
    /* C-22.4 — and it is checked against the LIVE vocabulary, observation-log's `CONDITION_KINDS`
       (`src/observation-log/vocabulary.mjs`), never a copy, so a kind that file removes cannot keep being emitted here. */
    const badCondition = checkCondition(condition, CONDITION_KINDS);
    if (badCondition) return { run, found: true, terminated: false, ...badCondition };

    const stoppedByBound = Object.prototype.hasOwnProperty.call(RUN_BOUNDS, bound);
    const rollup = this.#aiRunSearchState(run, stoppedByBound);
    const state = rollup.state;
    const last = this.#one(
      `SELECT level FROM observation_log
        WHERE ${AiRuns.#ownRows()} AND terminal = 0
        ORDER BY seq DESC LIMIT 1`, run, run);

    const actual = this.#actualFromUse(run);
    const done = this.#transact(() => {
      /* THE TERMINAL ENTRY FIRST, then the status. The order is deliberate: if
         anything could fail it is the append, and a run left `running` with its
         log written is recoverable by the reaper, while a run marked finished
         with no entry is the exact silence this item exists to prevent. */
      const bad = this.#aiRunAppend(run, {
        level: last ? last.level : "document",
        subject: row.context_id,
        /* `state`, `result_kind`, `result_ref` — the rollup and its referent
           from ONE read (REC-100; see `#aiRunSearchState`). */
        ...rollup,
        governed: false,
        condition,
        bound,
        detail: stoppedByBound
          ? `the run stopped because the '${bound}' bound was reached (${RUN_BOUNDS[bound]})`
          : `the run ended: ${RUN_ENDINGS[bound]}`,
      }, at, 1, null, row.step || null);
      if (bad) return { run, found: true, terminated: false, ...bad };
      /* FL-8 / IC-67 — WHAT BECAME OF THIS RUN, ASKED ONCE AND OF `run-rules`.
         This was `stoppedByBound ? "stopped" : "finished"`, written out TWICE
         here, and it recorded a launch the deployment gate REFUSED as a run that
         FINISHED — a gate refusal reaches no bound, so it fell through the false
         arm. **It did not finish; it never started.** The keying now lives beside
         the vocabularies it reads (`runStatusFor`), so the status a run is
         recorded under cannot drift from the endings and bounds that decide it,
         and the fleet member's mock is BUILT from the same function instead of
         reproducing it by hand — which is how the previous copy came to be
         answering `stopped` for `mode-not-deployed` while this line answered
         `finished`, with nothing comparing them. `stoppedByBound` stays: it still
         chooses the terminal entry's SENTENCE two lines up, which is a different
         question from what the run's status is. */
      const status = runStatusFor(bound);
      /* R76 (D12, K2482): the run's actual cost, ai-use's figures for it, recorded at its ending (every path: a close, a
         tick's bound, the reaper), answered only to the paying account's owners (`#costFor`). */
      this.sql.exec(
        `UPDATE ai_runs SET status = ?, updated = ?, stopped_bound = ?, stopped_condition = ?, stopped_at = ?, actual = ?
         WHERE run = ?`,
        status, at, bound, condition, at, actual ? JSON.stringify(actual) : null, run);
      return { run, found: true, terminated: true,
               status,
               bound, condition, state, at };
    });
    /* R73: a step-run's ending ends its step as steps R5 allows a machine, after the run's own ending has committed, and
       ties what it produced (steps R9's `recordProduct`). A step that cannot be told is said in the answer; the run's
       ending stands. */
    return done && done.terminated === true && row.step ? { ...done, step_end: this.#endStep(row, bound) } : done;
  }

  /** R73 (steps R5, R9): `ended` with every outcome undetermined for a completed run; `set_aside` with the stopping
   *  bound's or ending's sentence for any other; then each record its looks name (a capture, content, connection or lead
   *  referent) tied to the step. Answers what steps said, never throws. */
  #endStep(row, bound) {
    const st = this.#steps();
    if (!st || typeof st.stepEnd !== "function") return { told: false, reason: "steps is not reachable" };
    const by = row.principal_plane;
    try {
      const products = this.#rows(
        `SELECT DISTINCT o.result_kind, o.result_ref FROM observation_log o JOIN ai_run_looks l ON l.seq = o.seq
          WHERE l.run = ? AND o.result_ref IS NOT NULL AND o.result_kind IS NOT NULL AND o.result_kind <> 'observation'
          ORDER BY o.result_kind, o.result_ref LIMIT 200`, row.run);
      const tied = [];
      for (const p of products) {
        const t = typeof st.recordProduct === "function"
          ? st.recordProduct({ step: row.step, record: String(p.result_ref), kind: p.result_kind, run: row.run, by }) : null;
        tied.push({ record: String(p.result_ref), ok: !!(t && t.ok === true) });
      }
      const completed = bound === "completed";
      const said = st.stepEnd(completed
        ? { step: row.step, end: "ended", run: row.run, by }
        : { step: row.step, end: "set_aside", reason: RUN_BOUNDS[bound] || RUN_ENDINGS[bound] || bound, run: row.run, by });
      return { told: !!(said && said.ok === true), end: completed ? "ended" : "set_aside", products: tied,
               ...(said && said.ok !== true ? { refusal: said.code || said.reason || null } : {}) };
    } catch { return { told: false, reason: "steps did not answer" }; }
  }


  /* ---- DEC-63 / PL-18: THE RUN VERBS' GATE IS PROJECT MEMBERSHIP ----------
   *
   * Bob, 2026-08-09: *"AN INVESTIGATION CAN BE STARTED BY ANY MEMBER OF A
   * PROJECT… the gate is PROJECT MEMBERSHIP, not a capability tier."* IS-6's
   * provisional gated the three run verbs on `contribute` alone. That token
   * stays, as the FLOOR beneath this — it is still checked, in `op-declarations`'
   * `NEEDS` (`src/op-declarations/index.mjs`), and it still refuses in its own words.
   *
   * THE DECISION IS NOT HERE. It is in `run-rules projectGate`, pure and shared
   * by all three verbs. What lives here is the two DATABASE questions the pure
   * function cannot ask: which projects hold this context, and which of those
   * the account has joined.
   */

  /** WHICH PROJECTS HOLD THIS CONTEXT — the run's context resolved to the
   *  projects whose participants may work on it.
   *
   *  [REC-145, 2026-09-19: for a QUESTION this set no longer licenses anything. DEC-63 as amended by
   *  Bob (*"a project doesn't own an area of enquiry"*) means the verdict over an inquiry consults no
   *  project; the set is read only for the report's SIGHTED count (REC-139). The inquiry paragraph
   *  below is kept as the record of PL-18's reading, and its "licenses" sentence is superseded.]
   *
   *  A `project` context is its own project, and nothing else: a run opened
   *  over a project is work in that project by definition.
   *
   *  An `inquiry` context is EVERY PROJECT THAT DRAWS ON IT, and it is a set
   *  rather than a single id because `#moveVersionState` already states the
   *  rule — *"an inquiry can sit beneath several projects and one team's
   *  decision must never silently move another team's stance"*. Participation
   *  in ANY ONE of them licenses asking the system to look at the question;
   *  demanding participation in ALL of them would be a fence tighter than
   *  DEC-63's rule, which says *a member of the project*, not *of every project*.
   *
   *  THE CITATION PREDICATE IS `#citesInto` AND NOT A SECOND QUERY. That helper
   *  is the record's ONE answer to "who cites this, and is the citation live",
   *  extracted precisely so retire's refusal and op=affordances' pre-flight
   *  could not disagree. A raw `SELECT … FROM refs` here would have been a
   *  third answer to the same question and would have counted SEVERED edges,
   *  because the projection does not carry status: a project that WITHDREW from
   *  a question would still have been licensing runs over it.
   *
   *  A context that is not a bundle at all yields an EMPTY set, which the gate
   *  treats as projectless. That is the honest direction and it is not a hole:
   *  a run's context is not required to be a bundle this store holds, and
   *  refusing on a lookup that came back empty would be refusing on what cannot
   *  be verified — a claim about the record made from a fact about our index.
   *  [SUPERSEDED FOR THE OPEN 2026-09-19 by REC-153 (BOB #16, `7d03e852`): a run's context must now be a
   *  bundle this record holds, of the kind named, that the caller can SEE — refused at the open by
   *  `checkRunContextKind` before this is asked, for every caller including a machine. This reading of an
   *  empty set survives only for runs stored before REC-153, which tick and close still read.]
   *
   *  REC-138 / D-426 — EXCEPT A CONTEXT THAT SAYS IT IS A PROJECT, which is now that project
   *  whether or not this store holds it. As built, a PROJECT context the store did not hold read
   *  as projectless and was PERMITTED, while one it held and the caller had not joined was refused
   *  — so a member naming `contextType=project` learned from the verdict whether the id existed,
   *  including for a project they cannot see (§7.9). The answer the paragraph above guards against
   *  does not arise here: the gate asks the CALLER's participation, and a participation row exists
   *  only for a project the record holds, so "you have joined no project by that id" is verified
   *  for an absent id exactly as for a hidden one. A member is now refused both, byte for byte (the
   *  refusal names only what the caller sent); a machine credential is not asked and is unchanged;
   *  a question context keeps its projectless reading, because it names no project. */
  #runContextProjects(contextType, contextId) {
    const id = contextId == null ? "" : String(contextId);
    if (!id) return [];
    if (String(contextType) === "project") return [id];
    return this.#connections().citesInto(id).confirmed.filter((from) => {
      const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, from);
      return !!b && normalizeType(b.object_type) === "project";
    }).sort();
  }

  /** D-451 (INVESTIGATIVE-SESSION.md §11 item 5, RULE 1'S TARGET, BOB #28) — THE QUESTIONS A PROJECT RUN'S
   *  READINGS MAY LAND ON, published by `aiRunRead` so a member (FL-11's `runContextTarget`) can NAME one.
   *
   *  `#runContextProjects` read the other way round: every question `#citesInto` says this project
   *  CONFIRMED-cites (the one live-cites predicate, and the very expression `op=suggest`'s context check (d)
   *  asks, so a SEVERED edge is not a question the run may land on). Not `#refEdgeSevered` directly: the
   *  severance rule has one definition, `connections`' `citesInto`, and a seventh reader is the drift D-267
   *  removed; R19's test holds that a question the project severed is left out. Kept only where `op=suggest` would itself admit it as a target — an inquiry by id (its
   *  `SUGGEST_NOT_AN_INQUIRY` shape test) that THIS viewer can see (`#inSight`, the predicate its viewer gate
   *  asks). A question the viewer cannot see is omitted and not counted (§7.9: a count would say it exists).
   *  So the set published is exactly the set `suggestVersion`'s context check (d) admits for this caller, and
   *  never a second answer to it. Sorted, so the read is stable. */
  #runContextQuestions(projectId, viewer) {
    const id = projectId == null ? "" : String(projectId);
    if (!id) return [];
    const out = [];
    for (const r of this.#rows(`SELECT DISTINCT target_id FROM refs WHERE bundle_id=? AND kind='cites'`, id)) {
      const q = String(r.target_id);
      if (normalizeType(OBJECT_TYPES[q.split("-")[0]]) !== "inquiry") continue;
      if (!this.#connections().citesInto(q).confirmed.includes(id)) continue;
      if (!this.#membership().inSight(q, viewer)) continue;
      out.push(q);
    }
    return out.sort();
  }

  /** REC-153 — THE NAMED CONTEXT'S TYPE, AS THE CALLER CAN SEE IT: the one fact `checkRunContextKind` needs
   *  from the record. Null for an id no bundle holds AND for one the caller cannot see, through ONE return, so
   *  the decision downstream cannot tell absent from hidden (§7.9; `#noSuchProject`'s discipline). Sight is
   *  `#inSight`, the one predicate, and it FAILS CLOSED on an absent viewer — the run verbs' posture
   *  (`RUN_VERB_ACTIONS`, declared in `op-declarations` and stamped by `control-plane`: "fails closed on an
   *  absent stamp"). The first draft did not ask a viewer that was never sent, on `#rosterInSight`'s precedent; REC-145's `run-stamp-dropped` control
   *  showed that with the control plane's stamp removed the check then SAW every project — sight failing
   *  open. No caller reaches the open without the stamp (measured: no suite drives the store directly).
   *  The type is normalised (`problem`/`focus` read `inquiry`). */
  #runContextKind(contextId, viewer) {
    const id = contextId == null ? "" : String(contextId);
    const b = id ? this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, id) : null;
    if (!b) return null;
    if (!this.#membership().inSight(id, viewer)) return null;
    return normalizeType(b.object_type);
  }

  /** The gate, as the three run verbs call it. Returns `projectGate`'s verdict
   *  object — `refusal` null or built, and a `ground` that is stated either way.
   *
   *  `#participation` is the record's existing membership predicate and is
   *  CALLED rather than reimplemented, for the reason its own header gives: the
   *  admin bypass came to sit on invite and remove with different shapes
   *  because the test had two copies. */
  #aiRunProjectGate({ actor, contextType, contextId, viewer = null }) {
    const projects = this.#runContextProjects(contextType, contextId);
    const who = actor == null ? "" : String(actor).trim();
    /* REC-145 (DEC-63 as amended by Bob, 2026-09-18; Membership v2 §7, BOB #16): OVER A QUESTION NO
       PROJECT IS CONSULTED, so no participation question is asked at all — `runConsultsProjects` is the
       one answer to which contexts are gated, shared with `projectGate` so the facts fed to the verdict
       and the verdict cannot disagree. The citing projects are still resolved above, for the stated
       count below and for nothing else. A PROJECT context keeps the joined-participant gate. */
    const joined = who && runConsultsProjects(contextType)
      ? projects.filter((p) => {
          const part = this.#membership().participation(p, who);
          return !!part && part.state === "joined";
        })
      : [];
    const g = projectGate({ actor: who, contextType, contextId, projects, projectsJoined: joined });
    /* REC-139 / D-428 (Membership v2 §7, BOB #15, 2026-09-18): THE REPORT COUNTS ONLY THE CITING
       PROJECTS ITS CALLER CAN SEE, and none of the others. [SUPERSEDED IN PART 2026-09-19 by REC-145:
       the verdict no longer reads the citing projects at all — over a question it consults none, over
       a project it reads that one. The count below is unchanged and stays sighted-only.] As REC-139
       built it: the VERDICT above is DEC-63's and is
       computed over EVERY citing project, unchanged — who may START a run is that ruling's question,
       and it requires no disclosure. What changes is the number the answer STATES: it counted a
       project the caller cannot see, so a member's run over a question read `projects: 2` the moment
       a project hidden from them cited it (§7.9, *"not its existence"*). Asked through `#inSight`,
       the one sight predicate, never a second copy; its absent-viewer posture is fail closed, so a
       caller the control plane did not stamp is stated no project rather than every one. A refusal
       carries no count and is returned as built. */
    if (!g.permitted) return g;
    return { ...g, projects: projects.filter((p) => this.#membership().inSight(p, viewer)).length };
  }

  /** The gate's outcome as it travels on a SUCCESS answer. The refusal is
   *  dropped (there is none) and the ground is kept, because DEC-17's
   *  projectless permission is a fact about how the run was allowed to start
   *  and a consumer that cannot see it cannot tell a permitted run from an
   *  ungated one. Shaped in one place so all three verbs publish it alike. */
  static #aiRunGateStated(g) {
    return { projectGate: { applied: g.applied, ground: g.ground, why: g.why, projects: g.projects } };
  }

  /** op=airunopen. Open a run over an inquiry or a project.
   *
   *  Every `conditions it was formed under` field §11 names is taken as given
   *  and stored verbatim — the bias manifest in force, the launching project's
   *  declared standard pair, the skill version. NONE of them is derived here,
   *  and where one is absent it is stored as absent rather than defaulted: §11
   *  says "until D-84 lands, 'no manifest was in force,' STATED", and a default
   *  would be this plane inventing a condition a version is later interpreted
   *  against.
   *
   *  BOTH PRINCIPALS ARE REQUIRED and neither is ever a token value (§14a,
   *  DEC-27(b), DEC-55.4). The Claude account a run carries is the one
   *  `credentials.accountFor` answers for the act of the member who started it
   *  (R52; K1755: their own, else the group's API key), and the run is that
   *  member's act, recorded as `principal_claude`, `member:<id>`, whichever
   *  account serves it; the plane refuses to open a run that names no member, or
   *  one no account serves.
   *
   *  AND SINCE SK-1, SO IS THE SKILL VERSION. The paragraph above still holds
   *  for the bias manifest and the standard pair — absent is stored as absent
   *  and never defaulted — but the skill version is now REQUIRED rather than
   *  merely stored, because "every run records the skill version it ran under"
   *  is a requirement and a condition that may be omitted is not recorded. It
   *  is still never derived: the plane refuses, it does not fill in. The
   *  refusal is C-22.7, built in `run-rules checkSkillVersion`. */
  async open({ run, contextType, contextId, label = null, mode = null,
              principalPlane = null, principalClaude = null, principalClaudeRef = null,
              skillVersion = null, biasManifest = null, standardPair = null,
              bounds = null, state = null, leaseMs = null, at = null,
              /* REC-207 (BOB #32, 2026-09-23 23:42Z): WHICH RUN THIS ONE RE-RUNS, the opener's own word
                 and nothing derived. It is what makes discharge (2) addressable at all — without it there
                 is no link in the record between a re-run and the debt it settles, and a plane inferring
                 one from a context and a clock would be guessing at a judgement. Optional and additive: a
                 run that names none is exactly the run this op opened before. */
              rerunOf = null,
              /* R46 (K660): the plan a run in mode `plan` works on, stored verbatim; refused in any other mode. */
              plan = null,
              /* R73 (T41): the step this run works on, and where it came from (`member`, or `explore`, which works on a
                 step); a run naming neither is a member's, as every run before T41. */
              step = null, origin = null,
              /* PL-18 / DEC-63: WHICH MEMBER IS ASKING, stamped server-side by
                 `control-plane` and empty for a machine credential. Never a
                 caller's word — a principal a caller can name is not one, which
                 is the rule the two `principal*` fields above already follow. */
              actor = null,
              /* REC-139: WHOSE SIGHT the report's project count is taken in, stamped server-side
                 beside `actor` and read only by `#aiRunProjectGate`'s stated count. */
              viewer = null } = {}) {
    const nowMs = at ? Date.parse(at) : Date.now();
    const now = AiRuns.#aiIso(nowMs);
    /* `started`, deliberately NOT `opened`. When this was written, REC-58's
       consumer walk (`test/case-opened.test.mjs`, since deleted) swept the
       WHOLE repository for `.opened` to prove a published case's field had no
       consumers, and a run answering `opened: true` would have made that
       assertion read false for a reason that had nothing to do with published
       cases — so the collision was avoided here rather than that suite
       weakened. `started` is also the truer word: the run's own state vocabulary
       is `running`, and nothing about it is ever "closed" without a named bound.
       R10's test holds the answer's keys. */
    /* REC-76 — THIS REFUSAL WAS CODELESS UNTIL THE GUARD COULD SEE IT, and that
       is the item's own evidence rather than a tidy-up. `aiRunOpen` refuses with
       `started: false`; the DEC-49 guard's arm C graded a refusal by the single
       literal `ok: false`, so this whole function read as `92L (0 judged, 0
       code(s) checked)` — a governed site read in full, asserting nothing, and
       green. The moment the classifier asked what makes something a refusal IN
       PRINCIPLE, two codeless refusals appeared here. The code, its C-number and
       its canned translation are read from the catalogue at the moment of
       refusal, on REC-64's precedent three guards down; the `note` is kept
       unchanged beside it because it is the OPERATOR's sentence. */
    /* R35: every refusal this act mints, built in one place from its row read by key, so each code is written once, at
       its refusal (the DEC-49 guard's arm G), and each answer keeps its shape: the run, `started: false`, the code, its
       check and translation, then what that refusal adds. `run || null` because the first refusal is of a blank id. */
    const refusal = (code, more = {}) => {
      const row = this.#checkRow(code);
      return { run: run || null, started: false, code, check: row.check, translation: row.translation, ...more };
    };
    /* DEC-49 REGION is-airun-open-context — C-33.30. The request names no run id or no
       context for it to sit in: asked before anything is looked up. D-589 narrowed C-33.29..31 from a
       whole-function `where` into one region each (REC-71's rule: a row names the smallest span), so a
       refusal written elsewhere in this function is judged by ITS OWN row and not by these three. */
    if (!run || !contextType || !contextId)
      return refusal("AI_RUN_NO_CONTEXT", {
               note: "a run needs an id and the context it runs in (an inquiry or a project): "
                   + "a run nothing is in the context of has nowhere to be visible" });
    /* END DEC-49 REGION is-airun-open-context */
    /* PL-18 / DEC-63 — THE GATE, AND IT RUNS BEFORE THE RUN'S OWN SHAPE IS
       JUDGED. Placed here, immediately after the context is known and before
       the principals and the skill version, on purpose: whether this account
       may work on this question is a question about the CALLER, and answering
       the shape questions first would tell somebody with no standing here
       whether their skill version parses. Authority before shape is the
       fail-closed order.

       NO `DEC-49 REGION` MARKER HERE, AND THE ABSENCE IS DELIBERATE — it is a
       correction this item's own guard run forced. The refusal is MINTED in
       `run-rules projectGate`, whose row already claims it as a governed site;
       this is a RELAY, exactly as the C-22.7 line four guards down relays
       `run-rules`'s. A marker here would have declared a second governed
       site for one refusal, and `check-refusal-codes.mjs` failed the harness by
       name for precisely that: *a defence that is documented and not wired is
       worse than a missing one.* The code stays a string literal where it is
       written, which is the rule the marker exists to serve. */
    /* REC-153 (Membership v2 §7, the DEC-63 ruling bullet, "AND THE CONTEXT KIND IS CHECKED", BOB #16) — THE
       CONTEXT IS THE KIND IT SAYS IT IS, checked HERE, before the gate: the gate's verdict turns on the kind
       (REC-145), so a kind the caller chose freely was a way around it — an `inquiry` label over a project's
       id opened for a member who had not joined it. A RELAY, like the gate's below and C-22.7's: the refusal
       is minted in `run-rules checkRunContextKind`, whose catalogue row names that site. Only the CONTEXT's
       open is checked; tick and close read the stored kind, which is now checked at the door it came in by. */
    /* REC-149 (Membership v2 §7.14): a run over a DISCOVERABLE project the caller is outside is an act at
       EXISTENCE, answered with the positional C-70.1 — never "no such context" about a project the directory
       showed them. Asked only of a word in the closed vocabulary, so rule 1's refusal is untouched; a hidden or
       absent id still reaches the line below and its one answer. */
    if (Object.prototype.hasOwnProperty.call(RUN_CONTEXTS, String(contextType ?? ""))) {
      const existence = this.#membership().existenceAct(String(contextId ?? ""), viewer ?? "");
      if (existence)
        return { run, started: false, code: existence.code, check: existence.check,
                 translation: existence.translation, detail: existence.detail,
                 project: existence.project, name: existence.name };
    }
    const kind = checkRunContextKind({ contextType, contextId, found: this.#runContextKind(contextId, viewer) });
    if (kind)
      return { run, started: false,
               code: kind.code, check: kind.check,
               translation: kind.translation, detail: kind.detail,
               note: "a run's context kind is checked against the thing it names, and a thing the caller "
                   + "cannot see answers as one that does not exist (Membership Architecture v2 §7, BOB #16, "
                   + "2026-09-19): the project gate turns on the kind, so the kind cannot be the caller's word" };
    const gate = this.#aiRunProjectGate({ actor, contextType, contextId, viewer });
    if (!gate.permitted)
      return { run, started: false,
               code: gate.code, check: gate.check,
               translation: gate.translation, detail: gate.detail,
               note: "starting an investigation OVER A PROJECT is licensed by PARTICIPATION IN THAT "
                   + "PROJECT (DEC-63, Bob 2026-08-09; a run over a question consults no project, as "
                   + "amended 2026-09-18), and the contribute capability "
                   + "is only the floor beneath that. These are two different facts about an "
                   + "account and they are refused separately so each names its own remedy" };
    /* REC-64 — UI-38's §14a RIDER, DISCHARGED HERE AND NOT AT A SURFACE.
       §14a promises the running-session surface SAYS SO when the capability is
       unavailable, and IS-BUILD-PLAN's FL-6 row states the failure it is
       guarding against: *"when no token resolves the capability is UNAVAILABLE
       and says so — never a silent no-op"*. UI-38 correctly LEFT that sentence
       rather than authoring it, because member-facing refusal wording is DEC-49's
       and not a surface's.

       THIS GUARD ALREADY WAS THAT CONDITION and was answering it with a
       CODELESS note — a sentence a surface can only render verbatim or blank,
       which is the state DEC-49 ended. It now carries a RECEIVED code, its
       C-number and the canned translation, read from the catalogue at the moment
       of refusal (RUNTIME lookup — see MACHINE_FENCE_CHECKS' header for the
       choice and the reason). The `note` is kept unchanged beside it: it is the
       OPERATOR's sentence, which is exactly the
       "keep the design explanation, translate the jargon" split REC-64's own row
       makes at the credential gate. DEC-8 is intact — the surface RECEIVES the
       code and computes nothing.

       [K1502, T33-50: there is no cascade. *No account* is now its own refusal,
       `AI_NO_ACCOUNT` (R52), asked below once the run's member is known; this one
       stays the refusal of a request that names no principal at all.] */
    /* DEC-49 REGION is-airun-open-capability — C-33.29. No account to run under: the
       two principals are not both named. See REC-64's note above for why one code and not two. */
    if (!principalPlane || !principalClaude)
      return refusal("AI_RUN_CAPABILITY_UNAVAILABLE", {
               note: "a run names TWO principals — the plane credential acting and the member whose own "
                   + "Claude account carries it (K1502, K1503). They are different principals and an act "
                   + "must say both (DEC-27(b), DEC-55.4)" });
    /* END DEC-49 REGION is-airun-open-capability */
    /* SK-1 — THE THIRD CONDITION, AND IT IS REFUSED WHERE THE PRINCIPALS ARE.
       §11 records what a run was FORMED under, and the skill version is one of
       the three. The decision and the two failure shapes are on
       `run-rules checkSkillVersion`, which is where the C-22.7 refusal is
       built and the only implementation of the rule. This site adds nothing to
       it: it hands the value over and returns what comes back, in the same
       `started: false` shape the two guards above use, carrying the DEC-49 code
       and its canned translation so a surface renders a sentence it RECEIVED. */
    const badSkill = checkSkillVersion(skillVersion);
    if (badSkill)
      return { run, started: false, code: badSkill.code, check: badSkill.check,
               translation: badSkill.translation, note: badSkill.detail };
    /* R40 (K102, K182 (4c)) — THE MODE IS A DEPLOYED ONE, asked after the skill version and before anything is
       written: no run, and so no production under a run, exists in a mode not deployed. A run that names no mode
       opens in the deployed mode and records it; a blank mode, or one the one deployment order has not deployed, is
       refused. The fleet member's own first row (`gate-mode`) still refuses first inside the harness. */
    const runMode = mode === undefined || mode === null ? DEFAULT_MODE : String(mode).trim();
    /* DEC-49 REGION is-airun-open-mode — C-109.1. */
    /* K1606 (run-rules R16, R19): a RUN's mode is one of the order's (`RUN_MODES`; `ask` is deployed apart and is no
       run), deployed by its flag, and deployable on the verifications this record holds (the chain is the record's). */
    const deployed = this.#deployedModes().filter((m) => RUN_MODES.includes(m) && deployable(m, this.verifications()));
    if (!deployed.includes(runMode))
      return refusal("AI_RUN_MODE_NOT_DEPLOYED", {
               mode: String(mode).slice(0, 60), deployed: [...deployed],
               note: `the mode '${String(mode).slice(0, 60)}' is not deployed in your group's Civicsmith: the modes deploy in one `
                   + `order, each only after the one before it is verified live, and today ${deployed.join(", ")} `
                   + `${deployed.length === 1 ? "is" : "are"} deployed. Nothing was written` });
    /* END DEC-49 REGION is-airun-open-mode */
    /* R46 (K660; BIO_Action_v0_1.md §4 rule 1): THE PLANNING RUN, asked after the mode is known deployed and before
       anything else about the run's shape: its plan named (and a plan named by no other mode), over a project, by a
       member, with no search allowance, in that order. Each code is written once, at its refusal (`refusal` above). */
    const planRefusal = (code, detail, extra = {}) => refusal(code, { detail, ...extra, note: "Nothing was written" });
    const planNamed = typeof plan === "string" && plan.trim() !== "";
    const who = actor == null ? "" : String(actor).trim();
    const search = (Array.isArray(bounds) ? bounds : []).find((b) => b && typeof b === "object"
      && (b.bound === "fetches" || b.bound === "subsessions") && typeof b.allowed === "number" && b.allowed > 0);
    /* DEC-49 REGION is-airun-open-plan */
    if (runMode === "plan" && !planNamed)
      return planRefusal("AI_RUN_PLAN_REQUIRED", "a planning run names the plan it works on: pass plan=<the plan's id>");
    if (runMode !== "plan" && plan != null)
      return planRefusal("AI_RUN_PLAN_UNEXPECTED", `a run in mode '${runMode.slice(0, 60)}' names no plan; only a run in `
        + "mode 'plan' works on one");
    if (runMode === "plan" && String(contextType) !== "project")
      return planRefusal("AI_RUN_PLAN_NEEDS_PROJECT", "a planning run is over the project the plan belongs to: contextType=project");
    if (runMode === "plan" && (!who || isMachineIdentity(who)))
      return planRefusal("AI_RUN_PLAN_NEEDS_MEMBER", "only a member starts a planning run, for one plan at a time; nothing "
        + "starts one by itself");
    if (runMode === "plan" && search)
      return planRefusal("AI_RUN_PLAN_NO_SEARCH", `a planning run works from what the record already holds, so it declares `
        + `no '${search.bound}' allowance (it was given ${search.allowed})`, { bound: search.bound });
    /* END DEC-49 REGION is-airun-open-plan */
    /* R73 (T41; run-rules R23): THE ORIGIN AND THE STEP, after the mode and the plan and before the bounds: an origin the
       order does not hold; an exploring run with no step, or while `investigate` cannot deploy (the chain is the record's,
       run-rules R19); a step the opener cannot see (absent and unseen alike, steps R2). */
    const runOrigin = origin == null ? "member" : String(origin).trim();
    const stepId = step == null || String(step).trim() === "" ? null : String(step).trim();
    /* DEC-49 REGION is-airun-open-step */
    if (!AiRuns.ORIGINS.includes(runOrigin))
      return refusal("AI_RUN_ORIGIN_UNKNOWN", { detail: `a run's origin is one of ${AiRuns.ORIGINS.join(", ")}`, note: "Nothing was written" });
    if (runOrigin === "explore" && !stepId)
      return refusal("AI_RUN_EXPLORE_NEEDS_STEP", { detail: "an exploring run names the system step it works on: pass step=<its id>",
        note: "Nothing was written" });
    if (runOrigin === "explore" && !deployable("investigate", this.verifications()))
      return refusal("AI_RUN_EXPLORE_NOT_DEPLOYABLE", { detail: "an exploring run is admitted only while 'investigate' may deploy",
        note: "Nothing was written" });
    if (stepId && !this.#stepSeen(stepId, viewer))
      return refusal("AI_RUN_STEP_UNKNOWN", { detail: `no step '${stepId.slice(0, 60)}' is open to this caller`, step: stepId.slice(0, 60),
        note: "Nothing was written" });
    /* END DEC-49 REGION is-airun-open-step */
    /* REC-169 — THE SEED IS THE TICK'S RULE. A declared `consumed` is the other caller-written figure in
       `ai_run_bounds`, and `Number(b.consumed) || 0` let a run OPEN already refunded (`consumed: -10`) or seed a
       bound the plane counts. The same check the tick asks (`checkConsume`), with an absent seed meaning none spent.
       REC-172 (§14b.6) — AND THE DECLARATION ITSELF, before the seed: a `bounds` that is not a list, an entry that is
       not an object or names no bound (C-22.15), a `lease` entry (C-22.14 — the plane decides it), and an `allowed`
       that is not a whole number of zero or more (C-22.13). Each was DROPPED or COERCED below (`continue`, and
       `Number(b.allowed) || 0`), so a member who declared a ceiling could get a run without it, or one they never set.
       REC-177 (§14b item 6, BOB #30) — AND AN ENTRY THAT STATES NO ALLOWANCE (`allowed` absent or 0, C-22.16): it was
       opened at 0, which `finishedBound` reads as no ceiling, so the run recorded a bound it did not have. */
    const badSeed = checkConsume(bounds, { list: true });
    if (badSeed)
      return { run, started: false, code: badSeed.code, check: badSeed.check,
               translation: badSeed.translation, note: badSeed.detail };
    /* R45 (N293) — THE SEED'S STATE IS BOUNDED AS THE TICK'S IS, asked after the bounds and before anything is
       computed or written. A RELAY: C-22.18 is minted in `run-rules checkRunState`, whose row names that site. */
    const badState = checkRunState(state);
    if (badState)
      return { run, started: false, code: badState.code, check: badState.check,
               translation: badState.translation, note: badState.detail,
               bytes: badState.bytes, limit: badState.limit };
    /* D-85 (INVESTIGATIVE-SESSION.md §11 item 5, rule 3, BOB #25): THE LENS IN FORCE AT THIS INSTANT, computed by
       the PLANE, beside the manifest the run was HANDED. The handed one is stored verbatim below and nothing is
       derived from it; this is the call `#biasForRun` makes for the run's context (a project's scope for a run
       over a project, the instance scope for one over a question), in the opener's own sight — so the read can
       tell *the lens changed after the run opened* from *the run was handed a lens other than the one in force*,
       which `moved` alone could not. Asked AFTER every refusal above (a refused open computes nothing) and
       BEFORE the id's existence is asked, so the check and the insert below stay one synchronous step with no
       await between them. */
    const lensNow = await this.#bias().biasManifest({
      scope: String(contextType) === "project" ? "project" : "instance",
      scopeId: String(contextType) === "project" ? String(contextId) : "",
      viewer, limit: 1 });
    const lensAtOpen = JSON.stringify({
      in_force: lensNow.in_force === true,
      statements_sha: lensNow.in_force === true ? (lensNow.statements_sha ?? null) : null,
      scope: lensNow.scope ?? null, scope_id: lensNow.scope_id ?? null,
      bundles: (Array.isArray(lensNow.bundles) ? lensNow.bundles : [])
        .map((b) => ({ bundle_id: b.bundle_id, revision: b.revision ?? null })),
      at: now });
    /* R52 (K1503, K1755): THE ACCOUNT THE RUN CARRIES, asked of `credentials.accountFor` for the act of the member who
       started it, here, before the id's existence is asked, so the check below and the insert stay one synchronous step
       with no await between them. Its answer is applied in R52's place further down (after the re-run refusals), and
       the unsealed key is dropped at once: only whether an account serves the member, and which, is kept. */
    const accountMember = AiRuns.#accountMember({ actor, principalPlane, principalClaude });
    /* (T41; credentials R56) a run over a project names it, so the project's own account serves first when it is held */
    const account = accountMember ? await this.#accountFor(accountMember, "run",
      String(contextType) === "project" ? String(contextId) : null) : null;
    /* REC-76 — the second of the two codeless refusals the widened classifier
       found here. It is a real member-facing condition (an id that is already in
       use), and it was answering with a bare sentence a surface could only
       render verbatim or blank. */
    /* DEC-49 REGION is-airun-open-already — C-33.31. The run id is already on record.
       Asked AFTER the lens is computed and immediately before the insert, with no await between them. */
    if (this.#one(`SELECT run FROM ai_runs WHERE run = ?`, run))
      return refusal("AI_RUN_ALREADY_OPEN", { note: "a run with this id already exists" });
    /* END DEC-49 REGION is-airun-open-already */

    /* REC-207 — THE RE-RUN LINK IS JUDGED BEFORE IT IS WRITTEN, because a link the record cannot stand
       behind is worse than none: `aiRunClose` settles a bias debt on the strength of this field, so a
       `rerun_of` naming a run that is not there, or that is somewhere else, would be a discharge resting
       on the caller's word. Asked LAST of the open's guards — after authority and after shape — so a
       caller with no standing here learns nothing about which runs exist.
       NO `DEC-49 REGION` MARKER HERE, and the absence was a CORRECTION this item's own guard run forced —
       the same shape as the note at this function's project gate, one cause down. The three rows'
       `where` was the WHOLE FUNCTION, as its three existing rows' were, because `check-refusal-codes.mjs`
       (deleted in T20) judged a region's refusals at the region AND again at an enclosing whole-function
       site, where the code was not one of that site's rows: a region inside a function that kept a
       whole-function `where` failed all three by name. Measured on the first run of this item. The three
       rows are run-rules' (`run-rules/checks.mjs`, read here by key, R35), whose header carries the argument
       and D-589's later narrowing of C-33.29..31 into regions. R9's test holds the three refusals in their
       order, and R35's their rows. */
    const reRuns = String(rerunOf ?? "").trim();
    if (reRuns) {
      if (reRuns === String(run))
        return refusal("AI_RUN_RERUN_SELF", {
                 note: "a run cannot be the re-run of itself: the link exists to say which EARLIER run's "
                     + "work this one repeats, and a self-reference would let one run discharge its own "
                     + "bias debt" });
      const target = this.#one(`SELECT context_type, context_id FROM ai_runs WHERE run = ?`, reRuns);
      /* UNSEEN ANSWERS AS ABSENT, byte for byte — `aiRunClose`'s own posture and REC-25/REC-30's rule.
         A caller must not be able to establish that a run exists by offering to re-run it. */
      if (!target || !this.#aiRunInSight(reRuns, viewer))
        return refusal("AI_RUN_RERUN_UNKNOWN", {
                 note: "no such run: it either never existed, was purged, or is not one this caller can "
                     + "open" });
      if (target.context_type !== String(contextType) || target.context_id !== String(contextId))
        return refusal("AI_RUN_RERUN_OTHER_CONTEXT", {
                 note: "a re-run runs the same question or project again. The lens a bias debt is owed "
                     + "against is the one in force for the INDEBTED run's context, so a re-run somewhere "
                     + "else would be measured against a different lens entirely" });
    }

    /* R52 (K1502, K1503, K1755): THE ACCOUNT THE RUN CARRIES, the one `credentials.accountFor` answered above for the act
       of the member who started it (their own reference, else their own sign-in (T38; K2299), else the group's API key
       while held and on); with none,
       refused by name. Then R50: that member's use today against the ceiling in force, the copy's included, whichever
       account serves them. Both before anything is written, and before R47's check, which stays last. Each refusal keeps
       the open's shape. */
    /* K1606 (run-rules R18, C-22.19, a RELAY): a run starts only at a member's act — the member found above; with none,
       the caller's own stamp is what is judged, and a run is never the standing question's exception. */
    const start = startAllowed({ startedBy: accountMember ? `member:${accountMember}` : (actor || principalPlane), mode: runMode });
    if (!start || start.ok !== true)
      return { run, started: false, code: start.code, check: start.check, translation: start.translation, detail: start.detail };
    if (!account || account.refusal)
      return { run, started: false, ...(account ? account.refusal : this.#noAccount(accountMember, "A run")) };
    const overCeiling = this.#ceilingRefusal(accountMember, nowMs);
    if (overCeiling) return { run, started: false, ...overCeiling };

    /* R47 (K660): THE CHECK A LATER MODULE REGISTERED FOR THIS MODE, applied LAST, synchronously, just before the
       write, and its refusal passed on unchanged. A planning run with no check registered is refused (fail closed); so
       is a check that throws or answers something other than null or a refusal, since a check that cannot say is not
       a check that passed. */
    const held = this.#openChecks.find((c) => c.mode === runMode);
    /* DEC-49 REGION is-airun-open-check */
    if (held || runMode === "plan") {
      let said;
      try { said = held ? held.fn({ contextType: String(contextType), contextId: String(contextId), plan, actor, viewer }) : undefined; }
      catch { said = undefined; }
      if (said !== null)
        return said && typeof said === "object" && typeof said.code === "string"
          ? { run, started: false, ...said }
          : refusal("AI_RUN_MODE_UNCHECKED", {
              detail: held ? `the check ${held.module} registered for mode '${runMode}' gave no answer`
                           : `nothing is registered to check a run in mode '${runMode}'`,
              note: "Nothing was written" });
    }
    /* END DEC-49 REGION is-airun-open-check */
    const lease = Number(leaseMs) > 0 ? Number(leaseMs) : AiRuns.AI_RUN_LEASE_MS;
    this.#transact(() => {
      this.sql.exec(
        `INSERT INTO ai_runs (run, status, label, mode, context_type, context_id,
           principal_plane, principal_claude, principal_claude_ref, skill_version,
           bias_manifest, standard_pair, created, updated, expires, ticks, state, lens_at_open,
           rerun_of, plan, step, origin)
         VALUES (?, 'running', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
        run, label, runMode, String(contextType), String(contextId),
        /* SK-1: TRIMMED, and the reason is PL-4's measurement one field over —
           a value that survives a falsiness guard while naming nothing reads as
           present and travels. `checkSkillVersion` judged the trimmed value, so
           storing the untrimmed one would store something the guard never saw. */
        /* R52: `principal_claude` is the member whose account carries the run (agent-worker R10 reads it so). */
        /* R52 (T41): `principal_claude` the paying owner the account answered (`member:<id>`, `project:<id>`, `group`),
           `principal_claude_ref` the member whose act it is, whichever account paid */
        String(principalPlane), account.owner, `member:${accountMember}`,
        String(skillVersion).trim(),
        biasManifest, standardPair, now, now, AiRuns.#aiIso(nowMs + lease),
        JSON.stringify(state == null ? {} : state), lensAtOpen,
        /* REC-207: judged above, and stored as every empty case on this open is stored — absent rather
           than defaulted. A run that names no re-run reads `rerun_of` NULL, which is what it is. */
        reRuns || null,
        /* R46: verbatim, and only a planning run carries one (any other mode naming a plan was refused above). */
        runMode === "plan" ? plan : null,
        /* R73: the step and the origin, judged above */
        stepId, runOrigin);
      for (const b of Array.isArray(bounds) ? bounds : []) {
        if (!b || !Object.prototype.hasOwnProperty.call(RUN_BOUNDS, String(b.bound))) continue;
        this.sql.exec(
          `INSERT INTO ai_run_bounds (run, bound, allowed, consumed, unit) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(run, bound) DO NOTHING`,
          run, String(b.bound), b.allowed,    /* REC-177: judged above, a whole number of one or more (C-22.16); the old `absent is 0` default was the no-ceiling path */
          b.consumed == null ? 0 : b.consumed,   /* REC-169: judged above */
          b.unit == null ? null : String(b.unit));
      }
    });
    /* R43: the post-write notice, after the run's transaction has committed, to every listener once in the modules'
       order; one that throws or rejects changes neither the run nor this answer. */
    const expires = AiRuns.#aiIso(nowMs + lease);
    for (const l of this.#runListeners) {
      try { await l.fn({ run, contextType: String(contextType), contextId: String(contextId), expires }); }
      catch { /* isolated */ }
    }
    /* PL-18: the gate's outcome travels on the SUCCESS answer too, and that is
       the half DEC-17 makes necessary. A run over a projectless inquiry is
       PERMITTED — *"an inquiry outside any project has no bar and inherits
       none"* — and a permission nobody can see is indistinguishable from a gate
       that never ran. Stating it is the same obligation as stating which
       absence was found. */
    return { run, started: true, status: "running", ticks: 1, created: now,
             expires,
             /* REC-207: the link, echoed, and ONLY when there is one. A caller that named a re-run should
                be able to see that the record took it, because the discharge at this run's close rests on
                it — and an echo that appeared as `null` on every other open would be a new key on an
                answer every existing reader parses, for no fact. */
             ...(reRuns ? { rerun_of: reRuns } : {}),
             ...AiRuns.#aiRunGateStated(gate) };
  }

  /** R73: whether `viewer` may see step `id` (steps R2, R4's `step`); false where steps is not reachable or answers
   *  nothing, so an unverifiable step is refused rather than trusted. */
  #stepSeen(id, viewer) {
    try {
      const st = this.#steps();
      const a = st && typeof st.step === "function" ? st.step({ step: id, viewer }) : null;
      return !!a && a.found !== false && (a.step === id || (a.step && a.step.step === id));
    } catch { return false; }
  }

  /** R73, R24, R14: the WHERE over `observation_log` naming one run's own rows: its run rows, and its looks under its
   *  step (tied to it in `ai_run_looks`). `alias` qualifies the columns. */
  static #ownRows(alias = "") {
    const a = alias ? `${alias}.` : "";
    return `((${a}authority_kind = 'run' AND ${a}authority = ?) OR ${a}seq IN (SELECT l.seq FROM ai_run_looks l WHERE l.run = ?))`;
  }

  /** REC-152 — CAN THIS VIEWER SEE THIS RUN? `aiRunRead`'s own predicate (D-15's `#bundleGate` over the
   *  run's context), asked of one run id, so the tick and the close hide exactly what `op=airun` hides. An
   *  absent stamp fails closed, as it does there. */
  #aiRunInSight(run, viewer) {
    const seen = this.#bundleGate("r.context_id", viewer);
    return !!this.#one(`SELECT 1 AS x FROM ai_runs r WHERE r.run = ? AND ${seen.sql}`, run, ...seen.args);
  }

  /** op=airuntick. The heartbeat, the work list, and the log — one call.
   *
   *  A tick does four things and the order matters: it appends what the run
   *  OBSERVED (so partial results survive a death that happens next), it spends
   *  the budget, it extends the lease, and only then does it ask whether a
   *  bound is now exhausted. A tick that spent the last of a budget ENDS the
   *  run through the one exit — a run cannot overspend and then decline to say
   *  so.
   *
   *  A tick for a run that has already ended is a STATED no-op rather than a
   *  refusal, following `saveCaptureSession`'s `{ saved: false }` precedent: it
   *  is a fact about the run's state, and a late tick from a straggling
   *  sub-session must not resurrect a run whose log is already closed. */
  tick({ run, state = null, consume = null, log = null, leaseMs = null, at = null,
              /* R48 (N588): one entry per conversation that reached the provider since the last tick,
                 `{mode, model, usage, calls}`. */
              usage = null,
              actor = null, viewer = null,
              /* REC-152: the caller's PRINCIPAL, stamped server-side by `control-plane` in the form the open
                 stamps `principal_plane` in — never a caller's word. */
              caller = null } = {}) {
    const nowMs = at ? Date.parse(at) : Date.now();
    const now = AiRuns.#aiIso(nowMs);
    const row = this.#one(`SELECT * FROM ai_runs WHERE run = ?`, run);
    if (!row) return { run: run || null, found: false,
      note: "no such run: it either never existed or was purged" };
    /* REC-152 (Membership v2 §7, "WHO MAY TICK AND CLOSE A RUN", BOB #16) — SIGHT FIRST, THEN POSITION.
       A caller who cannot see the run's context is answered EXACTLY as for a run that does not exist —
       the answer two lines up, byte for byte — because a refusal would tell them the run exists (§7.9).
       One who can see it and is not the run's PRINCIPAL is refused positionally (C-22.12), before the
       project gate and before anything is written: a tick by anyone else writes acts under a name that
       did not take them. Sight is `aiRunRead`'s own question (`#aiRunInSight`), so a run `op=airun`
       hides is a run this door hides. */
    if (!this.#aiRunInSight(run, viewer)) return { run: run || null, found: false,
      note: "no such run: it either never existed or was purged" };
    const notPrincipal = runPrincipalGate({ caller, principal: row.principal_plane });
    if (notPrincipal)
      return { run, ticked: false, found: true, status: row.status,
               code: notPrincipal.code, check: notPrincipal.check,
               translation: notPrincipal.translation, detail: notPrincipal.detail,
               note: "a run is driven by its principal alone. Nothing was appended and no budget was spent" };
    /* PL-18 / DEC-63 — THE SAME GATE, AFTER THE RUN IS FOUND AND BEFORE
       ANYTHING IS WRITTEN. Ordered this way deliberately: an unknown run is
       answered as unknown to everybody, so the gate cannot be used to learn
       which run ids exist. It reads the context OFF THE RUN ROW rather than
       from the caller, because the caller does not name one here and a context
       a caller could name would be a gate a caller could choose.

       WHY THE TICK IS GATED AT ALL, which is IS-6's own argument for giving all
       three verbs one capability: gating the open and leaving the tick free
       would mean an account that may not START a run may still SPEND its budget
       and drive it, which is the fence in the wrong place.

       `ticked: false` IS DELIBERATELY THE FIRST BOOLEAN-SHAPED PROPERTY, ahead
       of `found: true`, and it is not cosmetic. REC-76's arm C grades a return
       by its FIRST boolean-shaped top-level property: a literal `true` there
       declares a success and is NOT judged, so a refusal that leads with
       `found: true` is invisible to the DEC-49 guard — which is precisely how
       two codeless refusals sat unjudged in `aiRunOpen` until the classifier was
       widened. The verdict of this return is that the tick did not happen.

       A RELAY, not a governed site — see the note at `aiRunOpen`'s gate. */
    const gate = this.#aiRunProjectGate({ actor, contextType: row.context_type, contextId: row.context_id, viewer });
    if (!gate.permitted)
      return { run, ticked: false, found: true, status: row.status,
               code: gate.code, check: gate.check,
               translation: gate.translation, detail: gate.detail,
               note: "continuing a run over a project is licensed by PARTICIPATION IN THAT PROJECT "
                   + "(DEC-63), and the contribute capability is only the floor beneath "
                   + "that. Nothing was appended and no budget was spent" };
    if (row.status !== "running")
      return { run, found: true, ticked: false, status: row.status,
               bound: row.stopped_bound,
               note: "this run has ended; its log is closed and a later tick does not reopen it" };
    /* REC-169 (§14b.6; §11 item 5 rule 2) — THE FIGURES ARE JUDGED WHOLE, BEFORE ANYTHING IS WRITTEN. The loop below
       used to write `Number(v) || 0` for every bound named, so the run's own principal could send `surfaces: -1`
       after its last question and open another — a REFUND of a bound its member set. One bad figure refuses the
       whole tick: nothing appended, nothing spent, the lease not extended. A clamp would answer `ticked: true` over
       a spend that did not happen. Asked AFTER sight, position, the project gate and status, so a caller who may
       not drive the run learns nothing about the figures' rule, and an ended run's tick stays its stated no-op. */
    /* REC-172 (§14b.6) — AND THE MAP ITSELF: a `consume` that is not a map (an ARRAY above all — vf4 sent one for its
       whole life) or a key naming no bound was SKIPPED by the loop below, answering `ticked: true` over a spend that
       did not happen (C-22.15); `lease` is the plane's to decide (C-22.14). */
    const badConsume = checkConsume(consume, { map: true });
    if (badConsume)
      return { run, ticked: false, found: true, status: row.status,
               code: badConsume.code, check: badConsume.check,
               translation: badConsume.translation, detail: badConsume.detail, bound: badConsume.bound,
               note: "a run's budget moves only up, by whole numbers, and only on the bounds the caller counts. "
                   + "Nothing was appended and no budget was spent" };
    /* R45 (N293) — THE STATE IS BOUNDED, judged whole after the figures and before anything is written: a state over
       the ceiling refuses the whole tick (no entry, no figure, no lease, no tick), and an absent or null one is not
       measured and the held state stands (R12). A RELAY of `run-rules checkRunState`, as the figures' refusal is. */
    const badState = checkRunState(state);
    if (badState)
      return { run, ticked: false, found: true, status: row.status,
               code: badState.code, check: badState.check,
               translation: badState.translation, detail: badState.detail,
               bytes: badState.bytes, limit: badState.limit,
               note: "a run's state is its resumable work list, and it is bounded. "
                   + "Nothing was appended and no budget was spent" };
    /* R48 — THE CONVERSATIONS' FIGURES, judged whole after the state and before anything is written: a malformed entry
       (its `calls` included) refuses the whole tick as R3 refuses a malformed consumption (C-22.13). */
    const badUsage = this.#usageRefusal(usage);
    if (badUsage)
      return { run, ticked: false, found: true, status: row.status, ...AiRuns.#shed(badUsage),
               note: "each conversation's figures and calls are as the model service states them. Nothing was appended and "
                   + "no budget was spent" };
    const calls = Array.isArray(usage) ? usage : [];
    /* R52: the calls are counted against the member whose act the run serves, whichever account carried it (their own or
       the group's key, K1755); a run that names no member (one opened before T33-50) cannot have its calls counted, and a
       tick reporting calls for it is refused by name. */
    const payer = AiRuns.#memberOfRun(row);
    if (calls.length && !payer)
      return { run, ticked: false, found: true, status: row.status, ...AiRuns.#shed(this.#noAccount(null, "This run")) };
    /* R50 — THE CEILING, on the use before this tick. The calls this tick reports were made, so they are counted
       whatever the answer (the counter stays true); a member over the ceiling then gets the refusal and nothing else of
       the tick is written: no entry, no figure, no lease, no tick. */
    const overCeiling = payer ? this.#ceilingRefusal(payer, nowMs) : null;
    if (overCeiling) {
      const counted = calls.length ? this.#transact(() => this.#count(payer, calls, nowMs)) : 0;
      return { run, ticked: false, found: true, status: row.status, ...AiRuns.#shed(overCeiling), counted };
    }

    const lease = Number(leaseMs) > 0 ? Number(leaseMs) : AiRuns.AI_RUN_LEASE_MS;
    const refused = [];
    let appended = 0;
    this.#transact(() => {
      /* R48: the calls, against the run's member, in the tick's own transaction; nothing of them reaches the log. */
      if (calls.length) this.#count(payer, calls, nowMs);
      for (const e of Array.isArray(log) ? log : []) {
        /* `row.principal_claude` is the run's machine identity and this method
           already holds the row — see #aiRunAppend's note on why it is passed
           rather than looked up. */
        const bad = this.#aiRunAppend(run, e, now, 0, row.principal_claude || null, row.step || null);
        if (bad) refused.push(bad); else appended += 1;
      }
      for (const [k, v] of Object.entries(consume && typeof consume === "object" ? consume : {})) {
        if (!Object.prototype.hasOwnProperty.call(RUN_BOUNDS, k)) continue;
        this.sql.exec(
          `INSERT INTO ai_run_bounds (run, bound, allowed, consumed) VALUES (?, ?, 0, ?)
           ON CONFLICT(run, bound) DO UPDATE SET consumed = consumed + ?`,
          run, k, v, v);   /* REC-169: judged above — a non-negative safe integer, on a bound the caller counts */
      }
      this.sql.exec(
        `UPDATE ai_runs SET updated = ?, expires = ?, ticks = ticks + 1${state == null ? "" : ", state = ?"}
         WHERE run = ?`,
        ...(state == null ? [now, AiRuns.#aiIso(nowMs + lease), run]
                          : [now, AiRuns.#aiIso(nowMs + lease), JSON.stringify(state), run]));
    });

    /* The exhaustion check reads the rows back rather than trusting the deltas
       just written, so a bound that was ALREADY over before this tick is caught
       too. `finishedBound` answers "completed" when nothing is exhausted, which
       is not a stop — so the run continues and no ending is written. */
    const bounds = this.#rows(`SELECT bound, allowed, consumed FROM ai_run_bounds WHERE run = ?`, run);
    const hit = finishedBound(bounds, { expired: false, offered: null });
    const ended = Object.prototype.hasOwnProperty.call(RUN_BOUNDS, hit)
      ? this.#aiRunTerminate({ run, offered: hit,
          condition: hit === "runtime" ? "runtime-ceiling-reached" : null, at: now })
      : null;

    const after = this.#one(`SELECT ticks, status, expires FROM ai_runs WHERE run = ?`, run);
    return { run, found: true, ticked: true, ticks: after.ticks, status: after.status,
             expires: after.expires, appended, refused, ...(calls.length ? { counted: calls.length } : {}),
             ...AiRuns.#aiRunGateStated(gate),
             ...(ended ? { ended } : {}) };
  }

  /** op=airunclose. The ordinary exit — the run is done, or a member stopped
   *  it. It carries no arithmetic and DERIVES NOTHING: it hands what it was told
   *  to the one exit, and a caller who names no bound is refused by C-22.5
   *  rather than having "completed" inferred from its silence. */
  /* REC-207 — ASYNC, and the change is one `await` at the foot. A re-run's own close is where discharge
     (2) is taken (see `#biasDebtDischargeByRerun` for why the close and not the open), and reading what
     lens this run was formed under goes through `#biasForRun`, which is async because `biasManifest` is.
     ADDITIVE ON THE WIRE: the DO's dispatch already `await`s every op, `#aiRunTerminate` is untouched and
     still synchronous, and the REAPER still calls it directly — so a lapsed run is closed by the clock on
     exactly the path it was before, with no member and no discharge. */
  async close({ run, bound = null, condition = null, at = null, actor = null, viewer = null,
               /* REC-152: the caller's PRINCIPAL, stamped server-side — see `aiRunTick`. */
               caller = null } = {}) {
    const now = at ? AiRuns.#aiIso(Date.parse(at)) : AiRuns.#aiIso(Date.now());
    /* PL-18 / DEC-63 — THE GATE, AND IT IS HERE RATHER THAN IN
       `#aiRunTerminate` FOR A REASON WORTH STATING: that function is the ONE
       exit and the REAPER goes through it too. A run killed mid-flight is
       closed by the alarm, where no member is asking and no participation could
       be checked; putting the gate on the shared exit would have made the gate
       a fact about the clock. So the MEMBER'S door is gated and the machine's
       exit is left alone — the two paths still terminate through one function,
       which R14's and R31's tests hold (and R15's, for the reaper's ending).

       An unknown run is left to `#aiRunTerminate`'s own not-found answer, the
       same ordering the tick uses: the gate never tells a caller whether a run
       id exists.

       A RELAY, not a governed site — see the note at `aiRunOpen`'s gate. */
    const row = this.#one(`SELECT context_type, context_id, principal_plane FROM ai_runs WHERE run = ?`, run);
    if (row) {
      /* REC-152 — SIGHT FIRST, THEN POSITION, as at the tick. Unseen answers `#aiRunTerminate`'s own
         not-found, byte for byte; seen-but-not-the-principal is refused in this door's own shape. The
         REAPER does not come through here — it calls `#aiRunTerminate` directly — so a run nobody may
         close by hand still ends on its lease and bounds, and no member is asked. */
      if (!this.#aiRunInSight(run, viewer)) return { run, found: false,
        note: "no such run: it either never existed or was purged" };
      const notPrincipal = runPrincipalGate({ caller, principal: row.principal_plane });
      if (notPrincipal)
        return { run, terminated: false, found: true, ok: false,
                 code: notPrincipal.code, check: notPrincipal.check,
                 translation: notPrincipal.translation, detail: notPrincipal.detail,
                 note: "a run is ended by its principal, or by its own lease and bounds. The run is untouched "
                     + "and is still running" };
      const gate = this.#aiRunProjectGate({ actor, contextType: row.context_type, contextId: row.context_id, viewer });
      if (!gate.permitted)
        /* THE SHAPE IS `#aiRunTerminate`'S OWN — `found` / `terminated`, with
           the refusal spread beside them — because this refusal comes out of
           the same door as that function's four and a second vocabulary for one
           op's failures is a second thing every consumer must learn. And
           `terminated: false` leads, ahead of `found: true`, for the reason
           stated on the tick's gate: the guard grades the FIRST boolean-shaped
           property, and a refusal that leads with a literal `true` is a refusal
           the guard reads as a success. */
        return { run, terminated: false, found: true, ok: false,
                 code: gate.code, check: gate.check,
                 translation: gate.translation, detail: gate.detail,
                 note: "closing a run over a project is licensed by PARTICIPATION IN THAT PROJECT "
                     + "(DEC-63), and the contribute capability is only the floor beneath "
                     + "that. The run is untouched and is still running" };
    }
    let ended = this.#aiRunTerminate({ run, offered: bound, condition, at: now, derive: false });
    /* R76: at close the run answers its actual cost, to its paying account's owners only */
    if (ended && ended.terminated === true) {
      const held = this.#one(`SELECT run, principal_claude, actual FROM ai_runs WHERE run = ?`, run);
      const cost = held ? this.#costFor(held, viewer) : null;
      if (cost) ended = { ...ended, cost };
    }
    /* REC-207 — THE DISCHARGE, AND ONLY OVER A RUN THAT ACTUALLY ENDED HERE. A refused close and a run
       that was already closed both leave `terminated` other than true, and neither is a re-run having
       run. The block is attached only when there was a link to follow, so an ordinary close answers
       byte-for-byte what it answered before this item. */
    if (ended && ended.terminated === true) {
      const discharge = await this.#bias().biasDebtRerun({ kind: "ai-run", key: run, at: now });
      if (discharge) return { ...ended, bias_debt: discharge };
    }
    return ended;
  }

  /* ---- the reaper's three parts, and none of them decides anything ----

     Each is a QUESTION about the clock; the answer to "which bound" comes from
     `finishedBound` inside `#aiRunTerminate`, the same function the ordinary
     close uses. That is the structural half of "the real path and the mutated
     path go through ONE function". */

  reapDue(now) {
    return this.#one(`SELECT count(*) c FROM ai_runs WHERE status = 'running' AND expires < ?`,
      AiRuns.#aiIso(now)).c;
  }

  reapWake(now) {
    const r = this.#one(`SELECT MIN(expires) e FROM ai_runs WHERE status = 'running'`);
    if (!r || !r.e) return null;                       // no run in flight: no alarm at all
    const at = Date.parse(r.e);
    return Number.isFinite(at) ? Math.max(at, now) : null;
  }

  /** THE NEGATIVE CONTROL THE DESIGN NAMES, as a mechanism: a run KILLED
   *  mid-flight never calls anything, so this is what writes its log. It closes
   *  every lapsed run through the one exit; `expired: true` is the only thing it
   *  contributes, and `finishedBound` turns that into `lease` — or into whatever
   *  budget was ALREADY exhausted, because a run that overspent and then died
   *  was stopped by the budget, and reporting the lease there would name the
   *  symptom and hide the cause. */
  reap(now) {
    const iso = AiRuns.#aiIso(now);
    const lapsed = this.#rows(
      `SELECT run FROM ai_runs WHERE status = 'running' AND expires < ? ORDER BY run`, iso);
    const reaped = [];
    for (const r of lapsed) {
      const t = this.#aiRunTerminate({ run: r.run, offered: null, condition: null, at: iso, expired: true });
      reaped.push({ run: r.run, terminated: t.terminated === true, bound: t.bound || null });
    }
    return { at: iso, lapsed: lapsed.length, reaped };
  }

  /* ---- FL-4's three parts, and none of them decides anything either ----

     The reaper's three above answer *is this run over*. These three answer *is
     this run waiting on us, and has the daemon answered* — and they are
     deliberately built in the reaper's shape, next to it, because they are the
     other half of one question about a run that is not heartbeating. A run that
     stopped because it died and a run that stopped because it is waiting on our
     own daemon look identical from outside, and telling them apart is the whole
     of this item: before it, the reaper took both and recorded `lease` over
     both.

     THE WAKE'S LOG ENTRY DERIVES ITS STATE THROUGH `#aiRunSearchState`, the
     SAME reducer the one exit uses. So a resumed run and a reaped one describe
     what the search established through ONE function rather than two that
     agree — the parallel-path failure this repository has measured repeatedly,
     avoided here the way `finishedBound` avoids it one method up. */

  /* THE PRODUCER'S OWN CADENCE, CAPPED BY THE THING THE HOLD PROTECTS.

     Following `#captureRequestTickMs` rather than minting a second constant is
     the point: this consumer exists to notice what THAT one produced, and a
     wake slower than the producer it follows leaves a completed capture sitting
     undelivered for the difference. There is no second number to drift.

     THE CAP IS A CORRECTNESS REQUIREMENT AND NOT TIDINESS. The hold has to
     reach a suspended run BEFORE its lease lapses, so an instance that slows
     the drain past the lease (the env override admits any value) must not slow
     the hold with it — a quarter of the lease leaves three ticks of margin.
     THE FLOOR IS THE OTHER DIRECTION and it is not shared with the drain: the
     drain's queue empties, so a zero cadence there is a burst that ends, while
     a hold persists as long as the daemon owes an answer and a zero wake would
     spin an idle-looking instance for as long as that lasts. */
  #aiRunWakeTickMs() {
    return Math.max(1000, Math.min(this.#captureRequestTickMs(),
                                   Math.floor(AiRuns.AI_RUN_LEASE_MS / 4)));
  }

  /* HOW MANY RUNS ONE TICK HOLDS OR WAKES, AND THE FIGURE WAS NOT CHOSEN — IT
     WAS FORCED BY AN INSTRUMENT. The first shape of this consumer scanned
     `ai_runs` unbounded and looped over what came back, which is precisely the
     class `derivation-bounds.test.mjs` (deleted in T20) ratcheted (31 methods
     measured 2026-08-08, 11 of them dispatched): a method that AMPLIFIES work
     over an unbounded scan. That suite failed on the new member and named it,
     so the scan was bounded rather than the ceiling moved — a ceiling is not a
     ratchet. The bound is R16's, at most 25 runs per tick, and R16's test holds it.

     SIZED ON THE PRODUCER IT FOLLOWS. The drain lands at most
     `CAPTURE_REQUEST_TICK_BATCH` completions per tick, so a wake batch smaller
     than that would fall permanently behind the thing it exists to notice.
     Larger, because a hold is two integers and an UPDATE while a capture is a
     fetch, and because an instance that was unconfigured for a while can have a
     backlog of runs to hold on its first configured tick.

     A BATCH IS NOT A LOSS. While more remain the pending count stays above zero,
     so the wake re-arms and the next tick takes the next batch — the
     connection-derive sweep's progressive drain, and the reason that consumer
     can be bounded without dropping anything. */
  static AI_RUN_WAKE_TICK_BATCH = 25;

  /** THE SUSPENDED RUNS TO HOLD: still running, and the daemon still owes them
   *  an answer.
   *
   *  GATED ON THE DRAIN BEING CONFIGURED, exactly as `#captureRequestPending`
   *  is and for the same reason one layer up: where nothing drains, no request
   *  will ever complete, so a hold would keep a run alive for something that is
   *  not coming — an instance that has not wired this behaves byte-for-byte as
   *  it did before.
   *
   *  BOUNDED BY THE REQUEST'S OWN EXPIRY. `cr.expires > ?` is what stops this
   *  from being an immortality clause: a request nothing can satisfy stops
   *  holding its run at its own TTL, and the reaper then takes the run with an
   *  honest bound. Removing that predicate is declared control arm (4). */
  #aiRunWakeHolds(iso) {
    /* R16: the wait source answers the running runs with an outstanding, unexpired request, at most a batch. */
    if (!this.#captureRequestConfigured()) return [];
    const held = this.#wait().holds(iso, AiRuns.AI_RUN_WAKE_TICK_BATCH);
    return (Array.isArray(held) ? held : []).slice(0, AiRuns.AI_RUN_WAKE_TICK_BATCH)
      .filter((h) => h && this.#one(`SELECT 1 x FROM ai_runs WHERE run = ? AND status = 'running'`, String(h.run)))
      .map((h) => ({ run: String(h.run), outstanding: Number(h.outstanding) || 0 }));
  }

  /** THE RUNS TO WAKE: a completion the daemon has landed and this run has not
   *  been told about. `captured` and `refused` are BOTH completions — a refusal
   *  is an answer, and a run left waiting on a request that will never be tried
   *  again is a run waiting on nothing. */
  #aiRunWakeRuns() {
    /* D-260: `principal_plane` joins the projection because the resumption's ONE gate compares it — the run's own
       stamp, never a field anybody sent. It is read for that comparison and published nowhere by this path. */
    /* R16, R17: the runs the wait source says have completions not yet woken; none registered, none. */
    const w = this.#wait();
    if (!w) return [];
    const ids = w.woken(AiRuns.AI_RUN_WAKE_TICK_BATCH);
    return (Array.isArray(ids) ? ids : []).slice(0, AiRuns.AI_RUN_WAKE_TICK_BATCH)
      .map((run) => this.#one(`SELECT run, context_type, context_id, principal_plane, principal_claude, principal_claude_ref, step FROM ai_runs
                                WHERE run = ? AND status = 'running'`, String(run)))
      .filter(Boolean);
  }

  wakeDue(now) {
    const iso = AiRuns.#aiIso(now);
    return this.#aiRunWakeHolds(iso).length + this.#aiRunWakeRuns().length;
  }

  wakeWake(now) {
    /* NULL WHEN NOTHING IS SUSPENDED — the self-termination property REC-1
       prized, stated here rather than inherited: an instance with no run
       waiting on the daemon contributes no wake and holds no alarm at all. */
    if (this.wakeDue(now) <= 0) return null;
    return now + this.#aiRunWakeTickMs();
  }

  /** THE TICK. The hold keeps a legitimately-waiting run alive; the wake
   *  delivers the daemon's answer exactly once.
   *
   *  THE HOLD MOVES `expires` AND DELIBERATELY NOT `updated`. `updated` is when
   *  the RUN last acted, and the plane declining to kill a run is not the run
   *  acting — a reader must still be able to see how long it has been silent.
   *  Moving both would have made a held run indistinguishable from a
   *  heartbeating one, which is the fact this consumer exists to preserve.
   *
   *  IT GRANTS THE STANDARD LEASE AND NOT THE RUN'S OWN, stated because it is
   *  visible from outside: `leaseMs` is an argument to `aiRunOpen` and
   *  `aiRunTick`, it is never stored, and the record therefore has no memory of
   *  what a particular caller chose. `AI_RUN_LEASE_MS` is the only figure the
   *  store holds, so a run opened on a shorter lease is held on the standard
   *  one while the daemon owes it an answer. That is a widening and it is
   *  bounded twice over — by the request's own expiry, and by the fact that
   *  nothing renews it once the request is answered. */
  async wake(now) {
    const iso = AiRuns.#aiIso(now);
    const until = AiRuns.#aiIso(now + AiRuns.AI_RUN_LEASE_MS);
    const holds = [], wakes = [], dispatches = [];
    /* D-260: the resumer is resolved ONCE per tick and only when a run is about to be woken, BEFORE the synchronous
       hold-and-wake section below, so that section stays one uninterrupted read-and-write. */
    const resumer = this.#aiRunWakeRuns().length ? await this.#aiRunResumer() : null;
    for (const r of this.#aiRunWakeHolds(iso)) {
      this.#transact(() => { this.sql.exec(`UPDATE ai_runs SET expires = ? WHERE run = ?`, until, r.run); });
      holds.push({ run: r.run, outstanding: r.outstanding, expires: until });
    }

    for (const r of this.#aiRunWakeRuns()) {
      /* BOUNDED TOO, and for the same reason the run scan is: one run may have
         asked for many documents, and a wake that read all of them would put
         the unbounded scan back one level down. Completions past the batch stay
         unstamped, so the run is woken again on the next tick with the rest —
         a completion is DELAYED by a backlog and never dropped by one. */
      const done = (this.#wait().completions(r.run, AiRuns.AI_RUN_WAKE_TICK_BATCH) || []).slice(0, AiRuns.AI_RUN_WAKE_TICK_BATCH);
      if (!done.length) continue;      // the row's own EXISTS already proved otherwise
      /* D-583: `expired` is a completion too (capture-requests R29); each state is counted as itself. */
      const captured = done.filter((q) => q.state === "captured").length;
      const expired = done.filter((q) => q.state === "expired").length;
      const refused = done.length - captured - expired;
      /* D-260 — THE DECISION IS MADE BEFORE THE ENTRY IS WRITTEN, so the entry can say which it was. */
      const decision = this.#aiRunResumeDecision(r, resumer);
      const bad = this.#transact(() => {
        /* THE ENTRY FIRST, then the lease and the stamp — `#aiRunTerminate`'s
           order and its reasoning: if anything could fail it is the append, and
           a run left unwoken with nothing written is retried on the next tick,
           while a run stamped as woken with no entry has lost the record of it.
           THE APPEND CANNOT REFUSE FROM HERE BY CONSTRUCTION — the state comes
           from the reducer, there is no bundle, no condition and `governed` is
           false — so this branch is undrivable today. It is kept, and the
           failure is reported rather than swallowed, because the consequence of
           swallowing it is a wake that silently never happened: the answer
           NAMES it and the row stays unstamped, so a defect here is loud on
           every alarm instead of invisible on all of them. */
        /* NO ACTOR, and the NULL is stated rather than filled. The wake
           is the PLANE noticing a completion, and no principal performed it.
           D-260 widened the wake query to carry the run's `principal_plane`,
           but only so the resumption gate can COMPARE it: stamping it here as
           the actor would say the run's principal wrote an entry it never
           wrote. So the wake entry still says "a machine looked and the record
           cannot say which", which is true, instead of borrowing a name. */
        const refusal = this.#aiRunAppend(r.run, {
          level: "internet",
          subject: r.context_id,
          /* The rollup AND its `observation` referent (REC-100, IC-130): a wake
             entry is a rollup like the terminal one, so it points at the latest
             PRESENT look it restates, computed in the same read. */
          ...this.#aiRunRestatedState(r.run),
          governed: false,
          detail: `the daemon answered ${done.length} capture request(s) this run was waiting on `
                + `(${captured} captured, ${refused} refused, ${expired} expired). The run is resumable: its own log `
                + `carries what each request established, and §14b.7's resumed run reads it and `
                + `continues rather than restarting. ${decision.says}`,
        }, iso, 0, null, r.step || null);
        if (refusal) return refusal;
        this.sql.exec(`UPDATE ai_runs SET expires = ? WHERE run = ?`, until, r.run);
        this.#wait().markWoken(done.map((q) => q.request), iso);
        return null;
      });
      wakes.push({ run: r.run, completions: done.length, captured, refused, expired,
                   woken: !bad, ...(bad ? { unwritable: bad } : { expires: until }),
                   resume: decision.dispatch ? "DISPATCH" : decision.withheld });
      if (!bad && decision.dispatch) dispatches.push({ run: r.run, context_id: r.context_id, payer: AiRuns.#memberOfRun(r), step: r.step || null, project: r.context_type === "project" ? r.context_id : null,
                                       owner: r.principal_claude });
    }

    /* D-260 — THE DISPATCH, AFTER EVERY WAKE IS WRITTEN AND OUTSIDE ANY TRANSACTION: a network call inside
       a transaction is impossible, and a wake whose entry and stamp waited on another Worker would put the
       delivery-exactly-once property at the mercy of that Worker's latency. */
    for (const d of dispatches) {
      const outcome = await this.#aiRunDispatch(d, resumer, iso);
      const w = wakes.find((x) => x.run === d.run);
      if (w) w.dispatch = outcome;
    }
    return { at: iso, held: holds.length, holds, woken: wakes.length, wakes,
             dispatched: wakes.filter((w) => w.dispatch && (w.dispatch.state === "DISPATCHED" || w.dispatch.state === "RUNNING")).length };
  }

  /* =====================================================================
   * D-260 — THE WOKEN RUN'S CALLER (BOB #22, 2026-09-21; `BIO_Assistant_and_AI_Roles_v0_1.md` §6).
   *
   * FL-4 made a woken run a fact in the record and nothing re-entered it. This is the caller: the wake hands a
   * woken run to `agent-worker` (I8), under the instance's ONE organisation-principal `ai` credential, and ONLY
   * when that credential is the run's own principal. The ruling's reason is DEC-55 (4): the two principals carry
   * different accountability, so continuing a member's attributable run under the group's key would re-attribute
   * its later acts. A member's run therefore keeps FL-4's behaviour — woken, told, waiting for its own principal —
   * and the wake entry SAYS it was not dispatched and why. That is a stated LIMITATION, never a silent skip.
   *
   * THE GATE IS ONE COMPARISON, of two stamps the PLANE made: the run's `principal_plane` (stamped at open, D-199
   * (4), `<principal>/<tokenId>`) against the same composite built from the instance credential's own RECORD row.
   * Nothing a caller sent is compared. REC-152 (C-22.12) would ALSO refuse the resumed run's first tick under a
   * key that is not its principal — and that is exactly why it is not relied on here: a dispatch that leans on
   * the refusal downstream has already handed a member's run to the group's key, and the refusal proves only
   * that the tick failed. R18's test counts calls AT THE BINDING for that reason: no withheld run reaches it.
   *
   * THE SECRET NEVER REACHES THE RECORD. The token is read from the Worker secret, used as the dispatch body's
   * `credential`, and dropped; what the tick answers, and what the wake entry says, name the credential by its
   * record identity (`tokenId`) and never by value. `agent-worker` retains nothing (fleet law, I8).
   * ================================================================== */

  /** The namespace this Durable Object IS, asked of the runtime rather than remembered: `admission`'s
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

  static AI_RUN_DISPATCH_WAIT_MS = 30_000;
  #aiRunDispatchWaitMs() {
    const v = Number(this.env && this.env.AI_RUN_DISPATCH_WAIT_MS);
    return Number.isFinite(v) && v > 0 ? v : AiRuns.AI_RUN_DISPATCH_WAIT_MS;
  }

  /** WHO MAY RESUME, resolved once per tick: `{ ready: true, stamp, tokenId, token, store }` or
   *  `{ ready: false, withheld }`. `withheld` is a stated reason, never a secret. The credential is resolved the
   *  way the control plane resolves one (`admission`'s `aiCredentialPresented`: `aicredentiallook` against the
   *  `bio` object, which alone holds `ai_credentials`), so a key revoked by a member stops resuming anything the moment the row says so. */
  async #aiRunResumer() {
    const env = this.env || {};
    if (!env.AGENT_WORKER || typeof env.AGENT_WORKER.fetch !== "function")
      return { ready: false, withheld: "AGENT_WORKER_UNBOUND" };
    const cred = await instanceAiCredential(env);
    if (!cred.token) return { ready: false, withheld: cred.reason };
    const store = this.#ownNamespace();
    if (!store) return { ready: false, withheld: "NAMESPACE_UNDETERMINED" };
    const sha = await sha256hex(cred.token);
    let look = null;
    if (store === "bio") look = credentialsOf(this.ctx).aiCredentialLook({ secretSha: sha });
    else {
      try {
        const res = await env.STORE.get(env.STORE.idFromName("bio"))
          .fetch(`http://do/aicredentiallook?sha=${sha}`);
        const out = await res.json().catch(() => null);
        look = out && out.ok === true ? out.result : null;
      } catch { look = null; }
      if (!look) return { ready: false, withheld: "CREDENTIAL_RECORD_SILENT" };
    }
    const c = look && look.found ? look.credential : null;
    if (!c) return { ready: false, withheld: "INSTANCE_AI_CREDENTIAL_NOT_ON_RECORD" };
    if (c.revoked) return { ready: false, withheld: "INSTANCE_AI_CREDENTIAL_REVOKED", tokenId: c.tokenId };
    /* ONE ORGANISATION-PRINCIPAL credential is what the ruling permits. A member-kind key configured here would
       make every run THAT MEMBER's key opened resumable by the instance, which is the re-attribution the ruling
       exists to prevent — so it resumes nothing, and says so. */
    if (c.principalKind !== "organisation")
      return { ready: false, withheld: "INSTANCE_AI_CREDENTIAL_NOT_ORGANISATION", tokenId: c.tokenId };
    /* K1502, K1514, K1755: the copy binds no Claude credential; the account a resumed run is carried by is the one that
       serves its member's act (R52: their own, or the group's API key), read per run at the dispatch. */
    return { ready: true, stamp: `${c.principal}/${c.tokenId}`, tokenId: c.tokenId, token: cred.token, store };
  }

  /** THE GATE, and the sentence the wake entry carries. `dispatch` is true ONLY on equality of the two stamps. The
   *  sentence (`says`) is served to a member in the run's log (R24), so it calls the group's own Civicsmith "your group's
   *  Civicsmith" (R54, DEC-149); `withheld`'s values are codes and stay. */
  #aiRunResumeDecision(run, resumer) {
    const principal = String((run && run.principal_plane) || "");
    /* R52 (K1503, K1755): the run continues only on the account that serves the act of the member who started it (their
       own, their own sign-in (T38; K2299), or the group's key); with none, it is withheld by name and waits, and the binding is not called. */
    const payer = AiRuns.#memberOfRun(run);
    /* (T41) a run a project's account pays for is judged by that account at the dispatch itself (credentials R56) */
    const projectPaid = typeof (run && run.principal_claude) === "string" && run.principal_claude.startsWith("project:");
    if (resumer && resumer.ready && principal === resumer.stamp && !(payer && (projectPaid || this.#accountServing(payer))))
      return { dispatch: false, withheld: "NO_ACCOUNT",
               says: "Resumption: NOT dispatched — no Claude account serves the member whose act started this run (none of "
                   + "their own is connected, and the group's key is not set or not on), and a run continues only on the "
                   + "account that serves that member's act (K1503, K1755). It waits." };
    if (resumer && resumer.ready && principal === resumer.stamp)
      return { dispatch: true, withheld: null,
               says: `Resumption: handed to agent-worker under the organisation credential '${resumer.tokenId}' of `
                   + `your group's Civicsmith, which opened this run.` };
    const member = principal.startsWith("member:");
    const withheld = member ? "MEMBER_PRINCIPAL_RUN"
      : (resumer && !resumer.ready) ? resumer.withheld : "NOT_THE_INSTANCE_CREDENTIALS_RUN";
    const why = member
      ? "a member's credential opened it, and your group's Civicsmith resumes only runs its own organisation credential "
        + "opened (D-260, DEC-55 (4): continuing a member's run under the group's key would re-attribute its acts). "
        + "It waits for its own principal"
      : withheld === "NOT_THE_INSTANCE_CREDENTIALS_RUN"
        ? "another principal opened it, and the organisation credential of your group's Civicsmith resumes only the runs "
          + "it opened"
        : `your group's Civicsmith cannot resume anything here (${withheld})`;
    return { dispatch: false, withheld, says: `Resumption: NOT dispatched — ${why}.` };
  }

  /** THE CALL. Bounded, and every way it can fail is a stated outcome carrying no secret. A dispatch that did not
   *  complete appends ONE entry saying so, because the wake entry above it said the run was handed over. */
  async #aiRunDispatch(d, resumer, iso) {
    /* R52, K1514, K1601, K1755 (agent-worker R6, R10): the body carries `account`, the account `credentials.accountFor`
       answers for the act of the run's member (its R35), `{kind, level, secret, member, suggestions}`: `level` `member`
       for their own reference or (T38; K2299) their own sign-in, `signin`, never re-labelled an API key (K1553), `group`
       for the group's API key, whose use is still that member's act; `secret` is R35's `key`, named as agent-worker R6
       reads it, and absent for a sign-in, which carries none;
       `member` is the run's account member, `member:<id>`, so agent-worker can check it against the run (its R10). Used
       for this one call and kept nowhere here. The instance Claude account it carried before is retired (K1502). */
    let outcome, timer;
    let ref = d.payer ? await this.#accountFor(d.payer, "run", d.project) : null;
    /* R52 (T41): the account that serves now must be the one the run recorded as paying; a run never moves to another */
    if (ref && !ref.refusal && d.owner && ref.owner !== d.owner) ref = { refusal: { code: "NO_ACCOUNT", reason: "NO_ACCOUNT" } };
    if (!ref || ref.refusal)
      outcome = { state: "REFUSED", status: null,
                  reason: String((ref && ref.refusal && (ref.refusal.code || ref.refusal.reason)) || "NO_ACCOUNT").slice(0, 80) };
    /* K1615 (agent-worker R56): and the switch that governs the serving account. */
    /* (T41; credentials R55, R37) every account now holds its `suggestions` switch, set by `accountUsesSet`: a member's
       reference or sign-in (whichever serves, read through `accountUses` as that member, R60), and the group key
       (`groupKeySwitches()`, an in-plane read). Anything but an explicit on is off. */
    let suggestions = false;
    if (!outcome) {
      try {
        const c = credentialsOf(this.ctx);
        if (ref.level === "group") suggestions = c.groupKeySwitches().suggestions === true;
        else if (ref.level === "member") {
          const u = c.accountUses({ owner: `member:${d.payer}`, viewer: `member:${d.payer}` });
          const acct = u && u.ok === true && u.accounts ? (ref.kind === "signin" ? u.accounts.signin : u.accounts.reference) : null;
          suggestions = !!(acct && acct.uses && acct.uses.suggestions === true);
        }
      } catch { suggestions = false; }
    }
    const body = outcome ? null : { run_id: d.run, store: resumer.store, credential: resumer.token,
                                    account: { kind: ref.kind, level: ref.level,
                                               ...(ref.kind === "signin" ? {} : { secret: ref.key }),
                                               member: `member:${d.payer}`, suggestions } };
    ref = null;
    if (body) try {
      const res = await Promise.race([
        this.env.AGENT_WORKER.fetch("https://agent-worker/run", {
          method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }),
        new Promise((_, no) => { timer = setTimeout(() => no(new Error("dispatch-wait-elapsed")), this.#aiRunDispatchWaitMs()); }),
      ]);
      const out = await res.json().catch(() => null);
      const said = String((out && (out.reason || out.code || out.type)) || `http ${res.status}`);
      outcome = (res.ok && out && out.ok === true)
        ? { state: "DISPATCHED", status: res.status }
        /* R50: the member's own provider limit is answered in plain words, as the ceiling is, never as an error. */
        : PROVIDER_LIMIT.test(said) ? { state: "LIMIT", status: res.status, ...this.#providerLimit() }
        : { state: "REFUSED", status: res.status, reason: said.slice(0, 80) };
    } catch (e) {
      /* D-205's rule: the plane's own words, never the exception's — a thrown error can carry a request, and this
         request carries a credential. */
      /* The sentinel is lowercase and compared on its own line: this outcome is a dispatch STATE, not a refusal
         code, and a code-shaped literal inside a `reason:` expression is read into DEC-49's census as one. */
      const elapsed = String(e && e.message) === "dispatch-wait-elapsed";
      /* B6 (AGENT-WORKER #1 REPORT 2): a segment answers when it ends, and a model segment can run past the wait. The
         request was delivered and nothing refused it, so it is RUNNING, not silent: no failure entry is written (the
         segment's own ticks record what it does, and a segment that dies lets the lease lapse to the reaper). Only a
         call that did not complete is SILENT. */
      outcome = elapsed
        ? { state: "RUNNING", status: null, reason: "no answer within the bound: the segment is still running" }
        : { state: "SILENT", status: null, reason: "the call did not complete" };
    } finally { clearTimeout(timer); }
    if (outcome.state !== "DISPATCHED" && outcome.state !== "RUNNING") {
      const refusal = this.#transact(() => this.#aiRunAppend(d.run, {
        level: "internet", subject: d.context_id, ...this.#aiRunRestatedState(d.run), governed: false,
        detail: outcome.state === "LIMIT"
          ? `Resumption: not continued now — ${outcome.detail} The run was woken and is still `
            + `resumable by its own principal; nothing it established is lost`
          : `Resumption: the dispatch to agent-worker did not complete (${outcome.state}: ${outcome.reason}). `
            + `The run was woken and is still resumable by its own principal; nothing it established is lost`,
      }, iso, 0, null, d.step || null));
      if (refusal) outcome.unwritable = refusal;
    }
    return outcome;
  }

  /** op=airun — THE RUNNING-SESSION SURFACE'S READ (UI-38's rider).
   *
   *  The shape is chosen to be what UI-38's renderers already walk, because
   *  they are FIELD-NAME-BLIND: they print published name/value pairs verbatim
   *  in publication order and know no field names, so they cannot invent one
   *  and cannot go stale. `budget` is an ARRAY of scalar rows, `principal` and
   *  `condition` are flat objects, and nothing here is derived — `allowed` and
   *  `consumed` travel separately because a percentage computed anywhere fails
   *  that surface's own pin.
   *
   *  WHERE NO RUN EXISTS THIS ANSWERS `session: null`, which is a supported
   *  state and not a gap: §14a's surface shows NO INDICATOR rather than an
   *  invented "nothing is running".
   *
   *  NO TRANSCRIPT IS PUBLISHED HERE OR ANYWHERE (DEC-61). The plane holds
   *  none; the surface reads the device's own.
   *
   *  GATED. The run names an inquiry or a project bundle, and a run over a
   *  project the viewer may not see would disclose that the project exists —
   *  REC-25/REC-30's leak exactly. The gate is `#bundleGate` on `context_id`,
   *  through membership's `viewerPredicate`, the one compilation point (D-15). */
  /*  PL-12 / D-84 — AND THIS IS WHERE THE RUN STOPS CARRYING AN ABSENCE.
   *
   *  §3, RULED: *"the run carries the bias manifest in force when it ran … an
   *  assistant-surfaced focus must carry the bias manifest in force when it was
   *  surfaced… unlike a member it will not remember. Without the manifest… bias
   *  debt cannot be computed against it."* §3 also recorded the reason it could
   *  not be done: *"UNBUILDABLE TODAY: object_type: bias is absent from the
   *  check catalogue (D-84) … until D-84 lands, the manifest-carrying obligation
   *  is dischargeable only as 'no manifest was in force,' stated."*
   *
   *  MEASURED BEFORE THIS CHANGE, AND IT WAS WORSE THAN THE DESIGN SAID: this
   *  method published NO bias field of any kind. `ai_runs.bias_manifest` was
   *  written by `aiRunOpen` and read by nothing, so the honest absence §3
   *  settled for was not stated ANYWHERE a reader could see it — the run held a
   *  column and the answer was silent. An unstated limit reads as completeness,
   *  which is DEC-56/57/58's ruling exactly.
   *
   *  WHAT "IN FORCE" MEANS HERE, AND WHY IT IS NOT AN ECHO. The recorded
   *  manifest is what the run was FORMED under and is never recomputed —
   *  `aiRunOpen` stores it verbatim and derives nothing, deliberately. This read
   *  puts the record's CURRENT effective set beside it and says whether the lens
   *  has MOVED since. That comparison is the whole payoff: it is what makes bias
   *  debt computable against a run's output, which is the sentence §3 quotes
   *  from `Content_Framework` and the reason the obligation exists at all.
   *  Three distinguishable answers, never two:
   *    - `in_force: false` with `stated` — no manifest was in force. Honest
   *      absence, still supported, still the answer for a run opened without one.
   *    - `in_force: true, moved: false` — the lens the run carried is the lens
   *      the record holds now.
   *    - `in_force: true, moved: true` — the lens has changed since; the run's
   *      output owes a re-run under the current set. Ordinary BIAS DEBT, which
   *      is DISCLOSED and travels and blocks NOTHING (DEC-20, D-188) — it is
   *      HUNCH debt that disqualifies, and no hunch is named here.
   *
   *  ASYNC now, because the effective set is HASHED and `crypto.subtle` is. The
   *  dispatch already awaits every handler. */
  async read({ run, viewer = null } = {}) {
    const seen = this.#bundleGate("r.context_id", viewer);
    const row = this.#one(
      `SELECT r.* FROM ai_runs r WHERE r.run = ? AND ${seen.sql}`, run, ...seen.args);
    if (!row) return { run: run || null, found: false, session: null };
    const bounds = this.#rows(
      `SELECT bound, allowed, consumed, unit FROM ai_run_bounds WHERE run = ? ORDER BY bound`, run);
    /* R19: the stopping bound's or ending's sentence, whether or not a queue condition was named beside it (a close
       names none, and its ending's sentence is still what a reader is owed). */
    const cond = row.stopped_bound
      ? { kind: row.stopped_condition || "",
          detail: `${row.stopped_bound}: ${RUN_BOUNDS[row.stopped_bound] || RUN_ENDINGS[row.stopped_bound]
                                           || "a bound or ending this vocabulary no longer holds"}`,
          bound: row.stopped_bound, at: row.stopped_at }
      : null;

    /* PL-12: THE MANIFEST BLOCK. Read the header on `aiRunRead` for what the
       three answers mean and why the comparison rather than the echo is the
       point. Computed in ONE function because `aiRunSpawnPayload`'s COMPOSING
       half publishes the same block, and two computations of "what lens was
       this run formed under" would be two answers to a question that has one. */
    const bias = await this.#biasForRun(row, viewer);

    return { run, found: true, session: {
      id: row.run,
      label: row.label,
      mode: row.mode,
      status: row.status,
      ticks: row.ticks,
      created: row.created,
      updated: row.updated,
      expires: row.expires,
      /* D-451: a run over a PROJECT also publishes `questions` — the questions it confirmed-cites that this
         viewer can see (`#runContextQuestions`), the set `op=suggest` admits as its target. A run over a
         question publishes none: its context id IS its one question. */
      context: row.context_type === "project"
        ? { type: row.context_type, id: row.context_id,
            questions: this.#runContextQuestions(row.context_id, viewer) }
        : { type: row.context_type, id: row.context_id },
      /* §14a: the record names WHOSE Claude account carried the run (`member:<id>`, R52), BESIDE the
         plane-credential principal — two principals, never one, and never a
         token value. `ref` is the opener's own label for the account. */
      principal: { plane: row.principal_plane, claude: row.principal_claude,
                   ref: row.principal_claude_ref, skill: row.skill_version },
      budget: bounds.map((b) => ({ bound: b.bound, allowed: b.allowed,
                                   consumed: b.consumed, unit: b.unit })),
      condition: cond,
      /* PL-12 / D-84: the conditions the run was formed under gain their third
         member. It sits BESIDE `principal` and `budget` rather than inside
         them, because it is neither an identity nor an allowance — it is the
         LENS, and §11's whole reason for recording the conditions is that a
         version is only interpretable against them. */
      bias,
      /* REC-74: AND THE THIRD CONDITION, WHICH WAS SILENT HERE UNTIL NOW.
         §11's three are the manifest, the SKILL VERSION and the launching
         project's declared STANDARD PAIR. Two of them were published — the
         skill inside `principal`, the manifest as `bias` — and this one was
         written by `aiRunOpen`, published by `aiRunSpawnPayload`, and read by
         nobody here, so a member reading the run object could not see the bar
         the run was working to. It sits beside `bias` for the same reason
         `bias` sits beside `principal`: a bar is not an identity and not an
         allowance, it is the standard the work was held to.

         THE KEY IS ALWAYS PRESENT ON A FOUND RUN, and that is the whole
         design. An absent key means the READER does not publish this fact;
         `standard.in_force: false` with its `basis` and its `stated` sentence
         means we looked and there was no bar. A consumer can tell those apart;
         a null could not, which is why no null is published here. */
      standard: this.#standardForRun(row),
      /* B6 (AGENT-WORKER #1 REPORT 3): the run's resumable scratch as its last tick wrote it (R12), so a resumed
         segment continues its work list rather than restarting it; null when it cannot be read back. Never a
         transcript (DEC-61): it is the work list the run itself sent. */
      state: safeJson(row.state),
      /* R19 (N190): the run this run re-runs (REC-207's `rerun_of`, judged at the open), published only when this
         viewer can see that run too, through the same sight; else null — a run that re-runs nothing and one whose
         earlier run is out of view answer alike, so the field never says a hidden run exists. */
      rerun_of: row.rerun_of != null && String(row.rerun_of).trim() !== "" && this.#aiRunInSight(String(row.rerun_of), viewer)
        ? String(row.rerun_of) : null,
      /* R73: the step a step-run works on, and its origin; the keys exist only on a run that names a step or explores. */
      ...(row.step ? { step: row.step } : {}),
      ...(row.origin && row.origin !== "member" ? { origin: row.origin } : {}),
      /* R76 (D12): the run's cost, only to its paying account's owners; no key at all for anyone else */
      ...(this.#costFor(row, viewer) ? { cost: this.#costFor(row, viewer) } : {}),
      /* R46: the plan a planning run works on; the key exists only on a run in mode `plan`. */
      ...(row.mode === "plan" ? { plan: row.plan ?? null } : {}),
    } };
  }

  /** REC-74: the run's BAR, computed ONCE, for the same reason `#biasForRun`
   *  is — `aiRunSpawnPayload` publishes the same block, and "what bar was this
   *  run formed under" is a question with one answer.
   *
   *  NEVER RECOMPUTED AND NEVER LOOKED UP. `aiRunOpen` stores what the launch
   *  handed it and derives nothing; this reads that back and JUDGES it, which
   *  is a different act from deriving one. In particular it does NOT go and ask
   *  the project what its declared strength is today: DEC-17 puts the bar on
   *  the project axis, and a read that substituted the project's CURRENT
   *  declaration for the one the run was formed under would answer a different
   *  question and look identical. (`bias` publishes both sides precisely
   *  because it can COMPARE them; there is no comparison to make here until an
   *  op publishes a project's declared pair, which none does today — stated as
   *  a limit rather than papered over, and delegated.)
   *
   *  THE PAIR IS NEVER COMPOSED. DEC-21/DEC-44 refuse the composition four
   *  ways: capture and connection range over two different populations and
   *  nothing here averages, mixes or reduces them to one value. An axis the
   *  recorded bar does not name is published as `null` BESIDE the one it does,
   *  never filled in from its sibling.
   *
   *  Synchronous, deliberately: unlike the manifest there is no hash and no
   *  second read, so making this async would buy a promise nobody awaits for. */
  #standardForRun(row) {
    const raw = row.standard_pair;
    let parsed = null, unreadable = false;
    if (raw != null && String(raw).trim() !== "") {
      try { parsed = JSON.parse(String(raw)); }
      catch { unreadable = true; }
      /* An array or a scalar is not a pair. Judged rather than spread: a
         `JSON.parse("7")` that reached the return would publish `pair: {}` and
         read as a declared bar naming no axes, which is the shape below that
         this branch exists to keep out of `recorded`. */
      if (parsed !== null && (typeof parsed !== "object" || Array.isArray(parsed))) {
        parsed = null; unreadable = true;
      }
    }
    /* PL-4's measurement, applied here: a value that survives a falsiness guard
       while naming nothing reads as PRESENT and travels. A recorded object that
       names neither axis is not a bar, and saying so is not strictness — it is
       the difference between "the group set a standard" and "a field was
       filled in". */
    const axis = (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
    const capture = parsed ? axis(parsed.capture) : null;
    const connection = parsed ? axis(parsed.connection) : null;
    const basis = unreadable ? "unreadable"
      : parsed !== null ? (capture === null && connection === null ? "names-no-axis" : "recorded")
      /* DEC-17, verbatim: *"An inquiry outside any project has no bar. The
         declaration is a property of a project… and inheriting a bar from
         somewhere else would invent one."* So the projectless run's absence is
         STRUCTURAL and the projected run's is a fact about its formation, and
         the two are different answers rather than one null. */
      : row.context_type === "project" ? "none-recorded"
      : "context-has-no-project";
    return {
      in_force: basis === "recorded",
      basis,
      /* The sentence travels WITH the answer, from the plane's own vocabulary,
         so a surface renders what it RECEIVED rather than holding a copy of the
         map (DEC-8, and `op=airunlog`'s own precedent one method down). */
      stated: STANDARD_BASIS[basis],
      pair: basis === "recorded" ? { capture, connection } : null,
    };
  }

  /** op=airuns — WHICH RUNS ARE IN THIS CONTEXT. REC-69, UI-49's delegation.
   *
   *  ===========================================================
   *  THE QUESTION NO OP COULD ANSWER, AND WHY THAT MATTERED.
   *  ===========================================================
   *
   *  §14a promises that *"any window focused on an inquiry or a project shows
   *  an animated indicator that a job is running"*. UI-47 found the indicator
   *  had no call site at all; UI-49 built one — and MEASURED, while building
   *  it, that the plane could not be asked the question. `op=airun`,
   *  `op=airunlog` and `op=airunspawn` are all keyed by RUN ID, `ai_runs` is
   *  queried by `run` at all 14 sites, and `op=airunopen` has no UI consumer,
   *  **so the browser never learns a run id by opening one.** UI-49 therefore
   *  fed its seam from the only source that existed — the run addresses THIS
   *  DEVICE had already opened — which is honest, is pinned, and reaches only
   *  the member who already held the address. §14a's promise is about the
   *  TEAMMATE WHO DID NOT, and this method is the half that reaches them.
   *
   *  ===========================================================
   *  THE GATE, AND WHY THIS SHAPE IS THE ONE THAT LEAKS IF IT IS WRONG.
   *  ===========================================================
   *
   *  A run-id read is a poor leak: a caller must already hold the id. A
   *  CONTEXT-KEYED LIST is the opposite — it takes an id a member can see on
   *  their own screen and answers with everything hanging off it. So the gate
   *  is not incidental here, it is the feature's whole security posture.
   *
   *  IT IS `#bundleGate` ON `context_id`, THE SAME PREDICATE AND THE SAME
   *  COMPILATION POINT (D-15) that `aiRunRead`, `aiRunLog` and
   *  `aiRunSpawnPayload` already compile. **NO SECOND PREDICATE IS WRITTEN
   *  HERE**, and that is deliberate rather than economical: PL-11 measured that
   *  `viewerPredicate`'s MACHINE alternation returns an unfiltered `1=1`, so a
   *  hand-rolled gate that forgot the carve-out — or remembered it wrongly —
   *  would hand an agent the whole store, and a hand-rolled one that forgot the
   *  FAIL-CLOSED deny would turn a missing control-plane stamp from an outage
   *  into a leak. Both arms are `viewerPredicate`'s and neither is restated.
   *
   *  THE POSTURE IS WITHHOLD, NEVER REDACT (REC-36). A run over a project the
   *  viewer was never invited to is absent from this list BYTE-IDENTICALLY to a
   *  run that does not exist, and **no count of what was withheld is reported**
   *  — that count is exactly the disclosure that somebody is investigating
   *  something you cannot see (op=backlinks' rule; R22's tests hold it: a
   *  hidden context answers byte for byte as an empty one, and `truncated`
   *  counts only the runs the viewer may see). It follows that a well-formed context with no
   *  visible runs answers an ordinary EMPTY LIST: "no runs here" and "no runs
   *  you may see" are ONE answer BY CONSTRUCTION rather than by care.
   *
   *  ===========================================================
   *  BOUNDED, AND THE BOUND IS PUBLISHED — IC-25/IC-26's rule.
   *  ===========================================================
   *
   *  `limit` is the cap AFTER clamping, never the number the caller asked for;
   *  `truncated` is the completeness signal, in the spelling its three siblings
   *  already use (`op=airunlog`, `op=versionchain`, `op=basisversions`) rather
   *  than a fifth word beside the plane's four (REC-55). Both are published on
   *  the EMPTY answer too, so a reader who sees nothing does not have to guess
   *  which bound they would have been answered at. `cap + 1` is asked for and
   *  `cap` delivered — `op=exportlog`'s mechanism — because the extra row is
   *  the whole difference between "this context has 200 runs" and "here are its
   *  first 200".
   *
   *  ORDER IS NEWEST FIRST, and the cut therefore falls on the OLDEST. This is
   *  NOT `op=airunlog`, which is replayed FROM THE START by a resuming run
   *  (§14b.7) and must keep ascending order; the question here is "what is
   *  happening in this context", and a surface cut off from the newest run
   *  would be a surface that cannot see the job that is running now.
   *
   *  NO STATUS FILTER, deliberately. A `status='running'` filter here would put
   *  the judgement in the plane and leave a surface unable to render the run
   *  that ENDED — which is the overclaim UI-49 removed one layer up when it
   *  made the indicator carry the record's own status word instead of pulsing
   *  unconditionally. The record answers what is there; the surface decides
   *  what to draw. */
  async listInContext({ contextType = null, contextId = null,
                          viewer = null, limit = null } = {}) {
    /* The helper sits ABOVE the marker, on `#refusePairComposed`'s precedent
       and for its measured reason: the code here is a VARIABLE, so a `where`
       that enclosed it would report a refusal the DEC-49 guard cannot compare
       against a row. Every refusal INSIDE the region names its code as a STRING
       LITERAL, which is what makes arm C's verdict on this site evidence. */
    const refusal = (code, detail) => {
      const row = this.#checkRow(code);
      return { ok: false, reason: code, code, check: row.check,
               translation: row.translation, detail };
    };
    const kinds = Object.keys(RUN_CONTEXTS);
    const type = contextType == null ? "" : String(contextType).trim().toLowerCase();
    const id = contextId == null ? "" : String(contextId).trim();

    /* DEC-49 REGION is-airuns-context — REC-69 / C-36.1-3. The three ways the
     * QUESTION can be malformed, and nothing else: everything below this marker
     * is the answer, and a well-formed question about a context that holds no
     * visible runs is answered rather than refused. */
    if (!type)
      return refusal("AI_RUNS_NO_CONTEXT_TYPE",
        `op=airuns answers for ONE context and must be told which kind: contextType=${kinds.join("|")}. `
        + "An inquiry and a project are different objects with different membership, so there is no "
        + "default here that would not be answering about something you did not ask about.");
    if (!kinds.includes(type))
      return refusal("AI_RUNS_UNKNOWN_CONTEXT_TYPE",
        `no work is attached to anything of the kind ${JSON.stringify(String(contextType).slice(0, 60))}. `
        + `The kinds it is attached to: ${kinds.map((k) => `${k} (${RUN_CONTEXTS[k]})`).join("; ")}. `
        + "Answered as a refusal rather than as an empty list, because an empty list here would say "
        + "nothing is running in a place the record does not recognise.");
    if (!id)
      return refusal("AI_RUNS_NO_CONTEXT_ID",
        `op=airuns named the kind ${JSON.stringify(type)} but not which one. The gate is compiled over `
        + "the context's own id, so a blank id would ask about every context at once — a different "
        + "question, not a wider answer.");
    /* END DEC-49 REGION is-airuns-context */

    const seen = this.#bundleGate("r.context_id", viewer);
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || AiRuns.AI_RUNS_LIMIT_DEFAULT),
                                     AiRuns.AI_RUNS_LIMIT_MAX));
    /* `lower(r.context_type)` because the WRITE does not fence the word:
       `aiRunOpen` stores `String(contextType)` verbatim, so a run opened as
       `Inquiry` is in the record and a case-sensitive match here would answer
       "nothing is running" over a run that plainly is. Matching case-blind is
       the honest reading of what the record holds; fencing the WRITE is PL-5's
       site and C-22's family, and it is DELEGATED rather than reached into. */
    /* THE PAGE IS IDS, AND IT IS GATED — both halves matter and the second one
       is the security property rather than a detail. The gate is applied HERE,
       before the bound, so `truncated` counts only rows this viewer may see: a
       `truncated: true` computed over rows they may not would announce that
       hidden runs exist, which is op=backlinks' no-count rule broken by a flag
       instead of by a number. */
    const page = this.#rows(
      `SELECT r.run FROM ai_runs r
       WHERE lower(r.context_type) = ? AND r.context_id = ? AND ${seen.sql}
       ORDER BY r.created DESC, r.run LIMIT ?`,
      type, id, ...seen.args, cap + 1);
    /* EACH ROW IS COMPOSED BY `aiRunRead` ITSELF — the list IS the read, run per
       run, and that is the strongest available form of "the same `session`
       shape per row".
       WHY NOT A SHARED PRIVATE COMPOSER, which was written first and REVERTED,
       because the reason is a finding rather than a preference: extracting the
       block out of `aiRunRead` took `op=airun` OFF `meaning-bounds.test.mjs`'s
       (deleted in T20) bare roster — not because the read got better, but
       because its unbounded `ai_run_bounds` scan moved into a PRIVATE method the
       walk could not follow. The ratchet's FLOOR caught it immediately, which is
       exactly what that floor was for, and REC-70's whole subject is a read the
       instrument could not see. Calling the public method kept `op=airun`
       classified exactly as it was; R22's test holds that each row is the read.
       WHAT IT COSTS, stated rather than hidden: one extra keyed lookup per row,
       and the gate compiled once more per row through the SAME `#bundleGate`.
       The bound above is what keeps that finite, and re-asking the gate cannot
       widen the answer — it can only ever agree or withhold, so the redundancy
       fails safe.
       WHAT IT INHERITS: `op=airun`'s `budget` is a collection off an UNBOUNDED
       scan of `ai_run_bounds`. That is a known residual on REC-70's ratchet and
       it is untouched here rather than quietly fixed inside another item's
       method; it is DELEGATED with the measurement. */
    const runs = (await Promise.all(page.slice(0, cap)
      .map((r) => this.read({ run: r.run, viewer }))))
      .filter((a) => a && a.found).map((a) => a.session);

    return {
      ok: true,
      /* The context is echoed NORMALISED, so a caller sees what was actually
         asked rather than what they typed — the same reason op=meaningrows
         publishes the arm it resolved. */
      context: { type, id },
      runs, count: runs.length,
      limit: cap, truncated: page.length > cap,
    };
  }

  /** PL-12: the run's bias block, computed ONCE. Read `aiRunRead`'s header for
   *  what the three answers mean. */
  async #biasForRun(row, viewer) {
    const recordedRaw = row.bias_manifest;
    let recorded = null, unreadable = false;
    if (recordedRaw != null && String(recordedRaw).trim() !== "") {
      try { recorded = JSON.parse(String(recordedRaw)); }
      catch { unreadable = true; }
    }
    /* The CURRENT set for the run's own context. A run over a project reads the
       project scope — instance statements plus that project's — and a run over
       an inquiry reads the instance scope, because an inquiry is shared across
       projects and has no single lens of its own (§3's "a projectless inquiry
       has no CURRENT and no bar", one construct over). The viewer is the run's
       reader, so a lens naming bundles they cannot see is gated identically here
       and in op=biasmanifest — one predicate, not two. */
    const nowManifest = await this.#bias().biasManifest({
      scope: row.context_type === "project" ? "project" : "instance",
      scopeId: row.context_type === "project" ? row.context_id : "",
      viewer,
      /* The bound is irrelevant to the hash — `statements_sha` covers the whole
         set before any bound is applied — so the smallest legal page is asked
         for deliberately: this read needs the FACT, not the statements. */
      limit: 1,
    });
    const recordedSha = recorded && typeof recorded.statements_sha === "string"
      ? recorded.statements_sha : null;
    /* D-85 (INVESTIGATIVE-SESSION.md §11 item 5, rule 3, BOB #25): THE LENS IN FORCE WHEN THE RUN OPENED, which the
       PLANE computed at `aiRunOpen` (`ai_runs.lens_at_open`) beside the manifest the run was HANDED. Before it,
       `moved: true` could not tell *the lens changed after the run opened* from *the run was handed a lens other
       than the one in force* — two different facts, and only the first is bias debt accrued since. Now:
         - `at_open`  the lens in force at the open, as the plane computed it; `{ recorded: false, stated:
                      "not recorded" }` for a run opened before this rule, never a guess back-filled from the hand.
         - `hand`     `in_force` when what the run was handed IS the lens in force at its open (nothing handed and
                      nothing in force counts), `stale` when it is not; null where the open recorded nothing or the
                      hand cannot be read, because then it is undetermined and says so.
         - `moved`    for a recorded open, the lens in force at the open against the lens now — so a STALE hand
                      reads stale and not moved. For a run with no recorded open it keeps its old comparison (the
                      hand against now), and `moved_basis` says which of the two a `moved` is. */
    /* READ THROUGH `safeJson`, and an unreadable record is kept APART from an absent one: a lens recorded at the
       open that cannot be read back is not `not recorded`, and saying so would be the swallowed-read class
       (`provenance-marker.test.mjs`, deleted in T20). It reads `unreadable`, with `hand` and `moved` undetermined. */
    const atOpenHeld = row.lens_at_open != null && String(row.lens_at_open).trim() !== "";
    const atOpenParsed = atOpenHeld ? safeJson(String(row.lens_at_open)) : null;
    const atOpen = atOpenParsed && typeof atOpenParsed === "object" && !Array.isArray(atOpenParsed) ? atOpenParsed : null;
    const atOpenUnreadable = atOpenHeld && !atOpen;
    const shaOf = (m) => (m && m.in_force === true && typeof m.statements_sha === "string" ? m.statements_sha : null);
    const openSha = atOpen ? shaOf(atOpen) : null;
    const nowSha = shaOf(nowManifest);
    const nowBlock = { in_force: nowManifest.in_force === true,
                       statements_sha: nowManifest.statements_sha ?? null,
                       bundles: nowManifest.bundles ?? [] };
    const atOpenBlock = atOpen
      ? { recorded: true, in_force: atOpen.in_force === true, statements_sha: openSha,
          scope: atOpen.scope ?? null, scope_id: atOpen.scope_id ?? null,
          bundles: Array.isArray(atOpen.bundles) ? atOpen.bundles : [], at: atOpen.at ?? null }
      : atOpenUnreadable
        ? { recorded: true, unreadable: true,
            stated: "the lens in force at this run's open was recorded and cannot be read back" }
        : { recorded: false, stated: "not recorded" };
    const handOf = (handedSha) => (!atOpen ? null : handedSha === openSha ? "in_force" : "stale");
    const basis = atOpen ? "at_open" : atOpenUnreadable ? null : "handed";
    if (recorded === null && !unreadable) {
      /* NOTHING WAS HANDED. §3's sentence is kept verbatim where it is TRUE — no manifest was in force at the open
         — and where the open recorded nothing to contradict it; it is NOT said of a run handed nothing while a
         lens was in force, which is the stale hand this rule exists to tell apart. */
      const staleEmpty = !!atOpen && atOpen.in_force === true;
      return { in_force: false,
               stated: staleEmpty
                 ? "no manifest was handed to this run, and one was in force when it opened"
                 : "no manifest was in force",
               manifest: null,
               now: atOpen ? nowBlock : null,
               moved: atOpen ? openSha !== nowSha : null,
               moved_basis: atOpen ? basis : null,
               at_open: atOpenBlock, hand: handOf(null) };
    }
    if (unreadable)
      return { in_force: false,
               stated: "a manifest was recorded for this run and cannot be read back",
               manifest: null,
               now: atOpen ? nowBlock : null,
               moved: atOpen ? openSha !== nowSha : null,
               moved_basis: atOpen ? basis : null,
               at_open: atOpenBlock, hand: null };
    return { in_force: true,
             stated: null,
             /* AS RECORDED — what the run was formed under, never recomputed. */
             manifest: { scope: recorded.scope ?? null, scope_id: recorded.scope_id ?? null,
                         statements_sha: recordedSha,
                         bundles: Array.isArray(recorded.bundles) ? recorded.bundles : [] },
             /* AS THE RECORD STANDS NOW. */
             now: nowBlock,
             /* THE COMPARISON, which is what makes bias debt computable. For a run with no recorded open, `null`
                where one side has no hash to compare — an unknown is stated and never rendered as `false`, which
                would assert the lens had held. */
             moved: atOpen
               ? openSha !== nowSha
               : atOpenUnreadable ? null
               : (recordedSha == null || nowManifest.statements_sha == null
                   ? null : recordedSha !== nowManifest.statements_sha),
             moved_basis: basis,
             at_open: atOpenBlock, hand: handOf(recordedSha) };
  }


  /** op=airunspawn — THE FENCE, AS CODE.
   *
   *  `INVESTIGATIVE-SESSION.md` §14, and the sweep's own correction of v2:
   *  *"The lens rule is STRUCTURAL, and v2 demoting it to a skill requirement
   *  was the defect §14b.4 itself names (SWEEP C7): a skill is instructions; a
   *  fence is code."*
   *
   *    - *"The search half of the run never receives the bias. The spawn
   *      contract for search sub-sessions and search passes omits the manifest
   *      BY CONSTRUCTION — there is no field to read."*
   *    - *"Bias never shapes what is captured or monitored, only how conclusions
   *      are weighed"* (`Content_Framework:1283`) — the coupling is FORBIDDEN,
   *      not discouraged.
   *    - *"The composing half CARRIES the manifest (§3, ruled) for disclosure
   *      and for the weighing it discloses — never as a search input."*
   *
   *  WHY THIS IS AN OP AND NOT A COMMENT. A fence nothing can be pointed at is
   *  not a fence: before this, the search half's payload existed only as a
   *  sentence in a design document, so there was nothing an assertion could read
   *  and nothing a negative control could break. The payload is BUILT here, by
   *  one function, and R23's and R34's test asserts over the object this method
   *  returns — not over a promise about it.
   *
   *  AND THE ASSERTION IS ABSENCE, NEVER EMPTINESS. The search payload is
   *  written as an explicit literal that never touches `row.bias_manifest`, so
   *  there is no field to be filled in later by a default, a spread, or a
   *  well-meaning caller. `bias: null` would have been the weaker fence: a null
   *  field is a field, and a field acquires a value the first time somebody
   *  thinks they are being helpful.
   *
   *  GATED on the run's context, exactly as `aiRunRead` and `aiRunLog` are. */
  async spawnPayload({ run, half = "search", viewer = null } = {}) {
    const seen = this.#bundleGate("r.context_id", viewer);
    const row = this.#one(
      `SELECT r.* FROM ai_runs r WHERE r.run = ? AND ${seen.sql}`, run, ...seen.args);
    if (!row) return { run: run || null, found: false, half: null, payload: null };
    const composing = String(half) === "compose";
    /* BOUNDED IN SQL AND PUBLISHED, and not because a walk asked. `ai_run_bounds`
       carries at most one row per member of `RUN_BOUNDS`, so the bound is real
       and known — but "bounded by a vocabulary" is a fact in a comment, and a
       comment is not a bound: the cap is published (`limit`, `truncated`), and
       R23's test holds it at the bound count. The cap is the vocabulary's OWN size,
       read live rather than typed, so a bound added to `RUN_BOUNDS` tomorrow
       widens this automatically instead of silently cutting the newest one. */
    const budgetCap = Object.keys(RUN_BOUNDS).length;
    const budgetRows = this.#rows(
      `SELECT bound, allowed, consumed, unit FROM ai_run_bounds WHERE run = ? ORDER BY bound LIMIT ?`,
      run, budgetCap + 1);
    const bounds = budgetRows.slice(0, budgetCap);

    /* THE PAYLOAD, and every key in it is named here. It is deliberately NOT
       built by spreading the row and deleting fields: a delete-list is a list
       that falls behind the thing it lists (D-113's lesson in another table),
       and a column added to `ai_runs` tomorrow would ride a spread straight
       through this fence. */
    const payload = {
      run: row.run,
      context: { type: row.context_type, id: row.context_id },
      mode: row.mode,
      skill: row.skill_version,
      /* The launching project's declared standard pair travels to BOTH halves.
         It is a BAR and not a lens (DEC-54 a), and §3 reads it as one of the
         run's conditions — a bar tells the search what strength the work must
         reach, which is not the coupling §14 forbids. This is exactly why the
         two constructs had to be split before this fence could be drawn. */
      standard_pair: row.standard_pair,
      /* REC-74: THE SAME BAR, JUDGED, FROM THE SAME FUNCTION `op=airun` USES.
         `standard_pair` above is the column verbatim and is KEPT — `agent-worker`
         builds against it and removing it is an interface change this item has
         no mandate for — but verbatim is exactly what could not tell the two
         absences apart: a caller receiving `standard_pair: null` cannot say
         whether no bar was in force, whether the run has no project and could
         not have one, or whether this reader simply does not publish the fact.
         Two readers of one row must not disagree about which of its facts
         exist, so both now answer from `#standardForRun` and neither computes
         its own. */
      standard: this.#standardForRun(row),
      budget: bounds.map((b) => ({ bound: b.bound, allowed: b.allowed,
                                   consumed: b.consumed, unit: b.unit })),
    };

    return {
      run, found: true, half: composing ? "compose" : "search",
      payload,
      /* REC-57's two questions, settled on the one collection this answer
         carries: the bound APPLIED, and whether it cut anything. */
      limit: budgetCap, truncated: budgetRows.length > budgetCap,
      /* THE ONLY DIFFERENCE BETWEEN THE TWO HALVES, and it is one key. The
         composing half's block is the SAME block `op=airun` publishes, computed
         by the same function, because "what lens was this run formed under" has
         one answer. The search half gets no such key at all. */
      ...(composing ? { bias: await this.#biasForRun(row, viewer) } : {}),
      /* Stated, because a caller holding the search payload should be able to
         read WHY it is thinner rather than conclude something failed. */
      fence: composing
        ? "the composing half carries the lens, for disclosure and for the weighing it discloses"
        : "the search half never receives the lens: bias never shapes what is captured or searched, "
          + "only how conclusions are weighed. There is no field here to read.",
    };
  }

  /** op=airunlog — THE OBSERVATION LOG. A different read from the one above and
   *  deliberately a different op: the surface renders the run, and this is what
   *  lets anyone else CHECK it (§11 — "search completeness is trained into the
   *  skill, which is COMPETENCE; the log is what lets anyone else CHECK").
   *
   *  It is also what a RESUMED run reads to continue rather than restart
   *  (§14b.7), which is why the entries come back in `seq` order with their
   *  levels and states intact rather than summarised.
   *
   *  Gated on the same column for the same reason as the read above.
   *
   *  ===========================================================
   *  REC-70 — BOUNDED, AND WHY THE RATCHET BUILT TO CATCH THIS DID NOT.
   *  ===========================================================
   *
   *  THE DEFECT: this read was `... FROM ai_run_log WHERE run = ? ORDER BY seq`
   *  with no `LIMIT`, no `limit` and no `truncated` — D-225's class exactly,
   *  arriving in an op IS-6 added AFTER REC-60 measured its roster. A run's log
   *  grows one row per tick and NOTHING caps the tick count: `RUN_BOUNDS` bounds
   *  fetches, sub-sessions and wall time, never observations.
   *
   *  THE PART THAT MATTERS MORE, AND IT IS RECORDED HERE BECAUSE THE NEXT
   *  UNBOUNDED READ WILL LAND BESIDE THIS ONE: `test/meaning-bounds.test.mjs`
   *  (deleted in T20) existed to fail the build when a new read published a
   *  collection off an unbounded row source, and it did not fail — `op=airunlog` appeared in NONE
   *  of its three buckets, so the walk never reached this method at all.
   *
   *  THE CAUSE, NAMED: **the walk graded only return objects containing the
   *  literal `ok: true`, and this method's success answer says `found: true`.**
   *  One success spelling was hard-coded as if it were the only one, four lines
   *  after that same file wrote its bound and completeness keys as SETS
   *  precisely because "the plane answers the second in five spellings on
   *  purpose". The instrument avoided the one-vocabulary mistake in its leaves
   *  and committed it at its root — and it was not one op: **the gate hid 27 of
   *  the 156 dispatched ops**, `op=signerlist`, `op=publishedlist`,
   *  `op=inbox` (M0-12: `inboxlist` is the DO PATH it is aliased to, not an op
   *  name a caller may send), `op=memberlist` and `op=verify` among them, every one of
   *  them a real unbounded collection read. Measured 2026-08-07, REC-70.
   *
   *  SO THE FIX IS NOT `ok: true` HERE. Adding the marker this method does not
   *  use would buy a green walk and leave the blindness in place for the next
   *  op that spells success a third way. The WALK was corrected instead — it now
   *  grades every return that does not DECLARE itself a refusal — and this
   *  method keeps `found: true`, which is what makes the corrected walk's
   *  verdict on it evidence rather than a coincidence.
   *
   *  D-227 APPLIED HERE. That walk graded what a method PUBLISHED, so an
   *  envelope left honest over a scan whose `LIMIT` was removed still read as
   *  bounded, and the suite pinned this op's SQL bound off its source. The pin
   *  went with the suite. R24's test holds the published bound (the page,
   *  `limit` and `truncated` over 205 entries); the SQL `LIMIT` below is what
   *  keeps the read itself bounded, and no test reads it from the source. */
  log({ run, viewer = null, limit = null } = {}) {
    /* REC-70, IN THE BODY AND NOT ONLY IN THE HEADER ABOVE, because the
       instrument that read this file SEGMENTED FROM THE SIGNATURE DOWN — a
       reasoning block written above the method was invisible to the same walk
       this note is about, which is a small instance of the identical mistake.
       THE CAUSE, in one line: this method answers success as `found: true`, and
       `meaning-bounds.test.mjs` (deleted in T20) graded only returns containing
       `ok: true`, so the ratchet built to catch an unbounded collection never
       reached it — one of 27 dispatched ops hidden by that single literal. The
       walk was inverted to grade everything that is not a declared refusal; this
       method kept `found: true` so the fix was proved rather than sidestepped. */
    const seen = this.#bundleGate("r.context_id", viewer);
    const row = this.#one(
      `SELECT r.* FROM ai_runs r WHERE r.run = ? AND ${seen.sql}`, run, ...seen.args);
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || AiRuns.AI_RUN_LOG_LIMIT_DEFAULT),
                                     AiRuns.AI_RUN_LOG_LIMIT_MAX));
    /* The bound the caller GETS, published on the absent answer too: a reader
       that cannot see the run must not have to guess which bound it would have
       been answered at, and REC-30's rule is that the unknown run and the
       unviewable one read identically. */
    if (!row) return { run: run || null, found: false, entries: [], stopped: null,
                       limit: cap, truncated: false };
    /* `cap + 1` asked for, `cap` delivered — `op=exportlog`'s own mechanism, and
       the extra row is the whole difference between "the run made 200
       observations" and "here are its first 200". ASCENDING order is KEPT: this
       is not `op=exportlog`, whose administrator wants the newest export. §14b.7
       replays this log FROM THE START, so the cut must fall at the END. */
    /* REC-93 — THE FOLD, READING THROUGH. `OBSERVATION-LOG-DESIGN.md` §4.4: the
       run's log is now rows of `observations` under this run's authority, read
       through the `(authority_kind, authority, seq)` index — which is why that
       index exists, since without it the fold would turn a primary-key read into
       a table scan and a fold would have become a regression.

       **`seq` IS RE-DERIVED AS THE ORDINAL WITHIN THIS AUTHORITY, AND THAT IS
       WHAT KEEPS I3 UNCHANGED IN SHAPE AND IN VALUE.** §3 makes `seq` STORE-WIDE
       so that two looks at different levels have an order the table holds. §4.4
       says *"the run's own ordering is the `seq` order within its authority"*.
       Those two are only compatible at this read: the stored `seq` is store-wide,
       and every existing consumer of this op was handed 1, 2, 3… per run. A
       store-wide number here would be a SILENT VALUE CHANGE inside an unchanged
       envelope — the worst shape an interface change can take, because no
       consumer's schema check would catch it. The ordinal is the array index
       because the rows are already `ORDER BY seq` ascending and the cut falls at
       the END (§14b.7 replays from the start), so index + 1 is exact rather than
       approximate. R24's test holds it: entries numbered from 1. */
    /* REC-113 / IC-116 — THE COVERAGE CLAIM, PROJECTED AND THEN STATED.
       ADDITIVE: `result_kind` and `result_ref` are APPENDED to the projection
       and `coverage` is composed after them, so every key this op answered
       yesterday keeps its value AND ITS POSITION. That second half is not
       pedantry — `test/rec113-identity.mjs` (since deleted) stripped exactly
       these three keys back off and compared the RAW RESPONSE TEXT to a
       pre-change build's, which is only a comparison if the order survives.
       R24's test now holds the entries' keys in their order.

       WHY THE READ CHANGED AND THE REFUSAL DID NOT. C-22.10 does not fire on
       `authority_kind = 'run'` (D-366), so rows under this very authority may
       assert PRESENT while naming nothing. REC-100 drove what happens if that
       carve-out is deleted today: `op=airunclose` answers `terminated: false,
       code: OBS_PRESENT_NO_REFERENT` and a run that observed anything PRESENT
       CANNOT BE CLOSED AT ALL — a lifecycle deadlock blocked on a design ruling
       about what a ROLLUP's referent is. That ruling is not this item's and the
       carve-out STANDS. [SUPERSEDED 2026-09-18 by REC-100 / IC-130: BOB #14
       ruled the rollup referent and the carve-out is DELETED, so a new bare
       `run` PRESENT is refused at the append and `undetermined` is now what the
       rows written BEFORE that read as.] What this item fixes is that the reader could not even
       SEE the condition: D-366's whole cost is *"a later reader cannot tell that
       row's coverage claim from one backed by a capture"*, and until now the
       read made that true by construction.

       NOTHING IS INFERRED FROM A SIBLING ROW. `observationCoverage` is pure and
       sees one row's own two values — `accepts-when` forbids the alternative by
       name, and a run whose OTHER rows carry referents says nothing whatever
       about this one. That is the agreement-is-not-evidence rule arriving inside
       a single answer. */
    const page = this.#rows(
      `SELECT seq, at, level, subject, state, governed, condition, bound, terminal, detail,
              result_kind, result_ref
       FROM observation_log WHERE ${AiRuns.#ownRows()}
       ORDER BY seq LIMIT ?`, run, run, cap + 1);
    /* REC-100 / IC-130 — A ROLLUP'S `observation` REFERENT IS RE-EXPRESSED IN
       THIS OP'S OWN `seq`, for the reason the note above gives for `seq` itself.
       The column stores the STORE-WIDE seq (§3, and what `op=frontier` publishes
       beside its store-wide `seq`); this op publishes the PER-RUN ordinal, so a
       store-wide number here would point at no entry in the same answer — a
       pointer a reader cannot follow, which is the one thing the rollup ruling
       says the referent must be. EXACT, NOT APPROXIMATE: C-22.10's arm admits an
       `observation` referent only to an EARLIER row of the SAME run, and the page
       is a PREFIX of the run's rows in `seq` order, so the referent is always in
       `ordinal`. The fallback keeps the stored value rather than inventing or
       dropping one, and is unreachable while that check stands. */
    const ordinal = new Map(page.slice(0, cap).map((e, i) => [String(e.seq), i + 1]));
    const entries = page.slice(0, cap)
      .map((e, i) => ({ ...e, seq: i + 1, governed: e.governed === 1, terminal: e.terminal === 1,
                        /* NULL IS NORMALISED TO `null` RATHER THAN LEFT AS `undefined`:
                           a key that serialises away is the absence-with-two-causes this
                           whole item is about, one layer down. */
                        result_kind: e.result_kind ?? null,
                        result_ref: e.result_kind === "observation" && ordinal.has(String(e.result_ref))
                          ? String(ordinal.get(String(e.result_ref)))
                          : (e.result_ref ?? null),
                        coverage: observationCoverage({ state: e.state, resultRef: e.result_ref }) }));
    return { run, found: true, status: row.status, entries,
             limit: cap, truncated: page.length > cap,
             stopped: row.stopped_bound
               ? { bound: row.stopped_bound, condition: row.stopped_condition, at: row.stopped_at }
               : null,
             /* The vocabularies travel WITH the answer rather than being looked
                up by a reader who would then hold a copy of them — the same
                reason op=affordances publishes the act set instead of naming it
                (DEC-8: a surface renders what it received). */
             vocabulary: { states: OBSERVATION_STATES, levels: OBSERVATION_LEVELS,
                           bounds: RUN_BOUNDS, endings: RUN_ENDINGS,
                           /* REC-113 / IC-116, APPENDED for the same reason the four
                              above travel at all (PL-17, DEC-8): a surface that must
                              render `undetermined` should read the word off the answer
                              rather than hold a literal it learned somewhere else and
                              will not re-learn. `coverage_undetermined` is published
                              SEPARATELY because it is deliberately not a member of
                              `coverage` — `op=contentaxis`'s `undetermined_value` is the
                              same shape one construct over. */
                           coverage: OBSERVATION_COVERAGE,
                           coverage_undetermined: OBSERVATION_COVERAGE_UNDETERMINED } };
  }
  /* ---- R28, R29: FOR THE MODULES THAT PRODUCE UNDER A RUN ------------------------------------------------------ */

  /** R28: the run's facts a producer gates on, for a held run the viewer can see; null for a blank id, an absent
   *  run and an invisible one alike. Never throws, writes nothing. Whether the caller holds it is R5 over
   *  `principal_plane`; `principal_claude` is the level that pays, which a production under the run records
   *  (capture-requests' request row). */
  runFor(run, viewer) {
    try {
      const id = run == null ? "" : String(run).trim();
      if (!id) return null;
      const seen = this.#bundleGate("r.context_id", viewer);
      const r = this.#one(`SELECT r.run, r.status, r.mode, r.context_type, r.context_id, r.principal_plane, r.principal_claude,
                                  r.plan FROM ai_runs r WHERE r.run = ? AND ${seen.sql}`, id, ...seen.args);
      return r ? { run: r.run, status: r.status, mode: r.mode, context_type: r.context_type,
                   context_id: r.context_id, principal_plane: r.principal_plane, principal_claude: r.principal_claude,
                   ...(r.mode === "plan" ? { plan: r.plan ?? null } : {}) } : null;
    } catch { return null; }
  }

  /** R29: one bound's `{allowed, consumed}`, or null when the run declared none. */
  boundOf(run, bound) {
    const r = this.#one(`SELECT allowed, consumed FROM ai_run_bounds WHERE run = ? AND bound = ?`,
      String(run ?? ""), String(bound ?? ""));
    return r ? { allowed: Number(r.allowed), consumed: Number(r.consumed) } : null;
  }

  /** R29: add `n` to a bound's consumption, inside the caller's transaction (the row made at allowed 0 when none
   *  was declared). `n` 0 writes nothing; a figure that is not a non-negative safe integer is C-22.13 and nothing
   *  is written. It never ends a run: an exhausted bound ends it at the next tick (R12). */
  consumeBound(run, bound, n) {
    const b = String(bound ?? "");
    /* The figure's rule is R3's, asked of this one pair (an unknown bound C-22.15; `lease`, which nothing spends,
       C-22.14; a figure that is not a non-negative safe integer C-22.13). A good figure is asked as a zero, because the
       plane-counted refusal of `mints` and `surfaces` is not this caller's: here the plane is counting its own work. */
    const figure = typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
    const bad = checkConsume([[b, figure ? 0 : n]], { seed: false });
    if (bad) return bad;
    if (n === 0) return null;
    this.#transact(() => {
      this.sql.exec(
        `INSERT INTO ai_run_bounds (run, bound, allowed, consumed) VALUES (?, ?, 0, ?)
         ON CONFLICT(run, bound) DO UPDATE SET consumed = consumed + ?`, String(run), String(bound), n, n);
    });
    return null;
  }

  /** R37: the run gate `contradiction` offers (its R21), from R28 and R5: `found` false for blank, absent and
   *  invisible alike; `refusal` null or R5's `AI_RUN_NOT_PRINCIPAL` naming `act`. */
  runGate(run, viewer, caller, act = null) {
    const r = this.runFor(run, viewer);
    if (!r) return { found: false, running: false, refusal: null, run: null };
    return { found: true, running: r.status === "running", run: r,
             refusal: runPrincipalGate({ caller, principal: r.principal_plane, ...(act ? { act } : {}) }) };
  }

  /* ---- R48–R52: THE ASSISTANT'S USE AND ITS CEILING (T33-50; Q0-6; K1450, K1481, K1502, K1503) -----------------------
   *
   * Every model call is counted against the member whose account carried it: a run's calls arrive on its ticks (R48),
   * an ask's (which is no run, K1450) through `countAskUsage`, and a standing question's AI half as its author's (R52).
   * The counter keeps a member id, a local day, a mode and numbers, nothing else (R49). The ceiling a member is held
   * to is their own, or the provisional default, and never above the lower one an administrator set for the copy's own
   * load (R50); the open, the tick and an ask are refused when it is reached, in plain words that name no cost. */

  /** A refusal relayed inside the tick's own shape (`ticked: false` leads, so no `ok` rides beside it). */
  static #shed({ ok: _ok, ...rest }) { return rest; }

  /** One refusal of these acts, its row read by key (R35): `run-rules` R20's, or the injected one until it merges. */
  #refuse(code, detail, extra = {}) {
    const row = this.#checkRow(code) || { check: null, translation: null };
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra };
  }

  /** The group's time zone (retrieval R69: local-facts' governing value, else the profiles'), else UTC. */
  #zone() {
    try { const z = retrievalOf(this.ctx).zone(); return typeof z === "string" && z ? z : "UTC"; } catch { return "UTC"; }
  }

  /** R49: the local day, in the group's zone, on which an instant (ms) falls (`civil-time.localDay`); UTC's when the
   *  zone cannot be read. */
  #dayOf(ms) {
    const iso = AiRuns.#aiIso(Number.isFinite(ms) ? ms : Date.now());
    const zone = this.#zone();
    const d = localDay(iso, zone);
    if (typeof d === "string") return { day: d, zone };
    return { day: localDay(iso, "UTC"), zone: "UTC" };
  }

  /** R48 (N588; K1621): a list of conversations' usage, one entry per conversation that reached the provider,
   *  `{mode, model, usage, calls}`: `usage` its summed figures as `agent-model` R5 and R6 state them, `calls` the model
   *  calls that sum covers (its R6), a positive whole number or `null` where the runner states none. Null when well
   *  formed; else run-rules R3's refusal of a malformed consumption (C-22.13), naming the entry. `calls` absent is
   *  malformed, as R48 says. */
  #usageRefusal(list) {
    if (list == null) return null;
    const bad = (detail) => this.#refuse("AI_RUN_CONSUME_INVALID", detail);
    if (!Array.isArray(list))
      return bad("`usage` is a list with one entry per conversation that reached the model since the last tick, each "
        + "{mode, model, usage, calls}.");
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e || typeof e !== "object" || Array.isArray(e))
        return bad(`usage entry ${i + 1} is not an object {mode, model, usage, calls}.`);
      if (typeof e.mode !== "string" || !e.mode.trim() || e.mode.length > 40)
        return bad(`usage entry ${i + 1} names no mode.`);
      if (e.model != null && (typeof e.model !== "string" || e.model.length > 120))
        return bad(`usage entry ${i + 1}'s model is not a model's name.`);
      const u = AiRuns.#figuresRefusal(e.usage);
      if (u) return bad(`usage entry ${i + 1}: ${u}`);
      const c = AiRuns.#callsRefusal(e);
      if (c) return bad(`usage entry ${i + 1}: ${c}`);
    }
    return null;
  }

  /** R48: an entry's `calls`, the model calls its usage covers: present, and a positive safe integer or `null` (the
   *  runner stated none). A sentence saying what is wrong, else null. */
  static #callsRefusal(e) {
    if (!Object.prototype.hasOwnProperty.call(e, "calls"))
      return "it names no 'calls', the model calls its usage covers (null when the runner stated none).";
    const v = e.calls;
    if (v === null || (typeof v === "number" && Number.isSafeInteger(v) && v >= 1)) return null;
    return "its 'calls' is not a whole number of one or more, or null.";
  }

  /** R48: the calls an entry adds to the count: its `calls`, a `null` counting as one, never none, so a ceiling on
   *  calls is never reached later than the calls made. */
  static #callsOf(e) { return e.calls === null || e.calls === undefined ? 1 : e.calls; }

  /** One call's figures: each of `USAGE_FIGURES` present, `null` (not stated) or a figure — a token count a whole
   *  number of zero or more, the cost a finite amount of zero or more. A sentence saying what is wrong, else null. */
  static #figuresRefusal(u) {
    if (!u || typeof u !== "object" || Array.isArray(u)) return "its usage is not an object of the call's figures.";
    for (const f of USAGE_FIGURES) {
      if (!Object.prototype.hasOwnProperty.call(u, f)) return `its usage names no '${f}' (null when the provider did not state it).`;
      const v = u[f];
      if (v === null) continue;
      const ok = f === "total_cost_usd" ? typeof v === "number" && Number.isFinite(v) && v >= 0
        : typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
      if (!ok) return `its '${f}' is not ${f === "total_cost_usd" ? "an amount" : "a whole number"} of zero or more.`;
    }
    /* R72: `estimated_cost_usd` (agent-model R13), where given, is null or an amount of zero or more */
    const est = u.estimated_cost_usd;
    if (est !== undefined && est !== null && !(typeof est === "number" && Number.isFinite(est) && est >= 0))
      return "its 'estimated_cost_usd' is not an amount of zero or more.";
    return null;
  }

  /** R48, R49: add well-formed entries to `member`'s counter for the local day of `ms`, inside the caller's transaction:
   *  each entry's figures to the sums and its calls (R48's `#callsOf`) to the count. A figure not stated adds nothing and
   *  is counted as unstated, never as 0. */
  #count(member, entries, ms) {
    const { day } = this.#dayOf(ms);
    for (const e of entries) {
      const u = e.usage;
      const callCount = AiRuns.#callsOf(e);
      const n = (f) => (u[f] === null ? 0 : u[f]);
      const tokensUnstated = USAGE_TOKEN_FIGURES.some((f) => u[f] === null) ? 1 : 0;
      const costUnstated = u.total_cost_usd === null ? 1 : 0;
      const micro = u.total_cost_usd === null ? 0 : Math.round(u.total_cost_usd * 1e6);
      this.sql.exec(
        `INSERT INTO ai_usage (member, day, mode, calls, input_tokens, output_tokens, cache_read_input_tokens,
           cache_creation_input_tokens, cost_micro_usd, tokens_unstated, cost_unstated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(member, day, mode) DO UPDATE SET calls = calls + excluded.calls, input_tokens = input_tokens + excluded.input_tokens,
           output_tokens = output_tokens + excluded.output_tokens,
           cache_read_input_tokens = cache_read_input_tokens + excluded.cache_read_input_tokens,
           cache_creation_input_tokens = cache_creation_input_tokens + excluded.cache_creation_input_tokens,
           cost_micro_usd = cost_micro_usd + excluded.cost_micro_usd,
           tokens_unstated = tokens_unstated + excluded.tokens_unstated, cost_unstated = cost_unstated + excluded.cost_unstated`,
        member, day, String(e.mode).trim(), callCount, n("input_tokens"), n("output_tokens"), n("cache_read_input_tokens"),
        n("cache_creation_input_tokens"), micro, tokensUnstated, costUnstated);
    }
    return entries.length;
  }

  /** R76: whether `viewer` is an owner of the account a run's `principal_claude` names: the member for `member:<id>`, an
   *  owner of the project for `project:<id>`, an active administrator for `group`. False for anything else. */
  #ownsAccount(principalClaude, viewer) {
    try {
      const who = memberIdOf(viewer);
      const owner = typeof principalClaude === "string" ? principalClaude.trim() : "";
      if (!who || !owner) return false;
      if (owner.startsWith("member:")) return memberIdOf(owner) === who;
      if (owner.startsWith("project:")) return this.#membership().isProjectOwner(owner.slice(8), who) === true;
      if (owner === "group") return this.#membership().isAdministrator(who) === true;
      return false;
    } catch { return false; }
  }

  /** R76: the run's cost as its paying account's owners read it: the actual at its ending, else the sums so far; null for
   *  anyone else, who is answered no cost at all. */
  #costFor(row, viewer) {
    if (!this.#ownsAccount(row.principal_claude, viewer)) return null;
    const actual = safeJson(row.actual);
    if (actual) return { final: true, ...actual };
    const now = this.#actualFromUse(row.run);
    return now ? { final: false, ...now } : null;
  }

  /** The `ai-use` module (T41; R52, R76), reached in-process until its merge re-points it to its factory. */
  #aiUse() { return this.#deps.aiUse || null; }

  /** R76 (K2482): the run's actual cost from the one store of the figures, `ai-use.actualOf({act: <run>})` (its R11), read
   *  internally; null when ai-use is not reachable or answers none. Never throws. */
  #actualFromUse(run) {
    try {
      const u = this.#aiUse();
      const a = u && typeof u.actualOf === "function" ? u.actualOf({ act: String(run), viewer: AiRuns.#INTERNAL_VIEWER }) : null;
      if (!a || a.ok === false || typeof a.code === "string") return null;
      const { ok: _ok, ...rest } = a;
      return rest;
    } catch { return null; }
  }

  /** R50: a member's use on one local day, over every mode: `tokens` every token processed, `calls` the calls. */
  #usedOn(member, day) {
    const r = this.#one(`SELECT COALESCE(SUM(input_tokens + output_tokens + cache_read_input_tokens + cache_creation_input_tokens), 0) t,
                                COALESCE(SUM(calls), 0) c FROM ai_usage WHERE member = ? AND day = ?`, member, day);
    return { tokens: Number(r.t), calls: Number(r.c) };
  }

  /** R50: the ceilings that hold for `member`: their own (or the default, figure by figure), the copy's, and the
   *  lower of the two per figure. */
  #ceilingFor(member) {
    const own = this.#one(`SELECT tokens, calls, set_at FROM ai_ceilings WHERE holder = ?`, `member:${member}`);
    const copy = this.#one(`SELECT tokens, calls, set_at FROM ai_ceilings WHERE holder = 'copy'`);
    const fig = (r, f) => (r && r[f] != null ? Number(r[f]) : null);
    const mine = { tokens: fig(own, "tokens") ?? AI_CEILING_DEFAULT.tokens, calls: fig(own, "calls") ?? AI_CEILING_DEFAULT.calls,
                   basis: { tokens: fig(own, "tokens") != null ? "own" : "default", calls: fig(own, "calls") != null ? "own" : "default" } };
    const copyC = copy ? { tokens: fig(copy, "tokens"), calls: fig(copy, "calls") } : null;
    const low = (f) => (copyC && copyC[f] != null ? Math.min(mine[f], copyC[f]) : mine[f]);
    return { own: mine, copy: copyC, in_force: { tokens: low("tokens"), calls: low("calls") } };
  }

  /** R50: null while `member`'s use today is under the ceiling in force; else the plain refusal — their own ceiling's
   *  first, then the copy's. Names no cost. */
  #ceilingRefusal(member, ms) {
    const { day } = this.#dayOf(ms);
    const used = this.#usedOn(member, day);
    const c = this.#ceilingFor(member);
    const over = (lim) => lim && ((lim.tokens != null && used.tokens >= lim.tokens) || (lim.calls != null && used.calls >= lim.calls));
    /* DEC-49 REGION is-ai-use-ceiling */
    if (over(c.own))
      return this.#refuse("AI_USE_CEILING_REACHED", `Your assistant has reached today's limit, which you set (or the `
        + `starting limit, if you have not set one). It is available again tomorrow. Nothing was started.`, { day });
    if (over(c.copy))
      return this.#refuse("AI_USE_COPY_CEILING_REACHED", `Your assistant has reached today's limit for this group, which `
        + `an administrator set for the group's own load. It is available again tomorrow. Nothing was started.`, { day });
    /* END DEC-49 REGION is-ai-use-ceiling */
    return null;
  }

  /** R52 (K1755): which account serves `member`'s act now, read without unsealing, for the synchronous checks (an ask's
   *  ceiling check, the wake's decision): `member` when they hold a reference of their own (credentials R23's state, asked
   *  as that member) or are connected through their subscription (its R43; T38, K2299), else `group` when the group's API key is on and they are an active member (credentials R34's
   *  state, asked as that member: it answers `{on}` to an active member alone), else null. R35's choice, as its own
   *  order makes it. */
  #accountServing(member) {
    const c = credentialsOf(this.ctx), as = `member:${member}`;
    try {
      const s = c.accountReferenceState({ member: as, viewer: as });
      if (s && s.ok === true && s.held === true) return "member";
      /* (T38; K2299) else their own sign-in, when connected through their subscription (credentials R43, R35) */
      if (s && s.ok === true && s.subscription && s.subscription.connected === true) return "member";
    } catch { /* read as none of their own */ }
    try {
      const g = c.groupKeyState({ viewer: as });
      return g && g.ok === true && g.on === true ? "group" : null;
    } catch { return null; }
  }

  /** R52 (K1503, K1755): the account `credentials.accountFor` (its R35) answers for `member`'s act of `kind` (`run`):
   *  `{level, kind, key}` when one serves it (`key` null for the member's own sign-in, T38; K2299); else `{refusal}`: `NO_ACCOUNT` read as this module's `AI_NO_ACCOUNT`, any
   *  other refusal of that service (the group key's notice not yet read, a member not active, the seal) relayed as it
   *  came. The caller keeps the key for the one call it serves, or not at all. */
  async #accountFor(member, kind, project = null) {
    let a = null;
    try {
      a = await credentialsOf(this.ctx).accountFor({ member: `member:${member}`,
        act: { kind, member: `member:${member}`, ...(project ? { project } : {}) } });
    } catch { a = null; }
    /* R52 (T41): the owner that pays, as ai-use R1 spells it */
    const owner = (lvl, proj) => (lvl === "group" ? "group" : lvl === "project" ? `project:${proj}` : `member:${member}`);
    if (a && a.ok === true && typeof a.key === "string" && (a.level === "member" || a.level === "group" || a.level === "project"))
      return { level: a.level, kind: a.kind, key: a.key, owner: owner(a.level, a.project) };
    /* (T38; K2299) the member's own sign-in (credentials R35, R43): level member, no key; agent-worker R6 carries it
       with no `secret` key at all. (T41; credentials R54, R56) A project's sign-in, its sole owner's, likewise. */
    if (a && a.ok === true && a.kind === "signin" && (a.level === "member" || a.level === "project"))
      return { level: a.level, kind: "signin", key: null, owner: owner(a.level, a.project) };
    if (!a || a.code === "NO_ACCOUNT" || typeof a.code !== "string") return { refusal: this.#noAccount(member, "A run") };
    const { ok: _ok, ...rest } = a;
    return { refusal: { ok: false, ...rest } };
  }

  #noAccount(member, what) {
    /* DEC-49 REGION is-ai-no-account */
    return this.#refuse("AI_NO_ACCOUNT", member
      ? `${what} needs a Claude account to serve the member whose act started it, and none serves that member: they have `
        + `connected none of their own, and the group's key is not set or not on. Nothing was started.`
      : `${what} names no member whose Claude account carries it. Nothing was started.`);
    /* END DEC-49 REGION is-ai-no-account */
  }

  /** R52 (K1503): the member whose account a run carries — a member's session (`actor`), else the member a member-kind
   *  credential acts for (`principal_plane`), else, for a machine credential, the member the opener names
   *  (`principalClaude`, `member:<id>`). Null when there is none. */
  static #accountMember({ actor, principalPlane, principalClaude }) {
    return memberIdOf(actor) || memberIdOf(principalPlane)
      || (typeof principalClaude === "string" && principalClaude.trim().startsWith("member:") ? memberIdOf(principalClaude) : null);
  }

  /** R52: the member a stored run is carried by: its `principal_claude` when that is `member:<id>`; null for a run
   *  opened before T33-50, which recorded a level word there. */
  static #payerOf(principalClaude) {
    return typeof principalClaude === "string" && principalClaude.startsWith("member:") ? memberIdOf(principalClaude) : null;
  }

  /** R52 (T41): the member whose act a stored run is: its `principal_claude_ref` (`member:<id>`), else, for a run opened
   *  before T41, its `principal_claude` when that names a member. */
  static #memberOfRun(row) {
    const ref = row && typeof row.principal_claude_ref === "string" && row.principal_claude_ref.startsWith("member:")
      ? memberIdOf(row.principal_claude_ref) : null;
    return ref || AiRuns.#payerOf(row && row.principal_claude);
  }

  /** R48: count an ask's conversation (an ask is no run, K1450), or a standing question's AI half (R52, its author's),
   *  for `member`, by `answers` (and the control plane's `askusage`). `usage` is the conversation's summed figures,
   *  `calls` the model calls they cover, read as in a tick's entry (a `null` counts one); `mode` the conversation's mode.
   *  An omitted `calls` reads as `null` (ai-runs #11 J1 (1): a caller that predates N588 states none). Writes the counter
   *  only, to `member`'s day, whichever account served the ask (K1755).
   *  (T35; N686) A draft (`run-rules` R21, also no run) is counted the same way with `mode` `draft`, to the member who
   *  asked for it, under its own mode, so R51's reads answer drafts apart. Neither is a run, so a `mode` other than `ask`
   *  or `draft` is refused as a malformed entry (C-22.13), counting nothing. */
  static ASK_USAGE_MODES = Object.freeze([ASK_MODE.mode, DRAFT_MODE.mode]);
  countAskUsage({ member = null, mode = null, usage = null, calls = null, at = null } = {}) {
    const id = memberIdOf(member);
    if (!id) return this.#noAccount(null, "Counting an ask's use");
    const entry = { mode, model: null, usage, calls };
    const bad = this.#usageRefusal([entry]);
    if (bad) return bad;
    if (!AiRuns.ASK_USAGE_MODES.includes(String(mode).trim()))
      return this.#refuse("AI_RUN_CONSUME_INVALID", `the mode '${String(mode).slice(0, 40)}' is not one an ask's use is `
        + `counted under: an ask counts as 'ask' and a draft as 'draft'; a run's use arrives on its own ticks.`);
    const ms = at ? Date.parse(at) : Date.now();
    this.#transact(() => this.#count(id, [entry], ms));
    return { ok: true, counted: 1, calls: AiRuns.#callsOf(entry), day: this.#dayOf(ms).day };
  }

  /** R50: a provider's refusal for a spent limit (a 429 `enforced_spend_limit_reached` on the member's own account),
   *  answered the plain way the ceiling is, never as an error: the refusal, or null when `said` (a relayed reason, type
   *  or message) is not that. For `answers` and `agent-worker` to relay, and the wake's own dispatch. */
  providerLimit(said = null) {
    return PROVIDER_LIMIT.test(String(said ?? "")) ? this.#providerLimit() : null;
  }
  #providerLimit() {
    return this.#refuse("AI_USE_CEILING_REACHED", "Your own Claude account has reached the spending limit set on it, so "
      + "the assistant cannot continue for now. Nothing was lost.", { provider_limit: true });
  }

  /** R50, R52: before an ask's (or a standing question's) first model call, `answers` asks this: null when an account
   *  serves `member` (their own, or the group's key, K1755) and they are under the ceiling in force for them today, the
   *  copy's included; else the refusal, in plain words. Writes nothing. (T35; N686) A draft is held back the same way,
   *  before its first model call, as the act of the member who asked for it (`mode: "draft"` names it in the words). */
  aiUseCheck({ member = null, at = null, mode = null } = {}) {
    const id = memberIdOf(member);
    if (!id || !this.#accountServing(id)) return this.#noAccount(id, String(mode ?? "").trim() === DRAFT_MODE.mode ? "A draft" : "An ask");
    return this.#ceilingRefusal(id, at ? Date.parse(at) : Date.now());
  }

  /** A ceiling's figures as given: each absent (left as held), `null` (cleared) or a whole number of one or more. */
  #ceilingFigures(tokens, calls) {
    for (const [f, v] of [["tokens", tokens], ["calls", calls]])
      if (v !== undefined && v !== null && !(typeof v === "number" && Number.isSafeInteger(v) && v >= 1))
        /* DEC-49 REGION is-ai-ceiling-figure */
        return this.#refuse("AI_CEILING_INVALID", `A daily limit's '${f}' is a whole number of one or more, or null to `
          + `clear it. Nothing was changed.`, { figure: f });
        /* END DEC-49 REGION is-ai-ceiling-figure */
    return null;
  }

  #setCeiling(holder, tokens, calls, by, at) {
    const held = this.#one(`SELECT tokens, calls FROM ai_ceilings WHERE holder = ?`, holder);
    const next = { tokens: tokens === undefined ? (held ? held.tokens : null) : tokens,
                   calls: calls === undefined ? (held ? held.calls : null) : calls };
    const now = AiRuns.#aiIso(at ? Date.parse(at) : Date.now());
    this.#transact(() => {
      if (next.tokens == null && next.calls == null) this.sql.exec(`DELETE FROM ai_ceilings WHERE holder = ?`, holder);
      else this.sql.exec(`INSERT INTO ai_ceilings (holder, tokens, calls, set_by, set_at) VALUES (?, ?, ?, ?, ?)
                          ON CONFLICT(holder) DO UPDATE SET tokens = excluded.tokens, calls = excluded.calls,
                            set_by = excluded.set_by, set_at = excluded.set_at`, holder, next.tokens, next.calls, by, now);
    });
    return { tokens: next.tokens, calls: next.calls, set_at: now };
  }

  /** R50 (K1502): a member's own daily ceiling, set by that member's own act only (`by` the control plane's stamp). */
  aiCeilingSet({ member = null, tokens = undefined, calls = undefined, by = null, at = null } = {}) {
    const id = memberIdOf(member);
    /* DEC-49 REGION is-ai-ceiling-own */
    if (!id || memberIdOf(by) !== id)
      return this.#refuse("NOT_YOUR_CEILING", "A member's daily limit for the assistant is set only by that member. "
        + "Nothing was changed.");
    /* END DEC-49 REGION is-ai-ceiling-own */
    const bad = this.#ceilingFigures(tokens, calls);
    if (bad) return bad;
    const set = this.#setCeiling(`member:${id}`, tokens, calls, `member:${id}`, at);
    const c = this.#ceilingFor(id);
    return { ok: true, member: id, own: { tokens: set.tokens, calls: set.calls }, in_force: c.in_force,
             default: { ...AI_CEILING_DEFAULT }, set_at: set.set_at };
  }

  /** R50 (K1502): the copy's ceiling, a lower daily limit for every member for the copy's own load, set by an
   *  administrator only (`membership` R64, refused through `notAnAdmin`). */
  aiCopyCeilingSet({ tokens = undefined, calls = undefined, by = null, at = null } = {}) {
    const admin = memberIdOf(by);
    if (!admin || !this.#membership().isAdministrator(admin)) return notAnAdmin(by, "setting the group's daily limit for the assistant");
    const bad = this.#ceilingFigures(tokens, calls);
    if (bad) return bad;
    const set = this.#setCeiling("copy", tokens, calls, `member:${admin}`, at);
    return { ok: true, copy: { tokens: set.tokens, calls: set.calls }, default: { ...AI_CEILING_DEFAULT }, set_at: set.set_at };
  }

  /** R51: an administrator's month of use, per mode, summed over every member and naming none (`op=aiusage`). `month`
   *  is `YYYY-MM`, this month in the group's zone by default; a month nothing was counted in answers zeros. */
  aiUsage({ viewer = null, month = null, at = null } = {}) {
    const admin = memberIdOf(viewer);
    if (!admin || !this.#membership().isAdministrator(admin)) return notAnAdmin(viewer, "reading the group's use of the assistant");
    const m = typeof month === "string" && /^\d{4}-\d{2}$/.test(month.trim()) ? month.trim()
      : this.#dayOf(at ? Date.parse(at) : Date.now()).day.slice(0, 7);
    const rows = this.#rows(
      `SELECT mode, SUM(calls) calls, SUM(input_tokens) input_tokens, SUM(output_tokens) output_tokens,
              SUM(cache_read_input_tokens) cache_read_input_tokens, SUM(cache_creation_input_tokens) cache_creation_input_tokens,
              SUM(cost_micro_usd) cost_micro_usd, SUM(tokens_unstated) tokens_unstated, SUM(cost_unstated) cost_unstated
         FROM ai_usage WHERE substr(day, 1, 7) = ? GROUP BY mode ORDER BY mode`, m);
    return { ok: true, month: m, zone: this.#zone(),
             modes: rows.map((r) => ({ mode: r.mode, calls: Number(r.calls), input_tokens: Number(r.input_tokens),
               output_tokens: Number(r.output_tokens), cache_read_input_tokens: Number(r.cache_read_input_tokens),
               cache_creation_input_tokens: Number(r.cache_creation_input_tokens), total_cost_usd: Number(r.cost_micro_usd) / 1e6,
               tokens_unstated: Number(r.tokens_unstated), cost_unstated: Number(r.cost_unstated) })) };
  }

  /** R51: a member's own use on a local day (today by default) against the ceiling in force, and never a cost. */
  aiUsageMine({ viewer = null, day = null, at = null } = {}) {
    const id = memberIdOf(viewer);
    if (!id) return this.#refuse("NOT_YOUR_CEILING", "A member's use of the assistant is read only by that member. Nothing was read.");
    const today = this.#dayOf(at ? Date.parse(at) : Date.now());
    const d = typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day.trim()) ? day.trim() : today.day;
    const used = this.#usedOn(id, d);
    const c = this.#ceilingFor(id);
    const reached = (lim) => (lim.tokens != null && used.tokens >= lim.tokens) || (lim.calls != null && used.calls >= lim.calls);
    return { ok: true, member: id, day: d, zone: today.zone, used, ceiling: c.in_force,
             own: { tokens: c.own.tokens, calls: c.own.calls, basis: c.own.basis }, copy: c.copy,
             reached: reached(c.own) ? "own" : c.copy && reached(c.copy) ? "copy" : null };
  }

  /* ---- K1606 (run-rules R19; VF-4): THE ACT THAT RECORDS A MODE'S FIRST LIVE RUN VERIFIED, written here, where runs
     are, and read back by the open's deployability (R40). ------------------------------------------------------------ */

  /** Every well-formed `verification_recorded` this record holds, oldest first, in run-rules' shape. */
  verifications() {
    try {
      return this.#rows(`SELECT mode, run, verified_by, at, evidence FROM ai_mode_verifications ORDER BY at, mode, run`)
        .map((r) => ({ mode: r.mode, run: r.run, verified_by: r.verified_by, at: r.at, evidence: safeJson(r.evidence) }));
    } catch { return []; }
  }

  /** run-rules R19: record that `mode`'s first live run, `run`, was verified, by the member `by` (the control plane's
   *  stamp), with `evidence`. Refused by `checkVerification` (C-22.20, a RELAY) as it judges it; a run this record
   *  does not hold in that mode, for this member's sight, is refused the same way, naming `run`. Append-only: a mode and
   *  run already recorded answer `existed: true`. The answer carries whether the next mode is now deployable. */
  verificationRecord({ mode = null, run = null, evidence = null, by = null, at = null } = {}) {
    const now = AiRuns.#aiIso(at ? Date.parse(at) : Date.now());
    const who = memberIdOf(by);
    const v = { mode, run, verified_by: who ? `member:${who}` : (by ?? null), at: now, evidence };
    const bad = checkVerification(v);
    if (bad) return bad;
    const held = this.runFor(run, by);
    if (!held || held.mode !== mode) {
      const row = this.#checkRow("AI_RUN_VERIFICATION_UNFIT");
      return { ok: false, code: "AI_RUN_VERIFICATION_UNFIT", check: row.check, translation: row.translation, field: "run",
               detail: `no run '${String(run).slice(0, 60)}' in mode '${String(mode).slice(0, 40)}' is held here for this member. Nothing was recorded` };
    }
    const prior = this.#one(`SELECT at FROM ai_mode_verifications WHERE mode = ? AND run = ?`, mode, run);
    const existed = !!prior;
    if (!existed)
      this.#transact(() => this.sql.exec(`INSERT INTO ai_mode_verifications (mode, run, verified_by, at, evidence) VALUES (?, ?, ?, ?, ?)`,
        mode, run, v.verified_by, now, JSON.stringify(evidence)));
    const order = RUN_MODES;
    const next = order[order.indexOf(mode) + 1] ?? null;
    return { ok: true, mode, run, verified_by: v.verified_by, at: existed ? prior.at : now, existed,
             next: next ? { mode: next, deployable: deployable(next, this.verifications()) } : null };
  }

  /* ---- R75 (T41; D14, D11): THE TEST BAR, written here, where runs are, and read by run-rules R19's deploy gate ---- */

  /** R75: record an AI part's result on a test set, written by the harness (an in-plane call, reached by no route): Civicsmith's
   *  frozen set, or a group's own (`set: "group"`). Its shape is judged by `run-rules`' `checkTestBarRecord` (AI_TEST_BAR_UNFIT,
   *  C-22.22; B3, K2485), a RELAY; refused whole where that judge is not reachable (fail closed). Figures only: no transcript is
   *  taken or kept (D15). Append-only. */
  testBarRecord({ part = null, set = null, set_version = null, false_alarm_rate = null, passed = null, graded_by = null,
                  at = null } = {}) {
    const now = AiRuns.#aiIso(at ? Date.parse(at) : Date.now());
    const record = { part, set, set_version, false_alarm_rate, passed, graded_by, at: now };
    /* `deps.checkTestBarRecord` stands in for run-rules' judge in a module test alone, until run-rules (T41-21) merges */
    const judge = this.#deps.checkTestBarRecord || RUN_RULES.checkTestBarRecord;
    const bad = typeof judge === "function" ? judge(record)
      : this.#refuse("AI_TEST_BAR_UNFIT", "the test bar's judge (run-rules' checkTestBarRecord) is not reachable. Nothing was recorded");
    if (bad) return bad;
    this.#transact(() => this.sql.exec(
      `INSERT INTO ai_test_bar (part, set_name, set_version, false_alarm_rate, passed, graded_by, at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      String(part), String(set), String(set_version), Number(false_alarm_rate), passed === true ? 1 : 0, String(graded_by), now));
    return { ok: true, part: String(part), set: String(set), set_version: String(set_version),
             false_alarm_rate: Number(false_alarm_rate), passed: passed === true, at: now };
  }

  /** R75: every result recorded on Civicsmith's own test investigations (never a group's set, which opens or closes no
   *  gate), oldest first, in run-rules R19's shape, for its `deployable`. Writes nothing; never throws. */
  testBarRecords() {
    try {
      return this.#rows(`SELECT part, set_name, set_version, false_alarm_rate, passed, graded_by, at FROM ai_test_bar
                          WHERE set_name <> 'group' ORDER BY seq`)
        .map((r) => ({ part: r.part, set: r.set_name, set_version: r.set_version, false_alarm_rate: Number(r.false_alarm_rate),
                       passed: r.passed === 1, graded_by: r.graded_by, at: r.at }));
    } catch { return []; }
  }

  /** R75: a member adds one of the group's own test investigations for a part: a matter and the answers the group's people
   *  wrote. `by` is the control plane's stamp, an active member. A blank part, matter or answers, or a caller who is not an
   *  active member, is AI_GROUP_TEST_INVALID (a row of run-rules' table, B4), nothing written. A matter already held for the
   *  part is replaced by its newer answers. */
  groupTestSet({ part = null, matter = null, answers = null, by = null, at = null } = {}) {
    const who = memberIdOf(by);
    const text = (v, max) => (typeof v === "string" && v.trim() !== "" && v.length <= max ? v.trim() : null);
    const p = text(part, 60), m = text(matter, 200);
    const a = typeof answers === "string" ? text(answers, 20000)
      : answers && typeof answers === "object" ? (JSON.stringify(answers).length <= 20000 ? JSON.stringify(answers) : null) : null;
    let active = false;
    try { const f = who ? this.#membership().memberFacts(who) : null; active = !!f && f.status === "active"; } catch { active = false; }
    /* DEC-49 REGION is-ai-group-test */
    if (!p || !m || !a || !active)
      return this.#refuse("AI_GROUP_TEST_INVALID", !active ? "a group's test investigation is added by one of its active members. "
        + "Nothing was added." : `a group's test investigation names its part, its matter and the answers your members wrote `
        + `(missing: ${[!p && "part", !m && "matter", !a && "answers"].filter(Boolean).join(", ")}). Nothing was added.`);
    /* END DEC-49 REGION is-ai-group-test */
    const now = AiRuns.#aiIso(at ? Date.parse(at) : Date.now());
    this.#transact(() => this.sql.exec(
      `INSERT INTO ai_group_tests (part, matter, answers, by, at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(part, matter) DO UPDATE SET answers = excluded.answers, by = excluded.by, at = excluded.at`,
      p, m, a, `member:${who}`, now));
    return { ok: true, part: p, matter: m, at: now };
  }

  /** R75: a part's results on the group's own test investigations, with each false-alarm rate, to the group's active
   *  members; anyone else is answered none (withheld, never counted). Never a deploy gate's input. Writes nothing. */
  groupTestResults({ part = null, viewer = null } = {}) {
    const who = memberIdOf(viewer);
    const p = typeof part === "string" ? part.trim() : "";
    let active = false;
    try { const f = who ? this.#membership().memberFacts(who) : null; active = !!f && f.status === "active"; } catch { active = false; }
    if (!active || !p) return { ok: true, part: p || null, matters: 0, results: [] };
    const matters = this.#one(`SELECT count(*) c FROM ai_group_tests WHERE part = ?`, p).c;
    const results = this.#rows(`SELECT set_version, false_alarm_rate, passed, at FROM ai_test_bar
                                 WHERE set_name = 'group' AND part = ? ORDER BY seq`, p)
      .map((r) => ({ set_version: r.set_version, false_alarm_rate: Number(r.false_alarm_rate), passed: r.passed === 1, at: r.at }));
    return { ok: true, part: p, matters: Number(matters), results };
  }

  /* ---- R25, R26: THE SURFACING STEP, registered with promotion (K31) --------------------------------------------- */

  /** Whether this promotion is an assistant's creation of a question: a creation of an inquiry carrying the control
   *  plane's `assistantPrincipal` stamp, which `control-plane` sets for an `ai` credential only, deleting any caller's copy
   *  first. A member's creation, and every store-internal one, carries no stamp and is not asked. */
  static #surfacing(c) {
    const pkg = (c && c.pkg) || {};
    return !!c && !c.head && c.promotedType === "inquiry"
      && typeof pkg.assistantPrincipal === "string" && pkg.assistantPrincipal.trim() !== "";
  }

  /** D-85 (INVESTIGATIVE-SESSION.md §11 item 5, rule 2, BOB #25) — MAY THIS ASSISTANT OPEN A QUESTION, AND
   *  INSIDE WHICH RUN? Null when the creation may land, else the refusal (R25).
   *
   *  REC-165's ORDER, the tick's (REC-152): SIGHT first — a run whose context the caller cannot see answers the
   *  SAME SURFACE_NO_RUN a run never minted gets, and so does a creation naming no run, since both say the same
   *  thing to the caller: there is no run of yours here; then POSITION — `runPrincipalGate`, the member who
   *  opened the run or a credential she minted, relayed FIELD BY FIELD (a spread would hide the verdict from the
   *  DEC-49 guard); then STATUS; then the BOUND, on `mints`' rule — a run that declares no `surfaces` bound may
   *  surface nothing, because a default allowance chosen here would be a measurement with no measurement behind
   *  it. The bound is asked here AND consumed inside the promotion's transaction (R26), so a refused creation spends
   *  none. The caller is the STAMP, never a field the body carries; the run is the body's word, which is why every
   *  question above is asked of it. */
  #surfacingGate(pkg) {
    const caller = String(pkg.assistantPrincipal ?? "").trim();
    const run = String(pkg.run ?? "").trim();
    const refusal = (code, detail, extra) => {
      const row = this.#checkRow(code);
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               run: run || null, ...(extra || {}) };
    };
    const runRow = this.runFor(run, pkg.actorViewer ?? null);
    /* DEC-49 REGION is-surface-run */
    if (!runRow)
      return refusal("SURFACE_NO_RUN",
        run ? `no run named '${run.slice(0, 60)}' is open here. An assistant opens a question only inside a run `
              + `it holds (INVESTIGATIVE-SESSION.md §11 item 5, rule 2): the run carries the lens in force and `
              + `the objective the question was surfaced under. Nothing was created.`
            : "an assistant opens a question only inside a run it holds: pass run=<the run this question is "
              + "surfaced under> in the promotion. The run carries the lens in force and the objective it "
              + "pursued (INVESTIGATIVE-SESSION.md §11 item 5, rule 2). Nothing was created.");
    const notPrincipal = runPrincipalGate({ caller, principal: runRow.principal_plane,
                                            act: "opening a question under a run" });
    if (notPrincipal)
      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,
               translation: notPrincipal.translation, detail: notPrincipal.detail, run,
               note: "an assistant opens a question only inside a run it holds. Nothing was created" };
    if (runRow.status !== "running")
      return refusal("SURFACE_RUN_NOT_RUNNING",
        `the run '${run.slice(0, 60)}' has ended (${String(runRow.status).slice(0, 40)}), and a question is read `
        + `against the conditions of the run that surfaced it, which stopped being current when it stopped. `
        + `Nothing was created.`, { status: runRow.status });
    const bound = this.boundOf(run, "surfaces");
    if (!bound || !(bound.allowed > 0))
      return refusal("SURFACE_NO_BOUND",
        `the run '${run.slice(0, 60)}' declares no 'surfaces' bound, so the questions it may open would be `
        + `unbounded. The bound is declared at op=airunopen, by the member who opens the run. Nothing was created.`);
    if (bound.consumed >= bound.allowed)
      return refusal("SURFACE_BOUND_REACHED",
        `the run '${run.slice(0, 60)}' has reached its 'surfaces' bound (${bound.consumed} of `
        + `${bound.allowed}). Nothing was created; the next tick ends the run, and the log says which `
        + `bound stopped it.`, { allowed: bound.allowed, consumed: bound.consumed });
    /* END DEC-49 REGION is-surface-run */
    return null;
  }

  /** R25: the step's check, before the promotion writes anything. */
  #surfacingCheck(c) {
    if (!AiRuns.#surfacing(c)) return null;
    return this.#surfacingGate(c.pkg);
  }

  /** R26: THE LINK AND THE BOUND, in the creation's own transaction, so a question an assistant opened cannot exist
   *  without the row naming its run, and a refused creation spends nothing. An INSTANCE row keyed by the new inquiry
   *  and never a line in its bytes (the run is scratch). The answer's `surfaced_in` names the run, the instant and the
   *  bound after this spend. */
  #surfacingProject(c) {
    if (!AiRuns.#surfacing(c)) return null;
    const run = String(c.pkg.run).trim(), principal = c.pkg.assistantPrincipal.trim();
    const at = new Date().toISOString();
    this.#transact(() => {
      this.sql.exec(`INSERT INTO inquiry_run_surfacings (bundle_id, run, principal, at) VALUES (?,?,?,?)`,
        c.bundleId, run, principal, at);
      this.consumeBound(run, "surfaces", 1);
    });
    const left = this.boundOf(run, "surfaces");
    return { surfaced_in: { run, at, bound: { bound: "surfaces", allowed: left.allowed, consumed: left.consumed } } };
  }

  /* ---- R36: HIDDEN RUNS — `hiddenRuns` (R42, module level) is what retrieval holds; observation-log's resolver is
     `runFor` (R28), the same sight. ------------------------------------------------------------------------------ */

  /** R27 (K674): inquiry's `migratedSurfacing` (its R49) for a question with no surfacing row here: the migration
   *  replay's record of it, or null. Reached lazily through inquiry's factory; null when it answers nothing. */
  #migratedSurfacing(bundleId) {
    try {
      const k = this.#deps.inquiry || inquiryOf(this.ctx);
      const m = k && typeof k.migratedSurfacing === "function" ? k.migratedSurfacing(bundleId) : null;
      return m && typeof m === "object" ? m : null;
    } catch { return null; }
  }

  /** R27: which run a question was opened inside, and under what lens. The run's facts are `read`'s answer, taken
   *  whole under the same viewer. The migration-replay arm is inquiry's (map §5.8): a question with no surfacing
   *  row answers `not recorded` here. */
  async surfacedIn(bundleId, viewer) {
    const link = this.#one(`SELECT run, principal, at FROM inquiry_run_surfacings WHERE bundle_id=?`, bundleId);
    if (!link) return this.#migratedSurfacing(bundleId) ?? { recorded: false, stated: "not recorded", run: null, lens: null };
    const read = await this.read({ run: link.run, viewer });
    if (!read || read.found !== true || !read.session)
      return { recorded: true, run: null, by: null, at: link.at, lens: null,
               stated: "this question was opened inside a run this reader cannot read" };
    return { recorded: true, run: link.run, by: link.principal, at: link.at,
             context: read.session.context, status: read.session.status, lens: read.session.bias };
  }

  /** The tables and their two additive columns (R38), and D-85's `ai_run_log` fold: the pre-fold run log's rows are
   *  copied into the observation log under `authority_kind = run` and the old table dropped, once. Idempotent;
   *  called by the store's migration after observation-log's. */
  migrate() {
    const bare = AI_RUNS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) if (st.trim()) this.sql.exec(st);
    const cols = new Set(this.#rows(`PRAGMA table_info(ai_runs)`).map((c) => c.name));
    for (const col of AI_RUNS_ADDED_COLUMNS)
      if (!cols.has(col)) this.sql.exec(`ALTER TABLE ai_runs ADD COLUMN ${col} TEXT`);
    if (this.#rows(`PRAGMA table_info(ai_run_log)`).length) {
      this.sql.exec(
        `INSERT INTO observation_log
           (at, actor_class, actor, authority_kind, authority, level, subject_kind, subject,
            state, governed, condition, bound, terminal, result_kind, result_ref, detail)
         SELECT l.at, 'machine', r.principal_claude, 'run', l.run, l.level, 'unstated', l.subject,
                l.state, l.governed, l.condition, l.bound, l.terminal, NULL, NULL, l.detail
           FROM ai_run_log l LEFT JOIN ai_runs r ON r.run = l.run
          ORDER BY l.run, l.seq`);
      this.sql.exec(`DROP TABLE ai_run_log`);
    }
  }
}

const INSTANCES = new WeakMap();
/** The one instance per Durable Object storage (K61). A later caller's `env` fills one created without it; `deps` are
 *  read on the first call only. */
export function aiRunsOf(ctx, env = null, deps = null) {
  const key = ctx.storage;
  let m = INSTANCES.get(key);
  if (!m) { m = new AiRuns(ctx, env || {}, deps || {}); INSTANCES.set(key, m); }
  else if (env && (!m.env || !Object.keys(m.env).length)) m.env = env;
  return m;
}

/** The run's ops (K3), for the control plane's dispatch: `airunopen`, `airuntick`, `airunclose`, `airun`, `airunlog`,
 *  `airuns`, `airunspawn`, and the use's (T33-50): `aiusage`, `aiceilingset`, `aicopyceilingset`. Every identity is a
 *  server-side stamp read from the QUERY and set AFTER the body's spread, so a caller's own copy in the body is
 *  overwritten rather than believed: the two principals on the open (§14a — a principal a caller can name is not one),
 *  `actor` (PL-18, DEC-63: which member is asking; empty for a machine), `viewer` (D-15's fail-closed sight; on the
 *  open only the stated project count reads it, REC-139), `caller` (the caller's principal on the tick and the close,
 *  REC-152) and `by` (who sets a ceiling, R50). */
export function aiRunsOps(runs, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    airunopen: () => runs.open({ ...(body || {}), principalPlane: q("principal"), actor: q("actor"), viewer: q("viewer") }),
    airuntick: () => runs.tick({ ...(body || {}), actor: q("actor"), viewer: q("viewer"), caller: q("principal") }),
    airunclose: () => runs.close({ ...(body || {}), actor: q("actor"), viewer: q("viewer"), caller: q("principal") }),
    airun: () => runs.read({ run: q("run"), viewer: q("viewer") }),
    airunlog: () => runs.log({ run: q("run"), viewer: q("viewer"), limit: q("limit") }),
    /* REC-69: the CONTEXT-keyed read, beside the run-id-keyed ones; a caller that could name the viewer could read the
       runs of a project it was never invited to. */
    airuns: () => runs.listInContext({ contextType: q("contextType"), contextId: q("contextId"), viewer: q("viewer"),
                                       limit: q("limit") }),
    airunspawn: () => runs.spawnPayload({ run: q("run"), half: q("half"), viewer: q("viewer") }),
    /* R51 (op-declarations R20's one spec): with `month`, an administrator's month per mode; otherwise the viewer's
       own day against their ceiling. */
    aiusage: () => (q("month") != null
      ? runs.aiUsage({ viewer: q("viewer"), month: q("month") })
      : runs.aiUsageMine({ viewer: q("viewer"), day: q("day") })),
    /* R50: the ceilings, `by` the control plane's stamp, never the body's. */
    aiceilingset: () => runs.aiCeilingSet({ ...(body || {}), by: q("by") }),
    aicopyceilingset: () => runs.aiCopyCeilingSet({ ...(body || {}), by: q("by") }),
    /* K1606 (run-rules R19): the verification act, `by` the stamp. */
    airunverify: () => runs.verificationRecord({ ...(body || {}), by: q("by") }),
  };
}
