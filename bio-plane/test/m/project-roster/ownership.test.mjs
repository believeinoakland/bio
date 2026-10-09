/* Ownership (R3–R7), moved with its acts from membership's `ownership.test.mjs`, `t9-notice-sight-bounds.test.mjs`
   (the owner-deciders bound) and `t14-rows-remedy-order.test.mjs` (the rescue's remedy, C-56.5's row), renamed to this
   module's ids (K874). At the interface: membership's acts set up the participation, this module's acts are asked. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { Membership, notAnAdmin, noSuchProject, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { PROJECT_ROSTER_CHECKS } from "../../../src/project-roster/index.mjs";

/* P owned by ann; bob, cal, dee joined; eve invited */
async function owned() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve");
  w.owned("PROJ-P", "ann", ["bob", "cal", "dee"], ["eve"]);
  return w;
}
const add = (w, handle, by) => w.r.projectOwnerAdd({ projectId: "PROJ-P", handle, by, viewer: V(by) });
const rem = (w, handle, by, reason = "because") => w.r.projectOwnerRemove({ projectId: "PROJ-P", handle, by, reason, viewer: V(by) });

test("R3 projectOwnerAdd: refusals in order; an invited, leaving or absent member is TARGET_NOT_JOINED (C-56.5); the sole owner adds alone, then every owner's vote", async () => {
  const w = await owned();
  await w.enrol("fay");
  w.m.memberSet({ memberId: "fay", status: "revoked", by: "admin" });
  assert.equal(add(w, "bob", "cal").reason, "NOT_THE_OWNER");
  assert.deepEqual(add(w, "bob", "second"), w.m.existenceAct("PROJ-P", V("second")),
    "an administrator not in hidden P is at its EXISTENCE (D54): C-70.1 first; at FULL, NOT_THE_OWNER (below)");
  assert.equal(add(w, "zed", "ann").reason, "NO_SUCH_HANDLE");
  assert.equal(add(w, "fay", "ann").reason, "NOT_ACTIVE");
  const inv = add(w, "eve", "ann");
  assert.deepEqual([inv.reason, inv.state], ["TARGET_NOT_JOINED", "invited"]);
  assert.equal(w.row(`SELECT state FROM project_participants WHERE member_id='eve'`).state, "invited", "not joined by it");
  w.m.projectLeave({ projectId: "PROJ-P", by: "dee", viewer: V("dee") });
  const leaving = add(w, "dee", "ann");
  assert.deepEqual([leaving.reason, leaving.state], ["TARGET_NOT_JOINED", "leaving"]);
  const absent = add(w, "second", "ann");
  assert.deepEqual([absent.reason, "state" in absent], ["TARGET_NOT_JOINED", false], "no participation, no state");
  assert.equal(add(w, "ann", "ann").reason, "ALREADY_AN_OWNER");
  const first = add(w, "bob", "ann");
  assert.deepEqual([first.ok, first.owner, first.owners, first.deciders], [true, true, ["ann", "bob"], ["ann"]],
    "the sole owner adds the second alone");
  const c = add(w, "cal", "ann");
  assert.deepEqual([c.reason, c.have, c.awaiting], ["CONSENSUS_REQUIRED", ["ann"], ["bob"]]);
  assert.equal(w.m.isProjectOwner("PROJ-P", "cal"), false, "not an owner while a vote is awaited");
  const d = add(w, "cal", "bob");
  assert.deepEqual([d.ok, d.owners, d.deciders], [true, ["ann", "bob", "cal"], ["ann", "bob"]]);
  assert.deepEqual(w.m.projectOwners("PROJ-P"), ["ann", "bob", "cal"], "owners in the order they became owners");
  assert.deepEqual(w.m.participation("PROJ-P", "cal"), { state: "joined", owner: true });
  /* every refusal above wrote nothing: no vote is left open once carried, and a refused add left none */
  assert.equal(w.rows(`SELECT * FROM project_owner_votes`).length, 0);
});

