/* control-plane: authentication and admission (R7–R16) and the gates' order (R28). Driven through `makeFetch(hooks)`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, defaultHooks, sha, hex64, aik, cred, member, refused } from "./harness.mjs";
import { PUBLISHED_TOKEN_HASHES } from "../../../src/tokens.mjs";

const { OPS, SESSION_OPS, NEEDS, UNATTENDED_BY_DECISION, GOVERNANCE_ACTIONS, IDENTITY_ACTIONS } = O;
const GATED = Object.keys(OPS).filter((k) => OPS[k].classes !== null);
const cls = async (env, token, params = {}) => (await call(env, { op: "whoami", token, params })).json?.result?.tokenClass ?? null;

async function published(value, fn) {
  const h = sha(value);
  PUBLISHED_TOKEN_HASHES.add(h);
  try { return await fn(); } finally { PUBLISHED_TOKEN_HASHES.delete(h); }
}

test("R7: a token equal to ADMIN_TOKEN, MEMBER_TOKEN, PROBE_TOKEN or DAEMON_TOKEN (in that order) gives that class, only while the binding is live; any other token gives none", async () => {
  const { env } = world();
  assert.equal(await cls(env, env.ADMIN_TOKEN), "admin");
  assert.equal(await cls(env, env.MEMBER_TOKEN), "member");
  assert.equal(await cls(env, env.PROBE_TOKEN), "probe");
  assert.equal((await call(env, { op: "monitor", token: env.DAEMON_TOKEN })).json.tokenClass, "daemon");
  assert.equal(await M.classify(env.DAEMON_TOKEN, env), "daemon");
  /* the order: one value bound twice is the earlier class */
  const same = world();
  same.env.MEMBER_TOKEN = same.env.ADMIN_TOKEN;
  same.env.DAEMON_TOKEN = same.env.PROBE_TOKEN;
  assert.equal(await cls(same.env, same.env.ADMIN_TOKEN), "admin");
  assert.equal(await M.classify(same.env.PROBE_TOKEN, same.env), "probe");
  /* not live: a published value can never authenticate (and its negative control: the same env, unpublished) */
  for (const k of ["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN", "DAEMON_TOKEN"]) {
    const v = env[k];
    assert.notEqual(await M.classify(v, env), null, k);
    await published(v, async () => {
      assert.equal(await M.classify(v, env), null, `${k} published`);
      refused(await call(env, { op: "selftest", token: v, params: k === "PROBE_TOKEN" ? { store: "scratch" } : {} }),
              401, "NOT_AUTHENTICATED", "C-38.1");
    });
  }
  /* not live: unset or empty bindings, and a caller presenting the empty string */
  const unset = world({ omit: ["MEMBER_TOKEN"] });
  unset.env.PROBE_TOKEN = "";
  assert.equal(await M.classify("", unset.env), null);
  assert.equal(await M.classify(undefined, unset.env), null);
  /* any other token */
  for (const t of [hex64(), "admin", env.ADMIN_TOKEN.toUpperCase(), `${env.ADMIN_TOKEN} `, env.ADMIN_TOKEN.slice(1)])
    assert.equal(await M.classify(t, env), null, t);
});

