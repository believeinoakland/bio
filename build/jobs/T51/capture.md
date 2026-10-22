# capture (T51)

**Status** · session_01N9N3ozsPf3Ekjw63cL8GAe · depth 2 · WORKING · handled B14

## J1 · COMPLETE

**COMPLETE**, T51-21 · capture (commit `2d3b2dc73a` on `job/T51/capture`).

**Entries applied**
1. **R77 (N1235)**: every held row, an archive's included, also answers `actor` (the capture's first actor by instant, an upload's stamp as stored), `retrieved` (the whole-second UTC instant of the capture's first receipt) and `bytes` (the register's size of the capture, the archive's for an archive row); each null when the record cannot say. They are read for rows the viewer's sight already admits, so an unseen document gives none.
2. **R88 (N1235)**: `state: held_and_vouched` lists the held documents and the Information documents at `verified`, by the same sight, filters, sorts and bound; each row carries `standing`, a vouched one `vouched: {by, at}` from the latest `verified` entry of its `bundle.md` `state_history` (null per missing field); a vouched row (and a vouched file beside an archive) is not asked of R78's examination (`eligible: null` with a basis), so R91's wait is not spent on it; no vouched row carries `set_aside`; `held` and `set_aside` answer as before; the refusal names the three values.
3. **R96 (A64)**: `heldAt` and its arm `heldat` in `captureOps` (`address`, `sha256`, `check=1|true`, `viewer`, and the member stamp `by`). The answer is as R96 states it. Without `check` it reads the record alone and never fetches; with `check` (a member session only, else `MEMBER_SESSION_REQUIRED` 403) one `governedFetch` for the copy's address, conditional on `validatorsOf`, decides `unchanged` (304, or bytes hashing to the copy's digest) or `changed` with `served_sha256`; nothing is filed and the one write is R8's outcome. A copy that is no plain fetch (a rendered capture by `capture.method`/`pair.primary` in its register document, a non-`direct` route, an export address, an unreadable register document) and a digest with no public address read `undetermined` with their own basis.
4. **Stale comment** `d57selflink.test.mjs`:9 restated (no `civicos-ui`).

**Decisions of mine, for BOB to record** (details under P17; none needs Bob)
- **Basis sentences are inline.** `words.json` and `words-reads.json` are the design stream's, and `t50-words.test.mjs` pins `WORD_KEYS` to that `reads` list, so the new sentences (R88's vouched `eligibility_basis`, R96's `changed.basis`) are held in `index.mjs` as builder diagnostics, beside the stable `state`/`standing` fields screens-intake draws its own keyed words from (`screen.capture.a64.*`). If BOB wants them keyed, the design stream adds the keys and a later capture job swaps the strings.
- **Member stamp** for `heldat`'s `check`: the route reads the control plane's `by`, and the fence is R86's (`isMachineIdentity`, blank, `member:` alone). L11's op declaration and control-plane route must pass `by` (and `viewer`) for `op=heldat`.
- `versions` and `earlier_differs` count every visible capture at the address by digest (R96 literal), an archive sighting of different bytes included.
- The compared copy is the newest visible capture at the address by last retrieval, compared as instants; a capture filed in no bundle is not held (R96's register-home rule, unlike `gradeNoteOf`'s).

**Deferred**: none.

