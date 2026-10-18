# provenance-routes (T51)

**Status** · session_01BrNh4dMAAcmVMwQjAe5j7i · depth 2 · WORKING · handled B1

## Completion (PROVENANCE-ROUTES #3)

**Entries applied.** T51-18 (BOB's START note 1): the `op=list` line of the comment at `index.mjs`:256 named the retired interface (`14 call sites in app.html`; `app.html` is in `civicos-ui/`, deleted at T51-126). Restated for the code as it is: every row carries `route`, read through `routeFinding` in `retrieval`'s own statement (R8). No other mention of the old interface in the module or its tests (grep of `bio-plane/src/provenance-routes` and `bio-plane/test/m/provenance-routes` for `app.html`, `civicos-ui`, `legacy-ui`, `ui`, `app`). The remaining "store" and "legacy" words name the retired store, not the interface, and are left as they are. No behaviour changed.

**Deferred.** None.

**Found in other modules (REPORT to BOB).** `checks/run.mjs` coverage names 10 modules with live ids no test names: agent-harness R17; agent-runner R36 R37 R38 R40; capture R96; entities R57–R61; explore R26; journey-check R19; people R40 R41; progressions R46; retrieval-browse R1–R18; retrieval R87 R89 R90. None is in provenance-routes. Not touched.

**Tests and checks.**
- `node --test bio-plane/test/m/provenance-routes/`: 40 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 5846 of 5883 live ids named, 10 failures (listed above, none in this module); channels 0 failures.
- `node checks/ownership.mjs /home/user/bio provenance-routes tranche/T51 job/T51/provenance-routes`: 0 failures (1 file changed, `bio-plane/src/provenance-routes/index.mjs`).

Size (session_01BrNh4dMAAcmVMwQjAe5j7i): test runs 1, module lines 1239

## J1 · REPORT

Found in other modules while running checks/run.mjs for T51-18. Not this module's; not touched. The coverage check names 10 modules with live ids that no test names: agent-harness R17; agent-runner R36 R37 R38 R40; capture R96; entities R57-R61; explore R26; journey-check R19; people R40 R41; progressions R46; retrieval-browse R1-R18 (all 18); retrieval R87 R89 R90. provenance-routes is not among them.
