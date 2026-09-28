/* ai-runs' DEC-49 rows (R35; K6, K64's pattern): each refusal this module mints carries its row, moved from the check
 * catalogue (`checks/bio-checks.mjs`) at the module's extraction with its reasons unchanged and its `where` naming the
 * site this module now holds. The catalogue keeps observation-log's C-22 rows (C-22.1–.4, .6, .9, .10, .17) until that
 * module's next job takes them; `../airun.mjs` exports `AI_RUN_CHECKS` as those rows and this module's, so every
 * reader of that name keeps every code. C-33's and C-66's other rows stay with their own families' owners (C-66.5
 * `inquiry`'s, C-66.6 `control-plane`'s). Each row here is an invariant of this module with its test
 * (`test/m/ai-runs/`). */

/* C-22's run rows: C-22.5, .8, .11–.16. The family's history and its reason for being one row per code are in the
 * catalogue's AI_RUN_CHECKS header, which stays with the rows left there. C-22.7 (`checkSkillVersion`'s, R8) is named,
 * not held: `skills` claims the row (its R25) and reads it from the catalogue, so it stays there until BOB rules
 * which module holds it; `./skill-version.mjs` reads it by name. */
export const AI_RUN_OWN_CHECKS = {
  /* §14b.6 IS THIS ITEM: "when a bound stops a run, the observation log says
     which bound and where it stopped". A close with no bound named is the
     `heldMatch` defect exactly — not found and did not finish looking made
     indistinguishable — so the terminate path REFUSES it rather than writing an
     unattributed ending. This is what makes "names the bound" a mechanism
     rather than an intention. */
  AI_RUN_BOUND_UNNAMED: {
    check: 'C-22.5',
    where: 'src/airun.mjs checkBound, called from src/ai-runs/index.mjs #aiRunTerminate',
    translation: 'The run stopped without saying what stopped it. '
      + 'Not finding something and not finishing the search are different facts, '
      + 'and only one of them licenses a conclusion.',
  },
  /* PL-18, 2026-08-09 — DEC-63'S GATE, AND IT IS THE ONE ROW IN THIS FAMILY
     THAT IS ABOUT WHO IS ASKING RATHER THAN ABOUT WHAT THE RUN OBJECT SAYS.
     Bob ruled 2026-08-09 that an investigation can be started by ANY MEMBER OF
     THE PROJECT: the gate is participation in the project the inquiry belongs
     to, and the capability token stays `contribute` only as the FLOOR beneath
     it. IS-6's provisional checked `contribute` alone.

     WHY IT IS ITS OWN CODE AND NOT THE CAPABILITY REFUSAL'S, which is the whole
     content of the item rather than a nicety. *You are not a member of this
     project* and *you lack contribute* are DIFFERENT FACTS ABOUT A MEMBER, and
     they have different remedies: one is answered by an owner of that project
     inviting you, the other by an administrator granting a capability. A single
     refusal covering both would tell a member nothing they can act on, which is
     DEC-49's rule and the ACT-AND-SAY principle in one place. The capability
     half keeps its own existing, differently-shaped refusal at the control
     plane (`NOT_CAPABLE`, carrying `needs`), so a caller can always tell which
     of the two stopped them.

     THE TRANSLATION DELIBERATELY NAMES NO PROJECT. A member who is not in a
     project may not be entitled to learn it exists — the skeleton-visibility
     rule (7.12) — so the canned sentence a surface renders says what happened
     and what to do, and the refusal's own `detail`, composed at the site, names
     only what the caller already put in their own request.

     CORRECTED 2026-09-19 by REC-145 (DEC-63 as amended by Bob, 2026-09-18): this refusal is now said
     ONLY over a run whose context is a PROJECT. A run over a question consults no project, so the old
     first sentence (*"asking the system to look into a question is work inside the project that
     question belongs to"*) stated the ruling Bob reversed — *a project does not own a line of inquiry*. */
  AI_RUN_NOT_PROJECT_MEMBER: {
    check: 'C-22.8',
    where: 'src/airun.mjs projectGate, called from src/ai-runs/index.mjs open/tick/close',
    translation: 'Asking the system to look into a project is work inside that project, and this '
      + 'account is not one of that project\'s participants. This is not about '
      + 'what the account is allowed to do in general — it is about which piece of work it is part '
      + 'of. Someone who owns that project can invite you to it.',
  },
  /* REC-153, 2026-09-19 — THE RUN'S CONTEXT IS THE KIND IT SAYS IT IS. Membership Architecture v2 §7, the
     DEC-63 ruling bullet, *"AND THE CONTEXT KIND IS CHECKED"* (BOB #16): *"A run's `contextType` must equal
     the named bundle's type; a mismatch is refused, and an id the caller cannot see answers as absent."*
     Once REC-145 made the run verdict turn on the KIND (a question consults no project), a run labelled
     `inquiry` over a PROJECT's id opened for a member who had not joined that project — the joined gate
     walked around by a word the caller chose.

     ONE CODE FOR THE MISMATCH, THE ABSENT ID AND THE HIDDEN ONE, and that is the §7.9 half of the ruling
     rather than economy. A second code for *"that is a project, not a question"* would be said over a
     project the caller can see and withheld over one they cannot, so the difference between the two codes
     would be the bit. The refusal is built from what the caller SENT and nothing else, which makes the
     three one object by construction (`#noSuchProject`'s discipline, one act over). It is one condition —
     *nothing of the kind you named answers to that id for you* — not two behind one number.

     CORRECTED THE SAME DAY on BOB #16's ruling (`7d03e852`), which the first build did not have: (i) A MACHINE
     SEES NO MORE THAN ITS PRINCIPAL — an `ai` credential's open over an id its member cannot see is that member's
     own absent answer, and an operator credential's open over a never-minted id is refused as absent too (the
     first build let a machine through for an id the store did not hold, on PL-18's word); (ii) THE KIND IS
     `RUN_CONTEXTS`' CLOSED VOCABULARY — any other word is refused HERE before any bundle is looked at, rather
     than matched against the bundle's type. Both are this row's one condition: the kind and id the caller named
     do not resolve to a context they can run in. A new code for (ii) was weighed and declined: C-22.12 is
     REC-152's, and the word refused is the caller's own, so the refusal can say which failed without a second
     code carrying any bit. */
  AI_RUN_NO_SUCH_CONTEXT: {
    check: 'C-22.11',
    where: 'src/airun.mjs checkRunContextKind, called from src/ai-runs/index.mjs open',
    translation: 'Nothing of the kind this run names answers to that id here. A run is over a question or a '
      + 'project, nothing else; a run over a question has to '
      + 'name a question, and a run over a project has to name a project. Something you cannot see is '
      + 'answered exactly as something that does not exist, so this says nothing about whether anything '
      + 'else goes by that id.',
  },
  /* REC-152, 2026-09-19 — TICK AND CLOSE ARE THE RUN'S PRINCIPAL'S ACTS (Membership v2 §7, "WHO MAY TICK
     AND CLOSE A RUN", BOB #16). C-22.12 and not C-22.11: CONDUCT #6 assigned C-22.11 to REC-153, which is
     on its own branch, so this number was taken with the gap left for it.

     WHY IT IS ITS OWN CODE AND NOT C-22.8's. *You are not in this project* and *this is not your run* are
     DIFFERENT FACTS with different remedies: the first is answered by an owner inviting you, the second by
     nobody — the run is its principal's, and one nobody drives ends on its own lease. A co-participant who
     is fully joined meets this and never C-22.8, and a single refusal covering both would tell them to ask
     for an invitation they already hold.

     SAID ONLY TO SOMEBODY WHO CAN SEE THE RUN'S CONTEXT. A caller who cannot is answered as for a run that
     does not exist, before this is reached (§7.9), so the sentence names nobody — neither the principal
     nor the caller — and the store's `detail` names only the rule. */
  AI_RUN_NOT_PRINCIPAL: {
    check: 'C-22.12',
    /* REC-165 (§11 item 5 rule 1, BOB #25): the run's two productions ask the same gate. */
    where: 'src/airun.mjs runPrincipalGate, called from src/ai-runs/index.mjs tick/close/runGate/#surfacingGate and by run-productions',
    translation: 'Only the person who started this investigation — or an AI credential they created '
      + 'for it — can continue it or end it. It is not about which projects you belong to or what '
      + 'you are allowed to do in general: an investigation nobody continues ends by itself when '
      + 'its time or budget runs out.',
  },
  /* REC-169, 2026-09-23 (INVESTIGATIVE-SESSION.md §14b.6 — A RUN IS BOUNDED, AND THE BOUND IS RECORDED). The tick
     wrote `consumed + Number(v)` for any figure, so the run's own principal could REFUND a bound its member set
     (`surfaces: -1`, and open another question). A figure is a non-negative whole JSON number; the refusal is the
     whole tick's (or the whole open's, for a seed), and nothing is written. Its own code and not C-22.5's: that one
     is a CLOSE naming no bound, this is a figure no bound can hold. */
  /* REC-172, 2026-09-23: ALSO the member's `allowed` at the open (it was written `Number(x) || 0`, so `-1`, `1.5` and
     `"3"` became a declaration nobody made). One code for both halves of a bound's figure — the rule is the same whole
     number — and the translation widened from SPENDING to GIVING an amount so it reads true of either. */
  AI_RUN_CONSUME_INVALID: {
    check: 'C-22.13',
    where: 'src/airun.mjs checkConsume, called from src/ai-runs/index.mjs tick and open',
    translation: 'The investigation gave an amount for its budget that is not a whole number of zero or more. '
      + 'A budget is set and used up in whole steps, and never goes down, so nothing was recorded for this step.',
  },
  /* REC-169 — THE BOUNDS THE PLANE COUNTS (`PLANE_COUNTED_BOUNDS`: `mints`, counted by extractPropose, and `surfaces`,
     counted by promote since D-85). WHY ITS OWN CODE: the figure may be perfectly well-formed; what is wrong is WHO
     is counting. The remedy differs too — the caller sends nothing for these, where C-22.13's caller sends a proper
     number. A zero claims nothing and is not refused. */
  /* REC-172, 2026-09-23: ALSO `lease` (`PLANE_DECIDED_BOUNDS`), at the tick and as a declaration at the open, and
     for ANY figure including zero. Same rationale — the plane decides it, off the clock — so the same code; the
     translation now names the lease beside the counts. */
  AI_RUN_BOUND_PLANE_COUNTED: {
    check: 'C-22.14',
    where: 'src/airun.mjs checkConsume, called from src/ai-runs/index.mjs tick and open',
    translation: 'This part of the investigation\'s budget is kept by the record itself — passages marked citable '
      + 'and questions opened are counted as the work lands, and whether the investigation is still alive is read '
      + 'off the clock — so the investigation cannot report it, up or down. Nothing was recorded for this step.',
  },
  /* REC-172, 2026-09-23 (INVESTIGATIVE-SESSION.md §14b.6). A tick's `consume` key naming no bound, and a `consume`
     that is not a map at all (an ARRAY, whose keys are positions), were SKIPPED: the tick answered `ticked: true` and
     spent nothing, so a caller believed it counted work the record never held (the live instrument vf4 sent an array
     for its whole life). The open DROPPED an entry naming no bound, so a member who declared `fetchs: 3` got a run
     with no fetch ceiling. Its own code and not C-22.13's: the figure may be perfectly good; what is wrong is that it
     names nothing the run has, and the remedy (spell the bound, send a map) differs. */
  AI_RUN_BOUND_UNKNOWN: {
    check: 'C-22.15',
    where: 'src/airun.mjs checkConsume (the tick\'s map, the open\'s list, and every key in either), called from src/ai-runs/index.mjs tick and open',
    translation: 'The investigation named a part of its budget that does not exist, or did not say which part '
      + 'it meant. Nothing was recorded, so no budget was spent or set that nobody could account for.',
  },
  /* REC-177, 2026-09-23 (INVESTIGATIVE-SESSION.md §14b item 6, BOB #30). A bound declared at `op=airunopen` with an
     ABSENT or ZERO `allowed` was opened at 0, and `finishedBound` reads 0 as NO CEILING — so the run recorded a bound
     it did not have. Refused at the open, nothing written. Its own code and not C-22.13's: C-22.13 is a figure of the
     wrong FORM (a string, a fraction, a negative), and 0 is a perfectly good whole number; what is wrong here is that
     the declaration states no allowance, and the remedy differs (state one, or do not declare the bound). */
  AI_RUN_BOUND_NO_ALLOWANCE: {
    check: 'C-22.16',
    where: 'src/airun.mjs checkConsume (the open\'s list, its allowance arm), called from src/ai-runs/index.mjs open',
    translation: 'The investigation was given a limit on part of its budget without saying how much it may use. '
      + 'A limit of nothing would mean no limit at all, so the investigation was not started. Give it an amount, '
      + 'or leave that part out.',
  },
};

