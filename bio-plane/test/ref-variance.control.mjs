/* THE NEGATIVE CONTROL FOR M-4's INSTRUMENT, and it exists because a measurement
 * whose answer is mostly ZEROES is the easiest kind to fake. `ref-variance-probe.mjs`
 * reports that a subject name taken from the document matched 0 of 41 reference
 * strings — and a matcher that is simply broken prints exactly the same line. The
 * probe carries gates for that; this file BREAKS each gate's subject and requires
 * the gate to fire, which is the only thing that makes the gates evidence.
 *
 * Run it:  node test/ref-variance.control.mjs      (exit 0 = every arm fired)
 *
 * Every arm restores the file it edited and the RESTORE IS ASSERTED by sha256
 * here rather than eyeballed. Nothing in this file is discovered by
 * `scripts/battery.mjs` (it discovers `*.test.mjs`), and it commits no behaviour.
 *
 * NEGATIVE CONTROL: FOUR arms over the instrument itself.
 *   (a) poison the FOLD — drop `.toLowerCase()` from `Store.#normAlias` in
 *       src/store.mjs -> the probe must REFUSE (G2), because it would otherwise
 *       be measuring a normalisation the plane does not perform.
 *   (b) empty the CORPUS — point the probe at a fixture that does not exist ->
 *       it must REFUSE (G1) rather than report its zeroes over nothing at all.
 *   (c) break the MATCHER — make `candidates()` return nothing -> the positive
 *       control must fire (G3 a/b/c). This is the arm that turns "0 of 41" from
 *       a printout into a finding.
 *   (d) loosen the MATCHER — drop the every-term subset test so any alias
 *       matches any string -> G3 (d) must fire. Without this arm a matcher that
 *       matches EVERYTHING would pass (a)-(c) and inflate section 4's blast
 *       radius to 41/41 for every term, which is the direction that would have
 *       manufactured this item's headline.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const P = fileURLToPath(new URL("./ref-variance-probe.mjs", import.meta.url));
const S = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

const run = (env = {}) => spawnSync(process.execPath, [P], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ...env } });
let failed = 0;
function arm(name, { file, from, to, env }, expect) {
  const before = file ? sha(file) : null;
  if (file) {
    const src = readFileSync(file, "utf8");
    if (!src.includes(from)) { console.log(`FAIL ${name}: the text to break is not in ${file} — the arm's subject moved`); failed++; return; }
    writeFileSync(file, src.replace(from, to));
  }
  const out = run(env);
  if (file) writeFileSync(file, readFileSync(file, "utf8").replace(to, from));
  const after = file ? sha(file) : null;
  const all = `${out.stdout}\n${out.stderr}`;
  const ok = out.status === 1 && expect.test(all);
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  console.log(`       exit ${out.status}, gate line: ${(all.match(/GATE FAILED: .*/) || ["(none)"])[0].slice(0, 140)}`);
  if (file && before !== after) { console.log(`FAIL ${name}: ${file} was NOT restored (${before} -> ${after})`); failed++; }
  if (!ok) failed++;
}

console.log("# M-4 instrument controls — each arm must make the probe REFUSE\n");
arm("(a) poison the fold in src/store.mjs",
  { file: S, from: `.replace(/\\s+/g, " ").toLowerCase().slice(0, 200);`, to: `.replace(/\\s+/g, " ").slice(0, 200);` },
  /Store\.#normAlias has changed/);
arm("(b) point the probe at a corpus that is not there",
  { env: { M4_FIXTURE: "./fixtures/no-such-capture.pdf" } },
  /the corpus could not be read/);
arm("(c) break the matcher — candidates() returns nothing",
  { file: P, from: `  if (!at.length) return [];`, to: `  if (!at.length) return [];\n  if (at.length) return [];` },
  /positive control \(a\)/);
arm("(d) loosen the matcher — drop the every-term subset test",
  { file: P, from: `      if (!at.every((t) => tt.includes(t))) continue;`, to: `      if (false && !at.every((t) => tt.includes(t))) continue;` },
  /positive control \(d\)/);

console.log(`\n${failed ? `${failed} arm(s) DID NOT FIRE — the probe's gates are not evidence` : "4 pass, 0 fail — every gate fired and every file was restored byte-identically"}`);
process.exit(failed ? 1 : 0);
