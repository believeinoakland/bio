/* reevaluation: an imported finding reference as a target (R1; N522) and an acceptance of another group's work withdrawn
   (R31; DEC-96 item 1), with the kind R8's listeners are told. `case-import` (layer 8) fills `accepted-work`'s
   registration and is built after this module, so it is a stand-in here: `finding` answers the findings the test lays
   down for the viewers it names, and `withdrawals` the withdrawals it lays down, paged by a numeric cursor, in the shapes
   accepted-work's R1 states. Every test drives `reevaluation` at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V, MACHINE } from "./fixture.mjs";
import { CAUSE_SOURCES } from "../../../src/reevaluation/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";

const IMP = "a".repeat(64);
const REF = importedFindingRef(IMP, "INQ-2026-0001-theirs"), REF2 = importedFindingRef(IMP, "INQ-2026-0002-theirs2");
const D = "INQ-2026-0011-at2", D1 = "INQ-2026-0012-at1", E = "INQ-2026-0013-other", L = "INQ-2026-0014-local";
const ADMIN = "class:admin";
const T1 = "2026-09-29T00:00:00Z", T2 = "2026-09-30T00:00:00Z", T3 = "2026-10-01T00:00:00Z";

/** The case-import stand-in. `seers` are the viewers `finding` answers (a machine credential is not asked); `held` the
 *  (ref, edition) pairs it holds; `withdrawals` the live list, `page` at a time. `failing` makes `withdrawals` throw. */
function imports(w, { seers = ["member:alice", "member:ann"], held = null, withdrawals = [], page = 200, failing = false } = {}) {
  const s = { seers: new Set(seers), held, withdrawals, asked: 0, failing };
  const r = acceptedWorkOf(w.host).registerAcceptedWork("case-import", {
    finding: ({ ref, edition, viewer }) => {
      if (!s.seers.has(viewer)) return null;
      if (s.held && !s.held.has(`${ref}@${edition}`)) return null;
      const withdrawn = s.withdrawals.some((x) => x.edition === edition && x.refs.includes(ref));
      return { ref, import: IMP, group: "other-group", case: "CASE-2026-0007-theirs", edition, finding: ref.split("/")[1],
               manifest_sha: "m".repeat(64), result: "recreated", pair: {},
               acceptance: withdrawn ? null : { by: "member:alice", at: T1, reason: "checked it", checked: [], gaps: [] } };
    },
    openFlags: () => ({ flags: [], complete: true }),
    withdrawals: ({ after = "", limit = 200 }) => {
      s.asked++;
      if (s.failing) throw new Error("case-import unreadable");
      const i = after ? Number(after) : 0, n = Math.min(limit, page);
      return { withdrawals: s.withdrawals.slice(i, i + n), cursor: i + n < s.withdrawals.length ? String(i + n) : null };
    },
  });
  assert.deepEqual(r, { ok: true, module: "case-import" });
  return s;
}

/** D rests on REF at edition 2 and on REF2 at edition 2; D1 on REF at edition 1; E on REF2 at edition 2; L on nothing
 *  imported. Each leg is written while its acceptance is in force (accepted-work R4 checks it at the promotion). */
function setup(opts = {}) {
  const w = world();
  w.member("ann"); w.member("owen");
  const s = imports(w, opts);
  w.inquiry(D, { legs: [{ target: REF, target_edition: 2 }, { target: REF2, target_edition: 2 }], refs: [] });
  w.inquiry(D1, { legs: [{ target: REF, target_edition: 1 }], refs: [] });
  w.inquiry(E, { legs: [{ target: REF2, target_edition: 2 }], refs: [] });
  w.inquiry(L, {});
  return { w, s };
}
const withdrawal = (refs, { id = "AW-1", edition = 2, at = T2 } = {}) => ({ withdrawal: id, import: IMP, edition, refs, at });
const causesOf = (r) => r.obligations.flatMap((o) => o.causes.filter((c) => c.source === "acceptance")
  .map((c) => [o.bundle_id, o.target, c.ord, c.edition, c.withdrawal, c.since]));

