# Plan: tranche T18

**Status** · DRAFT, TO BE RE-CUT at T17's close to lead with the Action layer (Bob's priority, K608); the catalogue work below goes beside it as sizes allow, the rest to T19. REVIEWED by BOB #74 (K585: §1's preconditions and rulings adopted; K586: the BOB questions answered, BOB-1 adopted, so ✱ moves delete the catalogue's copy in the owner's job). Written by a worker for BOB #74, 2026-09-30, read on `tranche/T17` @ 0f1ed8e012 (layers 1–3 closed, K575, K579, K584; layers 4–11 and legacy-tests still to run). Bob's priority (K572, K578): finish the legacy conversions; T18's main work is starting to empty the old catalogue `bio-plane/checks/bio-checks.mjs` (module `legacy-checks`, 10,659 lines, 170 exports), from `build/extraction/legacy-checks.md` (the map; its §4 is the order). Re-read against T17's close before opening (K424's practice): T17's layers 4+ reports, `awaiting stamp` rows and legacy-tests' reclassed `?` suites fold in then.

Cut from the map, `next.md`'s open entries, rulings K72, K138, K145, K181, K529, K570–K584, `modules.json`, `layers.md` and the requirements of control-plane, skills, agent-worker, promotion and record-core. An `N` entry's text is in `build/plan/next.md`. Catalogue line numbers are the map's (`tranche/T17` after N372); every earlier removal in the tranche shifts them, so a job re-finds each by name.

**Rules at the opening.** T17's rules hold (`current.md`). Added: (1) a move copies a family into its owner, the owner's code and tests read it there, every product importer re-points in its own layer, and the catalogue's copy goes in T19's layer 1 (K529, map §4), unless BOB rules BOB-1 below; (2) a row held twice for one tranche is declared by name in the DEC-49 guard's "HELD TWICE, ACCEPTED BY NAME" list (the C-96.1 precedent, K431) by legacy-tests, and counted in both homes by R50 until the deletion; (3) a job that moves a family names its C-ids `moved, awaiting stamp` (layers 1–2: promotion's stamp this tranche; layers 3+: T19's); (4) `record-grammar`, `legacy-checks`, `record-core` and `membership` merge early (K425): each is a provider a later job of its layer needs.

**Roster by layer** (entries below, by section): L1 record-grammar (new), legacy-checks, text-chain, ocr-worker · L2 record-core, membership, promotion · L3 provenance, capture · L4 content · L5 observation-log, connections · L6 run-productions, ai-runs, capture-requests, skills, agent-worker · L7 reevaluation · L8 ratification, case-authoring, review · L10 monitoring · L11 control-plane, legacy-index · last legacy-tests. 25 jobs (T17: 24).

## 1. Preconditions (map §4.1)

### 1a. The composed catalogue (N245, N272, N337, N403)

What reads the whole namespace today: control-plane's `dec49Row` (`src/control-plane/index.mjs`:789–819: the catalogue, then `MODULE_CHECK_FILES`, 39 module files imported as namespaces at :25–64); agent-worker's R48 call `renderPack(pub.result, CATALOGUE)` (`agent-worker/src/index.mjs`:160, :385), the only production call of `skills.renderPack`/`machineFences`, handed the catalogue alone (so every `MACHINE_CANNOT_*` row that moved, C-96.17 and tasks' `_FORWARD`/`_RESOLVE` among them, is missing: N337, N403); the DEC-49 guard `civicos-ui/check-refusal-codes.mjs` (`CATALOG` at :176, but it already walks every plane source file for `*_CHECKS`, :1970–2003); `bio-plane/scripts/coverage.mjs`:93 and `declared-source.mjs` (the file's text); 19 test files, mostly legacy (map §4.1).

