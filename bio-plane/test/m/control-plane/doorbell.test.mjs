/* control-plane: N364's routes (T16, layer 11) and the doorbell's pull (R36). Capture's `inboxpull`, `knocksof`,
   `pulledknocks`, `reattest`, `lateattestations`, `captureaccount`, `captureaccounts`; sources' `sourcedisclose`,
   `sourcelink`, `sourceconsent`, `sourceconsentwithdraw`, `sourceof`, `sourcerung`, `sourcereadlog`, `sourcepublishable`
   and the no-account `knockerconsent`; membership's `signerregister`, `signerrevoke`; case-authoring's `publishpreflight`.
   Each op is driven through `makeFetch(hooks)` for every kind of caller with every stamp forged; the pull is driven at the
   record store's door over a real record (node:sqlite behind the Durable Object's storage shape), with capture real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { O, M, world, call, opCalls, hex64, aik, cred, member, refused, FORGED, QUERY_STAMPS, BODY_STAMPS } from "./harness.mjs";
const D = await import("../../../src/control-plane/dispatch.mjs");
const P = await import("../../../src/control-plane/pull.mjs");
const { captureOf, PULL_WITHIN_FAILED_DETAIL } = await import("../../../src/capture/index.mjs");
const { provenanceOf } = await import("../../../src/provenance/index.mjs");
const { recordOf } = await import("../../../src/record-core/index.mjs");
const { SOURCES_CHECKS } = await import("../../../src/sources/checks.mjs");
const { aiReachesAsMember } = await import("../../../src/admission/index.mjs");

const { OPS, SESSION_OPS, NEEDS } = O;

/* The callers, and what each stamp reads for each of them. */
function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  const bind = (c, token, params = {}) => ({ name: c, token, params, ns: params.store ?? "bio", session: false,
    viewer: `class:${c}`, identity: `class:${c}`, by: `class:${c}`, author: `token:${c}` });
  return { w, agent, list: [
    bind("admin", w.env.ADMIN_TOKEN), bind("member", w.env.MEMBER_TOKEN), bind("probe", w.env.PROBE_TOKEN, { store: "scratch" }),
    { name: "founder", token: w.S.founder, params: {}, ns: "bio", session: true, viewer: "admin", identity: "member:admin",
      by: "admin", author: "admin" },
    { name: "ann", token: w.S.ann, params: {}, ns: "bio", session: true, viewer: "member:ann", identity: "member:ann",
      by: "ann", author: "ann" },
    { name: "agent", token: agent, params: {}, ns: "bio", session: false, viewer: "member:ann", identity: "member:ann",
      by: "class:ai", author: "token:ai" },
  ] };
}

/* Each gated op: its spec, its capability row (undefined: none), the store route it reaches, and its stamps. */
const READ = { classes: ["admin", "member", "probe"], mutating: false };
const ACT = { classes: ["admin", "member", "probe"], mutating: true };
const SESSION_ACT = { classes: ["admin", "member"], machineClasses: [], mutating: true };
const SESSION_READ = { classes: ["admin", "member"], machineClasses: [], mutating: false };
const byOnly = (c) => ({ by: c.by });
const viewerOnly = (c) => ({ viewer: c.viewer });
const none = () => ({});
const ROUTES = {
  inboxpull:             [SESSION_ACT, "contribute", "inboxpullfile", (c) => ({ by: c.by, identity: c.identity, viewer: c.viewer })],
  knocksof:              [SESSION_READ, null, "knocksof", none],
  pulledknocks:          [SESSION_READ, null, "pulledknocks", none],
  reattest:              [ACT, "contribute", "reattest", byOnly],
  lateattestations:      [READ, null, "lateattestations", none],
  captureaccount:        [ACT, "contribute", "captureaccount", byOnly],
  captureaccounts:       [READ, null, "captureaccounts", viewerOnly],
  sourcedisclose:        [ACT, "contribute", "sourcedisclose", byOnly],
  sourcelink:            [ACT, "contribute", "sourcelink", byOnly],
  sourceconsent:         [ACT, "contribute", "sourceconsent", byOnly],
  sourceconsentwithdraw: [ACT, "contribute", "sourceconsentwithdraw", byOnly],
  sourceof:              [READ, null, "sourceof", viewerOnly],
  sourcerung:            [READ, null, "sourcerung", viewerOnly],
  sourcereadlog:         [READ, null, "sourcereadlog", viewerOnly],
  sourcepublishable:     [READ, null, "sourcepublishable", none],
  signerregister:        [SESSION_ACT, null, "signerregister", byOnly],
  signerrevoke:          [SESSION_ACT, null, "signerrevoke", byOnly],
  publishpreflight:      [READ, null, "publishpreflight", (c) => ({ viewer: c.viewer, author: c.author })],
};
const admits = (spec, c) => (c.session ? spec.classes.includes(c.session && c.name === "founder" ? "admin" : "member")
  : c.name === "agent" ? !Array.isArray(spec.machineClasses) && spec.classes.includes("member")
  : (Array.isArray(spec.machineClasses) ? spec.machineClasses : spec.classes).includes(c.name));
/* Every name a stamp could carry, so a stamp the op does not declare is seen to be absent. */
const STAMP_NAMES = [...new Set([...QUERY_STAMPS, "proposedBy", "principal", "owner", "member", "mintedBy", "proposer"])];

