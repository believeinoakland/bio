# agent-worker (T36)

**Status** · session_01Hh9JHb6PPhQvB7xFQFNXPb · depth 2 · WORKING · handled B1

## Completion

**Reading set (mechanics §17).** The set as measured was over 300 KB: `agent-worker/` alone is 875 KB without the bundle. I followed option (3) and trimmed nothing. These I read whole myself:
- my requirements, both parts
- layer 6's row of `build/layers.md`
- the plan's "Rules at the opening" and T36-24
- K2126, with my section of `plan/draft-T36-L6-reqs.md`, and K1864
- control-plane R41, the service my entry reads
- the source the entry changes: `src/index.mjs`, `ask.mjs`, `draft.mjs`, `ops.mjs`
- the tests it changes: `inprocess.mjs`, `ask.test.mjs`, `t35.test.mjs`, `harness.test.mjs`, `requirements.test.mjs`

One worker read the rest whole: `cascade.mjs`, `reads.mjs`, the six other suites, the four `plane-*.mjs` fixtures, the five controls, the build script and the configuration. It also searched outside the module for tests that drive or pin this member. Its summary is about 1,500 words, and each statement cites file and line. It found no change needed in those files. It found two things that mattered, both acted on below: the real door answers `agentpack` at the envelope's top level, and two control-plane tests go red. It did not run `fleetbundles` (I did) and did not read the suites I had changed (I read those).

**Entry applied (T36-24, N695's share, K2126).**
- **R48:** a run, an ask and a draft read the pack and its fences from `op=agentpack` under their own credential, and never from `op=affordances`. The change is in `index.mjs` (the run), `ask.mjs` and `draft.mjs`. `publishedPack` is unchanged: `agentpack` carries the same `pack` and `pack_absent` keys.
- **R37:** in `PLANE_OPS`, `affordances` is replaced by `agentpack`. `ASK_PLANE_OPS` changes the same way.
- **R59:** a draft with a grant reads `op=agentpack` under the grant. Without a grant it still uses the pack the door sent.
- N708's relay is not joined (rule 7 (a)).

**Tests.**
- New suite `test/t36.test.mjs`, 20 tests, names R48, R37 and R59 each in tests of their own. It captures every request at the `PLANE` binding for a run, an ask and a draft with a grant. Each asks `agentpack` exactly once, in the `Authorization` header, and never asks `affordances`.
- With `pack: null` and `pack_absent`, a run is refused 409 naming `pack_absent`, and an ask and a draft answer 502 `PACK_UNDETERMINED`. None of them makes a model call.
- A plane from before T36-37, whose `affordances` still carries a pack, is never read for it.
- No drive of the in-process instrument names `affordances`.
- A refused `agentpack` read on a draft is relayed unchanged.
- Negative control: against the old source, t36 reads 2/18.
- `requirements.test.mjs` now asks the real plane's `op=agentpack` and holds its shape.
- Every plane mock answers `agentpack` at the envelope's top level, as `control-plane/index.mjs`:1813 does.
- `inprocess.mjs` gains a draft model answer, the `noPack` and `affordancesPack` switches, and `driveOne`.

**Bundle (R45).** Regenerated with its own command (`npm run build`). The sha256 is `97ab5d388bfce31046d51467d4b1ce857f27c9bc97c0db2304b40c82d1c8c65d`. `fleetbundles` passes with 0 failures.

**Deferred.** None.

**Found in other modules (REPORT J1).**
1. **control-plane, red from this merge.** `bio-plane/test/m/control-plane/r53-routes.test.mjs`:196 pins `ASK_PLANE_OPS` to `affordances, askceiling, askcheck, askusage`; it should now pin `agentpack`. The loop at :198 and the title at :195 change with it, and the loop should keep skipping `agentpack`, which has no `OP_STAMPS` row (:88–89).
2. **control-plane, red from this merge.** `members-pin.test.mjs`:54 fails with "agentpack reached no handler". The door forwards `agentpack` to the hook as `op: "affordances"` (`control-plane/index.mjs`:1801–1806), so the log never names `agentpack`. The test should accept `affordances` for `agentpack`, as `affordances-pack.test.mjs`:91 does.
   - Both are control-plane's, for T36-37 or an accepted red. A third red in `r53-routes` (`spotcheck` and `spotcheckvisit` with no `OP_STAMPS` row) is not from this change.
3. **Requirement text, BOB's.** My Uses line for `skills` still says "the pack arrives rendered in `op=affordances`' answer (R48; K649 (5))". The manifest's generated-artifact row for this bundle says the same ("R48 reads the rendered pack from `op=affordances`"). Both should say `op=agentpack`.
4. **bundler, a comment only.** `bio-plane/test/system/fleetbundles.test.mjs`:219 says R48 reads from `op=affordances`.
5. **Release order (K2126).** This member must deploy with or before the plane's T36-37 change. No dependency runs the other way: the plane already serves `agentpack` (T35-72).

**Tests and checks run** (on `job/T36/agent-worker`, with `tranche/T36` merged):
- `npm test`: 11 of 11 files pass.
  - agent-worker 140/0, ask 57/0, cascade 56/0, fanout 185/0, harness 261/0, plan 55/0
  - requirements 294/0, t35 206/0, t36 20/0, versions 20/0, wire-vocabulary 83/0
- `fleetbundles` 0 fail, no skip.
- `format`: 135 modules, 0 failures. `architecture` (agent-worker): 0 failures. `coverage`: 57 of 57 ids, 0 failures. `ownership` (`tranche/T36`): 0 failures.
- P6: 2,478 source lines, under 4,000.

Size (session_01Hh9JHb6PPhQvB7xFQFNXPb): test runs 16, module lines 2478

## J1 · REPORT

Things I found outside my module. Details and citations are in my record's Completion.
1. control-plane, red from my merge: `bio-plane/test/m/control-plane/r53-routes.test.mjs`:196 pins `ASK_PLANE_OPS` with `affordances`; it is now `agentpack`. The loop at :198 should keep skipping it: it has no `OP_STAMPS` row.
2. control-plane, red from my merge: `members-pin.test.mjs`:54 fails with "agentpack reached no handler". The door forwards `agentpack` to the hook as `affordances` (index.mjs:1801–1806). The test should accept that, as `affordances-pack.test.mjs`:91 does.
   For T36-37, or name them as accepted reds.
3. Wording, yours: my requirements' Uses line for `skills`, and the manifest's generated-artifact row for my bundle, still say the pack is read from `op=affordances`.
4. bundler, a comment only: `fleetbundles.test.mjs`:219 says the same.
5. Release order (K2126): deploy agent-worker with or before T36-37.