test("R8: an aik-<64 hex> token is resolved once per request against bio's credential rows; a 64-hex token is resolved as a session against bio; a store that does not answer either lookup is 502 STORE_DID_NOT_ANSWER", async () => {
  const { env, S, A } = world();
  /* ai: resolved once, in bio, even when the call addresses scratch — and the class carries principal, scope, confinement */
  for (const [op, params] of [["index", { store: "scratch" }], ["whoami", {}], ["reviewcopy", { draft: "D1" }]]) {
    env.calls.length = 0;
    const r = await call(env, { op, token: A.ann, params });
    assert.equal(r.status, 200, op);
    const looks = env.calls.filter((c) => c.route === "aicredentiallook");
    assert.equal(looks.length, 1, `${op}: one lookup`);
    assert.equal(looks[0].ns, "bio");
    assert.equal(looks[0].params.sha, sha(A.ann), "the lookup carries the SHA-256, never the value");
    assert.ok(!env.calls.some((c) => c.route === "session"), "an agent credential never falls into the session lookup");
  }
  const who = (await call(env, { op: "whoami", token: A.confined, params: { store: "scratch" } })).json.result;
  assert.deepEqual([who.tokenClass, who.confinedTo], ["ai", "scratch"]);
  /* a reviewcopy read by an agent is stamped with its principal */
  env.calls.length = 0;
  await call(env, { op: "reviewcopy", token: A.ann, params: { draft: "D1" } });
  assert.equal(opCalls(env)[0].params.viewer, "member:ann");
  /* an unknown agent credential is no class */
  env.calls.length = 0;
  refused(await call(env, { op: "index", token: aik() }), 401, "NOT_AUTHENTICATED", "C-38.1");
  assert.deepEqual(env.calls.map((c) => c.route), ["aicredentiallook"]);
  /* session: resolved in bio even when the call addresses scratch */
  env.calls.length = 0;
  const s = await call(env, { op: "index", token: S.ann, params: { store: "scratch" } });
  assert.equal(s.json.store, "scratch");
  const sl = env.calls.filter((c) => c.route === "session");
  assert.deepEqual(sl.map((c) => [c.ns, c.params.t]), [["bio", S.ann]]);
  assert.ok(!env.calls.some((c) => c.route === "aicredentiallook"), "a session token never reaches the credential lookup");
  refused(await call(env, { op: "index", token: hex64() }), 401, "NOT_AUTHENTICATED", "C-38.1");
  /* silences: non-JSON, ok:false and a thrown store — never a statement about the caller */
  const silences = [() => new Response("<html>oops"), () => new Response(JSON.stringify({ ok: false, error: "x" }), { status: 500 }),
                    () => new Response(JSON.stringify({ ok: "true", result: {} }))];
  for (const bad of silences) for (const [route, token] of [["session", "S"], ["aicredentiallook", "A"]]) {
    const w = world({ answer: (c) => (c.route === route ? bad() : null) });
    const t = token === "S" ? w.S.ann : w.A.ann;
    for (const op of ["index", "reviewcopy"]) {
      w.env.calls.length = 0;
      const r = await call(w.env, { op, token: t, params: { draft: "D1" } });
      refused(r, 502, "STORE_DID_NOT_ANSWER", "C-69.2");
      assert.equal(r.json.op, route);
      assert.equal(opCalls(w.env).length, 0);
    }
  }
});

test("R9: a caller with no class is refused 401 NOT_AUTHENTICATED (C-38.1); nothing is forwarded", async () => {
  const { env, S } = world();
  for (const token of [undefined, "", "nope", hex64(), aik(), `${S.ann}x`]) for (const op of ["index", "promote", "whoami"]) {
    env.calls.length = 0;
    const r = await call(env, { op, token, method: "POST", body: {} });
    refused(r, 401, "NOT_AUTHENTICATED", "C-38.1");
    assert.equal(opCalls(env).length, 0);
  }
  /* negative control: a class is admitted */
  assert.equal((await call(env, { op: "index", token: env.MEMBER_TOKEN })).status, 200);
  assert.equal((await call(env, { op: "index", token: S.ann })).status, 200);
});

