# Draft: T18's sweep of "Not in T18" (K642)

**Status** · DRAFT by a worker for BOB #75, 2026-09-30, on `tranche/T18` (layer 1 closed, K641; layer 2 running: membership, record-core, promotion). Applies K642 to every entry of `current.md` "Not in T18 (for T19)" and every open `next.md` entry: an entry joins T18's unstarted layers 3–11 unless a hard reason holds: **(a)** the order (P4); **(b)** module size before its split (P6, K617); **(c)** a dependency on something not built, or built later in a way the order forbids; **(d)** one job per module (P8: layer 1 closed, layer 2 running); **(e)** a question that is Bob's (P17); **(f)** a deployment or a measurement. Sizes are own code, measured with `wc -l` over each module's `paths` less its `tests` on this branch today (e.g. actions 3,501, ai-runs 4,204, capture 3,704, publication 6,185, docprofile 4,060, control-plane 6,578, inquiry 3,542, extraction 3,534). Nothing here is applied: BOB adopts, changes or drops it, and records the plan change (P10, as K630).

Superseded by this sweep if adopted (each BOB's own earlier call, no longer backed by a hard reason under K642): K624 (5) (N405 to T19); K636 BOB-3 (scheduler to T19); K636's "Action entries to T19" and `current.md`'s "Layer 9: None in T18"; the membership-free fallback stands (K637 is a hard reason, (d)).

**Two splits proposed as new (K617, K624 (1) copy-then-delete, seams checked on imports only):**
- **capture → `acquisition` + `capture`.** `capture/acquire.mjs` (1,015) imports nothing of capture's own (only the catalogue, subresources, formats, odf, docprofile, jurisdictions, `drive.mjs`, `cdx.mjs`, `render.mjs`, host-governor, provenance: all earlier than capture); `capture/index.mjs` imports it. `acquisition` sits between `capture-sources` and `capture` in layer 3, no `from`, used by capture, extraction, ratification, monitoring, capture-requests, instance-setup. Every catalogue share capture could not take for size (C-83, C-48.1–.7, C-28.13, the user agent) is imported by `acquire.mjs`, so it lands in `acquisition`. Capture after T18: ~2,700 + ~215 = **~2,900**; acquisition ~1,015 + ~300 = **~1,320**. External importers of `capture/acquire.mjs`: `monitoring/index.mjs`:45, `ratification/ops.mjs`:21, `test/m/monitoring/tick.test.mjs`, `test/m/capture-requests/drain.test.mjs`; capture's job leaves `acquire.mjs` as a re-export of `acquisition` (control-plane's `decorateAct` precedent, no code held twice) until capture's next job.
- **ai-runs → `run-rules` + `ai-runs`.** `airun.mjs` (898), `ai-runs/checks.mjs` (502), `ai-runs/deployment.mjs` (124) and `ai-runs/skill-version.mjs` (66) import nothing from `ai-runs/index.mjs` (only the catalogue, `observation-log/vocabulary.mjs` and each other); `ai-runs/index.mjs` imports them. `run-rules` (the run vocabulary, bounds, states, deployment order and their rows, ~1,590) sits directly before `ai-runs` in layer 6, no `from`, used by ai-runs, run-productions, capture-requests, skills, agent-worker. ai-runs after: **~2,650**. Its later importers (`skillpack.mjs`, `skilldoctrine.mjs`, `run-productions`, `capture-requests`, `agent-worker/src/index.mjs`, `harness.mjs`, `store.mjs`) re-point in their own T18 jobs; ai-runs' job leaves `airun.mjs` as a re-export until its next job.

Both need the fold before their layer starts (requirements moved without change of meaning and renumbered, `modules.json` placed, as K624 did for action-clocks): `acquisition` **before layer 3** (layer 2 is running now), `run-rules` before layer 6.

## 1. SOFT entries, as additions to T18

Existing jobs are marked **(adds)**; everything else is a new job. Converts name the old suite and this module's share (`build/jobs/T17/legacy-tests.md`'s row; K619 (2)).

### Layer 3

- **host-governor** · Convert: `queue-conditions` (host-governor's share: the cool-off facts the CONDITION items read). **Size:** tests only, on 419.
- **capture-sources** · N242's share (`CAPTURE_CREDENTIAL` rows, as the DEC-49 guard prints them today). Convert: `drive-convert` (capture-sources' share). **Size:** ~20 on 2,245.
- **acquisition** (new; the capture split, K617, K624 (1)) · The split by copy (no `from`): `capture/acquire.mjs` with the capture Rs it runs (acquire, profile values, grades, reuse and site chrome, the self-link, archive lookup, render allowance) and their tests. Catalogue shares copied into `acquisition/checks.mjs` (K529: T19's layer 1 deletes; `gate.mjs` and `extraction/checks.mjs` still import them): C-83 `RENDER_CAPTURE_CHECKS`, C-48.1–.7 (`DRIVE_CAPTURE_CHECKS`' capture part), C-28.13, `CIVICOS_CONTACT_URL` and `civicosUserAgent`. The capture converts that prove acquire's Rs move here from capture's entry: `cap14-reused-from`, `d57selflink`, `framework-digest-audit`, `profile`, `d522-unattended-render`, `cap13-reuse-pages`, `drive-convert`, `daemon-token`, `capture-container-extent`, `subresources` (as `current.md` words each). Merge early for capture. **Size:** ~1,015 copied, ~300 moved.
- **capture** **(adds)** · After acquisition merges. **The split's deletion first:** `acquire.mjs` reduced to a re-export of `acquisition` for its later importers (ratification, monitoring, capture-requests' test; deleted by capture's next job), `capture/index.mjs` importing `acquisition`; the moved Rs' tests deleted. Then its entry as written, less the converts moved to acquisition. C-83 no longer waits. **Size:** ~2,700 after the deletion, ~2,900 after the entry.

### Layer 4

- **calibration** · Convert: `calibration` (calibration's share). **Size:** tests only, on 1,095.
- **extraction** · Converts: `fw19-extent-arms`, `calibration`, `drive-convert`, `readingname`, `capture-container-extent`, `d606-perpage-ocr`, `observation-content`, `testify`, `producer-provenance`, `reading-position-occurrences`, `reading-wire`, `tier2-wire`, `tier3-layer-parts`, `reading-position`, `textchain`, `extractrun` (extraction's shares). `extraction/checks.mjs`' `DRIVE_CAPTURE_CHECKS` import re-pointed to acquisition's copy. **Size:** ~5 lines of code on 3,534; 16 suites' tests: a heavy session.

### Layer 5

- **observation-log** **(adds)** · `LEAD_ID_RE` defined in `observation-log/checks.mjs` (copy; the catalogue keeps its own for `leadLegFindings` until inquiry takes it, map §4.2). **Size:** +5.
- **entities** · C-33.25 (`ACT_SHAPE_CHECKS`' entities row, ~7 lines) copied into its table (split table; T19). Converts: `readingname`, `meaningquery` (entities' shares). **Size:** ~15 on 1,249.
- **progressions** · N242's share (C-100's regions marked, the conscripted calls). Converts: `d266scope`, `queue` (progressions' shares; `queue` has no row). **Size:** ~30 on 1,615.
- **bias** · N242's share (`#promotionCheck`). Convert: `d84-case-manifest`. **Size:** ~20 on 1,803.
- **query-language** · N136's share: the `legs` field read through a registration inquiry fills (BOB words the R before layer 5). N137's share: the `capture:`/`connection:` fields read through retrieval's cached-field registration. Converts: `meaningquery`, `search`, `content-arm`, `meaningread`, `passage-arm` (the last two have no row). **Size:** ~60 on 2,680.
- **retrieval** · N137 (K75 (2)): a registration for cached fields (BOB words the R), which strength R23 fills in layer 6. Converts: `observation-content`, `observation-log`, `observation-meaning`, `meaningquery`, `rec108-cache-asof`, `content-arm`, `meaningread`, `passage-arm`. Merge early is not needed (its readers are in layer 6). **Size:** ~60 on 2,202.

### Layer 6

- **inquiry** · N405 (K593): inquiry registers the migrated `surfaced_in` arm of retrieval R56 itself; legacy-store's registration (`store.mjs` 549–553) and `#surfacedIn` (810–818) go (§12.2). Inquiry's grammar face passes `record.grammars()` to `checkBundle` (as promotion's gate does), so capture's C-2.7 catalogue copy can go at T19's layer 1. N136: R36's three `bundles` columns move to inquiry's own table with their migration, read by query-language's registration (R36, R40 re-worded by BOB). N242's share (`dispose`/`#dispose`). Converts: `content-extent-arms`, `content-extent`, `content-reads`, `caseproduction`, `publish`, `rec220-version-pin`, `transcribe`, `rec173-migration-replay`, `testify`, `testimonyaxis`, `audit-inheritance`, `inquiry`, `meaningquery`, `grounds`, `multifinding`, `reevaluation` (no row). **Size:** ~150 on 3,542 → ~3,700; 16 suites: the heaviest convert load of the sweep, converts it cannot finish deferred through BOB (P8).
- **citation** · Converts: `citeproject-inquiry`, `project-discoverable`, `refuse-gate` (with legacy-store's share of `refuse-gate`). **Size:** tests only, on 1,040.
- **basis-versions** · N411's share (`index.mjs`:675, :801, :828, `#moveVersionState`: state its own verdict or name the inheritance). N242's share (`FACT_UNAVAILABLE`; `is-act-no-basis`, N186) with N249's clause (C-33.40's `where` names inquiry's `actNoBasis` while basis-versions keeps a second site: one site, the row re-pointed, `awaiting stamp`). Converts: `conclude-project`, `current`, `d216-sharing.probe`, `sufficiency-state` (basis-versions' own answer; the catalogue's classifier stays, below), `versions`, `versionstate`, `conclude-project-arm`, `project-discoverable`. **Size:** ~40 on 2,057.
- **strength** · `STRENGTH_STATES` defined in strength (copy; `ratification/checks.mjs` re-points in layer 8; T19 deletes). N411's share (`index.mjs`:786, is-strength-bar-grade). N242's share (`#refusePairComposed`). N137: R23's cache table fills retrieval's cached-field registration. Converts: `d216-sharing.probe`, `publish`, `testimonyaxis`, `rec108-cache-asof`, `d280-strengthbar`, `grounds`, `partitionindependence`. **Size:** ~80 on 1,447.
- **run-rules** (new; the ai-runs split, K617, K624 (1)) · The split by copy (no `from`): `airun.mjs`, `ai-runs/checks.mjs`, `deployment.mjs`, `skill-version.mjs` with the ai-runs Rs they state and their tests; the copy's `AI_RUN_CHECKS` import re-pointed to observation-log's C-22 (layer 5), which is the catalogue share K636 left waiting. Merge early for ai-runs, run-productions, capture-requests, skills and agent-worker. **Size:** ~1,590 copied.
- **ai-runs** · After run-rules merges. **The split's deletion first:** the four files deleted, `airun.mjs` left as a re-export of run-rules for importers without a re-point yet (`store.mjs` is re-pointed here, §12.2), `ai-runs/index.mjs` importing run-rules. Converts: `airuns`, `d260-resume`, `run-conditions`, `airun`, `rec173-migration-replay`, `observation-log`, `project-disclosure`, `skillsequencing`, `extractrun`, `skillpack` (ai-runs' shares; those proving moved Rs go to run-rules' job). **Size:** ~2,650 after the deletion, ~30 written.
- **run-productions** **(adds)** · Its `airun.mjs` imports re-pointed to run-rules. **Size:** +5.
- **capture-requests** · After run-rules merges. The rest of C-28 (`CAPTURE_REQUEST_CHECKS` less C-28.13) copied into its table (promotion's `gate.mjs` still imports it); ✱ `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES`, `userAgentIsLegible` (its only product importer is capture-requests). Its `civicosUserAgent` and `RENDER_CAPTURE_CHECKS` imports, and `drain.test.mjs`' `acquire` import, re-pointed to acquisition; `airun.mjs` imports to run-rules. Convert: `leadslug` (capture-requests' share). **Size:** ~200 on 1,289.
- **skills** **(adds)** · Its `airun.mjs` imports re-pointed to run-rules. N157's remainder, if BOB picks it (§4): a render-only face (`renderPack` over the published catalogue and fences, importing no module index) for agent-worker's bundle. **Size:** +30–60.
- **agent-worker** **(adds)** · `index.mjs` and `harness.mjs` re-point `airun.mjs` to run-rules; with N157's remainder, R48 imports skills' render-only face, so the bundle carries what it runs (BOB updates the manifest's generated-artifacts row). **Size:** +10.

### Layer 7

- **reevaluation** **(adds)** · N242's share (its unclassified outcomes). **Size:** +20.

### Layer 8

- **ratification** **(adds)** · `ratification/checks.mjs`' `STRENGTH_STATES` re-pointed to strength; `ops.mjs`' `userAgent` import re-pointed to acquisition. N407, if BOB decides the viewer carries the agent credential (§4): R18's pre-flight holds a member-scoped agent to the machine fences from the viewer's `aiCred`, tested with a stub viewer (admission stamps it, layer 11). **Size:** +30.
- **review** · Converts: `d543-instant-precision`, `reviewcopy` (review's shares). Its re-points to membership's families wait (below). **Size:** tests only, on 1,010.

### Layer 9 (the Action layer, back from T19)

The five jobs of `draft-T18-recut.md` layer 9, as written there (reviewed, K624, K625), in the chain action-clocks → actions → filings → escalation → action-plans:
- **action-clocks** (new) · N-A20 and N-A15, as `current.md` "Not in T18" words them. **Size:** ~250 copied, ~250 written.
- **actions** · The split's deletion, then N-A4 less R50; converts `risk-tier`, `d526-refusal-order`; keeps `pendingClocks` (K625). **Size:** ~3,800–3,950 after: **at the mark** (§4).
- **filings** · N-A5, N-A18, `clockPropose` from action-clocks. **Size:** ~450–550 on 1,410.
- **escalation** · N-A6. Added: N242's share (its unclassified outcomes; 3-line regions). **Size:** ~100–140 on 1,421.
- **action-plans** (new) · N-A7, R1–R29 as folded. **Size:** new, 900–1,400.
- **conformance** · N242's share (`is-outcome-stated`; the 3-line regions; `NO_SUCH_PROJECT`'s translation identical to intent's). N249's clause: `determination_questions.opened` shares the case field's name (the job proposes a rename with its migration or shows them distinct: a QUESTION, BOB rules; N71's rule on interface names). **Size:** ~30 on 1,474.
- **consequences** · N242's share (codes minted outside their rows' regions). **Size:** ~20 on 1,032.

### Layer 10

- **monitoring** **(adds)** · `deadlineRecheck` reads `pendingClocks` from action-clocks (K625: actions keeps its copy until this job merges; deleted by actions' next job). C-48.8/.9 copied into monitoring's table (after BOB words R42 against its line 134, map §4.4); its `DRIVE_CAPTURE_CHECKS` and `civicosUserAgent` imports and `substanceDigests`/`profilesAsText`/`ODF_DIGEST_MAX` (and `tick.test.mjs`') re-pointed to acquisition. N242's share (orphaned `is-drive-tick` rows; `REFUSED` untranslated). Merge early for scheduler. **Size:** ~2,409 + ~150 = ~2,560.
- **scheduler** · N-A9 as written; convert `connection-derive-sweep` (as `current.md` words them). After monitoring's early merge. **Size:** ~50–70 on 366.
- **legacy-store** (found in `legacy-store.md` §4.4 step 1, not a swept entry: BOB's to keep or drop) · Delete the dead lines of §3 (351) and the 139 import names never read; runs after layers 3–9's §12.2 edits of `store.mjs` merge and before affordances' and control-plane's. C-33.41's `where` (`actNoCitation`) named for T19's catalogue job. **Size:** ~490 deleted.

### Layer 11

- **affordances** · N13's share (store map §4.1): an `affordancesOps` holding `affordancefacts`; the arm removed from `store.mjs` (3024–3032) without rewiring (control-plane spreads it). N70's N45 by the `d311-roster-affordances` convert. Converts: `caseproduction`, `conclude-project-arm`, `publish`, `citeproject-inquiry`, `d311-roster-affordances`, `skillpack`. Merge early for control-plane. **Size:** ~40 on 2,916.
- **tasks** · N410: `tasks.recentTasks` gains the assignees filter (the viewer's own and unassigned). N412: `TASK_NOT_YOURS`' two literal sites (`index.mjs` ~367, ~368) through the code's one helper. Converts: `d280-strengthbar`, `queue` (no row). Merge early for queue and control-plane. **Size:** ~30 on 953.
- **queue-producers** · N-A11 and N-A17 with their converts, as `current.md` "Not in T18" words them. After queue's R1 catalogue merges. **Size:** ~250–350 on 2,382.
- **queue** · N-A10 with its converts, as `current.md` words them. N410's share: the feed reads through tasks' new filter. Merge the catalogue early for queue-producers; merged whole before control-plane. **Size:** ~100–130 on 2,484.
- **instance-setup** · `setup.mjs`' `civicosUserAgent` re-pointed to acquisition. Converts: `risk-tier`, `d334-monitor-credential`, `inquiry`, `browse`, `group-public`, `livefire`, `subresources`, `installer` (instance-setup's shares). **Size:** ~5 on 2,863.
- **op-declarations** **(adds)** · N-A12's share: op specs and stamps for action-plans' fourteen ops, `actioncreate`, `action`, `actions`, `actionpressure`, `communicationprepare`, action-clocks' `reminderset` and `reminderanswer`. **Size:** ~2,100 copied, ~250 written.
- **admission** **(adds)** · N407's stamp, if BOB decides the viewer carries it (§4): a member-scoped agent's viewer carries `aiCred`. **Size:** +10.
- **control-plane** **(adds)** · After affordances, tasks, queue, op-declarations and admission merge. N-A12's share: action-plans' and action-clocks' check tables in R22's list; `plans` among `PROJECT_NAMING_READS` (R27). N13 (store map §4.1): constructs `queue` and `tasks` and runs their `migrate()`, spreads `queueOps`, `tasksOps` and `affordancesOps` in `controlPlaneRoutes`; `store.mjs`' imports of affordances, queue and tasks and `schema.mjs`:7, :21 go (§12.2); `index.mjs`:71's `Store.CAPABILITIES` read from membership. N413: the N402 pin requires ocr-worker's `NAMESPACES` to equal control-plane's own set (exported by name). N414 is already its `CHECK_FAMILIES` entry. **Size:** ~3,500 after the split + ~350 = **~3,850, near the mark** (§4).
- **legacy-index** **(adds)** · The four dead probes (`d460-fixture`, `d460-perpage-ocr`, `fw20-decode-census`, `ua-probe`; 496 lines, legacy-index.md §3). **Size:** +496 deleted.
- **installer** · N336 (DIST-15, R20: `PLANE_LIMITS` pinned to the plane's), after BOB words R20 before layer 11; the installer's bundle regenerated at the close (§14). **Size:** ~30 on 1,870.

## 2. HARD deferrals

| entry | reason | evidence |
|---|---|---|
| N-A13 (legacy-ui's action intake) | e | joins N389, UX, Bob's (K608 (4)); legacy-ui untouched (K633) |
| N-A14 (profile templates, holidays, measured offices) | e, f | templates are legal text Bob supplies or approves; holidays and offices need a source or measurement (`t18-entries.md` "Not in T18") |
| N-A19 (litigation-hold item) | e | the hold's act is Bob's doctrine (K624 (5), DEC-61) |
| running the planning skill | e, b | no requirement drafted (a new R's meaning is Bob's, P17); ai-runs' job this tranche is its split |
| affordances for `PLN-` subjects, the plan-page surface | e | UX, in the order Bob sets (K608 (4)) |
| joint action | e | deferred by Bob (K600 (c)) |
| N-A16 | — | no such entry in any file (the series skips it) |
| actions' deletion of `pendingClocks` | d | actions' one job (layer 9) precedes monitoring's re-point (layer 10); K625 |
| actions' C-2.10, C-94 and vocabularies (444) | b | actions ~3,800–3,950 after its T18 job; +444 passes 4,000 |
| REC-201 (`cpra_request`, `governingLawsOf`) | b, d | `ACTION_KINDS` is in the catalogue (`bio-checks.mjs`:533, layer 1 closed) within actions' 444-line share |
| publication's split and every publication share (14 converts, N242's share, `INSTALLATION_CHECKS`' re-anchor, index.mjs' public read path, `CASE_ROLES_DIVERGED`) | b | 6,185; its leaf files (`worker.mjs`, `container`, `inband`, `deliverer`, ~1,030) split cleanly but leave ~5,150; `publication/index.mjs` alone is 3,943 and no seam through it is drawn (§4 Q3) |
| `INSTALLATION_CHECKS` to control-plane | b, a | `publication/checks.mjs` and `test/m/publication/invariants.test.mjs` import it; publication (layer 8) cannot import control-plane and has no job before its split |
| docprofile's split, N404, N390's remainder, N21 (the no-view fallback), docprofile converts | d, b | layer 1 closed; 4,060 (callers already pass the view: `extraction/pipeline.mjs`:920, `monitoring`:399, `capture/acquire.mjs`:859) |
| membership's split, its eight families, C-33.28/.48, credentials' two families | d, b | membership running in layer 2 (K638); the seam failed (K637) |
| promotion's, case-authoring's (`fences.test.mjs`) and review's re-points to membership's families | c | the families stay in the catalogue until membership's split (K637) |
| membership (and credentials) converts | d | layer 2 running |
| N407 by "membership answering" | d | membership running; the viewer route is SOFT (§4 Q4) |
| promotion's split-table rows, C-18.6/.7, `CHECK_RETIREMENTS`, N221's gate fallback, N317's checks | d | promotion running in layer 2 (`gate.mjs`:240) |
| the stamp of rows changed at layers 3+ | d | promotion's one job is layer 2, stamping last (rule (4)) |
| record-grammar's second and last stages | d | layer 1 closed |
| T19 layer 1's deletion of every T18 copy | d | the catalogue's job is layer 1, closed (K529) |
| the extent algebra to text-chain; N416 | d | text-chain is layer 1, closed |
| content's extent core, C-45 | c | extraction (before content) stores `canonicalExtent`'s bytes, so the core leaves only after the algebra reaches text-chain (map §4.2); C-45 stays by K585 (3) until inquiry's grammar registers |
| connections' C-49, C-81 | c | the catalogue's content `refusal` (8173–8202) and inquiry's leg grammar read them in the file; they leave after inquiry's grammar registers (map §4.2) |
| inquiry's catalogue share (C-2.8 grammar and 1,419 lines) | b, c | inquiry ~3,700 after T18; +1,419 passes 4,000; and after basis-versions registers (map §4.2) |
| basis-versions' catalogue share (C-25, C-50, C-27.15, the version, sufficiency and boilerplate helpers) | c | `basisVersionFindings` is called inside inquiry's `checkBundle` arm (`checkInquiryBasis`), and a grammar claims only a whole arm (K640); `test/m/promotion` imports it (layer 2) |
| N155's `SUGGEST_CHECKS` | c | the catalogue's arm reads `SUGGEST_KINDS` and C-27.15 in the file until basis-versions' share moves (map §4.2) |
| N211 | — | carried: ratification deletes `SUBJECT_POSITIONS` and `caseEditionClaimed` (layer 8); affordances and case-authoring already read ratification's |
| pdf-pixels, pdf-reader, subresources, text-chain converts | d | layer 1 |
| legacy-store's convert shares | c, d | each goes with the module extracting its code: covered above where that module has a job (provenance, promotion, inquiry, strength, retrieval, citation), else record-core's `auditPass` and mint ledger or membership (layer 2) |
| N303's remainder, N317, N320, N71, N144, N232, N241, N371, N389 | e | Bob's (doctrine, requirement meaning, UX) as `current.md` lists them |
| contradiction R41 and the K5 arms, DIST-14, N75, N34 | f | each needs a deployment or a measurement (N34, N75 are also pdf-worker and image-codecs, layer 1: d) |
| N22 | f, d | needs a non-root runner; test-support is layer 1 |
| N26 (office-readers), N31 (bundler), N70's legacy-checks and promotion shares | d | layer 1 or 2 |
| N57, N248, N279, N68, N70's legacy-index, legacy-tests and legacy-ui shares | e | the old suites are not run and are deleted at the release Bob calls (K619, K633, K635); legacy-ui untouched (K633) |
| N70's skills share (the doctrine's source) | e | Bob's skills question 1 |
| N70's legacy-store `auditPass` scan, membership bounds, promotion's `fact` | d | `auditPass` is record-core's move (layer 2); membership and promotion running |
| N175 | e | the process repository's revision (P3), not this build |
| N113, N110, N116, N118, N96, N123 ("Left from T6") | — | already in `archive/next-applied.md`: the line is stale |
| N4 ("oakland" in `readingNamePlan`) | — | no `readingNamePlan` in `bio-plane/src`: met, for `next.md` |

## 3. Resulting roster

- **L1** (closed, 5): record-grammar, legacy-checks, jurisdictions, ocr-worker, text-chain.
- **L2** (running, 3): membership, record-core, promotion.
- **L3** (5; was 2): host-governor, provenance, capture-sources, acquisition (new module), capture.
- **L4** (3; was 1): calibration, extraction, content.
- **L5** (7; was 2): entities, connections, progressions, bias, observation-log, query-language, retrieval.
- **L6** (10; was 3): inquiry, citation, basis-versions, strength, run-rules (new module), ai-runs, run-productions, capture-requests, skills, agent-worker.
- **L7** (1): reevaluation.
- **L8** (3; was 2): ratification, case-authoring, review.
- **L9** (7; was 0): conformance, consequences, actions, action-clocks, filings, escalation, action-plans.
- **L10** (3; was 1): monitoring, scheduler, legacy-store.
- **L11** (10; was 4): affordances, tasks, queue-producers, queue, instance-setup, op-declarations, admission, control-plane, legacy-index, installer.

**57 jobs** (24 today: 23 + membership, K638), 33 added (11 of them the Action layer and the two splits: action-clocks, actions, filings, escalation, action-plans, scheduler, queue, queue-producers; acquisition, run-rules, ai-runs); 56 without the legacy-store job. Merge-early chains added: L3 acquisition → capture; L6 run-rules → {ai-runs, run-productions, capture-requests, skills, agent-worker}, with run-productions → {skills, agent-worker} as today; L9 action-clocks → actions → filings → escalation → action-plans; L10 monitoring → scheduler; L11 tasks → queue (catalogue early for queue-producers), affordances, then op-declarations → admission, all merged before control-plane. One file, one editor: `store.mjs` is edited in L5 (observation-log), L6 (inquiry, ai-runs), L8 (ratification), L9 (action-plans), L10 (legacy-store, last in its layer), L11 (affordances before control-plane); BOB serialises any two in one layer.

## 4. Size risks and BOB's rulings

**Size risks (P6).** actions ~3,800–3,950 (at the mark only because of the split; BOB checks at its first checkpoint). control-plane ~3,850 after this sweep's adds (and the composition root, ~170, would pass the mark in T19: plan its seam then). inquiry ~3,700. extraction 3,534 (code unchanged). Session load: inquiry (16 suites), extraction (16), ratification (17, unchanged), acquisition (10); converts they cannot finish go through BOB (P8).

**For BOB's ruling (P17: all BOB's; none is Bob's):**
1. The two splits: adopt `acquisition` (capture) and `run-rules` (ai-runs) and their names, fold their requirements and `modules.json` before layer 3 and layer 6. Without the capture fold before layer 3, capture's catalogue shares revert to (b) and acquisition leaves; without run-rules', ai-runs' entries and the C-22 re-point revert to (b).
2. Record the reversals: K624 (5) (N405), K636 BOB-3 (scheduler), the Action layer to T19.
3. Publication: commission a seam read of `publication/index.mjs` (3,943) before layer 8; if a three-way seam holds (K637's test), its entries join layer 8 by copy-then-delete.
4. N407: the viewer carries the agent credential (admission stamps, ratification reads; SOFT) rather than membership answering (d).
5. N157's remainder: skills' render-only face (SOFT) or agent-worker reading the rendered pack from `op=affordances`.
6. Word before the layer: query-language's and retrieval's registrations (N136, N137; before L5), inquiry R36/R40 (L6), monitoring R42 against line 134 (L10), installer R20 (N336; L11).
7. The two extraction maps' moves (`legacy-store.md` §4.4, `legacy-index.md` §4.4; K639 plans them for T19) were not swept as entries: most need seams BOB words (store map §4.2), but the plain §12.2 moves to modules with a T18 job (index.mjs' `registeraudit`/`attest`, capture's dispatch lines, `governorOp`, `pdfstructure`, `linkproject`, `caseratify`/`ratify`, `monitor`, instance-setup's dispatch lines) have no order barrier (map §4.1): add them under K642, or leave them to T19's plan.
8. The legacy-store dead-code job (layer 10) and legacy-index's probes: kept or dropped.
9. `next.md` housekeeping: N373–N399 were carried by T17 and are still listed; N4 and the "Left from T6" line are stale.
