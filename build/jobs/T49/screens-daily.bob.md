# BOB to screens-daily (T49)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, screens-daily: **T49-24 · screens-daily**.
Your requirements: `build/requirements/screens-daily.md` (read whole), folded by K3339; the ids marked `*(not yet met: T49)*` are yours to meet (R24 to R33, R34).
BOB's notes for this job:
Words (K3366, K3368; R34): you hold no member-facing English. Your keys are `modules["screens-daily"].reads` in `docs/development/ux-substrate/screens/words-reads.json` (336 keys; merged at `fa3c8b7e8e`): read that entry whole (not the whole file). Read each sentence through setup-words' `word(key, vars)` (its R11; `hasWord` R12), delete your inline English and verbatim copies (`words.mjs` rows and the like) and every test comparing a sentence's text; assert each key with `hasWord`. Strings the entry marks `unkeyed` (0) stay. Drop the rows DEC-256 retired: `screen.home.strip.overdue`, `screen.queue.due.overdue`. A sentence you need that no key holds is a REPORT to BOB, never inline English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
screens-daily (T49-24): R24 (D7) "Cite in the question" asks supports or against, none preselected, and is refused in place until one is chosen (`find-in.mjs`:223–231); R25 (D11, D30, D31) Home's start writes the project's `title` (`home.mjs`:318), door cards separate title and description, counts pick singular and plural keys, closed doors carry accessible text; R26 (D16) Find-in names its scope and results by title and place; R27 (D17) Ask draws a refusal by its words and `not_established` as the design does; R28 (D21) queue and to-do items name subject and act; R29 (D25) an invited project drawn with "Join" (`projectjoin`); R30 "Start a project" asks the title and who can find it; R31 "no reply recorded", never "overdue"; R32 `founder: true, handle: null` by `member.founder.unnamed`; R33 Projects' empty state only (the first question moved to screens-inquiry R43, K3334). (N1073) `contract:123`.
1. Measure first: confirm `projectlist`'s participation state for an invited member (R29). Confirm `citation`'s `found` form takes the question and its project, not the question twice as `find-in.mjs`:229 sends it. Confirm which record field `project.mjs`:93 reads as the title.
2. Inherited reds: coverage on R24–R33 (rule 5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). None of rule 5 (7)'s reds is this module's. Rule 6 at START, and N1073's `contract:123`.
Merge order in L11: after interface-shell (T49-20), setup-words (T49-15, first in L11) and interface-assets (T49-19), whose shell, keys and classes you draw; until plane merges, test against a fake plane (K31's pattern); after screens-intake, before screens-inquiry.
Reading set (mechanics §17, K3271): measured 409 KB with all your tests; 285 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

K3369: (1) project-roster (L2) is closed. If any read the member can make answers her invited state (project-roster R1's participants for a project she can see, or membership's participation through an op), use it and meet R29; if none does, report R29 not met and build nothing on a guess: N1118 adds participation to projectlist in T50. (2) Your reading stands: {project: <question>, question: <question>, found, role}. (3) Yes, title: beside objective:.

## B3 · CHANGE

CHANGE (K3370, K3371): op-capabilities, setup-words (word, hasWord, the generated list; WORDS_COMMIT 8a54848a9e) and interface-assets are merged into tranche/T49. Merge the tranche branch into yours now and re-run your tests against the real setup-words.
