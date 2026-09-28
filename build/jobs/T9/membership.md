# membership (T9)

**Status** · session_01LbMiZGKaADvtuykNWkWcTu · depth 2 · COMPLETE · handled B3

## J1 · REPORT

R78 is built and tested (N208, N146), on `job/T9/membership` @ the commit before this entry, so you can merge me early for promotion's `NO_SUCH_PROJECT` site (§4).

- **Service:** `noSuchProject(projectId, extra?)`, a module-level export of `bio-plane/src/membership/index.mjs`. Answers `{ok: false, reason: "NO_SUCH_PROJECT", code: "NO_SUCH_PROJECT", check: "C-70.5", translation, project, …extra, detail}`: `project` the id as asked (null when none); `detail` one fixed sentence (today's `#noSuchProject` sentence); `extra`'s fields sit between `project` and `detail` (the legacy `finding` position) and never replace a fixed field. Writes nothing, never throws.
- **Its row:** `C-70.5` (the next free in C-70, the sight family), held in membership's own new file `bio-plane/src/membership/checks.mjs` as `MEMBERSHIP_CHECKS.NO_SUCH_PROJECT` (K174's pattern, as intent and conformance hold theirs), `where` = `src/membership/index.mjs noSuchProject > is-project-seen`. Re-exported from `index.mjs`. The catalogue (`bio-checks.mjs`) is not touched; C-70.1–.4 stay there.
- **Inside membership:** every site answering the condition now calls it: the nine sight lines (the old `Membership.#noSuchProject`, removed), `projectClaimOwner`'s bare `NO_SUCH_PROJECT` (R31) and `projectParticipants`' own sentence (R37). Their answers gain `code`, `check`, `translation`; R37's detail becomes the fixed sentence.
- **Tests:** `bio-plane/test/m/membership/no-such-project.test.mjs` (4 tests naming R78: shape and row, `extra`, writes nothing / never throws, every membership act byte for byte for absent, hidden and unseen ids). Module suite 85/85; format, architecture, coverage (78 of 78), ownership: 0 failures.
- **For the other sites (not mine):** citation's `noSuchProject` (index.mjs 82), legacy-store's `Store.#noSuchProject` (store.mjs 6765) and 5602, strength (777), promotion (867), case-authoring (187), intent's `refuseNoSuchProject` (C-111.2), conformance's `#projectRefusal` (C-113.2). Legacy tests that compare a store answer byte for byte with a membership one may now differ by the three added fields until legacy-store converges.
- **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change (not rebuilt, manifest §14).

## J2 · QUESTION

Three points for the rest of my share. None blocks me: I am building each on the reading given, and will bring it in line with your answer.

**Q1 (N123, the revocation notice): where `LISTENER_MALFORMED` and `LISTENER_DECLARED` are minted.** K31's pattern is a registration refused `LISTENER_MALFORMED` / `LISTENER_DECLARED`, and K231 / promotion R49 make promotion's `listenerRefusal` their one site. Membership sits before promotion in the order and cannot call it (P4). My best reading, built now: membership's registration answers the same two codes in R49's shape through one private helper of its own (`#listenerRefusal`), noted as a second site until you rule. Options for your ruling: (a) R49's helper moves down to membership, the earliest registering module (K275's "earliest in the order" rule), and promotion calls it; (b) membership mints its own codes (`REVOCATION_LISTENER_MALFORMED` / `_DECLARED`, rows C-70.6/.7); (c) the second site stands, exempted. I lean to (a).

**Q2 (N123): the requirement text.** Nothing in my requirements states the notice yet. Proposed, for you to word:
- **R79** `onRevoked(module, fn)`: a later module (`capture-sources`, its R63) registers once at start; a second registration by the same module is refused `LISTENER_DECLARED`, a registration that is not a module name and a function `LISTENER_MALFORMED` (Q1). Each time a member's status becomes `revoked` (R8's carried removal, R20's revocation), every registered `fn` is called once, in the modules' total order, inside the revoking act and after its writes (so in the caller's transaction), with `{memberId, by, at}` (`by` the act's actor, `at` its time). A listener's answer is ignored and a listener that throws changes neither the revocation, its answer, nor another listener's notice. A write that leaves the status `revoked` unchanged (revoking a revoked member) notifies nobody.

