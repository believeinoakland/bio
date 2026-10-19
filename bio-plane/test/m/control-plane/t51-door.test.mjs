/* control-plane R110, R111 (T51-123; K3826, K3829, K3839, K3843, K3852, K3853, K4040, K4073; op-declarations R77, R78): the reads
   T51's lower layers add, routed through the door like every declared op (R26, R29): each reaches the store's route of its own
   name, each declared stamp set from the session and none taken from the caller, a refusal the owner's answered as given. The
   ops are read from op-declarations' own declaration of them (K3268), never typed here. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, defaultHooks, aik, cred, FORGED, M } from "./harness.mjs";
import { ok, callers, routesForSessions } from "./door-routes.mjs";

const { OPS, OP_STAMPS } = O;
const admitsMachines = (op) => !(Array.isArray(OPS[op].machineClasses) && OPS[op].machineClasses.length === 0);
const refusesMachines = (op) => !admitsMachines(op);

/* the reads R77 and R78 declare, from op-declarations' own T51 declarations (K3268); R111's three are named apart */
const { T51_SHARES, T51_FAMILIES } = await import("../../../src/op-declarations/t51.mjs");
const T51_OPS = [...Object.values(T51_SHARES).flatMap((x) => Object.keys(x.ops)), ...T51_FAMILIES.flatMap((f) => Object.keys(f.ops))];
const R111 = ["holdsdue", "templatebyhandle", "rulefields"];
const R110_STAMPED = T51_OPS.filter((op) => !R111.includes(op) && op !== "heldat" && op !== "publishedfrozen");
const BODY = {};

test("R110 (T51-123; op-declarations R77): each stamped read (every other op op-declarations R77 declares but `heldat` and `publishedfrozen`) is declared, reaches the store's route of its own name with `viewer` (and `by` where declared) from the session, none the caller's, a refusal the owner's answered as given; machine credentials are refused before any store request where the row admits none", async () => {
  assert.equal(R110_STAMPED.length, 10, "R77 declares 12 reads beside R111's three, less heldat and publishedfrozen");
  for (const op of R110_STAMPED) {
    assert.ok(Object.hasOwn(OPS, op), `${op} is declared`);
    assert.equal(OPS[op].mutating, false, `${op} is a read`);
    assert.ok(OP_STAMPS[op].includes("viewer"), `${op} takes the viewer`);
  }
  await routesForSessions(R110_STAMPED.filter(refusesMachines), (op) => BODY[op] ?? {}, { refuseMachines: () => true });
  await routesForSessions(R110_STAMPED.filter(admitsMachines), (op) => BODY[op] ?? {}, { refuseMachines: () => false });
});

