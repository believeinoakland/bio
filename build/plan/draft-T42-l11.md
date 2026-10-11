# T42 L11 — shares owed before L11's START (draft for BOB)

Read on `tranche/T42` @ 69ddcd9da5. Sources: `build/plan/current.md`:113–121; `build/extraction/case-account-split.md` §5 (:222–241) and §7 (:290–294); `build/extraction/capture-split.md` §5 (:227–248); the nine requirement files; `draft-T42-transcribe.md` §6–§8; rulings K2609, K2613, K2627, K2630, K2635, K2651.

**What is already there.** The transcribe text is in the files, marked: op-grades R31 (`op-grades.md`:134), op-declarations R47 (`op-declarations.md`:190), control-plane R74 (`control-plane.md`:138), plane R36 (`plane.md`:107). Each is marked `*(not yet met: T42)*`, and each uses `pagetranscribe` (K2613). **Nothing from the case-account map or the capture/doorbell map is written yet in any L11 file.** Only `case-account.md`:91 and `doorbell.md`:198 name these users, from the provider's side.

Next free ids: op-declarations **R48**, op-grades **R32**, affordances **R51**, control-plane **R75**, plane **R37**, store-door **R14**, answer-envelope **R11**.

## T42-25a · op-grades

1. **Has a marked line:** R31 (`pagetranscribe`, :134). **Owes no requirement line for the account ops.** R30 (:131) grades `accountpropose` without naming its owner.
2. **Owed (wording only):**
   - **Status line (:3).** Before: "`R31 new, `transcribe`'s grade`". After: "`R31 new, `pagetranscribe`'s grade (K2613)`".
   - **R1 (:18), the `inboxresolve` parenthesis.** Before: "`capture` R65 … requires a reason, `capture` R32". After: "`doorbell` R13 (was `capture` R65) … requires a reason, `doorbell` R3 (was `capture` R32)". Capture's R32 and R65 are retired (K2609).
   - **Code wording, no id.** `src/op-grades/t41.mjs`:101 names "case-authoring R64" and :241 has `accountpropose`'s words. These become "case-account R1, R2". The map (`case-account-split.md`:228) says "its next job (no T42 job)", but T42-25a is that job. See doubt 5.
3. **Edges:** none. `uses` is `[]` (`modules.json`:134).

## T42-25b · affordances

1. **No marked line, and none is needed for the re-pin.** It is a tests-only entry, like T42-23b. The test that moves is `test/m/affordances/catalogue.test.mjs`:517–539: its `LATER` list must gain `"pagetranscribe"`, with a comment "op-grades R31 (T42)". Without it, `pagetranscribe` (ground `undetermined`) lands outside `R27_LEFT` and both `deepEqual` checks at :536 and :538 fail.
2. **Owed:**
   - **Optional status line (:3).** "Last changed T42 (T42-25b: tests only, the `undetermined` count re-pinned for `op-grades` R31's `pagetranscribe`; N832; K2611, K2613); no requirement changed."
   - **Conditional (doubt 2).** If backing is re-pointed, the Uses line (:125) becomes: "`sources`, `capture` and (T42; N826) `doorbell`: their op maps … and the backing of each rung (R19; `inboxresolve`'s by `doorbell` R3)".
3. **Edges:** `affordances → doorbell` is **absent** (`modules.json`:135). It is needed only if `backing.test.mjs`:490–493 is re-pointed: that test drives `inboxresolve` through `capFix`'s `f.c.knock` and `f.c.inboxResolve`, which is capture's copy. `affordances → extraction` is not needed.

## T42-26 · op-declarations

