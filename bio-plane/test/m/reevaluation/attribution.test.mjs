/* reevaluation: a testimony's credit level changed (R29; DEC-102 item 2, K1019). `levelMoved`, called by ratification
   (its R36) when a ratified case edition states a level for an observation other than the one in force at the case's
   previous ratified edition, keeps one row per call with no author and no text (R18); a dependent carries the cause
   `attribution` when a live leg rests on that observation and the move came after the dependent's last write; each move
   is told to R8's listeners once as `kind: "attribution"`, after the row is written; the leg's grade is never changed; a
   recorded re-evaluation closes it (R16). Its caller, ratification, is a later layer, so these tests drive `levelMoved`
   directly. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, U, V, MACHINE, sha } from "./fixture.mjs";
import { CAUSE_SOURCES } from "../../../src/reevaluation/index.mjs";

const OBS = "INFO-2026-0001-observed", ELSE = "INFO-2026-0002-fetched", LONE = "INFO-2026-0003-lone";
const D = "INQ-2026-0001-passage", W = "INQ-2026-0002-whole", O = "INQ-2026-0003-other";
const ADMIN = "class:admin";
const CASE = "CASE-2026-0001";
const AT = "2026-09-28T03:00:00Z";
const MOVE = { observation: OBS, from: "group", to: "name", case: CASE, edition: 2, at: AT };

/** OBS stands for the observation the move names (an observation is a bundle a leg names; its grading is strength's,
 *  so its kind is not this module's to ask); D rests on a passage of it (graded), W on it whole, O on another document; LONE is an
 *  observation nothing rests on. Each dependent was last written 2026-09-27 (the fixture's stamp). */
function observed() {
  const w = world();
  const a = w.cap("a", "what I saw at the meeting"), b = w.cap("b", "a fetched text"), c = w.cap("c", "unused");
  w.doc(OBS, [a]); w.doc(ELSE, [b]); w.doc(LONE, [c]);
  w.read(a.sha, [U(0, "x"), U(1, "the fee rose")]);
  const ca = w.passage(OBS, a.sha);
  w.inquiry(D, { legs: [{ target: OBS, content_id: ca, grade: "B", grade_axis: "capture", grade_source: "capture" }] });
  w.inquiry(W, { legs: [{ target: OBS }] });
  w.inquiry(O, { legs: [{ target: ELSE }] });
  return { w, ca };
}
const attributed = (o) => o.causes.filter((c) => c.source === "attribution");

test("R29 R2: a live leg on an observation whose credit level moved after the dependent's last write carries `attribution` once, with both levels, the case and the edition, since the move's instant; a passage leg and a whole leg alike", () => {
  const { w } = observed();
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0, "nothing moved yet");
  const m = w.r.levelMoved(MOVE);
  assert.deepEqual([m.ok, m.moved, m.at, m.dependents], [true, true, AT, 2]);
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => [o.bundle_id, o.target]), [[D, OBS], [W, OBS]], "O rests on another document");
  for (const o of r.obligations) {
    const cs = attributed(o);
    assert.equal(cs.length, 1, "once per move");
    const [c] = cs;
    assert.deepEqual([c.source, c.since, c.ord, c.observation, c.level_before, c.level_after, c.case, c.edition],
      ["attribution", AT, 0, OBS, "group", "name", CASE, 2]);
    assert.match(c.detail, new RegExp(`moved from group to name in case ${CASE} at edition 2, at ${AT}`));
    assert.match(c.detail, /grade is unchanged/);
    assert.deepEqual(o.reeval, { flag: true, since: AT, source: "attribution" });
  }
  const d = r.obligations.find((o) => o.bundle_id === D);
  assert.deepEqual([d.legs[0].grade, d.legs[0].grade_authored], ["B", "B"], "it never regrades");
  assert.equal(w.fm(D).basis[0].grade, "B");
  assert.equal(w.rows(`SELECT grade FROM inquiry_basis WHERE bundle_id=?`, D)[0].grade, "B");
  assert.ok(CAUSE_SOURCES.includes("attribution"));
  /* asked of the observation itself */
  assert.deepEqual(w.r.reevaluations({ target: OBS, viewer: ADMIN }).obligations.map((o) => o.bundle_id), [D, W]);
  assert.equal(w.r.reevaluations({ target: ELSE, viewer: ADMIN }).count, 0);
  /* a call with no instant stamps now */
  w.clock.now = "2026-09-29T00:00:00Z";
  assert.equal(w.r.levelMoved({ ...MOVE, from: "name", to: "cover", at: undefined }).at, "2026-09-29T00:00:00Z");
});

