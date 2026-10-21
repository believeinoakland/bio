/* plane R75 (T51 fix round 4; C5c; K4429; amends R4; acquisition R96, extraction R80, control-plane R120): WHAT A REQUEST LEFT
   PENDING, FINISHED BY THE OBJECT'S OWN ALARM. A request is answered inside the door's bound and the Durable Object keeps
   no promise alive after it, so a keep that will not end inside the bound (a capture of several parts made whole by the
   store's multipart upload, acquisition R96) and a reading the door deferred (control-plane R120) are written down here, in
   the object's storage, and finished by one `scheduler` consumer, `pending-work`.

   Acquisition cannot import this module (it is earlier in the order), so it is handed the registration, as it is handed
   `cap.waitUntil`: `captureOf(ctx).keepLater({sha, parts})`, an async call that writes the entry and arms the alarm in one
   step and never throws. The door's deferred reading arrives by the store-internal route `pendingadd`.

   An entry is `keep` (the whole is not yet put; `parts` are the part digests, in order) or `reading` (the whole is held, its
   reading is owed). A keep is put by `evidenceStore().putFromParts` (record-core R87), then read by `extraction.readHeld`
   (its R80), in the same tick; a digest with no home yet (nothing promoted it) ends there, since the door reads it at the
   promotion (control-plane R117), and one already read ends. A failure leaves the entry for the next alarm, `PENDING_RETRY_MS`
   doubled for each attempt, up to `PENDING_ATTEMPTS_MAX`; past it the entry stays, named, and is not tried again. An entry is
   removed only when its work has ended. */
import { recordOf } from "../record-core/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { schedulerOf } from "../scheduler/index.mjs";

export const KEEPS_PENDING_DDL = `CREATE TABLE IF NOT EXISTS keeps_pending (
  sha TEXT PRIMARY KEY, kind TEXT NOT NULL, parts TEXT NOT NULL DEFAULT '[]', attempts INTEGER NOT NULL DEFAULT 0,
  registered_at INTEGER NOT NULL, due_at INTEGER NOT NULL, last_try INTEGER, last_why TEXT)`;
export const PENDING_NAME = "pending-work";
export const PENDING_ATTEMPTS_MAX = 5;
export const PENDING_RETRY_MS = 15_000;
export const PENDING_BATCH = 3;

const DIGEST = /^[0-9a-f]{64}$/;
const HOLDERS = new WeakMap();
const why = (e) => String(e && e.message || e).slice(0, 160);

/** The pending-work holder of a host (one per storage): `{migrate, keepLater, add, list, consumer}`. `deps`: `env`, `store` (a
 *  function answering the object's namespace) and `now` (the clock; a test's own). */
