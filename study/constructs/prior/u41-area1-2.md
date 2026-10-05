# U41 check: Area 1 (Time), Area 2 (Organisations)

Read-only check against `build/requirements/*.md`, the code paths in `build/modules.json`, and the canon. Paths are relative to /home/user/bio.

## AREA 1: Time

### Built (with requirement ids)
- **action-clocks R1–R12 are all built and tested.** None of them carries a "*(not yet met)*" mark. The code is `bio-plane/src/action-clocks/index.mjs` (798 lines), and the tests are in `bio-plane/test/m/action-clocks/` (clocks, overdue, reminders, calendar, factreader). Note: the Status line at `build/requirements/action-clocks.md:3` still reads "DRAFT … for Bob's approval", and its "Not yet met: R3–R6…" text is historical.
  - R1 `pendingClocks` (index.mjs:242). R3 `overdueClocks` (:268). R2 `clockPropose` with `computeDeadline` (:298, :694–750).
  - R4–R6 are reminders a member sets and answers (:412, :473). R8 says nothing reminds unless a member asked (action-clocks.md:55).
  - R10 makes a count state its calendar's confirmation status. R11 is `calendarFactsRead` (:344). R12 is `factReader` (:646).
  - R7 (action-clocks.md:54): every deadline names its basis, no date is computed into the record, and a proposal is stored apart and never written into `clock[]` (R2).
- **jurisdictions** (the profile data, validated in `jurisdictions/index.mjs`):
  - R26 deadlines (jurisdictions.md:35)
  - R33 holidays, where a year that is listed is complete (:38)
  - R41 `time_zone` (:41)
  - R42 office `hours` (:42)
  - R43 holidays for specific offices (:43)
  - R44 status and basis of each fact (:44)
  - R34 and R29: holidays and deadlines merged across profiles, with disagreements withheld (:65–66)
  - R7 `practice.minutes_due_days` (:29)
- **local-facts R1–R7** (not cited by the claim): members confirm, correct or dispute the holidays, hours and time zone. Confirmations lapse: holidays at year end, and hours and time zone after 183 days (local-facts.md:22). The `local-fact-due` queue item tells members when one is due (`bio-plane/src/queue/index.mjs:615`).
- **progressions R16–R17** (progressions.md:46–47; `bio-plane/src/progressions/index.mjs:103–114`), missed by the claim. This is a second, separate deadline engine. A member declares a stage `within: <n> day|week|month|year` after another stage, and an `overdue_successor` finding is raised from the dated predecessor document. It counts calendar time only, in UTC (months and years by `setUTCMonth`), with no business days or holidays.
- **docprofile, meeting calendar reader** (`docprofile/doctypes/meeting-calendar.mjs:25–38, :148–152`), missed by the claim. It extracts each meeting from a captured calendar page with its body, date and status (scheduled, cancelled or rescheduled) and its agenda and minutes links. Missing minutes become dated `temporal` connections with `expected_by` (docprofile.md:76–77, R15), timed by the profile's `minutes_due_days`. **monitoring R14** recognises a `per_meeting` frequency but cannot compute it (`bio-plane/src/monitoring/index.mjs:148`).
- **filings R9** (filings.md:32; `bio-plane/src/filings/index.mjs:1067`): the counsel packet's chronology. It covers the act, the findings' publication, the action's state history, correspondence and clock, in date order.

### Claim corrections
1. **The "undetermined" cases are understated.** A count is undetermined when it reaches a year the calendar does not list. It is also undetermined in these cases:
   - the rule starts from `act` or `known`, which the action's ledger never records, so those rules can never be computed;
   - the ledger holds no `sent` or `received` entry to start from;
   - a holiday entry the count reads is `disputed` or `absent` on this instance (R10; index.mjs:696–699, :720–728).
   - Also: a count over a calendar that is still `unconfirmed` *is* computed, and says it was counted on an unconfirmed calendar.
