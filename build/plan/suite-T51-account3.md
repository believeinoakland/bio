# Whole suite, T51, third account (SUITE #1; K4787, K4792, K4113)

**Commit tested:** `18d315ff275deeceaec8387102ecb983e7b2fbd8` (tranche/T51 at the start), in one container with nothing else running. Every directory with a tracked `package-lock.json` (9) installed with `npm ci --ignore-scripts --no-audit --no-fund`. Bundler was re-run at `bab227d8687af4919cce6013d5b8dae1cd93c3f9` after K4828 (BOB #270's request).

**How it ran:**
- `node .github/scripts/module-tests.mjs` ran as a session-tracked task and was stopped at its 2-hour bound after 9 modules, all 0 fail. Its 10th module, bundler, never finished: `ascii.test.mjs` passes its 9 tests in about 20 s and then never exits. Under `--ignore-scripts`, `.bin/workerd` is workerd's Node shim, and the test's SIGKILL kills only the shim; the orphaned real workerd holds the test's pipes. K4828 fixed the test.
- Modules 10–176 then ran the same way (K4792): the same command per module (`node --import bio-plane/test/platform-sqlite.mjs --test <files>`), plus a 20-minute cap per module and a process-group kill, from a runner kept outside the repository. All 176 modules were reached.
- Per-file runs used the suite's own preload (`node --import bio-plane/test/platform-sqlite.mjs --test <file>`), alone twice, then twice under `taskset -c 0`, on a 4-core container.

**Counts:** 176 modules; 165 green, 10 red, and bundler stopped at its cap (at 18d315ff). 30 files red in some run: 28 RED-ALWAYS (11 of them the browser-build environment reds), 1 RED-ONE-CORE-ONLY, 1 intermittent; plus 1 module RED-FULL-RUN-ONLY (acquisition) and bundler's fleetbundles unclassified.

## Every module

```
setup-words: pass 21 fail 0 (34s)
record-grammar: pass 104 fail 0 (1s)
jurisdictions: pass 173 fail 0 (2s)
civil-time: pass 70 fail 0 (47s)
calc-grammar: pass 35 fail 0 (23s)
connection-grammar: pass 43 fail 0 (1s)
test-support: pass 72 fail 0 (8s)
runtime-limits: pass 32 fail 0 (2s)
signatures: pass 87 fail 0 (2s)
bundler: pass ? fail ? (1200s) TIMEOUT
court-citations: pass 18 fail 0 (15s)
id-spaces: pass 37 fail 0 (1s)
subresources: pass 36 fail 0 (0s)
ooxml: pass 72 fail 0 (4s)
csv-reader: pass 60 fail 0 (20s)
office-readers: pass 115 fail 0 (52s)
odf-reader: pass 74 fail 0 (3s)
pdf-reader: pass 146 fail 0 (85s)
format-registry: pass 43 fail 0 (1s)
text-chain: pass 137 fail 0 (1s)
site-profiles: pass 37 fail 0 (1s)
docprofile: pass 64 fail 0 (1s)
doctypes: pass 60 fail 0 (46s)
legistar-reader: pass 18 fail 0 (1s)
roster-reader: pass 27 fail 0 (7s)
court-doctypes: pass 24 fail 0 (1s)
budget-doctypes: pass 27 fail 0 (1s)
image-codecs: pass 65 fail 0 (7s)
pdf-pixels: pass 4 fail 0 (29s)
image-cover: pass 16 fail 0 (6s)
doc-clean: pass 41 fail 0 (10s)
pdf-worker: pass 70 fail 0 (36s)
ocr-worker: pass 1 fail 0 (36s)
sheet-worker: pass 37 fail 0 (3s)
file-scanner: pass 79 fail 0 (6s)
member-roster: pass 206 fail 0 (2s)
record-core: pass 208 fail 0 (17s)
membership: pass 178 fail 0 (15s)
project-roster: pass 112 fail 0 (2s)
ai-accounts: pass 131 fail 0 (2s)
credentials: pass 186 fail 0 (13s)
promotion: pass 161 fail 1 (19s)
host-governor: pass 57 fail 0 (16s)
provenance: pass 170 fail 0 (17s)
attestation: pass 33 fail 0 (1s)
provenance-routes: pass 49 fail 0 (1s)
capture-sources: pass 117 fail 0 (12s)
acquisition: pass 260 fail 1 (51s)
capture: pass 296 fail 0 (47s)
doorbell: pass 92 fail 0 (2s)
file-safety: pass 102 fail 1 (15s)
sources: pass 44 fail 0 (2s)
calibration: pass 73 fail 0 (1s)
reading-pipeline: pass 322 fail 0 (200s)
extraction: pass 328 fail 0 (15s)
content: pass 155 fail 0 (3s)
entities: pass 161 fail 0 (3s)
events: pass 93 fail 0 (10s)
lines: pass 36 fail 0 (2s)
local-facts: pass 75 fail 0 (2s)
connections: pass 146 fail 0 (5s)
observation-log: pass 84 fail 0 (1s)
law-relations: pass 26 fail 0 (2s)
standards: pass 110 fail 0 (6s)
progressions: pass 90 fail 0 (2s)
money: pass 104 fail 0 (3s)
money-checks: pass 48 fail 0 (2s)
duties: pass 75 fail 0 (4s)
people: pass 79 fail 0 (11s)
explore: pass 59 fail 0 (5s)
bias: pass 78 fail 0 (4s)
query-language: pass 57 fail 0 (20s)
retrieval-browse: pass 61 fail 0 (2s)
retrieval: pass 185 fail 0 (5s)
calculations: pass 111 fail 0 (59s)
workbooks: pass 37 fail 0 (26s)
inquiry-grammar: pass 85 fail 0 (1s)
accepted-work: pass 28 fail 0 (1s)
leg-earning: pass 57 fail 0 (2s)
inquiry: pass 225 fail 0 (6s)
hypotheses: pass 58 fail 0 (7s)
steps: pass 46 fail 0 (8s)
citation: pass 132 fail 0 (4s)
basis-version-grammar: pass 33 fail 0 (1s)
basis-versions: pass 182 fail 0 (6s)
strength: pass 182 fail 0 (3s)
contradiction: pass 142 fail 0 (4s)
run-rules: pass 73 fail 0 (1s)
ai-use: pass 85 fail 0 (2s)
ai-runs: pass 137 fail 0 (10s)
run-productions: pass 65 fail 0 (2s)
capture-requests: pass 129 fail 0 (16s)
reading-guides: pass 61 fail 0 (1s)
skills: pass 133 fail 0 (8s)
question-explorer: pass 46 fail 0 (2s)
answers: pass 67 fail 0 (5s)
agent-harness: pass 55 fail 0 (1s)
agent-model: pass 33 fail 0 (0s)
agent-runner: pass 65 fail 0 (13s)
agent-steps: pass 10 fail 0 (1s)
agent-worker: pass 22 fail 0 (114s)
intent: pass 94 fail 0 (40s)
investigation: pass 38 fail 0 (2s)
reevaluation: pass 163 fail 0 (26s)
case-grammar: pass 185 fail 0 (2s)
corpus-export: pass 35 fail 0 (16s)
case-carriage: pass 98 fail 0 (2s)
case-tensions: pass 26 fail 0 (1s)
publication: pass 174 fail 0 (9s)
publish-schedule: pass 33 fail 0 (2s)
docket: pass 87 fail 0 (3s)
public-read: pass 298 fail 0 (15s)
project-stage: pass 23 fail 0 (2s)
network-notices: pass 75 fail 0 (3s)
case-catalogue: pass 16 fail 0 (0s)
ratification: pass 319 fail 0 (49s)
case-checker: pass 107 fail 0 (20s)
case-import: pass 159 fail 0 (6s)
case-disclosures: pass 115 fail 0 (7s)
case-account: pass 48 fail 0 (3s)
case-inputs: pass 73 fail 0 (3s)
case-authoring: pass 243 fail 1 (19s)
review: pass 95 fail 0 (3s)
case-check: pass 34 fail 0 (1s)
conformance: pass 120 fail 0 (10s)
consequences: pass 69 fail 0 (4s)
action-grammar: pass 80 fail 0 (1s)
action-records: pass 34 fail 0 (1s)
actions: pass 148 fail 0 (8s)
action-holds: pass 50 fail 0 (4s)
action-clocks: pass 86 fail 0 (12s)
action-replies: pass 31 fail 0 (2s)
filing-templates: pass 86 fail 0 (2s)
filings: pass 164 fail 0 (42s)
escalation: pass 100 fail 0 (7s)
action-plans: pass 99 fail 0 (5s)
plan-work: pass 51 fail 0 (5s)
monitoring: pass 168 fail 0 (6s)
following: pass 127 fail 0 (6s)
link-sweep: pass 41 fail 0 (2s)
scheduler: pass 163 fail 0 (52s)
wizard-scripts: pass 137 fail 0 (5s)
op-grades: pass 150 fail 0 (3s)
affordances: pass 286 fail 0 (50s)
tasks: pass 134 fail 0 (3s)
machinery-producers: pass 38 fail 0 (1s)
action-producers: pass 53 fail 0 (2s)
queue-producers: pass 154 fail 0 (6s)
notice-producers: pass 143 fail 0 (7s)
queue: pass 223 fail 0 (17s)
translations: pass 38 fail 0 (2s)
instance-setup: pass 222 fail 0 (102s)
op-capabilities: pass 9 fail 0 (0s)
op-declarations: pass 248 fail 0 (7s)
admission: pass 63 fail 0 (12s)
answer-envelope: pass 43 fail 0 (4s)
store-door: pass 56 fail 0 (6s)
signin-door: pass 15 fail 0 (1s)
interface-assets: pass 22 fail 0 (5s)
interface-shell: pass 364 fail 0 (68s)
screens-entry: pass 96 fail 0 (3s)
screens-wizards: pass 75 fail 0 (19s)
screens-settings: pass 266 fail 0 (28s)
screens-intake: pass 317 fail 2 (64s)
screens-daily: pass 292 fail 0 (50s)
screens-inquiry: pass 520 fail 1 (89s)
screens-investigate: pass 249 fail 0 (270s)
screens-publish: pass 284 fail 0 (28s)
screens-action: pass 278 fail 0 (19s)
control-plane: pass 478 fail 0 (401s)
plane: pass 432 fail 3 (1150s)
installer-steps: pass 115 fail 2 (4s)
installer: pass 216 fail 16 (16s)
site: pass 35 fail 0 (11s)
stewards: pass 23 fail 0 (1s)
journey-check: pass 34 fail 99 (71s)
```

Bundler at `bab227d868` (after K4828): pass 169, fail 1. `ascii.test.mjs` now exits (R2's boot at 60 MB passes). `bio-plane/test/system/fleetbundles.test.mjs` fails at file level ("test failed", 20.7 s). That run was in a worktree whose `node_modules` were symlinks to the main checkout's, which may matter to a freshness check over installed inputs. **Not classified:** it was not re-run alone.

## Each red, classified

Columns: alone 1, alone 2, one core 1, one core 2. Most messages are the first assertion.

### RED-ALWAYS (red in the full run and in all four isolated runs)

| Module | File | Runs | Message |
|---|---|---|---|
| promotion | `bio-plane/test/system/row-census.test.mjs` | F F F F | CENSUS MOVED: the census, less the rows awaiting stamp, is 1960 rows (sha256 296a840d…), not the pin 1923 (c5885eaf…); rows "arrived with no record", e.g. C-130.17 MACHINE_CANNOT_RERUN, C-138.18, C-18.22, C-18.24, C-33.55, C-102.34 ALLOCID_PREFIX_REQUIRED |
| file-safety | `bio-plane/test/m/file-safety/rows.test.mjs` (R24, line 85) | F F F F | deepEqual of the module's code table: actual holds an extra `refusal.SIGNATURES_RUN_RECENT` |
| case-authoring | `bio-plane/test/m/case-authoring/signing.test.mjs` (R75, line 29) | F F F F | publish_at answer has extra fields `source: 'none'`, `why: 'no_profiles'` beside `{offered:false, reason:'PUBLISH_AT_NO_ZONE', zone:null}` |
| screens-intake | `bio-plane/test/m/screens-intake/capture.test.mjs` (R26, line 35) | F F F F | `refusal.NO_SUCH_SESSION` is not a word of the list |
| screens-intake | `bio-plane/test/m/screens-intake/common.test.mjs` (R26, line 106) | F F F F | "capture: refusal.NO_SUCH_SESSION is a word of the list": false |
| screens-inquiry | `bio-plane/test/m/screens-inquiry/fr6-seam.test.mjs` (R96 G13, line 131) | F F F F | a 12 MB text drawn `'unread'`, expected `'reading'` (the test's own name: "red by name until extraction's `more` merges") |
| plane | `bio-plane/test/m/plane/l77-size.test.mjs` (R77 L gate, line 19; 2 tests) | F F F F | "run 1: the ledger holds nothing": the ledger holds one `reading` row (attempts 0, last_ms 306) |
| plane | `bio-plane/test/m/plane/release.test.mjs` (R24, line 74) | F F F F | `screen.objective.purpose` is not held by the words list |
| installer-steps, installer | `newgroup/test/steps/invariants.test.mjs` (R36, line 132) | F F F F | `installer.fleet.logsunconfirmed` is not a row |
| installer-steps, installer | `newgroup/test/steps/observability.test.mjs` (R40, line 61) | F F F F | `UNKNOWN_WORD: no word installer.fleet.logsunconfirmed` |
| installer | `newgroup/test/realsize.test.mjs` (R33; 6 tests) | F F F F | "multipart": 0 !== 2 (the read-back at the release's real size, ~29 MB) |
| installer | `newgroup/test/requirements.test.mjs` (R8 line 267, R11 line 366; 4 tests) | F F F F | R8: TypeError reading `source` of undefined; R11: `own.acct` lacks `pdf-worker-fleet-unreachable` / `agent-worker-fleet-unreachable` |
| installer | `newgroup/test/t48.test.mjs` (R55, line 171) | F F F F | expected null, got a stop: "Cloudflare refused the upload … (this release's description of its program can't be read)", at "Putting release 0.86.0 in place" |
| installer | `newgroup/test/t50.test.mjs` (R61 line 128, R71 line 559) | F F F F | R61: TypeError reading `matchAll` of null; R71: null !== 'ok' |
| installer | `newgroup/test/wizard.test.mjs` | F F F F | file-level: TypeError reading `init` of undefined ("callback refuses what it cannot verify") |
| journey-check | `bio-plane/test/m/journey-check/account-installer.test.mjs` (3) | F F F F | "the helper programs step finished"; no container application for agent-runner on `docker.io/civicsmith/agent-runner@sha256:78b0…` |
| journey-check | `bio-plane/test/m/journey-check/plane-cron.test.mjs` (2) | F F F F | "the install did not stop" / "the update did not stop" |

**Environment reds (also RED-ALWAYS).** These 11 journey-check files fail at browser launch: `browserType.launch: Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-1194/…`. The container holds builds `chromium-1243` and `chromium_headless_shell-1243`, but journey-check's pinned playwright-core wants 1194. The environment's own fix is `executablePath: '/opt/pw-browsers/chromium'`. They say nothing about the code until that is done (K4113's case): `dec340` (11), `design29` (7), `frames` (5), `group` (6), `journey` (16), `live` (14; mostly launch, plus R5 asserts after the failed walk), `names` (5), `own-reading` (2), `pseudo` (7), `walker` (18), `words` (3). All runs: F F F F.

### RED-ONE-CORE-ONLY

| Module | File | Runs | Message |
|---|---|---|---|
| reading-pipeline | `bio-plane/test/m/reading-pipeline/pdf-pieces.test.mjs` (R40 R36 G26, line 43) | P P F F | green in this full run. On one core: "the pieces took 27414 ms, over 1.7 parses of the whole (11288 ms)". A bar on its own wall clock (K4787 (1)): the pieces lose more than the whole when they share one core. This accounts for the other account's reading-pipeline red. |

### RED-FULL-RUN-ONLY

| Module | File | Runs | Message |
|---|---|---|---|
| acquisition | unknown: the runner kept only `✖` lines for failing modules, and none named a test below the file list | P P P P (all 32 files alone, once); the whole module re-run alone: 261/0 | red 1 in this full run (260/1), not reproduced since |

### Intermittent (outside the three classes)

| Module | File | Runs | Message |
|---|---|---|---|
| screens-intake | `bio-plane/test/m/screens-intake/t51-fix5.test.mjs` (R31 E8, line 189) | F P F P | "the first capture, then the visitor copy": 1 !== 2 ("Finish it" with the visitor copy filed). Green in the full run; red in half of the isolated runs, whatever the cores, so it is an order or race in the test or the product, not load. |

### Named in the brief, not red here

- **screens-investigate:** green in the full run (249/0), all 22 files green alone, all 22 green on one core. The other account's red (beside two walkers' browsers) does not reproduce.
- **screens-intake (4 on the other account):** here 2 in the full run (capture, common, both RED-ALWAYS) plus t51-fix5 (intermittent). The fourth does not reproduce.
- **promotion, file-safety, case-authoring, screens-inquiry:** each one red, RED-ALWAYS, above.
- **reading-pipeline:** pdf-pieces, RED-ONE-CORE-ONLY, above. Its other 39 files are green alone and on one core.
