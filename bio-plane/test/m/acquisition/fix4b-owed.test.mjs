/* acquisition, T51 fix round 4b (F5, F11; Bob's question K4483: nothing held in parts is lost): R100 at the module's interface,
   `acquire(store, body, opts)` and `owedRun(store, entry, opts)` over a scripted network, an evidence bucket and the store handed
   in (fixture.mjs, whose sessions are pruned past their hour as capture R22 prunes them). The plane's owed-work ledger is a
   stand-in here (an `owedLater` that records what it is handed, and an alarm that runs `owedRun` for each entry); the plane's own
   half is plane R77's. Each test has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha, page, HTML, promoteFiled } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { ARCHIVE_TREE_ENTRIES_MAX } from "../../../src/ooxml.mjs";
import { acquire, owedRun, keepPast, OWED_SESSION_TTL_MS, unpack, UNPACK_DAILY_ENTRIES, UNPACK_CALL_ENTRIES } from "../../../src/acquisition/index.mjs";
import { RENDER_DEFAULTS } from "../../../src/render.mjs";

const O = "https://big.example";
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 1, 2, 3, 4]);
const MIN = 60 * 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the stand-in ledger: entries by key (the session for supporting files, the digest otherwise), re-registration re-arms */
const ledger = () => {
  const entries = new Map(), log = [];
  // fixtures-contract: plane owed-ledger
  return { entries, log, owedLater: async (e) => { log.push(e); entries.set(e.kind === "subresources" ? e.session : e.sha, e); return { ok: true }; } };
};
const imgs = (n) => Array.from({ length: n }, (_, i) => `<img src="/img/i${i}.png">`).join("");
const bigPage = (n) => HTML(imgs(n));
const bigRoutes = (n, fetched = []) => {
  const extra = { "/big.html": [bigPage(n), "text/html"] };
  for (let i = 0; i < n; i++) extra[`/img/i${i}.png`] = [PNG, "image/png"];
  return (u) => {
    fetched.push(u);
    const e = extra[new URL(u).pathname];
    return e ? new Response(e[0], { headers: { "content-type": e[1] } }) : new Response("nf", { status: 404 });
  };
};

/* R116 (fix round 9): an `acquire` of a ZIP registers its `unpack` row before it answers; the plane's table is idempotent on (sha, kind), so the ledger reads one row */
const oneRow = (log) => [...new Map(log.map((e) => [JSON.stringify(e), e])).values()];

