# screens-settings (T46)

**Status** · session_01V6ChUsecnpQgZeXHEMdaCi · depth 2 · WORKING · handled B1

## J1 · QUESTION

**The screen contract and the kit `cs`, while interface-shell is unbuilt.** INTERFACE-SHELL #1 has not started (no record on its branch), and its R21 and Suggestions name the contract's parts (`{id, reads, render, acts, words}`, the kit's names) but not their signatures. I cannot wait on its merge without idling, so my best reading, which I am building to now and will align to the shell's actual kit at its merge's CHANGE:

1. `SCREENS` is an array of `{id, reads, render, acts, words}`; every function in it is self-contained (refers only to its parameters), so the shell can compose the page from `toString()` (K2854 T1).
2. `reads(ctx)` answers a list `[{name, op, query, body}]`; `ctx` is `{me, subject, reachable}` where `me` is `whoami`'s answer and `reachable` the shell's R20 result.
3. `render(cs, d, ctx)` answers an HTML string; `d[name]` is the read's outcome `{state: 'loading'|'empty'|'failed'|'ok', value, refusal}`; the screen draws a non-ok read through `cs.state(d[name], emptyKey?)`.
4. `acts` is a list `[{op, key?, args(form, ctx, answers) → {query, body}, rereads: [names], after?(answer, ctx) → {open?, show?, then?}}]`: the shell gates, applies friction, sends, draws refusals beside the act (R11–R13) and re-reads `rereads` after an answer (my R8). `after` covers my follow-ups: `groupkeyset` then `groupkeyswitch {on: true}`, `subscriptionsignin {step:"start"}` opening `address` with `noopener noreferrer`, `memberadd`'s invitation shown once, `writinghelp`'s draft placed in the note's field.
5. The kit `cs` (mock-kit.js names): `w(key, fills)`, `state(outcome, emptyKey)`, `act(op, {label, args, w})` (empty string when R12 refuses), `field`, `choice`, `checks`, `sec`, `sheet`, `row`, `ref`, `mark`, `due`, `date(iso)`, `esc`.

Until the shell merges, my tests use a stand-in kit and HTML reader in my own tests path (K2854 T2's shared stand-in does not exist yet) and are re-pointed to the shell's at its merge. If BOB has fixed (or will fix) a different contract with INTERFACE-SHELL, please send it; I will adapt.
