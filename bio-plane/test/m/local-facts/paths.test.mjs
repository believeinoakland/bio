/* local-facts: the paths (R6) and the vocabularies (R7). */
import test from "node:test";
import assert from "node:assert/strict";
import { P, TP } from "./fixture.mjs";
import { factPath, parseFactPath, LOCAL_FACT_ACTS, LOCAL_FACT_STATUSES, LOCAL_FACT_HORIZONS, LOCAL_FACT_KINDS }
  from "../../../src/local-facts/index.mjs";

test("R6 factPath answers the one path of each fact kind, and parseFactPath its parts", () => {
  const cases = [
    [{ profile: TP, fact: "time_zone" }, P.tz],
    [{ profile: TP, fact: "holidays", year: 2026 }, P.y2026],
    [{ profile: TP, fact: "holidays", year: 2026, offices: ["Town Clerk"] }, P.y2026clerk],
    [{ profile: TP, fact: "holidays", year: 2026, offices: [{ venue: "commitment_claim" }] }, P.y2026court],
    [{ profile: TP, fact: "hours", office: { role: "Town Clerk", body: "City of Port Ellery" } }, P.clerkHours],
    [{ profile: TP, fact: "hours", office: { venue: "records_request" } }, P.venueHours],
  ];
  for (const [parts, path] of cases) {
    assert.equal(factPath(parts), path);
    assert.deepEqual(parseFactPath(path), parts);
  }
});

test("R6 the same fact always gives the same path: offices in any order or repeated, a year as a string", () => {
  const a = factPath({ profile: TP, fact: "holidays", year: 2026, offices: ["B, Office/2", { venue: "k" }, "A=office"] });
  const b = factPath({ profile: TP, fact: "holidays", year: "2026", offices: [{ venue: "k" }, "A=office", "B, Office/2", "A=office"] });
  assert.equal(a, b);
  assert.equal(factPath({ fact: "hours", profile: TP, office: { body: "Body / x", role: "Role, y" } }),
               factPath({ profile: TP, fact: "hours", office: { role: "Role, y", body: "Body / x" } }));
  /* names with separators round-trip */
  assert.deepEqual(parseFactPath(a).offices.length, 3);
  assert.equal(factPath(parseFactPath(a)), a);
});

test("R6 parts that name no fact give null; a path not as factPath spells it gives null; neither throws", () => {
  const bad = [null, undefined, 7, "x", {}, { profile: "Bad Id", fact: "time_zone" }, { profile: TP, fact: "weather" },
    { profile: TP, fact: "holidays" }, { profile: TP, fact: "holidays", year: 26 }, { profile: TP, fact: "holidays", year: 2026, offices: [] },
    { profile: TP, fact: "holidays", year: 2026, offices: [3] }, { profile: TP, fact: "hours" },
    { profile: TP, fact: "hours", office: { role: "R" } }, { profile: TP, fact: "hours", office: { venue: "k", role: "R" } },
    { profile: TP, fact: "hours", office: { role: " R", body: "B" } }];
  for (const p of bad) assert.equal(factPath(p), null, JSON.stringify(p));
  const cyclic = { profile: TP, fact: "hours" }; cyclic.office = cyclic;
  assert.equal(factPath(cyclic), null);
  for (const s of [null, 3, "", "x", `${TP}`, `${TP}/time_zone/`, `${TP}/holidays/2026/role=Town Clerk`,
    `${TP}/holidays/2026/venue=commitment_claim,role=Town%20Clerk`, `${TP}/holidays/2026/role=%E0%A4%A`,
    `${TP}/hours/body=B,role=R`, `${TP}/hours/role=R`, `${TP}/holidays/02026`, `Bad/time_zone`, "x".repeat(2000)])
    assert.equal(parseFactPath(s), null, String(s));
  /* the canonical order of two offices parses */
  assert.ok(parseFactPath(`${TP}/holidays/2026/role=Town%20Clerk,venue=commitment_claim`));
});

test("R7 the acts, statuses and horizons are exported, frozen", () => {
  assert.deepEqual([...LOCAL_FACT_ACTS], ["confirm", "correct", "dispute"]);
  assert.deepEqual([...LOCAL_FACT_STATUSES], ["confirmed", "unconfirmed", "corrected", "disputed", "absent"]);
  assert.deepEqual([...LOCAL_FACT_KINDS], ["holidays", "hours", "time_zone"]);
  assert.deepEqual(JSON.parse(JSON.stringify(LOCAL_FACT_HORIZONS)), {
    holidays: { lasts: "until_year_end", due_from: { month: 11, day: 1, years_before: 1 } },
    hours: { lapse_days: 183 }, time_zone: { lapse_days: 183 } });
  for (const v of [LOCAL_FACT_ACTS, LOCAL_FACT_STATUSES, LOCAL_FACT_KINDS, LOCAL_FACT_HORIZONS,
                   LOCAL_FACT_HORIZONS.holidays, LOCAL_FACT_HORIZONS.holidays.due_from, LOCAL_FACT_HORIZONS.hours,
                   LOCAL_FACT_HORIZONS.time_zone]) assert.ok(Object.isFrozen(v));
});
