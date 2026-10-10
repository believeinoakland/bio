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

/* ---------------------------------------------------------------- R70, R71 (H30 (1); K2505, K2552, K2553) */

const E1 = "ENT-2026-0001-council", E2 = "ENT-2026-0002-board";
/* progressions R5's `readProgression`, a stand-in in its shape: `meeting` declares notice, minutes; `budget` adopted.
   Each key read is kept in `asked`; `broken` makes every read throw. */
function progressionsStandIn() {
  const defs = { meeting: ["notice", "minutes"], budget: ["adopted"] };
  const p = { asked: [], broken: false,
    readProgression({ progressionKey }) {
      p.asked.push(progressionKey);
      if (p.broken) throw new Error("progressions unavailable");
      return defs[progressionKey]
        ? { ok: true, progression_key: progressionKey, found: true,
            stages: defs[progressionKey].map((k, i) => ({ stage_key: k, stage_no: i + 1 })) }
        : { ok: true, progression_key: progressionKey, found: false, stages: [] };
    } };
  return p;
}
const seeksLines = (items) => ["seeks:", ...items.flatMap((x) =>
  [`  - progression: ${x.progression}`, `    entity: ${x.entity}`, `    stage: ${x.stage}`])];
const rr = (lines = []) => ["action_kind: records_request", ...lines];
const CPL = ["counterparty:", "  state: named", "  role: Town Clerk", "  body: Town of Port Ellery"];
import { actionMd } from "./fixture.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";
import * as actions from "../../../src/actions/index.mjs";
const md = (id, lines) => actionMd(id, [...CPL, ...lines]);

test("R70 a records_request stating seeks is checked at the write through progressions.readProgression: a progression not held or a stage not declared is refused SEEKS_REFUSED (C-117.29) with every finding, before any write", () => {
  const progressions = progressionsStandIn();
  const w = world({ deps: { progressions } });
  const ok = [{ progression: "meeting", entity: E1, stage: "minutes" }, { progression: "budget", entity: E2, stage: "adopted" }];
  /* negative control: every item held and declared lands, the facts read once per distinct progression */
  assert.equal(w.promote(A, md(A, rr(seeksLines(ok)))).ok, true);
  assert.deepEqual(sorted(progressions.asked), ["budget", "meeting"]);
  assert.deepEqual(grammar.seeksOf(w.fm(A)), ok, "the document holds what was stated");
  /* a progression not held, and a stage the progression does not declare: one finding each, all carried */
  const bad = w.promote(B, md(B, rr(seeksLines([{ progression: "zoning", entity: E1, stage: "notice" },
    { progression: "meeting", entity: E1, stage: "vote" }, { progression: "meeting", entity: E2, stage: "notice" }]))));
  const row = grammar.ACTION_CATALOGUE_CHECKS.SEEKS_REFUSED;
  assert.deepEqual([bad.ok, bad.reason, bad.code, bad.check, bad.translation], [false, "SEEKS_REFUSED", "SEEKS_REFUSED", "C-117.29", row.translation]);
  assert.equal(bad.findings.length, 2);
  assert.ok(bad.findings.every((f) => f.check === "C-117.29" && f.code === "SEEKS_REFUSED"));
  assert.match(bad.findings[0].detail, /zoning' is not a progression this record holds/);
  assert.match(bad.findings[1].detail, /'vote' is not a stage progression 'meeting' declares/);
  assert.equal(w.record.head(B), null, "nothing written");
  /* the grammar's shape arms reach the write too: on another kind, over 12, malformed, repeated */
  const thirteen = Array.from({ length: 13 }, (_, i) => ({ progression: "meeting", entity: `ENT-2026-${1000 + i}-x`, stage: "notice" }));
  for (const lines of [["action_kind: other", ...seeksLines(ok)], rr(seeksLines(thirteen)), rr(["seeks: []"]),
                       rr(seeksLines([ok[0], ok[0]])), rr(["seeks:", "  - progression: meeting", "    entity: E"])])
    assert.equal(w.promote(C, md(C, lines)).reason, "SEEKS_REFUSED", JSON.stringify(lines).slice(0, 80));
  assert.equal(w.record.head(C), null);
  /* a revision that changes seeks is judged; one that carries it forward is not re-read */
  const before = progressions.asked.length;
  assert.equal(w.promote(A, md(A, rr([...seeksLines(ok), 'note: "a revision"']))).ok, true);
  assert.equal(progressions.asked.length, before, "carried forward unchanged: not asked again");
  assert.equal(w.promote(A, md(A, rr(seeksLines([{ progression: "budget", entity: E2, stage: "notice" }])))).reason, "SEEKS_REFUSED");
  /* progressions unreadable: refused, never passed, and said so */
  progressions.broken = true;
  const un = w.promote(C, md(C, rr(seeksLines(ok))));
  assert.deepEqual([un.reason, un.cause], ["SEEKS_REFUSED", "PROGRESSIONS_UNREADABLE"]);
  /* absent seeks asks nothing of progressions */
  progressions.asked.length = 0;
  assert.equal(w.promote(C, md(C, rr())).ok, true);
  assert.deepEqual(progressions.asked, []);
});

test("R72 R70 any member who may write the action may state seeks; a machine or unstamped author that states, changes or removes it is refused MACHINE_CANNOT_STATE_SEEKS (C-32.21) before any write; a machine carrying it forward unchanged lands", () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  const ok = [{ progression: "meeting", entity: E1, stage: "minutes" }];
  for (const author of ["class:daemon", ""]) {
    const r = w.promote(A, md(A, rr(seeksLines(ok))), { author });
    assert.deepEqual([r.reason, r.code, r.check], ["MACHINE_CANNOT_STATE_SEEKS", "MACHINE_CANNOT_STATE_SEEKS", "C-32.21"], author || "unstamped");
    assert.equal(r.translation, grammar.RECORDS_LAW_FENCE_CHECKS.MACHINE_CANNOT_STATE_SEEKS.translation);
  }
  assert.equal(w.record.head(A), null);
  assert.equal(w.promote(A, md(A, rr(seeksLines(ok))), { author: BOB }).ok, true, "a member states it");
  /* a machine revision carrying seeks unchanged lands; changing or removing it is refused */
  assert.equal(w.promote(A, md(A, rr([...seeksLines(ok), 'note: "touched"'])), { author: "class:daemon" }).ok, true);
  assert.equal(w.promote(A, md(A, rr(seeksLines([{ progression: "budget", entity: E1, stage: "adopted" }]))),
    { author: "class:daemon" }).reason, "MACHINE_CANNOT_STATE_SEEKS");
  assert.equal(w.promote(A, md(A, rr()), { author: "class:daemon" }).reason, "MACHINE_CANNOT_STATE_SEEKS", "nor remove it");
  assert.deepEqual(grammar.seeksOf(w.fm(A)), ok, "every refused machine write left it as the member stated it");
  /* a replay is never asked (the record's own history is holdable verbatim) */
  assert.equal(w.promote(B, md(B, rr(seeksLines([{ progression: "zoning", entity: E1, stage: "x" }]))),
    { author: "class:daemon", extra: { replay: true } }).ok, true);
});

