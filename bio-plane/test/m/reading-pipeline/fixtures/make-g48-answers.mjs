/* Records `g48-answers.json`: the answers `read` gave on the tip BEFORE G48's change (fix round 6; K4679), for the control
   cases of `../g48-cases.mjs`: the first tick (less `provenance` and `at`), every later piece, each with the cursor it was
   asked by. The file is the record; it is not regenerated afterwards (as `doctypes/test/make-r38-answers.mjs` did).
   Run from `bio-plane/`: node test/m/reading-pipeline/fixtures/make-g48-answers.mjs */
import { writeFileSync } from "node:fs";
import { CASES, readCase, WHOLE_BOUND } from "../g48-cases.mjs";

const out = { recorded_on: process.argv[2] || "the tip before G48", whole_bound: WHOLE_BOUND, cases: {} };
for (const c of CASES) {
  const { asks } = await readCase(c);
  out.cases[c.name] = { chars: c.chars, budget: c.budget, ...(c.maxUnits ? { maxUnits: c.maxUnits } : {}),
                        pieces: asks.map((a) => ({ ask: a.ask, answer: a.record })) };
  console.log(c.name, asks.length, "pieces");
}
writeFileSync(new URL("./g48-answers.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
