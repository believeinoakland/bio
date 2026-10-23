/* plane R75, R77 (T51 fix rounds 4 and 4b; C5c; K4429, K4487; amends R4, R76; acquisition R96 and R100, extraction R80 and R82,
   control-plane R120 and R123): THE OWED-WORK LEDGER, FINISHED BY THE OBJECT'S OWN ALARM. A request is answered inside the door's
   bound and the Durable Object keeps no promise alive after it, so work that will not end inside the bound is written down
   here, in the object's storage, and finished by one `scheduler` consumer, `pending-work`. The table is `keeps_pending`, one row
   for each `(sha, kind)`; the kinds are
     `keep`          the whole is not yet put; `parts` are the part digests in order (acquisition R96); put by
                     `evidenceStore().putFromParts` (record-core R87), then read, in the same tick;
     `reading`       the whole is held and its reading is owed (control-plane R120, R123), by `extraction.readHeld`;
     `ocr`           pages of a scan left unread (extraction R82), continued by `extraction.readHeld({sha, kind: "ocr"})`, which
                     answers `owed: true` while pages remain;
     `subresources`  a web capture's outstanding supporting files and pending render, keyed by the capture SESSION (acquisition
                     R100), run by `acquisition.owedRun(cap, {kind, session})`;
     `unpack`        an archive stopped by a budget (acquisition R100), run as the unpack drain does, `op=unpack` as the daemon;
     `fetch`         a large web capture handed to the alarm (fix round 6, G2; acquisition's `owedFetch`), keyed by the capture SESSION as
                     `subresources` is, heavy: its body is read and its document filed by the alarm, never inside the member's request.
   An entry ends only when its work is done, or when its owner answers a FINAL reason (`final: true`, with its `why`), which the
   row then keeps, stated, for the document's page (op `owedwork`); never by a count or a clock. A failure, `NO_HOME` among them,
   leaves the entry for a later alarm, backed off from `PENDING_RETRY_MS` doubling to at most `PENDING_RETRY_MAX_MS` and going on
   at that rate. A second registration of the same entry re-arms it (no attempts, due now), a final one too.

   THE RUN IS COUNTED BEFORE IT HAPPENS (fix round 5, E2; K4530). An owner that kills the isolate (memory, CPU) never returns, so the
   ledger cannot learn of it from an answer. A row is stamped `started_at`, its try counted and its back-off set, before its owner
   runs; every answer clears `started_at`. A row found started and not finished at a later tick, by an isolate that is not running
   it, is an interrupted run: it is counted in `interrupted`, which a re-registration keeps, and the third ends it, stated. A tick
   runs the light kinds (`subresources`, `unpack`) and at most one heavy row (`keep`, `reading`, `ocr`), so one document's read
   never holds the object that answers every screen for the length of three.

   A ROW'S TIME IS ITS OWN (fix round 7, G67, G69; R91, R92). A row is stamped started at its OWN start (`now()` when it begins, never the
   alarm's instant, which every consumer and row of the tick shares), so `last_ms` is that row's elapsed time and no earlier row's. It is
   split: `wait_ms` the part spent awaiting a worker (a service binding, measured by the plane around the binding the owner is handed, the
   union of overlapping calls), `own_ms` the rest; the 10 s bar is `own_ms`'s. `last_mem` is NULL where the platform reports no memory
   (workerd answers zeros). The last run of each `(sha, kind)` is kept beyond the row in `keeps_last`: a good tick deletes its row.

   Lower modules cannot import this one (it is last in the order), so they are handed the registration at composition, as they
   are handed `cap.waitUntil`: `captureOf(ctx).keepLater({sha, parts})` and `.owedLater({kind, sha, session?, parts?, detail?})`, async, writing
   the entry and arming the alarm in one step and never throwing. The door's deferred reading arrives by the store-internal
   route `pendingadd`. An owner answers one of: `{ok: true, read: true}` or `{ok: true, done: true}` (ended), `{ok: true, more:
   true, detail}` or `{ok: true, owed: true}` (a stage ended, the rest follows at once), `{final: true, why}` (ended, stated),
   anything else (tried again). */
import { recordOf } from "../record-core/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { acquisitionOf, owedRun } from "../acquisition/index.mjs";
import * as acquisitionModule from "../acquisition/index.mjs";   /* `owedFetch` is read from the namespace: an instance's own, else the module's */
import { captureOf } from "../capture/index.mjs";
import { schedulerOf } from "../scheduler/index.mjs";
import { localize } from "../setup-words/index.mjs";
import { ROOT_ADMIN, baseViewer, viewerMember } from "../member-roster/index.mjs";

