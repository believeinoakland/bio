/* control-plane T47's routes (T47-65): R79 (T47's new ops, routed through their owners' maps with the declared stamps),
   R83 (K3084: `login`'s handle and device, `recover`'s handle, `unlock`, `reauth`, the reset-link ops, background requests),
   R88 (K3099: `projectbarset` asked of its author's position by the identity stamp) and R89 (K3104: `peopledirectory`).
   Driven through `makeFetch(hooks)` over the harness's store; each op is also checked to be a route of its owner's own
   map, so the store's door that composes those maps (plane R5) reaches its handler. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, refused, aik, cred, FORGED } from "./harness.mjs";
import { projectRosterOps } from "../../../src/project-roster/index.mjs";
import { basisVersionsOps } from "../../../src/basis-versions/index.mjs";
import { citationOps } from "../../../src/citation/index.mjs";
import { strengthOps } from "../../../src/strength/index.mjs";
import { monitoringOps } from "../../../src/monitoring/index.mjs";
import { sourcesOps } from "../../../src/sources/index.mjs";
import { peopleOps } from "../../../src/people/index.mjs";
import { captureRequestsOps } from "../../../src/capture-requests/index.mjs";
import { captureOps } from "../../../src/capture/index.mjs";
import { credentialsOps } from "../../../src/credentials/index.mjs";

const { OPS } = O;
const U = new URL("http://do/x");
const routesOf = (f) => Object.keys(f({}, U, null, {}));
/* the stamps a caller tries to set on every request below: R17's in the address (`QUERY_STAMPS`, every one deleted for
   every op) and in the body (`BODY_STAMPS`); `principal`, set by the door for the run productions (`capturerequest`) */
const FORGED_QUERY = { viewer: FORGED, identity: FORGED, author: FORGED, by: FORGED, actor: FORGED, who: FORGED, origin: FORGED,
                       administer: "1" };
const FORGED_BODY = { actorIdentity: FORGED, actorViewer: FORGED, actorMemberId: FORGED, ownerMemberId: FORGED,
                      assistantPrincipal: FORGED, migrationReplay: FORGED };
const noForged = (c, label) => assert.equal(JSON.stringify([c.url.href, c.body, c.headers]).includes(FORGED), false,
                                             `${label}: a caller's stamp reached the store`);

/* ================================================================ R79 */

/* op → [its owner's map, the stamps the owner's arm reads with the door's value for Ann's session (`member:ann`'s), its
   request fields, member-session only] */
const T47_OPS = {
  projectlist:      [projectRosterOps, { viewer: "member:ann" }, { limit: "5" }, false],
  projectquestions: [basisVersionsOps, { viewer: "member:ann" }, { project: "PRJ-1", after: "Q-1", limit: "5" }, false],
  drawquestion:     [citationOps, { viewer: "member:ann", author: "ann", identity: "member:ann" },
                     { project: "PRJ-1", inquiry: "INQ-1", note: "why" }, false],
  projectbarset:    [strengthOps, { viewer: "member:ann", author: "ann", identity: "member:ann" }, { project: "PRJ-1" }, true],
  monitorset:       [monitoringOps, { viewer: "member:ann" }, {}, true],
};

