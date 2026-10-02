# control-plane — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 11. It has no code of its own yet. It is extracted from `legacy-index` (`bio-plane/src/index.mjs`), and from `legacy-store` and `legacy-checks` where the map says so. Code today: re-measured 2026-09-28 on `tranche/T10` @ `6faa8084` by a worker for BOB #59; `build/extraction/control-plane.md` has the table (T3's ranges kept there in brackets). Not yet met: R24 (D-679), R19's last sentence (D-586). R25 met T13 (N333). R34 (the act gate) worded from the code by a worker for BOB #59, 2026-09-28. Carried old-plan rows: D-629, D-679, and D-586 (placed here by membership's file). folded by a worker for BOB #66, 2026-09-29 (T14 opening; `build/plan/draft-T14-wordings.md`, K444, K445): N339 and N349 R23 (every relay, with the correlation); N347 R22 reads `capture`'s rows; N348 R35 (the Durable Object class); uses gain `capture`; met in T14 (CONTROL-PLANE #5, K476). N364 (DEC-78 item 1; W5 of `build/plan/draft-T16.md`) folded by a worker for BOB #71, 2026-09-30 (T16 opening): R36; uses gain `promotion` and `sources`; built by CONTROL-PLANE #7 (K563), its filing waiting on N381. Action layer folded 2026-09-30 (K608, K617): no new id; R26, R29 and R31 already require the op specs and stamps of `action-plans`' fourteen ops, `actions`' `actioncreate`, `action`, `actions` and `actionpressure`, `action-clocks`' `reminderanswer` and `filings`' `communicationprepare`, R22 `action-plans`' check table, and R27 `plans` among `PROJECT_NAMING_READS`; uses gain `action-plans` and `action-clocks`. Split three ways at T18's opening by a worker for BOB #75, 2026-09-30 (K617, K624 (1), (2)): what each op is (`ops.mjs`: R31, R34) moved to `op-declarations`, and the credential and admission path (R3–R14, R19, and R32's admission rows) to `admission`, each with its meaning unchanged and its id retired here; this module keeps the door (routing, the stamps, the answer's decoration and envelope, the store's dispatch, the pull) and uses both. R19's open mark (D-586) moves with it to `admission` R13. K621: R39 written (N408's reservation), `op=purge`'s confirmation gate. Folded by a worker for BOB #80, 2026-10-01 (T19 layer-11 fold; K653 BOB-2, K764, `current.md` rules 1 and 6): R35 (the Durable Object class) moved to `plane` R1 without change of meaning, retired here; R42 the testimony slot's place once `legacy-store`'s promotion step goes (provenance R52, K764); R43 the catalogue's end (rule 1); `ops.mjs` deleted with `legacy-index`'s need of it; `index.mjs`:8's and `pull.mjs`'s catalogue imports re-pointed to `record-grammar` (Uses). Filing templates and local facts (K921, K922 (3)) folded for T21 by a worker for BOB #86, 2026-10-01, before layer 11, as `actionhold` was (K902, K920): R44 (the template grant's secret and door) added, not yet met; R26, R29 and R43 already require the two modules' routes, stamps and check families (specs in `op-declarations` R8); Uses gains `filing-templates` and `local-facts`. AMENDED by BOB #87 at T21's opening (K933): R42's words naming plane's held copy struck (N468; plane R10 met, `held.mjs` deleted, K923); no meaning changed. R36 gains the `pulled` resolve's reason (capture R32, DEC-88 (2); K1037), by a fold worker for BOB #91 on `tranche/T22`, 2026-10-02; not yet met (T22 layer 11). T23, by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02: R45 (routes N485's three ops, `sweeps`, the notice ops and the notice public reads) added, not yet met (T23 L11); Uses gain `network-notices`.

