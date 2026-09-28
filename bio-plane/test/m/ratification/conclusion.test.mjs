/* ratification R1: the case-conclusion comparison. `caseConclusionFor` answers, for one project and one question,
   whether the question is concluded for that relationship, and when it is not, why — one arm per `why`, with the other
   projects that concluded it, bounded. `editionsRecordingConclusion` answers which editions pinning a finding record the
   same conclusion, the rows compared through the one writer (`caseConclusionRowLines`) and the one parser. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseMd, V } from "./fixture.mjs";
import { caseConclusionRowLines, fmSafe } from "../../../src/ratification/index.mjs";

const P = "PROJ-2026-0001-team", Q = "INQ-2026-0001-q", OTHER = "PROJ-2026-0002-other";
const OWN = { version: "first", claim: "the council approved it", falsifier: "the minutes say otherwise",
              falsifier_override: null, by: "member:alice", at: "2026-09-27T10:00:00Z" };

function setup() {
  const w = world();
  w.bv.drawing.set(Q, Object.assign([{ id: P }, { id: OTHER }], { bound: 32, truncated: false }));
  return w;
}

test("R1: the project's own conclusion answers concluded, relationship project, with its reading, claim, falsifier and author", () => {
  const w = setup();
  w.bv.conc.set(w.key(P, Q), OWN);
  const c = w.r.caseConclusionFor(P, Q, V("alice"), "open");
  assert.deepEqual([c.state, c.relationship, c.project, c.inquiry, c.version], ["concluded", "project", P, Q, "first"]);
  assert.deepEqual(c.claim, { state: "adopted", text: OWN.claim, version: "first", detail: null });
  assert.deepEqual([c.falsifier, c.falsifier_override, c.by, c.at], [OWN.falsifier, null, OWN.by, OWN.at]);
  for (const s of ["open", "surfaced", "concluded"]) assert.equal(w.r.caseConclusionFor(P, Q, V("alice"), s).state, "concluded", s);
});

test("R1: with no project entry the question's own conclusion answers concluded, relationship no_project", () => {
  const w = setup();
  w.bv.np.set(Q, { claim: { state: "adopted", text: "it was approved", version: "v1" }, falsifier: "f",
                   relationship_detail: "concluded in its own bytes" });
  for (const pid of [P, "", null]) {
    const c = w.r.caseConclusionFor(pid, Q, V("alice"), "concluded");
    assert.deepEqual([c.state, c.relationship, c.project, c.version, c.detail],
      ["concluded", "no_project", null, "v1", "concluded in its own bytes"], String(pid));
    assert.deepEqual(c.claim, { state: "adopted", text: "it was approved", version: "v1", detail: null });
  }
  w.bv.np.set(Q, { claim: { state: "undetermined", detail: "the reading moved" }, relationship_detail: "d" });
  const u = w.r.caseConclusionFor(P, Q, V("alice"), "open");
  assert.deepEqual(u.claim, { state: "undetermined", text: null, version: null, detail: "the reading moved" });
});

test("R1: not_concluded names why — one arm per why, and a project conclusion wins over the question's own", () => {
  const w = setup();
  const why = (pid, state = "open") => w.r.caseConclusionFor(pid, Q, V("alice"), state).why;
  assert.equal(why(P), "project_has_never_concluded");
  assert.equal(why(""), "no_project_named");
  assert.equal(why(null), "no_project_named");
  w.bv.rec.set(w.key(P, Q), { history: [{}, {}], stance: { act: "withdrawn", version: "first", at: "t" } });
  assert.equal(why(P), "project_withdrew_its_conclusion");
  w.bv.rec.set(w.key(P, Q), { history: [{}], stance: { act: "retracted-by-a-later-plane", version: null, at: "t" } });
  assert.equal(why(P), "project_stance_undetermined");
  w.bv.conc.set(w.key(P, Q), OWN);
  for (const s of ["deferred", "dismissed", "divided", "draft", null, undefined])
    assert.equal(w.r.caseConclusionFor(P, Q, V("alice"), s).why, "question_not_case_bearing", String(s));
  const nc = w.r.caseConclusionFor(P, Q, V("alice"), "deferred");
  assert.deepEqual([nc.state, nc.inquiry_state, nc.concluded_elsewhere], ["not_concluded", "deferred", []]);
  assert.deepEqual(nc.claim, { state: "undetermined", text: null, version: null, detail: null });
  w.bv.np.set(Q, { claim: { state: "adopted", text: "t", version: "v" }, relationship_detail: "d" });
  assert.equal(w.r.caseConclusionFor(P, Q, V("alice"), "open").relationship, "project", "the project arm is asked first");
});

test("R1: another project's conclusion is reported beside, never as this project's, with the bound of the projects read", () => {
  const w = setup();
  w.bv.conc.set(w.key(OTHER, Q), { version: "theirs", at: "2026-09-26T00:00:00Z" });
  w.bv.rec.set(w.key(P, Q), { history: [], stance: null });
  const c = w.r.caseConclusionFor(P, Q, V("alice"), "open");
  assert.equal(c.state, "not_concluded");
  assert.deepEqual(c.concluded_elsewhere, [{ project: OTHER, version: "theirs", at: "2026-09-26T00:00:00Z" }]);
  assert.deepEqual([c.concluded_elsewhere_bounds.projects_bound, c.concluded_elsewhere_bounds.projects_truncated], [32, false]);
  assert.match(c.concluded_elsewhere_bounds.detail, /ABSENCE over a truncated/);
  w.bv.drawing.set(Q, Object.assign([{ id: P }], { bound: 32, truncated: true }));
  assert.equal(w.r.caseConclusionFor(P, Q, V("alice"), "open").concluded_elsewhere_bounds.projects_truncated, true);
});

/* ---- editionsRecordingConclusion ---- */

