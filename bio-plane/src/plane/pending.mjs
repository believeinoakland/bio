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
     `unpack`        an archive stopped by a budget (acquisition R100), run as the unpack drain does, `op=unpack` as the daemon.
   An entry ends only when its work is done, or when its owner answers a FINAL reason (`final: true`, with its `why`), which the
   row then keeps, stated, for the document's page (op `owedwork`); never by a count or a clock. A failure, `NO_HOME` among them,
   leaves the entry for a later alarm, backed off from `PENDING_RETRY_MS` doubling to at most `PENDING_RETRY_MAX_MS` and going on
   at that rate. A second registration of the same entry re-arms it (no attempts, due now), a final one too.

   Lower modules cannot import this one (it is last in the order), so they are handed the registration at composition, as they
   are handed `cap.waitUntil`: `captureOf(ctx).keepLater({sha, parts})` and `.owedLater({kind, sha, session?, parts?, detail?})`, async, writing
   the entry and arming the alarm in one step and never throwing. The door's deferred reading arrives by the store-internal
   route `pendingadd`. An owner answers one of: `{ok: true, read: true}` or `{ok: true, done: true}` (ended), `{ok: true, more:
   true, detail}` or `{ok: true, owed: true}` (a stage ended, the rest follows at once), `{final: true, why}` (ended, stated),
   anything else (tried again). */
import { recordOf } from "../record-core/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { acquisitionOf, owedRun } from "../acquisition/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { schedulerOf } from "../scheduler/index.mjs";

export const KEEPS_PENDING_DDL = `CREATE TABLE IF NOT EXISTS keeps_pending (
  sha TEXT NOT NULL, kind TEXT NOT NULL, parts TEXT NOT NULL DEFAULT '[]', detail TEXT NOT NULL DEFAULT '{}',
  attempts INTEGER NOT NULL DEFAULT 0, registered_at INTEGER NOT NULL, due_at INTEGER NOT NULL, last_try INTEGER, last_why TEXT,
  final_why TEXT, PRIMARY KEY (sha, kind))`;
export const PENDING_NAME = "pending-work";
export const PENDING_KINDS = Object.freeze(["keep", "reading", "ocr", "subresources", "unpack"]);
export const PENDING_RETRY_MS = 15_000;
export const PENDING_RETRY_MAX_MS = 3_600_000;
export const PENDING_BATCH = 3;

