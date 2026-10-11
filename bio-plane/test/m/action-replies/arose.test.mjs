/* action-replies' `arose_from` link and its two reads at its interface (R2, R4). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, M, BOB, MACHINE, INFO, RFC, REQ, PROJ, PROJ2, PLAN, PLAN2 } from "./fixture.mjs";
import { ACTION_REPLY_CHECKS } from "../../../src/action-replies/index.mjs";

/* A records request sent and answered; a project alice and bob share, one only alice is in, and a plan in each. */
function linked() {
  const w = world();
  w.action(REQ);
  w.say(REQ, "sent", "2026-09-10");
  w.say(REQ, "received", "2026-09-20");
  w.bundle(PROJ, "project");
  w.bundle(PROJ2, "project");
  w.participant(PROJ, "alice"); w.participant(PROJ, "bob"); w.participant(PROJ2, "alice");
  w.bundle(PLAN, "action_plan", PROJ);
  w.bundle(PLAN2, "action_plan", PROJ2);
  return w;
}
const link = (w, arising, extra = {}) => w.r.aroseFromLink({ target: REQ, ord: 1, arising, author: M, viewer: M, ...extra });

test("R2 control: a link from a received entry lands, appended, project and plan matter alike; from a sent entry it is refused", () => {
  const w = linked();
  const before = w.counts();
  const r = link(w, { project: PROJ });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([r.target, r.ord, r.arising, r.by, r.at, r.weight], [REQ, 1, { project: PROJ }, M, "2026-09-28T12:00:00Z", "single"]);
  const m = link(w, { plan: PLAN, matter: "INQ-2026-0001-transfer" });
  assert.deepEqual([m.ok, m.arising], [true, { plan: PLAN, matter: "INQ-2026-0001-transfer" }]);
  assert.deepEqual(w.counts(), [before[0], before[1], before[2] + 2, before[3], before[4]], "two link rows; nothing else written");
  const sent = w.r.aroseFromLink({ target: REQ, ord: 0, arising: { project: PROJ2 }, author: M, viewer: M });
  assert.deepEqual([sent.reason, sent.check, sent.translation], ["AROSE_FROM_NOT_A_RESPONSE", "C-150.5",
    ACTION_REPLY_CHECKS.AROSE_FROM_NOT_A_RESPONSE.translation]);
});

test("R2 R4 refusals in order, each writing nothing: machine, no target, no such bundle (absent and invisible alike), not an action, not a response, the arising's form, no such project, already linked", () => {
  const w = linked();
  assert.equal(link(w, { project: PROJ }).ok, true);
  const before = w.counts();
  const code = (args) => w.r.aroseFromLink({ target: REQ, ord: 1, arising: { project: PROJ2 }, author: M, viewer: M, ...args });
  for (const author of [null, "", MACHINE]) {
    const r = code({ author, target: null, ord: 0, arising: null });
    assert.deepEqual([r.reason, r.check], ["MACHINE_CANNOT_LINK", "C-150.4"], String(author));
  }
  assert.equal(code({ target: null, arising: null }).reason, "NO_TARGET");
  assert.equal(code({ target: "ACTN-2026-0099-none", arising: null }).reason, "NO_SUCH_BUNDLE");
  assert.equal(code({ viewer: "nobody", arising: null }).reason, "NO_SUCH_BUNDLE", "an invisible action is absent");
  assert.equal(code({ target: INFO, arising: null }).reason, "NOT_AN_ACTION");
  for (const ord of [0, 5, null]) assert.equal(code({ ord, arising: null }).reason, "AROSE_FROM_NOT_A_RESPONSE", String(ord));
  for (const arising of [null, {}, { project: "INFO-2026-0001-memo" }, { project: PROJ, plan: PLAN, matter: "x" },
                         { plan: PLAN }, { plan: "nope", matter: "x" }, { plan: PLAN, matter: "" },
                         { plan: PLAN, matter: 'a "quoted" matter' }, { plan: PLAN, matter: "x".repeat(201) }, "PROJ"]) {
    const r = code({ arising });
    assert.deepEqual([r.reason, r.check], ["AROSE_FROM_REFUSED", "C-150.7"], JSON.stringify(arising));
  }
  /* a project the author does not see at FULL, and one that does not exist, answered alike through membership */
  const hidden = code({ author: BOB, viewer: BOB });
  const none = code({ arising: { project: "PROJ-2026-0099-none" } });
  assert.deepEqual([hidden.reason, hidden.code, none.reason], ["NO_SUCH_PROJECT", "NO_SUCH_PROJECT", "NO_SUCH_PROJECT"]);
  assert.equal(hidden.detail, none.detail, "not a hint either way");
  const again = code({ arising: { project: PROJ } });
  assert.deepEqual([again.reason, again.check], ["AROSE_FROM_LINKED", "C-150.6"]);
  assert.deepEqual(w.counts(), before, "nothing written by any refusal");
  /* the same project from another response is another link */
  w.say(REQ, "received", "2026-09-22");
  assert.equal(code({ ord: 2, arising: { project: PROJ } }).ok, true);
});

