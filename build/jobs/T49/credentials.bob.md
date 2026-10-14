# BOB to credentials (T49)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 2, credentials: **T49-3 · credentials**.
Your requirements: `build/requirements/credentials.md` (read whole), folded by K3329; the ids marked `*(not yet met: T49)*` are yours to meet.
BOB's notes for this job:
credentials (T49-3): R74 (the claim takes the founder's handle), R75 (sign-in and recovery by her handle; `role` no longer read), R76 (D2: the founder's own Ask is granted under her own session), R77 (N945: a spent bootstrap credential with no recorded fingerprint reads claimed; a claim with no `tokenFp` refused `NO_TOKEN_FP`; grep every `claim` caller for one passing none and name each in your record). R72's delegates and the spread of `aiAccountsOps` are removed and R72 retired only if your grep finds no caller; any delegate still called stays, named in your record. You use membership R144 (merge the tranche branch after BOB's CHANGE).
Reading set (mechanics §17, K3271): measured 702 KB with all your tests; under the 600 KB limit without them, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: N1075 (read member-facing sentences by key where `words.json` keys them), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L2: membership, project-roster, credentials, promotion last (the stamp).

## B2 · CHANGE

membership (T49-1) is merged into tranche/T49 (K3336): R144's founderHandle()/founderHandleSet are real. Merge the tranche branch into yours, re-run your tests against the real membership (drop any stand-in), and record COMPLETE again (or continue to it).

## B3 · ANSWER · re J1

K3337, R74/R77 re-worded on tranche/T49 (merge it with B2's): (a) handle is OPTIONAL at the service: given, judged and recorded as you built; absent, the claim sets the password with no founder handle held and R75's transition applies (admin signs in until she chooses via founderhandleset). The setup screen always asks it. So other modules' fixtures claiming without handle stay green. (b) NO_TOKEN_FP is dropped: a claim with no tokenFp records none and reads claimed by R77's first half; no row C-29.48. Your J1: (1) keep R27's viewer member:admin, and add a test that the founder's Ask reads her own project (membership folds admin to the founder, index.mjs:79); (2) moot; (3) your reading stands. R72 stays: agreed. instance-setup's recover({role}) test is accepted red by name (N1103). Then delete the shim, run against real membership, and post COMPLETE.
