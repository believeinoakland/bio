/* control-plane (fix round 9, K4842; R-SEAM, R-ONE, R-CLOCK, R-NOLOAD): THE READING SEAM. Sections 1, 2, 3 and 9 of `t51-round9-seam.test.mjs` (plan 3b), a member's own acts through the real
   plane under Miniflare (its Worker, object, alarm and R2), inputs made by those acts and never a hand-written answer; counts, rows and fields, never a wall time (R-CLOCK).
     1  G91/G95/G92  head of line, `stale`, `owedwork`: a text the alarm reads while a slow scanner holds a call; the founder's `op=owedwork` never answers an `alarm_at` in the past
     2  G96-G98      the cancelled promote (G126a-d): the COUNTING-DOOR WALK (`wrap-entry.mjs`) over every op that can run a reading in a member's request, with an OCR member that FAILS any
                     call made inside a request; a scan whose promote is cancelled keeps its row and is read whole by the ticks; the broken stub (G126c) and a read that dies
     3  B2           a ~1 MB-stored ODS declaring tens of MB (G133a, G126d): no `extractread` in the upload, `reading_pending`, a `reading` row; a small ODS is read inline
     9  G129b-d      a failure at tick 2, a kill, an image's OCR
   The world of §2, §3 and §9 is the counting door (`wrap-entry.worker.txt`) over a plane whose Store is wrapped once more (`r9-tag.mjs`, written to the temp directory at run time) so that
   a call the object makes to the OCR member INSIDE a request carries `x-r9-in-request: 1`; a call made by the alarm does not. Requirement ids in titles: R130 (a reading owed has its row, and
   `reading_pending` follows the row), R131 (the inline gate), R133 (none dropped), R134 (the OCR passes are the ledger's), R135 (the job state), R125 (the press), R123, R100, R120. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { WRAP, readCalls, doCalls } from "./wrap-entry.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "../../../src/plane/index.mjs");
const EXTRACTION = join(HERE, "../../../src/extraction/index.mjs");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const te = (t) => new TextEncoder().encode(t);
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const MB = 1024 * 1024;
const ORIGIN = "https://group.example";

/* the plane's Store, wrapped so that (1) a call to the OCR member made while the object serves a request says so (an AsyncLocalStorage the request's `fetch` opens; the alarm opens none),
   and an answer that carries `x-r9-kill` kills the object in the middle of that call (`ctx.abort()`); (2) `/r9/tick?n=` runs the ledger's alarm n hours on, as the plane harness drives its ticks.
   The Worker's default export breaks the STORE binding as the request's header `x-r9-break` says (G98): `first`, the first stub to ask `pendingadd` stays broken, a fresh stub is whole; `all`,
   every stub refuses it; `extractread`, the reading route rejects. */
const TAG_MODULE = (planePath, EXTRACTION) => `import plane, { Store as Base } from ${JSON.stringify(planePath)};
import { extractionOf } from ${JSON.stringify(EXTRACTION)};
import { AsyncLocalStorage } from "node:async_hooks";
const inRequest = new AsyncLocalStorage();
const memberOf = (v, ctx) => ({ fetch: async (input, init = {}) => {
  const h = new Headers(init.headers); h.set("x-r9-in-request", inRequest.getStore() ? "1" : "0");
  const res = await v.fetch(input, { ...init, headers: h });
  if (res.headers.get("x-r9-kill") === "1") { ctx.abort("r9 kill"); await new Promise(() => {}); }
  return res;
} });
export class Store extends Base {
  #tick = 0;
  #seen;
  constructor(ctx, env) {
    const ocr = env.OCR_WORKER ? memberOf(env.OCR_WORKER, ctx) : null;
    /* the evidence store's hiccup: the next \`r2\` reads (get, head) of the object's own bucket reject, then it answers again (the plane harness's storeFailAt, as R2 gives it) */
    const seen = { passes: 0, r2: 0, hits: 0, armed: null, ocrKilled: 0 };
    const caps = env.CAPTURES ? new Proxy(env.CAPTURES, { get(t, k) {
      const v = t[k];
      if (typeof v !== "function") return v;
      return (...a) => { if ((k === "get" || k === "head") && seen.r2 > 0) { seen.r2--; seen.hits++; return Promise.reject(new Error("R2 hiccup")); } return v.apply(t, a); };
    } }) : null;
    super(ctx, new Proxy(env, { get(target, key) { return key === "OCR_WORKER" && ocr ? ocr : key === "CAPTURES" && caps ? caps : target[key]; } }));
    this.#seen = seen;
    /* a pass of the reading owner (the ledger's \`reading\` and \`ocr\` passes) completes: after the \`after\`th the fault is armed (the harness's tick 2) */
    const ex = extractionOf(ctx), real = ex.readHeld.bind(ex);
    ex.readHeld = async (...a) => {
      const r = await real(...a);
      if (r && r.ok !== false && r.reason !== "NO_HOME") { seen.passes++; if (seen.armed && seen.passes === seen.armed.after) seen.r2 = seen.armed.r2; }
      return r;
    };
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/r9/tick") { this.#tick += Number(url.searchParams.get("n") || 1); const out = await this.onAlarm(Date.now() + this.#tick * 3600000); return new Response(JSON.stringify({ ok: true, tick: this.#tick, ran: out ? Object.keys(out).length : 0 })); }
    if (url.pathname === "/r9/arm") { this.#seen.passes = 0; this.#seen.hits = 0; this.#seen.r2 = 0; this.#seen.armed = url.searchParams.has("after") ? { after: Number(url.searchParams.get("after")), r2: Number(url.searchParams.get("r2") || 1) } : null; return new Response("{}"); }
    if (url.pathname === "/r9/state") return new Response(JSON.stringify({ passes: this.#seen.passes, hits: this.#seen.hits, r2: this.#seen.r2 }));
    if (url.pathname === "/r9/ocr") return inRequest.run(true, async () => new Response(await (await this.env.OCR_WORKER.fetch("https://ocr-worker/transcribe", { method: "POST", body: JSON.stringify({ capture_sha: "0".repeat(64), store: "bio", pages: [1] }) })).text()));
    return inRequest.run(true, () => super.fetch(req));
  }
}
const pathOf = (input) => { try { return new URL(typeof input === "string" ? input : input.url).pathname.replace(/^\\/+/, "").split("/")[0]; } catch { return ""; } };
const broken = (env, mode, count) => {
  if (!mode) return env;
  const dead = new WeakSet(), first = { taken: false };
  return new Proxy(env, { get(target, key) {
    const v = target[key];
    if (key !== "STORE") return v;
    return new Proxy(v, { get(ns, m) {
      const f = ns[m];
      if (m !== "get") return typeof f === "function" ? f.bind(ns) : f;
      return (...a) => {
        const stub = f.apply(ns, a);
        return new Proxy(stub, { get(st, k2) {
          const g = st[k2];
          if (k2 !== "fetch" || typeof g !== "function") return typeof g === "function" ? g.bind(st) : g;
          return async (input, init) => {
            const route = pathOf(input);
            if (mode === "extractread" && route === "extractread") { count.n++; throw new Error("the object died in the middle of the read"); }
            if (route === "pendingadd" && (mode === "all" || (mode === "first" && (dead.has(st) || (!first.taken && (first.taken = true, dead.add(st), true))))))
            { count.n++; throw Object.assign(new Error("the object's stub is broken (the object was reset)"), { remote: true }); }
            return g.call(st, input, init);
          };
        } });
      };
    } });
  } });
};
export default {
  async fetch(req, env, ctx) {
    const count = { n: 0 };
    const res = await plane.fetch(req, broken(env, req.headers.get("x-r9-break"), count), ctx);
    if (!count.n) return res;
    const headers = new Headers(res.headers); headers.set("x-r9-broke", String(count.n));
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  },
  scheduled: (c, env, ctx) => plane.scheduled(c, env, ctx),
};
`;

