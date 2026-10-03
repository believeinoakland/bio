# acquisition (T32)

**Status** · session_01YSPCBnvSnZ3tLVcBFfJatU · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied.**
- N541 (R33): `firstHopWho(instanceName, version)` in `acquisition/checks.mjs` beside R24's agent, exported from the module (K1415: the version argument, defaults `unnamed` / `0.0.0`); R16's first hop now reads it, its answers byte-identical. Capture R65 calls `firstHopWho(env.INSTANCE_NAME, env.VERSION)`.
- N539 (R34): `civicosUserAgent` and `CIVICOS_CONTACT_URL` removed from `checks.mjs` and from the module's re-export; the K1365 (6) alias test replaced by an R34 test (neither name, nor any `civicos` export, on the module or its table; negative control: the Civicsmith names are the one function and constant).

**Tests.** `checks.test.mjs`: the R34 test above; an R33 test (the spelling, R24's defaults for missing or blank inputs, never throws on any argument, pure, one function from module and table, and the first hop of a capture on a named and on a bare instance equals it). Negative controls run: an alias restored fails R34 (8/1); the `who` spelled `CivicOS` fails R33 (8/1); both restored 73/0.

**Deferred.** None.

**Found in other modules.**
- control-plane: `test/m/control-plane/promotion-step.test.mjs:32` (R42, the rank) fails on `tranche/T32` without this change ("wizard-scripts (layer 11) ranks after the step"); not one of the plan's inherited reds. REPORT J3.
- Generated artifact made stale (§14): `bio-plane/dist/bio-plane.bundled.mjs` (acquisition source changed; it still carries the aliases). `newgroup/src/release.mjs` and `release/bio-plane.bundled.mjs` embed the released bundle, unchanged (N539's note). REPORT J3.

**Tests and checks run** (on 1a3df12a63, after merging `tranche/T32`):
- `node --test bio-plane/test/m/acquisition/`: tests 73, pass 73, fail 0.
- Every user of acquisition (capture with cap13 and d57selflink, reading-pipeline, capture-requests, docket, ratification, monitoring, instance-setup, control-plane): tests 878, pass 877, fail 1 (control-plane R42 above, red on the base too); no user names the removed aliases.
- `format`: 98 modules, 97 requirements files; 0 failures. `architecture acquisition`: 11 product files, 47 relative imports; 0 failures. `coverage acquisition`: 34 of 34 live requirement ids named by a test; 0 failures. `ownership acquisition tranche/T32`: 4 files changed; 0 failures.

Size (session_01YSPCBnvSnZ3tLVcBFfJatU): test runs 10, module lines 1578

## J1 · QUESTION

R33 names `firstHopWho(instanceName)` but its answer `instance <name> (Civicsmith/<version>)` needs a version, and this module holds none of its own (both sites read the instance's `env.VERSION`). My reading, which I am building: `firstHopWho(instanceName, version)`, a missing or blank instance read as `unnamed` and a missing version as `0.0.0` (R24's defaults, so the existing R16 answers stay byte-identical); pure, never throws. Capture R65 then calls `firstHopWho(env.INSTANCE_NAME, env.VERSION)`. If you want the signature to stay one argument, say how the version reaches it.

Requirements wording, yours to fold (no change of meaning asked): (a) R33 and R34 sit inside R32's sub-bullet list, splitting it (R32's bullets now follow R34); (b) R24 still says the aliases "are also exported … until every user has re-pointed", which R34 retires: R24's last sentence should go with N539.

## J2 · REPORT

(1) control-plane: test/m/control-plane/promotion-step.test.mjs:32 (R42, the rank) fails on tranche/T32 without my change: 'wizard-scripts (layer 11) ranks after the step' (7/1). Not one of the plan's inherited reds. (2) Stale generated artifact (§14): bio-plane/dist/bio-plane.bundled.mjs (acquisition source changed; it still carries the removed aliases), for regeneration at the close. newgroup/src/release.mjs and release/bio-plane.bundled.mjs embed the released bundle, unchanged, as N539 says.

## J3 · COMPLETE

N541 (R33 firstHopWho(instanceName, version), R16's first hop reads it, byte-identical) and N539 (R34, aliases removed) applied. acquisition 73/73; users 877/878 (the one red is control-plane R42, red on the base, J3). format, architecture, coverage (34/34), ownership (4 files): 0 failures each. Nothing deferred. Capture may now read firstHopWho(env.INSTANCE_NAME, env.VERSION). Size: test runs 10, module lines 1578.