test("R29: a move before the dependent's last write raises nothing; a later move does, the latest first; an observation no live leg rests on raises nothing; a severed leg rests on nothing", () => {
  const { w } = observed();
  /* before every dependent's last write */
  w.r.levelMoved({ ...MOVE, at: "2026-09-26T00:00:00Z" });
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0, "the dependents were written after the move");
  /* D written after this move, W not */
  w.r.levelMoved(MOVE);
  const text = w.text(D).replace(/last_updated: "[^"]+"/, 'last_updated: "2026-09-28T04:00:00Z"');
  assert.equal(w.promote(D, text).ok, true);
  assert.deepEqual(w.r.reevaluations({ viewer: ADMIN }).obligations.map((o) => o.bundle_id), [W], "D was written after");
  w.r.levelMoved({ ...MOVE, from: "name", to: "cover", edition: 3, at: "2026-09-30T00:00:00Z" });
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => [o.bundle_id, attributed(o).map((c) => [c.level_before, c.level_after, c.edition])]),
    [[D, [["name", "cover", 3]]], [W, [["name", "cover", 3], ["group", "name", 2]]]], "each move a cause, the latest first");
  /* an observation nothing rests on */
  const lone = w.r.levelMoved({ ...MOVE, observation: LONE });
  assert.deepEqual([lone.moved, lone.dependents], [true, 0]);
  assert.equal(w.r.reevaluations({ target: LONE, viewer: ADMIN }).count, 0);
  assert.ok(!w.r.reevaluations({ viewer: ADMIN }).obligations.some((o) => o.target === LONE));
  /* a severed leg */
  const SEV = "INQ-2026-0004-sev";
  w.inquiry(SEV, { legs: [{ target: OBS }], refs: [{ target: OBS, rel: "cites", status: "severed" }] });
  w.r.levelMoved({ ...MOVE, from: "cover", to: "project", at: "2026-10-01T00:00:00Z" });
  assert.ok(!w.r.reevaluations({ viewer: ADMIN }).obligations.some((o) => o.bundle_id === SEV), "a severed leg is not live");
});

test("R29 R8: each move is told once to R8's listeners as kind attribution, after its row is written, naming the live legs and no author; a listener that throws is named and the move stands; a rolled-back caller tells nothing", () => {
  const { w } = observed();
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => { heard.push({ ...e, rows: w.count("reevaluation_level_moves") }); });
  w.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  /* inside the caller's transaction (ratification's commit), told only once it commits */
  let m = null;
  w.record.transact(() => {
    m = w.r.levelMoved(MOVE);
    assert.equal(heard.length, 0, "not told before the commit");
    return null;
  });
  assert.equal(heard.length, 1);
  const [h] = heard;
  assert.deepEqual([h.kind, h.subject, h.source, h.since, h.level_before, h.level_after, h.case, h.edition, h.rows],
    ["attribution", OBS, "attribution", AT, "group", "name", CASE, 2, 1]);
  assert.deepEqual(h.dependents, [{ bundle_id: D, ord: 0, role: "supports", state: "open" },
                                  { bundle_id: W, ord: 0, role: "supports", state: "open" }]);
  assert.equal(typeof h.detail, "string");
  assert.ok(!("author" in h) && !/alice|member:/.test(JSON.stringify(h)), "no author is named");
  assert.deepEqual(m.listeners_failed, ["consequences"], "the thrower is named; the move stands");
  assert.equal(w.count("reevaluation_level_moves"), 1);
  /* a caller that rolls back keeps no row and tells nobody */
  assert.throws(() => w.record.transact(() => { w.r.levelMoved({ ...MOVE, from: "name", to: "cover" }); throw new Error("undo"); }));
  assert.deepEqual([w.count("reevaluation_level_moves"), heard.length], [1, 1]);
});

