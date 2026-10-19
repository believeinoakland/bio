/* T9's share beyond R78 (K285): R79 the revocation notice (N123), R80 `inSight` (N142), R81 `listenerRefusal` (N202,
   moved from promotion), R113 the bounds on R11's history and R19's pairings (N70; was R82's half, T38: the deciders'
   bound is `project-roster` R7's). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership, listenerRefusal, MODULE_ORDER, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { readFile } from "node:fs/promises";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));

test("R80 inSight: true exactly for a held bundle R43 admits the viewer to (FULL); total, and writes nothing", async () => {
  const w = await world().group("ann", "bob", "cal");
  w.bundle("INFO-I");
  w.project("PROJ-H", "Hidden H");
  w.project("PROJ-D", "Discoverable D");
  for (const p of ["PROJ-H", "PROJ-D"]) w.m.projectClaimOwner({ projectId: p, memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-H", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  const cases = [
    ["INFO-I", V("cal"), true], ["PROJ-H", V("ann"), true], ["PROJ-H", V("bob"), true, "invited"],
    ["PROJ-H", V("cal"), false], ["PROJ-D", V("cal"), false, "EXISTENCE is not FULL"],
    /* D54 (T41-3): an administrator and the founder see a hidden project they are not in at EXISTENCE, never FULL;
       a discoverable one at FULL */
    ["PROJ-H", V("second"), false, "an administrator, hidden"], ["PROJ-H", "admin", false, "the founder, hidden"],
    ["PROJ-D", V("second"), true, "an administrator, discoverable"], ["PROJ-D", "admin", true, "the founder, discoverable"],
    ["PROJ-NEVER", V("ann"), false], ["PROJ-NEVER", "admin", false, "absent for everyone"],
    ["PROJ-H", "junk", false], ["INFO-I", "junk", false], ["INFO-I", null, false],
  ];
  for (const cls of ["admin", "member", "probe", "daemon", "ai"]) cases.push(["PROJ-H", `${MACHINE_CLASS_PREFIX}${cls}`, true, cls]);
  for (const [id, v, want, why] of cases) {
    assert.equal(w.m.inSight(id, v), want, `${id} ${v} ${why ?? ""}`);
    assert.equal(w.m.inSight(id, v), w.m.sight(id, v) === Membership.SIGHT_FULL, `agrees with sight: ${id} ${v}`);
  }
  const before = snapshot(w);
  for (const id of [null, undefined, "", 0, 42, {}, [], true, "x'; DROP TABLE members; --"])
    for (const v of [V("ann"), "admin", null, {}, [], 7]) {
      assert.doesNotThrow(() => w.m.inSight(id, v), `${JSON.stringify(id)} ${JSON.stringify(v)}`);
      if (typeof id !== "string" || !id) assert.equal(w.m.inSight(id, v), false);
      assert.doesNotThrow(() => w.m.sight(id, v));
    }
  assert.equal(snapshot(w), before, "writes nothing");
});
