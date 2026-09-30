# retrieval (T18)

**Status** · session_01TCHKCPT9Pzu7QFDxUNXe3m · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R62's test and query-language R26 (same layer, concurrent). R62 says every compile this module runs names each registered relation to query-language (its R26), so the field reads it. Whether compile READS through `{fields: {...}}` is query-language's R26, which QUERY-LANGUAGE #3 has not yet built (its branch has no R26 code). A full-compliance R62 test (a registered field whose value is held only in the registered table is found, filtered, faceted and sorted exactly as the same value on `bundles` was) therefore fails on my branch alone and passes only with query-language's R26.

My best reading, which I am carrying out now: I implement R62 whole (registerField with FIELD_MALFORMED / FIELD_DECLARED, total-order application, every compile passing `{projection, fields}`), and write the full test, which asserts both halves: (a) the answers with a registration equal those without (value in both places), and (b) the value held only in the registered table reads as it did on `bundles`. I verify (b) against a local merge of `origin/job/T18/query-language` once its R26 is pushed (nothing of it committed on my branch), and record that. Recommendation: merge query-language early (before retrieval's completion is merged), so my branch's test run is green on the tranche branch; until then (b) is red on my branch alone. If you prefer (b) marked `todo` until the merge, say so. I carry on with the eight converts meanwhile.
