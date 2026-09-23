/* D-389's NEGATIVE CONTROL — `node test/d389-fullfetch.control.mjs [arm|all]` from `bio-plane/`.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS `src/store.mjs` while it runs, so the battery must not discover it.
 * It walks no directory. Each arm is armed ALONE; every patch must match its anchor EXACTLY ONCE and must really
 * change the bytes; every restore is verified by sha256 AND by a byte compare against a pristine copy named uniquely
 * per arm, with the byte count printed and a minimum guarded. The suite's output goes to a FILE (D-282), and its
 * verdict is read from its own foot line, never from a wrapper's exit status.
 *
 * The declarations are at the head of `d389-fullfetch.test.mjs`; the expected red sets are repeated here as data so
 * the driver can say AS DECLARED or NOT AS DECLARED per arm rather than leave a reader to compare.
 */
import { readFileSync, writeFileSync, copyFileSync, rmSync, openSync, closeSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./d389-fullfetch.test.mjs", import.meta.url));
const OUT = fileURLToPath(new URL("./.d389-control.out", import.meta.url));
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* RE-POINTED 2026-09-23 BY REC-174: the full-fetch test moved into `#frontierFetch` (shared with the never-looked /
   missing supplies), so the page's claim reads `gated.length > cap || full`. Each arm below breaks the same act. */
const HELPER = "             truncated: gated.length > cap || full };";
const CONTENT_CLAIM = "              || missingFetch.full || latest.truncated,";
const ARMS = {
  baseline: { patches: [], mustFail: [] },
  /* THE ROW'S CONTROL: the disjunct dropped from the one shared over-fetch. */
  nodisjunct: { patches: [[HELPER, "             truncated: gated.length > cap };"]],
                mustFail: ["B1", "B2", "B3", "B4", "S1"] },
  /* THE LIAR: the helper undisjuncted, ONE arm (content) fixed on its own. */
  onearm: { patches: [[HELPER, "             truncated: gated.length > cap, full };"],
                      [CONTENT_CLAIM, "              || missingFetch.full || latest.truncated || latest.full,"]],
            mustFail: ["B1", "B3", "B4", "S1"] },
  /* OVER-STRICTNESS: fail-safe taken past the full fetch. */
  overstrict: { patches: [[HELPER, "             truncated: true };"]],
                mustFail: ["C1", "C2", "C3", "S1"] },
};

const runSuite = () => {
  const fd = openSync(OUT, "w");
  const r = spawnSync(process.execPath, [SUITE], { cwd: ROOT, stdio: ["ignore", fd, fd] });
  closeSync(fd);
  const text = readFileSync(OUT, "utf8");
  rmSync(OUT, { force: true });
  const foot = text.match(/d389-fullfetch: (-?\d+) pass, (\d+) fail/);
  const reds = [...text.matchAll(/^ {2}FAIL {2}(\w+):/gm)].map((m) => m[1]);
  return { status: r.status, pass: foot ? +foot[1] : -1, fail: foot ? +foot[2] : -1, reds };
};

let bad = 0;
const want = process.argv[2] && process.argv[2] !== "all" ? [process.argv[2]] : ["baseline", "nodisjunct", "onearm", "overstrict", "baseline"];
for (const name of want) {
  const arm = ARMS[name];
  if (!arm) { console.log(`no such arm: ${name}`); process.exit(2); }
  const pristine = `${STORE}.d389-pristine-${name}`;
  copyFileSync(STORE, pristine);
  const orig = readFileSync(pristine);
  if (orig.length < 1_000_000) { console.log(`ABORT ${name}: pristine copy is ${orig.length} bytes`); process.exit(2); }
  let src = orig.toString("latin1"), armed = true;
  for (const [from, to] of arm.patches) {
    const n = src.split(from).length - 1;
    if (n !== 1) { console.log(`DID NOT ARM ${name}: anchor occurs ${n} times: ${from.trim()}`); armed = false; break; }
    src = src.replace(from, to);
  }
  let res = null;
  try {
    if (armed) {
      if (arm.patches.length && Buffer.from(src, "latin1").equals(orig)) { console.log(`DID NOT ARM ${name}: bytes unchanged`); armed = false; }
      else { writeFileSync(STORE, Buffer.from(src, "latin1")); res = runSuite(); }
    }
  } finally {
    copyFileSync(pristine, STORE);
    const back = readFileSync(STORE);
    const same = back.equals(orig) && sha(back) === sha(orig);
    console.log(`  restore ${name}: ${back.length} bytes, sha256 ${sha(back).slice(0, 16)}…, ${same ? "IDENTICAL" : "DIFFERS"}`);
    if (!same) { console.log("RESTORE FAILED — the pristine copy is kept at " + pristine); process.exit(3); }
    rmSync(pristine);
  }
  if (!armed) { bad++; continue; }
  const got = [...res.reds].sort().join(" ");
  const exp = [...arm.mustFail].sort().join(" ");
  const ok = got === exp && res.pass >= 0;
  if (!ok) bad++;
  console.log(`${ok ? "AS DECLARED    " : "NOT AS DECLARED"} ${name}: ${res.pass} pass / ${res.fail} fail; red [${got}] declared [${exp}]`);
}
console.log(bad ? `\n${bad} arm(s) not as declared` : "\nevery arm as declared; store.mjs restored byte-identical after each");
process.exit(bad ? 1 : 0);
