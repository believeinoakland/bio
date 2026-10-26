/* The fixtures case-inputs publishes (fixtures.mjs): each called here, and each answer checked against the module's own
   refusal table and the real code it comes from. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { carryOutcome, statementAck, casedetails, casedetailsset, casedetailspublic, casedetailsRelated, casedetailsNone } from "./fixtures.mjs";
import { CARRIED_OUTCOME_CHECKS, STATEMENT_ACK_CHECKS, CASE_DETAILS_FIELDS, CASE_DETAILS_WORDS, fillWords, fillDetails } from "../../../src/case-inputs/index.mjs";
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
  assert.deepEqual(Object.keys(f.noReviewCopy).sort(), ["check", "code", "detail", "ok", "reason", "translation"],
    "the dead answer's shape is review's refusal: its code, check, translation and detail");
  assert.equal(typeof f.noReviewCopy.translation, "string");
  assert.equal(typeof f.noReviewCopy.detail, "string");
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

test("R23: the casedetails fixture answers the real read of a published case with two details recorded: ok, area and contact stated with their values, related and relationships not stated", () => {
  const { recorded: r } = casedetails();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(Object.keys(r.details), [...CASE_DETAILS_FIELDS]);
  assert.equal(r.details.area.stated, true);
  assert.deepEqual(r.details.area.value, [{ words: "The harbour authority" }]);
  assert.equal(r.details.contact.stated, true);
  assert.deepEqual(r.details.contact.value, { kind: "doorbell" });
  for (const f of ["related", "relationships"]) assert.equal(r.details[f].stated, false, f);
});

test("R20, R22: the casedetailsset fixture answers the owner's real set (ok, case, field, value, at) and a joined member's refused set as NOT_THE_PROJECT_OWNER with its module sentence", () => {
  const f = casedetailsset();
  assert.equal(f.set.ok, true, JSON.stringify(f.set).slice(0, 300));
  assert.deepEqual(Object.keys(f.set).sort(), ["at", "case", "field", "ok", "value"]);
  assert.equal(f.set.field, "area");
  assert.deepEqual(f.set.value, [{ words: "The harbour authority" }]);
  assert.equal(f.notOwner.ok, false);
  assert.equal(f.notOwner.reason, "NOT_THE_PROJECT_OWNER");
  assert.equal(f.notOwner.detail, fillDetails("notOwner"));
  assert.equal(f.notOwner.detail, CASE_DETAILS_WORDS.notOwner);
});

test("R24: the casedetailspublic fixture answers the published case's public read (ok, the team's slug, stated for the two set fields, the current-statement sentence) and the unpublished case's NOT_PUBLISHED with nothing of it", () => {
  const f = casedetailspublic();
  assert.equal(f.published.ok, true, JSON.stringify(f.published).slice(0, 300));
  assert.equal(f.published.group, "test-group");
  assert.equal(f.published.sentence, CASE_DETAILS_WORDS.publicCurrent);
  assert.equal(f.published.details.area.stated, true);
  assert.equal(f.published.details.contact.stated, true);
  assert.equal(f.published.details.related.stated, false);
  assert.equal(f.unpublished.ok, false);
  assert.equal(f.unpublished.reason, "NOT_PUBLISHED");
  assert.equal(f.unpublished.check, "C-98.8");
  assert.equal(JSON.stringify(f.unpublished).includes("harbour"), false, "the unsigned preparation's area is not in its refusal");
});

test("R20, R23, R24: each details fixture is made when it is called, over a fresh world: a second call answers the same shape, and the answers stay equal", () => {
  const a = casedetailspublic(), b = casedetailspublic();
  assert.deepEqual(Object.keys(a), Object.keys(b));
  assert.equal(a.published.ok, b.published.ok);
  assert.equal(b.unpublished.reason, "NOT_PUBLISHED");
  assert.equal(casedetails().recorded.ok, true);
  assert.equal(casedetailsset().set.ok, true);
});

test("R21, R23: the casedetailsRelated fixture's caseDetails is the real read of a published case whose related standing has works: ok, related stated as a builds_on and a disagrees_with with their values as set, relationships not stated", () => {
  const { recorded: r } = casedetailsRelated();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.published, true);
  assert.equal(r.details.related.stated, true);
  assert.deepEqual(r.details.related.value.map((e) => e.relation), ["builds_on", "disagrees_with"]);
  assert.deepEqual(r.details.related.value, [
    { relation: "builds_on", case_ref: { group: "river-town", case: "CASE-2026-0007", edition: 1 }, words: "Builds on the council's 2025 minutes" },
    { relation: "disagrees_with", url: "https://example.org/housing-study", words: "A competing reading of the same vote" },
  ]);
  assert.equal(r.details.relationships.stated, false, "relationships is not stated");
  assert.equal(r.details.relationships.value, null);
});

test("R21, R24: the casedetailsRelated fixture's casedetailspublic is the real public read of the same case: ok, the team's slug, related stated with its two works, relationships not stated, and nothing of who set them", () => {
  const { publicRead: p } = casedetailsRelated();
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  assert.equal(p.group, "test-group");
  assert.equal(p.details.related.stated, true);
  assert.deepEqual(p.details.related.value.map((e) => e.relation), ["builds_on", "disagrees_with"]);
  assert.equal(p.details.relationships.stated, false);
  assert.equal(JSON.stringify(p).includes("set_by"), false, "the public read never says who set a detail");
});

test("R21, R23: the casedetailsNone fixture's caseDetails is the real read of a published case whose relationships are stated {none: true}: ok, relationships stated, related not stated", () => {
  const { recorded: r } = casedetailsNone();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.details.relationships.stated, true);
  assert.deepEqual(r.details.relationships.value, { none: true });
  assert.equal(r.details.related.stated, false, "related is not stated");
});

test("R21, R24: the casedetailsNone fixture's casedetailspublic is the real public read of the same case: ok, relationships stated as {none: true}, related not stated", () => {
  const { publicRead: p } = casedetailsNone();
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  assert.equal(p.details.relationships.stated, true);
  assert.deepEqual(p.details.relationships.value, { none: true });
  assert.equal(p.details.related.stated, false);
});
