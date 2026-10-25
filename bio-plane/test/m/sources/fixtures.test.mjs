/* sources' published fixtures (rungOf, sourceOfReads): each is the module's real answer, checked here at its interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { rungOf, sourceOfReads } from "./fixtures.mjs";
import { RUNGS } from "../../../src/sources/index.mjs";

test("R9 the rungOf fixture: a held source answers the real ladder at rung unknown, and a source no one holds answers NO_SUCH_SOURCE", async () => {
  const f = await rungOf();
  assert.match(f.source, /^SRC-2026-\d{4}$/, "the source is minted by the real read (R1)");
  assert.equal(f.held.ok, true);
  assert.equal(f.held.source, f.source);
  assert.equal(f.held.rung, "same_knocker", "a knock with a secret is a pseudonym, and the secret proves it (R9)");
  assert.equal(typeof f.held.knocker.pseudonym, "string");
  assert.deepEqual(f.held.basis, [], "no disclosure is recorded, so no entry is the basis");
  assert.deepEqual(f.held.ladder, RUNGS);
  assert.equal(f.unheld.ok, false);
  assert.equal(f.unheld.reason, "NO_SUCH_SOURCE");
});

test("R1, R8 the sourceOfReads fixture: a capture with no source and a fetched capture answer NO_SUCH_SOURCE, a capture with a source answers its stated source and history, and publishableAt shows nothing unconsented", async () => {
  const f = await sourceOfReads();
  assert.equal(f.none.ok, false);
  assert.equal(f.none.reason, "NO_SUCH_SOURCE");
  assert.equal(f.fetched.ok, false, "a capture fetched without a knock has no source");
  assert.equal(f.fetched.reason, "NO_SUCH_SOURCE");
  assert.equal(f.withSource.ok, true);
  assert.match(f.withSource.sourceId, /^SRC-2026-\d{4}$/);
  assert.equal(f.withSource.source.kind, "knocker", "the capture's own source, verbatim (R1)");
  assert.deepEqual(f.withSource.history, []);
  assert.equal(f.publishable.ok, true);
  assert.equal(f.publishable.source, f.withSource.sourceId);
  assert.deepEqual(f.publishable.entries, [], "R8: nothing is shown to the group without consent");
});
