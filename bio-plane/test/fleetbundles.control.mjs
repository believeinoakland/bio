/* FL-9's, FL-10's, FLEET #4's, M0-188's AND M0-152's NEGATIVE CONTROL DRIVER — eighteen arms
 * plus a baseline, re-runnable in one step:
 *
 * TALLY MOVED 2026-09-25 at c22-batch29's union of M0-188 (on main) and M0-152, COUNTED off the table
 * rather than added up: `1 1b 2 2-noinstall 2b 3 4 5 5b-comment 5b-code 6 6b 7 8 9 10 10b 10c` is EIGHTEEN.
 * M0-188's *"fifteen"* was itself one short — it named arm 9's missed append and then added its three to
 * twelve rather than thirteen, so main's table held SIXTEEN — and M0-152 appended `5b-comment` and
 * `5b-code` without moving the head (its side still read *"twelve"*). The third decay by APPEND.
 *
 * TALLY MOVED 2026-09-24 (M0-188) from *"twelve arms plus a baseline"*, which was
 * already stale by one when it was corrected: FLEET #4 appended arm 9 on 2026-09-23
 * without moving the head. M0-188 appends 10, 10b and 10c, so twelve -> fifteen, and
 * the drift is named rather than quietly absorbed — the same treatment M0-29 gave it
 * below, and the second time this number has decayed by APPEND.
 *
 * TALLY CORRECTED 2026-09-14 (M0-29, D-343). This line read *"six arms plus a
 * baseline"* and the driver announces THIRTEEN. THIS ONE DECAYED IN TWO STEPS
 * AND ONLY THE SECOND IS THE ONE THE RECORD ALREADY KNEW ABOUT:
 *
 *   - It was ALREADY FALSE IN ITS OWN LANDING COMMIT `d83695b` (FL-9), where the
 *     table held EIGHT arms plus a baseline — the variants `1b`, `2-noinstall`
 *     and `2b` were written during the item, after the head sentence, and the
 *     six the sentence names are the six the item set out with.
 *   - `3607b3b` (FL-10) then APPENDED `6`, `6b`, `7` and `8` — its own claim says
 *     so in those words — taking the table to twelve arms plus a baseline.
 *
 * The count now names BOTH items, because a driver whose head names one item and
 * whose arms serve two is the state that let the number drift unread. THE ARMS
 * ARE REAL: every one has its own anchor, subject and declared must-fail /
 * must-not pair, so the DECLARATION is corrected and no arm is restored or
 * removed (`casepin.control.mjs` is D-333's worked precedent).
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
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, rmSync, lstatSync, symlinkSync, unlinkSync } from "node:fs";
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

/* ARM 5(b)'s QUESTION — "is fleetbundles doc-facing?" — ANSWERED BY THE GATE, never restated here (M0-152).
   CORRECTED 2026-09-25, never exempted: until M0-152 this arm decided it itself, `suiteSrc.includes(needle)` over the
   suite and this driver read WHOLE, comments included. That restated the rule as it stood before M0-143, which made
   the gate read every file as CODE with its comments blanked (`walkfloor.mjs` `stripComments`) and follow the tools a
   suite names in code — so the arm and the gate disagreed the moment either file grew a comment naming the prose
   directory, and neither ever saw the other's edge rule. A second copy of a rule is how the next one goes stale, so
   there is none: the verdict is whether `gates.mjs --explain`'s own derived line lists this suite. The whole-file
   read is still computed, printed beside the verdict for CONTRAST only (this arm's negative control reads the two
   disagreeing). `--explain` prints the derivation in every class since M0-152; a run that prints none is UNDETERMINED
   (`null`), never "not doc-facing". The gate is named as two arguments so this driver's CODE never spells the tool's
   path — a `tools/<name>.mjs` literal in code would itself make the suite doc-facing through the gate's edge rule. */
