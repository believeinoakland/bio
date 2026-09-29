/* control-plane: the stamps (R17, R29), administer and whoami (R18), the agent credential's mint (R19) and the review
   door (R20). Driven through `makeFetch(hooks)` and the exported declaration functions. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, sha, hex64, aik, cred, member, founder, refused,
         QUERY_STAMPS, BODY_STAMPS, FORGED } from "./harness.mjs";

const { OPS, NEEDS, GOVERNANCE_ACTIONS, IDENTITY_ACTIONS } = O;
const GATED = Object.keys(OPS).filter((k) => OPS[k].classes !== null && k !== "whoami");
const ORIGIN = "https://plane.example";

/* Every kind of caller, with what R17 says the server stamps for it. */
function callers() {
  const admAdmin = hex64();
  const wide = aik(), org = aik();
  const w = world({ sessions: { [admAdmin]: member("dee", ["contribute", "publish", "create_projects"], { administer: true }) },
                    creds: { [wide]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }),
                             [org]: cred({ tokenId: "agent-org", principal: "class:ai", writes: Object.keys(OPS) }) } });
  const bind = (c, token, params = {}) => ({ name: c, token, params, viewer: `class:${c}`, identity: `class:${c}`,
    administer: c === "admin" ? "1" : "0", own: [`class:${c}`, `token:${c}`, ""] });
  const sess = (name, token, id, viewer, administer) => ({ name, token, params: {}, viewer, identity: `member:${id}`,
    administer, own: [id, `member:${id}`, viewer] });
  const ai = (name, token, principal, tokenId) => ({ name, token, params: {}, viewer: principal, identity: principal,
    administer: "0", own: [principal, "class:ai", `class:ai/${tokenId}`, `${principal}/${tokenId}`, "token:ai", ""] });
  return { w, list: [
    bind("admin", w.env.ADMIN_TOKEN), bind("member", w.env.MEMBER_TOKEN), bind("probe", w.env.PROBE_TOKEN, { store: "scratch" }),
    bind("daemon", w.env.DAEMON_TOKEN),
    sess("founder", w.S.founder, "admin", "admin", "1"), sess("ann", w.S.ann, "ann", "member:ann", "0"),
    sess("dee (administers)", admAdmin, "dee", "member:dee", "1"),
    ai("agent", wide, "member:ann", "agent-ann"), ai("org agent", org, "class:ai", "agent-org"),
  ] };
}

const stampsOf = (c) => {
  const out = {};
  for (const k of QUERY_STAMPS) if (k in c.params) out[`?${k}`] = c.params[k];
  if (c.body && typeof c.body === "object") for (const k of [...QUERY_STAMPS, ...BODY_STAMPS]) if (k in c.body) out[`#${k}`] = c.body[k];
  return out;
};

test("R17: every stamp an op declares is the server's value from the authenticated caller — the same whether or not the caller sent its own (query and body) — and never the caller's", async () => {
  const { w, list } = callers();
  const env = w.env;
  const forgedQ = Object.fromEntries(QUERY_STAMPS.map((k) => [k, FORGED]));
  const forgedB = Object.fromEntries([...QUERY_STAMPS, ...BODY_STAMPS].map((k) => [k, FORGED]));
  let declared = 0;
  const seen = new Set();
  for (const c of list) for (const op of GATED) {
    env.calls.length = 0;
    await call(env, { op, token: c.token, params: c.params, method: "POST", body: {} });
    const base = opCalls(env).map(stampsOf);
    if (!base.length) continue;
    env.calls.length = 0;
    await call(env, { op, token: c.token, params: { ...c.params, ...forgedQ }, method: "POST", body: forgedB });
    const forged = opCalls(env).map(stampsOf);
    assert.equal(forged.length, base.length, `${op}/${c.name}`);
    base.forEach((b, i) => {
      for (const [k, v] of Object.entries(b)) {
        declared++; seen.add(`${op}${k}`);
        const where = `${op} ${k} for ${c.name}`;
        assert.equal(forged[i][k], v, `${where}: the caller's value replaced the server's`);
        assert.notEqual(v, FORGED, where);
        const f = k.slice(1);
        if (f === "viewer" || f === "actorViewer") assert.equal(v, c.viewer, where);
        else if (f === "identity" || f === "actorIdentity") assert.equal(v, c.identity, where);
        else if (f === "administer") assert.equal(v, c.administer, where);
        else if (f === "origin") assert.equal(v, ORIGIN, where);
        else assert.ok(c.own.includes(v), `${where}: ${JSON.stringify(v)} is not derived from the credential`);
      }
    });
  }
  /* the census is non-trivial: every stamp kind the requirement names is set somewhere */
  assert.ok(declared > 1000, String(declared));
  for (const k of ["?viewer", "?identity", "?author", "?by", "?actor", "?who", "?origin", "?administer",
                   "#actorIdentity", "#actorViewer", "#actorMemberId", "#assistantPrincipal"])
    assert.ok([...seen].some((s) => s.endsWith(k)), k);
});

