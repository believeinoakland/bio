/* control-plane T50's routes (T50-35): R102 (the review copy's group fields read for its draft's project), R103 (the 15 new ops
   routed, their stamps the session's), R104 (an unknown address draws a page), R105 (`acquire`'s `for` judged for sight; its
   bound is not built, see the record), R106 (the viewer of an `ai` caller is admission's), R107 (the stamped viewer on the
   doorbell's pull and resolve) and R108 (the ask's stream passes through as written). Driven through `makeFetch(hooks)`
   over the harness's store, which records every request the plane makes. R103's ops are declared by `op-declarations` R73,
   whose merge in layer 11 comes before this module's. */
import { test } from "node:test";
import { T50_SHARES, T50_FAMILIES } from "../../../src/op-declarations/t50.mjs";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, makeFetch, defaultHooks, refused, aik, cred, hex64, FORGED } from "./harness.mjs";
import { ok, routesForSessions } from "./door-routes.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { callerViewer, admit, aiCredentialPresented, presentedCredential } from "../../../src/admission/index.mjs";
import { ARCHIVE_CHECKS } from "../../../src/acquisition/index.mjs";
import { readRefusals } from "../inquiry/fixtures.mjs";
const { inbandQuartet } = await import("../../../src/inband.mjs");

const { OPS, OP_ALIASES } = O;
const reply = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
/* A store whose objects carry the RPC methods `methods` names (each a recorder), beside the harness's routes. */
function withObject(w, methods) {
  const get = w.env.STORE.get.bind(w.env.STORE);
  w.env.STORE.get = (id) => ({ ...get(id), ...Object.fromEntries(Object.entries(methods).map(([k, f]) => [k, (args) => f(args, id)])) });
  return w;
}

/* ================================================================ R102 */

test("R102 (T50; N933; public-read R36): the review copy's group fields are read for the project its draft belongs to, so the in-band `group` carries that project's `matter_stake` beside the team's `stake`, and the same draft's `hash` is unchanged by it (control: a draft in no project reads the fields with no project and carries `matter_stake: null`; an unreadable stake is passed as the owner answers it, `\"undetermined\"`)", async () => {
  const copyOf = (project) => ({ ok: true, draft: "D1", ...(project ? { project } : {}), updated_by: "iris", required_strength: "B", text: "the draft's words",
                                 last_change: { kind: "comment", at: "2026-08-01T12:00:00.123Z", by: "ann" } });
  const team = { group: "grp-a", name: "Rivertown Tenants", domain: null, domain_verified_at: null, stake: "tenants", detail: null };
  const matter = { stake: "the lease", set_by: "member:ann", set_at: "2026-09-01T00:00:00Z", source: "project" };
  const hashes = [], noProjectHashes = [];
  const run = async (copy, fields, asked) => {
    const w = world({ answer: (c) => (c.route === "reviewcopy" ? reply({ ok: true, result: copy }) : null) });
    withObject(w, { groupFields: async (a, id) => { asked.push(a); assert.equal(id, "bio"); return fields; } });
    const out = [];
    for (const req of [{ params: { secret: "s3cret" } }, { token: w.S.ann, params: { draft: "D1" } }]) {
      const r = await call(w.env, { op: "reviewcopy", ...req });
      assert.equal(r.status, 200, r.text.slice(0, 200));
      out.push(r.json.inband);
    }
    return out;
  };
  /* a draft in project P with a stake: the fields are asked for P, on either door, and the answer's group carries it */
  const asked = [];
  for (const inband of await run(copyOf("PRJ-P"), { ...team, matter_stake: matter }, asked)) {
    assert.deepEqual(inband.group, { ...team, matter_stake: matter });
    hashes.push(inband.hash.sha256);
  }
  assert.deepEqual(asked, [{ project: "PRJ-P" }, { project: "PRJ-P" }]);
  /* the same draft with no matter stake, and with an unreadable one: the same hash */
  for (const stake of [null, { stake: "undetermined", set_by: null, set_at: null, source: "project" }]) {
    const more = [];
    for (const inband of await run(copyOf("PRJ-P"), { ...team, matter_stake: stake }, more)) {
      assert.deepEqual(inband.group.matter_stake, stake);
      hashes.push(inband.hash.sha256);
    }
    assert.deepEqual(more, [{ project: "PRJ-P" }, { project: "PRJ-P" }]);
  }
  /* control: a draft in no project is read with no project, as before, and carries no matter stake */
  const none = [];
  for (const inband of await run(copyOf(null), { ...team, matter_stake: null }, none)) {
    assert.equal(inband.group.matter_stake, null);
    noProjectHashes.push(inband.hash.sha256);
  }
  assert.deepEqual(none, [undefined, undefined]);
  assert.equal(new Set(hashes).size, 1, "no matter stake enters the hash");
  assert.equal(new Set(noProjectHashes).size, 1);
});

