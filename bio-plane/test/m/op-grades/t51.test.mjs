/* op-grades: T51's grade (R48) at the module's exports. The three reads the design's new screens add are stated absent as
   reads: each has a `read: …` reason, takes no rung and no ground, and is no act. */
import test from "node:test";
import assert from "node:assert/strict";
import { RUNGS, RUNG_ABSENT, NON_ACTS, MACHINE_REFUSALS, CONSEQUENCE_STATEMENTS, IRREVERSIBLE_WEIGHT, phoneOf } from "../../../src/op-grades/index.mjs";
import { T51_NON_ACTS } from "../../../src/op-grades/t51.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";

const READS = ["holdsdue", "templatebyhandle", "rulefields"];

/* ---- R48 ----------------------------------------------------------------------------------------------------------- */
test("R48: holdsdue, templatebyhandle and rulefields are NON_ACTS reads, each with a `read: …` reason that writes nothing, "
   + "and none has a rung or a ground", () => {
  for (const op of READS) assert.ok(Object.hasOwn(T51_NON_ACTS, op), op);
  for (const op of READS) {
    assert.equal(NON_ACTS[op], T51_NON_ACTS[op], op);
    assert.ok(NON_ACTS[op].startsWith("read: "), op);
    assert.match(NON_ACTS[op], /writes nothing$/, op);
    assert.equal(RUNGS[op], undefined, `${op} has no rung`);
    assert.equal(RUNG_ABSENT[op], undefined, `${op} has no absence ground`);
  }
  assert.match(NON_ACTS.holdsdue, /\(`action-holds` R19\)/);
  assert.match(NON_ACTS.templatebyhandle, /\(`filing-templates` R34\)/);
  assert.match(NON_ACTS.rulefields, /\(`local-facts` R18\)/);
});

test("R48: the three reads are no act (no MACHINE_REFUSALS row, no CONSEQUENCE_STATEMENTS entry, not irreversible) and each "
   + "answers phone true, the read's rule", () => {
  for (const op of READS) {
    assert.equal(Object.hasOwn(MACHINE_REFUSALS, op), false, op);
    assert.equal(Object.hasOwn(CONSEQUENCE_STATEMENTS, op), false, op);
    assert.equal(Object.hasOwn(IRREVERSIBLE_WEIGHT, op), false, op);
    assert.equal(phoneOf(op), true, op);
  }
});

/* ---- R77–R79 (op-declarations): the reads it declares for T51, each accounted here as a read ----------------------- */
test("R77 R78 R79: each read op-declarations declares for T51 has a NON_ACTS reason beginning \"read: \", and no rung, "
   + "ground or machine refusal; each is op-declarations' declared op", () => {
  const ops = Object.keys(T51_NON_ACTS);
  assert.equal(ops.length, 15, "the fourteen session reads op-declarations declares for T51 (three of them R48's) and publishedfrozen, public");
  for (const op of ops) {
    assert.ok(Object.hasOwn(OPS, op), `${op} is declared by op-declarations`);
    assert.ok(NON_ACTS[op].startsWith("read: "), op);
    assert.equal(RUNGS[op], undefined, op);
    assert.equal(RUNG_ABSENT[op], undefined, op);
    assert.equal(Object.hasOwn(MACHINE_REFUSALS, op), false, op);
  }
});
