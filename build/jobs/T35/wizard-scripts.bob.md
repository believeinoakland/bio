# BOB to wizard-scripts (T35)

**Read** · handled J0

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 11, wizard-scripts: T35-84. Read also the plan's "Rules at the opening", "BOB's review" and ruling K2021. Your requirements: `build/requirements/wizard-scripts.md` (read whole); read filing-templates' public part (R26, merged in L9).

(K2021) `src/wizard-scripts/index.mjs`:657-659, `#check`'s `templateOffered`, splits a `{template}` ref on '@', so '@records-request' reaches `offeredVersion` as template '' and version 'records-request' and is refused `TEMPLATE_REF_REFUSED`. A ref beginning with '@' calls `offeredVersion({name: ref, project?, viewer})`; an `<id>@<n>` ref keeps the split. Name it in a test.

Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L10 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); control-plane `lease.test.mjs` (7); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); agent-worker e2e suites `d260-resume`, `fence-e2e` from T35-50's merge until T35-71's (18); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22); op-declarations t33:180 (23); membership module-order and its sisters, standards `reads.test.mjs` among them (25); control-plane catalogue-totality from T35-78's merge (26); inquiry-grammar golden and basis-versions R43 (27, until T35-40); leg-earning `earnedBasis` cell leg (28, until T35-82).

Also inherited (K1993): red 31, scheduler `plane.test.mjs`:151 and plane `sweep.test.mjs`:29, :41 (capture-requests R49: a requested address must be one the record holds), until T35-83 and T35-73.
Also inherited (K1996): red 32, bundler `fleetbundles.test.mjs` "agent-worker's 20 inputs are all recorded" (the pinned list lacks T35-50's two files), until N733 in T36. Red 30 is cleared (L6's close regenerated the bundles).
Also inherited (K2011): red 33, control-plane `converts.test.mjs`:136 (publication R73's deprecation), until T35-72.

Also inherited (K2027): red 34, following `checks.test.mjs`:118 ("C-137 is following's alone"; acquisition's archive rows reuse family C-137), until N738 in T36.
