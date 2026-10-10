# record-grammar (T42)

**Status** · session_01TfvYox4Sw4X6dSjqk6M1oK · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R29's amendment (C-33.40's `where` names every site that raises `NO_BASIS`). B1 names inquiry's `actNoBasis` and progressions' index.mjs:458, :471 (through checks.mjs:168 `refusal`). A sweep of `bio-plane/src` finds two more kinds of raiser:
(a) entities raises `NO_BASIS` with this very row (C-33.40, its translation) through `actShapeRefusal` (entities/index.mjs:209), at :755, :760 (an identifier's basis, R43) and :1194 (grade-D testimony, R12); R29 already names entities as a reader, and C-33.41's `where` already names this helper.
(b) lines (index.mjs:420–470, seven sites, local `refuse`) and money (index.mjs:1162, local `refusal`) answer a bare `code: "NO_BASIS"` with no `check` and no `translation`: they do not raise C-33.40, they reuse its code.
My best reading, which I am building: the `where` names every site that answers with the C-33.40 row, i.e. inquiry's `actNoBasis` (basis-versions through it), progressions' `refusal` (first declaration and revision of a declared flow), and entities' `actShapeRefusal` (a held identifier's basis, grade-D testimony); lines and money are not named, and (b) goes to you as a REPORT against those modules (a code shared with a row that carries no row's translation, DEC-49's shape). If you mean the `where` to name only inquiry and progressions, or to name lines and money too, say so and I will change it.

## J2 · QUESTION

R55 (B2): `ID_TABLE` gains `ACD` (owner `case-account`, form `opaque`). The ids minted since T41 are not opaque in form: case-authoring (index.mjs:1746) mints them with record-core's `mintOpaqueId`, which draws four random digits (`ACD-2026-0417`), the shape the table already lists as `sequential` for `CASE`, `WCD`, `DRAFT`, `RVG`, `TASK` (record-grammar ids.mjs, "drawn at random by record-core's opaque minter"). As `opaque` alone, `idPattern('ACD')` would refuse every account draft id a copy holds today, against R46/R47 (every id valid before stays valid).
My best reading, which I am building: `ACD` is `{prefix: 'ACD', owner: 'case-account', form: 'opaque', legacy: 'sequential'}`, K1728's `CALC` pattern: `case-account` mints it opaque through `allocId` (record-core R76 reads `form` alone) once it holds the code in L8, and the four-digit ids minted since T41 stay readable. Today nothing changes at runtime: case-authoring mints through `mintOpaqueId`, not `allocId`, and adding `ACD` to record-core's opaque set changes no answer of `mintExhausted` (its `MINTED_OBJECT` has no `ACD`; a report for record-core/case-account, not a defect). If you mean `opaque` with no legacy form (the T41 ids no longer valid), or `sequential` like `CASE`, say so and I will change it.

## Completion (RECORD-GRAMMAR #13)

