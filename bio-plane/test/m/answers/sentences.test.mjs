/* Baselines, verdict words and the sentence checks (R31–R33; D20, D56, H30 (4); N820, K2405, K2418, K2471, K2472), at
   the interface: `checkAnswer` over a read log filled as the plane fills it, and `checkSentences`, the same checks over
   sentences that each name what they cite, for `case-disclosures` R30 through `case-checker` R24, given a read log or,
   offline, the objects that were read. Each check with its negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { answersWorld, answer, V } from "./fixture.mjs";
import { checkAnswer, checkSentences, ANSWERS_CHECKS, VERDICT_WORDS, BASIS_KINDS, LOOKED_STATES, SENTENCE_KINDS, ReadLog }
  from "../../../src/answers/index.mjs";

const BOB = V("bob");
const DOC = "INFO-2026-0001-budget";
const FND = "FND-2026-0003-overrun";
const CALC = "CALC-2026-0009";

function logged() {
  const w = answersWorld();
  const g = "grant-bob-s";
  w.a.logRead({ grant: g, viewer: BOB, op: "search", args: { q: "budget" },
    answer: { ok: true, hits: [{ bundle_id: DOC, title: "Budget 2025", snippet: "The parks budget for 2025 was $4,000,000. The mayor said the cut was due to falling revenue." }] } });
  w.a.logRead({ grant: g, viewer: BOB, op: "search", args: { q: "overrun" },
    answer: { ok: true, hits: [{ bundle_id: FND, state: "concluded", conclusion: "The overrun was caused by the late contract award." }] } });
  w.a.logRead({ grant: g, viewer: BOB, op: "calculation", args: { id: CALC },
    answer: { ok: true, calc_id: CALC, results: { change: { value: "500000" } } } });
  return { w, g, log: w.a.readLog(g) };
}
const codes = (r) => r.withheld.filter((x) => x.sentence).map((x) => [x.sentence, x.code]);
const H = { budget: { address: DOC, quote: "The parks budget for 2025 was $4,000,000." },
            mayor: { address: DOC, quote: "the cut was due to falling revenue" },
            finding: { address: FND, quote: "The overrun was caused by the late contract award." },
            calc: { address: CALC, quote: "500000" } };

test("R31 a baseline sentence carries {baselines: [{value, rests_on, basis_kind, looked}], difference}; a baseline without its basis, or in any other shape, is ANSWER_MALFORMED naming the field", () => {
  const { log } = logged();
  assert.ok(SENTENCE_KINDS.includes("baseline"));
  assert.deepEqual(BASIS_KINDS, ["document", "firsthand", "as_recalled"]);
  assert.deepEqual(LOOKED_STATES, ["not_yet_looked_for", "looked_for_and_not_found"]);
  const doc = { value: "$4,000,000", rests_on: ["h1"], basis_kind: "document", looked: null };
  const recalled = { value: "about forty", rests_on: [], basis_kind: "as_recalled", looked: "not_yet_looked_for" };
  const firsthand = { value: "twelve", rests_on: [], basis_kind: "firsthand", looked: { state: "looked_for_and_not_found", where: "the clerk's minutes for 2024" } };
  const s = (baselines, over = {}) => ({ text: "The parks budget was the baseline.", kind: "baseline", support: ["h1"], baselines,
                                         difference: null, ...over });
  const good = answer({ holdings: [H.budget], sentences: [s([doc, recalled, firsthand], { difference: "the budget now differs from it" })] });
  const ok = checkAnswer(good, { readLog: log, viewer: BOB });
  assert.equal(ok.ok, true, JSON.stringify(ok)); assert.deepEqual(ok.withheld, []);
  assert.deepEqual(ok.answer.sentences[0].baselines, [doc, recalled, firsthand]);
  const strip = (b, k) => { const c = { ...b }; delete c[k]; return c; };
  const cases = [
    [s([strip(doc, "basis_kind")]), "sentences[0].baselines[0].basis_kind"],
    [s([{ ...doc, basis_kind: "rumour" }]), "sentences[0].baselines[0].basis_kind"],
    [s([strip(doc, "value")]), "sentences[0].baselines[0].value"],
    [s([strip(doc, "rests_on")]), "sentences[0].baselines[0].rests_on"],
    [s([{ ...doc, rests_on: ["h2"] }]), "sentences[0].baselines[0].rests_on"],
    [s([{ ...doc, rests_on: [] }]), "sentences[0].baselines[0].rests_on"],
    [s([{ ...doc, looked: "not_yet_looked_for" }]), "sentences[0].baselines[0].looked"],
    [s([strip(recalled, "looked")]), "sentences[0].baselines[0].looked"],
    [s([{ ...recalled, looked: "looked_for_and_not_found" }]), "sentences[0].baselines[0].looked"],
    [s([{ ...firsthand, looked: { state: "looked_for_and_not_found" } }]), "sentences[0].baselines[0].looked"],
    [s([{ ...doc, grade: "B" }]), "sentences[0].baselines[0].grade"],
    [s([]), "sentences[0].baselines"],
    [s(undefined), "sentences[0].baselines"],
    [s([doc], { difference: 7 }), "sentences[0].difference"],
  ];
  for (const [sentence, field] of cases) {
    const r = checkAnswer(answer({ holdings: [H.budget], sentences: [sentence] }), { readLog: log, viewer: BOB });
    assert.equal(r.code, "ANSWER_MALFORMED", field); assert.equal(r.field, field);
  }
  /* baselines belong to a baseline sentence alone */
  const r = checkAnswer(answer({ holdings: [H.budget], sentences: [{ text: "x", kind: "quote", support: ["h1"], baselines: [doc] }] }),
                        { readLog: log, viewer: BOB });
  assert.equal(r.field, "sentences[0].baselines");
});

