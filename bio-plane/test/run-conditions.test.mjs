/* NEGATIVE CONTROL: five arms, EVERY ONE RUN on 2026-08-08 by rec74-run-conditions, each armed ALONE with the other defences held OPEN, against a mechanically broken copy of the subject; every file restored and every restore verified by sha256 AND by `cmp` (content), with each snapshot named UNIQUELY PER ARM because a harness that named two snapshots from the PATH alone overwrote the first and then compared a restored original against patched bytes. Re-run in one step: `node test/run-conditions.control.mjs` from bio-plane/. The harness lives in THIS WORKTREE and nowhere shared. Clean tree: see the control's own header for the measured figures.
   CLEAN TREE: 51 pass, 0 fail. EVERY FIGURE BELOW MEASURED, not predicted.
   (1) DROP THE NEW PUBLICATION. In src/store.mjs delete `standard: this.#standardForRun(row),` from `aiRunRead`'s returned session — which is exactly what this reader did before this item -> **exit 1, 33 pass, 18 FAIL, and the list is exact rather than a head**: T1, T2, T3 (§11's third condition), A1-A9 (all five answers, both totality directions and the polarity arm), C1, C2, C5 (the consumer can no longer read the bar OR the absence), C6 (one publisher, one call site), X1 (the two readers stop agreeing) and P2 (the declared cell has no path that resolves). ARM A3b survives, correctly: it also reads `op=airunspawn`, which this arm does not touch. This is the arm that proves the item's own subject is asserted rather than assumed. **IT ALSO CORRECTED THIS SUITE.** On its first run it reported 31 pass, 9 fail with `BLOCK T DIED` and `BLOCK A DIED` — the arms threw on `.in_force` and `.capture` of undefined and hid eleven named failures behind two deaths. D-93's class inside a control, for the ninth recorded time here. Every read of the block is null-tolerant now, and the 18 above is what the same control reports once it can finish.
   (2) **THE ARM THIS ITEM EXISTS FOR — PUBLISH THE ABSENT CASE AS AN INDISTINGUISHABLE NULL.** Make `#standardForRun` answer `basis: null, stated: null, pair: null` for every case that is not `recorded` — the null-shaped publication the item was written to prevent, a key that is present and says nothing -> **exit 1, 40 pass, 11 FAIL**: ARM A2/A3/A3b/A4/A5 (the five absences collapse into one), ARM A7/A8/A9 (polarity and both totality directions) and **ARM C2/C5 — the consumer arms — which is the required failure**: a consumer holding only the published bytes can no longer say WHICH absence it is, and cannot tell "no bar was in force" from "this reader does not publish the fact". The `recorded` case stays green, which is what makes the failure attributable to the absent case rather than to the block.
   (3) NEUTER THE STORED-VS-PUBLISHED WALK. Make the reader scan match nothing -> **exit 1, 44 pass, 7 FAIL**: ARM W2 fails as a DELTA with the corpus PRINTED, plus W3b, W4, P4, P4b, P4c and P6. **AND THE SURPRISE IS RECORDED RATHER THAN SMOOTHED: ARM P1 (the matrix is total) STAYED GREEN** — with zero readers found, `missing` and `extra` are both empty and the totality check passes vacuously. That is precisely "a walk over an empty corpus reports its verdict triumphantly", caught in this suite's own instrument, and it is why W2's delta and the printed corpus are the arms that carry the reach rather than P1.
   (4) OVER-STRICTNESS, IN-SUITE AND THEN AS A MUTATION. In-suite: ARM A3/A3b read the projectless run through op=airun AND op=airunspawn — found, running, unrefused, no `ok:false` and no code — because a gate that pressured a run into naming a bar it cannot have would be a bug in the gate. As a mutation, its opposite number: collapse `context-has-no-project` into `none-recorded` -> **exit 1, 44 pass, 7 FAIL** naming A3, A3b, A7, A9, C2, C5 and X4. The two absences are told apart by the CODE, not by the fixture.
   (5) POLARITY, on the branch that costs nothing to get wrong: accept a recorded bar that names NEITHER axis as a real bar (PL-4's class — a value that survives a falsiness guard while naming nothing reads as PRESENT and travels) -> **exit 1, 47 pass, 4 FAIL**: ARM A4, A7, A9 and C5. Five runs must produce five distinct answers; an arm set that matched everything would pass every line and mean nothing.
   ONE MORE RECEIPT, because it is the reason rule 2 of the harness exists. This control was once STOPPED FROM OUTSIDE mid-arm-1 while the suite it drives was hanging on an undisposed Miniflare; the `finally` never ran and `src/store.mjs` was left ARMED. The uniquely-named snapshot is what made the recovery provable — `cmp` against it, and the restored sha matched the `ARMED:` line's own before-hash. The harness now disarms on SIGINT/SIGTERM/SIGHUP and on an uncaught throw, and this suite disposes its Miniflare.
   ---------------------------------------------------------------------------
   NEGATIVE CONTROL: (run 2026-08-09, rec69-replay, REC-69's REBASE ONTO `main`) THREE further arms covering ONLY what the replay added here — the FIFTH ROLE `SELECTS`, ARM W8's teeth, and the W8 GUARD. RUN through `node test/nc-rec69-selects.mjs` from bio-plane/ (the driver lives INSIDE this worktree), each armed ALONE, DECLARED before it ran, anchor-occurs-exactly-once and bytes-really-changed guarded, every restore verified by sha256 AND `cmp` against a per-arm uniquely-named pristine copy with a byte count and a minimum, opening AND closing baseline rows (54 pass, 0 fail at both ends). CLEAN TREE: 54 pass, 0 fail.
   (1) A SELECTS READER STARTS PROJECTING A STORED COLUMN — `SELECT r.run FROM ai_runs r` -> `SELECT r.run, r.status FROM ai_runs r` in `aiRunsInContext` -> **exit 1, 53 pass, 1 FAIL**, ARM W8 naming `aiRunsInContext PROJECTS stored column status`, with W3/W3b correctly GREEN because the reader is still CLASSIFIED and it is the CODE that broke the role. **This is the arm that makes the exemption from ARM P1's matrix earned rather than granted.**
   (2) A SELECTS READER STOPS DELEGATING — `this.aiRunRead({ run: r.run, viewer })` -> a name no publisher carries -> **exit 1, 53 pass, 1 FAIL**, ARM W8 naming `aiRunsInContext CALLS NO PUBLISHES reader`. Delegation is the whole basis of the exemption, so it is asserted rather than assumed.
   (3) THE CLASSIFICATION IS REMOVED — delete `aiRunsInContext: "SELECTS"` from the ROLE table -> **exit 1, 52 pass, 2 FAIL**: ARM W3 naming `aiRunsInContext` (the EXACT failure of the 2026-08-08 backout, reproduced) and the ARM W8 GUARD (a corpus of zero SELECTS readers). **This is the arm answering "did minting a fifth role just make the ratchet's own failure go away".** It did not: W3 is unchanged and still total.
   (7) OVER-STRICTNESS — rewrite the projection as the equally correct `SELECT DISTINCT r.run AS run FROM ai_runs r` -> **exit 0, 54 pass, 0 fail**, as declared. **AND ITS FIRST RUN CAME BACK WRONG, which is the most useful line in this block:** W8 stayed green exactly as it should, and **ARM W8b — the POLARITY GUARD — went RED**, because its first draft built its cases by string-replacing the LIVE segment and its anchor no longer matched, so its mutation silently produced a segment identical to its input. An arm that did not arm, inside the guard whose only job is to prove the arm arms; it had also been falling as collateral in arms (1) and (2). W8b now constructs SYNTHETIC segments this file owns, so it measures the reader and not the subject's spelling, and it carries its own over-strictness case. The figures above are the post-fix ones.
   ---------------------------------------------------------------------------
   REC-74 — THE RUN'S THIRD CONDITION IS STORED AND WAS NEVER PUBLISHED, AND THE
   ITEM IS THE CLASS RATHER THAN THE FIELD.
   ---------------------------------------------------------------------------

   `INVESTIGATIVE-SESSION.md` §11 names THREE conditions a run is formed under:
   the bias manifest in force, the launching project's declared STANDARD PAIR,
   and the skill version. Measured at the source by SK-1 while wiring the third
   of them: `ai_runs.standard_pair` was WRITTEN by `aiRunOpen` and PUBLISHED by
   `aiRunSpawnPayload` — and `aiRunRead` did not publish it at all. A member
   reading the run object saw the skill version and the bias block and COULD NOT
   SEE THE BAR THE RUN WAS WORKING TO.

   PL-12 found the identical shape one field over: the bias manifest was written
   by one op and read by no op at all, so the honest *"no manifest was in
   force"* was stated nowhere a reader could see. **A condition recorded and
   never published is not recorded for anybody who was not there.**

   WHY SK-1 DELIBERATELY DID NOT FIX IT, which is the item. The honest
   publication must distinguish **"no bar was in force"** from **"the bar was
   X"**. Under DEC-17/DEC-21 the pair is PER-PROJECT and *"an inquiry outside
   any project has no bar"* — so the absent case is a FIRST-CLASS ANSWER about
   the pair's semantics, not a null. `CLAUDE.md`'s *undetermined is first-class
   and must be STATED* binds this field exactly as it binds a grade, and a gate
   that pressured somebody into inventing an attribution would be a bug in the
   gate.

   AND THE ABSENT KEY IS NOT ENOUGH ON ITS OWN. D-216's model check established
   the shape to match — a read naming no project gets NO `current` field at all,
   not a default — but an absent key alone cannot be told from *"we did not
   look"*, and telling those apart is the thing this item designs. So the key is
   ALWAYS PRESENT on a found run and the ABSENCE IS INSIDE IT, carrying which
   absence it is and the sentence that says so.

   ---------------------------------------------------------------------------
   WHAT THIS SUITE IS: A SWEEP, NOT A FIELD TEST
   ---------------------------------------------------------------------------

   Every condition and principal the run object STORES, checked against what
   each READER publishes. **Two readers of one row disagreeing about which of
   its facts exist is the defect; the missing pair is one instance of it.** So
   the matrix is DECLARED, TOTAL, and DRIVEN through the ops — a disposition is
   a claim about the wire, and a claim about the wire is checked on the wire.

   THE INSTRUMENT IS THE MOST LIKELY THING TO BE WRONG, and this file keeps the
   four rules that have each cost this repository real time:

     - SETS ARE DRIVEN, NEVER TYPED. The column corpus is parsed out of
       `schema.mjs`; the reader corpus is walked out of `store.mjs`; the basis
       vocabulary is imported from `airun.mjs`. A hand copy agrees at zero cost.
     - EVERY WALK PRINTS ITS CORPUS SIZE and asserts REACH as a DELTA, because a
       walk over an empty corpus reports its verdict triumphantly.
     - THE REAL PATH AND THE CONTROL'S PATH GO THROUGH ONE FUNCTION.
       `consumerVerdict` below is the only consumer, and the control re-runs it.
     - THE SPAN IS PROVED NON-TRIVIAL before any source arm reads it, and the
       comment stripper is guarded in BOTH directions (this file writes a great
       deal of prose into a file it then reads).

   WHAT THIS MATCHER CAN AND CANNOT SEE — stated here rather than discovered:
     - IT SEES: methods of `Store` declared at two-space indent whose body
       contains `FROM ai_runs` after comments are stripped. It reads the column
       list out of the ONE `CREATE TABLE IF NOT EXISTS ai_runs (...)` literal.
     - IT CANNOT SEE: a read of `ai_runs` built by string concatenation, a read
       inside a nested function expression assigned elsewhere, a reader outside
       `store.mjs` (there is none today and ARM W6 asserts that), or a column
       added by `#migrate` rather than by the CREATE TABLE literal. Each is
       asserted-against where it can be, and named here where it cannot.
     - THE WITHHOLDING CHECK IS TWO-LAYER AND THE SECOND LAYER IS NOT TOTAL: a
       declared-withheld cell is checked by PATH always, and by VALUE-SCAN only
       where the column's value is DISTINCTIVE (a string of eight or more
       characters). `status`, `ticks`, `context_type` and the plane-stamped
       `principal_plane` are enum-like or short and get the path check alone.
       ARM P5 PRINTS which columns got which, so the weaker half is visible
       rather than assumed. */

