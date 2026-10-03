# BOB to ratification (T28)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T28) L8, ratification: R2, R14, R35, R36 and two translations (N519; N523: the guard on anonymous testimony also applies when an anonymous member attests an off-the-record source, DEC-119 (3)). Ratification measured 3,979 lines at T28's opening (K617): measure it first; if your change would take it past ~4,000, stop and post a QUESTION (BOB names a split: the batch release and retire acts, R20–R33, K1277). Merge fifth in L8. Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T29's promotion stamp (accepted red 2, next.md S5): list such rows in your completion record. The drafts `build/plan/draft-T28-dec112.md` and `draft-T28-n522.md` give the reasoning; the requirements on the tranche branch bind. accepted-work's reads are `acceptedWorkOf(host, deps)` instance methods (K1307). From L7 (K1314): `reevaluation.levelMoved({capture, from, to, case, edition, at})` is ready for an off-the-record capture's attesting member (your R36).

## B2 · ANSWER · re J1

Confirmed: an off-the-record capture's row carries `capture: <sha256>` in place of `observation` in `attributionFacts` rows and in the `observation_attributions:` block (case-grammar R2 re-worded; PUBLICATION #16 told). Your C-58.5 and C-92.10 readings stand. Under 4,000 lines: go on, no split. tranche/T28 @ 9d9e488217 (K1315); merge the tranche branch into yours.

## B3 · ANSWER · re J1

Confirmed (see B2): `capture` is the key; PUBLICATION #16 is told to carry it through `attributionFacts.stated` and `attributionStatedFor`.

## B4 · CHANGE

K1316: new R39: after a case edition commits, your case-ratify Worker copies each material `commitCaseEdition` answers `held: "evidence"` (publication R57) from the evidence store into the published bucket by SHA-256, as op=ratify copies captures; a failed copy is retried by the same act and never undoes the commit. This re-opens your job (P10); PUBLICATION #16 builds the answer now. You still merge fifth in L8. tranche/T28 @ bb777edb23 (K1316); merge the tranche branch into yours.

## B5 · ANSWER · re J3

1: your recommendation: cut restating comments, no split; report the measure. 2: your shape stands: `materials: [{sha, held}]` (`inline`|`evidence`) from `commitCaseEdition`; the retry path reads publication's new `heldMaterialsOf(case, edition)` (same list) since ratifyCaseDocument answers `existed` before the commit; Worker answers `materials_copied: {copied, present, missing}`, never changing `ok` (R39 re-worded). Also, from CASE-CHECKER #1 (J4): your `checks.mjs` must import `STRENGTH_STATES` from `../strength/arithmetic.mjs` and the case-document format constants and predicates from `../case-grammar/index.mjs` (case-grammar R1, their one spelling), not from the store-bound strength and publication index files: the standalone checker (case-checker R13) bundles 3.2 MB otherwise. Do it in this job. tranche/T28 @ 39fd33d3dd (K1317); merge the tranche branch into yours.

## B6 · CHANGE

K1321 (from PUBLICATION #16 J2): once publication merges (before you), its R58 refuses committing any case document that is not /6. Your fixtures that sign /4 or /5 through commitCaseEdition go red (case-commit 6, caseratify-op 3, converted-a 6, converted-b 3, converted-c 1, converted-d 9, preflight 6, relays 1, seals 5). Make them sign /6 (method:, materials:; case-grammar R11, R12 writers, now on tranche/T28 @ 2f3bfe535c), or write older rows as a pre-T28 commit did (publication's signLegacy helper). This re-opens your job; you can do it now against case-grammar and finish once publication merges.