/* C-33.29–.31 and C-33.45–.47: the open's own act-shape refusals, from the catalogue's ACT_SHAPE_CHECKS. */
export const AI_RUN_ACT_SHAPE_CHECKS = {
  /* ---------------------------------------------------------------------------
     UI-38's §14a RIDER, AND IT IS IN THIS FAMILY BECAUSE ANOTHER FAMILY'S SUITE
     REFUSED IT — WHICH IS THE CORRECT OUTCOME AND IS RECORDED RATHER THAN
     WORKED AROUND.

     REC-64 first put this row in `AI_RUN_CHECKS`, where the run's other three
     open-time conditions live. `airun.test.mjs` ARM D3 failed it: **every C-22
     allocation must name its enforcement site in a PURE CHECK MODULE**
     (`src/airun.mjs` or `src/skillpack.mjs`), so the catalogue can be walked to a
     pure function. This condition is enforced in `store.mjs` at the run-open
     door, so it does not satisfy that invariant and does not belong in C-22. The
     ARM WAS NOT WIDENED: an invariant relaxed to fit a new row is not an
     invariant, and this one is load-bearing — it is what lets `op=audit` reach
     every C-22 condition without opening the store.

     WHAT IT IS. §14a promises the running-session surface SAYS SO when the
     capability is unavailable, and IS-BUILD-PLAN's FL-6 row names the failure it
     guards: *"when no token resolves the capability is UNAVAILABLE and says so —
     never a silent no-op"*. UI-38 correctly LEFT that sentence rather than
     authoring it at the surface, because member-facing refusal wording is
     DEC-49's. The site already refused this condition — with NO CODE, so a
     surface could only render the operator's sentence verbatim or blank, the
     exact state DEC-49 ended.

     THE TRANSLATION SAYS "NOTHING RAN" IN SO MANY WORDS, on purpose: an
     unavailable capability must not be indistinguishable from a run that looked
     and found nothing. The second is a claim about the world; the first is a fact
     about us. That is `CLAUDE.md`'s "our governor refusing is not the source
     failing", arriving at the run door.

     ITS `where` IS A WHOLE FUNCTION AND NOT A REGION, which is the only one in
     REC-64's work — and the reason WAS a defect in the guard rather than a
     judgement about the span. `aiRunOpen` refuses with `started: false`, and arm
     C's matcher was `ok: false`, so a REGION here would have judged zero refusals
     and FAILED as a drifted marker. The whole-function form is honest at this site
     (every refusal `aiRunOpen` makes is a condition of opening a run) and the
     blindness was measured and delegated at the guard's own `codesChecked` floor.

     **REC-76 CLOSED THAT DELEGATION (D-236), AND THE WHOLE-FUNCTION `where` IS
     WHAT MADE IT PAY.** Arm C now grades an outcome by whether it DECLARES ITSELF
     A SUCCESS rather than by one literal, so this site went from `92L (0 judged,
     0 code(s) checked)` to four refusals judged — and TWO of them were CODELESS,
     at a governed site, for as long as the row has existed. They are the two rows
     immediately below. Nothing about the span changed; the instrument started
     seeing it.

     **D-589 (2026-09-25) NARROWED ALL THREE INTO REGIONS, AND THE PARAGRAPH TWO
     ABOVE IS NOW HISTORY, NOT RULE.** The whole-function `where` stopped being
     honest the moment a SECOND family's refusal was written inside `aiRunOpen`:
     REC-207's first draft put its re-run refusals in a narrowed region there and
     the guard failed them by name, because the region was judged once by its own
     rows and again by this whole-function site, where their codes are not rows.
     So each of these three rows now names the region around its one refusal
     (`is-airun-open-context`, `-capability`, `-already`), and arm C no longer
     judges a claimed region a second time from an enclosing whole-function
     `where` (the guard's `nestedRegionsIn`). What the narrowing costs, stated:
     the five RELAYED refusals in `aiRunOpen` (existence, kind, gate, skill,
     seed — each minted and governed at its own site) are not read at this
     function while no whole-function row names it.
     --------------------------------------------------------------------------- */
  AI_RUN_CAPABILITY_UNAVAILABLE: {
    check: 'C-33.29',
    where: 'src/ai-runs/index.mjs open > is-airun-open-capability, reached from op=airunopen',
    translation: 'Nothing was run, because this instance could not find an account to run it under. '
      + 'That is a fact about our setup and not an answer about your question: no searching '
      + 'happened, so nothing here should be read as having looked and found nothing.',
  },

  /* ---------------------------------------------------------------------------
     REC-76 / D-236 — THE TWO CODELESS REFUSALS THE WIDENED CLASSIFIER FOUND.

     Both have been at this governed site since before the row above was written,
     and neither was ever judged, because arm C could not see a refusal spelled
     `started: false`. They are not new conditions and they are not new refusals:
     they are two sentences a surface could only render verbatim or blank, which
     is the state DEC-49 ended. **The item that fixes an instrument owes the
     sites the instrument newly sees, and these are them.**
     --------------------------------------------------------------------------- */
  AI_RUN_NO_CONTEXT: {
    check: 'C-33.30',
    where: 'src/ai-runs/index.mjs open > is-airun-open-context, reached from op=airunopen',
    translation: 'Nothing was run, because the request did not say what the run is for or what it '
      + 'belongs to. A run has to sit inside a question or a project so that the people working on '
      + 'that question can see it happened; one belonging to nothing would be invisible to everybody.',
  },
  AI_RUN_ALREADY_OPEN: {
    check: 'C-33.31',
    where: 'src/ai-runs/index.mjs open > is-airun-open-already, reached from op=airunopen',
    translation: 'Nothing was run, because a run with this name is already on record here. The record '
      + 'keeps what each run did under its own name, so starting a second one under a name already in '
      + 'use would write two different histories into one place. Give this one a name of its own.',
  },

  /* ---------------------------------------------------------------------------
     REC-207 — THE RE-RUN LINK'S THREE REFUSALS (BOB #32, 2026-09-23 23:42Z).

     They are ACT-SHAPE conditions — the answer to *may this open carry this
     link* — so they belong here rather than in a family of their own (SK-1's
     rule, and the same one that put the BIAS_DEBT rows in BIAS_CHECKS).

     WHY THEY ARE REFUSALS AT ALL, rather than a link stored and judged later.
     `aiRunClose` settles a bias debt on the strength of `rerun_of`, so a link
     the record cannot stand behind is a DISCHARGE resting on the caller's word.
     The three conditions are the three ways that could happen: the run names
     itself, it names something that is not there, or it names work in another
     context whose lens is a different lens entirely.

     A WHOLE-FUNCTION `where`, AND WHY. These three were first written inside a
     narrowed REGION, which is what `kickoffs/WORKER.md` asks for — and
     `check-refusal-codes.mjs` then FAILED all three by name: `aiRunOpen`'s three
     rows of the time carried a WHOLE-FUNCTION `where`, and the guard judged a
     region's refusals twice, once at the region and once at the enclosing
     function, where their codes were not rows. So these three were written at
     the whole function. D-589 (2026-09-25) then narrowed those three neighbours
     into governed regions (`is-airun-open-context`, `-capability`, `-already`,
     the rows above) and made arm C judge a claimed region once, by its own rows
     (`nestedRegionsIn`). These three are now the ONLY rows naming `aiRunOpen`
     as a whole, and the three regions' lines inside it are governed by the
     regions, not by this site. Narrowing these three into a region of their own
     is now possible and has not been done.
     --------------------------------------------------------------------------- */
  AI_RUN_RERUN_SELF: {
    check: 'C-33.45',
    where: 'src/ai-runs/index.mjs open, reached from op=airunopen',
    translation: 'Nothing was run, because this run was told it is a re-run of itself. A re-run says '
      + 'which EARLIER piece of work it repeats, and a run pointing at itself would be able to clear its '
      + 'own outstanding re-run. Name the earlier run, or leave the field out.',
  },
  AI_RUN_RERUN_UNKNOWN: {
    check: 'C-33.46',
    where: 'src/ai-runs/index.mjs open, reached from op=airunopen',
    translation: 'Nothing was run, because the earlier run it says it repeats is not one this record '
      + 'holds for you. It may never have existed, it may have been removed, or it may belong to work '
      + 'you have not been brought into. Check the name.',
  },
  AI_RUN_RERUN_OTHER_CONTEXT: {
    check: 'C-33.47',
    where: 'src/ai-runs/index.mjs open, reached from op=airunopen',
    translation: 'Nothing was run, because the earlier run it says it repeats belongs to a different '
      + 'question or project. Repeating work means asking the same question again under the lens that is '
      + 'in force for it — somewhere else the group\'s declared lens can be a different one, so the two '
      + 'runs would not be comparable and settling anything on that basis would be wrong.',
  },
};

