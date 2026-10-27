# Time budgets: a budget for every screen and op (draft)

**Status** · DRAFT, READY for PLANNING except where a line says "Bob's". PLATFORM #1, 2026-10-27. Input: K4354 (Bob's bar), K4599, PERFORMANCE P1-P26 (digest of the archive; figures are `lane-performance/BASELINE.md` and P23-P26: biosmoke8, administrator, 1280 px, net of the proxy, medians of at least 4 on a copy with walkers present).

## 1. What a budget is

A budget is a ceiling stated once per screen or op, kept in the module that owns it, and measured on a named copy. Today K4354's bar is one sentence (screen 2 s, act 2 s, web capture 15 s), and nothing in the source says which screen is over it; each miss was found by hand (P2, P6, P23). The beta makes the bar a table the code and the tests read.

**Two figures per entry, because time is not the only thing a screen can overspend.**
- **The time ceiling**, drawn or answered, measured as P23 measured it: net median over at least 5 runs on a quiet copy, with the p90 allowed up to 1.5 times the ceiling.
- **The structure ceiling**: critical-path calls to the room (hops) and reads in waves. A hop costs 108-135 ms (P11, P23; hint-placed rooms to be re-timed). A screen's floor is therefore its hops times the hop cost plus the room's own time, and the structure ceiling is what makes the time ceiling reachable on a slow day without a re-measure. The 2 s bar leaves at most 8 hops once the shell, the draw and the room's work are paid (P15's model).

## 2. The classes and their ceilings (K4354 stands; tighter figures are Bob's, §5)

| class | ceiling | critical-path hops | where measured today |
|---|---|---|---|
| Full load of a screen (1280 px) | 2.0 s | 3 after the combined read (session, one screen read, one draw); 12 today | P23: Home 1.80, Queue 1.82, Project 1.62, Held 1.58, Inbox 0.90, Document 1.19, Add 1.39, Projects 1.19 (admin); Home 1.97, Queue 1.67, Held 1.94 (member) |
| In-app move | 2.0 s (Bob may set 1.0 s, §5) | 2 after the combined read; 6-10 today | P15: Home 2.0, Project 1.3, Question 2.1, Document 1.5, Timeline 1.0, Held 0.6 |
| Full load at 390 px | the same as 1280 | the same | P23: 1.04-1.77 s |
| Read act (a list, a look) | 1.0 s | 2 | P26: groupidentity 0.32, projectlist 0.23, publishedlist 0.5-1.1, heldcaptures 0.8-1.7 (over) |
| Shell act (a setting, a level) | 0.5 s | 1 | 0.35-0.43 s |
| Write act (share, reply, prepare, confirm, conclude) | 2.0 s | 2 | 5.1-7.5 s before round 3; **not re-timed** (P26) |
| Web capture, plain | 5 s | n/a | 2.35 s |
| Web capture, as a visitor sees it | 15 s (K4354) | n/a | 5.0-11.2 s |
| Capture of a file up to the K4628 bound | acknowledged within 2 s with `fetch_pending`; reading runs behind a stated progress | n/a | 8.8 MB 0.59 s, 15.9 MB 0.90 s (P25) |
| The reading itself, whole file | a stated rate floor, not a total (FILES owns the rate; read stage ran 0.69 MB/s, P12) | n/a | open |

