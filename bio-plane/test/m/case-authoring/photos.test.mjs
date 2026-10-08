/* case-authoring (T37; N757; DEC-180 (3), (4); K2206): a marked photo in the document, carried by its copy (R14), and
   the ceremony's Photos step (R34), over the real case-disclosures (its R6, R7, R29) with case-carriage's `photoMarks`
   (its R10) a stand-in at its interface: each capture's marks state is the test's to set. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS } from "../../../src/case-authoring/index.mjs";
import { materialsOf } from "../../../src/case-grammar/index.mjs";
import { OBSCURED_LABEL } from "../../../src/case-carriage/index.mjs";
import { PHOTO_NOT_COVERABLE_WORDS } from "../../../src/case-disclosures/materials.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const COPY = "f".repeat(64);
const AREA = { mark: 1, areas: [{ rect: [0, 0, 10, 10], kind: "person" }], by: "alice", at: "2026-09-27T00:00:00.000Z" };
const NONE = { mark: 1, areas: [], by: "alice", at: "2026-09-27T00:00:00.000Z" };
const ANSWERS = {
  marked: { state: "marked", marks: [AREA], copy: { sha256: COPY, covered: 1, width: 10, height: 10 }, refused: null },
  unchecked: { state: "unchecked", marks: [], copy: null, refused: null },
  nothing: { state: "nothing_to_obscure", marks: [NONE], copy: null, refused: null },
  refused: { state: "marked", marks: [AREA], copy: null, refused: { code: "FORMAT_NOT_COVERABLE", detail: "HEIC" } },
};
const ratified = (real) => new Proxy(real, { get: (t, p) => (p === "caseRatifyPreflight"
  ? () => ({ ok: true, ready: true, refusals: [] }) : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });

/* Q rests on DOC and DOC2, Q2 on DOC3. `states` maps a capture's digest to its marks answer, "unread" to a read that
   throws; any other capture is answered not a photo, as case-carriage answers a capture that is not an image. */
function setup({ states = {}, extra = [] } = {}) {
  const shas = {};
  const caseCarriage = { photoMarks: ({ captureSha }) => {
    const s = states[Object.keys(shas).find((k) => shas[k] === captureSha)];
    if (s === "unread") throw new Error("the marks table could not be read");
    return s ? { ok: true, capture: captureSha, photo: true, ...ANSWERS[s] } : { ok: true, capture: captureSha, photo: false };
  } };
  const w = world({ deps: { caseCarriage }, ratification: ratified });
  w.member("alice");
  shas[DOC] = w.doc(DOC); shas[DOC2] = w.doc(DOC2); shas[DOC3] = w.doc(DOC3);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  w.finding(Q2, [{ target: DOC3 }]);
  const P = w.project("Team", "alice", [Q, Q2], { extra });
  return { w, P, shas };
}
const docOf = (w, r) => w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text;
const args = (P, targets, roles) => ({ project: P, targets, viewer: V("alice"), author: "alice", scope: "s",
  statement: "It does not cover the amendments.", subjectPosition: "not_sought", subjectJustification: "A public record.",
  biasAcknowledgement: "We read the minutes as the account.", excluded: [], tieAttested: true,
  roles: roles || Object.fromEntries(targets.map((t) => [t, "load_bearing"])) });
function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation]);
}

test("R14: a marked photo is stated as carried by its copy — its materials: row included: false with obscured: {copy, label}, the copy's SHA-256 and case-carriage's OBSCURED_LABEL — and the document stores it unsigned; an unchecked photo, one with nothing to obscure and a capture that is no photo travel whole with obscured null", () => {
  const { w, P, shas } = setup({ states: { [DOC]: "marked", [DOC2]: "unchecked", [DOC3]: "nothing" } });
  const r = w.ca.publishCase(args(P, [Q, Q2]));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const rows = Object.fromEntries(materialsOf(w.fm(docOf(w, r))).materials.map((m) => [m.ref, m]));
  assert.deepEqual([rows[DOC].sha, rows[DOC].included, rows[DOC].obscured], [shas[DOC], false, { copy: COPY, label: OBSCURED_LABEL }]);
  for (const d of [DOC2, DOC3]) assert.deepEqual([rows[d].included, rows[d].obscured], [true, null], d);
  assert.equal(w.row(`SELECT sig_armored FROM case_documents WHERE case_id=?`, r.caseId).sig_armored, null, "stored unsigned");
  /* negative control: with no photo at all, every row travels whole */
  const plain = setup();
  const p = plain.w.ca.publishCase(args(plain.P, [Q, Q2]));
  assert.deepEqual(materialsOf(plain.w.fm(docOf(plain.w, p))).materials.map((m) => [m.included, m.obscured]),
    [[true, null], [true, null], [true, null]]);
});

