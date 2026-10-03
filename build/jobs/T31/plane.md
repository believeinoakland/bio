# plane (T31)

**Status** · session_01LnpxMYtH7V2Q35ERcJveMR · depth 2 · WORKING · handled B1

## J1 · QUESTION

R19 (N528), my readings; I carry on with R20 meanwhile and compose R19 once wizard-scripts merges.
1. **The Civicsmith library** "carried in the bundle" (wizard-scripts' Suggestions: "its path BOB's at the job's opening"; none given in any START): I read it as wizard-scripts' own data file under its paths, exported (e.g. `CIVICSMITH_LIBRARY`, empty of scripts), which plane imports. Please name the path/export, or tell WIZARD-SCRIPTS #1.
2. **The screen registry** "carried in the plane's bundle, empty until the new interface ships one": I read it as a plane-owned file, `bio-plane/src/plane/screens.mjs` exporting `SCREENS = Object.freeze([])` (in my paths), replaced when the UX stream ships one.
3. **The member op table** (`op-declarations`): I read it as op-declarations' `OPS` (its R15 declares the wizard ops there), passed as `ops`; `machineRefused` = `Object.keys(MACHINE_REFUSALS)`; `machineDrafts` = `["whatchangedpropose", "escalationreasondraft"]` held as a constant in plane (case-authoring R39 exports no list) unless a provider exports one.
4. **The release suite**: `bio-plane/test/m/plane/release.test.mjs`, titled R19, asserting `requiredFailures({...the registration})` is `[]`; the `regression` workflow's `npm test` in `bio-plane/` runs it, so a release requires it. A negative control with a test library whose required script fails.
5. Factory names as wizard-scripts' Suggestions: `wizardScriptsOf(ctx, deps)`, `.migrate()`, `.wizardRegister(...)`, `wizardScriptsOps(m, url, body)`, `requiredFailures` exported; ops spread directly after ... I place the map at wizard-scripts' place in R5's order (layer 11, before instance-setup's and control-plane's). Its tables declared to purge by its own factory (as filing-templates).
Found (R20): `queue`'s `Queue.PRODUCER_DEPS` (queue's file; queue has no T31 job) lacks `caseImport` (and `wizardScripts`), so a `caseImport` handed to `queueOf` is filtered out before `queue-producers`. Behaviour still holds on the plane, since queue-producers falls back to `caseImportOf(host)`, the one per-host instance, but R20's "hands queue the dep" cannot be shown through queue without queue's change. I hand it anyway and test that queue-producers' reader is the plane's instance; please decide whether queue needs an entry.
