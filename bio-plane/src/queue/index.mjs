/* queue — the member's one feed and the obligation inbox it reads (requirements: `build/requirements/queue.md`, R1–R42).
 * Extracted from the legacy store, catalogue and control plane at T12 (K3, K49, K78 (2), P18; map
 * `build/extraction/queue.md`): the `op=queue` composition, its producers and its mint; the personal half (mute and
 * snooze); the dispose dispatch with its project arm and its class bridge; the tasks inbox and its drain.
 *
 *   queueFeed      op=queue: every item typed by class, homed under every case, with its options and its disposition
 *                  (R6–R18, R39, R40); `queueAnswer` is the control plane's decoration of that answer (R17).
 *   queueMute, queueSnooze   the PERSONAL half: one member's preferences, writing nothing any other member reads
 *                  (R19–R22, R26, R30, R31).
 *   proposeDispose op=proposedispose: the set, the class bridge, the project arm; the progression arm is
 *                  `progressions.disposeProposal` (R27–R29).
 *   taskDrain, taskList, taskForward, taskResolve   the obligation inbox (R23–R25); the task grammar C-19.1 at the
 *                  write, in the audit and at the drain (R41); the four figures and the TASK ledger's seed (R42).
 *
 * REACHED as `queueOf(ctx, deps)` (K61): one instance per Durable Object storage, created on the first call. At that
 * call it declares its tables to record-core's purge (R36), registers its four figures with record-core's counts and
 * seeds its TASK ledger row (R42), registers the task grammar with promotion and with record-core's audit (R41), and
 * registers its two scheduler consumers (`task-drain`, `queue-renotify`; R22, R23) and capture's task notice (capture
 * R44), unless `deps` says a test is driving it bare.
 * `deps` (each defaults to its module's instance on the same `ctx`, reached lazily when first asked):
 *   record, membership, promotion, governor, provenance, capture, captureRequests, connections, basisVersions,
 *   progressions, aiRuns, bias, publication, reevaluation, intent, monitoring, affordances, scheduler   the providers;
 *   env       the instance bindings: `BIO_NOW_MS` (the clock) and `TASK_DRAIN_DELAY_MS` (R23);
 *   now       a clock, `() => ms`, in place of `env`'s;
 *   start     false to skip the registrations (a test that drives the consumers itself).
 * The ops are `queueOps`' entries, which the legacy store's dispatcher spreads in.
 *
 * N301 (K356): the class FINDING keeps its code and its meaning and is shown to members as **Noticed**: the answer
 * publishes `class_labels`, and no member-facing sentence this module owns calls a queue item a finding.
 */

import { normalizeType, STATES, vocabFor, isMachineIdentity, isMachineStamp, MACHINE_AUTHOR_PREFIX,
         MACHINE_CLASS_PREFIX, isPublicHttpsLocator } from "../../checks/bio-checks.mjs";
import { recordOf, stampInstant, perItem, mintExhausted } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK, noSuchProject } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { governorOf } from "../host-governor/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { captureRequestsOf, renderHoldReason } from "../capture-requests/index.mjs";
import { connectionsOf } from "../connections/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { progressionsOf, notADisposition } from "../progressions/index.mjs";
import { aiRunsOf } from "../ai-runs/index.mjs";
import { biasOf } from "../bias/index.mjs";
import { publicationOf, EXPORT_LOG_LIMIT_DEFAULT } from "../publication/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { intentOf } from "../intent/index.mjs";
import { monitoringOf } from "../monitoring/index.mjs";
import { schedulerOf } from "../scheduler/index.mjs";
import { affordancesOf, deriveActs, decorate, vocabulariesFor, PER_ITEM_ACTS, PER_ITEM_MAX } from "../affordances.mjs";
import { QUEUE_CONDITION_KINDS, QUEUE_FINDING_KINDS, catalogueIdOf, classOfKind, MUTE_REFUSAL_DETAIL,
         PERSONALLY_MUTABLE_CLASSES, itemClassOf, mutedAsItem, serializeMutedKinds, parseMutedKinds,
         suppressedBy } from "../queuestate.mjs";
import { proposalFindingItems } from "./proposals.mjs";
import { QUEUE_SCHEMA, QUEUE_TABLES, queueOwns } from "./schema.mjs";
import { QUEUE_MINT_CHECKS, QUEUE_MACHINE_CHECKS, QUEUE_ACT_CHECKS, TASK_ACTOR_CHECKS, QUEUE_INBOX_CHECKS, queueRefusal,
         checkInboxGrammar } from "./checks.mjs";

export { QUEUE_SCHEMA, QUEUE_TABLES, queueOwns } from "./schema.mjs";
export { QUEUE_MINT_CHECKS, QUEUE_MACHINE_CHECKS, QUEUE_ACT_CHECKS, TASK_ACTOR_CHECKS, QUEUE_INBOX_CHECKS,
         checkInboxGrammar } from "./checks.mjs";

/* N301 (K356): how each class is shown to members. The codes are unchanged; the words are these. */
export const QUEUE_CLASS_LABELS = Object.freeze({ OBLIGATION: "Obligation", FINDING: "Noticed", CONDITION: "Condition" });

const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

/* The id suffix the TASK grammar requires: lowercase alphanumeric groups joined
   by single dashes, never empty, never leading or trailing dashes. Derived from
   the subject so an id is legible, but it is an IDENTIFIER and not a rendering:
   the subject itself is carried in the bounded field the grammar checks. */
const taskSlug = (subject) => {
  const s = String(subject || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/g, "");
  return s || "authority";
};
const isHttpsPublic = (u) => isPublicHttpsLocator(u);
/* R6, R23, R24: a limit is clamped to 1–max; absent, blank or not a number, it is the default. */
const clampLimit = (limit, dflt, max) => {
  const n = limit === null || limit === undefined || limit === "" ? NaN : Math.floor(Number(limit));
  return Number.isFinite(n) ? Math.max(1, Math.min(max, n)) : dflt;
};

export class Queue {
  #host; #deps; #env; #clock;
  constructor({ host, storage, deps = {} } = {}) {
    this.#host = host;
    this.sql = storage.sql;
    this.#deps = deps || {};
    this.#env = (deps && deps.env) || {};
    this.#clock = deps && typeof deps.now === "function" ? deps.now : null;
  }