test("R79 (T47; op-declarations R55): `projectlist`, `projectquestions`, `drawquestion`, `projectbarset` and `monitorset` are declared, each a route of its owner's own map, and reach that route through the door for a member's session with the stamps its owner reads set by the door (a session's viewer, `drawquestion` as `cite`'s, `projectbarset` as `strengthbar`'s) and its request fields as sent; every stamp the caller sent in the address or the body is deleted", async () => {
  for (const [op, [ops, stamps, fields]] of Object.entries(T47_OPS)) {
    assert.ok(OPS[op], `${op} is declared`);
    assert.ok(routesOf(ops).includes(op), `${op} is a route of its owner's map`);
    const { env, S } = world();
    const r = await call(env, { op, token: S.ann, method: OPS[op].mutating ? "POST" : "GET", params: { ...fields, ...FORGED_QUERY },
                                ...(OPS[op].mutating ? { body: { bundleId: "B-1", enabled: true, reason: "r", ...FORGED_BODY } } : {}) });
    assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 300)}`);
    const inner = opCalls(env).filter((c) => c.route === op);
    assert.equal(inner.length, 1, `${op} forwarded once`);
    for (const [k, v] of Object.entries(stamps)) assert.equal(inner[0].params[k], v, `${op}: ${k}`);
    for (const [k, v] of Object.entries(fields)) assert.equal(inner[0].params[k], v, `${op}: ${k} as sent`);
    noForged(inner[0], op);
  }
});

test("R79 (controls): `projectbarset` and `monitorset` are refused to every caller not arriving by a member's session — the binding classes and an `ai` credential — with nothing forwarded; the three reads admit a binding class their rows name", async () => {
  const agent = aik();
  const { env, S } = world({ creds: { [agent]: cred({ writes: ["projectbarset", "monitorset"] }) } });
  for (const op of ["projectbarset", "monitorset"]) {
    assert.deepEqual(OPS[op]?.machineClasses, [], `${op}: no machine class`);
    for (const token of [env.ADMIN_TOKEN, env.PROBE_TOKEN, env.DAEMON_TOKEN, agent]) {
      env.calls.length = 0;
      const r = await call(env, { op, token, method: "POST", body: { project: "PRJ-1" } });
      assert.equal(r.json.ok, false, `${op}: refused`);
      assert.equal(opCalls(env).some((c) => c.route === op), false, `${op}: nothing forwarded`);
    }
    env.calls.length = 0;
    assert.equal((await call(env, { op, token: S.ann, method: "POST", body: { project: "PRJ-1" } })).status, 200, `${op}: a session`);
  }
  for (const op of ["projectlist", "projectquestions"]) {
    env.calls.length = 0;
    const r = await call(env, { op, token: env.PROBE_TOKEN, params: { store: "scratch" } });
    assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 200)}`);
    assert.equal(opCalls(env).find((c) => c.route === op).params.viewer, "class:probe");
  }
});

test("R79 (op-declarations R56; sources R1, R9): `sourceof` and `sourcerung` are answered to a member's session through `sources`' map, `viewer` the session's, a caller's stamps deleted; control: a probe in `scratch` is stamped its machine form, never a member's", async () => {
  const { env, S } = world();
  for (const op of ["sourceof", "sourcerung"]) {
    assert.ok(routesOf(sourcesOps).includes(op));
    env.calls.length = 0;
    const r = await call(env, { op, token: S.ann, params: { capture: "a".repeat(64), source_id: "SRC-1", ...FORGED_QUERY } });
    assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(env).find((c) => c.route === op);
    assert.equal(inner.params.viewer, "member:ann");
    noForged(inner, op);
    env.calls.length = 0;
    await call(env, { op, token: env.PROBE_TOKEN, params: { store: "scratch", capture: "a".repeat(64), viewer: FORGED } });
    const p = opCalls(env).find((c) => c.route === op);
    assert.deepEqual([p?.ns, p?.params.viewer], ["scratch", "class:probe"], `${op}: a probe`);
  }
});

