# project-roster (T51)

**Status** · session_014aLWC4WN3XfDCb6R5QrKZf · depth 2 · WORKING · handled B0

## J1 · QUESTION

QUESTION (R35): `projectInvitations` must name who invited the viewer, i.e. read `project_participants.invited_by`. That column is not in `membership` R120's stated read contract (columns: project_id, member_id, state, owner, owner_order, comment, created), and `membership.participation` (R74) answers only `{state, owner}`. I may not read an uncontracted column (R120: "No other column is part of the contract").
Best reading: BOB amends membership R120 to add `invited_by` to `project_participants` (the column exists and R118 writes it: `invite` sets `invited_by` = `by`; `rescue` sets it too). Until then I read it in my SQL join, and I will keep that one read in a single private helper so it is easy to re-point. Please confirm (or tell me to read it another way, e.g. a membership service). I carry on with R36, R37 and the rest of R35 meanwhile.