test("R1 (N522): an imported finding reference is a target: refused NO_SUCH_BUNDLE, as an absent target is, when accepted work answers null for this viewer at every edition a leg names; never a deletion cause", () => {
  const { w, s } = setup();
  /* nothing withdrawn: a leg on a ref is not a deleted target (no `bundles` row is no deletion) */
  for (const r of [w.r.reevaluations({ viewer: ADMIN }), w.r.reevaluations({ viewer: V("ann") })])
    assert.deepEqual([r.count, r.obligations], [0, []], "no cause stands on a ref nothing moved");
  const ok = w.r.reevaluations({ target: REF, viewer: V("ann") });
  assert.deepEqual([ok.ok, ok.target, ok.count], [true, REF, 0]);
  /* a viewer the import is not answered for, and one with no seat, are refused as for an absent target */
  for (const viewer of [V("owen"), "nobody"]) {
    const r = w.r.reevaluations({ target: REF, viewer });
    assert.deepEqual(r, { ok: false, reason: "NO_SUCH_BUNDLE", target: REF }, viewer);
    assert.deepEqual(r, { ...w.r.reevaluations({ target: "INQ-2026-0099-none", viewer }), target: REF }, "as an absent one");
  }
  /* a machine credential is not filtered */
  assert.equal(w.r.reevaluations({ target: REF, viewer: MACHINE }).ok, true);
  /* "at any edition a leg names": held at edition 1 only (D1's) still answers; held at none named is refused */
  s.held = new Set([`${REF}@1`]);
  assert.equal(w.r.reevaluations({ target: REF, viewer: V("ann") }).ok, true, "edition 1 is named by D1's leg");
  s.held = new Set([`${REF}@3`]);
  assert.equal(w.r.reevaluations({ target: REF, viewer: V("ann") }).reason, "NO_SUCH_BUNDLE", "no leg names edition 3");
  /* a ref no leg names */
  assert.equal(w.r.reevaluations({ target: importedFindingRef(IMP, "INQ-2026-0009-unnamed"), viewer: V("ann") }).reason,
               "NO_SUCH_BUNDLE");
});

test("R1 R20 R21: with nothing registered the ref cannot be read for this viewer: a targeted read is refused and says accepted_work_absent; nothing is listed and no deletion cause is invented", () => {
  const w = world();
  /* a leg on a ref laid down as a replay (accepted-work's check is not asked of a replay) */
  const res = w.promotion.promote({ bundleId: D, base: null, snapKey: "legacy-1", author: "member:alice", replay: true,
    files: [{ path: "bundle.md", text: inquiryMd(D, { legs: [{ target: REF, target_edition: 2 }], refs: [] }) }],
    meta: { object_type: "inquiry" } });
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 300));
  w.member("ann");
  const t = w.r.reevaluations({ target: REF, viewer: V("ann") });
  assert.deepEqual([t.ok, t.reason, t.accepted_work_absent], [false, "NO_SUCH_BUNDLE", true]);
  assert.match(t.accepted_work_why, /not the same as none/);
  for (const r of [w.r.reevaluations({ viewer: ADMIN }), w.r.reevaluations({ viewer: V("ann") }),
                   w.r.changesOf({ findings: [D], viewer: ADMIN })]) {
    assert.ok(!/"deletion"|"acceptance"/.test(JSON.stringify(r)), "no cause raised");
    assert.equal(r.accepted_work_absent, true);
  }
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0);
  /* negative control: registered, the same leg answers and nothing is said absent */
  const reg = setup();
  const r = reg.w.r.reevaluations({ target: REF, viewer: V("ann") });
  assert.deepEqual([r.ok, r.accepted_work_absent], [true, undefined]);
});