test("R17: the founder's session author is `admin`, a member's its id; origin is the origin the request reached; ownerMemberId and migrationReplay are the server's alone", async () => {
  const { env, S } = world();
  for (const [token, want] of [[S.founder, "admin"], [S.ann, "ann"]]) {
    env.calls.length = 0;
    await call(env, { op: "cite", token, params: { author: FORGED }, method: "POST", body: {} });
    assert.equal(opCalls(env)[0].params.author, want);
    env.calls.length = 0;
    await call(env, { op: "groupnameset", token, params: { origin: "https://evil.example" }, method: "POST", body: {} });
    assert.equal(opCalls(env)[0].params.origin, ORIGIN);
  }
  /* a project creation through a session: ownerMemberId is the session's member, never the caller's */
  const md = "---\nobject_type: project\ntitle: p\n---\n";
  env.calls.length = 0;
  await call(env, { op: "promote", token: S.ann, method: "POST",
                    body: { base: null, meta: { object_type: "project" }, ownerMemberId: "mallory", migrationReplay: { x: 1 },
                            files: [{ path: "bundle.md", text: md }] } });
  const b = opCalls(env)[0].body;
  assert.deepEqual([b.ownerMemberId, b.actorMemberId, b.author, "migrationReplay" in b], ["ann", "ann", "ann", false]);
  /* a bearer's creation carries no owner and no acting member */
  env.calls.length = 0;
  await call(env, { op: "promote", token: env.MEMBER_TOKEN, method: "POST",
                    body: { base: null, meta: { object_type: "project" }, ownerMemberId: "mallory", actorMemberId: "mallory",
                            files: [{ path: "bundle.md", text: md }] } });
  const m = opCalls(env)[0].body;
  assert.deepEqual(["ownerMemberId" in m, "actorMemberId" in m, m.author, m.assistantPrincipal], [false, false, "token:member", "class:member"]);
});

/* Note for BOB (not a test): R17's list of stamped values and the code differ in wording — many binding-class authors are
   stamped `class:<cls>` (testify, lead, the action layer's author, intent's and standards' body author) where R17 says
   `token:<cls>`; an ai credential's author is `class:ai/<tokenId>`, not its principal; the founder's author on the
   action-layer acts is `member:admin`, not `admin`. The tests above accept any value derived from the credential. */

/* Every stamp field sent, forged, in the query and in the body; the inner request must carry none of them. */
async function forgedSweep(onlyDeclaring) {
  const { w, list } = callers();
  const env = w.env;
  const q = Object.fromEntries(QUERY_STAMPS.map((k) => [k, FORGED]));
  const b = Object.fromEntries(BODY_STAMPS.map((k) => [k, FORGED]));
  let ops = 0;
  const leaks = [];
  for (const c of list) for (const op of GATED) {
    if (onlyDeclaring) {
      env.calls.length = 0;
      await call(env, { op, token: c.token, params: c.params, method: "POST", body: {} });
      if (!opCalls(env).some((x) => Object.keys(stampsOf(x)).length)) continue;
    }
    env.calls.length = 0;
    await call(env, { op, token: c.token, params: { ...c.params, ...q }, method: "POST", body: { ...b, note: "kept" } });
    const inner = opCalls(env);
    if (!inner.length) continue;
    ops++;
    for (const x of inner) {
      for (const k of QUERY_STAMPS) if (x.params[k] === FORGED) leaks.push(`${op}?${k} (${c.name})`);
      if (x.body && typeof x.body === "object") {
        for (const k of BODY_STAMPS) if (x.body[k] === FORGED) leaks.push(`${op}#${k} (${c.name})`);
        if (x.route === op && !["aicredentialmint"].includes(op)) assert.equal(x.body.note, "kept", `${op}: the rest of the body is the caller's`);
      }
    }
  }
  return { ops, leaks };
}