/* ================================================================ R103 */

/* the 15 ops of op-declarations R73, assembled from t50.mjs's own declarations (K3268) */
const T50_OPS = Object.freeze([...Object.values(T50_SHARES).flatMap((x) => Object.keys(x.ops)), ...T50_FAMILIES.flatMap((f) => Object.keys(f.ops))]);
if (T50_OPS.length !== 15) throw new Error(`R73 declares 15 ops, found ${T50_OPS.length}`);
const T50_BODY = { watchitem: { item: "ITEM-1", on: true }, secondlook: { item: "ITEM-1", note: "n" }, secondlookclear: { item: "ITEM-1", flag: "f" },
                   projectstakeset: { projectId: "PRJ-1", stake: "the lease" }, actionstake: { target: "ACT-1", stake: "the lease" },
                   actioninquiry: { action: "ACT-1", question: "Q-1" } };

test("R103 (T50; K3627, K3637, K3643; op-declarations R73; R26, R29): each of the 15 new ops is declared and reaches the store's route of its own name, each stamp from the session and none the caller's (a stamp sent in the query or the body is deleted), the session-only ops refused to every machine credential before any store request", async () => {
  await routesForSessions(T50_OPS, (op) => T50_BODY[op] ?? {},
    { refuseMachines: (op) => Array.isArray(OPS[op].machineClasses) && OPS[op].machineClasses.length === 0 });
  /* the acts that name `author` and `by` stamp them by their declarations; a declared op never answers UNKNOWN_OP */
  for (const op of T50_OPS) assert.ok(Object.hasOwn(OPS, op), `${op} is declared`);
});

test("R103 (T50; acquisition R46): `opencaptures` takes its member from the stamp alone, and no instant from the request: an `at` or a `now` sent in the address never reaches the store", async () => {
  const w = world({ answer: (c) => (c.route === "opencaptures" ? ok({ ok: true, sessions: [] }) : null) });
  const r = await call(w.env, { op: "opencaptures", token: w.S.ann, params: { at: "2000-01-01T00:00:00Z", now: "2000-01-01T00:00:00Z", by: FORGED } });
  assert.equal(r.status, 200, r.text);
  const inner = opCalls(w.env).filter((c) => c.route === "opencaptures");
  assert.equal(inner.length, 1);
  assert.equal(inner[0].params.by, "member:ann");
  for (const k of ["at", "now"]) assert.equal(Object.hasOwn(inner[0].params, k), false, `${k} never reaches the store`);
});

/* ================================================================ R104 */

const pageOf = (r) => {
  const nonce = /'nonce-([^']+)'/.exec(r.headers.get("content-security-policy") ?? "")?.[1];
  return nonce ? r.text.replaceAll(nonce, "NONCE") : r.text;
};

