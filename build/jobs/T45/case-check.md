# case-check (T45)

**Status** · session_0147VSsrfyRUc6H7GZeANVWi · depth 2 · WORKING · handled B0

## J1 · QUESTION

My readings, building on them now (none blocks me; answer only where you differ):
1. **The check's id.** Prefix `CHK`, minted opaque through `record-core.mintOpaqueId("CHK", year, "", taken)` inside R1's transaction, as case-authoring mints `CASE` and `WCD`. No `ID_TABLE` change (record-grammar is layer 1, closed); the Uses' "allocId (a check's opaque id)" read as that.
2. **`void`'s `why`** is a list of every cause that holds, in R2's order (`document_replaced` first). `member_moved` names each member `{bundle_id, pinned, current}`. With `document_replaced` the lapse reads are not asked (the checked text is gone). R5's key: `key` is the first cause's (`case.check.void.<why>`), `keys` one per cause.
3. **R1's repeat.** To find the edition before writing, R1 runs `publishCase` once in a savepoint it rolls back (R18), reads R2 over that edition's latest check, and answers it `existed: true` when `held`; otherwise it runs `publishCase` again for real and records the check. Order: R1's machine/authority refusals come from the pre-flight (`first`), so the repeat is reached only when `ready`.
4. **`published`** wins over `void` and `held`: a `published_cases` row for the check's case edition answers `published` with the edition.
5. **Purge (R4).** `case_checks` declared `{keys: [], whole: "NOT EXISTS (published_cases of that case edition)"}`, classes as `declarePurge`'s default: cleared with the unsigned preparations, kept beside a ratified edition (where it reads `published`).
6. **The fence (R2)** uses `publication.hasCaseStanding` over the stored document of the check's case edition; when none is stored it is asked of a stand-in document naming the check's own `project` (recorded on the row), so a replaced or purged preparation never opens the read.
7. **Rows, family C-148:** C-148.1 `NO_SUCH_CASE` (R2's fence and an absent case) and C-148.2 `NO_ID` (R3). No row for any state (R5). `src/gate.mjs`'s aggregate of check tables is not mine: I will REPORT that it should list `CASE_CHECK_CHECKS`.
8. **`publishcheck`'s op arm** gathers `case-authoring.calculationsAtPublication` first, as `publishcase` does, and passes its facts to both the pre-flight and the act.
