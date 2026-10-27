# The three service levels (draft)

**Status** · DRAFT. The structure is READY for PLANNING; every figure is an estimate until `load-test-draft.md` replaces it (K4746 (1): "figures confirmed by measurement before a team sees them"), and the Level 2 and 3 lines wait on N1271's study. PLATFORM #1, 2026-10-27. Inputs: K4746, K4635, K3060 D5, N1265, N1271, PERFORMANCE P17 (the study Bob answered "A for both questions"; Cloudflare's limits read 2026-10-23 and to be re-read before a figure is published).

## 1. What a level is

A level is defined by what a copy can do, each naming the design stage it needs and the Cloudflare plan it needs (Bob, K4746 (1)). Cloudflare's plans differ in guarantees, upload size and region control, not in speed: no plan makes a room faster or its shelf bigger (P17). So the design stage decides size and responsiveness, and the plan decides guarantees. Bob's four factors (K4635) set a team's realistic record: its plan and what it will pay, how openly it pares its record, the latency it tolerates when a search runs behind, and the infrastructure's real limits.

## 2. The levels (estimates from today's measurements, P17)

| | Level 1 · Team | Level 2 · Organization | Level 3 · Coalition / institution |
|---|---|---|---|
| Design stage | one room per team (today's) | the record split across rooms, bulk tables in R2 (N1271) | Level 2 with very busy tables split further and reads cached |
| Cloudflare plan | Workers Paid ($5); any domain | Workers Paid; a Business zone optional (uptime guarantee, 200 MB uploads) | Enterprise contract |
| Record | about 50 GB of captured files, 8,000-12,000 documents; the room's own shelf 10 GB (gauge warns at 70 % and 90 %, G42) | about 10 GB of database per project, hundreds of GB in all | as Level 2, with region-held data |
| Members working at once | about 15-25 today; about 2-4 times that after the fold and kept counts | grows with the active projects (one line each) | as Level 2, plus caching |
| Upload | to 100 MB through the Worker; larger by direct-to-R2 | 200 MB with Business; larger by direct-to-R2 | to 5 GB |
| Cost to the team | $5 to about $25 a month | about $10-60, plus $200-250 with Business | by quote |

**How the 15-25 figure was made** (P17): the room serves about 30 calls a second at about 30 ms of work and 4,800 rows read each; a member at 2 screens a minute makes 20-40 calls a screen; queues lengthen well before full use. It is a model; the load test replaces it. **Not stated anywhere by Cloudflare** (P17): whether the Business SLA covers Workers and Durable Objects by name, and Enterprise prices; neither is published as a promise.

## 3. Requirement lines (draft)

**runtime-limits** (layer 1)
- **PL20** `SERVICE_LEVELS` is a frozen map `level -> {name, design_stage, cf_plan, record_bytes, members_at_once, upload_bytes, measured}` for the three levels, where `measured` is `null` until a load-test row is recorded in `PLATFORM.md` (`source` `PLATFORM.md P-M<n>`, as `PLATFORM_FIGURES`, R34); `levelOf(copy)` answers 1, 2 or 3 from the copy's design stage and the plan it declares, never from a guess. Test: each level, an undeclared copy answering 1, `measured` null for every level until a row is recorded.
- **PL21** A figure with `measured: null` is never given to any caller that renders words for a team: `levelFigures(level)` throws a `TypeError` naming the level while it is unmeasured. Test: the throw for an unmeasured level, the figures for a measured one.

**screens-settings** (layer 11; owns the gauge, G42) and **installer** (needs, to UX-DESIGN through BOB, as needs not designs)
- **PL22** The administrator sees the team's level, the record's measured size against that level's record bound, and the four factors; a member sees none (G42 stands). The level is shown only once `measured` is recorded (PL21). *Screen need:* a level line and the four factors on the Settings gauge; the install screen's region and level line come with N1273 (`record-placement-draft.md`). Test: the line absent while unmeasured, present with its figure once recorded; absent for a member.
- **PL23** The members-at-once figure is a rating, never a measured live count shown to a member; the room's measured load is the administrator's only (an input to the level's rating, not a promise). Test: the level line states the rating and no live count.

**installer** and the upgrade step (beta, with N1271)
- **PL24** A team moves from Level 1 to Level 2 by its own act (N1265): the copy runs an upgrade step on its own data that moves the record into the split design, with the Level 1 room kept whole as the rollback until the administrator confirms; a copy that cannot hold both (shelf, R2) refuses the step, naming what is short. Test: a seeded copy upgraded, read-equal before and after; a copy with no room refused.
- **PL25** A team changing its Cloudflare plan without the split design changes its guarantees and upload size, not its level; `levelOf` stays 1. Test: a Level 1 copy declaring Business answers 1.

## 4. What must be measured, and on what copy

Per level, on a scratch copy at that design stage, never biosmoke8: record bound (writes fail at the shelf, the gauge's 70 % and 90 % hold), members-at-once at the budget (`time-budgets-draft.md`), upload size through the Worker and direct-to-R2, and the cost at the rated load (rows written is the first charge past the $5, P17: about $20 a month on the test copy's busiest day, sustained). Level 3 differs from Level 2 only by what Enterprise adds; those parts (5 GB uploads, region-held data) are measured on a copy whose owner holds the contract, so they are *stated, not measured*, until one does: the words say so (a figure from Cloudflare's published limit carries its source).

## 5. For Bob (through BOB)

- **Whether to show a level's figures to a team before Level 2 and 3 exist.** Options: (a) show Level 1 only, and name Levels 2 and 3 as "when your record outgrows this" without figures; (b) show all three with the Level 2-3 figures marked as planned. *Recommend (a): K4746 forbids unmeasured figures, and Level 2's rest on a study not yet done.*
- **Whether a team is told its level at install** (N1273) or only in Settings. Recommend at install, as one line, since the founder chooses a plan then (N1265).

## 6. What I need from other lanes

CAPABILITIES and FILES: the rows and bytes each capability and each file type adds to a record, and the load each adds per member (registers, alerts, following the trail: background work; large files: reading time in the room's thread), so the rating accounts for them. FILES: the reading rate floor.