test("R104 (T50; N1174, B-14; DEC-299 (11), DEC-301 (3); R2, R82): an address outside the team's pages that names no op draws the interface's page with status 404 under the page policy and `no-store` (the same page `/app` serves), `/doorbell` and `/tour` the same page at 200, and a HEAD the same status with no body; an `op=` request, a path below `/api/` and any other method still answer `UNKNOWN_OP` as JSON, byte for byte (control: `/tour` and `/doorbell` are 200, `/bootstrap` is an op named by its path, `/` and the routes already served are as they were)", async () => {
  const w = world();
  const app = await call(w.env, { path: "/app" });
  assert.equal(app.status, 200);
  const page = pageOf(app);
  assert.match(app.headers.get("content-type"), /^text\/html/);
  for (const path of ["/nonesuch", "/nonesuch/deeper", "/apix", "/tour/x", "/doorbell/x"]) {
    const r = await call(w.env, { path });
    assert.equal(r.status, 404, path);
    assert.match(r.headers.get("content-type"), /^text\/html/, path);
    assert.equal(r.headers.get("cache-control"), "no-store", path);
    assert.match(r.headers.get("content-security-policy") ?? "", /script-src 'self' 'sha256-[A-Za-z0-9+/]{43}='/, `${path}: the page policy and its nonce`);
    assert.equal(pageOf(r), page, `${path}: the interface's own page`);
  }
  for (const path of ["/tour", "/tour/", "/doorbell", "/doorbell/"]) {
    const r = await call(w.env, { path });
    assert.equal(r.status, 200, path);
    assert.equal(pageOf(r), page, `${path}: the same page`);
  }
  const head = await call(w.env, { path: "/nonesuch", method: "HEAD" });
  assert.equal(head.status, 404);
  assert.equal(head.text, "");
  assert.equal((await call(w.env, { path: "/tour", method: "HEAD" })).status, 200);
  assert.equal(w.env.calls.length, 0, "no store is asked for a page");
  /* the JSON answer is unchanged, byte for byte, wherever an op is asked for and none is named */
  let jsonText;
  const expected = { ok: false, error: "unknown op", reason: "UNKNOWN_OP", ...M.dispatchRow("UNKNOWN_OP"), op: "nonesuch" };
  for (const asked of [{ path: "/api/nonesuch" }, { path: "/api", op: "nonesuch" }, { path: "/", op: "nonesuch" },
                       { path: "/nonesuch", method: "POST", body: {} }, { path: "/nonesuch", op: "nonesuch" }]) {
    const r = await call(w.env, asked);
    assert.equal(r.status, 400, JSON.stringify(asked));
    jsonText ??= r.text;
    assert.equal(r.text, jsonText, "byte for byte, whichever way the unknown op was asked");
    assert.deepEqual(r.json, expected, JSON.stringify(asked));
    assert.match(r.headers.get("content-type"), /^application\/json/);
    assert.equal(Object.keys(r.json)[1], "error", "`error` stays the first key after `ok`");
  }
  /* controls: an op named by its path is answered as the op; an alias is the op it aliases; the other routes are as they were */
  const hooks = defaultHooks();
  const named = await call(w.env, { path: "/bootstrap", hooks });
  assert.notEqual(named.status, 404);
  assert.deepEqual(hooks.log.map((e) => e.op), ["bootstrap"]);
  const [alias, target] = Object.entries(OP_ALIASES)[0];
  const aliased = await call(w.env, { path: `/${alias}`, token: w.S.ann, hooks: defaultHooks() });
  assert.doesNotMatch(aliased.headers.get("content-type") ?? "", /^text\/html/, `/${alias} (the op ${target}) is no page`);
  assert.equal((await call(w.env, { path: "/favicon.ico" })).status, 204);
  assert.equal((await call(w.env, { path: "/version" })).text, "9.8.7\n");
  assert.equal(pageOf(await call(w.env, { path: "/" })), page);
  /* the namespace and address gates run first, as on the other page routes */
  const ns = await call(w.env, { path: "/nonesuch", params: { store: "nonsense" } });
  assert.equal(ns.status, 400);
  assert.equal(ns.json?.ok, false);
  const inAddress = await call(w.env, { path: "/nonesuch", params: { token: "x" } });
  assert.equal(inAddress.json?.ok, false);
  assert.equal(inAddress.status, 400);
});

/* ================================================================ R105 */

