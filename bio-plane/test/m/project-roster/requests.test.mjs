/* Requests to join (R10–R16), moved with their acts from membership's `requests-fence-facts.test.mjs` (its R49–R53),
   `participation.test.mjs` (R33's invitation closing a request) and `sight.test.mjs` (R45's lapse), renamed to this
   module's ids (K874). R15 and R16 are reached as membership's acts reach them, through its notice slots (R116, R117). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { listenerRefusal, noSuchProject } from "../../../src/membership/index.mjs";
import { ProjectRoster, PROJECT_JOIN_REQUEST_CHECKS } from "../../../src/project-roster/index.mjs";

/* D discoverable (owner ann, participant bob), H hidden (owner ann); cal, dee outside */
async function reqWorld() {
  const w = await world().group("ann", "bob", "cal", "dee");
  w.project("PROJ-D", "Discoverable D");
  w.project("PROJ-H", "Hidden H");
  for (const p of ["PROJ-D", "PROJ-H"]) w.m.projectClaimOwner({ projectId: p, memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-D", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  return w;
}
const ask = (w, by, projectId = "PROJ-D", comment = null, viewer = V(by)) => w.r.projectRequest({ projectId, comment, by, viewer });
const carries = (r, code) => {
  const row = PROJECT_JOIN_REQUEST_CHECKS[code];
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], code);
};

