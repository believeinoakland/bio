# capture (T22)

**Status** · session_01WP7uNR1V8GPqjyrKhjKhiS · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings I am building on; none blocks me. Answer only if a reading is wrong.

1. R77 "its source as provenance records it" and "its age since it was collected". Reading: the source is the earliest acquisition receipt (`captured_locators`, provenance R48) of a capture the document's register rows name: `{address, via, retrieved}`, null when none; sorting by source sorts on that address. The age runs from `bundles.created` (record-core R37) when the document has never left `collected` (`prior_state` null), else from `bundles.last_updated`, since record-core keeps no per-state instant capture may read.
2. R79/R81 "an empty or machine author". Reading: a machine author is one whose stamp carries record-grammar's `MACHINE_CLASS_PREFIX` (`class:`) or is the bare founder's viewer `admin` (membership R43's machine-or-founder arm without a member id); `member:<id>` and a bare member id are members. The id-count, absent/invisible and wrong-state refusals have no catalogue row in R79 and none is minted: they answer uncatalogued codes `NO_IDS`, `TOO_MANY_IDS` (with `max`, record-core's `PER_ITEM_MAX`), `NO_SUCH_DOCUMENT`, `NOT_INFORMATION`, `NOT_COLLECTED`, `ALREADY_SET_ASIDE`, `NOT_SET_ASIDE`, each naming its ids.
3. R80 "how many of them found the whole-doorbell limit reached (R48)". Reading: a refused knock whose instance estimate had reached R48's limit when the rate was asked: every `RATE_GLOBAL`, and a `RATE_IP` whose instance window was also full. Refusals the Worker makes before the store (R49–R51, the two required-argument refusals, R66's weak secret) reach the tally through one new store route, `doorbellrefused`, whose failure is ignored. `doorbellTally` answers a viewer that is not a member session (`member:<id>`) `MEMBER_SESSION_REQUIRED` and reads nothing.

## J2 · REPORT

Every red my change makes outside my paths, named before my merge (P4), and what I found in other modules. Battery: `node --test bio-plane/test/m` on `job/T22/capture` @ 190400f9d9 vs `tranche/T22` @ 554e9dd826 (the same command in a worktree). Base: 4822 tests, 1 fail (test-support R2, `test-support.test.mjs`:249, the inherited environment red). Job: 4832 tests, 4806 pass, 6 fail, 20 todo; the test-support red passes here. The extra todo is capture-sources' R37 Memento todo, not a red. The six reds, every one caused by the folded requirements, none in my paths:

1. `test/m/sources/contract.test.mjs`:11 (R15) and `test/m/sources/source.test.mjs`:59 (R1 refusals): a reasonless `inboxResolve` (contract :30, source :63) now answers `RESOLVE_NO_REASON` (capture R32, C-118.7). sources' job passes a reason.
2. `test/m/sources/source.test.mjs`:9 (R1) and `test/m/sources/secret.test.mjs`:35 (R11): their fixtures knock or attempt more than 10 times in one 10-minute window at one instant, and DEC-108 (3)'s instance limit (capture R31, R48, R71) now refuses them `RATE_GLOBAL` (source.test's fixture throws "fixture knock refused"; secret.test's "an unknown entry" arm answers `RATE_GLOBAL` before `SECRET_NOT_RECOGNISED`). sources' job spreads its fixture knocks across windows (`now`), or passes `perIpLimit`/`globalLimit` to `knock` as `reads.test.mjs` does.
3. `test/m/control-plane/doorbell.test.mjs`:310 (R36, R26): the reasonless discard at :325, as your START predicted; it then expects `KNOCK_DISCARDED` and finds the knock still `new`.
4. `test/m/control-plane/catalogue-end.test.mjs`:15 (R43, R22): `rows-before-r43.json` pins a digest of each translation; six rows are re-worded by the folds (C-118.3 `KNOCKER_SECRET_WEAK`, C-85.1 `RATE_IP`, C-85.2 `RATE_GLOBAL`, C-85.3 `KNOCK_ENVELOPE_TOO_LARGE`, C-85.4 `KNOCK_PAYLOAD_TOO_LARGE`, C-85.5 `KNOCK_EMPTY`; capture R52, R37). control-plane re-takes those six digests under `changed.note`. It is not the row census, and its own red until then.

