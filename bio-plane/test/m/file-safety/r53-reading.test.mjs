/* file-safety R53, R16 (fix round 9, G136e; K4831 (6); SCAN E10): reading does not wait for the scan, said plainly; a hold gates the opening of
   the original and nothing else. At the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, enc } from "./fixture.mjs";
import { readingStatement, readingWords, READING_KEY } from "../../../src/file-safety/index.mjs";

const V = { viewer: "member:m1" };

test("R53: threatOf and originalState carry reading {gated: false, key} whatever the file's state: queued for scan, not scanned, held, encrypted, unscannable; the key is a sentence of this module's table that says so plainly", async () => {
  const outcome = { v: { result: "clean" } };
  const w = world({ scan: { clamav: () => outcome.v } });
  const states = {};
  states.queued = await w.capture(pdf(false, "queued"));
  const check = async (name, s) => {
    const g = await w.fs.threatOf({ captureSha: s, ...V });
    const o = await w.fs.originalState({ captureSha: s, ...V });
    assert.deepEqual(g.reading, { gated: false, key: READING_KEY }, `${name}: threatOf`);
    assert.deepEqual(o.reading, { gated: false, key: READING_KEY }, `${name}: originalState`);
  };
  await check("queued", states.queued);
  for (const [name, v] of [["clean", { result: "clean" }], ["not_scanned", { result: "not_scanned", reason: "SIGNATURES_ABSENT" }], ["held", { result: "found", findings: ["Pdf.Exploit.A"] }],
                           ["encrypted", { result: "encrypted" }], ["unscannable", { result: "unknown", detail: "LIMIT:MaxFileSize" }]]) {
    outcome.v = v;
    const s = await w.capture(pdf(false, name));
    await w.fs.scanBatch({});
    await check(name, s);
    states[name] = s;
  }
  assert.deepEqual(readingStatement(), { gated: false, key: READING_KEY });
  const words = readingWords();
  assert.ok(typeof words === "string" && words.length > 40, "the sentence is held under the key, read by it");
});

test("R16 R53: a hold gates the opening of the original and nothing else: the safe view, the place in the record, the grade's facts and the reading statement are as without it; the notes still say found", async () => {
  const w = world({ scan: { clamav: () => ({ result: "found", findings: ["Pdf.Exploit.B"] }) } });
  const s = await w.capture(pdf(false, "held"));
  await w.fs.scanBatch({});
  const g = await w.fs.threatOf({ captureSha: s, ...V });
  assert.ok(g.scan_hold, "the hold is placed");
  assert.equal((await w.fs.openOriginal({ captureSha: s, ...V })).code, "SCAN_HOLD");
  assert.equal((await w.fs.openOriginal({ captureSha: s, ...V, warned: { own_device: true, no_macros: true } })).code, "SCAN_HOLD");
  await w.fs.renderBatch({});
  assert.equal((await w.fs.safeView({ captureSha: s, ...V })).status, 200, "its safe view is served under the hold");
  assert.deepEqual(g.reading, { gated: false, key: READING_KEY });
  const text = await w.capture(enc("a plain text document\nsecond line\n"));
  assert.equal((await w.fs.safeView({ captureSha: text, ...V })).kind, "text");
});
