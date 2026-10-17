/* R41 (a project invitation is a to do) and R42 (a request to join is a to do for the project's owners), N1091; DEC-248,
   DEC-286, DEC-309 (1). Both read the REAL project-roster (`projectList`, `projectParticipants`, `projectRequests`) over the
   same storage, beside the real membership whose acts (invite, join, remove) and project-roster's own acts (ask, answer,
   withdraw) make and close the rows; every sentence is checked against setup-words' `word` for its key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const V = (m) => `member:${m}`;
const kind = (r, k) => r.items.filter((i) => i.kind === k);

/* PRJ-1 "Parkside", owned by ann and cal (discoverable); bob and dee outside, to be invited or to ask; eve to join. */
function parkside() {
  const w = world();
  for (const m of ["ann", "bob", "cal", "dee", "eve"]) w.member(m, { handle: m });
  w.bundle("PRJ-1", "project", { title: "Parkside" });
  w.membership.projectClaimOwner({ projectId: "PRJ-1", memberId: "ann" });
  w.join("PRJ-1", "cal", { owner: true });
  w.membership.reindexProjectSight("PRJ-1");
  w.discoverable("PRJ-1");
  return w;
}

const invite = (w, who, project = "PRJ-1", by = "ann") => {
  const r = w.membership.projectInvite({ projectId: project, handle: who, by, viewer: V(by) });
  assert.equal(r.ok, true, JSON.stringify(r));
  return r;
};
const ask = (w, who, comment = null, project = "PRJ-1") => {
  const r = w.roster.projectRequest({ projectId: project, comment, by: who, viewer: V(who) });
  assert.equal(r.ok, true, JSON.stringify(r));
  return r;
};

test("R41: an invited member has one OBLIGATION project-invitation per invitation, keyed OBLIGATION::project-invitation::<project>::<member>, to her and nobody else, with no project home, naming the project (the unnamed summary, the inviter unanswered by any read) and offering projectjoin; its age is her own row's created", () => {
  const w = parkside();
  invite(w, "bob");
  w.run(`UPDATE project_participants SET created=? WHERE project_id='PRJ-1' AND member_id='bob'`, iso(NOW - 3600000));
  const items = kind(w.read("bob", V("bob")), "project-invitation");
  assert.deepEqual(items.map((i) => i.id), ["OBLIGATION::project-invitation::PRJ-1::bob"], "one item");
  const it = items[0];
  assert.deepEqual([it.class, it.kind, it.recipients], ["OBLIGATION", "project-invitation", ["bob"]]);
  assert.deepEqual(it.subject, { kind: "project", id: "PRJ-1", name: "Parkside" });
  assert.equal(it.summary, word("queue.project-invitation.summary.unnamed", { project: "Parkside" }), "no inviter is named (DEC-309 (1))");
  assert.equal(it.detail, word("queue.project-invitation.detail"));
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 3600000), ms: 3600000 }, "the invitation's instant");
  assert.deepEqual(it.case.ancestors, [], "no project home"); assert.equal(it.case.ungrouped, true);
  assert.deepEqual(it.options, [{ id: "projectjoin", label: word("act.projectjoin.label.queue"), weight: "single" }]);
  assert.equal(it.options[0].label, "Join");
  assert.equal(it.basis.inviter, null, "no read gives the inviter to the invited member");
  assert.doesNotMatch(JSON.stringify([it.summary, it.detail]), /ann/, "no handle of the inviter in the words");
});

test("R41: joining clears the item, as does removal; a member joined to the project, or invited to none, has no item; another member sees none; no member, none", () => {
  const w = parkside();
  invite(w, "bob"); invite(w, "dee");
  const mine = (m) => kind(w.read(m, V(m)), "project-invitation").map((i) => i.id);
  assert.deepEqual(mine("bob"), ["OBLIGATION::project-invitation::PRJ-1::bob"]);
  assert.deepEqual(mine("dee"), ["OBLIGATION::project-invitation::PRJ-1::dee"], "each invited member has her own");
  assert.deepEqual(mine("eve"), [], "invited to none");
  assert.deepEqual(mine("ann"), [], "an owner, joined: the control");
  assert.deepEqual(mine("cal"), [], "an owner, joined: the control");
  assert.deepEqual(kind(w.read(null, "class:admin"), "project-invitation"), [], "a caller with no member");
  assert.equal(w.membership.projectJoin({ projectId: "PRJ-1", by: "bob", viewer: V("bob") }).ok, true);
  assert.deepEqual(mine("bob"), [], "she joined: the item leaves");
  assert.deepEqual(mine("dee"), ["OBLIGATION::project-invitation::PRJ-1::dee"], "dee's stays");
  assert.equal(w.membership.projectRemove({ projectId: "PRJ-1", handle: "dee", by: "ann", viewer: V("ann") }).ok, true);
  assert.deepEqual(mine("dee"), [], "removed (the invitation withdrawn): the item leaves");
});

