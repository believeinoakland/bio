# case-import (T50)

**Status** · session_013i42TtrczRChAapYgmx3CQ · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

One reading, carried on with; cheap to change.

R25 says a malformed `matter_stake` is recorded `null` "with a sentence saying why (`group_fields_note`, a key of `words.json`)". `words.json` holds no such key: it is owed item 4 in the L7–L10 fold's "Keys owed to the design lane", and plan rule 6 forbids my holding the English.

My reading: the edition answers `group_fields_note` = the list's word for the key `case-import.group_fields_matter_stake` when the list holds it, and `null` until it does. The module holds no English for it; nothing is guessed. Tests pin the null-until-held arm and the equal-to-the-key arm, so the day the key lands the sentence appears with no code change here. If the design lane names the key differently, `MATTER_STAKE_NOTE_KEY` in `case-import/words.mjs` is the one line to change; the key is outside the `words-reads.json` list on purpose (its test pins that list to the owner's declaration).

So R25's sentence is unmet until the key exists. Everything else of R25 and R26 is built and tested.

## Completion (T50-15)

**Entries applied** (requirements `build/requirements/case-import.md`, K3635):
- **R25** `groupFields` may carry `matter_stake` (`public-read` R36's shape `{stake, set_by, set_at, source: "project"}`, or `null`): recorded in the same row as the six fields and answered in `group_fields.matter_stake`, labeled as they are. Absent reads `null` with no note; an edition recorded before T50 reads `null`. A malformed one (not an object, wrong keys or types, text over 2,000 characters, a lone surrogate) is recorded `null` with a marker, the other fields intact, the import never refused; `group_fields_note` is then the list's word for `caseimport.stake.unreadable` (DEC-323; BOB's B2 answer to J1, K3727; the key is in the module's `WORD_KEYS` beside the owner's declared list, which does not name it yet). A key other than the six, `read_at` and `matter_stake` is still `not_its_shape`.
- **R26** `importedCases` answers `latest_edition`; each edition carries `importer {member, handle}` (the handle from `membership.memberFacts`, `null` where none; the founder `admin` by `founderHandle()` with `founder: true`) beside the unchanged `imported_by` and `imported_at`, and `findings`, `recreated`, `recreated_in_part`, `did_not_recreate` counted over the latest recreation (R3), each `null` where none is recorded. The editions list is shared with `importedCase`, so it carries them too. Empty and non-member answers unchanged.
- **Plan rule 6** every member-facing sentence is read by key through `setup-words` (`src/case-import/words.mjs`, keys = the owner's `words-reads.json` list for `case-import`, pinned by a test): the exported sentences (`STATEMENT`, `SOURCE_BAR`, `GROUP_FIELDS_LABEL`, …), R21's reasons, the checker's `unread` reasons, `grades`, and every refusal row's `translation` (`refusal.<CODE>`). The tests that compared English (`voice`, C-130.15/.16) compare the key's word. "labeled" and "team" follow the list; the module says neither "labelled" nor "group's Civicsmith".

**Fixed in my own module (P8)**: the founder's viewer is the bare `admin` (membership R43), which `positionalMember` reads as no member, so `importedCases`, `importedCase` and every other read answered the founder "no import exists"; `#member` now reads bare `admin` as `member:admin`. Tested in R26's founder arm (claimed instance: she sees the list; unclaimed: she does not, as before).

**Deferred**: none.

**Reported to BOB (words no key holds, for the design lane)**: (1) `words-reads.json` for `case-import` should list `caseimport.stake.unreadable` (the module reads it; the file is the design stream's, not mine to edit); (2) the departures `importCaseFile` names itself in `IMPORT_NOT_A_CASE_FILE`: "no part was given", "part N is not bytes", "the manifest does not name its group, case and edition", which `words-reads.json` lists in no key (they stay as before: `case-grammar`'s departures are its own); (3) the refusals' `detail` strings stay in source, as `words-reads.json` marks five of them `unkeyed` (DEC-258 (3)) and the rest follow the same rule.

**Found in other modules**: none.

**Tests and checks run** (at the commit below):
- `node --test bio-plane/test/m/case-import/`: tests 126, pass 126, fail 0 (97 before; 29 added or changed), after merging `tranche/T50` @ the K3727 commit.
- The 38 other test files that mention this module (`grep case-import|caseImport|CASE_IMPORT`): the same four failures before and after my change (stashed and compared): `interface-shell` R10 (act labels), `answer-envelope` families R15/R7/R2, `system/row-census`. Inherited, none mine.
- `node checks/run.mjs /home/user/bio` from the process repository: format 0 failures; architecture 0 failures (3,472 files); channels 0 failures; coverage 32 failures on other modules (case-import's 26 of 26 ids named).
- `node checks/ownership.mjs /home/user/bio case-import tranche/T50`: see the next entry after the final commit.

Size (session_013i42TtrczRChAapYgmx3CQ): test runs 17, module lines 2235

## J2 · COMPLETE

T50-15 is applied: R25 (`matter_stake`; a malformed one is recorded null with `caseimport.stake.unreadable`'s sentence, per your B2) and R26 (`latest_edition`, each edition's `importer` and its findings counted by result, null where none is recorded), plus plan rule 6 for the whole module (words by key through `words.mjs`, refusal rows read `refusal.<CODE>`). I also fixed one flaw of my own: the founder's bare `admin` viewer was read as no member, so she saw no imports.

Module tests 126 of 126; format, architecture, ownership and the module's coverage (26 of 26) 0 failures; the other 38 test files that mention this module fail exactly as before my change (4, inherited). tranche/T50 merged through K3727.

For the design lane: `words-reads.json` for `case-import` does not yet list `caseimport.stake.unreadable` (the module reads it), and `importCaseFile` names three departures of its own (no part given, a part not bytes, a manifest naming no group, case and edition) that no key holds. Details are in my record's completion section.
