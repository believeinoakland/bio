/* case-authoring R77 (T51; DEC-340; case-inputs R19): the pre-flight's sign step also answers the minutes comparisons,
   what `case-inputs`' one source of them returns (registered once at start by `filings`, stood in here at its ruled
   interface through `w.ci`), each row with `minutesLine`, and never as a blocker, `first` or `ready`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { minutesLine } from "../../../src/case-inputs/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const ROWS = [
  { meeting: "the City Council, regular meeting", date: "2026-09-02", minutes: "We oppose it.", filed: "We oppose it.", same: true },
  { meeting: "the Planning Commission", date: "2026-09-10", minutes: "Some members opposed.", filed: "We oppose it.", same: false },
];
function setup() {
  const w = world();
  w.member("alice");
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  return { w, P: w.project("Team", "alice", [Q]) };
}
const act = (P, over = {}) => ({ ...AUTHORED, whatChanged: WHAT_CHANGED, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
                                 viewer: V("alice"), author: "alice", ...over });
const sign = (pre) => pre.steps.find((s) => s.name === "sign");

test("R77: a registered source's rows reach the sign step in its order with their lines, asked once with the case and the pinned members; none registered answers []; ready and first are the same with and without rows (control)", () => {
  const { w, P } = setup();
  const none = w.ca.publishPreflight(act(P));
  assert.deepEqual(sign(none).minutes, []);
  const calls = [];
  w.ci.registerMinutesComparisons("filings", { minutesComparisonsOn: (a) => { calls.push(a); return ROWS; } });
  const pre = w.ca.publishPreflight(act(P));
  assert.deepEqual(sign(pre).minutes, ROWS.map((r) => ({ ...r, ...minutesLine(r) })));
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].members.map((m) => m.bundle_id), [Q]);
  assert.deepEqual([pre.ready, pre.first, pre.blockers], [none.ready, none.first, none.blockers]);
});

test("R77: an unreadable source answers minutes {undetermined: true} and no rows, never []; and the step not reached (the act refused first) is undetermined too, with ready false and the same first as without a source", () => {
  const { w, P } = setup();
  w.ci.registerMinutesComparisons("filings", { minutesComparisonsOn: () => { throw new Error("down"); } });
  const pre = w.ca.publishPreflight(act(P));
  assert.deepEqual(sign(pre).minutes, { undetermined: true });
  assert.equal(pre.first, null);
  const refused = w.ca.publishPreflight(act(P, { statement: "" }));
  assert.equal(refused.first.reason, "NO_STATEMENT");
  assert.deepEqual(sign(refused).minutes, { undetermined: true });
});