/* ===========================================================================
 * REC-69 — THE CONTEXT-KEYED RUN LIST'S REFUSALS. C-36, THREE NUMBERS.
 *
 * RENUMBERED C-34 -> C-36 on 2026-08-09 at this item's replay onto `main`, with
 * `node tools/mintid.mjs C` (floor C-35) rather than by reading this file and
 * adding one. REC-63's `ROUTE_MARK_CHECKS` took C-34.1-4 the same day and is
 * already on `main`, so it keeps the number. **REC-69 measured C-34 free when it
 * looked and was right when it looked** — which is exactly the finding D-243
 * recorded when seven items collided on an id in one day: the convention was the
 * defect, not the vigilance. **AND THE COLLISION WAS INVISIBLE TO THE BATTERY.**
 * 139/139 suites green at 8,887 assertions with two families both claiming
 * C-34.1-3; only `node civicos-ui/test/run.mjs` caught it, with *"Two conditions
 * behind one C-number are one condition as far as op=audit can see."* If you are
 * about to skip the UI harness because you opened no UI file, this is the receipt.
 *
 * `op=airuns&contextType=&contextId=` answers the one question about a run
 * that no op could answer at all: WHICH RUNS ARE IN THIS CONTEXT. Every other
 * `ai_runs` read is keyed by RUN ID — measured by UI-49 at all 14 sites — so a
 * window could show a run only to the member who already held its address, and
 * §14a's promise is about the teammate who did not.
 *
 * WHY THIS IS A NEW FAMILY RATHER THAN THREE MORE C-22 ROWS, since C-22's own
 * header warns that a new `*_CHECKS` family is a floor somebody must move.
 * C-22's invariant is stated there: its rows are facts about THE RUN OBJECT,
 * refused where the object is WRITTEN — the observation's absence word, the
 * ending's condition, the bound that stopped it, the three conditions the run
 * was formed under. **None of these three is a fact about a run.** They are
 * facts about THE QUESTION A CALLER ASKED, refused at a READ that may well
 * match no run at all — MEANING_READ_CHECKS' shape one construct over, and that
 * family is the precedent this one follows rather than C-22's (it was a family of
 * this file; since T5 it lives in `src/retrieval/checks.mjs`, retrieval's). The floor in
 * `civicos-ui/check-refusal-codes.mjs` is moved in the same turn, from the
 * figure the guard PRINTED.
 *
 * WHY THEY ARE REFUSALS AND NOT AN EMPTY ANSWER, which is the whole judgement
 * here. An unrecognised context kind that answered `runs: []` would tell a
 * member THERE ARE NO RUNS HERE — a claim about the record manufactured out of
 * a caller's typo, which is the failure this repository ranks worst (REC-52,
 * D-197) and the one `op=meaningrows` refuses for the same reason one table
 * over. The absence must be distinguishable from the mistake, so the mistake
 * stops.
 *
 * AND WHAT IS DELIBERATELY *NOT* REFUSED, because it is the same distinction
 * read the other way: a context that is REAL, well-formed, and holds no runs —
 * or holds runs the caller may not see — answers an ordinary EMPTY LIST. The
 * viewer gate withholds the row whole (REC-36) and publishes no count of what
 * it withheld, so "no runs here" and "no runs you may see" are ONE answer BY
 * CONSTRUCTION rather than by care. A fourth code for the unviewable case would
 * be the leak wearing a refusal's clothes.
 * ========================================================================= */
