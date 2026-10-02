# DEC-88 reason audit (J2): the 29 reasoned acts and `inboxresolve`

Read on `tranche/T22`. Sources: DEC-88 (`docs/development/DECISIONS.md`:1419, "owed (BOB's)": "add a required reason to each reasoned act whose requirement does not yet require one (an act whose own authored words serve as its reason counts)"); `build/plan/t22-opening-folds.md` (c) 7; `build/plan/current.md` "At the opening" 5. Owners were checked against each module's ops map / dispatch (`provenance` R53, `content` R50, `entities` R40, `intent/index.mjs`:1424–1440, `reevaluation/index.mjs`:1778, `escalation` R25) and the requirement's op header. Layers from `build/modules.json` / `layers.md`. All owners in the folds table are confirmed.

Verdicts: **yes** = the requirement refuses the act without an authored reason · **own words** = the act's required authored words are its reason · **grounds** = it requires record grounds (bytes or a member's account), not prose: BOB to rule · **NO** = no reason required.

## Table

| act / op | module | L | req | reason? | evidence |
|---|---|---|---|---|---|
| `testify` | provenance | 3 | R28 | own words | "`TESTIMONY_NO_WORDS` (C-53.3)" |
| `inboxresolve` / `inboxResolve` | capture | 3 | R32 (sig. :76), R65 | **NO** (confirmed) | signature `inboxResolve({knockId, status, by})`; R32 refuses only `BAD_STATUS`, `NO_SUCH_KNOCK`; "recorded with who and when". R65 `pullKnock({knockId, by})` likewise none |
| `transcribe` | content | 4 | R23–R24 | own words | "C-52.6 (empty text)"; the typed text is the member's claim (R24 "keeps the text byte for byte") |
| `transcriptionattest` | content | 4 | R25 | **NO** | `transcriptionAttest({…, note})`; R25's refusals C-52.8, C-35.10/11, C-52.9 only; no note refusal |
| `attesttext` | content | 4 | R43 | **NO** | `attestText({…, note?, …})`; "records … the note"; refusals C-35.10/11, `NO_READING` only |
| `lead` | observation-log | 5 | R14 | own words | "C-54.3 (no words)" |
| `leadlook` | observation-log | 5 | R17 | **NO** | `detail` only capped ("C-54.4 (detail over the cap)"); state/kind/ref are vocabulary |
| `leadshare` | observation-log | 5 | R16 | **NO** | `leadShare({lead, project, sharer, viewer})`; refusals C-54.5, C-54.10, C-54.9 |
| `resolve` | entities | 5 | R9–R11 | **NO** (see note 1) | a recogniser: "`basis` the matched string and a `method` sentence naming the tier"; R11 refuses `NO_SHA`, `NO_REF`, `NO_SUCH_REFERENCE` |
| `resolvetestify` | entities | 5 | R12 | yes | "the act-shape `NO_BASIS` … a method naming the testifier and the stated basis" |
| `entitycreate` | entities | 5 | R1 | **NO** | `createEntity({kind, label, note?, …})`; refuses `NO_KIND`, `UNKNOWN_KIND`, `ENTITY_NO_LABEL` only |
| `progressiondefine` | progressions | 5 | R2, R4 | **NO** at version 1 | R2: "a first declaration writes version 1, with a basis if one is given (it reads back `stated: false` otherwise)"; R4 requires `NO_BASIS` only for a revision |
| `biasadopt` | bias | 5 | R11–R12 | **NO** | refusals C-26.9, C-26.10, C-70.1, authority only |
| `strengthbar` | strength | 6 | R15 | **NO** (confirmed) | refusals C-32.9, administrator, `BAD_GRADE`, `NO_BAR` only |
| `versionadopt` | reevaluation | 7 | R15 | **NO** | "`adoptVersion({notice, author})`" (`keepVersion`'s `why?` is optional and is the reversible act) |
| `goaldeclare` | intent | 7 | R8 | own words | "an empty statement or bounds (`PURSUIT_UNSTATED`, K238)" |
| `aspirationdeclare` | intent | 7 | R9 | **NO in the text** (note 2) | R9 names no refusal of an empty statement; code refuses `PURSUIT_UNSTATED` (`intent/index.mjs`:731), proved `pursuits.test.mjs`:103 |
| `aspirationdeadend` | intent | 7 | R11 | **NO in the text** (note 2) | "`recordDeadEnd` appends a dated, authored entry"; code refuses `NO_NOTE` (C-111.27, `index.mjs`:785), tested in `objective.test.mjs`, `pursuits.test.mjs` |
| `objectivecondition` | intent | 7 | R2 | **NO** | refusals machine, project, participant, shape, progression, entity, stage, grade, share only |
| `workobjective` | intent | 7 | R18 | **NO** | "`workObjective({project, author})` … A member's act only"; DEC-88 (4) names "its reason field" |
| `attribute` | publication | 8 | R17 | **NO** | refusals C-92.1–C-92.9 (member, level, observation, author, edition, handle) only |
| `statementack` | case-authoring | 8 | R19–R20 | **NO** | `acknowledgeStatement({draft?, case?, edition?, secretSha?, bySecret, viewer})`; refusals C-82.2–C-82.7 only |
| `standarddeclare` | standards | 9 | R1 | **NO** | refusals machine, cite, kind, issuer, `STANDARD_NO_TEXT` (a content id: the captured law, not the member's words), period, supersedes |
| `standardadopt` | standards | 9 | R10 | **NO** | "is R1 by a member, naming the proposal"; the proposal's `why` (R9) is the proposer's, possibly a machine's |
| `consequencerecord` | consequences | 9 | R2–R4 | yes for the judgement arm; grounds otherwise (note 3) | R3 "a member states the value or range with a rationale" (code `NO_RATIONALE`); R2 computed: operands; R4 undetermined: "with why" |
| `actioncorrespond` | actions | 9 | R15–R16 | grounds (note 4) | "`CAPTURE_AND_TESTIMONY` (C-33.7); `NEITHER_CAPTURE_NOR_TESTIMONY` (C-33.8)"; "held_as: capture \| testimony, artifact_sha \| account" |
| `filingsent` | filings | 9 | R7 | grounds (note 4) | "then `actions.actionCorrespond`'s refusals … held as the capture of the bytes sent or the member's account"; the text is R6's member-approved text |
| `counselpacket` | filings | 9 | R8 | **NO** | refusals machine, action, `NO_COUNSEL`, template, `NO_DETERMINATION` only |
| `escalationopen` | escalation | 9 | R1 | **NO** (confirmed) | `escalationOpen({determination, author, viewer})`; refusals machine, determination, superseded, noncompliant, participant, `ALREADY_OPEN` |
| `escalationattach` | escalation | 9 | R9 | **NO** | refusals machine, escalation, action, breach, stage, `ALREADY_ATTACHED`; stage 7's `purpose` is one of five words (R12), not prose |

Tally: yes 2 (`resolvetestify`, `consequencerecord`'s assessed arm); own words 4 (`testify`, `transcribe`, `lead`, `goaldeclare`); grounds 2 (`actioncorrespond`, `filingsent`); NO 22, of which 2 are text-only (code and tests already meet them).

## Notes

1. **`resolve`** is the alias recogniser (grades A–C, never D); a member only triggers it, and its grounds are the matched string. A prose reason fits it badly. Recommended: BOB rules that `resolve`'s recorded `basis` and `method` serve, or proposes to Bob that `resolve` move to the reversible band (its claim-bearing twin, `resolvetestify`, already requires `basis`). The draft is below in case BOB folds instead.
2. **Text-only folds.** These carry no mark because the code and tests already meet them. Word them as met, citing the tests.
3. **`consequencerecord`.** The member's judgement (assessed) already requires a rationale. The computed arm is the module's arithmetic over cited operands, which a machine may also record (R2). The undetermined arm states why. Recommended: no fold; BOB rules that the operands and the why are the grounds.
4. **`actioncorrespond` / `filingsent`.** Each requires grounds: either the captured bytes or the member's own account (testimony). On the account arm the member's words serve. On the capture arm the held bytes are the claim's evidence. Recommended: no fold; BOB rules that "held as capture or testimony" satisfies DEC-88. The alternative, an extra prose reason on logging a letter, adds friction for no gain.

## Draft folds (each NO)

Codes are proposed (DEC-49: own rows). Positions are proposed. All are BOB's to settle.

**L3, capture (already in T22; fold 8, merge with DEC-108's R32 re-wording if both land):**
- R32 (and :76's signature `inboxResolve({knockId, status, by, reason})`): "… resolves knocks (`pulled`, `discarded` or back to `new`, else `BAD_STATUS`), each with the member's reason (`KNOCK_NO_REASON`: absent, blank or over 2,000 characters, asked after the member-session fence and before `NO_SUCH_KNOCK`), recorded on the row with who and when; the `pulled` arm takes it too and R65's `pullKnock({knockId, by, reason})` records it on the knock (DEC-88; K1020) *(not yet met: T22)*"

**L4, content (already in T22; add to content's START):**
- R25: "`transcriptionAttest` requires a `note`, the attestor's words on what they compared (`ATTEST_NO_NOTE`: absent, blank or over 2,000 characters, asked after C-52.9), kept with the attestation (DEC-88; K1020) *(not yet met: T22)*"
- R43: "`attestText` requires a `note`, the attestor's words on what they compared (`ATTEST_NO_NOTE`, asked after `NO_READING`), kept with the attestation (DEC-88; K1020) *(not yet met: T22)*"

**L5, observation-log (already in T22; add to its START):**
- R17: "A look requires a `detail`, the looker's words on where they looked and what they found (`LEAD_LOOK_NO_DETAIL`: absent or blank, asked after C-54.7 and before C-54.4) (DEC-88; K1020) *(not yet met: T22)*"
- R16: "`leadShare` requires a `reason`, why this lead is disclosed to that project (`LEAD_SHARE_NO_REASON`: absent, blank or over 2,000 characters, asked after C-54.9), recorded with the share; a repeat keeps the first (DEC-88; K1020) *(not yet met: T22)*"

**L5, entities (joins L5):**
- R1: "`createEntity` refuses, after `ENTITY_NO_LABEL`, `ENTITY_NO_NOTE`: the note, the declarer's words on who or what this is and why it is registered, absent or blank (DEC-88; K1020) *(not yet met: T22)*"
- R11 (only if BOB does not rule per note 1): "`resolve` requires a `reason`, the member's words on why these references are being resolved (`RESOLVE_NO_REASON`, asked first), recorded on each resolution it writes (DEC-88; K1020) *(not yet met: T22)*"

**L5, progressions (joins L5):**
- R2: "A first declaration is refused `NO_BASIS` without a basis statement, judged as R4 judges a revision's (a citation stays optional at version 1) (DEC-88; K1020) *(not yet met: T22)*"

**L5, bias (joins L5):**
- R11: "…; then `BIAS_ADOPTION_NO_REASON` (absent, blank or over 2,000 characters), the adopter's words on why this lens is adopted, kept with the adoption (R12) and on each re-adoption (DEC-88; K1020) *(not yet met: T22)*"

**L6, strength (already in T22; joins fold 10's R15 text):**
- R15: "…; `NO_BAR` when neither axis is given; then `BAR_NO_REASON` (absent, blank or over 2,000 characters), the administrator's words on why the group sets this bar, recorded with it and answered by `strengthBarOf` (DEC-88; K1020) *(not yet met: T22)*"

**L7, reevaluation (joins L7):**
- R15: "`adoptVersion({notice, why, author})` requires `why`, the member's words on why the newer version is adopted (`VERSION_ADOPT_NO_REASON`, asked after the machine refusal), recorded with the new version (DEC-88; K1020) *(not yet met: T22)*"

**L7, intent (joins L7):**
- R2: "`setCondition` requires a `reason` (`INTENT_NO_REASON`, R30, asked after `PROJECT_ACT_NOT_A_PARTICIPANT`), the author's words on why progress is measured this way, carried on the revision with the condition, its removal included (DEC-88; K1020) *(not yet met: T22)*"
- R18: "`workObjective({project, reason, author})` requires a `reason` (`INTENT_NO_REASON`, R30, asked after the machine refusal), recorded on the run's opening and shown with its budget and scope (DEC-88 (4); K1020) *(not yet met: T22)*"
- R9 (text-only, met): "… an empty statement is refused `PURSUIT_UNSTATED` (K238) (DEC-88; K1020; `pursuits.test.mjs`:103)"
- R11 (text-only, met): "`recordDeadEnd` requires a non-empty `note` (`NO_NOTE`, C-111.27) …(DEC-88; K1020)"

**L8, publication (already in T22; add to its START):**
- R17: "…; then `ATTRIBUTION_NO_REASON` (absent, blank or over 2,000 characters, asked after C-92.2): the author's words on why this level, recorded with the choice (DEC-88; K1020) *(not yet met: T22)*"

**L8, case-authoring (already in T22; add to its START):**
- R19: "…; then `STATEMENT_ACK_NO_REASON` (absent, blank or over 2,000 characters, asked after C-82.6): the acknowledger's words, kept with the acknowledgement and shown in R20's list (DEC-88; K1020) *(not yet met: T22)*"

**L9, standards (joins L9):**
- R1 (covers `standardadopt` through R10): "…; `STANDARD_NO_REASON` (absent, blank or over 2,000 characters, asked after `STANDARD_NO_ISSUER`): the declarer's words on why the group holds its government to this standard, read back with the declaration (R4, R5) (DEC-88; K1020) *(not yet met: T22)*"

**L9, filings (already in T22; add to its START):**
- R8: "…; then `PACKET_NO_REASON` (absent, blank or over 2,000 characters, asked after `MACHINE_CANNOT_NAME_COUNSEL`): the author's words on why the packet is assembled, recorded with its version (DEC-88; K1020) *(not yet met: T22)*"

**L9, escalation (already in T22; confirmed):**
- R1: DEC-89's draft (`plan/draft-T22-dec-folds.md`:16) already words it: `ESCALATION_NO_REASON` (R24) after `MACHINE_CANNOT_OPEN`, with R24's list gaining R1. Its note at :17 holds: J2 adds the reason even if DEC-89 is not approved, without "why this breach is worth pursuing". The line to use if DEC-89 is not approved: "`escalationOpen({determination, reason, author, viewer})`: after `MACHINE_CANNOT_OPEN`, `ESCALATION_NO_REASON` (R24) (DEC-88; K1020) *(not yet met: T22)*", with R24 naming R1.
- R9: "`escalationAttach` requires a `reason` (`ESCALATION_NO_REASON`, R24, asked after `MACHINE_CANNOT_ATTACH`), recorded with the attachment; R24 names R9 (DEC-88; K1020) *(not yet met: T22)*"

## Modules that join a layer (not in T22 today)
entities, progressions, bias (L5); reevaluation, intent (L7); standards (L9). Optional: consequences and actions (L9), only if BOB folds instead of ruling per notes 3–4. Each new reason ripples to callers: the affordances pre-flight, control-plane routes, the UI and tests that send reasonless acts. Each START should list them, as fold 8 does for capture.
