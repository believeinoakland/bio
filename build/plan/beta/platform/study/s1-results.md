# S1 results on `plat-s1` (running record)

**Status** · PLATFORM #1, 2026-10-27. Copy `plat-s1` (installed alongside by Bob, signed 0.87.0, the alpha's code, not T53's; Level 1; no store options, so the room was placed by Bob's own request's location, `installer-steps` R41). Through the agent proxy only (K4733). Tool: the old lane's `probe.mjs` (copied, with the sign-in as `PLATS1_*`), "api done" = the last API read finished; "net" = proxy delay taken out (P18's method, 50 ms hop assumed). Nobody else is on this copy. Medians of 5 runs, ranges in brackets. Credentials never printed.

## 1a. The empty team (2 members, no project, no document), 1280 px

| screen | admin raw ms | admin net ms | member raw ms | member net ms | requests (API) |
|---|---|---|---|---|---|
| Home `/app` | 2,134 (1,876-3,317) | 638 (609-2,193) | 1,722 (1,550-2,861) | 656 (628-748) | 35 (25) admin, 30 (20) member |
| Queue | 1,441 (1,241-4,245) | 579 (525-592) | 1,332 (1,236-2,137) | 579 (573-745) | 22-23 (13) |
| Held | 1,487 (1,231-1,817) | 577 (575-603) | 1,345 (1,154-2,198) | 589 (542-682) | 21-22 (12) |
| Inbox | 1,503 (1,095-2,320) | 597 (565-612) | 1,193 (1,019-1,957) | 568 (539-582) | 19 (10) |
| Add | 1,238 (1,076-3,764) | 592 (534-606) | 1,119 (1,075-1,539) | 588 (488-609) | 21 (12) |
| Projects | 1,342 (1,267-2,113) | 592 (571-631) | 1,211 (1,144-1,275) | 627 (565-628) | 23 (13) |

**Reading.** Every screen of an empty team is drawn within 2.2 s raw and 0.7 s net, inside the 2 s bar with the proxy's delay in or out, except tails to 3.3-4.2 s raw (one run each of Home, Queue, Add): the proxy's tail (P18) or a cold object, not separable from one sample set. The floor is therefore about **0.6 s net**, with 19-35 requests a screen, the same frame the alpha made (P23: 13-26 reads on a team with data).

**The hop.** `do-session` is **50-57 ms**, `do-doorwindow` 54-66 ms and `do-<op>` 51-102 ms on plat-s1, against 108-135 ms on biosmoke8 in P23 (its room in Frankfurt). `in-<route>` is 0 throughout. The room's placement near the team about **halves the hop** (one sample set; the proxy's own part, P18, is the same for both). This is the placement gain K4747 bought, measured on an empty room; on a team with data the in-object time returns (P24).

## What is not yet measured (next)
Seed A (1b) and the screens on a team with data; Project and Document screens (they need a project and a document); the other sizes; the ramp; per-table bytes (needs the proto redeploy).
