/* money R29 (fix round 4, C8-words; K4429; K4438; K4444): a census of refusal codes. No money act answers BAD_PERIOD: that
   code belongs to following and civil-time. Generic codes that name the same condition in every module stay shared (K4444).
   A census must read every module's source, so this test surveys the literal codes passed to `refusal(` and `refuse(`
   under bio-plane/src; it is the one place a test reads source, and it asserts only which code belongs to which module. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = new URL("../../../src/", import.meta.url).pathname;
const RX = /\brefus(?:al|e)\("([A-Z][A-Z_]+)"/g;

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith(".mjs") && !/dist|bundle/.test(p) ? [p] : [];
});

/* the codes each module answers, by module directory */
function codesByModule() {
  const out = {};
  for (const m of readdirSync(SRC).filter((d) => statSync(join(SRC, d)).isDirectory()))
    for (const f of walk(join(SRC, m)))
      for (const x of readFileSync(f, "utf8").matchAll(RX)) (out[m] ??= new Set()).add(x[1]);
  return out;
}

test("R29 the census finds no BAD_PERIOD answered by any money act", () => {
  const codes = codesByModule();
  assert.equal((codes.money ?? new Set()).has("BAD_PERIOD"), false);
});

test("R29 control: the census sees money's own codes, and the fiscal period code belongs to money alone", () => {
  const codes = codesByModule();
  assert.ok(codes.money.has("MONEY_BAD_PERIOD"));
  const elsewhere = Object.keys(codes).filter((m) => m !== "money" && codes[m].has("MONEY_BAD_PERIOD"));
  assert.deepEqual(elsewhere, []);
});
