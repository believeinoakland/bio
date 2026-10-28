# T53 R1 · reading-pipeline · rows

## plan-T53-draft.md

**reading-pipeline**, **extraction**
- T53 · N1266, N1267 (K5427) · the text bound 100 MB, HTML streamed to it; the held-unread verdict re-run when a reader arrives · `files/SIZES-N1267.md` §3, `REQ-format-registry-beta.md` RF10 `[owed: BOB writes reading-pipeline's 100 MB line (SIZES §3) and RF10's]`
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**reading-pipeline**
- T53 · N1272 · `interpretUnits` of one part's units only, `partsOf` (K5496: whole-document names stay reading); `partsOf` is reading-pipeline R65 · N1269-N1272 R64, R65

## plan-T53-journeys.md

### Layer 11 modules named by the register that have no draft line of their own
- **people, hypotheses, filings, action-clocks, action-holds, action-replies, action-plans, plan-work, reading-guides, agent-steps, progressions, retrieval, reading-pipeline, credentials, ai-accounts, acquisition, attestation, instance-setup, setup-words, stewards**: named as co-owners in the register; the drafts write the line in the screen module and, only where the table above shows "(owner half)", in the owner module. The job for each reads the screen-module line's "owner" clause.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 4 | reading-pipeline | 0 / 0 | 69 / 12 / 30 (24) |  |

## plan-T53-design-rows.md

**reading-pipeline** (decided, BOB #324: the per-character measure lives in text-chain, layer 1; reading-pipeline produces the reading)
- T53 · DEC-479 (51) · a count of the words below the reader's own measured clarity on a reading, with their positions; only where the reader measured it (never a model's opinion of itself, `TEXT_CONFIDENCE_PSEUDO`) · DEC-479

## K5629: layer-1 findings folded (BOB #327)

- T53-528 · format-registry's finding · the 14 tests and their five sites. Detail: `index.mjs:1664, 2153, 2833, 2975, 3018` read `detectFormat(...).format !== "undetermined"` as "a format is known" (the R49 UTF-16 tests and the R50 big text, JSON and XML tests). `text` is a text reading; `unlisted` is held (R38, RF10) and `refused` is not filed (RF11); a JSON or XML file is `json` or `xml`, read as structured text, not as an unknown. Each site and its tests are re-stated by the kind of answer; `:2153` (a UTF-8 probe not taken for HTML or UTF-16) keeps its meaning with `text`. Goes with T53-124 (held-unread re-run).