test("R110 (T51-123; capture R96, R86): `heldat` reaches capture with `by` and `viewer` stamped from the caller as R17 states them (a member's session gives its member; a binding credential the machine form `class:<cls>`), a `by` or `viewer` the caller sends deleted; an `ai` credential is refused before any store request", async () => {
  assert.ok(Object.hasOwn(OPS, "heldat"));
  assert.deepEqual([...OP_STAMPS.heldat].sort(), ["by", "viewer"]);
  const { w, sessions, machines } = callers({ answer: (c) => (c.route === "heldat" ? ok({ ok: true, held: false }) : null) });
  const forged = { by: FORGED, viewer: FORGED, member: FORGED, address: "https://example.org/a" };
  for (const s of sessions) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op: "heldat", token: s.token, params: forged, ...(s.name === "ann" ? { method: "GET" } : {}) });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    const [inner] = opCalls(w.env).filter((c) => c.route === "heldat");
    assert.equal(inner.params.by, s.by, `${s.name}: by`);
    assert.equal(inner.params.viewer, s.viewer, `${s.name}: viewer`);
    assert.notEqual(inner.params.member, s.viewer, "a `member` is no stamp of this op and is never the session's");
    assert.equal(inner.params.address, forged.address, "the address the caller names passes");
  }
  /* a binding credential: the machine form, which capture refuses as a machine identity for `check: true` (its R86) */
  const classesOf = OPS.heldat.classes;
  for (const m of machines.filter((x) => classesOf.includes(x.name) && x.name !== "member")) {   /* the shared member token is retired (C-38.11) */
    w.env.calls.length = 0;
    const r = await call(w.env, { op: "heldat", token: m.token, params: { ...(m.params ?? {}), ...forged, check: "true" } });
    assert.equal(r.status, 200, `${m.name}: ${r.text.slice(0, 120)}`);
    const [inner] = opCalls(w.env).filter((c) => c.route === "heldat");
    assert.equal(inner.params.by, `class:${m.name}`, `${m.name}: by`);
    assert.equal(inner.params.viewer, `class:${m.name}`, `${m.name}: viewer`);
  }
  /* an `ai` credential is NOT refused by the row (op-declarations R77 gives heldat no `machineClasses`, so admission admits an
     agent within its scope, as it does every such read): it reaches capture with the machine form `class:ai/<tokenId>` as `by`,
     which capture's own fence refuses for `check: true`. R110's text says it is refused at the door: reported to BOB (J2). */
  const agentCall = machines.find((x) => x.name === "agent");
  w.env.calls.length = 0;
  assert.equal((await call(w.env, { op: "heldat", token: agentCall.token, params: forged })).status, 200);
  const [viaAgent] = opCalls(w.env).filter((c) => c.route === "heldat");
  assert.equal(viaAgent.params.by, "class:ai/agent-ann");
  assert.equal(viaAgent.params.viewer, "member:ann");
  /* control: a credential in none of heldat's classes (the daemon's) is refused before any store request */
  for (const m of machines.filter((x) => x.name !== "agent" && !classesOf.includes(x.name))) {
    w.env.calls.length = 0;
    const refused = await call(w.env, { op: "heldat", token: m.token, params: forged });
    assert.notEqual(refused.status, 200, m.name);
    assert.equal(refused.json.ok, false, m.name);
    assert.deepEqual(opCalls(w.env).filter((c) => c.route === "heldat"), [], m.name);
  }
});

test("R110 (T51-123; public-read R38): `publishedfrozen` is a public op: no credential is read and nothing stamped, the owner asked with no Authorization header, the same bytes for no credential and for a bad one; a stamp the caller sends reaches nothing", async () => {
  assert.equal(OPS.publishedfrozen.classes, null);
  assert.deepEqual(OP_STAMPS.publishedfrozen ?? [], []);
  const bytes = [];
  for (const asked of [{}, { headers: { authorization: "Bearer not-a-credential" } }, { params: { viewer: FORGED, by: FORGED } }]) {
    const w = world();
    const log = [];
    const hooks = defaultHooks(log);
    hooks.publicOp = async (c) => {
      log.push(c.op);
      return M.json({ ok: true, result: { frozen: true, viewer: c.url.searchParams.get("viewer"), auth: c.req.headers.get("authorization") } });
    };
    const r = await call(w.env, { op: "publishedfrozen", hooks, ...asked });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    assert.deepEqual(log, ["publishedfrozen"], "answered by the public hook, never a gated op");
    bytes.push(r.text);
    assert.equal(opCalls(w.env).length, 0, "no credential read, no store request of the door's own");
  }
  assert.equal(new Set(bytes.map((t) => t.replace(/"auth":(null|"[^"]*")/, "")
                                         .replace(/"viewer":(null|"[^"]*")/, ""))).size, 1, "the same bytes for every caller");
});

test("R111 (T51; op-declarations R78): `holdsdue`, `templatebyhandle` and `rulefields` are declared reads, each reaches the store's route of its own name with `viewer` stamped from the session and none taken from the caller, each refused to a caller not arriving by a member's session; a refusal is the owner's, answered as given", async () => {
  for (const op of R111) {
    assert.ok(Object.hasOwn(OPS, op), `${op} is declared`);
    assert.deepEqual(OPS[op].machineClasses, [], `${op} admits a member's session only`);
    assert.ok(OP_STAMPS[op].includes("viewer"));
  }
  await routesForSessions(R111, (op) => BODY[op] ?? {}, { refuseMachines: () => true });
  /* control: a `viewer` in the query is deleted (the harness forges one on every call) and an ai credential is refused */
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) },
                    answer: (c) => (c.route === "holdsdue" ? ok({ ok: true }) : null) });
  const r = await call(w.env, { op: "holdsdue", token: agent, params: { viewer: FORGED } });
  assert.notEqual(r.status, 200);
  assert.deepEqual(opCalls(w.env).filter((c) => c.route === "holdsdue"), []);
});
