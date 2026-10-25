/* R49 (T51 fix round 10; K5186): a missing_predecessor finding (a step not yet due) says what the step expects, as R45's
   overdue_successor does, its words read by key through setup-words; a step no deadline can be counted for says nothing. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER } from "./fixture.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const T = (w, placements) =>
  w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements, threadedBy: "member:alice", viewer: MEMBER });
const missingOf = (w, stageKey) =>
  w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER }).findings
    .find((f) => f.kind === "missing_predecessor" && f.stage_key === stageKey);

test("R49: a step not yet due, its predecessor's own date counted, says progression.expects with its interval, the step's number and the deadline day", async () => {
  const w = seeded();
  w.define("proc", { award: { within: "10 days" } });
  w.fact("sa", "2026-01-10");
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  const f = missingOf(w, "award");
  assert.equal(f.overdue, undefined, "the step is not yet due: it is a missing predecessor, not an overdue one");
  assert.deepEqual([f.says.key, f.says.vars], ["progression.expects", { interval: "10 days", n: 1, date: "2026-01-20" }]);
  assert.deepEqual(f.says.lead, { key: "progression.nodoc", vars: {} });
  assert.equal(f.says.words, `${word("progression.nodoc")} ${word("progression.expects", f.says.vars)}`);
  assert.equal(f.says.words, "No document threaded. The progression expects one within 10 days of step 1, by 2026-01-20.");
});

test("R49: where the predecessor has no own date the deadline is undetermined and the missing step says progression.expects.undetermined without a date", async () => {
  const w = seeded();
  w.define("proc", { award: { within: "10 days" } });
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  const f = missingOf(w, "award");
  assert.deepEqual([f.says.key, f.says.vars], ["progression.expects.undetermined", { interval: "10 days", n: 1 }]);
  assert.equal(f.says.words, `${word("progression.nodoc")} ${word("progression.expects.undetermined", { interval: "10 days", n: 1 })}`);
});

test("R49 control: a missing step no deadline can be counted for (an unparsable interval, or its predecessor not placed) carries says null, never a date or a word about lateness", async () => {
  const w = seeded();
  w.define("proc", { award: { within: "sometime" } });
  w.fact("sa", "2026-01-10");
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  const f = missingOf(w, "award");
  assert.equal(f.says, null);
  const contract = missingOf(w, "contract");
  assert.equal(contract.says, null, "contract's predecessor (award) is not placed, so no clock is counted");
});
