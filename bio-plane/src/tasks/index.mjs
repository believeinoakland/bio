/* tasks — the obligation inbox, "Ask for a check" and "Ask an owner to sign" (requirements: `build/requirements/tasks.md`,
 * R1–R19).
 * Split out of `queue` at T16 (N363; Bob's K507, seams K531, `build/plan/draft-N363-queue-split.md`): tasks routed from
 * captures whose authority is undetermined, drained from capture's queue under the task grammar (C-19.1), listed to the
 * members who may see their subjects, and forwarded or resolved by their assignee, anyone when unassigned, or an
 * administrator.
 *
 *   taskDrain, taskList, taskForward, taskResolve   the inbox (R1–R3); the task grammar C-19.1 at the write, in the audit
 *                  and at the drain (R4); the `tasks` figure and the TASK ledger's seed (R5).
 *   recentTasks, resolvedTasks, taskExists           the three reads `queue`'s feed makes of the inbox (R6).
 *   checkRequest, checkTake, checkRecord             "Ask for a check" (T34, N557; DEC-135, Bob's): the owner's request,
 *                  addressed by expertise and sight (membership R106) or to a named member, each addressee's To do,
 *                  the first take, and the check or reasoned concern (R13–R15, R17).
 *   checkRequests, checksOf                          the requester's read of their requests, and the checks on a target (R16).
 *   signRequest                                      "Ask an owner to sign" (T47; DEC-207 (8)): a prepared case edition put in
 *                  each owner's To do, closed by that owner or when the edition is signed (R19).
 *   taskDecide                                       (T51; K4169, UC-046) the member's decision on an authority task: recorded through
 *                  provenance and the task resolved in one transaction (R20); R21's `resolved_undecided` for the task put aside.
 *   DECLARED_OPS                                     the whole declaration of each op the screens send, read from its arm (R22, R23).
 *
 * REACHED as `tasksOf(ctx, deps)` (K61): one instance per Durable Object storage, created on the first call. At that
 * call it seeds its TASK ledger row (R5) and declares its table to record-core's purge (R8). When the declaration holds,
 * it registers its figure with record-core's counts (R5), the task grammar with promotion and with record-core's audit
 * (R4), and, unless `deps.start` is false, its `task-drain` consumer with the scheduler, capture's task notice and
 * promotion's commit notice (R1).
 * When another module already holds the table (as queue did until its job removed its copy of this code: N363), this
 * module registers none of those, so each consumer, listener, step, audit check and figure has one live registration.
 * `deps` (each defaults to its module's instance on the same `ctx`, reached lazily when first asked):
 *   record, membership, promotion, provenance, capture, connections, scheduler   the providers;
 *   env       the instance bindings: `BIO_NOW_MS` (the clock) and `TASK_DRAIN_DELAY_MS` (R1);
 *   now       a clock, `() => ms`, in place of `env`'s;
 *   start     false to skip the scheduler and capture registrations (a test that drives the consumer itself).
 * The ops are `tasksOps`' entries, which control-plane's routes spread into the plane's one map.
 */

import { isMachineStamp, isPublicHttpsLocator, ISO_TS_RE as ISO_INSTANT, parseFrontmatter } from "../record-grammar/index.mjs";
import { recordOf, stampInstant, perItem, mintExhausted } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK, noSuchMember } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { connectionsOf } from "../connections/index.mjs";
import { schedulerOf } from "../scheduler/index.mjs";
import { PER_ITEM_ACTS, PER_ITEM_MAX } from "../affordances.mjs";
import { TASKS_SCHEMA, TASKS_TABLES } from "./schema.mjs";
import { QUEUE_MACHINE_CHECKS, TASK_ACTOR_CHECKS, QUEUE_INBOX_CHECKS, CHECK_REQUEST_CHECKS, TASK_EVENT_KIND, checkInboxGrammar } from "./checks.mjs";
import { word, localize } from "../setup-words/index.mjs";

export { TASKS_SCHEMA, TASKS_TABLES, tasksOwns } from "./schema.mjs";
export { QUEUE_MACHINE_CHECKS, TASK_ACTOR_CHECKS, QUEUE_INBOX_CHECKS, CHECK_REQUEST_CHECKS, TASK_EVENT_KIND, checkInboxGrammar } from "./checks.mjs";

/* The id suffix the TASK grammar requires: lowercase alphanumeric groups joined
   by single dashes, never empty, never leading or trailing dashes. Derived from
   the subject so an id is legible, but it is an IDENTIFIER and not a rendering:
   the subject itself is carried in the bounded field the grammar checks. */
const taskSlug = (subject) => {
  const s = String(subject || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/g, "");
  return s || "authority";
};
/* R1, R2, R6: a limit is clamped to 1–max; absent, blank or not a number, it is the default. */
const clampLimit = (limit, dflt, max) => {
  const n = limit === null || limit === undefined || limit === "" ? NaN : Math.floor(Number(limit));
  return Number.isFinite(n) ? Math.max(1, Math.min(max, n)) : dflt;
};
/* R6: a read's argument as an object; anything else (null, a bare id) is an empty query, which the gate denies. */
const asQuery = (q) => (q && typeof q === "object" && !Array.isArray(q) ? q : {});

/* R13–R17 (DEC-135): the task kind a check request's To do carries; the verdicts R15 records; the bounds R13 and R15 set. */
export const CHECK_TASK_KIND = "check-requested";
const CHECK_VERDICTS = Object.freeze(["check", "concern"]);
const CHECK_NOTE_MAX = 1000, CHECK_REASON_MAX = 4000;
/* R19 (DEC-207 (8)): the task kind an owner's To do to sign a prepared edition carries. */
export const SIGN_TASK_KIND = "sign-requested";
/* R24 (K4210): the doors an authority task offers, the one a screen leads with first; queue R12 reads them. */
const AUTHORITY_DOOR = ["taskdecide", "taskforward", "taskresolve"];
/* membership R21's normalisation of a label (trimmed, whitespace collapsed, at most 120), so the label recorded on a
   request is the one membership R106 addressed by. */
