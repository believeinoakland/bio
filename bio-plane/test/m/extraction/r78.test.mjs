/* extraction, R78 (T51; K4127; amends R77): `readingFor`'s answer states `format`, the reading's own capture format (a
   format-registry id), absent when the reading holds none, and withheld with the bundle as `bytes` is. Each test names
   the requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, bucket } from "./fixture.mjs";

const READING = { basis: "R78 capture", entities: [] };

async function seeded({ profileFormat = "html", provenance = null } = {}) {
  const evidence = bucket();
  const f = fresh({ evidence, provenance });
  bundle(f.s, "INFO-1");
  const digest = await hold(evidence, "a captured notice, as held");
  f.x.writeReading({ bundleId: "INFO-1", captureSha: digest, reading: READING, profileFormat, composed: true });
  return { ...f, digest };
}

test("R78 R27: a reading written with a capture format answers `format` equal to the format-registry id it holds", async () => {
  const f = await seeded({ profileFormat: "html" });
  assert.equal(f.one("SELECT capture_format FROM readings WHERE capture_sha=?", f.digest).capture_format, "html");
  assert.equal(f.x.readingFor(f.digest, "class:admin").format, "html");
});

test("R78 R27 (control): a reading that holds no capture format answers no `format` key", async () => {
  const f = await seeded({ profileFormat: null });
  assert.equal(f.one("SELECT capture_format FROM readings WHERE capture_sha=?", f.digest).capture_format, null);
  assert.equal("format" in f.x.readingFor(f.digest, "class:admin"), false);
});

test("R78 (control): a viewer the bundle is withheld from receives no `format`, as no `bytes` either", async () => {
  const f = await seeded({ profileFormat: "html" });
  assert.equal("format" in f.x.readingFor(f.digest, "stranger"), false);
});