test("R10: a session reaching a mutating op outside its kind's set is refused 403 by why (C-38.7 reachedBy, C-38.3 citing the decision, C-38.8); capture's GET is a read; a session asking export is refused ROOT_OF_TRUST_REQUIRED (C-38.4)", async () => {
  const { env, S } = world();
  const drive = async (op, token, method = "POST") => {
    env.calls.length = 0;
    const r = await call(env, { op, token, method, body: method === "POST" ? {} : undefined });
    return r;
  };
  /* (b): the other kind's set holds it — founder's reserve, and (with the tables arranged so) a member's */
  const onlyAdmin = GATED.filter((k) => OPS[k].mutating && SESSION_OPS.admin.has(k) && !SESSION_OPS.member.has(k));
  assert.ok(onlyAdmin.length > 0);
  for (const op of onlyAdmin) {
    const r = await drive(op, S.ann);
    refused(r, 403, "SESSION_ROLE_CANNOT_REACH_OP", "C-38.7");
    assert.deepEqual([r.json.reachedBy, r.json.session, r.json.op], ["founder", "member", op]);
    assert.equal(opCalls(env).length, 0);
    assert.notEqual((await drive(op, S.founder)).json.reason, "SESSION_ROLE_CANNOT_REACH_OP", `${op}: founder admitted`);
  }
  SESSION_OPS.admin.delete("lease");
  try {
    const r = await drive("lease", S.founder);
    refused(r, 403, "SESSION_ROLE_CANNOT_REACH_OP", "C-38.7");
    assert.deepEqual([r.json.reachedBy, r.json.session], ["member", "admin"]);
    assert.equal(opCalls(env).length, 0);
    assert.equal((await drive("lease", S.ann)).status, 200, "negative control: the member's session is admitted");
  } finally { SESSION_OPS.admin.add("lease"); }
  /* (a): a recorded decision — each one cited */
  for (const [op, recorded] of Object.entries(UNATTENDED_BY_DECISION)) for (const t of [S.ann, S.founder]) {
    const r = await drive(op, t);
    refused(r, 403, "MACHINE_CREDENTIAL_REQUIRED", "C-38.3");
    assert.equal(r.json.recorded, recorded);
    assert.equal(opCalls(env).length, 0);
  }
  /* (c): no decision recorded */
  const saved = UNATTENDED_BY_DECISION.purge;
  delete UNATTENDED_BY_DECISION.purge;
  try {
    const r = await drive("purge", S.ann);
    refused(r, 403, "SESSION_ROUTE_NOT_RECORDED", "C-38.8");
    assert.equal(r.json.recorded, undefined);
    assert.equal(opCalls(env).length, 0);
  } finally { UNATTENDED_BY_DECISION.purge = saved; }
  const direct = await M.sessionOpGate("member", "nosuchverb", { mutating: true }, "POST").json();
  assert.equal(direct.reason, "SESSION_ROUTE_NOT_RECORDED");
  /* negative controls: a session inside its set, and every non-mutating op, pass this gate */
  assert.equal((await drive("lease", S.ann)).status, 200);
  for (const op of GATED.filter((k) => !OPS[k].mutating)) {
    const r = await drive(op, S.ann, "GET");
    assert.ok(!["SESSION_ROLE_CANNOT_REACH_OP", "MACHINE_CREDENTIAL_REQUIRED", "SESSION_ROUTE_NOT_RECORDED"].includes(r.json?.reason), op);
  }
  /* capture's GET is a read (the table arranged so no member set holds capture) */
  SESSION_OPS.member.delete("capture");
  try {
    assert.equal((await drive("capture", S.ann, "GET")).status, 200);
    refused(await drive("capture", S.ann, "POST"), 403, "SESSION_ROLE_CANNOT_REACH_OP", "C-38.7");
  } finally { SESSION_OPS.member.add("capture"); }
  /* export */
  for (const t of [S.ann, S.founder]) {
    const r = await drive("export", t);
    refused(r, 403, "ROOT_OF_TRUST_REQUIRED", "C-38.4");
    assert.equal(opCalls(env).length, 0);
  }
  assert.equal((await drive("export", env.ADMIN_TOKEN)).status, 200, "negative control: the root of trust exports");
});