test("R2 (N364; op-declarations R6): each new op has its spec — the table K558 names — and is forwarded to the store's route (the pull to its own), in the namespace the caller lands in, the caller's own parameters and body whole", async () => {
  assert.equal(Object.keys(ROUTES).length, 18);
  for (const [op, [spec, needs]] of Object.entries(ROUTES)) {
    assert.deepEqual(OPS[op], spec, op);
    assert.deepEqual([Object.hasOwn(NEEDS, op), NEEDS[op]], [true, needs], `${op}: its NEEDS row`);
    assert.equal(SESSION_OPS.member.has(op) && SESSION_OPS.admin.has(op), spec.mutating, `${op}: both session sets exactly when it writes`);
  }
  /* the no-account consent: public, mutating, no capability row, as `knock` */
  assert.deepEqual([OPS.knockerconsent, Object.hasOwn(NEEDS, "knockerconsent")], [{ classes: null, mutating: true }, false]);
  const { w, list } = callers();
  let reached = 0;
  for (const c of list) for (const [op, [spec, , route]] of Object.entries(ROUTES)) {
    if (!admits(spec, c)) continue;
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token: c.token, params: { ...c.params, capture: "C1" }, method: "POST", body: { note: "kept" } });
    assert.equal(r.status, 200, `${op}/${c.name}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(w.env);
    assert.deepEqual(inner.map((x) => [x.route, x.ns]), [[route, c.ns]], `${op}/${c.name}`);
    assert.equal(inner[0].params.capture, "C1", `${op}: the caller's own parameters reach the route`);
    assert.equal(inner[0].body.note, "kept", `${op}: the caller's own body reaches the route`);
    assert.equal(r.json.store, c.ns);
    reached++;
  }
  assert.ok(reached > 70, String(reached));
});

test("R17, R29 (N364): each new op's declared stamps are the server's value from the credential, for every kind of caller it admits, whatever the caller sent in the query or the body; a stamp the op does not declare is not set", async () => {
  const { w, list } = callers();
  const forgedQ = Object.fromEntries(STAMP_NAMES.map((k) => [k, FORGED]));
  const forgedB = Object.fromEntries([...STAMP_NAMES, ...BODY_STAMPS].map((k) => [k, FORGED]));
  let checked = 0;
  for (const c of list) for (const [op, [spec, , , stamps]] of Object.entries(ROUTES)) {
    if (!admits(spec, c)) continue;
    const want = stamps(c);
    for (const [params, body] of [[c.params, {}], [{ ...c.params, ...forgedQ }, forgedB]]) {
      w.env.calls.length = 0;
      await call(w.env, { op, token: c.token, params, method: "POST", body });
      const [inner] = opCalls(w.env);
      const where = `${op} for ${c.name}${params === c.params ? "" : " (forged)"}`;
      for (const k of STAMP_NAMES) {
        const got = inner.params[k] ?? null;
        if (Object.hasOwn(want, k)) { assert.equal(got, want[k], `${where}: ?${k}`); checked++; }
        else if (QUERY_STAMPS.includes(k)) assert.notEqual(got, FORGED, `${where}: ?${k} carries the caller's value`);
        if (!Object.hasOwn(want, k) && params === c.params) assert.equal(got, null, `${where}: ?${k} is not this op's stamp`);
      }
      for (const k of BODY_STAMPS) assert.notEqual(inner.body?.[k], FORGED, `${where}: #${k}`);
    }
  }
  assert.ok(checked > 60, String(checked));
});

test("R28 (N364; admission R8–R11): the pull, the knock reads and a member's own key are a session's alone — every bearer CLASS_FORBIDDEN, an agent AI_BEYOND_TASK_SCOPE; the writes need contribute (NOT_CAPABLE), the reads and the own-key acts nothing; nothing is forwarded on a refusal, and each has its negative control", async () => {
  const bare = hex64(), narrow = aik();
  const { env, S, A } = world({ sessions: { [bare]: member("bea", []) },
                                creds: { [narrow]: cred({ tokenId: "agent-narrow", writes: ["cite"] }) } });
  const wide = aik();
  const w2 = world({ creds: { [wide]: cred({ tokenId: "agent-wide", writes: Object.keys(OPS) }) } });
  const bearers = [["admin", env.ADMIN_TOKEN, {}], ["member", env.MEMBER_TOKEN, {}], ["probe", env.PROBE_TOKEN, { store: "scratch" }],
                   ["daemon", env.DAEMON_TOKEN, {}]];
  for (const [op, [spec, needs]] of Object.entries(ROUTES)) {
    const sessionOnly = Array.isArray(spec.machineClasses);
    for (const [c, token, params] of bearers) {
      if (!sessionOnly && c !== "daemon") continue;
      env.calls.length = 0;
      const r = await call(env, { op, token, params, method: "POST", body: {} });
      refused(r, 403, "CLASS_FORBIDDEN", "C-38.2");
      assert.equal(opCalls(env).length, 0, `${op}/${c}: forwarded`);
    }
    if (sessionOnly) {
      /* an agent, even one declaring every write, reaches none of them */
      w2.env.calls.length = 0;
      refused(await call(w2.env, { op, token: wide, method: "POST", body: {} }), 403, "AI_BEYOND_TASK_SCOPE", "C-29.6");
      assert.equal(opCalls(w2.env).length, 0);
      assert.equal(aiReachesAsMember(OPS[op], op), false, op);
    } else if (spec.mutating) {
      /* an agent not declaring the write is refused; negative control: the wide one is admitted */
      env.calls.length = 0;
      refused(await call(env, { op, token: narrow, method: "POST", body: {} }), 403, "AI_BEYOND_TASK_SCOPE", "C-29.6");
      assert.equal(opCalls(env).length, 0);
      assert.equal((await call(w2.env, { op, token: wide, method: "POST", body: {} })).status, 200, op);
    } else assert.equal((await call(env, { op, token: narrow, method: "POST", body: {} })).status, 200, `${op}: a read by the narrow agent`);
    if (needs) {
      env.calls.length = 0;
      const r = await call(env, { op, token: bare, method: "POST", body: {} });
      refused(r, 403, "NOT_CAPABLE", "C-38.5");
      assert.deepEqual([r.json.needs, r.json.held], [needs, []]);
      assert.equal(opCalls(env).length, 0);
    } else assert.equal((await call(env, { op, token: bare, method: "POST", body: {} })).status, 200, `${op}: needs no capability`);
    /* the sessions: a member holding contribute and the founder are admitted and forwarded */
    for (const token of [S.ann, S.founder]) {
      env.calls.length = 0;
      assert.equal((await call(env, { op, token, method: "POST", body: {} })).status, 200, op);
      assert.equal(opCalls(env).length, 1, op);
    }
  }
  assert.ok(A);
});

