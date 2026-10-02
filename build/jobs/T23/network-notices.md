# network-notices (T23)

**Status** · session_01XftQvd4G9DgVwWXFazJx1b · depth 2 · COMPLETE · handled B4

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

## Completion

**Entries applied** (B1, `build/plan/current.md` T23 layer 8: network-notices, new, DEC-111, K1019, K1031, K1100; B2 K1143; B3 K1145; B4 K1150, K1151). R1–R30 met and each named by a test.
- **The module**, created at `bio-plane/src/network-notices/`: `index.mjs` (the class, `networkNoticesOf(host, deps)`, the ops, public reads and scheduler consumers), `seals.mjs` (pure: UTC ISO weeks, the levels and the method, the padded salted Merkle seals, `verifyOpening`), `checks.mjs` (family C-127), `schema.mjs` (ten `nn_*` tables, each declared to purge with no bundle key, so only the whole-store purge clears them, R26).
- **BOB's rulings followed** (K1114 (c)): revisions are owner-signed (`NS_NOTICE`, `noticeStatement`, `verifySshsig` against the member's own attesting keys) and attestations are copy-signed (provenance `instanceSign` over `instanceStatement("civicos-working-on-attestation/1", sha256)`), two objects. No notice is published without an instance key. `monthly` falls on each month's first day UTC. A lapse follows two consecutive `Dormant` monthlies with no revision between them. Weeks are UTC ISO weeks. Seals are padded Merkle trees (1,024 slots per project-week, 256 per week root, the next power of two above when exceeded), with one timestamp per instance per week. Notice ids are drawn with `mintOpaqueId` under prefix `NOTE` (K1115).
- **Answers to J1 applied** (B3, K1145): the optional `notice` argument; C-127.14 `NOTICE_NOT_OPEN`, .15 `NOTICE_SINCE_EARLIER`, .16 `NOTICE_UNCHANGED`; prepare writes nothing durable. The id is drawn inside a rolled-back transaction, held in memory per project per UTC day, and recorded at post, with `NOTICE_STALE` if it was taken meanwhile. Prepared answers are held in memory for 60 minutes; an evicted instance answers `NOTICE_STALE`.
- **Public reads** registered at start with `public-read` R18 (B4, K1150): `activitymethod` (R10), `noticespublic` (R20, params `after`, `limit`), `groupkeyspublic` (R21). The registration's answer is kept as `publicReadsRegistration`.
- **Readings of mine:**
  - "The lapse also goes into the group's record" is read as the `lapsed` attestation itself, kept and served for good (R20, R22).
  - R23's title is the signed case document's `title`, else its first `# ` heading; its summary is `published_cases.scope`.
  - The doorbell is `?op=knock` (capture R32's op).
  - The warning, the caution and "others welcome" carry a code and a plain statement of meaning. Their words are the UX design stream's (K1031 (5)), cited, never decided.

**Names for later jobs** (J2 (5), with B4's names):
- `networkNoticesOf(host, deps)`.
- Methods: `prepareNotice`, `postNotice` (both async), `openSeals({case, edition})` (async; ratification R37), `noticeReferenceOf(project)` (case-authoring R41), `noticesOf({project, viewer})` (queue-producers R27), `directorySubmission`, `noticesPublic`, `groupKeysPublic`, `activityMethod`, `verifyOpening`.
- Scheduler: `sealDue`, `sealWake`, `sealTick`, `attestDue`, `attestWake`, `attestTick`, and `networkNoticesConsumers(m)` answering `working-on-seal` and `working-on-attest` as `{due, wake, tick}` (scheduler R5).
- Ops map: `networkNoticesOps(m, url, body)` with `noticeprepare`, `noticepost`, `notices` and `directorysubmission`.
- Public reads: `networkNoticesPublicReads(m)`.

**For my `modules.json` entry (BOB's):** `paths` `["bio-plane/src/network-notices/"]`, `tests` `["bio-plane/test/m/network-notices/"]`. `uses` unchanged. My source imports record-core, membership, credentials, promotion, provenance, project-stage, publication, public-read, host-governor, signatures (`sshsig.mjs`, `tsa.mjs`) and record-grammar. capture is used only by its op's path (R3's doorbell). The tests also import signatures' `scripts/sign-sshsig.mjs`.

**Deferred** (B4, K1151; each goes to T24):
- N503: record-core has no service to record a chosen opaque id. Workaround: the boot-time mint seed `[NOTE, nn_notices, notice_id]`, with `NOTICE_STALE` at post.
- N504: provenance has no `instanceKeyBound()`. Workaround: R1's key check signs a probe statement (`civicos-working-on-probe/1`) and discards it.
- N505: credentials keeps no `status_at`. Workaround: R21's revocation date is the date this copy first saw the key revoked (`nn_key_revocations`, observed at each seal or attestation tick).

**Found in other modules** (REPORT J2):
- The three gaps above.
- Red 5 for my four ops (affordances and op-declarations totality, until L11).
- control-plane's `families.test.mjs` totality, accepted until control-plane's L11 merge.
- After merging `tranche/T23` (B4), the plane bundle is stale from earlier L8 merges: its inputs `src/case-grammar/index.mjs`, `src/corpus-export/index.mjs`, `src/public-read/door.mjs`, `src/public-read/index.mjs`, `src/publication/index.mjs` and `src/publication/schema.mjs`. None is mine, and no plane file imports this module. I regenerated nothing (manifest, "Generated artifacts").
- `test/m/plane/worker.test.mjs`:39 (502 from the bundled plane) follows from that stale bundle.
- `test/m/conformance/record.test.mjs`:144 calls `publication.exportManifest`, retired by publication's merge (N483, conformance's L9 share).

**Rows, each `awaiting stamp` (T24's layer-2 stamp; accepted red 7), all new, family C-127:**
- C-127.1 MACHINE_CANNOT_POST_NOTICE
- C-127.2 NOTICE_NOT_THE_OWNER
- C-127.3 NOTICE_PROJECT_CLOSED
- C-127.4 NOTICE_NO_GROUP_SLUG
- C-127.5 NOTICE_NO_INSTANCE_KEY
- C-127.6 NOTICE_WORDING_MALFORMED
- C-127.7 NOTICE_SINCE_MALFORMED
- C-127.8 NOTICE_SINCE_BEFORE_PROJECT
- C-127.9 NOTICE_SINCE_IN_FUTURE
- C-127.10 NOTICE_ALREADY_OPEN
- C-127.11 NOTICE_WARNING_NOT_ACKNOWLEDGED
- C-127.12 NOTICE_STALE
- C-127.13 NOTICE_SIGNATURE_REFUSED
- C-127.14 NOTICE_NOT_OPEN
- C-127.15 NOTICE_SINCE_EARLIER
- C-127.16 NOTICE_UNCHANGED

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/network-notices/`: tests 52, pass 52, fail 0, stable over repeated runs.
  - Each R1 and R4 refusal is shown with a negative control.
  - A back-dated and a future `since`.
  - The cut-offs at 0/1, 3/4, 6/7, 9/10.
  - An AI-only week counting zero.
  - A lapse, and one avoided by a revision.
  - A missed `monthly` with no key.
  - An opening that verifies, and tampered leaves, paths and roots that fail.
  - The caution at two open notices, posting anyway.
  - No member named over every answer.
  - The timestamp authorities stubbed throughout, with a test that the global fetch is never called (R30).
- `node --test "test/m/**/*.test.mjs"` before the B4 merge: tests 5105, pass 5090, fail 3, all accepted: control-plane `inbox-door.test.mjs`:81 (red 9); queue `catalogue.test.mjs`:34 and :116.
- After the B4 merge: tests 5123, pass 5106, fail 5, todo 12. The same three, plus conformance `record.test.mjs`:144 and plane `worker.test.mjs`:39 (both above, not mine).
- `test/system/fleetbundles.test.mjs`: before the merge 1 test, 1 pass, no SKIP. After it, 1 fail: bio-plane STALE BUNDLE from the six inputs above, not mine. The workers pass.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `node checks/architecture.mjs … network-notices`: 0 product files (my entry has no paths yet); 0 failures. On a scratch copy of `modules.json` with my paths filled (restored, never committed): 10 product files, 52 relative imports, 0 failures.
- `node checks/coverage.mjs … network-notices`: 0 of 30 named (my entry has no `tests` yet), as corpus-export's was. With the paths filled: 30 of 30, 0 failures.
- `node checks/ownership.mjs … network-notices tranche/T23`: 10 failures, my own files "outside network-notices's paths" (the entry is empty). With the paths filled: 0 failures.

Size (session_01XftQvd4G9DgVwWXFazJx1b): test runs 24, module lines 1326

## J3 · COMPLETE

network-notices is complete: R1–R30 met. All 52 tests pass, every id named. B2–B4 applied. Public reads are registered as activitymethod, noticespublic and groupkeyspublic. For my modules.json entry: paths ["bio-plane/src/network-notices/"], tests ["bio-plane/test/m/network-notices/"]; with them filled, architecture, coverage (30/30) and ownership show 0 failures. My 16 C-127 rows await the stamp (red 7), and N503–N505 are deferred as you ruled. After the B4 merge, three things are red that are not mine: the plane bundle is stale from earlier L8 merges (case-grammar, corpus-export, public-read, publication), so fleetbundles fails; plane worker.test.mjs:39 follows from that; and conformance record.test.mjs:144 calls the retired publication.exportManifest (N483). Details are in build/jobs/T23/network-notices.md, under Completion.

## Re-opened by B5 (K1154)

**Applied:** R17's new sub-item. When the edition's case document is committed (publication R40's `case_documents.ratified_at`) but the edition is not yet published whole (`published_cases.ratified_at`, its R53), `openSeals` still answers `NO_PUBLISHED_EDITION`, now with `kept: true`, and keeps the request in `nn_open_requests`. The `working-on-attest` tick retries it and opens it only once the edition is published whole, so nothing about an unpublished member is revealed (R16). A call for an edition with no committed case document, an unsigned one included, keeps nothing (`kept: false`). Ratification's side is unchanged.

**Test:** `seals.test.mjs`, "R17 R16 an edition committed but not yet published whole…". It shows the request kept with nothing opened; a tick before the edition is whole opening nothing; the tick after it is whole opening the week, with an opening that verifies and a `published` attestation; and nothing kept for an absent case or an unsigned case document.

**Tests and checks after merging `tranche/T23`** (my `modules.json` entry is now filled):
- `node --test test/m/network-notices/`: tests 53, pass 53, fail 0.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `node checks/architecture.mjs … network-notices`: 10 product files, 52 relative imports; 0 failures.
- `node checks/coverage.mjs … network-notices`: 30 of 30 live ids named by a test; 0 failures.
- `node checks/ownership.mjs … network-notices tranche/T23`: 0 failures.

Size (session_01XftQvd4G9DgVwWXFazJx1b): test runs 27, module lines 1339

