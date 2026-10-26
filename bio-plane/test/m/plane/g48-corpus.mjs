/* The readings G48's composition test reads (fix round 6, G48; K4673, K4685): every fixture text the doctype, roster, budget and court modules test on, read through the REAL types
 * (`registerReaders()` registers all 17), so a change to `doctypeFor` or `readText` is judged against the answers the real set gave before it. `make-g48-plane-answers.mjs` records
 * them on the tranche tip BEFORE G48 (713e63be2e); `g48-classify.test.mjs` reads them again. The only place that imports all of these test fixtures. */
import fs from "node:fs";
import { CASES } from "../../../../doctypes/test/golden-cases.mjs";
import { HELD } from "../../../../doctypes/test/fixtures.mjs";
import { ROSTER_DOCS } from "../../../../roster-reader/test/fixtures.mjs";
import { budgetDocumentText, budgetVolumeText } from "../../../../roster-reader/test/shape-texts.mjs";
import { pdfFixture, firstView as budgetView, fixture as budgetFixture } from "../../../../budget-doctypes/test/helpers.mjs";
import { viewFor, fixture as courtFixture, FIRST } from "../../../../court-doctypes/test/helpers.mjs";
import { registerReaders } from "../../../src/store-assembly/wiring.mjs";

registerReaders();
const NOW = "2026-03-20T12:00:00Z";

/** [id, supplied, ctx] */
export function corpus() {
  const out = CASES.map((c) => [`doctypes:${c.id}`, c.supplied, c.ctx]);
  for (const [k, d] of Object.entries(ROSTER_DOCS.documents)) out.push([`roster:${k}`, d.text, { view: HELD, now: NOW }]);
  out.push(["budget:document-text", budgetDocumentText(), { view: budgetView(), now: NOW }]);
  out.push(["budget:volume-300k", budgetVolumeText(300_000), { view: budgetView(), now: NOW }]);
  for (const key of ["a14", "a19", "a24", "bb23"]) out.push([`budget:${key}`, pdfFixture(key).supplied, { view: budgetView(), now: NOW }]);
  for (const f of ["fy2013-15-adopted.csv", "fy2019-21-adopted.csv", "m-m1-figures.csv"]) out.push([`budget:${f}`, fs.readFileSync(budgetFixture(f), "utf8"), { view: budgetView(), now: NOW }]);
  for (const f of fs.readdirSync(new URL("../../../../court-doctypes/test/fixtures/", import.meta.url)).filter((n) => n.endsWith(".html")))
    out.push([`court:${f}`, courtFixture(f), { view: viewFor(FIRST), now: NOW }]);
  return out;
}
