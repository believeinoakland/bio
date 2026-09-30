# case-authoring (T16)

**Status** · session_01Q1akymVhSfhfv5f25VnNRw · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Six readings I am building on now; each is my best reading, and (1) must match what PUBLICATION parses (its R2, R10, R20), so please rule it for both jobs.

(1) THE `/5` BLOCKS' SPELLING (publication R20; my R14, R35–R37). The restricted grammar holds only arrays of flat rows, so R20's nested `acknowledgement?` and `accounts[]` cannot be written as worded. I write:
- `captures:` one row per capture: `capture`, `member`, `grade` (letter or null), `grade_basis` (provenance.captureGrade's `basis`), `co_attested`, `timestamp_at`, `co_archive` (locator or null), `late`, `self_attested_only`, `acknowledgement_reason`, `acknowledged_by`, `acknowledged_at` (the last three null unless self-attested), `accounts` (a count), `sentence` (R36's fixed sentence when self-attested, else null).
- `capture_accounts:` one row per signed account (capture.captureAccountsOf): `capture`, `seq`, `by`, `at`, `key_b64`, `text` (grammar-safe), `text_sha256` and `signature_sha256` (over the verbatim text and armored signature); the body prints each account's text and armored signature verbatim, since neither fits the grammar.
- `sources:` one row per statement: `capture`, `kind`, `attribute`, `stated` (the value publishableAt answered, or "an unnamed source"), `basis` (`consent`, `public_elsewhere`, or null for the unnamed row), `claim` (a hostile entry's claim sentence, else null), `receipt_sha256`, `receipt_at` (on the unnamed row only).
No source id or entry id is written: an opaque id in two published cases would link them, which is itself an identity detail (K509 (4)). So publication's R51 re-derives each row's entry at commit from the capture (sources.sourceOf) and matches kind, attribute and stated value. If you rule otherwise (for example `case_captures:`, or ids), I follow the ruling.

(2) WHICH CAPTURES (R35 vs publication R20). R35 says "each capture a load-bearing member rests on"; R20 says "one entry per capture a member rests on". I state every member's captures (a superset satisfies R35) and require the acknowledgement (C-120.4) only for a load-bearing Grade B capture that is not co-attested. An acknowledgement of a supporting member's non-co-attested capture is standing (it is in the case), and marks it self-attested (R36).

(3) WHAT "RESTS ON" READS. Each member's direct document legs at its pinned bytes (both roles), one level deep as R29/R31 are: a leg's content row's capture, else every capture its target registers (provenance R48's `register`). An inquiry leg contributes nothing here (that finding discloses its own when published).

(4) SOURCES NEEDS `sourceOf` TOO. publishableAt takes a source id, and a capture's source id is minted by sources on first read (its R1), so I call `sources.sourceOf({captureSha, viewer})` (the act's viewer) and then `publishableAt({source, audience: "public"})`. The edge exists; the Uses line names only publishableAt. A source minted this way inside a rolled-back pre-flight rolls back with it.

(5) RATIFICATION R18's ANSWER SHAPE. Not worded. I read it as `{ok: true, refusals: [...]}`, each refusal byte-identical to the act's, and fold `refusals` into R34's `blockers`. Please give me ratification's actual shape when it merges.

(6) R34's `first`, `ready`, `blockers`. `first` is op=publish's refusal, or null when op=publish would succeed. `blockers` lists every other refusal reachable independently: each failing (load-bearing member, axis) under R6, R12, R35's, R31's as R32 reads it, then ratification R18's list (reachable only when op=publish succeeds, since it needs the text; otherwise the answer says it was not reached). `ready` is true only when `first` is null and `blockers` is empty. R34 skips reevaluation's raise (R15) inside its rolled-back run: raise tells its listeners synchronously, and a pre-flight must not tell them of an edition that never happened.

## Completion