test("R3 TARGET_NOT_JOINED carries its row C-56.5 at its one site, this module's; a refusal writes nothing", async () => {
  const row = PROJECT_ROSTER_CHECKS.TARGET_NOT_JOINED;
  assert.deepEqual([row.check, row.where], ["C-56.5", "src/project-roster/index.mjs projectOwnerAdd > is-owner-target-joined"]);
  assert.ok(Object.isFrozen(row) && typeof row.translation === "string" && row.translation.length > 40);
  const w = await owned();
  const before = snapshot(w);
  for (const h of ["eve", "second"]) {
    const r = add(w, h, "ann");
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.handle], [false, "TARGET_NOT_JOINED",
      "TARGET_NOT_JOINED", "C-56.5", row.translation, h]);
    assert.match(r.detail, /joins the project first/);
  }
  assert.equal(snapshot(w), before, "nothing written by a refusal");
});

test("R4 projectOwnerRemove: refusals in order, the floor (LAST_OWNER, C-33.28), the vote, and never only leaving owners", async () => {
  const w = await owned();
  add(w, "bob", "ann");
  assert.equal(rem(w, "bob", "cal").reason, "NOT_THE_OWNER");
  assert.equal(rem(w, "zed", "ann").reason, "NO_SUCH_HANDLE");
  assert.equal(rem(w, "cal", "ann").reason, "NOT_AN_OWNER");
  assert.equal(rem(w, "bob", "ann", " ").reason, "NO_REASON");
  assert.equal(rem(w, "bob", "ann", null).reason, "NO_REASON");
  // two owners: both vote, the target included
  const v1 = rem(w, "bob", "ann", "stepping back");
  assert.deepEqual([v1.reason, v1.have, v1.need, v1.deciders], ["VOTES_SHORT", 1, 2, ["ann"]]);
  assert.equal(rem(w, "bob", "ann").reason, "ALREADY_VOTED");
  const v2 = rem(w, "bob", "bob", "agreed");
  assert.deepEqual([v2.ok, v2.owner, v2.stillAParticipant, v2.owners, v2.deciders, v2.reasons],
    [true, false, true, ["ann"], ["ann", "bob"], ["stepping back", "agreed"]]);
  assert.deepEqual(w.m.participation("PROJ-P", "bob"), { state: "joined", owner: false }, "the target stays a participant");
  // the floor
  const floor = rem(w, "ann", "ann");
  assert.deepEqual([floor.reason, floor.possible, floor.owners], ["LAST_OWNER", false, 1]);
  const row = PROJECT_ROSTER_CHECKS.LAST_OWNER;
  assert.deepEqual([row.check, row.where], ["C-33.28", "src/project-roster/index.mjs projectOwnerRemove > is-owner-floor"]);
  // three owners: the target is counted and does not vote
  add(w, "bob", "ann");
  add(w, "cal", "ann"); add(w, "cal", "bob");
  const self = rem(w, "cal", "cal");
  assert.deepEqual([self.reason, self.votesNeeded, self.targetMayVote], ["TARGET_CANNOT_VOTE", 2, false]);
  // a removal that would leave only owners who asked to leave, refused naming them, writing nothing
  w.m.projectLeave({ projectId: "PROJ-P", by: "bob", viewer: V("bob") });
  w.m.projectLeave({ projectId: "PROJ-P", by: "cal", viewer: V("cal") });
  const before = snapshot(w);
  const only = rem(w, "ann", "bob");
  assert.deepEqual([only.reason, only.leaving], ["LAST_COMMITTED_OWNER", ["bob", "cal"]]);
  assert.match(only.detail, /\(bob, cal\)/);
  assert.equal(snapshot(w), before, "nothing written");
  // at three, a majority of all owners carries it
  const a = rem(w, "cal", "ann", "a");
  assert.deepEqual([a.reason, a.have, a.need], ["VOTES_SHORT", 1, 2]);
  const b = rem(w, "cal", "bob", "b");
  assert.deepEqual([b.ok, b.owners, b.deciders, b.reasons], [true, ["ann", "bob"], ["ann", "bob"], ["a", "b"]]);
  assert.equal(w.rows(`SELECT * FROM project_owner_votes WHERE kind='remove'`).length, 0, "the carried votes are cleared");
});

