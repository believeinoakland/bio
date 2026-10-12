# BOB to action-producers (T46)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 11, action-producers: T46-46 · (N924) R1, R11: the door stating a clock entry met or waived, through `actions`' revision of the entry's status; (N926) R1: an overdue clock entry whose duty's watch has ended (`following.dutyWatchEnd`) is drawn although `noticed_by` is set (action-clocks R17 unchanged: action-clocks, L9, cannot read following, L10); (N913) its `.ours`/`.theirs` interim sentences and the summary and detail of `member-left-items`, `watch-keep-or-stop`, `plan-review-due`, `plan-look-again`, `litigation-hold.docket` read from words.json's keys, its doors' labels from `door.*` · text BOB's; words.json.
Your requirements: `build/requirements/action-producers.md` (read whole). Marked `*(not yet met: T46)*`: R11, R21, R22, R23 (folded K2960, reviewed). The sources the entry names (interface = `build/plan/draft-T46-interface.md`, trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`; words.json, registry.json, library.json and `mock-acts.js` on `main` @ 3f40899950, which `main` still is) are read for the sections named.
Your providers changed in L9 and L10: actions (R33's `overdue`, revision of an entry's status), action-clocks, following (`dutyWatchEnd`); read their Provides as merged on `tranche/T46`. N926 is yours, not action-clocks' (Settled 16: action-clocks, L9, cannot use following, L10).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874: an id older tests already name reads green wrongly); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2974 (with L9's and L10's merge rulings as they land); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 589 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L11: wizard-scripts, op-grades, affordances, action-producers, notice-producers, setup-words, instance-setup, setup-page (after instance-setup, doubt 14), op-declarations, answer-envelope, interface-assets, interface-shell, screens-settings, screens-intake, screens-daily, screens-inquiry, control-plane, installer, stewards, plane last. A provider merges before its users; a job that uses an L11 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L11 job may merge as soon as it is complete.

## B2 · ANSWER · re J1

All three readings accepted (K2996): (1) R1's group arm reads `.ours.summary` by key and keeps its present detail; (2) `.summary` by key, the detail kept; both until N968 (T47: the providers answer venue, recurrence and last review). No new Uses edge. (3) canon's "Noticed: no reply recorded by {date}" unchanged. Your note on action-holds R14's retirement is recorded.

## B3 · CHANGE

CHANGE (K3000), re-opening the job: SCREENS-DAILY #1 reports that action-clocks' `reminderSet`/`reminderAnswer` store `set_by` as `member:<id>` (control-plane stamps `author` so), while your `action-reminder` producer keeps an item only when `x.set_by === me`, `me` the queue's bare member stamp (index.mjs:655), and your tests use bare fakes. Verify with a test through the real action-clocks; if real, compare both forms (one helper), with a control, and record completion again. Merge `tranche/T46` first.
