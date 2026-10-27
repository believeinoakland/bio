/* record-grammar at its interface: the machine-work labels moved at T19 (R37, R38) with the subjects added since (R42–R45,
   R49, R50, R54, R60, R61), and the shared act rows (R29). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import * as RG from "../../../src/record-grammar/index.mjs";
import { LAW_PROPOSAL_STATES, lawProposalState, PROPOSAL_STATES, proposalLabel, CONTENT_MINTED_BY_PLANE, CONTENT_MINT_STATES,
  contentMintState, isMachineIdentity, SHARED_ACT_CHECKS, NON_MEMBER_AUTHORS, ACTOR_CLASSES }
  from "../../../src/record-grammar/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { wordRx } from "../../word-rx.mjs";

/* A table sentence is compared with its design row, never with a copy of its text (K3810). */
const row = (subject, state) => word(`record-grammar.proposal.${subject}.${state}`);

const STATES3 = ["machine_proposed", "member_proposed", "unstated"];
const MACHINES = ["token:member", "class:ai", " Token:x ", "claude", "AGENT", ...NON_MEMBER_AUTHORS, ...ACTOR_CLASSES];
const MEMBERS = ["alice", "Bob Smith", "admin", "tokens", "plane", "none:independent-sufficiency"];
const BLANKS = [undefined, null, "", "   ", "\n"];

test("R38 lawProposalState: blank is unstated, a machine identity machine_proposed, any other name member_proposed", () => {
  for (const w of BLANKS) assert.equal(lawProposalState(w), "unstated");
  for (const w of MACHINES) assert.equal(lawProposalState(w), "machine_proposed", w);
  for (const w of MEMBERS) assert.equal(lawProposalState(w), "member_proposed", w);
});

test("R38 PROPOSAL_STATES: one frozen table per subject, governing_laws REC-195's own, each with the three states' sentences", () => {
  assert.ok(Object.isFrozen(PROPOSAL_STATES));
  assert.deepEqual(Object.keys(PROPOSAL_STATES), ["governing_laws", "standard", "comparison", "filing_draft", "theory",
    "plan_option", "communication", "template", "edition_statement", "escalation_reason", "wizard", "law_relation", "translation",
    "case_account", "account_check", "bearing", "status_report"]);
  assert.ok(PROPOSAL_STATES.governing_laws === LAW_PROPOSAL_STATES);
  const said = new Set();
  for (const [subject, t] of Object.entries(PROPOSAL_STATES)) {
    assert.deepEqual(Object.keys(t), STATES3, subject);
    for (const s of STATES3) { assert.equal(typeof t[s], "string"); assert.ok(t[s].length > 20); said.add(t[s]); }
    if (subject !== "governing_laws") assert.ok(Object.isFrozen(t), subject);
    for (const s of STATES3) assert.equal(t[s], row(subject, s), `${subject} ${s}`);
  }
  assert.equal(said.size, 17 * 3, "no two sentences are the same");
});

const SUBJECTS = ["governing_laws", "standard", "comparison", "filing_draft", "theory", "plan_option", "communication", "template",
  "edition_statement", "escalation_reason", "wizard", "law_relation", "translation", "case_account", "account_check", "bearing",
  "status_report"];

test("R42 PROPOSAL_STATES.template: after communication, frozen, three sentences of wording proposed for a filing template, machine work never drafts, reviews or approves", () => {
  assert.equal(Object.keys(PROPOSAL_STATES).indexOf("template"), 7);
  const t = PROPOSAL_STATES.template;
  assert.ok(Object.isFrozen(t));
  assert.deepEqual(Object.keys(t), STATES3);
  for (const s of STATES3) assert.equal(t[s], row("template", s), s);
  for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
    const state = lawProposalState(w);
    assert.deepEqual(proposalLabel(w, "template"), { by: w ?? null, state, machine_work: state === "machine_proposed", says: t[state] });
  }
});

/* R43, R44 and R45: each a frozen table of the three states, after the one before it, every sentence saying what the
   proposal is and that it is not the member's or the group's own until a member acts; machine work is a draft. */
