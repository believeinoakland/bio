/* reevaluation: a cited edition moved at its publisher (R33; DEC-101 (3), DEC-116 item 8; N534), with the kind R8's
   listeners are told. `case-import` (layer 8) fills `accepted-work`'s registration and is built after this module, so it
   is a stand-in here: `finding` answers the findings the test lays down for the viewers it names, and `moves` the
   publisher moves it lays down, paged by a numeric cursor, in the shape accepted-work's R8 states. Every test drives
   `reevaluation` at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { CAUSE_SOURCES, CITED_CASE_MOVED } from "../../../src/reevaluation/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";

const IMP = "a".repeat(64), IMP2 = "b".repeat(64);
const REF = importedFindingRef(IMP, "INQ-2026-0001-theirs"), REF2 = importedFindingRef(IMP, "INQ-2026-0002-theirs2");
const OTHER = importedFindingRef(IMP2, "INQ-2026-0003-elsewhere");
const D = "INQ-2026-0011-at2", D1 = "INQ-2026-0012-at1", E = "INQ-2026-0013-other", F = "INQ-2026-0014-elsewhere";
const ADMIN = "class:admin";
const T1 = "2026-09-29T00:00:00Z", T2 = "2026-09-30T00:00:00Z", T3 = "2026-10-01T00:00:00Z", T4 = "2026-10-02T00:00:00Z";
const GROUP = "other-group", CASE = "CASE-2026-0007-theirs";

/** The case-import stand-in. `seers` are the viewers `finding` answers (a machine credential is not asked); `moves` the
 *  live list, `page` at a time; `failing` makes `moves` throw; `withMoves: false` registers without `moves`. */
function imports(w, { seers = ["member:alice", "member:ann"], moves = [], page = 200, failing = false, withMoves = true } = {}) {
  const s = { seers: new Set(seers), moves, asked: 0, failing };
  const fns = {
    finding: ({ ref, edition, viewer }) => {
      if (viewer !== null && viewer !== undefined && !s.seers.has(viewer)) return null;
      return { ref, import: ref.slice(9, 73), group: GROUP, case: CASE, edition, finding: ref.split("/")[1],
               manifest_sha: "m".repeat(64), result: "recreated", pair: {},
               acceptance: { by: "member:alice", at: T1, reason: "checked it", checked: [], gaps: [] } };
    },
    openFlags: () => ({ flags: [], complete: true }),
    withdrawals: () => ({ withdrawals: [], cursor: null }),
  };
  if (withMoves) fns.moves = ({ after = "", limit = 200 }) => {
    s.asked++;
    if (s.failing) throw new Error("case-import unreadable");
    const i = after ? Number(after) : 0, n = Math.min(limit, page);
    return { moves: s.moves.slice(i, i + n), cursor: i + n < s.moves.length ? String(i + n) : null };
  };
  assert.deepEqual(acceptedWorkOf(w.host).registerAcceptedWork("case-import", fns), { ok: true, module: "case-import" });
  return s;
}

/** D rests on REF at edition 2 and on REF2 at edition 2; D1 on REF at edition 1; E on REF2 at edition 2; F on another
 *  import's finding at edition 1. Each leg is written while its acceptance is in force (accepted-work R4). */
function setup(opts = {}) {
  const w = world();
  w.member("ann"); w.member("owen");
  const s = imports(w, opts);
  w.inquiry(D, { legs: [{ target: REF, target_edition: 2 }, { target: REF2, target_edition: 2 }], refs: [] });
  w.inquiry(D1, { legs: [{ target: REF, target_edition: 1 }], refs: [] });
  w.inquiry(E, { legs: [{ target: REF2, target_edition: 2 }], refs: [] });
  w.inquiry(F, { legs: [{ target: OTHER, target_edition: 1 }], refs: [] });
  return { w, s };
}

let n = 0;
/** A publisher move as accepted-work R8 answers it. */
const move = (kind, edition, { id = `MV-${++n}`, imp = IMP, seq = n, at = T2, date = "2026-09-30", words = null,
                               key_listed = true, taken_back = null } = {}) =>
  ({ move: id, import: imp, group: GROUP, case: CASE, kind, edition, seq, date, at,
     what_changed: kind === "edition" ? (words ?? "table 3 corrected") : null,
     reason: kind === "withdrawal" ? (words ?? "the survey was miscoded") : null, key_listed, taken_back });