test("R11: a binding class not in the op's classes is refused 403 CLASS_FORBIDDEN (C-38.2); a caller not arriving by a session is judged by machineClasses where the spec gives it", async () => {
  const { env, S } = world();
  const bindings = { admin: env.ADMIN_TOKEN, member: env.MEMBER_TOKEN, probe: env.PROBE_TOKEN, daemon: env.DAEMON_TOKEN };
  for (const op of GATED) {
    if (GOVERNANCE_ACTIONS.includes(op) || IDENTITY_ACTIONS.includes(op)) continue;   /* R14 answers those next */
    const spec = OPS[op];
    for (const [c, token] of Object.entries(bindings)) {
      env.calls.length = 0;
      const r = await call(env, { op, token, params: c === "probe" ? { store: "scratch" } : {}, method: "POST", body: {} });
      const admitted = (Array.isArray(spec.machineClasses) ? spec.machineClasses : spec.classes).includes(c);
      if (admitted) assert.notEqual(r.json?.reason, "CLASS_FORBIDDEN", `${op}/${c}`);
      else {
        refused(r, 403, "CLASS_FORBIDDEN", "C-38.2");
        assert.deepEqual([r.json.op, r.json.cls], [op, c]);
        assert.equal(opCalls(env).length, 0);
      }
    }
  }
  /* a session is judged by classes, not machineClasses: the enrolled member's session reaches memberadd, the bearer does not */
  const mc = GATED.filter((k) => Array.isArray(OPS[k].machineClasses) && OPS[k].classes.includes("member")
                               && !OPS[k].machineClasses.includes("member") && SESSION_OPS.member.has(k));
  assert.ok(mc.includes("memberadd"));
  for (const op of mc) {
    assert.equal((await call(env, { op, token: env.MEMBER_TOKEN, method: "POST", body: {} })).json.reason, "CLASS_FORBIDDEN", op);
    assert.notEqual((await call(env, { op, token: S.ann, method: "POST", body: {} })).json.reason, "CLASS_FORBIDDEN", op);
  }
  /* a session whose kind the op's classes lack */
  for (const op of GATED.filter((k) => !OPS[k].mutating && !OPS[k].classes.includes("member"))) {
    refused(await call(env, { op, token: S.ann }), 403, "CLASS_FORBIDDEN", "C-38.2");
  }
});

test("R12: an ai caller is refused AI_CREDENTIAL_REVOKED (C-29.7) when withdrawn, and AI_BEYOND_TASK_SCOPE (C-29.6) when no member reaches the op or the op is mutating and not among its declared writes", async () => {
  const all = GATED;
  const { env, A } = world();
  const wide = aik();
  const w2 = world({ creds: { [wide]: cred({ tokenId: "wide", writes: all }) } });
  for (const op of all) {
    const reach = M.aiReachesAsMember(OPS[op], op);
    if (GOVERNANCE_ACTIONS.includes(op) || IDENTITY_ACTIONS.includes(op)) assert.equal(reach, false, `${op}: D-586`);
    if (!Array.isArray(OPS[op].classes) || !OPS[op].classes.includes("member")) assert.equal(reach, false, op);
    for (const [e, token, writes] of [[env, A.ann, []], [w2.env, wide, all]]) {
      e.calls.length = 0;
      const r = await call(e, { op, token, method: "POST", body: {} });
      const want = !reach || (OPS[op].mutating && !writes.includes(op));
      if (want) {
        refused(r, 403, "AI_BEYOND_TASK_SCOPE", "C-29.6");
        assert.deepEqual([r.json.op, r.json.cls], [op, "ai"]);
        assert.equal(opCalls(e).length, 0);
      } else assert.ok(!String(r.json?.reason).startsWith("AI_"), `${op}: admitted`);
    }
  }
  env.calls.length = 0;
  const rv = await call(env, { op: "index", token: A.revoked });
  refused(rv, 403, "AI_CREDENTIAL_REVOKED", "C-29.7");
  assert.equal(rv.json.tokenId, "agent-old");
  assert.equal(opCalls(env).length, 0);
  /* negative control: the same op for a live credential */
  assert.equal((await call(env, { op: "index", token: A.ann })).status, 200);
});

