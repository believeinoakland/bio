/* case-checker at its interface: `checkAccount` (R24; D56; K2451, K2471, K2531), each of `case-disclosures` R30's arms
   with its negative control, its answer's shape, and the same check run offline by `checkCaseFile` (R1) over a carried
   `account:` block. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CC from "../../../src/case-checker/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { caseFile, caseFiles, byId, rows, A, B, C, MINUTES } from "./fixture.mjs";

const PASSAGE = "The lease was approved without a vote on March 3, 2024, for $4,200, by Jane Doe of the Parks Board.";
/* what a sentence cites, as case-grammar R23 spells it (K2528): {kind, ref, ord}, ord null but for a leg */
const P1 = { kind: "passage", ref: "P1", ord: null }, P9 = { kind: "passage", ref: "P9", ord: null };
const F1 = { kind: "finding", ref: "F1", ord: null }, F2 = { kind: "finding", ref: "F2", ord: null };
const leg = (ref, ord) => ({ kind: "leg", ref, ord });
const CITED = [
  { ...P1, text: PASSAGE },
  { ...F1, text: "The board approved the lease without a vote." },
  { ...leg("F1", 0), text: "INFO-1 the minutes", role: "supports" },
  { ...leg("F1", 1), text: "INFO-2 the memo", role: "cuts_against" },
];
const CONCLUSIONS = [
  { finding: "F1", claim: "The lease was approved without a vote", claim_state: "adopted",
    legs: [{ ord: 0, target: "INFO-1", role: "supports" }, { ord: 1, target: "INFO-2", role: "cuts_against" }] },
  { finding: "F2", claim: null, claim_state: "undetermined", legs: [] },
];
const judge = (account, over = {}) => CC.checkAccount({ account, cited: CITED, printed: ["S1"], conclusions: CONCLUSIONS, ...over });
const codes = (r) => r.departures.map((x) => [x.ord, x.code]);
const detail = (r) => r.departures.map((x) => x.detail).join(" | ");
const one = (text, cites = [P1], more = {}) => [{ ord: 0, text, cites, kind: "account", began_as: "member", ...more }];

test("R24 (K2531): the answer is {ok: true, departures: [{ord, code, detail}]}, one entry per sentence and arm that fails, ord the account row's, code one of R30's five arm codes in its order; malformed input is {ok: false, reason, field}", () => {
  assert.deepEqual(CC.ACCOUNT_CODES, ["ACCOUNT_SENTENCE_UNSUPPORTED", "ACCOUNT_FACT_NOT_IN_CITED", "ACCOUNT_CONTRADICTED_BY_RECORD",
                                      "ACCOUNT_BIAS_NOT_PRINTED", "ACCOUNT_CLAIM_NOT_BIAS"]);
  const ok = judge([
    { ord: 10, text: "The lease was approved without a vote on 2024-03-03, for $4,200, by Jane Doe.", cites: [P1] },
    { ord: 11, text: "Its minutes show the lease was approved without a vote.", cites: [F1, leg("F1", 0)] },
    { ord: 12, text: "The memo cuts against that, though it shows the board met.", cites: [leg("F1", 1)] },
    { ord: 13, text: "This group checks a vendor's word more closely before relying on it.", cites: [], bias_statement: "S1" },
  ]);
  assert.deepEqual(ok, { ok: true, departures: [] });
  const r = judge([
    { ord: 7, text: "Nobody voted.", cites: [] },
    { ord: 8, text: "The lease was approved without a vote.", cites: [P1] },
    { ord: 9, text: "John Roe paid it.", cites: [P1] },
    { ord: 3, text: "Jane Doe favoured it.", cites: [], bias_statement: "S7" },
  ]);
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r), ["ok", "departures"]);
  for (const d of r.departures) {
    assert.deepEqual(Object.keys(d), ["ord", "code", "detail"]);
    assert.ok(CC.ACCOUNT_CODES.includes(d.code));
    assert.equal(typeof d.detail, "string");
  }
  /* each sentence and arm that fails, in the account's order and R30's order; never only the first */
  assert.deepEqual(codes(r), [[7, "ACCOUNT_SENTENCE_UNSUPPORTED"], [9, "ACCOUNT_FACT_NOT_IN_CITED"], [3, "ACCOUNT_BIAS_NOT_PRINTED"], [3, "ACCOUNT_CLAIM_NOT_BIAS"]]);
  /* a row with no ord is answered by its place */
  assert.deepEqual(codes(CC.checkAccount({ account: [{ text: "x", cites: [] }] })), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"]]);
  for (const [bad, field] of [[{ account: "x" }, "account"], [{ account: [{ text: "" }] }, "account[0]"], [{ account: [7] }, "account[0]"],
                              [{ account: [{ text: "t", cites: [{ kind: "leg", ref: "F1" }] }] }, "account[0].cites"],
                              [{ account: [{ text: "t", cites: [{ kind: "story", ref: "F1" }] }] }, "account[0].cites"],
                              [{ account: [], cited: 5 }, "cited"], [{ account: [], cited: [{ text: "t" }] }, "cited[0]"],
                              [{ account: [], printed: "S1" }, "printed"], [{ account: [], conclusions: [{}] }, "conclusions[0]"]])
    assert.deepEqual(CC.checkAccount(bad), { ok: false, reason: "MALFORMED", field }, field);
});