const DIGEST = /^[0-9a-f]{64}$/;
const HOLDERS = new WeakMap();
const why = (e) => String(e && e.message || e).slice(0, 160);
const RANK = { keep: 0, reading: 1, ocr: 2, subresources: 3, unpack: 4 };
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
  const attempt = (row, at, because) => {
    const n = row.attempts + 1;
    sql.exec(`UPDATE keeps_pending SET attempts=?, last_try=?, due_at=?, last_why=? WHERE sha=? AND kind=?`, n, at, at + backoff(n), because, row.sha, row.kind);
    return "retried";
  };
  const end = (row) => { sql.exec(`DELETE FROM keeps_pending WHERE sha=? AND kind=?`, row.sha, row.kind); return "finished"; };
  const stop = (row, at, because) => {
    sql.exec(`UPDATE keeps_pending SET final_why=?, last_try=?, last_why=? WHERE sha=? AND kind=?`, because, at, because, row.sha, row.kind);
    return "final";
  };
  const live = () => all(`SELECT * FROM keeps_pending WHERE final_why IS NULL`)
    .sort((a, b) => a.due_at - b.due_at || a.registered_at - b.registered_at || RANK[a.kind] - RANK[b.kind] || (a.sha < b.sha ? -1 : 1));
  const next = () => { const r = live()[0]; return r ? r.due_at : null; };

  /* what an owner answered, read: the entry's outcome */
  const settle = (row, at, r) => {
    if (r && (r.final === true || r.failure === "final")) return stop(row, at, String(r.why || r.reason || r.code || "FINAL").slice(0, 160));
    if (r && r.ok === true && r.more === true) {
      sql.exec(`UPDATE keeps_pending SET detail=?, attempts=0, due_at=?, last_try=?, last_why=NULL WHERE sha=? AND kind=?`,
               JSON.stringify(r.detail && typeof r.detail === "object" ? r.detail : json(row.detail, {})), at, at, row.sha, row.kind);
      return "retried";
    }
    if (r && r.ok === true && r.owed === true) {
      /* work remains for the digest (extraction R82). An `ocr` pass that read pages goes on at once; a pass that read none (the member
         down) and a reading whose own failure was transient wait their back-off. A reading that left pages of a scan unread owes an `ocr`
         entry besides, and keeps its own until the next call finds the reading held. */
      if (row.kind === "ocr" && r.read === true) {
        sql.exec(`UPDATE keeps_pending SET attempts=0, due_at=?, last_try=?, last_why=NULL WHERE sha=? AND kind=?`, at, at, row.sha, row.kind);
        return "retried";
      }
      if (row.kind !== "ocr" && r.read === true) put(row.sha, "ocr", [], {});
      return attempt(row, at, String(r.why || "OWED"));
    }
    if (r && r.ok === true && (r.read === true || r.done === true || r.why === "READING_HELD")) return end(row);
    return attempt(row, at, String(r && (r.why || r.code || r.reason) || "NOT_DONE"));
  };
  const call = async (fn) => { try { return await fn(); } catch (e) { return { ok: false, reason: why(e) }; } };

  const readNow = (row, at) => call(() => extractionOf(ctx).readHeld({ sha: row.sha, kind: row.kind, storeName: store(), env }))
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
      const reading = all(`SELECT * FROM keeps_pending WHERE sha=? AND kind='reading'`, row.sha)[0];
      return await readNow(reading, at);
    },
    subresources: async (row, at) => {
      const acq = acquisitionOf(ctx);
      const run = acq && typeof acq.owedRun === "function" ? acq.owedRun.bind(acq) : owedRun;   /* acquisition's export; an instance's own is a test's */
      /* a rendered document is promoted beside its shell by the door's own function (control-plane, B29); without it a pending render stays the member's "Finish it" */
      /* a rendered document is promoted beside its shell by the door's own function (control-plane, B29), handed in by the composition; without it a pending render stays the member's "Finish it" */
      const deliver = typeof deps.deliver === "function" ? (a) => deps.deliver({ ctx, env, storeName: store(), ...a }) : undefined;
      const r = await call(() => run(captureOf(ctx), { kind: "subresources", session: row.sha }, { storeName: store(), env, ...(deliver ? { deliver } : {}) }));
      if (r && r.final === true && r.reason) return stop(row, at, String(r.reason).slice(0, 160));
      if (r && r.ok === true && r.done === true) return end(row);
      return attempt(row, at, String(r && (r.reason || r.code || r.why) || (r && r.outstanding ? "OUTSTANDING" : "NOT_DONE")));
    },
    /* the archive-unpack drain's call (plane/unpack.mjs): `op=unpack` as the daemon, through the door */
    unpack: async (row, at) => {
      if (!(env && env.SELF && typeof env.SELF.fetch === "function" && typeof env.DAEMON_TOKEN === "string" && env.DAEMON_TOKEN !== ""))
        return attempt(row, at, "NOT_CONFIGURED");
      let status = 0, body = null;
      try {
        const res = await env.SELF.fetch(new Request("https://self/api/?op=unpack", { method: "POST",
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
  const run = async (row, at) => {
    const w = deps.workers && deps.workers[row.kind];
    if (typeof w === "function") return settle(row, at, await call(() => w({ ...row, parts: json(row.parts, []), detail: json(row.detail, {}) }, { at })));
    return await owner[row.kind](row, at);
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
    },
    /** R77: owed work, whatever its kind. `parts` (a keep) and `detail` (a cursor, a session's key) are the owner's. */
    async owe({ kind, sha, session, parts, detail } = {}) {
      /* the ledger's key is the digest, but a web capture's outstanding files are owed by its SESSION (acquisition R100) */
      const key = kind === "subresources" ? session : sha;
      if (!PENDING_KINDS.includes(kind)) return { ok: false, reason: "PENDING_MALFORMED" };
      if (kind === "subresources" ? (typeof key !== "string" || key === "" || key.length > 200) : (typeof key !== "string" || !DIGEST.test(key)))
        return { ok: false, reason: "PENDING_MALFORMED" };
      if (kind === "subresources" && sha !== undefined) detail = { ...(detail || {}), sha };
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
                       next_try: r.final_why === null ? r.due_at : null, last_try: r.last_try, why: r.final_why ?? r.last_why, detail: json(r.detail, {}) }));
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
        due: (at) => { const n = next(); return n !== null && n <= at ? at : null; },
        wake: (at) => { const n = next(); return n === null ? null : Math.max(n, at); },
        tick: async (at) => {
          const out = { asked: 0, finished: 0, retried: 0, final: 0, results: [] };
          for (const row of live().filter((r) => r.due_at <= at).slice(0, PENDING_BATCH)) {
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
 *  `owedwork` (R77): the entries owed on one digest (`sha`), else the counts for each kind; the plane's own arm, declared. */
export function pendingOps(holder, url) {
  return {
    pendingadd: () => holder.add({ kind: url.searchParams.get("kind"), sha: url.searchParams.get("sha") }),
    owedwork: () => {
      const sha = url.searchParams.get("sha");
      if (sha === null) return { ok: true, owed: holder.summary() };
      if (!DIGEST.test(sha)) return { ok: false, reason: "BAD_SHA" };
      return { ok: true, sha, owed: holder.list({ sha }) };
    },
  };
}
