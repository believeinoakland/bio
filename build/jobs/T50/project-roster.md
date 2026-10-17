# project-roster (T50)

**Status** · session_01CRP1uirZ6T4GoDiyhrh3i8 · depth 2 · WORKING · handled B2

## J1 · QUESTION

R33's `since` (the instant the last owner stopped being active) has no source in membership's stated contract.

What I found: membership R120 lists `members (member_id, handle, status)` only; R58 records the actor of a status write, not its instant. The one instant a status write leaves is `members.updated`, which every status write stamps (index.mjs 1966, 2477, 2480) but so do capability and pairing writes, so it can move after the owner stopped being active. membership R127 gives `since` for joins only.

My best reading, which I build now unless told otherwise: R33's `since` = the latest `members.updated` among the owners, read through one private method in project-roster, flagged in my record as an interim read outside R120 (P5), because it passes R33's test (two owners revoked at two instants answers the later) and is exact unless a later non-status write touches a revoked owner.

My recommendation: membership adds a recorded status instant (a `status_at` column in R120, or a `memberStatusSince(memberId)` service), and I swap my one method to it. That is a membership change for BOB to fold; tell me if it lands in T50 and I will merge it.

Not blocking: I carry on with R1, R8, R9, R18, R30–R32 meanwhile.

## J2 · REPORT

Found outside project-roster:

1. N1118, the confirm: `projectlist` does NOT answer a row `participation` (`joined`/`invited`). R26–R28 give each row `{id, name, stage, owner, members, activity, lastChange}`; `members` carries `{member, handle}` with no state. screens-daily R29 ("invited, as projectlist's participation state answers") therefore has nothing to read. Fix is a requirement line in project-roster (a `participation` on each row, the viewer's own: `joined`, `leaving`, `invited`, or `null` for an administrator who is no participant). Fold it and send a CHANGE; I will build it.
2. Words: `words.json` holds no `refusal.MACHINE_CANNOT_SET_STAKE` (R31 names it). Its row (C-147.9) reads `translation: null` until the design lane gives it a word; no English is inline. `refusal.STAKE_MALFORMED` exists but is worded for the administrator's group stake (instance-setup R77), not a project's: the design lane may want a project-specific sentence.
3. New reds that are consequences of the three new ops (declared and graded in L11): plane `test/m/plane/roster.test.mjs` "R5, R9, R45 ... project-roster's whole ops map" (hand-lists the ops; should read the owner's declaration, plan rule 6) and op-declarations `t45.test.mjs` "R49, R6 ... every op ... has a spec" (projectstakeset has no spec). Both clear when T50-24/T50-18 declare `projectstakeset`, `projectstake`, `projectownersgone`. op-grades R42's MARKS test is red in base already.
4. The plane bundle and `program.mjs` are stale from these changes (project-roster is bundled into the plane): regenerate at layer close.
