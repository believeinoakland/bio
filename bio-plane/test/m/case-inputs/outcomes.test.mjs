/* case-inputs R9 (was case-authoring R71's service, withdrawal, list and purge clauses; T45; N855 (6c); Actions D5,
   D6c; v0.2 §3 Success record, rule 17): outcomes carried into a case's next edition by a member's act (`carryOutcome`,
   the service `consequences` R22 calls), withdrawn with a reason, listed behind R1's member door, and pending until a
   ratified edition's signed document holds them (`pendingOutcomes`, which case-authoring R74 reads). Copied from
   case-authoring's outcomes.test.mjs; its arms that run inside publishCase stay there (R74). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, DEAD } from "./fixture.mjs";
import { outcomesOf } from "../../../src/case-grammar/index.mjs";
import { CARRIED_OUTCOME_CHECKS, OUTCOME_KINDS, CARRIED_TEXT_MAX, CARRY_REASON_MAX, fillWords }
  from "../../../src/case-inputs/index.mjs";

const Q = "INQ-2026-0001-q";
const CITES = [{ kind: "finding", ref: Q }];
const OUTCOME = { kind: "success", text: "The council published the amended minutes.", cites: CITES, on: "2026-09-20" };

function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy", "di"]) w.member(m);
  const P = w.project("Team", "alice");
  w.join(P, "bo");
  w.join(P, "cy", "invited");
  const caseId = w.ratifiedCase(P, "alice");
  return { w, P, caseId };
}
function refused(r, code, extra = {}) {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
    [false, code, code, CARRIED_OUTCOME_CHECKS[code].check, CARRIED_OUTCOME_CHECKS[code].translation], JSON.stringify(r).slice(0, 300));
  for (const [k, v] of Object.entries(extra)) assert.deepEqual(r[k], v);
}
/* R17: C-136.5 answers its sentence with the field filled */
function badField(r, field) {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.field, r.translation],
    [false, "BAD_CARRIED_OUTCOME", "BAD_CARRIED_OUTCOME", "C-136.5", field, fillWords("refusal.BAD_CARRIED_OUTCOME", { field })],
    JSON.stringify(r).slice(0, 300));
}
/* The next edition of `caseId` prepared as op=publish prepares it (case-authoring R74): every pending outcome written. */
const prepareNext = (w, P, caseId, edition, statement = `It does not cover the later amendments, edition ${edition}.`) =>
  w.prepare(P, "alice", { caseId, edition, statement, outcomes: w.ci.pendingOutcomes(caseId) });

test("R9: the six refusals are rows of this module's table, C-136.3–C-136.8, each with a translation; the kinds are case-grammar R29's", () => {
  const codes = ["MACHINE_CANNOT_CARRY_OUTCOME", "CARRY_NOT_A_PARTICIPANT", "BAD_CARRIED_OUTCOME", "NO_SUCH_CARRIED_OUTCOME",
                 "CARRIED_OUTCOME_SETTLED", "CARRY_NO_REASON"];
  assert.deepEqual(Object.keys(CARRIED_OUTCOME_CHECKS), codes);
  assert.deepEqual(codes.map((c) => CARRIED_OUTCOME_CHECKS[c].check), ["C-136.3", "C-136.4", "C-136.5", "C-136.6", "C-136.7", "C-136.8"]);
  assert.ok(codes.every((c) => /Nothing was written\.$/.test(CARRIED_OUTCOME_CHECKS[c].translation)));
  assert.deepEqual(OUTCOME_KINDS, ["success", "cure", "harm_addressed"]);
  assert.deepEqual([CARRIED_TEXT_MAX, CARRY_REASON_MAX], [2000, 2000]);
});