export const KEEPS_PENDING_DDL = `CREATE TABLE IF NOT EXISTS keeps_pending (
  sha TEXT NOT NULL, kind TEXT NOT NULL, parts TEXT NOT NULL DEFAULT '[]', detail TEXT NOT NULL DEFAULT '{}',
  attempts INTEGER NOT NULL DEFAULT 0, registered_at INTEGER NOT NULL, due_at INTEGER NOT NULL, last_try INTEGER, last_why TEXT,
  final_why TEXT, started_at INTEGER, interrupted INTEGER NOT NULL DEFAULT 0, last_ms INTEGER, last_mem INTEGER, own_ms INTEGER, wait_ms INTEGER,
  PRIMARY KEY (sha, kind))`;
/** R92: the last run of each (digest or session, kind), kept after the row has ended. */
export const KEEPS_LAST_DDL = `CREATE TABLE IF NOT EXISTS keeps_last (
  sha TEXT NOT NULL, kind TEXT NOT NULL, last_ms INTEGER, own_ms INTEGER, wait_ms INTEGER, last_mem INTEGER, outcome TEXT NOT NULL, at INTEGER NOT NULL,
  PRIMARY KEY (sha, kind))`;
export const PENDING_NAME = "pending-work";
export const PENDING_KINDS = Object.freeze(["keep", "reading", "ocr", "subresources", "unpack", "fetch"]);
export const PENDING_RETRY_MS = 15_000;
export const PENDING_RETRY_MAX_MS = 3_600_000;
export const PENDING_BATCH = 3;
export const PENDING_INTERRUPTED_MAX = 3;
const HEAVY = Object.freeze(["keep", "reading", "ocr", "fetch"]);
/* an entry of these kinds is keyed by its capture SESSION (acquisition R100), the others by a digest */
const SESSION_KEYED = Object.freeze(["subresources", "fetch"]);

const DIGEST = /^[0-9a-f]{64}$/;
const HOLDERS = new WeakMap();
const why = (e) => String(e && e.message || e).slice(0, 160);
const interruptedWhy = () => localize("plane.pending.interrupted", "the reading did not finish; the object stopped");
/* the platform's memory marker, or null where it measures none: workerd answers all zeros, which is no reading (R92) */
const memory = () => { try { const m = globalThis.process && typeof globalThis.process.memoryUsage === "function" ? globalThis.process.memoryUsage() : null; const n = m ? Math.round(m.rss || m.heapUsed || 0) : 0; return n > 0 ? n : null; } catch { return null; } };
/* the service bindings a row's owner awaits: a call through one is `wait_ms` (the worker's time, not the object's thread) */
const WORKER_BINDINGS = Object.freeze(["PDF_WORKER", "OCR_WORKER", "SHEET_WORKER", "AGENT_WORKER", "FILE_SCANNER", "SELF"]);
const RANK = { keep: 0, reading: 1, ocr: 2, subresources: 3, unpack: 4, fetch: 5 };
const json = (v, otherwise) => { try { const o = JSON.parse(v); return o && typeof o === "object" ? o : otherwise; } catch { return otherwise; } };

/** The pending-work holder of a host (one per storage): `{migrate, keepLater, owe, add, list, summary, consumer}`. `deps`: `env`,
 *  `store` (a function answering the object's namespace), `now` (the clock; a test's own), `deliver` (control-plane's `deliverOwedRender`, handed by the composition) and `workers` (kind -> async
 *  `(entry, {at}) -> answer`, replacing the default owner of that kind; a test's). */
