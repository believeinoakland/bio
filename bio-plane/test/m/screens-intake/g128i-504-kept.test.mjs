/* plane G128i THE 504 (fix round 9; X29; round 8 G85/G103/G104; the walk's C12, C13; corpus R set, K4426 "Still MISSING" row 6): A LARGE CAPTURE'S REQUEST ENDS (the platform's 504, the wait gone) AND THE ADD SCREEN SAYS "NOTHING WAS KEPT" WHILE THE FILE
   IS KEPT. The walk watched the Add screen every second: at 2 s "can take longer, you will be told when the file has arrived", at 18 s "The page couldn't be fetched: the site didn't answer in time. Nothing was kept; try again", yet `heldat` showed the file
   kept and a `fetch-done` arrived. The statement its truth names: while the capture is kept and owed, the member's open captures LIST it (in the door's form `member:<id>`), the screen keeps saying it is being fetched, and it never says nothing was
   kept; and once the delivery files it, the screen says where. Built over the real store (fix round 10, K5245): the member's own press is run through the real `acquire` (a 9 MiB source that declares its length, so the capture is too large to wait for and
   is parked and owed), the real `opencaptures` answers the screen's polls for her (as the door stamps its `by`), and the screen is the real Add screen on its served page, polled as the walk polled it (4 s three times). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { members, openWorld, main, fill, press, says, lapse, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const MIB = 1024 * 1024;
const BIG = "https://www.oaklandca.gov/files/BIG.pdf";
const bytes = (() => { const b = new Uint8Array(9 * MIB); for (let i = 0; i < b.length; i += 4096) b.fill((i / 4096) % 251, i, Math.min(b.length, i + 4096)); return b; })();
const source = () => new Response(bytes, { headers: { "content-type": "application/pdf", "content-length": String(bytes.length) } });
const fetching = (p) => main(p).querySelectorAll("[data-fetching]").length;

/** the member's own press, parked and owed by the real acquisition; the Add screen over the real listing */
async function addScreen() {
  const t = await members({ mai: ["contribute", "create_projects"] });
  const project = await t.world.recipes.project(t.mai, "Yosemite");
  t.world.script(BIG, async () => source());
  const p = await openWorld(`/app/capture/address/${project}`, { world: t.world, as: t.mai, screens: [...SCREENS, DOCUMENT_STUB] });
  fill(p, { "ci-address": BIG });
  await press(p, "acquire");
  return { t, p, listed: async () => (await t.mai.read("opencaptures")).captures };
}
const tick = async (p, n = 1) => { for (let i = 0; i < n; i++) { await p.clock.tick(4000); for (let j = 0; j < 8; j++) await p.settle(20); } };

test("G128i 504: a kept, owed capture is listed for the member who pressed it, and the Add screen still says it is being fetched after the walk's 18 seconds, never 'nothing was kept'", async () => {
  const { p, listed } = await addScreen();
  const l = await listed();
  assert.equal(l.length, 1, "the kept capture is listed for the member, in the door's form");
  assert.ok(l[0].session && l[0].fetch_pending, "as an owed fetch");
  assert.equal(fetching(p), 1, "the working line is drawn at once");
  await tick(p, 5);   /* 20 seconds, as the walk watched */
  assert.equal(fetching(p), 1, "after 20 seconds it is still being fetched: it is kept and owed");
  assert.equal(says(p, "refusal.FETCH_FAILED"), false, "and the screen does not say the page could not be fetched, nothing kept");
});

test("G128i 504 control: a session that truly left the list with no copy three asks in a row is the failure the screen may state", async () => {
  const { t, p, listed } = await addScreen();
  await lapse(t, p);   /* the store's clock moves past what it keeps the session for: it leaves the list, and nothing was kept */
  assert.equal((await listed()).length, 0, "the session left the list");
  await tick(p, 4);
  assert.equal(fetching(p), 0);
  assert.ok(says(p, "refusal.FETCH_FAILED"), "when nothing is kept the screen says so");
});