function acquireWorld({ sight, hookCalls }) {
  const w = world({ answer: (c) => (c.route === "inquirypartition" ? sight(c) : null) });
  const hooks = { ...defaultHooks(),
    async gatedOp(ctx) {
      if (ctx.op !== "acquire") return undefined;
      hookCalls.push({ cls: ctx.cls, body: await ctx.req.clone().json().catch(() => null) });
      return M.json({ ok: true, result: { ok: true, document: { capture: { sha256: "a".repeat(64) } } }, store: ctx.storeName, tokenClass: ctx.cls });
    } };
  return { w, hooks };
}
/* inquiry's own answers to `inquirypartition` (its published `readRefusals`): a question she sees, one hidden from her,
   one absent, and a bundle that is no question */
const sight = readRefusals();
const seesOnlyQ1 = (c) => (c.params.id === "Q-1" && c.params.viewer === "member:ann" ? ok(sight.visible)
  : c.params.id === "Q-5" ? ok(sight.notAnInquiry)
  : c.params.id === "Q-404" ? ok(sight.absent)
  : ok(sight.hiddenFromViewer));

test("R105 (T50; N1117, N1194; K3369, K3627; acquisition R47 `BAD_FOR`, C-139.21): a member's `acquire` whose `for` names a question she may not see, one that does not exist, or a bundle that is no question is refused `BAD_FOR`, one answer for all three, before the handler runs, so nothing is fetched, written or filed; one she may see is accepted and reaches the handler (control: no `for`, a malformed `for` and a daemon's `for` are not judged here; a store that does not answer is a silence and the handler is not reached)", async () => {
  const hookCalls = [];
  const { w, hooks } = acquireWorld({ sight: seesOnlyQ1, hookCalls });
  const acquire = (body, token = w.S.ann, extra = {}) => call(w.env, { op: "acquire", token, method: "POST", hooks, body: { locator: "https://example.org/a", ...body }, ...extra });
  const answers = [];
  for (const unseen of ["Q-2", "Q-404", "Q-5"]) {
    const r = await acquire({ for: unseen });
    refused(r, 400, "BAD_FOR", ARCHIVE_CHECKS.BAD_FOR.check);
    assert.equal(r.json.translation, word("refusal.BAD_FOR"));
    answers.push(r.text);
  }
  assert.equal(new Set(answers).size, 1, "an unseen, an absent and a no-question `for` are one answer, byte for byte");
  assert.deepEqual(hookCalls, [], "the handler was not reached, so nothing was fetched");
  /* (the refusal to a member's session is tallied unattributed, R50: that is the only other request) */
  assert.deepEqual(opCalls(w.env).filter((c) => c.route !== "inquirypartition" && c.route !== "wizardrefusaltally"), [], "nothing else was asked of the store");
  /* the sight is asked as the member's viewer, for the question named */
  assert.deepEqual(opCalls(w.env).filter((c) => c.route === "inquirypartition").map((c) => [c.route, c.params.id, c.params.viewer]), [["inquirypartition", "Q-2", "member:ann"], ["inquirypartition", "Q-404", "member:ann"], ["inquirypartition", "Q-5", "member:ann"]]);
  /* a question she may see is accepted */
  const seen = await acquire({ for: "Q-1" });
  assert.equal(seen.status, 200, seen.text);
  assert.deepEqual(hookCalls.map((h) => h.body.for), ["Q-1"]);
  /* controls: no `for`, a malformed `for` (acquisition's own BAD_FOR) and a non-member caller's `for` are not judged here */
  w.env.calls.length = 0;
  hookCalls.length = 0;
  for (const body of [{}, { for: 5 }, { for: "  " }, { for: "x".repeat(201) }, { for: null }]) {
    const r = await acquire(body);
    assert.equal(r.status, 200, JSON.stringify(body));
  }
  const daemon = await acquire({ for: "Q-2" }, w.env.DAEMON_TOKEN, { params: {} });
  assert.equal(opCalls(w.env).some((c) => c.route === "inquirypartition"), false, "no sight is asked unless a member's session asks");
  assert.equal(hookCalls.length, 6, "all six reached the handler");
  assert.ok(daemon.status === 200 || daemon.json?.ok === false);
  /* a store that does not answer is a silence, never a verdict on her `for` */
  const silent = acquireWorld({ sight: () => new Response("boom", { status: 500 }), hookCalls: (hookCalls.length = 0, hookCalls) });
  const s = await call(silent.w.env, { op: "acquire", token: silent.w.S.ann, method: "POST", hooks: silent.hooks, body: { locator: "https://example.org/a", for: "Q-1" } });
  assert.equal(s.json.ok, false);
  assert.equal(s.json.reason, "STORE_DID_NOT_ANSWER");
  assert.deepEqual(hookCalls, []);
});

