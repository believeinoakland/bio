# T53 R1 · filing-templates · rows

## plan-T53-draft.md

**conformance** · C T52-29 · **actions** · C T52-30; N1257 R112 (two laws, two clocks; the zone named) · **filings** · C T52-31 · **action-plans** · C T52-32, T52-33 · **action-clocks** · N1257 R27 (the layer a list comes from) · **filing-templates** · N1257 R36 (a template's places may name layers) · all `capabilities/N1257-requirements-modules.md`; layer names in actions, action-records, action-grammar, action-clocks, filing-templates, filings (K5458), filing-templates' shared judge `[owed: BOB writes]` · `planning/plan-T53-capabilities.md` §A Layer 9
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

- **action-records** R21 · **action-grammar** R31 · **action-clocks** R28, R29 (proposal and entry keep `layer`; a date never recomputed by a later layer) · **filing-templates** R37 · **filings** R71 · all N1257 layer-names. filings R29 is amended, no new id.
- **filing-templates** · T53 · K5528 T3/T4 · R15's private `#lacks` replaced by `jurisdictions`' `attributionLacks` (both import `record-grammar`'s functions directly, K5530 F10), one word `second_approval` · `lines-K5527` §3 `[owed: no filing-templates line exists; BOB writes it]`

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 9 | filing-templates | 0 / 2 | 0 / 0 / 1 (1) |  |

## K5629: layer-1 findings folded (BOB #327)

- T53-532 · jurisdictions R126 · R15 and R35 against R126. Detail: T53-301 already replaces R15's private `#lacks` with `attributionLacks`; the check is that R15 and R35 still say what R126 judges. They do not yet: R15 counts "at least one `professional` review whose outcome is `no_concerns`", and R126 (with its K5527 deltas) also requires a named reviewer with organisation and credential, a real `at`, a `reviewed_text_sha` equal to the hash of the text now, and a non-machine reviewer; R126 also lacks `writer` when `authored_by` is a machine. R35's `unofferedFor` answers the same words as `textsLack` for the same template (R126's own test). R15 and R35 are re-worded to cite R126 and drop their own copy of the rule (`TEMPLATE_NOT_REVIEWED` and its key stay). This is T53-301's line: BOB writes it once.
