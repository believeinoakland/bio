# docket (T47)

**Status** · session_01LdRUdodYLfpSaz5xmhmwfA · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (T47-28):
- (N952) R12: `withdrawalOf` already answered `entry` (the public entry's id `<case>#<seq>`, `docketPublic`'s `entries[].entry`), which `public-read` `#withdrawnStamp` reads as `w.entry`. No code change needed. New test `t47.test.mjs` "R12 (T47, N952) …": for a one-edition and an `all` withdrawal, `entry` equals the posted entry and the entry `docketPublic` answers; the answer has exactly R12's fields; an unwithdrawn edition answers null.
- (N992) R29: C-129.29's translation is now read by key from a frozen `DOCKET_WORDS` (`checks.mjs`, exported from `index.mjs`), as `HANDLE_WORDS`/`TRANSCRIBE_WORDS`/`DUTIES_WORDS` are. Its code, number and `where` are unchanged. Two new tests in `t47.test.mjs` check:
  - the row equals `words.json`'s sentence verbatim;
  - T45's wording is no longer answered;
  - no other row uses this sentence;
  - each of R1's four arms (missing, unknown kind, dated after filing, stated on another kind), plus R4's re-check at prepare, answers it and writes nothing, each beside its control.
- The row waits for T48's stamp (plan rule 5 (2)); that is inherited, not mine.

**Flaw fixed (P8):** `file.test.mjs` "R1 `author` not a joined participant…" chose which arm to test by branching on the answer. It now drives the arm directly: carol, invited and not joined, is refused, and bob, joined, files as the control.

**Deferred (own module), with why:**
- `place.test.mjs` R7 asserts that methods are absent (`!("redact" in w.docket)`), which is structure. R7's behaviour (bytes listed whole) is tested beside it. I left it because removing an assertion should be BOB's call.
- `t45.test.mjs` builds the pre-T45 schema by string-replacing `DOCKET_SCHEMA`. It is a fixture for the migration test, not an assertion on source. Kept.

**Found elsewhere (REPORT):**
- `docket.md` R29 says the other rows are ones "which `words.json` does not hold". `words.json` also holds `refusal.DOCKET_PRESSURE_REFUSED`, word for word C-129.13's present translation. That is harmless today, but the wording is inexact. BOB's call whether C-129.13 should read by key too.
- `docket.md` Uses is stale against the code (per the digest):
  - Used but not listed: record-core `mintOpaqueId`, `readFile`, `evidenceStore`, `registerMintSeed`; membership `positionalMember`; provenance `homeOf`.
  - Listed but never called: `viewerPredicate`, publication `publishedEditionsOf`/`ratifiedCases`, `createSha256`.
  - Acquisition R21 is read through the bundle's `provenance.json`, not called.
- `layers.md` docket Uses line (:178) omits events, case-tensions and project-roster.

**How the reading set was read (§17):**
- Read whole by me: `docket.md`, `src/docket/index.mjs`, `src/docket/checks.mjs`, and the parts of the tests I changed.
- Read whole by a helper in this session, digested with citations: every docket test file, `fixture.mjs`, each used module's Purpose and the named services, `public-read` R20 and its link code, and `layers.md` layer 8.
- Not read whole: `feed.mjs` and `schema.mjs`, which this job did not change.

**Tests and checks run:**
- `node --test test/m/docket/`: tests 78, pass 78, fail 0.
- Users' tests (public-read, affordances, answer-envelope, plane/docket, network-notices, queue-producers, control-plane r48, case-import, action-holds, filings, promotion): tests 995, pass 990, fail 5. The same 5 fail with my change stashed (affordances plane/t36, answer-envelope envelope, promotion registry), so they are inherited and none is docket's.
- `format`: 0 failures. `architecture … docket`: 0 failures. `coverage … docket`: 29 of 29, 0 failures. `ownership … docket tranche/T47`: 0 failures.
- `run.mjs`: architecture 0 failures (3084 files); coverage 44 failures, none docket's; channels 0.

Size (session_01LdRUdodYLfpSaz5xmhmwfA): test runs 5, module lines 1648

## J1 · REPORT

Found outside docket's code (details in my record, 'Found elsewhere'): (1) docket.md R29 says words.json holds none of docket's other rows, but words.json also holds refusal.DOCKET_PRESSURE_REFUSED, word for word C-129.13's present translation. Should C-129.13 read by key too? (2) docket.md's Uses list is stale against the code: positionalMember, homeOf, mintOpaqueId/readFile/evidenceStore/registerMintSeed are used but not listed; viewerPredicate, publishedEditionsOf, ratifiedCases and createSha256 are listed but never called; acquisition R21 is read through provenance.json, not called. (3) layers.md's docket Uses line (:178) omits events, case-tensions and project-roster.