test("R24 arm 1: a sentence not bias-marked that cites nothing, or only what it may not cite, is ACCOUNT_SENTENCE_UNSUPPORTED (through answers.checkSentences); a bias-marked one citing nothing is not", () => {
  assert.deepEqual(codes(judge(one("Nobody voted on it.", []))), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"]]);
  const unread = judge(one("The lease was approved without a vote.", [P9]));
  assert.deepEqual(codes(unread), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"]]);
  assert.match(detail(unread), /sentence 0 cites P9, which is not among what it may cite/);
  assert.match(detail(judge(one("The minutes show it.", [leg("F9", 2)]))), /cites leg 2 of F9, which is not among/);
  /* cites in a front-matter row's spelling: canonical JSON in one value */
  assert.deepEqual(codes(judge(one("The lease was approved without a vote.", JSON.stringify([P1])))), []);
  /* answers' own voice (its verdict and cause words) is not an arm: it neither refuses nor hides arm 1 */
  assert.deepEqual(codes(judge(one("It is likely the lease was approved because nobody objected.", [P1]))), []);
  assert.deepEqual(codes(judge(one("It is likely the lease was approved because nobody objected.", [P9]))), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"]]);
  /* negative control: bias-marked, citing nothing, its statement printed */
  assert.deepEqual(codes(judge(one("This group expects a vendor to be favoured.", [], { bias_statement: "S1" }))), []);
});

test("R24 arm 2: a figure, date, name or quotation not in what it cites is ACCOUNT_FACT_NOT_IN_CITED, each named; the same facts taken from what it cites pass", () => {
  const cases = [
    ["The lease cost $9,999.", /the figure \$9,999/],
    ["The lease was approved on 2023-05-01.", /the date 2023-05-01/],
    ["The lease was approved by John Roe.", /the name John Roe/],
    ["The minutes say “approved after a long debate”.", /the quotation "approved after a long debate"/],
  ];
  for (const [text, named] of cases) {
    const r = judge(one(text));
    assert.deepEqual(codes(r), [[0, "ACCOUNT_FACT_NOT_IN_CITED"]], text);
    assert.match(detail(r), named, text);
  }
  /* negative controls: each fact as what it cites states it (a date in another spelling, a figure word for word) */
  for (const text of ["The lease cost $4,200.", "It was approved on 2024-03-03.", "It was approved in March 2024.", "Jane Doe approved it.",
                      "The minutes say “approved without a vote”.", "The Parks Board approved it."])
    assert.deepEqual(codes(judge(one(text))), [], text);
  /* every fact missing is named, not only the first, in one departure for the sentence */
  const all = judge(one("John Roe paid $9,999 on 2023-05-01, saying “never”."));
  assert.deepEqual(codes(all), [[0, "ACCOUNT_FACT_NOT_IN_CITED"]]);
  for (const re of [/the figure \$9,999/, /the date 2023-05-01/, /the name John Roe/, /the quotation "never"/]) assert.match(detail(all), re);
  /* arm 1 answered: nothing is cited, so arm 2 is not asked */
  assert.deepEqual(codes(judge(one("John Roe paid $9,999.", []))), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"]]);
});

test("R24 arm 3: a finding's conclusion stated otherwise than the record holds, a determination the record does not hold, or a leg that cuts against it read as supporting it, is ACCOUNT_CONTRADICTED_BY_RECORD", () => {
  const negated = judge(one("The lease was not approved without a vote.", [F1]));
  assert.deepEqual(codes(negated), [[0, "ACCOUNT_CONTRADICTED_BY_RECORD"]]);
  assert.match(detail(negated), /states finding F1's conclusion other than the record holds it/);
  const undetermined = judge(one("This established that the lease was approved.", [F2]), { cited: [...CITED, { ...F2, text: "This established that the lease was approved." }] });
  assert.deepEqual(codes(undetermined), [[0, "ACCOUNT_CONTRADICTED_BY_RECORD"]]);
  assert.match(detail(undetermined), /states finding F2 as determined, where the record holds no adopted conclusion/);
  const cutting = judge(one("The memo shows the board acted alone.", [leg("F1", 1)]), { cited: [...CITED.slice(0, 3), { ...leg("F1", 1), text: "The memo shows the board acted alone." }] });
  assert.deepEqual(codes(cutting), [[0, "ACCOUNT_CONTRADICTED_BY_RECORD"]]);
  assert.match(detail(cutting), /reads leg 1 of F1 as supporting finding F1, where it cuts against it/);
  /* negative controls: the conclusion as held; the cutting leg read as cutting; a supporting leg read as supporting */
  assert.deepEqual(codes(judge(one("The lease was approved without a vote.", [F1]))), []);
  assert.deepEqual(codes(judge(one("The memo cuts against it.", [leg("F1", 1)]))), []);
  assert.deepEqual(codes(judge(one("The minutes show it.", [leg("F1", 0)]))), []);
  /* the leg's role read from what was cited when the conclusions do not list it */
  assert.deepEqual(codes(CC.checkAccount({ account: one("The memo shows it.", [leg("G", 4)]), cited: [{ ...leg("G", 4), text: "The memo shows it.", role: "cuts_against" }] })),
    [[0, "ACCOUNT_CONTRADICTED_BY_RECORD"]]);
});

test("R24 arms 4 and 5: a bias-marked sentence whose statement is not printed is ACCOUNT_BIAS_NOT_PRINTED; one stating a fact or a finding's outcome is ACCOUNT_CLAIM_NOT_BIAS; both are answered, in order", () => {
  const bias = (text, statement = "S1") => one(text, [], { bias_statement: statement });
  assert.deepEqual(codes(judge(bias("This group expects a vendor to be favoured.", "S7"))), [[0, "ACCOUNT_BIAS_NOT_PRINTED"]]);
  /* a statement printed by its bundle and id */
  assert.deepEqual(codes(judge(bias("This group expects a vendor to be favoured.", "S7"), { printed: [{ bundle: "BND-1", id: "S7" }] })), []);
  for (const text of ["The vendor was paid $4,200.", "The vendor was favoured on 2024-03-03.", "Jane Doe favoured the vendor.",
                      "The board “never voted”.", "This shows that the board favoured the vendor.", "The lease was approved without a vote, as we expected."]) {
    const r = judge(bias(text));
    assert.deepEqual(codes(r), [[0, "ACCOUNT_CLAIM_NOT_BIAS"]], text);
    assert.match(detail(r), /a fact is never bias/);
  }
  /* both arms, in R30's order */
  assert.deepEqual(codes(judge(bias("Jane Doe favoured the vendor.", "S7"))), [[0, "ACCOUNT_BIAS_NOT_PRINTED"], [0, "ACCOUNT_CLAIM_NOT_BIAS"]]);
  /* a bias-marked sentence is not asked arms 1 and 2: its facts are arm 5's */
  assert.deepEqual(codes(judge(bias("Jane Doe favoured the vendor."))).map((x) => x[1]), ["ACCOUNT_CLAIM_NOT_BIAS"]);
});

test("R24: pure, the same arguments the same answer, reading only its arguments; it never throws", () => {
  const account = [{ ord: 0, text: "Nobody voted.", cites: [] }, { ord: 1, text: "John Roe paid it.", cites: [P1] }];
  const args = { account, cited: CITED, printed: ["S1"], conclusions: CONCLUSIONS };
  const before = canonicalJson(args);
  assert.equal(canonicalJson(CC.checkAccount(args)), canonicalJson(CC.checkAccount(args)));
  assert.equal(canonicalJson(args), before);
  for (const bad of [undefined, null, 7, "x", [], { account: [{ text: "t", cites: [null, 5, {}] }] }]) assert.doesNotThrow(() => CC.checkAccount(bad));
  assert.deepEqual(CC.checkAccount({}), { ok: true, departures: [] });
});

/* ------------------------------------------------------------ offline: R1 runs R24 over the carried document */

const passageId = () => JSON.parse(caseFiles().texts.get(CG.caseFilePath("passages", A)))[0].content_id;
const PASSAGE_OF = () => ({ kind: "passage", ref: passageId(), ord: null });
const FINDING = (ref) => ({ kind: "finding", ref, ord: null });
const conclusionLines = [
  ...rows("case_conclusions", [{ target: A, claim: "The lease was approved without a vote", claim_state: "adopted", claim_detail: null },
                               { target: C, claim: null, claim_state: "undetermined", claim_detail: "the record cannot establish who watched" }])];
const accountLines = (list) => ["account:", ...list.flatMap((r) => [
  `  - ord: ${r.ord}`, `    text: "${r.text}"`, `    cites: '${JSON.stringify(r.cites)}'`, `    kind: account`,
  `    bias_statement: ${r.bias_statement ? r.bias_statement : "null"}`, "    began_as: member"])];
const LENS = [{ bundle: "BND-2026-0001", id: "S1", kind: "scrutiny", subject: "the vendor", text: "We check a vendor's word more closely.",
                justification: "It misled us before.", citations: [] }];
const offline = (account, opts = {}) => CC.checkCaseFile({ parts: caseFile({ docLines: [...conclusionLines, ...accountLines(account)], lens: LENS, ...opts }).parts });
const results = (answer) => Object.fromEntries(answer.findings.map((f) => [f.finding, f.result]));

test("R24 R1: offline, an account tied to the carried passages, materials, legs and signed conclusions recreates every finding, with the account's answer", async () => {
  const r = await offline([
    { ord: 0, text: "The lease was approved without a vote.", cites: [PASSAGE_OF(), FINDING(A)] },
    { ord: 1, text: "The board adjourned at nine.", cites: [{ kind: "material", ref: MINUTES, ord: null }] },
    { ord: 2, text: "The minutes bear on it.", cites: [leg(A, 0)] },
    { ord: 3, text: "We read a vendor's word more closely.", cites: [], bias_statement: "S1" },
  ]);
  assert.deepEqual(results(r), { [A]: "recreated", [C]: "recreated", [B]: "recreated" }, JSON.stringify(r.findings[0].differs));
  assert.deepEqual(r.account, { sentences: 4, judged: 4, ok: true, departures: [], not_judged: [] });
});

test("R24 R1 R11: offline, each arm's departure is a differs entry for the case naming its code, so no finding recreates; it is the same answer checkAccount gives", async () => {
  const account = [
    { ord: 0, text: "Nobody voted.", cites: [] },
    { ord: 1, text: "John Roe approved the lease.", cites: [PASSAGE_OF()] },
    { ord: 2, text: "The lease was not approved without a vote.", cites: [FINDING(A)] },
    { ord: 3, text: "We expect favour.", cites: [], bias_statement: "S7" },
    { ord: 4, text: "We expect favour, as the vote of 2024-03-03 shows.", cites: [], bias_statement: "S1" },
  ];
  const r = await offline(account);
  assert.equal(r.account.ok, false);
  assert.deepEqual(r.account.departures.map((x) => [x.ord, x.code]), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"], [1, "ACCOUNT_FACT_NOT_IN_CITED"],
    [2, "ACCOUNT_CONTRADICTED_BY_RECORD"], [3, "ACCOUNT_BIAS_NOT_PRINTED"], [4, "ACCOUNT_CLAIM_NOT_BIAS"]]);
  assert.deepEqual(new Set(Object.values(results(r))), new Set(["did_not_recreate"]));
  for (const f of r.findings) {
    const mine = f.differs.filter((e) => e.check === "account");
    assert.deepEqual(mine.map((e) => [e.about, e.code, e.detail]), r.account.departures.map((x) => [`account sentence ${x.ord}`, x.code, x.detail]), f.finding);
  }
  /* one body of check code: checkAccount over what the case file carries gives the same departures */
  const direct = CC.checkAccount({ account, printed: [{ bundle: LENS[0].bundle, id: "S1" }],
    cited: [{ ...FINDING(A), text: "The lease was approved without a vote" }, { ...PASSAGE_OF(), text: "The lease was approved without a vote." }],
    conclusions: [{ finding: A, claim: "The lease was approved without a vote", claim_state: "adopted" }] });
  assert.deepEqual(direct.departures, r.account.departures);
});

test("R24 R1 R9: offline, a sentence citing material whose text the case file does not carry is not judged, named, and missing for the case; a document with no account block answers account null; an unreadable block differs", async () => {
  const r = await offline([{ ord: 0, text: "John Roe adjourned it.", cites: [{ kind: "material", ref: MINUTES, ord: null }] }],
    { edit: (b) => b.delete(CG.caseFilePath("extracted_text", MINUTES)) });
  assert.equal(r.account.judged, 0);
  assert.equal(r.account.ok, null);
  assert.deepEqual(r.account.not_judged.map((n) => [n.ord, n.cites]), [[0, [MINUTES]]]);
  assert.ok(byId(r)[C].missing.some((e) => e.check === "account" && /whose text this case file does not carry, so it is not judged/.test(e.detail)));
  assert.equal(byId(r)[C].result, "recreated_in_part");
  assert.equal((await CC.checkCaseFile({ parts: caseFile().parts })).account, null);
  const unreadable = await CC.checkCaseFile({ parts: caseFile({ docLines: ["account:", "  - ord: 0", "    text: \"\""] }).parts });
  assert.equal(unreadable.account.ok, false);
  assert.deepEqual(unreadable.account.malformed, { reason: "MALFORMED", field: "account[0]" });
  assert.ok(unreadable.findings.every((f) => f.differs.some((e) => e.check === "account" && /account cannot be read/.test(e.detail))));
});
