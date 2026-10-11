# conformance (T45)

**Status** · session_016gYHj2rZibm83nWVHN24Te · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings I am building on; please confirm or correct (none blocks me).

1. **R33, accepted finding, "and no acceptance in force at that edition".** My reading: a later publisher move recorded after the determination (`publisherMoves`, `at` after the determination's `at`, `taken_back` null) voids it as follows. A **withdrawal** of the pinned edition or of `all` voids it, whatever the acceptance says (the source withdrew what we rest on). A **newer edition** N of the case voids it unless `acceptedFinding({ref, edition: N})` answers an acceptance in force at N (the group has accepted the revision; the determination still pins its own edition and reads that pin). A move read that fails answers `cause: "unreadable"`.
2. **R36's refusal order** follows the requirements file (in force), not the l9a draft: MACHINE_CANNOT_LINK_CURE, NO_SUCH_DETERMINATION (either), DETERMINATION_NOT_A_PARTICIPANT (in `determination`'s project), DETERMINATION_SUPERSEDED (either), DETERMINATION_VOID (either), CURE_TARGET_NOT_NONCOMPLIANT, CURE_NOT_COMPLIANT, CURE_OTHER_OFFICE, CURE_NOT_LATER, CURE_LINKED. An optional `reason` that is given but not text or over 500 characters is `CONFORMANCE_BAD_REASON`, asked last.
3. **`cureUnlink` on a link that is absent, not visible, or already ended.** R36 names no code. My reading: absent or invisible answers through `noSuchDetermination(null, {link})` (a link is read on its determination; no new row); an already ended link answers `CURE_LINKED`'s opposite is not wanted, so I answer `{ok: true, wrote: false, ended: <the ending>}` (idempotent, nothing written). Refusals in order: MACHINE_CANNOT_LINK_CURE, the link unseen, DETERMINATION_NOT_A_PARTICIPANT, CONFORMANCE_NO_REASON / CONFORMANCE_BAD_REASON.

Also (K2832): R32's `identity`, `stake` and `edition_date` read from `case-import.importedCase`'s edition where it records them (fields `identity`, `stake`, `edition_date`, or inside `group_fields`); today none is recorded, so each reads null / `"undetermined"` with the sentence why.

## Completion (CONFORMANCE #19, T45-23)

**How the reading set was read (mechanics §17).** Read whole myself: `build/requirements/conformance.md`; the module's code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every test file under `bio-plane/test/m/conformance/` (P20); the providers' code I build on (`case-check/index.mjs`, `accepted-work/index.mjs`, `accepted-work/checks.mjs`) and the parts of `case-import/index.mjs` that answer `importedCase`, `findingFacts` and `moves`. One helper read whole and digested, citing each section: `draft-T45-l9a.md` "conformance", the l8/l9b/upper draft lines naming conformance, `BIO_Action_v0_2.md` §3, rules 1, 2, 3, 17, §6, the plan's reconciliation (R3, R4, R7, R20), the T45 lines of `consequences`, `escalation`, `actions` and `plan-work` that use conformance, layer 9 in `build/layers.md`, and `case-import` R4, `accepted-work` R2, R3, R8, `case-check` R2, R3, `inquiry-grammar` R11, `publication` R37. Sources stay binding.

**Entries applied (T45-23).**
- **R2, R31, R32, R14**: a finding is pinned as the first kind that holds: published (as before), checked and held (`case-check.heldFindingVersions`, each re-read through `caseCheckOf` as `held`; the check and `checked_at` pinned), or accepted (an `imported:` ref at a named edition; refusals minted by `accepted-work.acceptedLegRefusals`, C-21.4/C-21.5, never copied; group, case, edition, acceptance `by`/`at` and the source pair pinned). None: `FINDING_NOT_PUBLISHED`, detail and `kinds` naming the three, translation re-worded. New additive columns on `determination_findings` (`basis`, `check_id`, `checked_at`, `source_group`, `accepted_by`, `accepted_at`).
- **R9, R24**: each finding answers `basis`; accepted ones `identity`, `stake`, `edition_date` from `case-import.importedCase` where recorded (null / `undetermined` with `identity_says` until N903, K2832); a held check (fenced `caseCheckOf`) or accepted finding (accepted-work answering null for the viewer) the viewer may not see is withheld whole, `out_of_view: true`. `cured_by` and `cures` on every read.
- **R33**: void derived on every read (nothing written): a held check `void`/`undetermined`/unreadable; an accepted source's later move (withdrawal of the edition or `all`; a newer edition not accepted here; J1 reading 1, K2845); a moves read that fails is `unreadable`. Outcomes read `undetermined` with `recorded_outcome`; `void: {causes, says}`; `determinationsFor({void})` (batched, bounded scan); `determinationVoided(id, causes, extra)` module-level, row C-113.37.
- **R34**: a published held check whose edition holds the pinned version reads `basis: published` with `from_check`; a differing version stays `checked_held` and reads void (`published_version_differs`). Nothing rewritten.
- **R35**: `DETERMINATION_NOT_ADOPTABLE` (C-113.38) for `adopts`, `imported_determination`, `source_determination`, or an imported `supersedes`; asked after R30's head.
- **R36, R37**: `cureLink` / `cureUnlink` / `curesOf`, ops `curelink`, `cureunlink`, `cures`; tables `determination_cures`, `determination_cure_ends` (append-only, declared to purge); refusal order and unlink answers as J1 readings 2 and 3 (K2845). Rows C-113.39–C-113.44.

