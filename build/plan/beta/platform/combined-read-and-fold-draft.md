# The combined read and the admission fold (draft)

**Status** · DRAFT, READY for PLANNING (two points are BOB's, §5). PLATFORM #1, 2026-10-27. Inputs: K4599 (Bob: "as recommended": the combined read is built straight after the alpha, first measured by a small throwaway test), N1264 and `carried-T52-R1.md` T52-42, 43, 45, 53, 65, 73, 88, 91, PERFORMANCE P11, P15, P24 (digest). Figures are P-numbers' (biosmoke8, admin, 1280 px).

## 1. The two changes and what each buys

**The fold (N1264).** Today each op makes 2-5 calls to the room (`whoami` 1, `projectlist` 2, `groupidentity` 3, `bootstrap` 4, `queue` 2), each 108-135 ms, almost all of it transport (`in-<route>` is 0 on 30 of 36 screens, P15). The fold makes the room resolve the session, judge `admit` and stamp inside the op's own call: one call per op. P11's estimates: `groupidentity` 510 to about 130 ms, `queue` 650-940 to 340-450, `bootstrap` 930-1,290 to 250-450.

**The combined read (K4599 (a)).** One op that carries a declared list of reads for a screen and answers them together: Home's 24-26 reads, Project's 22, Document's 21-29 become one request and one call. P15's model: in-app moves 2 hops instead of 6-10.

**What neither does** (P15, P24): it does not help a screen bound by the room's own work. Home's `in-` is 1.4 s (queue 331 ms, `heldcaptures` 241 KB, `casedrafts` x5), the room is one thread, and a door window queued behind `heldcaptures` waits 989-1,423 ms. A combined read that runs 24 reads in the room holds the thread for the sum of them, so on a shared room it can make *other members'* calls wait longer. So the fold and the combined read are built with, never before, the work fixes (the picker for `heldcaptures`, kept counts) and are judged by the load test (`load-test-draft.md`), not by one member's screen.

## 2. The throwaway test comes first (K4599)

Two small tests, on a scratch copy (a deployment: BOB's act, not covered by K4296; Cloudflare account `20b533579290b9b93168345edd3b7f72` only):
- **T-a** a prototype multi-read op for Project's 22 reads, timed from outside against the 22 separate reads, on a quiet room and with 10 members' reads in the queue behind it.
- **T-b** a hinted throwaway object against an unhinted one. K4747 already put the minimum placement into the alpha, so T-b is now the *measurement* of the placement gain (biosmoke8's room re-created in western North America), and only needs repeating for a hint other than the founder's.

The build proceeds if T-a shows a Project in-app move at or under 1.3 s *and* the queued-member wait with the combined read does not exceed that of the separate reads by more than the budget's p90 factor. If it fails, the fallback is the fold alone plus the work fixes (P15's "(b) alone" column: Home 1.2/2.5 s in-app/full).

## 3. Requirement lines (draft; owners proposed, PLANNING places them)

**op-declarations** (layer 11)
- **PL10** A screen declares its reads as a list of `{name, op, args, wave}`; reads in one wave are independent, a later wave may take an earlier wave's answer as an argument; the declaration is the only place a screen's reads are named (the shell holds none). Test: a screen declared with two waves; a read naming an unknown op or a later wave's answer is refused by the check.
- **PL11** `screenread` is a read op, class `read`, whose spec states: its input is a screen's name and params; its answer is `{reads: {name: {ok, status, body | refusal}}, stamps, server_ms}`; one read refused (capability, namespace) answers `ok: false` with that refusal and the others still answer; the answer never exceeds the sum of the reads' own declared bounds; no write op is ever in a screen's list (a write is never batched). Test: a screen with one refused read returns it refused and the rest whole; a write op in a list is refused at the declaration.

**admission** (layer 11; the judgement stays admission's, pure, R-numbers unchanged)
- **PL12** `admit` is callable from inside the room with the session row the room holds; every refusal of R1-R12 (codes, statuses, `check`, `translation`) is answered exactly as now, in the same order, whether admission runs at the door or in the room. Test: a parity table, every refusal code of R1-R12 and R14 judged both ways with the same answer; the order test (R8 before R9 before R10 before R11).
- **PL13** The folded path counts `background` and the door window exactly as the unfolded one (P11's "keep door order and `background` counting"); a bearer (a caller by no session) is judged at the door and makes no extra call. Test: the window's count after N folded calls equals after N unfolded.

**store-door** (layer 11; the room's RPC) and **plane**
- **PL14** One RPC (`admitted(op, request)`) resolves the session, judges admission, stamps and runs the op in one call; `screenread` runs its waves inside that one call. The answer carries `in_ms` and the per-read times, which the door reports as `Server-Timing` (`do-<route>`, `in-<route>`; control-plane R121 stands). Test: a `whoami` makes one call (counted by the test double), `groupidentity` one, `bootstrap` one, `queue` one.
- **PL15** A read in a combined answer that would run longer than its declared bound is cut and answered `ok: false, status: "slow"` with the bound; the other reads are not held. Test: a read made to exceed its bound is cut; the rest answer.

**interface-shell** (layer 11)
- **PL16** A screen opens by one `screenread`; an in-app move needs no session read, no HTML and no shell file (P15: they are already absent); the shell asks again only the reads an act names as its dependants (browser.mjs:2127-2131, landed round 3). Test: opening Project makes one API request; an act re-reads only its dependants.
- **PL17** The first screens through it are Project, then Home and Queue (T52-65, T52-73), then each screen, in that order; a screen not yet converted works as today. Test: a converted and an unconverted screen on one copy, each drawn within its class.

## 4. What must be measured, and on what copy

T-a and T-b (§2). After the build: each converted screen against its class (`time-budgets-draft.md`), hops in the critical path (must equal waves plus one), and the queued-member wait while one member opens Home (the room's one thread, P24), on the scratch copy under the load test's profile. Never on biosmoke8 for load.

## 5. For BOB (technical; recommendations)

1. **Where admission runs.** `admission` is a pure layer-11 module the door uses; the fold runs it in the room. Recommend: admission keeps its code and R-numbers and `store-door` calls it from inside the room (a `uses` edge `store-door` to `admission`, if absent) rather than moving ownership of the judgement; `resolveSession` is the one part that must run beside the session rows.
2. **Whether the combined read is built in T53's first round or after the test.** Recommend: T-a first, as K4599 says; the fold (PL12-PL14) does not wait for it, since its gain (P11) is measured and independent.

## 6. What I need from other lanes

AI-DESIGN: the assistant's per-screen reads, as declared reads (the assistant adds screens and a long-running call); CAPABILITIES, FILES: each new screen's reads and their rows.
