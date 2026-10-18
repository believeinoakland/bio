/* T51-12: R35 `projectInvitations` (who invited the viewer), R36 `projectList` paged by a cursor, R37 `projectRequests`
   naming a requester by member id. At the interface: membership's acts set up participation; the answers are read back. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const M = `${MACHINE_CLASS_PREFIX}member`;

test("R35 an invitation by Ana answers invited_by Ana's handle, the project's name and the instant of the invitation", async () => {
  const w = await world().group("ana", "bob", "cal");
  w.owned("PROJ-A", "ana");
  w.owned("PROJ-B", "ana");
  w.m.projectInvite({ projectId: "PROJ-B", handle: "bob", by: "ana", viewer: V("ana") });
  w.m.projectInvite({ projectId: "PROJ-A", handle: "bob", by: "ana", viewer: V("ana") });
  const a = w.r.projectInvitations({ viewer: V("bob") });
  assert.deepEqual(Object.keys(a).sort(), ["count", "invitations", "limit", "next", "ok", "truncated"]);
  assert.deepEqual([a.ok, a.count, a.limit, a.truncated, a.next], [true, 2, 200, false, null]);
  assert.deepEqual(a.invitations.map((x) => x.projectId), ["PROJ-A", "PROJ-B"], "project id order");
  const row = a.invitations[0];
  assert.deepEqual(Object.keys(row).sort(), ["invited_at", "invited_by", "name", "projectId"]);
  assert.deepEqual([row.name, row.invited_by], ["Project PROJ-A", { member: "ana", handle: "ana" }]);
  assert.equal(row.invited_at, w.row(`SELECT created FROM project_participants WHERE project_id='PROJ-A' AND member_id='bob'`).created);
});

test("R35 the founder inviting is {handle: null, founder: true} while she holds none, and her handle once she does; never the string admin", async () => {
  const w = await world().group("ana", "bob");
  w.project("PROJ-F");
  w.m.projectClaimOwner({ projectId: "PROJ-F", memberId: "admin" });
  w.m.projectInvite({ projectId: "PROJ-F", handle: "bob", by: "admin", viewer: "admin" });
  const by = () => w.r.projectInvitations({ viewer: V("bob") }).invitations[0].invited_by;
  assert.deepEqual(by(), { member: "admin", handle: null, founder: true });
  w.founderHandle("fran");
  assert.deepEqual(by(), { member: "admin", handle: "fran", founder: true });
});

test("R35 invited_by is null when none was recorded or the recorded inviter is no member (a door's actor)", async () => {
  const w = await world().group("ana", "bob", "cal");
  w.owned("PROJ-A", "ana", [], ["bob", "cal"]);
  w.sql.exec(`UPDATE project_participants SET invited_by=NULL WHERE project_id='PROJ-A' AND member_id='bob'`);
  w.sql.exec(`UPDATE project_participants SET invited_by='website:k1' WHERE project_id='PROJ-A' AND member_id='cal'`);
  for (const who of ["bob", "cal"])
    assert.equal(w.r.projectInvitations({ viewer: V(who) }).invitations[0].invited_by, null, who);
});

test("R35 control: a member joined, removed, or invited to none is listed none; another member's invitation is never in her list; no other participant is named", async () => {
  const w = await world().group("ana", "bob", "cal", "dee");
  w.owned("PROJ-A", "ana", ["bob"], ["cal"]);
  assert.deepEqual(w.r.projectInvitations({ viewer: V("bob") }).invitations, [], "joined");
  assert.deepEqual(w.r.projectInvitations({ viewer: V("dee") }).invitations, [], "invited to none");
  assert.deepEqual(w.r.projectInvitations({ viewer: V("cal") }).invitations.map((x) => x.projectId), ["PROJ-A"]);
  assert.doesNotMatch(JSON.stringify(w.r.projectInvitations({ viewer: V("cal") })), /"bob"|"dee"/, "no other participant");
  w.m.projectRemove({ projectId: "PROJ-A", handle: "cal", by: "ana", viewer: V("ana") });
  assert.deepEqual(w.r.projectInvitations({ viewer: V("cal") }).invitations, [], "removed");
  /* leaves with her state: joining takes it off the list */
  w.m.projectInvite({ projectId: "PROJ-A", handle: "dee", by: "ana", viewer: V("ana") });
  assert.equal(w.r.projectInvitations({ viewer: V("dee") }).count, 1);
  w.m.projectJoin({ projectId: "PROJ-A", by: "dee", viewer: V("dee") });
  assert.equal(w.r.projectInvitations({ viewer: V("dee") }).count, 0);
});

test("R35 a viewer naming no active member (none sent, unrecognised, a machine credential, a revoked member) gets an empty list, never a refusal, and nothing is written", async () => {
  const w = await world().group("ana", "bob");
  w.owned("PROJ-A", "ana", [], ["bob"]);
  const before = JSON.stringify(w.rows(`SELECT * FROM project_participants`));
  for (const v of [undefined, null, "", "junk", M, V("nobody")]) {
    const a = w.r.projectInvitations({ viewer: v });
    assert.deepEqual([a.ok, a.invitations, a.count, a.truncated, a.next], [true, [], 0, false, null], String(v));
  }
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='bob'`);
  assert.equal(w.r.projectInvitations({ viewer: V("bob") }).count, 0, "revoked");
  assert.equal(w.r.projectInvitations().ok, true);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM project_participants`)), before);
});