function newSubject(subject, after) {
  const keys = Object.keys(PROPOSAL_STATES);
  assert.equal(keys.indexOf(subject), keys.indexOf(after) + 1, `${subject} after ${after}`);
  const t = PROPOSAL_STATES[subject];
  assert.ok(Object.isFrozen(t));
  assert.deepEqual(Object.keys(t), STATES3);
  for (const s of STATES3) assert.equal(t[s], row(subject, s), s);
  for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
    const state = lawProposalState(w);
    assert.deepEqual(proposalLabel(w, subject), { by: w ?? null, state, machine_work: state === "machine_proposed", says: t[state] });
  }
  assert.equal(proposalLabel("token:skill", subject).state, "machine_proposed");
  assert.equal(proposalLabel("token:skill", subject).machine_work, true);
}

test("R43 PROPOSAL_STATES.edition_statement: after template, frozen, a new edition's statement of what changed and why, not the group's until a member adopts or rewrites it; machine work a draft", () => {
  newSubject("edition_statement", "template");
});

test("R44 PROPOSAL_STATES.escalation_reason: after edition_statement, frozen, a reason for opening an escalation assembled from the determination's record, not a member's until a member sends it; machine work a draft", () => {
  newSubject("escalation_reason", "edition_statement");
});

test("R45 PROPOSAL_STATES.wizard: after escalation_reason, frozen, steps proposed for a wizard script, not a script's until its author adopts them into a version; machine work a draft that never drafts, submits or approves a script", () => {
  newSubject("wizard", "escalation_reason");
  /* The tables before it are unchanged in number and order (R42's eight first, then R43's and R44's); R49's follows it,
     then R50's, then R54's two, then R60's, then R61's. */
  assert.deepEqual(Object.keys(PROPOSAL_STATES), SUBJECTS);
  assert.equal(Object.keys(PROPOSAL_STATES).indexOf("wizard"), 10);
});

test("R49 PROPOSAL_STATES.law_relation: after wizard, frozen, a law relation, court link or treatment proposed, not one the record holds until a member records it; machine work can propose one and never record one", () => {
  const keys = Object.keys(PROPOSAL_STATES);
  assert.equal(keys.indexOf("law_relation"), keys.indexOf("wizard") + 1);
  assert.equal(keys.indexOf("translation"), keys.indexOf("law_relation") + 1, "R50's follows it");
  const t = PROPOSAL_STATES.law_relation;
  assert.ok(Object.isFrozen(t));
  assert.deepEqual(Object.keys(t), STATES3);
  for (const s of STATES3) assert.equal(t[s], row("law_relation", s), s);
  /* It names what was proposed, never a standard: standards' lawPropose labels through it, not through `standard`. */
  for (const s of STATES3) assert.doesNotMatch(t[s], /standard/, s);
  for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
    const state = lawProposalState(w);
    assert.deepEqual(proposalLabel(w, "law_relation"), { by: w ?? null, state, machine_work: state === "machine_proposed", says: t[state] });
  }
  assert.deepEqual(proposalLabel("token:skill", "law_relation"),
    { by: "token:skill", state: "machine_proposed", machine_work: true, says: t.machine_proposed });
  /* The other tables and their sentences are unchanged: the eleven before it, pinned by the tests above, and `standard`
     still the standard's own sentences. */
  assert.equal(PROPOSAL_STATES.standard.machine_proposed, row("standard", "machine_proposed"));
});

/* The twelve tables as they stood before R50, every sentence, as one digest over their canonical JSON (taken at T37's
   START, before the change). Re-pinned at the words change (T51-171 B3): the machine sentences now read the design rows, which
   spell "labeled"; with that one spelling reversed the digest is T37's, so only the spelling moved. */
const TWELVE_BEFORE_R50 = "83fb8224a5e9d6c1cf4a75c84d7fb877b359ade581fc2a988a0ea25fe630c773";

