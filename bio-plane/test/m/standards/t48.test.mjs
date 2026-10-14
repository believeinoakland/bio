/* standards T48 (T48-21; N1029, K3145): the project a proposal is made for (R56), and the standards proposed for a
   project, by the project's sight (R57). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, BYLAW, REASON } from "./fixture.mjs";
import { standardsOps, PROPOSAL_STATES } from "../../../src/standards/index.mjs";
import { MEMBERSHIP_CHECKS, PROJECT_VISIBILITY_CHECKS } from "../../../src/membership/checks.mjs";
import { proposalLabel } from "../../../src/record-grammar/labels.mjs";

/* bob's project, carol a participant of it by invitation and join; a second project of bob's; dave outside both */
function world() {
  const w = seeded();
  w.member("dave");
  const P = w.project("Harbour permits", "bob");
  const Q = w.project("Another project", "bob");
  for (const [proj, who] of [[P, "carol"]]) {
    const inv = w.membership.projectInvite({ projectId: proj, handle: `h_${who}`, by: "bob", viewer: V("bob") });
    assert.equal(inv.ok, true, JSON.stringify(inv).slice(0, 300));
    assert.equal(w.membership.projectJoin({ projectId: proj, by: who, viewer: V(who) }).ok, true);
  }
  return { w, P, Q };
}

const propose = (w, extra) => w.s.standardPropose({ cite: BYLAW, kind: "ordinance", issuer: "Port Ellery Selectboard", why: "It governs permits.", proposer: V("carol"),
                                                    viewer: V("carol"), ...extra });

/* the refusal membership answers a read naming a project the viewer does not see whole */
function unseenProject(r, code, project) {
  assert.equal(r.ok, false);
  assert.equal(r.reason, code, JSON.stringify(r).slice(0, 300));
  assert.equal(r.check, (MEMBERSHIP_CHECKS[code] || PROJECT_VISIBILITY_CHECKS[code]).check);
  assert.equal(r.project, project);
}

test("R56 standardPropose takes an optional project, one the proposer's viewer sees whole: a proposal made for a project the member has joined answers that project, kept beside it through an adoption and answered by R54; one naming none, and one held before T48, name none", () => {
  const { w, P } = world();
  const text = w.passage().contentId;
  const m = propose(w, { project: P, text: [text] });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  assert.equal(m.proposal.project, P);
  assert.deepEqual(w.rows(`SELECT project FROM standard_proposals WHERE proposal_id=?`, m.proposal.id), [{ project: P }]);
  assert.equal(w.s.standardProposalRead({ proposal: m.proposal.id, viewer: V("carol") }).proposal.project, P);
  /* R54 names it only to a viewer who sees the project whole (dave is outside it) */
  assert.equal(w.s.standardProposalRead({ proposal: m.proposal.id, viewer: V("dave") }).proposal.project, null);
  /* unchanged by an adoption */
  const a = w.s.standardAdopt({ proposal: m.proposal.id, author: V("bob"), viewer: V("bob"), reason: REASON });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.equal(w.s.standardProposalRead({ proposal: m.proposal.id, viewer: V("bob") }).proposal.project, P);
  assert.deepEqual(w.rows(`SELECT project FROM standard_proposals WHERE proposal_id=?`, m.proposal.id), [{ project: P }]);
  /* none named: none, for "" and null alike */
  for (const project of [undefined, null, ""]) {
    const n = propose(w, project === undefined ? {} : { project });
    assert.equal(n.ok, true);
    assert.equal(n.proposal.project, null);
  }
  /* a machine proposer (the Legal/Policy Lookup skill's run) sees every bundle, so names the project */
  assert.equal(w.s.standardPropose({ cite: BYLAW, why: "w", project: P, proposer: MACHINE, viewer: MACHINE }).proposal.project, P);
  /* a proposal held before T48 (no project column filled) names none */
  w.st.sql.exec(`INSERT INTO standard_proposals (proposal_id, cite, why, proposed_by, proposed_at) VALUES ('STDP-2025-0001', 'Old', 'w', 'member:bob', '2025-01-01T00:00:00Z')`);
  assert.equal(w.s.standardProposalRead({ proposal: "STDP-2025-0001", viewer: V("bob") }).proposal.project, null);
});

