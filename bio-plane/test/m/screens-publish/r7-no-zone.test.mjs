/* screens-publish, fix round 7, G62 (K4736): the Sign step tells apart the three pre-flight answers that offer no publishing time —
 * no zone held, the signing check not reached (or not answering), and an offer that names no zone — and draws the date and time
 * fields only for an offer with a zone. The sentences are the case-authoring op's own (`PUBLISH_AT_NOT_REACHED_SENTENCE`,
 * `PUBLISH_AT_UNANSWERED_SENTENCE`), read by key (R24). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PUBLISH_AT_NOT_REACHED_SENTENCE, PUBLISH_AT_UNANSWERED_SENTENCE } from "../../../src/case-authoring/index.mjs";
import { open, main, text, drew, ops, press, tick, ok, word, PREFLIGHT, P, DR } from "./fixtures.mjs";

const PATH = `/app/ceremony/${P}/${DR}`;
/** The pre-flight whose Sign step is `step`. */
const withSign = (step) => { const pf = PREFLIGHT(); pf.steps[7] = { signer: "dev", open_requests: [], ...step }; return pf; };
const sign = async (step) => {
  const p = await open(PATH, { plane: { publishpreflight: ok(withSign(step)) } });
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "because" });
  return p;
};
const none = (p) => main(p).querySelector("[data-publish-at-none]");
const NOT_REACHED = { publish_at: null, publish_at_stated: PUBLISH_AT_NOT_REACHED_SENTENCE, ratification: { reached: false, why: "PREFLIGHT_UNDETERMINED" } };
const UNANSWERED = { publish_at: null, publish_at_stated: PUBLISH_AT_UNANSWERED_SENTENCE, ratification: { reached: true, refusals: [] } };
const noFields = (p) => assert.ok(!p.doc.getElementById("ce-date") && !p.doc.getElementById("ce-time"), "no date or time field");
const onlyNow = (p) => assert.deepEqual(ops(p).filter((o) => o === "caseratify" || o === "publishat"), ["caseratify"], "only Sign and publish now");

test("R12 G62 (a) no zone held says so, and only that: the held refusal, no date or time field, no second button", async () => {
  const p = await sign({ publish_at: { offered: false, zone: null, reason: "PUBLISH_AT_NO_ZONE" } });
  assert.equal(none(p).getAttribute("data-publish-at-none"), "nozone");
  assert.ok(drew(p, "refusal.PUBLISH_AT_NO_ZONE"));
  noFields(p); onlyNow(p);
});

test("R12 G62 (b) a signing check not reached says that, never that the zone isn't set; one that did not answer says so", async () => {
  const p = await sign(NOT_REACHED);
  assert.equal(none(p).getAttribute("data-publish-at-none"), "notreached");
  assert.ok(drew(p, "case-authoring.publish_at_not_reached_sentence"), "the op's own sentence, by its key");
  assert.equal(word("case-authoring.publish_at_not_reached_sentence"), PUBLISH_AT_NOT_REACHED_SENTENCE, "the key is the op's sentence");
  assert.ok(!drew(p, "refusal.PUBLISH_AT_NO_ZONE"), "the team's zone is not said to be unset");
  noFields(p); onlyNow(p);
  const q = await sign(UNANSWERED);
  assert.equal(none(q).getAttribute("data-publish-at-none"), "unanswered");
  assert.ok(drew(q, "case-authoring.publish_at_unanswered_sentence") && !drew(q, "refusal.PUBLISH_AT_NO_ZONE"));
  assert.equal(word("case-authoring.publish_at_unanswered_sentence"), PUBLISH_AT_UNANSWERED_SENTENCE);
  noFields(q); onlyNow(q);
});

test("R12 G62 (c) an offer that names no zone is told apart from an unset zone: no fields, no empty brackets, never 'isn't set'", async () => {
  for (const pa of [{ offered: true, zone: "" }, { offered: true }, { zone: null }]) {
    const p = await sign({ publish_at: pa, publish_at_source: "none" });
    assert.equal(none(p).getAttribute("data-publish-at-none"), "nozonestated", JSON.stringify(pa));
    assert.ok(!drew(p, "refusal.PUBLISH_AT_NO_ZONE"), "not said to be unset");
    assert.ok(!/\(\s*\)/.test(text(p)), "no empty brackets");
    noFields(p); onlyNow(p);
  }
});

test("R12 G62 a Sign step with no publish_at at all is the check not answering, and another stated reason is drawn by its own word (controls)", async () => {
  const p = await sign({ publish_at: undefined });
  assert.equal(none(p).getAttribute("data-publish-at-none"), "unanswered");
  const q = await sign({ publish_at: { offered: false, zone: null, reason: "PUBLISH_AT_PAST" } });
  assert.equal(none(q).getAttribute("data-publish-at-none"), "nozone");
  assert.ok(drew(q, "refusal.PUBLISH_AT_PAST"), "the reason the offer states, by its word");
  assert.ok(!drew(q, "refusal.PUBLISH_AT_NO_ZONE"));
});

test("R12 G62 an offer with a zone draws the date and time fields and no sentence of the three (control)", async () => {
  const p = await sign({ publish_at: { offered: true, zone: "America/Los_Angeles", source: "local-facts" } });
  assert.equal(none(p), null);
  assert.ok(p.doc.getElementById("ce-date") && p.doc.getElementById("ce-time"));
  assert.ok(drew(p, "screen.ceremony.when.help", { zone: "America/Los_Angeles" }));
  assert.ok(ops(p).includes("publishat") || ops(p).includes("caseratify"), "a button to sign is offered");
});