test("R50 PROPOSAL_STATES.translation: after law_relation (and before R54's two), frozen, a draft translation of an interface word shown as \"Draft\", not the group's wording until a member granted that language adopts it; machine work can draft one and never adopt or confirm one; the other tables unchanged", () => {
  const keys = Object.keys(PROPOSAL_STATES);
  assert.equal(keys.indexOf("translation"), keys.indexOf("law_relation") + 1);
  assert.equal(keys.indexOf("case_account"), keys.indexOf("translation") + 1, "R54's follow it");
  const t = PROPOSAL_STATES.translation;
  assert.ok(Object.isFrozen(t));
  assert.deepEqual(Object.keys(t), STATES3);
  for (const s of STATES3) assert.equal(t[s], row("translation", s), s);
  /* Only the machine's sentence says machine work; no sentence says the wording is adopted or confirmed. */
  for (const s of ["member_proposed", "unstated"]) assert.doesNotMatch(t[s], /machine/, s);
  for (const s of STATES3) assert.doesNotMatch(t[s], /\b(is|was) (adopted|confirmed)\b/, s);
  for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
    const state = lawProposalState(w);
    assert.deepEqual(proposalLabel(w, "translation"), { by: w ?? null, state, machine_work: state === "machine_proposed", says: t[state] });
  }
  assert.deepEqual(proposalLabel("token:skill", "translation"),
    { by: "token:skill", state: "machine_proposed", machine_work: true, says: t.machine_proposed });
  assert.deepEqual(proposalLabel("alice", "translation"),
    { by: "alice", state: "member_proposed", machine_work: false, says: t.member_proposed });
  /* The other tables and their sentences are unchanged, every one of them, in order. */
  const { translation, case_account, account_check, bearing, status_report, ...before } = PROPOSAL_STATES;
  assert.ok(translation === t);
  assert.equal(RG.sha256HexSync(RG.canonicalJson(before)), TWELVE_BEFORE_R50);
  assert.deepEqual(Object.keys(before), SUBJECTS.slice(0, 12));
});

/* The thirteen tables as they stood before R54, every sentence, as one digest over their canonical JSON (taken at T42's
   START from the committed module, before the change). */
const THIRTEEN_BEFORE_R54 = "45ad0b0d9434d816a02cf3b5150ade783a85916e892c3060ab9fadbd2ada595c";

test("R54 PROPOSAL_STATES gains case_account and account_check after translation, each frozen with the three states: a draft of a case's account from its cited evidence, never the case's account, which a member writes in her own words; flagged sentences of a member's account the evidence they cite does not support, a draft and never a finding of the group; machine work labeled as machine work; the other thirteen tables unchanged", () => {
  const keys = Object.keys(PROPOSAL_STATES);
  assert.equal(keys.length, 17, "R60's bearing and R61's status_report follow them");
  assert.deepEqual(keys.slice(-5), ["translation", "case_account", "account_check", "bearing", "status_report"]);
  const ca = PROPOSAL_STATES.case_account, ac = PROPOSAL_STATES.account_check;
  for (const [subject, t] of [["case_account", ca], ["account_check", ac]]) {
    assert.ok(Object.isFrozen(t), subject);
    assert.deepEqual(Object.keys(t), STATES3, subject);
    for (const s of STATES3) assert.equal(t[s], row(subject, s), `${subject} ${s}`);
    /* Only the machine's sentence says machine work. */
    for (const s of ["member_proposed", "unstated"]) assert.doesNotMatch(t[s], /machine/, `${subject} ${s}`);
    /* Every state, every identity: the label R38 composes, through this subject's own sentence. */
    for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
      const state = lawProposalState(w);
      assert.deepEqual(proposalLabel(w, subject), { by: w ?? null, state, machine_work: state === "machine_proposed", says: t[state] },
        `${subject} ${String(w)}`);
    }
    assert.deepEqual(proposalLabel("token:skill", subject),
      { by: "token:skill", state: "machine_proposed", machine_work: true, says: t.machine_proposed });
    assert.deepEqual(proposalLabel("alice", subject), { by: "alice", state: "member_proposed", machine_work: false, says: t.member_proposed });
    assert.deepEqual(proposalLabel(undefined, subject), { by: null, state: "unstated", machine_work: false, says: t.unstated });
  }
  /* case_account: a draft of a case's account drawn from its cited evidence, never the case's account, which a member
     writes in her own words, in every state. */
  /* The two subjects say different things: no sentence of one is the other's, and each names only its own object. Each
     sentence is pinned to its row above, so no phrasing guard is needed beyond these. */
  for (const s of STATES3) {
    assert.notEqual(ca[s], ac[s]);
    assert.doesNotMatch(ca[s], /flagged/, s);
  }
  /* The other tables and their sentences are unchanged, every one, in order. */
  const { case_account, account_check, bearing, status_report, ...before } = PROPOSAL_STATES;
  assert.ok(case_account === ca && account_check === ac);
  assert.deepEqual(Object.keys(before), SUBJECTS.slice(0, 13));
  assert.equal(RG.sha256HexSync(RG.canonicalJson(before)), THIRTEEN_BEFORE_R54);
});

