# control-plane — extraction map

**Status** · Re-measured 2026-09-28 on `tranche/T10` @ `6faa8084` by a worker for BOB #59 (P18) (`index.mjs` 7,041 lines, `store.mjs` 7,302, `checks/bio-checks.mjs` 12,315). Originally measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`index.mjs` 13,438 lines, 4,909 of code; `store.mjs` 49,817; `bio-checks.mjs` 15,682) by a drafting worker for BOB #43 (P18); the T3 line ranges are kept in brackets. The contract is `build/requirements/control-plane.md` (R1–R33). K3, K23, K53, K61, K93, K98, K102 and N53 apply, with the placements in the other drafted maps. `from` reads `["legacy-index", "legacy-store", "legacy-checks"]` (modules.json). Counts are raw and, in brackets, without comment-only and blank lines.

**Since T3.** `index.mjs` has lost about 6,400 lines to the modules that took their handlers: `capture` (`capture/ops.mjs`, `capture/doorbell.mjs` with the knock, `capture/acquire.mjs` with `userAgent` and `archiveSelect`), `extraction` (`extraction/ops.mjs`, `extraction/pipeline.mjs` with the reading tiers), `monitoring` (`monitorOp`), `publication` (`publication/worker.mjs` with `assembleCaseContainer`, `publishedRoutes` and the published-store rows), `ratification` (`ratification/ops.mjs`), `host-governor` (`governorOp`, `governedFetch`), `provenance` (`registerAuditReport`, `attest`). What is left in `index.mjs` is almost all this module's, plus the arms of the layer-11 modules not yet extracted and a few layer-3–5 arms still inline.

## 1. What moves to `control-plane`

