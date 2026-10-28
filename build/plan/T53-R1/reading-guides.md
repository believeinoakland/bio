# T53 R1 · reading-guides · rows

## plan-T53-draft.md

**reading-guides**
- T53 · N1257 · procedure guides side by side, one per layer, unranked (R17) · `capabilities/N1257-requirements-modules.md`
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**reading-guides**
- T53 · N1257 · add R18 (a group guide drafted from a layer's guide records `layer`) to the plan's R17 line · N1257 layer-names R18
- T53 · N858 (K5508-K5512; B1) · a profile guide offered only when `attributionLacks` answers none, else `not_offered: [{kind, lacks}]`; "reviewed by", flag and 12-month lines as for templates; `reviewed_by` read as K5528's `reviewed` · N858 R19 (key `reviewed`, §3 point 1)
- T53 · N858 (K5508) · `guideOptOut`: a sole member of a team opts out of review and the separate approver for the team's own guide, recorded `review_opt_out {member, at}`; `OPT_OUT_NOT_SOLE_MEMBER`, `MACHINE_CANNOT_OPT_OUT`; the guide says "not reviewed"; an opted-out guide answers `not_reviewed` and no `reviewed` key (no `reviewed: false`) · N858 R20 (with PLANNING's R20 delta)

## plan-T53-journeys.md

### Layer 11 modules named by the register that have no draft line of their own
- **people, hypotheses, filings, action-clocks, action-holds, action-replies, action-plans, plan-work, reading-guides, agent-steps, progressions, retrieval, reading-pipeline, credentials, ai-accounts, acquisition, attestation, instance-setup, setup-words, stewards**: named as co-owners in the register; the drafts write the line in the screen module and, only where the table above shows "(owner half)", in the owner module. The job for each reads the screen-module line's "owner" clause.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 6 | reading-guides | 0 / 0 | 4 / 0 / 2 (3) |  |

## K5629: layer-1 findings folded (BOB #327)

- T53-531 · jurisdictions R126 (N858) · check that the guide offer calls `attributionLacks`. Detail: the functions are exported by `jurisdictions` (R126: `attributionLacks(entry)`, `textsLack(profile)`, `countedReview(entry)`), not by `record-grammar`; the guide offer (R13, R15, `procedureGuidesFor`) answers a profile guide only when `attributionLacks` answers none, else `not_offered: [{kind, lacks}]`, and says "reviewed by" from `countedReview`'s answer. The words of `lacks` are `writer`, `sources`, `professional_review`, `second_approval`. A guide's "sources" lacks when it has no item (R126). Reading-guides has no line for this yet (N858 R19 in planning is "R19" in the handoff and "R18" in jurisdictions R126: the id is BOB's to give). `[owed: BOB writes the line]`
