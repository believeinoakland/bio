/* The reads over the projected basis: the legs and who rests on a target (R4), the live legs (R5), the one cycle walk
   (R6), the projects drawing on a question (R7), and a leg on an imported finding at the earned read (R3). Copied from
   inquiry's `reads`, `dispose`, `imported-legs` and `promotion` tests at the split (K617), unchanged in what they hold;
   the legs are written by R12's one write as inquiry's projection writes them. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd } from "./fixture.mjs";
import { PROJECTS_DRAWING_MAX, legEarningOps } from "../../../src/leg-earning/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";

test("R4 basisFor answers the projected legs in order; restingOn every leg naming the target, confirmed or severed by the citer's record", () => {
  const w = world(); w.doc(A); w.doc(B);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: B }, { target: A, role: "cuts_against" }] });
  w.inquiry("INQ-2026-0002-r", { legs: [{ target: A }], refs: [{ target: A, rel: "cites", status: "severed" }] });
  assert.equal(w.k.basisFor(null).reason, "NO_ID");
  assert.deepEqual(w.k.basisFor("INQ-2026-0001-q").legs.map((l) => [l.ord, l.target_id, l.role]), [[0, B, "supports"], [1, A, "cuts_against"]]);
  assert.equal(w.k.restingOn(null).reason, "NO_ID");
  assert.deepEqual(w.k.restingOn(A).dependents.map((d) => [d.bundle_id, d.ord, d.status]),
    [["INQ-2026-0001-q", 1, "confirmed"], ["INQ-2026-0002-r", 0, "severed"]]);
});

test("R4 basisFor with a limit reads at most that many legs in SQL, the first by ord, and says it was cut", () => {
  const w = world(); w.doc(A);
  w.inquiry("INQ-2026-0001-q", { legs: Array.from({ length: 5 }, () => ({ target: A })) });
  const cut = w.k.basisFor("INQ-2026-0001-q", { limit: 3 });
  assert.deepEqual([cut.legs.map((l) => l.ord), cut.limit, cut.truncated], [[0, 1, 2], 3, true]);
  const whole = w.k.basisFor("INQ-2026-0001-q", { limit: 5 });
  assert.deepEqual([whole.legs.length, whole.truncated], [5, false]);
  assert.equal(w.k.basisFor("INQ-2026-0001-q").legs.length, 5);
  assert.equal(w.k.basisFor("INQ-2026-0001-q").truncated, undefined, "unbounded, the answer is unchanged");
  for (const bad of [0, -1, 1.5, "2"]) assert.equal(w.k.basisFor("INQ-2026-0001-q", { limit: bad }).legs.length, 5, String(bad));
});

test("R5 restsOnLive: a divided citer skipped, a severed one severed, a case member's frozen, the rest confirmed", () => {
  const caseMembers = new Set();
  const w = world({ caseMembers }); w.doc(A);
  const T = "INQ-2026-0009-t";
  w.inquiry(T);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: T }] });
  w.inquiry("INQ-2026-0002-r", { legs: [{ target: T }], refs: [{ target: T, rel: "cites", status: "severed" }] });
  w.inquiry("INQ-2026-0003-s", { legs: [{ target: T }] }); caseMembers.add("INQ-2026-0003-s");
  w.inquiry("INQ-2026-0004-d", { legs: [{ target: T }] });
  w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id='INQ-2026-0004-d'`);
  const r = w.k.restsOnLive(T);
  assert.deepEqual(r.confirmed.map((l) => l.bundle_id), ["INQ-2026-0001-q"]);
  assert.deepEqual(r.severed.map((l) => l.bundle_id), ["INQ-2026-0002-r"]);
  assert.deepEqual(r.frozen.map((l) => l.bundle_id), ["INQ-2026-0003-s"]);
  assert.deepEqual(r.all.map((l) => l.bundle_id), ["INQ-2026-0001-q", "INQ-2026-0003-s"]);
});

test("R5 a case-membership fact no module answers counts the citer as a case member: frozen, never confirmed", () => {
  const w = world({ caseFact: false }); w.doc(A);
  const T = "INQ-2026-0009-t";
  w.inquiry(T); w.inquiry("INQ-2026-0001-q", { legs: [{ target: T }] });
  const r = w.k.restsOnLive(T);
  assert.deepEqual([r.confirmed.length, r.frozen.map((l) => l.bundle_id)], [0, ["INQ-2026-0001-q"]]);
});

test("R6 cyclePath answers the whole cycle path [id, target, …, id] for the first target that would close one through inquiry legs, else null", () => {
  const w = world(); w.doc(A);
  const Q = "INQ-2026-0001-q", R = "INQ-2026-0002-r", S = "INQ-2026-0003-s", T = "INQ-2026-0004-t";
  w.inquiry(S, { legs: [{ target: R }] });
  w.inquiry(R, { legs: [{ target: A }, { target: Q }] });
  w.inquiry(T, { legs: [{ target: A }] });
  assert.deepEqual(w.k.cyclePath(Q, [T, S]), [Q, S, R, Q], "the first target that closes one, the whole path named");
  assert.deepEqual(w.k.cyclePath(Q, [R]), [Q, R, Q]);
  assert.equal(w.k.cyclePath(Q, [T]), null, "a target that reaches nothing of Q's");
  assert.equal(w.k.cyclePath(S, [A]), null, "a document leg is no inquiry leg");
  assert.equal(w.k.cyclePath(Q, []), null);
  /* a leg onto a document named like the question is not walked: only inquiry-typed legs are */
  w.k.writeBasis(T, [{ target: A }, { target: Q }]);
  assert.deepEqual(w.k.cyclePath(Q, [S, T]), [Q, S, R, Q]);
  assert.deepEqual(w.k.cyclePath(Q, [T]), [Q, T, Q]);
});

