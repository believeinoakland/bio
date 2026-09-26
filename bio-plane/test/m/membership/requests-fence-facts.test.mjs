import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../checks/bio-checks.mjs";
import { MEMBERSHIP_EXEMPT_TABLES, MEMBERSHIP_PROJECT_TABLES } from "../../../src/membership/index.mjs";

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
const ask = (w, by, projectId = "PROJ-D", comment = null, viewer = V(by)) => w.m.projectRequest({ projectId, comment, by, viewer });

test("R49 projectRequest: a member asks first; NONE absent; FULL not outside; one open at a time; the name shown kept", async () => {
  const w = await reqWorld();
  assert.equal(ask(w, "cal", "PROJ-D", null, V("dee")).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER");
  assert.equal(ask(w, `${MACHINE_CLASS_PREFIX}member`, "PROJ-D", null, `${MACHINE_CLASS_PREFIX}member`).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.equal(ask(w, "dee").reason, "PROJECT_REQUEST_NEEDS_A_MEMBER");
  assert.equal(ask(w, "admin", "NOPE", null, V("admin")).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER", "asked first, before sight");
  assert.equal(ask(w, "cal", "PROJ-H").reason, "NO_SUCH_PROJECT");
  const absent = (p) => JSON.stringify(ask(w, "cal", p)).replaceAll(p, "<id>");
  assert.equal(absent("PROJ-H"), absent("PROJ-NEVER"), "a hidden project answers as an id that names nothing");
  assert.equal(ask(w, "bob").reason, "PROJECT_REQUEST_NOT_OUTSIDE");
  assert.equal(ask(w, "second").reason, "PROJECT_REQUEST_NOT_OUTSIDE", "an administrator sees every project");
  const r = ask(w, "cal", "PROJ-D", "I ride the 72");
  assert.deepEqual([r.ok, r.state, r.name, r.comment], [true, "open", "Discoverable D", "I ride the 72"]);
  assert.equal(ask(w, "cal").reason, "PROJECT_REQUEST_ALREADY_OPEN");
  assert.equal(w.row(`SELECT project_name FROM project_join_requests`).project_name, "Discoverable D");
});

test("R50 projectRequestWithdraw: needs a member; NONE_OPEN is the same whatever the id names", async () => {
  const w = await reqWorld();
  assert.equal(w.m.projectRequestWithdraw({ projectId: "PROJ-D", by: "cal", viewer: V("dee") }).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER");
  const none = (p) => JSON.stringify(w.m.projectRequestWithdraw({ projectId: p, by: "cal", viewer: V("cal") })).replaceAll(p, "<id>");
  assert.equal(JSON.parse(none("PROJ-D")).reason, "PROJECT_REQUEST_NONE_OPEN");
  assert.equal(none("PROJ-D"), none("PROJ-H"));
  assert.equal(none("PROJ-D"), none("PROJ-NEVER"));
  ask(w, "cal");
  const wd = w.m.projectRequestWithdraw({ projectId: "PROJ-D", by: "cal", viewer: V("cal") });
  assert.deepEqual([wd.ok, wd.state], [true, "withdrawn"]);
  assert.deepEqual(w.row(`SELECT state, closed_by FROM project_join_requests`), { state: "withdrawn", closed_by: "cal" });
});

test("R51 projectRequestAnswer: owners only, grant or decline, an open request; a grant invites, never joins", async () => {
  const w = await reqWorld();
  ask(w, "cal", "PROJ-D", "hi"); ask(w, "dee");
  const ans = (by, handle, answer, viewer = V(by)) => w.m.projectRequestAnswer({ projectId: "PROJ-D", handle, answer, comment: "ok", by, viewer });
  assert.equal(ans("bob", "cal", "grant").reason, "PROJECT_REQUEST_ANSWER_NOT_THE_OWNER");
  assert.equal(ans("second", "cal", "grant").reason, "PROJECT_REQUEST_ANSWER_NOT_THE_OWNER");
  assert.equal(ans("admin", "cal", "grant", "admin").reason, "PROJECT_REQUEST_ANSWER_NOT_THE_OWNER");
  assert.equal(ans("ann", "cal", "maybe").reason, "PROJECT_REQUEST_UNKNOWN_ANSWER");
  assert.equal(ans("ann", "bob", "grant").reason, "PROJECT_REQUEST_NONE_OPEN");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.equal(ans("ann", "dee", "grant").reason, "PROJECT_REQUEST_REQUESTER_INACTIVE");
  assert.equal(w.row(`SELECT state FROM project_join_requests WHERE member_id='dee'`).state, "open", "left open");
  w.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES ('PROJ-D','cal','invited',0,'t','t')`);
  assert.equal(ans("ann", "cal", "grant").reason, "PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT");
  w.sql.exec(`DELETE FROM project_participants WHERE member_id='cal'`);
  const g = ans("ann", "cal", "grant");
  assert.deepEqual([g.ok, g.state, g.participation], [true, "granted", "invited"]);
  assert.deepEqual(w.row(`SELECT state, owner, invited_by FROM project_participants WHERE member_id='cal'`),
    { state: "invited", owner: 0, invited_by: "ann" });
  const d = ans("ann", "dee", "decline");
  assert.deepEqual([d.ok, d.state], [true, "declined"]);
  assert.equal(w.m.participation("PROJ-D", "dee"), null);
});

test("R52 a request's asking fields are written once, its closing fields once; closed never reopens; ask again", async () => {
  const w = await reqWorld();
  ask(w, "cal", "PROJ-D", "first");
  const before = w.row(`SELECT * FROM project_join_requests`);
  w.m.projectRequestAnswer({ projectId: "PROJ-D", handle: "cal", answer: "decline", comment: "not now", by: "ann", viewer: V("ann") });
  const closed = w.row(`SELECT * FROM project_join_requests`);
  for (const f of ["project_id", "member_id", "project_name", "comment", "asked_at"]) assert.equal(closed[f], before[f], f);
  assert.deepEqual([closed.state, closed.closed_by, closed.closed_comment], ["declined", "ann", "not now"]);
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", by: "ann", viewer: V("ann") });   // lapses only open ones
  assert.deepEqual(w.row(`SELECT * FROM project_join_requests`), closed, "a closed request is never rewritten");
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  assert.equal(ask(w, "cal", "PROJ-D", "second").ok, true, "the member may ask again");
  assert.equal(w.rows(`SELECT * FROM project_join_requests`).length, 2);
});

test("R53 projectRequests: the caller's own (never the answering owner), or a project's for owners and administrators; capped", async () => {
  const w = await reqWorld();
  ask(w, "cal", "PROJ-D", "hi");
  w.m.projectRequestAnswer({ projectId: "PROJ-D", handle: "cal", answer: "decline", comment: "no", by: "ann", viewer: V("ann") });
  ask(w, "dee", "PROJ-D", "me too");
  const own = w.m.projectRequests({ by: "cal", viewer: V("cal") });
  assert.deepEqual([own.own, own.requests.map((r) => [r.project, r.name, r.state, r.closed_comment])],
    [true, [["PROJ-D", "Discoverable D", "declined", "no"]]]);
  assert.doesNotMatch(JSON.stringify(own), /"ann"/, "never the answering owner");
  assert.equal(w.m.projectRequests({ by: "cal", viewer: V("dee") }).reason, "PROJECT_REQUEST_NEEDS_A_MEMBER");
  for (const [by, viewer] of [["ann", V("ann")], ["second", V("second")]]) {
    const all = w.m.projectRequests({ projectId: "PROJ-D", by, viewer });
    assert.deepEqual(all.requests.map((r) => [r.handle, r.state, r.closed_by]), [["cal", "declined", "ann"], ["dee", "open", null]]);
  }
  assert.equal(w.m.projectRequests({ projectId: "PROJ-D", by: "bob", viewer: V("bob") }).reason, "PROJECT_REQUESTS_NOT_VISIBLE");
  const cut = w.m.projectRequests({ projectId: "PROJ-D", by: "ann", viewer: V("ann"), limit: 1 });
  assert.deepEqual([cut.count, cut.truncated, cut.limit], [1, true, 1]);
  assert.equal(w.m.projectRequests({ projectId: "PROJ-D", by: "ann", viewer: V("ann"), limit: 2 }).truncated, false);
  assert.equal(w.m.projectRequests({ by: "cal", viewer: V("cal"), limit: 9999 }).limit, Membership.PROJECT_REQUESTS_LIMIT);
  assert.equal(Membership.PROJECT_REQUESTS_LIMIT, 200);
});

test("R54 isProjectOwner and isJoinedParticipant", async () => {
  const w = await reqWorld();
  w.m.projectInvite({ projectId: "PROJ-D", handle: "cal", by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-D", by: "bob", viewer: V("bob") });
  w.m.projectLeave({ projectId: "PROJ-D", by: "bob", viewer: V("bob") });
  const t = (id) => [w.m.isProjectOwner("PROJ-D", id), w.m.isJoinedParticipant("PROJ-D", id)];
  assert.deepEqual(t("ann"), [true, true]);
  assert.deepEqual(t("bob"), [false, true], "leaving is still joined-or-leaving");
  assert.deepEqual(t("cal"), [false, false], "invited");
  assert.deepEqual(t("dee"), [false, false]);
  assert.deepEqual(t("second"), [false, false], "an administrator holds no position");
});

test("R55 projectAuthority: owner and joined fences; sight and administrator status confer neither; no member not asked", async () => {
  const w = await reqWorld();
  w.m.projectJoin({ projectId: "PROJ-D", by: "bob", viewer: V("bob") });
  const pa = (who, need) => w.m.projectAuthority("PROJ-D", who, need, "revising the document");
  assert.equal(pa(V("ann"), "owner"), null);
  assert.equal(pa(V("bob"), "joined"), null);
  const r = pa(V("bob"), "owner");
  assert.deepEqual([r.ok, r.code, r.project, r.needs, r.act], [false, "PROJECT_ACT_NOT_THE_OWNER", "PROJ-D", "owner", "revising the document"]);
  assert.equal(pa(V("cal"), "joined").code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(pa(V("second"), "joined").code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(pa(V("admin"), "owner").code, "PROJECT_ACT_NOT_THE_OWNER");
  w.m.projectLeave({ projectId: "PROJ-D", by: "bob", viewer: V("bob") });
  assert.equal(pa(V("bob"), "joined"), null, "leaving still acts");
  assert.equal(pa(null, "owner"), null);
  assert.equal(pa(`${MACHINE_CLASS_PREFIX}member`, "owner"), null);
});

test("R56 caseAuthority: delivery needs joined (the founder excepted); the signer must own the project", async () => {
  const w = await reqWorld();
  w.m.projectJoin({ projectId: "PROJ-D", by: "bob", viewer: V("bob") });
  const ca = (o) => w.m.caseAuthority({ act: "publish", subject: "CASE-1", ...o });
  assert.equal(ca({ project: "PROJ-D", deliveredBy: V("bob"), signer: "ann" }), null);
  assert.equal(ca({ project: "PROJ-D", deliveredBy: "founder", signer: "ann" }), null);
  assert.equal(ca({ project: "PROJ-D", deliveredBy: V("cal"), signer: "ann" }).code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  const s = ca({ project: "PROJ-D", deliveredBy: V("bob"), signer: "bob" });
  assert.deepEqual([s.code, s.signer, s.project], ["CASE_SIGNER_NOT_AN_OWNER", "bob", "PROJ-D"]);
  assert.equal(ca({ project: null, deliveredBy: V("bob"), signer: "ann" }).code, "CASE_SIGNER_NOT_AN_OWNER");
  assert.equal(ca({ project: "PROJ-D", deliveredBy: "founder", signer: null }).code, "CASE_SIGNER_NOT_AN_OWNER");
});

test("R64 isAdministrator: the founder once claimed, and active members with role admin", async () => {
  const w = world();
  assert.equal(w.m.isAdministrator("admin"), false, "not before the claim");
  await w.claim();
  assert.equal(w.m.isAdministrator("admin"), true);
  await w.enrol("second", "admin");
  await w.enrol("ann");
  assert.deepEqual(["second", "ann", "nobody", null, "", "class:admin"].map((x) => w.m.isAdministrator(x)),
    [true, false, false, false, false, false]);
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.equal(w.m.isAdministrator("second"), false);
});

test("R66 isProjectEditor: an owner or a joined participant, never one leaving or invited", async () => {
  const w = await reqWorld();
  w.m.projectInvite({ projectId: "PROJ-D", handle: "cal", by: "ann", viewer: V("ann") });
  w.m.projectInvite({ projectId: "PROJ-D", handle: "dee", by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-D", by: "bob", viewer: V("bob") });
  w.m.projectJoin({ projectId: "PROJ-D", by: "dee", viewer: V("dee") });
  w.m.projectLeave({ projectId: "PROJ-D", by: "dee", viewer: V("dee") });
  assert.deepEqual(["ann", "bob", "cal", "dee", "second"].map((m) => w.m.isProjectEditor("PROJ-D", m)),
    [true, true, false, false, false]);
});

test("R68 memberFacts gives cover, handle, role and status or null, never a credential, key or expertise", async () => {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.m.signerAdd({ keyB64: "AAAAk", memberId: "ann", by: "admin" });
  assert.deepEqual(w.m.memberFacts("ann"), { cover: "cover of ann", handle: "ann", role: "member", status: "active" });
  assert.equal(w.m.memberFacts("nobody"), null);
});

test("R69 activeParticipants: joined (not leaving, not invited) members who are active", async () => {
  const w = await reqWorld();
  w.m.projectJoin({ projectId: "PROJ-D", by: "bob", viewer: V("bob") });
  for (const h of ["cal", "dee"]) w.m.projectInvite({ projectId: "PROJ-D", handle: h, by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-D", by: "dee", viewer: V("dee") });
  assert.deepEqual(w.m.activeParticipants("PROJ-D"), ["ann", "bob", "dee"]);
  w.m.projectLeave({ projectId: "PROJ-D", by: "bob", viewer: V("bob") });
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.deepEqual(w.m.activeParticipants("PROJ-D"), ["ann"]);
  assert.deepEqual(w.m.activeParticipants("NOPE"), []);
});

test("R71 projectCreated: the sole initial owner, the creation visibility recorded, sight reindexed", async () => {
  const w = await world().group("ann", "cal");
  w.bundle("PROJ-N", "project", "New");
  const r = w.m.projectCreated({ projectId: "PROJ-N", ownerId: "ann", visibility: "discoverable", by: "ann" });
  assert.deepEqual([r.ok, r.owner, r.setting], [true, "ann", "discoverable"]);
  assert.deepEqual(w.m.projectOwners("PROJ-N"), ["ann"]);
  assert.equal(w.m.participation("PROJ-N", "ann").state, "joined");
  assert.deepEqual(w.m.projectVisibility({ projectId: "PROJ-N", viewer: V("ann") }).history.map((h) => [h.setting, h.set_by]),
    [["discoverable", "ann"]]);
  assert.equal(w.m.sight("PROJ-N", V("cal")), Membership.SIGHT_EXISTENCE, "reindexed");
  w.bundle("PROJ-M", "project", "Machine-made");
  const m = w.m.projectCreated({ projectId: "PROJ-M", ownerId: null, visibility: null, by: "class:admin" });
  assert.deepEqual([m.ok, m.owner, m.setting, w.m.projectOwners("PROJ-M")], [true, null, "hidden", []]);
  assert.equal(w.m.projectCreated({ projectId: "PROJ-N", ownerId: "cal" }).reason, "OWNED");
  w.bundle("PROJ-B", "project");
  assert.equal(w.m.projectCreated({ projectId: "PROJ-B", ownerId: "ann", visibility: "public" }).reason,
    "PROJECT_VISIBILITY_UNKNOWN_SETTING");
  assert.equal(w.m.participation("PROJ-B", "ann"), null, "nothing written on a refusal");
});

test("R59 members' tables are declared exempt from purge; project-keyed tables are cleared with the project", async () => {
  const w = world();
  assert.equal(w.declared.length, 1);
  const [d] = w.declared;
  assert.equal(d.module, "membership");
  assert.deepEqual(new Set(d.opts.exempt), new Set(["credentials", "sessions", "bootstrap", "members", "signers",
    "ai_credentials", "member_expertise", "admin_votes", "hosting_access"]));
  const names = d.tables.map((t) => (typeof t === "string" ? t : t.name));
  assert.deepEqual(new Set(names), new Set([...MEMBERSHIP_EXEMPT_TABLES, ...MEMBERSHIP_PROJECT_TABLES]));
  for (const t of MEMBERSHIP_PROJECT_TABLES) {
    assert.ok(!d.opts.exempt.includes(t));
    assert.deepEqual(d.tables.find((x) => x.name === t), { name: t, keys: ["project_id"] }, "keyed by project (record-core R46)");
    assert.ok(w.rows(`PRAGMA table_info(${t})`).some((c) => c.name === "project_id"), `${t} is keyed by project`);
  }
  const owned = w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('bundles','sqlite_sequence')`).map((r) => r.name);
  assert.deepEqual(new Set(owned), new Set(names), "every table the module owns is declared");
  w.m.migrate();
  assert.equal(w.declared.length, 1, "declared once");
});
