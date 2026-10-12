/* case-account, T46: its ops map carries R13's two ops (R15; N935; plane R39), and C-153.2 takes its words from
   `words.json` by key (R16; DEC-194; N913), driven at the module's interface: `caseAccountOps` over the real instance, and
   `advocacyCheck`'s refusal. Words are read by key from `words.json` (`./words.mjs`); a key the list lacks fails the test.
   (case-checker R24 as T46 states it, N916) A sentence stating nothing checkable reads supported when it cites anything
   read: R13's arm below shows the reading, the sentence citing nothing read as its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { caseAccountOps, CASE_ACCOUNT_CHECKS, ADVOCACY_WORDS } from "../../../src/case-account/index.mjs";
import { WORD, HAS } from "./words.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", MET = "CNT-2026-0001";
const url = (q) => new URL(`https://plane.example/?${q}`);
const enc = encodeURIComponent;

function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC, `bytes of ${DOC}`, { units: ["The council met on 3 March 2026."] });
  w.finding(Q, [{ target: DOC }], { claim: "the award followed the minutes" });
  w.passage(MET, sha(`bytes of ${DOC}`), DOC, 1);
  const MINE = w.project("Mine", "alice");
  w.scope(MINE, "own");
  const TEAM = w.project("Team", "alice");
  w.join(TEAM, "bo");
  return { w, MINE, TEAM };
}
const TEXT = [{ text: "The council met on 3 March 2026.", cites: [{ kind: "passage", ref: MET }] }];

/* ---------------------------------------------------------------- R15 */

test("R15 caseAccountOps publishes one arm per act and read, advocacycheck and advocacychecks, so the plane spreads the map and names no entry of this module's", () => {
  const { w } = setup();
  const ops = caseAccountOps(w.cacc, url(""), null);
  assert.deepEqual(Object.keys(ops).sort(), ["advocacycheck", "advocacychecks"]);
  for (const arm of Object.values(ops)) assert.equal(typeof arm, "function");
  /* building the map runs nothing: no check is written until an arm is called */
  assert.equal(w.count("advocacy_checks"), 0);
});

test("R15 the advocacycheck arm answers exactly R13's advocacyCheck({project, sentences, author, viewer}): project the query's else the body's, sentences the body's, author the URL's by stamp and viewer the URL's, never the body's", () => {
  const { w, MINE, TEAM } = setup();
  const arm = (q, body) => caseAccountOps(w.cacc, url(q), body).advocacycheck();
  const stamps = `by=${enc(V("alice"))}&viewer=${enc(V("alice"))}`;
  /* project from the query; the body's sentences */
  const a = arm(`project=${MINE}&${stamps}`, { sentences: TEXT });
  assert.equal(a.ok, true, JSON.stringify(a));
  const direct = w.cacc.advocacyCheck({ project: MINE, sentences: TEXT, author: V("alice"), viewer: V("alice") });
  assert.deepEqual(a, direct, "exactly R13's answer");
  /* project from the body when the query has none; the query's wins over the body's */
  assert.deepEqual(arm(stamps, { project: MINE, sentences: TEXT }), direct);
  assert.equal(arm(`project=${TEAM}&${stamps}`, { project: MINE, sentences: TEXT }).reason, "ADVOCACY_NOT_OWN_PROJECT");
  /* the stamps are the URL's: a body cannot set the author or the viewer */
  const before = w.snapshot();
  assert.deepEqual(arm(`project=${MINE}`, { sentences: TEXT, author: V("alice"), by: V("alice"), viewer: V("alice") }),
                   w.cacc.advocacyCheck({ project: MINE, sentences: TEXT, author: null, viewer: null }));
  assert.equal(arm(`project=${MINE}`, { sentences: TEXT, by: V("alice") }).reason, "MACHINE_CANNOT_CHECK_ADVOCACY");
  assert.equal(arm(`project=${MINE}&by=${enc(V("alice"))}`, { sentences: TEXT, viewer: V("alice") }).reason, "NO_SUCH_PROJECT");
  assert.equal(arm(`project=${MINE}&by=${enc(V("bo"))}&viewer=${enc(V("alice"))}`, { sentences: TEXT, author: V("alice") }).reason,
               "ADVOCACY_NOT_OWN_PROJECT", "the by stamp is the author, not the body's");
  /* a body that is not an object carries no sentences, R13's BAD_ACCOUNT */
  for (const body of [null, "text", [TEXT[0]]]) {
    const r = arm(`project=${MINE}&${stamps}`, body);
    assert.deepEqual([r.reason, r.field], ["BAD_ACCOUNT", "sentences"], JSON.stringify(body));
  }
  assert.deepEqual(w.snapshot(), before, "each refusal through the arm writes nothing");
});