test("R9: carryOutcome records one pending outcome of each kind by a joined participant's act and answers {ok: true, outcome}, an opaque id; the list shows it pending, in the order carried, with its cites as case-account R5 shapes them", () => {
  const { w, caseId } = setup();
  const ids = OUTCOME_KINDS.map((kind, i) => {
    w.clock.ms = `2026-09-28T01:00:00.00${i}Z`;
    const r = w.ci.carryOutcome({ case: caseId, ...OUTCOME, kind, text: `${OUTCOME.text} ${i}`, by: i === 1 ? "bo" : "alice" });
    assert.deepEqual(Object.keys(r), ["ok", "outcome"]);
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.match(r.outcome, /^OUTC-2026-\d{4}$/);
    return r.outcome;
  });
  assert.equal(new Set(ids).size, 3);
  const list = w.ci.carriedOutcomesOf({ case: caseId, viewer: V("bo") });
  assert.deepEqual([list.ok, list.case], [true, caseId]);
  assert.deepEqual(list.outcomes.map((o) => [o.outcome, o.kind, o.text, o.cites, o.on, o.carried_by, o.carried_at, o.state]),
    ids.map((id, i) => [id, OUTCOME_KINDS[i], `${OUTCOME.text} ${i}`, [{ kind: "finding", ref: Q, ord: null }], OUTCOME.on,
                        i === 1 ? "bo" : "alice", `2026-09-28T01:00:00.00${i}Z`, "pending"]));
  /* the text is kept trimmed, as the member's statement */
  const t = w.ci.carryOutcome({ case: caseId, ...OUTCOME, text: "  Padded.  ", by: "alice" });
  assert.equal(w.ci.carriedOutcomesOf({ case: caseId, viewer: V("bo") }).outcomes.find((o) => o.outcome === t.outcome).text, "Padded.");
});

test("R9: carryOutcome's refusals, in order, each writing nothing: MACHINE_CANNOT_CARRY_OUTCOME; NO_SUCH_CASE, one answer for a case with no ratified edition and one whose project the member does not see; CARRY_NOT_A_PARTICIPANT; BAD_CARRIED_OUTCOME naming the field", () => {
  const { w, P, caseId } = setup();
  const prepared = w.prepare(P, "alice");
  const before = w.snapshot();
  for (const by of [null, "", "class:daemon"])
    refused(w.ci.carryOutcome({ case: caseId, ...OUTCOME, by }), "MACHINE_CANNOT_CARRY_OUTCOME");
  /* the machine fence first, even over a case that does not exist */
  refused(w.ci.carryOutcome({ case: "CASE-2026-0404", ...OUTCOME, by: "class:daemon" }), "MACHINE_CANNOT_CARRY_OUTCOME");
  const none = w.ci.carryOutcome({ case: "CASE-2026-0404", ...OUTCOME, by: "alice" });
  assert.equal(none.reason, "NO_SUCH_CASE");
  /* prepared but never ratified */
  assert.deepEqual(w.ci.carryOutcome({ case: prepared.caseId, ...OUTCOME, by: "alice" }), none, "one answer");
  /* a project the member does not see in full: the project is hidden (the default) and di is no participant */
  assert.equal(w.membership.sight(P, V("di")), "none");
  assert.deepEqual(w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "di" }), none, "unseen answers as absent");
  /* seen, not joined: an invited member */
  assert.equal(w.membership.sight(P, V("cy")), "full");
  refused(w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "cy" }), "CARRY_NOT_A_PARTICIPANT", { case: caseId });
  /* the participant fence before the shape */
  refused(w.ci.carryOutcome({ case: caseId, ...OUTCOME, kind: "story", by: "cy" }), "CARRY_NOT_A_PARTICIPANT");
  for (const [over, field] of [[{ kind: "story" }, "kind"], [{ kind: undefined }, "kind"],
                               [{ text: "" }, "text"], [{ text: "  " }, "text"], [{ text: 3 }, "text"], [{ text: "x".repeat(2001) }, "text"],
                               [{ text: "\u{1F4DC}".repeat(2001) }, "text"],
                               [{ text: 'she said "yes"' }, "text"], [{ text: "a\\b" }, "text"], [{ text: "a\nb" }, "text"],
                               [{ cites: undefined }, "cites"], [{ cites: "Q" }, "cites"], [{ cites: [{ kind: "story", ref: Q }] }, "cites"],
                               [{ cites: [{ kind: "leg", ref: Q }] }, "cites"],
                               [{ on: null }, "on"], [{ on: "2026-9-20" }, "on"], [{ on: "2026-02-30" }, "on"], [{ on: "2026-13-45" }, "on"]])
    badField(w.ci.carryOutcome({ case: caseId, ...OUTCOME, ...over, by: "alice" }), field);
  assert.deepEqual(w.snapshot(), before, "nothing written by any refusal");
  /* controls: 2,000 characters (astral or not) and an empty cites list are legal */
  assert.equal(w.ci.carryOutcome({ case: caseId, ...OUTCOME, text: "x".repeat(2000), by: "alice" }).ok, true);
  assert.equal(w.ci.carryOutcome({ case: caseId, ...OUTCOME, text: "\u{1F4DC}".repeat(2000), by: "alice" }).ok, true);
  assert.equal(w.ci.carryOutcome({ case: caseId, ...OUTCOME, cites: [], by: "alice" }).ok, true);
});