test("R31 R2: a live leg on a ref at an edition a withdrawal names carries acceptance, since the withdrawal's instant, detail naming the source group, case, edition and the withdrawal; another edition carries none", () => {
  const { w, s } = setup();
  s.withdrawals.push(withdrawal([REF]));
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(causesOf(r), [[D, REF, 0, 2, "AW-1", T2]], "D1 names edition 1, E another ref");
  const [o] = r.obligations;
  assert.deepEqual([o.target, o.target_state, o.reeval], [REF, null, { flag: true, since: T2, source: "acceptance" }]);
  /* the source group and case are read for the viewer (case-import answers a machine credential null, its R16) */
  assert.deepEqual([o.causes[0].group, o.causes[0].case], [null, null]);
  assert.match(o.causes[0].detail, /at edition 2, and this group's acceptance/);
  const c = w.r.reevaluations({ viewer: V("ann") }).obligations[0].causes[0];
  assert.deepEqual([c.ref, c.import, c.group, c.case, c.edition, c.withdrawal],
                   [REF, IMP, "other-group", "CASE-2026-0007-theirs", 2, "AW-1"]);
  assert.match(c.detail, /another group's finding .* at edition 2, of case CASE-2026-0007-theirs by other-group, and this group's acceptance of that edition was withdrawn \(AW-1, at 2026-09-30/);
  assert.match(c.detail, /leg is unchanged/);
  assert.deepEqual(o.legs, [{ ord: 0, role: "supports", grade: null, grade_axis: null, grade_source: null, target_edition: 2,
                              status: "confirmed", grade_authored: null, grade_why: null }]);
  assert.ok(CAUSE_SOURCES.includes("acceptance"));
  assert.deepEqual([r.accepted_work_absent, r.acceptance_read], [undefined, undefined]);
  /* the targeted read answers the same, for a member who sees the import */
  assert.deepEqual(causesOf(w.r.reevaluations({ target: REF, viewer: V("ann") })), [[D, REF, 0, 2, "AW-1", T2]]);
  assert.deepEqual(causesOf(w.r.reevaluations({ target: REF2, viewer: ADMIN })), []);
  /* a withdrawal of edition 1, then of REF2 at 2: each leg its own, in (dependent, target, ord, withdrawal) order */
  s.withdrawals.push(withdrawal([REF], { id: "AW-2", edition: 1, at: T3 }), withdrawal([REF, REF2], { id: "AW-0", at: T3 }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })),
    [[D, REF, 0, 2, "AW-0", T3], [D, REF, 0, 2, "AW-1", T2], [D, REF2, 1, 2, "AW-0", T3], [D1, REF, 0, 1, "AW-2", T3],
     [E, REF2, 0, 2, "AW-0", T3]]);
});

test("R31: the withdrawals are read through each cursor to null; a leg that is not live carries none; a listing withholds a ref the viewer is not answered", () => {
  const { w, s } = setup({ page: 1 });
  s.withdrawals.push(withdrawal([REF2], { id: "AW-1" }), withdrawal([], { id: "AW-2" }), withdrawal([REF], { id: "AW-3" }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })).map((x) => [x[0], x[1], x[4]]),
                   [[D, REF, "AW-3"], [D, REF2, "AW-1"], [E, REF2, "AW-1"]], "the third page is read");
  assert.ok(s.asked >= 3);
  /* owen is not answered the import: the refs' obligations are withheld whole, and nothing says so in a listing */
  w.st.sql.exec(`UPDATE bundles SET project=NULL`);
  const owen = w.r.reevaluations({ viewer: V("owen") });
  assert.deepEqual([owen.count, owen.out_of_view], [0, undefined]);
  /* E divided: a divided citer's legs are frozen history (R7) */
  w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, E);
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })).map((x) => x[0]), [D, D]);
});

test("R31 R21: an unreadable withdrawal read raises nothing and says acceptance_read: false", () => {
  const { w, s } = setup({ withdrawals: [] });
  s.withdrawals.push(withdrawal([REF]));
  s.failing = true;
  for (const r of [w.r.reevaluations({ viewer: ADMIN }), w.r.changesOf({ findings: [D], viewer: ADMIN })]) {
    assert.deepEqual([r.acceptance_read, r.accepted_work_absent], [false, undefined]);
    assert.match(r.acceptance_read_why, /not the same as none/);
    assert.ok(!/"acceptance"/.test(JSON.stringify(r.obligations ?? r.findings)));
  }
});