test("R54 R60 R61 negative control: an unknown subject, near spellings of R54's two new ones included, throws a RangeError naming the seventeen subjects", () => {
  const msg = (s) => word("record-grammar.labels.unknown_subject", { subject: s, subjects: SUBJECTS.join(", ") });
  assert.ok(msg("x").endsWith("translation, case_account, account_check, bearing, status_report"));
  for (const s of ["case_accounts", "Case_account", "caseAccount", "case-account", "account", "account_checks", "Account_check",
    "accountCheck", "account-check", "check", "case", "case_account ", " account_check", "case_account_check"])
    assert.throws(() => proposalLabel("token:skill", s), (e) => e instanceof RangeError && e.message === msg(s), s);
  for (const s of [undefined, null, 15, {}, ["case_account"], new String("case_account")])
    assert.throws(() => proposalLabel("alice", s), RangeError, String(s));
  /* Control: the two new subjects themselves answer. */
  for (const s of ["case_account", "account_check"]) assert.doesNotThrow(() => proposalLabel("alice", s), s);
});

test("R38 R42 R44 R45 R49 R50 R54 R60 R61 proposalLabel's RangeError for an unknown subject names all seventeen subjects, in order", () => {
  assert.equal(SUBJECTS.length, 17);
  for (const s of ["templates", "edition", "escalation", "Edition_statement", "escalation_reasons", "wizards", "Wizard", "__proto__",
    "law_relations", "Law_relation", "law", "court_link", "treatment", "translations", "Translation", "draft", "interface_word"])
    assert.throws(() => proposalLabel("a", s), (e) => e instanceof RangeError
      && e.message === word("record-grammar.labels.unknown_subject", { subject: s, subjects: SUBJECTS.join(", ") }), s);
});

test("R38 proposalLabel: {by, state, machine_work, says} for every subject and state; an unknown subject throws RangeError", () => {
  for (const subject of Object.keys(PROPOSAL_STATES)) {
    for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
      const l = proposalLabel(w, subject);
      const state = lawProposalState(w);
      assert.deepEqual(l, { by: w ?? null, state, machine_work: state === "machine_proposed", says: PROPOSAL_STATES[subject][state] });
    }
  }
  for (const s of ["", "law", "constructor", "toString", undefined, null, 1, {}])
    assert.throws(() => proposalLabel("alice", s), RangeError, String(s));
  assert.throws(() => proposalLabel("a", "x".repeat(100)),
    { message: word("record-grammar.labels.unknown_subject", { subject: "x".repeat(40), subjects: SUBJECTS.join(", ") }) });
});

test("R37 CONTENT_MINT_STATES and contentMintState: blank unstated, the plane's own mint, a machine credential, else a member", () => {
  assert.equal(CONTENT_MINTED_BY_PLANE, "plane");
  assert.deepEqual(Object.keys(CONTENT_MINT_STATES), ["member_marked", "plane_minted", "machine_marked", "unstated"]);
  assert.ok(!Object.isFrozen(CONTENT_MINT_STATES) && !Object.isFrozen(LAW_PROPOSAL_STATES));
  /* Never throws: a value that cannot be stringified is blank. */
  for (const v of [{ toString() { throw new Error("x"); } }, Object.create(null)]) {
    assert.equal(contentMintState(v), "unstated");
    assert.equal(lawProposalState(v), "unstated");
  }
  assert.equal(contentMintState(Symbol("s")), "member_marked");
  for (const v of Object.values(CONTENT_MINT_STATES)) assert.ok(typeof v === "string" && v.length > 20);
  assert.equal(isMachineIdentity(CONTENT_MINTED_BY_PLANE), false);
  for (const w of BLANKS) assert.equal(contentMintState(w), "unstated");
  for (const w of ["plane", " Plane ", "PLANE"]) assert.equal(contentMintState(w), "plane_minted", w);
  for (const w of MACHINES) assert.equal(contentMintState(w), "machine_marked", w);
  for (const w of MEMBERS.filter((m) => m !== "plane")) assert.equal(contentMintState(w), "member_marked", w);
  /* isMachineMinted does not move (K750). */
  assert.ok(!("isMachineMinted" in RG));
});