test("R15 the advocacychecks arm answers exactly R13's advocacyChecksOf({project, viewer}): project the query's else the body's, viewer the URL's, never the body's; it writes nothing", () => {
  const { w, MINE } = setup();
  w.cacc.advocacyCheck({ project: MINE, sentences: TEXT, author: V("alice"), viewer: V("alice") });
  const arm = (q, body = null) => caseAccountOps(w.cacc, url(q), body).advocacychecks();
  const snap = w.snapshot();
  const mine = w.cacc.advocacyChecksOf({ project: MINE, viewer: V("alice") });
  assert.equal(mine.checks.length, 1);
  assert.deepEqual(arm(`project=${MINE}&viewer=${enc(V("alice"))}`), mine);
  assert.deepEqual(arm(`viewer=${enc(V("alice"))}`, { project: MINE }), mine, "the body's project when the query has none");
  /* the viewer is the URL's: a body cannot set it */
  assert.equal(JSON.stringify(arm(`project=${MINE}`, { viewer: V("alice") })),
               JSON.stringify(w.cacc.advocacyChecksOf({ project: MINE, viewer: null })));
  assert.equal(arm(`project=${MINE}&viewer=${enc(V("bo"))}`, { viewer: V("alice") }).reason, "NO_SUCH_PROJECT");
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
});

/* ---------------------------------------------------------------- R16 */

test("R16 C-153.2 ADVOCACY_NOT_OWN_PROJECT takes its translation from words.json's refusal.ADVOCACY_NOT_OWN_PROJECT, verbatim and read by key; its code, number and where unmoved; the rows words.json does not hold (C-153.1, C-153.3) keep theirs", () => {
  const key = "refusal.ADVOCACY_NOT_OWN_PROJECT";
  assert.equal(CASE_ACCOUNT_CHECKS.ADVOCACY_NOT_OWN_PROJECT.translation, WORD(key));
  assert.equal(ADVOCACY_WORDS[key], WORD(key));
  assert.equal(WORD(key), "Your own text is checked only in your own project: a hidden project set as yours, with you its one "
    + "member. Nothing was written.");
  assert.deepEqual(Object.keys(ADVOCACY_WORDS), [key], "only the codes words.json holds");
  assert.deepEqual([CASE_ACCOUNT_CHECKS.ADVOCACY_NOT_OWN_PROJECT.check, CASE_ACCOUNT_CHECKS.ADVOCACY_NOT_OWN_PROJECT.where],
                   ["C-153.2", "src/case-account/index.mjs advocacyCheck > is-advocacy-own-project"]);
  /* the rows words.json does not hold keep their words, codes, numbers and wheres */
  for (const code of ["ACCOUNT_CITES_COUNSEL_MATTER", "MACHINE_CANNOT_CHECK_ADVOCACY"]) assert.equal(HAS(`refusal.${code}`), false, code);
  assert.deepEqual(Object.entries(CASE_ACCOUNT_CHECKS).map(([k, r]) => [k, r.check, r.where]), [
    ["ACCOUNT_CITES_COUNSEL_MATTER", "C-153.1", "src/case-account/index.mjs #held > is-cite-counsel-matter"],
    ["ADVOCACY_NOT_OWN_PROJECT", "C-153.2", "src/case-account/index.mjs advocacyCheck > is-advocacy-own-project"],
    ["MACHINE_CANNOT_CHECK_ADVOCACY", "C-153.3", "src/case-account/index.mjs advocacyCheck > is-advocacy-member"]]);
  assert.equal(CASE_ACCOUNT_CHECKS.ACCOUNT_CITES_COUNSEL_MATTER.translation, "This sentence cites something from a counsel "
    + "matter, which is never used as evidence outside it. Cite something else, or leave it out. Nothing was written.");
  assert.equal(CASE_ACCOUNT_CHECKS.MACHINE_CANNOT_CHECK_ADVOCACY.translation, "Only members check their own text against the "
    + "record, and this request named no member. Nothing was written.");
});