const causesOf = (r) => r.obligations.flatMap((o) => o.causes.filter((c) => c.source === CITED_CASE_MOVED)
  .map((c) => [o.bundle_id, o.target, c.ord, c.cited_edition, c.move, c.since]));

test("R33 R2: (a) an edition move naming m > n gives each live leg at edition n of the same import a cited_case_moved cause, since the move's at; m <= n, another import or another kind gives none", () => {
  const { w, s } = setup();
  s.moves.push(move("edition", 2, { id: "MV-e2", seq: 4, at: T2 }));
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(causesOf(r), [[D1, REF, 0, 1, "MV-e2", T2]], "edition 2 is newer only than D1's edition 1");
  const [o] = r.obligations;
  assert.deepEqual([o.target, o.target_state, o.reeval], [REF, null, { flag: true, since: T2, source: CITED_CASE_MOVED }]);
  const [c] = o.causes;
  assert.deepEqual({ ...c, detail: undefined },
    { source: CITED_CASE_MOVED, since: T2, ord: 0, role: "supports", state: "open", ref: REF, cited_edition: 1,
      move: "MV-e2", import: IMP, group: GROUP, case: CASE, kind: "edition", edition: 2, seq: 4, date: "2026-09-30",
      what_changed: "table 3 corrected", key_listed: true, taken_back: null, detail: undefined });
  assert.match(c.detail, new RegExp(`another group's finding .* at edition 1, of case ${CASE} by ${GROUP}, and its `
    + `publisher published edition 2 \\(docket entry 4, dated 2026-09-30: "table 3 corrected"\\)`));
  assert.match(c.detail, /leg is unchanged/);
  assert.ok(!/taken this entry back|signing key/.test(c.detail));
  assert.ok(CAUSE_SOURCES.includes(CITED_CASE_MOVED));
  assert.deepEqual([r.accepted_work_absent, r.accepted_work_unreadable], [undefined, undefined]);
  /* edition 3 is newer than 1 and 2: each leg its own cause per move, in (dependent, target, ord, move order) */
  s.moves.push(move("edition", 3, { id: "MV-e3", seq: 5, at: T3 }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })),
    [[D, REF, 0, 2, "MV-e3", T3], [D, REF2, 1, 2, "MV-e3", T3], [D1, REF, 0, 1, "MV-e2", T2], [D1, REF, 0, 1, "MV-e3", T3],
     [E, REF2, 0, 2, "MV-e3", T3]]);
  /* the targeted read answers the same, for a member the import is answered for */
  assert.deepEqual(causesOf(w.r.reevaluations({ target: REF2, viewer: V("ann") })),
                   [[D, REF2, 1, 2, "MV-e3", T3], [E, REF2, 0, 2, "MV-e3", T3]]);
  /* negative controls: another import's move reaches only F; an edition move naming 1 reaches nobody */
  s.moves.length = 0;
  s.moves.push(move("edition", 1, { id: "MV-e1", seq: 1 }), move("edition", 2, { id: "MV-x", imp: IMP2, seq: 2 }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })), [[F, OTHER, 0, 1, "MV-x", T2]]);
  /* only an edition or a withdrawal is a move (K1366 F1): another entry raises nothing, and the read says it was not whole */
  s.moves.length = 0;
  s.moves.push({ ...move("edition", 5, { id: "MV-tb" }), kind: "take-back" }, { ...move("edition", 5), kind: "response" });
  const other = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([other.count, other.accepted_work_unreadable], [0, true]);
});

