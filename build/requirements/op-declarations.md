# op-declarations — requirements

**Status** · DRAFT by a worker for BOB #75, 2026-09-30, at T18's opening, for BOB's review; split from `control-plane` by K617 and K624 (1), (2) (a product module whose code passes about 4,000 lines is split before its next job, along seams BOB names, with no change to any requirement's meaning). R1 is `control-plane` R34 and R6 is `control-plane` R31, each moved with its meaning unchanged (only its cross-references re-pointed). R2–R5 state, with ids, the tables `control-plane`'s Terms already defined and its R10, R11, R13, R14 and R17 read (no new behaviour: each states what `ops.mjs` holds today). Layer 11, directly after `instance-setup`, before `admission` and `control-plane`. No `from` (`from` names a legacy module only; K624 (1)): this module's job builds its paths from `bio-plane/src/control-plane/ops.mjs` by copy and merges early; `control-plane`'s own job, after it, deletes its copy and re-points. Filing templates and local facts (K921, K922 (3)) folded for T21 by a worker for BOB #86, 2026-10-01, before layer 11, as `actionhold` was (K902, K919): R8 (the new ops' specs) added, not yet met; `templates` and `templatesave` keep their specs, now served by `filing-templates` and `filings` R32. T22's ops (K1019, K1023), by a fold worker for BOB #91 on `tranche/T22`, 2026-10-02: R9 (their specs, in R8's form) added, not yet met; R6 words the store-internal exemption (`monitorlook`, `doorbellrefused`; K1037), met as the tables stand. T23, by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02: R10 (the specs of T23's ops: N485's `escalationreasondraft`, `whatchangedpropose`, `whatchangeddrafts`; monitoring's `sweeps`; network-notices' `noticeprepare`, `noticepost`, `notices` and its three public reads) added, not yet met (T23 L11). N518 (DEC-113's server side; K1134 (3), K1251), by a worker for BOB #103 at T27's opening, 2026-10-02: R12 (the specs of `actionholdrelease`, `actionholdpreview` and `projectholds`) added; not yet met (T27).

**Size (P6).** About 2,110 lines move (`bio-plane/src/control-plane/ops.mjs` whole: `OPS`, the act lists, `SESSION_OPS`, `NEEDS`, `ACT_GATE`, `decorateAct`, `UNATTENDED_BY_DECISION`), most of it a table and its comments; about 150 written with the Action layer's specs (N-A12's share, N-A21). Well under the mark.

## Public

### Purpose

What each op of the instance is: the classes that may reach it, whether it mutates, the stamps and fences it takes, which session reaches it, the capability it needs, and the recorded decisions that a verb is not a person's. It declares; it judges no caller and routes nothing. `admission` and `control-plane` read it.

### Provides

Terms. An **op** is a name the instance answers. An **op spec** is `{classes, machineClasses?, mutating}`; `classes: null` marks a **public** op. A **class** is `admin`, `member`, `probe` or `daemon` (the four binding credentials), `ai` (a minted agent credential), or a session's kind (`admin` for the founder's password session, `member` for every enrolled member). A **stamp** is a field the control plane sets on the request to the handler, from the authenticated caller. A **capability** is membership's (its vocabulary).

