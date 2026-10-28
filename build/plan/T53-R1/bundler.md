# T53 R1 · bundler · rows

## plan-T53-draft.md

**bundler**
- T53 · K5457 · the agent Worker's `HEALTH` Durable Object and provider bindings (AI Gateway, Workers AI); `deleted_classes` for `RemoteSession`, in the same deploy that retires the remote route · `lane-ai-design/draft-agent-run-path.md` (agent-worker R35), `draft-agent-runner.md` R13
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 1 | bundler | 0 / 2 | 8 / 63 / 77 (7) |  |

## K5629: layer-1 findings folded (BOB #327)

- T53-523 · reader-container's report (K5448 (4)) · enrol `reader-container` as a fleet member. Detail: the module has no `fleet-member.json`, `wrangler.jsonc`, Worker front or plane binding; enrolment makes `bundles.mjs` build it and changes the generated `dist` artifacts and fleetbundles' verify (bundler R24-R27). `[owed: BOB schedules it; bundler is layer 1 and merged, so a CHANGE or the next round; the routing is control-plane's, T53-536]`
