/* Writes `fixtures/r40-answers.json`: what the types answer on the seeded texts of ./r40-texts.mjs, as digests, taken on
 * the tranche tip before R40 made the staff directory's addresses, the definitions, the exceptions, the references and the
 * calendar's dates linear (doctypes R40, R41). Run once, on that tip:
 *   node doctypes/test/make-r40-answers.mjs
 * The file is the record the linear readings must reproduce; it is not regenerated afterwards. */
import fs from "node:fs";
import { DOCTYPES } from "../index.mjs";
import { HELD } from "./fixtures.mjs";
import { sha } from "./r37-readings.mjs";
import { randomTexts } from "./r40-texts.mjs";

const COUNT = 700;
const ctxOf = (text) => ({ view: HELD, text, locate: (o) => ({ at: o }), alsoSatisfies: () => [] });
const out = { note: "what the types answer on the seeded texts of r40-texts.mjs, as digests, before R40 (doctypes R40, R41)", taken_at: "2026-10-24", count: COUNT, answers: {} };
const texts = randomTexts(COUNT);
for (const t of DOCTYPES) {
  if (t.key === "generic") continue;
  const rows = [];
  for (const text of texts) {
    let d, p;
    try { d = sha(t.detect({ view: HELD, text })); } catch (e) { d = `threw:${String(e && e.message).slice(0, 40)}`; }
    try { p = sha(t.parse(ctxOf(text))); } catch (e) { p = `threw:${String(e && e.message).slice(0, 40)}`; }
    rows.push([d.slice(0, 16), p.slice(0, 16)]);
  }
  out.answers[t.key] = rows;
}
fs.writeFileSync(new URL("./fixtures/r40-answers.json", import.meta.url), JSON.stringify(out) + "\n");
console.log(Object.keys(out.answers).join(","), COUNT);
