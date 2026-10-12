/* action-holds R2, R5–R9 at their interface (moved from `actions` R52, R56–R60, T20's and T27's entries: N518, DEC-113's
   server side, K1252, K1253, K1262; T45, K2781 (1)), with R2's T45 places (Actions D10): R2's projects and its own release
   act's refusal, R5 `actionHoldRelease`, R6 `holdReleasePreview`, R7 `projectHolds`, R8 `holdsReleased`, R9 `purgeHeld`,
   and R13's hold tables, over real projects whose sight membership answers (its R44, R77, R78). `HOLD_NO_LEGAL_MARK`
   (C-117.22) is retired with R2's old text: where the moved tests asserted it, the entry place's own rule stands. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, received } from "./fixture.mjs";
import * as holds from "../../../src/action-holds/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", I = "INFO-2026-0001-d";
const ALICE = V("alice"), BOB = V("bob"), CAROL = V("carol");
const ABSENT = "PROJ-2026-0404-absent";

/* Projects, by owner and setting: P1 alice's (hidden), P2 alice's (discoverable), P3 carol's (hidden), P4 carol's
   (discoverable). Bob is in none: he sees P2 and P4 at EXISTENCE only, P1 and P3 not at all; alice does not see P3 and
   sees P4 at EXISTENCE. A sits in P1 with two `legal` marks; B in no project with two; C in P3 with one; I is a document
   in P1 and J a document in P2. */
