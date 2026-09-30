/* The capture ceiling bounded by transcription fidelity as its weakest link, no third scale (DEC-4; REC-88, D-349): what
   the registry earns for a document whose text a machine derived (R13), the refusal of a leg claiming above it at the
   write (R6), and the leg read against it (R14, R15). Converted from `test/content-capture-bound.test.mjs` (N393, K573):
   the same corpus (four documents whose text has four different provenances, and one the record never read), each
   chain written as a reading through extraction's own projection, receipts through provenance's, legs through a real
   promotion. The old suite's negative-control arms (`nc-rec88.mjs`) and its baseline probe edited source and are
   dropped (P7). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, inquiryMd } from "./fixture.mjs";
import { legCapped } from "../../../src/inquiry/index.mjs";
import { EARNED_CAPTURE_CEILING, BASIS_GRADES } from "../../../checks/bio-checks.mjs";

/* THE CHAINS, each a shape and not an engine: `cap` is a measurement handed in, never a calibration held here. */
const ocrChain = (cap) => [{ step: "pixels" },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" } }];
/* a derivation step carrying no measured cap: the general shape, whatever step kind later carries it */
const unmeasuredChain = () => [{ step: "pixels" },
  { step: "ocr", engine: "moondream", version: "2b", confidence: { basis: "none" } }];

const SUBJECT = "ENT-2026-0001";
const PLAIN = "INFO-2026-8800-plain", OCR_C = "INFO-2026-8800-ocr-c", OCR_A = "INFO-2026-8800-ocr-a",
      UNMEAS = "INFO-2026-8800-unmeasured", NEVER_READ = "INFO-2026-8800-never-read",
      PLAIN_UNROUTED = "INFO-2026-8801-plain-unrouted", MIXED = "INFO-2026-8802-mixed",
      MIXED_UNMEAS = "INFO-2026-8803-mixed-unmeasured";
const DOCS = [PLAIN, OCR_C, OCR_A, UNMEAS];

/* The corpus: each document fetched directly (a measured route, byte grade the ceiling), its capture read with the
   chain named; PLAIN read with no text source (publisher-typed), NEVER_READ never read at all. */
function corpus() {
  const w = world();
  w.entity(SUBJECT, "Sewer Fund Transfer Ordinance");
  w.doc(PLAIN, ["publisher-typed"], { chain: null });
  w.doc(OCR_C, ["ocr at C"], { chain: ocrChain("C") });
  w.doc(OCR_A, ["ocr at A"], { chain: ocrChain("A") });
  w.doc(UNMEAS, ["unmeasured"], { chain: unmeasuredChain() });
  w.doc(NEVER_READ, ["never read"]);
  return w;
}

/* A leg on `target` at `grade` on the capture axis (none: no grade stated), promoted as a fresh inquiry. */
let n = 0;
const legOn = (w, target, grade) => {
  const id = `INQ-2026-88${String(++n).padStart(2, "0")}-leg`;
  return w.promote(id, inquiryMdFor(id, target, grade), null);
};
const inquiryMdFor = (id, target, grade) => inquiryMd(id, { subject: SUBJECT,
  legs: [grade === undefined ? { target } : { target, grade, grade_axis: "capture", grade_source: "capture" }] });

const checks = (r) => [...new Set((r.findings || []).map((f) => f.check).filter(Boolean))].sort();
const details = (r) => (r.findings || []).map((f) => String(f.detail ?? ""));
const repairs = (r) => (r.findings || []).flatMap((f) => f.repairs || []).join(" || ");

test("R13 the corpus: every document holds one capture and the text source extraction projected for it", () => {
  const w = corpus();
  const cap = w.k.earned(SUBJECT, [...DOCS, NEVER_READ]).earned.capture;
  assert.deepEqual([...DOCS, NEVER_READ].map((id) => cap[id] && cap[id].captures), [1, 1, 1, 1, 1],
    "every document of the corpus is present with its one capture: no assertion below runs over an empty corpus");
  const rows = w.extraction.transcribedDocuments({ limit: 100, viewer: "admin" }).documents;
  assert.deepEqual(rows.map((r) => [r.bundle_id, r.transcribed, r.derivation_cap]).sort(),
    [[OCR_A, true, "A"], [OCR_C, true, "C"], [UNMEAS, true, null]].sort(),
    "three text sources for four read documents: a reading with no chain has no row, as a never-read capture has none");
});

test("R13 R15 a document OCR'd at C: the ceiling is C, bounded by fidelity, its why naming both letters and the ceiling above", () => {
  const w = corpus();
  const c = w.k.earned(SUBJECT, [OCR_C]).earned.capture[OCR_C];
  assert.deepEqual([c.mode, c.grade, c.bounded_by], ["ceiling", "C", "CAPTURE_BOUNDED_BY_FIDELITY"]);
  assert.match(c.why, new RegExp(`would be worth ${EARNED_CAPTURE_CEILING}`), "the byte grade it would have been");
  assert.match(c.why, /derivation is measured at C/, "the fidelity that bound it");
  assert.match(c.why, /weakest link of byte provenance and transcription fidelity/, "the doctrine, not only the number");
  assert.match(c.ceiling, new RegExp(`Grade ${BASIS_GRADES[BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING) - 1]} is not reachable`),
    "the ceiling above the byte grade is still stated");
  /* the read at the interface (op=earnedbasis) answers the same entry */
  w.inquiry("INQ-2026-8800-read", { subject: SUBJECT, legs: [{ target: OCR_C }] });
  const eb = w.k.earnedBasis({ id: "INQ-2026-8800-read", viewer: "admin" });
  assert.equal(eb.ok, true);
  assert.deepEqual(eb.earned.capture[OCR_C], c);
});

test("R13 the weakest link both ways: a fidelity measured stronger than the bytes never raises the letter, and gains no bound code", () => {
  const w = corpus();
  const cap = w.k.earned(SUBJECT, [OCR_A, OCR_C]).earned.capture;
  assert.equal(cap[OCR_A].grade, EARNED_CAPTURE_CEILING, "measured at A, bounded by the bytes");
  assert.equal(Object.hasOwn(cap[OCR_A], "bounded_by"), false, "fidelity did not bind, so no code says it did");
  assert.deepEqual([cap[OCR_A].grade, cap[OCR_C].grade], [EARNED_CAPTURE_CEILING, "C"],
    "bytes-weaker gives the byte grade, fidelity-weaker gives the fidelity, from one rule");
});

test("R13 every transcription unmeasured: present with a null grade, undetermined, the empty level named, the capture counted", () => {
  const w = corpus();
  const e = w.k.earned(SUBJECT, [UNMEAS]).earned;
  assert.equal(Object.hasOwn(e.capture, UNMEAS), true, "present: an absent entry would say the record holds no bytes");
  const u = e.capture[UNMEAS];
  assert.deepEqual([u.mode, u.grade, u.determined, u.captures], ["ceiling", null, false, 1]);
  assert.equal(u.undetermined_because, "CAPTURE_FIDELITY_UNMEASURED");
  assert.match(u.empty_level, /transcription fidelity/);
  assert.match(u.empty_level, /measured fidelity/);
  assert.doesNotMatch(u.why, /holds no/, "never worded as bytes not held");
});

test("R13 several captures: one measured transcription determines the ceiling; the strongest capture bounds the document", () => {
  const w = corpus();
  /* one capture unmeasured, one OCR'd at C: not every transcription is unmeasured, so the ceiling is C */
  w.doc(MIXED_UNMEAS, ["m1", "m2"], { chain: (i) => (i === 0 ? unmeasuredChain() : ocrChain("C")) });
  /* one capture OCR'd at C, one publisher-typed: the strongest capture supports the byte grade */
  w.doc(MIXED, ["x1", "x2"], { chain: (i) => (i === 0 ? ocrChain("C") : null) });
  const cap = w.k.earned(SUBJECT, [MIXED_UNMEAS, MIXED]).earned.capture;
  assert.deepEqual([cap[MIXED_UNMEAS].grade, cap[MIXED_UNMEAS].captures, cap[MIXED_UNMEAS].bounded_by],
    ["C", 2, "CAPTURE_BOUNDED_BY_FIDELITY"]);
  assert.deepEqual([cap[MIXED].grade, cap[MIXED].captures], [EARNED_CAPTURE_CEILING, 2]);
});

test("R13 over-strictness: publisher-typed text and a capture never read earn the byte ceiling, gaining no key from the bound", () => {
  const w = corpus();
  w.doc(PLAIN_UNROUTED, ["publisher-typed, no route"], { via: null, chain: null });
  const cap = w.k.earned(SUBJECT, [PLAIN, NEVER_READ, PLAIN_UNROUTED]).earned.capture;
  assert.deepEqual([cap[PLAIN].mode, cap[PLAIN].grade, cap[PLAIN].captures], ["ceiling", EARNED_CAPTURE_CEILING, 1]);
  assert.deepEqual(Object.keys(cap[PLAIN]), ["mode", "grade", "captures", "why", "ceiling"], "no code, no empty level");
  assert.deepEqual([cap[NEVER_READ].grade, cap[NEVER_READ].captures], [EARNED_CAPTURE_CEILING, 1],
    "no chain is not an unmeasured chain");
  assert.deepEqual(Object.keys(cap[NEVER_READ]), Object.keys(cap[PLAIN]));
  /* with no route recorded, only provenance R26's authored statement joins the keys (the old suite's own fixture) */
  assert.deepEqual(Object.keys(cap[PLAIN_UNROUTED]),
    ["mode", "grade", "captures", "why", "ceiling", "stated_as", "route_basis"]);
  assert.deepEqual([cap[PLAIN_UNROUTED].stated_as, cap[PLAIN_UNROUTED].route_basis],
    ["authored", ["CAPTURE_ROUTE_UNRECORDED"]]);
});

test("R13 the census's equivalence: extraction's published `transcribed` and `derivation_cap` recompute the registry's letter for every document", () => {
  const w = corpus();
  const byId = Object.fromEntries(w.extraction.transcribedDocuments({ limit: 100, viewer: "admin" }).documents.map((d) => [d.bundle_id, d]));
  const G = BASIS_GRADES;
  const rule = (row) => (!row || !row.transcribed ? EARNED_CAPTURE_CEILING : row.derivation_cap == null ? null
    : G.indexOf(EARNED_CAPTURE_CEILING) >= G.indexOf(row.derivation_cap) ? EARNED_CAPTURE_CEILING : row.derivation_cap);
  const cap = w.k.earned(SUBJECT, [...DOCS, NEVER_READ]).earned.capture;
  const disagree = [...DOCS, NEVER_READ].map((id) => [id, rule(byId[id]), cap[id] ? cap[id].grade : "ABSENT"])
    .filter(([, a, b]) => a !== b);
  assert.deepEqual(disagree, []);
});

test("R6 the write: a capture grade above the fidelity bound is refused by name, naming both letters and the doctrine; at or under it lands", () => {
  const w = corpus();
  const above = legOn(w, OCR_C, EARNED_CAPTURE_CEILING);
  assert.equal(above.ok, false); assert.equal(above.reason, "BASIS_REFUSED");
  assert.deepEqual(checks(above), ["C-2.8"]);
  assert.ok(details(above).some((d) => /STRONGER than the C/.test(d)), details(above).join(" | "));
  assert.ok(details(above).some((d) => /derivation is measured at C/.test(d)));
  assert.ok(details(above).some((d) => /weakest link of byte provenance and transcription fidelity/.test(d)));
  const at = legOn(w, OCR_C, "C");
  assert.equal(at.ok, true, JSON.stringify(at).slice(0, 400));
  const under = legOn(w, OCR_C, "D");
  assert.equal(under.ok, true, "a weaker letter is the member's own account of a poorer route and stays theirs");
  /* the pair: the letter the read reports is the letter the write accepts, and no stronger */
  const reported = w.k.earned(SUBJECT, [OCR_C]).earned.capture[OCR_C].grade;
  assert.deepEqual([reported, at.ok, above.ok], ["C", true, false]);
});

test("R6 fidelity never raises: a leg claiming the unreachable letter on a document measured at it is still refused", () => {
  const w = corpus();
  const r = legOn(w, OCR_A, BASIS_GRADES[0]);
  assert.equal(r.ok, false); assert.deepEqual(checks(r), ["C-2.8"]);
  assert.equal(legOn(w, OCR_A, EARNED_CAPTURE_CEILING).ok, true);
});

test("R6 R32 an unmeasured transcription: any letter refused for claiming, never for being unmeasured; no grade lands", () => {
  const w = corpus();
  for (const g of BASIS_GRADES) {
    const r = legOn(w, UNMEAS, g);
    assert.equal(r.ok, false, g); assert.deepEqual(checks(r), ["C-2.8"], g);
    assert.ok(details(r).some((d) => new RegExp(`UNDETERMINED, not ${g}`).test(d)), `${g}: ${details(r).join(" | ")}`);
    assert.equal(details(r).filter((d) => /holds no registered capture/.test(d)).length, 0, "never 'no capture held'");
  }
  const r = legOn(w, UNMEAS, EARNED_CAPTURE_CEILING);
  assert.match(repairs(r), /state NO capture grade/, "stating no grade is offered as the way through");
  assert.match(repairs(r), /have the transcription measured/);
  const none = legOn(w, UNMEAS, undefined);
  assert.equal(none.ok, true, JSON.stringify(none).slice(0, 400));
  const legs = w.k.basisFor(none.bundleId).legs;
  assert.deepEqual(legs.map((l) => [l.target_id, l.grade]), [[UNMEAS, null]], "the leg is named, ungraded, and inert");
});

test("R6 over-strictness: a leg claiming the byte ceiling on publisher-typed or never-read text lands as it always has", () => {
  const w = corpus();
  assert.equal(legOn(w, PLAIN, EARNED_CAPTURE_CEILING).ok, true);
  assert.equal(legOn(w, NEVER_READ, EARNED_CAPTURE_CEILING).ok, true);
});

test("R14 legCapped reads a leg against the fidelity-bound entry: capped to C with its why, and undetermined with the reason", () => {
  const w = corpus();
  const cap = w.k.earned(SUBJECT, [OCR_C, UNMEAS]).earned.capture;
  const capped = legCapped(EARNED_CAPTURE_CEILING, cap[OCR_C], OCR_C);
  assert.equal(capped.grade, "C");
  assert.match(capped.why, /no more than C/); assert.match(capped.why, /derivation is measured at C/);
  assert.equal(legCapped("C", cap[OCR_C], OCR_C), null);
  assert.deepEqual(legCapped("D", cap[UNMEAS], UNMEAS), { grade: null, why: cap[UNMEAS].why });
});

test("R15 earnedBasis: an inquiry's legs on the corpus read the bound entries it answers, and a hidden viewer reads nothing", () => {
  const w = corpus(); w.member("alice");
  w.inquiry("INQ-2026-8899-q", { subject: SUBJECT, legs: [{ target: OCR_C, grade: "C", grade_axis: "capture",
    grade_source: "capture" }, { target: UNMEAS }] });
  const eb = w.k.earnedBasis({ id: "INQ-2026-8899-q", viewer: V("alice") });
  assert.equal(eb.ok, true, JSON.stringify(eb).slice(0, 300));
  assert.deepEqual(eb.asked, [OCR_C, UNMEAS]);
  assert.equal(eb.earned.capture[OCR_C].bounded_by, "CAPTURE_BOUNDED_BY_FIDELITY");
  assert.equal(eb.earned.capture[UNMEAS].undetermined_because, "CAPTURE_FIDELITY_UNMEASURED");
  assert.equal(w.k.earnedBasis({ id: "INQ-2026-8899-q", viewer: null }).reason, "NO_SUCH_BUNDLE");
});
