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
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const te = (t) => new TextEncoder().encode(t);
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const MB = 1024 * 1024;
const ORIGIN = "https://group.example";

/* the plane's Store, wrapped so that (1) a call to the OCR member made while the object serves a request says so (an AsyncLocalStorage the request's `fetch` opens; the alarm opens none),
   and an answer that carries `x-r9-kill` kills the object in the middle of that call (`ctx.abort()`); (2) `/r9/tick?n=` runs the ledger's alarm n hours on, as the plane harness drives its ticks.
   The Worker's default export breaks the STORE binding as the request's header `x-r9-break` says (G98): `first`, the first stub to ask `pendingadd` stays broken, a fresh stub is whole; `all`,
   every stub refuses it; `extractread`, the reading route rejects. */
const TAG_MODULE = (planePath) => `import plane, { Store as Base } from ${JSON.stringify(planePath)};
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
  constructor(ctx, env) {
    const ocr = env.OCR_WORKER ? memberOf(env.OCR_WORKER, ctx) : null;
    super(ctx, new Proxy(env, { get(target, key) { return key === "OCR_WORKER" && ocr ? ocr : target[key]; } }));
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/r9/tick") { this.#tick += Number(url.searchParams.get("n") || 1); const out = await this.onAlarm(Date.now() + this.#tick * 3600000); return new Response(JSON.stringify({ ok: true, tick: this.#tick, ran: out ? Object.keys(out).length : 0 })); }
    return inRequest.run(true, () => super.fetch(req));
  }
}
const pathOf = (input) => { try { return new URL(typeof input === "string" ? input : input.url).pathname.replace(/^\\/+/, "").split("/")[0]; } catch { return ""; } };
const broken = (env, mode) => {
  if (!mode) return env;
  const dead = new WeakSet();
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
            if (mode === "extractread" && route === "extractread") throw new Error("the object died in the middle of the read");
            if (route === "pendingadd" && (mode === "all" || (mode === "first" && (dead.has(st) || (dead.size === 0 && (dead.add(st), true))))))
              throw Object.assign(new Error("the object's stub is broken (the object was reset)"), { remote: true });
            return g.call(st, input, init);
          };
        } });
      };
    } });
  } });
};
export default { fetch: (req, env, ctx) => plane.fetch(req, broken(env, req.headers.get("x-r9-break")), ctx), scheduled: (c, env, ctx) => plane.scheduled(c, env, ctx) };
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
  const m = { log, down: false, killPages: new Set(killPages), perCall };
  m.binding = async (req) => {
    const b = await req.json();
    const inside = req.headers.get("x-r9-in-request") === "1";
    log.push({ inside, pages: [...(b.pages || [])] });
    const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
    if (inside) return json({ ok: false, reason: "R9_CALL_INSIDE_A_REQUEST" }, 500);
    if (m.down === true || down(log.length)) return json({ ok: false, reason: "R9_DOWN" }, 503);
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

/** One world: the counting door over the tagged plane, an OCR member, the founder and members made by their own acts. */
export function world({ tag, ocr = ocrMember(), bindings = {}, serviceBindings = {}, upstream = new Map() } = {}) {
  const ADM = `adm-${tag}-0123456789abcdef`, PASSWORD = `the founder's long password, ${tag}`;
  const dir = mkdtempSync(join(tmpdir(), "r9-tag-"));
  const tagPath = join(dir, "r9-tag.mjs");
  writeFileSync(tagPath, TAG_MODULE(PLANE));
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
  const tick = async (n = 1) => (await (await (await stub()).fetch(`http://do/r9/tick?n=${n}`)).json());
  return Object.assign(w, { plane, call, founder, person, screen, upload, file, owed, reading, unitsText, ocrPages, until, stub, tick, sha: sha256, te });
}

/** the OCR member's call counts as the walk states them: calls made inside a request (must be 0), calls made by the alarm */
export const insideCalls = (w) => w.ocr.inside();


