# reevaluation (T8)

**Status** · session_01NGonW6u7AxdGRxu9HsKZwZ · depth 2 · WORKING · handled B2

## J1 · QUESTION

R25 and R18: "pending … when a receipt has been written (`provenance.onReceipt`) since the last complete pass began". To know that across a Durable Object's eviction, the `onReceipt` listener must leave a durable mark; R18 lists what this module writes as "R25's pass position (where the pass stands and when the last complete one began)". My reading: that mark is part of the pass position. I store one row, `reevaluation_sweep` (declared to purge with `keys: []`, whole-store only): the cursor, when the running pass began, when the last complete one began, and a receipt counter the listener increments, with the counter's value at each pass's start; pending is then exact (no same-second ambiguity between two instants). No receipt content is stored. If you read R18 as forbidding the counter, the alternative is that a receipt restarts the pass from the top (only the position is written), which can starve the tail of the leg order under steady receipts; I recommend the counter. I am building on this reading.

Also for R25's binding: the instance's `env` reaches reevaluation only through legacy-store's construction call, so I change `store.mjs` 728 `reevaluationOf(ctx);` to `reevaluationOf(ctx, { env });` (§12.2 rewiring, a use of the imported name) and drop the stale "reevaluation's obligation (R21, R25) and" from the comment above it (a removal), keeping the legacy net change a removal.

## Completion

**Entries applied.**
- N200 (R14, K224): `notices` answers a notice's `newer_capture`, `grade` and `affects` as null (and `newer_bundle` as null, as before) to a viewer who sees no bundle registering the newer capture, the gate `versionChain` reads the chain through (so `op=versionnotice` and `op=reevaluationnotices` withhold the same version). A machine credential sees all; a project participant sees it.
- N182 (1): C-110.1–C-110.5 name `#choiceSubject > is-version-choice`, where the region is. C-110.9 (`VERSION_ADOPT_UNWRITABLE`) named the same region wrongly; it now names `adoptVersion > is-version-adoptable`, a region marked around its refusals there.
- N182 (2): `#records` reads only the (dependent, target) pairs one answer lists, the latest record per (dependent, target, source) (`MAX(record_id)`, equal to the latest `since` because a record is only written for a cause still owed), `LIMIT` pairs × cause sources; `reevaluations` now collects its obligations, reads their records once, then splits. `raiseNotices`' divided-holder read carries `LIMIT` at the holders' count.
- N182 (3): a test drives `op=reevaluationnotices` through `reevaluationOps`: default 200, clamped 1–1,000, `truncated`, `cursor`, paging on.
- N182 (4): `adoptVersion`'s fallback is judged: basis-versions' refusal passes through as a declared refusal (`ok: false`, the notice named); no answer is C-110.9 through `#refuse`. Both write nothing and leave the notice open (tested). It has left meaning-bounds' LOST BY WIDENING list.
- N178 (R25, K228, K237): `noticeSweep(now)`, `noticeSweepDue(now)`, `noticeSweepWake(now)`, `REEVAL_NOTICE_DELAY_MS` (1,000, or the `REEVAL_NOTICE_DELAY_MS` binding when ≥ 0). The pass position is one row, `reevaluation_sweep` (purge-declared `keys: []`): cursor, when the running and the last complete pass began, and the receipt count, counted by an `onReceipt` listener (provenance R47) registered at construction. Due and wake are synchronous, write nothing, never throw. `store.mjs`' construction call passes `env` (J1, B2).

**Deferred.** Nothing.

**Found in other modules / stale artifacts** (REPORT J3).
- legacy-tests: `derivation-bounds` 69/4 → 68/5: the census falls 209 → 207 (`#records`, `raiseNotices` bounded) and `reevaluation/index:raiseNotices` leaves the SET 2 / CENSUS-BLIND pin (15 → 14): departures by fix, to re-pin. `bounds` 203/3 unchanged: its PIN still wants `reevaluationnotices` driven in that suite (my interface test now exists). `gate-reads` 114/1 unchanged: `reevaluationnotices` is unclassified there (with intent's `aspirationcontacts`, `pursuit`, `intentproposals`). `meaning-bounds` 94/2 unchanged in count; `adoptVersion[silent]` left its LOST list.
- `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale by `src/reevaluation/` and `store.mjs` 726–727; BOB regenerates at the close.
- scheduler (layer 10): R25's services are on the instance (`reevaluationOf(ctx)`); `noticeSweep` is synchronous and returns `raiseNotices`' answer or `{pending: false}`.

**Tests and checks.**
- `node --test bio-plane/test/m/reevaluation/`: tests 39, pass 39, fail 0 (new: `sweep.test.mjs`, 9). Negative controls: withholding removed → 1 fail; the receipt count made a no-op → 2 fail; restored green.
- Old battery naming this module, base `tranche/T8` vs this branch: identical in 30 files (e.g. reevaluation 74/0, versionnotice 41/0, versionchain 116/0, gate-reads 114/1, bounds 203/3, meaning-bounds 94/2, hygiene 1333/2); differs only in derivation-bounds (above).
- format: 69 modules, 64 requirements files; 0 failures. architecture: 10 product files, 40 relative imports; 0 failures. coverage: 25 of 25 live requirement ids named by a test; 0 failures. ownership: 7 files changed; legacy-store 2 added, 3 removed (726 the comment folded to one line, 727 `reevaluationOf(ctx, { env })`); legacy-checks 0/0; 0 failures.

Size (session_01NGonW6u7AxdGRxu9HsKZwZ): test runs 16, module lines 2736