test("R29 the shared act rows: NO_BASIS C-33.40 and NO_CITATION C-33.41, {check, where, translation}, numbers and words unchanged", () => {
  assert.ok(Object.isFrozen(SHARED_ACT_CHECKS));
  assert.deepEqual(Object.keys(SHARED_ACT_CHECKS), ["NO_BASIS", "NO_CITATION", "ACCEPT_MUST_REAUTHOR"]);
  for (const row of Object.values(SHARED_ACT_CHECKS)) assert.deepEqual(Object.keys(row), ["check", "where", "translation"]);
  assert.equal(SHARED_ACT_CHECKS.NO_BASIS.check, "C-33.40");
  assert.equal(SHARED_ACT_CHECKS.NO_CITATION.check, "C-33.41");
  assert.equal(SHARED_ACT_CHECKS.NO_BASIS.translation, word("refusal.NO_BASIS"));
  assert.equal(SHARED_ACT_CHECKS.NO_CITATION.translation, word("refusal.NO_CITATION"));
});

/* N827, K2467 (T42): C-33.40's where names every site that answers with its row, not inquiry's alone. The modules named
   come later in the order, so this test reads the where and the files it names, never their code (P4). */
test("R29 C-33.40's where names every site that raises NO_BASIS: inquiry's actNoBasis (basis-versions through it), progressions' refusal (first declaration and revision of a declared flow), entities' actShapeRefusal; each file exists", async () => {
  const w = SHARED_ACT_CHECKS.NO_BASIS.where;
  assert.match(w, /^src\/inquiry\/index\.mjs actNoBasis > is-act-no-basis\b/);
  assert.match(w, /basis-versions/);
  assert.match(w, /src\/progressions\/checks\.mjs refusal\b/);
  assert.match(w, /src\/progressions\/index\.mjs/);
  assert.match(w, wordRx("record-grammar.acts.no_basis.progressions"));
  assert.match(w, /src\/entities\/index\.mjs actShapeRefusal\b/);
  assert.match(w, wordRx("record-grammar.acts.no_basis.entities"));
  /* Negative control: it no longer names inquiry's site alone. */
  assert.notEqual(w, "src/inquiry/index.mjs actNoBasis > is-act-no-basis");
  for (const f of w.match(/src\/[\w/.-]+\.mjs/g)) assert.ok(existsSync(new URL(`../../../${f}`, import.meta.url)), f);
});

/* T43 (N857, K2643): C-33.40's where names all five sites that raise NO_BASIS, money's and lines' beside the three T42
   named. As above, it reads the where and the files it names, never their code (P4). */
const NO_BASIS_SITES = [
  ["src/inquiry/index.mjs", "actNoBasis", /basis-versions/],
  ["src/progressions/checks.mjs", "refusal", wordRx("record-grammar.acts.no_basis.progressions")],
  ["src/entities/index.mjs", "actShapeRefusal", wordRx("record-grammar.acts.no_basis.entities")],
  ["src/money/index.mjs", "refusal", /setFundType/],
  ["src/lines/index.mjs", "noBasis", /recordLine/],
];
const SITE_RE = /src\/[\w/.-]+\.mjs [A-Za-z]+\b/g;
const sitesOf = (w) => (w.match(SITE_RE) || []).filter((s) => !s.startsWith("src/progressions/index.mjs"));
const namesAllFive = (w) => NO_BASIS_SITES.every(([file, helper, acts]) => sitesOf(w).includes(`${file} ${helper}`) && acts.test(w));
test("R29 C-33.40's where names all five NO_BASIS sites: inquiry's actNoBasis, progressions' refusal, entities' actShapeRefusal, money's refusal (setFundType), lines' noBasis (recordLine); each file exists", () => {
  const w = SHARED_ACT_CHECKS.NO_BASIS.where;
  assert.ok(namesAllFive(w), w);
  /* The five are named once each, in this order, and no other site is named. */
  assert.deepEqual(sitesOf(w), NO_BASIS_SITES.map(([file, helper]) => `${file} ${helper}`));
  for (const [file] of NO_BASIS_SITES) assert.ok(existsSync(new URL(`../../../${file}`, import.meta.url)), file);
  /* Negative control: T42's where, which named three of the five, does not satisfy this; nor does one missing either new site. */
  const t42 = "src/inquiry/index.mjs actNoBasis > is-act-no-basis (inquiry's, and basis-versions' through it), "
    + "src/progressions/checks.mjs refusal (progressions' " + word("record-grammar.acts.no_basis.progressions") + ", "
    + "src/progressions/index.mjs), and src/entities/index.mjs actShapeRefusal (entities' " + word("record-grammar.acts.no_basis.entities") + ")";
  assert.equal(namesAllFive(t42), false);
  assert.equal(namesAllFive(w.replace("src/money/index.mjs refusal", "src/money/index.mjs")), false);
  assert.equal(namesAllFive(w.replace("src/lines/index.mjs noBasis", "src/lines/index.mjs")), false);
});

