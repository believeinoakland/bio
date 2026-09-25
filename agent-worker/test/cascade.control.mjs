/* FL-6's NEGATIVE CONTROL DRIVER — four arms, re-runnable in one step:
 *
 *     node test/cascade.control.mjs          # every arm, in order
 *     node test/cascade.control.mjs 2        # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES while it runs, and a
 * file the battery discovers must never be one that rewrites the tree under
 * the suites beside it (fleetbundles.control.mjs' precedent, one tree over,
 * itself on PL-3/PL-4/PL-11's). The same three paid-for rules hold here:
 * snapshots live in memory inside THIS worktree and are written back in a
 * `finally`; every restore is verified by CONTENT and by sha256 with a byte
 * floor; suite output goes to a FILE and the exit status is read from
 * `spawnSync().status`, never a pipeline's (D-282).
 *
 * `git checkout -- <file>` IS NEVER USED HERE — it restores to HEAD, not to
 * what you had, and it has already cost this repository a whole uncommitted
 * implementation twice in two days (CLAUDE.md's trap list, 2026-09-12).
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../../bio-plane/scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(DIR, "..");
const PEN = join(MEMBER, ".nc-cascade");
const LOG = join(PEN, "run.out");
const SUITE = join(DIR, "cascade.test.mjs");
const INDEX = join(MEMBER, "src/index.mjs");
const CASCADE = join(MEMBER, "src/cascade.mjs");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 200;

function runSuite() {
  const r = spawnSync("node", [SUITE], { cwd: MEMBER, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  writeFileSync(LOG, out);
  const m = /cascade: (\d+) pass, (\d+) fail/.exec(out);
  return { status: r.status, pass: m ? Number(m[1]) : -1, fail: m ? Number(m[2]) : -1, out };
}

/* Arm by EXACT-STRING replacement, snapshotted and restored with both proofs.
   A replacement that matches nothing THROWS — an arm that armed nothing and
   ran green would read as a defence holding. */
function withReplaced(file, from, to, body) {
  if (ANCHOR_DRY) return void anchorPatch(file, from, to, "any");   /* M0-197: read, never armed (it arms on >=1 match) */
  const before = readFileSync(file);
  if (before.length < FLOOR) throw new Error(`refusing to arm ${file}: below the byte floor`);
  const text = before.toString("utf8");
  if (!text.includes(from)) throw new Error(`arm matched nothing in ${file}: ${from.slice(0, 60)}…`);
  try {
    writeFileSync(file, text.replace(from, to));
    return body();
  } finally {
    writeFileSync(file, before);
    const after = readFileSync(file);
    const ok = after.equals(before) && sha(after) === sha(before) && after.length >= FLOOR;
    console.log(`    restore ${file.replace(MEMBER + "/", "")}: content=${after.equals(before)} sha256=${sha(after) === sha(before)} bytes=${after.length}`);
    if (!ok) throw new Error("RESTORE FAILED — stop and fix the tree by hand");
  }
}

const failingLabels = (out) =>
  out.split("\n").filter((l) => l.trim().startsWith("FAIL ")).map((l) => l.trim().slice(5).trim());
const report = (r, { mustFail, mustNot }) => {
  console.log(`  -> ${r.pass} pass, ${r.fail} fail, exit ${r.status}`);
  console.log(`     MUST FAIL : ${mustFail}`);
  console.log(`     MUST NOT  : ${mustNot}`);
  for (const l of failingLabels(r.out)) console.log(`     RED: ${l}`);
  if (r.pass === -1) console.log("     !! THE SUITE PRINTED NO TALLY — it died rather than failing. That is a FINDING.");
  return r;
};

const ARMS = {
  baseline: {
    label: "nothing armed — what distinguishes four-arms-working from four-arms-broken, and arm (4): every fixture here is legitimate traffic",
    run: () => { const r = runSuite(); console.log(`  -> BASELINE ${r.pass} pass, ${r.fail} fail, exit ${r.status}`); return r; },
  },

  1: {
    label: "(1) THE ARM FL-6's ROW NAMES — the named-UNAVAILABLE refusal removed: exhausted material drives on as an empty success.",
    run: () => withReplaced(INDEX,
      "if (cascade && !cascade.available)",
      "if (false && cascade && !cascade.available)",
      () => report(runSuite(), {
        mustFail: "the no-token fixture's arms in section 7 — the refusal, the named reason, the per-level statement",
        mustNot: "the pure-resolver arms (the resolver still answers honestly; the ENDPOINT stopped saying so)",
      })),
  },

  2: {
    label: "(2) THE DENYLIST NEUTERED — levelState stops asking the published question; publication stops being revocation.",
    run: () => withReplaced(CASCADE,
      "if (PUBLISHED_TOKEN_HASHES.has(await sha256hex(v))) return LEVEL_REVOKED;",
      "if (false) return LEVEL_REVOKED;",
      () => report(runSuite(), {
        mustFail: "section 2's fall-through pair, section 3's per-level statement, section 4's derived-token refusal, and section 7's per-level arm",
        mustNot: "the order arms and the endpoint's resolved-level naming, which spend no revoked value",
      })),
  },

  3: {
    label: "(3) THE PAYER-CONSISTENCY CHECK REMOVED — the record names one payer, the runtime resolves another, and the segment drives anyway.",
    run: () => withReplaced(INDEX,
      "if (cascade?.available && recordedPayer !== cascade.level)",
      "if (false && cascade?.available && recordedPayer !== cascade.level)",
      () => report(runSuite(), {
        mustFail: "section 6's three arms — the 409, its name, and the two facts it must carry",
        mustNot: "section 5 (agreeing record and resolution) and section 7 (no payer resolved at all)",
      })),
  },
};

/* M0-197: the arms' anchors as data for tools/anchordrift.mjs (a no-op otherwise); the baseline arms nothing. */
anchorEach(Object.fromEntries(Object.entries(ARMS).filter(([n]) => n !== "baseline")), (a) => a.run());
mkdirSync(PEN, { recursive: true });   /* moved below the table (M0-197): nothing above uses the pen */

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
for (const n of names) {
  const arm = ARMS[n];
  if (!arm) { console.error(`no such arm: ${n}`); process.exit(2); }
  console.log(`\n================ ARM ${n} ================\n  ${arm.label}`);
  arm.run();
}
rmSync(PEN, { recursive: true, force: true });
console.log("\nall requested arms done; the pen is removed and every restore was verified above.");
