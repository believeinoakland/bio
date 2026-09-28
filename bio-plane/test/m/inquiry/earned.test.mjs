/* The earned registry (R13, R14) and the read over it, `earnedBasis` (R15), with the rule that nothing gives a leg a
   grade the record did not earn (R32). The record's facts are written by their own modules' writers (provenance's
   receipts and testimony, entities' resolutions, extraction's chain), then the registry is asked. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { legCapped, LEG_BACKFILL_MAX, EARNED_TARGETS_MAX } from "../../../src/inquiry/index.mjs";
import { EARNED_CAPTURE_CEILING, TESTIMONY_GRADE } from "../../../checks/bio-checks.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", C = "INFO-2026-0003-c", D = "INFO-2026-0004-d", E = "INFO-2026-0005-e";
const LAYER = JSON.stringify([{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }]);

test("R13 connection: the strongest A–C resolution of the target's captures to the subject; a D resolution earns nothing; each with why", () => {
  const w = world(); w.entity("ENT-2026-0001", "The Board");
  const [a1, a2] = w.doc(A, ["one", "two"]); const [b1] = w.doc(B);
  w.resolve(a1, A, "r1", "ENT-2026-0001", "C"); w.resolve(a2, A, "r2", "ENT-2026-0001", "B");
  w.resolve(b1, B, "r3", "ENT-2026-0001", "D");
  const r = w.k.earned("ENT-2026-0001", [A, B]);
  assert.equal(r.subject_label, "The Board"); assert.equal(r.subject_known, true);
  assert.equal(r.earned.connection[A].grade, "B"); assert.equal(r.earned.connection[A].mode, "value");
  assert.equal(r.earned.connection[A].captures, 2); assert.match(r.earned.connection[A].why, /ENT-2026-0001/);
  assert.equal(r.earned.connection[B], undefined, "a D resolution earns nothing");
  assert.deepEqual(w.k.earned(null, [A]).earned.connection, {}, "no subject, no connection grade");
});

test("R13 capture: the ceiling bounded by the capture's route (N82) and by text-chain's bound; undetermined stated, never absent", () => {
  const w = world();
  w.doc(A);                                   /* direct receipt: the ceiling */
  w.doc(B, ["b"], { via: "archive.org" });    /* archive replay: one rank below */
  w.doc(C, ["c"], { via: null });             /* no route recorded: the ceiling, as the most an author may state */
  w.doc(D, ["d"], { via: "carrier-pigeon" }); /* a via no ruling grades: undetermined */
  const [e1] = w.doc(E);                      /* a transcription with no measured fidelity: undetermined */
  w.st.sql.exec(`INSERT INTO reading_text_source (capture_sha, bundle_id, transcribed, steps, chain) VALUES (?, ?, 1, 1, ?)`, e1, E, LAYER);
  const cap = w.k.earned(null, [A, B, C, D, E, "INFO-2026-0099-none"]).earned.capture;
  assert.equal(cap[A].grade, EARNED_CAPTURE_CEILING); assert.equal(cap[A].mode, "ceiling"); assert.ok(cap[A].why && cap[A].ceiling);
  assert.equal(cap[B].grade, "C"); assert.equal(cap[B].bounded_by, "CAPTURE_BOUNDED_BY_ROUTE");
  assert.equal(cap[C].grade, EARNED_CAPTURE_CEILING);
  assert.equal(cap[D].grade, null); assert.equal(cap[D].undetermined_because, "CAPTURE_GRADE_VIA_UNRULED");
  assert.equal(cap[E].grade, null); assert.equal(cap[E].undetermined_because, "CAPTURE_FIDELITY_UNMEASURED");
  assert.ok(cap[E].empty_level && cap[E].determined === false);
  assert.equal(cap["INFO-2026-0099-none"], undefined, "no bytes held: no entry");
});

test("R13 testimony: a member's authored observation earns TESTIMONY_GRADE on its own axis, its capture axis not applicable", () => {
  const w = world(); w.member("alice");
  const t = w.prov.testify({ words: "I saw the vote.", observedAt: "2026-09-26", title: "Seen", author: V("alice") });
  assert.equal(t.ok, true, JSON.stringify(t).slice(0, 300));
  const r = w.k.earned(null, [t.bundle_id]);
  assert.equal(r.earned.testimony[t.bundle_id].grade, TESTIMONY_GRADE);
  assert.equal(r.earned.capture[t.bundle_id].grade, null);
  assert.equal(r.earned.capture[t.bundle_id].undetermined_because, "CAPTURE_AXIS_AUTHORED");
  assert.equal(w.k.earned(null, [A]).earned.testimony, undefined, "no observation asked about, no testimony key");
});

test("R13 with content ids the answer adds each row's standing; without, it is unchanged", () => {
  const w = world(); w.doc(A);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  const cid = w.row(`SELECT content_id FROM inquiry_basis`).content_id;
  const plain = w.k.earned(null, [A]);
  assert.equal(plain.earned.content, undefined);
  const withRows = w.k.earned(null, [A], [cid]);
  assert.ok(withRows.earned.content && withRows.earned.content[cid], JSON.stringify(withRows.earned).slice(0, 300));
  assert.deepEqual(withRows.earned.capture, plain.earned.capture);
  const doc = w.k.earnedForDoc({ subject_entity: null }, [{ target: A }]);
  assert.deepEqual(doc.earned.capture, plain.earned.capture, "earnedForDoc reads the document's subject and legs");
});

