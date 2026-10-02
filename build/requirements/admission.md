# admission — requirements

**Status** · DRAFT by a worker for BOB #75, 2026-09-30, at T18's opening, for BOB's review; split from `control-plane` by K617 and K624 (1), (2) (a product module whose code passes about 4,000 lines is split before its next job, along seams BOB names, with no change to any requirement's meaning). R1–R13 are `control-plane` R3–R14 and R19, moved with their meaning unchanged (only their cross-references re-pointed; the old id is named on each); R14 is the admission share of `control-plane` R32's rows (C-38.1–C-38.8, C-78.1–C-78.3, C-29.6–C-29.10, C-32.17, C-64.4), moved with them; R15 states for this module what `control-plane` R33 states for its own. R13's last sentence (D-586) is met, re-checked at T23's opening by BOB #94 (no change of meaning): `aiReachesAsMember` refuses every act R12 refuses a bearer, at the mint (`admission/mint.test.mjs`:16, :36) and at the gate (`admission/admission.test.mjs`:115, :210–211), both passing; T12's control-plane job reported it met (`build/jobs/T12/control-plane.md`), and no inline mark was ever carried. Layer 11, after `op-declarations`, directly before `control-plane`. No `from` (`from` names a legacy module only; K624 (1)): this module's job builds its paths from `bio-plane/src/control-plane/` by copy and merges early; `control-plane`'s own job, after it, deletes its copy and re-points.

**Size (P6).** About 900 lines move: `bio-plane/src/control-plane/index.mjs` ~80–650 (`fingerprint`, `sha256Hex`, `classify`, `scopeFor`, `NAMESPACES`, `namespaceGate`, `SCRATCH_ADDRESSING_PUBLIC_OPS`, `pinnedNamespaceGate`, `confinedNamespaceGate`, `aiCredentialPresented`, `aiConfinementDeclaration`, `AI_TOKEN_SHAPE`, `aiReachesAsMember`, `aiScopeDeclaration`, `aiTaskScope`, `resolveSession`), the row readers of its refusals (~1,000–1,060: `admissionRow`, `namespaceRow`, `machineFenceRow`, `identityFenceRow`), `sessionOpGate` (~1,146–1,240), the admission region of `makeFetch` (`DEC-49 REGION is-admission`, ~1,534–1,725, as a function the door calls), the bearer fences (~2,690–2,712), and their rows from `control-plane/checks.mjs` (`ADMISSION_CHECKS`, `NAMESPACE_CHECKS`, `AI_SCOPE_CHECKS`, `OPERATOR_FENCE_CHECKS`, `GROUP_IDENTITY_FENCE_CHECKS`). Well under the mark.

## Public

### Purpose

Who may call an op of the instance, judged before the op runs: the namespace a request addresses, the class its credential gives, the agent credential's confinement and task scope, the session's reach and capabilities, and the fences a bearer meets. It decides whether a caller is admitted and as whom, and answers a refusal that names why; it never runs an op or answers one.

### Provides

Terms. An **op spec**, a **class**, the **session sets** and a **capability** are `op-declarations`' (its Terms, R2, R3). The **namespaces** are `bio` and `scratch`. A **bearer** is any caller not arriving by a session. Each refusal below is answered by `control-plane`'s door at the status named, relayed as this module gives it; "is refused" means this module's gate answers that refusal, with the code's `check` and `translation` from its row (R14), and nothing is read or written when it does.

**Namespaces, before any credential is judged** (`namespaceGate`, `confinedNamespaceGate`, `pinnedNamespaceGate`)
- **R1** (was `control-plane` R3) A `store=` that is present and not exactly `bio` or `scratch` is refused 400 `NAMESPACE_UNKNOWN` (C-78.1), naming the namespaces. This applies to every caller and to the instance's page at `/`.
- **R2** (was `control-plane` R4) For an `ai` credential minted confined to `scratch`, a named `store=` other than `scratch` is refused 403 `NAMESPACE_CONFINED` (C-78.3), and an absent one is set to `scratch`.
- **R3** (was `control-plane` R5) A public op that answers only from `bio` refuses `store=scratch` with 400 `NAMESPACE_PINNED` (C-78.2). The public ops that do address scratch are declared (`invitelook`, `enroll`, `instancegroup`, `groupidentity`), and every other public op is pinned.
- **R4** (was `control-plane` R6) Admitted callers land as follows: `probe` in `scratch` (a named other namespace is refused 403 `SCOPE_REFUSED`, C-38.6), and every other class in `scratch` when `store=scratch` is given, else `bio`. Every forwarded answer carries `store`, the namespace that answered.

