/* record-grammar at its interface: the machine-work labels moved at T19 (R37, R38), and the shared act rows (R29). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import * as RG from "../../../src/record-grammar/index.mjs";
import { LAW_PROPOSAL_STATES, lawProposalState, PROPOSAL_STATES, proposalLabel, CONTENT_MINTED_BY_PLANE, CONTENT_MINT_STATES,
  contentMintState, isMachineIdentity, SHARED_ACT_CHECKS, NON_MEMBER_AUTHORS, ACTOR_CLASSES }
  from "../../../src/record-grammar/index.mjs";

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
    "case_account", "account_check"]);
  assert.ok(PROPOSAL_STATES.governing_laws === LAW_PROPOSAL_STATES);
  const said = new Set();
  for (const [subject, t] of Object.entries(PROPOSAL_STATES)) {
    assert.deepEqual(Object.keys(t), STATES3, subject);
    for (const s of STATES3) { assert.equal(typeof t[s], "string"); assert.ok(t[s].length > 20); said.add(t[s]); }
    if (subject !== "governing_laws") assert.ok(Object.isFrozen(t), subject);
    assert.match(t.machine_proposed, /machine work, labelled as machine work/, subject);
  }
  assert.equal(said.size, 15 * 3, "no two sentences are the same");
});

const SUBJECTS = ["governing_laws", "standard", "comparison", "filing_draft", "theory", "plan_option", "communication", "template",
  "edition_statement", "escalation_reason", "wizard", "law_relation", "translation", "case_account", "account_check"];

test("R42 PROPOSAL_STATES.template: after communication, frozen, three sentences of wording proposed for a filing template, machine work never drafts, reviews or approves", () => {
  assert.equal(Object.keys(PROPOSAL_STATES).indexOf("template"), 7);
  const t = PROPOSAL_STATES.template;
  assert.ok(Object.isFrozen(t));
  assert.deepEqual(Object.keys(t), STATES3);
  for (const s of STATES3) {
    assert.match(t[s], /wording for a filing template/, s);
    assert.match(t[s], /not a template's text until a member adopts it into a draft|not that until a member adopts it into a draft/, s);
  }
  assert.match(t.machine_proposed, /machine work, labelled as machine work: it can propose wording and it can never draft, review or approve a template/);
  assert.match(t.member_proposed, /the record holds who proposed it/);
  for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
    const state = lawProposalState(w);
    assert.deepEqual(proposalLabel(w, "template"), { by: w ?? null, state, machine_work: state === "machine_proposed", says: t[state] });
  }
});

/* R43, R44 and R45: each a frozen table of the three states, after the one before it, every sentence saying what the
   proposal is and that it is not the member's or the group's own until a member acts; machine work is a draft. */
function newSubject(subject, after, what, until) {
  const keys = Object.keys(PROPOSAL_STATES);
  assert.equal(keys.indexOf(subject), keys.indexOf(after) + 1, `${subject} after ${after}`);
  const t = PROPOSAL_STATES[subject];
  assert.ok(Object.isFrozen(t));
  assert.deepEqual(Object.keys(t), STATES3);
  for (const s of STATES3) {
    assert.match(t[s], what, s);
    assert.match(t[s], until, s);
  }
  assert.match(t.machine_proposed, /^a machine credential /);
  assert.match(t.machine_proposed, /That is machine work, labelled as machine work: it is a draft/);
  assert.match(t.member_proposed, /^a member /);
  assert.match(t.member_proposed, /It is a proposal and not .*the record holds who proposed it$/);
  assert.match(t.unstated, /^the record does not say who /);
  for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) {
    const state = lawProposalState(w);
    assert.deepEqual(proposalLabel(w, subject), { by: w ?? null, state, machine_work: state === "machine_proposed", says: t[state] });
  }
  assert.equal(proposalLabel("token:skill", subject).state, "machine_proposed");
  assert.equal(proposalLabel("token:skill", subject).machine_work, true);
}

