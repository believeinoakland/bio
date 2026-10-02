# docket (T27)

**Status** · session_01PJ5cMH43RbHxx4SXkb3E7X · depth 2 · COMPLETE · handled B3

## Completion

**Entry applied: N520** (DEC-116 with DEC-100; START B1; readings J1, confirmed by B2, K1274). This creates the new module `docket`: `bio-plane/src/docket/` (`index.mjs`, `schema.mjs`, `checks.mjs`, `feed.mjs`), with tests in `bio-plane/test/m/docket/`. **BOB adds both to `docket`'s `modules.json` entry at the merge** (K1043's form). Until then, ownership reports my files as "outside docket's paths". With the two paths added in a scratch edit (not committed), all four checks report 0 failures (below).

What R1–R22 now do:
- **R1, R11.** `docketFile` files a record entry. Its refusals come in R1's order, and every filing records `found_by` (`watch` when the capture's register entry came from a sweep, else `paste`). With `takesBack` it takes a record entry back instead (J1 reading 2).
- **R2.** `docketPressure` adds a pressure mark.
- **R4–R6.** `docketPrepare` and `docketPost` place an entry in public. Prepare writes nothing and answers the same bytes for the same inputs on the same UTC day. Post verifies the signature in `NS_DOCKET` over `docketStatement`, and refuses `DOCKET_STALE` when the docket has moved.
- **R7, R8.** `docketDecline` declines a submission. A `receipt` entry carries no capture and no bytes; `docketInvitation` answers the request to resend.
- **R10, R12.** Standing: a grant is live from its post until its `standing-withdrawn` post. A withdrawal of one edition or `all` fixes its editions when it is posted; `withdrawalOf` answers it.
- **R9, R3.** `coreDue` answers the manager's To-dos. `docketOf` answers all three shelves, each record entry's state, the core, and a contesting entry's prompts.
- **R13.** `start()` fills `reevaluation.registerDocket` once, with `withdrawals` and `contested` in K1270's shapes. `docketActed` is called after a withdrawal's post or a contesting filing commits; a throw there never undoes the act.
- **R14, R15, R5.** `docketPublic`, `docketFeed` (Atom 1.0) and `docketSigners`.
- **R16.** Three tables, declared to purge with no bundle key. The module also registers its figures (`registerCounts`) and a mint seed for `DKT` ids.
- **R22.** A `docketOps` map is exported for L11.

**Arguments and fields added by J1's readings, for BOB to fold into the requirements (B2):**
- `docketFile` gains `takesBack` (R11) and `answers` (R8: the receipted record entry a resent reply answers).
- `docketPrepare` gains `candidate` (R9 (c): a disclosure, published as `answers`) and `grant` (R10: `standing-withdrawn`, published as `answers` with `holder`).
- `docketPublic` answers:
  - `captures: {<sha256>: <base64 or null>}`, plus `captures_unread`;
  - per entry, `json` (the exact signed text) and `fields` (that text parsed);
  - `feed`, the feed's relative address.
- Bytes are read through `record-core`'s `evidenceStore()`, not `provenance` as J1 reading 12 said; record-core is a declared use.
- Exports for later modules: `DOCKET_VOCABULARIES` (affordances R34), `docketOps` (L11), `ATOM_MEDIA_TYPE`, `DOCKET_UNREADABLE`, `OUTWARD_ACT_WARNING`, `RESEND_INVITATION`.

**Catalogue family corrected: C-129, not C-128.** B2 confirmed C-128, but C-128 is `acquisition`'s (`SWEEP_SCOPE_MISSING` and `SWEEP_REDIRECT_OUT_OF_SCOPE`, stamped by 1.54.0). C-129 is free on the tranche and on every T27 job branch. **Rows awaiting stamp** (26; accepted red 2 until T28's promotion stamp): C-129.1–C-129.26:
- C-129.1–.9: `MACHINE_CANNOT_FILE_DOCKET`, `DOCKET_NOT_A_PARTICIPANT`, `DOCKET_NO_EDITION`, `DOCKET_NOT_ATTRIBUTED`, `DOCKET_NOT_THE_SUBJECT`, `DOCKET_NO_STANDING`, `DOCKET_NO_CAPTURE`, `DOCKET_KIND_UNKNOWN`, `DOCKET_NO_REASON`.
- C-129.10–.13: `MACHINE_CANNOT_MARK_PRESSURE`, `NO_SUCH_DOCKET_ENTRY`, `PRESSURE_MARKED`, `PRESSURE_REFUSED`.
- C-129.14–.20: `MACHINE_CANNOT_PLACE_DOCKET`, `DOCKET_NOT_THE_MANAGER`, `DOCKET_NO_GROUP_SLUG`, `DOCKET_ENTRY_SETTLED`, `DOCKET_WRONG_SHELF`, `DOCKET_NO_SUMMARY`, `DOCKET_NO_ARCHIVE_COPY`.
- C-129.21–.26: `DOCKET_WARNING_NOT_ACKNOWLEDGED`, `DOCKET_STALE`, `DOCKET_SIGNATURE_REFUSED`, `DOCKET_WITHDRAWAL_FINAL`, `DOCKET_TAKE_BACK_FINAL`, `DOCKET_ALREADY_WITHDRAWN`.

