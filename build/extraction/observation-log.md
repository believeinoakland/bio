# observation-log — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `7d91579` (after membership's early merge) by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (51,006 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (16,591), `airun.mjs` (2,551) and `index.mjs` (13,438); the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/observation-log.md` (R1–R28); K4, K6, K23, K31, K49, K61, K64, K71, K73 and K76 apply, and N39. The module exports `observationLogOf(ctx)`, its one instance per Durable Object `ctx`, reaching `record-core`, `membership` and `content` through their factories and registering its writers with `provenance`, `extraction`, `entities` and `connections` (K61, K31); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]`: the C-22 and C-54 rows are in the catalogue. Nothing moves from `index.mjs`.

## 1. What moves to `observation-log`

| what | where today | lines | moves |
| --- | --- | --- | --- |
| REC-93 header, `#lookAuthority`, `#observe`, `#observationReferent` | store.mjs | 42579–42690 | yes, as `observe` (R2–R4); `#lookAuthority` goes with the drain to `capture-requests` (§2) |
| `#observeExtraction` | | 42692–42784 | yes (R6), registered on `extraction`'s reading notice |
| `#observeIndexed` | | 20478–20592 | yes (R7), on `extraction`'s index notice |
| REC-94/REC-92 header, `#missingCauseFrom`, `#missingContentCause` | | 42786–42895 | yes (R11); `retrieval`'s draft reads both from here |
| §5 header, `#frontierLatest` | | 43078–43110 | yes, as `latest` (R9) |
| `#frontierVerification` | | 43172–43187 | yes (R10) |
| `#observationBundles`, `#frontierDocumentVisible` | | 43215–43379 | yes, as `rowVisible` and `registerAuthority` (R13); its `sweep` arm's `capture_requests` read and its `run` arm's `aiRunLog` call become registered resolvers (N39) |
| REC-95 header, `#observeReaderRun`, `#observeResolutionAttempt`, `#observeConnectionDerivation` | | 43726–43895 | yes (R8), on `extraction`'s notice, `entities.onResolveAttempt` and `connections`' notice |
| `#missingCauseSet` | | 43966–44002 | yes (R11) |
| MK-4 header, `#leadRefusal`, `#leadFor`, `#leadVisibleTo`, `#leadReach`, `leadShare`, `lead`, `leadLook`, `LEAD_LOOK_OUTCOMES`, `#leadReferentVisible`, `leadRead`, its bounds | | 22551–22902 | yes (R14–R19); `#positionalMember` is `membership`'s |
| dispatch: `lead`, `leadlook`; `leadshare`; `leadread` | | 50331–50349, 50359–50365, 50402–50405 | yes (K3) |
| the vocabulary (`OBSERVATION_LEVELS` … `OBSERVATION_SUBJECT_KINDS`, coverage), the content axis (`CONTENT_AXIS_STATES`, `contentAxisFor`, `contentObservationsFor`), the meaning level (missing-row causes, one-sided evidence, `causesNotRuledOut`, the watermark rule, `readerRunObservation`, `resolutionObservation`, `derivationObservation`, `derivationStatement`) | airun.mjs | 106–1404 | yes (R1, R6–R8, R11, R12); a file `ai-runs` owns (§5.2) |
| `refusal`, `OBSERVATION_REFERENT_FAULTS`, `observationReferentFault`, `checkObservation`, `checkCondition` | airun.mjs | 1931–2127 | yes (R2); `checkBound` (C-22.5) stays with `ai-runs` |
| C-22.1–C-22.4 rows; C-22.6; C-22.9 and C-22.10 | bio-checks.mjs | 7150–7196, 7211–7234, 7302–7396 | yes (R26), split from `AI_RUN_CHECKS` by the first job to move, numbers unchanged |
| `LEAD_ID_RE`, `LEAD_CHECKS` (C-54.2–C-54.10) | bio-checks.mjs | 14127–14226 | yes (R26); C-54.1's row and `leadLegFindings` stay with the leg grammars |

**Schema (K4).** `observation_log` with its three indexes (schema.mjs 3182–3261); `leads` and `lead_shares` with theirs (3462–3504). `lead_shares` is in `legacy-store`'s `declarePurge` list (store.mjs 873), `observation_log` and `leads` are whole-store entries (892); the job removes them there when this module declares its own (R23, K23).

