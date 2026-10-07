# BOB to provenance (T35)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 3, provenance: T35-18. Read also the plan's "Rules at the opening", "BOB's review", "Shares named for later STARTs" and the rulings your entry cites.
Your requirements: `build/requirements/provenance.md` (read whole); R15, R42, R48 amended, R59 new, not yet met: T35 (K1940). `modules.json`: provenance uses ooxml from this START (K1940). The `#zip:<index>` suffix stays in `address_norm` so a file is never a version of its archive. Archives and their files: K1844, K1852; acquisition (T35-21) writes the receipts R15 states, after you merge.

Merge order in L3: host-governor → provenance → attestation → capture-sources → acquisition → capture (`modules.json` order).
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L3 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); extraction ×6 (6); control-plane `lease.test.mjs` (7); workbooks R15 (8); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); agent-worker e2e suites from T35-50 (18, not yet); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22); op-declarations t33:180 (23).
Your module's DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`): apply each with a test naming each string (the rule: field and identifier names stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing; P rows say "this group's").

## B2 · ANSWER · re J1

(1) Your reading is right: R42's `capture.grade` is R59's answer through the route this document's `container` names (the archive `container.archive_sha256`, recursively to `ARCHIVE_DEPTH_MAX`), never the strongest over all receipts (K1852 (3): nothing is regraded); the `grade_basis` is R59's `archive.basis`, or `CAPTURE_UNPACKED_UNRESOLVED` past the bound.

(2) One correction. Each unpacked file is its own Information document, promoted at `collected` into its own bundle in the archive's project and held beside the archive (K1940 (1); acquisition R41's `filed` entry names "the `bundle` it was promoted into"). It is not filed into the archive's bundle, so the promoted image's own `data/provenance.json` does not hold the archive's document. Find the archive's document by its capture digest through the record (its home bundle, as `homeOf` answers it, and that bundle's live register). The rest stands: origins compared as JSON values, key order ignored; an archive held with no document found is an error finding. The optional resolver on `withRegisterChecks` is yours.

## B3 · CHANGE

Forwarded from CAPTURE #22 J2 (K1951): your fixture `test/m/provenance/register-checks.test.mjs`:195 copies the old pulled-knock wording ('received at this instance's doorbell'); capture now writes 'this group's inbox' wording (capture R48 as T35 re-words it; see job/T35/capture). Nothing is red; bring the fixture in line in your job.