const GATES = join(REPO, "tools", "gates.mjs");
function docFacingVerdict() {
  const g = spawnSync("node", [GATES, "--explain"], { cwd: REPO, encoding: "utf8", env: { ...process.env, BIO_GATE_RESULTS: "off" } });
  const out = (g.stdout || "") + (g.stderr || "");
  writeFileSync(join(PEN, "explain.out"), out);
  const cls = (/gates: change class (\w+)/.exec(out) || [, "UNREAD"])[1];
  const m = /doc-facing suites derived fresh[^\n]*?plane \[([^\]]*)\]/.exec(out);
  const docFacing = m ? m[1].split(", ").includes("fleetbundles.test.mjs") : null;
  const needle = "do" + "cs/";
  const wholeRead = readFileSync(SUITE, "utf8").includes(needle) || readFileSync(fileURLToPath(import.meta.url), "utf8").includes(needle);
  return { status: g.status, cls, docFacing, wholeRead };
}

const ARMS = {
  baseline: {
    /* The count in this label is the SAME CLAIM as the head's tally and was stale the same way
       (`six` against a table of twelve); corrected 2026-09-14 by M0-29 with the head, because
       correcting one and leaving the other is the half-fix that makes the next reader believe
       the wrong half. */
    label: "nothing armed — what distinguishes eighteen-arms-working from eighteen-arms-broken",
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

      console.log("  (b) gates' doc-facing derivation, READ OFF `gates.mjs --explain`");
      const b = docFacingVerdict();
      console.log(`      gates.mjs --explain: class ${b.cls}; fleetbundles.test.mjs doc-facing: ${b.docFacing}  (must be false)`);
      console.log(`      superseded whole-file read, printed for CONTRAST and never the verdict: ${b.wholeRead}`);
      console.log(b.docFacing === false
        ? "      -> a DOCS-class run does not select this suite, so a docs-only change cannot fail on it"
        : "      !! the gate counts this suite doc-facing, or printed no derivation — a FINDING, not a pass");

      console.log("  (c) coverage --strict, status read from the process, never a pipeline");
      const cov = spawnSync("node", ["scripts/coverage.mjs", "--strict"], { cwd: PLANE, encoding: "utf8" });
      console.log(`      coverage --strict exit ${cov.status}`);
      return r;
    },
  },
};

/* ---- M0-152's ARMS, beside arm 5 whose (b) they control. No other arm is edited. Each arms THE SUITE ALONE, append-only,
 * restored with both proofs, and reads arm 5(b)'s own `docFacingVerdict` — the gate's `--explain`, not a restatement. */
const DOCS_WORD = "do" + "cs/";                       /* spelled in two pieces so THIS driver's code never names it */

ARMS["5b-comment"] = {
  label: "(5b-comment) M0-152's NEGATIVE CONTROL — append a COMMENT naming the prose directory to the suite. The gate "
    + "blanks comments (M0-143), so it must still say NOT doc-facing; the superseded whole-file read says the opposite.",
  run: () => withAppended(SUITE, `\n/* see ${DOCS_WORD}architecture/BIO_System_Design.md */\n`, () => {
    const b = docFacingVerdict();
    console.log(`  -> class ${b.cls} · gate says doc-facing: ${b.docFacing} · superseded whole-file read: ${b.wholeRead}`);
    console.log("     MUST : the gate's verdict stays false (a comment reads nothing); the whole-file read turns true — they DISAGREE");
    console.log("     MUST NOT : the gate's verdict turn true, or come back null (no derivation printed in a non-DOCS class)");
    console.log(`     held: ${b.docFacing === false && b.wholeRead === true}`);
    return b;
  }),
};

