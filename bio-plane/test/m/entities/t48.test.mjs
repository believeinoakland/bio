/* entities' T48 work at its interface (T48-82; K231, K275, K3207): R53, the one answer to an entity that is registered but
   is not of kind `proceeding`, `notAProceeding`, and its one row (C-91.9). Each caller's refusal (events R34, lines R13,
   actions R65, following R29) is asserted equal to it in that caller's own job (events R52, lines R23, actions R104,
   following R31). */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { notAProceeding, NOT_A_PROCEEDING_DETAIL, noSuchEntity, noEntity, ENTITY_CHECKS, IDSPACE_CHECKS }
  from "../../../src/entities/index.mjs";

const TRANSLATION = "This is asked of a proceeding, such as a case before a court or a board, and the subject named is "
  + "registered as another kind. Name the proceeding itself. Nothing was written.";

test("R53 NOT_A_PROCEEDING's one row is this module's C-91.9, its where naming notAProceeding, its sentence naming no act and no place (R31)", () => {
  const row = ENTITY_CHECKS.NOT_A_PROCEEDING;
  assert.deepEqual([row.check, row.where], ["C-91.9", "src/entities/index.mjs notAProceeding > is-proceeding-kind"]);
  assert.equal(row.translation, TRANSLATION);
  assert.ok(Object.isFrozen(row));
  assert.ok(!/oakland|alameda|legistar/i.test(row.translation), "R31: no place");
  assert.ok(!/\b(?:this|the) instance\b|\binstance's\b|\bcopy\b|\bplane\b|\bserver\b/i.test(row.translation + NOT_A_PROCEEDING_DETAIL),
            "DEC-149: no 'instance', 'copy', 'plane' or 'server'");
  assert.ok(!/\baction\b|\bfollow|\bline\b|\bstatus\b/i.test(row.translation), "no act is named, so it reads true for every caller");
  const checks = [...Object.values(ENTITY_CHECKS), ...Object.values(IDSPACE_CHECKS)].map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length, "no other row of this module shares C-91.9");
  /* control: one row for the code, apart from R36's and R37's */
  assert.equal(Object.keys(ENTITY_CHECKS).filter((k) => k === "NOT_A_PROCEEDING").length, 1);
  assert.notEqual(row.check, ENTITY_CHECKS.NO_SUCH_ENTITY.check);
  assert.notEqual(row.check, ENTITY_CHECKS.NO_ENTITY.check);
});

test("R53 notAProceeding answers the one refusal: reason and code NOT_A_PROCEEDING, its row's check and translation, the caller's detail named, else a fixed default", () => {
  const row = ENTITY_CHECKS.NOT_A_PROCEEDING;
  const a = notAProceeding("status as of a date is read of an entity of kind proceeding");
  assert.deepEqual(Object.keys(a).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
  assert.deepEqual([a.ok, a.reason, a.code, a.check, a.translation, a.detail],
                   [false, "NOT_A_PROCEEDING", "NOT_A_PROCEEDING", "C-91.9", row.translation,
                    "status as of a date is read of an entity of kind proceeding"]);
  /* each caller names its own sentence: two callers, two details, one code, row and translation */
  const b = notAProceeding("this read is asked of an entity of kind proceeding");
  assert.deepEqual({ ...b, detail: null }, { ...a, detail: null });
  assert.notEqual(b.detail, a.detail);
  /* no sentence, or one that is not a sentence: the fixed default, the same every time */
  assert.ok(typeof NOT_A_PROCEEDING_DETAIL === "string" && NOT_A_PROCEEDING_DETAIL.length > 0);
  for (const d of [undefined, null, "", "   ", 7, {}, ["x"], true]) {
    assert.doesNotThrow(() => notAProceeding(d), String(d));
    assert.deepEqual(notAProceeding(d), { ...a, detail: NOT_A_PROCEEDING_DETAIL }, String(d));
  }
  assert.deepEqual(notAProceeding(), { ...a, detail: NOT_A_PROCEEDING_DETAIL });
  /* control: not either of the other two entity refusals */
  assert.notEqual(a.reason, noSuchEntity("ENT-2026-0001").reason);
  assert.notEqual(a.reason, noEntity().reason);
});

test("R53 notAProceeding's extra adds a caller's own fields (such as entity_id or kind) beside the answer and never replaces one of them; it never throws", () => {
  const base = notAProceeding("d");
  const x = notAProceeding("d", { entity_id: "ENT-2026-0007", kind: "person" });
  assert.deepEqual(x, { ...base, entity_id: "ENT-2026-0007", kind: "person" });
  const hostile = notAProceeding("d", { ok: true, reason: "OTHER", code: "X", check: "C-0", translation: "t", detail: "e", field: "proceeding" });
  assert.deepEqual(hostile, { ...base, field: "proceeding" }, "extra replaces none of the answer's fields");
  for (const extra of [null, undefined, 7, "s", [1, 2], new Proxy({}, { ownKeys() { throw new Error("hostile"); } })]) {
    assert.doesNotThrow(() => notAProceeding("d", extra));
    assert.deepEqual(notAProceeding("d", extra), base, String(extra));
  }
});

test("R53 notAProceeding writes nothing: a pure function of its arguments, the registry untouched", () => {
  const { e, rows } = world();
  const office = e.createEntity({ note: "a subject the test registers", kind: "office", label: "Harbour Office" }).entity_id;
  const count = () => rows(`SELECT (SELECT COUNT(*) FROM entities) + (SELECT COUNT(*) FROM entity_aliases)
                             + (SELECT COUNT(*) FROM entity_proceedings) AS n`)[0].n;
  const before = count();
  notAProceeding("asked of a proceeding", { entity_id: office });
  assert.equal(count(), before);
  /* the condition it answers: the entity is held and of another kind; R45's proceedingOf agrees it is no proceeding */
  assert.equal(e.has(office), true);
  assert.equal(e.readEntity({ entityId: office }).entity.kind, "office");
  assert.equal(e.proceedingOf(office), null);
});
