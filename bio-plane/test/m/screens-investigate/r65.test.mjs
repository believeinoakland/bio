/* screens-investigate R65 (T51 fix round 10; DEC-439, DEC-440, DEC-441): each sentence the design gave, drawn by its key at its walker's case.
   Over `store-request`'s world: every state is made by the member's own acts and every answer is the store's. The Standard's fields are R64's
   (standard-binds.test.mjs), the Timeline participant's name R63's (timeline.test.mjs); their tests name R65 as well. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled, refused } from "./world.mjs";
import { main, press, word, drew } from "./fixtures.mjs";

const REASON = "The document says so.";

test("R65 Due date: a request whose rules list no deadline draws `screen.due-date.nodeadlines` in its fold, with the door to the rules, and not the owner's own detail", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Rent schedules");
  const id = (await me.act("actioncreate", { body: { document: ["---", "id: PENDING", "object_type: action", 'title: "The rent schedules"', "current_state: planned",
    'created: "2026-10-01T12:00:00Z"', 'last_updated: "2026-10-01T12:00:00Z"', "project: " + project, 'action_kind: "records_request"', "counterparty:", '  state: "named"', '  role: "City Clerk"', '  body: "City Council"',
    "---", "", "The rent schedules.", ""].join("\n") } })).id;
  const p = await openAs(world, me, "/app/due-date/" + id);
  await press(p, "clockpropose", { reason: REASON });
  const refusal = await refused(world, me, "clockpropose", p.byOp("clockpropose")[0].body);
  assert.equal(refusal.reason, "NO_SUCH_RULE");
  assert.deepEqual(refusal.deadlines, [], "the team's rules list no deadline");
  const said = main(p).querySelector('[data-gap="refused"]');
  assert.ok(said, "the refusal is drawn");
  drew(said, "screen.due-date.nodeadlines.summary");
  drew(said, "screen.due-date.nodeadlines");
  assert.equal(said.querySelector('a[href="/app/places"]').textContent, word("screen.due-date.rule.go"), "the door to the rules");
  assert.ok(!said.textContent.includes(refusal.detail), "never the owner's own detail");
});

test("R65 Timeline: the document choice says only this project's documents are offered; a document held without a project is not among them, one of the project's is", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Pothole repairs");
  const mine = await world.recipes.hold(me, "Inside.txt", "A document of the project.", project);
  const loose = await world.recipes.hold(me, "Loose.txt", "A document added without a project.");
  const p = await openAs(world, me, "/app/timeline/" + project);
  await settled(p);
  const options = p.doc.getElementById("tl-doc").querySelectorAll("option");
  assert.ok(options.some((o) => o.getAttribute("value") === mine.sha), "the project's own document is offered");
  assert.ok(!options.some((o) => o.getAttribute("value") === loose.sha), "the one added without a project is not");
  assert.equal(main(p).textContent.split(word("screen.timeline.doc.noproject")).length - 1, 1, "said once, beside the choice");
});