test("R2 aroseFrom answers what arose from a response and arisenFrom the response a project or matter arose from, each withholding whole what the viewer may not see; neither counts a chain", () => {
  const w = linked();
  assert.equal(link(w, { project: PROJ }).ok, true);
  assert.equal(link(w, { project: PROJ2 }).ok, true);
  assert.equal(link(w, { plan: PLAN2, matter: "INQ-2026-0001-transfer" }).ok, true);
  const before = w.counts();
  const a = w.r.aroseFrom({ target: REQ, ord: 1, viewer: M });
  assert.deepEqual(a.items.map((x) => x.arising), [{ project: PROJ }, { project: PROJ2 }, { plan: PLAN2, matter: "INQ-2026-0001-transfer" }]);
  assert.deepEqual([a.items[0].by, a.items[0].at, a.items[0].ord], [M, "2026-09-28T12:00:00Z", 1]);
  /* bob is in PROJ only: PROJ2 and the plan in it are withheld whole */
  assert.deepEqual(w.r.aroseFrom({ target: REQ, ord: 1, viewer: BOB }).items.map((x) => x.arising), [{ project: PROJ }]);
  assert.deepEqual(w.r.aroseFrom({ target: REQ, viewer: M }).items.length, 3, "every response without ord");
  assert.deepEqual(w.r.aroseFrom({ target: REQ, ord: 0, viewer: M }).items, []);
  assert.equal(w.r.aroseFrom({ target: REQ, viewer: "nobody" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.r.aroseFrom({ target: null, viewer: M }).reason, "NO_TARGET");
  for (const x of [a]) assert.ok(!("count" in x) && !("depth" in x) && !("chain" in x), "no count of a chain");
  /* arisenFrom, both forms, either call shape */
  const p = w.r.arisenFrom({ project: PROJ }, M);
  assert.deepEqual(p.items, [{ action: REQ, ord: 1, by: M, at: "2026-09-28T12:00:00Z" }]);
  assert.deepEqual(w.r.arisenFrom({ project: PROJ, viewer: BOB }).items.map((x) => x.action), [REQ]);
  assert.deepEqual(w.r.arisenFrom({ plan: PLAN2, matter: "INQ-2026-0001-transfer" }, M).items.map((x) => [x.action, x.ord]), [[REQ, 1]]);
  assert.deepEqual(w.r.arisenFrom({ plan: PLAN, matter: "INQ-2026-0001-transfer" }, M).items, [], "no link from that matter");
  /* what bob may not see is withheld whole: the project and the plan answered as absent */
  assert.equal(w.r.arisenFrom({ project: PROJ2 }, BOB).reason, "NO_SUCH_PROJECT");
  assert.equal(w.r.arisenFrom({ plan: PLAN2, matter: "INQ-2026-0001-transfer" }, BOB).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.r.arisenFrom({ project: "x" }, M).reason, "AROSE_FROM_REFUSED");
  assert.deepEqual(w.counts(), before, "the reads write nothing");
});

test("R2 R4 a response on an action the viewer may not see is withheld from arisenFrom; a machine never links; the links are cleared by the action's purge", () => {
  const w = linked();
  /* an action inside PROJ2, which bob may not see, with a response linked to PROJ */
  const inner = "ACTN-2026-0009-inner";
  assert.equal(w.promote(inner, w.text(REQ).replaceAll(REQ, inner), { extra: { project: PROJ2 } }).ok, true);
  w.say(inner, "sent"); w.say(inner, "received");
  w.st.db.prepare(`UPDATE bundles SET project=? WHERE bundle_id=?`).run(PROJ2, inner);
  assert.equal(w.r.aroseFromLink({ target: inner, ord: 1, arising: { project: PROJ }, author: M, viewer: M }).ok, true);
  assert.equal(link(w, { project: PROJ }).ok, true);
  assert.deepEqual(w.r.arisenFrom({ project: PROJ }, M).items.map((x) => x.action).sort(), [REQ, inner].sort());
  assert.deepEqual(w.r.arisenFrom({ project: PROJ }, BOB).items.map((x) => x.action), [REQ], "the hidden action withheld whole");
  assert.equal(link(w, { project: PROJ2 }, { author: MACHINE, viewer: MACHINE }).reason, "MACHINE_CANNOT_LINK");
  w.record.purge({ bundleId: REQ });
  assert.deepEqual(w.rows(`SELECT bundle_id FROM action_arose_from`).map((r) => r.bundle_id), [inner]);
});