ARMS["5b-code"] = {
  label: "(5b-code) THE OVER-LENIENCY ARM — append CODE whose string names the prose directory to the suite. A verdict "
    + "that is false whatever the tree says would pass 5b-comment for free; this one the gate must turn TRUE.",
  run: () => withAppended(SUITE, `\nexport const __m0152ArmedProbe = "${DOCS_WORD}";\n`, () => {
    const b = docFacingVerdict();
    console.log(`  -> class ${b.cls} · gate says doc-facing: ${b.docFacing} · superseded whole-file read: ${b.wholeRead}`);
    console.log("     MUST : the gate's verdict turns true — a string path reads prose");
    console.log("     MUST NOT : stay false or come back null");
    console.log(`     held: ${b.docFacing === true}`);
    return b;
  }),
};

/* ---- FL-10's ARMS, APPENDED (D-298: the plane's own bundle gets the guard).
 * No existing arm is edited. The plane's sources are armed the way arm 2b
 * already arms `src/pdfstructure.mjs` — transiently, restored with both
 * proofs — and NEVER `store.mjs` or `schema.mjs`, which is FL-10's own claim
 * rule made physical here. */
const PLANE_ENTRY = join(PLANE, "src/index.mjs");
const SIGNPAGE_HTML = join(PLANE, "src/sign-release.html");

ARMS["6"] = {
  label: "(6) FL-10's OWN ARM — a PLANE source moves and the committed plane bundle does not. Append one export "
    + "to bio-plane/src/pdfstructure.mjs (a NON-ENTRY module, so this is ALSO the tree-shake arm: esbuild "
    + "tree-shakes the unused export and byte-identity alone MISSES it — the input-hash arm must fail anyway). "
    + "The same file is one of pdf-worker's cross-tree inputs, so BOTH artifacts must go stale by name.",
  run: () => withAppended(PLANE_PDFSTRUCT, SUFFIX, () => {
    const r = report("6", runSuite(), {
      mustFail: "exit non-zero — bio-plane's input-hash arm NAMING `src/pdfstructure.mjs` AND pdf-worker's "
        + "cross-tree arm NAMING `../bio-plane/src/pdfstructure.mjs`; the plane BYTE arm alone would stay "
        + "green (tree-shaken), which is exactly why the input-hash arm is load-bearing",
      mustNot: "agent-worker, which imports nothing from the plane",
    });
    console.log(`     names bio-plane+file: ${named(r, "bio-plane:", "src/pdfstructure.mjs")}`);
    console.log(`     says STALE BUNDLE: ${named(r, "STALE BUNDLE")}`);
    console.log(`     pdf-worker cross-tree fired too: ${named(r, "pdf-worker:", "../bio-plane/src/pdfstructure.mjs")}`);
    console.log(`     agent-worker held: ${named(r, "agent-worker: no staleness")}`);
    return r;
  }),
};

ARMS["6b"] = {
  label: "(6b) THE SAME CHANGE ON THE PLANE'S ENTRY — src/index.mjs, whose exports are NOT tree-shaken, "
    + "so the byte-identity arm AND the input-hash arm must BOTH fire.",
  run: () => withAppended(PLANE_ENTRY, SUFFIX, () => {
    const r = report("6b", runSuite(), {
      mustFail: "exit non-zero from BOTH plane arms — input-hash naming `src/index.mjs`, and byte-identity, "
        + "because an ENTRY's exports survive the bundle",
      mustNot: "either fleet member's own assertions",
    });
    console.log(`     names bio-plane+file: ${named(r, "bio-plane:", "src/index.mjs")}`);
    return r;
  }),
};

ARMS["7"] = {
  label: "(7) THE GENERATED-INPUT LOOP — bio-plane/src/sign-release.html changes and src/signpage.mjs was never "
    + "re-rendered. Every input hash stays TRUE (signpage.mjs itself did not move), so only the render "
    + "comparison can see it. Append one HTML comment to the page.",
  run: () => withAppended(SIGNPAGE_HTML, "\n<!-- fl10 armed probe -->\n", () => {
    const r = report("7", runSuite(), {
      mustFail: "exit non-zero on the ONE assertion comparing committed src/signpage.mjs against the render "
        + "of bio-plane/src/sign-release.html — naming the stale render",
      mustNot: "any input-hash or byte-identity arm, plane or member: no hashed input moved",
    });
    console.log(`     the render assertion fired: ${named(r, "committed src/signpage.mjs IS the render")}`);
    return r;
  }),
};

