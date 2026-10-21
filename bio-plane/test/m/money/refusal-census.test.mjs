/* money R29 (fix round 4, C8-words; K4429; K4438): a census of refusal codes. No refusal code money answers is also answered
   by another module, the shared act rows of record-grammar's SHARED_ACT_CHECKS aside. A census must read every module's
   source, so this test surveys the literal codes passed to `refusal(` and `refuse(` under bio-plane/src; it is the one
   place a test reads source, and it asserts only which code belongs to which module. */
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

test("R29 no refusal code money answers is also answered by another module, the shared act rows aside", () => {
  const codes = codesByModule();
  const shared = readFileSync(join(SRC, "record-grammar/index.mjs"), "utf8");
  const clashes = [...(codes.money ?? [])]
    .filter((c) => !shared.includes(`"${c}"`))
    .map((c) => ({ code: c, also: Object.keys(codes).filter((m) => m !== "money" && codes[m].has(c)) }))
    .filter((x) => x.also.length);
  assert.deepEqual(clashes, [], `money's codes also answered elsewhere: ${clashes.map((x) => `${x.code} (${x.also.join(", ")})`).join("; ")}`);
});

test("R29 control: the census sees money's own codes, and the fiscal period code belongs to money alone", () => {
  const codes = codesByModule();
  assert.ok(codes.money.has("MONEY_BAD_PERIOD"));
  const elsewhere = Object.keys(codes).filter((m) => m !== "money" && codes[m].has("MONEY_BAD_PERIOD"));
  assert.deepEqual(elsewhere, []);
});
