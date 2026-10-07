# BOB to acquisition (T35)

**Read** · handled J4

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 3, acquisition: T35-21. Read also the plan's "Rules at the opening", "BOB's review", "Shares named for later STARTs" and the rulings your entry cites.
Your requirements: `build/requirements/acquisition.md` (read whole); R17, R20, R25–R27, R29 amended, R38–R43 new, not yet met: T35 (K1940). `modules.json`: acquisition uses ooxml and membership from this START (test-support since the opening). Decided (K1940): each unpacked file is its own Information document at `collected` in the archive's project, held beside it (DEC-167's acts take its id); budgets per call 100 entries and 64 MiB, daily (automatic only) 1 GiB and 40,000 entries, the outermost archive at depth 1; a member's `op=unpack` passes the tree and daily budgets, never ooxml's per-archive limits or the depth bound; the per-capture co-archive choice goes either way, field `co_archive` (capture-requests R50 carries the same name); your tables (`archive_entries`, `unpack_days`) by `declareTable`. N661: `profileOf`'s comment and `origin.test.mjs`'s header drop "or a knock". **P6:** ~1,814 → ~2,500 lines; report if you would pass about 4,000. N641 is not here (left out).

Merge order in L3: host-governor → provenance → attestation → capture-sources → acquisition → capture (`modules.json` order).
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L3 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); extraction ×6 (6); control-plane `lease.test.mjs` (7); workbooks R15 (8); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); agent-worker e2e suites from T35-50 (18, not yet); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22); op-declarations t33:180 (23).
Your module's DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`): apply each with a test naming each string (the rule: field and identifier names stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing; P rows say "this group's").

## B2 · ANSWER · re J1

All eight readings are right; build on them. Specifics:
(1) `acquisitionOf(host, {record, provenance, membership})` and `store.acquisition` as you state. I am telling CAPTURE #22 its share (set `store.acquisition`, pass `ownHosts`) now; control-plane's share joins the plan's shares line for T35-72.
(2) Import `isOwnHost` through capture-sources' module entry (`../capture-sources/index.mjs`, re-exported there), not an inner file; if CAPTURE-SOURCES #11 exports it elsewhere, follow its merge (it merges before you).
(3) C-137 is yours; no other L3 job opens a new family.
(4)–(8) as read.

## B3 · CHANGE

Forwarded from CAPTURE-SOURCES #11 J2 (K1951): its DEC-149 row `memento.mjs`:256 now reads 'computed by your group's Civicsmith over the bytes it received'; your `test/m/acquisition/memento.test.mjs`:35 pins the old 'computed by this instance …'. Re-pin it in your job (red from capture-sources' merge until yours).

## B4 · CHANGE

Two more from CAPTURE-SOURCES #11 J3 and PROVENANCE #17 J2 (K1951): (1) `acquire.test.mjs`:78 (R3, R32) also pins the old memento wording 'computed by this instance'; re-pin it with `memento.test.mjs`:23/:35. (2) Your render request (`acquisition/index.mjs`:1013, from `RENDER_DEFAULTS`) passes `own_hosts` from the `ownHosts` you hold (R42), so capture-sources R64's own-host arm applies to real renders; capture-sources' `isOwnHost` is in `capture-sources/own-hosts.mjs` (import it through capture-sources' entry if it re-exports it there, else that file). (3) Provenance R42 requires the archive's own document to be filed in its home before any of its files is promoted: promote the archive first.
