# T53 R1 · actions · rows

## plan-T53-draft.md

**conformance** · C T52-29 · **actions** · C T52-30; N1257 R112 (two laws, two clocks; the zone named) · **filings** · C T52-31 · **action-plans** · C T52-32, T52-33 · **action-clocks** · N1257 R27 (the layer a list comes from) · **filing-templates** · N1257 R36 (a template's places may name layers) · all `capabilities/N1257-requirements-modules.md`; layer names in actions, action-records, action-grammar, action-clocks, filing-templates, filings (K5458), filing-templates' shared judge `[owed: BOB writes]` · `planning/plan-T53-capabilities.md` §A Layer 9
**JOURNEYS's defects** (K5471 (6))
- W6-W7's 130 defects (6 BLOCKS: R-1, R-65 to R-68, R-94; 97 with no T52 entry), one entry each under its owning module, with JOURNEYS's READY lines (about 109): `planning/plan-T53-journeys.md` §A. Modules: jurisdictions (L1); promotion, provenance, capture, file-safety (L3); entities, events, money, explore, calculations (L5); publication, docket, public-read, case-import, case-authoring, review (L8); actions (L9); affordances, interface-shell, screens-entry, -wizards, -settings, installer-steps, site, screens-intake, -daily, -inquiry, -investigate, -publish, -action (L11). Each module's job reads its rows there at START. A defect wholly a carried entry merges into it (marked MERGE). (J1-J7 answered as recommended, K5553, K5554, K5556-K5560; the four BOB points K5561) (§B: eight decided by DEC-472, four by K5474 and K5561; §D decided, K5476). DEC-472's owed: interface-shell the keyboard rule (4); screens-settings, -entry, -investigate (1), (3), (5), (6); Security's floor a stated constant (2)
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

- **actions** · T53 · N1257 (K5458) · R113 (law stores `layer`), R114 (`law_layer`), R115 (office `layer`) · N1257 layer-names

## plan-T53-journeys.md

**actions**
- T53 · R-117 (owner half) · move to `resolved` with no resolution defaults to "complied" · REG3 R-117 · D3 actions R?1.
- T53 · R-119 · "No reply came by the date" accepted ahead of the due date; replies listed in recorded order · REG3 R-119 · MERGE T52-30 (U25, write half). +T52-30 for the order of replies: D3 screens-action R?7 (decided, K5474).
- T53 · R-120 · new action's named addressee ("Public Works Director") stored as state audience, never drawn · REG3 R-120 · D3 screens-action R?8 (owner actions).
- T53 · R-118 · reply stage after the request refused; "If it follows" omits position 0 · REG3 R-118 · D3 screens-action R?6 (owner action-replies, actions, action-grammar R5).
- T53 · R-115 · proposed law has no control to choose it · REG3 R-115 · MERGE T52-81 (E-K6); no draft line.
- T53 · R-116 · risk line reads "the tier option opt-1 of plan PLN-…" · REG3 R-116 · MERGE T52-32 (W18); no draft line.
- T53 · R-113 · "Take this up" is forgotten on reload; queue effect not traced · REG3 R-113 · D3 screens-action R?13 (owner plan-work R5, R11; queue-producers to settle).
- T53 · R-125 · options table omits office and tier; "Assumed:" unexplained · REG3 R-125 · D3 screens-action R?11 (owner action-plans). Register: SAME AS walk-T51b-live/C.md Plan 2, 5; no T52 entry.
- T53 · R-126 · "Checks · 3" runs together, unexplained · REG3 R-126 · MERGE T52-33 (U19; the repair is the screen's); no draft line.
- T53 · R-112 · checkpoint draws no test and no "if met / if not met" · REG3 R-112 · D3 screens-action R?12 (owner action-plans data held).
- T53 · R-78 · hold screen: notice link vanishes after the hold; encoded JSON in link; "Release" offered with no hold · REG2 R-78 · D3 screens-action R?3 (owner action-holds).
- T53 · R-79 · typed date shown as "CONFIRMED"; "Remind me" silent; no-law work-out dead-ends · REG2 R-79 · D2 screens-investigate R?11 (owner action-clocks).
- T53 · R-68 (matter half) · BLOCKS · Matter shows no "Open an escalation"/"Decline to escalate" after a dated event + determination · REG2 R-68 (S4 rated BLOCKS) · D3 screens-action R?1 (owner escalation, op-declarations). T52-74 covers the timeline half.

## carried-T52-R1.md

- T52-30 · U25 · E U-10 / H3b(a) · first: settle whether a silence recorded before the reply was due is accepted and its stage dropped (`actions/index.mjs:1836-1862`, `t45.fields`, the `no_response` arm against the clock); fix it if so. PLD U25.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 9 | actions | 0 / 1 | 12 / 9 / 4 (9) |  |
