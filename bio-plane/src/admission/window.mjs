/* admission's store side: R21's window, counted per source in the store (K2038). Cloudflare's rate-limiting binding
   allows periods of 10 or 60 seconds only, so "300 in any 10 minutes" is counted here, in one table this module
   declares through record-core (its R21), and reached by one store-internal route, `doorwindow` (op-declarations R6:
   no spec, no caller), which `plane` composes into the store's route map as it does every module's map.

   WHAT IS KEPT. A row holds a source's keyed fingerprint, a bucket (the window's number) and a count, nothing else; a
   source's rows are dropped once both of its buckets have passed. The fingerprint is `capture` R56's, made by capture's
   own `sourceFingerprint` under the same key (the `KNOCK_FINGERPRINT_KEY` binding, else the instance's key in
   capture's table), so the connecting address the Worker hands in the request's body is digested here and never
   kept, logged or answered. A request that states no address counts under one shared source of its own. */
import { recordOf } from "../record-core/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { DOOR_WINDOW, DOOR_WINDOW_STATED, UNSTATED_SOURCE, doorWindowEstimate, doorRetryAfter } from "./index.mjs";

export { UNSTATED_SOURCE };
export const DOOR_WINDOW_TABLE = "admission_door_window";

const SCHEMA = `CREATE TABLE IF NOT EXISTS ${DOOR_WINDOW_TABLE} (
  source TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (source, bucket)
)`;

/* record-core R21's classes: counts, cleared by no purge (a purge must not reopen a window), exported never, seen by
   no member, stored. */
export const ADMISSION_TABLES = Object.freeze([Object.freeze({
  name: DOOR_WINDOW_TABLE, purge: "exempt", expunge: "none", export: "never", sight: "group", derive: "stored",
  version_chain: false })]);

const instances = new WeakMap();

class DoorWindow {
  constructor({ storage, fingerprint }) {
    this.storage = storage;
    this.sql = storage.sql;
    this.fingerprint = fingerprint;
  }

  migrate() { this.sql.exec(SCHEMA); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #tx(fn) { return typeof this.storage.transactionSync === "function" ? this.storage.transactionSync(fn) : fn(); }

  /* R21: one request to a public op, asked of `address`'s window at `now`: refused at an estimate of `limit` or more
     (counting nothing), else counted. `{ source, refused: false }` or `{ source, refused: true, stated, retryAfter }`;
     `source` is the fingerprint, for the stamps control-plane passes on (credentials R38's `source`).
     T38 (N792; K2247): `count: false` asks the fingerprint alone, for `sourceOf` when the Worker holds no key: `{ source }`,
     and the window is neither read, counted, refused nor written (no row, no dropped bucket). Only exactly `false` asks
     so; any other value counts, as every request to a public op does. */
  async doorWindow({ address = null, now = null, count = true } = {}) {
    const stated = typeof address === "string" && address.trim() !== "";
    const source = stated ? String(await this.fingerprint(address.trim())) : UNSTATED_SOURCE;
    if (count === false) return { source };
    const nowMs = now !== null && now !== "" && Number.isFinite(Number(now)) ? Number(now) : Date.now();
    const { limit, windowMs } = DOOR_WINDOW;
    const bucket = Math.floor(nowMs / windowMs);
    const elapsedFrac = (nowMs - bucket * windowMs) / windowMs;
    return this.#tx(() => {
      const held = new Map(this.#rows(`SELECT bucket, count FROM ${DOOR_WINDOW_TABLE} WHERE source = ? AND bucket IN (?, ?)`,
        source, bucket, bucket - 1).map((r) => [Number(r.bucket), Number(r.count)]));
      const prev = held.get(bucket - 1) ?? 0, cur = held.get(bucket) ?? 0;
      /* the passed buckets go, every source's, so no count outlives both of its buckets */
      this.sql.exec(`DELETE FROM ${DOOR_WINDOW_TABLE} WHERE bucket < ?`, bucket - 1);
      if (doorWindowEstimate({ prev, cur, elapsedFrac }) >= limit)
        return { source, refused: true, stated: DOOR_WINDOW_STATED, retryAfter: doorRetryAfter({ prev, cur, elapsedFrac }) };
      this.sql.exec(`INSERT INTO ${DOOR_WINDOW_TABLE} (source, bucket, count) VALUES (?, ?, 1)
                     ON CONFLICT(source, bucket) DO UPDATE SET count = count + 1`, source, bucket);
      return { source, refused: false };
    });
  }
}

/** The one instance for a Durable Object's storage: it migrates its table and declares it (record-core R21). `deps`
 *  may name the record-core instance, and `fingerprint(address)` in place of capture's (R56) for a host with none. */
export function admissionOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let a = instances.get(storage);
  if (!a) {
    const record = deps.record || recordOf(ctx);
    const fingerprint = typeof deps.fingerprint === "function" ? deps.fingerprint
      : (address) => captureOf(ctx).sourceFingerprint(address);
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
   with the body's `count: false` (T38; R21), the fingerprint alone, nothing counted or written. */
export function admissionOps(a, url, body) {
  const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  return {
    doorwindow: () => a.doorWindow({ address: typeof b.address === "string" ? b.address : null, now: b.now ?? null,
                                     count: b.count !== false }),
  };
}
