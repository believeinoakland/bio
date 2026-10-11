# capture (T44)

**Status** · session_01K31cLKkb342PaC6HHChFmE · depth 2 · COMPLETE · handled B2

## Completion

**How the reading set was read (mechanics §17; K2032, K2700).**
- Read whole by me: my requirements (`build/requirements/capture.md`), and every file of my code (`src/capture/index.mjs`, `checks.mjs`, `grammar.mjs`, `ops.mjs`, `schema.mjs`).
- Also read whole by me: every test of mine (`test/m/capture/*`, `cap13-reuse-pages.test.mjs`, `d57selflink.test.mjs`), as plan rule 2 and P20 require.
- Also read: my plan entry T44-4 and the plan's rules at the opening; K2708, K2719 and K2726; `plan/draft-T44.md` § N870 whole; layer 3's contract and capture's two split sections in `build/layers.md`.
- Read by one helper agent: the used modules' public parts, plus doorbell's. The agent was given my entry and what follows it (T44's L4 extraction job, and the L11 jobs that read through doorbell). It wrote me a digest citing each section.
- The digest's findings:
  - no used module's Provides expects a source fingerprint or a `knock_key` table from capture;
  - `doorbell` R12 and R25 state that doorbell owns both;
  - doorbell R25 still reads its `env` (`KNOCK_FINGERPRINT_KEY` among it) through capture's R58 adoption, which is unchanged here.

**Entry applied: T44-4 (N870, K2708), R87's T44 clause.**
- Deleted in `src/capture/index.mjs`: the "HELD COPY" block, `#knockKey` and `sourceFingerprint`, and the header's sentence on the held piece. The header now states R87's clause.
- No import was left unused. `te` and `hexOf` are module-local and still used by `cursorOf` and R86's upload, so they stay.
- Capture now answers no source fingerprint and creates, declares and reads no table of doorbell's.
- Checked before the delete: outside doorbell, no source or test calls capture's `sourceFingerprint`. Admission's window calls `doorbellOf(ctx).sourceFingerprint` (T43-21).

**Test: `test/m/capture/t44.test.mjs`, three tests named R87 (K874).** The shape follows J1, adopted in B2 (K2758).
1. `captureOf(ctx).sourceFingerprint` is undefined, on the instance and the prototype. No method or route speaks of a fingerprint or a knock.
2. After capture's `migrate`, and after every such method is asked, a fresh storage holds no `knock_key` and none of doorbell R25's six tables, and capture declares none of them.
   - Control: `knock_key` made with its own shape (doorbell is later in the order, so a capture test cannot build it) is seen by the same probe.
3. Capture's acts never name a doorbell table, even on a storage that holds all six with a key in `knock_key`. The acts exercised: upload, enqueue, source outcome, links and their resolution, render admission, held list, grade note, counts and migrate. `knock_key` is left untouched.
- Against the old `index.mjs`, all three fail. Against the new one, all three pass.

**Own code and tests read whole (P20); flaws found and fixed (P8).** Two stale citations, both comments only:
- `migrate`'s doc said the tables are declared to purge under "R21". That is the evidence store. It now reads R87, R74's declarations.
- `heldCount`'s doc and held.test.mjs's R82 section heading cited `monitoring` R60. That id was retired, moved to `link-sweep` R8 (N506), the hold that reads it. Both now cite link-sweep R8, as R82 does.

No other flaw was found, and no requirement's behaviour changed. Deferred: none.

**Found in other modules (from the digest; wording only, no requirement failure):**
- `credentials` R38 says the sign-in window's `source` is made "as `capture` R56 makes one", and cites "`capture` R31's form". Both ids moved to doorbell (R12, R2).
- `credentials` R44 says "`admission` and `capture` write theirs". The handover count is doorbell's (its R20).
- `membership` R123 cites "`capture` R31's" two-bucket form. That is now doorbell R2.

**Generated artifact staled (§14; rule 4 (5)):** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json`, which embed `src/capture/index.mjs`.
- fleetbundles: 133 pass, 4 fail. All four are the plane bundle's staleness, byte identity, manifest sha and comment arm.
- On the tranche's capture sources it is 137/0.
- Regenerate at L3's close.

**Tests run** (summary lines):
- capture `test/m/capture/`: 128 pass, 0 fail.
- `cap13-reuse-pages`: 22 pass, 0 fail.
- `d57selflink`: 24 pass, 0 fail.
- Users and fixtures that build a capture:
  - doorbell 69/0, admission 43/0, acquisition 158/0;
  - affordances 231/2, case-authoring 185/0, case-disclosures 95/0, connections 119/0, control-plane 223/0, inquiry 205/0, link-sweep 29/0, machinery-producers 24/0, monitoring 124/0, observation-log 77/0;
  - op-declarations 132/1, plane 190/0, publication 134/0, ratification 233/0, setup-page 83/0, signatures 86/0, sources 30/0, store-door 44/0, file-safety 53/0, extraction 157/0.
- The reds, by file and line, are rule 4 (6)'s accepted reds, none mine:
  - affordances `t36.test.mjs`:54 and :93 (until T44-9);
  - op-declarations `t34.test.mjs`:148 (until T44-11).

**Checks** (from civicos-process):
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture` (capture): 28 product files, 112 relative imports; 0 failures.
- `coverage` (capture): 40 of 40 live requirement ids named by a test; 0 failures.
- `ownership` (capture, tranche/T44): see the COMPLETE entry.

Size (session_01K31cLKkb342PaC6HHChFmE): test runs 13, module lines 3191

## J1 · QUESTION

START's test asks for a control in capture's `t44.test.mjs`: "`doorbellOf(ctx)` creates it". The architecture check judges test files too, and `doorbell` comes after `capture` in `modules.json` order (and is not in capture's uses). So a capture test that imports doorbell turns architecture red.

My best reading, already built: capture's `t44.test.mjs` names R87 and checks three things:
(1) `captureOf(ctx).sourceFingerprint` is undefined, and no method or route carries a fingerprint or knock;
(2) after capture's `migrate` a fresh storage holds no `knock_key` and none of doorbell R25's six tables, and capture declares none of them. The control creates `knock_key` with its own shape, standing in for doorbell's migrate, and shows the probe sees it;
(3) capture's acts never name a doorbell table, even on a storage that holds them with a key.
Against the old code all three fail; against the new code all three pass.

The literal `doorbellOf(ctx)` control belongs in doorbell's own tests (doorbell R12/R25 already test the key there, by admission's tests). Carrying on unless you say otherwise.

## J2 · COMPLETE

T44-4 complete on job/T44/capture (record: Completion).
- Deleted: the held sourceFingerprint, #knockKey and the HELD COPY block; R87's T44 clause is met.
- Test: t44.test.mjs, 3 tests naming R87. All 3 fail on the old code and pass on the new. Control as adopted in B2 (K2758).
- Own code and tests read whole; two stale citations fixed (migrate's R21 -> R87; heldCount's monitoring R60 -> link-sweep R8).
- Tests: capture 128/0, cap13 22/0, d57 24/0.
- Users: doorbell 69/0, admission 43/0, acquisition 158/0, and 20 more modules whose fixtures build a capture, all green except rule 4 (6)'s accepted reds (affordances t36.test.mjs:54,:93; op-declarations t34.test.mjs:148).
- Staled: the plane bundle (fleetbundles 133/4, all bio-plane staleness; 137/0 on the tranche's sources). Regenerate at L3's close.
- Checks: format 0, architecture 0, coverage 40/40, ownership 4 files 0.
- Found (wording only): credentials R38 and R44 and membership R123 still cite capture R56/R31, which are now doorbell R12/R2/R20.
