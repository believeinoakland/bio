# T3 · promotion — job record

Session: `session_01LPQSJzgT8fbw2kcionFsh3` (PROMOTION #1). BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T3`.

**Status** · COMPLETE, 2026-09-26. Branch `job/T3/promotion`, from `tranche/T3` @ af11bd11, with `tranche/T3` merged in @ 7d915799 (record-core and membership merged). No open question for BOB. Read whole: JOB.md, PROCESS-MECHANICS (§6, §12.2, §13), `build/requirements/promotion.md`, `build/extraction/promotion.md`, the public parts of `record-core` and `membership`, `build/layers.md`, my entries in `build/plan/current.md`, `gate.mjs`, `reopen()` and `promote()` (store.mjs 7984–8172, 17881–20100).

## Questions to BOB

Sent 2026-09-26 as one `QUESTION`. I carry on with every entry on the best reading stated with each.

- **Q1 · who edits `promote()`/`reopen()` in `store.mjs`.** The record-core map (§1) and membership map (§3.3) both describe rewiring `promote()`'s inline writes (manifest/history/files/bundles; the owner and visibility rows). Those lines are inside the function this job moves. Best reading: `promote()` and `reopen()` are wholly this job's to move; RECORD-CORE #1 and MEMBERSHIP #1 provide `commit` and `projectCreated` and do not edit those two bodies; this job rewires them to call their services. Please tell both jobs, or tell me otherwise, before either touches those lines (a three-way edit of one function will not merge cleanly).
- **Q2 · record-core's Provides do not cover what promotion reads and writes.** R33 `commit` takes no `current_state`, `prior_state`, group, `created`, `last_updated`, `criticality`, and no manifest time (promotion R3 "time"; R35 says the time is the document's stated time or the module's clock, today `meta.last_updated`). No record-core service reads a head's `bundle_sha`, `row_version`, `current_state` and `group_id` (promotion R1, R10, R13, R15, R16 need them; R37 contracts only `bundle_id`/`object_type`), the manifest entry under a snap key (R4), or the list of live paths (R7 `FILES_DROPPED`; `readImage` carries every history snapshot, too heavy per write). Best reading: record-core adds `head(bundleId) → {bundleSha, rowVersion, type, title, currentState, priorState, groupId} | null`, `manifestEntry(bundleId, snapKey) → {kind, base, author, created, files, writer, operation} | null`, `livePaths(bundleId) → [path]`, and `commit` takes `{state, priorState, group, created, lastUpdated, criticality, at}` besides its listed inputs. Until record-core's job completes, promotion reaches those through a record port the legacy store supplies over the same tables (listed ADDED lines), switched to record-core at the CHANGE.
- **Q3 · R31 / N8 / K10 (C-18.8) sits in `legacy-checks`, not in my `from` module.** `checkReleaseSignature` and the hand-written verifier are in `bio-plane/checks/bio-checks.mjs`; this job may edit only `legacy-store`'s files, and `promotion`'s `uses` in `modules.json` lacks `signatures`. `checkBundle` (layer 1) cannot call promotion. Best reading: BOB (a) adds `signatures` to promotion's `uses` (K10 already rules the edge) and (b) grants this job the extraction exception against `legacy-checks` for C-18.8 only: `checkReleaseSignature` moves to `bio-plane/src/promotion/`, `runGate` runs it after `checkBundle` with the same `releaseRegistry`, and bio-checks.mjs loses C-18.8 and the "Release-signature primitives" section. The catalogue census (CATALOG_VERSION) then changes: C-18.8 leaves `checkBundle` but is still run by the same gate. Until you answer, R31 stays *not yet met* and every other entry proceeds.
- **Q4 · R39's steps: order, and what a projection may add to the answer.** Today later modules' refusals interleave with promotion's own (the testimony fence before `OVERSIZE_INLINE`, `surfaced_by` before `ENVELOPE_*`). Best reading: promotion's own refusals (R1–R20) are asked first, then registered checks in the modules' total order (`legacy-store` last), inside `record-core.transact`; then `commit`; then registered projections in order. Which refusal a caller meets when several apply can change; none is dropped. And a projection returns `null` or an object whose keys are added to the accepted answer, never overriding promotion's own keys (today's `testimony`, `surfaced_in`, `migration_replay`, `content`, `version_content` keys stay on the answer that way). Tell me if that extension of R39 needs your wording in the requirement.
- **Q5 · N16's promotion share has no requirement for `forkProject`.** R19 states name uniqueness; nothing states `forkProject`. Best reading: this job moves `forkProject` and `projectNameKey` into the module with their behaviour unchanged, and BOB states `forkProject`'s requirement (a new R41) for its tests; until then it is moved and tested only through R19's uniqueness.
- **Q6 · N17: the catalogue has a row for `CAS_STALE` (ACT_SHAPE_CHECKS) and one named `EXISTS` (line 14329, another family's), none for `ABSENT`.** Best reading: `CAS_STALE` carries its row; `EXISTS` and `ABSENT` carry rows only if `legacy-checks` gains them (not this job's file), so they stay as the requirement's *not yet met* note says until an entry adds rows. Tell me if you want promotion to hold those two rows as its own invariants instead.
- **Q7 · R18, R30 and R32 also need `legacy-checks`, as R31 does (Q3); sent 2026-09-26 18:34 UTC.** R30's fix (D-700, D-718: `historyWriteOrder`, C-20.1 and C-17.2 walking write order) and R32's (D-673: C-4.2's in-bytes edge read against the recorded history) are changes inside `checkBundle` in `bio-checks.mjs`; the Batch30 branches make them there. `runGate` cannot reorder what `checkBundle` sorts itself. R18's rows (D-695: C-2.10's law arm, `RECORDS_LAW_REFUSED` C-73.6; D-717: `ACTION_CATALOGUE_CHECKS` C-101) rest on REC-201 and D-689 (a law-neutral `records_request` kind and a `law` field), which are actions' work not on `main`, and add catalogue rows. Best reading: extend Q3's exception to C-20.1, C-17.2 and C-4.2 (they move into promotion with C-18.8, and `runGate` runs them after `checkBundle`), and defer R18 to the tranche that extracts `actions` (its rows are that module's arms, enforced at promotion's door through R39). Until you answer, R18, R30, R31 and R32 have no passing test, so coverage cannot pass for them and this job cannot record completion.
- **Q8 · membership's Provides state no read of one member's participation in a project** (its state and owner flag), which `forkProject` needs to tell `NOT_A_PARTICIPANT` from `NOT_JOINED` (§7.12). R54's `isJoinedParticipant` merges `joined` and `leaving`; R37 answers by handle. Best reading: membership adds `participation(projectId, memberId) → {state, owner} | null`; the legacy store supplies it until MEMBERSHIP #1 lands. (Not yet sent; goes with the next message.)

## Answers from BOB

- **Q1–Q6** · ANSWER 18:26 UTC (K61, K62; merged @ 161cd541): Q1 yes; Q2 record-core R41–R44 (`head`, `manifestEntry`, `livePaths`, `commit`'s row fields), reached by `recordOf(ctx)`; the port stays this job's temporary code, listed here, switched to `recordOf` at the CHANGE and removed before completion; Q3 `signatures` joins `uses`, R31 met by promotion's own check (done, below); Q4 written into R39; Q5 below; Q6 `EXISTS`/`ABSENT` wait for N36.
- **Q7** · ANSWER 18:40 UTC (K64): R30, R31, R32's checks move here from `legacy-checks` once the `from` list is certified (a CHANGE to come); R18 is tested against the catalogue as it stands.
- **CHANGE** 18:43 UTC (K65): R30 reads write order from `seq`. Merged.

- **CHANGE** 18:47 UTC (K66): `from` is `["legacy-checks", "legacy-store"]`; C-4.2, C-17.2, C-18.8 and C-20.1 move here. Done (below).
- **Q5, Q8** · ANSWER 18:51 UTC (K68): `forkProject` stated as R41–R44 (tested); membership R74 `participation`, supplied by legacy-store until MEMBERSHIP #1 merges.
- **Early merge of record-core** (bde7923e): merged; promotion reaches record-core through `recordOf(ctx)`; the record port is gone.
- **CHANGE** 19:20 UTC: membership merged (221d4816); merged here @ 20eaeadb, the membership port removed, `projectCreated` called on a project's creation.

## forkProject, in requirement form (Q5; stated by BOB as R41–R44)

**`forkProject({projectId, newId, title, by, viewer, visibility}) → {ok:true, projectId, newId, title, origin, rel:"derived_from", owner, participantsCopied:0, bundleSha, visibility} | {ok:false, reason, ...}`**

- A named `newId` is refused `PROJECT_FORK_ID_SUPPLIED` (C-59.3) before anything is looked up, echoing no id: a fork's id is minted, as a project's creation's is (R19).
- Sight before position: a project the `viewer` sees at `EXISTENCE` answers `PROJECT_SEEN_NOT_A_PARTICIPANT` (its id and name only); one it does not see, or an id naming nothing, answers `NO_SUCH_PROJECT` identically. A `viewer` never sent is an internal caller and is not asked.
- `NOT_A_PROJECT` for a bundle that is not a project; `NOT_A_PARTICIPANT` for a `by` with no participation; `NOT_JOINED` (with `state`) for one invited or leaving (Membership v2 §7.12: an invited member sees the skeleton only).
- `NO_TITLE` for a title with no name; `NAME_TAKEN` when the title collides with any project's, compared as R19 compares (case and runs of whitespace ignored, deactivated projects included), naming no other project.
- `NO_DOCUMENT` when the origin's `bundle.md` is not held as text; `UNSPLICEABLE_REFERENCES` when its `references` block cannot be extended in place.
- The fork is a CREATION through `promote` (every rule of R1–R20 applies; its refusal is returned): the origin's document without its `id:` line (the fork's id is minted and written, R19), `title` set, `current_state: forming`, `created` and `last_updated` the act's time (the document states when the fork was created, R12), a `derived_from` reference to the origin (`note: forked by <by>`), and a Session Log entry; every other live file of the origin is carried. `by` is its sole owner (R19); no other participant is copied. `visibility` is the forker's choice under R19's rules, absent meaning hidden, and the answer reads it back.

## Work so far

- **T3-3 · extraction.** `promote()`, `reopen()` and `forkProject()` move to `bio-plane/src/promotion/index.mjs` (with `checks.mjs`, promotion's own refusal rows, and `text.mjs`, the front-matter splicers). `legacy-store` keeps delegating methods (`promote`, `reopen` with its reevaluation enrichment, `forkProject`) and registers, in its constructor, the record and membership ports (until record-core and membership land: Q2, Q8), the facts `producingGroup`, `citedBy` and `caseMember`, and one step: `#promoteChecks` (surfacing gate, `surfaced_by`, governing laws, testimony fence, gathering grammar, basis, subject, action, `responds_to`, supersession and division, basis versions, acyclicity, `BIAS_REFUSED`) and `#promoteProjections` (sight reindex, refs, supersession index, inquiry basis and content, versions, bias statements and adoptions, action tables, exclusions, strength, register, projection, text index, readings, testimony, surfacing and migration rows, the case revision flag). Those bodies are the old lines, unmoved; each is the later module's to take at its extraction.
- **Entries applied (on the readings above):** R11 (D-578, D-628, D-707), R12 (D-615, D-692), R13's revision refusal (D-726), R14 (D-738), R15 (D-546, bias included), R16's fact, R17 (D-741), N16's promotion share (fork, name uniqueness; the fork now states its own `created`, D-615's fork fix), N17 (`CAS_STALE` carries C-33.21).
- **R31 (N8, K10, K62)** · `bio-plane/src/promotion/release.mjs`: C-18.8 as promotion's own check. Every SSHSIG verification, the registry root's included, goes through `signatures.verifySshsig`; principal resolution (`allowed_signers` with its validity windows) and the canonical message (`releaseMessage`) stay with the check. `runGate` runs it after `checkBundle` and replaces the catalogue's C-18.8 findings with its own, so a release is judged once until the catalogue's copy leaves `bio-checks.mjs` (K64).
- **R18 (K64)** · tested through the whole write path (the store, reaching promotion and its registered legacy step): every catalogue row sited at the promote write is met by a probe, and the two catalogue functions the write relays whole (`basisVersionFindings`, `checkBiasExtension`) are shown relayed finding for finding.
- **R30, R32, and R31's move (K64, K66)** · `src/promotion/history.mjs` (C-20.1, C-17.2, C-4.2) and `release.mjs` (C-18.8), with `record-checks.mjs` running all four over one image. `bio-checks.mjs` loses them and the hand-written verifier (909 lines removed, none added). The gate runs them after `checkBundle`; the store's audit runs them through `recordAudit` (record-core's `auditPass`, then the moved checks over the same page; a bundle they find in error is re-judged whole so the counts stay exact). C-20.1 and C-17.2 walk `seq` and say when an image carries none (R30); C-4.2 reads an undeclared edge as made under earlier rules only where the record's own history holds the move at or before its type's fence, computed from the image itself (R32). The fence dates are `bias` 2026-09-24 (D-468, landed) and every other type 2026-09-26 (R15, this job). One C-4.2 arm stays in the catalogue: the "state_history[i] is not an object" guard, whose `continue` C-2.6's timestamp check needs (removal only); promotion does not repeat it.
- **CATALOG_VERSION 1.31.0 → 1.32.0** (R34): the gate runs the same checks, four of them changed. Suites that pin the version or count the catalogue's own checks (`d470-catalog-census.test.mjs` and its control) are legacy-tests' (REPORT).
- **Temporary code:** none left. The record port went at record-core's merge (bde7923e) and the membership port at membership's (221d4816): promotion's factory reaches both through `recordOf(ctx)` and `membershipOf(ctx)` (K61), and a project's creation goes through `membership.projectCreated` (R71), ownerless ones included, so each is reindexed.
- **Push guard.** The old process's `pre-push` hook (`tools/pushguard.mjs`, corpuscheck) refused a push over 21 unrelated docs' Status dates. CLAUDE.md retires the push guard, so this job pushes with `--no-verify`.

## Entries applied

- **T3-3** · `promote`, `reopen`, `forkProject` and project-name uniqueness extracted from `legacy-store` into `bio-plane/src/promotion/` (with `gate.mjs`); `legacy-store` keeps delegating methods and registers its share of every promotion through R39–R40 (K31). C-4.2, C-17.2, C-18.8 and C-20.1 extracted from `legacy-checks` (K64, K66). Requirement-named tests for every live id (R1–R44).
- **N8 / K10** (R31): C-18.8 verifies through `signatures.verifySshsig`; the hand-written Ed25519/SSHSIG verifier is removed from `bio-checks.mjs`.
- **N16** (promotion's share): `forkProject` and project-name uniqueness (R19, R41–R44).
- **N17**: `CAS_STALE` carries its row (C-33.21); `EXISTS`/`ABSENT` wait for N36 (K62).
- **Carried rows**: R11 (D-578, D-628, D-707), R12 (D-615, D-692), R13 (D-726), R14 (D-738), R15 (D-546), R17 (D-741), R18 (K64, against the catalogue as it stands), R30 (D-700, D-718, on `seq`), R32 (D-673, corroborated from the image).

## Deferred

- None of this module's own. `EXISTS` and `ABSENT` rows: N36 (K62). R18's D-695/D-717 arms: with `actions` (K64).

## Found in other modules (REPORT)

1. **legacy-tests: the old battery on this branch against `tranche/T3` @ 7d915799** (the full battery, `bio-plane/test/*.test.mjs`, both trees): 51 red on the tranche, 87 here; 36 pass there and fail here, none the other way. Each was diagnosed; none is a defect in this module:
   - **Fixtures R12 now refuses** (an envelope `created`/`last_updated` contradicting the document's own; D-615's branch met the same): case-authority, caseproduction, casesign, citeproject-inquiry, conclude-project, d149-governing-laws, d512-replay-verified, deliverer, disposition, divide, multifinding, projection, publish, ratify-authority, rec108-cache-asof, rec170-manifest-pair, rec214-risk-tier-revision, rec220-version-pin, unattended-lease. Measured: with the date refusal switched off locally, every one of these passes.
   - **Fixtures R13/R14 now refuse**: store, ratify, audit (a document stating one id filed under another, R14; the audit's C-1.1 fixture can no longer be written); machine-fences (a revision restating another group, R13).
   - **Refusal order, R39 as K62 wrote it** (promotion's own refusals before the registered checks): d526-refusal-order (ENVELOPE_TYPE_DISAGREES before SURFACE_NO_RUN / GOVERNING_LAWS_REWRITTEN), testify (FILES_DROPPED before TESTIMONY_AUTHORED_DROPPED).
   - **The catalogue lost C-4.2, C-17.2, C-18.8, C-20.1** (K64): check-firing and mechanical call `checkBundle` directly and expect C-18.8 / C-20.1 (the gate runs them now); repair-reachability anchors on the removed text; d470-catalog-census pins 1.31.0 and the old census (now 1.32.0).
   - **Source-anchored on code that moved** (retire with it, §12.3): fence-e2e, inquiry (neutering patch), instance-group S5, m025-arm-anchor-witness, meaningquery (legs pin), refusal-wire (MACHINE_CANNOT_REOPEN's site), risk-tier (promote as the one writer in store.mjs); and, seen earlier in the job and red on the tranche since the record-core/membership merges: machinefences-dec49, aicredential, rung-ladder, hygiene (src walk meets `src/promotion/`), opaque-ids, project-mint, derivation-bounds, meaning-bounds, project-discoverable 1a0, versions (promote's write-site count), subresources (reads `MECHANICAL_APPEND_FILES` in bio-checks).
2. **record-core: `auditPass` takes no extra checks.** A module whose checks left the catalogue can only add them to the audit from outside, so `promotion.recordAudit` re-runs the catalogue on a bundle the moved checks find in error, to keep the counts exact. A hook (`checks(id, files) → findings`, merged into the same tally) would remove that second pass.
3. **affordances: `REOPENABLE_FROM` is now held by promotion (R24).** `affordances.mjs` keeps its own copy (`[...DISPOSITIONS]`); when affordances is extracted it should import promotion's, so the refusal and the published act cannot disagree.
4. **legacy-checks: C-2.6's state-history walk relies on the one C-4.2 arm left in `checkStateLegality`** (the "not an object" guard and its `continue`). Removal-only could not take it; whoever next edits the catalogue can move the guard into C-2.6's own shape and drop the arm (then promotion's C-4.2 should say it).
5. **Generated artifacts**: `bio-plane/dist/bio-plane.bundled.mjs` and `newgroup/dist/newgroup.bundled.mjs` embed `store.mjs`, `gate.mjs` and `bio-checks.mjs`; both are stale (regenerate at the layer close, manifest §14).

## Tests and checks run

- `node --test bio-plane/test/m/promotion/` · tests 50, pass 50, fail 0 (on the merged branch @ bd93e821).
- Layer tests: none named in `build/manifest.md`. Modules using promotion: none yet extracted.
- The old battery, both trees, as above.
- `checks/format.mjs` · 63 modules, 27 requirements files; 0 failures.
- `checks/architecture.mjs promotion` · 16 product files, 42 relative imports; 0 failures.
- `checks/coverage.mjs promotion` · 44 of 44 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs promotion tranche/T3` · 19 files; legacy-checks 0 added, 909 removed; legacy-store 37 added, 1226 removed; 0 failures. The `ADDED` lines, for BOB's review:

```
ADDED bio-plane/src/store.mjs:223  /* K31: the one write path, extracted to `promotion`; this store registers its share of every promotion there. */
ADDED bio-plane/src/store.mjs:224  import { promotionOf, stepContext, recordAudit } from "./promotion/index.mjs";
ADDED bio-plane/src/store.mjs:897  /* K31: promotion, which reaches record-core and membership through their factories on this ctx; legacy-store
ADDED bio-plane/src/store.mjs:898  registers its share of every promotion (later modules' checks, projections and facts) until each is extracted. */
ADDED bio-plane/src/store.mjs:899  const promotion = promotionOf(ctx);
ADDED bio-plane/src/store.mjs:900  promotion.registerFact("producingGroup", "legacy-store", () => this.#producingGroup());
ADDED bio-plane/src/store.mjs:901  promotion.registerFact("citedBy", "legacy-store", (id) => this.#retirementCitedBy(id));
ADDED bio-plane/src/store.mjs:902  promotion.registerFact("caseMember", "legacy-store", (id) => !!this.#caseRelationOf(id).member);
ADDED bio-plane/src/store.mjs:903  promotion.registerStep("legacy-store", { check: (c) => this.#promoteChecks(c), project: (c) => this.#promoteProjections(c) });
ADDED bio-plane/src/store.mjs:7895  const r = promotionOf(this.ctx).reopen({ target, reason, viewer, author });
ADDED bio-plane/src/store.mjs:7896  return r.ok ? { ...r, reevaluation: { source: "reopened", since: r.at, raised: this.#reevalRaisedBy(target, viewer) } } : r;
ADDED bio-plane/src/store.mjs:15932  const { clean, withErrors, tally, tallyDetail = {}, offenders, limit: cap, page: ids } = await recordAudit(this.ctx, {
ADDED bio-plane/src/store.mjs:17423  return promotionOf(this.ctx).promote(pkg);
ADDED bio-plane/src/store.mjs:17424  }
ADDED bio-plane/src/store.mjs:17425  
ADDED bio-plane/src/store.mjs:17426  /* K31 (promotion R39): legacy-store's share of every promotion's checks, until each module that owns one is
ADDED bio-plane/src/store.mjs:17427  extracted. Registered with `promotion` in the constructor; a refusal here refuses the whole promotion. */
ADDED bio-plane/src/store.mjs:17428  #promoteChecks(c) {
ADDED bio-plane/src/store.mjs:17429  const { pkg, bundleId, base, meta, author, register, files, promotedType } = stepContext(c);
ADDED bio-plane/src/store.mjs:17430  const cur = this.#one(`SELECT bundle_sha, row_version, object_type, current_state, group_id FROM bundles WHERE bundle_id=?`, bundleId);
ADDED bio-plane/src/store.mjs:18128  }
ADDED bio-plane/src/store.mjs:18130  /* K31 (promotion R39): legacy-store's share of every promotion's projections, run after `record-core.commit`
ADDED bio-plane/src/store.mjs:18131  inside the same transaction. The answer's keys promotion does not already carry are added to its answer. */
ADDED bio-plane/src/store.mjs:18132  #promoteProjections(c) {
ADDED bio-plane/src/store.mjs:18133  const { pkg, bundleId, base, meta, author, register, files, promotedType, promotedState, owner } = stepContext(c);
ADDED bio-plane/src/store.mjs:18134  const cur = c.head, newSha = c.bundleSha, docFmW = c.docFm, isInquiry = promotedType === "inquiry";
ADDED bio-plane/src/store.mjs:18135  const basisFm = isInquiry ? docFmW : null;
ADDED bio-plane/src/store.mjs:18136  const basisLegs = basisFm && Array.isArray(basisFm.basis) ? basisFm.basis.filter((l) => l && typeof l === "object") : [];
ADDED bio-plane/src/store.mjs:18137  const testimony = pkg[TESTIMONY_PATH] || null;
ADDED bio-plane/src/store.mjs:18138  const surfacing = !cur && promotedType === "inquiry" && typeof pkg.assistantPrincipal === "string" && pkg.assistantPrincipal.trim()
ADDED bio-plane/src/store.mjs:18139  ? { run: String(pkg.run).trim(), principal: pkg.assistantPrincipal.trim() } : null;
ADDED bio-plane/src/store.mjs:18140  const migration = (!cur && !surfacing && promotedType === "inquiry" && pkg.migrationReplay && typeof pkg.migrationReplay === "object"
ADDED bio-plane/src/store.mjs:18141  && typeof pkg.migrationReplay.capture === "string" && pkg.migrationReplay.capture)
ADDED bio-plane/src/store.mjs:18142  ? { capture: pkg.migrationReplay.capture,
ADDED bio-plane/src/store.mjs:18143  promotion: typeof pkg.migrationReplay.promotion === "string" ? pkg.migrationReplay.promotion : null }
ADDED bio-plane/src/store.mjs:18144  : null;
ADDED bio-plane/src/store.mjs:33508  return promotionOf(this.ctx).forkProject({ projectId, newId, title, by, viewer, visibility });
```

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_01LPQSJzgT8fbw2kcionFsh3,job,promotion,122426546,644865,539,248021,265,34,1961
```
