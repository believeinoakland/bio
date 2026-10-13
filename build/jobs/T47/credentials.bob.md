# BOB to credentials (T47)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 2, credentials: **T47-9 · credentials** · (N981) an API-key account reference (`accountreferenceset`) is refused `DISCLOSURE_DUE` while `disclosureOf` reads no disclosure for that member, so the order is held server-side (one site, K231: the row is credentials', control-plane R65 relays it, T47-65); (N955) R63 new `aiRunCredentialMint`: in-plane, member-scoped, the run on its row, writes limited to the mode's runner writes, a sub-day expiry, revoked at the next segment, the run's end, her revocation or sign-in disconnect · K2976 · text BOB's.
Your requirements: `build/requirements/credentials.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
K3033 (after the notes below were written): R63's `AI_RUN_WRITES` holds plan's writes too (`optionpropose`, with `airuntick`, `airunclose`), so a plan segment is not refused. K3030: answer-envelope R8's family-order pins go red from your merge until control-plane retires C-69.6 (rule 5 (7b)), accepted.
T47-9 credentials. Ids: R22 amended (an apikey reference refused DISCLOSURE_DUE via R64, after its other refusals; remove never refused). R64 new: registerDisclosureRead(module, fn) seam (listenerRefusal refusals) + disclosureDue({member}), the one site minting DISCLOSURE_DUE (K231), fail closed when fn throws/answers not shown, not asked when none registered; row C-29.40, words.json refusal.DISCLOSURE_DUE by key. R63 new: aiRunCredentialMint({member, run, writes}) in-plane, member-scoped, run on its row, writes within exported AI_RUN_WRITES (airuntick, suggest, capturerequest, airunclose; ai-runs passes the mode's), AI_RUN_CREDENTIAL_TTL_SECONDS < 1 day, answered once; refusals ACCOUNT_MEMBER_NOT_ACTIVE, AI_RUN_CREDENTIAL_MALFORMED (C-29.41), AI_KEPT_AWAY; revoked at next mint for the run, at aiRunCredentialsEnd({run}) (ai-runs at run end), R16 revocation, R43 disconnect; aiCredentialLook/aiCredentials answer its run.
Finding: disclosureOf is instance-setup's (L11); credentials (L2) cannot read it, hence R64's registration seam. Someone must register it (instance-setup T47-75 or plane T47-66): their entries do not say so yet.
Reds: answer-envelope envelope.test.mjs R8 DISCLOSURE_DUE pins (dec49Attach may resolve credentials' earlier row) and any one-code-one-row guard, until C-69.6 retires (T47-54/T47-65). Credentials' own row-list tests (rows-ops) re-pinned for two new C-29 rows.
K874: R22 is already named by tests, so its T47 clause needs an explicitly named test; "R64" is already matched by seam.test.mjs (membership R64 text), so the coverage check reads it as covered: R64 needs its own named test. R63 named by no test today.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 852 KB, over the 600 KB limit. Read your requirements and code whole; generated or vendored data and large fixtures are not part of the set (K2053, K2083); for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L2: record-core, membership, project-roster, credentials, promotion (the stamp, last). No L2 job uses another's new service, so each merges as soon as it is complete; promotion's stamp merges after the other four (it measures their rows: merge `tranche/T47` when BOB announces the last of them).

## B2 · ANSWER · re J1

Your literal reading holds (K3036): aiKeptAway() with no use, fail closed. No change.

## B3 · START

Depth 2. Second T47 job for credentials (out of layer, Bob K3069). Your entry: `build/plan/current.md`, **T47-81 · credentials** (R65–R70).
Your requirements: `build/requirements/credentials.md` (read whole); R65–R70, marked `*(not yet met: T47)*`, are yours to meet.
BOB's notes: Bob's own words govern D3 ("inactive" 15 minutes shared, 30 minutes own; signed out at once shared, 12 hours later own; the password again for weighty acts) and D10 ("until that authorization is either revoked (on the Anthropic side) or the token dropped (on the CivicSmith side)… It IS allowed"). Agent-runner R27/R28 and agent-worker R81/R82 (L6) are R70's users: `subscriptionTokenHold` is called by the door after a sign-in's `code` answer; `accountFor` hands the token to ai-runs and agent-worker. `membership.memberByHandle` exists (L2) for R67. The founder's role is `admin`; R70 lets the founder hold a sign-in (trace F2: today `subscriptionConnected({member: "admin"})` is refused and the door ignores the refusal).
The module is over its size mark (4,027 lines; N996's split is T48's): keep additions lean; say in your record the lines added.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. New rows join the row census red until T48's stamp (rule 5 (2)).
This is an out-of-layer job (Bob, K3069): L3 and L5 have merged or run since your layer closed; merge `tranche/T47` into your branch first (it already is at your START). No module that uses your new services has started; they start after your merge.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11) and report any red they show.
Reading set (mechanics §17): over the 600 KB limit as at your earlier T47 START. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.

## B4 · ANSWER · re J3

All eight readings kept (K3076); (1)–(7) stated as R71 on tranche/T47 (merge it; test R71 by name); (8) forwarded: membership R141 reserves the handle admin.