test("R79 (capture-requests R56, capture R88): `capturerequest` from a member's own session reaches `capture-requests`' route with that member as its caller (`principal` `member:<id>`), no `run` asked of the door; `heldcaptures` passes `state` from the query; a caller's own `principal` and `viewer` never reach either (control: a probe's capture request is stamped its machine form)", async () => {
  assert.ok(routesOf(captureRequestsOps).includes("capturerequest"));
  assert.ok(routesOf(captureOps).includes("heldcaptures"));
  const { env, S } = world();
  const r = await call(env, { op: "capturerequest", token: S.ann, method: "POST", params: { ...FORGED_QUERY, principal: FORGED },
                              body: { inquiry: "INQ-1", address: "https://example.org/a", ...FORGED_BODY } });
  assert.equal(r.status, 200, r.text.slice(0, 200));
  const inner = opCalls(env).find((c) => c.route === "capturerequest");
  assert.deepEqual([inner.params.principal, inner.params.viewer, inner.params.run], ["member:ann", "member:ann", undefined]);
  noForged(inner, "capturerequest");
  env.calls.length = 0;
  await call(env, { op: "heldcaptures", token: S.ann, params: { state: "held", ...FORGED_QUERY } });
  const held = opCalls(env).find((c) => c.route === "heldcaptures");
  assert.deepEqual([held.params.state, held.params.viewer], ["held", "member:ann"]);
  noForged(held, "heldcaptures");
  env.calls.length = 0;
  await call(env, { op: "capturerequest", token: env.PROBE_TOKEN, method: "POST", params: { store: "scratch" }, body: { inquiry: "INQ-1" } });
  assert.equal(opCalls(env).find((c) => c.route === "capturerequest")?.params.principal, "class:probe");
});

/* ================================================================ R83 */

test("R83 (K3084; credentials R65–R69, R71 (6)): `recover` passes `handle` beside `role`, `code` and `password` from the body alone; `passwordresetlook` and `passwordreset` are credential-free, pinned to `bio`, relayed with only the body's `link` (and the new `password`) and the door's `source` and `country`, never an address's; none of them is in the answer", async () => {
  const LINK = "rl-0123456789abcdef0123", PW = "a new long password";
  const { env } = world({ answer: (c) => (["recover", "passwordresetlook", "passwordreset"].includes(c.route)
    ? new Response(JSON.stringify({ ok: true, result: { ok: true, live: true } })) : null) });
  const r = await call(env, { op: "recover", method: "POST", body: { handle: "ann", code: "RC-1", password: PW, extra: FORGED } });
  assert.equal(r.status, 200, r.text.slice(0, 200));
  assert.deepEqual(opCalls(env).find((c) => c.route === "recover").body, { handle: "ann", code: "RC-1", password: PW });
  for (const [op, body, want] of [["passwordresetlook", { link: LINK, extra: FORGED }, { link: LINK }],
                                  ["passwordreset", { link: LINK, password: PW, by: FORGED }, { link: LINK, password: PW }]]) {
    assert.ok(routesOf(credentialsOps).includes(op));
    assert.equal(OPS[op]?.classes, null, `${op} is public`);
    env.calls.length = 0;
    const x = await call(env, { op, method: "POST", params: { link: "rl-in-the-address" }, body, cf: { country: "NL" } });
    assert.equal(x.status, 200, `${op}: ${x.text.slice(0, 200)}`);
    const inner = opCalls(env).find((c) => c.route === op);
    assert.deepEqual([inner.ns, inner.body], ["bio", want], op);
    assert.equal(inner.params.country, "NL");
    assert.equal(inner.url.href.includes("rl-"), false, `${op}: no link in the store's address`);
    assert.equal(x.text.includes(LINK) || x.text.includes(PW), false, `${op}: nothing echoed`);
    /* pinned to `bio` */
    env.calls.length = 0;
    refused(await call(env, { op, method: "POST", params: { store: "scratch" }, body }), 400, "NAMESPACE_PINNED", "C-78.2");
    assert.equal(opCalls(env).length, 0);
  }
});

