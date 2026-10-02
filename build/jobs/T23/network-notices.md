# network-notices (T23)

**Status** · session_01XftQvd4G9DgVwWXFazJx1b · depth 2 · WAITING ON BOB (J2) · handled B3

## J1 · QUESTION

Three readings I am building on; nothing waits on the answer unless you rule otherwise.

1. **How a change names its notice (R1, R6).** `prepareNotice` takes no notice id, yet R1 refuses "a first revision while the project already has an open notice" (`NOTICE_ALREADY_OPEN`) and R6 makes a change "a new revision of it". My reading: an optional `notice` argument. Absent, the call prepares a first revision (refused `NOTICE_ALREADY_OPEN`, naming the open one, when one is open). Present, it prepares the next revision of that notice, which must be the project's latest notice and not stopped.
2. **Three refusals R1 does not list, as new C-127 rows after R1's twelve** (the same family, `awaiting stamp`): `NOTICE_NOT_OPEN` (C-127.14: a change or a stop to a notice that is stopped, not the project's latest, or absent; R11 "a stopped notice takes no further revision"); `NOTICE_SINCE_EARLIER` (C-127.15: R6 allows only "a later `since`"); `NOTICE_UNCHANGED` (C-127.16: a revision that changes none of R6's fields and is not a stop). Rows C-127.1–.13 are R1's and R4's codes in their order.
3. **"Writes nothing" (R2) with a notice id minted at the first revision (R3) and a prepared answer R4 must find.** I hold prepared answers in the instance's memory for 60 minutes, keyed by member and digest, and reserve one notice id per project per UTC day the same way, so two identical prepares on one day answer byte for byte. The id is drawn by `record-core.mintOpaqueId` under prefix `NOTE` (the signer page's placeholder already shows `NOTE-2026-4817`), which records it in record-core's own mint ledger; this module's tables are untouched. An evicted instance answers `NOTICE_STALE` and the owner prepares again.

## J2 · REPORT

The module is built and its 52 tests pass (R1–R30 each named; module 1,311 lines). Still to do: public-read R18's registration, after your CHANGE. What I found in other modules, each needing a decision from you or another job:

1. **record-core: there is no service to record a chosen opaque id, or to ask whether one is free (your B3 (3)).** Prepare now draws the id with `mintOpaqueId` inside a transaction it rolls back at once, so record-core's own R7 takes the draw back and nothing durable is written. Post records the notice in its own transaction (`NOTICE_STALE` if the id has been taken meanwhile), but cannot record it in `minted_ids`. The ledger learns the id at the next boot from my mint seed (record-core R40, R70: `[NOTE, nn_notices, notice_id]`). Service needed: `recordOpaqueId(id)` (or a `mintOpaqueId` variant taking a chosen id), recording the id inside the caller's transaction and refusing one already spent.
2. **provenance R56 cannot say whether an instance key is bound without signing.** R1's `NOTICE_NO_INSTANCE_KEY` therefore signs a probe statement (`civicos-working-on-probe/1`) and discards it. On a key's first use, that writes `receipt_keys.first_used` (provenance's own row), so the date can come before the key's first real statement. An improvement for provenance: `instanceKeyBound()`.
3. **credentials keeps no revocation date (its R8; signers has no column for when a key was revoked).** R21 wants "revoked with its date". I record the date this copy first sees a key revoked (`nn_key_revocations`, observed at each seal or attestation tick). That is honest, but late by up to a day. An improvement for credentials: record `status_at`.
4. **L11, starting with my merge:**
   - red 5 for my ops in affordances and op-declarations totality: `noticeprepare`, `noticepost`, `notices`, and a fourth, `directorysubmission` (R23).
   - control-plane's `families.test.mjs` totality will turn red once you write my paths: my `NETWORK_NOTICE_CHECKS` (C-127.1–.16) is a family `CHECK_FAMILIES` does not list.
   - The row census (promotion R50) gets 16 new rows (red 7), and they are listed `awaiting stamp` in my record.
5. **Names for later jobs:** `networkNoticesOf(host, deps)`; `openSeals({case, edition})` (async); `noticeReferenceOf(project)`; `noticesOf({project, viewer})`; scheduler `sealDue/sealWake/sealTick` and `attestDue/attestWake/attestTick`, and `networkNoticesConsumers(m)` answering `working-on-seal` and `working-on-attest` as `{due, wake, tick}`; ops map `networkNoticesOps(m, url, body)`; public reads `networkNoticesPublicReads(m)` → `noticespublic`, `groupkeys`, `noticemethod`.