test("R36 (N364; capture R32, R65): the inbox's `inboxresolve` with status `pulled` is routed as op=inboxpull — the pull's gates, stamps and route — while its other statuses stay `inboxresolve`'s; the pull's refusal answers at its own status", async () => {
  const { env, S } = world();
  /* a session: the pull's route, with the pull's stamps, the body whole */
  for (const [token, by, identity, viewer] of [[S.ann, "ann", "member:ann", "member:ann"], [S.founder, "admin", "member:admin", "admin"]]) {
    env.calls.length = 0;
    const r = await call(env, { op: "inboxresolve", token, params: { by: FORGED, identity: FORGED, viewer: FORGED }, method: "POST",
                                body: { knockId: "KNOCK-1", status: "pulled", by: FORGED } });
    assert.equal(r.status, 200);
    const [inner] = opCalls(env);
    assert.deepEqual([inner.route, inner.params.by, inner.params.identity, inner.params.viewer], ["inboxpullfile", by, identity, viewer]);
    assert.deepEqual(inner.body, { knockId: "KNOCK-1", status: "pulled", by: FORGED });
  }
  /* a bearer meets the pull's fence, and nothing is forwarded */
  for (const token of [env.ADMIN_TOKEN, env.MEMBER_TOKEN]) {
    env.calls.length = 0;
    const r = await call(env, { op: "inboxresolve", token, method: "POST", body: { knockId: "KNOCK-1", status: "pulled" } });
    refused(r, 403, "CLASS_FORBIDDEN", "C-38.2");
    assert.equal(r.json.op, "inboxpull");
    assert.equal(opCalls(env).length, 0);
  }
  /* negative controls: another status, or a body that is not JSON, stays inboxresolve's (its route and its body `by`) */
  for (const [body, route] of [[{ knockId: "KNOCK-1", status: "discarded" }, "inboxresolve"], [{ knockId: "KNOCK-1", status: "new" }, "inboxresolve"],
                               ['{"status":"pulled"', "inboxresolve"]]) {
    for (const token of [S.ann, env.ADMIN_TOKEN]) {
      env.calls.length = 0;
      await call(env, { op: "inboxresolve", token, method: "POST", body });
      assert.deepEqual(opCalls(env).map((c) => c.route), [route], JSON.stringify(body));
      if (typeof body === "object") assert.equal(opCalls(env)[0].body.by, token === S.ann ? "ann" : "token:admin");
    }
  }
  /* the pull's refusal status: its hint, else 200 inside the envelope */
  for (const [result, status] of [[{ ok: false, reason: "KNOCK_DISCARDED", status: 409 }, 409], [{ ok: false, reason: "NO_SUCH_KNOCK", status: 404 }, 404],
                                  [{ ok: false, reason: "X", status: 200 }, 200], [{ ok: false, reason: "X", status: "409" }, 200],
                                  [{ ok: true, existed: false, bundle: { bundleId: "INFO-1" } }, 200]]) {
    const v = world({ answer: (c) => (c.route === "inboxpullfile" ? new Response(JSON.stringify({ ok: true, result })) : null) });
    const r = await call(v.env, { op: "inboxpull", token: v.S.ann, method: "POST", body: { knockId: "K" } });
    assert.equal(r.status, status, JSON.stringify(result));
    assert.deepEqual([r.json.ok, r.json.result.reason, r.json.store], [true, result.reason, "bio"]);
  }
});

