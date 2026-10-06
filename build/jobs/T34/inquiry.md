# inquiry (T34)

**Status** · session_01Wskzz89u9YtWxzo9XZyHmv · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two points; I carry on with my best reading of each.

1. **Uses.** `build/requirements/inquiry.md` (T34's fold) says Uses gain `capture` (R58) and `calculations` (R11; T33-45, T34-29), but `build/modules.json`'s `inquiry.uses` lists neither, so `checks/architecture.mjs` will refuse my imports of `../calculations/index.mjs` and `../capture/index.mjs`. Best reading: you add both to `inquiry.uses` on `tranche/T34` (both are earlier in the order: capture L3, calculations L5). I code the imports now and merge `tranche/T34` when you have.

2. **R58's bound "at most 200".** Best reading: a call naming more than 200 ids is refused whole (`ok: false`, reason `TOO_MANY_QUESTIONS`, naming the bound), never narrowed to the first 200, since a project's list that reads silently cut would hide a wait. Duplicate ids are answered once. Answer only if you read it otherwise.

## Completion

**Entries applied.**
- **T34-29 (N576, N596; R11).** A `CALC-` leg (either form `idPattern("CALC")` reads) is no longer refused as unconfirmable: it is read synchronously through `calculations.calcStatusOf({calcId, viewer})` (its R31), `viewer` the promotion's author. Not held or not visible: `NO_SUCH_CALCULATION` inside `BASIS_REFUSED`, the two answered identically (DEC-36). Held, visible, not accepted: `CALCULATION_NOT_ACCEPTED`. Accepted: passes. A read that throws, answers another shape (any of the three not a boolean, a promise included) or cannot be reached: `CALCULATION_NOT_ACCEPTED` (fail closed, K1601). `calculations` is reached through `deps` or `calculationsOf(host)` on first use.
- **T34-29 (N587, DEC-141; R58).** `documentWaits({questions, viewer})`: per visible inquiry id (deduplicated, in the order asked; more than 200 refused whole, `TOO_MANY_QUESTIONS`, B2), `waits` (`{document, by, reason, at}` per document whose latest act recorded with the question is a set-aside and is set aside now, oldest first) and `history` (every set-aside and restore, in order), read whole through `capture.heldActsOf` page by page (1,000 per page, at most 50 pages, beyond which it answers undetermined). An ending state answers `ended` with its history and no wait; an unreadable capture read answers `undetermined` with why; no viewer answers nothing; an invisible or non-inquiry id is left out as absent. Writes nothing, raises nothing, tells no scheduler or notice-producer. `capture` is reached through `deps` or `captureOf(host)` on first use. No op is routed for it (R58 names none; routing is control-plane's).
- **T34-29 (N582; R4, this module's share).** A derived connection's id (64 lowercase hex) is never written into a child's `references[]` by a division, and the division's fallback leg rebuild carries the five `derivation_*` fields. The leg's form is `inquiry-grammar` R17's.
- **T34-86 (DEC-149).** `index.mjs` R55's undetermined `why` now says "no time zone is held for your group's Civicsmith, …" (was "this instance's profile"); a test names the whole string.

**Improvement in my own module.** The division's fallback leg rebuild (`legRebuilt`, used only when a replayed parent's basis block cannot be lined up with its legs) dropped a standard leg's `target_portion`; it now carries it, with the derivation fields. Not separately tested (the path needs a malformed replayed shape); deferred: a test for it, in a later job.

**Waiting on upstream.** Two tests of `derived-legs.test.mjs` (R4's derived leg admitted and projected; carried by a division) are red until `inquiry-grammar` merges its R17: today its target arm refuses the 64-hex id as "not a canonical record id". They are written against its approved requirements (B1: inquiry merges after inquiry-grammar). The id is computed in the test as `connection-grammar.derivedId` computes it (checked equal), since `connection-grammar` is not in inquiry's Uses.

**Found in other modules.** `bio-plane/dist/bio-plane.bundled.mjs` (generated, `not_product`) is stale against this module's source (it still carries the old calculation refusal); BOB regenerates it at layer close (mechanics §14).

**Tests and checks** (after merging `tranche/T34` at B2):
- `node --test bio-plane/test/m/inquiry/`: tests 176, pass 173, fail 2 (the two upstream-waiting R4 tests above), todo 1 (R31, MK-5, unchanged).
- Users of inquiry, run as a regression: citation 55/0, basis-versions 127/0, strength 138/0, contradiction 119/0, hypotheses 14/0, reevaluation 135/0 (pass/fail).
- `format`: 0 failures; `architecture inquiry`: 0 failures; `coverage inquiry`: 49 of 49 live ids named, 0 failures; `ownership inquiry tranche/T34`: 0 failures.

Size (session_01Wskzz89u9YtWxzo9XZyHmv): test runs 16, module lines 3294

## J2 · COMPLETE

T34-29 and T34-86 applied; details in my record's Completion section. R11: `CALC-` legs read through `calculations.calcStatusOf` (not held or hidden: NO_SUCH_CALCULATION, the two alike; not accepted or unreadable: CALCULATION_NOT_ACCEPTED). R58: `documentWaits` over `capture.heldActsOf`, driven in tests through the real capture. R4's derived-leg share (references[] and the division's rebuild). DEC-149: the one string, with a test.

Tests: inquiry 173 pass, 2 fail, 1 todo. The 2 reds are R4's derived-connection leg, waiting on inquiry-grammar's R17 merge (its target arm still refuses the 64-hex id); they go green with no change here once it lands. Checks: format, architecture, coverage (49/49), ownership all 0 failures. Users run as regression, all green. `bio-plane/dist/bio-plane.bundled.mjs` is stale against this source (regenerate at layer close).

## Completion of B3 (CHANGE, K1799)

`test/m/inquiry/earned.test.mjs` R6: the negative arm now excludes `/fetched them/` (any fetch wording, the measured route's DEC-149 sentence "as your group's Civicsmith fetched them" among them), and a new positive arm asserts the measured route (A) carries that sentence, so the negative arm can fail. Merged `tranche/T34` first. Tests: inquiry 176, pass 173, fail 2 (the same two R4 derived-leg tests waiting on `inquiry-grammar` R17), todo 1. Checks: format, architecture, coverage (49 of 49), ownership: 0 failures each.

Size (session_01Wskzz89u9YtWxzo9XZyHmv): test runs 19, module lines 3294

## J3 · COMPLETE

B3 done: earned.test.mjs R6's negative arm now /fetched them/, with a positive arm proving the measured route says 'as your group's Civicsmith fetched them'. Inquiry 173 pass, 2 fail (the R4 derived-leg pair waiting on inquiry-grammar R17, unchanged), 1 todo; all four checks 0 failures. Record's 'Completion of B3' has it.
