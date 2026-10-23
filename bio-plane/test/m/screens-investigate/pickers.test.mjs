/* screens-investigate R52 (T51; K4194 L2): every "Which document" picker lists the documents a member has vouched for as well as
 * those still held, by asking `heldcaptures` for `held_and_vouched` (capture R88); the answer is the owner's, honouring `state`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, heldByState, PATHS, MORE_PATHS, STD, HELD } from "./fixtures.mjs";

const SCREENS_WITH_A_PICKER = [
  ["standard", "/app/standard/" + STD, "st-doc"],
  ["person", PATHS.person, "person-fact-doc"],
  ["proceeding", PATHS.proceeding, "pr-doc"],
  ["timeline", PATHS.timeline, "tl-doc"],
  ["calculation", PATHS.calculation, "calc-set"],
  ["money", PATHS.money, "mf-doc"],
];
const titles = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => o.textContent);

for (const [name, path, field] of SCREENS_WITH_A_PICKER) {
  test(`R52 ${name}: the document picker offers a vouched document beside a held one, asking heldcaptures for held_and_vouched; control: a document in neither state is not offered`, async () => {
    const p = await open(path, { plane: { heldcaptures: heldByState } });
    const q = p.byOp("heldcaptures");
    assert.ok(q.length >= 1, "the documents are read");
    for (const r of q) assert.equal(r.query.state, "held_and_vouched", "every read of the documents asks for held and vouched");
    assert.deepEqual(titles(p, field), ["Lease amendment 1", "Rent schedule", "Vouched minutes"]);
    /* the default list (what the screens asked before) holds no vouched document: the cause of the fix */
    const before = await open(path, { plane: { heldcaptures: (r) => ok(HELD) } });
    assert.ok(!titles(before, field).includes("Vouched minutes"));
    /* a document in neither state is in neither list, so it is not offered */
    const neither = await open(path, { plane: { heldcaptures: (r) => heldByState(r) } });
    assert.ok(!titles(neither, field).includes("Withdrawn draft"));
  });
}

test("R52 the one time the picker is drawn from a matter (the thread and discharge folds) it offers the vouched document too", async () => {
  const p = await open(MORE_PATHS.matter, { plane: { heldcaptures: heldByState } });
  assert.deepEqual(titles(p, "pm-thread-doc"), ["Lease amendment 1", "Rent schedule", "Vouched minutes"]);
});
