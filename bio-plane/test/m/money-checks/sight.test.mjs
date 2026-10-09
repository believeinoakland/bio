/* money-checks R5 and R13 (K2467; MONEY-CHECKS #4 J1): switching a detector is held only by a project's participants
   (membership R60: an administrator's sight is never a position), and a project seen at existence only answers C-70.1
   through membership's one site (its R77), never as absent. Negative controls: a participant still switches; a viewer
   at FULL reads as before. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, shareDetector, ALICE, ADMIN_BOB } from "./fixture.mjs";

const HIDDEN = "PROJ-2026-0001-hidden", OPEN = "PROJ-2026-0002-open";
function setup() {
  const w = world();
  w.member("carol");
  w.member("dave", "admin");
  w.project(HIDDEN, ["alice"]);
  w.discoverable(HIDDEN, "alice");
  /* set back to hidden by its owner, so it has an owner the administrator's existence answer names */
  assert.equal(w.membership.projectVisibilitySet({ projectId: HIDDEN, setting: "hidden", by: "alice", viewer: ALICE }).ok, true);
  w.project(OPEN, ["alice"]);
  w.discoverable(OPEN, "alice");
  w.entityAs("ENT-2026-0010", "institution");
  w.entityAs("ENT-2026-0011", "institution");
  w.factAs("MNY-2026-f1", { to: "ENT-2026-0010", amount: "800" });
  w.factAs("MNY-2026-f2", { to: "ENT-2026-0011", amount: "200" });
  const d = w.c.defineDetector(shareDetector());
  for (const p of [HIDDEN, OPEN]) assert.equal(w.c.switchDetector({ detectorId: d.detector_id, project: p, on: true, by: ALICE }).ok, true);
  w.c.runDetectors({ budgetMs: 10_000 });
  w.c.recordGate({ detectorId: d.detector_id, version: d.version, goldSet: "desk gold set 1", falseAlarmRate: "0.1", by: ADMIN_BOB });
  return { w, d };
}
const existence = (r, { owners }) => {
  assert.equal(r.ok, false);
  assert.equal(r.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(r.check, "C-70.1");
  assert.equal("items" in r, false);
  assert.equal("owners" in r, owners !== undefined);
  if (owners !== undefined) assert.deepEqual(r.owners, owners);
};

test("R5: switchDetector is held only by a participant: existence-only sight answers C-70.1, any other non-participant NOT_A_PARTICIPANT, nothing written", () => {
  const { w, d } = setup();
  const sw = (project, by, on = false) => w.c.switchDetector({ detectorId: d.detector_id, project, on, by });
  const before = w.snapshot();
  /* a hidden project: an administrator (and the founder) outside it at existence, its owner named; a member, nothing */
  existence(sw(HIDDEN, ADMIN_BOB), { owners: ["alice"] });
  existence(sw(HIDDEN, "admin"), { owners: ["alice"] });
  assert.equal(sw(HIDDEN, "member:carol").reason, "NO_SUCH_PROJECT");
  /* a discoverable project: a member outside it at existence (no owners); an administrator outside it sees it whole,
     and is still refused, since sight is never a position */
  existence(sw(OPEN, "member:carol"), { owners: undefined });
  for (const by of [ADMIN_BOB, "member:dave", "admin"]) {
    const r = sw(OPEN, by);
    assert.equal(r.reason, "NOT_A_PARTICIPANT", by);
    assert.equal(r.code, "NOT_A_PARTICIPANT");
    assert.equal(r.project, OPEN);
  }
  /* sight is asked before the switch's own value */
  assert.equal(sw(OPEN, ADMIN_BOB, "maybe").reason, "NOT_A_PARTICIPANT");
  assert.deepEqual(w.snapshot(), before);
  /* controls: a participant still switches, joined or invited, administrator or not */
  assert.equal(sw(OPEN, ALICE).ok, true);
  w.participate(OPEN, "dave", "invited");
  assert.equal(sw(OPEN, "member:dave", true).ok, true);
  w.participate(HIDDEN, "bob");
  assert.equal(sw(HIDDEN, ADMIN_BOB).ok, true);
  assert.equal(w.count("money_detector_switches"), 5);
});

test("R13: noticed naming a project seen at existence only answers C-70.1, never NO_SUCH_PROJECT; a FULL viewer reads as before", () => {
  const { w } = setup();
  existence(w.c.noticed({ project: HIDDEN, viewer: ADMIN_BOB }), { owners: ["alice"] });
  existence(w.c.noticed({ project: HIDDEN, viewer: "admin" }), { owners: ["alice"] });
  existence(w.c.noticed({ project: OPEN, viewer: "member:carol" }), { owners: undefined });
  /* none of the project's results or inputs travels in the refusal */
  const r = JSON.stringify(w.c.noticed({ project: HIDDEN, viewer: ADMIN_BOB }));
  for (const f of ["MNY-2026-f1", "MNY-2026-f2"]) assert.equal(r.includes(w.id(f)), false);
  /* seen at NONE: answered as absent, exactly as an id naming nothing (membership R61) */
  const none = w.c.noticed({ project: HIDDEN, viewer: "member:carol" });
  const absent = w.c.noticed({ project: "PROJ-2026-0404-none", viewer: "member:carol" });
  assert.equal(none.reason, "NO_SUCH_PROJECT");
  assert.deepEqual({ ...none, project: null }, { ...absent, project: null });
  /* no viewer sent: not asked at existence; still answered as absent */
  assert.equal(w.c.noticed({ project: OPEN }).reason, "NO_SUCH_PROJECT");
  /* controls at FULL: the participant, and an administrator outside a discoverable project (a read, not an act) */
  for (const viewer of [ALICE, ADMIN_BOB, "member:dave"]) {
    const ok = w.c.noticed({ project: OPEN, viewer });
    assert.equal(ok.ok, true, viewer);
    assert.equal(ok.items.length, 1, viewer);
  }
  assert.equal(w.c.noticed({ project: HIDDEN, viewer: ALICE }).items.length, 1);
});
