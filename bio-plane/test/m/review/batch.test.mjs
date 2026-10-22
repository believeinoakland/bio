/* review T51 (fix round 6, G12c; K4426–K4428, K4208): the two reads a screen repeated once per item are batched by ids, through the
   op map as the door runs it. `casedrafts` also takes `projects` (Home sent one per project) and `reviewcopy` also takes `drafts`
   (the Ceremony sent one per draft): each id is answered exactly as the single read answers it, a hidden or unknown id included. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, REVIEW_COPY_CHECKS, REVIEW_BATCH_LISTS_MAX, REVIEW_BATCH_COPIES_MAX, noReviewCopy, reviewOps } from "../../../src/review/index.mjs";
import { standard, P, Q, V, SECRET } from "./fixture.mjs";

const ask = (w, op, query, body) => reviewOps(w.r, new URL(`http://x/?${query}`), body)[op]();
const as = (w, who) => `viewer=${encodeURIComponent(V(who))}`;
const same = (a, b, why) => assert.equal(JSON.stringify(a), JSON.stringify(b), why);

function world() {
  const w = standard();
  w.project("PROJ-2026-0003-r", { owners: ["ann"] });
  const R = "PROJ-2026-0003-r";
  const mine = w.r.act({ act: "draft", author: "ann", project: P, statement: "Mine" });
  const second = w.r.act({ act: "draft", author: "ann", project: P, statement: "Second" });
  const other = w.r.act({ act: "draft", author: "ann", project: R, statement: "Other" });
  const hidden = w.r.act({ act: "draft", author: "quinn", project: Q, statement: "Hidden" });
  return { w, R, mine, second, other, hidden };
}

test("R19 (G12c): casedrafts with projects answers one list per project, each equal to the single read of that project, a project the viewer may not see and one that does not exist answering the dead answer as the single read does", () => {
  const { w, R } = world();
  const ghost = "PROJ-2026-9999-none";
  const ids = [P, R, Q, ghost];
  const before = w.snapshot();
  const batch = ask(w, "casedrafts", `${as(w, "ann")}&projects=${ids.join(",")}`);
  assert.equal(batch.ok, true);
  assert.deepEqual(Object.keys(batch.lists), ids, "one list per project, in the order asked");
  for (const id of ids) same(batch.lists[id], ask(w, "casedrafts", `${as(w, "ann")}&project=${id}`), `${id} equals its single read`);
  same(batch.lists[Q], noReviewCopy(), "a project the viewer may not see");
  same(batch.lists[ghost], noReviewCopy(), "a project that does not exist, byte-identical to the one the viewer may not see");
  assert.equal(batch.lists[P].drafts.length, 2);
  assert.equal(batch.lists[R].drafts.length, 1);
  assert.deepEqual(w.snapshot(), before, "a read writes nothing");
});

test("R19 (G12c): the batch of projects takes a body list as well, repeats an id once, names no project for an empty list, and answers every project dead to a viewer with no standing or none", () => {
  const { w, R } = world();
  const viaBody = ask(w, "casedrafts", as(w, "ann"), { projects: [P, R, P, "  ", R] });
  assert.deepEqual(Object.keys(viaBody.lists), [P, R], "an id once, blanks dropped");
  same(viaBody, ask(w, "casedrafts", `${as(w, "ann")}&projects=${P},${R}`), "the body list and the query list answer alike");
  assert.deepEqual(ask(w, "casedrafts", `${as(w, "ann")}&projects=`).lists, {}, "an empty list names no project");
  for (const query of [as(w, "out"), "viewer=", ""]) {
    const dead = ask(w, "casedrafts", `${query}&projects=${P},${R}`);
    same(dead.lists, { [P]: noReviewCopy(), [R]: noReviewCopy() }, `no standing: ${query || "no viewer"}`);
    same(dead.lists[P], ask(w, "casedrafts", `${query}&project=${P}`));
  }
  /* control: the single read is as it was; with neither key it is the dead answer */
  assert.equal(ask(w, "casedrafts", `${as(w, "ann")}&project=${P}`).kind, "review-drafts");
  same(ask(w, "casedrafts", as(w, "ann")), noReviewCopy());
  /* a key that is an own property name of Object is an id like any other */
  const odd = ask(w, "casedrafts", `${as(w, "ann")}&projects=__proto__,${P}`);
  assert.deepEqual(Object.keys(odd.lists), ["__proto__", P]);
});