test("R31 a baseline's own value is labelled by its basis: the member's account, or the quote of the document it rests on; any other figure in it must be sourced (R4)", () => {
  const { log } = logged();
  const recalled = { value: "$3,500,000", rests_on: [], basis_kind: "as_recalled", looked: "not_yet_looked_for" };
  const doc = { value: "$4,000,000", rests_on: ["h1"], basis_kind: "document", looked: null };
  const a = answer({ holdings: [H.budget, H.calc], sentences: [
    { text: "As recalled, the budget was $3,500,000 before.", kind: "baseline", support: ["h1"], baselines: [recalled], difference: null },
    { text: "The 2025 budget, $4,000,000, is the baseline.", kind: "baseline", support: ["h1"], baselines: [doc], difference: null },
    { text: "As recalled, the budget was $3,500,000, and $9,000,000 later.", kind: "baseline", support: ["h1"], baselines: [recalled], difference: null },
    { text: "The baseline is $4,000,000; it rose by $500,000.", kind: "baseline", support: ["h1", "h2"], baselines: [doc], difference: "$500,000" },
    { text: "The baseline was $7,000,000.", kind: "baseline", support: ["h1"], baselines: [{ ...doc, value: "$7,000,000" }], difference: null },
  ] });
  assert.deepEqual(codes(checkAnswer(a, { readLog: log, viewer: BOB })),
                   [["s3", "ANSWER_FIGURE_UNSOURCED"], ["s5", "ANSWER_FIGURE_UNSOURCED"]]);
});