function ground() {
  const w = world();
  const P1 = w.project("alice"), P2 = w.project("alice", "discoverable"), P3 = w.project("carol"), P4 = w.project("carol", "discoverable");
  w.action(A, [`project: ${P1}`, ...received(2)]);
  w.action(B, received(2));
  w.action(C, [`project: ${P3}`, ...received(1)], { author: CAROL });
  w.docIn(I, P1);
  w.docIn("INFO-2026-0002-j", P2);
  for (const [id, ord, who] of [[A, 0, ALICE], [A, 1, ALICE], [B, 0, ALICE], [B, 1, ALICE], [C, 0, CAROL]])
    w.mark(id, ord, "legal", who);
  const hold = (target, ord, who, extra = {}) =>
    w.h.actionHold({ target, ord, hold: "in_place", reason: "preserving", viewer: who, author: who, ...extra });
  const release = (target, ord, who, extra = {}) =>
    w.h.actionHoldRelease({ target, ord, reason: "the matter closed", viewer: who, author: who, ...extra });
  return { w, P1, P2, P3, P4, hold, release };
}
const sorted = (xs) => [...xs].sort();
/* Everything the holds could write. */
const state = (w) => JSON.stringify(["action_holds", "action_hold_projects", "action_pressure", "hold_notices",
  "pressure_records", "manifest", "bundles"].map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`)));
/* A catalogue-backed refusal carries this module's row (C-149), minted at the region the row's `where` names. */
function row(r, code, check, region) {
  const rows = holds.ACTION_HOLDS_CHECKS;
  assert.ok(rows[code], `${code}: action-holds holds its row`);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, check, rows[code].translation], code);
  assert.equal(rows[code].where, `src/action-holds/index.mjs ${region}`, code);
}

test("R2 actionHold: refusals in R2's order, each with its row (C-149.1-.4, .8) and a negative control; nothing written", () => {
  const { w, P1, P3, P4, hold } = ground();
  const H = (x) => hold(A, 0, ALICE, x);
  /* each refusal, given everything after it wrong as well, so the order is the one R2 states */
  const worse = { target: "", hold: "kept", reason: "", projects: "nonsense" };
  assert.deepEqual([H({ author: MACHINE, ...worse }), H({ author: "", ...worse }), H({ ...worse }),
    H({ ...worse, target: A, project: P1 }), H({ ...worse, target: A, hold: "released" }),
    H({ hold: "kept", projects: "nonsense", target: "ACTN-2026-0404-x" }), H({ projects: "nonsense", target: "ACTN-2026-0404-x" }),
    H({ target: "ACTN-2026-0404-x", ord: 9, projects: [P3] }), H({ target: I, ord: 9, projects: [P3] }),
    H({ ord: 9, projects: [P3] }), H({ projects: [P4, P3] }), H({ projects: [P3, P4] })].map((r) => r.reason),
    ["MACHINE_CANNOT_SET_HOLD", "MACHINE_CANNOT_SET_HOLD", "NO_TARGET", "HOLD_PLACE_REFUSED", "HOLD_RELEASE_IS_ITS_OWN_ACT",
     "HOLD_REFUSED", "HOLD_PROJECTS_REFUSED", "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "HOLD_PLACE_REFUSED",
     "PROJECT_SEEN_NOT_A_PARTICIPANT", "NO_SUCH_PROJECT"]);
  row(H({ author: MACHINE }), "MACHINE_CANNOT_SET_HOLD", "C-149.1", "actionHold > is-hold");
  row(H({ hold: "kept" }), "HOLD_REFUSED", "C-149.2", "actionHold > is-hold");
  row(H({ hold: "released" }), "HOLD_RELEASE_IS_ITS_OWN_ACT", "C-149.3", "actionHold > is-hold-release-own-act");
  row(H({ projects: "nonsense" }), "HOLD_PROJECTS_REFUSED", "C-149.4", "#holdProjects > is-hold-projects");
  row(H({ ord: 9 }), "HOLD_PLACE_REFUSED", "C-149.8", "#placeOf > is-hold-place");
  assert.equal(holds.ACTION_HOLDS_CHECKS.HOLD_NO_LEGAL_MARK, undefined, "C-117.22 is retired, with no row here");
  /* HOLD_REFUSED: every arm of the hold and of the reason (1 to 500 characters, no quote, backslash or line break) */
  for (const x of [{ hold: "kept" }, { hold: "" }, { hold: null }, { hold: "IN_PLACE" }, { reason: "" }, { reason: "   " },
                   { reason: null }, { reason: "x".repeat(501) }, { reason: 'a"b' }, { reason: "a\\b" }, { reason: "a\nb" },
                   { reason: "a\rb" }])
    assert.equal(H(x).reason, "HOLD_REFUSED", JSON.stringify(x));
  /* HOLD_PLACE_REFUSED: no entry at the position, a position that is no whole number, two places (was HOLD_NO_LEGAL_MARK) */
  for (const ord of [9, 2, "one", -1, 0.5]) assert.equal(H({ ord }).reason, "HOLD_PLACE_REFUSED", String(ord));
  /* HOLD_PROJECTS_REFUSED: every arm (not a list, not a project's id, over 50 distinct) */
  const fifty = Array.from({ length: 50 }, (_, i) => `PROJ-2026-${String(1000 + i)}-x`);
  for (const projects of [{}, 7, true, [7], [null], [I], ["PROJ-2026-1-x"], ["proj-2026-0001-x"], "[not json", `["${I}"]`,
                          [...fifty, "PROJ-2026-1050-x"]])
    assert.equal(H({ projects }).reason, "HOLD_PROJECTS_REFUSED", JSON.stringify(projects));
  /* 50 distinct, a repeat counted once, as a list, its JSON or comma-separated: past the list's own rule */
  for (const projects of [fifty, [...fifty, fifty[0]], JSON.stringify(fifty), fifty.join(",")])
    assert.equal(H({ projects }).reason, "NO_SUCH_PROJECT", "a well-formed list reaches the projects' sight");
  /* the first named project not one the author may name answers as membership does: existence (C-70.1), else absent (R78) */
  const seen = H({ projects: [P1, P4] }), hidden = H({ projects: [P1, P3] }), absent = H({ projects: [ABSENT] });
  assert.deepEqual([seen.reason, seen.check, seen.project], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", P4]);
  assert.deepEqual([hidden.reason, hidden.project, hidden.detail], ["NO_SUCH_PROJECT", P3, absent.detail]);
  assert.deepEqual(Object.keys(hidden), Object.keys(absent), "a hidden project is answered as an absent one");
  /* absent and invisible alike */
  const inv = H({ viewer: "nobody" }), gone = H({ target: "ACTN-2026-0404-x" });
  assert.deepEqual([inv.reason, Object.keys(inv)], [gone.reason, Object.keys(gone)]);
  assert.equal(inv.reason, "NO_SUCH_BUNDLE");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_holds`)[0].n, 0, "no refusal writes a statement");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_hold_projects`)[0].n, 0);
  /* negative controls: a member's statement on the mark lands, at 500 characters too; and (T45) on an entry with no
     mark, which HOLD_NO_LEGAL_MARK refused before */
  assert.equal(H({ reason: "x".repeat(500), ord: "0" }).ok, true);
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-04", account: "asked", viewer: ALICE, author: ALICE });
  assert.equal(H({ ord: 2 }).ok, true, "an unmarked entry, even a sent one, takes a hold");
  assert.equal(w.h.actionHoldRelease({ target: A, ord: 0, reason: "settled", viewer: ALICE, author: ALICE }).ok, true);
});

test("R2 in_place then released: both statements kept, the latest stands; pressureFor shows a legal mark's holds oldest first; the op and the purge", () => {
  const w = world();
  w.action(A, received(2));
  w.mark(A, 0, "legal");
  w.mark(A, 1, "discrediting");
  const read = () => w.h.pressureFor({ action: A, viewer: ALICE }).items;
  const before = read();
  assert.deepEqual([before[0].holds, before[0].hold], [[], null], "null while none is stated");
  assert.ok(!("hold" in before[1]) && !("holds" in before[1]), "a mark of another kind carries no hold");
  const text = w.text(A);
  const one = w.h.actionHold({ target: A, ord: 0, hold: "in_place", reason: "preserving the emails", viewer: ALICE, author: ALICE });
  assert.deepEqual(one, { ok: true, target: A, ord: 0, hold: "in_place", reason: "preserving the emails", by: ALICE,
                          at: "2026-09-28T12:00:00Z", projects: [] });
  w.clock.ms += 60000;
  const two = w.h.actionHoldRelease({ target: A, ord: 0, reason: "the claim was withdrawn", viewer: ALICE, author: BOB });
  assert.deepEqual([two.ok, two.hold, two.by, two.at], [true, "released", BOB, "2026-09-28T12:01:00Z"]);
  assert.equal(w.text(A), text, "the action's document is never rewritten");
  const p = read()[0];
  assert.deepEqual(p.holds, [
    { seq: 1, hold: "in_place", reason: "preserving the emails", by: ALICE, at: "2026-09-28T12:00:00Z", projects: [] },
    { seq: 2, hold: "released", reason: "the claim was withdrawn", by: BOB, at: "2026-09-28T12:01:00Z", restarted: [] }]);
  assert.equal(p.hold, "released", "the latest statement is the hold");
  assert.deepEqual(w.h.holdsOf({ target: A, ord: 0, viewer: ALICE }), { ok: true, target: A, ord: 0, holds: p.holds,
    hold: "released", notices: [] }, "holdsOf answers the place's statements as the read does");
  /* stated again: appended, the earlier ones untouched */
  w.h.actionHold({ target: A, ord: 0, hold: "in_place", reason: "a new demand arrived", viewer: ALICE, author: ALICE });
  const again = read()[0];
  assert.deepEqual([again.holds.length, again.hold, again.holds[0], again.holds[1]], [3, "in_place", p.holds[0], p.holds[1]]);
  /* the op, with the stamps the control plane makes; and the statements purge with the action */
  const rows = () => w.rows(`SELECT COUNT(*) AS n FROM action_holds WHERE bundle_id=?`, A)[0].n;
  const url = new URL(`https://x/?target=${A}&ord=0&reason=done&viewer=${ALICE}&author=${ALICE}`);
  assert.deepEqual([holds.actionHoldsOps(w.h, url, null).actionholdrelease().ok, rows()], [true, 4]);
  const viaBody = holds.actionHoldsOps(w.h, new URL(`https://x/?viewer=${ALICE}&author=${MACHINE}`),
    { target: A, ord: 0, hold: "in_place", reason: "x" }).actionhold();
  assert.equal(viaBody.reason, "MACHINE_CANNOT_SET_HOLD", "the author is the stamp, never the body's");
  w.record.purge({ bundleId: A });
  assert.equal(rows(), 0);
});