/* a scan of `pages` pages, each one image and no text (the round-5 seam's `scanOf`), made distinct by `tag` */
// MOVE: imggen/pdfgen make a rasterised scan with real words; this one is the smallest file the readers call a scan, as t51-round5-seam.test.mjs builds it
export function scanOf(pages, tag = "") {
  const parts = [te("%PDF-1.4\n"), te("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"),
    te(`2 0 obj\n<< /Type /Pages /Kids [${Array.from({ length: pages }, (_, i) => `${10 + i} 0 R`).join(" ")}] /Count ${pages} >>\nendobj\n`)];
  const img = new Uint8Array(2000).fill(200);
  parts.push(te(`3 0 obj\n<< /Type /XObject /Subtype /Image /Width 40 /Height 50 /ColorSpace /DeviceGray /BitsPerComponent 8 /Length ${img.length} >>\nstream\n`), img, te("\nendstream\nendobj\n"));
  for (let i = 0; i < pages; i++) {
    const c = "q 500 0 0 700 50 50 cm /Im0 Do Q";
    parts.push(te(`${10 + i} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /XObject << /Im0 3 0 R >> >> /Contents ${500 + i} 0 R >>\nendobj\n`),
               te(`${500 + i} 0 obj\n<< /Length ${c.length} >>\nstream\n${c}\nendstream\nendobj\n`));
  }
  parts.push(te(`% ${tag}\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n`));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

/** The OCR member: one page a call (`deferred` names the rest), every call recorded with whether it was made inside a request; a call made inside a request FAILS (500), as the walk requires.
 *  `member.down` true refuses every call with a 503 (the member is down, owed not declined, R37); `down(n)` as a function refuses call n (1-based). `killPages` is a set of pages whose call kills the object
 *  (the answer carries `x-r9-kill`), as a page that kills its reader does. */
export function ocrMember({ perCall = 1, down = () => false, killPages = [] } = {}) {
  const log = [];
  const m = { log, down: false, downFn: null, killPages: new Set(killPages), perCall };
  m.binding = async (req) => {
    const b = await req.json();
    const inside = req.headers.get("x-r9-in-request") === "1";
    log.push({ inside, pages: [...(b.pages || [])] });
    const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
    if (inside) return json({ ok: false, reason: "R9_CALL_INSIDE_A_REQUEST" }, 500);
    if (m.down === true || down(log.length) || (m.downFn && m.downFn(log.length))) return json({ ok: false, reason: "R9_DOWN" }, 503);
    const wanted = (b.pages || []).slice(), take = wanted.slice(0, m.perCall), rest = wanted.slice(m.perCall);
    if (take.some((p) => m.killPages.has(p))) return json({ ok: false, reason: "R9_KILL" }, 500, { "x-r9-kill": "1" });
    return json({ ok: true, engine: "tess", version: "5.3", cap: "C", measured_by: "M-1", confidence_floor: null, deferred: rest,
      pages: take.map((p) => ({ page: p, regions: [{ text: `ocr scan page ${p} words`, source: { kind: "pdf-page", ref: `p${p}`, page: p, rect: [0, 0, 10, 10] }, confidence: "none" }] })) });
  };
  m.inside = () => log.filter((c) => c.inside).length;
  m.made = () => log.filter((c) => !c.inside).length;
  return m;
}

const live = [];
after(() => Promise.all(live.map((w) => w.mf.dispose().catch(() => {}))));

/* ======================================== §1 · G91 / G95 / G92 · head of line, stale, owedwork ======================================== */

/* The plane's own head-of-line entry (`test/m/plane/r8-headofline-entry.mjs`: the plane's Worker and Store with the REAL alarm, `readHeld` counted, the member's session and the filing of the document as routes
   of the object), extended once for the stalled case: `/r9/health?shift=` is the scheduler's `health` asked at a later instant (the platform's clock cannot be aged in a test; the definition is arithmetic on
   instants, platform check N). */
const HEAD_ENTRY = join(HERE, "../plane/r8-headofline-entry.mjs");
const HEAD_MODULE = (entry, scheduler) => `import { Headline } from ${JSON.stringify(entry)};
import { schedulerOf } from ${JSON.stringify(scheduler)};
export { default } from ${JSON.stringify(entry)};
export class Store extends Headline {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/r9/health") return new Response(JSON.stringify(await schedulerOf(this.ctx, this.env).health(Date.now() + Number(url.searchParams.get("shift") || 0))), { headers: { "content-type": "application/json" } });
    return super.fetch(req);
  }
}
`;
const HEAD_TEXT_BYTES = 4_000_060;   /* the smallest size seen deferred to the ledger (the plane's r8-headofline): the reading is then the ledger's, pass by pass */
const headText = () => { const line = (i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".") + "\n"; const n = Math.floor((HEAD_TEXT_BYTES - 60) / 100); const parts = []; for (let i = 0; i < n; i++) parts.push(line(i)); parts.push("ENDMARKER" + " ".repeat(HEAD_TEXT_BYTES - n * 100 - 9)); return Buffer.from(parts.join("")); };
const cleanVerdict = (sha) => ({ capture_sha: sha, tool: "clamav", engine: "clamav", engine_version: "1.0", signatures: { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" },
  scanned_at: new Date().toISOString(), result: "clean", findings: [], latency_ms: 1 });

/** One head-of-line world: the Miniflare plane with `FILE_SCANNER` answering `/scan` and `/render` after `scanMs`, its calls recorded in order, each end stating how many reading passes had completed by then. */
function headWorld({ scanMs, renderMs = scanMs }) {
  const dir = mkdtempSync(join(tmpdir(), "r9-head-"));
  const entryPath = join(dir, "r9-head.mjs");
  writeFileSync(entryPath, HEAD_MODULE(HEAD_ENTRY, join(HERE, "../../../src/scheduler/index.mjs")));
  const events = []; let stub = null, seq = 0;
  const passes = async () => (await (await stub.fetch("http://do/r8/state")).json()).passes;
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: entryPath, script: readFileSync(entryPath, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { INSTANCE_NAME: "town", VERSION: "test", ADMIN_TOKEN: "adm-r9head", DAEMON_TOKEN: "dmn-r9head", PROBE_TOKEN: "prb-r9head" },
    durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-r9-hol-")),
    serviceBindings: { FILE_SCANNER: async (req) => {
      const u = new URL(req.url), body = req.method === "POST" ? await req.json() : null;
      const json = (b, status = 200) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });
      if (u.pathname === "/scan") {
        events.push({ seq: ++seq, kind: "scan-start", targets: body.targets.length });
        await later(scanMs);
        events.push({ seq: ++seq, kind: "scan-end", passes: await passes() });
        return json({ ok: true, verdicts: body.targets.map((t) => cleanVerdict(t.capture_sha)) });
      }
      if (u.pathname === "/render") {
        events.push({ seq: ++seq, kind: "render-start" });
        await later(renderMs);
        events.push({ seq: ++seq, kind: "render-end", passes: await passes() });
        return json({ ok: false, code: "NOT_RENDERED" }, 422);
      }
      return json({ ok: true, name: "file-scanner", version: "1.0.0" });
    } },
  });
  live.push({ mf });
  const bind = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return (stub = ns.get(ns.idFromName("bio"))); };
  const session = async (as = "member") => (await (await stub.fetch(`http://do/r8/session?as=${as}`)).json()).token;
  return { mf, events, bind, session, get stub() { return stub; } };
}

