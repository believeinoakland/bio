# control-plane — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 11. It has no code of its own yet. It is extracted from `legacy-index` (`bio-plane/src/index.mjs`), and from `legacy-store` and `legacy-checks` where the map says so (`build/extraction/control-plane.md` has the table). Code today, measured on `tranche/T3` @ `f324df9b`, in `index.mjs`:
- the op declarations: `OPS` 419–1670, the act lists 1671–2063, `SESSION_OPS` 2064–2262, `NEEDS` 2263–2829, `UNATTENDED_BY_DECISION` 4316–4359;
- authentication: `classify`, `scopeFor`, `namespaceGate`, `pinnedNamespaceGate`, `confinedNamespaceGate`, `aiCredentialPresented`, `aiConfinementDeclaration`, `aiReachesAsMember`, `aiScopeDeclaration`, `aiTaskScope` 3137–3663, and `resolveSession`, `reviewAnswer`, `caseReader` 3664–3758;
- the envelope: `json`, `dec49Row`/`dec49Decorate`/`dec49Attach`, `doAnswer` 3768–3962, `storeSilent` 4020–4041, the row readers 4175–4230, `sessionOpGate` and `requiredArgument` 4360–4466, `StoreSilent` 4538–4540;
- in `fetch`, the front door 6073–6176, admission and `whoami` 6849–7093, and the forward with its stamps 11860–13438.

