/* question-explorer R17 (T50-68; N1164; K3485; DEC-293, DEC-297): a run's end is closed in the record's own words and
   awaited. The stand-in `ai-runs` (fixture.mjs) answers `open` and `close` asynchronously and refuses what `ai-runs`
   refuses (a bound outside RUN_BOUNDS and RUN_ENDINGS, a condition outside CONDITION_KINDS). Each with a control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, DOC2, Q, CALLER } from "./fixture.mjs";
import * as runRules from "../../../src/run-rules/index.mjs";
import { WORD_KEYS } from "../../../src/question-explorer/words.mjs";

const people = (w, n = 21) => {
  const out = Array.from({ length: n }, (_, i) => `ENT-2026-${20000 + i}`);
  for (const [i, p] of out.entries()) { w.entity(p, "person"); w.resolve(String(i).padStart(64, "0"), DOC2, p); }
  w.asserted[Q] = [{ a_bundle_id: DOC2, b_bundle_id: Q, asserted_by: "member", author: "member:alice" }];
  return out;
};
const overCap = async (w, o, ps) => {
  for (const p of ps.slice(0, 20)) await w.p.look({ run: o.run, entity: p, caller: CALLER });
  return w.p.look({ run: o.run, entity: ps[20], caller: CALLER });
};

test("R17: the cap ends the run closed: ai-runs' asynchronous close is awaited and accepted, bound completed and condition null, the step set aside with EXPLORE_PERSON_CAP_REACHED", async () => {
  const w = await world().standard();
  const ps = people(w);
  const o = await w.openRun("group");
  const past = await overCap(w, o, ps);
  assert.equal(past.code, "EXPLORE_PERSON_CAP_REACHED");
  assert.equal(past.ended.closed, true, "closed: true only because close accepted it");
  const [close] = w.calledAs("close");
  assert.deepEqual([close.bound, close.condition, close.stepEnd, close.reason], ["completed", null, "set_aside", "EXPLORE_PERSON_CAP_REACHED"]);
  assert.equal(runRules.checkBound(close.bound), null, "a bound of RUN_BOUNDS or RUN_ENDINGS");
  assert.equal(runRules.checkCondition(close.condition), null, "no condition is a supported state");
  assert.deepEqual(w.calledAs("stepEnd").map((a) => [a.end, a.reason]), [["set_aside", "EXPLORE_PERSON_CAP_REACHED"]]);
  const row = w.row(`SELECT ended, reason, close_refused FROM explore_runs WHERE run=?`, o.run);
  assert.deepEqual([row.ended, row.reason, row.close_refused], ["set_aside", "EXPLORE_PERSON_CAP_REACHED", null]);
  assert.deepEqual(w.p.runCost({ run: o.run, viewer: "member:dana" }).actual, { usd: 0.42 }, "R12's actual cost, from the awaited answer");
  /* Control: the cap is this module's own reason: it is the step's reason, never the run's condition. */
  assert.equal(w.calledAs("close").every((c) => c.condition === null), true);
});

test("R17: a limit this module names ends the run with bound completed unless the caller names a bound of the record; a named bound passes through (R8)", async () => {
  const w = await world().standard();
  const o = await w.openRun("group");
  const e = await w.p.end({ run: o.run, end: "set_aside", reason: "a fetch limit the worker reached", bound: "not-a-bound", caller: CALLER });
  assert.deepEqual([e.ok, e.closed, e.end, e.reason], [true, true, "set_aside", "a fetch limit the worker reached"]);
  const [c] = w.calledAs("close");
  assert.deepEqual([c.bound, c.condition, c.reason], ["completed", null, "a fetch limit the worker reached"], "the limit's text is the step's reason only");
  /* Control: a bound of RUN_BOUNDS is the run's own ending. */
  const w2 = await world().standard();
  const o2 = await w2.openRun("group");
  assert.equal((await w2.p.end({ run: o2.run, end: "set_aside", reason: "fetches", bound: "fetches", caller: CALLER })).closed, true);
  assert.equal(w2.calledAs("close")[0].bound, "fetches");
});

