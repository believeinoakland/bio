/* roster-reader through docprofile's real registry seam, as `plane` wires it: `registerRosterTypes`
 * given docprofile's `registerDoctype`, then a captured document read with `readText`, the entry the
 * reading pipeline calls. Its own file because the registration is process-wide. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { registerDoctype, readText, doctypeFor, doctypes, CONFIDENCE } from "../../docprofile/registry.mjs";
import { registerRosterTypes } from "../index.mjs";
import { ROSTER_DOCS, FW18, FIRST } from "./fixtures.mjs";

const D = ROSTER_DOCS.documents;

test("R1 R3 through docprofile's seam: both types register, and readText recognises and reads the measured documents", () => {
  const results = [];
  registerRosterTypes((t) => { const r = registerDoctype(t); results.push(r); return r; });
  assert.deepEqual(results.map((r) => [r.ok, r.key]), [[true, "staff_roster"], [true, "org_chart"]]);
  const keys = doctypes().map((t) => t.key);
  for (const k of ["staff_roster", "org_chart", "staff_directory", "generic"]) assert.ok(keys.includes(k), k);

  const roster = readText(D.roster_committee.text, { view: FIRST });
  assert.equal(roster.determined, true);
  assert.equal(roster.doctype.type.key, "staff_roster");
  assert.equal(roster.doctype.confidence, CONFIDENCE.CERTAIN);
  assert.ok(roster.parsed.rows.some((r) => r.name === "Zac Unger" && r.title === "Chair" && r.unit === "Public Works"));
  for (const r of roster.parsed.rows) assert.equal(r.source.kind, "pdf-page");

  const chart = readText(D.chart_opd.text, { view: FIRST });
  assert.equal(chart.doctype.type.key, "org_chart");
  assert.ok(chart.parsed.units.length > 0);

  /* The substance documents keep their own types: registering these takes nothing from them. */
  for (const [k, d] of Object.entries(FW18.documents)) {
    const t = doctypeFor({ text: typeof d.text === "string" ? d.text : d.text.document, view: FIRST });
    assert.ok(!["staff_roster", "org_chart"].includes(t.type.key), k);
    assert.ok(!(t.also || []).some((x) => ["staff_roster", "org_chart"].includes(x.key)), k);
  }
});
