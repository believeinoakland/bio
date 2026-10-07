# BOB to acquisition (T35)

**Read** · handled J0

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 3, acquisition: T35-21. Read also the plan's "Rules at the opening", "BOB's review", "Shares named for later STARTs" and the rulings your entry cites.
Your requirements: `build/requirements/acquisition.md` (read whole); R17, R20, R25–R27, R29 amended, R38–R43 new, not yet met: T35 (K1940). `modules.json`: acquisition uses ooxml and membership from this START (test-support since the opening). Decided (K1940): each unpacked file is its own Information document at `collected` in the archive's project, held beside it (DEC-167's acts take its id); budgets per call 100 entries and 64 MiB, daily (automatic only) 1 GiB and 40,000 entries, the outermost archive at depth 1; a member's `op=unpack` passes the tree and daily budgets, never ooxml's per-archive limits or the depth bound; the per-capture co-archive choice goes either way, field `co_archive` (capture-requests R50 carries the same name); your tables (`archive_entries`, `unpack_days`) by `declareTable`. N661: `profileOf`'s comment and `origin.test.mjs`'s header drop "or a knock". **P6:** ~1,814 → ~2,500 lines; report if you would pass about 4,000. N641 is not here (left out).

Merge order in L3: host-governor → provenance → attestation → capture-sources → acquisition → capture (`modules.json` order).
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L3 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); extraction ×6 (6); control-plane `lease.test.mjs` (7); workbooks R15 (8); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); agent-worker e2e suites from T35-50 (18, not yet); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22); op-declarations t33:180 (23).
Your module's DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`): apply each with a test naming each string (the rule: field and identifier names stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing; P rows say "this group's").
