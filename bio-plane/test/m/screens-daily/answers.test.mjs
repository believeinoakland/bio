/* Ask (R6) on the real served page (interface-shell's harness): "Ask" through `op=ask` while the assistant is reachable
   (interface-shell R20), its answer drawn as labelled machine work with each holding a reference to its passage and the
   looks as where it looked, the test-instance label when the answer carries it; "Find and count" while it is not; keeping
   and stopping the question in both; the assistant's refusals by their words. The plane's ask answers a stream (agent-worker
   R54); the harness answers its last event as one JSON body, the form the shell's op client reads today (SCREENS-DAILY #1's
   REPORT). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, acts, button, press, beside, last, main, screen } from "./page.mjs";

const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
const EVENT = {
  event: "answer", ok: true,
  answer: {
    question_as_read: "How many pothole reports were closed within seven days?",
    summary: { text: "812 of 903 were closed within 7 days.", rests_on: ["s1"] },
    sentences: [{ text: "The work orders record 812 closed within 7 days.", kind: "figure", support: ["h1"] },
      { text: "No inspection records were found.", kind: "absence", support: ["l1"] }],
    holdings: [{ address: "INF-1#p3", quote: "903 rows" }],
    looks: [{ level: "document", state: "LOOKED_FOUND" }, { level: "internet", state: "NOT_LOOKED" }, { level: "meaning", state: "ODD" }],
    label: "machine work",
  },
  withheld: [{ code: "ANSWER_CITES_UNREAD" }],
};
const answered = (ev) => ({ status: 200, json: ev });
const R = "looking";

test("R6: while the assistant is reachable, \"Ask\" sends the question through op=ask, and \"Search instead\" opens Find", async () => {
  const p = await open("/app/answers", { ...REACH, ask: answered(EVENT) });
  assert.deepEqual(ops(p), ["ask", "search", "standingquestionset"]);
  assert.match(button(p, "ask").textContent, /^Ask/, "the registry's \"Ask\", its own act");
  const none = await press(p, "ask", { values: { "answers-q": "" } });
  assert.equal(beside(p, none), "Write your question first.");
  await press(p, "ask", { values: { "answers-q": " How many? " } });
  assert.deepEqual(last(p, "ask").body, { question: "How many?" });
  assert.equal(last(p, "ask").method, "POST");
  await press(p, "search", { values: { "answers-q": "How many?" }, reason: R });
  assert.equal(p.location.pathname, "/app/finder/How%20many%3F", "it opens Find with the question's words");
  assert.deepEqual(p.byOp("search").map((r) => r.query.q), ["How many?"], "one search: Find's own read of the words, none from here");
});

test("R6: the answer is drawn as machine work: summary, sentences each with its holding as a reference to its passage, and where it looked", async () => {
  const p = await open("/app/answers", { ...REACH, ask: answered(EVENT) });
  await press(p, "ask", { values: { "answers-q": "How many?" } });
  const mw = main(p).querySelector(".cs-machinework");
  assert.ok(mw);
  assert.match(text(p, mw), /Read as: How many pothole reports were closed within seven days\?812 of 903 were closed within 7 days\./);
  assert.match(text(p, mw), /The work orders record 812 closed within 7 days\. 903 rows/);
  assert.ok(mw.querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "903 rows"));
  assert.match(text(p, mw), /Where it rests903 rowsWhere it lookedDocuments looked, foundOutside your group not lookedWhat was read from them ODD/);
  assert.match(text(p, mw), /1 sentences were held back/);
  assert.match(text(p, mw), /Machine work · the assistant, at your request$/);
  assert.doesNotMatch(text(p, mw), /Not yet tested/, "control: no label without untested");
});

test("R6 (K2816 (2); screens-inquiry R7): an answer the plane marks untested carries the test-instance label", async () => {
  const p = await open("/app/answers", { ...REACH, ask: answered({ ...EVENT, untested: { kind: "untested", part: "ask", words: "ai.label.untested" } }) });
  await press(p, "ask", { values: { "answers-q": "How many?" } });
  assert.match(text(p), /Not yet tested: this part of the assistant has not yet passed Civicsmith's tests on real matters\. Check what it says against the record\./);
});

test("R6: the assistant's refusals are drawn by their words (ai.refused.*), in the screen's words for ASSISTANT_OFF and AI_PART_NOT_DEPLOYED", async () => {
  const cases = [
    ["AI_KEPT_AWAY", /keeps its material away from AI/],
    ["AI_LIMIT_UNJUDGED", /your group's Civicsmith couldn't check the use/],
    ["NO_ACCOUNT", /Connect your own Claude sign-in first/],
    ["ASSISTANT_OFF", /Your group keeps its material away from the assistant/],
    ["AI_PART_NOT_DEPLOYED", /The assistant can't yet answer questions here/],
  ];
  for (const [code, words] of cases) {
    const p = await open("/app/answers", { ...REACH, ask: refused(code, null, 409) });
    const b = await press(p, "ask", { values: { "answers-q": "How many?" } });
    assert.match(beside(p, b), words, code);
    assert.equal(p.doc.getElementById("answers-q").value, "How many?", "the form keeps the question (interface-shell R13)");
  }
  const ask = screen("answers").acts.find((a) => a.op === "ask");
  assert.equal(ask.refusals.AI_LIMIT_REACHED, "ai.refused.limit");
  assert.equal(ask.refusals.AI_USE_SWITCHED_OFF, "ai.refused.off");
  // A refused stream's last event (`event: refused`) is a refusal beside the act, and no answer is drawn.
  const s = await open("/app/answers", { ...REACH, ask: answered({ event: "refused", ok: false, code: "AI_KEPT_AWAY" }) });
  const b = await press(s, "ask", { values: { "answers-q": "q" } });
  assert.match(beside(s, b), /keeps its material away from AI/);
  assert.equal(main(s).querySelector(".cs-machinework"), null);
});

test("R6: while not reachable the screen is \"Find and count\": search here, and ruleanswer \"Show how this was counted\"", async () => {
  const p = await open("/app/answers", {
    search: ok({ hits: [{ bundle_id: "INF-1", title: "Work orders", snippet: "903 rows" }] }),
    ruleanswer: ok({ ok: true, service: "occurrences", value: 812, basis: "903 rows", label: "computed_fact" }),
  });
  assert.equal(main(p).querySelector("h1").textContent, "Find and count");
  assert.deepEqual(ops(p), ["search", "standingquestionset"]);
  assert.ok(!ops(p).includes("ask"), "no assistant control drawn (interface-shell R20)");
  await press(p, "search", { values: { "answers-q": "work orders" }, reason: R });
  assert.equal(last(p, "search").query.q, "work orders");
  assert.ok(main(p).querySelector('.cs-origin[data-origin="search"]'));
  assert.deepEqual(ops(p), ["search", "ruleanswer", "standingquestionset"]);
  assert.match(button(p, "ruleanswer").textContent, /^Show how this was counted/);
  await press(p, "ruleanswer", { reason: R });
  assert.deepEqual({ ...last(p, "ruleanswer").body, reason: undefined }, { service: "occurrences", args: { q: "work orders" }, reason: undefined });
  assert.match(text(p), /A computed fact: 812Basis: 903 rows/);
  const nh = await open("/app/answers", { search: ok({ hits: [] }), ruleanswer: ok({ ok: true, service: "occurrences", not_held: { reason: "no table declared" } }) });
  await press(nh, "search", { values: { "answers-q": "zz" }, reason: R });
  assert.match(text(nh), /Nothing your group holds matches these words\./);
  await press(nh, "ruleanswer", { reason: R });
  assert.match(text(nh), /Not held: no table declared/);
});

test("R6: in both, standingquestionset keeps asking and standingquestionend stops, with \"New matches will arrive in your queue as a list\"", async () => {
  for (const reach of [REACH, {}]) {
    const p = await open("/app/answers", { ...reach, standingquestionset: ok({ ok: true, id: "STQ-9", ends: "2027-10-12" }), standingquestionend: ok({ ok: true, id: "STQ-9" }) });
    assert.match(text(p), /New matches will arrive in your queue as a list for you to read\./);
    const none = await press(p, "standingquestionset", { values: { "answers-q": "" } });
    assert.equal(beside(p, none), "Write your question first.");
    await press(p, "standingquestionset", { values: { "answers-q": "pothole closures" } });
    const b = last(p, "standingquestionset").body;
    assert.deepEqual([b.question, b.query, b.cadence], ["pothole closures", "pothole closures", "weekly"]);
    assert.equal(button(p, "standingquestionend").dataset.id, "STQ-9");
    assert.match(text(p), /Asked again every week until 12 October 2027\./);
    await press(p, "standingquestionend");
    assert.deepEqual(last(p, "standingquestionend").body, { id: "STQ-9" });
    assert.ok(!ops(p).includes("standingquestionend"));
  }
  assert.ok(acts);
});