import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { STANDARD_BASIS, RUN_BOUNDS } from "../src/airun.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SRC = (f) => join(ROOT, "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
const sha = (s) => createHash("sha256").update(s).digest("hex");

let pass = 0, fail = 0;
const J = (v) => JSON.stringify(v);
const t = (name, got, want) => {
  if (J(got) === J(want)) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}\n         want ${J(want)}\n         got  ${J(got)}`); }
};
/* D-93's class inside a suite: a throw must be a RECORDED failure naming the
   block, and the blocks after it must still run. A control that breaks the
   subject has to show EVERYTHING it broke. */
const block = async (name, fn) => {
  try { await fn(); }
  catch (e) {
    fail++;
    console.log(`  FAIL  BLOCK ${name} DIED: ${String((e && e.message) || e).slice(0, 240)}`);
    console.log("         (the blocks after this one still ran — see below)");
  }
};

const decomment = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const STORE = decomment(STORE_SRC);
const INDEX = decomment(INDEX_SRC);

console.log("\n=== run-conditions: REC-74 — what the run STORES against what each reader PUBLISHES ===");

/* ========================================================================= S0
 *  THE GUARD ON THE GUARD. Every source arm below rests on the stripper.
 * ======================================================================= */
console.log("\n--- S0. the comment stripper, guarded in BOTH directions, and the corpus printed ---");
t("SEEK GUARD: a known CODE line survives decommenting",
  /standard: this\.#standardForRun\(row\)/.test(STORE), true);
t("SEEK GUARD: and a known PROSE line does NOT, so this file's own reasoning cannot satisfy an anchor",
  /A condition recorded and never published is not recorded/.test(STORE), false);
console.log(`  corpus: store.mjs ${STORE_SRC.length} chars (${STORE.length} after decomment), `
          + `schema.mjs ${SCHEMA_SRC.length}, index.mjs ${INDEX_SRC.length}`);

/* ========================================================================= W
 *  THE WALK — what the row STORES, and who READS it. Both driven.
 * ======================================================================= */

/* THE COLUMN CORPUS, parsed out of the one CREATE TABLE literal. */
const runColumns = (schemaSrc) => {
  const m = schemaSrc.match(/CREATE TABLE IF NOT EXISTS ai_runs \(([\s\S]*?)\n\);/);
  if (!m) return [];
  return m[1].split("\n").map((s) => s.trim()).filter(Boolean)
    .map((s) => s.split(/\s+/)[0]).filter((s) => /^[a-z_]+$/.test(s));
};

/* THE READER CORPUS. Method signatures at two-space indent, brace-free
   segmentation by NEXT signature — the same shape `airun.test.mjs`'s consumer
   walk uses, and it is the walk arm (3) of the negative control neuters. */
const runReaders = (storeDecommented) => {
  const re = /^  (?:async\s+)?(#?[A-Za-z][A-Za-z0-9_]*)\s*\(/gm;
  const marks = [];
  let m;
  while ((m = re.exec(storeDecommented))) marks.push({ name: m[1], at: m.index });
  const hits = [];
  const bodies = new Map();
  for (let i = 0; i < marks.length; i++) {
    const body = storeDecommented.slice(marks[i].at, i + 1 < marks.length ? marks[i + 1].at : storeDecommented.length);
    if (/FROM\s+ai_runs/.test(body)) { hits.push(marks[i].name); bodies.set(marks[i].name, body); }
  }
  /* REC-69: the SEGMENTS are returned alongside the names, because ARM W8 judges
     what a SELECTS reader's own statement PROJECTS and a name cannot carry that. */
  return { methods: marks.length, readers: hits, bodies };
};

/* THE CLASSIFICATION, DECLARED — and it must be TOTAL over whatever the walk
   finds, so a thirteenth method reading `ai_runs` tomorrow FAILS this suite
   instead of joining the sweep unnoticed. The roles are not decoration: they
   are the reason a method is or is not owed a disposition below.

     PUBLISHES   — a read whose ANSWER IS ABOUT THE RUN ROW. These are the only
                   ones a member or a sub-session learns the run's facts from,
                   and they are the ones the class is about.
     WRITES      — a mutating op. Its answer is about the ACT (started, ticked,
                   terminated) and reads the row to decide whether the act is
                   legal, not to describe it.
     AUTHORISES  — reads the row to decide whether a DIFFERENT act may proceed,
                   and publishes nothing of it. Echoing the caller's own `run`
                   argument back in a refusal is not publishing a stored fact.
     HOUSEKEEPS  — the reaper and the purge. Clock and lifecycle; no facts.
     SELECTS     — MINTED 2026-08-09 by REC-69, and the minting is the judgement
                   rather than a fifth box. See the block immediately below. */

/* ========================================================================= *
 *  SELECTS — WHY A FIFTH ROLE WAS MINTED RATHER THAN A FOURTEENTH READER
 *  FORCED INTO ONE OF THE FOUR. REC-69, 2026-08-09, and this is the judgement
 *  CONDUCT deliberately left open at the 2026-08-08 rebuild because getting it
 *  wrong installs a FALSE ASSERTION ABOUT WHAT THE RECORD PUBLISHES.
 * ========================================================================= *
 *
 *  THE READER. `aiRunsInContext` (`op=airuns`) answers WHICH RUNS ARE IN THIS
 *  CONTEXT. Its statement over `ai_runs` is `SELECT r.run … WHERE
 *  lower(r.context_type)=? AND r.context_id=? AND <gate> LIMIT ?` — it reads the
 *  row to CHOOSE a set of ids and projects nothing else. Every fact a caller
 *  then learns about each chosen run is composed by `aiRunRead`, CALLED PER ROW,
 *  and `airuns.test.mjs` asserts each row BYTE-IDENTICAL to `op=airun`'s own
 *  `session` block rather than as a list of key names.
 *
 *  WHY NOT `PUBLISHES`, and the argument is not that no run facts reach a member
 *  through this op — THEY PLAINLY DO. It is that classifying it PUBLISHES obliges
 *  it, through ARM P1, to declare a disposition for all twenty stored columns —
 *  and every one of those twenty cells would be A COPY OF `aiRunRead`'s. That
 *  copy would agree with its original FOR FREE, which this repository has now
 *  measured six times as the shape of an assertion that proves nothing; and it
 *  would be worse than merely free, because a SECOND declaration can DRIFT from
 *  the reader it describes while the code cannot. The matrix would then read as
 *  two independent judgements agreeing about what `op=airuns` publishes when
 *  there is only ever one, made in one place. A table asserting more than it can
 *  support about what the record publishes is exactly the defect this file's own
 *  item exists to prevent.
 *
 *  WHY NOT `AUTHORISES`, which is the closest of the four and still wrong. Its
 *  second clause fits — the method publishes no stored fact of its own — but its
 *  FIRST clause is the definition: a reader that decides whether A DIFFERENT ACT
 *  MAY PROCEED. No act is authorised here; a question is answered. Filing it
 *  under AUTHORISES would make the role mean "reads and does not itself publish",
 *  which is a much weaker claim than the one AUTHORISES currently makes about
 *  `suggestVersion` and `captureRequest`, and weakening a role to admit a member
 *  is how a classification stops classifying. `WRITES` and `HOUSEKEEPS` are not
 *  arguable.
 *
 *  SO THE FOUR ROLES DID NOT NAME IT, AND THE HONEST ANSWER IS TO SAY SO:
 *
 *    SELECTS — a read whose answer is about WHICH RUNS, never about a run. It
 *              reads the row to choose ids, DELEGATES every published fact about
 *              each chosen run to a PUBLISHES reader by calling it, and its own
 *              answer carries only facts about the ANSWER (`count`, `limit`,
 *              `truncated`) and the QUESTION NORMALISED FROM THE CALLER'S OWN
 *              INPUT (`context: {type, id}`) — not one value read off a stored
 *              column. It owes no disposition row BECAUSE it composes none: the
 *              dispositions governing what a member learns through it are the
 *              delegate's, and they are the same ones BY CONSTRUCTION rather
 *              than by a second declaration.
 *
 *  AND IT IS NOT BELIEVED ON THE STRENGTH OF ITS DEFINITION. A role that merely
 *  asserted delegation would be this project's most-repeated defect — a mechanism
 *  trusted because it exists. ARM W8 DRIVES it: a SELECTS reader whose statement
 *  projects any stored column beyond the key, or which calls no PUBLISHES reader,
 *  FAILS THERE. That arm is what makes the exemption from ARM P1 earned rather
 *  than granted, and its polarity guard proves the reader can see the violation.
 *
 *  WHAT THIS DELIBERATELY DOES NOT DECIDE: whether the ENVELOPE fields a SELECTS
 *  reader publishes are themselves owed a matrix. They are facts about the answer
 *  and not about the row, so no stored column is at stake and ARM P1's subject —
 *  the twenty columns — is untouched. If a SELECTS reader ever publishes a fact
 *  computed FROM the rows it selected (a count of running jobs, a newest-first
 *  timestamp), that is a different classification question and ARM W8 will not
 *  catch it: it reads the SQL projection, not arithmetic over the page. STATED
 *  here rather than left for somebody to discover. */
const ROLE = {
  aiRunRead:          "PUBLISHES",
  aiRunSpawnPayload:  "PUBLISHES",
  aiRunLog:           "PUBLISHES",
  aiRunsInContext:    "SELECTS",
  aiRunOpen:          "WRITES",
  aiRunTick:          "WRITES",
  "#aiRunTerminate":  "WRITES",
  /* THE THIRTEENTH READER, ADDED 2026-08-09 BY PL-18 — and ARM W3 is why it is
     here rather than in nobody's list: it FAILED naming `aiRunClose`, which is
     the arm doing exactly what its own sentence promises. DEC-63's gate made
     `aiRunClose` read the row (`SELECT context_type, context_id`) so it can ask
     which projects the run's question belongs to before letting a member close
     it. WRITES rather than AUTHORISES: it is a MUTATING OP whose answer is about
     the act (`terminated`), and it reads the row to decide whether that act is
     legal — which is the WRITES definition word for word. AUTHORISES is for
     `suggestVersion` and `captureRequest`, which read the run row to gate a
     DIFFERENT act. It publishes nothing of the row: its refusal echoes only the
     caller's own `run` argument, so ARM W4's "exactly three publishers" is
     untouched and was re-checked rather than assumed. */
  aiRunClose:         "WRITES",
  suggestVersion:     "AUTHORISES",
  captureRequest:     "AUTHORISES",
  "#aiRunReapPending": "HOUSEKEEPS",
  "#aiRunReapWake":    "HOUSEKEEPS",
  "#aiRunReap":        "HOUSEKEEPS",
  /* FL-4's two, and ARM W3 IS WHY THEY ARE HERE — they arrived as a FAILURE
     naming both of them by name, which is the sweep behaving exactly as its own
     comment promises rather than absorbing a new reader in silence.
     HOUSEKEEPS, on the reaper's reasoning and beside it: they ask the CLOCK a
     question — is this run still waiting on the daemon, and has the daemon
     answered — to decide whether to hold a lease or deliver a completion. They
     publish no fact OF the run to anybody. The wake's own observation entry is
     written through `#aiRunAppend`, whose subject is the log and not this row,
     and the only run field either of them causes to move is `expires`, which is
     the lifecycle column the reaper reads. */
  "#aiRunWakeHolds":   "HOUSEKEEPS",
  "#aiRunWakeRuns":    "HOUSEKEEPS",
  purge:               "HOUSEKEEPS",
};

