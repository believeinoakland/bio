/* control-plane (fix round 8, K4427; R-SEAM, R-ONE): THE CAPTURE FAMILY'S SEAM SECTIONS (G103, G104, G105, G108, G109), through the real plane under Miniflare
   (Worker, Durable Object, alarm, R2): each a member's own acts through the door, every input made by the acts, never a hand-written answer shape. They are written
   FIRST and stay RED BY NAME until their providers have merged (acquisition for G103-G105; screens-intake for G108, G109). `sections(kit)` registers them over the kit
   `makeKit` answers. A wait is a test-side poll (R-CLOCK); a count or a state is asserted, never a duration (R-NOLOAD). A sentence is read from the word table
   (`word`), never copied (K3810). */
import { OPS } from "../../../src/op-declarations/index.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { boot, ok, MEMBER } from "../interface-shell/harness.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

/* the screens' own page over the interface-shell harness (what screens-intake's `page.mjs` does, without its second registration of the declared ops, which the kit has made) */
const DOCUMENT_STUB = Object.freeze({ id: "document", reads: () => ({}), render: () => "", acts: Object.freeze([]), words: Object.freeze([]) });
const openPage = async (path, { plane = {}, screens = SCREENS } = {}) => { const p = await boot({ screens, path, plane: { whoami: ok(MEMBER), ...plane } }); await p.settle(); return p; };
const main = (p) => p.doc.getElementById("cs-main");
function fill(p, values = {}) {
  for (const [id, v] of Object.entries(values)) {
    const el = p.doc.getElementById(id);
    if (!el) throw new Error(`no field ${id}: ${(main(p) && main(p).textContent || "").slice(0, 400)}`);
    el.value = v;
  }
}
async function press(p, op) {
  const b = main(p).querySelector(`button[data-act="${op}"]`);
  if (!b) throw new Error(`no act ${op} drawn`);
  await p.click(b);
  for (let i = 0; i < 12; i++) { await p.settle(20); await new Promise((r) => setTimeout(r, 2)); }
}

const HELD_ELSEWHERE = "CAPTURE_HELD_BY_ANOTHER_BUNDLE";

