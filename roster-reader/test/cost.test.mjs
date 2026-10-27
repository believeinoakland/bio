/* roster-reader — what the detectors cost on the text of a large document (R1, R3). Fix round 6, G37: the plane
 * classifies every read by running each registered type's `detect` over the whole text, and these two allocated about
 * 129 MB over a 1 MB text (per line: a copy of the line, a regex made for each match, arrays of words), which in a
 * 128 MB object is garbage collection without end: a 24 MiB text took 14-16 s to classify.
 *
 * COST IS MEASURED BY COLLECTIONS. A child runs with a 2 MB semi-space (the shape harness's setting) and `--trace-gc`;
 * every scavenge is one semi-space of allocation, so the collections between BEGIN and END are the bytes a detector
 * allocated, in units of 2 MB, whatever the machine's speed. The bound is stated per byte of text, from measurement:
 *   before: 77 / 61 collections over 1 MiB (staff_roster / org_chart), 1835 / 1452 over 24 MiB (about 150 B a byte);
 *   after:  11 / 10 over 1 MiB, 250 / 236 over 24 MiB (about 21 B a byte).
 * The bound is 32 B a byte, 1.5 times the measure after. The time bound is a second guard: 24 MiB in under 4 s each
 * (1.2 to 2.3 s after; 4.1 to 5.7 s before, on the machine that measured it). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import crypto from "node:crypto";
import { staffRoster, orgChart } from "../index.mjs";
import { allDocs, ctxOf, FIRST } from "./fixtures.mjs";
import { budgetVolumeText, budgetDocumentText, prefacedRoster } from "./shape-texts.mjs";

const CHILD = fileURLToPath(new URL("./cost-child.mjs", import.meta.url));
const PINNED = JSON.parse(fs.readFileSync(new URL("./fixtures/pinned-verdicts.json", import.meta.url), "utf8")).cases;
const BYTES_PER_COLLECTION = 2 * 1024 * 1024;
const BOUND_BYTES_PER_BYTE = 32;
const SECOND_MS = 1000;

/** The collections each detector causes over a budget volume's text of `bytes`, and what it answered and in how long. */
function measure(bytes) {
  const r = spawnSync(process.execPath, ["--max-semi-space-size=2", "--min-semi-space-size=2", "--trace-gc", CHILD, String(bytes)],
    { encoding: "utf8", timeout: 240000, maxBuffer: 64 * 1024 * 1024 });
  assert.equal(r.status, 0, String(r.stderr).split("\n").slice(0, 6).join(" | "));
  const lines = r.stdout.split("\n");
  const collections = {};
  let key = null;
  for (const line of lines) {
    const begin = /^BEGIN (\w+)/.exec(line), end = /^END (\w+)/.exec(line);
    if (begin) { key = begin[1]; collections[key] = 0; }
    else if (end) key = null;
    else if (key && /Scavenge|Mark-Compact|Mark-sweep/.test(line)) collections[key]++;
  }
  const answers = JSON.parse(lines.filter((l) => l.startsWith("{")).pop());
  return { collections, answers };
}

const sha = (o) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

for (const [bytes, label] of [[1024 * 1024, "1 MiB"], [24 * 1024 * 1024, "24 MiB"]]) {
  test(`R1 R3 staff_roster and org_chart detect a budget volume's ${label} text within ${BOUND_BYTES_PER_BYTE} B allocated a byte and ${label === "24 MiB" ? "4 s" : "a second"}, and answer no`, () => {
    const { collections, answers } = measure(bytes);
    for (const key of ["staff_roster", "org_chart"]) {
      const allocated = collections[key] * BYTES_PER_COLLECTION;
      assert.ok(allocated <= bytes * BOUND_BYTES_PER_BYTE,
        `${key}: ${collections[key]} collections of 2 MB = ${(allocated / bytes).toFixed(0)} B a byte over ${label}, bound ${BOUND_BYTES_PER_BYTE}`);
      assert.equal(answers[key].match, false, `${key}: a budget volume is neither type`);
      assert.ok(answers[key].ms < (label === "24 MiB" ? 4 * SECOND_MS : SECOND_MS), `${key}: ${answers[key].ms.toFixed(0)} ms over ${label}`);
    }
  });
}

test("R1 R3 the detectors' verdicts are those they gave before the cost work: every fixture document, a budget document's text, a budget volume's text, and a roster and a chart behind a preface of 30, 400 and 6,000 lines", () => {
  const cases = {};
  for (const [k, d] of Object.entries(allDocs())) cases[`doc ${k}`] = ctxOf(d, FIRST);
  cases["budget document"] = { text: budgetDocumentText(), view: FIRST, locate: () => null };
  cases["budget volume 1 MiB"] = { text: budgetVolumeText(1048576), view: FIRST, locate: () => null };
  for (const lines of [30, 400, 6000]) cases[`roster_committee behind ${lines} preface lines`] = { text: prefacedRoster("roster_committee", lines), view: FIRST, locate: () => null };
  for (const lines of [30, 400, 6000]) cases[`chart_opw behind ${lines} preface lines`] = { text: prefacedRoster("chart_opw", lines), view: FIRST, locate: () => null };
  assert.deepEqual(Object.keys(cases).sort(), Object.keys(PINNED).sort(), "the pinned cases are the cases read");
  for (const [name, ctx] of Object.entries(cases)) {
    for (const t of [staffRoster, orgChart]) {
      const d = t.detect(ctx);
      assert.deepEqual(d, PINNED[name][t.key].detect, `${name}: ${t.key} detect`);
      assert.equal(d.match ? sha(t.parse(ctx)) : null, PINNED[name][t.key].parse_sha256, `${name}: ${t.key} parse`);
    }
  }
  /* The controls hold the shapes the bound must not cost: a roster behind a short preface is a roster, a chart behind a long one is still a chart. */
  assert.equal(PINNED["roster_committee behind 30 preface lines"].staff_roster.detect.match, true);
  assert.equal(PINNED["chart_opw behind 400 preface lines"].org_chart.detect.match, true);
});
