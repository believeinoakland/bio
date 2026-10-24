/* plane G123h (fix round 9; S-40): `npm test` and the module runner (`.github/scripts/module-tests.mjs`) apply THE SAME platform-sqlite preload, so a value over
   the platform's single-value limit (2,098,176 B) is refused under both. The command `npm test` runs is read from `package.json`'s `test` script (the interface a
   contributor runs), the runner's from its own preload path; each is then run as a child on a 2,100,000 B bound value, which the platform refuses. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const PLANE = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const REPO = resolve(PLANE, "..");
const RUNNER_PRELOAD = resolve(REPO, "bio-plane/test/platform-sqlite.mjs");   /* module-tests.mjs: `resolve("bio-plane/test/platform-sqlite.mjs")` from the repository root */
const PROBE = `import { DatabaseSync } from "node:sqlite"; const db = new DatabaseSync(":memory:"); db.exec("CREATE TABLE t(v TEXT)");
  try { db.prepare("INSERT INTO t VALUES (?)").run("x".repeat(2_100_000)); process.stdout.write("ACCEPTED"); } catch (e) { process.stdout.write("REFUSED " + e.errcode); }`;
const probe = (preloads, cwd) => spawnSync(process.execPath, [...preloads.flatMap((p) => ["--import", p]), "--input-type=module", "-e", PROBE], { cwd, encoding: "utf8" }).stdout;

/** the `--import` targets of the `npm test` command, resolved against the directory npm runs it in (bio-plane) */
const npmTestPreloads = () => {
  const script = JSON.parse(readFileSync(resolve(PLANE, "package.json"), "utf8")).scripts.test;
  const words = script.split(/\s+/); const out = [];
  words.forEach((w, i) => { if (w === "--import" && words[i + 1]) out.push(resolve(PLANE, words[i + 1])); });
  return out;
};

test("G123h: `npm test` applies the preload the module runner applies", () => {
  assert.deepEqual(npmTestPreloads(), [RUNNER_PRELOAD]);
});
test("G123h: the 2,098,176 B value shim fires on a 2,100,000 B row under both runs, and a control without it accepts the row", () => {
  assert.match(probe(npmTestPreloads(), PLANE), /^REFUSED 18/, "npm test");
  assert.match(probe([RUNNER_PRELOAD], REPO), /^REFUSED 18/, "the module runner");
  assert.equal(probe([], PLANE), "ACCEPTED", "control: no preload");
});