The P4 constraint decides it: agent-worker and skills are layer 6, the families live in layers 1–11 (tasks' fences are layer 11), so no module a layer-6 module may import can hold them all. The layer-6 readers must get the composed fences over the wire, where agent-worker already reads `op=affordances` for R48 (R37 lists it).

| option | pros | cons |
|---|---|---|
| **A. control-plane provides it** (export the composition it already builds; the untargeted `op=affordances` answer gains `fences`) | exists and is tested (R22); control-plane already uses skills and every module; no new module; one owner of "what reaches the wire" | control-plane is 6,603 lines (index.mjs 3,627), past the 4,000 mark (P6): +~60 lines; the list stays hand-kept (needs a totality test) |
| B. new helper module (e.g. `check-catalogue`), layer 11 | small, single-purpose, own tests | "last in the order" is impossible: control-plane (R22) must import it, so it sits before control-plane and cannot hold control-plane's own rows (control-plane appends them); still needs the over-the-wire path for layer 6; a new module for ~60 lines |
| C. runtime registry (`registerFamilies(module, ns)` in record-grammar, each module at start) | fully P4-clean; earlier modules could read it in-process | per-isolate start order; a module that forgets to register is silently absent (the staleness K351 feared); agent-worker is another Worker and never sees it; tests and static readers still walk |

**Recommendation: A.** Entries: control-plane (L11) exports `CHECK_FAMILIES` (the catalogue, every module file, its own `checks.mjs`) and `dec49Row` reads it; a module test walks every `modules.json` path for files exporting a `*_CHECKS` family and fails if one is not in the list (the totality K351 wanted, so the hand-kept list cannot go stale silently); the untargeted `op=affordances` answer carries `fences: skills.machineFences(CHECK_FAMILIES)` (a new control-plane R, the R22 kind of decoration); skills' `renderPack(published)` reads `published.fences` (R1, R3, R7 re-worded: `machineFences` stays pure and is what the plane runs); agent-worker's R48 drops `import * as CATALOGUE` (N157's catalogue share: the member's bundle loses `bio-checks.mjs` as an input, and the manifest's generated-artifacts row changes, BOB's). The guard keeps its walk (it needs no composition); `coverage.mjs` and `declared-source.mjs`: see BOB-5. Until control-plane merges (L11), the tranche branch has `fences` absent; R48 only renders when model turns run (dormant), so nothing live breaks.

### 1b. The `checkBundle` registration seam (N325's pattern)

The N325 seams exist: promotion R39 `registerStep` and record-core R59 `registerAuditCheck` (tasks registers both, `src/tasks/index.mjs`:664, :667). They do not fit a `checkBundle` arm: a promotion step answers one refusal, not findings, so moving C-2.7 or C-2.8 that way changes the gate's findings and composition, and `inquiry/grammar.mjs`:34 (the third `checkBundle` caller) would lose the arm. Proposed instead, one registration serving all three callers with identical findings:

- **legacy-checks** (L1): `checkBundle(input, opts)` takes `opts.grammars`, a list `[{module, ids, arm(ctx, findings)}]` in module order, run at the point the extension arms run today (`bio-checks.mjs` ~4418–4436), over the same `ctx`; a built-in arm whose C-ids a registered grammar claims in `ids` is skipped, so a moved arm never runs twice. Merge early.
- **record-core** (L2): `registerGrammar(module, {ids, arm})` (once at start, R59's refusals: `AUDIT_CHECK_DECLARED`/`_MALFORMED` pattern) and `grammars()`; `auditPass` (`record-core/index.mjs`:871) passes them to `checkBundle` (R18 amended, a new R beside R59). Merge early.
- **promotion** (L2): the gate's `checkBundle` (`gate.mjs`:567) passes `record.grammars()` (R27 amended); inquiry's face (`inquiry/grammar.mjs`:34) re-points in inquiry's own later job.
- **Registrants in T18:** capture's C-2.7 information grammar (L3, below; the seam's first user). Promotion's C-18.6/.7 (`checkInfo2Contract`), inquiry's C-2.8/C-6.1 arms (after basis-versions registers, map §4.2) and the project arms (C-2.9 rest, C-9.1: unowned, wait on N317) register in T19+.

The findings, C-ids and severities are unchanged, so the gate's composition does not change; promotion's stamp records only where the arm now lives.

### 1c. Rulings for BOB (replacing the "stay in legacy-checks" rulings)

- K? · 2026-09-30 · control-plane, skills, agent-worker, legacy-checks (N245, N272, N337, N403) · The composed catalogue is control-plane's `CHECK_FAMILIES` (the catalogue, every module's families, its own), tested for totality against `modules.json`; `dec49Row` reads it; the untargeted `op=affordances` answer carries `fences`, `skills.machineFences` over it; `renderPack` reads `published.fences`; agent-worker imports no catalogue · the layer-6 readers cannot import a composition that includes layer-11 fences (P4), and agent-worker already reads `op=affordances` · P4, P17.
- K? · 2026-09-30 · legacy-checks, record-core, promotion (map §4.1 (2)) · `checkBundle` runs registered grammars (`opts.grammars`, record-core's `registerGrammar`/`grammars()`, passed by the audit and the gate), skipping a built-in arm whose ids a grammar claims; a type grammar leaves the catalogue by registering there, never as a promotion step · one registration, identical findings at gate and audit, no composition change · P4, P17, K578.
- K? · 2026-09-30 · provenance, capture (replaces K72 (1), (4), (5)) · Provenance's families (C-24, C-34, C-53.1–.9/.13 with `TESTIMONY_CHECKS` whole, C-89, C-103) and capture's (C-83, C-85, then C-48.1–.7, C-28.13) move to their modules' own tables, each with its test (K6); C-18.6/.7 (`checkInfo2Contract`) goes to promotion as a registered grammar; K72's "stay in legacy-checks, read as today" is withdrawn · a row table has no caller inside the catalogue, and a `checkBundle` arm now leaves by registering · P4, P17.
- K? · 2026-09-30 · capture (map §4.1 (3)) · C-2.7, the information grammar (`checkInformationExtension`, `INFO_ENUMS`, `CONTENT_HASH_RE`, `MONITOR_FREQ`), is capture's, registered through record-core's grammar seam; monitoring reads `MONITOR_FREQ` from capture · capture writes information bundles and is the earliest module that owns their intake · P17.
- K? · 2026-09-30 · content, text-chain (replaces K138) · C-52 and C-80.3 move to content now; the extent algebra (`canonicalExtent`, `describeExtent`, ranges, A1) moves to text-chain and C-45 with the extent core to content in the tranche the catalogue's last internal caller (the inquiry grammar, through `legExtent`/`checkContentExtent`) leaves; `content/extent.mjs` stays their one face · the order reason is gone once the caller registers; until then a copy would be held twice for several tranches · P4, P17.
- K? · 2026-09-30 · connections (replaces K145) · C-74 moves to connections now; C-49, C-81, `THEME_ID_RE` and `themeLegFindings` move when the inquiry grammar (their caller, via `themeLegFindings`) and content's `refusal` helper have left, connections taking its own `refusal` · as K138's replacement · P4, P17.
- K? · 2026-09-30 · inquiry (replaces K181 (1), its first clause only) · Inquiry's C-2.8 grammar, C-6.1, C-15.1, C-54.1, C-66.5 and its rows move to inquiry, registered through record-core's grammar seam, after basis-versions has registered its version grammar (`checkInquiryBasis` calls `basisVersionFindings`); `inquiry/grammar.mjs` stays the face; the rest of K181 (1) stands · the seam removes the order reason · P4, P17.
- K? · 2026-09-30 · record-grammar (§2 below) · The helper module `record-grammar` is formed in T18 at the head of the order, before `legacy-checks`, which uses it; the shared core leaves the catalogue in stages, each part moved whole by record-grammar's job with the catalogue re-exporting it (§12.2), importers re-pointing at their next job · K578 · P4, P17.

## 2. The helper module `record-grammar`

Proposed `modules.json` entry, first in `modules` (and `legacy-checks` gains `"uses": ["record-grammar"]`):

`{"id": "record-grammar", "layer": 1, "from": "legacy-checks", "paths": ["bio-plane/src/record-grammar/"], "tests": ["bio-plane/test/m/record-grammar/"], "uses": []}`

`layers.md` then reads "record-grammar, legacy-checks, jurisdictions, …" for layer 1 and "legacy-checks … is first in the order" becomes "second, after record-grammar"; "Helper modules" gains its line (K578).

**Formed when.** The map forms it last, by renaming what is left. **Recommendation: form it in T18, ahead of the catalogue.** Being earlier than the catalogue is what makes the difference: the catalogue may import it, so each shared part moves once and whole (the record-grammar job removes it from the catalogue and leaves a re-export, the §12.2 exception), with no copy held twice, no one-tranche lag and no importer broken; importers re-point at leisure and the last re-export goes when nobody reads it. By rename, the 2,063 shared lines stay in the legacy module until the last owner has left, and the rename re-points ~45 modules in one tranche. Cost: a new requirements file before the job (P18: a BOB worker drafts it from the moved code), and the order change above.

**T18's stage (the leaves: nothing in them calls the rest of the catalogue), ~640 lines:** the id grammar (`BUNDLE_ID_RE`, `ANN_ID_RE`, `FILENAME_RE`, `ISO_TS_RE`, 1–31); the type vocabulary (`OBJECT_TYPES`, `LEGACY_TYPE_ALIASES`, `normalizeType`, 33–51); `canonicalJson` (1294–1305); the actor identity block (`NON_MEMBER_AUTHORS` … `isMachineIdentity`, 1429–1517); the grade vocabulary (`BASIS_ROLES` … `UNREACHABLE_CAPTURE_GRADE`, 2428–2584); `isPublicHttpsLocator` (3976–4001); the digests (`b64ToBytes`, `createSha256`, `SHA256_K`, `sha256HexSync`, 4018–4129, 10548–10634), consolidated to one SHA-256 behind both names with a parity test over known vectors (map §4.4, K6); `parseFrontmatter` with `f`, `stripComment`, `parseScalar`, `asText` (788–974). **T19:** `STATES`, `HEADINGS`, `HEADINGS_WHEN`, `CORE_FIELDS`, `FORBIDDEN_ALIASES`, `vocabFor`, `sectionText`, the machine-work labels (`CONTENT_MINTED_BY_PLANE` …, `LAW_PROPOSAL_STATES` … `proposalLabel`), `isCaseMemberBytes`, C-33.40/.41. **Last:** `checkBundle` and its structural arms, once every type grammar has registered.

BOB: `text-chain` and `ocr-worker` (layer 1) read `isMachineIdentity`, `BASIS_GRADES`, `EARNED_CAPTURE_CEILING` through the catalogue until they re-point; confirm the ocr-worker and agent-worker bundles take record-grammar's files as inputs at regeneration (the manifest's generated-artifacts rows).

