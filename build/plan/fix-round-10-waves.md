# Fix round 10 of T51: the waves (fixture round and cause jobs)

**Status** · Final edition for BOB on `prep/starts-r10-final`, rebuilt on the fixtures check V3 (civicos-process `main` `b5531c09f8`: 2,816 live findings in 106 modules), `fixtures-T51/part-1.md` to `part-5.md`, `op-tables.md`, K5051 to K5060, K5044 to K5046, K4990 to K4996, K3518. One START per job: `build/plan/starts-T51-F10/<module>.txt` (123). Words for UX-DESIGN: `build/plan/fix-round-10-words.md` (unchanged). Earlier editions: `a1fbdcdda1`, `1ded35c1a0`.

## 1. How jobs were placed

- **Batched by dependency** (K5051): a provider's fixture is merged in an earlier batch than the users whose own lines re-point to it (a hill-climb over the 88 fixture jobs, at most 20 sessions per batch: 258 of the 284 own FIX-E lines of those jobs are done in their own job; the rest arrive as a CHANGE). A provider with no live user left gets no fixture job. V3 changed the provider set: `content`, `money`, `basis-versions` and `reevaluation` are now providers with live users; `local-facts` has none and is dropped; `admission` keeps its job for cause R27b.
- **Jobs:** batches 1 to 5 hold 99 jobs: 88 fixture jobs (`store-assembly` and `store-request` new, the enabling modules `wizard-scripts`, `translations`, `signin-door`, `plane` and `control-plane` in batch 1, every provider with a live user) and 11 cause-only jobs (italics). A module with both fixture and cause work runs once, in its fixture batch. Batches 6 and 7 hold 24 Wave B jobs (modules whose remaining work is their own re-points, op tables or module changes, which need the providers and the world merged first); they are in the Wave B column of the table.
- **Placeholders gone.** Every START now carries the module's own V3 lines, classed by parts 1 to 5: FIX-E (re-point to a provider's published fixture), FIX-L (a `fixtures-contract` marker and the provider's `fixtures-run`), CODE (a code the product really gives), the residual lines of part-5 that owe a `fixtures-generic` or `fixtures-own` marker, and the lines that stay listed. Each START that may add a marker says: list every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).
- **Screens modules (K5054).** Their op-table entries (1,834 over the nine screens modules and `interface-shell`) are re-pointed to `storeWorld()` (op-tables.md §5.3, §5.5). `store-request` (batch 3, over `store-assembly`, batch 2) provides it, so every screens START names `store-request` in its dependency. Cause jobs of screens modules (screens-inquiry, -intake, -daily, -entry, -action) do the cause now and the op tables later, as a CHANGE; the Wave B screens jobs (batch 7) re-point the tables with interface-shell's `boot({door})` (batch 6).
- **Batch size** at most 20 sessions (K4215). A job opens when the batch before it is merged. **Model (K3518):** haiku-5-5 for test-only and mechanical jobs, sonnet-5-5 otherwise, the default model only for the new modules `store-assembly` and `store-request`.
- **Outside a module's `paths`.** Where a job would need an edit outside its module (the two row deletions in `control-plane/owner-ops.mjs`, a test in another module, a figure in another module) its START says REPORT to BOB; BOB makes it at the merge.

## 2. Batches

| Batch | Jobs | Modules (modules.json order; cause-only jobs in italics) |
|---|---|---|
| 1 | 20 | *`subresources`*, `pdf-pixels`, `pdf-worker`, `file-scanner`, `record-core`, `credentials`, `provenance`, `capture-sources`, `file-safety`, `standards`, `retrieval-browse`, `retrieval`, *`inquiry-grammar`*, `conformance`, `wizard-scripts`, `translations`, `admission`, `signin-door`, `control-plane`, `plane` |
| 2 | 20 | *`office-readers`*, `pdf-reader`, `ocr-worker`, `membership`, `ai-accounts`, `promotion`, `acquisition`, `capture`, `sources`, `duties`, `contradiction`, `run-productions`, `case-carriage`, `publication`, `publish-schedule`, `case-checker`, `case-import`, `actions`, `store-assembly`, *`screens-inquiry`* |
| 3 | 20 | *`csv-reader`*, `doc-clean`, `attestation`, `reading-pipeline`, `extraction`, `events`, `lines`, `money`, `people`, `inquiry`, `steps`, `strength`, `ai-use`, `capture-requests`, `answers`, `ratification`, `case-inputs`, `escalation`, `store-request`, *`screens-intake`* |
| 4 | 20 | `member-roster`, `entities`, `progressions`, `bias`, *`calculations`*, `basis-versions`, `ai-runs`, `agent-runner`, `intent`, `docket`, `public-read`, *`case-catalogue`*, `case-account`, `case-authoring`, `consequences`, `action-clocks`, `action-plans`, `plan-work`, `answer-envelope`, *`screens-daily`* |
| 5 | 19 | `sheet-worker`, `project-roster`, `content`, `money-checks`, `agent-worker`, `reevaluation`, `network-notices`, `case-disclosures`, `review`, `case-check`, `monitoring`, `following`, `link-sweep`, `action-producers`, `instance-setup`, `store-door`, *`interface-assets`*, *`screens-entry`*, `screens-action` |
| 6 | 19 | `connections`, `observation-log`, `workbooks`, `citation`, `question-explorer`, `agent-steps`, `action-records`, `action-holds`, `action-replies`, `filings`, `scheduler`, `tasks`, `machinery-producers`, `queue-producers`, `notice-producers`, `queue`, `interface-shell`, `installer-steps`, `installer` |
| 7 | 5 | `screens-wizards`, `screens-settings`, `screens-investigate`, `screens-publish`, `journey-check` |

Sequencing:
1. **Batch 1 holds the enabling jobs.** `wizard-scripts` (receives `ADMIN_ACTS`/`ADMIN_SCREENS`), `translations` (declares `interfacewords`), `signin-door` (declares `subscriptionsignin`) and `plane` (`OWNERS` gains `signin-door`; its LOAD-RED 5 (1) study first). **Coupled merge:** signin-door's export and plane's `OWNERS` entry arrive together. The two row deletions in `control-plane/owner-ops.mjs` are BOB's at the merge (K5052 (4)); each job REPORTS the exact row.
2. **`store-assembly` (batch 2) then `store-request` (batch 3)** are the critical path: the world is store-request's (K5054); interface-shell's `boot({door})` (batch 6) follows it, then the screens' op-table jobs (batch 7 and the CHANGEs of the cause jobs). BOB adds both `modules.json` entries.
3. **Gates:** `interface-assets` (R32, batch 5) starts only when UX-DESIGN's scroll rule is merged. `screens-daily` (batch 4) draws R17a after `retrieval-browse` (batch 1). `screens-inquiry` (batch 2) gets R30b's screen half, R23's `repairs` draw and R9's draw as a CHANGE after `inquiry-grammar` (1), `inquiry` (3), `basis-versions` (4) and reading-pipeline R62 (3) have merged.
4. **Contract lines wait on each other** (`orphan-run`, `contract-no-run`, `idle` until both sides exist); each START says which may remain. `journey-check` (batch 7) REPORTS before it touches `storeWorld()` (it imports no module, K3100).

## 3. The 123 jobs

`#` = position in `build/modules.json`. Fixture work: `publish` = fixtures the job publishes, `run` = contracts it runs, `re-point` = its own lines done in the job, `markers` = lines owing a `fixtures-own`/`fixtures-generic` marker, `op tables` = entries to `storeWorld()` (Wave B jobs do them in the job; the others get a CHANGE later). Later = lines whose provider merges in its batch or after (a CHANGE to the same job).

| Batch | # | Module | Role | Causes | Fixture work | Later | Model | START bytes |
|---|---|---|---|---|---|---|---|---|
| 1 | 13 | `subresources` | cause only | R15 | - | - | sonnet-5-5 | 3,423 |
| 1 | 29 | `pdf-pixels` | provider + cause | R6 | publish 3 | - | sonnet-5-5 | 6,085 |
| 1 | 32 | `pdf-worker` | provider + cause | R8 | publish 1, markers 1 | - | sonnet-5-5 | 5,498 |
| 1 | 35 | `file-scanner` | provider + cause | R11c | publish 1 | - | sonnet-5-5 | 4,699 |
| 1 | 37 | `record-core` | provider | - | publish 4, markers 1 | - | sonnet-5-5 | 4,356 |
| 1 | 41 | `credentials` | provider + cause | R24 (a) | publish 2 | 8 | sonnet-5-5 | 5,941 |
| 1 | 44 | `provenance` | provider | - | publish 10, markers 1 | - | sonnet-5-5 | 5,823 |
| 1 | 47 | `capture-sources` | provider | - | publish 2 | - | haiku-5-5 | 3,726 |
| 1 | 51 | `file-safety` | provider + cause | R39a | publish 5, re-point 3 | 2 | sonnet-5-5 | 6,134 |
| 1 | 64 | `standards` | provider | - | publish 6, run 1 | - | sonnet-5-5 | 5,013 |
| 1 | 73 | `retrieval-browse` | provider + cause | R17a, R26 | publish 2, re-point 2 | 4 | sonnet-5-5 | 6,943 |
| 1 | 74 | `retrieval` | provider | - | publish 4, run 1 | 1 | sonnet-5-5 | 4,981 |
| 1 | 77 | `inquiry-grammar` | cause only | R30b | - | - | sonnet-5-5 | 3,443 |
| 1 | 125 | `conformance` | provider | - | publish 3 | 4 | sonnet-5-5 | 3,686 |
| 1 | 142 | `wizard-scripts` | enabling | - | - | 1 | sonnet-5-5 | 4,732 |
| 1 | 151 | `translations` | enabling | - | re-point 2 | - | sonnet-5-5 | 5,156 |
| 1 | 155 | `admission` | cause | R27b | - | - | sonnet-5-5 | 3,230 |
| 1 | 158 | `signin-door` | enabling | - | - | 4 | sonnet-5-5 | 4,567 |
| 1 | 172 | `control-plane` | provider | - | - | 29 | sonnet-5-5 | 5,682 |
| 1 | 173 | `plane` | cause | entry 4, R24 (b2), R24 (d), R28b | - | 69 | sonnet-5-5 | 11,670 |
| 2 | 16 | `office-readers` | cause only | R11a, R16, R21(b) | - | - | sonnet-5-5 | 6,187 |
| 2 | 18 | `pdf-reader` | provider | - | publish 1, markers 1 | - | haiku-5-5 | 3,532 |
| 2 | 33 | `ocr-worker` | provider + cause | R7 | publish 3, re-point 2, markers 1 | - | sonnet-5-5 | 6,761 |
| 2 | 38 | `membership` | provider | - | publish 1, markers 6 | - | haiku-5-5 | 3,854 |
| 2 | 40 | `ai-accounts` | provider | - | publish 14, re-point 8, markers 1 | - | sonnet-5-5 | 6,173 |
| 2 | 42 | `promotion` | provider | - | publish 8, markers 2 | 2 | sonnet-5-5 | 5,373 |
| 2 | 48 | `acquisition` | provider + cause | R12 | publish 7, re-point 99 | - | sonnet-5-5 | 8,415 |
| 2 | 49 | `capture` | provider + cause | R29 | publish 7, re-point 42, markers 1 | - | sonnet-5-5 | 8,384 |
| 2 | 52 | `sources` | provider | - | publish 2 | - | haiku-5-5 | 3,318 |
| 2 | 68 | `duties` | provider | - | publish 4, re-point 1 | - | sonnet-5-5 | 4,075 |
| 2 | 87 | `contradiction` | provider | - | publish 2, re-point 1 | 1 | sonnet-5-5 | 4,241 |
| 2 | 91 | `run-productions` | provider | - | publish 1 | - | haiku-5-5 | 3,267 |
| 2 | 107 | `case-carriage` | provider | - | publish 3 | - | haiku-5-5 | 3,590 |
| 2 | 109 | `publication` | provider | - | publish 6, re-point 5 | - | sonnet-5-5 | 4,975 |
| 2 | 110 | `publish-schedule` | provider | - | publish 1 | - | haiku-5-5 | 3,289 |
| 2 | 117 | `case-checker` | provider | - | publish 1 | - | haiku-5-5 | 3,207 |
| 2 | 118 | `case-import` | provider | - | publish 3 | 1 | sonnet-5-5 | 3,781 |
| 2 | 129 | `actions` | provider | - | publish 2, re-point 6 | 1 | sonnet-5-5 | 4,169 |
| 2 | new | `store-assembly` | new module | - | - | - | default | 5,858 |
| 2 | 168 | `screens-inquiry` | cause only | R1, R2a, R4, R35a, R37, R38, R17b, R30a | re-point 2, markers 5, op tables 471 | 6 | sonnet-5-5 | 11,919 |
| 3 | 15 | `csv-reader` | cause only | R20 | - | - | sonnet-5-5 | 3,604 |
| 3 | 31 | `doc-clean` | provider | - | publish 1 | - | haiku-5-5 | 3,170 |
| 3 | 45 | `attestation` | provider | - | publish 2 | - | haiku-5-5 | 3,394 |
| 3 | 54 | `reading-pipeline` | provider + cause | R2b, R3, R9, R11b, R18b | publish 1, re-point 21, markers 8 | - | sonnet-5-5 | 10,816 |
| 3 | 55 | `extraction` | provider + cause | R10, R24 (b), R39b | publish 5, re-point 73, markers 2 | 1 | sonnet-5-5 | 11,841 |
| 3 | 58 | `events` | provider | - | publish 5, re-point 1 | - | sonnet-5-5 | 4,266 |
| 3 | 59 | `lines` | provider | - | publish 1, re-point 1 | - | sonnet-5-5 | 3,694 |
| 3 | 66 | `money` | provider | - | publish 2, re-point 1 | - | sonnet-5-5 | 3,738 |
| 3 | 69 | `people` | provider | - | publish 3 | 1 | haiku-5-5 | 3,604 |
| 3 | 80 | `inquiry` | provider + cause | R30b | publish 5, re-point 5 | - | sonnet-5-5 | 5,759 |
| 3 | 82 | `steps` | provider | - | publish 2 | - | sonnet-5-5 | 3,438 |
| 3 | 86 | `strength` | provider | - | publish 4, re-point 2 | 1 | sonnet-5-5 | 4,342 |
| 3 | 89 | `ai-use` | provider | - | publish 1, run 1 | - | haiku-5-5 | 4,241 |
| 3 | 92 | `capture-requests` | provider | - | publish 1, re-point 7, markers 2 | 1 | sonnet-5-5 | 4,680 |
| 3 | 96 | `answers` | provider | - | publish 2, re-point 9 | - | sonnet-5-5 | 4,263 |
| 3 | 116 | `ratification` | provider + cause | R27a | publish 2, re-point 19 | 2 | sonnet-5-5 | 7,308 |
| 3 | 121 | `case-inputs` | provider | - | publish 2 | - | haiku-5-5 | 3,467 |
| 3 | 135 | `escalation` | provider | - | publish 2, re-point 5 | 1 | sonnet-5-5 | 4,258 |
| 3 | new | `store-request` | new module | - | - | - | default | 6,207 |
| 3 | 166 | `screens-intake` | cause only | R5, R35b, R36, R14, R33 | re-point 5, markers 3, op tables 355 | - | sonnet-5-5 | 9,576 |
| 4 | 36 | `member-roster` | provider | - | publish 2, markers 3 | - | haiku-5-5 | 3,928 |
| 4 | 57 | `entities` | provider | - | publish 3, re-point 1 | - | sonnet-5-5 | 4,074 |
| 4 | 65 | `progressions` | provider | - | publish 3, re-point 2 | - | sonnet-5-5 | 4,041 |
| 4 | 71 | `bias` | provider | - | publish 1 | - | haiku-5-5 | 3,072 |
| 4 | 75 | `calculations` | cause only | R19 | re-point 2 | - | sonnet-5-5 | 5,443 |
| 4 | 85 | `basis-versions` | provider + cause | R23 | publish 1 | - | sonnet-5-5 | 5,181 |
| 4 | 90 | `ai-runs` | provider | - | publish 4, re-point 9 | - | sonnet-5-5 | 5,022 |
| 4 | 99 | `agent-runner` | provider | - | publish 1, markers 1 | - | haiku-5-5 | 3,506 |
| 4 | 102 | `intent` | provider | - | publish 2, re-point 6 | - | sonnet-5-5 | 4,166 |
| 4 | 111 | `docket` | provider | - | publish 3, re-point 1 | - | sonnet-5-5 | 3,908 |
| 4 | 112 | `public-read` | provider | - | publish 1, re-point 10, markers 2 | - | haiku-5-5 | 4,649 |
| 4 | 115 | `case-catalogue` | cause only | R31 | - | - | sonnet-5-5 | 3,682 |
| 4 | 120 | `case-account` | provider | - | publish 1, re-point 3 | - | haiku-5-5 | 4,109 |
| 4 | 122 | `case-authoring` | provider | - | publish 1, re-point 8, markers 6 | - | sonnet-5-5 | 4,657 |
| 4 | 126 | `consequences` | provider | - | publish 2, re-point 5 | - | sonnet-5-5 | 3,980 |
| 4 | 131 | `action-clocks` | provider | - | publish 1, re-point 2 | - | sonnet-5-5 | 3,768 |
| 4 | 136 | `action-plans` | provider | - | publish 1, run 1, re-point 3, markers 1 | - | sonnet-5-5 | 4,971 |
| 4 | 137 | `plan-work` | provider | - | publish 1, re-point 7 | - | sonnet-5-5 | 4,029 |
| 4 | 156 | `answer-envelope` | provider | - | - | - | haiku-5-5 | 5,946 |
| 4 | 167 | `screens-daily` | cause only | R17a | re-point 2, op tables 248 | - | sonnet-5-5 | 4,958 |
| 5 | 34 | `sheet-worker` | provider | - | publish 1 | - | haiku-5-5 | 3,246 |
| 5 | 39 | `project-roster` | provider | - | publish 1 | - | haiku-5-5 | 3,218 |
| 5 | 56 | `content` | provider + cause | R22 | publish 1, run 1, re-point 3 | - | sonnet-5-5 | 6,433 |
| 5 | 67 | `money-checks` | provider | - | publish 1 | - | haiku-5-5 | 3,182 |
| 5 | 101 | `agent-worker` | provider | - | run 4, re-point 12 | - | sonnet-5-5 | 5,659 |
| 5 | 104 | `reevaluation` | provider | - | publish 1, re-point 3 | - | sonnet-5-5 | 3,951 |
| 5 | 114 | `network-notices` | provider | - | publish 1, re-point 2 | - | haiku-5-5 | 3,901 |
| 5 | 119 | `case-disclosures` | provider | - | publish 1, re-point 16 | - | sonnet-5-5 | 5,315 |
| 5 | 123 | `review` | provider | - | run 1, re-point 2 | - | sonnet-5-5 | 3,985 |
| 5 | 124 | `case-check` | provider | - | publish 1, re-point 2 | - | sonnet-5-5 | 3,701 |
| 5 | 138 | `monitoring` | provider | - | publish 3, re-point 36, markers 2 | - | sonnet-5-5 | 5,648 |
| 5 | 139 | `following` | provider | - | publish 1, re-point 13 | 1 | sonnet-5-5 | 4,273 |
| 5 | 140 | `link-sweep` | provider | - | run 3, re-point 2 | - | sonnet-5-5 | 4,530 |
| 5 | 147 | `action-producers` | provider | - | publish 1, re-point 7 | - | sonnet-5-5 | 3,858 |
| 5 | 152 | `instance-setup` | provider | - | re-point 21 | - | sonnet-5-5 | 5,325 |
| 5 | 157 | `store-door` | provider | - | re-point 3 | - | sonnet-5-5 | 6,416 |
| 5 | 161 | `interface-assets` | cause only | R32 | - | - | sonnet-5-5 | 3,596 |
| 5 | 163 | `screens-entry` | cause only | R34 | re-point 2, op tables 171 | - | sonnet-5-5 | 5,185 |
| 5 | 171 | `screens-action` | provider | - | re-point 6, op tables 50 | - | sonnet-5-5 | 6,145 |
| 6 | 61 | `connections` | Wave B job | - | re-point 6 | - | sonnet-5-5 | 3,802 |
| 6 | 62 | `observation-log` | Wave B job | - | re-point 1 | - | sonnet-5-5 | 3,241 |
| 6 | 76 | `workbooks` | Wave B job | - | re-point 1 | - | sonnet-5-5 | 3,187 |
| 6 | 83 | `citation` | Wave B job | - | re-point 2 | - | sonnet-5-5 | 3,293 |
| 6 | 95 | `question-explorer` | Wave B job | - | re-point 1 | - | sonnet-5-5 | 3,260 |
| 6 | 100 | `agent-steps` | Wave B job | - | re-point 12, markers 1 | - | sonnet-5-5 | 4,569 |
| 6 | 128 | `action-records` | Wave B job | - | re-point 2 | - | sonnet-5-5 | 3,293 |
| 6 | 130 | `action-holds` | Wave B job | - | re-point 2 | - | sonnet-5-5 | 3,228 |
| 6 | 132 | `action-replies` | Wave B job | - | re-point 3 | - | sonnet-5-5 | 3,239 |
| 6 | 134 | `filings` | Wave B job | - | re-point 6 | - | sonnet-5-5 | 3,323 |
| 6 | 141 | `scheduler` | Wave B job | - | re-point 14 | - | sonnet-5-5 | 3,653 |
| 6 | 145 | `tasks` | Wave B job | - | re-point 5 | - | sonnet-5-5 | 3,233 |
| 6 | 146 | `machinery-producers` | Wave B job | - | re-point 10 | - | sonnet-5-5 | 3,517 |
| 6 | 148 | `queue-producers` | Wave B job | - | re-point 33 | - | sonnet-5-5 | 4,686 |
| 6 | 149 | `notice-producers` | Wave B job | - | re-point 10 | - | sonnet-5-5 | 3,746 |
| 6 | 150 | `queue` | Wave B job | - | re-point 8 | - | sonnet-5-5 | 3,657 |
| 6 | 162 | `interface-shell` | Wave B job | - | op tables 52 | - | sonnet-5-5 | 5,623 |
| 6 | 174 | `installer-steps` | Wave B job | - | re-point 3 | - | sonnet-5-5 | 3,318 |
| 6 | 175 | `installer` | Wave B job | - | re-point 12, markers 5 | - | sonnet-5-5 | 3,643 |
| 7 | 164 | `screens-wizards` | Wave B job | - | re-point 1, op tables 50 | - | sonnet-5-5 | 4,842 |
| 7 | 165 | `screens-settings` | Wave B job | - | re-point 14, markers 5, op tables 229 | - | sonnet-5-5 | 5,993 |
| 7 | 169 | `screens-investigate` | Wave B job | - | re-point 2, op tables 164 | - | sonnet-5-5 | 4,923 |
| 7 | 170 | `screens-publish` | Wave B job | - | re-point 10, markers 6, op tables 44 | - | sonnet-5-5 | 5,426 |
| 7 | 178 | `journey-check` | Wave B job | - | - | - | sonnet-5-5 | 4,211 |

## 4. Modules with live findings and no START (mechanical pass)

11 modules have live findings and no job: `test-support`, `signatures`, `bundler`, `docprofile`, `host-governor`, `doorbell`, `law-relations`, `explore`, `hypotheses`, `skills`, `affordances`. Their lines are final in the parts (FIX-E, FIX-L, CODE, markers); they are done in one mechanics §5.10 pass after the providers merge (a sonnet medium worker per §5.10 (3), or haiku-5-5 if BOB takes K3518), not by a module job.

| # | Module | Live lines | Classes |
|---|---|---|---|
| 7 | `test-support` | 4 | FIX-L 4 |
| 9 | `signatures` | 1 | FALSE 1 |
| 10 | `bundler` | 7 | FALSE 7 |
| 22 | `docprofile` | 3 | FALSE 3 |
| 43 | `host-governor` | 5 | FALSE 1, FIX-L 4 |
| 50 | `doorbell` | 19 | CODE 1, FIX-E 4, FIX-L 14 |
| 63 | `law-relations` | 9 | FIX-E 1, FIX-L 8 |
| 70 | `explore` | 2 | FIX-E 2 |
| 81 | `hypotheses` | 2 | CODE 2 |
| 94 | `skills` | 2 | FALSE 2 |
| 144 | `affordances` | 3 | FIX-L 3 |

## 5. What changed with V3

- The 166 non-screens lines part-5 classes are in the STARTs: either a re-point (FIX-E), a contract marker (FIX-L), a code (CODE) or a `fixtures-own`/`fixtures-generic` marker the job writes and lists in its COMPLETE (K5060).
- Providers with no live user are not jobs. The V3 list moves `content`, `money`, `basis-versions` and `reevaluation` into the provider set, drops `local-facts`, and adds the fixtures part-5 names (for example acquisition/archiveAnswer, capture/partRefusal, credentials/bootstrapVersions, monitoring/monitoringReads, escalation/escalationsDue).
- Causes placed (28 modules): pdf-pixels R6; ocr-worker R7; pdf-worker R8; reading-pipeline R2b, R3, R9, R11b, R18b; extraction R10, R24 (b), R39b; office-readers R11a, R16, R21(b); file-scanner R11c; acquisition R12; subresources R15; retrieval-browse R17a, R26; screens-daily R17a (draw); screens-inquiry R1, R2a, R4, R35a, R37, R38, R17b, R30a; screens-intake R5, R35b, R36, R14, R33; file-safety R39a; calculations R19; csv-reader R20; content R22; basis-versions R23; capture R29; inquiry-grammar and inquiry R30b; case-catalogue R31; interface-assets R32 (gated); screens-entry R34 (minor); credentials R24 (a); admission R27b; plane entry 4 (first), R24 (b2), R24 (d), R28b; ratification R27a. The K5059 amendments are already on the tranche; each cause names its requirement.
- No job: R13a (live reading first, then UX-DESIGN's picker), R13b and R11c's container cause and R5's parted half (the redeploy, K4428), R18a (closed, R32/R51), R21(a) and R21(c), R25, R28a, R34's cause (re-walk asks), R31b/R31c (a reproduction first).
- Items the jobs REPORT to BOB (outside their module): the two `owner-ops.mjs` rows; capture's four parted ops' class rows (R29); ratification R27a's fold in control-plane; extraction R39b's `selftest` block; `interface-shell` for R34; office-readers' ODS twin; a door arm the world refuses (for `store-request`); the `plane/servedPlane` fixture (not published) and `storeWorld()` for journey-check.
- `pdf-pixels`' fixtures file is added to its `tests` by BOB at its COMPLETE (K5051). A START's line list is rechecked with `node checks/fixtures.mjs <root> <module> --list` at job start (each START names the command).

