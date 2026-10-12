/* action-grammar, T46 (T46-31; R26; DEC-194, N913; K2953, K2959): twenty-four of the C-117 rows R9 holds take their
   translations from `words.json`'s `refusal.<CODE>`, read by key from `ACTION_GRAMMAR_WORDS`, never a copy; C-117.32, .41,
   .55 and .57 keep their T45 translations; C-117.58 (no key in `words.json`) and every other row keep theirs; codes, numbers,
   `where`s and behaviour unmoved; `BEARING_REFUSED` is action-replies' row, not this module's. At the interface: the rows
   and the table as exported, and each code this module's arms push, read through its row, beside its control. */
import test from "node:test";
import assert from "node:assert/strict";
import * as AG from "../../../src/action-grammar/index.mjs";
import { T45_ROWS, ROWS_NOW, T46_TAKEN, T46_KEPT, wordsEn } from "./t45-rows.mjs";
import { ROW_NAMES, pushed } from "./fixture.mjs";

const C = AG.ACTION_CATALOGUE_CHECKS;
const en = (key) => {
  const w = wordsEn(key);
  assert.ok(typeof w === "string" && w.length > 0, `words.json holds ${key}`);
  return w;
};
const OFFICE = { state: "named", role: "Clerk", body: "the Board" };
const SHA = "a".repeat(64);
const sent = (o = {}) => ({ direction: "sent", at: "2026-06-01", artifact_sha: SHA, ...o });
const recv = (o = {}) => ({ direction: "received", at: "2026-06-10", account: "they wrote back", author: "member:a", ...o });

test("R26: ACTION_GRAMMAR_WORDS is frozen and holds exactly the twenty-four rows' keys, refusal.<CODE>, each words.json's en verbatim; each of those rows reads its translation from it by key, never a copy; codes, numbers and wheres unmoved; T45's words answered no longer", () => {
  assert.equal(T46_TAKEN.length, 24);
  assert.ok(Object.isFrozen(AG.ACTION_GRAMMAR_WORDS));
  assert.throws(() => { "use strict"; AG.ACTION_GRAMMAR_WORDS["refusal.X"] = "x"; }, TypeError);
  assert.deepEqual(Object.keys(AG.ACTION_GRAMMAR_WORDS), T46_TAKEN.map((c) => `refusal.${c}`), "the table holds exactly the twenty-four keys, in R26's order");
  for (const [key, text] of Object.entries(AG.ACTION_GRAMMAR_WORDS)) assert.equal(text, en(key), `${key} verbatim`);
  const want = ["C-117.30", "C-117.31", "C-117.33", "C-117.34", "C-117.35", "C-117.36", "C-117.37", "C-117.38", "C-117.39", "C-117.40",
    "C-117.42", "C-117.43", "C-117.44", "C-117.45", "C-117.46", "C-117.47", "C-117.48", "C-117.49", "C-117.50", "C-117.51", "C-117.52",
    "C-117.53", "C-117.54", "C-117.56"];
  assert.deepEqual(T46_TAKEN.map((c) => C[c].check), want, "R26's numbers");
  for (const code of T46_TAKEN) {
    const row = C[code];
    assert.deepEqual(Object.keys(row), ["check", "where", "translation"], code);
    assert.deepEqual([row.check, row.where], [T45_ROWS[code].check, T45_ROWS[code].where], `${code}: number and where unmoved`);
    assert.equal(row.translation, AG.ACTION_GRAMMAR_WORDS[`refusal.${code}`], `${code} reads refusal.${code}`);
    assert.equal(row.translation, en(`refusal.${code}`), code);
    assert.notEqual(row.translation, T45_ROWS[code].translation, `${code}: T45's words no longer`);
    assert.deepEqual(row, ROWS_NOW[code], code);
  }
  /* no other table holds them, and each sentence is one row's */
  for (const n of ROW_NAMES) if (n !== "ACTION_CATALOGUE_CHECKS") for (const code of T46_TAKEN) assert.ok(!(code in AG[n]), `${code} in ${n}`);
  const all = ROW_NAMES.flatMap((n) => Object.entries(AG[n]));
  for (const [code, row] of all)
    if (!T46_TAKEN.includes(code)) assert.ok(!Object.values(AG.ACTION_GRAMMAR_WORDS).includes(row.translation), `${code} holds a taken sentence`);
});