test("R6 the walk terminates over a shared sub-basis (each inquiry visited once) and over an imported finding reference", () => {
  const w = world();
  const ids = Array.from({ length: 12 }, (_, i) => `INQ-2026-01${String(i).padStart(2, "0")}-n`);
  /* a ladder in which every rung rests on both rungs below it: a path count exponential in depth, a node count linear */
  for (let i = 0; i < ids.length; i++)
    w.inquiry(ids[i], { legs: i >= 2 ? [{ target: ids[i - 1] }, { target: ids[i - 2] }] : [] });
  const seen = [];
  const sql = w.st.sql, exec = sql.exec;
  sql.exec = (q, ...a) => { if (/target_type='inquiry'/.test(q)) seen.push(a[0]); return exec.call(sql, q, ...a); };
  assert.equal(w.k.cyclePath("INQ-2026-0999-x", [ids.at(-1)]), null);
  sql.exec = exec;
  assert.equal(seen.length, new Set(seen).size, "no inquiry's legs are read twice");
  assert.equal(w.k.cyclePath("INQ-2026-0001-p", [`imported:${"c".repeat(64)}/INFO-2026-0007-x`]), null);
});

test("R7 the projects drawing on a question are read at most 32, the first by id, with truncated; a severed citer takes no slot and the bound never decides", () => {
  const w = world(); w.member("alice"); w.member("bob");
  const Q1 = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";
  w.inquiry(Q1); w.inquiry(Q2);
  assert.equal(PROJECTS_DRAWING_MAX, 32);
  /* Q2: many severed citers first by id, then exactly two that draw: still "more than one" */
  for (let i = 0; i < 40; i++) w.project(`Severed ${i}`, "bob", [{ target: Q2, status: "severed" }]);
  const two = [w.project("One", "alice", [Q2]), w.project("Two", "bob", [Q2])];
  const d2 = w.k.projectsDrawingOn(Q2);
  assert.deepEqual([[...d2], d2.truncated], [two.sort(), false]);
  /* Q1: 34 projects draw on it, over every project whatever any viewer sees */
  const all = [];
  for (let i = 0; i < 34; i++) all.push(w.project(`P${i}`, i % 2 ? "bob" : "alice", [Q1]));
  const d1 = w.k.projectsDrawingOn(Q1);
  assert.deepEqual([[...d1], d1.truncated], [all.sort().slice(0, 32), true]);
  assert.deepEqual([...w.k.projectsDrawingOn("")], []); assert.equal(w.k.projectsDrawingOn("").truncated, false);
  /* a cites reference from a document that is not a project is not a project drawing on it */
  w.inquiry("INQ-2026-0003-s", { legs: [{ target: Q2 }] });
  assert.deepEqual([...w.k.projectsDrawingOn(Q2)], two.sort());
});

const IMP = `imported:${"c".repeat(64)}/INFO-2026-0007-x`;
test("R3 earnedBasis lists a leg on an imported finding reference as the question's own, earning nothing, its null case IMPORTED_TARGET", () => {
  const w = world(); w.doc(A);
  const P = "INQ-2026-0001-p";
  const text = inquiryMd(P, { legs: [{ target: A }, { target: IMP }], refs: [{ target: A }] })
    .replace(`  - target: ${IMP}\n    role: supports\n`, `  - target: ${IMP}\n    role: supports\n    target_edition: 3\n`);
  assert.equal(w.promoteInquiry(P, text).ok, true);
  assert.deepEqual(w.rows(`SELECT ord, target_id, content_id FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, P)
    .map((x) => [x.ord, x.target_id, x.content_id === null]), [[0, A, false], [1, IMP, true]], "projected as spelled");
  const e = w.k.earnedBasis({ id: P, viewer: "admin" });
  assert.equal(e.ok, true, JSON.stringify(e).slice(0, 400));
  assert.equal(e.legs_out_of_view, undefined); assert.equal(e.out_of_view, undefined);
  const leg = e.legs.find((l) => l.ord === 1);
  assert.equal(leg.target, IMP); assert.equal(leg.content_id, null); assert.equal(leg.null_case, "IMPORTED_TARGET");
  assert.match(leg.why_no_content, /another group's finding/);
  assert.equal(leg.version, undefined, "no version: this record holds no capture of it");
  assert.ok(e.asked.includes(IMP));
  assert.equal(e.earned.connection[IMP], undefined); assert.equal(e.earned.capture[IMP], undefined);
  assert.equal(w.k.ensureLegContent(P, 1).null_case, "IMPORTED_TARGET");
  assert.deepEqual(w.k.restingOn(IMP).dependents.map((d) => [d.bundle_id, d.ord]), [[P, 1]], "named like any target");
  /* a viewer who may not see the question is answered as for an absent one (R11), the ref included */
  assert.equal(w.k.earnedBasis({ id: P, viewer: null }).reason, "NO_SUCH_BUNDLE");
});

test("R3 R4 the routes plane takes after inquiry's job: basis, restson and earnedbasis answer as the reads do, the viewer from the stamp", () => {
  const w = world(); w.doc(A);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  const ops = (q) => legEarningOps(w.k, new URL(`http://x/?${q}`));
  assert.deepEqual(ops("id=INQ-2026-0001-q").basis(), w.k.basisFor("INQ-2026-0001-q"));
  assert.deepEqual(ops(`id=${A}`).restson(), w.k.restingOn(A));
  assert.equal(ops("id=INQ-2026-0001-q&viewer=admin").earnedbasis().ok, true);
  assert.equal(ops("id=INQ-2026-0001-q").earnedbasis().reason, "NO_SUCH_BUNDLE", "no stamp, no sight");
});
