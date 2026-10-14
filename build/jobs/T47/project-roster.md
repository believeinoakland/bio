# project-roster (T47)

**Status** · session_01M7P1Jnd6PBhjfkna7wgTS6 · depth 2 · WORKING · handled B4

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

## J3 · COMPLETE · re B2

B2 (K3037) handled: merged tranche/T47 (f55c1b6820). R23 projectScope in Provides; its test (scope-approval.test.mjs R23) already drives it at the interface (set via projectScopeSet, read via projectScope; none for no record, unknown and non-string ids; writes nothing; never throws over an unreadable store). No code change. project-roster 46/46; format, architecture, coverage 26/26, ownership 0 failures. Earlier findings (plane ops-map pin, op-declarations spec for projectlist, plane bundle 5.4) unchanged.

## J4 · QUESTION

R27, my reading (proceeding on it; answer only if wrong). "Its first author, as the project's own record states" = the `author` of the project's first `manifest` entry (record-core R37's read contract: `manifest.bundle_id`, `author`, `created`, `rowid`; first by `created`, then `rowid`), which promotion stamps with the creating session's member id (control-plane `ownerMemberId`/`author` = `sessMember`). "An active member" = a row of membership's `members` (R120: `member_id`, `handle`, `status`) with `status = 'active'`, joined in the same statement. So `owner` is `{member, handle}` for such a row and `null` otherwise: an opener revoked or not yet active, a project opened by a machine credential (author `class:`/`token:` names no member), a project with no manifest entry, and a project the founder opened (`admin` has no `members` row; the founder is a person but not a roster member). If Home should name the founder as owner instead (e.g. `{member: "admin", handle: null}`), say so.

## Completion (PROJECT-ROSTER #6, T47-83)

**Reading set** (mechanics §17, 412 KB at START): read whole: `build/requirements/project-roster.md`; my entry T47-83 and the L2 merge-order line in `build/plan/current.md`; every file of `bio-plane/src/project-roster/` (3) and the test files R27 touches (`fixture.mjs`, `project-list.test.mjs`), with my own module's code read whole, not only what I changed (P20). For the opener I read record-core R34/R37/R42 (the `manifest` read contract) and its `commit`, membership R43/R68/R120 (the `members` read contract), and promotion's project creation and control-plane's `author`/`ownerMemberId` stamps (the creator's member id). No snapshot-branch work named. Merged `tranche/T47` first (e3b4f8a9ed).

**Entry applied** (T47-83).
- **R27**: `projectList` / `op=projectlist` answers each listed project's `owner`, the member who opened it: the `author` of the project's first `manifest` entry (record-core R37; first by `created`, then `rowid`, the order recorded), joined in the same statement to an `active` row of membership's `members` (R120), as `{member, handle}`; `null` for an opener revoked or not yet active, a machine's creation, the founder (no roster row), an author naming no member, and a project with no entry. Nothing else about the owner. The projects listed and the cap are R26's, unchanged. Writes nothing.
- My reading of "first author" and the founder's case is J4 (QUESTION); built on it.

**Fixed in my own module (P8).** None found beyond R27; the module header now names `manifest` beside `bundles` among the record-core read contracts it joins.

**Tests.** New `project-owner.test.mjs`, four tests naming R27: two (three) projects opened by two members each answer their opener, whoever wrote after; the first entry is by `created`, then the order recorded; the opener stays when ownership moves; handle live; exactly `{member, handle}`. Revoked opener null, and again `{…}` when reactivated; a not-yet-enrolled member's, a machine's, the founder's, an unknown author's, a null author's and an unrecorded project's opener null. Control: a project the viewer may not see is still absent, with its opener (cal's hidden project never appears for ann, bob, dee, the founder or an administrator); writes nothing; the op answers the same; the cap cuts owners with their projects. Over the real record-core: first commit's author, later commits change nothing. `project-list.test.mjs` (R26): the item shape now carries `owner` (R27), stated; no assertion weakened. Fixture: the stub record-core gains R37's `manifest` (`bundle_id`, `snap_key`, `author`, `created`) and `w.entry()`. Mutation check: dropping the `active` condition fails 2 of 4; reversing the order fails 4; ordering by `rowid` alone fails 1.

**Ran.**
- `node --test bio-plane/test/m/project-roster/`: tests 50, pass 50, fail 0. No layer tests named in the manifest.
- Users (P11): no module's code or tests call `projectList`/`projectlist` yet (grep over the repository: only the generated plane bundle); the op list is unchanged (thirteen ops), so plane's and op-declarations' pins are as at J1.
- Generated artifacts: `fleetbundles.test.mjs`: the plane bundle FAILs (rule 5.4; it bundles `src/project-roster/`, staled again by this change); every worker bundle PASS.
- Checks: `format` 0 failures (166 modules); `architecture project-roster` 14 files, 0 failures; `coverage project-roster` 27 of 27, 0 failures; `ownership project-roster tranche/T47` 5 files, 0 failures; `checks/run.mjs`: format 0, architecture 0 (3068 files), channels 0, coverage 46 failures, none of them this module's (other modules' not-yet-met ids, rule 5.1).