export const AI_RUNS_CONTEXT_CHECKS = {
  /* No kind named at all. There is no honest default: `inquiry` and `project`
     are different objects with different membership, and answering from one
     when the caller meant the other is a confidently wrong answer about a
     different context — MEANING_ROWS_NO_ARM's reasoning, one table over. */
  AI_RUNS_NO_CONTEXT_TYPE: {
    check: 'C-36.1',
    where: 'src/ai-runs/index.mjs listInContext > is-airuns-context, reached from op=airuns',
    translation: 'That request did not say what kind of thing to look in. '
      + 'Background work is attached either to a question or to a project, and those are '
      + 'different places — so the record asks which rather than choosing one for you.',
  },
  /* A kind was named and the record has no such context. Refused rather than
     answered empty: see the header — an empty answer here would be the record
     saying nothing is running, on the strength of a word it did not recognise. */
  AI_RUNS_UNKNOWN_CONTEXT_TYPE: {
    check: 'C-36.2',
    where: 'src/ai-runs/index.mjs listInContext > is-airuns-context, reached from op=airuns',
    translation: 'Background work is not attached to anything of that kind. '
      + 'Rather than answer as though nothing were running there, the record says so '
      + 'and names the kinds of thing it does attach work to.',
  },
  /* A kind but no id. The gate is compiled over the CONTEXT ID, so a blank one
     would ask the record about every context at once — which is not a wider
     answer, it is a different question nobody asked. */
  AI_RUNS_NO_CONTEXT_ID: {
    check: 'C-36.3',
    where: 'src/ai-runs/index.mjs listInContext > is-airuns-context, reached from op=airuns',
    translation: 'That request named a kind of thing but not which one. '
      + 'Background work belongs to a particular question or a particular project, '
      + 'and the record answers for the one you are looking at rather than for all of them.',
  },
};

