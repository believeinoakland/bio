# The three service levels (draft)

**Status** · **READY** for PLANNING (K5569, 2026-10-27: as it stands; figures stay "not yet measured" and are filled by the measurements alongside R1; unbuilt levels not selectable; no move down). Every figure is an estimate until `load-test-draft.md` replaces it (K4746 (1): "figures confirmed by measurement before a team sees them"), and the Level 2 and 3 lines wait on N1271's study. PLATFORM #1, 2026-10-27. Inputs: K4746, K4635, K3060 D5, N1265, N1271, PERFORMANCE P17 (the study Bob answered "A for both questions"; Cloudflare's limits read 2026-10-23 and to be re-read before a figure is published).

## 1. What a level is

A level is defined by what a copy can do, each naming the design stage it needs and the Cloudflare plan it needs (Bob, K4746 (1)). Cloudflare's plans differ in guarantees, upload size and region control, not in speed: no plan makes a room faster or its shelf bigger (P17). So the design stage decides size and responsiveness, and the plan decides guarantees. Bob's four factors (K4635) set a team's realistic record: its plan and what it will pay, how openly it pares its record, the latency it tolerates when a search runs behind, and the infrastructure's real limits.

## 2. The levels (estimates from today's measurements, P17)

| | Level 1 · Team | Level 2 · Organization | Level 3 · Coalition / institution |
|---|---|---|---|
| Design stage | one room per team (today's) | the record split across rooms, bulk tables in R2 (N1271) | Level 2 with very busy tables split further and reads cached |
| Cloudflare plan | Workers Paid ($5); any domain | Workers Paid; a Business zone optional (uptime guarantee, 200 MB uploads) | Enterprise contract |
| Record | about 50 GB of captured files, 8,000-12,000 documents; the room's own shelf 10 GB (gauge warns at 70 % and 90 %, G42) | about 10 GB of database per project, hundreds of GB in all | as Level 2 |
| Region (corrected 2026-10-29, K5800; `enterprise-s3-draft.md` §2.3) | storage held in the `eu` or `us` jurisdiction, room and files (Cloudflare: no plan named for either) | as Level 1 | as Level 1, plus FedRAMP storage and Regional Services (where requests are processed; not on `workers.dev`), both Enterprise-only |
| Members working at once | about 15-25 today; about 2-4 times that after the fold and kept counts | grows with the active projects (one line each) | as Level 2, plus caching |
| Upload | to 100 MB through the Worker; larger by direct-to-R2 | 200 MB with Business; larger by direct-to-R2 | to 5 GB |
| Cost to the team | $5 to about $25 a month | about $10-60, plus $200-250 with Business | by quote |

**What grows the record (FILES F5, `build/plan/beta/files/LOAD-PER-TYPE.md`, relayed by BOB).** The room's database grows by the extracted *text*, about 1.4-1.5 times its size (derived from a landing measured on 1 KB rows, stage 0 P-M9), and not by the file's size: the file sits in R2. P17's "about 50 GB of captured files" assumed today's mix, where the database was 19 % of the captured bytes; for a team whose files are mostly text it is far less (10 GB of database is about 6.9 GB of extracted text). So the Level 1 record bound is stated as **database bytes (10 GB)** and **R2 bytes** separately, never as one figure of files; the load test seeds both mixes (`load-test-draft.md` §3). **Not yet confirmed:** the 1.4-1.5 factor on real text-unit rows (FILES asked me to confirm it). The test copy's 416 MB of SQLite over 535,983 text units is at most 776 bytes per unit across every table, so real unit rows are smaller than the 1 KB rows measured, which does not contradict the factor but does not confirm it; the scratch Level 1 run (S1) reads the database's bytes per table against the extracted text's bytes.

**How the 15-25 figure was made** (P17): the room serves about 30 calls a second at about 30 ms of work and 4,800 rows read each; a member at 2 screens a minute makes 20-40 calls a screen; queues lengthen well before full use. It is a model; the load test replaces it. **Not stated anywhere by Cloudflare** (P17): whether the Business SLA covers Workers and Durable Objects by name, and Enterprise prices; neither is published as a promise.

**Names (K5438).** Bob now names the levels Team, Institution, Enterprise; K4746 named them Team, Organization, Coalition/institution. I read them as the same three, in order: Level 1 Team, Level 2 Institution (K4746's Organization), Level 3 Enterprise (K4746's Coalition/institution, on Cloudflare's Enterprise plan). BOB to confirm the reading; the words a team sees are UX-DESIGN's.

**The bar holds at every level (K5438).** K4354's bar (2 s a screen, 2 s an action, 15 s a web capture) is kept at all three levels; a level's range (record size, members at once, load) is the range within which that bar holds. A copy whose workload passes its level's range is *told* it needs the next level, never left slower.

## 3. Requirement lines (draft)

**runtime-limits** (layer 1)
- **PL20** The three levels are rows of `runtime-limits`' one bounds table (kind `level`, never a second table, K5448 (8)), each `{name, design_stage, cf_plan, record_bytes (database and R2 separately), members_at_once, upload_bytes, measured}`, where `measured` is `null` until a load-test row is recorded in `PLATFORM.md` (`source` `PLATFORM.md P-M<n>`, as `PLATFORM_FIGURES`, R34); `levelOf(copy)` answers 1, 2 or 3 from the copy's design stage and the plan it declares, never from a guess. Test: each level, an undeclared copy answering 1, `measured` null for every level until a row is recorded.
- **PL21** A figure with `measured: null` is never given to any caller that renders words for a team: `levelFigures(level)` throws a `TypeError` naming the level while it is unmeasured. Test: the throw for an unmeasured level, the figures for a measured one.

**screens-settings** (layer 11; owns the gauge, G42) and **installer** (needs, to UX-DESIGN through BOB, as needs not designs)
- **PL22** The administrator sees the team's level, the record's measured size against that level's record bound, and the four factors; a member sees none (G42 stands). The level is shown only once `measured` is recorded (PL21). *Screen need:* a level line and the four factors on the Settings gauge; the install screen's region and level line come with N1273 (`record-placement-draft.md`). Test: the line absent while unmeasured, present with its figure once recorded; absent for a member.
- **PL23** The members-at-once figure is a rating, never a measured live count shown to a member; the room's measured load is the administrator's only (an input to the level's rating, not a promise). Test: the level line states the rating and no live count.

**installer** and the upgrade step (beta, with N1271)
- **PL24** A team moves from Level 1 to Level 2 by its own act (N1265): the copy runs an upgrade step on its own data that moves the record into the split design, every new room created in the team's own region or jurisdiction (K5441: the region is fixed; `record-placement-draft.md` §4), with the Level 1 room kept whole as the rollback until the administrator confirms; a copy that cannot hold both (shelf, R2) refuses the step, naming what is short. Test: a seeded copy upgraded, read-equal before and after; a copy with no room refused.
- **PL25** A team changing its Cloudflare plan without the split design changes its guarantees and upload size, not its level; `levelOf` stays 1. Test: a Level 1 copy declaring Business answers 1.

**Outgrowing a level (K5438)** (screens-settings, with the plane's `stats`; the door already stamps every op's time)
- **PL26** The plane keeps, per week, three measured indicators for the copy: the record's bytes against the level's record bound; the most members seen working in one 5-minute window against the level's rating; and the share of screens and acts whose p90 broke their class ceiling (`time-budgets-draft.md`). It keeps counts, never what a member did. Test: a fixture week of door stamps gives each indicator; an op's content is not in what is kept.
- **PL27** A copy is **approaching** its level when any indicator has been above 70 % of the level's range (for the budget indicator: above 10 % of operations over) for 7 days, and **outgrowing** it at 90 % (or 25 %): the administrator is told, in plain words, what is measured, which level is next, and what moving up needs (PL24). It is never shown to a member. Test: each threshold crossing, the 7 days, the member who sees none.
- **PL28** While Level 2 does not exist (until N1271 is built), a Level 1 copy that is outgrowing is told so truthfully: what it can do now (pare the record, K4635's second factor; a paring aid is a screen need) and that the next level is not yet offered. Test: the words key differs for "next level not yet offered".
- *Screen need (to UX-DESIGN through BOB):* the Settings gauge gains the three indicators, the "approaching" and "outgrowing" states and the next-level line; the installer's level line (PL22) names the range.

**Choosing a level at install (K5444)** (installer, installer-steps; with UX-DESIGN)
- **PL29** The install offers Team, Institution and Enterprise, each stating: what it is for (in a plain sentence), its measured range (members at once, record, upload) or "not yet measured", the Cloudflare plan it needs, and what it costs the team a month by Cloudflare's published prices (Enterprise: by quote). A level whose design stage is not yet built is shown and not selectable ("not yet available"). The chosen level sets the design stage the copy is created at (Level 1: one room; Level 2: the split record from creation, N1271; Level 3: Level 2 with its further splitting and caching) and is recorded as the copy's declared level (`levelOf`, PL20). The installer's preflight (`installer` R70) checks the plan the level needs, and a level that needs a plan the account lacks is refused before anything is created, naming the plan. Test: an unbuilt level is listed unselectable; a built one sets the stage and the declared level; Enterprise on a non-Enterprise account refused before the room exists; the words say "not yet measured" while `measured` is null.
- *Screen need (to UX-DESIGN through BOB):* the level choice at install with the sentence, range, plan and cost for each; "not yet available" and "not yet measured" states; the line that a copy can move up later and not down, and how (PL24, PL50-PL57).

## 4. What must be measured, and on what copy

Per level, on a scratch copy at that design stage, never biosmoke8: record bound (writes fail at the shelf, the gauge's 70 % and 90 % hold), members-at-once at the budget (`time-budgets-draft.md`), upload size through the Worker and direct-to-R2, and the cost at the rated load (rows written is the first charge past the $5, P17: about $20 a month on the test copy's busiest day, sustained). Level 3 differs from Level 2 only by what Enterprise adds; those parts (5 GB uploads, FedRAMP storage, Regional Services: where requests are processed; storage held in the `eu` or `us` jurisdiction is not among them, it is on any paid plan, corrected 2026-10-29, K5800) are measured on a copy whose owner holds the contract, so they are *stated, not measured*, until one does: the words say so (a figure from Cloudflare's published limit carries its source).

## 5. Decided, and what is left (P4, K5444)

Bob (K5444, as BOB relayed it): a newsroom should be able to start a copy at the Institution level, set up from the start for the demand it will get on day one; if a study of how to support Levels 2 and 3 is needed, start it now. So: a copy **chooses** Team, Institution or Enterprise at install and can still move up later; until a level is built and measured its figures show as "not yet measured" (PL21); the study starts now (`levels-2-3-study-plan.md`).

**Enterprise (K5454):** quoted from Cloudflare and marked not yet measured; listed at install as "not yet available" until a team wants an enterprise-scale copy; Team and Institution are the beta's levels.

**Left, technical (BOB's):** a level that is not built cannot be created, so the install lists all three but a level is *selectable* only once built (PL29); recommend that, over letting a team pick a level whose design does not yet exist. **A question for BOB, not Bob:** whether a team may also move *down* (no: rooms do not merge; the only move is an export and an import, PL50-PL57).

## 6. What I need from other lanes

CAPABILITIES and FILES: the rows and bytes each capability and each file type adds to a record, and the load each adds per member (registers, alerts, following the trail: background work; large files: reading time in the room's thread), so the rating accounts for them. FILES: the reading rate floor.