**Found in other modules**: nothing new. `op-declarations` has no `heldat` entry (L11's, K3829), so the plane refuses the route until T51's op-declarations job adds it. Four tests outside capture fail identically at `tranche/T51` without my commit (capture-requests/plane R48; screens-inquiry document x3), the plan's inherited reds.

**Tests and checks**
- `node --test bio-plane/test/m/capture/ bio-plane/test/cap13-reuse-pages.test.mjs bio-plane/test/d57selflink.test.mjs`: 199 tests, 199 pass, 0 fail, 0 skipped (20 new in `t51.test.mjs`, naming R77, R88 and R96; `held.test.mjs` and `t47.test.mjs` updated for the new row fields and the third `state`).
- Other modules' tests that read `heldcaptures` (capture-requests, ratification, screens-inquiry, instance-setup): 50 of 54 pass; the 4 failures are identical on the commit before mine.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs` (all and capture): 0 failures. `checks/coverage.mjs capture`: 49 of 49 live ids named, 0 failures. `checks/ownership.mjs /home/user/bio capture tranche/T51 job/T51/capture`: 7 files changed by capture, 0 failures. `checks/run.mjs`: capture clean; the 9 coverage failures are other modules'.

Size (session_0165wJwi73CSfM1M67RfnGVr): test runs 9, module lines 3756

## J2 · BLOCKED

B2 (K3949, K3957, K3962, K3958) is done in code and pushed at 00cda6e8ce on job/T51/capture. The words check for capture now reports 16 findings, down from 37, and every one of them is a string I judge no member reads, so it needs your decision (K3944) rather than a key.

Done:
- The 34 plain findings in index.mjs and grammar.mjs that a member reads (the basis sentences of heldat, the upload's evidence line, the reuse note, the grammar finding) now go through localize with capture.index.* and capture.grammar.* ids. The rest of the 34 are the 16 below.
- The 3 test copies (d57selflink, figures, t51) and one grammar fixture: a test label or fixture of its own, or a localize compare.
- K3958: words.mjs no longer reads word(key) with a variable key. Each of the 55 reads names its key as a literal in a READS table, so bundler R38 keeps only these rows.

Needs you (the words-reads.json `unkeyed` list for capture, DEC-258 (3)): each is a refusal's `detail` beside its code, which the shell draws as refusal.<CODE> and never the detail, or an internal diagnostic. Please have the design stream add them to unkeyed, or tell me one to key:
- index.mjs:631 a file is brought into the record by a signed-in member (refusal detail)
- index.mjs:652 the upload carried no bytes; nothing was written (detail)
- index.mjs:683 the file exceeds what this surface will capture even in parts (detail)
- index.mjs:693 the file's bytes could not be read whole or held under their own digest (detail)
- index.mjs:695 the file has no bytes; nothing was written (detail)
- index.mjs:699 the incremental hash and the block hash of the same bytes differ (500, internal fault)
- index.mjs:716 the acquisition receipt could not be written, so nothing was filed (detail)
- index.mjs:859 the signature does not verify over this account's statement (detail)
- index.mjs:897 reattest takes the sha256 of a capture the record holds (BAD_SHA detail)
- index.mjs:1079 looking at the source is a signed-in member's act (MEMBER_SESSION_REQUIRED detail)
- index.mjs:1644 name at least one document; nothing was written (detail)
- index.mjs:1725 these documents are not set aside; nothing was written (detail)
- index.mjs:1765 the set-asides recorded with this question could not be read (HELD_ACTS_UNREADABLE detail)
- index.mjs:1832 no reservation was offered, and an unreserved admission is the overrun D-492 closed (render allowance `why`, an internal decision reference; a diagnostic for builders, not a member's sentence)
- index.mjs:2565 a capture sha256 identifies the event; a record does not exist yet at capture time (BAD_CAPTURE_SHA detail)
- ops.mjs:86 body hash does not match the sha256 parameter (INTEGRITY detail)

Recommendation: unkeyed for all 16. Each is a refusal's detail or a builder's diagnostic, the category DEC-258 (3) already uses for capture's other 13 unkeyed rows. If you would rather a member see any of them, say which and I will key it.

Status: BLOCKED (cause: needs Bob). Nothing else is open in my module. When the unkeyed rows are added, the words check should be clean for capture, and I will re-run it, the tests and the checks and post COMPLETE.

## J3 · COMPLETE

COMPLETE for B2 (T51-180) and B3's answer. Pushed at b971648b68 on job/T51/capture.

Entries applied
1. The 34 plain findings in index.mjs and grammar.mjs that a member reads (heldat basis sentences, upload evidence line, reuse note, grammar finding) go through localize with capture.index.* and capture.grammar.* ids.
2. B3: the 13 refusal details in index.mjs and the one in ops.mjs are keyed through localize with capture.<stem>.<slug> ids. Tests compare by equality or assert the code.
3. The 3 test copies (d57selflink, figures, t51) and the grammar fixture no longer hold a sentence the product reads: a test label of its own, or localize compare.
4. K3958: words.mjs names each of its 55 keys as a literal in a READS table, so no variable key reaches word() (bundler R38).

Deferred: none.

Unkeyed, BOB's HANDOFF (B3): index.mjs:699 (500 internal fault, incremental and block hash differ) and index.mjs:1832 (render allowance `why`, D-492). Both remain in the words check until the design's unkeyed list carries them, accepted by name until R3's close.

Found in other modules: the handlist arm of checks/run.mjs fails in other modules' tests (action-grammar t47, actions acts, affordances t33/t36, agent-harness, agent-worker, answer-envelope, control-plane r53, and others), each listing op or code names. None is capture's; I did not touch them.

Tests and checks
- node --test bio-plane/test/m/capture/ bio-plane/test/cap13-reuse-pages.test.mjs bio-plane/test/d57selflink.test.mjs: 199 tests, 199 pass, 0 fail.
- node checks/words.mjs /home/user/bio capture: 2 findings (the two unkeyed above), down from 37.
- checks/format.mjs: 0 failures. checks/architecture.mjs capture: 0 failures.
- checks/ownership.mjs /home/user/bio capture tranche/T51 job/T51/capture: 9 files changed by capture, 0 failures.
- setup-words build.mjs --check: stale-rows note only, expected.
- checks/run.mjs: capture has no finding of its own; the handlist failures listed above are other modules'.

Size (session_01Hpc4xpSYy9jXRfRGxtGfm6): test runs 3, module lines 3756

## J4 · COMPLETE

**COMPLETE**, FR-52 · capture (commit `3932c68a83` on `job/T51/capture`, K4206).

**Entries applied**
1. **K4206 · declared `acquire` and `captureaccount`** in `DECLARED_OPS` (`bio-plane/src/capture/index.mjs`), beside the ops map, with the six already declared by part 1.
   - `acquire`: classes `admin`, `member`, `probe`, `daemon`; `mutating: true` (copied from `op-declarations`); weight `substrate` and description `substrate: the fetch layer (M2')` (copied from `op-grades`' ground row and its one-liner). `accepts`: `address, at, authority, coArchive, continue, file, for, locator, render, request, subresources, via` (every body field the act reads, `acquisition` `acquire`). `requires`: one group, `locator | continue | address` (the act refuses without any of them; BAD_LOCATOR names `locator`, BAD_ADDRESS names `address`). `matchedSweep` is not declared: the act never reads it from the body (acquisition R31).
   - `captureaccount`: classes `admin`, `member`, `probe`; `mutating: true`; weight `attested`; description copied from `op-grades`. `accepts`: `captureSha, signature, text`. `requires`: `captureSha, signature`.
2. **The judgment in `captureaccount`:** a missing `captureSha` was refused NOT_THE_CAPTURING_ACTOR, naming nothing. Fixed in my own arm (P8): an absent, null or blank `captureSha` is now the required-argument refusal (`REQUIRED_ARGUMENT_MISSING`, `argument: captureSha`, through the module's existing `#missingArgument`), before the actor check, writing nothing. A present but malformed or unrecorded digest keeps C-118.5, as the existing knocker test pins.
3. **Flaw found and fixed in my module (P8):** through the op, `captureaccount` took the account's instant `at` from the request body. The signature does not cover it, so a member could date an account. The arm now passes no body `at`, so the server's clock dates it (the R90 precedent for `sourcereach`). In-process callers still pass `at` (`knocker.test.mjs` does). This is a change of behaviour through the op; BOB should confirm it is wanted.

**Choices for BOB to check**
- `text` is accepted but not required for `captureaccount`: an empty text is C-118.6, whose row words are fixed by R69, so the refusal is uniform and does not name the field. The declaration test supplies the account's words itself.
- `acquire`'s description copies the existing one-liner `substrate: the fetch layer (M2')` rather than a registry label key or the act's help sentence (`act.acquire.does`). Say if you want the act's help sentence instead; it would need a new word key.
- The `acquire` fields are `accepts` from body reads only: the stamps `cls`, `member`, `sessMember` and `store` come from the query and are not declared, as the other ops' stamps are not.

**NEW R for BOB (the next free id, R98; text for `build/requirements/capture.md`)**
- **R98** *(not yet met: T51)* (T51; K4206; R69; amends R97) `captureaccount` refuses an absent `captureSha` (absent, null or blank) with the required-argument refusal naming it, writing nothing, before the actor check; a present digest that is malformed or not recorded as the member's is C-118.5 as R69 states. Through `op=captureaccount` the account's instant is this instance's clock: a body's `at` is not read. In-process callers keep `at`. Test: `declared-ops.test.mjs` (R98 twice, with the controls).
- **R97 amended (for BOB to write):** the op list gains `acquire` and `captureaccount`; both are declared as in entry 1 and tested in `declared-ops.test.mjs` (`R97 capture declares acquire`, `R97 capture declares captureaccount`).

**Reported stale generated artifacts** (not regenerated here; `manifest` §14)
- `bio-plane/src/setup-words/rows.mjs`: `node bio-plane/src/setup-words/build.mjs --check` reports it stale, word 18927 (`capture.declared.acquire`), because `acquire` and `captureaccount` add two `localize` ids. Owner: setup-words; regenerate at layer close.
- `bio-plane/dist/bio-plane.bundled.mjs`: the plane's source includes `capture`, so the plane bundle is stale. Regenerate at layer close with `node bio-plane/scripts/bundles.mjs`.

**Found in other modules (not touched here; for BOB)**
- `checks/run.mjs` coverage: 7 modules have live requirement ids named by no test: `agent-harness` R17; `agent-runner` R36, R37, R38, R40; `citation` R16, R17, R18; `installer-steps` R26, R31; `journey-check` R19; `link-sweep` R13, R14, R15; `monitoring` R75, R76, R77. None of those modules' files changed in this job. I did not run them against a baseline.

**Tests and checks**
- `node --test test/m/capture/ test/cap13-reuse-pages.test.mjs test/d57selflink.test.mjs` (bio-plane): 209 pass, 0 fail (baseline 205 before this job).
- `node --test test/m/capture/declared-ops.test.mjs`: 10 pass, 0 fail. Against the original source, the three new declarations and the R98 test failed (3 fail, 6 pass), as they should.
- Cross-module declaration and op-grades agreement (`op-declarations/declared`, `op-declarations/t48`, `op-grades/ladder`, `op-grades/register`, `test-support/declared-ops`): 74 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures. `checks/architecture.mjs /home/user/bio capture`: 0 failures. `checks/coverage.mjs /home/user/bio capture`: 50 of 50 live ids, 0 failures. `checks/ownership.mjs /home/user/bio capture tranche/T51 job/T51/capture`: 0 failures.
- `checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0 failures; words 0 failures (words check: `missingkey 0`); coverage 7 failures, all in other modules (above).

Size (session_014hQZyBTbmm6Zp4ZEjLodrd): test runs 7, module lines 3788

## J5 · COMPLETE

COMPLETE for B4 (K4206) and B5 (CHANGE K4226). Session session_01LedUpF3AAa5y9xN9UujA4d.

**Entries applied**
1. **B4 · K4206**: `DECLARED_OPS` in `index.mjs` declares `acquire` (accepts `address, at, authority, coArchive, continue, file, for, locator, render, request, subresources, via`; requires one of `locator | continue | address`, its alternatives named as the arm's refusals name them) and `captureaccount` (accepts `captureSha, signature, text`; requires `captureSha, signature`). Class, weight and description are the ops' existing rows'. `matchedSweep` is not declared: the arm never reads it (acquisition R31). A missing `captureSha` is refused as `REQUIRED_ARGUMENT_MISSING` naming it (R98); a malformed or unrecorded digest stays `NOT_THE_CAPTURING_ACTOR` (R69). Through the op the account's instant is this instance's clock; a body's `at` is not read.
   This was committed as `3932c68a83` by the earlier session of this job (`session_014hQZ…`), which stopped before posting COMPLETE. I checked that commit against R97 and R98 and its tests (`declared-ops.test.mjs`, `acquire` and `captureaccount` declaration tests, and the R98 test with its controls) and kept it. No change to it.
   R97 and R98 are already in `build/requirements/capture.md`, so no new R id is needed.
2. **B5 · CHANGE K4226**: `captureOps(c, url, body, env, h = {})` takes the handler's in-process parts; the `acquire` arm passes `h.timings` to `c.acquire` as `opts.timings`, only when given (`...(h.timings ? { timings: h.timings } : {})`). The other options (`cls`, `member`, `sessMember`, `storeName`) are unchanged. New test `bio-plane/test/m/capture/timings.test.mjs`, two tests naming R73: a given object reaches `acquire` as the same object; with none given no `timings` key is passed and the options are as before (control).

**Requirement wording not placed (ownership)**: B5 asks for the `acquire` arm's line to be amended in `build/requirements/capture.md`. The ownership check refuses that file for capture (outside its paths), so I reverted my edit (commit on this branch) and leave it to you, Bob, as requirements are yours. The wording to place, as an amendment to R73 (T51; K4226; amends R73):
> The `acquire` arm of the ops map hands the handler's `timings`, when one is given, to `acquire` as `opts.timings` (`acquisition` R95), the same object, so a caller that stops waiting reads the stages that ran; with none given no `timings` key is passed, and the arm's other options are unchanged. Test: `timings.test.mjs` (a given object reaches `acquire`; with none, the options are as before).

**Deferred**: none in my module.

**A question for BOB (not my module)**: in production `op=acquire` reaches capture's arm inside the Durable Object (`acquireOp` in `ops.mjs` calls `store.fetch('/acquire…')`, and the route map is `plane/store.mjs`'s `captureOps(captureOf(ctx), url, body, env)`), and that call passes no handler. An object cannot cross the fetch boundary, so `h.timings` can reach the arm only when the plane's route map passes the in-process handler, which is PLANE #44's gatedOp forwarding. I have not changed `plane/store.mjs`. Please confirm PLANE #44 passes `h` into `captureOps` in-process, or tell me where else the timings object should come from.

**Found in other modules**: nothing new from my work. `checks/run.mjs` shows the usual reds in other modules (citation's import order, agent-harness R17, agent-runner R37/R38/R40, installer-steps R26/R31, journey-check R19, and the op-grades and strength testcopy/inline findings). None is in capture's files.

**Tests and checks**
- `node --test bio-plane/test/m/capture/ bio-plane/test/cap13-reuse-pages.test.mjs bio-plane/test/d57selflink.test.mjs`: 211 tests, 211 pass, 0 fail, 0 skipped (includes the two new timings tests and the K4206 declaration tests). Before the change, the timings test failed on the missing key, as intended.
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio capture`: 0 failures.
- `checks/coverage.mjs /home/user/bio capture`: 51 of 51 live ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio capture tranche/T51 job/T51/capture`: 3 files changed by capture, 0 failures (after the requirements revert).
- `checks/run.mjs /home/user/bio`: capture's files show 0 findings for architecture and words; the 26 words failures and the coverage and architecture reds all sit in other modules.
- I installed the missing `node_modules` for the lockfile directories (`agent-runner`, `bio-plane/src/journey-check`, `file-scanner`, `sheet-worker`, `site`) before the test run.

Size (session_01LedUpF3AAa5y9xN9UujA4d): test runs 3, module lines 3789

## J6 · COMPLETE

**COMPLETE** for B6 (K4234). Pushed at 9caf8a5ce6 on `job/T51/capture` (merged `tranche/T51` at ead39e0ca2 first; fast-forward).

**Entries applied**
1. **K4234 · `acquireOp` forwards the trace.** `acquireOp` (`bio-plane/src/capture/ops.mjs`) takes the door's `trace` and sends it to the store's `acquire` as the header `x-civicsmith-trace`, only when it is a printable string of at most 200 characters (the shape `signin-door` R3 mints; `ask.mjs`'s `doorHeaders` rule). `captureOp`'s `acquire` arm passes `h.trace` through. No query or body change; the request's URL and body are as before.
2. **Test**: `bio-plane/test/m/capture/trace.test.mjs`, two tests naming R99. (a) A given trace reaches the store's acquire as the header, and is in neither the query nor the body. (b) Control: with no trace, `null`, an empty string, a string with a space, a 201-character string or a non-string, the store's acquire carries no trace header. Before the change, test (a) fails and (b) passes; after, both pass.

**Decisions for BOB to check**
- **Header, not query or body.** B6 says "query or body, as plane R55 carries it". R55 carries the trace in the `x-civicsmith-trace` header and says "in no body or address", so I used the header. If the object must read it from the query instead, say so and I will change it.
- **Requirement line for BOB to place** (new R99, next free id; capture.md has R98 as its last):
> **R99** (T51; K4234; plane R55) `op=acquire`'s arm hands the door's `trace` to the store's acquire as the header `x-civicsmith-trace`, so the object holds that acquire's timings under it (plane #44): only a printable string of at most 200 characters, never in the query or the body; none handed, no header. Test: `trace.test.mjs` (a given trace reaches the store; with none or an unprintable one, no header).
- **Dependency, not my module (PLANE #44).** `captureOp` reads `h.trace`, but `bio-plane/src/plane/door.mjs` (line ~92) hands `captureOp` only `{json, storeSilent, storeRefusal, doAnswer, storageAbsent, requiredArgument, cls, member, sessMember, storeName, key, viewer, readAcquired}` and no `trace`. Until PLANE #44 adds `trace` to that handoff, the header is never sent in production. I have not changed `door.mjs`.

**Deferred**: none.

**Found in other modules (not touched; for BOB)**: `checks/run.mjs` shows the usual reds in other modules, notably the `op-grades` testcopy findings (t36 and t47, t48 lines 34 and 83, which quote "capture's digest" in test titles). None is in capture's files.

**Tests and checks**
- `node --test test/m/capture/ test/cap13-reuse-pages.test.mjs test/d57selflink.test.mjs` (bio-plane): 213 tests, 213 pass, 0 fail (211 before; +2 from `trace.test.mjs`).
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures. `checks/architecture.mjs /home/user/bio capture`: 0 failures. `checks/coverage.mjs /home/user/bio capture`: 51 of 51 live ids named by a test, 0 failures. `checks/ownership.mjs /home/user/bio capture tranche/T51 job/T51/capture`: 1 file changed by capture, 0 failures (`ops.mjs` and the new test file are both capture's paths).
- `checks/words.mjs /home/user/bio capture`: 0 failures; `unkeyed 6` (the design's list, accepted by name, as B3 records; no new sentences in this change).
- `checks/run.mjs /home/user/bio`: capture's files show 0 findings.

Size (session_01D6KgPVrvb8G2TEKd3zrgrR): test runs 4, module lines 3797

## J7 · COMPLETE

**COMPLETE** for B7 (fix round 2, wave 3; K4323, K4326) · commit `0dc8050eb4` on `job/T51/capture`, merged with `origin/tranche/T51`.

**Entries applied**
1. **C14's bound, the batch grade.** `heldCaptures` grades a page once: a private `#gradesOf` asks `provenance.captureGrades` (provenance R71) one time for the page's distinct first-capture digests, and each row's `capture.grade` is that answer whole (equal to `captureGrade`'s). A provenance that serves no batch is asked one digest at a time as before; a batch that throws, answers no list, or answers a non-object (a promise, a string) reads each grade null with the digest still named. An empty page reads nothing. `captureGrade` is no longer asked on the held path.
2. **The picker rows' fields.** `fields: "picker"` rows now also carry `source` (`{address, via, retrieved}` or null), `collected_since` and `actor`, exactly as the full row gives them (`#captureFacts`); one more read per page (the actors), no grade, no questions, no eligibility, no bytes, no archive. The full read is unchanged (the golden list test still passes).

**Proposed requirement lines (BOB writes them)**
- Amend **R77** (T51 fix round 2; K4326; provenance R71): *`heldCaptures` grades a page of rows in one batch: `provenance.captureGrades` is asked once for the page's distinct capture digests, each row's `capture.grade` the answer `captureGrade` gives for it; an answer that is not an object, a batch that fails, or a provenance with no batch reads that grade null with the digest named (a provenance serving no batch is asked one digest at a time); an empty page asks nothing. The `picker` row (`fields: "picker"`) carries `bundle_id`, `title`, `project`, `source`, `collected_since`, `capture: {sha256}`, `actor` and `standing`, the three added fields as the full row gives them, and nothing heavier.* Tests: `fix2-t51.test.mjs` (three new tests naming R77; the C14 picker test updated to the new field list).

**Seen failing first**: against the source without my change, the three new tests and the updated picker test fail (4 fail, 6 pass); with it, 10 pass. Controls in them: an empty page reads nothing; the full read equals its earlier answer; the sight limits the picker as it limits the list; a throwing, list-less or non-object batch reads null.

**Deferred**: none. **Found in other modules**: nothing new. One red outside capture, identical on `origin/tranche/T51` without my commit: `screens-intake/common.test.mjs` "R8 every act names one op…" (`capture draws capturerequests`).

**Tests and checks**
- `node --test --test-force-exit test/m/capture/ test/cap13-reuse-pages.test.mjs test/d57selflink.test.mjs` (bio-plane): 223 tests, 223 pass, 0 fail.
- Users of `heldcaptures` (instance-setup seeds, capture-requests plane, screens-daily, screens-inquiry document and t50, screens-intake, affordances catalogue): 510 tests, 509 pass, 1 fail (the screens-intake red above, also red at the tranche tip).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs capture`: 0 failures. `checks/coverage.mjs capture`: 52 of 52 live ids, 0 failures. `checks/words.mjs capture`: 0 failures. `checks/ownership.mjs capture origin/tranche/T51 job/T51/capture`: 3 files, 0 failures.
- No generated artifact made stale beyond the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, rebuilt at layer close); no new word key.

Size (session_01CbTTqezcoRxwxDi7p8kyVT): test runs 6, module lines 4219

## J8 · COMPLETE

**COMPLETE** for B8 (K4328) · commit `66a70b6b46` on `job/T51/capture` (J7's work is below it).

**Entries applied**
3. **R86, an interrupted upload.** `uploadCapture` told a home from a receipt: provenance's `registerHolds` answers `registered` (the register files the bytes under a document) and `acquired` (a receipt names them). Bytes the register files answer as before (`existed: true`, no document, no actor, `within` not called). Bytes only a receipt names (an upload interrupted before it was filed) answer `existed: true` **with `document`**, built as a new upload's (this upload's statement, name, profile, `by`); the receipt is written as a second sighting; no actor is recorded and `within` is not called, so the screen files the document for the viewer by its own act. A receipt that cannot be written is still `RECEIPT_NOT_WRITTEN` with no document.
4. **R77, `whole`.** Every held row, the picker's and the full read's (archive rows included), carries `whole`: `true` when the evidence store holds an object under the row's capture fingerprint, `false` when none is (a copy held in parts only), `null` where it cannot be said (the row has no capture, no evidence store, a `head` that fails, or the page's wait `HELD_PAGE_WAIT_MS` ran out). Each distinct fingerprint of a page is asked once, 8 at a time, under that wait; an empty page asks the store nothing.

**Proposed requirement lines (BOB writes them)**
- Amend **R86**: *Bytes the record's register files under no document but a receipt names (an upload interrupted before it was filed) also answer `existed: true`, and with `document`, built as a new upload's from this upload's statement, name and type; the receipt is written as a second sighting, no actor is recorded and `within` is not called. Bytes the register files answer `existed: true` with no document, as before.* Test: `fix2-t51.test.mjs` (R86 K4328), controls: a held home, bytes nowhere held, a receipt that cannot be written.
- Amend **R77**: *Each row, the `picker` row included, also answers `whole`: true when the evidence store holds an object under the row's capture fingerprint, false when it holds none (a copy kept in parts only), null where that cannot be said (no capture, no evidence store, a failed read, or the page's wait `HELD_PAGE_WAIT_MS` ran out). A page asks the store once for each distinct fingerprint, and nothing for an empty page.* Test: `fix2-t51.test.mjs` (R77 K4328), controls: a missing evidence store, a failing head and an empty page.

**Decisions of mine, for BOB to record** (details under P17; none needs Bob)
- `whole` is a tri-state, never `false` for "could not ask": screens withhold vouch and OCR only on `false`.
- The interrupted upload's `within` is not called (B8 says the screen files it); if BOB wants the control plane to promote it in the same act, that is a call to `within` on this path and an amendment to R86.
- The check is a `head` per distinct fingerprint, not a rule on size, because a copy kept in parts before C5 can be under 32 MiB too.

**Found in other modules (for BOB)**: `captureupload`'s door (control-plane / store-door) must carry the new `document` on an `existed: true` answer and `screens-intake` must draw it; I did not touch them. `op=heldcaptures` declarations (`op-declarations`) list `fields`; no change needed to accept, but `affordances` help for `heldcaptures` may mention `whole`. Stale generated: `bio-plane/dist/bio-plane.bundled.mjs` (the plane source includes `capture`); `setup-words/rows.mjs` is unaffected (no new `localize` id).

**Deferred**: none. Correction to J7's Size line: module source is 3,976 lines at J7; now see the line below.

**Tests and checks**
- `node --test --test-force-exit test/m/capture/ test/cap13-reuse-pages.test.mjs test/d57selflink.test.mjs` (bio-plane): 225 tests, 225 pass, 0 fail. Seen failing first against the source without the change (6 fail). `held-golden.json` regenerated; its diff is only the added `"whole": null` (that fixture has no evidence store).
- Users (instance-setup seeds, capture-requests plane, screens-daily, screens-inquiry document and t50, screens-intake, affordances, op-declarations, op-grades, wizard-scripts, interface-shell): 1528 tests, 1525 pass, 3 fail, the same three at `origin/tranche/T51`: op-grades R42 and R46, screens-intake `common.test.mjs` R8.
- `checks/format.mjs`: 0 failures. `architecture.mjs capture`: 0. `coverage.mjs capture`: 52 of 52. `words.mjs capture`: 0. `ownership.mjs capture origin/tranche/T51 job/T51/capture`: 6 files, 0 failures.

Size (session_01CbTTqezcoRxwxDi7p8kyVT): test runs 11, module lines 4066

## J9 · COMPLETE

**COMPLETE** for B9 (K4337, K4334) · commit on `job/T51/capture`.

**Entries applied**
1. **R77, `format` (DEC-394 (3a)).** The full held row (archive rows included) carries `format`: the format id the document's own register document (`data/provenance.json`) profiles the row's capture as, `null` when it names none or there is no register document. The picker row carries none. Test `fix3-t51.test.mjs` (R77), control: unregistered/format-less rows answer null; picker has no key. `held-golden.json` regenerated: diff is only added `format` keys.
2. **`heldcaptures` fields (K4334).** `DECLARED_OPS.heldcaptures` already accepts `fields` and `state`; no change needed. A new test proves the arm reads both as declared (picker rows; the three states) and refuses a value outside either, naming it.
3. **K4208, census ops I own.** Declared `heldat` (machineClasses admin, probe; requires one of address/sha256), `capturegrade` (requires capture|captureSha) and `captureaccounts` (requires nothing: an absent digest reads as an unknown one, R69). `declared-ops.test.mjs`, with `declaredOpHolds`. (`opencaptures` is acquisition's.)

**Proposed requirement lines (BOB writes them)**
- Amend **R77**: *The full held row (not the picker's) also answers `format`: the register's format id for the row's capture as the document's register document holds it, `null` when it holds none.*
- Amend **R97**: *its op list gains `heldat`, `capturegrade`, `captureaccounts`; `captureaccounts` requires nothing because an absent digest answers as an unknown one (R69).*

**Deferred**: none. **Found in other modules**: none.

**Tests and checks**
- capture suite + cap13 + d57: 230/230. Users (screens-inquiry/intake/daily/settings/investigate/action/publish: 1915/1915; capture-requests, ratification, instance-setup, affordances, op-declarations, op-grades, interface-shell, wizard-scripts, extraction, doorbell: 1778 pass, 0 fail).
- format 0; architecture capture 0; coverage 52 of 52; words capture 0 failures; ownership 6 files, 0 failures.

Size (session_01T3TLLsdGuDoX11D81FT2G3): test runs 8, module lines 4079

## J10 · COMPLETE

**COMPLETE** for B10 (fix round 3, wave 1: C9, C14, C16) · commit on `job/T51/capture`.

**Causes met**
1. **C9, my part (R77 amended, R100)**: `recordSeenIn({captureSha, project, by, at})` and the table `seen_in(capture_sha, project, by, at)`, idempotent on (sha, project) (first instant and member kept), `{recorded: false}` for a bad digest, a blank or over-200 project, or an absent/blank/machine `by`; declared to record-core's purge with capture's other tables (`CAPTURE_PURGED_TABLES`, R87). `heldCaptures({project})` also lists a document seen there: the row carries `also_here: {home}` (the home project as `project` names it); a document whose home is the project carries none; the existing sight predicate runs over the home bundle, so a viewer who cannot see the home is shown nothing (an unseen document reads as an unknown one). The picker row carries `also_here` when it applies. A service, not an op: nothing to declare.
2. **C14, my part (R77)**: the picker row answers `whole` from the size the register recorded (true up to `MULTIPART_KEEP_MAX`, `acquisition` R10; false past it, held in parts alone; null with no capture or no recorded size) and asks the evidence store nothing for any row. The full list and the one-document read ask the store as before. `fields` was already declared.
3. **C16, my part (R77)**: `heldCaptures({bundle_id})` (`op=heldcaptures&bundle_id=`), accepted in the declaration, answers that document's row only, the store read for that row alone; an unknown id and one the viewer may not see answer alike (no row, no holder named); blank reads as absent; the other filters still apply.

**Decisions of mine, for BOB to record** (none needs Bob)
- Picker `whole` from size alone cannot tell a capture kept before C5 in parts (above one part, up to 32 MiB) from one kept whole since: it reads true for such an old capture whose store holds only parts. The full row and the single-document read (what the vouch and OCR screens act on) still ask the store. If BOB wants the picker exact for old captures, the register would need to record the keeping (provenance's, a later entry).
- `also_here` on a picker row is present only when it applies, so the picker's field set is unchanged for every list that names no seen-in project.

**Proposed requirement text**: none beyond R77 and R100 as written.

**Deferred**: none. **Found in other modules**: none.

**Tests and checks**
- New `fix3b-t51.test.mjs` (5 tests, seen failing before the change: R100 x2 with the controls, R77 C16 with its unknown/unseen control, R77 C14 with its full-row control, the op route). `fix2-t51.test.mjs`'s `whole` test now holds the full row's store read (the picker's moved to `fix3b`).
- capture + cap13 + d57: 235 tests, 235 pass, 0 fail.
- Users: op-declarations 240, op-grades 145, affordances 269, capture-requests 129, ratification 251, instance-setup 217, screens-intake 204, screens-inquiry 447, screens-daily 252, interface-shell 269, control-plane 340: all pass, 0 fail. (`impact.mjs` names 98 modules because `DECLARED_OPS` is a shared table; I ran the readers of `heldcaptures` and of the declarations, two suites at a time.)
- `checks/run.mjs`: architecture 0, words 0 failures; capture is in no coverage failure (the 15 are other modules'); the one format failure is `build/rulings.md`:4346 (BOB's). `checks/ownership.mjs`: 5 files changed by capture, 0 failures.
- Not yet on the tranche: op-declarations/screens must pass `bundle_id` on `op=heldcaptures` (declaration accepts it already).

Size (session_0168CdB2iLQAE8ydXTkw6gic): test runs 14, module lines 4140

## J11 · QUESTION

QUESTION (words for R101 `op=captureseenin`; best reading below, I carry on and none of it blocks the job).

Stand-ins in use, each a `localize` default that the design's row replaces when it lands (the list wins, so no code change then):
1. `refusal.CAPTURE_NOT_HELD` already exists in words.json (DEC-342) and is held by setup-words, but its English ends "so it cannot be cited", which is wrong where a member is filing a document in a project, and it is not in capture's `reads` in words-reads.json. My new row C-118.11 `CAPTURE_NOT_HELD` reads it through `localize("refusal.CAPTURE_NOT_HELD", …)` in checks.mjs (not `say`, so `t50-words`' pin of WORD_KEYS to the design's `reads` list is untouched). Needed from the design: add `refusal.CAPTURE_NOT_HELD` to capture's `reads`, and either a sentence that fits filing (the same code is used by citation, lines, events, retrieval-browse and others, so a shared wording may be what they want), or tell me to use another code.
2. Refusal codes the screen will draw for this op, with a row today: `MEMBER_SESSION_REQUIRED` (`refusal.MEMBER_SESSION_REQUIRED` exists), `PROJECT_ACT_NOT_A_PARTICIPANT` (membership's C-56.1, reused as R101 allows; `refusal.PROJECT_ACT_NOT_A_PARTICIPANT` exists), `REQUIRED_ARGUMENT_MISSING`. One code with no catalogue row and no word: `SEEN_IN_NOT_RECORDED` (502, the write failed; `detail` only). If the design wants a sentence for it, it needs a key; otherwise it belongs on `unkeyed`.
3. Builder diagnostics (details; `unkeyed` candidates, as B3 did for the other details): `capture.index.seenin_member_act`, `capture.index.seenin_not_held`, `capture.index.seenin_not_recorded`; and the op's description `capture.declared.captureseenin`.

## J12 · COMPLETE

COMPLETE, fix round 3, C9 (K4370): capture R101 `op=captureseenin`. Commits 4368f6e80e, 148f9b8452 on job/T51/capture (tranche/T51 merged first).

Built: `Capture.fileSeenIn` and the ops-map arm `captureseenin` (body {captureSha, project}; `by`/`viewer` the door's stamps; instant the instance clock), calling `recordSeenIn`. Answers {ok, recorded, home}. Refusals in order: MEMBER_SESSION_REQUIRED 403 (machine/absent `by`); required-argument naming captureSha or project; CAPTURE_NOT_HELD 404 (new row C-118.11, one answer for an unknown digest and a document whose home the viewer cannot see, naming no holder); membership's PROJECT_ACT_NOT_A_PARTICIPANT (C-56.1, reused via `projectAuthority`, 403; an unknown project meets it too); SEEN_IN_NOT_RECORDED 502 if the write fails. A repeat and a filing into the document's own home answer recorded:false with `home`. Declared in DECLARED_OPS (classes admin/member/probe, mutating, stamps by+viewer, needs contribute, weight reversible, fields accepts=requires=captureSha,project).

Decisions of mine, for BOB to record (none needs Bob): (1) the filing into the document's own home writes nothing (it lists there already). (2) "may contribute" = joined/leaving participant through `projectAuthority` (the door's `contribute` capability is the declaration's `needs`). (3) weight `reversible` as provenance's declareorigin, additive and losing nothing; op-grades' CAUSE-SHELL-3 rules the grade. (4) C-118.11 stand-in words: see J11 (QUESTION).

Tests (seen failing first, with controls): new fix3c-t51.test.mjs, 7 tests naming R101 (and R97): through the op, list shows it with also_here, home kept; repeat; own home; non-participant and unknown project refused, nothing recorded, joined control; not-held vs unseen identical, no holder named; machine/absent by, malformed digest, blank/long project; declaredOpHolds; write failure. Updated for the new row (extension, no weakening): evidence-absent, knocker (R37 row list and numbers), t50-words (row list; the new row's words asserted equal to word("refusal.CAPTURE_NOT_HELD")).
- capture suite + cap13 + d57selflink: 242 tests, 242 pass, 0 fail.
- Impact (DECLARED_OPS is a shared table, 111 modules named; I ran the readers of it): op-declarations, op-capabilities, admission, answer-envelope, store-door, op-grades 552 tests, 550 pass; control-plane, plane, affordances 895 tests, 893 pass. The 4 reds are not mine: op-declarations t33 R19/R6 and affordances t33 R12/R24 name `moneysets` (money R28's op, no spec yet); op-grades R17 `groupdescriptiondraft`; plane release R24 `screen.objective.purpose` not in the words list.
- checks/run.mjs: format 0, architecture 0, words 0 failures (capture clean); coverage: capture 54 of 54 ids named, 0 failures (other modules' 8 reds: agent-harness R17, agent-runner R37 R38 R40, control-plane R117 R118, entities R64, file-safety R49 R50, installer-steps R26 R31, interface-shell R113, journey-check R19). ownership: 0 failures.

Reported to BOB (found in other modules / stale artifacts): `bio-plane/src/setup-words/rows.mjs` (setup-words' generated artifact) is stale for my new `localize` ids (capture.index.seenin_*, capture.declared.captureseenin); regenerate at layer close. op-declarations/op-grades: no hand row is needed (my declaration builds the spec), but op-grades must grade `captureseenin`; the screens' door must send it as POST with the body above.
Proposed requirement lines for BOB: R37 gains C-118.11 `CAPTURE_NOT_HELD` (where `fileSeenIn > is-capture-held`); R97's op list gains `captureseenin`; R101 may state SEEN_IN_NOT_RECORDED (502) and that a filing into the document's own home records nothing.
Deferred: none.

Size (session_01L8v9FL8LnZcJagkfmzoWBk): test runs 14, module lines 4151

## J13 · COMPLETE

COMPLETE for B12 (CHANGE), 798e0f2d04 on job/T51/capture (tranche/T51 merged first).
captureseenin's declared description is now op-grades' sentence word for word (key capture.declared.captureseenin), and its weight is `observational` to agree with the hand row (my earlier `reversible` made the plane refuse registration: DECLARED_OP_DISAGREES). Nothing else changed.
Tests: capture + cap13 + d57selflink + op-grades + op-declarations 637 tests, 634 pass. The 3 reds are other modules' ops without a spec at this tip: moneysets (money), remindersfor (action-clocks), scanmirror (file-safety). op-grades' cause3 C64 test (captureseenin) now passes; capture's plane.test.mjs passes.
Checks: format 0, architecture 0, ownership 0 failures; coverage capture 54/54. Words: capture clean; the 3 words failures are op-grades' own (t33.mjs:214, t51.mjs:41, :45 inline plain sentences), not mine.
Size (session_01L8v9FL8LnZcJagkfmzoWBk): test runs 18, module lines 4151

## J14 · COMPLETE

COMPLETE for B13 (START, fix round 4, wave 1, #3), `job/T51/capture` (tranche/T51 merged first and again before this entry; wave-1 jobs merged before me are in my tree).

**Cause 1, P9 / P10 / C14, capture's part (P10): `heldcaptures` for the Held and Document screens.**

(1) *Root cause.* Measured first on the smoke copy (LIVE-CHECK, read-only, `build/plan/lane-performance/tools/ops.mjs`, administrator, 50 held documents now; 3 repeats): full rows 3.2-4.0 s (limit 50), 2.5-2.6 s (25), 0.8-1.0 s (10), 0.43-0.55 s (5); picker rows 0.28 s for any count; one document by `bundle_id` 0.42 s full against 0.245 s picker, which is the door's floor. So the floor is 0.25 s and each full row adds about 60-85 ms, not overlapped. Where that goes, read in the code and checked against the single-document reads:
 a. **Mine, fixed.** `heldCaptures` awaited `#wholeOf` (the store's heads, 8 lanes) and only then began `#pageAnswers` (examinations and archive groupings, 8 lanes): two waits in sequence, `index.mjs` (the `await` pair that stood at the old :1502 and :1522). They are begun together now (`Promise.all`).
 b. **Mine, fixed: nothing lets a screen ask for only the rows it draws.** The full read answers every row of the page; the picker answers none of the heavy fields. New `bundle_ids` (below) is the means.
 c. **Not mine, reported (P9).** One document alone costs 1.7-2.4 s: `INFO-2026-0042-a-pdf-from-www-oaklandca-gov`, a 4.26 MB PDF whose register document names no format (`format: null` in the full row). A capture with no named format is asked of `acquisition.archiveList(limit 1)` (R77, "a document whose profile cannot be read is asked"), and `archiveList` of a held, never-opened capture runs `archiveProfile` -> `profileOf` over all its parts (`acquisition/unpack.mjs`:~790): the whole 4 MB is read to learn it is not a ZIP. That one row is about half of the 27-row full read's 3.5 s. Fix is acquisition's: look at the first bytes (the ZIP magic) before profiling the whole.
 d. **Not mine, reported (P9).** The examination, `ratification.examineMember` (`release.mjs`:170), asks `contradiction.candidatesFor({on: {bundle}})` once for each of `CONTESTED_STATES` (open, explained_not_shown, taken_up), and each call re-runs `#candidatesNaming` (`contradiction/index.mjs`:1515), a scan of `contradiction_candidates` with `json_extract` in four columns, the state filter applied after the scan. Three identical scans per document, synchronous, so no lane overlaps them. I could not time it alone on the copy (no per-op time exists; control-plane's `Server-Timing` is wave 0); it is the likely remainder of the 60-85 ms a row. Fix is ratification's (one read, state filtered after) or contradiction's (a state argument that is a list, or an indexed bundle lookup).
 Root cause of the screens' 3.5-4.7 s is therefore (a)+(c)+(d) and the screens reading every row; (b) is the provider's means for the screens. The split between (c)/(d) and the rest is by the single-document reads above, not a per-op clock.

(2) *Why the tests missed it.* T49's timing test used 100 plain documents with a 20 ms store and a 10 ms **async** examination, so (a) did not show, the examination's thread cost was never stated, and no test read the walker's case (27 documents of mixed formats read whole, nothing asked only for the rows on screen). Fix: `p10-t51.test.mjs` states the store's round trip, the examination's thread cost and counts what the page asks of each, by document.

(3) *Failing-first tests* (`bio-plane/test/m/capture/p10-t51.test.mjs`, 5 tests, each seen red before the code, green after; the overlap test also red with the two awaits put back in sequence, `doneAtFirstProbe` 6, expected 0):
 - the walker's row: 27 documents, store 40 ms a read, examination 15 ms of thread. Picker for the page asks the store and the examination nothing (0, 0); then `bundle_ids` of the 10 on screen asks the examination exactly 10 times (once each) and the store about exactly those 10 captures and no other; the two reads together take 348 ms (limit asked: under 1 s). Control: the same page read whole asks all 27 and takes 1,117 ms.
 - `bundle_ids` selects the answered rows and does not shrink the list: only listed documents the list holds, in the page's order; unknown, vouched-not-asked and unseen ids are no row; `limit`/`truncated`/`next` continue the same selection; an empty list selects nothing; `op=heldcaptures` takes a comma list; beside `bundle_id` both apply. Over real `acquire` of a ZIP: an archive named alone still groups its files beside it, a file named alone (its archive being a row of the list) is no row.
 - refusal control: a `bundle_ids` that is not a list of non-blank strings, or names more than `HELD_IDS_MAX` (50), is `REQUIRED_ARGUMENT_MISSING` naming `bundle_ids`, nothing read; exactly 50 is accepted.
 - overlap: the first archive grouping is asked before any head for the page has answered.

(4) *Platform check: P done for the baseline, not for the fix.* The numbers above are the smoke copy's today. The fix is not deployed (K4428), so the after-numbers cannot be read: **this cause stays open until the redeploy**, when the Held screen's read set (one picker, one full for the rows drawn) is timed by `Server-Timing`. Local (F-style fixture, stated costs) numbers are in (3). Expected on the copy: picker 0.28 s + full for 10 rows about 0.8-1.0 s, run together by the screen; with (c) and (d) fixed in their modules about 0.5 s.

**What I changed.** `heldCaptures` takes `bundle_ids` (array, or a comma-separated string from the op's query; at most `HELD_IDS_MAX` 50, exported); the route passes `q("bundle_ids")`; `DECLARED_OPS.heldcaptures.accepts` gains `bundle_ids` (declared-ops test passes with it). The refusal's shape sentence is keyed `capture.index.bundle_ids_shape`. `#wholeOf` and `#pageAnswers` run together. No other behaviour changed: without `bundle_ids` every answer is as before (the capture suite's 247 tests are unchanged and green).

**For BOB.**
 - *Proposed requirement line (BOB writes it): R102 (fix round 4; P10; amends R77, R91).* "`heldCaptures` takes `bundle_ids`, at most 50 distinct document ids (a list, or a comma-separated string at the op); only the listed documents of the list are answered, in the list's own order and sight, with `limit`, `truncated` and `next` as for the page, `bundle_ids` selecting and not narrowing what the list holds (an archive named alone still groups its files). Absent or empty names none. A value that is not a list of ids, or names more than 50, is the required-argument refusal naming `bundle_ids`. The store's reads and the page's examinations and groupings are begun together. So a screen reads the picker rows for the page and the full fields for the rows it draws." Test: `p10-t51.test.mjs`.
 - *Users (wave 2): screens-intake (Held) and screens-inquiry (Document)* read `fields=picker` for the page, then `fields` absent with `bundle_ids` = the rows drawn (10 at a time or on opening a row). The Document screen needs one document: `bundle_id` already gives it; it should not read `limit=500` full rows.
 - *Findings in other modules (P9), against their requirements/efficiency:* acquisition (c) and ratification/contradiction (d) above. Neither is a requirement change.
 - R-NOTMET: no open QUESTION, nothing deferred in my module; the one thing that stays open is the after-deploy time, which is the plan's own step 4.

**Tests and checks.** capture + cap13-reuse-pages + d57selflink: 247 tests, 247 pass (p10-t51 5). Users run: screens-inquiry, screens-daily, interface-shell (1,026 pass), screens-intake, capture-requests (all pass; `screens-intake/capture.test.mjs` R22 failed once with another suite running at the same time and passes twice alone), op-grades + op-declarations 396 tests, 395 pass: the red is op-declarations `t36` R34 (affordances R48), which is red on `tranche/T51`'s tip too (checked with my `index.mjs` swapped for the tip's: same failure), not mine. `checks/run.mjs`: format 0, architecture 0, coverage: no capture id unnamed, words: none in capture (3 failures are op-grades', as before), ownership 0 failures.
Size (session_012XpvBxY8DzCpmcr55C2RtT): test runs 14, module lines 4171

## J15 · QUESTION

QUESTION (not blocking; I carry on on this reading). R103's "a capture session's expiry ends no owed work" conflicts with R22's text ("load answers found: false for an unknown or expired session") and R46.

My reading: every saved `capture_sessions` row is resume state for work still owed (acquisition saves one only while supporting files or a render are outstanding, and drops it when they end), so the clock must never delete it. Built: save and load no longer prune expired rows; `loadCaptureSession` finds an expired session and answers `expired: true` beside its state; `dropCaptureSession` (work done or ended with a stated final reason) is the only thing that removes a row; `liveCaptureSessions` (R46) still lists only unexpired sessions, so queue's partial-capture condition and the member's "Finish it" window are unchanged. Old rows already pruned stay lost (new data only, R-OLD); nothing to repair.

Consequence: two existing tests pin the old behaviour (services.test.mjs R22 "an expired session found: false", and R74's list of writers, which counted `loadCaptureSession` as one because it pruned). I update both to the new reading, not weaken them. acquisition's ledger entry (R100) must call `dropCaptureSession` when its work ends or is final, or the row stays.

If you want a different seam (e.g. the ledger entry carries the state itself and sessions still expire), say so and I redo this part; the upload half (R103's first sentence) does not depend on it.