## 3. The first owners' moves, by layer

Each move: the owner adds the family to its own table (the file control-plane already reads, else a new `checks.mjs` that control-plane adds to `CHECK_FAMILIES` in L11), its refusals and tests read it there, its requirement's "until they move" clause is re-worded as met, it rewires `legacy-store`'s imports to itself (§12.2), and names the C-ids `moved, awaiting stamp`. Product importers re-point in their own entries below. The catalogue's copy is deleted in T19's layer 1 (or in the owner's job, BOB-1: marked ✱ where no product importer but the owner remains).

### Layer 1

- **record-grammar** (new; K? formation) · §2's T18 stage: the leaves moved whole, the catalogue re-exporting each; requirements drafted before the job; tests at its interface (the parser, the id and type grammar, identity, grades, digest parity). First in the layer, merged early.
- **legacy-checks** · (1) §1b's seam: `opts.grammars` in `checkBundle`, the claim-skip, tested with a registered stub arm (no requirements file: the legacy module's own tests, P7, until `checkBundle` reaches record-grammar). Merge early for record-core. (2) Delete the dead with no importer anywhere: `LAW_LEVELS` (602–613), `CASE_MEMBER_ROLES` (2415–2426) (map §3). (3) `contentIdFor` (10636–10659) if T17's legacy-tests left none of its 7 legacy importers, else T19. (4) The job confirms no importer before each deletion (whole repository, bundles' inputs) and reports the T19 deletion list back against this plan.
- **text-chain** · ✱ C-35 `TEXT_CHAIN_CHECKS` (7127–7279, 153 lines) into `textchain.mjs`; `text-chain.md`:20 ("read from `legacy-checks`' `TEXT_CHAIN_CHECKS`") re-worded; importers: text-chain alone (and two legacy suites). The extent algebra waits (K138's replacement).

### Layer 2

- **record-core** · N406 (K598): `afterCommit(fn)`, a new R beside R32 (run now outside a transaction; just after the outermost commit inside one; dropped on rollback, the savepoint's included). Merge early for reevaluation's share (layer 7).
- **record-core** · (1) §1b's seam: `registerGrammar`/`grammars()`, `auditPass` passing them (a new R beside R59; R18 amended). Merge early for promotion. (2) ✱ C-75 `PER_ITEM_CHECKS` (10176–10223) into `record-core/checks.mjs`: R55 met; importers: record-core alone. (3) C-59.5 (`PROJECT_ID_CHECKS` row, 9310–9354) and C-102.1–.3 (`REGISTRATION_CHECKS` rows, 10225–10330) copied into its table (R27; the note at `record-core.md`:252 re-worded); the split tables leave when promotion and ratification hold theirs (T19).
- **membership** · Its eight families (≈480 lines: `AI_CREDENTIAL_CHECKS` 6511–6626, `MEMBER_ID_CHECKS` 8932–8953, `SIGNER_ENROLMENT_CHECKS` 8955–8991, `CUSTODIAL_CHECKS` 8993–9098, `PROJECT_AUTHORITY_CHECKS` 9100–9125, `PROJECT_VISIBILITY_CHECKS` 9127–9163, `PROJECT_JOIN_REQUEST_CHECKS` 9165–9228, `CASE_AUTHORITY_CHECKS` 9255–9278) and C-33.28/.48 into `membership/checks.mjs`, family names kept (the guard's and `dec49Row`'s suffix harvest); Uses (`membership.md`:149) re-worded; `legacy-store`'s imports (`store.mjs`:375–381) rewired. Merge early for promotion. Importers re-pointing: promotion (L2), case-authoring and review tests (L8).
- **promotion** · (1) §1b: the gate passes `record.grammars()` (R27). (2) ✱ The tables it alone imports: `PROMOTED_TYPE_CHECKS` C-86 (10483–10544), `PROJECT_CREATION_VISIBILITY_CHECKS` C-97 (9230–9253), `MECHANICAL_FIELD_SETS` (4202–4225), `withProducingGroup` (9408–9425), `projectNameKey` with `checkProjectNameUniqueness` C-77 (4226–4323; no product caller: moved as carried, K6, BOB-4); Uses (`promotion.md`:119) re-worded. (3) Re-point `CUSTODIAL_CHECKS` and `PROJECT_VISIBILITY_CHECKS` to membership. (4) **The stamp, last (K425):** every row change since 1.47.0: T17's layers 3+ `awaiting stamp` (N382's new tasks code for `NOT_YOURS`; N383's two case-authoring `where`s; whatever N396–N399 add; capture none, K580); T17's legacy-tests; T18's layers 1–2 (C-35 in text-chain; C-75, C-59.5, C-102.1–.3 in record-core; membership's families and C-33.28/.48; promotion's own; each a second home until T19 unless BOB-1). `ROW_CENSUS` re-pinned. Rows moved at T18's layers 3+ are T19's stamp. Split-table rows (C-26.12, C-64.1, C-59.1–.4, C-102.4–.9, C-33.21/.24/.38/.49, C-67.1, C-32.5), C-18.6/.7 and `CHECK_RETIREMENTS` wait for T19 (sizing).

### Layer 3

- **provenance** · ✱ C-24 `VERSION_CHAIN_CHECKS` (4765–4822), C-34 `ROUTE_MARK_CHECKS` (7055–7125), C-89 `ATTEST_CHECKS` (7612–7633), C-103 `PROVENANCE_ACT_CHECKS` (7635–7695), C-53 `TESTIMONY_CHECKS` whole (8755–8894), ≈352 lines, into `provenance/checks.mjs` (K?, replacing K72 (5)); "Checks carried here" (`provenance.md`:159) met, Uses (:122) re-worded; `store.mjs`:331 and the rest rewired. Importers: provenance and legacy-store only. K582's share: drop the comments naming `migrate/` as replay's sender.
- **capture** · (1) ✱ C-85 `KNOCK_CHECKS` (7468–7610) into `capture/checks.mjs`; R47–R52's "read from the catalogue at the refusal" re-worded to this module's table. (2) C-83 `RENDER_CAPTURE_CHECKS` (7360–7464); capture-requests re-points (L6). (3) C-2.7 (K?): `checkInformationExtension` (1319–1378) with `INFO_ENUMS`, `CONTENT_HASH_RE`, `MONITOR_FREQ` (1311–1316), registered through record-core's grammar seam with `ids: ["C-2.7"]` (the seam's first registrant; tested at gate and audit with identical findings); monitoring re-points `MONITOR_FREQ` (L10). R37 re-worded. C-48.1–.7, C-28.13 and the user agent wait (split tables; four importers).

### Layer 4

- **content** · ✱ C-52 `TRANSCRIBE_CHECKS` (8672–8753) and C-80 `VERSION_NOTICE_CHECKS` (9358–9383) into content's table (in `extent.mjs`, which control-plane reads, or a new `checks.mjs`); R38 met for C-52, C-80.3 (C-45 stays, K138's replacement). `store.mjs`:370 rewired. Reevaluation's test re-points (L7).