test("R19 (G12c): a batch of projects is bounded and says so: the most it takes answers, one more is refused REVIEW_BATCH_TOO_LARGE and nothing is read", () => {
  const { w } = world();
  const many = (n) => Array.from({ length: n }, (_, i) => `PROJ-2026-${String(1000 + i)}-x`);
  assert.equal(REVIEW_BATCH_LISTS_MAX, 50);
  const at = ask(w, "casedrafts", `${as(w, "ann")}&projects=${many(REVIEW_BATCH_LISTS_MAX).join(",")}`);
  assert.equal(at.ok, true);
  assert.equal(Object.keys(at.lists).length, REVIEW_BATCH_LISTS_MAX);
  const over = ask(w, "casedrafts", `${as(w, "ann")}&projects=${many(REVIEW_BATCH_LISTS_MAX + 1).join(",")}`);
  assert.deepEqual([over.ok, over.code, over.check, over.max], [false, "REVIEW_BATCH_TOO_LARGE", "C-87.18", REVIEW_BATCH_LISTS_MAX]);
  assert.equal(over.translation, REVIEW_COPY_CHECKS.REVIEW_BATCH_TOO_LARGE.translation);
  /* repeats count once: the bound is on the ids asked, not the length of the text */
  const repeated = ask(w, "casedrafts", `${as(w, "ann")}&projects=${Array(80).fill(P).join(",")}`);
  assert.deepEqual(Object.keys(repeated.lists), [P]);
});

test("R10 R11 (G12c): reviewcopy with drafts answers one copy per draft, each equal to the single read of that draft, a draft the viewer may not see and one that does not exist answering the dead answer as the single read does", () => {
  const { w, mine, second, other, hidden } = world();
  const ghost = "DRAFT-2026-nothing";
  const ids = [mine.draftId, hidden.draftId, second.draftId, ghost, other.draftId];
  const before = w.snapshot();
  const batch = ask(w, "reviewcopy", `${as(w, "ann")}&drafts=${ids.join(",")}`);
  assert.equal(batch.ok, true);
  assert.deepEqual(Object.keys(batch.copies), ids, "one copy per draft, in the order asked");
  for (const id of ids) same(batch.copies[id], ask(w, "reviewcopy", `${as(w, "ann")}&draft=${id}`), `${id} equals its single read`);
  same(batch.copies[hidden.draftId], noReviewCopy(), "a draft the viewer may not see");
  same(batch.copies[ghost], noReviewCopy(), "a draft that does not exist, byte-identical to the one the viewer may not see");
  assert.equal(batch.copies[mine.draftId].kind, "review-copy");
  assert.equal(batch.copies[mine.draftId].draft, mine.draftId);
  assert.deepEqual(w.snapshot(), before, "a read writes nothing");
});

test("R10 R11 (G12c): the batch of drafts takes a body list too, honours limit as the single read does, and answers every draft dead to a viewer with no standing or none", () => {
  const { w, mine, second } = world();
  const d = mine.draftId;
  w.r.comment({ draft: d, viewer: V("ann"), text: "one" });
  w.r.comment({ draft: d, viewer: V("ann"), text: "two" });
  const viaBody = ask(w, "reviewcopy", as(w, "ann"), { drafts: [d, second.draftId, d] });
  assert.deepEqual(Object.keys(viaBody.copies), [d, second.draftId]);
  const limited = ask(w, "reviewcopy", `${as(w, "ann")}&limit=1&drafts=${d}`);
  same(limited.copies[d], ask(w, "reviewcopy", `${as(w, "ann")}&limit=1&draft=${d}`));
  assert.equal(limited.copies[d].comments.length, 1);
  for (const query of [as(w, "out"), "viewer=", ""])
    same(ask(w, "reviewcopy", `${query}&drafts=${d}`).copies, { [d]: noReviewCopy() }, `no standing: ${query || "no viewer"}`);
  assert.deepEqual(ask(w, "reviewcopy", `${as(w, "ann")}&drafts=`).copies, {}, "an empty list names no draft");
  /* control: the single read is as it was; with neither key it is the dead answer */
  assert.equal(ask(w, "reviewcopy", `${as(w, "ann")}&draft=${d}`).kind, "review-copy");
  same(ask(w, "reviewcopy", as(w, "ann")), noReviewCopy());
});

