/* screens-inquiry R47 and R48 (R085-24; K3510; WALK-085 r4): the question page draws its run beside waiting proposals and
 * finds a running run on load; the dock draws her latest ended run. On interface-shell's served page over a scripted
 * plane; every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, inquiryMd, plane, says, section, word, BASIS, P, Q } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }), agentpack: ok({ ok: true, pack: { version: "p@1" } }) };
const reach = (o = {}) => ({ images: o.images, boot: { plane: { ...plane(o), ...REACH, airuns: ok({ ok: true, runs: [] }), ...(o.reach || {}) } } });
const mine = (o = {}) => ({ id: "RUN-" + "e".repeat(16), status: "running", ticks: 2, principal: { plane: "member:mai" }, ...o });
const proposed = { name: "Proposed", state: "suggested", author: "class:ai/t", run: "RUN-1", claim: { text: "About 9 in 10 within seven days." }, grounds: [],
  legs: [{ target_id: "INFO-2026-0004", target_title: "the 2026 performance report" }] };
const withProposal = { basisversions: (r) => ok({ ...BASIS(), versions: [...BASIS().versions, proposed],
  ...(r.query.project ? { current: { project: r.query.project, version: "main", at: "2026-10-06T09:00:00Z", by: "dev" } } : {}) }) };

test("R47 an ended run with proposals waiting draws the ending and the ask above them", async () => {
  const ended = mine({ status: "ended", ticks: 5, condition: { kind: "finished", bound: "wallclock" } });
  const p = await open(at, reach({ plane: withProposal, reach: { airuns: ok({ ok: true, runs: [ended] }) } }));
  const m = main(p);
  const text = m.textContent;
  const end = text.indexOf(word("screen.assistant.run.ended", { why: "wallclock" }));
  const prop = text.indexOf(word("question.proposal.heading"));
  assert.ok(end >= 0 && prop >= 0, "both are drawn");
  assert.ok(end < prop, "the ending stands above the proposals");
  assert.ok(section(p, "question.proposal.heading"), "the proposal is still drawn");
  const ask = m.querySelector('[data-run="ended"]');
  assert.deepEqual(actsIn(ask).filter((a) => a === "airunopen"), ["airunopen"], "the ask is offered with the ending");
  /* a state-c question (nothing cited) with waiting proposals says the ending too */
  const empty = inquiryMd(P, [], { legs: [] });
  const c = await open(at, reach({ images: { [Q]: { "bundle.md": empty } }, plane: withProposal, reach: { airuns: ok({ ok: true, runs: [ended] }) } }));
  assert.ok(says(section(c, "question.empty.heading"), "screen.assistant.run.ended", { why: "wallclock" }));
});

test("R47 a running run found on load, not pressed on this page, draws state d and is read again until it ends", async () => {
  let runs = [mine({ ticks: 1 })];
  const p = await open(at, reach({ reach: { airuns: () => ok({ ok: true, runs }) } }));
  let d = section(p, "question.run.heading");
  assert.ok(d, "state d is drawn for a run the page did not start");
  assert.ok(says(d, "screen.assistant.run.running", { ticks: "1" }));
  assert.deepEqual(actsIn(d), ["airunclose"]);
  const reads = () => p.byOp("airuns").length;
  const n = reads();
  runs = [mine({ ticks: 3 })];
  await p.clock.tick(9000);
  assert.equal(reads(), n, "not read again within 10 seconds");
  await p.clock.tick(1000);
  await p.settle();
  assert.equal(reads(), n + 1, "read again after 10 seconds");
  assert.ok(says(section(p, "question.run.heading"), "screen.assistant.run.running", { ticks: "3" }));
  runs = [mine({ ticks: 4, status: "ended", condition: { kind: "finished", bound: "wallclock" } })];
  await p.clock.tick(10000);
  await p.settle();
  assert.equal(section(p, "question.run.heading"), undefined);
  assert.ok(says(main(p), "screen.assistant.run.ended", { why: "wallclock" }));
  const after = reads();
  await p.clock.tick(30000);
  assert.equal(reads(), after, "reading stops once it has ended");
  /* another member's running run is not hers */
  const other = await open(at, reach({ reach: { airuns: ok({ ok: true, runs: [mine({ principal: { plane: "member:ben" } })] }) } }));
  assert.equal(section(other, "question.run.heading"), undefined);
});

test("R47 control: no run, with proposals pending, draws the proposals as before and no ending", async () => {
  const p = await open(at, reach({ plane: withProposal }));
  assert.ok(section(p, "question.proposal.heading"));
  assert.equal(main(p).querySelector('[data-run="ended"]'), null);
  assert.equal(section(p, "question.run.heading"), undefined);
});

/* ---- R48: the dock ---- */
const dockPlane = (runs) => ({ ...plane(), ...REACH, groupkeystate: ok({ held: true, on: true }), aiusage: ok({ ok: true }), aikeepawaystate: ok({ ok: true, on: false }),
  airuns: ok({ ok: true, runs }) });
async function dock(runs) {
  const p = await open(at, { boot: { plane: dockPlane(runs) } });
  await p.click(p.root().querySelector('.cs-mast [data-shell="dock"]'));
  await p.settle();
  return p;
}
const panel = (p) => p.root().querySelector(".cs-dock");

test("R48 two ended runs draw the later's ending, not \"No run yet\"; the ask is offered", async () => {
  const later = mine({ id: "RUN-" + "b".repeat(16), status: "ended", condition: { kind: "finished", bound: "wallclock" } });
  const earlier = mine({ id: "RUN-" + "a".repeat(16), status: "ended", condition: { kind: "finished", bound: "cancelled" } });
  const p = await dock([later, earlier]);
  assert.ok(says(panel(p), "screen.assistant.run.ended", { why: "wallclock" }));
  assert.ok(!says(panel(p), "screen.assistant.run.ended", { why: "cancelled" }));
  assert.ok(!says(panel(p), "screen.assistant.run.none"));
  assert.ok(button(p, "airunopen", panel(p)), "Work on this is offered again");
  /* an ended run with no condition is named by its status; another member's ended run is not hers */
  const failed = await dock([mine({ status: "failed" })]);
  assert.ok(says(panel(failed), "screen.assistant.run.ended", { why: "failed" }));
  const other = await dock([mine({ status: "ended", principal: { plane: "member:ben" } })]);
  assert.ok(says(panel(other), "screen.assistant.run.none"));
});

test("R48 control: no run of hers draws \"No run yet\"", async () => {
  const p = await dock([]);
  assert.ok(says(panel(p), "screen.assistant.run.none"));
  assert.ok(!panel(p).querySelector('[data-run="ended"]'));
});
