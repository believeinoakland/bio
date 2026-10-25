# BOB to calc-grammar (T51)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 1 (R1), calc-grammar: **T51-165** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/calc-grammar.md` (read whole). Your entry changes no requirement's meaning; BOB added `setup-words` (`word`, `localize`) to your requirements' Uses at this START where the pass added the import.
BOB's notes for this job:
1. Your findings are listed by the words check itself in `build/plan/words-pass/calc-grammar.md` (read whole): each is a judgment the codemod could not make (a stitched sentence, a partial copy, a hand-list, a custom error class, a signed text). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944).
2. The ids you assign are `calc-grammar.<file stem>.<slug>`, fixed once.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize`. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; `localize` answers `en` until BOB regenerates them at the layer close. Your words file's findings must all read zero in `node checks/run.mjs` before COMPLETE.
Tests never copy a sentence people read; every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (format and architecture 0 failures; the words check shows no finding in your module) and `node checks/ownership.mjs /home/user/bio calc-grammar tranche/T51 job/T51/calc-grammar`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K3960): merge tranche/T51 into your branch first. (1) The word generator refuses your localize('calc-grammar.recipe.field_shape', 'each field is {name, type}, type one of {types}', …): '{name, type}' reads as a formatted argument (setup-words R18) and would also not fill. Reword it without braces around anything but a placeholder (e.g. 'each field states its name and its type, the type one of {types}'); keep the id. Then 'node bio-plane/src/setup-words/build.mjs --check' must not name your module (it is read-only; never run it without --check). (2) The plain findings of your module (build/plan/words-pass/calc-grammar.md, section 'Plain findings (K3957)'), CHANGE B2's work if you had not yet done it. Record COMPLETE again.

## B3 · START

START (job 110, K5011; depth 2; P10, P19). Read roles/JOB.md whole; your branch is at the tranche tip. Your requirements R23 (G183; S-31's draw and interval) are new (not yet met: T51); plan §2i G182-G185 and §3c row 110. The evidence is `build/plan/envelope-sheets-T51.md` §3.3, the items named, read whole: each was run by the spreadsheet study, but lines have moved since. For each: reproduce it first on the tip (a red test through your module's interface), then fix; one that does not reproduce is proven by its test and recorded as such. Tests assert keys, never sentences (K3810), and use a provider's published fixture, never a hand-built answer (K4990).
Run your suite; checks (format, architecture, coverage, words, ownership); RUNNING never more than 30 minutes ahead (K4976). Model claude-sonnet-5-5, medium effort; workers haiku low mechanical, sonnet medium reading; never a refused act worked around (K4696). A job about to read a document of its reading set only in part stops (BLOCKED, cause reading; K3678). Before any test run: node_modules in every dir with a tracked package-lock.json (K4113). Record completion with a Size line, then COMPLETE.

## B4 · ANSWER · re J3

ANSWER to J3: your reading stands. `draw` stays synchronous and answers the same; `drawSliced` is the form any caller on the plane uses (none today; a future caller is bound by R23 to it). No change needed: your COMPLETE (J4) stands and is merged next.
