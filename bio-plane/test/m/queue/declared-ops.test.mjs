/* queue R92 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. The calls go through `queueOps`, as the plane's one
   route map does, over a world with a member who has joined a project. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, queueOps } from "../../../src/queue/index.mjs";
import { world, NOW } from "./world.mjs";

const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
/* a refusal names a field by a word of its code or detail, or by a code the table gives for it; an answer that succeeded
   refuses nothing, whatever its detail says */
const named = (codes = {}) => (answer, field) => {
  if (!answer || typeof answer !== "object" || answer.ok === true) return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c)) return true;
  return new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.reason, answer.detail].map(words).join(" "));
};
const setup = () => {
  const w = world();
  w.member("alice"); w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice"); w.bundle("INQ-1", "inquiry");
  return w;
};
/* the call as the door runs it: the stamps in the address, the fields as the body, the arm asked of a fresh world */
const mk = (op, stamps) => async (fields) => {
  const w = setup();
  const url = new URL("http://x/?" + new URLSearchParams({ op, ...stamps }));
  return queueOps(w.q, url, fields)[op]();
};
const ALICE = { member: "alice", viewer: "member:alice", identity: "member:alice" };

test("R92 queue declares proposedispose: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "proposedispose", declaration: DECLARED_OPS.proposedispose,
    call: async (fields) => { const w = setup(); const url = new URL("http://x/?" + new URLSearchParams({ op: "proposedispose", ...ALICE }));
                              return queueOps(w.q, url, { ...fields, decidedBy: "alice" }).proposedispose(); },
    refusedNaming: named({ to: ["NOT_A_DISPOSITION"] }),
    values: { project: "PRJ-1", finding: "FINDING::stance-changed-here-not-elsewhere::INQ-1::PRJ-1", to: "dismissed", reason: "not worth pursuing" },
    same: sameCode });
});

test("R92 queue declares queuemute: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "queuemute", declaration: DECLARED_OPS.queuemute, call: mk("queuemute", ALICE), refusedNaming: named(),
    values: { item: "FINDING::source-modified::DOC-1", case: "PRJ-1" }, same: sameCode });
});

test("R92 queue declares queuesnooze: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "queuesnooze", declaration: DECLARED_OPS.queuesnooze, call: mk("queuesnooze", ALICE), refusedNaming: named(),
    values: { case: "PRJ-1", until: new Date(NOW + 86400000).toISOString() }, same: sameCode });
});

test("R92: the three rows are the ops' existing rows (control): classes, mutating, weight, description, and a field the arm reads is declared", async () => {
  const O = await import("../../../src/op-declarations/index.mjs?queue-declared");
  const G = await import("../../../src/op-grades/index.mjs?queue-declared");
  assert.deepEqual(G.registerDeclaredOps({ queue: DECLARED_OPS }).agreed.sort(), ["proposedispose", "queuemute", "queuesnooze"]);
  O.registerDeclaredOps({ queue: DECLARED_OPS });
  for (const op of ["proposedispose", "queuemute", "queuesnooze"]) assert.deepEqual(O.declaredFields(op), DECLARED_OPS[op].fields, op);
  /* `definitionVersion` is what the instance arm reads (the disposition's `requires`), never the snake-case spelling */
  assert.ok(DECLARED_OPS.proposedispose.fields.accepts.includes("definitionVersion"));
  assert.ok(!DECLARED_OPS.proposedispose.fields.accepts.includes("definition_version"));
});

test("R92: each description is read by key, queue.declared.proposedispose, queue.declared.queuemute and queue.declared.queuesnooze: a sentence the word list answers for that id once it holds it", async () => {
  const W = await import("../../../src/setup-words/index.mjs");
  for (const op of ["proposedispose", "queuemute", "queuesnooze"]) {
    const d = DECLARED_OPS[op].description;
    assert.equal(typeof d, "string");
    assert.ok(d.trim().length > 0, op);
    if (W.hasWord(`queue.declared.${op}`)) assert.equal(W.word(`queue.declared.${op}`), d, `${op}: the word list's sentence`);
  }
});
