/* calculations: money over calculations, the ingest writer and joins by person (R12–R15). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, R } from "./fixture.mjs";
import { INGEST_STAMP } from "../../../src/calculations/index.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const PERIOD = { from: "2025-07-01", to: "2026-06-30" };
const SUM = R([{ op: "sum", from: "t", field: "amount", as: "total" }], "total");
const total = (w, ids, recipe = SUM) => w.c.create({ question: "How much?", period: PERIOD, kind: "total", inputs: [{ name: "t", money: ids }], recipe, by: V("bob") });

test("R12 a total over money facts is refused by name across kind, phase or stage, basis, currency or period (money.summable, whose codes are calc-grammar's); a total across funds that includes interfund transfers is answered with the interfund flag", async () => {
  const w = seeded();
  const base = { amount: "100", kind: "payment", phase: "actual", stage: "paid", basis: "cash", currency: "USD", period: PERIOD };
  const a = w.fact(base);
  const cases = [
    ["SUM_MIXED_KIND", { kind: "fee charged", stage: "collected" }],
    ["SUM_MIXED_STAGE", { phase: "adopted", stage: undefined }],
    ["SUM_MIXED_STAGE", { stage: "incurred" }],
    ["SUM_MIXED_BASIS", { basis: "accrual" }],
    ["SUM_MIXED_CURRENCY", { currency: "EUR" }],
    ["SUM_MIXED_PERIOD", { period: { from: "2024-07-01", to: "2025-06-30" } }],
  ];
  for (const [want, diff] of cases) {
    const b = w.fact({ ...base, ...diff });
    const r = await total(w, [a, b]);
    assert.equal(code(r), want, JSON.stringify(diff));
    assert.ok(r.detail);
  }
  assert.equal(w.count("calculations"), 0, "no refused total is written");
  /* a filtered sum is judged on the rows it sums (calc-grammar R13): selecting one stage sums cleanly */
  const paid = w.fact(base), incurred = w.fact({ ...base, stage: "incurred", amount: "40" });
  const sel = await total(w, [paid, incurred], R([{ op: "select", from: "t", where: [{ field: "stage", test: "eq", value: "actual/paid" }], as: "p" },
    { op: "sum", from: "p", field: "amount", as: "total" }], "total"));
  assert.equal(sel.results.output.value, "100");
  /* the interfund flag */
  const tr = { ...base, kind: "transfer" };
  const city = w.parties().from, vendor = w.parties().to;
  const general = w.entity("General Fund", "fund"), parks = w.entity("Parks Fund", "fund");
  const x = w.fact({ ...tr, from: { entity: city, fund: general }, to: { entity: city, fund: parks } });
  const y = w.fact({ ...tr, amount: "5", from: { entity: city, fund: parks }, to: { entity: vendor } });
  const r = await total(w, [x, y]);
  assert.equal(r.ok, true);
  assert.equal(r.results.output.value, "105");
  assert.deepEqual(r.results.interfund[0].transfers.map((t) => [t.fact_id, t.from_fund, t.to_fund]), [[x, general, parks]], "money's interfund flag, as it names it");
  assert.match(r.results.interfund[0].says, /net/);
  const plain = await total(w, [a, paid]);
  assert.equal(plain.results.interfund, undefined, "no transfer between funds, no flag");
});

test("R13 no act of this module records a money fact whose source is a CALC-, and no result is ever written as a money fact", async () => {
  const w = seeded();
  const f = w.fact({ amount: "10" }), g = w.fact({ amount: "20" });
  const c = await total(w, [f, g]);
  await w.c.accept({ calcId: c.calc_id, by: V("carol") });
  await w.c.recompute({ calcId: c.calc_id });
  await w.c.read({ calcId: c.calc_id, viewer: V("bob") });
  assert.equal(w.money.calls.length, 0, "creating, accepting, recomputing and reading a total record no money fact");
  /* the ingest writer's facts cite a canonical table row, never a calculation */
  const t = await w.table("payer,payee,amount\nP001,P002,5\n", [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }],
    { roles: { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } } });
  w.person("Pat Quill", "P001");
  w.person("Lee Quill", "P002");
  const b = w.c.adoptBinding({ table: t.sha, roles: { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
    stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } }, by: V("bob") });
  const ing = await w.c.ingestMoney({ binding: b.binding, rows: [0], by: V("bob") });
  assert.equal(ing.written.length, 1);
  for (const call of w.money.calls) assert.doesNotMatch(JSON.stringify(call.source), /CALC-/);
  assert.deepEqual(w.money.calls[0].source, { table: t.sha, row: 0, binding: b.binding });
});