const M = "INQ-2026-0002-member";
const PIN = "a".repeat(64);
const concluded = { state: "concluded", relationship: "project", project: P, version: "first",
                    claim: { state: "adopted", text: "the council approved it" }, falsifier: "f",
                    falsifier_override: null, by: "member:alice", at: "2026-09-27T10:00:00Z" };
const doc = (w, caseId, edition, conclusions) => w.caseDoc(caseId, edition, caseMd({
  caseId, edition, project: P, members: [{ id: M, pin: PIN }], conclusions, rowLines: caseConclusionRowLines }));

test("R1: an edition recording the same project conclusion is `same`; any field of the entry moved is not", () => {
  const w = setup();
  doc(w, "CASE-2026-0001", 1, [[M, concluded]]);
  const rel = { pinned: [{ case_id: "CASE-2026-0001", edition: 1 }] };
  const r = w.r.editionsRecordingConclusion(M, rel, concluded);
  assert.deepEqual(r.same.map((e) => [e.case_id, e.edition, e.state]), [["CASE-2026-0001", 1, "ratified"]]);
  assert.deepEqual(r.pinned[0].recorded, { relationship: "project", project: P, version: "first", claim_state: "adopted",
    claim: "the council approved it", concluded_by: "member:alice", concluded_at: "2026-09-27T10:00:00Z" });
  for (const moved of [{ version: "second" }, { claim: { state: "adopted", text: "another claim" } }, { falsifier: "g" },
                       { by: "member:bo" }, { at: "2026-09-28T00:00:00Z" }, { project: OTHER },
                       { falsifier_override: { by: "member:bo", at: "t" } }, { relationship: "no_project" }])
    assert.deepEqual(w.r.editionsRecordingConclusion(M, rel, { ...concluded, ...moved }).same, [], JSON.stringify(moved));
});

test("R1: for the no-project relationship the pin is the comparison — an edition recording no_project or nothing is `same`", () => {
  const w = setup();
  const np = { state: "concluded", relationship: "no_project", project: null, version: "v1",
               claim: { state: "adopted", text: "t" }, falsifier: "f" };
  doc(w, "CASE-2026-0001", 1, [[M, { ...np, version: "an older reading" }]]);
  doc(w, "CASE-2026-0002", 1, []);
  doc(w, "CASE-2026-0003", 1, [[M, concluded]]);
  const rel = { pinned: [1, 2, 3].map((i) => ({ case_id: `CASE-2026-000${i}`, edition: 1 })) };
  const r = w.r.editionsRecordingConclusion(M, rel, np);
  assert.deepEqual(r.same.map((e) => e.case_id), ["CASE-2026-0001", "CASE-2026-0002"]);
  assert.equal(r.pinned[1].recorded, null, "an edition that recorded nothing is summarised as null");
  assert.equal(w.r.editionsRecordingConclusion(M, rel, concluded).same.map((e) => e.case_id).join(), "CASE-2026-0003");
});

test("R1: the prepared edition is asked beside the ratified ones; an edition with no document records nothing", () => {
  const w = setup();
  doc(w, "CASE-2026-0004", 2, [[M, concluded]]);
  const r = w.r.editionsRecordingConclusion(M, { pinned: [{ case_id: "CASE-2026-0404", edition: 1 }],
                                                 prepared: { case_id: "CASE-2026-0004", edition: 2 } }, concluded);
  assert.deepEqual(r.pinned.map((e) => [e.case_id, e.state, e.same]),
    [["CASE-2026-0404", "ratified", false], ["CASE-2026-0004", "prepared", true]]);
  assert.deepEqual(w.r.editionsRecordingConclusion(M, null, concluded), { same: [], pinned: [] });
  assert.deepEqual(w.r.editionsRecordingConclusion(M, { pinned: [] }, null).same, []);
});

test("R1: caseConclusionRowLines is the one writer of a row, and fmSafe keeps a derived string inside the grammar", () => {
  const lines = caseConclusionRowLines(M, { ...concluded, claim: { state: "adopted", text: 'a "quoted"\nclaim\\' } });
  assert.equal(lines[0], `  - target: ${M}`);
  assert.equal(lines.find((l) => l.includes("claim:") && !l.includes("_")), `    claim: "a 'quoted' claim'"`);
  assert.deepEqual(caseConclusionRowLines(M, null).slice(1, 3), ["    relationship: null", "    project: null"]);
  assert.equal(fmSafe("a\r\nb\"c\\"), "a b'c'");
  assert.equal(fmSafe(null), "");
});