test("R33: (b) a withdrawal naming n, or naming all at seq s unless an edition move naming n has a greater seq; a withdrawal of another edition gives none", () => {
  const { w, s } = setup();
  s.moves.push(move("withdrawal", 2, { id: "MV-w2", seq: 3, at: T2 }));
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(causesOf(r), [[D, REF, 0, 2, "MV-w2", T2], [D, REF2, 1, 2, "MV-w2", T2], [E, REF2, 0, 2, "MV-w2", T2]],
                   "D1 cites edition 1, which was not withdrawn");
  const c = r.obligations[0].causes[0];
  assert.deepEqual([c.kind, c.edition, c.seq, c.reason, "what_changed" in c], ["withdrawal", 2, 3, "the survey was miscoded", false]);
  assert.match(c.detail, /its publisher withdrew edition 2 \(docket entry 3, dated 2026-09-30: "the survey was miscoded"\)/);
  /* a withdrawal of every edition reaches every leg of the import */
  s.moves.length = 0;
  s.moves.push(move("withdrawal", "all", { id: "MV-all", seq: 6, at: T3 }));
  const all = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(causesOf(all).map((x) => [x[0], x[1], x[3], x[4]]),
                   [[D, REF, 2, "MV-all"], [D, REF2, 2, "MV-all"], [D1, REF, 1, "MV-all"], [E, REF2, 2, "MV-all"]]);
  assert.match(all.obligations[0].causes[0].detail, /its publisher withdrew every edition \(docket entry 6/);
  /* edition 2 published again after everything was withdrawn (a greater seq): the all-withdrawal no longer reaches
     legs at 2, while it still reaches D1 at 1; the edition move itself reaches D1 by (a) */
  s.moves.push(move("edition", 2, { id: "MV-re2", seq: 7, at: T4 }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })).map((x) => [x[0], x[3], x[4]]),
                   [[D1, 1, "MV-all"], [D1, 1, "MV-re2"]]);
  /* an edition move naming 2 with a lesser seq does not lift it */
  s.moves.length = 0;
  s.moves.push(move("edition", 2, { id: "MV-old2", seq: 1, at: T1 }), move("withdrawal", "all", { id: "MV-all", seq: 6, at: T3 }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })).map((x) => [x[0], x[3], x[4]]),
    [[D, 2, "MV-all"], [D, 2, "MV-all"], [D1, 1, "MV-old2"], [D1, 1, "MV-all"], [E, 2, "MV-all"]]);
  /* negative control: a withdrawal of edition 3 reaches nobody */
  s.moves.length = 0;
  s.moves.push(move("withdrawal", 3, { id: "MV-w3" }));
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0);
});

test("R33: a move taken back still stands as a cause and its detail says so; an entry whose key the case file does not list says that", () => {
  const { w, s } = setup();
  s.moves.push(move("withdrawal", 1, { id: "MV-w1", seq: 2, key_listed: false, taken_back: { seq: 3, date: "2026-10-01" } }));
  const [c] = w.r.reevaluations({ viewer: ADMIN }).obligations[0].causes;
  assert.deepEqual([c.move, c.key_listed, c.taken_back], ["MV-w1", false, { seq: 3, date: "2026-10-01" }]);
  assert.match(c.detail, /The entry's signing key is not among the keys the imported case file lists\./);
  assert.match(c.detail, /The publisher has since taken this entry back \(entry 3, dated 2026-10-01\); the cause still stands\./);
});

test("R33 R21: the moves are read through each cursor to null; with nothing registered, or a registration without moves, the arm is not raised and says accepted_work_absent; an unreadable read says accepted_work_unreadable", () => {
  const { w, s } = setup({ page: 1 });
  s.moves.push(move("withdrawal", 9, { id: "MV-a" }), move("withdrawal", 8, { id: "MV-b" }), move("withdrawal", 1, { id: "MV-c" }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })).map((x) => [x[0], x[4]]), [[D1, "MV-c"]], "the third page is read");
  assert.ok(s.asked >= 3);
  /* unreadable: nothing raised, and said */
  s.failing = true;
  for (const r of [w.r.reevaluations({ viewer: ADMIN }), w.r.changesOf({ findings: [D1], viewer: ADMIN }),
                   w.r.citedCaseDependents({ viewer: ADMIN })]) {
    assert.deepEqual([r.accepted_work_unreadable, r.accepted_work_absent], [true, undefined]);
    assert.match(r.accepted_work_unreadable_why, /not the same as none/);
    assert.ok(!JSON.stringify(r.obligations ?? r.findings ?? r.entries).includes(CITED_CASE_MOVED));
  }
  /* a registration without `moves` (accepted-work R1): absent, said as the moves' own absence */
  const bare = world();
  imports(bare, { withMoves: false });
  for (const r of [bare.r.reevaluations({ viewer: ADMIN }), bare.r.changesOf({ findings: [D], viewer: ADMIN }),
                   bare.r.citedCaseDependents({ viewer: ADMIN })]) {
    assert.equal(r.accepted_work_absent, true);
    assert.match(r.accepted_work_why, /keeps no publisher moves/);
  }
  /* nothing registered at all: absent, said as R1 and R31 say it */
  const none = world().r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([none.accepted_work_absent, none.count], [true, 0]);
  assert.match(none.accepted_work_why, /no module holding another group's work is registered/);
  /* negative control: registered with moves, nothing is said absent or unreadable */
  s.failing = false;
  const ok = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([ok.accepted_work_absent, ok.accepted_work_unreadable], [undefined, undefined]);
});

