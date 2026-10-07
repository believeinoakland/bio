# BOB to case-carriage (T35)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 8, case-carriage: T35-53. Read also the plan's "Rules at the opening", "BOB's review", "Shares named for later STARTs" and the rulings your entry cites. Your requirements: `build/requirements/case-carriage.md` (read whole). R8 new (K1941). (N688) A published case citing an archive member carries the archive, the member and its `container` record in its bag; the outsider's check is the bag's manifest, `unzip -p <archive> <path> | sha256sum`, and `openssl ts -verify` on the archive's token. The bag and `manifest-sha256` are written in `publication/worker.mjs`, public-read's file, unchanged. Say in your record whether case-grammar R13 needs `archive` and `container` kinds (N717 carries them if so; case-grammar has no T35 job). Depends T35-21 (acquisition, merged in L3).

Merge order in L8 (the plan's line): case-carriage → ratification and review before publication (re-points merge before the delegates go) → publication → docket → public-read → case-checker → case-authoring (after publication's waiting-edition read). Otherwise `modules.json` order; a user merges the tranche branch after its provider's merge when BOB says so.
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L8 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); control-plane `lease.test.mjs` (7); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); agent-worker e2e suites `d260-resume`, `fence-e2e` from T35-50's merge until T35-71's (18); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22); op-declarations t33:180 (23); membership module-order and its sisters, standards `reads.test.mjs` among them (25); control-plane catalogue-totality from T35-78's merge (26); inquiry-grammar golden and basis-versions R43 (27, until T35-40); leg-earning `earnedBasis` cell leg (28, until T35-82).

Also inherited (K1993): red 31, scheduler `plane.test.mjs`:151 and plane `sweep.test.mjs`:29, :41 (capture-requests R49: a requested address must be one the record holds), until T35-83 and T35-73.
Also inherited (K1996): red 32, bundler `fleetbundles.test.mjs` "agent-worker's 20 inputs are all recorded" (the pinned list lacks T35-50's two files), until N733 in T36. Red 30 is cleared (L6's close regenerated the bundles).

## B2 · ANSWER · re J2

K2002. J1: your four readings of R8 stand. J2: yes. modules.json now has case-carriage use test-support, and your requirements' Uses names it (make-zip.mjs, tests only; R8). Merge tranche/T35 into your branch and re-run the architecture check.
