# actions — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, from `build/plan/action-design/deltas.md` §2 and `tests.md` (K590, K597, K600, K608), against `build/requirements/actions.md` on `tranche/T17` (highest id R44, DEC-13's, K603). Ids final. Renumbered from the draft by K603: draft R44 → **R45**, R45 → **R46**, R46 → **R47**, R47 → **R48**, R48 → **R49**. **R50** is new here (a gap in the draft: the overdue read the queue needs). Applied to `build/requirements/actions.md` at the fold, with its Status line gaining: "Action layer folded 2026-09-30 (K608): R7, R8, R9 amended; R45–R50 added; not yet met: R7's `completed`, R8's override, R9's arms, R45–R50."

## Replacements

**R7** — current line:

> - **R7** Five C-2.10 arms are enforced at the write (C-101): a kind outside R10's set; a tier outside the vocabulary; a counterparty that is a bare string, the placeholder "to be named", or incoherent (R9); `resolved` with no resolution from `complied`, `denied`, `escalated`, `withdrawn`; a clock entry without the `{text, description}` shape, a `YYYY-MM-DD` date, a basis, or a status from the four. A missing counterparty block, and a pending entry past its date, still land and are reported by the audit (R37). *(not yet met: D-717)*

becomes:

> - **R7** Five C-2.10 arms are enforced at the write (C-101): a kind outside R10's set; a tier outside the vocabulary; a counterparty (the addressee, R9) that is a bare string, the placeholder "to be named", or incoherent (R9); `resolved` with no resolution from `complied`, `denied`, `escalated`, `withdrawn`, `completed`; a clock entry without the `{text, description}` shape, a `YYYY-MM-DD` date, a basis, or a status from the four. `completed` is allowed on any kind: the action was carried out and no counterparty's answer decides it; the action's own outcome (R26, DEC-14) says what happened, and an impact claim still needs a leg outside the group's own actions. A missing counterparty block, and a pending entry past its date, still land and are reported by the audit (R37). *(not yet met: `completed`, D3, K590)*