**Authentication** (`classify`, the agent credential's and the session's resolution)
- **R5** (was `control-plane` R7) A `token` equal to the `ADMIN_TOKEN`, `MEMBER_TOKEN`, `PROBE_TOKEN` or `DAEMON_TOKEN` binding (checked in that order) gives that class, but only while the binding is live: set, and not a value ever published (runtime-limits `liveToken`). Any other token gives no binding class.
- **R6** (was `control-plane` R8) A token shaped `aik-<64 hex>` is resolved once per request against `bio`'s credential rows. A known credential gives class `ai` with its principal, scope and confinement. A 64-hex token is resolved as a session through `credentials.session` (its R5) against `bio`; the `aik-` lookup is `credentials.aiCredentialLook` (its R15). A store that does not answer either lookup is answered 502 `STORE_DID_NOT_ANSWER` and never as a statement about the caller.
- **R7** (was `control-plane` R9) A caller with no class is refused 401 `NOT_AUTHENTICATED` (C-38.1).

**Admission, in this order**
- **R8** (was `control-plane` R10) A session reaching a mutating op outside its kind's session set is refused 403. The refusal depends on why. `SESSION_ROLE_CANNOT_REACH_OP` (C-38.7) is used when the other kind's set holds the op, with `reachedBy` set to `founder` or `member`. `MACHINE_CREDENTIAL_REQUIRED` (C-38.3) is used when a recorded decision reserves the op to a credential, and cites that decision. `SESSION_ROUTE_NOT_RECORDED` (C-38.8) is used when no decision is recorded. `capture`'s GET is a read. A session asking for `export` is refused `ROOT_OF_TRUST_REQUIRED` (C-38.4).
- **R9** (was `control-plane` R11) A binding class not in the op's `classes` is refused 403 `CLASS_FORBIDDEN` (C-38.2). For a caller that did not arrive by a session, `machineClasses` is used instead where the spec gives it.
- **R10** (was `control-plane` R12) An `ai` caller is refused `AI_CREDENTIAL_REVOKED` (C-29.7) when its credential is withdrawn. It is refused `AI_BEYOND_TASK_SCOPE` (C-29.6) when no member reaches the op, or when the op is mutating and not among its declared writes.
- **R11** (was `control-plane` R13) A session missing the op's capability is refused 403 `NOT_CAPABLE` (C-38.5), naming `needs` and `held`. A binding class holds no capabilities and is bounded by R9 alone. A session creating a project (a promotion with no base whose promoted type is `project`) without `create_projects` is refused the same 403 `NOT_CAPABLE` (C-38.5), `needs: "create_projects"`, `held` sorted, whatever NEEDS says of `promote` (K723; one site, `projectCreationGate`).
- **R12** (was `control-plane` R14) A bearer (any caller not arriving by a session) asking for a §4 governance act (`adminendorse`, `adminremove`, `membercaps`) is refused 403 `OPERATOR_TOKEN_CANNOT_GOVERN` (C-32.17). Asking for a group-identity act (`groupnameset`, `groupdomainset`), it is refused `GROUP_IDENTITY_NEEDS_SESSION` (C-64.4). Each refusal names the class.

**An agent credential's scope, at the mint** (`aiScopeDeclaration`, `aiConfinementDeclaration`)
- **R13** (was `control-plane` R19) An agent credential's scope is judged when it is minted. An op no spec declares is refused `AI_SCOPE_UNKNOWN_OP` (C-29.8). An op no member reaches is refused `AI_SCOPE_BEYOND_MEMBER_REACH` (C-29.9). A `confinedTo` other than absent or exactly `scratch` is refused `AI_CONFINEMENT_NOT_SCRATCH` (C-29.10). The credential's value and a review grant's secret are generated here, returned once in the minting answer, and passed on only as their SHA-256. An op a bearer is refused by R12 counts as beyond member reach, both at the mint and in R10.

