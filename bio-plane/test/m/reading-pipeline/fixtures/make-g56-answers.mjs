/* Records `g56-answers.json`: what `read` in pieces answered on the tip BEFORE G56's change (the range 200 pages, no byte bound;
   `rangePages: 200` passed explicitly, `unitsBudget` 512 KiB), for the light and the heavy synthetic PDF of `../g56-cases.mjs`:
   every unit's digest in order, `total`, `page_count`, `words_total`, the sum of the pieces' words, the cursor's `n`, and the old cursor
   cut after the first piece. The file is the record; it is not regenerated afterwards. Not run by the suite.
   Run from `bio-plane/`: node test/m/reading-pipeline/fixtures/make-g56-answers.mjs */
import { writeFileSync } from "node:fs";
import { LIGHT, HEAVY, worldOf, inPieces, summary } from "../g56-cases.mjs";

const out = { recorded_on: process.argv[2] || "the tip before G56", range_pages_asked: 200, cases: {} };
for (const [name, synth] of [["light", LIGHT], ["heavy", HEAVY]]) {
  const w = await worldOf(synth);
  const s = summary(await inPieces(w, { rangePages: 200 }));
  out.cases[name] = { synth, file_bytes: w.bytes.length, bytes_per_page: w.bytes.length / synth.pages, ...s };
  console.log(name, w.bytes.length, "B", s.pieces, "pieces", s.units, "units", JSON.stringify(s.spans));
}
writeFileSync(new URL("./g56-answers.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
