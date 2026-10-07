# Plan T36

**Status** · DRAFT (prepared during T35 by BOB #132, P18)

**Sources** · `next.md` N706–N736; `current.md` (T35): its "Left out of T35" table, accepted reds 2, 3, 21, 25, 32, "Modules for the virus package (BOB's, decided K2008)", "Shares named for later STARTs", "P6 notes"; `plan/draft-T36-virus-requirements.md` rev. 2 (with K1946, K1949 folded); `modules.json` (order, layers) with L11's split rows from `plan/draft-T35-split-reqs/modules.json.at-L11` (op-grades, answer-envelope, store-door), in force by T36; rulings K1913, K1922, K1924, K1928, K1929, K1936, K1939, K1941, K1946, K1949, K1954, K1955, K1957, K1961, K1972, K1973, K1977, K1983, K1988, K1991, K1993, K1995, K1996, K2002, K2004, K2005, K2007, K2008, K2009, K2015, K2021. PROCESS-MECHANICS §5.2; PROCESS-DESIGN P10, P19.

**At T36's opening (assumed):** every T35 entry is merged (T35-1 … T35-84); PR #13 (the UX design stream: DEC-168–DEC-177 and the design detail U108–U119) is merged to `main` at T35's close (§5.7 (1)), so "the DEC is not on `main` until PR #13" is no hard reason in T36; `file-scanner` (L1, last, after `sheet-worker`) and `file-safety` (L3, directly after `capture`, before `sources`) are added to `modules.json` with `plan/draft-T36-virus-requirements.md` rev. 2's rows and requirements (K2008, on K1913). Still hard reasons: the new screens' shell (N672), which nothing in T35 or T36 builds; every deployment or measurement no T35 or T36 entry takes.

## Legacy census (§5.2 (2))

`modules.json` (and `modules.json.at-L11`) mark exactly one module `legacy: true`.

| legacy module (`modules.json`) | in T36 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`; `app.html` 26,551 lines, its `.mjs`/`.js` 13,444 lines incl. tests) | stays | No T36 entry retires it. Hard reasons: Bob's (UX), K633 (it stays as it is until the new interface replaces it); and a dependency not yet built: the new member screens and their shell (N672, N559). Its one T36 share is N711's re-point away from `MEMBER_TOKEN` (T36-38), not a retirement. |

## Rules at the opening

1. T35's rules hold. Merge order within a layer is `modules.json` order, except where a layer's merge-order line says otherwise.
2. **The virus package (N706, N707, with N710 and N714).** `file-scanner` and `file-safety` are added at the opening with rev. 2's rows (K2008). Rev. 2 is applied as Bob ruled it (K1928, K1929, K1939, K1949); before L3's START BOB re-words `file-safety` R8, R9 for DEC-173 (K1974 in N714: two confirmations; refused by name under a scan hold, without a ClamAV `clean` note within `RESCAN_INTERVAL_MS`, or not scanned; `originalState` naming the open path; no record of who, R10), and folds DEC-169's owed table of finding kinds in member words (N714). The later users (rev. 2 §4) are entries below, each in its module's layer.
3. **DECs folded at the opening (PR #13 on `main`).** DEC-168, DEC-169 → N714 (T36-5, T36-10, T36-11, T36-30, T36-35, T36-37, T36-39); DEC-170 → N719 (T36-30); DEC-171 → N722 (T36-31, T36-35); DEC-172 → N721 (T36-7, T36-33, T36-34, T36-35, T36-37); DEC-173 → N714 (T36-11); DEC-174, DEC-175 → N726 (left out); DEC-176 → N732 (left out); DEC-177 → N734 (left out); U108–U115 → N728 (data share T36-16, screens left out); U119 → N735 (data share T36-19, screens left out).
4. **`modules.json` edges (BOB's, P17), at each START:** acquisition uses file-scanner (N714's reputation call); scheduler, notice-producers, op-grades, op-declarations and control-plane use file-safety; retrieval uses standards and people (N715; it already uses events, money); case-authoring uses case-checker (N717); `status` gains the AMENDED sentence rev. 2 §1 names.
5. **Accepted reds expected at the opening, by name (BOB confirms them):**
   1. Coverage: every id marked `*(not yet met: T36)*`, until its module's merge; `file-scanner` R1–R31 and `file-safety` R1–R37 included.
   2. The format check's `file-scanner` and `file-safety` paths and tests entries (no directory yet, K1043's form), until T36-5 and T36-11 create them (as T35's red 24).
   3. membership R83 `module-order.test.mjs` and its sister tests (promotion `registry.test.mjs`, standards `reads.test.mjs`): `MODULE_ORDER` lacks `law-relations` (T35's red 25) and the modules the opening adds, until T36-6.
   4. Row census (T35's red 2): rows T35's L3–L11 jobs added or re-worded stay `awaiting stamp` until T36-8; rows T36's L3–L11 jobs add stay awaiting until T37's promotion job (P4).
   5. sources `contract.test.mjs`:108 R1 (T35's red 21), until T36-12.
   6. bundler `system/fleetbundles.test.mjs`'s agent-worker input list (T35's red 32), until T36-2.
   7. The UI's DEC-88 tests (Bob's), carried (T35's red 3).

## Entries

Each line is one job (P8): every T36 entry for that module. Fields: module · (N-ids) what · rulings · `req:` the requirement change BOB writes before the layer starts · depends.

### L1

- **T36-1 · signatures** · (N712, its share; K1936 Q4 step 1) the signer page offers a passphrase at Generate (`wrapKey`) and labels a recovery key · K1936 · req: new Rs, BOB's wording; the Distribution canon's custody section (who holds each key, where, rotation, the recovery key's one use) is BOB's text · depends —. Then Bob's ~15-minute browser sitting, walked through, and Bob replaces `BIO_RELEASE_SEED` and `BIO_RATIFY_SEED` (after T36-39's `ARMED_SIGNERS`).
- **T36-2 · bundler** · (N716) F20's other half: the agent-runner image's package list recorded in the release beside F21's third-party listing. (N733) `system/fleetbundles.test.mjs`'s agent-worker input list re-pinned to its 22 inputs (`src/draft.mjs`, `src/reads.mjs`), clearing red 6. (N713, its share; K1936 Q4 step 2) assembling apart from signing: sessions assemble, never sign; signing in a GitHub Actions environment (`release-sign.yml`) with Bob as required reviewer and the seed as its secret; one Bob approval per release · K1881, K1936, K1941, K1996 · req: F20's R amended, a new R for assemble-apart, BOB's wording · depends —. Bob's sitting in GitHub (environment, reviewer, secret) and in the claude.ai environment follows; must land before the first real group installs (K1936).
- **T36-3 · office-readers** · (N724, its share) a `.docx` table's cells held in the reading as R30 holds a sheet's (today `{table, ref, rows, cols}` only, R11), so retrieval R74 can name a document table's date or amount column · K1972 · req: R11 amended, BOB's wording · depends —. **P6:** 3,609 before T35 (+~100 in T35-9); the job reports if it would pass about 4,000.
- **T36-4 · doctypes** · (N709) R35's policy-reader measure re-run out of sample: at least 20 OPD and City policies not among the 50, under jurisdictions' first profile (R67, R69, held since T35-1), per field; below 90% the reader's R25–R34 are re-scoped. The job captures the fresh policies itself as T35-12 did; if it cannot fetch them, the measure waits as a measurement (K1862 (1)) · K1924, K1902 · req: R35 (the out-of-sample measure), BOB's wording · depends —.
- **T36-5 · file-scanner** (new) · (N706, N710 its share, N714 its share) the whole module as rev. 2 §2 states it: `/scan` (R1–R4, ClamAV on a duplicate of the bytes), the signature mirror (R6, `cvdupdate`, daily), the safe-view renderer `/render` (R7, a second container class), `/version` (R8), the provider contract (R19 descriptor, R20 catalogue with `REFUSED_PROVIDERS` and `HELD_PROVIDERS` as DEC-168 S10–S12 rule, R21 tool spec, R22 private mode per call), `/provider/scan`, `/provider/sandbox`, `/provider/cdr`, `/provider/reputation`, `/provider/refresh`, `/provider/forward`, `/provider/test`, `GET /providers` (R5, R23–R29), the transports and engine families (R30, R31), the fleet member (R10, `SECURITY_VPC` optional), invariants R11–R18; every catalogued adapter (K1946 T5: the whole catalogue, size no hard reason) · K1888, K1890, K1892, K1895, K1913, K1929, K1939 (DEC-168), K1946, K1949, K2008 · req: `file-scanner` R1–R31 (rev. 2, worded) · depends T36-2 (bundler, merged first; it lists, describes and deploys the member). **P6:** rev. 2 estimates ~600–900 lines for R1–R18 plus ~1,500–2,500 for R19–R31, under about 4,000.

**L1 merge order:** `modules.json` order: signatures → bundler → office-readers → doctypes → file-scanner (last; it uses bundler).

### L2

- **T36-6 · membership** · (N723) R83's `MODULE_ORDER` names `law-relations` (K1961), and, by R83's own rule (the list names every module `modules.json` names), every module added since: `op-grades`, `answer-envelope`, `store-door` (L11 split) and `file-scanner`, `file-safety` (T36 opening) in the file's places; clears red 3 · K1961, K1864, K2008 · req: R83 (re-pinned, wording only) · depends —. **P6:** 3,966 lines; names only.
- **T36-7 · credentials** · (N710, its share; K1946 T1, T3) every outside security tool's key held by R29's `keyedServiceSet` under service `security:<tool_id>`, R29's text widened from "CourtListener's lookup first" to name the `security:` services (rev. 2 conflict (h)); an in-plane read of R44's counts for a period, reached by no route, for `file-safety` R35's forwarding (conflict (g)). (N721, its share; DEC-172) `accountFor` refuses every account while "keep our material away from AI" is on, by a named refusal carrying the reason, and otherwise always accepts a member's own subscription or key (K1757's "the group's key only" retired) · K1929, K1946, K1957; DEC-172 · req: R29 amended, `accountFor`'s R amended, new Rs for the counts read and the keep-away refusal, BOB's wording · depends —. **P6:** ~2,700 after T35; the job reports if it would pass about 4,000. Not here: N708's R22 `subscription` retirement (left out).
- **T36-8 · promotion** · (T35's red 2) stamps every row awaiting stamp at T35's close (the rows T35's L3–L11 jobs added or re-worded) and the rows T36's L1–L2 jobs add (T36-7's keep-away refusal and any refusal of the counts read), so `test/system/row-census.test.mjs` is green; the catalogue version moves, and any pinned digest moves in its owner's job · K1542, K1545, K1855 · req: none (a stamp) · depends T36-6, T36-7.

**L2 merge order:** membership → credentials → promotion last (it stamps the layer's rows). Then T35 rule 7's regeneration (`case-checker/program.mjs`, the plane bundle).

### L3

- **T36-9 · provenance** · (N725) a read of receipts by capture, so standards R38's `version_basis` need not read all of `receipts()`. (N730) an index on `captured_locators.retrieval_locator`, so capture-requests R49's retrieval-locator read does not scan the table (an implementation note in its Suggestions) · K1973, K1993 · req: a new R for the read (BOB's wording); N730 none · depends —.
- **T36-10 · acquisition** · (N720) R41's `archiveList` refuses by name a held capture that is not an archive (today `ok: true` with its listing refused whole). (N714, N710, its share; DEC-168 S12, S13; rev. 2 §4) takes `reputation` (a tool spec or null) from its caller, as it takes `ownHosts` (R42); before a fetch asks `file-scanner`'s `/provider/reputation`; a listed answer never refuses the fetch, is recorded on the receipt as `reputation:{tool, listed, categories, checked_at}` and stated in the answer to the member (the file then graded high by `file-safety` R6's `bad_reputation`); no answer (no tool, unreachable) recorded as such · K1929, K1939, K1946 T2, K1955 · req: R41 amended, a new R for the reputation check and the receipt field, BOB's wording · depends T36-5 (L1). **P6:** ~2,500 after T35.
- **T36-11 · file-safety** (new) · (N707, N710 its share, N714 its share) the whole module as rev. 2 §3 states it: intake on every receipt (R1), append-only verdict notes (R2, R3), scanning and status (R4, R5; routine tools only on the group's own servers, Q5), the threat grade with the archive rule and bad reputation (R6, R7; Q1, Q9, S13), opening the original (R8, R9, as DEC-173 re-words them, rule 2), no record of who (R10), the safe view (R11, R12), the deeper check (R13, R14, R36; Q6), scan hold and release by two members or a second, different engine (R15–R19; Q3, Q7), archives (R20), constants (R21), security tools (R27–R32; S10, S11), the safe copy (R33; K1929 (4)), web reputation (R34), log forwarding of counts only (R35), invariants R22–R26, R37. (N714) R6's reasons and DEC-169's table of finding kinds in member words ("Civicsmith has no plain description of this name" when none matches) in its table (R24) · K1852 (1), K1882, K1888, K1890, K1892, K1895, K1913, K1928, K1929, K1939 (DEC-168, DEC-169), K1946, K1949, K2008; DEC-173 · req: `file-safety` R1–R37 (rev. 2, worded), R8, R9 re-worded for DEC-173 · depends T36-5, T36-7, T36-9, T36-10. **P6:** rev. 2 estimates ~1,500–2,200 + ~800–1,200 lines (2,300–3,400); the job reports if it would pass about 4,000.
- **T36-12 · sources** · (N718) `contract.test.mjs`:108 R1 re-pins `mintExhausted`'s detail as record-core R82 words it (T35-13), clearing red 5 · K1942 · req: none · depends —.

**L3 merge order:** `modules.json` order: provenance → acquisition → file-safety (after capture's place, which has no T36 job) → sources.

### L4

- **T36-13 · extraction** · (N724, its share) carries a `.docx` table's cells (T36-3) into the reading as a sheet's are carried, so retrieval R74 can name a document table's date or amount column · K1972 · req: BOB's wording · depends T36-3 (L1).

### L5

- **T36-14 · events** · (N715, its share; DEC-164 (4)) a read of what it recorded by capture and extent, naming who recorded each, so a found result already recorded shows who recorded it · K1941 · req: a new R, BOB's wording · depends —.
- **T36-15 · standards** · (N715, its share) the same read by capture and extent. (N736) a member records that a standard (a version) is known to be in force through a date, from a source checked that day, so `inForceAt` and `bindsAt` answer `in_force`/`binds` up to that date instead of `undetermined` (civil-time R22: a null end is "not stated", never "always"); conformance R27's refusal then holds only where nothing is recorded · K1941, K2021 · req: new Rs, BOB's wording · depends —. **P6:** standards after T35's split (K1961); the job reports its size.
- **T36-16 · money** · (N715, its share) the read by capture and extent. (N728, its data share; U108, U110–U113) the money trail answers each fact's `from` and `to` party with its grade, "not stated in this source" when absent, never inferred, and "When it moved" from the event the fact `concerns` (its date precision; "did not move" for a non-actual phase; undetermined when no event dates it, never placed by its period); a budget-only figure answered by the paid figure at its own stage, compared (`reconcile`), never merged, a later change an `adjusts`; adding evidence never changes a figure (U114) · K1941, K1988 · req: R amended for the trail read, BOB's wording · depends —. See Questions (2): whether this share waits for its screen.
- **T36-17 · people** · (N715, its share) the read by capture and extent · K1941 · req: a new R, BOB's wording · depends —.
- **T36-18 · retrieval** · (N715, its share) `findIn`'s results name, for a match already recorded, who recorded it, through events', standards', money's and people's reads (T36-14–T36-17). (N729) a read-only members read of a selection beside `selectionResolve` (R19), so answers R28's freeze writes nothing on a `SCOPE_TOO_LARGE` refusal · K1941, K1991 · req: R73–R75 amended for N715, a new R for N729, BOB's wording · depends T36-14, T36-15, T36-16, T36-17. **P6:** ~3,300 after T35; the job reports if it would pass about 4,000.
- **T36-19 · calculations** · (N735, its data share; U119) the spot-check result: visits held as testimony (`testify`) tied to a drawn item, "could not tell" counted apart; what it estimates (the share judged and the exact 95% interval, R18, also as counts of the set with the unjudged-items assumption stated) · K2015 · req: calculations (visits as testimony tied to a drawn item), BOB's wording · depends —. See Questions (2).

**L5 merge order:** `modules.json` order: events → standards → money → people → retrieval (after the four) → calculations.

### L6

- **T36-20 · hypotheses** · (N727) a note's number is not drawn from any sequence shared across members (an opaque id, or a per-member sequence); R14's "a later note never takes a deleted note's number" holds as written; a test proves two members' notes reveal nothing of each other's count · K1983, K2007 · req: none (R12, R14 already require it; BOB's wording may name the rule) · depends —.
- **T36-21 · citation** · (N715, its share) the read of what it recorded by capture and extent, naming who recorded each · K1941 · req: a new R, BOB's wording · depends —. See Questions (1): its reader.
- **T36-22 · skills** · (N731) the research boundary also tells the assistant that a capture is requested only for an address the record already holds (capture-requests R49), and that a page found on a public site but not held is the member's to acquire · K1993 · req: R38 (c), and the Roles canon §3 rule 11 sentence it quotes (R21), BOB's wording · depends —.
- **T36-23 · answers** · (N729, its share) R28's freeze at set time reads the selection through retrieval's read-only read (T36-18) · K1991 · req: R28 re-pointed, BOB's wording · depends T36-18 (L5).
- **T36-24 · agent-worker** · (N695, its share) R48 reads the agent's `pack` and `fences` apart, as control-plane serves them since T35-72 (R41) · K1864 · req: R48, BOB's wording · depends —.

**L6 merge order:** `modules.json` order: hypotheses → citation → skills → answers → agent-worker.

### L8

- **T36-25 · case-grammar** · (N717, its share) a `criteria` kind for offline checking; R13's `archive` and `container` kinds (CASE-CARRIAGE #3); the case document states each member finding's `subject_entity` (in its `case_roles:` or `case_conclusions:` row), so case-checker R21's per-body narrowing (K2002) applies · K1941, K2002, K2004 · req: R13 and new Rs, BOB's wording · depends —.
- **T36-26 · publication** · (N597, its part) drops the `caseRelation` delegate (affordances re-pointed to case-tensions in T35-66) · K1643 · req: none (Uses re-worded) · depends —. **P6:** 3,716 after T35-54 (K2011); this lowers it.
- **T36-27 · public-read** · (N717, its share) carries case-grammar's `archive` and `container` kinds in the case file · K2004 · req: BOB's wording · depends T36-25.
- **T36-28 · case-authoring** · (N717, its share) its pre-flight calls case-checker R21 (`checkStandardsUse`); it writes each member finding's `subject_entity` into the case document, so a benchmark beside another body's binding row no longer lets "violated" pass (CASE-CHECKER #6 J2) · K1941, K2002, K2004 · req: BOB's wording · depends T36-25; edge case-authoring uses case-checker (rule 4).

**L8 merge order:** case-grammar → publication → public-read → case-authoring.

### L10

- **T36-29 · scheduler** · (N707, its share; rev. 2 §4) the wakes of `file-safety`'s `scanBatch` (daily), `renderBatch`, `deeperBatch` (every few minutes while checks are queued or running) and `forwardSecurityCounts` (hourly), and of the reputation list refresh (`file-scanner` R26, through `file-safety`) · K1913, K1929 · req: new Rs, BOB's wording · depends T36-11 (L3).

### L11

- **T36-30 · op-grades** · (N714, N707, its share) grades `releaseScanHold`, `requestDeeperCheck`, `requestSafeCopy`, `openOriginal` with `override`, and the security-tool acts (administrators); (N721) the `aikeepaway` act (an administrator's, with a reason). (N719, DEC-170) `personexpunge` is not a phone act: either its rung becomes the irreversible one (`phoneOf` then gives `phone: false`) or it joins `LARGER_SCREEN_ACTS` (R18) · K1943, K1954, K1957, K1939; DEC-169, DEC-170, DEC-172 · req: BOB's wording · depends —. Not here: N719's "the dialog is readable on a phone" (its surface, left out).
- **T36-31 · affordances** · (N722, its share; DEC-171) the `connect` screen named "The assistant" (Settings › The assistant) as an interface word · K1957 · req: BOB's wording · depends —.
- **T36-32 · notice-producers** · (N707, N710, its share) a "found" finding (`file-safety` R15 `scanFindings`) to the members who may see the capture, naming no one; a tool switched off (`file-safety` R31) to administrators · K1913, K1929 · req: new Rs, BOB's wording · depends T36-11.
- **T36-33 · setup-page** · (N721, its share; DEC-172) as DEC-172 places it (see Questions (5)) · K1957 · req: BOB's wording · depends T36-7.
- **T36-34 · instance-setup** · (N721, its share; DEC-172) R59 restated as two separate choices: the group pays (its API key, nothing preselected); "keep our material away from AI", off by default, set by an administrator only with a reason. (N711, its share; K1936 Q3) `setup.mjs` and `livefire.mjs` re-point from `MEMBER_TOKEN` to a member's session or an `aik-` credential · K1936, K1957 · req: R59, BOB's wording · depends T36-7.
- **T36-35 · op-declarations** · (N714, N707, N710) declares `scanbatch`, `renderbatch`, `deeperbatch`, `scanstatus`, `verdictnotes`, `threatof`, `openoriginal`, `originalstate`, `safeview`, `safecopy`, `deepercheck`, `releasescanhold`, `scanfindings`, `securitytools`, `securitytooladd`, `securitytooltest`, `securitytoolremove`, `securitytoolevents`, `securityforward` (DEC-169's `owed:` ops). (N721) the act behind `owed:aikeepaway`. (N722) the interface word "The assistant" in the registry. (N711, its share) see Questions (6) · K1936, K1939, K1957; DEC-169, DEC-171, DEC-172 · req: R27 and BOB's wording · depends —.
- **T36-36 · admission** · (N711, its share; K1936 Q3) refuses a `class:member` bearer by name (R5), after its callers re-point · K1936 · req: R5, BOB's wording · depends T36-34, T36-38, T36-39 (merge order). Then Bob removes `BIO_MEMBER_TOKEN` from the environment (walked through).
- **T36-37 · control-plane** · (N714, N707) dispatches T36-35's ops; routes a member's opening of an original through `file-safety.openOriginal`, never straight to `capture`'s `op=capture` (rev. 2 conflict (c)); its `FILE_SCANNER` binding; hands `file-safety.reputationTool()` to `acquisition.acquire` as it hands `ownHosts` (K1946 T2). (N721) routes `aikeepaway`. (N695, its share) `op=affordances` stops carrying the agent's `pack` and `fences` once agent-worker reads them apart (T36-24) · K1864, K1946, K1957 · req: routes, R41, BOB's wording · depends T36-35, T36-36. See Questions (9), (10).
- **T36-38 · legacy-ui** · (N711, its share) `civicos-ui/app.html` re-points from `MEMBER_TOKEN` to a member's session · K1936 · req: none · depends —.
- **T36-39 · installer** · (N711, its share) R16: stops generating and showing `MEMBER_TOKEN`; `newgroup/src/index.mjs` re-points. (N712, its share) `ARMED_SIGNERS` holds the fresh release key and the offline recovery key; the old development key's file deleted. (N710, N714, its share; rev. 2 §4) installs `file-scanner` (two containers, its cron, the `clamav/` and `reputation/` prefixes); the optional security-tools step (DEC-169) through `securityToolAdd` and `securityToolTest` (no keys asked for unless the administrator adds a tool); adds the `SECURITY_VPC` binding for a tunnel tool; checks that no Logpush job carries a per-request dataset of the copy's Workers (K1892; K1946 T8) · K1892, K1929, K1936, K1939, K1946 · req: R16 and new Rs, BOB's wording · depends T36-1, T36-5, T36-11.

**L11 merge order:** `modules.json.at-L11` order, except N711's callers before admission (they re-point before it refuses): op-grades → affordances → notice-producers → setup-page → instance-setup → op-declarations → legacy-ui → installer → admission → control-plane.

## Left out of T36 (one hard reason each)

| entry | item | hard reason |
|---|---|---|
| N551 (part) | the welcome and first-question wizards ordering what they offer by the self-description | a dependency not yet built: the wizard runner |
| N559 | DEC-138's stylesheet, fonts and icons for the member screens | a dependency not yet built: the new member screens (UX step 5) |
| N563 | money-checks M-C8 on a gold set of payments | a measurement: no gold set (K1506) |
| N566 | M-X1a's hub bound (connection-grammar, explore) | a measurement: real council volumes (K1726); BOB may set it from the desk figure instead (T35 checks item 17), Questions (14) |
| N572 | DEC-140's "Show me where" | a dependency not yet built: the wizard runner |
| N579 | contradiction's K6 prompt arm | a measurement (K1601 (3)) |
| N592 | the investigation study | Bob's question (P17): requirements follow his ruling on the study (T35 read "not a module job"; see Questions (13)) |
| N632 | jurisdictions' institution registry | a measurement: none measured |
| N641 | acquisition's NISO STS import (ST10) | a measurement: no NISO STS source for a standard Oakland adopts |
| N643 (part) | the vendor-model base with local changes (PO16) | a measurement: no vendor manual and update packet captured |
| N645 (part) | machine-raised "Noticed" disparities | a measurement: no gold set of discretion acts (K1491, K1504) |
| N647 | the Legal/Policy Lookup's policy and standard proposals (skills, answers) | a dependency not yet built: investigate mode (VF-4) and the member's account live (R-2 L-E5) |
| N650 | case-import's shared policy and standard sets | a dependency not yet built: LAW L5's pack path |
| N652 (part) | following whole policy portals and standards' new editions | a measurement: the sites' terms and fetch volume |
| N654 | membership's read of the website key's and join link's settings and history | a dependency not yet built: the key and link screens |
| N666 | a group's own place's rules | Bob's (DEC-151): after the first public release |
| N669 | the interface's translations (DEC-157) | a dependency not yet built: the word list (the design stream's); Questions (12) |
| N670 | DEC-127 (3), (6) | a dependency not yet built: N669 |
| N672, N673 | the path, tips, cards, links, explanation levels and `owed:infolevelset` (DEC-154, DEC-159–DEC-163); the rail's width (DEC-155) | a dependency not yet built: the new screens' shell |
| N683 | "Publish at…" in R34's step 5 | a dependency not yet built: its surface is the new screens' (N672) |
| N688 (part) | the archive screen (DEC-167; U96) over `archiveList` and capture's grouping | a dependency not yet built: the new screens |
| N698 (part) | the "Find in this" screen and its "Found by search" mark | a dependency not yet built: the new screens |
| N698 (part) | DEC-164 (8): the assistant's proposals search cannot match | a measurement: the capability ladders' extract rung |
| N701 (part) | `translationconfirm` in R27 (and the translation ops) | a dependency not yet built: N669 |
| N703 (part) | the Settings › Security screen (DEC-165) | a dependency not yet built: the new screens |
| N703 (part) | Cloudflare's blocked-request counts | a deployment or measurement: a zone and a read token per group's plan (`study-cloudflare-security.md` §3) |
| F1 (tail) | the query form of a credential refused by name | a deployment: one release carries both forms so installed callers move first (F1); T35's release carries both; Questions (11) |
| N708 | the subscription sign-in shares (N678): agent-runner's own sign-in in the member's container, agent-worker's relay, credentials R22's `subscription` kind retired, the `subscriptionsignin` spec and route | a measurement: M-Q2 on biosmoke7 needs the container deployed, held until T35's release (K1876, K1922); Questions (11) |
| N710, N714 (screens), DEC-169 | the warning before opening, the safe view's and safe copy's labels and one click to the original, Settings › Security › Security tools | a dependency not yet built: the new screens (as N703's Settings › Security); Questions (8) |
| N719 (part) | `personexpunge`'s dialog readable on a phone, "finish on a larger screen" | a dependency not yet built: its surface is the new screens' (N672) |
| N721 (part) | the keep-away reason readable by every member on Settings › The assistant | a dependency not yet built: the new screens; Questions (5) |
| N726 | DEC-174 (every act's button explains itself; one text per act keyed by op; U117's amendment) and DEC-175 (the setting's values, the explanation's timing) | a dependency not yet built: the new screens' shell (N672); Questions (3) |
| N728 (screens) | every table sorts by column; column headings explain; same-person acts' words; the timeline's undetermined order; U114's uncertain-item blocks and the money screen's registry row gaining seven ops; U115's words | a dependency not yet built: the new screens' shell (N672); U114 moved into row panels by DEC-176 (N732) |
| N732 | DEC-176: a table's rows acted on in place (panel beneath each row, hold strip, filter, phone cards) | a dependency not yet built: the new screens (the screens' modules) |
| N734 | DEC-177: one visual element, one explanation; a test failing on any nesting | a dependency not yet built: the new screens (the screens' modules) |
| N735 (screens) | the Spot-check's section heading explanations, help pages ("How spot-checks work"), the calculation screen's registry row gaining `testify`, the registry's screen `help` | a dependency not yet built: the new screens' shell (N672) |

**Carried from T35 and earlier** (`archive/T35.md` and earlier left-out tables): the measurement rows (C4 A11–A17, C8, T33-M1–M3), the real-group rows (T33-G1–G4), Bob's UX rows (T33-U1–U5, B4/B5, A54, B6–B10…, N487, H3…J11, N493 part, T27-1, C5), the dependency rows (N521, T33-X1, A8, A21, A22/A23 = installer R13, R24, A41, N538 (4)), the trigger rows (T33-T1–T5, J7, H13, T28-1, T33-B1) and the deployment rows (N540, T33-D1–D10, B1–B3, B11/C9, B16, C1–C3) keep their reasons unchanged; BOB re-reads them at the opening.

**Closed without a T36 entry:** F6, F8 (answered by Bob, K1936; their work is N711–N713, in T36). The virus package's modules (Bob's approval K1913; BOB's packaging K2008): in T36 as T36-5, T36-11.

## Entries carried from `next.md` (N706–N736)

Wholly in T36: N706, N707, N709, N711, N712, N713, N715, N716, N717, N718, N720, N723, N724, N725, N727, N729, N730, N731, N733, N736. In part: N710, N714 (screens left out), N719 (dialog left out), N721 (the Settings line left out), N728 (data share in, screens out), N735 (data share in, screens out). Left out: N708, N726, N732, N734. From T35's left-out table, now in: N597 (part, T36-26), N695 (part, T36-24, T36-37).

## P6 notes

Near or over about 4,000 if the jobs add as planned: **membership** 3,966 (names only, net about zero), **office-readers** ~3,700 (+ table cells), **publication** 3,716 (falls with the delegate), **retrieval** ~3,300 (+ N715's join and N729's read), **file-safety** 2,300–3,400 (new; rev. 2's estimate), **file-scanner** 2,100–3,400 (new; the whole catalogue, K1946 T5), **credentials** ~2,700 (+ counts read, keep-away), **acquisition** ~2,500 (+ reputation, N720). Each job reports if it would pass about 4,000; a split is BOB's (K617) before the job adds. BOB measures sizes on `tranche/T35`'s tip at the opening (K1821's rule) and replaces these estimates.

## Summary

**Jobs per layer:** L1 5, L2 3, L3 4, L4 1, L5 6, L6 5, L7 0, L8 4, L9 0, L10 1, L11 10. **Total 39.**

## Questions for BOB (BOB's to settle before the opening, P17; none is Bob's unless marked)

1. **N715, citation's share (T36-21).** Retrieval (L5) cannot read citation (L6) (P4), so `findIn`'s results cannot name a citation's recorder through retrieval. Which later module joins it (answers, control-plane, or the "Find in this" screen, which is left out)? If only the screen, citation's read has no reader in T36 and its share's hard reason is the new screens.
2. **Data shares whose surface is the unbuilt new screens.** N728's money trail read (T36-16) and N735's spot-check testimony (T36-19) are module reads the next.md entries put with screen work and gave the screens' shell (N672) as their hard reason. This draft carries the module reads (P19: they can be built and tested without a screen) and leaves the screens out. Confirm, or move both to the left-out table with the screens.
3. **N726 (DEC-174's one text per act, keyed by op, held for translation).** Could that table be held now (op-grades or affordances), with only its display left out? It also depends on N669's word list for translation. Left out whole here.
4. **DEC-173 and rev. 2.** Rev. 2's `file-safety` R8, R9 predate DEC-173 (two confirmations; refusal without a fresh ClamAV clean note). BOB re-words them before L3's START (rule 2); confirm DEC-169's finding-kinds table belongs in `file-safety`'s R24 table (N714 does not name its module).
5. **N721's homes.** next.md names instance-setup, credentials, control-plane, setup-page, op-declarations, but not which holds the keep-away setting and the `aikeepaway` act (reason required; who and when kept). `accountFor` (credentials, L2) must read it, so the setting is credentials' or record-core's; this draft assumes credentials holds the act. setup-page's share (T36-33) is unspecified in the source. Is "Settings › The assistant" a new screen (left out here)?
6. **N711's op-declarations share** is not specified (no line in K1936 names it). And does admission's refusal of `class:member` (T36-36) need a release between it and its callers' re-point (the deployment reason F1's tail uses), or is one tranche enough because no real group has installed (N713: "before the first real group installs")?
7. **N713's workflow** `.github/workflows/release-sign.yml` is under `not_product`: BOB writes it, or bundler's job? And N712/N713's Distribution canon section is BOB's text: when, before L1's START?
8. **DEC-169's screens** (opening a file; Settings › Security › Security tools): assumed to be the new member screens (left out). If they are legacy-ui or installer surfaces, they join T36.
9. **N695's other half.** After K1974's split, which module stops `op=affordances` carrying the pack: control-plane (assumed), `answer-envelope` or `store-door`?
10. **Routing and wiring of `file-safety` after the L11 split.** Rev. 2 §4 names control-plane for dispatch and the `FILE_SCANNER` binding; `store-door` holds R57's per-act resolution and plane owns `wrangler.jsonc` and the composition root (constructing `file-safety`, registering its `onReceipt`). Do `store-door` and `plane` need T36 shares? None is in this draft, since no source names one. Likewise, does `bundler` need a share for the new fleet member (`fleetbundles`' list, `deploybindings`' arms, as N696 added `SHEET_WORKER`)?
11. **N708 and F1's tail.** If T35's release is deployed to biosmoke7 at T35's close and M-Q2 is measured before L6's START, N708 joins T36 (T35 rule 6's form), and once installed callers carry T35's release, F1's tail may too. Both stay left out here as a measurement and a deployment.
12. **N669's word list.** If PR #13 brings the design stream's word list to `main`, N669, N670 and N701 (part) lose their hard reason.
13. **N592.** T35 gave "not a module job: a P18 study", which is not one of P19's reasons; mapped here to Bob's question (P17). Confirm, or run the study as P18 work and drop the row.
14. **N566.** BOB may set M-X1a's bound from the desk figure (T35 checks item 17), which would bring the entry in.
15. **Users of new reads not named in the source.** N725's user (standards R38 re-pointed to provenance's receipts by capture), N736's conformance share ("with conformance"), and N724's retrieval R74 share are not separate entries: standards and retrieval have T36 jobs, so their STARTs can carry the shares if BOB rules them needed; conformance has none.
