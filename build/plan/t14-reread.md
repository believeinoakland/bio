# T14 draft re-read against T13's close (K424's practice)

**Status** · A checking worker for BOB #66, 2026-09-29, on `tranche/T13` @ 35c0d1bdcc (= `origin/main`, T13 closed, K449). Read: `build/plan/draft-T14.md`; its wordings `draft-T14-wordings.md` (K444), `-2.md` (K445), `-3.md` (K448); `archive/T13.md`; `build/jobs/T13/*.md`; `next.md`; `build/modules.json`; `build/requirements/`; the code. Line numbers are on this commit.

For every job: (a) each entry is still owed unless said; (b) each cited site is present, at the line given where it moved; (d) each next free id holds (no requirements file marks a retired id at or above it); (e) each new `uses` edge points to an earlier module.

**Next free ids, all still free:** record-core R63; membership R86, R87; promotion R51; host-governor R27; capture R64; extraction R64; progressions and filings need none; bias R44, R45; ratification R17; publication R48, R49 (N345 not folded); monitoring R47–R49; queue R41, R42; instance-setup R43; control-plane R35. The row numbers are also free: C-102.11–.14, C-56.3–.5 (only C-56.1 and .2 are held), C-96.14, and C-19.2.

**New `uses` edges, all to an earlier module:** progressions (32) → promotion (22), for N340. filings (57) → promotion (22), for N331. control-plane (65) → capture (26), for N347. None is in `modules.json` yet. extraction's and host-governor's N339 lines take `doAnswer` handed in, so they need no edge.

---

## Layer 1

### legacy-checks — CHANGE

