# Suite T51 round 9 — whole-suite run (SUITE #2)

**Commit tested:** `1253f585c574b4c2556c18720700ea176afb0395` (`origin/tranche/T51`), branch `prep/suite-2`. Packages: `npm ci --ignore-scripts` in all 9 directories with a tracked lockfile. Node v26.10.0, 4 cores, the container held nothing else.

**Counts:** 176 modules with tests; 164 pass, 12 fail (bundler, promotion, capture-sources, wizard-scripts, op-grades, machinery-producers, screens-settings, screens-investigate, screens-publish, installer, journey-check, plane).

## How it ran
- `node .github/scripts/module-tests.mjs` ran 169 modules in 2 h and was stopped at the bound inside `control-plane` (the 170th). The 7 modules not reached were run with the same runner (`module-tests.mjs` with a module filter): `control-plane` passed, `installer-steps`, `site`, `stewards` passed, `installer` and `journey-check` failed.
- **`plane` was not run as one module.** Its single-process run did not finish in the 2-hour window; `bio-plane/test/system/migrate-released.test.mjs` alone takes 2344 s. So `plane` ran file by file (88 files + `migrate-released`), each with `--max-old-space-size=6144`: 600 tests pass, 2 fail (`g54-l`, `release`). Its pass/fail line below is the sum of those files.
- Each failing file was then run alone twice (a1, a2) and twice on one core (`taskset -c 0`, c1, c2). `journey-check`'s other files not listed below were not re-run (they passed in the module run or are listed here).