**The tables: `OPS`, `SESSION_OPS`, `NEEDS`, `UNATTENDED_BY_DECISION`, the act lists**
- **R2** `OPS` maps every op to its op spec. `classes` is `null` or a list of binding classes and session kinds; `machineClasses`, where given, is the list a caller not arriving by a session is judged against instead. No spec names `ai`: an agent credential is admitted by its task scope alone, never by a row here.
- **R3** `SESSION_OPS` is `{member, admin}`, two sets of op names: the ops a member's own session reaches and the ops the founder's session reaches. `NEEDS` maps an op to the one capability a session needs for it, or `null`; an op with no entry needs none. `UNATTENDED_BY_DECISION` maps an op no session reaches to the citation of the recorded decision that it is addressed to a credential, not a person, and holds no op without one.
- **R4** The act lists (`EDGE_ACTIONS`, `STATE_ACTIONS`, `ACTION_ACTIONS`, `GOVERNANCE_ACTIONS`, `IDENTITY_ACTIONS`, `CUSTODIAL_ACTIONS`, the reads' lists and the others `ops.mjs` exports) name, for each op, which stamps the door sets on it and which fences it meets (`GOVERNANCE_ACTIONS` and `IDENTITY_ACTIONS`, the bearer fences). Every op a list names has a spec in `OPS`.
- **R5** Every table and list is frozen data, read as it is exported: none is computed from a request, a store or the environment.

**The act gate: `ACT_GATE`, `decorateAct(act)`** (read by `affordances.decorate`, its R11, for `op=affordances` and queue R17's `op=queue`)
- **R1** (was `control-plane` R34) `ACT_GATE` is `{needs(id), mode(id)}`, read from the same tables that gate the ops: `needs(id)` answers `NEEDS[id]` (the capability a session needs for the op), or `null` when the op has no row; `mode(id)` answers `session` when the member session set (`SESSION_OPS.member`) holds the op, else `admin-session` when the founder's set (`SESSION_OPS.admin`) holds it, else `machine`. `decorateAct(act)` is `affordances.decorate(act, ACT_GATE)`, and it is the one decoration both `op=affordances` and `op=queue` apply, so an option in the feed equals the act `op=affordances` publishes for that subject. The gate is read only when a request is decorated, after both tables exist.

**The specs of K921's ops**
- **R8** (K921; `filing-templates`, `local-facts`) `OPS` holds a spec for each op the two modules serve, each in `SESSION_OPS.member` and `SESSION_OPS.admin`, with `NEEDS` `contribute` for every mutating op not reached by a secret, and the stamps the act lists name:
  - member acts, mutating, classes `admin`, `member`, `probe`, `author` (or `by`) and `viewer` stamped: `templatedraft`, `templaterevise`, `templatesubmit`, `templatereviewgrant` (with `secretSha`, the grant's digest, as `reviewgrant`), `templategrantrevoke`, `templateapprove`, `templateretire` (`filing-templates` R3, R4, R7, R8, R10, R11) and `factconfirm` (`local-facts` R1);
  - `templatepropose`, mutating, any credential (an `ai` credential by its scope), `proposer` and `viewer` stamped (`filing-templates` R6);
  - the grant's doors, `classes: null` as `reviewcomment` and `reviewcopy` (a member by session, a recipient by the secret, `control-plane` R44): `templatereview` and `templatecomment` mutating, `templateread` and `templatecomments` reads;
  - reads, not mutating, classes `admin`, `member`, `probe`, `viewer` stamped: `templates` (now `filing-templates` R14), `factstatus`, `factsdue` (`local-facts` R2, R4).

  R6 holds over them.

**The specs of T22's ops** (K1019, K1023)
- **R9** `OPS` holds a spec for each op T22 adds, each in `SESSION_OPS.member` and `SESSION_OPS.admin`, with `NEEDS` `contribute` for every mutating op, and the stamps the act lists name:
  - `declinetoescalate` (`escalation` R27) as `escalationopen`: mutating, classes `admin`, `member`, `probe`, in escalation's act list, so `author` and `viewer` are query-stamped (`escalation` R25); `escalationstatus` (`escalation` R28) as `escalationsdue`: a read, classes `admin`, `member`, `probe`, `viewer` stamped;
  - `capture`'s `heldsetaside` and `heldrestore` (its R79, R81): mutating, classes `admin`, `member`, `probe` (capture refuses a machine author itself, `MACHINE_CANNOT_SET_ASIDE`), `by` and `viewer` stamped; `heldcaptures` and `gradenote` (its R77, R76): reads, classes `admin`, `member`, `probe`, `viewer` stamped; `doorbelltally` (its R80): a read for a member session only, classes `admin`, `member` and `machineClasses: []`, as `knocksof`, `viewer` stamped;
  - `monitoring`'s `addressfrequencyset` (its R52): mutating, classes `admin`, `member`, `probe`, `author` and `viewer` stamped.

  None is declared for `doorbellrefused` (R6). R6 holds over them.

**The specs of T23's ops** (N485: K1025, K1035, K1051; the link sweep: K1094; network-notices: DEC-111, K1031, K1100)
- **R10** `OPS` holds a spec for each op T23 adds, each in `SESSION_OPS.member` and `SESSION_OPS.admin` unless it is public, with `NEEDS` `contribute` for every mutating op a member's session reaches, and the stamps the act lists name:
  - `escalationreasondraft` (`escalation` R29, R25) as `escalationstatus`: a read, classes `admin`, `member`, `probe`, `viewer` stamped;
  - `whatchangedpropose` (`case-authoring` R39): mutating, any credential (an `ai` credential by its scope), as `templatepropose`, `proposedBy` and `viewer` stamped; `whatchangeddrafts` (`case-authoring` R39): a read, classes `admin`, `member`, `probe`, `viewer` stamped;
  - `sweeps` (`link-sweep` R9; declared for `link-sweep`'s map): a read for a member session, classes `admin`, `member`, `probe`, `viewer` stamped;
  - `noticeprepare` (`network-notices` R1, R2; it writes nothing), `notices` (its R22) and `directorysubmission` (its R23; as `notices`, no `NEEDS` row; K1166 (1)): reads, and `noticepost` (its R4, R5): mutating; each for a member session only, classes `admin`, `member` and `machineClasses: []` (no machine, AI credential or operator token posts a notice, `network-notices` R1, R24), `by` (or `viewer`) stamped;
  - the public reads `network-notices` registers through `public-read` R18 (its R10 `activityMethod`, R20 `noticesPublic`, R21 `groupKeysPublic`): `classes: null`, not mutating, nothing stamped.

  R6 holds over them.

**The spec of T24's op** (N490, DEC-115, K1134)
- **R11** `OPS` holds a spec for each op T24 adds, in `SESSION_OPS.member` and `SESSION_OPS.admin`: `optionstartpreview` (`action-plans` R37; it writes nothing), a read, classes `admin`, `member`, `probe`, `author` and `viewer` stamped; R6 holds over it.

**The specs of the litigation hold's ops** (N518; DEC-113, K1134 (3))
- **R12** `OPS` holds a spec for each op N518 adds, each in `SESSION_OPS.member` and `SESSION_OPS.admin`, with the stamps the act lists name:
  - `actionholdrelease` (`actions` R56): mutating, classes `admin`, `member`, `probe` as `actionhold`'s, `NEEDS` `contribute`, in `ACTIONS_ACTIONS` beside `actionhold`, so `author` and `viewer` are stamped;
  - `actionholdpreview` and `projectholds` (`actions` R57, R58): reads, classes `admin`, `member`, `probe`, `viewer` stamped, each with a `NEEDS` row of no capability (`null`, as `optionstartpreview`'s), since `affordances` names them (its R33).

  R6 holds over them. *(not yet met: T27)*
- **R13** (DEC-116, DEC-100; `docket` R1–R8, R12; N520) `OPS` holds a spec for each op `docket` adds, each in `SESSION_OPS.member` and `SESSION_OPS.admin` unless it is public, with `NEEDS` `contribute` for every mutating op a member's session reaches, and the stamps the act lists name:
  - `docketfile` (`docket` R1, stamped `author` and `viewer`), `docketpressure` (its R2, `author` and `viewer`), `docketdecline` (its R7, `by`) and `docketpost` (its R5, `by`): mutating; `docket` (its R3), `docketprepare` (its R4; it writes nothing; `viewer` and `by`) and `docketinvitation` (its R8): reads; each for a member session only, classes `admin`, `member` and `machineClasses: []` (no machine, AI credential or operator token files, places, declines or signs a docket entry, `docket` R1, R4, R18), `viewer` (or `author`, `by`) stamped;
  - the public reads `docketpublic` and `docketfeed` (`public-read` R21; `docket` R14, R15): `classes: null`, not mutating, nothing stamped.

  R6 holds over them. *(not yet met: T27)*

## Private

### Uses

- `affordances`: `decorate` (its R11), for R1.

### Invariants

- **R6** (was `control-plane` R31) An op spec for every op any module serves, and no spec without a handler or a store route. A store-internal route, which the plane calls only from within itself and which is never a public op, is not served to a caller and has no spec: `monitoring`'s `monitorlook` and `capture`'s `doorbellrefused` (the Worker's count of a knock it refused before the store, `capture` R80; K1037).
- **R7** No I/O, no store, no network, no clock; no place is named in this module's behaviour or outward text (`build/layers.md`, "No jurisdiction in the product").

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
