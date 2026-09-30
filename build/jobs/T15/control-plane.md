# control-plane (T15)

**Status** · session_01HUfzsqiRFUiyAQ3trjLmav · depth 2 · COMPLETE · handled B4


## Completion

**Entries applied.**
- **N345**, as J1 read it with B4's correction (K516): fifteen routes, each forwarded to its module's store route of the same name.
  - Contradiction's five reads (`contradictioncandidates`, `contradictiontensions`, `contradictionfacts`, `contradictionnotices`, `contradictionresponses`) stamp `viewer`. Each has a `NEEDS` row of `null` on `contradictionpairs`' reasoning (K516).
  - Its six acts (`contradictiondismiss`, `contradictionclarify`, `contradictiontakeup`, `contradictionresolve`, `contradictionoptin`, `contradictionrespond`) are the new `CONTRADICTION_ACTIONS`. They sit in both session sets, need `contribute`, and stamp `viewer` and `author`. `author` is the positional identity (`member:<id>`, `class:<cls>`, `class:ai/<tokenId>`).
  - `contradictionrecommend` joins `AI_RUN_ACTIONS` and `RUN_PRODUCTION_ACTIONS`. It needs `contribute` and stamps `viewer`, `proposedBy` and `principal`, as `contradictionpropose` does.
  - Entities' `resolutiondefect` joins `REGISTRY_ACTIONS` and needs `contribute`. It stamps body `by` by the registry writes' expression, an empty POST body included. `entity` and `entitybyalias` now stamp `viewer`.
  - Case-authoring's `publishtensions` is a read with publish's classes. It stamps `viewer` and `author` by publish's expression and has a `NEEDS` row of `null` (K516).
  - Conformance's `comparisonfacts` joins `CONFORMANCE_READS`, stamps `viewer` and has no `NEEDS` row.
  - R27's tables: `contradictionnotices` and `contradictionresponses` (`project`), `contradictioncandidates` (`project`, `bundle`) and `publishtensions` (`project`) name a project. `contradictionfacts`, `contradictiontensions` and `comparisonfacts` name none, each with its reason.
- **N356**: `ops.mjs`:824 and `index.mjs`:3057, :3069 now say `NOT_AN_ADMIN`. :3057 is the `IDENTITY-CLAIM: ENFORCED-ELSEWHERE` marker.
- **B2 (K514)**: after the tranche merge, `store-class.test.mjs` compares each instance-setup route through the door against `instanceSetupOps(m, url, body)[op]()` called directly. The wrapper arm is gone, and the stack-leak negative control now calls the route outside the frame. The header comment is fixed.

**Deferred.** None. One noted limit: R27's door reads top-level fields only, so `contradictioncandidates`' body form `on: {project}` is not answered at existence by the door (J1 point 4).

