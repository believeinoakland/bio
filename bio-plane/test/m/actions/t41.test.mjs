/* actions' T41 entry at its interface: (N822; D54, K2408, K2484) R52, R56–R60, the hold acts and reads answered at a
   hidden project's EXISTENCE. A project a viewer "may name" is one she sees at FULL, or, as an administrator neither
   invited nor joined, a HIDDEN project she sees at EXISTENCE (membership R44): naming it reaches its id and hold state,
   never its contents. Each is tested with such an administrator (the founder, both spellings, and an enrolled
   administrator) and a hidden project, with its negative controls (K874): a discoverable project, or an administrator
   who is a participant, still at FULL; a member who may not name a project still refused or answered `held: null`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", I3 = "INFO-2026-0003-p";
const ALICE = V("alice"), BOB = V("bob"), CAROL = V("carol"), DANA = V("dana");
const FOUNDER = V("admin"), FOUNDER_BARE = "admin";
const ABSENT = "PROJ-2026-0404-absent";
const received = (n) => ["correspondence:", ...Array.from({ length: n }, (_, i) =>
  ["  - direction: received", "    at: 2026-09-03", `    account: "reply ${i}"`, "    author: member:alice"]).flat()];
const sorted = (xs) => [...xs].sort();

/* Projects, by owner and setting: P1 alice's (hidden), P2 alice's (discoverable), P3 carol's (hidden, which no
   administrator was added to), P4 carol's (discoverable), P5 dana's (hidden; dana, an enrolled administrator, is its
   owner, so a participant at FULL). Bob is a member in none. A sits in P1, C in P3, B in no project; each holds a
   received entry marked legal pressure at 0 (B also at 1). I3 is a document in P3. */
function ground() {
  const w = world();
  w.st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated)
    VALUES ('dana','d','admin','active','t','t'), ('bob','b','member','active','t','t')`);
  let k = 0;
  const proj = (owner, visibility) => {
    const r = w.promotion.promote({ base: null, snapKey: `p${++k}`, author: V(owner), ownerMemberId: owner,
      ...(visibility ? { visibility } : {}),
      files: [{ path: "bundle.md", text: ["---", "object_type: project", "schema: project@1", `title: "Project ${k}"`,
        "current_state: forming", "prior_state: null", 'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"',
        "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n") }],
      meta: { object_type: "project" } });
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.bundleId;
  };
  const P1 = proj("alice"), P2 = proj("alice", "discoverable"), P3 = proj("carol"), P4 = proj("carol", "discoverable"),
        P5 = proj("dana");
  w.action(A, [`project: ${P1}`, ...received(1)]);
  w.action(B, received(2));
  w.action(C, [`project: ${P3}`, ...received(1)], { author: CAROL });
  const doc = w.promote(I3, ["---", `id: ${I3}`, "object_type: information", `title: ${I3}`, "current_state: collected",
    `project: ${P3}`, 'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"),
    { author: CAROL });
  assert.equal(doc.ok, true, JSON.stringify(doc));
  for (const [id, ord, who] of [[A, 0, ALICE], [B, 0, ALICE], [B, 1, ALICE], [C, 0, CAROL]])
    assert.equal(w.a.actionPressure({ target: id, ord, pressure: { kind: "legal", note: "a suit" }, viewer: who,
                                      author: who }).ok, true);
  /* the ground's sight, as membership answers it (R44): the premise every test below rests on */
  const s = (p, v) => w.membership.sight(p, v);
  for (const admin of [FOUNDER, FOUNDER_BARE, DANA])
    assert.deepEqual([s(P1, admin), s(P2, admin), s(P3, admin), s(P4, admin)], ["existence", "full", "existence", "full"], admin);
  assert.equal(s(P5, DANA), "full", "an administrator who is a participant sees her hidden project whole");
  assert.equal(s(P5, FOUNDER), "existence");
  assert.deepEqual([s(P1, BOB), s(P2, BOB), s(P3, BOB), s(P4, BOB)], ["none", "existence", "none", "existence"]);
  const hold = (target, ord, who, extra = {}) =>
    w.a.actionHold({ target, ord, hold: "in_place", reason: "preserving", viewer: who, author: who, ...extra });
  const release = (target, ord, who, extra = {}) =>
    w.a.actionHoldRelease({ target, ord, reason: "the matter closed", viewer: who, author: who, ...extra });
  return { w, P1, P2, P3, P4, P5, hold, release };
}

test("R52 an administrator neither invited nor joined may name a hidden project in a hold (D54): it lands, covering it; a member who may not name one is still refused", () => {
  const { w, P1, P3, P4, P5, hold } = ground();
  /* the founder, both spellings, and an enrolled administrator, each naming hidden projects seen at EXISTENCE */
  const f = hold(B, 0, FOUNDER, { projects: [P1, P3] });
  assert.deepEqual(f, { ok: true, target: B, ord: 0, hold: "in_place", reason: "preserving", by: FOUNDER,
                        at: "2026-09-28T12:00:00Z", projects: sorted([P1, P3]) });
  assert.deepEqual(hold(B, 0, FOUNDER_BARE, { projects: [P3] }).projects, sorted([P1, P3]), "the bare spelling");
  assert.deepEqual(hold(B, 0, DANA, { projects: [P1, P5] }).projects, sorted([P1, P3, P5]),
    "an enrolled administrator: hidden at EXISTENCE, and her own hidden project at FULL");
  /* the hold reaches the hidden projects' hold state, as the plane reads it */
  assert.deepEqual([P1, P3, P5].map((p) => w.a.holdsOn({ project: p }).held), [true, true, true]);
  /* the same statements answered to a viewer who may not name them: only what she may */
  assert.deepEqual(hold(B, 0, ALICE).projects, [P1], "alice names P1 (hers) and not P3 or P5");
  assert.deepEqual(hold(B, 0, BOB).projects, [], "bob names none of them");
  /* negative controls: a member at a discoverable project's EXISTENCE, and one who sees a hidden project not at all */
  const disc = hold(B, 1, BOB, { projects: [P4] }), none = hold(B, 1, BOB, { projects: [P3] });
  assert.deepEqual([disc.reason, disc.check, disc.project, "owners" in disc], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", P4, false]);
  assert.deepEqual([none.reason, none.project], ["NO_SUCH_PROJECT", P3]);
  assert.equal(hold(B, 1, CAROL, { projects: [P1] }).reason, "NO_SUCH_PROJECT", "carol sees alice's hidden P1 not at all");
  assert.equal(hold(B, 1, FOUNDER, { projects: [ABSENT] }).reason, "NO_SUCH_PROJECT", "an absent project, administrator or not");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_holds WHERE ord = 1`)[0].n, 0, "no refusal writes a statement");
  /* naming reaches the id and hold state, never its contents: the action inside the hidden project stays unseen */
  assert.equal(hold(A, 0, FOUNDER).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.a.actionRead({ id: A, viewer: FOUNDER }).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.a.actionRead({ id: C, viewer: DANA }).reason, "NO_SUCH_BUNDLE");
});