test("R26: C-117.32 OVERRIDE_GROUND_REFUSED, C-117.41 OFFICE_STATUS_WITHOUT_OUTCOME, C-117.55 REPLY_OWED_REFUSED and C-117.57 LAW_STAGE_UNKNOWN keep their T45 translations, not words.json's (each sentence and its requirement do not yet agree); C-117.58 MACHINE_CANNOT_SET_COPIED, which words.json does not hold, keeps its own; BEARING_REFUSED is no row here and its sentence is not taken; negative control: each kept row's words.json sentence differs from what the row reads", () => {
  for (const code of T46_KEPT) {
    assert.deepEqual(C[code], T45_ROWS[code], code);
    assert.ok(!(`refusal.${code}` in AG.ACTION_GRAMMAR_WORDS), `${code} not taken in T46`);
    assert.notEqual(C[code].translation, en(`refusal.${code}`), `${code}: words.json's sentence is not the row's`);
  }
  /* why each is kept, as R26 states it, read from the words themselves */
  assert.match(en("refusal.OVERRIDE_GROUND_REFUSED"), /is missing \{part\}/, "says only that a part is missing, while R15 also refuses one malformed");
  assert.match(en("refusal.OFFICE_STATUS_WITHOUT_OUTCOME"), /^Record what the reply said before/, "says only to record the outcome first");
  assert.match(en("refusal.REPLY_OWED_REFUSED"), /is yes or no\./, "says only yes or no, while R23 also refuses a missing reason");
  assert.match(en("refusal.LAW_STAGE_UNKNOWN"), /names a stage Civicsmith doesn't know/, "names Civicsmith bare (DEC-149)");
  assert.equal(wordsEn("refusal.MACHINE_CANNOT_SET_COPIED"), undefined);
  assert.deepEqual(C.MACHINE_CANNOT_SET_COPIED, T45_ROWS.MACHINE_CANNOT_SET_COPIED);
  /* BEARING_REFUSED: action-replies' C-150.3, minted and re-worded there (K231, K2953) */
  const all = ROW_NAMES.flatMap((n) => Object.entries(AG[n]));
  assert.ok(!all.some(([code]) => code === "BEARING_REFUSED"));
  assert.ok(!("refusal.BEARING_REFUSED" in AG.ACTION_GRAMMAR_WORDS));
  assert.ok(!all.some(([, r]) => r.translation === en("refusal.BEARING_REFUSED")));
  assert.deepEqual(pushed((f) => AG.bearingFindings([], [], f)).findings.map((x) => x.code), ["BEARING_REFUSED"], "R24 still pushes the finding");
});

test("R26: each code this module's arms push is answered through its row with the T46 words (the taken rows words.json's, the kept rows T45's), its finding unmoved in check, severity, message and code; negative controls: the same arm over a well-formed input pushes nothing", () => {
  const SELF = "ACTN-2026-0009-this";
  const PRESS = { state: "named", kind: "press", role: "editor", organisation: "The Paper" };
  const cases = [
    ["OVERRIDE_NO_GROUND", (f) => AG.overrideGroundFindings({}, f), (f) => AG.overrideGroundFindings({ ground: { kind: "legal_deadline", citation: "s.1", date: "2026-08-03" } }, f)],
    ["OVERRIDE_GROUND_REFUSED", (f) => AG.overrideGroundFindings({ ground: { kind: "legal_deadline", citation: "s.1", date: "2026-02-30" } }, f), null],
    ["COPIED_IS_ADDRESSEE", (f) => AG.copiedFindings({ counterparty: OFFICE, copied: [OFFICE] }, f), (f) => AG.copiedFindings({ counterparty: OFFICE, copied: [{ state: "named", role: "Auditor", body: "the Council" }] }, f)],
    ["PARTNERS_REFUSED", (f) => AG.partnersFindings({ partners: [{ name: "Jo Smith" }] }, f), (f) => AG.partnersFindings({ partners: [{ role: "co-signer", organisation: "Neighbours" }] }, f)],
    ["PRESS_TERMS_NOT_PRESS", (f) => AG.pressTermsFindings({ counterparty: OFFICE, press_terms: { on_record: "background" } }, f), (f) => AG.pressTermsFindings({ counterparty: PRESS, press_terms: { on_record: "background" } }, f)],
    ["PRESS_TERMS_REFUSED", (f) => AG.pressTermsFindings({ counterparty: PRESS, press_terms: { on_record: "maybe" } }, f), null],
    ["OFFICE_STATUS_UNKNOWN", (f) => f.push(...AG.entryFieldFindings([sent(), recv({ outcome: "granted", office_words: "In hand", office_status: "upheld" })], 1, { responseStatuses: ["implemented"] })),
      (f) => f.push(...AG.entryFieldFindings([sent(), recv({ outcome: "granted", office_words: "In hand", office_status: "implemented" })], 1, { responseStatuses: ["implemented"] }))],
    ["OFFICE_STATUS_WITHOUT_OUTCOME", (f) => f.push(...AG.entryFieldFindings([sent(), recv({ office_words: "In hand" })], 1)), null],
    ["FOUND_ELSEWHERE_NEEDS_CAPTURE", (f) => f.push(...AG.entryFieldFindings([recv({ found_elsewhere: "press" })], 0)),
      (f) => f.push(...AG.entryFieldFindings([recv({ account: undefined, author: undefined, artifact_sha: SHA, found_elsewhere: "press" })], 0))],
    ["FOUND_ELSEWHERE_REFUSED", (f) => f.push(...AG.entryFieldFindings([sent({ found_elsewhere: "press" })], 0)), null],
    ["SPEAKER_REFUSED", (f) => f.push(...AG.entryFieldFindings([recv({ speaker: "member:a" })], 0)), (f) => f.push(...AG.entryFieldFindings([sent({ speaker: "member:a" })], 0))],
    ["REPLY_OWED_REFUSED", (f) => AG.actionFieldFindings({ reply_owed: "no" }, {}, f), (f) => AG.actionFieldFindings({ reply_owed: false, reply_owed_reason: "an outlet owes us nothing" }, {}, f)],
    ["FOLLOWS_ACTION_REFUSED", (f) => AG.actionFieldFindings({ follows_action: "x" }, {}, f), (f) => AG.actionFieldFindings({ follows_action: { action: "ACTN-2026-0005-earlier" } }, { bundleId: SELF }, f)],
    ["FOLLOWS_ACTION_SELF", (f) => AG.actionFieldFindings({ follows_action: { action: SELF } }, { bundleId: SELF }, f), null],
    ["LAW_STAGE_UNKNOWN", (f) => f.push(...AG.lawStagesFindings([{ stage: "mediation" }])), (f) => f.push(...AG.lawStagesFindings([{ stage: "appeal" }]))],
  ];
  for (const [code, refuse, control] of cases) {
    const found = pushed(refuse).findings;
    assert.equal(found.length, 1, `${code}: ${JSON.stringify(found)}`);
    assert.deepEqual([found[0].check, found[0].severity, found[0].code], ["C-2.10", "error", code], code);
    assert.ok(found[0].message.length > 0 && !found[0].message.includes(C[code].translation), `${code}: the finding's message is the arm's, not the row's`);
    const want = T46_TAKEN.includes(code) ? en(`refusal.${code}`) : T45_ROWS[code].translation;
    assert.equal(C[found[0].code].translation, want, `${code} answered through its row`);
    if (control) assert.deepEqual(pushed(control).findings, [], `${code}: control`);
  }
  /* the codes actions mints at its own sites read their rows here the same way */
  for (const code of ["DETERMINATION_NOT_NONCOMPLIANT", "MACHINE_CANNOT_SET_PARTNERS", "MACHINE_CANNOT_SET_PRESS_TERMS", "RECEIPT_NOT_ON_SENT",
    "MACHINE_CANNOT_SET_REPLY_OWED", "NO_REPLY_OWED", "STAGE_NOT_IN_LAW", "FOLLOWS_ACTION_REWRITTEN", "MACHINE_CANNOT_SET_SCOPE", "SCOPE_NO_REASON",
    "SCOPE_UNCHANGED", "MACHINE_CANNOT_RECORD_PROMISE", "PROMISE_REFUSED"]) {
    assert.match(C[code].where, /^src\/actions\/index\.mjs /, code);
    assert.equal(C[code].translation, en(`refusal.${code}`), code);
  }
});
