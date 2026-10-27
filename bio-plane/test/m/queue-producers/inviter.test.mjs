/* R44 (T51; N1209; K3667 doubt 14, K3674, K3843; project-roster R35): a project invitation names its inviter. The REAL
   project-roster answers `projectInvitations` over the world's own storage, beside the real membership whose rows the
   invitations are; a wrapper stands in its place where a test needs the read to fail, to page, or to state another instant.
   Every sentence is checked against setup-words' `word` for its key (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { Membership } from "../../../src/membership/index.mjs";

const V = (m) => `member:${m}`;
const kind = (r, k) => r.items.filter((i) => i.kind === k);

/* PRJ-1 "Parkside", owned by ana; bob, cy and dee are the members to invite. */
function parkside(fakes = {}) {
  const w = world(fakes);
  for (const m of ["ana", "bob", "cy", "dee"]) w.member(m, { handle: m });
  w.bundle("PRJ-1", "project", { title: "Parkside" });
  w.membership.projectClaimOwner({ projectId: "PRJ-1", memberId: "ana" });
  w.membership.reindexProjectSight("PRJ-1");
  w.discoverable("PRJ-1");
  return w;
}
const invite = (w, who, by = "ana") => {
  const r = w.membership.projectInvite({ projectId: "PRJ-1", handle: who, by, viewer: V(by) });
  assert.equal(r.ok, true, JSON.stringify(r));
};
/* a wrapper over the world's real project-roster whose `projectInvitations` is the test's own */
function wrapped(invitations) {
  let w;
  const calls = [];
  const roster = { projectList: (a) => w.roster.projectList(a), projectParticipants: (a) => w.roster.projectParticipants(a),
    projectRequests: (a) => w.roster.projectRequests(a), projectInvitations: (a) => { calls.push(a); return invitations(a, w); } };
  w = world({ projectRoster: roster });
  for (const m of ["ana", "bob", "cy", "dee"]) w.member(m, { handle: m });
  w.bundle("PRJ-1", "project", { title: "Parkside" });
  w.membership.projectClaimOwner({ projectId: "PRJ-1", memberId: "ana" });
  w.membership.reindexProjectSight("PRJ-1");
  w.discoverable("PRJ-1");
  w.calls = calls;
  return w;
}

test("R44: an invitation by Ana has a summary with Ana's handle, the instant project-roster states as its age, and the inviter on the basis", () => {
  const w = parkside();
  invite(w, "bob");
  w.run(`UPDATE project_participants SET created=? WHERE project_id='PRJ-1' AND member_id='bob'`, iso(NOW - 7200000));
  const [it] = kind(w.read("bob", V("bob")), "project-invitation");
  assert.equal(it.summary, word("queue.project-invitation.summary", { who: "ana", project: "Parkside" }));
  assert.equal(it.detail, word("queue.project-invitation.detail"));
  assert.deepEqual([it.summary_key, it.detail_key], ["queue.project-invitation.summary", "queue.project-invitation.detail"]);
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 7200000), ms: 7200000 }, "from invited_at");
  assert.deepEqual(it.basis.inviter, { member: "ana", handle: "ana", founder: false });
  assert.doesNotMatch(it.summary, /\badmin\b/);
});

test("R44: an invitation by a founder with no handle names member.founder.unnamed's word and never admin; one with no recorded inviter reads the unnamed key and is still raised", () => {
  const w = parkside();
  invite(w, "bob"); invite(w, "cy");
  /* the founder invited bob (no roster row of its own, no handle), and nobody is recorded as having invited cy */
  w.run(`UPDATE project_participants SET invited_by=? WHERE project_id='PRJ-1' AND member_id='bob'`, Membership.ROOT_ADMIN);
  w.run(`UPDATE project_participants SET invited_by=NULL WHERE project_id='PRJ-1' AND member_id='cy'`);
  const bob = kind(w.read("bob", V("bob")), "project-invitation")[0], cy = kind(w.read("cy", V("cy")), "project-invitation")[0];
  assert.equal(bob.summary, word("queue.project-invitation.summary", { who: word("member.founder.unnamed"), project: "Parkside" }));
  assert.doesNotMatch(bob.summary, /\badmin\b/i, "never the credential's name");
  assert.deepEqual(bob.basis.inviter, { member: Membership.ROOT_ADMIN, handle: null, founder: true });
  assert.equal(cy.summary, word("queue.project-invitation.summary.unnamed", { project: "Parkside" }));
  assert.equal(cy.summary_key, "queue.project-invitation.summary.unnamed");
  assert.equal(cy.basis.inviter, null);
  assert.equal(cy.age.state, "determined", "aged from her own row, as R41 states");
});