test("R33 R7 R20: only a live leg carries the cause; a dependent the viewer may not see is withheld; a ref the viewer is not answered is refused or withheld", () => {
  const { w, s } = setup();
  s.moves.push(move("withdrawal", 2, { id: "MV-w2" }));
  /* owen sees no dependent (each held in a project he is not in): nothing listed and, in a listing, nothing says so */
  w.st.sql.exec(`UPDATE bundles SET project='PRJ-2026-0001-hidden'`);
  const owen = w.r.reevaluations({ viewer: V("owen") });
  assert.deepEqual([owen.count, owen.out_of_view], [0, undefined]);
  assert.equal(w.r.reevaluations({ target: REF, viewer: V("owen") }).reason, "NO_SUCH_BUNDLE");
  assert.deepEqual(w.r.citedCaseDependents({ viewer: V("owen") }).entries, []);
  /* E divided: a divided citer's legs are frozen history (R7) */
  w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, E);
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })).map((x) => x[0]), [D, D]);
  assert.deepEqual(w.r.citedCaseDependents({ viewer: ADMIN }).entries.map((e) => e.dependent), [D]);
});

test("R33 R9 R16 R19 R18 R20: the recovery read answers the cause with its target; the group and case only where the viewer sees the ref; a recorded re-evaluation closes it until a later move; nothing regrades and no read writes", () => {
  const { w, s } = setup();
  s.moves.push(move("edition", 3, { id: "MV-e3", seq: 1, at: T2 }));
  const grades = () => w.rows(`SELECT bundle_id, ord, target_id, grade FROM inquiry_basis ORDER BY bundle_id, ord`);
  const g0 = grades();
  const before = w.snapshot();
  const ch = w.r.changesOf({ findings: [D, D1, F], viewer: ADMIN });
  assert.deepEqual(ch.findings.map((f) => [f.id, f.causes.map((c) => [c.source, c.target, c.ord, c.move, c.group, c.case])]),
    [[D, [[CITED_CASE_MOVED, REF, 0, "MV-e3", GROUP, CASE], [CITED_CASE_MOVED, REF2, 1, "MV-e3", GROUP, CASE]]],
     [D1, [[CITED_CASE_MOVED, REF, 0, "MV-e3", GROUP, CASE]]], [F, []]]);
  w.r.reevaluations({ viewer: ADMIN }); w.r.reevaluations({ target: REF, viewer: V("ann") });
  w.r.citedCaseDependents({ viewer: ADMIN });
  assert.deepEqual(w.snapshot(), before, "the arm writes no row (R18)");
  /* owen sees the dependents (no project) but is not answered the import: the cause stands, its group and case unsaid */
  w.st.sql.exec(`UPDATE bundles SET project=NULL`);
  const oc = w.r.changesOf({ findings: [D1], viewer: V("owen") }).findings[0].causes[0];
  assert.deepEqual([oc.move, oc.group, oc.case, /other-group|CASE-2026-0007/.test(oc.detail)], ["MV-e3", null, null, false]);
  const ol = w.r.citedCaseDependents({ viewer: V("owen") }).entries.find((e) => e.dependent === D1);
  assert.deepEqual([ol.move, ol.group, ol.case, /other-group|CASE-2026-0007/.test(ol.detail)], ["MV-e3", null, null, false]);
  /* a machine is refused; a member closes it, naming the ref as the target */
  assert.equal(w.r.recordReevaluation({ dependent: D1, target: REF, source: CITED_CASE_MOVED, note: "x", author: MACHINE,
                                        viewer: ADMIN }).code, "MACHINE_CANNOT_RECORD_REEVALUATION");
  const ok = w.r.recordReevaluation({ dependent: D1, target: REF, source: CITED_CASE_MOVED, note: "read edition 3",
                                      author: "ann", viewer: V("ann") });
  assert.deepEqual([ok.ok, ok.since], [true, T2], JSON.stringify(ok));
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(causesOf(r).map((x) => x[0]), [D, D, E]);
  assert.deepEqual(r.closed.map((c) => [c.bundle_id, c.target, c.causes.map((x) => [x.source, x.closed_by])]),
                   [[D1, REF, [[CITED_CASE_MOVED, "ann"]]]]);
  assert.deepEqual(w.r.changesOf({ findings: [D1], viewer: ADMIN }).findings[0].causes, []);
  assert.deepEqual(w.r.citedCaseDependents({ viewer: ADMIN }).entries.map((e) => e.dependent), [D, E], "a closed cause is not listed");
  /* owen is not answered the ref: he cannot record against it */
  assert.equal(w.r.recordReevaluation({ dependent: D, target: REF, source: CITED_CASE_MOVED, note: "x", author: "owen",
                                        viewer: V("owen") }).code, "REEVALUATION_NO_SUCH_CAUSE");
  /* a later move is owed again */
  s.moves.push(move("withdrawal", 1, { id: "MV-w1", seq: 2, at: T3 }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN })).filter((x) => x[0] === D1), [[D1, REF, 0, 1, "MV-w1", T3]]);
  assert.deepEqual(grades(), g0, "no leg regraded (R19)");
});