/* ================================================================ R106 */

test("R106 (T50; N1186, K3557; credentials R79; admission R30): the `viewer` the door stamps for an `ai` caller is the one admission answers for it (`callerViewer`, the principal's viewer carrying the project its credential was minted for), on a sight-stamped read and on the capture read; a credential minted with no project, and a session's viewer, are the plain viewers as before (control)", async () => {
  const keyed = aik(), carried = aik();
  const w = world({ creds: {
    [keyed]: cred({ tokenId: "agent-plain", principal: "member:ann", writes: [] }),
    [carried]: cred({ tokenId: "agent-proj", principal: "member:ann", project: "PRJ-A", writes: [] }),
  } });
  const viewerAt = async (token, op) => {
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token, params: { id: "B1" } });
    assert.notEqual(r.status, 401, r.text.slice(0, 200));
    return opCalls(w.env).find((c) => c.route === op)?.params.viewer;
  };
  for (const token of [keyed, carried]) {
    /* admission's own answer for the same caller, asked the way the door asks it */
    const url = new URL("https://plane.example/api?op=list&id=B1");
    const credential = presentedCredential({ req: new Request(url, { headers: { authorization: `Bearer ${token}` } }), url, body: null });
    const presented = await aiCredentialPresented(url, w.env, M.doAnswer, { credential, op: "list" });
    const admitted = await admit({ url, env: w.env, op: "list", spec: OPS.list, method: "GET", presented, doAnswer: M.doAnswer, credential });
    assert.ok(admitted.caller, JSON.stringify(admitted).slice(0, 200));
    const expected = callerViewer(admitted.caller, { carry: false });
    assert.equal(typeof expected, "string");
    for (const op of ["list", "index"]) assert.equal(await viewerAt(token, op), expected, `${op}: the viewer admission answers`);
  }
  /* controls: a credential with no project is the plain principal, and a session's viewer is unchanged */
  assert.equal(await viewerAt(keyed, "list"), "member:ann");
  assert.equal(await viewerAt(w.S.ann, "list"), "member:ann");
  assert.equal(await viewerAt(w.S.founder, "list"), "admin");
});

/* ================================================================ R107 */

test("R107 (T50; N1194, K3644; doorbell R13, R3; op-declarations R74): `inboxpull` and `inboxresolve` (the `pulled` resolve, routed as the pull, and the others) are stamped `viewer` from the session, in the address, and none from the caller's address or body (control: a `viewer` sent on either is overwritten; a machine credential's stamp is its class)", async () => {
  const w = world({ answer: (c) => (["inboxpullfile", "inboxresolve"].includes(c.route) ? ok({ ok: true, route: c.route }) : null) });
  const acts = [
    ["inboxpull", { id: "K1" }, "inboxpullfile"],
    ["inboxresolve", { id: "K1", status: "pulled" }, "inboxpullfile"],
    ["inboxresolve", { id: "K1", status: "dismissed", reason: "no" }, "inboxresolve"],
  ];
  for (const [op, body, route] of acts) {
    for (const s of [{ token: w.S.ann, viewer: "member:ann" }, { token: w.S.founder, viewer: "admin" }]) {
      w.env.calls.length = 0;
      const r = await call(w.env, { op, token: s.token, method: "POST", params: { viewer: FORGED }, body: { ...body, viewer: FORGED } });
      assert.equal(r.status, 200, `${op}/${body.status}: ${r.text.slice(0, 200)}`);
      const inner = opCalls(w.env).filter((c) => c.route === route);
      assert.equal(inner.length, 1, `${op}/${body.status}`);
      assert.equal(inner[0].params.viewer, s.viewer, `${op}/${body.status}: stamped from the session`);
      assert.equal(JSON.stringify([inner[0].url.href, inner[0].body]).includes(FORGED), false, `${op}: no caller's viewer reaches the store`);
      assert.equal(Object.hasOwn(inner[0].body ?? {}, "viewer"), false, `${op}: no viewer in the body`);
    }
  }
  /* control: a machine credential is stamped its class, never the viewer it sent */
  w.env.calls.length = 0;
  const m = await call(w.env, { op: "inboxresolve", token: w.env.ADMIN_TOKEN, method: "POST", params: { viewer: FORGED }, body: { id: "K1", status: "dismissed", reason: "no", viewer: FORGED } });
  assert.equal(m.status, 200, m.text);
  const inner = opCalls(w.env).filter((c) => c.route === "inboxresolve");
  assert.equal(inner[0].params.viewer, "class:admin");
  assert.equal(JSON.stringify([inner[0].url.href, inner[0].body]).includes(FORGED), false);
});

