/* action-grammar R1–R11 at the module's interface. Every value, row, finding and reading is compared with what the code
   answered for the same input before the move (`golden.json`: `actions/checks.mjs` and the catalogue's vocabularies;
   K585 (2)): the same in check, severity, message, repairs and code, and in order. Negative controls state each arm's
   answer by hand. Pure functions, driven with documents; the time is handed in. */
import test from "node:test";
import assert from "node:assert/strict";
import * as AG from "../../../src/action-grammar/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/index.mjs";
import * as J from "../../../../jurisdictions/index.mjs";
import { DOCS, KIND_SETS, SCALARS, NOW, TODAY } from "./corpus.mjs";
import { GOLDEN, suite, overDoc, pushed, plain, VALUE_NAMES, ROW_NAMES, REWORDED, REWORDED_COUNTS } from "./fixture.mjs";

const S = suite(AG);
const codes = (list) => list.map((x) => x.code);
const audit = (fm, o = {}) => pushed((f) => AG.checkActionExtension({ fm, nowMs: NOW, ...o }, f));
const TEST_VIEW = (() => { const c = J.combine(["test-port-ellery"]); assert.ok(c.ok); return c.view; })();

test("R1, R2: every vocabulary and bound is exported with its value unchanged from before the move", () => {
  assert.deepEqual(S.values, GOLDEN.values);
  for (const n of VALUE_NAMES) assert.ok(n in AG, n);
  assert.deepEqual(AG.PRODUCT_KINDS, ["records_request", "request_for_comment", "other"]);
  assert.deepEqual(AG.ACTION_BASIS_KINDS, ["rests_on", "advances"]);
  assert.deepEqual(AG.CORRESPONDENCE_DIRECTIONS, ["sent", "received", "no_response"]);
  assert.deepEqual(AG.RESOLUTIONS, ["complied", "denied", "escalated", "withdrawn", "completed"]);
  assert.deepEqual(Object.keys(AG.RISK_TIERS), ["1", "2", "3", "undetermined"]);
});

test("R2: LAW_LEVELS is jurisdictions' own binding (its R31), never a copy; lawProposalLabel is record-grammar's proposalLabel for governing_laws", () => {
  assert.equal(AG.LAW_LEVELS, J.LAW_LEVELS);
  for (const v of SCALARS.lawProposalLabel) assert.deepEqual(AG.lawProposalLabel(v), proposalLabel(v, "governing_laws"));
  assert.deepEqual(S.scalars.lawProposalLabel, GOLDEN.scalars.lawProposalLabel);
});

test("R2: kindReadsAsWritten reads exactly ACTION_KINDS; isQuoteEntry and quoteValue answer as before the move", () => {
  for (const k of SCALARS.kindReadsAsWritten) assert.equal(AG.kindReadsAsWritten(k), AG.ACTION_KINDS.includes(k), String(k));
  assert.deepEqual(S.scalars.kindReadsAsWritten, GOLDEN.scalars.kindReadsAsWritten);
  assert.deepEqual(S.scalars.isQuoteEntry, GOLDEN.scalars.isQuoteEntry);
  assert.deepEqual(S.scalars.quoteValue, GOLDEN.scalars.quoteValue);
  assert.equal(AG.quoteValue("1,083.00"), 1083);
  assert.equal(AG.quoteValue("1,00"), null);
});

test("R1: riskTierState reads 1, 2, 3 and undetermined (absent, null, the word) and nothing else; RISK_TIERS holds each tier's words", () => {
  assert.deepEqual(S.scalars.riskTierState, GOLDEN.scalars.riskTierState);
  for (const v of [undefined, null, "undetermined"]) assert.equal(AG.riskTierState(v), "undetermined");
  for (const v of [1, 2, 3]) assert.equal(AG.riskTierState(v), v);
  for (const v of ["1", 0, 4, 1.5, "", [], {}]) assert.equal(AG.riskTierState(v), null);
  assert.equal(AG.RISK_TIERS[3], "do not file without counsel");
});