## J2 · COMPLETE

T47-28 applied. R12: withdrawalOf already answered entry; it now has its own test against docketPublic's entry id. R29: C-129.29 reads words.json's refusal.DOCKET_OUTCOME_UNREADABLE by key (DOCKET_WORDS), tested over all four arms plus prepare. Fixed a non-deterministic participant test. Docket: 78/78 pass. format, architecture, coverage and ownership: 0 failures. run.mjs: architecture 0; the coverage failures are none of docket's. Users' tests: 5 inherited failures, which also fail without my change. Record on job/T47/docket.

## Re-opened by B2 (CHANGE, K3110)

**Applied:** I merged `tranche/T47`, which carries R29 as K3110 amends it. C-129.13 `DOCKET_PRESSURE_REFUSED` now reads `words.json`'s `refusal.DOCKET_PRESSURE_REFUSED` by key, from `DOCKET_WORDS`. Its sentence, code, number and `where` are unchanged. A new test in `t47.test.mjs`, "R29 (K3110) C-129.13…", checks:
- the row is exactly `{C-129.13, docketPressure > is-docket-pressure, the key's sentence}`;
- each refusing call answers that sentence and writes nothing: `docketPressure` with no pressure, an unknown kind, or a note of 501 characters, and `docketPressureMarks` with an unknown kind;
- the controls succeed: a mark with a 500-character note is made, and `kind: "legal"` reads.

The R29 test now holds `DOCKET_WORDS` to exactly the two keys, each verbatim.

**Services docket calls** (from the code; each with its owning module and requirement id):
- **record-core:**
  - `transact` (R32)
  - `mintOpaqueId` (R6, R7; R62 for `MINT_EXHAUSTED`)
  - `registerMintSeed` (R70, R71)
  - `declarePurge` (R21)
  - `registerCounts` (R63)
  - `readFile` (R13, R14)
  - `evidenceStore` (R38)
  - `stampInstant` (R47)
- **membership:**
  - `sight` (R44)
  - `isProjectOwner` and `isJoinedParticipant` (R54)
  - `positionalMember` (R76)
- **credentials:** `attestingKeys` (R11).
- **promotion:** `fact("producingGroup")` (R40).
- **provenance:**
  - `homeOf` (R4, R5)
  - the `register` and `captured_locators` tables under R48
- **attestation:** `attestationsOf` (R7).
- **entities:** `readEntity` (R5).
- **inquiry:** `subjectEntityOf` (R43).
- **reevaluation:** `registerDocket` and `docketActed` (R30).
- **publication:**
  - `stampEdition` and `registerOrderSource` (R62)
  - the tables `cases`, `published_cases`, `published_case_members` and `case_documents` under R40
  - R78's row, read from its exported checks
- **case-grammar:** `whatChangedOf` (R8).
- **case-tensions:** `caseTensions` (R4).
- **events:** `registerEventSource` (R30).
- **project-roster:** `projectScope` (R23).
- **record-grammar:**
  - `canonicalJson`, `sha256HexSync`, `parseFrontmatter`
  - `isMachineIdentity` (actors)
- **signatures** (`sshsig.mjs`): `verifySshsig` (R2), `NS_DOCKET` and `docketStatement` (R39, R40).

**Listed in docket.md's Uses but never called:**
- `membership.viewerPredicate`
- `publication.publishedEditionsOf` (R37) and `ratifiedCases` (R43): docket reads publication's tables under R40 instead
- `record-grammar.createSha256`: docket uses `sha256HexSync`
- `acquisition` (R21): never imported; the sweep origin is read from the bundle's `data/provenance.json` through `record-core.readFile`

**Tests and checks after the change:**
- `node --test test/m/docket/`: tests 79, pass 79, fail 0.
- Users' tests (promotion, answer-envelope, affordances): the same 5 inherited failures as before, no new ones.
- `format`: 0 failures. `architecture … docket`: 0 failures. `coverage … docket`: 29 of 29. `ownership … docket tranche/T47`: 0 failures.
- `run.mjs`: architecture 0 failures; coverage 43 failures, none docket's; channels 0.

Size (session_01LdRUdodYLfpSaz5xmhmwfA): test runs 8, module lines 1651