1. **Has a marked line:** R47 (:190). **Owed:** the account ops' owner, and two stale `transcribe` mentions.
2. **Owed wording:**
   - **New R48.**
     > **R48** (T42; N839; `case-account` R1, R3; K2608) `accountpropose` and `accountdrafts` sit in a family of `case-account`'s own (`owner: "case-account"`, cite `case-account R1, R3; R43; K2569, K2608`), in place of `case-authoring`'s. Their specs, session sets, `NEEDS` rows and stamps are R43's, unchanged: `accountpropose` is a member session's act, with `by` handed as `proposedBy`; `accountdrafts` is a session's read, with `viewer` stamped. No family names `case-authoring` for them. R6 holds over them: their handler is `control-plane`'s own map (its R71). *(not yet met: T42)*

     This re-points the code at `src/op-declarations/index.mjs`:526–530 and the test at `test/m/op-declarations/t41.test.mjs`:119 (`ACT`/`READ("case-account")`), following the map at `case-account-split.md`:227 and :240.
   - **R47 (:190), amended.** Before: "R6 holds over it: its handler is `extraction`'s map." After: "R6 holds over it: its handler is `extraction`'s exported `pageTranscribeOp`, which `EXTRACTION_OPS` does not list (K2635), reached as `control-plane` R74 states." See also doubt 1 on its body fields.
   - **Uses (:209).** "`extraction`: `transcribe` (its R71)" becomes "`extraction`: `pagetranscribe` (its R71, `pageTranscribeOp`; K2613, K2635)".
   - **Uses (:210).** Drop `case-authoring` from the owners of R43's ops and add: "(T42; N839) `case-account`: `accountpropose`, `accountdrafts` (its R1, R3; R48), a new `modules.json` edge, BOB's."
   - **Optional, doorbell.** Its ops (`knock`, `inbox*`, `doorbelltally`, `knocksof`, `pulledknocks`) are declared in the shared tables and in `CAPTURE_MEMBER_ACTIONS` and `CAPTURE_READS` (`index.mjs`:944, 963, 1380, 1665, 1670), not in an owner family. So no family moves (`capture-split.md`:235, "wording only"). The requirement text that names retired ids: R6 (:214) "`capture`'s `doorbellrefused` (… `capture` R80…)" becomes "`doorbell`'s … (`doorbell` R19)"; R9 (:38) "`doorbelltally` (its R80)" becomes "(`doorbell` R19)".
3. **Edges:** `op-declarations → case-account` is **absent** (`modules.json`:144). `op-declarations → extraction` is **absent**; K2613 has the job add it before merge.

## T42-27 · answer-envelope

1. **No marked line for N843.** R10 (:115) still says the two codes "stay red … until N843 re-codes hypotheses' rows".
2. **Owed wording: new R11.**
   > **R11** (T42; N843; K238, K2566, K2651; R7, R10) Since `hypotheses` R22, `steps` R28 and `investigation` R12, R23 re-code their rows in place, with each number and translation kept, every code decorates with its own family's row. `PROPOSAL_NO_RUN` (C-124.47) and `NO_SUCH_PROPOSAL` (C-111.22) read R7's pinned rows again, and R10's last sentence is struck. The snapshot's `changed.note` (`rows-before-r43.json`) replaces its sentence naming them red with one naming N843's re-codings: C-134.22 `HYPOTHESIS_PROPOSAL_NO_RUN`, C-134.23 `NO_SUCH_HYPOTHESIS_PROPOSAL`, C-142.28 `NO_SUCH_STEP_PROPOSAL`, C-146.21 `NO_SUCH_PLANNING_PROPOSAL`, C-146.26 `INTERVIEW_NOT_A_LEG`. Of R10's rows that an earlier family holds, C-142.28, C-146.21 and C-146.26 leave, now decorating with their own rows; C-142.3 and C-146.10 stay. The re-keyed rows are stamped in T43 (plan rule 4 (2)). Clears rule 4 (6). *(not yet met: T42)*

   The test lines behind it: `families.test.mjs`:420–423 (`HELD_EARLIER` loses three rows) and `catalogue-end.test.mjs`'s two pins.
   - **Doorbell:** nothing in T42. K2609 keeps the nine rows in capture's `checks.mjs`, and `families.mjs`:33/153 is unchanged. The family file is T43's.
3. **Edges:** none in T42. `answer-envelope → doorbell` is absent (`modules.json`:146) and is T43's.

## T42-28 · store-door

1. **No marked line.** R7 (:30) still says "capture's `pullKnock` (capture R65) … capture R32's resolve … capture's row, C-118.7".
2. **Owed wording: R7 amended.** Its three capture phrases become:
   - "through `doorbell`'s `pullKnock` (`doorbell` R13; was capture R65)";
   - "that pull reached as `doorbell` R3's resolve (`inboxResolve`)";
   - "`RESOLVE_NO_REASON` (C-118.7, `doorbell` R21's row, defined in `capture`'s table until T43, K2609)".

   It also gains a closing sentence: "(T42; N826) The internal route `inboxpullfile` hands `pullAndFile` `doorbellOf(ctx)` as `deps.doorbell`, never `captureOf`. *(not yet met: T42)*" (`dispatch.mjs`:11, :444; `pull.mjs`:99–107.)

   **Uses (:42)** changes "`capture` (`pullKnock`, R7)" to "`doorbell` (`pullKnock`, `inboxResolve`; its R13, R3; R7), a new edge (T42; N826)".
