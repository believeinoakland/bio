# The investigative session — proactive AI claim formulation

**Status** · The design for the investigative session — a skilled AI run that reads an inquiry, searches evidence across four levels, and writes SUGGESTED basis versions a member accepts or rejects — by Bob with session BOB, 2026-08-05, rewritten twice that day, v3 on 2026-08-07 absorbing the IS sweep. It carries the reasoning for DEC-60 (proactive claim formulation), DEC-61 (device-local transcripts) and DEC-62 (pursue and investigate are one session), inline `[BOB-2/3/4]` rulings of 2026-08-07 and four SETTLED delegations; §16 lists fifteen withdrawn positions and §18's hold sentence is struck as SUPERSEDED. Complete as design and superseded by the build: `IS-BUILD-PLAN.md` decomposed §18 into 43 rows and `QUEUE.md`'s IS BUILD PLAN status records COMPLETE 2026-09-13. The caveat: the preconditions the text still calls open — D-222, D-216, D-218, the `[BOB-4]` provisional — have since landed, been answered or been overtaken (DEC-52 final, DEC-72's reshaping of the published case), so its "what is NOT settled" list is history. **§14c's "Related finding" paragraph was CORRECTED IN PLACE on 2026-09-15 by REC-99** — it said in the present tense that the three meaning-layer reads "are uncapped", false since REC-60 capped them on 2026-08-07 under IC-25, and it is one of the two citations that put already-finished work back on the queue (REC-89). Nothing else in the document moved and no section's completeness changed. §7.1 (a conclusion belongs to the project's relationship with the inquiry, BOB #15) added 2026-09-18, and BUILT IN PART the same day by REC-124 (IC-150): items 1, 2, 3 and 5 are in the plane; item 4 is not. Items 6-8 (BOB #15, from REC-124's build) were BUILT the same day by REC-136 (IC-153): a no-project conclusion names the reading it adopts, and a project's conclusions and withdrawals are an append-only history (Incomplete sections). §7.1 gained the question page's uncapped read of the no-project conclusion (BOB #16, 2026-09-19), BUILT WHOLE the same day — the plane half by REC-144 (IC-160) and the SURFACE half by UI-67, which also discharged REC-142's delegation to UI and needed no interface change of its own. §7.1 item 4 was BUILT 2026-09-19 by REC-135 (IC-166) — `op=publish`'s `NOT_CONCLUDED` and the `publish` affordance now ask the PUBLISHING PROJECT's relationship and the case document records the conclusion it rests on; the item was NARROWED at the code first, and its `op=reopen` and leg clauses are answered there rather than built. §7.1 gained item 9 on 2026-09-21 (BOB #19): a project's moved conclusion warrants a new case edition. §12 gained clause (c) the same day (BOB #22): D-195's disclosure at the member's own elicitation. §11 gained item 5 the same day (BOB #25, D-85): the run a production names is one its caller holds and is running, an assistant opens a question only inside a run, and the run records the lens in force at its open (Incomplete sections). §7.1 item 9 was BUILT the same day by REC-157 (IC-173): `ALREADY_A_CASE_MEMBER` compares the publishing project's relationship through ONE comparison, so a moved project conclusion warrants a new edition over bytes a case already pins; the item's premise that concluding on another claim leaves `bundle_sha` unmoved was measured FALSE whenever the project's pointer moves AFTER publication (`op=versioncurrent` writes into the shared question's own bytes), which is recorded as a design gap in Incomplete sections. §7 gained a ruling on 2026-09-22 (BOB #25, REC-157's delegation): a project's make-current writes nothing on the shared question, only on the project — BUILT the same day by REC-166 (IC-175): `op=versioncurrent&project=` promotes only the project, the receipt and its authored reason in the pointer's own promotion, which closes design gap (d). §11 item 5 gained rule 1's target the same day (BOB #28, REC-165's builder's question): a suggestion lands only inside its run's context. §7.1's design gap (e) was CLOSED the same day by REC-167 (IC-177): `op=caseratify` asks, of the one document being signed, the two questions `op=publish` asks, and refuses `CASE_CONCLUSION_MOVED` (C-65.1) where the publishing project no longer stands on the conclusion it records. §11 item 5 rule 1 and its target were BUILT the same day by REC-165 (IC-176); rules 2 and 3 are not (Incomplete sections). §11 item 5's `op=capturerequest` ruling (BOB #28) was BUILT on 2026-09-23 by REC-168 (IC-178): the door takes the same stamp and asks sight, then `runPrincipalGate`, then running, and its row records the caller's principal. §11 item 5 rules 2 and 3 were BUILT on 2026-09-23 by D-85 (IC-181): an `ai` credential's creation of a question names a running run it holds, within the run's `surfaces` bound, and is linked to it by an instance row the question's read states; the run records the lens in force at its open and tells a stale hand from a lens that moved. §11 item 5's "Rule 2's reach" (BOB #30) was BUILT the same day by REC-171 (IC-186): an admin, member or probe deploy token's creation of a question — stamped `surfaced_by: agent` by D-78 — names a running run the token holds, by the run verbs' own principal stamp, under the same bound, codes and link row; one caller that cannot honestly be moved inside a run (`migrate.mjs`) is brought to BOB (Incomplete sections). §14b.6's bound takes a figure only on a bound the run has, as a map at the tick and a list at the open, with a whole-number allowance and never for `lease` (REC-172, IC-188 PROPOSED, 2026-09-23). as of 2026-09-23.

**Place in the system** · Level-2 design serving `BIO_System_Design.md` §3 row 8 (intent and inquiry; home `BIO_Content_Framework_v0_10.md` Part I §12 and `BIO_Case_Making_v0_1.md`) and row 11 (the assistant; home `BIO_Assistant_and_AI_Roles_v0_1.md` since 2026-09-14, whose §4 places this design as the first AI integration built). `IS-BUILD-PLAN.md`, `kickoffs/SKILL.md`, `agent-worker`, `airun.mjs` and the DEC-60/61/62 enactments depend on it; the landed plan rows, DEC-52 final, DEC-72 and Part II §14.3/§17 supersede parts of it.

**Incomplete sections** ·
- §7 — a project's make-current writing nothing on the shared question is RULED (BOB #25, 2026-09-22) and BUILT the same day (REC-166, IC-175): nothing open under it. Its class sweep MEASURED the same shape on the publication path (M-100): a second project's `op=publish` stamps case fields into a finding another project's case pins, unpinning and flagging that case — routed to BOB (the fix changes what a member signs), §7's "Built" paragraph.
- §11 item 5 — RULED (BOB #25, 2026-09-21), BUILT: rules 2 and 3 were BUILT on 2026-09-23 by D-85 (IC-181, `bio-plane/test/d85-surface-run.test.mjs`, sixteen-arm control), which supersedes this bullet's "NOT BUILT" sentence below, kept as the record. Rule 2: `op=promote` creating an inquiry under an `ai` credential asks sight, `runPrincipalGate`, status and the run's declared `surfaces` bound (C-66.1..4), writes `inquiry_run_surfacings` keyed by the inquiry (both purge arms, never its bytes), and `op=projection` states `surfaced_in` with the run's lens block, `not recorded` where none; a member's creation is untouched. Rule 3: `ai_runs.lens_at_open`, and the lens block's `at_open`, `hand` and `moved`. STILL OPEN, routed with their fixes in D-85's report: ~~DESIGN GAP (D-85) — rule 2 names the `ai` credential, and the instance's other machine classes (admin, member and probe tokens) still create questions stamped `surfaced_by: agent` outside any run (BOB's: does rule 2 reach them?)~~ ANSWERED by BOB #30 and BUILT 2026-09-23 by REC-171 (IC-186, see the bullet on rule 2's reach below); and `op=airuntick`'s `consume` takes a negative delta, so a run's principal can refund a plane-counted bound (`mints`, `surfaces`). Rule 1 and its target (BOB #28) are BUILT by REC-165 (IC-176, 2026-09-22): `op=suggest` and `op=extractpropose` take REC-152's one `principal` stamp and ask, in order, sight (an unseen run's context answers as a never-minted id), position (`runPrincipalGate`, C-22.12) and status (`op=suggest` refuses an ended run, `SUGGEST_RUN_NOT_RUNNING` C-27.18); a suggestion outside its run's context is refused `SUGGEST_OUTSIDE_RUN_CONTEXT` (C-27.19) after sight and position (`bio-plane/test/rec165-production-principal.test.mjs`, nine-row control). NOT BUILT: rule 2 (an `ai` credential still creates an inquiry outside any run, with no lens and no bound) and rule 3 (a run records only the manifest it was handed). MEASURED BY REC-165, RULED BY BOB #28 AND BUILT 2026-09-23 BY REC-168 (IC-178): `op=capturerequest` took a `run` and copied its principals into the request row without asking whose run it was; it now takes the same stamp, asks sight, `runPrincipalGate` and status in that order, and records the CALLER's principal (`bio-plane/test/rec168-capturerequest-principal.test.mjs`, eleven-row control). DESIGN GAP (REC-168): the ruling's *"a request naming no run is the member's own"* describes no path the plane has — the door has always refused a request naming no run (`CAPTURE_REQUEST_NO_RUN`, DEC-47), so there is no run-less request, and nothing was built for one. Still routed: `agent-worker`'s one `suggest` site does not bound a candidate's target to its run's context (BOB #28's builder measurement), its table-made empty-level candidates carrying no target at all.
- §12 (c) — D-195's shared-origin disclosure at the member's own elicitation is RULED (BOB #22, 2026-09-21) and NOT BUILT: no read yet computes independence over a partition before it is written, and UI-27's read-back shows none.
- §14c — options graded 2026-08-06; option A LANDED (PL-8, the MEANING arm) while D-222's debt row still reads open; stage C (content-grain search) sits in Part II §18, not queued.
- §THE READ SURFACE HAS A HOLE — **D-164 CLOSED 2026-09-22 (BOB #26, `BIO_Content_Framework_v0_10.md` §18): what this bullet says of its open row is history; the composition-path question at its end is this document's and stays UNDETERMINED.** The two-route measurement is partly stale; D-164, the "second precondition", REOPENED 2026-09-15 and still unbuilt, so versions still compose document-grain legs. **NARROWED 2026-09-19 by BOB #18 (at D-226's closing), in two halves that must not be collapsed:** the leg REFERENT is built — `inquiry_basis.content_id` and `inquiry_basis_version_legs.content_id` both exist and are indexed (REC-82 / IC-83), verified by name at the schema — and D-164's open row is now a DESIGN row for Part II §18, not that build. **Whether the version COMPOSITION PATH actually reads those columns or still composes at document grain was NOT verified here and is stated UNDETERMINED rather than inherited from the column's existence** — a present column is not a reader that uses it, which is the same substrate-is-not-dependent error in its commonest form. Whoever next touches §2 drives that path and settles it.
- §What the session sees — the bias object is BUILT (PL-12) and D-220's version join landed (PL-10); the text still says UNBUILDABLE TODAY.
- §The fence — `capture_requests` BUILT (PL-4); the `[BOB-4]` provisional is superseded by DEC-52 final (§19's F9 says so; the paragraph is not rewritten).
- §Which Claude account — DS-3 and FL-6 (cascade config and runtime) are closed rows; D-218 MEASURED 2026-08-08 — the text still says "to MEASURE".
- §Running sessions are visible in context — UI-38 absorbed the surface; F11's live budget display is a named gap.
- §The pursue session and the daemon — the connections sidebar is BUILT (UI-44, DEC-52 final); the "remains open" clause is stale.
- §14b — the pre-write checks landed plane-side (PL-3) and F10's denied-means-adjust row landed (FL-3); §14b.2 still frames D-222 as a precondition. §14b.6's bound takes no refund and no caller figure for a plane-counted bound since REC-169 (IC-184, 2026-09-23); since REC-172 (IC-188, 2026-09-23, PROPOSED) a figure lands only on a bound the run HAS — a `consume` that is not a map or names no bound, a `bounds` that is not a list or names none, is refused (C-22.15), `lease` is refused as a consumable (C-22.14), and a member's `allowed` is a whole number of zero or more (C-22.13). STILL OPEN: an ABSENT `allowed` opens a bound at 0, which `finishedBound` reads as no ceiling — whether a declared bound may omit its allowance is not ruled here.
- §Published cases — IS-8/PL-16 RESHAPED by DEC-72 (a case is a production, CASE-1..6); the "no case-level bar" assumption is overtaken; DEC-33's ceremony still deferred.
- §What is NOT settled — items 3, 3a, 7, 8 and 9 all since answered or landed; the list is history.
- §11 — item 5, rule 2's REACH, RULED 2026-09-23 by BOB #30 (D-85's builder's question): rule 2 binds every creation D-78 stamps `surfaced_by: agent`, not the `ai` class alone. D-85 built it for `ai`; ~~the admin, member and probe deploy tokens are NOT BUILT (a row, placed after D-85)~~ BUILT 2026-09-23 by REC-171 (IC-186, `bio-plane/test/rec171-surface-token.test.mjs`, nine-arm control): `op=promote`'s stamp is set for every non-session caller, `class:<cls>` for a deploy token. STILL OPEN, brought to BOB rather than exempted (the ruling's own instruction): `bio-plane/migrate/migrate.mjs` replays a Drive mirror's questions under a deploy token and cannot honestly name a run (a replayed question was not surfaced by a run opened today), so a migration of any inquiry is now refused `SURFACE_NO_RUN` — and D-78 already restamps a migrated member's question `agent`, which predates this item.
- §11 — item 5, a MIGRATION REPLAY is not a surfacing: RULED 2026-09-23 by BOB #30 (REC-171's finding); NOT BUILT (a row).
- §Decomposition — every IS-n superseded by a named PL/FL row and all 43 landed; the C-number allocation promise is discharged in `bio-checks.mjs`, not recorded here.
- §The final Claude Code comparison — F10 built (FL-3), F9 never rewritten, F11 open.
- §What a SUGGESTION is — the five kinds are built (PL-3); D-324 (VF-4) found `new-version` is not one of the five, unrecorded here.
- §7.1 — BUILT IN PART by REC-124 (IC-150) and REC-136 (IC-153), 2026-09-18. Built: items 1-2 (`op=conclude&project=` appends a dated, authored entry adopting its CURRENT reading's claim verbatim; `NO_CLAIM`, `CONCLUSION_IS_THE_CLAIM`; commentary attributed, never evidence), item 3 (the FINDING `shared-inquiry-concluded-by-another-project`, which stops once the concluding project withdraws), item 5 (conclusions written before item 6 read claim-UNDETERMINED, stated, never back-filled), item 6 (a no-project `op=conclude` names `version=`, an accepted reading with a claim, refused `NO_CLAIM` otherwise; the adoption is frozen into the inquiry's own bytes as `conclusion_version`/`conclusion_claim` and read ADOPTED only where that reading bears it out), item 7 (`op=withdrawconclusion` APPENDS a dated, authored withdrawal with its reason; the latest entry is the stance; `op=basisversions&project=` returns `conclusion_history` and `conclusion_stance`; C-5.1 holds `conclusions` append-only) and item 8 as far as anything reads a conclusion today (a project's read is its own; a withdrawn conclusion is never the stance). BUILT 2026-09-19 (REC-135, IC-166) — item 4, NARROWED AT THE CODE AND THE NARROWING IS THE FINDING. Of its three named call sites only ONE read the inquiry's own state where it should have read a relationship: `op=publish`'s `NOT_CONCLUDED` (`publishCase()`), now asked of the publishing project through the one reader `#caseConclusionFor`, which passes on the project's own `conclusions[]` stance OR on the inquiry's own bytes read as the no-project relationship's (item 5) — and only while the question's own state is one a case can rest on. Its affordance half moved with it (`publish` gains the `concluded_for_project` disjunct), and the case document now RECORDS the conclusion it rests on: `case_conclusions:` plus a prose section naming WHOSE relationship concluded each member, with the claim verbatim or UNDETERMINED with its reason. `op=reopen` was NOT changed and does not need to be: it moves the INQUIRY's own state, which is the shared object and every project's, and REC-136 already ruled that per-project reversal is `op=withdrawconclusion`'s (built, item 7) — that ruling is in `store.mjs`'s own words at the withdrawal act. A LEG RESTING ON AN INQUIRY READS NO CONCLUSION AT ALL, for any relationship: grepped at the code across `#strengthWalk`, `#captureBoundsFor`, `basisFor`, `#restsOnLive`, `#versionLegsAsMembers` and `testimonyReach`, no leg reader consults a target inquiry's conclusion, so there was nothing to re-point. That half of item 4 is ABSENT rather than wrong, and building it would be new behaviour no refusal asks for today — NAMED here rather than scored as done. DESIGN GAPS: (a) a no-project conclusion still carries a FREE `conclusion` text beside the claim it adopts, which item 2's reasoning ("a free conclusion text that can say what no claim said") argues against, and item 6 did not rule on — kept, because removing it would refuse every no-project caller a second time and C-2.8 requires the text; `commentary=` without a project stays refused. (b) A no-project conclusion cannot be withdrawn by any act: `op=reopen` refuses a concluded inquiry that was never published (REC-31's rule), so item 7's reversibility reaches projects only. (c) A withdrawal tells no other project; item 3's notice only stops. THE MEMBER SURFACE (UI-65, 2026-09-18, landing WITH REC-136): the conclude dialog offers the question's adoptable readings and picks none, showing the picked claim verbatim before the commit; the stance surface (`#stands/<PROJ>/<INQ>`) carries the project's act, the withdrawal, the stance and the whole history; a no-project claim renders adopted or UNDETERMINED there — AND, SINCE UI-67 (2026-09-19), ON THE QUESTION'S PAGE TOO, off the uncapped single-bundle `op=projection` REC-144 (IC-160) put it on, through the same helper, with the cached projection forgotten at every site that lands a conclusion or a withdrawal. (ARM G had refused the earlier CAPPED read there and was right to; it is untouched, because the page added no call to a capped op.). THE SURFACE GAP THAT WAS THE PLANE'S IS CLOSED (REC-142, IC-159, 2026-09-18): on a question already concluded with no project, `op=affordances` now publishes `conclude` (its PROJECT arm) to a caller who has JOINED a project it can see that live-cites the question, with no `concluded -> concluded` edge, so the stance surface offers the project's act there; the question's page receives the same act for that member and its no-project dialog would be refused there — DISCHARGED by UI-67 (2026-09-19): the question's page ROUTES that act to the project's own view instead of opening the dialog, deciding it off the PUBLISHED relationship REC-144 put on `op=projection` rather than off the question's state, so no further I3 change was needed. And nothing links to the stance surface; it is reached by its address. ITEM 9 (ruled 2026-09-21 by BOB #19 from REC-135's measurement): `ALREADY_A_CASE_MEMBER` is asked of the publishing project's relationship, so a moved project conclusion warrants a new edition. BUILT 2026-09-21 (REC-157, IC-173): the refusal stands only where an edition pinning the finding's current bytes already RECORDS the conclusion `#caseConclusionFor` answers for the publishing project (`#editionsRecordingConclusion`; a project conclusion compared as the dated, authored ENTRY the case recorded, a no-project one compared by the pin); `op=reopen` unchanged; `op=affordances` offers `publish` on the same comparison (`edition_warranted_for_project`) (`bio-plane/test/case-edition-conclusion.test.mjs`, six-arm control). DESIGN GAPS, measured by REC-157 and routed rather than resolved here: (d) [CLOSED 2026-09-22 by REC-166, IC-175: a make-current no longer promotes the shared question, so the premise holds on this path; kept as the measurement it was] ITEM 9'S PREMISE IS FALSE ON ONE PATH — concluding on a different claim needs the project to stand on that reading, and `op=versioncurrent` promotes the SHARED question (a Session Log line) before it writes the project's pointer, so a pointer moved AFTER publication moves `bundle_sha`, unpins the finding and reaches the new edition by the bytes route; the same write raises a revision flag on EVERY case pinning the finding, another project's included, while `op=conclude&project=` deliberately writes nothing on the shared question — whether a project's make-current belongs in the shared bytes at all is BOB's (a DELEGATION in `CLAIMS.md`); (e) [CLOSED 2026-09-22 by REC-167, IC-177: `ratifyCaseDocument` asks `#caseConclusionFor` and `#editionsRecordingConclusion` of the document being signed and refuses `CASE_CONCLUSION_MOVED`; §7.1's last "Built" paragraph; kept as the measurement it was] a case PREPARED by `op=publish` and ratified after its project WITHDREW the conclusion it records still commits — `ratifyCaseDocument` re-asks no relationship — so the signed edition records a conclusion that no longer stood at signing (a DELEGATION to SCHEDULER in `CLAIMS.md`, fix named there); (f) where the question is ALSO concluded in its own bytes, a project that withdrew is admitted by REC-135's provisional no-project disjunct and item 9 then warrants an edition recording the NO-PROJECT relationship (disclosed), where item 9's own sentence says such a project "cannot publish an edition" — this resolves with REC-135's open question to BOB, not separately.

**Contents**
- [0 · Vocabulary — four words this document had been using loosely (D-226)](#0-vocabulary-four-words-this-document-had-been-using-loosely-d-226)
- [1 · Why — settled, kept short](#1-why-settled-kept-short)
- [2 · The objective — and the first deployed mode](#2-the-objective-and-the-first-deployed-mode)
- [3 · What the session sees, and what it may write](#3-what-the-session-sees-and-what-it-may-write)
- [4 · The fence: THE AI HOLDS NO OP THAT ACCEPTS](#4-the-fence-the-ai-holds-no-op-that-accepts)
- [5 · How the legs come together — and why this is not a schema problem](#5-how-the-legs-come-together-and-why-this-is-not-a-schema-problem)
- [6 · VERSIONS — the mechanism](#6-versions-the-mechanism)
- [7 · CURRENT belongs to the project's relationship with the inquiry](#7-current-belongs-to-the-projects-relationship-with-the-inquiry)
  - [7.1 · A CONCLUSION belongs to the project's relationship with the inquiry too — decided 2026-09-18 (BOB #15, at Bob's direction: *"If it agrees/follows earlier decisions, then do that"*)](#71-a-conclusion-belongs-to-the-projects-relationship-with-the-inquiry-too-decided-2026-09-18-bob-15-at-bobs-direction-if-it-agreesfollows-earlier-decisions-then-do-that)
- [8 · The inquiry's QUESTION is a first-class object](#8-the-inquirys-question-is-a-first-class-object)
- [9 · What a SUGGESTION is](#9-what-a-suggestion-is)
- [10 · The two modes — one piece of work, two ways in](#10-the-two-modes-one-piece-of-work-two-ways-in)
- [11 · The RUN is an object](#11-the-run-is-an-object)
- [12 · Strength](#12-strength)
- [13 · Published cases](#13-published-cases)
- [14 · Bias — a FENCE first, and a requirement on the skill second](#14-bias-a-fence-first-and-a-requirement-on-the-skill-second)
- [14a · INTEGRATION — how the AI attaches to the workflow](#14a-integration-how-the-ai-attaches-to-the-workflow)
  - [Which Claude account — a cascade, and it decides sovereignty too](#which-claude-account-a-cascade-and-it-decides-sovereignty-too)
  - [Running sessions are visible in context — and this is CROSS-CUTTING](#running-sessions-are-visible-in-context-and-this-is-cross-cutting)
  - [The pursue session and the daemon — request, wait, post-process](#the-pursue-session-and-the-daemon-request-wait-post-process)
  - [Evidence search may be a SUB-SESSION](#evidence-search-may-be-a-sub-session)
  - [What Claude Code's model maps onto, in one table](#what-claude-codes-model-maps-onto-in-one-table)
- [14b · THE RUN'S ARCHITECTURE — derived from Claude Code, grounded in what exists](#14b-the-runs-architecture-derived-from-claude-code-grounded-in-what-exists)
  - [1 · CONTEXT ECONOMY — the largest gap in the design as written, and it was absent](#1-context-economy-the-largest-gap-in-the-design-as-written-and-it-was-absent)
  - [2 · THE READ SURFACE HAS A HOLE, and it is exactly where the session lives](#2-the-read-surface-has-a-hole-and-it-is-exactly-where-the-session-lives)
  - [3 · RESUMABILITY IS ALREADY BUILT, and joining it is a documented step](#3-resumability-is-already-built-and-joining-it-is-a-documented-step)
  - [4 · WHAT IS SCRIPTED AND WHAT IS JUDGED](#4-what-is-scripted-and-what-is-judged)
  - [5 · THE RUN VERIFIES ITS OWN WORK BEFORE PROPOSING — and the checks are the PLANE'S](#5-the-run-verifies-its-own-work-before-proposing-and-the-checks-are-the-planes)
  - [6 · A RUN IS BOUNDED, AND THE BOUND IS RECORDED](#6-a-run-is-bounded-and-the-bound-is-recorded)
  - [7 · PARTIAL RESULTS SURVIVE](#7-partial-results-survive)
- [14c · D-222 — THE OPTIONS, GRADED](#14c-d-222-the-options-graded)
  - [What must hold, whichever option wins](#what-must-hold-whichever-option-wins)
  - [The options](#the-options)
  - [RECOMMENDATION — **D, staged as A then C**](#recommendation-d-staged-as-a-then-c)
- [15 · Instruments — measure from the first run](#15-instruments-measure-from-the-first-run)
- [16 · Positions taken and WITHDRAWN](#16-positions-taken-and-withdrawn)
- [17 · What is NOT settled — and what was settled since v2](#17-what-is-not-settled-and-what-was-settled-since-v2)
- [18 · Decomposition — HANDED OVER 2026-08-07 and ENACTED](#18-decomposition-handed-over-2026-08-07-and-enacted)
- [19 · The final Claude Code comparison (2026-08-07)](#19-the-final-claude-code-comparison-2026-08-07)

---

**Bob, 2026-08-05, session BOB.** Ruled as DEC-60. This document carries the reasoning;
the decision entry carries the verdict. The transcript-retention ruling is DEC-61; the
pursue/investigate merge is DEC-62 — both were lifted into the register on 2026-08-07,
because a Bob ruling that lives only in a design document reaches only the person who
already knows it.

**Rewritten twice on 2026-08-05.** The second rewrite is the one that matters: an attempt
to give the record a structure for how claims relate to each other was refuted by Bob and
replaced by VERSIONS (§5, §6). §16 records what was withdrawn and why, because both wrong
turns were instructive.

**v3, 2026-08-07 — this document absorbed the consistency sweep** (`IS-SWEEP-2026-08-07.md`,
cited below as SWEEP). The doctrine held; the sweep found the design's nouns wrong in three
places, two of its reads unbuildable today, one door it assumed missing, and fifteen
conflicts with the answered register (SWEEP §6 C1–C15). Every correction is folded in
where it belongs rather than appended. Four decisions the sweep raised were resolved by
session BOB under Bob's 2026-08-07 delegation (SWEEP §4b) and are SETTLED here: versions
attach to the **inquiry's basis**; prune **hides, never deletes**; the capture-request
door is a **`capture_requests` table drained by the daemon**; **CHECK is the first
deployed mode**. The three points that remained Bob's are now resolved inline (SWEEP §4c,
2026-08-07): `[BOB-2 — RULED NO 2026-08-07]` (pruned-alternatives disclosure in the
published case), `[BOB-3 — RULED 2026-08-07: disallows do not bar capture]` (robots.txt
conduct), `[BOB-4 — RULED 2026-08-07, PROVISIONAL pending Bob's confirmation]` (DEC-52's
remaining yes/no).

A member with an inquiry presses a button and a **skilled AI session** runs against that
inquiry: it reads the project, finds evidence, and works out how the legs of the inquiry's
claim come together. **PURSUING EVIDENCE AND INVESTIGATING ARE ONE SESSION, not two**
(Bob, 2026-08-06; ruled as DEC-62) — searching and forming versions interleave in a single
loop under a single skill and a single credential scope. DEC-24 named PURSUE and the other
roles separately; this merges two of them rather than overturning the boundary.
Sub-sessions may still exist as FAN-OUT within one run (§14a), which is parallelism, not a
second role. Everything it produces is a SUGGESTION. The member explores, edits, accepts
or rejects.

The machine/member division does not move. What moves is the assumption that it had to be
enforced as *the machine may not produce the object*. It is enforced as **the machine may
not accept the object**.

---

## 0 · Vocabulary — four words this document had been using loosely (D-226)

The sweep measured vocabulary drift of D-156's class between this design and the register,
and D-226 requires it resolved before IS-1 is scheduled. Fixed here, binding on every
section below and on every IS item's build:

- **VERSION**, unqualified, means a **BASIS VERSION** — IS-1's unit, a complete
  alternative composition of an inquiry's `basis[]` (§6). The word has six senses in this
  repository and every other one is QUALIFIED at use: a **document version** (D-220's
  chain), the **skill version** a run records (§14a), a published case's **edition**
  (DEC-12), an adopted policy's **pinned version** (DEC-54), and an engine's
  **calibration** (D-183). A sentence in which "version" could mean two of these is a
  sentence to rewrite.
- **REPORT** is what a sub-session returns (§14b.1). v2 called it a "finding", which
  collided with the record's unit of truth (DEC-44) and with derived progression findings
  (DEC-9/10) — three senses, and the worst sat in IS-9's acceptance clause, where a search
  hit wore the name of the thing the whole system exists to protect. Renamed throughout.
- **LEG** means the register's leg, whole: axis, relationship (AND/OR per DEC-32),
  grade_source, and extent and extraction method (DEC-23). **THE EXTENT CLAUSE IS NO
  LONGER CONDITIONAL, AND AN OPEN D-164 IS NOT EVIDENCE THAT IT IS.** This bullet was
  written *"once D-164 lands"*; the central gap D-164 named — *the address exists, no
  edge carries it* — is CLOSED at the code, verified BY NAME rather than through a
  status line: `inquiry_basis.content_id` and `inquiry_basis_version_legs.content_id`,
  both present and indexed (REC-82 / IC-83). **D-164 ITSELF STAYS OPEN on a different
  and broader question** [CLOSED 2026-09-22 by BOB #26: the six pieces are designed and Bob's
  condition is met, Framework §18] — REOPENED 2026-09-15 as a DESIGN row for the six pieces Part II
  §18 lists as undesigned as of 2026-09-15, not as the leg-referent build it began as (that
  list is §18's claim and is cited here, not re-asserted). *Substrate built is not
  dependent built*, and this is that law's mirror: an open row ABOVE a landed piece is
  not evidence the piece is missing, and a builder who reads it that way under-builds
  exactly the leg this bullet exists to protect. (Narrowed 2026-09-19 by BOB #18 at
  D-226's closing.) v2's leg was materially thinner, and a builder implementing the thin
  leg under-builds the register's. There is one leg shape and it is the register's.
- **GROUND PARTITION** is the analyst's and schema's term (`inquiry_basis` carries
  `ground` and `role` columns today) and is **never a surface word** — DEC-32's
  elicitation clause 1 bans it from every member-facing surface, tooltips included. This
  document may use it; no screen may.

## 1 · Why — settled, kept short

- **Coverage.** A member constructs the claims they thought of; the ones they did not are
  simply absent, and absence at the meaning level is indistinguishable from nothing having
  been there. The searching that grows the document set is the same process that produces
  meaning — one process at several altitudes. This is that process at the top of it.
- **Members need it (Bob).** The rigor is already past what an average user produces
  unaided. Withholding the tool is not a safeguard; it is **a barrier that selects for
  users who already had the skill, and skill is not good faith.**
- **It strengthens the defences against bad actors (Bob).** A bad actor cannot beat
  structural gates, so the attack that works is NOT LOOKING — and the system cannot see a
  search nobody ran. A session that works from the evidence regardless of what the member
  hoped to find is the first instrument that can see that.

## 2 · The objective — and the first deployed mode

**Formulate claims and legs SUPPORTED BY EVIDENCE. The goal is not to support or disprove
a position.** Bob, 2026-08-05. Positive and therefore testable: a run whose claims only ever
point one way is failing its own objective, visibly, without anyone knowing what the member
wanted. The session pursues the strongest account of the inquiry and **does not resolve
what the evidence does not resolve.**

**CHECK IS THE FIRST DEPLOYED MODE** (decided 2026-08-07, session BOB, SWEEP §4b item 7).
DEC-55's enacted instruction was "sequence the CHECK role first"; DEC-60's momentum said
investigate. They are one build: this session, run with this objective against an
EXISTING conclusion, IS DEC-24's CHECK role — the record read adversarially, by the
machine aimed at self-directed overclaiming, the threat model the doctrine names. Deploying
that mode first satisfies the enacted instruction without a second architecture, and it is
also the safest first deployment, because a run over a concluded inquiry has the smallest
authorisation surface and the clearest ground truth to be measured against.

## 3 · What the session sees, and what it may write

Read broad, write narrow.

**READS:** the project · **all** the project's inquiries including the subject · the
subject inquiry's basis versions with their states · the **launching project's declared
evidence standard — the `required_strength` PAIR** (DEC-17, DEC-21). The standard is
per-project and it is a pair, never a single number, so for a shared inquiry there is no
"the current evidence standard" — the run reads the standard of the project it was
launched under, and only that one. **A projectless inquiry has no CURRENT and no bar** —
legal under DEC-17 — and a run against one states that absence rather than inventing a
default (SWEEP C8).

**AND IT MUST READ DOCUMENT VERSIONS AS VERSIONS (D-220, Bob 2026-08-06).** Sixty captures
of one calendar are sixty document versions of ONE document, not sixty documents. A run
that counts them as sixty has a distorted picture of what the record holds — the
false-coverage hazard `STORE-AS-CACHE.md` names, arriving at the document level, and it
would make an inquiry look far better covered than it is. The record already holds the
chain (`captured_locators` joined to `register`); D-220 exposes it. The session is
consumer (3) on that row.

**THE BIAS IS CARRIED, NEVER STEERED BY — and the three parts have three different
statuses** (SWEEP §1.2):

- **RULED:** the run carries the bias manifest in force when it ran. *"An
  assistant-surfaced focus must carry the bias manifest in force when it was surfaced…
  unlike a member it will not remember. Without the manifest… bias debt cannot be computed
  against it"* (`Content_Framework:1129-1141`) — answered before D-215 asked it, and
  D-215(2) is RULED YES for the bias component.
- **FORBIDDEN:** *"bias never shapes what is captured or monitored, only how conclusions
  are weighed"* (`Content_Framework:1283`). The net bias is legitimate only as the thing
  the run CARRIES and the weighing it DISCLOSES — never as an input to what the session
  searches for. §14 makes this structural: **the search half of the run never receives the
  bias at all.**
- **UNBUILDABLE TODAY:** `object_type: bias` is absent from the check catalogue (D-84);
  `Declared_Bias_v0_1` is a draft with no check and no code. Until D-84 lands, the
  manifest-carrying obligation is dischargeable only as **"no manifest was in force,"
  stated** — an honest absence, never a silent omission. D-84 is a named precondition of
  the bias half of this design (§17).

**THE READ VIEWER IS STATED, because an unstated one crosses D-15.** Every read the run
makes passes the D-15 viewer gate under a named viewer. A member-launched run reads as
**that member** — the narrowest viewer who could accept its output — so nothing it
composes rests on material its accepter cannot see. An org-scoped run reads with
instance-level reach, and the consequence is named rather than discovered: it can compose
versions from projects the accepting member was never invited to, and a narrower member
accepting material they cannot view is exactly the leak D-15 closed. So an org-scoped
run's versions disclose that scope, and the accept surface applies REC-36's stricter rule
— it withholds what the accepting viewer's own gate would withhold. The default, and the
recommended deployment, is the member-scoped viewer.

**WRITES:** one endpoint, adding a new VERSION of the subject inquiry's basis. Everything
it writes is a suggestion. Nothing else.

**WHAT A VERSION IS A VERSION *OF* — decided 2026-08-07 (session BOB, SWEEP §4b item 5).**
A claim is not an object. `OBJECT_TYPES` is `{information, inquiry, project, action}` —
no claim type, no claims table, no claim op — and Case Making ruled that a **claim is a
FIELD of an inquiry**: concluding is the inquiry ADOPTING a claim, carrying the basis and
the falsifier. DEC-32 withheld object identity from claims by the citability test, and a
versioned, named, stateful claim object would rebuild the multiplicity D-127's collapse
removed (SWEEP C13). So **versions attach to the INQUIRY'S BASIS**: the version set is
shared wherever the inquiry is shared (§7), an inquiry carrying two distinct propositions
is split by §8's question-sharpening — machinery this design already has — and the claim
stays a field. The build target is the existing construct: `bundle.md`'s `basis[]` as the
authority, `inquiry_basis` as its projection with ONE write site inside `promote`'s
transaction (`store.mjs:7288`). A directly-written version table would be the
second-place-to-state-a-fact D-21 forbids.

**AND A VERSION CARRIES THE GROUND PARTITION, not only the legs** (SWEEP §1.1).
`inquiry_basis` already has `ground` and `role` columns, and DEC-32's settled arithmetic
runs over the partition and the AND/OR relationship. A version that is a flat leg set
cannot express plurality — the version IS the composition, and the partition is part of
the composition. A version with no relationship field would re-ship the flat-AND basis
REC-42 corrected (SWEEP C5).

## 4 · The fence: THE AI HOLDS NO OP THAT ACCEPTS

**Corrected 2026-08-05 by Bob, and the corrected form is stronger than what it replaced.**
The first statement was *the session's only write is one endpoint*. That was wrong as soon as
evidence gathering was designed, because a pursue session works through the plane's existing
machinery — capture, OCR, extraction — and those write.

The accurate statement, which survives the scope growing:

> **The AI holds no op that ACCEPTS anything.** Nothing it can call concludes, accepts,
> publishes, or makes a version current.

Its interactions with the store fall in three groups, and the third is the fence:

1. **It REQUESTS acquisition — it does not perform it.** Bob, 2026-08-05: *"capturing a
   document (with provenance preserved) is something the daemon does (sometimes at the
   suggestion of an AI)."* So the AI does not hold a capture write at all. It asks; the
   daemon captures. **The AI therefore never touches the provenance chain**, which is the
   foundation the entire trust model rests on.
   **The request mechanism is DECIDED (2026-08-07, session BOB, SWEEP §4b item 1): a
   `capture_requests` table, drained by the daemon.** The door did not exist and could not
   be assumed: `taskenqueue` is absent from the OPS table *deliberately, with the reasoning
   written into the table itself* (`index.mjs:295-299` — no control-plane route may put an
   event in the queue on its own account), `taskEnqueue` refuses any kind outside its one
   registered kind, and DEC-37 scoped the daemon to exactly two verbs, *"widened by
   decision, not by drift."* The policy widening was already Bob's own ruling (the quote
   above), so only the mechanism remained. The table keeps closed the door the OPS comment
   closed — nothing control-plane enqueues — keeps the daemon the sole fetcher, and gives
   DEC-47's conduct rules ONE enforcement point: the drain. The table is scratch-class,
   in `capture_sessions`' family, not record.
2. **It SUGGESTS** — versions, in `suggested` state (§9).
3. **It ACCEPTS nothing.** Every state change in §6 is a member act it cannot reach.

**ATTRIBUTION — CORRECTED (SWEEP C6).** v2 said a requested capture is attributable to the
instance's ordinary capture path *"rather than to an agent."* DEC-27(b) says the opposite
and wins: the record states BOTH — *"the assistant captured this, at Anna's request."*
Here: **the daemon captured this, at the investigative session's request, for the
principal the run acted under.** And per DEC-55 determination 4, the record names the
token identity AND the principal behind it — with one more distinction this design adds:
the **Claude-account principal** (which level of §14a's cascade paid for and ran the
reasoning) and the **plane-credential principal** (whose scope the writes ran under) are
two different principals, and the record names both. Never a token value, which
`tokens.mjs` already denylists.

**AND A CAPTURE IS NOT EVIDENCE.** Bob, 2026-08-05: *"the capture is an entry of a document
to the cache (store), but not an entry of the document into the leg of a claim."* This is
`CLAUDE.md`'s "CONTENT IS THE UNIT, AND A DOCUMENT IS NOT THE ANSWER" appearing one level
down. A run that captures four hundred documents has changed the STORE and changed no
conclusion. Only a leg inside a version, accepted by a member, moves anything the record
asserts. And the run's captures land exactly as the daemon's always have — at `collected`,
never higher; sweep material never ratifies itself (Intake Doctrine; SWEEP §1.7).

---

## 5 · How the legs come together — and why this is not a schema problem

**Bob, 2026-08-05, correcting an attempt to type the relationships:** *"There may be
evidence, even a single sentence of evidence, that supports and undercuts and rebuts a claim
- all in the same sentence."*

That is the whole of it. One sentence — *the emergency was declared two weeks after the
contract was signed* — can at once confirm that a declaration exists, destroy the reasoning
that made it excuse anything, and argue positively that the process was improper. Those are
not three kinds of object to store. They are three things one piece of evidence is doing at
the same time, against different claims.

**So the composition cannot be computed from typed relationships, and the record should not
try.** Bob: *"the only way to make sense of how the various legs of a claim come together is
for an AI to be involved, for it to understand the facts in context and adjust the legs so
that they properly tell the story and assign strength values that when calculated are
supported by the evidence."*

The consequence for the build, and it makes the system SMALLER rather than larger:

> **The calculation stays as simple as it already is. The intelligence goes into how the legs
> are formed and weighted, not into a richer set of relationships for the record to compute
> over.** The AI's job is to shape a set of legs so that when the existing calculation runs,
> the result is one the evidence actually supports.

What the record holds is therefore: the legs, their ground partition, and **a written
account of why these legs, arranged this way, tell this story**. Not a taxonomy.

**"ASSIGN STRENGTH VALUES" MEANS COMPOSING, NEVER MINTING — and the apparent tension with
§8.1 dissolves under three standing rulings** (SWEEP §1.3), so no new ruling was needed:

- **A leg's grade is a fact about METHOD** — the source's own identifier (A), an identifier
  matched in content (B), correspondence (C), testimony (D) — and nothing else. The
  ASSISTANT construct already forbids *"a grade asserted rather than earned."*
- **DEC-18: an ungraded leg is INERT, contributes nothing, and every ungraded leg is
  NAMED.** Inert never means invisible.
- **DEC-15: a HUNCH is a member act.** The AI may not propose one.

**Therefore the session COMPOSES legs and the grades arrive from the record** — from the
resolutions the legs rest on (`earnedBasisRegistry`, `store.mjs:8808`), exactly as
`op=cite` already fills them. Where the record has earned nothing, the leg is ungraded,
inert, and named as such in the version's description. "Assign strength values" means
composing legs whose EARNED grades produce a supported calculation — not minting numbers.
**This also reconciles DEC-24 rule 3** (*"a machine-proposed connection is a HUNCH… until
earned or attested"*), which read literally would make every AI-composed version
publication-disqualifying under DEC-20 (SWEEP C3/C4): a machine-composed LEG is never a
hunch, because it either carries a grade the record earned or it is absent-and-named — a
hunch is a member's own marking (DEC-15), and the machine has no path to one. The register
carries reconciliation notes on DEC-24 and DEC-27 so a builder reading it alone gets this
instruction and not the superseded one. And §10's safe-to-be-wrong property — which
recogniser, which document version, what confidence, what signals — now has a path onto
every machine-suggested leg, because every grade traces to a resolution that records it.

## 6 · VERSIONS — the mechanism

**Bob, 2026-08-05.** An inquiry's basis supports multiple **versions** — each a complete
alternative account of the support for the inquiry's claim, not a patch to another one.

This is what makes the whole design work, and the reason is §5: if a set of legs is a
composition that tells a story, then **the composition is the unit of meaning, so the
composition is the unit of change.** Versioning individual legs would recreate exactly the
problem — one leg altered in isolation may not make sense against the others.

It also resolves cleanly the thing that had no answer before: when new evidence means an
already-accepted leg should be weaker or narrower, nothing accepted is ever altered. A new
reading arrives as a whole alternative account and the accepted one stays exactly as it was.

**The rules:**

1. **Every version carries a textual description** of that composition. This is
   load-bearing, not a convenience — see §10, where it is what survives a conversation that
   is deliberately not kept. It is held to a commit message's standard: what changed and
   why. Under §5 it also carries the naming of every ungraded leg.
2. **Every version has a unique NAME within its inquiry.** The AI names the versions it
   adds; a member may rename. (Uniqueness is per inquiry — global uniqueness would make
   naming absurd, and a member forced to invent a name for every small edit stops editing.)
3. **A version is frozen once written. Editing produces a new version** derived from it.
   Otherwise two members exploring the same version collide, and comparison stops meaning
   anything because the thing being compared shifts underneath. **The derivation edge IS
   `derived_from`** — already in the closed relationship vocabulary (State Rules v1.5),
   with zero producers anywhere in `store.mjs` today; IS-1 becomes its first real producer
   rather than minting a synonym (SWEEP §1.7).
3a. **Versions form a DERIVATION TREE, and accepting one offers to PRUNE its ancestors**
   (Bob, 2026-08-06, answering the review-burden problem — D-217a). Each version records
   what it was derived from, null where a run composed it fresh. **PRUNE HIDES; IT NEVER
   DELETES** (decided 2026-08-07, session BOB, SWEEP §4b item 6). The collision the sweep
   found (C1) was real: D-214 rules that the rejection PATTERN is queryable only if the
   acts persist — *"a member who rejects every suggestion running against their thesis is
   visible only if the acts persist"* — and prune-on-accept as first written deleted
   exactly the suggestions that ran against them. DEC-16/DEC-19's never-vanishes-silently
   posture forces the same answer: "delete" at the UI altitude means the DISPLAY shrinks
   while the acts remain queryable. Both rulings survive whole. The offer is not automatic
   — a member may want a rejected reading visible as the record of what was considered —
   and per DEC-29(b) **the offer's wording states what hiding does**: hidden versions stay
   in the record and stay queryable. Hiding is a member act; the AI can no more hide a
   version than accept one. What a PUBLISHED case says about pruned alternatives is
   `[BOB-2 — RULED NO 2026-08-07: current version only, no disclosure of hidden
   alternatives]` — §13.
3b. **Rewording the inquiry's CLAIM is USER SELECTABLE — new version, or new inquiry**
   (Bob, 2026-08-06, D-217b, restated under §3's basis ruling). Not a schema decision but
   a runtime one, so the schema supports both. A tightened wording that leaves the legs
   meaning what they meant is a version; a rewording that changes what the legs are
   answering is a different proposition with its own falsifier — and a thing with its own
   falsifier is an inquiry (DEC-32's falsifier-count test). §8's question-sharpening
   offers the same choice rather than deciding for the member.
4. **Each version has its own state: `suggested` · `considering` · `accepted` ·
   `rejected`.** `considering` and `rejected` are reversible, the states are not a one-way
   ladder, and every transition is a member act. **This is a SIXTH state machine and the
   design says so** — `STATES` holds five (`bio-checks.mjs:127`; MEASUREMENTS.md
   2026-08-07), task states and proposal dispositions are different vocabularies, and
   nothing existing is this machine (SWEEP §1.4). Three consequences the first draft
   missed:
   - **A machine-written version is a PROPOSAL and inherits the interaction-construct's
     proposal rules**, which are already written: it is adopted, deferred WITH a recorded
     reason, or dismissed WITH a recorded reason; proposals **AGGREGATE, never multiply**;
     they **AGE rather than vanish**; and they must visibly **LOOK derived** (D-82).
     D-78 records that both existing writers hardcode `surfaced_by: human` and the fixing
     step (8b) is UNSCHEDULED — the field this design relies on is broken today, and IS-2
     depends on that fix being real.
   - **The member-side transitions are ACTS and owe the four beats** — choose · see what
     will be refused BEFORE it runs · author the reason · receipt. Accept, reject and
     make-current are not bare state flips. **Rejection at minimum carries an authored
     reason** — the rejection record is the anti-omission instrument, and it is worthless
     without one.
   - **The machine publishes the new machine through `op=affordances`** (a NEEDS/NON_ACTS
     row), or every surface showing version states holds a second copy of the rule — the
     drift class DEC-8 closed.
5. **Exactly one accepted version is CURRENT per project.** Current implies accepted.
   - **Accepted is a historical fact** — this version was accepted, on this date, by this
     member. A version that stops being current stays accepted, because it honestly was.
     That keeps the history with no extra state.
   - **Current is where the project's stance stands now** (§7), and it is what the
     effective strength pair is computed over.
   - A version accepted in error is REJECTED, which is a different and rarer act than being
     superseded by a better account.
6. **Exploring an unaccepted version is done by CALCULATING OVER IT, never by making it
   current.** This closes a tension in the first sketch, which had an unaccepted version
   temporarily designated current: once current is shared with a team (§7), that would move
   everyone's ground so one member could examine a possibility. The mechanism already
   exists — the strength function takes an argument naming which states to include.
7. **A member may edit the version they are working from**, provided the changes match the
   evidence, or any leg that does not is **marked as a hunch** — a marking only a member
   can make. **And the edit path does not bypass DEC-50** (SWEEP §6): an edit that
   regroups the ground partition is the attributed regroup act REC-45 built — ungroup with
   a reason, cite, regroup — surfacing through the derived version's record of who and
   why. §6.7 licenses no unattributed structural edit.
8. **A background run adds its output as a new version only if it differs in substance
   from every existing version** (Bob). That is the write gate; the review-burden answer
   is rule 4's aggregation and ageing, not dedup alone.

## 7 · CURRENT belongs to the project's relationship with the inquiry

An inquiry can be shared across projects, and everyone working in a project works as a team.
So one team's decision must never silently move another team's stance — Bob's point, and it
is right.

**Verified in the plane before answering it:** linking a bundle to a project creates an
EDGE (a `refs` edge — many projects may cite one inquiry), so an inquiry genuinely can sit
beneath several projects at once; and a project already overrides settings in its own
project file — its `bundle.md` frontmatter carries `required_strength`, read by
`#requiredStrengthFor` (`store.mjs:5154`) with strictest-wins. There is precedent for a
project holding its own position over shared material.

**So Current is a property of the PROJECT'S relationship to the inquiry, not of the inquiry
itself.** The inquiry, its claim and all its versions stay shared and keep accumulating.
Each project points at the version it stands on. Team A moves to version 3; Team B stays on
version 1 until it decides otherwise; both keep receiving every new version and every new
piece of evidence. **The pointer is a project-authored, DATED frontmatter field beside
`required_strength` — never a settings row** (SWEEP §1.7): DEC-17's reasoning transplanted
by D-199's second determination, because a settings row *"would be a way to change the
standard with nothing to read afterwards,"* and what a project stands on is exactly the
kind of fact that must move only as an authored, dated, on-the-record act.

The alternative considered and rejected was CLONING the inquiry on divergence (Bob's first
instinct). It was dropped because it duplicates the whole evidence trail and the two copies
immediately drift — new evidence found under one never reaches the other — so the shared
investigation stops being shared, which is the reason sharing exists. It is also triggered
by the wrong act: adding a version harms nobody, and only choosing which one is current
moves a stance.

**What survives from the cloning instinct is the NOTIFICATION, and it is required.** When a
member changes what their project stands on, they are told the inquiry is used by other
projects and that their change does not move those projects. When a new version arrives from
another team's work on the shared inquiry, that is surfaced too. **Both are FINDING-class
slugs in `queuestate.mjs`'s vocabulary, not `N-<n>` ids** — verified: no N-number exists
anywhere in source; the live vocabulary is slugs (`QUEUE_FINDING_KINDS`), `classOfKind` is
the fence, and the store refuses unknown kinds at the mint (D-213's corrected close
condition). FINDING, not CONDITION, deliberately: it may become evidence and leaves a team's
list only by an authored act. A member's PERSONAL mute hides it from that member alone (DEC-10,
ruled for findings 2026-09-22 by BOB #26, `NOTIFICATIONS.md` "MARKED AS HANDLED"), so no one
member can silently mute what a team must see (this read *a condition is personally mutable*, as
if a finding could not be).

**Open verification:** if sharing turns out to mean something stronger in the data model than
the edge-based association found here — one stance that every referencing project must
share — then cloning is the only honest answer and this section is wrong. That check belongs
to whoever builds IS-3. → **D-216**

**A PROJECT'S MAKE-CURRENT WRITES NOTHING ON THE SHARED QUESTION — ruled 2026-09-22 by BOB #25** (REC-157's
DELEGATION). Measured through the ops (M-92) and read at `0b7328bc`: `op=versioncurrent&project=P` promotes the INQUIRY
first — `last_updated` and a Session Log line *reading '<v>' is what P stands on*, its version block untouched — and only
then writes P's pointer. The inquiry's `bundle_sha` moves for a change that is not a change to the finding, so every case
pinning the finding stops pinning its current version (CASE-4's frozen fences stop applying, and `op=publish` takes the
bytes route to a new edition), and `#flagCasesOnRevision` flags every case pinning it, another project's included: one
team's decision silently moving another team's, which this section forbids. **Fix (a) is ruled:** a project-arm
make-current writes its receipt — the `last_updated` and the Session Log line — into the PROJECT's own bytes, in the
promotion that writes the pointer, and does not promote the inquiry at all, which is §7.1's discipline for a conclusion.
**Fix (b)**, exempting a stance-only promotion from the revision flag, is refused: it leaves the pin moving, and the moved
pin is the defect. The acts that change the shared version block (accept, reject, hide and their siblings) still write the
inquiry, because they change what every project reads. With (a) built, §7.1 item 9's premise — a moved project
conclusion warrants a new edition *even though the finding's `bundle_sha` never moved* — holds on every path.

**Built, 2026-09-22 (REC-166, IC-175) — fix (a).** `#moveVersionState`'s `current` act now leaves right after the
preview, having written ONLY the project: `#setProjectCurrentVersion` writes the pointer, `last_updated` and the
project's own `| Stands on |` Session Log entry, which now also carries the member's authored `Reason:`, in ONE promotion.
The question is not rewritten, not promoted, and its Session Log gains no line. Driven through the ops
(`bio-plane/test/current-shared-question.test.mjs`, 18 assertions; four-arm control, all as declared): after ANOTHER
project's make-current and after the publishing project's own, the question's `bundle_sha` is still the case's pin, its
`bundle.md` byte-identical, `op=caseflags` names nothing for the question or the case, and CASE-4's fences hold
(`PUBLISHED_CANNOT_MOVE_VERSION`, no divide/ground affordance, `ALREADY_A_CASE_MEMBER`); on an unpublished question
accept, consider, revert, reject and hide still move its bytes. The control's arms: restoring the question's promotion
fails the pin, flag and fence arms by name; dropping the `Reason:` line (the liar) fails only the receipt arms; the
refused fix (b) — promotion restored, flag exempted — reads clean on `op=caseflags` and fails the pin and fence arms;
re-wording the project's sentence stays green. REC-157's suite's section 9, which asserted the make-current MOVED the
bytes, was corrected with a dated reason: the same path now reaches edition 2 by the conclusion comparison, carrying
`edition_warranted`. **The class sweep's LEAD, measured the same day and ROUTED, not fixed here (`MEASUREMENTS.md`
M-100):** a SECOND project's `op=publish` of a finding another project's case pins DOES move that finding's bytes —
`publishCase()` stamps the case's fields into each member's own bytes (IC-66's remainder), so the other project's case is
unpinned and flagged at the PREPARE. It is this section's forbidden shape on the publication path; its fix (case facts
committed from the signed case document, never stamped into the finding) changes what a member signs and is routed to BOB.

### 7.1 · A CONCLUSION belongs to the project's relationship with the inquiry too — decided 2026-09-18 (BOB #15, at Bob's direction: *"If it agrees/follows earlier decisions, then do that"*)

**The conflict it resolves.** `op=conclude` writes ONE conclusion onto the inquiry itself, so on a shared inquiry one
team concluding moved every team's stance — exactly what this section forbids for CURRENT. REC-124's builder found it
and stopped (the claim-adoption act cannot be built until someone says whose adoption it is).

**Checked against every earlier decision before deciding, and it FOLLOWS Bob's rulings:**
- **This section (D-216, Bob 2026-08-08):** *one team's decision must never silently move another team's stance.*
  Concluding is the strongest stance a team takes; applying the rule to CURRENT and not to the conclusion was an
  omission, not a choice.
- **DEC-45 (Bob, 2026-08-04):** adding a finding to a project *"may cause the conclusions to change if the source bias
  and the bias of the project/instance differ"* — Bob already treats a conclusion as depending on the project it is
  drawn in, and declared bias is per project (`BIO_Declared_Bias_v0_1.md`).
- **DEC-17:** the strength bar a conclusion must clear is the PROJECT's (`required_strength`, strictest-wins).
- **DEC-72:** a case is a production OF A PROJECT over finding-versions — publication is already per project.
- **D-217b / DEC-22:** claims live on the shared versions, and an unsupported claim is a standing objective — both
  unchanged: the inquiry, its versions, its claims and its evidence stay SHARED; only the adoption moves.

**What it AMENDS — two design determinations, neither a ruling of Bob's, both written before inquiries could be shared:**
- `BIO_State_Rules_Consistency_v1_5.md` §4 / the catalog's `STATES.inquiry`: `concluded` was one state of the inquiry.
  It becomes a state of a (project, inquiry) relationship. An inquiry OUTSIDE any project (DEC-17 allows one) keeps its
  own, as the relationship with no project.
- DEC-44's determination 1 (BOB's, 2026-08-04, four days before §7): *"each finding keeps its own conclusion"*. Its point
  — a case composes no super-conclusion over its findings — stands untouched. Read literally as *one conclusion per
  inquiry*, it is superseded: each finding carries a conclusion PER PROJECT that adopts it.

**The design:**
1. **A conclusion is a project-authored, DATED act on the relationship, beside CURRENT** and in the same form (§7:
   never a settings row): the project, the inquiry, the VERSION adopted, that version's CLAIM frozen verbatim at the
   moment of adoption, the falsifier (or the member's stated override, REC-117), the author, the time. A machine never
   authors it (DEC-24).
2. **Concluding adopts the claim of the version the project stands on, and the claim IS what was concluded.** A free
   conclusion text that can say what no claim said is the overclaim this record exists to refuse ("less narrative" binds
   us first). What a member wants to add beyond the claim is COMMENTARY, attributed and never evidence — the same line
   `MEMBER-KNOWLEDGE-DESIGN.md` §6 draws for an opinion. Concluding with no claim on the adopted version is refused
   (`NO_CLAIM`), naming the door: state the claim on a version first (DEC-22 makes an unsupported claim legal to add).
3. **Other projects are told, never moved** — a FINDING-class notice, §7's notification pattern: *project P concluded
   this shared inquiry on version N*. Their stance is unchanged until they act.
4. **Everything that asked "is this inquiry concluded?" asks it FOR A PROJECT:** `NOT_CONCLUDED` at `op=caseratify`
   reads the publishing project's relationship; a leg resting on inquiry X reads X's conclusion FOR THE SAME PROJECT, and
   where that project has none the leg's inquiry is unconcluded for it — stated, not inferred from another team's.
5. **What was already concluded is not rewritten.** Existing inquiries carrying a conclusion in their own bytes (some
   inside ratified, signed cases) are read as the conclusion of the relationship that concluded them, or of the
   no-project relationship where none can be established — stated as such. Ratified bytes are never edited (the
   `published` legacy-set precedent in State Rules' 2026-09-10 amendment).

**Three more, decided 2026-09-18 by BOB #15 from REC-124's build (each follows a ruling above; none is returned to Bob):**
6. **An inquiry concluded OUTSIDE any project NAMES the version whose claim it adopts.** It has no CURRENT to stand on,
   so the act states it; no version named, or a version with no claim, is refused `NO_CLAIM`. A conclusion whose claim
   reads *undetermined* asserts nothing a reader can check, which is the overclaim item 2 refuses. The callers this
   breaks are corrected, never exempted; conclusions already written read undetermined and are STATED so (item 5). The
   stakes are bounded: a case needs a project (DEC-72), so a no-project conclusion is never published.
7. **A project WITHDRAWS its conclusion by a dated, authored act that APPENDS to the relationship's history — it never
   overwrites.** The latest entry is what the project stands on; every earlier conclusion and every withdrawal stays
   readable (DEC-19 as ruled by Bob: *"An attestation must be reversible to correct mistakes. (Though there may be a
   record of the attestation and reversal in the record.)"*). Replacing the row, as first built, erases that record and is
   a defect. A withdrawal never edits a published case; the case's next edition carries it.
8. **A conclusion counts ONLY for the relationship that made it.** A leg in project P resting on inquiry X reads P's own
   conclusion on X; a no-project conclusion on X, or another project's, is visible as information and is never read as
   P's. So item 4 does not depend on item 6.

**One more, decided 2026-09-21 by BOB #19 from REC-135's measurement. It applies items 4 and 7 and is not returned to Bob:**
9. **`ALREADY_A_CASE_MEMBER` asks FOR A PROJECT too.** A published case records the PROJECT's adopted claim (IC-166).
   So when that project withdraws and concludes again on a different claim, the case says something the project no
   longer stands on, even though the finding's `bundle_sha` never moved. Item 7 already rules that *the case's next
   edition carries it*. REC-135 measured that no edition can be published there. `op=publish` refuses
   `ALREADY_A_CASE_MEMBER`, because that refusal's pin is the member's `bundle_sha` alone. `op=reopen` is correctly
   `ILLEGAL_TRANSITION`, because the shared inquiry never left `open`. **Decision:** a new edition is warranted when the
   publishing project's latest conclusion is not the one the pinned edition recorded, whether or not `bundle_sha`
   moved. The refusal compares the RELATIONSHIP, exactly as `NOT_CONCLUDED` does (item 4). `op=reopen` is the shared
   object's act and does not change, since REC-136 ruled that the per-project reversal is `op=withdrawconclusion`'s. A
   project that has withdrawn and not concluded again cannot publish an edition (`NOT_CONCLUDED`), and its last
   published edition stands as history (DEC-19).

**Reversal cost:** low now; it rises once published cases freeze per-project conclusions into their bytes. **Built by:**
REC-124, unblocked by this section (RECORD; an I3 change with its own IC; I5 if the case bytes carry the adoption).

**Built, 2026-09-18 (REC-124, IC-150) — in part.** Items 1, 2, 3 and 5 are in the plane: the project's `conclusions[]`
row, `NO_CLAIM` and `CONCLUSION_IS_THE_CLAIM`, attributed commentary, the FINDING notice, and legacy conclusions read with
their claim undetermined (`bio-plane/test/conclude-project.test.mjs`). Item 4 is NOT built.

**Built, 2026-09-18 (REC-136, IC-153) — items 6, 7 and 8.** A no-project `op=conclude` names `version=` and adopts that
accepted reading's claim verbatim, or is refused `NO_CLAIM` with nothing written; the adoption is written beside the
conclusion in the inquiry's own bytes. A project's `conclusions[]` is an APPEND-ONLY history — every conclusion and every
withdrawal (`op=withdrawconclusion`, a dated, authored act with a reason; `NOTHING_TO_WITHDRAW` when the project stands on
no conclusion) is a new entry, the latest is the stance, and the whole history is read back; C-5.1 names a rewrite. REC-124's
replace-the-row writer is gone. What remains open is in the front matter's Incomplete sections.

**Built, 2026-09-18 (REC-142, IC-159) — item 8 made REACHABLE.** The store accepted a project's conclusion on a question
the no-project relationship had already concluded, but `op=affordances` keyed `conclude` on the edge table alone, so no
member was offered it (Q12/DEC-8: the surface renders only what the plane publishes). `conclude` is now published there —
the same act, its PROJECT arm, the project left to `project=` — to a caller who has JOINED a project it can see that
live-cites the question, and to nobody else. No `concluded -> concluded` edge was added: the no-project relationship still
cannot conclude twice (`bio-plane/test/conclude-project-arm.test.mjs`).

**The question's page reads the no-project conclusion from `op=projection` — designed 2026-09-19 by BOB #16 (UI-65's
follow-up).** UI-65 could not render `no_project_conclusion` on the question's page: the only read carrying it is
`op=basisversions`, a CAPPED read, and the page renders no list whose bound it could state (`bound-sweep` ARM G refused
the site, correctly). **The page already makes an uncapped read of the question itself: `op=projection` in its
single-bundle form** (`projection({bundleId})` — one row, behind the viewer gate; the LIST form is the capped one, and
the single form already derives an action's overdue ON READ, which is the precedent). So: **that single-bundle form, for
an inquiry, publishes `no_project_conclusion`, computed by the SAME reader `op=basisversions` uses
(`#noProjectConclusionOf`), under the gate the row already passed** — null when the inquiry is not concluded, exactly as
there. Never on the list form. One reader, two reads, so the two cannot disagree; the builder proves it byte for byte for
one inquiry and viewer (BOB.md rule 7: the same quantity, from the code). The question's page then renders it with the
helper the stance surface uses (`noProjectConclusionHtml`), and invalidates its cached projection when a conclusion or a
withdrawal lands. An additive I3 change.

**Built, 2026-09-19 (REC-135, IC-166) — item 4, and NARROWED at the code before a line was written.** The row's
subject was never whether `NOT_CONCLUDED` exists — it has since CASE-4 — but WHICH state its three named call sites
read. Measured, per site: `op=publish`'s refusal in `publishCase()` read `bundles.current_state`, the shared word, and
is the one site this item changes; `op=reopen` read it too and SHOULD, because reopening moves the inquiry's own state,
which is the shared object and every project's (REC-136 named the per-project reversal `op=withdrawconclusion` for
exactly this reason, and built it); and NO leg reader anywhere in the plane consults the conclusion of the inquiry it
rests on, for any relationship, so that clause had nothing to re-point and is ABSENT rather than unbuilt-and-wrong.
WHAT LANDED: `#caseConclusionFor`, the ONE reader `op=publish` and the case document both ask, which calls
`#conclusionOf` and `#noProjectConclusionOf` rather than copying either. It passes on the publishing project's own
`conclusions[]` stance (a WITHDRAWN stance is never a standing answer) or on the inquiry's own bytes read as the
no-project relationship's (item 5), and in both cases only while the question's own state is one a case can rest on —
a conclusion a project wrote while the question was open does not outlive the group setting it down or dividing it.
The refusal keeps its name and says WHICH of five facts it met, and names the other projects that HAVE concluded the
shared question as information that is never this project's stance (item 8). `op=affordances` offers `publish` on the
same widened condition (`concluded_for_project`), so the surface and the act cannot disagree (DEC-8). And the case
document records what item 4's headline asks for: `case_conclusions:` and `## The Conclusions This Case Records`, per
member, with the relationship, the reading, and the claim verbatim — or UNDETERMINED with its reason, never
back-filled (`bio-plane/test/case-project-conclusion.test.mjs`, 25 assertions; six-arm control).
**THE ONE THING RUNNING PROVISIONALLY, and it is a question for Bob rather than a gap:** whether a NO-PROJECT
conclusion should admit a case at all. Item 8 read strictly says no; item 5 says such bytes are read as the no-project
relationship's and STATED as such; and item 6's aside — *"a case needs a project (DEC-72), so a no-project conclusion
is never published"* — is FALSE of the code as built and always was, since `op=conclude` had no project arm until
2026-09-18. The build ships the DISJUNCTION with the relationship DISCLOSED in the signed bytes, because the strict
reading refuses publication to every case already in this record; reversing it is one arm of one function, measured as
arm (e) of the control (22 pass / 3 fail, the three being exactly the legacy path).

**Built, 2026-09-19 (REC-144, IC-160) — the plane half.** `op=projection&id=<inquiry>` carries `no_project_conclusion`,
computed by `#noProjectConclusionOf` itself (the call, not a copy), under the gate the row passed; null for an unconcluded
inquiry and for every non-inquiry; never on the list form. `bio-plane/test/projection-noproject.test.mjs` proves it byte for
byte against `op=basisversions` for two viewers and pins ONE reader off the source. The question page's render and its
cache invalidation are UI-67's.

**Built, 2026-09-19 (UI-67) — the surface half, and it needed no interface change.** `openInquiry` reads
`no_project_conclusion` off the projection it already takes and renders it with `noProjectConclusionHtml`, the helper the
stance surface uses — one helper, two surfaces, so the two cannot come to say different things. The page added no `recR`
call at all, so `bound-sweep` ARM G is untouched and no exemption was added to it. `PROJ_CACHE` is forgotten by the one
invalidator `projForget` at every site that lands a conclusion or a withdrawal (`doConclude`, `stanceConclude`,
`stanceWithdraw`, and NOT `concludePreflight`, which withholds its target and writes nothing); a walk over `app.html` holds
that set to exactly four. **REC-142's delegation is discharged with it:** on a question concluded with no project the act
`op=affordances` publishes there is ROUTED to the project's own view (`#stands/<PROJ>/<INQ>`, per project the record's
reverse index names) instead of opening the no-project dialog the plane refuses, and the routing is decided by the
PUBLISHED relationship this section put on `op=projection` — the act-level field REC-142 offered to build, arriving from a
different read. `civicos-ui/test/question-npc.test.mjs` drives all of it against the real plane (49/0; control 6 arms AS
DECLARED). **What is still NOT built, and it is item 7's own gap (b) re-measured against the plane rather than quoted:**
nothing clears a no-project conclusion. `op=withdrawconclusion` refuses `NOT_A_PROJECT` with no `project=` and names
`op=reopen`'s door; `op=reopen` refuses a concluded inquiry that is in no case (`NOT_SET_DOWN`, REC-31's rule). So the
page's re-read after a withdrawal is asserted as a re-read, never as a disappearance.

**Built, 2026-09-21 (REC-157, IC-173) — item 9, and MEASURED before a line was written.** `op=publish`'s
`ALREADY_A_CASE_MEMBER` still asks the pin first (`#caseRelationOf`: is the finding's CURRENT version one a case froze), and
now stands only where an edition pinning those bytes ALREADY RECORDS the conclusion this publication would record — the same
answer `#caseConclusionFor` gave the NOT_CONCLUDED gate a line earlier, never re-read. `#editionsRecordingConclusion` is the one
comparison, asked of every ratified edition pinning the bytes and of an unratified preparation: a PROJECT conclusion is
compared as the dated, authored ENTRY the edition recorded (project, reading, claim, falsifier or its override, who, when —
item 1: a conclusion is an act, so one re-taken after a withdrawal is a new one); a NO-PROJECT conclusion is compared BY THE
PIN, because it lives in the pinned bytes, and an edition that recorded no conclusion at all (before REC-135) rested on the
question's own state in those same bytes. Both rows come from one writer, `#caseConclusionRowLines` (the case document's rows,
moved there byte for byte), and one parser. A warranted edition's answer says so (`edition_warranted`, naming what each pinned
edition recorded); the refusal names the edition that already records the conclusion (`recorded_by`) and both routes to a new
edition. `op=affordances` offers `publish` on the same comparison (`edition_warranted_for_project`), so the act and the surface
agree (DEC-8). `op=reopen`, `#caseRelationOf` and every other reader of the case relation are unchanged: they ask whether the
BYTES are frozen, which a moved conclusion does not change. **What the measurement found first:** `op=versioncurrent` writes a
Session Log line into the SHARED question, so a pointer moved after publication moves `bundle_sha` — on the untouched plane the
row's literal probe path (withdraw, make the other reading current, conclude, publish) already reached a second edition by that
bytes route. Item 9's defect is real where the bytes do NOT move: the project re-concludes on a reading it already stood on
(its pointer moved before the edition was published), re-concludes on the same reading (REC-135's own probe), or withdraws on
a question also concluded in its own bytes; each is driven, with a discriminator asserting the bytes are exactly the pin
(`bio-plane/test/case-edition-conclusion.test.mjs`, 36 assertions; 19/17 on the untouched plane; six-arm control, all as
declared). Design gaps (d), (e) and (f) in the front matter record what this item found and routed.

**Built, 2026-09-22 (REC-167, IC-177) — item 4 at `op=caseratify`, and item 9's comparison asked of the document being signed; design gap (e) closed.** REC-157 measured (M-92) that a case PREPARED by `op=publish` still committed after its project withdrew the conclusion the document records: `ratifyCaseDocument` re-asked no relationship, so the signed edition said the project stood on a conclusion it had given up before anybody signed. It now asks, PER ROSTER MEMBER, what `op=publish` asks and through the same two readers, never a copy: `#caseConclusionFor` — concluded FOR THE DOCUMENT'S `case_project`, with the SIGNER's sight (`#caseAuthority` has just established the signer is an owner) — and `#editionsRecordingConclusion` applied to THIS document as the preparation, so the conclusion must be the dated, authored entry the document records (a no-project one by the pin, as item 9 compares it). Either answer no, and it refuses `CASE_CONCLUSION_MOVED` (C-65.1, a canned translation) naming each member, what the document recorded and what the project stands on now, and the route: publish again, which records the conclusion that stands. Asked after the idempotent retry (a ratified edition is history, DEC-19) and before any write, so a refusal commits nothing. **`op=ratify` needed no site of its own:** a finding's bytes record no case conclusion, and since D-431 `op=ratify` signs a finding only at a sha a RATIFIED case pins, so a refused case document leaves the finding refused `RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE` — driven, not argued. Concluded-ness alone would have passed a project that withdrew and concluded again on another claim; the comparison is what refuses that (`bio-plane/test/caseratify-conclusion.test.mjs`, 21 assertions; four-arm control, all as declared, the comparison dropped failing the conclude-again arm by name).

## 8 · The inquiry's QUESTION is a first-class object

Bob's contract case: *"Did the process used in the award of the X contract conform to the
contracting process the city is required to follow?"* is a different question from *"Was the
award of the X contract arrived at using a competitive bidding process?"* — *"Though related
questions, the evidence needed to answer each is very different, and answers very different
questions. A properly skilled AI can make those critical distinctions that might be
impossible mechanically."*

An inquiry's question can be imprecise, or two questions wearing one sentence, and that is
upstream of every version under it. So one of the session's highest-value outputs is often
not a version at all: *this inquiry is asking two questions that need different evidence;
here they are separated.* This is a suggestion like any other and the member accepts, edits
or rejects it. Under §3's basis ruling it is also the splitting machinery: an inquiry
carrying two distinct propositions — two falsifiers — becomes two inquiries here, not two
claim objects.

## 9 · What a SUGGESTION is

Everything below is written in state `suggested`, carries its run (§11), and is accepted,
edited or rejected by a member. Every kind is a FINDING-class slug in `queuestate.mjs`'s
vocabulary (see §7 — slugs, never N-ids; FINDING so no one member can mute it for a team).

| kind | what it proposes |
| --- | --- |
| **a new version of the inquiry's basis** | the main output — a complete alternative composition with its ground partition and description (§6) |
| **sharpen the question** | the inquiry asks two questions; separate them (§8) |
| **a new inquiry** | a proposition answering the question, with the first version of its basis |
| **this level is empty** | *we looked at this level — meaning, content, documents, or the open internet — and it is empty*, with the observation-log address of the search that establishes it. `CLAUDE.md` makes saying WHICH absence a first-class obligation, and §15's empty-run instrument needs an object to count — without this kind, a run that honestly found nothing supportable is indistinguishable from a run that emitted nothing (SWEEP §6) |
| **flag for a new edition** | evidence bearing on a PUBLISHED finding. A published case cannot be changed, so the only act available is a new edition, and it is the member's |

## 10 · The two modes — one piece of work, two ways in

**Bob, 2026-08-05.** The investigative AI runs either way:

- **As a background job.** It runs unattended and leaves its output as new versions for
  later review.
- **As an interactive session**, offered once the analysis for that session is complete. The
  member walks the evidence trail, asks why a leg is weighted as it is, sees how the legs
  relate, and reaches conclusions the evidence supports. **The interactive session may ask
  any applicable question**, including ones that send it looking for more evidence.

These are not two analyses. They are two ways into **one completed piece of work**, which is
why the run has to be a durable, addressable object with its evidence trail intact (§11)
rather than just the suggestions it emitted.

**"Export" means the AI adds a new version to the inquiry being investigated** (Bob). So
both modes use ONE write path — nothing the interactive mode can do lies outside what the
background job could do, and the fence needs no second design.

**The conversation is NOT part of the permanent record** (Bob; ruled as DEC-61 — §14a). The
member's decisions are; the discussion that produced them is not. **This is exactly why
§6's requirement that every version carry a written description is load-bearing:** the
reasoning behind a version would otherwise evaporate with the conversation. The description
is the durable account.

**The skill under which the interactive session runs must enforce evidence-based
conclusions** (Bob) — and where "enforce" means refusing, the refusal is code, not skill
(§14b.4).

## 11 · The RUN is an object

Every version names the run that produced it. **The proven model is `capture_sessions`
(`schema.mjs:358`)** — *"SCRATCH, not record… a work list with an expiry"*: ticks, an
expiry, opaque state, resumable across invocations. IS-6 and IS-9 extend that shape rather
than inventing one, and **the observation log cannot live in `bundle.md`, which is written
only on success** — the log's whole value is the failure path. The run buys:

- **The conditions it was formed under** — the bias manifest in force (RULED — §3; until
  D-84 lands, "no manifest was in force," stated), the launching project's declared
  standard pair, the claim and version set as it stood, and the SKILL VERSION it ran under
  (§14a). Bob: *"everything can change at the drop of a hat (bias, standard, claims)"*, so
  a version is only interpretable against them. (D-215 — answered.)
- **The observation log** — where it searched across the four levels, where it stopped and
  why. Search completeness is trained into the skill, which is COMPETENCE; the log is what
  lets anyone else CHECK. Three rules the log inherits from the record it serves:
  - **Absence uses D-129's vocabulary** — `NEVER_LOOKED / LOOKED_ABSENT /
    LOOKED_INDETERMINATE / PRESENT`, plus `partial`. Which absence is a stated fact, never
    a diagnostic detail.
  - **"Source unreachable" and "our governor held us" are different facts** (D-104), and
    `source-unreachable-governed` exists in the condition vocabulary to keep them apart. A
    log that writes the first when the second is true manufactures a false absence.
  - **A client-rendered shell capture is `LOOKED_INDETERMINATE`, never `PRESENT`** —
    `client-rendered-shell` is catalogued with NO producer, and an evidentially empty
    capture that reads as coverage is the false-coverage hazard again (SWEEP §3).
- **The interactive mode's subject** (§10), which needs the evidence trail intact.
- **The instruments in §15**, which are otherwise not computable.

**Item 5 — THE RUN A PRODUCTION NAMES IS ONE ITS CALLER HOLDS, AND IT IS RUNNING. Ruled 2026-09-21 by BOB #25**
(SCHEDULER #10's Q2, D-85). Every version names its run, and the run is what the version is READ AGAINST — the lens
in force, the standard pair, the skill version, the principal — so a run a caller can merely NAME is a provenance hop a
caller can invent (`CLAUDE.md` §5). Measured at `ae4f42d0`: `suggestVersion` resolves `run` for existence alone, with
no status and no principal; `extractPropose` checks that the run is running and in EXTRACT mode, not whose it is;
`runPrincipalGate` (REC-152) is called only by tick and close, and `index.mjs` stamps the caller's `principal` only on
the three run verbs. Three rules:

1. **A production names a RUNNING run whose PRINCIPAL is the caller** — the member who opened it, or a machine
   credential that member minted. REC-152's one stamp expression is extended to `op=suggest` and `op=extractpropose`,
   and both apply `runPrincipalGate`. A version is formed under a live run's conditions, so an interactive session
   (§10) after a background run has closed opens its own run, as the member's act.
2. **An assistant opens a question only inside a run.** Framework §12 lets an assistant open a question unattended, and
   §13 requires it to carry the lens in force when it did. That lens exists only on a run (§3, RULED), and the objective
   it pursued only as the run's context (DEC-24 rule 2). So an `ai` credential's creation of an inquiry names a running
   run whose principal it is; the plane records the link in an instance row keyed by the new inquiry — never a line in
   its signed bytes, because the run is scratch and never published, and a pointer no reader can resolve is not
   provenance — and counts it against a declared `surfaces` bound, refused when none is declared (the `mints` bound's
   rule). The inquiry's reads state its run and that run's lens block (recorded, now, moved); an inquiry surfaced
   before this rule states `not recorded`, never a guess.
3. **The run records the lens IN FORCE when it opened, beside the one it was handed.** `aiRunOpen` stores the handed
   manifest verbatim and derives nothing, so `moved: true` today cannot tell *the lens changed after the run opened*
   from *the run was handed a lens other than the one in force*. The open also records the effective set's
   `statements_sha` for the run's context, computed by the plane at that instant (the call `#biasForRun` makes), and
   the read says which of the two it is.

**Rules 2 and 3 — BUILT 2026-09-23 by D-85 (IC-181).** Rule 2: `index.mjs` stamps an `ai` credential's `op=promote` with its
run-principal stamp (`assistantPrincipal`, deleted first for every caller); `promote` asks `#surfacingGate` of a CREATION of an
inquiry carrying it — sight (`SURFACE_NO_RUN`, C-66.1, also for a creation naming no run), `runPrincipalGate` (C-22.12), status
(`SURFACE_RUN_NOT_RUNNING`, C-66.2) and the bound (`SURFACE_NO_BOUND` C-66.3, `SURFACE_BOUND_REACHED` C-66.4; `surfaces` is a
`RUN_BOUNDS` row on `mints`' precedent) — and writes `inquiry_run_surfacings` in the creation's own transaction. `op=projection`
answers `surfaced_in` from `aiRunRead`'s answer, so the question's lens block is the run's. Rule 3: `aiRunOpen` stores
`biasManifest` for the run's context as `ai_runs.lens_at_open`; the lens block's `hand` is `stale` when the handed lens is not
the one in force at the open (an empty hand under a lens in force included) and `moved` compares the open with now.

**Rule 1's target — RULED 2026-09-22 by BOB #28, on REC-165's builder's question: a suggestion lands only INSIDE its
run's context.** A version is read against its run, and a run's conditions are its context's: a run over a project reads
that project's bar and lens, a run over a question the projects that confirmed-cite it (`#runContextProjects`,
`store.mjs`; the two kinds are `airun.mjs`'s `RUN_CONTEXTS`). A suggestion onto another question would be read against
conditions that were never that question's, under an observation log that searched for something else: the record
would claim more than it holds. So `op=suggest`'s target is the run's context itself, or, for a run over a project, a
question that project confirmed-cites; anything else is refused by a new stated code (`SUGGEST_OUTSIDE_RUN_CONTEXT`, its
C-number the builder's), checked AFTER the sight and principal checks, so a target the caller cannot see still answers
as absent. Work on another question opens a run over it, as rule 1 already says of an interactive session.
`op=extractpropose` names no target question (it proposes a reading of captured content, which no run's context
bounds) and this rule does not touch it. **`op=capturerequest` — RULED 2026-09-22 by BOB #28, on the M0-110 worker's measurement (a member
files a request under another member's run, and the request row credits that run's principals):** rule 1 applies to it
— a request that names a run is a production of that run, so it names a RUNNING run whose PRINCIPAL is the caller, by
the same stamp, the same sight check first and `runPrincipalGate`. Rule 1's target does not: a request names an
address, not a question, and what the record holds is instance-wide. ~~A request naming no run is the member's own and is
untouched.~~ **CORRECTED 2026-09-23 by BOB #29 (REC-168's worker: no run-less path exists):** a request MUST
name a run, and DEC-47 stands — the session launch is the authorisation for a fetch nobody named, so a run-less request
names no authoriser. A member who wants an address captured captures it herself with `op=acquire` (open to `member`), an
act she authors; `op=capturerequest` is a RUN's queue for the daemon, never a member's second door. **BUILT 2026-09-23 by REC-168 (IC-178):** `RUN_PRODUCTION_ACTIONS` gains `capturerequest`, so the door takes the one
`principal` stamp; `captureRequest` asks sight (`#aiRunInSight`), then `runPrincipalGate`, then running; the row's plane
principal is the caller's stamp and its Claude principal is still the run's. A request naming no run is refused as it always
was (the door requires a run, DEC-47), and is byte-unchanged. The builder measures `agent-worker`'s one `suggest` site (`index.mjs`,
`submit`) against the rule: a candidate aimed outside its run's context is a finding, never an exemption.

**Rule 2's reach — RULED 2026-09-23 by BOB #30, on D-85's builder's question: every creation the record calls an
assistant's, not the `ai` class alone.** D-85 built rule 2 for an `ai` credential; the admin, member and probe classes are
instance deploy tokens with no member behind them, and they still create inquiries outside any run. The rule's premise is
the SURFACING ACT, not the credential: Framework §13 requires a question an assistant surfaced to carry the lens in force
when it did, and D-78 already decides at the trust boundary which creations the record calls an assistant's — every one
that did not arrive through a member's session is stamped `surfaced_by: agent` (`index.mjs`, the D-78 restamp). An `agent`
question with no run is a record claiming a machine surfaced it under conditions it never recorded, which is what rule 2
exists to stop; exempting three classes would keep minting `not recorded` by design. So **a creation stamped `agent` names
a running run whose principal is the caller**, by the stamp the run verbs already use (`${MACHINE_CLASS_PREFIX}${cls}` for a
deploy token, compared by `runPrincipalGate` unchanged), under the same `surfaces` bound, sight check, codes (C-66.1–.4) and
`inquiry_run_surfacings` row. A deploy token CAN hold a run (the run verbs admit admin, member and probe; `scopeFor` confines
probe to scratch), so nothing is unreachable. The alternative — restamping a deploy token's creation `human` — would invent
a person where none exists, and is refused. **Accepts when** an admin-, member- and probe-token creation of an inquiry naming
no run is refused `SURFACE_NO_RUN`, one inside the token's own running run lands with its surfacing row, and a member's
session creation is unchanged. NEGATIVE CONTROL: restore the `cls === "ai"` condition on the stamp, and the deploy-token
arms fail by name. The builder lists every non-test caller that creates an inquiry under a deploy token (the livefire, the
setup scripts, `agent-worker`) and moves each inside a run; one that cannot be is a finding brought here, never an exemption.

**BUILT 2026-09-23 by REC-171 (IC-186).** `index.mjs`'s `op=promote` stamp is `!viaSession` — `<principal>/<tokenId>` for an `ai`
credential, `class:<cls>` for an admin, member or probe token, the run verbs' own two forms — and `#surfacingGate` is
unchanged. A deploy token that writes `surfaced_by: human` is restamped `agent` by D-78 and refused `SURFACE_NO_RUN` like any
other. The callers, measured: livefire promotes through the Durable Object's own door and creates no inquiry; the setup page
and the UI promote under a member SESSION; `agent-worker/src` holds no `promote` site; `tools/fw21-onpoint-probe.mjs` is moved
inside a run (`bio-plane/test/surfacing-run.mjs`, which every corrected suite's fixture uses). `bio-plane/migrate/migrate.mjs`
CANNOT be — it replays questions surfaced in the Drive era, and a run opened today would record a lens and objective they
were never formed under — and is brought here as a finding (Incomplete sections).

**A MIGRATION IS A REPLAY, NOT A SURFACING — RULED 2026-09-23 by BOB #30, on REC-171's finding.** The stamp above is
`class:<cls>` (`MACHINE_CLASS_PREFIX`), the run verbs' own; this lane's BOB INBOX entry and messages wrote `token:<class>`, which is
not the code's spelling (REC-171's control showed it would break every landing), and the code's form stands. REC-171 found that
`bio-plane/migrate/migrate.mjs` replays Drive-era questions through `op=promote` under a deploy token and so is now refused
`SURFACE_NO_RUN` for every inquiry. Neither answer offered fits. A RUN would invent a lens nobody held, and a MEMBER
ATTESTATION would invent an author: the question was surfaced in the Drive era by whoever surfaced it there, and the plane is
carrying that record forward, not witnessing a new act. And D-78's `agent` restamp was already FALSE on this path, because it
told every later reader that a machine surfaced a member's question. So a migration is a THIRD case, admitted by what the
server can check rather than by what the caller says. A creation is a MIGRATION REPLAY when (1) it arrives under the
ADMIN class (the root of trust; `migrate.mjs`'s `admin-or-member` narrows to admin), and (2) it names a registered
drive-provenance capture already in the record whose preserved promotion records name this bundle id and list this
revision's `bundle.md` SHA-256. That check proves the bytes are the Drive era's, not the caller's. A replay (a) is exempt
from rule 2, since no surfacing happens on this plane; (b) keeps the `surfaced_by` its Drive-era bytes carry and is NOT
restamped by D-78, because a server-verified replay of recorded bytes is not a caller's assertion; and (c) reads
`surfaced_in: not recorded (migrated from the Drive era)`, never a guess, rule 2's own wording for a question surfaced
before it. Any creation failing (1) or (2) is an ordinary creation, and rule 2 and D-78 apply unchanged, so the door
cannot be used to skip a run. What remains is stated, not hidden: the drive-provenance capture is itself uploaded by the
root of trust, whose honesty the record does not model (Membership §DEC-2, deferred). **Accepts when** a replay naming
its provenance capture lands with its Drive-era `surfaced_by` and the migration suite migrates clean; one naming no capture,
a capture for another bundle or a SHA-256 the capture does not list is refused `SURFACE_NO_RUN` as today; and a
member-class token is refused. NEGATIVE CONTROL: drop the SHA-256 check, and the arm replaying altered bytes fails by
name. The builder verifies `migrate.mjs` registers the provenance capture BEFORE it promotes the bundle, and reorders if
not.

No production carries its own copy of the manifest: that would be a second place to state one fact (D-21), able to
disagree with the run it came from.

## 12 · Strength

- **STRENGTH IS A PAIR, AND THIS SECTION'S v2 SINGULAR WAS THE REFUSED NUMBER** (SWEEP
  C5). DEC-21/DEC-44 refuse the composition four ways: strength is a pair over two
  populations — the capture axis and the connection axis — never composed into one value.
  Everything below is computed and returned PER AXIS.
- **The pair is computed over the CURRENT version's accepted legs, with DEC-32's settled
  arithmetic: MIN over AND-related legs, MAX over OR-related branches, MIN within a
  branch.** That is why §3 requires the version to carry the ground partition and the
  relationship — the arithmetic's input is the composition, and a version without it
  re-ships the flat implicit-AND basis REC-42 corrected. The default is AND, the
  conservative direction.
- **The anti-gaming keystone survives machine composition, and two mechanisms carry it**
  (SWEEP C2). DEC-32's keystone is that independent sufficiency is affirmatively claimed
  per branch and *"the structure is authored BEFORE the strength is shown"* — but an
  AI-composed version arrives structure-and-strength together, and one accept could carry
  the member's name over OR-branches they never claimed. So: **(a)** D-195's independence
  check joins the pre-write checks (§14b.5) — provenance is content-addressed, so shared
  upstream origin between branches is DERIVED and surfaced; derived informs, authored
  binds. **(b)** The ACCEPT ceremony shows the derived falsifier back in plain words —
  *"your answer fails only if ALL of these fail"* — and the member AFFIRMS independent
  sufficiency per branch before their name lands over it. The machine's OR is a proposal;
  the member's affirmation is the authored act. No AND/OR vocabulary reaches any surface
  (DEC-32's elicitation, unchanged). **(c) The same disclosure at the member's OWN
  elicitation — RULED 2026-09-21 by BOB #22 (SCHEDULER (#5)'s Q1; UI-27, `elicFalsifier`).**
  D-195 was raised against DEC-32's AUTHORED judgement on the day DEC-32 was ruled
  (2026-08-04), before any machine composed a version, so the elicitation is its FIRST site
  and (a)–(b) extended it. Before the member's answers to *"Would refuting this alone change
  your conclusion?"* are written as a partition, the read-back that tells them *"your answer
  fails only if ALL of these fail"* names every shared upstream origin between the parts it
  lists, derived by the one implementation (`Store#independenceOf`) over the PROPOSED
  partition. It informs once (DEC-69), prefills nothing, refuses nothing, and shows no
  strength: a shared origin is a provenance fact, not a grade, so the keystone — structure
  authored before strength is shown — holds. NOT BUILT: `#independenceOf`'s two consumers
  are `op=suggest`'s check and `op=versionstrength`'s read of a STORED version, so nothing
  computes it for a partition not yet written, and the elicitation reads neither.
- **An ungraded leg is INERT AND NAMED** (DEC-18) — it contributes nothing, suspends
  nothing while graded legs remain, and is always named. A suspended leg suspends its
  branch; the conclusion suspends only when every branch is (DEC-18's pattern one level
  up, per DEC-32).
- **A frozen version freezes the COMPOSITION and the grade-REFERENCES — not the grades.**
  Regrade does not exist as an op (SWEEP §1.7): grades move only by minting better
  resolutions and re-writing basis through cite/promote. So the effective calculation
  always uses the CURRENT earned grades behind the version's references, a frozen
  version's displayed arithmetic can honestly move beneath it, and the description records
  what was true at composition. "Regrade is the second caller" in DEC-46's thread is a
  design intent, not a mechanism, until an op exists.
- The strength function **takes an argument naming which states to factor in**, defaulting
  to accepted. Safe by default, and it is also how §6.6's exploration works.
- **The return carries the state set that produced it**, in the same object — a pair
  travels, and a strength separated from its filter is a misread waiting to happen.
- **A what-if value is member-facing exploration and never a record value — and its
  presentation is IN-BAND** (SWEEP C10). v2 parked it as colour or transparency; DEC-40
  rules that a filtered rendering states its filter in the artifact itself, and its
  negative control (strip the filter line, the harness fails) applies here unchanged. A
  what-if pair carries its state-set line wherever it renders; colour may decorate the
  line and may never BE it.
- **A leg marked as a HUNCH** (§6.7 — a member marking, always) is visible as such and
  does not count as evidence.

## 13 · Published cases

A published case is out in the wild and cannot be affected. Only a different published case
can be — a new edition, or a different published project.

**THE ARITY, PER DEC-44 (SWEEP C9): a case is a CONTAINER over ONE OR MORE findings.** v2's
singular "the published bundle carries the current version" was DEC-44's corrected arity
error re-entering. Each included finding is a concluded inquiry with its claim, its basis,
and — after this design — its versions, of which the PUBLISHING PROJECT'S current one is
what publication freezes. So:

- **The published container carries, for EVERY included finding, the version that
  project's stance stood on** (Bob's rule, applied per finding): the leg configuration
  with its ground partition, so it can be reproduced in BIO, and the text description, so
  a person can read it. No case-level strength exists — that is R2's refused composition
  at case altitude (DEC-44's own negative control).
- **It carries each version's NAME and identity, and the name joins DEC-34's per-page
  header list.** Current moves on afterwards and the published case can never be changed,
  so without the name a later reader cannot tell which account was published. DEC-34's
  brazening already puts case id, edition, authors, declared bias, both floors, hash and
  the verification pointer on every page; the basis-version name is one field wider, for
  the same reason the filter line was (DEC-40): a page separated from its document still
  names exactly what it renders.
- **The case carries DEC-54's policy pin** (SWEEP C14). Versions do not carry conditions —
  the run does (§11) — but a case published under an adopted external policy names the
  policy VERSION it was held to (source, retrieval date, content hash), because the policy
  moves and the case must remain checkable after it moves. Reconcilable and now stated:
  the pin lives at the case, not on the version.
- **Editions stay over the container** (DEC-12): adding, removing or revising a finding —
  or moving which version a finding stands on — is a new edition, and prior editions keep
  answering.

**`[BOB-2 — RULED NO 2026-08-07 (SWEEP §4c)]` — WHAT THE PUBLISHED CASE SAYS ABOUT PRUNED
ALTERNATIVES.** R4's division rule
is that a published child names its parent and its siblings, because division without
disclosure is *"a laundering path with a tidy name"* — and a published case that discloses
nothing about alternative accounts considered and hidden is structurally the same hazard
(SWEEP §1.6). The existing idiom is the exclusion statement (`inquiry_exclusions`,
completeness statements scoped to an edition); the recommendation on file is one authored
sentence per edition in the same shape. Reversal is impossible for editions already
published, which is the argument for deciding before IS-8 builds. **RULED NO, 2026-08-07:
the published case carries the current version only and states nothing about hidden
alternatives — prune already only hides, so the record itself loses nothing.**

## 14 · Bias — a FENCE first, and a requirement on the skill second

**The lens rule is STRUCTURAL, and v2 demoting it to a skill requirement was the defect
§14b.4 itself names** (SWEEP C7): *a skill is instructions; a fence is code.* The standing
rule — a lens may be preserved and may not be applied — is enforced by construction:

- **The search half of the run never receives the bias.** The spawn contract for search
  sub-sessions and search passes omits the manifest by construction — there is no field to
  read. *"Bias never shapes what is captured or monitored, only how conclusions are
  weighed"* (`Content_Framework:1283`) — the coupling is forbidden, not discouraged.
- **The composing half CARRIES the manifest** (§3, ruled) for disclosure and for the
  weighing it discloses — never as a search input.
- **The cross-project boundary is where the fence earns its keep**: Team B accepting a
  version composed under Team A's bias, with none of the four things DEC-46 required at
  exactly this boundary. Every version's run names its manifest (§11), so the lens diff is
  COMPUTABLE at the accept surface — and DEC-46(3) explicitly rejected a
  notification-grade answer, so the surface shows the diff in the ceremony, not a toast.

**Bob, 2026-08-05: the skill's requirements include MINIMISING these effects.** That
stands — on top of the fence, never instead of it. Constrain the skill at the source
rather than bolting a report onto the output.

## 14a · INTEGRATION — how the AI attaches to the workflow

**Bob, 2026-08-05, answering the four open integration questions.** The model is Claude
Code, and the structural idea it gets right is the one this design adopts:

> **The agent is not inside the product. It is a separate process that acts on the product
> through the same interface a person could use.**

That is what makes it auditable and replaceable, and it is why a misbehaving agent is a
bounded problem rather than a compromised system. It is also DEC-55 already ruled — the AI
is an agent against the plane's endpoint surface — with the rest following.

### Which Claude account — a cascade, and it decides sovereignty too

**Bob:** the instance may have a Claude account whose token the BIO configuration holds;
every project and every member may have a different one. **Resolution order: the MEMBER's
account if they have one, otherwise the PROJECT's, otherwise the INSTANCE's.**

**This answers where the agent RUNS, not only who pays.** If the instance holds a token, the
instance can make the calls, so the agent loop runs in the group's own infrastructure rather
than on anything BIO operates. Sovereignty is preserved at exactly the point it matters
most — the installer's whole promise is a sovereign instance in the group's own account, and
an investigation running on someone else's servers would have put the most consequential
part of a group's work outside it.

**The shape is a FLEET MEMBER** — a separate Worker in the group's own account, as
`pdf-worker` already is (I6). The plane stays a record-keeper: it grows no model runtime, no
inference budget, and no new security posture.

Obligations that follow:

- **The record names WHICH LEVEL of the cascade was used**, not only that a machine acted —
  and per §4's correction, that Claude-account principal is named BESIDE the
  plane-credential principal, because they are two different principals and an act must
  say both (DEC-27(b), DEC-55.4). Never the token value.
- **When no token resolves at any level the capability is UNAVAILABLE and says so.** An
  honest absence, stated — never a silent no-op, which would be indistinguishable from a run
  that found nothing.
- **On a fallback instance the stakes rise, and DEC-43 should be read before deployment
  there** (SWEEP §6): AI-directed open-internet fetching under a root credential is the
  configuration that ruling exists to constrain.

**To MEASURE before building, not assume:** an agent loop spends most of its time waiting on
API responses and Workers bill CPU rather than wall time, so a whole run may sit well inside
the paid ceiling — or may not. It decides whether a fleet member can hold an entire run or
must be structured as many short invocations. → **D-218**

### Running sessions are visible in context — and this is CROSS-CUTTING

**Bob, 2026-08-05, and it is not investigation-specific.** A background session runs in a
CONTEXT and is associated with an inquiry or a project. Any window focused on any of
those objects shows **an animated indicator that a job is running**; clicking it opens the
**live transcript**. **The state of those objects does not change while the session runs**,
so there is no partial state to reconcile and no "come back later" notice is needed.

**The same applies to the Assistant and to every other AI-based function**, so this is a
GENERAL INTEGRATION SURFACE for AI sessions and should be designed once rather than per
feature — the way the fleet-member pattern was. The investigation session is its first
instance; DEC-52's approval sidebar (below) is its second consumer. `ASSISTANT-PILOT.md`
carries a pointer to this section, and **UI-38's scope should absorb this surface** or two
AI features will grow two surfaces (SWEEP §5a).

**TRANSCRIPT RETENTION — RULED, Bob 2026-08-06, now DEC-61 in the register: DEVICE-LOCAL,
with a TTL, AND deleted as part of the PUBLICATION process. Never in the record store.**
Bob's framing is what decides the shape: these are *"internal notes - like a reporter's
notes or internal deliberations… We've so far not identified any use for them. They need to
be protected from subpoenas."*
- **Device-local rather than instance-side, and the reason is the threat.** An instance-side
  cache lives in the group's own Cloudflare account — a third party who can be served
  directly, sometimes without telling the group, and who has no incentive to resist. On the
  member's device a demand must reach the member, who knows about it and can contest it. **The
  price, stated so nobody discovers it later: a teammate watching the running-session indicator
  can see that work is happening and cannot read the reasoning.**
- **Deletion at publication is a ROUTINE trigger and that is what makes it defensible.** The
  governing principle in journalistic practice is that destruction on a schedule set in advance
  and applied without regard to content is defensible; destruction begun once a demand is
  anticipated is spoliation, which is far worse than having kept the material.
- **THEREFORE THE PURGE MUST BE SUSPENDABLE — a litigation hold.** Recorded as a build
  requirement rather than a question, because it follows from Bob's own stated purpose and
  getting it wrong inverts the protection into liability: once a group is on notice, both the
  TTL and the publication-deletion must stop for relevant material.
- **Mechanical consequence:** device-local means publication cannot reach another member's
  device. Each device clears on next contact and the TTL is the backstop.
- *(General practice, not advice for this group's situation. California's shield law is among
  the strongest in the country; whether it reaches a civic accountability group rather than a
  newsroom is a question for counsel.)*

So the transcript is **LIVE, LOCAL AND SHORT-LIVED**, with the version's written description
(§6.1) carrying what survives. That is the same split Claude Code runs on, where the session
is the thinking and the commit message is the durable account — which is why §6.1's
description is held to a commit message's standard: what changed and why, not what happened.

### The pursue session and the daemon — request, wait, post-process

**Bob, 2026-08-05:** a pursue AI that initiates a capture *"needs to be notified when the
capture is complete and given a reference to the document so that it can post-process it."*

So the cycle is **request → daemon captures → notify with a reference → post-process**, and
each half belongs to whoever already owns it: the AI identifies what is worth having and
what to make of it once it arrives; the store layer does the capturing, the OCR and the
extraction, preserving provenance through the path that already exists. **The request half
is §4's `capture_requests` table** — the AI's endpoint writes a row, the daemon drains it,
and DEC-47's conduct rules are enforced once, at the drain.

**The notification is not new machinery — and the id scheme v2 cited was wrong.**
`NOTIFICATIONS.md` catalogues *"a capture the member walked away from has completed"*
(D-61) among its ~30 generators, and proposes `N-<n>` ids — but no N-number exists
anywhere in source; the live vocabulary is FINDING-class slugs in `queuestate.mjs`, and
that is what this generator is (§7). A pursue session waiting on a capture is that
generator with a different subscriber — extend the subscriber, do not invent a channel.

**This substantially de-risks D-218, and is worth saying before the measurement comes back.**
A run has natural suspension points by construction: search → identify → request captures →
**wait on the daemon** → post-process → form versions. The run must be able to stop and
resume whatever the CPU ceiling turns out to be, because it has to wait on work it does not
perform. So "many short invocations carrying state" is **the natural shape of the work rather
than a workaround for a limit** — and the Durable Object with alarms that the plane already
runs is where that state lives. Whichever way the measurement lands, the resumable shape is
the one to build.

**What post-processing may WRITE: the MECHANISM is ruled; the yes/no is `[BOB-4 — RULED
2026-08-07, PROVISIONAL: Bob's mechanical-standing principle is recorded on DEC-52, pending
his confirmation; the sidebar approval (identify → present → member approves) remains the
act of record for the constitutive fields]`.** Bob:
*"it may be the AI that also scans the captured document for content and connections."*
Extracting what a document literally contains asserts little; identifying a CONNECTION is
closer to a constitutive statement — DEC-52's open question. Bob ruled the mechanism
2026-08-06: *"The AI should identify the connections it finds and present them in a sidebar
of the session… with the capabilities for users to approve them individually and in bulk"*
— the sidebar IS the running-session surface above, and bulk approval is the same act over
a set, not a weaker act. **What remains open is DEC-52's underlying rule** — may a machine
credential write the six constitutive fields AS ACCEPTED at all (the derived/constitutive
split preserved: `resolve` is derived and cheap to leave open; testimony and the
entity/alias/relation/progression/threading acts, the expertise pair hardest, are where
the fences go). This design is a reason to answer it, not a place to answer it.

### Evidence search may be a SUB-SESSION

**Bob, 2026-08-05:** the search for evidence may itself be a sub-session, or mechanical, and
it may go out to the internet.

This is the ephemeral-worker pattern: a sub-session is spawned for one job, reports to its
parent, and ends. The four levels — meaning, content, documents, the open internet — are the
natural fan-out.

**A search sub-session never touches the record — and never holds the bias.** It reads,
fetches through the request door, and reports back to the parent, which remains the only
thing holding a write and the only thing holding the manifest (§14). So the fence stays ONE
endpoint no matter how many sub-sessions a run spawns, and no sub-session needs a write
scope — or a lens — of its own.

**REACHING THE OPEN INTERNET IS ANSWERED — DEC-47, Bob 2026-08-06: the inquiry and the session
launch ARE the authorisation, for *"areas that anybody can go through."*** No per-fetch or
per-batch dialog. The prior recommendation (acquire only on an authored act, plans proposing in
bulk) was refuted: a member asked to approve forty URLs has not done the research and cannot
judge them, so the approval would add paperwork without judgement — and asking permission to
use the internet asks a member to re-authorise what opening the inquiry already authorised.
**What remains is CONDUCT, not authorisation, and it is enforced at the `capture_requests`
drain:** where "public" stops (logins, paywalls, a private individual's site), and how the
instance behaves out there (rate, volume, identifying honestly — the UA's contact URL is
MEASURED, not stylistic: removing it flips admission 200→403 uniformly, and `purpose`
distinguishes capture from monitoring, so an investigation fetch introduces or reuses a
purpose token deliberately — `SOURCE-ACCESS.md:133-169`). The structural gate costs nothing
and stays: the AI never fetches, it REQUESTS, and the daemon captures.

**`[BOB-3 — RULED 2026-08-07 (SWEEP §4c)]` — robots.txt and "areas anybody can go
through."** Measured: Oakland's
robots.txt carries 82 Disallow rules of which **63 are Public Ethics Commission
publications**, including sixteen years of annual reports. On this instance's most relevant
corpus, the conduct rule DEC-47 deferred decides whether the session can reach transparency
publications at all. This is doctrine — posture toward sources, and what "public" means —
not build detail. Nothing is built; no fetch happens. **RULED, 2026-08-07: robots.txt
disallows do not bar capture of publicly available documents, and the member-browser UA
from inquiry creation is permitted for these fetches (DEC-52; SOURCE-ACCESS.md amended).**

### What Claude Code's model maps onto, in one table

| Claude Code | the investigative AI |
| --- | --- |
| runs on your machine, not inside the forge | a fleet member in the group's own account |
| `settings.json` — routine pre-approved, consequential gated | the credential's declared scope: reads ungated, one write that can only suggest |
| gated acts interrupt a human | **stronger here** — accept and make-current have no op the AI can call |
| `CLAUDE.md` loaded every session, versioned in the repo | the skill's doctrine layer, and **the run records which skill version it ran under** |
| one session per worktree; sessions share no state | one run; runs share no state |
| an uncommitted change reaches nobody | a version reaches people because it is written; the conversation does not |
| the commit message | the version's description (§6.1) |
| review the diff | rotate between versions; comparison IS the diff |
| interactive, scheduled, or CI — one agent, three triggers | one agent, two modes (§10) |
| subagents for broad search, composed by the parent | evidence-search sub-sessions over the four levels, returning REPORTS |
| refusals surfaced verbatim, never worked around | refusals carry codes with canned translations (DEC-49); absence at one level is not absence at the next |

## 14b · THE RUN'S ARCHITECTURE — derived from Claude Code, grounded in what exists

**Bob, 2026-08-06: build the best-of-breed architecture, learning from Claude Code.** This
section is the result of a rigorous pass over the repo. Three findings change the design
materially; the rest is Claude Code's structure mapped onto machinery BIO already has.

### 1 · CONTEXT ECONOMY — the largest gap in the design as written, and it was absent

Everything above says the session "reads the project." **A run cannot hold a project.** A
project with forty inquiries and thousands of captured documents exceeds any context
window, and a design that does not say how it copes will discover this on its first real
corpus.

Claude Code's answer is three mechanisms, and all three transfer:

- **Sub-sessions return REPORTS, not their reading.** A search sub-session reads widely
  in its own context and hands back what it found — never the documents. This is why §14a's
  fan-out is not merely a speed optimisation: **it is the memory model.** Without it a run
  drowns in its own evidence.
- **Query, never load.** The run holds the inquiry, its versions and its working set.
  Everything else it reaches by asking. The store is the memory; the context is the
  workspace.
- **Progressive disclosure.** The skill's doctrine layer is always resident; its recipes,
  vocabularies and per-format knowledge load when the run reaches work that needs them.

**The consequence for the fan-out is a rule, not a preference: a sub-session that returns
documents rather than reports has defeated the architecture.** Its contract is a REPORT with
a citation, and the parent re-reads by address if it needs the bytes. The same contract is
where §14's fence lands: the spawn payload carries no bias manifest, by construction.

### 2 · THE READ SURFACE HAS A HOLE, and it is exactly where the session lives

Measured in `STORE-AS-CACHE.md` and re-verified by the sweep (MEASUREMENTS.md, 2026-08-07):
BIO has **two retrieval routes**, and the session needs both while only one has a query
surface.

- **Route 1, the query compiler** (`query.mjs`): **34 filterable fields, 5 FTS columns**
  (`title`, `body`, `meta`, `locator`, `authority`).
- **Route 2, the meaning tables**: `readings`, `reading_refs`, `resolutions`, `connections`,
  `inquiry_basis` — **none of them reachable by the query compiler.**

**And the projection makes the hole invisible, which is worse than the hole.** Route 1 carries
SCALAR SUMMARIES of the meaning layer onto the bundle row — `capture` →
`inquiry_capture_strength`, `legs` → `inquiry_basis_count`, and so on. So a caller can filter
by a finding's strength and never reach the legs that produced it. `STORE-AS-CACHE.md` names
this exactly: **the projection creates a false sense of coverage — the meaning layer is
visible as a number and unreachable as a structure.**

**The investigative session is the first consumer that genuinely needs route 2**, because
forming a version of an inquiry's basis is meaning-layer work. As written, §3's read scope is
not achievable: the session can see that a conclusion scores 0.7 and cannot see what it rests
on.

**So a meaning-layer read surface is a PRECONDITION of this design, not an enhancement.**
Recorded as **D-222**. Whether it becomes an extension of the query compiler or a second
addressable surface is graded in §14c; that it must exist before the session can do its job
is not open.

**AND D-164 IS THE SECOND PRECONDITION, DECLARED RATHER THAN DISCOVERED** (SWEEP C15).
Legs are DOCUMENT-GRAIN today: every edge in the system — legs, citations, connections —
addresses a whole capture or bundle, and DEC-23 requires extent and extraction method on
every content leg, which nothing can yet express. Until D-164's content-extent primitive
lands, this design says so honestly: **versions compose document-grain legs, the passage
lives in the version's description, and the record cannot yet cite the sentence.** A
version written before D-164 does not overclaim — its legs say "this document," not "this
passage" — and the description carries what the leg cannot. (Beside it, D-168: `op=cite`
is type-only, so RETIRED information is citable — which is why §14b.5's reachability check
checks the address, not just the type.)

**And D-220's version join belongs to the same gap**: sixty document versions read as sixty
documents is the identical false-coverage failure one axis over.

### 3 · RESUMABILITY IS ALREADY BUILT, and joining it is a documented step

§14a established that a run must suspend and resume — it waits on the daemon for captures it
requested, whatever the CPU ceiling turns out to be. **The mechanism exists and the repo tells
the next consumer how to join it.**

`SCHEDULER.md` records the decision: ONE reconciling Durable Object alarm with a consumer
registry, `#schedConsumers(probe)`, each entry `{ name, due(now), wake(now), tick(now) }` —
**SEVEN live consumers today** (`store.mjs:1452`), ticks may be async and are awaited.
Three properties matter here and all three are already proven:

- **No starvation** — the reconcile keeps EVERY active consumer's wake, not only the one that
  just ran, so a fast consumer cannot shut out a slow one.
- **Self-termination** — an idle instance carries no timer and spends nothing, which the
  sovereign-instance distribution model needs since most instances sit on the Free tier.
- **Locality** — the consumer runs beside the DO's own SQLite, which is where a run's state
  lives anyway (§11's `capture_sessions` shape).

The file's own instruction is explicit: *"To add the monitoring / eligibility / cadence /
ageing consumers: append an entry to `#schedConsumers`… Do NOT add a second alarm or a cron;
that is the decision this file records."* **The investigative run is one appended entry.** It
needs no new scheduling machinery, and building one would violate a recorded decision.

### 4 · WHAT IS SCRIPTED AND WHAT IS JUDGED

Claude Code's clearest structural lesson: **do not let the model decide control flow that
should be guaranteed.** Loops, fan-out and gates are deterministic; judgement happens inside a
step. (The evidential case is measured, not stylistic: TREC 2011 found searchers estimating
their own recall erred by up to +95/−87 points and terminated review prematurely on a false
belief of high recall — the model never decides when the loop stops.)

| deterministic — code, not skill | the model's judgement |
| --- | --- |
| how many search passes, and when the loop stops | what to search for |
| the fan-out across the four levels | what each level's reports mean |
| a version is written in `suggested` and no other state | what the version says |
| dedup against existing versions before writing | whether this reading differs in substance |
| the observation log is written whether or not the run succeeds | where it stopped and why |
| every machine fence | — |

**The gates must not depend on the skill behaving well.** A skill is instructions; a fence is
code. Where this design says the AI "may not" do something, that must be a refusal in the
plane, not a sentence in a prompt — which is DEC-55's endpoint-is-the-fence, restated as a
build rule. **And every refusal this design promises "BY NAME" is a C-number in the check
catalogue** — the IS work allocated none in v2, and each IS item now allocates its
C-numbers at build, same as every other gate (§18).

**The skill's own prohibition set comes from the practice survey and is not restated by
each build session** (SWEEP §3): no generated justification anywhere — a generated one is a
fabricated attribution; the one permitted auto-composition is assembling the member's OWN
prior words; no single confidence score; no connection-density ranking; machine-proposed
connections never presented as connections.

### 5 · THE RUN VERIFIES ITS OWN WORK BEFORE PROPOSING — and the checks are the PLANE'S

Claude Code runs the tests and reads the output rather than declaring success. The session's
equivalent is deterministic and cheap, and it runs on every version before it is written.
**The checks run PLANE-SIDE** (SWEEP C11): if the fleet member computed them it would hold
a copy of the plane's rules — the drift class DEC-8 closed — so they live in code beside
the endpoint, and the fleet member merely receives their verdicts. **Each carries a NAMED
ERROR CODE with a canned translation, and an untranslated code fails the harness** —
DEC-49's guard, not optional; the design mints new member-facing conditions and every one
ships with its code. The checks:

- every leg cites something that **exists and is reachable at the address given** — beyond
  type, because `op=cite` is type-only today and a type-only check would pass RETIRED
  information (D-168);
- the strengths **compute** — the version's arithmetic runs PER AXIS over its declared
  ground partition and produces a pair;
- the version **differs in substance** from every existing version (Bob's rule), which is
  the same check that prevents duplicate churn;
- **OR-branches pass the independence check** (D-195) — content-addressed provenance lets
  the plane DERIVE that two branches' legs share an upstream origin, and surface it. An AI
  composing OR-branches at volume is *"the Judith Miller error with arithmetic behind
  it"*; derived informs, authored binds — the check surfaces, the member decides at §12's
  accept ceremony;
- **nothing in it is boilerplate** — a version whose description or reason field is
  placeholder text is not proposed. The placeholder defect is already measured at human
  speed (`counterparty: to be named` satisfying a non-empty check, `PROCESS-INVENTORY`);
  an AI filling required fields to clear a gate is the same defect at machine scale;
- nothing in it is in a state the session may not write.

A version failing any of these is not proposed, and the refusal is by C-number. This is a
check, not a judgement, so it belongs in code beside the endpoint rather than in the skill.

### 6 · A RUN IS BOUNDED, AND THE BOUND IS RECORDED

An unbounded run over a large project is the failure mode a background job invites. A run
carries a budget — fetches requested, sub-sessions spawned, wall time across resumptions — and
**when a bound stops a run, the observation log says which bound and where it stopped.** That
is the same discipline `heldMatch` learned the hard way: *not found* and *did not finish
looking* are different facts, and only one of them is a licence to conclude anything.
**The record already has the word and lacks the writer**: `runtime-ceiling-reached` exists
in the condition vocabulary with NO producer (`queuestate.mjs:82`) — IS-9(d) builds that
producer rather than minting a new kind.

**A bound only counts up, and the plane's own counts are the plane's — BUILT 2026-09-23 by REC-169 (IC-184).** A bound is
an allowance a member declares; the run spends it. So a figure the caller writes into one (`op=airuntick`'s `consume`, and
`op=airunopen`'s `consumed` seed) is a non-negative whole number (`AI_RUN_CONSUME_INVALID`, C-22.13) — a negative one was a
REFUND, driven before the fix: a run that had spent its one `surfaces` ticked `-1` and opened a second question — and a
bound the plane counts as the work lands (`mints`, `surfaces`: `airun.mjs PLANE_COUNTED_BOUNDS`) takes no figure from the
caller at all (`AI_RUN_BOUND_PLANE_COUNTED`, C-22.14). One bad figure refuses the whole tick; nothing is written.
**And a figure lands only on a bound the run HAS — BUILT 2026-09-23 by REC-172 (IC-188, PROPOSED).** A tick's `consume` is a MAP
from a bound's name to what was spent; an ARRAY (whose keys are positions) or a key naming no bound was SKIPPED, so the tick
answered `ticked: true` over a spend the record never held — the live instrument `vf4-live-scratch.mjs` sent an array for its
whole life and none of its fetches was counted. Both are refused (`AI_RUN_BOUND_UNKNOWN`, C-22.15), and so is the open's
`bounds` that is not a list or an entry naming no bound (a member who declared `fetchs: 3` had got a run with no fetch ceiling).
The member's `allowed` is held to the same whole number as the spend (C-22.13; it was written `Number(x) || 0`). And `lease` is
not a consumable at all: its lapse is read off the clock by the plane, so no figure for it, zero included, is the caller's to
send or a member's to declare (C-22.14, `airun.mjs PLANE_DECIDED_BOUNDS`).

### 7 · PARTIAL RESULTS SURVIVE

A run that dies halfway must not lose what it found. Versions are written as they are formed
rather than in one batch at the end, and the observation log is appended as the run goes.
A resumed run reads its own log and continues rather than restarting — the same property that
makes Claude Code's workflow resume cheap, and the reason §6's version identity (frozen,
uniquely named) matters operationally as well as conceptually.

## 14c · D-222 — THE OPTIONS, GRADED

**Researched 2026-08-06 across four parallel sub-sessions** (query compiler, meaning-layer
tables, versioning surfaces, op/interface conventions). Every option below was re-confirmed
against source rather than reasoned about; the constraints each must clear are measured, not
asserted. The counts (34 fields, 5 FTS columns, six statement builders) were re-verified by
the sweep and recorded in `MEASUREMENTS.md` (2026-08-07, the consistency sweep); the
compound ceiling and the facet timings are pinned as MEASURED comments at their source
(`query.mjs:588`, `:155`).

### What must hold, whichever option wins

| constraint | why, and where it is enforced |
| --- | --- |
| **ONE compilation point for visibility (D-15)** | `viewerPredicate` (`query.mjs:189`) is the only one, and `Store#runQuery` **throws** if a statement reaches the store without `GATE_MARK`. Not a convention |
| The gate is a **WHERE predicate, not a CTE** | measured: 283 ms against 5 ms for a facet sidebar at 20,000 bundles (`query.mjs:155`) |
| **A meaning-layer answer is a CANDIDATE LIST**, so REC-36's stricter rule applies | most reads redact a back-reference; a candidate list **withholds the whole row**, because even a nameless candidate discloses that something mentioning the subject sits in a project the viewer was not invited to |
| **Envelope, never a bare array** | `bounds.test.mjs` pins the bare-array exception at **exactly one op**; a second one fails the suite (IC-24, proposed not landed) |
| `limit` means the cap **actually applied**, and truncation is said in the op's existing vocabulary | REC-57 / IC-23, roster read off the source by a walk rather than listed by hand |
| Hidden and absent answer **identically**; a published `total` is gated with the rows | *"a total larger than the pages says something is hidden"* |
| **MAX_COMPOUND = 4** | workerd's compound-SELECT ceiling is **FIVE**, not SQLite's documented 500 — found by the 2026-07-25 scale bench, pinned as the MEASURED comment at `query.mjs:588`; six ordinary filters already reach it |
| Every arm keys on `fts_id` | a bundle not text-indexed is invisible to every arm; a new arm must join back through `bundles.fts_id` or it will not compose |

### The options

**A · A new SET-ALGEBRA ARM in the compiler** — e.g. `leg:hunch`, `resolves:>=B`, `concerns:ENT-1`.
*Viability CONFIRMED*: `setSql` dispatches on node type and every leaf returns `{sql,args,compound}`; **all five meaning tables carry `bundle_id` with an index**, so the join exists. The `ids` arm is the precedent for adding a whole CTE arm, and its comment is the argument for doing it here: *"an ARM of the query, not a filter applied after it… it passes the viewer gate, it obeys the sort, and it is executed by the one guarded executor."*
- **For:** composes with every existing operator, sort, paging and facets for free; no new gate; no new answer shape; `op=search` simply gains vocabulary; **discharges D-223 immediately** (*which inquiries carry a hunch leg*).
- **Against:** **grain collapse** — it selects BUNDLES, so you learn which inquiries, never which legs; each arm spends one of only four compound terms; grade columns are **unindexed**, so a grade predicate scans until an index is added.

**B · A SECOND ADDRESSABLE SURFACE beside the compiler.**
*Viability: possible, and it costs a ruling.* `query.mjs:701-705` says a selection resolved by another route *"would be the second query path this design exists to prevent"*, and D-15 gives visibility exactly one compilation point enforced by a throw. A second surface either duplicates the gate — forbidden in spirit and the one place the graph could escape — or imports `viewerPredicate`, at which point it is not separate.
- **For:** preserves grain natively; no compound-term pressure.
- **Against:** contradicts two standing decisions; ~24 ops to reconcile. **Not recommended.**

**C · A new STATEMENT SHAPE on the SAME compiler, returning meaning-grain rows.**
*Viability CONFIRMED*: `compile()` already returns six statement builders registered in one place (`{page, count, ids, snapshot, facets, facetScan}`, `query.mjs:827`; MEASUREMENTS.md 2026-08-07). A seventh projects the meaning rows belonging to the bundles already in `scope`, using the `ranked` CTE as the template for per-row payload.
- **For:** **preserves grain** — returns the legs and resolutions themselves; same compiler, same gate, same executor, so it is *not* a second query path; scope stays bundle-shaped, which is exactly what keeps gating correct.
- **Against:** more work than A; needs one new op to expose it (additive to I3).

**D · HYBRID — A for SELECTION, C for GRAIN.** The arm chooses the set; the statement shape returns the meaning rows in it. Together they answer *"every hunch leg in this project, with its role and its partition."*

**E · MORE PER-QUESTION OPS, following the existing pattern.**
- **For:** cheapest; matches a coherent house pattern (one op per question, single key, derived on read, `{ok, key, count, rows[]}`); zero compiler risk.
- **Against, and it is decisive here:** the pattern's defect *is* that the ops do not compose, and **the investigative session's questions are not knowable in advance** — which is what distinguishes it from every existing consumer. Enumerating ops for an agent that formulates its own questions is a category error. It also grows a 131-entry table (MEASUREMENTS.md 2026-08-07) one question at a time.

### RECOMMENDATION — **D, staged as A then C**

1. **A first.** Small, composable, no new answer shape, and it discharges D-223 — the enumeration of hunch debt that the schema calls publication-disqualifying — at inquiry grain, which is the grain a group asking *"what is our exposure?"* actually wants. Add the missing index on any grade column the arm filters, or measure and record why not.
2. **C second**, when the session needs the legs themselves rather than the inquiries carrying them. This is the half the investigative session genuinely blocks on.
3. **Not B.** It buys grain at the price of two standing decisions, and C buys the same grain without them.

**Related finding, raised as D-225 on 2026-08-07 and since CLOSED — CORRECTED IN PLACE on 2026-09-15 by REC-99, never deleted, because the gap this paragraph recorded was real and the gap CLOSING is the news:** the existing meaning-layer reads — `concerns`, `resolutions`, `connections` — **WERE uncapped** on the day this was written, which is why they never appeared on REC-57's bounded-ops roster. The sentence stood here in the PRESENT TENSE for 38 days after it stopped being true.

**They were capped the same day this was written, at REC-60 on 2026-08-07 under `IC-25`** (SETTLED, I3 8.1.0 → 9.0.0 → 10.0.0): `resolutionsForCapture`, `documentsConcerning` and `connectionsFor` each clamp to 500 by default and 5,000 at the ceiling, and publish `limit` AFTER clamping beside `truncated`. So the precondition this paragraph set — that they join the same footing BEFORE a capped new surface lands beside them — **WAS MET, and met before anything new landed.** D-225 was closed on 2026-09-14 by REC-89, an item that built nothing and spent a worker slot proving that already-shipped work had shipped; this sentence and the framework's Appendix A.4 row were the two citations that put it on the queue (`CONTENT-SEARCH-DESIGN.md` §2 and §7 row 1 cite both). **A precondition is a claim about the day it was written, and this paragraph is the receipt** — which is why it is corrected here rather than removed.

**What is still open about those caps is not the bound but the INSTRUMENT that watches it.** D-365 measured on 2026-09-14 that removing the SQL `LIMIT` from any one of the three, leaving the envelope perfectly honest, left every bounds suite FULLY GREEN while `derivation-bounds.test.mjs` PRINTED the newly-unbounded method in its census and graded nothing. REC-99 graded that census on 2026-09-15: the same edit now fails BY NAME. The residue — six `truncated` figures measured over in-memory collections, which neither half grades — is D-369.

**Interface work:** I3 (RECORD's) — additive, minor bump, IC entry recorded even though I3 says adding an op needs no protocol, because IC-3's settled reasoning is that recording a break as additive *"would teach this registry to lie"*. I5 is untouched unless the grade index lands, which is a schema change.

## 15 · Instruments — measure from the first run

- **Does a run ever come back with nothing supportable?** If it never returns empty it is
  manufacturing. The cheapest single signal that any of this works — and it now has an
  OBJECT: §9's *this level is empty* kind is what an honest empty-handed run emits, so an
  empty run and a silent failure are distinguishable. This instrument is also acceptance
  on IS-9, and its negative control is §18's seventh.
- **Accepted-to-suggested ratio over time.** If versions outrun review, an inquiry is
  accumulating accounts nobody has read — each correctly labelled, the whole unexamined.
- **The rejection record read as a pattern**, which is §1's third argument's evidence —
  and the reason prune HIDES (§6.3a): the pattern is computable only because the acts
  persist.
- **Where the run stopped and why** — the observation log, including which bound (§14b.6).

## 16 · Positions taken and WITHDRAWN

| withdrawn | why it fell |
| --- | --- |
| *If the AI proposes claim, evidence, reasoning and falsifiers, nothing is left for the member to author that is expensive to fake.* | Collapses **suggesting / authoring / committing** (Bob). Critique is authorship. |
| *A proposed leg may not rest on an unaccepted claim.* | A prohibition on structure where the concern was arithmetic. Hiding a basis makes review shallower, and BIO **labels and discloses** rather than prohibiting and hiding. |
| *A session that knows the bar can optimise toward clearing it.* | Only if the evidence supports it, which it cannot. |
| *A state for a published finding with unreviewed evidence against it.* | A published case cannot be affected. |
| *A new state-fence primitive is required.* | The endpoint is the fence. |
| *Claims recorded as agreeing or disagreeing along a range.* | Bob's contract pair does not disagree — together they narrate, and relevance depends on the question asked. |
| *SUPPORT / UNDERCUT / REBUTTAL as three stored objects.* | **Reductionist** (Bob): one sentence can do all three at once against different claims. Roles are not types. Replaced by §5 — the AI shapes the legs; the record holds no relationship taxonomy. |
| *Recording that a run reproduced an existing version, as corroboration.* | **Withdrawn by this session.** Two runs of the same skill over overlapping evidence are heavily correlated, so their agreement is weak evidence, and recording it as corroboration would dress up something that is not one. |
| *Versions belong to a CLAIM object.* (v2, withdrawn by the sweep) | A claim has no object identity — DEC-32's citability test withheld it and Case Making ruled claim = a field of an inquiry. A versioned, named, stateful claim object rebuilds the multiplicity D-127's collapse removed. Versions attach to the inquiry's basis (§3). |
| *A requested capture is attributable to the instance's ordinary path "rather than to an agent".* (v2 §4.1) | DEC-27(b) requires the record to state BOTH — the agent and the principal — and DEC-55.4 adds the token identity. They could not both be true; DEC-27(b) wins (§4). |
| *"Effective strength" as one number over the current version.* (v2 §12) | The refused single number — DEC-21/DEC-44's four refusals: a PAIR over two populations, never composed; and stating the calculation without DEC-32's MIN/MAX re-shipped the flat-AND basis REC-42 corrected. |
| *Prune DELETES ancestor versions.* (v2 §6.3a) | Collided with D-214's the-acts-must-persist and DEC-16/19's never-vanishes-silently. Prune hides; display shrinks, acts remain (§6.3a). |
| *Bias handled as a requirement on the skill.* (v2 §14) | The design's own §14b.4 rule: a skill is instructions, a fence is code. The lens rule is structural — the search half never receives the bias. |
| *Notifications carry stable `N-<n>` ids.* (v2 §14a, §17) | No N-number exists anywhere in source; the live vocabulary is FINDING-class slugs in `queuestate.mjs`, fenced by `classOfKind`. |
| *Sub-sessions return "findings".* (v2 §14b) | Three senses of the record's unit of truth (D-226). A sub-session returns a REPORT. |

**The pattern behind the first five:** the same worry — *the AI might produce something the
evidence does not support* — re-derived against each new input. Excluded by the objective and
the structural gates, not by vigilance. **The pattern behind the next two, which is worse:**
the session was doing safety engineering where the question was epistemology, and then
schema design where the question was judgement. Both times the answer was that the
intelligence belongs in the AI's work, not in a structure the record computes over.
**The pattern behind the v3 rows, and it is the sweep's one-line verdict:** the design
re-derived nouns and rules the register already held, and every re-derivation drifted —
the correction each time was to CITE the ruling, not to reconstruct it.

## 17 · What is NOT settled — and what was settled since v2

1. ~~Leads for other inquiries have no home.~~ **ANSWERED 2026-08-06 by Bob: discovered
   evidence not related to the current inquiry is CAPTURED and recorded as an ACTIONABLE
   NOTIFICATION the member can act on later.** A FINDING-class slug with a producer, a real
   `basis`, and `options[]` — whose natural options are inquiry-grain acts that do not yet
   exist, the D-222 grain problem one surface over; its `case` set derives from inquiry
   B's ancestors, not A's. It composes correctly with §4: the document is CAPTURED (entry
   to the store, not to any basis) and the observation becomes the notification.
   → **D-213, answered; closes when the slug lands**
2. ~~Whether a version carries the conditions it was formed under.~~ **ANSWERED — ruled
   for the bias component before it was asked** (`Content_Framework:1129-1141`; SWEEP
   §1.2), and the run object carries the rest by construction (§11). → **D-215, closed**
3. **Whether sharing is stronger in the data model than the edge association found**, which
   would force cloning after all (§7). A check against the model for IS-3's builder, not a
   decision. → **D-216**
3a. **Whether a fleet member can hold a whole run** inside the paid CPU ceiling (§14a).
   De-risked — the resumable shape is the one to build either way — so the measurement
   sizes the work rather than deciding its shape. → **D-218**
3b. ~~Egress~~ **ANSWERED — DEC-47, 2026-08-06** (§14a): the inquiry and the session launch
   are the authorisation for public sources. What remains of conduct is enforced at the
   `capture_requests` drain — except **robots.txt, which is `[BOB-3 — RULED 2026-08-07:
   disallows do not bar capture of public documents]`** (§14a).
4. ~~Review burden.~~ **ANSWERED** — D-217a's derivation tree with the prune offer (§6.3a,
   prune hides per SWEEP §4b), plus the proposal rules: aggregate never multiply, age
   never vanish, reasons on deferral and dismissal (§6.4). → **D-217, answered**
5. ~~Whether a reworded claim is a new version or a new claim.~~ **ANSWERED** — user
   selectable, D-217b (§6.3b).
6. ~~Pruned-alternatives disclosure.~~ **`[BOB-2 — RULED NO 2026-08-07]`** — the published
   case carries the current version only, no disclosure of hidden alternatives (§13).
7. **`[BOB-4 — RULED 2026-08-07, PROVISIONAL]`** — DEC-52's remaining yes/no: Bob's
   mechanical-standing principle recorded on DEC-52, pending his confirmation; the sidebar
   approval remains the act of record for the constitutive fields (§14a).
8. **D-84** — the bias object type, now named as the second unbuildable read's precondition
   (§3): until it lands, "no manifest was in force," stated, is the only discharge.
9. **D-222 / D-164** — the two declared preconditions (§14b.2).

## 18 · Decomposition — HANDED OVER 2026-08-07 and ENACTED

**~~Bob, 2026-08-05: hold the handover until the integration architecture is finished. The
`BOB INBOX` says so and instructs CONDUCT not to schedule any of it.~~ SUPERSEDED — the hold
was LIFTED by Bob 2026-08-07 and CONDUCT drained the entry and enacted this section the same
day. Corrected here in the same turn rather than left standing, because §18 is exactly what
an IS worker reads and the struck sentence would have told them to stop.** The items are in
`QUEUE.md` under RECORD, keeping their `IS-` ids so each traces back to this section by name
— placed there rather than in a new area because a second area would contend for `store.mjs`
with RECORD, which is the one thing a `CLAIMS.md` claim cannot protect against. Preconditions
queued ahead of them: REC-60 (D-225's caps), REC-61 (D-220's join), REC-62 (D-222 staged A
then C), and REC-59 before any new IS op. Milestones per the
2026-08-07 placement (MILESTONES.md M9 note): **IS-1/2/4/7 are M9; IS-5/6/9 are M9
substrate; IS-3 and the running-session surface are M8 (UI-38 should absorb the latter);
IS-8 is M10.** Sequencing per §2: the CHECK mode deploys first; REC-59 lands before any
new IS op (the bare-array pin allows exactly one exception — the op REC-59 fixes); D-225's
caps land before D-222's new surface. **Every IS item allocates its C-numbers at build**
— every refusal below that says "refused" is a named check in the catalogue with a DEC-49
error code and canned translation.

| piece | what it is | acceptance ALSO carries (§14b) | depends on |
| --- | --- | --- | --- |
| **IS-1** | **Versions of the inquiry's basis**: an inquiry carries many; frozen once written; unique name per inquiry; description required; ground partition + AND/OR relationship carried (§3, §12); derivation tree via `derived_from` (its first real producer) with the HIDE-only prune offer; reword user-selectable (§6). Builds on `basis[]`/`inquiry_basis` through `promote`'s one write site — no second version table. | version identity survives a run's death (§14b.7); D-226's vocabulary resolved before scheduling | none |
| **IS-2** | The **state machine** over versions — the SIXTH machine, stated as such; four states, reversible, every transition a member act with the four beats, reasons on rejection/deferral/dismissal, machine identity refused on each; proposals aggregate and age (§6.4); publishes through `op=affordances`. **NC, corrected 2026-08-07 — the first draft would have passed VACUOUSLY** (`VERIFICATION.md` rule 3a: a rule enforced in N places carries an assertion at EACH place, and an `ai` credential refused at the CREDENTIAL layer absorbs the control before the transition refusal ever runs). The fence lives in three layers — credential scope (IS-5), endpoint (IS-4), transition (IS-2) — so the control breaks EACH layer with the others held open and requires THAT layer's own assertion to fail. | **every fence is CODE, never a line in the skill** (§14b.4); depends on D-78's `surfaced_by` fix being real | IS-1 |
| **IS-3** | **CURRENT as a project-to-inquiry property** (§7) — a dated frontmatter field beside `required_strength`, never a settings row — with the shared-inquiry notifications as FINDING-class slugs. | — | IS-1, D-216 |
| **IS-4** | The **suggest endpoint** — §9's kinds including *this level is empty*, sole possible output a suggested version, carrying its run. One write path for both modes. | **the pre-write checks of §14b.5, PLANE-side**: reachable-at-address legs, per-axis computation over the partition, differs-in-substance, D-195 independence over OR-branches, no boilerplate, no unwritable state — each with a C-number, an error code and a canned translation (DEC-49); **NC: remove any ONE refusal and its suite fails** (owed control 6) | IS-1, IS-2 |
| **IS-5** | The **`ai` credential's investigative scope**: reads across the project under a STATED viewer (§3), writes only IS-4 and `capture_requests`. | **NC: DEC-55.5 whole** — mint an `ai`-class credential, assert every `MACHINE_CANNOT_*` refusal fires BY NAME, **and that removing the predicate makes them all pass** (owed control 1 — the second half was never run) | IS-4 |
| **IS-6** | The **run object and its observation log** (§11), on the `capture_sessions` shape — scratch, ticks, expiry, resumable; log never in `bundle.md`; D-129 vocabulary, D-104's governed/unreachable split, shell captures `LOOKED_INDETERMINATE`. | the log is written **whether or not the run succeeds** and **names the bound that stopped it** (§14b.6); **NC: a run KILLED mid-flight whose log must exist and name the bound** — the failure path is the only one that matters | none |
| **IS-7** | **The strength PAIR over the current version** — per axis, MIN/MAX per DEC-32, the state-set argument, the state set on the return, ungraded legs inert-and-named, hunches excluded, what-if in-band (§12). | **NC: DEC-40's** — produce a what-if rendering, strip its filter/state-set line, the harness fails (owed control 3) | IS-1 |
| **IS-8** | **The published case per §13** — the container carries each included finding's current version with its ground partition, description, NAME in DEC-34's header, and DEC-54's policy pin; `[BOB-2 — RULED NO 2026-08-07: current version only, no disclosure of hidden alternatives]` — resolved. | **NC: DEC-44's** — publish a case of two findings with differing strength pairs; the harness fails if any surface presents a single case-level strength (owed control 2); **NC: DEC-34's** — a page rendered without the header, now including the version name, fails (owed control 4); **NC: DEC-46(a)'s** — a carried-forward bias acknowledgement fails (owed control 5) | IS-1, IS-3, D-187, DEC-59's elements, the DEC-33-blocked ceremony |
| **IS-9** | **THE RUN HARNESS — the run's execution model**: fan-out to evidence sub-sessions, resumption, budget; the CHECK mode is its first deployment (§2). | **(a)** a sub-session returns REPORTS, not documents (§14b.1), ENFORCED at its return contract — **NC: neuter the check and a document-returning sub-session must fail an assertion**; **(b)** the run **queries and never loads** the project; **(c)** it joins `#schedConsumers` per `SCHEDULER.md` as ONE appended entry — **no second alarm and no cron**; **(d)** it builds the `runtime-ceiling-reached` producer and exhausting a budget is RECORDED, never silent; **(e)** versions are written as formed, never batched; **(f)** the spawn contract carries no bias manifest (§14); **NC, the objective's own (owed control 7): feed a run an inquiry the evidence does not support and assert it proposes nothing — an empty-handed run emits §9's empty-level kind and no version** | IS-1, IS-6 |

**Cross-cutting, belonging to no single item and checked on all of them (§14b.4):** control
flow is deterministic and judgement is the model's; a gate is code and never a sentence in a
prompt; every refusal carries a C-number and a DEC-49 code; and **a sub-session that returns
documents rather than reports has defeated the architecture** — a review criterion, not a
preference.

**THE SEVEN OWED NEGATIVE CONTROLS (named 2026-08-07, from the sweep — the battery's
register is 105/105 declaring, MEASUREMENTS.md 2026-08-07, and undeclared suites would be
its first regression), each placed on its owner above:** (1) DEC-55.5's second half →
IS-5; (2) DEC-44's two-finding case → IS-8; (3) DEC-40's strip-the-filter-line → IS-7;
(4) DEC-34's page-without-header → IS-8; (5) DEC-46(a)'s carried-forward acknowledgement →
IS-8; (6) the pre-write checks, one refusal at a time → IS-4; (7) the objective's own
control → IS-9. Every IS item ships a `NEGATIVE CONTROL:` line; any new op carries a
control-plane assertion in the same turn.

**PRECONDITIONS ON THE WHOLE SET: D-222 AND D-164** (§14b.2) — the meaning layer must be
readable and, until D-164 lands, versions compose document-grain legs and say so. **D-84**
preconditions the bias half (§3). D-225's caps land before D-222's surface.

IS-1 is the spine. IS-6 is independent of everything, is the one unblocked start (it
discharges D-196 and makes §15's instruments computable), and IS-9 is what makes a run
survive contact with a real project.

## 19 · The final Claude Code comparison (2026-08-07)

**Session BOB, against the fourteen practices Claude Code actually integrates by.** Read
under DEC-52's final ruling: the machine may rule — constitutive acts machine-writable and
machine-attributed, the sidebar review, not a gate; the §4 version fence is untouched.

| # | Claude Code practice | verdict | where / what is missing |
| --- | --- | --- | --- |
| 1 | separate process, same interface as a person, no privileged hooks | **CONFORMS** | §14a — fleet member in the group's account; the plane grows no model runtime; DEC-55's endpoint surface |
| 2 | permission tiers; the gate is the HARNESS, never model self-restraint; denied = adjust, never retry verbatim | **GAP (partial)** | the gate half CONFORMS and is stronger (§4 — no accept op exists; §14b.4 — a fence is code; IS-2's three-layer NC). Missing: (a) §14a's `[BOB-4]` tier text is stale against DEC-52's final ruling (F9); (b) no denied-adjust rule — nothing tells the run what it must do after a plane refusal, so a verbatim-retry loop is caught only by the budget (F10) |
| 3 | context economy: sub-agents return conclusions, query-never-load, progressive disclosure | **CONFORMS** | §14b.1 — all three, verbatim; a document-returning sub-session fails IS-9(a)'s NC |
| 4 | versioned doctrine loaded every session; the run records which version | **CONFORMS** | §14a table; §11 — the run records the skill version it ran under |
| 5 | deterministic policy enforcement outside the model at lifecycle points, unskippable | **CONFORMS** | §14b.5 pre-write checks PLANE-side at the one endpoint; conduct enforced at the `capture_requests` drain (§4); the log written by code whether or not the run succeeds (IS-6) |
| 6 | tools small, orthogonal, typed; refusals as structured data | **CONFORMS** | §14c option D — composable vocabulary over per-question ops; every refusal a C-number with a DEC-49 code and canned translation (§14b.5) |
| 7 | verification loop: run it, READ it, never declare success unverified | **CONFORMS** | §14b.5 — the run verifies before proposing; a failing version is not proposed |
| 8 | resumable sessions; local transcripts; compaction without losing working state | **CONFORMS** | §14b.3/§14b.7 — `#schedConsumers`, resumed run reads its own log; transcripts device-local with TTL (DEC-61, §14a); the store is the memory, the description the durable summary |
| 9 | isolation: parallel workers, one session per tree, merge through one channel | **CONFORMS** | §14a fan-out — sub-sessions hold no write and no lens; one write path for both modes (§10) |
| 10 | background tasks notify on completion, never polled | **CONFORMS** | §14a — request → daemon → FINDING-slug notify → post-process; extend the subscriber, not a channel |
| 11 | plan mode: propose-before-act; the human approves the plan, not each keystroke | **CONFORMS** | approval sits at the launch (DEC-47 — the inquiry IS the authorisation) and at acceptance (§4); per-plan bulk URL approval was considered and REFUTED by ruling, and the accept gate is stronger than plan mode |
| 12 | machine work stamped as machine work, never the human's | **CONFORMS** | §4 — daemon-at-the-session's-request, both principals named (DEC-27(b), DEC-55.4); D-82's look-derived (§6.4); DEC-52's ruling itself carries machine attribution |
| 13 | escalation discipline: ask only the human's own; provisional over blocking; report failures faithfully | **CONFORMS** | §9's empty-level kind, §11's failure-path log, honest absences stated (§3, §14a); SWEEP §4b — four of seven resolved without blocking on Bob |
| 14 | cost/budget visibility: effort bounded, the bound visible | **GAP (partial)** | bounded and recorded CONFORMS (§14b.6; IS-9(d) — `runtime-ceiling-reached` gets its producer). Missing: the bound is visible only in the log after the fact — no member-facing budget at launch and no live spend on the running-session surface (F11) |

Twelve of fourteen conform, several by construction stronger than the practice they mirror
(no accept op beats a permission prompt). The two partials name three narrow gaps.
**F9** — §14a's `[BOB-4]` provisional is superseded by DEC-52's decided entry; rewrite the
paragraph to the register (machine may rule; sidebar review, not gate; version fence
unchanged). **F10** — the design specifies how the plane refuses, never how the run must
respond: IS-9 needs the denied-means-adjust rule as a deterministic-table row, and IS-4's
refusal should make a verbatim resubmit a structural no-op rather than churn. **F11** —
§14b.6's budget is recorded, never shown: the running-session surface (UI-38's absorbed
scope) should carry the budget and its live consumption, since which account pays is
already named on the record. Nothing found contradicts a standing ruling; no N-A rows.