test("R14 adoptBinding records a member's adoption of a table's money roles; ingestMoney writes money facts through money.recordFact, machine-attributed, only at a member's request, only from an adopted binding, only for rows whose payer and payee each resolve through an identifier, each citing its canonical row; rows not written are listed with their reason; all rows only with rows: all and a reason", async () => {
  const w = seeded();
  const fields = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }, { name: "fund", type: "string" }];
  const roles = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", crosswalk: null }, amount: { role: "amount" }, fund: { role: "fund" } };
  const pat = w.person("Pat Quill", "P001");
  const v2 = w.entity("Harbour Supply", "institution"), v9 = w.entity("Dock Works", "institution");
  const cw = await w.table(`vendor_no,entity\nS-00002,${v2}\nS-00009,${v9}\n`, [{ name: "vendor_no", type: "string" }, { name: "entity", type: "string" }],
    { roles: { vendor_no: { role: "crosswalk_from" }, entity: { role: "crosswalk_to" } } });
  roles.payee = { role: "payee", crosswalk: { table: cw.sha, from: "vendor_no", to: "entity" } };
  const gf = w.entity("General Fund", "fund");
  const t = await w.table(`payer,payee,amount,fund\nP001,S-00002,"$1,000",${gf}\nP001,Somebody,5,${gf}\nP777,S-00009,7,${gf}\nP001,S-00009,oops,${gf}\nP001,S-00009,9,${gf}\n`, fields, { roles });
  const bindRoles = { amount: "amount", payer: "payer", payee: "payee", fund: "fund", kind: { value: "payment" }, phase: { value: "actual" },
    stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "FY2025-26" } };
  /* adoptBinding's refusals */
  assert.equal(code(w.c.adoptBinding({ table: t.sha, roles: bindRoles, by: MACHINE })), "MEMBER_ACT_ONLY");
  assert.equal(code(w.c.adoptBinding({ table: "0".repeat(64), roles: bindRoles, by: V("bob") })), "NO_SUCH_TABLE");
  assert.equal(code(w.c.adoptBinding({ table: t.sha, roles: { ...bindRoles, payee: undefined }, by: V("bob") })), "BINDING_ROLES", "names payee");
  assert.equal(code(w.c.adoptBinding({ table: t.sha, roles: { ...bindRoles, amount: "fund" }, by: V("bob") })), "BINDING_ROLES", "a column not declared with that role");
  assert.equal(code(w.c.adoptBinding({ table: t.sha, roles: { ...bindRoles, importance: "fund" }, by: V("bob") })), "BINDING_ROLES");
  const b = w.c.adoptBinding({ table: t.sha, roles: bindRoles, by: V("bob") });
  assert.equal(b.ok, true);
  assert.equal(w.c.adoptBinding({ table: t.sha, roles: bindRoles, by: V("carol") }).already, true);
  assert.deepEqual(w.c.bindingOf(b.binding).adopted, true, "money reads the adoption (its R4)");
  assert.equal(w.c.bindingOf(b.binding).capture_sha, t.source.capture_sha, "with the capture the table was read from (K1563 (6))");
  assert.equal(w.c.bindingOf(b.binding).table, t.sha);
  assert.equal(w.c.bindingOf("nope"), null);
  /* ingestMoney's refusals */
  assert.equal(code(await w.c.ingestMoney({ binding: b.binding, rows: [0], by: MACHINE })), "MEMBER_ACT_ONLY", "only at a member's request");
  assert.equal(code(await w.c.ingestMoney({ binding: "x", rows: [0], by: V("bob") })), "NO_SUCH_BINDING", "only from an adopted binding");
  assert.equal(code(await w.c.ingestMoney({ binding: b.binding, rows: [], by: V("bob") })), "NO_ROWS");
  assert.equal(code(await w.c.ingestMoney({ binding: b.binding, rows: "all", by: V("bob") })), "NO_REASON", "every row only with a stated reason");
  assert.equal(w.money.calls.length, 0);
  const r = await w.c.ingestMoney({ binding: b.binding, rows: [0, 1, 2, 3, 4, 9], by: V("bob") });
  assert.equal(r.ok, true);
  assert.deepEqual(r.written.map((x) => x.row), [0, 4], JSON.stringify(r.not_written));
  assert.deepEqual(r.not_written.map((x) => [x.row, x.reason]), [[1, "PAYEE_NOT_IDENTIFIED"], [2, "PAYER_NOT_IDENTIFIED"], [3, "AMOUNT_NOT_READ"], [9, "NO_SUCH_ROW"]]);
  const fact = w.money.calls[0];
  assert.equal(fact.by, INGEST_STAMP, "machine-attributed");
  assert.equal(fact.method, "table_binding", "with the machine's method (K1573)");
  assert.equal(r.asked_by, V("bob"), "at the member's request, recorded");
  assert.deepEqual({ amount: fact.amount, as_read: fact.as_read, currency: fact.currency, kind: fact.kind, phase: fact.phase, stage: fact.stage, basis: fact.basis, period: fact.period },
    { amount: "1000", as_read: "$1,000", currency: "USD", kind: "payment", phase: "actual", stage: "paid", basis: "cash", period: { fiscal: "FY2025-26" } }, "a fiscal key money maps through the profile (its R1)");
  assert.deepEqual(fact.from, { entity: pat, as_written: "P001", fund: gf }, "resolved through the person scheme (entities.entityByIdentifier)");
  assert.deepEqual(fact.to, { entity: v2, as_written: "S-00002" }, "resolved through the captured crosswalk");
  assert.deepEqual(fact.source, { table: t.sha, row: 0, binding: b.binding }, "cites its canonical row");
  /* a fact money refuses is listed not written, with money's reason */
  const bad = w.c.adoptBinding({ table: t.sha, roles: { ...bindRoles, kind: { value: "nonsense" } }, by: V("bob") });
  const r2 = await w.c.ingestMoney({ binding: bad.binding, rows: "all", reason: "the whole ledger is the request's subject", by: V("bob") });
  assert.deepEqual(r2.written, []);
  assert.ok(r2.not_written.some((x) => x.reason === "UNKNOWN_MONEY_KIND"));
  assert.equal(w.rows(`SELECT * FROM calc_ingests`).length, 2, "each ingest asked for is recorded");
});