test("R2 R13 a hold records the place's own project and those named; it covers every in_place statement's since its last release; answers and reads show only what the viewer may name", () => {
  const { w, P1, P2, hold, release } = ground();
  /* the action's own project, filled in here and never taken from the caller, with a named one */
  const one = hold(A, 0, ALICE, { projects: [P2, P2] });
  assert.deepEqual(one, { ok: true, target: A, ord: 0, hold: "in_place", reason: "preserving", by: ALICE,
                          at: "2026-09-28T12:00:00Z", projects: sorted([P1, P2]) });
  /* an action in no project naming none covers none */
  assert.deepEqual(hold(B, 0, ALICE).projects, []);
  /* a further statement adds its projects; the answer is what the author may name */
  assert.deepEqual(hold(B, 0, ALICE, { projects: [P1] }).projects, [P1]);
  assert.deepEqual(hold(B, 0, BOB).projects, [], "bob sees B but not P1, which the hold still covers");
  assert.equal(w.h.projectHolds({ projects: [P1], viewer: ALICE }).projects[0].held, true);
  /* the read: each statement with those of its projects the viewer may name, oldest first; a released one's restarted */
  const read = (viewer) => w.h.holdsOf({ target: B, ord: 0, viewer });
  assert.deepEqual(read(ALICE).holds.map((h) => [h.seq, h.hold, h.by, h.projects]),
    [[1, "in_place", ALICE, []], [2, "in_place", ALICE, [P1]], [3, "in_place", BOB, []]]);
  assert.deepEqual(read(BOB).holds.map((h) => h.projects), [[], [], []], "bob may name none of B's projects");
  assert.equal(read(null).reason, "NO_SUCH_BUNDLE", "no viewer sees nothing");
  /* a project leaves a hold only when the hold is released; a new in_place after the release starts afresh. A0 is
     released first, so B0's release restarts P1. */
  assert.deepEqual(release(A, 0, ALICE).restarted, [P2], "P1 is still covered by B0");
  release(B, 0, ALICE);
  assert.deepEqual(read(ALICE).holds.slice(-1).map((h) => [h.hold, h.restarted, "projects" in h]), [["released", [P1], false]]);
  assert.deepEqual(hold(B, 0, ALICE).projects, [], "P1 left with the release");
  /* R13: the statements and their projects purge with the action */
  assert.ok(w.rows(`SELECT COUNT(*) AS n FROM action_hold_projects WHERE bundle_id=?`, B)[0].n > 0);
  release(B, 0, ALICE);
  w.record.purge({ bundleId: B });
  for (const t of ["action_holds", "action_hold_projects"])
    assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ${t} WHERE bundle_id=?`, B)[0].n, 0, t);
  assert.ok(holds.ACTION_HOLDS_TABLES.includes("action_hold_projects"));
});

test("R5 actionHoldRelease: refusals in R5's order (C-149.5), a release of a hold in place, and restarted recorded whatever the author sees", () => {
  const { w, P1, P2, hold, release } = ground();
  const R = (x) => release(A, 0, ALICE, x);
  assert.deepEqual([R({ author: MACHINE, target: "", reason: "" }), R({ author: "", target: "", reason: "" }),
    R({ target: "", reason: "" }), R({ reason: 'a"b', target: "ACTN-2026-0404-x" }), R({ target: "ACTN-2026-0404-x", ord: 9 }),
    R({ target: I, ord: 9 }), R({ ord: 9 })].map((r) => r.reason),
    ["MACHINE_CANNOT_SET_HOLD", "MACHINE_CANNOT_SET_HOLD", "NO_TARGET", "HOLD_REFUSED", "NO_SUCH_BUNDLE", "NOT_AN_ACTION",
     "HOLD_PLACE_REFUSED"]);
  for (const reason of ["", "  ", null, "x".repeat(501), "a\\b", "a\nb"]) assert.equal(R({ reason }).reason, "HOLD_REFUSED");
  assert.equal(R({ viewer: "nobody" }).reason, "NO_SUCH_BUNDLE", "invisible as absent");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_holds`)[0].n, 0, "no refusal writes");
  /* (T46, R14) an entry with no hold stated is no longer released (HOLD_NOT_IN_PLACE, R14's own test); a hold in place
     is, its restarts recorded; then it is already released */
  assert.equal(release(A, 1, ALICE).reason, "HOLD_NOT_IN_PLACE");
  hold(A, 1, ALICE);
  const first = release(A, 1, ALICE);
  assert.deepEqual(first, { ok: true, target: A, ord: 1, hold: "released", reason: "the matter closed", by: ALICE,
                            at: "2026-09-28T12:00:00Z", restarted: [P1] });
  row(release(A, 1, ALICE), "HOLD_ALREADY_RELEASED", "C-149.5", "actionHold > is-hold-already-released");
  /* A0 covers P1 and P2; B0 (alice's, naming P1) covers P1: releasing A0 restarts P2 alone */
  hold(A, 0, ALICE, { projects: [P2] });
  hold(B, 0, ALICE, { projects: [P1] });
  w.clock.ms += 60000;
  const a0 = R();
  assert.deepEqual([a0.ok, a0.restarted, a0.at], [true, [P2], "2026-09-28T12:01:00Z"]);
  assert.deepEqual(w.rows(`SELECT project FROM action_hold_projects WHERE bundle_id=? AND ord=0 AND seq=2`, A).map((r) => r.project), [P2]);
  /* bob, who sees B and not P1, releases B0: P1 is recorded as restarted, and his answer shows none of it */
  const b0 = release(B, 0, BOB);
  assert.deepEqual([b0.ok, b0.restarted], [true, []]);
  assert.deepEqual(w.rows(`SELECT project FROM action_hold_projects WHERE bundle_id=? AND seq=2`, B).map((r) => r.project), [P1]);
  assert.deepEqual(w.h.holdsReleased({ viewer: ALICE }).items.find((x) => x.action === B).restarted, [P1]);
  /* the op, with the control plane's stamps; the author is the stamp, never the body's */
  hold(A, 0, ALICE);
  const op = (q, body) => holds.actionHoldsOps(w.h, new URL(`https://x/?${q}`), body).actionholdrelease();
  assert.equal(op(`viewer=${ALICE}&author=${MACHINE}`, { target: A, ord: 0, reason: "x", author: ALICE }).reason, "MACHINE_CANNOT_SET_HOLD");
  assert.deepEqual(op(`target=${A}&ord=0&reason=done&viewer=${ALICE}&author=${ALICE}`, null).restarted, [P1]);
});