export function pendingOf(ctx, deps = {}) {
  let h = HOLDERS.get(ctx);
  if (h) return h;
  const sql = ctx.storage.sql;
  const env = deps.env ?? null;
  const store = typeof deps.store === "function" ? deps.store : () => "bio";
  const now = typeof deps.now === "function" ? deps.now : () => Date.now();
  const all = (q, ...a) => [...sql.exec(q, ...a)];
  const backoff = (attempts) => Math.min(PENDING_RETRY_MAX_MS, PENDING_RETRY_MS * 2 ** Math.min(20, Math.max(0, attempts - 1)));
  const arm = async () => { try { await schedulerOf(ctx, env).arm(now()); } catch { /* the stored entry re-derives it at the next start */ } };

  /* register an entry, or re-arm the one held (a second registration of an exhausted or final entry starts it afresh) */
  const put = (sha, kind, parts, detail) => {
    const at = now();
    const have = all(`SELECT 1 AS x FROM keeps_pending WHERE sha=? AND kind=?`, sha, kind)[0];
    if (!have) sql.exec(`INSERT INTO keeps_pending (sha, kind, parts, detail, attempts, registered_at, due_at) VALUES (?,?,?,?,?,?,?)`,
                        sha, kind, JSON.stringify(parts), JSON.stringify(detail), 0, at, at);
    else sql.exec(`UPDATE keeps_pending SET parts=CASE WHEN ?='[]' THEN parts ELSE ? END, detail=CASE WHEN ?='{}' THEN detail ELSE ? END,
                     attempts=0, due_at=?, final_why=NULL WHERE sha=? AND kind=?`,
                  JSON.stringify(parts), JSON.stringify(parts), JSON.stringify(detail), JSON.stringify(detail), at, sha, kind);
  };
  /* R91: what a row spent awaiting the workers it was handed, the union of overlapping calls: `ms()` is the time at least one was in flight */
  const meters = new Map();
  const meterOf = (row) => {
    const k = keyOf(row);
    let m = meters.get(k);
    if (!m) { m = { open: 0, since: 0, total: 0, ms() { return m.total + (m.open > 0 ? now() - m.since : 0); } }; meters.set(k, m); }
    return m;
  };
  /* the env an owner is handed: the same, its worker bindings' `fetch` timed. Without the bindings (a test's) the env is the owner's own. */
  const timed = (row) => {
    if (!env || typeof env !== "object") return env;
    const m = meterOf(row);
    const span = async (fn) => { if (m.open++ === 0) m.since = now(); try { return await fn(); } finally { if (--m.open === 0) m.total += Math.max(0, now() - m.since); } };
    return new Proxy(env, { get(target, key) {
      const v = target[key];
      if (!WORKER_BINDINGS.includes(key) || !v || typeof v.fetch !== "function") return v;
      return new Proxy(v, { get(b, p) { const f = b[p]; return p === "fetch" ? (...a) => span(() => b.fetch(...a)) : typeof f === "function" ? f.bind(b) : f; } });
    } });
  };
  /* a row's run, measured at its end: the elapsed time, the part awaiting workers, the rest, and the memory marker (null where none is measured) */
  const measure = (row) => {
    const last_ms = Math.max(0, Math.round(now() - (row.started_at ?? now())));
    const wait_ms = Math.min(last_ms, Math.max(0, Math.round(meterOf(row).ms())));
    return { last_ms, wait_ms, own_ms: last_ms - wait_ms, last_mem: memory() };
  };
  /* R92: the last run of this (digest or session, kind), kept after the row ends */
  const noteLast = (row, m, outcome) => {
    sql.exec(`INSERT INTO keeps_last (sha, kind, last_ms, own_ms, wait_ms, last_mem, outcome, at) VALUES (?,?,?,?,?,?,?,?)
              ON CONFLICT (sha, kind) DO UPDATE SET last_ms=excluded.last_ms, own_ms=excluded.own_ms, wait_ms=excluded.wait_ms, last_mem=excluded.last_mem, outcome=excluded.outcome, at=excluded.at`,
             row.sha, row.kind, m.last_ms, m.own_ms, m.wait_ms, m.last_mem, outcome, now());
    meters.delete(keyOf(row));
  };
  const num = (v) => (v === null || v === undefined ? "NULL" : String(Math.round(v)));
  /* `row.attempts` already holds this run's try (`stamp`); the run's end clears `started_at` and notes how long it took (the row's own time and the part awaiting workers) and the memory marker */
  const ended = (row, outcome) => {
    const m = measure(row);
    noteLast(row, m, outcome);
    return `started_at=NULL, last_ms=${num(m.last_ms)}, own_ms=${num(m.own_ms)}, wait_ms=${num(m.wait_ms)}, last_mem=${num(m.last_mem)}`;
  };
  const attempt = (row, at, because) => {
    sql.exec(`UPDATE keeps_pending SET ${ended(row, "retried")}, last_try=?, due_at=?, last_why=? WHERE sha=? AND kind=?`, at, at + backoff(row.attempts), because, row.sha, row.kind);
    return "retried";
  };
  const end = (row) => { noteLast(row, measure(row), "finished"); sql.exec(`DELETE FROM keeps_pending WHERE sha=? AND kind=?`, row.sha, row.kind); return "finished"; };
  const stop = (row, at, because) => {
    sql.exec(`UPDATE keeps_pending SET ${ended(row, "final")}, final_why=?, last_try=?, last_why=? WHERE sha=? AND kind=?`, because, at, because, row.sha, row.kind);
    return "final";
  };
  const live = () => all(`SELECT * FROM keeps_pending WHERE final_why IS NULL`)
    .sort((a, b) => a.due_at - b.due_at || a.registered_at - b.registered_at || RANK[a.kind] - RANK[b.kind] || (a.sha < b.sha ? -1 : 1));
  const next = () => { const r = live()[0]; return r ? r.due_at : null; };

  /* what an owner answered, read: the entry's outcome */
  const settle = (row, at, r) => {
    if (r && (r.final === true || r.failure === "final")) return stop(row, at, String(r.why || r.reason || r.code || "FINAL").slice(0, 160));
    if (r && r.ok === true && r.more === true) {
      /* a piece ended and the rest follows by the cursor the owner answered (`detail`), one heavy piece for each tick. A piece that moved the
         cursor is progress: the isolate lived through it, so the interruptions counted before it no longer stand against what follows (fix round 6, G13) */
      const next = JSON.stringify(r.detail && typeof r.detail === "object" ? r.detail : json(row.detail, {}));
      /* due one millisecond on: a pass that went on moves its due instant (B38), so the scheduler's hold against a spin (its R27) reads a changed
         wake even where the tick began with a row found stopped, whose wake it read as "now" */
      sql.exec(`UPDATE keeps_pending SET ${ended(row, "more")}, detail=?, attempts=0, due_at=?, last_try=?, last_why=NULL${next !== row.detail ? ", interrupted=0" : ""} WHERE sha=? AND kind=?`,
               next, at + 1, at, row.sha, row.kind);
      return "retried";
    }
    if (r && r.ok === true && r.owed === true) {
      /* work remains for the digest (extraction R82). An `ocr` pass that read pages goes on at once; a pass that read none (the member
         down) and a reading whose own failure was transient wait their back-off. A reading that left pages of a scan unread owes an `ocr`
         entry besides, and keeps its own until the next call finds the reading held. */
      if (row.kind === "ocr" && r.read === true) {
        sql.exec(`UPDATE keeps_pending SET ${ended(row, "more")}, attempts=0, due_at=?, last_try=?, last_why=NULL WHERE sha=? AND kind=?`, at, at, row.sha, row.kind);
        return "retried";
      }
      if (row.kind !== "ocr" && r.read === true) put(row.sha, "ocr", [], {});
      return attempt(row, at, String(r.why || "OWED"));
    }
    if (r && r.ok === true && (r.read === true || r.done === true || r.why === "READING_HELD")) return end(row);
    return attempt(row, at, String(r && (r.why || r.code || r.reason) || "NOT_DONE"));
  };
  /* the rows this isolate is running now: a row stamped started that is not among them was started by an isolate that is gone */
  const running = new Set();
  const keyOf = (row) => `${row.kind}\u0000${row.sha}`;
  /* the run is counted before it happens: started (at the row's OWN start, `now()`, not the alarm's `at` which every row of the tick shares; R91),
     one more try, and the back-off it will be first again after */
  const stamp = (row, at) => {
    const n = row.attempts + 1, began = now();
    sql.exec(`UPDATE keeps_pending SET started_at=?, attempts=?, last_try=?, due_at=? WHERE sha=? AND kind=?`, began, n, at, at + backoff(n), row.sha, row.kind);
    meters.delete(keyOf(row));
    return { ...row, attempts: n, started_at: began, last_try: at };
  };
  /* a row found started by an isolate that is gone: an interrupted run, counted; the third ends it, stated */
  const startedRows = () => all(`SELECT * FROM keeps_pending WHERE final_why IS NULL AND started_at IS NOT NULL`).filter((r) => !running.has(keyOf(r)));
  const reapInterrupted = () => {
    for (const row of startedRows()) {
      const n = row.interrupted + 1;
      if (n >= PENDING_INTERRUPTED_MAX)
        sql.exec(`UPDATE keeps_pending SET interrupted=?, started_at=NULL, final_why=?, last_why=? WHERE sha=? AND kind=?`, n, interruptedWhy(), interruptedWhy(), row.sha, row.kind);
      else sql.exec(`UPDATE keeps_pending SET interrupted=?, started_at=NULL, last_why=? WHERE sha=? AND kind=?`, n, "OBJECT_STOPPED", row.sha, row.kind);
    }
  };
  const call = async (fn) => { try { return await fn(); } catch (e) { return { ok: false, reason: why(e) }; } };

  /* `detail` is what the owner's last answer left for it (a cursor over a text, `{}` at first), handed back as it was kept (R82) */
  const readNow = (row, at) => call(() => extractionOf(ctx).readHeld({ sha: row.sha, kind: row.kind, detail: json(row.detail, {}), storeName: store(), env: timed(row) }))
    .then((r) => row.kind === "ocr" && r && r.ok === true && r.owed !== true && r.final !== true ? end(row) : settle(row, at, r));
  const owner = {
    reading: readNow,
    ocr: readNow,
    keep: async (row, at) => {
      const ev = recordOf(ctx).evidenceStore();
      if (!ev || typeof ev.putFromParts !== "function") return attempt(row, at, "NO_MULTIPART_STORE");
      const r = await call(() => ev.putFromParts(row.sha, JSON.parse(row.parts)));
      if (r && r.final === true) return stop(row, at, String(r.why || r.code || r.reason || "FINAL").slice(0, 160));
      if (!r || r.ok !== true) return attempt(row, at, String(r && (r.code || r.reason) || "REFUSED"));
      /* the whole is held: the keep ends and the reading it owes is entered, then asked for in this same tick */
      end(row);
      put(row.sha, "reading", [], {});
      const reading = stamp(all(`SELECT * FROM keeps_pending WHERE sha=? AND kind='reading'`, row.sha)[0], at);
      /* G79: a keep handed to the ledger at once can end before the screen has filed the document: no home yet (`NO_HOME`) owes nothing, the filing's
         promotion owes the reading through control-plane's `unreadDocuments`. A filed document's keep still owes its reading. */
      const asked = await call(() => extractionOf(ctx).readHeld({ sha: reading.sha, kind: reading.kind, detail: json(reading.detail, {}), storeName: store(), env: timed(reading) }));
      if (asked && asked.ok === true && asked.read === false && asked.why === "NO_HOME") {
        sql.exec(`DELETE FROM keeps_pending WHERE sha=? AND kind='reading'`, reading.sha);
        meters.delete(keyOf(reading));
        return "finished";
      }
      return settle(reading, at, asked);
    },
    subresources: async (row, at) => {
      const acq = acquisitionOf(ctx);
      const run = acq && typeof acq.owedRun === "function" ? acq.owedRun.bind(acq) : owedRun;   /* acquisition's export; an instance's own is a test's */
      /* a rendered document is promoted beside its shell by the door's own function (control-plane, B29), handed in by the composition; without it a pending render stays the member's "Finish it" */
      const deliver = typeof deps.deliver === "function" ? (a) => deps.deliver({ ctx, env, storeName: store(), ...a }) : undefined;
      const r = await call(() => run(captureOf(ctx), { kind: "subresources", session: row.sha }, { storeName: store(), env: timed(row), ...(deliver ? { deliver } : {}) }));
      if (r && r.final === true && r.reason) return stop(row, at, String(r.reason).slice(0, 160));
      if (r && r.ok === true && r.done === true) return end(row);
      return attempt(row, at, String(r && (r.reason || r.code || r.why) || (r && r.outstanding ? "OUTSTANDING" : "NOT_DONE")));
    },
    /* fix round 6, G2 (R81): a large capture's fetch, by acquisition's `owedFetch(cap, {kind: "fetch", session}, {storeName, env, deliver})`, its
       finished document handed to the same `deliver` (control-plane's, which promotes it and owes its reading). The session's row is heavy. */
    fetch: async (row, at) => {
      const acq = acquisitionOf(ctx);
      const run = acq && typeof acq.owedFetch === "function" ? acq.owedFetch.bind(acq) : acquisitionModule.owedFetch;
      if (typeof run !== "function") return attempt(row, at, "NO_OWNER");
      const deliver = typeof deps.deliver === "function" ? (a) => deps.deliver({ ctx, env, storeName: store(), ...a }) : undefined;
      const r = await call(() => run(captureOf(ctx), { kind: "fetch", session: row.sha }, { storeName: store(), env: timed(row), ...(deliver ? { deliver } : {}) }));
      if (r && r.final === true) return stop(row, at, String(r.reason || r.why || r.code || "FINAL").slice(0, 160));
      if (r && r.ok === true && r.done === true) return end(row);
      if (r && r.ok === true && r.more === true) return settle(row, at, r);   /* the fetch goes on at the next tick, from where it stopped */
      return attempt(row, at, String(r && (r.reason || r.code || r.why) || "NOT_DONE"));
    },
    /* the archive-unpack drain's call (plane/unpack.mjs): `op=unpack` as the daemon, through the door */
    unpack: async (row, at) => {
      if (!(env && env.SELF && typeof env.SELF.fetch === "function" && typeof env.DAEMON_TOKEN === "string" && env.DAEMON_TOKEN !== ""))
        return attempt(row, at, "NOT_CONFIGURED");
      let status = 0, body = null;
      try {
        const res = await timed(row).SELF.fetch(new Request("https://self/api/?op=unpack", { method: "POST",
          headers: { authorization: `Bearer ${env.DAEMON_TOKEN}`, "content-type": "application/json" }, body: JSON.stringify({ archiveSha: row.sha }) }));
        status = res.status;
        body = await res.json();
      } catch { /* an unreadable answer is an attempt */ }
      const r = body && typeof body === "object" ? (body.result && typeof body.result === "object" ? body.result : body) : null;
      if (status >= 200 && status < 300 && r && r.ok !== false) {
        if (r.complete === true) return end(row);
        const code = r.waiting_on && (r.waiting_on.code || r.waiting_on.reason);
        if (typeof code === "string" && /^(ARCHIVE_TREE_|ARCHIVE_DEPTH_MAX)/.test(code)) return stop(row, at, code);   /* a limit no retry changes; the page states it */
        return attempt(row, at, typeof code === "string" ? code : "WAITING");   /* a daily budget: owed until it renews */
      }
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) return stop(row, at, String(r && (r.reason || r.code) || `REFUSED_${status}`).slice(0, 160));
      return attempt(row, at, `STATUS_${status}`);
    },
  };
  const run = async (row0, at) => {
    const row = stamp(row0, at);
    running.add(keyOf(row));
    try {
      const w = deps.workers && deps.workers[row.kind];
      if (typeof w === "function") return settle(row, at, await call(() => w({ ...row, parts: json(row.parts, []), detail: json(row.detail, {}) }, { at })));
      return await owner[row.kind](row, at);
    } finally { running.delete(keyOf(row)); }
  };

  h = {
    /** R75, R77 (and R5's migration pass): the ledger's table; one an earlier release wrote (one row for each digest, a count
     *  that gave up) is carried over and every entry of it re-armed, so none stays given up. */
    migrate() {
      const cols = all(`PRAGMA table_info(keeps_pending)`).map((c) => c.name);
      if (cols.length && !cols.includes("detail")) {
        const at = now();
        sql.exec(`ALTER TABLE keeps_pending RENAME TO keeps_pending_old`);
        sql.exec(KEEPS_PENDING_DDL);
        sql.exec(`INSERT INTO keeps_pending (sha, kind, parts, attempts, registered_at, due_at, last_try, last_why)
                  SELECT sha, kind, parts, 0, registered_at, ?, last_try, last_why FROM keeps_pending_old`, at);
        sql.exec(`DROP TABLE keeps_pending_old`);
      } else sql.exec(KEEPS_PENDING_DDL);
      /* fix round 5: the run's accounting; a ledger of the round before gains the columns and its rows start with none */
      const have = all(`PRAGMA table_info(keeps_pending)`).map((c) => c.name);
      for (const [col, def] of [["started_at", "INTEGER"], ["interrupted", "INTEGER NOT NULL DEFAULT 0"], ["last_ms", "INTEGER"], ["last_mem", "INTEGER"],
                                ["own_ms", "INTEGER"], ["wait_ms", "INTEGER"]])
        if (!have.includes(col)) sql.exec(`ALTER TABLE keeps_pending ADD COLUMN ${col} ${def}`);
      sql.exec(KEEPS_LAST_DDL);
    },
    /** R77: owed work, whatever its kind. `parts` (a keep) and `detail` (a cursor, a session's key) are the owner's. */
    async owe({ kind, sha, session, parts, detail } = {}) {
      /* the ledger's key is the digest, but a web capture's outstanding files, and its fetch, are owed by its SESSION (acquisition R100) */
      const sessionKeyed = SESSION_KEYED.includes(kind);
      const key = sessionKeyed ? session : sha;
      if (!PENDING_KINDS.includes(kind)) return { ok: false, reason: "PENDING_MALFORMED" };
      if (sessionKeyed ? (typeof key !== "string" || key === "" || key.length > 200) : (typeof key !== "string" || !DIGEST.test(key)))
        return { ok: false, reason: "PENDING_MALFORMED" };
      if (sessionKeyed && sha !== undefined) detail = { ...(detail || {}), sha };
      const p = parts === undefined ? [] : parts;
      if (!Array.isArray(p) || !p.every((x) => typeof x === "string" && DIGEST.test(x)) || (kind === "keep" && p.length === 0)
          || (detail !== undefined && (detail === null || typeof detail !== "object" || Array.isArray(detail))))
        return { ok: false, reason: "PENDING_MALFORMED" };
      try { put(key, kind, p, detail || {}); } catch (e) { return { ok: false, reason: "PENDING_NOT_KEPT", detail: why(e) }; }
      await arm();
      return { ok: true };
    },
    /** acquisition R100: owed work of the kinds `subresources` and `unpack` (the hook `captureOf(ctx).owedLater`) */
    owedLater(entry) { return h.owe(entry || {}); },
    /** acquisition R96: a keep that will not end inside the bound. `parts` are the part digests in order. */
    keepLater({ sha, parts } = {}) { return h.owe({ kind: "keep", sha, parts }); },
    /** control-plane R120, R123: work the door deferred; a keep names its parts, which only acquisition has. */
    add({ kind, sha } = {}) { return kind === "keep" ? Promise.resolve({ ok: false, reason: "PENDING_MALFORMED" }) : h.owe({ kind, sha }); },
    /** every entry, or those of one digest, with the state the document's page states: `owed`, or `final` with its reason */
    list({ sha } = {}) {
      const rows = sha === undefined ? all(`SELECT * FROM keeps_pending`) : all(`SELECT * FROM keeps_pending WHERE sha=?`, sha);
      return rows.sort((a, b) => a.registered_at - b.registered_at || (a.sha < b.sha ? -1 : a.sha > b.sha ? 1 : RANK[a.kind] - RANK[b.kind]))
        .map((r) => ({ sha: r.sha, kind: r.kind, state: r.final_why === null ? "owed" : "final", attempts: r.attempts, registered_at: r.registered_at,
                       next_try: r.final_why === null ? r.due_at : null, last_try: r.last_try, why: r.final_why ?? r.last_why, detail: json(r.detail, {}),
                       interrupted: r.interrupted, running: r.started_at !== null && running.has(keyOf(r)), last_ms: r.last_ms, own_ms: r.own_ms, wait_ms: r.wait_ms,
                       last_mem: r.last_mem }));
    },
    /** R92: the last run of each kind held for a digest or session, after its row has ended or while it is owed: `{kind, outcome, last_ms, own_ms, wait_ms, last_mem, at}` */
    ledgerLast({ sha } = {}) {
      return all(`SELECT kind, outcome, last_ms, own_ms, wait_ms, last_mem, at FROM keeps_last WHERE sha=?`, sha)
        .sort((a, b) => RANK[a.kind] - RANK[b.kind]).map((r) => ({ ...r }));
    },
    /** counts for each kind and state, with no digest: what a member's diagnosis may see */
    summary() {
      const out = {};
      for (const r of h.list()) { const k = out[r.kind] || (out[r.kind] = { owed: 0, final: 0 }); k[r.state]++; }
      return out;
    },
    /** the scheduler consumer `{name, key, due, wake, tick}` (scheduler R8) */
    consumer() {
      return {
        name: PENDING_NAME, key: "pendingwork",
        /* a row found started by an isolate that is gone is reaped at the next alarm, not at its back-off. `wake` is the entry's own due
           instant, never raised to "now": the scheduler holds a consumer whose wake, read after its tick, equals the one read before it and
           is in the past (its R27, against a spin), so a wake clamped to the tick's instant looked unchanged after a pass that went on and
           the entry, due again at once, waited for an arm outside a firing (fix round 5, B38). A pass that went on moves its due instant. */
        due: (at) => { const n = next(); return (n !== null && n <= at) || startedRows().length ? at : null; },
        wake: (at) => { const n = next(); return startedRows().length ? at : n; },
        tick: async (at) => {
          const out = { asked: 0, finished: 0, retried: 0, final: 0, results: [] };
          reapInterrupted();
          const due = live().filter((r) => r.due_at <= at);
          /* the light kinds first, then one heavy row: a read that can starve the object is never followed by another in the same tick */
          const light = due.filter((r) => !HEAVY.includes(r.kind)).slice(0, PENDING_BATCH);
          const heavy = due.filter((r) => HEAVY.includes(r.kind)).slice(0, 1);
          for (const row of [...light, ...heavy]) {
            out.asked++;
            const done = await run(row, at);
            out[done === "finished" ? "finished" : done === "final" ? "final" : "retried"]++;
            out.results.push({ sha: row.sha, kind: row.kind, outcome: done });
          }
          return { pendingwork: out };
        },
      };
    },
  };
  HOLDERS.set(ctx, h);
  return h;
}