test("R71 at start actions registers once with intent.registerNoneExistsReader; noneExistsFor answers the records requests the viewer may see that seek that stage and hold a received none_exists decision, {action, ord, at}, oldest first, at most 50; writes nothing, never throws", () => {
  const registered = [];
  const intent = { registerNoneExistsReader: (fn) => (registered.push(fn), { ok: true }) };
  const w = world({ deps: { progressions: progressionsStandIn(), intent } });
  assert.equal(registered.length, 1, "registered once");
  const reader = registered[0];
  const seek = { progression: "meeting", entity: E1, stage: "minutes" };
  const ask = (viewer = ALICE, s = seek) => reader({ ...s, viewer });
  /* A seeks it, answered none exists twice; B seeks it and was denied; C seeks another stage, answered none exists;
     D sits in alice's hidden project, seeking it, answered none exists. Each request is sent first (ord 0). */
  const P = w.promotion.promote({ base: null, snapKey: "p1", author: ALICE, ownerMemberId: "alice",
    files: [{ path: "bundle.md", text: ["---", "object_type: project", "schema: project@1", 'title: "P"', "current_state: forming",
      "prior_state: null", 'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"', "references: []",
      "state_history: []", "---", "", "## Objective", "", "x", ""].join("\n") }], meta: { object_type: "project" } }).bundleId;
  const D = "ACTN-2026-0004-d";
  for (const [id, lines] of [[A, seeksLines([seek])], [B, seeksLines([seek])],
                             [C, seeksLines([{ ...seek, stage: "notice" }])], [D, [`project: ${P}`, ...seeksLines([seek])]]]) {
    assert.equal(w.promote(id, md(id, rr(lines))).ok, true, id);
    assert.equal(w.a.actionCorrespond({ target: id, direction: "sent", at: "2026-09-01", account: "asked", stage: "request",
      viewer: ALICE, author: ALICE }).ok, true, id);
  }
  const say = (id, at, outcome) => assert.equal(w.a.actionCorrespond({ target: id, direction: "received", at,
    account: "the clerk wrote back", stage: "denial", follows: "0", outcome, viewer: ALICE, author: ALICE }).ok, true, `${id} ${at}`);
  say(A, "2026-09-20", "none_exists");
  say(B, "2026-09-10", "denied");
  say(C, "2026-09-05", "none_exists");
  say(D, "2026-09-03", "none_exists");
  say(A, "2026-09-02", "none_exists");
  assert.deepEqual(ask(), [{ action: A, ord: 2, at: "2026-09-02" }, { action: D, ord: 1, at: "2026-09-03" },
                           { action: A, ord: 1, at: "2026-09-20" }], "oldest first; the denied one and another stage left out");
  /* negative controls: a viewer who may not see D; another stage; another entity; no viewer; a malformed ask */
  assert.deepEqual(ask(BOB), [{ action: A, ord: 2, at: "2026-09-02" }, { action: A, ord: 1, at: "2026-09-20" }]);
  assert.deepEqual(ask(ALICE, { ...seek, stage: "notice" }), [{ action: C, ord: 1, at: "2026-09-05" }]);
  assert.deepEqual(ask(ALICE, { ...seek, entity: E2 }), []);
  for (const v of [null, undefined, ""]) assert.deepEqual(reader({ ...seek, viewer: v }), []);
  for (const bad of [{}, { progression: "meeting" }, { ...seek, stage: 7 }]) assert.deepEqual(reader({ ...bad, viewer: ALICE }), []);
  assert.deepEqual(reader(), []);
  /* a records request that does not seek it, answered none exists, is not answered */
  const E = "ACTN-2026-0005-e";
  assert.equal(w.promote(E, md(E, rr())).ok, true);
  assert.equal(w.a.actionCorrespond({ target: E, direction: "sent", at: "2026-08-01", account: "asked", stage: "request",
    viewer: ALICE, author: ALICE }).ok, true);
  say(E, "2026-08-02", "none_exists");
  assert.equal(ask().length, 3);
  /* at most 50 */
  for (let i = 0; i < 52; i++) say(B, `2026-10-${String(1 + (i % 28)).padStart(2, "0")}`, "none_exists");
  const many = ask();
  assert.equal(many.length, 50);
  assert.deepEqual(many.slice(0, 3).map((x) => x.at), ["2026-09-02", "2026-09-03", "2026-09-20"]);
  /* writes nothing; a read that fails answers [] and never throws */
  const st = JSON.stringify(["bundles", "files", "manifest"].map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`)));
  ask(); ask(BOB);
  assert.equal(JSON.stringify(["bundles", "files", "manifest"].map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`))), st);
  w.st.db.exec(`ALTER TABLE files RENAME TO away`);
  assert.doesNotThrow(() => ask());
  assert.deepEqual(ask(), []);
  w.st.db.exec(`ALTER TABLE away RENAME TO files`);
});