test("R29 R16 R9: a recorded re-evaluation closes the attribution cause until the level moves again; changesOf answers it with its target", () => {
  const { w } = observed();
  w.r.levelMoved(MOVE);
  const ch = w.r.changesOf({ findings: [D, O], viewer: ADMIN });
  assert.deepEqual(ch.findings.map((f) => [f.id, f.causes.map((c) => [c.source, c.target, c.level_after])]),
    [[D, [["attribution", OBS, "name"]]], [O, []]]);
  assert.equal(w.r.recordReevaluation({ dependent: D, target: OBS, source: "attribution", note: "x", author: MACHINE,
                                        viewer: ADMIN }).code, "MACHINE_CANNOT_RECORD_REEVALUATION");
  const ok = w.r.recordReevaluation({ dependent: D, target: OBS, source: "attribution",
                                      note: "named testimony; the finding stands", author: "alice", viewer: ADMIN });
  assert.deepEqual([ok.ok, ok.since], [true, AT]);
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => o.bundle_id), [W]);
  assert.deepEqual(r.closed.map((c) => [c.bundle_id, c.causes.map((x) => [x.source, x.closed_by])]),
    [[D, [["attribution", "alice"]]]], "listed closed, with who");
  assert.deepEqual(w.r.changesOf({ findings: [D], viewer: ADMIN }).findings[0].causes, []);
  w.r.levelMoved({ ...MOVE, from: "name", to: "group", edition: 3, at: "2026-09-29T00:00:00Z" });
  assert.deepEqual(w.r.reevaluations({ viewer: ADMIN }).obligations.map((o) => o.bundle_id), [D, W], "moved again: owed again");
});

test("R18 R29 R20: no read writes; a level move's one row is the only new row, holding no author and no text; a call that names no move writes nothing; a dependent the viewer may not see is withheld", () => {
  const { w } = observed();
  w.member("ann");
  const tables = () => { const s = w.snapshot(); delete s.sqlite_sequence; return s; };
  const empty = tables();
  for (const bad of [{}, { ...MOVE, observation: "" }, { ...MOVE, from: null }, { ...MOVE, to: "  " },
                     { ...MOVE, to: "group" }]) {
    assert.deepEqual(w.r.levelMoved(bad), { ok: true, moved: false }, JSON.stringify(bad));
  }
  assert.deepEqual(tables(), empty, "no row for a call naming no move");
  w.r.levelMoved(MOVE);
  const after = tables();
  const changed = Object.keys(after).filter((t) => after[t] !== empty[t]);
  assert.deepEqual(changed, ["reevaluation_level_moves"], "the level move's row is the only new row");
  const rows = w.rows(`SELECT * FROM reevaluation_level_moves`);
  assert.deepEqual(rows.map((r) => Object.keys(r).sort()),
    [["at", "case_id", "edition", "level_after", "level_before", "move_id", "observation"]]);
  assert.deepEqual([rows[0].observation, rows[0].level_before, rows[0].level_after, rows[0].case_id, rows[0].edition, rows[0].at],
    [OBS, "group", "name", CASE, 2, AT]);
  /* the reads */
  const before = w.snapshot();
  const all = w.r.reevaluations({ viewer: ADMIN });
  w.r.reevaluations({ target: OBS, viewer: ADMIN });
  w.r.changesOf({ findings: [D, W, O], viewer: ADMIN });
  w.r.correctedDependents({ viewer: ADMIN });
  const ann = w.r.reevaluations({ viewer: V("ann") });
  const none = w.r.reevaluations({ viewer: "nobody" });
  const hidden = w.r.changesOf({ findings: [D], viewer: "nobody" });
  assert.deepEqual(w.snapshot(), before, "no table changes across the reads");
  assert.equal(all.count, 2);
  assert.deepEqual(ann.obligations.map((o) => o.bundle_id), [D, W], "a member sees the same record facts");
  assert.deepEqual([none.count, none.out_of_view], [0, undefined], "withheld whole; the untargeted listing states nothing");
  assert.deepEqual(hidden.findings, [{ id: D, absent: true }]);
});

