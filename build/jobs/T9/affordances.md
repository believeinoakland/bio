# affordances (T9)

**Status** · session_01KtqNzCuPFCbu5MBHkeinse · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two questions. I carry on with my best reading of each; neither stops the job.

**Q1. R2's enumeration and the restored rows (K264).** R2 lists `RUNGS`' assignment exactly, and it does not name the seven layer-9 rungs K264 restores in T9: `reasoned` consequencerevise, addressedrecord, escalationevaluate, escalationadvance, escalationdecline, escalationsuspend; `reversible` escalationresume. R27's "the 42 ops graded `undetermined`" is likewise silent on the 15 new `undetermined` ones. With the rows restored, R2 read literally fails.
- Best reading, applied: R2 is folded to add the seven (K264 rules them), and my R2 test holds `RUNGS` to R2's list plus those seven. R27's test holds the undetermined set to today's list plus the 15 K264 names.

**Q2. N45's fact: `roster.owner_floor_clear` and projectleave (R9, R18).** Membership now refuses an owner's leave `LAST_COMMITTED_OWNER` unless another owner is committed (not `leaving`, R35). N176 words the fix as "`owner_floor_clear` counts committed owners only". But `projectownerremove` reads the same fact (R9), and its floor (R40) is `ownerMath` over all owners, plus a committed owner remaining. If `owner_floor_clear` counted only committed owners, an owner with one co-owner who has asked to leave would lose `projectownerremove`, the very act that honours that request (R35), which the store accepts.
- Best reading, applied:
  - `owner_floor_clear` keeps its meaning for owner-remove: `ownerMath(owners).possible`, and now also at least one owner committed, so a project whose owners have all asked to leave (where R40 refuses every target) is not offered it.
  - `roster` gains `other_owner_committed`: some owner other than `by` is not `leaving` (membership R65's owners, R74's state; R35's definition).
  - `projectleave` for an owner reads `other_owner_committed === true`.
  - R9's leave clause then reads "the caller is joined and is not an owner, or another owner is committed". That needs your fold of R9 (R18 already says it).
- The alternative, N176's literal wording, withholds owner-remove where the store accepts it.

## J2 · COMPLETE

**Entries applied** (plan layer 11; B1, B2/K309), on `job/T9/affordances` @ `3b93c2b929`, after merging `tranche/T9` at K309:

1. **K264's share of N216.** Layer 9's 22 rows are restored exactly as AFFORDANCES #2's record states them (from `92ebb0abeb`):
   - `NON_ACTS` for each;
   - `reasoned`: consequencerevise, addressedrecord, escalationevaluate, escalationadvance, escalationdecline, escalationsuspend;
   - `reversible`: escalationresume;
   - `substrate`: counselpacketexport;
   - `undetermined`: the 15 K264 names.
   - The 14 reads get none.
   - `catalogue.test.mjs` holds the op maps to exactly these 36 ops. R2 and R27 are tested as K309 folds them.
2. **The extraction of `affordanceFacts` (K225).** `bio-plane/src/affordances/facts.mjs` exports `affordancesOf(host, deps)`, re-exported from `affordances.mjs`.
   - It asks each fact through its provider's predicate: connections `citesInto`, citation `retiredNotCitable`, inquiry `restsOnLive`, publication `caseRelation`, basis-versions `conclusionOf`, ratification `caseConclusionFor` / `editionsRecordingConclusion`, and membership's `inSight`, `positionalMember`, `ownsAnyProject`, `isProjectOwner`, `isJoinedParticipant`, `participation`, `projectOwners`, `rescueRefusal` and `ownerMath`.
   - It reads record-core's `bundles` contract and `readFile`.
   - Removed from `store.mjs`: `affordanceFacts`, `#joinedCitingProjectOf`, `#concludedForJoinedProjectOf` and `#editionWarrantedForJoinedProjectOf`.
   - Rewired: the `affordancefacts` dispatch and `#queueOptions` call `affordancesOf(this.ctx)`.
   - Ownership: legacy-store 3 lines added (the import and those two call lines), 400 removed.
3. **N176 (R16):** `cites_in` is counts `{confirmed, severed}`. No fact names another bundle.
4. **N45 (R18), K309:**
   - `roster.other_owner_committed` gates an owner's `projectleave`.
   - `roster.owner_floor_clear` is `ownerMath` over the owners and at least one owner committed.
   - The plane test drives it: two committed owners are each offered leave. After one leaves, the other is neither offered leave nor accepted (`LAST_COMMITTED_OWNER`). Owner-remove stays offered, and removing the leaving owner is accepted (`VOTES_SHORT`, a parameter's answer).
   - R16 and R18 are met; the status line's "not yet met" for them is yours to clear.

**Deferred:** R26's live half (N231, a `test.todo`); nothing else.

**Other modules** (not changed by me):
1. **legacy-store:**
   - `store.mjs` keeps nine private delegates with no caller left: `#restsOnLive`, `#ownsAnyProject`, `#participation`, `#owners`, `#rescueRefusal`, `#caseRelationOf`, `#isJoinedParticipant`, `#isProjectOwner`, `#inSight`.
   - `static ownerMath` has no caller inside `store.mjs`; old suites may call `Store.ownerMath`.
   - The header comment at `store.mjs` 178 ("the store calls deriveActs over its own affordanceFacts") is stale.
   - All three are legacy-store's to delete. I may only remove moved code.
2. **legacy-index:** until its K263 routes merge, `unaccounted` over today's table reads the 22 layer-9 rows as `stale` (K208 (2)'s transient).
3. **legacy-tests** (red on my tree, green on `tranche/T9`), all source anchors on the moved code or the transient in item 2:
   - `affordances.test.mjs` 95/5: "NON_ACTS names only ops in NEEDS" (the transient); the facts-region anchors ("the region under test EXISTS", `#isProjectOwner`, the viewer parse, and §0's four `#retiredNotCitable` sites).
   - `rung-ladder` 44/4: BACKWARD and EXACTLY (the transient); NO UNBACKED CLAIM and "`reversible` … exactly" do not read layer 9's op maps.
   - `reopen` 59/1: "the raw consultation is GONE from affordanceFacts" (store text).
   - `reevaluation` 73/1: its CITED arm anchors `this.#restsOnLive(target)` in the store.
   - `d311-roster-affordances`, `project-sight` and `plane-envelope` are red on the base too (not measured further).
4. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` embeds `store.mjs` and `affordances.mjs` and is stale; yours to regenerate at the close.

**Tests and checks:**
- `node --test bio-plane/test/m/affordances/`: tests 74, pass 73, fail 0, todo 1 (R26 live, N231).
- `format`: 69 modules, 64 requirements files; 0 failures
- `architecture affordances`: 7 product files, 51 relative imports (0 naming no tracked file, not judged); 0 failures
- `coverage affordances`: 1 modules, 27 of 27 live requirement ids named by a test; 0 failures
- `ownership affordances tranche/T9`: 8 files changed by affordances between tranche/T9 and HEAD; legacy-store: 3 line(s) added, 400 removed; legacy-index: 0 line(s) added, 0 removed; 0 failures

Size (session_01KtqNzCuPFCbu5MBHkeinse): test runs 12, module lines 2708
