/* R4: a member's standing-question answers, over the real `answers` (its R15–R20), on answers' own test world (the
   real retrieval runs each saved query; the AI half is off until its bar is met, plan Rules (7)). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { answersWorld, V } from "../answers/fixture.mjs";
import { producers, reader, ofKind, sentences } from "./fixture.mjs";

const BOB = V("bob");
const KIND = "standing-answer";
const day = (w, d) => w.at(`${d}T15:00:00.000Z`);

/* bob's standing question, its first run, then `finds` new budget documents, each found by its own day's run. */
async function setup(finds = 1) {
  const w = answersWorld();
  const q = w.a.standingQuestionSet({ author: BOB, question: "Anything new on the budget?", query: "title:budget", cadence: "daily", ends: "2026-12-31" });
  await w.a.standingTick(w.clock.now);
  for (let i = 1; i <= finds; i++) {
    w.document(`budget ${i}`, { title: `Budget ${i}` });
    day(w, `2026-10-${String(6 + i).padStart(2, "0")}`);
    await w.a.standingTick(w.clock.now);
  }
  const n = producers(w.host, { membership: w.membership, answers: w.a });
  return { w, q, ...reader(n) };
}

test("R4: one FINDING standing-answer per run that found something new, keyed by question and run, to the question's author and to nobody else", async () => {
  const { w, q, read } = await setup(2);
  const runs = w.a.standingAnswersFor({ member: BOB }).entries;
  assert.equal(runs.length, 2);
  const items = ofKind(read("bob", { now: w.clock.now }), KIND);
  assert.deepEqual(items.map((i) => i.id), runs.map((e) => `FINDING::standing-answer::${q.id}::${e.run}`));
  for (const it of items) {
    assert.equal(it.class, "FINDING");
    assert.deepEqual(it.recipients, ["bob"]);
    assert.equal(it.subject.kind, "standing_question");
    assert.equal(it.subject.id, q.id);
    assert.equal(it.label, "machine work, from your standing question", "labelled as the assistant's machine work");
    assert.equal(it.by, "the assistant's");
    assert.equal(it.basis.finds.ids.length, 1);
    assert.match(it.detail, /1 new find/);
  }
  for (const m of ["carol", "alice"]) assert.deepEqual(ofKind(read(m, { now: w.clock.now }), KIND), [], m);
  assert.deepEqual(read(null).items, []);
});

test("R4: told once: raised once per run and never repeated (a later read answers the same run's item, never a second); a run with nothing new raises none", async () => {
  const { w, read } = await setup(1);
  const first = ofKind(read("bob", { now: w.clock.now }), KIND).map((i) => i.id);
  day(w, "2026-10-09");
  await w.a.standingTick(w.clock.now);                 /* nothing new */
  assert.deepEqual(ofKind(read("bob", { now: w.clock.now }), KIND).map((i) => i.id), first);
});

test("R4: the detail names the new finds and the answer as answers holds it, or what held the AI half back, in plain words", async () => {
  const { w, read } = await setup(1);
  const it = ofKind(read("bob", { now: w.clock.now }), KIND)[0];
  assert.deepEqual(it.basis.held_back, { condition: "switch_off", switch: "copy" });
  assert.equal(it.basis.answer, null);
  assert.match(it.detail, /did not answer, because the assistant's half of standing questions is switched off on this copy/);
  for (const s of sentences(it)) assert.doesNotMatch(s, /\{|condition|switch_off/, s);
  /* an answer held is stated with it */
  const { NoticeProducers } = await import("../../../src/notice-producers/index.mjs");
  assert.equal(NoticeProducers.heldBackWords({ condition: "no_account" }), "you have no account of your own set for the assistant");
  assert.equal(NoticeProducers.heldBackWords({ condition: "switch_off", switch: "member" }), "your own switch for standing questions is off");
  assert.equal(NoticeProducers.heldBackWords({ condition: "ceiling", code: "AI_USE_CEILING_REACHED", translation: "You have reached your own daily limit." }),
               "You have reached your own daily limit");
  const n = (await import("./fixture.mjs")).fresh(w.host, { membership: w.membership, answers: { standingAnswersFor: () => ({ ok: true, cursor: null,
    entries: [{ question: { id: "STQ-1", question: "q?" }, run: 7, at: "2026-10-07T15:00:00Z", finds: { ids: ["a", "b"] },
                answer: { sentences: [{ text: "A new budget document is held." }, null] }, held_back: null, withheld: [], label: "machine work, from your standing question" }] }) } });
  const a = ofKind(reader(n).read("bob", { now: w.clock.now }), KIND)[0];
  assert.match(a.detail, /2 new finds; the assistant's answer: A new budget document is held\./);
});

test("R4: answers' pages are followed to their bound, and a cut is stated in facts", async () => {
  const { w } = await setup(0);
  const { fresh } = await import("./fixture.mjs");
  let asked = 0;
  const n = fresh(w.host, { membership: w.membership, answers: { standingAnswersFor: ({ after }) => {
    asked += 1;
    const from = Number(after || 0);
    return { ok: true, cursor: from + 200, entries: Array.from({ length: 200 }, (_, i) => ({ question: { id: "STQ-1", question: "q" }, run: from + i + 1,
      at: "2026-10-07T15:00:00Z", finds: { ids: ["x"] }, answer: null, held_back: { condition: "not_deployed" }, withheld: [] })) };
  } } });
  const r = reader(n).read("bob", { now: w.clock.now });
  assert.equal(asked, 5);
  assert.equal(ofKind(r, KIND).length, 1000);
  assert.deepEqual(r.facts.standing_answer, { bound: 1000, truncated: true });
});
