/* control-plane R138 (R136; store-request R1, R23; fix round 10, B95 (2)): THE SECRET-PRESENTING DOORS MAKE THEIR STORE REQUEST WITH `innerRequest`.
   `reviewcopy`, `reviewcomment`, `statementack` and the four template doors admit a recipient by a grant's secret or a member by her session. The request
   each sends to the store is `store-request`'s `innerRequest` of the page's request (the address's other parameters and the body's other fields, less every
   stamp, credential and digest the caller names), with the reader's own sight set and, for a recipient, the secret's digest and `bySecret`; it is no
   list of the parameters the door chose to carry. Test: for each op, a member's request equals `innerRequest`'s answer for the same inputs plus her
   stamps (a parameter and a body field the caller names beyond the arm's own reach the store); forged stamps and a `secretSha` reach it
   through neither the address nor the body. Control: a recipient's request carries only the keys the review arms take (the secret opens one copy). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, sha, FORGED } from "./harness.mjs";
/* after the harness: its registration of the declared ops is the first read of this process (register-declared.mjs) */
const { innerRequest } = await import("../../../src/store-request/index.mjs");

const REVIEW = ["reviewcopy", "reviewcomment", "statementack"];
const TEMPLATE = ["templateread", "templatecomments", "templatereview", "templatecomment"];
const POSTS = new Set(["reviewcomment", "templatereview", "templatecomment"]);
const SECRET = "rv1_secret-of-a-live-grant";

const sorted = (u) => [...new URL(u, "http://x").searchParams].sort(([a], [b]) => (a < b ? -1 : 1));

test("R138 (R136): a member's request to each secret-presenting door is innerRequest's answer for the page's request plus her own stamps; a parameter and a body field beyond the arm's own reach the store, a forged stamp and a forged digest do not", async () => {
  for (const op of [...REVIEW, ...TEMPLATE]) {
    const w = world();
    const post = POSTS.has(op);
    const body = { text: "a note", marker: "kept-in-body", viewer: FORGED, author: FORGED, secretSha: "0".repeat(64), actorIdentity: FORGED };
    const r = await call(w.env, { op, token: w.S.ann, method: post ? "POST" : "GET", body: post ? body : undefined,
                                  params: { draft: "D1", version: "TPL-1@1", marker: "kept-in-address", viewer: FORGED, author: FORGED, by: FORGED, secretSha: "1".repeat(64), bySecret: "1" } });
    assert.ok(r.status < 500, `${op}: ${r.text.slice(0, 200)}`);
    const [got] = opCalls(w.env).filter((c) => c.route === op);
    assert.ok(got, `${op}: the store is asked`);
    const page = new URL("https://plane.example/api");
    page.searchParams.set("op", op);
    for (const [k, v] of Object.entries({ draft: "D1", version: "TPL-1@1", marker: "kept-in-address" })) page.searchParams.set(k, v);
    const clean = { text: "a note", marker: "kept-in-body" };
    const made = innerRequest({ op, url: page, method: post ? "POST" : "GET", body: post ? JSON.stringify(clean) : undefined, caller: null });
    const want = new URLSearchParams(sorted(made.url));
    want.set("viewer", "member:ann");
    if (TEMPLATE.includes(op)) want.set("author", "member:ann");
    assert.deepEqual(sorted(`http://x/?${got.url.searchParams}`), sorted(`http://x/?${want}`), `${op}: the address is innerRequest's, less the caller's stamps, plus hers`);
    assert.equal(got.params.marker, "kept-in-address", `${op}: a parameter beyond the arm's own reaches the store`);
    if (post) {
      assert.deepEqual(got.body, JSON.parse(made.body), `${op}: the body is innerRequest's`);
      assert.equal(got.body.marker, "kept-in-body", `${op}: a body field beyond the arm's own reaches the store`);
    }
    const sent = JSON.stringify([got.params, got.body]);
    for (const leaked of [FORGED, SECRET, "0".repeat(64), "1".repeat(64)]) assert.equal(sent.includes(leaked), false, `${op}: ${leaked.slice(0, 12)} reaches the store through neither`);
    assert.equal(got.params.bySecret, undefined, `${op}: a member's request is not marked by a secret`);
  }
});

test("R138 (R136; R20, R44): a recipient's request carries the digest and the mark, and for the review arms only the keys they take (the secret opens one copy); the template doors carry the page's other parameters", async () => {
  for (const op of [...REVIEW, ...TEMPLATE]) {
    const w = world();
    const post = POSTS.has(op) || true;
    const r = await call(w.env, { op, method: post ? "POST" : "GET", params: { draft: " D1 ", version: "TPL-1@1", marker: "m1", drafts: "D1,D2", case: "C", edition: "1", secret: SECRET, viewer: FORGED },
                                  body: { text: "a note", marker: "kept-in-body", viewer: FORGED } });
    assert.ok(r.status < 500, `${op}: ${r.text.slice(0, 200)}`);
    const [got] = opCalls(w.env).filter((c) => c.route === op);
    assert.ok(got, `${op}: the store is asked`);
    assert.equal(got.params.bySecret, "1", op);
    assert.equal(got.body.secretSha, sha(SECRET), `${op}: the digest in the body`);
    assert.equal(JSON.stringify([got.params, got.body]).includes(SECRET), false, `${op}: the value never crosses`);
    assert.equal(got.params.viewer, undefined, op);
    if (REVIEW.includes(op)) {
      assert.deepEqual(Object.keys(got.params).sort(), ["bySecret", "draft"], `${op}: a recipient's address is the review arm's keys`);
      assert.equal(got.params.draft, "D1", `${op}: the draft trimmed`);
      assert.deepEqual(Object.keys(got.body).sort(), op === "reviewcomment" ? ["secretSha", "text"] : ["secretSha"], `${op}: and its body`);
    } else {
      assert.equal(got.params.marker, "m1", `${op}: the template door carries the page's parameters`);
      assert.equal(got.params.version, "TPL-1@1", op);
    }
  }
});
