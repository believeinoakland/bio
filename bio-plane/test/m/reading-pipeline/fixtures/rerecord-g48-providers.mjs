/* Re-records, in `g48-answers.json`, only the fields a merged provider moved since the record was made, each case checked to differ in
   nothing else (fix round 9, K4872, K4877): `reading.dialect` (format-registry R15 as amended: `assumed` and `disagree`, and the
   csv-reader's signature window) and a PDF's `reading.page_boxes` and `reading.container_extent` (pdf-reader's range now carries the
   boxes and the image placements of its pages, PDF-READER #15, K4866). Run from `bio-plane/`:
   node test/m/reading-pipeline/fixtures/rerecord-g48-providers.mjs */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { CASES, readCase } from "../g48-cases.mjs";
import { classifiedOverSentence } from "../../../../src/reading-pipeline/index.mjs";

const FILE = new URL("./g48-answers.json", import.meta.url);
const record = JSON.parse(readFileSync(FILE, "utf8"));
const MOVED = ["dialect", "page_boxes", "container_extent"];
const opaque = (rec) => (rec && typeof rec.cursor === "string" ? { ...rec, cursor: "<a cursor>" } : rec);
let changed = 0;
for (const c of CASES) {
  const want = record.cases[c.name];
  const { asks } = await readCase(c);
  if (asks.length !== want.pieces.length) throw new Error(`${c.name}: the piece count moved`);
  asks.forEach((a, k) => {
    const old = want.pieces[k].answer;
    /* a case over docprofile's bound states its sample (G48), which the test takes off before comparing, as here */
    let now = a.record;
    if (now.reading && now.reading.classified_over) {
      const { classified_over, basis, ...rest } = now.reading;
      now = { ...now, reading: { ...rest, basis: basis.replace(` — ${classifiedOverSentence(classified_over)}`, "") } };
    }
    if (!old.reading || !now.reading) { if (!isDeepStrictEqual(opaque(old), opaque(now))) throw new Error(`${c.name} piece ${k}: differs`); return; }
    const moved = { ...old, reading: { ...old.reading } };
    for (const key of MOVED) if (key in now.reading) moved.reading[key] = now.reading[key];
    if (!isDeepStrictEqual(opaque(moved), opaque(now))) throw new Error(`${c.name} piece ${k}: differs beyond the provider's fields`);
    if (!isDeepStrictEqual(moved, old)) { want.pieces[k].answer = { ...old, reading: Object.fromEntries(Object.keys(old.reading).map((x) => [x, moved.reading[x]])) }; changed++; }
  });
}
record.rerecorded = "fix round 9 (K4872, K4877): reading.dialect, page_boxes and container_extent as the merged providers answer them";
writeFileSync(FILE, JSON.stringify(record, null, 1) + "\n");
console.log(`re-recorded ${changed} piece(s)`);
