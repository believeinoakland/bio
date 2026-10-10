/* case-grammar at its interface, T41 (N820; `draft-T41-investigation.md` §3.6; D56, D58–D61, D63; K2418): R23's
   `account:` block, R24's `bias_applications:`, R25's `review_comments:` with the count left out, R26's approval rule and
   `approvals:`; R13's case file carrying them inside the case document (no new kind); R14's complete edition printing
   the account after the claims (each bias-framed sentence marked, its statement named), the included review comments
   and the approvals. Each clause with its negative controls (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc, sha, NOW } from "./helpers.mjs";
import { caseFileFixture, editionInput, manifestFor, ACCOUNT, BIAS_APPLICATIONS, REVIEW_COMMENTS, APPROVALS, A, C,
         MINUTES } from "./casefile-fixture.mjs";

const fmOf = (text) => parseFrontmatter(text).data;
const clean = (text) => assert.deepEqual(parseFrontmatter(text).findings, [], "the grammar reads every line");
const V7 = CG.CASE_DOCUMENT_FORMAT;
const OLDER = ["bio-case-document/5", "bio-case-document/4", "bio-case-document/1", null];
const HARD = "It's \"final\" \\ here # not a comment,\nnext line: ünïcödé — [a, b] {c: d}";
const ODD = [undefined, null, 7, "x", [], {}, [null, 7, "x"], { get rows() { throw new Error("boom"); } }];
const throwing = { format: V7, get account() { throw new Error("boom"); }, get bias_applications() { throw new Error("boom"); },
                   get review_comments() { throw new Error("boom"); }, get approvals() { throw new Error("boom"); } };

/* ===== R23 ===== */

test("R23 the account: block round-trips exactly: one flat row per sentence {ord, text, cites, kind, bias_statement, began_as, draft}, read back in ord order", () => {
  assert.deepEqual([...CG.ACCOUNT_FIELDS], ["ord", "text", "cites", "kind", "bias_statement", "began_as", "draft"]);
  assert.deepEqual([...CG.ACCOUNT_KINDS], ["account", "statement", "subject_justification", "excluded", "what_changed"]);
  assert.deepEqual([...CG.ACCOUNT_ORIGINS], ["member", "machine_draft"]);
  assert.deepEqual([...CG.ACCOUNT_CITE_KINDS], ["finding", "leg", "passage", "material"]);
  const rows = [
    { ord: 2, text: HARD, kind: "account", bias_statement: "BIAS-2026-0001-p#s1", began_as: "machine_draft", draft: "DRAFT-7",
      cites: [{ kind: "material", ref: MINUTES }] },
    { ord: 1, text: "The board voted.", kind: "account", began_as: "member",
      cites: [{ kind: "finding", ref: A }, { kind: "leg", ref: A, ord: 2 }, { kind: "passage", ref: sha("p") }] },
    { ord: 3, text: "What changed: the 2019 minutes.", kind: "what_changed", began_as: "member", cites: [] },
  ];
  const lines = CG.accountLines(rows);
  assert.equal(lines[0], "account:");
  const text = doc(V7, lines);
  clean(text);
  const fm = fmOf(text);
  for (const r of fm.account) assert.deepEqual(Object.keys(r), [...CG.ACCOUNT_FIELDS], "one flat row");
  const back = CG.accountOf(fm);
  assert.deepEqual(back, [
    { ord: 1, text: "The board voted.", kind: "account", bias_statement: null, began_as: "member", draft: null,
      cites: [{ kind: "finding", ref: A, ord: null }, { kind: "leg", ref: A, ord: 2 }, { kind: "passage", ref: sha("p"), ord: null }] },
    { ord: 2, text: HARD, kind: "account", bias_statement: "BIAS-2026-0001-p#s1", began_as: "machine_draft", draft: "DRAFT-7",
      cites: [{ kind: "material", ref: MINUTES, ord: null }] },
    { ord: 3, text: "What changed: the 2019 minutes.", kind: "what_changed", bias_statement: null, began_as: "member", draft: null, cites: [] },
  ]);
  assert.equal(back[1].text, HARD, "the words read back byte for byte, for the offline re-check");
  /* /6 reads it too; rows with the same ord keep their written order */
  assert.deepEqual(CG.accountOf(fmOf(doc("bio-case-document/6", lines))), back);
  const tied = CG.accountOf(fmOf(doc(V7, CG.accountLines([{ ord: 1, text: "b" }, { ord: 1, text: "a" }, { text: "c" }]))));
  assert.deepEqual(tied.map((r) => r.text), ["b", "a", "c"], "no ord reads last");
});