  /** The table pass: every table R36 names, created where it is absent. Idempotent. */
  migrate() {
    for (const stmt of QUEUE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";"))
      if (stmt.trim()) this.sql.exec(stmt);
  }

  /* ------------------------------------------------------------------ the providers (Uses), reached lazily */
  #dep(name, make) {
    if (!(name in this.#deps) || this.#deps[name] === undefined) this.#deps[name] = make();
    return this.#deps[name];
  }
  get #record() { return this.#dep("record", () => recordOf(this.#host)); }
  get #membership() { return this.#dep("membership", () => membershipOf(this.#host)); }
  get #governor() { return this.#dep("governor", () => governorOf(this.#host)); }
  get #provenance() { return this.#dep("provenance", () => provenanceOf(this.#host)); }
  get #capture() { return this.#dep("capture", () => captureOf(this.#host)); }
  get #captureRequests() { return this.#dep("captureRequests", () => captureRequestsOf(this.#host)); }
  get #connections() { return this.#dep("connections", () => connectionsOf(this.#host)); }
  get #basisVersions() { return this.#dep("basisVersions", () => basisVersionsOf(this.#host)); }
  get #progressions() { return this.#dep("progressions", () => progressionsOf(this.#host)); }
  get #aiRuns() { return this.#dep("aiRuns", () => aiRunsOf(this.#host)); }
  get #bias() { return this.#dep("bias", () => biasOf(this.#host)); }
  get #publication() { return this.#dep("publication", () => publicationOf(this.#host)); }
  get #reevaluation() { return this.#dep("reevaluation", () => reevaluationOf(this.#host)); }
  get #intent() { return this.#dep("intent", () => intentOf(this.#host)); }
  get #monitoring() { return this.#dep("monitoring", () => monitoringOf(this.#host)); }
  get #affordances() { return this.#dep("affordances", () => affordancesOf(this.#host)); }
  get #scheduler() { return this.#dep("scheduler", () => schedulerOf(this.#host, this.#env)); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** The instant this read or act is at: the caller's (ms), else the clock a test gave, else the instance binding
   *  `BIO_NOW_MS`, else the wall clock. An ABSENT param is null (or "") and falls through, never to the epoch. */
  #nowMs(explicit) {
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      const e = Number(explicit);
      if (Number.isFinite(e) && e >= 0) return e;
    }
    if (this.#clock) return this.#clock();
    const v = Number(this.#env && this.#env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }

  /* ------------------------------------------------------------------ the viewer gate (membership R43, R80)
     membership offers the ONE predicate (`viewerPredicate`) and the one-id answer (`inSight`), not a SQL compiler
     (its R80: "callers gate with R43 and R80"), so this module compiles its own gate from the predicate, as the
     legacy store did (map §5.3). A machine credential (`scope: member`) is not filtered; an absent or unrecognised
     viewer compiles to DENY. */
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

  /** The bundles the caller's predicate does not pass, as a set to subtract (D-464, D-486); null for a caller the
   *  gate does not filter, and every bundle for an unrecognised one. */
  #hiddenBundles(viewer) {
    const gate = viewer === undefined ? null : viewerPredicate(viewer);
    return gate && gate.scope !== "member"
      ? { sql: `(SELECT bundle_id FROM bundles EXCEPT SELECT b.bundle_id FROM bundles b WHERE (${gate.sql}))`, args: gate.args }
      : null;
  }

  /* ------------------------------------------------------------------ the providers' services, by the names the moved
     code already used (connections R22; basis-versions R22, R37; membership R44, R55, R64, R76, R77) */
  #refEdgeSevered(...a) { return this.#connections.edgeSevered(...a); }
  #projectsDrawingOn(...a) { return this.#basisVersions.projectsDrawingOn(...a); }
  #conclusionOf(...a) { return this.#basisVersions.conclusionOf(...a); }
  #conclusionRecordOf(...a) { return this.#basisVersions.conclusionRecordOf(...a); }
  #positionalMember(...a) { return this.#membership.positionalMember(...a); }
  #isAdminMember(...a) { return this.#membership.isAdministrator(...a); }
  #activeAdmins(...a) { return this.#membership.activeAdmins(...a); }
  #existenceAct(...a) { return this.#membership.existenceAct(...a); }
  #projectAuthority(...a) { return this.#membership.projectAuthority(...a); }

  /* R27's reason bound: progressions R21's words ("over 160 characters, or a quotation mark, backslash or line
     break"), which the project arm asks as the progression arm does. */
  static EDGE_REASON_MAX = 160;

  /* D-109. The task queue drains on the SAME Durable Object alarm the selection
     sweep uses: armed on enqueue, re-armed by the alarm while the queue is
     non-empty, self-terminating when it drains — the mechanism #armSweep proved
     for selections. DELAY is short so a burst of captures coalesces into one
     drain rather than one alarm apiece. BACKSTOP is longer and used when a tick
     drained nothing: every remaining event is then a capture not yet filed in a
     bundle (taskDrain keeps those, it does not drop them), and retrying that at
     the short cadence would be a hot loop against work that only a later promote
     can unblock. BATCH bounds one tick; a deeper backlog re-arms and continues.
     DELAY is overridable per instance through TASK_DRAIN_DELAY_MS: production
     takes the short default, and a test that drives the consumer by hand pushes
     the automatic one out of its own window so the two never race on the clock. */
  static TASK_DRAIN_DELAY_MS = 1000;
  static TASK_DRAIN_BACKSTOP_MS = 60000;
  static TASK_DRAIN_ALARM_BATCH = 200;


  /* ========================= REC-20 · op=queue =======================   *
   * ONE read, ONE contract, over the two producers that already exist: an
   * OBLIGATION is a row in `tasks` (D-98's routed work) and a FINDING is an
   * aggregated proposal from `proposalsFeed` (D-79's derived question). Before
   * this op a member had to open two surfaces and reconcile them by eye, and
   * neither could say WHICH CASE a thing belonged to. D-140 and SB-CORE
   * GAP-Q1/GAP-Q3; the queue is the one surface every member opens by habit.
   *
   * THE LOAD-BEARING SHAPE, and it is DEC-16 (Bob, 2026-08-02, answering his
   * own DEC-10): **the unit of state is the EVENT, not the (member, case)
   * entry — one state, N homes.** `case` is populated with EVERY ANCESTOR over
   * a bounded walk of the basis/citation edges, so a fact about a document
   * reaches everyone standing on it; and because the state lives on the event,
   * an event appearing under several cases does NOT create several entries, so
   * DEC-10's "one standing entry per (member, case)" survives intact and one
   * resolution clears the item everywhere.
   *
   * NO NEW TABLE, AND THAT IS A FINDING RATHER THAN A SHORTCUT. DEC-16's shape
   * asks for state that is keyed by the event. Both producers ALREADY key it
   * that way: `tasks.status` lives on the task row (the event), and
   * `proposal_dispositions` is keyed by (progression_key, stage_key) — the
   * proposal's own identity — never by who read it or under which case. So the
   * carrier exists, the homes are DERIVED on read from the edges, and nothing
   * is stored that could go stale. (REC-21's `queue_state` is the PERSONAL
   * half — mute and snooze — and is deliberately a different table with a
   * different doctrine: muting is personal, resolving is a record act.)
   *
   * THE VIEWER POSTURE. This is a read that names bundle ids, so it takes the
   * D-15 gate through query.mjs's ONE compilation point exactly as REC-25
   * stamped the other reads. An ancestor the caller may not see is NOT named,
   * and its absence is STATED rather than silently shortening the set — the
   * same honesty DEC-16 requires of an exhausted walk, for the same reason: a
   * quietly truncated home set is indistinguishable from nobody caring.
   *
   * CONDITION ARRIVED WITH REC-32 (2026-08-04), and HOLE-1 IS HALF CLOSED. It
   * was deferred here — declared, never stubbed — until there was a real
   * producer to declare, because emitting a stub would have built the second
   * half of a bridge. Three of NOTIFICATIONS.md's catalogue entries now derive
   * from facts the store ALREADY holds, on the same read and with no table and
   * no stored state: see the REC-32 block below. The remaining catalogue kinds
   * stay unbuilt, and that is a gap in the CATALOGUE (queuestate.mjs's
   * vocabulary names all eleven) rather than a gap in this class.
   * ======================================================================== */

  /** The classes this producer EMITS. `class` is NOT NULL on the producer:
   *  queueFeed refuses to answer rather than hand a surface a classless item,
   *  which is the shape a `class TEXT NOT NULL` column would enforce if the
   *  feed were a table. It is not a table — it is derived on read — so the
   *  constraint is enforced here, at the one place items are minted.
   *
   *  THE ORDER IS THE RANK, and it is the doctrine's own: something a NAMED
   *  PERSON must do outranks something the RECORD noticed, which outranks a
   *  fact about OUR OWN MACHINERY. CONDITION is therefore last and was
   *  appended rather than inserted (REC-32). */
  static QUEUE_CLASSES = ["OBLIGATION", "FINDING", "CONDITION"];
  /** Declared, not stubbed. A class with no producer is named with the reason
   *  it is absent, so "not built yet" is distinguishable from "forgotten".
   *
   *  EMPTY as of REC-32, and the mechanism STAYS. CONDITION was its only entry
   *  and it has a producer now, so the entry was REMOVED rather than reworded —
   *  a deferral that outlives its own hole is a lie the next reader has to
   *  disprove. The block remains because the next class that arrives without a
   *  carrier must be declarable the same way. */
  static QUEUE_CLASSES_DEFERRED = {};
  /** R3's depth bound, applied to the ancestor walk. The basis graph is a DAG
   *  enforced at write (REC-11), so a walk terminates by construction — but
   *  "terminates" is not "terminates inside a Durable Object's CPU budget",
   *  and R3 requires derivation to carry a bound whose EXHAUSTION is reported
   *  as `undetermined` rather than as a failure or as a silent truncation.
   *  Six: deep enough that a real chain of questions resting on questions is
   *  covered whole (the corpus's own worked example is three), shallow enough
   *  that a pathological chain reports undetermined instead of burning the
   *  read. REC-12's read-time derivation takes THIS constant when it lands, so
   *  the record has one bound and not two. */
  static QUEUE_ANCESTOR_DEPTH = 6;
  /** Which object types can BE a case — the grouping key is a bundle id and it
   *  is an inquiry or a project, never a document. Consulted through
   *  normalizeType (REC-10's MAP RULE) so a legacy `focus`/`problem` spelling
   *  groups identically to a canonical `inquiry` one. */
  static QUEUE_CASE_TYPES = ["inquiry", "project"];
  /** How many subject bundles one FINDING derives its options from. An
   *  aggregated proposal spans N instances and therefore N documents; deriving
   *  acts over all of them would make one queue read O(corpus). */
  static QUEUE_OPTION_SUBJECTS_MAX = 8;
  /** REC-32. How many SUBJECT documents one CONDITION may gather before the
   *  gathering itself is reported `undetermined`.
   *
   *  Only `governor-holding-host` needs it: a held host is a fact about a HOST,
   *  and the documents it concerns are every document captured from that host,
   *  which on a real municipal instance is the whole corpus. R3's discipline
   *  applies unchanged — a derivation carries a bound, and EXHAUSTING the bound
   *  is REPORTED (`subject_bound` joins the case set's reasons and the set
   *  reads `undetermined`) rather than silently truncating the homes. Sixteen:
   *  twice the option bound, because a home set is cheaper than an affordances
   *  derivation and a case set that is undetermined for a two-document instance
   *  would be undetermined for no reason at all. */
  static QUEUE_CONDITION_SUBJECTS_MAX = 16;
  /** D-266. How many RECORDED DISPOSITIONS `op=queue` publishes beside the open
   *  feed, before the publication itself reports that it was cut.
   *
   *  IT IS A BOUND ON A PUBLICATION AND NOT ON A DERIVATION, and saying which
   *  matters here: `proposalsFeed` already reads `proposal_dispositions` whole
   *  in order to AGE the open feed, so nothing is scanned twice and no work is
   *  amplified by this block. What the bound protects is the ANSWER — REC-57's
   *  discipline applied to a collection that grows with every act a member
   *  takes, on an op whose other collections are all bounded. Sixty-four, the
   *  same figure the shared-inquiry reads use: a member with more than sixty
   *  four standing decisions is reading a register rather than a queue, and
   *  `op=proposals` is the op that answers that question without a cap. */
  static QUEUE_DISPOSED_MAX = 64;
  /** R39: the window and the bound of the `resolved` block (the same sixty-four as `disposed`). */
  static QUEUE_RESOLVED_WINDOW_DAYS = 30;
  static QUEUE_RESOLVED_MAX = 64;
  /** REC-32 / REC-2 / D-61. The prefix `index.mjs` stamps on `author` (and on
   *  `leases.actor`) for a MACHINE credential — `token:<class>` — deleting any
   *  caller-supplied value first, so it is unforgeable and NAMED rather than
   *  anonymous. It is the only durable trace this store holds of an unattended
   *  writer, and it is what `capture-completed-unattended` reads. The literal
   *  lives at the trust boundary in index.mjs; this constant is the reader's
   *  copy, and the suite parses index.mjs's own source to prove the two agree
   *  rather than trusting that they do.
   *
   *  CORRECTED 2026-08-04 (REC-46), and the correction is the item's whole
   *  argument in one line: there is no longer a reader's COPY to prove equal to
   *  a writer's literal. Both are `MACHINE_AUTHOR_PREFIX`, imported from the
   *  catalog, so the stamp and the read are the SAME STRING and cannot drift at
   *  all. This alias stays because the name says what the value is FOR here —
   *  the manifest-author read `capture-completed-unattended` walks — and
   *  because the GLOB below is built from it. */
  static QUEUE_MACHINE_AUTHOR_PREFIX = MACHINE_AUTHOR_PREFIX;
  /** R18: the lead's two inquiry-grain acts, as options (the control plane decorates them, R17). */
  static LEAD_TAKE_UP = Object.freeze({ id: "cite", label: "Take it up under this question", weight: "report" });
  static LEAD_SET_ASIDE = Object.freeze({ id: "proposedispose", label: "Set it aside for your project",
                                          weight: "per-item" });
  /** N95: the page `manifestByAuthor` is read in (record-core R53's bound). */
  static QUEUE_UNATTENDED_PAGE = 200;

  /** One step UP the graph from a node: the edges an ancestor is reached by.
   *
   *  TWO edge kinds, because a case reaches a document two ways. `inquiry_basis`
   *  (REC-11) carries "this inquiry RESTS ON that target", indexed on target_id
   *  — the reverse index restingOn() already reads. `refs` with rel `cites`
   *  carries "this bundle CITES that target", which is how a project holds the
   *  documents and questions it is working on. Both are read at their target
   *  index, so a step is two indexed lookups and not a scan.
   *
   *  D-267 — A WITHDRAWN EDGE IS NOT A STEP, AND THE RULE IS CONSUMED RATHER
   *  THAN RESTATED. Both tables are PROJECTIONS of `references[]` and both DROP
   *  `status`, so a project that recorded `status: severed` still has its row in
   *  each — and this walk, reading the tables alone, kept it as a home for every
   *  item filed under the question it withdrew from. The plane already held the
   *  opposite rule one op over (`versionAct` refuses `VERSION_CURRENT_UNRELATED`
   *  for exactly that project, and `#projectsDrawingOn` reproduces it so the feed
   *  and the act agree about who is in the conversation), so the defect was never
   *  an undecided question. It is fixed HERE, at the walk, rather than in any one
   *  producer: a producer filtering its own homes would be a second
   *  implementation of the homes rule, which is the shape this repository has
   *  already lost a control to. The narrowing is `#refEdgeSevered`, the single
   *  predicate `#citesInto` and inquiry's `restsOnLive` also read, and BOTH edge kinds are
   *  confirmed — the basis half had the identical blindness and nothing had
   *  named it.
   *
   *  AN EDGE SURVIVES IF ANY OF ITS SPELLINGS IS LIVE. One document may reach one
   *  ancestor as a basis leg AND as a citation; withdrawing one of those is not
   *  withdrawing the other, so the confirmations are OR-ed and the home stays
   *  while any live edge remains. With `#refEdgeSevered`'s own two conservative
   *  arms — unreadable is live, unrecorded is live — the walk can only ever drop
   *  a home on a POSITIVE recorded withdrawal, never on a shape it failed to
   *  parse.
   *
   *  THE COST IS ONE DOCUMENT READ PER CANDIDATE EDGE, which is the price D-267
   *  costed against the alternative: teaching `refs` a `status` column would
   *  change a projection twelve readers and an export manifest build against,
   *  for a fact only the document can be authoritative about anyway (D-21). */
  #queueAncestorEdges(nodeId) {
    const up = new Map();
    const consider = (id, rel) =>
      up.set(id, (up.get(id) || false) || !this.#refEdgeSevered(id, nodeId, rel));
    for (const r of this.#rows(
      `SELECT DISTINCT bundle_id FROM inquiry_basis WHERE target_id=?`, nodeId))
      consider(r.bundle_id, null);
    for (const r of this.#rows(
      `SELECT DISTINCT bundle_id FROM refs WHERE target_id=? AND kind='cites'`, nodeId))
      consider(r.bundle_id, "cites");
    return [...up.entries()].filter(([, live]) => live).map(([id]) => id).sort();
  }

  /** DEC-16's EVERY-ANCESTOR walk, bounded, viewer-gated, and honest about both
   *  ways it can come back incomplete.
   *
   *  Returns the SET of homes for one event, given the subject(s) the event is
   *  about. Breadth-first so `depth` means what it says; a `seen` set makes the
   *  walk cost linear in the edges actually reachable and makes a diamond
   *  (two questions resting on one document, both under one project) cost one
   *  visit rather than two.
   *
   *  WHAT IS AND IS NOT A HOME. The walk passes THROUGH every node it reaches
   *  but only ADMITS the case types (QUEUE_CASE_TYPES, via normalizeType) as
   *  homes: an information bundle that happens to cite another document is a
   *  waypoint, not a group header. Passing through it is deliberate — a
   *  question reachable only through a document is still a question that rests
   *  on the subject.
   *
   *  TWO WAYS TO COME BACK UNDETERMINED, both STATED and neither silent:
   *    - `depth_bound`: the frontier was still non-empty at the bound (R3).
   *    - `out_of_view`: an ancestor exists that this viewer may not see (D-15
   *      §7.9 filters PROJECT bundles). The id, the title, the state and even
   *      the COUNT are withheld — the count is the leak — but the FACT that the
   *      set is incomplete is reported, because a silently shorter set is
   *      exactly the "indistinguishable from nobody caring" failure DEC-16's
   *      truncation rule is about. The walk still passes THROUGH an invisible
   *      node: reaching a VISIBLE ancestor by way of an invisible one discloses
   *      nothing about the invisible one.
   *
   *  An EMPTY set with no reasons is UNGROUPED, and that is a real answer: an
   *  item nothing rests on sits ungrouped and is never given an invented home. */
  #queueAncestors(subjectIds, viewer) {
    const bound = Queue.QUEUE_ANCESTOR_DEPTH;
    /* D-15 through the ONE compilation point. Fail closed: an absent or
       unrecognised viewer compiles to the deny predicate, so a caller that
       reached here without an identity groups under nothing rather than
       under everything. */
    const gate = viewerPredicate(viewer);
    const seen = new Set((subjectIds || []).filter((x) => typeof x === "string" && x));
    const found = new Map();
    const reasons = new Set();
    let frontier = [...seen];
    let depth = 0;
    while (frontier.length > 0 && depth < bound) {
      depth += 1;
      const next = [];
      for (const node of frontier) {
        for (const up of this.#queueAncestorEdges(node)) {
          if (seen.has(up)) continue;
          seen.add(up);
          next.push(up);
          const row = this.#one(
            `SELECT b.bundle_id, b.object_type, b.current_state, b.title FROM bundles b
             WHERE b.bundle_id=? AND (${gate.sql})`, up, ...gate.args);
          if (!row) {
            /* Absent and invisible are indistinguishable TO THE CALLER (REC-25),
               but they are not the same fact and this producer must not report
               the wrong one: an edge whose target was purged is not an ancestor
               being withheld. The existence probe is internal — the store is a
               legitimate whole-corpus reader — and its answer never leaves this
               method except as the single word `out_of_view`. */
            if (this.#one(`SELECT 1 AS x FROM bundles WHERE bundle_id=?`, up))
              reasons.add("out_of_view");
            continue;
          }
          /* MAP RULE (REC-10, and REC-13's seam): every type and state
             consultation goes through the catalog's own vocabulary machinery,
             never a raw key — so a legacy `focus`/`problem` document groups
             exactly as a canonical `inquiry` one does. */
          const ty = normalizeType(row.object_type);
          if (!Queue.QUEUE_CASE_TYPES.includes(ty)) continue;   // a waypoint, not a home
          const spec = vocabFor(STATES, row.object_type);
          const edges = spec && spec.edges ? spec.edges : null;
          /* Is this case CLOSED? Three-valued on purpose: a state the machine
             does not name is UNDETERMINED, not terminal. DEC-16's own reasoning
             turns on whether an ancestor has been concluded, so a surface must
             be able to tell "no way out" from "we do not know". */
          const terminal = edges && Object.prototype.hasOwnProperty.call(edges, row.current_state)
            ? edges[row.current_state].length === 0 : null;
          found.set(row.bundle_id, {
            id: row.bundle_id, type: ty, title: row.title ?? null,
            state: row.current_state ?? null, terminal, depth });
        }
      }
      frontier = next;
    }
    /* EXHAUSTION IS REPORTED EXACTLY, not eagerly. Stopping with a non-empty
       frontier is not by itself a truncation: the last layer may simply have
       nothing above it, and reporting `undetermined` there would claim we do
       not know something we do. So the bound reports itself only when a node we
       never expanded genuinely HAS an unvisited ancestor — one extra indexed
       lookup per remaining node, and the difference between an honest
       undetermined and a reflexive one. */
    if (frontier.length > 0
        && frontier.some((n) => this.#queueAncestorEdges(n).some((u) => !seen.has(u))))
      reasons.add("depth_bound");
    const ancestors = [...found.values()]
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const state = reasons.size > 0 ? "undetermined" : "determined";
    return { state, ungrouped: state === "determined" && ancestors.length === 0,
             reasons: [...reasons].sort(), depth_bound: bound, ancestors };
  }

  /** DEC-16's event-state gate, asked of the EVENT and of nothing else.
   *
   *  A task's status IS the event's state: it lives on the task row, which is
   *  the event, and not on any (member, case) pairing. That is why one
   *  resolution clears the item under every ancestor without a second
   *  mechanism, and it is what the item's negative control breaks. */
  #queueEventLive(task) {
    return task && task.status !== "resolved";
  }

  /** The options a member may act on, DERIVED — never a copy, never invented.
   *
   *  REC-19 owns "what may be DONE to an object": ACTS + deriveActs over
   *  affordances' `affordanceFacts`, which is itself viewer-gated. This method
   *  calls THAT derivation and projects the three fields that survive the DO
   *  boundary; the control plane decorates them with `needs`, `mode` and
   *  `rung` from NEEDS/SESSION_OPS/RUNGS through the SAME function op=affordances
   *  uses, so a queue item's options and an affordances answer for the same
   *  subject and the same viewer are identical by construction rather than by
   *  agreement. A subject the viewer cannot see contributes nothing, and an
   *  empty list is the honest answer (REC-19's own posture for an `action`
   *  bundle: nothing operates it, so nothing is published).
   *
   *  Union order is ACTS order, preserved: a single-subject item's options are
   *  byte-for-byte op=affordances' `acts`. */
  #queueOptions(subjectIds, viewer, identity = null) {
    const byId = new Map();
    /* D-311: the two act stamps `op=affordances` now sends (`author`, `by`), recovered from what the
       queue already carries so an item's options stay byte-for-byte that answer. A session's are its
       member; a bearer's viewer is its `class:<cls>` stamp — the roster stamp exactly, and a machine
       identity by the same predicate the author stamp's `token:<cls>` answers. Neither known: null,
       and a null narrows nothing and publishes no roster act. */
    const member = this.#positionalMember(viewer, identity);
    const actor = member !== null ? member : (isMachineIdentity(viewer) ? String(viewer).trim() : null);
    for (const id of (subjectIds || []).slice(0, Queue.QUEUE_OPTION_SUBJECTS_MAX)) {
      const facts = this.#affordances.affordanceFacts({ target: id, viewer, identity, author: actor, by: actor });
      if (!facts || facts.ok !== true) continue;
      for (const a of deriveActs(facts))
        if (!byId.has(a.id)) byId.set(a.id, { id: a.id, label: a.label, weight: a.weight });
    }
    return [...byId.values()];
  }

  /* ================== REC-32 · the CONDITION half of the feed =======   *
   * WHAT A CONDITION IS, and it is the reason this class exists separately: a
   * fact about OUR OWN MACHINERY rather than about the world (NOTIFICATIONS.md,
   * "The classes"). An overdue set of minutes is evidence about a public body;
   * a governor holding a host is a limitation of our own run. Merging them
   * would let our plumbing dilute the record's findings, which is the one thing
   * the three-class split exists to prevent.
   *
   * DERIVED ON READ, NO TABLE, NO STORED STATE — the REC-20 precedent, and here
   * it is not a shortcut but the only correct shape. Every one of these facts is
   * ALREADY state on the producing subsystem's own row: the governor's
   * `cooloff_until`, the capture session's existence and expiry, the manifest's
   * author. A stored copy would be a second record of one fact and would go
   * stale the instant the fact resolved — which is exactly the failure this
   * item's negative control produces on purpose.
   *
   * SO RESOLUTION NEEDS NO MECHANISM. A condition clears when its underlying
   * fact stops being true, for EVERY member at once, because there is nothing
   * per-member to clear: the hold expires, the session is dropped, a member
   * authors the document again. That is DEC-16's one-state-N-homes rule
   * inherited rather than re-implemented, and it is why muting (personal) and
   * resolving (shared) can sit on the same item without colliding.
   *
   * THREE KINDS, AND THEY ARE THE THREE WHOSE DATA IS ALREADY HERE. The
   * catalogue names eleven CONDITION kinds (queuestate.mjs holds the
   * vocabulary, transcribed from NOTIFICATIONS.md and still the single
   * authority). These three are built because their producing subsystems
   * already write the fact down; the other eight wait on producers that do not
   * exist yet, and nothing here invents one. NOTHING IS COUPLED TO A MONITOR
   * TICK: a later capture-fact producer adds kinds, it does not change these.
   *
   * THE VIEWER POSTURE IS REC-30'S, arm for arm:
   *   - a condition ABOUT A BUNDLE the viewer may not see is WITHHELD WHOLE and
   *     with no count, the posture an OBLIGATION about an invisible subject
   *     takes — a count here would say a project exists;
   *   - a condition about something that is NOT a bundle (a host, an
   *     unregistered capture) stands for every member, because it names no
   *     bundle to withhold; what is gated is which DOCUMENTS sit behind it;
   *   - the homes come from #queueAncestors, so an ancestor the viewer may not
   *     see is `undetermined`/`out_of_view` and never silently dropped.
   * ======================================================================== */

  /** The home set for a condition, with the ONE extra way a condition's walk can
   *  come back incomplete that an obligation's cannot.
   *
   *  An obligation and a finding both start from a bounded, known set of
   *  subjects. A condition about a HOST does not: the documents it concerns are
   *  every document captured from that host. So the subject gathering carries
   *  R3's discipline too — a bound, and an EXHAUSTED bound reported as
   *  `subject_bound` rather than as a quietly shorter home set. Same rule as
   *  `depth_bound`, same reason, and deliberately a DIFFERENT word, because
   *  "we stopped walking up" and "we stopped gathering subjects" are different
   *  facts and a surface should be able to say which happened. */
  #conditionHomes(subjectIds, viewer, bounded = false) {
    const homes = this.#queueAncestors(subjectIds, viewer);
    if (!bounded) return homes;
    return { ...homes, state: "undetermined", ungrouped: false,
             reasons: [...new Set([...homes.reasons, "subject_bound"])].sort() };
  }

  /** Which documents in this record came from a HOST, viewer-gated and bounded.
   *
   *  `captured_locators` is the store's own index of "what we retrieved from
   *  what address", written unconditionally for every capture, and `register`
   *  is the trust root that says which bundle those bytes were registered
   *  under. The join is the honest path from a host to the documents a member
   *  is actually working on; site_assets would answer a narrower question (what
   *  a host SERVED as furniture) and reuse_verdicts a narrower one still.
   *
   *  AN ADDRESS BELONGS TO THE HOST WHEN IT BEGINS WITH ONE OF FOUR PREFIXES, since normalizeAddress keeps the
   *  scheme and a non-default port: `https://<host>/`, `http://<host>/`, `https://<host>:`, `http://<host>:`. Each
   *  prefix is asked as a RANGE over the text, `prefix <= address_norm < upper`, where `upper` is the prefix with
   *  its last character (`/` or `:`) raised by one: under SQLite's binary collation that is exactly "begins with",
   *  and it is a seek on the `address_norm` key. No LIKE or GLOB pattern is built (N270): a pattern grows with the
   *  host, and workerd refuses one over 50 bytes (K313), so a long hostname failed the whole read on the plane. */
  #conditionBundlesForHost(host, viewer) {
    const cap = Queue.QUEUE_CONDITION_SUBJECTS_MAX;
    if (typeof host !== "string" || !host) return { ids: [], bounded: false };
    const seen = this.#bundleGate("r.bundle_id", viewer);
    const prefixes = [`https://${host}/`, `http://${host}/`, `https://${host}:`, `http://${host}:`];
    const ranges = prefixes.flatMap((p) => [p, p.slice(0, -1) + String.fromCharCode(p.charCodeAt(p.length - 1) + 1)]);
    const rows = this.#rows(
      `SELECT DISTINCT r.bundle_id FROM captured_locators cl
         JOIN register r ON r.capture_sha = cl.capture_sha
        WHERE (${prefixes.map(() => "(cl.address_norm >= ? AND cl.address_norm < ?)").join(" OR ")})
          AND (${seen.sql})
        ORDER BY r.bundle_id LIMIT ?`,
      ...ranges, ...seen.args, cap + 1);
    const ids = rows.map((r) => r.bundle_id);
    return { ids: ids.slice(0, cap), bounded: ids.length > cap };
  }

  /** `governor-holding-host` (D-103, and D-95 which built the governor).
   *
   *  THE FACT IS THE GOVERNOR'S OWN, read at the same predicate the governor
   *  itself admits on: `cooloff_until > now` is the exact test `governorAdmit`
   *  applies before refusing with `cooling_off`, and the one index.mjs applies
   *  before stopping a page's remaining subresources. This derivation does not
   *  restate the rule, it asks it.
   *
   *  WHY IT EARNS AN ITEM AT ALL (NOTIFICATIONS.md rule 4 — a CONDITION is
   *  status until a member can change it): because the member's conclusion
   *  changes. "The source is down" and "we are pacing ourselves" are different
   *  facts about the world and about us, and D-104 is explicit that they must be
   *  distinguishable. A member who cannot tell them apart will either wait for
   *  a source that is fine or chase a publisher who did nothing.
   *
   *  IT RESOLVES BY THE HOLD ENDING, and for everyone at once. There is no act
   *  to take and none is offered: `options[]` are the acts available on the
   *  DOCUMENTS behind it, derived exactly as every other item's are. */
  #conditionsGovernorHolding(viewer, now, identity = null) {
    const out = [];
    for (const r of this.#governor.governorHolding({ now })) {
      const subj = this.#conditionBundlesForHost(r.host, viewer);
      const refusedAt = Number(r.last_refusal_at);
      out.push({
        id: `CONDITION::governor-holding-host::${r.host}`,
        class: "CONDITION",
        kind: "governor-holding-host",
        case: this.#conditionHomes(subj.ids, viewer, subj.bounded),
        subject: { kind: "host", id: null, host: r.host,
                   bundles: subj.ids.slice(0, Queue.QUEUE_OPTION_SUBJECTS_MAX) },
        summary: `our own pacing is holding ${r.host}: captures from it are PACED, not broken`,
        detail: `the per-host governor is in cool-off for ${r.host} for another `
              + `${Math.max(0, r.cooloff_until - now)}ms after `
              + `${r.refusals} consecutive refusal${r.refusals === 1 ? "" : "s"}`
              + (r.last_refusal_status ? ` (last status ${r.last_refusal_status})` : "")
              + ". Nothing about the source is being claimed here.",
        basis: { source: "host_governor", host: r.host,
                 cooloff_until: r.cooloff_until, retry_in_ms: Math.max(0, r.cooloff_until - now),
                 refusals: r.refusals, last_refusal_status: r.last_refusal_status ?? null,
                 last_refusal_at: Number.isFinite(refusedAt) ? refusedAt : null,
                 appetite_per_min: r.appetite_per_min ?? null,
                 granted: r.granted, refused_total: r.refused_total,
                 detail: "a condition is a fact about OUR OWN machinery (D-103/D-95): this instance's "
                       + "governor is holding the host, which is distinguishable from the source being "
                       + "unreachable and must not be read as evidence about the publisher. It clears "
                       + "for every member when the hold expires; there is no act that ends it." },
        age: Number.isFinite(refusedAt) && refusedAt > 0
          ? { state: "determined", since: new Date(refusedAt).toISOString(),
              ms: Math.max(0, now - refusedAt) }
          : { state: "undetermined", reason: "no_refusal_instant",
              detail: "the governor row is in cool-off but carries no instant for the refusal that "
                    + "started it, so how long this has been true is not derivable" },
        assignee: null,
        assignee_role: null,
        options: this.#queueOptions(subj.ids, viewer, identity),
      });
    }
    return out;
  }

  /** `partial-capture-outstanding` (CAPTURE-SCALING; the subresource ceiling).
   *
   *  THE FACT IS THE LEDGER'S OWN. `capture_sessions` is a work list with an
   *  expiry: a row exists exactly when a capture ran out of subrequest budget
   *  with support material still outstanding, and the capture path DROPS it the
   *  moment nothing is left. So "a capture did not finish" is the existence of
   *  an unexpired row and nothing else.
   *
   *  THIS READ DOES NOT PRUNE. `saveCaptureSession` and `loadCaptureSession`
   *  delete expired rows on the way past, which is right for a write path and
   *  wrong for this one: op=queue REPORTS and never mutates. An expired session
   *  is filtered by the same instant comparison instead, in the same stamp
   *  format those two methods write.
   *
   *  WHAT IT IS ABOUT. The primary capture is COMPLETE from the first tick and
   *  its bytes are in the store; what is outstanding is support material. If
   *  those bytes were registered under a bundle, that bundle is the subject and
   *  the ordinary viewer posture applies — invisible subject, withheld whole. If
   *  they were not, the session names no bundle at all (the intake doctrine's
   *  own words), so there is nothing to withhold and the item stands ungrouped
   *  about a capture rather than about a document. */
  #conditionsPartialCapture(viewer, now, identity = null) {
    const out = [];
    const nowIso = stampInstant("second", now);
    const redact = this.#bundleRedactor(viewer);
    /* capture R46 (the live sessions, each `{session, locator, primarySha, …, state}` with its state parsed) and
       provenance R4 (the capture's home, null when none or gone). */
    for (const s of this.#capture.liveCaptureSessions(nowIso)) {
      const r = { ...s, primary_sha: s.primarySha };
      const home = this.#provenance.homeOf(r.primary_sha);
      const bundleId = home ? home.bundleId : null;
      /* REC-30: a condition about a bundle this viewer may not see is withheld
         WHOLE and with no count. The count is the leak. */
      if (bundleId && redact(bundleId) === null) continue;
      let outstanding = null, discovered = null, spent = null, parsed = true;
      const st = r.state;
      if (st && typeof st === "object") {
        outstanding = Array.isArray(st.queue) ? st.queue.length : null;
        discovered = Number.isFinite(st.discovered) ? st.discovered : null;
        spent = Number.isFinite(st.spent) ? st.spent : null;
      } else parsed = false;
      const createdMs = Date.parse(r.created);
      out.push({
        id: `CONDITION::partial-capture-outstanding::${r.session}`,
        class: "CONDITION",
        kind: "partial-capture-outstanding",
        case: this.#conditionHomes(bundleId ? [bundleId] : [], viewer),
        subject: bundleId
          ? { kind: "bundle", id: bundleId, capture_sha: r.primary_sha, locator: r.locator }
          : { kind: "capture", id: null, capture_sha: r.primary_sha, locator: r.locator },
        summary: `the capture of ${r.locator} did not finish: support material is still outstanding`,
        detail: "the primary document is captured and its bytes are in the store; the platform's "
              + "subrequest ceiling was reached before its support material was fetched, and the "
              + `remainder is parked for another tick (tick ${r.ticks}, expires ${r.expires}).`,
        basis: { source: "capture_sessions", session: r.session, locator: r.locator,
                 primary_sha: r.primary_sha, bundle_id: bundleId, ticks: r.ticks,
                 created: r.created, updated: r.updated, expires: r.expires,
                 outstanding: parsed ? outstanding : null,
                 discovered: parsed ? discovered : null, spent: parsed ? spent : null,
                 state_readable: parsed,
                 detail: "the ledger is SCRATCH and not record: it names a work list with an expiry, "
                       + "the primary capture is complete from the first tick, and the row is dropped "
                       + "by the capture path itself when nothing is left. It therefore clears for "
                       + "every member when the capture finishes or the session expires." },
        age: Number.isFinite(createdMs)
          ? { state: "determined", since: r.created, ms: Math.max(0, now - createdMs) }
          : { state: "undetermined", reason: "unparseable_created",
              detail: "the session row carries a created stamp this producer cannot read as an instant" },
        assignee: null,
        assignee_role: null,
        options: bundleId ? this.#queueOptions([bundleId], viewer, identity) : [],
      });
    }
    return out;
  }

  /** `capture-completed-unattended` (D-61, closed by REC-2).
   *
   *  THE FACT IS THE MANIFEST'S OWN, and REC-2 is what made it exist. Before
   *  REC-2 an unattended writer could not take a lease at all, so a daemon
   *  could not finish a capture a member walked away from; REC-2's answer was a
   *  NAMED machine actor, `token:<class>`, stamped by the control plane with the
   *  caller's own value deleted first. That stamp lands on `manifest.author`,
   *  and it is the only durable trace of an unattended write anywhere in this
   *  store.
   *
   *  THE CONDITION IS THE SEQUENCE, NOT THE STAMP. A document written only ever
   *  by a machine was never walked away from by anybody — the whole intake path
   *  runs on a machine credential. What D-61 describes is a PERSON's document
   *  finished by a daemon, so the test is: the LATEST snapshot was machine
   *  written, and an EARLIER one was authored by a person. Both halves are
   *  required and the basis names both.
   *
   *  IT RESOLVES WHEN THE MEMBER COMES BACK — that is, when a person authors the
   *  document again and the latest snapshot is theirs. Shared, like every other
   *  condition here, because it is a property of the manifest and not of a
   *  reader.
   *
   *  ORDERING. `created` is the DOCUMENT's own time (promote records
   *  meta.last_updated, never the wall clock — C-12.1 depends on that). The
   *  tiebreak is `rowid DESC`, the store's own write order, because `snap_key`
   *  is an opaque caller-chosen string and its lexical order is not a clock: two
   *  snapshots stamped at the same instant would otherwise be ordered by a hash.
   *  #revisionKind reads the latest manifest entry by this SAME order since
   *  D-171 (it tiebroke on `snap_key DESC` until then, and named the wrong
   *  writer on a tie); the two sites agree on purpose. */
  #conditionsCaptureUnattended(viewer, now, identity = null) {
    const out = [];
    /* N95: record-core's `manifestByAuthor` (its R53) answers, per held bundle with a machine-written entry, its
       latest entry and its earliest entry by anybody else, in the order described above; which of them this viewer
       sees is membership's to answer (R43, R80). Paged by its cursor to the end, as the walk was whole before. */
    const visible = this.#bundleRedactor(viewer);
    const page = Queue.QUEUE_UNATTENDED_PAGE;
    const found = [];
    for (let after = ""; ;) {
      const r = this.#record.manifestByAuthor({ authorPrefix: Queue.QUEUE_MACHINE_AUTHOR_PREFIX, after, limit: page });
      for (const b of r.bundles) if (visible(b.bundleId) !== null) found.push(b);
      if (!r.cursor || r.bundles.length < page) break;
      after = r.cursor;
    }
    for (const m of found) {
      const b = { bundle_id: m.bundleId };
      const latest = m.latest ? { ...m.latest, snap_key: m.latest.snapKey } : null;
      if (!latest || !String(latest.author || "").startsWith(Queue.QUEUE_MACHINE_AUTHOR_PREFIX))
        continue;                       // a person wrote last: the member came back
      const started = m.firstOther ? { ...m.firstOther, snap_key: m.firstOther.snapKey } : null;
      if (!started) continue;           // never a person's document: nobody walked away
      const createdMs = Date.parse(latest.created);
      const title = this.#record.bundleInfo(b.bundle_id);
      out.push({
        id: `CONDITION::capture-completed-unattended::${b.bundle_id}`,
        class: "CONDITION",
        kind: "capture-completed-unattended",
        case: this.#conditionHomes([b.bundle_id], viewer),
        subject: { kind: "bundle", id: b.bundle_id },
        summary: `${title && title.title ? title.title : b.bundle_id} was completed by an unattended `
               + `writer after ${started.author} left it`,
        detail: `${started.author} authored this document and an unattended writer (${latest.author}) `
              + "wrote the most recent revision, which is the shape D-61 describes: a capture a member "
              + "walked away from has completed. Nothing is claimed about whether the result is right.",
        basis: { source: "manifest", bundle_id: b.bundle_id,
                 completed_by: latest.author, completed_snap_key: latest.snap_key,
                 completed_created: latest.created, completed_kind: latest.kind,
                 writer: latest.writer ?? null, operation: latest.operation ?? null,
                 started_by: started.author, started_snap_key: started.snap_key,
                 started_created: started.created,
                 detail: "the machine writer is NAMED, never anonymous: index.mjs deletes any "
                       + "caller-supplied author and stamps token:<class> for a machine credential "
                       + "(REC-2, closing D-61), so this is the record's own trace of an unattended "
                       + "write and not an inference. It clears for every member when a person "
                       + "authors the document again." },
        age: Number.isFinite(createdMs)
          ? { state: "determined", since: latest.created, ms: Math.max(0, now - createdMs) }
          : { state: "undetermined", reason: "unparseable_created",
              detail: "the manifest entry carries a created stamp this producer cannot read as an instant" },
        assignee: null,
        assignee_role: null,
        options: this.#queueOptions([b.bundle_id], viewer, identity),
      });
    }
    return out;
  }

  /** `capture-completed-unattended` (D-61) — ITS SECOND PRODUCER, and PL-4's
   *  completion notification.
   *
   *  THE DESIGN SAYS *"extend the subscriber, do not invent a channel"* (§4, on
   *  the pursue session waiting on a capture), and this is that: the SAME
   *  catalogued kind, the same class, a different subject and a different basis.
   *  A second producer for one kind is not novel — `C-27.13` has two, and PL-3's
   *  own control arm 6 turns on the distinction.
   *
   *  WHY THE FIRST PRODUCER CANNOT COVER THIS CASE, stated rather than left to
   *  be discovered. `#conditionsCaptureUnattended` requires an EARLIER manifest
   *  entry authored by a PERSON — its whole condition is "a person's document
   *  finished by a daemon". A requested capture was never a person's document:
   *  the run asked for a URL nobody had captured. So the walk finds no `started`
   *  row and correctly emits nothing, and the member waiting on this capture
   *  would be told nothing at all.
   *
   *  WHAT IT NAMES: BOTH PRINCIPALS, through the one composer the drain used. A
   *  row whose attribution cannot be composed emits NO ITEM — a notification
   *  that could not say whose act it was would be the defect DEC-27(b) names,
   *  surfaced to a member.
   *
   *  RECORDED FOR THE NEXT READER: the plan row and INVESTIGATIVE-SESSION.md §4
   *  both call this "the existing FINDING-class slug". IT IS NOT ONE.
   *  `queuestate.mjs` has classed `capture-completed-unattended` as a CONDITION
   *  since REC-32 and has a live producer for it. It is built here as the
   *  CONDITION it actually is rather than reclassified to match the prose: a
   *  kind's class decides whether leaving the list is a personal mute or an
   *  authored record act (D-125, DEC-16), and moving one to match a sentence in
   *  a plan would be changing doctrine to fix a citation. The discrepancy is
   *  reported rather than silently absorbed. */
  #conditionsCaptureRequested(viewer, now, identity = null) {
    const out = [];
    for (const r of this.#captureRequests.completed({ viewer }).requests) {
      const attribution = r.attribution;
      /* DEFENCE IN DEPTH, AND STATED AS SUCH RATHER THAN CLAIMED AS A CONTROL.
         The drain refuses to capture a row it cannot attribute, so no `captured`
         row reaching this walk can fail the composer today and this `continue`
         is UNDRIVABLE. It stays because this is a READ over stored rows, which
         outlive the rules that wrote them, and a member-facing item that could
         not say whose act it announces is DEC-27(b)'s defect surfaced to a
         person. It mints no DEC-49 code, which is why it is kept where the two
         undrivable CODES this item found were removed: an unreachable branch
         costs a reader a moment, an unreachable code costs the whole family its
         floor. */
      if (!attribution.ok) continue;
      const capturedMs = Date.parse(r.captured_at);
      out.push({
        id: `CONDITION::capture-completed-unattended::${r.request}`,
        class: "CONDITION",
        kind: "capture-completed-unattended",
        case: this.#conditionHomes([r.target], viewer),
        subject: { kind: "capture_request", id: r.request },
        summary: `${r.address} was captured by the daemon at the investigative session's request`,
        detail: `${attribution.statement}. The capture is an entry of a document to the store and NOT `
              + "an entry of that document into the leg of a claim: it lands at 'collected' and never "
              + "higher, and nothing about the record's conclusions has moved.",
        basis: { source: "capture_requests", request: r.request, run: r.run, inquiry: r.target,
                 address: r.address, host: r.host, purpose: r.purpose, ua_mode: r.ua_mode,
                 capture_sha: r.capture_sha, captured_at: r.captured_at,
                 attribution,
                 detail: "BOTH PRINCIPALS ARE NAMED (DEC-27(b), DEC-55.4): the act is the daemon's, "
                       + "performed at the session's request, under the plane credential the run holds "
                       + "and paid for by the level of the Claude-account cascade the run named. Never a "
                       + "token value, and never a person's name on the act itself." },
        age: Number.isFinite(capturedMs)
          ? { state: "determined", since: r.captured_at, ms: Math.max(0, now - capturedMs) }
          : { state: "undetermined", reason: "unparseable_captured_at",
              detail: "the request row carries a completion stamp this producer cannot read as an instant" },
        assignee: null,
        assignee_role: null,
        options: this.#queueOptions([r.target], viewer, identity),
      });
    }
    return out;
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
               detail: "the request records no capture digest, so there is no document to ask about. "
                     + "That this producer could not look is a different fact from the document being "
                     + "part of nothing, and it is reported as the first rather than the second." };
    const home = this.#provenance.homeOf(sha);
    const reg = home ? { bundle_id: home.bundleId } : null;
    if (!reg)
      return { state: "undetermined", reason: "unregistered_capture", bundle_id: null, bundle_state: null,
               basis_legs: null, version_legs: null,
               detail: "no register entry answers to this capture, so the bytes are not attached to a "
                     + "document this store can name and there is nothing whose place in a case could "
                     + "be asked. Undetermined, and STATED (D-9/D-45's unbacked-register shape)." };
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
        ? "LOOKED FOR AND NOT THERE, which is the point of this item rather than an omission. The "
        + "document was CAPTURED — an entry to the store — and no leg of any inquiry's basis and no "
        + "leg of any proposed reading points at it (DEC-60, D-213). It was NOT made part of the "
        + "case, which is a different sentence from nobody having read it, and this producer counted "
        + "both basis projections to be able to say which."
        : "this document IS carried by a reading of some question, so the lead has already been acted "
        + "on or the document was evidence before the lead was raised. Reported rather than "
        + "suppressed: the item is still the record of an observation somebody made.",
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
  #findingsOutOfInquiryLead(viewer, now, identity = null) {
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
        case: this.#queueAncestors([r.lead_inquiry], viewer),
        subject: { kind: "capture_request", id: r.request,
                   inquiry: r.lead_inquiry, address: r.address,
                   capture_sha: r.capture_sha ?? null,
                   bundle_id: basisEntry.bundle_id },
        summary: `evidence bearing on ${leadTitle && leadTitle.title ? leadTitle.title : r.lead_inquiry} `
               + `was met while another question was being worked, and captured`,
        detail: `${r.address} was captured at an investigative session's request while it was working `
              + `${r.target}, because it bears on ${r.lead_inquiry}. ${attribution.statement}. `
              + "The document is IN THE STORE and is part of NO claim: it was captured, which is an "
              + "entry to the cache, and it was deliberately not made part of any question's basis. "
              + "Nothing about any conclusion has moved, and nothing here is evidence until somebody "
              + "decides it is.",
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
          detail: "BOTH PRINCIPALS ARE NAMED (DEC-27(b), DEC-55.4) and BOTH QUESTIONS ARE NAMED "
                + "(D-213): the act is the daemon's, performed at the session's request, and the "
                + "session was working one question when it met evidence for another. The absence of "
                + "a basis entry is MEASURED and reported on `basis_entry` rather than left to be "
                + "inferred from an empty field — absence at one level is not evidence of absence at "
                + "the next, and which one is true is the answer, not a footnote (CLAUDE.md).",
        },
        age: Number.isFinite(capturedMs)
          ? { state: "determined", since: r.captured_at, ms: Math.max(0, now - capturedMs) }
          : { state: "undetermined", reason: "unparseable_captured_at",
              detail: "the request row carries a completion stamp this producer cannot read as an instant" },
        assignee: null,
        assignee_role: null,
        /* R18 (REC-202): THE INQUIRY-GRAIN ACTS ON INQUIRY B, which D-213 named and D-222's grain problem held back:
           take it up (cite the captured document into B, op=cite) and set it aside (the project-scoped disposition,
           R27). The set-aside is added at the mint, where the item's disposition is known, and only when that
           disposition is available: no item offers an act its op would refuse NO_PROJECT_SCOPE. */
        options: [Queue.LEAD_TAKE_UP],
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
   *  `#hiddenBundles(viewer)` is the ONE set of bundles the caller's own
   *  `viewerPredicate` does not pass, spelled once and read here as a set —
   *  `NOT IN`, an indexed subtraction SQLite materialises once per statement,
   *  never the per-row correlated gate the old paragraph rightly refused. Who
   *  is filtered is the gate's word, inherited rather than restated: a
   *  credential the gate does not filter (scope `member`) and an enrolled
   *  administrator get `hid` = nothing and the read they always got, and a
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
    const cap = Queue.QUEUE_SHARED_INQUIRIES_MAX;
    const hid = this.#hiddenBundles(viewer);
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

  /** THE TWO BOUNDS THESE PRODUCERS WALK UNDER, AND THEY EXIST BECAUSE THE
   *  BATTERY REFUSED THE UNBOUNDED VERSION RATHER THAN BECAUSE ANYONE PREDICTED
   *  IT. `derivation-bounds.test.mjs` holds a CEILING on how many methods derive
   *  over an unbounded scan — a class of defect this record has paid for (D-227,
   *  REC-66) — and the first draft of both producers walked straight into it:
   *  an unbounded read of `refs` with per-row work inside the loop.
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
   *  It is also the VIEWER gate for the subject. `#queueAncestors` and
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
   *  IT. `#queueAncestorEdges` walks `refs kind='cites'` upward, so the homes of
   *  an item about a shared question ARE the projects sharing it — both sides
   *  of the divergence, by the same walk every other producer uses. That is the
   *  point: an item only the diverging team could see would tell the one team
   *  that already knows.
   *
   *  `elsewhere` IS ENUMERATED AND NEVER SUMMARISED TO A COUNT. A member needs
   *  to know WHICH reading the other team is on to decide whether the
   *  difference matters, and "2 projects differ" is the shape that reads as
   *  disagreement when it may be one project that simply has not caught up. */
  #findingsStanceDiverged(viewer, now, identity = null) {
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
          case: this.#queueAncestors([inq], viewer),
          subject: { kind: "project_stance", id: p.id, inquiry: inq,
                     version: p.current.version },
          summary: `${p.title || p.id} stands on reading '${p.current.version}' of ${qname}, `
                 + `and ${elsewhere.length === 1 ? "the other project drawing on it does" : "the other projects drawing on it do"} not`,
          detail: `${qname} is drawn on by ${drawing.length} projects and holds NO stance of its own: `
                + `what a project stands on is that project's own dated, authored property (§7), so `
                + `this difference is a legal state and nothing in this record refuses it. `
                + `${p.id} named '${p.current.version}'${p.current.at ? ` on ${p.current.at}` : ""}`
                + `${p.current.by ? ` (${p.current.by})` : ""}. `
                + `Nothing here has moved anybody else's stance and nothing here will: this is a `
                + `report, and moving another project's pointer is that project's own act.`,
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
              detail: "this feed examines a bounded number of shared questions per read and a "
                    + "bounded number of projects per question. Where either is truncated the "
                    + "divergence reported is a FLOOR: the projects named do stand where this says, "
                    + "and the read did not reach every one that might. A divergence over a "
                    + "truncated set is still true; an ABSENCE of one over a truncated set is not, "
                    + "which is why the flags are published rather than the counts alone.",
            },
            /* THE SHAPE OF THE POINTER, PUBLISHED ON THE ITEM. §7's field is a
               project-authored DATED frontmatter row and NEVER a settings row,
               and this producer read it as one — so a member (and a suite) can
               see from the notification itself where the fact came from,
               instead of taking the sentence's word for it. */
            pointer: { kind: "dated_frontmatter_field", field: "current_versions",
                       held_by: "the project's own bundle.md", settings_row: false,
                       detail: "DEC-17's reasoning: a settings row would be a way to change the "
                             + "standard with nothing to read afterwards. Every stance named here "
                             + "was read out of a project's own promoted bytes, where the act that "
                             + "wrote it is in the append-only history beside it." },
            detail: "D-216 measured this model rather than assuming it (2026-08-08): two projects "
                  + "were driven onto two different readings of one shared question SIMULTANEOUSLY, "
                  + "the plane refused neither, and after divergence each still saw every version "
                  + "and every leg of the other's. The sharing is real and the stance is not shared "
                  + "— which is why this item exists at all.",
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
          options: this.#queueOptions([inq], viewer, identity),
          options_grain: {
            offered: "document",
            missing: "stance",
            detail: "the natural acts here are at STANCE grain — move to the reading the others are "
                  + "on, or record why we are staying — and the first of those is op=versioncurrent "
                  + "on THIS project and nobody else's. It is deliberately not offered as an option "
                  + "on an item another project's members can also see: an act one team performs "
                  + "from a notification another team is reading is the single shared stance §7 "
                  + "rejected, arriving through a button (D-222's grain problem).",
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
   *  `test/current.test.mjs` (a run-less version produces NO item, driven), and
   *  raised as **D-266** so it is a known hole with a name rather than a
   *  surprise for whoever next reads this feed.
   *
   *  THE SOURCE PROJECT IS REMOVED FROM ITS OWN ITEM'S HOMES, and this is the
   *  one place this file filters a walk's result. `#queueAncestors([inquiry])`
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
  #findingsVersionFromAnotherTeam(viewer, now, identity = null) {
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
      const held = this.#basisVersions.basisVersions({ id: inq, limit: Queue.QUEUE_SHARED_VERSIONS_READ, viewer });
      const heldVersions = held && held.ok !== false && Array.isArray(held.versions) ? held.versions : [];
      {
        const n = heldVersions.filter((v) => !(typeof v.run === "string" && v.run)).length;
        if (n > 0) { unattributed += n; if (!unattributedIn.includes(inq)) unattributedIn.push(inq); }
      }
      /* BOUNDED, for the reason the two bounds above are: a per-question read
         with per-row work inside it is the amplification class the battery's
         ceiling refuses. One more than may be used, so the truncation is a fact
         rather than an inference. */
      const vcap = Queue.QUEUE_SHARED_VERSIONS_MAX;
      const vrows = heldVersions.filter((v) => typeof v.run === "string" && v.run)
        .map((v) => ({ name: v.name, description: v.description ?? null, state: v.state, hidden: v.hidden ? 1 : 0,
                       author: v.author ?? null, at: v.at ?? null, run: v.run }));
      const vtrunc = vrows.length > vcap || held.truncated === true;
      for (const v of vrows.slice(0, vcap)) {
        /* A MEMBERSHIP TEST, NOT A PROJECTION — and `run-conditions.test.mjs`'s
           sweep is why it is written this way rather than as the obvious
           `SELECT context_type, context_id`.

           REC-74 holds every reader of `ai_runs` to a declared ROLE, and a
           reader that PROJECTS a stored column of that table owes a disposition
           for all twenty of them. This producer does not want a run's facts: it
           wants to know WHICH OF THE PROJECTS IT HAS ALREADY NAMED the reading
           came from. So the match happens IN THE PREDICATE and the projection is
           the row's own primary key and nothing else — `from_project` below is
           `p.id`, which came from `refs` and from the project's own frontmatter,
           never a value read off this table.

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
        const homes = this.#queueAncestors([inq], viewer);
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
                         detail: "the project this reading was proposed under is not a team it "
                               + "arrived FROM, so this item is not filed under it. Stated rather "
                               + "than performed silently: a home set that is quietly shorter is "
                               + "indistinguishable from nobody caring (DEC-16)." }],
          },
          subject: { kind: "basis_version", id: `${inq}::${v.name}`,
                     inquiry: inq, version: v.name },
          summary: `a new reading of ${qname} — '${v.name}' — was proposed under `
                 + `${srcRow && srcRow.title ? srcRow.title : src}'s work`,
          detail: `${qname} is drawn on by ${drawing.length} projects. '${v.name}' was proposed by a `
                + `run working under ${src}${v.author ? `, authored ${v.author}` : ""}`
                + `${v.at ? ` on ${v.at}` : ""}, and it is currently ${v.state}`
                + `${v.hidden === 1 ? " and hidden from that project's display" : ""}. `
                + `Nothing about what this project stands on has moved: a reading arriving is not a `
                + `reading being adopted, and the stance is a per-project act somebody here would `
                + `have to take (§7).`,
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
              detail: "this feed examines a bounded number of shared questions per read, a bounded "
                    + "number of projects per question and a bounded number of run-proposed readings "
                    + "per question. A truncation here means READINGS THIS READ DID NOT REACH, never "
                    + "readings that do not exist — the arrival of this one is unaffected by it, and "
                    + "the flag is published so the silence about any other cannot be read as "
                    + "evidence there is none.",
            },
            team_attribution: {
              state: "determined", via: "ai_runs.context",
              detail: "the source team is the RUN's own context project, a fact stored when the run "
                    + "was opened. It is never inferred from who authored the version: a member "
                    + "does not name a team in this record, and a producer that guessed one would "
                    + "be manufacturing the connection the notification is claiming attention for. "
                    + "A version with no run, or a run whose context is not a project, mints NO "
                    + "item — the silence is a declared gap (D-266), not a filtered one.",
            },
            detail: "D-216 measured that one question sits beneath several projects and that each "
                  + "reads the whole version set (2026-08-08): after two projects diverged, each "
                  + "still saw every version and every leg of the other's. So this item announces "
                  + "an arrival, not a disclosure — the reading was already readable here, and what "
                  + "was missing was anybody being told it had appeared.",
          },
          age: Number.isFinite(arrivedMs)
            ? { state: "determined", since: v.at, ms: Math.max(0, now - arrivedMs) }
            : { state: "undetermined", reason: "unparseable_version_date",
                detail: "the version row carries no authored instant this producer can read, so how "
                      + "long this reading has been standing unanswered is undetermined" },
          assignee: null,
          assignee_role: null,
          options: this.#queueOptions([inq], viewer, identity),
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
        const homes = this.#queueAncestors([inq], viewer);
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
          detail: `${qname} is drawn on by ${drawing.length} projects. ${p.id} concluded it on reading `
                + `'${c.version}'${c.by ? ` (${c.by})` : ""}${c.at ? ` on ${c.at}` : ""}, adopting that `
                + `reading's claim. A conclusion belongs to the project that drew it (§7.1): NOTHING `
                + `about what any other project stands on or has concluded has moved, and nothing here `
                + `will move it — this is a report, and concluding is each project's own act.`,
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
              detail: "a bounded number of shared questions and of projects per question are read. A "
                    + "conclusion reported over a truncated set is still true; an ABSENCE over one is "
                    + "not, which is why the flags are published.",
            },
          },
          age: Number.isFinite(atMs)
            ? { state: "determined", since: c.at, ms: Math.max(0, now - atMs) }
            : { state: "undetermined", reason: "unparseable_conclusion_date",
                detail: "the conclusion row carries no authored instant this producer can read" },
          assignee: null,
          assignee_role: null,
          options: this.#queueOptions([inq], viewer),
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
    const cap = Queue.EXPORT_LOG_LIMIT_DEFAULT;
    const log = this.#publication.exportLog({ limit: cap });
    const page = log && Array.isArray(log.exports) ? log.exports : [];
    if (page.length === 0) return [];
    const truncated = log.truncated === true;
    const raisedTo = this.#activeAdmins();
    const homes = this.#queueAncestors([], viewer);
    return page.map((r) => {
      const atMs = Date.parse(r.at ?? "");
      return {
        id: `FINDING::export-performed::${r.seq}`,
        class: "FINDING",
        kind: "export-performed",
        catalogue_id: catalogueIdOf("export-performed"),
        case: homes,
        subject: { kind: "export", id: `export_log:${r.seq}`, seq: r.seq },
        summary: `A full ${r.scope} export was taken on ${r.at}: ${r.bundles} bundles, ${r.files} files`,
        detail: `An export of the ${r.scope} left this instance with the root-of-trust credential `
              + `(Membership v2 §8.1). It is row ${r.seq} of the append-only export log`
              + (r.note ? `, noted "${r.note}"` : ", with no note") + `. Every administrator is told; `
              + `nobody else is. The log is the record of it and nothing here changes the log.`,
        basis: {
          source: "export_log",
          seq: r.seq, at: r.at, scope: r.scope, bundles: r.bundles, files: r.files, note: r.note ?? null,
          raised_to: raisedTo,
          bounds: { limit: cap, truncated,
                    detail: "the newest exports are read up to this bound. An export past it is still "
                          + "in the log (op=exportlog, with a larger limit) and is not told here." },
          detail: "an export of the working corpus is recorded in the append-only export log and every "
                + "administrator is notified (Membership v2 §8.1). This notice is derived from that log "
                + "row and reaches every administrator named in raised_to and no one else. No act "
                + "clears it yet: a disposition is scoped to a project and an export has none, and a "
                + "member's own mute of a finding (D-125) is ruled but not built.",
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
        options: [{ id: "exportlog", label: "Read the export log", weight: "single" }],
      };
    });
  }

  /* ======================================================================
   * N172, N229 — THE PRODUCERS THE CATALOGUE NAMED WITHOUT ONE (R1, R9, R10).
   *
   * Each reads the fact its owning module already offers and restates none of it: reevaluation's open notices (its
   * R14), intent's gaps (its R6), monitoring's plan (its R32), its flagged documents (its R48) and the addresses its
   * next archive tick would find eligible (its R47; N330). Each is derived on read and writes nothing, like every producer above it, and each
   * is bounded, the bound stated where a member could otherwise read a short list as a complete one.
   * ====================================================================== */

  /** A home set made of the named cases themselves (each at depth 0, when this viewer sees it and it is a case) and
   *  every ancestor above them (R7): for an item that is ABOUT a case rather than about a document under one. */
  #homesAt(caseIds, viewer) {
    const up = this.#queueAncestors(caseIds, viewer);
    const gate = viewerPredicate(viewer);
    const own = [];
    for (const id of [...new Set((caseIds || []).filter((x) => typeof x === "string" && x))]) {
      const row = this.#one(
        `SELECT b.bundle_id, b.object_type, b.current_state, b.title FROM bundles b
          WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
      if (!row) continue;
      const ty = normalizeType(row.object_type);
      if (!Queue.QUEUE_CASE_TYPES.includes(ty)) continue;
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
   *  (`versionadopt`, `versionkeep`), published on its disposition (R12). At most one page of notices is read. */
  #findingsNewerCapture(viewer, now, identity = null) {
    const page = this.#reevaluation.notices({ state: "open", viewer, limit: Queue.QUEUE_NOTICES_MAX });
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
        summary: `a newer version of ${n.target || "a document"} may change the passage ${n.holder} relies on`,
        detail: `a newer capture of what this reference is pinned to was read as ${n.grade ?? "undetermined"}`
              + `${n.affects ? ` (${n.affects})` : ""}. Nothing about the reference has moved: it stays on the version `
              + "it names until the member who holds it adopts the newer one or keeps the earlier one.",
        basis: { source: "reevaluation.notices", notice: n.notice, holder: n.holder, target: n.target ?? null,
                 grade: n.grade ?? null, affects: n.affects ?? null, raised_at: n.raised_at ?? null,
                 bound: { limit: page.limit ?? Queue.QUEUE_NOTICES_MAX, truncated: page.truncated === true },
                 detail: "a notice is reevaluation's (its R14): raised when a newer capture of what a reference is "
                       + "pinned to is graded affected or undetermined, never for A or B. It is read here, never "
                       + "raised, and it closes only by the holder's adoption or keeping (its R15)." },
        age: Number.isFinite(raisedMs)
          ? { state: "determined", since: n.raised_at, ms: Math.max(0, now - raisedMs) }
          : { state: "undetermined", reason: "unparseable_raised_at",
              detail: "the notice carries no raised instant this producer can read" },
        assignee: null,
        assignee_role: null,
        options: this.#queueOptions([n.holder], viewer, identity),
      });
    }
    return out;
  }

  /** The projects `objective-gap` asks intent about (N172): those this viewer sees in which the member participates
   *  (joined or leaving; membership R74), or every visible project when there is no member, in id order, at most
   *  QUEUE_OBJECTIVE_GAP_PROJECTS; `truncated` when a further one qualifies. */
  #objectiveGapProjects(me, viewer) {
    const cap = Queue.QUEUE_OBJECTIVE_GAP_PROJECTS;
    const gate = viewerPredicate(viewer);
    const out = [];
    let after = "", truncated = false;
    for (;;) {
      const rows = this.#rows(
        `SELECT b.bundle_id FROM bundles b WHERE b.object_type='project' AND b.bundle_id > ? AND (${gate.sql})
          ORDER BY b.bundle_id LIMIT ?`, after, ...gate.args, Queue.QUEUE_OBJECTIVE_GAP_PAGE);
      for (const r of rows) {
        const p = me ? this.#membership.participation(r.bundle_id, me) : null;
        if (me && !(p && (p.state === "joined" || p.state === "leaving"))) continue;
        if (out.length === cap) { truncated = true; break; }
        out.push(r.bundle_id);
      }
      if (truncated || rows.length < Queue.QUEUE_OBJECTIVE_GAP_PAGE) break;
      after = rows[rows.length - 1].bundle_id;
    }
    return { projects: out, bound: cap, truncated };
  }

  /** `objective-gap` (N172; intent R6): one FINDING per gap intent answers for each project `#objectiveGapProjects`
   *  names, homed under its project. A gap is a proposal intent derives on read; it is read here and never restated. */
  #findingsObjectiveGap(me, viewer, now, identity = null) {
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
            ? `an instance this project's objective counts is short of the stages ${b.stages_missing.join(", ")}.`
            : `an instance this project's objective counts reaches ${b.grade_reached ?? "an undetermined grade"} `
              + `where ${b.grade_required ?? "a grade"} is required.`,
          basis: { source: "intent.gaps", key: gap.key, project, progression: b.progression ?? null,
                   entity: b.entity ?? null, grade: gap.grade ?? null, instances: gap.instances ?? [],
                   gap: b, surfaced_by: gap.surfaced_by ?? "machine",
                   detail: "a gap is DERIVED (intent R6): the objective's satisfaction condition read against the "
                         + "record, recomputed at every read. It leaves this project's list by a recorded decision." },
          age: { state: "undetermined", reason: "derived_on_read",
                 detail: "a gap is recomputed at read time and has no creation instant" },
          assignee: null,
          assignee_role: null,
          options: this.#queueOptions([project], viewer, identity),
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
  #findingsSourceFlagged(viewer, now, identity = null) {
    const page = this.#monitoring.flagged({ viewer }) || {};
    const list = page.ok !== false && Array.isArray(page.items) ? page.items : [];
    const out = [];
    for (const r of list) {
      const id = r && typeof r.bundleId === "string" && r.bundleId ? r.bundleId : null;
      if (!id) continue;
      const removed = r.source_status === "removed";
      const kind = removed ? "source-removed" : "source-modified";
      const sinceMs = Date.parse(r.since ?? "");
      const title = this.#record.bundleInfo(id);
      const name = title && title.title ? title.title : id;
      out.push({
        id: `FINDING::${kind}::${id}`,
        class: "FINDING",
        kind,
        case: this.#queueAncestors([id], viewer),
        subject: { kind: "bundle", id },
        summary: removed ? `the source of ${name} no longer serves it` : `the source of ${name} has changed`,
        detail: `a monitoring check found the address this document was captured from ${removed
                ? "answering that it is gone (404 or 410)" : "serving something other than what was captured"}, `
              + "and flagged it for a second look. What the change means is not decided here.",
        basis: { source: "monitoring.flagged", bundle_id: id, source_status: r.source_status ?? null,
                 since: r.since ?? null,
                 bound: { limit: page.limit ?? null, truncated: page.truncated === true },
                 detail: "monitoring's tick records what it saw and never decides what a change means (its R8): "
                       + "this item is that flag, as monitoring reads it (its R48)." },
        age: Number.isFinite(sinceMs)
          ? { state: "determined", since: r.since, ms: Math.max(0, now - sinceMs) }
          : { state: "undetermined", reason: "unparseable_since",
              detail: "the flag carries no instant this producer can read" },
        assignee: null,
        assignee_role: null,
        options: this.#queueOptions([id], viewer, identity),
      });
    }
    return out;
  }

  /** The documents captured at one address (provenance R48's read contract), viewer-gated and bounded as
   *  `#conditionBundlesForHost` is. */
  #conditionBundlesForAddress(addressNorm, viewer) {
    const cap = Queue.QUEUE_CONDITION_SUBJECTS_MAX;
    const seen = this.#bundleGate("r.bundle_id", viewer);
    const ids = this.#rows(
      `SELECT DISTINCT r.bundle_id FROM captured_locators cl JOIN register r ON r.capture_sha = cl.capture_sha
        WHERE cl.address_norm = ? AND (${seen.sql}) ORDER BY r.bundle_id LIMIT ?`,
      addressNorm, ...seen.args, cap + 1).map((r) => r.bundle_id);
    return { ids: ids.slice(0, cap), bounded: ids.length > cap };
  }

  /** `archive-fallback-eligible` (N229, N330; monitoring R47; capture R8): one CONDITION per address
   *  `monitoring.archiveEligible` answers, what the next archive tick would find eligible (K406 Q2), asked as the tick
   *  asks and writing nothing. Its bound, whether it cut, and the daemon's pause are published on each item: a pause
   *  never empties the list, since eligibility is capture's fact about our attempts. */
  #conditionsArchiveEligible(viewer, now, identity = null) {
    const page = this.#monitoring.archiveEligible(now) || {};
    const list = page.ok !== false && Array.isArray(page.eligible) ? page.eligible : [];
    const out = [];
    for (const r of list) {
      const address = r && typeof r.address === "string" && r.address ? r.address : null;
      if (!address) continue;
      const subj = this.#conditionBundlesForAddress(address, viewer);
      const sinceMs = Date.parse(r.first_failure_since ?? "");
      out.push({
        id: `CONDITION::archive-fallback-eligible::${address}`,
        class: "CONDITION",
        kind: "archive-fallback-eligible",
        case: this.#conditionHomes(subj.ids, viewer, subj.bounded),
        subject: { kind: "address", id: null, address,
                   bundles: subj.ids.slice(0, Queue.QUEUE_OPTION_SUBJECTS_MAX) },
        summary: `${address} has stopped answering often enough that its archived copy may be fetched instead`,
        detail: "our own attempts at this address have failed enough times, for long enough, that the archive "
              + "fallback may fetch a replay in its place. This is a fact about our attempts, not a finding about "
              + "the publisher.",
        basis: { source: "monitoring.archiveEligible", address, reachability: r.reachability ?? null,
                 bound: { limit: page.limit ?? null, truncated: page.truncated === true },
                 paused: page.paused ?? null,
                 detail: "eligibility is capture's rule (its R8), read as the next archive tick would read it "
                       + "(monitoring R47); the tick itself fires the fallback, and this item clears when the address "
                       + "answers again." },
        age: Number.isFinite(sinceMs)
          ? { state: "determined", since: r.first_failure_since, ms: Math.max(0, now - sinceMs) }
          : { state: "undetermined", reason: "no_first_failure",
              detail: "the failing run carries no first-failure instant this producer can read" },
        assignee: null,
        assignee_role: null,
        options: this.#queueOptions(subj.ids, viewer, identity),
      });
    }
    return out;
  }

  /** `monitoring-recheck-due` (N229; monitoring R16, R31, R32): one CONDITION per monitored address monitoring's plan
   *  shows this viewer as overdue by more than its own interval, or unscheduled (no interval can be derived), so a
   *  document that is not being checked is visible. A document never checked is due now and is not yet overdue. */
  #conditionsRecheckDue(viewer, now, identity = null) {
    const plan = this.#monitoring.monitoring({ viewer, now });
    const out = [];
    for (const r of (plan && Array.isArray(plan.items) ? plan.items : [])) {
      const dueMs = r.due_at ? Date.parse(r.due_at) : NaN;
      const overdue = r.state === "due" && Number.isFinite(dueMs) && Number.isFinite(r.interval_ms)
        && now - dueMs > r.interval_ms;
      if (!(overdue || r.state === "unscheduled")) continue;
      const key = r.address || r.bundle;
      out.push({
        id: `CONDITION::monitoring-recheck-due::${key}`,
        class: "CONDITION",
        kind: "monitoring-recheck-due",
        case: this.#conditionHomes([r.bundle], viewer),
        subject: { kind: "address", id: r.bundle, address: r.address ?? null },
        summary: overdue
          ? `${r.address || r.bundle} is overdue for its check by more than its own interval`
          : `${r.address || r.bundle} is monitored and has no check scheduled`,
        detail: overdue
          ? `it was due at ${r.due_at} and is checked every ${Math.round(r.interval_ms / 3600000)} hours; the check `
            + "has not run since. Nothing about the source is claimed here."
          : `no interval can be derived for it (${r.reason || "no reason recorded"}), so no check is scheduled.`,
        basis: { source: "monitoring", state: r.state, bundle: r.bundle, address: r.address ?? null,
                 frequency: r.frequency ?? null, due_at: r.due_at ?? null, interval_ms: r.interval_ms ?? null,
                 reason: r.reason ?? null, truncated: plan.truncated === true,
                 detail: "the plan is monitoring's (its R16, R32); this item is our own machinery falling behind "
                       + "or unable to schedule, and it clears when the check runs or a cadence is set." },
        age: overdue
          ? { state: "determined", since: r.due_at, ms: Math.max(0, now - dueMs) }
          : { state: "undetermined", reason: "unscheduled",
              detail: "an unscheduled address has no instant it fell due" },
        assignee: null,
        assignee_role: null,
        options: this.#queueOptions([r.bundle], viewer, identity),
      });
    }
    return out;
  }

  /** The bounds the new producers read under (R9): reevaluation's largest page; R9's fifty projects. The monitored
   *  documents and the archive addresses are bounded by monitoring's reads (its R47, R48), which publish their bounds. */
  static QUEUE_NOTICES_MAX = 1000;
  static QUEUE_OBJECTIVE_GAP_PROJECTS = 50;
  static QUEUE_OBJECTIVE_GAP_PAGE = 200;

  /* ======================================================================
   * PL-13 — **WHAT IDENTITY A QUEUE ITEM CAN BE DISPOSITIONED ON, ANSWERED BY
   * THE PLANE AND PUBLISHED, INSTEAD OF BEING GUESSED AT A SURFACE.**
   *
   * UI-45 HANDED THIS OVER AND IT IS THE PLANE'S QUESTION. That item found a
   * live defect: `queueEntryControlsHtml` drew Adopt / Defer / Dismiss on EVERY
   * FINDING, while `op=proposedispose` is keyed on (`progression_key`,
   * `stage_key`) and refuses a pair that is not a real stage of a defined
   * progression. So on PL-15's `out-of-inquiry-lead` — whose basis carries
   * neither by design — all three controls could only ever have been refused.
   * UI-45's fix is the right SHAPE and its stated rule is the right rule: *ask
   * what identity the act is keyed on and whether THIS item carries it; do not
   * ask what kind it is.* Inverting rather than lengthening a list is what kept
   * that fix from going stale the day this item minted two new kinds.
   *
   * WHAT WAS STILL WRONG, AND IT IS WHY THIS IS PLANE-SIDE. The SURFACE was
   * answering it, by reaching into the item's `basis` and testing for two field
   * names it had learned from reading the plane's producers. That is a copy of
   * the plane's key living in a renderer — the drift class DEC-8 closed and the
   * one this codebase has paid for repeatedly. The moment a second disposition
   * key exists, or one producer spells the pair on `subject` while another
   * spells it on `basis`, the surface is wrong and nothing fails. **The act's
   * key is the act's own business, so the plane now says, on every item,
   * whether the item can be dispositioned and what the act would be keyed on.**
   *
   * **THE ANSWER TO THE QUESTION ITSELF, STATED PLAINLY: EXACTLY ONE IDENTITY
   * IS DISPOSITIONABLE TODAY — A DEFINED PROGRESSION'S REAL STAGE — AND THAT IS
   * TRUE OF THE CLASS AND NOT OF ANY KIND.** `proposal_dispositions` is keyed
   * `(progression_key, stage_key)`; `proposeDispose` refuses `NO_SUCH_PROGRESSION`
   * and `BAD_STAGE` against the definition tables. So a FINDING-class kind can
   * be dispositioned exactly when its item carries that pair — which today
   * means the two kinds `proposalsFeed` produces and nothing else. The lead
   * cannot. NEITHER OF THIS ITEM'S TWO NEW KINDS CAN, and that is now said out
   * loud on the item rather than discovered by a member clicking a button that
   * was always going to be refused.
   *
   * **WHAT THIS ITEM DELIBERATELY DID NOT DO, AND WHY IT IS NOT COWARDICE.**
   * Widening the act to take a generic item identity is a real option and it is
   * the wrong one to take from here. `proposal_dispositions`' primary key IS
   * the proposal's identity, so widening means a new key shape, a migration,
   * and a decision about what a disposition even MEANS for a kind that is
   * recomputed on every read — a dismissed stance-divergence would have to
   * un-dismiss itself when either project moves again, or it would silence a
   * fact that has since changed. That is D-222's grain problem, it is a
   * doctrine question about what declining means for a derived finding rather
   * than a plumbing question, and it now has a row (**D-266**) instead of a
   * hurried answer. What IS this item's to do is stop the record implying an
   * act it will refuse — and that is what publishing the key does.
   * ====================================================================== */

  /** The identity `op=proposedispose` is keyed on, in ONE place, read by the
   *  publication below. A list of field names rather than a list of kinds: the
   *  kinds change every wave and this pair has not changed since REC-7. */
  static QUEUE_DISPOSITION_KEY = ["progression_key", "stage_key"];

  /** D-266 / IC-60 — THE SECOND IDENTITY, and the whole of what this item added.
   *
   *  **A DISMISSAL IS SCOPED TO THE KEY'S OWN SUBJECT** (the ruling, 2026-08-10,
   *  and like this row's first ruling it was not Bob's because the repository
   *  already answered it). DEC-16's instance-wide clearing is instance-wide
   *  BECAUSE ITS SUBJECT IS: a progression-stage finding is a fact about the
   *  SHARED record, so one act clearing it under every case is DEDUP and not
   *  judgment-suppression. A stance is expressly one project's own property (§7,
   *  D-216), a dismissal is a judgment-layer act, and R5 makes forks at the
   *  judgment layer legitimate — so one team's dismissal of a stance-scoped
   *  finding governs THAT TEAM'S feed and nothing else. That is exactly the
   *  boundary `#findingsStanceDiverged` already enforces by refusing to offer
   *  `op=versioncurrent` across projects, so the two rules never pointed opposite
   *  ways: THEY SCOPE BY SUBJECT.
   *
   *  **THE OTHER KEY WAS DELIBERATELY NOT WIDENED WHILE THIS ONE LANDED**, and
   *  that restraint IS the item rather than caution about it. Widening
   *  `proposal_dispositions`' own primary key to carry a project would have made
   *  a shared-record finding per-project too — erasing the distinction this
   *  whole item exists to draw, in the one edit that would have looked like
   *  finishing the job. */
  static QUEUE_DISPOSITION_KEY_SCOPED = ["project", "finding"];

  /** Does THIS item carry the identity the disposition act is keyed on?
   *
   *  Reads `subject` first and `basis` second because that is the order the
   *  producers write them, and takes the pair from EITHER — a producer that
   *  carried the pair on only one of the two would otherwise be undispositionable
   *  for a reason that is about spelling rather than about identity.
   *
   *  IT REPORTS THE KEY IT WOULD USE, not merely a boolean. A surface that has
   *  the key does not have to reconstruct it from two fields, and a suite can
   *  assert that the published key is the one the act actually accepts — which
   *  is the difference between a claim about the act and a measurement of it. */
  #dispositionOf(item) {
    const KEYED_ON = Queue.QUEUE_DISPOSITION_KEY;
    const SCOPED_ON = Queue.QUEUE_DISPOSITION_KEY_SCOPED;
    const pick = (o, k) => (o && typeof o === "object" && typeof o[k] === "string"
                            && o[k].trim() ? o[k].trim() : null);
    const pk = pick(item.subject, "progression_key") || pick(item.basis, "progression_key");
    const sk = pick(item.subject, "stage_key") || pick(item.basis, "stage_key");
    /* REC-211: the version the act now REQUIRES, taken off the item the producer already stamped
       (`proposalsFeed` writes it onto the subject) and never re-queried here — a second read would be
       a second answer to "which version is current", which is the one thing REC-184 consolidated. A
       number here, so a producer that carried none publishes null rather than a guess. */
    const dv = item.subject && typeof item.subject === "object"
               && Number.isInteger(item.subject.definition_version)
      ? item.subject.definition_version : null;
    const contradiction = this.#contradictionDisposition(item);
    if (contradiction) return contradiction;
    if (item.class === "OBLIGATION")
      /* REC-207: AND `instead` NAMES THE DOOR THIS ITEM ACTUALLY HAS. `op=taskresolve` addresses rows in
         `tasks` by id; a bias-debt obligation is keyed by the RUN it is about and has no task row, so
         every bias-debt item published before this named a door it could not go through — the row's own
         headline. The kind decides, not a list of exceptions to keep in step: a producer whose items are
         resolved somewhere else will need its own answer here and will find this line when it does. */
      return { available: false, op: null, scope: null, keyed_on: KEYED_ON, key: null,
               reason: "an_obligation_is_resolved_not_disposed",
               instead: item.kind === "bias-debt" ? "biasdebtresolve" : "taskresolve",
               detail: "an OBLIGATION is something a named person must do for the record to proceed "
                     + "and it leaves every list when it is RESOLVED (D-125, DEC-16). Disposing of it "
                     + "is not a narrower version of that act, it is a different one."
                     + (item.kind === "bias-debt"
                        ? " This one is a bias debt, which is keyed by the RUN it is about rather than by "
                        + "a task, so it is settled through op=biasdebtresolve with a stated reason — or "
                        + "by a re-run under the lens now in force, or by the lens moving back "
                        + "(BOB #32, 2026-09-23)."
                        : "") };
    if (item.class === "CONDITION")
      return { available: false, op: null, scope: null, keyed_on: KEYED_ON, key: null,
               reason: "a_condition_is_acknowledged_or_muted",
               instead: "queuemute",
               detail: "a CONDITION is a fact about our own machinery, and the only thing a member "
                     + "does to it is acknowledge or MUTE it — personally, with the condition "
                     + "persisting and every other member still seeing it." };
    /* R12 (N172): a newer capture affecting a member's reference is decided by that member through reevaluation's
       door (its R15): adopt the newer version, or keep the earlier one. Keyed on the notice, never on a project. */
    if (item.kind === "newer-capture-affects-reference") {
      const notice = item.subject && typeof item.subject.id === "string" ? item.subject.id : null;
      return { available: notice !== null, op: null, scope: "notice", keyed_on: ["notice"], key: notice,
               notice, acts: ["versionadopt", "versionkeep"], requires: ["notice"],
               detail: "a newer capture of what your reference is pinned to was graded as affecting it or as "
                     + "undetermined, and the choice is yours: adopt the newer version (op=versionadopt, which "
                     + "writes a new version of your reference and keeps the old one readable) or keep the earlier "
                     + "one (op=versionkeep, with an optional why). Either closes this notice." };
    }
    if (pk && sk)
      return { available: true, op: "proposedispose", scope: "instance", keyed_on: KEYED_ON,
               key: `${pk}::${sk}`, progression_key: pk, stage_key: sk,
               /* REC-211 / IC-273: THE ACT ALSO REQUIRES THE VERSION THIS FINDING WAS DERIVED
                  AGAINST, so it is published beside the key rather than left for a surface to go and
                  find. It is NOT part of `keyed_on`: the identity is still the pair, and a decision
                  is one row per pair whatever version it was taken against. Publishing it here is
                  what keeps the sentence below true — an act a member "can actually complete" is one
                  a surface holding this block has every argument for. */
               definition_version: dv,
               requires: ["definitionVersion"],
               detail: "this finding carries the identity the disposition act is keyed on, so Adopt, "
                     + "Defer and Dismiss are acts a member can actually complete. Send "
                     + "`definitionVersion` with the act — the version published here, which is the "
                     + "one this finding was derived against: a decision binds the declared flow the "
                     + "member READ, and one naming a version that has since been revised is refused "
                     + "DEFINITION_MOVED so the member can look again (framework §8.2, REC-211). The "
                     + "act still "
                     + "checks the pair against the definition tables (NO_SUCH_PROGRESSION, "
                     + "BAD_STAGE) — this says the item has an identity, not that the identity is "
                     + "valid, and those are different claims. THE SCOPE IS `instance` AND THAT IS "
                     + "A CLAIM ABOUT THE SUBJECT, NOT A DEFAULT (D-266, DEC-16): a progression "
                     + "stage is a fact about the SHARED record, so one act clears this finding "
                     + "under every case it appears in, which is dedup rather than one team "
                     + "silencing another." };
    /* ==================================================================== D-266
     * THE PROJECT-SCOPED HALF, AND IT IS A PROPERTY RATHER THAN A LIST OF SLUGS.
     *
     * The test is the one UI-45 wrote and PL-13 kept: ask whether THIS item
     * carries the identity the instance-wide act is keyed on, never what kind it
     * is. A finding that carries the pair is a fact about the shared record. A
     * finding that carries NONE is a fact at the JUDGMENT layer — about a
     * document, a question, or what one team stands on — and §7 makes that one
     * project's own property. So it is dispositionable, and the act is keyed on
     * (project, finding) rather than being refused for want of an identity.
     *
     * WHY `key` IS NULL WHILE `available` IS TRUE, and it is the honest answer
     * rather than an omission: the ACTING PROJECT is the member's to name. This
     * item may be filed under several, and a plane that picked one would be
     * choosing which team's judgment the act records — the single shared stance
     * §7 rejected, arriving through a defaulted parameter. `projects` enumerates
     * the candidates and `requires` says what the caller must send.
     *
     * A FINDING FILED UNDER NO PROJECT AT ALL IS A THIRD ANSWER AND IS SAID AS
     * ONE. There is nothing for the dismissal to be scoped TO, so the act is
     * unavailable for a reason that names the missing scope rather than the
     * missing identity — a member reading `no_disposition_identity` there would
     * be told something that is no longer true.
     * ==================================================================== */
    const homes = (item.case && Array.isArray(item.case.ancestors) ? item.case.ancestors : [])
      .filter((a) => a && a.type === "project" && typeof a.id === "string" && a.id.trim())
      .map((a) => a.id.trim())
      .sort();
    const fid = typeof item.id === "string" && item.id.trim() ? item.id.trim() : null;
    /* R46: a side-corrected finding keeps this disposition and names the act that answers it. */
    const acts = item.kind === "side-corrected" ? { acts: ["reevaluationrecord"] } : {};
    if (homes.length === 0 || !fid)
      return { available: false, op: null, scope: "project", keyed_on: SCOPED_ON, key: null,
               finding: fid, projects: [], ...acts,
               reason: "no_project_scope",
               instead: null,
               detail: "this finding carries no progression stage, so a disposition of it is a "
                     + "JUDGMENT-LAYER act and is scoped to one project's feed (D-266, §7/D-216, "
                     + "R5) — and this item is filed under no project this viewer can see, so "
                     + "there is nothing for the decision to be recorded under. That is a bound on "
                     + "the SCOPE and not on the finding's identity: nothing here says the act is "
                     + "meaningless, only that this read found no team whose feed it would govern. "
                     + "WHAT DECLINING MEANS FOR A FINDING RECOMPUTED ON EVERY READ IS NOT OPEN: a "
                     + "disposition is keyed on the finding's STABLE IDENTITY, it stands until it "
                     + "is re-triaged whether or not the fact still fires, and it AGES the finding "
                     + "out of the open list instead of deleting it (D-79)." };
    return { available: true, op: "proposedispose", scope: "project", keyed_on: SCOPED_ON,
             key: null, finding: fid, projects: homes, requires: ["project", "finding"], ...acts,
             detail: "this finding carries no progression stage, and that is what makes its "
                   + "disposition a JUDGMENT-LAYER act rather than a fact about the shared record "
                   + "(D-266's scoping ruling, 2026-08-10: a dismissal is scoped to the key's own "
                   + "subject). "
                   + "A stance is expressly one project's own property (§7, D-216) and R5 makes "
                   + "forks at the judgment layer legitimate, so ONE TEAM'S DISMISSAL GOVERNS THAT "
                   + "TEAM'S FEED AND NOTHING ELSE — the same boundary this feed already enforces "
                   + "by refusing to offer op=versioncurrent across projects. `key` is null "
                   + "DELIBERATELY: the acting project is yours to name, and a plane that defaulted "
                   + "one where this item has several homes would be choosing whose judgment the "
                   + "record carries. Send `project` (one of `projects`) and `finding` beside your "
                   + "disposition and reason. The decision AGES this finding out of your team's "
                   + "open list and stands until it is re-triaged (D-79) — it deletes nothing, and "
                   + "it moves no other team's feed by even one item." };
  }

  /** R46 (N345; DEC-76 item 3, DEC-84 items 2, 3, 7, 13; DEC-85): the doors of the contradiction kinds, or null for any
   *  other kind. What decides them is on the item's `subject`, as the producer names it (`queue-producers` R4, R7): a
   *  candidate's `state` and, once taken up, its `inquiry`; and `parties`, the member's party projects each with
   *  `opted_in`. `contradictionoptin` is offered while one of those has not opted in, and `contradictionrespond` once
   *  one has. A side-corrected item keeps R12's project-scoped disposition and names its act. */
  #contradictionDisposition(item) {
    const s = item.subject && typeof item.subject === "object" ? item.subject : {};
    const parties = Array.isArray(s.parties) ? s.parties.filter((p) => p && typeof p.project === "string") : [];
    const relay = [...(parties.some((p) => p.opted_in !== true) ? ["contradictionoptin"] : []),
                   ...(parties.some((p) => p.opted_in === true) ? ["contradictionrespond"] : [])];
    const candidate = typeof s.id === "string" && s.id.trim() ? s.id.trim() : null;
    const closed = (reason, extra, detail) => ({ available: false, op: null, scope: null,
      keyed_on: Queue.QUEUE_DISPOSITION_KEY, key: null, reason, candidate, ...extra, detail });
    const notSetAside = (acts, detail) => ({ available: false, op: null, scope: "project",
      keyed_on: Queue.QUEUE_DISPOSITION_KEY_SCOPED, key: null, finding: item.id ?? null, projects: [],
      reason: "a_plurality_is_not_set_aside", instead: null, candidate, acts, detail });
    switch (item.kind) {
      case "contradiction-duty": {
        const inquiry = s.state === "taken_up" && typeof s.inquiry === "string" && s.inquiry ? s.inquiry : null;
        const own = inquiry ? "contradictionresolve" : ["contradictionclarify", "contradictiontakeup"];
        return closed("an_obligation_is_resolved_not_disposed",
          { instead: relay.length ? [...[own].flat(), ...relay] : own, ...(inquiry ? { inquiry } : {}) },
          "a conflict the record holds is a duty: it is never muted, dismissed or set aside, and it leaves every "
          + "list only when a member of a project it reaches resolves it, by saying what it turned out to be or by "
          + "taking it up as a question and concluding it (DEC-84 item 2).");
      }
      case "contradiction-duty-unseen":
        return closed("an_obligation_is_resolved_not_disposed", { instead: relay.length ? relay : ["contradictionoptin"] },
          "something this project rests on is in conflict with a record you cannot see. It is never muted: your "
          + "project can ask to resolve it, and once every project holding a side has asked, the projects are named to "
          + "each other and you can respond (DEC-85).");
      case "contradiction-lead":
        return { available: true, op: null, scope: "candidate", keyed_on: ["candidate"], key: candidate, candidate,
                 acts: ["contradictiondismiss", "contradictiontakeup"], requires: ["candidate"],
                 detail: "a lead is the record's uncertainty, not an obligation: a member dismisses it with a reason or "
                       + "takes it up as a question (DEC-84 item 1)." };
      case "contradiction-plurality":
        return notSetAside(["contradictionclarify", "contradictiontakeup", ...relay],
          "two projects' conclusions may not both hold. Setting it aside would not clear it: naming the difference "
          + "does, or taking it up as a question (DEC-84 item 3).");
      case "contradiction-plurality-unseen":
        return notSetAside(relay.length ? relay : ["contradictionoptin"],
          "this project's conclusion may not hold together with a conclusion you cannot see. It is not set aside: "
          + "your project can ask to resolve it (DEC-85).");
      case "tension-after-publication":
        return closed("a_published_tension_is_disclosed", { instead: "publish" },
          "a finding this case published rests on a conflict found since. It leaves when a later edition discloses it "
          + "or the conflict is resolved.");
      default:
        return null;
    }
  }

  /** The four generators, in catalogue order, and the ONE place a CONDITION
   *  item is minted. Every one of them is a pure read. */
  #queueConditions(viewer, now, identity = null) {
    return [
      ...this.#conditionsGovernorHolding(viewer, now, identity),
      ...this.#conditionsPartialCapture(viewer, now, identity),
      ...this.#conditionsCaptureUnattended(viewer, now, identity),
      ...this.#conditionsCaptureRequested(viewer, now, identity),
      ...this.#conditionsRenderDeferred(viewer, now, identity),
      ...this.#conditionsArchiveEligible(viewer, now, identity),
      ...this.#conditionsRecheckDue(viewer, now, identity),
    ];
  }

  /** `render-deferred` (D-523; BOB #33 RULED 2026-09-24 19:54Z, CLIENT-RENDERED.md "RULED 2026-09-24 by BOB #33").
   *
   *  THE FACT IS THE REQUEST ROW'S OWN: a request that asked for the page as a visitor saw it (`render = 1`) and
   *  carries a C-83 code. While it is `requested` the drain is HOLDING it under that code (D-491) and asks again on
   *  every tick until its `expires`; once `expired` the drain has RELEASED it and the render never happened. Both
   *  are shown, under one kind, because they are one fact at two moments and a member who saw the first must be
   *  able to see how it ended — an item that simply vanished at expiry would be the silent drop the ruling forbids.
   *
   *  THE REASON IS C-83's OWN, in DEC-49 words: the code, its C-number and the canned translation are read off the
   *  family that minted them and never re-typed here, so the sentence a member reads is the one the plane refuses
   *  with. C-83.3 and C-83.4 say different things — one that this instance cannot render at all, the other that
   *  today's allowance is committed — and collapsing them into "deferred" would tell a member to wait for a
   *  renderer that is not coming.
   *
   *  A CONDITION: our renderer, our allowance and our pacing hold it, so it is a fact about our machinery and never
   *  about the page, and a member may mute it for themselves (D-125's item form). It offers no act of its own; the
   *  options are the acts on the question the request was asked under, derived as every other item's are.
   *
   *  GATED AT THE TARGET through `#bundleGate`, exactly as the completion notification one producer up is: a
   *  request under a question the viewer cannot see is absent from their feed as it is from op=capturerequests. */
  #conditionsRenderDeferred(viewer, now, identity = null) {
    const out = [];
    for (const r of this.#captureRequests.rendersHeld({ viewer }).requests) {
      /* EVERY RENDER THE DRAIN HAS HELD, UNDER WHATEVER CODE IT LAST CARRIED, and every one that EXPIRED. A render
         held under C-83 on one tick is held by the drain's own RATE rule on the next when a plain request for the
         same host wins the slot, and that overwrites the row's code (measured, capturerequests.test.mjs 7d) — so
         showing C-83 codes alone would make the item VANISH for a tick while the render still waits, which is the
         silence the ruling forbids. A row never yet attempted (no code) is simply queued and is not shown. The
         reason is the code's own family's sentence; a code no family catalogues says so. */
      const row = renderHoldReason(r.code);
      const words = row.translation
        || `The last thing recorded against it (${r.code || "no code"}) has no catalogued sentence.`;
      const released = r.state === "expired";
      const sinceMs = Date.parse(r.requested_at);
      out.push({
        id: `CONDITION::render-deferred::${r.request}`,
        class: "CONDITION",
        kind: "render-deferred",
        case: this.#conditionHomes([r.target], viewer),
        subject: { kind: "capture_request", id: r.request },
        summary: released
          ? `the render of ${r.address} was never performed: it was held until its request expired, and what `
            + "the page showed is UNDETERMINED"
          : `a render of ${r.address} is waiting: ${words}`,
        detail: released
          ? `${words} The request expired at ${r.expires} and was released; nothing was filed in the `
            + "render's place, and no conclusion about the page can rest on it."
          : `${words} The request is held and asked again on every tick until ${r.expires}; if it `
            + "cannot be rendered by then it is recorded UNDETERMINED and released.",
        basis: { source: "capture_requests", request: r.request, run: r.run, inquiry: r.target,
                 address: r.address, host: r.host,
                 render: released ? { state: "expired", content: "undetermined" }
                                  : { state: "deferred", content: "undetermined" },
                 code: r.code, check: row.check, translation: row.translation,
                 attempts: r.attempts, expires: r.expires, updated: r.updated,
                 plane_detail: r.detail ?? null,
                 detail: "a condition is a fact about OUR OWN machinery (D-491, BOB #32 item 3): this instance's "
                       + "renderer, render allowance or host pacing is what holds the render, which says "
                       + "nothing about the page. The served frame is never filed as the content, so while it "
                       + "waits and after it expires there is NO capture of what a visitor saw." },
        age: Number.isFinite(sinceMs)
          ? { state: "determined", since: r.requested_at, ms: Math.max(0, now - sinceMs) }
          : { state: "undetermined", reason: "unparseable_requested_at",
              detail: "the request row carries a request stamp this producer cannot read as an instant" },
        assignee: null,
        assignee_role: null,
        options: this.#queueOptions([r.target], viewer, identity),
      });
    }
    return out;
  }

  /** op=queue: the member's ONE feed.
   *
   *  `member` and `viewer` are BOTH stamped server-side at index.mjs and are
   *  never taken from the caller — whose queue this is, and whose view its
   *  case names are compiled for, are server decisions or they are not
   *  decisions at all.
   *
   *  WHOSE OBLIGATIONS. Tasks assigned to the caller, PLUS tasks honestly
   *  `unassigned`. D-98 intends an unassigned task to stay claimable and
   *  routable by hand, and DEC-7 keeps it claimable rather than stranded, so
   *  hiding it from every queue would strand exactly the work routing could
   *  find nobody for. A machine credential has no member behind it and gets
   *  the whole live set, which is the operator view the token exists for.
   *
   *  `refers_to` POINTS AT THE SUBJECT, NOT AT THE CASE. They are different
   *  columns and the contract carries both: `subject` is what the item is
   *  about, `case` is where it is filed. Collapsing them is how a queue
   *  invents a home. */
  queueFeed({ member = null, viewer = null, nowMs = null, limit = 200 } = {}) {
    const cap = clampLimit(limit, 200, 500);
    const now = this.#nowMs(nowMs);
    const me = typeof member === "string" && member.trim() ? member.trim() : null;
    /* REC-132 / D-422: the queue's act options ask D-310's owner fact of the POSITIONAL
       identity, which is `member` — already the control plane's stamp of who asks —
       spelled in the viewer grammar. A machine credential stamps no member and keeps
       the fallback to its viewer, byte-unchanged. */
    const identity = me ? `member:${me}` : null;
    const items = [];

    /* ---------------------------------------------------- OBLIGATION · tasks
       REC-30: the CASE set was gated from birth (#queueAncestors) but the
       SUBJECT was not, and an obligation's subject is a bundle id — with the
       task's `subject_text` beside it. An item about a bundle this viewer may
       not see is withheld whole, the same posture op=tasks now takes: an
       obligation nobody may be told about is not an obligation this feed can
       carry, and a routed task on an invisible project reaches its assignee,
       who by construction can see it. Withheld silently and with no count, for
       the reason `mute` states its own suppressions and this cannot: a count
       here would say a project exists. */
    const taskSeen = this.#bundleGate("tk.refers_to", viewer);
    for (const row of this.#rows(
      `SELECT tk.* FROM tasks tk WHERE (${taskSeen.sql}) ORDER BY tk.created DESC, tk.id LIMIT ?`,
      ...taskSeen.args, cap * 2)) {
      if (me && row.assignee !== me && row.assignee !== "unassigned") continue;
      const subject = row.refers_to;
      /* The homes are derived FIRST and the event's state is asked ONCE, for
         all of them. This ordering is the whole of DEC-16 in two lines: one
         state, N homes.
         NEGATIVE CONTROL (REC-20): replace the single event-keyed test below
         with a per-(member, case) one — keep the item alive under every home
         except the first, as a queue_state row keyed by (member, case) would —
         and a resolved event with two ancestors leaves a stale unresolved copy
         under the second. */
      const homes = this.#queueAncestors([subject], viewer);
      if (!this.#queueEventLive(row)) continue;
      const createdMs = Date.parse(row.created);
      items.push({
        id: row.id,
        class: "OBLIGATION",
        kind: row.kind,
        case: homes,
        subject: { kind: "bundle", id: subject },
        summary: row.subject_text,
        detail: row.subject_desc ?? null,
        basis: { source: "tasks", refers_to: subject, routed_role: row.assignee_role,
                 status: row.status,
                 detail: "an obligation is a routed task: a named person must act for the record "
                       + "to proceed (D-98). refers_to points at the SUBJECT; case is derived." },
        age: Number.isFinite(createdMs)
          ? { state: "determined", since: row.created, ms: Math.max(0, now - createdMs) }
          : { state: "undetermined", reason: "unparseable_created",
              detail: "the task row carries a created stamp this producer cannot read as an instant" },
        assignee: row.assignee,
        assignee_role: row.assignee_role,
        options: this.#queueOptions([subject], viewer, identity),
      });
    }

    /* --------------------------------------- OBLIGATION · D-86 · bias debt
       The OBLIGATION half's SECOND producer: one item per run whose lens moved, raised by the `bias-debt` alarm
       consumer. Pushed above the mint, like every producer, so the mint validates what it mints. */
    items.push(...this.#obligationsBiasDebt(viewer, me, now, identity));

    /* --------------------------------------- FINDING · the proposals feed
       proposalsFeed is the ONE derivation (REC-6/7/8) and is read whole rather
       than re-implemented, so the queue and op=proposals cannot disagree about
       what is open. It has ALREADY aged out every disposed proposal, and its
       disposition key is (progression_key, stage_key) — the proposal's own
       identity, the EVENT — never (member, case). So the FINDING half inherits
       DEC-16's shape from the producer rather than needing a gate here: one
       op=proposedispose clears the finding under every case it appears in. */
    const feed = this.#progressions.proposalsFeed(nowMs);
    /* REC-30: the FINDING's subject bundles are read straight out of
       progression_instances and were published unfiltered — a project whose
       document is threaded into a progression named itself here. The FINDING
       itself stands for every member: it is the RECORD's own question about a
       progression stage, derived from the whole corpus, and it must not change
       shape with the reader. What is withheld is which BUNDLES sit behind it —
       and, with them, the acts offered on those bundles, since #queueOptions
       and #queueAncestors both take the viewer and would answer nothing for
       them anyway. */
    const findingSeen = this.#bundleGate("pi.bundle_id", viewer);
    const proposalItems = proposalFindingItems(feed, {
      subjectsOf: (pk, eid) => this.#rows(`SELECT DISTINCT pi.bundle_id FROM progression_instances pi
          WHERE pi.progression_key=? AND pi.entity_id=? AND (${findingSeen.sql}) ORDER BY pi.bundle_id`,
        pk, eid, ...findingSeen.args).map((r) => r.bundle_id),
      homesOf: (subjects) => this.#queueAncestors(subjects, viewer),
      optionsOf: (subjects) => this.#queueOptions(subjects, viewer, identity),
      subjectsMax: Queue.QUEUE_OPTION_SUBJECTS_MAX });
    items.push(...proposalItems);

    /* -------------------------------- FINDING · PL-15 / D-213 · THE LEAD
       The FINDING half's SECOND producer, and the first one that is not derived
       from proposalsFeed. It is pushed with the findings rather than beside
       them because it IS one: something the record noticed that may become
       evidence, leaving the list only by an authored act.

       ITS HOMES ARE NOT THIS RUN'S. Every other producer in this feed files an
       item under the ancestors of the thing it is about, and so does this one —
       the difference is only that the thing it is about is a question the run
       was NOT working. Stated here because a reader scanning the feed's
       assembly would otherwise have no reason to expect two producers over one
       table to disagree about where their items go. */
    items.push(...this.#findingsOutOfInquiryLead(viewer, now, identity));

    /* ---------------------------------------- FINDING · PL-13 / IS-3
       THE TWO SHARED-INQUIRY SLUGS, and they are pushed HERE — beside the lead
       and above the mint — for the same reason every other producer is: the
       mint validates what a producer MINTS, and a producer added below it
       would be a producer nothing checks. Both derive on read and neither
       writes; see their headers for why D-216's per-project answer is what
       makes them necessary rather than optional. */
    items.push(...this.#findingsStanceDiverged(viewer, now, identity));
    /* D-266: the second producer's answer is held rather than spread straight
       into `items`, because it carries ONE fact that has no item — how many
       readings of a shared question this read could not attribute to a team.
       An empty item list and an unattributable set are different answers and
       until now they rendered as the same one. */
    const fromAnotherTeam = this.#findingsVersionFromAnotherTeam(viewer, now, identity);
    items.push(...fromAnotherTeam);
    /* REC-124 / §7.1 item 3: a project concluding a shared question is TOLD to
       the others and moves none of them. Above the mint, like its siblings. */
    items.push(...this.#findingsConcludedElsewhere(viewer, now));
    /* D-52 / Membership v2 §8.1: an export is told to EVERY administrator and to nobody else.
       Above the mint, like its siblings, so the kind it mints is checked. */
    items.push(...this.#findingsExportPerformed(me, viewer, now));
    /* N172, N229: reevaluation's notices, intent's gaps (bounded projects, the bound published below) and monitoring's
       flagged ticks. Above the mint, like their siblings. */
    items.push(...this.#findingsNewerCapture(viewer, now, identity));
    const gaps = this.#findingsObjectiveGap(me, viewer, now, identity);
    items.push(...gaps);
    items.push(...this.#findingsSourceFlagged(viewer, now, identity));

    /* ------------------------------------------ CONDITION · REC-32
       The three generators, derived on read from the producing subsystems' own
       facts. They are pushed BEFORE the mute loop deliberately: the admission
       decision is asked of every item whatever its class, and CONDITION is the
       only class a member may ever mute, so this is the first read in which
       that machinery does anything on a live item. */
    items.push(...this.#queueConditions(viewer, now, identity));

    /* THE MINT, and PL-15 SWEPT IT FOR THE CLASS RATHER THAN ADDING TO IT.
     *
     * WHAT WAS HERE AND WHY IT WAS HALF A FENCE. REC-32 refused an uncatalogued
     * kind for CONDITION items ONLY, and its stated reason was that an
     * uncatalogued condition kind would produce an item no member could ever
     * mute. That reason is true and it is not the only one. A kind is the word
     * a SURFACE renders, a feed groups on and a member recognises across items,
     * and `queuestate.mjs`'s three vocabularies are the single authority on the
     * whole set — `op=affordances` publishes them and `check-refusal-codes`'
     * arm E holds every term to carrying the sentence a member reads. So an
     * OBLIGATION or a FINDING minted under a kind no vocabulary names is
     * exactly as unrenderable as a CONDITION was, and it was reaching members.
     * PL-15 needed one new FINDING slug refused when it is misspelled, and
     * fixing only that would have left the class standing for the other two —
     * which is the shape this project's standing instruction names.
     *
     * TWO REFUSALS WHERE REC-32 HAD ONE, and the split is `classOfKind`'s own
     * three-valued answer finally being used. `null` means the catalogue does
     * not name this kind AT ALL — a typo, an `N-<n>` id from a design document,
     * a slug somebody invented at a producer. A NON-NULL answer that differs
     * from the item's class means the kind is real and FILED ELSEWHERE, which is
     * a different defect with a different fix, and it is the dangerous one: a
     * CONDITION kind minted as a FINDING would be unmuteable, and an OBLIGATION
     * kind minted as a CONDITION would be MUTEABLE — one member able to silence
     * a task the record believes reached a person. `queuestate.mjs` says in its
     * own header that unknown is not the same as wrong and that the refusals
     * must say which happened. Now they do.
     *
     * IT REFUSES THE WHOLE ANSWER rather than dropping the item. A feed quietly
     * one item shorter is indistinguishable from nobody caring, which is the
     * same argument the mute block below makes about reporting suppressions.
     *
     * AND IT RUNS **BEFORE** THE MUTE LOOP, WHICH IT DID NOT UNTIL PL-15. THIS
     * ORDER IS THE FENCE AND THE OLD ONE WAS A HOLE — found by RUNNING the
     * control rather than by reading the code, and it is the sharpest thing
     * this item did. The mute loop removes items from the feed, so an item a
     * member had muted never reached the mint at all. Now put those two facts
     * together: a FINDING minted under a kind the catalogue files as a
     * CONDITION is exactly what the mute's write fence WILL accept — the fence
     * is `classOfKind(kind) === "CONDITION"` and the kind IS one — so the
     * misclassed item could be muted, was then suppressed, and the mint that
     * exists to refuse it never saw it. The single worst case the class
     * distinction protects against, escaping through the one door that made it
     * reachable. Validating what a producer MINTS is a different question from
     * what survives one member's preferences, and it is asked first. */
    const refusal = (code, detail, extra) =>
      queueRefusal(code, QUEUE_MINT_CHECKS[code], { detail, ...(extra || {}) });
    for (const it of items) {
      /* DEC-49 REGION is-queue-mint
       *
       * THE SPAN `QUEUE_MINT_CHECKS`' rows name (REC-71). A REGION and not the
       * whole of `queueFeed`, which is several hundred lines of producers whose
       * later refusals must not be conscripted into this family by a `where`
       * that claims too much — and whose set would GROW with the function. The
       * helper sits ABOVE the marker so its own variable-coded return is not
       * inside the governed span, and every code below is a STRING LITERAL at
       * its site, which is what lets arm C COMPARE them rather than read past
       * them (PL-3's convention, REC-71's measurement). */
      if (!Queue.QUEUE_CLASSES.includes(it.class))
        return refusal("NO_CLASS",
          `every queue item carries a class from ${Queue.QUEUE_CLASSES.join(" | ")}, and this one `
          + `carries ${it.class === undefined ? "none" : JSON.stringify(String(it.class).slice(0, 40))}. `
          + `The feed is DERIVED rather than stored, so the constraint a column would have carried is `
          + `enforced at the one place an item is minted.`,
          { id: it.id ?? null });
      if (classOfKind(it.kind) === null)
        return refusal("NO_SUCH_KIND",
          `${it.kind === undefined || it.kind === null || it.kind === ""
              ? "this item carries no kind at all"
              : `'${String(it.kind).slice(0, 60)}' is not a kind this record's catalogue names`}. `
          + `The vocabulary is queuestate.mjs's three lists and nothing else — it is what op=queuemute `
          + `refuses against, what op=affordances publishes, and what carries the sentence a member `
          + `reads instead of the slug. A kind invented at a producer would reach a surface with no `
          + `words to render it, and ids of the form N-<number> are a DESIGN DOCUMENT's numbering that `
          + `no code has ever used.`,
          { id: it.id ?? null, kind: it.kind ?? null });
      if (classOfKind(it.kind) !== it.class)
        return refusal("KIND_MISCLASSED",
          `'${String(it.kind).slice(0, 60)}' is catalogued as a ${classOfKind(it.kind)} and this item `
          + `mints it as a ${it.class}. That is not a spelling mistake, it is a change of doctrine at a `
          + `producer: the class decides whether leaving a member's list is a PERSONAL MUTE or an `
          + `AUTHORED RECORD ACT (D-125, DEC-16), so minting an obligation's kind as a condition would `
          + `let one member silence a task the record believes reached a person, and minting a `
          + `condition's kind as a finding would make a fact about our own machinery undismissable.`,
          { id: it.id ?? null, kind: it.kind ?? null,
            catalogued_as: classOfKind(it.kind), minted_as: it.class });
      /* END DEC-49 REGION is-queue-mint */
      /* PL-13 — THE DISPOSITION KEY, PUBLISHED AT THE MINT AND NOWHERE ELSE.
         Deliberately OUTSIDE the governed region above: it mints no refusal
         code and a `where` that swallowed it would claim a span whose set the
         DEC-49 guard would then have to account for. And deliberately AT THE
         MINT rather than in each producer: this is a property of the ITEM,
         asked of every item whatever its class and by one implementation, which
         is the same argument `suppressedBy` makes one block down. A producer
         computing its own answer would be six copies of the act's key. */
      it.disposition = this.#dispositionOf(it);
      /* R18: the lead's set-aside, offered exactly when its disposition is available (R12). */
      if (it.kind === "out-of-inquiry-lead" && it.disposition.available === true) it.options = [...it.options, Queue.LEAD_SET_ASIDE];
    }

    /* ============ D-266 / IC-60 · THE JUDGMENT-LAYER AGEING, PER PROJECT ======
     *
     * **ONE TEAM'S DISMISSAL GOVERNS THAT TEAM'S FEED AND NOTHING ELSE**, which
     * is the whole of the 2026-08-10 scoping ruling made operational. The
     * contrast one block down is deliberate and the two say so about each other:
     * a MUTE is personal and changes nobody else's feed; an INSTANCE-WIDE
     * disposition is a record act that clears the finding under every case it
     * appears in (DEC-16); a PROJECT-SCOPED disposition is a record act too —
     * authored, attributed, dated, and visible to that project's every member —
     * that clears the finding under ONE project and leaves every other project's
     * feed untouched by an item.
     *
     * IT RUNS AFTER THE MINT AND BEFORE THE MUTE, and the order is the argument.
     * After the mint, because it reads `disposition.scope`, which the mint is the
     * one place to compute. Before the mute, because a RECORD ACT is applied
     * before a PREFERENCE: a member's own mute must never be able to change
     * whether their team's decision was applied, only whether they are shown the
     * result.
     *
     * A PARTIALLY-DISPOSED ITEM STAYS AND SAYS SO. An item filed under two teams
     * where one has dismissed it is still a live finding for the other, so it
     * remains in the feed with the deciding team removed from its homes and the
     * removal DECLARED on `case.disposed_by` — never silently, which is the rule
     * `#findingsVersionFromAnotherTeam` already keeps for its own `excluded`
     * home. The item leaves the open list only when EVERY project home has
     * decided, and it is reported in `disposed` either way: an aged finding must
     * not read like an absent one (D-79), and that obligation does not weaken
     * because the ageing is now per-team.
     * ===================================================================== */
    const scopedRows = this.#rows(
      `SELECT project_id, finding_id, kind, state, reason, decided_by, at FROM finding_dispositions`);
    const scopedByFinding = new Map();
    for (const d of scopedRows) {
      let m = scopedByFinding.get(d.finding_id);
      if (!m) { m = new Map(); scopedByFinding.set(d.finding_id, m); }
      m.set(d.project_id, d);
    }
    const scopedDisposed = [];
    if (scopedByFinding.size > 0) {
      const surviving = [];
      for (const it of items) {
        const dsp = it.disposition;
        const byProject = dsp && dsp.scope === "project" && dsp.available === true
          ? scopedByFinding.get(it.id) : null;
        if (!byProject) { surviving.push(it); continue; }
        const homes = Array.isArray(dsp.projects) ? dsp.projects : [];
        const decided = homes.filter((p) => byProject.has(p));
        if (decided.length === 0) { surviving.push(it); continue; }
        for (const p of decided) {
          const d = byProject.get(p);
          scopedDisposed.push({
            /* THE ITEM ID THIS DECISION AGED, in the feed's own spelling — the
               same pin IC-53 put on the other key shape, and the reason a
               surface can tie a decision to the thing it removed without
               rebuilding an identity out of columns. */
            id: it.id, scope: "project", project: p, finding: d.finding_id,
            key: `${p}::${d.finding_id}`, kind: d.kind ?? it.kind ?? null,
            state: d.state, reason: d.reason, decided_by: d.decided_by, at: d.at,
          });
        }
        if (decided.length === homes.length) continue;   // every team decided: it leaves the open list
        const kept = (it.case && Array.isArray(it.case.ancestors) ? it.case.ancestors : [])
          .filter((a) => !(a && a.type === "project" && decided.includes(a.id)));
        it.case = {
          ...it.case, ancestors: kept,
          ungrouped: it.case.state === "determined" && kept.length === 0,
          disposed_by: decided.map((p) => ({ id: p, reason: "disposed_by_that_project",
            detail: "this team decided this finding at the judgment layer, so it is no longer in "
                  + "their open list. It is still live for the teams named above, and their feed "
                  + "was not touched by that act (D-266, §7/D-216). Stated rather than performed "
                  + "silently: a home set that is quietly shorter is indistinguishable from nobody "
                  + "caring (DEC-16)." })),
        };
        it.disposition = { ...dsp, projects: homes.filter((p) => !decided.includes(p)),
                           disposed_by: decided };
        surviving.push(it);
      }
      items.length = 0;
      items.push(...surviving);
    }

    /* ------------------------------------------- REC-21 · the PERSONAL half
       MOVED BELOW THE MINT BY PL-15 (it used to run above it), and the reason
       is at the mint: an item a member had muted was suppressed BEFORE the
       fence could look at it, so a FINDING minted under a kind the catalogue
       files as a CONDITION — the one case the mute's write fence WILL accept —
       could be muted and vanish without the mint ever seeing it. Nothing else
       about this block changes, and nothing about its result does either for
       any correctly-minted feed: every item reaching here has now been
       validated, which is the state this block always assumed.

       ONE admission point, consulted for EVERY item whatever its class, over
       queuestate.mjs's pure decision. The class fence is at the WRITE (queueMute
       refuses anything that is not a CONDITION kind), so a kind present in
       muted_kinds already means "a condition this member muted" and the read
       asks only about membership. That is deliberate and it is what makes the
       rule's failure observable: negative control (b) removes the write fence,
       a real OBLIGATION kind enters the column, and a real obligation genuinely
       disappears from a real feed — which is exactly the harm the doctrine
       names, demonstrated rather than asserted.
       A mute is PERSONAL, so an anonymous or machine caller (no member) has no
       mutes and sees the whole live set: #queueMutes returns an empty map and
       this loop suppresses nothing. */
    const mutes = this.#queueMutes(me);
    /* D-125 (DEC-10 (b)) and D-170: the ITEM form, keyed on the item's own id and
       on no case, asked FIRST because it is the narrower preference. `scope`
       says which form suppressed each item, so the member's feed states what
       it hides and by which of their own choices. */
    const itemMutes = this.#queueItemMutes(me);
    const suppressed = [];
    const admitted = [];
    for (const it of items) {
      if (mutedAsItem(it, itemMutes)) {
        suppressed.push({ id: it.id, class: it.class, kind: it.kind, case: null, scope: "item" });
        continue;
      }
      /* R31: an OBLIGATION is never suppressed, even by a row that names its kind (the write refuses one, and this
         read does not trust the column to have been written by that write alone; `mutedAsItem`'s posture). */
      const by = it.class === "OBLIGATION" ? null : suppressedBy(it, mutes);
      if (by === null) { admitted.push(it); continue; }
      suppressed.push({ id: it.id, class: it.class, kind: it.kind, case: by, scope: "case" });
    }
    items.length = 0;
    items.push(...admitted);

    /* R40 (DEC-10 (a)): a snoozed case's items are MARKED, never withheld: a surface may hold them back until the
       instant, and the plane keeps reporting them (a snooze defers re-notification; it removes nothing). */
    const snoozes = this.#queueSnoozes(me, now);
    if (snoozes.size > 0)
      for (const it of items) {
        const on = (it.case && Array.isArray(it.case.ancestors) ? it.case.ancestors : [])
          .filter((a) => a && snoozes.has(a.id)).map((a) => ({ case: a.id, until: snoozes.get(a.id) }));
        if (on.length > 0)
          it.snoozed = { until: on.map((x) => x.until).sort().at(-1), cases: on };
      }

    /* Obligations first — something a named person must do outranks something
       the record noticed — then stable on id so the feed does not shuffle. */
    const rank = (c) => Queue.QUEUE_CLASSES.indexOf(c);
    items.sort((a, b) => rank(a.class) - rank(b.class)
      || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const out = items.slice(0, cap);

    /* ============ D-266 · AN AGED FINDING MUST NOT READ LIKE AN ABSENT ONE
     *
     * **THE RULING THIS BLOCK IS THE TEETH OF, and the record made it rather
     * than this item: a disposition is keyed on the finding's STABLE IDENTITY,
     * it STANDS until it is re-triaged whether or not the underlying fact still
     * fires, and it AGES the finding out of the open list instead of deleting
     * it.** D-79 in terms — *a finding that disappears is indistinguishable
     * from one that was never made, and that rule does not relax because the
     * finder was a machine* — and `proposeDispose` says the same at its own
     * site (*the disposition is a standing decision keyed by identity … it does
     * NOT require a gap to currently fire*), and `proposalsFeed` implements
     * both halves: the disposed proposal leaves `proposals[]` and is RETURNED
     * in `dispositions[]`.
     *
     * **BEING RECOMPUTED ON EVERY READ IS NOT THE PROBLEM IT LOOKED LIKE, AND
     * THAT IS A MEASUREMENT RATHER THAN A PREFERENCE.** The two kinds that ARE
     * dispositionable today are themselves derived on every read — this feed
     * stamps them `age: { state: "undetermined", reason: "derived_on_read" }`
     * with its own hand, and `proposalsFeed` rebuilds them from
     * `progression_instances` every time it is called. Nothing is stored for a
     * disposition to attach to. What it attaches to instead is the IDENTITY,
     * and the identity is stable by construction: `proposal_dispositions`'
     * primary key is `(progression_key, stage_key)` and the item this feed
     * mints for it is `FINDING::<progression>::<stage>` — the same identity,
     * written by two producers that never consult each other. So a dismissal is
     * a fact about the SUBJECT, not about the inputs, and it neither decays nor
     * un-dismisses itself when they move. The record has already accepted the
     * consequence in the sharpest available case: a stage that later crosses
     * its deadline does NOT re-ask a member who set the gap aside.
     *
     * **WHAT WAS ACTUALLY BROKEN, AND IT WAS LIVE.** `proposalsFeed` keeps both
     * halves; THIS OP KEPT ONLY THE FIRST. `op=queue` is the one feed a member
     * opens by habit, and a finding they had dismissed simply stopped being in
     * it, with nothing anywhere in the answer saying so — indistinguishable
     * from a finding the record never derived, which is exactly what D-79
     * forbids and exactly the sparse-level failure CLAUDE.md makes a first-class
     * obligation. The surface had noticed and had done the only thing it could:
     * `civicos-ui/app.html` keeps a page-local Map of the dispositions IT
     * performed and renders them under the queue. That is honest and it is a
     * SECOND PLACE A FACT IS STATED (D-21/DEC-8) that survives neither a reload
     * nor a second member. The record holds the fact; the op now publishes it.
     *
     * **IT PUBLISHES THE DECISION AND ASSERTS NOTHING ABOUT THE GAP.** Whether
     * the underlying finding would fire again today is deliberately NOT claimed
     * here — the decision stands either way, and recomputing it would be a
     * second derivation of a question `op=proposals` already answers. `mute` one
     * block down is the deliberate contrast and the two say so about each other:
     * a mute is PERSONAL and changes nobody else's feed, a disposition is a
     * RECORD ACT carrying its author and reason and clears the finding under
     * every case it appears in. */
    const dispCap = Queue.QUEUE_DISPOSED_MAX;
    /* D-266 / IC-60. ONE LIST, TWO SCOPES, AND `scope` SAYS WHICH — never two
       arrays. What a member wants from this block is *what did I set aside and
       why*, which is one question; splitting it by the act's key shape would
       make a surface join two lists to answer it and would put the plane's
       internal distinction where a reader has to care about it. What the reader
       DOES have to be able to tell is whose feed each decision governs, and
       `scope` (with `project` beside it) says exactly that on every row. */
    const dispAll = [
      ...(Array.isArray(feed.dispositions) ? feed.dispositions : []).map((d) => ({
        /* THE ITEM ID THIS DECISION AGED, in the feed's own spelling, so a
           surface ties a decision to the thing it removed without rebuilding
           the identity from two columns — the drift class IC-53 closed one
           field over. */
        id: `FINDING::${d.key}`, scope: "instance", project: null,
        key: d.key, progression_key: d.progression_key, stage_key: d.stage_key,
        state: d.state, reason: d.reason, decided_by: d.decided_by, at: d.at,
        /* REC-184: the definition version the decision judged, and whether it still ages the
           finding — false once the definition is revised, when the finding is an OPEN item again. */
        definition_version: d.definition_version,
        definition_version_state: d.definition_version_state,
        applies: d.applies, applies_because: d.applies_because,
      })),
      ...scopedDisposed,
    ];
    const disposedOut = dispAll.slice(0, dispCap);
    return {
      ok: true, member: me, items: out,
      /* REC-57: `truncated` was already here and is UNTOUCHED — this op is the
         one its siblings are being brought into line WITH, and adding a second
         spelling of a fact it already publishes is the drift REC-55 declined.
         What was missing is the other half of the pair: WHICH BOUND was
         applied, so a caller that sees `truncated:true` knows what to ask for
         next. `limit` is the cap after clamping, matching `op=search`. */
      limit: cap,
      item_count: out.length, truncated: items.length > out.length,
      classes: Queue.QUEUE_CLASSES,
      /* N301 (K356): how each class is shown to members; FINDING reads Noticed, its code unchanged. */
      class_labels: QUEUE_CLASS_LABELS,
      classes_deferred: Queue.QUEUE_CLASSES_DEFERRED,
      ancestor_depth_bound: Queue.QUEUE_ANCESTOR_DEPTH,
      /* REC-21. What this member has chosen not to be told about, REPORTED
         rather than silently applied — the same rule the ancestor walk obeys
         and for the same reason: a feed that is quietly shorter is
         indistinguishable from nobody caring. A surface renders "you muted 2
         condition kinds on this case" from this block; nothing is hidden from
         the member who did the hiding. `personal: true` is stated because the
         one thing a reader must never conclude from a mute is that the record
         changed. */
      mute: {
        personal: true,
        cases: [...mutes.keys()].sort(),
        /* D-534: the kinds each of those cases mutes, case id -> sorted kinds.
           `cases` alone named the case and the kinds nowhere, so a case mute
           holding nothing back today (no live item of those kinds, so nothing
           on `suppressed`) could be neither named nor undone — the case form's
           unmute takes the kinds. A map BESIDE `cases` rather than objects IN
           it, because every reader of `cases` holds it as a list of ids (the
           queue-state suites and civicos-ui); this adds and moves nothing. */
        case_kinds: Object.fromEntries([...mutes.keys()].sort()
          .map((c) => [c, [...mutes.get(c)].sort()])),
        /* D-125: every item id this member muted, whether or not it is live
           now — a muted host that is not held today is still muted for them. */
        items: [...itemMutes].sort(),
        /* R40: each case this member has snoozed, with the instant it lapses (only those still in the future). */
        snoozed_until: Object.fromEntries([...snoozes.entries()].sort()),
        suppressed,
        suppressed_count: suppressed.length,
        detail: "muting is PERSONAL and dismissing is a RECORD ACT (D-125). Nothing here was removed "
              + "from the record and nothing here left another member's queue. A CONDITION or a FINDING "
              + "can be here, muted by case over the kinds you named or by its own id (`scope`); an "
              + "OBLIGATION never can, because it leaves every list only when it is RESOLVED. A muted "
              + "FINDING is still open for the team and in op=proposals: it leaves the team's list only "
              + "when it is adopted, deferred or dismissed, an act the record keeps.",
      },
      /* D-266. The other half of the sentence `mute` has just finished — a
         FINDING leaves this list when it is dismissed, and here is every one
         that did. `personal: false` is stated for the same reason `mute` states
         `personal: true`: the one thing a reader must be able to tell about a
         shorter feed is WHOSE act shortened it. */
      disposed: {
        personal: false,
        findings: disposedOut,
        count: disposedOut.length,
        recorded: dispAll.length,
        bound: dispCap,
        truncated: dispAll.length > disposedOut.length,
        detail: "every finding here left the OPEN list by an AUTHORED RECORD ACT (op=proposedispose) "
              + "carrying its author and their reason — never by a preference, which is the block "
              + "above. It has NOT left the record: the decision is keyed on the finding's own "
              + "identity, the same id the open feed mints for it, and it stands until it is "
              + "RE-TRIAGED. Whether the underlying gap still fires is NOT asserted here and does not "
              + "matter to the decision (D-79) — op=proposals is the op that answers that. **WHOSE "
              + "FEED EACH DECISION GOVERNS IS ON THE ROW AND IS NOT ONE ANSWER (D-266, IC-60): "
              + "`scope: instance` cleared this finding for EVERYBODY, because a progression-stage "
              + "finding is a fact about the shared record and one act clearing it under every case is "
              + "dedup (DEC-16); `scope: project` cleared it for THAT PROJECT AND NO OTHER, because a "
              + "stance is one project's own property (§7, D-216) and R5 makes forks at the judgment "
              + "layer legitimate.** So `personal: false` means no member's preference did this, and "
              + "it never means every team's feed moved. AN EMPTY LIST MEANS THE RECORD LOOKED AND "
              + "HOLDS NONE, never that this plane cannot say; and which act any given finding is "
              + "open to is published on the item's own `disposition`, never inferred from its kind.",
      },
      /* R39 (DEC-16): the obligations resolved lately on subjects this viewer sees, each with who resolved it and
         when, so a member who did not resolve one reads "resolved by X on this date" rather than a gap. */
      resolved: this.#resolvedLately(viewer, now),
      /* N172: the bound on the projects `objective-gap` asks about, published beside whether it cut. */
      objective_gap_projects_bound: gaps.bound,
      objective_gap_projects_truncated: gaps.truncated === true,
      /* D-266's SECOND, SMALLER HALF — the folded gap, counted rather than
         closed, because closing it needs an identity this record does not
         hold and inventing one would be the overclaim the silence exists to
         avoid. */
      unattributed_readings: {
        count: Number(fromAnotherTeam.unattributed) || 0,
        inquiries: Array.isArray(fromAnotherTeam.unattributed_inquiries)
          ? fromAnotherTeam.unattributed_inquiries : [],
        detail: "readings of a SHARED question that this read met and could not attribute to a team, "
              + "so no `new-version-arrived-from-another-team` item was minted for them. The source "
              + "team is a run's own stored context or it is nothing: a member does not name a team in "
              + "this record, and guessing one from who authored a reading would manufacture the very "
              + "connection the notification claims attention for. SO THE COUNT IS PUBLISHED AND THE "
              + "ATTRIBUTION IS NOT — an empty item list and an unattributable set are different facts "
              + "and until now they read the same. The questions are named so a member can go and look "
              + "(op=basisversions); the readings are not named and no author is implied. Why each one "
              + "could not be attributed is deliberately NOT distinguished: telling a hand-composed "
              + "reading from one whose run sat under something other than a project would mean "
              + "projecting a stored column of `ai_runs`, which this reader's declared role forbids "
              + "(REC-74). Zero means this read attributed everything it met, not that it did not look.",
      },
      counts: {
        obligation: out.filter((i) => i.class === "OBLIGATION").length,
        finding: out.filter((i) => i.class === "FINDING").length,
        /* REC-32. Additive: REC-20's two counts are untouched and a reader that
           knows nothing about conditions still gets the same numbers. */
        condition: out.filter((i) => i.class === "CONDITION").length,
        ungrouped: out.filter((i) => i.case.ungrouped).length,
        case_undetermined: out.filter((i) => i.case.state === "undetermined").length,
        suppressed: suppressed.length,
      },
    };
  }

  /* =================================================================   *  REC-21 · queue_state — the PERSONAL half, and the boundary it defends.
   *
   *  THE TWO OPS BELOW WRITE TO ONE TABLE AND TO NOTHING ELSE. Not `tasks`, not
   *  `proposal_dispositions`, and no bundle is minted. That is the discipline
   *  op=proposedispose established from the other side — declining is not
   *  authoring, so it writes a disposition rather than a document — carried one
   *  step further: a preference is not even a disposition. A disposition is
   *  ATTRIBUTED and DATED and stays in the case's history because the group is
   *  entitled to know its question was set aside and by whom. A mute is
   *  addressed to nobody, changes nothing about the record, and the group is
   *  entitled to know nothing about it.
   *
   *  WHY DEC-16 RAISES THE STAKES. Under shared resolution one member's act
   *  clears every other member's queue. That is right for a RESOLUTION — the
   *  City replacing a page is one fact about the world and anyone standing on
   *  it can settle it for everyone — and it is exactly why the personal half
   *  must not be able to reach the same lever. If mute and dismiss were one
   *  control, one member's inbox hygiene would clear the group's question, and
   *  a silent disappearance would be indistinguishable from a bug.
   *
   *  AND THE OTHER HALF OF DEC-16'S SAFEGUARD NEEDS NO CODE HERE, which is
   *  worth stating so nobody later builds it: an act that CHANGES the record is
   *  ITSELF AN EVENT, and it propagates by the same every-ancestor rule as any
   *  other. Resolving by LOOKING and finding nothing changed correctly clears
   *  the item for everyone; resolving by CHANGING something raises a new event
   *  that reaches every ancestor entry — including the entry of a member who
   *  muted conditions on that case, because the new event is an OBLIGATION and
   *  a mute cannot reach one. That is the ordinary consequence loop, not a
   *  mechanism, and the suite asserts it end to end rather than trusting it.
   * ======================================================================== */

  /** This member's mute rows, as the pure decision wants them: a Map
   *  case_id -> Set(kind). A caller with no member (a machine credential, an
   *  unauthenticated probe) has no personal state and gets an empty map, so the
   *  operator view is the whole live set — the same carve-out D-15 makes for a
   *  machine viewer, for the same reason: there is no person whose preferences
   *  these could be. */
  #queueMutes(member) {
    const out = new Map();
    if (typeof member !== "string" || !member.trim()) return out;
    for (const r of this.#rows(
      `SELECT case_id, muted_kinds FROM queue_state WHERE member_id=?`, member.trim())) {
      const kinds = parseMutedKinds(r.muted_kinds);
      if (kinds.length > 0) out.set(r.case_id, new Set(kinds));
    }
    return out;
  }

  /** D-125: this member's ITEM mutes, as a Set of item ids. A caller with no
   *  member has none, for `#queueMutes`' reason. */
  #queueItemMutes(member) {
    const out = new Set();
    if (typeof member !== "string" || !member.trim()) return out;
    for (const r of this.#rows(
      `SELECT item_id FROM queue_item_mutes WHERE member_id=?`, member.trim())) out.add(r.item_id);
    return out;
  }

  /** R40: this member's snoozes still in the future, case id -> ISO instant. A caller with no member has none. */
  #queueSnoozes(member, now) {
    const out = new Map();
    if (typeof member !== "string" || !member.trim()) return out;
    for (const r of this.#rows(
      `SELECT case_id, snoozed_until FROM queue_state WHERE member_id=? AND snoozed_until IS NOT NULL`, member.trim())) {
      const ms = Date.parse(r.snoozed_until);
      if (Number.isFinite(ms) && ms > now) out.set(r.case_id, r.snoozed_until);
    }
    return out;
  }

  /** R39: the obligations resolved within the last QUEUE_RESOLVED_WINDOW_DAYS on subjects this viewer sees, each with
   *  who resolved it and when. The tasks, newest first, at most QUEUE_RESOLVED_MAX, each resolved by its history's
   *  `resolved` entry; and the settled bias debts, read through `bias.settled` (its R44; N326) with the viewer's gate in
   *  the same window and bound, each resolved by the member who settled it, or null beside its `settled_kind` when no
   *  member did (the lens moved back, or a re-run discharged it: K444). Null is never read as "nobody". */
  #resolvedLately(viewer, now) {
    const cap = Queue.QUEUE_RESOLVED_MAX;
    const since = stampInstant("second", now - Queue.QUEUE_RESOLVED_WINDOW_DAYS * 86400000);
    const seen = this.#bundleGate("tk.refers_to", viewer);
    const rows = this.#rows(
      `SELECT tk.* FROM tasks tk WHERE tk.status='resolved' AND tk.resolved_at >= ? AND (${seen.sql})
        ORDER BY tk.resolved_at DESC, tk.id LIMIT ?`, since, ...seen.args, cap + 1);
    const tasks = rows.slice(0, cap).map((r) => {
      const t = this.#taskOf(r);
      const by = [...t.history].reverse().find((h) => h && h.event === "resolved");
      return { id: t.id, class: "OBLIGATION", kind: t.kind, refers_to: t.refers_to, summary: t.subject.text,
               resolved_by: by ? by.actor : null, resolved_at: t.resolved_at ?? (by ? by.at : null) };
    });
    const settled = this.#bias.settled({ gate: viewerPredicate(viewer), since, limit: cap }) || {};
    const debts = (Array.isArray(settled.debts) ? settled.debts : []).map((d) => ({
      id: `OBLIGATION::bias-debt::${d.run}`, class: "OBLIGATION", kind: "bias-debt", run: d.run,
      context: { type: d.context_type ?? null, id: d.context_id ?? null },
      resolved_by: d.actor ?? null, settled_kind: d.settled_kind ?? null, resolved_at: d.settled_at ?? null,
      reason: d.reason ?? null }));
    return { personal: false, window_days: Queue.QUEUE_RESOLVED_WINDOW_DAYS, since, obligations: tasks,
             count: tasks.length, bound: cap, truncated: rows.length > cap,
             bias_debts: { read: settled.undetermined !== true, debts, count: debts.length,
                           bound: settled.limit ?? cap, truncated: settled.truncated === true,
                           ...(settled.undetermined === true || settled.stated ? { stated: settled.stated ?? null } : {}),
                           detail: "bias debts settled in the window on runs this viewer may read (bias R44), each with "
                                 + "the member who settled it. `resolved_by` is null when no member settled it (the lens "
                                 + "moved back, or a re-run under the lens now in force discharged it), and "
                                 + "`settled_kind` says which; null never means nobody acted." },
             detail: "obligations that LEFT the list by being resolved, with who resolved each and when (DEC-16): one "
                   + "member's resolution clears the item for everyone, and this is where everyone else reads that "
                   + "it happened." };
  }

  /** The case a personal preference may be attached to, resolved through the
   *  catalog's OWN machinery and gated by the viewer.
   *
   *  MAP RULE (REC-10/REC-13). `normalizeType` decides whether the bundle is a
   *  CASE at all, so a legacy `focus`/`problem` document is mutable exactly as a
   *  canonical `inquiry` one is, and `vocabFor` reads its state through the
   *  machine that document was authored under. A raw `object_type === "inquiry"`
   *  here would silently refuse every legacy question.
   *
   *  D-15 through the ONE compilation point: a case this viewer cannot see
   *  answers identically to one that does not exist, so a mute cannot be used to
   *  probe for the existence of a project nobody invited you to. */
  #queueCaseFor(caseId, viewer) {
    const id = typeof caseId === "string" ? caseId.trim() : "";
    if (!id) return { ok: false, reason: "NO_CASE",
                      detail: "a personal preference is keyed (member, case); name the case it is about" };
    const gate = viewerPredicate(viewer);
    /* `FROM bundles b` and not `FROM bundles`: viewerPredicate compiles a
       predicate over the alias `b`, which is the shape every other gated read in
       this file passes it. */
    const row = this.#one(
      `SELECT b.bundle_id, b.object_type, b.current_state, b.title FROM bundles b
        WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
    if (!row) return { ok: false, reason: "NO_SUCH_CASE", case: id,
      detail: "no case by that id is visible to you. A case you may not see and a case that does not "
            + "exist answer identically here (D-15), so this refusal reveals nothing either way." };
    const ty = normalizeType(row.object_type);
    if (!Queue.QUEUE_CASE_TYPES.includes(ty))
      return { ok: false, reason: "NOT_A_CASE", case: id, object_type: ty,
        detail: "a queue entry is filed under a CASE — an inquiry or a project — and personal state is "
              + "keyed to that. A document is a SUBJECT, not a home: muting one would be muting every "
              + "question that rests on it, for reasons none of those questions' owners could see." };
    const spec = vocabFor(STATES, row.object_type);
    return { ok: true, id: row.bundle_id, type: ty, title: row.title ?? null,
             state: row.current_state ?? null,
             known_state: !!(spec && spec.edges
               && Object.prototype.hasOwnProperty.call(spec.edges, row.current_state)) };
  }

  /** op=queuemute — a member's PERSONAL mute, in one of two forms (D-125, DEC-10).
   *
   *  THE CASE FORM, `{ case, kinds }` — DEC-10's (c): stop notifying ME about these
   *  kinds on this case. Scoped to the kinds NAMED when it is made, so a new kind
   *  on the case still reaches the member (queuestate.mjs `suppressedBy`).
   *
   *  THE ITEM FORM, `{ item }` — DEC-10's (b): stop notifying ME about this one
   *  item, keyed on the item's own stable id as op=queue publishes it (a
   *  FINDING's `FINDING::<progression>::<stage>` is the key its disposition
   *  already uses). It names no case, so it also reaches an UNGROUPED CONDITION
   *  (D-170, BOB #29), which the case form cannot. It writes ONE row of
   *  `queue_item_mutes` and nothing else.
   *
   *  `member` is stamped server-side at index.mjs and is never taken from the
   *  caller: a caller who could name the member could mute somebody else's
   *  attention, which is the one thing a personal preference must not permit.
   *
   *  THE FENCE. Either form reaches a CONDITION or a FINDING and NEVER an
   *  OBLIGATION (NOTIFICATIONS.md "MARKED AS HANDLED", RULED 2026-09-22 by BOB
   *  #26): a mute is keyed on the MEMBER, so it moves no other member's list, and
   *  a finding still leaves the TEAM's list only by the authored disposition,
   *  which a mute never writes. An obligation is refused with its class and the
   *  act that DOES clear it. A kind or an item the catalogue cannot classify is
   *  refused separately: unknown is not the same as wrong. A case-less per-KIND
   *  mute stays unavailable (REC-32's hazard): the case form requires a case.
   *
   *  It refuses an EMPTY set too. "Mute this case" with no kinds is the delete
   *  button the doctrine forbids, and accepting it as a no-op would leave a
   *  member believing they had silenced something they had not. */
  queueMute({ member = null, case: caseId = null, kinds = null, item = null, unmute = false,
              viewer = null, at = null } = {}) {
    const me = typeof member === "string" ? member.trim() : "";
    if (!me) return { ok: false, reason: "NO_MEMBER",
      detail: "a mute is PERSONAL: it is keyed to the member whose attention it is about, and a machine "
            + "credential has no member behind it. There is no instance-wide mute and there must not be." };
    const mutableKinds = [...Object.keys(QUEUE_CONDITION_KINDS), ...Object.keys(QUEUE_FINDING_KINDS)];
    const itemId = typeof item === "string" ? item.trim() : "";
    const named = Array.isArray(kinds) ? kinds.map((k) => (typeof k === "string" ? k.trim() : "")).filter(Boolean) : [];
    let c = null;
    const subjects = [];
    if (itemId) {
      /* One form per call. An item named beside kinds or a case is ambiguous
         about which preference the member meant, and guessing is how a member
         ends up believing the wrong thing is silenced. */
      if (named.length > 0 || (typeof caseId === "string" && caseId.trim()))
        return { ok: false, reason: "BAD_KIND", item: itemId,
          detail: "name EITHER one item (`item`) OR kinds on a case (`case` + `kinds`), not both: they are "
                + "two different preferences and this plane will not guess which one you meant" };
      /* The class is the id's own first segment; an OBLIGATION's id is an
         opaque task id with none, so `tasks` is asked to NAME it — the refusal
         must say OBLIGATION rather than merely "unknown". */
      let cls = itemClassOf(itemId);
      /* R26: an OBLIGATION published under its own class segment (`OBLIGATION::bias-debt::<run>`, R8) is named
         OBLIGATION too, so it is refused as one rather than as unknown. */
      if (cls === null && /^OBLIGATION::\S/.test(itemId)) cls = "OBLIGATION";
      if (cls === null && this.#one(`SELECT id FROM tasks WHERE id=?`, itemId)) cls = "OBLIGATION";
      subjects.push({ item: itemId, cls });
    } else {
      c = this.#queueCaseFor(caseId, viewer);
      if (c.ok !== true) return c;
      if (named.length === 0)
        return { ok: false, reason: "NO_KINDS", case: c.id,
          detail: "name the kinds to mute, or name one `item`. A mute is scoped to the kinds present when it "
                + "was made — that is what lets a NEW kind on this case still reach you — so there is no "
                + "whole-case mute to ask for.",
          available: mutableKinds };
      for (const k of named) subjects.push({ kind: k, cls: classOfKind(k) });
    }
    for (const sb of subjects) {
      if (sb.kind !== undefined && sb.kind.includes(","))
        return { ok: false, reason: "BAD_KIND", kind: sb.kind, case: c.id,
          detail: "a kind is a slug and may not contain a comma; the stored set is comma-separated" };
      if (sb.cls === null)
        return { ok: false, reason: "UNKNOWN_KIND", ...(sb.item ? { item: sb.item } : { kind: sb.kind }),
          case: c ? c.id : null,
          detail: sb.item
            ? "no queue item by that id is one this plane can classify: a FINDING's or CONDITION's id "
              + "begins with its class (as op=queue publishes it), and it names no obligation. Unknown is "
              + "not the same as forbidden, and this refusal is the first rather than the second."
            : "the notification catalogue does not name that kind. Unknown is not the same as "
              + "forbidden, and this refusal is the first rather than the second.",
          available: mutableKinds };
      /* DEC-49 REGION is-mute-class — REC-64/C-33.27. */
      if (!PERSONALLY_MUTABLE_CLASSES.includes(sb.cls))
        return { ok: false, reason: "KIND_NOT_PERSONAL", code: "KIND_NOT_PERSONAL",
          check: QUEUE_ACT_CHECKS.KIND_NOT_PERSONAL.check, translation: QUEUE_ACT_CHECKS.KIND_NOT_PERSONAL.translation,
          ...(sb.item ? { item: sb.item } : { kind: sb.kind }), kind_class: sb.cls,
          case: c ? c.id : null,
          detail: MUTE_REFUSAL_DETAIL[sb.cls],
          available: mutableKinds };
      /* END DEC-49 REGION is-mute-class */
    }
    const stamp = typeof at === "string" && at ? at : new Date(this.#nowMs(null)).toISOString();
    if (itemId) {
      const cls = subjects[0].cls;
      const had = !!this.#one(
        `SELECT item_id FROM queue_item_mutes WHERE member_id=? AND item_id=?`, me, itemId);
      if (unmute) this.sql.exec(
        `DELETE FROM queue_item_mutes WHERE member_id=? AND item_id=?`, me, itemId);
      else this.sql.exec(
        `INSERT INTO queue_item_mutes (member_id, item_id, item_class, muted_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(member_id, item_id) DO UPDATE SET muted_at=excluded.muted_at`,
        me, itemId, cls, stamp);
      return {
        ok: true, member: me, form: "item", item: itemId, item_class: cls,
        muted_items: [...this.#queueItemMutes(me)].sort(),
        added: !unmute && !had ? [itemId] : [], removed: unmute && had ? [itemId] : [], at: stamp,
        wrote: { queue_item_mutes: 1, queue_state: 0, tasks: 0, proposal_dispositions: 0, bundles: 0 },
        detail: "a mute is PERSONAL: this one item leaves YOUR feed, which says so in its `mute` block. "
              + "Nothing left the record, no other member's feed moved, no disposition was written, and "
              + "op=proposals still carries the finding. A finding leaves the team's list only when it is "
              + "adopted, deferred or dismissed (op=proposedispose). The key is the item's own id, so the "
              + "same item arising again stays muted for you until you unmute it.",
      };
    }
    const row = this.#one(
      `SELECT muted_kinds, snoozed_until FROM queue_state WHERE member_id=? AND case_id=?`, me, c.id);
    const had = parseMutedKinds(row ? row.muted_kinds : "");
    /* UNION on repeat, DIFFERENCE on unmute. Union rather than replace because
       a second mute is a member muting MORE, not restating everything they ever
       muted — and because replace would silently un-mute a kind the surface did
       not happen to re-send. */
    const next = unmute ? had.filter((k) => !named.includes(k))
                        : [...new Set([...had, ...named])];
    const text = serializeMutedKinds(next);
    this.sql.exec(
      `INSERT INTO queue_state (member_id, case_id, muted_kinds, snoozed_until, last_seen)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(member_id, case_id) DO UPDATE SET muted_kinds=excluded.muted_kinds,
                                                     last_seen=excluded.last_seen`,
      me, c.id, text, row ? row.snoozed_until ?? null : null, stamp);
    return {
      ok: true, member: me, case: c.id, case_type: c.type, case_title: c.title,
      muted_kinds: parseMutedKinds(text), added: unmute ? [] : named.filter((k) => !had.includes(k)),
      removed: unmute ? named.filter((k) => had.includes(k)) : [], at: stamp,
      /* The RECORD SURFACES THIS ACT DID NOT TOUCH, counted rather than claimed,
         so the suite can assert the boundary from the op's own answer as well as
         from the tables. */
      wrote: { queue_state: 1, tasks: 0, proposal_dispositions: 0, bundles: 0 },
      detail: "a mute is PERSONAL and reaches CONDITION and FINDING kinds, never an OBLIGATION. Nothing "
            + "left the record, nothing left another member's queue, no disposition was written, and an "
            + "OBLIGATION on this case still reaches you: an obligation leaves every list only when it is "
            + "RESOLVED, which is record state.",
    };
  }

  /** op=queuesnooze — defer a case's re-notification, for one member, until an
   *  instant the MEMBER named.
   *
   *  P-87 IS ENFORCED BY AN ABSENCE, and that is the point. "Re-notify at the
   *  stage's OWN declared interval, never a global one" means this plane has no
   *  instance-wide snooze constant to fall back on, so a snooze with no instant
   *  is REFUSED rather than filled in with one. There is nothing to configure
   *  and nothing to drift; the cadence comes from the member's own choice, and
   *  the re-notification clock is the REC-1 alarm's `queue-renotify` consumer,
   *  whose wake is read from these rows and from no constant of its own.
   *
   *  A SNOOZE HIDES NOTHING. It does not filter the feed — deferring a
   *  re-notification is not the same as removing an item, and treating them as
   *  the same is how an obligation would go quiet on a member who only meant
   *  "not right now". The feed keeps reporting the item; the alarm stops
   *  pushing about it until the instant passes. */
  queueSnooze({ member = null, case: caseId = null, until = null, clear = false,
                viewer = null, at = null } = {}) {
    const me = typeof member === "string" ? member.trim() : "";
    if (!me) return { ok: false, reason: "NO_MEMBER",
      detail: "a snooze is PERSONAL: it is keyed to the member whose attention it is about, and a "
            + "machine credential has no member behind it." };
    const c = this.#queueCaseFor(caseId, viewer);
    if (c.ok !== true) return c;
    const stamp = typeof at === "string" && at ? at : new Date(this.#nowMs(null)).toISOString();
    let iso = null;
    if (!clear) {
      if (typeof until !== "string" || !until)
        return { ok: false, reason: "NO_UNTIL", case: c.id,
          detail: "name the instant to snooze until. There is no default and there must not be one: "
                + "P-87 requires re-notification at the stage's OWN declared interval, never at a "
                + "global one, so this plane holds no instance-wide snooze constant to fall back on." };
      const ms = Date.parse(until);
      if (!Number.isFinite(ms))
        return { ok: false, reason: "BAD_UNTIL", until, case: c.id,
          detail: "until must be an instant this plane can read (ISO-8601)" };
      if (ms <= this.#nowMs(null))
        return { ok: false, reason: "UNTIL_IN_PAST", until, case: c.id,
          detail: "a snooze that has already expired is not a snooze; it would report as deferred while "
                + "deferring nothing" };
      iso = new Date(ms).toISOString();
    }
    const row = this.#one(
      `SELECT muted_kinds FROM queue_state WHERE member_id=? AND case_id=?`, me, c.id);
    this.sql.exec(
      `INSERT INTO queue_state (member_id, case_id, muted_kinds, snoozed_until, last_seen)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(member_id, case_id) DO UPDATE SET snoozed_until=excluded.snoozed_until,
                                                     last_seen=excluded.last_seen`,
      me, c.id, row ? row.muted_kinds ?? null : null, iso, stamp);
    return {
      ok: true, member: me, case: c.id, case_type: c.type, snoozed_until: iso, at: stamp,
      wrote: { queue_state: 1, tasks: 0, proposal_dispositions: 0, bundles: 0 },
      detail: iso
        ? "re-notification about this case is deferred for YOU until that instant. The items themselves "
        + "are unchanged, they still appear in your feed, and no other member's feed moved."
        : "the snooze is cleared; re-notification resumes at the declared interval of whatever raises it.",
    };
  }

  /** The earliest instant any member's snooze expires, or null. This is the
   *  whole of the `queue-renotify` consumer's wake and it holds NO constant of
   *  its own — P-87 by construction rather than by discipline. */
  /** How many snoozes have come due at this instant. */
  #queueRenotifyExpired(now) {
    return this.#rows(
      `SELECT count(*) c FROM queue_state WHERE snoozed_until IS NOT NULL AND snoozed_until<=?`,
      new Date(now).toISOString())[0].c;
  }

  #queueRenotifyWake(now) {
    let best = null;
    for (const r of this.#rows(
      `SELECT snoozed_until FROM queue_state WHERE snoozed_until IS NOT NULL`)) {
      const ms = Date.parse(r.snoozed_until);
      if (!Number.isFinite(ms) || ms <= now) continue;
      if (best === null || ms < best) best = ms;
    }
    return best;
  }

  /* op=proposedispose (REC-7): record a member's DEFER or DISMISS of a derived PROPOSAL, WITHOUT
     minting a bundle. REC-6's op=proposals surfaces the record's own questions (one missing-
     predecessor finding per (progression_key, stage_key), aggregated). A member who decides a
     question is not worth pursuing — or wants it parked — needs somewhere to record that. op=dispose
     cannot take it: it disposes a focus BUNDLE (a handle + a state), and a proposal is not a bundle.
     Doctrine is SETTLED (D-79): a declined proposal AGES with a recorded reason; it does NOT mint a
     bundle, open a focus, or attribute anything beyond this disposition record — because DECLINING
     IS NOT AUTHORING. So this writes ONE row keyed by the proposal's identity and nothing else: no
     bundle, no history entry, no manifest. proposalsFeed reads it and ages the proposal out of open.

     The reason is REQUIRED and never prefilled (NO_REASON, fail-closed) — the whole point is that a
     member's decision to set aside the record's question is itself accountable, in their own words.
     The deciding member is STAMPED server-side by index.mjs (decidedBy); a caller-supplied value is
     overwritten there, and a blank one is refused here (NO_DECIDER) so a bypass fails closed. */
  /* D-266 / IC-60 — THE SECOND KEY SHAPE, AND WHY ONE OP RATHER THAN TWO.
     Deferring and dismissing are ONE act with one vocabulary, one required reason and one
     server-stamped decider; what differs between the two shapes is the SUBJECT the decision is a
     fact about, and a second op would be a second place to state one act (D-21/DEC-8) whose two
     copies would drift the first time the vocabulary moved. So the shape is chosen by which
     identity the caller sends:

       { key | progressionKey+stageKey }  -> proposal_dispositions, INSTANCE-WIDE (DEC-16).
       { project, finding }               -> finding_dispositions,  ONE PROJECT'S FEED (§7/D-216/R5).

     THE SECOND ARM VALIDATES THE PROJECT AND DELIBERATELY NOT THE FINDING'S HOMES. Checking that
     this finding is filed under that project would mean RE-DERIVING the item here from its id —
     a second implementation of an identity `queueFeed` already mints, which is exactly the drift
     class IC-53 closed one field over. The row is the acting team's own record of a judgment; a
     row naming a project the finding never reaches simply never matches, and harms nothing. What
     IS checked is that the project is a real project bundle THIS VIEWER CAN SEE, so a caller
     cannot write a decision under a team it was never invited to. */
  /** R29 (D-623): both of the project arm's no-scope refusals answer here, one code with its row (C-33.50). */
  #noProjectScope(extra) {
    /* DEC-49 REGION is-dispose-scope — R29/C-33.50. The whole of the refusal's site: the code is a STRING LITERAL
       and the check and translation come off its row, so the guard can grade it and a member reads the same
       sentence from the project arm and from the bridge. */
    const row = QUEUE_ACT_CHECKS.NO_PROJECT_SCOPE;
    return { ok: false, reason: "NO_PROJECT_SCOPE", code: "NO_PROJECT_SCOPE",
             check: row.check, translation: row.translation, ...(extra || {}) };
    /* END DEC-49 REGION is-dispose-scope */
  }

  proposeDispose({ progressionKey, stageKey, key, project, finding, kind,
                   to, state, reason, definitionVersion = null,
                   decidedBy = null, viewer = null, identity = null, items } = {}) {
    /* D-126: WITH `items`, the act takes a SET under the PER-ITEM weight (`#perItem`), each item decided by
       THIS method's single-key path. The decider (the control plane's stamp) and the viewer and identity
       (the URL's, spread after the body at the dispatch) are forced onto every item. */
    if (items !== undefined)
      return this.#perItem("proposedispose",
        /* REC-211: `definitionVersion` is SHARED so a set over ONE progression names the version
           once; `#perItem` spreads each item AFTER the shared fields, so a set spanning several
           progressions still gives each item its own. It is not stamped like the decider, because
           the decider is a fact about the actor and this is a fact about what the actor READ. */
        { items, progressionKey, stageKey, key, project, finding, kind, to, state, reason,
          definitionVersion },
        { decidedBy, viewer, identity }, (b) => this.proposeDispose(b));
    const proj = typeof project === "string" ? project.trim() : "";
    const find = typeof finding === "string" ? finding.trim() : "";
    /* WHICH ACT THIS IS, decided by what the caller SENT and never by inspecting the id's shape.
       A caller that names either half of the project-scoped identity is performing that act, and
       the missing half is refused BY NAME rather than being silently re-read as the other one. */
    const scoped = !!(proj || find);
    /* the proposal identity is (progression_key, stage_key). UI-5 sends the aggregation key it
       already holds ("progression::stage"); the pair may also be passed explicitly. */
    let pk = typeof progressionKey === "string" ? progressionKey.trim() : "";
    let sk = typeof stageKey === "string" ? stageKey.trim() : "";
    if (!scoped && (!pk || !sk) && typeof key === "string" && key.includes("::")) {
      const i = key.indexOf("::");
      if (!pk) pk = key.slice(0, i).trim();
      if (!sk) sk = key.slice(i + 2).trim();
    }
    if (scoped && !find) return { ok: false, reason: "NO_FINDING", project: proj,
      detail: "a project-scoped disposition names the FINDING it ages, by the queue item's own id "
            + "(op=queue publishes it as disposition.finding). A project with no finding names a "
            + "team and no decision." };
    if (scoped && !proj) return this.#noProjectScope({ finding: find,
      detail: "a finding that carries no progression stage is dispositioned at the JUDGMENT LAYER, "
            + "and that act is scoped to ONE project's feed (D-266: a stance is expressly one "
            + "project's own property, §7/D-216, and R5 makes forks at the judgment layer "
            + "legitimate). Name the project you are acting for — op=queue publishes the candidates "
            + "as disposition.projects. It is not defaulted even when there is only one, because a "
            + "plane choosing whose judgment the record carries is the single shared stance §7 "
            + "rejected, arriving through a defaulted parameter." });
    /* THE BRIDGE FOR A SURFACE BUILT BEFORE IC-60, AND IT NAMES THE FIX RATHER THAN THE SYMPTOM.
       A page that learned this act before the second shape existed composes `key` from the queue
       item's own id, so a stance-scoped finding arrives here as key='<kind>::<rest>'. Read as the
       old shape that is NO_SUCH_PROGRESSION — true, useless, and it tells a member to define a
       progression that has nothing to do with what they clicked. The catalogue already knows the
       first segment is a FINDING kind, so this says what is actually missing. It infers NOTHING
       about which project: it refuses, and names the two arguments to send. */
    /* REC-205 WIDENS THE BRIDGE IN TWO DIRECTIONS, and both are the same defect as the paragraph
       above — a refusal that is true and useless — met by the two things a SELECTION puts in front
       of this act that a single Adopt button never did.
         · THE OTHER SPELLING OF THE SAME MISTAKE. A surface composing `key` from the item's own
           published id sends the WHOLE id, `FINDING::<kind>::<rest>`, not the id with its class
           segment stripped; then `pk` is the literal "FINDING", the catalogue knows no such kind,
           and the answer was NO_SUCH_PROGRESSION again. `itemClassOf` is the lookup that reads a
           published id, and using it here means the bridge does not depend on WHICH of the two
           spellings a page happened to build.
         · A CONDITION OR AN OBLIGATION IN THE SELECTION. `#dispositionOf` already publishes, per
           item, that neither is disposed and WHICH act does reach it (`instead`), so a set arriving
           here with one is a surface that did not read that block — and under the per-item weight it
           is ONE item of a selection whose other items are being handled. It is retained with a
           refusal naming its own act rather than being told to define a progression. The `instead`
           values are read from the catalogue's class, never listed a second time here.
       NOTHING IS INFERRED ABOUT THE SUBJECT IN EITHER ARM: nothing is written, and the refusal names
       the act or the arguments to send. */
    const keyed = typeof key === "string" ? key.trim() : "";
    /* A PUBLISHED ID CARRIES ITS CLASS IN ITS FIRST SEGMENT AND ITS KIND IN ITS SECOND; a key with the
       class segment stripped carries the kind in the FIRST. Both are read here so the bridge does not
       depend on which spelling a page built, and the kind reported is the item's own either way. */
    const byId = !scoped && keyed ? itemClassOf(keyed) : null;
    const keyClass = byId || (!scoped ? classOfKind(pk) : null);
    const keyKind = byId ? (keyed.split("::")[1] || null) : (keyClass ? pk : null);
    /* DEC-49 REGION is-dispose-class — REC-205/C-33.44. The code is a STRING LITERAL at its site and the
       translation comes off the row, so the guard can grade it and a member reads the same sentence
       wherever this act is reached. */
    if (keyClass === "CONDITION" || keyClass === "OBLIGATION") {
      const row = QUEUE_ACT_CHECKS.CLASS_NOT_DISPOSED;
      return { ok: false, reason: "CLASS_NOT_DISPOSED", code: "CLASS_NOT_DISPOSED",
               check: row.check, translation: row.translation,
               class: keyClass, kind: keyKind,
               instead: keyClass === "CONDITION" ? "queuemute" : "taskresolve",
               detail: `this names ${keyClass === "CONDITION" ? "a CONDITION" : "an OBLIGATION"} and `
                     + `${keyClass === "CONDITION" ? "a" : "an"} ${keyClass} is not DISPOSED: a disposition is `
                     + "an authored record act on a FINDING, and op=queue publishes the act that does "
                     + "reach this item as its `disposition.instead`. Nothing was written. The rest of "
                     + "a selection is unaffected — under the per-item weight this item alone is kept, "
                     + "carrying this reason." };
    }
    /* END DEC-49 REGION is-dispose-class */
    if (keyClass === "FINDING")
      return this.#noProjectScope({
               finding: byId ? keyed : `FINDING::${pk}::${sk}`,
               kind: keyKind,
               requires: ["project", "finding"],
               detail: "this names a FINDING that carries no progression stage, so this is the "
                     + "project-scoped disposition and it needs the project you are acting for. "
                     + "Send `project` (one of op=queue's disposition.projects for this item) and "
                     + "`finding` (its disposition.finding) instead of `key`. Nothing was written "
                     + "and no team's feed moved." });
    if (!scoped) return this.#progressions.disposeProposal({ progressionKey: pk, stageKey: sk, to, state, reason,
                                                                  definitionVersion, decidedBy });
    /* N285 (K275): a word that is no disposition is answered by progressions' `notADisposition` (its R35), the one
       site that mints NOT_A_DISPOSITION with its row, C-100.20; this act holds neither the list nor the sentence. */
    const st = typeof to === "string" ? to.trim() : (typeof state === "string" ? state.trim() : "");
    const undisposed = notADisposition(st);
    if (undisposed) return undisposed;
    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "deferring or dismissing the record's own question is recorded with a reason, in the "
                     + "member's own words — a disposition with no reason ages a finding with no account of why" };
    if (why.length > Queue.EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${Queue.EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    const by = decidedBy == null ? "" : String(decidedBy).trim();
    if (!by)
      return { ok: false, reason: "NO_DECIDER",
               detail: "a disposition is recorded under the deciding member, stamped from the session. An "
                     + "unnamed decider cannot age the record's question." };
    /* ================================================ D-266 · THE JUDGMENT-LAYER ARM
       Everything above is SHARED and is reached by both shapes on purpose: the vocabulary, the
       required reason, its grammar bound and the server-stamped decider are properties of the ACT
       and not of the subject, so a second spelling of any of them would be a second rule to keep
       in step. Only the identity differs, and only the identity is checked apart.

       THE PROJECT MUST BE A PROJECT THIS VIEWER CAN SEE. `viewerPredicate` is the ONE compilation
       point (D-15) and it fails CLOSED, so an absent or unrecognised viewer records nothing rather
       than recording under everything. The type test goes through `normalizeType` for the reason
       every other type consultation does — a legacy spelling is the same object.

       AND IT UPSERTS ON (project_id, finding_id), WHICH IS D-79's TEETH AT THE JUDGMENT LAYER: a
       team that re-triages a decision it already took keeps ONE row, re-triageable, never a second.
       The finding is AGED out of that team's open list and is deleted from nothing. */
    if (scoped) {
      const gate = viewerPredicate(viewer);
      const row = this.#one(
        `SELECT b.bundle_id, b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
        proj, ...gate.args);
      /* REC-149: at EXISTENCE the positional C-70.1; NONE falls to the unchanged answer below. */
      if (!row) { const existence = this.#existenceAct(proj, viewer); if (existence) return existence; }
      /* The scope must be a PROJECT this viewer can see; absent and invisible answer identically (REC-25), through
         membership's one answer (R78, N208). */
      if (!row || normalizeType(row.object_type) !== "project") return noSuchProject(proj, { finding: find });
      /* REC-134: the gate above is SIGHT, and every administrator sees every project. The
         judgment it records is that TEAM's (D-266: *"a stance is expressly one project's own
         property"*), so the decider must have JOINED the project it acts for (Membership v2
         §7.5). Asked after the sight gate, so a caller who cannot see the project still gets
         the absent answer above and learns nothing here. */
      const denied = this.#projectAuthority(proj, identity, "joined", "proposedispose");
      if (denied) return denied;
      const atS = stampInstant("millisecond", this.#nowMs(null));
      const kd = typeof kind === "string" && kind.trim() ? kind.trim().slice(0, 120) : null;
      this.sql.exec(
        `INSERT INTO finding_dispositions (project_id,finding_id,kind,state,reason,decided_by,at)
         VALUES (?,?,?,?,?,?,?)
         ON CONFLICT(project_id,finding_id) DO UPDATE SET
           kind=excluded.kind, state=excluded.state, reason=excluded.reason,
           decided_by=excluded.decided_by, at=excluded.at`,
        proj, find.slice(0, 400), kd, st, why.slice(0, Queue.EDGE_REASON_MAX), by.slice(0, 200), atS);
      return { ok: true, scope: "project", project: proj, finding: find.slice(0, 400),
               key: `${proj}::${find.slice(0, 400)}`, kind: kd,
               to: st, state: st, reason: why, decided_by: by, at: atS, bundle: null,
               detail: "recorded for THIS project and for no other. One team's dismissal of a "
                     + "judgment-layer finding governs that team's feed and nothing else (D-266, "
                     + "§7/D-216, R5) — no other project's queue moved by an item, and the finding "
                     + "itself is aged rather than deleted (D-79): it stands until it is "
                     + "re-triaged, whether or not the underlying fact still fires." };
    }
  }

  /** D-86: the OBLIGATION items the sweep raised, for `queueFeed`. Synchronous, like every producer there. The
   *  row is gated by `#bundleGate` over the run's `context_id` — the predicate `aiRunRead` compiles for the run
   *  itself, so an item about a run is shown exactly to the readers of that run. A member who is not a recipient
   *  is skipped unless the producer could name nobody, which is stated on the item. */
  #obligationsBiasDebt(viewer, me, now, identity) {
    /* N171: bias's `uncleared` (its R43), gated by membership's predicate over the context, newest raised first. */
    const debts = this.#bias.uncleared({ gate: viewerPredicate(viewer), limit: Queue.BIAS_DEBT_QUEUE_MAX });
    const items = [];
    for (const row of (debts && Array.isArray(debts.debts) ? debts.debts : [])) {
      const named = Array.isArray(row.recipients) ? row.recipients.filter((x) => typeof x === "string") : [];
      if (me && named.length && !named.includes(me)) continue;
      const raisedMs = Date.parse(row.raised);
      items.push({
        id: `OBLIGATION::bias-debt::${row.run}`,
        class: "OBLIGATION",
        kind: "bias-debt",
        case: this.#queueAncestors([row.context_id], viewer),
        subject: { kind: "run", id: row.run, context: { type: row.context_type, id: row.context_id } },
        summary: "The lens this assistant's run was formed under has changed since it opened; a re-run under "
               + "the lens now in force is owed. This is disclosed and blocks nothing.",
        detail: null,
        basis: { source: "bias.uncleared", computed_by: "aiRunRead", run: row.run, moved: true,
                 moved_basis: row.moved_basis, lens_then: row.lens_then, lens_now: row.lens_now,
                 observed: row.observed,
                 stated: `the run's lens was ${row.lens_then ?? "none in force"} `
                       + `(${row.moved_basis === "at_open" ? "the lens in force when it opened" : "the lens it was handed"}) `
                       + `and is ${row.lens_now ?? "none in force"} now`,
                 detail: "bias debt is DISCLOSED and travels with the work; only an uncleared hunch refuses "
                       + "publication (DEC-20). Whether the lens moved is op=airun's own comparison, read by the "
                       + "sweep and never recomputed." },
        age: Number.isFinite(raisedMs)
          ? { state: "determined", since: row.raised, ms: Math.max(0, now - raisedMs) }
          : { state: "undetermined", reason: "unparseable_raised",
              detail: "the debt row carries a raised stamp this producer cannot read as an instant" },
        assignee: null,
        assignee_role: null,
        recipients: named,
        ...(named.length ? {} : { recipients_stated: "no member could be named inside this run's read gate, so "
                                  + "it is offered to every member who can read the run" }),
        options: this.#queueOptions([row.context_id], viewer, identity),
      });
    }
    return items;
  }
  static BIAS_DEBT_QUEUE_MAX = 200;

  /** The RULED routing order, resolved at write time by the consumer.
   *
   *  1. the referred bundle's project manager, 2. a group admin, 3. nobody.
   *  A project's MANAGER is its owner in `project_participants`; the referred
   *  bundle is usually Information rather than a project, so a project that
   *  CITES it counts, which is what "the referred bundle's project" means in a
   *  record where evidence is shared and projects point at it.
   *
   *  Returns a `basis` for the drain report but never stores it on the task:
   *  the grammar is closed and a field invented here would be a second grammar. */
  #routeTask(bundleId) {
    const info = this.#record.bundleInfo(bundleId);
    const b = info ? { object_type: info.type } : null;
    /* membership R65 (the owners, in the order they became owners) and R68 (each one's status): the first active. */
    const ownerOf = (projectId) => {
      const id = this.#membership.projectOwners(projectId)
        .find((m) => (this.#membership.memberFacts(m) || {}).status === "active");
      return id ? { member_id: id } : null;
    };
    if (b && b.object_type === "project") {
      const o = ownerOf(bundleId);
      if (o) return { assignee: o.member_id, assignee_role: "project-manager", basis: "owner of the referred project" };
    }
    /* D-280, site (b), and it is D-267's own harm one op over: `refs` carries
       the RELATION and DROPS the STATUS, so the project this arm hands the
       obligation to may be one that WITHDREW from the bundle it is being made
       responsible for. Same ONE predicate as the bar read and the homes walk.
       THE ARM'S OWN SHAPE IS PRESERVED DELIBERATELY: it took the FIRST citing
       project by id and, if that project had no active owner, fell straight
       through to the admin fallback rather than trying the second. That is
       still what happens — the only change is that a WITHDRAWN citer is not
       the one considered. Falling through costs a task a step down a chain
       that already existed and ends at `unassigned`, which is visible and
       routable by hand; addressing it to someone who left is not. */
    const citeEdges = new Map();
    for (const r of this.#rows(
      `SELECT r.bundle_id AS project_id, r.kind FROM refs r
         JOIN bundles pb ON pb.bundle_id = r.bundle_id AND pb.object_type = 'project'
        WHERE r.target_id = ? ORDER BY r.bundle_id`, bundleId)) {
      if (!citeEdges.has(r.project_id)) citeEdges.set(r.project_id, []);
      citeEdges.get(r.project_id).push(r.kind);
    }
    const cite = [...citeEdges].find(([pid, kinds]) =>
      !kinds.every((k) => this.#refEdgeSevered(pid, bundleId, k || null)));
    if (cite) {
      const o = ownerOf(cite[0]);
      if (o) return { assignee: o.member_id, assignee_role: "project-manager", basis: `owner of ${cite[0]}, which cites this bundle` };
    }
    /* membership's active administrators, in the order the roster holds them, the founder (who is no member row, and
       holds no task) aside: the earliest. */
    const first = this.#activeAdmins().find((m) => m !== "admin");
    const adm = first ? { member_id: first } : null;
    if (adm) return { assignee: adm.member_id, assignee_role: "group-admin", basis: "no project manager; the RULED fallback to a group admin" };
    /* Named honestly rather than assigned to someone who does not exist. An
       unassigned task is still visible and still routable by hand; a task
       addressed to a phantom is not. */
    return { assignee: "unassigned", assignee_role: "group-admin", basis: "no project manager and no active administrator" };
  }

  #taskOf(row) {
    let locators = null, history = [];
    try { locators = row.locators ? JSON.parse(row.locators) : null; } catch { locators = null; }
    try { history = JSON.parse(row.history); } catch { history = []; }
    return {
      id: row.id, kind: row.kind, refers_to: row.refers_to,
      subject: { text: row.subject_text, ...(row.subject_desc ? { description: row.subject_desc } : {}) },
      ...(locators && locators.length ? { locators } : {}),
      assignee: row.assignee, assignee_role: row.assignee_role,
      status: row.status, created: row.created,
      ...(row.resolved_at ? { resolved_at: row.resolved_at } : {}),
      history,
    };
  }

  /** The C-19.1 grammar, run against a candidate task before it is stored.
   *  R41: the ONE function `checks.mjs` holds, the same one the promotion check and the audit check below run, never a
   *  copy: a second grammar pretending to be the same one is the failure this reuse exists to avoid. */
  #refuseUngrammatical(task) {
    const findings = [];
    checkInboxGrammar(
      { files: new Map([["data/inbox.json", JSON.stringify({ tasks: [task] })]]),
        resolveTarget: (id) => this.#record.bundleInfo(id) !== null },
      findings);
    const errs = findings.filter((x) => x.severity === "error");
    return errs.length ? { ok: false, reason: "UNGRAMMATICAL", findings: errs.map((e) => ({ check: e.check, detail: e.message })) } : null;
  }

  /** R41 (N325): C-19.1 at the WRITE, registered with promotion (its R39), as monitoring registers C-18.5 (its R27).
   *  A task list is validated where it lands, not only by the audit: a malformed `data/inbox.json` never lands, so
   *  nobody has to read it to find out it was junk. A replay is historical and not authorship, so it is exempt from
   *  THIS check and nothing else, and the manifest marks it; a promotion carrying no `data/inbox.json` is not asked. */
  inboxCheck(c) {
    const files = Array.isArray(c && c.files) ? c.files : [];
    const replay = !!(c && (c.replay || (c.pkg && c.pkg.replay)));
    const inbox = replay ? null : files.find((f) => f && f.path === "data/inbox.json");
    if (!inbox || typeof inbox.text !== "string") return null;
    const found = [];
    checkInboxGrammar({ files: new Map([["data/inbox.json", inbox.text]]) }, found);
    const errs = found.filter((x) => x.severity === "error");
    if (!errs.length) return null;
    /* DEC-49 REGION is-inbox-refused — R41/C-19.2. */
    return { ok: false, reason: "INBOX_REFUSED", code: "INBOX_REFUSED",
             check: QUEUE_INBOX_CHECKS.INBOX_REFUSED.check, translation: QUEUE_INBOX_CHECKS.INBOX_REFUSED.translation,
             findings: errs.map((x) => ({ check: x.check, detail: x.message })),
             detail: `data/inbox.json does not meet the task grammar (C-19.1): ${errs.length} `
                   + `error${errs.length === 1 ? "" : "s"}, each named in findings. Nothing was written.` };
    /* END DEC-49 REGION is-inbox-refused */
  }

  /** R41 (N325): C-19.1 in the audit over one bundle image (record-core R59), as `checkBundle` ran it: each error is a
   *  C-19.1 finding, a reference resolved against the whole store by the audit's own `resolveTarget`. */
  audit(image) {
    const files = image && image.files instanceof Map ? image.files : null;
    if (!files) return [];
    const findings = [];
    checkInboxGrammar({ files, resolveTarget: typeof image.resolveTarget === "function" ? image.resolveTarget : undefined },
      findings);
    return findings;
  }

  /* ------------------------------------------------------------------ the store's counts and the id ledger (R42) */

  /** R42 (N342; record-core R63): this module's four figures, each a row count with the rows naming a bundle in `hid`
   *  (the caller's `{sql, args}`, or null) left out: `tasks` by `refers_to`, `findingDispositions` by `project_id`,
   *  `queueState` by `case_id`; `queueItemMutes` names no bundle and is counted whole. A figure that cannot be read is
   *  null, never zero. Synchronous; writes nothing; never throws. */
  counts(hid = null) {
    const h = hid && typeof hid === "object" && typeof hid.sql === "string" && Array.isArray(hid.args) ? hid : null;
    const c = (t, ...keys) => {
      try {
        const conds = h ? keys.map((k) => `COALESCE(${k}, '') NOT IN ${h.sql}`) : [];
        const args = h ? keys.flatMap(() => h.args) : [];
        const n = Number(this.#one(`SELECT count(*) AS c FROM ${t}${conds.length ? ` WHERE ${conds.join(" AND ")}` : ""}`,
          ...args).c);
        return Number.isFinite(n) ? n : null;
      } catch { return null; }
    };
    return { tasks: c("tasks", "refers_to"), findingDispositions: c("finding_dispositions", "project_id"),
             queueState: c("queue_state", "case_id"), queueItemMutes: c("queue_item_mutes") };
  }
  static COUNT_KEYS = Object.freeze(["tasks", "findingDispositions", "queueState", "queueItemMutes"]);

  /** R42 (N342; record-core R40, review's `seedLedger` shape): the opaque minter's ledger learns every TASK id standing
   *  in a live row, at start and again before this module's first mint, so an id a store minted before the ledger
   *  existed is never drawn twice, even after a purge deletes the row it stood in. On a store whose ledger table (or
   *  whose `tasks`) is not yet created it learns nothing and never throws: a throw at construction would take the
   *  instance down, and the next call learns. */
  seedLedger() {
    if (this.#seeded) return;
    try {
      this.#record.seedMintLedger([["TASK", "tasks", "id"]]);
      this.#seeded = true;
    } catch { /* not yet: the next call learns */ }
  }
  #seeded = false;

  /** CONSUMER, and the SOLE writer of tasks.
   *
   *  Drains queued events, resolves each capture to the bundle that filed it,
   *  applies the routing order and the grammar, and folds a repeat into the
   *  live task rather than spawning a duplicate. An event whose capture has not
   *  been promoted into any bundle yet simply WAITS: at capture time no bundle
   *  exists, and inventing a refers_to would be worse than being patient. */
  taskDrain({ limit = 50, actor = "consumer", now = null } = {}) {
    const cap = clampLimit(limit, 50, 500);
    const at = now && ISO_INSTANT.test(now) ? now : stampInstant("second", this.#nowMs(null));
    /* capture R45: the queued events oldest first, each `{kind, captureSha, subject, locator, enqueued, attempts}`;
       provenance R4: the bundle a capture is filed in. */
    const queued = this.#capture.taskEvents({ limit: cap })
      .map((e) => ({ ...e, capture_sha: e.captureSha, attempts: Number(e.attempts) || 0 }));
    const out = { drained: 0, created: [], folded: [], waiting: [], refused: [] };
    const drop = (q) => this.#capture.taskEventRemove({ kind: q.kind, captureSha: q.capture_sha });
    for (const q of queued) {
      const home = this.#provenance.homeOf(q.capture_sha);
      const reg = home ? { bundle_id: home.bundleId } : null;
      if (!reg) {
        this.#capture.taskEventAttempt({ kind: q.kind, captureSha: q.capture_sha, at });
        out.waiting.push({ captureSha: q.capture_sha, attempts: q.attempts + 1,
          detail: "the capture is not yet filed in any bundle; the event is kept, not dropped" });
        continue;
      }
      const live = this.#one(
        `SELECT * FROM tasks WHERE refers_to=? AND kind=? AND status IN ('open','forwarded')`, reg.bundle_id, q.kind);
      if (live) {
        /* The RULED fold. The task already in front of a member is the one that
           matters; a re-capture adds a dated note to it and nothing else. */
        const hist = this.#taskOf(live).history;
        hist.push({ at, event: "folded", actor });
        this.sql.exec(`UPDATE tasks SET history=? WHERE id=?`, JSON.stringify(hist), live.id);
        drop(q);
        out.folded.push({ id: live.id, refers_to: reg.bundle_id });
        out.drained++;
        continue;
      }
      const route = this.#routeTask(reg.bundle_id);
      const year = at.slice(0, 4);
      const slug = taskSlug(q.subject);
      /* REC-151: OPAQUE, never the TASK counter (Membership v2 §7) — a task naming a bundle the viewer cannot see
         is withheld (REC-30), so a counted id told a member how many tasks existed that they could not read. On
         exhaustion the event is KEPT, as an unfiled capture's is, never dropped, and its `waiting` entry carries the
         one answer to that condition, record-core's `mintExhausted("TASK")` (its R62; R23, N322): its code, row and
         sentence, minted there and nowhere here. */
      this.seedLedger();     // R42: the ledger has learned every live TASK id before the first mint draws one
      const taskId = this.#record.mintOpaqueId("TASK", year, `-${slug}`,
        (id) => !!this.#one(`SELECT 1 FROM tasks WHERE id=?`, id));
      if (!taskId) {
        const exhausted = mintExhausted("TASK");
        out.waiting.push({ captureSha: q.capture_sha, attempts: q.attempts,
          code: exhausted.code, check: exhausted.check, detail: exhausted.detail });
        continue;
      }
      const task = {
        id: taskId,
        kind: q.kind,
        refers_to: reg.bundle_id,
        subject: { text: q.subject },
        ...(q.locator && isHttpsPublic(q.locator) ? { locators: [q.locator] } : {}),
        assignee: route.assignee,
        assignee_role: route.assignee_role,
        status: "open",
        created: at,
        history: [{ at, event: "created", actor }],
      };
      const bad = this.#refuseUngrammatical(task);
      if (bad) {
        /* Refused rather than stored malformed, and the event is DROPPED rather
           than retried forever: a grammar failure is deterministic, so retrying
           it is a loop. The refusal is reported so it is visible. */
        drop(q);
        out.refused.push({ captureSha: q.capture_sha, refers_to: reg.bundle_id, findings: bad.findings });
        out.drained++;
        continue;
      }
      this.sql.exec(
        `INSERT INTO tasks (id, kind, refers_to, capture_sha, subject_text, subject_desc, locators,
                            assignee, assignee_role, status, created, resolved_at, history)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        task.id, task.kind, task.refers_to, q.capture_sha, task.subject.text, null,
        task.locators ? JSON.stringify(task.locators) : null,
        task.assignee, task.assignee_role, task.status, task.created, null,
        JSON.stringify(task.history));
      drop(q);
      out.created.push({ id: task.id, refers_to: task.refers_to, assignee: task.assignee,
        assignee_role: task.assignee_role, basis: route.basis });
      out.drained++;
    }
    out.remaining = this.#capture.taskEventCount();
    /* REC-57: `remaining` was already here and is UNTOUCHED — it answers "is
       this all of it" (a non-zero remainder says the queue is not drained), so
       no `truncated` is minted beside it. The missing half is the bound: a
       caller that sees work left needs to know what cap produced this pass to
       decide between running it again and asking for a bigger one. */
    out.limit = cap;
    return { ok: true, ...out };
  }

  /** Read the inbox. Filterable by assignee and status, because the first thing
   *  a member wants is their own open work.
   *
   *  REC-30: a task's `refers_to` IS a bundle id (taskDrain writes the registering
   *  bundle's), and the row's whole subject is that bundle — its `subject_text`
   *  describes the document, and `refersTo` lets a caller ASK about one. So the
   *  D-15 predicate withholds the row, not a field, and it governs the `tasks`
   *  filter too: an uninvited member asking `refers=<a hidden project>` gets the
   *  same empty answer as for a bundle that does not exist.
   *
   *  The three task COUNTS are gated with the rows for REC-25's reason: a count
   *  bigger than the list says something is hidden, which is half the leak.
   *  `queued` is not — `task_queue` rows carry a capture sha and no bundle, so
   *  the number names nothing. */
  taskList({ assignee = null, status = null, refersTo = null, limit = 200, viewer = null } = {}) {
    const cap = clampLimit(limit, 200, 1000);
    /* `tk.` and not a bare column: see #bundleGate's refusal. */
    const seen = this.#bundleGate("tk.refers_to", viewer);
    const where = [`(${seen.sql})`], args = [...seen.args];
    if (assignee) { where.push("tk.assignee = ?"); args.push(assignee); }
    if (status) { where.push("tk.status = ?"); args.push(status); }
    if (refersTo) { where.push("tk.refers_to = ?"); args.push(refersTo); }
    /* REC-57: cap + 1 asked for, cap delivered. `counts` cannot answer this and
       never could — the three figures are per STATUS over the whole visible set
       and take no notice of `assignee` or `refers`, so a caller filtering by
       either was comparing its rows against a population they are not drawn
       from. UI-39 inferred the bound from that arithmetic and worded it as an
       inference because it was one; asking for one row past the cap is what
       makes it a fact. */
    const page = this.#rows(
      `SELECT tk.* FROM tasks tk WHERE ${where.join(" AND ")} ORDER BY tk.created DESC, tk.id LIMIT ?`,
      ...args, cap + 1);
    const rows = page.slice(0, cap);
    const n = (st) => this.#one(
      `SELECT count(*) c FROM tasks tk WHERE tk.status=? AND (${seen.sql})`, st, ...seen.args).c;
    return {
      ok: true,
      tasks: rows.map((r) => this.#taskOf(r)),
      /* REC-57: THE BOUND, AND WHETHER IT BIT — `op=queue`'s spelling exactly.
         These two ops sit on the same surface and answer the same question, and
         until now `queue` published `truncated` and `tasks` did not, so a
         consumer that read one correctly read the other wrongly. One shape, one
         name; `limit` is the cap after clamping, matching `op=search`. */
      limit: cap,
      truncated: page.length > cap,
      counts: {
        open: n("open"),
        forwarded: n("forwarded"),
        resolved: n("resolved"),
        queued: this.#capture.taskEventCount(),
      },
    };
  }

  /** REC-4: the TASK-ACTOR FENCE, shared by taskForward and taskResolve.
   *
   *  The construct's accountability rule (BIO_Interaction_Constructs_v0_1.md,
   *  T · TASK): a task is an obligation with an ASSIGNEE, and its refusal shape
   *  is "this is not yours to resolve, and here is who it is with." Stamping the
   *  actor honestly into history made the act TRACEABLE but did not PREVENT it,
   *  so any member-class credential could resolve or forward ANY task by id. This
   *  is the prevention. The UI (UI-1) hides the verb on another member's task,
   *  but that gating is cosmetic until the plane enforces it — a caller that
   *  reaches the op directly must be refused here.
   *
   *  Who may act, and why:
   *   - the ASSIGNEE — it is theirs; a task is "mine" (the construct's word).
   *   - an ADMIN MEMBER — `#isAdminMember` (the ROOT admin session, actor
   *     "admin"; or any in-app member with role='admin'), the same "group admin"
   *     the routing (#routeTask) falls back to. The admin override stays.
   *   - any MEMBER, when the task is honestly `unassigned` — D-98's routing
   *     intends an unassigned task to stay CLAIMABLE and "routable by hand". An
   *     unassigned task exists PRECISELY because routing found no project manager
   *     and no active admin (#routeTask's last arm), so requiring assignee-or-
   *     admin would strand it forever — the exact over-fencing REC-4 warns
   *     against. DEC-7 raises whether "claimable" should be narrowed to the
   *     routed role (member_expertise → PM → group admin) rather than any actor,
   *     and KEEPS it open: the routing that produced `unassigned` had already
   *     exhausted PM and active admin, and member_expertise is doctrine'd as a
   *     HINT for a human forward rather than an automatic gate.
   *
   *  WHAT THIS FENCE DOES NOT ANSWER, corrected 2026-08-04 (REC-28, D-151), and
   *  the correction is the point of the item. This comment used to say that a
   *  machine credential (`actor` = "token:member" / "token:probe" /
   *  "token:admin") "is neither a member nor ROOT_ADMIN, so it is fenced off an
   *  ASSIGNED task and can only act on an unassigned one", and cited D-98's "a
   *  daemon cannot close somebody's work". Every clause of that was true and it
   *  described a guarantee the code did not make: the FIRST line below allows on
   *  `unassigned` BEFORE it has looked at the caller at all, so a machine could
   *  RESOLVE an unassigned task and close an obligation with no member act. A
   *  daemon cannot close somebody's work; it could close NOBODY'S work, and
   *  closing is the act.
   *
   *  The hole is closed at the ACT and not here (taskForward/taskResolve refuse
   *  `token:` actors BY SHAPE with MACHINE_CANNOT_FORWARD/MACHINE_CANNOT_RESOLVE,
   *  the MACHINE_CANNOT_RELEASE precedent), so the refusal does not depend on
   *  assignment state at all. BOTH fences stay, because they answer different
   *  questions and the second is not derivable from the first: THIS one answers
   *  *is this THIS member's task*, and the act refusal answers *is this a person
   *  at all*. So the "anyone" above now honestly reads "any member" — not
   *  because this function checks it, but because no machine reaches this
   *  function on these two verbs any more.
   *
   *  Returns a NOT_YOURS refusal NAMING who it is with, or null to proceed. */
  #refuseNotYours(row, actor, verb) {
    if (row.assignee === "unassigned") return null;
    if (actor === row.assignee) return null;
    if (this.#isAdminMember(actor)) return null;
    /* DEC-49 REGION is-task-actor-fence — D-126/C-76.1: `code`, `check` and `translation` added (a queue
       selection now surfaces this refusal to a member); `reason`, `detail` and the assignee are unchanged. */
    return {
      ok: false,
      reason: "NOT_YOURS",
      code: "NOT_YOURS",
      check: TASK_ACTOR_CHECKS.NOT_YOURS.check,
      translation: TASK_ACTOR_CHECKS.NOT_YOURS.translation,
      detail: `this task is not yours to ${verb}; it is with ${row.assignee}`,
      assignee: row.assignee,
      assignee_role: row.assignee_role,
    };
    /* END DEC-49 REGION is-task-actor-fence */
  }

  /** Forward a task to a member better placed to attest it.
   *
   *  A MEMBER action, never a daemon one: the ruling makes forwarding a human
   *  judgement, and `member_expertise` is a hint for that human rather than an
   *  automatic reassignment. The prior assignment stays in history, because who
   *  a task was taken FROM is as much a fact as who holds it now.
   *
   *  REC-28 / D-151: "never a daemon one" is now ENFORCED and not only stated.
   *  A machine credential's actor is stamped `token:<class>` by the control
   *  plane, so it is refused BY SHAPE — the MACHINE_CANNOT_RELEASE / CONCLUDE /
   *  REOPEN precedent, and the same one rule in a fifth place: a machine may
   *  surface, route and prepare; a member authors, resolves and forwards. It is
   *  checked BEFORE the row is read, so unlike the TASK-ACTOR FENCE it cannot
   *  depend on assignment state — which is exactly how the hole existed.
   *
   *  The precedent's `who === "member"` arm does NOT carry over, deliberately:
   *  on these two verbs the control plane stamps every machine credential
   *  `token:<class>` (never a bare class word), while the bare string "admin" is
   *  a LEGITIMATE actor here — it is ROOT_ADMIN's own session (`#isAdminMember`)
   *  — so a bare-class arm would refuse the root administrator's browser.
   *
   *  REC-46 (2026-08-04): that difference SURVIVED the sweep rather than being
   *  smoothed away, and it is the one site in this class that means something
   *  narrower. These two verbs ask `isMachineStamp` — did the control plane
   *  MINT this identity — while the nine act guards ask `isMachineIdentity`,
   *  which additionally refuses a bare class word and a surface/AI name. Both
   *  are derived from the SAME `MACHINE_STAMP_PREFIXES` in the catalog, so the
   *  spelling still moves in one place and moves here too; what is deliberately
   *  not shared is the bare-class arm, for the reason in the paragraph above. */
  taskForward({ id = null, to = null, actor = null, now = null, items } = {}) {
    /* D-126: WITH `items`, a SET under the PER-ITEM weight; the actor (the control plane's stamp) is forced
       onto every item. */
    if (items !== undefined)
      return this.#perItem("taskforward", { items, to, now }, { actor }, (b) => this.taskForward(b));
    if (!actor) return { ok: false, reason: "NO_ACTOR", detail: "a forward is recorded under the member who made it" };
    /* DEC-49 REGION is-machine-forward — REC-64/C-32.10. The fence alone. REC-73
       measured that this pair is the ONLY one of the twelve with a second
       independent fence behind it, so the span stops before that one. */
    if (isMachineStamp(actor))                          /* REC-46: the NARROW predicate, deliberately — see the note above */
      return { ok: false, reason: "MACHINE_CANNOT_FORWARD", code: "MACHINE_CANNOT_FORWARD",
               check: QUEUE_MACHINE_CHECKS.MACHINE_CANNOT_FORWARD.check,
               translation: QUEUE_MACHINE_CHECKS.MACHINE_CANNOT_FORWARD.translation,
               detail: "forwarding a task hands an obligation to a named person, and deciding who is "
                     + "better placed to answer it is a member's judgement. A machine credential may "
                     + "surface a task and route it at drain time, and may not re-address one. "
                     + "Sign in as a member." };
    /* END DEC-49 REGION is-machine-forward */
    const row = this.#one(`SELECT * FROM tasks WHERE id=?`, id);
    if (!row) return { ok: false, reason: "NO_SUCH_TASK" };
    if (row.status === "resolved") return { ok: false, reason: "ALREADY_RESOLVED", detail: "a resolved task is not forwarded; a new determination opens a new task" };
    const fenced = this.#refuseNotYours(row, actor, "forward");
    if (fenced) return fenced;
    /* membership R68: an active member by that id. */
    const facts = typeof to === "string" && to ? this.#membership.memberFacts(to) : null;
    const target = facts && facts.status === "active" ? { member_id: to } : null;
    if (!target) return { ok: false, reason: "NO_SUCH_MEMBER", detail: "a task is forwarded to an active member of this group" };
    if (target.member_id === row.assignee) return { ok: false, reason: "ALREADY_THEIRS" };
    const at = now && ISO_INSTANT.test(now) ? now : stampInstant("second", this.#nowMs(null));
    const task = this.#taskOf(row);
    task.history.push({ at, event: "forwarded", actor });
    task.assignee = target.member_id;
    task.assignee_role = "member";
    task.status = "forwarded";
    const bad = this.#refuseUngrammatical(task);
    if (bad) return bad;
    this.sql.exec(`UPDATE tasks SET assignee=?, assignee_role=?, status=?, history=? WHERE id=?`,
      task.assignee, task.assignee_role, task.status, JSON.stringify(task.history), id);
    return { ok: true, id, assignee: task.assignee, assignee_role: task.assignee_role, from: row.assignee, at };
  }

  /** Resolve a task. Also a member action — and, as of REC-28 (D-151), a member
   *  action the code enforces rather than a comment that describes one.
   *
   *  RESOLVING IS THE CLOSING ACT: the obligation the record raised is answered
   *  and stops asking. Before this refusal a machine credential could close an
   *  UNASSIGNED task, because the TASK-ACTOR FENCE allows on `unassigned` before
   *  it looks at the caller — an obligation discharged with `actor:
   *  "token:probe"` in its history and no member anywhere in it. The refusal is
   *  at the ACT and by SHAPE (the MACHINE_CANNOT_RELEASE / CONCLUDE / REOPEN
   *  precedent), checked before the row is read, so it holds whatever the task's
   *  assignment is.
   *
   *  `taskDrain` is deliberately untouched and is the daemon's path: draining
   *  turns queued events into tasks and ROUTES them, which is surfacing work
   *  rather than discharging it. Nothing a drain does closes an obligation. */
  taskResolve({ id = null, actor = null, now = null, items } = {}) {
    /* D-126: WITH `items`, a SET under the PER-ITEM weight; the actor is forced onto every item. */
    if (items !== undefined)
      return this.#perItem("taskresolve", { items, now }, { actor }, (b) => this.taskResolve(b));
    if (!actor) return { ok: false, reason: "NO_ACTOR", detail: "a resolution is recorded under the member who made it" };
    /* DEC-49 REGION is-machine-resolve — REC-64/C-32.11. The fence alone. */
    if (isMachineStamp(actor))                          /* REC-46: the NARROW predicate, deliberately — see the note above */
      return { ok: false, reason: "MACHINE_CANNOT_RESOLVE", code: "MACHINE_CANNOT_RESOLVE",
               check: QUEUE_MACHINE_CHECKS.MACHINE_CANNOT_RESOLVE.check,
               translation: QUEUE_MACHINE_CHECKS.MACHINE_CANNOT_RESOLVE.translation,
               detail: "resolving a task says the obligation the record raised has been answered, and "
                     + "that is a named member's act. A machine credential may surface a task, route it "
                     + "and prepare what it needs, and may not close it — an unassigned task is nobody's "
                     + "work, and closing nobody's work is still closing. Sign in as a member." };
    /* END DEC-49 REGION is-machine-resolve */
    const row = this.#one(`SELECT * FROM tasks WHERE id=?`, id);
    if (!row) return { ok: false, reason: "NO_SUCH_TASK" };
    if (row.status === "resolved") return { ok: true, id, already: true, resolved_at: row.resolved_at };
    const fenced = this.#refuseNotYours(row, actor, "resolve");
    if (fenced) return fenced;
    const at = now && ISO_INSTANT.test(now) ? now : stampInstant("second", this.#nowMs(null));
    const task = this.#taskOf(row);
    task.history.push({ at, event: "resolved", actor });
    task.status = "resolved";
    task.resolved_at = at;
    const bad = this.#refuseUngrammatical(task);
    if (bad) return bad;
    this.sql.exec(`UPDATE tasks SET status=?, resolved_at=?, history=? WHERE id=?`,
      task.status, at, JSON.stringify(task.history), id);
    return { ok: true, id, status: "resolved", resolved_at: at };
  }

  static PER_ITEM_MAX = PER_ITEM_MAX;   /* affordances.mjs: ONE number, published as set_acts[].max_items */
  #perItem(act, body, stamped, one) {
    const a = PER_ITEM_ACTS.find((x) => x.id === act);
    return perItem(act, body, stamped, one, { itemKeys: a && a.item_keys, sharedKeys: a && a.shared_keys });
  }

  /* ------------------------------------------------------------------ the two scheduler consumers (R22, R23)
     `scheduler` is earlier and keeps its registry; this module registers into it at start (K31, scheduler R8). */

  #drainDelayMs() {
    const v = Number(this.#env && this.#env.TASK_DRAIN_DELAY_MS);
    return Number.isFinite(v) && v >= 0 ? v : Queue.TASK_DRAIN_DELAY_MS;
  }
  #lastDrainProgress = true;     // did the last drain tick make progress — decides DELAY vs BACKSTOP on re-arm

  /** capture's task notice (capture R44): a queued event re-arms the drain at its short delay. */
  async armDrain() { this.#lastDrainProgress = true; return await this.#scheduler.arm(); }

  /** R23: the `task-drain` consumer: due at every firing; its wake is the delay after a tick that drained something,
   *  the backstop after one that drained nothing, and null with no event queued. */
  drainConsumer() {
    return { name: "task-drain", key: "drain",
      due:  (now) => now,
      wake: (now) => this.#capture.taskEventCount() > 0
                       ? now + (this.#lastDrainProgress ? this.#drainDelayMs() : Queue.TASK_DRAIN_BACKSTOP_MS)
                       : null,
      tick: ()    => { const d = this.taskDrain({ limit: Queue.TASK_DRAIN_ALARM_BATCH, actor: "alarm" });
                       this.#lastDrainProgress = d.drained > 0; return { drain: d }; } };
  }

  /** R22: the `queue-renotify` consumer: due when a snooze has expired, waking at the earliest future one; it writes
   *  nothing. */
  renotifyConsumer() {
    return { name: "queue-renotify", key: "queuerenotify",
      due:  (now) => this.#queueRenotifyExpired(now) > 0 ? now : null,
      wake: (now) => this.#queueRenotifyWake(now),
      tick: (now) => ({ queuerenotify: { expired: this.#queueRenotifyExpired(now),
                                         next: this.#queueRenotifyWake(now) } }) };
  }
}

const OF = new WeakMap();

/** K61: the one queue instance for this Durable Object's storage (`ctx`, or the storage itself). On first reaching it,
 *  its tables are declared to record-core's purge (R36), its four figures registered with record-core's counts and its
 *  TASK ledger seeded (R42), C-19.1 registered with promotion and with record-core's audit (R41), and, unless
 *  `deps.start` is false, its two scheduler consumers and capture's task notice are registered (R22, R23; capture R44). */
export function queueOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let q = OF.get(storage);
  if (!q) {
    q = new Queue({ host: ctx, storage, deps: { ...(deps || {}) } });
    OF.set(storage, q);
    const record = (deps && deps.record) || recordOf(ctx);
    record.declarePurge("queue", [
      { name: "queue_state", keys: ["case_id"] },
      { name: "tasks", keys: [] },
      { name: "queue_item_mutes", keys: [] },
      { name: "finding_dispositions", keys: [] },
    ]);
    /* R42 (N342): the four figures `op=stats` and purge's proof read (record-core R63), and the TASK ledger's seed. */
    record.registerCounts("queue", [...Queue.COUNT_KEYS], (hid) => q.counts(hid));
    q.seedLedger();
    /* R41 (N325): C-19.1 at the write (promotion R39) and in the audit (record-core R59), one function at both. */
    record.registerAuditCheck("queue", (image) => q.audit(image));
    const promotion = (deps && deps.promotion)
      || promotionOf(ctx, { record, ...(deps && deps.membership ? { membership: deps.membership } : {}) });
    promotion.registerStep("queue", { check: (c) => q.inboxCheck(c) });
    if (!deps || deps.start !== false) {
      const scheduler = (deps && deps.scheduler) || schedulerOf(ctx, deps && deps.env);
      scheduler.register("queue", q.drainConsumer());
      scheduler.register("queue", q.renotifyConsumer());
      const capture = (deps && deps.capture) || captureOf(ctx);
      capture.on("task", "queue", async () => ({ armedAt: await q.armDrain() }));
    }
  }
  return q;
}

/* The ops this module answers, as entries of the legacy store's op map (its dispatcher spreads them in; K3). `member`,
   `viewer` and `identity` are the control plane's stamps, read from the URL AFTER the body spread so a body never
   supplies one (R37); the decider and the actor ride in the body, stamped there by the control plane. */
export function queueOps(q, url, body) {
  const s = (k) => url.searchParams.get(k);
  return {
    queue: () => q.queueFeed({ member: s("member"), viewer: s("viewer"), nowMs: s("now"), limit: s("limit") }),
    queuemute: () => q.queueMute({ ...(body || {}), member: s("member"), viewer: s("viewer") }),
    queuesnooze: () => q.queueSnooze({ ...(body || {}), member: s("member"), viewer: s("viewer") }),
    proposedispose: () => q.proposeDispose({ ...(body || {}), viewer: s("viewer"), identity: s("identity") }),
    taskdrain: () => q.taskDrain(body || {}),
    tasks: () => q.taskList({ assignee: s("assignee"), status: s("status"), refersTo: s("refers"),
                              limit: s("limit"), viewer: s("viewer") }),
    taskforward: () => q.taskForward(body || {}),
    taskresolve: () => q.taskResolve(body || {}),
  };
}

/** R17: the control plane's half of `op=queue`, given the store's answer `r` (never null: a store silence is the
 *  control plane's own answer), the control plane's act gate `gate` (`{needs, mode}`, affordances' decorate) and the
 *  action kinds `actions` answers at this call (actions R42). A refusal is passed through with status 400; an answer
 *  has every option decorated, so an option equals the act `op=affordances` publishes for that subject, and carries
 *  the vocabularies `affordances.vocabulariesFor(kinds)` publishes. Pure; never throws on a well-formed answer. */
export function queueAnswer(r, { gate, kinds } = {}) {
  if (!r || r.ok !== true) return { status: 400, refusal: r };
  return { status: 200, result: {
    ...r,
    items: (r.items || []).map((i) => ({ ...i, options: (i.options || []).map((a) => decorate(a, gate)) })),
    vocabularies: vocabulariesFor(kinds),
  } };
}
