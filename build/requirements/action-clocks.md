# action-clocks — requirements

**Status** · DRAFT by a worker for BOB #75, 2026-09-30, at T17's close, for BOB's review and Bob's approval (a product module, P17). Split from `actions` by K617 (a module whose code, or whose job, would pass about 4,000 lines is split before its next job, along seams BOB names, with no change to any requirement's meaning): R1 is `actions` R31, R2 is `actions` R32, R7 is `actions` R35, each moved with its meaning unchanged (only its cross-references re-pointed, and its old mark struck as met: ACTIONS #1 J3, K253; ACTIONS #3, K401; K611); R3 is the Action fold's `actions` R50 (`overdueClocks`, K611), placed here before it was built; R4–R6 and R8 are the reminders Bob ruled (DEC-94, K613 (1), K614, K615), drafted from the Action design's `deltas.md` §2 and §4 and `action-plans` R29 as restaged after K615; R9 states for this module what `actions` R36 and R39 state for its own. Layer 9 (Action), directly after `actions`, before `filings` (which uses R2). No `from` (`from` names a legacy module only; the queue split's precedent, K531): this module's job writes the code in its own paths and removes it from `actions`' in the same job. Not yet met: R3–R6, R8 (new, K608, K614) and R9 (the tables move with the split).

**Size (P6).** About 170 lines of `actions`' code move here (`bio-plane/src/actions/index.mjs`: `pendingClocks` and its bounds :63–66, :1868–1914; `clockPropose` :1962–1995; `computeDeadline` :2056–2088; the `clock` subject of `proposalLabelFor` :2033–2060; `schema.mjs`:185–199, the `action_clock_proposals` table, and its name in `ACTIONS_TABLES`; `checks.mjs`:1123–1128, `PENDING_CLOCKS_BAD_BEFORE`), with the tests that name R31 and R32 (`test/m/actions/read.test.mjs` "R31 …" and "R32 …", `t11.test.mjs` "R31 …", `t12.test.mjs` "R31 (N311) …", and the share of `fixture.mjs` they need). R3–R6 add an estimated 350–500. About 500–700 in all: well under the mark, and `actions` keeps about 3,330 plus the fold's R7–R9 and R45–R49.

## Public

### Purpose

The deadlines on the group's actions, read across actions: which clock entries are pending and which have passed, the entries a profile's deadline would give (counted in calendar days, or business days on the profile's holiday calendar), and the reminders a member asks for on them. An action's clock is written in its own document (`actions`); this module reads it, proposes entries apart, and holds the members' reminders, which fire as asked and never otherwise. A member states every entry and every reminder; a machine proposes an entry and nothing else.

### Provides

Terms. An **action**, its document and its **clock entry** (`{text, description, date, basis, status}`, status `pending`, `met`, `overdue`, `waived`) are `actions`' (its Terms). An entry's **position** is its index in the document's `clock[]`. A **day** is a `YYYY-MM-DD` UTC calendar day; an entry is past on a day after its date (a deadline is met by anything on its day, `actions` R12). A refusal is `{ok: false, reason, ...}`; a catalogue-backed one also carries `code`, `check` and `translation`.

**pendingClocks({before, after?, limit?, viewer})** (`monitoring`'s read)
- **R1** `pendingClocks({before, after?, limit?, viewer})` refuses a `before` that is not a date `PENDING_CLOCKS_BAD_BEFORE` (its own row; K368), and otherwise lists every `pending` clock entry dated before `before` across visible actions: action, entry position, date, basis, text, and whether it is past at `before`; at most 500 per page, `truncated` stated. This is the read `monitoring` watches. (N237, N311) A page runs in (action id, entry position) order after `after`, a previous page's `cursor` or an action id (read as after all that action's entries), reads at most 500 actions, and may end inside an action; `cursor` is the last entry answered (`<action>#<position>`) when `truncated`, else null, and when the 500-action bound ends a page past an action with no qualifying entry, `cursor` is that action's last position, so a page always moves on; so every entry is reached by paging from the start through each `cursor` to null (ACTIONS #3 J1, K401).

**clockPropose({target, rule, proposer, viewer})**
- **R2** `clockPropose({target, rule, proposer, viewer})` offers a clock entry computed from a profile deadline (`jurisdictions` R26) that applies to the action's kind: the start from the event the rule names in the ledger, the date by `days` and `count` (`calendar` only; a `business` count by the profile's holiday calendar, `jurisdictions` R33, and undetermined with why when the calendar does not cover the period; a start the ledger does not hold is `undetermined` with why), and `basis` the rule's citation and its profile basis. It is stored apart, labelled as `actions` R19's proposals are (machine work, a member's, or unstated), and never written into `clock[]`; a member states a clock entry by a revision of the action. Refusals in order: `NO_AUTHOR` (no stamped proposer); `NO_TARGET`; an absent `rule`; `NO_SUCH_BUNDLE` (absent and invisible alike); `NOT_AN_ACTION`; `NO_SUCH_RULE` (no active profile states a deadline of that rule for the action's kind, naming both). An absent `rule` is either its own refusal `NO_RULE` at that place, its row held and a test driving it, or has no code of its own and is answered `NO_SUCH_RULE` at that code's place; either meets this requirement (N246).