Outside `test/m`: `bio-plane/test/system/row-census.test.mjs` (promotion's) is red with exactly my nine rows (accepted red 3), all awaiting stamp: changed C-118.3, C-85.1–C-85.5; new C-118.7, C-118.8, C-118.9. `bio-plane/test/system/fleetbundles.test.mjs`: the plane's bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from my change under `bio-plane/src/capture/` (FAIL "bio-plane: no staleness"; the other three members pass). I regenerated nothing.

Not reds, but other modules' work my change makes due (the requirements say they are theirs):
- control-plane (L11): `inboxresolve` with `status: "pulled"` is routed to `inboxpull` → `inboxpullfile` (`src/control-plane/index.mjs`:702) before capture's `inboxResolve` is reached, so through the door the `pulled` arm's reason is never required or recorded (capture R32: "once its reason is admitted; the reason is recorded on the row with the pull"). The door must forward the reason or refuse a reasonless `pulled` resolve, and store it (capture's `inboxResolve` does both when it is reached). Also: `RESOLVE_NO_REASON` and the held acts' refusals carry `status` (400/403/404/409), which the door answers only for `inboxpull` and `NO_SUCH_KNOCK` today (:2734–:2739); and the door's `inbox` read should forward `sort` and `dir` (it forwards every query parameter today, so it works, but it has no declaration).
- op-declarations and affordances (L11, accepted red 5): new routes `doorbelltally` (viewer-stamped, member session), `gradenote` (viewer-stamped), `heldcaptures` (viewer-stamped), `heldsetaside` and `heldrestore` (mutating; `by` and `viewer` stamped; body `{ids, reason}`), and `doorbellrefused` (store-internal only: the Worker's count of a refusal it made before the store; it must not be a public op).
- instance-setup (L11, accepted red 6): `setup.mjs`:1338 posts `inboxresolve` with no reason; no instance-setup test drives it, so no red today.
- actions (L9): registers the litigation-hold reader with `capture.registerReader("litigation-hold", "actions", () => <boolean, synchronous>)`; ratification registers R78's examination with `registerReader("batch-examination", "ratification", (bundleId) => ({eligible: true} | {eligible: false, class, reason}))`, sync or async.

## J3 · COMPLETE

capture's T22 L3 job is done on `job/T22/capture` @ 0a1fd5e6a6 (its record commits after). Every entry applied; nothing deferred.

**Entries applied** (START B1; readings confirmed B2, K1032)
- (1) J1 (4), J2, DEC-88: `inboxResolve({knockId, status, by, reason})` refuses a reason that is absent, not a string, blank or over 2,000 characters `RESOLVE_NO_REASON` (C-118.7, 400), after `BAD_STATUS` and `NO_SUCH_KNOCK` and before any write; an admitted resolve records `resolve_reason` beside `resolved_by` and `resolved` (new `inbox.resolve_reason`, an additive column migrated forward); `pulled` runs the pull once the reason is admitted and records the reason with it; `pullKnock` asked directly takes none. The folded mark *(not yet met: T22)* on R32 is met.
- (2) DEC-108: R31's limits 5 per source and 10 in all in any 10 minutes, the stated sentences composed from them; R47–R52's words (C-85.1–C-85.5 and C-118.3 say the group can see how often its doorbell turns people away; C-85.1/.2 begin "Your material was not received."; the saturation sentence replaced; no figure); R53's order unchanged; R80's count-only tally (`doorbell_tally`, one row per UTC day with `refused` and `limit_reached`, 30 days kept; `doorbell_limit_last`, a date), counted for every R53 refusal (the Worker's own through the store route `doorbellrefused`, its failure ignored) and every R71 refusal, read by `doorbellTally({viewer})` / `op=doorbelltally` for a member session only; `inboxList`'s `sort` (`received` default, `status`, `secret`, `project`) and `dir`, paged, the required-argument refusal for an unknown one; R32's litigation hold: `registerReader("litigation-hold", …)` and `mayClearDiscarded()`, which allows clearing only when the registered reader answers `false`.
- (3) DEC-95 (1): R76 `gradeNoteOf({captureSha, viewer})` / `op=gradenote`.
- (4) DEC-97: R77 `heldCaptures` / `op=heldcaptures`; R78 `registerReader("batch-examination", …)`; R79 `setAside` / `op=heldsetaside`; R81 `restoreHeld` / `op=heldrestore`, over the append-only `held_acts` (purged whole-store); rows C-118.8, C-118.9. Readers' slots refuse a second registration through membership's `listenerRefusal`.
- (5) K1020: R56's test is deterministic: it asserts the fingerprint is exactly HMAC-SHA-256 under a bound key, with another key as its negative control, in place of the chance `!f1.includes("198")`.
- Re-scan: two notes in `schema.mjs` named `store.mjs` as live (CAP-13's join, D-492's additive pass); re-pointed to this module. The notes in `cap13-reuse-pages.test.mjs` and `d57selflink.test.mjs` naming `store.mjs` are dated provenance (negative-control runs), kept.
- Size: 3,419 lines (from 3,002), under 4,000.

**Rows awaiting stamp** (row census, accepted red 3): changed C-118.3, C-85.1, C-85.2, C-85.3, C-85.4, C-85.5; new C-118.7, C-118.8, C-118.9.

**Found in other modules**: in J2 (REPORT): six reds in sources' and control-plane's tests, each by name with its cause; the plane bundle stale; control-plane's routing of `inboxresolve` `pulled` to `inboxpull` bypasses the reason; the new ops for op-declarations/affordances; `doorbellrefused` must stay internal.

**Tests and checks**
- `node --test bio-plane/test/m/capture/ bio-plane/test/cap13-reuse-pages.test.mjs bio-plane/test/d57selflink.test.mjs`: tests 114, pass 114, fail 0. New suites `inbox.test.mjs` (R32, R37, R53, R71, R80) and `held.test.mjs` (R76–R79, R81), each with negative controls (a sixth knock refused, a reasonless resolve refused and nothing written, an admitted knock not counted, a 2,000-character reason admitted).
- Users' suites: `test/m/extraction` 171 pass 0 fail; `test/m/monitoring` 73 pass 0 fail; `test/m/sources` 20 pass 4 fail; `test/m/control-plane` 100 pass 2 fail (the six reds named in J2).
- Whole `bio-plane/test/m`: 4832 tests, 4806 pass, 6 fail (only J2's six), 20 todo; base 4822, 1 fail (test-support R2, environment).
- `node checks/format.mjs`: 0 failures; `architecture.mjs … capture`: 0 failures; `coverage.mjs … capture`: 54 of 54 live ids named, 0 failures; `ownership.mjs … capture tranche/T22`: 12 files, 0 failures.

Size (session_01WP7uNR1V8GPqjyrKhjKhiS): test runs 24, module lines 3419
