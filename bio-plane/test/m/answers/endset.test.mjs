/* A standing question's end date changed by its author (R34; T45-14; N855 (6d); Actions D6d; v0.2 rule 17), at the
   interface, over the real record-core, membership, retrieval and credentials of answers' test world. The copy is in
   the test profile's zone and today is 2026-10-05, local. `following`'s R25 `keep` reaches it inside its own act: the
   tests run it inside an outer transaction to stand for that act, committed and rolled back. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { answersWorld, V } from "./fixture.mjs";
import { ANSWERS_CHECKS, answersOps } from "../../../src/answers/index.mjs";

const BOB = V("bob"), CAROL = V("carol"), ALICE = V("alice");
const set = (w, over = {}) => w.a.standingQuestionSet({ author: BOB, question: "Anything new on the budget?", query: "title:budget",
                                                       cadence: "daily", ends: "2026-12-31", ...over });
const endSet = (w, over = {}) => w.a.standingQuestionEndSet({ author: BOB, ends: "2027-01-31", ...over });
const code = (r) => r.code ?? r.reason;
const day = (w, d) => w.at(`${d}T15:00:00.000Z`);

test("R34 refusals in order, each writing nothing: a machine or empty author MACHINE_CANNOT_AUTHOR; a question not the author's, an administrator's ask included, answered as an absent one NO_SUCH_STANDING_QUESTION; an ended one STANDING_ENDED, by its author or its date; an end not a calendar day after today STANDING_NEEDS_END", () => {
  const w = answersWorld();
  const q = set(w);
  const told = [];
  assert.equal(w.a.onStandingSet("scheduler", (x) => told.push(x)).ok, true);
  const before = w.snapshot();
  /* a machine or empty author, first, whatever else is wrong */
  for (const author of ["class:ai", null, "", "nobody", "machine:worker"])
    assert.equal(code(endSet(w, { id: q.id, author })), "MACHINE_CANNOT_AUTHOR", String(author));
  assert.equal(code(endSet(w, { id: "STQ-2026-0999", author: "class:ai", ends: "x" })), "MACHINE_CANNOT_AUTHOR", "before the question");
  assert.equal(endSet(w, { id: q.id, author: null }).translation, ANSWERS_CHECKS.MACHINE_CANNOT_AUTHOR.translation);
  /* not the author's: another member, an administrator and the bare admin stamp, answered as for none */
  const absent = endSet(w, { id: "STQ-2026-0999" });
  assert.equal(code(absent), "NO_SUCH_STANDING_QUESTION");
  for (const author of [CAROL, ALICE, "admin"])
    assert.deepEqual(endSet(w, { id: q.id, author }), { ...absent, id: q.id }, String(author));
  assert.deepEqual(endSet(w, { id: q.id, author: CAROL, ends: "not a day" }), { ...absent, id: q.id }, "before the end's check");
  /* an end date that is no calendar day after today's local day (2026-10-05) */
  for (const ends of [undefined, null, "", "next year", "2026-02-31", "2027-1-31", 20270131, "2026-10-05", "2026-10-04", "2026-01-01"])
    assert.equal(code(endSet(w, { id: q.id, ends })), "STANDING_NEEDS_END", String(ends));
  assert.equal(endSet(w, { id: q.id, ends: "2026-10-05" }).translation, ANSWERS_CHECKS.STANDING_NEEDS_END.translation);
  assert.deepEqual(w.snapshot(), before, "a refusal writes nothing");
  assert.deepEqual(told, [], "a refusal tells no one");
  /* control: the same act, by its author, with a day after today */
  const ok = endSet(w, { id: q.id, ends: "2026-10-06" });
  assert.deepEqual(ok, { ok: true, id: q.id, ends: "2026-10-06", was: "2026-12-31" });

  /* ended by its author's act: never revived, whatever the end asked */
  const ended = set(w);
  assert.equal(w.a.standingQuestionEnd({ id: ended.id, author: BOB }).ok, true);
  const atEnd = w.snapshot();
  told.length = 0;
  for (const ends of ["2027-01-31", "not a day"]) {
    const r = endSet(w, { id: ended.id, ends });
    assert.equal(code(r), "STANDING_ENDED", ends);
    assert.equal(r.check, "C-135.16"); assert.equal(r.translation, ANSWERS_CHECKS.STANDING_ENDED.translation);
  }
  assert.equal(code(endSet(w, { id: ended.id, author: CAROL })), "NO_SUCH_STANDING_QUESTION", "another's ended question is as absent");
  assert.deepEqual(w.snapshot(), atEnd, "STANDING_ENDED writes nothing");
  assert.deepEqual(told, []);
  assert.equal(w.a.standingQuestionRead({ id: ended.id, viewer: BOB }).question.ended.by, BOB, "still ended");

  /* ended by passing its end date (R16), before any read or tick has recorded that it ended */
  const short = set(w, { ends: "2026-10-07" });
  const shortControl = set(w, { ends: "2026-10-09" });
  day(w, "2026-10-08");
  const past = w.snapshot();
  assert.equal(code(endSet(w, { id: short.id, ends: "2026-12-31" })), "STANDING_ENDED", "past its end date: never revived");
  assert.deepEqual(w.snapshot(), past, "that refusal writes nothing, not even the ending");
  assert.equal(w.a.standingQuestionRead({ id: short.id, viewer: BOB }).question.ended.by, "ends");
  /* control: on its last day it is still running, and its end may still move */
  assert.equal(endSet(w, { id: shortControl.id, ends: "2026-12-31" }).ok, true, "on 2026-10-08 an end of 10-09 has not passed");
});

