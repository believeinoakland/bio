/* case-account: the reviewers' comments (R7; D61; K2483), ported from case-authoring's `account.test.mjs` 303–341 and
   driven at this module's interface: `registerReviewComments`, `reviewCommentsChosen` as `publishCase` asks it, and
   `reviewCommentBodyLines`, which case-authoring's document imports. review's reader (its R33) is a stand-in the test
   registers, as review fills it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { reviewCommentBodyLines, REVIEW_COMMENTS_INCLUDED_MAX } from "../../../src/case-account/index.mjs";
import { reviewCommentsLines } from "../../../src/case-grammar/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const CASE = "CASE-2026-0001";
const ROWS = [{ comment_id: "RVC-1", draft_id: "DRAFT-1", reviewer: "bo", reviewer_kind: "member", text: "The dates hold.", at: "2026-09-27T10:00:00Z" },
              { comment_id: "RVC-2", draft_id: "DRAFT-1", reviewer: "the auditor", reviewer_kind: "recipient", text: "I object to the scope.", at: "2026-09-27T11:00:00Z" },
              { id: "RVC-3", draft_id: "DRAFT-1", reviewer: "cy", reviewer_kind: "member", text: "Fine.", at: "2026-09-27T12:00:00Z" }];
const chosen = (w, rc, draft = null) => w.cacc.reviewCommentsChosen(rc, CASE, 2, V("alice"), draft);
const answer = (carried, leftOut) => ({ ok: true, carried, left_out: leftOut,
  block: reviewCommentsLines({ comments: carried, left_out: leftOut }), body: { comments: carried, left_out: leftOut } });

test("R7 (D61; K2483): registerReviewComments takes review's one reader once — a second REVIEW_COMMENTS_DECLARED, one not a function MALFORMED, each changing nothing; negative control: the first registration is held and asked", () => {
  const w = world();
  const malformed = w.cacc.registerReviewComments("not a function");
  assert.deepEqual([malformed.ok, malformed.reason, malformed.field, typeof malformed.detail], [false, "MALFORMED", "fn", "string"]);
  assert.deepEqual(chosen(w, null), answer([], null), "MALFORMED registered nothing");
  const asked = [];
  assert.deepEqual(w.cacc.registerReviewComments((a) => { asked.push(a); return ROWS; }), { ok: true });
  const second = w.cacc.registerReviewComments(() => []);
  assert.deepEqual([second.ok, second.reason], [false, "REVIEW_COMMENTS_DECLARED"]);
  assert.equal(w.cacc.registerReviewComments(null).reason, "MALFORMED");
  chosen(w, { included: ["RVC-1"] }, "DRAFT-1");
  assert.deepEqual(asked, [{ case: CASE, edition: 2, viewer: V("alice"), draft: "DRAFT-1" }], "the first reader, asked {case, edition, viewer, draft}");
});

test("R7: reviewCommentsChosen — with no reader registered no comment travels and the count is undetermined; the chosen comments carried {reviewer, text, at} with the count left out and case-grammar R25's block; an objection not chosen does not travel; a list cut at its bound, or unread with nothing chosen, leaves the count undetermined; it writes nothing", () => {
  const w = world();
  const snap = w.snapshot();
  assert.deepEqual(chosen(w, { included: ["RVC-1"] }), answer([], null), "no reader: nothing travels");
  assert.deepEqual(chosen(w, undefined), answer([], null));
  let read = () => ROWS;
  w.cacc.registerReviewComments(() => read());
  const r = chosen(w, { included: ["RVC-3", " RVC-1 ", "RVC-1"] });
  assert.deepEqual(r, answer([{ reviewer: "bo", text: "The dates hold.", at: "2026-09-27T10:00:00Z" },
                              { reviewer: "cy", text: "Fine.", at: "2026-09-27T12:00:00Z" }], 1));
  assert.equal(JSON.stringify(r).includes("I object"), false, "an objection not chosen does not travel");
  assert.deepEqual(chosen(w, null), answer([], 3), "none chosen: every comment left out, counted");
  read = () => ({ comments: ROWS, truncated: false });
  assert.equal(chosen(w, { included: ["RVC-2"] }).left_out, 2);
  read = () => ({ comments: [ROWS[0]], truncated: true });
  assert.deepEqual(chosen(w, { included: ["RVC-1"] }), answer([{ reviewer: "bo", text: "The dates hold.", at: "2026-09-27T10:00:00Z" }], null),
                   "cut at its bound: undetermined");
  // fixtures-contract: review review-copy-read
  for (const unread of [() => { throw new Error("down"); }, () => null, () => ({ ok: false, reason: "NO_REVIEW_COPY" })]) {
    read = unread;
    assert.deepEqual(chosen(w, { included: [] }), answer([], null), "unread with nothing chosen");
    assert.deepEqual(chosen(w, null), answer([], null));
  }
  read = () => [null, "x", ROWS[0]];
  assert.equal(chosen(w, { included: ["RVC-1"] }).left_out, 0, "only comment rows counted");
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
});

test("R7: refusals, each writing nothing — BAD_REVIEW_COMMENTS (not {included}, not a list of non-blank ids, more than 500), REVIEW_COMMENTS_UNREAD (comments chosen and the reader threw or answered no list), REVIEW_COMMENT_NOT_FOUND naming each chosen id not among the case's comments; negative control: 500 ids, each found, are carried", () => {
  const w = world();
  let read = () => ROWS;
  w.cacc.registerReviewComments(() => read());
  const snap = w.snapshot();
  for (const rc of [["RVC-1"], "RVC-1", {}, { included: "RVC-1" }, { included: [""] }, { included: ["  "] }, { included: [7] },
                    { included: Array.from({ length: REVIEW_COMMENTS_INCLUDED_MAX + 1 }, (_, i) => `RVC-${i}`) }]) {
    const r = chosen(w, rc);
    assert.deepEqual([r.ok, r.reason, r.field], [false, "BAD_REVIEW_COMMENTS", "reviewComments"], JSON.stringify(rc).slice(0, 60));
    assert.equal(r.detail, word("refusal.BAD_REVIEW_COMMENTS", { max: String(REVIEW_COMMENTS_INCLUDED_MAX) }), "R17: the key's words, the bound filled");
  }
  const nf = chosen(w, { included: ["RVC-9", "RVC-1", "RVC-8"] });
  assert.deepEqual([nf.ok, nf.reason, nf.comments, nf.caseId, nf.edition], [false, "REVIEW_COMMENT_NOT_FOUND", ["RVC-9", "RVC-8"], CASE, 2]);
  assert.equal(nf.detail, word("refusal.REVIEW_COMMENT_NOT_FOUND"), "R17: the key's words, no comment id shown");
  for (const unread of [() => { throw new Error("down"); }, () => null, () => ({ comments: "none" })]) {
    read = unread;
    const u = chosen(w, { included: ["RVC-1"] });
    assert.deepEqual([u.ok, u.reason, u.caseId, u.edition], [false, "REVIEW_COMMENTS_UNREAD", CASE, 2]);
    assert.equal(u.detail, word("refusal.REVIEW_COMMENTS_UNREAD"), "R17: the key's words");
  }
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  /* negative control: at the bound, each found */
  const many = Array.from({ length: REVIEW_COMMENTS_INCLUDED_MAX }, (_, i) => ({ comment_id: `RVC-${i}`, reviewer: "bo", text: `c${i}`, at: "t" }));
  read = () => many;
  const ok = chosen(w, { included: many.map((c) => c.comment_id) });
  assert.deepEqual([ok.ok, ok.carried.length, ok.left_out], [true, REVIEW_COMMENTS_INCLUDED_MAX, 0]);
});