ARMS["8"] = {
  label: "(8) OVER-STRICTNESS, PLANE HALF — a legitimate `npm run build` of the UNCHANGED plane must leave "
    + "the tree byte-identical and the suite green. RUN AFTER THE COMMIT, like arm 5: the tree-unchanged "
    + "half is only a statement about a clean tree.",
  run: () => {
    console.log("  (a) rebuilding the plane from unchanged sources");
    const b = spawnSync("npm", ["run", "build"], { cwd: PLANE, encoding: "utf8" });
    console.log(`      bio-plane: build exit ${b.status}`);
    const dirty = spawnSync("git", ["status", "--porcelain"], { cwd: REPO, encoding: "utf8" }).stdout.trim();
    console.log(`      tree after a legitimate rebuild: ${dirty === "" ? "UNCHANGED" : "DIRTY:\n" + dirty}`);
    return report("8", runSuite(), {
      mustFail: "nothing",
      mustNot: "any assertion — a legitimately rebuilt, byte-identical plane bundle must still pass",
    });
  },
};

/* ---- ARM 9, APPENDED 2026-09-23 (FLEET #4, on BOB #29's diagnosis). No existing arm is edited. ---- */
const FLEET_BUNDLE = join(PLANE, "scripts/fleet-bundle.mjs");
const FLAG_LINE = "    preserveSymlinks: true,";

/* One exact line removed, restored with both proofs. The line must occur EXACTLY ONCE: an arm that
   removes the wrong occurrence, or none, would be a control that moved nothing. */
function withLineRemoved(file, line, body) {
  const before = readFileSync(file);
  const text = before.toString("utf8");
  const hits = text.split("\n").filter((l) => l.startsWith(line)).length;
  if (hits !== 1) throw new Error(`refusing to arm ${file}: the line occurs ${hits} time(s), not once`);
  try {
    writeFileSync(file, text.split("\n").filter((l) => !l.startsWith(line)).join("\n"));
    return body();
  } finally {
    writeFileSync(file, before);
    const after = readFileSync(file);
    console.log(`    restore ${file.replace(REPO + "/", "")}: content=${after.equals(before)} sha256=${sha(after) === sha(before)} bytes=${after.length}`);
    if (!after.equals(before)) throw new Error("RESTORE FAILED — stop and fix the tree by hand");
  }
}

/* The defect's CONDITION: pdf-worker's `node_modules` reached through a symlink. If it is one already
   (a worktree sharing another checkout's install), that is the ambient condition. If it is a real
   directory, it is parked beside itself and a symlink put in its place, so the bytes esbuild reads are
   the same bytes, only the PATH to them differs, which is the one variable the flag governs. */
function withSymlinkedInstall(path, body) {
  if (!existsSync(path)) throw new Error(`refusing to arm: ${path} is absent, and this arm needs an install to build`);
  if (lstatSync(path).isSymbolicLink()) { console.log(`    (${path.replace(REPO + "/", "")} is a symlink already — the ambient condition)`); return body(); }
  const parked = path + ".fl13-real";
  renameSync(path, parked);
  symlinkSync(parked, path, "dir");
  try { return body(); }
  finally {
    unlinkSync(path);
    renameSync(parked, path);
    const ok = existsSync(path) && !lstatSync(path).isSymbolicLink() && !existsSync(parked);
    console.log(`    restore ${path.replace(REPO + "/", "")}: real-directory=${ok}`);
    if (!ok) throw new Error("RESTORE FAILED — stop and fix the tree by hand");
  }
}

