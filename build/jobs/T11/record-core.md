# record-core (T11)

**Status** · session_01F4Zw6fHHxLm7fXnQfo4nc5 · depth 2 · COMPLETE · handled B2

RECORD-CORE #6 (the first session of this job in T11).

## Completion

**Entries applied** (plan layer 2: N287).
- **N287 (R37).** `bundles.group_id` and `bundles.prior_state` tested at the contract (new test "R37 R44: … (N287)"): their names, types and nullability; their meaning read back through a later module's own SQL (a projection table joined to `bundles`, a divide by group), and `head` (R41) agreeing with the columns. Group: as given at creation, the empty string when none is named (absent or null), kept when a later commit gives none, replaced when one is given. Prior state: NULL when none is given at creation, as last given after.
- **A flaw N287's test found, fixed (commit, R37/R44/R33).** A later `commit` giving `group: null` threw (`NOT NULL constraint failed: bundles.group_id`), so the promotion failed whole, against R37's "kept when a later commit gives none" and R33's "never throws for a well-formed call". A null group is now "none": kept. Red before the fix, green after.
- **K313 (R40, R28), found and fixed.** `seedMintLedger` matched live ids by `GLOB '<prefix>-*'`: a caller's prefix of 49 bytes or more fails on workerd ("pattern too complex"), and a prefix holding `*`, `?` or `[` matched other ids. It now matches the literal `<prefix>-` head by `substr`, no pattern. New test "R40 R28: … (K313)", red before, green after. No LIKE/GLOB pattern left in the module but the counter's fixed `<P>-[0-9][0-9][0-9][0-9]` (at most 26 bytes).
- **K316.** The module's test storage (`test/m/record-core/storage.mjs`) answers a workerd-shaped cursor (iterable, `toArray()`, `one()`, no `[0]`/`.length`) and refuses a LIKE/GLOB pattern over 50 bytes, as content's fixture does. Every existing test passed on it unchanged in substance (the `rows` helper spreads; N117's read-counting wrapper reads `toArray()`): the module already read every cursor through a spread or `for…of`.

**Deferred.** None.

**Found in other modules and artifacts.**
- `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`): stale, since it takes record-core's `index.mjs`. Not rebuilt (mechanics §14). No other generated artifact takes record-core's files.
- The requirements' Status line still says "N213 and N219 folded …: R37 widened, R61; not yet met": both are met and tested since T9 (R37's N213 test, R61's three). Not my file to edit; for BOB to strike. R37 carries no `not yet met` mark for N287. R38's mark (K49) stands: nothing in this job touched it.

**Tests and checks** (on `job/T11/record-core` @ the commit below; the tranche's reds K348 names are not mine):
- `node --test bio-plane/test/m/record-core/`: tests 55, pass 55, fail 0, todo 0 (53 before this job, on the new cursor fixture too). With the tranche's `index.mjs` swapped back in: 53 pass, 2 fail (exactly the two new tests).
- Every module that uses record-core (38 test paths; `instance-setup` has none yet): tests 1787, pass 1728, fail 40, todo 19, identical with the tranche's `index.mjs` (the same 40 failures, by name): ai-runs' C-22.7 row and the Miniflare boot (`Cannot read properties of undefined (reading 'check')`) that K348 names, in affordances, capture-requests, host-governor, ai-runs and promotion's write-path suites. None changed by this job.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture record-core`: 4 product files, 6 relative imports; 0 failures. `coverage record-core`: 61 of 61 live requirement ids named by a test; 0 failures. `ownership record-core tranche/T11`: 4 files, legacy-store 0 added, 0 removed; 0 failures.

Size (session_01F4Zw6fHHxLm7fXnQfo4nc5): test runs 6, module lines 1046

## J1 · COMPLETE

Done: N287 (R37's bundles.group_id and prior_state tested at the contract, read through a later module's own SQL and head). Fixed two flaws my tests found, each red first: commit threw on a later group:null (NOT NULL on group_id; now kept, per R37), and seedMintLedger's GLOB '<prefix>-*' broke workerd's 50-byte cap for a long prefix and matched pattern characters (now a literal substr head, K313). Tests moved to a cursor-shaped, pattern-capped fixture (K316). record-core 55/55; users' suites 1728 pass / 40 fail, the identical 40 with and without my change (K348's reds); format, architecture, coverage 61/61, ownership 0 failures. Reported in my record: plane bundle stale (not rebuilt); the requirements' Status line still calls N213/N219 not yet met, which T9 met.

## Completion after B2 (K350)

Merged `tranche/T11` (C-22.7's catalogue row restored, the plane boots again) into `job/T11/record-core` @ 27efdb0077. No change to the module or its tests was needed.
- `node --test bio-plane/test/m/record-core/`: tests 55, pass 55, fail 0, todo 0.
- Every module that uses record-core (the same 38 test paths, the plane-booting suites among them): tests 1786, pass 1767, fail 0, todo 19. The 40 J1 failures (K348's) are all gone; none was mine.
- `format`: 0 failures. `architecture record-core`: 4 product files, 0 failures. `coverage record-core`: 61 of 61, 0 failures. `ownership record-core tranche/T11`: 4 files, legacy-store 0 added, 0 removed; 0 failures.
- Still reported: the plane bundle is stale from record-core's `index.mjs` (not rebuilt); the requirements' Status line's "not yet met" for N213/N219 is stale.

Size (session_01F4Zw6fHHxLm7fXnQfo4nc5): test runs 2, module lines 1046

## J2 · COMPLETE · re B2

B2 applied: merged tranche/T11 (C-22.7 restored); no change needed. record-core 55/55; users' suites incl. the plane-booting ones 1786 tests, 1767 pass, 0 fail, 19 todo (the 40 J1 reds all gone); format, architecture, coverage 61/61, ownership 0 failures. Record updated with its own Size line.