export function sections(kit) {
  const { get, acquire, until, later, sha, serve, pdfOf, person, founder, projectOf, screenCall, MB } = kit;
  const body = (a) => (a && a.result !== undefined ? a.result : a);
  const stamp = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  /* a large PDF served at a pace under a fresh name; its address is the member's press */
  function served(label, size, rate) {
    const name = `R8-${label}-${stamp()}.pdf`;
    const bytes = pdfOf(`R8 ${label} the budget volume the clerk read ${stamp()}`, size);
    /* the kit's filler is the same for every file of a size; a delivery of a second file whose filler is the same is refused by the record (found at the first run), so each
       file's filler is made its own: 20000 bytes of the filler's stream, none of the pages' */
    let x = (Date.now() % 1000003) + Math.floor(Math.random() * 1e6) + 7;
    for (let i = 0; i < 20000; i++) { x = (x * 1664525 + 1013904223) >>> 0; bytes[3000 + (x % (bytes.length - 6000))] = 0x41 + ((x >>> 24) % 26); }
    serve(name, bytes, { rate });
    return { name, bytes, locator: `https://www.example.gov/files/${name}`, sha: sha(bytes) };
  }
  const heldAt = async (auth, locator) => body(await get(auth, { op: "heldat", address: locator }));
  const openList = async (auth) => (body(await get(auth, { op: "opencaptures" })) || {}).captures || [];

  /* the Add screen's watch (`watchFetch`) over the real plane: its `cs` is the door's (`screenCall`), its timer fires after 1 s, and the state object is the one the
     screen keeps (`view.ui`); every op the watch asks is counted */
  function watching(auth, { session, address, title = "the capture", filed = null }) {
    const base = screenCall(auth);
    const state = { captured: { title, address, bundleId: null, sha: "", filed, fetching: { session, bytes: null, why: "" } } };
    const asked = [];
    let live = 0, thrown = null;
    const view = { ui: state, parts: CAPTURE_SCREEN.parts };
    const cs = {
      now: base.now, digest: base.digest,
      call: (op, a) => { asked.push(op); return base.call(op, a); },
      set: (k, v) => { state[k] = v; },
      w: (k, v) => word(k, v),
      esc: (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
      date: (d) => String(d),
      later: (ms, fn) => { live++; setTimeout(async () => { try { await fn(cs, view); } catch (e) { thrown = e; } finally { live--; } }, 1000); },
    };
    CAPTURE_SCREEN.parts.watchFetch(cs, { session, address, title, filed, finish: "" });
    const ended = (ms = 170000) => until(async () => (live === 0 ? true : null), ms, 500);
    return { state, asked, cs, ended, thrown: () => thrown, count: (op) => asked.filter((x) => x === op).length };
  }

  /* ---- A (G103): an enrolled member's large capture is listed from the press until the document is delivered ---- */
  async function listedUntilDelivered(auth, f) {
    const press = await acquire(auth, { locator: f.locator });
    assert.equal(press.status, 200, JSON.stringify(press.body).slice(0, 400));
    const session = press.body.fetch_pending && press.body.fetch_pending.session;
    assert.ok(session, "the press is a fetch pending: " + JSON.stringify(press.body).slice(0, 400));
    const seen = [];
    let delivered = null;
    const end = Date.now() + 120000;
    while (Date.now() < end) {
      const list = await openList(auth);
      const h = await heldAt(auth, f.locator);
      if (h && h.held === true) { delivered = h; break; }
      const mine = list.find((c) => c && c.session === session);
      seen.push({ at: seen.length, listed: !!mine, pending: !!(mine && mine.fetch_pending) });
      await later(1000);
    }
    if (!delivered && process.env.R8_DEBUG) console.log("DEBUG A1 rows", JSON.stringify(body(await get(await founder(), { op: "owedwork", sha: session }))).slice(0, 2500));
    assert.ok(delivered, "the document is delivered within 120 s");
    const unlisted = seen.filter((x) => !(x.listed && x.pending));
    assert.equal(unlisted.length, 0, `at every poll before the delivery the session is listed with fetch_pending; not so at polls ${unlisted.map((x) => x.at).join(",")} of ${seen.length}`);
    assert.ok(seen.length >= 1, "at least one poll was made before the delivery");
    /* after the delivery the session leaves the list */
    const gone = await until(async () => ((await openList(auth)).some((c) => c && c.session === session) ? null : true), 60000, 1000);
    assert.ok(gone, "after the delivery the session is no longer listed");
    return { session, seen };
  }

  test("R8 (A1): an enrolled member's large capture is listed by `opencaptures` from the press until the document is delivered", { timeout: 600000 }, async () => {
    const dee = await person("r8-dee", "member", ["contribute"]);
    await listedUntilDelivered(dee, served("a1", 14 * MB - 100000, 2 * MB));
  });

  test("R8 (A1 control): the founder's identical press is listed from the press until the document is delivered (green before and after)", { timeout: 600000 }, async () => {
    await listedUntilDelivered(await founder(), served("a1f", 14 * MB - 100000, 2 * MB));
  });

  /* ---- A1b (G103): the Add screen's watch over the real plane ends in the finished line ---- */
  test("R8 (A1b): the Add screen's watch over the real plane ends in the finished line", { timeout: 600000 }, async () => {
    const dee = await person("r8-dee", "member", ["contribute"]);
    const f = served("a1b", 14 * MB - 100000, 2 * MB);
    const press = await acquire(dee, { locator: f.locator });
    assert.equal(press.status, 200, JSON.stringify(press.body).slice(0, 400));
    const session = press.body.fetch_pending && press.body.fetch_pending.session;
    assert.ok(session, "a fetch pending: " + JSON.stringify(press.body).slice(0, 300));
    const w = watching(dee, { session, address: f.locator });
    assert.ok(await w.ended(), "the watch ended within 170 s");
    assert.equal(w.thrown(), null, "the watch threw: " + (w.thrown() && w.thrown().message));
    assert.equal(w.state.promoteRefused, undefined, "the watch never set promoteRefused: " + JSON.stringify(w.state.promoteRefused));
    const h = await heldAt(dee, f.locator);
    assert.equal(h.held, true, "the document is held");
    assert.ok(w.state.captured && w.state.captured.bundleId, "the screen's state names the filed document: " + JSON.stringify(w.state.captured));
    assert.equal(w.state.captured.bundleId, h.copy.document, "captured.bundleId is the filed bundle");
    assert.ok(w.count("opencaptures") > 3, `opencaptures was asked more than three times before the end (asked ${w.count("opencaptures")})`);
  });

  /* ---- G108, G109: the Add screen itself, over the real plane. The page is the screens' own (interface-shell's harness and DOM stand-in); each op it asks goes to the
     real plane as the member, and the page's clock is ticked while the real alarm delivers ---- */
  const FORWARDED = Object.keys(OPS);   /* every op the door declares, answered by the plane (K3268: no hand list) */
  async function addScreenOf(auth, path) {
    const asked = [], seen = {};
    const plane = {};
    for (const op of FORWARDED) {
      plane[op] = async (req) => {
        asked.push(op);
        const q = new URLSearchParams({ ...req.query, op });
        const res = await kit.plane(`/api/?${q}`, { method: req.body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" }, ...(req.body === undefined ? {} : { body: JSON.stringify(req.body) }) });
        const json = await res.json();
        if (op === "acquire" && json && json.fetch_pending) seen.session = json.fetch_pending.session;
        return { status: res.status, json };
      };
    }
    const p = await openPage(path, { plane, screens: [...SCREENS, DOCUMENT_STUB] });
    return { p, asked, seen };
  }
  /* the screen's watch is ticked on the page's clock, with real time between for the plane to answer, until the working line is gone */
  async function watchedToTheEnd(p, auth, locator) {
    /* the page's clock is not ticked until the alarm has delivered the document (a test-side poll): the screen's own give-up after misses (G103) is that cause's test, not these */
    const arrived = await until(async () => { const h = await heldAt(auth, locator); return h && h.held === true ? true : null; }, 170000, 1000);
    if (!arrived) { if (process.env.R8_DEBUG) console.log("DEBUG not delivered", JSON.stringify(body(await get(await founder(), { op: "owedwork", sha: globalThis.__r8seen.session }))).slice(0, 1500)); return false; }
    const end = Date.now() + 120000;
    for (;;) {
      const m = main(p);
      if (!m.querySelector("[data-fetching]") && (m.querySelector("[data-fetched]") || m.querySelector("[data-state=failed]"))) return true;
      if (Date.now() > end) return false;
      await p.clock.tick(4000);
      for (let i = 0; i < 4; i++) await p.settle(20);
      await later(1500);
    }
  }
  /* a project-less member's press of a large PDF on the Add screen, watched to the finished line */
  async function pressedAndWatched(handle, label) {
    const auth = await person(handle, "member", ["contribute"]);
    const f = served(label, 10 * MB, 3 * MB);
    const { p, asked, seen } = await addScreenOf(auth, "/app/capture/address");
    /* the real plane answers in real time: the page is given it until the field is drawn */
    await until(async () => { await p.settle(20); return p.doc.getElementById("ci-address") ? true : null; }, 60000, 300);
    fill(p, { "ci-address": f.locator });
    await press(p, "acquire");
    /* the real plane answers in real time: the page is given it */
    await until(async () => { await p.settle(20); return main(p).querySelector("[data-fetching],[data-fetched],[data-state=failed]") ? true : null; }, 60000, 300);
    if (process.env.R8_DEBUG) console.log("DEBUG after press", asked.join(","), main(p).textContent.slice(0, 1500));
    assert.equal(main(p).querySelectorAll("[data-fetching]").length, 1, "the press drew the being-fetched line (the plane answered fetch_pending)");
    globalThis.__r8seen = seen;
    assert.ok(await watchedToTheEnd(p, auth, f.locator), "the watch ended within 170 s: " + main(p).textContent.slice(0, 400));
    return { auth, f, p, asked };
  }

  test("R8 (G108): a project-less capture watched to delivery draws a finished line with no empty fill", { timeout: 900000 }, async () => {
    const { p } = await pressedAndWatched("r8-gus", "g108");
    const line = main(p).querySelector("[data-fetched]");
    assert.ok(line, "the finished line is drawn: " + main(p).textContent.slice(0, 400));
    const link = line.querySelector("a");
    assert.ok(link && /INFO-/.test(String(link.getAttribute("href"))), "the finished line holds the document's link");
    /* the empty fill: the done row with its project placeholder rendered as nothing, around the very link text drawn */
    const empty = word("screen.capture.fetch.done", { document: link.textContent, project: "" });
    const drawn = line.textContent.replace(/\s+/g, " ").trim();
    assert.ok(!drawn.includes(empty.replace(/\s+/g, " ").trim()), `the finished line has the project placeholder drawn as nothing: ${drawn}`);
  });

  test("R8 (G109): a second press of the same address names the compared copy by the stored title", { timeout: 900000 }, async () => {
    const { auth, f, p } = await pressedAndWatched("r8-gwen", "g109");
    const stored = (await heldAt(auth, f.locator)).copy.title;
    assert.ok(stored && stored.length > 0, "heldat states a title for the delivered copy");
    /* the real plane answers in real time: the page is given it until the field is drawn */
    await until(async () => { await p.settle(20); return p.doc.getElementById("ci-address") ? true : null; }, 60000, 300);
    fill(p, { "ci-address": f.locator });
    await press(p, "acquire");
    await until(async () => { await p.settle(20); return main(p).querySelector(".rec,[data-state=failed]") ? true : null; }, 60000, 300);
    const rec = main(p).querySelector(".rec");
    assert.ok(rec, "the already-in-the-record row is drawn: " + main(p).textContent.slice(0, 500));
    assert.ok(rec.textContent.includes(stored), `the row names the document by the stored title (${stored}); it says: ${rec.textContent}`);
    assert.ok(!rec.textContent.includes(new URL(f.locator).hostname), `the row is not the host-and-day fallback: ${rec.textContent}`);
  });

  /* A2 runs last: its refused row is retried for ever until the fix, and the plane's one fetch consumer would hold the other sections back */
  /* ---- A2 (G105): bytes held in a project she cannot see end in words, not in a retry ---- */
  const owedRow = async (admin, session) => {
    const r = body(await get(admin, { op: "owedwork", sha: session })) || {};
    return { row: (r.owed || []).find((x) => x && x.sha === session) || null, answer: r };
  };
  test("R8 (A2): a member's large capture of bytes held in a project she cannot see ends in words, not in a retry", { timeout: 900000 }, async () => {
    const admin = await founder();
    const eve = await person("r8-eve", "member", ["contribute"]);
    const project = await projectOf(admin, `Round eight held project ${stamp()}`);
    const f = served("a2", 12 * MB, 3 * MB);
    const first = await acquire(admin, { locator: f.locator, project });
    assert.equal(first.status, 200, JSON.stringify(first.body).slice(0, 400));
    assert.ok(first.body.fetch_pending, "the founder's press is parked: " + JSON.stringify(first.body).slice(0, 300));
    const held = await until(async () => (JSON.stringify(body(await get(admin, { op: "heldcaptures", project }))).includes(f.sha) ? true : null), 180000, 2000);
    assert.ok(held, "the founder's copy is delivered into the project");
    const second = await acquire(eve, { locator: f.locator });
    assert.equal(second.status, 200, JSON.stringify(second.body).slice(0, 400));
    const session = second.body.fetch_pending && second.body.fetch_pending.session;
    assert.ok(session, "the member's press of the same address is a fetch pending: " + JSON.stringify(second.body).slice(0, 300));
    const w = watching(eve, { session, address: f.locator });
    /* within 60 s the row has ended with the refusal's code */
    let last = null;
    const ended = await until(async () => {
      last = await owedRow(admin, session);
      return last.row && (last.row.state !== "owed" || last.row.final === true) ? true : null;
    }, 60000, 2000);
    const why = last && last.row ? last.row.why : null;
    assert.ok(ended, `the ledger row ended within 60 s; it is ${last && last.row ? `state ${last.row.state}, attempts ${last.row.attempts}, why ${last.row.why}` : "absent"}`);
    assert.notEqual(why, "DELIVERY_REFUSED", "the row's why is not the swallowed DELIVERY_REFUSED");
    assert.equal(why, HELD_ELSEWHERE, "the row states the refusal's own code");
    /* the member's listing carries it as failed */
    const mine = (await openList(eve)).find((c) => c && c.session === session);
    assert.ok(mine, "the session is listed for the member");
    assert.ok(mine.fetch_pending && typeof mine.fetch_pending === "object", "listed as fetch_pending: " + JSON.stringify(mine).slice(0, 300));
    assert.equal(mine.fetch_pending.failed, HELD_ELSEWHERE, "fetch_pending.failed states the code: " + JSON.stringify(mine.fetch_pending));
    /* the watch ends in that code's words */
    assert.ok(await w.ended(), "the watch ended: it asks opencaptures and finds " + JSON.stringify(mine) + ", and the screen reads the refusal from the listed session's top-level failed (watchFetch, the Unfinished line), not from fetch_pending.failed");
    const words = CAPTURE_SCREEN.parts.refusalHtml(w.cs, { code: HELD_ELSEWHERE });
    assert.ok(words, "the refusal has words");
    assert.ok(w.state.promoteRefused, "the watch ended in a refusal");
    /* the screen names the address the fetch was of before the words (screens-intake R49): the words are what ends it */
    assert.ok(w.state.promoteRefused.html === words || w.state.promoteRefused.html.endsWith(` · ${words}`), "the refusal is the held-elsewhere words");
    assert.notEqual(w.state.promoteRefused.html, word("refusal.FETCH_FAILED"), "not the fetch-failed words");
  });

  test("R8 (A2 control): the same member pressing an address nobody holds is delivered and told by a `fetch-done` item in her queue (green before and after)", { timeout: 900000 }, async () => {
    const eve = await person("r8-eve", "member", ["contribute"]);
    const f = served("a2c", 12 * MB, 3 * MB);
    const press = await acquire(eve, { locator: f.locator });
    assert.equal(press.status, 200, JSON.stringify(press.body).slice(0, 400));
    assert.ok(press.body.fetch_pending, "parked: " + JSON.stringify(press.body).slice(0, 300));
    const held = await until(async () => { const h = await heldAt(eve, f.locator); return h && h.held === true ? true : null; }, 180000, 2000);
    assert.ok(held, "the document is delivered");
    let seen = "";
    const told = await until(async () => { seen = JSON.stringify(await get(eve, { op: "queue" })); return seen.includes("fetch-done") ? true : null; }, 180000, 3000);
    assert.ok(told, "a fetch-done item is in her queue: " + seen.slice(0, 400));
  });
}
