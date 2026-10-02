# record-core (T24)

**Status** · session_01GDBx64mMFCCwSytRPN41WV · depth 2 · WORKING · handled B1

## J1 · QUESTION

R75 `recordOpaqueId`, three readings I am building on (carrying on; none blocks the job):
1. **Rows.** Its three refusals are this module's own rows in `RECORD_CORE_CHECKS`, taking C-59's next free numbers beside C-59.5/.6 (the id-allocation family): C-59.7 `OPAQUE_ID_MALFORMED`, C-59.8 `OPAQUE_ID_SPENT`, C-59.9 `OPAQUE_ID_NO_TRANSACTION`, each `where` naming `recordOpaqueId`'s DEC-49 region, translations BUILD-FAULT-style for MALFORMED and NO_TRANSACTION (a caller's defect) and a member's sentence for SPENT. All three `awaiting stamp` for promotion's T24 L2 stamp (1.54.0); listed in my COMPLETE.
2. **Never throws, store failure.** If the ledger cannot be read or the INSERT fails (no table, a primary-key clash a lost read let through), it answers `OPAQUE_ID_SPENT` naming the id, recording nothing: fail closed, so a caller never uses an id the ledger has not taken. The detail says the ledger already holds it or could not confirm it free.
3. **Malformed** is read literally: not a string, or the empty string. A whitespace-only or any other non-empty string is accepted as an opaque id (the requirement names no grammar; the consumer's own id form is its business). The ledger row's `source` is `'chosen'`.
