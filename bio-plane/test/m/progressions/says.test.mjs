/* R45 (T50; N1102; DEC-243, DEC-239): an overdue_successor finding says its words by key, through setup-words, and never "overdue", "late" or "missing". */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER } from "./fixture.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const T = (w, placements) =>
  w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements, threadedBy: "member:alice", viewer: MEMBER });
const overdueOf = (w, now) =>
  (w.p.captureProgressions({ captureSha: "sa", nowMs: Date.parse(now) }).instances[0]?.findings || []).filter((f) => f.kind === "overdue_successor");
const NO_WORD = /\b(overdue|late|missing)\b/i;

test("R45: a stage due in 10 days after step 1, past its deadline, says progression.expects with its interval, the step's number and the deadline day", async () => {
  const w = seeded();
  w.define("proc", { award: { within: "10 days" } });
  w.fact("sa", "2026-01-10");
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  const [f] = overdueOf(w, "2026-02-01T12:00:00Z");
  assert.equal(f.overdue, true);
  assert.deepEqual([f.says.key, f.says.vars], ["progression.expects", { interval: "10 days", n: 1, date: "2026-01-20" }]);
  assert.deepEqual(f.says.lead, { key: "progression.nodoc", vars: {} });
  assert.equal(f.says.words, `${word("progression.nodoc")} ${word("progression.expects", f.says.vars)}`);
  assert.equal(f.says.words, "No document threaded. The progression expects one within 10 days of step 1, by 2026-01-20.");
});

test("R45: where the predecessor has no own date the deadline is undetermined and the finding says progression.expects.undetermined without a date", async () => {
  const w = seeded();
  w.define("proc", { award: { within: "10 days" } });
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  const [f] = overdueOf(w, "2026-02-01T12:00:00Z");
  assert.equal(f.overdue, "undetermined");
  assert.deepEqual([f.says.key, f.says.vars], ["progression.expects.undetermined", { interval: "10 days", n: 1 }]);
  assert.equal(f.says.words, `${word("progression.nodoc")} ${word("progression.expects.undetermined", { interval: "10 days", n: 1 })}`);
});

test("R45 control: no value of says or its words contains overdue, late or missing; the identifiers kind, overdue, overdue_by and deadline stay", async () => {
  const w = seeded();
  w.define("proc", { award: { within: "2 weeks" } });
  w.fact("sa", "2026-01-10");
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  const [f] = overdueOf(w, "2026-03-01T12:00:00Z");
  assert.equal(f.kind, "overdue_successor");
  assert.ok(f.overdue === true && f.overdue_by && f.deadline);
  for (const v of [f.says.key, ...Object.values(f.says.vars), f.says.words, f.says.lead.key, word(f.says.lead.key), word(f.says.key, f.says.vars)])
    assert.doesNotMatch(String(v), NO_WORD);
  // the proposals feed carries the same finding with its says
  const feed = w.p.proposalsFeed(Date.parse("2026-03-01T12:00:00Z"));
  const inFeed = feed.instances.flatMap((i) => i.findings).find((x) => x.kind === "overdue_successor");
  assert.deepEqual(inFeed.says, f.says);
});

test("R45 (plan rule 6): an own date's reason and a refusal's translation are read by key through setup-words", async () => {
  const w = seeded();
  w.define();
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  const r = w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
  assert.equal(r.stages[0].documents[0].own_date_why, word("progressions.events_holds_dated_fact"));
  assert.equal(w.p.readProgression({ progressionKey: "proc", version: 9 }).translation, word("refusal.PROGRESSION_VERSION_NOT_HELD"));
});
