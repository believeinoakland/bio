# op-declarations (T22)

**Status** · session_01Vis1UcRpppUp59WfiJjKP4 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

The NEEDS row of T22's five new reads decides affordances' R12 totality (a gated op must be in NON_ACTS; a NON_ACTS key not gated is stale), and neither my R9 nor affordances' requirements say which shape each read takes. My reading, which I am building now, by the precedent each START line names:
- `heldcaptures`, `gradenote`, `doorbelltally`: a PRESENT `null` row, as capture's other reads (`knocksof`, `pulledknocks`, `lateattestations`, `captureaccounts`, N364) — so affordances names each in NON_ACTS ("read: …").
- `escalationstatus`: NO row, as `escalationsdue` (and `escalation`) — so affordances does not name it in NON_ACTS.
The five mutating ops (`declinetoescalate`, `heldsetaside`, `heldrestore`, `addressfrequencyset`) each `contribute`, so affordances ranks each (its R2 lists them) and publishes each in ACTS or NON_ACTS.
If affordances' job reads it otherwise, tell me which and I change the rows; it is a one-line change on either side. I carry on meanwhile.

## J2 · QUESTION

Progress, and one thing I need. My entries are built and pushed (`0e9ee15e90` on `job/T22/op-declarations`): R9's eight specs, their lists, both session sets, NEEDS as B2 confirmed; R9 tests added; `test/m/op-declarations/` 25 pass, 0 fail; the four checks 0 failures (coverage 9 of 9). Full `bio-plane/test/m` against a `tranche/T22` baseline run beside it: 4958 tests, 10 fail; the one red not in the baseline is control-plane's `totality.test.mjs`:16, listing exactly my new ops (unpublished: addressfrequencyset, declinetoescalate, doorbelltally, gradenote, heldcaptures, heldrestore, heldsetaside; unranked: the four mutating ones), which clears when affordances' work lands.
What I need: affordances' branch carries no work yet (only its start commits, `854a176c69`), so I cannot yet do your step (2), merging it into a scratch copy of mine and running both totalities green, which you asked for before my REPORT. Wake me (an ANSWER or CHANGE) when affordances has pushed its work; I then run the joint check and post the REPORT. If you'd rather have the REPORT now with the joint check left to merge time, say so.

## J3 · COMPLETE

**Entries applied** (B1; commit `0e9ee15e90`, `bio-plane/src/op-declarations/index.mjs`, `bio-plane/test/m/op-declarations/tables.test.mjs`). R9 met, by name:
- `declinetoescalate` as `escalationopen` (admin, member, probe; mutating) in `ESCALATION_ACTIONS`, so `author` (`QUERY_AUTHOR_ACTIONS`) and `viewer` (`ACTION_LAYER_ACTIONS`) are stamped; `escalationstatus` as `escalationsdue` (a read) in `ESCALATION_READS`, `viewer` stamped (`ACTION_LAYER_READS`).
- capture: `heldsetaside`, `heldrestore` (admin, member, probe; mutating) in `CAPTURE_MEMBER_ACTIONS` (`by` stamped by control-plane's existing statement) and a new `CAPTURE_VIEWER_ACTIONS` (`viewer`); `heldcaptures`, `gradenote` (reads, admin, member, probe) and `doorbelltally` (`classes: ["admin","member"]`, `machineClasses: []`, as `knocksof`) in a new `CAPTURE_READS` (`viewer`).
- monitoring: `addressfrequencyset` (admin, member, probe; mutating) in a new `MONITORING_ACTIONS`, joined into `QUERY_AUTHOR_ACTIONS`, so `author` and `viewer` are stamped by control-plane's existing statements.
- All eight in both `SESSION_OPS` sets; `NEEDS` `contribute` for the four mutating, a present `null` for the three capture reads, no row for `escalationstatus` (B2, K1105). Nothing declared for `doorbellrefused` (comment beside the capture specs, R6), `escalationreasondraft` or T23's skills ops.
- (3) Re-scan: no note in my paths names a T20-deleted file, `tools/`, `legacy-tests` or the deleted plane `index.mjs` as live; the header's "came from legacy-index" and the citations in `UNATTENDED_BY_DECISION` (`src/store.mjs`, `src/control-plane/...`) are provenance and stay. Header now says R1–R9.

**Tests:** four R9-named tests with negative controls (spec drift, unstamped op, `doorbellrefused` added to a table is seen); R4's composition updated for `MONITORING_ACTIONS`. `node --test bio-plane/test/m/op-declarations/`: tests 25, pass 25, fail 0. R1's gate and R5's frozen data tests unchanged and green.

**Whole `bio-plane/test/m`** (users' suites `test/m/admission/` and `test/m/control-plane/` inside it), beside a `tranche/T22` baseline run: tests 4958, pass 4936, fail 10, todo 12. The only red not in the baseline: control-plane `totality.test.mjs`:16 (unpublished addressfrequencyset, declinetoescalate, doorbelltally, gradenote, heldcaptures, heldrestore, heldsetaside; unranked the four mutating), accepted red 5 (B3, K1106) until affordances merges. The other nine are carried by name: control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310; accepted red 4 (membership `module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58); queue-producers `proposals.test.mjs`:39 (4 tests). The joint totality with affordances' branch is left to merge time (B3).

**Checks** (process repo): format `86 modules, 85 requirements files; 0 failures`; architecture `4 product files, 7 relative imports (1 naming no tracked file, not judged); 0 failures`; coverage `1 modules, 9 of 9 live requirement ids named by a test; 0 failures`; ownership `3 files changed by op-declarations between tranche/T22 and HEAD; 0 failures`.

**Found in other modules / for BOB (REPORT):**
- control-plane (its L11 job): `CAPTURE_VIEWER_ACTIONS` and `CAPTURE_READS` are new exports; control-plane's `viewer` stamp condition (`control-plane/index.mjs`:1285 region) must name both, since capture's map reads `viewer` for all five (`capture/index.mjs`:2270–:2277) and an unstamped call sees nothing. Every other new stamp rides lists control-plane already reads (`QUERY_AUTHOR_ACTIONS`, `ACTION_LAYER_*`, `CAPTURE_MEMBER_ACTIONS`). It also routes the eight ops (accepted red 5).
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from my change under `bio-plane/src/op-declarations/`; regenerated nothing.
- `build/requirements/op-declarations.md` R9 still carries `*(not yet met: T22)*`; it is met.

**Deferred:** none.

Size (session_01Vis1UcRpppUp59WfiJjKP4): test runs 5, module lines 2399
