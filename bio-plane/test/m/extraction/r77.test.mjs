/* extraction, R77 (T51; K4103; amends R27): `readingFor`'s answer states `bytes`, the stored size of the capture's original
   as provenance's register holds it, absent when the register holds no row and withheld with the bundle. Each test names
   the requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, bucket, homesOver } from "./fixture.mjs";

const READING = { basis: "R77 capture", entities: [] };

/* provenance's R4 register: a row per capture digest, answered by provenance's real instance (its published fixture). */
const register = (rows) => homesOver(rows);

async function seeded(provenance) {
  const evidence = bucket();
  const f = fresh({ evidence, provenance });
  bundle(f.s, "INFO-1");
  const digest = await hold(evidence, "a captured notice, as held");
  f.x.writeReading({ bundleId: "INFO-1", captureSha: digest, reading: READING, profileFormat: "html", composed: true });
  return { ...f, digest };
}

test("R77 R27: a capture whose register row holds its size answers `bytes` equal to the stored size; every other field of R27's answer is what it is without provenance", async () => {
  const bare = await seeded(null);
  const rows = new Map();
  const f = await seeded(register(rows));
  rows.set(f.digest, { bundleId: "INFO-1", path: "a.html", encoding: "utf8", bytes: 4321, registered: "t", authored: false });
  const got = f.x.readingFor(f.digest, "class:admin");
  assert.equal(got.bytes, 4321);
  /* each history row's `kept_at` is its own write's second, so two stores written a second apart differ there alone: compared without it */
  const unstamped = (a) => ({ ...a, reading_history: { ...a.reading_history, readings: a.reading_history.readings.map(({ kept_at, ...r }) => r) } });
  const { bytes, ...rest } = got;
  assert.deepEqual(unstamped(rest), unstamped(bare.x.readingFor(bare.digest, "class:admin")));
});

test("R77 R27 (control): a capture the register holds no row for answers no `bytes` key at all, never a guessed size", async () => {
  const f = await seeded(register(new Map()));
  const got = f.x.readingFor(f.digest, "class:admin");
  assert.equal(got.found, true);
  assert.equal("bytes" in got, false);
});

test("R77 R27 (control): with no provenance joined at all the answer carries no `bytes` key", async () => {
  const f = await seeded(null);
  assert.equal("bytes" in f.x.readingFor(f.digest, "class:admin"), false);
});

test("R77 (control): a viewer the bundle is withheld from receives no `bytes`, as no `text_units` either", async () => {
  const rows = new Map();
  const f = await seeded(register(rows));
  rows.set(f.digest, { bundleId: "INFO-1", path: "a.html", encoding: "utf8", bytes: 4321, registered: "t", authored: false });
  const got = f.x.readingFor(f.digest, "stranger");
  assert.equal("bytes" in got, false);
  assert.equal("text_units" in got, false);
});
