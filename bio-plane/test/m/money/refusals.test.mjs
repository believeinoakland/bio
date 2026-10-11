/* money's refusals that share record-grammar's act rows, at its interface: R26. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, ANN } from "./fixture.mjs";
import { moneyOps } from "../../../src/money/index.mjs";
import { SHARED_ACT_CHECKS } from "../../../src/record-grammar/index.mjs";

const url = (q) => new URL(`https://do.invalid/?${new URLSearchParams(q)}`);
const ROW = SHARED_ACT_CHECKS.NO_BASIS;
const types = (s) => s.one(`SELECT count(*) AS n FROM money_fund_types`).n;

/* Every site that answers NO_BASIS: `setFundType` with no basis, called directly and through its op arm. */
const sites = (s) => [
  ["setFundType", (over) => s.m.setFundType({ fund: s.general, type: "governmental", by: ANN, ...over })],
  ["op moneyfundtype", (over) => moneyOps(s.m, url({}), { fund: s.general, type: "governmental", by: ANN, ...over }).moneyfundtype()],
];

test("R26 every NO_BASIS money answers carries record-grammar's shared row C-33.40, its check and translation, never a bare code", () => {
  const s = seeded();
  assert.equal(ROW.check, "C-33.40");
  for (const [site, call] of sites(s)) for (const basis of [undefined, null, "", "   ", 7]) {
    const r = call({ basis });
    const at = `${site} with basis ${JSON.stringify(basis)}`;
    assert.equal(r.ok, false, at);
    assert.deepEqual([r.reason, r.code], ["NO_BASIS", "NO_BASIS"], at);
    assert.equal(r.check, ROW.check, at);
    assert.equal(r.translation, ROW.translation, at);
    assert.equal(typeof r.detail, "string", `${at}: the site's own particular is kept beside the row`);
    assert.match(r.detail, /fund's type/, at);
  }
  assert.equal(types(s), 0, "a refused act writes nothing");
});

test("R26 negative control: with a basis the act lands, and money's own codes answer no shared row", () => {
  const s = seeded();
  for (const [site, call] of sites(s)) {
    const r = call({ basis: "ACFR note 1" });
    assert.equal(r.ok, true, site);
    assert.equal(r.check, undefined, site);
    assert.equal(r.translation, undefined, site);
  }
  const own = [
    s.m.setFundType({ fund: s.general, type: "nonesuch", basis: "b", by: ANN }),
    s.m.setFundType({ fund: s.city, type: "governmental", basis: "b", by: ANN }),
    s.m.recordFact(s.fact({ amount: undefined })),
    s.m.recordFact(s.fact({ source: undefined })),
    s.m.withdrawFact({ factId: "MNY-2026-aaaaaaaaaaaaaaaa", by: ANN }),
  ];
  assert.deepEqual(own.map((r) => r.reason), ["UNKNOWN_FUND_TYPE", "NOT_A_FUND", "NO_AMOUNT", "NO_SOURCE", "NO_REASON"]);
  for (const r of own) {
    assert.equal(r.check, undefined, r.reason);
    assert.equal(r.translation, undefined, r.reason);
  }
});
