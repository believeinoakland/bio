/* bias R46: R42's figures registered with record-core (its R63), whose counts op=stats and purge's proof read. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, S, WHY } from "./world.mjs";
import { biasOf, BIAS_COUNT_KEYS } from "../../../src/bias/index.mjs";

const A = "BIAS-2026-0001-a", B = "BIAS-2026-0002-b", P = "PROJ-2026-0001-p";
const pick = (o) => Object.fromEntries(BIAS_COUNT_KEYS.map((k) => [k, o[k]]));

test("R46: counts(hid) is registered once at start under biasStatements and biasAdoptions; record-core's counts (what op=stats and purge's proof read) answer R42's figures, the hidden bundles passed through, no meaning changed", async () => {
  const w = world();
  await w.group("mo", "owner");
  w.project(P, "owner");
  w.set(A, [S("s1")], "adopted");
  w.set(B, [S("t1"), S("t2")], "adopted");
  w.bias.biasAdopt({ reason: WHY, bundleId: A, author: "admin", identity: "member:admin", viewer: "admin" });
  w.bias.biasAdopt({ reason: WHY, bundleId: B, scope: "project", scopeId: P, author: "owner", identity: "member:owner", viewer: "member:owner" });
  assert.deepEqual(BIAS_COUNT_KEYS, ["biasStatements", "biasAdoptions"]);
  /* record-core's counts answer exactly this module's, with and without the caller's hidden bundles */
  assert.deepEqual(w.bias.counts(), { biasStatements: 3, biasAdoptions: 2 });
  assert.deepEqual(pick(w.record.counts()), w.bias.counts());
  const hid = { sql: "(?)", args: [P] };
  assert.deepEqual(pick(w.record.counts(hid)), w.bias.counts(hid));
  assert.deepEqual(pick(w.record.counts(hid)), { biasStatements: 3, biasAdoptions: 1 });
  /* a hidden set of bundles leaves out both a statement's and an adoption's rows, as R42 states */
  assert.deepEqual(pick(w.record.counts({ sql: "(?, ?)", args: [B, A] })), { biasStatements: 0, biasAdoptions: 0 });
  /* registered once: the same instance is answered again and registers nothing more; the keys are this module's */
  assert.equal(biasOf(w.ctx), w.bias);
  const again = w.record.registerCounts("bias", [...BIAS_COUNT_KEYS], () => ({}));
  assert.deepEqual([again.ok, again.reason, again.heldBy], [false, "COUNTS_DECLARED", "bias"]);
  const taken = w.record.registerCounts("someone-else", ["biasAdoptions"], () => ({}));
  assert.deepEqual([taken.ok, taken.reason, taken.key, taken.heldBy], [false, "COUNTS_DECLARED", "biasAdoptions", "bias"]);
  /* a figure that cannot be read is null through record-core too, never zero */
  w.sql.exec(`ALTER TABLE bias_adoptions RENAME TO gone`);
  assert.deepEqual(pick(w.record.counts()), { biasStatements: 3, biasAdoptions: null });
});
