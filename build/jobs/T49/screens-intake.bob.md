# BOB to screens-intake (T49)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, screens-intake: **T49-23 · screens-intake**.
Your requirements: `build/requirements/screens-intake.md` (read whole), folded by K3339; the ids marked `*(not yet met: T49)*` are yours to meet (R21, R22, R23, R24, R25, R26).
BOB's notes for this job:
Words (K3366, K3368; R26): you hold no member-facing English. Your keys are `modules["screens-intake"].reads` in `docs/development/ux-substrate/screens/words-reads.json` (255 keys; merged at `fa3c8b7e8e`): read that entry whole (not the whole file). Read each sentence through setup-words' `word(key, vars)` (its R11; `hasWord` R12), delete your inline English and verbatim copies (`words.mjs` rows and the like) and every test comparing a sentence's text; assert each key with `hasWord`. Strings the entry marks `unkeyed` (0) stay. A sentence you need that no key holds is a REPORT to BOB, never inline English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
screens-intake (T49-23): R21 (D9) an upload's answer is promoted as an information bundle at `collected`, as the address path promotes `acquire`'s document, and "It waits in Held captures" is said only once that succeeds (`capture.mjs`:199–215); R22 (D12) `capture` opened with a question or project as subject files what it captures there, in the form the project's reads count (M-T49-5), offering "Cite a passage"; R23 (D13) the bundle carries every file `verified`'s entry requirements name (`ratification/release.mjs`:192–197), and a held row's refusal is drawn by its words (`held.mjs`:21); R24 (D22) the result links the document it made; R25 (DEC-245, DEC-246) "For which question", carried as `capturerequest`'s `lead_inquiry` (K3327), and the address refusals and `capture.fieldneeded` by key. (N1073) `common:121`.
1. Measure first M-T49-5: which field places a promoted information bundle in a project (the project's Find's `captures`; `heldcaptures`' `project` through `provenance.homeOf`). Then measure whether a `capturerequest` with `lead_inquiry`, sent before an immediate `acquire` of the same address, is matched by capture-requests R48's reader to that capture. If either cannot be done from what the screen writes, stop: the provider line goes through BOB (P9) before this job builds R22 or R25.
2. Inherited reds: coverage on R21–R25 (rule 5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). None of rule 5 (7)'s reds is this module's. Rule 6 at START, and N1073's `common:121`.
Merge order in L11: after interface-shell (T49-20), setup-words (T49-15, first in L11) and interface-assets (T49-19), whose shell, keys and classes you draw; until plane merges, test against a fake plane (K31's pattern); after screens-settings. screens-inquiry's "Add a document" (T49-25 R38) opens your `capture` with its subject.
Reading set (mechanics §17, K3271): measured 391 KB with all your tests; 303 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

K3369: option (a) is right, but capture and acquisition are in L3, closed in T49 (P10): it is N1117 for T50. In T49 build R21, R23, R24, R26, R25's second part and R22's project filing by the front-matter line; do not offer 'For which question' and do not expect captured_for. Your requirements are marked so (merge the tranche branch): R25's first part not yet met: T50; R22's captured_for waits on N1117.

## B3 · CHANGE

CHANGE (K3370, K3371): op-capabilities, setup-words (word, hasWord, the generated list; WORDS_COMMIT 8a54848a9e) and interface-assets are merged into tranche/T49. Merge the tranche branch into yours now and re-run your tests against the real setup-words.

## B4 · ANSWER · re J2

K3372: 1(a) and 2(a) as you built: /app/capture/<tab>/<id>; result links /app/find-in/<document>/<question>. screens-inquiry (R38 link) and screens-daily (find-in's second step) are told. act.cite.label.document is right.

## B5 · CHANGE

K3374: the design's later words (DEC-259–DEC-261; 11,823 words) are merged into tranche/T49 and setup-words' rows.mjs regenerated. Merge the tranche branch. Placeholders changed in DEC-259 for archive.summary, calculation.counts, calculation.range, help-records.must.*, held.waiting, request.howsend.*: re-read any of these you draw and fill exactly their placeholders. SITE: civicsmith.org's keys (DEC-261) are now in words.json; site.groups.rule no longer says 'below'.

## B6 · ANSWER · re J3

K3376: all stand. Your R22/R25 now say /app/capture/<tab>/<id>; Provides' SCREEN_WORDS line is my edit at merge. archive phrases instead of summary: stands. held_at is N1126 (T50). You merge after interface-shell (plan rule 1); stay available.