const COLUMNS = runColumns(SCHEMA_SRC);
const WALK = runReaders(STORE);
const PUBLISHERS = WALK.readers.filter((r) => ROLE[r] === "PUBLISHES");

console.log("\n--- W. THE WALK: every column the run STORES, every method that READS it ---");
console.log(`  corpus: ${COLUMNS.length} stored columns x ${WALK.readers.length} readers `
          + `= ${COLUMNS.length * WALK.readers.length} (method, column) pairs, over ${WALK.methods} `
          + `methods scanned in store.mjs; ${PUBLISHERS.length} of the readers PUBLISH about the row, `
          + `so ${COLUMNS.length * PUBLISHERS.length} cells are owed a disposition below`);
t("ARM W1: the column corpus is READ from schema.mjs and is non-trivial — a walk over an empty corpus "
+ "reports its verdict triumphantly",
  [COLUMNS.length >= 20, COLUMNS.includes("standard_pair"), COLUMNS.includes("bias_manifest"),
   COLUMNS.includes("skill_version")],
  [true, true, true, true]);
t("ARM W2: REACH, as a DELTA — the reader walk finds at least twelve methods reading `ai_runs`, over a "
+ "method scan of at least three hundred. Neuter either and this reads [0,0] rather than passing",
  [WALK.readers.length >= 12, WALK.methods >= 300], [true, true]);
t("ARM W3: THE CLASSIFICATION IS TOTAL over what the walk found — a thirteenth reader lands here as a "
+ "FAILURE naming itself, not as a silent addition to a sweep that has already reported",
  WALK.readers.filter((r) => !ROLE[r]), []);
t("ARM W3b: and the classification names nothing the walk did not find, so a method deleted from the "
+ "plane cannot keep a green cell alive in this table",
  Object.keys(ROLE).filter((r) => !WALK.readers.includes(r)), []);
/* CORRECTED 2026-08-09 by REC-69, not exempted, and the old wording was true on
   the day REC-74 wrote it. It read *"…and they are the THREE READ OPS"*. There
   are now FOUR read ops on `ai_runs` — `op=airun`, `op=airunspawn`, `op=airunlog`
   and `op=airuns` — and only three of them publish about the row. Left alone, the
   sentence would have become the very thing this suite exists to catch: a pin
   whose ASSERTION still passed while its CLAIM went false, so a reader would
   learn from it that the plane has three read ops. The assertion itself is
   unchanged and is now the stronger statement — a fourth read op arrived and the
   publisher set did NOT grow, which is SELECTS being a real distinction rather
   than a label. */
t("ARM W4: EXACTLY THREE readers publish about the row, and a FOURTH read op arrived without joining "
+ "them — `op=airuns` reads the row to choose ids and delegates every published fact to `aiRunRead`",
  PUBLISHERS.slice().sort(), ["aiRunLog", "aiRunRead", "aiRunSpawnPayload"]);
t("ARM W5: SEEK GUARD ON THE WALK — run over a source with the ai_runs reads removed it finds NONE, so "
+ "ARM W2's answer is the walk working rather than a regex that matches anything",
  runReaders(STORE.replace(/FROM\s+ai_runs/g, "FROM nothing_at_all")).readers, []);
t("ARM W6: and no reader of `ai_runs` lives OUTSIDE store.mjs — the walk's blind spot is named in this "
+ "file's header, and this is the arm that keeps it a blind spot rather than a hole",
  /FROM\s+ai_runs/.test(INDEX) || /FROM\s+ai_runs/.test(decomment(readFileSync(SRC("query.mjs"), "utf8"))),
  false);