### Layer 5

- **observation-log** · C-22 from `AI_RUN_CHECKS` (4453–4763, 311 lines) into `observation-log/checks.mjs` (R26 met); ai-runs re-points (L6), skills keeps reading it through `airun.mjs`. BOB-2 (whole family or R26's split). `LEAD_ID_RE` waits (the inquiry grammar's `LEAD_CHECKS`/`leadLegFindings` use it). N242's share: `AI_LOG_NEVER_LOOKED_STORED`'s mint site, if the guard still prints it.
- **connections** · ✱ C-74 `CONNECTION_CHOICE_CHECKS` (10431–10481) into its table (K?, replacing K145); R35 met for C-74. N242's share: `THEME_CHECKS`' duplicate C-81.11–.14, if the guard still prints it.

### Layer 6

- **run-productions** · N155's ready share: ✱ `SUGGEST_LEVELS` (5797–5800) and `EXTRACT_PROPOSE_CHECKS` C-104 (6055–6155) into `run-productions/checks.mjs` (today re-exported from the catalogue, :17); no catalogue caller. `SUGGEST_CHECKS` waits for basis-versions (C-27.15, `basisVersionFindings` reads it). Merge early for agent-worker's test re-point.
- **ai-runs** · Re-point `AI_RUN_CHECKS` to observation-log (`airun.mjs`), its re-export for skills kept.
- **capture-requests** · Re-point `RENDER_CAPTURE_CHECKS` to capture.

