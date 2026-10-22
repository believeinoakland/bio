/* interface-shell, fix round 4 (T51; K4429; cause-shell-4): R117's re-points (B3, K4467: `readheld` on `document`, screens-inquiry J21, N5).
   The tests of this round's other lines are in r120.test.mjs (R120), p9.test.mjs (R122, R93), c59.test.mjs (R5) and keyfile.test.mjs (R115, R116). */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { checkScreens, RE_POINTS } from "../../../src/interface-shell/index.mjs";
import { SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";

const screen = (id, op) => ({ id, render: () => "", acts: [{ op }] });

test("R117 (B3, N5) a document screen naming readheld is served, the read of a record stored unread; control: another unlisted op on document, and readheld on another screen, still throw", () => {
  assert.equal(checkScreens([screen("document", "readheld")]), true);
  assert.throws(() => checkScreens([screen("document", "scanmirror")]), /document.*scanmirror/);
  assert.throws(() => checkScreens([screen("finder", "readheld")]), /finder.*readheld/);
});

test("R73 R117 a re-point is held only until the registry lists the op on that screen: no RE_POINTS entry is one the registry already lists for it", () => {
  for (const [id, ops] of Object.entries(RE_POINTS)) {
    const reg = SCREEN_REGISTRY.find((r) => r.id === id);
    assert.ok(reg, id + " is a registry screen");
    for (const op of ops) assert.equal(reg.acts.includes(op) || (reg.owed || []).some((o) => o.op === op), false, `${id}: ${op} is listed by the registry, so it is no re-point`);
  }
});
