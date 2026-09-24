/* d241-derivation-stated.control.mjs — the NEGATIVE CONTROL for `test/d241-derivation-stated.test.mjs` (D-241,
 * CONTENT-SEARCH-DESIGN.md §4.3).
 *
 * Deliberately NOT a `.test.mjs`: it EDITS the real `src/store.mjs` while it runs, and the battery must not discover
 * it. Run from `bio-plane/`: `node test/d241-derivation-stated.control.mjs [arm|all]`. Each arm: the anchor asserted
 * to occur EXACTLY ONCE (or the arm reports it did not arm), the file copied aside to a uniquely named per-arm
 * pristine copy, patched, the suite run with its output captured to a FILE (D-282), and the file restored by `cp`
 * from that copy — verified by sha256 AND byte compare, the byte count printed and floored. The failing assertion
 * names are compared with what was DECLARED before arming; missing and unexpected failures are both printed.
 *
 * RESULTS: recorded on the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync, openSync, closeSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const STORE = join(PLANE, "src", "store.mjs");
const SUITE = join(PLANE, "test", "d241-derivation-stated.test.mjs");
const FLOOR = 1_000_000;
const digest = (buf) => createHash("sha256").update(buf).digest("hex");

const READ = "const obs = this.#one(";
const PAGE_BIT = "if (obs) return derivationStatement(obs);";
const NO_ROW = 'return derivationStatement(null, this.#missingMeaningCause("entity", entityId, ent ? ent.at : null));';
const LATEST = "`SELECT at, state, detail FROM observation_log\n              WHERE level = 'meaning' AND subject_kind = 'entity' AND subject = ?\n              ORDER BY seq DESC LIMIT 1`";

const ARMS = {
  baseline: { patches: [], mustFail: [] },
  /* THE ROW'S CONTROL: the observation read removed. */
  noread: { patches: [[READ, "const obs = null && this.#one("]],
            mustFail: ["A2", "A3", "A4", "A5", "A6", "A7"] },
  /* LIAR 1: the derivation's extent taken from the READ's own page bit. */
  readbit: { patches: [[PAGE_BIT, 'if (obs) return { ...derivationStatement(obs), cut: truncated, '
                                 + 'state: truncated ? "partial" : "PRESENT" };']],
             mustFail: ["A2", "A3", "A5", "A7"] },
  /* LIAR 2: no row read as a complete, uncut derivation. */
  complete: { patches: [[NO_ROW, 'return { state: "PRESENT", cut: false, at: null, documents: null, '
                               + 'derived: "derived", says: "complete" };']],
              mustFail: ["A1", "A8"] },
  /* OVER-STRICTNESS: the same read in a spelling the suite did not anticipate. */
  overstrict: { patches: [[LATEST, "`SELECT at, state, detail FROM observation_log WHERE seq = (SELECT MAX(seq) "
                               + "FROM observation_log WHERE level = 'meaning' AND subject_kind = 'entity' "
                               + "AND subject = ?)`"]],
                mustFail: [] },
};

const work = mkdtempSync(join(tmpdir(), "d241-control-"));
const run = (name) => {
  const arm = ARMS[name];
  const pristine = join(work, `store.${name}.pristine.mjs`);
  copyFileSync(STORE, pristine);
  const orig = readFileSync(pristine);
  if (orig.length < FLOOR) throw new Error(`pristine copy is ${orig.length} B, under the ${FLOOR} B floor`);
  let src = orig.toString("latin1");
  for (const [from, to] of arm.patches) {
    const n = src.split(from).length - 1;
    if (n !== 1) return console.log(`ARM ${name}: DID NOT ARM — anchor occurs ${n} time(s)`), false;
    src = src.replace(from, () => to);
  }
  const out = join(work, `${name}.log`);
  let status;
  try {
    writeFileSync(STORE, Buffer.from(src, "latin1"));
    const fd = openSync(out, "w");
    status = spawnSync(process.execPath, [SUITE], { cwd: PLANE, stdio: ["ignore", fd, fd] }).status;
    closeSync(fd);
  } finally {
    copyFileSync(pristine, STORE);
  }
  const back = readFileSync(STORE);
  const same = back.equals(orig) && digest(back) === digest(orig);
  const log = readFileSync(out, "utf8");
  const failed = [...log.matchAll(/^ {2}FAIL {2}(\w+):/gm)].map((m) => m[1]);
  const tally = (/d241-derivation-stated: (-?\d+) pass, (\d+) fail/.exec(log) || []).slice(1).join("/") || "NO TALLY";
  const missing = arm.mustFail.filter((f) => !failed.includes(f));
  const unexpected = failed.filter((f) => !arm.mustFail.includes(f));
  const ok = !missing.length && !unexpected.length && tally !== "NO TALLY" && !/THREW/.test(log);
  console.log(`ARM ${name}: exit ${status} · ${tally} · failed [${failed.join(" ")}] · `
            + `${ok ? "AS DECLARED" : `NOT AS DECLARED (missing [${missing}] unexpected [${unexpected}])`} · `
            + `restored ${back.length} B sha256 ${digest(back).slice(0, 16)}… ${same ? "IDENTICAL" : "DIFFERS"}`);
  if (!same) throw new Error("RESTORE FAILED — stop");
  return ok;
};

const want = process.argv[2] || "all";
const names = want === "all" ? ["baseline", "noread", "readbit", "complete", "overstrict", "baseline"] : [want];
let good = 0;
try { for (const n of names) if (run(n)) good++; }
finally { rmSync(work, { recursive: true, force: true }); }
console.log(`\n${good}/${names.length} arm(s) as declared`);
process.exit(good === names.length ? 0 : 1);
