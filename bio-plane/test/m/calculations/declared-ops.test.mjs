/* calculations R42 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, calculationsOps } from "../../../src/calculations/index.mjs";
import { seeded, V, R } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const F = [{ name: "dept", type: "string" }, { name: "amount", type: "number", currency: "USD" }, { name: "status", type: "string" }];
const CSV = "dept,amount,status\nparks,100,awarded\nroads,250,awarded\nparks,50,pending\nroads,x,awarded\n";
const PERIOD = { from: "2025-07-01", to: "2026-06-30" };
const SUM = R([{ op: "sum", from: "t", field: "amount", as: "total" }], "total");
/* bob's declared table of three columns, and a calculation of it (accepted by none yet) */
const mkTable = async () => { const w = seeded(); w.src = w.csv(CSV); w.t = await w.table(CSV, F); return w; };
const mkCalc = async () => {
  const w = await mkTable();
  const r = await w.c.create({ question: "How much was awarded?", terms: { amount: "dollars awarded" }, period: PERIOD, kind: "total",
    inputs: [{ name: "t", table: w.t.sha }], recipe: SUM, project: null, by: V("bob") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  w.calcId = r.calc_id;
  return w;
};

/* a table of twenty sites, drawn six with the question their items are judged by, and bob's own firsthand testimony of a visit */
const SPOT_CSV = `site\n${Array.from({ length: 20 }, (_, i) => `bench-${i}`).join("\n")}\n`;
const mkVisit = async () => {
  const w = seeded();
  const t = await w.table(SPOT_CSV, [{ name: "site", type: "string" }]);
  const d = w.c.draw({ set: t.sha, n: 6, seed: "spot", question: "Is the bench at this site repaired and usable?", by: V("bob") });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const r = w.prov.testify({ words: "At the site I looked at the bench myself.", observedAt: "2026-10-01", title: "visit", author: V("bob") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return { ...w, drawKey: d.draw, item: d.sample[0], testimony: r.capture_sha };
};
const visited = (fields, env) => ({ ...fields, ...("draw" in fields ? { draw: env.drawKey } : {}), ...("item" in fields ? { item: env.item } : {}), ...("testimony" in fields ? { testimony: env.testimony } : {}) });

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkTable());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (calculationsOps(env.c, url, fields)[op]());
};

test("R42 calculations declares tabledeclare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "tabledeclare", declaration: DECLARED_OPS["tabledeclare"], call: mk("tabledeclare", {"viewer":"member:bob"}, null, null, (fields, env) => (("source" in fields ? { ...fields, source: env.src } : fields))),
    refusedNaming: named({"source":["NO_SOURCE"],"header":["NO_HEADER"],"schema":["BAD_SCHEMA"]}, true), values: { header: F.map((f) => f.name), schema: { fields: F } }, same: sameCode });
});

test("R42 calculations declares calculationcreate: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "calculationcreate", declaration: DECLARED_OPS["calculationcreate"], call: mk("calculationcreate", {"viewer":"member:bob"}, null, null, (fields, env) => (("inputs" in fields ? { ...fields, inputs: [{ name: "t", table: env.t.sha }] } : fields))),
    refusedNaming: named({"question":["NO_QUESTION"],"period":["NO_PERIOD"],"inputs":["NO_INPUTS"],"kind":["UNKNOWN_KIND"]}, true), values: { period: PERIOD, kind: "total" }, same: sameCode });
});

test("R42 calculations declares calculationaccept: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "calculationaccept", declaration: DECLARED_OPS["calculationaccept"], call: mk("calculationaccept", {"viewer":"member:bob"}, async () => (mkCalc()), null, (fields, env) => (Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, k === "id" || k === "calcId" ? env.calcId : v])))),
    refusedNaming: named({"id":["NO_SUCH_CALCULATION"],"calcId":["NO_SUCH_CALCULATION"]}, true), same: sameCode });
});

test("R42 calculations declares calculationdraw: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "calculationdraw", declaration: DECLARED_OPS["calculationdraw"], call: mk("calculationdraw", {"viewer":"member:bob"}, null, null, (fields, env) => (("set" in fields ? { ...fields, set: env.t.sha } : fields))),
    refusedNaming: named({"set":["NO_SET"],"n":["BAD_N"]}, true), values: {"n":6}, same: sameCode });
});

test("R42 calculations declares spotcheckvisit: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "spotcheckvisit", declaration: DECLARED_OPS["spotcheckvisit"], call: mk("spotcheckvisit", {"viewer":"member:bob"}, async () => (mkVisit()), null, (fields, env) => (visited(fields, env))),
    refusedNaming: named({"draw":["NO_SUCH_DRAW"],"item":["NOT_DRAWN"],"testimony":["NOT_TESTIMONY"],"finding":["BAD_FINDING"]}, true), values: {"finding":"yes"}, same: sameCode });
});

test("R42 calculations declares moneyingestread: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "moneyingestread", declaration: DECLARED_OPS["moneyingestread"], call: mk("moneyingestread", {"viewer":"member:bob"}),
    refusedNaming: named({"ingest":["NO_INGEST"]}, true), values: {"ingest":"no-such-ingest"}, same: sameCode });
});