test("R29 C-33.41's where names entities' and progressions' sites, not store.mjs actNoCitation, and each file exists", () => {
  const w = SHARED_ACT_CHECKS.NO_CITATION.where;
  assert.match(w, /^src\/entities\/index\.mjs actShapeRefusal\b/);
  assert.match(w, /declareRelation/);
  assert.match(w, /src\/progressions\/checks\.mjs refusal\b/);
  assert.match(w, wordRx("record-grammar.acts.no_citation.progressions"));
  assert.doesNotMatch(w, /store\.mjs|actNoCitation/);
  for (const f of w.match(/src\/[\w/.-]+\.mjs/g)) assert.ok(existsSync(new URL(`../../../${f}`, import.meta.url)), f);
});

/* The fifteen tables as they stood before R60, every sentence, as one digest over their canonical JSON (taken at T46's
   START from the committed module, before the change). */
const FIFTEEN_BEFORE_R60 = "93650050b988d923b0d9e594118d266d78ffba6f5fbd170dae18241c985f4f54";

test("R60 PROPOSAL_STATES gains bearing after account_check, frozen with the three states: a proposed reading of how a reply bears on each claim of an action, never the group's reading until a member records it; machine work labeled as machine work, which can propose a layout and never record one; the other fifteen tables unchanged", () => {
  const keys = Object.keys(PROPOSAL_STATES);
  assert.equal(keys.indexOf("bearing"), keys.indexOf("account_check") + 1);
  assert.equal(keys.indexOf("status_report"), keys.indexOf("bearing") + 1, "R61's follows it");
  const t = PROPOSAL_STATES.bearing;
  assert.ok(Object.isFrozen(t));
  assert.deepEqual(Object.keys(t), STATES3);
  for (const s of STATES3) {
    assert.equal(t[s], row("bearing", s), s);
  }
  /* Only the machine's sentence says machine work. */
  for (const s of ["member_proposed", "unstated"]) assert.doesNotMatch(t[s], /machine/, s);
  for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
    const state = lawProposalState(w);
    assert.deepEqual(proposalLabel(w, "bearing"), { by: w ?? null, state, machine_work: state === "machine_proposed", says: t[state] },
      String(w));
  }
  assert.deepEqual(proposalLabel("token:skill", "bearing"), { by: "token:skill", state: "machine_proposed", machine_work: true, says: t.machine_proposed });
  assert.deepEqual(proposalLabel("alice", "bearing"), { by: "alice", state: "member_proposed", machine_work: false, says: t.member_proposed });
  assert.deepEqual(proposalLabel(undefined, "bearing"), { by: null, state: "unstated", machine_work: false, says: t.unstated });
  /* The other tables and their sentences are unchanged, every one, in order. */
  const { bearing, status_report, ...before } = PROPOSAL_STATES;
  assert.ok(bearing === t);
  assert.deepEqual(Object.keys(before), SUBJECTS.slice(0, 15));
  assert.equal(RG.sha256HexSync(RG.canonicalJson(before)), FIFTEEN_BEFORE_R60);
});

