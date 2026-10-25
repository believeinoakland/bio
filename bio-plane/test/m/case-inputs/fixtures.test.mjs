/* The fixtures case-inputs publishes (fixtures.mjs): each called here, and each answer checked against the module's own
   refusal table and the real code it comes from. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { carryOutcome, statementAck } from "./fixtures.mjs";
import { CARRIED_OUTCOME_CHECKS, STATEMENT_ACK_CHECKS, fillWords } from "../../../src/case-inputs/index.mjs";
import { WORDS, DEAD } from "./fixture.mjs";

test("R9: the carryOutcome fixture answers the real NO_SUCH_CASE for a case nothing published holds, BAD_CARRIED_OUTCOME naming the text for a blank one, and {ok: true, outcome} for a joined member's act", () => {
  const f = carryOutcome();
  assert.deepEqual([f.noSuchCase.ok, f.noSuchCase.reason], [false, "NO_SUCH_CASE"], JSON.stringify(f.noSuchCase).slice(0, 300));
  assert.equal(f.badCarriedOutcome.ok, false);
  assert.equal(f.badCarriedOutcome.reason, "BAD_CARRIED_OUTCOME");
  assert.equal(f.badCarriedOutcome.field, "text");
  assert.equal(f.badCarriedOutcome.translation, fillWords("refusal.BAD_CARRIED_OUTCOME", { field: "text" }));
  assert.equal(f.badCarriedOutcome.check, CARRIED_OUTCOME_CHECKS.BAD_CARRIED_OUTCOME.check);
  assert.deepEqual(Object.keys(f.ok), ["ok", "outcome"]);
  assert.equal(f.ok.ok, true, JSON.stringify(f.ok).slice(0, 300));
  assert.match(f.ok.outcome, /^OUTC-2026-\d{4}$/);
});

test("R9: each carryOutcome fixture is made when it is called, over a fresh world: a second call answers the same shape and its own outcome id", () => {
  const a = carryOutcome(), b = carryOutcome();
  assert.deepEqual([a.noSuchCase.reason, b.noSuchCase.reason], ["NO_SUCH_CASE", "NO_SUCH_CASE"]);
  assert.deepEqual(Object.keys(b.ok), ["ok", "outcome"]);
  assert.equal(b.ok.ok, true);
  assert.match(b.ok.outcome, /^OUTC-2026-\d{4}$/);
});

test("R1, R12: the statementAck fixture answers the test world's dead answer for a viewer with no door, STATEMENT_ACK_NO_REASON for an act with no reason, and the reasoned acknowledgement's real answer for a joined participant", () => {
  const f = statementAck();
  assert.deepEqual(f.noReviewCopy, DEAD, "the one dead answer of the test world's review stand-in, whole");
  assert.equal(f.noReason.ok, false);
  assert.equal(f.noReason.reason, "STATEMENT_ACK_NO_REASON");
  assert.equal(f.noReason.check, STATEMENT_ACK_CHECKS.STATEMENT_ACK_NO_REASON.check);
  assert.equal(f.noReason.translation, STATEMENT_ACK_CHECKS.STATEMENT_ACK_NO_REASON.translation);
  assert.equal(f.ok.ok, true, JSON.stringify(f.ok).slice(0, 300));
  assert.equal(f.ok.existed, false);
  assert.deepEqual([f.ok.acknowledgement.kind, f.ok.acknowledgement.by, f.ok.acknowledgement.reason],
    ["participant", "bo", WORDS]);
  assert.equal(f.ok.acknowledgement.case_id !== null, true);
});

test("R1: the statementAck fixture's reasoned act is a second reader's: recorded under bo, the joined member, not under the statement's author alice; a viewer with no door is refused as NO_REVIEW_COPY", () => {
  const f = statementAck();
  assert.equal(f.ok.acknowledgement.by, "bo");
  assert.notEqual(f.ok.acknowledgement.by, "alice", "the statement's author is not a second reader");
  assert.equal(f.noReviewCopy.reason, "NO_REVIEW_COPY");
});