test("R34 the author changes the end: {ok, id, ends, was}; an equal end answers unchanged and writes nothing; each earlier end stays readable on the question, with who and when, to its author alone; no model, no account", () => {
  const w = answersWorld();
  const touched = [];
  /* (T48-36) both: ai-accounts for keep-away and the account, credentials for the standing grant */
  for (const n of ["accounts", "credentials"]) {
    const real = w[n];
    w.a.deps[n] = new Proxy(real, { get: (t, k) => { const v = t[k]; return typeof v === "function" ? (...a) => { touched.push(`${n}.${String(k)}`); return v.apply(t, a); } : v; } });
    w.a.resolved.delete(n);
  }
  /* carol: no reference of her own, and the group holds no key (R26) */
  const q = set(w, { author: CAROL });
  assert.deepEqual(w.a.standingQuestionRead({ id: q.id, viewer: CAROL }).question.ends_changes, [], "never changed");
  const t1 = w.clock.now;
  assert.deepEqual(endSet(w, { id: q.id, author: CAROL, ends: "2027-03-01" }), { ok: true, id: q.id, ends: "2027-03-01", was: "2026-12-31" });
  day(w, "2026-10-06");
  const t2 = w.clock.now;
  assert.deepEqual(endSet(w, { id: q.id, author: CAROL, ends: "2026-11-15" }), { ok: true, id: q.id, ends: "2026-11-15", was: "2027-03-01" });
  /* the same end: unchanged, nothing written */
  const before = w.snapshot();
  assert.deepEqual(endSet(w, { id: q.id, author: CAROL, ends: "2026-11-15" }), { ok: true, id: q.id, ends: "2026-11-15", unchanged: true });
  assert.deepEqual(w.snapshot(), before, "an equal end writes nothing");
  const read = w.a.standingQuestionRead({ id: q.id, viewer: CAROL }).question;
  assert.equal(read.ends, "2026-11-15");
  assert.deepEqual(read.ends_changes, [{ ends: "2027-03-01", was: "2026-12-31", at: t1, by: CAROL },
                                       { ends: "2026-11-15", was: "2027-03-01", at: t2, by: CAROL }], "each earlier end, who and when");
  assert.deepEqual(w.a.standingQuestionsOf({ viewer: CAROL }).questions[0].ends_changes, read.ends_changes);
  /* to its author alone: any other viewer is answered as for none, an administrator included */
  for (const viewer of [BOB, ALICE, "admin", "class:ai", null]) {
    assert.equal(code(w.a.standingQuestionRead({ id: q.id, viewer })), "NO_SUCH_STANDING_QUESTION", String(viewer));
    assert.doesNotMatch(JSON.stringify(w.a.standingQuestionsOf({ viewer })), /2027-03-01/, String(viewer));
  }
  assert.deepEqual(touched, [], "no account is read and no grant asked for");
  assert.equal(w.limit.asked.length, 0, "no limit asked");
  assert.equal(w.rows(`SELECT * FROM ai_grants`).length, 0);
  assert.equal(w.rows(`SELECT * FROM answers_tallies`).length, 0, "no ask counted");
});