test("R60 R61 negative control: near spellings of bearing throw a RangeError naming the seventeen subjects; bearing itself answers", () => {
  const msg = (s) => word("record-grammar.labels.unknown_subject", { subject: s, subjects: SUBJECTS.join(", ") });
  for (const s of ["bearings", "Bearing", "BEARING", "bearing ", " bearing", "reply_bearing", "bearing_layout", "layout", "reply"])
    assert.throws(() => proposalLabel("token:skill", s), (e) => e instanceof RangeError && e.message === msg(s), s);
  assert.throws(() => proposalLabel("alice", new String("bearing")), RangeError);
  assert.doesNotThrow(() => proposalLabel("alice", "bearing"));
});

/* The sixteen tables as they stood before R61, every sentence, as one digest over their canonical JSON (taken at T47's
   START from the committed module, before the change). */
const SIXTEEN_BEFORE_R61 = "e3b110dca515d5e98e4afe6cd602167102aa30f9392aacadfee014801094b773";

test("R61 PROPOSAL_STATES gains status_report after bearing, last, frozen with the three states: a draft of a status report on a plan, kept with the plan and never published, the report kept the member's; machine work the assistant's draft, labeled as machine work, which can draft a report and never keep or publish one; the other sixteen tables unchanged", () => {
  const keys = Object.keys(PROPOSAL_STATES);
  assert.equal(keys.indexOf("status_report"), keys.indexOf("bearing") + 1);
  assert.equal(keys.at(-1), "status_report");
  assert.equal(keys.length, 17);
  const t = PROPOSAL_STATES.status_report;
  assert.ok(Object.isFrozen(t));
  assert.deepEqual(Object.keys(t), STATES3);
  for (const s of STATES3) {
    assert.equal(t[s], row("status_report", s), s);
    /* No state says the draft is published or is the report kept. */
    assert.doesNotMatch(t[s], /\b(is|was) published\b|\bis the report kept\b/, s);
  }
  /* Only the machine's sentence says machine work or names the assistant. */
  for (const s of ["member_proposed", "unstated"]) assert.doesNotMatch(t[s], /machine|assistant/, s);
  /* Every state, every identity: the label R38 composes, through this subject's own sentence. */
  for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
    const state = lawProposalState(w);
    assert.deepEqual(proposalLabel(w, "status_report"), { by: w ?? null, state, machine_work: state === "machine_proposed", says: t[state] },
      String(w));
  }
  assert.deepEqual(proposalLabel("token:assistant", "status_report"),
    { by: "token:assistant", state: "machine_proposed", machine_work: true, says: t.machine_proposed });
  assert.deepEqual(proposalLabel("alice", "status_report"), { by: "alice", state: "member_proposed", machine_work: false, says: t.member_proposed });
  assert.deepEqual(proposalLabel(undefined, "status_report"), { by: null, state: "unstated", machine_work: false, says: t.unstated });
  /* No sentence of it is another subject's. */
  const others = new Set(Object.entries(PROPOSAL_STATES).filter(([k]) => k !== "status_report").flatMap(([, x]) => Object.values(x)));
  for (const s of STATES3) assert.ok(!others.has(t[s]), s);
  /* The other tables and their sentences are unchanged, every one, in order. */
  const { status_report, ...before } = PROPOSAL_STATES;
  assert.ok(status_report === t);
  assert.deepEqual(Object.keys(before), SUBJECTS.slice(0, 16));
  assert.equal(RG.sha256HexSync(RG.canonicalJson(before)), SIXTEEN_BEFORE_R61);
});

test("R61 negative control: near spellings of status_report throw a RangeError naming the seventeen subjects, in order; status_report itself answers", () => {
  const msg = (s) => word("record-grammar.labels.unknown_subject", { subject: s, subjects: SUBJECTS.join(", ") });
  assert.ok(msg("x").endsWith("account_check, bearing, status_report"));
  for (const s of ["status_reports", "Status_report", "STATUS_REPORT", "statusReport", "status-report", "status report", "status",
    "report", "status_report ", " status_report", "plan_status_report", "status_report_draft"])
    assert.throws(() => proposalLabel("token:assistant", s), (e) => e instanceof RangeError && e.message === msg(s), s);
  for (const s of [new String("status_report"), ["status_report"], { toString: () => "status_report" }])
    assert.throws(() => proposalLabel("alice", s), RangeError, String(s));
  /* Control: the subject itself answers, for a machine and for a member. */
  assert.equal(proposalLabel("token:assistant", "status_report").state, "machine_proposed");
  assert.equal(proposalLabel("alice", "status_report").state, "member_proposed");
});