test("R1, R11: actionKinds(view) answers the product's kinds, then the view's action_kinds once each, in order; under the test profile it adds that profile's kinds", () => {
  assert.deepEqual(S.scalars.actionKinds, GOLDEN.scalars.actionKinds);
  assert.deepEqual(AG.actionKinds(undefined), AG.PRODUCT_KINDS);
  assert.deepEqual(AG.actionKinds(TEST_VIEW), ["records_request", "request_for_comment", "other", "bylaw_complaint", "commitment_claim"]);
  assert.deepEqual(AG.actionKinds(TEST_VIEW), KIND_SETS["test-profile"]);
});

test("R3: the records law: C-2.10's law arm and the one site minting RECORDS_LAW_REFUSED (C-73.6), as before the move, over every document", () => {
  for (const id of Object.keys(DOCS)) {
    for (const k of ["recordsLawRefusal", "recordsLawFindings", "recordsLawOf"])
      assert.deepEqual(S.docs[id][k], GOLDEN.docs[id][k], `${id} ${k}`);
  }
});

test("R3 by hand: law only on a records_request, at most RECORDS_LAW_MAX characters, absent reads undetermined; the refusal carries C-73.6's row and its findings; a legacy kind reads as written", () => {
  const row = AG.GOVERNING_LAW_CHECKS.RECORDS_LAW_REFUSED;
  assert.equal(AG.RECORDS_LAW_MAX, 200);
  assert.equal(AG.recordsLawRefusal(DOCS["law-clean"]), null);
  assert.equal(AG.recordsLawRefusal(DOCS["clean-records-request"]), null, "absent is no refusal");
  assert.equal(AG.recordsLawRefusal({ action_kind: "records_request", law: "x".repeat(200) }), null);
  for (const id of ["law-on-other", "law-too-long", "law-unwritable", "law-not-text", "law-blank"]) {
    const r = AG.recordsLawRefusal(DOCS[id]);
    assert.equal(r.code, "RECORDS_LAW_REFUSED", id);
    assert.equal(r.check, "C-73.6");
    assert.equal(r.translation, row.translation);
    assert.equal(r.findings.length, 1);
    assert.equal(r.findings[0].check, "C-2.10");
    assert.deepEqual(codes(pushed((f) => AG.recordsLawFindings(DOCS[id], f)).findings), ["RECORDS_LAW_REFUSED"]);
  }
  assert.equal(AG.recordsLawOf(DOCS["clean-records-request"]).state, "undetermined");
  assert.equal(AG.recordsLawOf(DOCS["law-clean"], "member:a").state, "stated");
  assert.equal(AG.recordsLawOf(DOCS["law-clean"], "token:agent").state, "machine_stated");
  assert.deepEqual(audit(DOCS["kind-legacy"]).findings, [], "an action written with cpra_request reads as written");
});

test("R4: quoteFindings answers, for every entry of every ledger, what it answered before the move", () => {
  for (const id of Object.keys(DOCS)) assert.deepEqual(S.docs[id].quotes, GOLDEN.docs[id].quotes, id);
});

test("R4 by hand: each refusal first found (C-72.1–C-72.5); a waiver is a revision to zero and both stand; negative control: a clean quote answers nothing", () => {
  const q = (id, i) => codes(AG.quoteFindings(DOCS[id].correspondence, i));
  assert.deepEqual([0, 1, 2].map((i) => q("quote-clean", i)), [[], [], []]);
  assert.deepEqual(q("quote-on-sent", 0), ["QUOTE_NOT_ON_RECEIVED"]);
  assert.deepEqual(q("quote-bad-amount", 1), ["QUOTE_AMOUNT_NOT_A_NUMBER"]);
  assert.deepEqual(q("quote-bad-amount", 3), [], "a sign is a number");
  assert.deepEqual(q("quote-no-currency", 1), ["QUOTE_NO_CURRENCY"]);
  assert.deepEqual([1, 2, 3].map((i) => q("quote-answers-nothing", i)), [["QUOTE_ANSWERS_NO_SENT"], ["QUOTE_ANSWERS_NO_SENT"], ["QUOTE_ANSWERS_NO_SENT"]]);
  assert.deepEqual([1, 2, 3].map((i) => q("quote-revises-nothing", i)), [["QUOTE_REVISES_NO_QUOTE"], ["QUOTE_REVISES_NO_QUOTE"], []]);
  for (const c of ["QUOTE_NOT_ON_RECEIVED", "QUOTE_AMOUNT_NOT_A_NUMBER", "QUOTE_NO_CURRENCY", "QUOTE_ANSWERS_NO_SENT", "QUOTE_REVISES_NO_QUOTE"])
    assert.match(AG.QUOTE_CHECKS[c].check, /^C-72\.[1-5]$/);
  assert.deepEqual(AG.quoteFindings(null, 0), [], "never throws");
});

