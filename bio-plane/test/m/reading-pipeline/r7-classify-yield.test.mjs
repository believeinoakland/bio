/* reading-pipeline R42 (fix round 7, G88; K4768): in pieces, the classification of a text longer than BREATHE_AT gives the thread back between
   the recognisers. A 12 MB text read as the first tick of a piece read (`cursor: null`) is classified by docprofile's yielding twin, awaited with
   this module's `yieldNow` (a `setTimeout` turn); the answer is the one the code gave before. R-CLOCK: the test counts events and records their
   order, never a time. Every registered content type's `detect` is re-registered wrapped, and `globalThis.setTimeout` (what `yieldNow` calls)
   is wrapped, both pushing onto the one log; a yield sits before the first `detect` and between every two `detect`s - on a text no type matches,
   on a text a CERTAIN winner takes with types registered after it (the `also` pass), and on a minutes-like text a real type reads (its `parse`
   included). The first tick's answer deep-equals `fixtures/r7-classify-answers.json`, recorded by `make-r7-classify-answers.mjs` on the code
   before the call-site change. Not in pieces, the call stays synchronous (no yield between two detects). Heavy: 12 MB texts; run alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { doctypes, registerDoctype } from "../../../../docprofile/registry.mjs";
import { CASES, WINNER_MARK, firstTick } from "./r7-classify-cases.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";
import { plainText } from "./r7-texts.mjs";

const recorded = JSON.parse(readFileSync(fileURLToPath(new URL("./fixtures/r7-classify-answers.json", import.meta.url)), "utf8"));
const BREATHE_AT = 256 * 1024;

let log = [];
for (const t of doctypes()) {
  const detect = t.detect;
  registerDoctype({ ...t, detect: function (...a) { log.push("detect:" + t.key); return detect.apply(this, a); } });
}
const realSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = function (fn, ms, ...rest) { log.push("yield"); return realSetTimeout.call(this, fn, ms, ...rest); };

/* the log of one run: the first tick's answer and the events, detects and yields, in order */
async function run(make) {
  log = [];
  const text = typeof make === "function" ? make() : make;
  const answer = JSON.parse(JSON.stringify(await firstTick(text)));
  return { answer, events: log.filter((e) => e === "yield" || e.startsWith("detect:")) };
}
/* how many `detect`s there were, and the detects with no yield since the one before (the first one: since the start) */
function gaps(events) {
  let detects = 0, bare = [], sinceYield = false;
  for (const e of events) {
    if (e === "yield") { sinceYield = true; continue; }
    detects++;
    if (!sinceYield) bare.push(`${e} (detect ${detects})`);
    sinceYield = false;
  }
  return { detects, bare };
}

for (const [name, why] of [["plain", "a text no type matches"], ["winner", "a CERTAIN winner with types after it"], ["minutes", "a minutes-like text a real type reads"]]) {
  test(`R42 (G88): a 12 MB text, ${why} - a yield before the first detect and between every two detects; the first tick's answer is the one before`, { timeout: 600_000 }, async () => {
    const { answer, events } = await run(CASES[name]);
    const { detects, bare } = gaps(events);
    assert.ok(detects >= 8, `${detects} detects: every registered type is asked`);
    assert.deepEqual(bare, [], "a detect with no yield before it since the one before");
    /* fix round 9 (R45, R47, R49) adds the contract's counters, next and final, each unit's kind (`body`) and the decode's encoding
       facts on purpose; they are taken off by name, every other byte as recorded */
    const { counters, next, final, ...rest } = answer;
    assert.ok(counters && "next" in answer, "the contract's fields");
    /* fix round 9 (R52, job 40): a text judged from a view (above 2 MiB) states it: `classified_over` and the sentence after the basis, taken off by name */
    /* final pass (R63): the paragraph count a text reading states in `container_extent`, taken off by name after its shape is checked */
    if (rest.reading && "container_extent" in rest.reading) {
      const e = rest.reading.container_extent;
      assert.deepEqual([e.levels, e.sheets, e.slides, Number.isInteger(e.paragraphs) && e.paragraphs > 0], [["paragraphs"], null, null, true]);
    }
    const reading = Object.fromEntries(Object.entries(rest.reading || {}).filter(([k]) => !["encoding", "encoding_assumed", "encoding_disagree", "encoding_replaced", "classified_over", "container_extent"].includes(k))
      .map(([k, v]) => [k, k === "basis" && typeof v === "string" ? v.replace(/ — What kind of document this is was judged from a sample of its text.*$/, "") : v]));
    const units = rest.text_units ? rest.text_units.map(({ kind, ...u }) => { assert.equal(kind, "body"); return u; }) : undefined;
    void final;
    assert.deepEqual({ ...rest, ...(rest.reading ? { reading } : {}), ...(units ? { text_units: units } : {}) }, recorded[name]);
  });
}

test("R42 (G88): the threshold is BREATHE_AT characters - at 256 KiB - 1 and 256 KiB the classification is one stretch, at 256 KiB + 1 it yields between detects", async () => {
  const sized = (n) => plainText(n).slice(0, n);
  const bare = {};
  for (const n of [BREATHE_AT - 1, BREATHE_AT, BREATHE_AT + 1]) {
    const t = sized(n);
    assert.equal(t.length, n);
    const { events } = await run(t);
    const g = gaps(events);
    assert.ok(g.detects >= 8, `${g.detects} detects at ${n}`);
    /* the first detect's own yield is the read's breathe (also over BREATHE_AT only); between detects, none unless the twin yields */
    bare[n] = g.bare.length;
  }
  assert.ok(bare[BREATHE_AT - 1] >= 8 && bare[BREATHE_AT] >= 8, `at or under the threshold the detects follow one another (bare ${JSON.stringify(bare)})`);
  assert.equal(bare[BREATHE_AT + 1], 0, `over the threshold every detect is preceded by a yield (bare ${JSON.stringify(bare)})`);
});

test("R42 (G88): a read that is not in pieces keeps the synchronous classification - no yield between two detects", async () => {
  log = [];
  const b = bucket();
  const bytes = Buffer.from(plainText(BREATHE_AT * 2));
  const document = doc({ digest: await hold(b, bytes), bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true });
  await read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio" });
  const g = gaps(log.filter((e) => e === "yield" || e.startsWith("detect:")));
  assert.ok(g.detects >= 8, `${g.detects} detects`);
  assert.ok(g.bare.length >= g.detects - 1, `detects follow one another (bare ${g.bare.length} of ${g.detects})`);
});
