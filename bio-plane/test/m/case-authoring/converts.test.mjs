/* case-authoring: the shares of the legacy suites converted in T18 (`build/jobs/T17/legacy-tests.md`): `casesign`,
   `grounds`, `d84-case-manifest`, `d442-publish-writes-nothing`, `caseproduction`, `publish` (and `reviewcopy`'s, in
   statement.test.mjs). Each proves at `publishCase`'s interface what only the legacy suite drove: the document's reader
   prose and headings (R14), a grouped member's frozen grounds (R14), the manifest with no lens (R14, R15), the searched
   section counted once (R17), the answer's `next` (R15). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED } from "./fixture.mjs";
import { searchedSection } from "../../../src/case-authoring/index.mjs";
import { CASE_DOCUMENT_FORMAT } from "../../../src/publication/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c", DOC4 = "INFO-2026-0004-d";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const docOf = (w, r) => w.row(`SELECT * FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition);
const bodyOf = (text) => text.slice(text.indexOf("\n---\n", 4) + 5);
const GROUNDS = ["grounds:", "  - ground: charter", "    asserted_by: alice", '    at: "2026-09-27T00:00:00Z"',
                 "  - ground: code", "    asserted_by: alice", '    at: "2026-09-27T00:00:00Z"'];

function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  for (const d of [DOC, DOC2, DOC3, DOC4]) w.doc(d);
  return w;
}

test("R14 (casesign): the document a person reviews states every authored sentence under its canonical headings — Scope, Findings In This Case with each member's role and pin, What This Excludes, Bias Acknowledgement, Standard Of Evidence, What Was Searched — says which half of the roster claims what, and prints an undeclared bar as absent, never zero", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC, grade: "D", grade_axis: "connection", grade_source: "testimony" }]);
  w.finding(Q2, [{ target: DOC, grade: "D", grade_axis: "connection", grade_source: "testimony" }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  const excluded = [{ target: DOC2, description: "the comparison memo", reason: "a records request is outstanding" }];
  const r = w.publish(P, "alice", [Q, Q2], { excluded, subjectPosition: "sought_and_answered",
                                              roles: { [Q]: "load_bearing", [Q2]: "supporting" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const text = docOf(w, r).text, fm = w.fm(text), body = bodyOf(text);
  assert.equal(fm.format, CASE_DOCUMENT_FORMAT);
  assert.deepEqual(fm.case_findings, [Q, Q2]);
  assert.deepEqual(fm.case_roles.map((x) => [x.target, x.role, x.version_sha]),
    [[Q, "load_bearing", w.head(Q)], [Q2, "supporting", w.head(Q2)]]);
  for (const s of [AUTHORED.scope, AUTHORED.statement, AUTHORED.subjectJustification, AUTHORED.biasAcknowledgement,
                   "the comparison memo", "a records request is outstanding"])
    assert.ok(body.includes(s), `the body prints: ${s}`);
  for (const h of ["## Scope", "## Findings In This Case", "## What This Excludes", "## Bias Acknowledgement",
                   "## Standard Of Evidence", "## What Was Searched"])
    assert.match(body, new RegExp(`^${h}$`, "m"), h);
  assert.match(body, /A LOAD-BEARING finding is one this case rests on/);
  assert.match(body, /A SUPPORTING finding travels with the case and is not presented as carrying it/);
  assert.deepEqual([/NO STANDARD OF EVIDENCE WAS DECLARED/.test(body), /An absent bar is not a bar of zero/.test(body),
                    fm.required_strength.declared], [true, true, false]);
  assert.deepEqual([typeof fm.searched, fm.searched.subject_source], ["object", "case_basis"]);
});

test("R17 (casesign): members whose legs name no capture the record holds make every level partial, never searched or empty, and the section's unidentified is the largest any one level could not resolve, counted once, not once per level", () => {
  const w = world(); w.member("alice");
  /* a question leg names no content: an unresolvable referent at every level */
  w.finding(Q, [{ target: Q2 }]);
  const P = w.project("Team", "alice", [Q]);
  const r = w.publish(P, "alice", [Q]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const fm = w.fm(docOf(w, r).text);
  assert.deepEqual(fm.searched_levels.map((l) => l.outcome), ["partial", "partial", "partial"]);
  assert.ok(fm.searched_levels.every((l) => l.unidentified >= 1));
  assert.equal(fm.searched.unidentified, Math.max(...fm.searched_levels.map((l) => l.unidentified)));
  /* the section itself: three levels of two each is two, never six */
  const s = searchedSection({ at: "t", subjectSource: "case_basis", levels: ["document", "content", "meaning"].map((level) =>
    ({ level, subject_kind: level === "document" ? "address" : "capture", subjects: [], unidentified: 2 })) });
  assert.deepEqual([s.levels.map((l) => l.outcome), s.summary.unidentified], [["partial", "partial", "partial"], 2]);
});