test("R56 control: a proposal naming a project hidden from its proposer, one it sees only at existence, an id naming no project or a bundle that is not one, is refused as membership answers a read naming it, before any other check, and writes nothing", () => {
  const { w, P, Q } = world();
  const snap = w.snapshot();
  /* Q is hidden from carol (none): answered exactly as an id naming no project */
  unseenProject(propose(w, { project: Q }), "NO_SUCH_PROJECT", Q);
  unseenProject(propose(w, { project: "PRJ-2026-9999" }), "NO_SUCH_PROJECT", "PRJ-2026-9999");
  const info = w.passage();
  const snap2 = w.snapshot();
  unseenProject(propose(w, { project: info.bundleId }), "NO_SUCH_PROJECT", info.bundleId);
  assert.deepEqual(w.snapshot(), snap2);
  /* sight before any other check: a bad why still answers the project's refusal */
  unseenProject(propose(w, { project: Q, why: "" }), "NO_SUCH_PROJECT", Q);
  /* no viewer and no proposer: nobody sees it */
  unseenProject(w.s.standardPropose({ cite: BYLAW, why: "w", project: P }), "NO_SUCH_PROJECT", P);
  /* Q discoverable: carol sees it at existence */
  assert.equal(w.membership.projectVisibilitySet({ projectId: Q, setting: "discoverable", by: "bob", viewer: V("bob") }).ok, true);
  const snap3 = w.snapshot();
  unseenProject(propose(w, { project: Q }), "PROJECT_SEEN_NOT_A_PARTICIPANT", Q);
  assert.deepEqual(w.snapshot(), snap3, "a refused proposal writes nothing");
  /* the control: her own project lands */
  assert.equal(propose(w, { project: P }).ok, true);
  assert.notDeepEqual(snap, w.snapshot());
});

test("R57 proposalsFor lists the proposals made for a project, newest first, each with its label, whether it names text and its adoption: two proposals made for a project, one adopted, answer one under open and one under adopted; a proposal made for another project, and one naming none, are not listed", () => {
  const { w, P, Q } = world();
  const text = w.passage().contentId;
  w.clock.now = "2026-10-01T10:00:00.000Z";
  const one = propose(w, { project: P, text: [text] }).proposal;
  w.clock.now = "2026-10-02T10:00:00.000Z";
  const two = w.s.standardPropose({ cite: "PEBL § 14", why: "Fees.", project: P, proposer: MACHINE, viewer: MACHINE }).proposal;
  propose(w, {});                                                                               /* none named */
  w.s.standardPropose({ cite: "PEBL § 15", why: "Other.", project: Q, proposer: V("bob"), viewer: V("bob") }); /* another project */
  w.clock.now = "2026-10-03T10:00:00.000Z";
  const a = w.s.standardAdopt({ proposal: one.id, author: V("bob"), viewer: V("bob"), reason: REASON });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  const before = w.snapshot();
  const open = w.s.proposalsFor({ project: P, viewer: V("carol") });
  assert.equal(open.ok, true, JSON.stringify(open).slice(0, 300));
  assert.deepEqual([open.state, open.items.map((i) => i.id), open.truncated, open.cursor], ["open", [two.id], false, null]);
  const label = proposalLabel(MACHINE, "standard");
  assert.deepEqual(open.items[0], { id: two.id, cite: "PEBL § 14", kind: null, issuer: null, why: "Fees.",
                                    label: proposalLabel(MACHINE, "standard"), proposed_by: MACHINE,
                                    proposed_at: "2026-10-02T10:00:00Z", has_text: false, adoption: null, standard: false,
                                    says: open.items[0].says });
  assert.equal(label.machine_work, true);
  assert.match(open.items[0].says, /a proposal and not a standard/, "R9's sentence on each item");
  const adopted = w.s.proposalsFor({ project: P, state: "adopted", viewer: V("carol") });
  assert.deepEqual(adopted.items.map((i) => [i.id, i.has_text, i.adoption]),
                   [[one.id, true, { standard: a.id, by: V("bob"), at: "2026-10-03T10:00:00Z" }]]);
  assert.equal(adopted.items[0].label.machine_work, false);
  const all = w.s.proposalsFor({ project: P, state: "all", viewer: V("carol") });
  assert.deepEqual(all.items.map((i) => i.id), [two.id, one.id], "newest first");
  assert.deepEqual(w.s.proposalsFor({ project: Q, state: "all", viewer: V("bob") }).items.map((i) => i.cite), ["PEBL § 15"]);
  assert.deepEqual(w.snapshot(), before, "the read writes nothing");
  /* through its op */
  const url = new URL(`https://x/?op=standardproposals&project=${P}&state=all&viewer=${encodeURIComponent(V("carol"))}`);
  assert.deepEqual(standardsOps(w.s, url, {}).standardproposals(), all);
  assert.deepEqual(PROPOSAL_STATES, ["open", "adopted", "all"]);
});

