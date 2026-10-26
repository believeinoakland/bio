/* case-account: a member's own text, checked against the record (R13; T45; N861; Actions D11a; v0.2 rule 9), driven at
   the module's interface: `advocacyCheck` and `advocacyChecksOf`. The project's scope is project-roster's own act (its
   R21) and read through its R23; a finding's conclusion is basis-versions' (its R23); the judgment is case-checker's
   `checkAccount` (its R24), each the real one on the host. Every refusal has its control: the same act in the member's
   own project. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { CaseAccount, CASE_ACCOUNT_CHECKS, ADVOCACY_RESULTS, ADVOCACY_CHECKS_MAX } from "../../../src/case-account/index.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { checkAccountMalformed } from "../case-checker/fixtures.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", OPEN = "INQ-2026-0002-q", MET = "CNT-2026-0001";
const CLAIM = "the award followed the minutes";

function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  w.doc(DOC, `bytes of ${DOC}`, { units: ["The council met on 3 March 2026.", "It awarded the contract for $40,000."] });
  w.finding(Q, [{ target: DOC }], { claim: CLAIM });
  w.finding(OPEN, [{ target: DOC }], { state: "open" });
  w.passage(MET, sha(`bytes of ${DOC}`), DOC, 1);
  const MINE = w.project("Mine", "alice");
  w.scope(MINE, "own");
  const TEAM = w.project("Team", "alice");
  w.join(TEAM, "bo");
  return { w, MINE, TEAM };
}
const passage = (ref) => ({ kind: "passage", ref });
const finding = (ref) => ({ kind: "finding", ref });
const check = (w, a) => w.cacc.advocacyCheck({ author: V("alice"), viewer: V("alice"), ...a });

test("R13 (D11a; v0.2 rule 9): each sentence of a member's own text is answered in order {ord, result, codes, findings} — supported (no code, the findings it cites), not_supported (ACCOUNT_SENTENCE_UNSUPPORTED, ACCOUNT_FACT_NOT_IN_CITED) or contradicted (ACCOUNT_CONTRADICTED_BY_RECORD: a finding's adopted conclusion misstated, or a finding with none stated as determined) — judged by case-checker R24 against what it cites as the author reads it; the text and its result are appended to advocacy_checks and nothing else is written", () => {
  const { w, MINE } = setup();
  const before = w.snapshot();
  const text = [
    { text: "The council met on 3 March 2026.", cites: [passage(MET)] },
    { text: "The award followed the minutes.", cites: [finding(Q)] },
    { text: "The council met on 9 May 2025.", cites: [passage(MET)] },
    { text: "The council should be replaced.", cites: [] },
    { text: "The award never followed the minutes.", cites: [finding(Q)] },
    { text: "The inquiry established that the award was improper.", cites: [finding(OPEN)] },
  ];
  const r = check(w, { project: MINE, sentences: text });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(Object.keys(r).sort(), ["at", "ok", "project", "sentences"]);
  assert.deepEqual(r.sentences.map((x) => [x.ord, x.result, x.codes, x.findings]), [
    [1, "supported", [], []],
    [2, "supported", [], [Q]],
    [3, "not_supported", ["ACCOUNT_FACT_NOT_IN_CITED"], []],
    [4, "not_supported", ["ACCOUNT_SENTENCE_UNSUPPORTED"], []],
    [5, "contradicted", ["ACCOUNT_CONTRADICTED_BY_RECORD"], [Q]],
    [6, "contradicted", ["ACCOUNT_CONTRADICTED_BY_RECORD"], [OPEN]]]);
  assert.ok(r.sentences.every((x) => ADVOCACY_RESULTS.includes(x.result)));
  /* kept in the project, and nothing else written */
  const after = w.snapshot();
  const changed = Object.keys(after).filter((t) => after[t] !== before[t]);
  assert.deepEqual(changed, ["advocacy_checks", "sqlite_sequence"]);
  assert.deepEqual(w.rows(`SELECT project_id, author, sentences, result, at FROM advocacy_checks`), [{ project_id: MINE, author: V("alice"),
    sentences: JSON.stringify(text.map((x) => ({ text: x.text, cites: x.cites.map((c) => ({ ...c, ord: null })) }))),
    result: JSON.stringify(r.sentences), at: w.clock.ms }]);
  /* the record holds the conclusion the sentence misstates: the claim is basis-versions R23's, adopted */
  assert.equal(w.versions.noProjectConclusionOf(Q).claim.state, "adopted");
});

