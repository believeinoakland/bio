# affordances (T37)

**Status** · session_0187SVNmLrMtUDuMD6BfqRLx · depth 2 · WORKING · handled B0

## J1 · REPORT

R48's re-generation (ACT_HELP from mock-acts.js @ e08cd35ecb, 203 entries; work in progress, not yet pushed) moves two things outside affordances:
1. op-declarations: test/m/op-declarations/t36.test.mjs:291 (R34, the partition SESSION_OPS.member ⊆ ACT_HELP ∪ ACT_HELP_ABSENT, disjoint) goes red at my merge: 'member ops explained and named absent: clockpropose'. PR #14 gives clockpropose its own text (DEC-182 (1)), so op-declarations' ACT_HELP_ABSENT must drop it (T37-31's R34 re-read). The withdrawn keys (claimidentity etc.) do not move it. Red from my merge until T37-31.
2. The nine owed acts not declared at my merge (infolevelset, subscriptionsignin, obscuremark, setpassword, translationgrant/draft/adopt/confirm/revert) are held under owed_<op>, and my test states that set as it stands at my merge (affordances may not import op-declarations, later in the order). Once T37-31 declares eight of them, R48 holds them under their ops: that needs an affordances re-generation after T37-31 (a CHANGE or a later entry); my test stays green meanwhile, since it pins the set as of my merge.
3. bio-plane/dist/bio-plane.bundled.mjs holds a copy of ACT_HELP (and ACT_HELP_ABSENT): stale after my merge; I do not write it (mechanics §14).
Note for BOB (R48, as the START asks): the design's owed_setpassword text says 'Other sessions you have open stay signed in until they end', while credentials R3 ends every other session of that role. Held as given; the design stream's to re-word.