test("R17: end({end: \"ended\"}) closes with bound completed and no condition, and the words for the ending are not this module's", async () => {
  const w = await world().standard();
  const o = await w.openRun("group");
  const e = await w.p.end({ run: o.run, caller: CALLER });
  assert.deepEqual([e.ok, e.closed, e.end, e.reason, e.already], [true, true, "ended", null, false]);
  const [c] = w.calledAs("close");
  assert.deepEqual([c.bound, c.condition, c.stepEnd], ["completed", null, "ended"]);
  assert.equal(WORD_KEYS.some((k) => k.startsWith("ai.run.ending.")), false, "screens-inquiry's words, not this module's");
  assert.equal(Object.values(e).some((v) => typeof v === "string" && /finished|stopped|ran out/i.test(v)), false, "the answer carries no ending sentence");
  assert.equal((await w.p.end({ run: o.run, caller: CALLER })).already, true, "an ended run answers as it ended, no second close");
  assert.equal(w.calledAs("close").length, 1);
});

test("R17: a condition outside CONDITION_KINDS is refused before anything is closed; one in it is passed to the close as given", async () => {
  const w = await world().standard();
  const o = await w.openRun("group");
  const bad = await w.p.end({ run: o.run, condition: "EXPLORE_PERSON_CAP_REACHED", caller: CALLER });
  assert.deepEqual([bad.ok, bad.code], [false, "AI_RUN_CONDITION_UNKNOWN"]);
  assert.equal(w.calledAs("close").length, 0, "nothing closed");
  assert.equal(w.row(`SELECT ended FROM explore_runs WHERE run=?`, o.run).ended, null);
  /* Control: a key of the record's vocabulary is accepted by the stand-in that refuses unknown ones. */
  assert.equal(runRules.checkCondition("text-undetermined"), null);
  const ok = await w.p.end({ run: o.run, condition: "text-undetermined", caller: CALLER });
  assert.deepEqual([ok.ok, ok.closed], [true, true]);
  assert.equal(w.calledAs("close")[0].condition, "text-undetermined");
});

test("R17: a close ai-runs refuses is carried in the answer (closed: false, the plane's code) and the row records that the end was not accepted; it never throws, and the run can be ended again", async () => {
  const w = await world().standard();
  const ps = people(w);
  const o = await w.openRun("group");
  w.closeRefuse = { run: o.run, found: true, terminated: false, ok: false, code: "AI_RUN_NOT_PRINCIPAL" };
  const past = await overCap(w, o, ps);
  assert.equal(past.code, "EXPLORE_PERSON_CAP_REACHED", "the look is still refused");
  assert.deepEqual([past.ended.closed, past.ended.code], [false, "AI_RUN_NOT_PRINCIPAL"]);
  const row = w.row(`SELECT ended, close_refused FROM explore_runs WHERE run=?`, o.run);
  assert.deepEqual([row.ended, row.close_refused], [null, "AI_RUN_NOT_PRINCIPAL"], "recorded as not closed");
  assert.equal(w.calledAs("stepEnd").length, 0, "ai-runs ended no step");
  assert.deepEqual(w.p.stopsFor({ viewer: "member:dana" }).stops, [], "an end ai-runs did not accept is no stop yet");
  /* end() carries the same refusal. */
  const e = await w.p.end({ run: o.run, end: "set_aside", reason: "x", caller: CALLER });
  assert.deepEqual([e.ok, e.closed, e.code], [false, false, "AI_RUN_NOT_PRINCIPAL"]);
  /* Control: ai-runs accepts it next time, and the row says so. */
  w.closeRefuse = null;
  const again = await w.p.end({ run: o.run, end: "set_aside", reason: "EXPLORE_PERSON_CAP_REACHED", caller: CALLER });
  assert.deepEqual([again.ok, again.closed], [true, true]);
  const done = w.row(`SELECT ended, reason, close_refused FROM explore_runs WHERE run=?`, o.run);
  assert.deepEqual([done.ended, done.reason, done.close_refused], ["set_aside", "EXPLORE_PERSON_CAP_REACHED", null]);
  assert.equal(w.p.stopsFor({ viewer: "member:dana" }).stops.length, 1);
  /* A close that throws, or that answers a run it does not know, is not accepted either. */
  const w2 = await world().standard();
  const o2 = await w2.openRun("group");
  w2.closeThrows = true;
  const t = await w2.p.end({ run: o2.run, caller: CALLER });
  assert.deepEqual([t.ok, t.closed, t.code], [false, false, null]);
  assert.equal(w2.row(`SELECT close_refused FROM explore_runs WHERE run=?`, o2.run).close_refused, "NOT_ACCEPTED");
  w2.closeThrows = false;
  w2.closeRefuse = { run: o2.run, found: false, note: "no such run" };
  assert.equal((await w2.p.end({ run: o2.run, caller: CALLER })).closed, false);
});

