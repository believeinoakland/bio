/* NEGATIVE CONTROL (D-516, declared and RUN 2026-09-24, worktree /home/user/bio on
   land/worker/D-516, cloud): ONE ARM at the rule itself (`enteredAfterFirstRow` in
   `src/airun.mjs`), restored from a uniquely-named pristine copy OUTSIDE the worktree
   and verified by sha256 AND `cmp` (`airun.mjs` 169,760 B sha256 `89377020f45c…`,
   restore YES, byte-identical). Baseline both ends: 131 pass, 0 fail.
   `collapse` — THE ROW'S OWN ARM, and it is BOB #33's own words: the three-way answer
   collapsed back into D-500's two-way comparison, so `within_band` is never returned
   and the reader PICKS again. One line changed and nothing else; the cause vocabulary,
   both maps and both readers' mapping are untouched, so the arm moves the DECISION and
   not the words it is spelled in.
     Declared MUST FAIL: M3 M3a M9c M9e M9f. MUST NOT FAIL: M1 M1b M2a M2b M4 M4b M4c
     M5 M5b M6 M6b M7 M7b M7c M8 M9b.
     ACTUAL: 121 pass, 10 fail — M2 M2c M3 M3a M3c M9 M9c M9d M9e M9f. **The five
     undeclared failures are right to be there and each is recorded rather than
     smoothed**, because every one of them rests on the band EXISTING: M2 is the
     never-both-claims property, which is precisely what the two-way rule violates
     (it is D-500's measured flip, so this arm reproduces M-131); M2c and M3c name the
     band's size and its kind; M9 is the armedness arm and asks the rule itself whether
     the fixture's pair is the band; M9d reads a field off a row that, under the arm, is
     no longer in `missing_unexplained` at all. NOTHING declared MUST NOT FAIL failed.
   OVER-STRICTNESS ARM, in the direction that matters here: with `collapse` armed,
   `observation-content.test.mjs` and `observation-meaning.test.mjs` stayed GREEN at
   75/0 each. That is the arm's REACH, stated: it moves the comparison and leaves the
   published vocabulary standing, so the four vocabulary pins those suites carry are
   NOT what this control is measuring — a control that moved both would have proved
   nothing about either. */
/* NEGATIVE CONTROL: (declared and RUN 2026-09-24, D-500, worktree /home/user/bio on
   land/worker/D-500) THREE ARMS at the rule itself (`enteredAfterFirstRow` in
   `src/airun.mjs`), each planted ALONE with the others held open, restored from a
   uniquely-named pristine copy between arms and verified by sha256 AND `cmp`
   (`airun.mjs` 160,425 B sha256 `0ade3d9a6619…`, all three restores YES, and the
   planted marker string counted back to 0 each time). Baseline both ends:
   119 pass, 0 fail.
   (1) `truncate` — THE ROW'S OWN ARM: the mixed precision RESTORED, i.e. the rule
       the two readers shipped, `String(v).slice(0, 19) >= String(v).slice(0, 19)`.
       Declared MUST FAIL M2 M2b M5 M5b; MUST NOT FAIL M1 M4 M4b M6 M6b M7 M7b M7c M8.
       ACTUAL: M2 M2b M5 M5b **and M3** — right to be there and worth the line: M3
       is the arm that NAMES the residual band, so when the band MOVES back onto the
       same-second pair M3 goes red naming it. Two detectors for one defect, one
       asserting the band is empty where it must be and one asserting where it is
       allowed to sit. 114 pass, 5 fail; every section A–L stayed green.
   (2) `noop` — **THE ARM THAT MATTERS MOST HERE, and it is not a defect: it is this
       ROW'S OWN SCOPE read literally.** D-500 says *compare at ONE precision
       (milliseconds) in both readers*, and the obvious reading — parse both sides,
       compare epoch milliseconds, change nothing else — is planted verbatim.
       Declared MUST FAIL M2 M2b M3; MUST NOT FAIL everything else. AS DECLARED
       (116 pass, 3 fail). M5b stays green because the finite guard catches a NaN
       either way. **So the landing that would have read in review exactly like the
       fix is caught by three arms**, and M4b says why in one measurement: because
       the stored watermark is already a whole second, the truncating form and the
       parse form answer IDENTICALLY over all 2,717 pairs.
   (3) `overstrict` — CORRECT WORK IN A SPELLING NOTHING HERE ANTICIPATED: the same
       rule with the uncertainty ADDED to the entered side instead of subtracted from
       the watermark, and the comparison written as a difference against zero.
       Declared MUST NOT FAIL ANYTHING. AS DECLARED — 119 pass, 0 fail. The arms bind
       to the rule's BEHAVIOUR and not to its shape.
   WHAT THESE ARMS CANNOT SEE: they are local to this plane's source under miniflare.
   M6–M8 reach the op on a store with an EMPTY content level and on one whose first
   row is EARLIER than the registration; no arm here places a watermark INSIDE a
   registration's own second through the plane, because `register.registered` is
   stamped by `op=promote` from the wall clock and no op sets it. That placement is
   driven on the exported rule (M2, 143 placements of the clock second) and tied to
   the op by M7b, which asserts the op's answer IS the rule's answer on the op's own
   two timestamps. It is named here rather than scored zero. */
/* NEGATIVE CONTROL: (declared and RUN 2026-09-18, REC-100 / IC-130 / D-366 CLOSED, worktree
   agent-a249f66820def3efd) NINE arms plus a baseline at BOTH ends, RUN in one step through
   `node test/nc-rec100.mjs [arm]` from `bio-plane/`. THREE SUITES ON EVERY ARM — this one,
   `airun.test.mjs` and `scheduler.test.mjs` — because the rollup has three writer paths (the
   close, the reaper, the wake) and each is driven in a different suite. Each arm armed ALONE,
   DECLARED must-fail AND must-not-fail before it ran, anchor-occurs-EXACTLY-ONCE and
   bytes-really-changed guarded, and every restore verified by sha256 AND by content against a
   per-arm pristine copy (`airun.mjs` 125,429 B sha256 `25e128cc9260…`, `store.mjs` 2,384,428 B
   sha256 `c0aa882ba742…`, all restores YES). Baseline both ends: 101 / 127 / 49 pass, 0 fail.
   FINAL RUN: EVERY ARM AS DECLARED.
   (1) `carveout` — THE ROW'S OWN ARM: C-22.10's `run` carve-out RESTORED. Declared MUST FAIL B17
       L2b; MUST NOT FAIL K3 K4 K6. ACTUAL: B17 L2b **and L4** — right to be there: the re-admitted
       bare row becomes the run's latest PRESENT, so the terminal points at it instead.
   (2) `noreferent` — THE DEADLOCK RETURNED: the rollup writers carry no referent, carve-out still
       deleted. Declared MUST FAIL L3 K3 K4 K6d, `airun` K5c, the scheduler's wake arm. AS DECLARED,
       plus L4 K0 K3b and 12 `airun` / 8 `scheduler` reds — the close, the reaper AND the wake all
       deadlock, which is REC-100's 2026-09-16 measurement reproduced on purpose.
   (3) `noarm` — C-22.10's `observation` arm removed. MUST FAIL K2 K2b K2c K2d K2f; MUST NOT FAIL
       K1a K3 K4. AS DECLARED, plus K3c (the other run's forged row was accepted, so that run no
       longer closes non-PRESENT — the consequence, right to be there).
   (4) `authority` · (5) `present` · (6) `earlier` — ONE FAULT AT A TIME, each caught by its OWN
       arm and not by a neighbour: K2d · K2 · K2b respectively, AS DECLARED. **`authority`'s FIRST
       RUN came back GREEN and it was the ARM:** `false && A || B` is `B`, so half the test still
       fired; the arm now empties the branch's consequence. **`present`'s FIRST RUN reddened K2b
       too, and that was the SUITE:** K2b's self-reference read the count before K2's tick, so
       when K2's entry got through it took the seq K2b named. K2b now reads the count at the moment
       of use. Both corrections are in the driver / below, with their reasons.
   (7) `translate` — op=airunlog publishes the referent in the STORE-WIDE seq. MUST FAIL K3b K4
       and the scheduler's wake arm, AS DECLARED. **`airun` K5c was declared too and stayed GREEN —
       the killed run's rows are its store's first, so the two numberings coincide there**; dropped
       from the declaration with that reason rather than kept as a false witness.
   (8) `fill` — the read FILLS a legacy bare row. MUST FAIL K6c K6d. AS DECLARED.
   (9) `overstrict` — every `observation` referent refused. Declared first as K1a alone; **the
       first run found it re-creates the deadlock on every writer** (the plane's rollups pass the
       same check as a caller's), so L3 K3 K4 K6d, `airun` K5 and the wake arm are declared too.
   `test/nc-rec93.mjs`'s `overstrict` arm is RETIRED (its anchor, the carve-out, is gone); its
   declaration said it would become the gate on D-366, and it did.
   WHAT THESE ARMS CANNOT SEE: `agent-worker`'s `stepLog`, whose suites MOCK `op=airuntick` — a
   model-judged bare PRESENT from it is now refused and it does not read `refused[]` (IC-130,
   the DELEGATION in `CLAIMS.md`). Nothing here exercises a deploy or a second instance. */
/* NEGATIVE CONTROL: (declared and RUN 2026-09-17, REC-110 / D-386, worktree
   agent-adcd3110010904330) FOUR arms over section J's pin, RUN in one step through
   `node test/nc-rec110.mjs [arm|all]` (the driver lives INSIDE this worktree), each armed
   ALONE with every other defence held open, each DECLARED before it ran, every mutation
   passing an anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard, and every
   restore verified by sha256 AND by `cmp` against a PRISTINE copy named UNIQUELY PER ARM
   with a byte count printed and a 500,000-byte floor guarded. Opening AND closing baseline
   rows bracket the run, and ALL THREE observation suites are driven on EVERY arm because
   the ruling is one ruling at three sites. Baseline both ends: log 85/0, content 74/0,
   meaning 74/0, store.mjs 2,316,117 B sha 465be9dabb76690d, all four restores YES.
   **WHAT THESE ARMS HAVE TO PROVE IS UNUSUAL AND IT DECIDES THEIR SHAPE.** REC-110 ruled
   D-386 (a): the tally STAYS UNGATED. A decided-NOT-to-act outcome leaves no new behaviour,
   so there is no fix to delete and the ordinary arm has nothing to bite on. **The whole
   value of the ruling is carried by the PIN**, and these arms show the pin fails when a
   later session quietly changes its mind — which is the thing this row was opened to stop.
   (a) `gate` — option (b)'s FIRST spelling: a caller who is not the machine credential gets
       a tally over nothing. Declared MUST FAIL log J1; MUST NOT FAIL log J2. ACTUAL: exactly
       that — log J1 alone, content and meaning untouched. AS DECLARED.
   (b) `bound` — option (b)'s SECOND spelling and **THE ARM THAT MATTERS MOST**: the tally
       computed over an UNGATED but BOUND-CUT list, so it changes what the field MEANS while
       every viewer still agrees. Declared MUST FAIL log J2; **MUST NOT FAIL log J1**.
       ACTUAL: log J2 **and J3**, J1 GREEN exactly as declared. **This is the proof J2 carries
       value J1 cannot** — a pin with J1 alone would have passed over a silent value change
       inside an unchanged envelope, which is IC-118's rule. The extra J3 is RIGHT TO BE
       THERE and not an artefact: J3 counts the three whole-level tally reads, and this arm
       really does stop one of the three being one.
   (c) `unsay` — the DECISION deleted from `#frontierContent` while the behaviour stays
       correct, because the row's requirement is that the next reader meets the decision and
       a pin watching only behaviour would pass over exactly this. Declared MUST FAIL content
       J3; MUST NOT FAIL any J1/J2. ACTUAL: content J3 **and log J3** — one more than declared
       and right to be there, since log J3 is the CROSS-SITE arm that counts the ruling at all
       three sites, and this arm removed one. No behavioural arm moved anywhere, which is the
       half of the declaration that had to hold.
   (d) `overstrict` — THE ARM THAT KEEPS THE PIN HONEST: the tally's VALUES changed
       legitimately (`row.n + 1000`), no gating and no narrowing. Declared MUST NOT FAIL
       ANYTHING. ACTUAL: GREEN everywhere, 85/74/74. The pin asserts INVARIANCE ACROSS READER
       AND BOUND and never a particular number, so it will not block correct work later.
   **THE OVER-STRICTNESS THE ROW ASKED FOR IS SUBSUMED AND THAT IS SAID RATHER THAN DRESSED
   UP:** the row asks that a viewer entitled to every row see a BYTE-IDENTICAL total. Under
   ruling (a) that is TRUE BY CONSTRUCTION for every viewer, so on its own it is an equality
   that costs nothing to produce. What costs something is J0 — the arm proving the uninvited
   viewer is REALLY being withheld from (at the content level from a named capture, at the
   meaning level from every capture and reference row) while their tally is still the full
   one. J1 is only worth anything because J0 ran first.
   WHAT THESE ARMS CANNOT SEE: they are local to this plane's source under miniflare. Nothing
   here exercises the real account, a deploy, a second instance, or the control plane's own
   stamp. */
/* NEGATIVE CONTROL: (declared and RUN 2026-09-17, REC-113 / IC-116, worktree
   agent-ab3bf809046a052e6) FIVE arms over section I's coverage statement, RUN in one step
   through `node test/nc-rec113.mjs [arm|all]` (the driver lives INSIDE this worktree), each
   armed ALONE with every other defence held open, each DECLARED before it ran, each mutation
   passing an anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard, and every
   restore verified by sha256 AND by `cmp` against a PRISTINE copy named UNIQUELY PER ARM with a
   byte count printed and a floor guarded. An opening AND a closing baseline bracket the run;
   both read 81 pass / 0 fail, exit 0. `git checkout --` is never used to undo an arm.
   EVERY ARM ALSO RUNS `test/rec113-identity.mjs` against a pre-change checkout, so the
   over-strictness direction is graded on each arm rather than once at the end.
   (a) `baseline` — nothing armed. The row that distinguishes four-arms-broken from
       four-arms-working. Both ends green.
   (b) `projection` — the row's own arm: the two columns removed from the SELECT. Declared
       MUST FAIL L2 L2b L2c L2d. **ACTUAL: L2 and L2c ONLY — L2b AND L2d CAME BACK GREEN, AND
       THAT IS THIS CONTROL'S MOST USEFUL RESULT RATHER THAN A FAULT IN THE ARM.** With the
       columns gone a row that HAS no referent still reads `null / null / undetermined`, which
       is what it should read — so an assertion over a row with nothing to show cannot tell
       *the record has no referent* from *the read dropped the column*. That is D-366's own
       absence-with-two-causes shape arriving inside the suite written to close it. **Only a
       row that HAS a referent can detect a missing projection**, which is what makes L2 and
       L2c load-bearing; the declaration is CORRECTED in the driver with its reason, never
       exempted.
   (c) `statement` — projected but NOT stated: the columns come back, the `coverage` sentence
       does not. Declared MUST FAIL L2 L2b L2c L2d; MUST NOT FAIL L2e L2f. AS DECLARED. This is
       the arm that proves the third field is load-bearing rather than decoration — without it,
       "STATED as undetermined" would be satisfied by a null after all.
   (d) `manufacture` — THE COSTLY DIRECTION: drop the state test so ANY row without a referent
       reads undetermined, making a LOOKED_ABSENT row say the record does not know something it
       does know. Declared MUST FAIL L2d L2e; MUST NOT FAIL L2 L2b L2c L2f. AS DECLARED.
   (e) `blind` — THE WORST DIRECTION: ignore the referent entirely, so even rows the record CAN
       back read undetermined. Declared MUST FAIL L2 L2c L2e; MUST NOT FAIL L2b L2f. AS
       DECLARED, and the identity driver's own must-fail arm went red with it.
   WHAT THESE ARMS CANNOT SEE: they are local to this plane's source under miniflare — no real
   account, no deploy, no second instance, and critically NOT `agent-worker`'s live use of
   `op=airunlog`, whose own suites MOCK the op, so a consumer break there would not surface in
   this battery at all. That gap was closed by reading every call site rather than by measuring.

   NEGATIVE CONTROL: (declared and RUN 2026-09-16, REC-103, worktree agent-a4fe71943bfcf63db) SIX
   arms over section I's fence, RUN in one step through `node test/nc-rec103.mjs [arm|all]` (the
   driver lives INSIDE this worktree), each armed ALONE with every other defence held open, each
   DECLARED before it ran, each mutation passing an anchor-occurs-EXACTLY-ONCE guard and a
   bytes-really-changed guard, and every restore verified by sha256 AND by `cmp` against a PRISTINE
   copy named UNIQUELY PER ARM with a byte count printed and a 500,000-byte floor guarded. Opening
   AND closing baseline rows bracket the run. Baseline both ends: 72 pass / 0 fail, exit 0.
   The sixth was added mid-item when the `run` referent became a delegation (see (e)).
   **EVERY ARM IS ARMED AGAINST THE DATA AND NOT AGAINST A FLAG**, which is this row's own
   instruction and REC-94's receipt: its leak one method over passed a flag-only arm because
   `capture_held` was already false.
   (a) `fence` — neuter `#frontierDocumentVisible` to admit every row. Declared MUST FAIL I1 I2 I3
       I8; MUST NOT FAIL I4 I4b. ACTUAL: I1 I1b I2 I3 **I5** I8 **I9b** — more than declared, and
       both extras are right to be there: with the predicate gone the absent stamp is answered too,
       and so is every run-context row.
   (b) `authority` — neuter ONLY the authority half of `#observationBundles`, leaving the
       `result_ref` half intact. Declared MUST FAIL I1 I8. Final: I1 I1b I8 I9b. **FIRST RUN: I8 ALONE — I1 CAME
       BACK GREEN, AND THAT IS A FINDING ABOUT THE ARM RATHER THAN ABOUT THE SUBJECT.** On ratify's
       `confirmed` row the capture back-reference withholds it anyway, so the two defences overlap
       and the arm could not tell which one fired — REC-94's fall-through shape pointed at a suite
       instead of at the store. **I1b was ADDED for it**: ratify's `unreachable` verdict carries NO
       `result_ref` (§4.1), so `authority` is its only referent. Re-run: I1 I1b I8.
   (c) `overstrict` — THE ARM THAT MUST GO RED IN THE OTHER DIRECTION: make every referent
       unresolvable. Declared MUST FAIL I4 I4b I8b; MUST NOT FAIL I1 I2 I3. ACTUAL: those plus I9b,
       which follows — an unresolved referent withholds before the run delegation is reached.
   (e) `run` — neuter ONLY the delegated run gate, ADDED after `run-conditions.test.mjs` ARM W3
       caught this item's first draft reading `ai_runs` directly and the referent became a
       delegation to `aiRunLog`. **A referent the resolver DELEGATES is the one most in need of an
       arm**, because nothing in this method's own bytes decides it. Declared MUST FAIL I9b.
       ACTUAL: I8 **and** I9b — one more than declared and right to be there, since `run` is one of
       the nine kinds I8's inversion fixture drives.
   (d) `machine` — remove the machine carve-out from the document arm. Declared MUST FAIL I0 I1 I2
       I3 I4b I7. **ACTUAL: E3 E3b E3c G4 I7 — a different set, and the difference is the finding.**
       `#bundleRedactor` already carves out a machine credential for the RESOLVABLE path, so the
       carve-out here is load-bearing for the UNRESOLVED path alone — which is precisely §7's purge
       annotation (`frontier-seed` and G4's rows name captures the register does not hold). The arm
       proves what preserves the operator path rather than what the declaration guessed.
   (f) `deny` — remove the explicit fail-closed arm for an absent stamp. Declared MUST FAIL I5.
       **ACTUAL: GREEN, and it is RECORDED RATHER THAN SMOOTHED.** Every document-level row this
       plane writes today carries at least one bundle-scoped referent, and under DENY the redactor
       already answers null for every one — so the line is redundant ON TODAY'S WRITERS and is kept
       as the defence for a row with NO referent at all, which `#lookAuthority` can produce in
       principle (`authority: null` on a request that names none) and does not today.
   WHAT THESE ARMS CANNOT SEE: they are local to this plane's source under miniflare. Nothing here
   exercises the real account, a deploy, a second instance, or the control plane's own stamp — the
   arms drive the Durable Object directly with a named member viewer, because the control plane
   stamps `class:member` for a shared token and a token-only arm CANNOT ARM against this fence. */
