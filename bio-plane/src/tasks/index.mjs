/* tasks — the obligation inbox (requirements: `build/requirements/tasks.md`, R1–R11).
 * Split out of `queue` at T16 (N363; Bob's K507, seams K531, `build/plan/draft-N363-queue-split.md`): tasks routed from
 * captures whose authority is undetermined, drained from capture's queue under the task grammar (C-19.1), listed to the
 * members who may see their subjects, and forwarded or resolved by their assignee, anyone when unassigned, or an
 * administrator.
 *
 *   taskDrain, taskList, taskForward, taskResolve   the inbox (R1–R3); the task grammar C-19.1 at the write, in the audit
 *                  and at the drain (R4); the `tasks` figure and the TASK ledger's seed (R5).
 *   recentTasks, resolvedTasks, taskExists           the three reads `queue`'s feed makes of the inbox (R6).
 *
 * REACHED as `tasksOf(ctx, deps)` (K61): one instance per Durable Object storage, created on the first call. At that
 * call it seeds its TASK ledger row (R5) and declares its table to record-core's purge (R8). When the declaration holds,
 * it registers its figure with record-core's counts (R5), the task grammar with promotion and with record-core's audit
 * (R4), and, unless `deps.start` is false, its `task-drain` consumer with the scheduler and capture's task notice (R1).
 * When another module already holds the table (as queue did until its job removed its copy of this code: N363), this
 * module registers none of those, so each consumer, listener, step, audit check and figure has one live registration.
 * `deps` (each defaults to its module's instance on the same `ctx`, reached lazily when first asked):
 *   record, membership, promotion, provenance, capture, connections, scheduler   the providers;
 *   env       the instance bindings: `BIO_NOW_MS` (the clock) and `TASK_DRAIN_DELAY_MS` (R1);
 *   now       a clock, `() => ms`, in place of `env`'s;
 *   start     false to skip the scheduler and capture registrations (a test that drives the consumer itself).
 * The ops are `tasksOps`' entries, which control-plane's routes spread into the plane's one map.
 */

import { isMachineStamp, isPublicHttpsLocator } from "../record-grammar/index.mjs";
import { recordOf, stampInstant, perItem, mintExhausted } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { connectionsOf } from "../connections/index.mjs";
import { schedulerOf } from "../scheduler/index.mjs";
import { PER_ITEM_ACTS, PER_ITEM_MAX } from "../affordances.mjs";
import { TASKS_SCHEMA } from "./schema.mjs";
import { QUEUE_MACHINE_CHECKS, TASK_ACTOR_CHECKS, QUEUE_INBOX_CHECKS, checkInboxGrammar } from "./checks.mjs";

export { TASKS_SCHEMA, TASKS_TABLES, tasksOwns } from "./schema.mjs";
export { QUEUE_MACHINE_CHECKS, TASK_ACTOR_CHECKS, QUEUE_INBOX_CHECKS, checkInboxGrammar } from "./checks.mjs";

const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

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

