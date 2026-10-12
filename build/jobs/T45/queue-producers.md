# queue-producers (T45)

**Status** · session_01DYXLS1wknT5aRvQSA1DDD2 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R8 (T45 sentence) says `facts` "carries its `facts` beside the others" without naming the key. My reading: `facts.action`, holding `action-producers.actionItems`' `facts` object whole (its R13: each producer's bound and `truncated`, and `failed`), `{}` when it answers none; beside `objective_gap`, `unattributed`, `contradiction` and `dispositions`. `queue` names no key it reads from it, so nothing else changes. I am building on this reading; confirm or name another key.

## J2 · REPORT

Read whole: my requirements, my code (index.mjs, proposals.mjs) and every test file; action-producers' public part; the plan's T45-40/41 entries, rule 4 at START, the reconciliation lines naming either module (R5, R14, R20, the id table); `draft-T45-upper.md` "queue-producers" and Doubts; K2780, K2781, K2787; v0.2 rule 18. The used modules' public parts beyond action-producers and machinery-producers were not re-read: my change uses no new service of theirs (reading set over 600 KB, K2700).

Prepared, not committed (START: delete only after action-producers' merge): the moved producers (R15–R21, R29) and every helper only they used (zone and day helpers, `#actionRecipients`, `#actionHomes`, their door constants) deleted; R8 calls `action-producers.actionItems({member, viewer, now, homesOf, optionsOf})`, built lazily over this module's own deps as `machinery-producers` is, its items in the place the moved ones held, its facts as `facts.action` (my QUESTION). Tests: templates.test.mjs and the moved arms of action.test.mjs deleted; new R8 tests (pass-through unchanged and in order, the same walk and options, facts; and no moved kind raised here whatever its old providers answer, with control); R25 and R36 re-tested over what remains (no item carries `due`; nothing moves with the instance's zone). 73 of 73 pass against a local stub; format, architecture, coverage 0 failures. After the CHANGE I merge `tranche/T45`, add one test through the real `action-producers`, and run `queue`'s and the plane's feed tests.

For BOB:
1. Edges to drop at my merge (no remaining import): `action-clocks`, `escalation`, `action-plans`, `actions`, `filing-templates`, `local-facts`. `civil-time` stays (`isCalendarDate`, R37). The Uses lines for them and the "Until this module's T34 job…" sentence are stale.
2. Requirement text: R33 says "as R20's" and R35 "(as R20's `group` template)"; R20 is retired here (now `action-producers` R6). R36's text still names R15, R16, R18, R21 as its producers: after the move this module derives no day at all.
3. Size (M-T45-6): `index.mjs` 2,725 lines after the move (was 3,307), `proposals.mjs` 180.
4. Owed to `queue` (its job): `PRODUCER_DEPS` gains `actionHolds`, `following`, `planWork` (action-producers' private Deps line), and loses nothing it still needs for `action-producers`.

## J3 · COMPLETE

T45-41 done, on `tranche/T45` merged at action-producers' merge (K2888, B3).

**Applied.** R15–R21 and R29 retired here: their producers and every helper only they used (the zone and day helpers, `#actionRecipients`, `#actionHomes`, the door constants, the `actions`/`action-clocks`/`escalation`/`action-plans`/`filing-templates`/`local-facts` deps) deleted. R8: `feedItems` calls `action-producers.actionItems({member, viewer, now, homesOf, optionsOf})`, built lazily over this module's deps as `machinery-producers` is; its items are answered unchanged, in its order, in the place the moved items held; its facts are `facts.action` (K2882). R25: no item this module produces carries `due`. R36: this module derives no day. Read whole: my requirements, code and every test; how the reading set was read is in J2.

**Own flaws fixed (P8).** `#homesAt`'s `walkFrom` parameter (used only by the moved producers) removed; the paging helper renamed `#pages`/`QUEUE_PAGES` (it served the wizard and scheduled producers too, under an Action-layer name); header and comments no longer cite R20 as this module's. Nothing deferred.

**Tests.** `templates.test.mjs` and the moved arms of `action.test.mjs` deleted. New: R8 pass-through (the very items, in order, the same walk and options, the facts; no walk passed, none handed on); R8 no moved kind raised here whatever its old providers answer, none of them asked (control: action-producers answers them); R8 through the real `action-producers`; R25 and R36 over every kind this module produces, in a zone west of UTC, UTC and none. `node --test test/m/queue-producers/`: tests 74, pass 74, fail 0.

**Users' tests.** `node --test test/m/queue/ test/m/plane/`: 337 tests, 333 pass, 4 fail (on the merge base before my change: 8 fail). Of the 4: plane `compose.test.mjs` "R11, R5 … local-facts' and filing-templates' maps" and `roster.test.mjs` "R5, R9 … project-roster's whole ops map" are accepted reds (rule 4 (11), (9)). **Two are new, and are `queue`'s to re-point** (REPORT): queue `action.test.mjs` "R8, R12 (K899 (7)): a caller's fake actions reaches queue-producers R19 …" and `docket.test.mjs` "R1, R8, R11, R12 (N518): a fake actions.holdsReleased reaches the real queue-producers R29 …": both hand the holds through a fake `actions` (`holdsDue`, `holdsReleased`), which action-producers no longer reads; it reads `actionHolds` (action-holds R3, R8). The four plane tests red on the base and green now are the producers' former `holdsDue` throw (rule 4 (6), K2849), cleared.

**Another module.** `queue`: the two tests above; nothing in its code.

**Checks.** format: 153 modules, 0 failures. architecture: 65 relative imports, 0 failures. coverage: 27 of 27 live ids named by a test, 0 failures. ownership: 7 files, 0 failures.

**For BOB at the merge** (as B2): drop the edges to `action-clocks`, `escalation`, `action-plans`, `actions`, `filing-templates`, `local-facts`; refresh the Uses lines; re-word R33, R35, R36. M-T45-6: 2,903 lines (`index.mjs` 2,723, `proposals.mjs` 180).

Size (session_01DYXLS1wknT5aRvQSA1DDD2): test runs 11, module lines 2903
