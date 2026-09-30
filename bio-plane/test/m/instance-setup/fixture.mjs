/* instance-setup over a Durable Object storage at the plane's shape (K316): `sql.exec` answers a CURSOR, as workerd's
   does, never an array, and refuses a LIKE or GLOB pattern over workerd's 50 bytes (K313), which node:sqlite does not.
   The module runs over the REAL record-core (its schema, settings, purge declarations and first-boot witness); the
   other providers it uses are stand-ins recording what they are asked, so each test drives the module at its
   interface. */
import { DatabaseSync } from "node:sqlite";
import { webcrypto } from "node:crypto";
import { RECORD_SCHEMA, recordOf } from "../../../src/record-core/index.mjs";
import { InstanceSetup, instanceSetupOps } from "../../../src/setup.mjs";

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
  const starts = [];
  const governed = [];
  const fetched = [];
  const p = {
    facts, consumers, listeners, arms, starts, governed, fetched,
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
      async start() { starts.push(consumers.map((c) => c.name)); return null; },
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

/* A `doAnswer` as the control plane's reads it (control-plane R23, R25):
   `ok: true` is an answer; `ok: false` below 500 is the store's own refusal, `refused` with its `reply`; anything else
   is a silence, carrying the correlation id of the store's `STORE_INTERNAL_ERROR` when it gave a well-formed one. */
const CORRELATION_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const doAnswer = async (res) => {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && typeof out.correlation === "string"
    && CORRELATION_RE.test(out.correlation) ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
/* The plane's two answers for a reply that is no answer: `storeSilent` (502, the correlation carried when given, no key
   otherwise) and `storeRefusal` (the store's own envelope at its status). `io` hands both, as control-plane does;
   `ioLegacy` hands no `storeRefusal`, as legacy-index's call sites do today. */
export const io = {
  json,
  storeSilent: (op, correlation = undefined) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op, correlation }, 502),
  storeRefusal: (out, extra = {}) => json({ ...out.reply.body, ...extra }, out.reply.status),
  doAnswer,
};
export const ioLegacy = { json: io.json, storeSilent: io.storeSilent, doAnswer };

/* The frame this module's routes pass on the instance (N348): `control-plane`'s door (its R25, R26, R35), which joins
   `instanceSetupOps` to its one route map. `control-plane` comes after this module in the order, so its tests are the
   ones that drive the real door; this is that door's behaviour as this module's routes meet it: an absent body is
   null, a body that is not JSON is 400 `BAD_JSON` before the route runs, an answer is `{ok: true, result}`, and a route
   that throws is 500 `STORE_INTERNAL_ERROR` with a correlation id and no stack, message or path. `null` for a route
   that is not this module's, so the caller answers it. */
export async function frame(m, req) {
  const url = new URL(req.url);
  const op = url.pathname.slice(1);
  if (!Object.hasOwn(instanceSetupOps(m, url, null), op)) return null;
  let body = null;
  if (req.method === "POST") {
    const raw = await req.text();
    if (raw.trim() !== "") {
      try { body = JSON.parse(raw); }
      catch { return Response.json({ ok: false, reason: "BAD_JSON", detail: "the request body is not valid JSON" }, { status: 400 }); }
    }
  }
  try { return Response.json({ ok: true, result: await instanceSetupOps(m, url, body)[op]() }); }
  catch {
    return Response.json({ ok: false, error: "internal error", reason: "STORE_INTERNAL_ERROR", code: "STORE_INTERNAL_ERROR",
                           correlation: webcrypto.randomUUID() }, { status: 500 });
  }
}

/** A stub whose fetch reaches this module's routes through `frame`, with `extra` answering any other path
 *  (`bootstrap`, `stats`, …). */
export function stubOver(m, extra = {}, { silent = [] } = {}) {
  return {
    async fetch(input, init) {
      const req = input instanceof Request ? input : new Request(input, init);
      const path = new URL(req.url).pathname.slice(1);
      if (silent.includes(path)) return new Response("boom", { status: 500 });
      const mine = await frame(m, req);
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

/**
 * The page's script (the last `<script>` of `html`, the page as served) run over a small document stand-in: every
 * `$(selector)` is one element, kept; `fetch` is the page's own, handed in (a scripted answer, or the real plane's).
 * Answers `ui` (the script's named functions), `el(selector)`, the `sandbox`, `replaced()` (history rewrites) and `picks`
 * (the profile checkboxes the page drew).
 */
export function pageOver({ html, hash = "", session = null, fetch }) {
  const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
  const els = new Map();
  let replaced = 0;
  const mk = (sel) => ({
    sel, listeners: {}, textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {}, checked: false,
    disabled: false, options: [],
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener(t, f) { (this.listeners[t] ||= []).push(f); },
    async fire(t = "click") { for (const f of this.listeners[t] || []) await f(); },
  });
  const el = (sel) => { if (!els.has(sel)) els.set(sel, mk(sel)); return els.get(sel); };
  el("#n-type").options = ["information", "inquiry", "project", "action"].map((value) => ({ value, hidden: false }));
  el("#n-type").value = "information";
  const picks = new Map();
  const document = {
    querySelector(s) {
      if (s === "input[name=n-risk]:checked") return [...els.values()].find((e) => /^#n-risk-/.test(e.sel) && e.checked) || null;
      return el(s);
    },
    querySelectorAll(s) {
      if (s === "#pf-choices .pf-pick")
        return [...el("#pf-choices").innerHTML.matchAll(/class="pf-pick" value="([^"]*)"/g)].map((m) => {
          if (!picks.has(m[1])) picks.set(m[1], { ...mk(`pick:${m[1]}`), value: m[1] });
          return picks.get(m[1]);
        });
      /* a list of selectors: each bare id in it is its element */
      return s.split(",").map((x) => x.trim()).filter((x) => /^#[\w-]+$/.test(x)).map((x) => el(x));
    },
    getElementById: (id) => el("#" + id), addEventListener() {}, createElement: () => mk("new"),
    body: { appendChild() {}, removeChild() {} },
  };
  const store = new Map(session ? [["bio-session", JSON.stringify(session)]] : []);
  const sandbox = {
    document, fetch, URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array, Set, Map, Promise,
    crypto: webcrypto, setTimeout, TextEncoder, encodeURIComponent, decodeURIComponent,
    location: { hash, pathname: "/", origin: "https://copy.example" },
    history: { replaceState() { replaced += 1; sandbox.location.hash = ""; } },
    sessionStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) },
    navigator: { clipboard: { writeText: async () => {} } },
  };
  sandbox.window = sandbox;
  const ui = new Function(...Object.keys(sandbox), script + `
;return { mdFor, historyOrder, FIRST_STATE, HEADINGS, RISK_TIERS, riskTierState, SETTABLE_TIERS, deriveInquiryTitle,
          profilesWarning, openProfiles, panel, chosenRiskTier, openBundle, signerAddBody, describeKey, acquireWhy };`)(...Object.values(sandbox));
  return { ui, el, sandbox, replaced: () => replaced, picks };
}