ARMS["9"] = {
  label: "(9) THE INSTALL LAYOUT — drop `preserveSymlinks` from the recipe and build pdf-worker through a "
    + "SYMLINKED node_modules. esbuild then names unpdf by its RESOLVED absolute-ish path, and the committed "
    + "bundle (built from a real install) no longer matches identical source.",
  run: () => withSymlinkedInstall(PDF_NODE_MODULES, () => withLineRemoved(FLEET_BUNDLE, FLAG_LINE, () => {
    const r = report("9", runSuite(), {
      mustFail: "exit non-zero: all four recipe assertions (`… preserves symlinks …`), AND pdf-worker's "
        + "byte-identity, manifest-sha and comment-only assertions, the member that vendors from node_modules",
      mustNot: "agent-worker's, ocr-worker's or bio-plane's byte-identity: none vendors from node_modules",
    });
    console.log(`     recipe assertion fired: ${named(r, "FAIL  pdf-worker: its build recipe preserves symlinks")}`);
    console.log(`     pdf-worker byte arm fired: ${named(r, "FAIL  pdf-worker: a fresh build of src/index.mjs is byte-identical")}`);
    console.log(`     agent-worker byte arm held: ${!r.out.includes("FAIL  agent-worker: a fresh build")}`);
    return r;
  })),
};

/* ---- ARMS 10, 10b, 10c, APPENDED 2026-09-24 (M0-188). No existing arm is edited. ----
   The subject is the REMEDY a staleness finding hands its reader. Until M0-188 all twelve
   said `npm run build` in ONE member's directory; one `bio-plane/src/` edit stales THREE
   artifacts (M0-178, measured), so a worker who obeyed rebuilt one and met the next at the
   next gate. The arms are (10) the row's own declared control, plus TWO over-strictness arms,
   because a matcher that only ever goes red is a matcher nobody has seen be right. */

/* Exactly-once replacement. An arm that matched zero times or twice is a finding, not a pass
   (WORKER.md: "arms that NEVER ARMED"), so the count is checked BEFORE the tree is touched. */
function withReplacedOnce(file, from, to, body) {
  const before = readFileSync(file);
  if (before.length < FLOOR) throw new Error(`refusing to arm ${file}: ${before.length} B is below the floor`);
  const text = before.toString("utf8");
  const hits = text.split(from).length - 1;
  if (hits !== 1) throw new Error(`refusing to arm ${file}: the anchor occurs ${hits} time(s), not once`);
  try {
    writeFileSync(file, text.replace(from, to));
    return body();
  } finally {
    writeFileSync(file, before);
    const after = readFileSync(file);
    console.log(`    restore ${file.replace(REPO + "/", "")}: content=${after.equals(before)} sha256=${sha(after) === sha(before)} bytes=${after.length}`);
    if (!after.equals(before) || sha(after) !== sha(before) || after.length < FLOOR)
      throw new Error("RESTORE FAILED — stop and fix the tree by hand");
  }
}

/* The ONE site, anchored on the line ABOVE it too: the remedy sentence itself occurs twice in
   the file (here and in `verifyFresh`), and an anchor that matches both would arm two sites. */
const REMEDY_HEAD = "        + `(source is now sha256 ${liveSha}, the bundle was built from ${inp.sha256}). `\n        + ";
const REMEDY_NOW = "`Run \\`node tools/bundles.mjs\\`, which rebuilds every bundle this change staled, and commit the artifacts with the change.`);";
const REMEDY_OLD = "`Run \\`npm run build\\` in ${member.dir}/ and commit the artifact with the change.`);";

