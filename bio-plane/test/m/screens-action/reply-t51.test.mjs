/* screens-action R38 (the reply form, C66; DEC-376) as the design draws it (DEC-387, B424) and BOB confirms it (B16 b): how a reply came
   (`medium`, by the design's five tokens), what it follows (`follows`, an entry's place), the reply's document (the project's held
   captures, `artifact_sha`), the stage and outcome by their keys (the family's `none` sends nothing), and the quote's answers and
   revises. Every sentence is asserted by its key (R19); every request is compared with its owner's declaration by the harness. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, press, last, ok, beside, W, D, hasWord, DATA_PLANE, ROUTES, ACTION, ACTION_ID, PROJECT, AFFORDANCES } from "./page.mjs";
import { DECLARED_FIELDS } from "./declared.mjs";

const SHA = "a".repeat(64);
const VOC = { vocabularies: { ...AFFORDANCES.vocabularies,
  correspondence_stages: { sent: ["request"], received: ["acknowledgement", "fee_estimate", "fee_waiver_decision", "extension_notice", "production", "denial", "appeal_decision", "court_decision"] },
  correspondence_outcomes: ["granted", "denied", "partial", "reversed", "affirmed", "none_stated", "none_exists"] } };
const HELD = ok({ held: [{ bundle_id: "DOC-1", title: "Acknowledgment email", collected_since: "2026-10-03T10:00:00Z", capture: { sha256: SHA, grade: "B" } },
  { bundle_id: "DOC-2", title: "Not captured yet", collected_since: "2026-10-04T10:00:00Z", capture: null }], truncated: false });
// the sent request (ord 1), an acknowledgment received (ord 2, with its kind) and a fee estimate received (ord 3, with a quote)
const WITH = { ...ACTION, correspondence: [ACTION.correspondence[0], { ...ACTION.correspondence[1], stage: "acknowledgement" },
  { ord: 3, direction: "received", at: "2026-10-05", medium: "email", party: "Office of the City Clerk", stage: "fee_estimate", quote_amount: "75.00", quote_currency: "USD" }],
  entries: [{ ord: 2 }, { ord: 3 }] };
const plane = (over = {}) => ({ ...DATA_PLANE, action: ok(WITH), affordances: ok(VOC), heldcaptures: HELD, actioncorrespond: ok({}), ...over });
const sentOf = (p) => Object.fromEntries(Object.entries(last(p, "actioncorrespond").query).filter(([k]) => k !== "op" && k !== "reason"));
const optionsOf = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent.trim()]);

test("R38 (B15 (1), B16 b): how it came is one of the design's five tokens, what it follows is an earlier entry's place, and the stage and outcome are the vocabulary's by their keys; the family's 'none' is the empty choice and sends nothing", async () => {
  for (const k of ["screen.action.how.it.came", "screen.action.it.follows", "screen.action.reply.follows.none", "screen.action.reply.follows.request", "screen.action.reply.follows.reply",
    "screen.action.reply.stage.none", "screen.action.reply.outcome.none", ...["email", "letter", "portal", "person", "other"].map((t) => "screen.action.reply.medium." + t)]) assert.ok(hasWord(k), k);
  const p = await open(ROUTES.action, plane());
  assert.deepEqual(optionsOf(p, "reply-medium"), [["", ""], ...["email", "letter", "portal", "person", "other"].map((t) => [t, W("screen.action.reply.medium." + t)])]);
  assert.deepEqual(optionsOf(p, "reply-stage"), [["", W("screen.action.reply.stage.none")], ...VOC.vocabularies.correspondence_stages.received.map((t) => [t, W("screen.action.reply.stage." + t)])]);
  assert.deepEqual(optionsOf(p, "reply-outcome"), [["", W("screen.action.reply.outcome.none")], ...VOC.vocabularies.correspondence_outcomes.map((t) => [t, W("screen.action.reply.outcome." + t)])]);
  // follows: nothing earlier, the request sent on its day, and a reply of a known kind on its day (an entry with no kind has no word, so it is not offered)
  assert.deepEqual(optionsOf(p, "reply-follows"), [["", W("screen.action.reply.follows.none")], ["1", W("screen.action.reply.follows.request", { date: D("2026-10-02") })],
    ["2", W("screen.action.reply.follows.reply", { kind: W("screen.action.reply.stage.acknowledgement").toLowerCase(), date: D("2026-10-03") })],
    ["3", W("screen.action.reply.follows.reply", { kind: W("screen.action.reply.stage.fee_estimate").toLowerCase(), date: D("2026-10-05") })]]);
  for (const k of ["screen.action.what.came.back", "screen.action.how.it.came", "screen.action.it.follows", "screen.action.the.earlier.entry.this.answers.so", "screen.action.where.this.reply.stands.in.the"]) assert.ok(text(p).includes(W(k)), k);
  await press(p, "actioncorrespond", { reason: "it came", values: { "reply-at": "2026-10-11", "reply-medium": "portal", "reply-account": "A denial.", "reply-stage": "denial", "reply-follows": "1",
    "reply-outcome": "denied", "reply-party": "Office of the City Clerk" } });
  const sent = sentOf(p);
  assert.deepEqual(sent, { target: ACTION_ID, direction: "received", at: "2026-10-11", account: "A denial.", medium: "portal", party: "Office of the City Clerk", stage: "denial", follows: "1", outcome: "denied" });
  for (const name of Object.keys(sent)) assert.ok(DECLARED_FIELDS("actioncorrespond").includes(name), `${name} is declared`);
  // control: 'none' for the stage, the outcome, the medium and what it follows sends none of them
  await press(p, "actioncorrespond", { reason: "it came", values: { "reply-at": "2026-10-12", "reply-medium": "", "reply-account": "Words.", "reply-stage": "", "reply-follows": "", "reply-outcome": "" } });
  const none = sentOf(p);
  assert.deepEqual(Object.keys(none).sort(), ["account", "at", "direction", "target"]);
});

test("R38 (B15 (1)): the reply itself is a document the project holds, picked from its held captures and sent as `artifact_sha` with no account; the account path sends no document; never both; control: a document chosen and none picked is refused in place", async () => {
  for (const k of ["screen.action.what.you.record.it.from", "screen.action.your.account.of.it", "screen.action.the.reply.itself.a.document.you", "screen.action.the.document.that.holds.the.reply",
    "screen.docket.capture.option", "screen.action.a.reply.needs.either.the.document"]) assert.ok(hasWord(k), k);
  const p = await open(ROUTES.action, plane());
  const read = p.byOp("heldcaptures");
  assert.equal(read.length, 1, "the project's documents are read once");
  assert.equal(read[0].query.project, PROJECT);
  // only a document whose capture is filed is offered, by its title and the day it was collected
  assert.deepEqual(optionsOf(p, "reply-doc"), [["", ""], [SHA, W("screen.docket.capture.option", { title: "Acknowledgment email", date: D("2026-10-03") })]]);
  assert.deepEqual(optionsOf(p, "reply-held").map((o) => o[1]), [W("screen.action.your.account.of.it"), W("screen.action.the.reply.itself.a.document.you")]);
  await press(p, "actioncorrespond", { reason: "it came", values: { "reply-at": "2026-10-03", "reply-held": "document", "reply-doc": SHA, "reply-account": "ignored" } });
  const doc = sentOf(p);
  assert.equal(doc.artifact_sha, SHA);
  assert.ok(!("account" in doc), "never both");
  assert.ok(DECLARED_FIELDS("actioncorrespond").includes("artifact_sha"));
  await press(p, "actioncorrespond", { reason: "it came", values: { "reply-at": "2026-10-03", "reply-held": "account", "reply-doc": SHA, "reply-account": "Words." } });
  const acct = sentOf(p);
  assert.equal(acct.account, "Words.");
  assert.ok(!("artifact_sha" in acct), "the document is not sent with an account");
  // control: the reply itself chosen and no document picked is refused in place and sends nothing
  const q = await open(ROUTES.action, plane());
  const b = await press(q, "actioncorrespond", { reason: "it came", values: { "reply-at": "2026-10-03", "reply-held": "document", "reply-doc": "" } });
  assert.equal(q.byOp("actioncorrespond").length, 0);
  assert.ok(beside(q, b).includes(W("screen.action.a.reply.needs.either.the.document")));
  // control: the project's documents unread draws no document choice, and says to add one first
  const none = await open(ROUTES.action, plane({ heldcaptures: ok({ held: [], truncated: false }) }));
  assert.equal(none.doc.getElementById("reply-doc"), null);
  assert.ok(text(none).includes(W("screen.action.add.the.document.first.under.add")));
});

test("R38 (B15 (1)): a quoted fee carries the currency, what it is for, which sending it answers and which earlier quote it revises, as `actions` declares them; control: no amount sends none of them", async () => {
  for (const k of ["screen.action.the.amount.quoted", "screen.action.currency", "screen.action.reply.currency.usd", "screen.action.it.answers.this.sending", "screen.action.it.revises.this.quote"]) assert.ok(hasWord(k), k);
  const p = await open(ROUTES.action, plane());
  assert.deepEqual(optionsOf(p, "reply-fee-cur"), [["USD", W("screen.action.reply.currency.usd")]]);
  assert.deepEqual(optionsOf(p, "reply-fee-answers"), [["", ""], ["1", W("screen.action.reply.follows.request", { date: D("2026-10-02") })]]);
  assert.deepEqual(optionsOf(p, "reply-fee-revises"), [["", ""], ["3", "75.00 USD"]], "an earlier quote the record holds");
  await press(p, "actioncorrespond", { reason: "it came", values: { "reply-at": "2026-10-20", "reply-account": "A revised estimate.", "reply-fee": "40.00", "reply-fee-basis": "Staff time", "reply-fee-answers": "1", "reply-fee-revises": "3" } });
  const sent = sentOf(p);
  assert.deepEqual([sent.quote_amount, sent.quote_currency, sent.quote_basis, sent.quote_answers, sent.quote_revises], ["40.00", "USD", "Staff time", "1", "3"]);
  for (const name of Object.keys(sent)) assert.ok(DECLARED_FIELDS("actioncorrespond").includes(name), `${name} is declared`);
  await press(p, "actioncorrespond", { reason: "it came", values: { "reply-at": "2026-10-21", "reply-account": "No quote.", "reply-fee": "", "reply-fee-answers": "1" } });
  assert.ok(!Object.keys(sentOf(p)).some((k) => k.startsWith("quote_")), "control: no amount, no quote");
  // control: with no earlier quote the revising choice is not drawn
  const q = await open(ROUTES.action, plane({ action: ok(ACTION) }));
  assert.equal(q.doc.getElementById("reply-fee-revises"), null);
});
