# case-import (T50)

**Status** · session_013i42TtrczRChAapYgmx3CQ · depth 2 · WORKING · handled B1

## J1 · QUESTION

One reading, carried on with; cheap to change.

R25 says a malformed `matter_stake` is recorded `null` "with a sentence saying why (`group_fields_note`, a key of `words.json`)". `words.json` holds no such key: it is owed item 4 in the L7–L10 fold's "Keys owed to the design lane", and plan rule 6 forbids my holding the English.

My reading: the edition answers `group_fields_note` = the list's word for the key `case-import.group_fields_matter_stake` when the list holds it, and `null` until it does. The module holds no English for it; nothing is guessed. Tests pin the null-until-held arm and the equal-to-the-key arm, so the day the key lands the sentence appears with no code change here. If the design lane names the key differently, `MATTER_STAKE_NOTE_KEY` in `case-import/words.mjs` is the one line to change; the key is outside the `words-reads.json` list on purpose (its test pins that list to the owner's declaration).

So R25's sentence is unmet until the key exists. Everything else of R25 and R26 is built and tested.
