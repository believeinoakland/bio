# sources (T16)

**Status** · session_01BSkuuwEzNWD8dWMjWW2taW · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Five readings I am building on; answer any you would rule otherwise. Only (1) and (2) touch another module.

1. **R11's rate (capture R31, K530).** Capture provides no service that counts an attempt in the knock windows other than `knock` itself, and `knock_rate` is capture's table (every write stays capture's). My reading: capture adds `knockAttempt({sourceAddress, now})`, which asks R31's two windows exactly as `knock` does, answers `RATE_IP`/`RATE_GLOBAL` (with `stated`) or null, and counts the attempt in both windows when it admits it. I build against that name; `consentBySecret` takes `sourceAddress` and `now` from the control plane as the knock op does. A rate refusal answers as the knock's rate refusal (not `SECRET_NOT_RECOGNISED`); every other failure is `SECRET_NOT_RECOGNISED`. If you rule it capture's, CAPTURE needs the entry; if you rule otherwise, say how.
2. **R1's source from a capture.** Capture R65 files the knock's bytes under their own digest, so a pulled capture's sha is the knock's `sha256`. I find the pulled knocks for `captureSha` through `inboxList("pulled", {limit, after})` (reading `knock_id`, `sha256`, `bytes`, `received`, `pseudonym`, `knocker_digest`, `status`), and rebuild R65's `source` verbatim from the row as R65 composes it. A keyed read (`pulledKnocksOf(captureSha)`) would make this one indexed read instead of a page walk; I report it as an efficiency, not a need. Two knocks with the same bytes pulled separately: `sourceOf` answers the earliest received as `source` and lists every one in `sources`. A source is minted (record-core `mintOpaqueId`, `SRC-<year>-DDDD`) on first read and kept: one per pseudonym, one per knock without a secret. Who may read a source: a viewer naming a member (the inbox's fence, R32); a machine credential or none is answered `NO_SUCH_SOURCE`.
3. **R3's exposer.** R2's call has no field for `{claimed_by, at}`. Reading: a `hostile` disclosure takes `claimedBy` (required, `BAD_DISCLOSURE` naming it when absent) and `claimedAt` (a date, default the instant recorded). A confirmation is an R2 entry naming `confirms: <hostile entry id>`; R8 gives it no `public_elsewhere` basis, only consent.
4. **R6's `same_secret`.** Two sources never share a pseudonym (one source per pseudonym), so the basis can only come from a presented secret. Reading: `linkClaim` takes an optional `knockerSecret`; when its digest (`capture.knockerDigestOf`) is the knocker digest of `source` or `to`, the claim's basis is `same_secret`, else `evidence`. The secret is never stored or answered.
5. **Evidence and supersession.** `evidence` is a non-empty string, or `{cite, note?}`; only `{cite}` is "a citation" for R8's `public_elsewhere`. `revealed.attribute` (`occupation`, `employer`, `role`) is required for kind `attribute`. A later entry supersedes an earlier one of the same kind and attribute (for `pseudonym_link`, the same `to`); a superseded entry is read with `superseded_by` and is not answered by R8. `recorded` defaults to true; `recorded: false` with a `value` is refused `BAD_DISCLOSURE` naming `value`, never silently dropped. `publishableAt` answers no values (it writes nothing, so it cannot log a read, R5); a publisher reads the value through its own sight.

## J2 · COMPLETE

**Entries applied** (branch `job/T16/sources` @ the commit carrying this entry; `tranche/T16` merged in after B2):
- **N364 (K509 (1)): the module written whole**, `bio-plane/src/sources/` (`index.mjs`, `checks.mjs`, `schema.mjs`, 801 lines), R1–R14, with B2's rulings: R72 `pulledKnocksOf` (one keyed read) in place of the inbox walk; R71 `knockAttempt` for R11's rate; `publishableAt` answers each publishable entry's value (none for `recorded: false`) and logs no read (R5, R8 as re-worded, K539). J1's readings (3)–(5) are built as written there.
- Sources are minted on first read and kept (`SRC-<year>-DDDD`, `mintOpaqueId`): one per pseudonym, one per knock without a secret. A capture that is not a pulled knock has none (R12). A reader is a viewer naming an active member, or the founder in either spelling; a machine credential or none gets `NO_SUCH_SOURCE`.
- A hostile claim supersedes, and is superseded by, only a hostile claim. A confirmation never erases the claim it confirms, and the claim reads `confirmed: false` in every answer (R3).
- The R7 standing rule: a consent raises an entry's standing to its audience; a withdrawal lowers it below the withdrawn audience; `publishableAt({at})` reads the standing at `at`. So what was publishable before a withdrawal stays publishable at that instant.