**Measured size:** store.mjs 1,233 (569 without comment-only and blank lines), airun.mjs 1,496 (481), bio-checks.mjs 266 (117), schema.mjs 123 (38): about 3,120 lines, about 1,210 of code.

## 2. What stays, or goes elsewhere, and why

| what | where today | lines | goes to | why |
| --- | --- | --- | --- | --- |
| `op=frontier`: `#frontierPage`, `#frontierFetch`, `#frontierNeverLooked`, the bounds, `#frontierContent`, `#missingMeaningCause`, `#frontierMeaning`, `#frontierInternet`, `FRONTIER_INTERNET_NOTE`, `frontier`; dispatch `frontier` | store.mjs 43112–43170, 43189–43213, 43381–44614 less the writers, 50505–50515 | 1,116 | `retrieval` (proposed; §5.4) | each arm reads other modules' tables (`links`, `register`, `capture_text`, `readings`, calibration drift, `resolutions`, `connections`, `leads`) beside the log; `retrieval` uses all of them and this module; with them here the module is about 4,230 |
| `contentAxis` | 42897–43076 | 180 | `retrieval` (K73) | it reads R9, R11 and R12 |
| MK-7 attribution: `ATTRIBUTION_LEVELS`, `observationsNamingAuthor`, `#attributionInForce` … `attributeObservation`; dispatch `attribute`; `ATTRIBUTION_CHECKS` (C-92); `observation_attributions` | store.mjs 21682–21943, 50350–50358; bio-checks.mjs 13891–13997; schema.mjs 3602–3621 | 398 | `publication` (§5.1) | it concerns a member's authored observation (testimony), not the log; it reads and re-authors `case_documents` (layer 8) |
| `testimonyReach`, `testify` and its `extract` row (22285) | 21643–21680, 22094 | — | `provenance` (K49) | testimony; its `extract` row becomes this module's writer on provenance's receipt of an authored capture (R5's route) |
| the capture-request drain's five looks and `#lookAuthority` | 41688–41851, 42593–42612 | — | `capture-requests` | a later module calling `observe` |
| `#aiRunAppend`, `#aiRunSearchState`, `#aiRunTerminate`, `aiRunLog`; the `ai_run_log` fold migration | 44629–, 44703, 44741, 46980; 1410–1454 | — | `ai-runs` | the run's log; the fold reads `ai_runs` |
| `recordCapturedLocator`'s look | 37635 | — | `provenance`, via R5 | K49's `onReceipt` |
| `recordMonitorLook`, `recordReuseVerdicts` | 47321, 47411 | — | `monitoring`, `publication` | later modules calling `observe` |
| `index.mjs`: the lead ops' table entries, gates and author stamps | index.mjs | — | `control-plane` | K3 |

## 3. Callers to rewire

Each calls a moved method or reads a moved table today, and calls `observationLogOf(ctx)` after.

- `#observe`: `#observeIndexed` (20582), `testify` (22285), `leadLook` (22806), `recordCapturedLocator` (37635), the drain (41688, 41726, 41759, 41827, 41850), `#aiRunAppend` (44630), `recordMonitorLook` (47362, its `MAX(seq)` at 47370 through `#observationReferent`), `recordReuseVerdicts` (47446).
- The writers: `promote`'s calls to `#observeIndexed`, `#observeExtraction`, `#observeReaderRun` (19985, 20001, 20018) become `extraction`'s notices; `testify` (22273); `#observeResolutionAttempt` in resolve (26046); `#observeConnectionDerivation` (26511).
- Direct SQL on `observation_log`: `#contentAxisTally` (2532, `retrieval`), `#searchedForCase` (10129, `publication`), `connectionsFor` (26580), `#counts` (32066–32093), `#indexStateOf` (38161, `content`), `#aiRunSearchState` (44705), `#aiRunTerminate` (44768), `aiRunLog` (47056). A later module takes R9's reads; the two earlier ones cannot (§5.3).
- `leads`: `#frontierInternet` (44298–44363) through `leadReach` (R19); `#counts` (the lead counts, 32072–32093).

## 4. Old-battery tests that anchor on the moved source

Source-reading suites and negative controls that re-anchor with the move (`legacy-tests` entries, K53): `observation-log.test.mjs`, `observation-content.test.mjs`, `observation-meaning.test.mjs`, `lead.test.mjs`, `leadslug.test.mjs`, `leadslug.control.mjs`, `nc-rec93.mjs`, `nc-rec94.mjs`, `nc-rec95.mjs`, `nc-rec103.mjs`, `nc-rec110.mjs`, `nc-rec129.mjs`, `nc-rec63.mjs`, `nc-mk1.mjs`, `nc-mk4.mjs`, `casesearched.test.mjs` and `.control.mjs`, `d241-derivation-stated.test.mjs` and `.control.mjs`, `airun.test.mjs`, `run-conditions.test.mjs` (the `ai_runs` reader census), `derivation-bounds.test.mjs`, `meaning-bounds.test.mjs`, `project-sight.test.mjs` and `.control.mjs`, `provenance-marker.test.mjs`, `rec116-route-marked.test.mjs`, `skilldoctrine.test.mjs`, `skillpack.test.mjs` (they import the vocabulary from `airun.mjs`), `verdict-excluder.control.mjs`, `versions.test.mjs`, `hygiene.test.mjs`, and `civicos-ui/check-refusal-codes.mjs`/`check-semantics.mjs` (which walk the C-22 and C-54 rows and `LEAD_LOOK_OUTCOMES`). Suites driving `op=frontier` (`frontier-chunk`, `frontier-internet`) follow `retrieval` if §5.4 holds.

## 5. Undetermined, conflicts, and code others could claim

1. **Attribution is `publication`'s, not this module's.** "Observation" names two things: a row of this log, and a member's firsthand observation (testimony, Member Knowledge §2). MK-7's act chooses how a published case shows who said a testimony. It reads and rewrites unsigned `case_documents`, reads `members`' cover and handle, and walks `inquiry_basis` through `testimonyReach`, all later layers. Proposed: `publication`, with C-92 and `observation_attributions` (398 lines).
2. **`airun.mjs` is `ai-runs`' file.** About 1,500 of its 2,551 lines are this module's vocabulary and rules, and this module is earlier. A job writes only its own paths. Proposed: BOB assigns `airun.mjs`'s observation half to this module (the job moves it into `bio-plane/src/observation-log/` and leaves `airun.mjs` re-exporting it until `ai-runs`' extraction), recorded as a file-ownership ruling (P17).
3. **Two readers earlier in the order.** `content`'s `#indexStateOf` (38161, layer 4) and `connections`' `connectionsFor` (26580, layer 5, before this module) read `observation_log` directly, and cannot use this module. Proposed: each offers a slot this module fills (K31's pattern): `content` asks a registered index-state reader, and `connections` a registered derivation-statement reader.
4. **The condition vocabulary is `queue`'s.** `checkObservation` checks C-22.4 against `QUEUE_CONDITION_KINDS` from `queuestate.mjs` (layer 11). Proposed: the condition kinds move to this module (their first consumer), and `queuestate.mjs` re-exports them.
5. **Where `op=frontier` goes.** The design puts the frontier with the log (§5, §8 item 1), and the parallel `retrieval` draft does not claim it. Proposed: `retrieval`, for size (P6) and because its arms read other modules' tables; the alternative is this module at about 4,230 lines with added uses of `extraction`, `calibration` and `capture`.
6. **N39.** The `sweep` arm reads `capture_requests` (`target`, `lead_inquiry`) and the `run` arm calls `aiRunLog`; both become resolvers registered by `capture-requests` and `ai-runs` (R13), with `legacy-store` registering them until those extractions.
7. **R3 is a defect, not a question.** `checkObservation` admits `NEVER_LOOKED` (it is a key of `OBSERVATION_STATES`); only `leadLook` refuses it. The job adds the refusal and a negative control.
8. **Branches.** D-681 (`land/worker/D-681` @ `ae80ca25`, `op=leadlist`) and D-682 (`land/worker/D-682` @ `1d635376`, `LEAD_VOCABULARY`) are judged at the job; both stack on D-194.
9. **Other claimants.** `retrieval`: the frontier arms and `contentAxis`. `publication`: attribution and the `searched` section. `provenance`: testimony. `ai-runs`: the run's log and the rest of `airun.mjs`. `capture-requests`: `#lookAuthority` and the drain's looks. `membership`: `#positionalMember`.