test("R6 holdReleasePreview: refusals in R6's order; restarts what no other hold covers, the viewer's share with out_of_view; equals what the release records; writes nothing", () => {
  const { w, P1, P2, hold } = ground();
  const P = (x) => w.h.holdReleasePreview({ target: A, ord: 0, viewer: ALICE, ...x });
  assert.deepEqual([P({ target: "" }), P({ target: "ACTN-2026-0404-x", ord: 9 }), P({ target: I, ord: 9 }), P({ ord: 9 }),
    P({ viewer: "nobody" })].map((r) => r.reason), ["NO_TARGET", "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "HOLD_PLACE_REFUSED",
    "NO_SUCH_BUNDLE"]);
  assert.equal(P({ ord: 9 }).check, "C-149.8");
  assert.deepEqual(P(), { ok: true, target: A, ord: 0, hold: null, restarts: [], out_of_view: false }, "none stated");
  hold(A, 0, ALICE, { projects: [P2] });
  hold(B, 0, ALICE, { projects: [P1] });
  assert.deepEqual([P().hold, P().restarts, P().out_of_view], ["in_place", [P2], false], "P1 stays held by B0");
  assert.deepEqual(w.h.holdReleasePreview({ target: B, ord: 0, viewer: ALICE }).restarts, [], "A0 holds P1 too");
  assert.equal(w.h.actionHoldRelease({ target: A, ord: 0, reason: "done", viewer: ALICE, author: ALICE }).ok, true);
  /* now B0 restarts P1, which bob may not see: he is told only that something is out of view, with no id or count */
  const bobs = w.h.holdReleasePreview({ target: B, ord: 0, viewer: BOB });
  assert.deepEqual(bobs, { ok: true, target: B, ord: 0, hold: "in_place", restarts: [], out_of_view: true });
  assert.deepEqual(w.h.holdReleasePreview({ target: B, ord: 0, viewer: ALICE }).restarts, [P1]);
  /* any credential may preview; it writes nothing */
  const before = state(w);
  assert.deepEqual(w.h.holdReleasePreview({ target: B, ord: 0, viewer: MACHINE }).restarts, [P1]);
  P(); P({ ord: 9 });
  assert.equal(state(w), before);
  /* what the preview said is what the release records; after it, not in place, nothing restarts */
  const said = w.h.holdReleasePreview({ target: B, ord: 0, viewer: ALICE }).restarts;
  assert.deepEqual(w.h.actionHoldRelease({ target: B, ord: 0, reason: "done", viewer: ALICE, author: ALICE }).restarted, said);
  assert.deepEqual(w.h.holdReleasePreview({ target: B, ord: 0, viewer: ALICE }), { ok: true, target: B, ord: 0,
    hold: "released", restarts: [], out_of_view: false });
  /* the op: A0 held again records its own project alone (P2 left with its release) */
  hold(A, 0, ALICE);
  const op = holds.actionHoldsOps(w.h, new URL(`https://x/?target=${A}&ord=0&viewer=${ALICE}`), null).actionholdpreview();
  assert.deepEqual([op.hold, op.restarts], ["in_place", [P1]]);
});