test("R52 R25 the read shows each hold statement with those of its projects the viewer may name: an administrator's hidden projects at EXISTENCE included, a member's not", () => {
  const { w, P1, P3, P5, hold, release } = ground();
  hold(B, 0, DANA, { projects: [P1, P3, P5] });
  const projects = (viewer) => w.a.actionRead({ id: B, viewer }).pressure[0].holds.map((h) => h.projects ?? h.restarted);
  assert.deepEqual(projects(FOUNDER), [sorted([P1, P3, P5])], "the founder: all three hidden, at EXISTENCE");
  assert.deepEqual(projects(FOUNDER_BARE), [sorted([P1, P3, P5])]);
  assert.deepEqual(projects(DANA), [sorted([P1, P3, P5])]);
  assert.deepEqual(projects(ALICE), [[P1]]);
  assert.deepEqual(projects(BOB), [[]], "a member who may name none of them");
  assert.deepEqual(w.decorate(B, undefined, FOUNDER).action.pressure[0].holds[0].projects, sorted([P1, P3, P5]), "the decoration too");
  release(B, 0, BOB);
  assert.deepEqual(projects(FOUNDER).slice(-1), [sorted([P1, P3, P5])], "a release's restarted, by the same rule");
  assert.deepEqual(projects(ALICE).slice(-1), [[P1]]);
  assert.deepEqual(projects(BOB).slice(-1), [[]]);
});

