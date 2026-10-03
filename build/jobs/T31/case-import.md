# case-import (T31)

**Status** · session_01MtNWSCDRK9AGiEKUk2dMFY · depth 2 · WORKING · handled B1

## J1 · QUESTION

My readings of R18–R20 where the text leaves a detail open. I am building on them now; none blocks me. Answer only where you read otherwise.

1. R18 "an entry whose `seq` this import does not yet hold": an entry is skipped when this import has already recorded one with the same `seq` and the same `digest` (verified or refused, so a refused entry is not re-recorded every day). A `seq` held by a *verified* entry with another digest makes the new one `refused`, `differs: true`, both digests. A `seq` held only by refused entries is checked afresh.
2. R18's answer: `new_entries` counts every entry this read newly recorded (verified and refused); `new_moves` and `new_refused` are parts of it. `entries_seen` is the length of `answer.entries`; `last_entry` is `answer.last_entry`.
3. R18, `outcome: "read"` with an `answer` that is not an object with an `entries` list is recorded `unreadable`, reason `not_a_docket`; an `outcome` other than `read` or `unreadable` is recorded `unreadable` with reason `outcome_unknown`. A missing or unreadable `at` is recorded as this copy's instant.
4. R19's per-edition `publisher.edition`: the newest `edition` move naming an edition *later than this one* (R33 (a)'s rule), not the newest edition move of any number. `publisher` is `{edition, withdrawal}`, each null when none; `publisher` itself null when neither, with `publisher_note` saying no move has been seen (not that none was made) beside `last_read`.
5. R20: `entries` and `refused` cover every entry seen for each import, also under a watch since ended or replaced, each naming the `set_by` of the watch whose read saw it; `unreadable` covers only watches in force.
6. R16's `moves`: a move's id is `IMM-<n>`; `after` null or "" starts from the first (reevaluation asks with "").