test("R5: lifecycleFindings answers, for every entry of every ledger, what it answered before the move", () => {
  for (const id of Object.keys(DOCS)) assert.deepEqual(S.docs[id].lifecycle, GOLDEN.docs[id].lifecycle, id);
});

test("R5 by hand: each refusal (C-94.1–C-94.9); DUE_CITE_NOT_GOVERNING is not asked here; no due date is computed; negative control: a clean chain answers nothing", () => {
  const l = (id) => DOCS[id].correspondence.map((_, i) => codes(AG.lifecycleFindings(DOCS[id].correspondence, i)));
  assert.deepEqual(l("lifecycle-clean"), [[], [], [], [], []]);
  assert.deepEqual(l("lifecycle-stage-direction"), [["STAGE_NOT_OF_DIRECTION", "FOLLOWS_NO_ENTRY"], ["STAGE_NOT_OF_DIRECTION"], ["STAGE_NOT_OF_DIRECTION"]]);
  assert.deepEqual(l("lifecycle-follows"), [[], ["FOLLOWS_NO_ENTRY"], ["FOLLOWS_NO_ENTRY"], ["FOLLOWS_NO_ENTRY"]]);
  assert.deepEqual(l("lifecycle-appeal")[2], ["APPEAL_NAMES_NO_DECISION"]);
  assert.deepEqual(l("lifecycle-outcome"), [["OUTCOME_NOT_ON_RECEIVED"], ["OUTCOME_NOT_IN_VOCABULARY"], ["OUTCOME_NOT_ON_RECEIVED"], ["DECISION_WITHOUT_OUTCOME"], []]);
  assert.deepEqual(l("lifecycle-fee-estimate"), [[], ["FEE_ESTIMATE_WITHOUT_QUOTE"], []]);
  assert.deepEqual(l("lifecycle-due"), [["DUE_HALF_STATED"], ["DUE_HALF_STATED"], ["DUE_NOT_A_DATE"]]);
  const all = Object.keys(DOCS).flatMap((id) => S.docs[id].lifecycle.flat().map((x) => x.code));
  assert.ok(!all.includes("DUE_CITE_NOT_GOVERNING"), "asked at actions' act, against the laws as they stand");
  const read = AG.requestLifecycleOf(DOCS["lifecycle-clean"], TODAY);
  assert.deepEqual(read.entries.map((e) => e.due.state), ["undetermined", "stated", "undetermined", "stated", "undetermined"]);
  assert.equal(read.entries[0].due.says, AG.DUE_UNDETERMINED_SAYS);
  assert.deepEqual(read.passed_unanswered, [], "the appeal's stated date passed and a decision followed");
  assert.equal(read.entries[3].due.status, "followed_after_due");
});

test("R6: actionBasisFindings and correspondenceFindings answer, for every document, what they answered before the move", () => {
  for (const id of Object.keys(DOCS)) {
    assert.deepEqual(S.docs[id].actionBasis, GOLDEN.docs[id].actionBasis, id);
    assert.deepEqual(S.docs[id].correspondence, GOLDEN.docs[id].correspondence, id);
  }
});

