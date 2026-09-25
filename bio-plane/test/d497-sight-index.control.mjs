/* D-497's NEGATIVE CONTROL DRIVER — the directory's SIGHT INDEX, armed one arm at a time.
 *
 * COMMITTED ON PURPOSE (M0-18's precedent): a control that re-runs in one step is one the next
 * session can re-run, and this file's arms are the only thing that says the directory's candidate read
 * is bounded IN SQL over a row source SIGHT ITSELF READS, rather than merely looking like it.
 *
 * WHY IT IS A FILE OF ITS OWN AND NOT ARMS IN `d479-bounds.control.mjs`. D-479's arms measure what the
 * directory PUBLISHES — the cap, the over-fetch, `truncated`, the cut. These measure what it READS.
 * The two are independent, and this item is the receipt for that: the candidate read changed from a
 * keyset walk with a JS filter into one statement, and EVERY live arm in `bounds.test.mjs` stayed green
 * through it, byte for byte. An answer cannot tell you which of the two shapes produced it, which is
 * exactly why arm 1 below has to fail at a SOURCE arm and why that arm had to be written.
 *
 * WHAT IT DOES. For each arm: assert the anchor occurs EXACTLY ONCE, patch it, run the suites the
 * arm DECLARES, restore by `cp` from a UNIQUELY-NAMED per-arm pristine copy, and verify the restore
 * by sha256 AND by `cmp`, with the byte count printed and floored. A BASELINE ROW RUNS FIRST — the
 * receipt this repository has paid for twice, where every arm reported the same wrong figure and only
 * a baseline could tell six-arms-broken from six-arms-working.
 *
 * Run: node test/d497-sight-index.control.mjs   (from bio-plane/)
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../scripts/anchortable.mjs";

const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const FLOOR_BYTES = 3_000_000;   /* store.mjs is ~3.2 MB; a restore from a truncated copy is the
                                    failure a byte count with no floor cannot see. */

const suite = (name) => {
  let out = "";
  try {
    out = execFileSync(process.execPath, [`test/${name}.test.mjs`],
      { cwd: fileURLToPath(new URL("..", import.meta.url)), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 64 * 1024 * 1024 });
  } catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  /* The suite's OWN tally line, read from its own output — never a wrapper's exit status, and never
     through a pipe. A run with no tally line DID NOT FINISH and is reported as -1, never as 0. */
  /* `[\\w-]+` AND NOT `\\w+`, CORRECTED 2026-09-24 FROM THIS DRIVER'S OWN FIRST RUN, where it is a finding
     about the INSTRUMENT and not the subject. `d479-bounds.control.mjs`, which this file was written from,
     runs `bounds`, `derivation-bounds` and `meaning-bounds` — all three print the first form — so its second
     pattern was never exercised. This driver adds `project-discoverable`, whose foot reads
     `project-discoverable: 156 passed, 0 failed`; `\\w+` stops at the hyphen, the match failed, and the tally
     came back -1/-1 for the BASELINE and for every arm. That is the harness reporting a run it could not
     read, which the -1 convention exists to make visible — and the BASELINE row is what made it visible on
     the first line rather than after four arms of arithmetic. */
  const m = /^(\d+) pass(?:ed)?,? (\d+) fail/mi.exec(out) || /^([\w-]+): (\d+) passed, (\d+) failed/mi.exec(out);
  const tally = m ? (m.length === 4 ? [Number(m[2]), Number(m[3])] : [Number(m[1]), Number(m[2])]) : [-1, -1];
  const named = [...out.matchAll(/^ {2}FAIL {2}(.{0,150})/gm)].map((x) => x[1].trim());
  return { tally, named };
};