test("R23 the writer states only its words: a kind, origin or cite outside them is written null, a draft only for a machine draft, a bias statement only when named", () => {
  const back = CG.accountOf(fmOf(doc(V7, CG.accountLines([
    { ord: 1, text: "x", kind: "story", began_as: "ghostwriter", draft: "D", bias_statement: "",
      cites: [{ kind: "rumour", ref: "R" }, { kind: "finding", ref: 7 }, { kind: "finding", ref: A, ord: 4 }, "loose", null] },
    { ord: -1, text: 7, kind: "account", began_as: "member", draft: "D", cites: "A" }]))));
  assert.deepEqual(back, [
    { ord: 1, text: "x", kind: null, bias_statement: null, began_as: null, draft: null,
      cites: [{ kind: null, ref: "R", ord: null }, { kind: "finding", ref: null, ord: null }, { kind: "finding", ref: A, ord: null },
              { kind: null, ref: null, ord: null }, { kind: null, ref: null, ord: null }] },
    { ord: null, text: null, cites: [], kind: "account", bias_statement: null, began_as: "member", draft: null }]);
});

test("R23 negative controls: a document without the block, or of a format before /6, answers null; an empty block answers []; odd input never throws", () => {
  assert.equal(CG.accountOf(fmOf(doc(V7))), null, "no block");
  for (const f of OLDER) assert.equal(CG.accountOf(fmOf(doc(f, CG.accountLines(ACCOUNT)))), null, String(f));
  assert.deepEqual(CG.accountLines([]), ["account: []"]);
  assert.deepEqual(CG.accountOf(fmOf(doc(V7, ["account: []"]))), []);
  for (const odd of ODD) {
    assert.doesNotThrow(() => CG.accountLines(odd));
    assert.doesNotThrow(() => CG.accountSectionLines(odd));
    assert.doesNotThrow(() => CG.accountOf(odd));
  }
  assert.deepEqual(CG.accountLines(null), ["account: []"]);
  assert.equal(CG.accountOf(throwing), null);
  assert.deepEqual(CG.accountLines([{ ord: 1, get text() { throw new Error("boom"); } }, { ord: 2, text: "kept" }]).filter((l) => l.includes("text")),
                   ["    text: '\"kept\"'"], "a row that cannot be read is left out, the rest written");
});

test("R23 the body prints the account under its head, in ord order, each bias-framed sentence marked in the text with its statement; the four statements' rows are not printed there", () => {
  assert.equal(CG.ACCOUNT_HEAD, "## The Account");
  assert.equal(CG.accountBiasMark("s1"), "[framing that follows the declared bias statement s1]");
  assert.deepEqual(CG.accountSectionLines(ACCOUNT), ["## The Account", "",
    "The minutes say: \"No vote was taken on item 7 <the lease>.\" It's on page 3 # here.",
    "The vendor's filing, which this group checks twice, names no vote. [framing that follows the declared bias statement s1]", ""]);
  /* negative controls: a sentence not bias-marked carries no mark; no account sentence states so */
  assert.equal(CG.accountSectionLines(ACCOUNT)[2].includes("framing"), false);
  assert.deepEqual(CG.accountSectionLines(ACCOUNT.filter((r) => r.kind !== "account")), ["## The Account", "", "This case states no account.", ""]);
  assert.deepEqual(CG.accountSectionLines([{ ord: 1, kind: "account", text: "one\nline" }]).slice(2, 3), ["one line"]);
});

/* ===== R24 ===== */

