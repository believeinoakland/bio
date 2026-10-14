# standards (T48)

**Status** · session_01FxBAaAreHEtJGAEtvdRFhL · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings I am building on; answer only if any is wrong.
(1) R56 "answered with it (R9, R54)": `standardProposalRead` (R54, which reads the viewer's predicate only) answers `project` as the id only to a viewer whose `membership.sight` of that project is full; to any other viewer it answers `project: null`, so R54 never names a project hidden from its reader. R9's own answer (the proposer's, who was just checked at full sight) names it.
(2) R57 "an adoption whose standard the viewer may not read (R37) is answered as R54 answers it, and that proposal counted only as open": the item is listed under `open` (and `all`) with `adoption: null`, and is neither listed nor counted under `adopted`.
(3) R57 `after`: a proposal id that names no proposal made for `project` is refused as the required-argument refusal naming `after` (as an unknown `state` is), nothing read; R57 states no answer for it.
Also: `project` is checked first in `standardPropose`, before any other refusal (membership's terms: sight before any other check); the proposer's viewer is `viewer`, else `proposer`.