**Built against capture's worded interface, not yet the real one:** R1 (`pulledKnocksOf`, R72), R6's `same_secret` and R11 (`knockerDigestOf`, R66; `knockAttempt`, R71). The tests use a stand-in that behaves as those requirements state (`test/m/sources/fixture.mjs`, `stubCapture`). When your CHANGE says capture has merged, I merge the tranche, switch the fixture to the real `Capture`, and re-run steps 5–7.

**`not yet met` marks my work meets** (for BOB to strike): R1–R14 (N364), and the Status line's "Not yet met: every id (N364)". R1, R6 and R11 are met against the stand-in; I confirm them on the CHANGE.

**Check rows for promotion's stamp (N318):** added C-121.1 `NO_SUCH_SOURCE`, C-121.2 `BAD_DISCLOSURE`, C-121.3 `NO_EVIDENCE`, C-121.4 `NO_SIGHT_LIST`, C-121.5 `CONSENT_NOT_STANDING` and C-121.6 `SECRET_NOT_RECOGNISED`, all in `SOURCES_CHECKS` (`src/sources/checks.mjs`), each `where` naming its one site in that file (`noSuchSource > is-source-held`, `badDisclosure > is-disclosure-well-formed`, `noEvidence > is-evidence-named`, `noSightList > is-sight-listed`, `consentNotStanding > is-consent-standing`, `secretNotRecognised > is-secret-recognised`). All six are `awaiting stamp` for T17. No row moved or retired.

**Ops, for control-plane (layer 11), from `sourcesOps(s, url, body)`:** `sourcedisclose` → `recordDisclosure`, `sourcelink` → `linkClaim` (async), `sourceconsent` → `recordConsent`, `sourceconsentwithdraw` → `withdrawConsent`, and `knockerconsent` → `consentBySecret` (async, no account). The stamp `by` comes from the query, after the body is spread; for `knockerconsent`, the connecting address comes as `source` and the instant as `now`, as the knock op passes them. It also routes the reads `sourceof` (`capture`, `viewer`), `sourcerung`, `sourcereadlog` (`source_id`, `viewer`) and `sourcepublishable` (`source_id`, `audience`, `at`). Nothing is registered with the plane: `sourcesOf(ctx, deps)` is the factory.

**Reported, not mine to change:**
1. **legacy-tests, `test/row-census.test.mjs`:** my six rows are new to the census, so its "the tree holds the pin" arm and its negative control fail, naming them, until its `AWAITING_STAMP` lists C-121.1–C-121.6 (they are named `awaiting stamp` in this record). On `tranche/T16` without my change the suite has 1 failure; with it, 2.
2. **legacy-ui, `civicos-ui/check-refusal-codes.mjs`:** my family moves only its floors. From tranche to this branch: families 112→113, rows 847→853, census 1136→1142, reach 882→888, governedSites 556→562, regions 518→524, regionLines 5907→5938, codesChecked 975→987, outcomeReturns 285→291, refusalsJudged 921→927. It adds no arm failure: no new multi-site code, no inherited verdict, and untranslated is unchanged at 285. The tranche already fails 15 of that guard's arms; with my change it fails 16, the one added being `families`' slack.
3. **record-core, `mintExhausted`:** `MINTED_OBJECT` has no entry for `SRC`, so exhaustion would say "a free id" and not name a source. That is only reachable after 10,000 sources in one year.
4. **Generated artifacts (§14):** none is stale. Nothing imports `src/sources/` yet, and `fleetbundles.test.mjs` gives the same 91 pass, 5 fail on `tranche/T16` with and without my change.
5. **civicos-ui and affordances greps:** there are no hits for any of the nine op names, `sourcesOf` or `src/sources`. affordances' R28–R29 and R2/R3/R5 (this layer's plan) will grade the ops; this module hands them nothing further.

**Deferred:** nothing.

**Tests and checks run:**
- `node --test bio-plane/test/m/sources/`: 20 tests, 20 pass, 0 fail, 0 todo. Every live id, R1–R14, is named in a test title.
- Negative controls, each restored after: no read log gives 2 fails; a hostile claim reading confirmed, 3; a withdrawal ignored, 4; an uncited public entry published as public_elsewhere, 1; a value in the listener payload, 2; the rate not asked, 2.
- Layer tests: none are named in the manifest. No other module uses `sources` yet.
- `format`: 0 failures. `architecture sources`: 10 files, 0 failures. `coverage sources`: 14 of 14, 0 failures. `ownership sources tranche/T16`: 11 files, 0 failures.

