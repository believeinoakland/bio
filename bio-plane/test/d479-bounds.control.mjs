/* D-479's NEGATIVE CONTROL DRIVER — the directory's bound, armed one arm at a time.
 *
 * COMMITTED ON PURPOSE (M0-18's precedent): a control that re-runs in one step is one the next
 * session can re-run, and this file's arms are the only thing that says the bound on
 * `op=projectdirectory` is measured rather than merely present.
 *
 * WHAT IT DOES. For each arm: assert the anchor occurs EXACTLY ONCE, patch it, run the suites the
 * arm DECLARES, restore by `cp` from a UNIQUELY-NAMED per-arm pristine copy, and verify the restore
 * by sha256 AND by `cmp`, with the byte count printed and floored. A BASELINE ROW RUNS FIRST — the
 * receipt this repository has paid for twice, where every arm reported the same wrong figure and only
 * a baseline could tell six-arms-broken from six-arms-working.
 *
 * Run: node test/d479-bounds.control.mjs        (from bio-plane/)
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

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
  const m = /^(\d+) pass(?:ed)?,? (\d+) fail/mi.exec(out) || /^(\w+): (\d+) passed, (\d+) failed/mi.exec(out);
  const tally = m ? (m.length === 4 ? [Number(m[2]), Number(m[3])] : [Number(m[1]), Number(m[2])]) : [-1, -1];
  const named = [...out.matchAll(/^ {2}FAIL {2}(.{0,150})/gm)].map((x) => x[1].trim());
  return { tally, named };
};

const ARMS = [
  { id: "1-drop-the-limit",
    recorded: "RUN 2026-09-24, AS DECLARED AND WIDER: derivation-bounds 69/3 (baseline 72/0) — `CENSUS IS A CEILING` plus BOTH `SET 2` arms, which were NOT predicted and are the arm telling me something true: with the LIMIT gone the method publishes a bound AND scans unbounded, so it joins the set the census count is BLIND to by construction, and that set is pinned by name. bounds 200/0 and meaning-bounds 92/0, GREEN exactly as declared — the SQL bound and the honesty of `truncated` are different properties with different guards. RE-RUN 2026-09-24 at D-497's anchor (see the note below): derivation-bounds 68/4 — the three above plus `TRUNCATION SOURCE, BY NAME`, which D-497 brought into reach by making `projectDirectory:projects` gradeable at its source; bounds 206/1, the NEW D-497 source arm by name, where the walk's LIMIT had been invisible to that suite; meaning-bounds 96/0, green.", suites: ["derivation-bounds", "meaning-bounds", "bounds"],
    declared: "THE ROW'S OWN ARM. derivation-bounds FAILS at `CENSUS IS A CEILING` with the census back at 118 — "
            + "the method re-enters the unbounded-scan roster BY NAME. DECLARED IN ADVANCE, and it is the finding "
            + "this arm exists to establish rather than a surprise: bounds' LIVE arms MUST STAY GREEN, because the "
            + "SQL LIMIT is not what makes `truncated` honest — the walk's stop at cap + 1 VISIBLE projects is — so "
            + "the two properties are guarded by two instruments and neither covers the other.",
    /* ANCHOR MOVED 2026-09-24 by D-497, which replaced the keyset WALK this arm was written against with ONE
       statement over the sight index. The arm's SUBJECT is unchanged — the SQL bound on the candidate read —
       and its declaration gained a failure it could not have had before: the walk's `LIMIT ?` was invisible to
       `bounds.test.mjs`, and the one statement's is not. */
    from: "        ORDER BY b.bundle_id\n        LIMIT ?`, ...gate.args, cap + 1)",
    to:   "        ORDER BY b.bundle_id`, ...gate.args)" },
  { id: "2-count-what-it-sent",
    recorded: "RUN 2026-09-24, AS DECLARED plus one: bounds 197/3 — THE BITE and the DELTA by name, and also the SAME-ORDER arm, because with `truncated` false the whole list is returned and its first two are not the page.", suites: ["bounds"],
    declared: "bounds FAILS at `op=projectdirectory: THE BITE` and at `op=projectdirectory: DELTA` by name — a cut "
            + "page and a complete answer read alike. The ratchets stay green: no SQL moved.",
    from: "    const truncated = projects.length > cap;",
    to:   "    const truncated = false;" },
  { id: "3-drop-the-published-bound",
    recorded: "RUN 2026-09-24. bounds 197/3 AS DECLARED — THE BITE, WHOLE and the OVER-ASK, each by name. **meaning-bounds CAME BACK GREEN AT 92/0, WHICH IS NOT WHAT I DECLARED, AND IT IS A FINDING ABOUT THE ARM RATHER THAN A SMOOTHED RESULT:** that walk grades an op BARE by whether its collection comes off an UNBOUNDED row source, and this arm left the `LIMIT ?` in place — so the op stays off the BARE roster and the ceiling cannot move. The published `limit` is guarded by `bounds.test.mjs` and by NOTHING ELSE; my declaration had assumed a second instrument that does not cover it.", suites: ["bounds", "meaning-bounds"],
    declared: "bounds FAILS at THE BITE, WHOLE and the OVER-ASK (a consumer can no longer tell which bound was "
            + "applied), and meaning-bounds FAILS at its BARE-roster CEILING with the roster back at 43 — the op "
            + "returns to the roster of collections published off a source nothing bounds.",
    /* THE ANCHOR CARRIES ITS NEXT LINE, and that is a finding this driver recorded against ITSELF rather
       than smoothing: `limit: cap, truncated,` alone occurs THREE times in store.mjs, so the first run of
       this arm reported `anchor occurrences: 3` and DID NOT ARM. An arm that did not arm is a finding. */
    from: "             limit: cap, truncated,\n             requests: \"NOT_BUILT:",
    to:   "             truncated,\n             requests: \"NOT_BUILT:" },
  { id: "4-over-fetch-by-one",
    recorded: "RUN 2026-09-24, AS DECLARED AND ONE WIDER: bounds 204/3 — THE BITE and the DELTA by name, plus D-497's own source arm, which reads the over-fetch (`cap + 1`) as part of the bounded-statement property and so sees this patch too. Two instruments covering one property from different sides, a gain rather than a duplication: the source arm cannot see whether `truncated` is HONEST, and the live arms cannot see the shape of the statement. (It supersedes `4-page-the-candidates-not-the-visible-set`, whose subject no longer exists — see below.)", suites: ["bounds"],
    declared: "THE OVER-FETCH IS WHAT MEASURES `truncated`. Ask for exactly the cap instead of one past it and a "
            + "full page and a complete answer read alike, with no second count to tell them apart. bounds FAILS "
            + "at `op=projectdirectory: THE BITE` and at the DELTA arm, by name. The ratchets stay green: the read "
            + "is still one bounded statement, and its bound is still the named constant.",
    /* THIS ARM SUPERSEDES `4-page-the-candidates-not-the-visible-set`, AND THE SUPERSESSION IS THE FINDING
       rather than a tidy-up. That arm bounded the CANDIDATE read and returned whatever survived the JS `#sight`
       filter, and it failed — as declared — because a hidden project sitting in the candidate window made the
       answer come back SHORT of the cap. D-497 removed the distinction it was armed against: the candidates ARE
       the visible set now, because both halves of EXISTENCE are rows in the one statement, so there is no
       second collection for a bound to be applied to the wrong one of. Re-anchoring it somewhere else would
       have been an arm wearing a dead subject's name. What survives of its property — that "exactly the cap"
       is something a caller may rely on — is what the over-fetch below measures. */
    from: "        LIMIT ?`, ...gate.args, cap + 1)",
    to:   "        LIMIT ?`, ...gate.args, cap)" },
  { id: "5-over-strictness",
    recorded: "RUN 2026-09-24, AS DECLARED: bounds 200/0, derivation-bounds 72/0, meaning-bounds 92/0 — all three at their baselines. The inline cut is read as the same cut at the same cap.", suites: ["bounds", "derivation-bounds", "meaning-bounds"],
    declared: "OVER-STRICTNESS: correct work in a spelling nothing here anticipated must PASS. The cut is written "
            + "inline in the returned object instead of through the local `page`, which is the same cut at the same "
            + "cap in different words. ALL THREE SUITES GREEN at their baselines.",
    from: "    const page = truncated ? projects.slice(0, cap) : projects;\n    return { ok: true, projects: page, count: page.length,",
    to:   "    return { ok: true, projects: truncated ? projects.slice(0, cap) : projects,\n             count: truncated ? cap : projects.length," },
];

const PEN = mkdtempSync(join(tmpdir(), "d479-control-"));
const ONLY = process.argv.slice(2);          /* re-run one arm by id fragment; no argument runs them all */
const ALL = ["bounds", "derivation-bounds", "meaning-bounds"];
console.log("=== D-479 NEGATIVE CONTROL · store.mjs ===");
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
  const pristine = join(PEN, `d479-pristine-${arm.id}`);
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
console.log(`\n=== D-479 CONTROL DONE · ${ARMS.length} arm(s) · ${bad} harness fault(s) ===`);
console.log(`  final subject sha256 ${sha(SRC)} · ${statSync(SRC).size} B`);