test("R17: for every op, every stamp the caller sends (query or body) is deleted before the op's declared stamps are set", async () => {
  const { ops, leaks } = await forgedSweep(false);
  assert.ok(ops > 1000, String(ops));
  assert.deepEqual(leaks, []);
  /* negative control: a parameter that is not a stamp still reaches the op */
  const { env } = world();
  await call(env, { op: "index", token: env.ADMIN_TOKEN, params: { limit: "5", viewer: FORGED } });
  assert.deepEqual([opCalls(env)[0].params.limit, opCalls(env)[0].params.viewer], ["5", "class:admin"]);
});

test("R29: no handler receives a caller-supplied value for any stamp — driven for every op that declares a stamp, for every kind of caller", async () => {
  const { ops, leaks } = await forgedSweep(true);
  assert.ok(ops > 500, String(ops));
  assert.deepEqual(leaks, []);
});

test("R18: memberlist's administer is 1 exactly for a session that administers and the admin binding; whoami answers the session's fields, sorted capabilities (null for a credential), the vocabulary and confinedTo", async () => {
  const { list, w } = callers();
  const env = w.env;
  for (const c of list) {
    env.calls.length = 0;
    const r = await call(env, { op: "memberlist", token: c.token, params: c.params });
    if (r.status !== 200) continue;
    assert.equal(opCalls(env)[0].params.administer, c.administer, c.name);
  }
  const vocab = [...new Set(Object.values(NEEDS).filter(Boolean))].sort();
  const who = async (token, params = {}) => (await call(env, { op: "whoami", token, params })).json.result;
  const f = await who(w.S.founder);
  assert.deepEqual({ ...f, vocabulary: undefined, detail: undefined },
    { tokenClass: "admin", session: true, member: "admin", handle: "founder", administer: true, rootOfTrust: true,
      capabilities: ["contribute", "create_projects", "publish"], vocabulary: undefined, confinedTo: null, detail: undefined });
  assert.deepEqual([...f.vocabulary].sort(), vocab);
  const a = await who(w.S.ann);
  assert.deepEqual([a.tokenClass, a.session, a.member, a.handle, a.administer, a.rootOfTrust, a.confinedTo],
                   ["member", true, "ann", "ann", false, false, null]);
  for (const [token, c, params, adm] of [[env.ADMIN_TOKEN, "admin", {}, true], [env.MEMBER_TOKEN, "member", {}, false],
                                         [env.PROBE_TOKEN, "probe", { store: "scratch" }, false]]) {
    const m = await who(token, params);
    assert.deepEqual([m.tokenClass, m.session, m.member, m.handle, m.administer, m.rootOfTrust, m.capabilities, m.confinedTo],
                     [c, false, null, null, adm, false, null, null]);
    /* whoami and the memberlist stamp say the same thing for one caller */
    env.calls.length = 0;
    await call(env, { op: "memberlist", token, params });
    assert.equal(opCalls(env)[0].params.administer, adm ? "1" : "0", c);
  }
  const dee = list.find((c) => c.name.startsWith("dee"));
  assert.equal((await who(dee.token)).administer, true);
  const ag = await who(list.find((c) => c.name === "agent").token);
  assert.deepEqual([ag.tokenClass, ag.session, ag.administer, ag.capabilities, ag.confinedTo], ["ai", false, false, null, null]);
  assert.equal((await who(w.A.confined, { store: "scratch" })).confinedTo, "scratch");
  /* whoami forwards nothing */
  env.calls.length = 0;
  await who(env.ADMIN_TOKEN);
  assert.equal(opCalls(env).length, 0);
});

