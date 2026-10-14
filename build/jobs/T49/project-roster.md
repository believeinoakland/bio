# project-roster (T49)

**Status** · session_018CGBk9NjLEcazf7iqf4TiN · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

QUESTION (best reading applied; answer only if you read it otherwise). R29 says every `{member, handle}` naming the founder carries `founder: true`, and R30 says members are "named by handle". Several fields are bare handle strings, not `{member, handle}` objects: R6's `deciders` and `handle`, R2's `handle` and `removedBy`, R21/R24's `by`, R30's `target`/`proposed_by`/`agreed`/`awaiting`. My reading: in those string positions the founder is her held handle, or `null` while none is held (never `admin`); `founder: true` rides only on objects that already are `{member, handle}` (R1's participants, R27's owner, R28's members). Not covered by R29's text, left as they were, and they can still hold the id `admin` when the founder is a project owner or carries a rescue: R3/R4's answers (`have`, `awaiting`, `deciders`, `owners`) and R5's answer `by`, plus R23's `projectScope().by`. Say if R29 should reach them.
