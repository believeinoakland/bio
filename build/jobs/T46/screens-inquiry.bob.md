# BOB to screens-inquiry (T46)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 11, screens-inquiry: T46-58 · (N897 (1), (2)) R1–R5: `project`, `question`, `document`, the assistant dock (the test-instance label drawn); (N919) the dock's "Work on this" on a member's own sign-in starts the run through T46-59's door · interface §2.6; N919's share BOB's · after T46-54.
Your requirements: `build/requirements/screens-inquiry.md` (read whole). Marked `*(not yet met: T46)*`: R1, R2, R3, R4, R5, R6, R7 (folded K2960, reviewed). The sources the entry names (interface = `build/plan/draft-T46-interface.md`, trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`; words.json, registry.json, library.json and `mock-acts.js` on `main` @ 3f40899950, which `main` still is) are read for the sections named.
You follow interface-shell (merge `tranche/T46` at its merge's CHANGE). K2976 settles the dock's member run (your R6, folded): the dock mints her a one-day member-scoped credential, opens the run under it, presents it in the `Authorization` header at each `airundispatch`, holds it in page memory only and revokes it at the run's end; a reloaded dock starts a new run. Every AI output drawn carries the test-instance label `untested` (your R7).
You are a new module: `modules.json` lists you with empty `paths` and `tests` (K1043). Name every file you add, code and tests, in your COMPLETE; BOB adds them before the ownership check. Build under `bio-plane/src/<module>/` and `bio-plane/test/m/<module>/` unless your requirements say otherwise.
Every new id needs an explicit test naming it (K874: an id older tests already name reads green wrongly); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2974 (with L9's and L10's merge rulings as they land); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 88 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L11: wizard-scripts, op-grades, affordances, action-producers, notice-producers, setup-words, instance-setup, setup-page (after instance-setup, doubt 14), op-declarations, answer-envelope, interface-assets, interface-shell, screens-settings, screens-intake, screens-daily, screens-inquiry, control-plane, installer, stewards, plane last. A provider merges before its users; a job that uses an L11 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L11 job may merge as soon as it is complete.

## B2 · ANSWER · re J1

The screen contract is fixed (K2996) and folded into interface-shell R21 (merge `tranche/T46` to read it): SCREENS-DAILY #1 J1's shape. `reads(view)` → `{name: {op, query, empty?}}`; `render(cs, view)` → HTML, `view = {subject, data, me, ui, reachable}`, `data[name] = {state, value, refusal}`; `acts` `[{op, label, send(view, el) → {query, body} | null, done?(view, answer, cs)}]`, drawn by `cs.act(op, {label, data})`; the shell re-reads after an act; kit `cs`: `w, state(readName, view, inner), act, go, set, ref, mark, grade, due, row, sec, sheet, field, choice, checks, date, esc`. Build to it with your own stand-in kit; re-point to interface-shell's shared DOM stand-in when its merge is announced (a CHANGE).

## B3 · ANSWER · re J2

Confirmed (K2998) and folded into interface-shell R21: `cs.call(op, {query, body, bearer})`, `ui` kept in memory across redraws and never stored, `closed(cs, view)` on close or `pagehide`; relayed to INTERFACE-SHELL #1 as a CHANGE. The rest of the final contract (the shell's J1 statement, now R21) applies to you too: merge `tranche/T46` to read it.

## B4 · CHANGE

CHANGE (K2999): the credential the dock mints names `airunopen` and `airundispatch` among its declared `writes` (your R6), so admission admits it; the door now hands it to ai-runs as an in-process RPC argument (control-plane R77). Merge `tranche/T46`.

## B5 · ANSWER · re J3

K3003: accepted as you read it, folded as a sub-bullet under your R6 (check mode; context by screen; skillVersion from op=agentpack, none → not drawn, 'not ready'; bounds wallclock 1,800,000 ms, fetches 0, subsessions 0; credential principalKind member, writes airunopen, airundispatch, airunclose, suggest, one day, fresh tokenId; never send at).

## B6 · ANSWER · re J4

K3003, folded under your R2: (1), (2), (5), (7) accepted as you read them. (3) do not draw strengthbarset on the project screen in T46 (it sets the group's bar; the label would be untrue); N976. (4) do not draw sever/reinstate on the question screen in T46; N977. (6) words to the design stream, N978. (8) forwarded to control-plane (strip at at the door). Also N974, N975 for (1), (2). Merge tranche/T46 (R21's kit sub-bullet is new too: K3002).
