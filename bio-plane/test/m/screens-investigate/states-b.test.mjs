/* screens-investigate R10 (with interface-shell R8–R13 and R16), screens money, calculation, proceeding, due-date, standard and ties: each screen with each read it draws answered pending, refused and not at all draws that
 * read in its own state, beside the rest (the reads a screen makes are those it is seen to send over the scripted plane; N1073). Split from common.test.mjs
 * so that each file ends within a minute: every screen is opened once for each read and each answer, over the real store. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS, main, rawKeys } from "./fixtures.mjs";
import { openAs } from "./world.mjs";
import { theWorld, readsOf, VARIANTS } from "./universe.mjs";

for (const id of ["money", "calculation", "proceeding", "due-date", "standard", "ties"]) {
  test(`R10 ${id}: each read pending, refused and unanswered is drawn in its own state, beside the rest, with no key drawn bare (interface-shell R10, R5)`, async () => {
    const U = await theWorld();
    const drawn = new Set();
    for (const op of await readsOf(U, id)) for (const [name, answer] of Object.entries(VARIANTS)) {
      const p = await openAs(U.world, U.me, U.PATHS[id], { plane: { [op]: answer } });
      const m = main(p);
      assert.ok(m.querySelector("h1"), `${id} with ${op} ${name}: the screen stays`);
      const want = name === "pending" ? "loading" : "failed";
      if (m.querySelector(`[data-state="${want}"]`)) {
        drawn.add(op);
        if (name === "refused") assert.ok(/The plane refused this read|SOME_REFUSAL/.test(m.querySelector('[data-state="failed"]').textContent), "the refusal's own words");
      }
      assert.deepEqual(rawKeys(p.root()), [], `${id} with ${op} ${name}`);
    }
    assert.ok(drawn.size > 0, `${id}: some read is drawn in its own state`);
    const subject = SCREENS.find((s) => s.id === id).reads({ subject: U.PATHS[id].split("/")[3], ui: {}, data: {} });
    for (const r of Object.values(subject)) if (r.subject === true) assert.ok(drawn.has(r.op), `${id}: its subject read ${r.op} is drawn in its own state`);
  });
}
