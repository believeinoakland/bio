/* control-plane R44 (K921; filing-templates R8, R9, R13, R14): the template grant's secret and its four doors, driven
   through `makeFetch(hooks)` with a fake env whose store answers filing-templates' routes as the module does: a live
   grant's digest is admitted, any other digest receives the module's one dead answer (`noTemplateGrant()`), and a
   member's call is answered with the stamps it carried. The grant logic itself is filing-templates'; what is proved here
   is the door: the secret's mint, who is admitted, what crosses to the store, and the one answer everyone else receives. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, sha, hex64, aik, cred, FORGED } from "./harness.mjs";
import { noTemplateGrant } from "../../../src/filing-templates/index.mjs";

const { OPS } = O;
const DOORS = ["templateread", "templatecomments", "templatereview", "templatecomment"];
const MUTATING = new Set(["templatereview", "templatecomment"]);
const LIVE = "rv1_live-grant-secret";
const REVOKED = "rv1_revoked-grant-secret";
const ok = (result, status = 200) => new Response(JSON.stringify({ ok: true, result }), { status });

/* filing-templates' four routes as the module answers them: a secret's digest is admitted only when a live grant holds
   it; a member's call answers what it was stamped with. */
const store = (extra = null) => (c) => {
  const r = extra && extra(c);
  if (r) return r;
  if (!DOORS.includes(c.route) && c.route !== "templatereviewgrant") return null;
  if (c.route === "templatereviewgrant") return ok({ ok: true, grant: "TRG-2026-0001", version: "TPL-1@1" });
  if (c.params.bySecret === "1")
    /* R64 (N761; filing-templates R27): the digest is read from the internal request's body, as the module reads it */
    return ok(c.body?.secretSha === sha(LIVE) ? { ok: true, version: "TPL-1@1", through: "grant" } : noTemplateGrant());
  return ok({ ok: true, version: "TPL-1@1", through: "member", viewer: c.params.viewer, author: c.params.author });
};
const door = (w, op, x = {}) => call(w.env, { op, method: MUTATING.has(op) ? "POST" : "GET",
                                             body: MUTATING.has(op) ? (x.body ?? { version: "TPL-1@1", text: "a note" }) : undefined,
                                             ...x, params: { version: "TPL-1@1", ...(x.params || {}) } });

test("R44: the four grant doors are public ops (classes null) and templatereviewgrant an admitted act, as op-declarations R8 declares them", () => {
  for (const op of DOORS) assert.equal(OPS[op]?.classes, null, op);
  assert.ok(Array.isArray(OPS.templatereviewgrant?.classes) && OPS.templatereviewgrant.mutating === true);
});

