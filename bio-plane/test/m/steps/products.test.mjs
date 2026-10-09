/* steps R9, R18: what a step produced, its looks, provenance read back, and the registrations that keep a step out of
   the evidence. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { derivedId } from "../../../src/connection-grammar/index.mjs";
import { world, ANN, BOB, DAN, CAT, P1, PH, Q, QP1, QH } from "./fixture.mjs";

const SHA = "a".repeat(64), SHA2 = "b".repeat(64);

test("R9: a member ties a record she may see; the in-process door ties what its caller made; productsOf answers only what the viewer sees, uncounted", () => {
  const w = world();
  const id = w.step();
  w.bundle("INFO-2026-0001-doc", { type: "information" });
  w.bundle("INFO-2026-0002-hid", { type: "information", project: PH });
  assert.equal(w.s.stepProduct({ step: id, record: "INFO-2026-0001-doc", by: BOB }).ok, true);
  assert.equal(w.s.stepProduct({ step: id, record: "INFO-2026-0002-hid", by: BOB }).code, "NO_SUCH_PRODUCT", "one she may not see is absent");
  assert.equal(w.s.stepProduct({ step: id, record: "INFO-2026-0099-none", by: BOB }).code, "NO_SUCH_PRODUCT");
  assert.equal(w.s.stepProduct({ step: id, record: SHA, by: BOB }).code, "STEP_BAD_PRODUCT", "a digest names its kind");
  assert.equal(w.s.stepProduct({ step: id, record: { kind: "capture", id: "short" }, by: BOB }).code, "STEP_BAD_PRODUCT");
  /* capture, content and a derived connection, each by its own sight */
  w.capture(SHA, "INFO-2026-0001-doc");
  w.capture(SHA2, "INFO-2026-0002-hid");
  w.passage(SHA, SHA, "INFO-2026-0001-doc");
  assert.equal(w.s.stepProduct({ step: id, record: { kind: "capture", id: SHA }, by: BOB }).ok, true);
  assert.equal(w.s.stepProduct({ step: id, record: { kind: "capture", id: SHA2 }, by: BOB }).code, "NO_SUCH_PRODUCT");
  assert.equal(w.s.stepProduct({ step: id, record: { kind: "content", id: SHA }, by: BOB }).ok, true);
  const derivation = { kind: "mentioned_together", from: "INFO-2026-0001-doc", to: Q, as_of: "2026-10-01", method: "m" };
  assert.equal(w.s.stepProduct({ step: id, record: { kind: "connection", id: SHA, derivation }, by: BOB }).code, "STEP_BAD_PRODUCT", "the id must be the derivation's");
  assert.equal(w.s.stepProduct({ step: id, record: { kind: "connection", id: derivedId(derivation), derivation }, by: BOB }).ok, true);
  /* the in-process door: form only */
  assert.equal(w.s.recordProduct({ step: id, record: { kind: "capture", id: SHA2 }, by: "class:daemon" }).ok, true);
  assert.equal(w.s.recordProduct({ step: id, record: "HYP-2026-0001", by: "class:daemon" }).ok, true);
  assert.equal(w.s.recordProduct({ step: id, record: "nonsense", by: "class:daemon" }).code, "STEP_BAD_PRODUCT");
  /* a look made for the step, logged under authority kind step */
  w.observationLog.observe({ actor_class: "member", actor: ANN, authority_kind: "step", authority: id, level: "internet",
                             subject_kind: "description", subject: "the contract", state: "LOOKED_ABSENT", detail: "not posted" });
  const p = w.s.productsOf({ step: id, viewer: BOB });
  assert.deepEqual(p.products.map((x) => x.kind).sort(), ["capture", "connection", "content", "record"]);
  assert.equal(p.products.some((x) => x.id === SHA2 || x.id === "HYP-2026-0001"), false, "the rest left out, uncounted");
  assert.equal(p.looks.length, 1);
  assert.equal("count" in p || "hidden" in p, false);
  /* a later owner registers sight for its own records */
  w.s.registerProductSight("HYP", "hypotheses", (rid, viewer) => viewer === BOB && rid === "HYP-2026-0001");
  assert.equal(w.s.productsOf({ step: id, viewer: BOB }).products.some((x) => x.id === "HYP-2026-0001"), true);
  assert.equal(w.s.productsOf({ step: id, viewer: ANN }).products.some((x) => x.id === "HYP-2026-0001"), false);
  assert.equal(w.s.productsOf({ step: id, viewer: DAN }).products.length, 4, "Dan sees the step on Q and the four products he may see");
  assert.equal(w.s.productsOf({ step: w.step({ place: { questions: [QP1] } }), viewer: DAN }).code, "NO_SUCH_STEP");
});

test("R9: stepsOf answers the steps that produced a record and their questions; a record no step produced answers none", () => {
  const w = world();
  w.bundle("INFO-2026-0001-doc", { type: "information" });
  const a = w.step(), b = w.step({ place: { questions: [QP1] }, work: "other" });
  w.s.recordProduct({ step: a, record: "INFO-2026-0001-doc", by: "class:daemon" });
  w.s.recordProduct({ step: b, record: "INFO-2026-0001-doc", by: "class:daemon" });
  assert.deepEqual(w.s.stepsOf({ record: "INFO-2026-0001-doc", viewer: ANN }).steps.map((s) => s.step).sort(), [a, b].sort());
  assert.deepEqual(w.s.stepsOf({ record: "INFO-2026-0001-doc", viewer: DAN }).steps.map((s) => [s.step, s.questions]), [[a, [Q]]]);
  assert.deepEqual(w.s.stepsOf({ record: "INFO-2026-0009-other", viewer: ANN }).steps, []);
});

test("R18: the step authority resolver shows a look's row exactly to whoever sees the step; promotion refuses a leg on a step as STEP_NOT_A_LEG inside BASIS_REFUSED", () => {
  const w = world();
  const id = w.step({ place: { questions: [QP1] } });
  w.observationLog.observe({ actor_class: "member", actor: ANN, authority_kind: "step", authority: id, level: "internet",
                             subject_kind: "description", subject: "x", state: "LOOKED_ABSENT", detail: "d" });
  const row = w.rows(`SELECT * FROM observation_log WHERE authority = ?`, id)[0];
  assert.equal(w.observationLog.rowVisible(row, BOB), true);
  assert.equal(w.observationLog.rowVisible(row, DAN), false);
  assert.equal(w.observationLog.rowVisible({ ...row, authority: "STP-2026-zzzzzzzzzzzzzzzz" }, BOB), false, "a step not held withholds the row");
  /* the leg check */
  const refused = w.promote("INQ-2026-0010-a", [{ target: id }]);
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, "BASIS_REFUSED");
  assert.deepEqual(refused.findings.map((f) => f.code), ["STEP_NOT_A_LEG"]);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM bundles WHERE bundle_id = 'INQ-2026-0010-a'`)[0].n, 0);
  /* the negative control: an inquiry with no step leg passes this check */
  assert.equal(w.promote("INQ-2026-0011-b", []).ok, true);
  void CAT; void P1; void QH;
});
