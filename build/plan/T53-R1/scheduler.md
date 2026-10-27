# T53 R1 · scheduler · rows

## plan-T53-draft.md

**following** · C T52-34; T53 · N1259 watch a number, never a name; a followed docket daily (K5513) · `planning/plan-T53-capabilities.md` §A Layer 10 · **monitoring** · pause stops slices and polls · `planning/plan-T53-capabilities.md` §A Layer 10 · **scheduler** · `register-import`, `discard-clear`, `mail-clear` · `planning/plan-T53-capabilities.md` §A Layer 10
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**scheduler** (one job: `register-import` first in the one `SCHEDULER_ORDER`, then N824's two; uses `doorbell`, `mail-door`)
- T53 · K4403 (2) · consumer `register-import` in slices · N1259-c R34
- T53 · N824 · consumers `discard-clear` and `mail-clear` after `register-import` · N824-container-member-job R35

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 10 | scheduler | 0 / 0 | 0 / 0 / 1 (1) |  |