With the paths added, `test/system/row-census.test.mjs` names exactly these 26 as "arrived with no record". Without the paths it passes (1073 rows, the pin).

**Flaw found and fixed in the module.** Two record entries that are alike sign to the same public bytes, since the entry names no record id. A held prepare for one could then place the other. The held answer is now kept per record entry, and a post places the entry last prepared. `place.test.mjs` (R5 DOCKET_STALE) covers it.

**N502/N508 re-scan:** nothing to re-word. This is a new module with no legacy-store or legacy-index note and no stale `awaiting stamp`.

**Deferred:** none. The Suggestions' "not drafted" items (other disclosures, a legal mark asking for a hold, a link from a checkpoint to an entry, the citing side of DEC-101 (3)) stay undrafted, as the requirements say.

**Other modules:**
- `public-read` and `network-notices` should build against the shapes in J2: `docketPublic` and `docketFeed` are async; `docketSigners()` answers `[{keyB64, first_signed}]`.
- L11 routes the added arguments (`takesBack`, `answers`, `candidate`, `grant`) through `docketOps` (control-plane R48).
- The plane's bundle is not stale: no plane source imports `docket` yet. `test/system/fleetbundles.test.mjs`: pass 1, fail 0.

**Tests run:** `bio-plane/test/m/docket/` (`file.test.mjs` 11, `place.test.mjs` 13, `reads.test.mjs` 13): tests 37, pass 37, fail 0. Every id R1–R22 is named in a test title. No module uses `docket`'s services yet, so no user-module tests apply.

**Checks** (from `civicos-process`):
- format: 92 modules, 91 requirements files; 0 failures.
- architecture, with the paths added: 8 product files, 41 relative imports; 0 failures.
- coverage, with the paths added: 22 of 22 live requirement ids named by a test; 0 failures.
- ownership, with the paths added: 9 files changed by docket between tranche/T27 and HEAD; 0 failures.
- Without the paths: architecture judges 0 files, coverage reports 0 of 22, and ownership fails only on "outside docket's paths". Each closes when BOB adds the paths.

**CHANGE B3 (K1276), applied after merging `tranche/T27`.** R14 gains `lastEntryOf({case})`. It is synchronous and viewer-free, reads no capture's bytes, writes nothing, and answers the date of the latest public entry (the same as `docketPublic`'s `last_entry`) or null. It is tested in `reads.test.mjs` (R14). After the change:
- Tests: 37 pass, 0 fail.
- format: 0 failures.
- With the paths added: architecture 0 failures, coverage 22 of 22, ownership 9 files and 0 failures.

Size (session_01PJ5cMH43RbHxx4SXkb3E7X): test runs 14, module lines 1287

## J1 · QUESTION

Readings I am building on (docket R1–R22); none changes a provided service's shape that public-read or network-notices use (`docketPublic`, `docketFeed`, `docketSigners`, `withdrawalOf`). Answer only where you rule otherwise.