/** The store-internal route `pendingadd`: no caller's own, reached by the door with the stamps it sets. And the member's read
 *  `owedwork` (R77): the entries owed on one digest (`sha`), else the counts for each kind; the plane's own arm, declared. An
 *  administrator's answer also carries what the watchdog sees (R80): `last_run`, `alarm_at`, `stale`, `oldest_overdue` and
 *  `watchdog_seen`, from `health` (the scheduler's, read-only: it re-arms nothing). Who asks is the door's `viewer` stamp, judged by
 *  `administers(viewer)` (`administersOf`, below, handed by the composition), never a `cls` the caller wrote: a member's screen never
 *  shows a stall. An administrator whose `health` throws or answers no object is shown the five fields as null and a `watchdog_why`
 *  (K4566): a stall is never hidden by silence. */
const WATCHDOG_FIELDS = Object.freeze(["last_run", "alarm_at", "stale", "oldest_overdue", "watchdog_seen"]);

/** R90 (G58): who is an administrator, by the spellings the door stamps as `viewer`: the machine credential `class:admin`, the founder's
 *  bare `admin` (`member-roster` R73's root spelling, which the door stamps for the founder's session: admission `resolveSession`), and
 *  `member:<id>` naming an active administrator, which `isAdministrator(id)` (membership's) judges. Any other spelling, and no
 *  viewer, is not one. */
