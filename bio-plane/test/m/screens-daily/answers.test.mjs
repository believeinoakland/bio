/* Ask (R6) at the module's interface, over the stand-in kit: "Ask" through `op=ask` while the assistant is reachable, its
   answer drawn as labelled machine work with each holding a link to its passage and the looks as where it looked, the
   test-instance label when the answer carries it; "Find and count" while it is not; keeping and stopping the question in
   both; the assistant's refusals by their words. */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-daily/index.mjs";
import { kit, viewOf, ops, drawn, keys, text } from "./kit.mjs";

const answers = SCREENS.find((s) => s.id === "answers");
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

test("R6: while the assistant is reachable, \"Ask\" sends the question through op=ask, and \"Search instead\" opens Find", () => {
  const html = kit().render(answers, viewOf({ reachable: true }));
  assert.deepEqual(ops(html), ["ask", "search", "standingquestionset"]);
  assert.equal(drawn(html)[0][1].label, "act.ruleanswer.label.answers", "the registry's \"Ask\" label, re-pointed to ask");
  assert.ok(!ops(html).includes("ruleanswer"));
  assert.deepEqual(answers.reads(viewOf({ reachable: true, ui: { q: "x" } })), {}, "nothing read while asking");
  const k = kit({ values: { "answers-q": " How many? " } });
  const v = viewOf({ reachable: true });
  assert.deepEqual(k.send(answers, "ask", v), { body: { question: "How many?" } });
  assert.deepEqual(kit({ values: { "answers-q": "" } }).send(answers, "ask", v), { refuse: "screen.answers.questionfirst" });
  assert.equal(k.send(answers, "search", v), null, "it opens Find instead of searching here");
  assert.deepEqual(k.log.go, [["finder", "How many?"]]);
});

test("R6: the answer is drawn as machine work: summary, sentences each with its holding as a link to its passage, and where it looked", () => {
  for (const shape of [EVENT, [{ event: "step" }, EVENT], [{ event: "step" }, EVENT].map((e) => JSON.stringify(e)).join("\n") + "\n"]) {
    const k = kit();
    const v = viewOf({ reachable: true });
    k.done(answers, "ask", v, shape);
    const html = kit().render(answers, v);
    assert.match(text(html), /812 of 903 were closed within 7 days\./);
    assert.match(html, /The work orders record 812 closed within 7 days\. <a class="cs-ref" data-ref="document" href="\/app\/document\/INF-1%23p3">903 rows<\/a>/);
    assert.ok(keys(html).includes("screen.answers.holdings") && keys(html).includes("screen.answers.looks"));
    assert.match(text(html), /Documents looked, found/);
    assert.match(text(html), /Outside your group not looked/);
    assert.match(text(html), /What was read from them ODD/, "a state with no word is drawn as given");
    assert.ok(keys(html).includes("screen.answers.machine"), "labelled machine work");
    assert.ok(keys(html).includes("screen.answers.withheld"));
    assert.ok(keys(html).includes("screen.answers.asread"));
    assert.ok(!keys(html).includes("ai.label.untested"), "control: no label without untested");
  }
});

