/* acquisition R118 (T51 fix round 9, G137c, X23; DOCS V4-V7): A FAILED VISITOR RENDER IS CHARGED ITS REAL TIME AND JUDGED BY WHAT CAME BACK.
   The reservation of a failed render is released with its real elapsed time; a page that answered 400 or more, a `chrome-error://` location,
   an empty shell or a page over the render-DOM bound is RENDER_FAILED and nothing is filed in its place; a `transient` failure is tried up to
   `RENDER_TRIES` times with back-off, a `permanent` one once, final. Through the real `acquire` with `render` over a scripted renderer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, HTML, page } from "./fixture.mjs";
import { RENDER_TRIES } from "../../../src/acquisition/index.mjs";
import { renderFailure } from "../capture-sources/fixtures.mjs";

const PG = "https://r.example/p";
const SHELL = HTML("<div id=app></div>");
const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio", renderBackoffMs: [0, 0] };
const OK = (over = {}) => ({ ok: true, html: HTML("<main><p>rendered words</p></main>"), elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: PG, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" }, ...over });
/* a renderer answering the scripted answers in turn (the last repeats) and counting its calls */
function scripted(answers) {
  const calls = []; let i = 0;
  const w = world({ env: { RENDERER: { fetch: async (u, init) => { calls.push(JSON.parse(init.body)); const a = answers[Math.min(i++, answers.length - 1)]; return new Response(JSON.stringify(a)); } } } });
  return { w, calls };
}
/* the failed answers the real render driver gives (capture-sources); the time an answer states is the driver's own measurement */
const NO_SESSION = await renderFailure({ class: "no_session" });          /* permanent */
const REFUSED = await renderFailure({ class: "session_refused" });        /* transient */
const OPEN_BOUND = await renderFailure({ class: "open_bound" });          /* transient, the open bound spent */
const press = (w) => run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { settle: false, ...member });

test("R118: a permanent failure is charged the time it took (not the whole reservation), tried once, and answers RENDER_FAILED with its class; nothing is filed", async () => {
  const { w, calls } = scripted([NO_SESSION]);
  const r = await press(w);
  assert.equal(r.status, 502);
  assert.equal(r.body.reason, "RENDER_FAILED");
  assert.equal(r.body.failure_class, "permanent");
  assert.equal(calls.length, 1);
  const spends = w.store.state.spends;
  assert.equal(spends.length, 1);
  assert.equal(spends[0].ms, NO_SESSION.elapsed_ms, "the real elapsed time is charged");
  assert.ok(spends[0].releaseMs > NO_SESSION.elapsed_ms, "the reservation is released whole");
  assert.equal(r.body.document, undefined);
});

test("R118: a transient failure is retried with back-off up to RENDER_TRIES; a render that then succeeds is filed and every attempt's time is charged", async () => {
  const { w, calls } = scripted([OPEN_BOUND, REFUSED, OK()]);
  const r = await press(w);
  assert.equal(r.status, 200);
  assert.equal(calls.length, 3);
  assert.equal(w.store.state.spends.length, 1);
  assert.equal(w.store.state.spends[0].ms, OPEN_BOUND.elapsed_ms + REFUSED.elapsed_ms + 12);
});

test("R118: a transient failure that never passes is tried RENDER_TRIES times, then RENDER_FAILED with class transient, the time of all tries charged", async () => {
  assert.equal(RENDER_TRIES, 3);
  const { w, calls } = scripted([OPEN_BOUND]);
  const r = await press(w);
  assert.equal(r.status, 502);
  assert.equal(r.body.failure_class, "transient");
  assert.equal(calls.length, 3);
  assert.equal(w.store.state.spends[0].ms, OPEN_BOUND.elapsed_ms * RENDER_TRIES);
});

test("R118 (V5): a page that answered 403, a chrome-error:// location and an empty shell are not filed as the document: RENDER_FAILED, permanent, stated", async () => {
  for (const over of [{ status: 403 }, { status: 404 }, { navigated_to: "chrome-error://chromewebdata/" }, { html: HTML("") }]) {
    const { w, calls } = scripted([OK(over)]);
    const r = await press(w);
    assert.equal(r.status, 502, JSON.stringify(over));
    assert.equal(r.body.reason, "RENDER_FAILED");
    assert.equal(r.body.failure_class, "permanent");
    assert.equal(r.body.document, undefined);
    assert.equal(calls.length, 1, "a permanent failure is not retried");
  }
});

test("R118 (V4): a page whose serialised DOM is over the render-DOM bound (READ_BOUNDS render.dom_bytes) is not filed: RENDER_FAILED stated with its size and the bound", async () => {
  const big = HTML(`<main>${"x".repeat(26 * 1024 * 1024)}</main>`);
  const { w } = scripted([OK({ html: big })]);
  const r = await press(w);
  assert.equal(r.status, 502);
  assert.equal(r.body.reason, "RENDER_FAILED");
  assert.match(r.body.detail, /26\d{6}/);
  assert.match(r.body.detail, /26214400/);
});

test("R118 (control): a render that succeeds is charged its real elapsed time as before and filed", async () => {
  const { w } = scripted([OK()]);
  const r = await press(w);
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.method, "rendered");
  assert.equal(w.store.state.spends[0].ms, 12);
});