/* D-85 / C-66.1–.4 — AN ASSISTANT OPENS A QUESTION ONLY INSIDE A RUN IT HOLDS (INVESTIGATIVE-SESSION.md §11
 * item 5, rule 2, BOB #25, 2026-09-21). Framework §12 lets an assistant open a question unattended and §13
 * requires it to carry the lens in force when it did; that lens exists only on a run (§3, RULED), and the
 * objective it pursued only as the run's context (DEC-24 rule 2). So an `ai` credential's creation of an
 * inquiry names a RUNNING run whose PRINCIPAL it is, and counts against the run's declared `surfaces` bound.
 * Asked by this module's step with `promotion` (R25) before the promotion's write, in REC-165's order: SIGHT
 * (a run the caller cannot see answers as one never minted, so SURFACE_NO_RUN covers both), then POSITION
 * (`runPrincipalGate`, C-22.12, relayed), then STATUS, then the BOUND. A MEMBER's own creation is untouched. */
export const SURFACE_RUN_CHECKS = {
  SURFACE_NO_RUN: {
    check: 'C-66.1',
    where: 'src/ai-runs/index.mjs #surfacingGate > is-surface-run',
    translation: 'An assistant opens a question only inside an investigation it is running, and this one '
      + 'named none that can be read here. The investigation is what records the lens and the purpose the '
      + 'question was opened under, so without one nothing could say why it exists. Nothing was created.',
  },
  SURFACE_RUN_NOT_RUNNING: {
    check: 'C-66.2',
    where: 'src/ai-runs/index.mjs #surfacingGate > is-surface-run',
    translation: 'The investigation this question was to be opened inside has ended. A question is read '
      + 'against the conditions of the investigation that opened it, and those stopped being current when '
      + 'it stopped. Nothing was created; a member can start a new investigation.',
  },
  SURFACE_NO_BOUND: {
    check: 'C-66.3',
    where: 'src/ai-runs/index.mjs #surfacingGate > is-surface-run',
    translation: 'This investigation was not given a limit on how many questions it may open, so it may '
      + 'open none: an assistant opening questions without a limit fills the record with questions nobody '
      + 'asked for. The limit is set by the member who starts the investigation. Nothing was created.',
  },
  SURFACE_BOUND_REACHED: {
    check: 'C-66.4',
    where: 'src/ai-runs/index.mjs #surfacingGate > is-surface-run',
    translation: 'This investigation has already opened as many questions as the member who started it '
      + 'allowed. Nothing was created. The investigation ends at its next step and says which limit '
      + 'stopped it.',
  },
};