Larger files cannot meet one total (a 100 MB document at today's rate is minutes); what a member needs is the acknowledgement and the progress, so the budget is the answer and the rate floor, not the end (P12's open large-file bar, Bob's if he wants a time promised, §5).

## 3. The screens and ops that carry an entry

Every registry screen (`docs/development/ux-substrate/`) and every op (`op-declarations`) carries an entry; a new screen or op from any lane arrives with its entry or its job does not close (MAP.md §2: "every lane to PLATFORM: a time budget for each screen and op it adds"). The default for an entry not stated is the class ceiling. The measured eight (Home, Queue, Project, Held, Inbox, Document, Add, Projects) are already within the 2 s; the registry's others share the frame (about 15 reads, P14) and were never timed: the first job of the plan is to time them (L1, §6).

**What the budgets say about the code that is over.**
- Held's `heldcaptures` (241 KB, 0.8-1.7 s alone) is asked by Home, Queue, Held, Add and Document (P24) and queues the door window behind it (989-1,423 ms): it leaves the first wave and returns as a picker on open, or the room's one thread stays the tail.
- Home's `in-` time of 1.4 s (queue 331 ms, `casedrafts` x5, `heldcaptures`) is the room's work, not a hop: a combined read does not help it (P15), so its budget is kept by kept counts and cached roll-ups (G80, G12a, G12c).
- Write acts are the largest unknown. Until timed they carry the class ceiling as an unmet claim.

## 4. Requirement lines (draft; module owners proposed, PLANNING places them)

**runtime-limits** (layer 1; keeps `PLATFORM_FIGURES`, R34)
- **PL1** `TIME_BUDGETS` is a frozen map `class -> {ceiling_ms, p90_factor, hops}` for the nine classes of §2, with `source` naming the ruling (K4354) or `PLATFORM.md` row; `budgetOf(class)` answers a row and throws an `Error` naming the class when none exists. Test: each class by `budgetOf`, an unknown class, the map deeply frozen.
- **PL2** A per-screen or per-op row names its class and may override `ceiling_ms` downward (a faster promise); an override above its class's ceiling is refused. Test: an override above the class refused, below accepted.

**op-declarations** (layer 11; owns each op's and screen's declaration)
- **PL3** Every op spec and every screen declares its `budget_class`; a declaration with none is a check finding (`proc check`). Test: a spec with none is reported by the check, one with an unknown class refused.
- **PL4** A screen's declaration lists its reads by name and wave (the combined read's input, `combined-read-and-fold-draft.md` PL10); its hop count is derived (one for the session, one per wave), never typed. Test: the derived count equals the declared waves plus one.

**journey-check** (layer 11; the deployed copy's walker) and a measuring tool (§6)
- **PL5** The budget check opens each screen as the role named, at 1280 and 390 px, 5 runs at least, and reports the net median and p90 against `budgetOf(class)`; a screen over is a finding naming the screen, the figure and the slowest request; it never changes a copy's data and never prints a credential. Test: a fixture copy with one screen delayed beyond its ceiling reports exactly that screen.
- **PL6** The check reports the structure figures (hops in the critical path, requests, repeats) beside the time, from the door's `Server-Timing` (`do-<route>`, `in-<route>`; control-plane R121). Test: a request chain of known hops reports that count.

**screens (all)**: a new screen's UX needs arrive with its budget class (no design from this lane).

## 5. The beta's bar: ANSWERED (K5438, Bob on P1, option A)

Bob: "keep the current bar, but also recognize that different sized teams will require different levels of capabilities (Team, Institution, Enterprise)...". The bar stays as §2 states it, at every level; each level's range is the range within which it holds (`service-levels-draft.md` PL26-PL28). Options B and C below are kept for the record only; the classes in §2 stand as written (in-app moves and read acts keep their 2 s and 1 s as measured today; no tighter figure is adopted).

The question as put:

K4354 said "A for now, we may want to look at further reductions once the alpha-level workflow is done". The alpha's workflow is done; the beta can keep the bar or tighten it. This is policy, so it is Bob's.
- **A. Keep K4354's figures** (2 s screen, 2 s act, 15 s capture). Lowest cost; the 8 measured screens already meet it, so the beta's work is holding it as the product grows and under load (§6 of `load-test-draft.md`). *Recommended.*
- **B. Keep 2 s for a full load; 1 s for an in-app move and a read act.** P15 shows in-app Held 0.6 s and Timeline 1.0 s are within it today; Home (2.0) and Question (2.1) need the combined read (K4599) and the kept counts, so it rides the work already planned. A member feels in-app moves most, because that is most of a session.
- **C. Tighten everything to 1 s.** Not reachable on Level 1 with the hop at 110-135 ms unless the screen is one hop; it would force every screen onto the combined read and a cache, and is a redesign.

A second, smaller question: whether a large file's reading time is promised to the member, or only the acknowledgement and progress. *Recommend only the latter.*

## 6. What must be measured, and on what copy

- **L1** The registry's untimed screens, and the write acts, on a seeded `PERF` project the lane owns (P14, P26); biosmoke8 after its re-creation in western North America (K4747): the first figure to take is whether the hop fell from 108-135 ms (P23's "before").
- **L2** Each budget re-timed after each deploy that BOB names, quiet copy, net of the proxy (K4733).
- **L3** Under load: the per-level load test (`load-test-draft.md`), on a scratch copy, never biosmoke8.

## 7. What I need from other lanes

CAPABILITIES, FILES: each new screen or op, with its class and its estimated reads, and the rows and bytes it adds to a team's record (MAP.md §2). UX-DESIGN: nothing yet; the budgets name no design.