test("R6 by hand (DEC-13): a request_for_comment names an inquiry it advances and states a window as a clock entry; a rests_on leg or an advances leg onto a non-inquiry is not a disclosure; the window's length is never compared; another kind is not asked", () => {
  const msgs = (id) => pushed((f) => AG.actionBasisFindings(DOCS[id], f)).findings.map((x) => x.message);
  assert.deepEqual(msgs("rfc-clean"), []);
  assert.equal(msgs("rfc-no-inquiry").filter((m) => /names ZERO inquiries/.test(m)).length, 1);
  assert.equal(msgs("rfc-no-clock").filter((m) => /states the response window/.test(m)).length, 1);
  assert.equal(msgs("rfc-nothing").length, 2);
  assert.ok(msgs("rfc-no-clock")[0].includes(AG.RFC_RESPONSE_WINDOW_PRECEDENT.source));
  const far = { ...DOCS["rfc-clean"], clock: [{ ...DOCS["rfc-clean"].clock[0], date: "2030-01-01" }] };
  assert.deepEqual(pushed((f) => AG.actionBasisFindings(far, f)).findings, [], "no range is enforced");
  assert.deepEqual(AG.RFC_RESPONSE_WINDOW_PRECEDENT, { min_days: 7, max_days: 30, source: AG.RFC_RESPONSE_WINDOW_PRECEDENT.source, enforced: false });
  assert.deepEqual(msgs("clean-other"), [], "another kind is not asked");
  assert.deepEqual(pushed((f) => AG.actionBasisFindings(DOCS["leg-lead"], f)).findings.map((x) => x.check), ["C-54.1"]);
  assert.deepEqual(pushed((f) => AG.actionBasisFindings(DOCS["leg-theme"], f)).findings.map((x) => x.check), ["C-81.1"]);
});

test("R7: checkActionExtension reports, for every document under every instance kind set, the findings it reported before the move", () => {
  for (const id of Object.keys(DOCS)) assert.deepEqual(S.docs[id].audit, GOLDEN.docs[id].audit, id);
});

test("R7 by hand: a missing counterparty and a pending clock entry past its date are reported (C-2.10, C-11.1); any other document gets nothing; it answers nothing; nowMs defaults to the clock", (t) => {
  assert.deepEqual(audit(DOCS["clean-records-request"]).findings, []);
  assert.equal(audit(DOCS["clean-records-request"]).answered, false);
  assert.ok(audit(DOCS["cp-missing"]).findings.some((x) => x.check === "C-2.10" && /counterparty block is missing/.test(x.message)));
  const late = audit(DOCS["clock-past-due"]).findings;
  assert.deepEqual(late.map((x) => x.check), ["C-11.1"]);
  assert.match(late[0].message, /silently past-due/);
  for (const id of ["not-an-action", "no-object-type", "refs-bad"]) assert.deepEqual(audit(DOCS[id]).findings, [], id);
  assert.deepEqual(pushed((f) => AG.checkActionExtension(null, f)).findings, [], "never throws");
  assert.deepEqual(audit(DOCS["kind-profile"]).findings.map((x) => x.message), ["action_kind 'bylaw_complaint' is not a kind this instance offers"]);
  assert.deepEqual(audit(DOCS["kind-profile"], { actionKinds: AG.actionKinds(TEST_VIEW) }).findings, []);
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-07-03T00:00:00Z") });
  const byClock = pushed((f) => AG.checkActionExtension({ fm: DOCS["clock-past-due"] }, f)).findings;
  t.mock.timers.reset();
  assert.equal(byClock.filter((x) => /silently past-due/.test(x.message)).length, 2, "the 2026-07-02 entry is past on the 3rd");
});

