# local-facts — requirements

**Status** · APPROVED by Bob 2026-10-01 (K921): the design, its answers (Q6, Q7, Q8 as recommended; holidays, hours and their horizons per jurisdiction, not per template) and the module. Drafted by a worker for BOB #86, 2026-10-01, on `tranche/T20`, from `build/plan/draft-filing-templates.md` §2 and §3 as §5 amends them, with K922 and K925 (a holiday entry's `offices` may name a venue as well as a counterparty role). R1–R5 keep the draft's numbers; R5 is narrowed (a machine's re-check is not stored here, it reaches a member as run output), R2 gains the whole list, R4 takes the paths a later module computes (P4: this module reads no action) and R6–R8 are added by this drafting (the paths, the vocabularies, the rows). A new module, layer 9, first in the layer (before `standards`); since T33, layer 5, directly after `lines` (K1438). No `from`. Every id is not yet met: T21. T33's fold, by a requirements worker for BOB #114 on `tranche/T33`, 2026-10-05, from plan entry T33-28 (entries A TIME and ORG; C C-3b; §7 item 3; K1438, K1444 (iii)): the module moves to layer 5, directly after `lines` (K1438); R3 amended (horizons on the local day of the profile's time zone, through `civil-time`); R6 amended (an office's fact follows its `part_of` line to its parent, the profile's `offices` kept as fallback); R9 (the table declared explicitly, plan Rules (6)) added; Uses gain `lines` and `civil-time`; not yet met (T33-28).

**Size (P6).** New. Estimated 400–600 lines with its one table.

## Public

### Purpose

Members' confirmation of the profile's local calendar and offices on this instance. A profile's holidays, office hours and time zone (`jurisdictions` R33, R41–R44) are researched facts; this module records each member's confirmation, correction or dispute of one, answers each fact's status and the value that governs here, lapses a confirmation at its horizon, and lists the facts a live deadline reads that are due. A member confirms; a machine never does.

### Provides

Terms. A **fact** is one of: a `holidays` entry's year (keyed by its year and its `offices`, `jurisdictions` R33, R43), an office's `hours` (a counterparty's or a venue's, R42) or the `time_zone` (R41), in one held profile; facts are per jurisdiction profile, never per template. Its **path** is `factPath(...)`'s string (R6). An **act** is `confirm`, `correct` or `dispute` (`LOCAL_FACT_ACTS`). A **status** is `confirmed`, `unconfirmed`, `corrected`, `disputed` or `absent` (`LOCAL_FACT_STATUSES`). A refusal is `{ok: false, reason, code, check, translation, ...}`. `by` and `viewer` are the control plane's stamps.

**factConfirm({path, act, how, value?, source?, by, viewer})** (`op=factconfirm`) → `{ok, path, act, at}`
- **R1** Records a member's `confirm`, `correct` or `dispute` of the fact at `path`. `how` is 1–500 characters saying how they checked (the official page at an address, a call to the office, a visit) (`FACT_HOW_REFUSED`). `correct` needs `value`, valid as the profile's own field (`jurisdictions.validate` of that field), and `source`, 1–500 characters (`FACT_VALUE_REFUSED`). Refusals in order: `MACHINE_CANNOT_CONFIRM` (a machine or unstamped `by`); `NO_SUCH_FACT` (a path R6 does not name in an active profile); `FACT_ACT_REFUSED` (an act outside `LOCAL_FACT_ACTS`); `FACT_HOW_REFUSED`; `FACT_VALUE_REFUSED`.

**factStatus({path?, viewer})** (`op=factstatus`)
- **R2** For one `path`, answers its status with the latest act's member, date and `how`, the profile's value with its `status` and `basis` (`jurisdictions` R44), and the value that governs on this instance: the latest correction's, marked "corrected locally by <member>, <date>", else the profile's (Q6). `confirmed` while a confirmation is the latest act and within its horizon (R3); a lapsed confirmation reads `unconfirmed`, naming it; `disputed` while a dispute is the latest act; `absent` when the active profiles hold no such fact or withhold it as a conflict (`jurisdictions` R15). Without `path`, it lists every fact of the active profiles with its status, corrections and disputes first, so a member can report them for a profile fix; the instance transmits nothing. `NO_SUCH_FACT` for a path R6 does not name.
- **R3** Horizons, per profile fact: a holiday year's confirmation lasts until that year ends, and a year not confirmed by 1 November of the year before is due; an office's hours, and the time zone, lapse 183 days after confirmation (Q7). A correction governs until a later act, and is itself confirmed by a later `confirm`. Every day here is a local day of the fact's profile's time zone (`civil-time.localDay` of the instant, `jurisdictions` R41), never the UTC day: a year ends, 1 November falls and the 183rd day lapses at that zone's local midnight; a profile with no time zone answers the fact's horizon undetermined, saying so, never a UTC fallback (§7 item 3; K1444 (iii)).