| what | where today | lines (T3) | notes |
| --- | --- | --- | --- |
| the file header (the credential classes) and `OPS` (every op's spec) | index | 153–1582 (419–1670) | 1,430 (308). R2, R11, R31. The rows' long comments are the ops' histories: the job keeps each row's reason in one line |
| the act lists (`RETRIEVAL_READS` … `PROGRESSION_ACTIONS`, now also `INTENT_*`, `REEVALUATION_ACTIONS`, the layer-9 lists) | index | 1583–2022 (1671–2063) | 440 (61); they drive the stamps (R17) and the fences (R14) |
| `SESSION_OPS`, `NEEDS` | index | 2023–2870 (2064–2829) | 848 (254); R10, R13 |
| `decorateAct`, `ACT_GATE` with their comment | index | 2872–2884 (new row) | 13 (5). The act gate `affordances.decorate(act, gate)` reads (N177); `op=affordances` and `op=queue` both pass it. **No control-plane requirement names it** (§5.6) |
| `SCRATCH`, `PUBLISHED_STORE`, `fingerprint`, `sha256Hex` | index | 2885–2907 (2946–2972) | 23 (11) |
| the DAEMON-class header, `classify`, `scopeFor`, `NAMESPACES`, `namespaceGate`, `SCRATCH_ADDRESSING_PUBLIC_OPS`, `pinnedNamespaceGate`, `confinedNamespaceGate`, `aiCredentialPresented`, `aiConfinementDeclaration`, `AI_TOKEN_SHAPE`, `aiReachesAsMember`, `aiScopeDeclaration`, `aiTaskScope` | index | 2908–3343 (3137–3663) | 436 (133); R3–R8, R12, R19 |
| `resolveSession`, `reviewAnswer`, `caseReader` with their headers | index | 3344–3513 (3664–3758) | 170 (54); `reviewAnswer` per the review map; it calls `publication`'s `inbandQuartet` (import at 71) |
| `json`, `DEC49_ROWS`, `dec49Row`, `dec49Decorate`, `dec49Attach`, the REC-52 header, `STORE_SILENT_*`, `doAnswer`, `storeSilent` | index | 3538–3748 (3768–3962, 4020–4041) | 211 (56); R21–R23. `storeSilent` now sits beside `doAnswer` |
| the row readers: `admissionRow`, `requiredArgumentRow`, `namespaceRow`, `installationRow`, `dispatchRow`, `identityFenceRow`, `machineFenceRow`, `replayRow` | index | 3793–3877 (4105–4230) | 85 (56). `requiredArgumentRow` goes to the earliest raiser of C-61.1 (§2); `reextractRow` (3807) is extraction's. `machineFenceRow` (C-32.17's use) and `replayRow` (C-66.6) come here |
| the unattended-decision header, `UNATTENDED_BY_DECISION`, `sessionOpGate`, `requiredArgument` | index | 3879–4114 (4231–4466) | 236 (71); R10. `requiredArgument` (4102–4114) is C-61.1's raiser and goes with its row (§2) |
| `StoreSilent` with its comment | index | 4130–4138 (4538–4540) | 9 (3) |
| `migrationReplayOf`, `DRIVE_PROVENANCE_PATH` with the REC-173 header | index | 4147–4190 (4597–4631) | 44 (26); R16 (C-66.6, as the ai-runs map placed it) |
| `fetch`: `OPTIONS`, `/version`, `/sign`, `/` (calls `instance-setup`'s `setupPage` and public read), op resolution, `UNKNOWN_OP`, the namespace gates, the public block's frame | index | 4195–4298 (6073–6176) | 104 (37); R1–R5 |
| `claim`'s bootstrap-credential checks (`is-bootstrap-claim`) | index | 4299–4316 (6177–6194) | 18 (14); R15. The call to `membership.claim` stays with it |
| the review door: the review copy's read and comment, `statementack`'s two doors, the grant-secret reader | index | 4522–4567 (6400–6445) | 46; R20 (review map) |
| authentication and admission (`is-admission` 4635–4787, the `export` refusal 4763), `whoami` | index | 4596–4835 (6849–7093) | 240 (77); R7–R13, R18 |
| the forward: the store stub, `DO_PATH`, the inner request, the viewer, identity, author and `by` stamps, the operator and identity fences (6170–6172), the body scrubs of `promote` and the other body-carrying acts, `aicredentialmint`/`aicredentialrevoke` (6933–6980: the value's generation, R19), the review grant secret (6946), the final forward | index | 5291–7041 (11860–13438) | 1,751 (475) at most; R14, R16, R17, R19, R21. The op-specific arms inside it leave with their modules |
| `Store.fetch`'s frame: body parse, `BAD_JSON`, the route map's frame, `unknown op`, `#existenceRead`'s call, `{ok, result}`, the catch | store | 6901–6933, 7285–7297 (48479–48509, 49799–49811) | 46 (29); R25, R26. The route entries leave with their modules (the `membershipOps` pattern; 31 module maps are already spread into it) |
| `PROJECT_NAMING_READS`, `PROJECT_NAMING_READS_NOT`, `#existenceRead` with the REC-196 header | store | 5986–6067 (33195–33258) | 82 (55); R27 (membership map §3.6: "stays with the dispatcher") |
| `ADMISSION_CHECKS` (C-38.1–.8) and header | bio-checks | 7925–8108 (10420–10604) | 184 (59); R32 |
| `NAMESPACE_CHECKS` (C-78.1–.3) with header, `DISPATCH_CHECKS` (C-69.1–.2) with header | bio-checks | 8319–8369, 8370–8399 (10841–10874, 10877–10904) | 81 (38); R32 |
| `INSTALLATION_CHECKS` C-68.2–.4 | bio-checks | 8192–8210 (10683–10700) | 19 (19); R32. C-68.1 (8184–8191) goes elsewhere (§2) |
| `AI_CREDENTIAL_CHECKS` C-29.6–.10 | bio-checks | 7001–7065 (8668–8730) | 65 (37); R32. C-29.1–.5 (6928–7000) and the new C-29.11, C-29.12 (7066–7086, `where` membership's `aiCredentialMint`) stay with the credential's store routes (§2) |
| `OPERATOR_TOKEN_CANNOT_GOVERN` (C-32.17) with its comment | bio-checks | 7345–7368 (9360–9382) | 24 (9); R32. `MACHINE_FENCE_CHECKS` is split by the first job to move |
| `GROUP_IDENTITY_NEEDS_SESSION` (C-64.4) with its comment | bio-checks | 11014–11023 (14116–14126) | 10 (8); R32 (K69's cluster, split: instance-setup map §2) |
| `REPLAY_UNVERIFIED` (C-66.6) with its comment | bio-checks | 10879–10898 (13717–13736) | 20 (8); R32 (ai-runs map) |

**Rows marked:** none of the T3 rows lost its requirement. `storeSilent` and the row readers were separate T3 rows and are merged above because they now sit together.

**N53 (added).** The skills tests that read `index.mjs` by source move into this module's tests as its code moves: `bio-plane/test/skillpack.test.mjs` (59 `IDX`; arm A10 pins the published token to `decorateAct`, 276), `skillpack.control.mjs` and `skillsequencing.test.mjs` (99 `IDX`). The four suites N53 retired (`skilldoctrine`, `skillprohibitions`, test and control) are deleted (K215). Skills' own tests (`bio-plane/test/m/skills/`) no longer read `index.mjs`.

**Measured size (T10):** `index.mjs` about 6,100 (1,670), of which the forward is 1,751 (475) at most and the rest 4,353 (1,193); `bio-checks.mjs` 403 (178); `store.mjs` 128 (84). About **6,630 lines, about 1,930 of code** at most (T3: about 5,990, 1,610). Without the forward's op-specific arms, which leave with their modules, about **4,880 lines, about 1,460 of code** plus the forward's generic part.

**P6 flag.** Past ~4,000 raw, as at T3; the growth is the act lists and `NEEDS`/`SESSION_OPS` rows for the layers 7–9 ops added since (intent, reevaluation, standards, conformance, consequences, filings, escalation). K93 keeps it one module because the code count (now about 1,460–1,930) is what P6 reads and the declarations are a table. If BOB wants a seam, the op declarations (`OPS`, the act lists, `SESSION_OPS`, `NEEDS`, `UNATTENDED_BY_DECISION`: about 2,950 lines, about 690 of code) are one data file separable from the doors.

## 2. What stays in `legacy-index`, or goes elsewhere

Each op's handler moves with its construct (K3), so these leave `legacy-index` as their modules are extracted, each by its own map:

| what | where (T3) | now | goes to |
| --- | --- | --- | --- |
| `userAgent`, `archiveSelect`, `governedFetch` | 180–317 | **gone** to `capture/acquire.mjs` (`userAgent`, `archiveSelect`) and `host-governor` (`governedFetch`); a 3-line wrapper stays at 134–137 | `capture`, `host-governor` (N25); the wrapper goes with its last caller |
| the acquire-text constants, the reading tiers (`needsTier2` … `ocrTextFromMember`) | 363–418, 4632–5808 | **gone** to `extraction/pipeline.mjs` | `extraction` (K49, K73) |
| `KNOCK`, `knockEnvelopeTooLarge`, `knockPayloadTooLarge`, `knockEmpty`, the `knock` arm | 2851–2945, 6749–6828 | **gone** to `capture/doorbell.mjs` (`knockOp`, one line at 4575) | `capture` (T3 §5.2 resolved) |
| `profilesAsText`, `substanceDigests`, the `monitor*` helpers, the `monitor` arm | 2973–3136, 10318–10923 | **gone** to `monitoring` (`monitorOp`, one line at 5285) | `monitoring`, `extraction` |
| `publicInstanceGroup`, `FLEET_BINDINGS`, `memberVersions`, the `instancegroup`, `groupidentity`, `bootstrap`, `selftest` and `livefire` arms | 3744–3766, 4043–4097, 6257–6311, 6829–6847, 7311–7437 | 3514–3536, 3749–3791, 4379–4428, 4576–4595, 5009–5080, 5103–5114 | `instance-setup` |
| `captureRequestArm` | 3963–4019 | **gone** (`capture-requests`) | `capture-requests` |
| `driveRow`, `renderRow`, `reextractRow`, `testimonyFenceRow`, `ratifyScopeRow`, `attributionRow` | 4105–4174 | **gone** to their families' modules, except `reextractRow` (3807, extraction's); `machineFenceRow` and `replayRow` come here (§1) | `capture`, `extraction`, `provenance`, `publication` |
| `storageAbsent`, `captureKey`; `publishedStoreAbsent`, `noPublishedPart`, `publishedObjectMissing`, `partsHeld` | 4467–4596 | `storageAbsent` 4116–4127 (passed to `capture/ops.mjs` and `extraction/ops.mjs`, 5229, 5233), `captureKey` 4140–4143; the published-store rows **gone** to `publication/worker.mjs`, `partsHeld` to `provenance` | `capture` (C-68.1's earliest raiser), `publication` |
| `assembleCaseContainer`; the public reads (`verify`, `publishedmanifest`, `caseflags`, `casedocument`, `publishedcase`, `publishedbytes`); `caseratify`, `ratify` | 5809–6072, 6215–6748, 10924–11859 | `assembleCaseContainer`, `publishedcase`/`publishedbytes` **gone** to `publication/worker.mjs`; `caseratify`/`ratify` **gone** to `ratification/ops.mjs` (one line each, 5289–5290); `verify`, `publishedmanifest` still at 4337–4378 and `caseflags`, `casedocument` at 4429–4521 | `publication` |
| `claim`, `login`, `invitelook`, `enroll` (their store calls) | 6177–6214 | 4299–4336 (less the bootstrap checks, §1) | `membership` |
| `affordances`, `queue`, `registeraudit`, `purge` | 7113–7310, 7385–7401 | 4836–4944, 4945–4991, 4993–5008, 5081–5102 | `affordances`, `queue`, `provenance` (the report is `registerAuditReport`), `record-core` |
| `runtime`, `cpuprobe` | 7438–7492 | 5133–5190 | `instance-setup` (K98; T3 §5.3 resolved) |
| `linkproject`, `links`, `capture`, `archivelookup`, `acquire`, `pdfstructure`, `attest`, `governorstate`, `governorconfig` | 7493–10317 | `linkproject` 5191–5224 inline; `acquire` 5239–5264 and `attest` 5265–5284 inline shells; the others one-line delegations (5225–5238) or `governorOp` | `connections`, `capture`, `capture-sources`, `extraction`, `provenance`, `host-governor` |
| the `aicredentialmint` and `aicredentialrevoke` store routes, C-29.1–.5 and C-29.11–.12 | store | `membershipOps` (membership) | the credential's owner, `membership`; the scope judgement (R19) and the value's generation (6967–6980) stay here |
| `export { Store }` (150), `export { PUBLISHED_TOKEN_HASHES, liveToken }` (151) | — | index | the Durable Object class becomes this module's (K93); the re-export of `runtime-limits` goes with the file |
| the store's own `export default` (a bare forwarder to `bio`) | — | store 7298–7302 | stays `legacy-store`'s (not reached by the Worker, which uses `index.mjs`'s) |
| `wrangler.jsonc`, `package.json`, `scripts/`, `migrate/` | — | — | stay `legacy-index`'s (its `paths`) |

## 3. ADDED lines expected in the legacy modules

- `legacy-index`: its default export becomes `control-plane`'s `fetch`, given `legacy-index`'s remaining arms as handlers in the op table (`{op: handler}`), so routing is one place while the arms still live there. `export { Store }` becomes the wrapped class (K93): `class Store extends LegacyStore`, with `fetch` as `control-plane.dispatch` over the modules' route maps and `legacy-store`'s.
- `legacy-store`: `Store.fetch`'s map becomes a method (`routes(url, body, env)`, the `membershipOps` shape) that `dispatch` reads. The frame, the catch and `#existenceRead` leave; `#existenceAct` is already `membership`'s (store 5985 delegates).
- `legacy-checks`: the families in §1 leave. `CHECK_CATALOGUE` (index 68) still enumerates the moved rows, since `dec49Row` reads every family's `translation`. So each module's rows are re-exported into it, or `dec49Row` reads a registry each module fills. The job picks one and reports it.

## 4. Old-battery tests that anchor on the moved source

These read or patch moved text, and each is a `legacy-tests` entry (K53): `admission-gate.test.mjs`, `preauth-vocabulary.test.mjs` (reads `"unknown op"` and the C-61.1 sentence textually), `auth-surface.test.mjs`, `fence.test.mjs`, `d456-namespace-scope.test.mjs`, `d461-pinned-namespace.test.mjs` and `nc-d461.mjs`, `d463-confined-credential.test.mjs` (§5 pins the gate order structurally) and `nc-d463.mjs`, `d475-page-namespace.test.mjs`, `d266scope.test.mjs` and `.control.mjs`, `rec155-session-routes.test.mjs`, `machine-fences.test.mjs` and `.control.mjs`, `machinefences-dec49.test.mjs`, `adminvote.test.mjs` and `.control.mjs` (the fence-dropped and stamp-dropped arms), `plane-envelope.test.mjs` (the detector D-679 widened), `ratify-envelope.test.mjs`, `refusal-wire.test.mjs` and `.control.mjs`, `task-fence.test.mjs`, `dec49-onecode-twoconditions.sweep.mjs`, and N53's three (`skillpack.test.mjs`, `skillpack.control.mjs`, `skillsequencing.test.mjs`). Suites that follow the module: admission, namespace, envelope, fences and stamps.

## 5. Undetermined, conflicts, and code others could claim

1. **The composition root.** Decided (K93): the Durable Object class is this module's once it is extracted; until then `legacy-index` stays the wrapper for every extracted layer-11 module.
2. **Resolved since T3.** The knock and the inbox (T3 §5.2): `capture` holds `knockOp`, `KNOCK` and its rows (`capture/doorbell.mjs`). `runtime` and `cpuprobe` (T3 §5.3): `instance-setup` (K98).
3. **D-629 and D-679** are built on `land/worker/D-629` @ `5e202b33` and `land/worker/D-679` @ `8894350b`, to be judged against R25 and R24. The store's catch still answers `String(e && e.stack || e)` (store 7293). The C-69.2 numbering conflicts with `main` (R25's Suggestion).
4. **D-586** is membership's carried row, and its fix is here (R19): `aiReachesAsMember` (3224) gains R14's session-only acts.
5. **Uses (modules.json).** Declared: `legacy-checks`, `runtime-limits`, `signatures`, `membership`, `publication`, `ratification`, `case-authoring`, `legacy-store`, `instance-setup`. The moved code also imports `affordances` (`decorate`, `ACTS`, `VOCABULARIES`, `PER_ITEM_ACTS`, index 90, for `ACT_GATE` and `op=affordances`), `capture` (`knockOp`, `captureObjectOp`, … 144–146), `extraction`, `monitoring`, `provenance`, `host-governor`, `bias` (`withBiasChecks`, 142), `docprofile`, `format-registry`, `subresources` and others while their arms stay inline; the uses grow, as K93 expects, with each module's handlers. `affordances` is needed by this module itself (the act gate), not only by a handler.
6. **Contradiction: the act gate.** Queue R17 ("decorates every option through `affordances.decorate` with the control plane's gate") and affordances R11 need a gate the control plane provides (`ACT_GATE`, index 2880, read from `NEEDS` and `SESSION_OPS`). No control-plane requirement provides it; its Provides should name it (or `NEEDS`/`SESSION_OPS` as a read) for the two callers.
7. **Stale requirement notes.** The requirements' Status and Size give the T3 ranges and "about 5,990 lines, about 1,610 of code"; the figures above replace them. No requirement's meaning changes.
