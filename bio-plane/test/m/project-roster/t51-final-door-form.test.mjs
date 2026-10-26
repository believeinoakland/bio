/* R43 (fix round 10; K5157; walk-T51-final 03 §1): `by` is read in the form the door stamps it, `member:<id>` or the
   founder's `admin`, and is never prefixed again. At the interface, as the door sends each act: the declared acts
   (`projectstakeset`, `projectscopeset`, `projectapprovalset`) arrive with `by` in the viewer's form, so every act here is
   asked with `by=member:<id>` and read back by who it names. Controls: an invited member is refused, an outsider is
   answered as an id naming nothing, a non-owner is not the owner. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";

const enc = encodeURIComponent;
/* P hidden: ann owns, bob joined, cal invited only, dee outside; `second` an enrolled administrator. */
async function doorWorld() {
  const w = await world().group("ann", "bob", "cal", "dee");
  w.owned("PROJ-P", "ann", ["bob"], ["cal"]);
  return w;
}
const door = (w, op, by, params = {}, viewer = by) => {
  const q = Object.entries({ projectId: "PROJ-P", ...params, by: V(by), viewer: V(viewer) })
    .map(([k, v]) => `${k}=${enc(typeof v === "string" ? v : JSON.stringify(v))}`).join("&");
  return w.ops(q)[op]();
};

test("R43 projectStakeSet: a joined participant, an owner and an enrolled administrator stamped member:<id> are recognised and read back by who they are; invited and outside are controls", async () => {
  const w = await doorWorld();
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  for (const who of ["bob", "ann", "second"]) {
    const a = door(w, "projectstakeset", who, { stake: `by ${who}` });
    assert.deepEqual([a.ok, a.stake, a.by], [true, `by ${who}`, who], who);
    assert.equal(w.r.projectStake("PROJ-P").set_by, who, `${who} is the one recorded, not member:${who}`);
  }
  const founder = w.ops(`projectId=PROJ-P&stake=${enc("founder's")}&by=admin&viewer=admin`).projectstakeset();
  assert.equal(founder.ok, true, "the founder's bare admin");
  const before = snapshot(w);
  const invited = door(w, "projectstakeset", "cal", { stake: "x" });
  assert.deepEqual([invited.ok, invited.reason], [false, "PROJECT_ACT_NOT_A_PARTICIPANT"], "invited, not joined");
  assert.equal(snapshot(w), before, "the refusal wrote nothing");
});

test("R43 projectStakeSet: a hidden project's outsider stamped member:<id> is answered as an id naming nothing, and an administrator below FULL is not a participant", async () => {
  const w = await doorWorld();
  assert.deepEqual(door(w, "projectstakeset", "dee", { stake: "x" }), noSuchProject("PROJ-P"));
  const second = door(w, "projectstakeset", "second", { stake: "x" });
  assert.equal(second.ok, false, "an administrator not in a hidden project sets nothing");
});

test("R43 projectScopeSet: a joined participant stamped member:<id> sets a scope and the sole owner sets own; an invited member is refused", async () => {
  const w = await doorWorld();
  w.owned("PROJ-S", "dee");
  const a = door(w, "projectscopeset", "bob", { scope: "counsel_matter", reason: "counsel" });
  assert.deepEqual([a.ok, a.scope, a.by], [true, "counsel_matter", "bob"]);
  assert.equal(w.r.projectScope("PROJ-P").by, "bob", "recorded as her id, not member:bob");
  const own = door(w, "projectscopeset", "dee", { projectId: "PROJ-S", scope: "own", reason: "mine" });
  assert.deepEqual([own.ok, own.scope], [true, "own"]);
  const owner = door(w, "projectscopeset", "ann", { scope: "none", reason: "lifted" });
  assert.deepEqual([owner.ok, owner.scope], [true, "none"], "an owner");
  const cal = door(w, "projectscopeset", "cal", { scope: "counsel_matter", reason: "r" });
  assert.deepEqual([cal.ok, cal.reason], [false, "PROJECT_ACT_NOT_A_PARTICIPANT"], "invited");
  assert.deepEqual(door(w, "projectscopeset", "dee", { scope: "counsel_matter", reason: "r" }), noSuchProject("PROJ-P"), "outside");
});

test("R43 projectApprovalSet: an owner stamped member:<id> sets it, a joined non-owner is not the owner", async () => {
  const w = await doorWorld();
  const a = door(w, "projectapprovalset", "ann", { needs: [{ tier: 2 }], reason: "two pairs of eyes" });
  assert.deepEqual([a.ok, a.by], [true, "ann"]);
  assert.equal(w.r.secondApprovalNeeded({ projectId: "PROJ-P", tier: 2 }).needed, true);
  const b = door(w, "projectapprovalset", "bob", { needs: [], reason: "r" });
  assert.deepEqual([b.ok, b.reason], [false, "NOT_THE_OWNER"], "joined, not an owner");
  assert.equal(w.r.secondApprovalNeeded({ projectId: "PROJ-P", tier: 2 }).needed, true, "unchanged");
});

test("R43 the owner acts (add, remove, rescue) and the request acts read member:<id> as the member: the sole owner adds a second, an owner answers a request, an enrolled administrator rescues", async () => {
  const w = await doorWorld();
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  const add = door(w, "projectowneradd", "ann", { handle: "bob" });
  assert.deepEqual([add.ok, add.owner], [true, true], "the sole owner adds a second");
  assert.equal(door(w, "projectowneradd", "dee", { handle: "cal" }).ok, false, "an outsider adds none");
  assert.equal(door(w, "projectownerremove", "cal", { handle: "bob", reason: "r" }).reason, "NOT_THE_OWNER", "invited, not an owner");
  /* a request to join, asked and answered by member:<id> */
  const ask = door(w, "projectrequest", "dee", { comment: "please" });
  assert.deepEqual([ask.ok, ask.state], [true, "open"], "the requester is the member the stamp names");
  assert.equal(door(w, "projectrequests", "dee", { projectId: "" }).own, true, "her own list");
  const ans = door(w, "projectrequestanswer", "bob", { handle: "dee", answer: "decline", comment: "full" });
  assert.deepEqual([ans.ok, ans.state], [true, "declined"], "an owner answers");
  const list = door(w, "projectrequests", "ann", {});
  assert.deepEqual([list.ok, list.requests.length], [true, 1], "an owner reads a project's requests");
  assert.equal(door(w, "projectrequestwithdraw", "dee", {}).reason, "PROJECT_REQUEST_NONE_OPEN", "nothing left open");
  assert.equal(door(w, "projectparticipants", "bob", {}).ok, true, "a participant reads the roster");
});

test("R43 rescue: an enrolled administrator stamped member:<id> is the administrator at a project whose owners are all inactive", async () => {
  const w = await doorWorld();
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  const r = door(w, "projectownerrescue", "second", { handle: "bob", reason: "ann left" }, "second");
  assert.deepEqual([r.ok, r.owner], [true, true]);
  assert.equal(door(w, "projectownerrescue", "bob", { handle: "cal", reason: "x" }).reason, "NOT_AN_ADMIN", "a member is not an administrator");
});
