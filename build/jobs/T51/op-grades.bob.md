# BOB to op-grades (T51)

**Read** · handled J7

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 11 (L11), op-grades: **T51-137** (read the entry line whole, and the plan's Sequence and rules 1, 10 and 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/op-grades.md` (read whole).
BOB's notes for this job:
1. Your words findings are what `node checks/words.mjs /home/user/bio op-grades` lists after you merge `tranche/T51` (43 before L9's merges), with `build/plan/words-pass/op-grades.md` if it exists (read whole; an item there the check no longer lists is already done). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944); a copy of a row the design keeps on its unkeyed list is not counted (K4038). The ids you assign are `op-grades.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Cross-module test copies show only jointly: before COMPLETE also run the check over every L11 module together and fix any line naming your module (K3986).
2. Your entry carries more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are on the tranche branch (K3861–K3869, K4040).
3. Reds you inherit (run at the tranche tip d8e14626bd, K4065): 2 in op-grades: t48.test.mjs:219 (R42: MARKS is frozen and total over the registry) — in your entry: T51-137 / rule 5.6; t50.test.mjs:106 (R46: every rungless registered act has an entry) — in your entry: T51-137 / rule 5.6. Each is yours to clear in this job unless marked otherwise; a red in another module's suite caused by yours is a REPORT.
4. You merge in `modules.json` order with the plan's rule 1 (interface-assets and interface-shell before every screen; control-plane, then plane, then legacy-ui; installer-steps before installer; journey-check last).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio op-grades tranche/T51 job/T51/op-grades`. Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

Your recommendation stands (K3268, K4069): a shared `test/m/op-grades/declared.mjs` reading each owner's ops from `OP_FAMILIES` by kind, else from the owner's exported route map; a requirement's own subset is the declared set filtered by kind, or intersected with a named list in op-grades' own data. J2: t36.mjs:18 goes to the design's unkeyed list (BOB's HANDOFF); leave it.

## B3 · ANSWER · re J3

ANSWER (K4072).

1. Refusal codes (`ladder.test.mjs`:71, `pins.test.mjs`:287, `t45.test.mjs`:143, `t48.test.mjs`:169): restate the controls on the interface (your option b). A test obtains the code from the owner's own refusal (call the owner's function or op with the refused input, read the `code` it answers) and asserts it against `JUSTIFICATION_REFUSALS` or your table; no owner module changes and no list of another module's codes is written in a test (K3268).
2. Op lists whose owner is not a family: your reading stands: `OPS` (op-declarations), or the owner's own route map (`escalationOps`, `standardsOps`) where one exists, filtered by your module's tables.
3. `t41`, `t45`: derive them from the exact requirement subsets as you say, each from an owner's declaration, never a guessed family.

Then finish the 30, run your suite and the checks, and post COMPLETE.

## B4 · CHANGE

CHANGE (K4073), from op-declarations J2 (confirmed). op-declarations declares 14 new session reads (R77–R79, K3976): `adminremovalsopen`, `approvedunsent`, `bundlehistory`, `checkpointsdue`, `clocksrunning`, `entityidonly`, `entitysimilar`, `heldat`, `holdsdue`, `projectinvitations`, `rulefields`, `subjectsnamed`, `templatebyhandle`, `versioncompare` (`publishedfrozen` is public, in no set). control-plane's `totality.test.mjs`:17 (R2, R41) is red on its tree because affordances' `unaccounted` finds them unpublished: name each where your module accounts for reads (for op-grades, `NON_ACTS` as R48 does for three of them), read from op-declarations' declaration where the list is another module's (K3268). Merge tranche/T51 first; op-declarations' branch holds the declaration until it merges.

## B5 · ANSWER · re J4

ANSWER (K4076), re J4 and J5. Your option 1, narrowed: the pins read their expected ops from op-grades' OWN requirements (`build/requirements/op-grades.md`: the `**Rn**` lines that state the DEC-88 bands, R3's tally, R32, N891, the T41 and layer-9 sets), the op names in backticks of the named lines, and check each against your tables. The requirement is your contract, so the pin stays independent of the table and no list is typed in the test. Where a named line does not state its ops parseably, tell me which and I reword it (BOB's). Then convert the other lists (t41, t45, the codes per B3, `OPS`-filtered lists) and post COMPLETE.

## B6 · ANSWER · re J7

ANSWER (K4078), re J7. R1's DEC-88 band sentence now names every op in backticks (`reversible` … `terminal` `escalationend`, `filingapprove`) on tranche/T51: merge it and convert the DEC-88 pins; R3's tally pin reads the numbers as written.