test("R5, R17, R22, R23 (N364; sources R11): op=knockerconsent is public and pinned to bio; the connecting address and the instant are the server's stamps; only the act's four fields reach the store; a rate refusal answers 429 as the knock's, any other failure 403 carrying sources' row, a silence 502", async () => {
  const { env, S } = world();
  const t0 = Date.now();
  for (const token of [undefined, S.ann, env.ADMIN_TOKEN, "junk"]) {
    env.calls.length = 0;
    const r = await call(env, { op: "knockerconsent", token, method: "POST", headers: { "cf-connecting-ip": "203.0.113.9" },
      params: { source: "198.51.100.1", now: "1", by: FORGED },
      body: { knockerSecret: "s".repeat(24), entry: "E-1", audience: "public", withdraw: true,
              sourceAddress: "198.51.100.1", now: 1, by: FORGED, extra: "dropped" } });
    assert.equal(r.status, 200, r.text);
    const [inner] = opCalls(env);
    assert.deepEqual([inner.ns, inner.route, inner.params.source], ["bio", "knockerconsent", "203.0.113.9"]);
    assert.ok(Number(inner.params.now) >= t0 && Number(inner.params.now) <= Date.now(), inner.params.now);
    assert.deepEqual(Object.keys(inner.params).sort(), ["now", "source"]);
    assert.deepEqual(inner.body, { knockerSecret: "s".repeat(24), entry: "E-1", audience: "public", withdraw: true });
  }
  /* withdraw is passed only when sent; no connecting address is `unknown` */
  env.calls.length = 0;
  await call(env, { op: "knockerconsent", method: "POST", body: { knockerSecret: "x", entry: "E", audience: "group" } });
  assert.deepEqual([opCalls(env)[0].body, opCalls(env)[0].params.source], [{ knockerSecret: "x", entry: "E", audience: "group" }, "unknown"]);
  /* pinned: store=scratch is refused and nothing is read; a GET is 405 */
  env.calls.length = 0;
  refused(await call(env, { op: "knockerconsent", params: { store: "scratch" }, method: "POST", body: {} }), 400, "NAMESPACE_PINNED", "C-78.2");
  const g = await call(env, { op: "knockerconsent", method: "GET" });
  assert.deepEqual([g.status, g.json.ok], [405, false]);
  assert.equal(env.calls.length, 0);
  /* the answers */
  const answering = (result, status = 200) => world({ answer: (c) => (c.route === "knockerconsent" ? new Response(JSON.stringify(result), { status }) : null) });
  const rate = answering({ ok: true, result: { ok: false, reason: "RATE_IP", stated: "too many from here" } });
  const rr = await call(rate.env, { op: "knockerconsent", method: "POST", body: {} });
  assert.deepEqual([rr.status, rr.json.reason, rr.json.stated], [429, "RATE_IP", "too many from here"]);
  const bad = answering({ ok: true, result: { ok: false, reason: "SECRET_NOT_RECOGNISED" } });
  const br = await call(bad.env, { op: "knockerconsent", method: "POST", body: {} });
  refused(br, 403, "SECRET_NOT_RECOGNISED", SOURCES_CHECKS.SECRET_NOT_RECOGNISED.check);
  assert.equal(br.json.translation, SOURCES_CHECKS.SECRET_NOT_RECOGNISED.translation);
  assert.deepEqual(M.dec49Row("SECRET_NOT_RECOGNISED"), { check: "C-121.6", translation: SOURCES_CHECKS.SECRET_NOT_RECOGNISED.translation });
  const ok = answering({ ok: true, result: { ok: true, entry: "E-1", audience: "public", statement: "s" } });
  const or = await call(ok.env, { op: "knockerconsent", method: "POST", body: {} });
  assert.deepEqual([or.status, or.json], [200, { ok: true, entry: "E-1", audience: "public", statement: "s" }]);
  const silent = answering({ ok: false, error: "Error: boom /srv/x.mjs:1" }, 500);
  const sr = await call(silent.env, { op: "knockerconsent", method: "POST", body: {} });
  refused(sr, 502, "STORE_DID_NOT_ANSWER", "C-69.2");
  assert.equal(sr.text.includes("boom"), false);
  const own = answering({ ok: false, reason: "BAD_JSON", detail: "d" }, 400);
  assert.equal((await call(own.env, { op: "knockerconsent", method: "POST", body: {} })).status, 400);
});

test("R2, R17 (N364; case-authoring R34, R35): op=publish's body carries `selfAttested` whole to the store, and op=publishpreflight carries op=publish's stamps and body", async () => {
  const { env, S } = world();
  const selfAttested = [{ capture: "a".repeat(64), reason: "the source took the page down" }];
  for (const op of ["publish", "publishpreflight"]) {
    env.calls.length = 0;
    await call(env, { op, token: S.ann, params: { author: FORGED, viewer: FORGED }, method: "POST", body: { target: "INQ-1", selfAttested } });
    const [inner] = opCalls(env);
    assert.deepEqual([inner.route, inner.params.author, inner.params.viewer], [op === "publish" ? "publishcase" : "publishpreflight", "ann", "member:ann"]);
    assert.deepEqual(inner.body, { target: "INQ-1", selfAttested });
  }
});

