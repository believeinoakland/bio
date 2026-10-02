# network-notices (T23)

**Status** · session_01XftQvd4G9DgVwWXFazJx1b · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am building on; nothing waits on the answer unless you rule otherwise.

1. **How a change names its notice (R1, R6).** `prepareNotice` takes no notice id, yet R1 refuses "a first revision while the project already has an open notice" (`NOTICE_ALREADY_OPEN`) and R6 makes a change "a new revision of it". My reading: an optional `notice` argument. Absent, the call prepares a first revision (refused `NOTICE_ALREADY_OPEN`, naming the open one, when one is open). Present, it prepares the next revision of that notice, which must be the project's latest notice and not stopped.
2. **Three refusals R1 does not list, as new C-127 rows after R1's twelve** (the same family, `awaiting stamp`): `NOTICE_NOT_OPEN` (C-127.14: a change or a stop to a notice that is stopped, not the project's latest, or absent; R11 "a stopped notice takes no further revision"); `NOTICE_SINCE_EARLIER` (C-127.15: R6 allows only "a later `since`"); `NOTICE_UNCHANGED` (C-127.16: a revision that changes none of R6's fields and is not a stop). Rows C-127.1–.13 are R1's and R4's codes in their order.
3. **"Writes nothing" (R2) with a notice id minted at the first revision (R3) and a prepared answer R4 must find.** I hold prepared answers in the instance's memory for 60 minutes, keyed by member and digest, and reserve one notice id per project per UTC day the same way, so two identical prepares on one day answer byte for byte. The id is drawn by `record-core.mintOpaqueId` under prefix `NOTE` (the signer page's placeholder already shows `NOTE-2026-4817`), which records it in record-core's own mint ledger; this module's tables are untouched. An evicted instance answers `NOTICE_STALE` and the owner prepares again.
