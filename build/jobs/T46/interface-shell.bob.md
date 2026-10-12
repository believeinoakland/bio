# BOB to interface-shell (T46)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 11, interface-shell: T46-54 · (N897 (1); DEC-87, -98, -99, -122, -138, -139, -154, -159–-163, -175–-177, -179, -181; N672) R1–R24; Settings › "Group settings" opens the setup page's sections (K2893); (N673; DEC-155) the rail's width per member and device (184px default, 64–320px, dragged or keyed, kept on the device, never in the record) · interface §2.2, §5 I8; N673's text BOB's · after T46-53, T46-48.
Your requirements: `build/requirements/interface-shell.md` (read whole). Marked `*(not yet met: T46)*`: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21, R22, R23, R24, R25, R26 (folded K2960, reviewed). The sources the entry names (interface = `build/plan/draft-T46-interface.md`, trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`; words.json, registry.json, library.json and `mock-acts.js` on `main` @ 3f40899950, which `main` still is) are read for the sections named.
You use interface-assets, setup-words, setup-page, op-declarations and op-grades: merge `tranche/T46` when BOB announces each of their merges. The four screen modules and control-plane follow you.
Measure your own lines at COMPLETE (M-T46-1, estimate 3,200–3,800); if you would pass ~4,000 (K617), say so in a QUESTION before writing past it.
Every AI output drawn carries the test-instance label `untested` as screens-inquiry R7 states (K2816 (2)) wherever the shell draws one.
You are a new module: `modules.json` lists you with empty `paths` and `tests` (K1043). Name every file you add, code and tests, in your COMPLETE; BOB adds them before the ownership check. Build under `bio-plane/src/<module>/` and `bio-plane/test/m/<module>/` unless your requirements say otherwise.
Every new id needs an explicit test naming it (K874: an id older tests already name reads green wrongly); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2974 (with L9's and L10's merge rulings as they land); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 212 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L11: wizard-scripts, op-grades, affordances, action-producers, notice-producers, setup-words, instance-setup, setup-page (after instance-setup, doubt 14), op-declarations, answer-envelope, interface-assets, interface-shell, screens-settings, screens-intake, screens-daily, screens-inquiry, control-plane, installer, stewards, plane last. A provider merges before its users; a job that uses an L11 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L11 job may merge as soon as it is complete.

## B2 · CHANGE

CHANGE (K2996): the contract between this shell and the four screen modules, built concurrently, is now stated in your R21 (a sub-bullet): merge `tranche/T46` and build the shell to it, `reads`/`render`/`acts`/`done`/the kit `cs` exactly as stated, and export the shared DOM stand-in from your tests for the screen modules. If something in it cannot work for the shell, say so in a QUESTION at once: four jobs build to it.

## B3 · CHANGE

CHANGE (K2998): your J1 contract is now your R21 (a sub-bullet), with three additions SCREENS-INQUIRY #1 needs for the dock (its R6, K2976): `cs.call(op, {query, body, bearer})` → promise of the parsed answer, `bearer` absent = the session, present = replaces the session token in `Authorization` for that request only (no session token on it; your R3 test must allow this); `ui` kept in page memory across redraws, never stored; a screen's optional `closed(cs, view)` called on close or `pagehide`. Merge `tranche/T46` and build them in.
