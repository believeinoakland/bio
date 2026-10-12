# project-roster (T47)

**Status** · session_01V2ibyN2cvYwuMA6E7qMpYL · depth 2 · COMPLETE · handled B2

## Completion (PROJECT-ROSTER #5)

**Reading set** (mechanics §17): 393 KB at START, under 600 KB; read whole myself: `build/requirements/project-roster.md`; the public parts (Purpose, Provides) of `record-grammar`, `record-core`, `membership`, `test-support` and `jurisdictions`; layer 2's row and contract in `build/layers.md` (with its membership-split section); the plan's entry T47-8, the L2 merge order and the rules at the opening (rule 5 as at my START); every file of `bio-plane/src/project-roster/` (3) and of `bio-plane/test/m/project-roster/` (9 test files and `fixture.mjs`), not only what I changed (P20). For R26's gate I also read `membership`'s `viewerPredicate` and `hiddenBundles` and `record-core`'s `bundleInfo`/`declareTable`/`declarePurge` code. No snapshot-branch work named.

**Entries applied** (T47-8).
- **R26** (N972; K3027 doubt 5): `projectList({viewer, limit})`, `op=projectlist` (`projectRosterOps`). One statement over `bundles` (record-core R37: `bundle_id`, `object_type`, `current_state`), `object_type = 'project' AND` membership's compiled `viewerPredicate` (R43), never a copy: a member's own projects in any state, an active administrator's and the founder's discoverable ones too (a hidden one only when invited or joined, D54), every project for a machine credential, and the empty list (`ok: true`, never a refusal) for a viewer R43 admits to nothing (none sent, unrecognised, a non-string, an argument that is not an object). Answer `{ok: true, projects, count, limit, truncated}`, projects in id order, each `{id, name, stage}`: `name` `bundleInfo`'s title (R34), `stage` `current_state` as recorded, `null` when none (NULL or the empty string). No question count. `PROJECT_LIST_LIMIT` 200, lowered never raised, one row read past the cap. Writes nothing.
- **N940** (test only): the fixture's record-core stub gains `declareTable`, so membership declares `join_doors` explicitly (its R131) as on a real host; the stub's `bundles` table gains `current_state` and `w.project()` records `forming` unless told otherwise.

**Fixed in my own module (P8).** R9's and R14's `limit` (`Number(limit)`) threw for a value no number can be read from (a Symbol, an object whose `valueOf` throws), against "no service throws": one `#cap(limit, ceiling)` now serves R9, R14 and R26, the ceiling for such a value; behaviour otherwise byte-identical. Tests added to R9's and R14's batteries. No other flaw found.

**Tests.** New `project-list.test.mjs`, six tests naming R26: the set equals membership's `inSight` for every viewer of a battery (members in each state, active and revoked administrators, the founder in both spellings, five machine classes, unknown viewers), moving at once with invitations, hiding, removal and the claim; the complement of R9's directory; the answer and item shape, `name` = R34's title, `stage` as recorded (a legacy state, `closed`, NULL, empty), only projects; the empty list for every viewer R43 refuses and every odd argument, writes nothing, never throws; the cap (lowered, never raised, measured one past, at the 200 ceiling over 205 projects); over the real record-core. `ops.test.mjs` re-pinned to thirteen ops with `projectlist` (query stamps, a body's viewer names nothing). `figures-purge.test.mjs` R18 holds N940 (membership's `join_doors` declared explicitly, `export: never`). Mutation check: with the gate removed, 6 of 6 R26 tests fail; with `stage` unmapped, 1 fails.

**Ran.**
- `node --test bio-plane/test/m/project-roster/`: tests 46, pass 46, fail 0. No layer tests named in the manifest.
- Users' suites (the modules whose code or tests name this module's ops: plane, op-declarations, op-grades, control-plane, affordances, membership, screens-daily, screens-inquiry, interface-shell), on my branch and on the tranche base side by side: two new reds, both other modules' pins of this module's op list (below); every other red identical on both (rule 5: op-declarations' design-file tests 5.7a, membership's MODULE_ORDER 5.6, affordances 5.7a). screens-daily, screens-inquiry, interface-shell, op-grades, control-plane: 475 pass, 0 fail.
- Generated artifacts: `fleetbundles.test.mjs` fails on the plane bundle only (rule 5.4; the plane bundles `src/project-roster/`); every worker bundle PASS; `newgroup-bundle-fresh.test.mjs` 1 pass, 0 fail (not staled).
- Checks: `format` 0 failures (165 modules); `architecture project-roster` 14 files, 0 failures; `coverage project-roster` 26 of 26, 0 failures; `ownership project-roster tranche/T47` 8 files, 0 failures; `checks/run.mjs`: format 0, architecture 0 (3059 files), channels 0, coverage 12 failures, none of them this module's (other modules' not-yet-met T47 ids, rule 5.1).

**Deferred.** None.

**Found in other modules** (R26's new op; BOB's START names these as T47-53, T47-48, T47-65 lists):
- **plane** `test/m/plane/` R5, R9 (T38-26) pins project-roster's ops map as twelve names; red with `projectlist` until plane's T47 job (T47-66) routes it.
- **op-declarations** R49, R6 ("every op an owner's map serves has a spec"): red until T47-53 declares `projectlist`. op-grades (T47-48) grades it; control-plane (T47-65) routes it. Its member-session class is theirs.
- Generated artifact staled: the plane bundle (rule 5.4).

Size (session_01V2ibyN2cvYwuMA6E7qMpYL): test runs 14, module lines 1232

## J1 · COMPLETE

T47-8 complete (record 03fcfe42ca, code 8ba56ed5d4). R26: projectList({viewer, limit}) / op=projectlist, one statement over bundles' projects through membership's viewerPredicate (R43), id order, {id, name, stage} (name R34's title, stage current_state as recorded, null when none), {ok, projects, count, limit, truncated}, PROJECT_LIST_LIMIT 200 as R9, empty list (never a refusal) for any viewer R43 admits to nothing; writes nothing, never throws. N940: fixture stub gains declareTable (membership's join_doors declared explicitly) and bundles.current_state. Fixed in my module: R9/R14 limit threw on a Symbol or throwing valueOf; one #cap now serves R9, R14, R26. project-roster 46/46; format, architecture, coverage (26/26), ownership 0 failures; run.mjs format/architecture/channels 0, coverage 12 none mine (rule 5.1). Two new reds in other modules, both their pins of this op list: plane R5/R9 (T38-26) ops-map pin until T47-66; op-declarations R49/R6 (every served op has a spec) until T47-53. Plane bundle staled (5.4); worker bundles and newgroup not. Deferred: none.

## B2 · CHANGE handled (K3037)

Merged `tranche/T47` (f55c1b6820): R23 (`projectScope`) moved from Private to Provides, wording unchanged. Its test (`scope-approval.test.mjs`, "R23 projectScope answers …") already drives it at the module's interface: scopes set through `projectScopeSet` and read back through `projectScope`; `none` for no record, an id naming nothing and non-string ids; writes nothing (snapshot); never throws over an unreadable store. No code or test change needed. Re-ran: project-roster 46/46; format 0 (160 requirements files), architecture 0, coverage 26 of 26, ownership 0.

Size (session_01V2ibyN2cvYwuMA6E7qMpYL): test runs 15, module lines 1232
