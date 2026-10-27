/* store-assembly, explore R29 through the assembled store (T51 fix round 10, K5280; walk C C-M8): the graph names an `INFO-`
   node by its document's title, through the `documents` reader the assembly hands explore. The test reads the graph the
   way the door does (`exploregraph`, the viewer from the query). A document the viewer may see is named by its title;
   the control, a document in a project the viewer does not take part in, is named nothing and its title is not sent. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

const AT = { value: "2026-03-01", precision: "day", zone: "America/Los_Angeles" };
const SEEN = "INFO-2026-0101-seen";
const HIDDEN = "INFO-2026-0102-hidden";
const TITLE = "Council minutes, 10 February";
const VIEWER = "member:ann";

/* A document in the store: an information bundle with a title, outside every project (any member sees it) or in a project. */
function document(ctx, bundleId, { title, project = null }) {
  const r = recordOf(ctx).commit({ bundleId, type: "information", title, project, snapKey: `snap-${bundleId}`, author: "admin" });
  assert.equal(r.ok === false, false, JSON.stringify(r).slice(0, 300));
}

test("R29 (explore, through the assembled store): an INFO- node the viewer may see is named by its document's title; a document the viewer may not see is named nothing", async () => {
  const x = await store();
  document(x.ctx, SEEN, { title: TITLE });
  document(x.ctx, HIDDEN, { title: "Sealed settlement", project: "PROJ-sealed" });
  const seen = await x.call(`/exploregraph?viewer=${VIEWER}`, { centre: SEEN, at: AT, rings: 1 });
  const hidden = await x.call(`/exploregraph?viewer=${VIEWER}`, { centre: HIDDEN, at: AT, rings: 1 });
  const named = (g, id) => (g.nodes || []).find((n) => n.id === id)?.label ?? null;
  assert.equal(named(seen, SEEN), TITLE, JSON.stringify(seen).slice(0, 400));
  assert.equal(named(hidden, HIDDEN), null, "control: the viewer may not see this document, so it is named nothing");
  assert.ok(!JSON.stringify(hidden).includes("Sealed settlement"), "control: its title is not sent to this viewer");
});