test("R7: reviewCommentBodyLines answers the body section a reader reads — each carried comment with its reviewer and when, then how many were left out and that a reviewer left out may file a response in the case's docket, or that the count is undetermined; none when given is null", () => {
  assert.deepEqual(reviewCommentBodyLines(null), []);
  assert.deepEqual(reviewCommentBodyLines(undefined), []);
  assert.deepEqual(reviewCommentBodyLines({ comments: [{ reviewer: "bo", text: "The dates\nhold.", at: "2026-09-27T10:00:00Z" },
                                                       { reviewer: null, text: "Fine.", at: null }], left_out: 1 }), [
    "## What Reviewers Said", "",
    word("case-account.document.publisher_chose_carry"), "",
    "- bo, on 2026-09-27T10:00:00Z: The dates hold.", `- ${word("case-account.document.reviewer.unknown")}, on ${word("case-account.document.date.unknown")}: Fine.`, "",
    word("case-account.document.left_out.one"), ""]);
  assert.deepEqual(reviewCommentBodyLines({ comments: [], left_out: 3 }), ["## What Reviewers Said", "",
    word("case-account.document.publisher_carried_comment"), "",
    word("case-account.document.left_out.other", { n: "3" }), ""]);
  assert.deepEqual(reviewCommentBodyLines({ comments: [], left_out: null }).at(-2),
                   word("case-account.document.how_many_comments"));
  /* what reviewCommentsChosen answers as `body` is what it reads */
  const w = world();
  w.cacc.registerReviewComments(() => ROWS);
  assert.ok(reviewCommentBodyLines(chosen(w, { included: ["RVC-1"] }).body).join("\n").includes(
    `- bo, on 2026-09-27T10:00:00Z: The dates hold.\n\n${word("case-account.document.left_out.other", { n: "2" })}`));
});
