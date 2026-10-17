# BOB to project-roster (T50)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 2, project-roster: **T50-3 · project-roster**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/project-roster.md` (read whole), folded by K3617; the ids marked `*(not yet met: T50)*` are yours to meet (R1, R8, R9, R18, R30–R33).
BOB's notes for this job:
1. R1, R8 (N1124): `joined_at`, `owner_since`; `set_by` by handle, the founder by `membership.founderHandle()`, never `admin`.
2. R9 (N1129): `projectDirectory` takes the founder's viewer.
3. R30 (N1135): owner votes tie by insertion order; this clears plan rule 5 (10)'s intermittent `owner-votes` R30.
4. R31, R32, R18 (N933, Bob's K3230 "N933: B"): the stake per matter; `archive/drafts/draft-N933-stake-per-matter.md` is background only, the requirements bind. Later layers (case-import, public-read, actions, action-records, filings, conformance, control-plane) read your `projectStake`.
5. R33 (N1124): `projectOwnersGone` (`op=projectownersgone`). Ops are declared and graded in L11 (T50-24, T50-18); you provide the services.
6. N1118 (confirm only): confirm `projectlist` already answers each row's `participation` (`joined`/`invited`) as screens-daily R29 needs; say so in your record, or REPORT if it does not.
Reading set: measured under 600 KB without your tests (`reading-sets.py`); read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md` L2), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L2 merge order: membership, project-roster, ai-accounts, credentials, promotion last (the stamp). All five run at once; a job that uses an unmerged one's new service builds against its requirement and merges the tranche branch when BOB's CHANGE says the provider is merged.

## B2 · ANSWER · re J1

K3624: your recommendation taken. membership R152 `memberStatusSince(memberId)` is added to MEMBERSHIP #40's running job; R33 amended (merge the tranche branch): `since` is the latest of `memberStatusSince` over the owners, `null` when any is `null`; no `members.updated` stand-in. Build against R152's text; I send a CHANGE when membership is merged. `modules.json` now also gives you `setup-words` in `uses`.

## B3 · CHANGE · re J2

Re J2 (1): K3629 adds project-roster R34 on tranche/T50 @ 4bc2207af1: projectlist's rows carry participation, the viewer's own state (joined, leaving, invited; null for a non-participant). Merge tranche/T50 into your branch, build R34 with its test and control, run your tests and users' (screens-daily reads it later), and record COMPLETE again. (2) words: the two keys go to the design lane (HANDOFF B267); keep C-147.9 translation null until then. (3) the plane roster ops-map and op-declarations t45 reds are accepted by name until L11 declares the three ops (K3629). (4) bundle and program.mjs: regenerated at layer close. Membership R152 is not merged yet; I will CHANGE you when it is.

## B4 · CHANGE

membership is merged into tranche/T50 @ dadaa9ada1 (K3633), with R152 memberStatusSince. Merge tranche/T50 into your branch, drop the stand-in so R33 reads the real service, run your tests and record COMPLETE again. Note from membership: memberList now answers a founder row with no members-table row; tolerate it where you join member_id to members.