test("R14 legCapped: null within the earned grade, else the earned grade and why; an undetermined ceiling a null grade with the reason", () => {
  const ceiling = { mode: "ceiling", grade: "B", why: "held" };
  assert.equal(legCapped("B", ceiling, A), null);
  assert.equal(legCapped("C", ceiling, A), null);
  const capped = legCapped("A", ceiling, A);
  assert.equal(capped.grade, "B"); assert.match(capped.why, /no more than B/);
  const und = legCapped("C", { mode: "ceiling", grade: null, why: "unmeasured" }, A);
  assert.deepEqual(und, { grade: null, why: "unmeasured" });
  assert.equal(legCapped("A", null, A), null, "no entry: nothing to bound by");
  assert.equal(legCapped("A", { mode: "value", grade: "B" }, A), null);
});

test("R15 earnedBasis refusals: NO_ID, NO_SUCH_BUNDLE (absent or invisible alike), NOT_AN_INQUIRY", () => {
  const w = world(); w.doc(A);
  assert.equal(w.k.earnedBasis({}).reason, "NO_ID");
  assert.equal(w.k.earnedBasis({ id: "INQ-2026-0099-x", viewer: "admin" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.k.earnedBasis({ id: A, viewer: "admin" }).reason, "NOT_AN_INQUIRY");
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  assert.equal(w.k.earnedBasis({ id: "INQ-2026-0001-q", viewer: null }).reason, "NO_SUCH_BUNDLE", "an absent viewer fails closed");
});

test("R15 earnedBasis: at most 200 targets; each leg with its content row (backfilled, bounded) and which capture it rests on", () => {
  const w = world(); const [a1] = w.doc(A); w.doc(B, ["b1", "b2"]);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }, { target: B }, { target: "INQ-2026-0002-r" }] .slice(0, 2) });
  const many = Array.from({ length: 250 }, (_, i) => `INFO-2026-${String(i).padStart(4, "0")}-x`).join(",");
  const capped = w.k.earnedBasis({ id: "INQ-2026-0001-q", targets: many, viewer: "admin" });
  assert.ok(capped.asked.length <= EARNED_TARGETS_MAX);
  /* drop the projected content ids: a leg promoted before the column existed is backfilled on first read */
  w.st.sql.exec(`UPDATE inquiry_basis SET content_id=NULL`);
  const r = w.k.earnedBasis({ id: "INQ-2026-0001-q", viewer: "admin" });
  assert.equal(r.ok, true);
  assert.deepEqual(r.asked, [A, B]);
  assert.ok(r.legs.every((l) => /^[0-9a-f]{64}$/.test(l.content_id) && l.backfilled), JSON.stringify(r.legs));
  assert.deepEqual(r.legs[0].version, { state: "only_capture", capture: a1 });
  assert.equal(r.legs[1].version.state, "undetermined"); assert.equal(r.legs[1].version.captures_held, 2);
  assert.equal(LEG_BACKFILL_MAX, 50);
});

test("R15 R32 the backfill bound is stated; an inquiry leg names its null; an ungraded leg is inert and named, never given a grade", () => {
  const w = world(); w.doc(A);
  w.inquiry("INQ-2026-0002-r", { legs: [{ target: A }] });
  const legs = [{ target: "INQ-2026-0002-r" }, ...Array.from({ length: LEG_BACKFILL_MAX + 1 }, () => ({ target: A }))];
  w.inquiry("INQ-2026-0001-q", { legs });
  w.st.sql.exec(`UPDATE inquiry_basis SET content_id=NULL WHERE bundle_id='INQ-2026-0001-q'`);
  const r = w.k.earnedBasis({ id: "INQ-2026-0001-q", viewer: "admin" });
  assert.equal(r.backfill_truncated, true);
  assert.equal(r.legs[0].null_case, "INQUIRY_TARGET");
  assert.equal(r.legs.at(-1).null_case, "NOT_YET_RESOLVED");
  const projected = w.k.basisFor("INQ-2026-0001-q").legs;
  assert.ok(projected.every((l) => l.grade === null && l.grade_axis === null), "R32: nothing here gives an ungraded leg a grade");
  assert.equal(projected.length, legs.length, "every ungraded leg is named");
});

test("R15 R33 an inquiry the viewer may not see answers exactly as an absent one", () => {
  const w = world(); w.member("alice"); w.member("bob");
  const P = w.project("Hidden work", "alice");
  assert.deepEqual(w.k.earnedBasis({ id: P, viewer: V("bob") }), w.k.earnedBasis({ id: "INQ-2026-0098-none", viewer: V("bob") })
    .reason === "NO_SUCH_BUNDLE" ? { ok: false, reason: "NO_SUCH_BUNDLE", target: P } : null);
});