const OPEN = ["reading", "ocr"];
/* a row was written for the digest: open now, or already ended and listed among the digest's last runs (the first tick of the alarm can end an `ocr` row of a capture with no home yet, as plane's ledger ends it) */
const holdsRow = (o) => o.rows.some((r) => OPEN.includes(r.kind)) || (Array.isArray(o.last) && o.last.some((l) => OPEN.includes(l.kind)));
const openRow = (o) => o.rows.some((r) => OPEN.includes(r.kind));
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
  let shared = null;
  /* one world for sections 2 and 3: the counting door over the tagged plane, its OCR member, a scripted network */
  const W = () => (shared ??= world({ tag: "r9reading" }));

  /* ======================================== §2 · G96-G98 · the cancelled promote ======================================== */

  test("R9 seam §2 (G126a, G126b, G126d): the COUNTING-DOOR WALK: every op that can run a reading in a member's request (captureupload, acquire, readheld, pdfstructure&ocr=1, pagetranscribe, the promote follow) makes zero OCR calls in the request and owes a reading or ocr row instead (R130 R131 R134 R133)", { timeout: 900000 }, async () => {
    const w = W();
    w.ocr.down = true;   /* the member is down for the whole walk: nothing finishes, so a row stands wherever one is owed, and any call made inside a request is the finding */
    const ann = await w.person("r9-walk");
    const at = (what) => `${what}: OCR calls made inside a request ${w.ocr.inside()} (${JSON.stringify(w.ocr.log.filter((c) => c.inside).slice(0, 3))})`;

    /* captureupload: a scan of 6 pages uploaded as the capture screen sends it */
    const a = scanOf(6, "walk-a"), shaA = w.sha(a);
    const upA = await w.upload(ann, a, { name: "walk-a.pdf", type: "application/pdf" });
    assert.equal(upA.status, 200, JSON.stringify(upA.body).slice(0, 300));
    assert.equal(upA.result.ok, true, JSON.stringify(upA.result).slice(0, 300));
    assert.equal(w.ocr.inside(), 0, at("captureupload"));
    const rowsA = await w.owed(shaA);
    assert.ok(holdsRow(rowsA), `captureupload: a reading/ocr row is owed before any promote; rows [${kindsOf(rowsA)}]`);

    /* acquire: the same kind of scan fetched from an address, its reading op in the member's request */
    const b = scanOf(6, "walk-b"), shaB = w.sha(b);
    w.upstream.set("walk-b.pdf", { bytes: b, type: "application/pdf" });
    const press = await w.call(ann, "acquire", {}, { locator: "https://www.example.gov/files/walk-b.pdf" });
    assert.equal(press.body.ok, true, "acquire: " + JSON.stringify(press.body).slice(0, 400));
    assert.equal(w.ocr.inside(), 0, at("acquire"));
    const rowsB = await w.owed(shaB);
    assert.ok(holdsRow(rowsB), `acquire: a reading/ocr row is owed; rows [${kindsOf(rowsB)}]`);

    /* readheld ("Read it") on a document the record holds */
    const c = scanOf(6, "walk-c"), shaC = w.sha(c);
    const upC = await w.upload(ann, c, { name: "walk-c.pdf", type: "application/pdf" });
    await w.file(ann, upC, "walk-c");
    const held = await w.call(ann, "readheld", { sha: shaC }, {});
    assert.ok(held.status < 500, "readheld: " + JSON.stringify(held.body).slice(0, 300));
    assert.equal(w.ocr.inside(), 0, at("readheld"));
    assert.ok(holdsRow(await w.owed(shaC)), "readheld: a reading/ocr row is owed");

    /* the OCR press and the AI's page transcription on a filed scan */
    const d = scanOf(6, "walk-d"), shaD = w.sha(d);
    const upD = await w.upload(ann, d, { name: "walk-d.pdf", type: "application/pdf" });
    await w.file(ann, upD, "walk-d");
    const pressed = await w.call(ann, "pdfstructure", { sha256: shaD, ocr: "1" }, {});
    assert.ok(pressed.status < 500, "pdfstructure&ocr=1: " + JSON.stringify(pressed.body).slice(0, 300));
    assert.equal(w.ocr.inside(), 0, at("pdfstructure&ocr=1"));
    assert.ok(holdsRow(await w.owed(shaD)), "pdfstructure&ocr=1: a reading/ocr row is owed");
    const transcribed = await w.call(ann, "pagetranscribe", { sha256: shaD }, {});
    assert.ok(transcribed.status < 600, "pagetranscribe answered: " + JSON.stringify(transcribed.body).slice(0, 200));
    assert.equal(w.ocr.inside(), 0, at("pagetranscribe"));

    /* the promote follow: a document filed by the promote, whose reading the door follows */
    await w.file(ann, upA, "walk-a");
    assert.equal(w.ocr.inside(), 0, at("the promote follow"));
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
    assert.equal(typeof up.result.reading_refused.registrar, "string", "the registrar's reason is carried");
    void sha;
  });

  test("R9 seam §2 (G126c): an extractread made to die mid-read leaves a row: the answer is `reading_pending` and the digest's open work lists it (R130)", { timeout: 900000 }, async () => {
    const w = W();
    const ann = await w.person("r9-stub");
    const bytes = textOf(900, "dies"), sha = w.sha(bytes);
    const up = await w.upload(ann, bytes, { name: "short.txt", type: "text/plain", headers: { "x-r9-break": "extractread" } });
    assert.equal(up.result.ok, true, JSON.stringify(up.result).slice(0, 300));
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

  test("R9 seam §3 (G133a, B2): the deferred ODS is read whole by the ticks once filed: completeness whole and its last row in the text units (R130 R133 R135) (provider: odf-reader 6's held-cells read; red by name if it does not hold)", { timeout: 900000 }, async () => {
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
}