test("R44: templatereviewgrant is answered as reviewgrant is — admission's reviewGrantSecret makes the secret, returned once in the minting answer; the store receives only its SHA-256 as secretSha, never the value nor a caller's own secretSha (negative control: a store refusal is answered 403 with no secret, a silence 502)", async () => {
  const w = world({ answer: store() });
  const r = await call(w.env, { op: "templatereviewgrant", token: w.S.ann, method: "POST",
                                params: { secretSha: hex64(), bySecret: "1" },
                                body: { version: "TPL-1@1", recipient: "Dee Counsel", organisation: "Firm", secretSha: hex64() } });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.ok, true);
  const { secret } = r.json.result;
  assert.match(secret, /^rv1_[A-Za-z0-9_-]{43}$/);
  assert.equal(typeof r.json.result.secretIsShownOnce, "string");
  /* R59 (F1): the instruction names the body, never an address carrying the secret */
  assert.equal(r.json.result.read, "a POST to op=templateread with the value above as `secret` in its JSON body, never in the address");
  assert.equal(/[?&]secret=/.test(r.json.result.read), false);
  const rg = await call(w.env, { op: "reviewgrant", token: w.S.ann, method: "POST", body: { draft: "D1" } });
  assert.equal(rg.status, 200, rg.text.slice(0, 200));
  assert.equal(rg.json.result.read, "a POST to op=reviewcopy with the value above as `secret` in its JSON body, never in the address");
  assert.equal(r.json.result.grant, "TRG-2026-0001");
  const inner = opCalls(w.env).filter((c) => c.route === "templatereviewgrant");
  assert.equal(inner.length, 1);
  /* R64 (N761): the digest in the internal request's body alone, never its query */
  assert.equal(inner[0].body.secretSha, sha(secret), "the store holds the digest of the value returned");
  assert.equal(Object.hasOwn(inner[0].params, "secretSha"), false);
  assert.equal(Object.hasOwn(inner[0].params, "bySecret"), false);
  assert.equal(JSON.stringify([inner[0].params, inner[0].body]).includes(secret), false, "the value never crosses");
  /* a second grant gets a fresh secret */
  const again = await call(w.env, { op: "templatereviewgrant", token: w.S.ann, method: "POST", body: { version: "TPL-1@1" } });
  assert.notEqual(again.json.result.secret, secret);
  /* negative controls: the module's refusal carries no secret, at 403; a store that did not answer is a silence */
  const refusing = world({ answer: (c) => (c.route === "templatereviewgrant" ? ok({ ok: false, reason: "NO_SUCH_TEMPLATE" }) : null) });
  const no = await call(refusing.env, { op: "templatereviewgrant", token: refusing.S.ann, method: "POST", body: {} });
  assert.equal(no.status, 403);
  assert.equal(no.json.reason, "NO_SUCH_TEMPLATE");
  assert.equal(no.text.includes("rv1_"), false);
  const silent = world({ answer: (c) => (c.route === "templatereviewgrant" ? new Response("not json") : null) });
  const s = await call(silent.env, { op: "templatereviewgrant", token: silent.S.ann, method: "POST", body: {} });
  assert.equal(s.status, 502);
  assert.equal(s.json.reason, "STORE_DID_NOT_ANSWER");
  assert.equal(s.text.includes("rv1_"), false);
});

test("R44: templateread, templatecomments, templatereview and templatecomment admit a caller holding a live template grant's secret, stamped secretSha (its SHA-256) and bySecret as reviewcopy's are, and nothing of the caller's own stamps reaches the store", async () => {
  for (const op of DOORS) {
    const w = world({ answer: store() });
    const r = await door(w, op, { params: { secret: LIVE, secretSha: hex64(), bySecret: "0", viewer: FORGED, author: FORGED, by: FORGED, store: "bio" },
                                  body: MUTATING.has(op) ? { version: "TPL-1@1", text: "x", secretSha: hex64(), author: FORGED, actorIdentity: FORGED } : undefined });
    assert.equal(r.status, 200, `${op}: ${r.text}`);
    assert.deepEqual([r.json.ok, r.json.through], [true, "grant"], op);
    const inner = opCalls(w.env);
    assert.equal(inner.length, 1, op);
    assert.equal(inner[0].route, op);
    assert.equal(inner[0].ns, "bio");
    assert.equal(inner[0].params.bySecret, "1", op);
    /* R64 (N761): the digest in the body alone, the mark `bySecret` in the query */
    assert.equal(inner[0].body?.secretSha, sha(LIVE), op);
    assert.equal(Object.hasOwn(inner[0].params, "secretSha"), false, op);
    assert.equal(inner[0].params.version, "TPL-1@1", op);
    for (const k of ["secret", "viewer", "author", "by", "token", "identity"]) assert.equal(Object.hasOwn(inner[0].params, k), false, `${op} ${k}`);
    if (MUTATING.has(op)) {
      assert.equal(inner[0].method, "POST");
      assert.deepEqual(inner[0].body, { version: "TPL-1@1", text: "x", secretSha: sha(LIVE) }, op);
    }
    assert.equal(JSON.stringify([inner[0].params, inner[0].body]).includes(LIVE), false, `${op}: the secret never crosses`);
  }
});

