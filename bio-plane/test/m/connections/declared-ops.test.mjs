/* connections R71 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door
   runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is
   refused naming it, and a field outside accepts is dropped or refused naming it. The op is asked of a fresh world each time,
   through the ops map with the stamps in the address and the fields in both the address and the body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, connectionsOps } from "../../../src/connections/index.mjs";
import { world, V, sha } from "./fixture.mjs";

const E = "ENT-2026-0001", F = "ENT-2026-0002";
const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";
const PAGE = { kind: "pdf-page", page: 3 };
const TEXT_A = "the commission is part of the department", TEXT_B = "beta";
const held = new Set();

/* two answers are the same when they differ only by a generated theme id or a clock reading */
const norm = (x) => JSON.stringify(x).replace(/THEME-\d{4}-\d{4}-[0-9a-f]+/g, "THEME").replace(/\d{4}-\d\d-\d\dT[\d:.]+Z?/g, "T");
const same = (x, y) => norm(x) === norm(y);
/* a refusal names a field by the code its arm refuses with; nothing else counts */
const named = (codes) => (answer, field) => !!answer && typeof answer === "object"
  && (codes[field] || []).some((c) => answer.code === c || answer.reason === c);

/* a world with two members, two documents and a declared relation, and the things the ops are asked about */
async function base() {
  const w = world();
  w.member("alice"); w.member("bob");
  w.entity(E, "The Commission"); w.entity(F, "The Department");
  const [a] = w.doc(A, [TEXT_A]);
  const [b] = w.doc(B, [TEXT_B]);
  w.receipt("https://example.org/a", a, "2026-09-26T00:00:00Z", "direct");
  w.resolve(a, A, "Ord. 1", E, "A"); w.read(a, A, "Ord. 1", [2]);
  w.resolve(b, B, "Ord. 1", E, "A"); w.read(b, B, "Ord. 1", [null]);
  w.k.derive({ entityId: E });
  const rel = w.entities.declareRelation({ fromEntity: E, toEntity: F, relation: "member_of", justification: "charter",
                                           citation: "Charter art. 2", declaredBy: "alice" });
  const theme = w.k.declareTheme({ name: "Deferred maintenance", test: "the document names a repair put off", declarer: "alice" });
  return { w, a, b, rel: rel.relation_id, theme: theme.theme_id };
}
const placed = async () => { const env = await base(); env.w.k.placeInTheme({ theme: env.theme, target: A, placer: "alice", viewer: V("alice") }); return env; };
const attached = async () => {
  const env = await base();
  const r = env.w.k.attachStepSource({ relation: env.rel, captureSha: env.a, extent: PAGE, basis: "page 3 says so", member: "alice", viewer: V("alice") });
  return { ...env, sid: r.step_source.id };
};

/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps, setup = base, adapt = null) => async (given) => {
  const env = await setup();
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps,
    ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  return await connectionsOps(env.w.k, new URL("http://x/?" + q), fields, {})[op]();
};
const holds = (op, stamps, codes, values, setup, adapt) => (held.add(op),
  declaredOpHolds({ op, declaration: DECLARED_OPS[op], call: mk(op, stamps, setup, adapt), refusedNaming: named(codes), values, same }));
const MEMBER = { author: "alice", viewer: V("alice") };

test("R71 connections declares only ops its own ops map serves, each with the shape the declaration pass fixes", async () => {
  const { w } = await base();
  const served = connectionsOps(w.k, new URL("http://x/?op=x"), null, {});
  for (const [op, d] of Object.entries(DECLARED_OPS)) {
    assert.equal(typeof served[op], "function", `${op} is served by this module`);
    assert.equal(typeof d.mutating, "boolean", op);
    assert.ok(Array.isArray(d.classes) && d.classes.length, op);
    assert.ok(typeof d.weight === "string" && d.weight, op);
    assert.ok(typeof d.description === "string" && d.description, op);
    assert.ok(Array.isArray(d.fields.accepts) && Array.isArray(d.fields.requires), op);
    for (const r of d.fields.requires) for (const f of [r].flat()) assert.ok(d.fields.accepts.includes(f), `${op}: ${f} is required, so accepted`);
  }
  assert.equal(DECLARED_OPS.themeread.mutating, false);
  assert.deepEqual(DECLARED_OPS.stepsource.machineClasses, []);
  assert.equal(DECLARED_OPS.connect.fields.accepts.includes("assertedBy"), false, "the door's stamp is not a field");
});