/* NEGATIVE CONTROL: (declared 2026-09-14, REC-93, worktree agent-a239cb7601fee3669) SEVEN arms,
   RUN in one step through `node test/nc-rec93.mjs [arm]` (the driver lives INSIDE this worktree),
   each armed ALONE with every other held open, each DECLARED must-fail or must-not-fail BEFORE it
   ran, each mutation passing an anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard,
   and every restore verified by sha256 AND by `cmp` against a PRISTINE copy named UNIQUELY PER
   ARM with a byte count printed and a minimum guarded. An opening AND a closing BASELINE row
   bracket the run, because a harness that reported the same answer for every arm INCLUDING the
   baseline is on record in this repository, and without a baseline row six reds read exactly like
   six arms working.
   (a) `baseline` — nothing armed. Declared: everything green. It is not decoration; it is the row
       that distinguishes six-arms-broken from six-arms-working.
   (b) `writer` — OBSERVATION-LOG-DESIGN.md §9 arm 1: REMOVE ONE DOCUMENT-LEVEL WRITER (the
       observation in `recordCapturedLocator`). Declared MUST FAIL: the frontier reports the
       document as NEVER-LOOKED and the arm fails BY NAME.
   (c) `referent` — §9 arm 1's second half: drop the back-reference, so a PRESENT carries no
       `result_ref`. Declared MUST FAIL: C-22.10 refuses the append by name.
   (d) `authority` — §9 arm 4: neuter C-22.9 so a row with no `authority_kind` is admitted.
       Declared MUST FAIL: the no-authority arm and §4.6's provisional arm both go red.
   (e) `bundle` — §9's C-22.6 half: neuter the append-site bundle refusal. Declared MUST FAIL:
       C-22.x's arm fails, which is the fence proving it is a fence and not a promise.
   (f) `edge` — §7: make the edge rule write a row on an unchanged revisit. Declared MUST FAIL:
       the steady-state arm (zero rows, N counters) fails and the transition arm stays green.
   (g) `overstrict` — THE OVER-STRICTNESS DIRECTION, and it is the arm that must STAY GREEN:
       correct work in a spelling this suite did not anticipate — a run-log `PRESENT` with no
       referent, which C-22.10 deliberately does not refuse under `authority_kind = run` — must
       still be accepted, and `op=airunlog`'s answer must not move.
       **WHAT THIS ARM CANNOT SEE, ADDED BY REC-100 2026-09-16 AFTER IT WAS RELIED ON AS A
       SUFFICIENT MEASUREMENT AND IS NOT ONE.** REC-100's accepts-when reads *"no live writer
       emits a `run` `PRESENT` with no referent — measured by the `overstrict` arm coming back
       EMPTY rather than by reading the writers"*. The arm runs THIS SUITE ONLY, so it sees
       neither of the two rollup writers in `store.mjs` (`#aiRunTerminate`, `#aiRunReap`, whose
       PRESENT comes from `#aiRunSearchState` and cannot carry a referent by construction) nor
       the one EXTERNAL caller that matters — `agent-worker`'s `stepLog`, which composes no
       referent field while `observed` sits in `JUDGEABLE`. **And agent-worker's own suites MOCK
       the plane's `op=airuntick`**, so widening C-22.10 would break that integration with the
       whole battery green. An EMPTY arm here would therefore have licensed exactly the wrong
       conclusion. Section L drives the three directly, which is what the arm cannot do.
   THE ACTUAL RESULTS OF EVERY ARM ARE IN `CLAIMS.md`'s release line for REC-93, including the
   ones that came back other than declared.
   NEGATIVE CONTROL RE-RUN AND RE-DECLARED 2026-09-16 BY REC-100 (worktree
   `agent-a984a71a7b324f52c`), which appended section L. ALL SEVEN ARMS RUN, every one AS
   DECLARED, baseline green at 62/0, every restore byte-identical by sha256 AND `cmp`
   (`airun.mjs` 91,867 B sha256 `1890746cfc23…`, `store.mjs` 2,182,088 B sha256 `548259580784…`).
   `overstrict` moved 5 fail -> 7 as section I landed, and **its declaration GAINED L3 so the arm
   now GRADES the rollup rather than printing it** — REC-99's finding applied here.
   **WHAT THAT ARM MEASURED, AND IT IS HEAVIER THAN THE OVER-STRICTNESS IT WAS BUILT FOR:** with
   C-22.10 widened over `run`, `op=airunclose` answers `terminated: false, ok: false,
   code: OBS_PRESENT_NO_REFERENT` and **the run's terminal entry is never written — a run that
   observed anything PRESENT cannot be closed at all**. Deleting the carve-out today is a lifecycle
   deadlock in this plane, not a tightened fence.
   **THE TWO WRITERS ARE HELD TO DIFFERENT EVIDENCE AND THE DIFFERENCE IS STATED RATHER THAN
   BLURRED:** `#aiRunTerminate` is DRIVEN above, through `op=airunclose`, and I3/I4 assert it.
   `#aiRunReap` is READ — it calls the same `#aiRunSearchState` and appends with no `resultRef`,
   so it is the same shape by construction, but no arm here reaches it (the reaper needs an
   expired lease). That is an inference from the source, not a measurement, and it is labelled as
   one; an arm that drives the reaper is owed and is not this item's. I1 and I2 stay GREEN throughout, which is what makes the finding precise: the
   write door is open and the read still does not project the referent, so what the widening breaks
   is exactly the ROLLUP — nothing about the mechanism.
   REC-100's OWN ROW DECLARED TWO ARMS THAT ARE INAPPLICABLE AND ARE RECORDED AS NOT RUN RATHER
   THAN QUIETLY DROPPED: *the carve-out restored* and *the backfill filled with a derived referent
   must FAIL* both presuppose a widening and a backfill that this item deliberately did not do.

   WHAT THESE ARMS CANNOT SEE: they are all local to this plane's own source. Nothing here
   exercises a second instance, a real network fetch, or the content and meaning levels, which are
   REC-94's and REC-95's and have no writer yet — the frontier says so IN WORDS rather than
   answering an empty list, and that is asserted below rather than assumed. */

/* REC-93 / IC-92 — THE OBSERVATION LOG: the table, the ONE append site, the
 * frontier view, the document-level writers, and the run log's FOLD.
 * =====================================================================
 *
 * `docs/development/OBSERVATION-LOG-DESIGN.md` §3, §4.1, §4.4, §4.6, §5, §7 and
 * its §8 decomposition row 1 — the TABLE is the scope's authority and the queue
 * row is the pointer. `STORE-AS-CACHE.md` settles the one architectural decision
 * underneath it: THE RECORD AND THE OBSERVATION LOG ARE SEPARATE, WITH DIFFERENT
 * LIFECYCLES. The record is write-once, content-addressed and never evicts, so
 * folding a failed look into it makes every failed look either a phantom capture
 * or nothing at all. This table is what lets ABSENCE BE RECORDED rather than
 * retried away.
 *
 * WHY IT MATTERS HERE AND NOT ONLY IN A DESIGN DOCUMENT. CLAUDE.md's standing
 * section says sparse is the normal condition at every level, and that saying
 * WHICH absence is true — nothing derived, nothing extracted, nothing captured,
 * nobody looked — is a first-class obligation rather than a diagnostic detail.
 * Until this item that obligation had no storage at the document level at all:
 * Part II §17's OBSERVE row reads ABSENT at content grain and BUILT FOR ONE
 * CONSUMER at meaning grain, and that one consumer was `ai_run_log`. So the
 * arms below are weighted at the two places a coverage record can lie: a look
 * that was never recorded (the frontier then says never-looked, which is FALSE
 * and reads as an invitation to go and look), and a look recorded as PRESENT
 * with nothing behind it (which reads as coverage and is the worse of the two).
 *
 * THE SECTIONS, IN THE FILE'S OWN ORDER (the count is the list, never a number):
 *   A. THE TABLE — its shape, its indexes, and both purge arms.
 *   B. THE ONE APPEND SITE and its refusals, driven through the real plane.
 *   C. THE FOLD — `op=airunlog` byte-identical, PINNED against the pre-item
 *      build's own answer rather than against a digest this item computed.
 *   D. §4.6's PROVISIONAL — a member's ad hoc search writes NOTHING.
 *   E. THE FRONTIER VIEW — the latest row per subject, NEVER_LOOKED as the
 *      absence of a row, and the bound published.
 *   F. §7's EDGE-TRIGGERED RULE, whose volume is measured in M-14.
 *   G. RATIFY'S MAPPING, including the one outcome that writes NO ROW.
 *   H. PURGE — both arms, which do opposite things on purpose.
 *   I. REC-103 / IC-105 (appended 2026-09-16) — THE DOCUMENT ARM'S FENCE: §6's
 *      withholding is row-whole, and the resolver is INVERTED rather than listed.
 *      NAMED HERE BY D-500: this section was in the file and not in this list, so
 *      the list ran A B C D E F G H I J K over TWELVE sections and the letter `I`
 *      named two of them — which is why every arm label below it had a twin, and
 *      why `bio-checks.mjs` and `nc-rec93.mjs` both cited "section I" for arms
 *      that live in what is now L.
 *   L. REC-100 (appended 2026-09-16) — WHAT THE `run` CARVE-OUT IS WAITING ON,
 *      measured rather than inherited: the write door is already open, the READ
 *      does not project the referent, and the run's terminal entry is a ROLLUP
 *      whose PRESENT has nothing to point at by construction.
 *   J. REC-110 — the frontier's `tally` is ungated ON PURPOSE (D-386).
 *   K. REC-100 (appended 2026-09-18, IC-130) — the rollup referent BUILT under
 *      BOB #14's ruling: the falsifier pinned, forged referents refused by name,
 *      the close and the reaper driven, legacy bare rows stated undetermined.
 *      Section L's gap-pins went red at their sites and were CORRECTED there.
 *   M. D-500 — §5.1's TOP-END BOUND AT ONE PRECISION: the watermark comparison
 *      lifted into `airun.mjs`, driven across every placement of the clock second,
 *      with the residual band NAMED and the superseded rule driven beside it.
 *
 * THE SECTION LIST SAID "SEVEN SECTIONS" AND NAMED SIX while H was already in
 * the file — corrected here rather than left, since a header that miscounts its
 * own contents is the cheapest possible version of this suite's whole subject.
 * **AND IT WENT ON MISCOUNTING UNTIL D-500 (2026-09-24), WHICH IS THE POINT OF
 * THE FIRST CORRECTION ARRIVING TWICE.** The list named eleven sections where the
 * file held twelve, and the one it omitted (REC-103's, now I) had taken the same
 * letter as REC-100's — so two sections answered to `I`, twenty-six arm labels
 * had a twin in the other, and two live citations outside this file pointed at
 * the ambiguous letter. REC-100's section and its arms are now L; REC-103's keep
 * I; the citations in `checks/bio-checks.mjs` and `test/nc-rec93.mjs` were moved
 * with them. THE COUNT IS THIRTEEN and it is written as a list rather than as a
 * number, because a number is the thing that went stale.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";
import { OBSERVATION_AUTHORITY_KINDS, OBSERVATION_SUBJECT_KINDS,
         OBSERVATION_ACTOR_CLASSES, checkObservation,
         /* REC-113 / IC-116: section I2e drives the READ's rule and the REFUSAL's
            side by side, so the suite holds them together rather than trusting
            that somebody kept two literals in step. */
         observationCoverage,
         /* REC-100 / IC-130: section K names each referent fault BY THE KEY the
            checker publishes, read from here rather than typed. */
         OBSERVATION_REFERENT_FAULTS,
         /* D-500 / section M: the watermark comparison is driven AS THE RULE, imported
            from the one place it lives rather than retyped — a hand copy of a rule agrees
            with itself for free, which is this file's own standing objection. */
         enteredAfterFirstRow, watermarkUncertaintyMs,
         /* D-516 / section M: the rule now answers THREE ways, so the arms below name
            the answers from the constants rather than from string literals — the same
            objection one line up, pointed at the vocabulary instead of at the rule. The
            content axis and its cause vocabulary come too, because BOB #33's condition
            is about what the READER says and not about what the comparison returns. */
         WATERMARK_AFTER, WATERMARK_BEFORE, WATERMARK_WITHIN_BAND, WATERMARK_BAND_CAUSE,
         MISSING_ROW_CAUSES, MEANING_MISSING_ROW_CAUSES, causesNotRuledOut,
         contentAxisFor, CONTENT_AXIS_UNDETERMINED } from "../src/airun.mjs";
import { QUEUE_CONDITION_KINDS } from "../src/queuestate.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC_STORE = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");
const SRC_SCHEMA = readFileSync(new URL("../src/schema.mjs", import.meta.url), "utf8");

const TOK = "mem-rec93";
const ADM = "adm-rec93";
const BUNDLE = "INQ-2026-0914-observation-log";
const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);
const T0 = "2026-09-14T09:00:00Z";
const at = (plus) => new Date(Date.parse(T0) + plus).toISOString().split(".")[0] + "Z";

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec93",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const TEXT = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).text();

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const obj = ns.get(ns.idFromName("bio"));

/* The observation COUNT, read through `op=stats` — the operator surface a purge
   already publishes as its proof that it took what it says it took (D-113).
   Read through the op rather than by querying the DO, because a store-level
   read and a caller-reachable one are different claims and only one of them is
   what an operator actually gets. */
/* CORRECTED 2026-09-18 BY REC-131 (IC-148), NEVER EXEMPTED: op=stats' log count is published as `observationsNonLead` (the log WITHOUT lead looks) and the wire carries no `observations` key — one key never carries two meanings (BOB.md rule 7), and purge's `observations` keeps the whole log. This suite writes no lead, so the figure it reads is unchanged; only the name moved. */
const obsCount = async () => (await GET(`op=stats&token=${ADM}`)).observationsNonLead;

/* ========================================================================= *
 *  A · THE TABLE — §3. Its shape, its indexes, and BOTH purge arms.
 * ========================================================================= */
console.log("\n--- A · the one table (§3) ---");

