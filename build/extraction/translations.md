**Status** · DRAFT for BOB #197, 2026-10-17, uncommitted; reviewed before L11's START.

# instance-setup → translations — extraction map (T50 split, N1084)

Written on `tranche/T50` at HEAD `706a7f293a` by a reading worker for BOB #197. Every `setup.mjs` line number below is that file at that HEAD (4,000 lines); the translations job copies from it, so BOB re-checks the numbers if `setup.mjs` has moved by the job's START.

**Why.** Over its own paths (`modules.json`: `bio-plane/src/setup.mjs`, `setup-fleet.mjs`, `livefire.mjs`; tests not counted) `instance-setup` is **4,320** lines: `setup.mjs` 4,000, `setup-fleet.mjs` 71, `livefire.mjs` 249. That is past P6's ~4,000 (the watch M-T48-1 in its Status line). `layers.md` ("T50's opening") places `translations` at layer 11 directly before it, and `modules.json` already holds the row (index 145; `paths`, `tests` and `uses` empty) and already lists `translations` in `instance-setup`'s `uses`.

**Read whole:** `requirements/instance-setup.md` and `requirements/README.md`; `setup.mjs` (all 4,000 lines), `setup-fleet.mjs`, `livefire.mjs`; the tests under `bio-plane/test/m/instance-setup/` that name R67–R75 or R87 (`translations.test.mjs`, `interface-words.test.mjs`, `t41.test.mjs`, `t48.test.mjs`, `group.test.mjs`, `exports.test.mjs`) and `fixture.mjs`, `language.test.mjs`, `words.test.mjs` and `profiles.test.mjs` 120–177 for their shared use of the rows; `extraction/capture-split.md` (the shape) and the built `doorbell/` module as its precedent. **Callers** were found by grep of every moved function, op, route, constant, table and row name over `bio-plane/src` and `bio-plane/test` (the `dist/` bundles excluded).

## 0. The answer

**The seam is the translation workspace** (R67–R75 and R87): the interface's word list as the module exports it, the grants that let named members translate, the assistant's labelled drafts and its read-back into English, adoption, the second check on protected words, the undo, the "looks wrong" marks, the two reads (the workspace and the words a member reads), and the language a passage is read in.

**Why this seam**
- **One block.** All of it is one contiguous region of the class (`setup.mjs` 2614–3216, 603 lines) plus its seven tables (758–846), its 16 check rows (294–388, 411–417), a few constants (923–944) and nine route lines (3715–3724).
- **Own tables.** The seven `translation_*` tables are written and read by nothing else in `src/` (grep). No table of the code that stays is read by it, and no code that stays reads these.
- **One reverse edge, not several.** The moved code needs the member's chosen language (R64) in two places (`interfaceWords` 3170, `readingLanguage` 3204). R64 stays in `instance-setup`, which is later, so the read is handed in by registration (doubt 1).

**Requirement ids that move:** R67, R68, R69, R70, R71, R72, R73, R74, R75 and R87, ten in all; no id is split. Copied as invariants: R29, R30, R31, R63 (as new R14, R13, R16, R15). New: R11 (the registration) and R12 (the factory and routes).

**Sizes (§6)**
- **Moved:** 819 lines of `setup.mjs` (about 670 of them code).
- **`instance-setup` after:** 3,522 lines over its own paths with every delegate in place (measured on a scratch copy of the edited file), about **3,497** once the delegates and the nine route lines go. Both well under 4,000.
- **`translations` after its job:** about 990 lines (§6).

**Five seams the job must settle, each in §7 with a reading**
1. The member's chosen language (R64) is read by R8 and R10 but is `instance-setup`'s: a registration, R11.
2. `LANGUAGE_MALFORMED` (C-119.12) is raised by seven of the moved acts and by `instance-setup`'s own R64 and R85: one owner.
3. `assistantGate()` is `instance-setup`'s R55 and a later module: `translations` asks `ai-accounts.aiKeptAway()` itself.
4. During the copy window two modules declare the same seven tables, and `record-core` refuses a whole batch for one table already declared elsewhere.
5. The 16 check rows are not delegable: `answer-envelope` must list `translations`' checks file before `instance-setup` deletes its copy of the rows.

## 1. What moves (by copy, then deleted by `instance-setup`'s job)

### 1.1 The copy recipe, in one place

Everything the translations job needs from `setup.mjs`, as ranges to copy. The class block is **one contiguous range**; the rest are small.

| copy | `setup.mjs` lines | goes to (`bio-plane/src/translations/`) |
|---|---|---|
| imports `proposalLabel` (with its comment 40–41; line 42 also carries `isMachineIdentity`, which stays imported here) and `WORD_ROWS`, `WORDS_COMMIT` (43–44) | 40–44 | `index.mjs` |
| the 16 check rows | 294–388, 411–417 | `checks.mjs` as `TRANSLATIONS_CHECKS` |
| `refusal()` helper (reads the table) | 440–443 | `index.mjs`, over `TRANSLATIONS_CHECKS` |
| `scriptRefusal`, `draftUnavailable` | 444–450 | `index.mjs` (copied: R65 here keeps its own) |
| `draftAccount`, `projectAccount` | 454–466 | `index.mjs` (copied: R65 here keeps its own) |
| `INSTANCE_SETUP_TABLES` entries, `TABLE_CLASSES` entries | 522–524, 553–561 | `schema.mjs` as `TRANSLATION_TABLES`, `TRANSLATION_TABLE_DECLARATIONS` |
| the DDL of the seven tables | 758–846 | `schema.mjs` as `TRANSLATIONS_SCHEMA` |
| word list, limits, drafter stamp, placeholder helpers | 923–939 | `index.mjs` |
| `oneLine`, `canonicalTag`, `sha256OfBytes` (copied: used here too) and `sha256Hex` (moved) | 940–948 | `index.mjs` |
| `#juris()` | 1829 | `index.mjs` (copied: used by seeds and places here) |
| `#activeIds()` | 2425–2428 | `index.mjs` (copied: `#comparePlaces` here uses it) |
| **the class block**, banner to the end of `readingLanguage` | **2614–3216** | `index.mjs` |
| the nine route lines | 3715–3724 | `translationsOps(m, url, body)` |

`instance-setup`'s job then deletes exactly §1.2's list (not the copied lines in this table that stay).

### 1.2 What `instance-setup` deletes (819 lines of `setup.mjs`)

Each row is a range deleted as a whole; the line counts include blank lines and add up to 819.

**Imports and constants**

| moved item | lines today | lines | old id → new id |
|---|---|---|---|
| comment and `proposalLabel` import (line 42 keeps `isMachineIdentity`) | 40–41 | 2 | R67 → R1 |
| `WORD_ROWS`, `WORDS_COMMIT` import and its comment | 43–44 | 2 | R68 → R2 |
| banner, `INTERFACE_WORDS` (927–928), `INTERFACE_WORDS_COMMIT` (929), `WORD_BY_KEY` (930) | 923–930 | 8 | R68 → R2 |
| `TRANSLATION_DRAFT_MAX`, `TRANSLATION_TEXT_MAX`, `TRANSLATION_NOTE_MAX` (932–934, comment 931) | 931–934 | 4 | R67, R70, R73 → R1, R4, R7 |
| `TRANSLATION_DRAFTER` (comment 935) | 935–936 | 2 | R67, R70 → R1, R4 |
| `placeholdersOf`, `samePlaceholders` (comment 937) | 937–939 | 3 | R67, R70 → R1, R4 |
| `sha256Hex` (reading's hash; confirm's check) | 944 | 1 | R67, R71 → R1, R5 |

**Check rows** (`INSTANCE_SETUP_CHECKS`; each keeps its code, number and translation; only its `where` changes to `src/translations/index.mjs <function> > <region>`)