**Size (P6).** After the split (K624 (2)) about 3,500 lines remain here (`index.mjs` less the admission path, `checks.mjs` less its admission rows, `dispatch.mjs`, `pull.mjs`); `op-declarations` takes ~2,100 and `admission` ~900. Before it: at most about 6,630 lines move (about 1,930 of code), counting the whole forward; without the forward's op-specific arms, which leave with their modules, about 4,880 (about 1,460) (`build/extraction/control-plane.md`, re-measured 2026-09-28). Past the 4,000-line mark by lines; accepted as fitting one reading (K93, and BOB 2026-09-28), since the op declarations are a table. The split to take if a job reports it cannot read the module whole is in Suggestions.

## Public

### Purpose

The instance's two doors: the Worker's HTTP entry and the record store's internal dispatch. The control plane routes each op to the module that serves it. It works out who is asking and admits or refuses them before the op runs. It sets every identity field from the credential, never from the caller, and answers in one envelope. It decides where a call lands and who made it, never what the answer is.

### Provides

Terms. An **op spec** is `{classes, machineClasses?, mutating}`, with the op's session sets (`member`, `admin`), the capability it needs (`NEEDS`) and the stamps it takes. `classes: null` marks a **public** op. A **class** is `admin`, `member`, `probe` or `daemon` (the four binding credentials), `ai` (a minted agent credential), or a session's kind (`admin` for the founder's password session, `member` for every enrolled member). A **stamp** is a field the control plane sets on the request to the handler: `viewer`, `identity`, `author`, `by`, `actor`, `who`, `origin`, `administer`, and in a body `actorIdentity`, `actorViewer`, `actorMemberId`, `ownerMemberId`, `assistantPrincipal`, `migrationReplay`. The **namespaces** are `bio` and `scratch`.

**`fetch(req, env)`, the Worker entry: routing**
- **R1** `OPTIONS` answers 204 with `access-control-allow-origin: *`. `GET /version` answers `VERSION` (or `0.0.0`) as plain text. `GET /sign` answers `signatures`' signing page. `GET /` with no `op` answers `instance-setup`'s page (its R20), built from its public read of the namespace addressed: `admission` R4 applies first, and `store=scratch` reads `scratch` while anything else reads `bio`. The page is served `cache-control: no-store`.
- **R2** The op is the `op` parameter, else the path after `/api/` (or `/`), else `selftest`. A name with no spec is refused 400 `UNKNOWN_OP` (C-69.1), and `error` is `"unknown op"` as the first key after `ok`. An op with a spec is answered by the handler its module provides, or else forwarded to the store's route of that name (R26).

**Namespaces, before any credential is judged**
- **R3** *(retired: moved to `admission` R1, K617)*
- **R4** *(retired: moved to `admission` R2, K617)*
- **R5** *(retired: moved to `admission` R3, K617)*
- **R6** *(retired: moved to `admission` R4, K617)*

**Authentication**
- **R7** *(retired: moved to `admission` R5, K617)*
- **R8** *(retired: moved to `admission` R6, K617)*
- **R9** *(retired: moved to `admission` R7, K617)*

**Admission, in this order**
- **R10** *(retired: moved to `admission` R8, K617)*
- **R11** *(retired: moved to `admission` R9, K617)*
- **R12** *(retired: moved to `admission` R10, K617)*
- **R13** *(retired: moved to `admission` R11, K617)*
- **R14** *(retired: moved to `admission` R12, K617)*
- **R15** `claim` is checked against the bootstrap credential before `membership.claim` runs. An unset `ADMIN_TOKEN` is refused 409 `BOOTSTRAP_CREDENTIAL_UNSET` (C-68.2). A published one is refused 409 `BOOTSTRAP_CREDENTIAL_PUBLISHED` (C-68.3). A body's `bootstrapToken` that differs is refused 403 `BOOTSTRAP_CREDENTIAL_MISMATCH` (C-68.4). The claim carries the credential's fingerprint, never its value.
- **R16** A promotion asserting `replay` keeps it only for the `admin` class without a session, and only when the drive-provenance capture it names is registered, its bytes hash back, and one preserved promotion record names this bundle and this revision's `bundle.md` SHA-256. Otherwise an asserted replay is refused `REPLAY_UNVERIFIED` (C-66.6) before the store is called, and any other caller's `replay` is deleted.

**Stamps**
- **R17** For every op, any stamp the caller sends (query or body) is deleted. The op's declared stamps are then set from the authenticated caller:
  - a session: its member, its viewer (`admin` for the founder) and its identity (`member:<id>`);
  - an `ai` credential: its principal as viewer, and `class:ai/<tokenId>` as author (REC-134);
  - a binding class: `class:<cls>`, or `token:<cls>` where the op's recorded decision names that form (D-311).

  The founder's `author` is `admin`, and `member:admin` on the action-layer and intent acts (T8). `origin` is the origin the request reached. On `publishpreflight` an `ai` caller's credential is also stamped as `aiCred` (N407, K737). So no handler ever receives a caller's own statement of who or where they are.
- **R18** `administer` is true exactly for a session that administers (membership R3) and for the `admin` binding class. `op=whoami` answers `tokenClass`, `session`, `member`, `handle`, `administer`, `rootOfTrust`, the session's sorted `capabilities` (`null` for a credential), the capability `vocabulary` and `confinedTo` (for an `ai` credential, else `null`).
- **R19** *(retired: moved to `admission` R13, K617)*

**Doors that authenticate by a secret**
- **R20** `reviewcopy`, `reviewcomment` and `statementack` admit a caller holding a review grant's secret, whose digest the store checks. A draft outside the fence is answered 404 `NO_REVIEW_COPY`, with the same bytes from `reviewcopy` and from `casedrafts`. `op=reviewcopy`'s in-band `date` is the copy's `last_change.at` as the store states it (d543, K737).
- **R44** (K921; `filing-templates` R8, R9, R13, R14) `templatereviewgrant` is answered as `reviewgrant` is: the grant's secret is `admission`'s `reviewGrantSecret` (its R13, a review grant's secret), returned once in that minting answer, and the act receives only its SHA-256 (`secretSha`). `templateread`, `templatecomments`, `templatereview` and `templatecomment` admit a caller holding a live template grant's secret, stamped `secretSha` and `bySecret` as `reviewcopy`'s are, or a member's session; every caller the grant does not admit receives `filing-templates`' dead answer (`NO_TEMPLATE_GRANT`), byte-identical, answered 404.
- **R45** (N485: K1025, K1051; K1094; DEC-111, K1100) The door routes, through each owner's own map (R26), with the stamps `op-declarations` R10 declares and none taken from the caller (R29):
  - `escalationreasondraft` (`escalation` R25's arm, R29);
  - `whatchangedpropose` and `whatchangeddrafts` (`case-authoring` R39);
  - `sweeps` (`link-sweep` R9), through `link-sweep`'s map;
  - `noticeprepare`, `noticepost`, `notices` and `directorysubmission` (`network-notices` R1–R6, R11, R22, R23), each refused to any caller not arriving by a member's session;
  - `network-notices`' public reads (its R10, R20, R21), credential-free on the public path, as `public-read` R18 registers them: by their own names and as `op=publicread&name=` (K1172).

**The envelope**
- **R21** Every answer is JSON with `access-control-allow-origin: *`. A forwarded answer is the handler's, with `store` and `tokenClass` added and its HTTP status kept.
- **R22** A refusal (`ok: false`, at the top level or in `result`) whose `reason` or `code` has a row, in the catalogue or in a module's own table the door reads (`capture`'s among them, N347), gains `code`, `check` and `translation` where absent. Only those two levels are decorated.
- **R23** A store answer that is not JSON carrying a boolean `ok` means the store did not answer. It is refused 502 `STORE_DID_NOT_ANSWER` (C-69.2), naming the op, and is never read as an absence, a refusal or a success. A JSON answer with `ok: false` is the store's own refusal, relayed with its status, code and sentence (R26's `BAD_JSON` among them). Every handler that relays a store answer, whichever module holds it, answers so: the plane hands it `storeRefusal` with `doAnswer` and `storeSilent`, and a `refused` answer is relayed through it, never as `STORE_DID_NOT_ANSWER` (N339); and a reply that is no answer is `STORE_DID_NOT_ANSWER` carrying the correlation id `doAnswer` read from the store's internal error, when it gave one (R25; N349).
- **R24** A public op relaying the store's answer answers the store's own status, and answers R23 on a store failure, never 200.
- **R25** An error thrown anywhere in either door is answered with a named internal-error code (`PLANE_INTERNAL_ERROR` in the Worker, `STORE_INTERNAL_ERROR` in the store) and a correlation id. It never carries the stack, the message, a path or a line, and the stack is logged server-side under the correlation id.

**The act gate** (moved to `op-declarations` with the tables it reads, K624)
- **R34** *(retired: moved to `op-declarations` R1, K617)*

**The Durable Object class** (K93; N348)
- **R35** *(retired: moved to `plane` R1, K653 BOB-2; T19's layer-11 fold)*
- **R42** (K764, K861; provenance R52) This module holds the promotion step `legacy-store` registered (plane R10). It exports the step whole for `plane` to register under this module's name, and registers nothing itself and edits no file of `plane`'s. The step is `provenance`'s `testimonySlot()` (its `check`; its `project`, whose refusal rolls the promotion back and whose `testimony` joins the answer on the testimony path only) and `membership`'s sight index (`reindexProjectSight` on every promotion, D-497), which `membership` cannot register because it does not use `promotion`. It runs at the rank `legacy-store`'s step had, whatever this module's own place in the order: its `check` after the checks of every module before `legacy-store`'s old place in the order (`monitoring`'s included) and before `tasks`', and its `project` after those modules' projections and before any later module's. So every step's checks and projections, every answer's keys and values, and the order of refusals are those of today.

**The doorbell's pull** (N364; DEC-78 item 1)
- **R36** `op=inboxpull` routes to capture's `pullKnock` (capture R65) stamping `by` from the session, and in the same act promotes the pulled document as a new information bundle at `collected`, the puller its author; the pull and its promotion are one act, through capture R65's `within` (K559, K580): a refusal or a fault of either leaves neither written, and a fault answers a fixed sentence, never store text. A knock already pulled whose capture no bundle holds (pulled through capture's own route) is promoted by the door's next pull of it (K609). `op=inboxresolve` with `status: "pulled"` is that pull reached as capture R32's resolve, and it takes capture R32's reason: a `reason` absent, not a string, blank or over 2,000 characters is refused `RESOLVE_NO_REASON` (capture's row, C-118.7, 400) before anything is written, and an admitted reason is carried to capture so that it is recorded on the knock's row with the pull, in the same one act as the pull and its promotion; `op=inboxpull` takes no reason (capture R65; K1023). (DEC-88 (2); K1037)
- **R37** (D-78, N398, K607) On `op=promote`, a creation (`base: null`) of an inquiry (its document's `object_type` through `normalizeType`, a legacy spelling included) that is not a verified replay (R16) has `surfaced_by` in its `bundle.md` front matter set by the control plane: `human` for a session, `agent` for any other caller; the caller's value never reaches the store. Its `sha256` and `bytes` are recomputed when the caller sent no digest or the digest of the text it sent, else left as sent so the store refuses the mismatch. A revision is not restamped.
- **R38** (D-61, N398, K607) `op=lease`'s `actor` is set by the control plane: a session's member, any other caller `token:<class>` (an `ai` credential `token:ai`); the caller's `actor` never reaches the store. The lease itself is record-core's (its R10).
- **R39** (N408, K621) `op=purge` whose `confirm` is not exactly the namespace the request resolved to (`admission` R4) is refused 400 `REQUIRED_ARGUMENT_MISSING` (C-61.1), naming `argument` `confirm`, `expected` (that namespace) and `got` (the `confirm` sent, or null), with `tokenClass` and `store`, before the store is called: nothing is read or written. So a purge never lands in a namespace its caller did not name; a probe, confined to `scratch` (`admission` R4), can confirm only `scratch`. C-61.1's row moves to this module's own `checks.mjs` with the gate.
- **R40** (N399, K607) `op=stats` is stamped `capacity=1` exactly for the `admin` class (the ADMIN_TOKEN binding and the founder's session), else `capacity=0`, beside its `viewer` (R17); a caller's `capacity` never reaches the store, in either direction.
- **R43** (rule 1, K648) This module's last act ends the catalogue: once every other importer has re-pointed, no product module and no module test imports `checks/bio-checks.mjs`, the file and `test/m/legacy-checks/` are gone, and `CHECK_FAMILIES` (R22, R41) is composed of the modules' own families and this module's alone, still total over `build/modules.json` (every module with a check table has its entry). R22's decoration reads only those families, and every code it decorated before reads the same `code`, `check` and `translation`.
- **R41** (K656; `agent-worker` R48, N157) The untargeted `op=affordances` answer is `affordances`' R17 answer with two keys added: `fences`, `skills`' `machineFences` over `CHECK_FAMILIES` (K585 (1); the pack's `boundary.fences`, `skills` R3), and `pack`, `skills.renderPack(published)` whole with its `version`, `published` being that same answer with its `fences` (`{catalog, vocabularies, capture_acts, fences}`, and `surfaces`, `recipes` once published). A targeted answer carries neither key. If rendering throws, the answer carries `pack: null` and `pack_absent` (the error's message), never a partial pack, so a reader refuses it (`agent-worker` R48).

**`dispatch(req)`, the record store's door**
- **R26** An empty POST body is `null`, and a body that is not JSON is refused 400 `BAD_JSON`. A route no module serves is refused 400 `unknown op: <op>`. An answer is `{ok: true, result}`. The routes are the modules' own maps (the `membershipOps` pattern).
- **R27** A read whose parameters name a project (the declared `PROJECT_NAMING_READS`), asked with a stamped `viewer` and naming a discoverable project, is answered by `membership.existenceAct` first (C-70.1), before its route runs. The reads declared to name no project are listed with the reason.

## Private

### Uses

- `op-declarations` (K624): `OPS`, `SESSION_OPS`, `NEEDS`, the act lists (R2, R17, R26, R29), `decorateAct` and `ACT_GATE` (for `op=affordances`; `ops.mjs`, the re-export for `legacy-index`'s `op=affordances` and `op=queue` arms, deleted at T19's layer 11).
- `admission` (K624): its gates, called in R28's order, and the caller it admits (class, session, member, viewer, identity, `ai` credential), from which R17 stamps.
- `membership`: `claim` (R15), `existenceAct` (R27), `isAdministrator`.
- `runtime-limits`: `liveToken` (R15).
- `signatures`: the signing page (R1).
- `public-read`: `inbandQuartet` (its R7, was `publication` R16; K651), for the review copy's answer (R20).
- `instance-setup`: `setupPage`, its public group read (R1), the reports' handlers; `instanceSetupOf` and its `start`, `instanceSetupOps` (N348; `plane` R1 since T19's layer-11 fold).
- `skills`: `renderPack`, `machineFences` (R41).
- `affordances`: `ACTS`, `CAPTURE_ACTS`, `PER_ITEM_ACTS`, `VOCABULARIES` for `op=affordances`' answer while its arm is here.
- `record-grammar`: `parseFrontmatter`, `createSha256`, `normalizeType`, `MACHINE_AUTHOR_PREFIX`, `MACHINE_CLASS_PREFIX` (`index.mjs`:7–8 and `pull.mjs`:13 import them from the catalogue today; re-pointed in T19's layer 11).
- `capture`: `CAPTURE_CHECKS` (R22; N347); `pullKnock` (its R65), for R36 (N364).
- `promotion`: `promote`, for R36's promotion of the pulled document (N364).
- `sources` (N364): its op handlers (`sourcedisclose`, `sourcelink`, `sourceconsent`, `sourceconsentwithdraw`) and the no-account door `knockerconsent` (its R11), which this module routes and stamps.
- `action-plans`: `actionPlansOps` (R26), its check table (R22); `planopen`, `plansubjectadd`, `plansubjectremove`, `plan`, `plans`, `optionadd`, `optionrevise`, `optionpropose` (any credential, stamped `proposer`), `optionadopt`, `optiondispose`, `scenarioset`, `checkpointrecord`, `optionstart`, `planclose`, each with `author` and `viewer` stamped (R29; specs in `op-declarations`); `plans` names a project (R27). (T18, K608)
- `action-clocks`: its ops (R26) and check table (R22): `reminderset` and `reminderanswer` (its R4, R6), `author` and `viewer` stamped (R29; specs in `op-declarations`). (T18, K617, K624 (3))
- `filing-templates` and `local-facts` (K921): their ops (R26) and check tables (R22, R43), the specs in `op-declarations` R8, stamped as R29 requires; the template grant's door (R44).
- `actions` and `filings` (routed through their own maps, R26): the op specs and stamps of `actioncreate`, `action`, `actions`, `actionpressure` (`actions` R47, R48) and `communicationprepare` (`filings` R23, stamped `preparer`) (R29; specs in `op-declarations`). (T18, K608)
- Every module whose op handlers or store routes it routes. These uses are declared as each module is extracted (K93).
- `network-notices`: its ops map and its public-read registration (R45; T23). `escalation`, `case-authoring` and `monitoring` already serve their maps here.

### Invariants

- **R28** The gates run in one order, which the tests pin: `admission` R1, R2, R3, then the public ops (R15 among them), then `admission` R8's export refusal, `admission` R5–R6 with R8's session gate, `admission` R7, R9/R10, R11, `admission` R4's scope refusal, then `admission` R12 and R16, and then the op. Nothing is read or written when a gate refuses.
- **R29** No handler receives a caller-supplied value for any stamp (R17). This is tested for every op that declares a stamp.
- **R30** No credential, session token, secret or stack appears in any answer, except the one minting answer of `admission` R13.
- **R31** *(retired: moved to `op-declarations` R6, K617)*
- **R32** Each check moves here as an invariant with its test (K6): C-69.1, C-69.2 and the two internal-error rows R25 adds, C-68.2–C-68.4 and C-66.6. (C-38.1–C-38.8, C-78.1–C-78.3, C-29.6–C-29.10, C-32.17 and C-64.4 moved to `admission` R14 with the gates that raise them, K617, K624.)
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
- **The split** (K617, K624 (1), (2)): taken at T18. `op-declarations` and `admission` build their paths by copy and merge first; this module's job then deletes `ops.mjs`, the admission path and their rows, calls `admission`'s gates in R28's order, and keeps re-exports only for the importers outside the product modules (`legacy-index`'s `decorateAct`, `ACT_GATE`, in `ops.mjs`, deleted in T19's layer 11 with `legacy-index`'s need of it; the old suites, which read source and retire at the next release, K619).
- **Tests.** One arm per refusal code, with a negative control each. R28's order is driven by a request that would fail two gates at once. R29 is driven by sending every stamp field on every declared op.

## Open for Bob

None: answered by Bob 2026-09-26 (K102). The draft's two questions were technical, and BOB #43 decided them (K93): the Durable Object class is this module's once it is extracted (the one place that starts every module and routes their ops; until then `legacy-index` wraps `legacy-store`'s class); and the module stays one module, about 1,610 lines of code, since P6 counts reading and the op declarations are a table (as K85 read it).

## Decided by BOB

- `from`: `legacy-index`, `legacy-store` (`Store.fetch`'s frame, the existence read; membership's map placed it here) and `legacy-checks` (R32). Uses gain `runtime-limits`, `signatures`, `publication`, `instance-setup` and `legacy-checks`.
- `reviewAnswer`, the grant secret and the review door's reader are here, as `build/extraction/review.md` placed them. C-66.6 is here, as `build/extraction/ai-runs.md` placed it.
- C-61.1 (`requiredArgument`), C-68.1 (`storageAbsent`) and C-68.5 (`publishedStoreAbsent`) are not this module's. Each is raised by handlers that move out (`capture`, `publication`, the knock). The earliest of them holds the row, and later ones import it (K78 (3)).
- The legacy root query API (`/?op=`, one old deployment) stays until Bob retires that deployment (P1).
