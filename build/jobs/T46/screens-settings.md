# screens-settings (T46)

**Status** · session_01V6ChUsecnpQgZeXHEMdaCi · depth 2 · WORKING · handled B5

## Record

**Entries applied.** T46-55 (N897 (1), (3); K2147; N934, DEC-197): a new module, `members`, `account`, `connect`, `notes`, R1–R10, built to interface-shell R21 as K2996, K2998 and K3002 state it (my J1 and J2 readings accepted, B2–B4). DEC-197: R1 draws no "formerly" (`memberlist` answers none), R3 draws no `handlechange` act and the fixed handle in DEC-197's words (`handle.fixed` held here, interface-shell R5). L11 notes (B1): `connect` reads `op=bootstrap`'s `parts` and offers the subscription sign-in only while `signin` is `present: true` (else says it is not installed, or could not be read, and offers the API key); the writing help's draft carries `ai.label.untested` when its answer is marked (held here in screens-inquiry R7's words). R4 as K3002 rewords it (the allowance from `aiusage` without `owner`).

**Files** (for `modules.json`, K1043): paths `bio-plane/src/screens-settings/` (`index.mjs`, `members.mjs`, `account.mjs`, `connect.mjs`, `notes.mjs`, `panel.mjs`, `words.mjs`); tests `bio-plane/test/m/screens-settings/` (`kit.mjs` the stand-in shell and HTML reader, `fixtures.mjs` the fake plane's answers, and `contract`, `members`, `account`, `connect`, `notes`, `panel`, `common`, `words` `.test.mjs`).

**Readings recorded** (BOB's, accepted in B4 or within the requirements' text): the signing key is registered from the public line the signing page (`/sign`) gives, never made or kept in the browser (credentials R9: only the public half is sent; R10 holds); the language is a BCP 47 tag field, empty to follow the device (as setup-page R22's field does: no op lists "the languages the group's profiles answer"); `noteturn` offers both of the owner's shapes (a hunch from an inquiry, kind and records; an observation or question already made, by its id); the court sentence (R7) is shown when `notewrite` answers `courtStatement` or, the group telling, the member had no note before; appearance is a device setting the shell applies (`data-device="appearance"`).

**Deferred.** Re-pointing my tests from my stand-in kit (`kit.mjs`) to interface-shell's DOM stand-in and harness, at its merge's CHANGE (B2, B3).

**Found in other modules (REPORT).**
1. `writinghelp` (wizard-scripts R27, served by the door's draft path, control-plane `draft.mjs`): its answer carries no test-instance mark, so on a test instance the draft my R6 draws carries no `untested` label; run-rules R29 / ai-runs R78 mark run productions and the ask's events only. Whichever owner marks AI outputs (K2816 (2)) should mark this answer too; my screen draws the label once the answer carries `untested: true` (or `label.untested`).
2. `ai.label.untested` is held as an own row both here and by screens-inquiry (R7), same English: the shell's word table should accept the same key from two modules (or the design stream keys it, after which both drop it).
3. Not yet served on this branch, all owned by L11 jobs merging before me: `infolevel`/`infolevelset` (op-declarations R50, instance-setup R79; `contract.test.mjs` skips their `OPS` check only while `OPS` lacks them), `op=bootstrap`'s `parts` (instance-setup R81), and `subscriptionsignin`'s `DISCLOSURE_DUE` and `RUNNER_NOT_CONFIGURED` translation (control-plane R65).

**Tests and checks.**
- `node --test bio-plane/test/m/screens-settings/`: 51 pass, 0 fail (on `tranche/T46` merged at B4).
- process checks: `format` 0 failures; `architecture`, `coverage`, `ownership` fail only because `modules.json` lists no paths for this module yet (17 files "owned by no module"); with the paths above set locally (not committed): architecture 0 failures (17 product files), coverage 10 of 10 ids named, ownership 0 failures (18 files). `checks/run.mjs`: architecture's 17 failures are those same files; the other coverage reds are other L11 jobs' unmet ids.

Size (session_01V6ChUsecnpQgZeXHEMdaCi): test runs 24, module lines 1031

## Record after B6 (K3007)

**CHANGE applied.** `tranche/T46` merged (interface-shell, affordances, op-declarations in). My stand-in kit is gone: every test now boots the real page, `interfacePage(SCREENS)`, through interface-shell's harness (`test/m/interface-shell/harness.mjs`) over its `dom.mjs`, clicking each act as a member would and answering the shell's friction. Kit signatures checked against `browser.mjs` and corrected in the screens: `cs.title()` heads each screen (R8's heading); `cs.rows` takes `id` and `name`, and its first cell is plain text (the shell wraps it in the row's button), a member opened by address having its row's panel open; the explanation level is sent by the shell's own `cs.setLevel` (the `infolevelset` act's `send` calls it and sends nothing more), drawn from `cs.level()`, the `infolevel` read dropped (the shell reads it); appearance is the shell's own theme control (`data-shell="theme"`), drawn with `cs.theme()`; `reasonField` per K3002's R11 (the screen's own field carries the reason): `adminremove` and `aikeepaway` (both reasoned by op-grades) send their own reason fields, and turning the keep-away off now asks its reason too; `writinghelp` names `told` as its `reasonField`. One flaw of my own fixed: the shell restores each field's value by its id on every redraw, so a typed key, code or password stayed in its field after a successful act; those fields now take a fresh id after success and are drawn empty (R10, tested).

**Kit gaps (REPORT to BOB, interface-shell's):**
1. `done` is not awaited and offers no re-read: `groupkeyset`'s follow-up `groupkeyswitch {on: true}` is sent from `done`, and the screen then re-opens itself with `cs.go("members")` to read everything anew (else the re-read races the switch). A `done` returning a promise the shell awaits before its re-reads would remove the workaround.
2. Field values survive redraws by id, including password fields after a successful act; a screen must change ids to clear them. A shell rule (clear `type=password` fields of a succeeded act's form) or `cs.clear(id)` would be safer for every screen.
3. `cs.rows` makes the first cell its row button, so a row's name cannot also be a reference link (interface-shell R16) to its screen.
4. A screen control for appearance has no kit call: I draw the shell's own `data-shell="theme"` buttons (works, but leans on the shell's internal attribute); `cs.setTheme` exists but nothing in a screen can call it on a click without an act.

**Grades (REPORT, op-grades'):** `writinghelp` has no rung (the shell draws it as reasoned, and would ask a reason to ask for help: worked around with `reasonField: "told"`); `aikeepaway` is reasoned in both directions, so switching the keep-away off asks a reason too.

**Tests and checks after B6.** `node --test bio-plane/test/m/screens-settings/`: 51 pass, 0 fail, on the served page. `format` 0; with the paths set locally (not committed): `architecture` 0 (17 product files), `coverage` 10/10, `ownership` 0.

Size (session_01V6ChUsecnpQgZeXHEMdaCi): test runs 44, module lines 1042

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

## J3 · COMPLETE

COMPLETE: T46-55 applied, R1–R10, built to interface-shell R21 as K2996, K2998 and K3002 state it; 51 tests pass, 0 fail, on `tranche/T46` merged at B4.

**Files for `modules.json`** (K1043): paths `bio-plane/src/screens-settings/`; tests `bio-plane/test/m/screens-settings/`. With those set, architecture 0, coverage 10/10 and ownership 0 failures (verified locally, not committed); without them, architecture and ownership name only these 17 files.

**Deferred:** re-pointing my tests from my stand-in kit to interface-shell's harness at its merge's CHANGE.

**REPORT, other modules** (details in my record):
1. `writinghelp`'s answer carries no test-instance mark, so my R6 cannot draw `untested` on a test instance until whichever owner marks AI outputs (K2816 (2)) marks it.
2. `ai.label.untested` is an own row here and in screens-inquiry (same English): the shell should accept one key from two modules.
3. `infolevel`/`infolevelset`, `bootstrap`'s `parts` and R65's `DISCLOSURE_DUE` are not served on this branch yet (L11 jobs before me).

Size (session_01V6ChUsecnpQgZeXHEMdaCi): test runs 24, module lines 1031.

## J4 · COMPLETE

COMPLETE after B5 (K3004): tranche/T46 merged (instance-setup, setup-page, answer-envelope, action-producers in). R4's new sub-bullet was already met: connect reads op=bootstrap's parts and offers the subscription sign-in only while signin is present: true (else says it is not installed, or could not be read, and offers the API key); checked against the merged instance-setup's PARTS shape [{part, present}] (setup.mjs:142, :156). Its test now names R4 too (connect.test.mjs). 51 pass, 0 fail. Files and checks as J3. infolevel/infolevelset still not in OPS on the tranche (op-declarations R50 unmerged). Size (session_01V6ChUsecnpQgZeXHEMdaCi): test runs 26, module lines 1031.
