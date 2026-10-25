/* store-request R23, R12, R3, R9 (STORE-REQUEST #5, B9 (1), B12 (1), (2)): the secret never reaches the store; a member's session at a template
   door is stamped as the door stamps it; a correction's own `source` is kept while every stamp a caller names is not. */
import "../../sandbox.mjs";
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { storeWorld, WORLD_TOKENS } from "./fixtures.mjs";
import { innerRequest, QUERY_STAMPS, SECRET_PRESENTING_OPS, GRANT_ISSUING_OPS } from "../../../src/store-request/index.mjs";
import { LOCAL_FACTS_ACTIONS } from "../../../src/op-declarations/index.mjs";

let w, ruth, C = {};
before(async () => {
  w = await storeWorld();
  const founder = await w.signIn("admin");
  ruth = await w.signIn("ruth", { capabilities: ["contribute"] });
  C = { founder: await w.admitted(founder.token), member: await w.admitted(ruth.token), admin: await w.admitted(WORLD_TOKENS.ADMIN_TOKEN) };
});
const FORGED = "FORGED";
const Q = (r) => new URL(r.url).searchParams;
const B = (r) => JSON.parse(r.body);
const TEMPLATE = ["templateread", "templatecomments", "templatereview", "templatecomment"];

test("R23: a secret-presenting op's request carries neither the secret nor a stamp the caller named, in the address and the body; the digest stays", () => {
  const digest = "d".repeat(64);
  for (const op of SECRET_PRESENTING_OPS) {
    const forged = Object.fromEntries([...QUERY_STAMPS, "secret"].map((k) => [k, FORGED]));
    const r = innerRequest({ op, url: `http://h/?${new URLSearchParams({ op, draft: "D", ...forged })}`, method: "POST",
      body: JSON.stringify({ text: "hi", secret: "rv1_abc", ...forged }), caller: null, bySecret: true, secretSha: digest });
    for (const k of [...QUERY_STAMPS, "secret"]) {
      assert.equal(Q(r).has(k), false, `${op} address ${k}`);
      assert.equal(k in B(r), false, `${op} body ${k}`);
    }
    assert.equal(B(r).secretSha, digest, op); assert.equal(B(r).text, "hi", op); assert.equal(Q(r).get("bySecret"), "1", op);
    assert.equal(Q(r).get("draft"), "D", op);
  }
  for (const op of GRANT_ISSUING_OPS) {
    const r = innerRequest({ op, url: `http://h/?op=${op}&secret=x`, method: "POST", body: JSON.stringify({ draft: "D", secret: "s" }), caller: C.member, secretSha: digest });
    assert.equal("secret" in B(r), false, op); assert.equal(Q(r).has("secret"), false, op); assert.equal(B(r).draft, "D");
  }
});

test("R23, R4: a member's session at the template doors is stamped viewer and author as the door stamps it; a recipient, and any caller that is no session, carries none", () => {
  const c = C.member;
  for (const op of TEMPLATE) {
    const r = innerRequest({ op, url: `http://h/?op=${op}&version=v1&viewer=${FORGED}&author=${FORGED}`, method: "POST",
      body: JSON.stringify({ outcome: "ok", viewer: FORGED, author: FORGED, by: FORGED }), caller: c });
    assert.equal(Q(r).get("viewer"), c.viewer, op); assert.equal(Q(r).get("author"), c.identity, op);
    assert.equal(Q(r).get("version"), "v1", op);
    assert.deepEqual(["viewer", "author", "by"].filter((k) => k in B(r)), [], `${op} body`);
    assert.equal(B(r).outcome, "ok");
    const rec = innerRequest({ op, url: `http://h/?op=${op}`, method: "POST", body: "{}", caller: null, bySecret: true, secretSha: "e".repeat(64) });
    assert.equal(Q(rec).has("viewer"), false, `${op} recipient`); assert.equal(Q(rec).has("author"), false, `${op} recipient`);
    for (const none of [null, C.admin]) {
      const n = innerRequest({ op, url: `http://h/?op=${op}&viewer=${FORGED}`, method: "POST", body: "{}", caller: none });
      assert.equal(Q(n).has("viewer"), false, `${op} no session`); assert.equal(Q(n).has("author"), false, `${op} no session`);
    }
  }
  /* the review copy's three: a session's viewer, no author */
  for (const op of ["reviewcopy", "reviewcomment", "statementack"]) {
    const r = innerRequest({ op, url: `http://h/?op=${op}&draft=D`, method: "POST", body: "{}", caller: c });
    assert.equal(Q(r).get("viewer"), c.viewer, op); assert.equal(Q(r).has("author"), false, op);
  }
});

