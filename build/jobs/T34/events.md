# events (T34)

**Status** · session_01X7zjPcASYWQWpU1ZrM8Moh · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

**R11 with R22: how a Legistar vote's value meets the profile's `vote_values`.** `jurisdictions` R58 makes each `value` a key (`^[a-z][a-z0-9_]*$`) with a `label`; R11 matches "on `value`". Legistar's `VoteValueName` is written in the label's form (`Aye`, `Excused`; legistar-reader R9). So once a profile holds vote values, every imported vote would be refused `UNKNOWN_VOTE_VALUE` and answered `unresolved` (R22), unless the match also reads the label.

**My best reading, which I am building now:** R11 as written. Both `addParticipant` and `followedImport` match exactly on `value`, with no case folding and no match on `label`. A Legistar vote whose `VoteValueName` is no profile `value` is not written. It is answered in `unresolved` with its source row and `refusal: UNKNOWN_VOTE_VALUE`. While the active profiles hold no vote values (the first profile today: "two captured roll calls show only Aye and Excused"), the value is kept as written with `vote_value_checked: false`, as T33 did (K1746).

**The alternative, if you prefer it:** an import matches a source's value against each entry's `label`, written exactly, and holds the entry's `value`. That would be a change to R11/R22's wording, so it would be your call.

Nothing I build next waits on this answer.
