# actions (T50)

**Status** · session_01Mh5ptuawECZMQEacjjcFj9 · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · REPORT

T50-74 `actions`: R105, R106 and R107 are built and committed on my branch. I have not posted COMPLETE, because I cannot show a green run until `action-records` R17 and R18 are merged into `tranche/T50`.

**Built**
- R105: the read (R25, so `actionRead` and the projection decoration alike) answers `own_stake`, `action-records.stakeOf(id)` as answered. Each `accepted` disclosure of R75 carries `matter_stake`: the basis's value as answered, `null` when the basis has none.
- R106: `actionRead` answers an unknown id, a hidden action and a bundle that is no action through `noSuchAction`, `NO_SUCH_ACTION`, alike. `op=action` goes through it.
- R107: `noSuchAction` is imported from `action-records` and re-exported. My copy and its constants are gone.
- New `t50.test.mjs`: R105 (a stated stake, null, cleared with history kept, decoration; an accepted disclosure with, without and "undetermined" matter stake), R106 (three conditions, byte-identical, no id; visible control) and R107 (identity with `action-records.noSuchAction`, the pre-move bytes pinned).

**Why I am waiting.** `action-records` does not yet hold `stakeOf` or `noSuchAction`, so `actions` cannot import on this branch. To check my work I ran the whole module with a throwaway stub of both inside `action-records`, then removed it; nothing of `action-records` is committed. With the stub: `actions` 138 of 138 pass. Format, architecture, coverage (74 of 74 live ids named) and ownership all pass. Please send a CHANGE when `action-records` is merged; I will merge `tranche/T50`, re-run everything against the real functions and post COMPLETE.

**Tests of mine changed because R106 and R107 change what they pinned** (not weakened; each still checks its condition):
- `read.test.mjs` (R29) and `t18.test.mjs` (R47's `op=action` arm): unknown, invisible and non-action ids now expect `NO_SUCH_ACTION`.
- `t45.test.mjs` R75: the accepted disclosure now carries `matter_stake: null`. The row-region test lists `NO_SUCH_ACTION` among the moved rows, as it does `NOT_A_PROCEEDING`.
- `t11.test.mjs` R43: the row's `where` is matched as ending ` noSuchAction > is-no-such-action`, not as `src/actions/...`.

**Found in other modules, for you to place (I changed none of them)**
1. `action-grammar`'s C-117.2 row (`NO_SUCH_ACTION`): its `where` still names `src/actions/index.mjs noSuchAction > is-no-such-action`. The region now lives in `action-records`, so the row needs re-pointing (action-grammar R29). My row-region test skips the code until then.
2. `action-holds`: two tests assert `NO_SUCH_BUNDLE` from `actions.actionRead` for a hidden action, and fail now that it answers `NO_SUCH_ACTION` (R106): `hidden.test.mjs:64` (its R2) and `readers.test.mjs:46` (its R4).
3. `action-replies`: its acts pass `actionRead`'s answer on. Four tests fail where they used to see `NOT_AN_ACTION` and now see `NO_SUCH_BUNDLE`: `arose.test.mjs:48`, `bearings.test.mjs:65`, `quoting.test.mjs:67`, `t46.test.mjs:98` and `:161` (its R1, R2, R4, R6, R10). Its refusals for a non-action id need to follow R106, or its requirements say they stay.
4. `actions` R29's own text still says `NO_SUCH_BUNDLE` and `NOT_AN_ACTION`; R106 supersedes it for `actionRead`. Folding R29 is yours.

Inherited reds, unchanged by this job (same counts at the tranche head and on my branch): action-replies R7 words (1), action-plans (2), filings (3), escalation (3), affordances (4), action-producers (3).
