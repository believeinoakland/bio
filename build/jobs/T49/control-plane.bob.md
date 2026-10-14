# BOB to control-plane (T49)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, control-plane: **T49-29 · control-plane**.
Your requirements: `build/requirements/control-plane.md` (read whole), folded by K3333; the ids marked `*(not yet met: T49)*` are yours to meet (R96, R97, R98, R99).
BOB's notes for this job:
Words (K3366, K3368; R99): you hold no member-facing English. Your keys are `modules["control-plane"].reads` in `docs/development/ux-substrate/screens/words-reads.json` (11 keys; merged at `fa3c8b7e8e`): read that entry whole (not the whole file). Read each sentence through setup-words' `word(key, vars)` (its R11; `hasWord` R12), delete your inline English and verbatim copies (`words.mjs` rows and the like) and every test comparing a sentence's text; assert each key with `hasWord`. Strings the entry marks `unkeyed` (13) stay. For AGENT_WORKER_UNBOUND read `ai.refused.notdeployed` (U260: the refusal's own words speak of signing in). A sentence you need that no key holds is a REPORT to BOB, never inline English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
control-plane (T49-29): R96 (D1, N1095) the door strips a body `member` only for `stepsource` and `stepsourcewithdraw` (R92), never for every op declaring it (`control-plane/index.mjs`:2477), so `accountreferenceset` and `accountreferenceremove` reach ai-accounts with the member's own `member`; R97 `claim` passes `handle` and no `role`, and `founderhandleset` is routed to the founder's own session only (K3333); R98 `projectownervotes` routed through project-roster's map, `viewer` stamped from the session.
1. Measure first. Seven ops declare a `member` stamp today: `ask`, `aigrantmint`, `stepsource`, `stepsourcewithdraw`, `accountreferenceset`, `accountreferenceremove` and `accountreference`. Only `accountreferenceset` and `accountreferenceremove` read `member` from the body (`ai-accounts/index.mjs`:1709–1710); the others read it from the address (`connections/index.mjs`:1551–1553, credentials `aigrantmint`). So R96 changes what reaches an owner for those two alone. Confirm this against the merged owners at START. A line owed by admission's M-T49-4 (the session passed to `doorWindowGate` in the body) comes through BOB (P9).
2. Inherited reds: rule 5 (7) (A)'s reds (capture-requests `plane.test.mjs` (6), agent-worker `harness.test.mjs` REC100-1b/2/2b, scheduler `plane` R12), run at the merge and named cleared or not; rule 5 (3)'s route censuses for `founderhandleset` and `projectownervotes`, cleared here; coverage on R96–R98 (5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). Rule 6's items and the `admin` grep run at START.
Rule 6's N1073 item is not yours: the four registries' hand-lists (op-grades, affordances, op-declarations, control-plane) wait on N1074 (Left out).
Merge order in L11: after op-declarations (T49-17), admission (T49-18) and every screen job (T49-21 to T49-28), which you use; before plane (T49-30).
Reading set (mechanics §17, K3271): measured 3523 KB with all your tests, 2860 KB without them (the used public parts are an upper bound), over the 600 KB limit. Read your requirements, entries, layer contract and own code whole; for the used modules' services your entries touch, if they exceed what you can read, give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

K3369 (ADMISSION #12 J1 (2)): at control-plane/index.mjs:723 call doorWindowGate({ req, env, op, spec, doAnswer, credential, background }) — both names are in scope in makeFetch (credential at the queryGate call, background at :611), so a body-borne session is counted in its session's window (admission R27). Not blocking; part of your job.

## B3 · CHANGE

CHANGE (K3370, K3371): op-capabilities, setup-words (word, hasWord, the generated list; WORDS_COMMIT 8a54848a9e) and interface-assets are merged into tranche/T49. Merge the tranche branch into yours now and re-run your tests against the real setup-words.
