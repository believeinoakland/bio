# record-core (T41)

**Status** · session_013ReqojuRgnmvwKseFV6CE9 · depth 2 · COMPLETE · handled B1

## Completion (RECORD-CORE #19)

**Reading set** (mechanics §17): measured at START at 245 KB, under 300 KB; read whole myself: `build/requirements/record-core.md`; the public parts of `record-grammar`, `id-spaces` and `test-support` (my Uses); layer 2's row and contract in `build/layers.md`; the plan's entry T41-2a and its rules at the opening; K2431 and K2435 in `build/rulings.md`; every file of `bio-plane/src/record-core/`, of `bio-plane/test/m/record-core/`, and `bio-plane/test/stats-disclosure.test.mjs`.

**Entries applied (T41-2a; K2431, K2435).**
- R62: `mintExhausted` names `STP` "step" and `GUD` "reading guide" (`MINTED_OBJECT`), so its detail for each is its own fixed sentence ("…could not find a free step id…", "…a free reading guide id…").
- R76: `STP` and `GUD` are minted opaque by `allocId`/`allocIdOp`, read from record-grammar's `ID_TABLE` (no code change was needed there: `OPAQUE_PREFIXES` is derived from the table); now tested by name.

**Tests.** `t33.test.mjs`:68 (R76: opaque prefixes now eight) and :161 (R62: the names now include step and reading guide) re-pinned. New t33 test "R76 R62 (T41, K2431)": each of STP and GUD is opaque in `ID_TABLE`, mints `<P>-2026-<16>` recorded in the ledger with no counter stepped, and after 64 hits answers `MINT_EXHAUSTED` (C-59.6, its row's translation) naming a step or a reading guide with nothing written; negative control: `STPX` and `GUDE` are minted by the counter and named by no object. `t35.test.mjs` R82's prefix list gains STP and GUD (their sentences meet R82's wording rule). Negative control run: with `index.mjs` reverted to the tranche's, the new and re-pinned tests fail (3 fail, 62 pass); restored, all pass.

**Fixed in my own tests: `stats-disclosure.test.mjs`**, red on the tranche since T36 and not on the accepted list: it sent every credential as `?token=` (refused `CREDENTIAL_IN_ADDRESS`, admission R20, K2166) and used the shared member token, a class that no longer exists (admission R5, T36). The credential now travels in the `Authorization` header, and the member-token arms are removed, with member-class sight still covered by member sessions in every arm (A–F). 31 pass, 0 fail.

**Ran.**
- `node --test bio-plane/test/m/record-core/*.test.mjs`: tests 164, pass 164, fail 0. `stats-disclosure.test.mjs`: 31 pass, 0 fail. No layer tests named in the manifest.
- Users' suites (91 modules whose `uses` names record-core, 966 files, 8-way concurrent): tests 7122, pass 7092, fail 19. None is mine:
  - Red on `tranche/T41` without me (as record-grammar's record lists them, or rerun on a clean worktree of `origin/tranche/T41`): affordances `t36.test.mjs:43`; answer-envelope `catalogue-end.test.mjs:17` (rerun: red on the tranche), `families.test.mjs:250`; answers `standing.test.mjs:122`, `:273` (accepted 6); case-authoring `photos.test.mjs:101`, `preflight.test.mjs:67`; case-disclosures `photos.test.mjs:39`; filings `outward.test.mjs:136` (accepted 9); membership `module-order.test.mjs:13`, `:98`, `t9-notice-sight-bounds.test.mjs:158`, progressions `order.test.mjs:16`, promotion `registry.test.mjs:58`, standards `reads.test.mjs:200` (MODULE_ORDER, accepted 5); progressions `define.test.mjs:199` (record-grammar's, routed to T41-10b); `system/row-census.test.mjs` (C-33.54 arrived, accepted 2; C-35.13 changed, text-chain's).
  - Load, not this change: events `pages.test.mjs:35` (16 s under concurrency; passes alone on this branch and on the tranche).
  - Not a test: `test/fixtures/row-census-1.67.0.jsonl`, a fixture promotion's `tests` lists, which `node --test` cannot parse.
- Checks: `format` 0 failures; `architecture record-core` 0 failures; `coverage record-core` 82 of 82; `ownership record-core tranche/T41` 0 failures.

**Deferred.** None.

**Found in other modules.**
- `promotion`: its `tests` in `modules.json` lists `bio-plane/test/fixtures/row-census-1.67.0.jsonl`, a fixture; a run over a module's `tests` paths treats it as a test file and fails to parse it. BOB's (modules.json).
- Generated artifacts staled: the plane bundle (it inlines record-core); regenerated at the layer's close (accepted 12).

Size (session_013ReqojuRgnmvwKseFV6CE9): test runs 14, module lines 2294

## J1 · COMPLETE

T41-2a complete (08ca17ab12): R62 mintExhausted names STP 'step' and GUD 'reading guide'; R76 STP/GUD minted opaque, tested by name with a negative control (STPX/GUDE: counter, no object). t33:68 and :161 re-pinned; t35 R82 list gains both. Own fix: stats-disclosure.test.mjs (red since T36, not accepted) sends the credential in the Authorization header and drops the retired member-token arms; 31/0. record-core 164/164; checks format, architecture, coverage 82/82, ownership 0 failures. Users' suites (91 modules) 7092/7122: every red is red on the tranche without me, or load (events pages:35, passes alone); none mine. Found: promotion's tests list a .jsonl fixture (modules.json); plane bundle staled. Record: build/jobs/T41/record-core.md, Completion.
