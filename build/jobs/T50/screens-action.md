# screens-action (T50)

**Status** · session_019CQh3YcQcWZ9phnR8whPQT · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Three readings I carried on with (none blocks; tell me only if one is wrong):
1. R22 `{place}` (in `screen.help-records.sub`, `.faster.what`, `.portal.where`): `records_help` (jurisdictions R93) holds no place name. I read it from the `profiles` view's `name` (jurisdictions R13: the combined view has a `name`); a view with no name leaves those three sentences out. If the place should come from the block, R93 needs a `place` field.
2. R21 `{kind}` in `stake.ask.says` ("the action's kind in words, e.g. Taking part as a party"): setup-words holds words only for `records_request`, `request_for_comment` and `other` (`screen.start-send.kind.*`, lower case). I draw the action's kind through those, first letter raised by code, so a party-participation action reads "Other puts the team's own interest on the record". A key per action kind (`party_participation` and the rest the profile names) is owed by the design stream or setup-words.
3. R23 has no field-label key for the question's one-line field (the design draws only the button). I label the field with `act.owed_actioninquiry.label.action` and give it `action.noreply.question.help` as its help; a key such as `action.noreply.question.label` would be better.

## Completion

**Entries applied.** T50-80: R20 (a request with no office known says so, points an administrator to Places and offices, and draws nothing after it; the offices are read on load with `addresseesuggest`, "Choose the office" then brings "Start the request"), R21 ("Sent with" and "In this matter" on `start-send` and `request` from `stakeatpreparation` and `groupidentity`, unreadable stakes in an open fold; the question and `actionstake` on `start-send` alone, never a gate), R22 (`help-records` filled from the view's `records_help`, a sentence with an unanswered fill left out, `screen.help-records.notheld` otherwise, sources from the block's citations and the portal's address), R23 (`action` offers "Open a question from this", at once in state b, behind a fold otherwise, sending `actioninquiry` and opening the new question).

**Owed acts.** `actionstake` and `actioninquiry` are registered only when `OPS` holds them (they do not in this checkout; `op-declarations` declares them and `interface-shell` R73's registry lists them, both merging before this job). Tests hold in both states. I also ran the module's tests in a scratch copy that declared both ops and listed them as owed (100 pass there); that copy is deleted.

**Deferred / found elsewhere.** None in my module. For the other modules: `{kind}` words for action kinds beyond three, a field-label key for R23 (see J1). `plane/t47.test.mjs` R45 fails before and after my change (K3746, not mine).

**Checks.** `node --test bio-plane/test/m/screens-action/`: 100 pass, 0 fail. format 0 failures; architecture 0 failures; coverage 23 of 23 ids named; ownership 0 failures.

Size (session_019CQh3YcQcWZ9phnR8whPQT): test runs 14, module lines 2070