test("R17: the opening of a run answers after ai-runs has answered: a slow asynchronous open is awaited, and two ticks never open a question twice; a refused or failing open leaves no run", async () => {
  const w = await world().standard();
  w.openDelay = 20;
  await w.setExplore("group", "yes");
  const [a, b] = await Promise.all([w.p.exploreTick(w.clock.now), w.p.exploreTick(w.clock.now)]);
  assert.deepEqual([a.opened.length, b.opened.length], [1, 0], "the second tick sees the first's run");
  assert.equal(w.calledAs("open").length, 1);
  assert.match(a.opened[0].step, /^STP-/, "the step ai-runs answered, not a promise");
  assert.equal(w.count("explore_runs"), 1);
  /* Control: ai-runs failing to open (a rejection) is a refused open, never a throw out of the tick. */
  const w2 = await world().standard();
  await w2.setExplore("group", "yes");
  w2.aiRuns.open = async () => { throw new Error("ai-runs could not be reached"); };
  const t = await w2.p.exploreTick(w2.clock.now);
  assert.deepEqual([t.opened.length, t.refused], [0, 2], "the group's open failed; her own account's switch is off");
  assert.equal(w2.count("explore_runs"), 0);
});

test("R17: exploreDue, exploreWake and exploreTick answer promises (scheduler R27 awaits them)", async () => {
  const w = await world().standard();
  await w.setExplore("group", "yes");
  for (const call of [w.p.exploreDue(w.clock.now), w.p.exploreWake(w.clock.now), w.p.exploreTick(w.clock.now)])
    assert.equal(typeof call.then, "function");
});

test("R17, R15: a store made before the close_refused column gains it at migrate(), its runs kept, and migrate() stays idempotent", async () => {
  const { storage } = await import("./fixture.mjs");
  const { migrateQuestionExplorer, QUESTION_EXPLORER_SCHEMA } = await import("../../../src/question-explorer/index.mjs");
  const st = storage();
  const old = QUESTION_EXPLORER_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--") && !/^\s*close_refused\s/.test(l))
    .join("\n").replace(/actual\s+TEXT,\s*\)/, "actual     TEXT\n)");
  for (const s of old.split(";")) if (s.trim()) st.sql.exec(s);
  const cols = () => [...st.sql.exec(`PRAGMA table_info(explore_runs)`)].map((c) => c.name);
  assert.equal(cols().includes("close_refused"), false, "negative control: the old store lacks it");
  st.sql.exec(`INSERT INTO explore_runs (run, question, owner, step, day, opened_at) VALUES ('XPL-1', 'Q', 'group', 'STP-1', '2026-10-10', 't')`);
  migrateQuestionExplorer(st.sql);
  assert.equal(cols().includes("close_refused"), true);
  assert.equal([...st.sql.exec(`SELECT run FROM explore_runs`)].length, 1, "its runs kept");
  migrateQuestionExplorer(st.sql);
  assert.equal(cols().filter((c) => c === "close_refused").length, 1, "idempotent");
});
