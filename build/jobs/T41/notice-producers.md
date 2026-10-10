# notice-producers (T41)

**Status** · session_01Ktpm9VNdCcRPXAVDSh7PSu · depth 2 · WORKING · handled B3

## J1 · QUESTION

R16's words carry placeholders `words.json` gives no key for. My best reading, which I am building now (none is Bob's; tell me if any is wrong):

1. `ai.queue.limitreached`: `{account}` "Your group's account" / "Your own account" (from `ai.whose.group` / `ai.whose.own` + " account") or "<project name>'s account" for a project's (it names whose, never a member); `{period}`, `{when}` from ai-use's own fills (`LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL`, `MONTH_NAMES`, imported from `ai-use/checks.mjs`, so the two modules say it one way); `{for_use}` " for <use name, lower case>" for a use's limit, "" for the overall one, " for each member" for a per-member one; `{Uses}` the use's name (`ai.use.<use>.name`) for a use's limit, "Uses counted in its overall limit" for the overall one, "Each member's uses" for a per-member one; `{date}` the local day of `reached_at` in the profile's zone.
2. `ai.queue.exploreask`: `{what}` from the ask; `{scope}` `ai.owner.group` ("the group") or the project's name; `{account}` as in 1, lower case.
3. `ai.queue.suspended`: `{project}` the project's name.
4. R17's `ai.label.explored`: `{owner}` `ai.owner.group`, the project's name, or the member's own handle (`words.json`'s note), only when `question-explorer.findsFor` answers `enabled_by` (its owners); to anyone else the find carries `label: "machine"` and no explored label (the words other members see are owed, NOTICE).
5. Each item's id is `<CLASS>::<kind>::<the source's own key>` (review's key already has that form and is used as given); `step-cost-message` has no key in `steps.costMessages`, so its key is the message's id.
6. The R16 "Ask" item's class is FINDING (queue R1), label `ask`, with the act `exploreapprove` worded by `act.owed_exploreapprove.label.queue`.

Nothing waits on the answer: I carry on.