test("R13: refusals in order, each writing nothing — MACHINE_CANNOT_CHECK_ADVOCACY (C-153.3: author absent or a machine identity), NO_SUCH_PROJECT (membership's one answer: absent, naming nothing, not a project, or not seen in full by the viewer), ADVOCACY_NOT_OWN_PROJECT (C-153.2: scope not own, a counsel matter, or the author not joined), BAD_ACCOUNT naming the field (R5's shape, a bias_statement, no sentence); controls: the same act in the member's own project lands", () => {
  const { w, MINE, TEAM } = setup();
  const COUNSEL = w.project("Counsel", "alice");
  w.scope(COUNSEL, "counsel_matter");
  const ok = [{ text: "The council met on 3 March 2026.", cites: [passage(MET)] }];
  const row = (k) => [CASE_ACCOUNT_CHECKS[k].check, CASE_ACCOUNT_CHECKS[k].translation];
  const before = w.snapshot();
  const cases = [
    /* the machine first, before the project is even asked */
    [{ author: null, project: "PROJ-2026-9999-x", sentences: "x" }, "MACHINE_CANNOT_CHECK_ADVOCACY"],
    [{ author: "  ", project: MINE, sentences: ok }, "MACHINE_CANNOT_CHECK_ADVOCACY"],
    [{ author: "class:ai", project: MINE, sentences: ok }, "MACHINE_CANNOT_CHECK_ADVOCACY"],
    [{ author: "token:abc", project: MINE, sentences: ok }, "MACHINE_CANNOT_CHECK_ADVOCACY"],
    /* the project, before the scope or the text */
    [{ project: null, sentences: "x" }, "NO_SUCH_PROJECT"],
    [{ project: "PROJ-2026-9999-x", sentences: "x" }, "NO_SUCH_PROJECT"],
    [{ project: DOC, sentences: ok }, "NO_SUCH_PROJECT"],
    [{ project: MINE, viewer: V("bo"), sentences: ok }, "NO_SUCH_PROJECT"],
    [{ project: MINE, viewer: "nobody", sentences: ok }, "NO_SUCH_PROJECT"],
    /* the scope, before the text */
    [{ project: TEAM, sentences: "x" }, "ADVOCACY_NOT_OWN_PROJECT"],
    [{ project: COUNSEL, sentences: ok }, "ADVOCACY_NOT_OWN_PROJECT"],
    [{ project: MINE, author: V("bo"), sentences: ok }, "ADVOCACY_NOT_OWN_PROJECT"],
    /* the text */
    [{ project: MINE, sentences: "my text" }, "BAD_ACCOUNT", "sentences"],
    [{ project: MINE, sentences: [{ text: "Two\nlines.", cites: [] }] }, "BAD_ACCOUNT", "sentences[0].text"],
    [{ project: MINE, sentences: [{ text: "A.", cites: [{ kind: "rumour", ref: Q }] }] }, "BAD_ACCOUNT", "sentences[0].cites"],
    [{ project: MINE, sentences: [ok[0], { text: "We read it so.", cites: [], bias_statement: "s1" }] }, "BAD_ACCOUNT", "sentences[1].bias_statement"],
    [{ project: MINE, sentences: [] }, "BAD_ACCOUNT", "sentences"],
    [{ project: MINE, sentences: null }, "BAD_ACCOUNT", "sentences"],
  ];
  for (const [a, reason, field] of cases) {
    const r = check(w, a);
    assert.deepEqual([r.ok, r.reason], [false, reason], JSON.stringify(a).slice(0, 120));
    if (CASE_ACCOUNT_CHECKS[reason]) assert.deepEqual([r.code, r.check, r.translation], [reason, ...row(reason)]);
    if (reason === "NO_SUCH_PROJECT") assert.deepEqual(r, noSuchProject(a.project ?? null), "membership's one answer, byte for byte");
    if (field) assert.equal(r.field, field);
    if (["MACHINE_CANNOT_CHECK_ADVOCACY", "ADVOCACY_NOT_OWN_PROJECT"].includes(reason)) assert.equal(r.detail, word(`refusal.${reason}`), "R17: the key's words");
    else if (reason === "BAD_ACCOUNT") assert.equal(typeof r.detail, "string");
  }
  assert.deepEqual(w.snapshot(), before, "nothing written by any refusal");
  /* controls: each refused act, its fault mended, lands in the member's own project */
  for (const a of [{ author: V("alice") }, { author: "alice" }, { viewer: V("alice") }, { sentences: ok }]) {
    const r = check(w, { project: MINE, sentences: ok, ...a });
    assert.equal(r.ok, true, JSON.stringify(r));
  }
  /* a scope moved to own makes the same act land; moved back to none, it is refused again */
  w.scope(COUNSEL, "none");
  w.scope(COUNSEL, "own");
  assert.equal(check(w, { project: COUNSEL, sentences: ok }).ok, true);
  w.scope(COUNSEL, "none");
  assert.equal(check(w, { project: COUNSEL, sentences: ok }).reason, "ADVOCACY_NOT_OWN_PROJECT");
});