test("R44: every caller the grant does not admit receives filing-templates' dead answer NO_TEMPLATE_GRANT, byte-identical, at 404 — a revoked or foreign secret, an empty or malformed one, no secret and no credential, a binding class, an agent credential, an unknown token — at all four doors; nothing is asked of the store for a caller with neither a secret nor a session (negative control: a member's session is admitted, stamped viewer and author from the session, never the caller's)", async () => {
  const AGENT = aik();
  const texts = new Set();
  for (const op of DOORS) {
    const w = world({ answer: store(), creds: { [AGENT]: cred({ tokenId: "agent-x", principal: "member:ann", writes: [op] }) } });
    const bySecret = [REVOKED, `rv1_${hex64()}`, "", "not a secret at all", LIVE + " "];
    for (const secret of bySecret) {
      const r = await door(w, op, { params: { secret } });
      assert.equal(r.status, 404, `${op} secret=${JSON.stringify(secret)}: ${r.text}`);
      texts.add(r.text);
    }
    const strangers = [{}, { token: w.env.ADMIN_TOKEN }, { token: w.env.MEMBER_TOKEN }, { token: w.env.PROBE_TOKEN },
                       { token: w.env.DAEMON_TOKEN }, { token: AGENT }, { token: hex64() }, { token: "nonsense" }];
    for (const who of strangers) {
      w.env.calls.length = 0;
      const r = await door(w, op, who);
      assert.equal(r.status, 404, `${op} ${JSON.stringify(who)}: ${r.text}`);
      texts.add(r.text);
      assert.deepEqual(opCalls(w.env), [], `${op}: nothing is asked for a stranger`);
    }
    /* negative control: a member's session, and the founder's, are admitted, stamped from the session */
    for (const [token, viewer, author] of [[w.S.ann, "member:ann", "member:ann"], [w.S.founder, "admin", "member:admin"]]) {
      w.env.calls.length = 0;
      const r = await door(w, op, { token, params: { viewer: FORGED, author: FORGED, secretSha: sha(LIVE), bySecret: "1" } });
      assert.equal(r.status, 200, `${op}: ${r.text}`);
      assert.deepEqual([r.json.through, r.json.viewer, r.json.author], ["member", viewer, author], op);
      const inner = opCalls(w.env);
      assert.equal(inner.length, 1);
      assert.equal(Object.hasOwn(inner[0].params, "secretSha") || Object.hasOwn(inner[0].params, "bySecret"), false, op);
      assert.equal(Object.hasOwn(inner[0].body ?? {}, "secretSha"), false, op);
    }
  }
  /* one answer, whoever built it (the door for a stranger, the module for a dead secret) and whichever door was asked */
  assert.equal(texts.size, 1, [...texts].join("\n----\n"));
  const [text] = texts;
  assert.equal(text, JSON.stringify({ ok: false, ...noTemplateGrant() }));   /* compact since N630 (K1864 (1)) */
  const body = JSON.parse(text);
  assert.deepEqual([body.ok, body.reason, body.code, body.check], [false, "NO_TEMPLATE_GRANT", "NO_TEMPLATE_GRANT", "C-125.17"]);
  assert.equal(typeof body.translation, "string");
});

test("R44, R23: through the grant doors a store that did not answer is a silence (502 STORE_DID_NOT_ANSWER), never the dead answer; the store's own refusal is relayed at its status; a member refused by the module is answered its refusal, NO_SUCH_TEMPLATE at 404 (negative control: the same call answered is 200)", async () => {
  for (const op of DOORS) {
    const silent = world({ answer: (c) => (c.route === op ? new Response("<html>", { status: 500 }) : null) });
    for (const x of [{ params: { secret: LIVE } }, { token: silent.S.ann }]) {
      const r = await door(silent, op, x);
      assert.equal(r.status, 502, `${op}: ${r.text}`);
      assert.equal(r.json.reason, "STORE_DID_NOT_ANSWER");
      assert.equal(r.json.op, op);
    }
    const bad = world({ answer: (c) => (c.route === op ? new Response(JSON.stringify({ ok: false, reason: "BAD_JSON" }), { status: 400 }) : null) });
    const b = await door(bad, op, { params: { secret: LIVE } });
    assert.deepEqual([b.status, b.json.reason], [400, "BAD_JSON"], op);
    const absent = world({ answer: (c) => (c.route === op ? ok({ ok: false, reason: "NO_SUCH_TEMPLATE", template: "TPL-9" }) : null) });
    const a = await door(absent, op, { token: absent.S.ann });
    assert.deepEqual([a.status, a.json.ok, a.json.reason, a.json.check], [404, false, "NO_SUCH_TEMPLATE", "C-115.38"], op);
    const w = world({ answer: store() });
    assert.equal((await door(w, op, { token: w.S.ann })).status, 200, op);
  }
});
