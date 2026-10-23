/* run-productions: the op declaration of `suggest` (R27; K4206). The declaration is held true against the op as the door
   runs it: the ops map called with a URL and a body, over the real fixture, a fresh question, run and document each call. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DECLARED_OPS, runProductionsOps } from "../../../src/run-productions/index.mjs";
import { SUGGEST_KINDS } from "../../../src/run-productions/checks.mjs";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { world, Q, RUN, DOC, ALICE } from "./fixture.mjs";

const DESCRIPTION = "the ledger shows the transfer was approved twice";
const URL_ = new URL(`https://plane.test/op?author=${ALICE}&viewer=${ALICE}&principal=${ALICE}`);

/* A suggestion writes, so each call gets its own store: a second call would meet the first one's name. The name is
   supplied on every call because a version with no name meets the stand-in's own read-back, which fails in the fixture
   and not in the module (the real basis-versions refuses it with BASIS_VERSION_REFUSED; see R27). */
function call(op, fields) {
  const w = world();
  w.inquiry(Q); w.run(RUN); w.doc(DOC);
  return runProductionsOps(w.p, URL_, { name: "a reading", legs: [], grounds: [], ...fields })[op]();
}

const VALUES = { target: Q, kind: "basis-version", run: RUN, description: DESCRIPTION };

test("R27: suggest declares its classes, mutating flag, weight and the fields its arm reads and requires", () => {
  const d = DECLARED_OPS.suggest;
  assert.deepEqual(Object.keys(DECLARED_OPS), ["suggest"]);
  assert.deepEqual(d.classes, ["admin", "member", "probe"]);
  assert.equal(d.mutating, true);
  assert.equal(d.weight, "reversible");
  assert.deepEqual(d.fields.requires, ["target", "kind", "run", "description"]);
  for (const f of ["target", "kind", "run", "name", "description", "claim", "legs", "grounds", "level", "observed_at"]) {
    assert.ok(d.fields.accepts.includes(f), `${f} is read by the arm, so it is accepted`);
  }
});

test("R27: the suggest declaration holds against the op as the door runs it (declaredOpHolds)", async () => {
  for (const [op, declaration] of Object.entries(DECLARED_OPS)) {
    await declaredOpHolds({ op, declaration, values: VALUES, call: (fields) => call(op, fields) });
  }
});

test("R27: a kind outside SUGGEST_KINDS is refused naming kind, and a kind in the set is not refused naming it (control)", () => {
  const unknown = call("suggest", { ...VALUES, kind: "new-version" });
  assert.equal(unknown.code, "SUGGEST_UNKNOWN_KIND");
  assert.match(unknown.detail, /\bkind\b/, "the refusal names the field");

  const absent = call("suggest", { ...VALUES, kind: undefined });
  assert.equal(absent.code, "SUGGEST_UNKNOWN_KIND");
  assert.match(absent.detail, /\bkind\b/, "an absent kind is named too");

  const inSet = call("suggest", VALUES);
  assert.equal(inSet.ok, true, JSON.stringify(inSet).slice(0, 300));
  assert.ok(Object.keys(SUGGEST_KINDS).includes("basis-version"));
});
