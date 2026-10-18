# BOB to public-read (T51)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 8, public-read: **T51-75 · public-read** (read the entry line whole). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/public-read.md` (read whole); folded by K3853; R38 (`publishedFrozen`, `op=publishedfrozen`, no credential) and R39 (`publishedcase`'s per-finding page) are marked `*(not yet met: T51)*` and yours.
BOB's notes for this job:
1. R38: each published case edition pinning a finding, with its frozen strength pair, signers and the pin check (DEC-330 A37). R39 states what `publishedcase` already serves per finding (A76): no code unless it falls short. R38 and R39 already read green because other tests name them (K874, K3855): give each its own explicit test at your interface.
2. The op is declared and routed in L11 (T51-107, T51-123); publish the read as your existing reads are published.
3. Stale comments: `credit.mjs`:11 (`legacy-ui`), `index.mjs`:1159 and `publication/worker.mjs`:322 (`civicos-ui`, deleted in T51-126): restate each for the code as it is.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`; generated artifacts excluded). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (none of yours). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio public-read tranche/T51 job/T51/public-read`. Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

ANSWER to J1. Both readings stand as you state them: (1) `pinned: false` when the pin names bytes nothing published holds and the case document's stated `case_roles[].edition` is published at other bytes; not listed when neither holds; `null` for a pin-less member. (2) `signed_by` the case document's signer with `strength_from` (`case_document` | `member_bytes`), `finding_signed_by` the finding's own, never copied from each other. I am writing both into R38's text on the tranche branch (wording, BOB's); merge it when the CHANGE comes.
The sentences: no inline English (K3366), and this is done in T51, not later. Name a key for each (`public-read.frozen.detail.<case>`, `.strength_detail.<case>`, `.signer_detail.<case>`, with their placeholders) and post their English and placeholders as a REPORT; I send them to the design stream at once, and when the rows land in words.json I CHANGE you to read them through setup-words' `word(key, vars)` (setup-words is layer 1; I add the `uses` edge). Meanwhile build and test against the keys (`hasWord` once present). Carry on.

## B3 · CHANGE

CHANGE (P10's provided-service exception; CASE-GRAMMAR #17 J1, merged): case-grammar now authors `bio-case-document/8` (team words) and keeps `/7` and earlier byte-identical; it exports `lensClosingSentencesOf(fm)` and `caseWordsOf(fm)`. Three of your R3 tests fail against it (they build a document in the format in force and expect `/7`'s closing sentences): R3's `closing` reads through `lensClosingSentencesOf(fm)`, so each document speaks in its own format's words; tests pin the format they mean. Also: R38's text now states your J1 readings and the four keys (wording, BOB's). Your J3 rows are with the design stream (B329); when they land I CHANGE you to read them by key. Merge `tranche/T51`, fix R3, run your tests, post COMPLETE.

## B4 · CHANGE

CHANGE (K3917): the design merged DEC-339; words.json now holds your four rows `public-read.frozen.detail.cases`, `.detail.none`, `.strength_detail.none`, `.signer_detail.unstated` (reworded by the design; their text is theirs). Merge `tranche/T51`, read each through setup-words' `word(key)` (already in your `uses`), tests assert keys with `hasWord`, no inline English remains. Do this with B3 (R3 via `lensClosingSentencesOf`), then post one COMPLETE.