test("R29 R28 R20: a targeted read whose only dependents of a moved observation are out of the viewer's sight withholds them and states out_of_view, and only that", () => {
  const { w } = observed();
  w.member("owen"); w.member("ann");
  w.r.levelMoved(MOVE);
  const Q = w.project("Elsewhere", "ann");
  for (const id of [D, W]) w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, Q, id);
  const r = w.r.reevaluations({ target: OBS, viewer: V("owen") });
  assert.deepEqual([r.count, r.out_of_view], [0, true]);
  assert.ok(!JSON.stringify(r).includes(D) && !JSON.stringify(r).includes(W));
  /* a listing about no one subject states none */
  const l = w.r.reevaluations({ viewer: V("owen") });
  assert.deepEqual([l.count, l.out_of_view], [0, undefined]);
  /* negative control: the one who sees them is given both, and nothing is said withheld */
  const a = w.r.reevaluations({ target: OBS, viewer: V("ann") });
  assert.deepEqual([a.obligations.map((o) => o.bundle_id), a.out_of_view], [[D, W], undefined]);
});

/* R32 (DEC-119 (3); N523): an off-the-record capture's attesting member's credit level moved. OBS's one capture is `a`. */
const CAP = sha("what I saw at the meeting");
const CMOVE = { capture: CAP, from: "group", to: "name", case: CASE, edition: 2, at: AT };

test("R32 R29 R2: a capture's attesting member's level moved gives the attribution cause to each live leg targeting a document whose capture it is (a passage leg and a whole leg), naming the capture and no member; nothing regrades", () => {
  const { w } = observed();
  const m = w.r.levelMoved(CMOVE);
  assert.deepEqual([m.ok, m.moved, m.at, m.dependents], [true, true, AT, 2]);
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => [o.bundle_id, o.target]), [[D, OBS], [W, OBS]], "O rests on another document");
  for (const o of r.obligations) {
    const [c, ...more] = attributed(o);
    assert.equal(more.length, 0, "once per move");
    assert.deepEqual([c.source, c.since, c.ord, c.capture_sha, c.level_before, c.level_after, c.case, c.edition, c.observation],
      ["attribution", AT, 0, CAP, "group", "name", CASE, 2, undefined]);
    assert.match(c.detail, new RegExp(`the member attesting capture ${CAP.slice(0, 12)} moved from group to name in case ${CASE} at edition 2`));
    assert.ok(!/alice|member:/.test(JSON.stringify(c)), "no member is named");
  }
  assert.equal(r.obligations.find((o) => o.bundle_id === D).legs[0].grade, "B", "it never regrades");
  assert.deepEqual(w.r.reevaluations({ target: OBS, viewer: ADMIN }).obligations.map((o) => o.bundle_id), [D, W]);
  /* a move before the dependents' last write raises nothing new */
  const w2 = observed().w;
  w2.r.levelMoved({ ...CMOVE, at: "2026-09-26T00:00:00Z" });
  assert.equal(w2.r.reevaluations({ viewer: ADMIN }).count, 0);
  /* a capture no leg rests on */
  assert.deepEqual(w2.r.levelMoved({ ...CMOVE, capture: "f".repeat(64) }).dependents, 0);
  assert.equal(w2.r.reevaluations({ viewer: ADMIN }).count, 0);
});