test("R43 PROPOSAL_STATES.edition_statement: after template, frozen, a new edition's statement of what changed and why, not the group's until a member adopts or rewrites it; machine work a draft", () => {
  newSubject("edition_statement", "template", /statement of what changed in this edition, and why/,
    /not the group's statement until a member adopts or rewrites it/);
});

test("R44 PROPOSAL_STATES.escalation_reason: after edition_statement, frozen, a reason for opening an escalation assembled from the determination's record, not a member's until a member sends it; machine work a draft", () => {
  newSubject("escalation_reason", "edition_statement", /reason for opening an escalation from the determination's record/,
    /not a member's reason until a member sends it, as offered or edited/);
});

test("R45 PROPOSAL_STATES.wizard: after escalation_reason, frozen, steps proposed for a wizard script, not a script's until its author adopts them into a version; machine work a draft that never drafts, submits or approves a script", () => {
  newSubject("wizard", "escalation_reason", /proposed these steps for a wizard script/,
    /not a script's steps until its author adopts them into a version/);
  assert.match(PROPOSAL_STATES.wizard.machine_proposed, /it is a draft, which can propose steps and can never draft, submit or approve a script/);
  /* The tables before it are unchanged in number and order (R42's eight first, then R43's and R44's); R49's follows it,
     then R50's, then R54's two. */
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
  for (const s of STATES3) {
    assert.match(t[s], /law relation, court link or treatment/, s);
    assert.match(t[s], /not one the record holds until a member records it themselves/, s);
  }
  assert.match(t.machine_proposed, /^a machine credential proposed /);
  assert.match(t.machine_proposed, /That is machine work, labelled as machine work: it can propose one and it can never record one\./);
  assert.match(t.member_proposed, /^a member proposed /);
  assert.match(t.member_proposed, /It is a proposal and not one the record holds .*the record holds who proposed it$/);
  assert.match(t.unstated, /^the record does not say who proposed /);
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
  assert.match(PROPOSAL_STATES.standard.machine_proposed, /^a machine credential proposed this standard\./);
});

/* The twelve tables as they stood before R50, every sentence, as one digest over their canonical JSON (taken at T37's
   START, before the change). */
const TWELVE_BEFORE_R50 = "2ecddc263952880900d36d3aec02ae0508f51a8f573d95c2f6f98a8e992bc705";

test("R50 PROPOSAL_STATES.translation: after law_relation (and before R54's two), frozen, a draft translation of an interface word shown as \"Draft\", not the group's wording until a member granted that language adopts it; machine work can draft one and never adopt or confirm one; the other tables unchanged", () => {
  const keys = Object.keys(PROPOSAL_STATES);
  assert.equal(keys.indexOf("translation"), keys.indexOf("law_relation") + 1);
  assert.equal(keys.indexOf("case_account"), keys.indexOf("translation") + 1, "R54's follow it");
  const t = PROPOSAL_STATES.translation;
  assert.ok(Object.isFrozen(t));
  assert.deepEqual(Object.keys(t), STATES3);
  for (const s of STATES3) {
    assert.match(t[s], /translation of an interface word/, s);
    assert.match(t[s], /It is a draft, shown to members as "Draft",/, s);
    assert.match(t[s], /not the group's wording until a member granted that language adopts it/, s);
  }
  assert.match(t.machine_proposed, /^a machine credential drafted /);
  assert.match(t.machine_proposed,
    /That is machine work, labelled as machine work: it can draft a translation and it can never adopt or confirm one\./);
  assert.match(t.member_proposed, /^a member proposed /);
  assert.match(t.member_proposed, /the record holds who proposed it$/);
  assert.match(t.unstated, /^the record does not say who drafted /);
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
  const { translation, case_account, account_check, ...before } = PROPOSAL_STATES;
  assert.ok(translation === t);
  assert.equal(RG.sha256HexSync(RG.canonicalJson(before)), TWELVE_BEFORE_R50);
  assert.deepEqual(Object.keys(before), SUBJECTS.slice(0, 12));
});

/* The thirteen tables as they stood before R54, every sentence, as one digest over their canonical JSON (taken at T42's
   START from the committed module, before the change). */
const THIRTEEN_BEFORE_R54 = "a5e77c2a4787012223d187d07dba679b43c2072a84c803a94c85c056a85450ad";

test("R54 PROPOSAL_STATES gains case_account and account_check after translation, each frozen with the three states: a draft of a case's account from its cited evidence, never the case's account, which a member writes in her own words; flagged sentences of a member's account the evidence they cite does not support, a draft and never a finding of the group; machine work labelled as machine work; the other thirteen tables unchanged", () => {
  const keys = Object.keys(PROPOSAL_STATES);
  assert.equal(keys.length, 15);
  assert.deepEqual(keys.slice(-3), ["translation", "case_account", "account_check"]);
  const ca = PROPOSAL_STATES.case_account, ac = PROPOSAL_STATES.account_check;
  for (const [subject, t] of [["case_account", ca], ["account_check", ac]]) {
    assert.ok(Object.isFrozen(t), subject);
    assert.deepEqual(Object.keys(t), STATES3, subject);
    assert.match(t.machine_proposed, /^a machine credential /, subject);
    assert.match(t.machine_proposed, /That is machine work, labelled as machine work: it is a draft/, subject);
    assert.match(t.member_proposed, /^a member /, subject);
    assert.match(t.member_proposed, /the record holds who proposed it$/, subject);
    assert.match(t.unstated, /^the record does not say who /, subject);
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
  for (const s of STATES3) {
    assert.match(ca[s], /account of a case from its cited evidence/, s);
    assert.match(ca[s], /never (be )?the case's account/, s);
    assert.match(ca[s], /a member writes in her own words/, s);
    assert.doesNotMatch(ca[s], /\bis the case's account\b/, s);
  }
  /* account_check: the sentences flagged are a member's account's that the evidence they cite does not support, a draft and
     never a finding of the group, in every state. */
  for (const s of STATES3) {
    assert.match(ac[s], /flagged these sentences of a member's account as not supported by the evidence they cite/, s);
    assert.match(ac[s], /never a finding of the group/, s);
    assert.match(ac[s], /draft/, s);
  }
  /* The two subjects say different things: no sentence of one is the other's, and each names only its own object. */
  for (const s of STATES3) {
    assert.notEqual(ca[s], ac[s]);
    assert.doesNotMatch(ca[s], /flagged/, s);
    assert.doesNotMatch(ac[s], /cited evidence/, s);
  }
  /* The other tables and their sentences are unchanged, every one, in order. */
  const { case_account, account_check, ...before } = PROPOSAL_STATES;
  assert.ok(case_account === ca && account_check === ac);
  assert.deepEqual(Object.keys(before), SUBJECTS.slice(0, 13));
  assert.equal(RG.sha256HexSync(RG.canonicalJson(before)), THIRTEEN_BEFORE_R54);
});

test("R54 negative control: an unknown subject, near spellings of the two new ones included, throws a RangeError naming the fifteen subjects", () => {
  const msg = (s) => `proposalLabel: '${s}' is not a proposal subject; one of ${SUBJECTS.join(", ")}`;
  assert.ok(msg("x").endsWith("translation, case_account, account_check"));
  for (const s of ["case_accounts", "Case_account", "caseAccount", "case-account", "account", "account_checks", "Account_check",
    "accountCheck", "account-check", "check", "case", "case_account ", " account_check", "case_account_check"])
    assert.throws(() => proposalLabel("token:skill", s), (e) => e instanceof RangeError && e.message === msg(s), s);
  for (const s of [undefined, null, 15, {}, ["case_account"], new String("case_account")])
    assert.throws(() => proposalLabel("alice", s), RangeError, String(s));
  /* Control: the two new subjects themselves answer. */
  for (const s of ["case_account", "account_check"]) assert.doesNotThrow(() => proposalLabel("alice", s), s);
});

test("R38 R42 R44 R45 R49 R50 R54 proposalLabel's RangeError for an unknown subject names all fifteen subjects, in order", () => {
  assert.equal(SUBJECTS.length, 15);
  for (const s of ["templates", "edition", "escalation", "Edition_statement", "escalation_reasons", "wizards", "Wizard", "__proto__",
    "law_relations", "Law_relation", "law", "court_link", "treatment", "translations", "Translation", "draft", "interface_word"])
    assert.throws(() => proposalLabel("a", s), (e) => e instanceof RangeError
      && e.message === `proposalLabel: '${s}' is not a proposal subject; one of ${SUBJECTS.join(", ")}`, s);
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
  assert.throws(() => proposalLabel("a", "x".repeat(100)), { message: /'x{40}' is not a proposal subject; one of governing_laws, standard/ });
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

const NO_BASIS_T = "This asks the record to stand behind something without saying what it rests on. Say what that is first — "
  + "what the question is grounded in, what you personally observed, or why a settled thing is being changed — and the record "
  + "carries it beside the claim, in your name, so a later reader can go and disagree with it. If the honest answer is that "
  + "nothing supports it yet, write that down rather than inventing something: a stated absence is a real answer here, and an "
  + "empty basis reads as one nobody checked.";
const NO_CITATION_T = "A citation is the address of something somebody who was not here can go and read. Without one, what you "
  + "have written can only be checked by you, and the record would be claiming more than it can show. Name where the source is "
  + "published or held — if it is not public, say who holds it and how it was seen, which is still an address and is still "
  + "checkable.";

test("R29 the shared act rows: NO_BASIS C-33.40 and NO_CITATION C-33.41, {check, where, translation}, numbers and words unchanged", () => {
  assert.ok(Object.isFrozen(SHARED_ACT_CHECKS));
  assert.deepEqual(Object.keys(SHARED_ACT_CHECKS), ["NO_BASIS", "NO_CITATION", "ACCEPT_MUST_REAUTHOR"]);
  for (const row of Object.values(SHARED_ACT_CHECKS)) assert.deepEqual(Object.keys(row), ["check", "where", "translation"]);
  assert.equal(SHARED_ACT_CHECKS.NO_BASIS.check, "C-33.40");
  assert.equal(SHARED_ACT_CHECKS.NO_CITATION.check, "C-33.41");
  assert.equal(SHARED_ACT_CHECKS.NO_BASIS.translation, NO_BASIS_T);
  assert.equal(SHARED_ACT_CHECKS.NO_CITATION.translation, NO_CITATION_T);
});

/* N827, K2467 (T42): C-33.40's where names every site that answers with its row, not inquiry's alone. The modules named
   come later in the order, so this test reads the where and the files it names, never their code (P4). */
test("R29 C-33.40's where names every site that raises NO_BASIS: inquiry's actNoBasis (basis-versions through it), progressions' refusal (first declaration and revision of a declared flow), entities' actShapeRefusal; each file exists", async () => {
  const w = SHARED_ACT_CHECKS.NO_BASIS.where;
  assert.match(w, /^src\/inquiry\/index\.mjs actNoBasis > is-act-no-basis\b/);
  assert.match(w, /basis-versions/);
  assert.match(w, /src\/progressions\/checks\.mjs refusal\b/);
  assert.match(w, /src\/progressions\/index\.mjs/);
  assert.match(w, /first declaration and revision of a declared flow/);
  assert.match(w, /src\/entities\/index\.mjs actShapeRefusal\b/);
  assert.match(w, /held identifier and grade-D testimony/);
  /* Negative control: it no longer names inquiry's site alone. */
  assert.notEqual(w, "src/inquiry/index.mjs actNoBasis > is-act-no-basis");
  for (const f of w.match(/src\/[\w/.-]+\.mjs/g)) assert.ok(existsSync(new URL(`../../../${f}`, import.meta.url)), f);
});

test("R29 C-33.41's where names entities' and progressions' sites, not store.mjs actNoCitation, and each file exists", () => {
  const w = SHARED_ACT_CHECKS.NO_CITATION.where;
  assert.match(w, /^src\/entities\/index\.mjs actShapeRefusal\b/);
  assert.match(w, /declareRelation/);
  assert.match(w, /src\/progressions\/checks\.mjs refusal\b/);
  assert.match(w, /revision of a declared flow/);
  assert.match(w, /exception document/);
  assert.doesNotMatch(w, /store\.mjs|actNoCitation/);
  for (const f of w.match(/src\/[\w/.-]+\.mjs/g)) assert.ok(existsSync(new URL(`../../../${f}`, import.meta.url)), f);
});