**overdueClocks({after?, limit?, viewer})** (`queue-producers`' read)
- **R3** (monitoring R34's "its action's members are told"; for `queue-producers` R15) `overdueClocks({after?, limit?, viewer})` lists every clock entry of a visible action that is not `resolved` or `abandoned` whose status is `overdue`, or `pending` with a date before the UTC day of the instance clock: action, entry position, date, basis, text, the action's project and the member who created it; at most 500 per page in (action id, entry position) order with `cursor` and `truncated` as R1's. Writes nothing. *(not yet met: new; the Action fold's `actions` R50, K611, K617)*

**Reminders a member asks for** (DEC-94 (1)–(4); K613 (1), K614, K615; `BIO_Action_v0_1.md` §4 rule 5)
- **R4** An action's document may state `reminders`: a list of `{entry, on}`, each a member's own request to be reminded of the dated clock entry at position `entry` on the day `on` (`YYYY-MM-DD`). This module registers a check with `promotion` (its R39) for action documents: a creation or revision that adds, changes or removes a reminder is refused `MACHINE_CANNOT_SET_REMINDER` when its author is a machine or unstamped; one whose `entry` names no clock entry with a `YYYY-MM-DD` date, or whose `on` is not a date, is refused `REMINDER_REFUSED`, its findings naming the arm; a document with more than 50 reminders is refused `REMINDER_REFUSED`. Each reminder is held with the member who set it (the author of the write that added it) and when. A member changes or removes one at any time by a revision; a reminder is set when a dated option is chosen (`action-plans` R29), from defaults the member sees and can change at that moment (nothing preselected unseen, DEC-77), or later. `remindersFor({action, viewer})` answers an action's reminders, each with its entry, its day, who set it and its state (`waiting`, `due` or `answered`); an absent or invisible action answers `actions.noSuchAction` (its R43). *(not yet met: new)*
- **R5** `remindersDue({nowMs, after?, limit?, viewer})` lists every reminder whose day has come at `nowMs` (its `on` at or before the UTC day of `nowMs`) and that is not answered, on an entry still `pending` of a visible action not `resolved` or `abandoned`: action, entry position, the entry's date, basis and text, the reminder's day, the member who set it and the action's project; at most 500 per page in (action id, entry position, day) order, with `cursor` and `truncated` as R1's. It is the one read `queue-producers` uses for its reminder (its R18). Writes nothing. *(not yet met: new)*
- **R6** `reminderAnswer({target, entry, on?, author, viewer})` (`op=reminderanswer`): the member who set a due reminder answers it, with `on` another reminder on that later day, or without it no further reminder (DEC-10, recorded in `NOTIFICATIONS.md` at D-125); a further reminder is one the member accepts, perhaps at the system's suggestion (DEC-94 (1)). Refusals in order: `MACHINE_CANNOT_SET_REMINDER`; `NO_SUCH_ACTION` (`actions.noSuchAction`); `NO_SUCH_REMINDER` (no due, unanswered reminder on that entry set by the author); `REMINDER_REFUSED` (`on` not a date, or not after the UTC day of the instance clock). Otherwise it records the reminder answered and, with `on`, adds the new one, by a revision of the action promoted under R4's check, and answers `{ok, target, entry, answered, next: on | null}`. *(not yet met: new)*

## Private

### Uses

- `actions`: `noSuchAction` (its R43; R4, R6); the action's visibility, document and lifecycle state (`actionRead`, its R29); R12's clock rule (`actionClockNext`, `actionFacts`; R1, R3); R33's bound on the one mechanical clock write, which R1's reader (`monitoring` R44) keeps.
- `jurisdictions`: `combine`'s view: `deadlines` (its R26) and `holidays` (its R33) (R2).
- `record-core`: `stampInstant`, `transact`, `getSetting` (the active profiles), the `bundles` read contract, `declarePurge` (R9).
- `membership`: `viewerPredicate` (R1–R6).
- `promotion`: `registerStep` (R4's check), `promote` (R6's revision).
- `retrieval`: the projection's `action_clock_next` column (its R61), which R1's page seeks, as `actions` R31 did.
- `legacy-checks`: `parseFrontmatter`, `normalizeType`, `isMachineIdentity`.

### Invariants

- **R7** Every deadline carries the statute, order or commitment it comes from; no date is computed into the record; overdue is derived at read time, and a stored `overdue` status (I-11's mark, `actions` R33) is reported beside the derivation, never in place of it (Functional Architecture Layer 3 Function 5; Operational Principle 3).
- **R8** Nothing reminds that no member asked for (DEC-69): a nearing deadline changes an item's position, colour or wording only, which is display and mints nothing here (DEC-94 (2)); "due within N days" is not new unless the member asked for it; no outside channel (email, push) is used (DEC-94 (3)). A machine never sets, changes or answers a reminder, and this module never adds, removes or re-dates a clock entry (`actions` R33). *(not yet met: new)*
- **R9** Every read answers an invisible action as an absent one. `action_clock_proposals` and the reminders' table are this module's, keyed by `bundle_id` and declared to purge (K4, K23). No place is named in this module's behaviour or outward text; its tests include the test profile (`build/layers.md`, rule 3). *(not yet met: `action_clock_proposals` is declared in `actions`' `ACTIONS_TABLES` until the split's job moves it)*

### Satisfies

- `BIO_State_Rules_Consistency_v1_5.md` §4.4 (the Action object's clock; I-11).
- `BIO_Action_v0_1.md` (canon whole, K608): §4 rule 5 (every deadline names its basis, and members are told without being nagged).
- `BIO_Design_Requirements_v2.md` §7 (the clock starts) as amended 2026-09-26; `BIO_Functional_Architecture_v3.md` Layer 3, Function 5; `BIO_Complete_Roadmap_v5.md` §5 (Operational Principle 3).
- D-147 read with K102 (no date computed into the record; R2 proposes apart, R7); DEC-10, DEC-69, DEC-70, DEC-77, DEC-94 (R4–R6, R8).
- `build/layers.md`, layer 9 (the `action-clocks` row, K617) and "No jurisdiction in the product".

### Suggestions

- **Factory.** `actionClocksOf(ctx, deps)` over the one Durable Object storage (K61), given `actionsOf`'s instance; `actionClocksOps(module, url, body)` for `op=reminderanswer`, the `actionsOps` pattern, with its one spread line in `legacy-store`'s dispatch (§12.2); `control-plane` declares the op spec and stamps (its R31).
- **The split's job** moves the code and tests named under Size, re-points `monitoring`'s `deadlineRecheck` and `filings`' `clockPropose` calls to this module, and leaves `actions` exporting nothing of the clock but R12's rule. The moved tests keep their assertions and are renamed to the new ids (R31 → R1, R32 → R2, R35's share of `read.test.mjs` "R25 R26 R35 …" → R7).
- **Reminders.** A projection table `action_reminders` (action, entry, day, set_by, set_at, answered_at), replaced whole from the document at each promotion as `actions` R3 replaces its rows, keeps R5's read to one seek; the document is the authority.
- Tests: every refusal with a negative control; R1's paging carried as it stands; R2 at a business-day count reaching an unlisted year; R3 at the day boundary; R4 a machine and a malformed `entry` refused, a member's change landing; R5 due on its day and not before, gone once answered; R6 both answers, and a second answer refused; R8 by showing no item or reminder is minted when no member asked.

## Open for Bob

None: the split is BOB's (K617); the reminders follow DEC-94 and K613–K615.

## Decided by BOB (for rulings)

- The seam (K617): the clock's reads across actions (R1, R3), the proposals from the profile's deadlines with the holiday calendar (R2), the reminders (R4–R6, R8) and the clock invariant (R7) move; R7's clock-entry arm at the write, R12's clock facts, R25's clock read and R33's machine fence stay in `actions`, each being one arm of an act or read of the action itself.
- A reminder lives in the action's document, as its clock does, so `action-plans` R18 composes it with the action; its answer is this module's op.
- Pages cap at 500 (R1, R3, R5), as `actions` R31's did; at most 50 reminders an action.