**Deferred.** None.

**Found in other modules.** None new. Generated artifact staled: the plane bundle (rule 5.4). screens-daily's `projects` screen (DEC-201) reads `owner` when its job starts.

Size (session_01EqRQSrvFHgecXk4RLmgHTk): test runs 9, module lines 1244

## J5 · COMPLETE

T47-83 complete (code 11d7130ebd). R27: projectlist answers each listed project's owner, the author of its first manifest entry (record-core R37; by created, then rowid) joined in the same statement to an active members row (membership R120), as {member, handle}; null for a revoked or not-yet-active opener, a machine's or the founder's creation, an author naming no member, and a project with no entry (my reading, J4). Nothing else about the owner; R26's set and cap unchanged; writes nothing. New project-owner.test.mjs (4 tests naming R27, control: unseen project absent with its opener); R26's item-shape test now states owner. Fixture stub gains manifest. project-roster 50/50; format, architecture, coverage 27/27, ownership 0 failures; run.mjs format/architecture/channels 0, coverage 46 none mine (rule 5.1). No user of projectlist yet; op list unchanged. Plane bundle staled again (5.4); worker bundles PASS. Deferred: none.

## B4 · ANSWER handled (K3074)

Merged `tranche/T47` (R27 re-worded: the founder's arm, and "first author" stated as my J4 reading). `projectList` now answers a project whose first `manifest` author is the founder (`admin`, bare, as the record stamps it) with `owner: {member: "admin", handle: "admin"}` (credentials R67); every other arm unchanged. The opener is computed once per project in a derived table over `bundles`' projects, so the founder test and the `members` join read the same value. Tests: `project-owner.test.mjs` R27 now asserts the founder's arm (stub and real record-core), that a founder's later entry opens nothing, and that a `member:admin` author is no opener (null); mutation: without the founder arm 2 of 4 R27 tests fail. Re-ran: project-roster 50/50; format 0, architecture 0 (15 files), coverage 27 of 27, ownership 0 (5 files); `checks/run.mjs` format/architecture/channels 0, coverage 46 none mine (rule 5.1); fleetbundles: plane bundle FAIL only (rule 5.4, staled), worker bundles PASS.

Size (session_01EqRQSrvFHgecXk4RLmgHTk): test runs 14, module lines 1248

## J6 · COMPLETE · re B4

B4 (K3074) applied (code 17772d8278): merged tranche/T47; a project the founder opened (first manifest author 'admin') answers owner {member: "admin", handle: "admin"}; other arms as J5. Tests assert the founder arm (stub and real record-core), a founder's later entry opens nothing, member:admin as author is no opener. project-roster 50/50; format, architecture, coverage 27/27, ownership 0 failures; run.mjs coverage 46 none mine; plane bundle staled (5.4), workers PASS. Deferred: none. This supersedes J5.

## J7 · QUESTION

R28, my reading (proceeding on it; answer only if wrong).
(1) `members`: every participant of the listed project as R1 lists them (`project_participants`, any state, joined to `members`, membership R120), `{member, handle}`, owners first then by handle. The viewer's sight is applied by R26 itself: a project is listed only at FULL, and at FULL R1 already shows that viewer every participant, so no member of a listed project is one the viewer may not see; a project not listed shows no one.
(2) An "act" is one `manifest` entry (record-core R37: one per commit, R33), at its `created`. A project's acts are those on its own bundle and on every bundle whose `bundles.project` names it (record-core R34), each counted only when membership's `viewerPredicate` (R43) admits that bundle to the viewer: so an act on a hidden project recorded as belonging to a listed one is not counted for a viewer outside it. Membership's own acts (invitations, joins, visibility) are not record acts and are not counted.
(3) `activity[7]` counts acts in (now − 7 days, now], `activity[6]` in (now − 14 d, now − 7 d], … `activity[0]` in (now − 56 d, now − 49 d]; acts after now or unreadable instants are not counted. "now" is the server's clock (a clock the host may configure, `Date.now()` by default), never a query parameter.
(4) `lastChange`: the `created` of the newest counted-kind act (any age, instants compared as instants, ties by recorded order), as recorded; null when none.
No new Uses edge: `manifest`, `bundles.project` (R37), `members`, `project_participants` (R120) and `viewerPredicate` are already named.

## Completion (PROJECT-ROSTER #7, T47-93)

**Reading set** (mechanics §17, 425 KB at START): read whole myself: `build/requirements/project-roster.md`; my entry T47-93 in `build/plan/current.md`; the public parts (Purpose, Provides) of `membership` and `record-core`; layer 2's row and its membership-split section in `build/layers.md`; every file of `bio-plane/src/project-roster/` (3) and every file of `bio-plane/test/m/project-roster/` (12 test files and `fixture.mjs`), not only what I changed (P20). For the gate I also read membership's `viewerPredicate`/`hiddenBundles` code. No snapshot-branch work named. My reading of R28 is J7 (QUESTION); BOB's B6 (K3144): (1)–(4) stand. `tranche/T47` was already merged at START (0245700fdb); no file I read changed since.

**Entry applied** (T47-93).
- **R28**: `projectList` / `op=projectlist` answers, beside R26's and R27's fields (unchanged, so every caller keeps working), each listed project's:
  - `members`: every participant in any state, as R1 lists them to a viewer at FULL (`project_participants` joined to `members`, membership R120), `{member, handle}`, owners first then by handle; the founder as R27 names it. A project is listed only at FULL, where R1 already shows that viewer every participant, so no member shown is one the viewer may not see.
  - `activity`: eight integers, oldest first; week k back (0 the newest) counts the `manifest` entries (record-core R37; one per commit) in (now − (k+1)·7d, now − k·7d] on the project's own bundle and on every bundle its `bundles.project` names (record-core R34), each counted only when membership's compiled `viewerPredicate` (R43) admits that bundle. Instants compared as instants (`julianday`), never as strings; an act after now or with an unreadable instant is in no week.
  - `lastChange`: the newest such act's `created`, as recorded (ties to the later recorded), null when none.
  - "now" is the server's instant: a host clock (`projectRosterOf(ctx, {clock})`, `Date.now()` by default; a clock that throws or reads as no number falls back to now), never a query parameter. No new Uses edge: `manifest`, `bundles.project`, `members`, `project_participants` and `viewerPredicate` were already named.

**Fixed in my own module (P8).** R1 (`projectParticipants`) dropped a participant with no roster row, so a founder invited to a project (D54) was missing from "every participant": it now lists the founder by the handle `admin` (credentials R67, as R27 names it); every other row and the order unchanged. Test added to R1's battery (`roster.test.mjs`). No other flaw found.

**Tests.** New `project-activity.test.mjs`, four tests naming R28: members equal R1's roster for every viewer of a battery (any state, revoked member, the founder, owners first, moving with ownership, removal and invitation), control: no member of a project the viewer may not see; activity's eight weeks at each edge (now, now − 7d, now − 56d + 1 ms in; now − 56d, after now, unreadable out), records of the project counted, instants compared as instants, ties, a later clock shifting every week, a query `now` ignored, the op answering the same; control: an act on a record the viewer may not see (a hidden project recorded as belonging to the listed one) moves neither activity nor lastChange while a viewer who sees it counts it, eight zeros for no act in eight weeks, writes nothing, never throws over a bad clock, the cap cuts with the projects; over the real record-core (commits as acts, R26/R27 fields unchanged). `project-list.test.mjs` R26's item-shape test now states the R28 keys (no assertion weakened). Fixture: a host clock (`w.time.now`). Mutation check: without the record-level gate 1 R28 test fails; with the weeks reversed 3 fail.

**Ran.**
- `node --test bio-plane/test/m/project-roster/`: tests 54, pass 54, fail 0. No layer tests named in the manifest.
- Users (P11): no module's code or tests call `projectlist` yet (only the UX substrate's mocks and registry). For R1's fix, the suites that use this module (screens-inquiry, plane, affordances, membership, case-account, filings, publication, op-declarations, record-core, op-grades, control-plane, screens-daily, d526), on my branch and on the tranche base side by side: tests 1738, pass 1696, fail 41 on both, the identical 41 by name (inherited reds, rule 5); no new red.
- Generated artifacts: `fleetbundles.test.mjs`: the plane bundle FAILs (rule 5.4; it bundles `src/project-roster/`, staled again); every worker bundle PASS; `newgroup-bundle-fresh.test.mjs` pass 1, fail 0.
- Checks: `format` 0 failures (168 modules, 167 requirements files); `architecture project-roster` 15 files, 0 failures; `coverage project-roster` 28 of 28, 0 failures; `ownership project-roster tranche/T47` 6 files, 0 failures; `checks/run.mjs`: format 0, architecture 0 (3125 files), channels 0, coverage 25 failures, none of them this module's (other modules' not-yet-met ids, rule 5.1).

**Deferred.** None.

**Found in other modules.** None new. Generated artifact staled: the plane bundle (rule 5.4). screens-daily's R10 can draw `members`, `activity` and `lastChange` once this merges.

Size (session_01M7P1Jnd6PBhjfkna7wgTS6): test runs 12, module lines 1327
