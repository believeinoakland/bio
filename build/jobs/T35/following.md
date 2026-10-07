# following (T35)

**Status** · session_01Ns8nGmvGwjcv67gEvqEcfv · depth 2 · WORKING · handled B0

## J1 · QUESTION

R20/R21 readings; I am building on them now. Only (2) needs an act from you.

1. **Which standards are watched.** Standards of kind `policy` (standards R1), held `text`, not superseded. A policy whose family is undetermined is still watched: `family` is a series, not the policy test.
2. **The capture and its address (needs `modules.json`).** Standards' reads give a policy's text only as content ids. A content id is a hash, so getting from it to its capture means reading `content`'s R45 read contract (`content.content_id` → `capture_sha`, `bundle_id`). The address then comes from provenance R48 `captured_locators` (`via = 'direct'`, its `address` public https). Following does not use `content` today. Please add the edge `following` uses `content` (layer 4, earlier). I join the R45 table in my own SQL and do not import content.
3. **"Handed to standards as a version from captures."** Standards has no machine write: R1, R10 and R38 are member acts, and R9's proposal takes no `version_basis`. My reading: the kept capture is a held capture with a direct receipt at the policy's address, which is exactly what standards R38 `version_basis {captures:[earlier, later]}` takes. R21 answers both digests, so a member who acts on the "Noticed" item names them. No standards proposal is filed. Standards' text is never touched.
4. **Author none.** A watch's row holds no member author; R14 answers `author: null`. `unfollow` refuses a policy watch with `NOT_THE_AUTHOR`. The watch ends only when its policy is superseded, or when it is no longer a watchable held policy.
5. **7 days, failed reads included.** An attempt that fails also moves `last_read`, so the address is fetched at most every 7 days (K1881). It is recorded `failed` with its reason and stays watched.
6. **Made when first held.** Standards offers no listener, so the watches are reconciled from `standardsIn({kind: "policy"})` at each due, wake, tick, `follows` and `policyChanges` call. R19's listener is told on each make and end.
7. **Sight.** A watch's captures land in the policy text's bundle (its project) while standards holds the policy at bundle sight, otherwise group-wide. R14 and R21 show a watch or change only to a viewer standards lets read the policy (`isMeasure(id, viewer)`, true for a held-text policy exactly when the viewer may read it). An absent viewer sees none.
8. **`amendment_held`.** True when the policy's successor (`superseded_by`) has a period `from`, or a `version_basis` band end, between the two captures' local days inclusive, or when an adopted temporal law relation into the policy (`lawRelationsOf`, `in`, not withdrawn) has its effective day in that range. An event effective date is read from events.
9. **`member_act_required`.** A policy whose `access` is `paywalled` or `reading_room`: nothing is fetched (R8, R15).
