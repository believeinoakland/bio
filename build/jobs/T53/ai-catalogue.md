# ai-catalogue (T53)

**Status** · session_018BhceegGiraj92rsxu2cuC · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

## AI-CATALOGUE #1 (T53, layer 2) — report

**Entries applied**
- T53-74 (N1220, K5457): the signed closed list of AIs, new module `bio-plane/src/ai-catalogue/` (`checks.mjs`, `validate.mjs`, `lifecycle.mjs`, `schema.mjs`, `index.mjs`; 1,465 lines). Schema and `validatePayload` (R1–R23, R36, R51, R53), lifecycle and advisories (R24–R27), the reads (R28–R32, R38), the signed channel through `signatures` R49–R53 (`pullRequest`, `receive`, `loadSeed`, `rollback`, `unrollback`; R33–R42), the tables declared through record-core (R46), invariants (R47–R50, R52). 117 interface tests under `bio-plane/test/m/ai-catalogue/`, over the real record-core and real signature verifiers, every payload signed with throwaway keys, the provider made up (`fakeco`).
- T53-76 (K5482): `tested` AIs (R54), one `combined` record per subject and part (R55), the library rows with R43–R45 as amended (six calendar months active, `on_list`, `confirmed`).
- T53-75 (K5457, seed payload): **not done, waiting** as the plan marks it, on BOB's catalogue key ceremony and Bob's pass marks (K5475). The mechanism is built and tested (`loadSeed`: verified as a pulled payload, held as `source: "seed"`, an older seed `NOT_NEWER`, a badly signed one leaves the copy `unavailable`); no seed payload or shipped provider data exists yet, so R39 is not claimed.

**Decisions made at my level (reported, not asked)**
- Check family **C-156** (new; C-155 the highest in the tree), C-156.1–.13, rows `{check, where, word}` with `word` the key `ai.refused.<code>` and no sentence (R49). Asked BOB to confirm the number in case a parallel T53 job also took C-156; no answer yet.
- Parameters are the Suggestions' proposed values (START set none): ENTRY_ID_MAX 96, DISPLAY_NAME_MAX 60, EFFORT_WORD_MAX 16, INDEX_MAX_BYTES 64 KiB, CATALOGUE_MAX_BYTES 4 MiB, HELD_VERSIONS 5, stale_after_days 14 and review_period_days 90 (payload policy data), RESULT_ACTIVE_MONTHS 6, CATALOGUE_USER_AGENT `Civicsmith-catalogue/1`.
- `CATALOGUE_ADDRESS` = `https://ai-issuer.believeinoakland.workers.dev/catalogue/index.json` (the issuer's workers.dev address, as `INSTALLER_UPDATE_ADDRESS` is the installer's). `ai-issuer`'s job must serve the index there, payloads at relative paths beneath it.
- Claim forms (R1 against R4, R7, R16): value-set fields are `{value, ev}` or `{open: true}`; records with fields of their own carry `ev` beside them; a check is `{answer, ev}`, `{answer: "OPEN"}` or `{open: true}`; a restriction is R16's `{kind, quote, page, date}`. Stated in `validate.mjs`'s header.
- `validatePayload` answers `code: CATALOGUE_PAYLOAD_INVALID` (R36) with `reason` the specific rule's code (R1's `CATALOGUE_EVIDENCE_MISSING`, R4's `CATALOGUE_ENTRY_INVALID`, R16's `CATALOGUE_PLAN_INVALID`) and `path`.
- A payload's text is stored in chunks of at most 480,000 characters: a 4 MiB payload would exceed the store's ~2.1 MB single-value limit.
- R46 says the tables are append-only and R42 says old payloads are dropped: rows are never updated; R42's drop is the one deletion. Declared `version_chain: true`, `purge: exempt`, `export: admin-only`.
- R42 also keeps any payload holding the last record of an entry or plan a later payload left out (R25), so omission never loses a record.
- An index lists each advisory as its fields plus `armored`; `receive` of the index answers `fetch` (R34's request) when its payload is newer, and the payload `receive` is judged against that index line.

**Not done, and why**
- R39 (the seed and shipped provider data): waits on the key ceremony and pass marks (above).
- The rows' word keys (`ai.refused.catalogueevidencemissing` … `ai.refused.checkunknown`, 13, and `ai.catalogue.state.{unavailable,needs_newer_release,stale,current}`) are not in `words.json`; that file is the UX stream's. The module names the keys and reads no words, so nothing fails today; the screens need them before they show these refusals.

**Found in other modules**
- `words.json` (UX design stream): the 17 keys above are missing (R49's screens read them).
- `ai-issuer` (layer 11): must serve the index at `CATALOGUE_ADDRESS` in the shape `receive` reads (`{index_version, catalogue: {seq, schema_version, issued_at, sha256, bytes, path, armored}, advisories: [{…fields, armored}]}`), and reads `ADVISORY_REASONS` and `validatePayload` from this module.
- `bio-plane/src/gate.mjs`'s row census does not list C-156 (it lists families by import); owned elsewhere, for whoever keeps the census.

**Met** · R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21, R22, R23, R24, R25, R26, R27, R28, R29, R30, R31, R32, R33, R34, R35, R36, R37, R38, R40, R41, R42, R43, R44, R45, R46, R47, R48, R49, R50, R51, R52, R53, R54, R55

Tests: 117/117. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceegGiraj92rsxu2cuC): test runs 1, module lines 1470