### Layer 7

- **reevaluation** · N406 (K598; replaces N378): `raise` hands R8's listener calls to record-core's `afterCommit`, writing `listeners_failed` onto its answer; tested with a rolled-back caller and a nested savepoint rolled back under a committing outer.
- **reevaluation** · Re-point its test's `VERSION_NOTICE_CHECKS` to content.

### Layer 8

- **case-authoring** · Re-point its tests' `PROJECT_VISIBILITY_CHECKS` to membership; C-33.14 and C-32.6 (≈15 lines of `ACT_SHAPE_CHECKS`, `MACHINE_FENCE_CHECKS`) into its table; N242's share (`publishCase` `where`s, `NO_STATEMENT`, `MACHINE_CANNOT_PUBLISH` naming `store.mjs`) as the guard prints it after N383.
- **review** · Re-point its tests' `PROJECT_VISIBILITY_CHECKS` to membership.
- **ratification** · C-102.10 (`REGISTRATION_CHECKS` row) into its table (with N400, §4).

### Layer 10

- **monitoring** · Re-point `MONITOR_FREQ` to capture.

### Layer 11

- **control-plane** · §1a (K?): `CHECK_FAMILIES` exported and read by `dec49Row`, gaining text-chain's `textchain.mjs` and any new `checks.mjs` T18 opens; the totality test; the untargeted `op=affordances` answer's `fences` (a new R; N245, N337, N403 met with skills and agent-worker; N272 met: R22's reader covers every module's rows). Also §4's N402 pins and K582's comments.

