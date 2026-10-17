/* screens-inquiry R45 (R085-6; K3477; WALK-085 F2): the question's own run, from the press to its end, on interface-shell's
 * served page over a scripted plane. Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, press, inquiryMd, plane, says, section, word, P, Q } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }), agentpack: ok({ ok: true, pack: { version: "p@1" } }) };
const empty = inquiryMd(P, [], { legs: [] });
const reach = (o = {}) => ({ images: o.images, boot: { plane: { ...plane(o), ...REACH, airuns: ok({ ok: true, runs: [] }), ...(o.reach || {}) } } });
const mine = (o = {}) => ({ id: "RUN-" + "d".repeat(16), status: "running", ticks: 2, principal: { plane: "member:mai" }, ...o });

test("R45 the press draws state d before airunopen answers, its stop disabled; a refusal then replaces it, drawn as R33 says", async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const limit = { status: 200, json: { ok: true, result: { run: "x", started: false, code: "AI_LIMIT_REACHED", whose: "the group's", period: "monthly", when: "on 1 November" } } };
  const p = await open(at, reach({ images: { [Q]: { "bundle.md": empty } }, plane: { airunopen: async () => { await gate; return limit; } } }));
  assert.equal(section(p, "question.run.heading"), undefined, "nothing at work before the press");
  await press(p, "airunopen");
  const d = section(p, "question.run.heading");
  assert.ok(d, "state d is drawn while airunopen is unanswered");
  assert.ok(says(d, "question.run.leave"));
  assert.equal(p.byOp("airunopen").length, 1);
  assert.ok(d.querySelector("button[disabled]"), "its act is disabled until the answers arrive");
  assert.deepEqual(actsIn(d), [], "no live act in it yet");
  assert.equal(p.byOp("airundispatch").length, 0);
  release();
  await p.settle();
  assert.equal(section(p, "question.run.heading"), undefined, "the refusal replaces state d");
  assert.ok(says(section(p, "question.empty.ask"), "ai.refused.limit.overall", { whose: "the group's", period: "monthly", when: "on 1 November" }));
  assert.equal(p.byOp("airundispatch").length, 0);
});

test("R45 a withheld dispatch replaces state d with its reason by key", async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const p = await open(at, reach({ images: { [Q]: { "bundle.md": empty } }, plane: {
    airunopen: ok({ run: "x", started: true, status: "running" }),
    airundispatch: async () => { await gate; return ok({ run: "x", found: true, dispatched: false, status: "running", withheld: "AGENT_WORKER_UNBOUND" }); } } }));
  await press(p, "airunopen");
  assert.ok(section(p, "question.run.heading"), "drawn while the dispatch is unanswered");
  release();
  await p.settle();
  assert.equal(section(p, "question.run.heading"), undefined);
  assert.ok(says(main(p).querySelector('[data-refusal="airundispatch"]'), "dock.withheld.AGENT_WORKER_UNBOUND"));
});

test("R45 while the run works, airuns is read again at most once every 10 seconds and its ticks are drawn; its end is then stated", async () => {
  let runs = [];
  const p = await open(at, reach({ images: { [Q]: { "bundle.md": empty } }, reach: { airuns: () => ok({ ok: true, runs }) }, plane: {
    airunopen: (r) => { runs = [mine({ id: r.body.run, ticks: 1 })]; return ok({ run: r.body.run, started: true, status: "running" }); },
    airundispatch: ok({ run: "x", found: true, dispatched: true, status: "running" }) } }));
  await press(p, "airunopen");
  let d = section(p, "question.run.heading");
  assert.ok(d && says(d, "screen.assistant.run.running", { ticks: "1" }), "the run's ticks are drawn");
  assert.deepEqual(actsIn(d), ["airunclose"], "Stop the run, once the plane has answered");
  const reads = () => p.byOp("airuns").length;
  const n = reads();
  runs = [mine({ id: runs[0].id, ticks: 4 })];
  await p.clock.tick(9000);
  assert.equal(reads(), n, "not read again within 10 seconds");
  await p.clock.tick(1000);
  await p.settle();
  assert.equal(reads(), n + 1, "read again once after 10 seconds");
  assert.ok(says(section(p, "question.run.heading"), "screen.assistant.run.running", { ticks: "4" }), "seen to move");
  runs = [mine({ id: runs[0].id, ticks: 6, status: "ended", condition: { kind: "finished", bound: "wallclock" } })];
  await p.clock.tick(10000);
  await p.settle();
  assert.equal(section(p, "question.run.heading"), undefined, "an ended run is not drawn at work");
  const s = section(p, "question.empty.heading");
  assert.ok(says(s, "screen.assistant.run.ended", { why: word("ai.run.ending.wallclock") }), "its ending is stated");
  assert.deepEqual(actsIn(s).filter((a) => a === "airunopen"), ["airunopen"], "and the ask is offered again, once");
  const after = reads();
  await p.clock.tick(30000);
  assert.equal(reads(), after, "no more reading once it has ended");
});

test("R45 a run of hers that ended with no proposal draws the ending and the ask on a question that cites passages too", async () => {
  const ended = mine({ status: "ended", ticks: 5, condition: { kind: "finished", bound: "cancelled" } });
  const p = await open(at, reach({ reach: { airuns: ok({ ok: true, runs: [ended] }) } }));
  const m = main(p);
  assert.ok(says(m, "screen.assistant.run.ended", { why: word("ai.run.ending.cancelled") }));
  assert.equal(section(p, "question.run.heading"), undefined);
  assert.deepEqual(actsIn(m).filter((a) => a === "airunopen"), ["airunopen"]);
});

test("R45 a run that ended without a condition is named by its status; another member's ended run is not hers", async () => {
  const p = await open(at, reach({ images: { [Q]: { "bundle.md": empty } }, reach: { airuns: ok({ ok: true, runs: [mine({ status: "failed", ticks: 3 })] }) } }));
  assert.ok(says(section(p, "question.empty.heading"), "screen.assistant.run.ended", { why: word("ai.run.ending.unknown") }));
  const other = await open(at, reach({ images: { [Q]: { "bundle.md": empty } }, reach: { airuns: ok({ ok: true, runs: [mine({ status: "ended", principal: { plane: "member:ben" } })] }) } }));
  assert.equal(main(other).querySelector('[data-run="ended"]'), null);
});

test("R45 control: a question with no run draws state c, with no ending and no run at work", async () => {
  const p = await open(at, reach({ images: { [Q]: { "bundle.md": empty } } }));
  assert.ok(section(p, "question.empty.heading"));
  assert.equal(main(p).querySelector('[data-run="ended"]'), null);
  assert.equal(section(p, "question.run.heading"), undefined);
  assert.deepEqual(actsIn(section(p, "question.empty.heading")).sort(), ["airunopen", "search"]);
});