- **N325's share: CONFIRMED.** `checkBundle` still calls `checkInboxGrammar` at `bio-checks.mjs`:4770; the function is at :4453. The export's readers (`queue/index.mjs`:30 and :3715, `test/inbox.test.mjs`:27) keep it one tranche, as drafted.
- **N212: PARTLY MET.**
  - The `where` share was met in T9 (LEGACY-CHECKS #4; stamped 1.39.0, `gate.mjs`:249). C-32.6 (:7149) and C-33.14 (:7316) name `src/case-authoring/index.mjs #publishCase > is-machine-publish` and `> is-publish-statement`, and both regions exist (`case-authoring/index.mjs`:166, :234).
  - Owed: only the empty `CASE_DERIVATION_CHECKS` export with its header (:7055–7068). That is the same removal as N251's share.
- **N214: PARTLY MET.**
  - Both rows are met. `CASE_MEMBER_REFUSED` is C-102.10 (:11395, T9). `MINT_EXHAUSTED` is record-core's C-59.6 (T13, K430), and review's C-87.12 is retired.
  - Owed: the stale headers and the empty `ATTRIBUTION_CHECKS` with its header (:9840–9869).
  - `INSTALLATION_CHECKS`' header (:7755–7773) still says the family keeps C-68.1–.4 and describes the bootstrap complaints. It holds only C-68.1; C-68.2–.4 are control-plane's `BOOTSTRAP_CHECKS`. That text is N334's share, below.
- **N334's header share: CONFIRMED.** The `INSTALLATION_CHECKS` header is above. `AI_CREDENTIAL_CHECKS`' header (:6870–6904) still places the reach gate in `src/index.mjs`; `AI_SCOPE_BEYOND_MEMBER_REACH` is in `control-plane/checks.mjs`:372.
- **N251's share: CONFIRMED.** No reader of the two empty exports is left. `invariants.test.mjs` and `checks.test.mjs` read the catalogue as `import *`, and every other `CASE_DERIVATION_CHECKS` import is case-authoring's own.
- **K408 (4), C-96.1's catalogue copy: CONFIRMED owed**, at :10082–10088. Membership mints `NOT_AN_ADMIN` from its own row, and nothing in `src/` reads the catalogue's copy. Removing it breaks three things, which the draft does not say:
  - membership's own `test/m/membership/not-an-admin-visibility.test.mjs`:66–72, which asserts that the two copies agree. It goes red from this merge until membership's merge. See membership.
  - `test/d134-custodial-refusals.test.mjs`:58 and :136–140 (twelve checks named). This is legacy-tests'.
  - the R50 census suite's "C-96.1 held twice" acceptance, and the guard's staleness arm. Both are legacy-tests'.
- **N242's share (THEME_CHECKS duplicates C-81.11–.14): NOT OWED.** It was met in T10 (N125): the rows are held once, in the catalogue's `THEME_CHECKS` (:10636–10654), and connections' `THEME_WITHDRAW_CHECKS` is a view of them, not a copy (`connections/themes.mjs`:23–27; `gate.mjs`:274). Drop the line.
- **Omitted optional share (wordings §1, N128):** the `REGISTRATION_CHECKS` header, now at :11316–11321, says the listener rows follow later. Once N128 lands they are membership's C-102.11 and C-102.12, so the header can say so. It is optional.

## Layer 2

### record-core — CONFIRMED

- N342 is owed: there is no `registerCounts`.
- The sites have not moved: `seedMintLedger` :376, `registerAuditCheck` :767, `declarePurge` :853, and C-59.6 in `checks.mjs`:16.
- Merged early (K425).

### membership — CHANGE

**Every entry is still owed:**
- N128: `listenerRefusal` still reads the catalogue's `REGISTRATION_CHECKS` at :136.
- N329: `activeAdmins` has no `ORDER BY` (:2218–2223).
- N335: the bare `NOT_A_PARTICIPANT` and `NOT_PROPOSED` are still minted.
- N327: `ADMIN_ONLY` and `AI_CREDENTIAL_ORG_NOT_ADMIN` are still minted.

**Sites moved by T13's merge (the wordings cite the old lines):**

| site | old line | new line |
|---|---|---|
| `listenerRefusal` | :100–147 | :133–166 (the region is :147–166) |
| `ADMIN_ONLY` | :1796, :1998 | :1820, :2022 |
| `AI_CREDENTIAL_ORG_NOT_ADMIN` | :2916 | :2929 |
| `activeAdmins` | :2194–2199 | :2218 |
| `projectLeave`, `projectRemove`, `projectOwnerAdd` | :1676, :1722, :1758 | :1700, :1746, :1782 |
| `NOT_PROPOSED` | :2294 | :2307 |

**Add, for K408 (4)'s other half:**
- R84's closing sentence goes: "For one tranche the row is held twice … `legacy-tests`' census accepts that one duplicate by name (K408)".
- The test at `not-an-admin-visibility.test.mjs`:66–72 drops its catalogue-copy assertion.

Without this, membership's suite is red from legacy-checks' merge onward, and BOB's `test/m/` run at layer 1 shows it. Either merge membership's test change before legacy-checks' removal, or accept the red by name for layer 1 only.

### promotion — CHANGE (one addition)

- **Entries: CONFIRMED.**
  - N335: `NOT_A_PARTICIPANT` is at `promotion/index.mjs`:854.
  - N340: `REOPENABLE_FROM` is at :41 and is still a mutable array.
  - N341: the stale comments are now at `gate.mjs`:305–306 and :321–322 (cited as 304–305 and 321).
  - The stamp's list is right for layers 1–2 as drafted: C-87.12 retired, C-69.4, legacy-checks' C-96.1 departure (which moves d470), C-102.11–.14, C-56.3–.5 and C-96.14.
- **Add N350** (R50's wording at the next stamp; see the last section).
- **Correct "Not in T14".** These rows change after this stamp and so wait for T15's stamp, not only C-118.1:
  - queue's new C-19.2 (layer 11);
  - bias's C-26.20 and intent's C-111.16 retirements (layers 5 and 7, N327);
  - `checkBundle`'s changed composition (wordings §3).

## Layer 3

### host-governor — CONFIRMED

`answerOf` is at `host-governor/index.mjs`:325–330, used at :343–344 and :358. It still answers `{silent: true}` with no status and no correlation. R27 is free.

### capture — CONFIRMED

- N339: the four relays are still at `capture/ops.mjs`:27, :106, :135 and `doorbell.mjs`:96.
- N347:
  - `NOT_FOUND` is minted only by `evidenceAbsent` (`ops.mjs`:45–46).
  - `NO_SUCH_KNOCK` is at `capture/index.mjs`:365–369.
  - The rows are at `checks.mjs`:19–27.
- R64 is free.

## Layer 4

### extraction — CONFIRMED

- `ask` is at `extraction/ops.mjs`:10–15, used at :32 and :43.
- The R31 test lines are at `test/m/extraction/pdfstructure.test.mjs`:55 and :68.
- R64 is free.

## Layer 5

The draft lists bias before progressions. `modules.json` orders progressions (32) before bias (33). Nothing depends on the order.

### progressions — CONFIRMED

- R35 still reads "(`DISPOSITIONS`, exported as the one list)", and `progressions/index.mjs`:41 re-exports its own list.
- The new edge to promotion points to an earlier module.

### bias — CHANGE

- **N326: CONFIRMED.** There is no `settled`, and the `uncleared` pattern is at `bias/index.mjs`:926.
- **N327: CONFIRMED.** The site is at :286, and C-26.20 at `checks.mjs`:533.
- **N343: CONFIRMED.**
  - bias has no `migrate()`; `biasOf` is at :990.
  - `settled_kind` is at `schema.mjs`:104.
  - legacy-store's `ADDITIVE_COLUMNS` line is at `store.mjs`:733, and the `migrate()` calls are at :746–762.
- **N242's share (`#promotionCheck`): NOT OWED.** It was met in T10 (BIAS #2, `build/jobs/T10/bias.md`:13).
  - C-26.x's `where` names the public `promotionCheck > bias-set-refusal` (`bias/checks.mjs`:450), and the region is at `index.mjs`:165–171.
  - It is not among the DEC-49 guard's four carried failures.
  - Drop the line.

## Layer 7

### intent — CONFIRMED

- N327's site is at `intent/index.mjs`:274 (cited as 266–270), and C-111.16 at `checks.mjs`:90–94.
- R9's text to replace is present.

## Layer 8

The draft lists ratification before publication. `modules.json` orders publication (49) before ratification (50).

### publication — CONFIRMED

- **N339:** the relays are at `publication/worker.mjs`:392, :405, :522 and :633, unchanged.
- **N346:** every site in wordings 3 is as cited:
  - `projectStage` is at :1133.
  - The unread document is at :1156–1157.
  - The failed-read defect is still present: `catch` returns `undetermined` at :1179, before the ratified check at :1185.
  - The cap is at :1189.
  - `#workProducts` is at :1203.
  - C-2.9 is at `bio-checks.mjs`:3641.
  - R44–R47 and the Suggestions are at `publication.md`:69–71, :101 and :120–121.
- R48 and R49 are free.

### ratification — CONFIRMED

- The N339 relays are at `ratification/ops.mjs`:92, :176, :207, :348, :427, :451 and :700, unchanged.
- R17 is free.

## Layer 9

### filings — CONFIRMED

- R3's "the producing group;" is present.
- The code still says "no producing group is recorded" (`filings/index.mjs`:352–353).
- The edge to promotion points to an earlier module.

## Layer 10

### monitoring — CHANGE

- **N330: CONFIRMED.** `floor()` is at :1459, `archiveTick` at :1501 and `subjects()` at :1152 (cited as 1461, 1503, 1149).
- **N339: CONFIRMED.** The `!out.answered` relay is at `monitoring/index.mjs`:2135 (cited as 2137; :2137 is the malformed-body silence).
- **N242's share: NOT OWED.** It was met in T11 (MONITORING #3, `build/jobs/T11/monitoring.md`:15):
  - no bare `REFUSED` is minted;
  - the `is-drive-tick-export` and `is-drive-tick-bytes` regions (:624–666, :671–702) are governed, and their rows are at `bio-checks.mjs`:8235 and :8249.
  - Drop the line.

### legacy-store — CONFIRMED

- **N331:** the `producingGroup` argument is now at `store.mjs`:585 (cited as 588).
- **N342:**
  - `queueOf` is at :599 and the seed at :800.
  - `#MINT_LEDGER_LIVE` is at :2018, with its TASK row at :2022.
  - `#counts` is at :2072.
  - The four reads are at :2150, :2194, :2205 and :2207.
  - bias's spread is at :2318, and purge's `removed` starts at :2434.
- **N343:** the lines are at :733 and :746–762.

## Layer 11

### queue — CONFIRMED (sites moved)

- **N325:** the call is at :3715 and the import at :30.
  - R35's test is now at `test/m/queue/inbox.test.mjs`:169 (cited as :135).
  - The drain's `refused` assertion is at :53–56.
- **N326:**
  - `#resolvedLately` is at :3087.
  - The `bias_debts: {read: false}` placeholder is at **:3102** (wordings §4 cites 3596).
  - The `test.todo` is at `feed.test.mjs`:293.
  - R39's mark reads *(not yet met: K102)*. The wording sets it to N326.
- **N329:** the site is at :3686.
- **N330:** the front-matter and `source_reachability` reads are at :1952–2019, and the constants at :2101–2102.
- **N342:** the TASK mint is at :3769 and `queueOf` at :4108.

### instance-setup — CONFIRMED

- The relays are at `setup.mjs`:2475, :2479, :2487, :2496, :2569, :2580, :2588 and :2610.
- `instanceSetupRoute` is at :2420, and `instanceSetupStore` at :2439 (T15).
- R43 is free.

### control-plane — CONFIRMED

- `MODULE_CHECK_FILES` is at :776, and it has no capture entry.
- `dec49Decorate` is at :811, `doAnswer` at :903 and `storeSilent` at :932.
- `caseReader` is at :668.
- The silences that drop the correlation are at :1394, :1471, :1583, :3447 and :3478. Those that carry it are at :640, :948 and :3502.
- `dispatch.mjs`'s `Store` is at :157.
- R23's text is present, and R35 is free.

### legacy-index — CONFIRMED

- The ten relays are at `index.mjs`:214, :235, :317, :351, :424, :482, :542, :547, :562 and :666. That is wordings 2's list; wordings 1's (238 … 690) is stale.
- The `instanceSetupStore` wrap is at :3 and :111–112.

## Last: legacy-tests — CHANGE (name the anchors)

The draft's line stands, and T14's anchors are wider than it names.

**N327: at least eight suites, not three.** Besides the three named:
- `machine-attest.test.mjs`:485;
- `bias.test.mjs`:867 (C-26.20);
- `project-sight.test.mjs`:95 and :312–313;
- `identity-claims.test.mjs`:246 and :357;
- `projects.test.mjs`:497.

**N335:** `projects.test.mjs`:193 (`projectowneradd` becomes `TARGET_NOT_JOINED`).

**C-96.1's departure:**
- `d134-custodial-refusals.test.mjs`:58 and :136–140;
- the census suite's held-twice acceptance, and the guard's staleness arm.

**C-29.12 left unminted after membership's R62 converges:** accept it by name in `check-refusal-codes` and the census (wordings §2).

**N347:**
- `test/pdfstructure-op.test.mjs`:126;
- `check-refusal-codes`' re-pin (one departed and one arrived).

**N353** (its own deferred fixture), below.

## Omitted job

**legacy-ui (optional, N347; wordings 2's table):**
- The fixtures `civicos-ui/test/snapshot-render.test.mjs`:93, :168 and `artifact-fetch.test.mjs`:21, :44 imitate the plane's `NOT_FOUND`.
- Either add the job or list it under "Not in T14".
- `app.html` does not branch on the code.

No job in the draft lacks an entry. Once the three N242 lines are dropped, bias and monitoring each keep other entries.

---

## Changes to the draft

1. Status line: add `draft-T14-wordings-3.md` (N346, K448) to the wordings that fold.
2. Drop all three "N242's share, if still owed" lines, for legacy-checks, bias and monitoring. None is owed: they were met by N125 (T10), BIAS #2 (T10) and MONITORING #3 (T11).
3. legacy-checks:
   - N212 is only `CASE_DERIVATION_CHECKS` with its header; its `where`s were met in T9.
   - N214 is only the stale headers and `ATTRIBUTION_CHECKS`; both rows are met (C-102.10; C-59.6).
   - Optionally add N128's `REGISTRATION_CHECKS` header note.
4. membership: add K408 (4)'s other half. Strike R84's held-twice sentence, and drop `not-an-admin-visibility.test.mjs`:66–72's catalogue assertion. Otherwise it is red from legacy-checks' merge.
5. promotion: add N350. "Not in T14": T15's stamp also takes C-19.2, the C-26.20 and C-111.16 retirements and `checkBundle`'s composition, not only C-118.1.
6. legacy-tests: name the wider anchors above (N327, N335, C-96.1, C-29.12, N347) and N353.
7. legacy-ui: add N347's optional fixtures, or list them under "Not in T14".
8. Put the jobs in layer order: progressions before bias, publication before ratification. Stale line citations are listed per job above; none changes an entry.

## N350–N353

- **N350** (promotion, R50's census wording: the sort's third key, "then by the line itself", and the excluded file set): **fits promotion's T14 job**, at its stamp. It is requirement wording on the census the stamp re-pins, and the suite already pins both.
- **N351** (entities: bound `aliaswithdraw`'s and `entity`'s two scans): **does not fit.** T14 plans no entities job, so it waits for entities' next job, or needs one added.
- **N352** (one hidden-set helper for legacy-store, queue and retrieval): **does not fit yet.** BOB must word the provider first, and its earliest owner, retrieval (layer 5), has no T14 job. Queue's and legacy-store's shares follow the provider.
- **N353** (legacy-tests: project-sight's `promote-stamp-dropped` fixture throws SURFACE_NO_RUN): **fits legacy-tests' T14 job.** It is its own deferred flaw.