test("R27 (N364, N379): the new reads that carry an id and reach a store route are classified — publishpreflight names the publishing project (the door answers existence first), the knock, capture and source reads name none, with the reason", async () => {
  const { PROJECT_NAMING_READS: NAMES, PROJECT_NAMING_READS_NOT: NOT } = D;
  assert.deepEqual(NAMES.publishpreflight, ["project"]);
  /* sources' reads are store routes of this door since N379, so they are classified with the knock and capture reads */
  for (const op of ["knocksof", "pulledknocks", "lateattestations", "captureaccounts",
                    "sourceof", "sourcerung", "sourcereadlog", "sourcepublishable"]) {
    assert.equal(typeof NOT[op], "string", op);
    assert.equal(Object.hasOwn(NAMES, op), false, op);
  }
  const PR = "PROJ-seen";
  const ran = [];
  const store = { routes: () => ({ publishpreflight: () => { ran.push(1); return { answered: true }; } }),
                  membership: () => ({ visibilityOf: (id) => (id === PR ? "discoverable" : "hidden"),
                                       existenceAct: (id) => (id === PR ? { ok: false, reason: "PROJECT_SEEN_NOT_A_PARTICIPANT", project: id } : null) }) };
  const r = await (await D.dispatch(new Request(`http://do/publishpreflight?viewer=member:ann&project=${PR}`), store)).json();
  assert.deepEqual([r.result.reason, ran], ["PROJECT_SEEN_NOT_A_PARTICIPANT", []]);
  /* negative control: a project not shown at existence falls through to the route */
  const r2 = await (await D.dispatch(new Request("http://do/publishpreflight?viewer=member:ann&project=PROJ-other"), store)).json();
  assert.deepEqual([r2.result, ran], [{ answered: true }, [1]]);
});

/* ---- the record store's door, over a real record ---- */

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const rest = c.toArray(); if (rest.length !== 1) throw new Error(`expected one row, got ${rest.length}`); return rest[0]; },
  };
  return c;
}
/** One Durable Object: node:sqlite behind `sql.exec`, `transactionSync` a savepoint that rolls back on a throw (as a
 *  Durable Object's does), and an in-memory evidence bucket. */
async function record() {
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...a) { const st = db.prepare(q); return cursor(st.columns().length ? st.all(...a.map(bind)).map((r) => ({ ...r })) : (st.run(...a.map(bind)), [])); },
                get databaseSize() { return 0; } };
  let n = 0;
  const transactionSync = (fn) => {
    const sp = `sp${n++}`;
    db.exec(`SAVEPOINT ${sp}`);
    try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
    catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
  };
  const objects = new Map();
  const bucket = {
    async head(k) { return objects.has(k) ? { size: objects.get(k).length } : null; },
    async get(k) { const b = objects.get(k); return b ? { arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) } : null; },
    async put(k, b) { objects.set(k, new Uint8Array(b)); return {}; },
  };
  const blocked = [];
  const ctx = { storage: { sql, transactionSync, getAlarm: async () => null, setAlarm: async () => {}, deleteAlarm: async () => {} },
                id: { equals: () => false, toString: () => "do" }, blockConcurrencyWhile(fn) { const p = fn(); blocked.push(p); return p; },
                waitUntil() {} };
  const env = { STORE: { idFromName: (x) => x }, CAPTURES: bucket, INSTANCE_NAME: "test" };
  const store = new D.Store(ctx, env);
  for (const p of blocked) await p;
  const go = async (path, method = "GET", body) => {
    const r = await store.fetch(new Request(`http://do/${path}`, body === undefined ? { method } : { method, body: JSON.stringify(body) }));
    return { status: r.status, json: await r.json() };
  };
  const knock = async (text = "material for the group", extra = {}) =>
    (await go("knock?source=203.0.113.9", "POST", { content: text, note: "please look", contact: "knocker@example.org", now: Date.now(), ...extra })).json.result;
  const state = (knockId) => captureOf(ctx).inboxGet(knockId).item;
  return { ctx, db, store, go, knock, state, objects };
}
const SESSION = "by=ann&identity=member:ann&viewer=member:ann";
/* What the record holds of a knock's pull: the knock's row, its receipt, and a bundle holding its capture. */
const heldOf = (r, knockId, sha) => {
  const k = r.state(knockId);
  return { status: k.status, capture_sha: k.capture_sha ?? null, pulled_by: k.pulled_by ?? null,
           receipt: provenanceOf(r.ctx).registerHolds({ sha }).acquired, home: provenanceOf(r.ctx).homeOf(sha) };
};