Size (session_01BSkuuwEzNWD8dWMjWW2taW): test runs 24, module lines 801

## J3 · COMPLETE

**B3 processed** (branch `job/T16/sources` @ the commit carrying this entry; `tranche/T16` merged in after B3, with CAPTURE #8):
- The fixture now runs `sources` over the real `Capture`: its doorbell (`knock` with `knockerSecret`), `pullKnock`, `pulledKnocksOf` (R72), `knockerDigestOf` (R66) and `knockAttempt` (R71), on the same storage as record-core and membership. The stand-in is gone. Capture's own providers, which `sources` never reaches, are stand-ins: provenance's `recordReceipt` and an evidence bucket behind `evidenceStore`.
- The module's code did not change for B3: it already called R71, R72 and R66 by their worded names. A capture with no knocker key yet answers `knockerDigestOf` with a null digest, and the module already reads that as unrecognised.
- The tests were adjusted only where the stand-in had been driven directly. R1's refusals now use a real discarded knock (`inboxResolve`), and the rate test now reads capture's own `knock_rate` window: each consent attempt adds one knock to the instance's window.

**`not yet met` marks my work meets:** R1–R14 (N364) and the Status line's "Not yet met: every id (N364)". R1, R6 and R11 are now confirmed against the real capture.

Rows, ops, reports and deferrals are unchanged from J2.

**Tests and checks run:**
- `node --test bio-plane/test/m/sources/`: 20 tests, 20 pass, 0 fail, 0 todo. Every live id, R1–R14, is named in a test title.
- Negative controls against the real capture, each restored after: no read log gives 2 fails; a hostile claim reading confirmed, 3; a withdrawal ignored, 4; an uncited public entry published, 1; the rate not asked, 2; `same_secret` never granted, 2.
- `format`: 0 failures. `architecture sources`: 10 files, 0 failures. `coverage sources`: 14 of 14, 0 failures. `ownership sources tranche/T16`: 11 files, 0 failures.

Size (session_01BSkuuwEzNWD8dWMjWW2taW): test runs 29, module lines 801

## J4 · COMPLETE

**B4 processed.** The cause is in my module, not in capture's R71.

**The cause.** `consentBySecret` passed `now: a.now ?? null` to capture's `knockAttempt`. For an attempt that carried no instant (the test's third call, `consentBySecret(null)`), R71 fell back to the wall clock, as it rightly does for its own callers. The test's first two attempts were counted at the fixture's clock (2026-09-30T10:00Z), so they sat in that window's buckets. The third was counted in the wall clock's window. R31's `#countKnock` then pruned every bucket outside the current window's two, which dropped the earlier two counts (and the fixture's knocks), leaving 1. The test passed earlier only while the wall clock's window was the fixture's, or the one after it: T0 is 10:00:00Z, so up to 10:20. From ~10:20 it failed every run, which matches your 4 of 4. R71 behaved as capture R31 and R71 state, so there is nothing to report against capture.

**The fix** (`src/sources/index.mjs`, `consentBySecret`): the instant is the control plane's stamp when one is sent, a finite number; otherwise it is the module's own clock (`deps.now`, the wall clock in the plane), never `null`. An attempt is now always counted on the one clock the module runs by, and `knockerconsent` still passes the op's `now` when the control plane stamps it.

**Proved at a window's edge.** A new test places the clock seven windows away from any wall-clock window, at an exact 10-minute edge, with offsets −1 ms, 0, +1 ms and half a window. It makes three attempts: one with no `now`, one with no arguments at all, and one with a stamped `now`. Each must add one to the instance's window, and each must reach capture at the module's clock. Then 12 attempts from one source are admitted and the 13th is `RATE_IP`, across the edge. Negative control: with the fix reverted, both R11 rate tests fail at every offset and at any time of day. With the fix, 3 runs in a row are green.

**Tests and checks run:**
- `node --test bio-plane/test/m/sources/`: 21 tests, 21 pass, 0 fail, 0 todo.
- `node --test bio-plane/test/m/`: 3015 pass, 1 fail, 21 todo. The one failure is `test/m/ratification/checks.test.mjs`:133, the parity test K529 retires; it fails on `tranche/T16` without my change as well (MEMBERSHIP #9 J2 item 6).
- `format`: 0 failures. `architecture sources`: 0 failures. `coverage sources`: 14 of 14, 0 failures. `ownership sources tranche/T16`: 3 files, 0 failures.

Rows, ops, marks to strike, reports and deferrals are unchanged from J2 and J3.

Size (session_01BSkuuwEzNWD8dWMjWW2taW): test runs 35, module lines 805