3. **Edges:** `store-door → doorbell` is **absent** (`modules.json`:147). Keep `capture` (doubt 4).

## T42-29 · control-plane

1. **Has a marked line:** R74 (:138). **Owed:** N839, N826 and the CAPTURE #26 J2 finding (current.md:119), plus R74's routing (doubt 1).
2. **Owed wording:**
   - **R71 (:133).** "`accountpropose`, `accountdrafts` (`case-authoring`)" becomes "`accountpropose`, `accountdrafts` (`case-account`, its R1, R3; reached through `of.caseAccount()`, never `case-authoring`'s pass-through; T42, N839) *(not yet met: T42)*". This re-points `owner-ops.mjs`:7, :36–38 and its stub in `owner-ops.test.mjs`:118, :133.
   - **R72 (:134).** Before: "calls `capture.uploadCapture({bytes, statement, name, within, by})`". After: "calls `capture.uploadCapture({bytes, statement, name, by})`. It passes no `within`: capture R86's `within` is a synchronous function an in-process caller hands, never a request's field, and a `within` in the address reaches nothing (T42; CAPTURE #26 J2, K2631). *(not yet met: T42)*" This removes `owner-ops.mjs`:53.
   - **R36 (:76).** "through capture's `pullKnock`, capture R65" becomes "through `doorbell`'s `pullKnock`, `doorbell` R13". "as capture R32's resolve" becomes "as `doorbell` R3's resolve". Wording only (`capture-split.md`:234).
   - **R58 (:110).** "`knock` and `knockAttempt` … (`capture` R85)" becomes "(`doorbell` R20)". Wording only.
   - **R74 (:138), amended (doubt 1).** "through `extraction`'s own map (R26's pattern, as `pdfstructure`)" becomes "to `extraction`'s exported `pageTranscribeOp` (not in `EXTRACTION_OPS`, K2635), reached as `pdfstructure`'s `extractionOp` is, through the gated hook `plane` composes (`plane` R6)".
   - **Status (:3)** changes "`transcribe` routed" to "`pagetranscribe` routed". **Uses (:163)** changes "`capture`: `CAPTURE_CHECKS`…; `pullKnock` (its R65), for R36" to "`doorbell`: `pullKnock` (its R13), for R36, through `store-door` R7"; no `src/control-plane` file imports capture today. **Uses (:180)** changes "its map's `transcribe` arm" to "`pageTranscribeOp` (its R71)". Uses gains: "(T42; N839) `case-account`: `accountPropose`, `accountDrafts` (its R1, R3; R71), a new edge."
   - **Tests to re-point** (map `capture-split.md`:247): `doorbell.test.mjs`:14, 307, 334, 404, 445, 469, 473 and `inbox-door.test.mjs`:11–12, 21, 101 import `captureOf`, `PULL_WITHIN_FAILED_DETAIL`, `REASON_MAX`, `CAPTURE_CHECKS` from capture. They move to `doorbell`'s exports (`doorbell/index.mjs`:54, 82, 100) with `deps.doorbell`, after store-door's R7.
3. **Edges:** `control-plane → case-account` is **absent** (`modules.json`:148); `control-plane → doorbell` is **absent** and needed by the tests above.

## T42-30 · plane

