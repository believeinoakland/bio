# case-import (T31)

**Status** · session_01MtNWSCDRK9AGiEKUk2dMFY · depth 2 · WAITING ON BOB (J2) · handled B4

## J1 · QUESTION

My readings of R18–R20 where the text leaves a detail open. I am building on them now; none blocks me. Answer only where you read otherwise.

1. R18 "an entry whose `seq` this import does not yet hold": an entry is skipped when this import has already recorded one with the same `seq` and the same `digest` (verified or refused, so a refused entry is not re-recorded every day). A `seq` held by a *verified* entry with another digest makes the new one `refused`, `differs: true`, both digests. A `seq` held only by refused entries is checked afresh.
2. R18's answer: `new_entries` counts every entry this read newly recorded (verified and refused); `new_moves` and `new_refused` are parts of it. `entries_seen` is the length of `answer.entries`; `last_entry` is `answer.last_entry`.
3. R18, `outcome: "read"` with an `answer` that is not an object with an `entries` list is recorded `unreadable`, reason `not_a_docket`; an `outcome` other than `read` or `unreadable` is recorded `unreadable` with reason `outcome_unknown`. A missing or unreadable `at` is recorded as this copy's instant.
4. R19's per-edition `publisher.edition`: the newest `edition` move naming an edition *later than this one* (R33 (a)'s rule), not the newest edition move of any number. `publisher` is `{edition, withdrawal}`, each null when none; `publisher` itself null when neither, with `publisher_note` saying no move has been seen (not that none was made) beside `last_read`.
5. R20: `entries` and `refused` cover every entry seen for each import, also under a watch since ended or replaced, each naming the `set_by` of the watch whose read saw it; `unreadable` covers only watches in force.
6. R16's `moves`: a move's id is `IMM-<n>`; `after` null or "" starts from the first (reevaluation asks with "").

## J2 · QUESTION

Replaces J1 for item 1 only (items 2–6 stand as J1 states them). Item 1, revised after a test found a flaw in my first reading: an entry is skipped only when this import has already recorded one with the same bytes served (`seq`, `digest`, `json` and `signature`). Keyed on `seq` and `digest` alone, a tampered copy carrying the genuine digest, once refused, would hide the genuine entry served later. A `seq` held by a verified entry with another digest is refused `differs: true` with both digests, as before.

REPORT, other modules (my change makes their tests red until their own T31 L11 jobs land, as the plan expects): `case-import`'s ops map (`caseImportOps`, the map `control-plane` R26 routes through) now holds `importwatch` and `importunwatch` (R17). Three tests that pin the map at eight ops fail on exactly those two names:
- `op-declarations` `test/m/op-declarations/t28.test.mjs` #6 (its R16 declares them);
- `control-plane` `test/m/control-plane/r49-routes.test.mjs` #1 (its R52 routes them);
- `plane` `test/m/plane/accepted.test.mjs` #7 (its R20 composes them).
No generated artifact is made stale.

Status: the job is built and tested (case-import 75 pass, 0 fail; format, architecture, coverage 20/20 and ownership 0 failures). I wait for docket's merge, as your START asks, then merge `tranche/T31`, re-run and post COMPLETE. Send a CHANGE (or RESUME) when docket has merged.