test("R56 actionHoldRelease answers restarted as those the author may name: an administrator's hidden projects included; a member's answer leaves them out, and the statement records them whatever she sees", () => {
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

test("R57 holdReleasePreview: restarts and out_of_view by may name: an administrator at a hidden project's EXISTENCE is shown it and nothing is out of view; a member is told only that something is", () => {
  const { w, P1, P3, hold } = ground();
  hold(B, 0, FOUNDER, { projects: [P1, P3] });
  const P = (viewer) => w.a.holdReleasePreview({ target: B, ord: 0, viewer });
  for (const admin of [FOUNDER, FOUNDER_BARE, DANA])
    assert.deepEqual(P(admin), { ok: true, target: B, ord: 0, hold: "in_place", restarts: sorted([P1, P3]), out_of_view: false }, admin);
  assert.deepEqual([P(ALICE).restarts, P(ALICE).out_of_view], [[P1], true], "alice may not name P3");
  assert.deepEqual(P(BOB), { ok: true, target: B, ord: 0, hold: "in_place", restarts: [], out_of_view: true });
  assert.ok(!JSON.stringify(P(BOB)).includes(P3) && !JSON.stringify(P(BOB)).includes("PROJ-"), "no id or count");
});

test("R58 projectHolds: an administrator at a hidden project's EXISTENCE is answered held with since and recorded_by, all this read names; a member who may not name it is answered null, as absent", () => {
  const { w, P1, P2, P3, P4, P5, hold } = ground();
  const Q = (viewer, projects = [P1, P2, P3, P4, P5, ABSENT]) =>
    w.a.projectHolds({ projects, viewer }).projects.map((p) => p.held);
  /* no hold in place: false for each the administrator may name, hidden at EXISTENCE included */
  assert.deepEqual(Q(FOUNDER), [false, false, false, false, false, null]);
  assert.deepEqual(Q(DANA), [false, false, false, false, false, null]);
  assert.deepEqual(Q(BOB), [null, null, null, null, null, null], "bob names none: discoverable EXISTENCE is not naming");
  /* carol holds P3 (hers, hidden; no administrator added): the administrators are answered it */
  hold(C, 0, CAROL);
  const r = w.a.projectHolds({ projects: [P3], viewer: FOUNDER });
  assert.deepEqual(r, { ok: true, projects: [{ project: P3, held: true, since: "2026-09-28T12:00:00Z", recorded_by: CAROL }] });
  assert.deepEqual(w.a.projectHolds({ projects: [P3], viewer: FOUNDER_BARE }).projects, r.projects);
  assert.deepEqual(w.a.projectHolds({ projects: [P3], viewer: DANA }).projects, r.projects);
  const said = JSON.stringify(r);
  for (const named of [C, I3, "preserving", "a suit", "Project 3", "#0"]) assert.ok(!said.includes(named), `names no ${named}`);
  /* negative controls: alice and bob may not name P3; an administrator who is a participant reads P5 at FULL */
  assert.deepEqual([...Q(ALICE, [P3]), ...Q(BOB, [P3])], [null, null]);
  hold(B, 0, DANA, { projects: [P5] });
  assert.deepEqual(w.a.projectHolds({ projects: [P5], viewer: DANA }).projects[0].held, true);
  assert.deepEqual(Q(ALICE, [P5]), [null]);
});

test("R59 holdsReleased: restarted as those the viewer may name, an administrator's hidden projects at EXISTENCE included; a member's never", () => {
  const { w, P1, P3, hold, release } = ground();
  hold(B, 0, FOUNDER, { projects: [P1, P3] });
  release(B, 0, FOUNDER);
  const restarted = (viewer) => w.a.holdsReleased({ viewer }).items.map((x) => [x.action, x.restarted]);
  assert.deepEqual(restarted(FOUNDER), [[B, sorted([P1, P3])]]);
  assert.deepEqual(restarted(DANA), [[B, sorted([P1, P3])]]);
  assert.deepEqual(restarted(ALICE), [[B, [P1]]]);
  assert.deepEqual(restarted(BOB), [[B, []]], "bob sees the release and none of its projects");
  assert.deepEqual(w.a.holdsReleased({ viewer: FOUNDER }).items[0].placers, [FOUNDER]);
});

test("R60 purgeHeld reads every hold and every bundle's project whatever any viewer may see: a hidden project no administrator was added to is held as any other", () => {
  const { w, P1, P2, P3, hold, release } = ground();
  /* the founder's viewer does not see P3 or what belongs to it (membership R43): the premise */
  assert.equal(w.membership.inSight(P3, FOUNDER), false);
  assert.equal(w.membership.inSight(I3, FOUNDER), false);
  const ask = (id) => w.a.purgeHeld({ bundleId: id });
  assert.deepEqual([ask(P3), ask(I3), ask(C), ask(P1), ask(P2)], [false, false, false, false, false], "no hold in place");
  /* carol's hold on C, in P3 */
  hold(C, 0, CAROL);
  assert.deepEqual([ask(P3), ask(I3), ask(C), ask(""), ask(P1), ask(P2)], [true, true, true, true, false, false]);
  assert.equal(w.a.purgeHeld(), true);
  /* the same through a hold the founder placed naming it, on an action in no project */
  release(C, 0, CAROL);
  assert.deepEqual([ask(P3), ask(I3)], [false, false]);
  hold(B, 0, FOUNDER, { projects: [P3] });
  assert.deepEqual([ask(P3), ask(I3), ask(C), ask(B), ask(P1), ask(P2)], [true, true, true, true, false, false],
    "C belongs to the held P3; P1 is named by no hold");
  /* no viewer is asked: membership's sight is never read for it */
  const sight = w.membership.sight;
  w.membership.sight = () => { throw new Error("purgeHeld asked a viewer's sight"); };
  try { assert.deepEqual([ask(P3), ask(I3), ask(P2)], [true, true, false]); } finally { w.membership.sight = sight; }
});
