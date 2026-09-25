/* D-220's NEGATIVE CONTROL DRIVER — three arms and the baseline, re-runnable in one step:
 *
 *     node test/versions.control.mjs          # every arm, in order
 *     node test/versions.control.mjs 1        # one arm
 *
 * Copied from `cascade.control.mjs`'s mechanism, whose reasons are below.
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
const PEN = join(MEMBER, ".nc-versions");
const LOG = join(PEN, "run.out");
const SUITE = join(DIR, "versions.test.mjs");
const INDEX = join(MEMBER, "src/index.mjs");
const SUBSESSION = join(MEMBER, "src/subsession.mjs");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 200;

function runSuite() {
  const r = spawnSync("node", [SUITE], { cwd: MEMBER, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  writeFileSync(LOG, out);
  const m = /versions: (\d+) pass, (\d+) fail/.exec(out);
  return { status: r.status, pass: m ? Number(m[1]) : -1, fail: m ? Number(m[2]) : -1, out };
}

/* Arm by EXACT-STRING replacement, snapshotted and restored with both proofs.
   A replacement that matches nothing THROWS — an arm that armed nothing and
   ran green would read as a defence holding. */
function withReplaced(file, from, to, body) {
  if (ANCHOR_DRY) return void anchorPatch(file, from, to, "any");   /* M0-197: read, never armed (includes + replace: >=1 match arms) */
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
    label: "nothing armed — the row that tells three-arms-working from three-arms-broken",
    run: () => { const r = runSuite(); console.log(`  -> BASELINE ${r.pass} pass, ${r.fail} fail, exit ${r.status}`); return r; },
  },

  1: {
    label: "(1) THE ARM THE ROW NAMES — drop the chain read: the collect row never asks op=versionchain.",
    run: () => withReplaced(INDEX,
      'const chain = planeAnswer(await call("versionchain", { address: target, limit: 1000 }), "versionchain");',
      "const chain = { result: null };",
      () => report(runSuite(), {
        mustFail: "B2a ONE DOCUMENT (by name), B2b, B2c, B2e and B3's versionchain count",
        mustNot: "PART A (pure), B0, B1 (the fixture is read off the plane by the suite itself), B2d",
      })),
  },

  2: {
    label: "(2) THE LIAR — the document is keyed by what the five bundles SHARE (their title) instead of the chain's address.",
    run: () => withReplaced(SUBSESSION,
      'const key = chain && typeof chain.address_norm === "string" ? chain.address_norm : "";',
      'const key = chain && typeof chain.address_norm === "string" ? "City Council Calendar" : "";',
      () => report(runSuite(), {
        mustFail: "A1 and B2b (two different documents merged into one), B3b's note",
        mustNot: "B2a's version list (the council calendar's versions are still its own), B0, B1, A3, A4",
      })),
  },

  3: {
    label: "(3) NO DEDUP AT ALL — every citation is its own document, the count D-220 exists to stop.",
    run: () => withReplaced(SUBSESSION,
      'const key = chain && typeof chain.address_norm === "string" ? chain.address_norm : "";',
      'const key = chain && typeof chain.address_norm === "string" ? String(r.citation) : "";',
      () => report(runSuite(), {
        mustFail: "A1, A2, B2a, B2b, B2c (the sixty-documents shape)",
        mustNot: "A3, A4, A5, B0, B1, B2d, B3",
      })),
  },
};

/* M0-197: the arms' anchors as data for tools/anchordrift.mjs (a no-op otherwise); the pen is made after it. */
anchorEach(Object.fromEntries(Object.entries(ARMS).filter(([n]) => n !== "baseline")), (a) => a.run());
mkdirSync(PEN, { recursive: true });

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