test("R100 (F5): 120 supporting files with 30 deferred, 61 minutes later the alarm fetches them: the session is parked past its hour, owed in the ledger, finished by owedRun and dropped", async () => {
  const w = world();
  const L = ledger();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = L.owedLater;
  w.store.recordCaptureLimit({ runtime: "subrequests", observed: 100 });
  const fetched = [];
  const routes = bigRoutes(120, fetched);
  const first = await run(w, routes, { locator: `${O}/big.html`, subresources: true });
  assert.equal(first.body.ok, true);
  const out0 = first.body.snapshot.outstanding;
  assert.ok(out0 > 0 && out0 < 120, `a page that needs a session (outstanding ${out0})`);
  const sid = first.body.snapshot.continuation.session;
  assert.deepEqual(L.log, [{ kind: "subresources", sha: first.body.document.capture.sha256, session: sid }], "the outstanding files are owed work");
  assert.equal(w.store.state.sessionSaves[0].ttlMs, OWED_SESSION_TTL_MS, "parked past the hour");
  /* 61 minutes pass: capture would have pruned an hour-old session */
  w.store.state.clockMs = Date.now() + 61 * MIN;
  const live = w.store.liveCaptureSessions(w.store.state.clockMs);
  assert.deepEqual(live.map((s) => s.session), [sid], "the session is still there");
  /* the alarm: owedRun until the ledger's entry is done */
  const net = (await import("./fixture.mjs")).network(routes);
  let done = null, ticks = 0;
  try {
    while (!done && ticks < 30) {
      const r = await owedRun(w.store, L.entries.get(sid), {});
      assert.equal(r.ok, true, JSON.stringify(r));
      ticks++;
      if (r.done) done = r;
    }
  } finally { net.restore(); }
  assert.ok(done, "the entry ends");
  assert.equal(w.store.state.sessions.has(sid), false, "the session is dropped when its work is done");
  assert.ok(w.store.state.sessionDrops.includes(sid), "by dropCaptureSession, the only removal capture keeps (K4489)");
  const imgsFetched = fetched.filter((u) => /\/img\//.test(u));
  assert.equal(imgsFetched.length, 120, "every file was fetched");
  assert.equal(new Set(imgsFetched).size, 120, "none twice");
  /* the re-park of the alarm's own ticks registered nothing new */
  assert.equal(L.log.length, 1);
});

test("R100 (F5) control: without the plane's ledger the session expires at its hour as before, and a member's continue is told no such session; a member's continue before the hour still resumes", async () => {
  const w = world();
  w.store.recordCaptureLimit({ runtime: "subrequests", observed: 100 });
  const routes = bigRoutes(120);
  const first = await run(w, routes, { locator: `${O}/big.html`, subresources: true });
  const sid = first.body.snapshot.continuation.session;
  assert.equal(w.store.state.sessionSaves[0].ttlMs, undefined, "the default hour");
  const soon = await run(w, routes, { locator: `${O}/big.html`, subresources: true, continue: sid });
  assert.equal(soon.body.ok, true, "within the hour a continue resumes");
  w.store.state.clockMs = Date.now() + 61 * MIN;
  const late = await run(w, routes, { locator: `${O}/big.html`, subresources: true, continue: sid });
  assert.ok(late.body.snapshot === undefined || late.body.subresources_skipped, "past the hour it is gone");
  const r = await owedRun(w.store, { kind: "subresources", session: sid }, {});
  assert.deepEqual([r.ok, r.done, r.reason], [true, true, "NO_SUCH_SESSION"], "an entry whose session is gone has nothing left to do");
});

test("R100 (F5): a member's continue while the work is owed registers the entry again (the ledger re-arms it) and a complete walk leaves nothing owed", async () => {
  const w = world();
  const L = ledger();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = L.owedLater;
  w.store.recordCaptureLimit({ runtime: "subrequests", observed: 100 });
  const routes = bigRoutes(120);
  const first = await run(w, routes, { locator: `${O}/big.html`, subresources: true });
  const sid = first.body.snapshot.continuation.session;
  const next = await run(w, routes, { locator: `${O}/big.html`, subresources: true, continue: sid });
  assert.equal(next.body.ok, true);
  const parked = next.body.snapshot.continuation;
  assert.deepEqual(L.log.map((e) => e.session), parked ? [sid, sid] : [sid], "re-registered while outstanding");
  /* control: a page that needs no session registers nothing */
  const w2 = world();
  const L2 = ledger();
  // fixtures-contract: plane owed-ledger
  w2.store.owedLater = L2.owedLater;
  const small = await run(w2, bigRoutes(3), { locator: `${O}/big.html`, subresources: true });
  assert.equal(small.body.snapshot.complete, true);
  assert.deepEqual(L2.log, []);
});

/* ---------- the pending render ---------- */

const SHELL = HTML("<div id=app></div>");
const RENDERED_PAGE = HTML("<p>rendered</p>");
const R_ANSWER = (url) => ({ ok: true, html: RENDERED_PAGE, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: RENDER_DEFAULTS.wait, fired: "networkidle" } });
const neverRenderer = () => ({ RENDERER: { fetch: async () => new Promise(() => {}) } });
const answeringRenderer = () => { const calls = []; return { calls, RENDERER: { fetch: async (u, init) => { const q = JSON.parse(init.body); calls.push(q); return new Response(JSON.stringify(R_ANSWER(q.url))); } } }; };

test("R100 R99 (F5): a pending render is owed work: parked past its hour, finished by the alarm after the object lost the run, its document handed to deliver, the session dropped only once it is delivered", async () => {
  const PG = "https://r.example/pending";
  const w = world({ env: neverRenderer() });
  const L = ledger();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = L.owedLater;
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  assert.deepEqual(L.log, [{ kind: "subresources", sha: first.body.document.capture.sha256, session: sid }]);
  assert.equal(w.store.state.sessionSaves[0].ttlMs, OWED_SESSION_TTL_MS);
  w.store.state.clockMs = Date.now() + 61 * MIN;
  const fresh = await import("../../../src/acquisition/index.mjs?restart=owed");   // the object restarted: an empty render table
  const env2 = answeringRenderer();
  w.store.env.RENDERER = env2.RENDERER;
  const net = (await import("./fixture.mjs")).network({ [PG]: () => page(SHELL) });
  const delivered = [];
  try {
    /* no deliver handed: the render is not begun, the session stays for the member's Finish it */
    const idle = await fresh.owedRun(w.store, L.entries.get(sid), {});
    assert.deepEqual([idle.ok, idle.done], [true, false]);
    assert.equal(env2.calls.length, 0, "nothing rendered without a way to deliver it");
    assert.ok(w.store.state.sessions.has(sid));
    /* a delivery that is refused leaves the session */
    const refused = await fresh.owedRun(w.store, L.entries.get(sid), { deliver: async () => ({ ok: false }) });
    assert.deepEqual([refused.ok, refused.done, refused.reason], [true, false, "DELIVERY_REFUSED"]);
    assert.ok(w.store.state.sessions.has(sid), "kept: the visitor copy is not lost");
    // fixtures-contract: control-plane deliver-owed
    const ok = await fresh.owedRun(w.store, L.entries.get(sid), { deliver: async (d) => { delivered.push(d); return { ok: true }; } });
    assert.deepEqual([ok.ok, ok.done], [true, true]);
  } finally { net.restore(); }
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0].session, sid);
  assert.equal(delivered[0].answer.document.capture.method, "rendered");
  assert.equal(delivered[0].answer.document.capture.sha256, sha(RENDERED_PAGE));
  assert.equal(w.store.state.sessions.has(sid), false, "dropped once delivered");
});

