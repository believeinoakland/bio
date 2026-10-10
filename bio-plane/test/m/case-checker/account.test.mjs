/* case-checker at its interface: `checkAccount` (R24; D56; K2451, K2471), each of `case-disclosures` R30's arms with its
   negative control, and the same check run offline by `checkCaseFile` (R1) over a carried `account:` block. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CC from "../../../src/case-checker/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { caseFile, caseFiles, byId, rows, A, B, C, MINUTES } from "./fixture.mjs";

const PASSAGE = "The lease was approved without a vote on March 3, 2024, for $4,200, by Jane Doe of the Parks Board.";
const CITED = [
  { ref: "P1", text: PASSAGE },
  { ref: "F1", text: "The board approved the lease without a vote." },
  { ref: "F1#0", text: "INFO-1 the minutes", role: "supports" },
  { ref: "F1#1", text: "INFO-2 the memo", role: "cuts_against" },
];
const CONCLUSIONS = [
  { finding: "F1", claim: "The lease was approved without a vote", claim_state: "adopted",
    legs: [{ ord: 0, target: "INFO-1", role: "supports" }, { ord: 1, target: "INFO-2", role: "cuts_against" }] },
  { finding: "F2", claim: null, claim_state: "undetermined", legs: [] },
];
const judge = (account, over = {}) => CC.checkAccount({ account, cited: CITED, printed: ["S1"], conclusions: CONCLUSIONS, ...over });
const codes = (r) => (r.refusals || []).map((x) => [x.sentence, x.code]);
const one = (text, cites = ["P1"], more = {}) => [{ ord: 0, text, cites, kind: "account", began_as: "member", ...more }];

test("R24: the arms' codes are case-disclosures R30's, in its order; a sentence tied to what it cites passes", () => {
  assert.deepEqual(CC.ACCOUNT_CODES, ["ACCOUNT_SENTENCE_UNSUPPORTED", "ACCOUNT_FACT_NOT_IN_CITED", "ACCOUNT_CONTRADICTED_BY_RECORD",
                                      "ACCOUNT_BIAS_NOT_PRINTED", "ACCOUNT_CLAIM_NOT_BIAS"]);
  const ok = judge([
    { ord: 0, text: "The lease was approved without a vote on 2024-03-03, for $4,200, by Jane Doe.", cites: ["P1"] },
    { ord: 1, text: "Its minutes show the lease was approved without a vote.", cites: ["F1", "F1#0"] },
    { ord: 2, text: "The memo cuts against that, though it shows the board met.", cites: ["F1#1"] },
    { ord: 3, text: "This group checks a vendor's word more closely before relying on it.", cites: [], bias_statement: "S1" },
  ]);
  assert.deepEqual(ok, { ok: true, sentences: 4 });
});

test("R24 arm 1: a sentence not bias-marked that cites nothing, or only what it may not cite, is ACCOUNT_SENTENCE_UNSUPPORTED (through answers.checkSentences); a bias-marked one citing nothing is not", () => {
  assert.deepEqual(codes(judge(one("Nobody voted on it.", []))), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"]]);
  const unread = judge(one("The lease was approved without a vote.", ["P9"]));
  assert.deepEqual(codes(unread), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"]]);
  assert.deepEqual(unread.refusals[0].cites, ["P9"]);
  assert.match(unread.refusals[0].detail, /sentence 0 cites P9, which is not among what it may cite/);
  /* cites in a front-matter row's spelling: canonical JSON in one value */
  assert.deepEqual(codes(judge(one("The lease was approved without a vote.", '["P1"]'))), []);
  /* answers' own voice (its verdict and cause words) is not an arm: it neither refuses nor hides arm 1 */
  assert.deepEqual(codes(judge(one("It is likely the lease was approved because nobody objected.", ["P1"]))), []);
  assert.deepEqual(codes(judge(one("It is likely the lease was approved because nobody objected.", ["P9"]))), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"]]);
  /* negative control: bias-marked, citing nothing, its statement printed */
  assert.deepEqual(codes(judge(one("This group expects a vendor to be favoured.", [], { bias_statement: "S1" }))), []);
});

