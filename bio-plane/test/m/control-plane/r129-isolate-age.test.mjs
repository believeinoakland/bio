/* control-plane R129 (BOB K4852): the isolate's age is told from the isolate's FIRST request, never an epoch. workerd reads the clock as 0 at the module's global scope. */
import { test } from "node:test";
import assert from "node:assert/strict";

const SRC = new URL("../../../src/control-plane/phase-clock.mjs", import.meta.url).href;
let n = 0;
/* the module imported afresh while the global clock reads 0, as workerd's does at global scope */
async function loadAtZero() {
  const real = Date.now;
  Date.now = () => 0;
  try { return await import(`${SRC}?r129=${++n}`); } finally { Date.now = real; }
}

test("R129 isolate age: the first request of an isolate whose global-scope clock read 0 is age 0, never an epoch", async () => {
  const { makeClock } = await loadAtZero();
  const EPOCH = 1792809551867;
  const first = makeClock(() => EPOCH);
  assert.equal(first.cold().isolate_ms, 0);
  assert.equal(first.cold().object_ms, null);
});

test("R129 isolate age: a later request is the age since the isolate's first request, in injected milliseconds", async () => {
  const { makeClock } = await loadAtZero();
  const EPOCH = 1792809551867;
  makeClock(() => EPOCH);
  const later = makeClock(() => EPOCH + 4321);
  assert.equal(later.cold().isolate_ms, 4321);
  const same = makeClock(() => EPOCH + 5000);
  assert.equal(same.cold().isolate_ms, 5000, "still counted from the first request");
});

test("R129 isolate age control: the object's age is null until `object-age;dur` is stated, then the stated age", async () => {
  const { makeClock, statedEntries } = await loadAtZero();
  const c = makeClock(() => 1792809551867);
  assert.equal(c.cold().object_ms, null);
  c.state(statedEntries("object-age;dur=300000"));
  assert.equal(c.cold().object_ms, 300000);
});
