# capture (T51)

**Status** · session_017HhDkwNt6ddjD3dPVU5hd5 · depth 2 · COMPLETE · handled B36

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

## J16 · QUESTION

QUESTION (re B16; blocks only the last swap). Your CHANGE says to use acquisition's `keepPast`. `origin/job/T51/acquisition` (J21 COMPLETE) is not in `origin/tranche/T51` yet (`merge-base --is-ancestor` says no; the tranche's last acquisition merge is a72f652b4f), so I cannot import it without merging a provider's branch into mine, which would put acquisition's files into my ownership diff.

State: R103 is built and tested green with a local helper in `capture/index.mjs` (`keepLargeFromParts` and the await-then-`keepLater` block in `uploadCapture`) that does exactly what `keepPast` does (await `putFromParts` within boundMs - 5 s - elapsed, else `keepLater`, answer `keep_pending`): `r103-t51.test.mjs` 6 of 6; capture suite 253 of 253; the session half is done as your B17 rules (J15's reading); checks clean.

Smallest thing I need: merge `job/T51/acquisition` into `tranche/T51` (mechanics §6 step on a finished provider) and tell me. Then I merge the tranche, replace the local helper by `keepPast(this, ev, {sha, parts, boundMs, elapsedMs, keepLater})` (about 25 lines out, 6 in), re-run the suites and checks, and post COMPLETE. If you would rather keep the local helper (one more copy of 20 lines, same behaviour), say so and I post COMPLETE now.

## J17 · COMPLETE

COMPLETE for entry 4 (F2, F5; R103). Commit on job/T51/capture (tranche/T51 merged, acquisition included).

**Root cause (F2).** `capture/index.mjs` `uploadCapture` called `keepWhole`, which returns `kept: false` at once past `MULTIPART_KEEP_MAX`; the `keepLater` arm existed only in `acquire`. **F5, capture's part:** `saveCaptureSession` and `loadCaptureSession` deleted every row past its `expires`, so owed resume state died by the clock. **Why tests missed it:** R86's tests used files of 12 MB or less; R22's test pinned expiry as `found: false`, and R74's writer list counted `loadCaptureSession` only because it pruned.

**Changed.** `uploadCapture` (args `boundMs`, `keepLater` added): past 32 MiB it calls acquisition's `keepPast(this, ev, {sha, parts, boundMs, elapsedMs, keepLater})` (one copy, K4164); the answer carries `keep_pending: true` when the plane took the keep, on all three success shapes (new, existed with document, second sighting). The upload is filed in its parts either way, never refused for the keep. Sessions: no pruning in save or load; `loadCaptureSession` answers `expired` beside `found`; `dropCaptureSession` alone removes a row; `liveCaptureSessions` unchanged (B17).

**Failing-first** (`test/m/capture/r103-t51.test.mjs`, 6 tests; seen red before the code: 5 of 6 failed, whole not held, no keepLater, no `expired`; green after): 40 MiB five-part upload through the real record-core `putFromParts` on a multipart bucket: whole held under its digest, nothing owed; keep not ending in the bound: `keep_pending`, plane handed `{sha, parts}` in order, then the real `putFromParts` the alarm runs holds the whole; controls (refusing or throwing store, no store call, no hand-off, 20 MiB and one-part unchanged, second press shares one store call); session survives past its hour, `expired: true`, not live, dropped only by drop. Updated two pinned tests (services.test.mjs R22 and R74's writer list) as B17 rules. Seam: control-plane R123 and plane R77 own the whole door and alarm path; they read `keep_pending` from this answer.

**Platform (L: Miniflare/workerd, R2 emulation, real record-core `putFromParts`; local workerd does not enforce the 128 MB limit, memory held is one 8 MiB part):** 40 MiB keep 1.4 s, 100 MiB 3.6 s, 256 MiB 9.2 s, whole held each time; inside the 25 s bound.

**Tests and checks.** capture + cap13-reuse-pages + d57selflink: 253 of 253. Users: acquisition 217 of 217, control-plane 369 of 369, machinery-producers 35 of 35, queue 210 of 210 (before the merge); plane 296 of 297, the failure is plane R24's words test (a module I did not touch). format 0 failures; architecture 0; coverage capture 56 of 56; ownership 4 files, 0 failures; checks/run.mjs: capture clean, words 0 findings (I added no sentence).

**Decisions of mine, for BOB to record.** R-OLD: sessions already pruned are lost, none repairs: new data only. acquisition must call `dropCaptureSession` when its owed work ends (B16 told it; its J21 does).

**Proposed requirement lines (BOB writes them).**
- R103 (met): as written; add: "`uploadCapture` takes optional `boundMs` and `keepLater`; the answer carries `keep_pending: true` when the keep was handed to the plane."
- R22: "A session holds a walk's resume state, owed work, until dropped; the clock never removes it. Load answers `found: false` for an unknown session; for one past its expiry `found: true` and `expired: true` with its state; drop removes it."
- R46: "`liveCaptureSessions(now)` answers every session whose expiry is after `now`" (unchanged), noting an expired session is held but not live.
- R74: the writers list no longer includes `loadCaptureSession` (it writes nothing).

Size (session_01N9N3ozsPf3Ekjw63cL8GAe): test runs 12, module lines 3282

## J18 · QUESTION

QUESTION (CAPTURE #47, T51, entry E13). Best reading below; I carry on with it unless you answer otherwise.

The code at tranche head already asks the evidence store one `head` per DISTINCT digest, `HELD_PAGE_LANES` (8) at a time (`#wholeOf`, capture/index.mjs:1594), and the examinations/groupings in lanes (`#pageAnswers`). So today a 27-row full read makes 27 heads only because the 27 digests are distinct. The only way to cut the heads is the plan's second half: answer `whole` from the size the register recorded at keeping.

Two existing tests assert the OLD rule for the full row, so E13 cannot land with them unchanged: fix3b-t51 R77 C14 (the full list "asks the store once for each document", and its control that INFO-A2, register size past the keep bound but a whole object held, reads `whole: true`) and fix2-t51 R77 C10 (heads counted for the full list). R77 (requirements) also says the full row asks the store.

My reading of the rule (differs from the START in one respect, to keep the A2 control true):
- register size recorded and <= MULTIPART_KEEP_MAX (32 MiB): `whole: true`, no head.
- size past MULTIPART_KEEP_MAX, or no size recorded: one `head` per distinct digest, as today (R103's `keepPast` can hold a whole object past the bound, so the size alone cannot say false; a store that holds it must still read true).
- lanes of 8 and the page's wait unchanged; rows in page order; answer unchanged byte for byte for a store consistent with its register (a recorded golden, made on the unchanged code, is my test).
The START said "head only when it holds no size"; reading size > bound as false would turn INFO-A2's control (object held, size says parts) false and break the vouch/OCR box for a kept-past-32 MiB capture.

Need from you: (1) OK to rule as above, (2) OK for me to edit the two tests' assertions that state the old rule (fix3b-t51 lines ~84-90 and ~120-122; fix2-t51 ~377-379), keeping their other assertions, since they would otherwise fail by design. Until answered I write the new failing-first test and the golden and leave those two tests untouched and red-by-design after the change.

## J19 · BLOCKED

BLOCKED (cause: a provider not merged, not tests, not Bob, not context). E13 is done and pushed at b11f86b114 on job/T51/capture; E5's code half cannot be written until acquisition's `textTypeOf` is on `tranche/T51`.

**The smallest thing I need:** acquisition (merge 2) merged into `tranche/T51` with `textTypeOf({bytes, type, name})` exported, and a RESUME from you. Origin/tranche/T51 has no `textTypeOf` today (`git grep` over bio-plane/src, checked at d0d7f9b920), and job/T51/acquisition carries none. Then I replace capture/index.mjs:757-768 (the `named`/`readAs`/`profilesAsText`/UTF-8 test) and `UPLOAD_NAME_TYPES` (:109) with the one call, the `e5-t51` test goes green, and I post COMPLETE. I need nothing else.

**E13 (done).**
- Root cause (file:line at the tranche head): `heldCaptures` (capture/index.mjs:1454) asked the evidence store one `head` per distinct digest (`#wholeOf` :1594, 8 lanes) for every full row, including the register's size which it held but used only for the picker (`#wholeBySize` :1584). With 27 distinct documents that is 27 heads. The rest of the plan's list was already in place at the tranche head (batched `#pageFacts`, one grade batch, lanes of 8 in `#pageAnswers` and `#wholeOf`, results in page order); the heads were the remaining per-row cost.
- Change (your B20 ruling): :1519-1535 and new `#keptWholeBySize` :1600. A full row answers `whole: true` with no head for a capture the register records as held in one part (size recorded, <= 8 MiB, `UPLOAD_PART`); every other row (no size, or a capture held in parts) is asked of the store once per distinct digest, in lanes of 8, as before; with no evidence store, null as before. The register records no "whole kept" fact (its columns are capture_sha, bundle_id, path, encoding, bytes, registered), so a capture in parts is always asked.
- Why the tests missed it: nothing counted heads or concurrency per page; `p10-t51` counted the set of keys touched, never calls. Gap fix: `e13-t51.test.mjs`.
- Failing-first (`bio-plane/test/m/capture/e13-t51.test.mjs`), through `heldCaptures` (the op's own method), seen red at b2435f2e47 on the unchanged code, green at b11f86b114: (1) 27 documents of recorded one-part size: 27 heads before, 0 after (assert 0); (2) a mix of 6 small, one at exactly 8 MiB, 3 in parts with a whole held, one in parts with the keep owed (no whole object: `whole: false`), 14 unsized, 4 and one past 32 MiB (held and not): heads are exactly the unsized, in-parts and past-bound digests, none twice, peak in flight > 1 and <= 8, `whole` true/false as the store says; (3) rows in the page's order with the store answering out of order; (4) the answer byte for byte against `e13-golden.json`, recorded by running the test on the unchanged code (E13_WRITE_GOLDEN=1, tranche head fa28f1ee12 for src), never by hand.
- Tests edited under your B20 (2): `fix3b-t51` (the list's heads 3 -> 1, a full list's 2 stays with its sentence; INFO-A2 control kept: past-the-bound, whole held, reads true) and `fix2-t51` (wholeWorld records INFO-1 as one part, INFO-2 in parts, INFO-3 unsized; heads 2; a failing head reads null for the two it is asked of and the unsized, INFO-1 true). Their other assertions are unchanged.
- Measurement (local, no deploy): `heldCaptures`, 27 rows, limit 500, evidence store 40 ms per head: before 27 heads, 168 ms; after 0 heads, 13 ms. With the production store's per-head latency the saving is that latency times ceil(27/8) rounds for a screen of one-part documents; documents in parts keep their head. PERFORMANCE re-times Held on the copy.
- R-OLD: nothing stored changes (a read only).

**E5, capture's half, written first and red by name:** `e5-t51.test.mjs` (R92 R93 E5): fails at "acquisition exports textTypeOf ... (merge 2)"; once it exists it compares, for 13 cases (declared text types, .txt/.md/.csv names in two cases, empty type, .bin, no name, a declared non-text type beating a .md name, NUL and non-UTF-8 bytes), the upload's `profiled_from_text` with the rule's answer. It assumes `textTypeOf` answers the text type as a non-empty string when the bytes are text and null/empty otherwise; tell acquisition's job if it answers another shape and I adapt the test.

**Suites and checks (the unchanged state of E5 aside).** capture + cap13-reuse-pages + d57selflink: 258 tests, 257 pass, 1 fail (the E5 test, red by name), 0 skipped. Users: the 71 test files outside capture that read `heldcaptures` (instance-setup, capture-requests, ratification, op-declarations, affordances, wizard-scripts, screens-intake/-inquiry/-daily/-settings/-action, ...): 937 tests, 0 fail, 0 skipped (`impact.mjs tranche/T51 HEAD` names 98 modules / 1498 test files through the import graph; none of the others read the row's `whole`; I did not run all 1498). `checks/run.mjs`: format 0, architecture 0, coverage 6605 of 6605 ids named, channels 0, words 0 failures (dev 268, unkeyed 1982; I added no string a member reads). `checks/ownership.mjs capture tranche/T51 job/T51/capture`: 7 files, 0 failures.

**Requirement lines I propose (BOB writes them):**
- R77, replacing "a page asks the store once per distinct fingerprint, nothing for an empty page" and "the full held row (not the picker's) ... a full row asks the store": *(fix round 5; E13; K4530, B20)* Each full row answers `whole: true` without asking the evidence store when the register records the capture's size as held in one part (at most 8 MiB, `acquisition` R10's part); every other row (no size recorded, or a capture held in parts, whose whole object may be owed) is asked of the store once for each distinct fingerprint, `HELD_PAGE_LANES` at a time, and answers true, false or null as before; the answer is otherwise unchanged. Test: `e13-t51.test.mjs`.
- Test line for R91: the page's store reads overlap in lanes of `HELD_PAGE_LANES` and a page of one-part documents makes none (`e13-t51.test.mjs`).

Size (session_01VM4D7r3cUFZacyS8LqnGx2): test runs 7 (capture suite 4, users 71 files once, checks 2), module lines 4196 (src/capture)

## J20 · COMPLETE

COMPLETE, CAPTURE #47, T51: E13 and E5 (capture's half). Pushed at 0e79647ee7 on job/T51/capture, tranche/T51 merged (acquisition's textTypeOf, K4537).

**Changed**
- E13 (b11f86b114): capture/index.mjs:1519-1535 and new `#keptWholeBySize` :1600. A full held row answers `whole: true` with no evidence-store `head` when the register records the capture as held in one part (size recorded, at most 8 MiB); a capture held in parts, or with no size recorded, is asked of the store once per distinct digest, 8 at a time, as before. No evidence store: null, as before. Read only; no stored data changes (R-OLD).
- E5 (0e79647ee7): the upload (`uploadCapture`, ~:757) calls acquisition's `textTypeOf({bytes, type, name})` on the stored single-part bytes; capture's own copy of the rule (`UPLOAD_NAME_TYPES`, the `named`/`readAs`/`profilesAsText`/UTF-8 test) and the `profilesAsText` import are removed. The recorded declaration (`source_content_type`, `declared_by`) is unchanged. The upload tests R92 and R93 pass unchanged.

**Failing-first, red then green**
- `e13-t51.test.mjs` (4 tests): red at b2435f2e47 on the unchanged code (27 heads where 0; heads for sized one-part documents), green at b11f86b114. The byte-for-byte test compares the answer with `e13-golden.json`, recorded by running on the unchanged code (E13_WRITE_GOLDEN=1), never by hand.
- `e5-t51.test.mjs` (R92 R93 E5, 13 cases against acquisition's rule): red by name until acquisition merged ("acquisition exports textTypeOf"), green at 0e79647ee7.
- Tests edited under B20 (2): `fix3b-t51` and `fix2-t51`, only their assertions stating the old full-row rule; their other assertions and the INFO-A2 control are kept.

**Measurement (local, no deploy):** `heldCaptures`, 27 documents, limit 500, store 40 ms per head: before 27 heads, 168 ms; after 0 heads, 13 ms. Lanes of 8 and the page's wait are unchanged; the mixed case peaks at more than 1 and at most 8 heads in flight.

**Suites and checks**
- capture + cap13-reuse-pages + d57selflink: 258 tests, 258 pass, 0 fail, 0 skipped.
- Users: the 71 files outside capture that read `heldcaptures`: 937 tests, 0 fail (run before E5); the 30 files outside capture that call `uploadCapture` or `captureupload`: 338 tests, 320 pass, 18 fail, all in `journey-check/walker.test.mjs`, which stops at "playwright-core cannot be loaded (run `npm ci` in bio-plane/src/journey-check)": that directory has no node_modules in my checkout, not a result of this change. 29 of the 30 files pass with 0 fail. `impact.mjs tranche/T51 HEAD` names 98 modules; I ran the readers of the changed row and the callers of the upload, not all 1498 files.
- `checks/run.mjs`: format 0, architecture 0, coverage 6610 of 6610 ids named, channels 0, words 0 failures (dev 268, unkeyed 1982, no string added). `checks/ownership.mjs capture tranche/T51 job/T51/capture`: 7 files, 0 failures.

**Requirement lines I propose (BOB writes `build/requirements/`)**
- R77, in place of "a page asks the store once per distinct fingerprint" for the full row: *(fix round 5; E13; K4530, B20)* Each full row answers `whole: true` without asking the evidence store when the register records the capture's size as held in one part (at most 8 MiB, `acquisition` R10's part); every other row (no size recorded, or a capture held in parts, whose whole object may be owed) is asked of the store once for each distinct fingerprint, `HELD_PAGE_LANES` at a time, and answers true, false or null as before; the answer is otherwise unchanged. Test: `e13-t51.test.mjs`.
- R91 test line: the page's store reads overlap in lanes of `HELD_PAGE_LANES`; a page of one-part documents makes none (`e13-t51.test.mjs`).
- R92/R93: add "the rule is `acquisition`'s `textTypeOf` (its R102), the one code the upload and the knock's pull share; this module keeps no copy. Test: `e5-t51.test.mjs`."
- Uses, Private: `acquisition` gains `textTypeOf` (R92, R93) and drops nothing else.

Deferred: none. Words owed: none (no new sentence). Size (session_01VM4D7r3cUFZacyS8LqnGx2): test runs 10 (capture suite 6, users 71 files and 30 files once each, checks 2), module lines 4189 (src/capture)

## J21 · REPORT

REPORT (CAPTURE #48, T51, fix round 6): the names of what capture publishes for G2, so control-plane and notice-producers can build against them now (BOB: please pass them on; capture will not change them).

- `captureOf(ctx).recordFetchDone({session, document, opener, project, at})` -> `{recorded: true|false}`. One row per session (a second call for the same session records nothing and answers `recorded: false`); `session` and `document` non-blank strings, `opener` a member's stamp (`member:<id>`; a blank or machine one records nothing), `project` a string or null, `at` a whole-second UTC instant (this instance's clock when absent). Never throws. Table `fetch_done`. The caller is control-plane's delivery of a finished fetch, in process.
- `captureOf(ctx).fetchesDone({after, limit})` -> `{ok: true, fetches: [{session, document, opener, project, at, cursor}], limit, truncated, next}`, oldest first by (`at`, `session`), at most `limit` (default 200, clamped 1..1000), `after` the `cursor` of an earlier row (as `taskEvents`); in process, no viewer (notice-producers sends to `opener` only). Never throws.
- Assumed from acquisition (not yet merged): `notArchivesAmong(store, shas)` returns a Set of the digests acquisition has recorded as not archives, like `openedAmong`. If acquisition names it otherwise, tell me.
- `openCaptures` stays acquisition's: capture passes its answer through unchanged, so a session with `fetch_pending` is listed as acquisition lists it.

## Fix round 6 · CAPTURE #48 (B22)

**Done** (commit e65bc0f3cd on `job/T51/capture`; `tranche/T51` merged).
- **G6 (index.mjs `#pageFacts`)**: the row's `capture` is the document's whole. The register read orders `whole` rows first (provenance R72) when the column exists, and a capture that the document's own register document states as a part of a whole is replaced by that whole with its size; so `capture.sha256`, `bytes`, `actor`, `retrieved`, `grade` and `format` are the whole's. New data and data provenance's wake repair covers; a legacy bundle with no `parts` in its register document and no whole row cannot be told apart (R-OLD).
- **G12d**: `#keptWholeBySize` is never true for a whole row or a stated part; a 40 MB row's `whole` is the store's answer under the whole's digest.
- **G12a**: parts are never asked of the archive listing; digests in acquisition's `notArchivesAmong(store, shas)` (a Set) are dropped from the grouping; the picker row gains `format`. The call is guarded (`import * as acquisitionApi`), so until acquisition merges nothing is dropped.
- **G2**: table `fetch_done`, `recordFetchDone`, `fetchesDone` (names posted as J21); `heldAt` check reads no body past 8 MiB (`HELD_AT_CHECK_MAX`): a declared length over it is not read at all, an undeclared one stops at it; the answer is `changed.state: "undetermined"` with `large: true` and `held` unchanged (I read "answers not held" as "not compared"). `openCaptures` stays acquisition's, passed through.
- **G5**: `captureOp` relays a reader's deferral unchanged and answers a throwing or empty reading as 200 with the kept document, `reading_pending`, `sha` and `diag`, one `console.error`.

**Failing first, red then green**: `r6-t51.test.mjs` (9 tests): red at the unchanged code (the whole not the part; `whole` from the store; no `recordFetchDone`; 100 MiB pulled; the throw reaching the door), green after. The G12a store-call test is red by name ("acquisition exports notArchivesAmong") until acquisition merges. Four old assertions of the picker's key set (fix2-t51, fix3-t51 x2, fix3b-t51) edited to state the new `format` field.

**Proposed requirement lines** (BOB writes): R77 amend (the row's `capture` is the document's whole: register `whole` row first, else the whole its register document states; picker row also `format`; `whole` never from a part's size); R104 new (`recordFetchDone`/`fetchesDone`, table `fetch_done`); R105 new (`heldAt` check reads at most 8 MiB, `large: true`); R73 amend (a reading that fails after a kept acquire is a 200 deferral with `diag`). Word owed: none (diagnostics are identifiers).

**Suites and checks**: capture + cap13 + d57: 266 tests, 265 pass, 1 fail (the by-name red). Users of the held rows and the act (83 files): 1050 tests, 0 fail. `checks/run.mjs`: architecture 0, coverage 6617/6617, words 0 (count unchanged), format 1 failure that is `build/plan/next.md:38` (BOB's). Ownership run before the commit.

Size (session_01DvJ1NBRub48BYu8NPSwTbT): test runs 7, module lines 4390

## J22 · COMPLETE

COMPLETE, CAPTURE #48, T51 fix round 6 (G2, G4, G5-relay, G6, G12a, G12d). Pushed on job/T51/capture; the record's "Fix round 6" section has file-level detail, the red-then-green tests (r6-t51.test.mjs), suites and the proposed lines.

Smallest thing I need: one CHANGE from you when acquisition's `notArchivesAmong(store, shas)` (a Set of digests it holds as no archive) is merged into tranche/T51. My code calls it guarded and my test "R77 R91 G12a ... acquisition exports notArchivesAmong" is red by name until then; on your CHANGE I merge, make it green and swap the guard for a named import.

Rulings of mine for you to record: "answers not held, large: true" for heldAt check is read as `changed.state: undetermined` + `large: true` (held stays true); the row's capture is the register `whole` row, else the whole the register document states; fetch_done API as posted in J21 (recordFetchDone, fetchesDone). Proposed requirement lines are in the record: R77, R73 amended; R104, R105 new.
Checks: architecture 0, coverage 0, words 0, ownership 0; format has one failure at build/plan/next.md:38 (yours). Users of the held rows: 83 files, 1050 tests, 0 fail.

### Fix round 6, after B24 (CHANGE)
`tranche/T51` merged (acquisition's `notArchivesAmong`). The guard is now a named import (`index.mjs` import line, `#pageFacts`). The G12a test "acquisition exports notArchivesAmong" is green: 20 null-format captures drawn twice, the second draw makes 0 `archiveList` calls and 0 store calls; mutation check: with the filter removed that test is red. `acquire`'s declaration now accepts `project` (index.mjs DECLARED_OPS, never required); test in `declared-ops.test.mjs` (R97). One old assertion in `t49.test.mjs` stated that a capture whose listing once failed to answer is always asked again; acquisition now remembers a decided non-archive, so it is edited to the new rule.
Suites: capture + cap13 + d57 267/267. Users of the held rows and the act (83 files): 1061 tests, 1 fail, `control-plane/t51-visitor-copy.test.mjs` (E8), which fails identically on `origin/tranche/T51` without my commits (TypeError reading `capture` of undefined; control-plane's). Checks: format 0, architecture 0, coverage 6623/6623, words 0 (count unchanged).
Size (session_01DvJ1NBRub48BYu8NPSwTbT): test runs 12, module lines 4390

## J23 · COMPLETE

COMPLETE (CAPTURE #48, B24): tranche/T51 merged; notArchivesAmong is a named import and the G12a test is green (mutation-checked); acquire declares and accepts `project` (test in declared-ops). Capture suite 267/267; format, architecture, coverage, words 0. One user failure, control-plane/t51-visitor-copy.test.mjs (E8), fails identically on tranche/T51 without my commits (control-plane). One old assertion in t49.test.mjs edited to the new rule (a decided non-archive is not asked again). Details in my record.

## J24 · QUESTION

QUESTION (G32; my best reading follows; I carry on with G27 meanwhile).

Acquisition reads the held digest only from `opts.captureRequest.heldSha` (acquisition/index.mjs:972), the in-process drain's arm. That arm also takes the address, purpose, agent and credential from the row, deletes `body.render`, forbids parking (`mayPark` needs `!captureRequest`) and lets the daemon class through the R1 fence (:903). So capture's door `acquire` cannot hand it a member's request without changing all of that; I will not fake a captureRequest.

Smallest thing I need: acquisition accepts a plain option `opts.heldSha` (64 hex, ignored otherwise), honoured for any caller exactly as `crHeldSha` is today (validators from `cap.validatorsOf({addressNorm, captureSha})`, not with render), the 304 answer unchanged. Then capture's `acquire` arm (index.mjs:3272, `heldAt` read of the address, the viewer-independent newest direct plain capture) passes `heldSha` and everything else stays.

If you would rather keep acquisition untouched, the alternative inside capture alone is a conditional governed look of my own before calling `acquire` (a second request when the source changed; the 304 answer composed here), which duplicates acquisition's R22. I recommend the one-line option in acquisition.

Until you answer I build the capture side against `opts.heldSha` and its test red by name; G27 is independent and is built now.

## J25 · COMPLETE

COMPLETE, CAPTURE #49, T51 fix round 6, wave 3: G27 (done) and G32 (capture side done; its through-the-door test is red by name until ACQUISITION #29's `opts.heldSha` merges, as B26 says; I then expect a CHANGE). Pushed on job/T51/capture. tranche/T51 merged first.

## G27 · the door's read after a kept acquire (R73)
1. Root cause: `captureOp` made one stub `at = store()` and used it for the acquire and for the read after it (`ops.mjs`, the old :196-206), so a read that came back unanswered after the object was reset was never made on a stub that could answer, and acquisition's `reading_pending` deferral (R87) was the only outcome. Cloudflare: do not reuse a stub after it throws; `retryable`/`overloaded` say what may be retried. The reader (`acquireReadingOp`, extraction) already turns a thrown call into `{body: {..., reading_pending: true, diag}}`, so the door sees a failed read as a body with `diag`, a thrown `readAcquired`, or an empty answer.
2. Change (`bio-plane/src/capture/ops.mjs`, `captureOp` acquire arm, plus two helpers `readFailed` and `readOverloaded`): a failed read (thrown, empty or `reading_pending` with a `diag`) is made once more on a fresh stub (`store()`), unless overloaded (`.overloaded`, a `diag.overloaded`, or the platform's words "overloaded" in the message); a second failure is the existing deferral with the last attempt's `diag`; a deferral the reader chose itself (no `diag`) and the store's own refusal are not retried.
3. Why the tests missed it: stubs that never fail on a second call, tiny replies, no memory limit in local workerd. Gap fixed: `g27-t51.test.mjs` drives the door's own entry (`captureOp("acquire")`) with stubs that fail as a reset object's does (a rejected fetch with `remote: true`; a reply that is no envelope), a reader written to extraction's `acquireReadingOp` contract (`reader.mjs`; capture cannot import extraction, the architecture check refuses it) and counts `store()` calls.
4. Failing-first, seen red then green (the file, run before the change): 4 of 6 failed (first-read-throws-remote: got `reading_pending` + diag, wanted the document read; no-envelope reply: same; both-fail: `store()` count 1 not 2; a throwing `readAcquired`: not retried). After: 6 of 6. The controls that held before and after: overloaded is not retried (`store()` once, deferral answered), a read that answers is not retried, a deferral the door chose itself is relayed without a second read.
5. Platform check (L): `g27-reset.probe.mjs` (committed, a probe, not a test), real workerd under Miniflare with a SQLite Durable Object that aborts itself (`ctx.abort`, the reset a memory limit causes) on its first `extractread`: `{"status":200,"read":{"read":true},"reading_pending":false,"stubs_made":2,"same_stub_after_reset_answers":true}`. So the retry on a fresh stub reads the document after a real object reset. Honest limit: local workerd enforces no memory limit (diagnosis-R6-G4.md), so the reset is made by `ctx.abort`, and the same stub also answers locally after it; the "broken stub" Cloudflare describes is not reproduced here. **P at the re-walk: dena, read `diag`** (a failure that persists after the retry still answers `reading_pending` with the second attempt's `diag`).
6. Not done, not mine: the acquisition half of G27 (the renderer's reply not held resident while the request continues) is acquisition's. Found in extraction (P9), for BOB: `deferralDiag` (`extraction/ops.mjs`) keeps only `name`, `message`, `status`; adding the error's `overloaded` and `remote` booleans to `diag` would let me read the flag instead of the platform's words (I honour `diag.overloaded === true` already).

## G32 · a held file is downloaded again (R106 proposed)
1. Root cause: acquisition reads the held digest only from `opts.captureRequest.heldSha` (acquisition/index.mjs:972), the in-process drain's arm, so a member's or a bearer's `op=acquire` of a held address is never conditional (`crHeldSha`, :1137) and pulls the body again.
2. Change: `ops.mjs` `acquireOp` forwards the caller's sight (`viewer`, from `captureOp`'s `h.viewer`; none handed sees nothing) in the query to the store; `index.mjs` the `acquire` route asks the new `Capture.heldCopyToCompare(body, viewer)` and, when it answers a digest, passes `opts.heldSha` to `acquire`. `heldCopyToCompare` (a read, never a fetch, never throws): the newest capture of `body.locator` the viewer may see (R96's compared copy), only when it came from a plain, direct fetch of that very address (receipt `via: direct`, plain address) and the register document says it was captured and not rendered; never for a body with `render`, `via`, `continue`, `file`, `subresources` or `address`, for an address that is no public https locator, or when the viewer sees no copy (an unseen copy is never named: the 304 answer carries the digest).
3. Why the tests missed it: instant fixtures, no counter of the bytes pulled. Gap fixed: `g32-t51.test.mjs` pulls a 1 MiB document through a throttled stream with an ETag, counts the bytes pulled and the requests that carried `if-none-match`, and builds the register from the first real acquire's own document.
4. Tests: (a) the arm hands the digest, under a member's session and under an admin bearer: green; (b) controls for each case above: green; (c) the second acquire pulls no body, answers `existed: true, unchanged: true, capture.sha256` of the held copy, under a member's session and under the admin bearer, the one second request carrying the ETag: **red by name** (`TypeError ... reading 'sha256'`: the answer is a full capture, the body was pulled again); with a throwaway local patch of acquisition (`opts.heldSha` read as `crHeldSha`, reverted, not committed) all four tests pass, so the test is red for that cause only; (d) a changed source (new ETag) is fetched and filed as before, and a held copy whose source sent no validator is fetched unconditionally. Platform check: L is this fixture's counted stream; **P**: one `curl -I` of the nps.gov file after the deploy (BOB's, read-only).
5. "A member asking for a new copy still gets one": only when no validators were recorded or the source changed; an unchanged source with validators answers `unchanged`, as the drain's requests do (acquisition R22).

## Requirement lines proposed (BOB writes `build/requirements/capture.md`)
- R73 (amend): "(T51 fix round 6, G27) A read after a kept acquire that fails (the call threw, answered nothing, or the reader reported it unanswered with a `diag`) is made once more on a fresh stub of the object, never when the object is overloaded (the error's or `diag`'s `overloaded`, or the platform's words for it); a second failure is the deferral (`reading_pending`, `sha`, `diag` of the last attempt); a deferral the reader chose itself and the store's own refusal are not retried. Test: `g27-t51.test.mjs`."
- R106 (new): "(fix round 6, G32; `acquisition` R22) A fetch of an address the record already holds from a plain fetch is conditional on that copy. `op=acquire` hands `acquisition` the digest (`opts.heldSha`) of the newest capture of `locator` the caller's viewer may see, when it came from a direct, plain fetch of that address, recorded as fetched and not rendered; a body asking for more than the plain document (`render`, `via`, `continue`, `file`, `subresources`, `address`), an address that is no public locator, a viewer who sees no copy, or a copy with no validators recorded fetches as before. `heldCopyToCompare(body, viewer)` answers the digest or null; a read, never throws. Test: `g32-t51.test.mjs`."
- R73's Provides line for `op=acquire` may add: the query carries the caller's `viewer`.

## Rulings of mine, for you to record (P17; none needs Bob)
- Overloaded is read from `.overloaded` on a thrown error, `diag.overloaded`, or /overloaded/i in the message (extraction's `diag` carries no flag today).
- The retry belongs to the door's read only; the acquire call itself is never retried (not idempotent).
- Pass the viewer to the store as a query parameter, as `links` and the reads do, never in the body.

## Tests and checks
- `node --test --test-force-exit bio-plane/test/m/capture/ bio-plane/test/cap13-reuse-pages.test.mjs bio-plane/test/d57selflink.test.mjs`: 277 tests, 276 pass, 1 fail (g32 (c), red by name). `timings.test.mjs` stand-in gained `heldCopyToCompare` (the route now asks it).
- Users (`impact.mjs` names 111 modules through the shared `DECLARED_OPS` table; I ran the 47 files of plane, control-plane, extraction and capture-requests that name `acquire`): 372 tests, 368 pass, 4 fail, the same four (E3 41.5 MB five-part, R117 C5b, R120/R121, R125 (b)) that fail identically on `tranche/T51` without my commits (checked in a worktree of the tranche: 5 fail there).
- `checks/run.mjs`: format 0, architecture 0, coverage 0 (58 of 58 for capture), words 0 failures, `unkeyed` untouched (no new sentence a member reads). `checks/ownership.mjs /home/user/bio capture tranche/T51 job/T51/capture`: 0 failures.

Size (session_01Uu76H7JzhRxSdMcBjFLc6j): test runs 14, module lines 4340

## J26 · COMPLETE

COMPLETE (CAPTURE #49, B27 CHANGE applied; J25 stands, this adds one item). Pushed on job/T51/capture; tranche/T51 merged (BOB #255's plan).

**G27, B27: an acquire whose render is pending is not read inline.** `capture/ops.mjs` `captureOp`, acquire arm: when the acquire's answer carries `render.state === "pending"` (acquisition/index.mjs:1747, the kept shell with the render running on in the object) the inline `readAcquired` and its retry are skipped, and the kept capture is answered 200 with `reading_pending: true`, `sha` and the acquire's own `render` and note, with no `diag` and no log (a deferral by choice, as the door's `deferReading` answer is; the door owes the reading to the ledger from `reading_pending` as for any deferral). `owed`, `waiting`, `deferred` and no `render` are read inline as before.
- Failing-first, seen red then green (`g27-t51.test.mjs`, two new tests): red before the change (the pending-render answer was read, `reads` 1 not 0, and carried no `reading_pending`); green after: `reads` 0 and `store()` once (no second stub), `reading_pending`, `sha`, `render` as given, `diag` undefined; control: `render` null, `owed`, `waiting`, `deferred` each read once and answered with the reading.
- Requirement line proposed (extends the R73 line of J25): "(G27, B27) An acquire whose answer says its render is pending (`render.state` `pending`) is not read inline: it is answered at once as `reading_pending` with the digest and the render as given, no `diag`; any other render state is read as before. Test: `g27-t51.test.mjs`."
- Platform: the probe of J25 is unchanged; the pending case needs no object (no read is made); acquisition's half (the deferred run's reply not held resident) is ACQUISITION #29's.

Tests and checks after this change: capture + cap13 + d57: 279 tests, 278 pass, 1 fail (the G32 test, red by name until acquisition's `opts.heldSha` merges). Users (the 47 files of plane, control-plane, extraction, capture-requests naming `acquire`): 372 tests, 368 pass, the same 4 failures as before and on `tranche/T51` without my commits (E3 41.5 MB, R117 C5b, R120/R121, R125 (b)). `checks/run.mjs`: format, architecture, coverage (58 of 58 for capture), words 0 failures. `checks/ownership.mjs`: 8 files, 0 failures.

Size (session_01Uu76H7JzhRxSdMcBjFLc6j): test runs 17, module lines 4345

## G41b · a multipart upload is profiled from its declared type or name (R107 proposed; B28)

1. Root cause (as the START says, confirmed): `uploadCapture` computed `ct` only `if (!multipart)`, so a file over one 8 MiB part reached `profileOf` with `ct` null; a CSV has no magic, so its format was `undetermined` although the upload declared `text/csv` (or was named `x.csv`).
2. Acquisition is not an owner: read `profileOf` (acquisition/index.mjs:1857-1900) and `detectFormat` (formats.mjs:115): for a multipart, `profileOf` already calls `detectFormat(head, ct || null)` (:1887), so a given `ct` is honoured (pass 1, the bytes' signature, outranks it; pass 2 uses `ct`). Nothing in acquisition changes; R102's `textTypeOf` is used as it is.
3. Change (`bio-plane/src/capture/index.mjs`): the stream keeps the file's first `UPLOAD_HEAD` (64 KiB, chosen, not measured; a protective bound for BOB's K1881 report) bytes as they arrive; for a multipart upload `ct = textTypeOf({bytes: withoutCutCodePoint(head), type, name})` (the same rule, over the head, less a UTF-8 code point cut at its end); `profileOf` then judges the format from the first part's sniff, and from `ct` where the sniff names none. `source_content_type` and `declared_by` are recorded as for one part (a declared type as the uploader's declaration; a name gives `ct` only, `source_content_type` null).
4. Failing-first, seen red then green: `g41b-t51.test.mjs` (real `uploadCapture`, 9 MiB and 17 MiB files in 2 and 3 real parts, no stub): a 9 MiB CSV declared `text/csv` is `csv` (red: `undetermined`); a 17 MiB `x.csv` with no type is `csv`; text with multi-byte characters whose head ends inside a character is `csv` (red without the trim, shown by disabling it). Controls (held before and after): the one-part CSV byte for byte as before; non-text bytes (a NUL) declared `text/csv` stay `undetermined`, the declaration recorded; non-text bytes declared `text/html` are not `html`; a PDF-magic file declared `text/csv` is `pdf`; a multipart PDF with no type is `pdf` (R101); a declared non-text type is not overridden by a `.csv` name; neither type nor text name: `undetermined`.
5. Platform check **L** (`g41b-plane.test.mjs`, real workerd under Miniflare, real DO SQLite and R2, `op=captureupload` through the door with a member session): a 9 MB CSV in two parts is `csv` declared `text/csv` and `csv` named `x.csv`, and `undetermined` with neither; red before the change (the first assertion), green after. **P** rides G41's re-walk (a 9 MB CSV uploaded by a member).
6. My reading of one control, for BOB to confirm or correct: "a multipart upload declared `text/html` whose bytes are not HTML is not profiled `html`" is tested with bytes that are not text. A file whose bytes ARE text and declared `text/html` is profiled `html` on a multipart as on one part (R92: the declaration settles a text file the bytes' signature does not name; one part does so today, checked), so the two cases agree.
7. R-OLD: new uploads only. No op's accepted keys change (nothing to re-declare, K4208). No sentence a member reads is added (`unkeyed` untouched). No other module's artifact is made stale.

## Requirement lines proposed (BOB writes `build/requirements/capture.md`)
- R92 and R93 (amend): drop "within one part": "(T51 fix round 6, G41; R107) For a file held in parts the rule is applied to its first 64 KiB (less a code point cut at their end); see R107."
- R107 (new): "(T51 fix round 6, G41 follow-up; K4670; amends R92, R93, R101) **A file held in parts is profiled from its declared type or name as one part is.** `uploadCapture` of a file over one 8 MiB part judges, by `acquisition`'s `textTypeOf` (R102), the first 64 KiB of the file (`UPLOAD_HEAD`), less a UTF-8 code point cut at their end; when the head is text, the declared text type, or with none the `.txt`, `.md` or `.csv` name, is the content type `profileOf` is given, so a CSV over one part is profiled `csv`. The first part's byte signature still decides first (a PDF declared `text/csv` is `pdf`), a declaration is recorded as the uploader's and a name is not, and a head that is not text, or a declared type that is not text, leaves the profile as R101 has it. New uploads only. Test: `g41b-t51.test.mjs`; platform: `g41b-plane.test.mjs`."
- Provides: nothing else changes.

## Tests and checks (G41b)
- Own suite under the preload (capture + cap13 + d57): 284 tests, 284 pass, 0 fail (includes the 4 + 1 new).
- Users: the 47 test files outside my module that name `uploadCapture` or `captureupload`: 422 tests, 400 pass, 22 fail, none mine: `journey-check/walker` (17) failed only because its `node_modules` was missing in this container, and passes 17/17 after `npm ci` there (K4113); `affordances/t36` (4, `readheld` has no design sentence / ACT_HELP) fail identically on the unmodified tranche `capture/index.mjs` (4 fail, 10 pass), so not caused by this change; one remaining suite-level file load error was the same walker.
- `checks/run.mjs`: format 0, architecture 0, coverage 0 (6685 of 6685), words 0 failures with `unkeyed` unchanged (no sentence added). `checks/ownership.mjs /home/user/bio capture tranche/T51 job/T51/capture`: 0 failures.
- Protective bound set, for BOB to report to Bob (K1881): `UPLOAD_HEAD` = 64 KiB (the head of a file held in parts that is judged as text), chosen, not measured.
- Unkeyed, deferred, open questions: none. Reading of one control: item 6 above.

Size (session_01L1Y9FNxaoQ4v7iZDkLBJWG): test runs 9, module lines 4366

## J27 · COMPLETE

COMPLETE (CAPTURE #50, B28): G41 second cause fixed. uploadCapture keeps the file's first 64 KiB (UPLOAD_HEAD, a protective bound for K1881) and, for a multipart upload, gives profileOf the ct from acquisition's textTypeOf over that head (a cut trailing code point trimmed); acquisition unchanged (profileOf/detectFormat already honour ct for multipart). Failing-first red then green: g41b-t51.test.mjs (9 MiB csv declared text/csv; 17 MiB x.csv; multi-byte head; controls incl. PDF declared text/csv=pdf, NUL bytes, text/html non-text bytes, multipart PDF no type, one-part CSV). Platform L: g41b-plane.test.mjs through Miniflare, 9 MB CSV in two parts = csv (declared and named), undetermined with neither; red before. Suites: own 284/284; users 400/422, failures not mine (walker missing node_modules, passes 17/17 after npm ci; affordances t36 4 fail identically on unmodified tranche). checks/run: 0 failures; ownership 0. Proposed R107 plus R92/R93 amendment in my record. Reading to confirm: the text/html control is tested with non-text bytes; text bytes declared text/html are html on multipart as on one part. Size line in record.

## Fix round 7 · CAPTURE #51 (B29: G79, G78, G75, G73)

Providers' state: acquisition's G79 half (B32) had not merged when I read; I used only what is on the tranche (`keepWhole`'s `bytes`, `keepPast`, `profileOf`'s `firstPart`). Record-core `putFromParts` (existing). Users: screens-intake, control-plane, plane. Census ops: none changes its accepted keys (`heldat`, `heldcaptures`, `captureupload`, `captureseenin` take what they took); nothing to re-declare (K4208). No sentence a member reads is added (`unkeyed` untouched); the rows owed to UX-DESIGN: none.

### G79 · uploads: no read-back, the large keep handed over at once (`capture/index.mjs` uploadCapture :700-780)
1. Cause (as the plan, confirmed): `keepWhole(ev, {sha, parts, total})` was called with no `bytes`, so every stored part was read back, hashed again and the whole put; past `MULTIPART_KEEP_MAX` `keepPast` was awaited within the bound. One more read-back the plan did not name: `profileOf` read the first part's head by a ranged `get` although the stream held it.
2. Change: the stream keeps each part's buffer while the file can still be kept whole here (`partBytes`, up to `MULTIPART_KEEP_MAX`, dropped past it) and hands them to `keepWhole` (`bytes`): each part put once, the whole put once, no `get`; `profileOf` is given `firstPart` (the 64 KiB head already held). Past `MULTIPART_KEEP_MAX`, when the store offers `putFromParts` and a ledger is at hand (`opts.keepLater`, else the instance's `keepLater` the plane assigns), the keep is handed to the ledger at once and the answer says `keep_pending: true`; with no ledger, or one that declines, the keep is awaited within the bound as before (R103's earlier behaviour).
3. Why the tests missed it: upload tests ran in memory with zero latency and counted bytes, never store calls. Now `r7-upload-t51.test.mjs` counts calls on a bucket that charges 400-800 ms per get/put on a clock the TEST owns (R-CLOCK).
4. Failing-first, seen red on the old code, green on the new: 24 MiB in three parts: `get` calls 4 -> 0 (puts: three parts and the whole); 17 MiB and exactly 32 MiB: gets 4 -> 0 (`1` for the ranged head); 39,867,294 B in five parts with a ledger: `putFromParts` asked by the upload 1 -> 0, ledger handed `{sha, parts}` (the old test waited out the whole bound). R103's tests (`r103-t51.test.mjs`) are re-stated for the new rule: with the ledger the keep is handed over at once; with none it is awaited (the earlier assertions, kept); a store that refuses or throws is owed to the ledger, and with no ledger nothing is claimed owed.
5. Platform check L (`r7-upload-plane.test.mjs`, the whole plane under Miniflare, real DO SQLite, R2 and alarm; the test's own clock): 24 MiB text in three parts: 2,811 ms before, 2,121 ms after, whole held when the answer comes and nothing owed; 40 MB in five parts: 4,143 ms before (kept inside the request), 2,427 ms after (`keep_pending`, the whole held after the alarm). Local R2 is memory and charges no latency, so these show the shape (the 40 MB answer no longer waits for the keep; fewer calls) and not the real-R2 figure; the plan's predicted 12 s -> 8 s at the walker's R2 is for P (R-QUIET).
6. **A consequence in another module's seam, for BOB (QUESTION J-next):** control-plane's `t51-round6-seam.test.mjs` G7 ("a 40 MB five-part upload states its size as a `final` reading ... and no row owed") is now red: the plane's keep owner (`plane/pending.mjs` :163-167) enters a `reading` row after the keep and reads it at once; the keep now ends before the screen has filed the document, so the read answers `NO_HOME` and the row stays owed one back-off (about 13 s) until the next tick finds the reading held. Before, the whole was held inside the request and no row was ever made. The reading itself is the stated one the door made; only the transient owed row (and whatever the Document screen draws for an owed row) differs.

### G78 · `heldcaptures`: an object proven held is remembered (`#wholeOf` :1712)
1. Cause (a), as the plan: every draw asked `head` for every capture held in parts. Done: the instance remembers the digests whose `head` answered positive (`#provenHeld`, emptied past `HELD_PROVEN_MAX` = 5,000, CHOSEN, a protective bound for BOB to report to Bob, K1881); a negative or unknown answer is asked again at every draw; the register is never the source. (b), why the walker saw 6.2 s, is unknown (the plan's hypothesis: a large reading tick in the same object): not reproduced here.
2. Logging that rides the deploy: each draw that asks the store writes one line `{capture: "heldcaptures", heads, head_ms, remembered}` (`console.log`). "Whether `owedwork` had a running tick" is not known to this module (the ledger is the plane's): BOB needs the plane to log it beside, if wanted.
3. Why missed: `e13-t51.test.mjs` counted heads in one draw. Failing-first (`r7-t51.test.mjs`), red on the old code (second draw 16 heads, expected 0), green now: 16 captures held in parts, second draw makes 0 `head`s and answers byte for byte as the first; a register `whole` row with no object in the store answers false at every draw and is asked every draw; a whole made since reads true at the next draw and is then remembered; an unknown answer is asked again; the picker asks nothing; the memory is bounded (5,100 captures). Old tests re-stated for the memory: `fix3b-t51` (C16, C14: the one-document read by an instance that has drawn nothing), `p10-t51` (the control read asks the 7 not proven held).
4. Platform check P: re-time `heldcaptures` with the project filter on the walker's project (R-QUIET), read the new line; L for the contention case belongs to G82.

### G75 · `heldat` names the compared copy (`copy.title`, :1478)
1. Cause: not a dropped title. The real delivery (the Add screen's own `titleOf` and `promoteDocument`, run through the plane under Miniflare in a probe, not kept in this module because architecture forbids a screen import here) stores the name: `bundles.title` and `heldcaptures`' `title` were "BUDGET.pdf" for a fetched PDF. The "Untitled capture" the walker saw is `screens-intake/capture.mjs:333-335`: the title is looked up in the project's held list (`D.held` rows by `copy.document`); a document that list does not hold (another project's, or past the list's page) has no row and draws the word. The compared copy `heldAt` answered carried no title.
2. Change: `copy` gains `title` (the document's `bundles.title`, null when blank): `{sha256, document, project, title, retrieved, actor, grade, address}` (R96 amended). The screen can draw the copy's own title, then its R54 chain, never the word (screens-intake's half, the plan's `r7-held-title.test.mjs`).
3. Failing-first: `r7-alsohere.test.mjs` (G75): the copy's title by address and by digest equals the held list's, null for a blank title. Seen red on the real plane before the change (`copy.title` undefined, the probe run for the plan's "settle which"); green after.
4. For control-plane's seam file (`t51-round7-seam`): the delivered name reaches `heldcaptures` and `heldat` (my probe, green on the inline path); the fetch-delivery path (`deliverOwedRender`, :803-807) uses the same `titleOf`/`promoteDocument` and is the seam's to run. Platform P: read `heldat` for INFO-2026-0159.

### G73 · filing a 41.5 MB held capture in another project (capture side)
Not reproduced, and the filing is right: `r7-alsohere.test.mjs` (G73) takes a capture held in five parts (the register's `whole` row beside five part rows, the parts sorting below the whole), asks `heldAt` for its digest and files it with `captureseenin`: `{ok, recorded: true, home}`, the other project's `heldcaptures` lists the document with `also_here: {home}` and `project` unchanged, the home's row has none, a repeat records nothing, a part's digest files it the same. So the module's half is green before and after, as the plan allowed. What the walker saw ("not in hers") is a P read: `op=heldcaptures&project=<hers>` for 0115. The sentence (screens-intake `capture.mjs:209`) is theirs.

### Requirement lines proposed (BOB writes `build/requirements/capture.md`)
- R103 amended: "(fix round 7, G79) The parts of a file held in parts are stored from the stream and, up to `MULTIPART_KEEP_MAX`, their buffers are put whole once: no stored part is read back, hashed again or ranged for its head. Past it, when the evidence store offers `putFromParts` and a ledger is at hand (`keepLater`), the keep is handed to the ledger at once and the answer says `keep_pending: true`; with no ledger, or one that declines, it is awaited within the bound as before. Test: `r7-upload-t51.test.mjs`; platform: `r7-upload-plane.test.mjs`."
- R77 amended: "(fix round 7, G78) `heldCaptures` asks the evidence store no more for a capture whose object an earlier draw of this instance found held (it is immutable once it exists); an answer of not held, or none, is asked again at every draw, and the register is never the source of held. The memory holds at most `HELD_PROVEN_MAX` (5,000) digests, then is emptied. Each draw that asks the store logs `{capture: "heldcaptures", heads, head_ms, remembered}`. Test: `r7-t51.test.mjs`."
- R96 amended: "`copy` also answers `title`, the document's title as the record holds it, `null` when it holds none. Test: `r7-alsohere.test.mjs`."
- R101: nothing changes (G73 is a characterization: `r7-alsohere.test.mjs`).

### Tests and checks
- Own suite under the preload (`test/m/capture/`): 294 tests, 294 pass (new: `r7-upload-t51` 4, `r7-t51` 4, `r7-alsohere` 2, `r7-upload-plane` 1; `r103-t51`, `fix2-t51`, `fix3b-t51`, `p10-t51`, `t51` re-stated).
- Users (the control-plane files that name `uploadCapture`, `captureupload`, `heldcaptures`, `heldAt` or `keepLater`: 136 tests; plane, acquisition, capture-requests, affordances, op-declarations, op-grades, store-door, interface-shell, wizard-scripts, screens-intake: 686): all pass but the G7 seam test above (mine, item G79 6) and two screens-intake tests (`t51-fix5` R31 E8, `t51-fix2` R54 C25) that fail only when two suites run at once and pass alone (33/33, and on the unmodified tranche).
- `checks/run.mjs`: format 0; architecture 0; coverage 0 for capture (record-core R89 R90 named by no test: not mine); words: no failure in capture, none added (`unkeyed` 1984 as the tranche's). `checks/ownership.mjs /home/user/bio capture origin/tranche/T51 job/T51/capture`: 0 failures.
- Protective bounds for BOB to report to Bob (K1881): `HELD_PROVEN_MAX` = 5,000 digests (chosen, not measured); `UPLOAD_HEAD` 64 KiB stands from J27.

## J28 · QUESTION

QUESTION (CAPTURE #51, B29; my record: 'Fix round 7', G79 item 6). G79 as planned hands a large upload's keep to the plane's ledger at once. That turns control-plane's t51-round6-seam G7 ('a 40 MB five-part upload states its size as a final reading ... no row owed') red: the plane's keep owner (plane/pending.mjs:163-167) enters a 'reading' row after the keep and reads it at once; the keep now ends before the screen has filed the document, so readHeld answers NO_HOME and the row stays owed one back-off (about 13 s) until the next tick finds the reading held. Before, the whole was held inside the request and no row was ever made. My best reading (plane's, not mine): after the keep the owner enters the reading row only when no reading is held for the digest and a home exists, i.e. it ends the keep without owing a reading when readHeld answers NO_HOME (the screen's own promotion owes the reading, control-plane unreadDocuments) - or BOB accepts the transient row and G7's check waits for the row to clear. The smallest thing I need: BOB's choice, and which job carries it. Everything else of the entry is done and pushed (294 capture tests pass); I hold COMPLETE until you answer, as no open QUESTION may stand at COMPLETE.

## Completion · CAPTURE #51 (B30 answered J28)
BOB ruled J28: the plane's keep owner enters a `reading` row only when no reading is held and a home exists (PLANE #54 carries it). The control-plane G7 seam test (`t51-round6-seam`) stays red by name until plane's change merges. G79, G78, G75 and G73 are built as written above; nothing deferred, no open question.

Size (session_018DeoSKvDLtRvtfBB1oDTG9): test runs 22, module lines 4402

## J29 · COMPLETE

COMPLETE (CAPTURE #51, B29; B30 applied). G79 (no read-back, large keep handed to the ledger), G78 (held objects remembered), G75 (heldat copy.title), G73 (characterization, green) built and pushed; details, red-then-green tests, platform L figures, proposed lines (R103, R77, R96 amended), bounds (HELD_PROVEN_MAX 5000) and the Size line are in my record 'Fix round 7'. Capture suite 294/294; checks: format, architecture, ownership 0 failures. Census ops: none changes. t51-round6-seam G7 red by name until PLANE #54 merges (B30).

## J30 · REPORT

REPORT (CAPTURE #52, T51 fix round 9): findings in other modules, and what I need wired. None blocks my COMPLETE.

1. **format-registry** (`formats.mjs`:225, "HEIC and TIFF are not registered", N853b): SCAN E7's multipart TIFF is profiled `undetermined`, exactly as its one-part twin is, so "the sentence names the type" holds for the JPEG and cannot for the TIFF until the registry names TIFF. Capture judges a file in parts and a one-part file the same way (`r9-t51.test.mjs`, the R108 test compares each with its twin).
2. **plane (plane-2) must assign two instance properties** beside `keepLater` (`plane/store.mjs`): `capture.registerJob` and `capture.armJobs`; capture reads them as it reads `keepLater` (the store's, else the call's `registerJob` and `armJobs`, else none). Until then every upload's answer carries `jobs: {not_registered: [{kind, reason: "NO_REGISTRAR"}]}`, as R109 states. The rows capture registers, each in the filing transaction: `{kind: "reading", sha, carrier: "snapshots/upload-<sha>"}`; `{kind: "unpack", ...}` for a profile naming `zip`; `{kind: "keep", sha, carrier, parts: [<part sha256>...]}` when the keep past `MULTIPART_KEEP_MAX` is handed to the plane; `parts` is a list of the part digests (the shape `keepLater` has always taken), added to `reading` and `unpack` for a file in parts. Please confirm plane-2's table wants that shape.
3. **control-plane** (`owner-ops.mjs`:96, `captureupload`): `uploadCapture` now takes `declared` (the request's Content-Length) and judges it before one byte is read (R111: the refusal then writes and holds nothing); the arm passes none, so a body over the ceiling is refused when the stream reaches it instead. Handing `declared: Number(content-length)` is control-plane's one line. `uploadCapture` also takes a byte `ledger` (runtime-limits), as `captureObjectOp` does through the handler's `ledger`; neither is handed today.
4. **The ceiling a member meets changed**: R111's request-body entry of `PLATFORM_FIGURES` (104,857,600 B) is lower than `CAPTURE_MAX` (256 MiB alpha), so an upload between 100 MiB and 256 MiB, accepted before, is refused 413 with its size and `bound` 104,857,600. That is R111 as written; BOB should know it is a visible change. `READ_BOUNDS` needs no row from me: I quote `CAPTURE_MAX` (archive row, R114) and acquisition's `LARGE_FETCH_BYTES`, and what is left (`UPLOAD_PART` 8 MiB is acquisition R10's form, `UPLOAD_HEAD` 64 KiB is a sniff length, character and row counts) are forms and counts, not reading ceilings.
5. **Words rows owed to `later-ux.md`** (stand-ins keyed through `localize` in this module): `capture.index.job_not_registered`, `capture.index.body_over_request_ceiling`, `capture.ops.body_over_request_ceiling`, `capture.ops.body_over_capture_ceiling`.

## J31 · COMPLETE

COMPLETE, fix round 9, T51-24 · capture (job branch `job/T51/capture`, last commit a347b93e69).

**Entries applied**
- **R109, G126, G126f (R110), G127b:** `uploadCapture` registers its job rows through the registrar, read as `keepLater` is (the store's `registerJob`, else the call's, else none, and the answer then says `jobs.not_registered`), inside the one filing transaction after the receipt and the actor (the new upload, a second sighting, and the receipt-only case alike): `reading` always, `unpack` when the profile names `zip`, `keep` when the keep past `MULTIPART_KEEP_MAX` is handed to the plane (that handover is the row; with no registrar the older `keepLater`/`keepPast` path is unchanged). A registrar that refuses or throws rolls the upload back (no receipt, no actor, no row) and answers `JOB_NOT_REGISTERED` 502 with `job: {kind, reason}`. `armJobs` is awaited after the commit only. An uploaded archive is opened by `acquisition.unpack` through this module's store as a fetched one is (tested: three members filed, none `waiting`; uploaded twice, one `unpack` row and opened once).
- **R111, G124b, G124g:** `uploadCapture` and `putCapture` (`captureObjectOp`) refuse a body over the lower of `CAPTURE_MAX` and `PLATFORM_FIGURES.request_body_max` with 413 `{size, bound, key, detail}`; a declared length is judged before one byte is read, the stream is cancelled, nothing is written; both take a byte `ledger` and release it on every path; a put is read into one buffer (allocated once to its declared length, hashed as it arrives, put once; the old read held the request's buffer and a copy), and `bounds` only lowers the figures (scaled bounds for tests). `REPLAY_MAX` and `HELD_AT_CHECK_MAX` now quote `CAPTURE_MAX` and acquisition's `LARGE_FETCH_BYTES`. A one-part upload is judged as text from the buffer just stored, no longer read back.
- **R112, G137c:** capture's `renderAdmit`/`renderSpend` already met R112 once acquisition's R118 reports a failed render's real time (job 23): tested directly (48 failed renders of 2 s leave 96 s spent and the next admitted; a `deferred` answer states spent, reserved, allowance; a `waiting` one running and cap only; a success is charged as before). No change to `renderSpend`.
- **R108, G127b:** at capture's interface the digest was already the whole's (hashed as the body arrives; receipt, actor, document and reading under it, parts only in `document.parts`). Tested for a multipart TIFF and JPEG and for two members uploading the same bytes; one-part unchanged. The first-part symptom is the register builder's (screens-intake) and provenance's.
- The five reds BOB named (#276), mine: R103's three tests count whole-part `get`s (the fixture bucket now serves and records ranges); R92's and R107's controls follow the one decode rule (a UTF-16 byte order mark is text; each compares with `textTypeOf`); the 256 MiB R86 test is now the 100 MiB ceiling's.

**Four fields per cause** (R-FOUR)
- G126/G126f (R109, R110): (1) cause `capture/index.mjs` `uploadCapture` (old `:682-858`): no job row for any upload, a `zip` profile stops, no `unpack`. (2) missed: every upload test asserted a profile or a receipt, never a job row or a registrar; gap fixed by `r9-t51.test.mjs`. (3) red seen first: R109 `actual: [], expected: [ [ 'reading', 'f5466c96a7a7...', 'queued' ] ]`; keep `actual: undefined, expected: true` (keep_pending); R110 `actual: [], expected: [ [ 'reading', 'a3a30dee...' ], [ 'unpack', 'a3a30dee...' ] ]`; no-registrar `actual: undefined, expected: { not_registered: [ [Object] ] }`; all green after. (4) L: the registrar is `jobRegistrarStub` made part of record-core's transaction; the real-table seam is control-plane's section 6.
- G124b/G124g (R111): (1) cause `capture/ops.mjs:83-85` (a put read `req.arrayBuffer()` with no ceiling) and `uploadCapture`'s `CAPTURE_MAX` alone, the platform's body ceiling absent. (2) missed: no test counted bytes held or named a ceiling either side. (3) red seen first: `actual: [ true, undefined, undefined, undefined, undefined ], expected: [ false, 'TOO_LARGE', 413, 104857601, 104857600 ]`; ledger `counted (0)`; put `actual: [ true, undefined, 200, ... ]`; green after. (4) L: counted with the byte ledger (24 MiB upload peaks at the file and at most two parts; a 24 MiB put at the body and one chunk), not a capped child; the through-the-door run is plane's seam.
- G137c (R112): (1) cause: the unreported 25 s reservation (`index.mjs` `renderSpend`, then 2351-2364) was acquisition's to report, merged in job 23; capture's account was already right. (2) missed: no test of 48 failed renders. (3) red: not red at capture (green first run); the waiting control was red only through my own test's slot count, corrected. (4) N here; the visitor-render seam is section 17.
- G127b (R108): (1) no cause in capture (see above). (3) green at first run for the digest, parts and second-member assertions; the TIFF type assertion was red until compared with its one-part twin (`tiff: the profile names the type (undetermined)`), see the REPORT.

**Deferred:** none. **Other modules:** the REPORT above. **Generated artifacts made stale:** none known (BOB regenerates words rows: the four keys in the REPORT).

**Tests and checks**
- Module: `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/capture/`: tests 312, pass 312, fail 0. The upload files (r9, upload, r7-upload) alone, five runs: pass 38 fail 0 each, and on one core (`taskset -c 0`): pass 38.
- Users that call the upload or the put, run: control-plane `r100-upload` 4/4, screens-intake `t51-fix4` 15/15, screens-inquiry `g41-document` 6/6, `fr5-seam` 3/3, op-declarations `t41` 11/11; red and identical on the untouched tranche: screens-inquiry `fr6-seam` (red by name, extraction's `more`) and plane `r8-heal-door` (3) and `r8-headofline` (2) (Miniflare alarm tests).
- `checks/format.mjs` 0 failures; `checks/architecture.mjs bio capture` 0 failures; `checks/coverage.mjs bio capture`: 65 of 65 live ids named, 0 failures; `checks/ownership.mjs bio capture origin/tranche/T51 job/T51/capture`: 0 failures; `checks/run.mjs`: the words line shows no finding in capture (its failures are the inherited ones named in START).

Size (session_01LUWHRgbf5NrxEMrYzKCSgx): test runs 22, module lines 4560
## Fix round 9 · job 42 · CAPTURE #53 (B32: G127f, files over the platform's request body cap uploaded in parts)

**The entry.** The browser sends a file past the request-body ceiling (`PLATFORM_FIGURES.request_body_max`, 104,857,600 B including framing, K4838 (6)) in parts THROUGH the Worker, each request under the cap, and capture writes them with R2's own multipart upload on the bucket binding (`createMultipartUpload`, `resumeMultipartUpload(...).uploadPart`, `complete`, `abort`): no presigned URL, no R2 S3 credential, no new secret, no installer change (BOB's ruling, P17).

**What was built** (all in `bio-plane/src/capture/`; no other module touched)
- `Capture.beginPartedUpload`, `putUploadPart`, `completePartedUpload`, `abortPartedUpload`, `expireUploads` (index.mjs), the table `parted_uploads` (schema.mjs, declared to purge with capture's other tables), and the exports `PARTED_PART_BYTES` (16 MiB: three times R2's 5 MiB minimum, so R2 accepts every part but the last, and a request carries one part), `PARTED_UPLOAD_TTL_MS` (24 h, the expiry, chosen) and `PARTED_SWEEP_MAX` (20).
- The route arms in `captureOps` and the four rows of `DECLARED_OPS` (K4208): `captureuploadbegin`, `captureuploadpart`, `captureuploadcomplete`, `captureuploadabort`.
- `uploadCapture` is refactored, not changed: its tail (the receipt, the actor, the job rows and `within`, in one transaction) is the private `#file`, which the completion calls too, so a file sent in parts is filed exactly as a file sent in one request (R86, R108, R109, R110) and answered the same (the receipt, the profile, `jobs`; tested for deep equality with the one-request twin). The fence (member session, statement, name, type) is one shared helper. A one-request refusal for the request-body ceiling now carries `in_parts: true` when the capture ceiling still admits the file (the screen's cue to begin one).

**The route (names, inputs, answers: mine to declare; BOB carries them to control-plane (job 38) and screens-intake (job 35))**
1. `op=captureuploadbegin` (member session, mutating, needs `contribute`; `by` the door's stamp, never the body's). Body `{sha256, bytes, statement, name?, type?}`: the whole file's SHA-256 and size as the browser declares them. Refusals before any byte: `MEMBER_SESSION_REQUIRED` 403, `UPLOAD_NO_STATEMENT` (C-118.10), the required-argument refusal naming `name`, `type`, `sha256` or `bytes`, `TOO_LARGE` 413 `{size, bound}` (judged on the declared size before any part: `bound` is `CAPTURE_MAX`; a whole may exceed one request, so the request ceiling does not bind it), `EVIDENCE_STORAGE_NOT_CONFIGURED` 503, `PARTED_UPLOAD_UNAVAILABLE` 503 (the bucket offers no multipart upload, or capture does not know the object key), `UPLOAD_NOT_BEGUN` 502. Answer `{ok, upload, sha256, bytes, part_bytes, parts, next: 0, held, created, expires}`: the browser cuts the file into `parts` parts of `part_bytes` bytes (the last the remainder) and sends them in order. `held: true` (the evidence store already holds an object of that digest and size) has no part to send; the completion files it as a second sighting. A second begin of the same file by the same member abandons the first.
2. `op=captureuploadpart` (same class and stamp). The part's raw bytes are the request body; `upload`, `index` (from 0) and `sha256` (the part's own digest) are in the address; the door hands the request's Content-Length as `declared` (judged before one byte is read) and its byte `ledger`. Answer `{ok, existed, index, next, parts, bytes}`. Refusals: `UPLOAD_UNKNOWN` 404 (unknown to this instance, or another member's: the two read alike), `UPLOAD_EXPIRED` 410, `UPLOAD_NOT_OPEN` 409, `PART_OUT_OF_ORDER` 409 `{next}` (the digest of the whole is hashed in order across the parts), `PART_CONFLICT` 409 (other bytes under a held index), `PART_SIZE` 400 or 413 `{size, bound}` (a part is exactly `part_bytes`, the last the remainder), `PART_DIGEST_MISMATCH` 400 `{expected, got}`, `PART_IN_PROGRESS` 409, `UPLOAD_LOST` 409 (see below), `PART_NOT_READ` and `PART_NOT_STORED` 502, `NO_BODY`. A part put twice is idempotent: answered `existed: true` and stored once.
3. `op=captureuploadcomplete`. Body `{upload, parts: [<part digest>...]}`. `PARTS_MISSING` 409 `{missing: [index...]}` and `PARTS_OUT_OF_ORDER` 409 `{index}` write nothing and leave the upload open. The digest of ALL the bytes (hashed in order across the parts, never a part's) must be the one declared at the begin, else `WHOLE_DIGEST_MISMATCH` 400, the R2 upload aborted, nothing held. Then R2's upload is completed (one object at the whole's key; `UPLOAD_NOT_COMPLETED` 502 aborts) and the file is filed as `uploadCapture` files one: the answer is `uploadCapture`'s (`ok`, `existed`, `capture`, `receipt`, `document`, `jobs`, `within`), the document carrying no `parts` (the whole is one object), and `JOB_NOT_REGISTERED` 502, `UPLOAD_WITHIN_FAILED` 500 as there. A retry after a refusal in the filing files the object already complete and completes nothing twice. In-process, `completePartedUpload` takes `within`, `at`, `registerJob`, `armJobs` as `uploadCapture` does.
4. `op=captureuploadabort`. Body `{upload}`: `{ok, aborted}`, idempotent; the R2 upload is aborted and the session removed.

**Choices of mine** (BOB records; none needs Bob)
- *The whole's digest is declared at the begin.* R2's multipart upload is made at a fixed key, so the key under the whole's digest must be known when it is begun; the digest is verified at the completion against the hash of all the bytes. The consequence is for the page: **the browser must know the whole file's SHA-256 before it sends a part** (an incremental hasher in the page; SubtleCrypto cannot stream). The alternative (digest at the completion) means staging the parts as objects of their own and reading them all back to assemble the whole: a second read of every byte and a part-object left behind, which G79/G127d removed. Screens-intake (35) carries the page's side.
- *A part is exactly `part_bytes` and goes in order* (R2: every part but the last the same size; and one hasher across the parts). The hash of the parts so far lives in the object's memory between requests; if the object was restarted between two parts the upload is aborted (R2 holds nothing) and answered `UPLOAD_LOST` (409): the page begins again. The session row carries no byte; only the hashing is lost.
- *Expiry:* 24 hours from the begin, swept at each begin (up to 20 sessions, oldest first) and when the owner returns to an expired session (`UPLOAD_EXPIRED`); R2's own cleanup of an incomplete multipart upload is the backstop. A bucket that will not abort leaves the row for the next sweep.
- *No part is an object of its own:* the document names no `parts`; `capture.sha256` and every row an upload writes are the whole's (R108). A file sent in parts is judged as text from its first 64 KiB (R107's rule), and `profileOf` reads one object past `PROFILE_TEXT_MAX` by ranges.
- *The object key* is record-core's (its R38) and the composition root's: capture reads it as it reads `keepLater`, `registerJob` and `armJobs`: the call's `key` (the function the door hands `op=capture`), else the store's `evidenceKey`. With neither, the begin answers `PARTED_UPLOAD_UNAVAILABLE` and writes nothing.
- A file under the cap still goes in one request, unchanged (tested); a parted upload of a small file is admitted (nothing refuses it) and files the same.

**Wording proposed** (BOB writes `build/requirements/capture.md`)
- **R113 (new)** (fix round 9; G127f; K4838 (6), K4891; amends R86, R111) **A file past the request-body ceiling is sent in parts through the Worker and written with R2's own multipart upload.** `beginPartedUpload({sha256, bytes, statement, name, type, by})` (`op=captureuploadbegin`), `putUploadPart({upload, index, bytes, sha256, by, declared, ledger})` (`op=captureuploadpart`), `completePartedUpload({upload, parts, by, within, at})` (`op=captureuploadcomplete`) and `abortPartedUpload({upload, by})` (`op=captureuploadabort`). The begin is refused as R86 refuses an upload before a byte is read and judges the declared size against `CAPTURE_MAX` alone (`TOO_LARGE` 413 with `size` and `bound`), then answers the part size and the number of parts. Parts go in order, each exactly the part size (the last the remainder) and checked against its own digest as it arrives; a part put twice is stored once; a completion with a part missing or out of order is refused and writes nothing. The digest of all the bytes, hashed in order across the parts, is the one declared at the begin or the upload is aborted and nothing is held (never a part's digest, R108). The completion makes one object under the whole's digest and files it as R86, R108–R110 state (one receipt, the actor, one job row through the registrar in the filing transaction, the same answer); the document names no parts. The byte ledger holds at most one part. An upload not completed is aborted at its owner's word or 24 hours after its begin and holds nothing; the object's session state is a row without a byte of the file. Only the member who began an upload may use it. Test: `g127f-t51.test.mjs` (the scaled cap), `g127f-plane.test.mjs` (R2 under Miniflare, parts at 16 MiB).
- **R111 amended:** "A one-request upload refused for the request-body ceiling that `CAPTURE_MAX` still admits answers `in_parts: true`; a file sent in parts (R113) is bound by `CAPTURE_MAX` alone, judged on the size declared at its begin before any part is accepted."
- **R86 / R103:** no change (the filing is the same code).

**Words** (stand-in sentences keyed through `localize`; rows owed to `later-ux.md`; BOB regenerates `setup-words` rows): `capture.index.upload_unknown`, `upload_expired`, `upload_not_open`, `part_conflict`, `part_out_of_order`, `upload_lost`, `part_in_progress`, `part_size`, `part_not_read`, `part_digest_mismatch`, `part_not_stored`, `parts_missing`, `parts_out_of_order`, `whole_digest_mismatch`, `parted_not_completed`, `parted_unavailable`, `parted_not_begun`, `parted_not_aborted`, and `capture.declared.captureuploadbegin`, `captureuploadpart`, `captureuploadcomplete`, `captureuploadabort`.

**Four fields (R-FOUR), G127f.** (1) Cause: no route existed for a file past the cap: `uploadCapture` refuses it (R111, since #52), `CAPTURE_MAX` 256 MiB and the standard's 100/500 MB need more. (2) Missed: no probe of the cap before Stage 0 and no test sent a file over it; gap closed by `g127f-t51.test.mjs` (a scaled cap) and `g127f-plane.test.mjs` (R2 under Miniflare, 105 MiB). (3) Red seen first: the new file fails on the unchanged source with `SyntaxError: ... does not provide an export named 'PARTED_PART_BYTES'` (no begin, put, complete or abort existed); green after. (4) L: Miniflare, real R2 and real DO SQLite, parts at 16 MiB; Miniflare's R2 refuses seven 1 MiB parts at the completion as R2 does. P (a 150 MB file through the proxy at the redeploy) is BOB's, once the route is wired.

**Tests and checks.** Module: `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/capture/`: tests 336, pass 336, fail 0 (new: `g127f-t51` 21, `g127f-plane` 3; helper `g127f-worker.mjs`). Checks: format 0 failures; architecture 0; coverage 65 of 65 ids named, 0; ownership (`capture origin/tranche/T51`) 0. Users run: affordances 286/286, op-grades 150/150, record-core 189/189. Red, not mine: op-declarations R34 (two tests) names the four new member ops, which need `ACT_HELP` rows in `affordances` (or `ACT_HELP_ABSENT`); setup-words R10/R16/R17 stale until BOB regenerates the words rows (the keys above); plane R24 (`screen.objective.purpose`), plane L tests that fail under load or await plane-2, and control-plane `t51-visitor-copy` (red on untouched `tranche/T51` too).

**Other modules (for BOB).** plane-2: assign `capture.evidenceKey = (digest) => <namespace>/captures/<digest>` (or the door hands `key`), beside `registerJob`/`armJobs`. control-plane (38): four arms calling the methods above for `captureuploadbegin/part/complete/abort` (member session, `contribute`, `by` the stamp), the part's raw body as `bytes`, `declared` only when Content-Length is present, the byte `ledger`; the declared rows merge through `plane/declarations.mjs`. affordances: help for the four. screens-intake (35): the page hashes the whole file first, cuts by `part_bytes`, sends parts in order, begins again on `UPLOAD_LOST`/`UPLOAD_EXPIRED`, aborts on cancel, takes `in_parts` from a `TOO_LARGE`. setup-words: regenerate rows.

Size (session_012VVtWyCVJLdMrVBcsCC1Jb): test runs 14, module lines 4924

## J32 · COMPLETE

COMPLETE (CAPTURE #53, B32): G127f built and pushed (job branch job/T51/capture). A file past the request-body ceiling is sent in parts through the Worker and written with R2's own multipart upload: beginPartedUpload, putUploadPart, completePartedUpload, abortPartedUpload, expireUploads; ops captureuploadbegin/part/complete/abort declared in DECLARED_OPS; table parted_uploads; no secret, no presigned URL. Filing is the one-request upload's own code (same answer, one job row, whole digest). Ops, inputs, answers, proposed R113 and R111 wording, choices (digest declared at begin so the page hashes the file first; 16 MiB parts, in order; 24 h expiry; UPLOAD_LOST on a restart) and the words keys are in my record, section "Fix round 9 · job 42". Capture suite 336/336; format, architecture, coverage, ownership 0 failures; platform L under Miniflare (real R2, 105 MiB) passes. Red not mine: op-declarations R34 (affordances needs ACT_HELP for the 4 ops), setup-words R10/R16/R17 (regenerate rows), plane R24, control-plane t51-visitor-copy (red on tranche too). Wiring owed: plane-2 evidenceKey, control-plane arms (job 38), screens-intake page (35). New files outside paths: none.
Size (session_012VVtWyCVJLdMrVBcsCC1Jb): test runs 14, module lines 4924

## Fix round 9 · job 60 · CAPTURE #54 (B33: K4909, the parted upload's argument shapes keyed)

**Entry applied (job 60).** The seven bare shape strings the words check read as `inline` in `bio-plane/src/capture/index.mjs` now go through `localize(id, en, vars)` at their use, wording unchanged: line 1066 (`capture.index.shape_bytes`); lines 1116, 1200, 1264 (`capture.index.shape_upload_name`, one id for the three identical uses); line 1118 (`capture.index.shape_part_index`); line 1129 (`capture.index.shape_part_index_last`, the `{last}` named variable in place of the template); line 1203 (`capture.index.shape_parts_digests`).

Also converted, per the entry's "every other shape string in the four `captureupload*` ops": line 1064 (`capture.index.shape_sha256_whole`), line 1120 (`capture.index.shape_sha256_part`), and the name and type length shapes in `#fence` at lines 716 and 719 (`capture.index.shape_string_max`, `{max}`), which the four ops reach through the fence. Same-id uses share one sentence, so no id has two `en`.

**Ids written** (BOB owes their rows to `later-ux.md`; BOB regenerates the `setup-words` rows): `capture.index.shape_bytes`, `shape_upload_name`, `shape_part_index`, `shape_part_index_last`, `shape_sha256_whole`, `shape_sha256_part`, `shape_parts_digests`, `shape_string_max`.

**Left alone.** The shape strings of `captureseenin`, `captureaccount` and `capturegrade` (lines 1412, 1451, 1670): other ops, outside this entry, and the words check does not flag them.

**Behaviour.** None changed: each refusal's `argument`, `shape`, `status` and `reason` are the same strings and values as before (`localize` returns the `en` when no word row exists). No requirement id changed. No test copies these sentences (the capture tests assert keys or the `shape` of other refusals), so no test changed.

**Tests and checks.**
- Module suite, from `bio-plane/`: `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/capture/`: tests 336, pass 336, fail 0.
- `timings.test.mjs` (time-sensitive), alone, on one core (`taskset -c 0`), five runs: pass 2, fail 0 each.
- `checks/words.mjs /home/user/bio capture`: 0 failures (was 7: the `inline` findings at lines 1066, 1116, 1118, 1129, 1200, 1203, 1264).
- `checks/run.mjs /home/user/bio`: 19 failures in all, every one inherited and none naming `capture` (`missingkey` 5 and `inline` 14 in `installer-steps`, case-checker, test-support and pdf-reader); before this job the total was 26.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs ... capture`: 0 failures. `checks/coverage.mjs ... capture`: 66 of 66 live requirement ids named by a test. `checks/ownership.mjs ... capture tranche/T51`: 0 failures (1 file changed: `bio-plane/src/capture/index.mjs`).

**Generated artifacts made stale:** none that I know of; no generated file was edited.

**Deferred:** none. **Other modules:** none touched, none found.

Size (session_01Wo2xMBoxbMVQCESiGbv5A2): test runs 6, module lines 4924

## J33 · COMPLETE

COMPLETE (CAPTURE #54, job 60, B33; K4909). Commit 91968cf197 on job/T51/capture, pushed.

The seven bare shape strings the words check flagged in bio-plane/src/capture/index.mjs (lines 1066, 1116, 1118, 1129, 1200, 1203, 1264) are written through localize at their use, wording unchanged, plus the other shape strings of the four captureupload* ops (1064, 1120, and the fence's name/type shapes at 716/719). Ids written, rows owed to later-ux.md: capture.index.shape_bytes, shape_upload_name, shape_part_index, shape_part_index_last, shape_sha256_whole, shape_sha256_part, shape_parts_digests, shape_string_max.

Checks: capture suite 336/336 pass; timings test 5 runs on one core, all pass; words check capture 0 failures (was 7); run.mjs 19 failures, all inherited, none naming capture; format, architecture, ownership 0; coverage 66/66. No behaviour, requirement or test changed. Nothing deferred; no generated artifact stale.

Size (session_01Wo2xMBoxbMVQCESiGbv5A2): test runs 6, module lines 4924

## Fix round 9 · job 75 · CAPTURE #55 (B34: R109 amended, no reading row for a stated upload; the profile reads the held bytes; G152, K4958)

Commit on `job/T51/capture`. Files: `bio-plane/src/capture/index.mjs`, `bio-plane/test/m/capture/r9-t51.test.mjs`.

**Cause.** (b) `#file`'s `register` wrote a `reading` row always, though an upload over its kind's whole-read ceiling is never read (control-plane R125 (a), R132 state it at once). (i) `#file` called `profileOf` for a one-part upload with `firstPart` null, so `acquisition/index.mjs:2070-2073` read the stored object back whole (`ev.get`) for the format and `:2056-2059` for a text, though `#upload` held the part (`onlyPart`).
**Why missed.** R109 said "`reading` always", and no test sent an upload over a kind's ceiling or counted `get` calls on the evidence store during a profile.
**Red first** (both red on the tranche tip, green now; `r9-t51.test.mjs`): (1) a 25 MiB PDF upload (pdf.bytes is 24 MiB) registered a `reading` row; (2) a counting bucket saw one whole `get` of a 3 MiB PDF upload and of a 3 MiB text upload.
**Platform check.** None owed by this job: nothing here depends on R2 or the Worker. P at the redeploy is BOB's: a PDF over 24 MiB uploaded through the proxy leaves no `reading` row (`op=jobs`/the plane's table) and the door's stated answer.

**Entries applied**
1. `reading` is not registered for an upload whose size is over the whole-read row of its kind: `wholeReadRow(profile)` (module constant) mirrors control-plane `reading-gate.mjs` `wholeRowOf(kindOf(document))` from what the profile states: PDF `pdf.bytes`, CSV `csv.bytes`, text kinds `text.bytes`, every other kind `pdf.bytes` (the whole-load row). The answer carries `reading_stated: true` (new key; also on a second sighting, and the no-registrar `jobs.not_registered` leaves `reading` out when stated). `unpack` and `keep` rows are unchanged. A second sighting of bytes the record holds computes the profile (only when the file is over `pdf.bytes`, the lowest row) so it owes no reading either.
2. A one-part upload hands the bytes it holds to the profile: `Capture.#holding(ev, sha, bytes)` is the evidence store as `profileOf` meets it, `get` of the file's digest answering the held bytes (a range of them for a ranged read), every other call the store's. `acquisition.profileOf` takes no `bytes` argument (B34 said it did: its parameters are `ev, sha, ct, total, multipart, headers, locator, view, retrieved, origin, parts, firstPart, unread`), and acquisition is not mine; the seam is capture's own. The byte ledger counts the part until the profile is taken (`settle`), no longer released before it.
3. No sentence added (no row owed to later-ux); `words` shows 0 failures naming capture.

**Tests** (R109): the two new tests above (`G152`), plus `R109 (keep)` adapted to the amended requirement: its 33 MiB file is now text (read, so it still owes `reading` beside `keep`), and a 33 MiB file of no known kind owes `keep` alone.

**Found in another module (REPORT to BOB)**
- acquisition: `profileOf` could take the held `bytes` itself (one parameter, `formatBytes = readWhole = profileBytes = bytes`), which would replace `Capture.#holding`; then capture passes `onlyPart` and drops the wrapper. Efficiency only; capture meets R109 without it.
- runtime-limits / acquisition: the kind-to-row map is written three times now (control-plane `wholeRowOf`/`kindOf`, capture `wholeReadRow`, and the diagnosis item (b) asked for one exported map). If the two ever differ, an upload either keeps a reading the door states, or loses one nobody states. One exported map (from runtime-limits or acquisition, taking a profile or a document) is the fix; capture will quote it.
- control-plane: the upload's answer gains `reading_stated: true`; the door may pass it through.
- Not mine, found: `fr6-seam.test.mjs` "R96 G13 (the real plane)" is red on the tranche tip too ("red by name until extraction's `more` merges").

**Deferred.** Nothing.

**Tests and checks.** capture suite 338/338 (`node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/capture/` from `bio-plane/`); timings test 3 runs on one core, all pass. Impact set: 98 modules name capture; the users that drive the real `uploadCapture` (screens-inquiry g41/fr5/fr6, journey-check route-encoding, wizard-scripts t47, affordances t36, op-declarations t41/t47, plane r8-heal-door, r8-headofline, r9-jobs): 97/98, the one red the `fr6-seam` G13 above, identical without my change. `format` 0 failures; `architecture` 0; `coverage` 66 of 66, 0; `words` capture 0 failures (inline 0); `ownership` 0.

Size (session_01TcCgd312RDvc5erHPTSkhN): test runs 9, module lines 4963

## J34 · COMPLETE

COMPLETE (CAPTURE #55, job 75, B34; R109 amended, G152, K4958). Record section "Fix round 9 · job 75" on job/T51/capture.

Applied: (1) no `reading` row for an upload over the whole-read ceiling of its kind (PDF pdf.bytes, CSV csv.bytes, text text.bytes, every other kind pdf.bytes, as control-plane's wholeRowOf); the answer says `reading_stated: true`, also on a second sighting. (2) A one-part upload's profile reads the bytes the upload holds: acquisition.profileOf takes NO `bytes` argument (B34 said it did), so capture hands it the evidence store with `get` of the file's digest answering the held bytes (Capture.#holding); nothing in acquisition touched.
Red first: a 25 MiB PDF upload registered a `reading` row; a counting bucket saw one whole get for a 3 MiB PDF and a 3 MiB text upload. Both green now. Test `R109 (keep)` adapted: its 33 MiB file is text (still reading + keep); a 33 MiB file of no kind owes `keep` alone.
Checks: capture suite 338/338; impact users that drive the real upload 97/98, the one red (fr6-seam "R96 G13 real plane") is red on the tranche tip too; format, architecture, ownership 0; coverage 66/66; words capture 0 failures.
REPORT items for you: (a) acquisition.profileOf could take `bytes` itself and replace my wrapper; (b) the kind-to-row map now exists in control-plane and capture: one exported map (runtime-limits or acquisition) is the fix; (c) the door may pass `reading_stated` through. No new words. Nothing deferred.

Size (session_01TcCgd312RDvc5erHPTSkhN): test runs 9, module lines 4963

## Fix round 9 · job 97 (CAPTURE #56, B35; R107 amended, G170, K4985)

**Entries applied**
1. `uploadCapture` hands `profileOf` the file's `name` (when a non-empty string) and its declared `type` as `declaredType` (when a non-empty string), at `capture/index.mjs` `profileThe` (one call site; a one-part and a multipart upload alike, and a second sighting). No other line changed. A call with neither passes `null` for both, so an upload with no name is profiled from its bytes as before.

**Tests** (R107): new `bio-plane/test/m/capture/g170-t51.test.mjs`, six tests through the real `uploadCapture`: a CSV named `c.csv` declared `application/vnd.ms-excel`, the same declared `application/octet-stream`, and a `.tsv` declared `text/plain` are profiled `csv`; `text/csv` and `text/tab-separated-values` stay `csv`; controls: the same bytes with no name are not `csv`, and a ZIP named `c.csv` declared octet-stream is not `csv` and equals the same ZIP uploaded bare.

**Red first (seen):** with my change in and acquisition's tranche tip as it stands, the three declared-type cases are `undetermined` (3 fail, 3 pass): `profileOf` does not yet take `name` and `declaredType` (acquisition job 96). They turn green when it merges.

**After the merge (B36).** `g170-t51` 6/6 green (the three red cases now `csv`). One further change in my module, found by `g41b-t51`'s first control: acquisition's `profileOf` now prefers `declaredType` over `ct`, so a declared text type over bytes `textTypeOf` judged not text (a NUL in the head, `ct` null) made the format `csv` from the declaration alone. R107 says a declaration never contradicts the bytes, so `profileThe` hands `declaredType` only when it is not a text type the bytes failed (`declaredFor(ct)`, using acquisition's exported `profilesAsText`); non-text declared types (octet-stream, vnd.ms-excel) are handed as the amendment requires. `g41b-t51`'s last control (a 9 MiB `x.csv` declared octet-stream) is now `csv` and records the declaration as the uploader's, judged against R107 amended and format-registry R31: the text content type is still never overridden by a name (textTypeOf's rule), the format is decided by the name pass, as for the one-part file.

**Found in another module (for BOB).** acquisition `profileOf`: `declared0 = declaredType || ct` lets a declared text type over bytes judged not text decide the format; capture guards it on its side (above). The guard could live in `profileOf` for every caller (a fetch passes `declaredType: ct`, the same value). Efficiency/robustness only.

**Deferred.** Nothing. **Rows owed.** None (no sentence added).

**Tests and checks.** capture suite 344/344; `cap13-reuse-pages`, `d57selflink` 2/2; users that drive the real upload: control-plane r100-upload 4, r131-gate 13, r72-parted 8; op-declarations t41 11; plane r8-heal-door 4, r8-headofline 3, r9-jobs 35; screens-inquiry fr5-document/question/reads/seam 7/2/3/3, g41-document 6; wizard-scripts t47 7: all green. `format` 0 failures; `architecture` 0; `coverage` 66 of 66, 0; `words` 0 failures (inline 0, plain 0, testcopy 0, missingkey 0); `ownership` 0 (4 files).

**COMPLETE fields.** Cause: `uploadCapture` called `profileOf` without the file's name or declared type, so format-registry R31's name pass never ran for an upload. Why missed: capture's tests uploaded CSVs declared `text/csv` or named `.csv` with no type, never a CSV declared with a non-text type nor a `.tsv` as `text/plain`. Red first: `g170-t51` 3 of 6 red before acquisition's job 96 merged, green after. Platform check: none owed (no platform behaviour changed; the real-upload users above are green).

Size (session_01Jx17YoKtyusq7GHL5JmPG7): test runs 9, module lines 4966

## J35 · COMPLETE

COMPLETE (CAPTURE #56, job 97, B35/B36; R107 amended, G170). The upload hands profileOf the file's name and declared type (declaredType); a declared text type over bytes judged not text is not handed, so a declaration never contradicts the bytes. Cause: no name/type reached format-registry R31's name pass. Why missed: tests only used text/csv or a .csv name with no type. Red first: g170-t51 3 of 6 red before acquisition job 96, green after. Platform check: none owed. g41b-t51's last control (9 MiB x.csv declared octet-stream) is now csv, judged against R107 and R31. Capture suite 344/344, real-upload users green; format, architecture, coverage (66/66), words, ownership 0 failures. For you: acquisition profileOf could guard 'declared text type over non-text bytes' for every caller (a fetch passes declaredType: ct). No rows owed. Size (session_01Jx17YoKtyusq7GHL5JmPG7): test runs 9, module lines 4966.

## Fix round 9 · job 101 (CAPTURE #57, B37; R113 amended, G173, K5001)

**Entries applied**
1. R113 (G173): an upload sent in parts survives the object being taken out of memory between two parts. The running SHA-256 of the parts so far is kept with the upload's row (`parted_uploads.hash_state`, a few hundred characters: the eight words, the length and the bytes held back for the next block), written in the same transaction as the part that advanced it (`parts` and `hash_state` never disagree), and taken up again by `#liveOf(row)` in a new instance, at `putUploadPart` and at `completePartedUpload`. `UPLOAD_LOST` is answered only when the row cannot say the digest: no `hash_state` (an upload begun before this change) or one whose length is not the sum of the parts held. A new file `capture/sha256-resume.mjs` holds the resumable stream. The column is in the table's `CREATE` and in `CAPTURE_ADDITIVE_COLUMNS` (older stores gain it at boot, never back-filled). The ledger bound (one part) is unchanged; the row grows by about 300 bytes, far under SQLite's row bound.

**Why a stream of my own.** `record-grammar`'s `createSha256` offers no state to save, and record-grammar is not mine. R2's open multipart parts cannot be read back, so "taken again from the parts held" is not available. `sha256-resume.mjs` is the same FIPS 180-4 compression with a `snapshot()`; its tests drive it against WebCrypto over the block and padding boundaries and across several saves, as record-grammar's own tests drive its stream. See the REPORT item below.

**Tests (R113)**: `g127f-t51.test.mjs`: the old "restarted instance → UPLOAD_LOST" test is replaced by two (that is the requirement's change): a restarted instance accepts the next part, again between later parts, and completes to the declared digest, with the controls that a wrong part is still refused (`PART_DIGEST_MISMATCH`, nothing stored) and a wrong whole still aborts (`WHOLE_DIGEST_MISMATCH`, nothing held); and `UPLOAD_LOST` for a row with no digest or a digest that does not describe the parts held. New `sha256-resume.test.mjs` (3). `g127f-plane.test.mjs`: begin, part 0, a real 12 s pause in Miniflare over the real object, the answering object proven a different one (`inst` in the test Worker, `g127f-worker.mjs`), part 1 accepted, completion's digest the declared one, a wrong part still refused.
**Red first (seen):** on the tranche tip's code the plane test answers `UPLOAD_LOST` at part 1 after the pause, and the two unit tests fail the same way.

**Found in another module (for BOB).** (a) `record-grammar`'s `createSha256` could offer `snapshot()` and a restoring constructor; `capture/sha256-resume.mjs` would then be deleted (one SHA-256 implementation, its comment's rule). (b) `g127f-plane` test 1 (the idempotent re-put of a full 16 MiB part) is red now and then with `write ECONNRESET` (the diagnosis' P2, on `prep/load-reds`, whose test edit I was told not to merge): it failed 1 run in 3 here, with my change in and with it out; it also takes the other three tests of the file down with it, as the Miniflare instance is shared. Product side of P2 (a part put again or an unknown upload is answered before its body is read) is not part of this job and is left for BOB to place.

**Deferred.** Nothing. **Rows owed.** None (no sentence added; the existing `UPLOAD_LOST` words stand).

**Tests and checks.** capture suite 344/344 (the plane files alone: `g127f-plane` 4/4 green in 2 of 3 runs, the third the ECONNRESET above; `r7-upload-plane`, `g41b-plane`, `plane` 1/1 each); users that name the parted ops: affordances t36, screens-intake r9-parts, store-door dispatch, control-plane stamps, r72-declared-door, r72-parted: 60/60. `impact.mjs` names 98 modules because `index.mjs` carries `DECLARED_OPS` (a shared table); `DECLARED_OPS` is unchanged, so I ran the users that drive the changed code, above. `checks/run.mjs`: format 0, architecture 0, coverage 0 (6927 of 6927), channels 0, words 0 failures (inline 0, plain 0, testcopy 0). Ownership: 8 files changed by capture, 0 failures.

**COMPLETE fields.** Cause: `putUploadPart` kept the running SHA-256 of the parts only in the object's memory (`#parted`), and workerd takes an object out of memory after about 10 s with no event, so a pause of 12 s between two parts answered `UPLOAD_LOST` and the member began again. Why missed: `g127f-plane` and `g127f-t51` sent parts back to back, and the only restart test asserted the loss as the intended behaviour. Red first: seen, above. Platform check: L, passed (Miniflare, real object, real R2 multipart, a real 12 s pause, the object proven replaced).

Size (session_017HhDkwNt6ddjD3dPVU5hd5): test runs 9, module lines 5095

## J36 · COMPLETE

COMPLETE (CAPTURE #57, job 101, B37; R113 amended, G173). An upload sent in parts survives the object being taken out of memory: the digest of the parts so far is kept with the upload's row (hash_state, written with the part) and taken up again by a new instance; UPLOAD_LOST only when the row cannot say it. Red first and platform check L seen (Miniflare, real object replaced by a 12 s pause). Suite 344/344, checks 0 failures, ownership 0. For you, see my record: record-grammar could offer a digest state (capture carries sha256-resume.mjs until then); g127f-plane test 1 is intermittently red with ECONNRESET (diagnosis P2, not this change).