const normLabel = (label) => String(label ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
/* A text the member wrote, trimmed; empty reads as null. */
const trimmed = (v) => { const t = v === null || v === undefined ? "" : String(v).trim(); return t || null; };
/* R10, R13–R15, R19 (K3145): the member a `by` stamp names. The control plane stamps a session's `by` in the viewer's
   form, `member:<id>` (admission's `resolveSession`; the founder's bare `admin`, a machine's `class:<cls>`), so the
   `member:` prefix is folded here and every sight, ownership and fact is asked of `member:<id>` once, never
   `member:member:<id>`. A bare id (a caller in process) is taken as it is. */
const memberOfStamp = (by) => (typeof by === "string" && by.startsWith("member:") ? by.slice("member:".length) : by);
/* An opaque id for a request or a check: 16 characters drawn at random, telling no reader how many exist. */
const opaque = (prefix) => {
  const A = "abcdefghijklmnopqrstuvwxyz0123456789", u = new Uint8Array(16);
  crypto.getRandomValues(u);
  return `${prefix}-${[...u].map((b) => A[b % 36]).join("")}`;
};

export class Tasks {
  #host; #deps; #env; #clock; #storage;
  constructor({ host, storage, deps = {} } = {}) {
    this.#host = host;
    this.#storage = storage;
    this.sql = storage.sql;
    this.#deps = deps || {};
    this.#env = (deps && deps.env) || {};
    this.#clock = deps && typeof deps.now === "function" ? deps.now : null;
  }

  /** The table pass: the table R8 names, created where it is absent. Idempotent. */
  migrate() {
    for (const stmt of TASKS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";"))
      if (stmt.trim()) this.sql.exec(stmt);
  }

  /* ------------------------------------------------------------------ the providers (Uses), reached lazily */
  #dep(name, make) {
    if (!(name in this.#deps) || this.#deps[name] === undefined) this.#deps[name] = make();
    return this.#deps[name];
  }
  get #record() { return this.#dep("record", () => recordOf(this.#host)); }
  get #membership() { return this.#dep("membership", () => membershipOf(this.#host)); }
  get #provenance() { return this.#dep("provenance", () => provenanceOf(this.#host)); }
  get #capture() { return this.#dep("capture", () => captureOf(this.#host)); }
  get #connections() { return this.#dep("connections", () => connectionsOf(this.#host)); }
  get #scheduler() { return this.#dep("scheduler", () => schedulerOf(this.#host, this.#env)); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** The instant this act is at: the clock a test gave, else the instance binding `BIO_NOW_MS`, else the wall clock. */
  #nowMs() {
    if (this.#clock) return this.#clock();
    const v = Number(this.#env && this.#env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }

  /* ------------------------------------------------------------------ the viewer gate (membership R43, R80)
     membership offers the ONE predicate (`viewerPredicate`), not a SQL compiler, so this module compiles its own gate
     from it, as queue did. A machine credential (`scope: member`) is not filtered; an absent or unrecognised viewer
     compiles to DENY. */
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

  /* D-109. The task queue drains on the scheduler's one Durable Object alarm, as
     the selection sweep does: armed on enqueue, re-armed by the alarm while the
     queue is non-empty, self-terminating when it drains — the mechanism the
     selection sweep's `#armSweep` proved before the scheduler took the alarm. DELAY is short so a burst of captures coalesces into one
     drain rather than one alarm apiece. BACKSTOP is longer and used when a tick
     drained nothing: every remaining event is then a capture not yet filed in a
     bundle (taskDrain keeps those, it does not drop them), and retrying that at
     the short cadence would be a hot loop against work that only a later promote
     can unblock. BATCH bounds one tick; a deeper backlog re-arms and continues.
     (R18; SCHEDULER #29 J1 (2), K2029, K2038; R25, K4488) The backstop backs off: an event tried `a`
     times is next due BACKSTOP × 2^(a−1) after its last try (capture R45's durable
     `attempts` and `lastTry`), never more than MAX_WAIT (one hour); from RETRY_LIMIT tries on it is
     due MAX_WAIT after its last try, every time. An unfiled capture is never dropped and never stops
     being retried by count: it waits on the filing, which re-arms the drain at once (promotion), and
     until then it is retried hourly at most. It is retried by every drain that runs for another reason; an
     enqueue (capture R44) and a committed promotion (promotion R45: only a
     promotion files a capture, provenance R1, R4) re-arm the drain at DELAY.
     DELAY is overridable per instance through TASK_DRAIN_DELAY_MS: production
     takes the short default, and a test that drives the consumer by hand pushes
     the automatic one out of its own window so the two never race on the clock. */
  static TASK_DRAIN_DELAY_MS = 1000;
  static TASK_DRAIN_BACKSTOP_MS = 60000;
  static TASK_DRAIN_ALARM_BATCH = 200;
  static TASK_DRAIN_RETRY_LIMIT = 8;
  /* R25 (K4488): the longest the back-off waits between tries of an event still queued. */
  static TASK_DRAIN_MAX_WAIT_MS = 60 * 60 * 1000;

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
      if (o) return { assignee: o.member_id, assignee_role: "project-manager", basis: word("tasks.why.owner_referred_project") };
    }
    /* R1 (K5148): a document filed in a project states it in its front matter (promotion R53; `record-core`'s
       `bundleInfo().project`, its R34), and no `cites` edge need exist, so the project it is filed in comes before the
       citing ones. Its owner, if none is active, leaves the next arm to try. */
    if (info && info.project) {
      const o = ownerOf(info.project);
      if (o) return { assignee: o.member_id, assignee_role: "project-manager", basis: word("tasks.why.owner_referred_project") };
    }
    /* D-280, site (b), and it is D-267's own harm one op over: `refs` carries
       the RELATION and DROPS the STATUS, so the project this arm hands the
       obligation to may be one that WITHDREW from the bundle it is being made
       responsible for. Same ONE predicate as the bar read and the homes walk
       (connections R22's `edgeSevered`).
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
      !kinds.every((k) => this.#connections.edgeSevered(pid, bundleId, k || null)));
    if (cite) {
      const o = ownerOf(cite[0]);
      if (o) return { assignee: o.member_id, assignee_role: "project-manager", basis: word("tasks.why.owner_cites_record", { cite: String(cite[0]) }) };
    }
    /* membership's active administrators (its R86), in the order the roster holds them, the founder (who is no member
       row, and holds no task) aside: the earliest that membership R80 admits to the subject (K2575, D54: an
       administrator neither invited nor joined to a hidden project would be handed a task R9 then withholds from them),
       else none, and the task is `unassigned`. */
    const first = this.#membership.activeAdmins()
      .find((m) => m !== "admin" && this.#membership.inSight(bundleId, `member:${m}`));
    const adm = first ? { member_id: first } : null;
    if (adm) return { assignee: adm.member_id, assignee_role: "group-admin", basis: "no project manager; the RULED fallback to a team admin" };
    /* Named honestly rather than assigned to someone who does not exist. An
       unassigned task is still visible and still routable by hand; a task
       addressed to a phantom is not. */
    return { assignee: "unassigned", assignee_role: "group-admin", basis: word("tasks.why.project_manager_active") };
  }

  /** A stored row as the grammar's task: the shape `taskList` gives (R2) and R6's reads give. */
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
      ...(row.kind === SIGN_TASK_KIND ? { sign: this.#signOf(row.id) } : {}),
      ...(row.kind === TASK_EVENT_KIND ? { door: [...AUTHORITY_DOOR] } : {}),
    };
  }

  /** The C-19.1 grammar, run against a candidate task before it is stored.
   *  R4: the ONE function `checks.mjs` holds, the same one the promotion check and the audit check below run, never a
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

  /** R4 (N325): C-19.1 at the WRITE, registered with promotion (its R39), as monitoring registers C-18.5 (its R27).
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
    /* DEC-49 REGION is-inbox-refused — R4/C-19.2. */
    return { ok: false, reason: "INBOX_REFUSED", code: "INBOX_REFUSED",
             check: QUEUE_INBOX_CHECKS.INBOX_REFUSED.check, translation: QUEUE_INBOX_CHECKS.INBOX_REFUSED.translation,
             findings: errs.map((x) => ({ check: x.check, detail: x.message })),
             detail: `data/inbox.json does not meet the task grammar (C-19.1): ${errs.length} `
                   + `error${errs.length === 1 ? "" : "s"}, each named in findings. Nothing was written.` };
    /* END DEC-49 REGION is-inbox-refused */
  }

  /** R4 (N325): C-19.1 in the audit over one bundle image (record-core R59), as `checkBundle` ran it: each error is a
   *  C-19.1 finding, a reference resolved against the whole store by the audit's own `resolveTarget`. */
  audit(image) {
    const files = image && image.files instanceof Map ? image.files : null;
    if (!files) return [];
    const findings = [];
    checkInboxGrammar({ files, resolveTarget: typeof image.resolveTarget === "function" ? image.resolveTarget : undefined },
      findings);
    return findings;
  }

  /* ------------------------------------------------------------------ the store's counts and the id ledger (R5) */

  /** R5 (N342; record-core R63): this module's figure, `tasks`, the rows of its table with those naming a bundle in `hid`
   *  (the caller's `{sql, args}`, or null) left out by `refers_to`. A figure that cannot be read is null, never zero.
   *  Synchronous; writes nothing; never throws. */
  counts(hid = null) {
    const h = hid && typeof hid === "object" && typeof hid.sql === "string" && Array.isArray(hid.args) ? hid : null;
    try {
      const n = Number(this.#one(`SELECT count(*) AS c FROM tasks${h ? ` WHERE COALESCE(refers_to, '') NOT IN ${h.sql}` : ""}`,
        ...(h ? h.args : [])).c);
      return { tasks: Number.isFinite(n) ? n : null };
    } catch { return { tasks: null }; }
  }
  static COUNT_KEYS = Object.freeze(["tasks"]);

  /** R5 (N342; record-core R40, review's `seedLedger` shape): the opaque minter's ledger learns every TASK id standing
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

  /** CONSUMER, and the SOLE writer of tasks (R1).
   *
   *  Drains queued events, resolves each capture to the bundle that filed it,
   *  applies the routing order and the grammar, and folds a repeat into the
   *  live task rather than spawning a duplicate. An event whose capture has not
   *  been promoted into any bundle yet simply WAITS: at capture time no bundle
   *  exists, and inventing a refers_to would be worse than being patient. */
  taskDrain({ limit = 50, actor = "consumer", now = null } = {}) {
    const cap = clampLimit(limit, 50, 500);
    const at = now && ISO_INSTANT.test(now) ? now : stampInstant("second", this.#nowMs());
    /* capture R45: the queued events oldest first, each `{kind, captureSha, subject, locator, enqueued, attempts, cursor}`,
       of this module's one kind only (T35; K1951, K1974), so another kind (`archive-unpack`) is never taken, routed,
       folded, refused or counted here; provenance R4: the bundle a capture is filed in. (T36) Read in pages: a waiting
       event does not use up `limit`, so each page asks for what `limit` has left, and the next is read past the last
       event's `cursor` while a page came back full, so waiting events at the head never hide a filed one behind them. */
    const out = { drained: 0, created: [], folded: [], waiting: [], refused: [] };
    const drop = (q) => this.#capture.taskEventRemove({ kind: q.kind, captureSha: q.capture_sha });
    this.#eachQueued(() => cap - out.drained, (e) => {
      const q = { ...e, capture_sha: e.captureSha, attempts: Number(e.attempts) || 0 };
      const home = this.#provenance.homeOf(q.capture_sha);
      const reg = home ? { bundle_id: home.bundleId } : null;
      if (!reg) {
        this.#capture.taskEventAttempt({ kind: q.kind, captureSha: q.capture_sha, at });
        out.waiting.push({ captureSha: q.capture_sha, attempts: q.attempts + 1,
          detail: "the capture is not yet filed in any record; the event is kept, not dropped" });
        return;
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
        return;
      }
      const route = this.#routeTask(reg.bundle_id);
      const year = at.slice(0, 4);
      const slug = taskSlug(q.subject);
      /* REC-151: OPAQUE, never the TASK counter (Membership v2 §7) — a task naming a bundle the viewer cannot see
         is withheld (R9), so a counted id told a member how many tasks existed that they could not read. On
         exhaustion the event is KEPT, as an unfiled capture's is, never dropped, and its `waiting` entry carries the
         one answer to that condition, record-core's `mintExhausted("TASK")` (its R62; N322): its code, row and
         sentence, minted there and nowhere here. */
      this.seedLedger();     // R5: the ledger has learned every live TASK id before the first mint draws one
      const taskId = this.#record.mintOpaqueId("TASK", year, `-${slug}`,
        (id) => !!this.#one(`SELECT 1 FROM tasks WHERE id=?`, id));
      if (!taskId) {
        const exhausted = mintExhausted("TASK");
        /* a try like an unfiled event's, so R18's back-off bounds it too */
        this.#capture.taskEventAttempt({ kind: q.kind, captureSha: q.capture_sha, at });
        out.waiting.push({ captureSha: q.capture_sha, attempts: q.attempts + 1,
          code: exhausted.code, check: exhausted.check, detail: exhausted.detail });
        return;
      }
      const task = {
        id: taskId,
        kind: q.kind,
        refers_to: reg.bundle_id,
        subject: { text: q.subject },
        ...(q.locator && isPublicHttpsLocator(q.locator) ? { locators: [q.locator] } : {}),
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
        return;
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
    }, () => out.drained < cap);
    out.remaining = this.#capture.taskEventCount({ kind: TASK_EVENT_KIND });
    /* REC-57: `remaining` answers "is this all of it" (a non-zero remainder says
       the queue is not drained), so no `truncated` is minted beside it. The other
       half is the bound: a caller that sees work left needs to know what cap
       produced this pass to decide between running it again and asking for a
       bigger one. */
    out.limit = cap;
    return { ok: true, ...out };
  }

  /** Read the inbox (R2). Filterable by assignee and status, because the first
   *  thing a member wants is their own open work.
   *
   *  REC-30 (R9): a task's `refers_to` IS a bundle id (taskDrain writes the
   *  registering bundle's), and the row's whole subject is that bundle — its
   *  `subject_text` describes the document, and `refersTo` lets a caller ASK
   *  about one. So the D-15 predicate withholds the row, not a field, and it
   *  governs the `tasks` filter too: an uninvited member asking `refers=<a hidden
   *  project>` gets the same empty answer as for a bundle that does not exist.
   *
   *  The three task COUNTS are gated with the rows for REC-25's reason: a count
   *  bigger than the list says something is hidden, which is half the leak.
   *  `queued` is not — `task_queue` rows carry a capture sha and no bundle, so
   *  the number names nothing. */
  taskList({ assignee = null, status = null, refersTo = null, limit = 200, viewer = null } = {}) {
    this.#closeSigned();
    const cap = clampLimit(limit, 200, 1000);
    /* `tk.` and not a bare column: see #bundleGate's refusal. */
    const seen = this.#bundleGate("tk.refers_to", viewer);
    const where = [`(${seen.sql})`], args = [...seen.args];
    if (assignee) { where.push("tk.assignee = ?"); args.push(assignee); }
    if (status) { where.push("tk.status = ?"); args.push(status); }
    if (refersTo) { where.push("tk.refers_to = ?"); args.push(refersTo); }
    /* REC-57: cap + 1 asked for, cap delivered. `counts` cannot answer this —
       the three figures are per STATUS over the whole visible set and take no
       notice of `assignee` or `refers` — so asking for one row past the cap is
       what makes the bound a fact rather than an inference. */
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
         `limit` is the cap after clamping, matching `op=search`. */
      limit: cap,
      truncated: page.length > cap,
      counts: {
        open: n("open"),
        forwarded: n("forwarded"),
        resolved: n("resolved"),
        queued: this.#capture.taskEventCount({ kind: TASK_EVENT_KIND }),
      },
    };
  }

  /* ------------------------------------------------------------------ R6: queue's three reads (N363)
     Each is the statement queue's feed ran over this table before the split, so the feed does not change. Each never
     throws: a store without the table answers empty, or false. */

  /** R6: the tasks on subjects the viewer may see, of any status or, when `statuses` is given (an array), only of those
   *  (N373, K566), and of any assignee or, when `assignees` is given (an array of member ids, `"unassigned"` a value
   *  like any other), only of those (N410), newest first (`created` descending, then `id`), at most `limit` (1–1,000,
   *  default 200), each as `taskList` gives a task. The cap is taken over the tasks so filtered, so tasks of other
   *  statuses or other assignees never crowd them out; an empty `statuses` or `assignees` answers none. */
  recentTasks(q = {}) {
    const { viewer = null, limit = 200, statuses = null, assignees = null } = asQuery(q);
    this.#closeSigned();
    try {
      const cap = clampLimit(limit, 200, 1000);
      const strings = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === "string") : null);
      const only = strings(statuses), whose = strings(assignees);
      if ((only && !only.length) || (whose && !whose.length)) return [];
      const seen = this.#bundleGate("tk.refers_to", viewer);
      const among = (col, xs) => (xs ? ` AND ${col} IN (${xs.map(() => "?").join(",")})` : "");
      return this.#rows(`SELECT tk.* FROM tasks tk WHERE (${seen.sql})${among("tk.status", only)}${among("tk.assignee", whose)}
          ORDER BY tk.created DESC, tk.id LIMIT ?`,
        ...seen.args, ...(only || []), ...(whose || []), cap).map((r) => this.#taskOf(r));
    } catch { return []; }
  }

  /** R6: the resolved tasks with `resolved_at` at or after `since` on subjects the viewer may see, `resolved_at`
   *  descending, then `id`, at most `limit` (1–1,000, default 200), each as `taskList` gives a task. */
  resolvedTasks(q = {}) {
    const { viewer = null, since = null, limit = 200 } = asQuery(q);
    this.#closeSigned();
    try {
      const cap = clampLimit(limit, 200, 1000);
      const seen = this.#bundleGate("tk.refers_to", viewer);
      return this.#rows(
        `SELECT tk.* FROM tasks tk WHERE tk.status='resolved' AND tk.resolved_at >= ? AND (${seen.sql})
          ORDER BY tk.resolved_at DESC, tk.id LIMIT ?`, String(since ?? ""), ...seen.args, cap).map((r) => this.#taskOf(r));
    } catch { return []; }
  }

  /** R6 (N374, K565): whether a task has that id on a subject the viewer may see, behind `taskList`'s gate (R2, R9), so
   *  a task the viewer may not see answers as no task. An absent or unrecognised viewer is denied, so it answers false. */
  taskExists(q = {}) {
    const { id = null, viewer = null } = asQuery(q);
    if (typeof id !== "string" || !id) return false;
    this.#closeSigned();
    try {
      const seen = this.#bundleGate("tk.refers_to", viewer);
      return !!this.#one(`SELECT 1 AS x FROM tasks tk WHERE tk.id=? AND (${seen.sql})`, id, ...seen.args);
    } catch { return false; }
  }

  /** REC-4: the TASK-ACTOR FENCE, shared by taskForward and taskResolve (R3, C-76.1).
   *
   *  The construct's accountability rule (BIO_Interaction_Constructs_v0_1.md,
   *  T · TASK): a task is an obligation with an ASSIGNEE, and its refusal shape
   *  is "this is not yours to resolve, and here is who it is with." Stamping the
   *  actor honestly into history made the act TRACEABLE but did not PREVENT it,
   *  so any member-class credential could resolve or forward ANY task by id. This
   *  is the prevention. The UI hides the verb on another member's task, but that
   *  gating is cosmetic until the plane enforces it — a caller that reaches the
   *  op directly must be refused here.
   *
   *  Who may act, and why:
   *   - the ASSIGNEE — it is theirs; a task is "mine" (the construct's word).
   *   - an ADMINISTRATOR — membership's `isAdministrator` (its R64: the ROOT admin
   *     session, actor "admin", or any member with role='admin'), the same "group
   *     admin" the routing (#routeTask) falls back to. The admin override stays.
   *   - any MEMBER, when the task is honestly `unassigned` — D-98's routing
   *     intends an unassigned task to stay CLAIMABLE and "routable by hand". An
   *     unassigned task exists PRECISELY because routing found no project manager
   *     and no active admin (#routeTask's last arm), so requiring assignee-or-
   *     admin would strand it forever. DEC-7 raises whether "claimable" should be
   *     narrowed to the routed role and KEEPS it open.
   *
   *  WHAT THIS FENCE DOES NOT ANSWER (REC-28, D-151): whether the caller is a
   *  person at all. The first line below allows on `unassigned` BEFORE it has
   *  looked at the caller, so a machine could once RESOLVE an unassigned task. The
   *  hole is closed at the ACT (taskForward/taskResolve refuse `token:` actors BY
   *  SHAPE, C-32.10 and C-32.11), so the refusal does not depend on assignment
   *  state at all. BOTH fences stay, because they answer different questions:
   *  THIS one answers *is this THIS member's task*, and the act refusal answers
   *  *is this a person at all*.
   *
   *  Returns a TASK_NOT_YOURS refusal (N382: its own code, apart from intent's NOT_YOURS) NAMING who it is with, NO_SUCH_TASK
   *  for an administrator who does not see the subject (K2575), or null to proceed. */
  #refuseNotYours(row, actor, verb) {
    if (row.assignee === "unassigned") return null;
    if (actor === row.assignee) return null;
    /* K2575 (D54; membership R60, R80): the administrator's override holds only where the actor sees the subject; one who
       does not is answered as for a task that does not exist, never with TASK_NOT_YOURS naming who holds it. */
    if (this.#membership.isAdministrator(actor))
      return this.#membership.inSight(row.refers_to, `member:${actor}`) ? null : { ok: false, reason: "NO_SUCH_TASK" };
    /* DEC-49 REGION is-task-actor-fence — D-126/C-76.1: a selection surfaces this refusal to a member, so it carries
       its code, check and translation; `reason`, `detail` and the assignee name who holds the task. */
    return {
      ok: false,
      reason: "TASK_NOT_YOURS", code: "TASK_NOT_YOURS",   /* N412: the code at ONE literal site, its one mint */
      check: TASK_ACTOR_CHECKS.TASK_NOT_YOURS.check,
      translation: TASK_ACTOR_CHECKS.TASK_NOT_YOURS.translation,
      detail: `this task is not yours to ${verb}; it is with ${row.assignee}`,
      assignee: row.assignee,
      assignee_role: row.assignee_role,
    };
    /* END DEC-49 REGION is-task-actor-fence */
  }

  /** Forward a task to a member better placed to attest it (R3).
   *
   *  A MEMBER action, never a daemon one: the ruling makes forwarding a human
   *  judgement, and `member_expertise` is a hint for that human rather than an
   *  automatic reassignment. The prior assignment stays in history, because who
   *  a task was taken FROM is as much a fact as who holds it now.
   *
   *  REC-28 / D-151: a machine credential's actor is stamped `token:<class>` by
   *  the control plane, so it is refused BY SHAPE (C-32.10) — a machine may
   *  surface, route and prepare; a member authors, resolves and forwards. It is
   *  checked BEFORE the row is read, so unlike the TASK-ACTOR FENCE it cannot
   *  depend on assignment state.
   *
   *  REC-46: these two verbs ask `isMachineStamp` — did the control plane MINT
   *  this identity — rather than `isMachineIdentity`, which also refuses a bare
   *  class word: the bare string "admin" is a LEGITIMATE actor here, ROOT_ADMIN's
   *  own session, so a bare-class arm would refuse the root administrator's
   *  browser. Both predicates derive from record-grammar's one prefix list (`MACHINE_CLASS_PREFIX`). */
  taskForward({ id = null, to = null, actor = null, now = null, items } = {}) {
    /* D-126: WITH `items`, a SET under the PER-ITEM weight; the actor (the control plane's stamp) is forced
       onto every item. */
    if (items !== undefined)
      return this.#perItem("taskforward", { items, to, now }, { actor }, (b) => this.taskForward(b));
    if (!actor) return { ok: false, reason: "NO_ACTOR", detail: "a forward is recorded under the member who made it" };
    /* DEC-49 REGION is-machine-forward — REC-64/C-32.10. The fence alone: the second, independent fence (C-76.1)
       is behind it, so the span stops before that one. */
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
    /* R3 (DEC-135 (2), (6)): a check request is addressed by expertise and sight, or to a member its requester names,
       and is never reassigned. */
    if (row.kind === CHECK_TASK_KIND)
      /* DEC-49 REGION is-check-not-forwarded */
      return Tasks.#checkRefusal("CHECK_NOT_FORWARDED",
        "a request for a check is never forwarded: anyone who can see its subject may take it; nothing was changed");
      /* END DEC-49 REGION is-check-not-forwarded */
    if (row.status === "resolved") return { ok: false, reason: "ALREADY_RESOLVED", detail: "a resolved task is not forwarded; a new determination opens a new task" };
    const fenced = this.#refuseNotYours(row, actor, "forward");
    if (fenced) return fenced;
    /* membership R68: an active member by that id. None (absent, unknown, or not active) is membership's one answer to
       that condition, `noSuchMember` (its R121, C-96.47; N793, K231: one code, one site), `member` the `to` asked. */
    const facts = typeof to === "string" && to ? this.#membership.memberFacts(to) : null;
    const target = facts && facts.status === "active" ? { member_id: to } : null;
    if (!target) return noSuchMember(typeof to === "string" ? to : null);
    if (target.member_id === row.assignee) return { ok: false, reason: "ALREADY_THEIRS" };
    const at = now && ISO_INSTANT.test(now) ? now : stampInstant("second", this.#nowMs());
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

  /** Resolve a task (R3). Also a member action, enforced (REC-28, D-151).
   *
   *  RESOLVING IS THE CLOSING ACT: the obligation the record raised is answered
   *  and stops asking. A machine credential is refused at the ACT and by SHAPE
   *  (C-32.11), checked before the row is read, so it holds whatever the task's
   *  assignment is: an unassigned task is nobody's work, and closing nobody's
   *  work is still closing.
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
    if (isMachineStamp(actor))                          /* REC-46: the NARROW predicate, deliberately — see taskForward */
      return { ok: false, reason: "MACHINE_CANNOT_RESOLVE", code: "MACHINE_CANNOT_RESOLVE",
               check: QUEUE_MACHINE_CHECKS.MACHINE_CANNOT_RESOLVE.check,
               translation: QUEUE_MACHINE_CHECKS.MACHINE_CANNOT_RESOLVE.translation,
               detail: "resolving a task says the obligation the record raised has been answered, and "
                     + "that is a named member's act. A machine credential may surface a task, route it "
                     + "and prepare what it needs, and may not close it — an unassigned task is nobody's "
                     + "work, and closing nobody's work is still closing. Sign in as a member." };
    /* END DEC-49 REGION is-machine-resolve */
    this.#closeSigned();
    const row = this.#one(`SELECT * FROM tasks WHERE id=?`, id);
    if (!row) return { ok: false, reason: "NO_SUCH_TASK" };
    if (row.status === "resolved") return { ok: true, id, already: true, resolved_at: row.resolved_at };
    const fenced = this.#refuseNotYours(row, actor, "resolve");
    if (fenced) return fenced;
    const at = now && ISO_INSTANT.test(now) ? now : stampInstant("second", this.#nowMs());
    /* R3 (DEC-135 (3)): a check request's To do. The taker's closes only by R15's record; an addressee who has not taken
       it closes their own To do and nothing else, the request staying open to the others. It is no C-19.1 task (that
       grammar is the drained inbox's), so it is written here directly. */
    if (row.kind === CHECK_TASK_KIND) {
      const link = this.#one(`SELECT c.request, k.taker FROM check_todos c LEFT JOIN check_takes k ON k.request = c.request
                                WHERE c.task=?`, id);
      if (link && link.taker && link.taker === row.assignee)
        /* DEC-49 REGION is-check-closes-by-record */
        return Tasks.#checkRefusal("CHECK_CLOSES_BY_RECORD",
          "this To do is the check its holder took, and it closes when the check or a concern is recorded; nothing was changed");
        /* END DEC-49 REGION is-check-closes-by-record */
      this.#closeTodo({ task: id, history: row.history }, { at, event: "resolved", actor });
      return { ok: true, id, status: "resolved", resolved_at: at };
    }
    /* R19: an owner's To do to sign is closed by that owner (or, under R3's fence, an administrator who sees it), and only
       that To do: the other owners' stay open until each closes theirs or the edition is signed. It is no C-19.1 task. */
    if (row.kind === SIGN_TASK_KIND) {
      this.#closeTodo({ task: id, history: row.history }, { at, event: "resolved", actor });
      return { ok: true, id, status: "resolved", resolved_at: at };
    }
    const task = this.#taskOf(row);
    /* R21 (K4169): an authority task put aside leaves the document undetermined, and its history says the question was
       closed without an answer; only R20's decision leaves `resolved`. */
    task.history.push({ at, event: row.kind === TASK_EVENT_KIND ? "resolved_undecided" : "resolved", actor });
    task.status = "resolved";
    task.resolved_at = at;
    const bad = this.#refuseUngrammatical(task);
    if (bad) return bad;
    this.sql.exec(`UPDATE tasks SET status=?, resolved_at=?, history=? WHERE id=?`,
      task.status, at, JSON.stringify(task.history), id);
    return { ok: true, id, status: "resolved", resolved_at: at };
  }

  /** Decide an authority task (R20; K4169, UC-046): the member's decision on who issued the captured document, recorded
   *  through provenance's `declareAuthority` (its R65) and the task resolved in the one transaction, so either both happen
   *  or neither. The refusals are R3's, in R3's order, with the two of this act's own, then provenance's, carried as they
   *  come. A machine is refused by shape before the task is read (as C-32.10, C-32.11). */
  taskDecide({ id = null, outcome = null, authority = null, basis = null, actor = null, now = null } = {}) {
    if (!actor) return { ok: false, reason: "NO_ACTOR", detail: localize("tasks.decide.no_actor", "a decision is recorded under the member who made it") };
    if (isMachineStamp(actor))
      /* DEC-49 REGION is-machine-decide */
      return Tasks.#checkRefusal("MACHINE_CANNOT_DECIDE",
        localize("tasks.decide.machine_refused", "deciding who issued a document is a named member's judgement, and this caller is no member's session; nothing was written"));
      /* END DEC-49 REGION is-machine-decide */
    const row = typeof id === "string" && id ? this.#one(`SELECT * FROM tasks WHERE id=?`, id) : null;
    if (!row) return { ok: false, reason: "NO_SUCH_TASK" };
    if (row.kind !== TASK_EVENT_KIND || typeof row.capture_sha !== "string" || !row.capture_sha)
      /* DEC-49 REGION is-authority-task */
      return Tasks.#checkRefusal("TASK_NOT_AN_AUTHORITY_TASK",
        localize("tasks.decide.not_authority_task", "only a task that asks who issued a captured document is decided; nothing was written"));
      /* END DEC-49 REGION is-authority-task */
    if (row.status === "resolved") return { ok: true, id, already: true, resolved_at: row.resolved_at };
    const fenced = this.#refuseNotYours(row, actor, "decide");
    if (fenced) return fenced;
    const at = this.#instant(now);
    const task = this.#taskOf(row);
    task.history.push({ at, event: "decided", actor, outcome: typeof outcome === "string" ? outcome : null },
                      { at, event: "resolved", actor });
    task.status = "resolved";
    task.resolved_at = at;
    const bad = this.#refuseUngrammatical(task);
    if (bad) return bad;
    /* provenance R65 and this task's resolution in one unit: a refusal writes nothing there and the task is untouched; a
       failure after the decision is recorded rolls it back with the task's own write */
    return this.#atomically(() => {
      const made = this.#provenance.declareAuthority({ bundle: row.refers_to, capture: row.capture_sha, outcome, authority, basis,
                                                      by: actor, viewer: `member:${actor}` });
      if (!made || made.ok !== true) return made || { ok: false, reason: "AUTHORITY_REFUSED" };
      this.sql.exec(`UPDATE tasks SET status=?, resolved_at=?, history=? WHERE id=?`, task.status, at, JSON.stringify(task.history), id);
      return { ok: true, id, status: "resolved", resolved_at: at, outcome };
    });
  }

  /* ------------------------------------------------------------------ "Ask for a check" (R13–R17; DEC-135, Bob's)
     A request (R13) is addressed at its instant to every member membership R106 answers for its label and target, or to
     the one member its owner names; each addressee holds a To do, a task of kind `check-requested` on the target (R14),
     which R2 and R6 answer as any task, behind the same gate (R9). The first take wins; the others' To do closes naming
     the taker. The taker records a check or a reasoned concern (R15), which gates nothing. Every row is appended in this
     module's own tables and never overwritten (R17). Sight is membership R80's `inSight`, for `by` as `member:<by>`. */

  /** One refusal of C-138 (R17), with its row's check and translation (DEC-49). */
  static #checkRefusal(code, detail, extra = {}) {
    const row = CHECK_REQUEST_CHECKS[code];
    return { ...extra, ok: false, reason: code, code, check: row.check, translation: row.translation, detail };
  }

  /** R13–R15, Design Requirement 12: only a member asks, takes or checks. An empty `by` or a machine stamp is refused by
   *  shape, before anything is read. */
  #refuseMachineCheck(by) {
    if (typeof by === "string" && by && !isMachineStamp(by)) return null;
    /* DEC-49 REGION is-machine-check */
    return Tasks.#checkRefusal("MACHINE_CANNOT_CHECK",
      "asking for a check, taking one and recording one are a member's acts, and this caller is no member's session");
    /* END DEC-49 REGION is-machine-check */
  }

  /** R14, R15: the request `request` names, when it exists, `by` is an active member and the target is in `by`'s sight;
   *  else `NO_SUCH_CHECK_REQUEST`, one answer for each. */
  #requestFor(request, by) {
    const row = typeof request === "string" && request ? this.#one(`SELECT * FROM check_requests WHERE request=?`, request) : null;
    const facts = row ? this.#membership.memberFacts(by) : null;
    if (row && facts && facts.status === "active" && this.#membership.inSight(row.target, `member:${by}`)) return { row, facts };
    /* DEC-49 REGION is-check-request */
    return { refused: Tasks.#checkRefusal("NO_SUCH_CHECK_REQUEST",
      "no request for a check answers to that id that you can act on; nothing was written") };
    /* END DEC-49 REGION is-check-request */
  }

  /** The instant an act is at: the given one when it is an ISO instant, else the instance's clock. */
  #instant(now) { return now && ISO_INSTANT.test(now) ? now : stampInstant("second", this.#nowMs()); }

  /** One synchronous unit: the storage's transaction when it has one (a Durable Object's), else the call itself. */
  #atomically(fn) {
    return this.#storage && typeof this.#storage.transactionSync === "function" ? this.#storage.transactionSync(fn) : fn();
  }

  /** R14: a To do for `member` on the request: a task of kind `check-requested` on the target, open, role `member`,
   *  linked to the request. Throws a MINT_EXHAUSTED marker when no TASK id can be drawn, which the caller's transaction
   *  turns into R62's answer with nothing written. */
  #addTodo(req, member, at) {
    this.seedLedger();
    const id = this.#record.mintOpaqueId("TASK", at.slice(0, 4), "-check",
      (x) => !!this.#one(`SELECT 1 AS x FROM tasks WHERE id=?`, x));
    if (!id) throw Object.assign(new Error("MINT_EXHAUSTED"), { exhausted: true });
    const subject = req.label ? word("tasks.check_asked", { label: String(req.label) }) : word("tasks.check_asked_name");
    this.sql.exec(
      `INSERT INTO tasks (id, kind, refers_to, capture_sha, subject_text, subject_desc, locators,
                          assignee, assignee_role, status, created, resolved_at, history)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      id, CHECK_TASK_KIND, req.target, null, subject, req.note ?? null, null, member, "member", "open", at, null,
      JSON.stringify([{ at, event: "created", actor: req.by }]));
    this.sql.exec(`INSERT INTO check_todos (request, member, task, at) VALUES (?,?,?,?)`, req.request, member, id, at);
    return id;
  }

  /** R14, R15: the request's To dos that are still open, each `{task, member, history}`. */
  #openTodos(request) {
    return this.#rows(`SELECT t.id AS task, c.member AS member, t.history AS history FROM check_todos c
                         JOIN tasks t ON t.id = c.task WHERE c.request=? AND t.status <> 'resolved' ORDER BY t.id`, request);
  }

  /** Close one To do, appending `entry` to its history (R14's `taken`, R15's `resolved`). */
  #closeTodo(todo, entry) {
    let history = [];
    try { history = JSON.parse(todo.history); } catch { history = []; }
    history.push(entry);
    this.sql.exec(`UPDATE tasks SET status='resolved', resolved_at=?, history=? WHERE id=?`, entry.at, JSON.stringify(history), todo.task);
  }

  /** R13: ask for a check on `target`, by expertise `label` or of the named `member`, with an optional `note`. */
  checkRequest({ target = null, label, member, note = null, by: stamp = null, now = null } = {}) {
    const by = memberOfStamp(stamp);
    const machine = this.#refuseMachineCheck(by);
    if (machine) return machine;
    const info = typeof target === "string" && target ? this.#record.bundleInfo(target) : null;
    if (!info || !this.#membership.inSight(target, `member:${by}`))
      /* DEC-49 REGION is-check-target */
      return Tasks.#checkRefusal("NO_SUCH_CHECK_TARGET",
        "no item you can see answers to that id, so there is nothing to ask a check on; nothing was written");
      /* END DEC-49 REGION is-check-target */
    const project = info.type === "project" ? target : info.project;
    if (!project || !this.#membership.isProjectOwner(project, by))
      /* DEC-49 REGION is-check-owner */
      return Tasks.#checkRefusal("CHECK_NOT_AN_OWNER",
        "a check is asked by an owner of the project the item belongs to; nothing was written");
      /* END DEC-49 REGION is-check-owner */
    const byLabel = label !== null && label !== undefined, byName = member !== null && member !== undefined;
    if (byLabel === byName)
      /* DEC-49 REGION is-check-address */
      return Tasks.#checkRefusal("CHECK_ADDRESS_ONE",
        "a check is addressed by an expertise label or to one named member, exactly one of the two; nothing was written");
      /* END DEC-49 REGION is-check-address */
    let addressees;
    if (byLabel) {
      /* membership R106: who the label reaches among those who can see the target; its own refusal of an empty label. */
      const found = this.#membership.checkAddressees({ target, label });
      if (!Array.isArray(found)) return found;
      addressees = found.map((a) => a.memberId);
    } else {
      const facts = typeof member === "string" && member ? this.#membership.memberFacts(member) : null;
      if (!facts || facts.status !== "active" || !this.#membership.inSight(target, `member:${member}`))
        /* DEC-49 REGION is-check-member */
        return Tasks.#checkRefusal("CHECK_MEMBER_REFUSED",
          "the member named is not an active member who can see the item; nothing was written");
        /* END DEC-49 REGION is-check-member */
      addressees = [member];
    }
    const text = trimmed(note);
    if (text && text.length > CHECK_NOTE_MAX)
      /* DEC-49 REGION is-check-note */
      return Tasks.#checkRefusal("CHECK_NOTE_TOO_LONG",
        `the note is over ${CHECK_NOTE_MAX} characters once trimmed; nothing was written`, { max: CHECK_NOTE_MAX });
      /* END DEC-49 REGION is-check-note */
    const at = this.#instant(now);
    const req = { request: opaque("chkreq"), target, label: byLabel ? normLabel(label) : null, member: byName ? member : null,
                  note: text, by, at };
    try {
      this.#atomically(() => {
        this.sql.exec(`INSERT INTO check_requests (request, target, label, member, note, by, at, addressed) VALUES (?,?,?,?,?,?,?,?)`,
          req.request, req.target, req.label, req.member, req.note, req.by, req.at, addressees.length);
        for (const m of addressees) this.#addTodo(req, m, at);
      });
    } catch (e) {
      if (e && e.exhausted) return mintExhausted("TASK");
      throw e;
    }
    /* the number addressed, never who (R13) */
    return { ok: true, request: req.request, at, addressed: addressees.length };
  }

  /** R14: take the request. Exactly one take succeeds: the take is one conditional write under the request's key. */
  checkTake({ request = null, by: stamp = null, now = null } = {}) {
    const by = memberOfStamp(stamp);
    const machine = this.#refuseMachineCheck(by);
    if (machine) return machine;
    const { row: req, facts, refused } = this.#requestFor(request, by);
    if (refused) return refused;
    const held = this.#one(`SELECT taker, handle, at FROM check_takes WHERE request=?`, req.request);
    if (held && held.taker === by) return { ok: true, already: true, request: req.request, taken: { handle: held.handle, at: held.at } };
    if (held)
      /* DEC-49 REGION is-check-taken */
      return Tasks.#checkRefusal("CHECK_ALREADY_TAKEN", `this check was taken by ${held.handle ?? "another member"} at ${held.at}`,
        { taken: { handle: held.handle ?? null, at: held.at } });
      /* END DEC-49 REGION is-check-taken */
    const at = this.#instant(now);
    const handle = facts.handle ?? null;
    let todo = null;
    try {
      todo = this.#atomically(() => {
        this.sql.exec(`INSERT OR IGNORE INTO check_takes (request, taker, handle, at) VALUES (?,?,?,?)`, req.request, by, handle, at);
        const won = this.#one(`SELECT taker FROM check_takes WHERE request=?`, req.request);
        if (!won || won.taker !== by) return null;
        let mine = null;
        for (const t of this.#openTodos(req.request)) {
          if (t.member === by) { mine = mine || t.task; continue; }
          /* the others' To do closes in the same act, its history naming the taker (DEC-135 (3)) */
          this.#closeTodo(t, { at, event: "taken", actor: by, handle });
        }
        return mine || this.#addTodo({ ...req }, by, at);
      });
    } catch (e) {
      if (e && e.exhausted) return mintExhausted("TASK");
      throw e;
    }
    if (!todo) return this.checkTake({ request, by: stamp, now });     /* another take landed first: answer as it stands */
    return { ok: true, request: req.request, target: req.target, taken: { handle, at }, todo };
  }

  /** R15: the taker records a check or a reasoned concern; one record per request; it gates nothing. */
  checkRecord({ request = null, verdict = null, reason = null, by: stamp = null, now = null } = {}) {
    const by = memberOfStamp(stamp);
    const machine = this.#refuseMachineCheck(by);
    if (machine) return machine;
    const { row: req, facts, refused } = this.#requestFor(request, by);
    if (refused) return refused;
    const take = this.#one(`SELECT taker FROM check_takes WHERE request=?`, req.request);
    if (!take || take.taker !== by)
      /* DEC-49 REGION is-check-taker */
      return Tasks.#checkRefusal("CHECK_NOT_YOURS", "a check is recorded by the member who took the request; nothing was written");
      /* END DEC-49 REGION is-check-taker */
    if (!CHECK_VERDICTS.includes(verdict))
      /* DEC-49 REGION is-check-verdict */
      return Tasks.#checkRefusal("CHECK_VERDICT_UNKNOWN", "the verdict is `check` or `concern`; nothing was written",
        { verdicts: [...CHECK_VERDICTS] });
      /* END DEC-49 REGION is-check-verdict */
    const why = trimmed(reason);
    if (verdict === "concern" && !why)
      /* DEC-49 REGION is-check-reason */
      return Tasks.#checkRefusal("CHECK_NO_REASON", "a concern is recorded with its reason; nothing was written");
      /* END DEC-49 REGION is-check-reason */
    if (why && why.length > CHECK_REASON_MAX)
      /* DEC-49 REGION is-check-reason-length */
      return Tasks.#checkRefusal("CHECK_REASON_TOO_LONG",
        `the reason is over ${CHECK_REASON_MAX} characters once trimmed; nothing was written`, { max: CHECK_REASON_MAX });
      /* END DEC-49 REGION is-check-reason-length */
    const first = this.#one(`SELECT * FROM check_records WHERE request=?`, req.request);
    if (first)
      /* DEC-49 REGION is-check-recorded */
      return Tasks.#checkRefusal("CHECK_ALREADY_RECORDED", "this request's check is already recorded; nothing was written",
        { record: Tasks.#recordOf(first) });
      /* END DEC-49 REGION is-check-recorded */
    const at = this.#instant(now);
    /* membership R24: the checker's current state for the label at this instant; a named-member request has no label */
    let expertise = null;
    if (req.label) {
      const list = this.#membership.expertiseList({ memberId: by });
      const cur = list && Array.isArray(list.expertise) ? list.expertise.find((x) => x.label === req.label) : null;
      expertise = cur && cur.state === "confirmed" ? "confirmed" : cur && cur.state === "declared" ? "self-declared" : null;
    }
    const rec = { check: opaque("chk"), request: req.request, target: req.target, checker: by, handle: facts.handle ?? null,
                  label: req.label ?? null, expertise, verdict, reason: why, at };
    this.#atomically(() => {
      this.sql.exec(`INSERT INTO check_records (check_id, request, target, checker, handle, label, expertise, verdict, reason, at)
                     VALUES (?,?,?,?,?,?,?,?,?,?)`, rec.check, rec.request, rec.target, rec.checker, rec.handle, rec.label,
        rec.expertise, rec.verdict, rec.reason, rec.at);
      /* the taker's To do closes by this record (R15) */
      for (const t of this.#openTodos(req.request))
        if (t.member === by) this.#closeTodo(t, { at, event: "resolved", actor: by });
    });
    return { ok: true, ...rec };
  }

  static #recordOf(r) {
    return { check: r.check_id, request: r.request, target: r.target, checker: r.checker, handle: r.handle ?? null,
             label: r.label ?? null, expertise: r.expertise ?? null, verdict: r.verdict, reason: r.reason ?? null, at: r.at };
  }

  /** R16: the requests the viewer made, newest first, those whose target the viewer may no longer see left out and not
   *  counted, at most `limit` (1–500, default 200) with `truncated` and `next` (the id to pass as `after`). */
  checkRequests(q = {}) {
    const { viewer = null, after = null, limit = 200 } = asQuery(q);
    const cap = clampLimit(limit, 200, 500);
    const none = { ok: true, requests: [], limit: cap, truncated: false, next: null };
    try {
      const me = viewerPredicate(viewer).member;
      if (!me) return none;
      let rows = this.#rows(`SELECT * FROM check_requests WHERE by=? ORDER BY at DESC, request DESC`, me);
      if (typeof after === "string" && after) {
        const i = rows.findIndex((r) => r.request === after);
        rows = i >= 0 ? rows.slice(i + 1) : [];
      }
      const seen = [];
      for (const r of rows) {
        if (!this.#membership.inSight(r.target, viewer)) continue;
        seen.push(r);
        if (seen.length > cap) break;
      }
      const page = seen.slice(0, cap);
      return { ok: true, limit: cap, truncated: seen.length > cap, next: seen.length > cap ? page[page.length - 1].request : null,
        requests: page.map((r) => {
          const take = this.#one(`SELECT handle, at FROM check_takes WHERE request=?`, r.request);
          const rec = this.#one(`SELECT * FROM check_records WHERE request=?`, r.request);
          return { request: r.request, target: r.target, label: r.label ?? null, member: r.member ?? null, note: r.note ?? null,
                   at: r.at, addressed: Number(r.addressed), taken: take ? { handle: take.handle ?? null, at: take.at } : null,
                   check: rec ? Tasks.#recordOf(rec) : null };
        }) };
    } catch { return none; }
  }

  /** R16: every check recorded on `target`, oldest first; a target the viewer may not see answers `[]`. */
  checksOf(q = {}) {
    const { target = null, viewer = null } = asQuery(q);
    try {
      if (!this.#membership.inSight(target, viewer)) return [];
      return this.#rows(`SELECT * FROM check_records WHERE target=? ORDER BY at, check_id`, target).map((r) => Tasks.#recordOf(r));
    } catch { return []; }
  }

  /* ------------------------------------------------------------------ "Ask an owner to sign" (R19; DEC-207 (8))
     A member who may see a case asks its project's owners to sign an edition prepared and not yet signed: each active
     owner gets a To do, a task of kind `sign-requested` on the project (R14's form; the project, not the case, so R2's and
     R6's gate, which reads a task's subject as a bundle, answers it to whoever sees the project and to no one else, R9),
     open, role `member`, and the request is recorded once per edition in this module's own append-only tables (R17's form).
     Each To do closes when its owner resolves it (R3), or when the edition is signed: no signing notice reaches a module
     of this layer, so every read of the inbox and every act on it first closes the To dos whose edition is now signed
     (`#closeSigned`). The edition is read from publication's stated read contract (its R40: `cases`, `case_documents`),
     as case-authoring reads its own preparation back (its R14). */

  /** R19: the edition `(caseId, edition)` as prepared and unsigned, with its project, or null. The project is the case's
   *  (`cases`), else the one the preparation's own frontmatter names (`case_project`, as case-authoring reads it); it is
   *  a project bundle held here, or there is none. Never throws. */
  #preparedEdition(caseId, edition) {
    try {
      const doc = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=? AND sig_armored IS NULL`, caseId, edition);
      if (!doc) return null;
      const cased = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, caseId);
      let project = cased ? cased.project_id : null;
      if (!project) {
        const named = (parseFrontmatter(String(doc.text)).data || {}).case_project;
        project = typeof named === "string" && named.trim() ? named.trim() : null;
      }
      const info = project ? this.#record.bundleInfo(project) : null;
      return info && info.type === "project" ? { caseId, edition, project } : null;
    } catch { return null; }
  }

  /** R19: the sign request an owner's To do answers to, as a task carries it (`sign`), or null. */
  #signOf(task) {
    try {
      const r = this.#one(`SELECT r.request, r.case_id, r.edition FROM sign_todos t JOIN sign_requests r ON r.request = t.request
                            WHERE t.task=?`, task);
      return r ? { request: r.request, case: r.case_id, edition: Number(r.edition) } : null;
    } catch { return null; }
  }

  /** R19: every open To do to sign whose edition is now signed is closed, in the signing's instant and under its signer
   *  (publication R40: `case_documents`' `ratified_at` and `attestor_member`). Asked before every read of and act on the
   *  inbox; on a store without the tables it does nothing and never throws. */
  #closeSigned() {
    let due;
    try {
      due = this.#rows(`SELECT t.id AS task, t.history AS history, d.ratified_at AS at, d.attestor_member AS signer
                          FROM sign_todos s JOIN tasks t ON t.id = s.task AND t.status <> 'resolved'
                          JOIN sign_requests r ON r.request = s.request
                          JOIN case_documents d ON d.case_id = r.case_id AND d.edition = r.edition AND d.sig_armored IS NOT NULL`);
    } catch { return; }
    for (const d of due) {
      const at = typeof d.at === "string" && ISO_INSTANT.test(d.at) ? d.at : this.#instant(null);
      this.#closeTodo(d, { at, event: "signed", actor: d.signer ?? null });
    }
  }

  /** R19: ask the owners of the case's project to sign the prepared `edition` of `case`. Refusals, each writing nothing:
   *  `MACHINE_CANNOT_ASK_SIGN` (an empty or machine `by`); `NO_SUCH_CASE_EDITION` (absent, invisible to `by`, or not
   *  prepared: one answer); `SIGN_ALREADY_ASKED`, answered with the first request. */
  signRequest({ case: caseId = null, edition = null, by: stamp = null, now = null } = {}) {
    const by = memberOfStamp(stamp);
    if (typeof by !== "string" || !by || isMachineStamp(by))
      /* DEC-49 REGION is-machine-sign */
      return Tasks.#checkRefusal("MACHINE_CANNOT_ASK_SIGN",
        "asking a project's owners to sign is a member's act, and this caller is no member's session; nothing was written");
      /* END DEC-49 REGION is-machine-sign */
    const ed = edition === null || edition === undefined || edition === "" ? NaN : Number(edition);
    const facts = this.#membership.memberFacts(by);
    const prepared = typeof caseId === "string" && caseId && Number.isInteger(ed) && ed >= 1 ? this.#preparedEdition(caseId, ed) : null;
    if (!prepared || !facts || facts.status !== "active" || !this.#membership.inSight(prepared.project, `member:${by}`))
      return { ok: false, reason: "NO_SUCH_CASE_EDITION", code: "NO_SUCH_CASE_EDITION",
               detail: "no edition of that case is prepared and waiting to be signed where you can see it; nothing was written" };
    const firstOf = () => {
      const r = this.#one(`SELECT * FROM sign_requests WHERE case_id=? AND edition=?`, caseId, ed);
      return r ? { request: r.request, case: r.case_id, edition: Number(r.edition), by: r.by, at: r.at, asked: Number(r.asked) } : null;
    };
    const already = (first) =>
      /* DEC-49 REGION is-sign-asked */
      Tasks.#checkRefusal("SIGN_ALREADY_ASKED",
        `the owners were already asked to sign edition ${first.edition} of this case at ${first.at}; nothing was written`, { first });
      /* END DEC-49 REGION is-sign-asked */
    const held = firstOf();
    if (held) return already(held);
    this.#closeSigned();     /* the inbox as it stands before this act adds to it; no refusal above writes */
    const at = this.#instant(now);
    /* membership R65 (the owners, in the order they became owners) and R68: each active owner */
    const owners = this.#membership.projectOwners(prepared.project)
      .filter((m) => (this.#membership.memberFacts(m) || {}).status === "active");
    const request = opaque("signreq");
    let won = false;
    try {
      this.#atomically(() => {
        this.sql.exec(`INSERT OR IGNORE INTO sign_requests (request, case_id, edition, project, by, at, asked) VALUES (?,?,?,?,?,?,?)`,
          request, caseId, ed, prepared.project, by, at, owners.length);
        const first = this.#one(`SELECT request FROM sign_requests WHERE case_id=? AND edition=?`, caseId, ed);
        if (!first || first.request !== request) return;
        won = true;
        const subject = word("tasks.edition_prepared_ready", { ed: String(ed), case_id: String(caseId) });
        for (const m of owners) {
          this.seedLedger();
          const id = this.#record.mintOpaqueId("TASK", at.slice(0, 4), "-sign",
            (x) => !!this.#one(`SELECT 1 AS x FROM tasks WHERE id=?`, x));
          if (!id) throw Object.assign(new Error("MINT_EXHAUSTED"), { exhausted: true });
          this.sql.exec(
            `INSERT INTO tasks (id, kind, refers_to, capture_sha, subject_text, subject_desc, locators,
                                assignee, assignee_role, status, created, resolved_at, history)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            id, SIGN_TASK_KIND, prepared.project, null, subject, null, null, m, "member", "open", at, null,
            JSON.stringify([{ at, event: "created", actor: by }]));
          this.sql.exec(`INSERT INTO sign_todos (request, member, task, at) VALUES (?,?,?,?)`, request, m, id, at);
        }
      });
    } catch (e) {
      if (e && e.exhausted) return mintExhausted("TASK");
      throw e;
    }
    if (!won) return already(firstOf());     /* another ask landed first: answered with it */
    return { ok: true, request, case: caseId, edition: ed, at, asked: owners.length };
  }

  static PER_ITEM_MAX = PER_ITEM_MAX;   /* affordances.mjs: ONE number, published as set_acts[].max_items */
  #perItem(act, body, stamped, one) {
    const a = PER_ITEM_ACTS.find((x) => x.id === act);
    return perItem(act, body, stamped, one, { itemKeys: a && a.item_keys, sharedKeys: a && a.shared_keys });
  }

  /* ------------------------------------------------------------------ the scheduler consumer (R1)
     `scheduler` is earlier and keeps its registry; this module registers into it at start (K31, scheduler R8). */

  #drainDelayMs() {
    const v = Number(this.#env && this.#env.TASK_DRAIN_DELAY_MS);
    return Number.isFinite(v) && v >= 0 ? v : Tasks.TASK_DRAIN_DELAY_MS;
  }
  #lastDrainProgress = true;     // did the last drain tick make progress — decides DELAY vs BACKSTOP on re-arm

  /** capture's task notice (capture R44): a queued event re-arms the drain at its short delay. */
  async armDrain() { this.#lastDrainProgress = true; return await this.#scheduler.arm(); }

  /** After a tick that drained nothing: the earliest instant a waiting event is next due, each backed off by its own
   *  attempts (capture R45), an event at the retry limit wanting none; null when none wants one. (T36) Taken over every
   *  waiting event of R1's kind, read in pages as R1 reads them, not over the first page alone. */
  #backoffWake(now) {
    let at = null;
    this.#eachQueued(() => Tasks.TASK_DRAIN_ALARM_BATCH, (e) => {
      const a = Number(e.attempts) || 0;
      const last = Date.parse(e.lastTry);
      /* R25 (K4488): every try waits no longer than MAX_WAIT; from RETRY_LIMIT tries on, it is MAX_WAIT every time */
      const gap = a >= Tasks.TASK_DRAIN_RETRY_LIMIT ? Tasks.TASK_DRAIN_MAX_WAIT_MS
                                                   : Math.min(Tasks.TASK_DRAIN_BACKSTOP_MS * 2 ** (a - 1), Tasks.TASK_DRAIN_MAX_WAIT_MS);
      /* never tried by a drain (an event a mint could not yet take, R1): the plain backstop from now */
      const due = a < 1 || !Number.isFinite(last) ? now + Tasks.TASK_DRAIN_BACKSTOP_MS
                                                  : Math.max(now, last + gap);
      if (at === null || due < at) at = due;
    });
    return at;
  }

  /** R1, R18 (T36; capture R45's `after` and `cursor`): this module's kind of capture's queue, oldest first, in pages. Each
   *  page asks for `size()` events past the last event read; the next is read only while the page came back full (as many
   *  as it asked for) and `more()` holds. No event is visited twice in one read: an event already visited is skipped, and
   *  a page that brings none new, or whose last event carries no cursor, ends the read rather than reading the head again. */
  #eachQueued(size, visit, more = () => true) {
    const read = new Set();
    let after = null;
    for (;;) {
      const n = size();
      const page = this.#capture.taskEvents({ limit: n, kind: TASK_EVENT_KIND, after });
      const events = Array.isArray(page) ? page : [];
      let fresh = 0;
      for (const e of events) {
        const key = `${e.kind}\u0000${e.captureSha}`;
        if (read.has(key)) continue;
        read.add(key);
        fresh++;
        visit(e);
      }
      const last = events.length ? events[events.length - 1].cursor : null;
      if (events.length < n || !fresh || typeof last !== "string" || !last || !more()) return;
      after = last;
    }
  }

  /** R1: the `task-drain` consumer: due at every firing; its wake is the delay after a tick that drained something (or
   *  an arming since), the backed-off backstop after one that drained nothing, and null with no event queued. */
  drainConsumer() {
    return { name: "task-drain", key: "drain",
      due:  (now) => now,
      wake: (now) => !(this.#capture.taskEventCount({ kind: TASK_EVENT_KIND }) > 0) ? null
                       : this.#lastDrainProgress ? now + this.#drainDelayMs() : this.#backoffWake(now),
      tick: ()    => { const d = this.taskDrain({ limit: Tasks.TASK_DRAIN_ALARM_BATCH, actor: "alarm" });
                       this.#lastDrainProgress = d.drained > 0; return { drain: d }; } };
  }
}

/* R18: the drain's back-off constants, exported by name. */
export const TASK_DRAIN_BACKSTOP_MS = Tasks.TASK_DRAIN_BACKSTOP_MS;
export const TASK_DRAIN_RETRY_LIMIT = Tasks.TASK_DRAIN_RETRY_LIMIT;

const OF = new WeakMap();

/** K61: the one tasks instance for this Durable Object's storage (`ctx`, or the storage itself). On first reaching it,
 *  its TASK ledger is seeded (R5) and its table declared to record-core's purge (R8). When that declaration holds, its
 *  figure is registered with record-core's counts (R5), C-19.1 with promotion and with record-core's audit (R4), and,
 *  unless `deps.start` is false, its scheduler consumer, capture's task notice (R1; capture R44) and promotion's commit
 *  notice (its R45). A table another module already declared means that module holds the inbox (as queue did until
 *  N363's removal), so this module then registers nothing further: one live registration each. */
export function tasksOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let t = OF.get(storage);
  if (!t) {
    t = new Tasks({ host: ctx, storage, deps: { ...(deps || {}) } });
    OF.set(storage, t);
    const record = (deps && deps.record) || recordOf(ctx);
    t.seedLedger();
    /* R8, R17: every table of this module, the inbox and the check tables, to the whole-store purge only. */
    const held = record.declarePurge("tasks", TASKS_TABLES.map((name) => ({ name, keys: [] })));
    if (held && held.ok === true) {
      record.registerCounts("tasks", [...Tasks.COUNT_KEYS], (hid) => t.counts(hid));
      record.registerAuditCheck("tasks", (image) => t.audit(image));
      const promotion = (deps && deps.promotion)
        || promotionOf(ctx, { record, ...(deps && deps.membership ? { membership: deps.membership } : {}) });
      promotion.registerStep("tasks", { check: (c) => t.inboxCheck(c) });
      if (!deps || deps.start !== false) {
        const scheduler = (deps && deps.scheduler) || schedulerOf(ctx, deps && deps.env);
        scheduler.register("tasks", t.drainConsumer());
        const capture = (deps && deps.capture) || captureOf(ctx);
        capture.on("task", "tasks", async () => ({ armedAt: await t.armDrain() }));
        /* a committed promotion may have filed a waiting capture: the drain is re-armed at its delay (R18) */
        promotion.onCommitted("tasks", async () => { await t.armDrain(); return null; });
      }
    }
  }
  return t;
}

/* R22, R23 (K4168, K4202): the whole declaration of each op of this module that a screen sends or this tranche adds, read from
   the op's arm above, whole. `accepts` is every field the arm reads from the address and the body, the stamps (`viewer`, `by`,
   and the task acts' `actor`, which the control plane writes into the body) aside; `requires` the ones it refuses without,
   a list where any of several satisfies it. Class, mutating, weight and description are copied from the op's rows in
   `op-declarations` and `op-grades`, which agree; `taskdecide` has none, and is declared here alone. */
export const DECLARED_OPS = Object.freeze({
  taskdecide: Object.freeze({ classes: ["admin", "member"], machineClasses: [], mutating: true, weight: "reasoned",
    refusal: "AUTHORITY_NO_BASIS", needs: null, stamps: [],
    description: localize("tasks.declared.taskdecide", "task act, assignee-fenced; records the member's decision on who issued a captured document, with its basis, and resolves the task in the same act"),
    fields: Object.freeze({ accepts: ["id", "outcome", "authority", "basis"], requires: ["id", "outcome", "basis"] }) }),
  taskforward: Object.freeze({ classes: ["admin", "member"], mutating: true, weight: "reversible",
    description: localize("tasks.declared.taskforward", "task act, assignee-fenced; travels with the task via op=tasks"),
    fields: Object.freeze({ accepts: ["id", "to", "items"], requires: [["id", "items"], "to"] }) }),
  taskresolve: Object.freeze({ classes: ["admin", "member"], mutating: true, weight: "reversible",
    description: localize("tasks.declared.taskresolve", "task act, assignee-fenced; travels with the task via op=tasks"),
    fields: Object.freeze({ accepts: ["id", "items"], requires: [["id", "items"]] }) }),
  checkrequest: Object.freeze({ classes: ["admin", "member"], machineClasses: [], mutating: true, weight: "undetermined",
    needs: "contribute", stamps: ["viewer", "by"],
    description: localize("tasks.declared.checkrequest", "check-directed: keyed by a held object and its addressees, reached from the object; writes tasks' rows and moves no bundle"),
    fields: Object.freeze({ accepts: ["target", "label", "member", "note"], requires: ["target", ["label", "member"]] }) }),
  signrequest: Object.freeze({ classes: ["admin", "member"], machineClasses: [], mutating: true, weight: "reversible",
    needs: "contribute", stamps: ["viewer", "by"],
    description: localize("tasks.declared.signrequest", "case-directed: keyed by a prepared case edition; a member asks its project's owners to sign it, each given a To do; moves no bundle"),
    fields: Object.freeze({ accepts: ["case", "edition"], requires: ["case", "edition"] }) }),
});

/* The ops this module answers, as entries of the plane's one op map (K3), which control-plane's routes spread in
   (`control-plane/dispatch.mjs`). `viewer` is the control plane's stamp, read from the URL so a body never supplies one
   (R10); the task acts' actor rides in the body, stamped there by the control plane; the check acts' `by` is the URL's. */
export function tasksOps(t, url, body) {
  const s = (k) => url.searchParams.get(k);
  /* the instance's clock stamps an act on a task: a body's own `now` is not read, so no caller dates a history entry */
  const act = (b) => { const { now: _now, ...rest } = b || {}; return rest; };
  return {
    taskdrain: () => t.taskDrain(body || {}),
    tasks: () => t.taskList({ assignee: s("assignee"), status: s("status"), refersTo: s("refers"),
                              limit: s("limit"), viewer: s("viewer") }),
    taskforward: () => t.taskForward(act(body)),
    taskresolve: () => t.taskResolve(act(body)),
    /* R20 (K4169): `actor` the control plane's stamp in the body, as the two above; the decision the body's */
    taskdecide: () => t.taskDecide({ id: body?.id, outcome: body?.outcome, authority: body?.authority, basis: body?.basis, actor: body?.actor }),
    /* R13–R16 (T34; DEC-135): the stamps (`by`, `viewer`) from the query, read after the body so a body's copy never wins
       (R10); the request's own fields from the body. op-declarations R23 declares these and control-plane R55 routes them. */
    checkrequest: () => t.checkRequest({ target: body?.target, label: body?.label, member: body?.member, note: body?.note,
                                         by: s("by"), viewer: s("viewer") }),
    checktake: () => t.checkTake({ request: body?.request, by: s("by") }),
    checkrecord: () => t.checkRecord({ request: body?.request, verdict: body?.verdict, reason: body?.reason, by: s("by") }),
    checkrequests: () => t.checkRequests({ viewer: s("viewer"), after: s("after"), limit: s("limit") }),
    checksof: () => t.checksOf({ target: s("target"), viewer: s("viewer") }),
    /* R19 (DEC-207 (8)): `by` and `viewer` the URL's stamps (op-declarations R59; control-plane R84), the edition the body's */
    signrequest: () => t.signRequest({ case: body?.case, edition: body?.edition, by: s("by"), viewer: s("viewer") }),
  };
}
