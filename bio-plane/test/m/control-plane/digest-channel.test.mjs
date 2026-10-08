/* control-plane R64 (N761; F1's rule for digests; plan T37 rule 4): a secret's digest reaches the store only in the body of
   the store's internal request, never its query. Driven through `makeFetch(hooks)` over a fake env whose store answers
   each route through its OWNER's own ops map (`reviewOps`, `caseAuthoringOps`, `filingTemplatesOps`, `credentialsOps`),
   each over a stand-in instance that records what the map handed it: so "the owner admits it as before" is the owner's
   own reading of the request, and a digest the door put anywhere but the body would reach the owner as null. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, sha, hex64, FORGED } from "./harness.mjs";
const { reviewOps } = await import("../../../src/review/index.mjs");
const { caseAuthoringOps } = await import("../../../src/case-authoring/index.mjs");
const { filingTemplatesOps } = await import("../../../src/filing-templates/index.mjs");
const { credentialsOps } = await import("../../../src/credentials/index.mjs");

const SENTINEL = "rv1_SENTINEL-secret-for-R64";
const PRESENTED = ["reviewcopy", "reviewcomment", "statementack", "templateread", "templatecomments", "templatereview", "templatecomment"];
const MINTED = ["reviewgrant", "templatereviewgrant", "aicredentialmint"];

/* The store: each route answered by its owner's map, the instance recording the `secretSha` the map read. */
function owners() {
  const seen = [];
  const rec = (route) => (args) => { seen.push({ route, secretSha: args?.secretSha ?? null }); return { ok: true, route, admitted: !!args?.secretSha }; };
  const review = { act: (a) => rec(`review:${a.act}`)(a), copy: rec("reviewcopy"), comment: rec("reviewcomment"), list: rec("casedrafts") };
  const authoring = { acknowledgeStatement: rec("statementack") };
  const templates = { templateRead: rec("templateread"), templateComments: rec("templatecomments"), templateReview: rec("templatereview"),
                      templateComment: rec("templatecomment"), templateReviewGrant: rec("templatereviewgrant") };
  const credentials = { aiCredentialMint: (a) => { seen.push({ route: "aicredentialmint", secretSha: a.secretSha ?? null }); return { ok: true, tokenId: "agent-1" }; } };
  const answer = (c) => {
    const maps = [reviewOps(review, c.url, c.body), caseAuthoringOps(authoring, c.url, c.body),
                  filingTemplatesOps(templates, c.url, c.body), credentialsOps(credentials, c.url, c.body, {})];
    const map = maps.find((m) => Object.hasOwn(m, c.route) && [...PRESENTED, ...MINTED].includes(c.route));
    return map ? new Response(JSON.stringify({ ok: true, result: map[c.route]() })) : null;
  };
  return { seen, answer };
}

const drive = (w, op) => {
  const secretDoor = PRESENTED.includes(op);
  return call(w.env, {
    op, method: "POST",
    ...(secretDoor ? {} : { token: op === "reviewgrant" ? w.S.founder : w.S.ann }),
    /* a caller's own digest and mark, in the address and the body, never reach the owner */
    params: { draft: "D1", version: "TPL-1@1", secretSha: hex64(), bySecret: "0", ...(secretDoor ? { secret: SENTINEL } : {}) },
    body: { draft: "D1", version: "TPL-1@1", text: "words", reason: "read", writes: [], secretSha: hex64(), bySecret: "1", viewer: FORGED },
  });
};

test("R64 (N761): for every op whose secret's digest the door sets — the seven grant doors' presented secrets and the three mints — the digest reaches the store in the internal request's body alone, in no address and no header of any request the plane makes, and the owner's own map admits it as before; a caller's own `secretSha` and `bySecret` never reach the owner", async () => {
  for (const op of [...PRESENTED, ...MINTED]) {
    const o = owners();
    const w = world({ answer: o.answer });
    const r = await drive(w, op);
    assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 300)}`);
    const want = PRESENTED.includes(op) ? sha(SENTINEL)
      : sha(op === "aicredentialmint" ? r.json.result.token : r.json.result.secret);
    /* the owner read the door's digest, from the body */
    const read = o.seen.filter((s) => s.route === op || s.route === "review:grant");
    assert.equal(read.length, 1, op);
    assert.equal(read[0].secretSha, want, `${op}: the owner admits the door's digest`);
    const inner = opCalls(w.env).filter((c) => c.route === op);
    assert.equal(inner.length, 1, op);
    assert.equal(inner[0].method, "POST", op);
    assert.equal(inner[0].body.secretSha, want, op);
    assert.equal(Object.hasOwn(inner[0].params, "secretSha"), false, `${op}: no digest in the query`);
    if (PRESENTED.includes(op)) assert.equal(inner[0].params.bySecret, "1", `${op}: the door's mark`);
    else assert.equal(Object.hasOwn(inner[0].params, "bySecret") || Object.hasOwn(inner[0].body, "bySecret"), false, op);
    /* no address and no header of any request the plane made carries the digest or the secret */
    for (const c of [...w.env.calls, ...w.env.windowCalls, ...w.env.countCalls]) {
      assert.equal(c.url.href.includes(want) || c.url.href.includes(SENTINEL), false, `${op}: address of ${c.route}`);
      assert.equal(JSON.stringify(c.headers).includes(want), false, `${op}: headers of ${c.route}`);
    }
  }
});

test("R64 (negative control): an owner's map reads no digest from the query — the same owners, asked with the digest in the address alone, see none and admit nothing — so a door that put it there would not be admitted", () => {
  const o = owners();
  const digest = sha(SENTINEL);
  for (const op of [...PRESENTED, ...MINTED]) {
    const url = new URL(`http://do/${op}?draft=D1&version=TPL-1@1&bySecret=1&secretSha=${digest}`);
    const maps = [reviewOps({ act: (a) => ({ ok: true, a }), copy: (a) => ({ a }), comment: (a) => ({ a }) }, url, {}),
                  caseAuthoringOps({ acknowledgeStatement: (a) => ({ a }) }, url, {}),
                  filingTemplatesOps(Object.fromEntries(["templateRead", "templateComments", "templateReview", "templateComment",
                                                         "templateReviewGrant"].map((k) => [k, (a) => ({ a })])), url, {}),
                  credentialsOps({ aiCredentialMint: (a) => ({ a }) }, url, {}, {})];
    const map = maps.find((m) => Object.hasOwn(m, op));
    const got = map[op]();
    assert.equal((got.a ?? got).secretSha ?? null, null, `${op}: a query digest is never read`);
  }
  assert.equal(o.seen.length, 0);
});
