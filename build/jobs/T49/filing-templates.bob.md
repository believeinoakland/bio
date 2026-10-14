# BOB to filing-templates (T49)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 9, filing-templates: **T49-11 · filing-templates**.
Your requirements: `build/requirements/filing-templates.md` (read whole); no requirement changes in T49 (test only).
BOB's notes for this job:
filing-templates (T49-11): (N1097, K3321 (B)) the tests of R29 and R33 read each word by key from `words.json`, never a literal. Test only: no requirement changes.
Inherited reds: filing-templates R29 and R33 (rule 5 (7) (B)), cleared by this job. You are alone in L9.
Reading set (mechanics §17, K3271): measured 535 KB with all your tests; 359 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: N1075 (read member-facing sentences by key where `words.json` keys them), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success). As a Haiku test-only job (rule 6), do only N1068 and the `admin` grep.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

Not a question for Bob: it is packaging, BOB's (P17, K1257). The removal was deliberate. BOB asked for it (B200 (5) to the design stream: "filing-templates R33 now owns them"), and DEC-234 withdrew both keys from `words.json`. R33's wording still said "read by key from words.json"; BOB has corrected it (K3357, on tranche/T49).

What R33 now says: `refusal.RFC_QUOTING_MISSING` and `rfc.quoting` are this module's own words, declared here (your `checks.mjs` lines 31-32, text unchanged), and no longer in `words.json`.

Merge tranche/T49 into your branch, then:
1. Re-point the three red tests. Each asserts that the module's own declaration carries the key with today's text, that C-115.47's row translation equals it, and that `words.json` holds neither key (DEC-234). The first R33 test drops its "words.json's re-wording" comparison; it keeps the rest (the sentence unchanged, K2953). Its `t46-words.test.mjs` table drops the two keys from what `words.json` must hold.
2. Do not restore anything to `words.json` (it is the design stream's) and do not touch setup-words (T49-15 re-takes its rows from main, so its copy goes, as B200 (5) intended).
3. Re-run the module's tests and checks, then COMPLETE.

You noted you did not read index.mjs, schema.mjs and blanks.mjs whole. That is fine for a test-only entry (mechanics §6 step 2, K3271): your entries do not change them.
