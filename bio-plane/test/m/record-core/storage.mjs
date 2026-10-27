/* A Durable Object storage stand-in for record-core's tests, at the plane's shape: `sql.exec(query, ...bindings)`
   answers a CURSOR, as workerd's does, never an array (rows are read by iterating it, or its `toArray()`/`one()`;
   `[0]` or `.length` of it is undefined), and refuses a LIKE or GLOB pattern over workerd's 50 bytes, which
   node:sqlite does not (K313, K316); `transactionSync(fn)` rolls back everything `fn` wrote when it throws and nests
   as savepoints. Over node:sqlite (SQLite, the engine a Durable Object runs). The plane's Miniflare suites
   (`test/stats-disclosure.test.mjs`, `test/members.test.mjs`) exercise the same module inside a real Durable Object. */
import { DatabaseSync } from "node:sqlite";
import { RECORD_SCHEMA } from "../../../src/record-core/index.mjs";

export const WORKERD_PATTERN_CAP = 50;
const bind = (v) => (v === undefined ? null : v);

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() {
      const rest = c.toArray();
      if (rest.length !== 1) throw new Error(`Expected exactly one result from SQL query, but got ${rest.length}`);
      return rest[0];
    },
  };
  return c;
}

/* The patterns a statement would hand SQLite's LIKE or GLOB: its quoted literals, and, when it binds one, every
   string it binds (a superset, so a long bound pattern is never missed). */
export function patternsOf(q, args) {
  const literal = [...q.matchAll(/\b(?:GLOB|LIKE)\s+'((?:[^']|'')*)'/gi)].map((m) => m[1].replace(/''/g, "'"));
  const bound = /\b(?:GLOB|LIKE)\s+\?|\b(?:glob|like)\s*\(/i.test(q) ? args.filter((a) => typeof a === "string") : [];
  return [...literal, ...bound];
}

export function storage({ schema = true, file = ":memory:", db: over = null } = {}) {
  const db = over ?? new DatabaseSync(file);
  let n = 0;
  const sql = {
    exec(q, ...args) {
      if (patternsOf(q, args).some((p) => Buffer.byteLength(p) > WORKERD_PATTERN_CAP))
        throw new Error("LIKE or GLOB pattern too complex");
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
  };
  const s = {
    sql, db,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
  if (schema) {
    const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  }
  return s;
}

/* An evidence bucket stand-in: the calls it received, and the objects it holds. */
export function bucket() {
  const held = new Map(), calls = [];
  return {
    calls, held,
    async head(k) { calls.push(["head", k]); return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async get(k) { calls.push(["get", k]); return held.has(k) ? { key: k, bytes: held.get(k) } : null; },
    async put(k, bytes, opts) { calls.push(["put", k, opts]); held.set(k, bytes); return { key: k }; },
  };
}

/* An evidence bucket stand-in with R2's multipart upload (`createMultipartUpload(key)` → `{uploadPart, complete, abort}`),
   recording what R87 needs measured: the parts it handed out by `get` and not yet taken by an `uploadPart` (`peak` is the
   most it ever had out at once), the uploads begun, completed and aborted, and the objects it holds. An object's `get`
   answers as R2's does, with `arrayBuffer()`. A part that is not the last must be `minPart` bytes at least, as R2's. */
export function multipartBucket({ minPart = 0, failComplete = null } = {}) {
  const base = bucket();
  const state = { out: 0, peak: 0, begun: 0, completed: 0, aborted: 0, uploaded: [] };
  return Object.assign(base, {
    state,
    async get(k, opts) {
      base.calls.push(opts && opts.range ? ["get", k, opts] : ["get", k]);
      if (!base.held.has(k)) return null;
      const whole = base.held.get(k);
      /* R2's `range` (K4855): `{offset, length}` or `{suffix}`; `size` stays the object's, the body is the range's */
      let bytes = whole, range;
      const r = opts && opts.range;
      if (r) {
        const offset = r.suffix != null ? Math.max(0, whole.length - r.suffix) : Math.min(r.offset ?? 0, whole.length);
        const end = r.suffix != null ? whole.length : Math.min(whole.length, r.length != null ? offset + r.length : whole.length);
        bytes = whole.subarray(offset, end); range = { offset, length: end - offset };
      }
      state.out += 1; state.peak = Math.max(state.peak, state.out);
      return { key: k, size: whole.length, ...(range ? { range } : {}), async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); } };
    },
    async createMultipartUpload(k) {
      base.calls.push(["createMultipartUpload", k]); state.begun += 1;
      const parts = new Map(); let done = false;
      return {
        async uploadPart(n, bytes) {
          if (done) throw new Error("upload is over");
          state.out = Math.max(0, state.out - 1);
          parts.set(n, new Uint8Array(bytes)); state.uploaded.push([k, n, bytes.length]);
          return { partNumber: n, etag: `e${n}` };
        },
        async complete(list) {
          if (done) throw new Error("upload is over");
          if (failComplete) { done = true; throw new Error(failComplete); }
          const ordered = list.map((p) => parts.get(p.partNumber));
          if (ordered.some((b, i) => !b || (i < ordered.length - 1 && b.length < minPart))) { done = true; throw new Error("a part is below the minimum part size"); }
          const whole = new Uint8Array(ordered.reduce((n, b) => n + b.length, 0)); let at = 0;
          for (const b of ordered) { whole.set(b, at); at += b.length; }
          done = true; base.held.set(k, whole); state.completed += 1; base.calls.push(["complete", k]);
          return { key: k, size: whole.length };
        },
        async abort() { done = true; state.aborted += 1; base.calls.push(["abort", k]); },
      };
    },
  });
}