test("R83 (K3084; credentials R65, R66, R69): `unlock` and `reauth` reach credentials' routes with the caller's own session token in the `x-bio-session` header (as `signout`'s), never an address, and `password` from the body; `passwordresetlink` carries `by` from the session, the body's `member`; a caller's `session` or `by` never reaches them", async () => {
  const { env, S } = world();
  for (const op of ["unlock", "reauth", "passwordresetlink"]) {
    assert.ok(routesOf(credentialsOps).includes(op));
    env.calls.length = 0;
    const r = await call(env, { op, token: op === "passwordresetlink" ? S.founder : S.ann, method: "POST",
                                params: { session: "forged-session", by: FORGED },
                                body: { password: "pw", member: "bea", session: "forged-session", by: FORGED } });
    assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(env).find((c) => c.route === op);
    assert.equal(inner.url.href.includes(FORGED), false, `${op}: a caller's stamp in the address`);
    if (op === "passwordresetlink") assert.equal(JSON.stringify(inner.body).includes(FORGED), false, `${op}: its declared \`by\` from the body`);
    if (op !== "passwordresetlink")
      assert.equal(JSON.stringify([inner.url.href, inner.body, inner.headers]).includes("forged-session"), false, `${op}: a caller's session`);
    if (op === "passwordresetlink") assert.deepEqual([inner.params.by, inner.body.member], ["admin", "bea"]);
    else {
      assert.equal(inner.headers["x-bio-session"], S.ann, `${op}: the session in the header`);
      assert.equal(inner.url.href.includes(S.ann), false, `${op}: no session in the address`);
      assert.equal(inner.body.password, "pw");
    }
  }
});

test("R83 (K3084; credentials R65, R71 (7); interface-shell R33): a background request's `background=1` reaches the store with the op (the read is no activity there); a request without it carries none (control)", async () => {
  const { env, S } = world();
  await call(env, { op: "queue", token: S.ann, params: { background: "1" } });
  assert.equal(opCalls(env).find((c) => c.route === "queue")?.params.background, "1");
  env.calls.length = 0;
  await call(env, { op: "queue", token: S.ann });
  assert.equal(opCalls(env).find((c) => c.route === "queue")?.params.background, undefined);
});

/* ================================================================ R88 */

test("R88 (K3099; strength R40; STRENGTH #14 J1 (a)): `projectbarset` is in `IDENTITY_READS`: its author's position is asked by the door's identity stamp, each session its own (`member:<id>`, the founder's `member:admin`), beside its viewer and author; control: `strengthbar`, the group's bar, takes no identity stamp", async () => {
  const { env, S } = world();
  for (const [token, identity, author] of [[S.ann, "member:ann", "ann"], [S.founder, "member:admin", "admin"]]) {
    env.calls.length = 0;
    await call(env, { op: "projectbarset", token, method: "POST", params: { identity: FORGED, project: "PRJ-1" },
                      body: { identity: FORGED, project: "PRJ-1" } });
    const inner = opCalls(env).find((c) => c.route === "projectbarset");
    assert.ok(inner, "forwarded");
    assert.deepEqual([inner.params.identity, inner.params.author], [identity, author]);
    assert.equal(inner.url.href.includes(FORGED), false, "a caller's identity in the address");
    /* the body's copy never wins: strength's arm reads `identity` from the door's stamp after the body */
    const { strengthOps: ops } = await import("../../../src/strength/index.mjs");
    let handed = null;
    ops({ projectBarSet: (a) => { handed = a; return { ok: true }; } }, inner.url, inner.body).projectbarset();
    assert.deepEqual([handed.identity, handed.author], [identity, author]);
  }
  env.calls.length = 0;
  await call(env, { op: "strengthbar", token: S.ann, method: "POST", params: { identity: FORGED }, body: {} });
  assert.equal(opCalls(env).find((c) => c.route === "strengthbar").params.identity, undefined);
});

/* ================================================================ R89 */

