# op-declarations (T41)

**Status** · session_01HSBgxknUm7jJ6a36oW3vEv · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Readings I am building on (carrying on; only (1) could change what I build):
(1) reading-guides' map (`readingGuidesOps`) serves five ops no requirement here names: `guidepropose` (its R12 machine draft), `guideproposetocivicsmith` (R6), `guidefor`, `guide`, `guideproposals`. R43 names six. Reading: they get no spec now (the door answers each as an op with no spec), my t33 lists them as served-undeclared pending your answer. Alternative: R6 makes me declare them (proposal / member act / three session reads), which then needs op-grades, affordances and control-plane shares.
(2) `bearingnote` (run-productions R23): the owner reads the caller as `principal` and `viewer`, never `by`. Declared a session's act, `contribute`, stamped `viewer` and `principal` (new kind `sessionrunact`), not `by` as R43's general sentence says.
(3) `stepsrunai` (ai-runs R74 `openMany`): owner reads `actor`, `viewer`, `principalPlane`. Declared a member's act (`contribute`, a run's open), stamped `by`, `viewer` and `principal`.
(4) `accountpropose` (case-authoring R64): the owner's method is a run's labelled draft (needs `run`, reads `proposedBy`). R43 says sessions only, so declared a member session's act, `contribute`, `by` stamped (the door hands it as `proposedBy`); an agent credential cannot reach it. Say if R43 meant a proposal any credential reaches.
(5) R46 `recordcapturedlocator`: it has no spec today, so the door already answers it "unknown op"; only the store reaches it in-process. Reading: it is a store-internal route (R6's list) with no spec, so no caller writes any receipt through it, upload or other; test asserts it in no table while provenance's map serves it.
(6) `handlecheck`: R42's bullet says no NEEDS row, K2574 says a present null; I took K2574.
(7) `reportdraft` declared a read (investigation R6: writes nothing).
(8) NEEDS: `null` (the member's own) for `stepreminder`, `questionfollow`, `findmute`, `milestonereminder`, `projectwatch`, R41's owner acts and `accountusesset`, `ailimitset`, `exploreapprove`, `handlechange`; `approvalruleset` an administrator's (null); `caseapprove` and every other act `contribute`; reads null.

## Completion

**Entry applied:** T41-58 (was T40-23), with B1's notes and B2's CHANGE (K2574). In `bio-plane/src/op-declarations/index.mjs` (3,283 → 3,411 lines, under K617's ~4,000):
- R41: credentials' family gains `projectkeyset`, `projectsigninset`, `projectaccountremove`, `projectaccountswitch`, `projectkeynoticeseen`, `projectaikeepaway`, `accountusesset` (owner's or member's own acts, session only, `by`) and `projectaccountstate`, `projectkeynotice`, `projectaikeepawaystate`, `accountuses`, `accounthistory` (session reads, `viewer`). A new `ai-use` family holds `ailimitset`, `exploreapprove` (own acts) and `ailimits`, `aiusage` (both arms, with and without `owner`), `aiestimate`, `aiactual` (session reads). Retired (DEC-188 (8)): `aiceilingset`, `aicopyceilingset`, `accountswitchset`, `groupswitchset` have no spec, no row and no stamps; `aiusage` left ai-runs' family.
- R42: membership's family gains `handlecheck` (new kind `publicread`: public, a present null row per K2574, `viewer` stamped alone) and `handlechange` (own act, `by`).
- R43: new families `steps`, `question-explorer`, `investigation`, `reading-guides` (body `by`), `run-productions`, `leg-earning`, `case-authoring`, `review`; additions to `hypotheses` (body `by`), `inquiry`, `ai-runs` (`stepsrunai` for R74 `openMany`, `grouptestset`, `grouptestresults`) and `actions` (`actionseekspropose`, a proposal, `proposer` from the query). That is 78 ops in all, with K2496's, K2486's, K2560's, K2561's and K2570's included. `readpages` uses the new kind `runact` (as `extractpropose`: any credential, `contribute`, `viewer` and `principal`). `bearingnote` uses the new kind `sessionrunact` (session only, `contribute`, `viewer` and `principal`; J1 (2)).
- R45: a `capture` family with `captureupload` (a member's session only, `contribute`, `by`).
- R46: `recordcapturedlocator` stays a store-internal route with no spec, so no caller reaches it (J1 (5)). `planproposals`' spec is unchanged, and action-plans' arm hands its owner no `after`.
- R25: the three set-time ops move to a `publish-schedule` family, which its own map serves.
- R20, R24: re-stated for the retirements.
- R34: every new member op is named in `ACT_HELP_ABSENT`, grouped by kind:
  - reads under the read ground;
  - R41's and R42's ten owed acts, which PR #19's `mock-acts.js` explains, under a new `owed` ground until affordances' T41 job carries their texts;
  - the other acts under "unexplained", named back to the design stream.

**Readings (J1, open):**
- (1) reading-guides' five unlisted ops get no spec yet. If BOB rules otherwise, a CHANGE adds them.
- (2)–(8) as J1 states them.

**Inherited reds cleared:**
- Rule 4 (7): `t33` R19 and `t35`:196.
- Rule 4 (12): `t34`:226.
- Rule 4 (20): `t34`:258.
- Rule 4 (10): the `aiceilingset`/`aicopyceilingset` specs are gone; no op-declarations test names a retired ceiling code or op.
- `t34` R21 and R27 now read the registry and library as PR #19 left them (`wizard-scripts` R13/R22, K2484): 58 functions; the eleven owed R41/R42 acts are read as served; the library names `ailimitset` and `accountusesset`. `infolevelset` stays the one owed act with no spec.
- Rule 4 (15), control-plane `r53-routes.test.mjs`:67: its hypotheses part is cleared. It stays red only because its own `ARMS` list still names `accountswitchset`, `aiceilingset` and `aicopyceilingset`, which control-plane's job restates (below).

**Reading set (K2304):** I did not run `reading-sets.py`. My own code, tests and requirements alone come to 557 KB (code 273 KB, tests 228 KB, requirements 56 KB), so the set is over 300 KB.
- Read whole myself: `requirements/op-declarations.md`, layer 11's rows of `layers.md`, `index.mjs`, all 14 existing test files, and the listed rulings.
- A worker read whole the used services R41–R46 name (credentials, ai-use, ai-runs, membership, steps, question-explorer, investigation, hypotheses, inquiry, leg-earning, run-productions, reading-guides, case-authoring, review, actions, capture, provenance, action-plans, publish-schedule, ratification). It wrote a summary of about 3,500 words citing file and line for each op's method, map arm, actor site and refusal.
- What the summary raised that mattered is in J1 (1)–(5) and under "Found in other modules" below. Nothing it left out mattered.

**Deferred:** none.

**Found in other modules (also REPORT J2):**
- (a) capture: `captureOps` has no `captureupload` arm, although control-plane R72 routes the op "to capture's own map" (capture R86 serves `uploadCapture` only as a method).
- (b) plane: `aiUseOps`, `readingGuidesOps` and `publishScheduleOps` are exported but not spread into the store's route map. `publicationOps` no longer serves the set-time ops.
- (c) admission `admission.test.mjs` R19 and control-plane R56/R30 still name `groupswitchset` among "the group key's seven ops", and control-plane `r53-routes` `ARMS` names the three retired ops. Each turned red or stays red at my merge by the provided retirement (admission R19, control-plane R56, K2484). Their L11 jobs come after me.
- (d) ai-use R10's requirement gives `estimate` no `viewer`, but the code takes one.
- (e) steps: no requirement says which method the op `steps` calls (R4 has `step`, `stepsOn`, `stepsIn`, `stepsOfGroup`). This is control-plane R71's to route.
- (f) reading-guides' map serves five ops no requirement declares (J1 (1)).

**Final `uses`:** as `modules.json` lists them, plus `reading-guides`, `run-productions`, `steps`, `question-explorer`, `investigation`, `leg-earning`, `case-authoring`, `review`, `provenance` and `action-plans`. The tests import the maps of reading-guides, run-productions, provenance and action-plans and read the owners' services. The architecture check fails on exactly the first two until BOB applies these.

**Tests and checks run:**
- `node --test bio-plane/test/m/op-declarations/`: 128 pass, 0 fail. New `t41.test.mjs` covers R41–R43, R45, R46 and R34/R6 over them, each test with a negative control; `t33`, `t34` and `tables` are re-stated.
- Users' suites, compared with `tranche/T41`:
  - No new red in affordances, op-grades, wizard-scripts, store-door or instance-setup.
  - New reds: admission R19 and control-plane R56 (`groupswitchset`, item (c) above).
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs`: 2 failures, the `uses` edges `reading-guides` and `run-productions`, for BOB to apply.
- `checks/coverage.mjs`: 45 of 45 ids, 0 failures.
- `checks/ownership.mjs`: 0 failures.

Size (session_01HSBgxknUm7jJ6a36oW3vEv): test runs 16, module lines 3411

## J2 · REPORT

Found in other modules (record, Completion): (a) capture's map has no captureupload arm though control-plane R72 routes it there; (b) plane composes neither aiUseOps, readingGuidesOps nor publishScheduleOps (publicationOps no longer serves the set-time ops); (c) admission R19's and control-plane R56/R30's tests still name groupswitchset, and control-plane r53-routes' ARMS names accountswitchset, aiceilingset, aicopyceilingset: red at my merge by the provided DEC-188 (8) retirement, theirs to restate (r53-routes' hypotheses part is cleared); (d) ai-use R10 gives estimate no viewer, the code takes one; (e) no requirement says which steps method op=steps calls (control-plane R71's routing); (f) reading-guides' five undeclared ops (J1 (1)). Final uses: add reading-guides, run-productions, steps, question-explorer, investigation, leg-earning, case-authoring, review, provenance, action-plans (architecture fails on the first two until applied).

## J3 · COMPLETE

T41-58 done: R41, R42, R43 (78 ops, with K2486, K2496, K2560, K2561, K2569, K2570), R45, R46, R20/R24/R25 clauses; retirements; R34 for every new member op. 128/128; format, coverage (45/45), ownership 0; architecture 2 (uses, for BOB). Inherited reds of rule 4 (7), (10), (12), (20) cleared; (15) cleared but for control-plane's own ARMS list. J1's readings stand open (only (1) could change the build). Record: Completion.
