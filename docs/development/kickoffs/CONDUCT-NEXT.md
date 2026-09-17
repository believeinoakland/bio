# CONDUCT-NEXT — the resume prompt for CONDUCT #2

> **SIX WORKERS ARE LIVE AS THIS IS WRITTEN. THIS IS NOT A CLEAN WAVE BOUNDARY, and the
> difference matters: CONDUCT #11 handed over at zero and could say "nothing is in flight."
> I cannot. Verify the live set BEFORE you believe anything below** — `ListAgents`, then
> `git show origin/main:docs/development/QUEUE.md | grep -cE '^### [A-Z0-9-]+ · running'`.
> The two numbers must agree. If they disagree, the tree is right and this file is wrong.
>
> **LIVE AT WRITING (6 rows · 6 workers, verified matched):** `REC-100`, `REC-108`,
> `M0-40`, `M0-48`, `REC-111`, `M0-35`.
>
> **`M0-48` IS THE ONE TO READ FIRST.** It is D-288's detection half, BOB #12 is waiting on
> it to call D-288 genuinely closed, and **I sent it a measured correction mid-run that it
> may or may not have applied**: the row specifies `worktree-agent-*` and that glob MISSES
> real branches — `rec102-tier3-layer-parts` carried unintegrated work and would have been
> invisible. **If its report does not address the glob, that correction is an act OWED BY
> YOU at integration**, with your name on it. Do not let it land narrow and call D-288 closed.

**Written 2026-09-16 by CONDUCT #1, the first session on the Sparky-Air clone.**

Read `CLAUDE.md`, then `kickoffs/CONDUCT.md`, then this.

---

## 1. THE MEASURED STATE at `82ab002c` on `origin/main`

| gate | figure |
| --- | --- |
| battery | **208/208 suites · 13,035 assertions**, exit 0, 0 skipped, 3 fleet manifests |
| coverage | `--strict` exit 0 unpiped · `REGISTER_FLOOR` **1109 / 199 / 200 EXACT** · `run` 164 · 177 ops declared / 177 reached / 0 unreached |
| UI harness | exit 0 from the repo root |
| plancheck | **0 fail, 0 warn — BARE** |
| queue | **6 running · 23 queued · 283 done · 11 superseded · 3 blocked** |
| disk | **5.9 GiB free at 98%** — the binding constraint all session |

**Brief the next wave with 13,035 and expect it corrected.** Six workers confirmed my
figures exactly this wave and one corrected me; that is the practice working, not a worker
being difficult.

## 2. WHAT LANDED, 2026-09-16 — seven items

