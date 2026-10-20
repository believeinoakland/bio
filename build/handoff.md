# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #230 (`session_019NF6ADBafVfG9j7bUX4C1L`, depth 1, parent ROOT #7, primary account), 2026-10-20 ~06:35 UTC, at 54% context (§5.8). **T51 is OPEN** on `tranche/T51`; the **fix round** runs (plan section "Fix round" in `build/plan/current.md`; binding text `build/plan/fix-round-T51.md`, `fix-round-T51-pass.md`, `starts-T51-FR/*.txt`). Read `build/rulings-active.md` whole, then with the Read tool, whole, **K4188–K4199** (the last lines of `build/rulings.md`; `sed -n` them into a scratch file first), then `build/plan/fix-round-T51.md` and `build/plan/fix-round-T51-pass.md`. Bodies over ~50 KB (`walk-T51-live/CAUSES-live.md`, the STARTs as a set) are read by a reading worker if needed (K3676).

## Where the round stands

- **Wave 1 merged:** FR-01 test-support, FR-02 bundler, FR-03 op-grades, FR-04 op-declarations, FR-05 interface-shell, FR-46 wizard-scripts (registry, library and front doors at the design `1cc4a957f0`). Their met marks are struck.
- **Re-opened, sessions alive (merge again on their COMPLETE):** OP-DECLARATIONS #27 `session_01Wn8nVUduH4GbFBXsW5fYy7` (CHANGE B12: the 37 owed acts the new registry draws, into `OWED_BY_FIX_ROUND`, derived not hand-listed); INTERFACE-SHELL #8 `session_018RtYmRfvBFKT71cztJSVMH` (CHANGE B18: the shell's added `reason` is a mark, not a declared field). The other wave-1 sessions (TEST-SUPPORT #7, BUNDLER #24, OP-GRADES #15, WIZARD-SCRIPTS #14) are complete and idle; archive all six at the round's close with their rows (§5.6, §10).
- **Accepted red by name on the tranche:** bundler R39's real-fleet arm and `fleetbundles` §9 (until FR-14 agent-runner merges); `fleetbundles`' stale bundles (regenerated after the round); interface-shell R106 "opens where registered" ×7 (until the wave-2 screen jobs draw the six screens); the design-drawn "acts are exactly its registry acts" reds of the screen modules (K4174, K4187); affordances R57/R61 (FR-40); plane R24 (new screens' words, at regeneration); screens-intake R8 (FR-26).

## Next, in order

1. Take over (§5.1): Status and Writer lines; delete WATCH #230 `trig_01CT9Z8pPyvqQQU7Yhea5XXh` (into ROOT) and my backstop (`Backstop #230`, into my session); arm yours; archive me and write my BOB-final row under T51; read the channel (UX design #35 `session_017Kc5zXnyJCdnZCKZ4daDSe`; read through U418, posted through B414).
2. When op-declarations and interface-shell are COMPLETE: merge them (op-declarations writes no requirement file: R80/R81 are written; interface-shell's R103–R109 are written).
3. **The mechanical pass** (`fix-round-T51-pass.md`; mechanics §5.10; no job running): one worker (sonnet, medium); its module list from the guard's census (`node --test bio-plane/test/m/interface-shell/declared.test.mjs` prints `declared N of M`), minus every owner with a job; any judgment hands the module its own wave-2 job; whole suite, `checks/run.mjs`, artifacts once; commit with a ruling.
4. **Wave 2** (§5.3), all at once: the STARTs in `build/plan/starts-T51-FR/` not yet used (FR-06 to FR-45 and FR-47, FR-40 affordances; the plan's section 4 is the list and merge order). Each job's model is in its START. Before each START: job branch an ancestor of the tranche (K3969); reading-set line as written.
5. Then the round's second pass (plan §7 "Placed in T51"): the mark-and-asking rule (K4199); deleting the superseded hand rows after the redeploy shows the plane assembling the owners' declarations; bundler's size (4,228 lines by the job's count, K4190) measured by K2513's rule, split if over.
6. Then one check pass on one tree (every module's tests with `mt.mjs`, `checks/run.mjs`, the regenerated artifacts, the local walk once), **redeploy biosmoke8** (unsigned dev build, K4186; `deploy-test.yml` cannot be dispatched until it is on `main`, so deploy directly from your session: `node bio-plane/scripts/deploy-fleet.mjs <member> --instance biosmoke8 --test-instance`, then the plane's `deploy.mjs biosmoke8 <version> dist/bio-plane.bundled.mjs --test-instance`; an auto-mode refusal is brought to Bob in your session, K4177; after file-scanner's deploy call `POST /mirror` once and confirm the 27 files scan), the smoke, a targeted re-walk (incl. the 390 px inspector walk, I-08, T-06, I-34), the census re-run with the guard's count; repeat only for what that pass finds.
7. At the end: the alpha release cut and signed (Bob's one click), T51's close (§5.7), the report to Bob.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3), K2273) and the design PR at the close on its MERGE (K1177); no refusal recorded.
- Deploys to biosmoke8: each deploy act may be refused by auto mode ("Production Deploy"); Bob's approval holds only in the session where he gives it (K4177). Never force-push; account 20b5…7f72 only.

## Helpers (rebuild in your scratchpad)

- `mt.mjs`: a copy of `.github/scripts/module-tests.mjs` that filters modules by argv, passes `--test-force-exit`, and excludes `journey-check/journey.test.mjs`. Write test output to a file.
- Packages before any test run (K4113).
- The design's merges go into the tranche as they arrive (K3917): merge, `node bio-plane/src/setup-words/build.mjs`, `--check`, commit, ACK; a running job that reads the registry gets a CHANGE.

## Open with Bob

- None.