test("R71 a host given no intent registers none and starts; a reader already held stands", () => {
  assert.doesNotThrow(() => world({ deps: { intent: null } }));
  const held = { registerNoneExistsReader: () => ({ ok: false, reason: "NONE_EXISTS_READER_DECLARED" }) };
  assert.doesNotThrow(() => world({ deps: { intent: held } }));
});

test("R73 actionSeeksPropose: refusals in R73's order; a target not a records_request, or seeks the grammar refuses, answered SEEKS_REFUSED (C-117.29) with every finding; nothing written", () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  const ok = [{ progression: "meeting", entity: E1, stage: "minutes" }];
  assert.equal(w.promote(A, md(A, rr())).ok, true);
  assert.equal(w.promote(B, md(B, ["action_kind: other"])).ok, true);
  assert.equal(w.promote(I3, ["---", `id: ${I3}`, "object_type: information", `title: ${I3}`, "current_state: collected",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n")).ok, true);
  const S = (x) => w.a.actionSeeksPropose({ target: A, seeks: ok, proposer: "class:daemon", viewer: "class:daemon", ...x });
  assert.deepEqual([S({ proposer: "", target: "", seeks: "nonsense" }), S({ target: "", seeks: "nonsense" }),
    S({ target: "ACTN-2026-0404-x", seeks: "nonsense" }), S({ viewer: "nobody", seeks: "nonsense" }),
    S({ target: I3, seeks: "nonsense" }), S({ target: B }), S({ seeks: "nonsense" })].map((r) => r.reason),
    ["NO_AUTHOR", "NO_TARGET", "NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "SEEKS_REFUSED", "SEEKS_REFUSED"]);
  const kind = S({ target: B });
  assert.deepEqual([kind.code, kind.check, kind.target], ["SEEKS_REFUSED", "C-117.29", B]);
  assert.match(kind.findings[0].detail, /only a records_request names the stages/);
  const notHeld = S({ seeks: [{ progression: "zoning", entity: E1, stage: "x" }, { progression: "meeting", entity: E1, stage: "vote" }] });
  assert.deepEqual([notHeld.reason, notHeld.findings.length], ["SEEKS_REFUSED", 2], "progressions read as R70 reads them");
  for (const seeks of [null, [], "[]", Array.from({ length: 13 }, (_, i) => ({ ...ok[0], entity: `ENT-2026-${1000 + i}-x` })), [ok[0], ok[0]]])
    assert.equal(S({ seeks }).reason, "SEEKS_REFUSED", JSON.stringify(seeks)?.slice(0, 60));
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_seeks_proposals`)[0].n, 0, "no refusal writes");
});

test("R73 any credential may propose; a proposal is stored apart and labelled, replaces only its proposer's own, never changes seeks or writes a file; R25 lists the proposals beside seeks", () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  const stated = [{ progression: "budget", entity: E2, stage: "adopted" }];
  assert.equal(w.promote(A, md(A, rr(seeksLines(stated)))).ok, true);
  const text = w.text(A), manifest = JSON.stringify(w.rows(`SELECT * FROM manifest ORDER BY rowid`));
  const one = [{ progression: "meeting", entity: E1, stage: "minutes" }];
  const m = w.a.actionSeeksPropose({ target: A, seeks: one, proposer: "class:daemon", viewer: "class:daemon" });
  assert.deepEqual([m.ok, m.evidence, m.proposal.state, m.proposal.machine_work, m.proposal.seeks, m.seeks],
    [true, false, "machine_proposed", true, one, stated]);
  assert.match(m.proposal.says, /machine work/);
  assert.match(m.says, /not the action's seeks and did not change it/);
  /* a member's proposal, given as JSON (the op's body or query), stands beside the machine's */
  const two = [{ progression: "meeting", entity: E1, stage: "notice" }, { progression: "budget", entity: E1, stage: "adopted" }];
  w.clock.ms += 60000;
  const b = actions.actionsOps(w.a, new URL(`https://x/?target=${A}&viewer=${BOB}&proposer=${BOB}`), { seeks: JSON.stringify(two) })
    .actionseekspropose();
  assert.deepEqual([b.ok, b.proposal.state, b.proposal.seeks], [true, "member_proposed", two]);
  /* the machine restates: its own replaced, the member's kept */
  w.clock.ms += 60000;
  const again = [{ progression: "meeting", entity: E2, stage: "notice" }];
  assert.equal(w.a.actionSeeksPropose({ target: A, seeks: again, proposer: "class:daemon", viewer: "class:daemon" }).ok, true);
  const read = w.a.actionRead({ id: A, viewer: ALICE });
  assert.deepEqual(read.seeks, stated, "seeks as a member stated it");
  assert.deepEqual(read.seeks_proposals.proposals.map((p) => [p.by, p.state, p.seeks]),
    [["class:daemon", "machine_proposed", again], [BOB, "member_proposed", two]], "newest first, each proposer once");
  assert.deepEqual([read.seeks_proposals.limit, read.seeks_proposals.truncated], [12, false]);
  /* negative control: nothing in the record moved; a proposal never states seeks */
  assert.equal(w.text(A), text, "no file written");
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM manifest ORDER BY rowid`)), manifest);
  assert.deepEqual(grammar.seeksOf(w.fm(A)), stated);
  /* an action with none answers an empty list and a sentence */
  assert.equal(w.promote(B, md(B, rr())).ok, true);
  const none = w.a.actionRead({ id: B, viewer: ALICE });
  assert.deepEqual([none.seeks, none.seeks_proposals.proposals], [[], []]);
  assert.match(none.seeks_proposals.says, /no proposal of what this request seeks/);
  /* the proposals purge with the action (R36) */
  w.record.purge({ bundleId: A });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_seeks_proposals WHERE bundle_id=?`, A)[0].n, 0);
});