test("R44 (control): a projectInvitations that throws, or answers an empty list (the real answer for a viewer it holds no invitation for; it never refuses, R36), or lacks the project, leaves every item raised with the unnamed summary, aged from her own row's created", () => {
  for (const answer of [() => { throw new Error("read failed"); },
                        (a, world) => world.roster.projectInvitations({ ...a, viewer: V("nobody") }),
                        (a, world) => world.roster.projectInvitations({ ...a, viewer: V("ana") })]) {
    const w = wrapped(answer);
    invite(w, "bob");
    w.run(`UPDATE project_participants SET created=? WHERE project_id='PRJ-1' AND member_id='bob'`, iso(NOW - 3600000));
    const r = w.read("bob", V("bob"));
    const [it] = kind(r, "project-invitation");
    assert.equal(it.summary, word("queue.project-invitation.summary.unnamed", { project: "Parkside" }));
    assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 3600000), ms: 3600000 }, "R41: her own row's created");
    assert.equal(it.basis.inviter, null);
    assert.deepEqual(r.facts.failed.filter((f) => f.feed === "projects"), [], "the invitation was still read from projectList: the feed is not failed");
  }
});

test("R44: another member's invitation is in no list; the read is made under the viewer", () => {
  const w = wrapped((a, world) => world.roster.projectInvitations(a));
  invite(w, "bob");
  assert.deepEqual(kind(w.read("cy", V("cy")), "project-invitation"), [], "invited to none");
  assert.deepEqual(kind(w.read("ana", V("ana")), "project-invitation"), [], "an owner, joined");
  assert.deepEqual(kind(w.read("bob", V("bob")), "project-invitation").map((i) => i.id), ["OBLIGATION::project-invitation::PRJ-1::bob"]);
  assert.ok(w.calls.some((c) => c.viewer === V("bob")), "projectInvitations({viewer})");
});

test("R44: the read is followed by its `next` while it says truncated, to at most 50 invitations; an instant it states is the item's age", () => {
  const w = wrapped(() => null);
  /* sixty projects to which bob is invited, listed by the fake in pages of ten; each states its own invited_at */
  const ids = [];
  for (let i = 0; i < 60; i += 1) {
    const id = `PRJ-${String(100 + i)}`;
    ids.push(id);
    w.bundle(id, "project", { title: `P${i}` });
    w.discoverable(id);
    w.run(`INSERT INTO project_participants (project_id, member_id, state, owner, invited_by, created, updated) VALUES (?,?,?,?,?,?,?)`,
      id, "bob", "invited", 0, "ana", iso(NOW - 1000), iso(NOW - 1000));
  }
  const pages = [];
  w.fakes.projectRoster.projectInvitations = (a) => {
    pages.push(a.after ?? null);
    const from = a.after ? ids.indexOf(a.after) + 1 : 0;
    const slice = ids.slice(from, from + 10);
    return { ok: true, invitations: slice.map((id) => ({ projectId: id, name: id, invited_by: { member: "ana", handle: "ana" }, invited_at: iso(NOW - 99000) })),
             truncated: from + 10 < ids.length, next: slice[slice.length - 1] };
  };
  const items = kind(w.read("bob", V("bob")), "project-invitation");
  assert.equal(items.length, 50, "R41's bound");
  assert.ok(pages.length >= 5 && pages.length <= 6, `its pages are followed by next (${pages.length})`);
  assert.deepEqual(pages.slice(0, 2), [null, ids[9]]);
  assert.ok(items.every((i) => i.age.ms === 99000), "the instant projectInvitations states, not her row's created");
  assert.ok(items.every((i) => i.summary === word("queue.project-invitation.summary", { who: "ana", project: i.subject.name })));
});
