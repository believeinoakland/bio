/* consequences R9: a member records each part addressed or not, with evidence; overall `addressed` holds only when
   every live part is addressed, across every mix of states, the empty case included (K172). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";

const S = "STD-2026-0001-law";
const DOC = "INFO-2026-0001-doc";
const INQ = "INQ-2026-0001-cause";

function setup() {
  const w = world();
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.cid = w.figure(DOC, "Restored 100");
  w.inquiryAt(INQ, "open", { target: DOC });
  w.inquiryAt(INQ, "concluded", { target: DOC, prior: "open" });
  w.part = (over = {}) => {
    const r = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "f" },
      period: { from: "2026-01-01", to: "2026-12-31" }, measure: { unit: "money", value: 10 }, basis: { rationale: "r" },
      causation: INQ, author: V("alice"), ...over });
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.id;
  };
  w.mark = (id, state = "addressed", evidence = [w.cid]) =>
    w.c.addressedRecord({ id, state, evidence, reason: "the fund was restored", author: V("alice") });
  w.overall = () => w.c.addressed({ determination: w.D, viewer: V("alice") });
  return w;
}

test("R9: addressedRecord's refusals, with a negative control", () => {
  const w = setup();
  const id = w.part();
  const cases = [
    ["MACHINE_CANNOT_ADDRESS", { author: MACHINE }], ["MACHINE_CANNOT_ADDRESS", { author: "" }],
    ["NO_SUCH_PART", { id: "CONS-2026-0999-fund" }], ["NO_SUCH_PART", { author: V("bob") }],
    ["NOT_A_PARTICIPANT", { author: V("carol") }],
    ["ADDRESSED_UNKNOWN_STATE", { state: "partly" }],
    ["NO_REASON", { reason: " " }],
    ["ADDRESSED_NO_EVIDENCE", { evidence: [] }], ["ADDRESSED_NO_EVIDENCE", { evidence: null }],
    ["NO_SUCH_EVIDENCE", { evidence: ["INQ-2026-0099-none"] }],
  ];
  const good = { id, state: "addressed", evidence: [w.cid], reason: "restored", author: V("alice") };
  for (const [code, over] of cases) {
    const before = w.snapshot();
    const r = w.c.addressedRecord({ ...good, ...over });
    assert.equal(r.reason, code, `${code} ${JSON.stringify(r)}`);
    assert.ok(r.check && r.translation, "a refusal carries its row");
    assert.deepEqual(w.snapshot(), before);
  }
  const ok = w.c.addressedRecord(good);
  assert.equal(ok.ok, true);
  assert.deepEqual([ok.state, ok.evidence, ok.by], ["addressed", [w.cid], V("alice")]);
  /* not_addressed needs no evidence; a finding is evidence too. */
  assert.equal(w.c.addressedRecord({ ...good, state: "not_addressed", evidence: [] }).ok, true);
  assert.equal(w.c.addressedRecord({ ...good, evidence: [INQ] }).ok, true);
  /* A revised part is addressed on its successor. */
  const rev = w.c.consequenceRevise({ id, reason: "corrected", author: V("alice") });
  assert.equal(w.c.addressedRecord({ ...good }).reason, "ALREADY_SUPERSEDED");
  assert.equal(w.c.addressedRecord({ ...good, id: rev.id }).ok, true);
});

test("R9: overall addressed across every mix of states; the latest record per part wins", () => {
  const w = setup();
  /* No live part: undetermined, "no consequence recorded", never addressed (K172). */
  assert.deepEqual([w.overall().state, w.overall().why], ["undetermined", "no consequence recorded"]);
  const p1 = w.part();
  assert.equal(w.overall().state, "not_addressed", "never assessed is not addressed");
  assert.equal(w.overall().parts[0].addressed, "never_assessed");
  w.mark(p1);
  assert.equal(w.overall().state, "addressed");
  const p2 = w.part();
  assert.equal(w.overall().state, "not_addressed", "one part never assessed");
  w.mark(p2, "not_addressed", []);
  assert.equal(w.overall().state, "not_addressed", "partial redress does not end it");
  w.mark(p2);
  assert.equal(w.overall().state, "addressed", "the latest record per part wins");
  w.mark(p1, "not_addressed", []);
  assert.equal(w.overall().state, "not_addressed");
  w.mark(p1);
  /* Any undetermined part makes it undetermined, addressed or not, and over a part not addressed. */
  const u = w.part({ measure: null, basis: null });
  assert.equal(w.overall().state, "undetermined");
  w.mark(u);
  assert.equal(w.overall().state, "undetermined", "an undetermined part cannot be known addressed");
  w.c.consequenceRevise({ id: u, measure: { unit: "money", value: 5 }, basis: { rationale: "now assessed" }, reason: "assessed",
                          author: V("alice") });
  assert.equal(w.overall().state, "not_addressed", "its successor is live and never assessed");
  const live = w.overall().parts.find((p) => p.addressed === "never_assessed");
  w.mark(live.id);
  assert.equal(w.overall().state, "addressed");
  /* Any unproven part makes it undetermined, even when addressed (built literally, K249 (3)). */
  const un = w.part({ causation: null });
  w.mark(un);
  assert.equal(w.overall().state, "undetermined");
  assert.match(w.overall().why, new RegExp(un));
  /* The empty case of K172's route, literally: an assessed "no consequence" part, addressed, is still unproven. */
  const E = w.determination("CONF-2026-0002-none", w.P, { [S]: "noncompliant" });
  const zero = w.c.consequenceRecord({ determination: E, standard: S, affected: { kind: "other", description: "no consequence" },
    period: { from: "2026-01-01", to: "2026-01-31" }, measure: { unit: "count", value: 0 },
    basis: { rationale: "the group judges the breach had no consequence" }, author: V("alice") });
  w.mark(zero.id);
  assert.equal(w.c.addressed({ determination: E, viewer: V("alice") }).state, "undetermined");
  /* Only once a concluded inquiry is named does it read addressed. */
  const zc = w.c.consequenceRevise({ id: zero.id, causation: INQ, reason: "the inquiry concluded", author: V("alice") });
  w.mark(zc.id);
  assert.equal(w.c.addressed({ determination: E, viewer: V("alice") }).state, "addressed");
});

test("R9: addressedRecord is accepted on a superseded determination's parts, and addressed reads them (escalation R14)", () => {
  const w = setup();
  const p = w.part();
  w.determinations.get(w.D).superseded_by = "CONF-2026-0002-next";
  assert.equal(w.mark(p).ok, true);
  const o = w.overall();
  assert.deepEqual([o.state, o.parts.map((x) => x.id)], ["addressed", [p]]);
  assert.equal(w.c.addressed({ determination: "CONF-2026-0099-x", viewer: V("alice") }).reason, "NO_SUCH_DETERMINATION");
});