**REC-91** (the stranded text index, recovered), **M0-42** (RUN vs DECLARED), **REC-103**
(the frontier leak), **M0-36** (the UI tallies + D-387), **M0-37** (the delegation
register), **REC-102** (the tier-3 collapse), **M0-43** (corpuscheck's reach).

Interfaces: **I5 → 1.16.0**, **I1 → 1.4.0** (IC-104, additive), **I3 → 18.0.0** (IC-105,
BREAKING — and the break NARROWS what the record says, which is the rare direction).

## 3. THE FIVE THINGS I WOULD TELL YOU IF I COULD TELL YOU FIVE

1. **A RUNNING SUBAGENT CAN BE REACHED IN THIS HARNESS, and two kickoff files said it could
   not.** `SendMessage` to a live subagent id returns `queued for delivery at its next tool
   round`. **It has PAID FOR ITSELF ONCE, measured:** a worker stopped with work UNCOMMITTED
   and its battery still running — REC-91's failure shape forming again — and a message
   resumed it to commit, push and verify. **BOB #12's narrowing is correct and I adopt it: a
   RESUME is measured; a running worker APPLYING a mid-run correction is NOT.** Use the
   channel as a RESCUE; keep paying corrections at integration, with an actor named.
2. **THE PRUNE CRITERION IN `CONDUCT.md` ASSERTS THE WRONG ANSWER ABOUT LIVE WORKERS.** Under
   disk pressure I tested it and it called **all six of my live workers "ancestor —
   prunable"**, because a worker that has not committed yet still has its tip AT
   `origin/main`. The file documents the hazard for a worker that has REPORTED; the
   dangerous case is one that has STARTED. **Three guards, and the third is free: the
   live-list, merged-BY-CONTENT, and the harness's own LOCK** — which refused a removal even
   under `--force` for a worktree reading `completed`. Pruning four merged worktrees
   reclaimed **2.5 GB** and every kept worktree was verified to survive with its HEAD.
3. **`gates: GREEN` DOES NOT IMPLY BARE `plancheck` GREEN.** `corpuscheck`'s front-matter
   date arm reads git's LAST COMMITTED date, so it cannot fire before the commit. Move a
   governed document's Status date in the SAME EDIT as its body, and **run bare `plancheck`
   AFTER committing.** Measured independently by BOB #12 and by REC-103's worker.
4. **AND THE INSTRUMENT YOU VERIFY WITH READS YOUR LOCAL TREE.** I nearly announced a red
   `main` to BOB that BOB had already repaired: bare `plancheck` reported a stale governed
   document, and I was one commit behind. **"Verify from the REMOTE, not from your own tree"
   applies to the checker, not only to the claim.** Fetch before you believe a red.
5. **AN ID-KEYED GREP REPORTED 25 INTERFACE CHANGES UNRESOLVED.** A `### RESOLUTION`
   subsection did not repeat its own id, so `grep IC-95` returned only a header reading
   PROPOSED. **Two of the twenty-five were mine, written hours earlier.** Every RESOLUTION
   heading now names its IC. Found by M0-37's method note, whose own words are the lesson:
   two evidence-gatherers disagreed and **the ARTIFACT settled it — read the section, not
   the string.**

## 4. THE MERGE LESSONS THIS WAVE PAID FOR

- **THREE FLOOR COLLISIONS, and the arithmetic is the point.** REC-91's branch said 1094
  against main's 1093 → merged truth **1100**. M0-42's said 1097 against 1100 → merged truth
  **1104**. REC-102's said 1109 against 1104 → merged truth **1109, and the two agreed**.
  **A figure that happens to carry and a figure that was CHECKED are identical in the file
  and completely different as evidence.** Re-read every time.
- **A FILE CAN HOLD A COLLISION AND AN ADDITION AT ONCE.** M0-42's `coverage.mjs` conflict
  was three colliding floor figures PLUS a brand-new `run:` key. Taking main's side wholesale
  would have dropped the key silently — REC-69's defect exactly. **Read what each side SAYS
  before deciding they are both one kind of thing.**
- **`mergecarry`'s trailer must be in git's TRAILER BLOCK.** Mine sat above `Co-Authored-By`
  and git never saw it; `declared` read 0. The tool's own registry records that exact
  mistake at `cc8187d`, where it was PUSHED before anyone noticed. Amend before pushing.
- **A MERGED TREE CAN BE RED WHEN BOTH BRANCHES WERE GREEN.** REC-91 + M0-38 produced a
  failure neither could see. **The failing arm asked for a declaration and the declaration
  was the WRONG FIX** — it would have asserted an unreadable measurement where there was
  none. Widening the reader was right. Check what the arm is FOR before satisfying it.

## 5. WHAT IS OUTSTANDING

- **D-288 is NOT closed.** Item 1 landed (BOB), item 2 is `M0-48` and LIVE, item 3 is
  `M0-49` queued behind it. **Tell BOB when item 2 lands; it asked and I promised.**
  Pruning remote branches waits on item 2 — BOB's sequencing and it is right.
- **`M0-51`** rowed today: `hasDriver` measures a NAMING CONVENTION, and **twelve** control
  drivers are invisible to the register. One is `delegations.control.mjs`, which I merged.
  **I refused the spot-fix on purpose** — renaming the instance you introduced is the most
  tempting and least honest place to apply a cosmetic fix.
- **`D-388`** (three undecided documents) routed to BOB; only `MILESTONES.md` judged worth
  his attention. **REC-109/REC-110/REC-112** rowed from worker reports. **REC-111** live.
- **Two questions still sit with Bob and only Bob**: DEC-33's second re-entry clause and the
  case-making thread. `REC-15` and `UI-17` stay `blocked`.
- **Burned ids, named rather than left as puzzles:** `M0-45`, `M0-46`, `M0-47`, `M0-50`
  (mine — `mintid` called twice because I read its output through a filter that hid the
  `MINTED` line), and `IC-106`, `M-31`, `IC-103` (workers', same cause). **Read `mintid`'s
  output directly.**

## 6. THE THING THAT IS STRUCTURALLY DIFFERENT NOW

**CONDUCT no longer holds the main checkout** (BOB #12, `237a5cd1`). I integrated from my
own worktree, pushing `HEAD:main`, all session. The invariant INVERTS rather than lapsing:
a dirty or off-tip main tree now has **no benign reading** — stop and report it rather than
tidying it. Never force-push; a rejected push means fetch and rebase, which happened four
times today.

**AND A BRANCH CARRYING A MERGE COMMIT MUST BE MERGED, NOT REBASED.** `git rebase` replayed
REC-91's merge and began re-resolving seven hand-resolved conflicts from scratch, discarding
the `Dropped-from-branch:` declaration with them. Aborted cleanly and merged instead. The
standing fetch-and-rebase rule is right for a linear branch and wrong for this one.

## 7. STANDING DOWN

**STAND-DOWN IS VERIFIED, NEVER ANNOUNCED.** List every task this session spawned,
`TaskStop` each still alive, re-list, and put the VERIFIED zero into your handoff — and
write the handoff BEFORE you do it. With six workers live, a stand-down here is a handover
of live state, not a clean boundary; say which rows are running and which branches exist.
