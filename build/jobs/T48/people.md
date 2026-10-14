# people (T48)

**Status** · session_01MmY6q7CBhN2ngQCGTaZqs8 · depth 2 · COMPLETE · handled B2

## Completion

**Entry applied: T48-23** (N1032, K3145; N1050, K3178).
- **R39**: `personAt` (`op=person`) now answers `claims` and `claims_truncated` beside the cluster it states. `claims` lists every unwithdrawn identity claim the viewer may see (R31: a claim in a project the viewer may not see is skipped before it is counted) that has an end among the stated cluster's members, `same_as`, `not_same_as` and `unsure` alike. Each claim is `{claim_id, a, b, kind, grade, why, by, at}`, ordered by `at` then `claim_id`, at most 1,000, with `claims_truncated` set by reading one past; one ordered SQL cursor stops at the 1,001st visible claim. It writes nothing.
- **R38**: an organisation row of `peopleDirectory` now answers, in `today` beside `note`, `note_by` (the entity's `declared_by`, as `entities.readEntity` answers it in its Terms shape) and `machine` (`record-grammar.isMachineIdentity(note_by) === true`; false for an absent author). A person row is unchanged.

**Read.** I read whole: `build/requirements/people.md`, the module's code (`index.mjs`, `schema.mjs`, `checks.mjs`, 2,199 lines), all its tests and fixture (P20, step 2), the layer-5 entry in `build/plan/current.md` and BOB's START. **How the reading set was read (K2032, mechanics §17 (3)):** the used modules' Public parts (record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, provenance, content, sources, entities, events, lines, money, duties; and instance-setup R50) were read whole by a helper in this session. It was given the entry and what follows it, and wrote a digest citing each section. The parts that bind this entry are entities' Terms and R4 (`declared_by`, a machine as `class:<cls>`), record-grammar R15 (`isMachineIdentity`), membership R43/R44/R80 (sight) and instance-setup R50 (seeding, machine-attributed). I checked `readEntity`'s `entity.declared_by` and `isMachineIdentity("class:setup")` by running them. I found no flaw in my own code needing a fix in this job, and nothing is deferred.

**Tests** (all at the interface):
- `directory.test.mjs`: new R38 test (a body seeded by `class:setup` answers `machine: true`, and `class:daemon` does too; control: a body a member registered answers that member's stamp and `machine: false`; every organisation row's `note_by` equals entities' `declared_by`; a person row is unchanged). The R37 test's `today` check was amended for R38.
- `reads.test.mjs`: two new R39 tests. The first: a `same_as` claim and an `unsure` claim answered with their ids, as R1 and R2 answer them; withdrawing the `same_as` by its listed id leaves only the `unsure`; an undetermined cluster lists its `not_same_as`; control: a claim in a hidden project is absent and never named; it writes nothing. The second: the 1,000 bound with `claims_truncated`, a hidden claim not counted (control: the participant reads one past).
- `node --test bio-plane/test/m/people/`: **tests 56, pass 56, fail 0**.
- The users of `people` (retrieval, calculations, strength, answers, corpus-export, ratification, case-disclosures, case-authoring, consequences, scheduler, affordances, notice-producers, op-declarations, control-plane, plane and `test/system/migrate-released.test.mjs`): **pass 2214, fail 17** on this branch, and **pass 2214, fail 17** on `origin/tranche/T48`, with the same 18 failing names (one is the suite's "failing tests:" line). None is caused by this job, and none names people: op-declarations' registry and ACT_HELP, scheduler and plane alarm wakes, and control-plane `envelope.test.mjs` R32/R39/R46 (accepted red 6).

**Checks** (from the process repository):
- `format.mjs ../bio`: 168 modules, 167 requirements files; 0 failures.
- `architecture.mjs ../bio people`: 13 product files, 44 relative imports; 0 failures.
- `coverage.mjs ../bio people`: 39 of 39 live requirement ids named by a test; 0 failures.
- `ownership.mjs ../bio people tranche/T48`: 0 failures.
- `run.mjs ../bio`: format 0, architecture 0 (none for my files), channels 0. Coverage shows 45 failures, all other modules' ids not yet met (accepted red 1); none is people's.

**Found in other modules:** none. No generated artifact was staled by this job beyond accepted red 5 (the plane bundle, regenerated at the layer's close).

Size (session_01MmY6q7CBhN2ngQCGTaZqs8): test runs 3, module lines 2199
