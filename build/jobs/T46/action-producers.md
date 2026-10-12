# action-producers (T46)

**Status** · session_01RtAxjH3XdN1UyVL6cBpQ1K · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three R23 sentences cannot be filled "from the item's own facts as today"; one key differs from canon. My best reading of each, which I am building now (nothing waits on the answer unless you choose otherwise):

1. **`queue.action-clock-overdue.ours.detail`** ("Your group's deadline to {what} with {venue} was {date} …"): `action-clocks.overdueClocks` (its R3) answers no venue, and Uses gives me no read of the action's addressee (`actions`: `place`, `zoneOf` only). Best reading: R1's group arm reads `.ours.summary` by key now and keeps its present detail, returned to you as a fifth kept sentence, until `overdueClocks` answers the venue (or you add `actions.actionRead` to my Uses, R9's "role, body" as `{venue}`). Say which you want.
2. **`queue.plan-review-due.detail`** ("… reviewed every {rhythm}, and nothing has been reviewed since {date} …"): `plan-work.planReviewsDue` (its R4) answers `{plan, project, member, due, day, zone}`: neither the recurrence nor the last review's day nor the day the rhythm was set. Best reading: `.summary` by key now; the detail keeps its present text, returned to you, until `plan-work` R4's due read answers the recurrence and that day (a requirement change for `plan-work`; I report it as a gap).
3. **`queue.action-clock-overdue.noreply`**: R23 says canon's question "is unchanged"; `words.json` now holds it as "No reply recorded by {date}" (note: "canon; Noticed"), while R1 and my tests hold canon's "Noticed: no reply recorded by {date}". Best reading: unchanged means unchanged: the item keeps "Noticed: no reply recorded by {date}" under that key (it now differs from words.json's `en`). If you mean words.json's sentence (the "Noticed" label then the screen's), say so and I switch it.

Also, for your record (no answer needed): `action-holds` R14 is retired (K2981), so R23's stated reason for keeping `queue.litigation-hold.docket.detail` ("a release where no hold was placed is refused") no longer holds; the sentence is still kept because the docket arm's one door places a hold (R5) and "say why none is needed" offers a release it does not carry.
