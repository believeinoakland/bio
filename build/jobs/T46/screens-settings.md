# screens-settings (T46)

**Status** · session_01V6ChUsecnpQgZeXHEMdaCi · depth 2 · WORKING · handled B3

## J1 · QUESTION

**The screen contract and the kit `cs`, while interface-shell is unbuilt.** INTERFACE-SHELL #1 has not started (no record on its branch), and its R21 and Suggestions name the contract's parts (`{id, reads, render, acts, words}`, the kit's names) but not their signatures. I cannot wait on its merge without idling, so my best reading, which I am building to now and will align to the shell's actual kit at its merge's CHANGE:

1. `SCREENS` is an array of `{id, reads, render, acts, words}`; every function in it is self-contained (refers only to its parameters), so the shell can compose the page from `toString()` (K2854 T1).
2. `reads(ctx)` answers a list `[{name, op, query, body}]`; `ctx` is `{me, subject, reachable}` where `me` is `whoami`'s answer and `reachable` the shell's R20 result.
3. `render(cs, d, ctx)` answers an HTML string; `d[name]` is the read's outcome `{state: 'loading'|'empty'|'failed'|'ok', value, refusal}`; the screen draws a non-ok read through `cs.state(d[name], emptyKey?)`.
4. `acts` is a list `[{op, key?, args(form, ctx, answers) → {query, body}, rereads: [names], after?(answer, ctx) → {open?, show?, then?}}]`: the shell gates, applies friction, sends, draws refusals beside the act (R11–R13) and re-reads `rereads` after an answer (my R8). `after` covers my follow-ups: `groupkeyset` then `groupkeyswitch {on: true}`, `subscriptionsignin {step:"start"}` opening `address` with `noopener noreferrer`, `memberadd`'s invitation shown once, `writinghelp`'s draft placed in the note's field.
5. The kit `cs` (mock-kit.js names): `w(key, fills)`, `state(outcome, emptyKey)`, `act(op, {label, args, w})` (empty string when R12 refuses), `field`, `choice`, `checks`, `sec`, `sheet`, `row`, `ref`, `mark`, `due`, `date(iso)`, `esc`.

Until the shell merges, my tests use a stand-in kit and HTML reader in my own tests path (K2854 T2's shared stand-in does not exist yet) and are re-pointed to the shell's at its merge. If BOB has fixed (or will fix) a different contract with INTERFACE-SHELL, please send it; I will adapt.

## J2 · QUESTION

**Replaces J1 (answered by B2, B3).** Building to interface-shell R21 as K2998 states it. Six points it leaves open for this module; my best reading of each, which I am building to now:

1. **One panel render for two screens (my R9) with self-contained functions.** `members` and `connect` must draw the same AI account panel, and a render may refer only to its parameters and `cs`. Reading: a screen may carry optional `parts: {name: fn}` (each self-contained), which the shell serialises beside the screen's functions and hands in as `view.parts`. Without it the only way is two copies of the same source, which R9's "one render" forbids.
2. **The invitation, website key and join link shown once need the page's origin** (`origin + "/#invite=" + token`, as setup-page builds it), and `location` is not among R21's globals. Reading: `view.origin` (the page's `location.origin`).
3. **Opening Anthropic's sign-in page** (my R5: open the answered `address` in a new browsing context, `rel="noopener noreferrer"`). `window` is not among the globals and the kit has no open. Reading: after `{step:"start"}` answers, the screen draws the address as a link `target="_blank" rel="noopener noreferrer"` ("Open Anthropic's sign-in page"), which the member follows. If the shell should open it itself (`cs.open(address)`), say so.
4. **Refusal words with fills.** `refusals: {CODE: key}` cannot draw R9's `ai.refused.limitinvalid` with its field's `ai.limitfield.<field>`, or R5's `SIGNIN_REFUSED` with the runner's `detail`. Reading: the shell fills a refusal word's `{name}` from the refusal's own fields (`{detail}`), and a `refusals` value may also be a function `(refusal, cs) → html` (used for `AI_LIMIT_INVALID`).
5. **`cs.value(id)` on checkboxes and radios** (capabilities ticked for `memberadd`/`membercaps`, the uses for `aikeepaway`, `noteturn`'s "into"). Reading: a checkbox answers its `checked` (true/false), a radio group is read through the checked one's id.
6. **`cs.rows({cols, items, key, cells, acts, pick})`.** Reading: `cols` the header word keys; `cells(item)` → the row's cell HTML list; `acts(item)` → the HTML of the row's panel (its acts, R19); `key(item)` → the row's key.

Also, for BOB's record: R4 says the member's daily allowance on the group's key comes "from `ailimits`", but ai-use R12 refuses `ailimits` (and `aiusage`) with `owner: "group"` to a member who does not administer (`NOT_AN_ADMIN`). I read it from `aiusage` without `owner` (ai-use R4's `aiUsageMine`: `payers[].limits` carries the group's `per_member` limit), an extra read on `connect`. Please confirm or reword R4.