export class Tasks {
  #host; #deps; #env; #clock;
  constructor({ host, storage, deps = {} } = {}) {
    this.#host = host;
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
     DELAY is overridable per instance through TASK_DRAIN_DELAY_MS: production
     takes the short default, and a test that drives the consumer by hand pushes
     the automatic one out of its own window so the two never race on the clock. */
  static TASK_DRAIN_DELAY_MS = 1000;
  static TASK_DRAIN_BACKSTOP_MS = 60000;
  static TASK_DRAIN_ALARM_BATCH = 200;

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
      if (o) return { assignee: o.member_id, assignee_role: "project-manager", basis: `owner of ${cite[0]}, which cites this record` };
    }
    /* membership's active administrators (its R86), in the order the roster holds them, the founder (who is no member
       row, and holds no task) aside: the earliest. */
    const first = this.#membership.activeAdmins().find((m) => m !== "admin");
    const adm = first ? { member_id: first } : null;
    if (adm) return { assignee: adm.member_id, assignee_role: "group-admin", basis: "no project manager; the RULED fallback to a group admin" };
    /* Named honestly rather than assigned to someone who does not exist. An
       unassigned task is still visible and still routable by hand; a task
       addressed to a phantom is not. */
    return { assignee: "unassigned", assignee_role: "group-admin", basis: "no project manager and no active administrator" };
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
          detail: "the capture is not yet filed in any record; the event is kept, not dropped" });
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
         is withheld (R9), so a counted id told a member how many tasks existed that they could not read. On
         exhaustion the event is KEPT, as an unfiled capture's is, never dropped, and its `waiting` entry carries the
         one answer to that condition, record-core's `mintExhausted("TASK")` (its R62; N322): its code, row and
         sentence, minted there and nowhere here. */
      this.seedLedger();     // R5: the ledger has learned every live TASK id before the first mint draws one
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
        queued: this.#capture.taskEventCount(),
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
   *  Returns a TASK_NOT_YOURS refusal (N382: its own code, apart from intent's NOT_YOURS) NAMING who it is with, or null to proceed. */
  #refuseNotYours(row, actor, verb) {
    if (row.assignee === "unassigned") return null;
    if (actor === row.assignee) return null;
    if (this.#membership.isAdministrator(actor)) return null;
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
    if (row.status === "resolved") return { ok: false, reason: "ALREADY_RESOLVED", detail: "a resolved task is not forwarded; a new determination opens a new task" };
    const fenced = this.#refuseNotYours(row, actor, "forward");
    if (fenced) return fenced;
    /* membership R68: an active member by that id. */
    const facts = typeof to === "string" && to ? this.#membership.memberFacts(to) : null;
    const target = facts && facts.status === "active" ? { member_id: to } : null;
    if (!target) return { ok: false, reason: "NO_SUCH_MEMBER", detail: "a task is forwarded to an active member of this group" };
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
    const row = this.#one(`SELECT * FROM tasks WHERE id=?`, id);
    if (!row) return { ok: false, reason: "NO_SUCH_TASK" };
    if (row.status === "resolved") return { ok: true, id, already: true, resolved_at: row.resolved_at };
    const fenced = this.#refuseNotYours(row, actor, "resolve");
    if (fenced) return fenced;
    const at = now && ISO_INSTANT.test(now) ? now : stampInstant("second", this.#nowMs());
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

  /* ------------------------------------------------------------------ the scheduler consumer (R1)
     `scheduler` is earlier and keeps its registry; this module registers into it at start (K31, scheduler R8). */

  #drainDelayMs() {
    const v = Number(this.#env && this.#env.TASK_DRAIN_DELAY_MS);
    return Number.isFinite(v) && v >= 0 ? v : Tasks.TASK_DRAIN_DELAY_MS;
  }
  #lastDrainProgress = true;     // did the last drain tick make progress — decides DELAY vs BACKSTOP on re-arm

  /** capture's task notice (capture R44): a queued event re-arms the drain at its short delay. */
  async armDrain() { this.#lastDrainProgress = true; return await this.#scheduler.arm(); }

  /** R1: the `task-drain` consumer: due at every firing; its wake is the delay after a tick that drained something,
   *  the backstop after one that drained nothing, and null with no event queued. */
  drainConsumer() {
    return { name: "task-drain", key: "drain",
      due:  (now) => now,
      wake: (now) => this.#capture.taskEventCount() > 0
                       ? now + (this.#lastDrainProgress ? this.#drainDelayMs() : Tasks.TASK_DRAIN_BACKSTOP_MS)
                       : null,
      tick: ()    => { const d = this.taskDrain({ limit: Tasks.TASK_DRAIN_ALARM_BATCH, actor: "alarm" });
                       this.#lastDrainProgress = d.drained > 0; return { drain: d }; } };
  }
}

const OF = new WeakMap();

/** K61: the one tasks instance for this Durable Object's storage (`ctx`, or the storage itself). On first reaching it,
 *  its TASK ledger is seeded (R5) and its table declared to record-core's purge (R8). When that declaration holds, its
 *  figure is registered with record-core's counts (R5), C-19.1 with promotion and with record-core's audit (R4), and,
 *  unless `deps.start` is false, its scheduler consumer and capture's task notice (R1; capture R44). A table another
 *  module already declared means that module holds the inbox (as queue did until N363's removal), so this module then
 *  registers nothing further: one live registration each. */
export function tasksOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let t = OF.get(storage);
  if (!t) {
    t = new Tasks({ host: ctx, storage, deps: { ...(deps || {}) } });
    OF.set(storage, t);
    const record = (deps && deps.record) || recordOf(ctx);
    t.seedLedger();
    const held = record.declarePurge("tasks", [{ name: "tasks", keys: [] }]);
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
      }
    }
  }
  return t;
}

/* The ops this module answers, as entries of the plane's one op map (K3), which control-plane's routes spread in
   (`control-plane/dispatch.mjs`). `viewer` is the control plane's stamp, read from the URL so a body never supplies one
   (R10); the actor rides in the body, stamped there by the control plane. */
export function tasksOps(t, url, body) {
  const s = (k) => url.searchParams.get(k);
  return {
    taskdrain: () => t.taskDrain(body || {}),
    tasks: () => t.taskList({ assignee: s("assignee"), status: s("status"), refersTo: s("refers"),
                              limit: s("limit"), viewer: s("viewer") }),
    taskforward: () => t.taskForward(body || {}),
    taskresolve: () => t.taskResolve(body || {}),
  };
}
