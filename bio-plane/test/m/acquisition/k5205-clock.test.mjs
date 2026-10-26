/* acquisition R46 (K5205; K5132's rule): the capture sessions this act saves expire, and are listed, on the instance clock. A pinned
   `env.BIO_NOW_MS` (handed in with the store) is that clock, so a session saved under it is live for its hour on the pinned clock and
   gone past it, whatever the wall clock says. Each test has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, page, text, HTML, stamp } from "./fixture.mjs";

const T0 = Date.parse("2001-01-01T00:00:00Z");
const HOUR = 60 * 60 * 1000;
const SHELL = HTML("<div id=app></div>");
/* a renderer that never answers, so the render is left pending and its capture session is what the act saves */
const silent = { fetch: () => new Promise(() => {}) };

test("R46 (K5205): a render's capture session is saved on the pinned instance clock: live for its hour there, and gone from the live list past it", async () => {
  const PG = "https://r.example/k5205-expiry";
  const w = world({ env: { BIO_NOW_MS: String(T0), RENDERER: silent } });
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  const listed = (at) => w.store.liveCaptureSessions(at).map((x) => x.session);
  assert.ok(listed(T0 + HOUR / 2).includes(sid), "control: live half an hour into its hour on the pinned clock");
  assert.equal(listed(T0 + 2 * HOUR).includes(sid), false, "two hours on the pinned clock it is past its hour and not listed");
});

test("R46 control (K5205): the same act with no pinned clock is listed on the wall clock now", async () => {
  const PG = "https://r.example/k5205-wall";
  const w = world({ env: { RENDERER: silent } });
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  assert.ok(w.store.liveCaptureSessions(Date.now()).map((x) => x.session).includes(sid), "listed on the wall clock when nothing is pinned");
});

/* R124 (K5215): the recorded instants (a capture's `retrieved`, a reputation's `checked_at`) read the instance clock too */
const TOOL = Object.freeze({ provider_id: "cloudflare-intel", tool_id: "cf-intel-1", config: {}, credentials: {}, handling_confirmed: false });
const CLEAN = { ok: true, listed: false, categories: [], risk: null, source: "cloudflare-intel", lookup_privacy: "cloudflare_account" };
const scanner = () => ({ fetch: async () => new Response(JSON.stringify(CLEAN), { status: 200, headers: { "content-type": "application/json" } }) });

test("R124 (K5215): with the instance clock pinned, a capture's `retrieved` and a reputation's `checked_at` read the pinned clock; control: none pinned, the wall clock", async () => {
  const LOC = "https://a.example/k5215-clock";
  const pinned = await run(world({ env: { BIO_NOW_MS: String(T0) } }), { [LOC]: () => text("payload") },
    { locator: LOC }, { reputation: TOOL, fileScanner: scanner() });
  assert.equal(pinned.status, 200);
  assert.equal(pinned.body.document.retrieved, stamp(T0), "the capture's retrieved is the pinned instant");
  assert.equal(pinned.body.reputation.checked_at, stamp(T0), "the reputation's checked_at is the pinned instant");
  const wall = await run(world({}), { [LOC]: () => text("payload") }, { locator: LOC }, { reputation: TOOL, fileScanner: scanner() });
  const before = Date.now();
  assert.ok(Date.parse(wall.body.document.retrieved) >= Math.floor(before / 1000) * 1000 - 1000, "control: retrieved is the wall clock when nothing is pinned");
  assert.notEqual(wall.body.document.retrieved, stamp(T0), "control: not the pinned instant");
});
