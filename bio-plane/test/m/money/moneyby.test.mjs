/* money R38 (T53; N1260; DEC-410, DEC-447 (2)): what an entity paid or received, `moneyByParty`, at its interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, sha, ANN, BOB, OUTSIDER } from "./fixture.mjs";
import { moneyOps, DECLARED_OPS, MONEY_KINDS, CONNECTION_KIND_NAMES, kindsOfFamily } from "../../../src/money/index.mjs";

function world() {
  const s = seeded();
  s.project("PROJ-1", "bob");
  /* the city paid the vendor three times and received two revenue facts from it; one fact only concerns the vendor */
  const paid = [1, 2, 3].map((n) => s.rec({ amount: String(n * 100), as_read: `$${n * 100}`, period: { from: `2013-0${n}-01`, to: `2013-0${n}-28` } }));
  const received = [4, 5].map((n) => s.rec({ kind: "revenue", stage: "collected", from: { entity: s.vendor }, to: { entity: s.city },
    amount: String(n * 100), as_read: `$${n * 100}`, period: { from: `2013-0${n}-01`, to: `2013-0${n}-28` } }));
  const concerning = s.rec({ concerns: [s.contract], from: { entity: s.city }, to: { entity: s.harbour }, kind: "allocation", stage: "paid" });
  return { ...s, paid, received, concerning };
}
const ids = (r) => r.facts.map((f) => f.fact_id);

test("R38 an entity that paid 3 and received 2 answers 5 with direction; a payer role answers the 3; a payee role the 2", () => {
  const s = world();
  const all = s.m.moneyByParty({ entity: s.vendor, viewer: ANN });
  assert.equal(all.ok, true);
  assert.deepEqual([all.entity, all.role, all.truncated, all.facts.length], [s.vendor, "either", false, 5]);
  const dir = Object.fromEntries(all.facts.map((f) => [f.fact_id, f.direction]));
  for (const f of s.received) assert.equal(dir[f], "paid", "the vendor is the payer of a revenue it gave the city");
  for (const f of s.paid) assert.equal(dir[f], "received");
  assert.deepEqual(ids(s.m.moneyByParty({ entity: s.vendor, role: "payer", viewer: ANN })).sort(), [...s.received].sort());
  assert.deepEqual(ids(s.m.moneyByParty({ entity: s.vendor, role: "payee", viewer: ANN })).sort(), [...s.paid].sort());
  /* each fact as readFact answers it */
  const one = all.facts.find((f) => f.fact_id === s.paid[0]);
  const { direction: _d, ...rest } = one;
  assert.deepEqual(rest, s.m.readFact({ factId: s.paid[0], viewer: ANN }).fact);
  /* a fund is a party too; a fact that merely concerns the entity is absent, and moneyOf still answers it */
  assert.deepEqual(ids(s.m.moneyByParty({ entity: s.general, viewer: ANN })).sort(), [...s.paid].sort());
  assert.equal(ids(s.m.moneyByParty({ entity: s.contract, viewer: ANN })).length, 0);
  assert.deepEqual(s.m.moneyOf({ entity: s.contract, viewer: ANN }).facts.map((f) => f.fact_id), [s.concerning]);
  /* a fact paid to itself is listed once, both */
  const self = s.rec({ from: { entity: s.city }, to: { entity: s.city }, kind: "transfer", stage: "paid" });
  const mine = s.m.moneyByParty({ entity: s.city, viewer: ANN }).facts.filter((f) => f.fact_id === self);
  assert.deepEqual(mine.map((f) => f.direction), ["both"]);
  /* no total, sum or ranking is answered */
  assert.equal(Object.keys(all).some((k) => /total|sum|rank/i.test(k)), false);
});