**`not yet met` marks my work meets.** None (R24 and R19's last sentence are untouched).

**Check rows.** None added, moved or retired.

**Found in other modules (J2, and since).**
- **affordances** (B3, K516): its lists name none of the fifteen ops yet.
  - Until they do, legacy `test/rung-ladder.test.mjs`:123 (FORWARD) and the two arms after it are red. They name the eight mutating ops as unranked.
  - Its NO UNDER-CLAIM arm names `resolutiondefect`: entities refuses `NO_REASON`, so its rung must be `reasoned`.
  - Legacy `test/affordances.test.mjs`:220 names the fourteen `NEEDS` rows as unpublished (the eight writes and the six null reads).
- **legacy-tests**:
  - `test/identity-claims.test.mjs`:250 pins `["ADMIN_ONLY", "NO_SUCH_MEMBER"]`. It should read `["NOT_AN_ADMIN", "NO_SUCH_MEMBER"]` (N356).
  - `test/gate-reads.test.mjs`:2071 names the seven new read ops as unclassified: the five contradiction reads, `publishtensions` and `comparisonfacts`.
  - Red before this change too (unchanged): `bounds`, `meaning-bounds`, `derivation-bounds`, `fleetbundles` (agent-worker's input list). `civicos-ui/check-refusal-codes.mjs` has the same 23 failures with and without this change.
- **Generated artifact made stale** (§14, reported and not rebuilt): `bio-plane/dist/bio-plane.bundled.mjs` (`fleetbundles`: "STALE BUNDLE — src/control-plane/dispatch.mjs has changed").
- `civicos-ui/` and `affordances.mjs` name none of the added ops or arrays.

**Tests and checks run.**
- `node --test test/m/control-plane/`: tests 57, pass 57, fail 0. The new file is `routes.test.mjs`: 5 tests. A mutation that dropped the contradiction author stamp and the entity viewer stamp turned it red.
- Legacy suites compared against `tranche/T15` without this change. Newly red: `rung-ladder`, `affordances` (both wait on affordances), `identity-claims` and `gate-reads` (both legacy-tests'). Unchanged green: `capability`, `admission-gate`, `aicredential`, `daemon-token`, `d270-refusal-truth`, `d461-pinned-namespace`, `project-sight`, `hygiene`, `check-firing`, `plane-envelope`, `adminvote`, `founder-sight`, `newgroup-bundle-fresh`.
- `format.mjs`: 0 failures. `architecture.mjs control-plane`: 13 product files, 0 failures. `coverage.mjs control-plane`: 35 of 35 live ids, 0 failures. `ownership.mjs control-plane tranche/T15`: 5 files, 0 failures.

Size (session_01HUfzsqiRFUiyAQ3trjLmav): test runs 14, module lines 6277

## J1 · QUESTION

Readings I am building N345's routes on. I carry on with each unless you answer otherwise.

1. **Classes and reach.** All fifteen ops take `["admin", "member", "probe"]`, no `machineClasses`, so an `ai` credential reaches each as a member does (a write only when declared). Mutating: the six contradiction acts, `contradictionrecommend`, `resolutiondefect`. Reads (mutating false): the five contradiction reads, `publishtensions`, `comparisonfacts`.
2. **Session sets and capability.** The six contradiction acts (a new `CONTRADICTION_ACTIONS`) and `resolutiondefect` (joining `REGISTRY_ACTIONS`) go in both session sets; `contradictionrecommend` joins `AI_RUN_ACTIONS` (both sets) and `RUN_PRODUCTION_ACTIONS`, as `contradictionpropose` does. `NEEDS`: `contribute` for those eight (each writes a row in a name). The seven reads get no `NEEDS` row (the `reevaluations` precedent), so affordances need not name them.
3. **Stamps, each in the form the module compares.** Contradiction acts: `viewer`, and `author` as the positional identity (`member:<id>`, the founder's `member:admin`; `class:<cls>`; `class:ai/<tokenId>`), the action layer's `QUERY_AUTHOR_ACTIONS` expression, because contradiction passes it to promotion as `actorIdentity` and asks `memberFacts` of it. `contradictionrecommend`: `viewer`, `proposedBy` and `principal`, `contradictionpropose`'s. `resolutiondefect`: body `by`, the registry writes' expression (the member id or `class:<cls>`; DEC-52, a machine may report and is named). `entity`, `entitybyalias`: `viewer`. `publishtensions`: `viewer` and `author` by `publish`'s expression (the member id or `token:<cls>`), since case-authoring asks `isProjectOwner` of it as for `publish`. `comparisonfacts`: `viewer` (joins `CONFORMANCE_READS`).
4. **R27's tables.** Naming a project: `contradictionnotices` and `contradictionresponses` (`project`: contradiction's own first refusal is the same `existenceAct`, so door and route agree), `contradictioncandidates` (`project`, `bundle`), `publishtensions` (`project`: case-authoring's R2 answers the same existence first). Naming none, with reasons: `contradictionfacts` and `comparisonfacts` (a candidate id), `contradictiontensions` (referents in the body, never a project's own id). The body form `on: {project}` of `contradictioncandidates` is not read by the door (it reads top-level fields only); I note it rather than widen `existenceRead`.
5. **Count.** Twelve contradiction ops, not thirteen (K490), plus `resolutiondefect`, `publishtensions`, `comparisonfacts`: fifteen routes, and `viewer` added to `entity` and `entitybyalias`.

## J2 · REPORT

Early, so the jobs beside me can act while I build (details will be in my record).

1. **affordances** (running now): `unaccounted` (its R12) will name the eight mutating ops I add as `unranked` until each has a rung in `RUNGS` or a stated absence in `RUNG_ABSENT`, and the eight `NEEDS` rows as `unpublished` until each is in `ACTS` or `NON_ACTS`: `contradictiondismiss`, `contradictionclarify`, `contradictiontakeup`, `contradictionresolve`, `contradictionoptin`, `contradictionrespond`, `contradictionrecommend`, `resolutiondefect`. Until then legacy `test/rung-ladder.test.mjs` (its FORWARD arm, section 2, :123) is red on the tranche. I add no `NEEDS` row for the seven reads.
2. **legacy-tests**: N356 changes the `IDENTITY-CLAIM: ENFORCED-ELSEWHERE` marker at `src/control-plane/index.mjs`:3057 from `ADMIN_ONLY` to `NOT_AN_ADMIN`, so `test/identity-claims.test.mjs`:250 (arm (d), pinning `["ADMIN_ONLY", "NO_SUCH_MEMBER"]`) must re-anchor to `["NOT_AN_ADMIN", "NO_SUCH_MEMBER"]`; its :361–364 comment names this change as awaited.

## J3 · COMPLETE

Complete: N345's fifteen routes, NEEDS rows and stamps (as J1 with B4/K516), N356's three comments, B2's store-class re-anchoring after the K514 merge. control-plane 57/57; format, architecture, coverage (35 of 35) and ownership 0 failures. The record's Completion section lists what affordances and legacy-tests now owe (rung-ladder:123, affordances.test:220, identity-claims:250, gate-reads:2071) and the stale bio-plane bundle.