test("R33: citedCaseDependents lists each (dependent, move) in dependent then move order after `after`, at most `limit` (1–200, default 200), with its legs and a cursor", () => {
  const { w, s } = setup();
  s.moves.push(move("edition", 3, { id: "MV-z", seq: 1, at: T2 }), move("withdrawal", 2, { id: "MV-a", seq: 2, at: T3 }),
               move("withdrawal", 1, { id: "MV-x", imp: IMP2, seq: 3, at: T3, words: "gone" }));
  const all = w.r.citedCaseDependents({ viewer: ADMIN });
  assert.deepEqual(all.entries.map((e) => [e.dependent, e.move, e.legs]),
    [[D, "MV-z", [{ target: REF, ord: 0, cited_edition: 2 }, { target: REF2, ord: 1, cited_edition: 2 }]],
     [D, "MV-a", [{ target: REF, ord: 0, cited_edition: 2 }, { target: REF2, ord: 1, cited_edition: 2 }]],
     [D1, "MV-z", [{ target: REF, ord: 0, cited_edition: 1 }]],
     [E, "MV-z", [{ target: REF2, ord: 0, cited_edition: 2 }]], [E, "MV-a", [{ target: REF2, ord: 0, cited_edition: 2 }]],
     [F, "MV-x", [{ target: OTHER, ord: 0, cited_edition: 1 }]]], "moves in the order recorded, not by id");
  const f = all.entries[5];
  assert.deepEqual({ ...f, legs: undefined, detail: undefined },
    { dependent: F, move: "MV-x", import: IMP2, group: GROUP, case: CASE, kind: "withdrawal", edition: 1, seq: 3,
      date: "2026-09-30", since: T3, reason: "gone", key_listed: true, taken_back: null, legs: undefined, detail: undefined });
  assert.deepEqual([all.count, all.limit, all.truncated, all.cursor, all.wrote], [6, 200, false, null, false]);
  /* paged: a cursor names the last entry; reading on from it lists the rest once */
  const p1 = w.r.citedCaseDependents({ limit: 2, viewer: ADMIN });
  assert.deepEqual([p1.entries.map((e) => [e.dependent, e.move]), p1.truncated, p1.cursor],
                   [[[D, "MV-z"], [D, "MV-a"]], true, `${D}#MV-a`]);
  const p2 = w.r.citedCaseDependents({ after: p1.cursor, limit: 3, viewer: ADMIN });
  assert.deepEqual([p2.entries.map((e) => [e.dependent, e.move]), p2.cursor],
                   [[[D1, "MV-z"], [E, "MV-z"], [E, "MV-a"]], `${E}#MV-a`]);
  const p3 = w.r.citedCaseDependents({ after: p2.cursor, viewer: ADMIN });
  assert.deepEqual([p3.entries.map((e) => [e.dependent, e.move]), p3.truncated, p3.cursor], [[[F, "MV-x"]], false, null]);
  assert.deepEqual(w.r.citedCaseDependents({ after: `${D}#MV-z`, limit: 1, viewer: ADMIN }).entries.map((e) => e.move), ["MV-a"]);
  assert.deepEqual(w.r.citedCaseDependents({ after: D1, viewer: ADMIN }).entries[0].dependent, D1, "a bare dependent starts at it");
  /* the limit is clamped to 1–200 */
  assert.equal(w.r.citedCaseDependents({ limit: 0, viewer: ADMIN }).limit, 200);
  assert.equal(w.r.citedCaseDependents({ limit: -5, viewer: ADMIN }).limit, 1);
  assert.equal(w.r.citedCaseDependents({ limit: 5000, viewer: ADMIN }).limit, 200);
  /* a dependent the viewer may not see is withheld and not counted */
  w.st.sql.exec(`UPDATE bundles SET project='PRJ-2026-0001-hidden' WHERE bundle_id IN (?, ?)`, D, E);
  const owen = w.r.citedCaseDependents({ viewer: V("owen") });
  assert.deepEqual([owen.entries.map((e) => e.dependent), owen.count, owen.out_of_view], [[D1, F], 2, undefined]);
});