1. **Has a marked line:** R36 (:107). **Owed:** the doorbell composition and the case-account composition.
2. **Owed wording:**
   - **New R37.**
     > **R37** (T42; N826; K2607 rule 3, K2629, K2630; `doorbell` R25) The composition root composes `doorbell` at its place in R2's order, directly after `capture` (`store.mjs`:329): `doorbellOf(ctx)`, its `env` read from capture's instance (`doorbell` R25). R3's pass runs its `migrate()` directly after `capture`'s (:470), so capture's declaration is first and doorbell's is held. `doorbellOps(doorbellOf(ctx), url, body)` is spread into R5's route map directly after `captureOps` (:583). The Worker's public door answers `knock` through `doorbell`'s `doorbellPublicOp` (`door.mjs`:16, :43), never `capture`'s `capturePublicOp`, so no plane path reaches capture's doorbell copy (deleted T43, N849). This module's tests carry `capture`'s `plane.test.mjs`:66–75 (`op=knock` at the whole plane's door, with no token: 200, 405 on GET, `KNOCK_EMPTY` C-85.5), re-pointed (K2630, K2634). The comments at :304, :425 and :525 saying file-safety is "directly after capture" are re-worded (map doubt 6). *(not yet met: T42)*
   - **New R38.**
     > **R38** (T42; N839; K2608; `case-account` R12) The composition root builds `case-account` (`caseAccountOf(ctx, {runs: aiRunsOf(ctx, env)})`) after `case-disclosures` and before any module that reaches it: before `reviewOf` (`store.mjs`:307), which registers its comments through `case-authoring`'s pass-through, and so before `caseAuthoringOf` (:313). One instance per host serves `case-authoring`, `review` and the door. *(not yet met: T42)*
   - **R35 (:101), amended.** In the getters `of`, "`caseAuthoring`" becomes "`caseAccount` (`caseAccountOf(ctx)`; T42, N839, `control-plane` R71)" (`store.mjs`:677).
   - **Doubt 1:** a sentence on `gatedOp` answering `pagetranscribe` through `pageTranscribeOp` in `door.mjs`, beside :79.
   - **Uses (:55)** gains: "(T42; N826, N839) `doorbell` (`doorbellOf`, `doorbellOps`, `doorbellPublicOp`; R37) and `case-account` (`caseAccountOf`; R38), new edges."
3. **Edges:** `plane → doorbell`, `plane → case-account`, `plane → pdf-pixels` and `plane → run-rules` are each **absent** (`modules.json`:149). The last two are added by the job (K2613).

## Doubts (best readings)

1. **R74 and R47 describe a route that the merged code does not take.** `pageTranscribeOp(url, env, store, hooks)` (`extraction/ops.mjs`:73–85) is a **Worker-side** handler, like `extractionOp`. `pdfstructure` is answered in `plane/door.mjs`:79 (the `gatedOp` hook, plane R6), not through control-plane's map or the store's route map. The handler also reads **`sha256` and `project` from the address**, while R47 and R74 say "`captureSha` and `project` body fields, read from the body only".
   - **Reading:** re-word R47 and R74 to the merged interface (K2637): `sha256` and optional `project` from the address, as `pdfstructure`'s `sha256`. Neither value is a secret.
   - The door arm is plane's (`door.mjs`): plane R36 gains a sentence, and control-plane R74 states only admission and stamps.
   - The alternative is to re-open EXTRACTION for body fields, which changes a merged module for no protective gain.
2. **Capture's T43 delete has two users that rule 3 (1) does not name.** Rule 3 (1) (current.md:23) lists sources, actions, answer-envelope, store-door and plane. But `affordances/backing.test.mjs`:490–493 and control-plane's `doorbell.test.mjs` and `inbox-door.test.mjs` also call capture's copy.
   - **Reading:** control-plane's tests re-point in T42-29 (the map's §5 test table).
   - Affordances' backing arm re-points in T42-25b, with the edge, so T43's delete is clean.
   - Alternatively, name it in N849.
3. **The R44 gap.** `op-declarations` has no R44 (R43 is followed by R45). **Reading:** never assigned; use R48, never R44.
4. **Store-door's capture edge.** After the re-point, `dispatch.mjs` no longer imports capture, but `pull.test.mjs`:13–14 reads `CAPTURE_CHECKS` (C-118.7 is still defined there, K2609). **Reading:** keep `capture` in `uses` (K2628's pattern); the tests may read the row through doorbell's re-export.
5. **op-grades' words in `t41.mjs`.** "case-authoring R64" is in data strings, not comments. The map defers this to "next job". **Reading:** do it in T42-25a as wording (no grade moves). If a pinned digest covers those strings, defer to T43.
6. **Where case-account is built.** The map (:226) says "directly before `caseAuthoringOf`". But `reviewOf` (:307) reaches case-authoring first, and case-authoring's eager `caseAccountOf(host)` would create the instance without `runs`. **Reading:** this is harmless, since `runs` is reached lazily on the host (`aiRunsOf(host)`, already built at :226). R38 still says "before `reviewOf`" so that the plane's deps are the ones held.
7. **The K2609 citation in T42-27.** current.md:117 cites "N849; K2609", while K2609 names the physical move "N851 with N849". **Reading:** cite both.