test("R10 (G12c): a recipient's batch gets her own draft's copy and the dead answer for every other draft, as the single read gives them", () => {
  const { w, mine, second } = world();
  const g = w.r.act({ act: "grant", author: "ann", draft: mine.draftId, recipient: "Reporter", secretSha: SECRET(1) });
  assert.equal(g.ok, true);
  const ids = [mine.draftId, second.draftId];
  const batch = reviewOps(w.r, new URL(`http://x/?bySecret=1&drafts=${ids.join(",")}`), { secretSha: SECRET(1) }).reviewcopy();
  for (const id of ids)
    same(batch.copies[id], reviewOps(w.r, new URL(`http://x/?bySecret=1&draft=${id}`), { secretSha: SECRET(1) }).reviewcopy(), id);
  assert.equal(batch.copies[mine.draftId].reader, "recipient");
  same(batch.copies[second.draftId], noReviewCopy(), "a draft that is not the grant's own");
  /* a revoked grant: every id is dead */
  w.r.act({ act: "revoke", author: "ann", grant: g.grantId });
  const revoked = reviewOps(w.r, new URL(`http://x/?bySecret=1&drafts=${ids.join(",")}`), { secretSha: SECRET(1) }).reviewcopy();
  same(revoked.copies, { [mine.draftId]: noReviewCopy(), [second.draftId]: noReviewCopy() });
});

test("R10 R11 (G12c): a batch of drafts is bounded and says so: the most it takes answers, one more is refused REVIEW_BATCH_TOO_LARGE", () => {
  const { w } = world();
  const many = (n) => Array.from({ length: n }, (_, i) => `DRAFT-2026-${String(1000 + i)}`);
  assert.equal(REVIEW_BATCH_COPIES_MAX, 20);
  const at = ask(w, "reviewcopy", `${as(w, "ann")}&drafts=${many(REVIEW_BATCH_COPIES_MAX).join(",")}`);
  assert.equal(Object.keys(at.copies).length, REVIEW_BATCH_COPIES_MAX);
  const over = ask(w, "reviewcopy", `${as(w, "ann")}&drafts=${many(REVIEW_BATCH_COPIES_MAX + 1).join(",")}`);
  assert.deepEqual([over.ok, over.code, over.check, over.max], [false, "REVIEW_BATCH_TOO_LARGE", "C-87.18", REVIEW_BATCH_COPIES_MAX]);
  assert.equal(typeof over.detail, "string");
});

test("R42 (G12c, K4208): casedrafts and reviewcopy are declared, each with the key that batches it, and the declarations hold against the ops as the door runs them", async () => {
  assert.deepEqual(Object.keys(DECLARED_OPS).sort(), ["casedraft", "casedrafts", "reviewcomment", "reviewcopy", "reviewgrant", "reviewrevoke"]);
  assert.equal(DECLARED_OPS.casedrafts.mutating, false);
  assert.equal(DECLARED_OPS.reviewcopy.mutating, false);
  assert.equal(DECLARED_OPS.casedrafts.weight, "read");
  assert.equal(DECLARED_OPS.reviewcopy.weight, "read");
  assert.equal(DECLARED_OPS.reviewcopy.classes, null, "the doors are the module's: a recipient reads with no session");
  assert.deepEqual([...DECLARED_OPS.casedrafts.fields.accepts].sort(), ["limit", "project", "projects"]);
  assert.deepEqual([...DECLARED_OPS.reviewcopy.fields.accepts].sort(), ["draft", "drafts", "limit", "secret"]);
  /* nothing is required: a call with none of them is the one dead answer, which names nothing (R10, R19) */
  assert.deepEqual([DECLARED_OPS.casedrafts.fields.requires, DECLARED_OPS.reviewcopy.fields.requires], [[], []]);
  const { w, mine } = world();
  const run = (op, extra = "") => (f) => ask(w, op, `${as(w, "ann")}${extra}`, f);
  await declaredOpHolds({ op: "casedrafts", declaration: DECLARED_OPS.casedrafts, call: run("casedrafts"), values: {}, refusedNaming: () => false });
  await declaredOpHolds({ op: "reviewcopy", declaration: DECLARED_OPS.reviewcopy, call: run("reviewcopy", `&draft=${mine.draftId}`), values: {}, refusedNaming: () => false });
  /* control: every accepted key is read: a project, a list of them, a draft, a list of them */
  assert.equal(ask(w, "casedrafts", `${as(w, "ann")}&limit=1&projects=${P}`).lists[P].limit, 1);
  assert.equal(ask(w, "reviewcopy", `${as(w, "ann")}&drafts=${mine.draftId}`).copies[mine.draftId].draft, mine.draftId);
});