/* CORRECTED 2026-08-09 by REC-69 — `airuns:` joins the list for the same reason
   the other three are on it. A judged reader nobody can route to proves nothing,
   and SELECTS is a claim about an OP's answer rather than about a method. */
t("ARM W7: the four ops are DISPATCHED, so the readers this sweep judges are ones a caller can reach — "
+ "a store-level sweep over a method no op routes to would prove nothing (D-43)",
  ["airun:", "airunspawn:", "airunlog:", "airuns:"].filter((o) => !STORE.includes(o)), []);

/* ========================================================================= W8
 *  SELECTS, DRIVEN. The role above is an EXEMPTION FROM ARM P1's matrix, so it
 *  has to be earned by the code rather than granted by the table. Two conditions,
 *  both read off the reader's own segment:
 *    (1) its statements over `ai_runs` PROJECT nothing but the key. A SELECTS
 *        reader that started selecting `r.status` would be publishing a stored
 *        fact under a role that says it does not, and the matrix would not be
 *        watching it.
 *    (2) it CALLS a reader classified PUBLISHES. Delegation is the whole basis of
 *        the exemption; a SELECTS reader that composed its own rows would owe the
 *        matrix twenty cells like anybody else.
 *  Both are structural on purpose — the RUNTIME half is `airuns.test.mjs`'s
 *  byte-identity arm against `op=airun`'s `session` block, which is the strongest
 *  available form of "the same shape per row" and is driven through the ops. */
const SELECTORS = WALK.readers.filter((r) => ROLE[r] === "SELECTS");
/* The KEY is `run`, the row's own primary key and the argument the delegate is
   called with. Naming it here rather than deriving it keeps the exemption narrow:
   any OTHER stored column appearing in a projection is a violation. */
const KEY_COLUMN = "run";
const projectedColumns = (segment) =>
  [...segment.matchAll(/SELECT\s+([\s\S]*?)\s+FROM\s+ai_runs/gi)]
    .flatMap((m) => COLUMNS.filter((c) => new RegExp(`(?:^|[\\s,(]|\\w\\.)${c}\\b`).test(m[1])));
const selectorViolations = SELECTORS.flatMap((name) => {
  const seg = WALK.bodies.get(name) || "";
  const projected = [...new Set(projectedColumns(seg))].filter((c) => c !== KEY_COLUMN);
  const delegates = PUBLISHERS.filter((p) => new RegExp(`this\\.${p}\\s*\\(`).test(seg));
  return [
    ...projected.map((c) => `${name} PROJECTS stored column ${c}`),
    ...(delegates.length ? [] : [`${name} CALLS NO PUBLISHES reader`]),
  ];
});
console.log(`  ARM W8 corpus: ${SELECTORS.length} SELECTS reader(s) — ${SELECTORS.join(", ") || "NONE"}`
          + `; each judged on its projection over ${COLUMNS.length} stored columns and on which of the `
          + `${PUBLISHERS.length} publishers it calls`);
t("ARM W8 GUARD: there IS at least one SELECTS reader — the exemption below is judged over a real "
+ "corpus rather than reported clean over an empty one",
  SELECTORS.length >= 1, true);
t("ARM W8: SELECTS IS EARNED, NOT GRANTED — every SELECTS reader projects nothing but the key from "
+ "`ai_runs` and delegates to a PUBLISHES reader. One that started selecting a stored column, or "
+ "composed its own rows, lands here BY NAME instead of quietly sitting outside ARM P1's matrix",
  selectorViolations, []);
/* ARM W8b, REWRITTEN 2026-08-09 IN THE TURN THAT WROTE IT, and the reason is a
   control that came back WRONG rather than a preference — recorded here instead
   of smoothed. The first draft built its polarity cases by STRING-REPLACING the
   live segment (`SELECT r.run FROM ai_runs` -> `SELECT r.run, r.status …`). The
   over-strictness arm then rewrote the real projection to the equally correct
   `SELECT DISTINCT r.run AS run FROM ai_runs r` — W8 stayed GREEN, exactly as it
   should — and W8b WENT RED, because its own anchor no longer matched and its
   mutation silently produced a segment identical to the input. AN ARM THAT DID
   NOT ARM, inside the guard whose entire job is to prove the arm arms. It also
   fell as collateral in the two arms that DID work, for the same reason.
   A polarity guard must not be coupled to the subject's spelling. These cases are
   SYNTHETIC segments this file owns outright, so the guard measures the READER
   and nothing else — and the third case is the guard's own over-strictness:
   correct work must come back clean through the same reader. */
t("ARM W8b: POLARITY, over segments this arm CONSTRUCTS rather than patches — the reader FINDS a "
+ "projected stored column, FINDS a missing delegation, and comes back clean on a correct one. W8's "
+ "empty list is therefore a measurement and not a matcher that never matches",
  (() => {
    const projects = "  ncSelectsProjecting(a) {\n"
      + "    const page = this.#rows(`SELECT r.run, r.status FROM ai_runs r WHERE r.run = ?`, a);\n"
      + "    return page.map((r) => this.aiRunRead({ run: r.run }));\n  }\n";
    const undelegated = "  ncSelectsUndelegated(a) {\n"
      + "    const page = this.#rows(`SELECT r.run FROM ai_runs r WHERE r.run = ?`, a);\n"
      + "    return page.map((r) => ({ id: r.run }));\n  }\n";
    const correct = "  ncSelectsCorrect(a) {\n"
      + "    const page = this.#rows(`SELECT DISTINCT r.run AS run FROM ai_runs r WHERE r.run = ?`, a);\n"
      + "    return page.map((r) => this.aiRunRead({ run: r.run }));\n  }\n";
    const cols = (s) => [...new Set(projectedColumns(s))].filter((c) => c !== KEY_COLUMN);
    const delegates = (s) => PUBLISHERS.some((p) => new RegExp(`this\\.${p}\\s*\\(`).test(s));
    return [cols(projects), delegates(projects),
            cols(undelegated), delegates(undelegated),
            cols(correct), delegates(correct)];
  })(),
  [["status"], true, [], false, [], true]);

/* ========================================================================= *
 *  THE RUNTIME. Everything below goes through the CONTROL PLANE.
 * ======================================================================= */
const IDX = SRC("index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec74", MEMBER_TOKEN: "mem-rec74", PROBE_TOKEN: "prb-rec74",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const TOK = "mem-rec74";
const POST = async (op, body, tok = TOK) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (op, qs, tok = TOK) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json());

const NOW = "2026-08-08T09:00:00Z";
const INQUIRY = "INQ-2026-0808-who-signed-the-transfers";
const PROJECT = "PROJ-2026-0808-transfer-review";

const promote = async (id, text, type, state) => await POST("promote", {
  bundleId: id, base: null, snapKey: `${id}-new`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: state, created: NOW, last_updated: NOW },
});
const inquiryMd = ["---", `id: ${INQUIRY}`, "---", "", "## Question", "",
  "Who signed the sewer fund transfers?", ""].join("\n");
