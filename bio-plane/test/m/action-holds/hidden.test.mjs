/* action-holds R2, R5–R9 at a hidden project's EXISTENCE (moved from `actions`' T41 entry: N822; D54, K2408, K2484;
   T45, K2781 (1)). A project a viewer "may name" is one she sees at FULL, or, as an administrator neither invited nor
   joined, a HIDDEN project she sees at EXISTENCE (membership R44): naming it reaches its id and hold state, never its
   contents. Each is tested with such an administrator (the founder, both spellings, and an enrolled administrator) and a
   hidden project, with its negative controls (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, received } from "./fixture.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", I3 = "INFO-2026-0003-p";
const ALICE = V("alice"), BOB = V("bob"), CAROL = V("carol"), DANA = V("dana");
const FOUNDER = V("admin"), FOUNDER_BARE = "admin";
const ABSENT = "PROJ-2026-0404-absent";
const sorted = (xs) => [...xs].sort();

/* Projects, by owner and setting: P1 alice's (hidden), P2 alice's (discoverable), P3 carol's (hidden, which no
   administrator was added to), P4 carol's (discoverable), P5 dana's (hidden; dana, an enrolled administrator, is its
   owner, so a participant at FULL). Bob is a member in none. A sits in P1, C in P3, B in no project; each holds a
   received entry marked legal pressure at 0 (B also at 1). I3 is a document in P3. */
function ground() {
  const w = world();
  w.st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated)
    VALUES ('dana','d','admin','active','t','t'), ('bob','b','member','active','t','t')`);
  const P1 = w.project("alice"), P2 = w.project("alice", "discoverable"), P3 = w.project("carol"),
        P4 = w.project("carol", "discoverable"), P5 = w.project("dana");
  w.action(A, [`project: ${P1}`, ...received(1)]);
  w.action(B, received(2));
  w.action(C, [`project: ${P3}`, ...received(1)], { author: CAROL });
  w.docIn(I3, P3, CAROL);
  for (const [id, ord, who] of [[A, 0, ALICE], [B, 0, ALICE], [B, 1, ALICE], [C, 0, CAROL]]) w.mark(id, ord, "legal", who);
  /* the ground's sight, as membership answers it (R44): the premise every test below rests on */
  const s = (p, v) => w.membership.sight(p, v);
  for (const admin of [FOUNDER, FOUNDER_BARE, DANA])
    assert.deepEqual([s(P1, admin), s(P2, admin), s(P3, admin), s(P4, admin)], ["existence", "full", "existence", "full"], admin);
  assert.equal(s(P5, DANA), "full", "an administrator who is a participant sees her hidden project whole");
  assert.equal(s(P5, FOUNDER), "existence");
  assert.deepEqual([s(P1, BOB), s(P2, BOB), s(P3, BOB), s(P4, BOB)], ["none", "existence", "none", "existence"]);
  const hold = (target, ord, who, extra = {}) =>
    w.h.actionHold({ target, ord, hold: "in_place", reason: "preserving", viewer: who, author: who, ...extra });
  const release = (target, ord, who, extra = {}) =>
    w.h.actionHoldRelease({ target, ord, reason: "the matter closed", viewer: who, author: who, ...extra });
  return { w, P1, P2, P3, P4, P5, hold, release };
}

test("R2 an administrator neither invited nor joined may name a hidden project in a hold (D54): it lands, covering it; a member who may not name one is still refused", () => {
  const { w, P1, P3, P4, P5, hold } = ground();
  const f = hold(B, 0, FOUNDER, { projects: [P1, P3] });
  assert.deepEqual(f, { ok: true, target: B, ord: 0, hold: "in_place", reason: "preserving", by: FOUNDER,
                        at: "2026-09-28T12:00:00Z", projects: sorted([P1, P3]) });
  assert.deepEqual(hold(B, 0, FOUNDER_BARE, { projects: [P3] }).projects, sorted([P1, P3]), "the bare spelling");
  assert.deepEqual(hold(B, 0, DANA, { projects: [P1, P5] }).projects, sorted([P1, P3, P5]),
    "an enrolled administrator: hidden at EXISTENCE, and her own hidden project at FULL");
  assert.deepEqual([P1, P3, P5].map((p) => w.h.holdsOn({ project: p }).held), [true, true, true]);
  assert.deepEqual(hold(B, 0, ALICE).projects, [P1], "alice names P1 (hers) and not P3 or P5");
  assert.deepEqual(hold(B, 0, BOB).projects, [], "bob names none of them");
  const disc = hold(B, 1, BOB, { projects: [P4] }), none = hold(B, 1, BOB, { projects: [P3] });
  assert.deepEqual([disc.reason, disc.check, disc.project, "owners" in disc], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", P4, false]);
  assert.deepEqual([none.reason, none.project], ["NO_SUCH_PROJECT", P3]);
  assert.equal(hold(B, 1, CAROL, { projects: [P1] }).reason, "NO_SUCH_PROJECT", "carol sees alice's hidden P1 not at all");
  assert.equal(hold(B, 1, FOUNDER, { projects: [ABSENT] }).reason, "NO_SUCH_PROJECT", "an absent project, administrator or not");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_holds WHERE ord = 1`)[0].n, 0, "no refusal writes a statement");
  /* naming reaches the id and hold state, never its contents: the action inside the hidden project stays unseen */
  assert.equal(hold(A, 0, FOUNDER).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.a.actionRead({ id: A, viewer: FOUNDER }).reason, "NO_SUCH_BUNDLE");
  /* (T45) the same at a project place: an administrator places a hold on a hidden project she may name */
  const at = w.h.actionHold({ project: P3, hold: "in_place", reason: "a letter came", viewer: FOUNDER, author: FOUNDER });
  assert.deepEqual([at.ok, at.project, at.projects], [true, P3, [P3]]);
  assert.equal(w.h.actionHold({ project: P3, hold: "in_place", reason: "x", viewer: BOB, author: BOB }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.h.actionHold({ project: P4, hold: "in_place", reason: "x", viewer: BOB, author: BOB }).reason,
    "PROJECT_SEEN_NOT_A_PARTICIPANT");
});