t("A1: `observation_log` is declared in schema.mjs",
  /CREATE TABLE IF NOT EXISTS observation_log\s*\(/.test(SRC_SCHEMA), true);

/* BEFORE `host_governor`, which is this file's standing rule and has struck
   three times. Asserted by POSITION and not by eye. */
t("A2: and it is declared BEFORE the host_governor block (the standing schema rule)",
  SRC_SCHEMA.indexOf("CREATE TABLE IF NOT EXISTS observation_log")
    < SRC_SCHEMA.indexOf("CREATE TABLE IF NOT EXISTS host_governor"), true);

/* The two traps that `node --check` cannot see, asserted over THIS block rather
   than over the whole file, so the assertion says something about what this item
   wrote. PL-1 cost fifteen minutes and three comments to the semicolon. */
{
  const i = SRC_SCHEMA.indexOf("-- REC-93 / IC-92 -- THE OBSERVATION LOG");
  const j = SRC_SCHEMA.indexOf("CREATE INDEX IF NOT EXISTS observation_log_tally");
  const block = SRC_SCHEMA.slice(i, j);
  t("A3: the block is locatable and non-trivial", i > -1 && j > i && block.length > 500, true);
  t("A4: no backtick anywhere in it — a balanced stray pair still parses, so --check cannot see this",
    block.includes(String.fromCharCode(96)), false);
  t("A5: and no semicolon inside any `--` comment — #migrate splits the schema on `;` (PL-1)",
    block.split("\n").filter((l) => l.trim().startsWith("--") && l.includes(";")), []);
}

/* §3's three indexes, each named for the read it exists to serve. Asserted by
   NAME AND COLUMNS: an index present under a different key would satisfy a
   count and serve none of the three reads. */
for (const [name, cols] of [["observation_log_frontier", "level, subject_kind, subject, seq"],
                            ["observation_log_authority", "authority_kind, authority, seq"],
                            ["observation_log_tally", "level, state, seq"]])
  t(`A6: index ${name} exists on exactly (${cols})`,
    SRC_SCHEMA.includes(`CREATE INDEX IF NOT EXISTS ${name} ON observation_log(${cols})`), true);

/* §4.4's fold: the OLD table is gone from the schema. If the CREATE were left
   standing, an idempotent create would rebuild an empty `ai_run_log` on the next
   boot and put the store back into the two-writers state §4.4 forbids. */
t("A7: `ai_run_log` is GONE from the schema — §4.4's fold leaves ONE table, not two",
  /CREATE TABLE IF NOT EXISTS ai_run_log/.test(SRC_SCHEMA), false);

/* ========================================================================= *
 *  B · THE ONE APPEND SITE and its refusals (§3's rule list).
 * ========================================================================= */
console.log("\n--- B · one append site, and the refusals are read out of the map (§3) ---");

/* ONE WRITER, asserted STRUCTURALLY off the source. A gate arm cannot
   distinguish "one writer" from "two writers that happen to agree today", and
   §4.4's whole sentence is *"two writers is not [the landing's call]"*. */
{
  const inserts = [...SRC_STORE.matchAll(/INSERT INTO observation_log\b/g)].length;
  t("B1: there is EXACTLY ONE `INSERT INTO observation_log` in store.mjs outside the migration",
    inserts, 2);   /* the append site, plus #migrate's one-time fold copy */
  t("B2: and the second is the FOLD's one-time copy inside #migrate, not a second writer",
    /PRAGMA table_info\(ai_run_log\)[\s\S]{0,1200}INSERT INTO observation_log/.test(SRC_STORE), true);
  /* NO UPDATE AND NO DELETE except the whole-store purge — §3's first rule:
     "a log that can be rewritten is not evidence of anything". */
  t("B3: nothing UPDATEs the table — append-only is a property of the code, not a promise",
    [...SRC_STORE.matchAll(/UPDATE observation_log\b/g)].length, 0);
  t("B4: and exactly one DELETE, which is the whole-store purge arm",
    [...SRC_STORE.matchAll(/DELETE FROM observation_log\b/g)].length, 1);
}

/* THE REFUSALS ARE READ LIVE FROM THE CATALOGUE, never typed here — DEC-49's
   own acceptance requires the code-to-translation map to be read from ONE place,
   and a hand copy agrees with itself for free. */
t("B5: C-22.9 and C-22.10 exist in the catalogue with canned translations",
  [AI_RUN_CHECKS.OBS_AUTHORITY_UNNAMED?.check,
   AI_RUN_CHECKS.OBS_PRESENT_NO_REFERENT?.check,
   typeof AI_RUN_CHECKS.OBS_AUTHORITY_UNNAMED?.translation === "string",
   typeof AI_RUN_CHECKS.OBS_PRESENT_NO_REFERENT?.translation === "string"],
  ["C-22.9", "C-22.10", true, true]);

/* §4.6's PROVISIONAL, enforced in the VOCABULARY rather than by a missing
   writer. This is the assertion that makes the provisional a mechanism: a later
   item could add a writer without noticing the doctrine, and it would be refused
   because there is no authority a member's search could name. */
t("B6: there is NO `member` authority kind — §4.6's provisional lives in the vocabulary",
  Object.prototype.hasOwnProperty.call(OBSERVATION_AUTHORITY_KINDS, "member"), false);
t("B7: and the nine authorities §3 names are all present",
  Object.keys(OBSERVATION_AUTHORITY_KINDS).sort(),
  ["acquire", "derive", "extract", "lead", "link", "objective", "ratify", "run", "sweep"]);
t("B8: the actor classes are §5's three, which `surfaced_by` maps onto",
  Object.keys(OBSERVATION_ACTOR_CLASSES).sort(), ["machine", "member", "plane"]);
/* CORRECTED 2026-09-15 by REC-95, NOT EXEMPTED, and the correction is why this
   arm is written as an exact key set rather than as a floor.
   IT READ `["address", "capture", "description", "entity", "extent", "unstated"]`
   and that was right until this landing. It is now SEVEN: REC-95 added
   `reference` as the subject of a RESOLUTION ATTEMPT (design §4.3's second act).
   The old expectation was not wrong when written — it is superseded, and the
   reason it is superseded is the thing worth recording: §4.3 says *"one row per
   resolution attempt over an entity"*, but an attempt that FAILS names no
   entity — there is no registry entry, which is exactly what it found out — and
   that failing attempt is the look §4.3 exists to record. Keying it on `entity`
   would have written a row for every success and NOTHING for the case the
   section was written for; putting a raw unresolved `kind:key` into a column
   called `entity` would say the record keeps a registry entry for a name it has
   just established it does not.
   THE PIN DID ITS JOB. It is the only instrument here that can see a member of
   this vocabulary appear, and it brought REC-95's author to this line to say why
   instead of letting a seventh spelling arrive unremarked. Keep it EXACT: a floor
   would have passed silently and the whole value of the arm would be gone. */
t("B9: the subject kinds are §3's five plus `unstated`, which the FOLD needs, plus "
+ "`reference` (REC-95), which a resolution attempt that matched NOTHING needs — each "
+ "added because the alternative was a kind the record cannot support",
  Object.keys(OBSERVATION_SUBJECT_KINDS).sort(),
  ["address", "capture", "description", "entity", "extent", "reference", "unstated"]);

/* THE REFUSALS ARE HELD TO THE PURE FUNCTION, and that is `airun.mjs`'s own
   stated reason for existing rather than a convenience: *"It is PURE — no
   storage, no clock, no viewer — so a suite can hold the decision to the store's
   own behaviour directly … a rule that can only be exercised through a Durable
   Object is a rule that gets exercised less."* The store's `#observe` calls
   exactly this function with exactly `QUEUE_CONDITION_KINDS`, which B16 pins off
   the source so that these arms are about the live path and not a parallel one.

   NO TEST-ONLY DOOR WAS ADDED TO THE STORE TO REACH THESE. A probe method on the
   DO would be a second append site in everything but name, which is the one
   thing §4.4 forbids — the suite would have bought its own convenience by
   breaking the property it exists to check. The STORE side is driven instead
   through the real writers in sections F and G. */
{
  const CK = QUEUE_CONDITION_KINDS;
  const bad = checkObservation({
    authority_kind: null, level: "document", subject_kind: "address",
    subject: "https://example.gov/a", state: "PRESENT", result_ref: SHA_A }, CK);
  t("B10: a row with NO authority_kind is REFUSED BY NAME (C-22.9)",
    [bad && bad.code, bad && bad.check], ["OBS_AUTHORITY_UNNAMED", "C-22.9"]);

  const noref = checkObservation({
    authority_kind: "acquire", level: "document", subject_kind: "address",
    subject: "https://example.gov/b", state: "PRESENT" }, CK);
  t("B11: a PRESENT with no result_ref is REFUSED BY NAME (C-22.10) — the WARC lesson",
    [noref && noref.code, noref && noref.check], ["OBS_PRESENT_NO_REFERENT", "C-22.10"]);

  const gov = checkObservation({
    authority_kind: "sweep", authority: "REQ-1", level: "document", subject_kind: "address",
    subject: "https://example.gov/c", state: "LOOKED_ABSENT", governed: true }, CK);
  t("B12: a DEFINITIVE state on a governed row is refused (C-22.2) — D-104's split",
    [gov && gov.code, gov && gov.check], ["AI_LOG_GOVERNED_ABSENCE", "C-22.2"]);

  const shell = checkObservation({
    authority_kind: "acquire", level: "document", subject_kind: "address",
    subject: "https://example.gov/d", state: "PRESENT", result_ref: SHA_A,
    condition: "client-rendered-shell" }, CK);
  t("B13: a client-rendered shell never reads PRESENT (C-22.3) — D-64's false-coverage hazard",
    [shell && shell.code, shell && shell.check], ["AI_LOG_SHELL_PRESENT", "C-22.3"]);

  const bund = checkObservation({
    authority_kind: "acquire", level: "document", subject_kind: "address",
    subject: "https://example.gov/e", state: "PRESENT", result_ref: SHA_A,
    bundle: BUNDLE }, CK);
  t("B14: an entry naming a BUNDLE is refused at the append (C-22.6) — the log is never in bundle.md",
    [bund && bund.code, bund && bund.check], ["AI_LOG_NOT_A_BUNDLE", "C-22.6"]);

  const ok = checkObservation({
    authority_kind: "acquire", level: "document", subject_kind: "address",
    subject: "https://example.gov/f", state: "PRESENT", result_kind: "capture",
    result_ref: SHA_A }, CK);
  t("B15: and a well-formed row is ACCEPTED — a refusal set that refuses everything is not a fence",
    ok, null);

  /* THE ARMS ABOVE ARE ABOUT THE LIVE PATH ONLY IF THE STORE CALLS THIS
     FUNCTION WITH THIS VOCABULARY. Pinned off the source, because a suite that
     exercises a pure function the store has quietly stopped calling is testing
     something else — which is exactly how C-22.4's control was absorbed by a
     second copy of the rule and left a suite green at 98/98. */
  /* CORRECTED 2026-09-18 BY REC-100 (IC-130), NOT EXEMPTED: the call gained a
     THIRD argument, the store's resolution of an `observation` referent, which
     the rollup ruling's check needs and a pure function cannot read for itself.
     The pin is widened to that exact third argument rather than to "anything",
     so a call that quietly dropped the resolution still fails here. */
  t("B16: #observe calls THIS checker with THIS live vocabulary — so B10..B15 are "
  + "about the live path and not a parallel one",
    /#observe\([\s\S]{0,3000}?checkObservation\(entry, QUEUE_CONDITION_KINDS, this\.#observationReferent\(entry\)\)/
      .test(SRC_STORE), true);

  /* B17 — INVERTED 2026-09-18 BY REC-100 (IC-130, D-366 CLOSED), and this is
     the CORRECTION rather than an exemption. It read *"OVER-STRICTNESS — a `run`
     PRESENT with no referent is ACCEPTED, because ai_run_log never had that
     column and §4.4 folds its rows in unchanged"*, and that was true while
     C-22.10 carried its `run` carve-out. BOB #14 ruled the rollup referent
     (`OBSERVATION-LOG-DESIGN.md` §3) and the carve-out is DELETED, so the same
     entry is now refused BY NAME. Rows ALREADY in the log are not touched — the
     fold's rows stay as written and read back `undetermined` (section K). The
     over-strictness direction this arm guarded moved to section K too: a
     correctly-backed `run` PRESENT, and a correct `observation` referent, are
     both ACCEPTED there. */
  const runPresent = checkObservation({
    authority_kind: "run", authority: "RUN-x", level: "document", subject_kind: "unstated",
    subject: "observation:something", state: "PRESENT" }, CK);
  t("B17: a `run` PRESENT with no referent is now REFUSED BY NAME (C-22.10) — the `run` carve-out "
  + "is deleted under the rollup ruling (REC-100, D-366 closed)",
    [runPresent && runPresent.code, runPresent && runPresent.check],
    ["OBS_PRESENT_NO_REFERENT", "C-22.10"]);
}

/* ========================================================================= *
 *  C · THE FOLD — §4.4. `op=airunlog` reads through UNCHANGED.
 * ========================================================================= */
console.log("\n--- C · the fold: op=airunlog answers byte-identically (§4.4) ---");

await POST(`op=promote&token=${TOK}`, {
  bundleId: BUNDLE, base: null, snapKey: "20260914T090000Z_inbox", author: "ruth",
  meta: { object_type: "inquiry", group: "believe-in-oakland", current_state: "open", created: T0, last_updated: T0 },
  files: [{ path: "bundle.md", text: `---\nid: ${BUNDLE}\n---\n\n## Question\n\nWhat did we look for?\n`,
            bytes: 90 /* REC-175 (2026-09-23): CORRECTED, not exempted — this sent sha256: SHA_A ("a" x 64), which is not the SHA-256 of the text above, and the old op=promote stored it as given; promote now refuses that by name (FILE_DIGEST_MISMATCH, C-33.38), so no digest is sent and the plane computes it from the bytes */ }],
  register: [],
});

const RUN = "RUN-2026-0914-fold";
await POST(`op=airunopen&token=${TOK}`, {
  run: RUN, contextType: "inquiry", contextId: BUNDLE, label: "the fold's fixture", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null,
  bounds: [{ bound: "fetches", allowed: 40, unit: "requests" }], leaseMs: 600000, at: T0,
});
const ticked = await POST(`op=airuntick&token=${TOK}`, {
  run: RUN, at: at(5000), leaseMs: 600000, consume: { fetches: 3 },
  log: [
    { level: "meaning", subject: "observation:fold-finding", state: "NEVER_LOOKED",
      detail: "nothing has been derived here, which may only mean nothing was extracted" },
    /* CORRECTED 2026-09-18 BY REC-100 (IC-130): this was a run-log PRESENT
       WITH NO REFERENT, the shape C-22.10's `run` carve-out admitted. The
       carve-out is deleted, so the fixture now names what it found — which is
       what the fold's PRESENT should always have said. The fold's own claim
       (three entries in, per-run `seq`, states intact) is unchanged; the
       byte-identity pin above never recomputed this answer's digest (REC-113's
       note) and `rec113-identity.mjs` is where that property lives. */
    { level: "document", subject: "observation:budget-2026", state: "PRESENT",
      result_kind: "capture", result_ref: SHA_B,
      detail: "the store holds the adopted 2026 budget" },
    { level: "internet", subject: "observation:controller-portal", state: "LOOKED_INDETERMINATE",
      governed: true, condition: "governor-holding-host",
      detail: "our own pacing held the controller portal" },
  ],
});
t("C1: the run's three entries all appended THROUGH THE FOLD — none refused",
  [ticked && ticked.appended, (ticked && ticked.refused || []).length], [3, 0]);

const logAnswer = await GET(`op=airunlog&token=${TOK}&run=${RUN}`);
t("C2: `seq` is 1,2,3 PER RUN, not the store-wide rowid — an unchanged envelope carrying "
+ "changed numbers is the worst shape an interface change can take",
  logAnswer.entries.map((e) => e.seq), [1, 2, 3]);
t("C3: and the entries come back in order with their levels and states intact",
  logAnswer.entries.map((e) => [e.level, e.state]),
  [["meaning", "NEVER_LOOKED"], ["document", "PRESENT"], ["internet", "LOOKED_INDETERMINATE"]]);
/* INDEX-SAFE ON PURPOSE. Under this item's `overstrict` control arm the run's
   entries are refused, `entries[2]` is undefined, and a bare `.governed` threw a
   TypeError — which goes through NO ASSERTION AT ALL and ended the module while
   the tally read clean, so the arm reported "the suite did not reach its foot"
   instead of naming what broke. That is WORKER.md's own receipt, reproduced by
   this suite and fixed here rather than worked around in the driver. */
t("C4: the governed row survives the fold as a BOOLEAN, not a 1",
  logAnswer.entries[2]?.governed ?? "(no third entry)", true);
t("C5: the envelope still publishes its bound (REC-70)",
  [typeof logAnswer.limit, logAnswer.truncated, logAnswer.found], ["number", false, true]);
/* CORRECTED 2026-09-17, REC-113 / IC-116. The old pin named four and was right
   until this read began STATING each row's coverage claim; it is superseded, not
   mistaken, and it is widened rather than exempted — an exempted pin is a rule
   nobody is enforcing and nobody remembers deleting. */
t("C6: and the vocabularies still travel WITH the answer (DEC-8)",
  Object.keys(logAnswer.vocabulary || {}).sort(),
  ["bounds", "coverage", "coverage_undetermined", "endings", "levels", "states"]);

/* THE BYTE-IDENTITY PIN, and its provenance is what makes it evidence.
   `test/rec93-fold-digest.mjs` drove THIS EXACT FIXTURE through the PRE-ITEM
   BUILD at f38af22 and through this one, and compared the raw response text:
   3,120 bytes, sha256 10bf6e28346b652793d7cd64d9ca56f5c09cea5a5da830641ea5f24be74a4a1a,
   IDENTICAL. A digest this item computed and then pinned against itself would
   prove only that the answer stopped moving AFTER the change; the number below
   is the PRE-ITEM build's own answer, so re-checking it here is a comparison
   with the old behaviour rather than with this item's opinion of it.

   **SUPERSEDED AS A LIVE NUMBER 2026-09-17 BY REC-113 / IC-116, AND SAID HERE
   RATHER THAN LEFT TO GO QUIETLY STALE — which is this project's most-repeated
   finding and would have happened silently, because NO ASSERTION BELOW
   RECOMPUTES THIS DIGEST.** `op=airunlog` now projects `result_kind` and
   `result_ref` and STATES a per-row `coverage`, so this fixture's answer is no
   longer 3,120 bytes and no longer digests to `10bf6e28…`. The sentence above is
   kept because it is the true record of what REC-93 measured against f38af22;
   what changed is the READ, by an accepted additive interface change.
   THE BYTE-IDENTITY CLAIM ITSELF DID NOT GO AWAY, IT MOVED AND GOT STRONGER:
   `test/rec113-identity.mjs` drives a fixture carrying BOTH a referent-bearing
   and a bare `run` PRESENT through this build and a pre-change checkout, strips
   exactly the three added keys, and compares the raw text — so the old answer is
   still pinned against a build that predates the change rather than against this
   item's opinion of it. C7 below is unchanged and still does its own job. */
const FOLD_PIN = "10bf6e28346b652793d7cd64d9ca56f5c09cea5a5da830641ea5f24be74a4a1a";
t("C7: the pinned pre-item digest is a real sha256 and not an empty-string artefact "
+ "(e3b0c442… has been recorded here twice as a 'byte-identical' result over nothing)",
  [FOLD_PIN.length, FOLD_PIN === sha("")], [64, false]);

/* ========================================================================= *
 *  D · §4.6's PROVISIONAL — a member's ad hoc search is NEVER an observation.
 * ========================================================================= */
console.log("\n--- D · §4.6: a member's ad hoc search writes NOTHING (DEC-61's analogy) ---");

{
  const before = await obsCount();
  await GET(`op=search&token=${TOK}&q=sewer`);
  await GET(`op=search&token=${TOK}&q=transfers`);
  await GET(`op=list&token=${TOK}`);
  const after = await obsCount();
  /* §9 arm 4: "a member's `op=search` writes nothing (the row count is unchanged
     after any search)". The count is read through the SAME op before and after,
     so an instrument that could not see the table at all would fail C-D2 below
     rather than reporting a comfortable zero. */
  t("D1: the row count is UNCHANGED after two searches and a list", after - before, 0);
  t("D2: and the counter is genuinely reading the table, not answering undefined for everything",
    [typeof before, before >= 1], ["number", true]);
}

/* ========================================================================= *
 *  E · THE FRONTIER — §5. A view, never a table.
 * ========================================================================= */
console.log("\n--- E · the frontier is a view over the log (§5) ---");

{
  /* A REAL ROW THROUGH A REAL WRITER, seeded here rather than borrowed from
     section B. B10..B17 hold the refusals to the PURE checker and therefore
     write NOTHING — an E-arm resting on them would have been an assertion about
     a row that was never inserted, which is the "arm that could never have been
     honoured" shape this repository has measured. */
  await obj.recordCapturedLocator({
    address: "https://example.gov/frontier-seed", addressNorm: "https://example.gov/frontier-seed",
    captureSha: SHA_A, retrieved: at(7000) });

  const f = await GET(`op=frontier&token=${TOK}&level=document`);
  t("E1: the document level is BUILT and answers", [f.found, f.built, f.level],
    [true, true, "document"]);
  t("E2: the bound is PUBLISHED on the answer (REC-70/REC-30)",
    [typeof f.limit, typeof f.truncated], ["number", "boolean"]);
  t("E3: the frontier carries that look, latest-per-subject, with what it found",
    (f.looked || []).filter((r) => r.subject === "https://example.gov/frontier-seed")
      .map((r) => [r.state, r.result_kind, r.result_ref, r.authority_kind]),
    [["PRESENT", "capture", SHA_A, "acquire"]]);
  t("E3b: …and `last_verified` is DERIVED onto it from that row's own `at` (§5)",
    (f.looked || []).find((r) => r.subject === "https://example.gov/frontier-seed")?.last_verified,
    at(7000));
  /* §7: a result_ref pointing at a capture the store does not hold is ANNOTATED
     at read time and never rewritten. SHA_A was never registered, so this reads
     `purged: true` — which is the annotation working, and it is asserted rather
     than assumed because a null here would read identically to "not checked". */
  t("E3c: a result_ref the register does not hold is ANNOTATED at read time, never rewritten (§7)",
    (f.looked || []).find((r) => r.subject === "https://example.gov/frontier-seed")?.result_purged,
    true);
  t("E4: `last_verified` is DERIVED from the latest PRESENT row's `at` and is not a stored column "
  + "(STORE-AS-CACHE.md: HTTP obsoleted it and we must own it)",
    /last_verified/.test(SRC_SCHEMA), false);

  /* THE LEVELS THAT HAVE NO WRITER SAY SO IN WORDS. An empty list here would be
     the exact confusion this whole table exists to end — "we looked and found
     nothing" against "nobody built this yet" — arriving inside the log's own
     reader. */
  /* CORRECTED 2026-09-15 BY REC-94, NEVER EXEMPTED, AND THE REASON THE OLD
     ASSERTION WAS WRONG IS THE USEFUL PART: `content` was in this list because
     on 2026-09-14 the content level HAD no writer. REC-94 built it (LOG §8 row
     2), so the arm as written asserted that a level which now answers must not
     answer — a test pinning the absence of a feature rather than the rule behind
     it. The RULE is *a level with no writer says so in words and never with an
     empty list*, and the rule is unchanged: it is now asserted over the two
     levels that still have none, and the CONVERSE is asserted over the one that
     gained one, so this arm goes red again if `content` ever silently stops
     answering. An arm that could only ever have gone red by the feature ARRIVING
     is the shape that gets exempted; this one can go red both ways. */
  /* CORRECTED AGAIN 2026-09-15 BY REC-95, NEVER EXEMPTED, on exactly the grounds
     REC-94's correction above states and for the next level down the list.
     `meaning` was here because on 2026-09-14 it had no writer; REC-95 built it
     (LOG §8 row 3), so the arm as written asserted that a level which now answers
     must not answer. THE RULE IS UNCHANGED and is what the arm is about: *a level
     with no writer says so in words and never with an empty list.* It is asserted
     over the ONE level that still has none — `internet`, whose authored writer is
     a member's LEAD and is Program B's, not a RECORD row (§4.5, D-194) — and the
     CONVERSE is asserted over each level that has gained one, so this goes red
     both ways: if a built level silently stops answering, and if the not-built
     branch ever swallows one. An arm that could only go red by the feature
     ARRIVING is the shape that gets exempted; this one cannot be. */
  /* CORRECTED A THIRD TIME 2026-09-18 BY REC-129 (IC-143), NEVER EXEMPTED, on the
     grounds both corrections above state. `internet` was the last level with no
     READ; REC-129 built it over the LEAD's looks, so every one of the four levels
     now answers and the arm as written asserted that a level which answers must
     not. THE RULE IS UNCHANGED — *a level this reader does not read says so in
     words and never with an empty list* — and with no unbuilt level left it is
     asserted over a level that DOES NOT EXIST, which is the only input the
     not-built branch can still receive; the converse below gains `internet`. */
  for (const lvl of ["cosmos"]) {
    const g = await GET(`op=frontier&token=${TOK}&level=${lvl}`);
    t(`E5: a level this reader does not know (${lvl}) answers NOT BUILT rather than an empty frontier`,
      [g.built, (g.looked || []).length, typeof g.note === "string" && g.note.length > 40],
      [false, 0, true]);
  }
  for (const lvl of ["content", "meaning", "internet"]) {
    const g = await GET(`op=frontier&token=${TOK}&level=${lvl}`);
    t(`E5b: the ${lvl.toUpperCase()} level is BUILT and says so — the converse of E5, so this arm `
    + `fails if that level's writer is ever removed as well as if the not-built branch swallows it`,
      [g.built, g.found, typeof g.note === "string" && g.note.length > 40],
      [true, true, true]);
  }
}

/* ========================================================================= *
 *  F · §7's EDGE-TRIGGERED RULE. Its volume is MEASURED in M-14.
 * ========================================================================= */
console.log("\n--- F · the edge rule: a steady-state revisit writes NO row (§7) ---");

{
  const ADDR = "https://example.gov/edge-asset";
  const before = await obsCount();

  const first = await obj.recordCapturedLocator({
    address: ADDR, addressNorm: ADDR, captureSha: SHA_A, retrieved: at(10000) });
  /* `observation_written` IS READ BACK AGAINST THE ROW COUNT, never trusted on
     its own. It reported `true` over a suppressed append until this item's own
     `writer` control arm caught it — a published field computed from the
     intention rather than the outcome — so the arm asserts the FIELD and the
     TABLE agree, and `observation_refused` is asserted null so that "written"
     cannot mean "attempted and refused". */
  t("F1: a FIRST look writes one row, says so, and was not refused",
    [first.observation, first.observation_written, first.observation_refused], ["new", true, null]);
  t("F1b: …and the table AGREES with what the answer said — the field is the outcome, "
  + "not the intention (found by this item's own `writer` arm)",
    (await obsCount()) - before, 1);

  /* N unchanged revisits. §9: "a steady-state sweep over N unchanged assets
     writes zero rows and increments N counters". */
  const N = 5;
  const mid = await obsCount();
  for (let i = 0; i < N; i++)
    await obj.recordCapturedLocator({
      address: ADDR, addressNorm: ADDR, captureSha: SHA_A, retrieved: at(20000 + i * 1000) });
  const afterUnchanged = await obsCount();
  t(`F2: ${N} UNCHANGED revisits write ZERO rows — this is the 2,859x M-14 measured`,
    afterUnchanged - mid, 0);

  /* …AND THE COUNTER STILL MOVED. Without this half, "wrote no row" is
     indistinguishable from "did nothing", and the frontier's cache would be
     silently stale — which is worse than the row it saved. */
  const locs = await obj.capturedLocators({ addressNorm: ADDR });
  t("F3: …and the frontier's CACHE still counted every one of them (§7's other half). "
  + "Without this, 'wrote no row' is indistinguishable from 'did nothing'",
    locs.observations, 1 + N);

  /* CHANGE ONE ASSET → ONE ROW. */
  const changed = await obj.recordCapturedLocator({
    address: ADDR, addressNorm: ADDR, captureSha: SHA_B, retrieved: at(40000) });
  t("F4: a CHANGE writes exactly one row and names itself `changed`",
    [changed.observation, changed.observation_written], ["changed", true]);
  t("F5: and the whole sequence wrote exactly two rows — the first look and the transition",
    (await obsCount()) - before, 2);

  /* THE ARCHIVE FALLBACK — §4.1's fourth writer. `via` is what makes an archive
     capture and a direct capture of ONE address two observations of one subject
     (D-96's split arriving in the log). */
  const viaArchive = await obj.recordCapturedLocator({
    address: ADDR, addressNorm: ADDR, captureSha: SHA_A, retrieved: at(50000), via: "archive" });
  t("F6: the ARCHIVE fallback is a FIRST look at this subject through a different source, "
  + "not an unchanged revisit of the direct one (D-96)",
    [viaArchive.observation, viaArchive.observation_written], ["new", true]);
}

/* ========================================================================= *
 *  G · RATIFY'S MAPPING — §4.1 row 3, and the outcome that writes NO ROW.
 * ========================================================================= */
console.log("\n--- G · ratify's re-fetch, and `not_attempted` writes nothing (§4.1) ---");

{
  const before = await obsCount();
  const out = await obj.recordReuseVerdicts({ bundleId: BUNDLE, at: at(60000), verdicts: [
    { source_capture: SHA_A, address_norm: "https://example.gov/part-a", host: "example.gov",
      verdict: "confirmed", reused_sha: SHA_A, basis: "re-fetch" },
    { source_capture: SHA_A, address_norm: "https://example.gov/part-b", host: "example.gov",
      verdict: "changed", reused_sha: SHA_A, observed_sha: SHA_B, basis: "re-fetch" },
    { source_capture: SHA_A, address_norm: "https://example.gov/part-c", host: "example.gov",
      verdict: "unreachable", reused_sha: SHA_A, basis: "re-fetch" },
    /* THE ONE THAT WRITES NOTHING, and §4.1 gives the reason rather than an
       optimisation: "a look not taken is NEVER_LOOKED, and the budget that
       stopped it is recorded on the ratification, where it already is". */
    { source_capture: SHA_A, address_norm: "https://example.gov/part-d", host: "example.gov",
      verdict: "not_attempted", reused_sha: SHA_A, basis: "budget" },
  ] });
  t("G1: all four verdicts are RECORDED as verdicts — the log does not change that table",
    out.recorded, 4);
  t("G2: but only THREE observations are written — `not_attempted` is NEVER_LOOKED, "
  + "which is the absence of a row",
    (await obsCount()) - before, 3);
  t("G3: and no observation was refused — the mapping mints no word the vocabulary lacks",
    (out.observation_refusals || []).length, 0);

  const f = await GET(`op=frontier&token=${ADM}&level=document`);
  const byAddr = Object.fromEntries((f.looked || []).map((r) => [r.subject, r.state]));
  t("G4: confirmed→PRESENT, changed→PRESENT, unreachable→LOOKED_INDETERMINATE, "
  + "and part-d is absent from the frontier entirely",
    [byAddr["https://example.gov/part-a"], byAddr["https://example.gov/part-b"],
     byAddr["https://example.gov/part-c"], byAddr["https://example.gov/part-d"] ?? "ABSENT"],
    ["PRESENT", "PRESENT", "LOOKED_INDETERMINATE", "ABSENT"]);
}

/* ========================================================================= *
 *  I · REC-103 / IC-105 — THE DOCUMENT ARM'S FENCE.
 *
 *  OUT OF LETTER ORDER ON PURPOSE, and the reason is mechanical rather than
 *  stylistic: section H purges the whole store, so anything appended after it
 *  measures an empty table. This section is the last one that needs rows.
 *
 *  WHAT IT CLOSES. `Store#frontier` accepted a `viewer` and the DOCUMENT arm
 *  never read it, while `gate-reads.test.mjs` classified the op GATED — a
 *  signature ADVERTISING a fence that was not there. REC-94 measured it while
 *  building the content arm and left it for this row's owner.
 *
 *  EVERY ARM HERE IS DRIVEN AGAINST THE DATA AND NEVER AGAINST A FLAG, which is
 *  the queue row's own instruction and REC-94's receipt: its leak one method over
 *  passed a flag-only arm because `capture_held` was already false. So each arm
 *  below builds a PROJECT the viewer is not a participant of, writes a real row
 *  under a real writer, and asks what comes back.
 *
 *  ASKED THROUGH THE DURABLE OBJECT WITH A REAL MEMBER VIEWER, because the
 *  control plane stamps `class:member` for a shared instance token and
 *  `viewerPredicate` deliberately does not filter a machine credential — an arm
 *  driven only through the token is an arm that CANNOT ARM. That is why every
 *  pre-existing arm in this file is untouched by this item: they all hold a class
 *  credential, and the machine carve-out means their answers do not move.
 * ========================================================================= */
console.log("\n--- I · REC-103: the document frontier withholds row-whole (§6) ---");

{
  const DO = async (op, q = "") => rP(await (await obj.fetch(`http://x/${op}?${q}`)).json());
  const SECRET_LABEL = "PRJ-2026-0916-rec103-secret";
  const OPEN = "INF-2026-0916-rec103-open";
  const SHA_SECRET = "e".repeat(64);
  const SHA_OPEN = "f".repeat(64);
  const reg = (s) => [{ sha256: s, path: `data/${s.slice(0, 4)}.pdf`, encoding: "binary", bytes: 10 }];
  /* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7) and a
     project creation naming one is refused PROJECT_ID_SUPPLIED (C-59.1), or PROJECT_ID_IN_BYTES (C-59.2)
     for an `id:` line. A project is created with neither, `id` is only its label, and `mk` returns the
     id the record holds it under — SECRET is the minted one. */
  const mk = async (id, type, capture) => {
    const mint = type === "project";
    const text = `---\n${mint ? "" : `id: ${id}\n`}object_type: ${type}\n---\n\n## Summary\n\n${id}\n`;
    const r = await POST(`op=promote&token=${TOK}`, {
      ...(mint ? {} : { bundleId: id }), base: null, snapKey: `20260916T0900${id.length % 10}0Z_${sha(id).slice(0, 8)}`,
      /* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: this label contradicted the title the other documents
         state, and is now refused; a project document here states no title, so the label stays its only name. */
      meta: { object_type: type, group: "believe-in-oakland", ...(type === "project" ? { title: `Bundle ${id}` } : {}),
              current_state: type === "project" ? "forming" : type === "inquiry" ? "open" : "collected",
              created: T0, last_updated: T0 },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
      register: capture ? reg(capture) : [] });
    if (r.ok === false || !r.bundleId) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 400)}`);
    return r.bundleId;
  };
  await mk(OPEN, "information", SHA_OPEN);
  /* REC-153 (2026-09-19): the open run below needs a QUESTION to run over — see the note at the loop. */
  const OPEN_Q = "INQ-2026-0916-rec103-open";
  /* CORRECTED 2026-09-23 by D-179, never exempted: this registered SHA_OPEN a SECOND time, under OPEN_Q, which
     silently MOVED OPEN's register row onto the question (the register is keyed by the bytes and promote UPSERTed
     the bundle). One capture has one home, the original's (Intake Doctrine §8, BOB #26), so that promote is now
     refused CAPTURE_HELD_BY_ANOTHER_BUNDLE (C-53.13). The question is only a run context (REC-153): it registers
     nothing, and SHA_OPEN stays home under OPEN — the bundle the links below already name as its source. */
  await mk(OPEN_Q, "inquiry", null);
  const SECRET = await mk(SECRET_LABEL, "project", SHA_SECRET);

  /* THE THREE VECTORS, EACH THROUGH ITS OWN REAL WRITER rather than through one
     that happens to be convenient — the leak arrives by three doors and a suite
     that drove one would have called the other two closed. */
  await obj.recordCapturedLocator({                        // acquire: result_ref
    address: "https://example.gov/rec103-secret-target",
    addressNorm: "https://example.gov/rec103-secret-target",
    captureSha: SHA_SECRET, retrieved: at(70000) });
  await obj.recordReuseVerdicts({ bundleId: SECRET, at: at(70000), verdicts: [
    { source_capture: SHA_SECRET, address_norm: "https://example.gov/rec103-secret-asset.css",
      host: "example.gov", verdict: "confirmed", reused_sha: SHA_SECRET, basis: "re-fetch" },
    /* THE ROW WHERE THE AUTHORITY IS THE ONLY REFERENT, ADDED BECAUSE THIS ITEM'S
       OWN `authority` CONTROL ARM CAME BACK GREEN ON I1 AND THAT WAS A FINDING
       ABOUT THE ARM. §4.1 maps `unreachable` to LOOKED_INDETERMINATE with
       `resultKind: null, resultRef: null`, so this row's ONLY bundle-scoped
       referent is `authority` — the project id ratify passes as `bundleId`. On
       the `confirmed` row above, the capture back-reference withholds it anyway,
       so neutering the authority half left I1 green over a leak the OTHER half
       happened to cover. That is REC-94's fall-through shape pointed at this
       suite instead of at the store: two overlapping defences, and an arm that
       cannot tell which one fired. */
    { source_capture: SHA_SECRET, address_norm: "https://example.gov/rec103-secret-unreachable",
      host: "example.gov", verdict: "unreachable", reused_sha: SHA_SECRET, basis: "re-fetch" }] });
  await obj.recordLinks({ sourceCapture: SHA_SECRET, sourceBundle: SECRET, capturedAt: at(70000),
    links: [{ ref: "https://example.gov/rec103-secret-lead",
              address: "https://example.gov/rec103-secret-lead",
              address_norm: "https://example.gov/rec103-secret-lead", type: "deferred" }] });
  /* THE OVER-STRICTNESS FIXTURE, built in the same breath so it cannot drift from
     the leak fixture: `viewerPredicate` filters PROJECT bundles and NOTHING else
     (the evidence corpus stays shared, D-15), so every row below must survive for
     the same uninvited member the rows above are withheld from. */
  await obj.recordCapturedLocator({
    address: "https://example.gov/rec103-open-target",
    addressNorm: "https://example.gov/rec103-open-target",
    captureSha: SHA_OPEN, retrieved: at(70000) });
  await obj.recordLinks({ sourceCapture: SHA_OPEN, sourceBundle: OPEN, capturedAt: at(70000),
    links: [{ ref: "https://example.gov/rec103-open-lead",
              address: "https://example.gov/rec103-open-lead",
              address_norm: "https://example.gov/rec103-open-lead", type: "deferred" }] });

  const asMachine = await DO("frontier", `level=document&limit=500&viewer=class:member`);
  const asMember  = await DO("frontier", `level=document&limit=500&viewer=member:not-invited`);
  const asNobody  = await DO("frontier", `level=document&limit=500`);
  const subj = (f) => (f.looked || []).map((r) => r.subject);
  const leads = (f) => (f.never_looked || []).map((r) => r.subject);

  t("I0: THE FIXTURE IS NOT EMPTY — the arms below are measured over real rows through real "
  + "writers, not over a store that happened to have nothing in it (three headline totality "
  + "assertions have passed over an empty corpus in this repository)",
    [subj(asMachine).length >= 3, leads(asMachine).length >= 2], [true, true]);

  t("I1: THE LEAK, DRIVEN — the ratify writer passes `bundleId` as the observation's AUTHORITY, "
  + "so before this item an uninvited member read the PROJECT BUNDLE ID VERBATIM off the document "
  + "frontier. The machine credential still sees it; the uninvited member sees no row at all",
    [(asMachine.looked || []).some((r) => r.authority === SECRET),
     (asMember.looked  || []).some((r) => r.authority === SECRET),
     JSON.stringify(asMember).includes(SECRET)],
    [true, false, false]);

  t("I1b: THE AUTHORITY HALF, ALONE AND OVER A REAL WRITER'S ROW — ratify's `unreachable` verdict "
  + "maps to LOOKED_INDETERMINATE with NO `result_ref` (§4.1), so the project id in `authority` is "
  + "the row's ONLY bundle-scoped referent and nothing else can withhold it. Added because this "
  + "item's `authority` control arm came back GREEN on I1: two overlapping defences, and an arm "
  + "that could not tell which one fired",
    [(asMachine.looked || []).some((r) => r.subject === "https://example.gov/rec103-secret-unreachable"
                                        && r.state === "LOOKED_INDETERMINATE" && r.result_ref === null),
     subj(asMember).includes("https://example.gov/rec103-secret-unreachable")],
    [true, false]);

  t("I2: THE BACK-REFERENCE — a row whose `result_ref` names a capture registered to that project "
  + "says THIS RECORD HOLDS THIS DOCUMENT, which is `op=contentaxis`' own disclosure and is gated "
  + "there on this same register resolution. Withheld ROW-WHOLE, not column-redacted, because a "
  + "subject with its authority nulled still names what was looked for (§6)",
    [subj(asMachine).includes("https://example.gov/rec103-secret-target"),
     subj(asMember).includes("https://example.gov/rec103-secret-target"),
     JSON.stringify(asMember).includes(SHA_SECRET)],
    [true, false, false]);

  t("I3: THE NEVER-LOOKED PARTITION — a deferred link discovered INSIDE that project's capture "
  + "published the capture sha as `from_document`. It takes the SAME predicate as the looked "
  + "rows, because two ways to decide one question is the mirror-and-drift class",
    [leads(asMachine).includes("https://example.gov/rec103-secret-lead"),
     leads(asMember).includes("https://example.gov/rec103-secret-lead")],
    [true, false]);

  t("I4: OVER-STRICTNESS, AND IT IS THE ARM THAT MATTERS MOST — the same uninvited member still "
  + "sees every row of the INFORMATION bundle, in both partitions. The evidence corpus stays "
  + "shared (D-15); a fence tighter than its rule is not a safer fence",
    [subj(asMember).includes("https://example.gov/rec103-open-target"),
     leads(asMember).includes("https://example.gov/rec103-open-lead")],
    [true, true]);

  t("I4b: …and BYTE-IDENTICALLY to what the machine credential gets for those same subjects — the "
  + "row does not change with the reader, only whether it is published at all",
    JSON.stringify((asMember.looked || []).filter((r) => r.subject.includes("rec103-open"))),
    JSON.stringify((asMachine.looked || []).filter((r) => r.subject.includes("rec103-open"))));

  t("I5: THE GATE FAILS CLOSED ON AN ABSENT STAMP, at the STORE and not only at the control "
  + "plane — a missing stamp is an outage and never a leak, and a row naming NO bundle would "
  + "otherwise walk past a redactor whose whole job is ids",
    [(asNobody.looked || []).length, (asNobody.never_looked || []).length, asNobody.built],
    [0, 0, true]);

  t("I6: NO COUNT OF WHAT WAS WITHHELD is published, because the count is the leak (REC-30). "
  + "`truncated` is computed from the GATED collections and not from the raw fetch, which would "
  + "be true exactly when the gate dropped enough rows — a one-bit count wearing a bound's name",
    [asMember.truncated, asNobody.truncated,
     Object.keys(asMember).filter((k) => /withheld|hidden|redacted/i.test(k))],
    [false, false, []]);

  /* THE INVERSION ARM, and it is the one that keeps this a RULE rather than a
     list of spellings. Every member of `OBSERVATION_AUTHORITY_KINDS` gets a row
     whose authority resolves to NOTHING, over a capture that DOES resolve — so
     the only variable is the authority, which is the break-only-the-thing rule
     applied to a fixture instead of to a control arm. A tenth kind added to that
     constant with no resolver in `#observationBundles` is WITHHELD and this arm
     stays green; a tenth kind waved through by omission turns it red. */
  const KINDS = Object.keys(OBSERVATION_AUTHORITY_KINDS);
  for (const k of KINDS)
    await obj.recordCapturedLocator({
      address: `https://example.gov/rec103-kind-${k}`,
      addressNorm: `https://example.gov/rec103-kind-${k}`,
      captureSha: SHA_OPEN, retrieved: at(80000),
      authorityKind: k, authority: `REC103-UNRESOLVABLE-${k}` });
  const m2 = await DO("frontier", `level=document&limit=500&viewer=class:member`);
  const u2 = await DO("frontier", `level=document&limit=500&viewer=member:not-invited`);
  const kindsSeen = (f) => KINDS.filter((k) =>
    (f.looked || []).some((r) => r.subject === `https://example.gov/rec103-kind-${k}`));

  t("I7: the fixture ARMED — every authority kind in the vocabulary actually wrote a row "
  + "(an arm that did not arm is a finding, and this one has nine chances to not arm)",
    [kindsSeen(m2).length, KINDS.length >= 9], [KINDS.length, true]);

  t("I8: THE INVERSION — an authority this record cannot attribute to a bundle WITHHOLDS the row, "
  + "for every member of the vocabulary. The referent resolves to nothing while the capture "
  + "back-reference resolves fine, so the authority is the only variable. Anything the resolver "
  + "does not UNDERSTAND fails closed rather than being waved through by omission",
    kindsSeen(u2), []);

  t("I8b: …and the SAME uninvited member still sees the open bundle's row, so I8 measured a fence "
  + "and not an outage — six reds read exactly like six arms working without this row",
    subj(u2).includes("https://example.gov/rec103-open-target"), true);

  /* THE RUN REFERENT, IN BOTH DIRECTIONS. It is the one referent the resolver
     DELEGATES rather than resolving — `aiRunLog` already gates on
     `ai_runs.context_id` and a second implementation of one gate is the
     mirror-and-drift class — so it is the one that most needs driving, and I8's
     unresolvable fixture only exercises the closed half. Two real runs, one in
     each kind of context, and the rows are otherwise identical. */
  /* CORRECTED 2026-09-19 by REC-153, never exempted: the open run's context was the INFORMATION bundle OPEN
     under the kind `information`, which is not a kind of run context — the open REFUSED it (C-22.11; BOB #16,
     `7d03e852`: the kind is `RUN_CONTEXTS`' closed vocabulary), and this loop did not notice, because it
     checked `o.ok === false` and a refused open answers `started: false`. It now runs over a QUESTION every
     member sees (OPEN_Q), and it throws unless the run STARTED. The row's label says `inquiry` accordingly. */
  for (const [run, ctxType, ctx] of [["RUN-2026-0916-rec103-open", "inquiry", OPEN_Q],
                                     ["RUN-2026-0916-rec103-secret", "project", SECRET]]) {
    const o = await POST(`op=airunopen&token=${TOK}`, {
      run, contextType: ctxType, contextId: ctx, label: "REC-103's fence fixture", mode: "check",
      principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
      skillVersion: "investigative-session@1", biasManifest: null,
      bounds: [{ bound: "fetches", allowed: 4, unit: "requests" }], leaseMs: 600000, at: at(90000) });
    if (!o || o.started !== true) throw new Error(`airunopen ${run}: ${JSON.stringify(o).slice(0, 300)}`);
    await obj.recordCapturedLocator({
      address: `https://example.gov/rec103-run-${ctxType}`,
      addressNorm: `https://example.gov/rec103-run-${ctxType}`,
      captureSha: SHA_OPEN, retrieved: at(90000), authorityKind: "run", authority: run });
  }
  const m3 = await DO("frontier", `level=document&limit=500&viewer=class:member`);
  const u3 = await DO("frontier", `level=document&limit=500&viewer=member:not-invited`);

  t("I9: THE RUN REFERENT ARMED — both rows were written under a `run` authority over the SAME "
  + "capture, so the run's context is the only thing that differs between them",
    [subj(m3).includes("https://example.gov/rec103-run-inquiry"),
     subj(m3).includes("https://example.gov/rec103-run-project")], [true, true]);

  t("I9b: A ROW UNDER A RUN IS GATED ON THAT RUN'S CONTEXT, and the gate is DELEGATED to "
  + "`aiRunLog` rather than re-implemented — handing a run id to a caller who cannot see its "
  + "context is `op=airuns`' disclosure by a new door. The question-context row is published "
  + "to the uninvited member and the project-context row is not, which is the fence proving it "
  + "is a fence rather than a refusal of everything",
    [subj(u3).includes("https://example.gov/rec103-run-inquiry"),
     subj(u3).includes("https://example.gov/rec103-run-project"),
     JSON.stringify(u3).includes("RUN-2026-0916-rec103-secret")],
    [true, false, false]);
}

