/* REC-174's NEGATIVE CONTROL — `node test/rec174-supplyfetch.control.mjs [arm|all]` from `bio-plane/`.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS `src/store.mjs` while it runs, so the battery must not discover it.
 * D-389's control is the model and its discipline is kept: each arm is armed ALONE; every patch must match its anchor
 * EXACTLY ONCE and must really change the bytes; every restore is verified by sha256 AND by a byte compare against a
 * pristine copy named uniquely per arm, with the byte count printed and a minimum guarded. The suite's output goes to
 * a FILE (D-282), and its verdict is read from its own foot line, never from a wrapper's exit status.
 *
 * The declarations are at the head of `rec174-supplyfetch.test.mjs`; the expected red sets are repeated here as data
 * so the driver can say AS DECLARED or NOT AS DECLARED per arm.
 */
import { readFileSync, writeFileSync, copyFileSync, rmSync, openSync, closeSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./rec174-supplyfetch.test.mjs", import.meta.url));
const OUT = fileURLToPath(new URL("./.rec174-control.out", import.meta.url));
const sha = (b) => createHash("sha256").update(b).digest("hex");

const DOC_CLAIM = "             truncated: never.length > cap || neverFetch.full   /* REC-174: the never-looked fetch's claim */";
const CONTENT_CLAIM = "              || missingFetch.full || latest.truncated,";
const MEANING_FULL = "              || captureFetch.full || referenceFetch.full || entityFetch.full";
const MEANING_CUT = "      truncated: never.length > cap || unexplained.length > cap\n" + MEANING_FULL;
const MEANING_CAPTURE_FETCH = "    const captureFetch = this.#frontierFetch((cap + 1) * 2,";
const FULL_TEST = "    return { rows: gate ? raw.filter(gate) : raw, full: raw.length === limit };";

const ARMS = {
  baseline: { patches: [], mustFail: [] },
  /* THE ROW'S CONTROL, ONE ARM AT A TIME: the full-fetch bit dropped from ONE arm's (or one list's) claim. */
  document: { patches: [[DOC_CLAIM, "             truncated: never.length > cap"]], mustFail: ["B1", "F1"] },
  content: { patches: [[CONTENT_CLAIM, "              || latest.truncated,"]], mustFail: ["B2", "B4", "F1"] },
  mcapture: { patches: [[MEANING_FULL, "              || referenceFetch.full || entityFetch.full"]],
              mustFail: ["B3", "B5", "F1"] },
  mreference: { patches: [[MEANING_FULL, "              || captureFetch.full || entityFetch.full"]],
                mustFail: ["B6", "F1"] },
  /* DECLARED GREEN, AND THAT IS A STATEMENT ABOUT WHAT THIS SUITE CAN SEE: the entity supply is UNGATED, so on a full
     fetch of `(cap + 1) * 2` rows every viewer holds all of them, split two ways by cause — one list exceeds `cap`
     and `truncated` is already true without the bit. The bit is kept for the rule's sake; no fixture can make it
     the only witness while the over-fetch stands. */
  mentity: { patches: [[MEANING_FULL, "              || captureFetch.full || referenceFetch.full"]], mustFail: [] },
  /* The second defect: the meaning arm's claim without `unexplained` (as before this row). */
  munexplained: { patches: [[MEANING_CUT, "      truncated: never.length > cap\n" + MEANING_FULL]], mustFail: ["C5"] },
  /* The over-fetch withdrawn from ONE meaning list (the capture fetch back to `cap + 1`). */
  moverfetch: { patches: [[MEANING_CAPTURE_FETCH, "    const captureFetch = this.#frontierFetch(cap + 1,"]],
                mustFail: ["C3", "C5", "E1", "S1"] },
  /* OVER-STRICTNESS: the fail-safe taken past the full fetch — every fetch claims to be full. */
  overstrict: { patches: [[FULL_TEST, "    return { rows: gate ? raw.filter(gate) : raw, full: true };"]],
                mustFail: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "E1", "E2", "S1"] },
};

const runSuite = () => {
  const fd = openSync(OUT, "w");
  const r = spawnSync(process.execPath, [SUITE], { cwd: ROOT, stdio: ["ignore", fd, fd] });
  closeSync(fd);
  const text = readFileSync(OUT, "utf8");
  rmSync(OUT, { force: true });
  const foot = text.match(/rec174-supplyfetch: (-?\d+) pass, (\d+) fail/);
  const reds = [...text.matchAll(/^ {2}FAIL {2}(\w+):/gm)].map((m) => m[1]);
  return { status: r.status, pass: foot ? +foot[1] : -1, fail: foot ? +foot[2] : -1, reds };
};

let bad = 0;
const ORDER = ["baseline", "document", "content", "mcapture", "mreference", "mentity", "munexplained", "moverfetch",
               "overstrict", "baseline"];
const want = process.argv[2] && process.argv[2] !== "all" ? [process.argv[2]] : ORDER;
for (const name of want) {
  const arm = ARMS[name];
  if (!arm) { console.log(`no such arm: ${name}`); process.exit(2); }
  const pristine = `${STORE}.rec174-pristine-${name}`;
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
