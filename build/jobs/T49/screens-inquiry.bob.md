# BOB to screens-inquiry (T49)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, screens-inquiry: **T49-25 · screens-inquiry**.
Your requirements: `build/requirements/screens-inquiry.md` (read whole), folded by K3339; the ids marked `*(not yet met: T49)*` are yours to meet (R6's K3003 clause re-worded; R23 to R43, R44).
BOB's notes for this job:
Words (K3366, K3368; R44): you hold no member-facing English. Your keys are `modules["screens-inquiry"].reads` in `docs/development/ux-substrate/screens/words-reads.json` (273 keys; merged at `fa3c8b7e8e`): read that entry whole (not the whole file). Read each sentence through setup-words' `word(key, vars)` (its R11; `hasWord` R12), delete your inline English and verbatim copies (`words.mjs` rows and the like) and every test comparing a sentence's text; assert each key with `hasWord`. Strings the entry marks `unkeyed` (2) stay. A sentence you need that no key holds is a REPORT to BOB, never inline English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
screens-inquiry (T49-25): R5's red cleared (K3321 (B)); the question page (R23–R26, R34 Supports from the inquiry's own cited legs, R35 Concluding once an accepted reading stands), the project page (R27–R30, R29 reading project-roster R30; R36 the plan linked by name), Read in my language (R31), the document page (R32), the dock (R33, also amending R6's K3003 clause: bounds the run can run under, `started: false` a refusal, a withheld dispatch drawn by key), R37 the not-joined `projectai`, R38 "Add a document" (screens-intake R22), R39 no record id as a title, R40 the unnamed founder, R41 the question's designed states (DEC-245), R42 the reasons the assistant can't work (DEC-246), and R43 "Your first question" on the project page (moved from screens-daily, K3334). (N1073) `common:23`, `projectai:39`, `question:65`.
1. Measure first: re-measure the module (1,723 lines). It grows most, to about 3,000 lines estimated. If it is past ~4,000 before its work, BOB splits it first (P6). Read from the plane the bounds a `check` and a `plan` run need (`run-rules`), for R33.
2. Inherited reds: R5's design-file red, which this job clears (rule 5 (7)(B)); coverage on R23–R43 and the re-worded R6 (5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). Rule 6 at START, rule 6's D29 check on every `ok: true` it draws, and N1073's `common:23`, `projectai:39` and `question:65`.
Merge order in L11: after interface-shell (T49-20), setup-words (T49-15, first in L11) and interface-assets (T49-19), whose shell, keys and classes you draw; until plane merges, test against a fake plane (K31's pattern); after screens-settings (T49-22), which you use, and screens-daily; project-roster R30 (T49-2) is merged by layer.
Reading set (mechanics §17, K3271): measured 420 KB with all your tests; 320 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

K3369 (SCREENS-SETTINGS #4 J1): screens-settings' words.mjs rows go (SCREEN_WORDS stays exported, empty). projectai.mjs:16 and :160 filter that list for screen.panel.*: read screens-settings' PANEL_KEYS (panel.mjs) and word(key, vars) instead. Build against it now; merge the tranche branch when BOB's CHANGE says screens-settings has merged.

## B3 · CHANGE

CHANGE (K3370, K3371): op-capabilities, setup-words (word, hasWord, the generated list; WORDS_COMMIT 8a54848a9e) and interface-assets are merged into tranche/T49. Merge the tranche branch into yours now and re-run your tests against the real setup-words.

## B4 · CHANGE

K3372 (SCREENS-INTAKE #4 J2): your R38 'Add a document' opens /app/capture/<tab>/<id> (the subject in the path, project or question id), never ?for=.

## B5 · ANSWER · re J2

K3372: both readings stand: J1 the frozen per-mode bounds table derived from run-rules, no zero allowance, tested through checkConsume; J2 the reasons list only where the assistant cannot work, each by key, the serving account always said.
