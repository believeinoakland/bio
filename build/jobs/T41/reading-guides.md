# reading-guides (T41)

**Status** · session_01RMvYVRFkcmUHsvFuW1MH5Z · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Seven readings; I build on each now and change course only if your answer differs.
1. **Family number.** R11's new family takes **C-143** (C-141 is the highest held; I read T41's four new families in `modules.json` order: steps C-142, reading-guides C-143, question-explorer C-144, investigation C-145, so no two jobs collide). Rows C-143.1 onward, `awaiting stamp` (rule 4 item 2).
2. **R12's label.** `record-grammar`'s `PROPOSAL_STATES` has no reading-guide subject (R42 is `template`'s: "wording proposed for a filing template", wrong for a guide). Reading: the label is `{by, state, machine_work, says}` exactly as `proposalLabel` shapes it, `state` from `lawProposalState(by)`, `says` this module's own sentence. If you want a `reading_guide` subject in record-grammar instead, that is a later CHANGE to record-grammar; I would then call `proposalLabel(by, "reading_guide")`.
3. **R1's content.** No guide has been approved by Bob or measured yet, so `CIVICSMITH_GUIDES` ships **frozen and empty**. Each entry's shape (`approved_by`, `measured_use` required, origin `civicsmith`, state `group`, items passing R4) is checked by an exported `civicsmithGuideRefusal(entry)` and tested whole; the instance takes `deps.civicsmith` so tests drive R5's Civicsmith arm. I invent no guide or approval record.
4. **R6's slug.** The group's slug is `promotion`'s `producingGroup` fact; `promotion` is not in my uses. Reading: the instance takes `deps.groupSlug()` (the plane composes it from that fact); with none, `guideOffer` and `guideProposeToCivicsmith` refuse `GUIDE_NO_GROUP_SLUG`.
5. **`kind`.** A key of `doctypes`' `DOCTYPES` (the eight). Court and budget kinds are other modules (not in my uses) and are refused `GUIDE_KIND_UNKNOWN` until a requirement says otherwise.
6. **R7's "approver of its scope".** A guide `usable_by_author` or `draft`: its author. A `group` (or adopted, once approved) guide: any active member who is not its author (R3's approvers). Civicsmith's are read-only to every act (`GUIDE_READ_ONLY`).
7. **Sight (R8, R9).** Every group guide, in any state, and every machine proposal is visible to a viewer membership admits (an active member, an administrator, a machine credential) and to an internal call with no viewer; a viewer `viewerPredicate` answers `DENY` sees Civicsmith's alone. The registrations' own refusals (`PROVIDER_DECLARED`, `PROVIDER_MALFORMED`) carry no row, as public-read R18 and connections R5 do (a starting module's error).
Noted, not a question: R4's frozen list makes "may" conduct, so "Look for the May budget" is refused (the month). I keep the list as written.

## Completion (READING-GUIDES #1)

**Paths and tests for `modules.json` (K1043; BOB writes them):** `paths` `["bio-plane/src/reading-guides/"]`, `tests` `["bio-plane/test/m/reading-guides/"]`. Files created: `bio-plane/src/reading-guides/index.mjs`, `check.mjs`, `checks.mjs`, `library.mjs`, `schema.mjs`; `bio-plane/test/m/reading-guides/fixture.mjs`, `check.test.mjs`, `conduct.test.mjs`, `library.test.mjs`, `acts.test.mjs`, `across.test.mjs`, `reads.test.mjs`. Final `uses` as `modules.json` holds them: doctypes, record-grammar, civil-time, record-core, membership (civil-time is not imported: instants are record-core's `stampInstant`; the edge can stay or go, BOB's).

**Reading set** (mechanics §17). Under 300 KB, read myself: `build/requirements/reading-guides.md` whole (5 KB); layer 6's row and the investigation-engine section of `build/layers.md`; `plan/current.md` T41-26, T41-27 and rule 4; `draft-T41-investigation.md` §3 opening and §3.4; K31, K231, K874, K1043, K2448, K2472, K2480, K2482; each used module's Purpose and the services I use (record-grammar R38, R42, R46, R53 and `ids.mjs`, `labels.mjs`; record-core R21, R46, R76, R80; membership R43, R64, R68, R76, R81; doctypes R1; skills R16 and R40 for the registration's shape). My code (949 lines, 53 KB) and tests (797 lines, 50 KB) are new and written by me. No workers.

**Entries applied (T41-26), with B2's answer (K2480, K2482):**
- **R1** `CIVICSMITH_GUIDES` frozen and empty (no guide is approved or measured yet; none invented); `civicsmithGuideProblems(entry)` (J1 called it `civicsmithGuideRefusal`; renamed: it answers a list of problems, not a member's refusal) and `freezeLibrary`, which throws on an entry without approver or measured use; `GUIDE_KINDS` = doctypes' keys; read-only to every act (`GUIDE_READ_ONLY`).
- **R2** `guideDraft`: `usable_by_author` at once; `based_on` a visible guide, one of Civicsmith's or a proposal.
- **R3** `guideReview`: another active member; `approve` → `group`, `refuse` keeps the state with the reason; history in `reading_guide_history`; `guideRead` answers a guide with its history.
- **R4** `checkGuide` (pure, never throws) with BOB's closed lists frozen (`LOOK_FOR_OPENERS`, `CONDUCT_LISTS`, `may` dropped per K2482) and the item shape; `registerConductCheck(fn)` held for the process (checkGuide is pure), `PROVIDER_MALFORMED`/`PROVIDER_DECLARED` without rows; a registered check that throws or answers no list refuses the item (fail closed). Run at draft, propose, review, adopt, offer, and again in `guideFor` (a guide that no longer passes is passed over and named in `withheld`).
- **R5** `guideFor`: own usable guide, else the group's, else Civicsmith's, else none, with origin; never throws.
- **R6** `guideOffer` / `guideProposeToCivicsmith`: canonical bytes, `sha256:` digest, labelled with `deps.groupSlug()` (else `GUIDE_NO_GROUP_SLUG`); `guideAdopt`: byte-for-byte offer, `adopted`, `draft` until reviewed here, `based_on` the digest; an offer already adopted answers that guide; `registerGuideChannel` (K31; handed each offer, its failure changes nothing).
- **R7** `guideRetire`: author for own-scope, any active member but the author for a group guide; reason required; retired stays readable.
- **R8** `guidesOf`: Civicsmith's first, then the group's; at most 200, `truncated`. **R12** `guidePropose` by a machine credential with its run, stored apart in `reading_guide_proposals`, labelled `{by, state, machine_work, says}` (state from `lawProposalState`); `guideProposals` lists them.
- **R9** three tables declared through `record-core.declareTable`, sight `group`, purged with the store. **R10** no field grades or concludes; items are look-for statements. **R11** 18 rows, family C-144, in `checks.mjs`, each minted at one marked site; no place named.
- Also: `readingGuidesOps` for the control plane (its L11 jobs declare and route them).

**Rows awaiting stamp (rule 4 item 2), new, family C-144:** C-144.1 `GUIDE_CARRIES_CONDUCT`, C-144.2 `GUIDE_ITEMS_REFUSED`, C-144.3 `GUIDE_MEMBER_ACT`, C-144.4 `GUIDE_KIND_UNKNOWN`, C-144.5 `NO_SUCH_GUIDE`, C-144.6 `GUIDE_READ_ONLY`, C-144.7 `GUIDE_REVIEW_BY_AUTHOR`, C-144.8 `GUIDE_VERDICT_UNKNOWN`, C-144.9 `GUIDE_REASON_MISSING`, C-144.10 `GUIDE_NOT_REVIEWABLE`, C-144.11 `GUIDE_NOT_OFFERABLE`, C-144.12 `GUIDE_OFFER_UNREADABLE`, C-144.13 `GUIDE_NO_GROUP_SLUG`, C-144.14 `GUIDE_RETIRE_NOT_APPROVER`, C-144.15 `GUIDE_RETIRED`, C-144.16 `GUIDE_BASED_ON_UNKNOWN`, C-144.17 `GUIDE_PROPOSAL_NOT_MACHINE`, C-144.18 `GUIDE_RUN_MISSING`, each awaiting stamp. With my paths in `modules.json`, `row-census.test.mjs` names exactly these 18 as arrived (beside C-118.10, another job's).

**Deferred:** none.

**Found in other modules (REPORT to BOB):**
- `answer-envelope` (R2, R7): once my paths are in `modules.json`, its `CHECK_FAMILY_FILES` does not reach `src/reading-guides/checks.mjs`, so two of its tests turn red ("CHECK_FAMILIES is total" and the case-carriage one that re-asserts totality): 24 pass, 4 fail, against 26/2 without my paths (its 2 already red). Fix, answer-envelope's: add `["src/reading-guides/checks.mjs", READING_GUIDES]` in its place (after capture-requests, before `skilldoctrine.mjs`).
- `record-grammar` (R38/R42): no `reading_guide` subject in `PROPOSAL_STATES`; my label carries its own sentence in `proposalLabel`'s shape (K2482 took it). A subject there later would let R12 call `proposalLabel` itself.
- Bundles: the plane does not import this module yet, so no generated artifact is staled.

**Tests and checks run:**
- `node --test bio-plane/test/m/reading-guides/`: tests 42, pass 42, fail 0. Every R1–R12 named, each with a negative control. No layer tests in the manifest. No service of another module changed.
- With my paths in a local, uncommitted `modules.json` (as BOB will write them): `format`: 145 modules, 144 requirements files; 0 failures. `architecture … reading-guides`: 12 product files, 37 relative imports; 0 failures. `coverage … reading-guides`: 12 of 12 live requirement ids named by a test; 0 failures. `ownership … reading-guides tranche/T41`: 13 files changed; 0 failures. Without the paths, coverage fails 12 of 12 (no test path), as K1043 expects.

Size (session_01RMvYVRFkcmUHsvFuW1MH5Z): test runs 16, module lines 949

## J2 · REPORT

answer-envelope (R2, R7): once BOB writes reading-guides' paths into modules.json, its CHECK_FAMILY_FILES does not reach src/reading-guides/checks.mjs (family C-144), so 'CHECK_FAMILIES is total' and the case-carriage test that re-asserts totality turn red (24/4 against 26/2 today). Fix is answer-envelope's: add ["src/reading-guides/checks.mjs", READING_GUIDES] after capture-requests, before skilldoctrine.mjs. Also row-census lists my 18 rows C-144.1–.18 as arrived (rule 4 item 2; named awaiting stamp in my record).