test("R13: a judgment that throws or answers anything but its departures answers every sentence undetermined, never supported, and is kept as answered; negative control: the real check answers the same text", () => {
  const { w, MINE } = setup();
  const text = [{ text: "The council met on 3 March 2026.", cites: [passage(MET)] }, { text: "The award followed the minutes.", cites: [finding(Q)] }];
  for (const checker of [{ checkAccount: () => { throw new Error("down"); } }, { checkAccount: () => checkAccountMalformed() },
                         { checkAccount: () => null }, { checkAccount: () => ({ ok: true }) }]) {
    const c = new CaseAccount({ storage: w.st, record: w.record, ...w.deps, checker });
    const r = c.advocacyCheck({ project: MINE, sentences: text, author: V("alice"), viewer: V("alice") });
    assert.deepEqual(r.sentences.map((x) => [x.result, x.codes]), [["undetermined", []], ["undetermined", []]]);
    assert.equal(JSON.parse(w.rows(`SELECT result FROM advocacy_checks ORDER BY seq DESC LIMIT 1`)[0].result)[0].result, "undetermined");
  }
  assert.deepEqual(check(w, { project: MINE, sentences: text }).sentences.map((x) => x.result), ["supported", "supported"]);
});

test("R13: advocacyChecksOf lists a project's checks newest first, each {author, at, sentences, results}, at most 200 with truncated, only to a viewer with full sight of the project; an outsider, the founder outside it, an absent viewer and an absent project each receive NO_SUCH_PROJECT, byte-identical to membership's one answer for that id; it writes nothing", () => {
  const { w, MINE } = setup();
  check(w, { project: MINE, sentences: [{ text: "First.", cites: [] }] });
  w.clock.ms = "2026-09-28T02:00:00.000Z";
  check(w, { project: MINE, sentences: [{ text: "The award followed the minutes.", cites: [finding(Q)] }] });
  const snap = w.snapshot();
  const mine = w.cacc.advocacyChecksOf({ project: MINE, viewer: V("alice") });
  assert.deepEqual(mine, { ok: true, project: MINE, truncated: false, checks: [
    { author: V("alice"), at: "2026-09-28T02:00:00.000Z", sentences: [{ text: "The award followed the minutes.", cites: [{ kind: "finding", ref: Q, ord: null }] }],
      results: [{ ord: 1, result: "supported", codes: [], findings: [Q] }] },
    { author: V("alice"), at: "2026-09-28T01:00:00.000Z", sentences: [{ text: "First.", cites: [] }],
      results: [{ ord: 1, result: "not_supported", codes: ["ACCOUNT_SENTENCE_UNSUPPORTED"], findings: [] }] }] });
  /* every other viewer, and an absent project, receive membership's one answer, byte for byte */
  for (const viewer of [V("bo"), V("cy"), "admin", null, "nobody"])
    assert.equal(JSON.stringify(w.cacc.advocacyChecksOf({ project: MINE, viewer })), JSON.stringify(noSuchProject(MINE)), String(viewer));
  const ABSENT = "PROJ-2026-9999-x";
  assert.equal(JSON.stringify(w.cacc.advocacyChecksOf({ project: ABSENT, viewer: V("alice") })), JSON.stringify(noSuchProject(ABSENT)));
  assert.equal(JSON.stringify(w.cacc.advocacyChecksOf({ viewer: V("alice") })), JSON.stringify(noSuchProject(null)));
  /* the outsider's answer and the absent project's are one answer but for the id asked */
  assert.equal(JSON.stringify(w.cacc.advocacyChecksOf({ project: MINE, viewer: V("bo") })).replaceAll(MINE, "<id>"),
               JSON.stringify(w.cacc.advocacyChecksOf({ project: ABSENT, viewer: V("alice") })).replaceAll(ABSENT, "<id>"));
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
  /* the bound: 200 listed, truncated past it; negative control: exactly 200 is not truncated */
  for (let i = w.count("advocacy_checks"); i < ADVOCACY_CHECKS_MAX; i++)
    w.st.sql.exec(`INSERT INTO advocacy_checks (project_id, author, sentences, result, at) VALUES (?, ?, '[]', '[]', ?)`, MINE, V("alice"), w.clock.ms);
  assert.deepEqual([w.cacc.advocacyChecksOf({ project: MINE, viewer: V("alice") }).checks.length,
                    w.cacc.advocacyChecksOf({ project: MINE, viewer: V("alice") }).truncated], [ADVOCACY_CHECKS_MAX, false]);
  check(w, { project: MINE, sentences: [{ text: "Last.", cites: [] }] });
  const over = w.cacc.advocacyChecksOf({ project: MINE, viewer: V("alice") });
  assert.deepEqual([over.checks.length, over.truncated, over.checks[0].sentences[0].text], [ADVOCACY_CHECKS_MAX, true, "Last."]);
});