1. **Catalogue family.** My rows use `C-128.n` (next after network-notices' C-127), each `awaiting stamp` until T28. Say if another number is reserved.
2. **Taking back a record entry (R11).** No op is named. Reading: `docketFile` takes an optional `takesBack: <record entry id>` with `reason` (no other form field). It runs R1's caller refusals (machine, `NO_SUCH_CASE`, `DOCKET_NOT_A_PARTICIPANT`), then `NO_SUCH_DOCKET_ENTRY` (names no record entry of the case), `DOCKET_ENTRY_SETTLED` (already placed, declined, receipted or taken back; a placed one is taken back publicly, by a `take-back` entry), then `DOCKET_NO_REASON`. It is held as a mark on the entry, which then reads `taken-back`.
3. **`disclosure` (R9 (c)).** R6 has no field naming the tension. Reading: `docketPrepare` takes `candidate`, published as `answers`. A missing candidate is refused `NO_SUCH_DOCKET_ENTRY`.
4. **`standing-withdrawn` (R10).** Reading: `docketPrepare` takes `grant` (the grant entry's `seq`), published as `answers`, with `holder` the grant's name. A grant that is absent is `NO_SUCH_DOCKET_ENTRY`; one already ended is `DOCKET_NO_STANDING`. A grant is live from the instant its entry is posted until the instant its `standing-withdrawn` entry is posted (`date` is the UTC day, for display).
5. **Kind and `from` (R1).** Under `DOCKET_KIND_UNKNOWN`: `response` and `statement` come only from the subject or a holder, `reaction` only from `other`, `outcome` from anyone.
6. **A placement's `edition`** is its record entry's own. A different `edition` passed is `DOCKET_NO_EDITION`. Kinds with no record entry (`edition`, `disclosure`, `withdrawal`, `standing-*`, `take-back`) name a ratified edition (`all` only for `withdrawal`). Every kind except `reaction` goes to `listed`.
7. **`receipt` (R8).** It places a record entry from the subject, or from a holder whose grant was live at its filing (else `DOCKET_NO_STANDING`). It needs the manager's words in `reason` (`DOCKET_NO_REASON`); the published reason is "names a private person: <words>". `capture` is null and no bytes are published.
8. **`docketDecline` and `docketInvitation` order.** The case comes from the entry, so an entry that is absent or invisible to `by` is `NO_SUCH_DOCKET_ENTRY`, after the machine refusal and before `DOCKET_NOT_THE_MANAGER`. `docketInvitation` answers only for a receipted entry (else `NO_SUCH_DOCKET_ENTRY`), with a code and a meaning; the words are the UX stream's.
9. **`docketOf`'s core (R3).** A full-sight member sees the case's core as its manager would. `coreDue` itself still answers only cases the viewer manages. Core kinds: `response`, `statement`, `edition`, `tension`, with `ref` the record entry id, the edition number or the candidate. A tension's `since` is the latest ratified edition's `ratified_at`.
10. **Ids.** A record entry id is an opaque id `DKT-YYYY-NNNN` minted in the filing's transaction. A public entry's id is `<case>#<seq>`, which `reevaluation` R30 already defaults to.
11. **`contested` (R13)** leaves out a contesting record entry that has been taken back.
12. **R14's bytes** are answered base64 under `captures: {<sha256>: <base64>}`, read from the evidence store through `provenance`.

## J2 · REPORT

The shapes of the provided services, for public-read and network-notices (code on `job/T27/docket` within the hour; COMPLETE follows). Reach docket as `docketOf(host, deps)` from `bio-plane/src/docket/index.mjs`.

- `withdrawalOf({case, edition})` is synchronous and viewer-free. It answers `{seq, entry, date, reason, digest}` (`entry` is `<case>#<seq>`), or null.
- `docketPublic({case})` is **async**. It answers null for a case with no ratified edition. Otherwise it answers `{ok: true, case, group, entries, captures, last_entry, feed}`, with `captures_unread` added when bytes could not be read.
  - Each item of `entries` is `{seq, entry, digest, json, fields, signature, published_at, taken_back}`. `json` is the exact canonical text that was signed, `fields` is that text parsed, and `taken_back` is `{seq, date}` or null.
  - `captures` is `{<sha256>: <base64 or null>}`.
  - `last_entry` is the latest entry's `date`, or null.
  - `feed` is the feed's relative address.
- `docketFeed({case})` is **async**. It answers the Atom XML as a string, or null. The media type is exported as `ATOM_MEDIA_TYPE` (`application/atom+xml`).
- `docketSigners()` is synchronous. It answers `[{keyB64, first_signed}]`, in first-signed order.
- `docketOps(m, url, body)` is the member ops map for L11. Its keys are `docketfile`, `docketpressure`, `docket`, `docketprepare`, `docketpost`, `docketdecline` and `docketinvitation`. `DOCKET_VOCABULARIES` is exported for affordances R34.

## J3 · COMPLETE

N520 applied: the new module docket (R1–R22) at bio-plane/src/docket/, tests at bio-plane/test/m/docket/ (37 pass, 0 fail; R1–R22 each named). Add both paths to docket's modules.json entry at the merge: with them, format, architecture, coverage (22/22) and ownership all report 0 failures; without them, ownership flags only 'outside docket's paths'. Correction to B2: C-128 is acquisition's (stamped by 1.54.0), so the rows are C-129.1–.26, awaiting stamp (accepted red 2). Arguments added by J1's readings, for the fold: takesBack, answers, candidate, grant, captures. Provided-service shapes as in J2. One flaw found and fixed: a prepare could place a lookalike record entry. Details in the record.
