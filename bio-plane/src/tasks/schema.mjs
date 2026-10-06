/* tasks' tables (requirements: `build/requirements/tasks.md`, R8, R17): the obligation inbox, and "Ask for a check"'s
 * requests, To do links, takes and checks (T34, DEC-135). `tasks` moved from `queue/schema.mjs` at the
 * module's extraction (T16, N363; K4, "each module owns its tables"). `tasksOf(ctx).migrate()` runs it, from the store's
 * schema pass and on its own for a storage the store never reached. */
export const TASKS_TABLES = Object.freeze(["tasks", "check_requests", "check_todos", "check_takes", "check_records"]);

/** A table in a purge list (a name, or `{name, …}`) that is this module's. */
export const tasksOwns = (t) => TASKS_TABLES.includes(typeof t === "string" ? t : t && t.name);

export const TASKS_SCHEMA = `-- ---- D-98: the task inbox, and the queue that makes auto-creation safe ----

-- The inbox itself, the tasks array of data/inbox.json persisted. WORKING store
-- only: an inbox is the group talking to itself about what it has NOT
-- established, which is the opposite of ratified public material, so it never
-- crosses the publication fence.
--
-- history is a JSON array, append-only by the write path, shaped exactly like a
-- member_expertise row (at, event, actor). Who a task was taken FROM is as much
-- a fact as who holds it now, so a forward appends and never rewrites.
CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT PRIMARY KEY,
  kind          TEXT NOT NULL,
  refers_to     TEXT NOT NULL,
  capture_sha   TEXT,
  subject_text  TEXT NOT NULL,
  subject_desc  TEXT,
  locators      TEXT,
  assignee      TEXT NOT NULL,
  assignee_role TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'open',
  created       TEXT NOT NULL,
  resolved_at   TEXT,
  history       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tasks_assignee ON tasks(assignee, status);
CREATE INDEX IF NOT EXISTS tasks_refers ON tasks(refers_to);
-- The RULED dedup, enforced by the store rather than remembered by the writer:
-- one LIVE task per (refers_to, kind). Live means open OR forwarded, and the
-- distinction matters: a forwarded task is still somebody's work, so excluding
-- it here would let a re-capture spawn a second task for a subject already in
-- flight, which is the flood the dedup exists to prevent. Only 'resolved' is
-- exempt, because a subject that comes back undetermined after being resolved
-- is genuinely new and not a duplicate of a closed one.
--
-- T34 (DEC-135, R14): a check request's To do is one task per addressee, kind
-- 'check-requested', on the same target, so the dedup covers every OTHER kind.
-- The index of before T34 (all kinds) is dropped and this one, narrower, made.
DROP INDEX IF EXISTS tasks_live_unique;
CREATE UNIQUE INDEX IF NOT EXISTS tasks_live_unique_drained ON tasks(refers_to, kind)
  WHERE status IN ('open', 'forwarded') AND kind <> 'check-requested';

-- ---- T34, DEC-135: "Ask for a check" (R13-R17). Append-only: rows are inserted and never updated or deleted. ----

-- R13: the request, as the owner made it, with the number addressed at that instant.
CREATE TABLE IF NOT EXISTS check_requests (
  request    TEXT PRIMARY KEY,
  target     TEXT NOT NULL,
  label      TEXT,
  member     TEXT,
  note       TEXT,
  by         TEXT NOT NULL,
  at         TEXT NOT NULL,
  addressed  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS check_requests_by ON check_requests(by, at);
-- R14: which task is whose To do for which request (an addressee's, or a taker's made at the take).
CREATE TABLE IF NOT EXISTS check_todos (
  request    TEXT NOT NULL,
  member     TEXT NOT NULL,
  task       TEXT NOT NULL,
  at         TEXT NOT NULL,
  PRIMARY KEY (request, member, task)
);
-- R14: the take, at most one per request: the primary key makes the second taker's write fail, so exactly one succeeds.
CREATE TABLE IF NOT EXISTS check_takes (
  request    TEXT PRIMARY KEY,
  taker      TEXT NOT NULL,
  handle     TEXT,
  at         TEXT NOT NULL
);
-- R15: the check or reasoned concern, at most one per request.
CREATE TABLE IF NOT EXISTS check_records (
  check_id   TEXT PRIMARY KEY,
  request    TEXT NOT NULL UNIQUE,
  target     TEXT NOT NULL,
  checker    TEXT NOT NULL,
  handle     TEXT,
  label      TEXT,
  expertise  TEXT,
  verdict    TEXT NOT NULL,
  reason     TEXT,
  at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS check_records_target ON check_records(target, at);
`;
