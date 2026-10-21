/* control-plane T51 fix round 2 (C52): the owner's reply to a reader's comment is accepted through the door.
   The door's part is the viewer it hands `review`'s member door (`reviewcomment`, R20): the owner's own, as `readerOf`
   answers it, with the draft the request names and nothing else of the caller's. Driven through the real door over the real
   `review` (its fixture and its ops map), two drafts, the owner a member of one project and the founder of another. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, member, hex64, FORGED } from "./harness.mjs";
import { standard, P } from "../review/fixture.mjs";
const { reviewOps } = await import("../../../src/review/index.mjs");

const F = "PROJ-2026-0003-f";

/* the store answers `reviewcomment`, `reviewcopy` through review's own ops map over the real module */
function reviewWorld() {
  const r = standard();
  r.project(F, { owners: ["admin"] });
  const drafts = [];
  for (const [project, owner] of [[P, "ann"], [F, "admin"]])
    for (let i = 0; i < 2; i++) {
      const d = r.r.act({ act: "draft", author: owner, project, scope: `s${i}` });
      assert.ok(d.ok, JSON.stringify(d));
      drafts.push({ id: d.draftId, owner, project });
    }
  const answer = (c) => {
    if (c.route !== "reviewcomment" && c.route !== "reviewcopy") return null;
    return new Response(JSON.stringify({ ok: true, result: reviewOps(r.r, c.url, c.body)[c.route]() }));
  };
  /* `out` is no member of any project, `quinn` owns another project's (the fixture's), both with a session */
  const T = { out: hex64(), quinn: hex64() };
  return { r, drafts, T, ...world({ answer, sessions: { [T.out]: member("out", ["contribute"]), [T.quinn]: member("quinn", ["contribute"]) } }) };
}
const reply = (w, token, draft, text, params = {}, body = {}) =>
  call(w.env, { op: "reviewcomment", token, method: "POST", params: { draft, ...params }, body: { text, ...body } });

test("R20, R29: the owner's reply to a reader's comment on each of two drafts is accepted through the door, attributed to the member (C52)", async () => {
  const w = reviewWorld();
  for (const { id, owner } of w.drafts) {
    const token = owner === "admin" ? w.S.founder : w.S.ann;
    const r = await reply(w, token, id, `reply on ${id}`);
    assert.equal(r.status, 200, `${owner} on ${id}: ${r.text.slice(0, 300)}`);
    assert.equal(r.json.ok, true);
    assert.equal(r.json.comment.author_kind, "member");
    assert.equal(r.json.comment.author, owner);
    /* the viewer the owner's own session is, stamped by the door, no copy of the caller's */
    const inner = opCalls(w.env).filter((c) => c.route === "reviewcomment").at(-1);
    assert.equal(inner.params.viewer, owner === "admin" ? "admin" : "member:ann");
  }
});

test("R20, R29: a viewer, member or author the caller sends never reaches the member door; a stranger and a member of another project are NO_REVIEW_COPY, byte-identical to a draft that does not exist (control, C52)", async () => {
  const w = reviewWorld();
  const [first] = w.drafts;
  const dead = await reply(w, w.S.ann, "DRAFT-2026-9999", "x");
  assert.equal(dead.status, 404);
  assert.equal(dead.json.reason, "NO_REVIEW_COPY");
  /* a member of no project, a member of another project, and the other project's owner on the founder's draft */
  for (const [token, draft] of [[w.T.out, first.id], [w.T.quinn, first.id], [w.S.ann, w.drafts[2].id]]) {
    const r = await reply(w, token, draft, "x");
    assert.equal(r.status, 404, draft);
    assert.equal(r.json.reason, "NO_REVIEW_COPY");
    assert.deepEqual({ ...r.json, correlation: undefined }, { ...dead.json, correlation: undefined });
  }
  /* a forged viewer in the address and the body is deleted: the stranger stays outside */
  const forged = await reply(w, w.T.out, first.id, "x", { viewer: "member:ann", author: "ann", member: "ann" },
                             { viewer: "member:ann", author: "ann", member: "ann" });
  assert.equal(forged.status, 404);
  assert.equal(forged.json.reason, "NO_REVIEW_COPY");
  const inner = opCalls(w.env).filter((c) => c.route === "reviewcomment").at(-1);
  assert.notEqual(inner.params.viewer, "member:ann");
  assert.notEqual(inner.params.viewer, FORGED);
  assert.equal(inner.params.author, undefined);
});
