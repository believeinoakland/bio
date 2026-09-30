# affordances (T15)

**Status** · session_01G3caQxYgKYDvauywiLFZHC · depth 2 · WORKING · handled B1

## Completion (AFFORDANCES #7)

**Entries applied** (plan layer 11; B1). (1) N345's rungs (K447, K481): R1 `contradictionresolve` in `ACTS`, weight `single`; R2 `contradictiondismiss`, `contradictionclarify`, `contradictiontakeup`, `contradictionresolve`, `resolutiondefect` graded `reasoned`, and the four codes their refusals use added to `JUSTIFICATION_REFUSALS` (`DISMISSAL_REASON_UNKNOWN`, `CLARIFY_NO_EXPLANATION`, `WRONG_SIDE_NO_REASON`, `TAKE_UP_NO_QUESTION`; `NO_CONCLUSION`, `NO_REASON` already held); R3 `contradictionrecommend`, `contradictionoptin`, `contradictionrespond` graded `undetermined`, each with its sentence; R4 `contradiction_coordinates`, `plurality_differences`, `resolution_kinds`, `norm_canons` (inquiry R46) and `dismissal_reasons` (contradiction R31), each the same reference; R7 `MACHINE_REFUSALS.contradictionresolve` → `MACHINE_CANNOT_ACT_ON_CANDIDATE` and `NON_ACTS` rows in R7's words for the three candidate-directed acts, `contradictionrecommend`, `resolutiondefect`, the opt-in and response, and the six reads; R8 `conclude` withheld on a contradiction inquiry, `contradictionresolve` offered there on conclude's state-machine arm (J1 item 2); R14 `contradiction_inquiry` from the front matter (null off an inquiry). (2) MEMBERSHIP #7's report: `projectownerrescue`'s comment names `NOT_AN_ADMIN` (membership `rescueRefusal`). (3) Handovers: `contradictionpairs` names five keys (K490); `comparisonpropose`'s two lines name the contradiction it may start from (conformance R21); `comparisonfacts` is an ungated read named in no registry (J1 item 3); every op T15 added is in the lists as its rung requires (tested against contradiction's op map). Files: `src/affordances.mjs`, `src/affordances/facts.mjs`; tests `catalogue`, `derive`, `plane` amended, `contradiction.test.mjs` new (over contradiction's own fixture: the fact's true arm, the offer agreeing with the act, R19's backing for the five, R20 at `resolve`'s method).

**`not yet met` marks my work meets** (for BOB to strike, K460): R1, R2, R3, R4, R7, R8, R14 (N345).

**Readings taken** (J1), all three confirmed by B2 (K516) and folded into R7 and R8: (1) `contradictionmeasures` in no registry (tested named nowhere); (2) `contradictionresolve` on conclude's state-machine arm only; (3) `comparisonfacts` in no registry. B3, B4: control-plane's rows merged (K519); the tranche merged into this branch before the final runs.

**Deferred:** nothing.

**Rows `awaiting stamp`:** none (no check row added, moved or retired).

**Found in other modules** (REPORT J2): control-plane's rows for the new ops, and seven legacy suites newly red until they land or are re-anchored; R27's count; an R18 residue against `contradiction.resolve`'s side-sight gate; the plane bundle stale.

**Greps.** `civicos-ui/`: no hit for any name added (`contradictionresolve`, `contradiction_inquiry`, the five vocabulary keys, the four justification codes, `MACHINE_CANNOT_ACT_ON_CANDIDATE`) or for "four named keys". Nothing retired.

**Tests and checks run.**
- `node --test test/m/affordances/` (after merging `tranche/T15` with control-plane, B4): tests 90, pass 90, fail 0, todo 0.
- Users of affordances, same tree: control-plane 57/0, queue 69/0, skills 33/0, monitoring 65/0 (6 todo).
- The seven legacy files, re-run on the same tree. Green now: `test/skillpack.test.mjs`, `test/skillpack.control.mjs`, and `test/affordances.test.mjs`'s four NEEDS/OPS arms. Still red, all legacy-tests' pins:
  - `test/affordances.test.mjs`: "thirty acts" is 31.
  - `test/rung-ladder.test.mjs`: NO UNBACKED CLAIM names `contradictionresolve`. Its source scan does not follow `resolve`'s delegation to basis-versions' `NO_CONCLUSION`, which is driven in `test/m/affordances/contradiction.test.mjs`. The other four new `reasoned` ops and BACKWARD/EXACT pass.
  - `test/d311-roster-affordances.test.mjs`: the FIXTURE GUARD wants a drive for `contradictionresolve`, then throws at :373.
  - `test/rung-ladder.control.mjs` and `test/d311.control.mjs`: each refuses to run its arms over those red baselines.
- Earlier run, before the merge:
- Legacy suites naming affordances (67 files, and each red one again on `tranche/T15`): red on the base as here, 15 (controls and probes that fail by design, and `derivation-bounds`). Newly red: `test/affordances.test.mjs` (5), `test/d311-roster-affordances.test.mjs` (2), `test/d311.control.mjs`, `test/rung-ladder.test.mjs` (4), `test/rung-ladder.control.mjs`, `test/skillpack.test.mjs` (A9), `test/skillpack.control.mjs`; causes in J2.
- `node checks/format.mjs`: 0 failures. `architecture.mjs affordances`: 8 product files, 0 failures. `coverage.mjs affordances`: 27 of 27 live ids, 0 failures. `ownership.mjs affordances tranche/T15`: 0 failures.

Size (session_01G3caQxYgKYDvauywiLFZHC): test runs 27, module lines 2801

## J1 · QUESTION

Three readings I am building on; each is my best reading, and I carry on with it unless you answer otherwise.

1. **R7's `contradictionmeasures`.** R7 puts a read `contradictionmeasures` in `NON_ACTS`, but no such op exists: contradiction's R39/R40 (`acceptanceRates`, `dismissalMeasure`) are in-process methods, absent from `contradictionOps` and from control-plane's START (its twelve). A `NON_ACTS` key the control plane's table does not carry as gated reads `stale` under R12, which would turn control-plane's totality test red. **Best reading:** I leave it out and mark that part of R7 with a `test.todo` naming this cause, until an op exists (then a one-line addition). If you would rather I add it, say so and I will.

2. **R8's "`contradictionresolve` is offered exactly where `conclude` would be" on a contradiction inquiry.** `conclude` has two arms: the state machine's edge to `concluded`, and the project arm (`current_state === "concluded"` and `concludes_for_project === true`). `contradiction.resolve` always concludes **without** a project (basis-versions R16, contradiction R36), so on an already-concluded contradiction inquiry it would be refused `ILLEGAL_TRANSITION`. Offering it there would break R18. **Best reading:** `contradictionresolve` is offered on an inquiry whose `contradiction_inquiry === true` and whose machine has an edge to `concluded` (conclude's state-machine arm only). `conclude` is withheld on every contradiction inquiry, both arms. If you want the literal reading instead, R18 needs a word.

3. **`comparisonfacts` (conformance R21, CONFORMANCE #4's handover).** It is a read. Conformance's reads carry no `NEEDS` row (`CONFORMANCE_READS`), so under R12 it belongs in none of affordances' registries: `op=projectstage`'s precedent, K424. **Best reading:** no row, with a test that it is named nowhere and leaves nothing unaccounted as an ungated read. This holds only if control-plane gives it no `NEEDS` row. If CONTROL-PLANE #6 gives it one, it needs a `NON_ACTS` row ("read: …"). Please confirm which, since the two jobs must agree.

Also noted, not asked: the R7 reads (`contradictioncandidates`, `contradictiontensions`, `contradictionfacts`, `contradictionnotices`, `contradictionresponses`, `publishtensions`) get `NON_ACTS` rows as R7 says. So control-plane must give each a `NEEDS` row (as `contradictionpairs: null` has), or R12 reads them `stale`.

## J2 · REPORT

Found outside affordances, against each module's requirements:

1. **control-plane (layer 11, beside me): the rows my lists now need.** Every N345 op is in affordances' registries, so `unaccounted` (R12) is empty only when control-plane's table carries:
   - the eight writes as mutating and gated: `contradictiondismiss`, `contradictionclarify`, `contradictiontakeup`, `contradictionresolve`, `contradictionrecommend`, `contradictionoptin`, `contradictionrespond`, `resolutiondefect`;
   - the six reads as gated (a `NEEDS` row, `contradictionpairs: null`'s pattern): `contradictioncandidates`, `contradictiontensions`, `contradictionfacts`, `contradictionnotices`, `contradictionresponses`, `publishtensions`;
   - `comparisonfacts` with no `NEEDS` row (J1 item 3).

   `contradictionresolve` also needs session reach (`SESSION_OPS`) and a `NEEDS` capability. Until then `op=affordances` decorates it `mode: "machine"`, `needs: null`.

2. **legacy-tests: seven suites newly red on this branch**, each green on `tranche/T15`.
   - **Go green once control-plane's rows land:**
     - `test/rung-ladder.test.mjs`: BACKWARD, and `unaccounted`'s agreement.
     - `test/affordances.test.mjs`:
       - "NON_ACTS names only ops that exist in NEEDS";
       - "every published act is a real op in the OPS table";
       - "every published act carries a NEEDS entry";
       - the `[contribute, session]` list.
     - `test/skillpack.test.mjs` A9 (one act at `mode: machine`).
     - `test/skillpack.control.mjs`.
   - **Pins legacy-tests re-anchors:**
     - `test/affordances.test.mjs`: "thirty acts" is now 31.
     - `test/rung-ladder.test.mjs`: "EXACTLY 170" is now 178, with control-plane's eight.
     - `test/rung-ladder.test.mjs`: "NO UNBACKED CLAIM" scans source for the five new `reasoned` ops' codes. They are backed, and driven at contradiction's and entities' interfaces in `test/m/affordances/contradiction.test.mjs`.
     - `test/d311-roster-affordances.test.mjs`: the FIXTURE GUARD wants a drive for `contradictionresolve`, and the suite then throws at :373. It is driven in `test/m/affordances/plane.test.mjs` R20 through the durable object's route, answering `MACHINE_CANNOT_ACT_ON_CANDIDATE`.
     - `test/d311.control.mjs`: red for the same drive.
   - 15 other files red here are red on the base too.

3. **affordances' own requirements, wording (BOB's):**
   - R27 says N345's three make **59** `undetermined` ops (K481: 56 → 59). The table held 57 before them, the 57 R27's own test names (T8 layer 11's `actionriskpropose` is the one the count missed), so it is **60** now.
   - R7 names `contradictionmeasures` (J1 item 1).

4. **contradiction R36 against affordances R18: a residue.**
   - `contradiction.resolve` refuses `NOT_A_CONTRADICTION_INQUIRY` to a viewer who may see the inquiry but not both of its candidate's sides (`#sideSeen`).
   - R14's fact is read from the front matter and says nothing of side sight. So such a viewer is offered `contradictionresolve` and refused.
   - A fix needs a fact R14 does not carry (for example, whether the viewer sees both sides of the linked candidate). That is BOB's to word if wanted. I have not added it.

5. **Generated artifact stale** (§14): `bio-plane/dist/bio-plane.bundled.mjs` (it bundles `src/affordances.mjs`). Not rebuilt.

## J3 · COMPLETE

Complete on J1's three readings (record, Completion). Tests: test/m/affordances 89 pass, 0 fail, 1 todo; users control-plane, queue, skills, monitoring 0 fail; four checks 0 failures. N345 marks met: R1, R2, R3, R4, R8, R14, and R7 but for contradictionmeasures. REPORT J2 names control-plane's rows and the seven legacy suites they turn green or legacy-tests re-anchors. An ANSWER to J1 that differs re-opens items 1–3 only.
