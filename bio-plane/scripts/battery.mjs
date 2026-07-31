#!/usr/bin/env node
/* The battery: run EVERY suite, report all of them, fail if any failed.
 *
 * Two defects in the old `npm test` chain, both structural rather than careless:
 *
 * 1. `a && b && c` STOPS at the first failure, so one broken suite hides the
 *    state of every suite after it. D-93 is exactly this: `ratify.test.mjs`
 *    dies with an unhandled spawn error when `ssh-keygen` is absent, and
 *    everything downstream of it never runs — on a machine where the signing
 *    path is the one place a false green matters most.
 *
 * 2. The chain was a HAND-MAINTAINED list of 38 files while `test/` held 41.
 *    `bundle.test.mjs` was in the directory and not in the chain, so it had
 *    stopped being run by anything and nothing said so. The lesson the purge
 *    table already taught (D-113): a list maintained by hand is a list that
 *    silently falls behind the thing it lists.
 *
 * So suites are DISCOVERED from the directory, every one runs, and the summary
 * names the failures. Exit code is the number of failed suites, capped at 125.
 *
 *   node scripts/battery.mjs             all suites
 *   node scripts/battery.mjs search cite only suites whose name contains these
 */

import { readdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const filters = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const QUIET = process.argv.includes("--quiet");

const suites = readdirSync(join(ROOT, "test"))
  .filter((f) => f.endsWith(".test.mjs"))
  .filter((f) => filters.length === 0 || filters.some((x) => f.includes(x)))
  .sort();

if (suites.length === 0) { console.error("no suites matched"); process.exit(1); }

const run = (file) => new Promise((resolve) => {
  const started = Date.now();
  const child = spawn(process.execPath, [join("test", file)], { cwd: ROOT });
  let out = "";
  child.stdout.on("data", (d) => { out += d; });
  child.stderr.on("data", (d) => { out += d; });
  child.on("error", (e) => resolve({ file, code: -1, out: String(e), ms: Date.now() - started }));
  child.on("close", (code) => resolve({ file, code, out, ms: Date.now() - started }));
});

/* Assertion counts come from each suite's own tail line ("name: N pass, M fail"),
   because that is what the suites already print. A suite whose count cannot be
   read is reported as unknown rather than as zero: an unreadable number and no
   assertions are different claims, and collapsing them is how a suite that
   silently ran short would pass unnoticed (the `sshsig` 16-vs-18 case in D-93). */
const tally = (out) => {
  const m = [...out.matchAll(/(\d+)\s+pass(?:ed)?,\s+(\d+)\s+fail(?:ed)?/g)].pop();
  return m ? { pass: +m[1], fail: +m[2] } : null;
};

console.log(`\nbattery: ${suites.length} suites\n`);
const results = [];
for (const file of suites) {
  const r = await run(file);
  const t = tally(r.out);
  results.push({ ...r, tally: t });
  const ok = r.code === 0;
  const counts = t ? `${t.pass} pass${t.fail ? `, ${t.fail} FAIL` : ""}` : "assertions unknown";
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${file.padEnd(28)} ${String(r.ms).padStart(6)}ms  ${counts}`);
  if (!ok && !QUIET) console.log(r.out.split("\n").filter((l) => /FAIL|Error|error/.test(l)).slice(0, 8).map((l) => `          ${l}`).join("\n"));
}

const failed = results.filter((r) => r.code !== 0);
const unknown = results.filter((r) => r.tally === null);
const assertions = results.reduce((n, r) => n + (r.tally ? r.tally.pass : 0), 0);
const ms = results.reduce((n, r) => n + r.ms, 0);

console.log(`\n${results.length - failed.length}/${results.length} suites green · `
  + `${assertions} assertions passing · ${(ms / 1000).toFixed(1)}s`);
if (unknown.length) console.log(`  ${unknown.length} suite(s) reported no assertion count: ${unknown.map((r) => r.file).join(", ")}`);
if (failed.length) console.log(`  FAILED: ${failed.map((r) => r.file).join(", ")}`);
console.log("");

process.exit(Math.min(failed.length, 125));