test("R5 projectOwnerRescue: an administrator adds an owner only when every owner is inactive; the inactive owners keep their rows", async () => {
  const w = await owned();
  w.project("PROJ-M");   // a machine-created project: no owner rows
  const resc = (projectId, handle, by, reason = "stranded") => w.r.projectOwnerRescue({ projectId, handle, by, reason,
    viewer: by === "admin" ? "admin" : V(by) });   // the founder's viewer is the bare `admin` (membership R43)
  assert.equal(resc("PROJ-P", "bob", "cal").reason, "NOT_AN_ADMIN");
  assert.equal(resc("PROJ-M", "bob", "second").reason, "NO_OWNERS");
  const busy = resc("PROJ-P", "bob", "second");
  assert.deepEqual([busy.reason, busy.active], ["OWNERS_ARE_ACTIVE", ["ann"]]);
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.equal(resc("PROJ-P", "bob", "second", " ").reason, "NO_REASON");
  assert.equal(resc("PROJ-P", "zed", "second").reason, "NO_SUCH_HANDLE");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.equal(resc("PROJ-P", "dee", "second").reason, "NOT_ACTIVE");
  const ok = resc("PROJ-P", "bob", "admin");
  assert.deepEqual([ok.ok, ok.by, ok.reason, ok.owner, ok.owners, ok.addedNotReplaced], [true, "admin", "stranded", true,
    ["ann", "bob"], true]);
  assert.deepEqual(w.m.participation("PROJ-P", "ann"), { state: "joined", owner: true }, "the inactive owner keeps the row");
  assert.deepEqual(w.m.participation("PROJ-P", "bob"), { state: "joined", owner: true }, "a joined owner");
  assert.deepEqual(w.m.projectOwners("PROJ-P"), ["ann", "bob"], "next in the owners' order");
  // a member holding no participation is added, joined, as an owner, with the reason
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  await w.enrol("gus");
  assert.equal(resc("PROJ-P", "gus", "second", "both gone").ok, true);
  assert.deepEqual(w.row(`SELECT state, owner, invited_by, comment FROM project_participants WHERE member_id='gus'`),
    { state: "joined", owner: 1, invited_by: "second", comment: "both gone" });
  assert.deepEqual(w.m.projectOwners("PROJ-P"), ["ann", "bob", "gus"]);
});

test("R5 the rescue's first three refusals are membership's rescueRefusal (R75), byte for byte, its NOT_AN_ADMIN (R84) with its fixed remedy; writes nothing", async () => {
  const w = await owned();
  w.project("PROJ-M");
  add(w, "bob", "ann");
  const act = (projectId, by) => w.r.projectOwnerRescue({ projectId, handle: "cal", by, reason: "stranded", viewer: "admin" });
  for (const [p, by] of [["PROJ-P", "cal"], ["PROJ-P", "ann"], ["PROJ-P", null], ["PROJ-P", "class:admin"],
                         ["PROJ-M", "cal"], ["PROJ-M", "second"], ["PROJ-P", "second"]]) {
    const before = snapshot(w);
    const r = act(p, by);
    assert.deepEqual(r, w.m.rescueRefusal(p, by), `${p} ${by}`);
    assert.equal(snapshot(w), before, `${p} ${by}: nothing written`);
  }
  const r = act("PROJ-P", "cal");
  assert.deepEqual(Object.keys(r).sort(), ["by", "check", "code", "detail", "message", "ok", "reason", "remedy", "translation"]);
  assert.deepEqual([r.reason, r.check, r.by], ["NOT_AN_ADMIN", "C-96.1", "cal"]);
  assert.equal(r.message, `${MEMBERSHIP_CHECKS.NOT_AN_ADMIN.translation} ${r.remedy}`);
  const phrase = r.detail.slice(0, r.detail.indexOf(" is an administrator's act"));
  assert.deepEqual(r, notAnAdmin("cal", phrase, { remedy: r.remedy }));
  assert.equal(act("PROJ-P", "bob").remedy, r.remedy, "one fixed remedy, whoever asks");
  // asked after sight (R19): a caller who cannot see the project is answered as an id naming nothing, first
  w.project("PROJ-H");
  w.m.projectClaimOwner({ projectId: "PROJ-H", memberId: "ann" });
  const hidden = w.r.projectOwnerRescue({ projectId: "PROJ-H", handle: "bob", by: "cal", reason: "r", viewer: V("cal") });
  assert.equal(hidden.reason, "NO_SUCH_PROJECT");
});

