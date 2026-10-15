/* admission's store side: R21's window, counted per source in the store (K2038). Cloudflare's rate-limiting binding
   allows periods of 10 or 60 seconds only, so "300 in any 10 minutes" is counted here, in one table this module
   declares through record-core (its R21), and reached by one store-internal route, `doorwindow` (op-declarations R6:
   no spec, no caller), which `plane` composes into the store's route map as it does every module's map.

   WHAT IS KEPT. A row holds a source's keyed fingerprint, a bucket (the window's number) and a count, nothing else; a
   source's rows are dropped once both of its buckets have passed. The fingerprint is `doorbell` R12's, made by the
   doorbell's own `sourceFingerprint` under the same key (the `KNOCK_FINGERPRINT_KEY` binding, else the instance's key
   in doorbell's `knock_key`), so the connecting address the Worker hands in the request's body is digested here and
   never kept, logged or answered. A request that states no address counts under one shared source of its own.
   T43 (T43-21; K2708, K2719): reached through `doorbellOf(ctx)`, no longer through capture's held copy, which T44
   deletes (N870); this module imports nothing of `capture`. */
import { recordOf } from "../record-core/index.mjs";
import { doorbellOf } from "../doorbell/index.mjs";
import { DOOR_WINDOW, DOOR_WINDOW_STATED, SESSION_WINDOW, SESSION_WINDOW_STATED, UNSTATED_SOURCE, doorWindowEstimate,
         doorRetryAfter } from "./index.mjs";

export { UNSTATED_SOURCE };
export const DOOR_WINDOW_TABLE = "admission_door_window";
export const SESSION_WINDOW_TABLE = "admission_session_window";

const SCHEMA = `CREATE TABLE IF NOT EXISTS ${DOOR_WINDOW_TABLE} (
  source TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (source, bucket)
)`;
/* R27 (T49): a signed-in session's own window, kept as the SHA-256 digest of its token (never the token), the bucket and
   the count, nothing else; dropped once both buckets have passed. */
const SESSION_SCHEMA = `CREATE TABLE IF NOT EXISTS ${SESSION_WINDOW_TABLE} (
  session TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (session, bucket)
)`;
const SESSION_DIGEST = /^[0-9a-f]{64}$/;

/* record-core R21's classes: counts, cleared by no purge (a purge must not reopen a window), exported never, seen by
   no member, stored. */
export const ADMISSION_TABLES = Object.freeze([DOOR_WINDOW_TABLE, SESSION_WINDOW_TABLE].map((name) => Object.freeze({
  name, purge: "exempt", expunge: "none", export: "never", sight: "group", derive: "stored", version_chain: false })));

const instances = new WeakMap();

class DoorWindow {
  constructor({ storage, fingerprint }) {
    this.storage = storage;
    this.sql = storage.sql;
    this.fingerprint = fingerprint;
  }