test("R100 R99 (F5) control: a render the object lost that does not come back ends the entry with its stated reason and closes the session", async () => {
  const PG = "https://r.example/lost";
  const w = world({ env: neverRenderer() });
  const L = ledger();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = L.owedLater;
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  const fresh = await import("../../../src/acquisition/index.mjs?restart=owed2");
  const net = (await import("./fixture.mjs")).network({ [PG]: () => page(SHELL) });
  let r;
  // fixtures-contract: control-plane deliver-owed
  try { r = await fresh.owedRun(w.store, L.entries.get(sid), { deliver: async () => ({ ok: true }), renderWaitMs: 30 }); }
  finally { net.restore(); }
  assert.deepEqual([r.ok, r.done, r.final, r.reason], [true, true, true, "RENDER_FAILED"]);
  assert.equal(w.store.state.sessions.has(sid), false);
});

/* ---------- an unpack stopped by a budget ---------- */

const many = (n, tag = "f") => makeZip(Array.from({ length: n }, (_, i) => ({ name: `${tag}${i}.txt`, data: `${tag} ${i}` })));
const zipAt = (w, bytes, url = "https://files.example/many.zip", opts = {}) =>
  run(w, { [url]: () => new Response(bytes, { headers: { "content-type": "application/zip" } }) }, { locator: url }, opts);
const today = () => new Date().toISOString().slice(0, 10);

test("R100 (F11): an automatic unpack that stops on a daily budget, or for the call's share, or by a nested archive it may open, is an owed `unpack` entry; with no ledger it is the archive-unpack event as before; a stop on the tree is not owed", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-03-04T12:00:00.000Z") });
  /* the daily budget */
  const w = world();
  const L = ledger();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = L.owedLater;
  w.rows("INSERT INTO unpack_days (day, entries, bytes) VALUES (?, 0, 0)", today());
  w.rows("UPDATE unpack_days SET entries=? WHERE day=?", UNPACK_DAILY_ENTRIES, today());
  const z = many(3, "daily");
  const r = await zipAt(w, z);
  assert.equal(r.body.unpack.waiting_on.code, "UNPACK_DAILY_ENTRIES");
  assert.deepEqual(oneRow(L.log), [{ kind: "unpack", sha: sha(z) }], "owed until the day's figures start again");
  assert.deepEqual(w.store.state.events.filter((e) => e.kind === "archive-unpack"), [], "and no event beside it");
  /* the call's share */
  const w2 = world();
  const L2 = ledger();
  // fixtures-contract: plane owed-ledger
  w2.store.owedLater = L2.owedLater;
  const big = many(UNPACK_CALL_ENTRIES + 50, "share");
  const r2 = await zipAt(w2, big);
  assert.equal(r2.body.unpack.waiting, 50);
  assert.deepEqual(oneRow(L2.log), [{ kind: "unpack", sha: sha(big) }]);
  /* the handed hook of the call is the one used, over the store's */
  const w3 = world();
  const L3 = ledger();
  const r3 = await zipAt(w3, many(UNPACK_CALL_ENTRIES + 50, "opt"), "https://files.example/opt.zip", { owedLater: L3.owedLater });
  assert.equal(r3.body.unpack.waiting, 50);
  assert.equal(oneRow(L3.log).length, 1);
  /* a stop on the tree's figure is not owed: it never shrinks, only a member goes past it (R40), and the archive's page states it */
  const w4 = world();
  const L4 = ledger();
  // fixtures-contract: plane owed-ledger
  w4.store.owedLater = L4.owedLater;
  const tz = many(150, "tree");
  await zipAt(w4, tz);
  assert.deepEqual(oneRow(L4.log), [{ kind: "unpack", sha: sha(tz) }], "the share's stop of the first run");
  w4.rows("UPDATE archive_entries SET tree_entries=? WHERE archive_sha=? AND idx=-1", ARCHIVE_TREE_ENTRIES_MAX - 1, sha(tz));
  promoteFiled(w4);
  const d4 = await unpack(w4.store, { archiveSha: sha(tz), cls: "daemon" });
  assert.equal(d4.waiting_on.code, "ARCHIVE_TREE_ENTRIES_MAX");
  assert.equal(oneRow(L4.log).length, 1, "nothing new is owed for the tree's stop");
  /* controls: no ledger, the event as before; a complete unpack owes nothing */
  const c = world();
  const rc = await zipAt(c, many(UNPACK_CALL_ENTRIES + 50, "ev"));
  assert.deepEqual(c.store.state.events.filter((e) => e.kind === "archive-unpack").map((e) => e.captureSha), [sha(many(UNPACK_CALL_ENTRIES + 50, "ev"))]);
  assert.equal(rc.body.unpack.waiting, 50);
  const d = world();
  const Ld = ledger();
  // fixtures-contract: plane owed-ledger
  d.store.owedLater = Ld.owedLater;
  const zd = many(3, "done");
  await zipAt(d, zd);
  /* R116 (fix round 9) reverses the old `[]`: an `acquire` of a ZIP registers its `unpack` row before it answers, the open being the job; no continuation row is added beyond it */
  assert.deepEqual(oneRow(Ld.log), [{ kind: "unpack", sha: sha(zd) }]);
  assert.equal(Ld.log.length, 1);
});