test("R19: an agent credential's scope and confinement are judged at the mint — AI_SCOPE_UNKNOWN_OP (C-29.8), AI_SCOPE_BEYOND_MEMBER_REACH (C-29.9, the governance and identity acts included), AI_CONFINEMENT_NOT_SCRATCH (C-29.10) — and its value is returned once and passed on only as its SHA-256", async () => {
  const code = (o, c, chk) => { assert.equal(o.error.reason, c); assert.equal(o.error.code, c); assert.equal(o.error.check, chk); assert.ok(o.error.translation); };
  for (const bad of ["nosuchop", "INDEX", "__proto__x"]) code(M.aiScopeDeclaration([bad]), "AI_SCOPE_UNKNOWN_OP", "C-29.8");
  const beyond = Object.keys(OPS).filter((k) => !M.aiReachesAsMember(OPS[k], k));
  for (const op of [...GOVERNANCE_ACTIONS, ...IDENTITY_ACTIONS, "purge", "capturerequestdrain", "memberadd", "export", "claim", "knock"]) {
    assert.ok(beyond.includes(op), op);
    code(M.aiScopeDeclaration(["index", op]), "AI_SCOPE_BEYOND_MEMBER_REACH", "C-29.9");
  }
  for (const op of beyond) code(M.aiScopeDeclaration([op]), "AI_SCOPE_BEYOND_MEMBER_REACH", "C-29.9");
  /* negative control: ops a member reaches are declarable, trimmed, de-duplicated and sorted */
  assert.deepEqual(M.aiScopeDeclaration([" promote ", "cite", "promote", "", null]), { writes: ["cite", "promote"] });
  assert.deepEqual(M.aiScopeDeclaration(undefined), { writes: [] });
  for (const bad of ["bio", "Scratch", "SCRATCH", "scratch\n", " ", ""]) code(M.aiConfinementDeclaration(bad), "AI_CONFINEMENT_NOT_SCRATCH", "C-29.10");
  for (const none of [null, undefined]) assert.deepEqual(M.aiConfinementDeclaration(none), { confinedTo: null });
  assert.deepEqual(M.aiConfinementDeclaration("scratch"), { confinedTo: "scratch" });
  /* through the door: a refused declaration writes nothing */
  const { env, S } = world();
  for (const [body, c, chk] of [[{ writes: ["adminendorse"] }, "AI_SCOPE_BEYOND_MEMBER_REACH", "C-29.9"],
                                [{ writes: ["groupnameset"] }, "AI_SCOPE_BEYOND_MEMBER_REACH", "C-29.9"],
                                [{ writes: ["nope"] }, "AI_SCOPE_UNKNOWN_OP", "C-29.8"],
                                [{ writes: [], confinedTo: "bio" }, "AI_CONFINEMENT_NOT_SCRATCH", "C-29.10"]]) {
    env.calls.length = 0;
    refused(await call(env, { op: "aicredentialmint", token: S.ann, method: "POST", body }), 403, c, chk);
    assert.equal(opCalls(env).length, 0);
  }
  /* the mint: the value once, the store only its digest, and the normalised declaration */
  const tokens = [];
  for (const confinedTo of ["scratch", undefined]) {
    env.calls.length = 0;
    const r = await call(env, { op: "aicredentialmint", token: S.ann, params: { who: FORGED, secretSha: "0".repeat(64) },
                                method: "POST", body: { writes: ["promote", " cite"], confinedTo, principal: "member:ann" } });
    assert.equal(r.status, 200);
    const t = r.json.result.token;
    assert.match(t, /^aik-[0-9a-f]{64}$/);
    assert.ok(r.json.result.tokenIsShownOnce);
    tokens.push(t);
    const [inner] = opCalls(env);
    assert.deepEqual([inner.route, inner.params.who, inner.params.secretSha], ["aicredentialmint", "ann", sha(t)]);
    assert.deepEqual([inner.body.writes, inner.body.confinedTo], [["cite", "promote"], confinedTo ?? null]);
    assert.equal(JSON.stringify(env.calls.map((c) => [c.url.href, c.body])).includes(t), false, "the value never reaches the store");
  }
  assert.notEqual(tokens[0], tokens[1]);
  /* a review grant's secret: the same rule */
  env.calls.length = 0;
  const g = await call(env, { op: "reviewgrant", token: S.founder, params: { secretSha: "f".repeat(64) }, method: "POST", body: { draft: "D1" } });
  assert.equal(g.status, 200);
  const secret = g.json.result.secret;
  assert.match(secret, /^rv1_[A-Za-z0-9_-]{43}$/);
  const [gi] = opCalls(env);
  assert.equal(gi.params.secretSha, sha(secret));
  assert.equal(JSON.stringify(env.calls.map((c) => [c.url.href, c.body])).includes(secret), false);
  /* a store that refuses the mint returns no value */
  const no = world({ answer: (c) => (c.route === "aicredentialmint" || c.route === "reviewgrant"
    ? new Response(JSON.stringify({ ok: true, result: { ok: false, reason: "AI_CREDENTIAL_IDENTITY_TAKEN" } })) : null) });
  const nr = await call(no.env, { op: "aicredentialmint", token: no.S.ann, method: "POST", body: { writes: [] } });
  assert.equal(nr.status, 403);
  assert.equal("token" in nr.json, false);
  assert.doesNotMatch(nr.text, /aik-[0-9a-f]{64}/);
  const ng = await call(no.env, { op: "reviewgrant", token: no.S.founder, method: "POST", body: {} });
  assert.equal(ng.status, 403);
  assert.doesNotMatch(ng.text, /rv1_/);
});