**Entries applied** (N364: DEC-80 item 3, DEC-81 items 1 and 3, DEC-78 item 5; N370), on J1's readings as ruled in B2 (K552, with K553's block spelling):
- **R12** `UNCLEARED_HUNCH` now answers through its row C-120.7 (`#hunchDebt > is-hunch-cleared`, a DEC-49 region), naming every hunch leg, before anything is written; R34 answers it before the first screen.
- **R14** The `/5` document states `captures:`, `capture_accounts:` and `sources:`, always (empty included), written only through publication's `captureBlockLines` / `sourceBlockLines`; the body gains "Each Document's Grade And Co-attestation" (grade, co-attestation, a late one stated as late, the self-attested sentence, each signed account's text and armored signature verbatim) and "Sources Of Material Given To The Group".
- **R29** Rows C-120.4 `CO_ATTESTATION_UNACKNOWLEDGED`, C-120.5 `SELF_ATTESTED_NO_REASON`, C-120.6 `SELF_ATTESTATION_NOT_STANDING` (`#selfAttestedJudged`) and C-120.7 `UNCLEARED_HUNCH` (`#hunchDebt`) in `CASE_DISCLOSURE_CHECKS`, the family now "a case's disclosures and its pre-flight", with the requirements' translations.
- **R32** Carried in R34's step three (its candidates, count, highlighted count and sentence), read by the same `tensionsToDisclose`.
- **R34** `publishPreflight` (`op=publishpreflight` in `caseAuthoringOps`, stamps from the query after the body): `publishCase` over the same arguments inside `record.transact`, rolled back by a thrown sentinel; then `ratification.caseRatifyPreflight({text, signer: author, viewer})` over the stored text. Answers `{ok: true, wrote: false, ready, first, blockers, steps}`: `first` op=publish's refusal or null; `blockers` every other refusal reachable independently (each load-bearing member's shortfall per axis, R12, R35's, R31's as R32 reads it, ratification's `refusals`, or its `PREFLIGHT_UNDETERMINED` answer), each once; `ready` only when neither and ratification's list was read. The rolled-back run skips reevaluation's raise (R15), whose listeners are told synchronously. Steps: what becomes permanent; what this rests on; what you are leaving out; the edition this creates; sign.
- **R35** Each capture any member rests on, one level deep (a document leg's content row's capture, else every capture its target registers; an inquiry leg none), with `provenance.captureGrade` and co-attestation from `provenance.attestationsOf`, then `capture.lateAttestationsOf` (a late co-archive counts only when it succeeded and its replay does not hold other bytes). `selfAttested: [{capture, reason}]` judged as C-120.4, C-120.5, C-120.6 in that order after R31 and before the case identity (no id drawn); a malformed list is R3's `BAD_COMPLETENESS` naming the field.
- **R36** An acknowledged capture is marked `self_attested_only` with `{reason, acknowledged_by: the author stamp, at, sentence}` and `capture.captureAccountsOf`'s accounts (exact text and signature); `SELF_ATTESTED_SENTENCE` exported (DEC-81 item 3's words verbatim, for affordances R28).
- **R37** Each capture's source through `sources.sourceOf` (the act's viewer), then `publishableAt({audience: "public"})`: each entry as publication's `sourceStatement`, basis `consent` or `public_elsewhere`; with nothing publishable, `unnamedSourceStatement` from the capture's first pulled knock, basis null; each statement once; no source or entry id written. Proven end to end: both cases sign through publication's R51 at the commit.
- **N370** `#authority`, `#judgeMembers`, `#disclosuresListed` and `#tensionsRead` answer their refusal flat (`ok: false` at the top level) or `{ok: true, …}`. meaning-bounds' D-240 (b) no longer lists `#authority$caseAuthoringOf` or `#judgeMembers$caseAuthoringOf` (it now holds extraction's `pdfStructure[silent]` ×6 only).
- Own improvement: R5, R6, R12 and R31 moved out of `#publishCase` into `#rolesOf`, `#barJudged`, `#hunchDebt`, `#tensionsJudged`, so op=publish and the pre-flight ask one code path.

**`not yet met` marks my work meets** (for BOB to strike, K460): R12, R14, R29 (C-120.4–C-120.7), R32, R34, R35, R36, R37 (each "N364"), and the Status line's "N364 … not yet met".