(R13's `NO_RESOLUTION` "without one of the four" reads "without one of R7's five"; C-33.3's and C-101.4's translations name `completed`.)

**R8** — current line:

> - **R8** An action whose document states `breach: true` (one recorded for an escalation's stage 2, 5 or 7, `escalation` R9) rests on a conformance determination: it carries at least one `rests_on` leg naming a live determination (`conformance.determinationRead`) the author may see, else `ACTION_NO_DETERMINATION`; a superseded determination is refused `DETERMINATION_SUPERSEDED` (`conformance.determinationSuperseded`, its R20; N312). A leg's `rests_on` target may be a determination, an information item or an inquiry; an action is never a leg's target. *(not yet met: layer 9's contract, …)*

becomes:

> - **R8** An action whose document states `breach: true` (one recorded for an escalation's stage 2, 5 or 7, `escalation` R9) rests on a conformance determination: it carries at least one `rests_on` leg naming a live determination (`conformance.determinationRead`) the author may see, else `ACTION_NO_DETERMINATION`; a superseded determination is refused `DETERMINATION_SUPERSEDED` (`conformance.determinationSuperseded`, its R20; N312). Neither refusal applies when the document states `premise_override: {reason}` (reason at most 500 characters, R14's text rule) on the creation or revision that first sets `breach: true`, authored by a member: a machine or unstamped author stating or changing one is refused `MACHINE_CANNOT_OVERRIDE`. The override is stamped with who and when, never edited or removed (`PREMISE_OVERRIDE_REWRITTEN`), shown in the read (R25), and carried as a disclosure on everything prepared from the action (`filings` R24); an overridden action is never attached to an escalation (`escalation` R23). An action that seeks evidence (no `breach: true`) is never asked. A leg's `rests_on` target may be a determination, an information item or an inquiry; an action is never a leg's target. *(not yet met: the override, K600 (a))*

**R9** — current line:

> - **R9** `counterparty` is `{state: named, role, body, level?, entity_id?}` or `{state: undetermined, basis}`: an office named by official role and body, never a person (`jurisdictions` R24). Named with no role or body, undetermined with no basis, undetermined carrying a role, body or entity id, the placeholder anywhere, or an `entity_id` not of the registry's `ENT-YYYY-NNNN` form or naming a person, is refused (C-2.10, R7). A counterparty written before as `{state: named, name}` reads as written, its `name` as the office's. *(not yet met: layer 9 and `jurisdictions` R24; only `{state, name, entity_id?, basis}` exists today, D-130)*

becomes:

> - **R9** `counterparty` is the action's **addressee**, one of: `{state: named, kind?: office, role, body, level?, entity_id?}` (an office by official role and body, `jurisdictions` R24; `kind` absent reads `office`); `{state: named, kind: press | organisation | group, role, organisation}` (a reporter by role and outlet, an organisation or another civic group by role and organisation); `{state: audience, description}` (a described audience, at most 500 characters); `{state: undetermined, basis}`. Never a private individual. Named with no role, or an office with no body, a named non-office with no organisation, an audience with no description, undetermined with no basis, undetermined carrying a role, body, organisation or entity id, the placeholder anywhere, or an `entity_id` not of the registry's `ENT-YYYY-NNNN` form or naming a person, is refused `COUNTERPARTY_REFUSED` (C-2.10, R7), its findings naming the arm. A breach action (R8) addresses an office, else `ADDRESSEE_NOT_AN_OFFICE`. A counterparty written before as `{state: named, name}` reads as written, its `name` as the office's. R3's and R27's matching name is "role, body" for an office, "role, organisation" for the other named arms, and none for an audience. *(not yet met: the arms beyond an office, D1, K590; an `entity_id` naming a person, which needs the entities registry, not in this module's uses: ACTIONS #1's deferral)*

## Additions (after R44, in "Services later modules use" unless stated)

- **R45** (D5, K590) An action may state `contact`, a member id: the group's contact for it. Only a member sets or changes it (`MACHINE_CANNOT_SET_CONTACT`); an id that names no member of the instance is refused `CONTACT_NOT_A_MEMBER`. It is shown in the read (R25) and grants nothing. *(not yet met: new)*
- **R46** (Bob's ruling 1 of 2026-09-29, K590) An action may state `plan` (a `PLN-` id) and `option`, set only on its creation and never changed or removed by a revision (`PLAN_LINK_REWRITTEN`); they are shown in the read (R25). This module does not read the plan (it is later in the order); `action-plans` R18 sets them. *(not yet met: new)*
- **R47** (BOB) `actionCreate({document, author, viewer})` (`op=actioncreate`) is the same write as a promotion of an action document (R1–R11, R44–R46 at the act), answered `{ok, id}`; its refusals are the promotion's. `op=action` answers R29's `actionRead` and `op=actions` R30's `actionsFor`, each with the viewer the control plane stamps. *(not yet met: new)*
- **R48** (K597 (1): prepared for opposition) A `received` correspondence entry may be marked `pressure: {kind: legal | retaliation | discrediting | other, note}` (note at most 500 characters, R22's text rule): a threat, retaliation, discrediting or legal harassment directed at the group or its supporters (Operational Principle 8, Design Requirement 13). It is stated as a key of `actionCorrespond` (R15) when the entry is recorded, or later by `actionPressure({target, ord, pressure, author, viewer})` (`op=actionpressure`), which appends the mark to a table of its own and never rewrites the entry (R34). Only a member marks it (`MACHINE_CANNOT_MARK_PRESSURE`); a mark on a `sent` or `no_response` entry is refused `PRESSURE_NOT_RECEIVED`, one on an entry already marked `PRESSURE_MARKED`. The read (R25) lists an action's pressure entries apart; `actionsFor` takes `pressure: true` to list only actions holding one. It is evidence like any capture and may be cited by an inquiry. *(not yet met: new)*
- **R49** (K597 (3), K600 (b): the venue sets the standard) No action is refused for the capture grade of what it rests on; no requirement of this module compares a grade with a floor. The grades are shown where the group prepares what it sends (`filings` R25). *(not yet met: new; met by the absence of any grade check, tested by a Grade B leg on a breach action landing)*
- **R50** (monitoring R34's "its action's members are told"; for `queue-producers` R15) `overdueClocks({after?, limit?, viewer})` lists every clock entry of a visible action that is not `resolved` or `abandoned` whose status is `overdue`, or `pending` with a date before the UTC day of the instance clock: action, entry position, date, basis, text, the action's project and the member who created it; at most 500 per page in (action id, entry position) order with `cursor` and `truncated` as R31's. Writes nothing. *(not yet met: new)*

## Satisfies (replace)

Current:

> - `BIO_Case_Making_v0_1.md` §2 (`action` is the impact substrate: risk tier, D-182, REC-214, the fee quote D-148, the governing laws D-149, REC-195, the records-request lifecycle D-147).

becomes:

> - `BIO_Action_v0_1.md` (canon whole, K608): §3 (the Action construct), §4 rules 2, 5, 6, 7, 12 and 13, §5 rows 1, 4–8, 16; the rulings Case Making §2 records stand (risk tier D-182, REC-214, the fee quote D-148, the governing laws D-149, REC-195, the records-request lifecycle D-147).

## Stale marks (BOB strikes at the fold; checked 2026-09-30 against the code and `test/m/actions/`)

- The Status line's "Not yet met: R4 … R41 (K102)" sentence: replaced by the sentence above.
- Struck as met (ACTIONS #1 J3, K253: "every plan entry applied", 41 of 41 live ids named by tests; ACTIONS #2, K370; no `test.todo` left in `test/m/actions/`): R4, R5, R6, R7 (its D-717 mark; the new mark above replaces it), R8 (its layer-9 mark; test `write.test.mjs` "R8 …", `t11`, `t12`), R10, R11 (`extent_capture` projected), R22 (`LIFECYCLE_TOKEN_MALFORMED` C-94.12 exists), R28, R29, R30, R32, R33 (`CLOCK_STATUS_NOT_MECHANICAL` exists), R40 (affordances and `setup.mjs` import the vocabulary from `src/actions/checks.mjs`; `legacy-checks`' held copy is catalogue work, not this requirement), R41 (`governingLawsOf`'s sentence names no law).
- **Not simply struck:** R9 keeps the mark above (the person arm, deferred by ACTIONS #1). R31's mark "(layer 10's contract, 'watches the actions' clocks')" is met by `pendingClocks` itself; what the contract still lacks is the caller (`scheduler`'s `deadline-recheck` consumer, T18), so the mark moves to monitoring R34 and is struck here.
