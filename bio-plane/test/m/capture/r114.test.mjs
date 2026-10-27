/* capture, R114 (G180; K5020; amends R113): the running digest of a parted upload is record-grammar's. The module carries no SHA-256 of its own, and the
   snapshot the former stream kept with a row (CAPTURE #57's `hash_state`) is taken up by record-grammar's stream unchanged, so no upload in flight is lost. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createResumableSha256 } from "../../../src/record-grammar/index.mjs";

const SRC = new URL("../../../src/capture/", import.meta.url);
const bytes = Uint8Array.from({ length: 100 }, (_, i) => (i * 3) & 255);
const ref = createHash("sha256").update(bytes).digest("hex");
/* the snapshot the former `sha256-resume.mjs` wrote after the first 70 of `bytes` (taken before that file was removed) */
const FORMER = '{"h":[1702384902,4112125087,3412620371,291457892,402828730,2094453924,648039771,3377690508],"t":70,"b":"c0c3c6c9cccf"}';

test("R114 (G180): no file of the module computes SHA-256 rounds: none holds the first round constant or the initial hash value", () => {
  for (const name of readdirSync(SRC).filter((n) => n.endsWith(".mjs"))) {
    const text = readFileSync(new URL(name, SRC), "utf8");
    assert.equal(/0x428a2f98|0x6a09e667/i.test(text), false, `${name} computes SHA-256 rounds`);
  }
});

test("R114 (G180): a row's snapshot kept by the former stream is taken up by record-grammar's, and finishes to the digest of the whole", () => {
  const rest = createResumableSha256(FORMER);
  assert.equal(rest.length, 70);
  assert.equal(rest.update(bytes.subarray(70)).hex(), ref);
});
