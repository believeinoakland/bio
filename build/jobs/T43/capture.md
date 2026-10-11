# capture (T43)

**Status** · session_012qi9yvQTQeqGH156Kzdsx8 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

N849's user check found one live user of the doorbell copy not re-pointed: `admission`'s `src/admission/window.mjs`:82 builds its door window's fingerprint as `captureOf(ctx).sourceFingerprint(address)` (capture's retired R56, now doorbell R12), and `plane/store.mjs`:390 calls `admissionOf(ctx)` with no `deps.fingerprint`, so the plane's public-door window (admission R21, `doorwindow`, every public op's count and `sourceOf`) reaches it. Deleting it whole makes every stated-address `doorwindow` call throw from L3 until admission re-points. No other user remains: `git grep` over `bio-plane/src` finds no other import of `capture/doorbell.mjs`, `KNOCK_CHECKS` or the copy's methods (sources, actions, store-door, plane, answer-envelope re-pointed in T42; `answer-envelope/families.mjs` reads `capture/checks.mjs` as a family file, which stays).

Options: (a) delete it with the rest, and accept admission's window red from T43-8 until an admission entry re-points it to `doorbellOf(ctx).sourceFingerprint` (admission gains `uses: doorbell`; a T43 L11 entry or the plane's composition handing `deps.fingerprint`); (b) K625's pattern: capture keeps `sourceFingerprint` and its key read (`#knockKey`, over `knock_key`, the same DDL doorbell creates; not declared by capture, since doorbell declares it) as a named held copy answering no requirement, deleted by capture's next job once admission has re-pointed.

My best reading, which I am building meanwhile: (b), since (a) breaks the public door, not only a test, and K625 is the stated pattern for a delete a later layer's user still needs. Everything else of the copy is deleted. Say (a) and I drop the two methods.

## J2 · REPORT

T43-8 built and pushed on job/T43/capture (B2's (b) applied, comment names K2708, N870): the doorbell copy deleted (doorbell.mjs, KNOCK_CHECKS and C-118.2/.3/.4/.7, the six tables and the inbox columns, the copy's methods, routes and the litigation-hold slot), sourceFingerprint and #knockKey held; R58 compares an option only when supplied; R87 declares only when every table exists. Capture's tests 124/126: the two reds are plane.test.mjs (whole plane), because doorbell/checks.mjs still imports capture's KNOCK_CHECKS and moved rows until T43-7's first merge. format, architecture, coverage (40/40), ownership: 0 failures. Waiting for doorbell's first merge on tranche/T43, to merge it and run my users' tests before COMPLETE.

## Record: T43-8 (N849, N863, N864)