test("R24 arm 2: a figure, date, name or quotation not in what it cites is ACCOUNT_FACT_NOT_IN_CITED, each named; the same facts taken from what it cites pass", () => {
  const cases = [
    ["The lease cost $9,999.", "figure", "$9,999"],
    ["The lease was approved on 2023-05-01.", "date", "2023-05-01"],
    ["The lease was approved by John Roe.", "name", "John Roe"],
    ["The minutes say “approved after a long debate”.", "quotation", "approved after a long debate"],
  ];
  for (const [text, kind, said] of cases) {
    const r = judge(one(text));
    assert.deepEqual(codes(r), [[0, "ACCOUNT_FACT_NOT_IN_CITED"]], text);
    assert.deepEqual(r.refusals[0].facts, [{ kind, said }], text);
  }
  /* negative controls: each fact as what it cites states it (a date in another spelling, a figure word for word) */
  for (const text of ["The lease cost $4,200.", "It was approved on 2024-03-03.", "It was approved in March 2024.", "Jane Doe approved it.",
                      "The minutes say “approved without a vote”.", "The Parks Board approved it."])
    assert.deepEqual(codes(judge(one(text))), [], text);
  /* every fact missing is named, not only the first */
  const all = judge(one("John Roe paid $9,999 on 2023-05-01, saying “never”."));
  assert.deepEqual(all.refusals[0].facts.map((f) => f.kind).sort(), ["date", "figure", "name", "quotation"]);
  /* arm 1 answered: nothing is cited, so arm 2 is not asked */
  assert.deepEqual(codes(judge(one("John Roe paid $9,999.", []))), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"]]);
});

test("R24 arm 3: a finding's conclusion stated otherwise than the record holds, a determination the record does not hold, or a leg that cuts against it read as supporting it, is ACCOUNT_CONTRADICTED_BY_RECORD", () => {
  const negated = judge(one("The lease was not approved without a vote.", ["F1"]));
  assert.deepEqual(codes(negated), [[0, "ACCOUNT_CONTRADICTED_BY_RECORD"]]);
  assert.equal(negated.refusals[0].finding, "F1");
  const undetermined = judge(one("This established that the lease was approved.", ["F2"]), { cited: [...CITED, { ref: "F2", text: "This established that the lease was approved." }] });
  assert.deepEqual(codes(undetermined), [[0, "ACCOUNT_CONTRADICTED_BY_RECORD"]]);
  assert.match(undetermined.refusals[0].detail, /states finding F2 as determined, where the record holds no adopted conclusion/);
  const leg = judge(one("The memo shows the board acted alone.", ["F1#1"], {}), { cited: [...CITED.slice(0, 3), { ref: "F1#1", text: "The memo shows the board acted alone." }] });
  assert.deepEqual(codes(leg), [[0, "ACCOUNT_CONTRADICTED_BY_RECORD"]]);
  assert.equal(leg.refusals[0].leg, "F1#1");
  /* negative controls: the conclusion as held; the cutting leg read as cutting; a supporting leg read as supporting */
  assert.deepEqual(codes(judge(one("The lease was approved without a vote.", ["F1"]))), []);
  assert.deepEqual(codes(judge(one("The memo cuts against it.", ["F1#1"]))), []);
  assert.deepEqual(codes(judge(one("The minutes show it.", ["F1#0"]))), []);
  /* the leg's role read from what was cited when the conclusions do not list it */
  assert.deepEqual(codes(CC.checkAccount({ account: one("The memo shows it.", ["G#4"]), cited: [{ ref: "G#4", text: "The memo shows it.", role: "cuts_against" }] })),
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
    assert.match(r.refusals[0].detail, /a fact is never bias/);
  }
  /* both arms, in R30's order */
  assert.deepEqual(codes(judge(bias("Jane Doe favoured the vendor.", "S7"))), [[0, "ACCOUNT_BIAS_NOT_PRINTED"], [0, "ACCOUNT_CLAIM_NOT_BIAS"]]);
  /* a bias-marked sentence is not asked arms 1 and 2: its facts are arm 5's */
  assert.deepEqual(codes(judge(bias("Jane Doe favoured the vendor."))).map((x) => x[1]), ["ACCOUNT_CLAIM_NOT_BIAS"]);
});

test("R24: every sentence is judged and every departure named, in the account's order; pure, the same arguments the same answer; malformed arguments are MALFORMED and nothing is thrown", () => {
  const account = [
    { ord: 0, text: "Nobody voted.", cites: [] },
    { ord: 1, text: "The lease was approved without a vote.", cites: ["P1"] },
    { ord: 2, text: "John Roe paid it.", cites: ["P1"] },
    { ord: 3, text: "We expect favour.", cites: [], bias_statement: "S7" },
  ];
  const r = judge(account);
  assert.equal(r.ok, false);
  assert.equal(r.sentences, 4);
  assert.deepEqual(codes(r), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"], [2, "ACCOUNT_FACT_NOT_IN_CITED"], [3, "ACCOUNT_BIAS_NOT_PRINTED"]]);
  for (const x of r.refusals) assert.equal(x.text, account.find((a) => a.ord === x.sentence).text);
  const args = { account, cited: CITED, printed: ["S1"], conclusions: CONCLUSIONS };
  const before = canonicalJson(args);
  assert.equal(canonicalJson(CC.checkAccount(args)), canonicalJson(CC.checkAccount(args)));
  assert.equal(canonicalJson(args), before);                  /* reads only its arguments */
  for (const [bad, field] of [[{ account: "x" }, "account"], [{ account: [{ text: "" }] }, "account[0]"], [{ account: [7] }, "account[0]"],
                              [{ account: [], cited: 5 }, "cited"], [{ account: [], cited: [{ text: "t" }] }, "cited[0]"],
                              [{ account: [], printed: "S1" }, "printed"], [{ account: [], conclusions: [{}] }, "conclusions[0]"]])
    assert.deepEqual(CC.checkAccount(bad), { ok: false, refusals: [{ code: "MALFORMED", field }] }, field);
  for (const bad of [undefined, null, 7, "x", []]) assert.doesNotThrow(() => CC.checkAccount(bad));
  assert.deepEqual(CC.checkAccount({}), { ok: true, sentences: 0 });
});

/* ------------------------------------------------------------ offline: R1 runs R24 over the carried document */

const passageId = () => JSON.parse(caseFiles().texts.get(CG.caseFilePath("passages", A)))[0].content_id;
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
    { ord: 0, text: "The lease was approved without a vote.", cites: [passageId(), A] },
    { ord: 1, text: "The board adjourned at nine.", cites: [MINUTES] },
    { ord: 2, text: "The minutes bear on it.", cites: [`${A}#0`] },
    { ord: 3, text: "We read a vendor's word more closely.", cites: [], bias_statement: "S1" },
  ]);
  assert.deepEqual(results(r), { [A]: "recreated", [C]: "recreated", [B]: "recreated" }, JSON.stringify(r.findings[0].differs));
  assert.deepEqual(r.account, { sentences: 4, judged: 4, ok: true, refusals: [], not_judged: [] });
});