2. **"Hours stored but unused" is half right.** Hours are never used in the date arithmetic. But they are read: R11 lists the offices' `hours` as facts that live deadlines depend on (index.mjs:602–614), and local-facts lapses and queues them for members to re-confirm. The same applies to `time_zone`: it is confirmed and lapsed by local-facts (local-facts.md:22), and no deadline reads it.
3. **"R26's extension never read" is confirmed for the arithmetic, with one addition.** `jurisdictions/index.mjs:587–591` validates the extension's shape, but neither `computeDeadline` nor any other module reads it. A related point the claim missed: `action-grammar` already records an `extension_notice` among received correspondence (`bio-plane/src/action-grammar/grammar.mjs:392`), so the ledger event exists but nothing connects it to the extension.
4. **"Chronology only in the counsel packet" is incomplete.** Ordered histories exist elsewhere, though not as a timeline view:
   - actions R25's `risk_tier_history` and the state history (`bio-plane/src/actions/index.mjs:2387`);
   - progressions R8's dated placement versions;
   - docprofile's dated temporal connections.

   The canon itself names the gap: Content Framework §9.1 says "keeping a timeline of what happened when … partly; nothing assembles them" (`docs/architecture/BIO_Content_Framework_v0_10.md:1108`).
5. **"No recurring-meeting model" needs a qualifier.** There is no model of a body's meeting *schedule* (a rule like "second Tuesday"). There is a read of each meeting from captured calendars (see above), and monitoring states `per_meeting` as not computable.
6. **The claim leaves out** R1, R3, the reminders (R4–R6, R8) and R11–R12, and that R2 only *proposes* an entry and never writes it (R7).

### Gaps confirmed
- **Days are UTC.** A day is a UTC calendar day (action-clocks.md:15). The start is `at.slice(0,10)` of the ledger entry (index.mjs:700), and weekdays come from `getUTCDay` (:744). A late-afternoon US filing stamped in UTC can therefore land on the next day.
- **Time zone and office hours are unused in the arithmetic.** There is no "received after close counts as next business day" rule. Capture renders are also fixed at UTC (capture-sources.md:16, :195; acquisition.md:26).
- **The extension (R26 `extension`) is never applied or proposed.**
- **No recurring-meeting model**, as qualified in correction 5.
- **No effective dates are extracted from documents.** The regulation reader deliberately extracts no `enacted` fact and no effective or operative date (`docprofile/doctypes/regulation.mjs:189–192`). Nothing in build/requirements mentions "effective date" outside bias's "effective set".
- **No assembled cross-record timeline.** The only chronology is filings R9's. The two deadline engines (action-clocks and progressions R16) share no calendar logic.
- **Contract terms are not timed.** progressions R32's "payments past the term" is not yet met; K102 deferred it until amounts and funds are held as values (progressions.md:98).

### Natural home for each gap
| Gap | Module |
|---|---|
| Local-time days, and office hours affecting the start date | `action-clocks` (`computeDeadline`), reading `jurisdictions` R41/R42 through `local-facts` R12's reader |
| Extension applied or proposed | `action-clocks` R2, triggered by an `extension_notice` ledger entry (`action-grammar`/`actions`) |
| Recurring meeting schedule | `docprofile` (meeting calendar reader) for what is captured. A body's declared schedule could be a profile fact in `jurisdictions` (next to `practice`) or a new section of `entities`. `monitoring` would then compute `per_meeting` |
| Effective dates | `docprofile` regulation reader (and minutes reader) as a fact, then `extraction` |
| Cross-record timeline | `retrieval` (a read over projections), with `filings` R9 as the existing pattern; Content Framework §9.1 frames it as observation-log/connections work |
| Business days in progressions | `progressions` R16, reusing `action-clocks`' `computeDeadline` |
| Contract-term timing | `progressions` R32 (deferred by K102) |

## AREA 2: Organisations

