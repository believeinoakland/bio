/* basis-versions' published fixtures (fix round 10; K4990, K4995, K5044): each is called here and its answer compared with what the real
   module gives, so a user that takes it holds the module's real answer and not a copy. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { concludeAct } from "./fixtures.mjs";
import { CONCLUDE_ACT_CHECKS } from "../../../src/basis-versions/checks.mjs";
import { word } from "../../../src/setup-words/index.mjs";

test("fixture concludeAct: a member's own reading concluded on with no project answers the real concluded receipt (R19, R51)", () => {
  const r = concludeAct({ kind: "concluded" });
  assert.deepEqual([r.ok, r.target, r.from, r.to, r.relationship, r.project, r.own_reading, r.version],
    [true, "INQ-2026-0001-q", "open", "concluded", "no_project", null, true, "reading-1"]);
  assert.deepEqual(r.claim, { state: "adopted", text: r.conclusion, version: "reading-1" });
  assert.equal(concludeAct({ kind: "concluded", target: "INQ-2026-0009-other" }).target, "INQ-2026-0009-other", "the target is the caller's");
});

test("fixture concludeAct: nothing said to conclude is the real NO_CONCLUSION refusal, with its row's check and translation (R16)", () => {
  const r = concludeAct({ kind: "no_conclusion" });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
    [false, "NO_CONCLUSION", "NO_CONCLUSION", CONCLUDE_ACT_CHECKS.NO_CONCLUSION.check, CONCLUDE_ACT_CHECKS.NO_CONCLUSION.translation]);
  assert.equal(r.check, "C-33.1");
});

test("fixture concludeAct: a reading under the floor is the real BAD_READING refusal, its words by key (R51)", () => {
  const r = concludeAct({ kind: "bad_reading" });
  assert.deepEqual([r.ok, r.reason, r.code, r.translation], [false, "BAD_READING", "BAD_READING", word("refusal.BAD_READING")]);
  assert.ok(typeof r.detail === "string" && r.detail.length > 0);
});

test("fixture concludeAct: a named accepted reading with a claim, adopted with no project, answers the real concluded receipt (R19, R51)", () => {
  const r = concludeAct({ kind: "adopted" });
  assert.deepEqual([r.ok, r.target, r.from, r.to, r.relationship, r.project, r.version, r.conclusion],
    [true, "INQ-2026-0001-q", "open", "concluded", "no_project", null, "accepted-reading", "The council approved the transfer on the third reading."]);
  assert.deepEqual(r.claim, { state: "adopted", text: "the council approved the transfer", version: "accepted-reading" });
});

test("fixture concludeAct: a named accepted reading that states no claim is the real NO_CLAIM refusal, with its row's check and translation (R16)", () => {
  const r = concludeAct({ kind: "no_claim" });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
    [false, "NO_CLAIM", "NO_CLAIM", CONCLUDE_ACT_CHECKS.NO_CLAIM.check, CONCLUDE_ACT_CHECKS.NO_CLAIM.translation]);
  assert.equal(r.check, "C-33.34");
  assert.equal(r.translation, word("refusal.NO_CLAIM"));
  assert.equal(r.version, "accepted-reading");
});

test("fixture concludeAct control: a kind it does not make is refused by the fixture, not answered", () => {
  assert.throws(() => concludeAct({ kind: "nonsense" }), /no kind/);
});
