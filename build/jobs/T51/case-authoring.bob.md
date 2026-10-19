# BOB to case-authoring (T51)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 8, case-authoring: **T51-83 · case-authoring** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/case-authoring.md` (read whole); no id of yours is marked not yet met.
BOB's notes for this job:
1. Reds #12, #13 (rule 5.4, N1221, CASE-CHECKER #13 J1 (1), K3725): R61's tests (`standards.test.mjs`:96, :140) expect case-checker R26's `says: {key, vars}` and read it through `word`. Test-only unless the tests show your source relays the old shape (then say so).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`; generated artifacts excluded). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (yours: case-authoring R61). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio case-authoring tranche/T51 job/T51/case-authoring`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K3912): your job re-opens. setup-words is layer 1, not 11, and the keys exist in words.json: `case-authoring.text.case_would_carry`, `.case_quotes_passage`, `.rests_benchmarks_binds`, `.case_use_standards`. `standardsUseWords` (`index.mjs`:197–207) reads each sentence through setup-words' `word(key, vars)` with the fills `{sha}`, `{standard}`, `{content}`, `{finding}`, `{word}` (and the default arm's fill as its row names it); no inline English remains. I have added `setup-words` to your `uses` in `build/modules.json`; merge `tranche/T51` into your branch. Tests assert keys (`hasWord`) or read the text from the word table, never copy it (K3810). If a key's placeholders differ from what the code passes, REPORT it to me rather than inventing one. Run your tests and checks, then post COMPLETE. You merge after case-grammar.

## B3 · CHANGE

CHANGE (P10's provided-service exception; CASE-GRAMMAR #17 J1, merged), in addition to B2: case-grammar now authors `bio-case-document/8` (team words); `/7` and earlier stay byte-identical. Five of your tests fail against it (they expect `bio-case-document/7`; `op=publish` now authors `/8`). Bring them to `/8`, and pass the document's own format where your code spells attribution and lens lines through case-grammar (`attributionBodyLines(rows, format)`, `lensSectionLines({..., format})`). Merge `tranche/T51` first. Then post COMPLETE covering B2 and this.

## B4 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 8 (R8), case-authoring: **T51-161** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/case-authoring.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/case-authoring.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `case-authoring.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. Your entry carries more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are already on the tranche branch.
3. If your entry names red tests of yours (K3958: civil-time now answers an undetermined `why` as `{key, vars}`), they are accepted only until you merge: make them green against the keyed reasons, passing `{key, vars}` on where you relay a reason.
4. You start with the layer but merge after case-inputs (T51-160), whose `minutesComparisonsOn` you read (R77); merge `tranche/T51` into your branch once BOB tells you it has merged, before your COMPLETE.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio case-authoring tranche/T51 job/T51/case-authoring`. Your Size line counts only your module's own code (K2513).

## B5 · CHANGE

CHANGE (K4025): case-inputs R19's `minutesLine(row)` is built as `{key, says, left: {key, says}, right: {key, says}, comparison: {key, says}}` (CASE-INPUTS #5 J4/J5; `comparison` is signing.minutes.same or .differs by `same`); R77 carries it on each row unchanged. R77 carries no sentence for an unreadable source (`minutes: {undetermined: true}` only; the screen draws signing.minutes.unread). case-inputs merges before you: merge tranche/T51 once it lands (I will say so).