/** the text uploaded through the real door by a member, then filed as the capture screen files it (so the reading has a home) */
async function headUpload(hw) {
  const token = await hw.session("member");
  const res = await hw.mf.dispatchFetch(`http://plane/api?op=captureupload&statement=${encodeURIComponent("the clerk's minutes")}&name=minutes.txt&type=text%2Fplain`,
    { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream" }, body: headText() });
  const j = await res.json();
  assert.equal(res.status, 200, JSON.stringify(j).slice(0, 300));
  const up = j.result ?? j;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
  const filed = await (await hw.stub.fetch("http://do/r8/file", { method: "POST", body: JSON.stringify({ document: up.document, sha: up.capture.sha256, bytes: up.capture.bytes }) })).json();
  assert.equal(filed.ok, true, JSON.stringify(filed).slice(0, 300));
  return up;
}
const founderOwed = async (hw, token) => { const r = await hw.mf.dispatchFetch("http://plane/api/?op=owedwork", { headers: { authorization: `Bearer ${token}` } }); const j = await r.json(); return { at: Date.now(), body: j.result ?? j }; };

/** run one head-of-line world until the scan has ended and the text has `wantPasses` passes; the founder's owedwork asked every 500 ms (the test's own clock, outside the object) */
async function runHead(scanMs, { maxPolls = 400, wantPasses = 2 } = {}) {
  const hw = headWorld({ scanMs });
  const stub = await hw.bind();
  const up = await headUpload(hw);
  const founder = await hw.session("founder"), asks = [];
  let last = null;
  for (let polls = 0; polls < maxPolls; polls++) {
    asks.push(await founderOwed(hw, founder));
    last = await (await stub.fetch("http://do/r8/rows")).json();
    if ((last.pending.length === 0 || last.passes >= wantPasses) && hw.events.some((e) => e.kind === "scan-end")) break;
    await later(500);
  }
  const notes = await (await stub.fetch("http://do/r8/notes")).json();
  return { hw, up, events: hw.events, asks, last, notes, passes: last.passes };
}

/** One world: the counting door over the tagged plane, an OCR member, the founder and members made by their own acts. */
export function world({ tag, ocr = ocrMember(), bindings = {}, serviceBindings = {}, upstream = new Map() } = {}) {
  const ADM = `adm-${tag}-0123456789abcdef`, PASSWORD = `the founder's long password, ${tag}`;
  const dir = mkdtempSync(join(tmpdir(), "r9-tag-"));
  const tagPath = join(dir, "r9-tag.mjs");
  writeFileSync(tagPath, TAG_MODULE(PLANE, EXTRACTION));
  const script = readFileSync(join(HERE, "wrap-entry.worker.txt"), "utf8").replace("__PLANE__", tagPath);
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: WRAP, script,
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
    serviceBindings: { OCR_WORKER: ocr.binding, ...serviceBindings },
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: `mem-${tag}-0123456789abcdef`, PROBE_TOKEN: `prb-${tag}-0123456789abcdef`, VERSION: "4.8.0", INSTANCE_NAME: `${tag}-town`,
                GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0", ...bindings },
    outboundService: (req) => {
      const f = upstream.get(new URL(req.url).pathname.split("/").pop());
      return f ? new Response(f.bytes, { headers: { "content-type": f.type, "content-length": String(f.bytes.length) } }) : new Response("not scripted", { status: 404 });
    },
  });
  const w = { mf, ocr, upstream };
  live.push(w);
  const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
  const call = async (auth, op, query = {}, body = undefined, extra = {}) => {
    const res = await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json", ...extra },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: res.status, body: await res.json(), calls: readCalls(res), res };
  };
  let founderOnce = null;
  const founder = async () => {
    if (founderOnce) return founderOnce;
    await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
    const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
    assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
    return (founderOnce = { authorization: `Bearer ${signed.result.token}` });
  };
  const people = new Map();
  const person = async (handle) => {
    if (people.has(handle)) return people.get(handle);
    const adm = await founder();
    const added = await call(adm, "memberadd", {}, { memberId: handle, cover: `cover of ${handle}`, role: "member", capabilities: ["contribute", "create_projects"] });
    const invite = added.body.result && (added.body.result.invite || (added.body.result.invitation && added.body.result.invitation.invite));
    assert.ok(invite, "an invitation: " + JSON.stringify(added.body).slice(0, 300));
    const pw = `${handle}-long-passphrase-r9`;
    assert.equal((await call({}, "enroll", {}, { invite, handle, password: pw })).body.ok, true, "enrolled");
    const signed = await call({}, "login", {}, { handle, password: pw, device: "own" });
    assert.equal(signed.body.ok, true, "signed in: " + JSON.stringify(signed.body).slice(0, 300));
    const auth = { authorization: `Bearer ${signed.body.result.token}` };
    people.set(handle, auth);
    return auth;
  };
  const screen = (auth) => ({ now: () => Date.now(), digest: async (s) => sha256(s),
    call: async (op, { query = {}, body } = {}) => (await call(auth, op, query, body)).body });
  /* the capture screen's two acts: the upload, then the filing of the document the upload answered (the promote) */
  const upload = async (auth, bytes, { name = "doc.bin", type = "application/octet-stream", statement = name, headers = {} } = {}) => {
    const res = await plane(`/api/?${new URLSearchParams({ op: "captureupload", statement, name, type })}`, { method: "POST", headers: { ...auth, ...headers }, body: bytes });
    const body = await res.json();
    return { status: res.status, body, result: body.result, calls: readCalls(res), res };
  };
  const file = async (auth, up, title) => {
    const made = await CAPTURE_SCREEN.parts.promoteDocument(screen(auth), { doc: up.result.document, title, locator: up.result.document.locator, project: "" });
    assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
    return made;
  };
  const owed = async (sha) => {
    const a = await call(await founder(), "owedwork", { sha });
    const r = a.body.result ?? a.body;
    return { ...r, rows: Array.isArray(r.owed) ? r.owed : [] };
  };
  const reading = async (auth, sha) => (await call(auth, "reading", { sha256: sha })).body.result;
  const unitsText = (r) => JSON.stringify(r && r.text_units ? r.text_units : []);
  const ocrPages = (r) => new Set([...unitsText(r).matchAll(/ocr scan page (\d+) words/g)].map((m) => Number(m[1])));
  const until = async (fn, ms, every = 1000) => {
    const end = Date.now() + ms;
    let v = await fn();
    while (!v && Date.now() < end) { await later(every); v = await fn(); }
    return v;
  };
  /* the object's own stub, for the harness routes of the tagged Store (`/r9/tick`): the ledger's alarm run `n` hours on, as the plane harness drives its ticks */
  const stub = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };
  /* a tick the platform may cut (a killed object answers nothing): the answer is the object's, or null */
  const tick = async (n = 1) => { try { return await (await (await stub()).fetch(`http://do/r9/tick?n=${n}`)).json(); } catch { return null; } };
  const arm = async (after = null, r2 = 1) => (await stub()).fetch(`http://do/r9/arm${after === null ? "" : `?after=${after}&r2=${r2}`}`).then((r) => r.text());
  const seen = async () => (await (await stub()).fetch("http://do/r9/state")).json();
  return Object.assign(w, { plane, call, founder, person, screen, upload, file, owed, reading, unitsText, ocrPages, until, stub, tick, arm, seen, sha: sha256, te });
}