**factsDue({paths?, viewer})** (`op=factsdue`; `queue-producers` R21's read)
- **R4** Lists, once each, every fact that is `unconfirmed`, lapsed, due (R3) or `disputed`: with `paths`, only those of them (the facts a live deadline reads, as `action-clocks.calendarFactsRead` answers them, its R11, which the caller passes; this module, first in layer 9, reads no action, P4); without, every such fact of the active profiles. Each with its status and why it is due. A path R6 does not name is left out and listed in `unknown`. Writes nothing.

**The paths and the vocabularies**
- **R6** `factPath({profile, fact, year?, offices?, office?})` answers the one path of a fact: `fact` one of `holidays` (with `year` and the entry's `offices`, absent for all offices), `hours` (with `office`: a counterparty's `role` and `body`, or a venue's `kind`) and `time_zone`; the same fact always gives the same path, and `parseFactPath(path)` answers the parts or null. Both pure; neither throws. (T33-28; A ORG bridge, ladders §5.4) `governingPath({profile, fact, office, entity?, at, viewer})` answers the path whose fact governs an office: the office's own when the profile holds one; else, when `entity` (the office's registry entity) is given, the fact of the nearest entity it is `part_of` at `at` (`lines.structureAt`, followed upward one line at a time, at most `connection-grammar`'s default depth) that the profile holds, naming each line followed; else the profile's `offices` grouping as before (fallback), saying so. A `part_of` line undetermined at `at` stops the walk there and answers the fallback with why. It writes nothing and never throws.
- **R7** `LOCAL_FACT_ACTS`, `LOCAL_FACT_STATUSES` and the horizons of R3 are exported, frozen, for `action-clocks`, `filings` and `affordances` (its R30).

## Private

### Uses

- `jurisdictions`: `combine`'s view and `get` (`holidays`, `hours`, `time_zone`, each with its `status` and `basis`; `validate` for a correction's value).
- `record-grammar`: `isMachineIdentity`.
- `record-core`: `transact`, `stampInstant`, `getSetting` (the active profiles), `declarePurge`, `declareTable` (its R21; R9, T33-28).
- `membership`: `viewerPredicate`.
- `civil-time`: `localDay` (R3; T33-28).
- `lines`: `structureAt` (R6's `governingPath`; T33-28).
- `connection-grammar`: `BOUNDS` (R6's depth; T33-28).

### Invariants

- **R5** Append-only: every act is kept with its member, date and `how`; nothing is overwritten and nothing deleted (declared to purge, K23). A machine never confirms, corrects or disputes; an assistant's re-check of a source reaches a member as a run's output, labelled machine work, and enters here only by the member's own act, whose `how` may name it.
- **R9** (plan T33, Rules (6)) This module declares its table (`local_fact_acts`) explicitly through `record-core.declareTable` (its R21), keeping R5's purge and append-only rule (`version_chain: true`), `sight: "group"` (a profile fact is the instance's), the other classes as `declarePurge`'s default form gives them.
- **R8** Each refusal carries its row in this module's own table (`checks.mjs`), each `{check, where, translation}`, a new family, **C-126** (K933); every row is stamped by 1.52.0 (T22's promotion job). No place is named in this module's behaviour or outward text; its tests use the test profile (`build/layers.md`, rule 3).

### Satisfies

- `BIO_Action_v0_1.md` §4 rule 1 (humans decide), rule 5 (every deadline names its basis; members are told without being nagged) and rule 11 (jurisdiction lives in data; a missing fact reads undetermined).
- `BIO_Design_Requirements_v2.md` §7 (the clock starts) as amended 2026-09-26; D-147 read with K102 (no date computed into the record).
- Bob's direction K903 (6) and his answers K921 (Q6–Q8); K925; `build/layers.md`, layer 9.

### Suggestions

- One table, `local_fact_acts` (path, act, how, value, source, by, at), keyed by path and declared to purge.
- **T33 (T33-28).** The UTC-day site (`index.mjs:53`, `addDays`) goes through `civil-time`. `governingPath` is new beside `factPath` so `factPath` stays pure (R6); `action-clocks` and `filings` keep calling `factPath` until their own jobs choose `governingPath` (only `action-clocks`' T33-74 names local facts). The move to layer 5 changes no meaning (K1438).
- Tests: every refusal with a negative control; R2 each status, a lapse at the horizon's day boundary, a correction governing and its marking; R3 the 1 November rule; R4 with `paths` only those listed, an unknown path in `unknown`; R5 a machine refused and nothing overwritten.