test("R8: every reader and arm actions calls answers, for every document and scalar, what actions' copy answered before the move", () => {
  for (const id of Object.keys(DOCS))
    for (const k of ["riskTierHistoryOf", "governingLawsOf", "requestLifecycleOf", "consequenceState", "counterpartyFindings", "respondsTo"])
      assert.deepEqual(S.docs[id][k], GOLDEN.docs[id][k], `${id} ${k}`);
  assert.deepEqual(S.scalars.counterparty, GOLDEN.scalars.counterparty);
  assert.deepEqual(S.scalars.clockMoves, GOLDEN.scalars.clockMoves);
  const exported = ["riskTierHistoryOf", "governingLawsOf", "requestLifecycleOf", "consequenceState", "recordsLawOf", "counterpartyOffice",
    "counterpartyName", "addresseeIsOffice", "counterpartyFindings", "respondsToEdgeFindings", "clockMovesNotMechanical"];
  for (const n of exported) assert.equal(typeof AG[n], "function", n);
});

test("R8 by hand: governingLawsOf's undetermined sentence names no law, even for a kind that named one; clockMovesNotMechanical allows only pending to overdue past its date", () => {
  for (const id of ["clean-records-request", "laws-legacy-kind"]) {
    const g = AG.governingLawsOf(DOCS[id]);
    assert.equal(g.state, "undetermined");
    assert.doesNotMatch(g.stated, /CPRA|Public Records Act|Gov\. Code|§/);
  }
  assert.equal(AG.governingLawsOf(DOCS["laws-clean"]).state, "stated");
  assert.deepEqual(AG.clockMovesNotMechanical(...SCALARS.clockMoves[0]), []);
  assert.deepEqual(AG.clockMovesNotMechanical(...SCALARS.clockMoves[2]), [{ ord: 0, from: "pending", to: "met" }]);
  assert.equal(AG.consequenceState(DOCS["consequence-own-artifact"]).state, "unproven");
  assert.equal(AG.consequenceState(DOCS["consequence-established"]).state, "established");
  assert.deepEqual(pushed((f) => AG.respondsToEdgeFindings(DOCS["refs-bad"], f)).findings.map((x) => x.check), ["C-6.1", "C-6.1", "C-6.1"]);
});

/* R9 (K899 (7), DEC-61): the three rows `actions`' actionHold mints (its R52), as drafted (`build/plan/draft-T20-answers.md`
   C.3); new in T20 layer 9, stamped by 1.51.0. */
const HOLD_ROWS = {
  MACHINE_CANNOT_SET_HOLD: {
    check: "C-117.20",
    where: "src/actions/index.mjs actionHold > is-hold",
    translation: "Saying whether a litigation hold is in place is a member's judgement, and somebody answers for it. The credential that asked here is an automated one, so it cannot say. Sign in to record it yourself.",
  },
  HOLD_REFUSED: {
    check: "C-117.21",
    where: "src/actions/index.mjs actionHold > is-hold",
    translation: "A litigation hold is recorded as in place or released, with a reason of up to 500 characters and no quotation mark, backslash or line break. This one was not, so nothing was written.",
  },
  HOLD_NO_LEGAL_MARK: {
    check: "C-117.22",
    where: "src/actions/index.mjs actionHold > is-hold-legal-mark",
    translation: "A litigation hold is recorded on something the group received and marked as legal pressure. The entry named carries no such mark, so nothing was written.",
  },
};

test("R9: the litigation-hold rows C-117.20 MACHINE_CANNOT_SET_HOLD, C-117.21 HOLD_REFUSED, C-117.22 HOLD_NO_LEGAL_MARK are held in ACTION_CATALOGUE_CHECKS, each {check, where, translation} exactly, after PRESSURE_NO_ENTRY, their wheres naming actions' actionHold regions", () => {
  const C = AG.ACTION_CATALOGUE_CHECKS;
  for (const [code, row] of Object.entries(HOLD_ROWS)) assert.deepEqual(C[code], row, code);
  const keys = Object.keys(C);
  assert.deepEqual(keys.slice(keys.indexOf("PRESSURE_NO_ENTRY")), ["PRESSURE_NO_ENTRY", ...Object.keys(HOLD_ROWS)]);
  for (const n of ROW_NAMES) if (n !== "ACTION_CATALOGUE_CHECKS")
    for (const code of Object.keys(HOLD_ROWS)) assert.ok(!(code in AG[n]), `${code} in ${n}`);
});