test("R32 the closed list (K2472), frozen and tested whole: each verdict, likelihood or rating word in Civicsmith's own words is withheld ANSWER_VERDICT_WORD; inside a quotation of what was read it stands; grade and strength are not on it", () => {
  const { log } = logged();
  assert.ok(Object.isFrozen(VERDICT_WORDS));
  for (const l of Object.values(VERDICT_WORDS)) assert.ok(Object.isFrozen(l));
  assert.deepEqual(VERDICT_WORDS, {
    verdict: ["guilty", "innocent", "liable", "negligent", "illegal", "unlawful", "lawful", "corrupt", "corruption", "fraud",
              "fraudulent", "wrongdoing", "misconduct", "violated", "at fault", "to blame", "proven", "disproven", "verdict"],
    likelihood: ["likely", "unlikely", "probably", "probable", "possibly", "certainly", "clearly", "obviously",
                 "almost certainly", "chance", "odds", "probability"],
    rating: ["rating", "rated", "score", "scored", "out of ten", "stars"],
  });
  const words = Object.values(VERDICT_WORDS).flat();
  for (const word of words) {
    const up = word.replace(/^./, (c) => c.toUpperCase());
    for (const text of [`The clerk is ${word} here.`, `${up}, the budget was held.`]) {
      const r = checkAnswer(answer({ holdings: [H.budget], sentences: [{ text, kind: "explain", support: ["h1"] }] }), { readLog: log, viewer: BOB });
      assert.deepEqual(codes(r), [["s1", "ANSWER_VERDICT_WORD"]], text);
      assert.equal(r.withheld[0].translation, ANSWERS_CHECKS.ANSWER_VERDICT_WORD.translation);
    }
    /* the same word quoted as a body's or a finding's own words stands */
    const said = `The parks budget for 2025 was $4,000,000. Someone wrote ${word}.`;
    const lg = new ReadLog({ viewer: BOB }); lg.add("search", null, { bundle_id: DOC, snippet: said });
    const q = checkAnswer(answer({ holdings: [{ address: DOC, quote: said }],
      sentences: [{ text: `The record reads "${said}"`, kind: "quote", support: ["h1"] }] }), { readLog: lg, viewer: BOB });
    assert.deepEqual(codes(q), [], word);
  }
  /* a percentage stated as a likelihood; a percentage sourced from a calculation is not one */
  const pct = checkAnswer(answer({ holdings: [H.budget], sentences: [{ text: "We are 90% sure the budget was cut.", kind: "explain", support: ["h1"] }] }),
                          { readLog: log, viewer: BOB });
  assert.deepEqual(codes(pct), [["s1", "ANSWER_VERDICT_WORD"]]);
  /* whole words only, and the record's own labels are not on the list (the negative controls) */
  for (const text of ["The budget is held at grade B.", "Its strength is at the bar.", "The scoreboard and the starsign are held.",
                      "The budget was approved in 2025."]) {
    const r = checkAnswer(answer({ holdings: [H.budget], sentences: [{ text, kind: "explain", support: ["h1"] }] }), { readLog: log, viewer: BOB });
    assert.deepEqual(codes(r), [], text);
  }
  /* the summary is in Civicsmith's voice too */
  const sum = checkAnswer(answer({ holdings: [H.budget], summary: { text: "The budget was likely cut.", rests_on: ["s1"] },
    sentences: [{ text: "The budget is held.", kind: "explain", support: ["h1"] }] }), { readLog: log, viewer: BOB });
  assert.equal(sum.answer.summary, null);
  assert.ok(sum.withheld.some((x) => x.summary && x.code === "ANSWER_VERDICT_WORD"));
  assert.deepEqual(codes(sum), []);
});

test("R32 a cause is stated only quoting what was read that establishes it (a concluded finding, or a body's own words shown as theirs), else withheld ANSWER_CAUSE_UNESTABLISHED: cause not established", async () => {
  const { log } = logged();
  const a = answer({ holdings: [H.finding, H.mayor, H.budget], sentences: [
    { text: "The finding concluded: \"The overrun was caused by the late contract award.\"", kind: "quote", support: ["h1"] },
    { text: "The mayor said \"the cut was due to falling revenue\".", kind: "quote", support: ["h2"] },
    { text: "The overrun happened because the contract was late.", kind: "explain", support: ["h1"] },
    { text: "The budget fell, which led to fewer park hours.", kind: "explain", support: ["h3"] },
    { text: "The report says \"the cut was caused by the auditor\".", kind: "quote", support: ["h2"] },
    { text: "The budget for 2025 is held; the cause is not established.", kind: "explain", support: ["h3"] },
  ] });
  const r = checkAnswer(a, { readLog: log, viewer: BOB });
  assert.deepEqual(codes(r), [["s3", "ANSWER_CAUSE_UNESTABLISHED"], ["s4", "ANSWER_CAUSE_UNESTABLISHED"], ["s5", "ANSWER_CAUSE_UNESTABLISHED"]]);
  assert.equal(r.withheld[0].translation, ANSWERS_CHECKS.ANSWER_CAUSE_UNESTABLISHED.translation);
  assert.match(ANSWERS_CHECKS.ANSWER_CAUSE_UNESTABLISHED.translation, /cause is not established/);
  /* a rule item's quote, the plane's own (R22), is read too: held law stating a cause, quoted, stands */
  const { w: u, g } = logged();
  const id = u.standards.standardDeclare({ cite: "Test Bylaw § 7", kind: "ordinance", issuer: "The Selectboard",
    text: [u.passage("A permit lapses because no fee was paid within ten days.")], period: { from: "2020-01-01", to: null },
    reason: "a bylaw the group cites", author: BOB, viewer: BOB }).id;
  const held = await u.a.ruleAnswer({ service: "standard", args: { id }, viewer: BOB, grant: g });
  const quote = held.value.texts[0].text;
  const item = { rule_id: held.rule_id, service: "standard", value: held.value, label: "legal_information", quote };
  const rr = checkAnswer(answer({ rules: [item], sentences: [
    { text: `The bylaw reads "${quote}"`, kind: "rule", support: ["r1"] },
    { text: "A permit lapses because the clerk was slow.", kind: "rule", support: ["r1"] }] }), { readLog: u.a.readLog(g), viewer: BOB });
  assert.deepEqual(codes(rr), [["s2", "ANSWER_CAUSE_UNESTABLISHED"]]);
});