const projectMd = ["---", `id: ${PROJECT}`, "object_type: project", `title: "Transfer review"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${NOW}"`, "---", "",
  "## Thesis Summary", "", "A project.", "", "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

await block("fixture", async () => {
  const a = await promote(INQUIRY, inquiryMd, "inquiry", "open");
  if (!a || a.ok === false) throw new Error(`promote inquiry: ${J(a)}`);
  const b = await promote(PROJECT, projectMd, "project", "forming");
  if (!b || b.ok === false) throw new Error(`promote project: ${J(b)}`);
});

/* THE SIX RUNS, one per answer this field can honestly give, plus the matrix
   run. Every one opened through `op=airunopen` — the write path is SK-1's and
   is not touched by this item; what changes is what comes back out. */
const open = async (over) => await POST("airunopen", {
  contextType: "project", contextId: PROJECT, principalClaude: "instance",
  skillVersion: "investigative-session@1", biasManifest: null, at: NOW, leaseMs: 600000, ...over });

const R = {
  bar:        "RUN-2026-0808-bar-declared",
  noBar:      "RUN-2026-0808-project-no-bar",
  noProject:  "RUN-2026-0808-outside-any-project",
  noAxis:     "RUN-2026-0808-bar-names-no-axis",
  unreadable: "RUN-2026-0808-bar-unreadable",
  oneAxis:    "RUN-2026-0808-bar-one-axis",
  matrix:     "RUN-2026-0808-disposition-matrix",
};

await block("runs", async () => {
  const started = [];
  started.push(await open({ run: R.bar, standardPair: J({ capture: "B", connection: "C" }) }));
  started.push(await open({ run: R.noBar, standardPair: null }));
  started.push(await open({ run: R.noProject, contextType: "inquiry", contextId: INQUIRY,
                            standardPair: null }));
  started.push(await open({ run: R.noAxis, standardPair: J({ note: "we will decide later" }) }));
  started.push(await open({ run: R.unreadable, standardPair: "capture=B, connection=C" }));
  started.push(await open({ run: R.oneAxis, standardPair: J({ capture: "A" }) }));
  const bad = started.filter((s) => s.started !== true);
  if (bad.length) throw new Error(`a fixture run did not start: ${J(bad)}`);
});

/* ========================================================================= T
 *  §11's THREE CONDITIONS, AND THE DELTA. This is the item's own assertion.
 * ======================================================================= */
console.log("\n--- T. §11's THREE conditions: the reader published two of them and now publishes three ---");
await block("T", async () => {
  const r = await GET("airun", `run=${R.bar}`);
  if (!r || !r.session) throw new Error(`op=airun did not answer: ${J(r)}`);
  const s = r.session;
  /* NULL-TOLERANT, AND MEASURED RATHER THAN ADOPTED. On the first full run of
     the negative control, arm (1) — which deletes exactly this block — made
     `s.standard.in_force` throw, so BLOCK T and BLOCK A DIED and every arm
     behind them was hidden: the control reported two deaths where it should
     have reported eleven named failures. A control that dies early hides what
     it broke, and this repository has now measured that inside a control nine
     times. Every read of the block goes through `st`/`std` below. */
  const st = (s && s.standard) || {};
  t("ARM T1: THE DELTA. Before this item `op=airun`'s session carried `principal.skill` and `bias` and "
  + "NO field of any name about the standard pair. All three of §11's conditions are now published",
    [typeof s.principal.skill === "string" && s.principal.skill.length > 0,
     s.bias !== undefined, s.standard !== undefined],
    [true, true, true]);
  t("ARM T2: and the third one is the BAR ITSELF, per axis — `op=airun` now answers what the run was "
  + "held to, which no answer of any op could tell a member reading the run object",
    [st.in_force, st.basis, st.pair],
    [true, "recorded", { capture: "B", connection: "C" }]);
  t("ARM T3: THE PAIR IS NOT COMPOSED (DEC-21/DEC-44 refuse it four ways) — two axes travel side by "
  + "side and no answer here reduces them to one value",
    [Object.keys(st.pair || {}).sort(), typeof st.pair],
    [["capture", "connection"], "object"]);
  t("ARM T4: SEEK GUARD — the session answer is a real object with the fields the item did NOT add, so "
  + "ARM T1 is not passing over an empty shape",
    [Object.keys(s).length >= 12, s.id, s.status], [true, R.bar, "running"]);
});

/* ========================================================================= A
 *  THE ABSENT CASE, DRIVEN AS FIVE DISTINCT ANSWERS RATHER THAN AS A NULL.
 * ======================================================================= */
console.log("\n--- A. `no bar was in force` is FIVE different facts, and each is STATED ---");
await block("A", async () => {
  /* NULL-TOLERANT — see ARM T's note. Arm (1) of the negative control deletes
     this very block, and a suite that THREW there would report one death in
     place of nine named failures. */
  const std = async (run) => {
    const a = await GET("airun", `run=${run}`);
    return (a && a.session && a.session.standard) || {};
  };

  const bar = await std(R.bar);
  const noBar = await std(R.noBar);
  const noProject = await std(R.noProject);
  const noAxis = await std(R.noAxis);
  const unreadable = await std(R.unreadable);
  const oneAxis = await std(R.oneAxis);

  t("ARM A1: THE BAR WAS X — declared by the launching project, published per axis",
    [bar.in_force, bar.basis, (bar.pair || {}).capture ?? null, (bar.pair || {}).connection ?? null,
     bar.stated],
    [true, "recorded", "B", "C", STANDARD_BASIS.recorded]);

  t("ARM A2: NO BAR WAS IN FORCE, in a project that could have declared one — and the sentence says "
  + "exactly that, about the RECORD OF THE FORMATION rather than about the project today",
    [noBar.in_force, noBar.basis, noBar.pair, noBar.stated],
    [false, "none-recorded", null, STANDARD_BASIS["none-recorded"]]);

  t("ARM A3: AND THE PROJECTLESS RUN IS A DIFFERENT ANSWER — DEC-17: *an inquiry outside any project "
  + "has no bar*, so nothing could have declared one and inheriting a bar would INVENT it",
    [noProject.in_force, noProject.basis, noProject.pair, noProject.stated],
    [false, "context-has-no-project", null, STANDARD_BASIS["context-has-no-project"]]);

  t("ARM A3b: OVER-STRICTNESS — that run READS CLEANLY. It is found, it is running, nothing refuses "
  + "it and no code travels with it. A gate that pressured this run into naming a bar it cannot have "
  + "would be a bug in the gate, not a defence",
    (await (async () => {
      const r = await GET("airun", `run=${R.noProject}`);
      const sp = await GET("airunspawn", `run=${R.noProject}&half=search`);
      return [r.found, (r.session || {}).status, r.ok === false, "code" in (r || {}),
              sp.found, ((sp.payload || {}).standard || {}).basis, sp.ok === false];
    })()),
    [true, "running", false, false, true, "context-has-no-project", false]);

  t("ARM A4: SOMETHING WAS RECORDED AND IT NAMES NEITHER AXIS — PL-4's class one field over: a value "
  + "that survives a falsiness guard while naming nothing reads as PRESENT and travels. Not a bar",
    [noAxis.in_force, noAxis.basis, noAxis.pair, noAxis.stated],
    [false, "names-no-axis", null, STANDARD_BASIS["names-no-axis"]]);

  t("ARM A5: A BAR WAS RECORDED AND CANNOT BE READ BACK — a different fact from *there was nothing*, "
  + "and only one of the two is a defect somebody should go and look at",
    [unreadable.in_force, unreadable.basis, unreadable.pair, unreadable.stated],
    [false, "unreadable", null, STANDARD_BASIS.unreadable]);

  t("ARM A6: ONE AXIS DECLARED — the bar IS in force, the axis it names carries its letter, and the "
  + "axis it does not is NULL BESIDE IT, never filled in from its sibling (DEC-21's two populations)",
    [oneAxis.in_force, oneAxis.basis, oneAxis.pair],
    [true, "recorded", { capture: "A", connection: null }]);

  /* POLARITY, EXPLICITLY. Five answers that must all differ; an arm set that
     matched everything would pass every line above and mean nothing. */
  const bases = [bar, noBar, noProject, noAxis, unreadable].map((x) => x.basis);
  t("ARM A7: POLARITY — the five runs produce FIVE DISTINCT answers, so no arm above is passing by "
  + "matching a value the plane gives to everybody",
    [new Set(bases).size, bases.length], [5, 5]);
  t("ARM A8: and every basis the plane emitted is a member of the published vocabulary, which is the "
  + "totality check in the direction the answer travels",
    bases.filter((b) => !Object.prototype.hasOwnProperty.call(STANDARD_BASIS, b)), []);
  t("ARM A9: TOTALITY THE OTHER WAY — every term the vocabulary declares is REACHED by one of the "
  + "runs above, so no branch is a sentence nobody can produce",
    Object.keys(STANDARD_BASIS).filter((k) => !bases.includes(k)), []);
});

/* ========================================================================= C
 *  THE CONSUMER. Only published bytes. One function, and the control re-runs it.
 * ======================================================================= */

/* A CONSUMER THAT HOLDS NOTHING BUT THE ANSWER.
 *
 * This is what makes the claim *"distinguishable by a consumer"* a measurement
 * rather than a shape. It gets ONE argument — the object a reader published —
 * and no access to the row, the store, the op, or this suite's fixtures. It
 * must land on exactly one of THREE verdicts, and the third is the one an
 * absent key alone can never be told from:
 *
 *   BAR        — the run was held to a standard, and here it is, per axis.
 *   NO-BAR     — we looked and there was none, and here is WHICH absence.
 *   UNKNOWN    — this answer does not say. That is a fact about the READER,
 *                not about the run, and a consumer must never report it as if
 *                it were a fact about the run.
 *
 * It holds NO copy of the vocabulary: the sentence arrives with the answer
 * (DEC-8 — a surface renders what it received). It is deliberately blunt about
 * the shape it accepts, because the negative control's arm (2) publishes a key
 * that is present and says nothing, and that must reach UNKNOWN. */
const consumerVerdict = (answer) => {
  const s = answer && typeof answer === "object" ? answer.standard : undefined;
  if (s === undefined || s === null) return { verdict: "UNKNOWN", why: "no standard block was published" };
  if (typeof s !== "object") return { verdict: "UNKNOWN", why: "the standard block is not an object" };
  const basis = typeof s.basis === "string" && s.basis.trim() !== "" ? s.basis : null;
  const stated = typeof s.stated === "string" && s.stated.trim().split(/\s+/).length >= 3 ? s.stated : null;
  if (basis === null || stated === null)
    return { verdict: "UNKNOWN", why: "the block names no basis and carries no sentence" };
  if (s.in_force === true) {
    const p = s.pair;
    if (!p || typeof p !== "object") return { verdict: "UNKNOWN", why: "in force with no pair to read" };
    return { verdict: "BAR", why: stated, capture: p.capture ?? null, connection: p.connection ?? null };
  }
  if (s.in_force === false) return { verdict: "NO-BAR", why: stated, absence: basis };
  return { verdict: "UNKNOWN", why: "the block does not say whether a bar was in force" };
};

console.log("\n--- C. THE CONSUMER: three verdicts off published bytes alone, and UNKNOWN is one ---");
await block("C", async () => {
  const sess = async (run) => ((await GET("airun", `run=${run}`)) || {}).session || {};

  t("ARM C1: a consumer holding only the published bytes reads THE BAR, per axis, and the sentence it "
  + "renders came WITH the answer rather than out of a copy of the vocabulary it holds. UNDER ARM (1) "
  + "OF THE CONTROL — the publication deleted — this same consumer says UNKNOWN, which is the point",
    consumerVerdict(await sess(R.bar)),
    { verdict: "BAR", why: STANDARD_BASIS.recorded, capture: "B", connection: "C" });

  t("ARM C2: THE ARM THIS ITEM EXISTS FOR — the same consumer reads NO-BAR and can say WHICH absence "
  + "it is, which no null and no absent key could have told it",
    [consumerVerdict(await sess(R.noBar)), consumerVerdict(await sess(R.noProject))],
    [{ verdict: "NO-BAR", why: STANDARD_BASIS["none-recorded"], absence: "none-recorded" },
     { verdict: "NO-BAR", why: STANDARD_BASIS["context-has-no-project"], absence: "context-has-no-project" }]);

  t("ARM C3: AND `we did not look` IS THE THIRD VERDICT, NOT A SHADE OF THE SECOND. Handed the same "
  + "answer with the block REMOVED — which is exactly what this reader published before this item — "
  + "the consumer says UNKNOWN and reports nothing about the run",
    (() => { const s = { id: R.bar, status: "running" }; return consumerVerdict(s); })(),
    { verdict: "UNKNOWN", why: "no standard block was published" });

  t("ARM C4: and the NULL-SHAPED publication the negative control arms — a key that is present and "
  + "says nothing — reaches UNKNOWN too, so `present` is not what this consumer trusts",
    [consumerVerdict({ standard: null }).verdict,
     consumerVerdict({ standard: { in_force: false, basis: null, stated: null, pair: null } }).verdict,
     consumerVerdict({ standard: {} }).verdict],
    ["UNKNOWN", "UNKNOWN", "UNKNOWN"]);

  t("ARM C5: POLARITY OVER THE WHOLE SET — five runs, and the consumer separates them into the three "
  + "verdicts with the two absences distinguished inside the middle one",
    await (async () => {
      const out = [];
      for (const k of ["bar", "oneAxis", "noBar", "noProject", "noAxis", "unreadable"]) {
        const v = consumerVerdict(await sess(R[k]));
        out.push(`${v.verdict}${v.absence ? ":" + v.absence : ""}`);
      }
      return out;
    })(),
    ["BAR", "BAR", "NO-BAR:none-recorded", "NO-BAR:context-has-no-project",
     "NO-BAR:names-no-axis", "NO-BAR:unreadable"]);

  t("ARM C6: THERE IS ONE CONSUMER AND ONE PUBLISHER. `#standardForRun` is DEFINED once in the plane "
  + "and both readers CALL it — two computations of *what bar was this run formed under* would be two "
  + "answers to a question that has one, which is the defect this item is about",
    [(STORE.match(/#standardForRun\(row\)\s*\{/g) || []).length,
     (STORE.match(/this\.#standardForRun\(row\)/g) || []).length],
    [1, 2]);
});

/* ========================================================================= X
 *  ONE ROW, TWO READERS, ONE ANSWER — the class, closed for this field.
 * ======================================================================= */
console.log("\n--- X. the two readers of this fact now AGREE, byte for byte, on all six runs ---");
await block("X", async () => {
  const disagreements = [];
  const blk = (o, path) => path.split(".").reduce((x, p) => (x == null ? undefined : x[p]), o);
  for (const k of Object.keys(R)) {
    if (k === "matrix") continue;
    const a = blk(await GET("airun", `run=${R[k]}`), "session.standard");
    const b = blk(await GET("airunspawn", `run=${R[k]}&half=search`), "payload.standard");
    const c = blk(await GET("airunspawn", `run=${R[k]}&half=compose`), "payload.standard");
    if (J(a) !== J(b) || J(a) !== J(c)) disagreements.push({ run: k, airun: a ?? null, search: b ?? null, compose: c ?? null });
  }
  t("ARM X1: op=airun and BOTH halves of op=airunspawn publish the identical block for every run — "
  + "which is what closes *two readers of one row disagreeing about which of its facts exist*",
    disagreements, []);
  t("ARM X2: SEEK GUARD — that comparison ran over six runs and a non-empty block, so ARM X1 is not "
  + "two undefineds agreeing (an equality that costs nothing to produce is not evidence)",
    await (async () => {
      const b = (await GET("airunspawn", `run=${R.bar}&half=search`)).payload.standard;
      return [Object.keys(R).length - 1, Object.keys(b).sort()];
    })(),
    [6, ["basis", "in_force", "pair", "stated"]]);
  t("ARM X3: the RAW column is KEPT beside the judged block, because `agent-worker` builds against it "
  + "— this item is additive on the wire in both directions and removes no field from any consumer",
    await (async () => {
      const p = (await GET("airunspawn", `run=${R.bar}&half=search`)).payload;
      return ["standard_pair" in p, "standard" in p, p.standard_pair];
    })(),
    [true, true, J({ capture: "B", connection: "C" })]);
  t("ARM X4: and the JUDGED block is what the raw column could not be — for the projectless run the raw "
  + "column is `null`, which cannot say WHICH absence it is, and the block beside it can",
    await (async () => {
      const p = (await GET("airunspawn", `run=${R.noProject}&half=search`)).payload;
      return [p.standard_pair, p.standard.basis];
    })(),
    [null, "context-has-no-project"]);
  t("ARM X5: PL-12's FENCE IS UNTOUCHED — the search half still carries NO bias field of any name, and "
  + "publishing the BAR there is deliberate: a bar tells the search what strength the work must reach "
  + "and is not the lens §14 forbids (DEC-54 a)",
    await (async () => {
      const p = (await GET("airunspawn", `run=${R.bar}&half=search`)).payload;
      const top = await GET("airunspawn", `run=${R.bar}&half=search`);
      return [Object.keys(p).filter((x) => /bias|manifest|lens/i.test(x)), "bias" in top];
    })(),
    [[], false]);
});

/* ========================================================================= P
 *  THE DISPOSITION MATRIX — the sweep proper. DECLARED, TOTAL, DRIVEN.
 * ======================================================================= */

/* One run carrying a DISTINCTIVE value in every column a caller can set, then
   CLOSED so the three `stopped_*` columns have values too. A matrix read over a
   run with half its columns null would report `withheld` for facts that were
   simply absent, which is the same false-clean this file exists to refuse. */
const SENTINEL = {
  label: "sentinel-label-zulu-7731",
  mode: "sentinel-mode-yankee-4412",
  claudeRef: "sentinel-ref-xray-9926/claude",
  skill: "investigative-session@sentinel-9.9.9",
  bias: J({ scope: "instance", scope_id: "", statements_sha: "sentinelbiassha0000", bundles: [] }),
  standard: J({ capture: "B", connection: "C" }),
  state: J({ queue: ["sentinel-worklist-quebec-5580"] }),
};

/* THE DECLARED DISPOSITION. A path string means PUBLISHED AT THAT PATH; an
   array means WITHHELD, and the second element is the REASON, which is the part
   that makes the difference between a designed narrowing and a silent one. */
const W = (why) => ["WITHHELD", why];
const MATRIX = {
  aiRunRead: {
    op: "airun", root: "session",
    cells: {
      run: "id", status: "status", label: "label", mode: "mode",
      context_type: "context.type", context_id: "context.id",
      principal_plane: "principal.plane", principal_claude: "principal.claude",
      principal_claude_ref: "principal.ref", skill_version: "principal.skill",
      bias_manifest: "bias.manifest.statements_sha", standard_pair: "standard.pair.capture",
      created: "created", updated: "updated", expires: "expires", ticks: "ticks",
      state: W("the run's RESUMABLE SCRATCH — its own work list, not a fact about the run. "
             + "This is the member-facing read and a work list rendered on a member's screen is "
             + "model working state where the record's own words belong. SEE ARM P6: no reader "
             + "publishes it at all, which is a finding of this sweep and is delegated, not fixed here"),
      stopped_bound: "condition.bound", stopped_condition: "condition.kind", stopped_at: "condition.at",
    },
  },
  aiRunSpawnPayload: {
    op: "airunspawn", root: "payload",
    cells: {
      run: "run", context_type: "context.type", context_id: "context.id", mode: "mode",
      skill_version: "skill", standard_pair: "standard_pair",
      bias_manifest: W("THE FENCE, AS CODE (§14, PL-12). The search half's payload omits the lens BY "
                     + "CONSTRUCTION — there is no field to read. The COMPOSING half carries it, at "
                     + "the envelope and not in the payload, and `bias.test.mjs` owns that assertion"),
      status: W("the spawn contract describes a run a sub-session is being launched INTO, and a "
              + "sub-session does not decide anything from the parent's lifecycle word"),
      label: W("a member's own name for the run. The launch contract carries what the work needs, "
             + "and a display label is not it"),
      principal_plane: W("who PAYS is settled at the parent and is not re-decided by a sub-session; "
                       + "publishing it into a spawn payload would put an identity where the fence "
                       + "is trying to keep the surface narrow"),
      principal_claude: W("as principal_plane"),
      principal_claude_ref: W("as principal_plane, and it is an operator's label besides"),
      created: W("the clock is the parent's. A sub-session that reasoned from the parent's timestamps "
               + "would be deriving a bound nothing granted it"),
      updated: W("as created"), expires: W("as created — the LEASE is the parent's to keep alive"),
      ticks: W("the parent's heartbeat count; a sub-session neither reads nor moves it"),
      state: W("the parent's resumable work list. A sub-session is given ITS work, not the parent's"),
      stopped_bound: W("a spawn payload is built to START work; a run that has already stopped "
                     + "spawns nothing, and the ending belongs to op=airun and op=airunlog"),
      stopped_condition: W("as stopped_bound"), stopped_at: W("as stopped_bound"),
    },
  },
  aiRunLog: {
    op: "airunlog", root: null,
    cells: {
      run: "run", status: "status",
      stopped_bound: "stopped.bound", stopped_condition: "stopped.condition", stopped_at: "stopped.at",
      label: W("the log is what lets anyone else CHECK the run (§11); it answers about the SEARCH, "
             + "and the run's own scalars are op=airun's answer"),
      mode: W("as label"), context_type: W("as label"), context_id: W("as label"),
      principal_plane: W("as label — and REC-30's rule is that the unknown run and the unviewable "
                       + "one read identically, so this answer stays as thin as it can be"),
      principal_claude: W("as principal_plane"), principal_claude_ref: W("as principal_plane"),
      skill_version: W("as label"),
      bias_manifest: W("as label — and the lens is published ONCE, by op=airun, for the reason "
                     + "PL-12 gives: one question, one answer, one computation"),
      standard_pair: W("as bias_manifest — the bar is published ONCE, by op=airun and the spawn "
                     + "contract, and a third spelling would be a third thing to keep in step"),
      created: W("as label"), updated: W("as label"), expires: W("as label"), ticks: W("as label"),
      state: W("the work list; the LOG is the account of where the search went and is a different "
             + "object. §14b.7 resumes from THIS, which is why the log is bounded and ordered"),
    },
  },
};

const dig = (o, path) => path.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o);
const valuesOf = (o, out = []) => {
  if (o == null) return out;
  if (typeof o === "string" || typeof o === "number" || typeof o === "boolean") { out.push(String(o)); return out; }
  if (Array.isArray(o)) { for (const v of o) valuesOf(v, out); return out; }
  if (typeof o === "object") { for (const v of Object.values(o)) valuesOf(v, out); return out; }
  return out;
};

console.log("\n--- P. THE DISPOSITION MATRIX: every stored fact against every publishing reader ---");
await block("P", async () => {
  const started = await open({
    run: R.matrix, label: SENTINEL.label, mode: SENTINEL.mode,
    principalClaudeRef: SENTINEL.claudeRef, skillVersion: SENTINEL.skill,
    biasManifest: SENTINEL.bias, standardPair: SENTINEL.standard,
    state: JSON.parse(SENTINEL.state), bounds: [{ bound: "fetches", allowed: 9, unit: "requests" }],
    /* DISTINCT INSTANTS, and the reason was measured: opening and closing at the
       same timestamp made `created`, `updated` and `stopped_at` one value, and
       the value scan below then reported a leak that was the FIXTURE's making
       and not the plane's. A control that manufactures its own positive is
       worse than no control. */
    at: "2026-08-08T09:11:11Z",
  });
  if (started.started !== true) throw new Error(`matrix run did not start: ${J(started)}`);
  const closed = await POST("airunclose",
    { run: R.matrix, bound: "runtime", condition: "runtime-ceiling-reached",
      at: "2026-08-08T09:22:22Z" });
  if (closed.terminated !== true) throw new Error(`matrix run did not close: ${J(closed)}`);

  const answers = {};
  for (const [reader, spec] of Object.entries(MATRIX)) {
    const raw = await GET(spec.op, `run=${R.matrix}` + (spec.op === "airunspawn" ? "&half=compose" : ""));
    answers[reader] = spec.root ? raw[spec.root] : raw;
    if (!answers[reader]) throw new Error(`${spec.op} answered nothing for the matrix run: ${J(raw)}`);
  }

  /* TOTALITY, BOTH WAYS. A column added tomorrow with no declared disposition
     FAILS here; a disposition naming a column the schema does not have FAILS
     here. Either direction going quiet is how a sweep stops sweeping. */
  const missing = [], extra = [];
  for (const reader of PUBLISHERS) {
    const cells = (MATRIX[reader] || {}).cells || {};
    for (const c of COLUMNS) if (!(c in cells)) missing.push(`${reader}.${c}`);
    for (const c of Object.keys(cells)) if (!COLUMNS.includes(c)) extra.push(`${reader}.${c}`);
  }
  t("ARM P1: THE MATRIX IS TOTAL — every publishing reader owes a disposition for every stored column, "
  + "and a column added to `ai_runs` tomorrow lands here as a FAILURE naming itself",
    [missing, extra], [[], []]);
  console.log(`  corpus: ${PUBLISHERS.length} publishing readers x ${COLUMNS.length} columns `
            + `= ${PUBLISHERS.length * COLUMNS.length} declared cells, driven through `
            + `${PUBLISHERS.length} ops on one run`);

  /* THE PUBLISHED HALF: the declared path RESOLVES to something. A path that
     resolved to `undefined` while the disposition claimed publication is the
     exact defect this item found in `aiRunRead`, so it fails BY NAME. */
  const unresolved = [];
  for (const [reader, spec] of Object.entries(MATRIX))
    for (const [col, disp] of Object.entries(spec.cells)) {
      if (Array.isArray(disp)) continue;
      const v = dig(answers[reader], disp);
      if (v === undefined || v === null || v === "") unresolved.push(`${reader}.${col} -> ${disp}`);
    }
  t("ARM P2: every cell DECLARED PUBLISHED actually resolves on the wire. This is the arm the item's "
  + "own defect would have failed: `aiRunRead.standard_pair` had no path to declare",
    unresolved, []);

  /* THE WITHHELD HALF, TWO LAYERS, AND THE SECOND IS NOT TOTAL — SAID SO.
   *
   * THE THIRD DISPOSITION, AND IT WAS MEASURED RATHER THAN DESIGNED. The first
   * run of this arm reported three leaks and two of them were the INSTRUMENT:
   *   - `aiRunLog.updated` "leaked" because `#aiRunTerminate` writes `updated`
   *     and `stopped_at` from the SAME instant, and `stopped.at` is a cell this
   *     reader legitimately publishes. A value scan cannot tell two columns
   *     apart when they hold one value, and pretending otherwise would have
   *     been an arm reporting a defect that is not there.
   *   - `aiRunLog.context_id` is REAL and is not a defect: the terminal log
   *     entry's `subject` IS `row.context_id` (see `#aiRunTerminate`), so the
   *     value reaches the answer inside a DIFFERENT published object — an
   *     observation — rather than as a fact about the run. It discloses nothing
   *     the gate did not already grant, since this read is gated on that very
   *     column. It is DECLARED below, so it is visible; a leak that arrived
   *     tomorrow would not be on the list and would fail.
   * A surprising result is a finding about the arm. Both are recorded. */
  const INCIDENTAL = {
    "aiRunLog.context_id":
      "the TERMINAL log entry's `subject` is the run's context id, written by `#aiRunTerminate`. It "
    + "arrives as an observation's subject, not as a fact about the run, and the read is gated on that "
    + "same column so it discloses nothing the caller was not already granted.",
  };
  const strongCols = [], weakCols = [], ambiguous = [], leaked = [];
  for (const [reader, spec] of Object.entries(MATRIX)) {
    const published = valuesOf(answers[reader]);
    for (const [col, disp] of Object.entries(spec.cells)) {
      if (!Array.isArray(disp)) continue;
      /* THE REFERENCE VALUE COMES FROM `op=airun`, the reader that publishes the
         most, because a withheld cell has no path of its own to read. A column
         `op=airun` itself withholds has NO reference at all, so it gets the path
         check alone and is counted in `weakCols` — stated rather than skipped
         silently, which is the half of a two-layer check that goes quiet. */
      const own = MATRIX.aiRunRead.cells[col];
      const ref = Array.isArray(own) ? null : dig(answers.aiRunRead, own);
      if (!(typeof ref === "string" && ref.length >= 8)) { weakCols.push(`${reader}.${col}`); continue; }
      /* AND A VALUE THIS READER PUBLISHES UNDER ANOTHER COLUMN IS NOT A LEAK OF
         THIS ONE — it is two columns holding one value, which a value scan
         cannot resolve in either direction. */
      const shared = Object.entries(spec.cells).some(([c2, d2]) =>
        c2 !== col && !Array.isArray(d2)
        && !Array.isArray(MATRIX.aiRunRead.cells[c2])
        && dig(answers.aiRunRead, MATRIX.aiRunRead.cells[c2]) === ref);
      if (shared) { ambiguous.push(`${reader}.${col}`); continue; }
      strongCols.push(`${reader}.${col}`);
      if (published.some((v) => v === ref || v.includes(ref))) leaked.push(`${reader}.${col}`);
    }
  }
  t("ARM P3: every cell DECLARED WITHHELD is measured absent from that reader's answer BY VALUE, and "
  + "the only value that does arrive is the one DECLARED INCIDENTAL with its reason — a leak nobody "
  + "declared would land here as a name",
    leaked.sort(), Object.keys(INCIDENTAL).sort());
  console.log(`  ARM P3 declared INCIDENTAL: ${Object.keys(INCIDENTAL).join(", ") || "(none)"}`);
  console.log(`  ARM P3 reach: ${strongCols.length} withheld cells got the VALUE scan; `
            + `${weakCols.length} got the path check alone (enum-like, short, or itself withheld by `
            + `op=airun so there is no reference to scan for): ${weakCols.join(", ")}; `
            + `${ambiguous.length} are UNRESOLVABLE by value because the reader publishes another `
            + `column holding the identical value: ${ambiguous.join(", ") || "(none)"}`);
  t("ARM P3b: REACH, as a DELTA — the value scan actually reached a substantial share of the withheld "
  + "cells rather than skipping them all and reporting clean",
    strongCols.length >= 12, true);

  /* THE DISAGREEMENTS, NAMED. This is the deliverable: two readers of one row
     disagreeing about which of its facts exist. Naming them is what turns a
     designed narrowing into a decision somebody can review. */
  const publishedBy = {};
  for (const c of COLUMNS)
    publishedBy[c] = PUBLISHERS.filter((r) => typeof MATRIX[r].cells[c] === "string").sort();
  const agreed = COLUMNS.filter((c) => publishedBy[c].length === PUBLISHERS.length);
  const nobody = COLUMNS.filter((c) => publishedBy[c].length === 0);
  const disagreed = COLUMNS.filter((c) => publishedBy[c].length > 0 && publishedBy[c].length < PUBLISHERS.length);
  console.log(`  THE DISAGREEMENTS, NAMED — ${agreed.length} column(s) every reader publishes, `
            + `${disagreed.length} that some do and some do not, ${nobody.length} that NO reader publishes:`);
  for (const c of disagreed) console.log(`    ${c}: published by ${publishedBy[c].join(", ")}`);
  for (const c of nobody) console.log(`    ${c}: published by NOBODY`);

  t("ARM P4: `run` is the only fact all three readers agree exists — every other stored fact is "
  + "published by some readers and not others, which is the CLASS this item swept and is now DECLARED "
  + "rather than merely true",
    [agreed, disagreed.length + nobody.length], [["run"], COLUMNS.length - 1]);

  t("ARM P4b: AND `standard_pair` IS NO LONGER IN THE SILENT SET. Before this item it was published by "
  + "`aiRunSpawnPayload` alone; `aiRunRead` — the member's read — published nothing about it",
    publishedBy.standard_pair, ["aiRunRead", "aiRunSpawnPayload"]);

  /* CORRECTED ON FIRST RUN, AND THE CORRECTION IS THE FINDING RATHER THAN A
     TIDY-UP. This arm was written expecting §11's three conditions to be
     published by the SAME pair of readers, and the matrix said otherwise: the
     bar and the skill version are in `aiRunSpawnPayload`'s PAYLOAD, and the
     manifest is not — it rides the composing half's ENVELOPE, one level up,
     BECAUSE PL-12's fence requires the search half's payload to have no field
     of that name to read. So the three conditions do NOT travel identically,
     and that asymmetry is DESIGNED. Asserted in both halves so the difference
     is measured as the fence rather than mistaken for a second silence. */
  t("ARM P4c: §11's three conditions do NOT travel identically, and the asymmetry is PL-12's fence "
  + "rather than another silence: the bar and the skill version are in the spawn PAYLOAD, and the "
  + "manifest is deliberately absent from it and rides the COMPOSING half's envelope instead",
    await (async () => {
      const search = await GET("airunspawn", `run=${R.matrix}&half=search`);
      const compose = await GET("airunspawn", `run=${R.matrix}&half=compose`);
      return [publishedBy.standard_pair, publishedBy.skill_version, publishedBy.bias_manifest,
              "bias" in search, "bias" in compose, compose.bias.in_force];
    })(),
    [["aiRunRead", "aiRunSpawnPayload"], ["aiRunRead", "aiRunSpawnPayload"], ["aiRunRead"],
     false, true, true]);

  /* ARM P6 — THE SECOND INSTANCE THE SWEEP FOUND, NAMED AND NOT FIXED HERE. */
  t("ARM P6: A SECOND INSTANCE OF THE CLASS, FOUND BY THIS SWEEP AND STATED RATHER THAN SMOOTHED: "
  + "`ai_runs.state` is WRITTEN by `aiRunOpen` and `aiRunTick` and published by NO READER AT ALL. "
  + "`loadCaptureSession` — the model §11 says the run object extends — DOES publish its `state`, and "
  + "`airun.test.mjs`'s ARM P resumes from the LOG rather than from it. It is SCRATCH and not a "
  + "condition, so REC-74's doctrine sentence does not bind it and this item does not change it; the "
  + "resumability question is delegated in CLAIMS.md",
    nobody, ["state"]);
});

/* ========================================================================= G
 *  THE GATE. The new fact must not become a new oracle.
 * ======================================================================= */
console.log("\n--- G. the gate: a fact added to a gated read must not widen what an outsider learns ---");
await block("G", async () => {
  const unknown = await GET("airun", "run=RUN-2026-0808-no-such-run-at-all");
  t("ARM G1: an unknown run answers `found:false` with a NULL session and NO standard block — the new "
  + "fact is inside the session and cannot be read off an answer that has none",
    [unknown.found, unknown.session, "standard" in (unknown || {})], [false, null, false]);
  t("ARM G2: and the spawn contract answers the same nothing, so the fact this item adds cannot be "
  + "used to tell a run that does not exist from one the caller may not see (REC-25/REC-30)",
    await (async () => {
      const s = await GET("airunspawn", "run=RUN-2026-0808-no-such-run-at-all&half=search");
      return [s.found, s.payload, s.half];
    })(),
    [false, null, null]);
  t("ARM G3: the `standard` block names no bundle, no member and no token — it carries the BAR and the "
  + "sentence, and nothing that could identify who set it",
    await (async () => {
      const s = (await GET("airun", `run=${R.bar}`)).session.standard;
      return valuesOf(s).filter((v) => /PROJ-|INQ-|token:|mem-rec74|member:/.test(v));
    })(),
    []);
  t("ARM G4: SEEK GUARD on G3 — the same scan over the whole session DOES find the identifiers, so "
  + "ARM G3 is the block being narrow rather than the scan finding nothing anywhere",
    await (async () => {
      const s = (await GET("airun", `run=${R.bar}`)).session;
      return valuesOf(s).filter((v) => /PROJ-|token:/.test(v)).length > 0;
    })(),
    true);
});

/* ========================================================================= V
 *  THE VOCABULARY: DEC-49's shape, and it is guarded as one.
 * ======================================================================= */
console.log("\n--- V. STANDARD_BASIS is a member-facing vocabulary, and carries member-readable text ---");
t("ARM V1: the five answers, and nothing else — a sixth basis added without a sentence fails here "
+ "before it can reach a member as a machine word",
  Object.keys(STANDARD_BASIS).sort(),
  ["context-has-no-project", "names-no-axis", "none-recorded", "recorded", "unreadable"]);
t("ARM V2: every term carries a PHRASE a member reads instead of the machine word — DEC-49's rule "
+ "reaches these texts, and arm E of `civicos-ui/check-refusal-codes.mjs` is what enforces it",
  Object.entries(STANDARD_BASIS)
    .filter(([k, v]) => typeof v !== "string" || v.trim().split(/\s+/).length < 3 || v.trim() === k),
  []);
t("ARM V3: and it is a VOCABULARY and not a refusal family — this item PUBLISHES a condition and "
+ "refuses nothing, so no C-number is minted and no DEC-49 floor for families or rows moves",
  [/STANDARD_BASIS_CHECKS/.test(STORE), Object.keys(RUN_BOUNDS).length >= 5], [false, true]);
t("ARM V4: the plane holds ONE copy of it — `store.mjs` imports the map rather than restating it, "
+ "which is the same rule `checkCondition` follows for the queue's condition kinds (C-22.4)",
  [/STANDARD_BASIS[,\s]/.test(STORE.slice(0, 20000)),
   (STORE.match(/recorded:\s*"this run was formed under a bar/g) || []).length],
  [true, 0]);

/* D-186: the sandbox goes down, or the battery's own residue assertion fails the
   run — and `hygiene.test.mjs` NAMES any suite that mints a Miniflare and does
   not dispose it. MEASURED HERE THE HARD WAY BEFORE THE BATTERY EVER SAW IT:
   without this line the assertions all finished in seconds and the PROCESS
   never exited, so the first negative-control arm sat against a 300-second
   timeout and looked like a slow subject rather than a leaked worker. */
await mf.dispose();

console.log(`\nrun-conditions: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
