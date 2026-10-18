# BOB to case-authoring (T51)

**Read** · handled J1

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
