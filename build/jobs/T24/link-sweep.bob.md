# BOB to link-sweep (T24)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T24) L10, link-sweep. A new module (N506, K1159, K1181): `build/requirements/link-sweep.md` R1–R12 (monitoring R53–R64, no change of meaning), `modules.json` paths `bio-plane/src/link-sweep/`, tests `bio-plane/test/m/link-sweep/`. **Merge second in L10**, after monitoring. (1) Create your module from monitoring's `sweep.mjs` and `sweep-match.mjs` (monitoring's job deletes them there; you never edit monitoring's paths) and move the tests `test/m/monitoring/sweep-grammar.test.mjs`, `sweep-reads.test.mjs`, `sweep-run.test.mjs` to yours, renaming R53–R64 to R1–R12. (2) Your module reaches monitoring only through R65 `sweepHost()` and registers through R66 `registerSweep` (read monitoring's public part); until monitoring's merge, test against a stand-in that keeps R65/R66's contract, then merge `tranche/T24` when BOB says monitoring has merged and run against the real one. (3) Export a factory (`linkSweepOf(host)`, the others' pattern), your ops map with `sweeps` (R9) for control-plane to route, `sweepConditions` (R11) for queue-producers, `sweepTick`/`sweepDue`/`sweepWake` (R4) for scheduler, and the R12 scope registration with capture-requests; composition is plane's (L11). Your merge clears red 4. Re-scan your own module for the N502/N508 kind (`plan/t24-stale-notes.md`; N469's rule) and re-word what you find. Do not edit another module's files; a change under `bio-plane/src/` may stale the plane's bundle: report it, regenerate nothing (`build/manifest.md`). Reds you inherit, accepted by name (`build/plan/current.md` T24 "Accepted reds"): red 2 (the UI's DEC-88 tests, Bob's); red 3 (coverage of other modules' opening ids); red 4 (format: `link-sweep`'s directories absent, until link-sweep's merge); red 5 (a row you add or change is `awaiting stamp` until T25's L2: list each in COMPLETE); red 6 (affordances' and op-declarations' totality over `optionstartpreview`, from action-plans' L9 merge until L11); red 7 (the sweep's composition, from monitoring's L10 merge until link-sweep's, scheduler's, plane's and control-plane's); red 8 and red 9 (K1200: scheduler `consumers.test.mjs`:161 and plane `notices.test.mjs`:39, cleared by scheduler's L10 and plane's L11 merges); BOB adds any red an earlier merge accepts. Proof: requirement-named tests at your interface for each changed id, with negative controls; your module's tests green; the whole `bio-plane/test/m` with no red beyond those named.

## B2 · ANSWER · re J1

K1206: your reading is ruled. C-18.16 is yours (row where: src/link-sweep/checks.mjs sweepGrammar > is-sweep-term), with C-18.17/.18; findings and refusal shape exactly as you wrote; fence answers null or the whole refusal, dueForSlate today's items. monitoring R66 now states this (merge tranche/T24 @ 20fe9ea18a); MONITORING #13 is told the same. Keep testing against your stand-in until I say monitoring has merged.

## B3 · ANSWER · re J2

Ruled as you built it (K1206's detail, BOB's): each finding's message begins with its field (today's text after the prefix), or with "carries '<key>', which is not a sweep's field (…)" for a foreign key; each carries field (or null). Monitoring's R27 composes `gathering.json sweeps[${i}]` + '.' + message when field is set, else ' ' + message, byte for byte today's text. MONITORING #13 is told the same.

## B4 · ANSWER · re J3

Thanks; all five acted on (K1207, tranche/T24 @ b8225bdab0). (1) op-declarations and control-plane gain the link-sweep edge; families.test.mjs:47 is part of red 7 until control-plane's merge; control-plane's START names the fix. (2) The row census: noted, list the rows in COMPLETE (red 5). (3) capture-requests' wording entered as N515 for T25. (4) Callers: scheduler re-points in L10; queue-producers, plane (notices.test.mjs:152 added to its START) in L11. (5) Noted. Keep waiting for my word that monitoring has merged.

## B5 · CHANGE

Monitoring has merged (K1208, tranche/T24 @ 9ab66154b9). Merge tranche/T24 into your branch and run against the real R65/R66; its COMPLETE states the seam exactly as K1206 and B3 ruled (grammar findings carry field; fence null/undefined admits; dueForSlate items {kind, bundle, id, definition}; sweepHost's land(request {id, bundle, locators, target}, filed {locator, doc}, at, say {title, summary, notes, trigger})). Monitoring's tests named R53–R64 are gone from its tree; yours carry them as R1–R12. Then COMPLETE.
