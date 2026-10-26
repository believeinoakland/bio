/* screens-investigate R33, R34, C14 (T51 fix round 10; K5304): the read set of a progression's page does not depend on which of its reads answers first.
   `fix4.test.mjs` failed once in five runs under load (two suites at once) with one more read, `reading`, on the `progression` page: the documents had answered before the
   project, so the page drew the Timeline's own record form (a passage picker reads the first document's words) until the project arrived. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs } from "./world.mjs";
import { main } from "./fixtures.mjs";
import { pending } from "../interface-shell/harness.mjs";

async function trail() {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Pothole repairs");
  await world.recipes.hold(me, "Roof report.txt", "The roof repair was put off.", project);
  const stages = [{ key: "sent", label: "Request sent", after: null, within: null, required: "always", cardinality: "1" }];
  await me.act("progressiondefine", { body: { progressionKey: "pra", label: "A public records request", basis: "the agency determines within 10 days", citation: "Gov. Code 7922.535", stages } });
  return { world, me, project };
}

test("R33 R34 C14 a progression's page asks no document's words while its project has not answered, whichever read answers first; control: with the project answered it asks none either", async () => {
  const { world, me, project } = await trail();
  for (const mode of ["progression/pra"]) {
    const early = await openAs(world, me, `/app/timeline/${project}/${mode}`, { plane: { image: pending } });
    assert.equal(early.byOp("heldcaptures").length, 1, "the documents are asked, and answered, before the project");
    assert.equal(early.byOp("reading").length, 0, `${mode}: no document's words are read while the project is unanswered`);
    assert.ok(main(early).querySelector('[data-state="loading"]'), "the project's own loading state is drawn");
    const settled = await openAs(world, me, `/app/timeline/${project}/${mode}`);
    assert.equal(settled.byOp("reading").length, 0, `${mode}: control: none once the project has answered`);
  }
});
