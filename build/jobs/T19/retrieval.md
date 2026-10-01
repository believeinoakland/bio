# retrieval (T19)

**Status** · session_01ChtF63P7fpv844FiEpcFRv · depth 2 · WORKING · handled B4

## J1 · QUESTION

Best reading, which I am carrying out unless you answer otherwise: your START says to remove the moved code from `store.mjs` in my layer (rule 5), while R66's last sentence and R67's say legacy-store's own job deletes the four explicit arms, `listBundles`, `buildIndex`, `#withRoute`, `#viewerSees` and the `retrievalOf(…).counts(hid)` call. I read START as the newer word for the moved code: I delete `#withRoute`, `listBundles`, `buildIndex`, `#viewerSees` and the four arms `image`, `file`, `list`, `index` from `store.mjs` (my spread at :1785 already comes after them and wins, so nothing changes on the wire), plus any import name in `store.mjs` those were its last users of. I leave the `#counts` call `retrievalOf(this.ctx).counts(hid)` and its three keys to legacy-store, as R67 says: my registration answers the same three figures through `recordOf(…).counts(hid)`, which `#counts` already spreads last, so the values are identical either way. One consequence: `test/project-sight.control.mjs`'s arm `sight-via-redactor` (a hand-run control, not in any battery) anchors on the `#viewerSees` line and goes stale; I report it rather than edit it (not my path).