test("R7 projectHolds: 1 to 50 distinct project ids (C-149.4); held with since and recorded_by, false, or null when absent or not one the viewer may name; never false on a failed read; writes nothing", () => {
  const { w, P1, P2, P3, P4, hold, release } = ground();
  const Q = (projects, viewer = ALICE) => w.h.projectHolds({ projects, viewer });
  const fifty = Array.from({ length: 50 }, (_, i) => `PROJ-2026-${String(1000 + i)}-x`);
  for (const projects of [null, undefined, "", [], {}, [7], [I], [P1, P1], [...fifty, "PROJ-2026-1050-x"], "[bad"])
    assert.equal(Q(projects).reason, "HOLD_PROJECTS_REFUSED", JSON.stringify(projects) ?? "undefined");
  assert.equal(Q([]).check, "C-149.4");
  assert.equal(Q(fifty).projects.length, 50, "50 distinct are read");
  const all = [P1, P2, P3, P4, ABSENT];
  assert.deepEqual(Q(all).projects.map((p) => p.held), [false, false, null, null, null], "no hold: false where seen at FULL");
  /* held: the earliest statement still in place that records the project */
  hold(A, 0, ALICE, { projects: [P2] });
  w.clock.ms += 60000;
  hold(B, 0, BOB);
  hold(B, 0, ALICE, { projects: [P1] });
  hold(C, 0, CAROL, { projects: [P4] });
  const r = Q(all);
  assert.deepEqual(r, { ok: true, projects: [
    { project: P1, held: true, since: "2026-09-28T12:00:00Z", recorded_by: ALICE },
    { project: P2, held: true, since: "2026-09-28T12:00:00Z", recorded_by: ALICE },
    { project: P3, held: null }, { project: P4, held: null }, { project: ABSENT, held: null }] });
  assert.ok(!JSON.stringify(r).includes(A) && !JSON.stringify(r).includes("preserving"), "names no action or reason");
  /* bob sees P2 and P4 at existence only: null, exactly as for absent; carol sees hers */
  assert.deepEqual(Q(all, BOB).projects.map((p) => p.held), [null, null, null, null, null]);
  assert.deepEqual(Q([P3, P4], CAROL).projects.map((p) => [p.held, p.recorded_by ?? null]), [[true, CAROL], [true, CAROL]]);
  /* after A0's release P1 is held by B0 alone, since its own statement; P2 is no longer held */
  release(A, 0, ALICE);
  assert.deepEqual(Q([P1, P2]).projects, [{ project: P1, held: true, since: "2026-09-28T12:01:00Z", recorded_by: ALICE },
                                         { project: P2, held: false }]);
  /* a read it cannot complete refuses, never false; it writes nothing */
  const before = state(w);
  Q(all); Q(all, BOB);
  assert.equal(state(w), before);
  w.st.db.exec(`ALTER TABLE action_hold_projects RENAME TO away`);
  assert.deepEqual([Q([P2]).ok, Q([P2]).reason], [false, "HOLDS_UNREADABLE"]);
  w.st.db.exec(`ALTER TABLE away RENAME TO action_hold_projects`);
  /* the op, as a list in the body or ids in the query */
  const op = (q, body) => holds.actionHoldsOps(w.h, new URL(`https://x/?${q}`), body).projectholds();
  assert.deepEqual(op(`viewer=${ALICE}`, { projects: [P1] }).projects[0].held, true);
  assert.deepEqual(op(`projects=${P1},${P2}&viewer=${ALICE}`, null).projects.map((p) => p.held), [true, false]);
});

