# CONDUCT — resume here. Written 2026-08-10 by the outgoing CONDUCT, which was asked whether it was still healthy enough to run.

**The answer was: the error tell says yes, the map tell says no — and the map tell wins.**
That distinction is the most useful thing in this file, so it is first.

Read `kickoffs/CONDUCT.md` (the loop), then `WORKER.md`, then `ORCHESTRATION.md`'s
"Concurrency". Then `git fetch` and verify the state below yourself rather than believing it.

> ## THE MAP MOVED AFTER THIS FILE WAS WRITTEN — addendum, 2026-08-10, session BOB
>
> Everything below this box is the outgoing CONDUCT's account and stands as written;
> a full BOB session ran after it. What changed, so you verify against `ad7d210` (or
> later), not `cc99ec1`:
>
> - **The BOB INBOX now holds FIVE undrained entries, not two** — the two below, plus:
>   the retired-substrate removal (Bob's instruction, enacted, DEC-67 answered), the
>   decision register drained from the corpus (**five entries decided and awaiting YOUR
>   enactment** — plancheck's warn names them — plus **three work items**: the
>   accepts-without-reading measurement, the DEC-51 capture-note render, the DEC-43
>   fleet-visibility report), and `tools/gates.mjs`. **Draining is still step 0.**
> - **Your gate discipline has a surgical profile: `node tools/gates.mjs`.** It measures
>   the diff; docs-only prose runs the doc-facing suites plus `plancheck --local`
>   (~20 seconds), one non-docs path runs the full four unchanged. `CLAUDE.md` carries it.
> - **`DECISIONS.md` was rolled** — 55 settled entries to
>   `docs/archive/ledgers/DECISIONS-2026-08.md`; the live file is the open list plus
>   three byte-read pins (DEC-39 for `affordances.test.mjs`, DEC-32/33 for the UI
>   vocabulary derivation). **Do not archive those three.**
> - **`CORPUS-STUDY.md` lives at `docs/archive/CORPUS-STUDY.md`** now; its consolidation
>   is executed and superseded in part (the banners came out with the substrate text).
> - **D-205 is CLOSED** — `BIO_ADMIN_TOKEN` rotated by Bob and verified in both
>   directions. The generalisable half stays open in the row.
> - The expected battery figures moved with the DECISIONS roll and the sweep; measure
>   your own baseline as always. The `/tmp/mfp` residue below REMAINS — a fourth
>   attempt (sandbox-escape `rm`) was declined; it still needs a hand outside the
>   sandbox.

## State at handoff — GREEN and PUBLISHED

**Verified by this session on the consolidated tree at `cc99ec1` AND re-verified at
`39b246b` after another session pushed on top of it — not inherited from a note.** The
figures below are identical on both, and the commit carrying this file adds only prose
plus two `DEBT.md` rows (so expect `planning-hygiene`'s tally to rise by a small amount
and nothing else to move):

- battery **157/157 · 9,841 assertions**
- `node bio-plane/scripts/coverage.mjs --strict` **exit 0**, read UNPIPED
- `node civicos-ui/test/run.mjs` **exit 0** from the repo root — but read D-286 below before you trust a single run of this one
- `node tools/plancheck.mjs` **0 fail / 0 warn**
- working tree clean, local even with the remote, **zero workers running**

**ONE FIGURE MOVED AND IT IS FULLY ATTRIBUTED, because a figure that moves without an
explanation is how this project loses things.** Assertions fell 9,950 → 9,841 across the
same 157 suites. The whole −109 is **`planning-hygiene.test.mjs`, 315 → 206**, and
**nothing else moved** — measured by differing two full runs, not by subtraction. The
cause is benign: that suite asserts PER DEBT ROW, and the consolidation archived 110
closed rows, so its corpus shrank.

**But the finding underneath it is not benign and is owed as a question.** That tally has
no floor — it fell by 109 and nothing failed. So it is *not a ratchet*: a row silently
vanishing from `DEBT.md` would lower it with nothing to notice. That is the slack-never-
fails shape, one instrument over. **Do not fix it by adding a floor without thinking** —
a floor on a figure that legitimately falls whenever the corpus is consolidated would
fire on the next honest roll. The honest instrument is probably a delta with the corpus
size PRINTED, which is the shape M0-14 and D-265 both landed on.

## ONE OF YOUR FOUR GATES IS INTERMITTENTLY RED. IT IS D-286 AND IT IS NOT A REGRESSION.

**The UI harness answered EXIT 1 on `39b246b` and EXIT 0 on a re-run with nothing
changed**, and I nearly recorded that as a red `main`. It is not. `ai-session-context.
test.mjs` draws its fixture AT RUNTIME with no seed, and on the failing run it drew
`inquiry 1278/3354` beside `project 2076/5981` — **3354 − 1278 = 2076 exactly**, so a
derivation ARM D forbids became indistinguishable from a figure the record published.
ARM D0b is the instrument arm that watches for precisely that, and it fired correctly.

**Do not weaken D0b and do not close this by re-running until it is green.** The guard is
right; the unseeded draw is wrong. Full row and the two ways to close it are in D-286.

**What it means for you operationally: when the UI harness fails, read WHICH arm.** If it
is D0b, re-run once and check the arithmetic in the fixture line — the suite prints it.
Any other failure is real. **The rate is a sample of one in six runs in one session and
is NOT established**, which is why the row says so instead of rounding it to "rare".

## WHY THIS SESSION HANDED OFF, because the reasoning is the point and not the verdict

**The error tell, measured honestly, was PASSING.** Two mistakes in the whole session,
and both landed inside instruments, which is the thing `CONDUCT-NEXT` teaches you to
watch for:

1. **I read `plancheck`'s exit status THROUGH A PIPE** and reported `EXIT=0` when it was
   1 — the documented class (`cmd | tail` reports tail's status), committed inside the
   gate itself. Caught by me on the next call and every gate after was read unpiped.
2. **I left a `<<<<<<< HEAD` marker in `coverage.mjs`** while resolving the file whose own
   rule is HAND-EDIT ONLY. Caught by `node --check` before it reached a commit.

**AMENDED AFTER THE FACT, BECAUSE THE CLASS DID EVENTUALLY NARROW AND THE HONEST ACCOUNT
IS THE ONE WRITTEN LAST.** Two more followed, and they are ONE class: **a hand-rolled check
of mine returning a FALSE NEGATIVE, inside the act of verification.** I ran `plancheck` from
`bio-plane/` and read `MODULE_NOT_FOUND` as a gate failure; then I wrote a shell loop to test
whether three branches were on the remote, mis-quoted it, and it answered NOT ON REMOTE for
three branches that `git ls-remote` shows are all there at the right shas. **Both were FALSE
REDS, which is the safe direction — but the direction is luck, not design, and the same bug
class in the other direction is a false green.** Four mistakes: two false greens caught by
instruments, two false reds from instruments I wrote myself in the moment.

**THAT IS THE CONVERGENCE TELL, and it is the reason to stop rather than the map alone:
my last two errors were both my own ad-hoc verification lying to me.** `WORKER.md` already
carries the general form — *if you ever write a wait of your own, its negative control is one
command: run the predicate once with nothing running* — and I wrote two predicates and ran
the control on neither. **Nothing reached a commit and everything pushed is green and was
verified FROM THE REMOTE**, but do not read the clean result as a clean process.

**What made me hand off is a different tell, and it is worth naming because the existing
account does not contain it: MY MAP WAS INVALIDATED WHOLESALE, MID-SESSION.** The corpus
was consolidated while I ran — 7.35 MB → 3.56 MB, `QUEUE.md` 931 KB → 83 KB with a new
`## CLOSED ITEMS` register I had never read, `DEBT.md` 110 rows lighter, `CLAIMS.md` 1.69
MB → 26 KB, a new gate (`plancheck` fails on a stale `DECIDED.md`) and a new tool
(`decided.mjs`) I had never run. **Every structural fact I was holding described a tree
that no longer existed.** A session that briefs a worker from a stale map is the exact
failure the last three CONDUCTs each paid for, and I would have spent my remaining
context re-reading what you get for ~295k tokens on a clean start.

**So the general rule, and it belongs beside the saturation rule rather than inside it:
hand off when your MAP dies, not only when your JUDGEMENT does.** They are different
failures with the same remedy, and the map one is easier to miss because nothing you do
feels wrong.

## What this session did, so you do not re-derive it

**Four merges, each verified: `--is-ancestor`, then `mergecarry` (0 DROPPED on both
merges that carried files), then `mintid --audit` (0 breaks).**

- **D-267** (`0110ffe`) — the severance predicate the three reverse-edge readers share.
- **UI-53** (`a7b027f`) — the four hand `BANNED` lists become consumers of one derived family.
- **D-263** (`35bc9dc`) — REC-68's dropped provenance recovered, the pin's corpus walk guarded.
- **D-264 CLOSED** — CPDF-9's dropped closure of D-232 restored VERBATIM from
  `1c5d96a^2`. **The two row bodies were compared byte for byte FIRST**, so the restore
  could not smuggle in a drifted body, and **the recovered sentence was re-checked against
  a live run rather than trusted** (D-263's rule: restoring a false sentence is worse than
  the gap). Both now live in `docs/archive/ledgers/DEBT-closed-2026-08.md`.
- **`REGISTER_FLOOR` moved twice from PRINTED runs**, 771 → 782 → 792, hand-edited both
  times, and **`VERIFICATION.md`'s register row moved twice with it** (135/632 → 152/792)
  — the first time in nine consecutive items that anyone moved it.

**THE HANDOFF I WAS GIVEN SAID FOUR BRANCHES WERE UNMERGED. THERE WERE SIX.** D-270 and
D-263 were not named in it and both held content absent from `main` — checked with
`git cat-file -e origin/main:<a file the item added>`, which answered ABSENT for each.
**A handoff is a claim, not a measurement**, and that is the `--is-ancestor`/content
asymmetry arriving in prose instead of in git. **Check this file the same way.**

**Six queue statuses were stale and are corrected**, every one content-checked: PL-17,
PL-18, PL-19, PL-20, D-269, D-271 all read `queued` or `running` with their work already
on `main`. **PL-18 read `queued` outright** — the exact shape of a brief that sends a
worker to rebuild something that exists.

## THREE BRANCHES ARE GREEN AND UNMERGED. TWO ARE DELICATE.

| branch | item | why it is still here |
| --- | --- | --- |
| `worktree-agent-aafee89563a3f2d42` | **D-270** | Ordinary. The session gate is TWO conditions and for five ops it was sending the wrong one. Touches `coverage.mjs` — expect a floor conflict and HAND-EDIT it. |
| `worktree-agent-a9e7e017d06799858` | **UI-43** | DELICATE. Collides with UI-45 inside `civicos-ui/app.html` across ~68,000 chars, AND is coupled to D-271 — read the `INTEGRATION ORDER` note. D-271 is on `main` now, so the ceremony's one-line `affirmed` wiring and its two false sentences are owed IN THE SAME TURN. **Parse `main`'s `app.html` first so you know a failure is the merge and not your instrument.** |
| `worktree-agent-a61e489de171ae6c5` | **D-254** | DELICATE. Restructures `check-refusal-codes.mjs` into module-plus-script; STRUCTURAL, not a floor collision. |

**ALL THREE ARE NOW ON THE REMOTE** (`git ls-remote --heads origin 'worktree-agent-*'`),
pushed by session BOB as BACKUPS and verified by sha: D-254 `9e24ef6`, UI-43 `9706d19`,
D-270 `484ed35`. **They are not merge requests and nothing about the order above changes.**
Before this they existed on ONE MACHINE ONLY — see **D-288**, which is the general defect:
137 local worker branches, zero on the remote, so this project's own channel rule was false
for every worker's output between reporting and merging. **Do not read the other 134 as
backed up.**

**Safe to delete — landed by content, stale forks only:** `worktree-agent-a90a87bcb7f131e59`
(REC-60) and `worktree-agent-adefd8db6571e8b30` (IS-6). Both look unmerged to
`--is-ancestor` and both have their content on `main`.

## FOUR WORKERS WERE SPAWNED AND THEN STOPPED. THE ROWS ARE ON `main`.

I opened a wave on **D-280, D-282, D-265 and D-251**, wrote all four `QUEUE.md` rows
BEFORE spawning, and then **Bob asked for a stable repo and I stopped all four ~25
minutes in.** Each worktree is dirty with **ZERO commits**, so nothing is lost by
removing them: `agent-af7765c3bfcacc67d`, `agent-a2db2aa4eae632eac`,
`agent-a5fcc3c710d7c7e68`, `agent-a67b8573f18aa7277`.

**The rows are the durable part and they are on `main` — re-spawn against them, they were
written to be spawned from.** Two things they carry that you should not re-derive:

- **D-282 and D-265 both reach `test/hygiene.test.mjs`**, stated in their rows rather than
  hidden. Measured evidence says that class of conflict costs one hand resolution.
- **D-281 was deliberately NOT spawned and should still not be spawned inside a wave.**
  Closing it needs one honest 8-battery run on a QUIET machine; a wave would measure the
  wave. That is the instrument-answering-about-itself class, and it is the one thing on
  the board that is scheduling-sensitive rather than dependency-sensitive.

## Owed, and none of it is blocked

- **TWO UNDRAINED `BOB INBOX` ENTRIES** at the top of `QUEUE.md` — the `decided.mjs` gate
  and the corpus consolidation. **Draining them is step 0 of your loop and I did not do
  it**, deliberately: enacting an architectural change from a dead map is worse than
  leaving it visible. **Do this first.**
- **IC-39 through IC-57** — nineteen resolutions and version bumps, untouched. `CORPUS-
  STUDY.md` deliberately did NOT roll `INTERFACE-CHANGES.md` so they stay visible.
- **The four HELD claims in `CLAIMS.md`** (UI-42, REC-69's replay, REC-79, D-249), all
  2026-08-09. **Releasing them is CONDUCT's call, which is why BOB left them** — and I
  left them too rather than release four claims from a stale map. **All four items are
  landed by content and I checked each**: `version-review.test.mjs`,
  `refusal-partition.control.mjs`, `d249-port.control.mjs` present, and REC-69's replay
  is real (`airuns.test.mjs` present, `RUN_CONTEXTS` at 3 sites in `store.mjs` — note the
  loop's own text still describes REC-69 as reverted, which was true before the replay).
- **D-248's six pre-existing id collisions.** `D-124`'s two rows are deliberately adjacent
  in the live `DEBT.md` with a comment saying why — separating them made `mintid` read the
  collision as resolved.
- **D-288** — worker output lives on local-only branches. **Its fix is a DECISION between
  three shapes and it is not a worker's**; the row states all three with their costs.
- **D-286** — the UI harness's unseeded fixture, above. **D-287 is a GAP I created** by
  running `mintid D` twice; it is recorded as its own row rather than left to be found,
  because a silent gap and a lost row look identical and this ledger exists so they do not.
- **13.6 MB of dead residue at `/tmp/mfp` and `/tmp/mfp-m0-10-arm`.** THREE sessions have
  now failed to remove it; the sandbox refuses paths outside the working directory. It
  needs someone who can reach outside, and that is the whole of it.

## One orchestration fact you will not find in the record

**For a stretch of 2026-08-10 another session was writing directly into the MAIN
checkout** — it created `docs/DECIDED.md`, `tools/decided.mjs` and `CORPUS-STUDY.md`
there and edited `CLAUDE.md` and `tools/plancheck.mjs`, then withdrew on its own. I never
staged any of it and my commits contain only my merges' files. **But `plancheck` was
briefly a MODIFIED INSTRUMENT while I was running it against my own merge**, and I did not
notice until I looked at `git status` for another reason.

**The lesson is not "one session per working tree", which the record already says. It is
that a gate you did not write and did not check is a gate whose VERSION you are
assuming** — and this project's whole posture is that an instrument answering about
itself reads as a measurement of something else. If your tree is dirty in `tools/`, your
gate results are dated to a build you cannot name.
