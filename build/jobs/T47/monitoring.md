# monitoring (T47)

**Status** · session_01EarMHYuoFos6rEeZwyQ2BR · depth 2 · WORKING · handled B0

## J1 · QUESTION

R74's refusal order puts "an author who may not revise the bundle (promotion's refusal, answered as promotion gives it)" before MONITOR_SET_REFUSED, NO_LOCATOR and the `existed` answer. Promotion's refusal is only known at the write, and promotion offers no dry run; asking membership's `projectAuthority` / `positionalMember` myself would add services outside my Uses and still not cover refusals other modules register on promote.

My best reading, which I am building: R74 asks sight first (`membership.inSight`, R1's `ABSENT`, identically — the same condition as promotion's R20 for a member revision), then validates `enabled`/`frequency` (MONITOR_SET_REFUSED), then NO_LOCATOR, then the `existed` no-op, then promotes as the member (actorIdentity/actorViewer/actorMemberId stamped) and relays promotion's refusal as given. So a malformed or no-op request from an author whose write promotion would refuse for another reason answers MONITOR_SET_REFUSED or `{ok:true, existed:true}` (both write nothing) rather than promotion's refusal. If you want the stated order strictly, say how permission is to be read before the write (which service, from which module) and I will change it.
