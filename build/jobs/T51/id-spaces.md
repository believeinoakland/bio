# id-spaces (T51)

**Status** · session_0198axds8ktvGftPRS3gsQAQ · depth 2 · COMPLETE · handled B3

## J1 · COMPLETE

T51-169 (words, K3949) applied: the five findings in `build/plan/words-pass/id-spaces.md` are fixed by the words rule.
- `idspaces.mjs` (the reach sentence for mixed kinds): the inline sentence is `localize("id-spaces.idspaces.inside_reach_some_kinds", …, {n, named})`.
- `idspaces.mjs` (parcelStanding, vintages): the count sentence `localize("id-spaces.idspaces.in_none_of_the_published", …, {count})` and the no-vintage sentence `localize("id-spaces.idspaces.no_published_vintage_of", …)`, each inside the existing `localize` for the undetermined `says`.
- `test/m/id-spaces/fixtures.mjs` and `series.test.mjs`: the series label that copied a row's sentence is now the test-only label "Harbor directive"; the tests read the label from the fixture, so no sentence is copied.
Deferred: nothing. Found in another module: nothing.

Checks (job branch, merged with tranche/T51 @ 146041b9d0):
- `node checks/words.mjs /home/user/bio id-spaces`: inline 0, testcopy 0, marker 0; 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; words: no finding names id-spaces (the run's other failures are other modules' words findings and coverage reds, not this job's).
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio id-spaces`: 0 failures.
- `node checks/coverage.mjs /home/user/bio id-spaces`: 32 of 32 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio id-spaces tranche/T51 job/T51/id-spaces`: 0 failures.
- `node --test bio-plane/test/m/id-spaces/`: 37 pass, 0 fail, 0 skipped.

Size (session_0198axds8ktvGftPRS3gsQAQ): test runs 2, module lines 715

## J2 · COMPLETE

CHANGE B2 applied: the three plain findings in `build/plan/words-pass/id-spaces.md` are member-readable, so each reads through localize with an id:
- `idspaces.mjs` REFERENT_DISAGREES says: `id-spaces.idspaces.same_value_names_different`.
- `idspaces.mjs` no reporter data (both reasons, undetermined.why): `id-spaces.idspaces.no_reporter_data_held_for` and `id-spaces.idspaces.no_reporter_data_held`, inside the existing localize with {why}.
- `idspaces.mjs` no series (undetermined.why): `id-spaces.idspaces.active_profiles_supply_no`.
No REPORT to BOB: none of the three is a developer, diagnostic or wire string.
Deferred: nothing. Found in another module: nothing.

Checks (job branch, merged with tranche/T51 and civicos-process 27aa50e):
- `node checks/words.mjs /home/user/bio id-spaces`: inline 0, plain 0, testcopy 0; 0 failures.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio id-spaces`: 0 failures.
- `node checks/coverage.mjs /home/user/bio id-spaces`: 32 of 32 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio id-spaces tranche/T51 job/T51/id-spaces`: 0 failures.
- `node --test bio-plane/test/m/id-spaces/`: 37 pass, 0 fail, 0 skipped.

Size (session_0198axds8ktvGftPRS3gsQAQ): test runs 3, module lines 714

## J3 · COMPLETE

CHANGE B3 handled (K3960): tranche/T51 merged into the job branch (it already carries my B2 commit `421e946da8`, merged by BOB at K3961), and `setup-words/build.mjs --check` read-only: exit 0, names calc-grammar only, not id-spaces.

No code change this round. The recomputed "Plain findings (K3957)" section still lists two lines of my module (`idspaces.mjs:420` and `:673`). Both are already read through `localize` (`id-spaces.idspaces.same_value_names_different` and `id-spaces.idspaces.active_profiles_supply_no`), and both are member-readable (a verdict's `says`, and `undetermined.why`), so neither goes to a REPORT. The check at civicos-process 27aa50e reads zero plain findings for the module now (its `tReads` skip covers `localize` arguments), so the two lines are judged, not left open. BOB, please check whether the recompute counts `localize` arguments; if it does, these two are the only ones left.

Checks (job branch @ tranche/T51):
- `node checks/words.mjs /home/user/bio id-spaces`: inline 0, plain 0, testcopy 0; 0 failures.
- `node --test bio-plane/test/m/id-spaces/`: 37 pass, 0 fail.
- `node checks/coverage.mjs /home/user/bio id-spaces`: 32 of 32; 0 failures.
- `node checks/ownership.mjs /home/user/bio id-spaces tranche/T51 job/T51/id-spaces`: 0 files changed; 0 failures.

Size (session_0198axds8ktvGftPRS3gsQAQ): test runs 4, module lines 714
