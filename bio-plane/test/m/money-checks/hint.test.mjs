/* money-checks R17 (T35-33; DEC-131, K1863, N694): every "Noticed" answer an op relays to a member carries the mark
   "Hint · machine work" beside its label, on each check or item and on the answer that carries them; its words call
   what the machine raised a "hint", never a "signal"; no key, code, kind or field is renamed; a refusal carries none. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, contract, shareDetector, ALICE, ADMIN_BOB } from "./fixture.mjs";
import { HINT_MARK, NOTICED, moneyChecksOps } from "../../../src/money-checks/index.mjs";

/* DEC-131's words, character for character: "Hint", a space, the middle dot U+00B7, a space, "machine work". */
const DEC_131 = "Hint · machine work";
const P = "PROJ-2026-0001-alpha";
const ops = (w, query = {}, body = null) => {
  const url = new URL("https://x/");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return moneyChecksOps(w.c, url, body);
};

/* Every member-facing sentence an answer composes: each `why`, and every string inside a derivation. */
function sentences(v, out = []) {
  if (Array.isArray(v)) v.forEach((x) => sentences(x, out));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      if (k === "why" && typeof x === "string") out.push(x);
      else if (k === "derivation") words(x, out);
      else sentences(x, out);
    }
  return out;
}
function words(v, out) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => words(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => words(x, out));
}
function marked(answer, list) {
  assert.equal(answer.ok, true, JSON.stringify(answer));
  assert.equal(answer.label, NOTICED);
  assert.equal(answer.mark, DEC_131);
  assert.ok(answer[list].length > 0);
  for (const x of answer[list]) { assert.equal(x.label, "Noticed"); assert.equal(x.mark, DEC_131, JSON.stringify(x)); }
  for (const s of sentences(answer)) assert.doesNotMatch(s, /signal/i, s);
}

test("R17: the mark is DEC-131's words exactly, with its middle dot", () => {
  assert.equal(HINT_MARK, DEC_131);
  assert.deepEqual([...HINT_MARK].map((c) => c.codePointAt(0)),
                   [0x48, 0x69, 0x6e, 0x74, 0x20, 0xb7, 0x20, 0x6d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x20, 0x77, 0x6f, 0x72, 0x6b]);
  assert.equal(NOTICED, "Noticed");
});

test("R17: op=moneyamountchecks — the answer and each check carry the mark beside the label 'Noticed', every outcome", () => {
  const w = world();
  w.c.stateParameter({ check: "change_orders_past_share", name: "share", value: "10%", citation: "member's own word", by: ALICE });
  for (const k of [contract(w, { award: "1000", orders: ["300"], paid: ["5000"], adopted: "900" }),   /* holds: true */
                   contract(w, { award: "1000", paid: ["10"], adopted: "1000" }),                    /* holds: false */
                   contract(w, { award: "1000", paid: ["10"] })]) {                                   /* undetermined */
    const r = ops(w, { contract: k.id, viewer: ALICE }).moneyamountchecks();
    assert.deepEqual(r.checks.map((c) => c.check), ["paid_above_committed", "signed_differs_from_award", "change_orders_past_share"]);
    marked(r, "checks");
    assert.ok(r.checks.every((c) => c.kind === "question"));
  }
  /* a check money's summation rule refuses is still a "Noticed" check, so it is marked too */
  const k = contract(w, { award: "1000", paid: ["10"] });
  w.rec({ amount: "5", currency: "EUR", stage: "paid", concerns: [k.id] });
  const r = ops(w, { contract: k.id, viewer: ALICE }).moneyamountchecks();
  assert.ok(r.checks.find((c) => c.check === "paid_above_committed").refused);
  marked(r, "checks");
});