test("R8 holdsReleased: each release that ended a hold in place, with its placers and the restarted the viewer may name; never an invisible action; pages with cursor", () => {
  const { w, P1, P2, hold, release } = ground();
  assert.equal(release(B, 1, ALICE).reason, "HOLD_NOT_IN_PLACE");   /* (T46, R14) ends no hold: refused, never listed */
  hold(B, 0, ALICE, { projects: [P1] });
  hold(B, 0, BOB);
  hold(B, 0, ALICE);
  hold(A, 0, ALICE, { projects: [P2] });
  w.clock.ms += 60000;
  release(B, 0, BOB);
  release(A, 0, ALICE);
  hold(B, 0, CAROL);                        /* a new hold after the release: its placers are its own */
  release(B, 0, ALICE);
  const r = w.h.holdsReleased({ viewer: ALICE });
  assert.deepEqual(r, { ok: true, limit: 500, truncated: false, cursor: null, items: [
    { action: A, ord: 0, seq: 2, released_by: ALICE, released_at: "2026-09-28T12:01:00Z", reason: "the matter closed",
      placers: [ALICE], restarted: sorted([P1, P2]) },
    { action: B, ord: 0, seq: 4, released_by: BOB, released_at: "2026-09-28T12:01:00Z", reason: "the matter closed",
      placers: [ALICE, BOB], restarted: [] },
    { action: B, ord: 0, seq: 6, released_by: ALICE, released_at: "2026-09-28T12:01:00Z", reason: "the matter closed",
      placers: [CAROL], restarted: [] }] });
  /* B0's first release restarted nothing: A0 still held P1 then */
  /* bob sees B and none of the projects; nobody sees nothing */
  assert.deepEqual(w.h.holdsReleased({ viewer: BOB }).items.map((x) => [x.action, x.seq, x.restarted]), [[B, 4, []], [B, 6, []]]);
  assert.deepEqual(w.h.holdsReleased({ viewer: "nobody" }).items, []);
  /* paging: limit, cursor, after a cursor or an action id */
  const p1 = w.h.holdsReleased({ viewer: ALICE, limit: 2 });
  assert.deepEqual([p1.items.length, p1.truncated, p1.cursor], [2, true, `${B}#0#4`]);
  assert.deepEqual(w.h.holdsReleased({ viewer: ALICE, after: p1.cursor }).items.map((x) => x.seq), [6]);
  assert.deepEqual(w.h.holdsReleased({ viewer: ALICE, after: A }).items.map((x) => x.action), [B, B]);
  /* writes nothing */
  const before = state(w);
  w.h.holdsReleased({ viewer: ALICE });
  assert.equal(state(w), before);
});