  migrate() { this.sql.exec(SCHEMA); this.sql.exec(SESSION_SCHEMA); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #tx(fn) { return typeof this.storage.transactionSync === "function" ? this.storage.transactionSync(fn) : fn(); }

  /* R21, R27: one request to a public op, asked of a window at `now`: refused at an estimate of `limit` or more
     (counting nothing), else counted. `{ source, refused: false }` or `{ source, refused: true, stated, retryAfter }`;
     `source` is the fingerprint, for the stamps control-plane passes on (credentials R38's `source`).
     T38 (N792; K2247): `count: false` asks the fingerprint alone, for `sourceOf` when the Worker holds no key: `{ source }`,
     and the window is neither read, counted, refused nor written (no row, no dropped bucket). Only exactly `false` asks
     so; any other value counts, as every request to a public op does.
     T49 (R27): `session`, the SHA-256 digest (64 hex) of a live session's token that the Worker presents for a public
     read, counts the request in that session's window (`SESSION_WINDOW`) and not in the source's, which is neither
     read nor written; the answer then carries `window: "session"`. Any other value of `session` is no digest and is
     ignored: the request is counted by source. */
  async doorWindow({ address = null, now = null, count = true, session = null } = {}) {
    const stated = typeof address === "string" && address.trim() !== "";
    const source = stated ? String(await this.fingerprint(address.trim())) : UNSTATED_SOURCE;
    if (count === false) return { source };
    const nowMs = now !== null && now !== "" && Number.isFinite(Number(now)) ? Number(now) : Date.now();
    if (typeof session === "string" && SESSION_DIGEST.test(session))
      return { ...this.#counted(SESSION_WINDOW_TABLE, "session", session, SESSION_WINDOW, SESSION_WINDOW_STATED, source, nowMs),
               window: "session" };
    return this.#counted(DOOR_WINDOW_TABLE, "source", source, DOOR_WINDOW, DOOR_WINDOW_STATED, source, nowMs);
  }

  /* One window's count (R21's, R27's), the same two-bucket estimate over `table`'s `column` = `key`. */
  #counted(table, column, key, { limit, windowMs }, stated, source, nowMs) {
    const bucket = Math.floor(nowMs / windowMs);
    const elapsedFrac = (nowMs - bucket * windowMs) / windowMs;
    return this.#tx(() => {
      const held = new Map(this.#rows(`SELECT bucket, count FROM ${table} WHERE ${column} = ? AND bucket IN (?, ?)`,
        key, bucket, bucket - 1).map((r) => [Number(r.bucket), Number(r.count)]));
      const prev = held.get(bucket - 1) ?? 0, cur = held.get(bucket) ?? 0;
      /* the passed buckets go, every key's, so no count outlives both of its buckets */
      this.sql.exec(`DELETE FROM ${table} WHERE bucket < ?`, bucket - 1);
      if (doorWindowEstimate({ prev, cur, elapsedFrac }) >= limit)
        return { source, refused: true, stated, retryAfter: doorRetryAfter({ prev, cur, elapsedFrac, limit, windowMs }) };
      this.sql.exec(`INSERT INTO ${table} (${column}, bucket, count) VALUES (?, ?, 1)
                     ON CONFLICT(${column}, bucket) DO UPDATE SET count = count + 1`, key, bucket);
      return { source, refused: false };
    });
  }
}

/** The one instance for a Durable Object's storage: it migrates its table and declares it (record-core R21). `deps`
 *  may name the record-core instance, and `fingerprint(address)` in place of the doorbell's (its R12) for a host with
 *  none. The doorbell's instance for the storage is reached at the first fingerprint asked, not at creation. */
export function admissionOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let a = instances.get(storage);
  if (!a) {
    const record = deps.record || recordOf(ctx);
    const fingerprint = typeof deps.fingerprint === "function" ? deps.fingerprint
      : (address) => doorbellOf(ctx).sourceFingerprint(address);
    a = new DoorWindow({ storage, fingerprint });
    a.migrate();
    const d = record.declareTable("admission", ADMISSION_TABLES.map((t) => ({ ...t })));
    if (d && d.ok === false && d.reason !== "TABLE_DECLARED")
      throw new Error(`admission: record-core refused its table: ${d.reason}`);
    instances.set(storage, a);
  }
  return a;
}

/* The ops this module answers, as entries of the plane's one route map (plane R5). `doorwindow` is store-internal
   (op-declarations R6): the Worker's own count of a request to a public op, the address in the body, never the query;
   with the body's `count: false` (T38; R21), the fingerprint alone, nothing counted or written; with a `session` digest
   (T49; R27), the session's own window. */
export function admissionOps(a, url, body) {
  const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  return {
    doorwindow: () => a.doorWindow({ address: typeof b.address === "string" ? b.address : null, now: b.now ?? null,
                                     count: b.count !== false, session: typeof b.session === "string" ? b.session : null }),
  };
}