test("R10 projectRequest: a member asks first; NONE answers as absent; FULL is not outside; one open at a time; the name shown kept", async () => {
  const w = await reqWorld();
  carries(ask(w, "cal", "PROJ-D", null, V("dee")), "PROJECT_REQUEST_NEEDS_A_MEMBER");
  assert.equal(ask(w, `${MACHINE_CLASS_PREFIX}member`, "PROJ-D", null, `${MACHINE_CLASS_PREFIX}member`).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER");
  assert.equal(ask(w, null, "PROJ-D", null, V("cal")).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.equal(ask(w, "dee").reason, "PROJECT_REQUEST_NEEDS_A_MEMBER", "an inactive member");
  assert.equal(ask(w, "admin", "NOPE", null, V("cal")).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER", "asked first, before sight");
  /* the founder's viewer in either spelling is the founder, at FULL sight of every project */
  for (const v of ["admin", V("admin")]) {
    carries(ask(w, "admin", "PROJ-H", null, v), "PROJECT_REQUEST_NOT_OUTSIDE");
    assert.deepEqual(ask(w, "admin", "NOPE", null, v), noSuchProject("NOPE"), v);
  }
  assert.deepEqual(ask(w, "cal", "PROJ-H"), noSuchProject("PROJ-H"));
  const absent = (p) => JSON.stringify(ask(w, "cal", p)).replaceAll(p, "<id>");
  assert.equal(absent("PROJ-H"), absent("PROJ-NEVER"), "a hidden project answers as an id that names nothing");
  w.bundle("INFO-1");
  assert.deepEqual(ask(w, "cal", "INFO-1"), noSuchProject("INFO-1"), "only a project is asked to join");
  assert.equal(ask(w, "bob").reason, "PROJECT_REQUEST_NOT_OUTSIDE", "an invited participant");
  assert.equal(ask(w, "second").reason, "PROJECT_REQUEST_NOT_OUTSIDE", "an administrator sees every project");
  assert.equal(w.rows(`SELECT * FROM project_join_requests`).length, 0, "no refusal wrote a request");
  const r = ask(w, "cal", "PROJ-D", "I ride the 72");
  assert.deepEqual([r.ok, r.projectId, r.state, r.name, r.comment], [true, "PROJ-D", "open", "Discoverable D", "I ride the 72"]);
  assert.match(r.asked, /^\d{4}-/);
  const again = ask(w, "cal");
  carries(again, "PROJECT_REQUEST_ALREADY_OPEN");
  assert.equal(again.asked, r.asked);
  assert.deepEqual(w.row(`SELECT project_name, member_id, comment, state FROM project_join_requests`),
    { project_name: "Discoverable D", member_id: "cal", comment: "I ride the 72", state: "open" });
  /* a comment is cut at 280 characters; a blank one is none */
  await w.enrol("eve");
  assert.equal(ask(w, "eve", "PROJ-D", "x".repeat(400)).comment.length, 280);
  await w.enrol("fay");
  assert.equal(ask(w, "fay", "PROJ-D", "   ").comment, null);
});

test("R11 projectRequestWithdraw: needs a member; NONE_OPEN is the same answer whatever the id names; asks no sight", async () => {
  const w = await reqWorld();
  carries(w.r.projectRequestWithdraw({ projectId: "PROJ-D", by: "cal", viewer: V("dee") }), "PROJECT_REQUEST_NEEDS_A_MEMBER");
  const none = (p) => JSON.stringify(w.r.projectRequestWithdraw({ projectId: p, by: "cal", viewer: V("cal") })).replaceAll(p, "<id>");
  assert.equal(JSON.parse(none("PROJ-D")).reason, "PROJECT_REQUEST_NONE_OPEN");
  carries(JSON.parse(none("PROJ-D")), "PROJECT_REQUEST_NONE_OPEN");
  assert.equal(none("PROJ-D"), none("PROJ-H"));
  assert.equal(none("PROJ-D"), none("PROJ-NEVER"));
  ask(w, "cal");
  const wd = w.r.projectRequestWithdraw({ projectId: "PROJ-D", by: "cal", viewer: V("cal") });
  assert.deepEqual([wd.ok, wd.projectId, wd.state], [true, "PROJ-D", "withdrawn"]);
  assert.match(wd.closed, /^\d{4}-/);
  assert.deepEqual(w.row(`SELECT state, closed_by, closed_at FROM project_join_requests`),
    { state: "withdrawn", closed_by: "cal", closed_at: wd.closed });
  assert.equal(JSON.parse(none("PROJ-D")).reason, "PROJECT_REQUEST_NONE_OPEN", "withdrawn once");
});

test("R12 projectRequestAnswer: owners only (administrators and the founder included), grant or decline, an open request; a grant invites, never joins; a refused grant leaves it open", async () => {
  const w = await reqWorld();
  ask(w, "cal", "PROJ-D", "hi"); ask(w, "dee");
  const ans = (by, handle, answer, viewer = V(by)) => w.r.projectRequestAnswer({ projectId: "PROJ-D", handle, answer, comment: "ok", by, viewer });
  carries(ans("bob", "cal", "grant"), "PROJECT_REQUEST_ANSWER_NOT_THE_OWNER");
  assert.equal(ans("second", "cal", "grant").reason, "PROJECT_REQUEST_ANSWER_NOT_THE_OWNER");
  assert.equal(ans("admin", "cal", "grant", "admin").reason, "PROJECT_REQUEST_ANSWER_NOT_THE_OWNER");
  carries(ans("ann", "cal", "maybe"), "PROJECT_REQUEST_UNKNOWN_ANSWER");
  const none = ans("ann", "bob", "grant");
  carries(none, "PROJECT_REQUEST_NONE_OPEN");
  assert.equal(none.handle, "bob");
  assert.equal(ans("ann", "zed", "grant").reason, "PROJECT_REQUEST_NONE_OPEN", "a handle naming nobody");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  carries(ans("ann", "dee", "grant"), "PROJECT_REQUEST_REQUESTER_INACTIVE");
  assert.equal(w.row(`SELECT state FROM project_join_requests WHERE member_id='dee'`).state, "open", "left open");
  w.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES ('PROJ-D','cal','invited',0,'t','t')`);
  carries(ans("ann", "cal", "grant"), "PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT");
  assert.equal(w.row(`SELECT state FROM project_join_requests WHERE member_id='cal'`).state, "open", "left open");
  w.sql.exec(`DELETE FROM project_participants WHERE member_id='cal'`);
  const g = ans("ann", "cal", "grant");
  assert.deepEqual([g.ok, g.handle, g.state, g.comment, g.participation], [true, "cal", "granted", "ok", "invited"]);
  assert.deepEqual(w.row(`SELECT state, owner, invited_by FROM project_participants WHERE member_id='cal'`),
    { state: "invited", owner: 0, invited_by: "ann" }, "invited, never joined");
  assert.deepEqual(w.row(`SELECT state, closed_by, closed_comment FROM project_join_requests WHERE member_id='cal'`),
    { state: "granted", closed_by: "ann", closed_comment: "ok" });
  const d = ans("ann", "dee", "decline");
  assert.deepEqual([d.ok, d.state, "participation" in d], [true, "declined", false]);
  assert.equal(w.m.participation("PROJ-D", "dee"), null);
  /* sight before position: an outsider at EXISTENCE gets C-70.1, a hidden project the absent answer */
  assert.equal(w.r.projectRequestAnswer({ projectId: "PROJ-D", handle: "cal", answer: "grant", by: "dee", viewer: V("dee") }).reason,
    "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.deepEqual(w.r.projectRequestAnswer({ projectId: "PROJ-H", handle: "cal", answer: "grant", by: "cal", viewer: V("cal") }),
    noSuchProject("PROJ-H"));
  w.bundle("INFO-1");
  assert.deepEqual(w.r.projectRequestAnswer({ projectId: "INFO-1", handle: "cal", answer: "grant", by: "ann", viewer: V("ann") }),
    { ok: false, reason: "NOT_A_PROJECT", project: "INFO-1" });
});

test("R13 a request's asking fields are written once, its closing fields once; a closed request never reopens; the member may ask again", async () => {
  const w = await reqWorld();
  ask(w, "cal", "PROJ-D", "first");
  const before = w.row(`SELECT * FROM project_join_requests`);
  w.r.projectRequestAnswer({ projectId: "PROJ-D", handle: "cal", answer: "decline", comment: "not now", by: "ann", viewer: V("ann") });
  const closed = w.row(`SELECT * FROM project_join_requests`);
  for (const f of ["seq", "project_id", "member_id", "project_name", "comment", "asked_at"]) assert.equal(closed[f], before[f], f);
  assert.deepEqual([closed.state, closed.closed_by, closed.closed_comment], ["declined", "ann", "not now"]);
  /* no later act rewrites it: not an answer, a withdrawal, an invitation (R15) nor hiding the project (R16) */
  assert.equal(w.r.projectRequestAnswer({ projectId: "PROJ-D", handle: "cal", answer: "grant", by: "ann", viewer: V("ann") }).reason,
    "PROJECT_REQUEST_NONE_OPEN");
  assert.equal(w.r.projectRequestWithdraw({ projectId: "PROJ-D", by: "cal", viewer: V("cal") }).reason, "PROJECT_REQUEST_NONE_OPEN");
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", by: "ann", viewer: V("ann") });
  assert.deepEqual(w.row(`SELECT * FROM project_join_requests`), closed, "a closed request is never rewritten");
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  const second = ask(w, "cal", "PROJ-D", "second");
  assert.equal(second.ok, true, "the member may ask again");
  assert.equal(w.rows(`SELECT * FROM project_join_requests`).length, 2);
  w.m.projectInvite({ projectId: "PROJ-D", handle: "cal", by: "ann", viewer: V("ann") });
  assert.deepEqual(w.rows(`SELECT state FROM project_join_requests ORDER BY seq`).map((x) => x.state), ["declined", "granted"]);
  assert.deepEqual(w.row(`SELECT * FROM project_join_requests ORDER BY seq LIMIT 1`), closed);
  /* the schema holds one open request per member per project */
  assert.throws(() => w.sql.exec(`INSERT INTO project_join_requests (project_id, member_id, asked_at, state) VALUES
    ('PROJ-D','dee','t','open'), ('PROJ-D','dee','t','open')`));
});

test("R14 projectRequests: the caller's own (never the answering owner), or a project's for its owners and administrators; both capped as R9", async () => {
  const w = await reqWorld();
  ask(w, "cal", "PROJ-D", "hi");
  w.r.projectRequestAnswer({ projectId: "PROJ-D", handle: "cal", answer: "decline", comment: "no", by: "ann", viewer: V("ann") });
  ask(w, "dee", "PROJ-D", "me too");
  const own = w.r.projectRequests({ by: "cal", viewer: V("cal") });
  assert.deepEqual([own.own, own.requests.map((r) => [r.project, r.name, r.comment, r.state, r.closed_comment])],
    [true, [["PROJ-D", "Discoverable D", "hi", "declined", "no"]]]);
  assert.doesNotMatch(JSON.stringify(own), /"ann"/, "never the answering owner");
  carries(w.r.projectRequests({ by: "cal", viewer: V("dee") }), "PROJECT_REQUEST_NEEDS_A_MEMBER");
  /* a lapsed request stays the requester's to read, naming the project as it was shown */
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", by: "ann", viewer: V("ann") });
  const mine = w.r.projectRequests({ by: "dee", viewer: V("dee") });
  assert.deepEqual(mine.requests.map((r) => [r.project, r.name, r.state]), [["PROJ-D", "Discoverable D", "lapsed"]]);
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  for (const [by, viewer] of [["ann", V("ann")], ["second", V("second")], ["admin", "admin"]]) {
    const all = w.r.projectRequests({ projectId: "PROJ-D", by, viewer });
    assert.deepEqual([all.own, all.projectId], [false, "PROJ-D"]);
    assert.deepEqual(all.requests.map((r) => [r.handle, r.comment, r.state, r.closed_by, r.closed_comment]),
      [["cal", "hi", "declined", "ann", "no"], ["dee", "me too", "lapsed", "ann", null]], by);
  }
  carries(w.r.projectRequests({ projectId: "PROJ-D", by: "bob", viewer: V("bob") }), "PROJECT_REQUESTS_NOT_VISIBLE");
  assert.equal(w.r.projectRequests({ projectId: "PROJ-D", by: "cal", viewer: V("cal") }).reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.deepEqual(w.r.projectRequests({ projectId: "PROJ-H", by: "cal", viewer: V("cal") }), noSuchProject("PROJ-H"));
  /* capped: the caller may lower the cap and never raise it; truncated measured one past it */
  const cut = w.r.projectRequests({ projectId: "PROJ-D", by: "ann", viewer: V("ann"), limit: 1 });
  assert.deepEqual([cut.count, cut.truncated, cut.limit, cut.requests[0].handle], [1, true, 1, "cal"]);
  assert.equal(w.r.projectRequests({ projectId: "PROJ-D", by: "ann", viewer: V("ann"), limit: 2 }).truncated, false);
  for (const asked of [9999, 0, "x", null]) {
    assert.equal(w.r.projectRequests({ by: "cal", viewer: V("cal"), limit: asked }).limit, ProjectRoster.PROJECT_REQUESTS_LIMIT);
    assert.equal(w.r.projectRequests({ projectId: "PROJ-D", by: "ann", viewer: V("ann"), limit: asked }).limit, 200);
  }
  assert.equal(ProjectRoster.PROJECT_REQUESTS_LIMIT, 200);
  ask(w, "cal", "PROJ-D", "again");
  const ownCut = w.r.projectRequests({ by: "cal", viewer: V("cal"), limit: 1 });
  assert.deepEqual([ownCut.count, ownCut.truncated, ownCut.requests[0].comment], [1, true, "hi"], "the first in the order made");
});

test("R15 at start this module registers once in membership's invitation slot; an invitation closes the invitee's open request granted, by the inviting owner, at its time, and the answer carries request: granted", async () => {
  const w = await reqWorld();
  /* registered once: a second registration in the slot is refused, naming this module (membership R81) */
  const again = w.m.onProjectInvited("project-roster", () => 0);
  assert.deepEqual(again, listenerRefusal({ module: "project-roster" }, "project-roster", () => 0));
  assert.equal(w.r.start().invited.reason, "LISTENER_DECLARED");
  ask(w, "cal", "PROJ-D", "let me in");
  ask(w, "dee", "PROJ-D");
  const inv = w.m.projectInvite({ projectId: "PROJ-D", handle: "cal", by: "ann", viewer: V("ann") });
  assert.deepEqual([inv.ok, inv.state, inv.request], [true, "invited", "granted"]);
  const r = w.row(`SELECT state, closed_by, closed_comment, closed_at FROM project_join_requests WHERE member_id='cal'`);
  assert.deepEqual([r.state, r.closed_by, r.closed_comment], ["granted", "ann", null]);
  assert.match(r.closed_at, /^\d{4}-\d\d-\d\dT/);
  assert.equal(w.row(`SELECT state FROM project_join_requests WHERE member_id='dee'`).state, "open", "only the invitee's");
  /* an invitation of a member with no open request closes nothing, and its answer has no `request` */
  await w.enrol("eve");
  const plain = w.m.projectInvite({ projectId: "PROJ-D", handle: "eve", by: "ann", viewer: V("ann") });
  assert.deepEqual([plain.ok, "request" in plain], [true, false]);
  /* the listener answers the number it closed, 0 or 1; a notice naming no member or no project closes nothing */
  w.m.projectInvite({ projectId: "PROJ-D", handle: "dee", by: "ann", viewer: V("ann") });
  assert.equal(w.rows(`SELECT * FROM project_join_requests WHERE state='open'`).length, 0);
});

test("R16 at start this module registers once in membership's hiding slot; setting a project hidden lapses every open request to it, recorded with by and at, and the answer carries the number lapsed", async () => {
  const w = await reqWorld();
  assert.equal(w.m.onProjectHidden("project-roster", () => 0).reason, "LISTENER_DECLARED");
  assert.equal(w.r.start().hidden.reason, "LISTENER_DECLARED");
  w.project("PROJ-E", "Elsewhere E");
  w.m.projectClaimOwner({ projectId: "PROJ-E", memberId: "ann" });
  w.m.projectVisibilitySet({ projectId: "PROJ-E", setting: "discoverable", by: "ann", viewer: V("ann") });
  ask(w, "cal", "PROJ-D", "please"); ask(w, "dee", "PROJ-D"); ask(w, "cal", "PROJ-E");
  await w.enrol("eve");
  ask(w, "eve", "PROJ-D");
  w.r.projectRequestWithdraw({ projectId: "PROJ-D", by: "eve", viewer: V("eve") });   // closed already: untouched
  const h = w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", reason: "closing up", by: "ann", viewer: V("ann") });
  assert.deepEqual([h.ok, h.setting, h.requests_lapsed], [true, "hidden", 2]);
  const lapsed = w.rows(`SELECT member_id, state, closed_by, closed_at FROM project_join_requests WHERE project_id='PROJ-D' ORDER BY seq`);
  assert.deepEqual(lapsed.map((x) => [x.member_id, x.state, x.closed_by]),
    [["cal", "lapsed", "ann"], ["dee", "lapsed", "ann"], ["eve", "withdrawn", "eve"]]);
  assert.equal(lapsed[0].closed_at, h.at, "at the record's date");
  assert.equal(w.row(`SELECT state FROM project_join_requests WHERE project_id='PROJ-E'`).state, "open", "only that project's");
  /* hiding again lapses none; setting discoverable notifies nobody and reopens nothing */
  assert.equal(w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", by: "ann", viewer: V("ann") }).requests_lapsed, 0);
  const d = w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  assert.equal("requests_lapsed" in d, false);
  assert.equal(w.rows(`SELECT * FROM project_join_requests WHERE project_id='PROJ-D' AND state='open'`).length, 0);
});

test("R15 R16 the notices write nothing but the requests they close, and a refused act notifies nobody", async () => {
  const w = await reqWorld();
  ask(w, "cal", "PROJ-D");
  const before = snapshot(w);
  /* refused invitations and settings: the request stays open */
  w.m.projectInvite({ projectId: "PROJ-D", handle: "cal", by: "bob", viewer: V("bob") });            // NOT_THE_OWNER
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", by: "bob", viewer: V("bob") });   // not the owner
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "gone", by: "ann", viewer: V("ann") });     // unknown setting
  assert.equal(snapshot(w), before);
});