/* ========================================================================= *
 *  H · PURGE — §7. Both arms, and they do OPPOSITE things on purpose.
 * ========================================================================= */
console.log("\n--- H · purge: the whole-store arm clears, the per-bundle arm LEAVES (§7) ---");

{
  const before = await obsCount();
  t("H1: there are observations to lose, so the arms below are not measured over nothing",
    before > 5, true);
  /* `bundleId` IS A QUERY PARAMETER AND NOT A BODY FIELD, which this arm got
     wrong first and which is worth the line: the body form is accepted silently
     and purges the WHOLE STORE, so the per-bundle arm read as "clears
     everything" against perfectly correct code. An arm that measured the wrong
     call is a finding about the arm. */
  await POST(`op=purge&token=${ADM}&confirm=bio&bundleId=${BUNDLE}`, {});
  t("H2: a PER-BUNDLE purge LEAVES every observation standing — they are the coverage "
  + "record and are not derived from the bundle (§7)",
    (await obsCount()), before);

  await POST(`op=purge&token=${ADM}&confirm=bio`, {});
  t("H3: and the WHOLE-STORE arm clears the table — D-113's rule applies to it as to every table",
    (await obsCount()), 0);
}

/* ========================================================================= *
 *  L · REC-100 — WHAT THE `run` CARVE-OUT IS ACTUALLY WAITING ON.
 *
 *  APPENDED 2026-09-16. C-22.10 does not fire on `authority_kind = run`
 *  (D-366). REC-100 was spawned to DELETE that carve-out and did not, because
 *  its own accepts-when requires the `overstrict` arm to come back EMPTY first
 *  and it does not. These assertions are the MEASUREMENT of why — driven
 *  through the real plane, because the blocker recorded in three places named
 *  writers that either do not exist under this authority or cannot satisfy the
 *  rule at all, and this repository's standing rule is that a blocker is a
 *  claim nothing audits.
 *
 *  THEY PIN A GAP RATHER THAN A CAPABILITY, WHICH IS DELIBERATE AND IS THE
 *  POINT. Each one states what is true TODAY. When the gap closes, the arm goes
 *  red AT THE SITE THAT HAS TO CHANGE and names it — which is how the next
 *  worker finds these three places instead of re-deriving them. A finding left
 *  in prose reaches nobody; this is the same finding with a failing test
 *  attached to it.
 * ========================================================================= */