test("R41: at most 50 invitations in id order, the bound published on the item; one project's invitation is one item whatever the number of reads", () => {
  const w = parkside();
  for (let i = 0; i < 52; i += 1) {
    const id = `PRJ-9${String(i).padStart(2, "0")}`;
    w.bundle(id, "project", { title: `Proj ${i}` });
    w.membership.projectClaimOwner({ projectId: id, memberId: "ann" });
    w.membership.reindexProjectSight(id);
    invite(w, "bob", id);
  }
  const items = kind(w.read("bob", V("bob")), "project-invitation");
  assert.equal(items.length, 50, "R4's bound");
  assert.deepEqual(items.map((i) => i.subject.id), [...items.map((i) => i.subject.id)].sort(), "id order");
  assert.equal(items[0].subject.id, "PRJ-900");
  assert.equal(items[49].subject.id, "PRJ-949");
  assert.deepEqual([items[0].basis.bound.limit, items[0].basis.bound.truncated], [50, true], "it says it cut");
  assert.equal(kind(w.read("bob", V("bob")), "project-invitation").length, 50, "a second read raises the same");
});

test("R42: a request to join makes one OBLIGATION project-request for each owner, keyed OBLIGATION::project-request::<project>::<requester>, to the owners and nobody else, with no project home, naming the requester by handle, her comment carried apart as her own words, offering projectrequestanswer with its two answers; its age is the request's asked", () => {
  const w = parkside();
  ask(w, "dee", "I ride the 72 past the park");
  w.run(`UPDATE project_join_requests SET asked_at=? WHERE member_id='dee'`, iso(NOW - 7200000));
  for (const owner of ["ann", "cal"]) {
    const items = kind(w.read(owner, V(owner)), "project-request");
    assert.deepEqual(items.map((i) => i.id), ["OBLIGATION::project-request::PRJ-1::dee"], `${owner}: one item`);
    const it = items[0];
    assert.deepEqual([it.class, it.kind], ["OBLIGATION", "project-request"]);
    assert.deepEqual([...it.recipients].sort(), ["ann", "cal"], "each owner of the project, and nobody else");
    assert.equal(it.summary, word("queue.project-request.summary", { who: "dee", project: "Parkside" }));
    assert.equal(it.detail, word("queue.project-request.detail"));
    assert.deepEqual(it.quote, { by: "dee", text: "I ride the 72 past the park" }, "her own words, apart from ours");
    assert.doesNotMatch(it.summary + it.detail, /I ride the 72/, "her words are not folded into the sentence");
    assert.deepEqual(it.subject, { kind: "project", id: "PRJ-1", name: "Parkside", requester: "dee" });
    assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 7200000), ms: 7200000 });
    assert.deepEqual(it.case.ancestors, [], "no project home"); assert.equal(it.case.ungrouped, true);
    assert.equal(it.options.length, 1);
    assert.deepEqual([it.options[0].id, it.options[0].label], ["projectrequestanswer", word("act.projectrequestanswer.label.queue")]);
    assert.deepEqual(it.options[0].answers, [{ answer: "grant", label: word("screen.home.request.grant") },
                                             { answer: "decline", label: word("screen.home.request.decline") }]);
  }
});

