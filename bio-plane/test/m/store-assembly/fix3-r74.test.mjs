/* store-assembly's copy of plane's test. plane R74 -> R61 (T51 fix round 3; C5, C14; K4389; control-plane R117, R118): the door's owner getters hand `extraction` and
   `projectRoster` to `ownerOps`, each asked only when its op is served. Driven through the real store: the
   door's `readheldfor` arm reaches extraction's one instance, and `projectlist` reads project-roster's one instance with
   review's shared-drafts reader handed in. Each spy replaces a method on the one instance the store's getter returns. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
const { readHeldAnswer: { noHome } } = await import("../extraction/fixtures.mjs");
import { extractionOf } from "../../../src/extraction/index.mjs";
import { projectRosterOf } from "../../../src/project-roster/index.mjs";

const SHA = "b".repeat(64);

test("R61 (fix round 3, C5; K4389; extraction R80, control-plane R117): through the real store, the door's readheldfor arm reaches extraction's one instance; a different op does not", async () => {
  const x = await store();
  const ex = extractionOf(x.ctx);
  const held = [];
  ex.readHeld = async (args) => { held.push(args); return noHome(); };
  const answer = JSON.parse(JSON.stringify(await x.call(`/readheldfor?sha=${SHA}`)));
  assert.equal(held.length, 1, "the arm called extraction's readHeld once, on the one instance");
  assert.equal(held[0].sha, SHA);
  assert.equal(answer.ok, true, JSON.stringify(answer));
  assert.equal(answer.read, false);
  /* control: another owner op is answered without asking extraction for anything */
  await x.call("/accountdrafts?case=c-none&viewer=member:ann").catch(() => null);
  assert.equal(held.length, 1, "a different op does not call readHeld");
});

test("R61 (fix round 3, C14; K4389; project-roster R42, control-plane R118): through the real store, the projectlist arm reads project-roster's one instance with review's shared-drafts reader handed in", async () => {
  const x = await store();
  const roster = projectRosterOf(x.ctx);
  const asked = [];
  const real = roster.projectList.bind(roster);
  roster.projectList = (args) => { asked.push(args); return real(args); };
  await x.call("/projectlist?viewer=member:ann").catch(() => null);
  assert.equal(asked.length, 1, "the arm called project-roster's projectList once, on the one instance");
  assert.equal(typeof asked[0].sharedDraftsOf, "function", "review's reader is handed in as sharedDraftsOf");
});

test("R61 (fix round 3; K4389) control: the store's getters are lazy, so a store that serves no owner op builds neither instance's reader", async () => {
  const x = await store();
  const roster = projectRosterOf(x.ctx);
  let called = 0;
  roster.projectList = () => { called += 1; return { rows: [] }; };
  const ex = extractionOf(x.ctx);
  let read = 0;
  ex.readHeld = async () => { read += 1; return noHome(); };
  x.routes("/readheldfor?sha=" + SHA, null);
  x.routes("/projectlist?viewer=member:ann", null);
  assert.deepEqual([called, read], [0, 0], "building the route maps calls neither");
});