test("R31 R9 R16 R19 R18: the recovery read answers the cause with its target; a recorded re-evaluation closes it until a later withdrawal; nothing regrades and no read writes", () => {
  const { w, s } = setup();
  s.withdrawals.push(withdrawal([REF]));
  const grades = () => w.rows(`SELECT bundle_id, ord, target_id, grade FROM inquiry_basis ORDER BY bundle_id, ord`);
  const g0 = grades();
  const before = w.snapshot();
  const ch = w.r.changesOf({ findings: [D, D1, L], viewer: ADMIN });
  assert.deepEqual(ch.findings.map((f) => [f.id, f.causes.map((c) => [c.source, c.target, c.withdrawal])]),
                   [[D, [["acceptance", REF, "AW-1"]]], [D1, []], [L, []]]);
  w.r.reevaluations({ viewer: ADMIN }); w.r.reevaluations({ target: REF, viewer: V("ann") });
  assert.deepEqual(w.snapshot(), before, "the arm writes no row (R18)");
  /* a machine is refused; a member closes it, naming the ref as the target */
  assert.equal(w.r.recordReevaluation({ dependent: D, target: REF, source: "acceptance", note: "x", author: MACHINE,
                                        viewer: ADMIN }).code, "MACHINE_CANNOT_RECORD_REEVALUATION");
  const ok = w.r.recordReevaluation({ dependent: D, target: REF, source: "acceptance", note: "read the withdrawal",
                                      author: "ann", viewer: V("ann") });
  assert.deepEqual([ok.ok, ok.since], [true, T2], JSON.stringify(ok));
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.equal(r.count, 0);
  assert.deepEqual(r.closed.map((c) => [c.bundle_id, c.target, c.causes.map((x) => [x.source, x.closed_by])]),
                   [[D, REF, [["acceptance", "ann"]]]]);
  assert.deepEqual(w.r.changesOf({ findings: [D], viewer: ADMIN }).findings[0].causes, []);
  /* owen may not see the ref: he cannot record against it */
  assert.equal(w.r.recordReevaluation({ dependent: D, target: REF, source: "acceptance", note: "x", author: "owen",
                                        viewer: V("owen") }).code, "REEVALUATION_NO_SUCH_CAUSE");
  /* a later withdrawal is owed again */
  s.withdrawals.push(withdrawal([REF], { id: "AW-5", at: T3 }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })), [[D, REF, 0, 2, "AW-5", T3]]);
  assert.deepEqual(grades(), g0, "no leg regraded (R19)");
});

test("R31 R8: acceptanceWithdrawn tells the listeners once after the act, as kind acceptance with the arm's dependents; a thrower is named; a rolled-back caller tells nothing; nothing is written; it never throws", () => {
  const { w, s } = setup();
  s.withdrawals.push(withdrawal([REF, REF2]));
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => heard.push(e));
  w.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  const before = w.snapshot();
  let a = null;
  w.record.transact(() => {
    a = w.r.acceptanceWithdrawn({ withdrawal: "AW-1" });
    assert.equal(heard.length, 0, "not before the commit");
    return null;
  });
  assert.deepEqual([a.ok, a.told, a.kind, a.withdrawal, a.dependents, a.listeners_failed],
                   [true, true, "acceptance", "AW-1", 3, ["consequences"]]);
  assert.equal(heard.length, 1);
  const [h] = heard;
  assert.deepEqual([h.kind, h.subject, h.source, h.since, h.import, h.edition, h.refs],
                   ["acceptance", "AW-1", "acceptance", T2, IMP, 2, [REF, REF2].sort()]);
  assert.deepEqual(h.dependents, [{ bundle_id: D, ord: 0, role: "supports", state: "open", target: REF },
                                  { bundle_id: D, ord: 1, role: "supports", state: "open", target: REF2 },
                                  { bundle_id: E, ord: 0, role: "supports", state: "open", target: REF2 }]);
  assert.equal(typeof h.detail, "string");
  /* an object carrying the id is read the same */
  assert.equal(w.r.acceptanceWithdrawn({ withdrawal: { withdrawal: "AW-1" } }).dependents, 3);
  /* rolled back: nobody told */
  assert.throws(() => w.record.transact(() => { w.r.acceptanceWithdrawn({ withdrawal: "AW-1" }); throw new Error("undo"); }));
  assert.equal(heard.length, 2);
  /* one accepted work does not answer is told with no dependents, and says so; none named tells nothing */
  const c = w.r.acceptanceWithdrawn({ withdrawal: "AW-404" });
  assert.deepEqual([c.told, c.dependents, c.withdrawal_read], [true, 0, false]);
  for (const x of [{}, { withdrawal: "  " }, undefined]) assert.equal(w.r.acceptanceWithdrawn(x).told, false, JSON.stringify(x));
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
  /* nothing registered: never throws, told with no dependents */
  const bare = world();
  const told = [];
  bare.r.onBasisChanged("conformance", (e) => told.push(e));
  const d = bare.r.acceptanceWithdrawn({ withdrawal: "AW-1" });
  assert.deepEqual([d.ok, d.told, d.dependents, d.accepted_work_absent, told.length], [true, true, 0, true, 1]);
});