test("R24 R1 R11: offline, each arm's departure is a differs entry for the case naming its code, so no finding recreates; it is the same answer checkAccount gives", async () => {
  const account = [
    { ord: 0, text: "Nobody voted.", cites: [] },
    { ord: 1, text: "John Roe approved the lease.", cites: [passageId()] },
    { ord: 2, text: "The lease was not approved without a vote.", cites: [A] },
    { ord: 3, text: "We expect favour.", cites: [], bias_statement: "S7" },
    { ord: 4, text: "We expect favour, as the vote of 2024-03-03 shows.", cites: [], bias_statement: "S1" },
  ];
  const r = await offline(account);
  assert.equal(r.account.ok, false);
  assert.deepEqual(r.account.refusals.map((x) => [x.sentence, x.code]), [[0, "ACCOUNT_SENTENCE_UNSUPPORTED"], [1, "ACCOUNT_FACT_NOT_IN_CITED"],
    [2, "ACCOUNT_CONTRADICTED_BY_RECORD"], [3, "ACCOUNT_BIAS_NOT_PRINTED"], [4, "ACCOUNT_CLAIM_NOT_BIAS"]]);
  assert.deepEqual(new Set(Object.values(results(r))), new Set(["did_not_recreate"]));
  for (const f of r.findings) {
    const mine = f.differs.filter((e) => e.check === "account");
    assert.deepEqual(mine.map((e) => [e.about, e.code]), r.account.refusals.map((x) => [`account sentence ${x.sentence}`, x.code]), f.finding);
  }
  /* one body of check code: checkAccount over what the case file carries gives the same refusals */
  const direct = CC.checkAccount({ account, printed: [{ bundle: LENS[0].bundle, id: "S1" }],
    cited: [{ ref: A, text: "The lease was approved without a vote" }, { ref: passageId(), text: "The lease was approved without a vote." }],
    conclusions: [{ finding: A, claim: "The lease was approved without a vote", claim_state: "adopted" }] });
  assert.deepEqual(direct.refusals.map((x) => [x.sentence, x.code, x.detail]), r.account.refusals.map((x) => [x.sentence, x.code, x.detail]));
});

test("R24 R1 R9: offline, a sentence citing material whose text the case file does not carry is not judged, named, and missing for the case; a document with no account block answers account null", async () => {
  const r = await offline([{ ord: 0, text: "John Roe adjourned it.", cites: [MINUTES] }],
    { edit: (b) => b.delete(CG.caseFilePath("extracted_text", MINUTES)) });
  assert.equal(r.account.judged, 0);
  assert.equal(r.account.ok, null);
  assert.deepEqual(r.account.not_judged.map((n) => [n.sentence, n.cites]), [[0, [MINUTES]]]);
  assert.ok(byId(r)[C].missing.some((e) => e.check === "account" && /whose text this case file does not carry, so it is not judged/.test(e.detail)));
  assert.equal(byId(r)[C].result, "recreated_in_part");
  assert.equal((await CC.checkCaseFile({ parts: caseFile().parts })).account, null);
  /* a block that cannot be read differs for the case */
  const unreadable = await CC.checkCaseFile({ parts: caseFile({ docLines: ["account:", "  - ord: 0", "    text: \"\""] }).parts });
  assert.equal(unreadable.account.ok, false);
  assert.ok(unreadable.findings.every((f) => f.differs.some((e) => e.check === "account" && /account cannot be read/.test(e.detail))));
});
