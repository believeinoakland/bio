# Plan T35 (draft)

**Status** · DRAFT by a worker for BOB #126, 2026-10-06, on `tranche/T34`, for BOB's review (§5.2, §5.9; P18, P19). To be re-read against `next.md` and T34's close before it becomes `next.md`'s T35 plan. Nothing here is committed or ruled.

**Sources** · `next.md` (N551–N692 as carried); `current.md` (T34's plan and its left-out table); `modules.json`, `layers.md`; rulings K1814–K1855; `TRANSITION.md` §6 (item 5: Bob's T35 head); `plan/draft-zip-architecture.md` (N688, ruled K1852); `plan/draft-T34-dec152-153-158.md` §4 (N686, ruled K1841). Sizes are this draft's count of `.mjs`/`.js` lines over each module's `paths` on `tranche/T34` today (the most specific path owns a file, K1821; tests and generated `dist/` excluded).

**At T35's opening (assumed):** PR #12 is on `main` (§5.7 (1)), so DEC-142 to DEC-163 are folded and "the DEC is not on `main`" is no hard reason any more. Layers 1–11 are open again, so "its layer closed in T34" and "arose during T34" (P10) are no hard reasons either.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T35 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`, ~680 lines of code; `app.html`) | stays | No T35 entry retires it. Hard reasons: Bob's (UX), K633 ("stays as it is … until the new interface replaces it"); and a dependency not yet built: the new member screens and their shell (N672, N559; the UX stream's step 5). Its DEC-149 rows were taken in T34 (K1849 (4)). |

## Bob's T35 head (TRANSITION §6 item 5)

N680 (security review, significant, K1831), N688 (ZIP archives, K1844, K1852), N686 (the assistant's model turn, K1837, K1841), N689, N690 (the L1–L7 DEC-149 re-sweep, with N682, N691, N692), N678 (subscription sign-in, K1819). Each sits in its modules' jobs below, in layer order; none is held back.

## Rules at the opening

0. **Bob's direction (K1862).** Policies, standards and ZIP archives are carried to the greatest extent the order allows; each left-out share names its hard reason and is re-tested at the opening. No release is made unless the measurement it yields lets a left-out entry into the next tranche.

1. T34's rules hold. Merge order within a layer is `modules.json` order, except where a layer's merge-order line says otherwise (an upstream engine or a re-pointing user first).
2. **N680, the security review (K1831).** A review, not a module job: threat model first (who reaches what; credential and session paths; captured and imported content, archives included (N688); the agent's reach and tools; secrets; supply chain; logging). BOB drafts it before the opening (P18). Its findings become entries in this plan's jobs at the opening, each in its module's one job; a meaning change goes to Bob with a recommendation (P17). A finding in a layer already started goes to T36 with that hard reason (P10). *(BOB: check: no draft exists in `build/plan/` today; if it is not ready by the opening, the opening does not wait (P19), and its findings take the first layers not yet started.)*
3. **DECs folded at the opening (§5.3, §5.9).** DEC-142 (N623), DEC-143 (N657), DEC-144 (N658), DEC-145 (N659), DEC-146 (N660), DEC-149 (N664, N682, N690–N692) and DEC-156 (N678), each worded by BOB into the named modules' requirements before that module's layer starts. DEC-152/153's model turn (N686) is worded under K1841 (rule 1: never a reason field; rule 7: group holdings only with the switch on).
4. **The L1–L7 DEC-149 re-sweep (N690; K1847).** T34's sweep covered L8–L11 (`draft-T34-dec149.md`) and named L5–L6 shares (T34-78, T34-86). BOB re-sweeps L1–L7 before L1's START, as for `draft-T34-dec149.md` (a worker, reviewed): every member-facing string that calls the group's Civicsmith "this instance", "this copy", "this plane" or "server" says "your group's Civicsmith" (or "this group's Civicsmith" for a reader with no credential, K1821), or needs no name; strings for the model or an operator stay (K1797). A module with rows and no entry joins its layer for that share (as T34-87). This draft's raw grep of L1–L7 source (string lines only, before reading each) has hits in: civil-time 4, record-grammar 1, signatures 3, bundler 20, pdf-pixels 1, pdf-worker 2, ocr-worker 1, sheet-worker 2 (L1); record-core 29, membership 13, credentials 21, promotion 22 (L2); host-governor 3, provenance 12, attestation 10, provenance-routes 5, capture-sources 26, acquisition 23, capture 16 (L3); calibration 8, reading-pipeline 4, extraction 13, content 9 (L4); events 1, connections 8, observation-log 7, standards 8, progressions 5, money 1, duties 1, explore 1, bias 6, query-language 1, retrieval 1, workbooks 2 (L5); citation 1, basis-versions 3, strength 1, contradiction 4, run-rules 13, ai-runs 20, run-productions 1, capture-requests 11, skills 21, answers 5, agent-harness 19, agent-model 3, agent-worker 71 (L6); intent 6, reevaluation 4 (L7). Most are operator- or model-facing; the sweep decides. *(BOB: check: the joiner jobs are added from the sweep, not from this list.)*
5. **N656 (K1763, K1772).** The format check's terms arm binds from T35 once its dry run (TC1) certifies it (P3). A process act, BOB's, not a job. *(BOB: check: TC1's status; until certified it stays opt-in.)*
6. **Accepted reds at the opening, by name:**
   1. Coverage: every id marked `*(not yet met: T35)*`, until its module's merge.
   2. Row census: rows T35's L3–L11 jobs add stay `awaiting stamp` until T36's promotion job (P4: promotion, L2, comes first). T35-11 stamps everything awaiting at T34's close and L1–L2's new rows.
   3. The UI's DEC-88 tests (Bob's), carried.
   4. From record-core's merge (T35-8) until control-plane's (T35-48): control-plane `lease.test.mjs`, which pins `ANONYMOUS_LEASE`'s old shape (N655). *(BOB: check at L2's START for any other pin of the `SETTING_*` shapes.)*
   5. extraction's six tests red since K1737 (afterread ×1, convert-chain ×2, pdfstructure ×1, read ×2), until T35-16.

## Entries

Each line is one job (P8): every T35 entry for that module. Fields: what (N-ids) · rulings · requirement change BOB writes before the job starts · depends on.

### L1

- **T35-1 · jurisdictions** · (N638, with N659's words) `standard_sources` holds policy series per issuer (AI, DGO, Special Order, Training Bulletin, BP/AR) with `cite` patterns and key segments, and standard issuers and designations; issuers of any `sector` (K1453), beyond R31's four levels; the first profile's Oakland series sourced to primary pages · K1713, K1722, K1724, K1740, K1742; DEC-145 · req: R31 and new Rs, BOB's wording (POLICIES L1–L2, STANDARDS L1–L2) · depends —. Not here: N632 (a measurement), N666 (Bob's, after the first public release).
- **T35-2 · civil-time** · (N690) its member-facing `why` and trace notes ("is disputed on this instance", "cannot be read on this instance", "counted on a correction that governs on this instance", "counted on a calendar corrected on this instance"; `calendar.mjs`:78, :112, :113, `recurrence.mjs`:197 by this draft's grep) say "your group's Civicsmith" or need no name · K1847, DEC-149 · req: none (DEC-149 cited; a test names each string) · depends —.
- **T35-3 · test-support** · (N688) `make-zip.mjs`, a fixture writer for hostile archives (overlap, duplicate names, central-directory/local-header mismatch, bit 3, ZIP64, encrypted, traversal names, a bomb), beside `make-pdf.mjs`; oracles Info-ZIP `unzip -t` and Python's `zipfile` · K1844, K1852 · req: a new R, BOB's wording · depends —. *(BOB: check: the file's path; test-support's `paths` list files, so its job adds the new one, K1043's form.)*
- **T35-4 · id-spaces** · (N639) recognises policy citations ("AI 4.12 §3", "DGO K-03", "SO 9196") and standard designations with edition ("NFPA 1710, 2020 edition") from N638's profile data · K1713, K1740 · req: new R, BOB's wording (POLICIES L1, STANDARDS L1) · depends T35-1.
- **T35-5 · ooxml** · (N688) `listArchive` (EOCD, ZIP64 locator and record, the whole central directory; one row per entry with its verdict; local headers cross-checked; overlap, out-of-range entries, several EOCD candidates and a directory disagreeing with its EOCD refused; by range reads over stored parts) and `streamMember` (inflate via `DecompressionStream("deflate-raw")`, SHA-256 and CRC-32 as it goes, stops at declared size + 1); CP437 names for the listing; the limits `ARCHIVE_ENTRIES_MAX` 10,000, `ARCHIVE_TOTAL_MAX` and `MEMBER_MAX` 256 MiB, `ARCHIVE_RATIO_MAX` 1,100:1, `ARCHIVE_DEPTH_MAX` 3, each published by name · K1844, K1852 · req: R3 amended (ZIP64 read, not refused), new Rs for the listing, the cut and the limits, BOB's wording · depends T35-3. ~1,003 → ~1,450 lines.
- **T35-6 · format-registry** · (N688) a `zip` entry (detect: `ooxml.discriminate`'s `format:"zip"`; parts: `listArchive`); office and ODF files keep winning detection first; R23's roster nine → ten · K1844 · req: new R, R23, BOB's wording · depends T35-5. `modules.json`: format-registry uses ooxml (an edge, BOB's, P17).
- **T35-7 · doctypes** · (N640, with N659's words) a `policy` reader beside `regulation`: header block (type, number, effective, supersedes, reference, coordinator, review due), numbered sections, definitions, applicability, responsible-party and action tables, timeframes; measured first on 50 captured AIs, DGOs and Special Orders · K1713, K1740 · req: new Rs, BOB's wording (POLICIES L2, PO13) · depends T35-1. *(BOB: check: that 50 such captures are held to measure on (`plan/study-policies/`); if not, the reader is a measurement and waits.)*

**L1 merge order:** jurisdictions → civil-time → test-support (its fixtures first) → id-spaces (reads N638's data) → ooxml → format-registry (reads ooxml's listing) → doctypes. Re-sweep joiners (Rule 4) as they complete.

### L2

- **T35-8 · record-core** · (N655) `ANONYMOUS_LEASE` and the `SETTING_*` refusals (`SETTING_BY_REQUIRED`, `SETTING_INVALID`, `SETTING_NAME_REQUIRED`, `SETTING_VALUE_REQUIRED`) get their check rows (`code`, `check`, `translation`, `detail`, DEC-49); every caller pinning the old shape re-points in its own T35 job (control-plane T35-48; others found at L2's START) · K1754 · req: BOB's wording (DEC-49 governs) · depends —. (N664's sweep rows, if any, Rule 4.)
- **T35-9 · membership** · (N664) member-facing messages, R108 and DEC-136's court sentence where held say "your group's Civicsmith", never "copy", "instance", "plane" or "server"; the term entry ("Your group's Civicsmith: Civicsmith installed in a Cloudflare account your group controls. Your group's records are held there and nowhere else.") · K1779, K1785, DEC-149 · req: R108, BOB's wording · depends —. **P6:** 3,966 lines; wording only, net zero; the job reports if it would grow. Not here: N654 (below).
- **T35-10 · credentials** · (N664) its messages, as T35-9. (N674) an in-plane read (never answered to a viewer) of the group key's suggestions switch (R37), so ai-runs' dispatch carries it for a `level: "group"` account instead of `false`; R35's "the shape agent-model R1 reads" re-worded to agent-worker R6's wire shape (`key` carried as `secret`). (N678, its share) holds only that a member is connected through their subscription, never the login (K1819) · K1798, K1804, K1819; DEC-149, DEC-156 · req: R35, R37's read, a new R for the connected state, BOB's wording · depends T35-9.
- **T35-11 · promotion** · (N553 tail) stamps every row awaiting stamp at T34's close (accepted red 4 of T34: rows its L3–L11 jobs added or re-worded, among them the L8–L10 DEC-149 re-wordings, K1845, K1846, K1855) and the rows T35's L1–L2 jobs add (N655's), so `test/system/row-census.test.mjs` is green; the catalogue version moves with it, and any pinned digest moves in its owner's job · K1542, K1545, K1855 · req: none (a stamp) · depends T35-8, T35-9, T35-10.

**L2 merge order:** record-core → membership → credentials → promotion last (it stamps the layer's rows).

### L3

- **T35-12 · provenance** · (N664) `captureGrade`'s "this instance fetched these bytes" (`index.mjs`:899, :905; LEG-EARNING #2 J1, K1799) and its other member-facing rows (Rule 4). (N688) route `unpacked` in `captureGrade`: the member's answer is the archive's, recursively to the depth bound, `route: "unpacked"`, a `basis` naming the archive, never stronger or weaker; the new receipt writer (R15); C-18.1 accepts `capture.method: "unpacked"` with a `container` block; R48's `via` · K1844, K1852 (Intake §3) · req: a new R, R15, R42, R48 amended, BOB's wording · depends —.
- **T35-13 · attestation** · (N688) `attestationsOf(member)` answers the archive's timestamp and co-archive as `inherited: {from, through}` · K1852 (1) · req: R7 amended, BOB's wording · depends T35-12.
- **T35-14 · capture-sources** · (N691) `drive.mjs`:216's `readDriveAddress` `why` says "your group's Civicsmith" or needs no name; with its other rows (Rule 4) · K1855, DEC-149 · req: none · depends —.
- **T35-15 · acquisition** · (N661) `profileOf`'s comment and `origin.test.mjs`'s header drop "or a knock" (capture R30). (N664) `checks.mjs`'s "in a form this instance does not …" (CAPTURE-REQUESTS #12, K1802). (N688) `unpack(store, {archiveSha, by})`, run after an acquire whose profile says `zip` (automatic within the limits, K1852 (2)) and as `op=unpack` for a held ZIP: each member filed under its own digest (8 MiB parts), one `unpacked` receipt each (`<address>#zip:<index>`, `zip:<sha>!<index>`), its provenance document with `container`, promoted at `collected` into the archive's bundle (Intake §4); a member already held is not filed twice, its receipt a corroborating observation (R2's one home); `MEMBER_CORRUPT`, `MEMBER_AMBIGUOUS`, `ARCHIVE_AMBIGUOUS`, `MEMBER_ENCRYPTED`, `MEMBER_METHOD_UNSUPPORTED`, `ARCHIVE_NOT_HELD` and each limit refused by name, never filed at a lower letter (K1852 (1)); a per-call budget with continuation (as R12); its check family (R29) · K1776, K1802, K1844, K1852 · req: a new R for `unpack`, R17 (the profile names `zip`), R25–R27 restated for members, BOB's wording · depends T35-12, T35-13 (and T35-5, T35-6, closed in L1). ~1,814 → ~2,270 lines. Not here: N641 (below).

**L3 merge order:** provenance → attestation → capture-sources → acquisition (it uses provenance's route and attestation's inheritance). Re-sweep joiners as they complete.

### L4

- **T35-16 · extraction** · (N636) six suites (afterread ×1, convert-chain ×2, pdfstructure ×1, read ×2) register doctypes' types through `registerDoctypes`, as docprofile no longer does (T34-8), clearing Rule 6 (5). (N664) `checks.mjs`'s "in a form this instance does not …" · K1737, K1802, DEC-149 · req: none · depends —.

### L5

- **T35-17 · events** · (N642, with N659's words) an act of discretion and a waiver as events of the power used (decider, subject, date, the provision as a `standards` key, stated reason, outcome; a waiver's scope, conditions, expiry); accreditation assessments as events citing the standards found unmet · K1713 (2), K1740 · req: new Rs, BOB's wording (POLICIES L3 PO6, PO7; STANDARDS L3 ST8) · depends T35-1. *(BOB: check: events (47) precedes standards (52), so the provision key is held as an opaque reference and never read through standards (P4).)*
- **T35-18 · observation-log** · (N664) `OBSERVATION_ACTOR_CLASSES.plane` and `OBSERVATION_AUTHORITY_KINDS.objective` where a member reads them (RUN-RULES #7 J1, K1801) · K1801, DEC-149 · req: none, or BOB's wording if a vocabulary's served text changes · depends —. 3,235 lines.
- **T35-19 · standards** · (N643, with N659's words) `family`; provisions and clauses with force read from the text and cited, a member confirming (K1722); `held: text | cited | absent` with the citer or the search, neither a measure until text is held, R2 kept for a measure (K1724); `copy` widened (in force, draft, superseded, production, vendor model); sight from the source through record-core's sight classes (K1740); versions from captures, `overrides {portion, until}`, `force_source`; `designation`, `edition`, `issuer` of any sector, `adoption`, `incorporates`, `access`, text only by a member's act (K1739); targets (metric, threshold, period, definition); bindingness per body from adoption, any other a labelled benchmark (K1723); a court or decree link to a policy portion (`law.mjs`:32) · K1713, K1722–K1724, K1739, K1740 · req: R1, R2, R9, R12 and its sight amended, new Rs, BOB's wording (POLICIES L2–L3, STANDARDS L2–L3) · depends T35-1, T35-4, T35-17. **P6:** 2,339 lines; the job reports if the wording's estimate nears 4,000, and BOB splits first. *(BOB: check: the entry names "law-relations at 2,290" for the split; no such module exists, standards measures 2,339, `law.mjs` 691.)* Not here: PO16's vendor-model base (below).
- **T35-20 · money** · (N635) imports through calc-grammar's index, not `calc-grammar/decimal.mjs`'s inner names · K1736 · req: none · depends —.
- **T35-21 · duties** · (N644) a power held links to the events that use it (N642); a policy's `review_due` held as the body's own commitment, an overdue review an occurrence shown "Noticed" (K1431, D241); an organisation's own policy becomes a duty only where K1440 allows. (N675) states `OCCURRENCE_KEY_RE` in a file that imports nothing of the record (`vocab.mjs`, re-exported from `index.mjs` unchanged) · K1713, K1740, K1799 · req: new Rs (POLICIES L3 PO6, PO9, PO10), BOB's wording · depends T35-17, T35-19.
- **T35-22 · bias** · (N682) `index.mjs`:469's lock-violation detail "a LOCKED instance statement": if member-facing, "your group's Civicsmith" or no name; with its other rows (Rule 4) · K1833, DEC-149 · req: none · depends —.
- **T35-23 · retrieval** · (N677) R69's `zone()` creates local-facts' instance (and its empty `local_fact_acts` table) on first read: worded, or the first read made lazy without a write · K1803 · req: R69, BOB's wording · depends —. *(BOB: check: the home; if the fix is local-facts', local-facts joins L5 before retrieval.)*
- **T35-24 · calculations** · (N645) the patterns of application: recipes over held acts by decider, subject and class, time, stated reason, relationship and outcome; consistency; before and after a change; missing or boilerplate reasons; waiver share; target "was it met?"; policy against practice; every measure with denominator, population and derivation; a benchmark comparison says "below", never "nonconforming". (N676) a third-party engine's input marked (`engine`, `engine_measured`) in `gradeFactsOf`, as R9 and R36 name it undetermined · K1713 (2), K1723, K1740, K1799 · req: new Rs (POLICIES L4, STANDARDS L3–L4), R9, BOB's wording · depends T35-17, T35-19, T35-21. Not here: the machine-raised "Noticed" disparities (below).
- **T35-25 · workbooks** · (N634) `ops.test.mjs` R15 reads `CALC`'s opaque form (minted opaque since T34-1), not a sequential id · K1732 · req: none · depends —.

**L5 merge order:** events → observation-log → standards (after events) → money → duties (after events and standards) → bias → retrieval → calculations (after events, standards, duties) → workbooks.

### L6

- **T35-26 · inquiry-grammar** · (N675) R15 imports `OCCURRENCE_KEY_RE` from duties' `vocab.mjs` instead of holding it beside an equality test, so the case checker stays small (0.6 MB, not 4.4 MB) · K1799 · req: R15 as worded · depends T35-21.
- **T35-27 · hypotheses** · (N658) a member revises their own note in place (no history kept) and deletes it for good (no marker); only the note's member; turning a note does not delete it · K1774, DEC-144 · req: R11–R15 amended, BOB's wording of DEC-144 · depends —.
- **T35-28 · run-rules** · (N686) a mode `draft`: interactive, writes no run row, read-only within `ASK_SCOPE` (answers R1), deployed by its own flag as R16's `ask` · K1837, K1841 · req: R16, R18 and a new R, BOB's wording · depends —.
- **T35-29 · ai-runs** · (N686) R48 and R52 count a draft's use to the member's day · K1837 · req: R48, R52, BOB's wording · depends T35-28.
- **T35-30 · capture-requests** · (N646) a "cited, not seen" policy opens a records request naming the citation; the request and its answer are the search a "not found" entry holds. (N692) `index.mjs`:864, :933's "this plane did not record why" say "your group's Civicsmith" or need no name · K1724, K1740, K1855 · req: new R (POLICIES L2, PO3), BOB's wording · depends T35-19.
- **T35-31 · skills** · (N686) a `writing_help` pack layer: only from what the member tells it and, with the member's suggestions switch on, what the group holds (K1841 (2)); never a new fact; firsthand words only as told; never in a field stating a member's reason for an act (K1841 (1)); every draft labelled, kept only by the member's act (K1364); with the Roles canon §3 rules 1, 7, 9, §5 and ASSISTANT-PILOT §3 amended at the fold, citing DEC-153 · K1837, K1841 · req: R5, R28–R35 and a new layer, BOB's wording · depends T35-28. Not here: N647 (below).
- **T35-32 · answers** · (N686) R1's `ASK_SCOPE` as the draft mode reads it · K1837 · req: R1, BOB's wording · depends T35-28.
- **T35-33 · agent-runner** · (N678) the hosted, unmodified Claude Code's own sign-in started for a member in that member's own container instance (AT-14), Anthropic's address handed to the member, the code from Anthropic's page delivered to that sign-in's prompt (AT-26), the result stored by the binary where it runs (AT-27), serving only that member (K1547, K1755); Civicsmith never reads, copies or stores it centrally (K1819); AT-14's Commercial Terms condition; U-7 (a)–(d) kept open in the register · K1804, K1819, DEC-156 · req: new Rs, BOB's wording · depends T35-10. *(BOB: check: K1804 names the container as first measured at the release (M-Q2); if it has not been measured by the opening, this share is a measurement and waits, and credentials' share still goes.)*
- **T35-34 · agent-worker** · (N686) a `POST /draft` entry beside R54's `/ask`, on the account `accountFor` answers. (N678, its share) relays the member's sign-in to their runner instance. (N586 part) agent-worker's re-export files `harness.mjs` and `subsession.mjs` and its stale negative controls go, now that control-plane's `members-pin.test.mjs` re-pointed in T34-60 · K1615, K1837, K1819 · req: R54 and a new R, BOB's wording · depends T35-28, T35-29, T35-31, T35-32, T35-33. *(BOB: check at L6's START that no importer of the two files remains (`grep` today: `members-pin.test.mjs`:8–9, cleared by T34-60).)*

**L6 merge order:** `modules.json` order: inquiry-grammar → hypotheses → run-rules → ai-runs → capture-requests → skills → answers → agent-runner → agent-worker last (it carries the mode, the count, the pack layer and the runner). Re-sweep joiners as they complete.

### L7

No entry names an L7 module. Its jobs are the re-sweep's joiners only (Rule 4: intent, reevaluation are candidates; K1809 read intent's "instance" as an objective's).

### L8

- **T35-35 · case-carriage** · (N688) a published case citing a member carries the archive, the member and its `container` record in its bag; the outsider's check is the bag's manifest, `unzip -p <archive> <path> | sha256sum`, and `openssl ts -verify` on the archive's token · K1844 · req: a new R, BOB's wording · depends T35-15. *(BOB: check: the research names "case-carriage / publication"; this draft puts it in case-carriage, which carries case files.)*
- **T35-36 · publication** · (N597 part) drops its delegates for the names moved to case-tensions (`index.mjs`:91–97 re-exports and the instance delegates, `caseTensions`, `attributionFacts`, `dischargeCaseFlags`) now that their importers re-point. (N649) published Criteria show a benchmark as "not binding on" the body and a copyrighted standard by edition, citation and access with only the quoted passages. (N687) R67's `SCHEDULED_CHECK_UNAVAILABLE` gets catalogue row C-122.5 (R33). (N681, its share) states the waiting edition (R66) in a read case-authoring can call, if none serves · K1643, K1723, K1739, K1740, K1833, K1839 · req: R33, R61, new R (STANDARDS L2–L3), BOB's wording · depends T35-19. **P6:** 3,579 lines (was 3,904 when N649 was held for a split; K1839); the delegates' removal offsets the display; the job reports if it would pass about 4,000.
- **T35-37 · docket** · (N685) `checks.mjs`:101, :131 (C-129) say what C-127.4 and C-127.12 say, the same way · K1834, DEC-149 · req: none · depends —.
- **T35-38 · public-read** · (N660) the product's description line ("Free software for groups that check whether government keeps its own rules and promises", and the second line where there is room) as the credit page's description · K1774, DEC-146 · req: BOB's wording · depends —.
- **T35-39 · ratification** · (N597, its share) reads `attributionFacts` and `dischargeCaseFlags` (`index.mjs`:603, :683, :834, :1175) from case-tensions, not through publication's delegates · K1643 · req: none (Uses re-worded) · depends —. `modules.json`: ratification uses case-tensions (88 < 95). *(BOB: check: that these are moved names (publication `index.mjs`:50 lists them as case-tensions'), and that T34-54 re-pointed queue-producers' `publication.caseTensions` read (`index.mjs`:2283); if an L11 importer still reads a delegate, publication keeps that one and its removal is T36's (the order, P4).)* 3,522 lines.
- **T35-40 · case-checker** · (N648) refuses a publication quoting more of a copyrighted standard than the passages a finding relies on, and "violated" or "nonconforming" against a benchmark · K1723, K1739, K1740 · req: new R (STANDARDS L2–L3), BOB's wording · depends T35-19.
- **T35-41 · case-authoring** · (N681) its acts know publication R66's waiting edition: `publishCase` refuses by name while an edition of the case waits (or authors the edition after it, BOB's wording), and `acknowledgeStatement` does not treat a waiting document as open · K1833 · req: BOB's wording · depends T35-36. Not here: N683 (below).

**L8 merge order:** case-carriage → **ratification before publication** (its re-point merges before the delegates go) → publication → docket → public-read → case-checker → case-authoring (after publication's waiting-edition read). Re-sweep has no L8 share (T34-87 covered it).

### L9

- **T35-42 · conformance** · (N651, with N659's words) refuses a nonconforming determination or comparison against a standard that does not bind the body; comparison rows for any actor's act; policy against practice with its denominator; the determination still judges an office's duty after publication (K102) · K1723, K1740 · req: its actor and new Rs (POLICIES L4, STANDARDS L4), BOB's wording · depends T35-19, T35-24.
- **T35-43 · action-clocks** · (N689) R11 also lists the entries a live deadline's `closures` (and `observed.closures`) reads, at their `list=<name>` paths, so a business-day count resting on a list can be confirmed · K1847 · req: R11, BOB's wording (a clarification) · depends —.
- **T35-44 · filings** · (N653) R8's counsel packet carries a copyrighted or paywalled standard as its edition, citation, access and the passages the finding relies on, never whole · K1739, K1742 · req: R8, BOB's wording · depends T35-19.

**L9 merge order:** conformance → action-clocks → filings (`modules.json` order).

### L10

- **T35-45 · following** · (N652) watches the published copy of each policy a group holds on a schedule, keeps every version seen, shows a change "Noticed" for a member · K1727, K1740 · req: new R (POLICIES L5 PO16, STANDARDS L5), BOB's wording · depends T35-19. Not here: whole portals and new editions (below).

### L11

- **T35-46 · affordances** · (N623, DEC-142) `personexpunge` a named exception beside `actionholdrelease` (DEC-113 tier): the full dialog states what is removed and from where, that no one can undo it, that the marker "Removed where the law requires, <date>, by <member>" stays, and that published cases change only through the docket; confirmed with a reason naming the law or order. (N657, its share, DEC-143) `personexpunge` shows the Irreversible weight. Grades the new ops (`unpack`, N688; the note revise and delete ops, N658; the sign-in op, N678) · K1700, K1774 · req: BOB's wording of DEC-142, DEC-143 · depends —. **P6:** 3,895 lines; if the dialog's text would pass about 4,000, BOB splits first (K617). *(BOB: check: the grading shares are this draft's inference from T34-75's pattern, not named in the entries.)*
- **T35-47 · op-declarations** · declares `unpack` (N688), the note revise and delete ops (N658), the op behind `owed:subscriptionsignin` (N678) · K1844, K1774, K1804 · req: BOB's wording · depends —. *(BOB: check: N658's and N688's op shares are inferred, as T34-58 carried the note ops.)*
- **T35-48 · control-plane** · routes `op=unpack` (N688), the note ops (N658) and the sign-in (N678); (N686) routes `groupdescriptiondraft` and `writinghelp` to agent-worker's `/draft` instead of answering `ASSISTANT_DRAFT_UNAVAILABLE` (R57); (N655) `lease.test.mjs` re-pins `ANONYMOUS_LEASE`'s row shape, clearing Rule 6 (4) · K1754, K1837, K1841, K1844 · req: R57 and routes, BOB's wording · depends T35-47. **P6:** 3,824 lines; wiring only.
- **T35-49 · plane** · (N633, unless T34-76 took it by a CHANGE) `plane/wiring.mjs` composes `reads({organisation, viewer})` from the store (captures placed as `staff_roster` or `org_chart` resolving to the entity; calculations' tables with roster-reader R6's roles) and registers roster-reader's `rosterSource(reads)` into people (R18), replacing the "held as a table, not read" source; `t33.test.mjs`:280–287 moves with it. (N686) R19's wiring of the draft path · K1730, K1849 · req: none · depends T35-48.
- **T35-50 · installer** · (N657, DEC-143) the short-name step shows the Irreversible weight with its permanence statement. (N660, DEC-146) the product's description line as the installer's · K1774 · req: BOB's wording · depends —.

**L11 merge order:** `modules.json` order: affordances → op-declarations → control-plane → plane → installer. *(N686's L11 share: instance-setup R65 and wizard-scripts R24–R25 already state the draft's checks and labels (K1849), so neither has a T35 job; BOB: check at L11's START.)*

## Left out of T35 (one hard reason each)

| entry | item | hard reason |
|---|---|---|
| N551 (part) | the welcome and first-question wizards ordering what they offer by the self-description | a dependency not yet built: the wizard runner (S2 is ruled: DEC-148, K1784) |
| N559 | DEC-138's stylesheet, fonts and icons for the member screens | a dependency not yet built: the new member screens (UX step 5) |
| N563 | money-checks M-C8 on a gold set of payments | a measurement: no gold set (K1506) |
| N566 | M-X1a's hub bound (connection-grammar, explore) | a measurement: real council volumes. *(BOB: check whether T33's or T34's release measured them; if so it enters L1 and L5.)* |
| N572 | DEC-140's "Show me where" | a dependency not yet built: the wizard runner |
| N579 | contradiction's K6 prompt arm | a measurement (K1601 (3)) |
| N592 | the investigation study | not a module job: a P18 study; its requirements follow Bob's ruling on its architecture (P17) |
| N632 | jurisdictions' institution registry | a measurement: none measured |
| N641 | acquisition's NISO STS import (ST10) | a measurement: no NISO STS source for a standard Oakland adopts |
| N643 (part) | the vendor-model base with local changes (PO16) | a measurement: no vendor manual and update packet captured |
| N645 (part) | machine-raised "Noticed" disparities | a measurement: no gold set of discretion acts for the false-alarm rate (K1491, K1504) |
| N647 | the Legal/Policy Lookup's policy and standard proposals (skills, answers) | a dependency not yet built (investigate mode VF-4; the member's account live, R-2 L-E5) and a measurement (the force labeller on 200 provisions) |
| N650 | case-import's shared policy and standard sets | a dependency not yet built: LAW L5's pack path has no entry |
| N652 (part) | following whole policy portals and standards' new editions | a measurement: the sites' terms and fetch volume |
| N654 | membership's read of the website key's and join link's settings and history | a dependency not yet built: the key and link screens; also P6 (membership 3,966) |
| N666 | a group's own place's rules | Bob's (DEC-151): after the first public release |
| N669 | the interface's translations | a dependency not yet built: the word list (the design stream's) |
| N670 | DEC-127 (3), (6) | a dependency not yet built: N669 |
| N672, N673 | the path, tips and cards; the rail's width | a dependency not yet built: the new screens' shell |
| N683 | "Publish at…" in R34's step 5 | a dependency not yet built: its surface is the new screens' (N672) |

**Closed without a T35 entry:** N564 (part), its library shipped by T34-80 (DEC-148) *(BOB: check it merged)*; N629, all its decisions ruled (K1740) and carried as N638–N653; N637, cleared by MONITORING #16 (K1847, K1855; `cadence.test.mjs`:300 registers doctypes' types); N684, BOB's wording at T34's close; N656, a process act (Rule 5); N667, N671, N679, moved into T34 (K1818).

**Carried from T34 and earlier** (`current.md`'s "Carried from T33" paragraph): the measurement, real-group, Bob's-UX, dependency and trigger rows keep their reasons unchanged, re-read at the opening.

## P6 notes

membership 3,966 (wording only), affordances 3,895 (N623's dialog; split first if it would pass ~4,000), control-plane 3,824 (wiring only), publication 3,579 (N649 in; delegates out), ratification 3,522 (re-point only), observation-log 3,235, standards 2,339 (N643; the wording's estimate decides a split). acquisition ~2,270 and ooxml ~1,450 after N688.

## Summary

**Jobs per layer:** L1 7, L2 4, L3 4, L4 1, L5 9, L6 9, L7 0, L8 7, L9 3, L10 1, L11 5. **Total 50**, plus the re-sweep's joiners (Rule 4) and any N680 findings.

**Entries carried (by layer; an entry in several layers counts in each):** L1 5 (N638, N639, N640, N688, N690; N659 with the constructs); L2 5 (N553, N655, N664, N674, N678); L3 4 (N661, N664, N688, N691); L4 2 (N636, N664); L5 11 (N634, N635, N642–N645, N664, N675–N677, N682); L6 7 (N586, N646, N658, N675, N678, N686, N692); L8 8 (N597, N648, N649, N660, N681, N685, N687, N688); L9 3 (N651, N653, N689); L10 1 (N652); L11 9 (N623, N633, N655, N657, N658, N660, N678, N686, N688). N680 at the head (Rule 2).