test("R16 the keyed refusal reached at the interface answers words.json's words with its behaviour unmoved (refused in a project not the author's own, nothing written); control: the same act in her own project lands", () => {
  const { w, MINE, TEAM } = setup();
  const before = w.snapshot();
  const r = w.cacc.advocacyCheck({ project: TEAM, sentences: TEXT, author: V("alice"), viewer: V("alice") });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.project],
                   [false, "ADVOCACY_NOT_OWN_PROJECT", "ADVOCACY_NOT_OWN_PROJECT", "C-153.2", WORD("refusal.ADVOCACY_NOT_OWN_PROJECT"), TEAM]);
  assert.match(r.detail, /Nothing was written\./);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.equal(w.cacc.advocacyCheck({ project: MINE, sentences: TEXT, author: V("alice"), viewer: V("alice") }).ok, true);
});

/* ---------------------------------------------------------------- R13 read as case-checker R24 states it (T46) */

test("R13 (case-checker R24 as T46 states it): a sentence stating nothing checkable reads supported whenever it cites anything read — supported means only that it states nothing the cited record lacks; control: the same sentence citing nothing, or only what the author cannot read, is not_supported", () => {
  const { w, MINE } = setup();
  const H = w.project("Hidden", "bo");
  const HID = "INQ-2026-0009-h";
  w.finding(HID, [{ target: DOC }], { claim: "the award followed the minutes" });
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, H, HID);
  const opinion = "The council should be replaced.";
  const r = w.cacc.advocacyCheck({ project: MINE, author: V("alice"), viewer: V("alice"), sentences: [
    { text: opinion, cites: [{ kind: "passage", ref: MET }] },
    { text: opinion, cites: [{ kind: "finding", ref: Q }] },
    { text: opinion, cites: [] },
    { text: opinion, cites: [{ kind: "finding", ref: HID }] }] });
  assert.deepEqual(r.sentences.map((x) => [x.ord, x.result, x.codes]), [
    [1, "supported", []], [2, "supported", []],
    [3, "not_supported", ["ACCOUNT_SENTENCE_UNSUPPORTED"]], [4, "not_supported", ["ACCOUNT_SENTENCE_UNSUPPORTED"]]]);
});

/* ---------------------------------------------------------------- K2965: one leg convention end to end */

/* A finding on a two-leg basis: leg 1 supports it, leg 2 cuts against it (R5: a leg cite's ord is 1-based). */
function twoLegs() {
  const s = setup();
  s.w.doc("INFO-2026-0002-b", "bytes of INFO-2026-0002-b");
  s.w.finding("INQ-2026-0003-l", [{ target: DOC }, { target: "INFO-2026-0002-b", role: "cuts_against" }]);
  return s;
}
const L = "INQ-2026-0003-l";
const leg = (ord) => ({ kind: "leg", ref: L, ord });
const AS_SUPPORT = "That record supports the finding.";