test("R6 every ownership decision (addition, removal, rescue) is kept with its deciders and reasons, readable by every participant", async () => {
  const w = await owned();
  add(w, "bob", "ann");
  add(w, "cal", "ann"); add(w, "cal", "bob");
  rem(w, "cal", "ann", "no time"); rem(w, "cal", "bob", "agreed");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  w.r.projectOwnerRescue({ projectId: "PROJ-P", handle: "dee", by: "second", reason: "both owners gone", viewer: V("second") });
  const want = [
    ["add", "bob", ["ann"], []],
    ["add", "cal", ["ann", "bob"], []],
    ["remove", "cal", ["ann", "bob"], ["no time", "agreed"]],
    ["rescue", "dee", ["second"], ["both owners gone"]],
  ];
  /* D54: P is hidden; the administrators neither invited nor joined read it once at FULL (P discoverable) */
  for (const by of ["second", "admin"]) assert.equal(w.r.projectParticipants({ projectId: "PROJ-P", by }).reason, "NO_SUCH_PROJECT", by);
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "dee", viewer: V("dee") });
  for (const reader of ["dee", "cal", "eve", "second", "admin"]) {
    const d = w.r.projectParticipants({ projectId: "PROJ-P", by: reader }).ownership;
    assert.deepEqual(d.map((x) => [x.kind, x.handle, x.deciders, x.reasons]), want, reader);
    for (const x of d) assert.match(x.at, /^\d{4}-\d\d-\d\dT/);
  }
  assert.equal(w.r.projectParticipants({ projectId: "PROJ-P", by: "zed" }).reason, "NO_SUCH_PROJECT", "not a participant");
  assert.equal(w.rows(`SELECT * FROM project_owner_votes WHERE kind IN ('add','remove')`).length, 0,
    "open votes are cleared once carried");
  assert.equal(w.rows(`SELECT * FROM project_owner_decisions`).length, 4, "each decision kept, none overwritten");
});