test("R38 kinds: a connection kind expands to its fact kinds; the contribution family and the other four never overlap", () => {
  const s = world();
  const gift = s.rec({ kind: "gift", from: { entity: s.vendor }, to: { entity: s.city }, stage: "paid" });
  const behested = s.rec({ kind: "behested", from: { entity: s.vendor }, to: { entity: s.harbour }, stage: "paid" });
  const given = s.m.moneyByParty({ entity: s.vendor, kinds: ["money_contribution"], viewer: ANN });
  assert.deepEqual(ids(given).sort(), [gift, behested].sort());
  const rest = CONNECTION_KIND_NAMES.filter((k) => k !== "money_contribution");
  const money = s.m.moneyByParty({ entity: s.vendor, kinds: rest, viewer: ANN });
  assert.equal(money.facts.length, 5);
  assert.equal(ids(money).some((i) => ids(given).includes(i)), false);
  assert.deepEqual(ids(s.m.moneyByParty({ entity: s.vendor, kinds: ["gift", "behested"], viewer: ANN })).sort(), [gift, behested].sort());
  assert.deepEqual(ids(s.m.moneyByParty({ entity: s.vendor, kinds: "money_contribution,revenue", viewer: ANN })).length, 4);
  assert.ok(kindsOfFamily("money_contribution").every((k) => MONEY_KINDS.includes(k)));
});

test("R38 period and phases narrow as moneyOf does; a fact with an open end is named undetermined and listed after the rest", () => {
  const s = world();
  const open = s.rec({ period: { from: "2013-02-15", to: null } });
  const adopted = s.rec({ phase: "adopted", stage: undefined, period: { from: "2013-02-01", to: "2013-02-28" } });
  const feb = s.m.moneyByParty({ entity: s.vendor, period: { from: "2013-02-01", to: "2013-02-28" }, viewer: ANN });
  assert.equal(feb.ok, true);
  assert.deepEqual(ids(feb).slice(0, 2).sort(), [s.paid[1], adopted].sort(), "the same start is ordered by id");
  assert.equal(ids(feb).length, 3);
  assert.equal(ids(feb).at(-1), open, "the undetermined one last");
  assert.deepEqual(feb.facts.filter((f) => f.period_undetermined).map((f) => f.fact_id), [open]);
  assert.ok(feb.undetermined_why);
  assert.equal(ids(feb).includes(s.paid[0]), false);
  assert.deepEqual(ids(s.m.moneyByParty({ entity: s.vendor, phases: ["adopted"], viewer: ANN })), [adopted]);
  const unasked = s.m.moneyByParty({ entity: s.vendor, viewer: ANN });
  assert.equal(unasked.facts.some((f) => f.period_undetermined), false);
  assert.equal(unasked.undetermined_why, undefined);
  const byStart = unasked.facts.map((f) => f.period.from);
  assert.deepEqual(byStart, [...byStart].sort());
});

test("R38 130 facts paged by 50 equal the unpaged 130; next is opaque", () => {
  const s = seeded();
  for (let i = 0; i < 130; i++) s.rec({ amount: String(i + 1), as_read: String(i + 1), period: { from: `2013-01-${String(1 + (i % 28)).padStart(2, "0")}`, to: "2013-12-31" } });
  const whole = s.m.moneyByParty({ entity: s.vendor, limit: 500, viewer: ANN });
  assert.equal(whole.facts.length, 130);
  assert.equal(whole.truncated, false);
  assert.equal(whole.next, undefined);
  const pages = [];
  let after;
  for (;;) {
    const r = s.m.moneyByParty({ entity: s.vendor, limit: 50, ...(after ? { after } : {}), viewer: ANN });
    assert.equal(r.ok, true);
    pages.push(ids(r));
    if (!r.truncated) break;
    assert.equal(typeof r.next, "string");
    assert.equal(r.next.includes("MNY-"), false, "opaque");
    after = r.next;
  }
  assert.deepEqual(pages.map((p) => p.length), [50, 50, 30]);
  assert.deepEqual(pages.flat(), ids(whole));
  assert.equal(new Set(pages.flat()).size, 130);
  assert.equal(s.m.moneyByParty({ entity: s.vendor, viewer: ANN }).facts.length, 100, "default limit 100");
});

