# BOB to interface-shell (T49)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, interface-shell: **T49-20 · interface-shell**.
Your requirements: `build/requirements/interface-shell.md` (read whole), folded by K3339; the ids marked `*(not yet met: T49)*` are yours to meet (R65, R66, R67, R68, R69, R70).
BOB's notes for this job:
Words (K3366, K3368; R70): you hold no member-facing English. Your keys are `modules["interface-shell"].reads` in `docs/development/ux-substrate/screens/words-reads.json` (175 keys; merged at `fa3c8b7e8e`): read that entry whole (not the whole file). Read each sentence through setup-words' `word(key, vars)` (its R11; `hasWord` R12), delete your inline English and verbatim copies (`words.mjs` rows and the like) and every test comparing a sentence's text; assert each key with `hasWord`. Strings the entry marks `unkeyed` (3) stay. A sentence you need that no key holds is a REPORT to BOB, never inline English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
interface-shell (T49-20): R65 the shell draws its own elements with the design's classes (`mk-lvlbtn` added, fold (b) finding 2) and drops its own rules from `STYLE`; R66 `REF_SCREENS` gains `plan`, `timeline`, `money`, `calculation`, `case-editor`, `review-copy`, `ceremony` and `docket`, each card by key; R67 the test-instance band is the design's `.cs-band[data-band="test"]`; R68 three rules: explanations close, nothing clipped at 390 px, no console line for an expected refusal (`REAUTH_DUE`, conditional, doubt 10); the plan's "no explanation-level name" clause is dropped (K3334); R69 the phone's More page draws `rail.<k>.line` and `screen.more.sub` in `mk-morerows`/`mk-morerow`, and a refusal's reference is drawn by `refusal.reference`. (N1073) `kit:398`, `session:210` and `frame:51` read the owners' declarations.
1. Measure first: D28's console line on the local arm. Is it the page's own `console` call, or Chromium's network log of the 403 (doubt 10)? Record which, since R68's third rule depends on it. Re-measure the module (2,414 lines).
2. Inherited reds: coverage on R65–R69 (rule 5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). The screen modules' tests that pin `shell.trace` or `cs-testband` go red at this merge until their own jobs; name them (K2704). Rule 6 at START, and the N1073 lines `kit:398`, `session:210` and `frame:51`.
Merge order in L11: after setup-words (T49-15, first in L11) and interface-assets (T49-19), whose keys and classes you read; before every screen job (T49-21 to T49-28).
Reading set (mechanics §17, K3271): measured 702 KB with all your tests; 449 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

K3369: your requirements gain R71 (merge the tranche branch for it): (1) ADMISSION #12 J1 (3): the startup bootstrap (browser.mjs:1903, sent { public: true }) carries the page's session in Authorization whenever the page holds one, so a signed-in member's page loads count in her session's window (admission R27); (2) SCREENS-ENTRY #3 J1 (1): RE_POINTS gains setup: ["founderhandleset"] (front's pattern), until the registry lists it, so screens-entry's setup composes once op-declarations R71 declares the op. Screens-entry waits on (2): push it early in your job.

## B3 · CHANGE

CHANGE (K3370, K3371): op-capabilities, setup-words (word, hasWord, the generated list; WORDS_COMMIT 8a54848a9e) and interface-assets are merged into tranche/T49. Merge the tranche branch into yours now and re-run your tests against the real setup-words.

## B4 · CHANGE

K3373: your requirements gain R72 (merge the tranche branch): wizard-scripts' SCREEN_REGISTRY is stale (4664e8efd4) and lacks 61 acts the design's registry.json now lists, so checkScreens refuses every T49 screen act. RE_POINTS admits exactly these until the registry is re-taken (N1122, T50): `connect`: `reauth`; `group`: `declaredstakeset`, `writinghelp`; `projects`: `themeread`, `projectjoin`; `theme`: `themeread`, `themedeclare`, `themeplace`, `themewithdraw`; `queue`: `projectjoin`, `release`, `filingapprove`; `finder`: `themeread`; `document`: `adoptversion`, `keepversion`, `connectionchoose`, `explore`, `themeplace`, `themepropose`, `themewithdraw`, `captureprogressions`, `thread`; `project`: `projectvisibilityset`, `projectownerremove`, `projectowneradd`, `projectremove`, `projectleave`, `projectfork`, `projectownerrescue`, `writinghelp`; `projectai`: `projectjoin`; `question`: `inquiryground`, `versionaccept`, `versionhide`, `versionconsider`, `versionreject`, `versionrevert`, `versioncurrent`, `readtranslate`, `themeplace`, `airunopen`, `airunclose`; `person`: `entityalias`, `relationdeclare`, `resolve`, `resolvetestify`, `connect`, `writinghelp`; `timeline`: `instance`, `thread`, `discharge`, `proposedispose`, `progression`, `progressiondefine`; `explore`: `stepsource`; `plan`: `planask`; `start-send`: `writinghelp`; `action`: `actionrisktier`, `actionlaws`, `actionlawspropose`; `review-outside`: `statementack`; `home`: `projectjoin`. Test as R72 says. Four screen jobs wait on this: push it early, then tell me (a REPORT is enough) so I can CHANGE them.

## B5 · CHANGE

K3374: the design's later words (DEC-259–DEC-261; 11,823 words) are merged into tranche/T49 and setup-words' rows.mjs regenerated. Merge the tranche branch. Placeholders changed in DEC-259 for archive.summary, calculation.counts, calculation.range, help-records.must.*, held.waiting, request.howsend.*: re-read any of these you draw and fill exactly their placeholders. SITE: civicsmith.org's keys (DEC-261) are now in words.json; site.groups.rule no longer says 'below'.

## B6 · CHANGE

K3379: op-declarations, control-plane, plane and site are merged into tranche/T49, and the design's DEC-262 words (7ed8feb945) with setup-words' rows.mjs regenerated. Merge the tranche branch. One addition to your R72 interim RE_POINTS, under its existing meaning (each act the design's registry lists that the shell's stale copy lacks, until the registry lists it): `connect: ["reauth"]` (DEC-249; SCREENS-SETTINGS J2 measured interfacePage throwing on it). Every screen job now waits on your merge: push R71/R72 as soon as they pass and post COMPLETE; R65–R70 may follow in the same job.
