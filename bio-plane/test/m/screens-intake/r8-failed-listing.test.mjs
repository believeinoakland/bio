/* screens-intake T51 fix round 8, B44 (control-plane J48, seam A2, G105): an owed fetch refused for good is listed by acquisition as `fetch_pending.failed`
 * (acquisition R111), not as a top-level `failed`. The listing here is the real `openCaptures` output over a store holding such a session (R-SEAM), pressed through
 * the Add screen: the watch ends in the refusal's words at once, and the Unfinished line states it with no "Finish it". R58.
 * Over the REAL store (fix round 10, K5054) except the one thing the world cannot make: a parked fetch that the alarm delivered and the record refused. The store-assembly
 * world assembles the store with no `deliver` (control-plane's owed delivery, store-assembly assemble.mjs:188), so a parked fetch stays owed for ever and never ends in a
 * stated refusal; the listing the page reads stays the real `openCaptures` output over a store holding such a session (as before), and the press that parks it a held answer.
 * The record's other answers (`projectlist`, `heldcaptures`, `heldat`) are the owners' own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, main, fill, press, ok, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { openCaptures } from "../../../src/acquisition/index.mjs";

const ADDRESS = "https://www.govinfo.gov/content/pkg/BUDGET-2021-APP/pdf/BUDGET-2021-APP.pdf";
const SESSION = "rs_held_elsewhere";
/* the listing is made now (N1, fix round 9: a failed line is listed for a day from the fetch, so a fixed date would age out) */
const iso = (ms) => new Date(ms).toISOString().split(".")[0] + "Z";
const NOW = iso(Date.now());
const SINCE = iso(Date.now() - 1800000);
const store = { liveCaptureSessions: () => [{ session: SESSION, locator: ADDRESS, created: SINCE, updated: NOW, expires: iso(Date.now() + 86400000), primarySha: null,
  state: { opened_by: "mai", queue: [], fetch_done: { since: SINCE }, fetch_pending: { since: SINCE, declared_bytes: 17400000, why: "over_wait", failed: "CAPTURE_HELD_BY_ANOTHER_BUNDLE" } } }] };
const listing = openCaptures(store, { by: "member:mai", now: NOW });
const PENDING = ok({ ok: true, fetch_pending: { session: SESSION, since: SINCE, declared_bytes: 17400000, why: "over_wait" } });
const open = async (path, plane) => { const t = await members({ mai: ["contribute"] }); return openWorld(path, { world: t.world, as: t.mai, plane, screens: [...SCREENS, DOCUMENT_STUB] }); };

test("R58 (B44) the real listing states the refusal under fetch_pending.failed", () => {
  assert.equal(listing.captures[0].fetch_pending.failed, "CAPTURE_HELD_BY_ANOTHER_BUNDLE");
  assert.equal(listing.captures[0].failed, undefined);
});

test("R58 (B44) the watch ends in the held-elsewhere words at once, without three asks and without polling on", async () => {
  const p = await open("/app/capture/address", { acquire: PENDING, opencaptures: ok(listing) });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.clock.tick(4000);
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.ok(says(p, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"));
  assert.equal(main(p).querySelectorAll("[data-fetching]").length, 0);
  assert.equal(p.byOp("heldat").filter((r) => !r.query.check).length, 0, "the record is not asked");
  const n = p.byOp("opencaptures").length;
  await p.clock.tick(30000);
  for (let i = 0; i < 6; i++) await p.settle(20);
  assert.equal(p.byOp("opencaptures").length, n, "the poll has ended");
});

test("R58 (B44) the Unfinished line states the refusal and offers no Finish it", async () => {
  const p = await open("/app/capture/address", { opencaptures: ok(listing) });
  assert.ok(says(p, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"));
  assert.equal(Array.from(main(p).querySelectorAll('button[data-act="acquire"]')).filter((b) => b.getAttribute("data-session")).length, 0);
});