test("R7 the deciders of R3 and R4 are the counted votes of the current owners only, read bounded by the owner count, which cuts no counted vote", async () => {
  const w = await owned();
  add(w, "bob", "ann");
  // a vote on record from a member who is not an owner (eve) never counts, whatever the table holds
  w.sql.exec(`INSERT INTO project_owner_votes (project_id,kind,target,voter,reason,created) VALUES ('PROJ-P','add','cal','eve',NULL,'t')`);
  w.sql.exec(`INSERT INTO project_owner_votes (project_id,kind,target,voter,reason,created) VALUES ('PROJ-P','add','cal','dee',NULL,'t')`);
  const c = add(w, "cal", "ann");
  assert.deepEqual([c.reason, c.have, c.awaiting], ["CONSENSUS_REQUIRED", ["ann"], ["bob"]]);
  const d = add(w, "cal", "bob");
  assert.deepEqual([d.ok, d.deciders], [true, ["ann", "bob"]], "eve's and dee's votes are not deciders");
  // a former owner's vote does not count: bob's add-vote on dee stops counting once bob is no longer an owner
  add(w, "dee", "bob");
  rem(w, "bob", "ann", "x"); const off = rem(w, "bob", "cal", "y");
  assert.equal(off.ok, true);
  const two = add(w, "dee", "ann");
  assert.deepEqual([two.reason, two.have, two.awaiting], ["CONSENSUS_REQUIRED", ["ann"], ["cal"]]);
  // removal at three: the target does not vote; a non-owner's vote on record never counts; reasons follow the voters
  add(w, "dee", "cal");
  w.sql.exec(`INSERT INTO project_owner_votes (project_id,kind,target,voter,reason,created) VALUES ('PROJ-P','remove','dee','eve','from eve','t')`);
  const v1 = rem(w, "dee", "ann", "a");
  assert.deepEqual([v1.reason, v1.have, v1.deciders], ["VOTES_SHORT", 1, ["ann"]]);
  const v2 = rem(w, "dee", "cal", "c");
  assert.deepEqual([v2.ok, v2.deciders, v2.reasons], [true, ["ann", "cal"], ["a", "c"]]);
  const kept = w.r.projectParticipants({ projectId: "PROJ-P", by: "eve" }).ownership.at(-1);
  assert.deepEqual([kept.kind, kept.handle, kept.deciders, kept.reasons], ["remove", "dee", ["ann", "cal"], ["a", "c"]]);
  // with many owners every counted vote is read: the bound is the owner count, never a smaller one
  const big = await world().group("o1", "o2", "o3", "o4", "o5", "o6", "t1");
  big.owned("PROJ-B", "o1", ["o2", "o3", "o4", "o5", "o6", "t1"]);
  const owners = ["o1", "o2", "o3", "o4", "o5", "o6"];
  for (let i = 1; i < owners.length; i++)
    for (const by of owners.slice(0, i)) big.r.projectOwnerAdd({ projectId: "PROJ-B", handle: owners[i], by, viewer: V(by) });
  assert.deepEqual(big.m.projectOwners("PROJ-B"), owners);
  let last;
  for (const by of owners) last = big.r.projectOwnerAdd({ projectId: "PROJ-B", handle: "t1", by, viewer: V(by) });
  assert.deepEqual([last.ok, last.deciders], [true, owners]);
  /* nothing is published as a bound */
  for (const k of ["limit", "truncated", "bound"]) assert.equal(k in last, false, k);
});

test("R3 R4 R5 an administrator's sight is never a position: the owners' acts refuse an administrator and the founder", async () => {
  const w = await owned();
  /* hidden P (D54): an administrator neither invited nor joined is at its EXISTENCE; the owners' acts answer C-70.1
     there, with the owners, and the rescue alone is reachable (its condition refuses) */
  for (const admin of ["admin", "second"]) {
    const v = admin === "admin" ? "admin" : V(admin);
    assert.equal(w.m.sight("PROJ-P", v), Membership.SIGHT_EXISTENCE, `${admin} at hidden P`);
    for (const a of [w.r.projectOwnerAdd({ projectId: "PROJ-P", handle: "bob", by: admin, viewer: v }),
                     w.r.projectOwnerRemove({ projectId: "PROJ-P", handle: "ann", by: admin, reason: "r", viewer: v })])
      assert.deepEqual(a, w.m.existenceAct("PROJ-P", v), admin);
    assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-P", handle: "bob", by: admin, reason: "r", viewer: v }).reason,
      "OWNERS_ARE_ACTIVE", "reachable at EXISTENCE: the rescue's condition, not its caller, refuses");
  }
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  for (const admin of ["admin", "second"]) {
    const v = admin === "admin" ? "admin" : V(admin);
    assert.equal(w.m.inSight("PROJ-P", v), true, "sees the discoverable project");
    for (const a of [w.r.projectOwnerAdd({ projectId: "PROJ-P", handle: "bob", by: admin, viewer: v }),
                     w.r.projectOwnerRemove({ projectId: "PROJ-P", handle: "ann", by: admin, reason: "r", viewer: v })])
      assert.equal(a.reason, "NOT_THE_OWNER");
    assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-P", handle: "bob", by: admin, reason: "r", viewer: v }).reason,
      "OWNERS_ARE_ACTIVE", "the rescue's condition, not its caller, refuses");
  }
  assert.equal(w.m.participation("PROJ-P", "second"), null);
  /* ownerMath is membership's, read here: R4's floor and vote count follow it at every size */
  for (const n of [1, 2, 3, 5]) assert.equal(typeof Membership.ownerMath(n).votesNeeded, "number");
});

