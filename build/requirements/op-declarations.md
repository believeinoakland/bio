# op-declarations — requirements

**Status** · DRAFT by a worker for BOB #75, 2026-09-30, at T18's opening, for BOB's review; split from `control-plane` by K617 and K624 (1), (2) (a product module whose code passes about 4,000 lines is split before its next job, along seams BOB names, with no change to any requirement's meaning). R1 is `control-plane` R34 and R6 is `control-plane` R31, each moved with its meaning unchanged (only its cross-references re-pointed). R2–R5 state, with ids, the tables `control-plane`'s Terms already defined and its R10, R11, R13, R14 and R17 read (no new behaviour: each states what `ops.mjs` holds today). Layer 11, directly after `instance-setup`, before `admission` and `control-plane`. No `from` (`from` names a legacy module only; K624 (1)): this module's job builds its paths from `bio-plane/src/control-plane/ops.mjs` by copy and merges early; `control-plane`'s own job, after it, deletes its copy and re-points.

**Size (P6).** About 2,110 lines move (`bio-plane/src/control-plane/ops.mjs` whole: `OPS`, the act lists, `SESSION_OPS`, `NEEDS`, `ACT_GATE`, `decorateAct`, `UNATTENDED_BY_DECISION`), most of it a table and its comments; about 150 written with the Action layer's specs (N-A12's share, N-A21). Well under the mark.

## Public

### Purpose

What each op of the instance is: the classes that may reach it, whether it mutates, the stamps and fences it takes, which session reaches it, the capability it needs, and the recorded decisions that a verb is not a person's. It declares; it judges no caller and routes nothing. `admission` and `control-plane` read it.

### Provides

Terms. An **op** is a name the instance answers. An **op spec** is `{classes, machineClasses?, mutating}`; `classes: null` marks a **public** op. A **class** is `admin`, `member`, `probe` or `daemon` (the four binding credentials), `ai` (a minted agent credential), or a session's kind (`admin` for the founder's password session, `member` for every enrolled member). A **stamp** is a field the control plane sets on the request to the handler, from the authenticated caller. A **capability** is membership's (its vocabulary).

**The tables: `OPS`, `SESSION_OPS`, `NEEDS`, `UNATTENDED_BY_DECISION`, the act lists**
- **R2** `OPS` maps every op to its op spec. `classes` is `null` or a list of binding classes and session kinds; `machineClasses`, where given, is the list a caller not arriving by a session is judged against instead. No spec names `ai`: an agent credential is admitted by its task scope alone, never by a row here. *(not yet met: the module is new; the table is `control-plane/ops.mjs`' until this module's job)*
- **R3** `SESSION_OPS` is `{member, admin}`, two sets of op names: the ops a member's own session reaches and the ops the founder's session reaches. `NEEDS` maps an op to the one capability a session needs for it, or `null`; an op with no entry needs none. `UNATTENDED_BY_DECISION` maps an op no session reaches to the citation of the recorded decision that it is addressed to a credential, not a person, and holds no op without one. *(not yet met: new, as R2)*
- **R4** The act lists (`EDGE_ACTIONS`, `STATE_ACTIONS`, `ACTION_ACTIONS`, `GOVERNANCE_ACTIONS`, `IDENTITY_ACTIONS`, `CUSTODIAL_ACTIONS`, the reads' lists and the others `ops.mjs` exports) name, for each op, which stamps the door sets on it and which fences it meets (`GOVERNANCE_ACTIONS` and `IDENTITY_ACTIONS`, the bearer fences). Every op a list names has a spec in `OPS`. *(not yet met: new, as R2)*
- **R5** Every table and list is frozen data, read as it is exported: none is computed from a request, a store or the environment. *(not yet met: new, as R2)*

**The act gate: `ACT_GATE`, `decorateAct(act)`** (read by `affordances.decorate`, its R11, for `op=affordances` and queue R17's `op=queue`)
- **R1** (was `control-plane` R34) `ACT_GATE` is `{needs(id), mode(id)}`, read from the same tables that gate the ops: `needs(id)` answers `NEEDS[id]` (the capability a session needs for the op), or `null` when the op has no row; `mode(id)` answers `session` when the member session set (`SESSION_OPS.member`) holds the op, else `admin-session` when the founder's set (`SESSION_OPS.admin`) holds it, else `machine`. `decorateAct(act)` is `affordances.decorate(act, ACT_GATE)`, and it is the one decoration both `op=affordances` and `op=queue` apply, so an option in the feed equals the act `op=affordances` publishes for that subject. The gate is read only when a request is decorated, after both tables exist.

## Private

### Uses

- `affordances`: `decorate` (its R11), for R1.

### Invariants

- **R6** (was `control-plane` R31) An op spec for every op any module serves, and no spec without a handler or a store route.
- **R7** No I/O, no store, no network, no clock; no place is named in this module's behaviour or outward text (`build/layers.md`, "No jurisdiction in the product"). *(not yet met: new, as R2)*

### Satisfies

- `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (governance acts are a named administrator's own session), §4.10 (the session ops), §5 (capabilities enforced at the op layer).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the `ai` class admitted by its scope, never by a table row; D-199).
- `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §P (an act published with the gate that admits it).
- `docs/architecture/BIO_Action_v0_1.md` (canon whole, K608): the Action layer's ops, each a member's act (§4).
- Bob's rulings K3 and K23; `layers.md` ruling 2 (declarations stay with the door, handlers move); K617, K624.

### Suggestions

- **Paths.** `bio-plane/src/op-declarations/index.mjs`, `ops.mjs`' content as it stands, exporting every name `ops.mjs` exports; tests in `bio-plane/test/m/op-declarations/`. `control-plane/ops.mjs` is left untouched by this job; `control-plane`'s job deletes it and re-exports what `legacy-index` (`src/index.mjs`: `decorateAct`, `ACT_GATE`) and its own files import.
- **The comments that cite `src/control-plane/ops.mjs`** (in `UNATTENDED_BY_DECISION`'s citations) keep their words: a citation names where the decision was recorded, not where the table lives now.
- **Tests.** R1 as `control-plane`'s R34 tests read it today (moved and renamed); R2's no-`ai` row and R3's "no unattended op without a citation" structurally over the tables; R4 every listed op in `OPS`; R6 against the store routes and handlers the door serves (the door's route map is `control-plane`'s, so the totality arm reads it from `control-plane` as `legacy-tests` does, or `control-plane` keeps a test of its own that names this R through its use).
- **For callers.** A module that gains an op asks BOB to add its spec here, one reviewable table (`control-plane`'s Suggestions, "Declarations stay, handlers move").

## Open for Bob

None: the split is BOB's (K617, K624).

## Decided by BOB (for rulings)

- The seam (K624 (2)): what each op is (`ops.mjs`) here; who may call it (`admission`); the door (`control-plane`). The Rs that state a gate's refusal go with the gate (`admission`), and this module's tables are what those gates read.