## Every module's pass/fail line
```
setup-words: pass 21 fail 0 (71s)
record-grammar: pass 107 fail 0 (3s)
jurisdictions: pass 173 fail 0 (4s)
civil-time: pass 70 fail 0 (88s)
calc-grammar: pass 37 fail 0 (57s)
connection-grammar: pass 43 fail 0 (3s)
test-support: pass 129 fail 0 (86s)
runtime-limits: pass 60 fail 0 (2s)
signatures: pass 87 fail 0 (4s)
bundler: pass 168 fail 1 (112s)
court-citations: pass 18 fail 0 (24s)
id-spaces: pass 37 fail 0 (2s)
subresources: pass 38 fail 0 (1s)
ooxml: pass 100 fail 0 (20s)
csv-reader: pass 95 fail 0 (42s)
office-readers: pass 156 fail 0 (118s)
odf-reader: pass 127 fail 0 (29s)
pdf-reader: pass 193 fail 0 (169s)
format-registry: pass 59 fail 0 (4s)
text-chain: pass 149 fail 0 (3s)
site-profiles: pass 46 fail 0 (1s)
docprofile: pass 75 fail 0 (4s)
doctypes: pass 80 fail 0 (79s)
legistar-reader: pass 18 fail 0 (1s)
roster-reader: pass 27 fail 0 (15s)
court-doctypes: pass 24 fail 0 (1s)
budget-doctypes: pass 27 fail 0 (1s)
image-codecs: pass 80 fail 0 (15s)
pdf-pixels: pass 4 fail 0 (62s)
image-cover: pass 23 fail 0 (9s)
doc-clean: pass 65 fail 0 (60s)
pdf-worker: pass 87 fail 0 (75s)
ocr-worker: pass 9 fail 0 (218s)
sheet-worker: pass 38 fail 0 (6s)
file-scanner: pass 93 fail 0 (21s)
member-roster: pass 206 fail 0 (4s)
record-core: pass 220 fail 0 (40s)
membership: pass 178 fail 0 (39s)
project-roster: pass 112 fail 0 (4s)
ai-accounts: pass 131 fail 0 (3s)
credentials: pass 186 fail 0 (48s)
promotion: pass 162 fail 1 (45s)
host-governor: pass 57 fail 0 (37s)
provenance: pass 179 fail 0 (43s)
attestation: pass 33 fail 0 (2s)
provenance-routes: pass 49 fail 0 (2s)
capture-sources: pass 125 fail 1 (23s)
acquisition: pass 347 fail 0 (83s)
capture: pass 354 fail 0 (121s)
doorbell: pass 97 fail 0 (4s)
file-safety: pass 137 fail 0 (26s)
sources: pass 44 fail 0 (3s)
calibration: pass 73 fail 0 (1s)
reading-pipeline: pass 411 fail 0 (498s)
extraction: pass 381 fail 0 (36s)
content: pass 177 fail 0 (7s)
entities: pass 161 fail 0 (7s)
events: pass 93 fail 0 (22s)
lines: pass 36 fail 0 (4s)
local-facts: pass 75 fail 0 (5s)
connections: pass 146 fail 0 (13s)
observation-log: pass 84 fail 0 (3s)
law-relations: pass 26 fail 0 (5s)
standards: pass 110 fail 0 (12s)
progressions: pass 90 fail 0 (5s)
money: pass 104 fail 0 (7s)
money-checks: pass 48 fail 0 (3s)
duties: pass 75 fail 0 (9s)
people: pass 79 fail 0 (26s)
explore: pass 59 fail 0 (13s)
bias: pass 78 fail 0 (12s)
query-language: pass 59 fail 0 (42s)
retrieval-browse: pass 61 fail 0 (4s)
retrieval: pass 197 fail 0 (11s)
calculations: pass 143 fail 0 (126s)
workbooks: pass 50 fail 0 (157s)
inquiry-grammar: pass 87 fail 0 (2s)
accepted-work: pass 28 fail 0 (1s)
leg-earning: pass 57 fail 0 (3s)
inquiry: pass 225 fail 0 (13s)
hypotheses: pass 58 fail 0 (16s)
steps: pass 46 fail 0 (19s)
citation: pass 132 fail 0 (8s)
basis-version-grammar: pass 33 fail 0 (2s)
basis-versions: pass 182 fail 0 (12s)
strength: pass 182 fail 0 (7s)
contradiction: pass 142 fail 0 (9s)
run-rules: pass 73 fail 0 (2s)
ai-use: pass 85 fail 0 (4s)
ai-runs: pass 137 fail 0 (30s)
run-productions: pass 65 fail 0 (3s)
capture-requests: pass 129 fail 0 (38s)
reading-guides: pass 61 fail 0 (2s)
skills: pass 133 fail 0 (18s)
question-explorer: pass 46 fail 0 (3s)
answers: pass 67 fail 0 (10s)
agent-harness: pass 55 fail 0 (1s)
agent-model: pass 33 fail 0 (1s)
agent-runner: pass 65 fail 0 (14s)
agent-steps: pass 10 fail 0 (3s)
agent-worker: pass 22 fail 0 (321s)
intent: pass 94 fail 0 (98s)
investigation: pass 38 fail 0 (3s)
reevaluation: pass 163 fail 0 (49s)
case-grammar: pass 185 fail 0 (4s)
corpus-export: pass 35 fail 0 (38s)
case-carriage: pass 100 fail 0 (9s)
case-tensions: pass 26 fail 0 (2s)
publication: pass 174 fail 0 (17s)
publish-schedule: pass 33 fail 0 (4s)
docket: pass 87 fail 0 (6s)
public-read: pass 307 fail 0 (32s)
project-stage: pass 23 fail 0 (5s)
network-notices: pass 75 fail 0 (6s)
case-catalogue: pass 16 fail 0 (0s)
ratification: pass 329 fail 0 (105s)
case-checker: pass 107 fail 0 (43s)
case-import: pass 159 fail 0 (11s)
case-disclosures: pass 115 fail 0 (15s)
case-account: pass 48 fail 0 (7s)
case-inputs: pass 73 fail 0 (6s)
case-authoring: pass 256 fail 0 (43s)
review: pass 95 fail 0 (6s)
case-check: pass 34 fail 0 (3s)
conformance: pass 120 fail 0 (20s)
consequences: pass 69 fail 0 (8s)
action-grammar: pass 80 fail 0 (1s)
action-records: pass 34 fail 0 (2s)
actions: pass 148 fail 0 (17s)
action-holds: pass 50 fail 0 (9s)
action-clocks: pass 86 fail 0 (24s)
action-replies: pass 31 fail 0 (5s)
filing-templates: pass 86 fail 0 (3s)
filings: pass 164 fail 0 (97s)
escalation: pass 100 fail 0 (15s)
action-plans: pass 99 fail 0 (10s)
plan-work: pass 51 fail 0 (10s)
monitoring: pass 169 fail 0 (14s)
following: pass 127 fail 0 (12s)
link-sweep: pass 41 fail 0 (3s)
scheduler: pass 185 fail 0 (112s)
wizard-scripts: pass 136 fail 1 (10s)
op-grades: pass 148 fail 2 (6s)
affordances: pass 287 fail 0 (115s)
tasks: pass 134 fail 0 (5s)
machinery-producers: pass 37 fail 1 (3s)
action-producers: pass 53 fail 0 (4s)
queue-producers: pass 154 fail 0 (14s)
notice-producers: pass 151 fail 0 (18s)
queue: pass 230 fail 0 (39s)
translations: pass 42 fail 0 (4s)
instance-setup: pass 234 fail 0 (240s)
op-capabilities: pass 9 fail 0 (0s)
op-declarations: pass 248 fail 0 (14s)
admission: pass 73 fail 0 (25s)
answer-envelope: pass 43 fail 0 (9s)
store-door: pass 57 fail 0 (12s)
signin-door: pass 15 fail 0 (1s)
interface-assets: pass 22 fail 0 (8s)
interface-shell: pass 369 fail 0 (151s)
screens-entry: pass 96 fail 0 (5s)
screens-wizards: pass 75 fail 0 (41s)
screens-settings: pass 265 fail 1 (58s)
screens-intake: pass 374 fail 0 (143s)
screens-daily: pass 294 fail 0 (107s)
screens-inquiry: pass 539 fail 0 (236s)
screens-investigate: pass 248 fail 1 (303s)
screens-publish: pass 282 fail 2 (61s)
screens-action: pass 278 fail 0 (43s)
control-plane: pass 680 fail 0 (1738s)
installer-steps: pass 121 fail 0 (7s)
installer: pass 233 fail 15 (34s)
site: pass 35 fail 0 (14s)
stewards: pass 23 fail 0 (2s)
journey-check: pass 105 fail 24 (1474s)
plane: pass 600 fail 2 (file by file; the module run did not finish in the window)
```