test("R15 a join from a table to registered entities, persons included, runs only through an id space or a captured crosswalk declared as one; a join on a name alone is refused JOIN_NOT_BY_IDENTIFIER; rows may be grouped by person", async () => {
  const w = seeded();
  const pay = await w.table("person,amount\np001,10\nP 001,5\np002,7\n", [{ name: "person", type: "string" }, { name: "amount", type: "number" }],
    { roles: { person: { role: "person_key", space: "person" } } });
  const reg = await w.table("person,name\nP001,A. Clerk\nP002,B. Clerk\n", [{ name: "person", type: "string" }, { name: "name", type: "string" }],
    { roles: { person: { role: "person_key", space: "person" } } });
  const inputs = [{ name: "pay", table: pay.sha }, { name: "reg", table: reg.sha }];
  const tables = [{ name: "pay", kind: "table" }, { name: "reg", kind: "table" }];
  const joined = (join) => R([{ op: "join", left: "pay", right: "reg", on: { left: "person", right: "person" }, ...join, as: "j" },
    { op: "group", from: "j", by: ["reg.person"], measure: { op: "sum", field: "amount" }, as: "by_person" }], "by_person", tables);
  const c = { question: "Paid per person?", period: PERIOD, kind: "total", inputs, by: V("bob") };
  const ok = await w.c.create({ ...c, recipe: joined({ space: "person" }) });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.results.output.rows.map((r) => [r["reg.person"], r.sum.value]), [["P001", "15"], ["P002", "7"]], "grouped by person, through the id space's normal form");
  for (const join of [{}, { space: "name" }, { space: "label" }]) {
    const r = await w.c.create({ ...c, recipe: joined(join) });
    assert.equal(code(r), "JOIN_NOT_BY_IDENTIFIER", JSON.stringify(join));
    assert.equal(r.step, "j");
  }
  /* a crosswalk declared as one, and a table that is not */
  const cw = await w.table("from,to\np001,P001\nP 001,P001\np002,P002\n", [{ name: "from", type: "string" }, { name: "to", type: "string" }],
    { roles: { from: { role: "crosswalk_from" }, to: { role: "crosswalk_to" } } });
  const viaCw = (input, left, right) => R([{ op: "join", left: "pay", right: "reg", on: { left: "person", right: "person" }, crosswalk: { input, left, right }, as: "j" },
    { op: "count", from: "j", as: "n" }], "n", [...tables, { name: "cw", kind: "table" }]);
  const yes = await w.c.create({ ...c, inputs: [...inputs, { name: "cw", table: cw.sha }], recipe: viaCw("cw", "from", "to") });
  assert.equal(yes.results.output.value, "3");
  const no = await w.c.create({ ...c, inputs: [...inputs, { name: "cw", table: reg.sha }], recipe: viaCw("cw", "person", "name") });
  assert.equal(code(no), "JOIN_NOT_BY_IDENTIFIER", "a table not declared as a crosswalk joins nothing");
  assert.equal(w.count("calculations"), 2);
});