**Q3 (N142, N70): Provides wording.**
- **R80** `inSight(bundleId, viewer)` (N142): `true` exactly when a bundle `bundleId` is held and R43 admits `viewer` to it (R44's FULL for a project); `false` for an absent or empty id, an unrecognised viewer, and a project R43 does not admit. Writes nothing, never throws. And `bundleGate` / `bundleRedactor`: neither exists in membership; I read N142 as "struck", the layer-6 jobs gating with `viewerPredicate` (R43) and `inSight` (R80). Nothing to build.
- **N70**: `hostingAccess({limit})` (R11) and `memberPairings({viewer, administer, limit})` (R19) each take a `limit` the caller may lower and never raise (200, as R48), read one row past it, and publish `limit` and a measured `truncated` (R48's shape); the history is the first `limit` records in the order recorded, the pairings the first `limit` by handle. `projectOwnerAdd`'s deciders (R39): the votes counted are read in SQL joined to the current owners with `LIMIT` = the owner count, which cannot cut a counted vote (one row per voter per proposal is the table's key), so nothing is published as a bound because nothing can be cut; the same for `projectOwnerRemove` (R40). Answers otherwise unchanged. If you want these as requirement text, the lines above are my proposal.

## J3 · REPORT

R81 is built and tested (K285, B3), on `job/T9/membership` @ 4f396e5811 (tranche/T9 merged in at B2), ready for the early merge.

- **R81** `listenerRefusal(held, module, fn, extra?)`, a module-level export of `bio-plane/src/membership/index.mjs`, is promotion's built function (job/T9/promotion @ 8926590d63) moved as it was, its region `is-listener-registration`, with one tightening: the refusal's own field names (`ok`, `reason`, `code`, `detail`, `module`, and `check`/`translation` too while no row is held) are never taken from `extra`, so a caller's copy cannot claim a catalogue row that does not exist. Promotion's R49 test passes over it unchanged (its `extra` carries neither). Rows read from `REGISTRATION_CHECKS` (legacy-checks) when held; none today, so a `test.todo` names N206.
- **R79** `onRevoked(module, fn)` asks R81 before recording; listeners are told in the modules' total order. For that, membership holds `MODULE_ORDER` (exported), a copy of promotion's list, its R79 test holding it equal to `build/modules.json`. **Suggestion for promotion:** import membership's `MODULE_ORDER` and drop its own copy, so the one list has one site (promotion may still take a test's `order`).
- **R80** `inSight` total (a non-string id is `false`; `sight` likewise); **R82** bounds built (`HOSTING_ACCESS_LIMIT`, `MEMBER_PAIRINGS_LIMIT`, 200 each; the ops pass `limit`); N195's region widened.
- **Tests:** module suite 92 (91 pass, 1 todo, 0 fail); every live id R1–R82 named. format, architecture, coverage (82 of 82), ownership: 0 failures.
- **Not mine, red on tranche/T9 too:** connections `factory.test.mjs` (R24/R18/K155: `captureOf` refuses a second `env`, capture R58) and citation `invariants.test.mjs` (R5: the retired-state type list now includes `aspiration`). Every other user module's suite is green on my branch.

Still to come in my COMPLETE: the old battery's suites touching my services, compared with tranche/T9.

## J4 · COMPLETE

**Entries applied** (code at 4f396e5811; tranche/T9 merged at B2):
- **R78 `noSuchProject`** (N208, N146): a module-level export. Every membership site that answers the absent-or-unseen condition calls it: the nine sight lines, R31's bare `NO_SUCH_PROJECT` and R37's own sentence. **Catalogue row: C-70.5**, held in the new `bio-plane/src/membership/checks.mjs` (`MEMBERSHIP_CHECKS.NO_SUCH_PROJECT`; `where` = `src/membership/index.mjs noSuchProject > is-project-seen`). Merged early (J1).
- **R79 `onRevoked`** (N123): listeners are told once each, in the modules' total order (membership now holds and exports `MODULE_ORDER`, tested equal to `modules.json`). The notice is `{memberId, by, at}`, sent inside R8's carried removal and R20's revocation, after their writes. Nothing is sent when a member who is already revoked is revoked again. A listener that throws or rejects changes nothing.
- **R80 `inSight`** (N142) never throws. A non-string id answers `false`, and `sight` answers `NONE` for one. `bundleGate` and `bundleRedactor` are struck.
- **R81 `listenerRefusal`** (K285): promotion's function, moved. One change: a caller's `extra` never supplies the refusal's own fields, including `check`/`translation`. R79 registers through it. Merged early (J3).
- **R82** (N70): `hostingAccess({limit})` and `memberPairings({…, limit})` are capped at 200 (`HOSTING_ACCESS_LIMIT`, `MEMBER_PAIRINGS_LIMIT`), and each answer includes its `limit` and a measured `truncated`. The ops pass `limit`. The votes behind R39's and R40's deciders are now read by `#ownerVotes`, which joins them to the current owners and limits the read to the owner count.
- **N195**: region `is-hosting-access-holders` now covers the whole refusal.

**Deferred:** nothing. R81's `test.todo` stays open until legacy-checks holds the LISTENER_* rows (N206).

**Found in other modules:**
- **promotion:** could import membership's `MODULE_ORDER` so the list has one site, and drop its `listenerRefusal` copy (K285).
- **Sites still minting `NO_SUCH_PROJECT` themselves** (R78 says they should call it): citation (index.mjs 82), legacy-store (store.mjs 5602, 6765), strength (777), promotion (867), case-authoring (187), intent (C-111.2), conformance (C-113.2).
- **legacy-tests:** `bounds.test.mjs` now finds `hostingaccess` and `memberpairings` capped (roster 69 → 71). Its PIN arms need them driven, and that is the intended arrival. Everything else in the 93 old-battery suites that touch membership reads the same as on tranche/T9, except `contradiction-overstrict`, which is red on the base run and green on mine.
- **connections and citation:** `factory.test.mjs` (captureOf's `env`, capture R58) and citation's `invariants.test.mjs` (R5: `aspiration` now carries `retired`) are red on tranche/T9 too.
- **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change. I have not rebuilt it.

**Tests:**
- The membership module: 92 tests, 91 pass, 0 fail, 1 todo.
- The suites of every module that uses membership: all green, except connections (59/1) and citation (48/1), each red identically on tranche/T9.
- The 93 old-battery suites that touch membership, compared with tranche/T9: as above.
- Layer tests: none named in the manifest.

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 14 product files, 34 relative imports; 0 failures
- coverage: 82 of 82 live ids named by a test; 0 failures
- ownership: 0 failures

Size (session_01LbMiZGKaADvtuykNWkWcTu): test runs 12, module lines 3593
