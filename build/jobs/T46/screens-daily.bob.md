# BOB to screens-daily (T46)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 11, screens-daily: T46-57 · (N897 (1); N698's screen part) R1–R7: `home`, `queue`, `finder`, `find-in`, `answers` · interface §2.5 · after T46-54.
Your requirements: `build/requirements/screens-daily.md` (read whole). Marked `*(not yet met: T46)*`: R1, R2, R3, R4, R5, R6, R7 (folded K2960, reviewed). The sources the entry names (interface = `build/plan/draft-T46-interface.md`, trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`; words.json, registry.json, library.json and `mock-acts.js` on `main` @ 3f40899950, which `main` still is) are read for the sections named.
You follow interface-shell (merge `tranche/T46` at its merge's CHANGE). For L11 (K2960): every AI output drawn (your R6) carries the test-instance label `untested` as screens-inquiry R7 states (K2816 (2)).
You are a new module: `modules.json` lists you with empty `paths` and `tests` (K1043). Name every file you add, code and tests, in your COMPLETE; BOB adds them before the ownership check. Build under `bio-plane/src/<module>/` and `bio-plane/test/m/<module>/` unless your requirements say otherwise.
Every new id needs an explicit test naming it (K874: an id older tests already name reads green wrongly); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2974 (with L9's and L10's merge rulings as they land); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 86 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L11: wizard-scripts, op-grades, affordances, action-producers, notice-producers, setup-words, instance-setup, setup-page (after instance-setup, doubt 14), op-declarations, answer-envelope, interface-assets, interface-shell, screens-settings, screens-intake, screens-daily, screens-inquiry, control-plane, installer, stewards, plane last. A provider merges before its users; a job that uses an L11 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L11 job may merge as soon as it is complete.

## B2 · ANSWER · re J1

The screen contract is fixed (K2996) and folded into interface-shell R21 (merge `tranche/T46` to read it): SCREENS-DAILY #1 J1's shape. `reads(view)` → `{name: {op, query, empty?}}`; `render(cs, view)` → HTML, `view = {subject, data, me, ui, reachable}`, `data[name] = {state, value, refusal}`; `acts` `[{op, label, send(view, el) → {query, body} | null, done?(view, answer, cs)}]`, drawn by `cs.act(op, {label, data})`; the shell re-reads after an act; kit `cs`: `w, state(readName, view, inner), act, go, set, ref, mark, grade, due, row, sec, sheet, field, choice, checks, date, esc`. Build to it with your own stand-in kit; re-point to interface-shell's shared DOM stand-in when its merge is announced (a CHANGE).

## B3 · CHANGE

CHANGE (K2998): the screen contract is final in interface-shell R21 (merge `tranche/T46` to read it): INTERFACE-SHELL #1 J1's statement (a superset of K2996's: `send(view, el, cs, extra)`, optional `rereads`, `refusals`, `dialog`, `outward`, `reasonField`, `place`; kit adds `can`, `value`, `file`, `rows`, `title`, `hint`; `state` takes either form) plus `cs.call` with `bearer`, `ui` kept across redraws, and a `closed` hook. Build to that text; the shell's DOM stand-in and harness will be under `bio-plane/test/m/interface-shell/` on its branch, and you re-point to them at its merge.

## B4 · ANSWER · re J2

Confirmed (K3000): Home draws the member's projects from `search` `q=type:project` (stage from `current_state`, an unknown state drawing no step), with no question count in T46 (N972 asks project-roster for the read); `projectdirectory` under "Projects you could join", name only, no act. Your J3 is forwarded to ACTION-PRODUCERS #2.

## B5 · CHANGE

CHANGE (K3002): interface-shell R21 gains a kit sub-bullet (parts, view.origin, refusal fills, {refuse, fills}, cs.value checked, cs.rows parameters, cs.digest, cs.now, outside links). Merge tranche/T46 and use them where your screens need them.

## B6 · CHANGE

CHANGE (K3004): instance-setup (R79–R81: infolevelset, infolevel, test_instance, parts), setup-page (R31 SESSION_STORE_KEY), answer-envelope and action-producers are merged into tranche/T46. Merge tranche/T46 into your branch.

## B7 · CHANGE

CHANGE (K3007): interface-shell is merged into tranche/T46 (with affordances and op-declarations). Merge tranche/T46, re-point your tests from your stand-in kit to the shell's bio-plane/test/m/interface-shell/dom.mjs and harness.mjs, check every kit signature you read (cs.choice, cs.row, cs.rows, etc.) against the shell's real code and correct your screens where they differ, run your tests against the real served page, and record completion again. Name in your COMPLETE any kit gap that remains (a REPORT).
