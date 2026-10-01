/* record-grammar at its interface: the machine-work labels moved at T19 (draft-T19), and the shared act rows (R29). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { LAW_PROPOSAL_STATES, lawProposalState, PROPOSAL_STATES, proposalLabel, CONTENT_MINTED_BY_PLANE, CONTENT_MINT_STATES,
  contentMintState, isMachineMinted, isMachineIdentity, SHARED_ACT_CHECKS, NON_MEMBER_AUTHORS, ACTOR_CLASSES }
  from "../../../src/record-grammar/index.mjs";

const STATES3 = ["machine_proposed", "member_proposed", "unstated"];
const MACHINES = ["token:member", "class:ai", " Token:x ", "claude", "AGENT", ...NON_MEMBER_AUTHORS, ...ACTOR_CLASSES];
const MEMBERS = ["alice", "Bob Smith", "admin", "tokens", "plane", "none:independent-sufficiency"];
const BLANKS = [undefined, null, "", "   ", "\n"];

test("lawProposalState: blank is unstated, a machine identity machine_proposed, any other name member_proposed", () => {
  for (const w of BLANKS) assert.equal(lawProposalState(w), "unstated");
  for (const w of MACHINES) assert.equal(lawProposalState(w), "machine_proposed", w);
  for (const w of MEMBERS) assert.equal(lawProposalState(w), "member_proposed", w);
});

test("PROPOSAL_STATES: one frozen table per subject, governing_laws REC-195's own, each with the three states' sentences", () => {
  assert.ok(Object.isFrozen(PROPOSAL_STATES));
  assert.deepEqual(Object.keys(PROPOSAL_STATES), ["governing_laws", "standard", "comparison", "filing_draft", "theory",
    "plan_option", "communication"]);
  assert.ok(PROPOSAL_STATES.governing_laws === LAW_PROPOSAL_STATES);
  const said = new Set();
  for (const [subject, t] of Object.entries(PROPOSAL_STATES)) {
    assert.deepEqual(Object.keys(t), STATES3, subject);
    for (const s of STATES3) { assert.equal(typeof t[s], "string"); assert.ok(t[s].length > 20); said.add(t[s]); }
    if (subject !== "governing_laws") assert.ok(Object.isFrozen(t), subject);
    assert.match(t.machine_proposed, /machine work, labelled as machine work/, subject);
  }
  assert.equal(said.size, 7 * 3, "no two sentences are the same");
});

test("proposalLabel: {by, state, machine_work, says} for every subject and state; an unknown subject throws RangeError", () => {
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

test("CONTENT_MINT_STATES and contentMintState: blank unstated, the plane's own mint, a machine credential, else a member", () => {
  assert.equal(CONTENT_MINTED_BY_PLANE, "plane");
  assert.deepEqual(Object.keys(CONTENT_MINT_STATES), ["member_marked", "plane_minted", "machine_marked", "unstated"]);
  for (const v of Object.values(CONTENT_MINT_STATES)) assert.ok(typeof v === "string" && v.length > 20);
  assert.equal(isMachineIdentity(CONTENT_MINTED_BY_PLANE), false);
  for (const w of BLANKS) assert.equal(contentMintState(w), "unstated");
  for (const w of ["plane", " Plane ", "PLANE"]) assert.equal(contentMintState(w), "plane_minted", w);
  for (const w of MACHINES) assert.equal(contentMintState(w), "machine_marked", w);
  for (const w of MEMBERS.filter((m) => m !== "plane")) assert.equal(contentMintState(w), "member_marked", w);
  for (const w of [...BLANKS, ...MACHINES, ...MEMBERS]) assert.equal(isMachineMinted(w), contentMintState(w) === "machine_marked");
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
  assert.deepEqual(Object.keys(SHARED_ACT_CHECKS), ["NO_BASIS", "NO_CITATION"]);
  for (const row of Object.values(SHARED_ACT_CHECKS)) assert.deepEqual(Object.keys(row), ["check", "where", "translation"]);
  assert.equal(SHARED_ACT_CHECKS.NO_BASIS.check, "C-33.40");
  assert.equal(SHARED_ACT_CHECKS.NO_CITATION.check, "C-33.41");
  assert.equal(SHARED_ACT_CHECKS.NO_BASIS.translation, NO_BASIS_T);
  assert.equal(SHARED_ACT_CHECKS.NO_CITATION.translation, NO_CITATION_T);
  assert.equal(SHARED_ACT_CHECKS.NO_BASIS.where, "src/inquiry/index.mjs actNoBasis > is-act-no-basis");
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