test("R6 (K2965): a leg cite and the conclusions handed with it name the same leg — leg n is the basis's nth leg in the holding and in the conclusion's legs alike (ord n), so a sentence reading leg 1 (which supports) as support stands, and the same sentence on leg 2 (which cuts against) is ACCOUNT_CONTRADICTED_BY_RECORD; it holds through the real case-disclosures R30 and case-checker R24", () => {
  const { w } = twoLegs();
  const basis = w.inquiry.basisFor(L).legs;
  assert.deepEqual(basis.map((l) => l.role), ["supports", "cuts_against"]);
  const judge = (ord) => w.cacc.accountJudged({ sentences: [{ text: AS_SUPPORT, cites: [leg(ord)], bias_statement: null }], statementCites: null,
    statement: null, justification: null, excluded: [], prepared: [{ id: L }], reached: null, lens: null, caseId: null, viewer: V("alice") });
  const one = judge(1);
  const handed = w.judged.at(-1);
  assert.deepEqual(handed.cited.holdings, [{ address: `leg:${L}#1`, quote: JSON.stringify(basis[0]) }], "leg 1 is the first leg");
  assert.deepEqual(handed.conclusions[0].legs.map((l) => [l.ord, l.role]), [[1, "supports"], [2, "cuts_against"]], "numbered as the cites are");
  assert.equal(one.results.get(1).includes("ACCOUNT_CONTRADICTED_BY_RECORD"), false, JSON.stringify(one.refusals));
  const two = judge(2);
  assert.deepEqual(w.judged.at(-1).cited.holdings, [{ address: `leg:${L}#2`, quote: JSON.stringify(basis[1]) }], "leg 2 is the second leg");
  assert.ok(two.results.get(1).includes("ACCOUNT_CONTRADICTED_BY_RECORD"), JSON.stringify(two.refusals));
});

test("R13 (K2965): in a member's own text the same convention holds — a sentence reading leg 1 (which supports) as support is supported; control: on leg 2 (which cuts against) it is contradicted", () => {
  const { w, MINE } = twoLegs();
  const r = w.cacc.advocacyCheck({ project: MINE, author: V("alice"), viewer: V("alice"),
    sentences: [{ text: AS_SUPPORT, cites: [leg(1)] }, { text: AS_SUPPORT, cites: [leg(2)] }] });
  assert.deepEqual(r.sentences.map((x) => [x.ord, x.result, x.codes, x.findings]), [
    [1, "supported", [], [L]], [2, "contradicted", ["ACCOUNT_CONTRADICTED_BY_RECORD"], [L]]]);
});

/* ---------------------------------------------------------------- case-disclosures R30's control, under R6 */

test("R6 (case-disclosures R30's control, T46; N901): through the real case-account, case-disclosures and case-checker, with no stand-in, an account sentence citing a held finding whose words hold its facts passes; control: the same sentence whose cite the viewer cannot read answers ACCOUNT_SENTENCE_UNSUPPORTED", () => {
  const { w } = setup();
  const H = w.project("Hidden", "bo");
  const HID = "INQ-2026-0009-h";
  w.finding(HID, [{ target: DOC }]);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, H, HID);
  const judge = (ref, text) => w.cacc.accountJudged({ sentences: [{ text, cites: [{ kind: "finding", ref, ord: null }], bias_statement: null }],
    statementCites: null, statement: null, justification: null, excluded: [], prepared: [], reached: null, lens: null, caseId: null,
    viewer: V("alice") });
  const held = judge(Q, `The finding asks "Was ${Q} answered?"`);
  assert.deepEqual(held.results.get(1), [], JSON.stringify(held.refusals));
  const unread = judge(HID, `The finding asks "Was ${HID} answered?"`);
  assert.deepEqual(unread.results.get(1), ["ACCOUNT_SENTENCE_UNSUPPORTED"], JSON.stringify(unread.refusals));
});
