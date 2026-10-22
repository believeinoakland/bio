/* jurisdictions, T51 fix round 4 (C8; K4477): the first profile keeps a fiscal year for its city and county bodies (R49).
 * Tested at the module's interface: get, validate, combine; the period is mapped as money maps it, through civil-time. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { get, validate, combine } from "../index.mjs";
import { fiscalPeriod } from "../../bio-plane/src/civil-time/index.mjs";

const FIRST = "oakland-alameda";
const CITY = ["Finance Department", "Oakland City Council", "Office Of The City Auditor"];

test("R49 the first profile's city bodies keep a July 1 fiscal year, so FY2025-26 maps to July 1 2025 - June 30 2026", () => {
  const p = get(FIRST);
  assert.equal(validate(p).ok, true);
  const view = combine([p]).view;
  for (const body of [...CITY, "Alameda County Civil Grand Jury"]) {
    const fp = fiscalPeriod({ date: "2025-07-01", body, view });
    assert.deepEqual(fp, { label: "FY2025-26", start: "2025-07-01", end: "2026-06-30" }, body);
    assert.equal(fiscalPeriod({ date: "2026-06-30", body, view }).label, "FY2025-26", body);
    assert.equal(fiscalPeriod({ date: "2026-07-01", body, view }).label, "FY2026-27", body);
  }
});

test("R49 every entry is researched with a dated basis, and a body with no sourced year (the State Controller) has none", () => {
  const p = get(FIRST);
  for (const f of p.fiscal_year) {
    assert.equal(f.status, "researched");
    assert.match(f.basis, /^2026-10-22 /);
  }
  const view = combine([p]).view;
  const un = fiscalPeriod({ date: "2025-07-01", body: "California State Controller's Office", view });
  assert.equal(un.undetermined, true, "control: no year is guessed for an unsourced body");
});