test("R2 the read shows each hold statement with those of its projects the viewer may name: an administrator's hidden projects at EXISTENCE included, a member's not", () => {
  const { w, P1, P3, P5, hold, release } = ground();
  hold(B, 0, DANA, { projects: [P1, P3, P5] });
  const projects = (viewer) => w.h.holdsOf({ target: B, ord: 0, viewer }).holds.map((h) => h.projects ?? h.restarted);
  assert.deepEqual(projects(FOUNDER), [sorted([P1, P3, P5])], "the founder: all three hidden, at EXISTENCE");
  assert.deepEqual(projects(FOUNDER_BARE), [sorted([P1, P3, P5])]);
  assert.deepEqual(projects(DANA), [sorted([P1, P3, P5])]);
  assert.deepEqual(projects(ALICE), [[P1]]);
  assert.deepEqual(projects(BOB), [[]], "a member who may name none of them");
  assert.deepEqual(w.h.pressureFor({ action: B, viewer: FOUNDER }).items[0].holds[0].projects, sorted([P1, P3, P5]), "pressureFor too");
  release(B, 0, BOB);
  assert.deepEqual(projects(FOUNDER).slice(-1), [sorted([P1, P3, P5])], "a release's restarted, by the same rule");
  assert.deepEqual(projects(ALICE).slice(-1), [[P1]]);
  assert.deepEqual(projects(BOB).slice(-1), [[]]);
});

test("R5 actionHoldRelease answers restarted as those the author may name: an administrator's hidden projects included; a member's answer leaves them out, and the statement records them whatever she sees", () => {
  const { w, P1, P3, hold, release } = ground();
  hold(B, 0, FOUNDER, { projects: [P1, P3] });
  assert.deepEqual(release(B, 0, DANA).restarted, sorted([P1, P3]));
  hold(B, 0, FOUNDER, { projects: [P1, P3] });
  const bobs = release(B, 0, BOB);
  assert.deepEqual([bobs.ok, bobs.restarted], [true, []], "bob may name neither");
  assert.deepEqual(w.rows(`SELECT project FROM action_hold_projects WHERE bundle_id=? AND seq=4 ORDER BY project`, B)
    .map((r) => r.project), sorted([P1, P3]), "recorded whatever the author may name");
  hold(B, 0, FOUNDER, { projects: [P1] });
  assert.deepEqual(release(B, 0, ALICE).restarted, [P1], "alice names her own");
});

test("R6 holdReleasePreview: restarts and out_of_view by may name: an administrator at a hidden project's EXISTENCE is shown it and nothing is out of view; a member is told only that something is", () => {
  const { w, P1, P3, hold } = ground();
  hold(B, 0, FOUNDER, { projects: [P1, P3] });
  const P = (viewer) => w.h.holdReleasePreview({ target: B, ord: 0, viewer });
  for (const admin of [FOUNDER, FOUNDER_BARE, DANA])
    assert.deepEqual(P(admin), { ok: true, target: B, ord: 0, hold: "in_place", restarts: sorted([P1, P3]), out_of_view: false }, admin);
  assert.deepEqual([P(ALICE).restarts, P(ALICE).out_of_view], [[P1], true], "alice may not name P3");
  assert.deepEqual(P(BOB), { ok: true, target: B, ord: 0, hold: "in_place", restarts: [], out_of_view: true });
  assert.ok(!JSON.stringify(P(BOB)).includes(P3) && !JSON.stringify(P(BOB)).includes("PROJ-"), "no id or count");
});