## Private

### Uses

- `op-declarations`: `OPS`, `SESSION_OPS`, `NEEDS`, `UNATTENDED_BY_DECISION`, `GOVERNANCE_ACTIONS`, `IDENTITY_ACTIONS` (R3, R8–R13).
- `runtime-limits`: `liveToken` (R5).
- `credentials`: `session` (its R5) and `aiCredentialLook` (its R15) (R6), through the store's routes.

### Invariants

- **R14** (the admission share of `control-plane` R32) Each check moves here as an invariant with its test (K6): C-38.1–C-38.8, C-78.1–C-78.3, C-29.6–C-29.10, C-32.17 and C-64.4.
- **R15** No credential, session token or secret appears in any refusal this module answers, and no place is named in its behaviour or outward text (the door's own rule, applied to this module's share).
- **R16** (K723; was control-plane's `caseReader`) `readerOf` answers who is asking for a public op that answers working material only to some (op=instancegroup's whole row, op=groupidentity's claim, an unsigned case document, a review copy without a secret), and never refuses: a binding class stands as `class:<cls>` exactly when `OPS.index` admits that class and R4 lands it in the store the op reads; a live session as its viewer (the founder's `admin`, else `member:<id>`); an agent credential as its principal when R10 admits it to `index`; anyone else, an unknown or expired credential included, as no one (`""`). A store that does not answer a lookup is a silence (R6), never a statement about the caller.

### Satisfies

- `docs/architecture/BIO_Membership_Architecture_v2.md` §4.6 (the root of trust: export), §4.9 (governance acts are a named administrator's own session), §4.10 (the session ops), §5 (capabilities enforced at the op layer).
- `docs/architecture/BIO_Distribution_v0_1.md` §6 rung 6 (namespaces and confinement: D-325, D-456, D-461, D-463).
- `docs/architecture/BIO_Publication_v0_1.md` §7 points 2–3 (the identity acts, a session's own).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the `ai` class, its principal and scope; D-199).
- Bob's rulings K3 and K23; `layers.md` ruling 2; K617, K624.

### Suggestions

- **Paths.** `bio-plane/src/admission/` (e.g. `index.mjs` with the gates, `checks.mjs` with the five row families); tests in `bio-plane/test/m/admission/`. `control-plane`'s files are left untouched by this job; `control-plane`'s job, after it merges, deletes its copy, calls these gates from `makeFetch` in `control-plane` R28's order, and re-exports what `legacy-index` and old tests import.
- **Answers.** The gates return the refusal (or `null` to admit); the door wraps it in its envelope, so this module needs neither `json` nor `control-plane`'s store reader. R6's store lookups take the store reader (`doAnswer`) as a parameter, as `affordances.decorate` takes the gate, so this module uses nothing later in the order; the 502 answer stays the door's sentence (`control-plane` R23).
- **The DEC-49 regions** (`is-admission`, `is-session-op-gate`) move with their code, and each row's `where` is re-pointed by this job (stamped by 1.49.0).
- **Tests.** One arm per refusal code with a negative control each, moved from `test/m/control-plane/` where they name R3–R14 and R19, renamed to this file's ids; R4 at the gate (`scopeFor`) and, for the landing, through the door in `control-plane`'s own tests.

## Open for Bob

None: the split is BOB's (K617, K624).

## Decided by BOB (for rulings)

- The seam (K624 (2)): the credential and admission path is this module's, each gate with the R that states its refusal; the op tables it reads are `op-declarations`'; the door, the stamps (`control-plane` R17, R18, R29), the bootstrap claim (R15), the replay (R16), the review doors (R20) and the gate order (R28) stay `control-plane`'s.
- R32's rows split with the gates that raise them: the admission families here (R14); C-69.1, C-69.2, the internal-error rows, C-68.2–C-68.4 and C-66.6 stay `control-plane`'s.
