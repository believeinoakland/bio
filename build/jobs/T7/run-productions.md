# run-productions (T7)

**Status** · session_01Phb9xWYe7qD4YrUzf54unC · depth 2 · WORKING · handled B1

## J1 · QUESTION

Q1. Seven points where the approved text leaves the build open. Each has my best reading; I am building on them now and will conform to whatever you rule.

1. **The C-27 and C-104 rows (R13, R16).** `skilldoctrine.mjs` (skills) imports `SUGGEST_LEVELS` and `SUGGEST_CHECKS` from the catalogue, and `store.mjs` imports `skillpack.mjs`, which imports `skilldoctrine.mjs`. Removing the rows from `bio-checks.mjs` in this job would therefore stop the whole plane loading until skills re-points its import. Reading: observation-log's precedent. `run-productions/checks.mjs` names the C-27 keys (all but C-27.15) and the C-104 keys, and exports `SUGGEST_CHECKS`, `EXTRACT_PROPOSE_CHECKS` and `SUGGEST_LEVELS`, read from the catalogue rather than copied. The regions R13 and LEGACY-CHECKS #2 REPORT 2 name are marked in my code, and the code mints `EXTRACT_NO_SCOPE`. The rows leave the catalogue once skills imports from run-productions, which needs a CHANGE to SKILLS. The rows' `where`s still say `src/store.mjs …`; only a legacy-checks entry can re-point them, and I will REPORT them. Alternative: I move the rows now and you merge skills with its import re-pointed in the same layer close.

2. **Providers not yet merged (ai-runs, basis-versions, strength, citation, inquiry).** Reading: K120/K146. `runProductionsOf(ctx, deps)` takes each provider injected under its Provides names (`aiRuns.runFor/boundOf/consumeBound`, `basisVersions.appendVersion/basisVersions`, `strength.candidatePair/candidateIndependence`, `citation.retiredNotCitable`). Until each merges, `run-productions/interim.mjs` builds that shape from readers the legacy store hands over: `#aiRunInSight` and its row, the bound upsert, `#strengthWalk`, `#independenceOf`, `#retiredNotCitable`, `promote` and the frontmatter helpers. Each provider's CHANGE deletes its interim arm. `connections.citesInto` and `content` are used directly, since both are extracted.

3. **`appendVersion` (basis-versions R28) does not state what R3, R4 and C-27.5 need.** The request:
   - (a) it takes `{target, base, version: {name, kind, description, claim, relationship, derived_from, run, author, at, level?, observed_at?}, grounds, legs, log}`, where `log` is the Session Log sentence, R4's entry naming the run;
   - (b) it answers promote's answer, refusals unchanged;
   - (c) basis-versions provides the pure normaliser the write applies, `versionAsWritten(submission)` (today `#suggestionPersisted` and `#fmSafe`), so C-27.5 and C-27.10 compare "as the document would store it" without a second copy.
   
   Until then the interim composes as the store does today.

4. **R5 read-back and C-27.10's held compositions.** Reading: through `basisVersions({id: target, limit: 1000, viewer})` (its R8–R9). A `truncated` answer is C-27.16. R5's `composition_grades` comes from that read; it is not in basis-versions' Provides today, so please fold it into R9 or tell me to drop it.

5. **R12's "cited" (a member's leg or version leg names the row).** No provider states it. Reading: `inquiry` and `basis-versions` each gain a set-based `citingContentIds(contentIds) → Set`. Until then the ratio's cited count reads `inquiry_basis.content_id` and `inquiry_basis_version_legs.content_id` inside the interim, as today. The machine-minted rows come from `content`'s R45 read contract.

6. **R14.** basis-versions R25 says the extract source is "registered by ai-runs"; that should read run-productions (map §5.2). Neither side names the registration. Reading: `basisVersions.registerNarrowSource("run-productions", (captureSha, limit) => rows)`. I export `narrowCandidates(captureSha, limit)` answering R14's rows, and register only when the provider offers the method. The store's `#narrowCandidateList` extract arm calls my `narrowCandidates` meanwhile.

7. **R9 (D-595).** A suggested leg carries `extent_capture`: the capture the leg names, if the run named one held for that document, and otherwise `content.captureFor(target)`. An inquiry leg carries none. A named capture not held for its document is C-27.8. The version legs' composition (basis-versions R5) gains a conditional `leg_capture` line so the freeze sees the pin, which is BOB #34's ruling ("through C-25.11's composition"). That is basis-versions' change, not mine. Until it lands the pin is written to the document and is outside the composition.

Also found: in `suggestVersion`, the independence-incomplete refusal uses `OMAX`, which is undefined there, so that path throws a ReferenceError instead of refusing C-27.16. It is fixed in my module (the limit comes from strength's answer).