test("R36, R35 (N364, N381): the pull is a route of the record store's door, beside capture's own — refused by capture (no puller, no such knock, a discarded knock), nothing is written; admitted, it files the knock end to end with the real capture, provenance and promotion: one new information bundle at collected, the puller its author, holding the capture, no contact in it", async () => {
  const r = await record();
  const k = await r.knock();
  assert.equal(k.ok, true);
  const before = heldOf(r, k.knockId, k.sha256);
  assert.deepEqual(before, { status: "new", capture_sha: null, pulled_by: null, receipt: false, home: null });
  const bundles = () => recordOf(r.ctx).listBundles().ids;
  /* capture's refusals: its own words, nothing written */
  for (const [path, body, reason] of [[`inboxpullfile?identity=member:ann&viewer=member:ann`, { knockId: k.knockId }, "NO_PULLER"],
                                      [`inboxpullfile?${SESSION}`, { knockId: "KNOCK-none" }, "NO_SUCH_KNOCK"]]) {
    const a = await r.go(path, "POST", body);
    assert.deepEqual([a.status, a.json.ok, a.json.result.ok, a.json.result.reason], [200, true, false, reason]);
    assert.deepEqual(heldOf(r, k.knockId, k.sha256), before);
  }
  const d = await r.knock("another");
  captureOf(r.ctx).inboxResolve({ knockId: d.knockId, status: "discarded", by: "ann" });
  const da = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: d.knockId });
  assert.equal(da.json.result.reason, "KNOCK_DISCARDED");
  assert.equal(heldOf(r, d.knockId, d.sha256).receipt, false);
  assert.deepEqual(bundles(), []);
  /* N381: the real promotion admits capture R65's own document, so one pull files the knock */
  const p = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: k.knockId });
  assert.equal(p.json.result.ok, true, JSON.stringify(p.json).slice(0, 400));
  const { bundle } = p.json.result;
  assert.match(bundle.bundleId, /^INFO-\d{4}-0001-doorbell-knock$/);
  assert.match(bundle.bundleSha, /^[0-9a-f]{64}$/);
  assert.equal("within" in p.json.result, false, "the seam's answer is carried as `bundle`, not beside it");
  assert.deepEqual(bundles(), [bundle.bundleId]);
  const held = heldOf(r, k.knockId, k.sha256);
  assert.deepEqual([held.status, held.capture_sha, held.pulled_by, held.receipt, held.home?.bundleId],
                   ["pulled", k.sha256, "ann", true, bundle.bundleId]);
  const head = recordOf(r.ctx).head(bundle.bundleId);
  assert.deepEqual([head.type, head.currentState, head.bundleSha], ["information", "collected", bundle.bundleSha]);
  const md = recordOf(r.ctx).readFile(bundle.bundleId, "bundle.md").text;
  assert.match(md, /^current_state: collected$/m);
  assert.match(md, / \| Collected \| ann$/m, "the puller is the bundle's author");
  const prov = JSON.parse(recordOf(r.ctx).readFile(bundle.bundleId, "data/provenance.json").text);
  assert.deepEqual([prov.documents[0].capture.actor, prov.documents[0].origin.kind, prov.documents[0].capture.sha256],
                   ["ann", "doorbell", k.sha256]);
  assert.deepEqual(recordOf(r.ctx).readFile(bundle.bundleId, prov.documents[0].file).blobSha, k.sha256);
  for (const f of ["bundle.md", "data/provenance.json"])
    assert.equal(recordOf(r.ctx).readFile(bundle.bundleId, f).text.includes("knocker@example.org"), false, `no contact in ${f}`);
  assert.equal(JSON.stringify(p.json).includes("knocker@example.org"), false, "no contact in the answer");
  /* a repeated pull answers the same bundle and files nothing more */
  const again = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: k.knockId });
  assert.deepEqual([again.json.result.ok, again.json.result.existed, again.json.result.bundle],
                   [true, true, { bundleId: bundle.bundleId, bundleSha: null, existed: true }]);
  assert.deepEqual(bundles(), [bundle.bundleId]);
  /* negative control: capture's own route, called directly, pulls a knock and files no bundle; the door's next pull of
     it promotes it, because no bundle holds its capture */
  const e = await r.knock("pulled around the door");
  const c = await r.go("inboxpull?by=ann", "POST", { knockId: e.knockId });
  assert.equal(c.json.result.ok, true);
  assert.deepEqual([heldOf(r, e.knockId, e.sha256).status, heldOf(r, e.knockId, e.sha256).home], ["pulled", null]);
  const f = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: e.knockId });
  assert.deepEqual([f.json.result.ok, f.json.result.existed], [true, true]);
  assert.equal(heldOf(r, e.knockId, e.sha256).home?.bundleId, f.json.result.bundle.bundleId);
  assert.equal(bundles().length, 2);
});

/* The promotion's answer controlled, capture and record-core real: what reaches the promotion, and when. */
function promotionStandIn(r, decide) {
  const seen = [];
  return {
    seen,
    promote(pkg) {
      const at = seen.length;
      seen.push(pkg);
      const verdict = decide(at, pkg);
      if (verdict === "throw") throw new Error("a store fault");
      if (verdict !== true) return verdict;
      /* a write the promotion makes, so its rollback in a dry run is seen */
      r.db.prepare("CREATE TABLE IF NOT EXISTS standin_writes (id TEXT)").run();
      r.db.prepare("INSERT INTO standin_writes VALUES (?)").run(pkg.bundleId);
      return { ok: true, bundleId: pkg.bundleId, bundleSha: "b".repeat(64) };
    },
  };
}
const standinWrites = (r) => { try { return r.db.prepare("SELECT id FROM standin_writes").all().map((x) => x.id); } catch { return []; } };