console.log("\n--- L · REC-100: the three live `run` PRESENT writers (D-366) ---");

{
  const B2 = "INQ-2026-0916-rec100";
  const R2 = "RUN-2026-0916-rec100";
  await POST(`op=promote&token=${TOK}`, {
    bundleId: B2, base: null, snapKey: "20260916T090000Z_inbox", author: "ruth",
    meta: { object_type: "inquiry", group: "believe-in-oakland", current_state: "open",
            created: T0, last_updated: T0 },
    files: [{ path: "bundle.md", text: `---\nid: ${B2}\n---\n\n## Question\n\nWaiting on what?\n`,
              bytes: 90 /* REC-175 (2026-09-23): CORRECTED, not exempted — this sent sha256: SHA_A ("a" x 64), which is not the SHA-256 of the text above, and the old op=promote stored it as given; promote now refuses that by name (FILE_DIGEST_MISMATCH, C-33.38), so no digest is sent and the plane computes it from the bytes */ }],
    register: [],
  });
  await POST(`op=airunopen&token=${TOK}`, {
    run: R2, contextType: "inquiry", contextId: B2, label: "REC-100's fixture", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 40, unit: "requests" }], leaseMs: 600000, at: T0,
  });

  /* L1 — THE WRITE DOOR IS ALREADY OPEN, and nothing in the record said so.
     D-366 reads as though the fold cannot carry a referent at all; in fact
     `aiRunTick` hands the caller's entry straight to `#aiRunAppend`, which reads
     `entry.result_ref`. So the plane half of "the run's writers carry referents"
     needs NO plane change — which is exactly the kind of already-built
     precondition a decomposition rests a deferral on without checking. */
  const withRef = await POST(`op=airuntick&token=${TOK}`, {
    run: R2, at: at(5000), leaseMs: 600000, consume: { fetches: 1 },
    log: [{ level: "document", subject: "observation:budget-2026", state: "PRESENT",
            result_kind: "capture", result_ref: SHA_B,
            detail: "a run PRESENT that DOES name what it found" }],
  });
  t("L1: a `run` PRESENT that CARRIES a referent is accepted through `op=airuntick` — "
  + "the write door is already open and needs no plane change",
    [withRef && withRef.appended, (withRef && withRef.refused || []).length], [1, 0]);

  /* L2 — INVERTED 2026-09-17 BY REC-113 / IC-116, WHICH IS THE ARM WORKING
     EXACTLY AS REC-100 BUILT IT TO.
     ==================================================================
     REC-100 wrote this assertion to PIN A GAP rather than a capability, and said
     so in this section's header: *"Each one states what is true TODAY. When the
     gap closes, the arm goes red AT THE SITE THAT HAS TO CHANGE and names it —
     which is how the next worker finds these three places instead of re-deriving
     them."* It went red here, on the site that changed, and this is the
     CORRECTION rather than an exemption: the old assertion was true when it was
     written and is now false, and saying which is the whole value of having
     written it.
     WHAT IT USED TO ASSERT, kept so the inversion is legible: `aiRunLog`'s SELECT
     listed `seq, at, level, subject, state, governed, condition, bound, terminal,
     detail` and NOT `result_kind` / `result_ref`, so a referent that WAS stored
     could not be seen through the op — which made REC-100's own accepts-when
     ("rows read back with their coverage claim STATED as undetermined")
     unsatisfiable, because a field the read never projects cannot be stated as
     anything.
     WHAT IT ASSERTS NOW: the referent is VISIBLE, and — the half the projection
     alone would not have bought — the claim it supports is SAID. A `null`
     `result_ref` is an absence with two causes (never written, or dropped by the
     read); `coverage: "backed"` is a statement. Note this row is the one that
     CARRIES a referent, so it must read `backed` and NEVER `undetermined`: the
     failure that costs here is the record saying it does not know something it
     does know. L2b below drives the other direction. */
  const back = await GET(`op=airunlog&token=${TOK}&run=${R2}`);
  t("L2: …and `op=airunlog` NOW PROJECTS IT — the stored referent is visible AND the coverage "
  + "claim it supports is STATED as `backed`, never left to be inferred from a non-null "
  + "(REC-113 / IC-116 closes the READ half of D-366)",
    [back.entries[0].state, back.entries[0].result_kind, back.entries[0].result_ref,
     back.entries[0].coverage],
    ["PRESENT", "capture", SHA_B, "backed"]);

  /* L2b — THE ARM THIS ITEM EXISTS FOR, AND IT IS DRIVEN THROUGH THE OP RATHER
     THAN AT THE STORE, because `op=invitelook` shipped with a ReferenceError
     while 1,276 assertions passed.
     A BARE `run` PRESENT — the exact shape C-22.10's carve-out admits (D-366) —
     is appended, then read back. It must come back STATED as `undetermined`:
     NEVER FILLED (no referent is invented to get past a gate — that is the
     failure CLAUDE.md names by name), NEVER DROPPED (the row is still there, in
     order, with its state intact), and NEVER INFERRED FROM A SIBLING ROW — which
     is why this run already contains a row that IS backed, so a read that
     borrowed a neighbour's referent would answer `backed` here and fail. */
  /* CORRECTED 2026-09-18 BY REC-100 (IC-130), NOT EXEMPTED. L2b appended a
     bare `run` PRESENT through `op=airuntick` and asserted it was ACCEPTED and
     read back `undetermined` — true while C-22.10 carried the `run` carve-out.
     The carve-out is DELETED under the rollup ruling, so the same tick is now
     REFUSED BY NAME and nothing is appended. The half of L2b that is still owed
     — a bare `run` PRESENT that is ALREADY IN THE LOG reads back `undetermined`,
     never filled — cannot be produced by the live build any more, so it moved to
     section K6, which writes the row with a build carrying the old rule and reads
     it back through this one over the SAME persisted store. */
  const bare = await POST(`op=airuntick&token=${TOK}`, {
    run: R2, at: at(6000), leaseMs: 600000, consume: { fetches: 1 },
    log: [{ level: "document", subject: "observation:budget-2025", state: "PRESENT",
            detail: "a run PRESENT that names NOTHING — the carve-out's own shape" }],
  });
  const back2 = await GET(`op=airunlog&token=${TOK}&run=${R2}`);
  const bareRow = back2.entries.find((e) => e.subject === "observation:budget-2025");
  t("L2b: a NEW bare `run` PRESENT is REFUSED BY NAME at the tick (the carve-out is deleted, "
  + "REC-100) and NOTHING is appended — the pre-existing half of this arm is K6",
    [bare && bare.appended, (bare && bare.refused || []).map((r) => [r.code, r.check]),
     bareRow ?? "(absent)"],
    [0, [["OBS_PRESENT_NO_REFERENT", "C-22.10"]], "(absent)"]);

  /* L2c IS LOAD-BEARING AND THE NEGATIVE CONTROL IS WHAT PROVED IT, which is
     worth knowing before anyone decides it duplicates L2b.
     Under this item's `projection` arm — the two columns removed from the SELECT
     so the read projects NOTHING — L2b AND L2d BOTH CAME BACK GREEN. They had to:
     with the columns gone `e.result_ref` is `undefined`, so a row that has no
     referent reads `null / null / undetermined`, which is exactly what it should
     read. An assertion over a row with nothing to show CANNOT TELL "the record
     has no referent" from "the read dropped the column" — the same two bytes for
     two different facts, which is D-366's own shape arriving inside the suite
     written to close it.
     So only a row that HAS a referent can detect a missing projection. L2 and
     this line are those rows. A suite built only around the undetermined case
     would have passed, in full, over a read that projected nothing at all. */
  t("L2c: …and the SIBLING is untouched by it — the backed row still reads `backed` after an "
  + "undetermined row lands in the same run, which is what makes L2b a per-row statement "
  + "rather than a property of the answer",
    back2.entries.find((e) => e.subject === "observation:budget-2026")?.coverage, "backed");

  /* L2d — THE OTHER DIRECTION, AND IT IS THE ONE THAT PROTECTS THE RECORD FROM
     MANUFACTURING AN UNKNOWN. A `LOOKED_ABSENT` row has nothing to point at BY
     DEFINITION — that is what it found out — so calling it undetermined would be
     the record saying it does not know something it DOES know. `none_owed` is
     that third value, and it is why this item did not simply answer
     "undetermined whenever `result_ref` is null". */
  await POST(`op=airuntick&token=${TOK}`, {
    run: R2, at: at(7000), leaseMs: 600000, consume: { fetches: 1 },
    log: [{ level: "document", subject: "observation:never-existed", state: "LOOKED_ABSENT",
            detail: "positively gone, 404 from the origin" }],
  });
  const back3 = await GET(`op=airunlog&token=${TOK}&run=${R2}`);
  t("L2d: a LOOKED_ABSENT row reads `none_owed`, NOT undetermined — a row with nothing to "
  + "point at by definition is not an unknown, and manufacturing one would be an overclaim "
  + "wearing the costume of caution",
    back3.entries.find((e) => e.subject === "observation:never-existed")?.coverage, "none_owed");

  /* L2e — THE READ AND THE REFUSAL HELD TOGETHER BY DRIVING BOTH, not by
     asserting that somebody kept two literals in step. `observationCoverage`
     answers `undetermined` on exactly the rows C-22.10 would REFUSE under a
     non-`run` authority; if the two ever drift, this goes red. `checkObservation`
     is imported and driven — it is NOT edited by this item, and must not be:
     widening the carve-out is REC-100's refused scope and a lifecycle deadlock
     (`op=airunclose` answers `OBS_PRESENT_NO_REFERENT`, so a run that observed
     anything PRESENT cannot be closed at all). */
  {
    const matrix = [
      { state: "PRESENT",              resultRef: null },
      { state: "PRESENT",              resultRef: SHA_B },
      { state: "LOOKED_ABSENT",        resultRef: null },
      { state: "LOOKED_INDETERMINATE", resultRef: null },
      { state: "NEVER_LOOKED",         resultRef: null },
    ];
    const refusesUnderSweep = matrix.map((m) => !!checkObservation(
      { level: "document", subject_kind: "address", subject: "https://example.gov/x",
        state: m.state, result_ref: m.resultRef,
        actor_class: "machine", authority_kind: "sweep", authority: "SWEEP-1" },
      QUEUE_CONDITION_KINDS));
    const saysUndetermined = matrix.map((m) => observationCoverage(m) === "undetermined");
    /* Label CORRECTED 2026-09-18 by REC-100: it ended *"and the carve-out
       itself is UNTOUCHED"*, which REC-100 deleted. The assertion is unchanged
       and still holds — the refusal now fires under `run` too (B17). */
    t("L2e: the read's `undetermined` fires on EXACTLY the rows C-22.10 refuses — "
    + "the read and the refusal share one rule instead of two literals somebody must keep "
    + "in step",
      saysUndetermined, refusesUnderSweep);
    t("L2f: …and that agreement is not free — the matrix genuinely contains both answers, so "
    + "two all-false lists cannot pass it (an equality that costs nothing is not evidence)",
      [refusesUnderSweep.filter(Boolean).length, refusesUnderSweep.filter((x) => !x).length],
      [1, 4]);
  }

  /* L3 — THE ROLLUP, AND IT IS THE FINDING THAT UNSEATS D-366's REMEDY.
     `#aiRunTerminate` writes the run's terminal entry with `#aiRunSearchState`'s
     state — a reduction over the run's WHOLE log. Because this run wrote a
     PRESENT, the rollup is PRESENT, and the terminal row carries no referent.
     No writer-side work fixes this: a summary does not report a look, so there
     is no single thing for it to point at. D-366 says the carve-out becomes
     "ONE DELETED CONDITION" once the writers carry referents; two of the three
     writers structurally cannot, and both of them are in this plane. */
  const closed = await POST(`op=airunclose&token=${TOK}`, {
    run: R2, at: at(9000), bound: "completed",
  });
  /* L3/L4 — CORRECTED 2026-09-18 BY REC-100 (IC-130). They pinned the GAP: the
     terminal entry was a bare `run` PRESENT with no referent by construction.
     BOB #14 ruled what a rollup's referent is (§3), and it is built: the same
     close now writes a terminal PRESENT carrying `result_kind = observation`
     pointing at the run's latest PRESENT look. They went red AT THE SITE THAT
     CHANGED, exactly as REC-100's first pass built them to. */
  t("L3: the run's TERMINAL entry is a rollup PRESENT and it CLOSES — the deadlock the carve-out "
  + "was guarding against does not arise, because the rollup now carries its referent",
    [closed && closed.terminated, closed && closed.state], [true, "PRESENT"]);
  const after = await GET(`op=airunlog&token=${TOK}&run=${R2}`);
  const terminal = after.entries.filter((e) => e.terminal === true);
  const backedLook = after.entries.find((e) => e.subject === "observation:budget-2026");
  t("L4: …and it is written to the log as one row, terminal, PRESENT, with an `observation` "
  + "referent naming the run's one PRESENT look BY THIS OP'S OWN `seq`",
    [terminal.length, terminal[0]?.state, terminal[0]?.result_kind, terminal[0]?.result_ref,
     terminal[0]?.coverage],
    [1, "PRESENT", "observation", String(backedLook?.seq), "backed"]);
}

/* ------------------------------------------------------------------------- *
 *  J · REC-110 / D-386 — THE `tally` IS UNGATED ON PURPOSE, AND THIS SECTION
 *  IS THE PIN THAT MAKES THAT A DECISION RATHER THAN A DEFECT.
 *
 *  THE WHOLE REASONING IS IN `store.mjs` AT THE DOCUMENT ARM'S TALLY and is not
 *  restated here — the suite's job is to make the ruling FAIL LOUDLY if a later
 *  session quietly changes its mind, not to re-argue it in a second place where
 *  the two would drift. In one line: `op=stats` already publishes `count(*)`
 *  over this whole table to an IDENTICALLY classed audience, `observation_log`
 *  has no bundle column so the SQL route IS the forbidden second resolver, and
 *  the per-row route is `derivation-bounds.test.mjs`'s amplification class.
 *
 *  **A DECIDED-NOT-TO-ACT OUTCOME IS WORTH EXACTLY WHAT ITS PIN IS WORTH**, so
 *  these arms close BOTH routes the ruling refused, not just the obvious one:
 *  J1 catches GATING (the tally shrinking for a viewer), J2 catches NARROWING
 *  TO THE PAGE (the tally following the bound). An earlier draft had J1 alone
 *  and it was NOT ENOUGH — changing the field to count this page's states moves
 *  every viewer's answer together, so a viewer-equality arm stays GREEN over it.
 *  That hole was found by asking what the OTHER refused route would look like
 *  here, and it is recorded because the next person to extend this pin will be
 *  tempted by the same single-arm shape.
 * ------------------------------------------------------------------------- */
console.log("\n--- J · REC-110: the tally is ungated ON PURPOSE (D-386 ruled (a)) ---");

