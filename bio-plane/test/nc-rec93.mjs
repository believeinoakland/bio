/* REC-93's NEGATIVE CONTROL HARNESS. Declared in `test/observation-log.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec93.mjs             # every arm, in order, baseline first
 *     node test/nc-rec93.mjs referent    # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec82.mjs` / `nc-rec85.mjs` precedent).
 *
 * IT IS `nc-rec85.mjs`'s HARNESS WITH THIS ITEM'S ARMS, deliberately and
 * without improvement: a second harness of one shape is the drift this
 * repository keeps measuring, and the arms are the part that is this item's.
 * The rules it obeys, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. It is the only row that distinguishes
 *     six-arms-broken from six-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED. A match count that is not exactly 1
 *     is a FINDING, never a retry.
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used: it restores to HEAD, not to
 *     what was there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 *
 * WHAT THESE ARMS CANNOT SEE, stated rather than left to be discovered: every
 * one is a source-level mutation inside this plane. Nothing here exercises a
 * second instance, a real network fetch, the `#migrate` fold over a store that
 * actually holds pre-item `ai_run_log` rows (that is covered by
 * `test/rec93-fold-digest.mjs`, which drives the PRE-ITEM BUILD itself), or the
 * content and meaning levels, which have no writer until REC-94 and REC-95.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* The pristine copies live INSIDE this worktree, in a DOT-directory so neither
   the battery's discovery nor the fleet walk can enrol what it holds — and never
   in the shared scratchpad, which is NOT isolated between sessions and has had a
   harness overwritten mid-turn by a concurrent worker. */
