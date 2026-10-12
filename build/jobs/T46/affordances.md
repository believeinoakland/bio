# affordances (T46)

**Status** · session_01ALqCxKN9g4DMrH5R7g4DnX · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings of R53, each with my best reading; I carry on with these unless you answer otherwise.

1. **`textcheck`.** R53 (and `op-declarations` R51's last paragraph) list `textcheck` among T46's new ops "whose text the file lacks". It does not lack one: `mock-acts.js` @ 3f40899950 line 125 gives `textcheck: 'Asks the assistant to point out sentences that read as a claim of breach, a policy position, an ask for your group, or naming staff. It never rewrites them; you decide.'` (and `words.json` has `act.textcheck.does`). `textcheck` is not declared until T46-51 (merging after me), like `escalationreopen`, which R53 holds under its own text all the same.
   **Best reading:** hold `textcheck` under its own text, as `escalationreopen` is held (R48: every design text is held; R53's "lacks" was a mistaken premise). Then `op-declarations` R51 must **not** name `textcheck` in `ACT_HELP_ABSENT` (R34: no op both explained and absent); that is a requirement change on `op-declarations` (T46-51), yours. The alternative (not holding it, keeping R51 as written) leaves a design text unheld; say if you want that instead.

2. **`handlechange`'s refusal sentence** ("text BOB's"). R53 says the sentence states the refusal "as `membership` R129's row says it". The merged row (`membership` `HANDLE_FIXED`, C-96.52) reads: "Handles don't change in your group's Civicsmith: yours names your work for good, and no one else can ever take it. Nothing was changed."
   **Best reading:** `ACT_HELP.handlechange` is that row's translation, read from `membership`'s catalogue by reference (no copy here, so a re-wording of the row reaches the help too). If you want a separate sentence (e.g. R53's gloss "A handle is chosen when a member joins and is never changed; this act changes nothing."), give me its exact text.

Also noted (no answer needed): the design's `handlechange` text at 3f40899950 still describes a change of handle ("Changes the handle the record shows on your work. Members see your earlier handle beside it, and no one else can ever take it. …"); it is not held, named back to you for the design stream per R53.

## J2 · REPORT

**Totality gap in `op-grades` (R12's tables), found while re-pinning my totality tests; not mine to fix.**

`affordances.unaccounted` over `op-declarations`' own table as it stands on `tranche/T46` (`OPS`, `mutating` from each spec, `gated` = a `NEEDS` row) answers:

```
unpublished: advocacycheck, advocacychecks, bearingdraft, grouprules, infractiondraft
unranked:    advocacycheck
stale:       (none)
```

- `infractiondraft`, `bearingdraft` (`agent-worker` R76's drafts, `NEEDS` null), `advocacycheck` (mutating, `NEEDS` `contribute`) and `advocacychecks` (`case-account` R15) are T45 ops; `grouprules` is `local-facts` R15 (T46-9). None is in `RUNGS`, `RUNG_ABSENT` or `NON_ACTS`, and none is an act here (none is directed at an object's state: drafts and own reads), so each needs `op-grades` rows: `NON_ACTS` for all five and a rung or stated absence for `advocacycheck`. `op-grades` R33 (T46-44) names T46's new ops but none of these. Suggest folding them into T46-44 (or its next entry); my tests that enumerate the owners' op maps (`local-facts`' `grouprules`) stay red on this until `op-grades` grades them.

Not a red of my own making; nothing for my module to change once they are graded.
