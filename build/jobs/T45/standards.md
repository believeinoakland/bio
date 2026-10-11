# standards (T45)

**Status** · session_01Jg3rgoArLauFTLhqRQc2MS · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Readings of R52/R53 I built on (all within standards; tell me if any is wrong and I will change it):
1. R53 also applies to a commitment held `cited` whose `cited_by` is of the group's own sending (R53 says "every text row"; I read `cited_by` as the cited commitment's one row, parallel to R52's own two cases). Refused `COMMITMENT_OWN_LETTER`.
2. A commitment whose rows are all either members' authored observations or the group's own sending, with at least one of the latter, is refused `COMMITMENT_OWN_LETTER` (R52's "at least one text row from another capture" is what lets it land); all authored stays `COMMITMENT_AS_HEARD`. The refusal names `content_ids`, and for OWN_LETTER also `own_sending` and `as_heard`.
3. R52/R53 are asked last in R1's order (after R47's question), before anything is written; R10 reaches them through R1.
4. "An extent of a member's authored observation" is read as: the content row's `capture_sha` has a `register` row with `authored` = 1 (provenance R48 contract), any extent or chain over that capture.
5. The check is per host instance (as membership R125/R128), `standardsOf(host).registerOwnSendingCheck("actions", fn)`; a promise, a throw or any non-boolean answer reads true for that capture; asked once per distinct capture, only for a `commitment` held text or cited.
New rows C-112.63 `COMMITMENT_AS_HEARD`, C-112.64 `COMMITMENT_OWN_LETTER` (awaiting promotion's stamp, T46).