/** the OCR member's call counts as the walk states them: calls made inside a request (must be 0), calls made by the alarm */
export const insideCalls = (w) => w.ocr.inside();


const OPEN = ["reading", "ocr"];
/* a row was written for the digest: open now, or already ended and listed among the digest's last runs (the first tick of the alarm can end an `ocr` row of a capture with no home yet, as plane's ledger ends it) */
const holdsRow = (o) => o.rows.some((r) => OPEN.includes(r.kind)) || (Array.isArray(o.last) && o.last.some((l) => OPEN.includes(l.kind)));
const openRow = (o) => o.rows.some((r) => OPEN.includes(r.kind) && !["final", "finished", "refused"].includes(r.job_state ?? r.state));
const kindsOf = (o) => o.rows.map((r) => `${r.kind}:${r.job_state ?? r.state}`).join(",");
/* a text of about `bytes` bytes, made distinct by `tag` */
function textOf(bytes, tag) {
  const line = `council minutes ${tag} the clerk filed the register and the chair signed it before the vote.\n`;
  const out = new Uint8Array(bytes);
  const l = te(line);
  for (let at = 0; at < out.length; at += l.length) out.set(l.subarray(0, Math.min(l.length, out.length - at)), at);
  return out;
}
/* an ODS of `rows` rows of three cells, by sheetgen (a generator of the library): its stored size is about 1/20 of what its `content.xml` declares */
async function odsOf(rows, seed) {
  const { generate } = await import("../../sheetgen.mjs");
  const g = generate({ kind: "ods", seed, size: { rows, cols: 3 }, header: "one", types: ["text", "integer", "text"] });
  return { bytes: await g.bytes(), type: g.type, marks: g.truth.marks.map((m) => m.text), lastRow: g.truth.fileRows };
}
const ODS_TYPE = "application/vnd.oasis.opendocument.spreadsheet";
/** the whole reading of a digest as the member asks for it: every page by `next` (`after`), the text of all its units joined */
async function wholeReading(w, auth, sha, { pages = 400 } = {}) {
  let r = await w.reading(auth, sha);
  const head = r;
  let text = w.unitsText(r);
  for (let i = 0; i < pages && r && r.next != null; i++) {
    r = (await w.call(auth, "reading", { sha256: sha, after: String(r.next) })).body.result;
    text += w.unitsText(r);
  }
  return { head, text };
}

