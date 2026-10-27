# The study of Levels 2 and 3: plan, needs and time (draft)

**Status** · PLAN, started 2026-10-27 on Bob's word (K5444: "If a study of how to support levels 2 and 3 is needed, then let's start that study."). PLATFORM #1. It is N1271's capacity study widened to the three levels (K4746, K5442: Team, Institution, Enterprise). Output: options to Bob with the measurements, never a decision (P17). Every deploy is BOB's under K5120 and K5434; this lane changes no product code.

## 1. What the study must answer

1. **Level 1's ceiling**, as the baseline every other level is measured against: where the one room stops holding the bar (K4354, K5438) by members at once and by record size; which tables and ops spend the room's one thread (P24).
2. **The Institution design (Level 2):** which unit the record splits on (a room per project is the candidate, K4635 option B with bulk text and indexes in R2), what the team-wide directory holds, and what each choice does to the screens that read across projects (Home, Queue, Projects, search, connections and contradictions across projects) against the 2 s bar.
3. **The Enterprise design (Level 3):** what Level 2 needs added (a busy table split further, reads cached) and which of Enterprise's gains are measurable by us (direct-to-R2 large upload on any account) and which only stated (5 GB uploads through the Worker, region-held data, SLAs).
4. **Getting there:** the cost and risk of a copy created at a level from the start (K5444: a newsroom starting at Institution) and of an upgrade step from Team (PL24), including the rollback.
5. **What it costs a team** at each level, per Cloudflare's published prices, measured as charges on the scratch copies.

## 2. The phases, what each needs, and how long

Durations are working days of lane time; "waits" is calendar time on BOB's deploys or a job. My estimate is good to about ±50 %: the study's biggest unknown is the prototype in S2.

| phase | what | needs | lane time | waits on |
|---|---|---|---|---|
| **S0 Inventory and options** | Every table the record declares, by scope (project, team-wide, member-private), what grows it, who reads it and whether the read crosses projects; the cross-project invariants (entities, people, connections, contradictions, promotions); the candidate split units, each costed on paper against the screens' reads. A worker is already inventorying the tables. | nothing deployed | 0.5-1 day | nothing |
| **S1 Level 1 baseline** | The per-level load test's Level 1 profile (`load-test-draft.md`): ramp, record sizes 1, 5, 25 GB, the ceiling, the cost. Also the per-table row and byte cost per op, which S2 needs. | one scratch copy at Level 1 (BOB's deploy); `load-check` (a new module, built by a job BOB starts) or, for the first dry run, a script kept in this folder | 0.5 day | BOB's scratch deploy; the `load-check` job (about 1 day of its own) |
| S1 additions | P-M17 (container cold start, R2 to container, idle cost) and FILES' L1-L6 on the same scratch account; the database's bytes per table against the extracted text's bytes (confirms or corrects the 1.4-1.5 factor, FILES F5). | the same scratch copy | +0.5 day | BOB places the runs; FILES specifies |
| **S2 Split prototype** | A throwaway build that splits a seeded team's record by project, with a directory room and roll-ups, and a variant that keeps one room and moves bulk to R2; measure: hops and time for Home, Queue, Projects, Project and Document in each; the roll-up's lag after a write; what one busy project and a large file's reading do to another project's screens; room creation cost per project; failure of one project's room. | one scratch copy for the prototype (BOB's deploy); a **prototype job** (BOB starts it from my spec: throwaway code outside the product's paths, never merged to `main`) | 1 day to specify and 1 day to measure | the prototype job (about 1.5-2 days) and the deploy |
| **S3 Enterprise** | What Enterprise changes, split into measured and stated; direct-to-R2 upload of a large file on the scratch account; Level 3's added design (further splitting of the largest table from S0 and S2, read caching) costed from S2's per-table figures. | the S2 prototype; **an Enterprise account only if Bob can lend one**, otherwise Enterprise-only limits are quoted from Cloudflare's pages (read 2026-10-27 for data location, to be re-read for the rest) and marked stated, not measured | 0.5 day | nothing if no Enterprise account |
| **S4 Report to Bob** | N1271's options with the study: the split unit, the directory, the install at a level and the upgrade step, the figures per level (each marked measured or not yet measured), the cost, and my recommendation. One page for Bob in plain words (BOB places it on QUESTIONS.html). | S0-S3 | 0.5 day | BOB |

**Total.** About 3-3.5 days of lane time and about 4-5 calendar days, most of it waiting on the `load-check` and prototype jobs and BOB's deploys. S0 runs now with no wait. If BOB starts the two jobs while S0 runs, the report can reach Bob about five calendar days from the start.

## 3. What I need from BOB, and when

- **Now:** nothing; S0 is mine.
- **When S0 ends (about a day):** the prototype job started from my spec (I send it as `study/prototype-spec.md`) and the `load-check` job (PL40-PL43 of `load-test-draft.md`), both on branches off `tranche/T53`, outside the product's merge path until BOB decides.
- **When they have built:** two scratch deployments in the permitted account `20b533579290b9b93168345edd3b7f72` (K5120, K5434): one at Level 1, one for the prototype. I send the exact bindings and the run commands.
- **A question that is Bob's, through BOB:** can Bob lend an Enterprise-plan account for S3? Without it, Enterprise's measured part is the Level 2 design plus direct-to-R2 uploads, and the Enterprise-only limits are stated from Cloudflare. *Recommend asking; the cost of not measuring is that Level 3's figures stay "not yet measured" for the Enterprise-only parts.*

## 4. What stays "not yet measured" meanwhile

PL21 holds: no figure for Institution or Enterprise reaches words a team reads until a run is recorded in `PLATFORM.md`. The install lists the levels and says so (`service-levels-draft.md` PL29).