**Rows added** (promotion's to stamp, N318): C-120.4, C-120.5, C-120.6, C-120.7, `awaiting stamp` (T17). C-120.7 gives `UNCLEARED_HUNCH`, which had no row, its row. None moved or retired.

**Depends on publication's early merge:** this branch imports `sourceStatement`, `unnamedSourceStatement`, `captureBlockLines` and `sourceBlockLines`, which are on `job/T16/publication` and not yet on `tranche/T16`, so the module does not load on this branch alone. Tested with publication's `src/publication/` overlaid from `origin/job/T16/publication` in the working tree, uncommitted and restored before every commit (the branch carries none of publication's files; ownership passes). After the merge I merge the tranche and re-run. Ratification's R18 is a stand-in at its ruled interface where a test controls its answer; the real module (no `caseRatifyPreflight` yet) is read as not reached, `ready` false.

**Found in other modules (REPORT J2):**
1. **legacy-tests**: `derivation-bounds.test.mjs`' census (already red, K548) gains `case-authoring/index:#restingCaptures` (reads a member's basis legs and each document's register rows without a LIMIT, as `#searchedForCase` and `#caseCitations` already do); re-pin. `civicos-ui/check-refusal-codes.mjs`' `untranslated` may fall by one (`UNCLEARED_HUNCH` now carries its row) and the DEC-49 guard's floors grow by four rows, four governed sites and regions; `row-census`' `AWAITING_STAMP` gains C-120.4–C-120.7. The failing verdicts of aicredential, bounds, derivation-bounds, meaning-bounds, refusal-wire and machinefences-dec49 are identical before and after this change.
2. **affordances**: `affordances.mjs`:7 still calls op=publishpreflight deferred, and `NON_ACTS.ratify` (:2143) names it "the deferred op=publishpreflight"; its R29 (layer 11) rewords it.
3. **control-plane**: `op=publishpreflight` needs its route and stamps (as op=publish's), and op=publish's body now carries `selfAttested` (layer 11, already planned).
4. **reevaluation**: `raise` tells R8's listeners synchronously, inside the caller's transaction, so a caller that rolls back (publication's R18 dry run, the review copy's missing-list) has told them of an edition never made; R8 says "after the act commits". The pre-flight avoids it by not raising.
5. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (plane source changed); not rebuilt (§14).

**Deferred:** none.

**Tests and checks:**
- `node --test test/m/case-authoring/` (with publication's helpers overlaid): 67 tests, 67 pass, 0 fail, 0 todo. New `preflight.test.mjs` (14): R29, R12, R35 ×4, R36, R37, R14, R34 ×5 (R32's step three inside). Updated: R17 (its direct-fetched capture is acknowledged), both R29 lists.
- Users: `test/m/review/` 30/30. Legacy suites touching case-authoring (d150, rec217, rec212, multicase, mint-ledger, shadowed-refusals, case-opened, record-core): pass; the six red legacy files are red identically without this change.
- `format`: 72 modules, 0 failures. `architecture case-authoring`: 14 files, 71 imports, 0 failures. `coverage case-authoring`: 37 of 37 live ids, 0 failures. `ownership case-authoring tranche/T16`: 9 files, legacy 0 added / 0 removed, 0 failures.

Size (session_01Q1akymVhSfhfv5f25VnNRw): test runs 21, module lines 3112

## J2 · REPORT

Found in other modules (record, Completion): (1) legacy-tests: derivation-bounds' census gains case-authoring #restingCaptures (unbounded basis and register reads, as #searchedForCase); check-refusal-codes' untranslated may fall by one (UNCLEARED_HUNCH now has C-120.7); the DEC-49 guard's floors grow by four rows, sites and regions; row-census AWAITING_STAMP gains C-120.4–C-120.7. Legacy verdicts are otherwise identical before and after. (2) affordances.mjs:7 and NON_ACTS.ratify (:2143) still call op=publishpreflight deferred (its R29, layer 11). (3) control-plane: route and stamp op=publishpreflight as op=publish; op=publish's body carries selfAttested. (4) reevaluation: raise tells R8's listeners synchronously inside the caller's transaction, so a rolled-back caller (the review copy's dry run) has told them of an edition never made, against R8's 'after the act commits'; the pre-flight avoids it by not raising. (5) bio-plane/dist/bio-plane.bundled.mjs stale, not rebuilt.

## J3 · COMPLETE

R12, R14, R29 (C-120.4–C-120.7), R32, R34, R35, R36, R37 and N370 applied; 67/67 module tests, review 30/30, four checks pass; record Completion. The branch imports publication's block helpers (sourceStatement, unnamedSourceStatement, captureBlockLines, sourceBlockLines), so it loads only once publication merges early; tested with them overlaid. Please merge publication and send a CHANGE: I merge the tranche and re-run. Ratification R18 is read at its ruled shape; with it absent the pre-flight states it not reached.

## Completion after B3, B4

B3 (publication merged early, K553) and B4 (ratification merged early, K555) applied: `tranche/T16` merged. The blocks were already written through publication's exports in K553's spelling, so no code changed; the dependency on publication's early merge noted above is gone, and the branch loads and runs on the tranche's own modules. R34 is now also tested against the real `ratification.caseRatifyPreflight` (its refusals read over the text op=publish would store, the author as signer, folded into `blockers` as ratification answers them; nothing written).

**Tests and checks:** `test/m/case-authoring/` 68/68; case-authoring, review, ratification and publication together 291 pass, 0 fail, 2 todo (publication's R30, R32); `test/m/` whole 3,068 pass, 0 fail, 21 todo. `format` 0 failures; `architecture case-authoring` 14 files, 0 failures; `coverage case-authoring` 37 of 37; `ownership case-authoring tranche/T16` 9 files, legacy 0/0, 0 failures.

Size (session_01Q1akymVhSfhfv5f25VnNRw): test runs 25, module lines 3112

## J4 · COMPLETE

B3 and B4 applied: tranche merged; the blocks already went through publication's K553 exports, so no code change; R34 now also tested against the real ratification R18. case-authoring 68/68; test/m whole 3,068 pass, 0 fail, 21 todo; four checks pass. Record: 'Completion after B3, B4'.