export function pendingOf(ctx, deps = {}) {
  let h = HOLDERS.get(ctx);
  if (h) return h;
  const sql = ctx.storage.sql;
  const env = deps.env ?? null;
  const store = typeof deps.store === "function" ? deps.store : () => "bio";
  const now = typeof deps.now === "function" ? deps.now : () => Date.now();
  const all = (q, ...a) => [...sql.exec(q, ...a)];
  const backoff = (attempts) => PENDING_RETRY_MS * 2 ** Math.max(0, attempts - 1);
  const arm = async () => { try { await schedulerOf(ctx, env).arm(now()); } catch { /* the stored entry re-derives it at the next start */ } };

  /* register (or upgrade) an entry; a keep outranks a reading of the same digest, and a second registration changes nothing */
  const put = (sha, kind, parts) => {
    const have = all(`SELECT kind FROM keeps_pending WHERE sha=?`, sha)[0];
    const at = now();
    if (!have) sql.exec(`INSERT INTO keeps_pending (sha, kind, parts, attempts, registered_at, due_at) VALUES (?,?,?,?,?,?)`,
                        sha, kind, JSON.stringify(parts), 0, at, at);
    else if (have.kind === "reading" && kind === "keep")
      sql.exec(`UPDATE keeps_pending SET kind='keep', parts=?, attempts=0, due_at=? WHERE sha=?`, JSON.stringify(parts), at, sha);
  };
  const attempt = (row, at, because) => {
    const n = row.attempts + 1;
    sql.exec(`UPDATE keeps_pending SET attempts=?, last_try=?, due_at=?, last_why=? WHERE sha=?`, n, at, at + backoff(n), because, row.sha);
  };
  const live = () => all(`SELECT * FROM keeps_pending WHERE attempts < ? ORDER BY due_at, registered_at, sha`, PENDING_ATTEMPTS_MAX);
  const next = () => { const r = live()[0]; return r ? r.due_at : null; };

  /* the keep, then the reading it owes: answers whether the entry has ended */
  const keep = async (row, at) => {
    const ev = recordOf(ctx).evidenceStore();
    if (!ev || typeof ev.putFromParts !== "function") { attempt(row, at, "NO_MULTIPART_STORE"); return "retried"; }
    let r = null;
    try { r = await ev.putFromParts(row.sha, JSON.parse(row.parts)); } catch (e) { r = { ok: false, reason: why(e) }; }
    if (!r || r.ok !== true) { attempt(row, at, String(r && (r.code || r.reason) || "REFUSED")); return "retried"; }
    return await read({ ...row, kind: "reading" }, at, true);
  };
  const read = async (row, at, afterKeep = false) => {
    let r = null;
    try { r = await extractionOf(ctx).readHeld({ sha: row.sha, storeName: store(), env }); } catch (e) { r = { ok: false, reason: why(e) }; }
    const ended = r && r.ok === true && (r.read === true || r.why === "READING_HELD" || (afterKeep && r.why === "NO_HOME"));
    if (ended) { sql.exec(`DELETE FROM keeps_pending WHERE sha=?`, row.sha); return "finished"; }
    /* a keep that is made but not yet read stays as a reading, owed once */
    if (afterKeep) sql.exec(`UPDATE keeps_pending SET kind='reading', parts='[]', attempts=0 WHERE sha=?`, row.sha);
    attempt({ ...row, attempts: afterKeep ? 0 : row.attempts }, at, String(r && (r.why || r.code || r.reason) || "NOT_READ"));
    return "retried";
  };

  h = {
    migrate() { sql.exec(KEEPS_PENDING_DDL); },
    /** acquisition R96: a keep that will not end inside the bound. `parts` are the part digests in order. */
    async keepLater({ sha, parts } = {}) {
      if (typeof sha !== "string" || !DIGEST.test(sha) || !Array.isArray(parts) || parts.length === 0 || !parts.every((p) => typeof p === "string" && DIGEST.test(p)))
        return { ok: false, reason: "PENDING_MALFORMED" };
      try { put(sha, "keep", parts); } catch (e) { return { ok: false, reason: "PENDING_NOT_KEPT", detail: why(e) }; }
      await arm();
      return { ok: true };
    },
    /** control-plane R120: a reading the door deferred. */
    async add({ kind, sha } = {}) {
      if (kind !== "reading" || typeof sha !== "string" || !DIGEST.test(sha)) return { ok: false, reason: "PENDING_MALFORMED" };
      try { put(sha, "reading", []); } catch (e) { return { ok: false, reason: "PENDING_NOT_KEPT", detail: why(e) }; }
      await arm();
      return { ok: true };
    },
    list() { return all(`SELECT sha, kind, attempts, registered_at, due_at, last_try, last_why FROM keeps_pending ORDER BY registered_at, sha`); },
    /** the scheduler consumer `{name, key, due, wake, tick}` (scheduler R8) */
    consumer() {
      return {
        name: PENDING_NAME, key: "pendingwork",
        due: (at) => { const n = next(); return n !== null && n <= at ? at : null; },
        wake: (at) => { const n = next(); return n === null ? null : Math.max(n, at); },
        tick: async (at) => {
          const out = { asked: 0, finished: 0, retried: 0, results: [] };
          for (const row of live().filter((r) => r.due_at <= at).slice(0, PENDING_BATCH)) {
            out.asked++;
            const done = row.kind === "keep" ? await keep(row, at) : await read(row, at);
            out[done === "finished" ? "finished" : "retried"]++;
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

/** The store-internal route `pendingadd`: no caller's own, reached by the door with the stamps it sets. */
export function pendingOps(holder, url) {
  return { pendingadd: () => holder.add({ kind: url.searchParams.get("kind"), sha: url.searchParams.get("sha") }) };
}
