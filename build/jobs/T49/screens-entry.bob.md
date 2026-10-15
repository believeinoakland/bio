# BOB to screens-entry (T49)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, screens-entry: **T49-21 · screens-entry**.
Your requirements: `build/requirements/screens-entry.md` (read whole), folded by K3339; the ids marked `*(not yet met: T49)*` are yours to meet (R2, R4 and R6 re-worded; R16, R17, R18, R19, R20, R21).
BOB's notes for this job:
Words (K3366, K3368; R21): you hold no member-facing English. Your keys are `modules["screens-entry"].reads` in `docs/development/ux-substrate/screens/words-reads.json` (231 keys; merged at `fa3c8b7e8e`): read that entry whole (not the whole file). Read each sentence through setup-words' `word(key, vars)` (its R11; `hasWord` R12), delete your inline English and verbatim copies (`words.mjs` rows and the like) and every test comparing a sentence's text; assert each key with `hasWord`. Strings the entry marks `unkeyed` (0) stay. Drop the rows DEC-256 retired: `screen.forgot.handle.help`, `screen.setup.taken`. A sentence you need that no key holds is a REPORT to BOB, never inline English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
screens-entry (T49-21): the plan's R17–R21 are R16–R20 (T48 took R12–R15; K3334): R16 no founder hint on the sign-in panel or `forgot` (R2, R4 re-worded); R17 setup's claim asks "Choose your handle", sends it with `claim` and signs in by it, never by `admin` (R6 re-worded); R18 a pre-T49 founder chooses her handle once, with "Later" allowed (DEC-230 (3)); R19 (D23) `/app/setup` reached by a member, or an administrator who is not the founder, draws that reader's own state, never the founder's words or "Show my recovery codes"; R20 (DEC-246) the ten recovery codes with "Copy them" and "Save them as a file", and state c "Already claimed". R9's red cleared against the moved registry (K3321 (B)). (N1073) `common:80` and `setup:88`.
1. Measure first: the founder states `whoami` answers on a pre-T49 group and on a fresh claim, with T49-1 and T49-3 merged (`rootOfTrust`, `handle`). Then grep the module for `admin` reaching a reader (`setup.mjs`:4, :189–196; `words.mjs`:81).
2. Inherited reds: R9's design-file red, which this job clears (rule 5 (7)(B)); setup-words' dropped `signin.founderhint` (`front.mjs`:78, `index.mjs`:31), opened at T49-15's merge, which this job clears (rule 5 (8)); coverage on R16–R20 and the re-worded R2, R4, R6 (5 (1)); legacy-ui's `{role}` sign-in tests (5 (4), N1057); the plane bundle (5 (5)).
Merge order in L11: after interface-shell (T49-20), setup-words (T49-15, first in L11) and interface-assets (T49-19), whose shell, keys and classes you draw; until plane merges, test against a fake plane (K31's pattern); the first screen job to merge.
Reading set (mechanics §17, K3271): measured 390 KB with all your tests; 297 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

K3369: (1) interface-shell gains R71 with RE_POINTS.setup ["founderhandleset"] (CHANGE sent); hold COMPLETE until it is on the tranche branch, as you propose. (2) noted; your R21 admits those keys.

## B3 · ANSWER · re J2

K3369: all three readings stand: (1) founder.handle.done with a 'Go to Home' link, nothing opens by itself; (2) recoverycodesissue offered to the founder only while recoverycodesstate answers held: false; (3) no handle typed is refused locally by refusal.NO_HANDLE's words, nothing sent.

## B4 · CHANGE

CHANGE (K3370, K3371): op-capabilities, setup-words (word, hasWord, the generated list; WORDS_COMMIT 8a54848a9e) and interface-assets are merged into tranche/T49. Merge the tranche branch into yours now and re-run your tests against the real setup-words.

## B5 · CHANGE

K3374: the design's later words (DEC-259–DEC-261; 11,823 words) are merged into tranche/T49 and setup-words' rows.mjs regenerated. Merge the tranche branch. Placeholders changed in DEC-259 for archive.summary, calculation.counts, calculation.range, help-records.must.*, held.waiting, request.howsend.*: re-read any of these you draw and fill exactly their placeholders. SITE: civicsmith.org's keys (DEC-261) are now in words.json; site.groups.rule no longer says 'below'.

## B6 · ANSWER · re J3

K3375: understood; I CHANGE you when op-declarations and interface-shell are both merged. The nosignin word goes to the design lane.

## B7 · CHANGE

K3380: interface-shell (R65–R72, words by key; `words.mjs` and `SHELL_WORDS` gone; the design's classes, `mk-image`, `.cs-band[data-band="test"]`) and admission are merged into tranche/T49, after op-declarations, control-plane, plane and site. Merge the tranche branch now, drop any local stand-in of the shell or its registry, and re-run your module's tests and the tests that import your screens on the real shell. Then COMPLETE again (or report what still fails, naming its owner). Shell-side: `RE_POINTS` covers BOB's K3373 list; `connect`'s `reauth` follows in the shell's next merge.

## B8 · CHANGE

K3381: the design's DEC-263–DEC-267 (1757b4c2f1) are merged into tranche/T49 with rows.mjs regenerated (11,899 words). Merge the tranche branch, then: `screen.setup.claimed.nosignin` now says 'with your handle, {handle}': fill {handle} with the founder's handle. Re-run your tests and COMPLETE again.