/* R40 (K102, K182) / C-109 — NO RUN EXISTS IN A MODE NOT DEPLOYED (INVESTIGATIVE-SESSION.md §14b.4: every "may not"
 * is a refusal in the plane). The one deployment order (`./deployment.mjs`) names the modes that deploy, first to
 * last, and a mode enables only when the one before it is verified live. Before this row the plane stored any mode
 * string at the open and only `agent-worker`'s own first row (its `gate-mode`) refused one, inside the fleet member,
 * so a caller that never ran the harness could open a run, and produce under it, in a mode nobody deployed. The open
 * now refuses it, after the skill version and before anything is written; a run that names no mode opens in the
 * deployed mode and records it (K182 (4c)); a blank or undeployed one is refused. */
export const AI_RUN_OPEN_CHECKS = {
  AI_RUN_MODE_NOT_DEPLOYED: {
    check: 'C-109.1',
    where: 'src/ai-runs/index.mjs open > is-airun-open-mode, reached from op=airunopen',
    translation: 'Nothing was run, because the kind of work this run asked for is not switched on for this '
      + 'instance yet. Kinds of work are switched on one at a time, each only after the one before it has been '
      + 'checked in real use. Ask for a kind that is switched on, or leave the kind out to run the one that is.',
  },
};

/** Every row this module holds, by code. */
export const AI_RUNS_CHECKS = Object.freeze({ ...AI_RUN_OWN_CHECKS, ...AI_RUN_ACT_SHAPE_CHECKS, ...AI_RUNS_CONTEXT_CHECKS,
  ...SURFACE_RUN_CHECKS, ...AI_RUN_OPEN_CHECKS });
