/* wizard-scripts at T51 (N1184, N858, N1046; DEC-340, U366; K3935): the registry re-taken at `8c5e692e19` (R44). Every test
   drives the module at its interface, over the carried data and the vendored design file it is held equal to; the
   generator is run as a command. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as wz from "../../../src/wizard-scripts/index.mjs";
import { GENERATED, SOURCES } from "../../../src/wizard-scripts/build-data.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const SOURCE_DIR = join(HERE, "source");
const GEN_DIR = fileURLToPath(new URL("../../../src/wizard-scripts/", import.meta.url));
const BUILD = fileURLToPath(new URL("../../../src/wizard-scripts/build-data.mjs", import.meta.url));
const sha = (f) => createHash("sha256").update(readFileSync(join(SOURCE_DIR, f), "utf8"), "utf8").digest("hex");
const run = (...args) => spawnSync(process.execPath, [BUILD, ...args], { encoding: "utf8" });

test("R44 (T51; N1184, N858, N1046; DEC-340, U366; K3935; B2 CHANGE: 20c8001300; amends R41) the registry is re-taken at 20c8001300: SCREEN_REGISTRY_SOURCE names it, with 77 screens and 441 acts (286 declared, 132 function, 23 owed), and build-data.mjs --check passes on the committed files; the library and the front doors stay at their commits; a one-byte change to the registry fails --check", () => {
  assert.deepEqual(wz.SCREEN_REGISTRY_SOURCE, { commit: "20c8001300", path: "docs/development/ux-substrate/screens/registry.json", sha256: sha("registry.json") });
  assert.equal(SOURCES.registry.commit, "20c8001300");
  assert.equal(wz.SCREEN_REGISTRY.length, 77);
  const acts = JSON.parse(readFileSync(join(SOURCE_DIR, "registry.json"), "utf8")).screens.flatMap((s) => s.acts);
  const count = (status) => acts.filter((a) => a.status === status).length;
  assert.deepEqual([acts.length, count("declared"), count("function"), count("owed")], [441, 286, 132, 23]);
  assert.equal(wz.SCREEN_REGISTRY.reduce((n, s) => n + s.acts.length, 0), count("declared") + count("function"),
    "registered acts are the declared and function acts; the owed ones wait for their ops");
  assert.equal(wz.FRONT_DOORS_SOURCE.commit, "20c8001300", "the front doors are unchanged (R41's library)");
  assert.equal(wz.CIVICSMITH_LIBRARY_SOURCE.commit, "d129238bf3", "the library's version 1 is unchanged (R22)");
  assert.equal(wz.CIVICSMITH_LIBRARY.length, 23, "no script added by the re-take (DEC-148; no {template} step)");

  const ok = run("--check");
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /match their sources/);

  const scratch = mkdtempSync(join(tmpdir(), "wz-r44-"));
  try {
    for (const name of GENERATED) copyFileSync(join(GEN_DIR, name), join(scratch, name));
    const flipped = readFileSync(join(GEN_DIR, "screen-registry.mjs"), "utf8").replace("77", "78");
    writeFileSync(join(scratch, "screen-registry.mjs"), flipped);
    const control = run("--check", "--out", scratch);
    assert.equal(control.status, 1, "control: a changed generated file fails --check");
    assert.match(control.stderr, /screen-registry\.mjs is stale/);
    assert.ok(!/civicsmith-library|front-doors/.test(control.stderr), control.stderr);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  assert.ok(GENERATED.includes("screen-registry.mjs"));
});
