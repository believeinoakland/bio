# BOB to screens-investigate (T49)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, screens-investigate: **T49-26 · screens-investigate**.
Your requirements: `build/requirements/screens-investigate.md` (read whole), folded by K3339; the ids marked `*(not yet met: T49)*` are yours to meet (R27, R28, R29, R30).
BOB's notes for this job:
Words (K3366, K3368; R30): you hold no member-facing English. Your keys are `modules["screens-investigate"].reads` in `docs/development/ux-substrate/screens/words-reads.json` (795 keys; merged at `fa3c8b7e8e`): read that entry whole (not the whole file). Read each sentence through setup-words' `word(key, vars)` (its R11; `hasWord` R12), delete your inline English and verbatim copies (`words.mjs` rows and the like) and every test comparing a sentence's text; assert each key with `hasWord`. Strings the entry marks `unkeyed` (2) stay. Take the design's key where the entry renames: `act.connectionassert.label.explore` → `act.stepsource.label.explore`. A sentence you need that no key holds is a REPORT to BOB, never inline English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
screens-investigate (T49-26): R10's red cleared (K3321 (B)); R27 a `step_source` step drawn in its own class, and "Follow" offers six groups (affordances R60); R28 the proceeding's two lanes of dates (DEC-240); R29 (D30) `explore` with no centre draws its sentence by key. (N1073) `common:23`.
1. Measure first: whether affordances R60's merged vocabulary answers `step_source` in its own group on the composed plane (T49-14 merged), and the module's size (2,559 lines).
2. Inherited reds: R10's design-file red, which this job clears (rule 5 (7)(B)); coverage on R27–R29 (5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). Rule 6 at START, and N1073's `common:23`.
Merge order in L11: after interface-shell (T49-20), setup-words (T49-15, first in L11) and interface-assets (T49-19), whose shell, keys and classes you draw; until plane merges, test against a fake plane (K31's pattern); after affordances (T49-14, R60) and screens-inquiry.
Reading set (mechanics §17, K3271): measured 475 KB with all your tests; 349 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

K3369: your five readings stand. The design lane is told which placeholders no answer fills.

## B3 · CHANGE

CHANGE (K3370, K3371): op-capabilities, setup-words (word, hasWord, the generated list; WORDS_COMMIT 8a54848a9e) and interface-assets are merged into tranche/T49. Merge the tranche branch into yours now and re-run your tests against the real setup-words.

## B4 · CHANGE

K3374: the design's later words (DEC-259–DEC-261; 11,823 words) are merged into tranche/T49 and setup-words' rows.mjs regenerated. Merge the tranche branch. Placeholders changed in DEC-259 for archive.summary, calculation.counts, calculation.range, help-records.must.*, held.waiting, request.howsend.*: re-read any of these you draw and fill exactly their placeholders. SITE: civicsmith.org's keys (DEC-261) are now in words.json; site.groups.rule no longer says 'below'.

## B5 · ANSWER · re J2

K3376: (1) leave the person/timeline acts unplaced in T49 (your R10 pin stands); N1127 places them in T50. (2) as built; the design lane has it. (3) no default: right. setup-words has merged: merge the tranche (CHANGE B-K3374 too), re-run, COMPLETE again. You merge after interface-shell.

## B6 · CHANGE

K3379: the design's DEC-262 (7ed8feb945) is merged into tranche/T49 with rows.mjs regenerated. It rewords four of your keys: `screen.calculation.counts` and `screen.calculation.range` take {answer} as "yes"/"no" (so `counts` can now be drawn); `screen.due-date.of` is "{who}'s reply"; `screen.due-date.step.counted` is "Counted {amount} {units}." Merge the tranche, fill exactly those placeholders, re-run, and COMPLETE again. Your two guessed fills (money.didnotmove's {date} as the figure's period start; timeline.order.evidence's {examples} as the event's keyed kind word) stand; I put both to the design lane. You merge after interface-shell (plan rule 1).

## B7 · CHANGE

K3380: interface-shell (R65–R72, words by key; `words.mjs` and `SHELL_WORDS` gone; the design's classes, `mk-image`, `.cs-band[data-band="test"]`) and admission are merged into tranche/T49, after op-declarations, control-plane, plane and site. Merge the tranche branch now, drop any local stand-in of the shell or its registry, and re-run your module's tests and the tests that import your screens on the real shell. Then COMPLETE again (or report what still fails, naming its owner). Shell-side: `RE_POINTS` covers BOB's K3373 list; `connect`'s `reauth` follows in the shell's next merge. Apply my B6 (DEC-262's four rewordings) in the same pass.

## B8 · CHANGE

K3381: the design's DEC-263–DEC-267 (1757b4c2f1) are merged into tranche/T49 with rows.mjs regenerated (11,899 words). Merge the tranche branch, then: `screen.money.didnotmove` is now 'did not move: a {phase} figure' ({date} gone; fill {phase}); `screen.timeline.order.evidence` holds its examples in its own words (no {examples}). Re-run your tests and COMPLETE again.