test("R9: every row is held as before the move, number and translation unchanged; C-73.6's where names its new site, C-117.11's names contactNotAMember (K837); C-117.5 is action-clocks', not here; C-117.20–.22 are added", () => {
  const expected = structuredClone(GOLDEN.rows);
  delete expected.ACTION_CATALOGUE_CHECKS.PENDING_CLOCKS_BAD_BEFORE;
  Object.assign(expected.ACTION_CATALOGUE_CHECKS, structuredClone(HOLD_ROWS));
  expected.GOVERNING_LAW_CHECKS.RECORDS_LAW_REFUSED.where = "src/action-grammar/checks.mjs recordsLawRefusal > is-records-law";
  expected.ACTION_CATALOGUE_CHECKS.CONTACT_NOT_A_MEMBER.where = "src/actions/index.mjs contactNotAMember > is-contact-member";
  assert.deepEqual(S.rows, expected);
  for (const n of ROW_NAMES) assert.ok(n in AG, n);
});

test("R9 by hand: the rows are exactly C-32.3, .4, .18, .19, .20; C-33.3–.9; C-72.1–.8; C-73.1–.6; C-90.1–.6; C-94.1–.12; C-101.1–.5; C-117.1–.4 and .6–.22, each {check, where, translation}", () => {
  const range = (fam, a, b, skip = []) => Array.from({ length: b - a + 1 }, (_, i) => a + i).filter((n) => !skip.includes(n)).map((n) => `${fam}.${n}`);
  const want = ["C-32.3", "C-32.4", "C-32.18", "C-32.19", "C-32.20", ...range("C-33", 3, 9), ...range("C-72", 1, 8), ...range("C-73", 1, 6),
    ...range("C-90", 1, 6), ...range("C-94", 1, 12), ...range("C-101", 1, 5), ...range("C-117", 1, 22, [5])].sort();
  const rows = ROW_NAMES.flatMap((n) => Object.values(AG[n]));
  assert.deepEqual(rows.map((r) => r.check).sort(), want);
  assert.equal(new Set(rows.map((r) => r.check)).size, rows.length, "no number twice");
  for (const r of rows) {
    assert.deepEqual(Object.keys(r).sort(), ["check", "translation", "where"]);
    assert.match(r.where, /^src\/(actions\/index|action-grammar\/checks)\.mjs \S+ > is-[a-z0-9-]+$/);
    assert.ok(r.translation.length > 20);
  }
});

