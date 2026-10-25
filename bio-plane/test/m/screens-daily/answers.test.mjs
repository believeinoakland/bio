/* Ask (R6) on the real served page (interface-shell's harness): "Ask" through `op=ask` while the assistant is reachable
   (interface-shell R20), its answer drawn as labelled machine work with each holding a reference to its passage and the
   looks as where it looked, the test-instance label when the answer carries it; "Find and count" while it is not; keeping
   and stopping the question in both; the assistant's refusals by their words. The plane's ask answers a stream (agent-worker
   R54); the harness answers its last event as one JSON body, the form the shell's op client reads today (SCREENS-DAILY #1's
   REPORT). Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "../retrieval/fixture.mjs";
import { open, ok, refused, text, ops, acts, button, press, beside, last, main, screen, word, hasWord, dmy, inOrder } from "./page.mjs";

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
  assert.ok(button(p, "ask").textContent.startsWith(word("act.ask.label.answers")), "the registry's \"Ask\", its own act");
  const none = await press(p, "ask", { values: { "answers-q": "" } });
  assert.equal(beside(p, none), word("screen.answers.questionfirst"));
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
  assert.ok(text(p, mw).includes(word("screen.answers.asread", { question: "How many pothole reports were closed within seven days?" }) + "812 of 903 were closed within 7 days."));
  assert.ok(text(p, mw).includes("The work orders record 812 closed within 7 days. 903 rows"));
  assert.ok(mw.querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "903 rows"));
  assert.ok(inOrder(text(p, mw), [word("screen.answers.holdings"), "903 rows", word("screen.answers.looks"), word("screen.answers.level.document"), word("screen.answers.state.LOOKED_FOUND"),
    word("screen.answers.level.internet"), word("screen.answers.state.NOT_LOOKED"), word("screen.answers.level.meaning"), "ODD"]));
  assert.ok(text(p, mw).includes(word("screen.answers.withheld.one")), "R25: one sentence, the singular key");
  assert.ok(text(p, mw).endsWith(word("screen.answers.machine")));
  assert.ok(!text(p, mw).includes(word("ai.label.untested")), "control: no label without untested");
});

test("R6 (K2816 (2); screens-inquiry R7): an answer the plane marks untested carries the test-instance label", async () => {
  const p = await open("/app/answers", { ...REACH, ask: answered({ ...EVENT, untested: { kind: "untested", part: "ask", words: "ai.label.untested" } }) });
  await press(p, "ask", { values: { "answers-q": "How many?" } });
  assert.ok(text(p).includes(word("ai.label.untested")));
});

test("R6: the assistant's refusals are drawn by their words (ai.refused.*), in the screen's words for ASSISTANT_OFF and AI_PART_NOT_DEPLOYED", async () => {
  // A refusal that names no fields leaves a word's placeholders as they are; the expected words keep them too.
  const same = (key, names) => word(key, Object.fromEntries(names.map((n) => [n, `{${n}}`])));
  const cases = [
    ["AI_KEPT_AWAY", word("ai.refused.projectkeptaway", { for_uses: "{for_uses}", member: "{member}", date: "{date}", reason: "AI_KEPT_AWAY" })], // the shell fills {reason} with the refusal's code
    ["AI_LIMIT_UNJUDGED", same("ai.refused.limit.unjudged", ["whose"])],
    ["NO_ACCOUNT", word("ai.refused.signinnotconnected")],
    ["ASSISTANT_OFF", word("screen.answers.refused.off")],
    ["AI_PART_NOT_DEPLOYED", word("screen.answers.refused.notdeployed")],
  ];
  for (const [code, words] of cases) {
    const p = await open("/app/answers", { ...REACH, ask: refused(code, null, 409) });
    const b = await press(p, "ask", { values: { "answers-q": "How many?" } });
    assert.equal(beside(p, b).replace(/\s+/g, " "), words, code);
    assert.equal(p.doc.getElementById("answers-q").value, "How many?", "the form keeps the question (interface-shell R13)");
  }
  const ask = screen("answers").acts.find((a) => a.op === "ask");
  assert.equal(ask.refusals.AI_LIMIT_REACHED, "ai.refused.limit");
  assert.equal(ask.refusals.AI_USE_SWITCHED_OFF, "ai.refused.off");
  // A refused stream's last event (`event: refused`) is a refusal beside the act, and no answer is drawn.
  const s = await open("/app/answers", { ...REACH, ask: answered({ event: "refused", ok: false, code: "AI_KEPT_AWAY" }) });
  const b = await press(s, "ask", { values: { "answers-q": "q" } });
  assert.ok(beside(s, b).startsWith(word("ai.refused.projectkeptaway", { for_uses: "", member: "", date: "", reason: "" }).slice(0, 20)));
  assert.equal(main(s).querySelector(".cs-machinework"), null);
});

test("R27 (D17; agent-worker R89): an ANSWER_MALFORMED refusal of ask is drawn by its words, never \"This could not be read\", and nothing of the answer is shown", async () => {
  const unread = word("shell.unread");
  for (const plane of [{ ...REACH, ask: refused("ANSWER_MALFORMED", null, 502, { field: "summary" }) },
    { ...REACH, ask: answered({ event: "refused", ok: false, code: "ANSWER_MALFORMED", field: "summary" }) }]) {
    const p = await open("/app/answers", plane);
    const b = await press(p, "ask", { values: { "answers-q": "How many?" } });
    assert.equal(beside(p, b).replace(/\s+/g, " "), word("refusal.ANSWER_MALFORMED", { field: "summary" }));
    assert.ok(!text(p).includes(unread));
    assert.equal(main(p).querySelector(".cs-machinework"), null);
  }
  assert.equal(screen("answers").acts.find((a) => a.op === "ask").refusals.ANSWER_MALFORMED, "refusal.ANSWER_MALFORMED");
});

test("R27: an answer's not_established is drawn beneath its heading as the sentences it holds; control: a full answer is drawn as before, with no such heading", async () => {
  const sure = { ...EVENT, answer: { ...EVENT.answer, not_established: ["The cause is not established by the record.", { text: "No inspection dates were found." }, { withheld: 2, codes: [] }] } };
  const p = await open("/app/answers", { ...REACH, ask: answered(sure) });
  await press(p, "ask", { values: { "answers-q": "Why?" } });
  const mw = main(p).querySelector(".cs-machinework");
  assert.ok(inOrder(text(p, mw), [word("screen.answers.notestablished"), "The cause is not established by the record.", "No inspection dates were found.", word("screen.answers.withheld", { n: "2" })]));
  const full = await open("/app/answers", { ...REACH, ask: answered({ ...EVENT, answer: { ...EVENT.answer, not_established: [] } }) });
  await press(full, "ask", { values: { "answers-q": "How many?" } });
  assert.ok(!text(full).includes(word("screen.answers.notestablished")), "an empty list draws no heading");
  assert.ok(text(full).includes("812 of 903 were closed within 7 days."));
});

test("R6: while not reachable the screen is \"Find and count\": search here, and ruleanswer \"Show how this was counted\"", async () => {
  const p = await open("/app/answers", {
    search: ok({ hits: [{ bundle_id: "INF-1", title: "Work orders", snippet: "903 rows" }] }),
    ruleanswer: ok({ ok: true, service: "occurrences", value: 812, basis: "903 rows", label: "computed_fact" }),
  });
  assert.equal(main(p).querySelector("h1").textContent, word("screen.answers.offtitle"));
  assert.deepEqual(ops(p), ["search", "standingquestionset"]);
  assert.ok(!ops(p).includes("ask"), "no assistant control drawn (interface-shell R20)");
  await press(p, "search", { values: { "answers-q": "work orders" }, reason: R });
  assert.ok(p.byOp("search").some((r) => r.query.q === "work orders"), "R6: the plain words go to the fields route alone, never joined to a passage: term by OR");
  assert.ok(p.byOp("search").every((r) => !/\bOR\b/.test(r.query.q)), "R6: no search the screen sends joins routes by OR");
  assert.ok(p.byOp("search").some((r) => r.query.q === "passage:work passage:orders"), "R35: the passages holding the words are asked in a read of their own");
  assert.ok(main(p).querySelector('.cs-origin[data-origin="search"]'));
  assert.deepEqual(ops(p), ["search", "ruleanswer", "standingquestionset"]);
  assert.ok(button(p, "ruleanswer").textContent.startsWith(word("act.ruleanswer.label.answers")));
  await press(p, "ruleanswer", { reason: R });
  assert.deepEqual({ ...last(p, "ruleanswer").body, reason: undefined }, { service: "occurrences", args: { q: "work orders" }, reason: undefined });
  assert.ok(text(p).includes(word("screen.answers.rule.value", { label: word("screen.answers.label.computed_fact"), value: "812" }) + word("screen.answers.rule.basis", { basis: "903 rows" })));
  const nh = await open("/app/answers", { search: ok({ hits: [] }), ruleanswer: ok({ ok: true, service: "occurrences", not_held: { reason: "no table declared" } }) });
  await press(nh, "search", { values: { "answers-q": "zz" }, reason: R });
  assert.ok(text(nh).includes(word("screen.finder.none")));
  await press(nh, "ruleanswer", { reason: R });
  assert.ok(text(nh).includes(word("screen.answers.rule.notheld", { reason: "no table declared" })));
});

test("R6: in both, standingquestionset keeps asking and standingquestionend stops, with \"New matches will arrive in your queue as a list\"", async () => {
  for (const reach of [REACH, {}]) {
    const p = await open("/app/answers", { ...reach, standingquestionset: ok({ ok: true, id: "STQ-9", ends: "2027-10-12" }), standingquestionend: ok({ ok: true, id: "STQ-9" }) });
    assert.ok(text(p).includes(word("screen.answers.keeping")));
    const none = await press(p, "standingquestionset", { values: { "answers-q": "" } });
    assert.equal(beside(p, none), word("screen.answers.questionfirst"));
    await press(p, "standingquestionset", { values: { "answers-q": "pothole closures" } });
    const b = last(p, "standingquestionset").body;
    assert.deepEqual([b.question, b.query, b.cadence], ["pothole closures", "pothole closures", "weekly"]);
    assert.equal(button(p, "standingquestionend").dataset.id, "STQ-9");
    assert.ok(text(p).includes(word("screen.answers.kept", { cadence: word("screen.answers.cadence.weekly"), date: dmy("2027-10-12") })));
    await press(p, "standingquestionend");
    assert.deepEqual(last(p, "standingquestionend").body, { id: "STQ-9" });
    assert.ok(!ops(p).includes("standingquestionend"));
  }
  assert.ok(acts);
});

test("R34: every key Ask reads is a word of the list", () => {
  for (const k of screen("answers").words) assert.ok(hasWord(k), k);
  for (const k of Object.values(screen("answers").acts.find((a) => a.op === "ask").refusals).filter((k) => typeof k === "string")) assert.ok(hasWord(k), k);
});

/* R6, R35 with the real search (retrieval's own world): the words are found in a title and in a passage, and no search the screen sends is refused. */
test("R6: Ask-as-search, while not reachable, is answered by the real retrieval: words in a title and words only in a passage are found, nothing is refused ROUTES_CROSSED", async () => {
  const w = world({ members: ["ann", "vera"], admins: ["adele"] });
  const c = w.cap("a", "bytes");
  w.doc("INFO-1", { title: "Sewer fund audit" }, { captures: [c] });
  w.unit(c.sha, "INFO-1", 0, "the sewer fund was approved by the council");
  w.doc("INFO-2", { title: "Parks budget" });
  const refusals = [];
  const real = async (req) => {
    const a = w.retrieval.search({ q: req.query.q, viewer: V("vera"), mode: "page", limit: Number(req.query.limit), snippet: Number(req.query.snippet) });
    if (a.ok === false) refusals.push(a.code || a.reason);
    return ok(a);
  };
  const p = await open("/app/answers", { search: real });
  for (const [words, title] of [["sewer", "Sewer fund audit"], ["approved council", "Sewer fund audit"], ["parks", "Parks budget"]]) {
    await press(p, "search", { values: { "answers-q": words }, reason: R });
    await new Promise((r) => setTimeout(r, 20));
    assert.ok(text(p).includes(title), `${words}: the document "${title}" is found`);
  }
  await press(p, "search", { values: { "answers-q": "zzzzqq" }, reason: R });
  assert.ok(text(p).includes(word("screen.finder.none")), "control: words nothing holds draw none");
  assert.deepEqual(refusals, [], "no search the screen sent was refused");
});