test("R24 the bias_applications: block round-trips: one flat row per application {finding, ord, target, statement, effect, from, to}, in the document's order", () => {
  assert.deepEqual([...CG.BIAS_APPLICATION_FIELDS], ["finding", "ord", "target", "statement", "effect", "from", "to"]);
  assert.deepEqual([...CG.BIAS_APPLICATION_TARGETS], ["leg", "conclusion"]);
  assert.deepEqual([...CG.BIAS_APPLICATION_EFFECTS], ["grade_lowered", "leg_excluded", "inference_refused", "scrutiny_raised"]);
  const rows = [...BIAS_APPLICATIONS, { finding: C, ord: 2, target: "leg", statement: "BIAS-2026-0001-p#s1", effect: "leg_excluded" },
                { finding: C, target: "conclusion", statement: "s2", effect: "inference_refused" }];
  const text = doc(V7, CG.biasApplicationsLines(rows));
  clean(text);
  for (const r of fmOf(text).bias_applications) assert.deepEqual(Object.keys(r), [...CG.BIAS_APPLICATION_FIELDS]);
  assert.deepEqual(CG.biasApplicationsOf(fmOf(text)), [
    { finding: A, ord: 1, target: "leg", statement: "s1", effect: "grade_lowered", from: "A", to: "B" },
    { finding: A, ord: null, target: "conclusion", statement: "s1", effect: "scrutiny_raised", from: null, to: null },
    { finding: C, ord: 2, target: "leg", statement: "BIAS-2026-0001-p#s1", effect: "leg_excluded", from: null, to: null },
    { finding: C, ord: null, target: "conclusion", statement: "s2", effect: "inference_refused", from: null, to: null }]);
});

test("R24 negative controls: an effect, target or grade outside its words is null; from and to only for a lowered grade; ord only at a leg; absent or older answers null; never throws", () => {
  const back = CG.biasApplicationsOf(fmOf(doc(V7, CG.biasApplicationsLines([
    { finding: A, ord: 3, target: "conclusion", statement: "s1", effect: "grade_lowered", from: "A", to: "E" },
    { finding: A, ord: 1, target: "leg", statement: "s1", effect: "leg_excluded", from: "A", to: "B" },
    { finding: "", target: "case", statement: 7, effect: "grade_raised" }]))));
  assert.deepEqual(back, [
    { finding: A, ord: null, target: "conclusion", statement: "s1", effect: "grade_lowered", from: "A", to: null },
    { finding: A, ord: 1, target: "leg", statement: "s1", effect: "leg_excluded", from: null, to: null },
    { finding: null, ord: null, target: null, statement: null, effect: null, from: null, to: null }]);
  assert.equal(CG.biasApplicationsOf(fmOf(doc(V7))), null);
  for (const f of OLDER) assert.equal(CG.biasApplicationsOf(fmOf(doc(f, CG.biasApplicationsLines(BIAS_APPLICATIONS)))), null, String(f));
  assert.deepEqual(CG.biasApplicationsLines([]), ["bias_applications: []"]);
  assert.deepEqual(CG.biasApplicationsOf(fmOf(doc(V7, ["bias_applications: []"]))), []);
  for (const odd of ODD) { assert.doesNotThrow(() => CG.biasApplicationsLines(odd)); assert.doesNotThrow(() => CG.biasApplicationsOf(odd)); }
  assert.equal(CG.biasApplicationsOf(throwing), null);
});

/* ===== R25 ===== */

test("R25 the review_comments: block round-trips the comments the publisher included, each {reviewer, text, at}, and review_comments_left_out states the count left out", () => {
  assert.deepEqual([...CG.REVIEW_COMMENT_FIELDS], ["reviewer", "text", "at"]);
  assert.equal(CG.REVIEW_COMMENTS_LEFT_OUT_KEY, "review_comments_left_out");
  const given = { comments: [{ reviewer: "heron", text: HARD, at: NOW }, { reviewer: "olive", text: "Fine.", at: NOW }], left_out: 3 };
  const lines = CG.reviewCommentsLines(given);
  assert.equal(lines.at(-1), "review_comments_left_out: 3");
  const text = doc(V7, lines);
  clean(text);
  assert.deepEqual(CG.reviewCommentsOf(fmOf(text)), given);
  /* the count is always stated: none left out is 0, never silence */
  const none = CG.reviewCommentsLines({ comments: [] , left_out: 0 });
  assert.deepEqual(none, ["review_comments: []", "review_comments_left_out: 0"]);
  assert.deepEqual(CG.reviewCommentsOf(fmOf(doc(V7, none))), { comments: [], left_out: 0 });
});