const ARMS = [
  { id: "1-restore-the-js-filter-over-an-unbounded-scan",
    recorded: "RUN 2026-09-24, AS DECLARED AND WIDER, and the width is the arm telling me something true. bounds 205/2 — the two D-497 source arms by name, and every LIVE arm GREEN, which is the finding this arm exists to establish: a walk and a statement answer identically, so no instrument reading an ANSWER can tell them apart. derivation-bounds 66/6 — `CENSUS IS A CEILING` and the two roster arms as declared, plus BOTH `SET 2` arms, which I did not predict: with the LIMIT gone the method publishes a bound AND scans unbounded, so it joins the set the census count is blind to by construction, and that set is pinned by name. (`d479-bounds.control.mjs` arm 1 recorded the same surprise in August’s words; it is a property of the roster, not of this patch.)", suites: ["bounds", "derivation-bounds", "project-discoverable"],
    declared: "THE ROW'S OWN ARM, and it restores the state D-479 left: the candidates read UNBOUNDED and the "
            + "sight rule applied in JS afterwards. `bounds` FAILS at `op=projectdirectory: THE CANDIDATE READ IS "
            + "ONE BOUNDED STATEMENT (D-497)` and at `\u2026 BOTH halves of EXISTENCE are ROWS (D-497)`, each by name. "
            + "`derivation-bounds` FAILS at `CENSUS IS A CEILING` with the census back at 118, and at the two "
            + "roster arms, which name `projectDirectory:projects` returning to what they cannot grade. THE LIVE "
            + "ARMS MUST STAY GREEN \u2014 the bite, the whole, the over-ask, the hidden project, the owner's empty "
            + "directory \u2014 and that is the FINDING rather than a gap: a walk and a statement answer identically, "
            + "so nothing that reads an ANSWER can tell them apart, and a source arm is owed.",
    from: "    const projects = this.#rows(\n"
        + "      `SELECT b.bundle_id AS id, b.title\n"
        + "         FROM bundles b JOIN project_sight s ON s.project_id = b.bundle_id\n"
        + "        WHERE b.object_type = 'project' AND s.setting = 'discoverable' AND NOT (${gate.sql})\n"
        + "        ORDER BY b.bundle_id\n"
        + "        LIMIT ?`, ...gate.args, cap + 1)\n"
        + "      .map((r) => ({ id: r.id, name: r.title ?? null, request: null }));",
    to:   "    const projects = [];\n"
        + "    for (const r of this.#rows(\n"
        + "      `SELECT bundle_id AS id, title FROM bundles WHERE object_type = 'project' ORDER BY bundle_id`)) {\n"
        + "      if (this.#sight(r.id, viewer) !== Store.SIGHT_EXISTENCE) continue;\n"
        + "      projects.push({ id: r.id, name: r.title ?? null, request: null });\n"
        + "      if (projects.length > cap) break;\n"
        + "    }" },

  { id: "2-the-predicate-stops-reading-the-index",
    recorded: "RUN 2026-09-24, EXACTLY AS DECLARED and in an asymmetry that is the whole point: bounds 206/1 — the structural pin alone, by name — while project-discoverable stayed at its 156/0 baseline, green, every behavioural arm untouched. Two readers of one rule agreed for free, and only a pin that reads the SOURCE could see that one of them had become a copy.",
    suites: ["bounds", "project-discoverable"],
    declared: "THE SECOND COPY, ARMED. `#visibilityOf` goes back to computing the setting from the ACT LOG while "
            + "the directory goes on joining the index. The two AGREE \u2014 the index is derived from that same log \u2014 "
            + "so NOTHING BEHAVIOURAL FAILS: `project-discoverable` stays at its baseline, green. `bounds` FAILS at "
            + "``#visibilityOf` READS the sight index rather than the act log (D-497)` and at nothing else. That "
            + "asymmetry IS the declaration: an equality two readers produce for free is not evidence they are one "
            + "rule, and REC-149's first build is the receipt \u2014 its two copies agreed until the day the default "
            + "moved. Only a structural pin can see this, which is why one exists.",
    from: "    const r = this.#one(`SELECT setting FROM project_sight WHERE project_id=?`, projectId);\n"
        + "    return r ? r.setting : \"hidden\";",
    to:   "    const r = this.#one(`SELECT setting FROM project_visibility WHERE project_id=? ORDER BY seq DESC LIMIT 1`,\n"
        + "      projectId);\n"
        + "    return r && r.setting === \"discoverable\" ? \"discoverable\" : \"hidden\";" },

  { id: "3-drop-the-negated-gate",
    recorded: "RUN 2026-09-24 (as corrected — see the note above on the draft that moved two variables), AS DECLARED: bounds 205/2, `THE NEGATED GATE IS READ TOO` and `BOTH halves of EXISTENCE are ROWS`, each by name; project-discoverable 153/3, §3e, §3f and §3g — the invited member, the administrator and the OWNER each offered a project to join that they are already in. derivation-bounds was not run for this arm: the bound did not move, which is the declaration.",
    suites: ["bounds", "project-discoverable"],
    declared: "THE NOT-FULL HALF REMOVED. The directory then lists every DISCOVERABLE project, including the ones "
            + "the caller is already in \u2014 which \u00a77.14 reserves for projects there is something to ASK to join. "
            + "`bounds` FAILS at `op=projectdirectory: THE NEGATED GATE IS READ TOO (D-497)` (the owner's directory "
            + "is no longer empty) and at `\u2026 BOTH halves of EXISTENCE are ROWS (D-497)`. `project-discoverable` "
            + "FAILS at its directory arms. The BOUND is untouched, so the ratchets do not move: this is a "
            + "correctness arm and not a bounds arm, and they are separate on purpose.",
    /* THE FIRST DRAFT OF THIS ARM MOVED TWO VARIABLES AND IS RECORDED RATHER THAN QUIETLY REPLACED. It cut the
       `NOT (${gate.sql})` out of the WHERE and left `...gate.args` in the call, so the statement carried two
       fewer placeholders than bound values: SQLite refused it, `op=projectdirectory` answered nothing at all,
       and NINE `bounds` arms plus the whole directory half of `project-discoverable` went red. Every one of
       those failures is the arm reporting a BROKEN STATEMENT, not a missing gate — "break only the thing you
       are testing", met once more, and an arm that takes the subject away entirely refutes nothing. The args go
       with the predicate. */
    from: "        WHERE b.object_type = 'project' AND s.setting = 'discoverable' AND NOT (${gate.sql})\n"
        + "        ORDER BY b.bundle_id\n"
        + "        LIMIT ?`, ...gate.args, cap + 1)",
    to:   "        WHERE b.object_type = 'project' AND s.setting = 'discoverable'\n"
        + "        ORDER BY b.bundle_id\n"
        + "        LIMIT ?`, cap + 1)" },

  { id: "4-over-strictness",
    recorded: "RUN 2026-09-24, AS DECLARED: bounds 207/0, derivation-bounds 72/0, project-discoverable 156/0 — all three at their baselines. The `IN (SELECT … FROM project_sight …)` spelling reads as the same property, so the arms above grade the property and not the JOIN they happen to be written against.",
    suites: ["bounds", "derivation-bounds", "project-discoverable"],
    declared: "OVER-STRICTNESS: correct work in a spelling nothing here anticipated must PASS. The sight index is "
            + "read through `IN (SELECT \u2026 FROM project_sight \u2026)` instead of a JOIN \u2014 the same rows, the same "
            + "bound, the same negated gate, one statement. ALL THREE SUITES GREEN at their baselines. A failure "
            + "here would mean the arms above grade a SPELLING rather than the property, which is the failure this "
            + "repository's instruments meet most.",
    from: "         FROM bundles b JOIN project_sight s ON s.project_id = b.bundle_id\n"
        + "        WHERE b.object_type = 'project' AND s.setting = 'discoverable' AND NOT (${gate.sql})",
    to:   "         FROM bundles b\n"
        + "        WHERE b.object_type = 'project' AND NOT (${gate.sql})\n"
        + "          AND b.bundle_id IN (SELECT project_id FROM project_sight WHERE setting = 'discoverable')" },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.map((a) => ({ arm: a.id, file: SRC, find: a.from, put: a.to })));

