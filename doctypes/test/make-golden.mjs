/* Writes `fixtures/docprofile-verdicts.json`: what docprofile's own copies of the seven
 * types gave on every existing fixture, BEFORE this module's regulation reader gained its
 * sections (R18). Run once, on `tranche/T33` before T33-12 deleted those copies:
 *   node doctypes/test/make-golden.mjs
 * It reads docprofile's registry as it stood; it cannot be re-run after the deletion, and
 * need not be: the file is the record of the verdicts the new readings must not change. */
import fs from "node:fs";
import * as dp from "../../docprofile/registry.mjs";
import { CASES, pairsOf } from "./golden-cases.mjs";
import { registryOf, readWith } from "./read.mjs";

const reg = registryOf(dp.doctypes());
const out = { note: "docprofile's seven types' verdicts on every existing fixture, taken by make-golden.mjs on tranche/T33 "
               + "before T33-12 (doctypes R18). `parsed` is the reading as JSON; `assess` the events of each pair of "
               + "readings of one type under one view.", taken_at: "2026-10-05", readings: {}, assess: {} };
const parsed = {};
for (const c of CASES) {
  const r = readWith(reg, c.supplied, c.ctx);
  out.readings[c.id] = { type: r.doctype.type.key, confidence: r.doctype.confidence, signals: r.doctype.signals,
                         also: r.doctype.also, parsed: JSON.parse(JSON.stringify(r.parsed)) };
  parsed[c.id] = { type: r.doctype.type, parsed: r.parsed, ctx: c.ctx };
}
for (const [a, b] of pairsOf(out.readings)) {
  const t = parsed[a].type;
  out.assess[`${a}|${b}`] = JSON.parse(JSON.stringify(t.assess(parsed[a].parsed, parsed[b].parsed, parsed[b].ctx)));
}
fs.writeFileSync(new URL("./fixtures/docprofile-verdicts.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(`${Object.keys(out.readings).length} readings, ${Object.keys(out.assess).length} pairs`);