test("R9: withdrawCarriedOutcome withdraws a pending outcome with the member's reason; refusals in order, each writing nothing: MACHINE_CANNOT_CARRY_OUTCOME, NO_SUCH_CARRIED_OUTCOME (absent or unseen alike), CARRIED_OUTCOME_SETTLED (withdrawn already), CARRY_NO_REASON", () => {
  const { w, caseId } = setup();
  const o = w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  const before = w.snapshot();
  refused(w.ci.withdrawCarriedOutcome({ outcome: o, reason: "wrong", by: "class:daemon" }), "MACHINE_CANNOT_CARRY_OUTCOME");
  refused(w.ci.withdrawCarriedOutcome({ outcome: o, reason: "wrong", by: null }), "MACHINE_CANNOT_CARRY_OUTCOME");
  refused(w.ci.withdrawCarriedOutcome({ outcome: "OUTC-2026-0000", reason: "wrong", by: "alice" }), "NO_SUCH_CARRIED_OUTCOME");
  refused(w.ci.withdrawCarriedOutcome({ outcome: "", reason: "wrong", by: "alice" }), "NO_SUCH_CARRIED_OUTCOME", { outcome: null });
  /* unseen: di does not see the hidden project */
  const unseen = w.ci.withdrawCarriedOutcome({ outcome: o, reason: "wrong", by: "di" });
  refused(unseen, "NO_SUCH_CARRIED_OUTCOME");
  assert.equal(unseen.detail, w.ci.withdrawCarriedOutcome({ outcome: "OUTC-2026-0000", reason: "wrong", by: "di" }).detail);
  for (const reason of [undefined, "", "   ", 7, "x".repeat(2001), "\u{1F4DC}".repeat(2001)])
    refused(w.ci.withdrawCarriedOutcome({ outcome: o, reason, by: "alice" }), "CARRY_NO_REASON");
  assert.deepEqual(w.snapshot(), before);
  const ok = w.ci.withdrawCarriedOutcome({ outcome: o, reason: "it was the wrong case", by: "bo" });
  assert.deepEqual([ok.ok, ok.outcome, ok.withdrawn.reason, ok.withdrawn.by], [true, o, "it was the wrong case", "bo"]);
  const listed = w.ci.carriedOutcomesOf({ case: caseId, viewer: V("alice") }).outcomes[0];
  assert.deepEqual([listed.state, listed.withdrawal.reason, listed.withdrawal.by], ["withdrawn", "it was the wrong case", "bo"]);
  const again = w.snapshot();
  refused(w.ci.withdrawCarriedOutcome({ outcome: o, reason: "again", by: "alice" }), "CARRIED_OUTCOME_SETTLED", { state: "withdrawn" });
  assert.deepEqual(w.snapshot(), again);
  /* control: a reason of exactly 2,000 code points is legal */
  const p = w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  assert.equal(w.ci.withdrawCarriedOutcome({ outcome: p, reason: "\u{1F4DC}".repeat(2000), by: "alice" }).ok, true);
});

test("R9: carriedOutcomesOf is fenced as R1's member door: a joined participant of the case's project reads it; every other caller, an unknown case included, receives R1's dead answer, byte-identical", () => {
  const { w, caseId } = setup();
  w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" });
  assert.equal(w.ci.carriedOutcomesOf({ case: caseId, viewer: V("alice") }).ok, true);
  for (const [c, viewer] of [[caseId, V("cy")], [caseId, V("di")], [caseId, "class:daemon"], [caseId, null], [caseId, "alice"],
                             ["CASE-2026-0404", V("alice")], [null, V("alice")]])
    assert.deepEqual(w.ci.carriedOutcomesOf({ case: c, viewer }), DEAD);
});

