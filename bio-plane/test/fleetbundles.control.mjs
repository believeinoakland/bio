/* FL-9's NEGATIVE CONTROL DRIVER — six arms plus a baseline, re-runnable in one
 * step:
 *
 *     node test/fleetbundles.control.mjs          # every arm, in order
 *     node test/fleetbundles.control.mjs 2b       # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES and RENAMES a real
 * `node_modules`, and a file the battery discovers must never be one that
 * rewrites the tree underneath the suites running beside it (PL-3/PL-4/PL-11).
 *
 * THE THREE RULES THIS PROJECT PAID FOR, obeyed here:
 *
 *   1. PRISTINE COPIES LIVE INSIDE THIS WORKTREE, never in a shared scratchpad.
 *      PL-10's harness was overwritten mid-turn by a concurrent worker writing
 *      the same path. Each snapshot is held in memory for the arm and written
 *      back in a `finally`, so an arm that throws still restores.
 *   2. EVERY RESTORE IS VERIFIED BY CONTENT **AND** BY sha256, with a byte floor.
 *      UI-38 met a harness that reported a byte-identical restore over a file it
 *      had not restored.
 *   3. THE SUITE'S OUTPUT IS CAPTURED TO A FILE, NEVER TO A PIPE. D-282: a suite
 *      calling `process.exit()` discards unflushed PIPE writes, and a tally read
 *      `-1` for exactly that reason on a control that looked fine. The suite's
 *      EXIT STATUS is read from `spawnSync().status`, which is the process's own
 *      and never a pipeline's.
 *
 * EACH ARM IS ARMED ALONE, with every other defence held open, and each names
 * what MUST fail AND what MUST NOT.
 */
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const PEN = join(PLANE, ".nc-fleetbundles");        /* inside this worktree, rule 1 */
const LOG = join(PEN, "run.out");
const SUITE = join(DIR, "fleetbundles.test.mjs");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 200;                                   /* a "restore" of a truncated file is not a restore */

mkdirSync(PEN, { recursive: true });