test("R7 projectHolds: an administrator at a hidden project's EXISTENCE is answered held with since and recorded_by, all this read names; a member who may not name it is answered null, as absent", () => {
  const { w, P1, P2, P3, P4, P5, hold } = ground();
  const Q = (viewer, projects = [P1, P2, P3, P4, P5, ABSENT]) =>
    w.h.projectHolds({ projects, viewer }).projects.map((p) => p.held);
  assert.deepEqual(Q(FOUNDER), [false, false, false, false, false, null]);
  assert.deepEqual(Q(DANA), [false, false, false, false, false, null]);
  assert.deepEqual(Q(BOB), [null, null, null, null, null, null], "bob names none: discoverable EXISTENCE is not naming");
  hold(C, 0, CAROL);
  const r = w.h.projectHolds({ projects: [P3], viewer: FOUNDER });
  assert.deepEqual(r, { ok: true, projects: [{ project: P3, held: true, since: "2026-09-28T12:00:00Z", recorded_by: CAROL }] });
  assert.deepEqual(w.h.projectHolds({ projects: [P3], viewer: FOUNDER_BARE }).projects, r.projects);
  assert.deepEqual(w.h.projectHolds({ projects: [P3], viewer: DANA }).projects, r.projects);
  const said = JSON.stringify(r);
  for (const named of [C, I3, "preserving", "a suit", "Project 3", "#0"]) assert.ok(!said.includes(named), `names no ${named}`);
  assert.deepEqual([...Q(ALICE, [P3]), ...Q(BOB, [P3])], [null, null]);
  hold(B, 0, DANA, { projects: [P5] });
  assert.deepEqual(w.h.projectHolds({ projects: [P5], viewer: DANA }).projects[0].held, true);
  assert.deepEqual(Q(ALICE, [P5]), [null]);
});

test("R8 holdsReleased: restarted as those the viewer may name, an administrator's hidden projects at EXISTENCE included; a member's never; a project place's release listed to whoever may name the project", () => {
  const { w, P1, P3, hold, release } = ground();
  hold(B, 0, FOUNDER, { projects: [P1, P3] });
  release(B, 0, FOUNDER);
  const restarted = (viewer) => w.h.holdsReleased({ viewer }).items.filter((x) => x.action).map((x) => [x.action, x.restarted]);
  assert.deepEqual(restarted(FOUNDER), [[B, sorted([P1, P3])]]);
  assert.deepEqual(restarted(DANA), [[B, sorted([P1, P3])]]);
  assert.deepEqual(restarted(ALICE), [[B, [P1]]]);
  assert.deepEqual(restarted(BOB), [[B, []]], "bob sees the release and none of its projects");
  assert.deepEqual(w.h.holdsReleased({ viewer: FOUNDER }).items[0].placers, [FOUNDER]);
  /* (T45) a project place: carol's hold on P3, released; the founder and carol are told, alice and bob not */
  assert.equal(w.h.actionHold({ project: P3, hold: "in_place", reason: "r", viewer: CAROL, author: CAROL }).ok, true);
  assert.equal(w.h.actionHoldRelease({ project: P3, reason: "done", viewer: CAROL, author: CAROL }).ok, true);
  const projectItems = (viewer) => w.h.holdsReleased({ viewer }).items.filter((x) => x.project).map((x) => [x.project, x.placers, x.restarted]);
  assert.deepEqual(projectItems(CAROL), [[P3, [CAROL], [P3]]]);
  assert.deepEqual(projectItems(FOUNDER), [[P3, [CAROL], [P3]]]);
  assert.deepEqual([projectItems(ALICE), projectItems(BOB)], [[], []]);
  /* paging across both kinds of place: B's entry, then P3 (position -1 in the cursor) */
  const p1 = w.h.holdsReleased({ viewer: CAROL, limit: 1 });
  assert.deepEqual([p1.items.map((x) => x.action ?? x.project), p1.truncated, p1.cursor], [[B], true, `${B}#0#2`]);
  const p2 = w.h.holdsReleased({ viewer: CAROL, after: p1.cursor, limit: 1 });
  assert.deepEqual([p2.items.map((x) => x.project), p2.truncated], [[P3], false]);
  assert.deepEqual(w.h.holdsReleased({ viewer: CAROL, after: `${P3}#-1#2` }).items, [], "after the project's release, none");
});

test("R9 purgeHeld reads every hold and every bundle's project whatever any viewer may see: a hidden project no administrator was added to is held as any other", () => {
  const { w, P1, P2, P3, hold, release } = ground();
  assert.equal(w.membership.inSight(P3, FOUNDER), false);
  assert.equal(w.membership.inSight(I3, FOUNDER), false);
  const ask = (id) => w.h.purgeHeld({ bundleId: id });
  assert.deepEqual([ask(P3), ask(I3), ask(C), ask(P1), ask(P2)], [false, false, false, false, false], "no hold in place");
  hold(C, 0, CAROL);
  assert.deepEqual([ask(P3), ask(I3), ask(C), ask(""), ask(P1), ask(P2)], [true, true, true, true, false, false]);
  assert.equal(w.h.purgeHeld(), true);
  release(C, 0, CAROL);
  assert.deepEqual([ask(P3), ask(I3)], [false, false]);
  hold(B, 0, FOUNDER, { projects: [P3] });
  assert.deepEqual([ask(P3), ask(I3), ask(C), ask(B), ask(P1), ask(P2)], [true, true, true, true, false, false],
    "C belongs to the held P3; P1 is named by no hold");
  const sight = w.membership.sight;
  w.membership.sight = () => { throw new Error("purgeHeld asked a viewer's sight"); };
  try { assert.deepEqual([ask(P3), ask(I3), ask(P2)], [true, true, false]); } finally { w.membership.sight = sight; }
});