test("R57 a viewer below full sight of the project is answered as R56 refuses, nothing listed or counted; any other state is the required-argument refusal naming state and its values, nothing read; it never throws", () => {
  const { w, P, Q } = world();
  propose(w, { project: P });
  for (const viewer of [V("dave"), null, undefined, "", "nobody"]) {
    const r = w.s.proposalsFor({ project: P, viewer });
    unseenProject(r, "NO_SUCH_PROJECT", P);
    assert.equal(r.items, undefined);
    assert.equal(r.count, undefined);
  }
  unseenProject(w.s.proposalsFor({ project: "PRJ-2026-9999", viewer: V("carol") }), "NO_SUCH_PROJECT", "PRJ-2026-9999");
  unseenProject(w.s.proposalsFor({ viewer: V("carol") }), "NO_SUCH_PROJECT", null);
  assert.equal(w.membership.projectVisibilitySet({ projectId: P, setting: "discoverable", by: "bob", viewer: V("bob") }).ok, true);
  unseenProject(w.s.proposalsFor({ project: P, viewer: V("dave") }), "PROJECT_SEEN_NOT_A_PARTICIPANT", P);
  for (const state of ["closed", "OPEN", 7]) {
    const r = w.s.proposalsFor({ project: Q, state, viewer: V("dave") });
    assert.deepEqual([r.ok, r.reason, r.argument, r.shape, r.status], [false, "REQUIRED_ARGUMENT_MISSING", "state", "open, adopted, all", 400]);
  }
  for (const a of [undefined, null, { project: { trim() { throw new Error("x"); } }, viewer: V("bob") }])
    assert.doesNotThrow(() => w.s.proposalsFor(a ?? undefined));
});

test("R57 an adoption whose standard the viewer may not read (R37) is answered as R54 answers it, and that proposal counted only as open", () => {
  const { w, P } = world();
  /* a policy held at a hidden project's sight (alice's, which carol does not see) */
  w.member("erin");
  const H = w.project("Source material", "erin");
  const hidden = w.passage("leaked");
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, H, hidden.contentId);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, H, hidden.bundleId);
  const p = w.s.standardPropose({ cite: "HSO 4/21 para 3", kind: "policy", issuer: "Harbour Master", why: "w", project: P,
                                  proposer: V("bob"), viewer: V("bob") }).proposal;
  assert.equal(w.membership.projectInvite({ projectId: H, handle: "h_bob", by: "erin", viewer: V("erin") }).ok, true);
  assert.equal(w.membership.projectJoin({ projectId: H, by: "bob", viewer: V("bob") }).ok, true);
  const a = w.s.standardAdopt({ proposal: p.id, author: V("bob"), viewer: V("bob"), reason: REASON, text: [hidden.contentId] });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  /* bob reads the standard: adopted */
  assert.deepEqual(w.s.proposalsFor({ project: P, state: "adopted", viewer: V("bob") }).items.map((i) => i.adoption.standard), [a.id]);
  assert.equal(w.s.proposalsFor({ project: P, viewer: V("bob") }).items.length, 0);
  /* carol may not: open, its adoption unanswered, never under adopted */
  const open = w.s.proposalsFor({ project: P, viewer: V("carol") });
  assert.deepEqual(open.items.map((i) => [i.id, i.adoption]), [[p.id, null]]);
  assert.deepEqual(w.s.proposalsFor({ project: P, state: "adopted", viewer: V("carol") }).items, []);
  assert.equal(w.s.standardProposalRead({ proposal: p.id, viewer: V("carol") }).reason, "STANDARD_NO_SUCH_PROPOSAL");
});

test("R57 a page is at most limit (default 50, clamped 1 to 200), truncated by reading one past, after an id continuing it; an after naming no proposal of the project is the required-argument refusal naming after", () => {
  const { w, P } = world();
  const ids = [];
  for (let i = 0; i < 5; i++) {
    w.clock.now = `2026-10-0${i + 1}T10:00:00.000Z`;
    ids.push(propose(w, { project: P, why: `w${i}` }).proposal.id);
  }
  /* two at one instant: ordered by id, newest first */
  ids.push(propose(w, { project: P, why: "same instant" }).proposal.id);
  const newest = [...ids].reverse();
  const p1 = w.s.proposalsFor({ project: P, limit: 2, viewer: V("carol") });
  assert.deepEqual([p1.items.map((i) => i.id), p1.truncated, p1.cursor, p1.limit], [newest.slice(0, 2), true, newest[1], 2]);
  const p2 = w.s.proposalsFor({ project: P, limit: 2, after: p1.cursor, viewer: V("carol") });
  assert.deepEqual(p2.items.map((i) => i.id), newest.slice(2, 4));
  const p3 = w.s.proposalsFor({ project: P, limit: 2, after: p2.cursor, viewer: V("carol") });
  assert.deepEqual([p3.items.map((i) => i.id), p3.truncated, p3.cursor], [newest.slice(4), false, null]);
  assert.equal(w.s.proposalsFor({ project: P, viewer: V("carol") }).limit, 50);
  assert.equal(w.s.proposalsFor({ project: P, limit: 0, viewer: V("carol") }).limit, 1);
  assert.equal(w.s.proposalsFor({ project: P, limit: 999, viewer: V("carol") }).limit, 200);
  assert.equal(w.s.proposalsFor({ project: P, limit: "x", viewer: V("carol") }).limit, 50);
  const other = propose(w, {}).proposal.id;
  for (const after of ["STDP-2026-9999", other, 7]) {
    const r = w.s.proposalsFor({ project: P, after, viewer: V("carol") });
    assert.deepEqual([r.ok, r.reason, r.argument], [false, "REQUIRED_ARGUMENT_MISSING", "after"]);
  }
});
