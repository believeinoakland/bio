/* R46 (T51; DEC-329 (3); N1233, K3806): each finding carries `state`, the applying decision's, else `open`; open_finding_count counts the `open` ones. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER } from "./fixture.mjs";

const T = (w, placements) =>
  w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements, threadedBy: "member:alice", viewer: MEMBER });
const read = (w) => w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER });
const stateOfStage = (r, sk) => r.findings.find((f) => f.stage_key === sk).state;
const STATES = ["open", "dismissed", "deferred"];

test("R46: a finding with no decision answers open, one dismissed at the current version dismissed, one deferred at an earlier version open", async () => {
  const w = seeded();
  w.define();
  const r = await T(w, [{ stage: "contract", captureSha: "sa" }]);
  assert.equal(r.findings.length, 2);
  for (const f of r.findings) assert.equal(f.state, "open");
  w.clock.now = "2026-09-03T00:00:00.000Z";
  w.p.disposeProposal({ key: "proc::need", to: "dismissed", reason: "declined", definitionVersion: 1, decidedBy: "member:alice" });
  assert.equal(stateOfStage(read(w), "need"), "dismissed");
  assert.equal(stateOfStage(read(w), "award"), "open");
  w.clock.now = "2026-09-04T00:00:00.000Z";
  w.p.disposeProposal({ key: "proc::award", to: "deferred", reason: "later", definitionVersion: 1, decidedBy: "member:alice" });
  assert.equal(stateOfStage(read(w), "award"), "deferred");
  // a revision: the decisions judged version 1, so they no longer apply and the findings read open again
  w.clock.now = "2026-09-05T00:00:00.000Z";
  w.define("proc", { contract: { within: "3 weeks" } }, { basis: "b", citation: "c" });
  const r3 = read(w);
  assert.equal(r3.findings.find((f) => f.stage_key === "need").disposition.applies, false);
  for (const f of r3.findings) assert.equal(f.state, "open");
});

test("R46 control: open_finding_count equals the count of open on every read that publishes it (R10, R19), and every state is one of the three", async () => {
  const w = seeded();
  w.define();
  await T(w, [{ stage: "contract", captureSha: "sa" }]);
  w.clock.now = "2026-09-03T00:00:00.000Z";
  w.p.disposeProposal({ key: "proc::need", to: "deferred", reason: "later", definitionVersion: 1, decidedBy: "member:alice" });
  const r = read(w);
  assert.equal(r.open_finding_count, r.findings.filter((f) => f.state === "open").length);
  assert.equal(r.open_finding_count, 1);
  assert.equal(r.finding_count, 2);
  const c = w.p.captureProgressions({ captureSha: "sa", nowMs: Date.parse("2026-12-01") });
  for (const i of c.instances) {
    assert.equal(i.open_finding_count, i.findings.filter((f) => f.state === "open").length);
    for (const f of i.findings) assert.ok(STATES.includes(f.state), f.state);
  }
  const need = c.instances[0].findings.filter((f) => f.stage_key === "need");
  for (const f of need) assert.equal(f.state, "deferred");
});

test("R46: the proposals feed's instances[] findings each carry state open, the decided ones having left it", async () => {
  const w = seeded();
  w.define();
  await T(w, [{ stage: "contract", captureSha: "sa" }]);
  w.clock.now = "2026-09-03T00:00:00.000Z";
  w.p.disposeProposal({ key: "proc::need", to: "dismissed", reason: "declined", definitionVersion: 1, decidedBy: "member:alice" });
  const feed = w.p.proposalsFeed(Date.parse("2026-12-01"));
  const fs = feed.instances.flatMap((i) => i.findings);
  assert.ok(fs.length > 0);
  assert.ok(!fs.some((f) => f.stage_key === "need"));
  for (const f of fs) assert.equal(f.state, "open");
});
