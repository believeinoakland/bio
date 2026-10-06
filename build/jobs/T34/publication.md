# publication (T34)

**Status** · session_018fH9gcTb8rPoU4TBHkufJK · depth 2 · COMPLETE · handled B3

## Work (T34-44, T34-79)

**For `modules.json` (BOB writes at merge).** `paths`, `tests` and `uses` unchanged (`civil-time` and `jurisdictions` already added by K1821). One file added under my paths: `bio-plane/src/publication/schedule.mjs`.

**Applied.**
- T34-44 (N597): `publicationOps` no longer spreads `caseTensionsOps`; the plane's op map spreads it itself (`plane/store.mjs`:484, since T33-90). This module's test fixture and the door test now build the op map as the plane does. The delegates for the moved names stay (T35).
- R64 `stampedEditions()`: one read of `edition_stamps` in case, edition and stamp order, grouped per edition, each edition's `stamps` built exactly as `stampsOf` builds them; never throws.
- R65 `publicGroupDescription()`: `membership.groupDescription({viewer: null})` (R110's public answer), re-shaped to the four texts only, `{description: null}` otherwise and on any throw. No op added: which surface reads it is public-read's and network-notices' (Suggestions).
- R66–R71 (`schedule.mjs`, methods of the same names on `Publication`): table `scheduled_editions` (one row per setting, `seq` its order, at most one `waiting` per case edition; the signature held there, never on the document). `scheduleEdition` (R66) with its refusals in R66's order, preceded by `MALFORMED` for a call missing the case, edition, `docSha` or signature; the zone is `jurisdictions.combine` over record-core's `jurisdiction_profiles`, `time_zone.value`; the instant is `civil-time.bounds({value: "<date>T<time>", precision: "minute", zone}).earliest`. `publishWake`, `publishDue(now)` and `registerScheduledPublisher` (R67; K31's pattern, `PROVIDER_DECLARED`/`PROVIDER_MALFORMED` as R23 and R62). `publishAtMove`, `publishAtCancel` (R68; ops `publishatmove`, `publishatcancel`, `by` the control plane's stamp, the rest from the body). `scheduledEditions` (R69; op `publishschedule`, whose absent `viewer` stamp is read as no standing, never as the plane). R70, R40 (B2, K1826): two columns on `published_cases`, `signed_at` and `published_at`, written by `commitCaseEdition` (the waiting edition's signing instant when one waits at that case edition, else the commit's instant; the commit's instant), and filled once at boot for a row written before T34 with `COALESCE(ratified_at, its signed document's ratified_at, opened)` in both, so neither is null; answered in R53's `document` and R1's answer. R21: `storeCaseDocument` and `reauthorSection` leave a waiting document as it is. R71 `onPublishScheduled` through `membership.listenerRefusal`.
- Also exported for `ratification` R44: `groupZone()`, R66's zone read, so the ceremony's offer and the set time read one zone.

**Technical decisions (BOB's to record in rulings, P17; made here on my best reading).**
0. (B3, K1832) `publishDue` is async: it awaits each publisher answer (a value or a Promise; a rejection is a throw) before taking the next edition, re-reads that the row still waits before handing it, and keeps the editions being awaited in a per-instance set, so an alarm overlapping one still awaiting never hands the same edition twice. The entry handed carries R66's record, its held `signature` included (stored in the column `sig_armored`).
1. `publishDue` decides a taken edition's outcome from what the store holds: `published` only when the case document is signed at the waiting `doc_sha` after the publisher returns (R22's commit happened), whatever the publisher answered; otherwise `stopped`, with the publisher's `stopped` list (its entries kept as given: `code`, `translation`, and `check`, `cause` when present) or, for no publisher, a throw, or any other answer, `SCHEDULED_CHECK_UNAVAILABLE`. So a publisher that claims `published: true` without committing cannot mark an edition published, and "never published unchecked" holds. The publisher's commit runs in its own transaction (ratification R42); `publishDue` does not wrap it.
2. Due is compared as instants (`Date.parse`), so a `now` spelled with milliseconds is read correctly.
3. R71 after R66: R66 runs inside the caller's transaction, so its notice is queued as a microtask, which runs after the synchronous transaction and reads `publishWake()` as it then stands (a rolled-back setting is told the wake without it). After R68 and after each edition R67 takes, the notice is synchronous after this module's own transaction, once per act (once per edition taken).
4. R68's `MACHINE_CANNOT_SCHEDULE_PUBLISH` is a machine credential (`class:*`) or a `by` that names no one; the founder is no machine and owns no project, so it is `NOT_A_CASE_OWNER` (after `NOT_WAITING`). `NOT_WAITING` without standing (R1's `hasCaseStanding`) is byte-identical to none waiting; with standing it names the state, `waiting` with "its time has come" once `publish_at` has passed.
5. Purge (R29, R31): `scheduled_editions` is declared cleared by the whole-store form where `state <> 'published'`, sight `group`; a published row is kept (it holds when the edition was signed). Its waiting row goes with the unsigned document it holds a signature for.
6. R69's cursor is `<publish_at>#<seq>`; an unknown `state` is `MALFORMED`.

**Deferred.** R30 (D-246), as before (its test is a `todo`). Nothing else.

**Other modules (for BOB).**
(a) `SCHEDULED_CHECK_UNAVAILABLE` (R67) carries a translation and no catalogue row: R33 lists no row for it and DEC-49 wants one. I wrote the member's sentence ("This edition was not published at its set time, because the checks it needed then could not be run. Nothing was published. Sign it again to publish it."); if it should be a row (C-122.5 here, or ratification's C-58 family), that is a requirement change, BOB's wording.
(b) `public-read` (T34-46, its R29): R70's two instants are `published_cases.signed_at` and `.published_at` (R40, K1826), never null, and in R53's `document`. R64 is ready for its R28 index.
(c) `ratification` (T34-85): R40 calls `scheduleEdition` inside its transaction; R43 registers with `registerScheduledPublisher`; R44 can read `groupZone()`. The publisher gets `entry = {case, edition, project, state, signer, set_by, signed_at, at, publish_at, moves, outcome_at, reasons, doc_sha, signature, delivered_by, checked}`; `commitCaseEdition` does not itself refuse a waiting edition, so `op=caseratify` on a waiting edition must answer `PUBLISH_AT_ALREADY_SET` (its R3) or it would publish now.
(d) `scheduler` (T34-51, its R22): `onPublishScheduled(module, fn)`, `fn({publishAt})`; `publishDue(now)` answers a Promise of `{ok, taken: [{case, edition, state, published_at | reasons}]}`.
(e) `op-declarations` (T34-83), `admission`/`control-plane`, `affordances` (R42): the new ops are `publishatmove`, `publishatcancel` (body `{case, edition, at?}`, stamp `by`) and `publishschedule` (query `case`, `state`, `after`, `limit`, stamp `viewer`).
(f) `queue-producers` (T34-82, its R37): `scheduledEditions({...})` with no `viewer` reads as the plane.
(g) Generated artifact staled: `bio-plane/dist/bio-plane.bundled.mjs` (this module's source changed).

**Tests and checks.** `node --test bio-plane/test/m/publication/`: 113 tests, 112 pass, 0 fail, 1 todo (R30). New `t34.test.mjs` (15 tests: N597, R64, R65, R66 ×2, R21, R67 ×3, R68 ×2, R69, R70 with R40, R71, R31 with R66); `fixture.mjs` and `door.test.mjs` build the op map as the plane does (N597); `invariants.test.mjs` names the new table. Dependent suites (docket, public-read, project-stage, network-notices, ratification, case-disclosures, case-authoring, review, conformance, filings, monitoring, affordances, queue-producers, control-plane, plane, system migrate-released), on this branch after merging `tranche/T34` @ 91a71abdab and on the tranche itself: identical, the tranche's own reds only (filings 1, monitoring 1, affordances 3, control-plane 2, plane 1; all inherited, none naming publication). No layer tests in the manifest. From the process repository: format 127 modules, 0 failures; architecture 0 failures; coverage 47 of 47; ownership 8 files, 0 failures.

Size (session_018fH9gcTb8rPoU4TBHkufJK): test runs 20, module lines 3579

## J1 · REPORT

Found by T34-44/T34-79 (full text: my record, Work, 'Other modules'):
(a) SCHEDULED_CHECK_UNAVAILABLE (R67) has a member translation but no catalogue row; R33 lists none. If it should be a row (C-122.5 here, or ratification's C-58), that is BOB's wording.
(b) public-read (T34-46): R70's instants are published_cases.signed_at/.published_at (never null, K1826) and in R53's document; R64 stampedEditions() ready for its R28.
(c) ratification (T34-85): scheduleEdition inside its transaction; registerScheduledPublisher (publishScheduled may return a Promise, K1832); groupZone() for R44. commitCaseEdition does not itself refuse a waiting edition, so op=caseratify on one must answer PUBLISH_AT_ALREADY_SET (its R3) or it would publish now.
(d) scheduler (T34-51): onPublishScheduled(module, fn) -> fn({publishAt}); publishDue(now) answers a Promise of {ok, taken}.
(e) op-declarations / admission / control-plane / affordances: new ops publishatmove, publishatcancel (body case, edition, at; stamp by), publishschedule (query case, state, after, limit; stamp viewer; absent viewer answers none).
(f) queue-producers (T34-82): scheduledEditions({...}) with no viewer reads as the plane.
(g) Generated artifact staled: bio-plane/dist/bio-plane.bundled.mjs.

## J2 · COMPLETE

T34-44 and T34-79 complete, B2 (K1826) and B3 (K1832) applied; pushed job/T34/publication. N597 spread dropped; R64 stampedEditions; R65 publicGroupDescription; R66-R71 in publication/schedule.mjs (table scheduled_editions, ops publishatmove, publishatcancel, publishschedule); R21's waiting clause; R70/R40 columns on published_cases, filled by migration. publication 112 pass, 0 fail, 1 todo (R30); dependents identical to tranche/T34 @ 91a71abdab. format 0; architecture 0; coverage 47/47; ownership 8 files, 0. modules.json unchanged. Deferred: R30 only. Size (session_018fH9gcTb8rPoU4TBHkufJK): test runs 20, module lines 3579. Record: build/jobs/T34/publication.md.
