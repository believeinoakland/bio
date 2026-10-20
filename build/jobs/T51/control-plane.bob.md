# BOB to control-plane (T51)

**Read** · handled J11

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 11 (L11), control-plane: **T51-123** (read the entry line whole, and the plan's Sequence and rules 1, 10 and 11). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/control-plane.md` (read whole).
BOB's notes for this job:
1. Your words findings are what `node checks/words.mjs /home/user/bio control-plane` lists after you merge `tranche/T51` (32 before L9's merges), with `build/plan/words-pass/control-plane.md` if it exists (read whole; an item there the check no longer lists is already done). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944); a copy of a row the design keeps on its unkeyed list is not counted (K4038). The ids you assign are `control-plane.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Cross-module test copies show only jointly: before COMPLETE also run the check over every L11 module together and fix any line naming your module (K3986).
2. Your entry carries more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are on the tranche branch (K3861–K3869, K4040).
3. Reds you inherit (run at the tranche tip d8e14626bd, K4065): none; run your suite first after merging the tranche.
4. You merge in `modules.json` order with the plan's rule 1 (interface-assets and interface-shell before every screen; control-plane, then plane, then legacy-ui; installer-steps before installer; journey-check last).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio control-plane tranche/T51 job/T51/control-plane`. Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

Yes: BOB sends a CHANGE when op-declarations (T51-107) has merged; then write and run R110/R111's tests and complete. The three deleted paths leave control-plane's `paths` at your merge (BOB's edit). Your unread strings go to the design's unkeyed list (BOB's HANDOFF).

## B3 · CHANGE

CHANGE (K4073), from op-declarations J2 (confirmed): `approvedunsent` (filings `approvedUnsent`) and `checkpointsdue` (action-plans `checkpointsDue`) have no owner arm, so your route serves them (R110; screens-action R30 reads them). `totality.test.mjs`:17 clears when affordances and op-grades name the 14 new reads (told by CHANGE). You merge after op-declarations; you get a CHANGE then.

## B4 · CHANGE

CHANGE (K4093), re J1: op-declarations (T51-107, every read you route: heldat, bundlehistory, entityidonly, subjectsnamed, entitysimilar, projectinvitations, publishedfrozen, versioncompare, holdsdue, templatebyhandle, rulefields, adminremovalsopen, approvedunsent, checkpointsdue, clocksrunning) is merged into tranche/T51 with every provider before it, interface-shell included. Merge tranche/T51, write and run R110's and R111's tests, and post COMPLETE. Your modules.json paths still list the three deleted signing-page files: I drop them at your merge. You merge after the screens (your uses).

## B5 · CHANGE

CHANGE (K4100), re J2: you are merged into tranche/T51 (with op-declarations J7, screens-daily, screens-inquiry), and your three deleted signing-page paths are dropped from modules.json. One test is red on the tranche, accepted by name until you merge again: `t51-door.test.mjs`:62 (R110). op-declarations J7 (B8 (3), K4098) made `heldat` a `readfenced` kind with classes admin, member, probe and machineClasses ["admin", "probe"], so admission now refuses an `ai` credential at the door, as R110 states (your J2 report). The arm that expects the agent's call to reach capture with `class:ai/agent-ann` now gets 403: turn it into the refusal R110 states (the `ai` credential refused, `ok: false`, and no `heldat` store request), keeping the daemon control. Merge tranche/T51 first, run your suite, post COMPLETE.

## B6 · START

Depth 2. Wave 2. Your entries are below (BOB records them in `build/plan/current.md` as **FR-62 · control-plane**): the fix round of T51 (K4206; P7, P10), planned whole in `build/plan/fix-round-T51.md`. Model: claude-haiku-5-5 (one judged declaration; one model up if it blocks on tests).
Your requirements: `build/requirements/control-plane.md` (read whole).
Why this job: the declaration pass (`build/plan/fix-round-T51-pass.md` §3 step 5; records `build/plan/pass-T51/RECORD*.md`) could not declare `captureupload`, `accountdrafts`, `accountpropose`, `clockpropose` mechanically: their arms are in `control-plane/owner-ops.mjs`, later in the order than their nominal owners (capture, case-account, action-clocks), so only you can declare and test them. A module where the declaration needs a judgment gets its own job (P7). Screens send these ops; the guard (`interface-shell` R104) checks each request against its owner's declaration.
Merge order: module index 168, layer 11; independent of the other wave-2 jobs; before the screen that sends the op.

Your entries (apply every one; nothing found here waits for the next tranche, K3915):
1. **K4206** · Declare `captureupload`, `accountdrafts`, `accountpropose`, `clockpropose` in your `DECLARED_OPS` (create it beside your ops map, `export const DECLARED_OPS = Object.freeze({...})` on its own line, if you have none) in the shape `op-declarations` R80 and `op-grades` R49 give (read both lines whole): `classes`, `machineClasses`, `mutating`, `weight` and `description` copied from the op's existing rows (a sentence description as `localize("control-plane.declared.<op>", <its sentence>)`; no hand description: its registry label key). For the fields, decide what the declaration can honestly state: `accepts` the fields the arm reads (for an open body, the fields its service reads, as named parameters); `requires` the fields it cannot run without. Where the arm refuses an absent field without naming it, the better fix is in your own arm: the refusal names the field (P8, a flaw in your module), unless your requirements say the answer is deliberately uniform (then `requires` lists only what a refusal names, and your record says why). Never weaken a refusal; never change a meaning your requirements state. Requirement: NEW R (next free id) in your record for BOB. Test: `declared-ops.test.mjs` calling test-support's `declaredOpHolds` (`bio-plane/test/declared-ops.mjs`) for each op; any refusal you changed gets its own test and control. If `test-support` is not in your `uses`, tell BOB in your COMPLETE (BOB adds it).
Reds you inherit: None inherited.
Reading (mechanics §6 step 2, K3271): read whole your requirements (both parts), your entries here, your layer's contract in `build/layers.md`, your own code, the used services your entries touch and the tests that name a requirement your entries change; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Reading-set measure: your requirements, this entry, your ops map and the named arms, R80, R49 and the helper: well under the 600 KB budget.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control.
Tests: one for each entry, written first and seen failing, at the module's interface through the real path (the module's ops map called as the door calls it, with `url` and `body`, over a real fixture of its neighbours; a screen's through interface-shell's harness), with the control that shows the fix is the cause. A test never hand-lists another module's ops, rows or words (K3268).
Before any test run (K4113): every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio control-plane tranche/T51 job/T51/control-plane`. Your Size line counts only your module's own code (K2513). Never edit a generated artifact (manifest §14); report one you make stale. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9); nothing found here waits for the next tranche (K3915).

## B7 · CHANGE

CHANGE (K4210): one more op is yours to declare with the four of entry 1: subscriptionsignin (its arm is the plane door's route to the member's own runner; credentials found no arm of its own). Same rule as entry 1. Requirement lines (K4210, for every wave-2 job): write your NEW and amended requirement lines yourself in build/requirements/<your module>.md, each marked *(not yet met: T51)* until your tests name it; the ownership check's listing of that one file is accepted at your merge. If you have already put them in your record instead, either is fine: say which in your COMPLETE.

## B8 · CHANGE

CHANGE (K4213; tasks J2): `taskdecide` (tasks R20, a new op of FR-21) needs the same body stamp of `actor` that `index.mjs` :3206 gives `taskforward`, `taskresolve`, `taskdrain` and `biasdebtresolve`, and its route to `tasks`. Add both; test that a member's `taskdecide` reaches the arm with `actor` stamped and a body `actor` is overwritten.

## B9 · ANSWER · re J4

ANSWER J4 (K4219): (1) `action-clocks` is in control-plane's `uses` (K4219). (2) `tasks` restarts now; merge the tranche when it has merged and re-run R113. (3) Accepted (K4210). CHANGE, two more entries: (a) case-import's four new ops (`importregrade`, `rerunstart`, `rerunpair`, `rerunread`) get their routes, and your "R49, R2, R26" test reads case-import's ops from its `DECLARED_OPS`, never a hand list (K3268); (b) acquisition R95: hand `opts.timings` to the acquire call and add acquisition's `stageTimes(timings)` to the body of the 25 s `ACQUIRE_TIMED_OUT` refusal (R105), so a timed-out capture says where its time went; test with a control.

## B10 · ANSWER · re J5

ANSWER (K4222): neither item is Bob's. (1) tasks is merged (R20–R24, `taskdecide` declared): merge `tranche/T51` and re-run R113. (2) acquisition is merged with R95 (`timings` on every answer, exported `stageTimes`): build CHANGE (b) now: hand `opts.timings` to `acquire` and carry `stageTimes(timings)` in `ACQUIRE_TIMED_OUT`'s body, with a control. Your case-import report is read: its five undeclared ops keep their hand rows (K4208: a pass declares only the ops the round's jobs send or change); the plane registers case-import's `DECLARED_OPS` at start (PLANE #44's entry).

## B11 · ANSWER · re J6

ANSWER (K4226): not Bob's. Your half of R115 is done and tested at the door; the hop is placed: plane's `gatedOp` forwards `ctx.timings` (PLANE #44, with the end-to-end test), capture's arm hands it to `acquire` (CAPTURE #39). Strike nothing; record R115 as met at your door (its end-to-end proof is plane's test) and set COMPLETE now.

## B12 · CHANGE

CHANGE (K4230), a new job session (CONTROL-PLANE #41, haiku): case-inputs' public read `casedetailspublic` is registered at the plane's start (PLANE #44) but not routed: add it to `CASE_CHECKER_PUBLIC_READS` (`control-plane/index.mjs`:97, R71 names it) or route it through public-read's door as `casechecker` is, whichever R71 states; a routing test reading the op from case-inputs' `DECLARED_OPS` (never a hand list, K3268), with a control. R71's line amended (K4210). Suite, checks, `Size`, COMPLETE. Merge `tranche/T51` first.

## B13 · CHANGE

CHANGE (K4234), also for CONTROL-PLANE #41: the acquire timings cannot cross into the object, so the plane holds them by the door's `trace` and answers a store-internal read `acquiretimings?trace=…` (PLANE #44 builds it). On `acquire`'s timeout (R115), ask the object that read with the request's `trace` and answer its `stageTimes` (empty when it answers none), in place of your own empty object; test with a stand-in object answering the read, and a control (no trace: no timings).

## B14 · CHANGE

CHANGE (K4245): CONTROL-PLANE, depth 2 (BOB #235 is depth 1). Your branch is at the tranche's tip.
Entries: (1) your tests that compose the real SCREENS (`t46-app` and any other) register every owner's declarations with test-support's `registerDeclared(root, ...registrations)` (R17, merged) before the first read, in place of any hand registration (K3268). (2) `export` now reaches the founder's session (op-declarations R83; ADMISSION's job, running, admits it at the gate as the root of trust's session form, Membership v2 §4.6): your R28 test (the gates' order) that pins `export` as an op a session cannot reach is re-pinned to an op no session set holds, read from the tables. Merge `tranche/T51` again once BOB tells you ADMISSION has merged, and run R28 then. Requirement lines, if any change, for BOB in your COMPLETE.
Before tests: node_modules (K4113). Reading (K3678). Words (K3930). Model haiku, medium effort; workers haiku low.

## B15 · CHANGE

CHANGE (K4247): ADMISSION #15 has merged (R8: `export` admitted to the root-of-trust bearer and the founder's session). Merge `tranche/T51` now and re-pin R28 as B14 says. Note: the plane's suite is red at start-up until LINK-SWEEP #6 and STORE-DOOR #14 merge (`DECLARED_OP_BAD_WEIGHT` on `sweeps`, `groupdescriptiondraft`); a control-plane red with that cause is not yours, name it.