test("R36 (N364, N380, N386): one pull files the capture and promotes its document as a new information bundle at collected, the puller its author — the promotion asked once, inside the pull; the instant is the second the pull was made; no contact reaches the bundle", async () => {
  const r = await record();
  const k = await r.knock("the minutes they did not publish");
  const promotion = promotionStandIn(r, () => true);
  let homes = 0;
  const deps = { capture: captureOf(r.ctx), promotion, record: recordOf(r.ctx), provenance: { homeOf: () => { homes++; return null; } } };
  const now = () => Date.parse("2026-09-30T12:34:56.789Z");
  const a = await P.pullAndFile(deps, { knockId: k.knockId, by: "ann", identity: "member:ann", viewer: "member:ann", now });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.equal(a.existed, false);
  assert.deepEqual(a.capture, { sha256: k.sha256, bytes: k.bytes });
  /* N380: one promotion, the one inside the pull; no dry run */
  assert.equal(promotion.seen.length, 1);
  const [real] = promotion.seen;
  assert.deepEqual(standinWrites(r), [real.bundleId]);
  assert.deepEqual(a.bundle, { bundleId: real.bundleId, bundleSha: "b".repeat(64) });
  assert.match(real.bundleId, /^INFO-2026-0001-doorbell-knock$/);
  /* N386: the pull's instant, to the second (record-core R47's "second" spelling) */
  assert.deepEqual([a.pulled_at, real.meta.created, r.state(k.knockId).pulled_at], Array(3).fill("2026-09-30T12:34:56Z"));
  /* the package: a creation, the puller its author, collected, capture's own document, the bytes as a blob, one register row */
  assert.deepEqual([real.base, real.author, real.actorMemberId, real.actorIdentity, real.actorViewer], [null, "ann", "ann", "member:ann", "member:ann"]);
  assert.deepEqual([real.meta.object_type, real.meta.current_state], ["information", "collected"]);
  const md = real.files.find((f) => f.path === "bundle.md").text;
  assert.match(md, /^object_type: information$/m);
  assert.match(md, /^current_state: collected$/m);
  assert.match(md, new RegExp(`^id: ${real.bundleId}$`, "m"));
  assert.match(md, new RegExp(`^content_hash: sha256:${k.sha256}$`, "m"));
  const prov = JSON.parse(real.files.find((f) => f.path === "data/provenance.json").text);
  assert.deepEqual(prov, { documents: [a.document] });
  assert.equal(a.document.capture.actor, "ann");
  assert.deepEqual(real.files.find((f) => f.path === a.document.file), { path: a.document.file, blobSha: k.sha256, sha256: k.sha256, bytes: k.bytes });
  assert.deepEqual(real.register, [{ sha256: k.sha256, path: a.document.file, encoding: "binary", bytes: k.bytes }]);
  assert.equal(JSON.stringify(promotion.seen).includes("knocker@example.org"), false, "no contact reaches the bundle (capture R70)");
  /* the knock is pulled by the puller, with its receipt */
  assert.deepEqual([r.state(k.knockId).status, r.state(k.knockId).pulled_by], ["pulled", "ann"]);
  assert.equal(provenanceOf(r.ctx).registerHolds({ sha: k.sha256 }).acquired, true);
  assert.equal(homes, 0, "a fresh pull promotes; it does not look for a home");
});

test("R36 (N380, K559; capture R65): the pull and its promotion are one act — a promotion that refuses, or throws, leaves neither written (the knock as it was, no receipt, no actor, no bundle, no id drawn), and the next pull files it; a fault's message is not carried", async () => {
  for (const [fault, reason, status] of [[{ ok: false, reason: "PROMOTE_REFUSED_HERE", detail: "raced" }, "PROMOTE_REFUSED_HERE", undefined],
                                         ["throw", "PULL_WITHIN_FAILED", 500]]) {
    const r = await record();
    const k = await r.knock(`one act ${JSON.stringify(fault)}`);
    /* the first promotion fails; every later one lands */
    const promotion = promotionStandIn(r, (i) => (i === 0 ? fault : true));
    const deps = { capture: captureOf(r.ctx), promotion, record: recordOf(r.ctx), provenance: provenanceOf(r.ctx) };
    const who = { knockId: k.knockId, by: "ann", identity: "member:ann", viewer: "member:ann" };
    const first = await P.pullAndFile(deps, who);
    assert.deepEqual([first.ok, first.reason, first.status, first.knockId], [false, reason, status, k.knockId]);
    assert.equal(JSON.stringify(first).includes("a store fault"), false, "a fault's message is not carried");
    /* N419: a fault answers capture's fixed sentence (capture R65), never the thrown message */
    if (fault === "throw") assert.equal(first.detail, PULL_WITHIN_FAILED_DETAIL);
    assert.deepEqual(heldOf(r, k.knockId, k.sha256), { status: "new", capture_sha: null, pulled_by: null, receipt: false, home: null },
                     "the pull was rolled back with its promotion");
    assert.deepEqual(standinWrites(r), [], "no bundle filed");
    /* a pull made again is a new pull: it files the knock, and the id the failed promotion drew was rolled back with it */
    const again = await P.pullAndFile(deps, who);
    assert.deepEqual([again.ok, again.existed], [true, false], JSON.stringify(again).slice(0, 300));
    assert.equal(again.bundle.bundleId, promotion.seen.at(-1).bundleId);
    assert.match(again.bundle.bundleId, /-0001-doorbell-knock$/);
    assert.deepEqual(standinWrites(r), [again.bundle.bundleId]);
    assert.deepEqual([r.state(k.knockId).status, provenanceOf(r.ctx).registerHolds({ sha: k.sha256 }).acquired], ["pulled", true]);
  }
});

