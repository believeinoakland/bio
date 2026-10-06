/* money's ops map, its promotion step and its words at its interface: R18, R5, R22. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, sha, MACHINE, ANN } from "./fixture.mjs";
import { moneyOps, MONEY_KINDS, PHASES, STAGES, BASES, PRECISIONS, SET_PURPOSES, FUND_TYPES, BALANCE_FAMILIES,
  CONNECTION_WORD } from "../../../src/money/index.mjs";

const OPS = ["moneyrecord", "moneywithdraw", "money", "moneyof", "moneysummable", "moneyreconcile", "moneysetcreate", "moneyset",
  "moneysetinclude", "moneysetexclude", "moneysetpropose", "moneyfundtype", "committedagainstpaid", "authoritychain"];
const url = (q) => new URL(`https://do.invalid/?${new URLSearchParams(q)}`);
const strip = (x) => JSON.parse(JSON.stringify(x, (k, v) => (k === "fact_id" || k === "at" ? undefined : v)));

test("R18 moneyOps holds one route arm per act and read, each a function of no arguments", () => {
  const s = seeded();
  const map = moneyOps(s.m, url({}), {});
  assert.deepEqual(Object.keys(map).sort(), [...OPS].sort());
  for (const [op, fn] of Object.entries(map)) assert.deepEqual([typeof fn, fn.length], ["function", 0], op);
});

test("R18 each arm answers what its named service answers: reads from the query (the viewer stamp among them), acts from the body", () => {
  const s = seeded();
  const a = s.rec(), b = s.rec({ basis: "cash" });
  const run = (op, q, body) => moneyOps(s.m, url(q), body)[op]();
  assert.deepEqual(run("money", { id: a, viewer: ANN }), s.m.readFact({ factId: a, viewer: ANN }));
  assert.deepEqual(run("moneyof", { entity: s.vendor, kinds: "expenditure", limit: "5", viewer: ANN }),
    s.m.moneyOf({ entity: s.vendor, kinds: "expenditure", limit: "5", viewer: ANN }));
  assert.deepEqual(run("moneysummable", { ids: `${a},${b}` }), s.m.summable({ factIds: [a, b] }));
  assert.deepEqual(run("moneyreconcile", { a, b }), s.m.reconcile({ a, b }));
  assert.deepEqual(run("committedagainstpaid", { contract: s.contract, viewer: ANN }), s.m.committedAgainstPaid({ contract: s.contract, viewer: ANN }));
  assert.deepEqual(run("authoritychain", { id: a, viewer: ANN }), s.m.authorityChain({ factId: a, viewer: ANN }));
  const made = run("moneyrecord", {}, s.fact());
  assert.equal(made.ok, true);
  assert.deepEqual(strip(s.m.readFact({ factId: made.fact_id, viewer: ANN }).fact), strip(s.m.readFact({ factId: a, viewer: ANN }).fact));
  assert.equal(run("moneyrecord", {}, null).reason, "NO_AMOUNT");
  const set = run("moneysetcreate", {}, { purpose: "trail", label: "t", by: ANN });
  assert.equal(set.ok, true);
  assert.equal(run("moneysetpropose", {}, { setId: set.set_id, factId: a, method: "m", by: MACHINE }).ok, true);
  assert.equal(run("moneysetinclude", {}, { setId: set.set_id, factId: a, reason: "r", by: ANN }).ok, true);
  assert.equal(run("moneysetexclude", {}, { setId: set.set_id, factId: b, reason: "r", by: ANN }).ok, true);
  assert.deepEqual(run("moneyset", { id: set.set_id, viewer: ANN }), s.m.readSet({ setId: set.set_id, viewer: ANN }));
  assert.equal(run("moneyfundtype", {}, { fund: s.general, type: "governmental", basis: "b", by: ANN }).ok, true);
  assert.equal(run("moneywithdraw", {}, { factId: b, reason: "r", by: ANN }).ok, true);
});

/* promotion's R39 registry, standing in: one step's check and projection. */
function promotionStandIn() {
  const steps = [];
  return { steps, registerStep(module, st) { if (steps.some((x) => x.module === module)) return { ok: false, reason: "STEP_DECLARED" }; steps.push({ module, ...st }); return { ok: true, module }; } };
}

