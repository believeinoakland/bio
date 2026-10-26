/* acquisition R100, R104, R46 (T51 fix round 7, G72): A VISITOR-VIEW RENDER THAT FAILS KEEPS ITS DETAIL. The ledger row of acadia's visitor view ended
   `final`, `why RENDER_FAILED`, with nothing to say why (A G3/G27): `owedRun` answered the stated reason alone, and the render's problem, which
   `acquire` had in its refusal, was dropped with the session. The detail (the problem, cut to a bound, no page text) now rides the end of the entry,
   and one structured line `{event: "render_failed", problem, ms}` names the cause on the log, so the one redeploy names why a render fails (K4428).
   The session an ended entry drops is no longer listed for the member (R46), and "Finish it" on it answers `NO_SUCH_SESSION` (the dead end the
   screen now ends, screens-intake's). Failing first: `owedRun` answered no `detail`, and logged nothing. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, network, HTML, page } from "./fixture.mjs";
import { acquire, owedRun, openCaptures } from "../../../src/acquisition/index.mjs";
import { renderFailure } from "../capture-sources/fixtures.mjs";

const SHELL = HTML("<div id=app>the served shell, a page's own text</div>");
const PG = "https://r.example/acadia";
const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio" };
const FAILED = await renderFailure({ class: "no_session" });   /* the answer the real render driver gives (capture-sources) */
const WHY = FAILED.error;
const OK_ANSWER = (url) => ({ ok: true, html: HTML("<p>rendered</p>"), elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } });

/* a renderer that answers, once its gate is opened, the failure (or a render, for the control), and the plane's ledger as a map */
function pending(answer) {
  let open; const gate = new Promise((r) => (open = r));
  const w = world({ env: { RENDERER: { fetch: async (u, init) => { await gate; return new Response(JSON.stringify(typeof answer === "function" ? answer(JSON.parse(init.body).url) : answer)); } } } });
  const entries = new Map();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async (e) => { entries.set(e.session, e); return { ok: true }; };
  return { w, entries, open };
}
const begin = async (p) => {
  const first = await run(p.w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  return first.body.document.render_pending.session;
};
/* the alarm's run, over the scripted network the owed finish fetches the served page from */
// fixtures-contract: control-plane deliver-owed
async function alarm(p, sid, opts = { deliver: async () => ({ ok: true }) }) {
  const net = network({ [PG]: () => page(SHELL) });
  try { return await owedRun(p.w.store, p.entries.get(sid), opts); } finally { net.restore(); }
}
/* the log lines the call wrote */
async function logged(fn) {
  const lines = [], orig = console.log;
  console.log = (...a) => { lines.push(a.map(String).join(" ")); };
  try { return { out: await fn(), lines }; } finally { console.log = orig; }
}
const events = (lines, name) => lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((x) => x && x.event === name);

test("R100 (G72): an owed visitor view whose render fails ends the entry final with the render's problem as `detail` (cut to a bound, no page text), and logs one structured render_failed line", async () => {
  const p = pending(FAILED);
  const sid = await begin(p);
  p.open();
  await new Promise((r) => setTimeout(r, 50));
  const { out, lines } = await logged(() => alarm(p, sid));
  assert.equal(out.ok, true);
  assert.equal(out.done, true);
  assert.equal(out.final, true);
  assert.equal(out.reason, "RENDER_FAILED", "the stated reason stays the one the ledger and the screens read");
  assert.equal(typeof out.detail, "string", "the problem is kept");
  assert.ok(out.detail.includes(WHY), `the detail names why: ${out.detail}`);
  assert.ok(out.detail.length <= 200, "the detail is cut to a bound");
  assert.ok(!out.detail.includes("the served shell"), "no page text rides the detail");
  const ev = events(lines, "render_failed");
  assert.equal(ev.length, 1, "one structured line");
  assert.ok(String(ev[0].problem).includes(WHY));
  assert.ok(Number.isFinite(ev[0].ms) && ev[0].ms >= 0, "with the milliseconds the render stage ran");
  assert.ok(!JSON.stringify(ev[0]).includes("the served shell"), "the line carries no page text");
});

test("R46 (G72, 3b): after the entry ended final the session is dropped, so the member's open captures no longer list it, and \"Finish it\" on it answers 404 NO_SUCH_SESSION", async () => {
  const p = pending(FAILED);
  const sid = await begin(p);
  assert.equal(openCaptures(p.w.store, { by: "m1" }).captures.some((c) => c.session === sid), true, "listed while the render is owed");
  p.open();
  await new Promise((r) => setTimeout(r, 50));
  const out = await alarm(p, sid);
  assert.equal(out.final, true);
  assert.equal(p.w.store.state.sessions.has(sid), false, "the session is dropped");
  assert.equal(openCaptures(p.w.store, { by: "m1" }).captures.some((c) => c.session === sid), false, "no longer listed: the Add screen's line has nothing to read");
  const again = await acquire(p.w.store, { continue: sid }, member);
  assert.equal(again.status, 404);
  assert.equal(again.body.reason, "NO_SUCH_SESSION");
});

test("R100 (G72) control: a visitor view that renders carries no detail and writes no render_failed line", async () => {
  const p = pending(OK_ANSWER);
  const sid = await begin(p);
  p.open();
  await new Promise((r) => setTimeout(r, 50));
  const { out, lines } = await logged(() => alarm(p, sid));
  assert.deepEqual([out.ok, out.done], [true, true]);
  assert.equal(out.final, undefined);
  assert.equal(out.detail, undefined);
  assert.equal(events(lines, "render_failed").length, 0);
});