test("R8 holdsReleased pages at 500 in (action, position, sequence) order; paging through each cursor reaches every release", () => {
  const w = world();
  for (const [id, n] of [[A, 300], [B, 201]]) {
    w.action(id, received(n));
    for (let ord = 0; ord < n; ord++) {
      const as = { viewer: ALICE, author: ALICE };
      assert.equal(w.h.actionPressure({ target: id, ord, pressure: { kind: "legal", note: "l" }, ...as }).ok, true);
      assert.equal(w.h.actionHold({ target: id, ord, hold: "in_place", reason: "r", ...as }).ok, true);
      assert.equal(w.h.actionHoldRelease({ target: id, ord, reason: "r", ...as }).ok, true);
    }
  }
  const p1 = w.h.holdsReleased({ viewer: ALICE, limit: 9999 });
  assert.deepEqual([p1.items.length, p1.limit, p1.truncated, p1.cursor], [500, 500, true, `${B}#199#2`]);
  assert.deepEqual([p1.items[0].action, p1.items[299].ord, p1.items[300].action, p1.items[300].ord], [A, 299, B, 0]);
  const p2 = w.h.holdsReleased({ viewer: ALICE, after: p1.cursor });
  assert.deepEqual([p2.items.length, p2.truncated, p2.cursor, p2.items[0].action, p2.items[0].ord], [1, false, null, B, 200]);
  assert.equal(new Set([...p1.items, ...p2.items].map((x) => `${x.action}#${x.ord}`)).size, 501, "every release, once");
});

