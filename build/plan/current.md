# Plan T41

**Status** · OPEN · BOB #146 · session_017Mqb4UstLxePtEby56C1kS · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #12 session_0196Hjq7pbtNLCRCp3UtdPBW; text-chain: TEXT-CHAIN #7 session_01JDz9kGpTxawc3vKv6rH4vU

**At T41's opening (K2422, K2423):** opened from `main` @ 8af83ac942 after T40's early close; Bob's meter 79%. Runs layer 1, then holds until Bob resumes.

**At T41's opening (K2422):** T40 closed early on Bob's direction (L1–L2 merged; L4–L11 moved here, not started). PR #19 (DEC-188, MERGE U144) is on `main`. `tranche/T41` from `main` @ `8af83ac942`. Drafted by a worker for BOB at the opening, to be reviewed by BOB before it becomes `current.md`.

**Sources** · `archive/T40.md` (entries, rules, "Left out", doubts, Outcome); `archive/T39.md` and `archive/T38.md` "Left out" rows, each re-tested (Bob's direction relayed by BOB, 2026-10-09: "Make certain that all development tasks that can be done safely are included in T41"); `next.md` N748, N751, N780, N794, N796, N815, N817, N820–N823; `plan/draft-T41-investigation.md` (adopted K2405, refolded K2417/K2418; the requirement text for N820–N822); UX-DESIGN U145 (DEC-188's owed line); rulings K2404–K2422, K657, K1043, K624, K617, K1821; `layers.md`; `modules.json`; `rulings-active.md`. Sizes over `modules.json` paths, the most specific path owning each file (K1821), on `tranche/T41` today.

## Legacy census (§5.2 (2))

| legacy module | in T41 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849: it stays until the new interface replaces it; a dependency not yet built: the new member screens and their shell (N672, N559). N794 (its red) left out for the same reason. |