test("R25 negative controls: a count that is not a whole number is stated null, undetermined; a document carrying neither key, or older, answers null; never throws", () => {
  for (const bad of [undefined, null, -1, 1.5, "2"])
    assert.equal(CG.reviewCommentsLines({ comments: [], left_out: bad }).at(-1), "review_comments_left_out: null", String(bad));
  assert.deepEqual(CG.reviewCommentsOf(fmOf(doc(V7, ["review_comments_left_out: 4"]))), { comments: [], left_out: 4 }, "the count alone");
  assert.deepEqual(CG.reviewCommentsOf(fmOf(doc(V7, ['review_comments_left_out: \'"4"\'']))), { comments: [], left_out: null });
  assert.equal(CG.reviewCommentsOf(fmOf(doc(V7))), null);
  for (const f of OLDER) assert.equal(CG.reviewCommentsOf(fmOf(doc(f, CG.reviewCommentsLines(REVIEW_COMMENTS)))), null, String(f));
  assert.deepEqual(CG.reviewCommentsOf(fmOf(doc(V7, CG.reviewCommentsLines({ comments: [{ reviewer: 7, text: null }], left_out: 1 })))),
                   { comments: [{ reviewer: null, text: null, at: null }], left_out: 1 });
  for (const odd of ODD) { assert.doesNotThrow(() => CG.reviewCommentsLines(odd)); assert.doesNotThrow(() => CG.reviewCommentsOf(odd)); }
  assert.equal(CG.reviewCommentsOf(throwing), null);
});

/* ===== R26 ===== */

test("R26 the approval rule in force at signing and each approval {by, at} round-trip; with no rule in force (the default) the rule is stated null", () => {
  assert.equal(CG.APPROVAL_RULE_KEY, "approval_rule");
  assert.deepEqual([...CG.APPROVAL_RULE_FIELDS], ["approvers", "set_by", "set_at"]);
  assert.deepEqual([...CG.APPROVAL_FIELDS], ["by", "at"]);
  const text = doc(V7, CG.approvalsLines(APPROVALS));
  clean(text);
  for (const r of fmOf(text).approvals) assert.deepEqual(Object.keys(r), [...CG.APPROVAL_FIELDS]);
  assert.deepEqual(CG.approvalsOf(fmOf(text)), APPROVALS);
  const off = CG.approvalsLines({ rule: null, approvals: [] });
  assert.deepEqual(off, ["approval_rule: null", "approvals: []"]);
  assert.deepEqual(CG.approvalsOf(fmOf(doc(V7, off))), { rule: null, approvals: [] });
});

test("R26 negative controls: a rule that is not an object is null; approvers that are not names are dropped; a document carrying neither key, or older, answers null; never throws", () => {
  for (const bad of [undefined, "heron", ["heron"], 7]) assert.equal(CG.approvalsLines({ rule: bad })[0], "approval_rule: null", String(bad));
  assert.deepEqual(CG.approvalsOf(fmOf(doc(V7, CG.approvalsLines({ rule: { approvers: ["heron", 7, ""] }, approvals: [{ by: 7 }] })))),
                   { rule: { approvers: ["heron"], set_by: null, set_at: null }, approvals: [{ by: null, at: null }] });
  assert.equal(CG.approvalsOf(fmOf(doc(V7))), null);
  for (const f of OLDER) assert.equal(CG.approvalsOf(fmOf(doc(f, CG.approvalsLines(APPROVALS)))), null, String(f));
  for (const odd of ODD) { assert.doesNotThrow(() => CG.approvalsLines(odd)); assert.doesNotThrow(() => CG.approvalsOf(odd)); }
  assert.equal(CG.approvalsOf(throwing), null);
});

/* ===== R13 ===== */

