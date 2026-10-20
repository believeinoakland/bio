/* R76 (T51): how the totality tests of R21 take the class of browser acts. `browserActs(registry)` returns the names of
   `BROWSER_ACTS` after checking the reading (b): each is exactly one `owed` row of the screen registry, whose text equals
   the table's `registry` string; the totality tests subtract them from the acts the registry still marks `owed`, and
   check that what is left is declared or named as before. */
import assert from "node:assert/strict";
import { BROWSER_ACTS } from "../../../src/op-declarations/index.mjs";

export const browserActs = (registry) => {
  const rows = registry.screens.flatMap((s) => s.acts.filter((a) => a.status === "owed").map((a) => ({ screen: s.id, op: a.op })));
  const names = Object.keys(BROWSER_ACTS).sort();
  for (const act of names) {
    const found = rows.filter((r) => r.op === BROWSER_ACTS[act].registry);
    assert.equal(found.length, 1, `${act}: not exactly one owed row for ${BROWSER_ACTS[act].registry}`);
    assert.equal(found[0].screen, BROWSER_ACTS[act].screen, `${act}: on another screen`);
  }
  return names;
};

/* The fix round of T51 (DEC-378; K4165, K4169, K4168): the acts the screen registry now marks `owed` whose ops their owners
   build and declare in this round (`case-inputs` C12, `case-import` C49, `tasks` C62), each in its owner's `DECLARED_OPS`
   and none a hand row here, so each has no spec in `OPS` (R6) until the plane registers the owners' declarations
   (`registerDeclaredOps`, R80); the totality tests read them as still owed, class (c) of R21, with the ruling that owes
   them. Beside them the three NO-OP ops whose controls DEC-381 draws (`provenance` C23, `capture-sources` C20,
   `investigation` C65), declared by their owners in the same round. */
export const OWED_BY_FIX_ROUND = ["capturecredentiallist", "capturecredentialsupply", "capturecredentialwithdraw", "casedetails",
  "casedetailspublic", "casedetailsset", "declareorigin", "importregrade", "projectclose", "rerunpair", "rerunread", "rerunstart",
  "taskdecide"];