| row | check | lines | raised in (region) | old id → new id |
|---|---|---|---|---|
| comment | | 294–295 | | R67–R73 → R1, R3–R7 |
| `TRANSLATION_DIRECTION_UNKNOWN` | C-64.11 | 296–301 | `#draftRequest` > `is-translation-draft` | R67 → R1 |
| `MACHINE_CANNOT_TRANSLATE` | C-64.12 | 302–308 | `#translationActor` > `is-translation-actor` | R67, R69–R73 → R1, R3–R7 |
| `TRANSLATION_NOT_GRANTED` | C-64.13 | 309–314 | `#translationSpeaker` > `is-translation-speaker` | R67, R70, R71, R74 → R1, R4, R5, R8 |
| `NO_SUCH_WORD` | C-64.14 | 315–320 | `#translationWord` > `is-translation-word` | R68 → R2 (raised for R1, R4–R7) |
| `TRANSLATION_NOT_MISSING` | C-64.15 | 321–326 | `#draftRequest` | R67 → R1 |
| `TRANSLATION_KEYS_MALFORMED` | C-64.16 | 327–332 | `#draftRequest` | R67 → R1 |
| `TRANSLATION_NOTHING_TO_DRAFT` | C-64.17 | 333–338 | `#draftRequest` | R67 → R1 |
| comment "C-64.18 dropped" | | 339–340 | | R75 → R9 |
| `NO_SUCH_DRAFT` | C-64.19 | 341–346 | `translationAdopt` > `is-translation-adopt` | R70 → R4 |
| `TRANSLATION_TEXT_REFUSED` | C-64.20 | 347–352 | `translationAdopt` | R70 → R4 |
| `TRANSLATION_NOT_AWAITING` | C-64.21 | 353–358 | `#translationAwaiting` > `is-translation-awaiting` | R71 → R5 |
| `TRANSLATION_CONFIRM_SELF` | C-64.22 | 359–364 | `translationConfirm` > `is-translation-confirm` | R71 → R5 |
| `TRANSLATION_NOT_READ_BACK` | C-64.23 | 365–370 | `translationConfirm` | R71 → R5 |
| `TRANSLATION_NOTHING_TO_UNDO` | C-64.24 | 371–376 | `translationRevert` > `is-translation-revert` | R72 → R6 |
| `TRANSLATION_NOT_SHOWN` | C-64.25 | 377–382 | `translationMark` > `is-translation-mark` | R73 → R7 |
| `TRANSLATION_NOTE_REFUSED` | C-64.26 | 383–388 | `translationMark` | R73 → R7 |
| `LANGUAGE_NOT_SET` (comment 411–412) | C-64.31 | 411–417 | `readingLanguage` > `is-reading-language` | R87 → R10 |

Rows 294–388 are 95 lines and 411–417 are 7. **Not moved:** `LANGUAGE_MALFORMED` C-119.12 (288–293), shared with R64 and R85 (doubt 2). C-64.18 is a dropped number and stays unused (R9).

**Tables**

| table | CREATE TABLE | comment+DDL lines | written by | read by | old id → new id |
|---|---|---|---|---|---|
| `translation_grants` | yes | 761–771 | `translationGrant` | `#liveGrant`, `translationGrant` | R69 → R3 |
| `translation_drafts` | yes | 772–783 | `translationDraftRecord` (to_language) | `translationAdopt`, `#languageHistories` | R67 → R1 |
| `translation_adoptions` | yes | 784–800 | `translationAdopt` | `#wordHistory`, `#languageHistories`, `translationConfirm`, `translationRevert` | R70 → R4 |
| `translation_confirmations` | yes | 801–811 | `translationConfirm` | `#wordHistory`, `#languageHistories` | R71 → R5 |
| `translation_undos` | yes | 812–825 | `translationRevert` | `#wordHistory`, `#languageHistories` | R72 → R6 |
| `translation_marks` | yes | 826–836 | `translationMark` | `translationMark`, `#languageHistories` | R73 → R7 |
| `translation_readings` | yes | 837–846 | `translationDraftRecord` (to_english) | `translationConfirm` | R67 (K2216) → R1, read by R5 |

The section header comment is 758–760 (3 lines); with the seven tables the whole is **758–846 (89 lines)**. The seven names in `INSTANCE_SETUP_TABLES` are 522–524 (3 lines, with their comment) and their classes in `TABLE_CLASSES` are 553–561 (9 lines, with their comment): all `purge: "exempt"`, `expunge: "none"`, `sight: "group"`, `derive: "stored"`, `export: "never"`, `version_chain: true`. All 21 of these lines are R75 → R9. The SQL is unchanged, so a running store's rows stay where they are (no data move).

**Class members** (`class InstanceSetup`)