test("R32 R8 R18: each capture move keeps one row (the capture, both levels, case, edition, instant; no member) and is told once as kind attribution with the capture as subject; a malformed call, or one naming both an observation and a capture, writes nothing", () => {
  const { w } = observed();
  const tables = () => { const s = w.snapshot(); delete s.sqlite_sequence; return s; };
  const empty = tables();
  for (const bad of [{ ...CMOVE, capture: "not-a-sha" }, { ...CMOVE, capture: "" }, { ...CMOVE, from: null },
                     { ...CMOVE, to: "group" }, { ...CMOVE, observation: OBS }])
    assert.deepEqual(w.r.levelMoved(bad), { ok: true, moved: false }, JSON.stringify(bad));
  assert.deepEqual(tables(), empty);
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => heard.push(e));
  w.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  const m = w.r.levelMoved({ ...CMOVE, capture: CAP.toUpperCase() });
  assert.deepEqual(m.listeners_failed, ["consequences"]);
  const after = tables();
  assert.deepEqual(Object.keys(after).filter((t) => after[t] !== empty[t]), ["reevaluation_capture_level_moves"]);
  const rows = w.rows(`SELECT * FROM reevaluation_capture_level_moves`);
  assert.deepEqual(rows.map((x) => Object.keys(x).sort()),
    [["at", "capture_sha", "case_id", "edition", "level_after", "level_before", "move_id"]]);
  assert.deepEqual([rows[0].capture_sha, rows[0].level_before, rows[0].level_after, rows[0].case_id, rows[0].edition],
    [CAP, "group", "name", CASE, 2]);
  assert.equal(heard.length, 1);
  const [h] = heard;
  assert.deepEqual([h.kind, h.subject, h.source, h.since, h.level_before, h.level_after, h.case, h.edition],
    ["attribution", CAP, "attribution", AT, "group", "name", CASE, 2]);
  assert.deepEqual(h.dependents, [{ bundle_id: D, ord: 0, role: "supports", state: "open" },
                                  { bundle_id: W, ord: 0, role: "supports", state: "open" }]);
  assert.ok(!/alice|member:/.test(JSON.stringify(h)), "no member is named");
  /* a rolled-back caller keeps no row and tells nobody */
  assert.throws(() => w.record.transact(() => { w.r.levelMoved({ ...CMOVE, from: "name", to: "cover" }); throw new Error("undo"); }));
  assert.deepEqual([w.count("reevaluation_capture_level_moves"), heard.length], [1, 1]);
  /* the reads write nothing */
  const before = w.snapshot();
  w.r.reevaluations({ viewer: ADMIN }); w.r.changesOf({ findings: [D, W], viewer: ADMIN });
  assert.deepEqual(w.snapshot(), before);
});

test("R32 R16 R9 R20: changesOf answers a capture move with its target; a recorded re-evaluation closes it until the level moves again; a dependent the viewer may not see is withheld", () => {
  const { w } = observed();
  w.r.levelMoved(CMOVE);
  assert.deepEqual(w.r.changesOf({ findings: [D, O], viewer: ADMIN }).findings.map((f) => [f.id, f.causes.map((c) => [c.source, c.target, c.capture_sha])]),
    [[D, [["attribution", OBS, CAP]]], [O, []]]);
  assert.equal(w.r.recordReevaluation({ dependent: D, target: OBS, source: "attribution", note: "the attestation stands",
                                        author: "alice", viewer: ADMIN }).ok, true);
  assert.deepEqual(w.r.reevaluations({ viewer: ADMIN }).obligations.map((o) => o.bundle_id), [W]);
  w.r.levelMoved({ ...CMOVE, from: "name", to: "project", at: "2026-09-29T00:00:00Z" });
  assert.deepEqual(w.r.reevaluations({ viewer: ADMIN }).obligations.map((o) => o.bundle_id), [D, W], "moved again: owed again");
  assert.equal(w.r.reevaluations({ viewer: "nobody" }).count, 0);
  assert.deepEqual(w.r.changesOf({ findings: [D], viewer: "nobody" }).findings, [{ id: D, absent: true }]);
});