It is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order** within a layer is `modules.json` order unless the layer says otherwise; a provider merges before its users; promotion's stamp merges last in its layer (K425, K1680). Requirement text is applied to each module's file before its layer's START (K2343's pattern): `draft-T41-investigation.md` §3 for N820–N822 (every id `*(not yet met: T41)*`); T40's unstarted entries already carry their text (K2394, K2400; marks read T41); DEC-188's owed work, N821's placed items and N823's split are BOB's wording, written before the layer's START that carries them.
2. **The opening's acts (K657, K1043, K2405, K2418; one act):**
   - `modules.json` gains, with empty `paths` and `tests` (K1043) and `uses` as `draft-T41-investigation.md` §2.1: `steps` (layer 6, directly after `hypotheses`), `reading-guides` (layer 6, directly after `capture-requests`), `question-explorer` (layer 6, directly after `skills`), `investigation` (layer 7, directly after `intent`); and N823's `publish-schedule` (layer 8, directly after `publication`; uses `record-grammar`, `civil-time`, `jurisdictions`, `record-core`, `membership`, `publication`; see T41-37). The users' edges of §3.6's edge list are added with each user's job (each job's final `uses` recorded before its merge).
   - `layers.md`: rows 6, 7 and 8 list them; a section each for the four new modules (from §2.1) and for N823's split (from T41-37).
   - membership R83's `MODULE_ORDER` names the five (its entry is T41-3).
   - `requirements/<module>.md` for the four new modules written from §3.1–§3.4; `publish-schedule`'s written by BOB from the extraction map before L8's START.
3. **The hold (K2422):** L1 runs, merges and closes (§5.6); then no layer or job starts until Bob resumes. The plan covers the whole tranche so the resume opens L2 at once.
4. **Accepted reds at the opening** (from T40's Outcome, re-confirmed at the opening against `node checks/run.mjs`):
   1. coverage: every id marked `*(not yet met: T41)*` until its module's merge (T40's carried marks and §3's);
   2. row census: rows T41's L1–L2 jobs add stay `awaiting stamp` until T41-6 (promotion); rows T41's L3+ jobs add, until T42's stamp;
   3. the UI's DEC-88 tests (Bob's), carried;
   4. legacy-ui `statement-ack.test.mjs` (N794, K633);
   5. membership R83's `MODULE_ORDER` tests from the opening's insertion of the five modules until T41-3's merge;
   6. answers `standing.test.mjs`:122 and :273 (K2412) until T41-29;
   7. op-declarations `t33.test.mjs` R19 (K2413) and `t35.test.mjs`:196 (K2412) until T41-58;
   8. reading-pipeline `convert-chain.test.mjs`:297 and `pieces.test.mjs`:218 (K2399) until T41-9;
   9. filings `outward.test.mjs`:136 (R25; K2387) until T41-48;
   10. the L11 users of the retired ceiling codes (`AI_USE_CEILING_REACHED`, `AI_USE_COPY_CEILING_REACHED`: wizard-scripts, instance-setup, store-door, op-declarations' `aiceilingset`, control-plane, plane) from T41-21/T41-23's merges until their L11 jobs, named exactly at L6's close;
   11. (N822) the users' tests that assume an administrator's `FULL` sight of a hidden project, from T41-3's merge until each user's job (named exactly at L2's close from the suites membership runs, P11; the likely files are `draft-T41-investigation.md` §3.5's list);
   12. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close.

## Entries

### L1 (runs; then the hold)
- **T41-1 · record-grammar** · (N820; D3, D32, D8) R51 `ID_TABLE` gains `STP` (owner `steps`, `opaque`), `isStepId`; R52 `ACCEPTANCE_FORMS` frozen and `acceptanceRecord`, `ACCEPT_MUST_REAUTHOR`; R53 `GUD` (owner `reading-guides`), `isGuideId` · K2405, K2418 · req: `draft-T41-investigation.md` §3.6 · 2,418 → ~2,450.
- **T41-2 · text-chain** · (N820; D21) R104 step kind `ai_transcription`, its derivation cap undetermined until measured, so `captureBound` answers undetermined for its text · K2418 · req: §3.6 · 2,032 → ~2,050. (Its cap is a constant here; no edge to `calibration`.)

No merge order (independent). **L1 holds exactly these two jobs.**

### L2
- **T41-2a · record-core** · (RECORD-GRAMMAR #12 J2, K2431) R62's `mintExhausted` gains its sentence for `STP` and `GUD` (record-grammar R51, R53); `t33.test.mjs`:68 (R76) and :161 (R62) re-pinned · red accepted by name until this merge · req: R62, BOB's wording (one sentence per new kind, as the others).
- **T41-3 · membership** · (N822; D54 B) R13 terms (two forms of `EXISTENCE`), R43, R44, R60, R77 (C-70.1's owners for that case), R88, R18, R120 with its index migration, as §3.5; acts that must reach a hidden project without its contents (project-roster R5; DEC-113's hold reads) stay reachable at `EXISTENCE`; (K657) R83's `MODULE_ORDER` names `steps`, `reading-guides`, `question-explorer`, `investigation`, `publish-schedule`; (DEC-188 (7)) the handle refusals read by key: `handle.refused.unchecked` (HANDLE_CHANGE_UNCHECKED, re-worded), `handle.refused.paused`, `handle.refused.notmember` · K2408, K2409, U145 · req: §3.5; R83 and the keys BOB's wording · runs every user's suite (P11) and reports the reds that name rule 4 (11) · **P6:** 3,621 + ~40.
- **T41-4 · project-roster** · (N822) R5's rescue reachable at `EXISTENCE` of a hidden project; tests `visibility-directory`, `requests`, `figures-purge` re-stated for an administrator neither invited nor joined · K2408 · req: §3.5 (R5 re-read; BOB's wording if it changes) · after T41-3.
- **T41-5 · credentials** · (N820; D2, D19, D21, D56) R55 `USE_KINDS` gains `enquire`, `read`, `transcribe`, `account`, each switched and bound by material limits; (DEC-188 (8)) `accountSwitchSet` (R25) and `groupswitchset` (R37) retire to `accountusesset` (R55's switches), with pointers; (DEC-188 owed: the panel's reads, change history) a read answering each account's uses and keep-aways to its owners, and each account's change history (key set, switched, removed, uses, keep-aways) with who and when, to its owners only; (DEC-188 (7)) its refusals read by key: `ai.refused.off`, `.projectkeptaway`, `.notsole`, `.noticedue` (with `ai.disclosure.projectkey`), `.switchvalue`, `.signinnotconnected` · K2418, U145 · req: §3.6 (R55); DEC-188's share BOB's wording before L2's START · 2,834 + T40's ~420 → ~3,350. (N796, Bob K2425) a sign-in's `standing` switch works (R55, off by default, the member's own act), R32's sign-in refusal lifted; answers' and agent-worker's standing path and `question-explorer` R3 admit a sign-in principal whose `standing`/`explore` switch is on.
- **T41-6 · promotion** · stamps T41's L1–L2 rows (membership's, credentials', their re-worded rows) · K1680 · req: the rows' behaviour, BOB's wording.

**L2 merge order:** membership, project-roster, credentials, promotion last.

### L3
- **T41-7a · provenance** · (T41-8a's provider; K2434) R63 new: route `upload` (`UPLOAD_VIA`) graded as the doorbell's received material, not fetched, R42's `origin.kind` `upload` with `origin_statement` · req: R63 · merges before T41-8.
- **T41-7 · capture-sources** · (N822) R58 amended (BOB's wording, K2434): an administrator sees a `project` credential only at `FULL` sight of its project; tests assuming an administrator's `FULL` sight re-stated · req: R58.
- **T41-8 · capture** · (N822) `held` tests re-stated (an administrator not added sees a hidden project at `EXISTENCE`) · tests only unless R-text names administrators' sight.
- **T41-8a · capture** · (N821 upload; Bob D42 "upload: A", K2425) a member uploads a file she holds: graded received from the member (as the doorbell's material, never fetched, K509 (3)), attributed to her, with her statement of where it came from; stored and profiled as any capture; a later public fetch of the same bytes strengthens it · req: capture R86 (K2434; names `uploadCapture`, `via: "upload"`, address `upload:<sha256>`, method `uploaded`, `UPLOAD_NO_STATEMENT`) · uses provenance R63 (T41-7a) · L11 shares: op-declarations (the op), control-plane (route), affordances (help), store-door if the size path needs it.

**L3 merge order:** provenance, capture-sources, capture (`modules.json` order; provenance provides R63 to capture).

### L4
- **T41-9 · reading-pipeline** · (was T40-4a; K2399) re-measure `convert-chain.test.mjs`:297 and `pieces.test.mjs`:218; (N820; D21) R29: a transcription tier above tier 3 at a member's act on the paying account (`use: "transcribe"`), appended as `ai_transcription` (text-chain R104), never under a "no AI" limit · req: §3.6 · 1,452 → ~1,550.
- **T41-10 · extraction** · (N820; D4) R42 amended: a verified quote earns the capture's own ceiling; numbers and dates named for the member to check · req: §3.6.

### L5
- **T41-10b · progressions** (tests only) · (K2431) `define.test.mjs`:199 pins `SHARED_ACT_CHECKS`' keys as two; record-grammar R52 adds C-33.54 (`ACCEPT_MUST_REAUTHOR`): re-pin · red accepted by name until this merge.
- **T41-10a · query-language** (tests only) · (TEXT-CHAIN #7 J1, K2427) `grammar.test.mjs`:210 pins `MACHINE_READ_KINDS` as `["ocr", "ai"]`; text-chain R91 now adds `ai_transcription`: re-pin from the export · red accepted by name until this merge.
- **T41-11 · observation-log** · (N820; H39) R1, R13 gain authority kind `step`; R37 `onLookAnswered` · req: §3.6 · 3,235 → ~3,280.
- **T41-12 · bias** · (N820; D59) R49 `statementInForce` · req: §3.6.

### L6
- **T41-13 · inquiry-grammar** · (D59) R18 `bias_applied` on a leg · req: §3.6.
- **T41-14 · leg-earning** · (D36, D29, H38, D64, D21) R13 `projectsDrawingOnPaged`, R14 `projectsShownOn`, R15 the AI transcription's ceiling · req: §3.6.
- **T41-15 · inquiry** · (was T40-5; N814) R39 re-written (each project's own deferral and dismissal; K2371) and (N820; H38) R39 amended (names only non-hidden drawing projects; a question drawn on only by hidden projects moved on its own state); R55 amended (D17), R59 (D13 warning), R60 (`projects` on every read); (DEC-188 (7)) `question.refused.drawnon` by key · K2371, K2418 · req: R39 as applied (K2400) with §3.6's amendment folded by BOB before L6's START (see doubt 3) · 3,294 → ~3,420.
- **T41-16 · hypotheses** · (D33, D46 A, D18) R16–R21, R14 amended · req: §3.6 · 810 → ~1,080.
- **T41-17 · steps (new)** · (N820; D27–D50, H38, H39, D64) R1–R27 · req: §3.1 · ~2,150; if it grows past ~2,500, the cost relay, follows and later-found move to a module directly after it (BOB's, at the job's report).
- **T41-18 · citation** · (N822) `cite-refusals` tests re-stated · tests only.
- **T41-19 · basis-versions** · (D59) R48 `bias_applied` on a conclusion; (N822) `project-discoverable`, `t20-figures` re-stated · req: §3.6 · 3,594 → ~3,640.
- **T41-20 · contradiction** · (D64) R50, R55 amended · req: §3.6 · 3,681 → ~3,730.
- **T41-21 · run-rules** · (was T40-6; N812) R20: the ceiling codes retired, `AI_NO_ACCOUNT`'s translation; (N820) R19 (the test bar), R20 (D12), R23 `RUN_ORIGINS`, R24 mode `enquire`, R25 draft kinds, R26 `pages` · K2373, K2418 · req: T40's applied text and §3.6 · 2,051 → ~2,180.
- **T41-22 · ai-use** · (was T40-7; N812) R1–R9 by copy of `ai-runs/index.mjs`:2591–2940 (K624); (N820; D12) R10 `estimate`, R11 `actualOf`, R4 and R9 amended; (DEC-188 owed: the panel's reads, change history) a read of each account's limits table (`op=ailimits`, declared by op-declarations R41 with no requirement behind it) with each limit's history (who and when), to the account's owners only; (DEC-188 (7)) its refusals and the Ask item read by key: `ai.refused.limit`, `.limit.overall`, `.limit.member` (`{whose}` from `ai.whose.group|project|own`), `ai.refused.limitinvalid`, `.unitunavailable`, `.explorenotenabled` · K2373, K2350, U145 · req: T40's applied text, §3.6; DEC-188's share BOB's wording before L6's START · ~900 → ~1,100.
- **T41-23 · ai-runs** · (was T40-8) R48–R51 retired, its copy deleted and re-pointed, R52 amended; (N820) R73–R76; (N822) `hidden-notices` re-stated · after T41-22 · 3,295 → ~3,000 → ~3,300.
- **T41-24 · run-productions** · (D2, D3, D4, D22) R21–R24 · req: §3.6 · 1,358 → ~1,600.
- **T41-25 · capture-requests** · (N820) R55 (`step` on a request; arrival source) · req: §3.6.
- **T41-26 · reading-guides (new)** · (D8, D24, D65) R1–R12 · req: §3.4 · ~900.
- **T41-27 · skills** · (D1, D2, D8, D13, D19, D20, D24, D56, D65) R40–R44 · req: §3.6 · after T41-26 · 2,514 → ~2,750. R43 finds its clauses in `BIO_Investigation_v0_1.md` (placed, K2420).
- **T41-28 · question-explorer (new)** · (N815, N820; D33, D36, D39, D11–D14, D66) R1–R14 · req: §3.2 · after T41-17, T41-22, T41-23 · ~1,450. Built and tested; offered to no member until R7's gate (D11's bar) opens.
- **T41-29 · answers** · (was T40-9; N812; K2412) R30, `accountFor`, `useCheck`, R2's kept-away rows, R19; the reds of rule 4 (6); (N820; D20, D56) R31 `baseline`, R32 verdict and cause words, R33 `checkSentences` · req: T40's applied text and §3.6 · 1,584 → ~1,750.
- **T41-30 · agent-model** · (was T40-10) Purpose, R11, R13 `MODEL_PRICES`, `estimated_cost_usd` · K2373.
- **T41-31 · agent-worker** · (was T40-11) R71 `level` `project` · K2373 · **P6:** 7,510 (over ~4,000; untouched apart from this small change, as T40 planned; its split is not this tranche's, see "Left out").

**L6 merge order:** inquiry-grammar, leg-earning, inquiry, hypotheses, steps, citation, basis-versions, contradiction; run-rules, ai-use, ai-runs (copy then delete), run-productions, capture-requests, reading-guides, skills, question-explorer; answers, agent-model, agent-worker. (`modules.json` order; ai-use before ai-runs is K624's copy-then-delete.)

### L7
- **T41-32 · intent** · (D13, H30 (1)) R32 warning, R33 "answered: none exists" · req: §3.6.
- **T41-33 · investigation (new)** · (D1, D15, D16, D19, D20, D27, D30, D48, H27, H28) R1–R22 · req: §3.3 · after T41-32 · ~1,900.

### L8
- **T41-34 · case-grammar** · (was T40-16a; DEC-185) R12's `obscured_marked`, R14; (D56, D59, D60, D61) R23–R26, R13 and R14 amended · req: T40's applied text, §3.6 · 2,353 → ~2,550.
- **T41-35 · case-carriage** · (was T40-12; N818, N816, N798, N811) as T40-12; (N822) `marks` re-stated · req: applied (K2400).
- **T41-36 · publication** · (was T40-13; N811, N799) as T40-13 (R76 `publishedWorkOf` among them); (N823) deletes its copy of the scheduled-publishing seam after T41-37 merges and reaches it through a registration T41-37 fills (K31's pattern; R21's waiting clause); (N822) `convert-casesign`, `t34` re-stated; (DEC-188 (7)) `document.refused.changed` (C-122.7) by key · req: applied; the split's text BOB's from the extraction map · **P6:** 3,835 (K1821) + ~60 − ~500 → ~3,400.
- **T41-37 · publish-schedule (new; N823)** · built by copy (K624) of publication's publishing at a set time: R66–R71, R74 (`schedule.mjs`, 312; `scheduled_editions` and its schema share; `registerScheduledPublisher`, `onPublishScheduled`, the waiting-edition read), each retired in publication as "moved to publish-schedule R<n>"; it calls publication R22's commit · K624, K617, K2418 · req: BOB's split plan, with the extraction map `build/extraction/publication-split-3.md` written before L8's START (P18) · ~500. **Merges before T41-36** (it uses only what publication already provides).
- **T41-38 · public-read** · (was T40-14; N798, N811) labels by key.
- **T41-39 · ratification** · (was T40-15; N811) R42's stop after signing; (N823) re-points `op=publishat` and R42's publisher to publish-schedule; (D60) R49 `APPROVAL_MISSING`, R50 `registerApprovalReader` · req: applied, §3.6 · after T41-36, T41-37 · 3,552 → ~3,640.
- **T41-40 · case-checker** · (was T40-16b; N798) `/3` specification; (D56, D59) R23 lens, R24 the account's code arms; the edge to `strength` · req: §3.6 · 1,468 → ~1,650.
- **T41-41 · case-import** · (D59, D62) R22 whole-case acceptance, R23 the importer's lens · after T41-40.
- **T41-42 · case-disclosures** · (was T40-16; N798, N811) as T40-16; (D56–D59, D63) R30 `accountJudged`, R31, R22 amended; (DEC-188 (7)) `document.cleaned.label`, `document.refused.clean`, `.pending` (C-120.20–.22) by key; edges to `answers`, `bias` · req: applied, §3.6 · after T41-35, T41-41 · 2,098 → ~2,400.
- **T41-43 · case-authoring** · (D56, D57, D60, D61) R63–R68; (N823) R58 re-pointed to publish-schedule's waiting read; (N822) `fences`, `statement` re-stated · req: §3.6 · after T41-42 · **P6:** 3,473 → ~3,700: the job measures at its START and reports before building if it would pass ~4,000 (the account's R63–R68 then move to a module after it, BOB's).
- **T41-44 · review** · (N822) R9 drops "or an active administrator" for a hidden project's drafts; (D60, D61) R30–R33 · req: §3.5, §3.6 · 1,028 → ~1,250.

**L8 merge order:** case-grammar, case-carriage, publish-schedule, publication, public-read, ratification, case-checker, case-import, case-disclosures, case-authoring, review.

### L9
- **T41-45 · conformance** · (D55) Purpose re-worded; (N822) `determine`, `reads` re-stated.
- **T41-46 · consequences** · (N822) `record` tests re-stated · tests only.
- **T41-47 · actions** · (N822) R52–R60: the hold reads and notices answered at `EXISTENCE` of a hidden project with what each already names, never contents; `t34` re-stated · req: §3.5, BOB's wording.
- **T41-48 · filings** (tests only) · (was T40-9a; N819) `outward.test.mjs`:136's fixture · K2387.

### L10
- **T41-49 · scheduler** · (N820) R26 registers `question-explorer`'s consumer and `investigation`'s quiet check; (N823) publish-schedule's wake (R71) re-pointed · req: §3.6.

### L11
- **T41-50 · wizard-scripts** · (was T40-17) R27; (N821, D52, D53) R23 amended (one front door, six routes; `FRONT_DOORS` filled from the design stream's doors when given), R28; (DEC-188 (8)) the Connect wizard and `screen-registry` use `ailimitset`, `accountusesset` in place of `aiceilingset`, `aicopyceilingset`, `accountswitchset`, `groupswitchset` · req: applied, §3.6; DEC-188's share BOB's wording · 2,379 → ~2,450.
- **T41-51 · op-grades** · (was T40-18) the new ops' grades (N797, N799, N812, N820's) · fixed at L11's START.
- **T41-52 · affordances** · (was T40-19) shares of the new codes and ops; (N820) R50 the new acts graded; (DEC-188 (7)) `ACT_HELP` for `owed_accountusesset`, `owed_ailimitset`, `owed_projectkeyset`, `owed_projectsigninset`, `owed_projectaccountswitch`, `owed_projectaccountremove`, `owed_projectkeynoticeseen`, `owed_projectaikeepaway`, `owed_exploreapprove`; (N822) `converts` re-stated · 2,284 → ~2,450.
- **T41-53 · queue-producers** · (N822) `action`, `shared` re-stated; recipients re-read against D54 · tests only unless R-text changes.
- **T41-54 · notice-producers** · (was T40-20) R16; (N820) R17's items; (N822) R2/R3 recipients re-read; (DEC-188 (6), (7)) items read by key (`ai.queue.limitreached`, `.suspended`, `.exploreask`; `ai.label.explored`) · 862 → ~1,250.
- **T41-55 · queue** · (was T40-21; N814, N812) `op=proposedispose` project arm; R1 kinds; (N820) R1, R52 · req: applied, §3.6.
- **T41-56 · setup-words** · (DEC-188; U142) R1/R2: `WORD_ROWS` re-frozen at the commit DEC-188 merged (PR #19; 1,006 words, 388 protected), R1's counts stated anew · req: BOB's wording naming the commit.
- **T41-57 · instance-setup** · (was T40-22) R65, R67.
- **T41-58 · op-declarations** · (was T40-23) R41, R42; the reds of rule 4 (7); (N820) R43; (DEC-188 (8)) `accountswitchset` and `groupswitchset` retire to `accountusesset` · **P6:** 3,283 → ~3,680: measured at START, reported before building if it would pass ~4,000.
- **T41-59 · admission** · (was T40-18a; N797) `handlecheck` public, R22's count; (DEC-188 (8)) R19's list drops `groupswitchset`.
- **T41-60 · answer-envelope** · (K2428) its C-120 case-disclosures test (`R2, R7 … .20–.22`) red on `tranche/T41` since T40's stamp: re-pin; and re-pin C-35.13's translation re-worded by TEXT-CHAIN #7 (K2428) · (N820) families gain the new modules' and amended modules' check rows · fixed at L11's START from the merged codes.
- **T41-61 · store-door** · (was T40-24) R10.
- **T41-62 · control-plane** · (was T40-25) R69, R70, the handle routes; (N820) R71 routes R43's ops, a capture's `step`; (DEC-188 (8)) R56 drops `groupswitchset` · **P6:** 3,270 → ~3,460.
- **T41-63 · plane** · (was T40-26) composes `ai-use`, registers publication's handle guard; (N820) R30 composes the four new modules, their migrations and counts; (N823) composes `publish-schedule`, registers its publisher; (N822) `t33` re-stated; whatever L1–L8's codes owe · fixed at L11's START.

**L11 STARTs (K874, K2400):** control-plane R69, R70 and notice-producers R16 each need an explicit test. **L11 merge order:** `modules.json` order; plane last.

**Counts:** L1 2 · L2 4 · L3 2 · L4 2 · L5 2 · L6 19 · L7 2 · L8 11 · L9 4 · L10 1 · L11 14 = 63 jobs (T40's 29 unstarted entries all carried, renumbered).

## Left out of T41 (one hard reason each, re-tested today)

| entry | hard reason |
|---|---|
| N748 | not left out: folded into N820 (the engine's design approved and in canon, K2417, K2420) |
| N815 | not left out: `question-explorer` (T41-28) |
| N751 | a measurement: no fresh policies beyond the 74 read (K2079) |
| N780 | a deployment: the next release cut (K1501) |
| N794 | Bob's: "N794: A" (K2425), legacy-ui stays frozen until the new screens replace it (K633, K1849) |
| N817 | not left out: the actions design lane, ACTIONS-DESIGN #1, started at Bob's direction (K2433) |
| N821: the wizard runner; N551 (part), N572 | a dependency not yet built: the runner is a screen-side construct of the new screens (N672) |
| N821: email capture | Bob's: "D42 - email: A" (K2425), later, after upload is in use; also a deployment (an inbound address per group) |
| N821: screens for built ops; shortcuts, command bar | the UX stream's: handed to UX-DESIGN by NOTICE |
| `agent-worker`'s split (7,510 lines) | size before its split is not this tranche's: no split map exists; T41-31 is a small change only (doubt 7) |
| T38's screen rows (N788, N757, N776, N708, N669 parts; N670; N559, N654, N672, N673, N683, N688, N698, N703, N710, N714, N719, N721, N726, N728, N732, N734, N735) | a dependency not yet built: the new member screens (N672); Bob (K2147): no interim control |
| N757 (later) | Bob's: "N757: A" (K2425), members mark photo areas by hand; no AI proposals |
| N563, N579, N632, N641, N643, N645, N652, N698 (parts) | a measurement (each as T37's table names it) |
| N703 (part) | a deployment or measurement: a zone and read token per group |
| N647 | a measurement: `investigate` is deployable only once its test bar is held (run-rules R19 as amended, T41-21) |
| N650 | a dependency not yet built: LAW L5's pack path |
| N666 | Bob's (DEC-151): after the first public release |
| N747 | Bob's (UX; `legacy-ui` frozen) |
| stamp of T41's L3+ rows | the order: promotion (L2) runs before they exist; T42's stamp |

**Newly brought in (were out or new):** N820 (all of §3), N815 (explorer), N748 (as N820), N822 (D54 and its users), N823 (publication split), N821 (front doors, D52/D53 routes, similarity at the door via `stepsLike`), D59's regrade (§4.2 (7), planned in T41, not T42), DEC-188's owed work (U145), and T40's 29 unstarted entries.

## Doubts for BOB (best readings)

1. **N796.** K2334 held it "until that lane or Bob raises it"; the lane has handed off. Reading: bring it to Bob again now, rendered with the register's entries; it stays out until he answers. Related: K2421 lets a member's own account explore when she enables it, which is unattended use of a sign-in; question-explorer R3 should refuse a sign-in principal until N796 is answered.
2. **N817.** Reading: BOB starts the actions design lane now and tells Bob (its condition met).
3. **inquiry R39 twice.** T40-5's text (K2371: no shared set-aside, no refusal by count) and §3.6's H38 amendment (a refusal naming non-hidden projects) disagree in wording. Reading: H38 (K2417, later and Bob-approved) governs; BOB folds both into one R39 before L6's START. DEC-188's `question.refused.drawnon` "naming no project" is UX words; the project names go as data. NOTICE to UX-DESIGN.
4. **N823's measure.** 4,668 counted `publication/worker.mjs` (833), which is `public-read`'s by its more specific path; by K1821 publication is 3,835. Reading: split anyway (with T40-13 it would sit at ~3,900); the seam is scheduled publishing, after publication. If BOB reads K1821 as removing the need, T41-37 goes to "Left out" (size: under ~4,000) and T41-36/39/43/49/63 drop their N823 parts.
5. **D54's scope** (§4.2 (4)): hidden projects only (K2409), as planned.
6. **N757 (later).** Reading: put to Bob with the account cascade as the answer to his reasons.
7. **agent-worker** at 7,510 lines is over K617; a split map is owed (P18) for T42.
8. **N821's member upload.** Reading: Bob's; if BOB finds a ruling that settles hand-carried intake, it joins L3 (acquisition) with BOB's wording before L3's START.
9. **DEC-188's reads and history.** No requirement gives `ailimits` or the change history yet; placed in ai-use (T41-22) and credentials (T41-5), with BOB's wording before each layer's START.