test("R6 (K2816 (2); screens-inquiry R7): an answer the plane marks untested carries the test-instance label", () => {
  const k = kit();
  const v = viewOf({ reachable: true });
  k.done(answers, "ask", v, { ...EVENT, untested: { kind: "untested", part: "ask", words: "ai.label.untested" } });
  const html = kit().render(answers, v);
  assert.ok(keys(html).includes("ai.label.untested"));
  assert.match(text(html), /Not yet tested: this part of the assistant has not yet passed Civicsmith's tests on real matters/);
});

test("R6: the assistant's refusals are drawn by their words (ai.refused.*), in the screen's words for ASSISTANT_OFF", () => {
  const ask = answers.acts.find((a) => a.op === "ask");
  assert.equal(ask.refusals.AI_LIMIT_REACHED, "ai.refused.limit");
  assert.equal(ask.refusals.AI_LIMIT_UNJUDGED, "ai.refused.limit.unjudged");
  assert.equal(ask.refusals.AI_USE_SWITCHED_OFF, "ai.refused.off");
  assert.equal(ask.refusals.AI_KEPT_AWAY, "ai.refused.projectkeptaway");
  assert.equal(ask.refusals.ASSISTANT_OFF, "screen.answers.refused.off");
  const listed = new Set(answers.words.map((w) => (typeof w === "string" ? w : w[0])));
  for (const key of Object.values(ask.refusals)) assert.ok(listed.has(key), key);
  // The DEC-149 form of the unjudged refusal is this module's own row.
  assert.match(answers.words.find((w) => Array.isArray(w) && w[0] === "ai.refused.limit.unjudged")[1], /your group's Civicsmith/);
  // A refused stream's last event leaves no answer drawn.
  const k = kit();
  const v = viewOf({ reachable: true, ui: { answer: EVENT.answer } });
  k.done(answers, "ask", v, JSON.stringify({ event: "refused", ok: false, code: "AI_LIMIT_REACHED" }));
  assert.equal(v.ui.answer, null);
});

test("R6: while not reachable the screen is \"Find and count\": search here, and ruleanswer \"Show how this was counted\"", () => {
  const empty = kit().render(answers, viewOf({ reachable: false }));
  assert.ok(keys(empty).includes("screen.answers.offtitle"));
  assert.deepEqual(ops(empty), ["search", "standingquestionset"]);
  assert.ok(!ops(empty).includes("ask"), "no assistant control drawn (interface-shell R20)");
  const k = kit({ values: { "answers-q": "work orders" } });
  const v = viewOf({ reachable: false });
  assert.deepEqual(k.send(answers, "search", v), { query: { q: "work orders", limit: "50", snippet: "160" } });
  assert.equal(answers.reads(v).search.query.q, "work orders");
  v.data.search = { state: "ok", value: { hits: [{ bundle_id: "INF-1", title: "Work orders", snippet: "903 rows" }] } };
  const html = kit().render(answers, v);
  assert.match(html, /data-mark="origin.search"/);
  assert.deepEqual(ops(html), ["search", "ruleanswer", "standingquestionset"]);
  assert.equal(drawn(html)[1][1].label, "screen.answers.counted");
  assert.deepEqual(k.send(answers, "ruleanswer", v), { body: { service: "occurrences", args: { q: "work orders" } } });
  k.done(answers, "ruleanswer", v, { ok: true, service: "occurrences", value: 812, basis: "903 rows", label: "computed_fact" });
  assert.match(text(kit().render(answers, v)), /A computed fact: 812 Basis: 903 rows/);
  k.done(answers, "ruleanswer", v, { ok: true, service: "occurrences", not_held: { reason: "no table declared" } });
  assert.match(text(kit().render(answers, v)), /Not held: no table declared/);
  assert.deepEqual(kit().send(answers, "ruleanswer", viewOf()), { refuse: "screen.finder.wordsfirst" });
  const nothing = kit().render(answers, viewOf({ ui: { q: "zz" }, data: { search: { state: "empty", value: { hits: [] } } } }));
  assert.ok(keys(nothing).includes("screen.finder.none"));
});

test("R6: in both, standingquestionset keeps asking and standingquestionend stops, with \"New matches will arrive in your queue as a list\"", () => {
  for (const reachable of [true, false]) {
    const k = kit({ values: { "answers-q": "pothole closures" } });
    const v = viewOf({ reachable });
    assert.ok(keys(k.render(answers, v)).includes("screen.answers.keeping"));
    const sent = k.send(answers, "standingquestionset", v);
    assert.equal(sent.body.question, "pothole closures");
    assert.equal(sent.body.query, "pothole closures");
    assert.equal(sent.body.cadence, "weekly");
    k.done(answers, "standingquestionset", v, { ok: true, id: "STQ-9", ends: "2027-10-12" });
    const html = kit().render(answers, v);
    const end = drawn(html).find(([op]) => op === "standingquestionend");
    assert.deepEqual(end[1].id, "STQ-9");
    assert.match(text(html), /Asked again every week until 2027-10-12\./);
    assert.deepEqual(k.send(answers, "standingquestionend", v, { id: "STQ-9" }), { body: { id: "STQ-9" } });
    k.done(answers, "standingquestionend", v, { ok: true, id: "STQ-9" });
    assert.ok(!ops(kit().render(answers, v)).includes("standingquestionend"));
  }
  assert.deepEqual(kit({ values: { "answers-q": "" } }).send(answers, "standingquestionset", viewOf()), { refuse: "screen.answers.questionfirst" });
});
