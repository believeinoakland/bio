# reevaluation (T28)

**Status** · session_01CqAd23e8YE6QX8eLXZeLoJ · depth 2 · WORKING · handled B2

## J1 · QUESTION

R1's new sentence, my reading (carrying on with it):
1. A ref target is seen by a viewer when `accepted-work.acceptedFinding({ref, edition, viewer})` answers a finding at **at least one** edition a leg on it names; it is refused `NO_SUCH_BUNDLE` when that answers null at every such edition (or no leg names it). "at any edition" read as "not at any".
2. With nothing registered, or the read unreadable, whether the viewer may see the ref cannot be read, so a targeted read is refused `NO_SUCH_BUNDLE` (the safe side, R20) and states `accepted_work_absent` (or `acceptance_read: false`); an untargeted listing withholds such a target's obligations whole.
3. A machine credential (`viewerPredicate` scope `member`) is not filtered, as for bundles.
4. A ref is never a `deletion` cause: today a leg on one is listed with a false `deletion` cause (`#moved` finds no `bundles` row). Fixed in this job.
R32: the capture's level moves are kept in a new table `reevaluation_capture_level_moves` (capture sha, both levels, case, edition, instant; no member), whole-store purge only, rather than altering R29's table (whose `observation` is NOT NULL on deployed stores). R18's list names R29's rows; this is the same kind of row.