test("R12, R3: a LOCAL_FACTS op's body keeps the correction's own `source`, drops every stamp a caller names, and its address takes no `source`", () => {
  const op = LOCAL_FACTS_ACTIONS[0];
  for (const c of [C.founder, C.member, C.admin]) {
    const forged = Object.fromEntries(QUERY_STAMPS.filter((k) => k !== "source").map((k) => [k, FORGED]));
    const r = innerRequest({ op, url: `http://h/?op=${op}&source=${FORGED}&country=${FORGED}`, method: "POST",
      body: JSON.stringify({ path: "a/b", act: "correct", how: "h", value: 1, source: "the county's 2026 notice", ...forged }), caller: c });
    assert.equal(B(r).source, "the county's 2026 notice");
    for (const k of Object.keys(forged)) if (k !== "by") assert.equal(k in B(r), false, k);
    assert.notEqual(B(r).by, FORGED);
    assert.equal(Q(r).has("source"), false); assert.equal(Q(r).has("country"), false);
  }
});

const post = (as, op, b) => w.door({ url: `/api/?op=${op}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) } }, as);

test("R12 (door): the founder's correction of a local fact with its source is accepted by the owner, and the same without a source is refused FACT_VALUE_REFUSED (control)", async () => {
  const founder = await w.signIn("admin");
  assert.equal((await post(founder, "profilesset", { profiles: ["oakland-alameda"] })).json.result.ok, true);
  const path = "oakland-alameda/time_zone";
  const without = await post(founder, "factconfirm", { path, act: "correct", how: "read the office's notice", value: "Europe/Berlin" });
  assert.equal(without.json.result.reason, "FACT_VALUE_REFUSED");
  const done = await post(founder, "factconfirm", { path, act: "correct", how: "read the office's notice", value: "Europe/Berlin", source: "the office's posted notice", by: FORGED });
  assert.equal(done.json.result.ok, true, JSON.stringify(done.json));
});

test("R23, R4 (door): a member's session at templatereview is stamped, so the owner does not say the call carries nobody", async () => {
  const t = await post(ruth, "templatereview", { version: "nothing", outcome: "approve", scope: "s" });
  assert.notEqual(t.json.reason, "MACHINE_CANNOT_REVIEW_TEMPLATE", JSON.stringify(t.json));
  assert.equal(t.json.reason, "NO_SUCH_TEMPLATE"); assert.equal(t.status, 404);   /* the owner's own refusal, enveloped flat as the Worker's door gives it */
});

test("R23 (door): a caller with no secret and no session at a template door is given the one dead answer NO_TEMPLATE_GRANT at 404, as a presented secret no live grant holds is", async () => {
  const anyone = await post(null, "templatereview", { version: "nothing", outcome: "approve", scope: "s" });
  assert.equal(anyone.status, 404, JSON.stringify(anyone.json)); assert.equal(anyone.json.reason, "NO_TEMPLATE_GRANT");
  const secret = await post(null, "templatereview", { version: "nothing", outcome: "approve", scope: "s", secret: "rv1_none" });
  assert.equal(secret.status, anyone.status); assert.deepEqual(secret.json, anyone.json);
});