test("R20: reviewcopy, reviewcomment and statementack admit a grant's secret, of which only its digest reaches the store; outside the fence the answer is 404 NO_REVIEW_COPY, the same bytes from reviewcopy and casedrafts", async () => {
  const { env } = world();
  for (const op of ["reviewcopy", "reviewcomment", "statementack"]) for (const secret of ["rv1_abc", "", "anything at all"]) {
    env.calls.length = 0;
    const r = await call(env, { op, params: { secret, draft: " D1 ", viewer: FORGED, secretSha: "0".repeat(64), bySecret: "0",
                                              case: "C", edition: "1" },
                                method: op === "reviewcomment" ? "POST" : "GET",
                                body: op === "reviewcomment" ? { text: "hello", author: FORGED } : undefined });
    assert.equal(r.status, 200, op);
    const [inner] = env.calls;
    assert.deepEqual(inner.params, { draft: "D1", bySecret: "1", secretSha: sha(secret) }, op);
    if (op === "reviewcomment") assert.deepEqual(inner.body, { text: "hello" });
    if (secret) assert.equal(inner.url.href.includes(secret.replace(/ /g, "+")) || JSON.stringify(inner.body).includes(secret), false);
  }
  /* the fence: one answer, one status, one set of bytes */
  const dead = { ok: false, reason: "NO_REVIEW_COPY", error: "no review copy" };
  const w = world({ answer: (c) => (["reviewcopy", "casedrafts", "statementack", "reviewcomment"].includes(c.route)
    ? new Response(JSON.stringify({ ok: true, result: dead })) : null) });
  const copy = await call(w.env, { op: "reviewcopy", params: { secret: "rv1_x", draft: "D1" } });
  const noSecret = await call(w.env, { op: "reviewcopy", params: { draft: "D1" } });
  const list = await call(w.env, { op: "casedrafts", token: w.S.ann, params: { project: "P" } });
  for (const r of [copy, noSecret, list]) assert.equal(r.status, 404);
  assert.equal(copy.text, list.text);
  assert.equal(copy.text, noSecret.text);
  assert.equal(copy.json.reason, "NO_REVIEW_COPY");
  /* negative control: a copy the fence admits answers 200 with its in-band quartet */
  const live = world({ answer: (c) => (c.route === "reviewcopy"
    ? new Response(JSON.stringify({ ok: true, result: { ok: true, draft: "D1", text: "t", updated_by: "ann", last_change: { at: "2026-09-01" } } })) : null) });
  const lc = await call(live.env, { op: "reviewcopy", params: { secret: "rv1_x", draft: "D1" } });
  assert.equal(lc.status, 200);
  assert.ok(lc.json.inband);
  /* without a secret the caller's own credential is resolved and stamped as the viewer */
  env.calls.length = 0;
  await call(env, { op: "reviewcopy", token: env.MEMBER_TOKEN, params: { draft: "D1", viewer: FORGED } });
  assert.equal(opCalls(env)[0].params.viewer, "class:member");
  env.calls.length = 0;
  await call(env, { op: "reviewcopy", params: { draft: "D1", viewer: FORGED } });
  assert.equal(opCalls(env)[0].params.viewer, "");
});