test("R38 sight is R21's: a fact the viewer may not see is absent; a withdrawn fact is absent", () => {
  const s = world();
  const hidden = s.held("INFO-H", sha("hidden"), { project: "PROJ-1" });
  const fenced = s.rec({ source: { capture_sha: hidden }, by: BOB });
  assert.equal(ids(s.m.moneyByParty({ entity: s.vendor, viewer: BOB })).includes(fenced), true);
  assert.equal(ids(s.m.moneyByParty({ entity: s.vendor, viewer: OUTSIDER })).includes(fenced), false);
  assert.equal(s.m.moneyByParty({ entity: s.vendor, viewer: OUTSIDER }).facts.length, 5);
  s.m.withdrawFact({ factId: s.paid[0], reason: "dup", by: ANN });
  assert.equal(ids(s.m.moneyByParty({ entity: s.vendor, viewer: ANN })).includes(s.paid[0]), false);
});

test("R38 refusals: NO_ENTITY, NO_SUCH_ENTITY, MONEYBY_BAD_ROLE, UNKNOWN_MONEY_KIND, MONEY_BAD_PERIOD, MONEYBY_BAD_LIMIT, MONEYBY_BAD_CURSOR, UNKNOWN_PHASE", () => {
  const s = world();
  const code = (a) => s.m.moneyByParty({ viewer: ANN, entity: s.vendor, ...a }).code;
  assert.equal(s.m.moneyByParty({ viewer: ANN }).code, "NO_ENTITY");
  assert.equal(code({ entity: "ENT-2026-9999" }), "NO_SUCH_ENTITY");
  assert.equal(code({ role: "owner" }), "MONEYBY_BAD_ROLE");
  assert.equal(code({ kinds: ["tax"] }), "UNKNOWN_MONEY_KIND");
  assert.equal(code({ kinds: ["money_flow"] }), "UNKNOWN_MONEY_KIND");
  assert.equal(code({ period: { from: "2013-05-01", to: "2013-04-01" } }), "MONEY_BAD_PERIOD");
  for (const limit of [0, 501, -1, 1.5, "ten"]) assert.equal(code({ limit }), "MONEYBY_BAD_LIMIT", String(limit));
  assert.equal(code({ after: "not-a-cursor" }), "MONEYBY_BAD_CURSOR");
  assert.equal(code({ phases: ["dreamt"] }), "UNKNOWN_PHASE");
  /* control: a good role, limit and kinds are accepted; moneyOf answers as before */
  assert.equal(code({ role: "payer", limit: 1, kinds: ["revenue"] }), undefined);
  assert.equal(s.m.moneyOf({ entity: s.vendor, viewer: ANN }).facts.length, 5);
});

test("R38 the op arm and its declaration: moneyby is a read declared by its owner", () => {
  const s = world();
  const url = new URL(`https://do.invalid/?${new URLSearchParams({ entity: s.vendor, role: "payee", kinds: "money_payment", limit: "2", viewer: ANN })}`);
  const r = moneyOps(s.m, url, null).moneyby();
  assert.deepEqual([r.ok, r.role, r.facts.length, r.truncated], [true, "payee", 2, true]);
  const d = DECLARED_OPS.moneyby;
  assert.deepEqual([d.classes, d.mutating, d.weight], [["admin", "member", "probe"], false, "read"]);
  assert.deepEqual(d.fields.requires, ["entity"]);
  assert.deepEqual(d.fields.accepts, ["entity", "role", "kinds", "period", "phases", "limit", "after"]);
});

test("R38 writes nothing", () => {
  const s = world();
  const count = () => s.one(`SELECT (SELECT count(*) FROM money_facts) + (SELECT count(*) FROM money_withdrawals) AS n`).n;
  const before = count();
  s.m.moneyByParty({ entity: s.vendor, viewer: ANN });
  assert.equal(count(), before);
});
