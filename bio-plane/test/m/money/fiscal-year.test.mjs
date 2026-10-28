/* money R34, R39-R41 (T53; N1257; DEC-458): a fiscal key is mapped by the government's own year; the fiscal-year view is
   offered only where the year is known. Driven at the interface: `recordFact`, `fiscalYears`. The team's stated year is
   `local-facts`' (its R30-R32); its tests are named below until that service is merged here. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, ANN } from "./fixture.mjs";
import { localFactsOf, TEAM_ZONE_PATH } from "../../../src/local-facts/index.mjs";

const stated = typeof localFactsOf(seeded().host).teamLayer === "function";
const noStar = (r) => { for (const [k, v] of Object.entries(r)) if (typeof v === "string") assert.doesNotMatch(v, /\*/, k); };
const PROFILE = "test-port-ellery";
/* no place profile installed, the team's zone stated, as a team with no records is */
function bare() {
  const s = seeded();
  s.record.setSetting("jurisdiction_profiles", [], "test");
  const said = localFactsOf(s.host).factConfirm({ path: TEAM_ZONE_PATH, act: "correct", value: "America/Halifax",
    how: "the team's administrator chose it", source: "stated by the team's administrator", by: ANN, viewer: ANN });
  assert.equal(said.ok, true);
  return s;
}

test("R39 control: the same fiscal key with {from, to} is accepted as before; a named body in the records maps by its own year", () => {
  const s = seeded();
  const r = s.m.recordFact(s.fact({ period: { fiscal: "HD2014", body: "Port Ellery Harbour District" } }));
  assert.equal(r.ok, true);
  assert.deepEqual([s.m.readFact({ factId: r.fact_id, viewer: ANN }).fact.period.from, s.m.readFact({ factId: r.fact_id, viewer: ANN }).fact.period.to], ["2013-10-01", "2014-09-30"]);
  assert.equal(s.m.recordFact(s.fact({ period: { from: "2013-10-01", to: "2014-09-30" } })).ok, true);
});

test("R39 a government named with no year in the records and none stated is refused MONEY_BAD_PERIOD, the sentence naming it and holding no `*`", () => {
  const s = bare();
  const r = s.m.recordFact(s.fact({ period: { fiscal: "FY2026-27", body: "Bville" } }));
  assert.equal(r.code, "MONEY_BAD_PERIOD");
  assert.match(r.detail, /Bville/);
  assert.match(r.detail, /FY2026-27/);
  noStar(r);
  assert.equal(s.m.checkConstant({ role: "period", value: "FY2026-27" }).code, "MONEY_BAD_PERIOD");
});

test("R39 control: a fiscal key with no body is refused as R34 states, no `*` in the sentence, and a stated year is never read for it", () => {
  const s = bare();
  const r = s.m.recordFact(s.fact({ period: { fiscal: "FY2026-27" } }));
  assert.equal(r.code, "MONEY_BAD_PERIOD");
  noStar(r);
  assert.match(r.detail, /FY2026-27/);
});

test("R40 the governments whose year is known: the records' named one with its origin, the `*` entry once as every government, never named `*`", () => {
  const s = seeded();
  const r = s.m.fiscalYears({ viewer: ANN });
  assert.equal(r.ok, true);
  assert.deepEqual(r.years.map((y) => y.body), ["Port Ellery Harbour District"]);
  assert.deepEqual([r.years[0].start, r.years[0].named_by, r.years[0].from], ["10-01", "end", "records"]);
  assert.deepEqual([r.every.start, r.every.named_by, r.every.from], ["04-01", "start", "records"]);
  assert.equal(r.says, undefined);
  assert.equal(JSON.stringify(r).includes('"*"'), false, "nothing answered holds * as a government");
  assert.equal(r.years.some((y) => y.body === "*"), false);
});

test("R40 asked of one government: known with its year, the `*` entry covering any government; none known gives the sentence naming it", () => {
  const s = seeded();
  const hd = s.m.fiscalYears({ body: "Port Ellery Harbour District" });
  assert.deepEqual([hd.known, hd.year.start, hd.year.from, hd.year.body], [true, "10-01", "records", "Port Ellery Harbour District"]);
  assert.deepEqual([s.m.fiscalYears({ body: "Anywhere" }).known, s.m.fiscalYears({ body: "Anywhere" }).year.start], [true, "04-01"]);
  s.record.setSetting("jurisdiction_profiles", [], "test");
  const none = s.m.fiscalYears({ body: "Bville" });
  assert.deepEqual([none.ok, none.known, none.year], [true, false, undefined]);
  assert.match(none.says, /Bville/);
  assert.match(none.says, /state/i);
  noStar(none);
});

test("R40 with no layer and nothing stated the list is empty with the none-known sentence naming no government; reading writes nothing", () => {
  const s = seeded();
  s.record.setSetting("jurisdiction_profiles", [], "test");
  const count = () => s.one(`SELECT (SELECT count(*) FROM money_facts) AS n`).n;
  const before = count();
  const r = s.m.fiscalYears({ viewer: ANN });
  assert.deepEqual([r.ok, r.years, r.every], [true, [], null]);
  assert.equal(typeof r.says, "string");
  noStar(r);
  assert.equal(count(), before);
  assert.equal(PROFILE.length > 0, true);
});

test("R40 the op arm and its declaration: fiscalyears is a read declared by its owner", async () => {
  const { moneyOps, DECLARED_OPS } = await import("../../../src/money/index.mjs");
  const s = seeded();
  const url = new URL(`https://do.invalid/?${new URLSearchParams({ body: "Port Ellery Harbour District", viewer: ANN })}`);
  assert.equal(moneyOps(s.m, url, null).moneyfiscalyears().known, true);
  const d = DECLARED_OPS.fiscalyears;
  assert.deepEqual([d.classes, d.mutating, d.weight, d.fields.requires], [["admin", "member", "probe"], false, "read", []]);
});

/* The statement of a government's year is `local-facts`' (R31); until its service is merged here these name the ids and
   what each checks. */
const owed = stated ? test : test.todo;
owed("R39 with no profile, recordfact with {fiscal: 'FY2026-27', body: 'B'} after a member stated B's year records the range a records entry would; before it is refused; B's year maps no key for C; a layer-covered government keeps the records' year", () => {});
owed("R40 after a member states B's year it is answered as stated, with the member, date and how; a government neither holds is not listed", () => {});
owed("R41 a lapsed stated year answers known with status unconfirmed and still maps; a disputed one answers known with status disputed, the dispute named; a year from the records carries no stated status", () => {});
