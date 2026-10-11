# op-declarations (T43)

**Status** · session_0126JHqriJqLtHSVj8Cj7oxW · depth 2 · RUNNING until 2026-10-11T11:59:56Z (plane's migrate-released.test.mjs) · handled B3

## J1 · QUESTION

Affordances' T43-17 (merging before me in L11) adds `ACT_HELP` texts for `pagetranscribe` and `transcribe`. My `ACT_HELP_ABSENT` names both under the last ground (R47: "until affordances' `ACT_HELP` holds its text"), so once T43-17 merges, R34's partition (`t36.test.mjs`:292, "no op is both") and `t42.test.mjs`:128 ("pagetranscribe has no text in ACT_HELP") go red.

Best reading (I proceed on it unless you say otherwise): R34 and R47 already require the move, so when affordances is merged into `tranche/T43` I merge the tranche into my branch, take `pagetranscribe` and `transcribe` out of `ACT_HELP_ABSENT` (a two-name data change in my own `index.mjs`, beyond "tests only" but required by R34/R47 as written), and re-pin `t42`:128 to "explained, named under no ground". Until then I do the entry's re-pin of `t34`, `t37`, `t38` against the tranche as it stands, and COMPLETE only after affordances has merged so my checks run against its `ACT_HELP`. If you would rather I COMPLETE now and take this by a later `CHANGE`, say so.
