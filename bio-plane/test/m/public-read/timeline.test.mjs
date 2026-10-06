/* public-read — the published timeline (T33-65; C11, K1494): R27. `publishedCase` answers the edition's timeline as its
   signed document froze it (`publication` R63; `case-grammar.timelineOf`, its R20): the two lanes apart and never
   interleaved, each item with its `when` as held and its source, an item placed nowhere listed apart; nothing is read
   from `events`. The block is read through an injected `case-grammar.timelineOf` until case-grammar's T33-60 merges and
   these tests re-point at its writer (K1563 (1)). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { publishedSix } from "./fixture.mjs";
import { TIMELINE_SENTENCE } from "../../../src/public-read/index.mjs";

const CG = { calculationsOf: () => [],
             timelineOf: (fm) => (fm && fm.x_timeline ? JSON.parse(fm.x_timeline) : { they_did: [], we_did: [] }) };
const line = (t) => `x_timeline: '${JSON.stringify(t)}'`;
const THEY = [
  { lane: "they_did", ord: 0, when: { date: "2026-03-04", precision: "day" }, label: "The council approved the contract",
    ref: "EVT-2026-0001", source: { capture: "a".repeat(64) } },
  { lane: "they_did", ord: 1, when: { undetermined: true, after: "2026-03-04", before: "2026-04-01" },
    label: "The first payment was made", ref: "EVT-2026-0002", source: { capture: "b".repeat(64) } },
  { lane: "they_did", ord: 2, when: "nowhere", label: "A memo, undated", ref: "EVT-2026-0003",
    source: { capture: "c".repeat(64) } }];
const WE = [
  { lane: "we_did", ord: 0, when: { date: "2026-05-01", precision: "day" }, label: "We filed a records request",
    ref: "CASE-2026-0001#2", source: { entry: "CASE-2026-0001#2" } }];

test("R27 publishedCase answers the timeline as signed: the two lanes apart, each item in its own order with its when as held and its source, an item placed nowhere listed apart", () => {
  const { w } = publishedSix({ extra: [line({ they_did: THEY, we_did: WE })], caseGrammar: CG });
  const c = w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  const pick = (i) => [i.ord, i.when, i.label, i.ref, i.source];
  assert.deepEqual(c.timeline.they_did.map(pick), THEY.slice(0, 2).map(pick),
    "what they did, in its order; the undetermined date kept as held, with its bounds");
  assert.deepEqual(c.timeline.we_did.map(pick), WE.map(pick), "what we did, apart");
  assert.deepEqual(c.timeline.placed_nowhere.they_did.map(pick), [pick(THEY[2])], "placed nowhere, listed apart in its lane");
  assert.deepEqual(c.timeline.placed_nowhere.we_did, []);
  assert.equal(c.timeline.detail, TIMELINE_SENTENCE);
  /* never interleaved: no lane holds another lane's item, and there is no merged list */
  assert.equal(c.timeline.they_did.some((i) => WE.some((x) => x.ref === i.ref)), false);
  assert.equal(c.timeline.we_did.some((i) => THEY.some((x) => x.ref === i.ref)), false);
  assert.deepEqual(Object.keys(c.timeline).sort(), ["detail", "placed_nowhere", "they_did", "we_did"]);
});

test("R27 each edition answers its own frozen timeline (nothing read live); a document without the block answers both lanes empty", () => {
  const { w } = publishedSix({ edition: 2, extra: [line({ they_did: THEY.slice(0, 1), we_did: [] })], caseGrammar: CG });
  const one = w.read("publishedcase", { id: "CASE-2026-0001", edition: 1 });
  const two = w.read("publishedcase", { id: "CASE-2026-0001", edition: 2 });
  assert.equal(two.ok, true, JSON.stringify(two).slice(0, 300));
  assert.deepEqual(two.timeline.they_did.map((i) => i.ref), ["EVT-2026-0001"]);
  assert.deepEqual([one.timeline.they_did, one.timeline.we_did], [[], []], "edition 1 signed no timeline");
  assert.deepEqual(one.timeline.placed_nowhere, { they_did: [], we_did: [] });
});
