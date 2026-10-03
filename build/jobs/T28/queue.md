# queue (T28)

**Status** · session_0118axgxaDiy6mVVbmPjTRhG · depth 2 · WORKING · handled B0

## Completion

**Entry applied** (B1 START; `build/plan/current.md` T28 L11, queue: R28, N527, K1299):
- **R28: the bridge reads a contradiction duty's published id.** Before this change, `OBLIGATION::contradiction::<c>` and `OBLIGATION::contradiction-unseen::<c>` (`queue-producers` R4, R7) were not classed: their second segment is not a kind. So the key went to `progressions.disposeProposal` and came back `NO_SUCH_PROGRESSION`. This was T27's deferral. Each id is now read as `contradiction-duty` or `contradiction-duty-unseen`, and refused `CLASS_NOT_DISPOSED` (C-33.44) with `class: OBLIGATION`, the duty's `kind`, and `instead` the door R12 names: `[contradictionclarify, contradictiontakeup]` and `[contradictionoptin]`. Those are the doors of a duty not taken up, because the bridge holds no subject. Nothing is written, and the progression arm is not reached.
  - The code is in `bio-plane/src/queue/index.mjs`. `Queue.obligationKindOfId(id)` is now the one reading of an `OBLIGATION::` id for R26 and R28. `Queue.CONTRADICTION_DUTY_SEGMENTS` holds the two segments.
  - The two contradiction segments need a non-blank candidate. Without one the id names no duty and goes to the progression arm, as before.
  - A catalogued kind's `OBLIGATION::<kind>::<rest>` is read exactly as before.
  - A `FINDING::contradiction::<c>` (a lead or a plurality) is unchanged: it is still a FINDING key, refused `NO_PROJECT_SCOPE`.
- The mute (R19, R26) needed no change. It already refuses any `OBLIGATION::` id `KIND_NOT_PERSONAL`, and `contradictions.test.mjs`' R19/R31 test holds that for `OBLIGATION::contradiction::C1`.
- No requirement's meaning changed, and no service another module uses changed.

**Deferred:** none.

**For BOB (requirements text, not mine to edit):** R28 still carries `*(not yet met: T28; N527)*`. It is met now.

**Found in other modules (REPORT):** no new flaw. The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) was already stale on `tranche/T28`: `fleetbundles.test.mjs` fails its 4 bio-plane arms with or without this change. `queue/index.mjs` is one of its inputs, so this change adds to that staleness. Nothing regenerated (manifest §14).

**Catalogue rows (accepted red 2):** none added or changed, so no `awaiting stamp` row to list.

**Tests and checks** (on `job/T28/queue`, `tranche/T28` @ `a278b38f93`; the newer tranche commits touch only plan and mailbox files):
- New test in `contradictions.test.mjs`, "R28 (N527)". It sends the duties' ids exactly as the feed publishes them and checks that each refusal's `instead` equals the item's own `disposition.instead`. It also covers:
  - a candidate holding the separator, and surrounding blanks;
  - a per-item set: two duties retained beside one applied item;
  - nothing written;
  - near-misses with no candidate, which are not bridged;
  - the FINDING of the same family.

  Negative control: with `index.mjs` reverted, this test fails (pass 5, fail 1). With the change, all pass.
- `node --test bio-plane/test/m/queue/ bio-plane/test/conclude-project.test.mjs`: tests 107, pass 107, fail 0.
- Whole `bio-plane/test/m`: tests 5685, pass 5672, fail 2, todo 11, skipped 0. Both failures are control-plane's `CHECK_FAMILIES` (`families.test.mjs` R22 and `catalogue-end.test.mjs` R43/R22). That is accepted red 6 (K1310), control-plane's L11 work. `families.test.mjs` fails the same way without this change.
- `bio-plane/test/system/fleetbundles.test.mjs`: 4 bio-plane arms fail on the stale bundle, both before and after this change (above). Every other member passes.
- Checks:
  - `format`: 95 modules, 94 requirements files, 0 failures.
  - `architecture queue`: 25 product files, 69 relative imports, 0 failures.
  - `coverage queue`: 40 of 40 live requirement ids named by a test, 0 failures.
  - `ownership queue tranche/T28`: 0 failures, re-run after the commit (below).

Size (session_0118axgxaDiy6mVVbmPjTRhG): test runs 8, module lines 6015
