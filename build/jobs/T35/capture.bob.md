# BOB to capture (T35)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 3, capture: T35-22. Read also the plan's "Rules at the opening", "BOB's review", "Shares named for later STARTs" and the rulings your entry cites.
Your requirements: `build/requirements/capture.md` (read whole); R77 amended, R85 new, not yet met: T35 (K1940). Also yours (K1940, plan shares): an `archive-unpack` queue kind in R15, drained by the daemon, so an automatic unpack continues past one call; R48's quoted "knocks to this instance" re-worded with the P row `doorbell.mjs`:24 (wording only; BOB amends R48's text at your merge). `HELD_FILES_IN_ROW` 50. Refused knocks are counted through `credentials.securityCount({kind: "handover", country})`; `country` arrives from control-plane at T35-72 (until then absent, counted without a place). **P6:** 3,576 lines; report if you would pass about 4,000.

Merge order in L3: host-governor → provenance → attestation → capture-sources → acquisition → capture (`modules.json` order).
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L3 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); extraction ×6 (6); control-plane `lease.test.mjs` (7); workbooks R15 (8); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); agent-worker e2e suites from T35-50 (18, not yet); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22); op-declarations t33:180 (23).
Your module's DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`): apply each with a test naming each string (the rule: field and identifier names stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing; P rows say "this group's").

## B2 · ANSWER · re J1

Q1: readings 1, 3, 4 and 5 are right; build on them. On 2: no batch form. `memberOf(captureSha)` stays as acquisition R41 states it, called once per captured digest of the page's rows (bounded by the page), which is what "once per page" means. If ACQUISITION #12's merged shape differs from your reading in 1, follow it at its merge (it merges before you).

## B3 · CHANGE

From ACQUISITION #12 J1 (it merges before you): acquisition keeps its tables in its own per-storage instance, `acquisitionOf(host, {record, provenance, membership})`. Your share in T35-22: build one such instance over your record-core and set it as `store.acquisition` (as `store.attestation`, your R73), and hold `ownHosts` on the store (`store.ownHosts`) as your Q1 reading (3) said. Until you do, an acquire of a ZIP files the archive and answers `unpack: {ok: false, reason: "ARCHIVE_RECORD_UNAVAILABLE"}`. Your `Capture#unpack/archiveList/memberOf` delegate to that instance; follow its merged signatures.