test("R13: a session missing the op's capability is refused 403 NOT_CAPABLE (C-38.5) naming needs and held; a binding class holds none and is bounded by R11 alone", async () => {
  const lack = hex64(), some = hex64();
  const { env, S } = world({ sessions: { [lack]: member("bea", []), [some]: member("cy", ["publish", "contribute"]) } });
  const needing = GATED.filter((k) => NEEDS[k] && (SESSION_OPS.member.has(k) || !OPS[k].mutating) && OPS[k].classes.includes("member"));
  assert.ok(needing.length > 5);
  for (const op of needing) {
    env.calls.length = 0;
    const r = await call(env, { op, token: lack, method: "POST", body: {} });
    refused(r, 403, "NOT_CAPABLE", "C-38.5");
    assert.deepEqual([r.json.op, r.json.needs, r.json.held], [op, NEEDS[op], []]);
    assert.equal(opCalls(env).length, 0);
    /* negative controls: the session holding every capability, and the member binding class */
    assert.notEqual((await call(env, { op, token: S.ann, method: "POST", body: {} })).json?.reason, "NOT_CAPABLE", op);
    assert.notEqual((await call(env, { op, token: env.MEMBER_TOKEN, method: "POST", body: {} })).json?.reason, "NOT_CAPABLE", op);
  }
  const r = await call(env, { op: "promote", token: some, params: { x: 1 }, method: "POST", body: {} });
  assert.equal(r.status, 200);
  const cpOp = needing.find((k) => NEEDS[k] === "create_projects");
  if (cpOp) {
    const held = await call(env, { op: cpOp, token: some, method: "POST", body: {} });
    refused(held, 403, "NOT_CAPABLE", "C-38.5");
    assert.deepEqual(held.json.held, ["contribute", "publish"], "held is sorted");
  }
  /* capture's GET is a read here too */
  assert.equal((await call(env, { op: "capture", token: lack, method: "GET" })).status, 200);
  refused(await call(env, { op: "capture", token: lack, method: "POST", body: {} }), 403, "NOT_CAPABLE", "C-38.5");
});

test("R14: a bearer asking for adminendorse, adminremove or membercaps is refused 403 OPERATOR_TOKEN_CANNOT_GOVERN (C-32.17); for groupnameset or groupdomainset GROUP_IDENTITY_NEEDS_SESSION (C-64.4); each names the class", async () => {
  const { env, S } = world();
  assert.deepEqual([...GOVERNANCE_ACTIONS].sort(), ["adminendorse", "adminremove", "membercaps"]);
  assert.deepEqual([...IDENTITY_ACTIONS].sort(), ["groupdomainset", "groupnameset"]);
  const bearers = { admin: env.ADMIN_TOKEN, member: env.MEMBER_TOKEN, probe: env.PROBE_TOKEN };
  for (const [op, code, check] of [...GOVERNANCE_ACTIONS.map((o) => [o, "OPERATOR_TOKEN_CANNOT_GOVERN", "C-32.17"]),
                                   ...IDENTITY_ACTIONS.map((o) => [o, "GROUP_IDENTITY_NEEDS_SESSION", "C-64.4"])]) {
    for (const [c, token] of Object.entries(bearers)) {
      env.calls.length = 0;
      const r = await call(env, { op, token, params: c === "probe" ? { store: "scratch" } : {}, method: "POST", body: {} });
      refused(r, 403, code, check);
      assert.deepEqual([r.json.op, r.json.tokenClass], [op, c]);
      assert.match(r.json.detail, new RegExp(`\`${c}\`-class`));
      assert.equal(opCalls(env).length, 0);
    }
    /* negative control: the same act from a signed-in session is admitted and forwarded with the server's `by` */
    for (const [t, by] of [[S.founder, "admin"], [S.ann, "ann"]]) {
      env.calls.length = 0;
      const ok = await call(env, { op, token: t, method: "POST", body: {} });
      assert.equal(ok.status, 200, op);
      assert.equal(opCalls(env)[0].params.by, by);
    }
  }
});