export function administersOf(isAdministrator) {
  return (viewer) => {
    if (typeof viewer !== "string") return false;
    if (viewer === "class:admin") return true;
    if (baseViewer(viewer) === ROOT_ADMIN) return true;
    const id = viewerMember(viewer);
    return id !== null && typeof isAdministrator === "function" && isAdministrator(id) === true;
  };
}

const lastOf = (holder, sha) => (typeof holder.ledgerLast === "function" ? holder.ledgerLast({ sha }) : []);
export function pendingOps(holder, url, { health, administers } = {}) {
  const stalled = async (answer) => {
    if (typeof health !== "function" || typeof administers !== "function" || answer.ok !== true) return answer;
    let admin = false;
    try { admin = administers(url.searchParams.get("viewer")) === true; } catch { admin = false; }
    if (!admin) return answer;
    let seen = null, because = null;
    try { seen = await health(); } catch (e) { because = why(e); }
    if (seen && typeof seen === "object") return { ...answer, ...Object.fromEntries(WATCHDOG_FIELDS.map((k) => [k, seen[k] ?? null])) };
    return { ...answer, ...Object.fromEntries(WATCHDOG_FIELDS.map((k) => [k, null])), watchdog_why: because || "WATCHDOG_UNREADABLE" };
  };
  return {
    pendingadd: () => holder.add({ kind: url.searchParams.get("kind"), sha: url.searchParams.get("sha") }),
    owedwork: () => {
      const sha = url.searchParams.get("sha");
      if (sha === null) return stalled({ ok: true, owed: holder.summary() });
      if (DIGEST.test(sha)) return stalled({ ok: true, sha, owed: holder.list({ sha }), last: lastOf(holder, sha) });
      /* a `subresources` or `fetch` row is keyed by its capture session (R77, R81): the key is read when a row of those kinds holds it */
      const owed = holder.list({ sha }).filter((e) => SESSION_KEYED.includes(e.kind));
      return owed.length ? stalled({ ok: true, sha, owed, last: lastOf(holder, sha) }) : { ok: false, reason: "BAD_SHA" };
    },
  };
}
