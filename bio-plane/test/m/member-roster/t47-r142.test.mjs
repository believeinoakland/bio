/* T47 (K3078; MEMBERSHIP #37 J5): R69, `membership` R142's part (1), with its control: `handleCheck`'s viewer arm answers a
   member's own current or earlier handle `taken` (R13, R50; DEC-197). (Parts (2) and (3) stay with `membership`.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

/* ---------------------------------------------------------------- R142 (1) ------------------------------------------ */

test("R69 (1) handleCheck's viewer arm answers a member's own current and earlier handles taken, as to everyone else; control: a handle nobody holds is free to them", async () => {
  const w = await world().group("ann", "bob");
  /* a change made before T46 left ann's earlier handle in the history */
  w.sql.exec(`UPDATE members SET handle='ann-new' WHERE member_id='ann'`);
  w.sql.exec(`INSERT INTO handle_history (member_id, from_handle, to_handle, at) VALUES ('ann','ann','ann-new','2026-10-01T00:00:00.000Z')`);
  for (const [viewer, handle] of [["ann", "ann-new"], ["ann", "ann"], ["bob", "bob"], ["bob", "ann-new"], ["bob", "ann"]]) {
    const r = await w.m.handleCheck({ viewer: V(viewer), handle });
    assert.deepEqual([r.ok, r.state, r.words.key], [true, "taken", "handle.taken"], `${handle} to ${viewer}`);
    assert.notEqual(r.suggestion, handle, "the suggestion is another handle");
    assert.equal((await w.m.handleCheck({ viewer: V(viewer), handle: r.suggestion })).state, "free", "and it is free");
  }
  /* the same answer to the holder and to another member: taken is one answer, never "yours" */
  const own = await w.m.handleCheck({ viewer: V("ann"), handle: "ann-new" });
  const other = await w.m.handleCheck({ viewer: V("bob"), handle: "ann-new" });
  assert.deepEqual(own, other);
  /* through the op, as the control plane routes it */
  assert.equal((await w.ops(`viewer=${encodeURIComponent(V("ann"))}`, { handle: "ann-new" }).handlecheck()).state, "taken");
  /* control: a handle nobody holds or held is free to the same member */
  assert.equal((await w.m.handleCheck({ viewer: V("ann"), handle: "zed" })).state, "free");
});
