/* interface-shell fix round 10, B45 (K5157): R130 Enter in a one-line field presses the section's primary act once; R131 a ref in a row is a 44 px target
   at 390 px (measured in phone390.test.mjs); R132 a double-click on the rail's edge restores 184 px and keeps it (frame.test.mjs). */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, fitSend, Event } from "./harness.mjs";
import { HOME, ALL } from "./screens.fixture.mjs";

const enter = (p, el, init = {}) => p.fire(el, "keydown", { key: "Enter", ...init });
const sendTaskResolve = new Function("view", "el", "cs", 'return { body: { id: "t-" + cs.value("f2") } };');
/* a screen of two sections: a field and a quiet act, then a field naming the other act it presses, and a text area beside a primary act */
const TWO = { id: "home", words: [["screen.home.t.l", "fx l", false]], reads: () => ({}),
  acts: [{ op: "promote", send: HOME.acts[0].send }, { op: "taskresolve", send: sendTaskResolve }],
  render: (cs) => cs.sec("screen.home.t.l", cs.field("home-title", "screen.home.t.l") + cs.act("taskresolve", { label: "act.taskresolve.label.home" }) + cs.act("promote", { label: "act.promote.label.home", tone: "primary" }))
    + cs.sec("screen.home.t.l", cs.field("f2", "screen.home.t.l", { enter: "taskresolve" }) + cs.act("promote", { label: "act.promote.label.home", tone: "primary" }) + cs.act("taskresolve", { label: "act.taskresolve.label.home" }))
    + cs.sec("screen.home.t.l", cs.field("area", "screen.home.t.l", { area: true }) + cs.act("promote", { label: "act.promote.label.home", tone: "primary" })) };

test("R130 Enter in a one-line field presses the primary act of the section that holds it, once, with what was typed; control: Enter in a textarea presses nothing, a held key repeats nothing", async () => {
  const p = await boot({ screens: [HOME] });
  p.doc.getElementById("home-title").value = "Typed title";
  enter(p, p.doc.getElementById("home-title"));
  await p.settle();
  assert.equal(p.byOp("promote").length, 1, "once");
  assert.equal(p.byOp("promote")[0].body.meta.title, "Typed title", "with what was typed");
  enter(p, p.doc.getElementById("home-title"), { repeat: true });
  await p.settle();
  assert.equal(p.byOp("promote").length, 1, "a held key presses nothing more");
  const q = await boot({ screens: [TWO] });
  q.doc.getElementById("area").value = "words";
  enter(q, q.doc.getElementById("area"));
  await q.settle();
  assert.equal(q.byOp("promote").length, 0, "Enter in a textarea is a new line, not a press");
});

test("R130 a field names the act Enter presses (`enter`); another section's act is not pressed", async () => {
  const p = await boot({ screens: [TWO] });
  p.doc.getElementById("f2").value = "x";
  enter(p, p.doc.getElementById("f2"));
  await p.settle();
  assert.equal(p.byOp("taskresolve").length, 1, "the named act");
  assert.equal(p.byOp("promote").length, 0, "not the section's primary one");
  p.doc.getElementById("home-title").value = "T";
  enter(p, p.doc.getElementById("home-title"));
  await p.settle();
  assert.equal(p.byOp("promote").length, 1, "the first section's primary act, not its quiet one");
  assert.equal(p.byOp("taskresolve").length, 1);
});
