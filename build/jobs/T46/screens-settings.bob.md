# BOB to screens-settings (T46)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 11, screens-settings: T46-55 · (N897 (1), (3); K2147) R1–R10: `members`, `account`, `connect`, `notes`; (N934; DEC-197) R1 draws no "formerly", R3 no `handlechange` act and the fixed handle in DEC-197's words · interface §2.3 amended by DEC-197 · after T46-54.
Your requirements: `build/requirements/screens-settings.md` (read whole). Marked `*(not yet met: T46)*`: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10 (folded K2960, reviewed). The sources the entry names (interface = `build/plan/draft-T46-interface.md`, trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`; words.json, registry.json, library.json and `mock-acts.js` on `main` @ 3f40899950, which `main` still is) are read for the sections named.
You follow interface-shell (merge `tranche/T46` at its merge's CHANGE). For L11 (K2960): the `connect` screen reads `op=bootstrap`'s `parts` (instance-setup R81) and offers the sign-in only while `signin` is present (trial §3.2); every AI output drawn (your R6) carries the test-instance label `untested` as screens-inquiry R7 states (K2816 (2)). DEC-197: R1 draws no "formerly", R3 no `handlechange` act and the fixed handle in DEC-197's words.
You are a new module: `modules.json` lists you with empty `paths` and `tests` (K1043). Name every file you add, code and tests, in your COMPLETE; BOB adds them before the ownership check. Build under `bio-plane/src/<module>/` and `bio-plane/test/m/<module>/` unless your requirements say otherwise.
Every new id needs an explicit test naming it (K874: an id older tests already name reads green wrongly); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2974 (with L9's and L10's merge rulings as they land); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 89 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L11: wizard-scripts, op-grades, affordances, action-producers, notice-producers, setup-words, instance-setup, setup-page (after instance-setup, doubt 14), op-declarations, answer-envelope, interface-assets, interface-shell, screens-settings, screens-intake, screens-daily, screens-inquiry, control-plane, installer, stewards, plane last. A provider merges before its users; a job that uses an L11 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L11 job may merge as soon as it is complete.

## B2 · ANSWER · re J1

The screen contract is fixed (K2996) and folded into interface-shell R21 (merge `tranche/T46` to read it): SCREENS-DAILY #1 J1's shape. `reads(view)` → `{name: {op, query, empty?}}`; `render(cs, view)` → HTML, `view = {subject, data, me, ui, reachable}`, `data[name] = {state, value, refusal}`; `acts` `[{op, label, send(view, el) → {query, body} | null, done?(view, answer, cs)}]`, drawn by `cs.act(op, {label, data})`; the shell re-reads after an act; kit `cs`: `w, state(readName, view, inner), act, go, set, ref, mark, grade, due, row, sec, sheet, field, choice, checks, date, esc`. Build to it with your own stand-in kit; re-point to interface-shell's shared DOM stand-in when its merge is announced (a CHANGE).
For you: your `after` becomes `done(view, answer, cs)` (your follow-ups, `groupkeyswitch` after `groupkeyset`, the sign-in address opened `noopener noreferrer`, the invitation shown once, the draft placed in the field, all fit it), and `reads` answers an object, not a list.

## B3 · CHANGE

CHANGE (K2998): the screen contract is final in interface-shell R21 (merge `tranche/T46` to read it): INTERFACE-SHELL #1 J1's statement (a superset of K2996's: `send(view, el, cs, extra)`, optional `rereads`, `refusals`, `dialog`, `outward`, `reasonField`, `place`; kit adds `can`, `value`, `file`, `rows`, `title`, `hint`; `state` takes either form) plus `cs.call` with `bearer`, `ui` kept across redraws, and a `closed` hook. Build to that text; the shell's DOM stand-in and harness will be under `bio-plane/test/m/interface-shell/` on its branch, and you re-point to them at its merge.

## B4 · ANSWER · re J2

K3002: all six readings accepted and folded into interface-shell R21's new sub-bullet (parts → view.parts; view.origin; (3) your link reading, no cs.open; (4) fills from the refusal's fields and function refusals; (5) cs.value checked; (6) rows as you read it). R4 confirmed and reworded: the allowance comes from `aiusage` without `owner` (ai-use R4). Merge tranche/T46; build to the shell's kit as it lands (its CHANGE is posted).

## B5 · CHANGE

CHANGE (K3004): your R4 gains a sub-bullet: connect also reads bootstrap's `parts` (instance-setup R81, now merged) and offers the sign-in only while `signin` is present. instance-setup, setup-page, answer-envelope and action-producers are merged: merge tranche/T46.
