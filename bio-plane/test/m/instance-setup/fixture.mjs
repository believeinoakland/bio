/* instance-setup over a Durable Object storage at the plane's shape (K316): `sql.exec` answers a CURSOR, as workerd's
   does, never an array, and refuses a LIKE or GLOB pattern over workerd's 50 bytes (K313), which node:sqlite does not.
   The module runs over the REAL record-core (its schema, settings, purge declarations and first-boot witness); the
   other providers it uses are stand-ins recording what they are asked, so each test drives the module at its
   interface. */
import { DatabaseSync } from "node:sqlite";
import { RECORD_SCHEMA, recordOf } from "../../../src/record-core/index.mjs";
import { InstanceSetup, instanceSetupOps, instanceSetupRoute } from "../../../src/setup.mjs";

export const WORKERD_PATTERN_CAP = 50;
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const rest = c.toArray(); if (rest.length !== 1) throw new Error(`expected one row, got ${rest.length}`); return rest[0]; },
  };
  return c;
}

function patternsOf(q, args) {
  const literal = [...q.matchAll(/\b(?:GLOB|LIKE)\s+'((?:[^']|'')*)'/gi)].map((m) => m[1].replace(/''/g, "'"));
  const bound = /\b(?:GLOB|LIKE)\s+\?|\b(?:glob|like)\s*\(/i.test(q) ? args.filter((a) => typeof a === "string") : [];
  return [...literal, ...bound];
}

/** One Durable Object storage. `failWrites(pred)` makes a matching write throw, as a store that does not answer. */
export function storage(db = new DatabaseSync(":memory:")) {
  let n = 0;
  let failing = null;
  const statements = [];
  const sql = {
    exec(q, ...args) {
      statements.push(q);
      if (patternsOf(q, args).some((p) => Buffer.byteLength(p) > WORKERD_PATTERN_CAP)) throw new Error("LIKE or GLOB pattern too complex");
      if (failing && failing(q, args)) throw new Error("the store did not answer this write");
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
  };
  return {
    sql, db, statements,
    failWrites(pred) { failing = pred; },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const applyRecordSchema = (st) => {
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
};

/* The providers this module uses, as stand-ins that record what they were asked. */
export function providers({ admins = ["admin", "member:ada"] } = {}) {
  const facts = new Map();
  const consumers = [];
  const listeners = [];
  const arms = [];
  const governed = [];
  const fetched = [];
  const p = {
    facts, consumers, listeners, arms, governed, fetched,
    admins: new Set(admins),
    membership: { isAdministrator: (id) => p.admins.has(id) },
    promotion: {
      registerFact(name, module, fn) {
        if (facts.has(name)) return { ok: false, reason: "STEP_DECLARED", fact: name };
        facts.set(name, { module, fn }); return { ok: true, fact: name, module };
      },
      fact(name) { const f = facts.get(name); return f ? { ok: true, fact: name, value: f.fn() } : { ok: false, reason: "FACT_UNAVAILABLE" }; },
    },
    scheduler: {
      register(module, c) { consumers.push({ module, ...c }); return { ok: true, module, name: c.name, key: c.key }; },
      async arm() { arms.push(Date.now()); return null; },
    },
    capture: { on(event, module, fn) { listeners.push({ event, module, fn }); return { ok: true, event, module }; } },
    governorHold: null,
    governor: {
      governorAdmit({ host }) { governed.push(["admit", host]); return p.governorHold ? { admitted: false, reason: p.governorHold } : { admitted: true, wait_ms: 0 }; },
      governorReport({ host, status }) { governed.push(["report", host, status]); return { recorded: true }; },
    },
    /* The domain's answer: a function of the URL, or a thrown error. */
    answer: () => new Response("", { status: 404 }),
    fetch: async (url, init) => { fetched.push({ url: String(url), init }); return p.answer(String(url), init); },
  };
  return p;
}

/**
 * Boot the module on a storage, as the plane does: record-core is made (and witnesses the first boot) before the
 * record's schema pass, then the module starts. `st` given boots the SAME database again, as a new Durable Object
 * instance over it (a later boot).
 */
export async function boot({ st = null, env = {}, prov = null, now = null } = {}) {
  const store = st ? storage(st.db) : storage();
  const ctx = { storage: store };
  const record = recordOf(ctx);                 // the first-boot witness, before any table is made
  applyRecordSchema(store);                     // the record's schema pass (CREATE IF NOT EXISTS)
  const p = prov || providers();
  const deps = { record, membership: p.membership, promotion: p.promotion, scheduler: p.scheduler, capture: p.capture,
                 governor: p.governor, fetch: p.fetch, sleep: async () => {}, ...(now ? { now } : {}) };
  const m = new InstanceSetup(ctx, env, deps);
  const started = await m.start();
  return { m, st: store, ctx, record, prov: p, started, env };
}

/* The Durable Object's door for this module, and a `doAnswer` as the control plane's reads it. */
export const doAnswer = async (res) => {
  let out = null;
  try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined };
};
export const io = {
  json: (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } }),
  storeSilent: (op) => new Response(JSON.stringify({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }), { status: 502 }),
  doAnswer,
};

/** A stub whose fetch reaches this module's routes, with `extra` answering any other path (`bootstrap`, `stats`, …). */
export function stubOver(m, extra = {}, { silent = [] } = {}) {
  return {
    async fetch(input, init) {
      const req = input instanceof Request ? input : new Request(input, init);
      const path = new URL(req.url).pathname.slice(1);
      if (silent.includes(path)) return new Response("boom", { status: 500 });
      const mine = await instanceSetupRoute(m, req);
      if (mine) return mine;
      if (extra[path]) return Response.json({ ok: true, result: await extra[path](req) });
      return Response.json({ ok: false, error: "unknown op: " + path }, { status: 400 });
    },
  };
}
export const envOver = (stub, more = {}) => ({ STORE: { idFromName: (n) => n, get: () => stub }, ...more });

export { instanceSetupOps };

/* A small test counter in the style every module suite uses: the title names the requirement. */
export const read = async (res) => ({ status: res.status, body: await res.json() });
