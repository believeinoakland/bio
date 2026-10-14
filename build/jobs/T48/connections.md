# connections (T48)

**Status** · session_01PrxArXookTYp8gXpFjHkXC · depth 2 · RUNNING until 2026-10-14T13:08:26Z (npm test (whole suite)) · handled B0

## J1 · QUESTION

Three points in R68/R69 where the text and the code disagree. I am building on the readings below and will continue unless you say otherwise.

(1) R68 `EXTENT_MALFORMED` ("an extent `content.canonicalExtent` cannot read"): `canonicalExtent` never refuses; it always answers a string. My reading: judge the extent with content's `checkContentExtent(extent, CONTENT_EXTENT_DOCUMENT_ONLY)`, the shape-only check entities R46 already uses. A refusal answers `EXTENT_MALFORMED` and carries content's code (C-45.x) as `extent_refusal`. The stored key for the "same (relation, capture, extent)" rule is `canonicalExtent(extent)`.

(2) R69 `evidence` `[{capture_sha, extent, basis, relation}]`: connection-grammar R1 (`shape.mjs` `connectionErrors`) refuses every evidence entry without a non-empty `source`, so the item as written fails `ownerConformance`. My reading: each entry also carries `source`, the cited capture's bundle id. This matches `mentioned_together`'s evidence, and the viewer must be able to see that bundle anyway (R33).

(3) R69 `grade.assertion` "the cited capture's grade (`provenance.captureGrade` through `content`)": `captureGrade` answers `grade: null` for a capture with no receipt, a received or uploaded capture, or an authored observation, and the shape requires a letter. My reading: a null capture grade answers the lowest grade, `D` (connection-grammar `LOWEST_GRADE`, never above the capture's), and the item states why in `grade_says`. A lettered grade is taken as is. This is the fallback `lines` already uses.

Also, for your report to the owners (not mine to change): `screens-investigate/explore.mjs` today sends `connectionassert` for "Attach a source to a declared step", and `setup-words`/`affordances` hold `connectionassert`'s help text under that label. Both are already planned under T48-74 / interface-shell R55 / op-declarations R67; I note it only so that nothing points at `connectionassert` after the merge.
