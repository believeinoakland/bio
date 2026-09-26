# control-plane — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`index.mjs` 13,438 lines, 4,909 of code; `store.mjs` 49,817; `checks/bio-checks.mjs` 15,682) by a drafting worker for BOB #43 (P18). The contract is `build/requirements/control-plane.md` (R1–R33). K3, K23, K53, K61 and the placements in the drafted maps (review, ai-runs, membership §3.6, the layer 3–6 maps) apply. `from` should read `["legacy-index", "legacy-store", "legacy-checks"]`. Counts are raw and, in brackets, without comment-only and blank lines.

## 1. What moves to `control-plane`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| `OPS` (every op's spec) | index | 419–1670 | 1,252 (232). R2, R11, R31. The rows' long comments are the ops' histories: the job keeps each row's reason in one line |
| the act lists (`RETRIEVAL_READS` … `PROGRESSION_ACTIONS`) | index | 1671–2063 | 393 (39); they drive the stamps (R17) and the fences (R14) |
| `SESSION_OPS`, `NEEDS` | index | 2064–2829 | 766 (187); R10, R13 |
| `SCRATCH`, `PUBLISHED_STORE`, `fingerprint`, `sha256Hex` | index | 2946–2972 | 27 (11) |
| the DAEMON-class header, `classify`, `scopeFor`, `NAMESPACES`, `namespaceGate`, `SCRATCH_ADDRESSING_PUBLIC_OPS`, `pinnedNamespaceGate`, `confinedNamespaceGate`, `aiCredentialPresented`, `aiConfinementDeclaration`, `AI_TOKEN_SHAPE`, `aiReachesAsMember`, `aiScopeDeclaration`, `aiTaskScope` | index | 3137–3663 | 527 (133); R3–R8, R12, R19 |
| `resolveSession`, `reviewAnswer`, `caseReader` | index | 3664–3758 | 95 (54); `reviewAnswer` per the review map; it calls `publication`'s `inbandQuartet` |
| `json`, `DEC49_ROWS`, `dec49Row`, `dec49Decorate`, `dec49Attach`, the REC-52 header, `STORE_SILENT_*`, `doAnswer` | index | 3768–3962 | 195 (52); R21–R23 |
| `storeSilent` | index | 4020–4041 | 22 (6); R23 |
| `identityFenceRow`, `admissionRow`, `requiredArgumentRow`, `namespaceRow`, `installationRow`, `dispatchRow` | index | 4175–4230 | 56 (42); `requiredArgumentRow` goes to the earliest raiser of C-61.1 (§2) |
| `UNATTENDED_BY_DECISION`, `sessionOpGate`, `requiredArgument` | index | 4231–4466 | 236 (68); R10 |
| `StoreSilent` | index | 4538–4540 | 3 |
| `migrationReplayOf`, `DRIVE_PROVENANCE_PATH` | index | 4597–4631 | R16 (C-66.6, as the ai-runs map placed it) |
| `fetch`: `OPTIONS`, `/version`, `/sign`, `/`, op resolution, `UNKNOWN_OP`, the namespace gates, the public block's frame | index | 6073–6176 | 104 (37); R1–R5 |
| `claim`'s bootstrap-credential checks (`is-bootstrap-claim`) | index | 6177–6194 | R15; the call to `membership.claim` stays with it |
| the review door's reader of a grant secret | index | 6400–6445 | R20 (review map) |
| authentication and admission (`is-admission`), `whoami` | index | 6849–7093 | 245 (77); R7–R13, R18 |
| the forward: `DO_PATH`, the inner request, the viewer, identity, author and `by` stamps, the operator and identity fences, the body scrubs of `promote` and the other body-carrying acts, the mint and grant secrets, the final forward | index | 11860–13438 | 1,579 (390) at most; R14, R16, R17, R19, R21. The op-specific arms inside it leave with their modules |
| `Store.fetch`'s frame: body parse, `BAD_JSON`, the route map's frame, `unknown op`, `{ok, result}`, the catch | store | 48479–48509, 49799–49811 | R25, R26. The route entries leave with their modules (the `membershipOps` pattern) |
| `PROJECT_NAMING_READS`, `PROJECT_NAMING_READS_NOT`, `#existenceRead` | store | 33195–33258 | R27 (membership map §3.6: "stays with the dispatcher") |
| `ADMISSION_CHECKS` (C-38.1–.8) and header | bio-checks | 10420–10604 | R32 |
| `NAMESPACE_CHECKS` (C-78.1–.3), `DISPATCH_CHECKS` (C-69.1–.2) | bio-checks | 10841–10874, 10877–10904 | R32 |
| `INSTALLATION_CHECKS` C-68.2–.4 | bio-checks | 10683–10700 | R32; C-68.1 and C-68.5 go elsewhere (§2) |
| `AI_CREDENTIAL_CHECKS` C-29.6–.10 | bio-checks | 8668–8730 | R32; C-29.1–.5 stay with the credential's store routes (§2) |
| `OPERATOR_TOKEN_CANNOT_GOVERN` (C-32.17) | bio-checks | 9360–9382 | R32; `MACHINE_FENCE_CHECKS` is split by the first job to move (the strength map's rule) |
| `GROUP_IDENTITY_NEEDS_SESSION` (C-64.4) | bio-checks | 14116–14126 | R32 (K69's cluster, split: instance-setup map §2) |
| `REPLAY_UNVERIFIED` (C-66.6) | bio-checks | 13717–13736 | R32 (ai-runs map) |

**Measured size:** `index.mjs` about 5,500 (1,331), `bio-checks.mjs` 382 (202), `store.mjs` 108 (74): about 5,990 lines, about 1,610 of code. The forward range is an upper bound.

## 2. What stays in `legacy-index`, or goes elsewhere

Each op's handler moves with its construct (K3), so these leave `legacy-index` as their modules are extracted, each by its own map:

| what | where today | goes to |
| --- | --- | --- |
| `userAgent`, `archiveSelect`, `governedFetch` | 180–317 | `capture`, `capture-sources`, `host-governor` (N25) |
| the acquire-text constants, the reading tiers (`needsTier2` … `ocrTextFromMember`) | 363–418, 4632–5808 | `extraction` (K49, K73) |
| `KNOCK`, `knockEnvelopeTooLarge`, `knockPayloadTooLarge`, `knockEmpty`, the `knock` arm | 2851–2945, 6749–6828 | the inbox's owner; no map has placed it (§5) |
| `profilesAsText`, `substanceDigests`, the `monitor*` helpers, the `monitor` arm | 2973–3136, 10318–10923 | `monitoring`, `extraction` |
| `publicInstanceGroup`, `FLEET_BINDINGS`, `memberVersions`, the `instancegroup`, `groupidentity`, `bootstrap`, `selftest` and `livefire` arms | 3744–3766, 4043–4097, 6257–6311, 6829–6847, 7311–7437 | `instance-setup` |
| `captureRequestArm` | 3963–4019 | `capture-requests` |
| `driveRow`, `renderRow`, `reextractRow`, `testimonyFenceRow`, `ratifyScopeRow`, `machineFenceRow`, `replayRow`, `attributionRow` | 4105–4174 | the owners of their families (`capture`, `extraction`, `provenance`, `publication`); `replayRow` and `machineFenceRow`'s C-32.17 use come here |
| `storageAbsent`, `publishedStoreAbsent`, `noPublishedPart`, `publishedObjectMissing`, `captureKey`, `partsHeld` | 4467–4596 | `capture`, `publication` (C-68.1, C-68.5, C-98) |
| `assembleCaseContainer`; the public reads (`verify`, `publishedmanifest`, `caseflags`, `casedocument`, `publishedcase`, `publishedbytes`); `caseratify`, `ratify` | 5809–6072, 6215–6748 (less the review door), 10924–11859 | `publication` |
| `claim`, `login`, `invitelook`, `enroll` (their store calls) | 6177–6214 | `membership` |
| `affordances`, `queue`, `registeraudit`, `purge` | 7113–7310, 7385–7401 | `affordances`, `queue`, `provenance`/`record-core`, `record-core` |
| `runtime`, `cpuprobe` | 7438–7492 | undetermined (§5) |
| `linkproject`, `links`, `capture`, `archivelookup`, `acquire`, `pdfstructure`, `attest`, `governorstate`, `governorconfig` | 7493–10317 | `connections`, `capture`, `capture-sources`, `extraction`, `provenance`, `host-governor` |
| the `aicredentialmint` and `aicredentialrevoke` store routes, C-29.1–.5 | store | the credential's owner (`membership` holds the routes today, `membershipOps`); the scope judgement (R19) and the value's generation stay here |
| `wrangler.jsonc`, `package.json`, `scripts/`, `migrate/` | — | stay `legacy-index`'s (its `paths`) |

## 3. ADDED lines expected in the legacy modules

- `legacy-index`: its default export becomes `control-plane`'s `fetch`, given `legacy-index`'s remaining arms as handlers in the op table (`{op: handler}`), so routing is one place while the arms still live there. `export { Store }` becomes the wrapped class (control-plane Open for Bob 1): `class Store extends LegacyStore`, with `fetch` as `control-plane.dispatch` over the modules' route maps and `legacy-store`'s.
- `legacy-store`: `Store.fetch`'s map becomes a method (`routes(url, body, env)`, the `membershipOps` shape) that `dispatch` reads. The frame, the catch and `#existenceRead` leave; `#existenceAct` is already `membership`'s.
- `legacy-checks`: the families in §1 leave. `CHECK_CATALOGUE` still enumerates the moved rows, since `dec49Row` reads every family's `translation`. So each module's rows are re-exported into it, or `dec49Row` reads a registry each module fills. The job picks one and reports it.

## 4. Old-battery tests that anchor on the moved source

These read or patch moved text, and each is a `legacy-tests` entry (K53): `admission-gate.test.mjs`, `preauth-vocabulary.test.mjs` (reads `"unknown op"` and the C-61.1 sentence textually), `auth-surface.test.mjs`, `fence.test.mjs`, `d456-namespace-scope.test.mjs`, `d461-pinned-namespace.test.mjs` and `nc-d461.mjs`, `d463-confined-credential.test.mjs` (§5 pins the gate order structurally) and `nc-d463.mjs`, `d475-page-namespace.test.mjs`, `d266scope.test.mjs` and `.control.mjs`, `rec155-session-routes.test.mjs`, `machine-fences.test.mjs` and `.control.mjs`, `machinefences-dec49.test.mjs`, `adminvote.test.mjs` and `.control.mjs` (the fence-dropped and stamp-dropped arms), `plane-envelope.test.mjs` (the detector D-679 widened), `ratify-envelope.test.mjs`, `refusal-wire.test.mjs` and `.control.mjs`, `task-fence.test.mjs`, `dec49-onecode-twoconditions.sweep.mjs`, and the skills tests that read `index.mjs` (N53). Suites that follow the module: admission, namespace, envelope, fences and stamps.

## 5. Undetermined, conflicts, and code others could claim

1. **The composition root** (Open for Bob 1). Without it, `legacy-index` stays the Durable Object's wrapper for every extracted layer-11 module.
2. **The knock and the inbox.** `capture`'s map keeps the inbox ops' stamps here, but no map owns the `knock` handler, `KNOCK` or C-85.3–.5. BOB places them (with `capture`, or with the inbox's module if one is made).
3. **`runtime` and `cpuprobe`.** These are measurement ops over `runtime-limits`' figures. `runtime-limits` is layer 1 and serves no ops, so the arms need a layer-11 home. The candidates are this module (as instance measurements) or `instance-setup`, beside `selftest`. BOB places them.
4. **D-629 and D-679** are built on `land/worker/D-629` @ `5e202b33` and `land/worker/D-679` @ `8894350b`, to be judged against R25 and R24. The C-69.2 numbering conflicts with `main` (R25's Suggestion).
5. **D-586** is membership's carried row, and its fix is here (R19): `aiReachesAsMember` gains R14's session-only acts.
6. **Uses.** The declared uses are `membership` and `legacy-store`. The moved code also calls `runtime-limits`, `signatures`, `instance-setup` and `legacy-checks`, and `publication`'s `inbandQuartet` (`reviewAnswer`). The remaining uses grow with each module's handlers.