test("R71 connections declares connect: an entity by id or entityId is required, and a field outside accepts is dropped", async () => {
  await holds("connect", { viewer: V("alice") }, { entityId: ["NO_ENTITY"], id: ["NO_ENTITY"] }, { entityId: E, id: E });
});

test("R71 connections declares connectionassert: both documents and the basis are required", async () => {
  await holds("connectionassert", MEMBER, { a: ["NO_SUCH_DOCUMENT"], b: ["NO_SUCH_DOCUMENT"], basis: ["CONNECTION_ASSERT_NO_BASIS"] },
              { a: A, b: B, basis: "both are about the same ordinance" });
});

test("R71 connections declares connectionchoose: the end, the other end, the subject and the mention are required", async () => {
  await holds("connectionchoose", MEMBER,
    { capture: ["CONNECTION_CHOICE_NO_CONNECTION"], other: ["CONNECTION_CHOICE_NO_CONNECTION"], entity: ["CONNECTION_CHOICE_NO_CONNECTION"],
      ref: ["CONNECTION_CHOICE_NOT_A_MENTION"] },
    { capture: sha(TEXT_A), other: sha(TEXT_B), entity: E, ref: "Ord. 1" });
});

test("R71 connections declares stepsource: the relation, the capture, the extent and the basis are required", async () => {
  await holds("stepsource", { member: "alice", viewer: V("alice") },
    { relation: ["NO_SUCH_RELATION"], captureSha: ["CAPTURE_NOT_HELD"], extent: ["EXTENT_MALFORMED"], basis: ["STEP_SOURCE_NO_BASIS"] },
    { captureSha: sha(TEXT_A), extent: PAGE, basis: "page 3 says the commission sits within the department" }, base,
    (f, env) => ("relation" in f ? { ...f, relation: env.rel } : f));
});

test("R71 connections declares stepsourcewithdraw: the source and the reason are required", async () => {
  await holds("stepsourcewithdraw", { member: "alice", viewer: V("alice") },
    { id: ["NO_SUCH_STEP_SOURCE"], reason: ["NO_REASON"] }, { reason: "the page says the opposite" }, attached,
    (f, env) => ("id" in f ? { ...f, id: env.sid } : f));
});

test("R71 connections declares themedeclare: the name and the test are required", async () => {
  await holds("themedeclare", { declarer: "alice", viewer: V("alice") }, { name: ["THEME_NO_NAME"], test: ["THEME_NO_TEST"] },
              { name: "Deferred maintenance", test: "the document names a repair put off" });
});

test("R71 connections declares themeplace: the theme and the target are required, the note is not", async () => {
  await holds("themeplace", { placer: "alice", viewer: V("alice") },
    { theme: ["THEME_NOT_FOUND"], target: ["THEME_TARGET_NOT_FOUND"] }, { target: A }, base,
    (f, env) => ("theme" in f ? { ...f, theme: env.theme } : f));
});

test("R71 connections declares themepropose: the theme and the target are required, the note is not", async () => {
  await holds("themepropose", { proposer: "alice", viewer: V("alice") },
    { theme: ["THEME_NOT_FOUND"], target: ["THEME_TARGET_NOT_FOUND"] }, { target: A }, base,
    (f, env) => ("theme" in f ? { ...f, theme: env.theme } : f));
});

test("R71 connections declares themeread: nothing is required, and a field outside accepts is dropped", async () => {
  await holds("themeread", { viewer: V("alice") }, {}, {});
  const { w, theme } = await base();
  const read = (params) => connectionsOps(w.k, new URL("http://x/?" + new URLSearchParams({ op: "themeread", viewer: V("alice"), ...params })), null, {}).themeread();
  assert.equal(read({ id: theme }).theme_id, theme, "id is read");
  assert.equal(read({ q: "no such idea" }).themes.length, 0, "q is read");
  assert.equal(read({ limit: "1" }).limit, 1, "limit is read");
});

test("R71 connections declares themewithdraw: the theme, the target and the reason are required", async () => {
  await holds("themewithdraw", { actor: "alice", viewer: V("alice") },
    { theme: ["THEME_NOT_FOUND"], target: ["THEME_TARGET_NOT_FOUND"], reason: ["THEME_WITHDRAW_NO_REASON"] },
    { target: A, reason: "it does not pass the test" }, placed,
    (f, env) => ("theme" in f ? { ...f, theme: env.theme } : f));
});

test("R71 connections holds every declaration it makes true against its op", () => {
  assert.deepEqual([...held].sort(), Object.keys(DECLARED_OPS).sort());
});