ARMS["10"] = {
  label: "(10) M0-188's OWN ARM — restore ONE site's pre-M0-188 sentence, the one-bundle remedy, "
    + "in the (b) input-hash finding. Nothing else changes: the finding's DIAGNOSIS half is untouched.",
  run: () => withReplacedOnce(FLEET_BUNDLE, REMEDY_HEAD + REMEDY_NOW, REMEDY_HEAD + REMEDY_OLD, () => {
    const r = report("10", runSuite(), {
      mustFail: "exit non-zero on FOUR (j) assertions: the behavioural none-names-`npm run build` arm, "
        + "the behavioural at-least-four-name-`node tools/bundles.mjs` arm (3, not >= 4), the TOTAL over "
        + "the guard's source (1, not 0), and the TOTAL's corpus floor (11, not >= 12)",
      mustNot: "any DIAGNOSIS assertion — (b) STALE BUNDLE, (d) the manifest mismatch, (g)/(h)/(i) the "
        + "upload-part arms, or any byte-identity arm: the remedy is the only thing that moved",
    });
    /* PROBED THROUGH `failingLabels`, NOT through a `FAIL  `-prefixed `.includes`, and the
       difference is A4's rule rather than a style: an anchor is a literal a driver searches
       for, and `"FAIL  (b) and says it is a STALE BUNDLE"` exists in NO candidate subject —
       the `FAIL  ` prefix is a runtime marking, not text in the suite. Written that way it
       carried code punctuation, so `m025-arm-anchor-witness.test.mjs` harvested it and A4
       fired, correctly, at the D-276 class: a quote that can never match. Each literal below
       is the suite's own label text and occurs EXACTLY ONCE in `fleetbundles.test.mjs`, so
       the quote dies loudly if a label is ever changed in place. */
    const red = failingLabels(r.out);
    const fired = (prefix) => red.some((l) => l.startsWith(prefix));
    console.log(`     the TOTAL arm fired by name: ${fired("(j) TOTAL: no finding in scripts/fleet-bundle.mjs names the one-bundle command")}`);
    console.log(`     the behavioural arm fired by name: ${fired("(j) NONE of them names the one-bundle command")}`);
    console.log(`     (b) STALE BUNDLE held: ${!fired("(b) and says it is a STALE BUNDLE")}`);
    return r;
  }),
};

ARMS["10b"] = {
  label: "(10b) OVER-STRICTNESS, A SPELLING THE ARM WAS NOT WRITTEN FOR — the same site reworded "
    + "around the SAME command. Correct work in an unanticipated spelling must PASS.",
  run: () => withReplacedOnce(FLEET_BUNDLE, REMEDY_HEAD + REMEDY_NOW,
    REMEDY_HEAD + "`Rebuild with \\`node tools/bundles.mjs\\` \\u2014 it rebuilds every bundle this change staled \\u2014 and commit the artifacts.`);", () => {
    const r = report("10b", runSuite(), {
      mustFail: "nothing",
      mustNot: "any (j) assertion: the command is the same, only the sentence around it differs",
    });
    console.log(`     no (j) assertion fired: ${failingLabels(r.out).filter((l) => l.startsWith("(j) ")).length === 0}`);
    return r;
  }),
};

ARMS["10c"] = {
  label: "(10c) OVER-STRICTNESS, AND IT ASSERTS THE MATCHER'S DECLARED BLIND SPOT RATHER THAN "
    + "PROMISING IT — a plain COMMENT in the guard naming `npm run build` unescaped must NOT be read "
    + "as a remedy. The suite's stated reach is the backtick-escaped spelling inside a template "
    + "literal; a comment writes the command unescaped and is not a finding's remedy.",
  run: () => withAppended(FLEET_BUNDLE, "\n/* M0-188 over-strictness probe: a member is built by npm run build in its own directory. */\n", () => {
    const r = report("10c", runSuite(), {
      mustFail: "nothing",
      mustNot: "the (j) TOTAL arm — a comment is prose about how a member is built, not a remedy handed to a reader",
    });
    console.log(`     no (j) assertion fired: ${failingLabels(r.out).filter((l) => l.startsWith("(j) ")).length === 0}`);
    return r;
  }),
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