test("R15: claim is checked against the bootstrap credential first: unset 409 (C-68.2), published 409 (C-68.3), a differing bootstrapToken 403 (C-68.4); the claim carries the fingerprint, never the value", async () => {
  const unset = world({ omit: ["ADMIN_TOKEN"] });
  refused(await call(unset.env, { op: "claim", method: "POST", body: { bootstrapToken: "x", password: "p" } }), 409, "BOOTSTRAP_CREDENTIAL_UNSET", "C-68.2");
  const empty = world(); empty.env.ADMIN_TOKEN = "";
  refused(await call(empty.env, { op: "claim", method: "POST", body: { bootstrapToken: "", password: "p" } }), 409, "BOOTSTRAP_CREDENTIAL_UNSET", "C-68.2");
  const { env } = world();
  await published(env.ADMIN_TOKEN, async () =>
    refused(await call(env, { op: "claim", method: "POST", body: { bootstrapToken: env.ADMIN_TOKEN, password: "p" } }),
            409, "BOOTSTRAP_CREDENTIAL_PUBLISHED", "C-68.3"));
  for (const bt of [undefined, "", env.MEMBER_TOKEN, env.ADMIN_TOKEN.toUpperCase(), `${env.ADMIN_TOKEN} `])
    refused(await call(env, { op: "claim", method: "POST", body: { bootstrapToken: bt, password: "p" } }), 403, "BOOTSTRAP_CREDENTIAL_MISMATCH", "C-68.4");
  assert.equal(unset.env.calls.length + empty.env.calls.length + env.calls.length, 0, "membership.claim never ran");
  /* negative control: the matching credential reaches the claim, which carries the fingerprint and not the value */
  const ok = await call(env, { op: "claim", method: "POST", body: { bootstrapToken: env.ADMIN_TOKEN, password: "pw" } });
  assert.equal(ok.status, 200);
  const [c] = env.calls;
  assert.deepEqual([c.ns, c.route, c.params.fp], ["bio", "claim", sha(env.ADMIN_TOKEN).slice(0, 16)]);
  assert.equal(JSON.stringify(c.body).includes(env.ADMIN_TOKEN) || c.url.href.includes(env.ADMIN_TOKEN), false);
  assert.equal(await M.fingerprint(env.ADMIN_TOKEN), sha(env.ADMIN_TOKEN).slice(0, 16));
});