test("R5 (D54) the rescue is reachable at an administrator's EXISTENCE of a hidden project, never refused C-70.1 there; its refusals and its answer name only the id, the owners and the member named", async () => {
  const w = await owned();   // P hidden: ann owns it; bob, cal, dee joined; eve invited; second and the founder not in it
  const resc = (by, viewer, handle = "bob", reason = "stranded", projectId = "PROJ-P") =>
    w.r.projectOwnerRescue({ projectId, handle, by, reason, viewer });
  const ADMINS = [["second", V("second")], ["admin", "admin"], ["admin", V("admin")]];
  const OTHERS = /"(cal|dee|eve)"|title of|Project PROJ-P/;   // participants not named, nor anything of its contents
  for (const [by, v] of ADMINS) {
    assert.equal(w.m.sight("PROJ-P", v), Membership.SIGHT_EXISTENCE, v);
    assert.equal(w.m.existenceAct("PROJ-P", v).reason, "PROJECT_SEEN_NOT_A_PARTICIPANT", `${v}: at EXISTENCE`);
    const busy = resc(by, v);
    assert.deepEqual([busy.reason, busy.active], ["OWNERS_ARE_ACTIVE", ["ann"]], v);
    assert.doesNotMatch(JSON.stringify(busy), OTHERS, v);
  }
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  await w.enrol("gus");
  for (const [by, v] of ADMINS) {
    const before = snapshot(w);
    for (const [r, code] of [[resc(by, v, "bob", " "), "NO_REASON"], [resc(by, v, "zed"), "NO_SUCH_HANDLE"],
                             [resc("bob", v), "NOT_AN_ADMIN"]]) {
      assert.equal(r.reason, code, `${v} ${code}`);
      assert.doesNotMatch(JSON.stringify(r), OTHERS, `${v} ${code}`);
    }
    assert.equal(snapshot(w), before, `${v}: the refusals wrote nothing`);
  }
  const ok = resc("second", V("second"), "gus", "every owner gone");
  assert.deepEqual([ok.ok, ok.projectId, ok.handle, ok.by, ok.owner, ok.owners, ok.addedNotReplaced],
    [true, "PROJ-P", "gus", "second", true, ["ann", "gus"], true]);
  assert.deepEqual(Object.keys(ok).sort(), ["addedNotReplaced", "by", "detail", "handle", "ok", "owner", "owners", "projectId",
    "reason"], "nothing else of the project");
  assert.doesNotMatch(JSON.stringify(ok), OTHERS);
  assert.deepEqual(w.m.participation("PROJ-P", "gus"), { state: "joined", owner: true });
  assert.equal(w.m.participation("PROJ-P", "second"), null, "the administrator is not added: its sight stays EXISTENCE");
  assert.equal(w.m.sight("PROJ-P", V("second")), Membership.SIGHT_EXISTENCE);
  /* negative controls: a member outside the hidden project is at NONE (the absent answer, before NOT_AN_ADMIN); a member
     outside a DISCOVERABLE project is at its EXISTENCE and answered C-70.1 (the rescue is reachable only at an
     administrator's EXISTENCE of a hidden project) */
  await w.enrol("hal");
  assert.deepEqual(resc("hal", V("hal")), noSuchProject("PROJ-P"));
  w.project("PROJ-Q");
  w.m.projectClaimOwner({ projectId: "PROJ-Q", memberId: "dee" });
  w.m.projectVisibilitySet({ projectId: "PROJ-Q", setting: "discoverable", by: "dee", viewer: V("dee") });
  assert.deepEqual(resc("hal", V("hal"), "gus", "r", "PROJ-Q"), w.m.existenceAct("PROJ-Q", V("hal")));
  assert.equal(resc("hal", V("hal"), "gus", "r", "PROJ-Q").reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  /* and an administrator is at FULL of the discoverable one: the act's own answers (dee active) */
  assert.equal(resc("second", V("second"), "gus", "r", "PROJ-Q").reason, "OWNERS_ARE_ACTIVE");
});