export function sections(kit, counting) {
  void kit; void counting;
  let shared = null, shared9 = null;
  /* one world for sections 2 and 3: the counting door over the tagged plane, its OCR member, a scripted network */
  const W = () => (shared ??= world({ tag: "r9reading" }));

  /* ======================================== §1 · G91 / G95 / G92 ======================================== */

  test("R9 seam §1 (G91, G92, 3 s scanner, counts only): a ~4 MB text uploaded through the real door is read pass by pass beside a scan that holds a call: the scan is made once, passes are made, the verdict is written (R133 R123)", { timeout: 600000 }, async () => {
    const r = await runHead(3_000);
    assert.equal(r.events.filter((e) => e.kind === "scan-start").length, 1, "the scan is made once");
    assert.equal(r.events.filter((e) => e.kind === "scan-end").length, 1);
    assert.ok(r.passes >= 2, `the reading goes on pass by pass beside the scan (${r.passes} passes)`);
    assert.ok(r.notes.notes >= 1, "the scan's verdict is written");
  });

  test("R9 seam §1 (G91, G92, G95, 40 s scanner, HEAVY: the slowest test, run alone): the first pass of the text precedes the first scan-end, every pass precedes the first render-end, the scan completes after the handler returned; the founder's owedwork never answers an alarm_at in the past or null (R133 R123 R130)", { timeout: 900000 }, async () => {
    const r = await runHead(40_000);
    const end = r.events.find((e) => e.kind === "scan-end");
    assert.ok(end, "the scan ended (a call outlasting the budget is not abandoned)");
    assert.ok(end.passes >= 1, `by the first scan-end the text had ${end.passes} completed passes: the slow scan held the reading's due tick`);
    const render = r.events.find((e) => e.kind === "render-end");
    if (render) assert.equal(render.passes, r.passes, "every pass precedes the first render-end");
    assert.equal(r.events.filter((e) => e.kind === "scan-start").length, 1, "the scan is not started twice");
    assert.ok(r.notes.notes >= 1, "the scan still completes after the handler returned: its verdict is written");
    assert.ok(r.passes >= 2, "the reading goes on after the scan ended");
    const answered = r.asks.map((a) => a.body).filter((b) => b && Object.hasOwn(b, "alarm_at"));
    assert.ok(answered.length >= 5, `the administrator's answers carry alarm_at (${answered.length} of ${r.asks.length})`);
    const past = r.asks.filter((a) => a.body && typeof a.body.alarm_at === "number" && a.body.alarm_at < a.at - 2_000);
    assert.deepEqual(past.map((a) => [a.body.alarm_at, a.at]), [], "an alarm_at in the past (more than the poll's own 2 s of slack)");
    /* workerd clears the object's alarm while `alarm()` runs (getAlarm() answers null until the firing sets the next one), so a null `alarm_at` is the platform's and is true only of an answer
       that says a firing is in progress (`running_since` set); an answer with no firing in progress and no alarm would be a lost alarm (K4787, K4966; item 42) */
    assert.deepEqual(answered.filter((b) => b.alarm_at === null && !Number.isFinite(b.running_since)).map((b) => b.running_since), [], "alarm_at was null with no firing in progress");
    assert.ok(answered.every((b) => b.stale === false), "healthy: firings complete, so `stale` stays false");
  });

  test("R9 seam §1 (G95): the founder's owedwork answers `stale` false while firings complete, and the scheduler's health, asked 400 s on with a reading owed and no firing since, answers `stale: true` (R133; the clock is shifted at the object, platform check N)", { timeout: 600000 }, async () => {
    const hw = headWorld({ scanMs: 100 });
    const stub = await hw.bind();
    const token = await hw.session("member");
    /* a text deferred to the ledger and never filed: its reading row waits (NO_HOME, backing off), owed work that no firing serves before the shifted instant */
    const res = await hw.mf.dispatchFetch(`http://plane/api?op=captureupload&statement=x&name=minutes.txt&type=text%2Fplain`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream" }, body: headText() });
    assert.equal((await res.json()).result.ok, true);
    const founder = await hw.session("founder");
    const now = await founderOwed(hw, founder);
    assert.ok(Object.hasOwn(now.body, "stale"), "owedwork answers `stale`: " + JSON.stringify(Object.keys(now.body)));
    assert.equal(now.body.stale, false, "a row owed a few seconds with a firing just completed is not stale");
    const asked = async (shift) => (await (await stub.fetch(`http://do/r9/health?shift=${shift}`)).json());
    assert.equal((await asked(0)).stale, false);
    const later400 = await asked(400_000);
    assert.notEqual(later400.oldest_overdue, null, "work is owed at the shifted instant: " + JSON.stringify(later400));
    assert.equal(later400.stale, true, "owed work 300 s or more old and no firing completed in that long: " + JSON.stringify(later400));
  });

  /* ======================================== §2 · G96-G98 · the cancelled promote ======================================== */

  test("R9 seam §2 (G126a, G126b, G126d): the COUNTING-DOOR WALK: every op that can run a reading in a member's request (captureupload, acquire, readheld, pdfstructure&ocr=1, pagetranscribe, the promote follow) makes zero OCR calls in the request and owes a reading or ocr row instead (R130 R131 R134 R133 R125 R100)", { timeout: 900000 }, async () => {
    const w = W();
    w.ocr.down = true;   /* the member is down for the whole walk: nothing finishes, so a row stands wherever one is owed, and any call made inside a request is the finding */
    const ann = await w.person("r9-walk");
    /* the control: a call the object makes to the OCR member while it serves a request IS seen as inside one (and fails), so the zeros below mean something */
    const control = await (await w.stub()).fetch("http://do/r9/ocr");
    assert.equal(control.status, 200);
    assert.equal(w.ocr.inside(), 1, "the control call is counted as made inside a request");
    const base = 1;
    const at = (what) => `${what}: OCR calls made inside a request ${w.ocr.inside() - base} (${JSON.stringify(w.ocr.log.filter((c) => c.inside).slice(1, 4))})`;

    /* captureupload: a scan of 6 pages uploaded as the capture screen sends it */
    const a = scanOf(6, "walk-a"), shaA = w.sha(a);
    const upA = await w.upload(ann, a, { name: "walk-a.pdf", type: "application/pdf" });
    assert.equal(upA.status, 200, JSON.stringify(upA.body).slice(0, 300));
    assert.equal(upA.result.ok, true, JSON.stringify(upA.result).slice(0, 300));
    assert.equal(w.ocr.inside() - base, 0, at("captureupload"));
    const rowsA = await w.owed(shaA);
    assert.ok(holdsRow(rowsA), `captureupload: a reading/ocr row is owed before any promote; rows [${kindsOf(rowsA)}]`);

    /* acquire: the same kind of scan fetched from an address, its reading op in the member's request */
    const b = scanOf(6, "walk-b"), shaB = w.sha(b);
    w.upstream.set("walk-b.pdf", { bytes: b, type: "application/pdf" });
    const press = await w.call(ann, "acquire", {}, { locator: "https://www.example.gov/files/walk-b.pdf" });
    assert.equal(press.body.ok, true, "acquire: " + JSON.stringify(press.body).slice(0, 400));
    assert.equal(w.ocr.inside() - base, 0, at("acquire"));
    const rowsB = await w.owed(shaB);
    assert.ok(holdsRow(rowsB), `acquire: a reading/ocr row is owed; rows [${kindsOf(rowsB)}]`);

    /* readheld ("Read it") on a document the record holds */
    const c = scanOf(6, "walk-c"), shaC = w.sha(c);
    const upC = await w.upload(ann, c, { name: "walk-c.pdf", type: "application/pdf" });
    await w.file(ann, upC, "walk-c");
    const held = await w.call(ann, "readheld", { sha: shaC }, {});
    assert.ok(held.status < 500, "readheld: " + JSON.stringify(held.body).slice(0, 300));
    assert.equal(w.ocr.inside() - base, 0, at("readheld"));
    assert.ok(holdsRow(await w.owed(shaC)), "readheld: a reading/ocr row is owed");

    /* the OCR press and the AI's page transcription on a filed scan */
    const d = scanOf(6, "walk-d"), shaD = w.sha(d);
    const upD = await w.upload(ann, d, { name: "walk-d.pdf", type: "application/pdf" });
    await w.file(ann, upD, "walk-d");
    const pressed = await w.call(ann, "pdfstructure", { sha256: shaD, ocr: "1" }, {});
    assert.ok(pressed.status < 500, "pdfstructure&ocr=1: " + JSON.stringify(pressed.body).slice(0, 300));
    assert.equal(w.ocr.inside() - base, 0, at("pdfstructure&ocr=1"));
    assert.ok(holdsRow(await w.owed(shaD)), "pdfstructure&ocr=1: a reading/ocr row is owed");
    const transcribed = await w.call(ann, "pagetranscribe", { sha256: shaD }, {});
    assert.ok(transcribed.status < 600, "pagetranscribe answered: " + JSON.stringify(transcribed.body).slice(0, 200));
    assert.equal(w.ocr.inside() - base, 0, at("pagetranscribe"));

    /* the promote follow: a document filed by the promote, whose reading the door follows */
    await w.file(ann, upA, "walk-a");
    assert.equal(w.ocr.inside() - base, 0, at("the promote follow"));
    assert.ok(holdsRow(await w.owed(shaA)), "the promote follow: the reading/ocr row stands");
    w.ocr.down = false;
  });

  test("R9 seam §2 (G126a, G96): a scan uploaded and its promote never completed keeps its row; filed later, every page is in text_units, completeness whole, ocr_left absent, the OCR member called once a page by the alarm and never inside a request (R130 R134 R135 R123)", { timeout: 900000 }, async () => {
    const w = W();
    w.ocr.down = false;
    const ann = await w.person("r9-cancel");
    const PAGES = 8;
    const bytes = scanOf(PAGES, "cancelled"), sha = w.sha(bytes);
    const insideBefore = w.ocr.inside();
    const up = await w.upload(ann, bytes, { name: "scan8.pdf", type: "application/pdf" });
    assert.equal(up.result.ok, true, JSON.stringify(up.result).slice(0, 300));
    const before = await w.owed(sha);
    assert.ok(openRow(before), `before any promote the digest's open work lists a reading/ocr row: [${kindsOf(before)}]`);
    /* the promote is the browser's and is cancelled: the ledger's row stands through several ticks of the alarm */
    await w.tick(1); await w.tick(1);
    const after = await w.owed(sha);
    assert.ok(openRow(after), `after ticks with no promote the row still stands: [${kindsOf(after)}]`);
    /* the member's next look files it; the ticks read it whole */
    await w.file(ann, up, "scan8");
    const whole = await w.until(async () => { await w.tick(1); return w.ocrPages(await w.reading(ann, sha)).size === PAGES; }, 120000, 500);
    const r = await w.reading(ann, sha);
    assert.ok(whole, `within the ticks all ${PAGES} pages are in text_units: pages [${[...w.ocrPages(r)].sort()}] of ${PAGES}, completeness ${JSON.stringify(r.completeness && r.completeness.state)}`);
    assert.equal(r.completeness.state, "whole", JSON.stringify(r.completeness));
    assert.equal(r.reading && r.reading.ocr_left, undefined, "ocr_left is absent: " + JSON.stringify(r.reading && r.reading.ocr_left));
    assert.equal(w.ocr.inside(), insideBefore, "no OCR call was made inside a request");
    assert.ok(w.ocr.log.slice(-PAGES).every((c) => !c.inside && c.pages.length >= 1), "the pages were read by the alarm");
  });

  const BIG_TEXT = 3 * MB + 200 * 1024;   /* over READING_DEFER_OTHER_BYTES (3 MiB): deferred to the ledger, so the door registers the row itself */
  test("R9 seam §2 (G126c, G98): the first stub to register a row is broken and STAYS broken: the row is written through a fresh stub, `reading_pending` stands and nothing is refused (R130)", { timeout: 900000 }, async () => {
    const w = W();
    const ann = await w.person("r9-stub");
    const bytes = textOf(BIG_TEXT, "stub-first"), sha = w.sha(bytes);
    const up = await w.upload(ann, bytes, { name: "minutes.txt", type: "text/plain", headers: { "x-r9-break": "first" } });
    assert.equal(up.result.ok, true, JSON.stringify(up.result).slice(0, 300));
    assert.equal(up.result.reading_pending, true, "reading_pending, the row held through a fresh stub: " + JSON.stringify({ ...up.result, document: undefined }).slice(0, 400));
    assert.equal(up.result.reading_refused, undefined, "nothing is refused");
    assert.equal(up.res.headers.get("x-r9-broke"), "1", "the first stub did refuse the registration (once)");
    const o = await w.owed(sha);
    assert.ok(o.rows.some((r) => r.kind === "reading"), `a reading row is held: [${kindsOf(o)}]`);
  });

  test("R9 seam §2 (G126c, G98): where every stub is broken the row cannot be written: the answer does not say `reading_pending` and carries `reading_refused` (R130)", { timeout: 900000 }, async () => {
    const w = W();
    const ann = await w.person("r9-stub");
    const bytes = textOf(BIG_TEXT, "stub-all"), sha = w.sha(bytes);
    const up = await w.upload(ann, bytes, { name: "minutes.txt", type: "text/plain", headers: { "x-r9-break": "all" } });
    assert.equal(up.result.ok, true, "the upload stands: " + JSON.stringify(up.result).slice(0, 300));
    assert.notEqual(up.result.reading_pending, true, "no reading_pending where no row could be written");
    assert.ok(up.result.reading_refused && typeof up.result.reading_refused === "object", "a stated refusal: " + JSON.stringify({ ...up.result, document: undefined }).slice(0, 400));
    assert.equal(up.result.reading_refused.reason, "READING_NOT_REGISTERED");
    assert.ok(Number(up.res.headers.get("x-r9-broke")) >= 2, "the first stub and the fresh one both refused the registration");
    assert.equal(typeof up.result.reading_refused.registrar, "string", "the registrar's reason is carried");
    void sha;
  });

  test("R9 seam §2 (G126c): an extractread made to die mid-read leaves a row: the answer is `reading_pending` and the digest's open work lists it (R130)", { timeout: 900000 }, async () => {
    const w = W();
    const ann = await w.person("r9-stub");
    const bytes = textOf(900, "dies"), sha = w.sha(bytes);
    const up = await w.upload(ann, bytes, { name: "short.txt", type: "text/plain", headers: { "x-r9-break": "extractread" } });
    assert.equal(up.result.ok, true, JSON.stringify(up.result).slice(0, 300));
    assert.equal(up.res.headers.get("x-r9-broke"), "1", "the read did die (the reading route rejected)");
    assert.equal(up.result.reading_pending, true, "reading_pending: " + JSON.stringify({ ...up.result, document: undefined }).slice(0, 400));
    const o = await w.owed(sha);
    assert.ok(o.rows.some((r) => r.kind === "reading"), `a reading row stands: [${kindsOf(o)}]`);
  });

  /* ======================================== §3 · B2 · the 1 MB-stored ODS that unpacks to tens of MB ======================================== */

  /* scaled: 12,000 rows is 197 KB stored and 4.0 MB declared in content.xml (20:1), over the inline ceiling of 3 MiB for a container's unpacked text (READING_DEFER_OTHER_BYTES) */
  test("R9 seam §3 (G126d, G133a, B2): an ODS stored small whose content.xml declares more than the inline ceiling is not read in the upload: no extractread call, reading_pending, a reading row before any promote; a small ODS is still read inline (R131 R130 R133)", { timeout: 900000 }, async () => {
    const w = W();
    const ann = await w.person("r9-ods");
    const big = await odsOf(12000, "r9big"), bigSha = w.sha(big.bytes);
    assert.ok(big.bytes.length < 3 * MB, "stored small: " + big.bytes.length);
    const up = await w.upload(ann, big.bytes, { name: "big.ods", type: ODS_TYPE });
    assert.equal(up.status, 200, JSON.stringify(up.body).slice(0, 300));
    assert.equal(up.result.ok, true, JSON.stringify(up.result).slice(0, 300));
    assert.equal(doCalls(up.calls, ["extractread"]), 0, "no extractread during the upload: " + JSON.stringify(up.calls.do));
    assert.equal(up.result.reading_pending, true, "reading_pending: " + JSON.stringify({ ...up.result, document: undefined }).slice(0, 300));
    assert.equal(up.result.document && up.result.document.reading, undefined, "no reading in the answer");
    const o = await w.owed(bigSha);
    assert.ok(o.rows.some((r) => r.kind === "reading"), `a reading row before any promote: [${kindsOf(o)}]`);
    /* control: a small ODS is read inline, as before */
    const small = await odsOf(100, "r9small");
    const upS = await w.upload(ann, small.bytes, { name: "small.ods", type: ODS_TYPE });
    assert.equal(upS.result.ok, true, JSON.stringify(upS.result).slice(0, 300));
    assert.equal(doCalls(upS.calls, ["extractread"]), 1, "a small ODS is read inline: " + JSON.stringify(upS.calls.do));
    assert.ok(upS.result.document && upS.result.document.reading, "its reading is in the answer");
  });

  test("R9 seam §3 (G133a, B2): the deferred ODS is read whole by the ticks once filed: completeness whole and its last row in the text units (R130 R133 R135) (odf-reader 6's held-cells read, merged)", { timeout: 900000 }, async () => {
    const w = W();
    const ann = await w.person("r9-ods");
    const ods = await odsOf(12000, "r9whole"), sha = w.sha(ods.bytes);
    const up = await w.upload(ann, ods.bytes, { name: "whole.ods", type: ODS_TYPE });
    assert.equal(up.result.reading_pending, true);
    await w.file(ann, up, "whole");
    const last = ods.marks[ods.marks.length - 1];
    let state = null;
    const whole = await w.until(async () => { await w.tick(1); const r = await w.reading(ann, sha); state = r && r.completeness && r.completeness.state; return state === "whole"; }, 240000, 1000);
    assert.ok(whole, `the reading is whole after the ticks (completeness ${state})`);
    const got = await wholeReading(w, ann, sha);
    assert.ok(got.text.includes(last), `the last row (${last}) is in text_units`);
  });

  /* ======================================== §9 · G129b-d · a failure at tick 2, a kill, an image's OCR ======================================== */

  const W9 = () => (shared9 ??= world({ tag: "r9nine" }));
  /* the reading's end as a member sees it (R135 on `op=reading`): whole; or ended with its reason (`failure: final` and `why`); a `partial` with no reason is the cause */
  const endOf = (r) => {
    const c = (r && r.completeness) || {};
    return { state: c.state, failure: c.failure ?? null, why: c.why ?? null, units: (r && r.text_units ? r.text_units.length : 0) };
  };
  const wholeOrFinalWithReason = (r, what) => {
    const e = endOf(r);
    if (e.state === "whole") return;
    assert.ok(e.failure === "final" && typeof e.why === "string" && e.why.length > 0, `${what}: neither whole nor final with its reason, never partial without one: ${JSON.stringify(e)}`);
  };
  /** drive the ledger's ticks (`/r9/tick`) until the digest has no open row, or `max` ticks */
  async function drive(w, ann, sha, max = 20) {
    for (let i = 0; i < max; i++) {
      await w.tick(1);
      const o = await w.owed(sha);
      if (!openRow(o) && i > 0) return i + 1;
    }
    return max;
  }
  async function failAtTick2(w, ann, { bytes, name, type }) {
    await w.arm(1, 2);   /* after the first pass of the reading owner completes, the next two reads of the evidence store reject */
    const sha = w.sha(bytes);
    const up = await w.upload(ann, bytes, { name, type });
    assert.equal(up.result.ok, true, JSON.stringify(up.result).slice(0, 300));
    await w.file(ann, up, name);
    await drive(w, ann, sha);
    const st = await w.seen();
    const r = await w.reading(ann, sha);
    return { st, r, up, sha };
  }

  test("R9 seam §9 (G129b, PDF E7): a text PDF read in pieces whose evidence store fails at its second pass is retried and whole, or final with its reason, never partial without one (R133 R134 R135)", { timeout: 900000 }, async () => {
    const w = W9();
    const ann = await w.person("r9-nine");
    const { generate } = await import("../../pdfgen.mjs");
    const g = generate({ kind: "pdf", seed: "r9e7", size: { pages: 60, lines: 40, bytes: 2_400_000 }, kinds: ["text"], fonts: ["type0"] });   /* over pdf.request_bytes: the ledger reads it in passes */
    const { st, r, up } = await failAtTick2(w, ann, { bytes: await g.bytes(), name: "e7.pdf", type: "application/pdf" });
    assert.equal(up.result.reading_pending, true, "deferred to the ledger");
    assert.ok(st.hits >= 1, `the evidence store failed at the second pass (rejected reads ${st.hits}, passes ${st.passes})`);
    wholeOrFinalWithReason(r, "PDF E7");
    if (endOf(r).state === "whole") assert.equal(r.completeness.counts.written, 60, JSON.stringify(r.completeness.counts));
  });

  test("R9 seam §9 (G129b, SCAN E2): a 30-page scan (two OCR passes) whose evidence store fails at the second pass is retried and every page is read, or final with its reason (R134 R133 R135)", { timeout: 900000 }, async () => {
    const w = W9();
    w.ocr.down = false; w.ocr.killPages.clear();
    const ann = await w.person("r9-nine");
    const { st, r } = await failAtTick2(w, ann, { bytes: scanOf(30, "e2"), name: "e2.pdf", type: "application/pdf" });
    assert.ok(st.hits >= 1, `the evidence store failed at the second pass (rejected reads ${st.hits}, passes ${st.passes})`);
    wholeOrFinalWithReason(r, "SCAN E2");
    if (endOf(r).state === "whole") assert.equal(w.ocrPages(r).size, 30, `all 30 pages have text: ${w.ocrPages(r).size}`);
  });

  test("R9 seam §9 (G129b, SHEET): a workbook read in passes whose evidence store fails at the second pass is retried and whole, or final with its reason, never partial without one (R133 R135)", { timeout: 900000 }, async () => {
    const w = W9();
    const ann = await w.person("r9-nine");
    const { generate } = await import("../../sheetgen.mjs");
    const g = generate({ kind: "xlsx", seed: "r9sh", size: { rows: 20000, cols: 3 }, header: "one", types: ["text", "integer", "text"] });
    const { st, r } = await failAtTick2(w, ann, { bytes: await g.bytes(), name: "sheet.xlsx", type: g.type });
    assert.ok(st.hits >= 1, `the evidence store failed at the second pass (rejected reads ${st.hits}, passes ${st.passes})`);
    wholeOrFinalWithReason(r, "SHEET");
    if (endOf(r).state === "whole") assert.ok(r.completeness.counts.written >= 6 && r.completeness.counts.offered === r.completeness.counts.written, JSON.stringify(r.completeness.counts));
  });

  test("R9 seam §9 (G129c, SCAN D12, PDF E10): a page that kills its reader three times is stated for that page alone (PAGE_KILLED_READER) and the rest of the scan is read (R134 R133) (red until the OCR pass steps past a killed page: extraction 28's pass is atomic over its pages and plane 37 ends the row)", { timeout: 900000 }, async () => {
    const w = W9();
    w.ocr.down = false;
    const ann = await w.person("r9-nine");
    const PAGES = 8, BAD = 5;   /* the OCR member is asked pages from 0 */
    w.ocr.killPages = new Set([BAD]);
    await w.arm(null);
    const bytes = scanOf(PAGES, "kill"), sha = w.sha(bytes);
    const up = await w.upload(ann, bytes, { name: "kill.pdf", type: "application/pdf" });
    await w.file(ann, up, "kill");
    const rest = [0, 1, 2, 3, 4, 6, 7];
    await w.until(async () => { await w.tick(1); return !openRow(await w.owed(sha)); }, 90000, 300);
    const r = await w.reading(ann, sha), o = await w.owed(sha);
    const done = rest.every((p) => w.ocrPages(r).has(p));
    const kills = w.ocr.log.filter((c) => !c.inside && c.pages.includes(BAD)).length;
    assert.ok(kills >= 3, `the page killed its reader ${kills} times`);
    assert.ok(done, `the rest of the scan is read: pages [${[...w.ocrPages(r)].sort()}] of ${PAGES}; open work [${kindsOf(o)}]; ${JSON.stringify(endOf(r))}`);
    assert.equal(w.ocrPages(r).has(BAD), false, "the killing page has no text");
    assert.ok(JSON.stringify(r).includes("PAGE_KILLED_READER"), `page ${BAD} is stated for itself (PAGE_KILLED_READER): ${JSON.stringify(endOf(r))}`);
    w.ocr.killPages = new Set();
  });

  test("R9 seam §9 (G129d, SCAN E3): a picture uploaded while the OCR member is down for three calls is retried to the end: its text is read and its ocr row does not end at UNREADABLE (R134 R133 R135)", { timeout: 900000 }, async () => {
    const w = W9();
    w.ocr.killPages = new Set();
    const before = w.ocr.log.length;
    w.ocr.down = false;
    const ann = await w.person("r9-nine");
    const { generate } = await import("../../imggen.mjs");
    const g = generate({ kind: "png", seed: "r9e3", size: { pages: 1, lines: 6 } });
    const bytes = await (g.bytes ? g.bytes() : (async () => { const parts = []; for await (const c of g.chunks()) parts.push(c); return Buffer.concat(parts); })());
    const sha = w.sha(bytes);
    /* down for the picture's first three calls */
    const downFrom = before;
    const was = w.ocr.down;
    w.ocr.down = false;
    const gate = (n) => n > downFrom && n <= downFrom + 3;
    const real = w.ocr.binding;
    void real; void was;
    w.ocr.downFn = gate;
    const up = await w.upload(ann, bytes, { name: "picture.png", type: "image/png" });
    assert.equal(up.result.ok, true, JSON.stringify(up.result).slice(0, 300));
    await w.file(ann, up, "picture");
    const done = await w.until(async () => { await w.tick(1); return w.unitsText(await w.reading(ann, sha)).includes("ocr scan page"); }, 90000, 300);
    const r = await w.reading(ann, sha), o = await w.owed(sha);
    assert.ok(done, `the picture's text is read after the OCR member came back: ocr calls ${w.ocr.log.length - before}, ${JSON.stringify(endOf(r))}, open [${kindsOf(o)}], last ${JSON.stringify(o.last)}`);
    assert.equal(JSON.stringify(o).includes("UNREADABLE"), false, "no ocr row ended at UNREADABLE: " + JSON.stringify(o.last));
    w.ocr.downFn = null;
  });
}