## Failing files: four runs and classification

Classes: RED-ALWAYS (red in all four: alone twice and on one core twice), RED-ONE-CORE-ONLY, RED-FULL-RUN-ONLY (green in all four alone, red in the full run). Results are fail counts in a1 / a2 / c1 / c2. "Not instrumented": per K4966 these were not reproduced under named load; none is a timing-class red (all are red alone).

| Module | File | a1 a2 c1 c2 | Class | Assertion (first failing) |
|---|---|---|---|---|
| bundler | `bio-plane/test/system/deploybindings.test.mjs` | file-level fail ×4 | RED-ALWAYS | "the real config states an explicit subrequest ceiling the release path derives" |
| promotion | `bio-plane/test/system/row-census.test.mjs` | file-level fail ×4 | RED-ALWAYS | R50 "the tree holds the pin, the rows awaiting stamp listed — any other difference fails naming the row"; CENSUS MOVED: arrived with no record, C-102.34 … C-130.22 (many rows) |
| capture-sources | `bio-plane/test/m/capture-sources/browserrender.test.mjs` | 0 0 0 0 (17 pass each) | **RED-FULL-RUN-ONLY** | R69 "every failed answer carries elapsed_ms (the close included), failure_class and detail…" failed in the full run (1069.8 ms); the assertion text was not kept by the module runner and it does not reproduce alone |
| wizard-scripts | `bio-plane/test/m/wizard-scripts/t52g53.test.mjs` | 1 1 1 1 | RED-ALWAYS | `t52g53.test.mjs:31` R50 strict equal: the vendored `registry.json` is not the design's `registry.json` byte for byte |
| op-grades | `bio-plane/test/m/op-grades/g55.test.mjs` | 1 1 1 1 (file-level, 0 pass) | RED-ALWAYS | `g55.test.mjs:25` `assert.ok(NON_ACTS.moneyingestread.startsWith("read: "))` falsy |
| op-grades | `bio-plane/test/m/op-grades/owners.test.mjs` | 1 1 1 1 | RED-ALWAYS | `owners.test.mjs:200` R13 R3 deep-equal: the graded op list lacks `moneyingestread` |
| machinery-producers | `bio-plane/test/m/machinery-producers/whole-rows.test.mjs` | 1 1 1 1 | RED-ALWAYS | `whole-rows.test.mjs:42` "one note, for the whole": an extra row for capture_sha 30de53c7… |
| screens-settings | `bio-plane/test/m/screens-settings/contract.test.mjs` | 1 1 1 1 | RED-ALWAYS | `contract.test.mjs:75` "act.captureuploadabort.does is a key this module reads" |
| screens-investigate | `bio-plane/test/m/screens-investigate/fix4-seam.test.mjs` | 1 1 1 1 | RED-ALWAYS | `fix4-seam.test.mjs:107` "the figure the member read in is a row of the trail, proposed by a member (the plane names her `admin`, not `member:admin`)" actual undefined, expected true |
| screens-publish | `bio-plane/test/m/screens-publish/common.test.mjs` | 1 1 1 1 | RED-ALWAYS | `common.test.mjs:144` "refusal.NOT_RECORDED is listed by a screen that may draw it" (R24) |
| screens-publish | `bio-plane/test/m/screens-publish/g54-page.test.mjs` | 1 1 1 1 | RED-ALWAYS | `g54-page.test.mjs:114` strict equal: actual "…couldn&#39;t be built yet…" (HTML-escaped apostrophe), expected "…couldn't…" (R22) |
| installer | `newgroup/test/wizard.test.mjs` | file-level fail ×4 | RED-ALWAYS | the script dies at `wizard.test.mjs:232` (`sourceOf`, called at :552): TypeError "Cannot read properties of undefined (reading 'init')"; before it, FAILs "verification hit the new address", "the check was actually retried", "the refused upload is retried exactly once want [3,true,true,false] got [2,true,true]" and the module's 15 R33/R8/R11/R20/R44/R55/R61/R71/G54 reds follow |
| plane | `bio-plane/test/m/plane/g54-l.test.mjs` | 1 1 1 1 | RED-ALWAYS | `g54-l.test.mjs:151` strict equal: actual 'built', expected 'retrying' (K4941, K4966: not instrumented under load here; it is red alone and on one core) |
| plane | `bio-plane/test/m/plane/release.test.mjs` | 1 1 1 1 | RED-ALWAYS | `release.test.mjs:78` R24 "screen.objective.purpose is held by the words list" — **the known red accepted by name (K4276)**; classed RED-ALWAYS |
| journey-check | `…/journey-check/plane-cron.test.mjs` | 3 3 3 3 | RED-ALWAYS | `plane-cron.test.mjs:124` actual "the plane's script croninstall is not in the account", expected null (R1 (a) G1 ×3) |
| journey-check | `…/journey-check/account-installer.test.mjs` | 3 3 3 3 (0 pass) | RED-ALWAYS | `account-installer.test.mjs:62` "the helper programs step finished" actual undefined; also "agent-runner AgentRunner: an application on docker.io/civicsmith/agent-runner@sha256:78b09547…" (R1 (a) ×3) |
| journey-check | `…/journey-check/group.test.mjs` | 1 1 1 1 | RED-ALWAYS | `group.test.mjs:22` R17 deep-equal: rows that say "group" for a team (e.g. `ai-accounts.index.the_request_names_no_owner`, `capture.index.parted_unavailable`) |
| journey-check | `…/journey-check/live.test.mjs` | 4 4 4 4 (pass 11/11/10/11) | RED-ALWAYS | `live.test.mjs:191` "journey-check (live): 18 steps, 2 failures"; the R12, R12 control, R20 live-arm and R20 control live-arm tests (each ~100 s) |
| journey-check | `…/journey-check/journey.test.mjs` | 13 13 13 13 | RED-ALWAYS | "journey-check (local): 3 steps, 1 failures": `journey 28 · install: the installer's first page` fails with `locator.fill: Timeout 30000ms exceeded`; the 13 dependent tests (R1 (a), R9, R20, R10, R11, R7, R13, R16/18, R22, R23, R25, R27) follow |
| journey-check | `…/journey-check/route-encoding.test.mjs` | 0 0 0 0 | passes | not a failing file (rerun only because the title match was ambiguous) |

**Result: 21 failing files; 20 RED-ALWAYS (including plane `release.test.mjs` R24, accepted red by name, K4276), 1 RED-FULL-RUN-ONLY (capture-sources `browserrender.test.mjs` R69); no RED-ONE-CORE-ONLY.**

The three installer/journey-check clusters (`newgroup/test/wizard.test.mjs`, journey-check `journey`/`live`/`account-installer`/`plane-cron`) share one visible symptom, the installer's first page and its fake account answers (a container application and the plane's cron script absent), so one cause is likely; this run did not isolate it.

The raw logs are in the session scratchpad only (not committed).
