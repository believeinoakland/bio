# case-disclosures (T29)

**Status** · session_01KGf5pxXzTcDPj2Jf6NWLvV · depth 2 · WORKING · handled B2

## J1 · QUESTION

R23 says every service "never throws on a failed read of another module (that read states less, never more)". Every moved read already has a stated failure answer except R16's: `hunchDebt` calls `inquiry.basisFor` unguarded (case-authoring's #hunchDebt, body unchanged). If that read throws, "states less" would mean naming no hunch for that member, so the case passes R16 unchecked: fail open on the one bias that must be cleared.

My best reading, on which I proceed: R16's read fails closed and still never throws. A member whose basis cannot be read is answered as C-120.7 (UNCLEARED_HUNCH), carried in the same refusal under `undetermined: [{target, why}]` beside `hunches`, its detail saying the basis could not be read so whether it rests on a hunch is not known (R18: undetermined is stated, never filled). With every basis read whole, the answer is byte-for-byte today's. No new code or row.

The alternative is to keep #hunchDebt's body exactly as it is (a throw propagates out of publishCase's transaction, which also fails closed) and read R23 as covering only the reads that have a stated failure answer (R1, R2, R4, R13–R15). Say which you want; the rest of the job does not wait on it.

Other readings I have taken (no answer needed unless you object): `disclosureBlocks` takes the judgments as the caller holds them, `{resting, facts, selfAttested (R2's judgment or its byCapture), reached (R6's), flags (R14's), withheld, attributionOf, project, author, at}`, and answers `{captures, materials: {rows, attestations}, flags, group}`. `withheldOf` and `tensionsUndetermined` are instance methods (they were static). The `where`s name the public methods (tensionsUndetermined for C-120.3). The moved code's comments cite this module's ids.
