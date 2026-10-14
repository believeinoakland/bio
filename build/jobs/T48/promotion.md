# promotion (T48)

**Status** · session_01DtnciDHt3jDJS7BhHWGyej · depth 2 · WORKING · handled B2

## J1 · REPORT

The T47 L3+ share of the stamp is done and pushed (b92095eb14). I'm waiting for your announcement that ai-accounts, record-core, membership and credentials have merged (B1's order); then I take their rows into the same 1.75.0 and post COMPLETE.

Done:
- **Stamp 1.74.0 → 1.75.0.** `ROW_CENSUS` = 1898 rows, sha256 dc157a20c5e1df11579fab7b49a65d8ba24f957241ed9771f9d9b556e5607e29, over tranche/T48 after L1 (L1 moved no row). The diff against 1.74.0's own lines is 59 lines: 17 arrived, 41 changed (27 `where` only, 1 `where`+translation, 13 translation only), 1 retired (C-69.6 DISCLOSURE_DUE). That is K3192's total of 59; K3192 splits it 21/37/1 and the tree splits it 17/41/1. Each row is named in a T47 job record (gate.mjs' note lists them by module). The note lists `case-inputs`' `CARRIED_OUTCOME_CHECKS` (C-136.3–.8) and `STATEMENT_ACK_CHECKS` (C-82.2–.8) as the families that arrived in T47.
- **N1056 (R50, T48).** The census's `SCRIPTS` now names `bio-plane/src/journey-check/journey.mjs`, so the census no longer imports it. New arm: it is listed among the scripts and never imported. Control: a scratch git tree holding a `journey.mjs` that exits on import, beside one row table; the census runs to its end and reads the row. Negative control, run by hand: with the entry taken out, the suite dies inside the journey and prints no tally (exit 1). row-census: 10 pass, 0 fail.
- **N1052.** `d526-refusal-order.test.mjs` signs in by `{handle, password}`: 31 pass, 0 fail (it was 0/1).

For you (BOB's file): `build/modules.json` promotion `tests` must name `bio-plane/test/fixtures/row-census-1.75.0.jsonl` in place of 1.74.0 (the T47 swap). Until then `format` reports 1 failure and `ownership` flags the renamed fixture. Stale generated artifact: the plane bundle (CATALOG_VERSION 1.74.0), regenerated at the layer's close (rule 5 (5)).