const SAFE = join(REPO, ".rec93-control-pristine");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const AIRUN = join(PLANE, "src/airun.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 10000;   /* store.mjs is over a megabyte and airun.mjs tens of KB;
                              a restore over a stub must fail loudly rather than quietly. */

/* The subject: this item's own suite, run alone. Captured to a FILE-backed
   buffer and not a pipe the suite can outlive — D-282: a suite that calls
   process.exit() discards unflushed PIPE writes, and a control whose tally reads
   -1 because of it reports the wrong arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/observation-log.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status, out,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes six-arms-broken from six-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  /* OBSERVATION-LOG-DESIGN.md §9 arm 1, in the direction that matters most:
     REMOVE ONE DOCUMENT-LEVEL WRITER. The frontier then reports a document
     nobody looked at — which is FALSE and, worse, reads as an invitation to go
     and look at something already held. */
  writer: {
    files: [STORE],
    why: "remove the document-level writer in `recordCapturedLocator`, so a look that really "
       + "happened leaves no row and the frontier says never-looked about a document we hold",
    /* RE-CUT ON THIS ARM'S FIRST RUN, AND THE RE-CUT IS THE ITEM'S BEST FINDING.
       Declared: seven assertions red. Actual: FOUR — and the three that stayed
       GREEN were green for three different reasons, every one of them worth
       more than the arm passing would have been.
       (1) `F1: a FIRST look writes one row and says so` STAYED GREEN OVER A
           SUPPRESSED WRITE. It asserted `observation_written`, which the store
           computed from `detail !== "unchanged"` — THE SAME EXPRESSION THAT
           DECIDES TO WRITE — so the answer went on reporting `written: true`
           while nothing was written. **That is a real defect in this item's own
           code, found by this arm and fixed in the same turn**: the field now
           reports the OUTCOME, `F1` asserts `observation_refused` is null too,
           and a new `F1b` reads the field back against the row count. A
           published field derived from an intention rather than a result is the
           record claiming more than it can support, at the smallest scale.
       (2) and (3) `F4` (a CHANGE writes one row) and `F6` (the archive
           fallback) stayed green for the SAME reason as (1), and now go red with
           it — but they are NOT listed below, because after the fix they fail
           through `F1b`/`F5`'s counting rather than through their own labels,
           and declaring a failure this arm does not actually produce is how a
           declaration goes false while its anchor stays alive (M-12's class).
       The four that DID fire are the frontier's three and the row count, which
       is the right answer to "a writer was removed": the LOG is missing a look
       that really happened, and the frontier therefore says nothing about a
       document the store holds. */
    mustFail: ["the frontier carries that look, latest-per-subject, with what it found",
               "and `last_verified` is DERIVED onto it from that row's own `at`",
               "a result_ref the register does not hold is ANNOTATED at read time",
               "and the whole sequence wrote exactly two rows"],
    mustPass: "every refusal arm, the fold, and ratify's own writer — which is what shows this "
            + "arm removed ONE writer rather than breaking the table",
    /* RE-ANCHORED IN THIS ITEM'S OWN TURN, and the re-anchor is itself a
       receipt. The fix this arm forced — `wrote` reporting the OUTCOME — changed
       the very line the arm patched, so on the next run the arm reported
       `matched 0x` and DID NOT ARM while the suite read a comfortable 58/0.
       Without the harness's match-count guard that would have read as "the arm
       passes now", which is precisely how an arm stops arming silently. An arm
       that did not arm is a finding, never a retry. */
    patch: () => arm(STORE,
      "    let observed = null, wrote = false;\n    if (detail !== \"unchanged\") {",
      "    let observed = null, wrote = false;\n    if (false) {"),
  },

  /* §9 arm 1's second half: "drop the back-reference and the append is refused". */
  referent: {
    files: [STORE],
    why: "drop the back-reference from the acquire writer, so PRESENT no longer names what it found",
    /* RE-CUT ON ITS FIRST RUN TOO, and the finding here is about what this arm
       can and cannot DISTINGUISH. Declared three; three of the four that fired
       are the same four the `writer` arm produces, because **a refused append
       and an absent append leave the store in the same state** — no row. The
       arm therefore proves the row is gone but NOT that C-22.10 is what removed
       it, which is a weaker claim than the declaration made.
       So the suite gained the assertion that closes the gap rather than the
       declaration being quietly trimmed: `F1` now asserts `observation_refused`
       is NULL on the happy path, so under THIS arm that field carries C-22.10's
       refusal object and `F1` fails on the REFUSAL rather than on the absence —
       which is the difference between the two arms, made visible. `B11` holds
       the refusal itself against the pure checker and stays green throughout,
       which is what says the fence still exists while this arm runs. */
    mustFail: ["the frontier carries that look, latest-per-subject, with what it found",
               "a FIRST look writes one row, says so, and was not refused",
               "and the whole sequence wrote exactly two rows"],
    mustPass: "C-22.10's own refusal arm (B11), which must STILL fire — the refusal is what turns "
            + "this arm from a missing field into a refused append, and an arm that also took the "
            + "refusal down would have proved nothing",
    patch: () => arm(STORE,
      "        state: \"PRESENT\", resultKind: \"capture\", resultRef: captureSha,",
      "        state: \"PRESENT\", resultKind: \"capture\", resultRef: null,"),
  },

  /* §9 arm 4: "a row with no `authority_kind` is refused; a member's op=search
     writes nothing". This arm takes the refusal down — and the SECOND declared
     failure is the interesting one, because it is where the DOCTRINE lives. */
  authority: {
    files: [AIRUN],
    why: "neuter C-22.9, so a look with no authority behind it is recordable — RFC 2308's rule "
       + "inverted, and §4.6's provisional left with nothing enforcing it",
    mustFail: ["a row with NO authority_kind is REFUSED BY NAME (C-22.9)"],
    mustPass: "every other refusal, the fold, the edge rule and the frontier — this arm must "
            + "break the authority rule and nothing else",
    patch: () => arm(AIRUN,
      "  if (!Object.prototype.hasOwnProperty.call(OBSERVATION_AUTHORITY_KINDS, authorityKind))",
      "  if (false)"),
  },

  /* The C-22.6 half, and it is the fence this whole table's separation rests on:
     the observation log may never be filed into a published document. */
  bundle: {
    files: [AIRUN],
    why: "neuter C-22.6 at the append, so an entry naming a bundle is admitted and the log "
       + "becomes filable into `bundle.md` — which is written only on success, so the failure "
       + "path would be published or lost",
    mustFail: ["an entry naming a BUNDLE is refused at the append (C-22.6)"],
    mustPass: "every other refusal and the whole fold — the separation is ONE rule and this "
            + "arm must take exactly it",
    patch: () => arm(AIRUN,
      "  if (e.bundle != null && String(e.bundle) !== \"\")",
      "  if (false)"),
  },

  /* §7 and §9: "a steady-state sweep over N unchanged assets writes zero rows
     and increments N counters; change one asset and it writes one row." M-14
     measured what that rule buys: 2,859x over the real census corpus. */
  edge: {
    files: [STORE],
    why: "make the edge-triggered rule write a row on an UNCHANGED revisit — the WARC revisit "
       + "economy done wrong, and 43,283 rows a day over the city census instead of 15",
    mustFail: ["5 UNCHANGED revisits write ZERO rows",
               "and the whole sequence wrote exactly two rows"],
    mustPass: "the FIRST-look and CHANGE arms, and the CACHE arm — the counter must still move, "
            + "because this arm is about the row and not about the cache",
    /* RE-ANCHORED alongside the `writer` arm above and for the same reason —
       both patched the line the `observation_written` fix rewrote, and both
       reported `matched 0x` on the run after it. */
    patch: () => arm(STORE,
      "    if (detail !== \"unchanged\") {\n      observed = this.#observe({",
      "    if (true) {\n      observed = this.#observe({"),
  },

  /* THE OVER-STRICTNESS DIRECTION, and it is the arm that must STAY GREEN.
     C-22.10 deliberately does not fire on `authority_kind = run`, because
     `ai_run_log` never had a `result_ref` column and §4.4 requires its rows to
     fold in unchanged. Widening the refusal to every authority is CORRECT-LOOKING
     caution that breaks correct work — "a fence tighter than its rule is not a
     safer fence, it is an undeclared interface change wearing the costume of
     caution". */
  /* **THIS ARM IS NOT A SUFFICIENT MEASUREMENT OF "NO LIVE WRITER EMITS A BARE
     `run` PRESENT", AND REC-100's ACCEPTS-WHEN ASKED IT TO BE ONE.** Recorded
     2026-09-16 by the REC-100 worker, which was sent to widen the check when
     this arm "came back EMPTY" and found the arm structurally blind to the
     writers that decide the question. It runs `observation-log.test.mjs` and
     nothing else, so it cannot see:
       - `#aiRunTerminate` and `#aiRunReap` in `store.mjs`, whose PRESENT comes
         from `#aiRunSearchState` — a ROLLUP over the run's whole log, which has
         no referent BY CONSTRUCTION and that no writer change can give one;
       - `agent-worker`'s `stepLog`, the one EXTERNAL caller of `op=airuntick`,
         which composes no referent field at all while `observed` is JUDGEABLE,
         so a model may set `PRESENT` — and whose own suites MOCK this plane's
         `op=airuntick`, meaning a widening would break that integration with the
         entire battery green.
     An arm whose emptiness is read as a fact about writers it cannot reach is
     the unearned-absence class inside the harness built to refuse it. The three
     are driven directly in section I of `observation-log.test.mjs`; this arm's
     own job — proving the fence is a fence and not a wall — is unchanged and
     its declaration below is correct as written. */
  overstrict: {
    files: [AIRUN],
    why: "WIDEN C-22.10 to every authority including `run`, the over-strictness direction — "
       + "correct work in a spelling the fence did not anticipate must not be refused. "
       + "NOTE (REC-100): this arm sees ONE SUITE and is blind to the two rollup writers in "
       + "store.mjs and to agent-worker's stepLog — its emptiness is not a fact about writers",
    /* THIS ARM CAME BACK `NOT AS DECLARED` ON ITS FIRST RUN AND THE HARNESS WAS
       RIGHT TO SAY SO — the fault was in the SUITE, not in the arm or the
       subject. All three declared markers were present in the output, and the
       tally read `-1`: with the run's entries refused, `entries[2]` was
       undefined and a bare `.governed` threw a TypeError. **A TypeError inside
       an assertion goes through no assertion at all** — it ended the module
       while the tally read clean, so the verdict degraded from "three named
       assertions went red" to "the suite did not reach its own foot". That is
       WORKER.md's own receipt, reproduced here by this item and fixed at the
       suite (`C4` is index-safe now) rather than tolerated in the driver.
       The declaration is UNCHANGED, because it was correct; what changed is that
       the suite can now report it. */
    /* **I3 IS DECLARED BY REC-100 SO THIS ARM GRADES THE ROLLUP FINDING RATHER
       THAN MERELY PRINTING IT** (REC-99's lesson: the census was never blind,
       it was UNGRADED). With the carve-out widened, `op=airunclose` answers
       `terminated: false, ok: false, code: OBS_PRESENT_NO_REFERENT` and the
       run's terminal entry is NEVER WRITTEN — so **a run that observed anything
       PRESENT cannot be closed at all**, and the reaper's wake entry is the same
       rollup and fails the same way. That is a lifecycle deadlock in this plane,
       and it is a far heavier consequence than the over-strictness this arm was
       built to catch. Declaring it here means a future session that satisfies
       the rollup (a ruling on §3) sees this arm go GREEN on I3 and knows the
       carve-out is finally deletable — the arm becomes the gate on D-366. */
    mustFail: ["OVER-STRICTNESS — a `run` PRESENT with no referent is ACCEPTED",
               "the run's three entries all appended THROUGH THE FOLD — none refused",
               "`seq` is 1,2,3 PER RUN",
               "the run's TERMINAL entry is a bare `run` PRESENT"],
    /* I1 and I2 MUST STAY GREEN under this arm and that is the half that makes
       the finding precise: a run PRESENT that CARRIES a referent is accepted
       either way (the door is open), and the read still does not project it. So
       what the widening breaks is exactly the ROLLUP and the referent-less
       caller — not the mechanism. */
    mustPass: "every refusal arm — this arm breaks CORRECT WORK and nothing else, which is what "
            + "makes it the over-strictness arm rather than a seventh way to break the subject",
    patch: () => arm(AIRUN,
      "  if (state === \"PRESENT\" && authorityKind !== \"run\"",
      "  if (state === \"PRESENT\" && authorityKind !== \"__never__\""),
  },
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  /* Pristine copies, UNIQUELY NAMED PER ARM, taken before the patch. */
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  const r = runSuite();
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
  /* Restore, and MEASURE the restore. */
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  /* The declared verdict, checked. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