test("R34: steps gains photos after \"what you are leaving out\" — case-disclosures R29's answer over the materials op=publish judged, each photo with its state, marks, copy and words, unchecked counted — and an unchecked photo is never among blockers: the pre-flight is ready; it writes nothing", () => {
  const { w, P, shas } = setup({ states: { [DOC]: "marked", [DOC2]: "unchecked", [DOC3]: "unchecked" } });
  const before = w.snapshot();
  const pre = w.ca.publishPreflight(args(P, [Q, Q2], { [Q]: "load_bearing", [Q2]: "supporting" }));
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.deepEqual(pre.steps.map((s) => s.name), ["what becomes permanent", "what this rests on", "what you are leaving out",
    "photos", "the edition this creates", "sign"]);
  const step = pre.steps[3];
  assert.equal(step.step, 4);
  assert.deepEqual(step.photos.map((p) => [p.ref, p.sha, p.state, p.copy, p.words, p.relied_on_by]), [
    [DOC, shas[DOC], "marked", COPY, OBSCURED_LABEL, [{ target: Q, role: "load_bearing" }]],
    [DOC2, shas[DOC2], "unchecked", null, null, [{ target: Q, role: "load_bearing" }]],
    [DOC3, shas[DOC3], "unchecked", null, null, [{ target: Q2, role: "supporting" }]]]);
  assert.deepEqual(step.photos[0].marks, [AREA]);
  assert.equal(step.unchecked, 2);
  assert.deepEqual([pre.ready, pre.first, pre.blockers], [true, null, []], "an unchecked photo blocks nothing");
  /* no photo reached: the step is stated, empty */
  const plain = setup();
  const none = plain.w.ca.publishPreflight(args(plain.P, [Q]));
  assert.deepEqual([none.steps[3].photos, none.steps[3].unchecked], [[], 0]);
  /* the members refused first: the step says it was not reached, never filled */
  const no = w.ca.publishPreflight({ ...args(P, [Q]), roles: {} });
  assert.match(no.steps[3].stated, /^not reached/);
});

test("R34: case-disclosures R6's PHOTO_NOT_COVERABLE (C-120.17) is op=publish's refusal, answered first by the pre-flight exactly, and among blockers when op=publish refuses earlier; the step names the photo with R29's words; nothing is written", () => {
  const { w, P, shas } = setup({ states: { [DOC]: "refused" } });
  const before = w.snapshot();
  const pub = w.ca.publishCase(args(P, [Q]));
  refused(pub, "PHOTO_NOT_COVERABLE");
  assert.deepEqual(pub.not_coverable, [{ target: Q, materials: [{ ref: DOC, sha: shas[DOC], refused: "FORMAT_NOT_COVERABLE" }] }]);
  const pre = w.ca.publishPreflight(args(P, [Q]));
  assert.deepEqual([pre.first, pre.ready, pre.blockers], [pub, false, []]);
  assert.deepEqual(pre.steps[3].photos.map((p) => [p.ref, p.state, p.words, p.refused]),
    [[DOC, "marked", PHOTO_NOT_COVERABLE_WORDS, { code: "FORMAT_NOT_COVERABLE", detail: "HEIC" }]]);
  assert.deepEqual(w.snapshot(), before);
  /* op=publish refuses earlier (the bar): the photo's refusal is among blockers */
  const low = setup({ states: { [DOC]: "refused" }, extra: ["required_strength:", "  capture: A"] });
  const early = low.w.ca.publishPreflight(args(low.P, [Q]));
  assert.equal(early.first.reason, "BELOW_PROJECT_STRENGTH");
  assert.deepEqual(early.blockers.filter((b) => b.reason === "PHOTO_NOT_COVERABLE").length, 1);
  /* negative control: a supporting member only reaches it, and it is no blocker */
  const sup = setup({ states: { [DOC3]: "refused" } });
  const ok = sup.w.ca.publishPreflight(args(sup.P, [Q, Q2], { [Q]: "load_bearing", [Q2]: "supporting" }));
  assert.deepEqual([ok.first, ok.blockers, ok.ready], [null, [], true]);
});

test("R34: case-disclosures R6's PHOTO_MARKS_UNDETERMINED (C-120.18) — marks that cannot be read — is op=publish's refusal, answered first by the pre-flight exactly and among blockers when op=publish refuses earlier; the step lists the photo unread; it fails closed and writes nothing", () => {
  const { w, P, shas } = setup({ states: { [DOC]: "unread" } });
  const before = w.snapshot();
  const pub = w.ca.publishCase(args(P, [Q]));
  refused(pub, "PHOTO_MARKS_UNDETERMINED");
  assert.deepEqual(pub.undetermined.map((u) => [u.ref, u.sha, u.members]), [[DOC, shas[DOC], [Q]]]);
  const pre = w.ca.publishPreflight(args(P, [Q]));
  assert.deepEqual([pre.first, pre.ready, pre.blockers], [pub, false, []]);
  assert.deepEqual(pre.steps[3].photos.map((p) => [p.ref, p.state, p.unread]), [[DOC, null, true]]);
  assert.deepEqual(w.snapshot(), before);
  const low = setup({ states: { [DOC]: "unread" }, extra: ["required_strength:", "  capture: A"] });
  const early = low.w.ca.publishPreflight(args(low.P, [Q]));
  assert.equal(early.first.reason, "BELOW_PROJECT_STRENGTH");
  assert.deepEqual(early.blockers.filter((b) => b.reason === "PHOTO_MARKS_UNDETERMINED").length, 1);
});