### The §4.4 wording fixes (BOB's, before the jobs that touch them; no job entries)

- bias R29 claims C-26.1–.19, but C-26.12 is raised only at promotion's write (R15): R29 names C-26.1–.11, .13–.19.
- monitoring R42 and `monitoring.md`:134 disagree on C-48.8/.9: R42 (they move to monitoring) stands, :134 struck.
- control-plane R32 adds C-61.1 and C-68.1, both raised by its code.
- `INSTANCE_GROUP_CHECKS` C-64.1's `where` names `inquiry #groupUndetermined`; promotion R13 and instance-setup R30 make it promotion's: re-pointed when promotion takes the row (T19).
- extraction's and sources' Uses name `requiredArgument` as a legacy-checks export: it is `src/index.mjs`'s (legacy-index).
- K6: the two SHA-256 implementations become one (record-grammar's T18 entry).

### Other ready `next.md` entries

Carried: N155 (its ready share, run-productions); N157 (the catalogue share, agent-worker, with §1a); N211 (ratification, §4); N242 (the shares of observation-log, connections, case-authoring, each confirmed against the guard's print); N245, N272, N337, N403 (§1a); N400–N402 (§4). Left: everything under "Not in T18" (§6).

### T19's layer 1, prepared now

legacy-checks deletes every copy T18's owners took (unless deleted in the job, BOB-1) once the re-points above have merged: C-35, C-75, membership's eight families, C-86, C-97, `MECHANICAL_FIELD_SETS`, `withProducingGroup`, `projectNameKey`, C-77, provenance's five families, C-85, C-83, C-2.7 with its helpers, C-52, C-80, C-22, C-74, `SUGGEST_LEVELS`, C-104, `SUBJECT_POSITIONS`, `caseEditionClaimed`; the rows C-59.5, C-102.1–.3/.10, C-33.14/.28/.48, C-32.6, C-32.1, C-33.10–.12 out of their split tables; the guard's accepted-by-name pairs retire with them.

## 4. N400–N403

- **ratification** (L8) · N400 (K583): extract `Store.release` (`store.mjs` 1004–1202) and `RELEASE_ACK_MAX` (:845) into ratification, `store.mjs`'s op map rewired to it (§12.2); requirements proposed by the job (a QUESTION) from `release.test.mjs` and Intake Doctrine §4, §4a (crucial never batched, all or none, acknowledgment and mitigation), worded by BOB; rows C-32.1 `MACHINE_CANNOT_RELEASE` and C-33.10–.12 into its table (`awaiting stamp`, T19); `release.test.mjs` converted to module tests, then retired by legacy-tests. N211's share: re-point its parity test's `SUBJECT_POSITIONS` and `caseEditionClaimed` to its own and rewire `store.mjs`'s `SUBJECT_POSITIONS` import; the catalogue's go in T19 (N211 closes). BOB: whether control-plane's `dispatch.mjs` must route `release`/`selectionrelease` to ratification's ops (as N379 did for sources) or `store.mjs`'s map suffices.
- **legacy-index** (L11) · N401 (K582): delete `bio-plane/migrate/` (`migrate.mjs` 609, `local-plane.mjs` 12, `README.md` 74) and `package.json`'s `test:migrate`; BOB drops `bio-plane/migrate/README.md` from `not_product` and `bio-plane/migrate/` from legacy-index's `paths`. Provenance and control-plane drop the comments naming it (their entries). The server's `replay` admission (C-66.6) stays.
- **agent-worker** (L6) · N402 (K575): its four suites' 14 source-parse arms (`agent-worker.test.mjs` 5, `fanout` 3, `harness` 4, `versions` 2) stop parsing the plane's OPS table and namespaces from source; it exports its `PLANE_OPS` and namespaces (R37) and control-plane pins them (below). With §1a: R48 renders `renderPack(pub.result)` from the published `fences` and imports no catalogue (N157's share, N403); its test pins of `SUGGEST_LEVELS` re-point to run-productions.
- **ocr-worker** (L1) · N402's share: R16's two arms likewise; it exports the op set it calls.
- **control-plane** (L11) · N402's share: a module test that every op agent-worker and ocr-worker export is in `OPS` with the class and namespace gate they assume (P7: the interface, from the later module, which may import both).
- **skills** (L6) · N403 with N245 and N337 (§1a): `renderPack` reads `published.fences` (R1, R3, R7 re-worded); the one production call site (agent-worker:385) is re-pointed by agent-worker; `machinefences-dec49` ARM A4 and `skillsequencing` go green or retire with legacy-tests.

## 5. Conversion entries (K572, K573; `legacy-inventory.tsv`)

The inventory's `convert`/`convert?` rows number 93: 78 are legacy-ui's (`civicos-ui/test/`, no requirements: release-only, `civicos-ui/test/release/`, retired with the old app, K5, K573) and 15 are N390–N401. T17 carries N390–N399. Not carried by T17, both with a clear owner, both above:
- **ratification** · convert `release.test.mjs` (257) to requirement-named module tests of the release requirements N400 proposes.
- **legacy-tests** · retire `migrate.test.mjs` (336) with `migrate/` (K582; no conversion).
- **Pending T17's close:** of the 160 `covered?`/`dead?`/`system?` rows T17's legacy-tests confirms, each it reports as `convert` gets an N-number at T17's close and joins its owner's T18 entry then.
- **legacy-tests** (last) · delete `release.test.mjs` once ratification's conversion merges and `migrate.test.mjs` (K582); the guard's accepted-by-name pairs for every family held twice (§3); its floors, the d470 census and R50's suite re-pinned over T18's stamp; changed-files scope only (K570). N402's suites are module tests, not the inventory's.

Remainder not carried: 78 (legacy-ui, release-only) plus the 49 `system` suites (layer tests or the release regression, K573).

## 6. Not in T18

**Bob's first:** N317 (with it the unowned project arms C-2.9's rest and C-9.1: they stay until he rules whether they retire), N303's remainder, N320; N61; N71; N144, N232, N241, N371, N389 (UX).

**Needs a deployment or measurement no job can make:** contradiction R41, the K5 gate arm and R24/R27/R32/R33's K5 arms and R34 (K488, K490); DIST-14, N75; N34; N22.

**To word before a job runs:** N336 (installer R20, DIST-15).

**Waiting on another module or tranche:** N13, N21, N26, N31, N68, N70, N136, N137, N157's remainder (skills' render-only face), N249's other clauses, N242's other owners' shares, REC-201 (`cpra_request`, with actions' C-94 move); N175 is the process repo's. N57, N248, N279: BOB-6.

