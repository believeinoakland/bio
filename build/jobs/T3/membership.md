# T3 · membership — job record

Session: `session_01LSy7nZpkVyvEV81G4a5SYA` (MEMBERSHIP #1)

**Status** · IN PROGRESS, 2026-09-26. Job for module `membership`, tranche T3, branch `job/T3/membership` (from `tranche/T3` @ af11bd11c2). Entries: T3-2, N18, R62, R63, K57, REC-224, REC-226. Module built and tested (73/73 ids); running the old battery against the tranche base for comparison. Waiting on: BOB's answer to Q1 (built on my best reading).

## Entries applied

- **T3-2** · the module is extracted from `legacy-store` per `build/extraction/membership.md` and the requirements. New files: `bio-plane/src/membership/index.mjs` (class `Membership({ sql, core })`, `viewerPredicate` and `GATE_MARK`, `membershipOf(host)`, `membershipOps(m, url, body, env)`) and `bio-plane/src/membership/schema.mjs` (the module's DDL, additive columns, and its exempt and project-keyed table lists). Moved out of `store.mjs`: every method, static and private helper the map's §1 lists (sign-in and sessions, administrators, the roster, expertise, signing keys, AI credentials, participation, ownership, sight, visibility, the directory, requests to join, the fence), `#viewerSees` merged into `inSight`, `#positionalMember`, the 41 op-map entries (now `membershipOps`, spread into the store's map), the `members.name`→`cover` rename, the membership entries of `ADDITIVE_COLUMNS` and the five tables the constructor created. Moved out of `schema.mjs`: `credentials`, `sessions`, `bootstrap`, `members`, `signers`, `ai_credentials`, `project_visibility`, `project_sight`, `project_join_requests`. `store.mjs` keeps each public method and every private one the rest of the store still calls as a one-line delegation (`membershipOf(this).…`), and its public statics as aliases, so every op and every legacy caller answers as before; its boot calls `membershipOf(this).migrate()` after the schema pass. Kept in `store.mjs` as the map says: `PROJECT_NAMING_READS`/`#existenceRead` (the dispatcher's), `#joinedCitingProjectOf` and the two beside it (affordances'), `forkProject`, export, `gateFacts`, the group-identity cluster (C-64, K57), and small copies membership also holds (`#enc`, `#rand`, `#noSuchProject`).
- **K57** · R2's inactive-member refusal moved from the dispatcher's `login` arm into `login()` (same cost, same words); R15 `inviteLook` returns `expertise` from `member_expertise` (R24's form), and the vestigial `members.expertise` column is dropped at boot; `memberAdd` no longer reads `name` as an alias of `cover`; R64–R73 stated and built (`isAdministrator` now counts the founder only once claimed; `memberFacts`, `activeParticipants`, `attestingKeys`, `projectCreated`); `viewerPredicate` and `GATE_MARK` are membership's. legacy-store's two gate readers (`caseDocumentFacts`, `gateFacts`) call `attestingKeys()` instead of splicing the predicate. Project titles are asked of record-core's `bundleInfo` (R34); membership's SQL joins `bundles` only on `bundle_id`/`object_type` (record-core R37).
- **N18** · R10 `adminResign` (op `adminresign`); R11 the second administrator's `memberAdd` answer carries the hosting-access question, recorded by `hostingAccessSet`/`hostingAccess` (ops `hostingaccessset`, `hostingaccess`, table `hosting_access`); R18 an administrator's roster rows carry `projects`; R19 `memberPairingSet`/`memberPairings` (ops `memberpairingset`, `memberpairings`, column `members.pairing_published`); R29 a member-scoped credential naming another principal is refused `AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER`; R39 an owner is added only from joined participants (no longer marks an invited target joined); R42 every carried addition, removal and rescue is kept in `project_owner_decisions` and read by every participant (`projectParticipants.ownership`).
- **R62** · an organisation-scoped AI credential by a non-administrator is refused `AI_CREDENTIAL_ORG_NOT_ADMIN`.
- **R63** · every owner's removal is kept in `project_removals` and read by every participant (`projectParticipants.removals`).
- **REC-224** · R35 `LAST_COMMITTED_OWNER` (an owner may ask to leave only while another owner is committed, not `leaving`); R40 a removal that would leave only `leaving` owners is refused, naming them.
- **REC-226** · R33 an invitation closes the invitee's open request `granted`, by the inviting owner.
- **R65** · owners are listed in the order they became owners, by a per-project counter `project_participants.owner_order` (a timestamp tied within a millisecond). legacy-store's `#owners` keeps its sorted order (`#draftPublisher` reads its first).
- **R59** · membership declares its tables to record-core's `declarePurge` when record-core provides it; until then legacy-store's purge clears the seven project-keyed tables (including the two new ones) through `MEMBERSHIP_PROJECT_TABLES`.
- Stale comments (Suggestions): `members`' DDL comment repointed to Architecture v2; the `project_participants` comment says an owner removes; the fence's comment says 7.13 is built.

## Decisions made in the job (for BOB to record if he wishes)

- The module's shape is Q1's best reading: `new Membership({ sql, core })`, `core` = record-core's service object; legacy-store passes itself. Until record-core merges, `core.bundleInfo` is absent on the store, so a project's name reads `null` in the legacy integration (see "Waiting on" below).
- R19: the roster keeps R17 exactly (cover only under the administer stamp); the published pairings are their own read, `memberPairings`, so R17 and R19 cannot disagree.
- R11: "asked" is the second administrator's `memberAdd` answer carrying `hostingAccess: {asked, question}`; the answer is an append-only record any administrator writes.
- R10: the founder is refused `ROOT_OF_TRUST`; a non-administrator `NOT_AN_ADMIN`; two or fewer administrators `RESIGN_AT_TWO`. Capabilities are left as last set.
- R40's new refusal reuses R35's code `LAST_COMMITTED_OWNER`, with `leaving` naming the owners left.
- R29 and R62's refusals carry `check: "membership.R29"`/`"membership.R62"` and their sentence as `translation`: `legacy-checks`' `AI_CREDENTIAL_CHECKS` has no row for them and is not mine to edit.
- R71 `projectCreated` records the creation visibility with reason "chosen at creation" and `set_by` = `by`, else the owner.
- `project_owner_votes` keeps the rescue's vote row, as before; add and remove votes are still cleared once carried, after being copied into the decision.

## Deferred

None of my entries. The legacy integration of project names waits on record-core (below).

## Questions

### Q1 · how membership reaches record-core, and the parts of the extraction outside my paths

1. **record-core's shape.** record-core's Provides name services (`bundleInfo`, `listByType`, `declarePurge`, `transact`) but no module shape, and its job has pushed nothing yet. **Best reading, on which I build:** `bio-plane/src/membership/index.mjs` exports a class `Membership`, constructed with `{ sql, core }`: `sql` the store's SqlStorage, `core` an object carrying record-core's Provides as methods of those names. The legacy store builds one per Store instance and passes itself as `core` (so record-core's job's delegating methods on `Store`, e.g. `store.bundleInfo`, reach it); membership joins only `bundles.bundle_id`/`object_type` in its own SQL (R37) and reads a title through `core.bundleInfo`. Its tests run against a stub `core` implementing record-core's Provides over the same database. If record-core exposes a different shape, I adapt at the merge.
2. **`viewerPredicate` in `query.mjs` (query-language, layer 5).** I cannot edit `query.mjs`. Membership gets its own `viewerPredicate` and `GATE_MARK` (R43, K57); `query.mjs` keeps its copy until query-language's job makes it a re-export of membership's. legacy-store keeps importing it from `query.mjs` (changing that import line would add a line to an import of a module not mine). For BOB to route: a `query-language` entry.
3. **The old battery** (`bio-plane/test/*.test.mjs`, legacy-tests) keeps reaching this code through legacy-store's methods and ops, which delegate to membership; I change no old test.