test("R13 (T41) the case file carries R23–R26's blocks inside the case document: no new file kind, the manifest meets the rule, and each block reads back from case.md", () => {
  const before = caseFileFixture({ fileFormat: CG.CASE_FILE_FORMAT });
  const { manifest, files } = caseFileFixture({ t41: true, fileFormat: CG.CASE_FILE_FORMAT });
  assert.deepEqual(CG.caseFileManifestCheck(manifest, { materials: CG.materialsOf(fmOf(files.get("case.md"))).materials }), []);
  assert.deepEqual(manifest.files.map((f) => [f.path, f.kind]), before.manifest.files.map((f) => [f.path, f.kind]), "the same files, the same kinds");
  assert.equal(CG.CASE_FILE_KINDS.some((k) => /account|bias|review|approval/.test(k)), false);
  const text = files.get(CG.caseFilePath("case_document"));
  clean(text);
  const fm = fmOf(text);
  assert.deepEqual(CG.accountOf(fm).map((r) => r.ord), [1, 2, 3]);
  assert.equal(CG.biasApplicationsOf(fm).length, 2);
  assert.deepEqual(CG.reviewCommentsOf(fm), REVIEW_COMMENTS);
  assert.deepEqual(CG.approvalsOf(fm), APPROVALS);
  /* negative control: a manifest naming a file kind for them departs */
  const extra = { path: "materials/ACCOUNT/account", sha256: sha("x"), bytes: 1, part: 1, kind: "account" };
  const rules = CG.caseFileManifestCheck(manifestFor([...manifest.files, extra], { format: CG.CASE_FILE_FORMAT })).map((d) => d.rule);
  assert.equal(rules.includes("kind"), true);
  assert.equal(rules.includes("path"), true);
});

/* ===== R14 ===== */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const heads = (html) => [...html.matchAll(/<h2>(\d+)\. ([^<]+)<\/h2>/g)].map((m) => [Number(m[1]), m[2]]);
const section = (html, name) => { const at = html.indexOf(`. ${name}</h2>`); return html.slice(at, html.indexOf("<h2>", at + 1)); };