test("R5 facts projected from a promoted bundle's reading ride promotion's step, through R1's checks: a fault refuses the promotion, each fact is written once", () => {
  const s = seeded();
  const p = promotionStandIn();
  assert.equal(s.m.joinPromotion(p), true);
  assert.equal(s.m.joinPromotion(p), false, "joined once");
  const [{ check, project }] = p.steps;
  const { by: _by, ...good } = s.fact();
  const ctx = (facts) => ({ bundleId: "INFO-1", author: ANN, files: [{ path: "data/money.json", text: JSON.stringify({ facts }) }] });
  const bad = check(ctx([good, { ...good, kind: "spending" }]));
  assert.deepEqual([bad.ok, bad.reason, bad.fact_index], [false, "UNKNOWN_MONEY_KIND", 1]);
  assert.equal(check(ctx([good])), null);
  const out = project(ctx([good]));
  assert.equal(out.money_facts.length, 1);
  assert.equal(project(ctx([good])), null, "a re-promotion writes nothing again");
  assert.equal(s.one(`SELECT count(*) AS n FROM money_facts`).n, 1);
  assert.equal(check({ files: [] }), null);
});

test("R22 Civicsmith's own words in money never say ledger, diverted, misused, unauthorised or conflict, rank payees, or name a place", () => {
  const s = seeded();
  const texts = [];
  const keep = (x) => texts.push(JSON.stringify(x));
  for (const over of [{ amount: undefined }, { amount: 1 }, { as_read: "" }, { currency: "" }, { sign: "x" }, { precision: "x" },
    { precision: "range" }, { kind: "x" }, { phase: "x" }, { basis: "x" }, { stage: undefined }, { phase: "adopted" }, { stage: "collected" },
    { period: undefined }, { period: { fiscal: "x" } }, { codes: [{ scheme: "x", code: "1" }] }, { balance_class: "x" },
    { to: { entity: "ENT-2026-9999" } }, { concerns: ["DUT-2026-0001"] }, { concerns: ["ENT-2026-0001"] }, { source: undefined },
    { source: { fact: "CALC-2026-1" } }, { source: { capture_sha: sha("no") } }, { adjusts: "MNY-2026-aaaaaaaaaaaaaaaa" },
    { method: "x" }, { by: MACHINE, method: "reader" }, { ours: true }])
    keep(s.m.recordFact(s.fact(over)));
  const a = s.rec(), b = s.rec({ basis: "cash" });
  keep(s.m.summable({ factIds: [a, b] })); keep(s.m.reconcile({ a, b })); keep(s.m.withdrawFact({ factId: a }));
  keep(s.m.committedAgainstPaid({ contract: s.contract, viewer: ANN })); keep(s.m.authorityChain({ factId: b, viewer: ANN }));
  keep(s.m.moneyOf({ entity: s.vendor, viewer: ANN })); keep(s.m.createSet({ purpose: "x" }));
  keep(s.m.include({ setId: "x", factId: a, reason: "r", by: MACHINE }));
  keep([MONEY_KINDS, PHASES, STAGES, BASES, PRECISIONS, SET_PURPOSES, FUND_TYPES, BALANCE_FAMILIES, CONNECTION_WORD]);
  const all = texts.join("\n");
  for (const w of ["ledger", "diverted", "misused", "unauthorised", "unauthorized", "conflict", "rank", "largest", "most "])
    assert.equal(all.toLowerCase().includes(w), false, w);
  for (const place of ["Oakland", "Alameda", "California"]) assert.equal(all.includes(place), false, place);
});
