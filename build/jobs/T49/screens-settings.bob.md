# BOB to screens-settings (T49)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, screens-settings: **T49-22 · screens-settings**.
Your requirements: `build/requirements/screens-settings.md` (read whole), folded by K3339; the ids marked `*(not yet met: T49)*` are yours to meet (R30 re-worded; R34, R35, R36, R37, R38, R39).
BOB's notes for this job:
Words (K3366, K3368; R39): you hold no member-facing English. Your keys are `modules["screens-settings"].reads` in `docs/development/ux-substrate/screens/words-reads.json` (551 keys; merged at `fa3c8b7e8e`): read that entry whole (not the whole file). Read each sentence through setup-words' `word(key, vars)` (its R11; `hasWord` R12), delete your inline English and verbatim copies (`words.mjs` rows and the like) and every test comparing a sentence's text; assert each key with `hasWord`. Strings the entry marks `unkeyed` (0) stay. Drop the rows DEC-256 retired: `screen.updates.skip.noreason`. A sentence you need that no key holds is a REPORT to BOB, never inline English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
K3347 (Bob): R36 is withdrawn (no group-key pointer, no API-key preselection on `connect`); R30 stands. Build nothing new for API keys.
screens-settings (T49-22): its design-file red cleared (K3321 (B)); R34 `refusal.UPDATE_SKIP_NO_REASON` and DEC-236's keys; R35 (D26) Members counts the founder among active members and draws her row by her handle or `member.founder.unnamed` (membership R144); R36 (D27, amends R30) `connect` points an administrator to the group key on Members, and offers "My Claude subscription" only while the sign-in is installed; R37 (D30) Updates and Connect draw their sentences by key with every fill filled, and `translations` with nothing to show draws its empty state by key; R38 trimmed to DEC-246's additions (K3334): the sign-in's refusals beside the code under `connect.ifnot`, each by key with its reference. A wording that is the design's own goes to the channel act. (N1073) its five test files.
1. Measure first: on the local arm with T49-1 merged, what `memberlist`, `bootstrap` and `adminrecoverystep` answer for a fresh founder with and without a handle (`members.mjs`:66–68), and `part_signin` on the local arm.
2. Inherited reds: its design-file red, which this job clears (rule 5 (7)(B)); coverage on R34–R38 and the re-worded R30 (5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). Rule 6 at START, and N1073's five test files.
Merge order in L11: after interface-shell (T49-20), setup-words (T49-15, first in L11) and interface-assets (T49-19), whose shell, keys and classes you draw; until plane merges, test against a fake plane (K31's pattern); after screens-entry, and before screens-inquiry (T49-25), which uses you.
Reading set (mechanics §17, K3271): measured 547 KB with all your tests; 347 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

K3369: (1) membership (L2) is closed: name the founder by whoami.handle when she is the reader, else member.founder.unnamed; draw her row from what you can read, and say in your record what is short; memberlist's founder row is N1119 (T50). (2) Your best reading stands: draw a sentence only when every fill is answered, never empty or default; name plan, last4, used in your record. The design lane is asked to reword the keys without unanswerable fills (N1120). (3) Yes. PANEL_KEYS: forwarded to screens-inquiry.
