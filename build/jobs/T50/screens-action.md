# screens-action (T50)

**Status** · session_019CQh3YcQcWZ9phnR8whPQT · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I carried on with (none blocks; tell me only if one is wrong):
1. R22 `{place}` (in `screen.help-records.sub`, `.faster.what`, `.portal.where`): `records_help` (jurisdictions R93) holds no place name. I read it from the `profiles` view's `name` (jurisdictions R13: the combined view has a `name`); a view with no name leaves those three sentences out. If the place should come from the block, R93 needs a `place` field.
2. R21 `{kind}` in `stake.ask.says` ("the action's kind in words, e.g. Taking part as a party"): setup-words holds words only for `records_request`, `request_for_comment` and `other` (`screen.start-send.kind.*`, lower case). I draw the action's kind through those, first letter raised by code, so a party-participation action reads "Other puts the team's own interest on the record". A key per action kind (`party_participation` and the rest the profile names) is owed by the design stream or setup-words.
3. R23 has no field-label key for the question's one-line field (the design draws only the button). I label the field with `act.owed_actioninquiry.label.action` and give it `action.noreply.question.help` as its help; a key such as `action.noreply.question.label` would be better.
