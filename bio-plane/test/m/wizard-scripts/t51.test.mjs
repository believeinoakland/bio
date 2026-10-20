/* wizard-scripts at T51 (N1184, N858, N1046; DEC-340, U366; K3935): the registry re-taken at `8c5e692e19` (R44) and again at `958d998ccb` in the fix round (R45). Every test
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

test("R44 (T51; N1184, N858, N1046; DEC-340, U366; K3935; amends R41) the registry as re-taken at 8c5e692e19 held 77 screens, the four new being grouprules, counsel, hold and holdnotice, whose acts include writinghelp; the vendored copy of that commit's file and of 2a64c5ae77's are kept beside the current one, each older than it", () => {
  const at = (f) => JSON.parse(readFileSync(join(SOURCE_DIR, f), "utf8"));
  const earlier = at("registry-8c5e692e19.json");
  assert.equal(earlier.screens.length, 77);
  const before = at("registry-7be06eb4cb.json").screens.map((s) => s.id);
  for (const id of ["grouprules", "counsel", "hold", "holdnotice"]) {
    assert.ok(earlier.screens.some((s) => s.id === id), `${id}: in the registry at 8c5e692e19`);
    assert.ok(!before.includes(id), `control: ${id} is not in the registry at 7be06eb4cb`);
  }
  assert.ok(earlier.screens.filter((s) => ["grouprules", "counsel", "hold", "holdnotice"].includes(s.id)).some((s) => s.acts.some((a) => a.op === "writinghelp")));
  assert.equal(at("registry-2a64c5ae77.json").screens.length, 77, "2a64c5ae77 added an act on hold, no screen");
  assert.equal(at("registry.json").screens.length, 83, "control: the carried file is the later one (R45)");
});

test("R45 (T51 fix round; K4196; DEC-374 to DEC-383; K2241; amends R44) the registry is re-taken at 958d998ccb: SCREEN_REGISTRY_SOURCE names it, with 83 screens and 554 acts (426 declared, 83 function, 45 owed); bias, contradiction, objective, about-knocker, leads and watching are in SCREEN_REGISTRY with their names and acts, each owed act registered by R13 and never as a served op; the library and the front doors are unchanged (library.json did not change, R42's rule); build-data.mjs --check passes on the committed files and a one-byte change fails it", () => {
  assert.deepEqual(wz.SCREEN_REGISTRY_SOURCE, { commit: "958d998ccb", path: "docs/development/ux-substrate/screens/registry.json", sha256: sha("registry.json") });
  assert.equal(SOURCES.registry.commit, "958d998ccb");
  const file = JSON.parse(readFileSync(join(SOURCE_DIR, "registry.json"), "utf8"));
  const acts = file.screens.flatMap((s) => s.acts);
  const count = (status) => acts.filter((a) => a.status === status).length;
  assert.deepEqual([wz.SCREEN_REGISTRY.length, acts.length, count("declared"), count("function"), count("owed")], [83, 554, 426, 83, 45]);
  assert.equal(wz.SCREEN_REGISTRY.reduce((n, s) => n + s.acts.length, 0), file.screens.reduce((n, s) => n + new Set(s.acts.filter((a) => a.status !== "owed").map((a) => a.op)).size, 0),
    "registered acts are the declared and function acts, an op two acts of a screen share counted once (members: expertiseconfirm); the owed ones wait for their ops");
  assert.equal(new Set(file.screens.find((s) => s.id === "members").acts.map((a) => a.op)).size, file.screens.find((s) => s.id === "members").acts.length - 1, "control: the file lists expertiseconfirm twice on members");
  assert.equal(wz.SCREEN_REGISTRY.find((s) => s.id === "members").acts.filter((op) => op === "expertiseconfirm").length, 1, "and the registry carries it once, so the release suite finds no repeated act");
  assert.equal(wz.SCREEN_REGISTRY.reduce((n, s) => n + s.owed.length, 0), count("owed"), "every owed act is carried apart (R13)");
  for (const id of ["bias", "contradiction", "objective", "about-knocker", "leads", "watching"]) {
    const f = file.screens.find((s) => s.id === id);
    const r = wz.SCREEN_REGISTRY.find((s) => s.id === id);
    assert.ok(f && r, `${id}: in the file and in SCREEN_REGISTRY`);
    assert.deepEqual([r.name, r.purpose], [f.name, f.purpose], `${id}: its name (the crumb) and purpose from the file`);
    assert.deepEqual(r.acts, [...new Set(f.acts.filter((a) => a.status !== "owed").map((a) => a.op))], `${id}: its declared and function acts`);
    assert.ok(!file.screens.find((s) => s.id === id).acts.some((a) => a.status === "owed" && !/^owed:[a-z]/.test(a.op)), `${id}: an owed act names its op`);
  }
  assert.deepEqual(JSON.parse(readFileSync(join(SOURCE_DIR, "registry-2a64c5ae77.json"), "utf8")).screens.map((s) => s.id).filter((id) => !wz.SCREEN_REGISTRY.some((s) => s.id === id)), [], "control: the earlier registry's screens are all still carried");
  assert.equal(wz.FRONT_DOORS_SOURCE.commit, "2a64c5ae77", "the front doors are unchanged: library.json did not change (R42's rule)");
  assert.equal(wz.CIVICSMITH_LIBRARY_SOURCE.commit, "d129238bf3", "the library's version 1 is unchanged (R22)");
  assert.equal(wz.CIVICSMITH_LIBRARY.length, 23);

  const ok = run("--check");
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /match their sources/);

  const scratch = mkdtempSync(join(tmpdir(), "wz-r45-"));
  try {
    for (const name of GENERATED) copyFileSync(join(GEN_DIR, name), join(scratch, name));
    const flipped = readFileSync(join(GEN_DIR, "screen-registry.mjs"), "utf8").replace("958d998ccb", "958d998ccc");
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