From `store.mjs`: `Store.fetch`'s frame (48479–48509, 49799–49811) and `PROJECT_NAMING_READS`, `PROJECT_NAMING_READS_NOT`, `#existenceRead` (33195–33258). Not yet met: R24 (D-679), R25 (D-629), R19's last sentence (D-586). Carried old-plan rows: D-629, D-679, and D-586 (placed here by membership's file).

**Size (P6).** About 5,990 lines move, about 1,610 without comment-only and blank lines. `index.mjs` accounts for 5,500 (1,331 code), `bio-checks.mjs` for 382 (202) and `store.mjs` for 108 (74). The forward range (11860–13438) is an upper bound: the op-specific arms inside it leave with their modules. The raw figure is past the 4,000-line mark (`layers.md` ruling 1). K93 keeps it one module.

## Public

### Purpose

The instance's two doors: the Worker's HTTP entry and the record store's internal dispatch. The control plane routes each op to the module that serves it. It works out who is asking and admits or refuses them before the op runs. It sets every identity field from the credential, never from the caller, and answers in one envelope. It decides where a call lands and who made it, never what the answer is.

### Provides

Terms. An **op spec** is `{classes, machineClasses?, mutating}`, with the op's session sets (`member`, `admin`), the capability it needs (`NEEDS`) and the stamps it takes. `classes: null` marks a **public** op. A **class** is `admin`, `member`, `probe` or `daemon` (the four binding credentials), `ai` (a minted agent credential), or a session's kind (`admin` for the founder's password session, `member` for every enrolled member). A **stamp** is a field the control plane sets on the request to the handler: `viewer`, `identity`, `author`, `by`, `actor`, `who`, `origin`, `administer`, and in a body `actorIdentity`, `actorViewer`, `actorMemberId`, `ownerMemberId`, `assistantPrincipal`, `migrationReplay`. The **namespaces** are `bio` and `scratch`.

**`fetch(req, env)`, the Worker entry: routing**
- **R1** `OPTIONS` answers 204 with `access-control-allow-origin: *`. `GET /version` answers `VERSION` (or `0.0.0`) as plain text. `GET /sign` answers `signatures`' signing page. `GET /` with no `op` answers `instance-setup`'s page (its R20), built from its public read of the namespace addressed: R6 applies first, and `store=scratch` reads `scratch` while anything else reads `bio`. The page is served `cache-control: no-store`.
- **R2** The op is the `op` parameter, else the path after `/api/` (or `/`), else `selftest`. A name with no spec is refused 400 `UNKNOWN_OP` (C-69.1), and `error` is `"unknown op"` as the first key after `ok`. An op with a spec is answered by the handler its module provides, or else forwarded to the store's route of that name (R26).

**Namespaces, before any credential is judged**
- **R3** A `store=` that is present and not exactly `bio` or `scratch` is refused 400 `NAMESPACE_UNKNOWN` (C-78.1), naming the namespaces. This applies to every caller and to R1's page.
- **R4** For an `ai` credential minted confined to `scratch`, a named `store=` other than `scratch` is refused 403 `NAMESPACE_CONFINED` (C-78.3), and an absent one is set to `scratch`.
- **R5** A public op that answers only from `bio` refuses `store=scratch` with 400 `NAMESPACE_PINNED` (C-78.2). The public ops that do address scratch are declared (`invitelook`, `enroll`, `instancegroup`, `groupidentity`), and every other public op is pinned.
- **R6** Admitted callers land as follows: `probe` in `scratch` (a named other namespace is refused 403 `SCOPE_REFUSED`, C-38.6), and every other class in `scratch` when `store=scratch` is given, else `bio`. Every forwarded answer carries `store`, the namespace that answered.

**Authentication**
- **R7** A `token` equal to the `ADMIN_TOKEN`, `MEMBER_TOKEN`, `PROBE_TOKEN` or `DAEMON_TOKEN` binding (checked in that order) gives that class, but only while the binding is live: set, and not a value ever published (runtime-limits `liveToken`). Any other token gives no binding class.
- **R8** A token shaped `aik-<64 hex>` is resolved once per request against `bio`'s credential rows. A known credential gives class `ai` with its principal, scope and confinement. A 64-hex token is resolved as a session through `membership.session` against `bio`. A store that does not answer either lookup is answered 502 `STORE_DID_NOT_ANSWER` and never as a statement about the caller.
- **R9** A caller with no class is refused 401 `NOT_AUTHENTICATED` (C-38.1).

**Admission, in this order**
- **R10** A session reaching a mutating op outside its kind's session set is refused 403. The refusal depends on why. `SESSION_ROLE_CANNOT_REACH_OP` (C-38.7) is used when the other kind's set holds the op, with `reachedBy` set to `founder` or `member`. `MACHINE_CREDENTIAL_REQUIRED` (C-38.3) is used when a recorded decision reserves the op to a credential, and cites that decision. `SESSION_ROUTE_NOT_RECORDED` (C-38.8) is used when no decision is recorded. `capture`'s GET is a read. A session asking for `export` is refused `ROOT_OF_TRUST_REQUIRED` (C-38.4).
- **R11** A binding class not in the op's `classes` is refused 403 `CLASS_FORBIDDEN` (C-38.2). For a caller that did not arrive by a session, `machineClasses` is used instead where the spec gives it.
- **R12** An `ai` caller is refused `AI_CREDENTIAL_REVOKED` (C-29.7) when its credential is withdrawn. It is refused `AI_BEYOND_TASK_SCOPE` (C-29.6) when no member reaches the op, or when the op is mutating and not among its declared writes.
- **R13** A session missing the op's capability is refused 403 `NOT_CAPABLE` (C-38.5), naming `needs` and `held`. A binding class holds no capabilities and is bounded by R11 alone.
- **R14** A bearer (any caller not arriving by a session) asking for a §4 governance act (`adminendorse`, `adminremove`, `membercaps`) is refused 403 `OPERATOR_TOKEN_CANNOT_GOVERN` (C-32.17). Asking for a group-identity act (`groupnameset`, `groupdomainset`), it is refused `GROUP_IDENTITY_NEEDS_SESSION` (C-64.4). Each refusal names the class.
- **R15** `claim` is checked against the bootstrap credential before `membership.claim` runs. An unset `ADMIN_TOKEN` is refused 409 `BOOTSTRAP_CREDENTIAL_UNSET` (C-68.2). A published one is refused 409 `BOOTSTRAP_CREDENTIAL_PUBLISHED` (C-68.3). A body's `bootstrapToken` that differs is refused 403 `BOOTSTRAP_CREDENTIAL_MISMATCH` (C-68.4). The claim carries the credential's fingerprint, never its value.
- **R16** A promotion asserting `replay` keeps it only for the `admin` class without a session, and only when the drive-provenance capture it names is registered, its bytes hash back, and one preserved promotion record names this bundle and this revision's `bundle.md` SHA-256. Otherwise an asserted replay is refused `REPLAY_UNVERIFIED` (C-66.6) before the store is called, and any other caller's `replay` is deleted.

**Stamps**
- **R17** For every op, any stamp the caller sends (query or body) is deleted. The op's declared stamps are then set from the authenticated caller:
  - a session: its member, its viewer (`admin` for the founder) and its identity (`member:<id>`);
  - an `ai` credential: its principal;
  - a binding class: `class:<cls>` as viewer or identity, and `token:<cls>` as author, actor or `who`.

  The founder's `author` is `admin`. `origin` is the origin the request reached. So no handler ever receives a caller's own statement of who or where they are.
- **R18** `administer` is true exactly for a session that administers (membership R3) and for the `admin` binding class. `op=whoami` answers `tokenClass`, `session`, `member`, `handle`, `administer`, `rootOfTrust`, the session's sorted `capabilities` (`null` for a credential), the capability `vocabulary` and `confinedTo` (for an `ai` credential, else `null`).
- **R19** An agent credential's scope is judged when it is minted. An op no spec declares is refused `AI_SCOPE_UNKNOWN_OP` (C-29.8). An op no member reaches is refused `AI_SCOPE_BEYOND_MEMBER_REACH` (C-29.9). A `confinedTo` other than absent or exactly `scratch` is refused `AI_CONFINEMENT_NOT_SCRATCH` (C-29.10). The credential's value and a review grant's secret are generated here, returned once in the minting answer, and passed on only as their SHA-256. An op a bearer is refused by R14 counts as beyond member reach, both at the mint and in R12. *(not yet met: D-586)*

**Doors that authenticate by a secret**
- **R20** `reviewcopy`, `reviewcomment` and `statementack` admit a caller holding a review grant's secret, whose digest the store checks. A draft outside the fence is answered 404 `NO_REVIEW_COPY`, with the same bytes from `reviewcopy` and from `casedrafts`.

**The envelope**
- **R21** Every answer is JSON with `access-control-allow-origin: *`. A forwarded answer is the handler's, with `store` and `tokenClass` added and its HTTP status kept.
- **R22** A refusal (`ok: false`, at the top level or in `result`) whose `reason` or `code` has a catalogue row gains `code`, `check` and `translation` where absent. Only those two levels are decorated.
- **R23** A store answer that is not JSON with `ok: true` means the store did not answer. It is refused 502 `STORE_DID_NOT_ANSWER` (C-69.2), naming the op, and is never read as an absence, a refusal or a success.
- **R24** A public op relaying the store's answer answers the store's own status, and answers R23 on a store failure, never 200. `claim`, `login`, `invitelook` and `enroll` read the answer without its `ok` today. *(not yet met: D-679)*
- **R25** An error thrown anywhere in either door is answered with a named internal-error code (`PLANE_INTERNAL_ERROR` in the Worker, `STORE_INTERNAL_ERROR` in the store) and a correlation id. It never carries the stack, the message, a path or a line, and the stack is logged server-side under the correlation id. *(not yet met: D-629; `Store.fetch` answers `String(e.stack)` today)*

**`dispatch(req)`, the record store's door**
- **R26** An empty POST body is `null`, and a body that is not JSON is refused 400 `BAD_JSON`. A route no module serves is refused 400 `unknown op: <op>`. An answer is `{ok: true, result}`. The routes are the modules' own maps (the `membershipOps` pattern).
- **R27** A read whose parameters name a project (the declared `PROJECT_NAMING_READS`), asked with a stamped `viewer` and naming a discoverable project, is answered by `membership.existenceAct` first (C-70.1), before its route runs. The reads declared to name no project are listed with the reason.

## Private

### Uses

- `membership`: `session` (R8), `claim` (R15), `existenceAct` (R27), `isAdministrator`.
- `runtime-limits`: `liveToken` (R7, R15).
- `signatures`: the signing page (R1).
- `publication`: `inbandQuartet`, for the review copy's answer (R20).
- `instance-setup`: `setupPage`, its public group read (R1), the reports' handlers.
- `legacy-checks`: the rows of R32 until they move; `CHECK_CATALOGUE` (R22); `MACHINE_AUTHOR_PREFIX`, `MACHINE_CLASS_PREFIX`.
- `legacy-store`: its store routes and class until each module takes its own.
- Every module whose op handlers or store routes it routes. These uses are declared as each module is extracted (K93).

### Invariants

- **R28** The gates run in one order, which the tests pin: R3, R4, R5, then the public ops (R15 among them), then R7–R8 with R10's session gate, R9, R11/R12, R10's export refusal, R13, R6's scope refusal, then R14 and R16, and then the op. Nothing is read or written when a gate refuses.
- **R29** No handler receives a caller-supplied value for any stamp (R17). This is tested for every op that declares a stamp.
- **R30** No credential, session token, secret or stack appears in any answer, except the one minting answer of R19.
- **R31** An op spec for every op any module serves, and no spec without a handler or a store route.
- **R32** Each check moves here as an invariant with its test (K6): C-38.1–C-38.8, C-69.1, C-69.2 and the two internal-error rows R25 adds, C-78.1–C-78.3, C-29.6–C-29.10, C-32.17, C-64.4, C-68.2–C-68.4 and C-66.6.
- **R33** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §2 (the trustworthiness of the record: a silence is not an answer) and §3, construct 12.
- `docs/architecture/BIO_Membership_Architecture_v2.md` §4.6 (the root of trust: claim, export), §4.7, §4.9 (governance acts are a named administrator's own session), §4.10 (the session ops), §5 (capabilities enforced at the op layer), §7.14 (existence answers).
- `docs/architecture/BIO_Distribution_v0_1.md` §6 rung 6 (namespaces and confinement: D-325, D-456, D-461, D-463).
- `docs/architecture/BIO_Publication_v0_1.md` §7 points 2–3 (the identity acts, a session's own), §6A (the review door).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the `ai` class, its principal and scope; D-199).
- Bob's rulings K3 and K23; `layers.md` ruling 2.

### Suggestions

- **Declarations stay, handlers move.** Every drafted map so far keeps op classes, session sets, capabilities and stamp lists here, and moves the handler with its construct (K3). This file follows them. A module that gains an op asks BOB to add its spec, which is one reviewable table.
- **Shape.** An op table `{op: {spec, handler?}}` and a store-route table assembled from each module's map. The generic forward (today's tail of `fetch`) is the default handler.
- **The internal-error codes** take the next free C-69 numbers when D-629's built work (`land/worker/D-629` @ `5e202b33`) is judged. That branch minted C-69.2 before D-561 gave C-69.2 to `STORE_DID_NOT_ANSWER` on `main`.
- **For callers.** Handlers read stamps from the request, never the body's own fields. `promotion` trusts its identity stamps as given (its Suggestions); that trust is kept by R17 and R29.
- **Tests.** One arm per refusal code, with a negative control each. R28's order is driven by a request that would fail two gates at once. R29 is driven by sending every stamp field on every declared op.

## Open for Bob

None: answered by Bob 2026-09-26 (K102). The draft's two questions were technical, and BOB #43 decided them (K93): the Durable Object class is this module's once it is extracted (the one place that starts every module and routes their ops; until then `legacy-index` wraps `legacy-store`'s class); and the module stays one module, about 1,610 lines of code, since P6 counts reading and the op declarations are a table (as K85 read it).

## Decided by BOB

- `from`: `legacy-index`, `legacy-store` (`Store.fetch`'s frame, the existence read; membership's map placed it here) and `legacy-checks` (R32). Uses gain `runtime-limits`, `signatures`, `publication`, `instance-setup` and `legacy-checks`.
- `reviewAnswer`, the grant secret and the review door's reader are here, as `build/extraction/review.md` placed them. C-66.6 is here, as `build/extraction/ai-runs.md` placed it.
- C-61.1 (`requiredArgument`), C-68.1 (`storageAbsent`) and C-68.5 (`publishedStoreAbsent`) are not this module's. Each is raised by handlers that move out (`capture`, `publication`, the knock). The earliest of them holds the row, and later ones import it (K78 (3)).
- The legacy root query API (`/?op=`, one old deployment) stays until Bob retires that deployment (P1).