test("R17: op=moneyjunction — the answer and each junction check carry the mark", async () => {
  const w = world();
  const k = contract(w, { award: "1000" });
  const awardCap = w.held("INFO-2026-0101-award", "a".repeat(64)), signedCap = w.held("INFO-2026-0102-signed", "b".repeat(64));
  w.resolution(awardCap, "INFO-2026-0101-award", k.id);
  w.resolution(signedCap, "INFO-2026-0102-signed", k.id);
  w.progressions.defineProgression({ progressionKey: "proc", label: "Procurement", basis: "the group's reading", declaredBy: ALICE,
    stages: [{ key: "award", cardinality: "1", required: "always" }, { key: "signed", after: "award", cardinality: "1", required: "always" }] });
  await w.progressions.threadInstance({ progressionKey: "proc", entityId: k.id, threadedBy: ALICE,
    placements: [{ stageKey: "award", captureSha: awardCap }, { stageKey: "signed", captureSha: signedCap }] });
  const q = { key: "proc", id: k.id, viewer: ALICE };
  marked(ops(w, q).moneyjunction(), "checks");                                     /* nothing stated: undetermined */
  w.rec({ amount: "1000", concerns: [k.id], capture: awardCap });
  w.rec({ amount: "1200", concerns: [k.id], capture: signedCap });
  for (const [name, value] of [["award_stage", "award"], ["signed_stage", "signed"]])
    w.c.stateParameter({ check: "junction_stages", name, value, citation: "our flow", by: ALICE });
  w.c.stateParameter({ check: "change_orders_past_share", name: "share", value: "0.25", citation: "member's own word", by: ALICE });
  const r = ops(w, q).moneyjunction();
  assert.deepEqual(r.checks.map((c) => c.check), ["junction_signed_differs_from_award", "junction_amendments_past_share"]);
  assert.equal(r.checks[0].holds, true);
  marked(r, "checks");
});

test("R17: op=moneynoticed — the answer and each item carry the mark; the item's kind and fields are not renamed", () => {
  const w = world();
  w.project(P, ["alice", "bob"]);
  w.entityAs("ENT-2026-0010", "institution");
  w.entityAs("ENT-2026-0011", "institution");
  w.factAs("MNY-2026-f1", { to: "ENT-2026-0010", amount: "800" });
  w.factAs("MNY-2026-f2", { to: "ENT-2026-0011", amount: "200" });
  const d = w.c.defineDetector(shareDetector());
  w.switchOn(d.detector_id, P);
  w.c.runDetectors({ budgetMs: 10_000 });
  w.c.recordGate({ detectorId: d.detector_id, version: d.version, goldSet: "desk gold set 1", falseAlarmRate: "0.1", by: ADMIN_BOB });
  const r = ops(w, { project: P, viewer: ALICE }).moneynoticed();
  assert.equal(r.items.length, 1);
  marked(r, "items");
  const it = r.items[0];
  assert.equal(it.kind, "signal");
  assert.equal(it.by, "the machine");
  assert.equal(it.layer, "hypothesis");
  for (const f of ["result_id", "detector_id", "version", "detector_label", "subject", "numerator", "denominator", "derivation", "inputs", "gate"])
    assert.ok(f in it, f);
  /* a bounded answer is marked the same */
  const empty = ops(w, { project: P, viewer: ALICE, limit: "1" }).moneynoticed();
  assert.equal(empty.mark, DEC_131);
});

test("R17: an answer that is a refusal carries no mark", () => {
  const w = world();
  const refusals = [ops(w, { contract: "" }).moneyamountchecks(), ops(w, { contract: w.city, viewer: ALICE }).moneyamountchecks(),
                    ops(w, { key: "", id: "ENT-2026-0001" }).moneyjunction(), ops(w, { project: "" }).moneynoticed(),
                    ops(w, { project: "PROJ-2026-0404-none", viewer: ALICE }).moneynoticed(),
                    ops(w, { project: P, limit: "0" }).moneynoticed()];
  for (const r of refusals) {
    assert.equal(r.ok, false, JSON.stringify(r));
    assert.equal("mark" in r, false, JSON.stringify(r));
    assert.equal(JSON.stringify(r).includes(DEC_131), false);
  }
});
