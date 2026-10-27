/* screens-intake T51 fix round 4, C9 R49: the seam owner's whole path over the real `capture` and the real store (K4468; R-SEAM; fix round 10, K5054).
 * The member presses Capture on an address the team already holds, from a project's Add page (the pre-flight `held: true` path); the real store
 * answers `heldat`, `captureseenin` and `heldcaptures` from what real acts made: another member (xan) captured the address (the page's own act) into a project,
 * and the viewer is, or is not, a participant of that project. The address is answered by the world's network (an environment double). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, main, fill, press, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const ADDRESS = "https://www.nps.gov/yose/index.htm";
const BODY = "<html><head><title>Yosemite National Park</title></head><body><p>Yosemite National Park, as first captured.</p></body></html>";
const CAN = ["contribute", "create_projects"];
const anchors = (p, id) => Array.from(main(p).querySelectorAll("a")).filter((a) => String(a.getAttribute("href")).includes(id));
const open = (t, as, path) => openWorld(path, { world: t.world, as, screens: [...SCREENS, DOCUMENT_STUB] });

/* the team: `mai` has the project MINE; `xan` has the project HOME and has captured the address into it by the page's own act, so the record holds it
   (under HOLDER); `mai` is a participant of HOME (invited by x, joined by herself) only when `sees` */
async function store({ sees }) {
  const t = await members({ mai: CAN, xan: CAN });
  t.world.script(ADDRESS, async () => new Response(BODY, { status: 200, headers: { "content-type": "text/html" } }));
  const MINE = await t.world.recipes.project(t.mai, "Pothole repairs");
  const HOME = await t.world.recipes.project(t.xan, "Housing repairs");
  const theirs = await open(t, t.xan, `/app/capture/address/${HOME}`);
  fill(theirs, { "ci-address": ADDRESS });
  await press(theirs, "acquire");
  const filed = (await t.xan.read("heldcaptures", { query: { project: HOME } })).held;
  assert.equal(filed.length, 1, "the other member's capture is in the record");
  if (sees) {
    await t.xan.act("projectinvite", { query: { projectId: HOME, handle: "mai" } });
    await t.mai.act("projectjoin", { query: { projectId: HOME } });
  }
  await t.world.tick(120_000);   /* the host's cooling-off after the first fetch passes */
  return { ...t, MINE, HOME, HOLDER: filed[0].bundle_id };
}
const press1 = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };
const asMai = (t) => t.mai.read("heldcaptures", { query: { project: t.MINE } });

test("R49 (C9, seam) the walker's address, already held under another project, pressed from the project's Add: capture's real heldcaptures then lists it for the project with also_here, and the page says it was filed here as well", async () => {
  const t = await store({ sees: true });
  assert.deepEqual((await asMai(t)).held, [], "before: nothing is filed under the project (the walker's finding)");
  const p = await open(t, t.mai, `/app/capture/address/${t.MINE}`);
  await press1(p);
  assert.equal(p.byOp("acquire").length, 0);
  assert.equal(p.byOp("heldat")[0].query.check, "true");
  const after = await asMai(t);
  assert.deepEqual(after.held.map((r) => [r.bundle_id, r.also_here, r.project]), [[t.HOLDER, { home: t.HOME }, t.HOME]], "listed as seen here, its home unchanged");
  assert.ok(says(p, "screen.capture.address.filedhere", { project: "Housing repairs" }), "and the page says so");
  assert.equal(anchors(p, t.HOLDER).length, 1);
});

test("R49 (C9, seam) control: a viewer who cannot see the home reads the address as not held; nothing is filed and the project's list stays empty", async () => {
  const t = await store({ sees: false });
  const p = await open(t, t.mai, `/app/capture/address/${t.MINE}`);
  await press1(p);
  assert.equal(p.byOp("captureseenin").length, 0);
  assert.deepEqual((await asMai(t)).held, []);
  assert.ok(says(p, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"), "the holder sentence");
});
