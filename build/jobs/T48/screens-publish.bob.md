# BOB to screens-publish (T48)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 11, screens-publish:
- **T48-75 · screens-publish** · (N1038) the reader's link shows its end date, from T48-44. (K3190, census P1; DEC-228) `published` opens each evidence row's bytes through `publishedbytes` by its full sha256, with no `Authorization` header, and offers "Download the complete edition" through `publishedcase`; a row with no sha draws no link · text BOB's.
- **T48-75 · screens-publish** also (K3279; T48-84's `published` clause, K3240): R21, `published` opened with no id, to a signed-out reader, offers the group's public page, never "Go to Home" · text BOB's.
- **T48-75 · screens-publish** also (K3273, REVIEW #14 J1): review-outside sends `until` in the stamp form (the end of the chosen day, `review` R34), never a bare date, which the plane refuses `REVIEW_BAD_UNTIL`; it draws the end date from the recipient's own grant part.
- **T48-75 · screens-publish** also (K3254; walk C1): R20 (CL) · text BOB's.
Your requirements: `build/requirements/screens-publish.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R18, R19, R20, R21).
BOB's notes for this job:
The registry and words re-takes (T48-55, T48-61) merge before any screen draws `elsewhere` or `updates`. Until T48-78 (plane) merges, a screen draws a `null` pointer as `state.failed`, testing against a fake plane (K31's pattern). A word you need that is not in `words.json`: tell BOB (a REPORT); never write a fallback of your own.
Reading (K3271, mechanics §6 step 2, which replaces plan rule 2): read in full your requirements, your entries, your layer's contract in `build/layers.md`, your own code, of each module you use only the services your entries touch, and the tests that name a requirement your entries change. Your other tests are run, not read. No digest helpers. Say in your record what you read; deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Keep your turns lean (K3269): no re-reading what you have read, no repeated full test runs beyond what a change needs.
Merge order in L11: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-assets, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane, installer, journey-check last; a job that uses no unmerged same-layer change merges as soon as it is complete.

## B2 · ANSWER · re J1

K3293: as you read it: the zone from publishpreflight's publish_at.zone, refusing to share without one, with your word held inline until UX-DESIGN keys it (I am asking). The download: build as written and report what the fixture shows.

## B3 · ANSWER · re J2

K3295: 1. As read. 2. review-outside draws the date and time with UTC named until review carries the zone (N1081, next tranche). 3. The complete edition is publishedbytes with sha256=<manifest_sha>&format=zip; R19's wording now says so. Merge origin/tranche/T48 into your branch.

## B4 · CHANGE

K3303: interface-shell is merged into tranche/T48 (R55 re-points, R56 class check, R60 words, R61 reading screen objects' ABSENT_CODES). Merge origin/tranche/T48 into your branch, drop any local stand-in, re-run your module's tests and the checks, and post COMPLETE with what (if anything) stays red and whose it is. Your merge follows in L11's order.
