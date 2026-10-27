# The per-level load test (draft)

**Status** · DRAFT, READY for PLANNING (the deployment it needs is BOB's, §6). PLATFORM #1, 2026-10-27. Inputs: N1274 (K4746 (1), G87, K4772), K4746, K4599, P17, P18, P24, P26 (digest). Replaces the model figures of `service-levels-draft.md` §2 with measurements.

## 1. What it must answer

For each level (`service-levels-draft.md`): (1) at what number of members working at once do the budget classes (`time-budgets-draft.md`) stop holding at p90; (2) at what record size, on what rows, does a screen or a write miss its budget or fail; (3) what a large file's reading and a visitor capture do to everyone else's screens (the room's one thread); (4) what the load costs in Cloudflare charges; (5) whether the fold, the combined read and the kept counts moved the figures as P11 and P15 estimated.

## 2. Where it runs

On a **scratch copy**, deployed for the test and discarded, in the permitted Cloudflare account `20b533579290b9b93168345edd3b7f72` only, never biosmoke8 and never another team's copy. The throwaway rehearsal account (`CS_TEST_CF_ACCOUNT_ID`) is for the new-team rehearsal alone (K4942) and is not used. A scratch deployment is not covered by K4296's approval for biosmoke8 (N1274); it is BOB's act, with Bob's authorization if BOB judges it needed (§6). The route is the proxy's (K4733); figures are net of it (P18).

**One rehearsal with a jurisdiction (K5443).** biosmoke8 and the load-test copies stay unjurisdictioned. One new-team rehearsal on the throwaway account (`CS_TEST_CF_ACCOUNT_ID`, K4942, for that rehearsal alone) installs with `eu` to prove the path: the room in the `eu` jurisdiction, the R2 bucket created in `eu` and reached through its endpoint, the install refusing cleanly if either cannot be created (`record-placement-draft.md` PL30, PL34), and then a whole-record move into it (`whole-record-move-draft.md`) as the import's proof. It records the room's start-up and hop, an R2 read from the jurisdiction endpoint against the default, and the install's result; it is a rehearsal, not a load run (no ramp).

## 3. How it loads

**A driver that speaks ops, not a browser**, for the many; **a browser for a few**, because "drawn" needs one (P23's method). The driver replays a profile of the screens' declared reads (`op-declarations`), as sessions of seeded members: sign in, then a mix of screens and acts at the profile's rate, with think time. P17's model was 2 screens a minute a member; the test measures against 1, 2 and 4.

**Profile (starting values; PLANNING may change them):** Home 25 %, Queue 15 %, Project 20 %, Document 15 %, Held 5 %, Inbox 5 %, Add and writes 15 % (share, reply, prepare, confirm, case work). One in 20 members is adding a document; one visitor capture every minute; one large file (the K4628 bound, kind by kind: PDF, CSV, workbook) reading in the background from the first minute, because that is when P24's queueing was measured.

**Per-type load (FILES F5, `LOAD-PER-TYPE.md`).** The large-file item draws from FILES' worst cases: a 100 MB text file (about 150 MB of units: about 150 landing batches of 28-72 ms, 5-11 s of the room's thread spread across the read), a 5,000-page dense PDF (45-50 MB of units; extraction 6.5 s native, 2-7 hours OCR in a container), a 500 MB text mailbox. The test seeds both a *text-heavy* and a *scan-heavy* team, since the record grows by text and the container by pages, and records the room's hold per batch (PL7). FILES' L1-L6 (Workers reader per MB; windowed XLSX; photo redraw 12/24/48 MP; LibreOffice on large files; archive unpack; container cold start and idle cost) are measured on the same scratch copy's account in the same deploy cycle as S1; **P-M17** (`lane-reading-architecture/PLATFORM.md`: container cold start, R2 to container, cost) runs first, because L3, L4, L5 and L6 need it. BOB places the runs; PLATFORM supplies the copy and the profile.

**Archive and attachment fan-out (CAPABILITIES C12, relayed by BOB).** Each archive entry and each message attachment gets one acquisition `member` job row (keyed `containerSha!index`), bounded by `UNPACK_DAILY_ENTRIES`. The profile seeds a ZIP of 10,000 small members (the K5439 bound) and a 100,000-message mailbox, and records: job rows written and their landing time (the room's hold per batch, PL7), the time until the last member is read, the door window's wait for other members meanwhile, and the rows and R2 operations it costs; and it checks that the daily bound stops the fan-out at `UNPACK_DAILY_ENTRIES` with the rest said to wait, not dropped or run past it.

**Ramp:** 5, 10, 15, 25, 40, 60 members, 10 minutes a step, the next only if the last step held; stop at the first step that breaks a budget at p90 or fails more than 1 % of ops. A soak at 80 % of that step for an hour. Quiet-copy baseline first (no walkers: the scratch copy has none), which also gives the hop for the region (`record-placement-draft.md` §5).

**Record sizes** seeded before the ramp: 1, 5 and 25 GB of captured files, and a database near the gauge's 70 % and 90 % of 10 GB (G42), built from the measured ratios (0.84 MB per document; the database about 19 % of captured bytes; 4,800 rows read per call, P17). Seeding is by the product's own acts, never by writing rows past the plane, so the rows are those a real team's are. The cost of seeding is written down: rows written are the first charge past $5 (P17).

## 4. What it records

Per op and per screen: net median, p90, p99; hops; requests; repeats. Per step: members, errors by code, the door window's wait (queued time, 108-135 ms alone and 989-1,423 ms queued in P24), `in-<route>`, Worker and room CPU and wall (Cloudflare's own analytics, read-only, `tools/cf/gql.sh`), rows read and written, R2 operations, browser minutes, and the step's cost. Written to `PLATFORM.md` rows `P-M<n>` (the form `runtime-limits` R34 names), each saying the copy, the commit, the date, the walkers present (none), the number of samples, and the range.

## 5. Requirement lines (draft; a new module is proposed)

**load-check** (new module, layer 11, proposed, built in R1 (K5448); `uses` `op-declarations`, `runtime-limits` and `test-support` only; until it is built the study measures with the prototype's scripts on `proto/levels-2-3`)
- **PL40** `runProfile(copy, profile, ramp)` drives the declared reads and acts as seeded members against a copy named by the caller, steps up by `ramp`, and stops at the first step that breaks a budget at p90 or fails over 1 % of ops, returning per-step figures; it refuses a copy whose account is not the permitted one and any copy the caller marks as the shared test copy, before any request. Test: a copy fixture of a wrong account refused with no request made; the shared copy refused; a fixture whose latency rises with members stops at the step that crosses the budget.
- **PL41** The driver is bounded by what one scratch copy should take (a member count cap and a request-rate cap it will not exceed whatever the caller asks), never loads a copy it did not seed, and prints no credential. Test: a request beyond the cap is clipped; a copy with another team's seed refused.
- **PL42** `seedCopy(copy, size)` builds a record of the named size through the product's own acts and returns the measured bytes, documents and rows. Test: the sizes reached are within 10 % of the request and equal what the gauge reports.
- **PL43** `report(results)` writes the `P-M` row for each level: the rated members-at-once (the last step that held at p90), the record bound, the upload bound, the cost, and which budgets broke first; it records a `measured` figure only from a completed run. Test: an interrupted run records none.

**runtime-limits**: PL20, PL21 (`service-levels-draft.md`) read the rows; **plane**/**control-plane**: nothing, the driver uses the public doors.

## 6. For BOB (an act, then a decision)

- **The scratch deployment** (BOB's, per N1274): one scratch copy per level; Level 1 now (it exists), Level 2 when N1271's design is built, Level 3's parts that need an Enterprise account stated not measured (`service-levels-draft.md` §4). *Cloudflare account only the permitted one;* BOB says whether Bob must authorize it (it is a deployment and a cost; the estimated charge for a full ramp and the seeding is to be set by the first dry run on the smallest record and reported before the larger runs).
- **When it runs in the plan.** Recommend after the fold and the work fixes land (PL12-PL14, the picker, kept counts), so the first measured Level 1 rating is of the beta's design, not the alpha's; a short run on the alpha's design first gives the "before", and is cheap.

## 7. What I need from other lanes

CAPABILITIES, FILES: the operations each adds, to include in the profile; FILES: the large-file kinds and their bounds; TESTS-SWEEP: nothing (the driver is a test tool in a new module, not a change to existing tests).