{
  const DO = async (op, q = "") => rP(await (await obj.fetch(`http://x/${op}?${q}`)).json());
  const T = (f) => Object.values(f.tally || {}).reduce((a, b) => a + b, 0);
  const J = (f) => JSON.stringify(f.tally || {});

  /* THIS SECTION WRITES ITS OWN SUBJECTS RATHER THAN INHERITING WHATEVER THE
     FILE LEFT BEHIND, AND THAT IS A CORRECTION THIS ARM FORCED RATHER THAN A
     PREFERENCE. J2 was written against the suite's residue and FAILED on its own
     third element — section H purges the store two sections up, so by here the
     log held ONE distinct document subject and a `limit=1` page could not be
     cut. **The arm was right and the fixture was wrong**, which is the direction
     this project wants the surprise to come from: an unarmed J2 would have read
     GREEN on `J(at1) === J(at500)` over a bound that never bit, proving nothing
     while looking exactly like proof. The `at500.looked.length > 1` element is
     what refused it, and it stays in the tuple for the next reader. */
  for (const n of ["alpha", "bravo", "charlie"])
    await obj.recordCapturedLocator({
      address: `https://example.gov/rec110-${n}`,
      addressNorm: `https://example.gov/rec110-${n}`,
      captureSha: sha(`rec110-${n}`), retrieved: at(90000) });

  const machine  = await DO("frontier", `level=document&limit=500&viewer=class:member`);
  const uninvited = await DO("frontier", `level=document&limit=500&viewer=member:not-invited`);
  const nobody   = await DO("frontier", `level=document&limit=500`);

  /* THE DATA ARM FIRST, because a pin armed against a FLAG is REC-94's leak all
     over again: unless this viewer is REALLY being withheld from, J1 is an
     equality that costs nothing to produce and proves nothing at all. `nobody`
     is the DENY scope — section I's I5 already drives it to zero rows in both
     partitions — so it is the sharpest possible case: a reader who may see NOT
     ONE ROW, whose tally is nevertheless the full one. */
  t("J0: THE ARM IS ARMED AGAINST THE DATA — the DENY viewer really does receive zero rows in "
  + "both partitions while the store really does hold document-level rows. Without this, J1 is "
  + "an equality between two answers that were never different, which is the costs-nothing rule",
    [(nobody.looked || []).length, (nobody.never_looked || []).length, T(machine) > 0, machine.built],
    [0, 0, true, true]);

  t("J1: THE RULING, DRIVEN THROUGH THE OP — the `tally` is BYTE-IDENTICAL for a viewer who may "
  + "see every row, a member who may see some, and a DENY caller who may see NONE. It counts "
  + "every row at this level and does not follow the reader. **THE TALLIES ARE IN THE TUPLE ON "
  + "PURPOSE: if a later session gates this, the failure prints the withheld tally AND the full "
  + "one together**, because a failure naming one is a failure a reader cannot act on (REC-109's "
  + "rule, inherited). D-386 is RULED (a) and the reasoning is in `store.mjs`, not here",
    [J(nobody), J(uninvited)],
    [J(machine), J(machine)]);

  /* J2 — THE OTHER REFUSED ROUTE, AND THE ARM J1 CANNOT REPLACE. D-386's option
     (b) had two spellings and the second was *change what the field counts to
     this page's states*. That is a silent value change inside an unchanged
     envelope (IC-118: a correct consumer becomes wrong without changing a line),
     and it moves EVERY viewer's answer together — so it walks straight past J1.
     What it cannot walk past is the BOUND: a page-scoped tally at `limit=1` can
     carry at most one row's worth of states. */
  const at1   = await DO("frontier", `level=document&limit=1&viewer=class:member`);
  const at500 = await DO("frontier", `level=document&limit=500&viewer=class:member`);
  t("J2: …AND IT DOES NOT FOLLOW THE BOUND EITHER — the same viewer at `limit=1` and at "
  + "`limit=500` gets the SAME tally, while the page itself really is cut. This is the arm "
  + "against D-386's OTHER refused route: narrowing the field to *this page's states* moves "
  + "every viewer together and J1 stays green over it. The cut page length is in the tuple so "
  + "the arm cannot pass over a bound that never bit",
    [J(at1), (at1.looked || []).length <= 1, (at500.looked || []).length > 1],
    [J(at500), true, true]);

  /* J3 — THE SITE, because the row's requirement is that the DECISION is what
     the next reader meets. An assertion that the tally is ungated is only half
     the pin: a session that gated it would delete this comment too, and the arm
     that notices is the one that reads the SOURCE. This checks the ruling is
     recorded at ALL THREE sites, which is the gap D-386 itself did not name. */
  const SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  t("J3: THE RULING IS RECORDED AT ALL THREE TALLY SITES, not at one — REC-103 stated the "
  + "posture at the document arm ALONE, so a reader arriving at `#frontierContent` or "
  + "`#frontierMeaning` met an ungated aggregate with nothing beside it. **That was the gap "
  + "D-386 did not name and it is half of what REC-110 fixed.** Each site names REC-110 and "
  + "D-386; the two derived arms POINT at the document arm rather than restating it, because "
  + "one rule with three spellings is the mirror-and-drift class this file refuses for gates",
    [(SRC.match(/RULED \(a\) BY REC-110/g) || []).length,
     (SRC.match(/REC-110, 2026-09-17, D-386 CLOSED/g) || []).length,
     (SRC.match(/SELECT state, COUNT\(\*\) n FROM observation_log/g) || []).length],
    [1, 2, 3]);

  /* J5 — D-486 / BOB #32 (2026-09-24): THE ONE NARROWING, AND WHAT IT DOES TO J1's CLAIM.
   *
   *  **J1 ABOVE IS STILL TRUE AND IS NO LONGER TRUE UNCONDITIONALLY, AND SAYING SO IS THIS ARM'S WHOLE JOB.**
   *  Bob ruled on 2026-09-24 at 02:30Z that a hidden project's run output is THE PROJECT'S THINKING until
   *  something outside uses it, so all five readers of `observation_log` — `op=stats`' `aiRunLog` and
   *  `observationsNonLead`, and the three bundle-level tallies — now subtract the log rows of a run whose
   *  context is a project the caller cannot see. J1's byte-identity therefore holds for THIS fixture because
   *  THIS fixture opens no run over a project, and that precondition is ASSERTED here rather than left to be
   *  true by luck: a suite whose headline equality quietly depends on an unstated condition is the
   *  costs-nothing shape this file refuses everywhere else. If a later session adds a project-context run to
   *  this fixture, THIS arm goes red first and names the reason, instead of J1 going red looking like a
   *  regression in a ruling that was never reopened.
   *
   *  REC-110 IS NOT REOPENED, AND THE DISTINCTION IS EXACT. Its premise (2) (no bundle column, so a gate here
   *  would be the forbidden second resolver) and premise (3) (per-row resolution is the amplification class)
   *  are both untouched: D-486 subtracts ONE indexed set of run ids and does no per-row work. Its premise (1)
   *  (`op=stats` answers the same question to the same audience) is KEPT TRUE by moving both doors in one
   *  landing — which is why D-486's row reads *all five readers together*. The LIVE arm, over a real hidden
   *  project through the op, is `project-sight.test.mjs` §9. */
  /* THE PRECONDITION IS MEASURED, NOT ASSERTED FROM READING THE FIXTURE — and the first spelling of this arm got
     it wrong, which is why it is measured. It declared *this fixture holds NO run* and came back `2`: the suite
     has TWO sections labelled `I`, and the FIRST one (REC-103's fence, line 883) does open a run over a PROJECT.
     Section H purges the whole store BETWEEN them, so by here that run is gone and the two live runs are both
     `inquiry`-context. **The arm was right and the reading of the fixture was wrong**, which is the direction this
     project wants the surprise to come from. It now measures the thing that actually matters — whether the
     subtraction moves anything here — rather than a proxy for it. (The duplicated section letter is reported as a
     finding by D-486; it is cosmetic and is not fixed here.) */
  const st = await DO("stats"), sFiltered = await DO("stats", "viewer=member:not-invited");
  t("J5: J1's EQUALITY IS ARMED AND ITS PRECONDITION IS NOW STATED AND MEASURED — this fixture DOES hold runs "
  + "(so the arm is not vacuous about runs existing) and a filtered viewer DOES lose bundles here (so the gate "
  + "is live), but NO surviving run's context is a project that viewer cannot see, so D-486 subtracts nothing "
  + "at this fixture and J1 above really is three answers over one whole log. Add a project-context run to this "
  + "fixture and THIS arm goes red first, naming the reason, instead of J1 reading like a reopened ruling",
    [st.aiRuns > 0, st.bundles > sFiltered.bundles,
     sFiltered.aiRunLog === st.aiRunLog, sFiltered.observationsNonLead === st.observationsNonLead],
    [true, true, true, true]);
  t("J5b: AND THE NARROWING IS AT ALL THREE TALLY SITES AND IS ONE PREDICATE — each site reaches it through the "
  + "shared `#hiddenRunTail`, the subtraction itself is written in exactly ONE place (`#hiddenSets`), and the "
  + "ruling that licensed it is named at that place. Five readers, one rule: three spellings is the drift class "
  + "REC-110's own J3 was written against, and five would be worse",
    [(SRC.match(/this\.#hiddenRunTail\(viewer\)/g) || []).length,
     (SRC.match(/NOT \(authority_kind = 'run' AND COALESCE\(authority, ''\) IN /g) || []).length,
     /BOB #32, 2026-09-24 02:30Z/.test(SRC)],
    [3, 1, true]);
}

/* ------------------------------------------------------------------------- *
 *  K · REC-100 (2026-09-18, IC-130) — THE ROLLUP REFERENT, BUILT. D-366 CLOSED.
 *
 *  `OBSERVATION-LOG-DESIGN.md` §3, RULED by BOB #14: a rollup's PRESENT
 *  carries `result_kind = observation`, `result_ref` = the `seq` of the LATEST
 *  non-terminal PRESENT row of the same run, computed by the PLANE; C-22.10
 *  gains an arm refusing an `observation` referent that is not an EARLIER
 *  PRESENT row of the SAME authority; the `run` carve-out is DELETED; legacy
 *  bare rows are STATED undetermined, never filled.
 *
 *  WHY THE SEQ ARITHMETIC BELOW IS SOUND, since the suite has no door onto the
 *  store-wide `seq` (a probe method would be a second append site — see B): H
 *  purged the WHOLE store, `seq` is SQLite's rowid (the next is MAX + 1, and 1
 *  on an empty table) and B4 pins that nothing else ever DELETEs a row — so from
 *  H on, the store-wide `seq` of the newest row IS the row count `op=stats`
 *  publishes. K1a is the arm that PROVES it rather than assuming it: it points a
 *  caller-supplied referent at `count + 1` and must be ACCEPTED, which it cannot
 *  be unless that number names the run's own PRESENT look.
 * ------------------------------------------------------------------------- */
console.log("\n--- K · REC-100: the rollup referent, built (D-366 closed) ---");

{
  const KB = "INQ-2026-0918-rec100";
  const KA = "RUN-2026-0918-rec100-a";
  const KX = "RUN-2026-0918-rec100-other";
  const KR = "RUN-2026-0918-rec100-reaped";
  await POST(`op=promote&token=${TOK}`, {
    bundleId: KB, base: null, snapKey: "20260918T090000Z_inbox", author: "ruth",
    meta: { object_type: "inquiry", group: "believe-in-oakland", current_state: "open",
            created: T0, last_updated: T0 },
    files: [{ path: "bundle.md", text: `---\nid: ${KB}\n---\n\n## Question\n\nRests on what?\n`,
              bytes: 90 /* REC-175 (2026-09-23): CORRECTED, not exempted — this sent sha256: SHA_A ("a" x 64), which is not the SHA-256 of the text above, and the old op=promote stored it as given; promote now refuses that by name (FILE_DIGEST_MISMATCH, C-33.38), so no digest is sent and the plane computes it from the bytes */ }],
    register: [],
  });
  const openRun = (run, plus, leaseMs = 600000) => POST(`op=airunopen&token=${TOK}`, {
    run, contextType: "inquiry", contextId: KB, label: "REC-100's build fixture", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 40, unit: "requests" }], leaseMs, at: at(plus) });
  const tick = (run, plus, log, leaseMs = 600000) => POST(`op=airuntick&token=${TOK}`,
    { run, at: at(plus), leaseMs, consume: { fetches: 1 }, log });
  const logOf = (run) => GET(`op=airunlog&token=${TOK}&run=${run}`);
  const refusedAs = (tk) => (tk?.refused || []).map((r) => [r.code, r.check, r.referent_fault ?? null]);
  const obsRef = (subject, ref) =>
    ({ level: "document", subject, state: "PRESENT", result_kind: "observation", result_ref: ref,
       detail: "a caller-supplied observation referent" });

  /* K0 — THE FALSIFIER, RE-VERIFIED ON THIS TREE BEFORE ANYTHING WAS BUILT, and
     pinned here so it cannot silently stop being true. The ruling rests on
     `#aiRunSearchState` reading PRESENT IF AND ONLY IF a non-terminal PRESENT
     row of the run exists; if it could read PRESENT with no such row the
     referent would be absent exactly when owed, and the deadlock would return.
     It holds by construction: the state and the referent come out of ONE grouped
     read, PRESENT is chosen iff that read returned a PRESENT group, and the
     group's MAX(seq) is the referent. K1/K4 then drive it. */
  {
    const i = SRC_STORE.indexOf("  #aiRunSearchState(run, stoppedByBound) {");
    const body = SRC_STORE.slice(i, SRC_STORE.indexOf("\n  }\n", i));
    t("K0: THE FALSIFIER — the rollup's state and its referent come from ONE grouped read over the "
    + "run's non-terminal rows, PRESENT iff that read has a PRESENT group, and the referent is that "
    + "group's latest seq; the bound override never produces PRESENT",
      [i > -1, /WHERE authority_kind = 'run' AND authority = \? AND terminal = 0\s+GROUP BY state/.test(body),
       /latest\.has\("PRESENT"\) \? "PRESENT"/.test(body),
       /s === "PRESENT"\s*\?\s*\{ state: s, result_kind: "observation", result_ref: String\(latest\.get\("PRESENT"\)\) \}/.test(body),
       /s = "LOOKED_INDETERMINATE"/.test(body) && !/s = "PRESENT"/.test(body)],
      [true, true, true, true, true]);
  }

  await openRun(KA, 100000);
  const n0 = await obsCount();
  const a1 = await tick(KA, 101000, [{ level: "document", subject: "observation:k-a1", state: "PRESENT",
    result_kind: "capture", result_ref: SHA_A, detail: "a look that found the 2024 budget" }]);
  /* K1a — THE OVER-STRICTNESS DIRECTION AND THE ARITHMETIC'S PROOF IN ONE ARM.
     An `observation` referent naming an EARLIER PRESENT row of the SAME run is
     correct work and is ACCEPTED — a check that refused it would be a wall. And
     it can only be accepted if `n0 + 1` really is k-a1's store-wide seq. */
  const a2 = await tick(KA, 102000, [obsRef("observation:k-a2", String(n0 + 1))]);
  t("K1a: a correct `observation` referent — an EARLIER PRESENT row of the SAME run — is ACCEPTED "
  + "(the over-strictness direction), which also proves the seq arithmetic this section rests on",
    [a1?.appended, a2?.appended, refusedAs(a2)], [1, 1, []]);
  await tick(KA, 103000, [{ level: "document", subject: "observation:k-a3", state: "LOOKED_ABSENT",
    detail: "positively gone" }]);                                           /* seq n0 + 3 */

  /* K2 — THE CONTROLS THE ROW OWES, EACH REFUSED BY NAME: the code and the
     C-number say WHICH rule, and `referent_fault` says which of its four ways it
     failed. A referent naming a non-PRESENT row; a LATER seq (the row's OWN seq,
     the tightest later there is, and one far past the end); a seq that names
     nothing; and ANOTHER RUN's PRESENT look. */
  /* The count is re-read IMMEDIATELY before the self-reference, and that is a
     correction REC-100's own `present` control arm forced: the first draft read
     it once, before K2's tick, so when that arm let K2's entry through it took
     the very seq the self-reference named — and K2b then pointed at an EARLIER
     PRESENT row and was accepted. The arm was right: K2b's input depended on
     another arm's outcome, which makes it a statement about K2 rather than about
     "later". Read at the moment of use, `count + 1` IS the row's own seq. */
  const notPresent = await tick(KA, 104000, [obsRef("observation:k-x1", String(n0 + 3))]);
  const nNow = await obsCount();
  const selfRef    = await tick(KA, 104100, [obsRef("observation:k-x2", String(nNow + 1))]);
  const farLater   = await tick(KA, 104200, [obsRef("observation:k-x3", String(nNow + 500))]);
  const nothing    = await tick(KA, 104300, [obsRef("observation:k-x4", "seq-seven")]);
  await openRun(KX, 104400);
  const otherRun   = await tick(KX, 104500, [obsRef("observation:k-x5", String(n0 + 1))]);
  const C = ["OBS_PRESENT_NO_REFERENT", "C-22.10"];
  t("K2: a referent naming a row that is NOT PRESENT is refused BY NAME",
    refusedAs(notPresent), [[...C, "not_present"]]);
  t("K2b: a LATER seq is refused BY NAME — the row's OWN seq (a self-reference) and one far past the end",
    [refusedAs(selfRef), refusedAs(farLater)], [[[...C, "not_earlier"]], [[...C, "not_earlier"]]]);
  t("K2c: a referent that names NO row is refused BY NAME",
    refusedAs(nothing), [[...C, "unresolved"]]);
  t("K2d: ANOTHER RUN's PRESENT look is refused BY NAME — a rollup rests only on its own run's looks",
    refusedAs(otherRun), [[...C, "other_authority"]]);
  t("K2e: and the four faults driven are EXACTLY the vocabulary the checker publishes — a fifth added "
  + "later without an arm here fails this line",
    ["not_present", "not_earlier", "unresolved", "other_authority"].sort(),
    Object.keys(OBSERVATION_REFERENT_FAULTS).sort());
  t("K2f: none of the refused entries was appended — a refusal that still wrote the row is a label",
    [notPresent?.appended, selfRef?.appended, farLater?.appended, nothing?.appended, otherRun?.appended],
    [0, 0, 0, 0, 0]);

  /* K3 — THE DEADLOCK ARM, AND THE LATEST-LOOK RULE. With the carve-out GONE,
     `op=airunclose` SUCCEEDS for a run that observed PRESENT — REC-100's
     2026-09-16 measurement was that it answered `OBS_PRESENT_NO_REFERENT` and
     never wrote the terminal entry. The run has THREE PRESENT rows (k-a1, the
     observation row k-a2, k-a4); the referent is the LATEST. */
  await tick(KA, 105000, [{ level: "document", subject: "observation:k-a4", state: "PRESENT",
    result_kind: "capture", result_ref: SHA_B, detail: "a later look that found the 2025 budget" }]);
  const closedA = await POST(`op=airunclose&token=${TOK}`, { run: KA, at: at(106000), bound: "completed" });
  t("K3: THE DEADLOCK ARM — `op=airunclose` SUCCEEDS for a run that observed PRESENT, with the "
  + "carve-out deleted (REC-100 measured this answering OBS_PRESENT_NO_REFERENT on 2026-09-16)",
    [closedA?.terminated, closedA?.state, closedA?.code ?? null], [true, "PRESENT", null]);
  const logA = await logOf(KA);
  const termA = logA.entries.filter((e) => e.terminal === true);
  const a4 = logA.entries.find((e) => e.subject === "observation:k-a4");
  t("K3b: the terminal row points at the LATEST non-terminal PRESENT row, by op=airunlog's own seq, and "
  + "that row really is PRESENT and earlier — a pointer a reader can follow inside the same answer",
    [termA.length, termA[0]?.result_kind, termA[0]?.result_ref, a4?.state,
     Number(termA[0]?.result_ref) < termA[0]?.seq, termA[0]?.coverage],
    [1, "observation", String(a4?.seq), "PRESENT", true, "backed"]);

  /* K3c — THE OTHER HALF OF THE IFF: a run that observed NOTHING PRESENT writes
     a terminal entry that is not PRESENT and owes no referent, exactly as
     before. A writer that pointed anyway would be inventing support. */
  await tick(KX, 107000, [{ level: "document", subject: "observation:k-x6", state: "LOOKED_ABSENT",
    detail: "positively gone" }]);
  const closedX = await POST(`op=airunclose&token=${TOK}`, { run: KX, at: at(108000), bound: "completed" });
  const termX = (await logOf(KX)).entries.filter((e) => e.terminal === true);
  t("K3c: a run with NO PRESENT look closes on a non-PRESENT rollup carrying NO referent, stated `none_owed`",
    [closedX?.terminated, closedX?.state, termX[0]?.result_kind, termX[0]?.result_ref, termX[0]?.coverage],
    [true, "LOOKED_ABSENT", null, null, "none_owed"]);

  /* K4 — THE REAPER, DRIVEN. D-366 recorded this as OWED: `#aiRunReap` was READ
     and never reached, because it needs an expired lease. It is reached here
     through the alarm's own body — `onAlarm(now)`, which is what workerd calls —
     exactly as `airun.test.mjs` arm K drives it. */
  await openRun(KR, 200000, 60000);
  await tick(KR, 201000, [{ level: "document", subject: "observation:k-r1", state: "PRESENT",
    result_kind: "capture", result_ref: SHA_A, detail: "the look the run made before it died" }], 60000);
  const alarm = await obj.onAlarm(Date.parse(at(400000)));
  const logR = await logOf(KR);
  const termR = logR.entries.filter((e) => e.terminal === true);
  const r1 = logR.entries.find((e) => e.subject === "observation:k-r1");
  t("K4: THE REAPER, DRIVEN — a killed run that observed PRESENT is reaped (not deadlocked), and its "
  + "terminal rollup carries an `observation` referent naming the look it made before it died",
    [(alarm?.airunreap?.reaped || []).find((x) => x.run === KR) ?? null,
     termR.length, termR[0]?.state, termR[0]?.bound, termR[0]?.result_kind, termR[0]?.result_ref,
     termR[0]?.coverage],
    [{ run: KR, terminated: true, bound: "lease" }, 1, "PRESENT", "lease", "observation",
     String(r1?.seq), "backed"]);

  /* K6 — A PRE-EXISTING BARE `run` PRESENT IS STATED UNDETERMINED AND NEVER
     FILLED, and it cannot deadlock its run either. The live build can no longer
     WRITE such a row, so it is written by a build carrying the OLD rule — this
     tree's own source with the carve-out restored at the one append site, over a
     PERSISTED store — and then read and closed by THIS build over the same bytes
     on disk, which is the path a real instance takes on its next boot.
     `inquiry.test.mjs` block 6 is the precedent for writing a legacy row with a
     neutered copy of the live source. */
  {
    const root = mkdtempSync(join(tmpdir(), "rec100-legacy-"));
    try {
      const PLANE = fileURLToPath(new URL("..", import.meta.url));
      const REPO = fileURLToPath(new URL("../..", import.meta.url));
      cpSync(join(PLANE, "src"), join(root, "bio-plane", "src"), { recursive: true });
      cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
      cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
      const ANCHOR = "    const bad = checkObservation(entry, QUEUE_CONDITION_KINDS, this.#observationReferent(entry));";
      const LEGACY = "    const bad = (entry.authority_kind === \"run\" && entry.state === \"PRESENT\" "
        + "&& (entry.result_ref == null || entry.result_ref === \"\")) ? null "
        + ": checkObservation(entry, QUEUE_CONDITION_KINDS, this.#observationReferent(entry));";
      const storePath = join(root, "bio-plane", "src", "store.mjs");
      const src = readFileSync(storePath, "utf8");
      const occurrences = src.split(ANCHOR).length - 1;
      writeFileSync(storePath, src.replace(ANCHOR, LEGACY));
      t("K6a: the legacy build is armed — the append-site anchor occurs EXACTLY ONCE and was replaced "
      + "(a legacy arm that did not arm proves nothing about legacy rows)",
        [occurrences, readFileSync(storePath, "utf8").includes(LEGACY)], [1, true]);

      const persist = join(root, "persist");
      const planeAt = (idx) => withSurfacingRun(new Miniflare({
        modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
        compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
        durableObjects: { STORE: { className: "Store", useSQLite: true } },
        durableObjectsPersist: persist,
        r2Buckets: ["CAPTURES", "PUBLISHED"],
        bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec93",
                    VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" } }));
      const on = (m) => ({
        POST: async (q, b) => rP(await (await m.dispatchFetch(`http://x/api/?${q}`,
          { method: "POST", body: JSON.stringify(b ?? {}) })).json()),
        GET: async (q) => rP(await (await m.dispatchFetch(`http://x/api/?${q}`)).json()) });
      const KL = "RUN-2026-0918-rec100-legacy";

      const old = planeAt(join(root, "bio-plane", "src", "index.mjs"));
      let legacyTick;
      try {
        const o = on(old);
        await o.POST(`op=promote&token=${TOK}`, {
          bundleId: KB, base: null, snapKey: "20260918T090000Z_inbox", author: "ruth",
          meta: { object_type: "inquiry", group: "believe-in-oakland", current_state: "open",
                  created: T0, last_updated: T0 },
          files: [{ path: "bundle.md", text: `---\nid: ${KB}\n---\n\n## Question\n\nRests on what?\n`,
                    bytes: 90 /* REC-175 (2026-09-23): CORRECTED, not exempted — this sent sha256: SHA_A ("a" x 64), which is not the SHA-256 of the text above, and the old op=promote stored it as given; promote now refuses that by name (FILE_DIGEST_MISMATCH, C-33.38), so no digest is sent and the plane computes it from the bytes */ }],
          register: [] });
        await o.POST(`op=airunopen&token=${TOK}`, {
          run: KL, contextType: "inquiry", contextId: KB, label: "a run written under the old rule",
          mode: "check", principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
          skillVersion: "investigative-session@1", biasManifest: null,
          bounds: [{ bound: "fetches", allowed: 40, unit: "requests" }], leaseMs: 600000, at: T0 });
        legacyTick = await o.POST(`op=airuntick&token=${TOK}`, {
          run: KL, at: at(1000), leaseMs: 600000, consume: { fetches: 1 },
          log: [{ level: "document", subject: "observation:legacy-bare", state: "PRESENT",
                  detail: "a run PRESENT that names nothing, written before the carve-out was deleted" }] });
      } finally { await old.dispose(); }
      t("K6b: the OLD rule admitted the bare `run` PRESENT — this is the row a real instance already holds",
        [legacyTick?.appended, (legacyTick?.refused || []).length], [1, 0]);

      const live = planeAt(IDX);
      try {
        const l = on(live);
        const before = await l.GET(`op=airunlog&token=${TOK}&run=${KL}`);
        const bareBefore = before.entries?.find((e) => e.subject === "observation:legacy-bare");
        t("K6c: THIS build reads the legacy row back STATED `undetermined` — not filled, not dropped",
          [bareBefore?.state, bareBefore?.result_kind, bareBefore?.result_ref, bareBefore?.coverage],
          ["PRESENT", null, null, "undetermined"]);
        const closedL = await l.POST(`op=airunclose&token=${TOK}`, { run: KL, at: at(2000), bound: "completed" });
        const afterL = await l.GET(`op=airunlog&token=${TOK}&run=${KL}`);
        const termL = (afterL.entries || []).filter((e) => e.terminal === true);
        const bareAfter = (afterL.entries || []).find((e) => e.subject === "observation:legacy-bare");
        t("K6d: a run holding ONLY a legacy bare PRESENT still CLOSES — its rollup points at that row, which "
        + "IS an earlier PRESENT row of the same run — and the legacy row is STILL `undetermined` "
        + "afterwards: the pointer does not launder it",
          [closedL?.terminated, termL[0]?.state, termL[0]?.result_kind, termL[0]?.result_ref,
           bareAfter?.coverage, bareAfter?.result_ref],
          [true, "PRESENT", "observation", String(bareAfter?.seq), "undetermined", null]);
      } finally { await live.dispose(); }
    } finally { rmSync(root, { recursive: true, force: true }); }
  }
}


/* ------------------------------------------------------------------------- *
 *  M · D-500 — §5.1's TOP-END BOUND, AT ONE PRECISION.
 *
 *  §5.1: *the window stops growing rather than closing, and it is bounded at its
 *  top end — a subject that entered the record after the log's first row at its
 *  level reaches cause (3) normally.* That sentence is a COMPARISON between two
 *  timestamps of DIFFERENT PRECISION: `register.registered` and `entities.at`
 *  carry milliseconds, `observation_log.at` has the fraction cut. D-486 measured
 *  what the mismatch costs (`measurements/M-131.md`): twice in one worktree ~20
 *  minutes apart, four of an outsider's frontier keys moved on one run and not on
 *  the other, because whether a hidden run's row and a fixture's captures fell
 *  inside one clock second decided the answer. BOB #32 ruled (2026-09-24 05:04Z)
 *  that the watermark STAYS VIEWER-INDEPENDENT and that the reclassification is
 *  the accepted cost ONLY IF DETERMINISTIC.
 *
 *  THE ARMS BELOW ARE WEIGHTED AT THE TWO THINGS THAT CAN GO WRONG HERE, and the
 *  second is the one this item nearly shipped. (1) The rule is not deterministic.
 *  (2) The rule is "fixed" by a re-spelling that changes nothing — M4 drives the
 *  superseded comparison on the SAME corpus so M2 is never an equality between
 *  two things that were never different.
 * ------------------------------------------------------------------------- */
console.log("\n--- M · D-500: the watermark comparison is deterministic (§5.1, §6) ---");

/* THE RULE IS ONE FUNCTION AND THE TWO READERS CALL IT. A structural pin off the
   source, because a behaviour arm cannot tell "one rule" from "two rules that
   agree today" — B1's reason, one construct over. */
t("M1: `store.mjs` holds NO second watermark comparison — both readers call the "
+ "one exported rule, and the truncating helper they each defined is gone",
  [[...SRC_STORE.matchAll(/enteredAfterFirstRow\(/g)].length,
   [...SRC_STORE.matchAll(/const sec = /g)].length,
   [...SRC_STORE.matchAll(/import \{ enteredAfterFirstRow \} from "\.\/airun\.mjs";/g)].length],
  [2, 0, 1]);
/* D-516 — **THE TRAP THE THREE-WAY ANSWER OPENS, PINNED RATHER THAN WARNED ABOUT.**
   `enteredAfterFirstRow` still READS as a predicate and now returns one of three
   TRUTHY strings, so `enteredAfterFirstRow(a, b) ? x : y` — which is exactly what
   both readers held until this item — compiles, runs, and classifies the band as
   the positive statement. That is a defect no assertion about behaviour can see,
   because a reader written that way agrees with the rule on two of its three
   answers and is wrong only on the one this item exists to add. So the pin is
   STRUCTURAL and it is on the SHAPE of the call, not on the answer.
   WHAT IT CAN AND CANNOT SEE, stated: it matches the call followed by a ternary,
   a negation, or a boolean operator, on one line. It cannot see the answer stored
   in a variable and tested later — which is what BOTH readers now do, deliberately
   and by name — so it is a floor against the careless spelling and not a proof.
   The behaviour arms below are what cover the stored form. */
t("M1b: NO READER TESTS THE THREE-WAY ANSWER AS A BOOLEAN — every one of its three "
+ "answers is a truthy string, so a ternary on the call is silently wrong exactly "
+ "where this item is right",
  [...SRC_STORE.matchAll(/(?:!\s*)?enteredAfterFirstRow\([^\n]*?\)\s*(?:\?|&&|\|\|)/g)]
    .map((m) => m[0]),
  []);
/* THE PIN IS ON THE HELPER AND NOT ON `slice(0, 19)`, and the reason is worth one
   line: the superseded spelling is QUOTED in the corrections at both sites, so a
   pin on the literal counts this file's own history as a defect — the shape
   `hygiene.test.mjs` calls a detector matching the doctrine's own prose. The
   helper's declaration is the thing that cannot survive in a comment and be
   mistaken for code. TWO call sites — the content reader and the meaning reader —
   and the import counted separately, so a reader that quietly stopped calling the
   rule while the import stayed is still caught. */

{
  /* THE CORPUS IS PRINTED AND FLOORED. Every placement of the clock second (the
     free variable the writers do not control) against every gap that matters,
     in BOTH directions — a pair where the subject entered BEFORE the first row
     and one where it entered after. */
  const SECOND = 1000, STEP = 7;
  const GAPS_SAME_SECOND = [-999, -900, -500, -100, -1, 0, 1, 100, 500, 900, 999];
  const GAPS_BEYOND = [-2500, -1800, -1500, -1200, 1200, 1500, 1800, 2500];
  const BASE = Date.parse("2026-09-24T12:00:15Z");
  const iso = (ms) => new Date(ms).toISOString();
  const cut = (ms) => iso(ms).split(".")[0] + "Z";      /* `#observe`'s own spelling */
  /* THE SUPERSEDED RULE, VERBATIM from `store.mjs` before this item, so M4 measures
     what actually shipped rather than a paraphrase of it. */
  const shipped = (enteredAt, firstAt) => {
    const sec = (v) => String(v).slice(0, 19);
    return sec(enteredAt) >= sec(firstAt);
  };
  /* D-516 — **D-500's TWO-WAY RULE, VERBATIM from `airun.mjs` before THIS item**, and
     it is a SECOND superseded rule and not the same one. `shipped` above is REC-94's
     truncating comparison, which D-500 replaced; this is D-500's replacement, which
     this item replaces in turn. Keeping both is what lets M3b and M4c measure this
     item's move against the rule it actually moved, rather than against a rule two
     landings old — a control that arms the wrong subject refutes nothing. */
  const d500 = (enteredAt, firstAt) => {
    const e = Date.parse(String(enteredAt ?? "")), f = Date.parse(String(firstAt ?? ""));
    if (!Number.isFinite(e) || !Number.isFinite(f)) return false;
    return e >= f - watermarkUncertaintyMs(firstAt);
  };
  const answersFor = (rule, gap) => {
    const seen = new Set();
    for (let off = 0; off < SECOND; off += STEP) {
      const rowTrue = BASE + off;                        /* where the clock second falls */
      seen.add(rule(iso(rowTrue + gap), cut(rowTrue)));
    }
    return seen;
  };
  const placements = Math.ceil(SECOND / STEP);
  const unstable = (rule, gaps) => gaps.filter((g) => answersFor(rule, g).size !== 1);
  /* D-516 — THE SAME SWEEP READ AT THE LEVEL BOB #33's CONDITION IS WRITTEN AT:
     what the READER says, not what the comparison returns. `contentAxisFor` is
     called with the cause the store would map this answer to, so this is the
     reader's own state and not a paraphrase of it. */
  const causeOf = (answer) => answer === WATERMARK_AFTER ? "never_looked"
                            : answer === WATERMARK_WITHIN_BAND ? WATERMARK_BAND_CAUSE : "purged";
  const statesFor = (gap) => new Set([...answersFor(enteredAfterFirstRow, gap)].map((a) =>
    contentAxisFor({ observed: null, missingCause: causeOf(a) }).state));
  console.log(`  corpus: ${placements} placements of the clock second × `
    + `${GAPS_SAME_SECOND.length} same-second gaps + ${GAPS_BEYOND.length} beyond `
    + `= ${placements * (GAPS_SAME_SECOND.length + GAPS_BEYOND.length)} pairs per rule`);
  t("M2a: THE CORPUS IS NON-EMPTY AND SWEEPS THE WHOLE SECOND — without this the "
  + "arms below could pass over nothing at all",
    [placements >= 100, GAPS_SAME_SECOND.length >= 8], [true, true]);

  /* **M2 IS CORRECTED BY D-516 RATHER THAN EXEMPTED, AND THE OLD ASSERTION IS
     QUOTED HERE BECAUSE IT IS THE DEFECT.** It read: *for every gap within one
     second, in either direction, the answer does not depend on where the clock
     second fell*, asserted as `unstable(rule, GAPS_SAME_SECOND) === []`. That was
     TRUE of D-500's two-way rule and it was true the wrong way round: the rule
     reached one stable answer for the whole band by PICKING a side of an interval
     the stored value does not resolve, which is the record choosing between two
     claims it cannot tell apart (BOB #33, 2026-09-24 17:58Z). Stability bought
     that way is not the property worth asserting, and asserting it is what would
     block the fix.
     **WHAT REPLACES IT IS STRICTLY STRONGER AND HOLDS FOR EVERY GAP, not only the
     same-second ones.** The failure D-486 measured (M-131) is a pair flipping
     between the two CLAIMS — `never_looked` on one run and `purged` on the next.
     That is now impossible for any gap at all, and the arm sweeps the whole corpus
     rather than half of it. A pair may still weaken from a claim to `within_band`
     as the second moves; it can never swap one claim for the other. */
  t("M2: NO PAIR EVER FLIPS BETWEEN THE TWO CLAIMS — over the WHOLE corpus, near "
  + "and far, no gap answers `after` on one placement of the clock second and "
  + "`before` on another. That swap is D-486's measured failure (M-131) and this "
  + "is the arm that says it cannot happen",
    [...GAPS_SAME_SECOND, ...GAPS_BEYOND].filter((g) => {
      const a = answersFor(enteredAfterFirstRow, g);
      return a.has(WATERMARK_AFTER) && a.has(WATERMARK_BEFORE); }), []);

  t("M2b: and REC-94's TIE IS NOT WITHDRAWN — no same-second gap, in either "
  + "direction, ever reaches `before`; a gap at or after the first row reaches the "
  + "tie on EVERY placement. The tie rests on simultaneity, and the shared clock "
  + "second was only ever the proxy the stored precision allowed",
    [GAPS_SAME_SECOND.filter((g) => answersFor(enteredAfterFirstRow, g).has(WATERMARK_BEFORE)),
     GAPS_SAME_SECOND.filter((g) => g >= 0)
       .map((g) => [...answersFor(enteredAfterFirstRow, g)].join("+"))],
    [[], GAPS_SAME_SECOND.filter((g) => g >= 0).map(() => WATERMARK_AFTER)]);

  /* **AND THE COST OF THE CORRECTION, MEASURED AND NAMED RATHER THAN LEFT FOR A
     READER TO DISCOVER — it is the honest half of what M2 used to assert.** A
     same-second pair whose subject entered BEFORE the first row now reads
     `within_band` on the placements that put the two in different clock seconds,
     where D-500's rule read `never_looked` on all of them. It is a WEAKENING and
     never a wrong claim, it is exactly what BOB #33 ruled for (inside the
     uncertainty the record states rather than picks), and it is the residue M3b
     names. Asserted, so that a later session meets the size of it as a figure
     rather than as a surprise. */
  t("M2c: THE MEASURED COST OF STATING RATHER THAN PICKING: the same-second gaps "
  + "that now reach `within_band` on SOME placements are exactly the negative ones "
  + "— a subject that entered before the first row — and none of the non-negative "
  + "ones. Positive statements are not weakened; unprovable ones are",
    [GAPS_SAME_SECOND.filter((g) => answersFor(enteredAfterFirstRow, g).has(WATERMARK_WITHIN_BAND)),
     GAPS_SAME_SECOND.filter((g) => g >= 0
       && answersFor(enteredAfterFirstRow, g).has(WATERMARK_WITHIN_BAND))],
    [GAPS_SAME_SECOND.filter((g) => g < 0), []]);

  /* **M3 IS THE ROW'S OWN ACCEPTANCE AND IT IS CORRECTED IN THE DIRECTION IT
     NAMED.** D-500 wrote this arm to NAME its residue: the gaps 1–2 s before the
     first row still answered `never_looked` or `purged` depending on where the
     clock second fell, and D-500 could only record that. BOB #33 ruled on exactly
     that sentence — *that is the record choosing between two claims it cannot tell
     apart* — so the arm now asserts what the ruling requires instead of naming
     what it could not do. The old assertion (`unstable(...) === [-1800,-1500,
     -1200]`) is kept as M3's own control in M4c below, driven on the SUPERSEDED
     rule, so this correction is never an equality between two things that were
     never different. */
  t("M3: THE GAPS D-500 MEASURED FLIPPING NEVER REACH A POSITIVE STATEMENT AGAIN — "
  + "for every one of them, at every placement of the clock second, the answer is "
  + "`before` or `within_band` and NEVER `after`. This is BOB #33's ruling at the "
  + "rule: inside the band the record does not pick",
    GAPS_BEYOND.filter((g) => g > -2000 && g < 0)
      .filter((g) => answersFor(enteredAfterFirstRow, g).has(WATERMARK_AFTER)), []);

  t("M3a: AND THE READER SAYS SO — the content axis reads UNDETERMINED for those "
  + "gaps at EVERY placement, which is BOB #33's accepts-when read at the level it "
  + "was written at: what the reader publishes, not what the comparison returns. "
  + "One state and one only, so the STATE no longer moves with the clock second",
    GAPS_BEYOND.filter((g) => g > -2000 && g < 0)
      .map((g) => [...statesFor(g)].sort().join("+")),
    GAPS_BEYOND.filter((g) => g > -2000 && g < 0).map(() => CONTENT_AXIS_UNDETERMINED));

  t("M3b: THE PAIRS OUTSIDE THE BAND ARE UNMOVED, asserted as the partition it is "
  + "rather than spot-checked: D-500's rule is `after ∪ within_band` and its "
  + "negation is `before`, so every pair it called `purged` is still `purged` and "
  + "every pair this rule calls `never_looked` it called `never_looked` too",
    [...GAPS_SAME_SECOND, ...GAPS_BEYOND].filter((g) => {
      for (let off = 0; off < SECOND; off += STEP) {
        const rowTrue = BASE + off, e = iso(rowTrue + g), f = cut(rowTrue);
        const now = enteredAfterFirstRow(e, f), was = d500(e, f);
        if (was && now === WATERMARK_BEFORE) return true;          /* a `purged` invented */
        if (!was && now !== WATERMARK_BEFORE) return true;          /* a `purged` lost */
      }
      return false; }), []);

  /* WHAT THIS RULE STILL CANNOT DO, NAMED RATHER THAN SCORED ZERO — D-500's ceiling
     NARROWED, not lifted, and this is the honest statement of what BOB #33's ruling
     bought. The band is still ENTERED and LEFT as the clock second moves under a
     fixed pair, so a subject a few milliseconds before the first row reads `after`
     on most placements and `within_band` on the rest. What changed is the KIND of
     the residue: it is now a claim weakening to *this record cannot tell*, never a
     claim swapping for the opposite claim (M2). Closing it entirely needs the
     watermark stored with milliseconds, which `ISO_TS_RE` does not admit and which
     BOB #33 ruled against — an interface question, and not this row's. */
  t("M3c: THE RESIDUE, NARROWED AND NAMED: gaps whose ANSWER still depends on the "
  + "boundary remain, and every one of them is a boundary between a claim and "
  + "`within_band` — never between the two claims. The kind of the residue is what "
  + "this row moved; closing it needs a millisecond watermark",
    unstable(enteredAfterFirstRow, [...GAPS_SAME_SECOND, ...GAPS_BEYOND])
      .every((g) => { const a = answersFor(enteredAfterFirstRow, g);
                      return a.has(WATERMARK_WITHIN_BAND) && a.size === 2; }),
    true);

  /* THE ARM THAT MAKES M2 MEAN SOMETHING. */
  /* DECLARED [-900, -500, -100] AND THE FIRST RUN ANSWERED [-900, -500, -100, -1].
     CORRECTED HERE WITH THE REASON RATHER THAN WIDENED: a gap of ONE millisecond
     before the first row is inside the shipped rule's band like any other — it was
     left out of the declaration because a 1 ms gap reads like a tie, and under the
     shipped rule a "tie" was never an equality of instants at all but a shared
     clock floor. That is the item's whole subject arriving inside its own control
     declaration, which is why it is recorded instead of smoothed. */
  t("M4: THE SUPERSEDED RULE FAILS M2 ON THIS CORPUS — its band sits exactly on the "
  + "same-second pair, which is D-486's measured flip reproduced here on purpose",
    unstable(shipped, GAPS_SAME_SECOND).sort((a, b) => a - b), [-900, -500, -100, -1]);
  /* D-516 — **M3's OLD ASSERTION, KEPT AND POINTED AT THE RULE IT WAS TRUE OF.**
     It is what makes M3's correction mean something: D-500's rule really did flip
     these three gaps between its two answers, so M3 is not an equality between two
     things that were never different. It is driven on `d500` and NOT on `shipped`,
     because `shipped` is REC-94's rule from one landing earlier and answers these
     three gaps stably — a control on it would have armed nothing. */
  t("M4c: D-500's RULE FLIPS EXACTLY THE THREE GAPS M3 NOW COVERS — "
  + "1–2 s before the first row, flipping between `never_looked` and `purged` on "
  + "where the clock second fell. That is D-500's own named residue, reproduced "
  + "here on purpose as the control for M3",
    unstable(d500, GAPS_BEYOND).sort((a, b) => a - b), [-1800, -1500, -1200]);

  t("M4b: AND A PLAIN `Date.parse` RE-SPELLING WOULD HAVE FIXED NOTHING — measured, "
  + "not assumed: over the whole corpus it answers IDENTICALLY to the truncating "
  + "form, because the stored watermark is already a whole second. The obvious fix "
  + "is a no-op and would have passed review looking like the fix",
    [...GAPS_SAME_SECOND, ...GAPS_BEYOND].filter((g) => {
      for (let off = 0; off < SECOND; off += STEP) {
        const rowTrue = BASE + off, e = iso(rowTrue + g), f = cut(rowTrue);
        if (shipped(e, f) !== (Date.parse(e) >= Date.parse(f))) return true;
      }
      return false;
    }), []);

  t("M5: A WATERMARK THAT CARRIES A FRACTION IS COMPARED EXACTLY — the uncertainty "
  + "is read off the VALUE, so the rule needs no edit if the stored precision ever "
  + "moves, and REC-94's tie narrows to an equality of instants",
    /* CORRECTED BY D-516: the rule answers three ways, so this arm reads the ANSWER
       and not a boolean. The property it pins is unchanged and is now sharper — a
       fractional watermark has a ZERO-WIDE interval, so `within_band` is not merely
       unused there, it is UNREACHABLE, and the three-way answer collapses back to
       two with no edit at the rule. */
    [watermarkUncertaintyMs("2026-09-24T12:00:15Z"),
     watermarkUncertaintyMs("2026-09-24T12:00:15.900Z"),
     enteredAfterFirstRow("2026-09-24T12:00:15.100Z", "2026-09-24T12:00:15.100Z"),
     enteredAfterFirstRow("2026-09-24T12:00:15.099Z", "2026-09-24T12:00:15.100Z"),
     enteredAfterFirstRow("2026-09-24T12:00:14.200Z", "2026-09-24T12:00:15.100Z")],
    [1000, 0, WATERMARK_AFTER, WATERMARK_BEFORE, WATERMARK_BEFORE]);
  t("M5b: and a value the rule cannot parse never reaches the positive statement — "
  + "the inverted default `causesNotRuledOut` takes one call up",
    /* CORRECTED BY D-516, and the correction is the POINT of the arm rather than a
       re-spelling: an unreadable value must not reach the BAND either. The band is
       a statement about a precision we can see; a value nobody can parse has no
       precision to plead, and letting it answer `within_band` would dress an
       unreadable datum as a measured uncertainty. */
    [enteredAfterFirstRow(null, "2026-09-24T12:00:15Z"),
     enteredAfterFirstRow("2026-09-24T12:00:15.100Z", null),
     enteredAfterFirstRow("not a date", "2026-09-24T12:00:15Z")],
    [WATERMARK_BEFORE, WATERMARK_BEFORE, WATERMARK_BEFORE]);
}

/* THROUGH THE OP, ON A STORE WITH AN EMPTY LOG — because a store-level agreement
   and a caller-reachable one are different claims, and only one of them is what a
   member actually gets. */
{
  const persist = mkdtempSync(join(tmpdir(), "d500-obs-"));
  const solo = withSurfacingRun(new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    durableObjectsPersist: persist,
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec93",
                VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" } }));
  try {
    const sPOST = async (q, b) => rP(await (await solo.dispatchFetch(`http://x/api/?${q}`,
      { method: "POST", body: JSON.stringify(b ?? {}) })).json());
    const sGET = async (q) => rP(await (await solo.dispatchFetch(`http://x/api/?${q}`)).json());
    const MB = "INQ-2026-0924-d500-watermark";
    const MSHA = "d".repeat(64);
    const text = `---\nid: ${MB}\n---\n\n## What\n\nA capture nothing has read.\n`;
    await sPOST(`op=promote&token=${ADM}`, {
      bundleId: MB, base: null, snapKey: "20260924T120000Z_d500",
      meta: { object_type: "inquiry", group: "believe-in-oakland", current_state: "open",
              created: T0, last_updated: T0 },
      files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text) }],
      register: [{ sha256: MSHA, path: "data/d500.pdf", encoding: "binary", bytes: 10 }] });

    const empty = await sGET(`op=frontier&token=${ADM}&level=content&limit=50`);
    t("M6: AN EMPTY CONTENT LEVEL IS UNDETERMINED AND SAYS SO — with no row at this "
    + "level at all the record cannot order the capture against a first row that "
    + "does not exist, so §5.1's cause (2) bucket takes it and `not_ruled_out` "
    + "names all three. It is NOT the positive statement",
      [(empty.missing_unexplained || []).find((r) => r.subject === MSHA)?.missing_cause,
       (empty.never_looked || []).some((r) => r.subject === MSHA)],
      ["purged", false]);

    const RUN_M = "RUN-2026-0924-d500";
    await sPOST(`op=airunopen&token=${TOK}`, {
      run: RUN_M, contextType: "inquiry", contextId: MB, label: "D-500's watermark",
      mode: "check", principalClaude: "project",
      principalClaudeRef: "believe-in-oakland/claude",
      skillVersion: "investigative-session@1", biasManifest: null,
      bounds: [{ bound: "fetches", allowed: 4, unit: "requests" }],
      leaseMs: 600000, at: "2020-01-01T00:00:00Z" });
    const tickM = await sPOST(`op=airuntick&token=${TOK}`, {
      run: RUN_M, at: "2020-01-01T00:00:00Z", leaseMs: 600000, consume: { fetches: 1 },
      log: [{ level: "content", subject: "observation:d500-watermark",
              state: "LOOKED_ABSENT", detail: "the first content-level row this log holds" }] });
    t("M6b: THE ARM IS ARMED — the watermark row really was appended, so the read "
    + "below is measuring a moved watermark and not a no-op",
      [tickM?.appended, (tickM?.refused || []).length], [1, 0]);

    const after = await sGET(`op=frontier&token=${ADM}&level=content&limit=50`);
    const row = (after.never_looked || []).find((r) => r.subject === MSHA);
    t("M7: AND WITH A FIRST ROW EARLIER THAN THE REGISTRATION THE OP REACHES CAUSE "
    + "(3) — §5.1's one cause that licenses a positive statement, through the op "
    + "rather than at the store",
      [row?.missing_cause, (after.missing_unexplained || []).some((r) => r.subject === MSHA)],
      ["never_looked", false]);
    t("M7b: THE SITE PIN — the op's answer IS the exported rule's answer on the op's "
    + "OWN two timestamps, so the reader cannot drift from the rule without this "
    + "going red",
      /* CORRECTED BY D-516 to read the ANSWER: the rule returns one of three words
         and `true` is no longer one of them. The property is unchanged. */
      [typeof row?.registered === "string",
       row ? enteredAfterFirstRow(row.registered, "2020-01-01T00:00:00Z") : null],
      [true, WATERMARK_AFTER]);
    t("M7c: and the SAME registration, read against a watermark placed anywhere "
    + "within a second of it, answers the same way — the op's real data driven "
    + "through every boundary placement M2 sweeps synthetically",
      row ? [...new Set([-999, -500, 0, 500, 999].map((d) => {
        const base = Math.floor(Date.parse(row.registered) / 1000) * 1000 + d;
        return enteredAfterFirstRow(row.registered,
          new Date(base).toISOString().split(".")[0] + "Z");
      }))] : null,
      /* CORRECTED BY D-516: one answer still, and it is now named rather than
         spelled `true` — the op's real registration is SIX YEARS after this
         watermark, so every placement within a second of it is far outside the
         band and the arm's subject is untouched. */
      [WATERMARK_AFTER]);
    /* WHAT THIS ARM CANNOT REACH, STATED — H6 and H11's form in the two sibling
       suites. `register.registered` is stamped by `op=promote` from the wall clock
       and no op sets it, so this section cannot place the watermark INSIDE the
       registration's own second through the plane; M2 drives those placements on
       the exported rule with the same two values the op passes, and M7b is what
       ties the two together. */
    t("M8: THE REACH OF M6–M7, STATED RATHER THAN ASSUMED: through the op this "
    + "section reaches the empty level and a watermark EARLIER than the "
    + "registration; it cannot place one inside the registration's own second, "
    + "because no op sets `register.registered`. That placement is driven on the "
    + "pure rule in M2 and tied to the op by M7b",
      [typeof row?.registered === "string",
       /op=promote/.test(SRC_STORE) && !/UPDATE register SET registered/.test(SRC_STORE)],
      [true, true]);
  } finally { await solo.dispose(); rmSync(persist, { recursive: true, force: true }); }
}

/* ------------------------------------------------------------------------- *
 *  M9 · D-516 / BOB #33 — THE BAND, THROUGH THE OP, IN BOTH READERS.
 *
 *  M8 states what section M could NOT reach through the plane: no op sets
 *  `register.registered`, so the watermark could not be placed inside the
 *  registration's own second. **This item reaches the band from the OTHER SIDE and
 *  the ceiling is narrowed rather than inherited:** the registration cannot be
 *  moved, but the WATERMARK can — `op=airuntick` takes its own `at` — so a row
 *  written at the second IMMEDIATELY AFTER the registration's second puts the pair
 *  in the band with no clock luck at all. A store-level agreement is not evidence
 *  a caller can reach the feature (`op=invitelook` shipped with a ReferenceError
 *  while 1,276 assertions passed), and BOB #33's accepts-when is written about the
 *  READERS, so it is asked of the readers.
 * ------------------------------------------------------------------------- */
{
  const persist = mkdtempSync(join(tmpdir(), "d516-band-"));
  const band = withSurfacingRun(new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    durableObjectsPersist: persist,
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec93",
                VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" } }));
  try {
    const bPOST = async (q, b) => rP(await (await band.dispatchFetch(`http://x/api/?${q}`,
      { method: "POST", body: JSON.stringify(b ?? {}) })).json());
    const bGET = async (q) => rP(await (await band.dispatchFetch(`http://x/api/?${q}`)).json());
    /* **PLACING THE PAIR IN THE BAND WITHOUT BEING ABLE TO SET EITHER SIDE.**
       `register.registered` is stamped by `op=promote` from the wall clock and no op
       moves it (M8), and the frontier publishes it only on a `never_looked` row —
       which is the one row this capture must NOT be on for the arm to mean anything.
       So the registration's SECOND is BRACKETED instead: the wall clock is read on
       both sides of the promote, and the attempt is kept only when both readings
       fall in one clock second, which pins the second the DO stamped inside it.
       A straddled attempt is RETRIED with a fresh subject rather than rounded, and
       a run that never brackets fails M9 by name rather than passing over nothing —
       the arm-that-never-armed shape, declared here because a timing fixture is
       exactly where it hides. */
    let BSHA = null, regSecond = null;
    for (let attempt = 0; attempt < 8 && regSecond === null; attempt += 1) {
      const sha = `${attempt}`.repeat(1) + "b".repeat(63);
      const bundle = `INQ-2026-0924-d516-band-${attempt}`;
      const text = `---\nid: ${bundle}\n---\n\n## What\n\nA capture in the band.\n`;
      const t0 = Date.now();
      await bPOST(`op=promote&token=${ADM}`, {
        bundleId: bundle, base: null, snapKey: `20260924T120000Z_d516_${attempt}`,
        meta: { object_type: "inquiry", group: "believe-in-oakland", current_state: "open",
                created: T0, last_updated: T0 },
        files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text) }],
        register: [{ sha256: sha, path: "data/d516.pdf", encoding: "binary", bytes: 10 }] });
      const t1 = Date.now();
      if (Math.floor(t0 / 1000) === Math.floor(t1 / 1000)) {
        BSHA = sha; regSecond = Math.floor(t0 / 1000) * 1000;
      }
    }
    /* THE WATERMARK IS PLACED ONE SECOND AFTER THE REGISTRATION'S SECOND, which puts
       the registration in the clock second immediately before it — the band, by
       construction and not by where the second happened to fall. */
    const AT_BAND = regSecond === null ? null
      : new Date(regSecond + 1000).toISOString().split(".")[0] + "Z";
    t("M9: THE ARM IS ARMED AND THE PAIR IS IN THE BAND — the registration's second "
    + "was bracketed rather than assumed, and the rule itself is asked whether the "
    + "two values this fixture built really are the band",
      [typeof BSHA === "string", AT_BAND === null ? null
        : enteredAfterFirstRow(new Date(regSecond + 1).toISOString(), AT_BAND),
       AT_BAND === null ? null
        : enteredAfterFirstRow(new Date(regSecond + 999).toISOString(), AT_BAND)],
      [true, WATERMARK_WITHIN_BAND, WATERMARK_WITHIN_BAND]);

    const RUN_B = "RUN-2026-0924-d516";
    await bPOST(`op=airunopen&token=${TOK}`, {
      run: RUN_B, contextType: "inquiry", contextId: "INQ-2026-0924-d516-band-0",
      label: "D-516's band",
      mode: "check", principalClaude: "project",
      principalClaudeRef: "believe-in-oakland/claude",
      skillVersion: "investigative-session@1", biasManifest: null,
      bounds: [{ bound: "fetches", allowed: 4, unit: "requests" }],
      leaseMs: 600000, at: "2020-01-01T00:00:00Z" });
    const tickB = await bPOST(`op=airuntick&token=${TOK}`, {
      run: RUN_B, at: AT_BAND, leaseMs: 600000, consume: { fetches: 1 },
      log: [{ level: "content", subject: "observation:d516-band-content",
              state: "LOOKED_ABSENT", detail: "the first content-level row this log holds" },
            { level: "meaning", subject: "observation:d516-band-meaning",
              state: "LOOKED_ABSENT", detail: "the first meaning-level row this log holds" }] });
    t("M9b: BOTH WATERMARKS WERE WRITTEN, at the second this section chose — without "
    + "this the two reads below would be measuring an empty level",
      [tickB?.appended, (tickB?.refused || []).length], [2, 0]);

    const fc = await bGET(`op=frontier&token=${ADM}&level=content&limit=50`);
    const crow = (fc.missing_unexplained || []).find((r) => r.subject === BSHA);
    t("M9c: THE CONTENT READER STATES THE BAND AND DOES NOT PICK — the capture is "
    + "NOT in `never_looked`, its cause is the band's own word, and its `why` NAMES "
    + "the stored watermark's whole-second precision rather than a purge it cannot "
    + "evidence. BOB #33's accepts-when, at the first of the two readers",
      [crow?.missing_cause,
       (fc.never_looked || []).some((r) => r.subject === BSHA),
       /whole\s+seconds/.test(String(crow?.why)),
       /DOES NOT PICK/.test(String(crow?.why)),
       Object.prototype.hasOwnProperty.call(fc.missing_causes || {}, WATERMARK_BAND_CAUSE)],
      [WATERMARK_BAND_CAUSE, false, true, true, true]);
    t("M9d: and the SET it could not narrow is published on the row and is exactly "
    + "`purged`'s — the band widens nothing and narrows nothing, which is the whole "
    + "of what the third answer claims",
      [crow?.not_ruled_out, causesNotRuledOut("purged", { evidenceOneSided: false })],
      [causesNotRuledOut("purged", { evidenceOneSided: false }),
       causesNotRuledOut("purged", { evidenceOneSided: false })]);

    const ax = await bGET(`op=contentaxis&token=${ADM}&captureSha=${BSHA}`);
    t("M9e: AND THE PER-CAPTURE READ AGREES WITH THE FRONTIER — the content axis is "
    + "UNDETERMINED with `determined` false, not the `not_extracted` positive "
    + "statement D-500's rule reached on the placements that fell the other way",
      [ax?.indexed, ax?.determined, ax?.missing_cause, ax?.extraction,
       /whole\s+seconds/.test(String(ax?.why))],
      [CONTENT_AXIS_UNDETERMINED, false, WATERMARK_BAND_CAUSE, null, true]);

    const fm = await bGET(`op=frontier&token=${ADM}&level=meaning&limit=50`);
    const mrow = (fm.missing_unexplained || []).find((r) => r.subject === BSHA);
    t("M9f: THE MEANING READER STATES THE SAME BAND, with ITS OWN sentence — the "
    + "second of BOB #33's two readers, and the arm that would catch the fix being "
    + "made at one site and not the other",
      [mrow?.missing_cause, mrow?.subject_kind,
       (fm.never_looked || []).some((r) => r.subject === BSHA),
       String(mrow?.why) === MEANING_MISSING_ROW_CAUSES[WATERMARK_BAND_CAUSE],
       String(mrow?.why) === MISSING_ROW_CAUSES[WATERMARK_BAND_CAUSE]],
      [WATERMARK_BAND_CAUSE, "capture", false, true, false]);
  } finally { await band.dispose(); rmSync(persist, { recursive: true, force: true }); }
}

console.log(`\nobservation-log: ${pass} pass, ${fail} fail`);
} finally { await mf.dispose(); }
/* EXPLICIT IN BOTH DIRECTIONS, which `hygiene.test.mjs` requires of every suite:
   `process.exit(1)` alone leaves the GREEN path to node's default, and a suite
   that merely declines to fail is not the same as one that says it passed. */
process.exit(fail ? 1 : 0);