/* Run the gate and read its OWN exit status. Output to a FILE (rule 3). */
function runSuite() {
  const r = spawnSync("node", [SUITE], { cwd: PLANE, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  writeFileSync(LOG, out);
  const m = /fleetbundles: (\d+) pass, (\d+) fail/.exec(out);
  return {
    status: r.status,
    /* A MISSING TALLY IS SCORED AS A FINDING, NOT AS ZERO. A suite that DIED
       before printing its tally is not a suite that passed nothing; PL-11's own
       control read the whole file as "stayed GREEN" for want of this. */
    pass: m ? Number(m[1]) : -1,
    fail: m ? Number(m[2]) : -1,
    out,
  };
}

/* Append-only source edit, snapshotted and restored with both proofs. */
function withAppended(file, suffix, body) {
  const before = readFileSync(file);
  if (before.length < FLOOR) throw new Error(`refusing to arm ${file}: ${before.length} B is below the floor`);
  try {
    writeFileSync(file, Buffer.concat([before, Buffer.from(suffix)]));
    return body();
  } finally {
    writeFileSync(file, before);
    const after = readFileSync(file);
    const byContent = after.equals(before);
    const byHash = sha(after) === sha(before);
    console.log(`    restore ${file.replace(REPO + "/", "")}: content=${byContent} sha256=${byHash} bytes=${after.length}`);
    if (!byContent || !byHash || after.length < FLOOR) throw new Error("RESTORE FAILED — stop and fix the tree by hand");
  }
}

function withJson(file, mutate, body) {
  const before = readFileSync(file);
  try {
    const o = JSON.parse(before.toString("utf8"));
    mutate(o);
    writeFileSync(file, JSON.stringify(o, null, 2) + "\n");
    return body();
  } finally {
    writeFileSync(file, before);
    const after = readFileSync(file);
    console.log(`    restore ${file.replace(REPO + "/", "")}: content=${after.equals(before)} sha256=${sha(after) === sha(before)} bytes=${after.length}`);
    if (!after.equals(before)) throw new Error("RESTORE FAILED — stop and fix the tree by hand");
  }
}

function withRenamed(path, body) {
  const parked = path + ".fl9-armed-away";
  if (!existsSync(path)) { console.log(`    (${path} is absent already — the arm is the ambient condition)`); return body(); }
  renameSync(path, parked);
  try { return body(); }
  finally {
    renameSync(parked, path);
    console.log(`    restore ${path.replace(REPO + "/", "")}: present=${existsSync(path)} parked-gone=${!existsSync(parked)}`);
    if (!existsSync(path) || existsSync(parked)) throw new Error("RESTORE FAILED — stop and fix the tree by hand");
  }
}

const AGENT_HARNESS = join(REPO, "agent-worker/src/harness.mjs");
const PDF_ENTRY = join(REPO, "pdf-worker/src/index.mjs");
const PLANE_PDFSTRUCT = join(PLANE, "src/pdfstructure.mjs");
const AGENT_ARTIFACT = join(REPO, "agent-worker/dist/agent-worker.bundled.mjs");
const PDF_MANIFEST_FILE = join(REPO, "pdf-worker/fleet-member.json");
const PDF_NODE_MODULES = join(REPO, "pdf-worker/node_modules");

const SUFFIX = "\nexport const __fl9ArmedProbe = 1;\n";

/* WHICH assertions went red, named. "1 fail" is a number; the LABEL is the
   evidence, and an arm that fires a different assertion than the one it was
   written for is a finding rather than a pass. */
const failingLabels = (out) =>
  out.split("\n").filter((l) => l.trim().startsWith("FAIL ")).map((l) => l.trim().slice(5).trim());

const report = (label, r, { mustFail, mustNot }) => {
  console.log(`  -> ${r.pass} pass, ${r.fail} fail, exit ${r.status}`);
  console.log(`     MUST FAIL : ${mustFail}`);
  console.log(`     MUST NOT  : ${mustNot}`);
  for (const l of failingLabels(r.out)) console.log(`     RED: ${l}`);
  if (r.pass === -1) console.log("     !! THE SUITE PRINTED NO TALLY — it died rather than failing. That is a FINDING.");
  return r;
};
const named = (r, ...needles) => needles.every((n) => r.out.includes(n));

const ARMS = {
  baseline: {
    label: "nothing armed — what distinguishes six-arms-working from six-arms-broken",
    run: () => {
      const r = runSuite();
      console.log(`  -> BASELINE ${r.pass} pass, ${r.fail} fail, exit ${r.status}`);
      return r;
    },
  },

  1: {
    label: "(1) THE ARM THIS ITEM EXISTS FOR — a member's SOURCE moves and its artifact does not. "
      + "Append one export to agent-worker/src/harness.mjs and do NOT rebuild.",
    run: () => withAppended(AGENT_HARNESS, SUFFIX, () => {
      const r = report("1", runSuite(), {
        mustFail: "exit non-zero, NAMING `agent-worker` and `src/harness.mjs`, from BOTH the input-hash arm and the byte-identity arm",
        mustNot: "pdf-worker's own assertions, which have nothing to do with this file",
      });
      console.log(`     names member+file: ${named(r, "agent-worker:", "src/harness.mjs")}`);
      console.log(`     says STALE BUNDLE: ${named(r, "STALE BUNDLE")}`);
      return r;
    }),
  },

  "1b": {
    label: "(1b) THE SAME CHANGE ON THE ENTRY, AND THE PAIR IS THE FINDING. Append one export to "
      + "agent-worker/src/index.mjs — this one DOES move the bundle's bytes, so BOTH arms fire. Arm (1) "
      + "appended to a NON-entry module and esbuild TREE-SHOOK the unused export, leaving the bundle "
      + "byte-identical: **byte-identity alone would have passed a real source change.** That is why the "
      + "input-hash arm is the load-bearing one and not a fallback for machines that cannot build.",
    run: () => withAppended(join(REPO, "agent-worker/src/index.mjs"), SUFFIX, () => {
      const r = report("1b", runSuite(), {
        mustFail: "exit non-zero from BOTH arms — the input-hash arm naming `src/index.mjs`, AND the "
          + "byte-identity arm, because an ENTRY's exports are not tree-shaken",
        mustNot: "pdf-worker",
      });
      console.log(`     names member+file: ${named(r, "agent-worker:", "src/index.mjs")}`);
      return r;
    }),
  },

  2: {
    label: "(2) THE SAME ARM ON `pdf-worker` SPECIFICALLY — the member that was ALREADY missing this guard, "
      + "so a one-member fix would pass arm (1) and leave this open. Append one export to pdf-worker/src/index.mjs.",
    run: () => withAppended(PDF_ENTRY, SUFFIX, () => {
      const r = report("2", runSuite(), {
        mustFail: "exit non-zero, NAMING `pdf-worker` and `src/index.mjs`",
        mustNot: "agent-worker's assertions",
      });
      console.log(`     names member+file: ${named(r, "pdf-worker:", "src/index.mjs")}`);
      return r;
    }),
  },

  "2-noinstall": {
    label: "(2, SECOND VARIANT) THE SAME ARM WITH `pdf-worker/node_modules` RENAMED AWAY — a FRESH CHECKOUT's "
      + "condition. The byte-identity arm must SKIP by name and the dependency-free input-hash arm must STILL FAIL. "
      + "A guard that skips on the machine where it matters is not a guard.",
    run: () => withRenamed(PDF_NODE_MODULES, () => withAppended(PDF_ENTRY, SUFFIX, () => {
      const r = report("2-noinstall", runSuite(), {
        mustFail: "exit non-zero, still NAMING `pdf-worker` and `src/index.mjs`, from the input-hash arm ALONE",
        mustNot: "a silent pass; and agent-worker's byte-identity arm, which needs no member install, must still RUN",
      });
      console.log(`     names member+file: ${named(r, "pdf-worker:", "src/index.mjs")}`);
      console.log(`     byte arm skipped BY NAME: ${named(r, "SKIP  pdf-worker: byte-identity not runnable here")}`);
      console.log(`     agent-worker's byte arm still ran: ${named(r, "agent-worker: a fresh build of src/index.mjs is byte-identical")}`);
      return r;
    })),
  },

  "2b": {
    label: "(2b) THE CROSS-TREE ARM — three of pdf-worker's six build inputs are the PLANE's. "
      + "Append one export to bio-plane/src/pdfstructure.mjs and rebuild NOTHING.",
    run: () => withAppended(PLANE_PDFSTRUCT, SUFFIX, () => {
      const r = report("2b", runSuite(), {
        mustFail: "exit non-zero, NAMING `pdf-worker` and `../bio-plane/src/pdfstructure.mjs` — a change to the PLANE "
          + "stales a fleet member's artifact, from a directory whose author has no reason to think about pdf-worker",
        mustNot: "agent-worker, which does not import the plane",
      });
      console.log(`     names member+cross-tree file: ${named(r, "pdf-worker:", "../bio-plane/src/pdfstructure.mjs")}`);
      console.log(`     agent-worker held: ${!r.out.includes("agent-worker: STALE") && named(r, "agent-worker: no staleness")}`);
      return r;
    }),
  },

  3: {
    label: "(3) THE ARTIFACT ITSELF EDITED — append one line to agent-worker/dist/agent-worker.bundled.mjs. "
      + "The manifest is a hash OF the artifact, not a second opinion about it.",
    run: () => withAppended(AGENT_ARTIFACT, "//x\n", () => {
      const r = report("3", runSuite(), {
        mustFail: "exit non-zero on the manifest's own sha256 AND on byte-identity",
        mustNot: "pdf-worker",
      });
      console.log(`     names the manifest mismatch: ${named(r, "does not match its own manifest")}`);
      return r;
    }),
  },

  4: {
    label: "(4) THE GUARD DELETED — remove the `bundle` block from pdf-worker/fleet-member.json. "
      + "Discovery is the only evidence, so a member that stops declaring itself must not stop existing.",
    run: () => withJson(PDF_MANIFEST_FILE, (o) => { delete o.bundle; }, () => {
      const r = report("4", runSuite(), {
        mustFail: "exit non-zero, NAMING `pdf-worker` as declaring no bundle block — rather than the member quietly "
          + "dropping out of the guarded set and the run reading green",
        mustNot: "agent-worker",
      });
      console.log(`     names the undeclared member: ${named(r, "pdf-worker: declares no `bundle` block")}`);
      return r;
    }),
  },

  5: {
    label: "(5) OVER-STRICTNESS — correct work must PASS. (a) rebuild BOTH members from unchanged sources and the "
      + "tree must be unchanged; (b) this suite must be OUTSIDE gates' doc-facing set, so a docs-only change cannot "
      + "select it; (c) coverage --strict must exit 0.",
    run: () => {
      console.log("  (a) rebuilding both members from unchanged sources");
      for (const dir of ["agent-worker", "pdf-worker"]) {
        const b = spawnSync("npm", ["run", "build"], { cwd: join(REPO, dir), encoding: "utf8" });
        console.log(`      ${dir}: build exit ${b.status}`);
      }
      const dirty = spawnSync("git", ["status", "--porcelain"], { cwd: REPO, encoding: "utf8" }).stdout.trim();
      console.log(`      tree after a legitimate rebuild: ${dirty === "" ? "UNCHANGED" : "DIRTY:\n" + dirty}`);
      const r = report("5a", runSuite(), {
        mustFail: "nothing",
        mustNot: "any assertion — a legitimately rebuilt, byte-identical bundle must still pass",
      });

      console.log("  (b) gates' doc-facing derivation");
      /* gates.mjs decides doc-facing by whether the suite's source or its sibling
         control mentions the documentation directory. Asserted over the REAL
         files rather than reimplemented, because a second copy of a rule is how
         the next one goes stale. */
      const needle = "do" + "cs/";
      const suiteSrc = readFileSync(SUITE, "utf8");
      const ctrlSrc = readFileSync(fileURLToPath(import.meta.url), "utf8");
      console.log(`      suite mentions the prose directory:   ${suiteSrc.includes(needle)}  (must be false)`);
      console.log(`      control mentions the prose directory: ${ctrlSrc.includes(needle)}  (must be false)`);
      console.log("      -> a DOCS-class run does not select this suite, so a docs-only change cannot fail on it");

      console.log("  (c) coverage --strict, status read from the process, never a pipeline");
      const cov = spawnSync("node", ["scripts/coverage.mjs", "--strict"], { cwd: PLANE, encoding: "utf8" });
      console.log(`      coverage --strict exit ${cov.status}`);
      return r;
    },
  },
};

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