**Reading set** (mechanics §17): measured at START at 186 KB, under 300 KB; read whole myself: `build/requirements/record-grammar.md` (and R55 as B2 added it, K2608); layer 1's row and contract in `build/layers.md`; the plan's entry T42-1 and its rules at the opening; K2467, K2540, K2607 in `build/rulings.md`; every file of `bio-plane/src/record-grammar/` and of `bio-plane/test/m/record-grammar/` (the fixtures' data excepted, K2053). Read for the entries: case-authoring's `#accountLabel` and `ACCOUNT_DRAFT_PREFIX` minting, and every raiser of `NO_BASIS` in `bio-plane/src`. No Uses (first in the order).

**Entries applied.**
- T42-1, R54 (N838, K2540; `labels.mjs`): `PROPOSAL_STATES` gains, after `translation`, `case_account` and `account_check`, each a frozen table of the three states. `case_account`: a draft of a case's account from its cited evidence, never the case's account, which a member writes in her own words; `account_check`: sentences of a member's account flagged as not supported by the evidence they cite, a draft and never a finding of the group; each `machine_proposed` sentence says machine work, labelled as machine work. `proposalLabel` answers for both; its `RangeError` names the fifteen subjects. The thirteen earlier tables are byte-for-byte unchanged (pinned by digest).
- T42-1, R29's amendment (N827, K2467; `acts.mjs`): C-33.40's `where` names every site answering with the row: inquiry's `actNoBasis` (basis-versions through it), progressions' `refusal` (first declaration and revision of a declared flow, `index.mjs`), entities' `actShapeRefusal` (a held identifier, grade-D testimony). Number and translation unchanged. **Row change: C-33.40's `where`, for the stamp (T42-5).**
- B2 CHANGE, R55 (N839, K2608): `ID_TABLE` gains `ACD` (owner `case-account`, form `opaque`, `legacy: 'sequential'`, J2's reading, see below; `ids.mjs`); C-33.54 `ACCEPT_MUST_REAUTHOR`'s `where` names `case-account R4` in place of `case-authoring R64` (`acts.mjs`). **Row change: C-33.54's `where`, for the stamp (T42-5).**

**Readings recorded.** J1 (C-33.40's sites) adopted by B3 (K2610). J2 (`ACD`'s legacy sequential form) adopted by B4 (K2616). The ids case-authoring has minted since T41 are four random digits (`mintOpaqueId`), so `opaque` alone would make `idPattern('ACD')` refuse every stored account draft id (R46, R47); `legacy: 'sequential'` keeps them readable, K1728's `CALC` pattern. Nothing changes at runtime today: case-authoring mints through `mintOpaqueId`, not `allocId`.

**Tests.** `labels.test.mjs`: R54 (both tables, every state and identity, their meaning, the thirteen before unchanged by digest) and R54's negative control (near spellings of the two subjects and non-strings throw a `RangeError` naming fifteen; the two themselves answer); R29 C-33.40's `where` (each site named, each file exists; control: not inquiry's alone); the R38/R42/R45/R50 pins re-stated for fifteen subjects. `ids-types.test.mjs`: the R46 census gains `ACD`; R55 (its row; opaque and legacy cores accepted; negative controls: the wrong form, a 15/17-character or upper-case tail, a slug, a short year, the wrong prefix). `acceptance.test.mjs`: R52's owners name `case-account R4`; R55 (the `where` exactly; control: no `case-authoring`). The test reads progressions' and entities' sites by name and file only: importing them from a layer-1 test is refused by the architecture check (P4).

**Ran.**
- `node --test bio-plane/test/m/record-grammar/`: tests 85, pass 85, fail 0. No layer tests named in the manifest.
- Users' suites (`bio-plane` `test/m/**`, every module): on the merged branch, tests 9874, pass 9851, fail 11, skipped 1, todo 11. Compared with `origin/tranche/T42` @ 4f29d1d79f without me (tests 9869, fail 10):
  - **Mine (another module's test pins what I changed; reported, not edited):** `record-core` `t33.test.mjs:69` (R76: the opaque prefixes, now with `ACD`) and `:162` (R62: `mintExhausted` has no sentence for an account draft, `ACD`).
  - **Generated artifacts staled (rule 4 (10); not mine to write, §14):** `case-checker` `program.test.mjs:19` (`program.mjs`); `system/fleetbundles.test.mjs` agent-worker (its bundle inlines `ids.mjs`); `system/newgroup-bundle-fresh.test.mjs` (C): fresh on the tranche, stale on mine (installer's bundle); the plane bundle.
  - **Red on the tranche without me (inherited):** membership `module-order.test.mjs:13`, `:107`, `t9-notice-sight-bounds.test.mjs:161`, progressions `order.test.mjs:16`, promotion `registry.test.mjs:58`, standards `reads.test.mjs:200` (rule 4 (5)); answer-envelope `catalogue-end.test.mjs:17` (rule 4 (6)).
  - **Load, not this change:** capture-requests `plane.test.mjs:167` failed under the two concurrent full runs and passes alone 3 of 3; its `:138`-family test failed on the base run only. The base run's two other reds (a temp-tree cleanup, a provenance `existed` arm) passed on mine.
- Checks: `format` 0 failures; `architecture record-grammar` 0 failures; `coverage record-grammar` 53 of 53, 0 failures; `ownership record-grammar tranche/T42` 7 files, 0 failures.

**Deferred.** None.

**Found in other modules.**
- `record-core` (R62, R76): `mintExhausted` needs a sentence for an account draft (`ACD`) and `t33.test.mjs`'s opaque-prefix pin needs `ACD`; for its job or `case-account`'s (L8). Until then an exhausted `ACD` mint through `allocId` names no object.
- `lines` and `money`: a bare `code: "NO_BASIS"` with no C-33.40 row; taken by B3 as T42-11a, T42-11b.
- Generated artifacts staled: plane bundle, `case-checker/program.mjs`, agent-worker's bundle, newgroup's bundle (regenerated at layer close).

Size (session_01TfvYox4Sw4X6dSjqk6M1oK): test runs 16, module lines 2518

## J3 · COMPLETE

T42-1 complete (b50fb8a6fc), with B2's R55. R54: PROPOSAL_STATES gains case_account and account_check after translation (fifteen subjects; the thirteen earlier tables unchanged by digest). R29: C-33.40's where names inquiry's actNoBasis (basis-versions through it), progressions' refusal and entities' actShapeRefusal (B3). R55: ID_TABLE gains ACD (case-account, opaque, legacy sequential: J2's reading, unanswered; the T41 ids are four random digits); C-33.54's where names case-account R4. Row changes for the stamp (T42-5): C-33.40's and C-33.54's where. record-grammar 85/85; checks format, architecture, coverage (53/53), ownership (7 files) 0 failures. Users' reds of mine: record-core t33.test.mjs:69 (R76 opaque-prefix pin lacks ACD) and :162 (R62 mintExhausted has no sentence for ACD); reported, not edited. Stale generated artifacts: case-checker program.mjs, agent-worker bundle (ids.mjs), newgroup bundle, plane bundle. Every other red is red on tranche/T42 without me (rule 4 (5), (6)) or load (capture-requests plane.test.mjs:167, 3/3 alone). Record: build/jobs/T42/record-grammar.md, Completion section.