/* ================================================================ R108 */

const STREAM_LINE_A = JSON.stringify({ type: "progress", n: 1 }) + "\n";
const STREAM_LINE_B = JSON.stringify({ ok: false, code: "SIGNIN_TOKEN_REFUSED" }) + "\n";
const WAIT_MS = 400;

/* The door driven directly, so the answer can be read as it arrives. `plane` is the ask's response, made when the door asks. */
async function askThroughDoor(plane) {
  const w = world();
  const hooks = { ...defaultHooks(), async gatedOp(ctx) { return ctx.op === "ask" ? plane(ctx) : undefined; } };
  const door = makeFetch(hooks);
  const res = await door(new Request("https://plane.example/api?op=ask", { method: "POST", headers: { authorization: `Bearer ${w.S.ann}` },
    body: JSON.stringify({ question: "Q-1" }) }), w.env);
  return { w, res };
}
const ndjson = (body, status = 200) => new Response(body, { status, headers: { "content-type": "application/x-ndjson" } });
const dropped = (w) => w.env.calls.filter((c) => c.route === "signintokenrefused");

test("R108 (T50; N1195; K3602, K3637 (3); DEC-298 (1); plane R59, agent-worker R113; signin-door R4): the ask's stream passes through the door as the plane writes it: the door returns before the stream ends and the reader has the first line before the plane's wait ends; a stream whose last line is `SIGNIN_TOKEN_REFUSED` still drops the member's held sign-in, after that line, with the caller's bytes unchanged", async () => {
  const enc = new TextEncoder();
  const { w, res } = await askThroughDoor(() => ndjson(new ReadableStream({
    async start(c) { c.enqueue(enc.encode(STREAM_LINE_A)); await new Promise((r) => setTimeout(r, WAIT_MS)); c.enqueue(enc.encode(STREAM_LINE_B)); c.close(); },
  })));
  const t0 = Date.now();
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "application/x-ndjson");
  const reader = res.body.getReader(), dec = new TextDecoder();
  const first = await reader.read();
  assert.equal(dec.decode(first.value), STREAM_LINE_A);
  assert.ok(Date.now() - t0 < WAIT_MS - 100, `the first line arrived at ${Date.now() - t0} ms, before the wait ended`);
  assert.deepEqual(dropped(w), [], "nothing dropped before the refusing line is written");
  let rest = "";
  for (let r = await reader.read(); !r.done; r = await reader.read()) rest += dec.decode(r.value);
  assert.equal(STREAM_LINE_A + rest, STREAM_LINE_A + STREAM_LINE_B, "the caller's bytes are the plane's, unchanged");
  const drops = dropped(w);
  assert.equal(drops.length, 1, "the held sign-in is dropped once");
  assert.equal(drops[0].params.by, "member:ann");
});