const PEN = mkdtempSync(join(tmpdir(), "d497-control-"));
const ONLY = process.argv.slice(2);          /* re-run one arm by id fragment; no argument runs them all */
const ALL = ["bounds", "derivation-bounds", "project-discoverable"];
console.log("=== D-497 NEGATIVE CONTROL · store.mjs ===");
console.log(`  subject ${SRC}`);
console.log(`  bytes ${statSync(SRC).size}  sha256 ${sha(SRC)}`);

console.log("\n--- BASELINE (arm 0): nothing armed. Every figure below is read against THIS row. ---");
const BASE = {};
for (const s of ALL) { BASE[s] = suite(s); console.log(`  BASELINE  ${s.padEnd(20)} ${BASE[s].tally[0]}/${BASE[s].tally[1]}`); }
if (ALL.some((s) => BASE[s].tally[0] <= 0 || BASE[s].tally[1] !== 0))
  console.log("  !! BASELINE IS NOT CLEAN — every arm below measures something other than its subject. STOP.");

let bad = 0;
for (const arm of ARMS) {
  if (ONLY.length && !ONLY.some((o) => arm.id.includes(o))) continue;
  /* THE CONTROL PEN IS OUTSIDE THE WORKTREE (BOB #32, 2026-09-24; taken here by D-497, which found this
     driver writing its pristine copies into `src/`). A file in the tree is not inert: repository-walking
     suites walk it, `gates.mjs` §2e reads it as under-inclusion, and it makes the tree DIRTY, so D-293
     refuses to record a GREEN verdict — three items paid for that in one night. These copies are removed
     on every path, which is exactly the guarantee an interrupted run does not give. */
  const pristine = join(PEN, `d497-pristine-${arm.id}`);
  copyFileSync(SRC, pristine);
  const before = sha(pristine), bytes = statSync(pristine).size;
  if (bytes < FLOOR_BYTES) { console.log(`  !! arm ${arm.id}: pristine copy is ${bytes} B, under the floor. SKIPPED.`); bad++; rmSync(pristine); continue; }
  const src = readFileSync(SRC, "utf8");
  const hits = src.split(arm.from).length - 1;
  console.log(`\n--- ARM ${arm.id} ---`);
  console.log(`  anchor occurrences: ${hits} (must be exactly 1)`);
  console.log(`  DECLARED: ${arm.declared}`);
  console.log(`  RECORDED (a previous run of this same arm): ${arm.recorded}`);
  if (hits !== 1) { console.log("  !! THE ARM DID NOT ARM — an arm that did not arm is a FINDING, not a pass."); bad++; rmSync(pristine); continue; }
  writeFileSync(SRC, src.replace(arm.from, arm.to));
  if (sha(SRC) === before) { console.log("  !! THE PATCH CHANGED NOTHING — a FINDING."); bad++; }
  for (const s of arm.suites) {
    const r = suite(s);
    console.log(`  RESULT    ${s.padEnd(20)} ${r.tally[0]}/${r.tally[1]}   (baseline ${BASE[s].tally[0]}/${BASE[s].tally[1]})`);
    for (const n of r.named) console.log(`      FAILED: ${n}`);
  }
  copyFileSync(pristine, SRC);
  const after = sha(SRC), abytes = statSync(SRC).size;
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", pristine, SRC]); } catch { cmpOk = false; }
  console.log(`  RESTORED  sha256 ${after === before ? "IDENTICAL" : "DIFFERS !!"} · cmp ${cmpOk ? "identical" : "DIFFERS !!"} · ${abytes} B (floor ${FLOOR_BYTES})`);
  if (after !== before || !cmpOk || abytes < FLOOR_BYTES) bad++;
  rmSync(pristine);
}
console.log(`\n=== D-497 CONTROL DONE · ${ARMS.length} arm(s) · ${bad} harness fault(s) ===`);
console.log(`  final subject sha256 ${sha(SRC)} · ${statSync(SRC).size} B`);
