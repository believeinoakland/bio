# project-roster (T50)

**Status** · session_01CRP1uirZ6T4GoDiyhrh3i8 · depth 2 · WORKING · handled B2

## J1 · QUESTION

R33's `since` (the instant the last owner stopped being active) has no source in membership's stated contract.

What I found: membership R120 lists `members (member_id, handle, status)` only; R58 records the actor of a status write, not its instant. The one instant a status write leaves is `members.updated`, which every status write stamps (index.mjs 1966, 2477, 2480) but so do capability and pairing writes, so it can move after the owner stopped being active. membership R127 gives `since` for joins only.

My best reading, which I build now unless told otherwise: R33's `since` = the latest `members.updated` among the owners, read through one private method in project-roster, flagged in my record as an interim read outside R120 (P5), because it passes R33's test (two owners revoked at two instants answers the later) and is exact unless a later non-status write touches a revoked owner.

My recommendation: membership adds a recorded status instant (a `status_at` column in R120, or a `memberStatusSince(memberId)` service), and I swap my one method to it. That is a membership change for BOB to fold; tell me if it lands in T50 and I will merge it.

Not blocking: I carry on with R1, R8, R9, R18, R30–R32 meanwhile.