test("R36 (N364, K559): a pulled knock no bundle holds (pulled through capture's own route) is promoted by the door's pull — a promotion that fails then says so and leaves the knock pulled, the next pull files it; once a bundle holds the capture, a pull answers that bundle and promotes nothing", async () => {
  for (const fault of ["throw", { ok: false, reason: "PROMOTE_FAILED", detail: "raced" }]) {
    const r = await record();
    const k = await r.knock(`residue ${JSON.stringify(fault)}`);
    const pulledAround = await captureOf(r.ctx).pullKnock({ knockId: k.knockId, by: "bea" });
    assert.equal(pulledAround.ok, true);
    let home = null;
    const promotion = promotionStandIn(r, (i) => (i === 0 ? fault : true));
    const deps = { capture: captureOf(r.ctx), promotion, record: recordOf(r.ctx), provenance: { homeOf: () => home } };
    const who = { knockId: k.knockId, by: "ann", identity: "member:ann", viewer: "member:ann" };
    const first = await P.pullAndFile(deps, who);
    assert.deepEqual([first.ok, first.reason, first.knockId], [false, "PROMOTE_FAILED", k.knockId]);
    assert.match(first.detail, /already brought in/);
    assert.equal(JSON.stringify(first).includes("a store fault"), false, "a fault's message is not carried");
    assert.deepEqual(standinWrites(r), [], "no bundle filed");
    assert.deepEqual([r.state(k.knockId).status, r.state(k.knockId).pulled_by], ["pulled", "bea"], "the earlier pull stands");
    /* a repeated pull: capture answers existed with its document, no bundle holds the capture, so it is promoted */
    const again = await P.pullAndFile(deps, who);
    assert.deepEqual([again.ok, again.existed], [true, true]);
    assert.equal(again.bundle.bundleId, promotion.seen.at(-1).bundleId);
    assert.deepEqual(standinWrites(r), [again.bundle.bundleId]);
    assert.deepEqual(JSON.parse(promotion.seen.at(-1).files.find((f) => f.path === "data/provenance.json").text).documents[0], again.document);
    /* negative control: once a bundle holds the capture, a pull answers it and promotes nothing */
    home = { bundleId: again.bundle.bundleId };
    const asked = promotion.seen.length;
    const third = await P.pullAndFile(deps, who);
    assert.deepEqual([third.ok, third.existed, third.bundle], [true, true, { bundleId: again.bundle.bundleId, bundleSha: null, existed: true }]);
    assert.equal(promotion.seen.length, asked);
  }
});

test("R35, R26 (N379, K566): the record store's door dispatches sources' own map — each of its routes, the no-account knockerconsent included, answers sources' own words through R26's envelope, never `unknown op`; the stamps it reads are the query's", async () => {
  const r = await record();
  const { sourcesOps } = await import("../../../src/sources/index.mjs");
  const routes = Object.keys(sourcesOps({}, new URL("http://do/"), null));
  assert.deepEqual(routes.sort(), ["knockerconsent", "sourceconsent", "sourceconsentwithdraw", "sourcedisclose", "sourcelink",
                                   "sourceof", "sourcepublishable", "sourcereadlog", "sourcerung"]);
  for (const op of routes) {
    const a = await r.go(`${op}?by=ann&viewer=member:ann&source=203.0.113.9&now=${Date.now()}`, "POST", { captureSha: "a".repeat(64) });
    assert.equal(a.status, 200, `${op}: ${JSON.stringify(a.json).slice(0, 200)}`);
    assert.equal(a.json.ok, true, op);
    assert.notEqual(a.json.error, `unknown op: ${op}`, op);
  }
  /* the knocker's consent by a secret no knock carries is sources' own refusal */
  const kc = await r.go(`knockerconsent?source=203.0.113.9&now=${Date.now()}`, "POST", { knockerSecret: "s".repeat(24), entry: "E-1", audience: "public" });
  assert.deepEqual([kc.json.ok, kc.json.result.ok, kc.json.result.reason], [true, false, "SECRET_NOT_RECOGNISED"]);
  /* negative control: a name no module serves is still R26's refusal */
  const u = await r.go("sourcenothing", "POST", {});
  assert.deepEqual([u.status, u.json.error], [400, "unknown op: sourcenothing"]);
});

test("R35 (N364; membership R89, R90): the record store's door routes signerregister and signerrevoke to membership's own-key acts, `by` read from the query over the body's", async () => {
  const r = await record();
  /* a machine stamp in the query is refused by membership, whatever the body names */
  for (const op of ["signerregister", "signerrevoke"]) {
    const a = await r.go(`${op}?by=class:admin`, "POST", { keyB64: "AAAA", by: "ann" });
    assert.equal(a.status, 200, op);
    assert.equal(a.json.ok, true);
    assert.equal(a.json.result.ok, false, op);
    assert.ok(["MACHINE_CANNOT_REGISTER_KEY", "NO_SUCH_KEY"].includes(a.json.result.reason), `${op}: ${a.json.result.reason}`);
  }
  /* negative control: the query's `by` reaches membership — a member id that is no member is answered as such */
  const n = await r.go("signerregister?by=nobody", "POST", { keyB64: "AAAA", by: "class:admin" });
  assert.notEqual(n.json.result.reason, "MACHINE_CANNOT_REGISTER_KEY");
});
