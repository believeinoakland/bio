/* strength R41 (T51; K4258; op-declarations' family for `strengthbarset`): the group's default bar is served under the door
   name `strengthbarset` as well as `strengthbar`. Driven through the ops map as the door calls it, over the module's own
   fixture, so the act and its read back are the real path. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE, ADMIN, MEMBER, REASON } from "./fixture.mjs";
import { strengthOps } from "../../../src/strength/index.mjs";

test("R41, R15, R16 (T51; K4258): op=strengthbarset sets the group's bar as op=strengthbar does, and op=strengthbarof reads it back", () => {
  const w = world();
  w.member(ADMIN, "admin");
  const set = strengthOps(w.s, new URL(`http://x/?op=strengthbarset&author=${ADMIN}`),
    { capture: "B", connection: "C", reason: REASON }).strengthbarset();
  assert.equal(set.ok, true, JSON.stringify(set));
  assert.equal(set.capture, "B");
  assert.equal(set.connection, "C");
  assert.equal(set.reason, REASON);
  assert.equal(set.author, ADMIN, "the stamped author is the one recorded");
  const read = strengthOps(w.s, new URL(`http://x/?op=strengthbarof&viewer=${MACHINE}`), null).strengthbarof();
  assert.equal(read.bar.capture, "B");
  assert.equal(read.bar.connection, "C");
  assert.equal(read.bar.reason, REASON);
});

test("R41, R15 (T51; K4258): op=strengthbarset refuses as op=strengthbar does: the stamped author wins over the body's, and a non-administrator is refused; op=strengthbar stays served", () => {
  const w = world();
  w.member(ADMIN, "admin");
  w.member(MEMBER);
  const url = new URL(`http://x/?op=strengthbarset&author=${MEMBER}`);
  const body = { capture: "B", reason: REASON, author: ADMIN };
  const viaSet = strengthOps(w.s, url, body).strengthbarset();
  const viaBar = strengthOps(w.s, new URL(`http://x/?op=strengthbar&author=${MEMBER}`), body).strengthbar();
  assert.equal(viaSet.reason, "STRENGTH_BAR_NOT_ADMIN", "the stamped author wins over the body's");
  assert.deepEqual(viaSet, viaBar, "the two door names answer alike");
  assert.equal(typeof strengthOps(w.s, url, body).strengthbar, "function", "strengthbar stays served");
});

test("R41 (T51; K4258): control: an op this module does not serve is not routed, so the names it serves are the only ones that answer", () => {
  const w = world();
  const ops = strengthOps(w.s, new URL("http://x/?op=strengthbarnosuch"), { capture: "B", reason: REASON });
  assert.equal(ops.strengthbarnosuch, undefined);
  assert.equal(typeof ops.strengthbarset, "function");
});