test("R6, R8 (K899 (1)): text a member reads says record, never bundle: actionBasisFindings' target finding and respondsToEdgeFindings' repair are re-worded, and no row, finding, repair or reading over the corpus holds the word", () => {
  assert.deepEqual(REWORDED_COUNTS.map((n) => n > 0), [true, true], "each old phrase was in the recorded answer");
  const legs = pushed((f) => AG.actionBasisFindings(DOCS["leg-bad-target"], f)).findings;
  assert.deepEqual(legs.map((x) => x.message), ["action_basis[0].target 'not-an-id' is not a canonical record id"]);
  const refs = pushed((f) => AG.respondsToEdgeFindings(DOCS["refs-bad"], f)).findings;
  for (const x of refs) assert.deepEqual(x.repairs, ["point the edge at the ACTN- record whose correspondence this answers",
    "or use relates_to, which claims nothing about an exchange"]);
  const words = [];
  const walk = (v) => { if (typeof v === "string") words.push(v); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
  walk({ rows: S.rows, docs: S.docs, scalars: S.scalars, values: S.values });
  const text = words.join("\n");
  assert.doesNotMatch(text, /\bbundles?\b/i);
  for (const [was] of REWORDED) assert.ok(!text.includes(was), was);
});

test("R10: pure: deeply frozen inputs are read without change, and the same inputs give the same answers", () => {
  const freeze = (o) => { if (o && typeof o === "object") { Object.values(o).forEach(freeze); Object.freeze(o); } return o; };
  for (const [id, fm] of Object.entries(DOCS)) {
    const frozen = freeze(structuredClone(fm));
    const first = overDoc(AG, frozen);
    const entries = Array.isArray(frozen?.correspondence) ? frozen.correspondence : [];
    assert.doesNotThrow(() => {
      AG.checkActionExtension({ fm: frozen, nowMs: NOW }, []);
      AG.actionBasisFindings(frozen, []); AG.correspondenceFindings(frozen, []); AG.counterpartyFindings(frozen, []);
      AG.respondsToEdgeFindings(frozen, []); AG.riskTierHistoryOf(frozen); AG.governingLawsOf(frozen);
      AG.requestLifecycleOf(frozen, TODAY); AG.consequenceState(frozen); AG.recordsLawRefusal(frozen);
      entries.forEach((_, i) => { AG.quoteFindings(entries, i); AG.lifecycleFindings(entries, i); });
    }, id);
    assert.deepEqual(overDoc(AG, frozen), first, id);
    assert.deepEqual(first, S.docs[id], id);
  }
});

test("R10: never throws on a document it cannot read; with nowMs given, the clock is not read", (t) => {
  const junk = [undefined, null, 0, "x", [], {}, { object_type: "action" },
    { object_type: "action", counterparty: 5, correspondence: [null, 5, "x", { direction: {} }], action_basis: "x", clock: [5],
      risk_tier_history: [5], governing_laws: [5], references: [5], consequence: { claim: "impact" } }];
  for (const fm of junk) assert.doesNotThrow(() => {
    AG.checkActionExtension({ fm, nowMs: NOW }, []); AG.actionBasisFindings(fm, []); AG.correspondenceFindings(fm, []);
    AG.counterpartyFindings(fm, []); AG.respondsToEdgeFindings(fm, []); AG.recordsLawFindings(fm, []);
    AG.riskTierHistoryOf(fm); AG.governingLawsOf(fm); AG.requestLifecycleOf(fm, TODAY); AG.consequenceState(fm);
    AG.recordsLawOf(fm); AG.recordsLawRefusal(fm); AG.quoteFindings(fm, 0); AG.lifecycleFindings(fm, 0);
    AG.counterpartyOffice(fm); AG.counterpartyName(fm); AG.addresseeIsOffice(fm); AG.actionKinds(fm);
    AG.clockMovesNotMechanical(fm, fm, TODAY); AG.riskTierState(fm); AG.kindReadsAsWritten(fm); AG.isQuoteEntry(fm);
  }, JSON.stringify(fm));
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2030-01-01T00:00:00Z") });
  const later = overDoc(AG, DOCS["clock-past-due"]);
  t.mock.timers.reset();
  assert.deepEqual(later, S.docs["clock-past-due"]);
});

test("R11: no place is named in the module's outward text (rows, findings, readings over the whole corpus); the test profile's kinds are accepted and checked like any other", () => {
  const places = new Set(["Oakland", "Alameda", "California", "CPRA", "Port Ellery", "Marlow"]);
  for (const p of J.list()) { for (const c of p.covers) places.add(c); places.add(p.name); }
  const text = JSON.stringify({ rows: S.rows, docs: S.docs, scalars: S.scalars, says: AG.DUE_UNDETERMINED_SAYS, rfc: AG.RFC_RESPONSE_WINDOW_PRECEDENT });
  for (const p of places) assert.ok(!text.includes(p), `outward text names '${p}'`);
  const unknown = { ...DOCS["kind-profile"], action_kind: "petition" };
  const kinds = AG.actionKinds(TEST_VIEW);
  assert.deepEqual(audit(unknown, { actionKinds: kinds }).findings.map((x) => x.message), ["action_kind 'petition' is not a kind this instance offers"]);
  for (const k of kinds.filter((x) => !AG.PRODUCT_KINDS.includes(x)))
    assert.deepEqual(audit({ ...DOCS["clean-other"], action_kind: k }, { actionKinds: kinds }).findings, [], k);
  assert.deepEqual(plain(AG.recordsLawRefusal({ ...DOCS["law-clean"], action_kind: "bylaw_complaint" })).code, "RECORDS_LAW_REFUSED");
});