test("R89 (K3104, K3137; op-declarations R61; people R37): `peopledirectory` reaches people's route as a member's read, `viewer` the session's, its query fields as sent; a caller's `viewer` never reaches it; control: a machine credential the spec does not admit is refused, nothing forwarded", async () => {
  assert.ok(routesOf(peopleOps).includes("peopledirectory"));
  const spec = OPS.peopledirectory;
  assert.ok(spec && spec.mutating === false, "a read");
  const { env, S } = world();
  const fields = { q: "smith", show: "people", office: "OFF-1", namedIn: "B-1", since: "2026-01-01", cursor: "c1", limit: "10" };
  const r = await call(env, { op: "peopledirectory", token: S.ann, params: { ...fields, ...FORGED_QUERY } });
  assert.equal(r.status, 200, r.text.slice(0, 200));
  const inner = opCalls(env).find((c) => c.route === "peopledirectory");
  assert.equal(inner.params.viewer, "member:ann");
  for (const [k, v] of Object.entries(fields)) assert.equal(inner.params[k], v, k);
  noForged(inner, "peopledirectory");
  const machine = { admin: env.ADMIN_TOKEN, probe: env.PROBE_TOKEN, daemon: env.DAEMON_TOKEN };
  const refusedClasses = Object.keys(machine).filter((k) => !(spec.machineClasses ?? spec.classes ?? []).includes(k)
                                                        || (Array.isArray(spec.machineClasses) && !spec.machineClasses.includes(k)));
  assert.ok(refusedClasses.length > 0, "the spec admits no machine class but by name");
  for (const k of refusedClasses) {
    env.calls.length = 0;
    const m = await call(env, { op: "peopledirectory", token: machine[k], params: k === "probe" ? { store: "scratch" } : {} });
    assert.equal(m.json.ok, false, `${k}: refused`);
    assert.equal(opCalls(env).some((c) => c.route === "peopledirectory"), false, `${k}: nothing forwarded`);
  }
});

/* ================================================================ R79: clockpropose (K3145) */

test("R79 (T47; K3145; action-clocks R2): `clockpropose` is declared and reaches its store route through the door for any credential its row admits, `proposer` the door's label (a session its member, a machine `class:<cls>`) and `viewer` its sight, none taken from the caller; the route is the door's own map's (`owner-ops.mjs`), so no route is `unknown op`", async () => {
  const { ownerOps: controlPlaneOwnerOps } = await import("../../../src/store-assembly/owner-ops.mjs");
  assert.ok(OPS.clockpropose, "declared");
  assert.ok(Object.keys(controlPlaneOwnerOps({}, U, null)).includes("clockpropose"), "a route of the door's own map");
  const { env, S } = world();
  for (const [token, proposer, viewer, params] of [[S.ann, "ann", "member:ann", {}], [env.PROBE_TOKEN, "class:probe", "class:probe", { store: "scratch" }]]) {
    env.calls.length = 0;
    const r = await call(env, { op: "clockpropose", token, method: "POST", params: { ...params, proposer: FORGED, ...FORGED_QUERY },
                                body: { target: "ACT-1", rule: "r-30", ...FORGED_BODY } });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    const inner = opCalls(env).find((c) => c.route === "clockpropose");
    assert.deepEqual([inner.params.proposer, inner.params.viewer, inner.body.target], [proposer, viewer, "ACT-1"]);
    noForged(inner, "clockpropose");
  }
});

/* ================================================================ R83: background (K3144) */

test("R83 (T47; K3144; admission's `background`, credentials R71 (7)): a request carrying `background=1` is handed to admission's session read as a background read (the store's `session` route asked with `background=1`, no activity) and the op's own store request keeps it; control: a request without it reads the session as activity", async () => {
  const { env, S } = world();
  await call(env, { op: "queue", token: S.ann, params: { background: "1" } });
  const looked = env.calls.filter((c) => c.route === "session");
  assert.ok(looked.length > 0, "the session was read");
  assert.ok(looked.every((c) => c.params.background === "1"), "every session read is a background one");
  env.calls.length = 0;
  await call(env, { op: "queue", token: S.ann });
  assert.ok(env.calls.filter((c) => c.route === "session").every((c) => c.params.background === undefined));
});

/* ================================================================ R84 */