**Fixed in my own module (P8).** `CONFORMANCE_NO_REASON` / `CONFORMANCE_BAD_REASON` would have been minted at three sites with the cure acts; all now answer through one `#reasonRefusal` (rows' `where` re-pointed, numbers and translations unchanged).

**Deferred.** None.

**Found in other modules (REPORT J2).**
1. `affordances` `catalogue.test.mjs` "R1 R12: … layer 9's op maps hold exactly its 41 mutating ops…" is newly red: conformance's map gains `curelink`, `cureunlink` (acts) and `cures` (a read). Owed to op-declarations (T45-45), op-grades (T45-38: `curelink` and `cureunlink` reasoned acts, as draft-T45-upper line 180 grades them), affordances (T45-39). The already-red op-declarations R19/R6, control-plane R2/R53 tests now also miss these ops.
2. `answer-envelope` "R7, R2, R10: every code decorated before the catalogue's end reads the same check and translation…" is newly red: C-113.7's translation re-worded (R2), and rows C-113.37–C-113.44 new; they await promotion's stamp (T46, accepted red 2) and answer-envelope's re-pin.
3. `build/layers.md` layer 9's conformance row, Contract paragraph and uses line still read "published findings" and do not list the edges to `case-check`, `case-import`, `accepted-work` (BOB's).
4. `escalation`'s requirements hold no line refusing a void determination through `determinationVoided` (l9a says it is owed; consequences and actions have theirs).
5. `case-import` / `accepted-work`: R32's `identity`, `stake`, `edition_date` have no provider yet (N903, K2832): conformance reads `importedCase`'s edition fields `identity`, `stake`, `edition_date`, or the same inside `group_fields`.

**Tests and checks run.**
- `node --test bio-plane/test/m/conformance/*.test.mjs`: tests 105, pass 105, fail 0 (new `t45.test.mjs`, 16 tests; `reads.test.mjs`'s R9 key set gains `cured_by`, `cures`; fixture gains real case-check and accepted-work with stated stand-ins).
- Users: consequences 41/0 fail, actions 111/0, action-clocks 55/0, escalation 63/0, action-plans 63/0; filings 1 fail, plane 2 fail (both accepted reds, rule 4 (7), (9), (11), red on the tranche too); affordances 3 fail and answer-envelope 5 fail, of which one each is new (items 1, 2 above; the rest red on `tranche/T45` too, compared on a worktree of it).
- `node checks/format.mjs`: 0 failures. `node checks/architecture.mjs … conformance`: 0 failures. `node checks/coverage.mjs … conformance`: 37 of 37 live ids named, 0 failures. `node checks/ownership.mjs … conformance tranche/T45`: 0 failures.

Size (session_016gYHj2rZibm83nWVHN24Te): test runs 14, module lines 2732

## J2 · REPORT

Found while doing T45-23 (details in my record, "Found in other modules"):
1. affordances `catalogue.test.mjs` "R1 R12: … layer 9's op maps hold exactly its 41 mutating ops…" newly red: conformance's map gains `curelink`, `cureunlink` (acts, reasoned per draft-T45-upper line 180) and `cures` (a read). Owed to op-declarations (T45-45), op-grades (T45-38), affordances (T45-39); the already-red op-declarations R19/R6 and control-plane R2/R53 tests now also miss these ops.
2. answer-envelope "R7, R2, R10: every code decorated … reads the same check and translation…" newly red: C-113.7's translation re-worded (R2) and C-113.37–C-113.44 new, awaiting promotion's stamp (T46, accepted red 2).
3. `build/layers.md` layer 9 (conformance row, Contract, uses line) still says "published findings" and lacks the edges to case-check, case-import, accepted-work.
4. escalation's requirements have no line refusing a void determination through `determinationVoided` (l9a says owed).
5. R32's identity, stake and edition_date have no provider yet (N903): conformance reads `importedCase`'s edition fields `identity`, `stake`, `edition_date` (or inside `group_fields`).