test("R14 (T41) the complete edition prints the account right after the claims, each bias-framed sentence marked and its statement named, and the included review comments and the approvals before how to check it", () => {
  assert.deepEqual([CG.ACCOUNT_HEADING, CG.REVIEW_COMMENTS_HEADING, CG.APPROVALS_HEADING], ["The account", "What reviewers said", "Approvals"]);
  const { manifest, files } = caseFileFixture({ t41: true, fileFormat: CG.CASE_FILE_FORMAT });
  const html = CG.completeEditionOf(editionInput(manifest, files));
  assert.equal(files.get("complete-edition.html"), html);
  assert.deepEqual(heads(html).map(([, h]) => h), ["The claims", "The account", "The findings", "The documents and observations",
    "What was searched", "The declared bias", "Disclosed contradictions", "Strength", "How grades are worked out",
    "What reviewers said", "Approvals", "How to check this case yourself"]);
  assert.deepEqual(heads(html).map(([n]) => n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "numbered as rendered");
  /* the account: the sentences in ord order, the bias-framed one marked, its statement named with what the lens prints */
  const acc = section(html, CG.ACCOUNT_HEADING);
  const first = esc(ACCOUNT[1].text);
  const framed = esc(`${ACCOUNT[0].text} ${CG.accountBiasMark("s1")} (${CG.LENS_KIND_WORDS.scrutiny}, on ENT-2026-0001: Vendor filings need a second source)`);
  assert.equal(acc.includes(`<p>${first}</p>`), true, "an unframed sentence carries no mark");
  assert.equal(acc.includes(`<p>${framed}</p>`), true, "the framed sentence, marked, its statement named");
  assert.equal(acc.indexOf(first) < acc.indexOf(esc(ACCOUNT[0].text)), true, "in ord order");
  assert.equal(acc.includes(esc(ACCOUNT[2].text)), false, "a statement's row is the check's, not printed as the account");
  /* the review comments, the count left out, the approvals */
  const rc = section(html, CG.REVIEW_COMMENTS_HEADING);
  assert.equal(rc.includes(`<li>${esc(`heron, on ${NOW}: Check the 2019 minutes too.`)}</li>`), true);
  assert.equal(rc.includes(esc("2 reviewer's comments were left out by the publisher.")), true);
  const ap = section(html, CG.APPROVALS_HEADING);
  assert.equal(ap.includes(esc(`The group's rule in force at signing required approval by: heron, olive (set by olive on ${NOW}).`)), true);
  for (const by of ["heron", "olive"]) assert.equal(ap.includes(`<li>${esc(`Approved by ${by} on ${NOW}.`)}</li>`), true);
  assert.equal(CG.completeEditionOf(editionInput(manifest, files)), html, "the same case file gives the same bytes");
  const input = editionInput(manifest, files);
  assert.equal(CG.completeEditionOf({ ...input, files: [...input.files].reverse() }), html);
});

const GOLDEN = JSON.parse(readFileSync(new URL("./complete-v7-pre-t37-golden.json", import.meta.url), "utf8"));

test("R14 (T41) negative controls: an edition whose document carries none of the blocks renders the bytes it rendered before T41; each section is added only with its block; a bias statement the lens does not print is still marked, never filled", () => {
  for (const [name, opts] of [["v7", {}], ["v7_t33", { t33: true }]]) {
    const { manifest, files } = caseFileFixture(opts);
    assert.equal(CG.completeEditionOf(editionInput(manifest, files)), GOLDEN[name].html, name);
  }
  const base = caseFileFixture({ fileFormat: CG.CASE_FILE_FORMAT });
  const withLines = (lines) => { const m = new Map(base.files); m.set("case.md", base.files.get("case.md").replace("\nsearched:", `\n${lines.join("\n")}\nsearched:`)); return CG.completeEditionOf(editionInput(base.manifest, m)); };
  const only = (lines) => heads(withLines(lines)).map(([, h]) => h).filter((h) => [CG.ACCOUNT_HEADING, CG.REVIEW_COMMENTS_HEADING, CG.APPROVALS_HEADING].includes(h));
  assert.deepEqual(only(CG.accountLines(ACCOUNT)), [CG.ACCOUNT_HEADING]);
  assert.deepEqual(only(CG.reviewCommentsLines(REVIEW_COMMENTS)), [CG.REVIEW_COMMENTS_HEADING]);
  assert.deepEqual(only(CG.approvalsLines(APPROVALS)), [CG.APPROVALS_HEADING]);
  assert.deepEqual(only(CG.biasApplicationsLines(BIAS_APPLICATIONS)), [], "bias applications add no section");
  /* empty blocks state that they hold nothing */
  const empty = withLines([...CG.accountLines([]), ...CG.reviewCommentsLines({ comments: [], left_out: 0 }), ...CG.approvalsLines({})]);
  for (const s of ["This case states no account.", "The publisher included no reviewer's comment.", "0 reviewer's comments were left out by the publisher.",
                   "No approval rule was in force when this case was signed.", "No approval is recorded."])
    assert.equal(empty.includes(esc(s)), true, s);
  assert.equal(withLines(CG.reviewCommentsLines({ comments: [], left_out: 1 })).includes(esc("1 reviewer's comment was left out by the publisher.")), true);
  assert.equal(withLines(["review_comments: []"]).includes(esc("How many reviewers' comments were left out is not stated.")), true);
  /* a statement not printed in the lens: marked by its id, nothing of it guessed */
  const unknown = section(withLines(CG.accountLines([{ ord: 1, kind: "account", text: "Framed.", bias_statement: "s9", began_as: "member" }])), CG.ACCOUNT_HEADING);
  assert.equal(unknown.includes(`<p>${esc(`Framed. ${CG.accountBiasMark("s9")}`)}</p>`), true);
  /* an older format carrying the blocks is not read: no section */
  const v5 = CG.completeEditionOf({ files: [{ path: "case.md", content: `---\nformat: bio-case-document/5\ncase_id: X\n${CG.accountLines(ACCOUNT).join("\n")}\n---\n` }] });
  assert.equal(v5.includes(CG.ACCOUNT_HEADING), false);
  /* the words are escaped, and no place is named */
  const html = withLines(CG.accountLines([{ ord: 1, kind: "account", text: "<script>x</script> & y", began_as: "member" }]));
  assert.equal(/<script/.test(html), false);
});

test("R26 (K2528) approvalSubjectSha: the SHA-256 of the case document with its R26 block removed, the same before the block is written and after", () => {
  const without = caseFileFixture({}).files.get("case.md");
  const withBlock = without.replace("\nsearched:", `\n${CG.approvalsLines(APPROVALS).join("\n")}\nsearched:`);
  assert.notEqual(withBlock, without);
  assert.equal(CG.approvalSubjectSha(without), sha(without), "a document with no R26 block: its own digest");
  assert.equal(CG.approvalSubjectSha(withBlock), sha(without), "the block written: the digest the approver saw");
  /* other approvals, or the rule off, remove alike */
  for (const given of [{ rule: null, approvals: [] }, { rule: APPROVALS.rule, approvals: [{ by: "olive", at: NOW }] }])
    assert.equal(CG.approvalSubjectSha(without.replace("\nsearched:", `\n${CG.approvalsLines(given).join("\n")}\nsearched:`)), sha(without));
  /* the fixture's whole T41 document: R23–R25's blocks stay in what is approved */
  const t41 = caseFileFixture({ t41: true }).files.get("case.md");
  assert.equal(CG.approvalSubjectSha(t41), sha(t41.replace(`${CG.approvalsLines(APPROVALS).join("\n")}\n`, "")));
  assert.notEqual(CG.approvalSubjectSha(t41), sha(without));
});

test("R26 (K2528) negative controls: any other change to the document changes the digest; a body line spelled like the block is kept; odd input answers null and never throws", () => {
  const base = caseFileFixture({ t41: true }).files.get("case.md");
  const d = CG.approvalSubjectSha(base);
  for (const [what, changed] of [["a byte of the account", base.replace("names no vote.", "names no vote!")],
                                 ["the scope", base.replace("Who approved the lease, and on what record.\"", "Who approved it.\"")],
                                 ["the count left out", base.replace("review_comments_left_out: 2", "review_comments_left_out: 1")],
                                 ["the body", `${base}more`], ["a blank line", base.replace("\n---\n", "\n\n---\n")]]) {
    assert.notEqual(changed, base, what);
    assert.notEqual(CG.approvalSubjectSha(changed), d, what);
  }
  /* only the front matter's block is removed: the same spelling in the body is the document's own words */
  const body = `${base}\napprovals:\n  - by: x\n`;
  assert.equal(CG.approvalSubjectSha(body), sha(body.replace(`${CG.approvalsLines(APPROVALS).join("\n")}\n`, "")));
  assert.notEqual(CG.approvalSubjectSha(body), d);
  for (const odd of [null, undefined, 7, {}, ["x"]]) assert.equal(CG.approvalSubjectSha(odd), null);
  assert.equal(CG.approvalSubjectSha(""), sha(""));
  assert.equal(CG.approvalSubjectSha("approvals: []\nno front matter"), sha("approvals: []\nno front matter"), "no front matter: nothing removed");
});

test("R25 (K2533) review_comments_left_out null, a count that could not be determined, is written null and read null, and the edition says it is not stated; a count stays a count", () => {
  const lines = CG.reviewCommentsLines({ comments: REVIEW_COMMENTS.comments, left_out: null });
  assert.equal(lines.at(-1), "review_comments_left_out: null");
  const text = doc(V7, lines);
  clean(text);
  assert.deepEqual(CG.reviewCommentsOf(fmOf(text)), { comments: REVIEW_COMMENTS.comments, left_out: null });
  assert.deepEqual(CG.reviewCommentsOf(fmOf(doc(V7, ["review_comments: []", "review_comments_left_out: null"]))), { comments: [], left_out: null },
                   "the null alone still states the block");
  const base = caseFileFixture({ fileFormat: CG.CASE_FILE_FORMAT });
  const m = new Map(base.files);
  m.set("case.md", base.files.get("case.md").replace("\nsearched:", `\n${lines.join("\n")}\nsearched:`));
  const rc = section(CG.completeEditionOf(editionInput(base.manifest, m)), CG.REVIEW_COMMENTS_HEADING);
  assert.equal(rc.includes(esc("How many reviewers' comments were left out is not stated.")), true);
  /* negative control: a determined count, 0 included, is never read or rendered as undetermined */
  for (const n of [0, 2]) {
    assert.equal(CG.reviewCommentsOf(fmOf(doc(V7, CG.reviewCommentsLines({ comments: [], left_out: n })))).left_out, n);
    const m2 = new Map(base.files);
    m2.set("case.md", base.files.get("case.md").replace("\nsearched:", `\n${CG.reviewCommentsLines({ comments: [], left_out: n }).join("\n")}\nsearched:`));
    assert.equal(section(CG.completeEditionOf(editionInput(base.manifest, m2)), CG.REVIEW_COMMENTS_HEADING).includes("not stated"), false, String(n));
  }
});