test("R108 (control): a short answer arrives whole and byte for byte as the plane wrote it, a refusal line that arrives split across chunks is still seen, and an ask refused before any stream (a JSON refusal) is read for the same refusal as before and answered unchanged", async () => {
  const enc = new TextEncoder();
  /* a short answer, nothing refused: whole, no drop */
  const whole = STREAM_LINE_A + JSON.stringify({ type: "answer", text: "yes" }) + "\n";
  const a = await askThroughDoor(() => ndjson(whole));
  assert.equal(await a.res.text(), whole);
  assert.deepEqual(dropped(a.w), []);
  /* the refusing line split across two chunks, with no final newline */
  const cut = STREAM_LINE_B.trim();
  const b = await askThroughDoor(() => ndjson(new ReadableStream({
    start(c) { c.enqueue(enc.encode(STREAM_LINE_A + cut.slice(0, 10))); c.enqueue(enc.encode(cut.slice(10))); c.close(); } })));
  assert.equal(await b.res.text(), STREAM_LINE_A + cut);
  assert.equal(dropped(b.w).length, 1);
  /* a JSON refusal before any stream */
  const refusal = { ok: false, code: "SIGNIN_TOKEN_REFUSED", reason: "SIGNIN_TOKEN_REFUSED" };
  const c = await askThroughDoor(() => reply(refusal, 403));
  assert.equal(c.res.status, 403);
  const body = await c.res.json();
  assert.equal(body.ok, false);
  assert.equal(body.code, "SIGNIN_TOKEN_REFUSED");
  assert.equal(dropped(c.w).length, 1);
  /* any other JSON answer drops nothing */
  const d = await askThroughDoor(() => reply({ ok: false, reason: "AGENT_WORKER_UNBOUND" }, 503));
  assert.equal((await d.res.json()).reason, "AGENT_WORKER_UNBOUND");
  assert.deepEqual(dropped(d.w), []);
});

test("R105 (T50; T51: N1234, DEC-329 (5); K3770): the door answers `acquire` within its bound, 25 seconds: a handler still running past it is answered the refusal `ACQUIRE_TIMED_OUT` (504, its `detail` read by the design's key `refusal.ACQUIRE_TIMED_OUT`, no sentence of this module's), never a silent stop; one that ends inside the bound is answered as it gave (control: another op is not bounded and carries neither the code nor the detail)", async () => {
  /* the object states the call was stopped before its capture was recorded (fix round 2, C12: only then is `kept nothing` said) */
  const w = world({ answer: (c) => (c.route === "acquiretimings"
    ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes: { total_ms: 60, stages: { fetch: 55 }, running: "fetch" } } })) : null) });
  const slow = { ...defaultHooks(), acquireBoundMs: 60,
    async gatedOp(ctx) {
      // fixtures-own: synthetic a handler that only takes time; the door must answer within its bound whatever the handler would give
      if (ctx.op === "acquire") { await new Promise((r) => setTimeout(r, ctx.url.searchParams.get("wait") === "long" ? 400 : 5));
        return M.json({ ok: true, result: { ok: true, done: true } }); }
      if (ctx.op === "whoami") return undefined;
      return undefined;
    } };
  const late = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: slow, params: { wait: "long" }, body: { locator: "https://example.org/big" } });
  assert.equal(late.status, 504, late.text);
  assert.deepEqual([late.json.ok, late.json.reason, late.json.code, late.json.op], [false, "ACQUIRE_TIMED_OUT", "ACQUIRE_TIMED_OUT", "acquire"]);
  assert.ok(hasWord("refusal.ACQUIRE_TIMED_OUT"), "the design holds the key");
  assert.equal(late.json.detail, word("refusal.ACQUIRE_TIMED_OUT"));
  const quick = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: slow, body: { locator: "https://example.org/small" } });
  assert.equal(quick.status, 200);
  assert.equal(quick.json.result.done, true);
  const other = await call(w.env, { op: "list", token: w.S.ann, hooks: slow });
  assert.equal(other.status, 200);
  for (const r of [quick, other]) {
    assert.equal(JSON.stringify(r.json).includes("ACQUIRE_TIMED_OUT"), false);
    assert.equal(r.json.detail, undefined);
  }
});