test("R13: no mark — no answer carries a signature, digest, stamp, label or id usable outside, and no service of this module offers a check to another module (only advocacyCheck and advocacyChecksOf read or write advocacy_checks)", () => {
  const { w, MINE } = setup();
  const r = check(w, { project: MINE, sentences: [{ text: "The award followed the minutes.", cites: [finding(Q)] }] });
  const list = w.cacc.advocacyChecksOf({ project: MINE, viewer: V("alice") });
  for (const a of [r, list]) {
    const text = JSON.stringify(a);
    assert.equal(/"(signature|sig|digest|sha|sha256|stamp|label|id|seq|mark|certified)"/.test(text), false, text);
    assert.equal(/\b[0-9a-f]{40,}\b/.test(text), false, "no digest-like value");
  }
  const services = Object.getOwnPropertyNames(CaseAccount.prototype).filter((n) => /advocacy/i.test(n));
  assert.deepEqual(services.sort(), ["advocacyCheck", "advocacyChecksOf"]);
  /* negative control: the check finds a mark planted in an answer */
  assert.equal(/"(signature|sig|digest)"/.test(JSON.stringify({ ...r, signature: "x" })), true);
});

test("R13: the claim a contradicted sentence is judged against is the finding's own conclusion as basis-versions R23 answers it, read only where the author sees the finding; a finding the author cannot see gives no holding and no conclusion, so its sentence is not supported, never contradicted by what they cannot read", () => {
  const { w, MINE } = setup();
  const H = w.project("Hidden", "cy");
  const HID = "INQ-2026-0009-h";
  w.finding(HID, [{ target: DOC }], { claim: CLAIM });
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, H, HID);
  const r = check(w, { project: MINE, sentences: [{ text: "The award never followed the minutes.", cites: [finding(HID)] }] });
  assert.deepEqual([r.sentences[0].result, r.sentences[0].codes], ["not_supported", ["ACCOUNT_SENTENCE_UNSUPPORTED"]]);
  /* negative control: the same sentence on a finding the author sees is contradicted */
  const seen = check(w, { project: MINE, sentences: [{ text: "The award never followed the minutes.", cites: [finding(Q)] }] });
  assert.equal(seen.sentences[0].result, "contradicted");
});
