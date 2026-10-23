/* record-core R85, R86 (T51; B2, K4259): `allocid` is declared in DECLARED_OPS beside the ops map, and its declaration holds
   against the arm as the door runs it (test-support R15); an allocid call with no prefix or no year is refused naming what
   it lacks and allocates nothing, the same call with both allocating as before (R86). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DECLARED_OPS, recordCoreOps, recordOf, RECORD_CORE_CHECKS } from "../../../src/record-core/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { storage } from "./storage.mjs";

const fresh = () => { const s = storage(); const rc = recordOf({ storage: s }); rc.migrate(); return { s, rc }; };
const rows = (s, q, ...a) => [...s.sql.exec(q, ...a)];
const opsUrl = (op, params = {}) => { const u = new URL(`https://plane.invalid/?op=${op}`); for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v); return u; };
/* the door's arm, as the router calls it: the fields as the query, the body absent */
const allocid = (rc, params) => recordCoreOps(rc, opsUrl("allocid", params), null, {}).allocid();
/* two successful allocations answer the same thing whatever counter each reached; a refusal is the same when its code is */
const sameAnswer = (x, y) => (x.id === undefined) === (y.id === undefined) && (x.reason ?? x.code) === (y.reason ?? y.code);

test("R85 record-core declares allocid as a substrate write that admin, member and probe callers may send", () => {
  const d = DECLARED_OPS["allocid"];
  assert.deepEqual(d.classes, ["admin", "member", "probe"]);
  assert.equal(d.mutating, true);
  assert.equal(d.weight, "substrate");
  assert.equal(d.needs, "contribute");
  assert.deepEqual(d.fields, { accepts: ["prefix", "year"], requires: ["prefix", "year"] });
  assert.equal(d.description, localize("record-core.declared.allocid", "substrate: id allocation"));
});

test("R85 record-core declares allocid: its requires alone raise no refusal naming a declared field, each missing one is refused naming it, and a field outside accepts is dropped", async () => {
  await declaredOpHolds({ op: "allocid", declaration: DECLARED_OPS["allocid"], same: sameAnswer,
    call: (fields) => { const { rc } = fresh(); return allocid(rc, fields); } });
});

test("R86 allocIdOp refuses a call with no prefix, or with no year, naming what it lacks, and allocates nothing (control: both given allocates)", () => {
  const { s, rc } = fresh();
  const noPrefix = allocid(rc, { year: "2026" });
  assert.equal(noPrefix.ok, false);
  assert.equal(noPrefix.code, "ALLOCID_PREFIX_REQUIRED");
  assert.equal(noPrefix.check, RECORD_CORE_CHECKS.ALLOCID_PREFIX_REQUIRED.check);
  const noYear = allocid(rc, { prefix: "INFO" });
  assert.equal(noYear.ok, false);
  assert.equal(noYear.code, "ALLOCID_YEAR_REQUIRED");
  assert.equal(noYear.check, RECORD_CORE_CHECKS.ALLOCID_YEAR_REQUIRED.check);
  assert.deepEqual(rows(s, `SELECT scope FROM seq`), [], "no counter stepped by a refused call");
  assert.deepEqual(allocid(rc, { prefix: "INFO", year: "2026" }), { id: "INFO-2026-0001" }, "control: both given allocates");
});
