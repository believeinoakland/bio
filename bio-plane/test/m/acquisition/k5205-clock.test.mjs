/* acquisition R46 (K5205; K5132's rule): the capture sessions this act saves expire, and are listed, on the instance clock. A pinned
   `env.BIO_NOW_MS` (handed in with the store) is that clock, so a session saved under it is live for its hour on the pinned clock and
   gone past it, whatever the wall clock says. Each test has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, page, HTML } from "./fixture.mjs";

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