test("R34 from the change, R16's ending by date and R17's due read the new end: an end moved later keeps it running past the old date, one moved earlier ends it on passing the new date", async () => {
  const w = answersWorld();
  const later = set(w, { ends: "2026-10-07" });
  const earlier = set(w, { ends: "2026-12-31", question: "earlier" });
  const control = set(w, { ends: "2026-10-07", question: "control" });
  await w.a.standingTick(w.clock.now);
  assert.equal(endSet(w, { id: later.id, ends: "2026-10-20" }).ok, true);
  assert.equal(endSet(w, { id: earlier.id, ends: "2026-10-06" }).ok, true);
  day(w, "2026-10-08");
  const t = await w.a.standingTick(w.clock.now);
  assert.deepEqual(t.ran.map((x) => x.id), [later.id], "the moved-later one runs; the control and the moved-earlier one do not");
  assert.equal(w.a.standingQuestionRead({ id: later.id, viewer: BOB }).question.ended, null);
  assert.equal(w.a.standingQuestionRead({ id: earlier.id, viewer: BOB }).question.ended.by, "ends");
  assert.equal(w.a.standingQuestionRead({ id: control.id, viewer: BOB }).question.ended.by, "ends");
  assert.equal(w.a.standingWake(w.clock.now), "2026-10-09T03:00:00Z", "the wake reads the new end");
  day(w, "2026-10-21");
  assert.deepEqual((await w.a.standingTick(w.clock.now)).ran, [], "past the new end it runs no more");
  assert.equal(w.a.standingQuestionRead({ id: later.id, viewer: BOB }).question.ended.by, "ends");
  assert.equal(w.a.standingWake(w.clock.now), null);
});

test("R34 R27 the listeners are told once, after the act's transaction, with the next due day: at once on the author's own act; inside another module's act (following R25's keep) only once that commits, never when it rolls back; a refusal and an unchanged end tell no one", async () => {
  const w = answersWorld();
  const told = [];
  assert.equal(w.a.onStandingSet("scheduler", (x) => told.push({ ...x, ends: w.a.standingQuestionRead({ id: x.question, viewer: BOB }).question.ends })).ok, true);
  assert.equal(w.a.onStandingSet("thrower", () => { throw new Error("down"); }).ok, true);
  const q = set(w);
  told.length = 0;
  /* not yet run: due today; told after the change is written */
  assert.equal(endSet(w, { id: q.id, ends: "2027-01-31" }).ok, true, "a throwing listener never undoes the act");
  assert.deepEqual(told, [{ question: q.id, due: "2026-10-05", ends: "2027-01-31" }]);
  await w.a.standingTick(w.clock.now);
  /* inside an act that rolls back: nothing changes and no one is told */
  told.length = 0;
  const before = w.snapshot();
  const rolled = w.record.transact(() => {
    const r = endSet(w, { id: q.id, ends: "2027-02-28" });
    assert.equal(r.ok, true);
    return { ok: false, reason: "THE_OUTER_ACT_REFUSED" };
  });
  assert.equal(rolled.reason, "THE_OUTER_ACT_REFUSED");
  assert.deepEqual(w.snapshot(), before, "rolled back with the act around it");
  assert.deepEqual(told, [], "never told for an act that rolled back");
  /* inside an act that commits: told once, after the commit, with the next due day the run set */
  let inside = null;
  w.record.transact(() => { endSet(w, { id: q.id, ends: "2027-02-28" }); inside = told.length; return { ok: true }; });
  assert.equal(inside, 0, "not told inside the act");
  assert.deepEqual(told, [{ question: q.id, due: "2026-10-06", ends: "2027-02-28" }]);
  /* an unchanged end and a refusal tell no one */
  endSet(w, { id: q.id, ends: "2027-02-28" });
  endSet(w, { id: q.id, ends: "2026-10-01" });
  endSet(w, { id: q.id, author: CAROL });
  assert.equal(told.length, 1);
  /* a next due day after the new end: told with no due day, as it will not run again */
  const weekly = set(w, { cadence: "weekly", question: "weekly" });
  await w.a.standingTick(w.clock.now);   /* next due 2026-10-12 */
  told.length = 0;
  assert.equal(endSet(w, { id: weekly.id, ends: "2026-10-10" }).ok, true);
  assert.deepEqual(told.map(({ question, due }) => ({ question, due })), [{ question: weekly.id, due: null }]);
});

test("R34 op=standingendset: the author is the control plane's viewer stamp, the id from the query or the body, the end from the body", () => {
  const w = answersWorld();
  const q = set(w);
  const url = (viewer, id) => new URL(`https://plane.test/op?viewer=${encodeURIComponent(viewer)}${id ? `&id=${id}` : ""}`);
  assert.deepEqual(answersOps(w.a, url(BOB, q.id), { ends: "2027-01-31", author: CAROL }).standingendset(),
                   { ok: true, id: q.id, ends: "2027-01-31", was: "2026-12-31" }, "a body's author is not read");
  assert.deepEqual(answersOps(w.a, url(BOB), { id: q.id, ends: "2027-02-28" }).standingendset(),
                   { ok: true, id: q.id, ends: "2027-02-28", was: "2027-01-31" });
  assert.equal(code(answersOps(w.a, url(CAROL, q.id), { ends: "2027-03-31" }).standingendset()), "NO_SUCH_STANDING_QUESTION");
  assert.equal(code(answersOps(w.a, url("class:ai", q.id), { ends: "2027-03-31" }).standingendset()), "MACHINE_CANNOT_AUTHOR");
});