test("R35 limit, truncated, after and next follow R36's rule: 3 invitations paged by 2, the cap lowered never raised", async () => {
  const w = await world().group("ana", "bob");
  for (const p of ["PROJ-1", "PROJ-2", "PROJ-3"]) w.owned(p, "ana", [], ["bob"]);
  const p1 = w.r.projectInvitations({ viewer: V("bob"), limit: 2 });
  assert.deepEqual([p1.count, p1.limit, p1.truncated, p1.next], [2, 2, true, "PROJ-2"]);
  const p2 = w.r.projectInvitations({ viewer: V("bob"), limit: 2, after: p1.next });
  assert.deepEqual([p2.invitations.map((x) => x.projectId), p2.truncated, p2.next], [["PROJ-3"], false, null]);
  assert.equal(w.r.projectInvitations({ viewer: V("bob"), limit: 99999 }).limit, 200);
  assert.equal(w.r.projectInvitations({ viewer: V("bob"), after: 7 }).count, 3, "a non-string cursor is absent");
});

test("R36 205 visible projects answer 200 rows, truncated, next the 200th id; after: next answers the other 5 with next null; the pages walk every project once", async () => {
  const w = await world().group("ana");
  for (let i = 0; i < 205; i++) w.project(`PROJ-N${String(i).padStart(3, "0")}`);
  const first = w.r.projectList({ viewer: M });
  assert.deepEqual([first.count, first.truncated, first.next], [200, true, "PROJ-N199"]);
  const second = w.r.projectList({ viewer: M, after: first.next });
  assert.deepEqual([second.count, second.truncated, second.next, second.projects[0].id], [5, false, null, "PROJ-N200"]);
  const seen = [];
  for (let after = null, g = 0; g < 100; g++) {
    const pg = w.r.projectList({ viewer: M, limit: 37, after });
    seen.push(...pg.projects.map((p) => p.id));
    if (pg.next === null) break;
    after = pg.next;
  }
  assert.deepEqual(seen, Array.from({ length: 205 }, (_, i) => `PROJ-N${String(i).padStart(3, "0")}`));
});

test("R36 control: a viewer who sees 3 projects gets all 3 and next null; a project added before the cursor is not on a later page; a bad cursor starts from the first", async () => {
  const w = await world().group("ana");
  for (const p of ["PROJ-B", "PROJ-D", "PROJ-F"]) w.owned(p, "ana");
  const all = w.r.projectList({ viewer: V("ana") });
  assert.deepEqual([all.count, all.truncated, all.next], [3, false, null]);
  const pg = w.r.projectList({ viewer: V("ana"), limit: 1 });
  assert.deepEqual([pg.projects[0].id, pg.next], ["PROJ-B", "PROJ-B"]);
  w.owned("PROJ-A", "ana");
  assert.deepEqual(w.r.projectList({ viewer: V("ana"), limit: 5, after: pg.next }).projects.map((p) => p.id), ["PROJ-D", "PROJ-F"]);
  for (const bad of [null, "", 0, 5, {}, ["PROJ-D"]])
    assert.equal(w.r.projectList({ viewer: V("ana"), after: bad }).count, 4, JSON.stringify(bad));
  assert.deepEqual(w.r.projectList({ viewer: V("ana"), after: "PROJ-F" }).projects, []);
});

test("R37 a request from a member with no handle answers handle null and her member_id; two are told apart by id; a member holding a handle answers both, in both lists", async () => {
  const w = await world().group("ana", "bob", "cal", "dee");
  w.owned("PROJ-D", "ana");
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ana", viewer: V("ana") });
  for (const who of ["bob", "cal", "dee"]) w.r.projectRequest({ projectId: "PROJ-D", by: who, viewer: V(who) });
  w.sql.exec(`UPDATE members SET handle=NULL WHERE member_id IN ('bob','cal')`);
  const theirs = w.r.projectRequests({ projectId: "PROJ-D", by: "ana", viewer: V("ana") }).requests;
  assert.deepEqual(theirs.map((r) => [r.member_id, r.handle]), [["bob", null], ["cal", null], ["dee", "dee"]]);
  const mine = w.r.projectRequests({ by: "bob", viewer: V("bob") }).requests;
  assert.deepEqual(mine.map((r) => [r.member_id, r.project]), [["bob", "PROJ-D"]]);
  assert.equal(w.r.projectRequests({ by: "dee", viewer: V("dee") }).requests[0].member_id, "dee");
  /* control: a viewer R14 admits nothing is given neither */
  const refused = w.r.projectRequests({ projectId: "PROJ-D", by: "dee", viewer: V("dee") });
  assert.equal(refused.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.doesNotMatch(JSON.stringify(refused), /member_id/);
  const none = w.r.projectRequests({ by: M, viewer: M });
  assert.doesNotMatch(JSON.stringify(none), /member_id/);
});
