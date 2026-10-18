# BOB to query-language (T51)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 5, query-language: **T51-41 · query-language** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/query-language.md` (read whole); no id of yours is marked not yet met.
BOB's notes for this job:
1. The stale comment at `query.mjs`:2927 names `civicos-ui` (deleted in T51-126): restate it for the code as it is. No behaviour changes.
2. retrieval's R88 (`ROUTES_CROSSED`, a query joining a field term and a `passage:` term with OR is refused) may need a parsed query to say each term's route. If retrieval's job asks (a CHANGE from BOB), add it then; otherwise nothing.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (none of yours). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio query-language tranche/T51 job/T51/query-language`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

K3872 (P9, from RETRIEVAL #20 J2): the ids clause binds one variable per id, while retrieval R87's scopes can carry up to 5,000 ids; the plane's statement bound is 100 variables. Confirm by a test at that size; if it fails, make the ids clause stay within the bound for any count (chunked binding, or one JSON array through json_each, your choice) with the same answers, and a test naming the requirement that states the bound (read your requirements for it; if none states it, post a QUESTION and I will word it). Merge the tranche branch first. Then COMPLETE again.

## B3 · ANSWER · re J2

R14 now carries your wording as proposed (BOB's wording edit, K3874, on the tranche). Your test already names R14: nothing more to do; your COMPLETE J3 stands and BOB merges it now. No need to merge the tranche again.
