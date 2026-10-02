/* The testimony axis and the inherited leg, at inquiry's interface: the leg grammar at the write (a promotion through
   the real promotion, inquiry's check registered with it), the earned registry, and the grammar's public functions.
   Converts inquiry's share of three old suites (build/jobs/T17/legacy-tests.md):
     - test/testify.test.mjs: R4/R6 a leg with a capture letter on an observation refused with its detail; R13 the
       observation's capture entry (captures 0, authored 1); R7 D-598's own-grade legs (published evidence keeps its
       own grade, a published inquiry does not).
     - test/testimonyaxis.test.mjs: R4/R6 every named testimony C-2.8 code (testimony-grade-not-d,
       testimony-leg-capture-graded x12, testimony-axis-not-authored, testimony-axis-source, testimony-axis-no-referent,
       testimony-axis-unconfirmable) with the over-strictness arms; R13 an attestation raises nothing, the empty level;
       R7 inheriting from an edition that froze no testimony axis.
     - test/audit-inheritance.test.mjs: R7 a correctly inherited leg reads clean, an own grade on a case published
       after the leg was written is C-21.2 with its detail, an ungraded leg is inert.
   The shares of provenance, strength, ratification and extraction in those suites, and the one legacy-store held, are not here. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V } from "./fixture.mjs";
import { checkInquiryBasis, checkInquiryEntry } from "../../../src/inquiry/index.mjs";
import { EARNED_CAPTURE_CEILING, TESTIMONY_GRADE, BASIS_GRADES } from "../../../src/record-grammar/index.mjs";

const WORDS = "On 10 September at the Clerk's counter I watched the deputy clerk stamp the amended "
            + "contract RECEIVED before the council had voted on it. I was the next person in line.";
const OBSERVED = "2026-09-10";
const UP = "INFO-2026-5302-upload";

/* An inquiry whose legs may carry `target_edition` (the fixture's builder does not write it). */
const legDoc = (id, legs) => inquiryMd(id, {
  refs: [...new Set(legs.map((l) => l.target))].map((t) => ({ target: t })),
  extra: legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role || "supports"}`,
    ...(l.grade ? [`    grade: ${l.grade}`] : []), ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
    ...(l.source ? [`    grade_source: ${l.source}`] : []), ...(l.author ? [`    author: ${l.author}`] : []),
    ...(l.date ? [`    date: ${l.date}`] : []), ...(l.edition !== undefined ? [`    target_edition: ${l.edition}`] : [])])] : [] });
const codes = (r) => (r && Array.isArray(r.findings) ? r.findings : []).filter((x) => x.check === "C-2.8").map((x) => x.code ?? null);
const refusedBy = (r, code) => [r.ok, r.reason, codes(r).includes(code)];
const REFUSED = [false, "BASIS_REFUSED", true];
const errs = (fn) => { const f = []; fn(f); return f.filter((x) => x.severity === "error"); };

/* ruth's observation, sam's in identical words (a second testimony), and an ordinary document fetched directly. */
function testimonyWorld(opts = {}) {
  const w = world(opts); w.member("ruth"); w.member("sam");
  const tx = w.prov.testify({ words: WORDS, observedAt: OBSERVED, title: "Stamped before the vote", author: V("ruth") });
  const tx2 = w.prov.testify({ words: WORDS, observedAt: OBSERVED, title: "Stamped before the vote", author: V("sam") });
  assert.equal(tx.ok, true, JSON.stringify(tx).slice(0, 300));
  assert.equal(tx2.ok, true, JSON.stringify(tx2).slice(0, 300));
  assert.notEqual(tx.bundle_id, tx2.bundle_id, "two members, identical words, two observations");
  w.doc(UP);
  return { w, OBS: tx.bundle_id, OBS2: tx2.bundle_id, capSha: tx.capture_sha };
}
const leg = (w, id, l) => w.promote(id, legDoc(id, [l]), null);

/* ------------------------------------------------------------------------------------------------ R13 the registry */

test("R13 an observation earns testimony D in value mode and no capture letter (captures 0, authored 1, CAPTURE_AXIS_AUTHORED, its empty level naming the testimony axis); an ordinary document earns the ceiling and no testimony", () => {
  const { w, OBS } = testimonyWorld();
  const r = w.k.earned(null, [OBS, UP]);
  assert.deepEqual(Object.keys(r.earned).sort(), ["capture", "connection", "testimony"], "asked about an observation: a testimony map beside the others");
  const t = r.earned.testimony[OBS];
  assert.deepEqual([t.grade, t.mode, t.authored, typeof t.why], [TESTIMONY_GRADE, "value", 1, "string"]);
  const c = r.earned.capture[OBS];
  assert.deepEqual([c.grade, c.determined, c.undetermined_because, c.captures, c.authored, typeof c.why],
                   [null, false, "CAPTURE_AXIS_AUTHORED", 0, 1, "string"]);
  assert.match(c.empty_level, /on the testimony axis at D/);
  assert.equal(r.earned.connection[OBS], undefined, "the connection axis earns nothing for the observation");
  /* the contrast: the ordinary document */
  assert.equal(r.earned.testimony[UP], undefined, "an ordinary document earns no testimony entry");
  assert.equal(r.earned.capture[UP].grade, EARNED_CAPTURE_CEILING, "and the ceiling on capture, as before");
  /* over-strictness: asked about no observation, the answer carries the keys it always had */
  assert.deepEqual(Object.keys(w.k.earned(null, [UP]).earned).sort(), ["capture", "connection"]);
});

test("R13 a second member's attestation over the observation raises nothing: the registry still holds testimony D", () => {
  const { w, OBS, capSha } = testimonyWorld();
  /* the nearest act a second member has over another's observation; whatever it answers, the letter does not move */
  w.content.attestText({ captureSha: capSha, member: V("sam"), extent: { kind: "document" }, viewer: "admin",
                         note: "I was there too and saw the same" });
  assert.equal(w.k.earned(null, [OBS]).earned.testimony[OBS].grade, TESTIMONY_GRADE);
  const raised = leg(w, "INQ-2026-5302-raised", { target: OBS, grade: "C", axis: "testimony", source: "testimony" });
  assert.deepEqual(refusedBy(raised, "testimony-grade-not-d"), REFUSED, "a leg claiming C because it was attested");
  const still = leg(w, "INQ-2026-5302-stilld", { target: OBS, grade: "D", axis: "testimony", source: "testimony" });
  assert.equal(still.ok, true, JSON.stringify(still).slice(0, 400));
});

/* ------------------------------------------------------------------------------------- R4 R6 the write, by name */

test("R4 R6 a leg on the observation at testimony D (source testimony) is accepted; two observations are two testimonies, each at D", () => {
  const { w, OBS, OBS2 } = testimonyWorld();
  const ok = leg(w, "INQ-2026-5302-ok", { target: OBS, grade: "D", axis: "testimony", source: "testimony" });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  const two = w.promote("INQ-2026-5302-two", legDoc("INQ-2026-5302-two", [
    { target: OBS, grade: "D", axis: "testimony", source: "testimony" },
    { target: OBS2, grade: "D", axis: "testimony", source: "testimony" }]), null);
  assert.equal(two.ok, true, JSON.stringify(two).slice(0, 400));
  assert.deepEqual(w.k.basisFor("INQ-2026-5302-two").legs.map((l) => [l.target_id ?? l.target, l.grade]),
                   [[OBS, "D"], [OBS2, "D"]]);
});

test("R4 R6 any testimony grade other than D (A, B, C) is refused by name, testimony-grade-not-d, and nothing is written", () => {
  const { w, OBS } = testimonyWorld();
  for (const g of BASIS_GRADES.filter((x) => x !== TESTIMONY_GRADE)) {
    const id = `INQ-2026-5302-t${g.toLowerCase()}`;
    assert.deepEqual(refusedBy(leg(w, id, { target: OBS, grade: g, axis: "testimony", source: "testimony" }), "testimony-grade-not-d"),
                     REFUSED, g);
    assert.equal(w.record.head(id), null, `${id}: nothing was written`);
  }
});

test("R4 R6 any capture grade on a leg citing the observation, every letter and every source (12 legs), is refused by name, testimony-leg-capture-graded", () => {
  const { w, OBS } = testimonyWorld();
  const cases = [];
  for (const g of BASIS_GRADES) for (const src of ["capture", "testimony", "hunch"])
    cases.push([g, src, refusedBy(leg(w, `INQ-2026-5302-c${g.toLowerCase()}-${src}`,
      { target: OBS, grade: g, axis: "capture", source: src }), "testimony-leg-capture-graded")]);
  assert.equal(cases.length, 12);
  assert.deepEqual(cases.filter(([, , r]) => JSON.stringify(r) !== JSON.stringify(REFUSED)), [], "none silently accepted");
});

test("R4 R6 the capture-letter refusal says what the document is and where its grade belongs, and sends no one to measure a transcription; the same letter on an ordinary document and an ungraded leg on the observation stand", () => {
  const { w, OBS } = testimonyWorld();
  const r = leg(w, "INQ-2026-5301-legb", { target: OBS, grade: EARNED_CAPTURE_CEILING, axis: "capture", source: "capture" });
  assert.equal(r.reason, "BASIS_REFUSED");
  assert.equal(r.findings.filter((x) => x.check === "C-2.8").length, 1, "one finding for one broken leg");
  const f = r.findings[0];
  assert.equal(f.check, "C-2.8");
  assert.equal(f.code, "testimony-leg-capture-graded");
  assert.equal(Object.hasOwn(f, "translation"), false, "R11 a sub-code of C-2.8 with no catalogue row carries its code alone, never an empty translation");
  assert.match(f.detail, /is a member's authored observation/);
  assert.match(f.detail, /testimony axis/);
  assert.ok(Array.isArray(f.repairs) && f.repairs.length, JSON.stringify(f));
  assert.equal(f.repairs.some((x) => /transcription/.test(x)), false, "no repair sends the member to measure a transcription");
  /* over-strictness */
  const none = leg(w, "INQ-2026-5301-legnone", { target: OBS });
  assert.equal(none.ok, true, `an ungraded leg on the observation is present, not refused: ${JSON.stringify(none).slice(0, 300)}`);
  const up = leg(w, "INQ-2026-5301-legup", { target: UP, grade: EARNED_CAPTURE_CEILING, axis: "capture", source: "capture" });
  assert.equal(up.ok, true, `the same letter on an ordinary document stands: ${JSON.stringify(up).slice(0, 300)}`);
});

test("R4 R6 testimony on a document that is not an observation is testimony-axis-not-authored; from another source testimony-axis-source; on an inquiry leg testimony-axis-no-referent", () => {
  const { w, OBS } = testimonyWorld();
  assert.deepEqual(refusedBy(leg(w, "INQ-2026-5302-onup", { target: UP, grade: "D", axis: "testimony", source: "testimony" }),
                             "testimony-axis-not-authored"), REFUSED);
  for (const src of ["resolution", "hunch", "capture"])
    assert.deepEqual(refusedBy(leg(w, `INQ-2026-5302-s-${src}`, { target: OBS, grade: "D", axis: "testimony", source: src }),
                               "testimony-axis-source"), REFUSED, src);
  w.inquiry("INQ-2026-5302-ok", { legs: [{ target: UP }] });
  assert.deepEqual(refusedBy(leg(w, "INQ-2026-5302-onq", { target: "INQ-2026-5302-ok", grade: "D", axis: "testimony", source: "testimony" }),
                             "testimony-axis-no-referent"), REFUSED);
});

test("R4 R6 over-strictness: a connection-axis grade on the observation is not refused (BOB #15), and an ordinary capture leg stands as before", () => {
  const { w, OBS } = testimonyWorld();
  const conn = leg(w, "INQ-2026-5302-conn", { target: OBS, grade: "D", axis: "connection", source: "testimony" });
  assert.equal(conn.ok, true, JSON.stringify(conn).slice(0, 400));
  const upCap = leg(w, "INQ-2026-5302-upcap", { target: UP, grade: EARNED_CAPTURE_CEILING, axis: "capture", source: "capture" });
  assert.equal(upCap.ok, true, JSON.stringify(upCap).slice(0, 400));
});

test("R4 R6 no registry is not a way through: the pure grammar cannot confirm an observation, testimony-axis-unconfirmable; with the registry the same leg is clean", () => {
  const OBS = "INFO-2026-0001-a";
  const judge = (fm, pub = null, earned = null) => errs((f) => checkInquiryBasis(fm, f, pub, earned)).map((x) => [x.check, x.code ?? null]);
  const l = { target: OBS, role: "supports", grade: "D", grade_axis: "testimony", grade_source: "testimony" };
  const fm = { references: [{ target: OBS, rel: "cites", status: "confirmed" }], basis: [l] };
  assert.deepEqual(judge(fm), [["C-2.8", "testimony-axis-unconfirmable"]]);
  const reg = { earned: { connection: {}, capture: {}, testimony: { [OBS]: { mode: "value", grade: TESTIMONY_GRADE, why: "x" } } } };
  assert.deepEqual(judge(fm, null, reg), []);
  assert.deepEqual(judge(fm, null, { earned: { connection: {}, capture: {}, testimony: {} } }).map(([, c]) => c),
                   ["testimony-axis-not-authored"], "a registry that holds no observation for it: not authored");
});

/* ------------------------------------------------------------------------------------------ R7 the inherited leg */

test("R7 an edition that froze no testimony axis gives nothing to inherit on it (C-21.2, ABSENT); one that froze testimony D is inherited like any other", () => {
  const PUBQ = "INQ-2026-5302-published", OBS = "INFO-2026-0001-a";
  const reg = { earned: { connection: {}, capture: {}, testimony: { [OBS]: { mode: "value", grade: TESTIMONY_GRADE, why: "x" } } } };
  const pubReg = (testimony, objectType = "inquiry") => ({ [PUBQ]: { object_type: objectType, latest: 1, editions: { "1": {
    edition: 1, capture: { state: "unrated", grade: null }, connection: { state: "unrated", grade: null },
    ...(testimony ? { testimony } : {}) } } } });
  const fm = { references: [{ target: PUBQ, rel: "cites", status: "confirmed" }],
               basis: [{ target: PUBQ, role: "supports", grade: "D", grade_axis: "testimony", grade_source: "inherited", target_edition: 1 }] };
  const judge = (pub) => errs((f) => checkInquiryBasis(fm, f, pub, reg));
  const absent = judge(pubReg(null));
  assert.deepEqual(absent.map((x) => x.check), ["C-21.2"]);
  assert.match(absent[0].message, /inherits testimony grade D from INQ-2026-5302-published edition 1, whose testimony axis is ABSENT/);
  assert.deepEqual(judge(pubReg({ state: "graded", grade: TESTIMONY_GRADE })), []);
  /* a registry entry built before the object_type key is held to the inquiry rule, never read as evidence */
  assert.deepEqual(judge(pubReg(null, null)).map((x) => x.check), ["C-21.2"]);
});

test("R7 D-598: a leg with its own grade on a document published as evidence lands; the same leg onto a published inquiry is refused C-21.2 by name, and at nothing else", () => {
  const PLAIN = "INFO-2026-5301-plain", F3 = "INQ-2026-5301-rests-on-plain";
  const F4 = "INQ-2026-5301-second-on-plain", F5 = "INQ-2026-5301-own-grade-on-f3";
  const published = {};
  const w = world({ published });
  w.doc(PLAIN);
  w.inquiry(F3, { legs: [{ target: PLAIN, grade: "D", grade_axis: "connection", grade_source: "testimony" }] });
  /* F3 is published as a finding, PLAIN as its case's evidence (publication's registry, D-598's object_type key) */
  published[F3] = { object_type: "inquiry", latest: 1, editions: { "1": { edition: 1,
    capture: { state: "unrated", grade: null }, connection: { state: "graded", grade: "D" } } } };
  published[PLAIN] = { object_type: "information", latest: 1, editions: { "1": { edition: 1, capture: null, connection: null } } };
  const own = { grade: "D", axis: "connection", source: "testimony" };
  const p4 = leg(w, F4, { target: PLAIN, ...own });
  assert.deepEqual([p4.ok, p4.findings ?? []], [true, []], JSON.stringify(p4).slice(0, 400));
  const p5 = leg(w, F5, { target: F3, ...own });
  assert.deepEqual([p5.ok, p5.reason, p5.findings.map((x) => x.check).sort()], [false, "BASIS_REFUSED", ["C-21.2"]]);
  assert.match(p5.findings[0].detail, new RegExp(`carries a grade of its own on a PUBLISHED case \\(${F3}\\)`));
  assert.equal(w.record.head(F5), null, "nothing was written");
  /* the row's control: evidence recorded with no object_type is held to the inquiry rule, so the same leg is C-21.2 */
  published[PLAIN] = { object_type: null, latest: 1, editions: { "1": { edition: 1, capture: null, connection: null } } };
  const p4b = leg(w, "INQ-2026-5301-third-on-plain", { target: PLAIN, ...own });
  assert.deepEqual([p4b.ok, (p4b.findings || []).map((x) => x.check)], [false, ["C-21.2"]]);
});

test("R7 an inheritance read against the published record: a correct inherited leg reads clean, an own grade written before the case was published is C-21.2 with its detail, an ungraded leg is inert", async () => {
  const CASE = "INQ-2026-1780-case", OWN = "INQ-2026-1780-own-grade", INH = "INQ-2026-1780-inherits", PLAIN = "INQ-2026-1780-plain";
  const INFO_CAP = "INFO-2026-1780-capture-b";
  const published = {};
  const w = world({ published });
  w.doc(INFO_CAP);
  w.inquiry(CASE, { legs: [{ target: INFO_CAP }] });
  /* legal when written: the case beneath is a working inquiry, and a hunch is an authored connection grade */
  const own = w.promote(OWN, legDoc(OWN, [{ target: CASE, grade: "C", axis: "connection", source: "hunch",
                                            author: "member:alice", date: "2026-08-04" }]), null);
  assert.equal(own.ok, true, JSON.stringify(own).slice(0, 400));
  w.inquiry(PLAIN, { legs: [{ target: CASE }] });
  /* the case is published at edition 1, frozen capture B / connection C */
  published[CASE] = { object_type: "inquiry", latest: 1, editions: { "1": { edition: 1,
    capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } } } };
  /* written after: the write reads the published registry and accepts a correct inheritance */
  const inh = w.promote(INH, legDoc(INH, [{ target: CASE, grade: "C", axis: "connection", source: "inherited", edition: 1 }]), null);
  assert.equal(inh.ok, true, JSON.stringify(inh).slice(0, 400));

  /* the reading over the record as it now stands: the catalogue's entry arm and the leg grammar, each with the
     published record and the earned registry */
  const read = async (id, pub) => {
    const fm = w.fm(id);
    const earned = w.k.earnedForDoc(fm, fm.basis || []);
    const entry = (await checkInquiryEntry(w.text(id), { publishedRegistry: pub, earnedRegistry: earned }))
      .filter((x) => x.check === "C-2.8" || x.check === "C-21.2");
    const basis = errs((f) => checkInquiryBasis(fm, f, pub, earned));
    return { entry, basis };
  };
  const all = {};
  for (const id of [INH, OWN, PLAIN]) all[id] = await read(id, published);
  assert.deepEqual(all[INH].entry, [], "the inheriting inquiry reads clean");
  assert.deepEqual(all[INH].basis, []);
  assert.deepEqual(all[PLAIN].entry, [], "an ungraded leg on the published case is inert (DEC-18)");
  assert.deepEqual(all[PLAIN].basis, []);
  assert.deepEqual(all[OWN].entry.map((x) => x.check), ["C-21.2"], "the own grade is C-21.2 by name, and nothing else");
  assert.deepEqual(all[OWN].basis.map((x) => x.check), ["C-21.2"]);
  assert.match(all[OWN].entry[0].message, /carries a grade of its own on a PUBLISHED case \(INQ-2026-1780-case\)/);
  const every = Object.values(all).flatMap((r) => r.entry);
  assert.deepEqual([every.filter((x) => x.check === "C-21.2").length, every.filter((x) => x.check === "C-2.8").length], [1, 0],
                   "one C-21.2 over the three and no C-2.8");
  assert.equal(every.filter((x) => /cannot be checked against the published record here/.test(x.message)).length, 0,
               "no finding reads the published-record blindness sentence");
  /* the same own grade is refused at the write now that the case is published */
  const again = w.promote(OWN, legDoc(OWN, [{ target: CASE, grade: "C", axis: "connection", source: "hunch",
                                              author: "member:alice", date: "2026-08-05" }]));
  assert.deepEqual([again.ok, again.reason, (again.findings || []).map((x) => x.check)], [false, "BASIS_REFUSED", ["C-21.2"]]);

  /* the controls. Blind (no registry): the inherited leg reads the blindness sentence and the own grade is never looked at */
  const blind = { inh: await read(INH, null), own: await read(OWN, null) };
  assert.deepEqual(blind.inh.basis.map((x) => x.check), ["C-2.8"]);
  assert.match(blind.inh.basis[0].message, /cannot be checked against the published record here/);
  assert.deepEqual(blind.own.basis, [], "blind, the own grade on a published case is not seen");
  /* the liar, an empty registry: it enables nothing */
  const liar = { inh: await read(INH, {}), own: await read(OWN, {}) };
  assert.deepEqual(liar.inh.basis.map((x) => x.check), ["C-2.8"]);
  assert.match(liar.inh.basis[0].message, /is not a published case/);
  assert.deepEqual(liar.own.basis, []);
  /* over the frozen strength: an inherited grade stronger than the edition's is C-21.2, an edition not held is C-21.2 */
  const over = errs((f) => checkInquiryBasis({ ...w.fm(INH), basis: [{ ...w.fm(INH).basis[0], grade: "B" }] }, f, published, null));
  assert.deepEqual(over.map((x) => x.check), ["C-21.2"]);
  assert.match(over[0].message, /whose frozen connection strength is C/);
  const ed9 = errs((f) => checkInquiryBasis({ ...w.fm(INH), basis: [{ ...w.fm(INH).basis[0], target_edition: 9 }] }, f, published, null));
  assert.deepEqual(ed9.map((x) => x.check), ["C-21.2"]);
  assert.match(ed9[0].message, /names edition 9 of INQ-2026-1780-case, which is not in the published record \(published editions: 1\)/);
});
