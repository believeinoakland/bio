/* review R42 (T51 fix round; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the
   door runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without each required
   one is refused naming it, and a field outside accepts is dropped. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, REVIEW_DRAFT_FIELDS, noReviewCopy, reviewOps } from "../../../src/review/index.mjs";
import { standard, P, V, SECRET } from "./fixture.mjs";

/* a refusal names a field by its own code: the details of the refusals that fence an act (C-87.3) say "draft" and "grant"
   of anything, so the default whole-word reading would find them everywhere */
const NAMES = {
  casedraft: { project: ["REVIEW_NO_PROJECT"], draft: ["REVIEW_NO_PROJECT"] },
  reviewgrant: { draft: ["REVIEW_NOT_PROJECT_OWNER"], recipient: ["REVIEW_NO_RECIPIENT"] },
  reviewrevoke: { grant: ["REVIEW_NO_GRANT"] },
  reviewcomment: { text: ["REVIEW_NO_COMMENT_TEXT"] },
};
const namesBy = (op) => (answer, field) => answer?.ok === false && (NAMES[op][field] ?? []).includes(answer.code);
/* two answers agree when they are the same verdict: the same success, or the same refusal code */
const sameVerdict = (x, y) => x?.ok === y?.ok && (x.code ?? null) === (y.code ?? null);
const asAnn = (w, query = "") => (op, body) => reviewOps(w.r, new URL(`http://x/?author=ann&viewer=${encodeURIComponent(V("ann"))}${query}`), body)[op]();

test("R42: DECLARED_OPS names the four ops a screen sends, each with the rows op-declarations and op-grades hold", () => {
  assert.deepEqual(Object.keys(DECLARED_OPS).sort(), ["casedraft", "reviewcomment", "reviewgrant", "reviewrevoke"]);
  assert.deepEqual(DECLARED_OPS.casedraft.fields.accepts, ["draft", "project", ...REVIEW_DRAFT_FIELDS], "the fields a draft keeps, never a second list");
  for (const [op, row] of Object.entries(DECLARED_OPS)) {
    assert.equal(row.mutating, true, op);
    assert.equal(Object.isFrozen(row.fields.accepts) && Object.isFrozen(row.fields.requires), true, op);
    for (const stamp of ["author", "viewer", "bySecret", "secretSha"]) assert.ok(!row.fields.accepts.includes(stamp), `${op}: ${stamp} is the control plane's`);
  }
});

test("R42: casedraft declares its fields: a project (or a draft) alone raises no refusal naming a declared field, a call with neither is refused naming it, and a field outside accepts is dropped", async () => {
  const w = standard();
  const run = asAnn(w);
  await declaredOpHolds({ op: "casedraft", declaration: DECLARED_OPS.casedraft, call: (f) => run("casedraft", f),
    values: { project: P }, refusedNaming: namesBy("casedraft"), same: sameVerdict });
  /* the alternative stands on its own: an edit names the draft and no project */
  const made = run("casedraft", { project: P, statement: "S" });
  assert.equal(run("casedraft", { draft: made.draftId, scope: "x" }).ok, true);
  /* control: a field outside accepts reaches no stored argument */
  run("casedraft", { project: P, undeclared_field_casedraft: "x" });
  const params = w.rows(`SELECT params FROM case_drafts`).map((r) => Object.keys(JSON.parse(r.params)));
  assert.ok(params.every((ks) => ks.every((k) => REVIEW_DRAFT_FIELDS.includes(k))));
});

test("R42: reviewgrant declares its fields: draft and recipient alone raise no refusal naming one, a call without either is refused naming it, and a field outside accepts is dropped", async () => {
  const w = standard();
  const d = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  const run = asAnn(w);
  let n = 0;
  /* the control plane sets the fingerprint in the body as the door does; a screen never sends it */
  await declaredOpHolds({ op: "reviewgrant", declaration: DECLARED_OPS.reviewgrant, call: (f) => run("reviewgrant", { ...f, secretSha: SECRET(++n) }),
    values: { draft: d.draftId, recipient: "R" }, refusedNaming: namesBy("reviewgrant"), same: sameVerdict });
  /* control: until is accepted and answered */
  const g = run("reviewgrant", { draft: d.draftId, recipient: "R", until: "2099-01-01T00:00:00Z", secretSha: SECRET(++n) });
  assert.equal(g.until, "2099-01-01T00:00:00Z");
});

test("R42: reviewrevoke declares its fields: a grant alone raises no refusal naming it, a call without it is refused naming it, and a field outside accepts is dropped", async () => {
  const w = standard();
  const d = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  const g = w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R", secretSha: SECRET(1) });
  await declaredOpHolds({ op: "reviewrevoke", declaration: DECLARED_OPS.reviewrevoke, call: (f) => asAnn(w)("reviewrevoke", f),
    values: { grant: g.grantId }, refusedNaming: namesBy("reviewrevoke"), same: sameVerdict });
});

test("R42: reviewcomment declares its fields: text alone raises no refusal naming one, a call without it is refused naming it, and a field outside accepts is dropped; the draft is accepted in the query and its absence is the dead answer", async () => {
  const w = standard();
  const d = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  await declaredOpHolds({ op: "reviewcomment", declaration: DECLARED_OPS.reviewcomment, call: (f) => asAnn(w, `&draft=${d.draftId}`)("reviewcomment", f),
    values: { text: "a comment" }, refusedNaming: namesBy("reviewcomment"), same: sameVerdict });
  /* why `draft` is accepted and not required: the door answers a call without it with the one dead answer, which names nothing (R10) */
  assert.equal(JSON.stringify(asAnn(w)("reviewcomment", { text: "a comment" })), JSON.stringify(noReviewCopy()));
});