test("R9 purgeHeld: false with no hold in place; the whole store, a held project, its material, an action carrying a hold and an undeterminable bundle while one stands; true when unreadable; never throws or writes", () => {
  const { w, P1, P2, P3, hold, release } = ground();
  const asked = [undefined, null, "", "  ", P1, P2, P3, A, B, C, I, "INFO-2026-0002-j", "INFO-2026-0404-x", 7, {}];
  const ask = (id) => w.h.purgeHeld(id === undefined ? {} : { bundleId: id });
  assert.deepEqual(asked.map(ask), asked.map(() => false), "no hold in place: nothing is held, an unknown id included");
  assert.equal(w.h.purgeHeld(), false);
  /* B0 in place, naming P1: B (an action carrying it), P1, A and I (in P1) and anything undeterminable are held */
  hold(B, 0, ALICE, { projects: [P1] });
  const held = Object.fromEntries(asked.map((id) => [String(id), ask(id)]));
  assert.deepEqual(held, { undefined: true, null: true, "": true, "  ": true, [P1]: true, [P2]: false, [P3]: false,
    [A]: true, [B]: true, [C]: false, [I]: true, "INFO-2026-0002-j": false, "INFO-2026-0404-x": true, 7: true,
    "[object Object]": true });
  /* the whole-store answer is R4's reader's */
  assert.equal(w.h.purgeHeld(), w.h.holdInPlace());
  /* a hold on an action in no project naming none still holds the action itself and the whole store */
  release(B, 0, ALICE);
  assert.equal(ask(B), false);
  hold(B, 1, ALICE);
  assert.deepEqual([ask(""), ask(B), ask(P1), ask(I), ask(A)], [true, true, false, false, false]);
  /* A carries a hold: A itself and its project's material */
  hold(A, 0, ALICE);
  assert.deepEqual([ask(A), ask(P1), ask(I), ask(P2)], [true, true, true, false]);
  release(B, 1, ALICE); release(A, 0, ALICE);
  assert.deepEqual(asked.map(ask), asked.map(() => false), "every hold released: nothing is held");
  /* (T45) a whole-action place and a project place hold as an entry's does */
  assert.equal(w.h.actionHold({ target: B, hold: "in_place", reason: "r", viewer: ALICE, author: ALICE }).ok, true);
  assert.deepEqual([ask(B), ask(P1), ask("")], [true, false, true]);
  assert.equal(w.h.actionHoldRelease({ target: B, reason: "r", viewer: ALICE, author: ALICE }).ok, true);
  assert.equal(w.h.actionHold({ project: P2, hold: "in_place", reason: "r", viewer: ALICE, author: ALICE }).ok, true);
  assert.deepEqual([ask(P2), ask("INFO-2026-0002-j"), ask(P1), ask(B)], [true, true, false, false]);
  assert.equal(w.h.actionHoldRelease({ project: P2, reason: "r", viewer: ALICE, author: ALICE }).ok, true);
  /* unreadable holds: true, without throwing; nothing written */
  hold(C, 0, CAROL);
  const before = state(w);
  asked.forEach(ask);
  assert.equal(state(w), before);
  w.st.db.exec(`ALTER TABLE action_holds RENAME TO away`);
  assert.doesNotThrow(() => ask(P2));
  assert.deepEqual([ask(P2), ask(""), w.h.purgeHeld()], [true, true, true]);
  w.st.db.exec(`ALTER TABLE away RENAME TO action_holds`);
  /* a record whose bundleInfo cannot be read answers true */
  const info = w.record.bundleInfo;
  w.record.bundleInfo = () => { throw new Error("unreadable"); };
  try { assert.equal(ask(P2), true); } finally { w.record.bundleInfo = info; }
  assert.equal(ask(P2), false);
});