| moved item | lines today | lines | old id → new id |
|---|---|---|---|
| section banner (translation workspace) and the blank after it | 2614–2629 | 16 | R67–R75 → R1–R9 |
| `#isActiveMember` (used only by the moved code) | 2636–2644 | 9 | R69, R73 → R3, R7 |
| the blank before `#translationActor`, `#translationActor` | 2648–2658 | 11 | R67, R69–R73 |
| `#translationLanguage` (the tag, in its canonical form, or `LANGUAGE_MALFORMED`) | 2659–2666 | 8 | R67, R69–R74 → R1, R3–R8 |
| `#translationWord` | 2667–2677 | 11 | R68 → R2 |
| `translationGranted` (in-process), `#liveGrant`, `#translationMember`, `#translationSpeaker` | 2678–2707 | 30 | R69 → R3 |
| `translationGrant` (`op=translationgrant`) | 2708–2740 | 33 | R69 → R3 |
| word state: comment, `#wordHistory`, `static #current`, `#translationAwaiting` | 2741–2772 | 32 | R70–R73 → R4–R7, read by R8 |
| `#localNames`, `static #officialFor` (the profiles' local names) | 2773–2794 | 22 | R74, R67 → R8, R1 |
| `#draftRequest`, `#shownAdoptions`, `#languageHistories` | 2795–2879 | 85 | R67 → R1 (`#languageHistories` also R8) |
| `translationDraftRefusal` | 2880–2892 | 13 | R67 (K2238) → R1 |
| `translationDraft` (`op=translationdraft`) | 2893–2913 | 21 | R67 → R1 |
| `translationDraftRecord` (store-internal `translationdraftrecord`) | 2914–2969 | 56 | R67 → R1 |
| `translationAdopt` (`op=translationadopt`) | 2970–3013 | 44 | R70 → R4 |
| `translationConfirm` (`op=translationconfirm`) | 3014–3055 | 42 | R71 → R5 |
| `translationRevert` (`op=translationrevert`) | 3056–3083 | 28 | R72 → R6 |
| `translationMark` (`op=translationmark`) | 3084–3115 | 32 | R73 → R7 |
| `translations` (`op=translations`) | 3116–3157 | 42 | R74 → R8 |
| `interfaceWords` (`op=interfacewords`) | 3158–3186 | 29 | R74 → R8 |
| banner and `readingLanguage` (in-process) | 3187–3216 | 30 | R87 → R10 |

The ranges include the blank line before each member, so they run on from one to the next. The class block is therefore the single range **2614–3216**, less two stretches that stay (`#nameOf` 2630–2635 and `#isAdmin` 2645–2647, both used by the code that stays), and `#isActiveMember` (2636–2644) is deleted with it.

Sum of the deletions: 4 (imports) + 102 (rows 95 + 7) + 18 (constants 17 + 1) + 101 (tables 3 + 9 + 89) + 594 (class 16 + 9 + 569) = **819**.

**Ops and routes** (`instanceSetupOps`, 3715–3724: one comment line and nine routes; `translationdraftrecord` is store-internal and has no spec)

| route / op | method | old id → new id |
|---|---|---|
| `translationdraft` | `translationDraft` | R67 → R1 |
| `translationdraftrecord` (store-internal, `op-declarations` R6, `control-plane` NOT_ROUTED) | `translationDraftRecord` | R67 → R1 |
| `translationgrant` | `translationGrant` | R69 → R3 |
| `translationadopt` | `translationAdopt` | R70 → R4 |
| `translationconfirm` | `translationConfirm` | R71 → R5 |
| `translationrevert` | `translationRevert` | R72 → R6 |
| `translationmark` | `translationMark` | R73 → R7 |
| `translations` | `translations` | R74 → R8 |
| `interfacewords` | `interfaceWords` | R74 → R8 |

No op serves R87 (`readingLanguage` is in-process, for `plane/ask.mjs`) or `translationDraftRefusal` / `translationGranted` (in-process). These route lines are **not** in the 819: they stay while the delegates stand (§3) and go with the last caller's re-pointing.

### 1.3 Copied: needed in both places, so they stay here as well

| item | `setup.mjs` lines | why `instance-setup` keeps it |
|---|---|---|
| `refusal()` | 440–443 | every row that stays |
| `scriptRefusal`, `draftUnavailable` | 444–450 | R65 (`groupDescriptionDraft`) |
| `draftAccount`, `projectAccount` | 454–466 | R65 |
| `oneLine` | 940–941 | declared stake (R77), update acts (R90) |
| `canonicalTag` | 942–943 | R85 and the others |
| `sha256OfBytes` | 945–948 | the logo (R84, line 1614) |
| `#nameOf` | 2630–2635 | R65's label, R89, R90 |
| `#isAdmin` | 2645–2647 | most acts |
| `#juris()` | 1829 | seeds, places, profiles |
| `#activeIds()` | 2425–2428 | `#comparePlaces` (R62) |

### 1.4 Adjusted on copy (names that do not exist in the new module)

| in the moved code | line | becomes |
|---|---|---|
| `this.assistantGate()` | 2905 | a private gate that asks `ai-accounts.aiKeptAway()` directly, with the `try` / `STORE_DID_NOT_ANSWER` of `assistantGate` (2262–2269) copied (doubt 3) |
| `this.memberLanguage({ viewer })` | 3170, 3204 | the read registered by R11 |
| `InstanceSetup.#current` | 2750, 2864, 3133, 3176 | the new class's name |
| `InstanceSetup.#officialFor` | 2848 | the new class's name |
| `INSTANCE_SETUP_CHECKS` (inside `refusal`) | 441 | `TRANSLATIONS_CHECKS` |
| each row's `where` | 298–385, 415 | `src/translations/index.mjs <function> > <region>` |
| `INSTANCE_SETUP_SCHEMA` split in `migrate()` | 1185–1186 | the same split over `TRANSLATIONS_SCHEMA`; then the declaration (doubt 4) |
| `declareTable("instance-setup", …)` | 1217 | `declareTable("translations", …)` |
| `this.#aiAccounts()`, `#record()`, `#membership()`, `#iso()`, `#now()`, `#rows()`, `#one()`, `#sql` | class infrastructure, 1159–1179 | the same small accessors over `deps` |

### 1.5 Not moved, though they sit among or beside the moved lines

- `memberLanguageSet`, `memberLanguage` (R64, 2435–2467) and the table `member_languages` (740–747): stay; read through R11.
- `assistantState`, `assistantGate`, `disclosureShown`, `disclosureOf` (R53–R55, 2246–2310): stay.
- `groupDescriptionDraft` (R65, 2559–2612) and `draftRefused` (451–453): stay.
- `groupLanguagesSet`, `groupLanguages` (R85) and `LANGUAGE_MALFORMED` C-119.12: stay (doubt 2).
- The seeds, places, profiles, reports, update acts (R88–R91), `LEGACY_PROBE_RUN` and the rest of the module: untouched.
- `setup-fleet.mjs` and `livefire.mjs`: nothing in them serves R67–R75 or R87; they are unchanged and counted in §6 for the total only.

## 2. The requirements for `translations`

The new module is `translations`, layer 11, directly before `instance-setup` in `modules.json` (index 145; `instance-setup` is 146). Its paths are `bio-plane/src/translations/` (`index.mjs`, `checks.mjs`, `schema.mjs`) and its tests `bio-plane/test/m/translations/`.

### 2.1 Renumbering (old → new)

| instance-setup | translations | what |
|---|---|---|
| R67 | **R1** | `translationDraft`, `translationDraftRefusal`, `translationDraftRecord`: the assistant's drafts, both directions |
| R68 | **R2** | the word list (`INTERFACE_WORDS`) and the word-keyed refusal |
| R69 | **R3** | `translationGrant`, `translationGranted` |
| R70 | **R4** | `translationAdopt` |
| R71 | **R5** | `translationConfirm` |
| R72 | **R6** | `translationRevert` |
| R73 | **R7** | `translationMark` |
| R74 | **R8** | `translations`, `interfaceWords` |
| R75 | **R9** | the tables: append-only, exempt, never exported; no copy of `NO_SUCH_MEMBER` (an invariant) |
| R87 | **R10** | `readingLanguage` |
| new | **R11** | `registerMemberLanguageRead`: how the member's own language reaches R8 and R10 |
| new | **R12** | `translationsOf`, `translationsOps`, `migrate`: one instance per storage, the nine routes, the tables created |
| R30 (copy) | **R13** | every row is this module's, with its test (an invariant) |
| R29 (copy) | **R14** | `by` and `viewer` are the control plane's stamps (an invariant) |
| R63 (copy) | **R15** | the words members see (DEC-149) (an invariant) |
| R31 (copy) | **R16** | no place named (an invariant) |

**Retired in `instance-setup` as "moved to translations R<n>":** R67 → R1, R68 → R2, R69 → R3, R70 → R4, R71 → R5, R72 → R6, R73 → R7, R74 → R8, R75 → R9, R87 → R10. BOB does the retirement. R29, R30, R31 and R63 stay in `instance-setup`, their text unchanged.

**How the text below was made.** R1–R10 are `instance-setup`'s text for R67–R75 and R87 as it stands in `requirements/instance-setup.md` (lines 124–142, 154, 216), with these changes and no others:
- every reference to one of these ids is its new id (an id held by another module, such as `membership` R84, `store-door` R10, `agent-worker` R68–R70 and `jurisdictions` R70–R73, is unchanged);
- R64 (the tag rule) is `jurisdictions` R37, which R64 itself cites; R64 (the member's own language) is `instance-setup`'s, read through R11;
- R28's exemption is stated as record-core's R21, R23 and R25;
- R1 gains the one clause that names the keep-away gate it asks (doubt 3).

Each is marked *(not yet met: T50)* until the translations job merges (README convention 5); the marks are left off below.

### 2.2 Purpose

What the members of a group read the screens in, and who may put words into a language. It holds the interface's words as a list; the group's translation of each word into any language, kept by a granted speaker, with every earlier text still readable; the grants that let named members translate; the assistant's drafts, stored as labelled machine work that no member outside the workspace sees; the second check a protected word waits for; the undo; and the marks "this translation looks wrong". It answers a member the words in her language, word by word and never blank, the English where none is shown; and it answers which language a passage is read in. It installs nothing and sends nothing about the group.

### 2.3 Provides (public)

**The assistant's translation drafts** (T37-30, its share; N669; DEC-127 (2), (5), DEC-157 (2), (4), (6), DEC-179; K1755, K2200, K2201)

- **R1** `translationDraft({language, direction, keys?, key?, assistant, by})` (`op=translationdraft`). `direction` is `to_language` or `to_english`; any other value, or none, is refused `TRANSLATION_DIRECTION_UNKNOWN` with its row, writing nothing. `language` is a tag `jurisdictions.isLocale` accepts (its R37), else `LANGUAGE_MALFORMED`.
  - `to_language`: an administrator, or a member granted `language` (`translationgrant`), asks the assistant to draft words the group's `language` lacks: `keys`, optional, names which, else the first 100 missing in the word list's order; at most 100 a call (K2201). A key asked that is not missing, or not in the word list, is refused by name, writing nothing. An official name or translation `jurisdictions` holds (T37-2) is offered in place of a draft and never sent (DEC-157 (6)). Each word sent carries its key, English, meaning note (the word's `note` and its sibling `.means` or `.does` entry, DEC-127 (2); K2200) and protected mark (DEC-179 (4)). This module stores each word answered as a draft (K2201), labelled through `record-grammar`'s `proposalLabel(<the assistant's stamp>, "translation")` (its R50; shown as "Draft"), with who asked and when; it is not the group's wording, and no member outside the translation workspace sees it, until a granted member adopts it (`translationadopt`). A draft whose placeholders (`{name}`) differ from its English's is not stored and is named in the answer. It answers `{ok: true, drafted, not_drafted, offered_official}`.
  - `to_english`: an administrator asks the assistant to read back into English one protected word, `key`, kept in `language` and awaiting confirmation (DEC-157 (4)); anyone else is refused `NOT_AN_ADMIN` (`membership` R84; K2201), and a key not awaiting confirmation is refused by name. It answers `{ok: true, key, language, english, label: {kind: "machine", asked_by: <handle>}}` and writes nothing: the reading adopts, confirms and records nothing, and the administrator's confirmation is their own act (`translationconfirm`). (T37; K2216, revising K2201's "writes nothing" to "writes no text") An answered reading records its fact and no text: the word's `key`, `language`, the SHA-256 of the kept text it read, the administrator and the instant, appended (`translationdraftrecord`); neither the English answered nor the kept text is stored. It adopts and confirms nothing.
  - Refusals after the ones above: `store-door` R10's (`AI_KEPT_AWAY`, `AI_NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED`; T40: N812, a draft carrying no project). Past them the door routes the draft to `agent-worker`'s `POST /draft` (its R68–R70; `control-plane` R57's third draft); a draft it cannot serve answers `ASSISTANT_DRAFT_UNAVAILABLE` (`wizard-scripts`' row), writing nothing. Without the assistant, members type words (`translationadopt`; DEC-127 (5)).
  - The new codes (`TRANSLATION_DIRECTION_UNKNOWN` and the not-missing and not-awaiting refusals) take the next C-64 numbers and await T38's stamp.
  - (T37-30, its second share) The first refusals, after the direction and the tag: a machine `by` `MACHINE_CANNOT_TRANSLATE`; for `to_language`, a `by` who is neither an administrator nor granted `language` (R3) `TRANSLATION_NOT_GRANTED`; for `to_english`, R1's `NOT_AN_ADMIN`; a key not in the word list `NO_SUCH_WORD` (R2). Past every refusal (R1's and `store-door` R10's), this module answers the `words` the door sends (R2's `{key, en, note, means, protected}` for each key, or the one kept word's `{key, en, text, protected}`), and the door hands the answered draft back to its store-internal route `translationdraftrecord` (no spec, `op-declarations` R6), which for `to_language` records each word as R1 says and answers `{ok: true, drafted, not_drafted, offered_official}`, and for `to_english` records nothing and answers R1's reading.
  - (T37; K2238) `translationDraftRefusal({language, direction, keys?, key?, by})`, exported and in-process: answers `null` or R1's first refusal (direction, tag, machine, `TRANSLATION_NOT_GRANTED` / `NOT_AN_ADMIN`, `NO_SUCH_WORD`, not missing / not awaiting), each code minted here alone (K231), writing nothing; `store-door`'s route asks it before its own gate (its R10). Past its refusals and the keep-away gate (`ai-accounts.aiKeptAway()`, its R7, asked directly and answered as given: `AI_KEPT_AWAY` with its `keep_away`; a provider that throws is `STORE_DID_NOT_ANSWER`, never an open gate), with an assistant on, `translationDraft` answers `{ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE", direction, language, words}` (R2's `words`), the signal the door drafts on, as the other two drafts do. `translationdraftrecord` (the door's hand-back) takes the body `{direction, language, keys?|key, words, draft, not_drafted?}` with `by` stamped in the query, re-runs R1's refusals before recording, and records nothing on a stale hand-back.

**The group's translation of the interface** (T37-30, its second share; N669; DEC-127 (1), (2), (5), DEC-157 (1)–(6), DEC-179; K1793, K1804, K2200, K2201) Terms. A **word** is an entry of the word list (R2), known by its `key`. A word's **state** in a language is `missing` (nothing adopted), `shown` (an adoption members see) or `awaiting` (an adopted protected word waiting for its second check, members seeing the English); a stored draft (R1) is no state of the word. A **granted speaker** of a language is an administrator or a member holding a live grant for it (R3). Every act here is refused to a machine `by`, the assistant included (`MACHINE_CANNOT_TRANSLATE`; `record-grammar` R50: machine work can draft a translation and never adopt or confirm one), and refuses a `language` `jurisdictions.isLocale` does not accept `LANGUAGE_MALFORMED` (R1) and a key not in the word list `NO_SUCH_WORD`. Each new code takes the next free number of this module's families and awaits T38's stamp.

- **R2** (DEC-179; T39, N807: the list itself moved to `setup-words` R1–R3) `INTERFACE_WORDS` is `setup-words`' `WORD_ROWS` (its R1) in its order, each row exported as `{key, en, note, means, protected}`, the list and each word frozen; `INTERFACE_WORDS_COMMIT` is its `WORDS_COMMIT` (its R2). This module holds no copy of the list. A word keeps its key when its English changes (DEC-179 (3)): every adoption records the English it translated, and R8 answers `english_changed: true` for a shown word whose recorded English is not the list's.
- **R3** (DEC-157 (1)) `translationGrant({member, language, revoke?, by})` (`op=translationgrant`): an administrator grants a named active member the right to translate the interface into `language`, or with `revoke: true` revokes it. Refusals in order, each writing nothing: `MACHINE_CANNOT_TRANSLATE`; `NOT_AN_ADMIN` (`membership` R84); `LANGUAGE_MALFORMED`; `NO_SUCH_MEMBER` for a `member` that is absent, a machine identity or not active, answered through `membership`'s `noSuchMember` (its R121, C-96.47) with `member` the id asked. A grant is recorded with the administrator and instant; a revocation is appended, never a deletion; a second grant of a live grant, or a second revocation, answers `existed: true` with the first. A grant is live while it is not revoked and its member is active. `translationGranted({member, language})` (in-process) answers whether `member` is a granted speaker of `language`, for R1 and R4–R7.
- **R4** (DEC-127 (5), DEC-157 (2)–(4)) `translationAdopt({language, key, text, draft?, by})` (`op=translationadopt`): a granted speaker keeps a word's translation, typed or from a stored draft (`draft`, R1's id, kept as drafted or corrected). Refusals in order, each writing nothing: `MACHINE_CANNOT_TRANSLATE`; `LANGUAGE_MALFORMED`; `TRANSLATION_NOT_GRANTED`; `NO_SUCH_WORD`; `NO_SUCH_DRAFT` for a `draft` that is not a stored draft of that key and language; `TRANSLATION_TEXT_REFUSED` for a `text` that is not 1 to 2,000 characters on one line, or whose placeholders (`{name}`) differ from the English's. The adoption is recorded `{language, key, text, en, by, at, replaced, draft}` (`replaced` the text it replaces, or null for the English). An ordinary word is then `shown`, to every member reading `language` at once. A protected word is `shown` only when `text` is exactly the stored draft named by `draft` (kept as the assistant drafted it, one speaker's keeping enough; K2200 (1)); changed from that draft, or typed without one, it is `awaiting` (R5) and members see the English until it is confirmed. It answers `{ok: true, language, key, state}`.
- **R5** (DEC-157 (4)) `translationConfirm({language, key, by})` (`op=translationconfirm`) confirms an `awaiting` protected word, which is then `shown`. It is confirmed by a granted speaker of `language` who is not the member who adopted it, or by an administrator, whose confirmation is their own act after reading the assistant's translation of the word back into English (R1's `to_english`). (K2216) An administrator's confirmation of a protected word changed from the draft or typed without one is refused `TRANSLATION_NOT_READ_BACK` (a sentence saying the word has not been read back into English for its current text, then the remedy: read it back into English first) unless R1 holds a reading by that administrator for that key and language whose SHA-256 is that of the word's current kept text; a second granted speaker needs none. Refusals in order, each writing nothing: `MACHINE_CANNOT_TRANSLATE`; `LANGUAGE_MALFORMED`; `TRANSLATION_NOT_GRANTED`; `NO_SUCH_WORD`; `TRANSLATION_NOT_AWAITING` (the word is not `awaiting`); `TRANSLATION_CONFIRM_SELF` (the adopter, unless an administrator); `TRANSLATION_NOT_READ_BACK` (an administrator with no such reading, K2216). The confirmation is recorded with who and when beside the adoption.
- **R6** (DEC-157 (5)) `translationRevert({language, key, by})` (`op=translationrevert`): an administrator undoes a word's latest adoption, or its latest undo, in one act: the word returns to what that adoption replaced (the earlier text with the state it had, or the English, `missing`). Refusals in order, each writing nothing: `MACHINE_CANNOT_TRANSLATE`; `NOT_AN_ADMIN` (`membership` R84); `LANGUAGE_MALFORMED`; `NO_SUCH_WORD`; `TRANSLATION_NOTHING_TO_UNDO`. The undo is appended with who and when and names the adoption it undoes; no adoption, confirmation or undo is ever changed or deleted.
- **R7** (DEC-157 (5)) `translationMark({language, key, note?, by})` (`op=translationmark`): any active member marks a word's translation "this translation looks wrong", with an optional `note` of at most 500 characters (`TRANSLATION_NOTE_REFUSED`). Refusals in order: `MACHINE_CANNOT_TRANSLATE`; `LANGUAGE_MALFORMED`; `NO_SUCH_WORD`; `TRANSLATION_NOT_SHOWN` (the word has no `shown` translation in `language`); `NO_SUCH_MEMBER` (R3's, through `membership` R121) when `by` is not an active member. A mark is recorded with who and when, and is open until the word's next adoption or undo; a member's second open mark on a word answers `existed: true`. Marks are listed to granted speakers and administrators only (R8).
- **R8** (DEC-127 (1), (5), DEC-157 (5), (6); `jurisdictions` R70–R73) Two reads, each writing nothing and never throwing:
  - `translations({language, viewer})` (`op=translations`), to a granted speaker of `language` (else `TRANSLATION_NOT_GRANTED`): every word in the list's order with its `en`, `note`, `means`, `protected`, its state, its shown or awaiting text with who adopted it and when, `english_changed` (R2), its stored drafts (labelled machine work, R1), its adoptions, confirmations and undos newest first, and its open marks; and `local_names`, the active profiles' local names (`jurisdictions.combine`'s view, its R70, R72), each with its explanation and official translation in `language` and its source when held, offered first and never a word to draft, adopt or translate (DEC-157 (6)).
  - `interfaceWords({language?, viewer})` (`op=interfacewords`), to any member's session: for `language`, by default the viewer's own, the language the member chose for the screens (`instance-setup` R64, read through the registration of R11), every key with `text`, the group's `shown` translation where one is held and the English otherwise (`fallback: true`), word by word, never blank (DEC-127 (1)), and `en` beside it so the English is one hover away (DEC-157 (5)); an `awaiting` word answers the English. With no language set or held, every word is the English.

**The language a member reads in** (N670; DEC-127 (1), (3))

- **R10** (T48; N670; DEC-127 (1), (3); `plane` R50) `readingLanguage({member, language?})` (in-process, for the plane's draft door) answers `{ok: true, language, source}`, the language a passage is read in: `language` (`source: "named"`) when `jurisdictions.isLocale` accepts it (R1's rule: its R37), else `LANGUAGE_MALFORMED`; without it, the member's own language (`instance-setup` R64, read through the registration of R11; `source: "member"`); with none set, `LANGUAGE_NOT_SET` (C-64.31; BOB's draft translation, "Choose the language you read in, in Your account, or name one. Nothing was translated.", its words an ASK to UX-DESIGN; awaiting T49's stamp, plan rule 5 (2)). It writes nothing and never throws. Test: a member with Spanish set answers `es`; control: a member with none set and no `language` answers `LANGUAGE_NOT_SET`.

**How the member's language reaches this module, and its factory** (new at the split; T50)

- **R11** (new; T50; N1084; the pattern of `public-read` R34 and of `ai-accounts` R23) `registerMemberLanguageRead(read)`: the later module that holds the language a member chose for the screens (`instance-setup` R64) registers, once at its start, a `read({viewer})` answering `{ok, language, set_at}` as that module's `memberLanguage` answers. A `read` that is not a function is refused `PROVIDER_MALFORMED`, a second registration `PROVIDER_DECLARED`, each registering nothing; a good one answers `{ok: true}`. R8's `interfaceWords` with no `language` and R10's `readingLanguage` with no `language` read the viewer's own language through it. With no read registered, or one that throws or answers a value `jurisdictions.isLocale` does not accept, no language is set (every word is the English; `readingLanguage` answers `LANGUAGE_NOT_SET`), never a throw. Test: a registered read answering `es` for one viewer and nothing for another; controls: none registered, a read that throws, a second registration refused.
- **R12** (new; T50; K61) `translationsOf(ctx, deps)` is the one instance of this module for a storage; `deps` is read on its first call (`record`, `membership`, `aiAccounts`, `jurisdictions`, `now`, each defaulting to the module's own factory on the same `ctx`). Its `migrate()` creates the seven tables (`CREATE TABLE IF NOT EXISTS`, the DDL `instance-setup` creates today, so a running store keeps its rows with no data move) and declares them to `record-core` as R9 says. `translationsOps(m, url, body)` carries the routes `translationdraft`, `translationdraftrecord` (store-internal), `translationgrant`, `translationadopt`, `translationconfirm`, `translationrevert`, `translationmark`, `translations` and `interfacewords`, with `by` and `viewer` read from the query after the body (R14). Test: two calls answer the one instance; `migrate()` twice changes nothing; the route map's keys are exactly those nine.

## Private

### Uses (each earlier than `instance-setup`, index 146, in `modules.json`'s order)

- `setup-words` (0): `WORD_ROWS` and `WORDS_COMMIT` (its R1, R2; R2), read, never copied.
- `record-grammar` (1): `proposalLabel` with the subject `translation` (its R50; R1) and `isMachineIdentity` (the one predicate that tells a machine; every act).
- `jurisdictions` (2): `isLocale` (its R37; R1, R3–R8, R10); `combine`'s `local_names` (its R70, R72; R1, R8).
- `record-core` (34): `recordOf`: `getSetting("jurisdiction_profiles")` (record-core R26; R8's local names) and `declareTable` (its R21; R9).
- `membership` (35): `isAdministrator`, `memberFacts` (an active member; the handle), `notAnAdmin` (its R84) and `noSuchMember` (its R121, C-96.47).
- `ai-accounts` (37): `aiKeptAway` (its R7; R1).
- `extraction` (52): the term fold (`normAlias`; R1's official-name match).
- `wizard-scripts` (136): `WIZARD_SCRIPTS_CHECKS` and its `ASSISTANT_DRAFT_UNAVAILABLE` row (R1).

So `modules.json`'s `translations.uses` is `["setup-words", "record-grammar", "jurisdictions", "record-core", "membership", "ai-accounts", "extraction", "wizard-scripts"]`. It does not use `credentials`, `scheduler`, `promotion`, `capture`, `public-read` or `instance-setup`. The tests' world uses `credentials` and `ai-accounts` fixtures, as `translations.test.mjs` does today.

### Invariants

- **R9** (T37; R1–R8; DEC-127 (4)) The translation grants, drafts, adoptions, confirmations, undos and marks are this module's own tables, append-only, declared to `record-core` with their purge class (the group's settings' class, exempt from purge in both forms: record-core R21, R23, R25); every name in them is held by value beside the member id. No translation changes a signed or published record's words, and no translation, draft or mark leaves the group's Civicsmith. (T38; N793; K231, K2275) This module holds no `NO_SUCH_MEMBER` row: C-64.18 is dropped and never reused, and the code's one row is `membership`'s C-96.47 (its R121).
- **R13** (copy of `instance-setup` R30) Each check row this module raises is its own, with the code, check number and translation it has in `instance-setup` today: C-64.11–C-64.17, C-64.19–C-64.26 (C-64.18 is dropped and never reused, R9) and C-64.31, each `where` naming the function that holds its region (`DEC-49 REGION`) and the region inside it; no number is held twice. The row C-119.12 `LANGUAGE_MALFORMED` is held by one module only (doubt 2). Test: the walk of the source that `translations.test.mjs` makes today, over this module's table.
- **R14** (copy of `instance-setup` R29) Nothing a caller sends names who acts: `by` and `viewer` are the control plane's stamps, read from the query after the body is spread, so a body naming its own is overwritten. Test: the route test of `translations.test.mjs` (a body naming an administrator grants nothing).
- **R15** (copy of `instance-setup` R63; DEC-149) Every member-facing string this module answers (its statements, its notes and the `translation` of each of its rows) calls the group's own Civicsmith "your group's Civicsmith", or is reworded so it needs no name, and never "copy", "instance", "plane" or "server" for it. Codes, op names and comments are not member-facing.
- **R16** (copy of `instance-setup` R31) No place is named in this module's behaviour or outward text; a local name reaches an answer only from an active profile's own data, through `jurisdictions.combine` (R8's `local_names`).

### Satisfies

- DEC-127 (1)–(5) (a member's language and the group's translation of the interface), DEC-157 (1)–(6) (the workspace), DEC-179 (3), (4) (a word keeps its key; protected words): R1–R10; N669, N670, N793 (K231, K2275), N807, N812 (K2373); K1755, K2200, K2201, K2216, K2238.
- N1084 (the split for size, P6; M-T48-1); K1043, K624 (a module split by copy, its paths and tests empty until its job).

### Suggestions

- **Start.** `translations` registers nothing at start and runs no consumer; `migrate()` and the declaration happen at construction (R12). `instance-setup` calls `registerMemberLanguageRead` from its own `start()` (R11), as it registers the fact `producingGroup` with `promotion` and the group-identity source with `public-read`.
- **Tests.** The world is `translations.test.mjs`'s today (the real `membership`, `credentials` and `ai-accounts` over `credentials/fixture.mjs`, and the test jurisdictions). Its `memberLanguageSet` calls become a registered stand-in read (a map). The module cannot import `instance-setup`'s `fixture.mjs` (a later module): the parts it needs (`storage`, `applyRecordSchema`, `frame`) are copied into `test/m/translations/fixture.mjs` (about 60 lines).
- **The ops' classes** stay `op-declarations`' and their routes `control-plane`'s, as for the other ops (K624); only the family's owner label there names `instance-setup` (§4).

## 3. What stays in `instance-setup`, and the delegates it keeps

### 3.1 What stays

Everything not listed in §1.2: the producing group and the display name and domain (R1–R11, R77, R78), the profiles (R12–R16, R76), the reports (R17–R19, R33–R43, R80–R82), the seeding (R50–R52), the assistant's state, gate and disclosure (R53–R55), the place not yet held (R60, R62), the words members see (R63), **a member's language** (R64, `memberLanguageSet` / `memberLanguage` and the table `member_languages`), the group's description draft (R65), the second administrator (R66), the explanation level (R79), the logo and languages (R83–R86), the updates (R88–R91), and the invariants R26–R31, R41, R42, R43. `setup-fleet.mjs` and `livefire.mjs` are unchanged.

### 3.2 The delegates (one for each caller not yet re-pointed)

Each is a one-line method on `class InstanceSetup` that answers what `translations` answers, as given. The class gets `#translations()` (`this.#deps.translations ?? translationsOf(this.#ctx, { env: this.#env })`). The job writes them in the place of the deleted block, after `groupDescriptionDraft` and before the updates.

| delegate on `InstanceSetup` | calls | caller outside `instance-setup` | file:line of the caller |
|---|---|---|---|
| `translationDraftRefusal(a)` | `translations.translationDraftRefusal` | store-door's `translationdraft` route | `store-door/dispatch.mjs`:467 |
| `translationDraft(a)` | `translations.translationDraft` | the same route | `store-door/dispatch.mjs`:470 |
| `readingLanguage(a)` | `translations.readingLanguage` | the plane's draft door (R50) | `plane/ask.mjs`:369 |
| `translationDraftRecord(a)` | `translations.translationDraftRecord` | the route `translationdraftrecord`, through `instanceSetupOps` | `plane/store.mjs`:841 (map), `setup.mjs`:3717 |
| `translationGrant(a)` | `translations.translationGrant` | the route `translationgrant` | `setup.mjs`:3718 |
| `translationAdopt(a)` | `translations.translationAdopt` | the route `translationadopt` | `setup.mjs`:3719 |
| `translationConfirm(a)` | `translations.translationConfirm` | the route `translationconfirm` | `setup.mjs`:3720 |
| `translationRevert(a)` | `translations.translationRevert` | the route `translationrevert` | `setup.mjs`:3721 |
| `translationMark(a)` | `translations.translationMark` | the route `translationmark` | `setup.mjs`:3722 |
| `translations(a)` | `translations.translations` | the route `translations` | `setup.mjs`:3723 |
| `interfaceWords(a)` | `translations.interfaceWords` | the route `interfacewords` | `setup.mjs`:3724 |

Eleven delegates. The nine route lines in `instanceSetupOps` (3715–3724, ten lines with their comment) stay as they are, calling the delegates; nothing in the plane or the tests that reaches the routes changes. There is **no delegate** for `translationGranted` (no caller outside the moved code and its tests), for `INTERFACE_WORDS` / `INTERFACE_WORDS_COMMIT` and the three limits (no importer in `src/` or in any test outside the moved ones), or for the tables.

### 3.3 The other edits `instance-setup`'s job makes

- **Registration (R11).** In `start()`, after `out.identity = this.#registerIdentity();` (1246): `out.language = this.#translations().registerMemberLanguageRead(({ viewer = null } = {}) => this.memberLanguage({ viewer }));`. Two lines with their comment.
- **Imports.** Line 42 keeps `isMachineIdentity` and drops `proposalLabel`; line 14 drops `noSuchMember` (nothing else in the file uses it); add `import { translationsOf } from "./translations/index.mjs"` with its comment (2 lines). `isLocale`, `termFold`, `WIZARD_SCRIPTS_CHECKS`, `checkDraft` and `combineProfiles` stay used. No other import goes.
- **Header comment** (line 1): the id list drops R67–R75 and R87 and says they are `translations`'.
- **`INSTANCE_SETUP_TABLES`, `TABLE_CLASSES`, `INSTANCE_SETUP_SCHEMA`**: lose the seven tables (§1.2); the `declareTable("instance-setup", …)` call (1217) then covers the rest. Its answer is read for no refusal today; see doubt 4.
- **`modules.json`**: `instance-setup.uses` drops `setup-words` (its only use was R68, line 44); every other use stays (`extraction`, `record-grammar`, `membership`, `wizard-scripts`, `ai-accounts` and the rest are still read by code that stays); `translations` is already listed.
- **`layers.md`**: BOB's, and already written ("T50's opening").

### 3.4 `instance-setup.md` (BOB's wording)

- Retire R67–R75 and R87 as "moved to `translations` R<n>" (§2.1), the ids never reused. R64's last clause ("the translations themselves are N669") and R55's text are unchanged.
- **Status:** a split for size again (T50; N1084), in K649 (1)'s form; R67–R75 and R87 marked moved; the P6 watch of M-T48-1 closed.
- **Size (P6):** replace the 2,530–2,900 estimate with the measured figure of §6.
- **Uses:** drop the `record-grammar` line's `proposalLabel` (T37; R67), the `setup-words` line (T39; R68), `jurisdictions`' `combine local_names` (T37; R67, R74), and `noSuchMember` from the `membership` line (R69, R73); add `translations`: the delegates and `registerMemberLanguageRead`.
- **Invariants:** R75 retires (moved to R9); R30's list of rows loses C-64.11–C-64.26 and C-64.31 (§1.2).

### 3.5 Order

1. The `translations` job builds the module by copy (§1.1, §1.4) and merges first. During the window **both** modules hold the code, the tables and the rows; callers still reach `instance-setup`'s.
2. `answer-envelope` lists `["src/translations/checks.mjs", TRANSLATIONS]` in its file list (its R12 form; §4). This is the one prerequisite of a deletion.
3. `instance-setup`'s job deletes §1.2, adds the eleven delegates, the registration and the import, and retires the ids. **If step 2 has not merged**, it deletes everything but the rows 294–388 and 411–417 (102 lines), which wait for `answer-envelope` (§6 gives both sizes).
4. `store-door`, `plane` and the others re-point when next touched. As each does, `instance-setup` deletes the delegate (and, with `plane`, the nine route lines).

## 4. Callers outside `instance-setup`

Found by grep over `bio-plane/src` and `bio-plane/test`, `dist/` excluded.

### 4.1 Code that calls the moved functions (served by the delegates; may keep them)

| module | file:line | what it calls | must re-point now? |
|---|---|---|---|
| `store-door` | `dispatch.mjs`:25 (import), 464–470, comments 293, 460–463 | `instanceSetupOf(ctx).translationDraftRefusal(args)` (467), `.translationDraft({...args, assistant})` (470) | No: keep the delegates. Re-point at `store-door`'s next job (`translationsOf(ctx)`; add the edge `store-door` → `translations`). |
| `plane` (ask) | `ask.mjs`:13 (import), 362 (comment), 369 | `instanceSetupOf(ctx, env).readingLanguage({ member, language })` | No. Re-point at `plane`'s next job. (`ask.mjs`:277 and 357 call `assistantGate()`: R55, which stays.) |
| `plane` (composition) | `store.mjs`:91 (import), 496 (build), 502–504 (disclosure read and `start`), **841** | `...instanceSetupOps(instanceSetupOf(ctx, env), url, body)` carries the nine translation routes | No. At `plane`'s next job: `...translationsOps(translationsOf(ctx, env), url, body)` beside it, and `instance-setup` then deletes lines 3715–3724. `translations` is added to `plane.uses` then. |
| `plane` tests | `test/m/plane/maps.mjs`:187 | `["instance-setup", (c,u,b,e) => instanceSetupOps(...)]` | With `plane`'s job: add `["translations", …]` beside it. |
| `plane` tests | `test/m/plane/t48.test.mjs`:111–118 | spies on `setup.readingLanguage` on `instanceSetupOf(...)` | No: the delegate is still the method it spies on. |

### 4.2 Rows read through the namespace (not delegable)

| module | file:line | what | must re-point? |
|---|---|---|---|
| `answer-envelope` | `families.mjs`:161 (`import * as INSTANCE_SETUP from "../setup.mjs"`), 269 (`["src/setup.mjs", INSTANCE_SETUP]`) and its test `test/m/answer-envelope/families.test.mjs`:95 (`["../../../src/setup.mjs", "INSTANCE_SETUP_CHECKS"]`) | the composed catalogue finds a module's rows by the `_CHECKS` suffix of its files' exports; after the rows leave `setup.mjs`, `dec49Row("TRANSLATION_NOT_GRANTED")` and the other 15 codes find no source | **Yes, before `instance-setup` deletes the 102 lines** (§3.5 step 2): add `import * as TRANSLATIONS from "../translations/checks.mjs"` and `["src/translations/checks.mjs", TRANSLATIONS]` before `["src/setup.mjs", …]` (the module order). The precedent is `doorbell`'s (answer-envelope R12, T43-14). Add the edge `answer-envelope` → `translations`. |
| `promotion` | the census history of C-64 | names the rows as `instance-setup`'s | promotion's stamp at T50's close: the 16 rows CHANGED, `where` re-pointed, words unchanged (as `capture-split.md` §5 records for the doorbell's rows). |
| `membership` | `index.mjs`:278–308 `MODULE_ORDER` (the listener order) and `test/m/membership/module-order.test.mjs`:100–135 | a hard-coded list that must equal `modules.json`'s order; it holds `"setup-words"` at its old place (line 304, `"queue", "setup-words", "instance-setup"`) and has no `"translations"` | BOB's, with `modules.json`'s T50 opening (already edited, uncommitted): add `"translations"` directly before `"instance-setup"` (a name tolerated as not yet built until its job merges, T49-1's form) and move `"setup-words"` first. Not this job's code. |

### 4.3 Names only (nothing calls the moved code; no change forced)

| file:line | what it names | note |
|---|---|---|
| `control-plane/draft.mjs`:15–22, 64 | `DRAFT_OPS`, `TRANSLATION_DRAFT`, `TRANSLATION_RECORD` (op names) | the route names do not change |
| `control-plane/index.mjs`:28, 517–521, 3291–3310 | `NOT_ROUTED` holds `translationdraftrecord`; posts the answered draft to that store route | same |
| `op-declarations/index.mjs`:417–439, 2537–2541, 2607, 2624, 2673; `t33.test.mjs`:121–124; `t37.test.mjs`:64 | the family `"instance-setup"` (`owner`, `cite` "R64–R67, R69–R74") with the nine ops; `familyOf("translationdraft") === "instance-setup"` | the owner label goes to `translations` at `op-declarations`' next job, with its test |
| `op-grades/t37.mjs`:18–66; `marks.mjs`:147–148 | the ops by name; comments "instance-setup R67, R69–R73" | wording only |
| `affordances/act-help.mjs`:39–40; `wizard-scripts/screen-registry.mjs`:31; `civicsmith-library.mjs`:42; `skilldoctrine.mjs`:1717–1723 | the ops by name; `defined_by: "instance-setup R67"` | wording only |
| `screens-settings/index.mjs`:23, 52, 70–71; `settings.mjs`:19, 23; `translations.mjs` (2–125) | the screen draws `translations`, `interfacewords` and the five acts by op name | no change |
| `interface-shell/index.mjs`:60, 78, 148, 153; `browser.mjs`:1091, 1841 | `interfacewords` read after `whoami` | no change |
| `run-rules/deployment.mjs`:240, 267 | its own `TRANSLATION_DRAFT_MAX_WORDS = 100`, the same limit as R1's | no import; kept equal by hand |
| `setup-words/rows.mjs`:875 | the word `refusal.LANGUAGE_NOT_SET` (a note column naming "instance-setup R87"); its text differs from the row's (`setup.mjs`:416: "in Your account" against "in Settings › Your account, or name one here") | design stream's (DEC-232); the row is copied as it is |

### 4.4 Tests outside `test/m/instance-setup/` that reach the moved code

All reach it by op name or through the delegates; none needs changing: `plane/door.test.mjs`:90–101, 173–175; `plane/ask.test.mjs`:275–282; `plane/t45.test.mjs`:204–249; `plane/t48.test.mjs`:64–118; `op-declarations/t34.test.mjs`:159–160, 367–370; `op-declarations/t37.test.mjs`:57–242; `op-grades/pins.test.mjs`:79, 129; `op-grades/t48.test.mjs`:24–91; `interface-shell/*.test.mjs` (the `interfacewords` stub); `skills/translation.test.mjs`; `wizard-scripts/library.test.mjs`:476, 514.

## 5. Tests

`bio-plane/test/m/instance-setup/` holds 24 files (5,214 lines); tests are not counted in sizes.

### 5.1 Move to `bio-plane/test/m/translations/` (the translations job copies them; `instance-setup`'s job deletes them)

| file | tests that move | new id |
|---|---|---|
| `translations.test.mjs` (589 lines; 15 tests) | 1 `R69 translationGrant: refusals in order…` (61); 2 `R67 translationdraft to_language: refusals in order…` (115); 3 `R67 (K2238) translationDraftRefusal…` (163); 4 `R67 (DEC-157 (6)) an official name or translation…` (186); 5 `R67 translationdraftrecord to_language…` (201); 6 `R67 to_english (K2201, K2216)…` (239); 7 `R70 translationAdopt…` (275); 8 `R71 translationConfirm…` (323); 9 `R72 translationRevert…` (375); 10 `R73 translationMark…` (414); 11 `R74 translations…` (456); 12 `R74 interfaceWords…` (494); 13 `R75 the translation tables are this module's own…` (518); 14 `R75 (T38; N793) this module holds no NO_SUCH_MEMBER row…` (552). The file's header, helpers and `world()` go with it. | R3, R1, R1, R1, R1, R1, R4, R5, R6, R7, R8, R8, R9, R9 |
| `interface-words.test.mjs` (24 lines; 1 test) | `R68 INTERFACE_WORDS is setup-words' WORD_ROWS…` (10) | R2 |
| `t41.test.mjs` (159 lines) | `translationWorld()` (86–92); `R67 (T40: N812, K2373) store-door R10's NO_ACCOUNT…` (94); `R67 (T40) a translation draft carries no project…` (121). The shared constants (`DOOR`, `RETIRED`, `GROUP`, `PROJECT_ACCOUNTS`, `names`, `writes`) are copied. | R1 |
| `t48.test.mjs` (566 lines) | `R87 readingLanguage answers the member's own language…` (55); `R87 readingLanguage answers the language named…` (72). Both set a language with `memberLanguageSet`: they take the registered stand-in read (R11) instead. | R10 |

New tests the module owns beyond these: R11 (the registration and its controls), R12 (the instance, `migrate()` twice, the nine route keys), and its own copies of R13 (the row walk, below), R15 (`words.test.mjs`'s sweep over this module's rows and sentences) and R16 (`profiles.test.mjs`'s place sweep over its rows).

### 5.2 Stay in `instance-setup`, edited

| file:line | test | edit |
|---|---|---|
| `translations.test.mjs`:562–589 (moves out of the file; a copy stays) | `R30 every row of this module's table names, in its where, the function that holds its region…` | it walks every row of `INSTANCE_SETUP_CHECKS`: a copy stays (in `group.test.mjs`) over the rows that stay, with its last assertion (18 rows `C-64.11–.29` counted) changed to the rows left (`C-64.27–.29`: 3); the original goes with the others |
| `group.test.mjs`:136–157 | `R30 C-64.2, C-64.3, … C-64.31–C-64.33` | the expected list loses `C-64.11–.26` (less .18) and `C-64.31`: `Array.from({ length: 23 }…)` becomes the `C-64.27–.30, .32, .33` that stay; the `.31`–`.33` word-count branch loses `.31` |
| `t48.test.mjs`:470–474 | `R90 C-64.31–C-64.33: the three new rows…` | drops `LANGUAGE_NOT_SET`: two rows (C-64.32, .33) |
| `t48.test.mjs`:354 | `R89 the reads write nothing` | `w.m.readingLanguage({ member: "x" })` goes through the delegate and still passes; left as it is, or dropped with the delegate |
| `exports.test.mjs`:75–98 | `N348 this module holds no Durable Object door…` | unchanged while the routes stay (§3.2); loses the nine keys when `plane` re-points |
| `language.test.mjs`:25; `t47.test.mjs`:154 | `LANGUAGE_MALFORMED` rows `INSTANCE_SETUP_CHECKS.LANGUAGE_MALFORMED` | unchanged unless doubt 2 moves the row, then they read it from `translations`' export |

### 5.3 Stay as they are

`assistant`, `draft`, `fixture`, `identity`, `language`, `limits`, `page`, `places`, `profiles`, `recovery`, `relay`, `reports`, `seeds`, `t45`, `t46`, `t47`, `words`, `worker-reports`; and in `t41.test.mjs` the three R65 tests (32, 58, 149), in `t48.test.mjs` the other 28 tests (R88–R91, R47, R53/R55). `words.test.mjs`'s R63 sweep (22–30) and `profiles.test.mjs`'s R31 sweep (162–177) range over `Object.values(INSTANCE_SETUP_CHECKS)`, so they narrow by themselves when the rows leave.

## 6. Sizes

Measured with `wc -l` over `instance-setup`'s own paths (never tests), at HEAD `706a7f293a`. The "after" figures are measured on a scratch copy of `setup.mjs` with the §1.2 ranges deleted and the §3 additions written in (the scratch parses with `node --check`).

| | lines |
|---|---|
| `instance-setup` today | `setup.mjs` 4,000 + `setup-fleet.mjs` 71 + `livefire.mjs` 249 = **4,320** |
| deleted from `setup.mjs` (§1.2) | **819** (imports 4, rows 102, constants 18, tables 101, class 594); about 670 of them code, the rest comments and blank lines |
| added to `setup.mjs` (§3.2, §3.3) | **+21** (import with comment 2, registration with comment 2, banner 4, `#translations()` 1, eleven delegates 11, one blank 1) |
| `setup.mjs` after | **3,202** |
| **`instance-setup` after, delegates in place** | 3,202 + 71 + 249 = **3,522** |
| the same, if the 102 rows wait for `answer-envelope` (§3.5) | 3,624 |
| **`instance-setup` after, once the delegates and the nine route lines are gone** | about **3,497** (the banner goes too; the import, the registration and `#translations()` stay) |

`translations` after its job: about **990** lines. Moved from `setup.mjs`, 819; copied and kept in both, about 55 (`refusal` 4, `scriptRefusal` and `draftUnavailable` 7, `draftAccount` and `projectAccount` 13, `oneLine` 2, `canonicalTag` 2, `sha256OfBytes` 4, `#nameOf` 6, `#isAdmin` 3, `#juris` 1, `#activeIds` 4, the keep-away gate 10 less overlap); new, about 115 (header and imports 25, class accessors and constructor 25, `migrate()` and the declaration 20, R11's registration and its use 20, factory 8, `translationsOps` 14, the test-facing exports 3). Split over `index.mjs` about 750, `checks.mjs` about 110, `schema.mjs` about 130. Well under 4,000.

## 7. Doubts for BOB (best readings)

1. **The member's chosen language (R64) is read by R8 and R10 but is `instance-setup`'s.** `interfaceWords` with no `language` (3170) and `readingLanguage` with none (3204) both call `this.memberLanguage`, and `translations` is earlier, so it cannot import `instance-setup`. *Reading:* a registration, R11, made by `instance-setup` at its start; the same pattern as `producingGroup` with `promotion`, the group-identity source with `public-read` and `ai-accounts`' disclosure read. It leaves R64 and its table untouched. *Alternatives:* (a) move R64 (`memberLanguageSet`, `memberLanguage`, `member_languages`, its two ops, `language.test.mjs` 81 lines; about 45 lines of code) with the translations: fewer seams, but R64 is not in the brief and its readers (the account screens) re-point too; (b) the delegates resolve the language and pass it, so no registration: callers that re-point straight to `translations` would then lose the default. Not recommended.
2. **`LANGUAGE_MALFORMED` (C-119.12) has two owners' worth of raisers.** `#translationLanguage` (2659) raises it for R1, R3–R8 and R10; `memberLanguageSet` (R64, 2446) and `groupLanguagesSet` (R85, 1658) raise it too, and its `where` and region are in `memberLanguageSet` (288–293). A code is minted in one place (K231; the DEC-49 guard's arm A refuses a code held twice). *Reading:* the row moves to `translations` (it raises it more often than `instance-setup` does), with a region of its own in `#translationLanguage`; `instance-setup`'s two raisers build their refusals from `translations`' exported row (the edge exists). Until then (the copy window) both files hold it, as the doorbell's window did. Then `language.test.mjs`:25 and `t47.test.mjs`:154 read the row from `translations`. *Alternative:* the row stays here and `translations` holds an identical row marked a copy until `instance-setup` re-points: two sites for one code in the long run. The numbers C-64.11–.17, .19–.26 and .31 move whatever is decided.
3. **R55's gate is `instance-setup`'s and later.** `translationDraft` calls `this.assistantGate()` (2905), which is `ai-accounts.aiKeptAway()` as given (R55). *Reading:* `translations` asks `ai-accounts.aiKeptAway()` itself and copies the 8-line `try` of `assistantGate` (2262–2269) as a private gate; the behaviour is the same (the tests of `translations.test.mjs`:156–160 and `t41.test.mjs`:113–115 pin it), and R1's text says so (§2.1). The R55 gate itself stays, read by `plane/ask.mjs` and `store-door`.
4. **Two declarations of seven tables in the copy window.** `record-core.declareTable` refuses the whole batch for one table already declared by another module (`TABLE_DECLARED`, `index.mjs`:1455), and `InstanceSetup.start()` keeps the answer in `out.purge` and checks nothing (1217): a refused batch would silently drop the purge exemption of *every* `instance-setup` table. *Reading:* in the window `translations`' declaration treats `TABLE_DECLARED` with `declaredBy: "instance-setup"` as held (same classes), and `instance-setup` is built and started first, as `plane/store.mjs` does now (496–504); `translations`' own ownership assertion is red only until `instance-setup`'s delete lands, where it declares the seven under its own name (the doorbell's doubt 4 and its R25). The delete removes lines 522–524, 553–561 and 758–846 in the same change, so there is no later window.
5. **The 16 rows are the one deletion that waits on another module.** See §3.5 and §4.2: `answer-envelope` must list `translations`' checks file first. *Reading:* the translations job merges first; `answer-envelope`'s job adds the entry (a one-line change and one test entry); `instance-setup`'s job deletes. If `answer-envelope`'s job is not in T50, `instance-setup` is 3,624 lines with delegates, still under 4,000, and the 102 lines go at `answer-envelope`'s next touch.
6. **The word list is exported only by `translations` after the split.** `INTERFACE_WORDS` and `INTERFACE_WORDS_COMMIT` have no importer in `src/` and none in a test outside the moved ones (grep), so `instance-setup` keeps no re-export. *Reading:* no delegate; any later user reads `setup-words` (layer 1) for the list, and `translations` only for a language's state.
7. **`extraction` joins `translations`' uses** for one call, the term fold in the official-name match (`#officialFor`, 2791-2794; R1, DEC-157 (6)). It is earlier (52) and `instance-setup` already uses it, so no cycle; the alternative, a copy of the fold, would be a second place for a rule `extraction` holds. *Reading:* use it.
8. **`membership`'s `MODULE_ORDER`** (§4.2) is a list that must equal `modules.json`; it is already stale for `setup-words` (T50's opening) and has no `translations`. It is BOB's with `modules.json`, not this job's; named here so the pin test does not turn red on the merge.
