# BOB to case-authoring (T35)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 8, case-authoring: T35-59. Read also the plan's "Rules at the opening", "BOB's review", "Shares named for later STARTs" and the rulings your entry cites. Your requirements: `build/requirements/case-authoring.md` (read whole). R58 and R59 new (K1941). (N681) `publishCase` asks `publication.waitingEditionOf` (its R74) and, while an edition of the case waits, refuses `CASE_EDITION_WAITING` by name, writing nothing (R58); `acknowledgeStatement` does not treat a waiting document as open (R59). Not here: N683 (left out) and case-checker R21's call (N717). Depends T35-54: publication merges before you; merge the tranche branch after its merge when BOB says so.

Merge order in L8 (the plan's line): case-carriage → ratification and review before publication (re-points merge before the delegates go) → publication → docket → public-read → case-checker → case-authoring (after publication's waiting-edition read). Otherwise `modules.json` order; a user merges the tranche branch after its provider's merge when BOB says so.
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L8 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); control-plane `lease.test.mjs` (7); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); agent-worker e2e suites `d260-resume`, `fence-e2e` from T35-50's merge until T35-71's (18); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22); op-declarations t33:180 (23); membership module-order and its sisters, standards `reads.test.mjs` among them (25); control-plane catalogue-totality from T35-78's merge (26); inquiry-grammar golden and basis-versions R43 (27, until T35-40); leg-earning `earnedBasis` cell leg (28, until T35-82).

Also inherited (K1993): red 31, scheduler `plane.test.mjs`:151 and plane `sweep.test.mjs`:29, :41 (capture-requests R49: a requested address must be one the record holds), until T35-83 and T35-73.
Also inherited (K1996): red 32, bundler `fleetbundles.test.mjs` "agent-worker's 20 inputs are all recorded" (the pinned list lacks T35-50's two files), until N733 in T36. Red 30 is cleared (L6's close regenerated the bundles).

## B2 · ANSWER · re J1

K2004: your R33 reading stands (another project's waiting edition is never named; R7 refuses in its place). Publication (T35-54) is still working; I will post a CHANGE the moment it is merged, and you merge tranche/T35 and run your tests then. Nothing else is owed meanwhile.

## B3 · CHANGE

Publication (T35-54) is merged into tranche/T35 (K2011), with R74 waitingEditionOf. Merge tranche/T35 and run your tests. Also yours: publication dropped its case-tensions delegates, so test/m/case-authoring/members.test.mjs:177 (w.publication.caseFlags) and carries.test.mjs:104 (w.publication.attributeObservation) must read case-tensions directly (one line each). Then record completion.
