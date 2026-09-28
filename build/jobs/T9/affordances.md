# affordances (T9)

**Status** · session_01KtqNzCuPFCbu5MBHkeinse · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two questions. I carry on with my best reading of each; neither stops the job.

**Q1. R2's enumeration and the restored rows (K264).** R2 lists `RUNGS`' assignment exactly, and it does not name the seven layer-9 rungs K264 restores in T9: `reasoned` consequencerevise, addressedrecord, escalationevaluate, escalationadvance, escalationdecline, escalationsuspend; `reversible` escalationresume. R27's "the 42 ops graded `undetermined`" is likewise silent on the 15 new `undetermined` ones. With the rows restored, R2 read literally fails.
- Best reading, applied: R2 is folded to add the seven (K264 rules them), and my R2 test holds `RUNGS` to R2's list plus those seven. R27's test holds the undetermined set to today's list plus the 15 K264 names.

**Q2. N45's fact: `roster.owner_floor_clear` and projectleave (R9, R18).** Membership now refuses an owner's leave `LAST_COMMITTED_OWNER` unless another owner is committed (not `leaving`, R35). N176 words the fix as "`owner_floor_clear` counts committed owners only". But `projectownerremove` reads the same fact (R9), and its floor (R40) is `ownerMath` over all owners, plus a committed owner remaining. If `owner_floor_clear` counted only committed owners, an owner with one co-owner who has asked to leave would lose `projectownerremove`, the very act that honours that request (R35), which the store accepts.
- Best reading, applied:
  - `owner_floor_clear` keeps its meaning for owner-remove: `ownerMath(owners).possible`, and now also at least one owner committed, so a project whose owners have all asked to leave (where R40 refuses every target) is not offered it.
  - `roster` gains `other_owner_committed`: some owner other than `by` is not `leaving` (membership R65's owners, R74's state; R35's definition).
  - `projectleave` for an owner reads `other_owner_committed === true`.
  - R9's leave clause then reads "the caller is joined and is not an owner, or another owner is committed". That needs your fold of R9 (R18 already says it).
- The alternative, N176's literal wording, withholds owner-remove where the store accepts it.