test("R15 (casesign): the answer's next names op=caseratify, the case's signature, before op=ratify, each member's", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC }]); w.finding(Q2, [{ target: DOC2 }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  for (const targets of [[Q], [Q, Q2]]) {
    const r = w.publish(P, "alice", targets, { newCase: true });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.ok(r.next.includes("op=caseratify") && r.next.indexOf("op=caseratify") < r.next.indexOf("op=ratify)"), r.next);
    assert.match(r.next, targets.length === 1 ? /ratify the finding itself \(op=ratify\)/
                                              : /ratify EACH of these 2 findings \(op=ratify\)/);
    w.st.sql.exec(`DELETE FROM case_documents`);
  }
});

test("R14 (grounds): a grouped member's frozen grounds are stated in the case document, one row per ground and axis with its state and grade, and in its prose; an ungrouped member states none; nothing is written on the finding", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC, grade: "C", grade_axis: "capture", grade_source: "capture", ground: "charter" },
                { target: DOC2, grade: "D", grade_axis: "capture", grade_source: "capture", ground: "code" }],
            { lines: GROUNDS });
  w.finding(Q2, [{ target: DOC3, grade: "C", grade_axis: "capture", grade_source: "capture" },
                 { target: DOC4, grade: "D", grade_axis: "capture", grade_source: "capture" }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  const before = [w.head(Q), w.text(Q)];
  const r = w.publish(P, "alice", [Q, Q2]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const text = docOf(w, r).text, fm = w.fm(text);
  const pair = w.strength.strengthOf(Q);
  const want = ["capture", "connection"].flatMap((axis) => pair[axis].grounds.map((g) => [axis, g.ground, g.state, g.grade]));
  assert.equal(want.length, 4, "two grounds on each frozen axis");
  const rows = fm.case_strength_grounds.filter((x) => x.target === Q);
  assert.deepEqual(rows.map((x) => [x.axis, x.ground, x.state, x.grade === "null" ? null : x.grade]), want);
  assert.ok(rows.some((x) => x.axis === "capture" && x.ground === "charter" && x.state === "graded" && x.grade === "C"));
  assert.ok(rows.some((x) => x.axis === "capture" && x.ground === "code" && x.state === "graded" && x.grade === "D"));
  assert.deepEqual(fm.case_strength_grounds.filter((x) => x.target === Q2), [], "an ungrouped member states none");
  assert.ok(bodyOf(text).includes("  - capture, group 'charter': grade C"));
  assert.deepEqual([w.head(Q), w.text(Q)], before);
  assert.equal(/strength_grounds/.test(w.text(Q)), false, "none in the finding");
});

test("R14, R15 (d84-case-manifest): with no lens adopted the manifest is stated not in force — in the front matter, the answer and the body's Bias Manifest section — never blank; with a lens in force its pairs and hash are named in prose", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  const r = w.publish(P, "alice", [Q]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const text = docOf(w, r).text, fm = w.fm(text);
  assert.deepEqual([fm.bias_manifest.in_force, fm.bias_manifest.stated, fm.bias_manifest.statements_sha, fm.bias_manifest.scope,
                    fm.bias_manifest.scope_id, fm.bias_manifest_bundles],
    [false, "no manifest was in force", null, "project", P, []]);
  assert.match(text, /^## Bias Manifest$/m);
  assert.ok(text.includes(`NO MANIFEST WAS IN FORCE for ${P}`));
  assert.deepEqual([r.bias_manifest.in_force, r.bias_manifest.stated], [false, "no manifest was in force"]);
  assert.deepEqual([typeof fm.bias_acknowledgement, /^## Bias Acknowledgement$/m.test(text), fm.completeness.acknowledged,
                    fm.completeness_acknowledgements], ["string", true, 0, []]);
  /* in force: each pair and the hash, as the lens stood at the act */
  const lens = { in_force: true, statements_sha: "f".repeat(64), lock_violations: [], pins_proposed: [],
                 bundles: [{ bundle_id: "BIAS-2026-0001-i", revision: "a".repeat(64), scope: "instance" },
                           { bundle_id: "BIAS-2026-0002-p", revision: "b".repeat(64), scope: "project" }] };
  const x = world({ deps: { bias: { biasManifest: () => lens } } });
  x.member("alice"); x.doc(DOC); x.finding(Q, [{ target: DOC }]);
  const on = x.publish(x.project("Team", "alice", [Q]), "alice", [Q]);
  const ot = docOf(x, on).text, ofm = x.fm(ot);
  assert.deepEqual(ofm.bias_manifest_bundles.map((b) => [b.bundle_id, b.revision, b.scope]),
    lens.bundles.map((b) => [b.bundle_id, b.revision, b.scope]));
  for (const s of [`- BIAS-2026-0001-i (instance) at revision ${"a".repeat(64)}`,
                   `- BIAS-2026-0002-p (project) at revision ${"b".repeat(64)}`,
                   `Hash of the effective statement set: ${"f".repeat(64)}.`])
    assert.ok(ot.includes(s), s);
});

test("R14, R13 (d442-publish-writes-nothing): a second project's new case over bytes another case pins states the member at that pin with its own edition, its frozen pair exactly as the answer gives it, both exclusions, the sections What This Excludes and What Each Finding Reached, and a receipt naming the pin and the publishing project; nothing is written on the finding", () => {
  const w = setup();
  w.finding(Q, [{ target: DOC, grade: "C", grade_axis: "capture", grade_source: "capture" }]);
  const A = w.project("A", "alice", [Q]);
  const B = w.project("B", "bo", [Q]);
  const excluded = [{ description: "the side letter", reason: "not in hand" },
                    { target: DOC2, description: "the memo", reason: "withheld" }];
  const a = w.publish(A, "alice", [Q], { excluded }); w.ratify(a);
  const PIN = a.findings[0].bundleSha, textQ = w.text(Q);
  assert.equal(w.publication.commitEdition({ bundleId: Q, edition: 1, bundleSha: PIN, title: "q", attestorKey: "k",
    gateVersion: "1.37.0", sigArmored: "s-q-1", shas: [], edges: [], at: "2026-09-28T02:00:00Z" }).ok, true);
  const b = w.publish(B, "bo", [Q], { excluded, newCase: true });
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 300));
  assert.deepEqual([w.head(Q), w.text(Q)], [PIN, textQ], "nothing written on the finding");
  const text = docOf(w, b).text, fm = w.fm(text), body = bodyOf(text);
  const row = fm.case_roles.find((x) => x.target === Q);
  assert.deepEqual([fm.format, row.role, row.version_sha, row.edition], [CASE_DOCUMENT_FORMAT, "load_bearing", PIN, 1]);
  const s = fm.case_strength.filter((x) => x.target === Q);
  assert.deepEqual(s.map((x) => x.axis).sort(), ["capture", "connection"]);
  assert.deepEqual(s.map((x) => ({ axis: x.axis, state: x.state, grade: x.grade === "null" ? null : x.grade,
                                   weakest: x.weakest === "null" ? null : x.weakest })), b.findings[0].strength);
  assert.deepEqual([Array.isArray(fm.case_strength_grounds), typeof fm.completeness.statement, fm.completeness_excluded.length],
    [true, "string", 2]);
  assert.match(body, /^## What This Excludes$/m);
  assert.match(body, /^## What Each Finding Reached, As Read For This Case$/m);
  const log = body.split("## Session Log")[1].split("\n");
  assert.ok(log.some((l) => l.includes(Q) && l.includes(PIN) && /edition 1\b/.test(l)), "the receipt names the pin and edition");
  assert.ok(body.includes(`Published by: ${B}`));
});
