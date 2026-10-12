# BOB to interface-shell (T46)

**Read** · handled J4

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

## B4 · CHANGE

CHANGE (K2999): R21 gains SCREENS-INTAKE #1's four kit points: `send` may answer a promise (awaited); `cs.download(op, {query, body})` → promise of `{ok, answer}`, a byte answer handed to the browser as a file; picked rows' keys as `extra.picked`; `send` may answer `{query, raw}`, `raw` sent as the request body, session header, no JSON content type. Merge `tranche/T46`.

## B5 · ANSWER · re J2

K3002. Neither reading exactly: DEC-87 treats only an UNDETERMINED rung as reasoned. So: an op in RUNG_ABSENT whose ground is `undetermined`, or an op in neither table, is drawn and frictioned as reasoned; an op in RUNG_ABSENT under `substrate`, `credential`, `caller-owned` or `observational` (not an act on the record) carries no weight mark and runs on press, any confirmation its owner requires (openwithwarning's) drawn by its screen. Among your list that makes deepercheck, captureupload and inboxpull reasoned; the rest run on press. And a reasoned act whose screen names a `reasonField` sends the member's own words in that field as its reason and asks no second one (DEC-88). Folded in your R11; merge tranche/T46.

## B6 · CHANGE

CHANGE (K3002): R21 gains a sub-bullet (the screens' kit needs): optional `parts: {name: fn}` → `view.parts`; `view.origin`; a refusal word filled from the refusal's own fields, and a `refusals` value may be a function (refusal, cs) → HTML; `send` may answer `{refuse: key, fills}`; `cs.value` answers a checkbox's or radio's `checked`; `cs.rows`' parameters as stated; `cs.digest(text)` (hex SHA-256 of UTF-8, a promise); `cs.now()` (the harness's fake clock in tests); no `cs.open`: outside addresses are links with target=_blank rel=noopener noreferrer. Merge tranche/T46, build and test them, then record completion again.

## B7 · CHANGE

CHANGE (K3004): instance-setup (R79–R81: infolevelset, infolevel, test_instance, parts), setup-page (R31 SESSION_STORE_KEY), answer-envelope and action-producers are merged into tranche/T46. Merge tranche/T46 into your branch.

## B8 · CHANGE

CHANGE (K3009; re-opens your job; from SCREENS-SETTINGS #1 J5): (1) await an act's `done` when it answers a promise, before the reads named in `rereads`, so a screen's follow-up act does not race the re-read; (2) after an act succeeds, clear every password field the act's screen drew (input type=password) rather than restoring it by id on redraw, so no secret survives a redraw. Fold both into your R21 wording in your COMPLETE (I will strike/state them), test each with a control, run the screen modules' tests on the tranche (screens-settings is merged; the others are on their branches), and record completion again. Also: screens-settings, op-declarations (again) are merged; merge tranche/T46.

## B9 · CHANGE

CHANGE (K3011; with B8; from SCREENS-DAILY #1 J7): (1) `ask` answers application/x-ndjson (agent-worker R54); your op client reads every answer with r.json(), so Ask shows no answer on a live plane. Hand such an answer to `done` and `cs.call` as its list of parsed events (the answer the last). (2) A read (an op OPS declares `mutating: false`: search, findin, frontier, ruleanswer, …) carries no weight mark and runs on press, whatever op-grades' tables hold. Both folded in your R11 and R21 (merge tranche/T46; screens-daily is merged, so run its tests too). Test each with a control.