test("R42: an answer by one owner clears the item for both owners; a withdrawn request, and a declined one, are closed and make none", () => {
  const w = parkside();
  ask(w, "dee", "please"); ask(w, "bob");
  const ids = (m) => kind(w.read(m, V(m)), "project-request").map((i) => i.id).sort();
  const both = ["OBLIGATION::project-request::PRJ-1::bob", "OBLIGATION::project-request::PRJ-1::dee"];
  assert.deepEqual(ids("ann"), both); assert.deepEqual(ids("cal"), both);
  assert.equal(kind(w.read("ann", V("ann")), "project-request").find((i) => i.subject.requester === "bob").quote, null,
    "a request with no comment carries no quote");
  /* one owner answers: it leaves for every owner at once */
  assert.equal(w.roster.projectRequestAnswer({ projectId: "PRJ-1", handle: "dee", answer: "decline", by: "ann", viewer: V("ann") }).ok, true);
  assert.deepEqual(ids("ann"), [both[0]]); assert.deepEqual(ids("cal"), [both[0]]);
  /* the requester withdraws */
  assert.equal(w.roster.projectRequestWithdraw({ projectId: "PRJ-1", by: "bob", viewer: V("bob") }).ok, true);
  assert.deepEqual(ids("ann"), []); assert.deepEqual(ids("cal"), []);
});

test("R42: controls: a participant who is not an owner, the requester, an outsider and a caller with no member have none; an owner of another project has none for this one; a request to a project the viewer may not see makes none", () => {
  const w = parkside();
  ask(w, "dee", "hello");
  w.bundle("PRJ-3", "project", { title: "Elsewhere" });
  w.membership.projectClaimOwner({ projectId: "PRJ-3", memberId: "bob" });
  w.membership.reindexProjectSight("PRJ-3");
  w.membership.projectInvite({ projectId: "PRJ-1", handle: "eve", by: "ann", viewer: V("ann") });
  w.membership.projectJoin({ projectId: "PRJ-1", by: "eve", viewer: V("eve") });
  for (const m of ["eve", "dee", "bob"]) assert.deepEqual(kind(w.read(m, V(m)), "project-request"), [], `${m}: not an owner of PRJ-1`);
  assert.deepEqual(kind(w.read(null, "class:admin"), "project-request"), [], "a caller with no member");
  assert.equal(kind(w.read("ann", V("ann")), "project-request").length, 1, "the owner has it");
  /* the owner's viewer cannot see a project hidden from her: no item and no id */
  w.run(`DELETE FROM project_visibility`);
  w.membership.reindexProjectSight("PRJ-1");
  const sees = kind(w.read("ann", V("ann")), "project-request");
  assert.equal(sees.length, 1, "she is still an owner and a participant of PRJ-1: hiding it from outsiders changes nothing for her");
});

test("R42: at most 50 owned projects are asked, in id order, the bound published; a request carries its own project's name", () => {
  const w = parkside();
  for (let i = 0; i < 52; i += 1) {
    const id = `PRJ-8${String(i).padStart(2, "0")}`;
    w.bundle(id, "project", { title: `Owned ${i}` });
    w.membership.projectClaimOwner({ projectId: id, memberId: "ann" });
    w.membership.reindexProjectSight(id);
    w.discoverable(id);
    ask(w, "dee", null, id);
  }
  /* ann owns 53 projects: PRJ-1, which holds no request, is the first of the 50 asked, so 49 of the 52 carry one */
  const items = kind(w.read("ann", V("ann")), "project-request");
  assert.equal(items.length, 49, "R42's bound: the first 50 owned projects in id order");
  assert.equal(items.at(-1).subject.id, "PRJ-848", "PRJ-849 and after are past the bound");
  assert.deepEqual(items.map((i) => i.subject.id), [...items.map((i) => i.subject.id)].sort(), "id order");
  assert.deepEqual([items[0].basis.bound.projects_bound, items[0].basis.bound.projects_truncated], [50, true]);
  assert.equal(items[0].summary, word("queue.project-request.summary", { who: "dee", project: "Owned 0" }));
});

test("R8: feedItems answers both kinds beside the others, and writes nothing", () => {
  const w = parkside();
  invite(w, "bob"); ask(w, "dee");
  const before = JSON.stringify(w.db.prepare(`SELECT * FROM project_join_requests`).all()) + JSON.stringify(w.db.prepare(`SELECT * FROM project_participants`).all());
  const r = w.read("ann", V("ann"));
  assert.ok(r.items.some((i) => i.kind === "project-request"));
  assert.ok(w.read("bob", V("bob")).items.some((i) => i.kind === "project-invitation"));
  assert.equal(JSON.stringify(w.db.prepare(`SELECT * FROM project_join_requests`).all()) + JSON.stringify(w.db.prepare(`SELECT * FROM project_participants`).all()), before);
});
