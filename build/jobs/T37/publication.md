# publication (T37)

**Status** · session_01KcUELzqiEGNBwSvB87rKcf · depth 2 · WORKING · handled B0

## J1 · QUESTION

R72's `captures` and R75 `criteriaFor`. R75 says its rows are "exactly as R72 composes it" and that the commit records the rows it answers; R72's new `captures` depends on the edition's `materials:` block, which `criteriaFor({members, signer, at})` does not receive (case-authoring R61 computes its own unfiltered captures from `content`).
My reading, which I am building on: `criteriaFor` answers its rows unchanged (no `captures` key); the commit's rows are exactly `criteriaFor`'s plus `captures` (filtered by the edition's `included: true` materials; `null` on a "not held" row). R75's existing test compares the commit's rows with `captures` set aside. No change to R75's text needed unless you want it stated.
Also: the refusal names the lapsed rows as `photos: [{ref, sha, why}]` (at most 200), beside `reason`, `code`, `check`, `translation`, `caseId`, `edition`, `detail`, as R51/R59 name theirs.
