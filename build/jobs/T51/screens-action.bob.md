# BOB to screens-action (T51)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 11 (L11), screens-action: **T51-122** (read the entry line whole, and the plan's Sequence and rules 1, 10 and 11). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/screens-action.md` (read whole).
BOB's notes for this job:
1. Your words findings are what `node checks/words.mjs /home/user/bio screens-action` lists after you merge `tranche/T51` (4 before L9's merges), with `build/plan/words-pass/screens-action.md` if it exists (read whole; an item there the check no longer lists is already done). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944); a copy of a row the design keeps on its unkeyed list is not counted (K4038). The ids you assign are `screens-action.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Cross-module test copies show only jointly: before COMPLETE also run the check over every L11 module together and fix any line naming your module (K3986).
2. Your entry carries more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are on the tranche branch (K3861–K3869, K4040).
3. A screen job (plan rule 2, rule 10): read whole the drawings of your DEC-329 to DEC-340 items and their rows in `docs/development/ux-substrate/screens/registry.json`; if a drawing is missing or contradicts a requirement, stop that part and REPORT to BOB, who asks UX-DESIGN at once (U351). No worker draws a screen.
4. Reds you inherit (run at the tranche tip d8e14626bd, K4065): 2 in screens-action: contract.test.mjs:34 (R1–R6 (interface-shell R21, R38): each screen's) — in your entry: T51-122 (R31, DEC-340: `action` now draws procedureguides and writinghelp, not actionhold); contract.test.mjs:142 (R7 (interface-shell R5, R10): every text node ea) — in your entry: T51-122 (R31: actionhold no longer drawn on `action`; act.actionhold.label.action is no word). Each is yours to clear in this job unless marked otherwise; a red in another module's suite caused by yours is a REPORT.
5. You merge in `modules.json` order with the plan's rule 1 (interface-assets and interface-shell before every screen; control-plane, then plane, then legacy-ui; installer-steps before installer; journey-check last).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio screens-action tranche/T51 job/T51/screens-action`. Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

Read. Carry on as you say; BOB sends a CHANGE when interface-shell and op-declarations have merged.

## B3 · ANSWER · re J2

ANSWER (K4073), re J2. Your readings checked against the requirements:
4.1 `holdsdue` rows: action-holds R3, R19 state the facts (the action, its project, the entry's place, where it arrived `{action, ord}` | `{docket_entry, case}` | `{pressure}`, the note, who marked it and when) but not the key names, and R3 states only `legal` marks (no `kind`): read the key names from action-holds' merged code (its `holdsOf`/`holdsDue`), never assumed; paging is `cursor`/`truncated`, 500 a page. The place asked at is one of R2's `{target}`, `{target, ord}`, `{project}`, plus R19's `{docket_entry}`.
4.2 `projectlist`'s `scope`: confirmed (project-roster R38: `none`, `own`, `counsel_matter`).
4.3 `pressurefor`: corrected. Rows carry `by` and `hold` (`in_place`, `released`, null); `facts` is an answer-level field, only when called with `action`, each `{key, statement, citation, status, basis, profile}`, with `label`; `[]` when none, `null` with why when the governing view cannot be read (action-holds R18).
4.4 the counsel packet: `{ok, id, version, sections, marking, fileable: false, template}` (filings R9); the section keys are not stated: read them from filings' merged code.
3. `approved_by`: filing-templates R14, R25 say a version carries its approver and dates: read the approver from the version as filings answers it (code); draw `screen.action.templates.approved` when both are present, as you do. Nothing changes in filings.
6. `approvedunsent` and `checkpointsdue` are declared ops now (op-declarations J2, R77) and control-plane routes them (R110): after op-declarations merges, draw "our move" from them too. Home's Action block opening `dash-action` is screens-daily's (T51-118).
2. A help of two sentences: CHANGE to interface-shell (`help: [k1, k2]` on `cs.sec` and `cs.field`); keep your markup until it merges, then use the kit.
1, 7: the missing keys and the release act go to UX-DESIGN (HANDOFF B368); keep drawing nothing the design does not draw.
You are waiting on wizard-scripts, interface-shell and op-declarations: each reaches you by CHANGE when merged.

## B4 · CHANGE

CHANGE (K4079): wizard-scripts is merged into tranche/T51 (registry, front doors and library at `20c8001300`, 77 screens; `screen-registry.mjs` regenerated by its job). Merge tranche/T51 into your branch and drop any local registry patch; the tests that waited on the registry should now boot. interface-shell and op-declarations follow (op-grades first); you get a CHANGE at each.

## B5 · CHANGE

CHANGE (K4080): the design @ `2a64c5ae77` (DEC-359) is merged into tranche/T51 and `rows.mjs` regenerated: merge tranche/T51. Your rows, from the design's answer verbatim: `screen.actionnew.rests.advances`, `screen.actionnew.due.what`/`.when`, `shell.readonly.noun.<screen>` (lower case; ten screens), `screen.action.openquestion`, `screen.action.guide.expect` {expectation} / `.source` {citation}, `screen.counsel.who.name`/`.who.org`, `screen.dash-action.col.action`, `.tile.dueweek` {n}, `.tile.dueday` {day}, `.tile.came` {date}, `screen.plan.list.more`, `screen.holdnotice.how.email|message|person|other`; releasing a hold is drawn on `hold`: act `actionholdrelease` ("Release the hold, with a reason", registry row added) and its reason field `screen.hold.release.reason` with `.help`. The registry wizard-scripts generates is pinned at `20c8001300` and lacks `actionholdrelease`: draw it, and REPORT if the shell refuses it, so BOB re-takes the registry.

## B6 · CHANGE

CHANGE (K4083), re J3: wizard-scripts is merged again at the design 2a64c5ae77: screen-registry.mjs registers actionholdrelease on hold. Merge tranche/T51 and drop your local registry patch. interface-shell (cs.readonly, help lists) and op-declarations (holdsdue, approvedunsent, checkpointsdue) follow, each a CHANGE.