**Read.** B1 START, B2 ANSWER, B3 CHANGE. Read whole: `build/requirements/capture.md`; every file under `src/capture/` and `test/m/capture/`, and `test/cap13-reuse-pages.test.mjs`, `test/d57selflink.test.mjs`; the plan's rules and L3 entries; `draft-T43-cleanup.md` §0, §N849, §N863, §N864; K625, K2607, K2672, K2680, K2689. The used modules' public parts (400 KB, over K2700's limit with my own set) were read whole by one helper in this session, which wrote a digest of what these entries need, each statement citing its section (mechanics §17 (3)); the sources stayed binding. Its findings matched what the code showed.

**Entries applied.**
- N849, R37: the doorbell copy is deleted: `src/capture/doorbell.mjs`; `KNOCK_CHECKS` and C-118.2, .3, .4, .7 from `checks.mjs` (capture's table holds C-118.1, .5, .6, .8, .9, .10; next free C-118.11); the six doorbell tables and the `inbox` additive columns from `schema.mjs` and from `CAPTURE_EXEMPT_TABLES`; the copy's store side (knock, rate, tallies, inbox, pull, knocker secret, `knocksOf`, `pulledKnocksOf`, `mayClearDiscarded`), its constants, the `litigation-hold` reader slot and its nine routes. The user check (`git grep` over `bio-plane/src`) found one live user, admission (J1).
- Held (B2, K2708; N870 deletes it in T44): `sourceFingerprint` and `#knockKey` in `index.mjs` (the block "THE HELD COPY"), because `admission/window.mjs`:82 reaches `captureOf(ctx).sourceFingerprint` until T43-21. They answer no requirement and declare no table; `#knockKey` creates `knock_key` with doorbell's DDL only when absent.
- N863, R58: `captureOf` compares `record`, `provenance`, `attestation` and `acquisition` only when the caller supplies them, so a call supplying none reaches no other module's instance and creates no table.
- N864, R87: `declareTables()` declares only when every capture table exists (`sqlite_master`), else answers `{ok: true, module: "capture", declared: false}` and declares none.
- Tests: `knocker.test.mjs` R37 (moved rows absent, by code, number and raiser; control: capture's six present), `evidence-absent.test.mjs`:26–29, `t42.test.mjs` rewritten (before migrate none declared; one table missing none; after, every table; negative control on `task_queue`), new `t43.test.mjs` (R58; control: a different `acquisition` still throws). `plane.test.mjs`'s knock test deleted (doorbell's). Negative controls run: the old R58 loop and the old `declareTables` each fail their new tests.

**Deferred.** The held copy, to N870 (T44), by B2.

**Found in other modules (REPORT in J3).** Each is red from this merge and green on `tranche/T43` before it; all test-visible except as said.
- admission `test/m/admission/harness.mjs`:189 cuts the `knock_key` DDL out of capture's `CAPTURE_DERIVED_SCHEMA`, now absent: 5 R21 tests red (`window.test.mjs`, `t38`). Product code unaffected (the held copy creates the table). Clears with T43-21 if its harness takes doorbell's schema.
- case-disclosures `fixture.mjs`:260 and case-authoring `fixture.mjs` insert into `inbox`, which capture's migrate no longer creates: 4 red each (case-disclosures R4, R7, R9/R10, R23; case-authoring R34, R55 ×3). The fixtures need doorbell's tables (`doorbellOf`), not capture's.
- control-plane `envelope.test.mjs`:391 pins `NO_SUCH_KNOCK` in capture's table: 1 red, rule 4 (9)'s cause (doorbell's family read from T43-14).
- doorbell: its ownership arm now holds; `instance.test.mjs` "a running store's inbox, keys and tally are kept … capture's rows are doorbell's rows" is red (1, as before by count): doorbell's second merge (T43-7 again).

**Tests.**
- capture: 125 pass, 0 fail; `cap13-reuse-pages` 22/0; `d57selflink` 24/0.
- Rule 4 (8): action-clocks `overdue` and action-plans `invariants` 12 pass, 0 fail (cleared).
- Users (30): doorbell 68/1; file-safety 53/0; sources 30/0; extraction 150/0; connections 119/0; observation-log 77/0; standards 78/0; retrieval 175/0; inquiry 205/0; capture-requests 108/0; case-tensions 23/0; network-notices 73/0; ratification 232/1 (inherited); case-disclosures 91/4; case-authoring 180/4; monitoring 124/0; following 50/0; link-sweep 29/0; scheduler 129/0; affordances 231/1 (inherited); tasks 106/0; machinery-producers 24/0; setup-page 83/0; instance-setup 135/0; op-declarations 125/8 (inherited); admission 36/5; answer-envelope 25/5 (rule 4 (9), accepted); store-door 44/0; control-plane 222/1; plane 185/0. "Inherited" means the same count red on `tranche/T43` without this change.

**Checks** (process repository, after the merge of `tranche/T43`): format 0 failures; architecture capture 0; coverage capture 40 of 40, 0; ownership capture `tranche/T43` 0.

Size (session_012qi9yvQTQeqGH156Kzdsx8): test runs 14, module lines 3227

## J3 · REPORT

Reds my merge makes in other modules (green on tranche/T43 before it); all test-visible but admission's, which is too: (1) admission test/m/admission/harness.mjs:189 cuts knock_key's DDL from capture's CAPTURE_DERIVED_SCHEMA, now gone: 5 R21 tests red; the held copy creates the table itself; fix with T43-21 (doorbell's schema). (2) case-disclosures fixture.mjs:260 and case-authoring fixture.mjs insert into inbox, which capture's migrate no longer creates: 4 red each; their fixtures need doorbellOf's tables. (3) control-plane envelope.test.mjs:391 pins NO_SUCH_KNOCK in capture's table: 1 red, rule 4 (9)'s cause, until T43-14. (4) doorbell instance.test.mjs 'a running store's inbox … capture's rows are doorbell's rows' red (its ownership arm now holds): for doorbell's second merge. Inherited, same on the base: ratification 1, affordances 1, op-declarations 8.

## J4 · COMPLETE

T43-8 complete on job/T43/capture (tranche/T43 with doorbell's first merge merged in): N849 delete with K2708's held copy, N863 R58, N864 R87. capture 125/0, cap13 22/0, d57 24/0; rule 4 (8) cleared (12/0); users' results and the four reds this merge makes are in the record and J3. Checks: format, architecture, coverage 40/40, ownership: 0 failures.
