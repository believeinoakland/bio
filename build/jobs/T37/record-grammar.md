# record-grammar (T37)

**Status** · session_01DAQTevxD8WUdaHnDusXB4x · depth 2 · WORKING · handled B0

## Completion

**Read, whole** (mechanics §17, N739): my requirements (public and private), the plan's entry T37-1 and its "Rules at the opening" (rule 2), DEC-127 and DEC-157 in `docs/development/DECISIONS.md`, layer 1's contract in `build/layers.md`, every source file under `bio-plane/src/record-grammar/` and every test under `bio-plane/test/m/record-grammar/` (all but the data fixture `fixtures/expected.json`, which this work neither changes nor relies on). No used module (Uses: none).

**Entries applied (T37-1).**
- N669, record-grammar's share → R50: `PROPOSAL_STATES` gains `translation`, last (after `law_relation`), a frozen table of the three states. Each sentence says the wording is a draft translation of an interface word, shown to members as "Draft", and not the group's wording until a member granted that language adopts it; `machine_proposed` adds that it is machine work, labelled as machine work, which can draft a translation and can never adopt or confirm one. `proposalLabel(proposedBy, "translation")` answers as R38 says; the `RangeError` for an unknown subject names the thirteen subjects. The other twelve tables are byte-for-byte unchanged (pinned by a digest of their canonical JSON taken before the change).
- The plan entry says "after `wizard`"; R50 (BOB's later wording) says after `law_relation`, which itself follows `wizard`. I followed R50.

**Deferred.** None.

**Found in other modules** (also in REPORT J1).
- Generated artifact made stale (mechanics §14): `bio-plane/src/case-checker/program.mjs` (it bundles `labels.mjs`). case-checker `program.test.mjs` R13 is red with my change and green without it. The plane's bundle (`bio-plane/dist/`) carries `labels.mjs` too. BOB regenerates both at the layer close; I wrote neither.
- op-declarations: 3 tests are red on `tranche/T37` with and without my change (R21 R5 "every act the screen registry marks `function`…", R21 R27 "an act the registry marks `owed`…", R27 "DEC-148's library marks seven acts owed…"). They read the screen registry, which `main`'s PR #14 (DEC-179's word list) changed. They are not caused by this job, and rule 6 does not list them.

**Tests and checks.**
- `node --test bio-plane/test/m/record-grammar/`: tests 73, pass 73, fail 0 (R50 named in its own test, K874).
- Layer tests: none named in `build/manifest.md`.
- Users of the changed service (`proposalLabel` / `PROPOSAL_STATES`): case-authoring 158, wizard-scripts 65, standards 72, law-relations 26, filing-templates 51, action-grammar 29, conformance 80, escalation 63, actions 96, filings 70, action-plans 63, action-clocks 55: each 0 fail. op-declarations 103 pass, 3 fail (base reds, above). case-checker 51 pass, 1 fail (R13, the stale `program.mjs`, above).
- `node checks/format.mjs`: format: 136 modules, 135 requirements files; 0 failures.
- `node checks/architecture.mjs … record-grammar`: 25 product files, 45 relative imports (0 naming no tracked file, not judged); 0 failures.
- `node checks/coverage.mjs … record-grammar`: 48 of 48 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … record-grammar tranche/T37`: 0 failures (re-run after commit, below).

Size (session_01DAQTevxD8WUdaHnDusXB4x): test runs 18, module lines 2409

## J1 · REPORT

Found in other modules (details in my record's Completion): (1) my change stales case-checker's generated bio-plane/src/case-checker/program.mjs (it bundles labels.mjs): case-checker program.test.mjs R13 red with it, green without; the plane bundle carries labels.mjs too. Not written by me; BOB regenerates at L1 close. (2) op-declarations has 3 reds on tranche/T37 with and without my change (R21 R5 screen-registry 'function' acts; R21 R27 'owed' acts; R27 DEC-148's seven owed acts), reading the screen registry main's PR #14 changed; not in rule 6's list.