test("R33 checkSentences exports R4's checks over sentences that each name what they cite: the same judgement as checkAnswer's, given a read log or, offline, the objects that were read; ANSWER_MALFORMED for any other shape; pure; never throws", () => {
  const { w, g, log } = logged();
  const cited = { holdings: [H.budget, H.calc, { address: "INFO-2026-0999-x", quote: "made up" }], rules: [], looks: [{ level: "document", state: "LOOKED_ABSENT" }] };
  const sentences = [
    { text: "The 2025 parks budget is held.", kind: "quote", support: ["h1"] },
    { text: "It rose by $500,000.", kind: "figure", support: ["h2"] },
    { text: "It rose by $600,000.", kind: "figure", support: ["h2"] },
    { text: "It was adopted.", kind: "quote", support: ["h3"] },
    { text: "No contract is held among the documents.", kind: "absence", support: ["l1"] },
    { text: "The council was clearly negligent.", kind: "explain", support: ["h1"] },
    { text: "The budget fell because revenue fell.", kind: "explain", support: ["h1"] },
    { text: "The law requires a hearing.", kind: "rule", support: [] },
  ];
  const want = [["s3", "ANSWER_FIGURE_UNSOURCED"], ["s4", "ANSWER_CITES_UNREAD"], ["s6", "ANSWER_VERDICT_WORD"],
                ["s7", "ANSWER_CAUSE_UNESTABLISHED"], ["s8", "ANSWER_RULE_NOT_PLANE"]];
  const before = w.snapshot();
  const r = checkSentences(sentences, { cited, readLog: log });
  assert.equal(r.ok, true);
  assert.deepEqual(codes(r), want);
  assert.deepEqual(r.kept, ["s1", "s2", "s5"]);
  for (const x of r.withheld) assert.equal(x.translation, ANSWERS_CHECKS[x.code].translation);
  /* the same as checkAnswer's judgement of an answer holding them */
  assert.deepEqual(codes(checkAnswer(answer({ ...cited, sentences }), { readLog: w.a.readLog(g), viewer: BOB })), want);
  /* offline (case-checker R24): the objects that were read, as a list */
  const offline = checkSentences(sentences, { cited, readLog: log.entries.map((e) => e.answer) });
  assert.deepEqual(codes(offline), want);
  /* nothing read: closed book (R5), every sentence but the absence withheld (the negative control of the read log) */
  assert.deepEqual(checkSentences(sentences, { cited, readLog: [] }).kept, ["s5"]);
  assert.deepEqual(checkSentences(sentences, { cited }).kept, ["s5"]);
  /* malformed: refused whole, naming the field */
  for (const [args, field] of [[[{ text: "x", kind: "opinion", support: [] }], "sentences[0].kind"],
                               [[{ text: "x", kind: "quote", support: ["h9"] }], "sentences[0].support"],
                               ["not a list", "sentences"]]) {
    const m = checkSentences(args, { cited, readLog: log });
    assert.equal(m.code, "ANSWER_MALFORMED"); assert.equal(m.field, field);
  }
  assert.equal(checkSentences([], { cited: { holdings: [{ address: DOC }] } }).field, "holdings[0].quote");
  /* pure and total */
  assert.deepEqual(checkSentences(sentences, { cited, readLog: log }), r);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  const loop = {}; loop.self = loop;
  for (const bad of [undefined, null, [loop], [null]]) assert.doesNotThrow(() => checkSentences(bad, { cited: loop, readLog: loop }));
  assert.doesNotThrow(() => checkSentences(sentences, null));
});