/* ---------- the acquire arm's keep, exported for capture ---------- */

test("R96 R100 (F2): keepPast awaits the store's putFromParts within the bound and answers kept; one that outlasts the bound is handed to keepLater with the part digests and answers keep_pending; a store with no such call starts nothing", async () => {
  const parts = ["a", "b", "c"].map((c) => c.repeat(64).replace(/[^0-9a-f]/g, "a").slice(0, 64));
  const whole = "f".repeat(64);
  const evFast = { putFromParts: async () => ({ ok: true }) };
  const later = [];
  // fixtures-contract: plane keep-later
  const kept = await keepPast({}, evFast, { sha: whole, parts, boundMs: 25000, elapsedMs: 0, keepLater: async (k) => { later.push(k); return { ok: true }; } });
  assert.deepEqual([kept.started, kept.kept, kept.keep_pending], [true, true, false]);
  assert.deepEqual(later, []);
  const evSlow = { putFromParts: async () => { await sleep(300); return { ok: true }; } };
  const slow = await keepPast({}, evSlow, { sha: "e".repeat(64), parts: parts.map((p) => ({ sha256: p })), boundMs: 5100, elapsedMs: 0,
                                           // fixtures-contract: plane keep-later
                                           keepLater: async (k) => { later.push(k); return { ok: true }; } });
  assert.deepEqual([slow.started, slow.kept, slow.keep_pending], [true, false, true]);
  assert.deepEqual(later, [{ sha: "e".repeat(64), parts }]);
  const none = await keepPast({}, {}, { sha: whole, parts });
  assert.deepEqual([none.started, none.kept, none.keep_pending], [false, false, false]);
  /* a keepLater the store carries is used when none is handed */
  const stored = [];
  // fixtures-contract: plane keep-later
  const viaStore = await keepPast({ keepLater: async (k) => { stored.push(k); return { ok: true }; } }, { putFromParts: async () => { await sleep(300); return { ok: true }; } },
                                  { sha: "d".repeat(64), parts, boundMs: 5100 });
  assert.equal(viaStore.keep_pending, true);
  assert.equal(stored.length, 1);
});

test("R100: acquire is exported with owedRun; owedRun refuses a malformed entry and never throws", async () => {
  const w = world();
  assert.equal(typeof acquire, "function");
  for (const bad of [null, {}, { kind: "keep", session: "x" }, { kind: "subresources" }]) {
    const r = await owedRun(w.store, bad, {});
    assert.deepEqual([r.ok, r.reason], [false, "OWED_MALFORMED"]);
  }
  const broken = await owedRun({ loadCaptureSession() { throw new Error("boom"); } }, { kind: "subresources", session: "cs_x" }, {});
  assert.deepEqual([broken.ok, broken.reason], [false, "OWED_RUN_FAILED"]);
});