**The catalogue's later moves (T19+, map §4.3):** record-grammar's second and last stages; the extent algebra (text-chain) with C-45 and the extent core (content), connections' C-49/C-81, observation-log's `LEAD_ID_RE`, all after the inquiry grammar registers; basis-versions (C-25, C-50, C-27.15, C-33.1/.2/.33–.37, C-32.2, version, sufficiency and boilerplate helpers) then inquiry (C-2.8, C-6.1, C-15.1, C-54.1, C-66.5, C-33.13/.22/.23, C-32.7/.8; promotion's title call first, map §4.2); promotion's split-table rows, C-18.6/.7 and `CHECK_RETIREMENTS`; capture's C-48.1–.7, C-28.13 and the user agent; capture-requests' C-28 and conduct; run-productions' C-27; entities' C-33.25; strength's `STRENGTH_STATES`; actions' C-2.10, C-94 and vocabularies; monitoring's C-48.8/.9; control-plane's C-61.1, C-68.1; then legacy-store's, legacy-index's and legacy-tests' last imports, and the file retires.

## 7. Sizing (P6: one job, one session)

| module | lines moved or written | note |
|---|---|---|
| record-grammar | ~640 moved + requirements (drafted before) + tests | largest L1 job; mechanical; the digest consolidation is the one risk |
| legacy-checks | ~60 written, ~50 deleted | |
| text-chain | 153 | |
| ocr-worker | 2 arms | |
| record-core | ~60 seam + 48 + ~20 rows | |
| membership | ~480 + store rewire | medium; one family file |
| promotion | ~260 moved + seam + re-points + the stamp | **flag**: a stamp alone has been a whole job (PROMOTION #18); if BOB-1 is no, the stamp doubles its arrivals. Split proposed: T18 the seam, the re-points, C-86/C-97/`MECHANICAL_FIELD_SETS`/`withProducingGroup` and the stamp; C-77 with `projectNameKey` to T19 if the job reports it near its limit |
| provenance | ~352 | |
| capture | ~330 + a registration | |
| content | ~108 | |
| observation-log | ~311 | |
| connections | ~51 | |
| run-productions | ~105 | |
| ai-runs, capture-requests, reevaluation, review, monitoring | one import each | five re-point-only jobs (BOB-3) |
| skills | ~30 + wording | |
| agent-worker | ~80 + 14 test arms | |
| case-authoring | ~15 + re-points + N242 | |
| ratification | ~200 code + requirements + ~257 test lines converted | **flag**: medium-large; if long, the C-102.10 row and N211 go to T19 |
| control-plane | ~60 + totality test + `fences` + N402 pins | module already past 4,000 lines (P6 report) |
| legacy-index | 695 deleted | |
| legacy-tests | deletions + re-pins | changed-files scope (K570) |

**BOB questions**
- BOB-1: PROCESS-MECHANICS §12.2 lets a target module's job remove its moved code from the catalogue when nothing but itself and legacy modules imports it. For the ✱ moves (C-35, C-75, C-86, C-97, `MECHANICAL_FIELD_SETS`, `withProducingGroup`, C-77, provenance's five, C-85, C-52, C-80, C-74, `SUGGEST_LEVELS`, C-104) that would delete in the same job: no row held twice, no guard exemption, half the stamp traffic. K529's one-tranche lag was for a product importer (promotion). Adopt it for ✱ moves?
- BOB-2: `AI_RUN_CHECKS`: does it move whole to observation-log (the map: every `where` names observation-log), or split as observation-log R26 says (C-22.1–.4/.6/.9/.10/.17 there, the rest to ai-runs)?
- BOB-3: five jobs only re-point one import each. Keep them in T18 (so T19 can delete), or defer them to each module's next real job and let those deletions slip a tranche?
- BOB-4: C-77 `checkProjectNameUniqueness` has no product caller (only `d50-project-names`): does promotion run it at the write, or does a ruling retire C-77's catalogue arm (K6)?
- BOB-5: `scripts/coverage.mjs` and `declared-source.mjs` read the catalogue's text; re-point them to `CHECK_FAMILIES`, or retire them with `owed-controls` (N70; K100: the process's coverage check governs)? I lean to retire.
- BOB-6: N57, N248, N279 (controls sweeps) look superseded by K573's inventory (every control classed); close them, or carry to legacy-tests?
- BOB-7: control-plane's untargeted `op=affordances` answer gaining `fences` touches affordances R17's shape; is it control-plane's decoration (proposed) or an affordances R17 amendment?
