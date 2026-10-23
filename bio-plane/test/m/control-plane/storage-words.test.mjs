/* control-plane R40, G42 (K4640): the gauge's ten code-origin words are held, each under its id, with the placeholders the
   screen fills; the English is never copied here. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { STORAGE_WORDS } from "../../../src/control-plane/storage-words.mjs";

test("R40, G42: STORAGE_WORDS holds the ten gauge sentences; `size` fills {used}, {limit} and {percent}", () => {
  assert.deepEqual(Object.keys(STORAGE_WORDS).sort(),
    ["factorsLatency", "factorsLead", "factorsLimits", "factorsPare", "factorsPlan", "head", "size", "unstated", "warn1", "warn2"]);
  for (const [k, v] of Object.entries(STORAGE_WORDS)) if (k !== "size") assert.ok(typeof v === "string" && v.length > 0, k);
  const sentence = STORAGE_WORDS.size({ used: "7.3", limit: "10", percent: "73" });
  for (const filled of ["7.3", "10", "73"]) assert.ok(sentence.includes(filled), filled);
  assert.equal(/[{}]/.test(sentence), false);
  assert.equal(STORAGE_WORDS.head.includes("{"), false);
});