/* A drive-provenance capture this promotion registers, whose bytes the record holds, naming this bundle and revision. */
function replayWorld({ holdBytes = true, target = "B-1", listSha = null, register = true, badDigest = false } = {}) {
  const text = "---\nobject_type: note\ntitle: t\n---\nbody\n";
  const mdSha = sha(text);
  const prov = JSON.stringify({ promotions: [{ key: "p1", record: { target, files: [{ name: "bundle.md", sha256: listSha ?? mdSha }] } }] });
  const bytes = new TextEncoder().encode(prov);
  const cap = sha(prov);
  const w = world();
  w.env.CAPTURES = { async get(k) {
    if (!holdBytes || k !== `bio/captures/${cap}`) return null;
    const b = badDigest ? new TextEncoder().encode(prov + " ") : bytes;
    return { arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
  } };
  const body = { bundleId: "B-1", base: "rev0", replay: true, provenanceCapture: cap,
                 register: register ? [{ sha256: cap, path: M.DRIVE_PROVENANCE_PATH }] : [],
                 files: [{ path: "bundle.md", text, sha256: mdSha }] };
  return { ...w, body };
}

test("R16: an asserted replay is kept only for the admin class without a session and only when the drive-provenance capture verifies; otherwise refused REPLAY_UNVERIFIED (C-66.6) before the store is called, and any other caller's replay is deleted", async () => {
  const promoteCalls = (env) => opCalls(env).filter((c) => c.route === "promote");
  /* kept */
  const ok = replayWorld();
  assert.equal((await call(ok.env, { op: "promote", token: ok.env.ADMIN_TOKEN, method: "POST", body: ok.body })).status, 200);
  assert.equal(promoteCalls(ok.env)[0].body.replay, true);
  /* each condition removed: refused by name, nothing written */
  for (const bad of [{ holdBytes: false }, { target: "B-2" }, { listSha: "0".repeat(64) }, { register: false }, { badDigest: true }]) {
    const w = replayWorld(bad);
    const r = await call(w.env, { op: "promote", token: w.env.ADMIN_TOKEN, method: "POST", body: w.body });
    refused(r, 403, "REPLAY_UNVERIFIED", "C-66.6");
    assert.equal(r.json.op, "promote");
    assert.equal(promoteCalls(w.env).length, 0, JSON.stringify(bad));
  }
  const noCap = replayWorld();
  delete noCap.body.provenanceCapture;
  refused(await call(noCap.env, { op: "promote", token: noCap.env.ADMIN_TOKEN, method: "POST", body: noCap.body }), 403, "REPLAY_UNVERIFIED", "C-66.6");
  /* every other caller's replay is deleted — verified bytes or not — and the promotion goes on as an ordinary one */
  for (const verified of [true, false]) {
    const w = replayWorld(verified ? {} : { holdBytes: false });
    for (const [token, params] of [[w.env.MEMBER_TOKEN, {}], [w.env.PROBE_TOKEN, { store: "scratch" }], [w.S.founder, {}], [w.S.ann, {}]]) {
      w.env.calls.length = 0;
      const r = await call(w.env, { op: "promote", token, params, method: "POST", body: w.body });
      assert.equal(r.status, 200);
      assert.equal("replay" in promoteCalls(w.env)[0].body, false);
    }
  }
  /* the admin class asserting nothing keeps nothing */
  const plain = replayWorld();
  delete plain.body.replay;
  await call(plain.env, { op: "promote", token: plain.env.ADMIN_TOKEN, method: "POST", body: plain.body });
  assert.equal("replay" in promoteCalls(plain.env)[0].body, false);
});

test("R28: the gates run in one order — R3, R4, R5, the public ops, R7–R8 with R10's session gate, R9, R11/R12, R13, R6's scope refusal, then R14 and R16 — and nothing is forwarded when a gate refuses", async () => {
  const { env, S, A } = world();
  const log = [];
  const hooks = defaultHooks(log);
  const drive = async (req, code) => {
    env.calls.length = 0; log.length = 0;
    const r = await call(env, { hooks, method: "POST", body: {}, ...req });
    assert.equal(r.json?.reason, code, `${JSON.stringify(req.params ?? {})} ${req.op}: ${r.text.slice(0, 200)}`);
    assert.equal(opCalls(env).length + log.length, 0, "nothing forwarded and no handler ran");
    return r;
  };
  /* R3 before R4 (and before the credential is even looked up) */
  await drive({ op: "index", token: A.confined, params: { store: "nope" } }, "NAMESPACE_UNKNOWN");
  assert.equal(env.calls.length, 0);
  /* R4 before R5: the confined credential is set to scratch, and the pinned public op then refuses */
  await drive({ op: "knock", token: A.confined }, "NAMESPACE_PINNED");
  await drive({ op: "knock", token: A.confined, params: { store: "bio" } }, "NAMESPACE_CONFINED");
  /* R5 before the public op (R15's claim among them) */
  const unset = world({ omit: ["ADMIN_TOKEN"] });
  const u = await call(unset.env, { op: "claim", params: { store: "scratch" }, method: "POST", body: {} });
  assert.equal(u.json.reason, "NAMESPACE_PINNED");
  /* the public ops before R7–R9: an unknown token does not stop a public op */
  env.calls.length = 0; log.length = 0;
  assert.equal((await call(env, { op: "knock", token: "garbage", hooks, method: "POST", body: {} })).json.publicOp, "knock");
  /* R10's session gate before R11: the member session asking a founder-only op whose classes also lack member */
  const both = GATED.find((k) => OPS[k].mutating && SESSION_OPS.admin.has(k) && !SESSION_OPS.member.has(k) && !OPS[k].classes.includes("member"));
  assert.ok(both);
  await drive({ op: both, token: S.ann }, "SESSION_ROLE_CANNOT_REACH_OP");
  /* R10's export refusal before R11 and R13 for a session */
  await drive({ op: "export", token: S.bare }, "ROOT_OF_TRUST_REQUIRED");
  /* R11 before R6's scope refusal: probe asking an op it lacks, in bio */
  const notProbe = GATED.find((k) => !OPS[k].classes.includes("probe") && OPS[k].classes.includes("member") && !Array.isArray(OPS[k].machineClasses));
  await drive({ op: notProbe, token: env.PROBE_TOKEN, params: { store: "bio" } }, "CLASS_FORBIDDEN");
  /* R12 before R14: an agent asking a governance act */
  const wide = aik();
  const w2 = world({ creds: { [wide]: cred({ writes: [...GOVERNANCE_ACTIONS] }) } });
  const g = await call(w2.env, { op: "adminendorse", token: wide, method: "POST", body: {} });
  assert.equal(g.json.reason, "AI_BEYOND_TASK_SCOPE");
  /* R11 before R14: daemon asking a governance act */
  await drive({ op: "adminendorse", token: env.DAEMON_TOKEN }, "CLASS_FORBIDDEN");
  /* R13 before R14/R16: a session without contribute asking promote with a replay */
  const bare = await drive({ op: "promote", token: S.bare, body: { replay: true } }, "NOT_CAPABLE");
  assert.equal(bare.json.needs, "contribute");
  /* R6 before R14 and R16 */
  await drive({ op: "adminendorse", token: env.PROBE_TOKEN, params: { store: "bio" } }, "SCOPE_REFUSED");
  await drive({ op: "promote", token: env.PROBE_TOKEN, params: { store: "bio" }, body: { replay: true } }, "SCOPE_REFUSED");
  /* negative controls: each request with its first failing condition removed meets the next gate, not the first */
  await drive({ op: "adminendorse", token: env.PROBE_TOKEN, params: { store: "scratch" } }, "OPERATOR_TOKEN_CANNOT_GOVERN");
  env.calls.length = 0;
  assert.equal((await call(env, { op: notProbe, token: env.MEMBER_TOKEN, params: { store: "bio" } })).status, 200);
});

test("R28: R14's refusals come before the op — a module handler (hooks.gatedOp) willing to serve every op is never asked when a fence refuses", async () => {
  const w = replayWorld({ holdBytes: false });
  const { env } = w;
  const asked = [];
  const hooks = { publicOp: async () => M.json({ ok: true }),
                  gatedOp: async (c) => { asked.push(c.op); return M.json({ ok: true, servedBy: "hook", op: c.op }); } };
  for (const [op, token, params, code] of [["adminendorse", env.ADMIN_TOKEN, {}, "OPERATOR_TOKEN_CANNOT_GOVERN"],
                                           ["membercaps", env.MEMBER_TOKEN, {}, "OPERATOR_TOKEN_CANNOT_GOVERN"],
                                           ["groupnameset", env.PROBE_TOKEN, { store: "scratch" }, "GROUP_IDENTITY_NEEDS_SESSION"]]) {
    asked.length = 0; env.calls.length = 0;
    const r = await call(env, { op, token, params, hooks, method: "POST", body: w.body });
    assert.equal(r.json.reason, code, op);
    assert.deepEqual(asked, [], `${op}: the handler ran before the refusal`);
    assert.equal(opCalls(env).length, 0);
  }
  /* negative controls: with the fence's condition removed the handler is asked */
  asked.length = 0;
  assert.equal((await call(env, { op: "adminendorse", token: w.S.founder, hooks, method: "POST", body: {} })).json.servedBy, "hook");
});

test.todo("R28 R16's replay refusal comes before the op (not yet met: control-plane/index.mjs still asks hooks.gatedOp "
  + "(after the R14 fences) before R16's REPLAY_UNVERIFIED check in the promote block, so a module handler serving promote "
  + "would run for an unverified replay; driven: a gatedOp hook answering every op answers promote with replay:true and "
  + "no provenance for the ADMIN_TOKEN bearer. Harmless while no gated arm serves promote, but the order is not the "
  + "module's to rely on)");