test("R84 (T47; DEC-205; instance-setup R84, R86; K3149): `GET /app/assets/group-logo` answers the stored logo through instance-setup's `groupLogoAsset` — the namespace's store-internal `grouplogo` route's bytes — with its type, `no-store` and `nosniff`, reading no credential; `store=scratch` reads scratch's; controls: none set is 404 with no body; a type that is not PNG or JPEG, a refusal and a silence are the store's silence, never their bytes", async () => {
  const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
  const logo = (status, type, body) => (c) => (c.route === "grouplogo"
    ? new Response(body, { status, headers: type ? { "content-type": type } : {} }) : null);
  for (const params of [{}, { store: "scratch" }]) {
    const { env, S } = world({ answer: logo(200, "image/png", PNG) });
    const r = await call(env, { path: "/app/assets/group-logo", params, headers: { authorization: `Bearer ${S.ann}` } });
    assert.equal(r.status, 200);
    assert.deepEqual([r.headers.get("content-type"), r.headers.get("cache-control"), r.headers.get("x-content-type-options")],
                     ["image/png", "no-store", "nosniff"]);
    assert.deepEqual(env.calls.map((c) => [c.ns, c.route]), [[params.store ?? "bio", "grouplogo"]], "no credential read");
  }
  const bytes = await (await M.makeFetch({})(new Request("https://plane.example/app/assets/group-logo"),
    world({ answer: logo(200, "image/jpeg", PNG) }).env)).arrayBuffer();
  assert.deepEqual(new Uint8Array(bytes), PNG, "the bytes as stored");
  const none = await call(world({ answer: logo(404, null, null) }).env, { path: "/app/assets/group-logo" });
  assert.deepEqual([none.status, none.text], [404, ""]);
  for (const [label, answer] of [["not an image", logo(200, "text/html", "<script>")],
                                 ["a refusal", logo(400, "application/json", JSON.stringify({ ok: false, reason: "X" }))],
                                 ["a silence", () => { throw new Error("down"); }]]) {
    const { env } = world({ answer: (c) => (c.route === "grouplogo" ? answer(c) : null) });
    const r = await call(env, { path: "/app/assets/group-logo" });
    refused(r, 502, "STORE_DID_NOT_ANSWER", "C-69.2");
    assert.equal(r.text.includes("script"), false, label);
  }
});

test("R84 (T47; DEC-205; op-declarations R59; instance-setup R84, R85): `grouplogoset` and `grouplanguagesset` reach instance-setup's routes for an administrator's session with `by` the session's member, the body (the logo as JSON base64, `{raw, rawType}`; the languages) as sent, a caller's `by` deleted; `grouplanguages` is a public read relayed credential-free from `bio`, to which it is pinned (control: `store=scratch` refused NAMESPACE_PINNED)", async () => {
  for (const op of ["grouplogoset", "grouplanguagesset", "grouplanguages"]) assert.ok(OPS[op], `${op} is declared`);
  assert.equal(OPS.grouplanguages.classes, null, "grouplanguages is public");
  const { env, S } = world();
  for (const [op, body] of [["grouplogoset", { raw: "iVBORw0KGgo=", rawType: "image/png" }], ["grouplanguagesset", { languages: ["en", "es"] }]]) {
    env.calls.length = 0;
    const r = await call(env, { op, token: S.founder, method: "POST", params: { by: FORGED }, body: { ...body, by: FORGED } });
    assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(env).find((c) => c.route === op);
    assert.equal(inner.params.by, "admin");
    assert.deepEqual(inner.body, body);
  }
  env.calls.length = 0;
  const r = await call(env, { op: "grouplanguages" });
  assert.equal(r.status, 200, r.text.slice(0, 200));
  assert.deepEqual(env.calls.map((c) => [c.ns, c.route]), [["bio", "grouplanguages"]]);
  /* control: pinned to `bio` as a public read (op-declarations, K3147), so `store=scratch` is refused and nothing read */
  env.calls.length = 0;
  refused(await call(env, { op: "grouplanguages", params: { store: "scratch" } }), 400, "NAMESPACE_PINNED", "C-78.2");
  assert.equal(env.calls.length, 0);
});
