# membership (T53)

**Status** · session_018BhcefgcLdaAA53reT314Q · depth 2 · WAITING: member-roster COMPLETE, then job complete --with member-roster; work done on a local merge, unpushed
**Sessions** · 1

## Completion (2026-10-28)

# membership T53 report

- **T53-71 (K5501)**: `Membership.onProjectLeft(module, fn)` added (R158), registration refused through `listenerRefusal`, listeners kept in `MODULE_ORDER`; `projectRemove` calls each once after its writes with `{memberId, projectId, by, why: "removed", at}`. A throwing listener changes nothing. `projectLeave`, `projectOwnerRemove` and refused removals call nobody. Test: `test/m/membership/t53-project-left.test.mjs`. Not asserted: that the call sits in the caller's transaction beyond running after the writes in the same synchronous act.
- **T53-72 (K5565)**: all 9 English-in-test sites converted; the two B sites (`NOT_A_PARTICIPANT_DETAIL`, `NOT_THE_OWNER_DETAIL`) now `localize` with keys `membership.index.not_a_participant_detail`, `membership.index.not_the_owner_detail`; tests read them by `word(key)`. Other sites read existing keys. Two assertions were dead and removed or reduced to a type check (t41 "can be found" negative; t34 `rowOf` tail regex). The words check reports no English site left in the module (testenglish 0 against an empty count). `build/tests-english-baseline.json` is outside the module's paths (ownership check), so BOB removes these 7 entries: the t14, t34, t35, t40, t41, t45 files under `bio-plane/test/m/membership/` and `bio-plane/test/members.test.mjs`.
- Not done: nothing. Found in other modules: none.

**Met** · R158

Tests: 195/195. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefgcLdaAA53reT314Q): test runs 1, module lines 1712