test("R33 R8: citedCaseMoved tells the listeners once after the act, as kind cited_case_moved with the arm's dependents for that move; a thrower is named; a rolled-back caller tells nothing; nothing is written; it never throws", () => {
  const { w, s } = setup();
  s.moves.push(move("withdrawal", 2, { id: "MV-w2", seq: 3, at: T2 }), move("edition", 2, { id: "MV-e2", seq: 4, at: T3 }));
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => heard.push(e));
  w.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  const before = w.snapshot();
  let a = null;
  w.record.transact(() => {
    a = w.r.citedCaseMoved({ move: "MV-w2" });
    assert.equal(heard.length, 0, "not before the commit");
    return null;
  });
  assert.deepEqual([a.ok, a.told, a.kind, a.move, a.dependents, a.listeners_failed],
                   [true, true, CITED_CASE_MOVED, "MV-w2", 3, ["consequences"]]);
  assert.equal(heard.length, 1);
  const [h] = heard;
  assert.deepEqual([h.kind, h.subject, h.source, h.since, h.import, h.group, h.case, h.move_kind, h.edition, h.seq],
                   [CITED_CASE_MOVED, "MV-w2", CITED_CASE_MOVED, T2, IMP, GROUP, CASE, "withdrawal", 2, 3]);
  assert.deepEqual(h.dependents.map(({ detail, ...x }) => x),
    [{ bundle_id: D, ord: 0, role: "supports", state: "open", target: REF, cited_edition: 2, group: GROUP, case: CASE },
     { bundle_id: D, ord: 1, role: "supports", state: "open", target: REF2, cited_edition: 2, group: GROUP, case: CASE },
     { bundle_id: E, ord: 0, role: "supports", state: "open", target: REF2, cited_edition: 2, group: GROUP, case: CASE }]);
  assert.match(h.dependents[0].detail, /withdrew edition 2/);
  assert.match(h.detail, /withdrew edition 2 \(case CASE-2026-0007-theirs\) \(move MV-w2\); what rests on it is named/);
  /* told as the plane: the group and case are named although nobody is answered the import */
  s.seers = new Set();
  heard.length = 0;
  assert.equal(w.r.citedCaseMoved({ move: { move: "MV-e2" } }).dependents, 1, "an object carrying the id; D1 at 1 only");
  assert.deepEqual(heard[0].dependents.map((d) => [d.bundle_id, d.target, d.cited_edition, d.group, d.case]),
                   [[D1, REF, 1, GROUP, CASE]]);
  /* rolled back: nobody told */
  heard.length = 0;
  assert.throws(() => w.record.transact(() => { w.r.citedCaseMoved({ move: "MV-w2" }); throw new Error("undo"); }));
  assert.equal(heard.length, 0);
  /* a move accepted work does not answer is told with no dependents, and says so; none named tells nothing */
  const c = w.r.citedCaseMoved({ move: "MV-404" });
  assert.deepEqual([c.told, c.dependents, c.move_read], [true, 0, false]);
  for (const x of [{}, { move: "  " }, undefined]) assert.equal(w.r.citedCaseMoved(x).told, false, JSON.stringify(x));
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
  /* unreadable or nothing registered: never throws, told with no dependents */
  s.failing = true;
  const u = w.r.citedCaseMoved({ move: "MV-w2" });
  assert.deepEqual([u.ok, u.told, u.dependents, u.accepted_work_unreadable], [true, true, 0, true]);
  const bare = world();
  const told = [];
  bare.r.onBasisChanged("conformance", (e) => told.push(e));
  const d = bare.r.citedCaseMoved({ move: "MV-w2" });
  assert.deepEqual([d.ok, d.told, d.dependents, d.accepted_work_absent, told.length], [true, true, 0, true, 1]);
  assert.equal(told[0].kind, CITED_CASE_MOVED);
});