test("R9: pendingOutcomes answers the case's pending outcomes in the order carried, each {outcome, kind, text, cites, on, carried_by, carried_at}, asking no viewer and writing nothing; a withdrawn one is not pending", () => {
  const { w, caseId } = setup();
  const a = w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  const b = w.ci.carryOutcome({ case: caseId, ...OUTCOME, kind: "cure", text: "The clerk corrected the register.", on: "2026-09-21", by: "bo" }).outcome;
  const gone = w.ci.carryOutcome({ case: caseId, ...OUTCOME, kind: "harm_addressed", text: "Withdrawn later.", by: "alice" }).outcome;
  w.ci.withdrawCarriedOutcome({ outcome: gone, reason: "it belongs to another case", by: "alice" });
  const before = w.snapshot();
  const pending = w.ci.pendingOutcomes(caseId);
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
  assert.deepEqual(pending, [
    { outcome: a, kind: "success", text: OUTCOME.text, cites: [{ kind: "finding", ref: Q, ord: null }], on: OUTCOME.on,
      carried_by: "alice", carried_at: w.clock.ms },
    { outcome: b, kind: "cure", text: "The clerk corrected the register.", cites: [{ kind: "finding", ref: Q, ord: null }],
      on: "2026-09-21", carried_by: "bo", carried_at: w.clock.ms }]);
  assert.deepEqual(w.ci.pendingOutcomes("CASE-2026-0404"), [], "a case with none");
});

test("R9 (controls): a replaced preparation leaves an outcome pending, and carries it again; once a ratified edition's signed document holds it, it is carried (with that edition), settled, and pending no longer; the edition after it carries only what no ratified edition carries", () => {
  const { w, P, caseId } = setup();
  const a = w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  const first = prepareNext(w, P, caseId, 2);
  assert.deepEqual(outcomesOf(w.fm(w.docOf(caseId, 2).text)).map((r) => r.outcome), [a]);
  assert.deepEqual(w.ci.pendingOutcomes(caseId).map((o) => o.outcome), [a], "an unsigned preparation carries nothing yet");
  const again = prepareNext(w, P, caseId, 2, "It does not cover the later amendments, prepared again.");
  assert.notEqual(again.doc_sha, first.doc_sha, "the preparation was replaced");
  assert.deepEqual(outcomesOf(w.fm(w.docOf(caseId, 2).text)).map((r) => r.outcome), [a], "the replaced preparation carries it again");
  assert.deepEqual(w.ci.pendingOutcomes(caseId).map((o) => o.outcome), [a]);
  w.ratify(again, P);
  const listed = w.ci.carriedOutcomesOf({ case: caseId, viewer: V("alice") }).outcomes;
  assert.deepEqual([listed[0].state, listed[0].edition], ["carried", 2]);
  assert.deepEqual(w.ci.pendingOutcomes(caseId), [], "carried, not pending");
  refused(w.ci.withdrawCarriedOutcome({ outcome: a, reason: "too late", by: "alice" }), "CARRIED_OUTCOME_SETTLED",
          { state: "carried", edition: 2 });
  /* the edition after it */
  const b = w.ci.carryOutcome({ case: caseId, ...OUTCOME, text: "A second success.", by: "alice" }).outcome;
  prepareNext(w, P, caseId, 3);
  assert.deepEqual(outcomesOf(w.fm(w.docOf(caseId, 3).text)).map((r) => r.outcome), [b], "only what no ratified edition carries");
  /* a signed document that is not ratified (no instant) does not carry it */
  w.st.sql.exec(`UPDATE case_documents SET sig_armored='sig', ratified_at=NULL WHERE case_id=? AND edition=3`, caseId);
  assert.deepEqual(w.ci.pendingOutcomes(caseId).map((o) => o.outcome), [b]);
});

test("R9, R11: the outcomes and their withdrawals are append-only tables of this module, declared whole to record-core's purge as working material: a whole-store purge clears them", () => {
  const { w, caseId } = setup();
  const o = w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  w.ci.withdrawCarriedOutcome({ outcome: o, reason: "wrong", by: "alice" });
  assert.equal(w.count("carried_outcomes"), 1);
  assert.equal(w.count("carried_outcome_withdrawals"), 1);
  const declared = w.record.declaredTables().filter((d) => ["carried_outcomes", "carried_outcome_withdrawals"].includes(d.name));
  assert.deepEqual(declared.map((d) => [d.module, d.name, d.keys, d.purge]),
    [["case-inputs", "carried_outcomes", [], "clear"], ["case-inputs", "carried_outcome_withdrawals", [], "clear"]]);
  w.record.purge();
  assert.deepEqual([w.count("carried_outcomes"), w.count("carried_outcome_withdrawals")], [0, 0]);
});
