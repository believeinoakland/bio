/* control-plane R20 and DEC-88's caller (case-authoring R19, C-82.8; `build/plan/t22-dec88-callers.md`): `op=statementack`
   reaches the store through the review door, on either of its two doors, carrying the acknowledger's `reason` as
   case-authoring's `statementack` arm reads it and nothing else of the caller's. The store behind the door is a stand-in
   answering through case-authoring's own ops map (`caseAuthoringOps`), whose `acknowledgeStatement` refuses a reasonless
   act with case-authoring's row and answers the review module's one dead answer for a door it does not admit. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, sha, FORGED } from "./harness.mjs";
const { caseAuthoringOps, STATEMENT_ACK_CHECKS } = await import("../../../src/case-authoring/index.mjs");
const { noReviewCopy } = await import("../../../src/review/index.mjs");

/* The stand-in: case-authoring's own route reads the inner request; its act refuses as case-authoring's R19 does. */
function standIn() {
  const seen = [];
  const answer = (c) => {
    if (c.route !== "statementack") return null;
    const act = { acknowledgeStatement(args) {
      seen.push(args);
      if (args.draft === "D-DEAD" || (!args.bySecret && !String(args.viewer ?? "").startsWith("member:"))) return noReviewCopy();
      if (typeof args.reason !== "string" || !args.reason.trim()) {
        const row = STATEMENT_ACK_CHECKS.STATEMENT_ACK_NO_REASON;
        return { ok: false, reason: "STATEMENT_ACK_NO_REASON", code: "STATEMENT_ACK_NO_REASON", check: row.check, translation: row.translation };
      }
      return { ok: true, acknowledged: true, reason: args.reason };
    } };
    return new Response(JSON.stringify({ ok: true, result: caseAuthoringOps(act, c.url, c.body).statementack() }));
  };
  return { seen, answer };
}

test("R20 (DEC-88; case-authoring R19): op=statementack carries the acknowledger's `reason` to the store on both doors — a recipient's secret and a member's session — as case-authoring's arm reads it, verbatim; the inner request holds the door's own keys and that, nothing else of the caller's", async () => {
  const s = standIn();
  const { env, S } = world({ answer: s.answer });
  const reason = "  I read it: the case leaves out the 2019 audit, and says so.  ";
  const doors = [
    ["secret", { op: "statementack", params: { secret: "sekret", reason, draft: "D1", by: FORGED, viewer: FORGED, extra: "x" } },
     { draft: "D1", bySecret: "1", reason }],
    ["session", { op: "statementack", token: S.ann, params: { draft: "D1", reason, author: FORGED, viewer: FORGED, extra: "x" } },
     { draft: "D1", viewer: "member:ann", reason }],
    ["session, a case document", { op: "statementack", token: S.ann, params: { case: "CASE-1", edition: "2", reason, extra: "x" } },
     { case: "CASE-1", edition: "2", viewer: "member:ann", reason }],
    /* a POST body's reason, where the query names none */
    ["session, POST", { op: "statementack", token: S.ann, params: { draft: "D1" }, method: "POST", body: { reason, by: FORGED, extra: "x" } },
     { draft: "D1", viewer: "member:ann", reason }],
  ];
  for (const [name, drive, want] of doors) {
    env.calls.length = 0; s.seen.length = 0;
    const r = await call(env, drive);
    assert.equal(r.status, 200, `${name}: ${r.text.slice(0, 200)}`);
    assert.deepEqual([r.json.ok, r.json.reason], [true, reason], name);
    const [inner] = opCalls(env);
    assert.deepEqual(inner.params, want, name);
    /* R64 (N761; case-authoring R62): the secret door's digest in the internal request's body alone */
    assert.deepEqual(inner.body?.secretSha, name === "secret" ? sha("sekret") : undefined, name);
    assert.equal(s.seen[0].reason, reason, `${name}: the arm reads the reason`);
  }
  /* the query's reason wins over a body's */
  env.calls.length = 0;
  await call(env, { op: "statementack", token: S.ann, params: { draft: "D1", reason: "the query's" }, method: "POST", body: { reason: "the body's" } });
  assert.equal(opCalls(env)[0].params.reason, "the query's");
});

test("R20 (DEC-88; case-authoring R19, C-82.8): an acknowledgement with no reason reaches the store without one and is refused STATEMENT_ACK_NO_REASON at 400 with case-authoring's row, on both doors; a reason that is not a string in a body is not carried (negative control: the same act with a reason is admitted)", async () => {
  const s = standIn();
  const { env, S } = world({ answer: s.answer });
  const row = STATEMENT_ACK_CHECKS.STATEMENT_ACK_NO_REASON;
  for (const drive of [{ op: "statementack", params: { secret: "sekret", draft: "D1" } },
                       { op: "statementack", token: S.ann, params: { draft: "D1" } },
                       { op: "statementack", token: S.ann, params: { draft: "D1", reason: "   " } },
                       { op: "statementack", token: S.ann, params: { draft: "D1" }, method: "POST", body: { reason: 7 } },
                       { op: "statementack", token: S.ann, params: { draft: "D1" }, method: "POST", body: "not json" }]) {
    env.calls.length = 0;
    const r = await call(env, drive);
    assert.deepEqual([r.status, r.json.ok, r.json.reason, r.json.check, r.json.translation], [400, false, "STATEMENT_ACK_NO_REASON", row.check, row.translation],
                     JSON.stringify(drive));
    assert.equal(row.check, "C-82.8");
    const got = opCalls(env)[0].params.reason;
    assert.ok(got === undefined || got === "   ", JSON.stringify(drive));
  }
  assert.equal((await call(env, { op: "statementack", token: S.ann, params: { draft: "D1", reason: "read" } })).status, 200);
});

test("R20: the dead answer for a door the store does not admit is byte-identical whether or not the caller sent a reason, on both doors and from reviewcopy — 404 NO_REVIEW_COPY, the same bytes", async () => {
  const s = standIn();
  const { env, S } = world({ answer: (c) => (c.route === "reviewcopy" ? new Response(JSON.stringify({ ok: true, result: noReviewCopy() })) : s.answer(c)) });
  const texts = new Set();
  for (const drive of [{ op: "statementack", params: { secret: "x", draft: "D-DEAD" } },
                       { op: "statementack", params: { secret: "x", draft: "D-DEAD", reason: "words" } },
                       { op: "statementack", token: S.ann, params: { draft: "D-DEAD" } },
                       { op: "statementack", token: S.ann, params: { draft: "D-DEAD", reason: "words" } },
                       { op: "statementack", params: { draft: "D1", reason: "words" } },   /* no caller at all */
                       { op: "reviewcopy", params: { secret: "x", draft: "D-DEAD" } }]) {
    const r = await call(env, drive);
    assert.equal(r.status, 404, JSON.stringify(drive));
    assert.equal(r.json.reason, "NO_REVIEW_COPY");
    texts.add(r.text);
  }
  assert.equal(texts.size, 1, "one dead answer, byte for byte");
});
