# accepted-work (T28)

**Status** · session_01Ny1sjsJ9vEJz7rxs28vcCh · depth 2 · WAITING ON BOB (J3) · handled B2

## J1 · QUESTION

Paths for accepted-work (B1 asks me to name them first). My reading: `paths`: ["bio-plane/src/accepted-work/"]; `tests`: ["bio-plane/test/m/accepted-work/"], as inquiry-grammar and the other L6 modules are laid out. Code in `bio-plane/src/accepted-work/index.mjs` (registerAcceptedWork, acceptedFinding, openFlagsOn, acceptanceWithdrawals, acceptedLegRefusals, the promotion step) and `bio-plane/src/accepted-work/checks.mjs` (C-21.4, C-21.5; R6). Please record them in modules.json on tranche/T28; I carry on reading and merge when you say.

## J2 · QUESTION

R4 needs the held version of the inquiry ("new against the held version, or whose target or target_edition changed"). promotion R39 hands a check `c.head` (type, state, group) but not the held document, and promotion exports no read of it; every module that diffs against the held version (intent, action-plans, inquiry) reads it with `record-core`'s `readFile(bundleId, "bundle.md")`. record-core is not in my Uses. My reading: add `record-core` (layer 2, before 44, so P4 holds) to accepted-work's `uses` in modules.json and to its requirements' Uses line ("`record-core`: `recordOf`, `readFile` (the held `bundle.md`, R4)"). I build on that reading now (`recordOf(host)` by default, injectable as `deps.record`); tell me if you rule otherwise. This does not replace J1.

## J3 · REPORT

B2 applied: tranche/T28 merged (record-core in my uses). The module is written and pushed (`bio-plane/src/accepted-work/index.mjs` 213 lines, `checks.mjs` 20; tests in `bio-plane/test/m/accepted-work/`, 19 tests naming R1–R7). With inquiry-grammar R11 stood in locally (uncommitted, spelled as R11 states it): 19 pass, 0 fail; format, architecture, coverage (7 of 7) and ownership (with the paths edit made locally, uncommitted) 0 failures. My code imports `parseImportedFindingRef` from inquiry-grammar and my fixture `importedFindingRef`, so my tests cannot run on the tranche until inquiry-grammar R11 is in: I wait for your word that it is merged, then merge, re-run against the real R11 and post COMPLETE.

For basis-versions (re B2): R3 is reached per host as `acceptedWorkOf(host, deps).acceptedLegRefusals({legs, viewer})` (the registration it reads is per host, K61, so it is an instance method, as R2's reads are: `acceptedFinding`, `openFlagsOn`, `acceptanceWithdrawals`). It answers `[{check, code, severity: "error", translation, detail, ord, ref, edition}]`; `ord` is a leg's own integer `ord` when it carries one, else its index in `legs`. R4 walks the inquiry's `basis[]` only, as you say. Also for the plane (L11): `acceptedWorkOf(host, {record, promotion})` registers the R39 step when made, so it is made before inquiry's factory; `case-import` calls `registerAcceptedWork("case-import", {finding, openFlags, withdrawals})`, each function synchronous (a promise answer reads as unreadable: promotion's checks run in a synchronous transaction).
