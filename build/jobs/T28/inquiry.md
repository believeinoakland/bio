# inquiry (T28)

**Status** · session_01QNQaUggEEA2eXfwiByRD2P · depth 2 · WAITING ON BOB (J1) · handled B3

## J1 · QUESTION

Confirmation asked at START (draft §3): the projection (R12) already keeps a non-bundle `target_id` as spelled and resolves no content row for it (`content.citationPlan` marks it not a document; `target_type` is ''); `content.citationRefusals` passes it; the cycle guard skips it. No code change is needed there.

Two places in my module would mishandle a ref leg, which I am fixing within R4/R12/R15/R24 (no new use):
1. `divide` (R24) copies every apportioned leg's target into the child's `references[]` as `cites`; a ref there is refused by inquiry-grammar R11, so dividing an inquiry with a ref leg would fail CHILD_REFUSED. Fix: a ref is carried on the child's leg verbatim and is not written to `references[]`.
2. `earnedBasis` (R15) asks `membership.inSight` of each target and leg; a ref is no bundle, so a ref leg is dropped and the answer says `legs_out_of_view` / `out_of_view`, and `ensureLegContent` would call its null case `INQUIRY_TARGET`.

QUESTION (R15's reading). My best reading, which I am building unless you answer otherwise: a ref leg is a part of the inquiry's own document, which the viewer already sees, so `earnedBasis` lists it (sight of the ref is the inquiry's sight; inquiry reads no accepted-work, per N522's "no new use"), earns nothing for it (its grades are the edition's, strength R33), and states its null case as a new `IMPORTED_TARGET` ("another group's finding, graded by the edition it names; this record holds no part of it"), never `INQUIRY_TARGET` and never out of view. The alternative is to keep it left out as out of view (fail closed), which misreports a visible leg as hidden.