### Built (with requirement ids)
- **entities R1–R41 are all built.** None is marked unmet. The code is `bio-plane/src/entities/index.mjs` (1,113 lines) and `schema.mjs`. The kinds are closed: source, institution, office, movement, person, body, ordinance, parcel, **contract**, fund (entities.md:15; index.mjs:28). The relations are closed: `proxy_for`, `member_of`, `overlaps` (index.mjs:31).
  - R3: a relation needs a justification and a citation.
  - R8: withdrawal without erasure, so the *declaration* history is visible.
  - R26 (entities.md:98): relations are constitutive. They carry no grade and are never traversed for resolution or connections.
  - R5 and R39: relations are read oldest first, at most 1,000.
- **jurisdictions R24** (jurisdictions.md:33): offices named by role and body (never a person), with `level`, `elected`, `oversight` and `hours` (R42).
- **actions R9** (actions.md:26; `bio-plane/src/actions/index.mjs:217, :510`), missed by the claim. An action's addressee is an office (role, body, optional `entity_id` linking to the registry), or a press outlet, organisation or group by role and organisation. A person entity is refused.
- **intent R4** (intent.md:27), missed by the claim. Progress walks one declared `relation` from a condition's entity. It is the only consumer that traverses relations.
- **docprofile staff directory reader** (`docprofile/doctypes/staff-directory.mjs:170–213`), missed by the claim. It extracts contacts keyed by email address with their line and phone. Between two captures it reports `item_added`, `item_pulled` and `item_changed`, which is an observed (not modelled) history of who is listed.
- **connections**: derived document-to-document connections through a shared entity (connections.md:11). These are not organisation relations.

### Claim corrections
1. "Three relations only" is right, but **the registry already has a `contract` kind**. A contract can be registered as a subject, but there is no relation between a contract and its parties (which is where "contracts with" would go).
2. "Counterparties by role (jurisdictions R24)" leaves out **actions R9**, where the actual addressee is recorded and may link to a registry entity (`entity_id`), plus press, organisation and group arms.
3. The claim leaves out **intent R4**, the only place a relation does any work. This matters because entities R26 forbids traversal for resolution and connections, so any new relation is inert unless a consumer like intent reads it.
4. The claim leaves out that **entities R8 gives declaration history** (who declared or withdrew, when and why). That is not validity history, but it is the existing hook for it.

### Gaps confirmed
- **No `reports_to`, `contracts_with`, `employs` or `subsidiary_of` relation.** RELATION_KINDS is closed (index.mjs:31). Nothing in build/requirements mentions hierarchy, reports-to or org charts.
- **No record of who held a role when.** `entity_relations` has only `at` (the declaration time) and withdrawal columns. There is no valid-from or valid-to (`bio-plane/src/entities/schema.mjs:42–54`), so `member_of` cannot say a person held an office from one date to another. The canon wants this: Roadmap v5 Appendix A lists "officials who held key positions during the FY 2012-2021" period with year ranges (`docs/architecture/BIO_Complete_Roadmap_v5.md:1047–1056`).
- **No org chart or org-chart history.** There is no hierarchy read and no point-in-time read. jurisdictions R24 offices have no parent body beyond the `body` string.
- **No link from an observed staff-directory change to the registry.** Contact add and pull events are not resolved to person or office entities.

### Natural home for each gap
| Gap | Module |
|---|---|
| New relation kinds (`reports_to`, `contracts_with`) | `entities`: extend RELATION_KINDS (R3, R7). This is a doctrine change under Declared Bias safeguard 4, so it is Bob's call. `affordances` republishes the list |
| Who held a role when (valid-from and valid-to on `member_of`, or a new `holds` relation from person to office) | `entities` (relation fields plus a point-in-time read). It also needs `actions` R9's rule against private individuals reconciled. The time arithmetic could reuse action-clocks' day rules |
| Org chart and its history | A read in `entities`, or a derived view in `retrieval`. The office hierarchy as profile facts could sit in `jurisdictions` R24 (a `parent` field) |
| Directory changes linked to role-holders | `docprofile` staff directory, then `extraction` references, then `entities` resolution (R9). `progressions` threads by entity |
| Contract parties and term | `entities` (`contract` kind plus a party relation), then `progressions` R32 (deferred) |
