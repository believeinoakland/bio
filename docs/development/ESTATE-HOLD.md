# Which machine holds the estate

**One machine develops this repository at a time.** Two machines under two Claude accounts, both
believing they hold it, is the one collision nothing else here protects against: claims keep two
SESSIONS out of one tree, worktrees keep two sessions out of one checkout, and neither knows a
second MACHINE exists.

## THE HOLD — one line, because two claimants must collide

**Every field a reader needs is on the single line below, and that is the point.** The first
version spread machine, status and expiry across a TABLE, so two machines claiming at once could
edit different rows and git would auto-merge BOTH claims into a file naming one machine and
another machine's expiry — a textual merge of a semantic conflict. One line forces the conflict
git is good at. **Read this line, never the prose.**
    HOLD: machine=vm-4237ad91 | account=believeinoakland | status=HELD | through=2026-09-16T21:21Z
**Timestamps are ISO 8601 UTC with the `Z`, always.** The first version wrote a bare date, so two
machines in different zones could disagree by a day about whether a hold had expired — an expiry
that is not a fact in one clock is not an expiry.

**HELD 2026-09-16 by the first CLOUD machine, which also found the identity defect below.** The
outgoing Mac Mini released it (BOB #11 released it, re-claimed it to land this file's corrections and
the `plancheck` arm that enforces them — developing the lock without holding the lock would have been
its first violation — and released it again); the evidence for that release was `origin/main` unmoved
for 16 hours at `93ecbd5`, *"work suspended at the operator's direction"*, zero rows reading
`running`, and no session alive on it. **Had that second release been missed, the hold would have
expired on its own**, which is the correction this file's first version earned.

## How to take it — ONE COMMAND, because a prose protocol is performed differently by every reader

**Run the tool. Do not hand-edit the HOLD line.**

    node tools/estatehold.mjs show       # who am I, and who holds it
    node tools/estatehold.mjs claim      # take it: writes, gates, commits, pushes, verifies
    node tools/estatehold.mjs refresh    # extend it, inside an act you already perform
    node tools/estatehold.mjs release    # at stand-down

**This replaced five prose instructions per claim, and that is why it exists.** The first version of
this section told a session to rewrite a whole line with four fields — one of them a timestamp in a
format the predicate refuses three different ways, one of them an identity the session had no
correct way to compute — then to commit, then to push, then to read a rejected push as a lost race
rather than rebasing. **Five chances to get it wrong per claim, on the one instrument nothing else
here can check.** `CLAUDE.md`'s rule is that a mechanism which is not in the loop the reader
actually runs is not a mechanism; a protocol nobody can execute identically twice is the same
failure wearing prose. **RULED 2026-09-16: the acts are the tool, and this section points at the
tool rather than describing the edit.**

What the tool guarantees, so that no reader has to remember it:

1. It reads the HOLD line from **`origin/main`**, never from the working tree, which may be a
   checkout of a commit taken before another machine claimed it.
2. It **refuses** when another machine holds it unexpired, names that machine, and **writes
   nothing** — a refusal that edited the file would be the lock failing open.
3. It refuses to claim under an identity that **does not discriminate** (see the next section).
4. It runs `plancheck` first and refuses on any FAIL, so a claim never goes out of a tree that is
   already broken.
5. It commits **only this file, by path**, so it is safe to run in a tree with unrelated work in it.
6. On a **rejected push** it fetches, names the winner and STOPS. **It never rebases and
   re-pushes**, which is the one reflex that defeats the lock.
7. After pushing it re-reads `origin/main` and reports the verdict — **the push is the allocator, so
   a claim is not taken until the REMOTE says so.** A step that publishes a claim and a step that
   makes it true are two steps, and the gap between them is where every wrong status in this project
   has lived.

**`node tools/plancheck.mjs` ENFORCES this** — it reads the HOLD line from `origin/main` and REFUSES
when another machine holds it unexpired, and when this machine's own hold has expired. It warns,
visibly and by name, when nobody holds it, because a machine must be able to COMMIT the claim that
makes it compliant; that bootstrap is the reason the free case is not a refusal, and it is stated
here so a later reader can revisit it rather than infer it.

## WHO "THIS MACHINE" IS — the lock's second failure, and it failed OPEN

**The predicate was right and the identity fed to it was wrong.** `plancheck` derived this machine's
name inline as `scutil --get ComputerName` || `hostname -s`. On the Claude Code cloud image
**`hostname -s` is literally `vm` for every container**, and identity is an exact string match — so
two cloud machines read each other's hold as their OWN. Driven through `estateVerdict` on
2026-09-16, before anything was changed:

| the hold says | read by | verdict |
| --- | --- | --- |
| `machine=vm` | the Mac Mini | `theirs` — correctly refused |
| `machine=vm` | **another cloud container** | **`ours` — no refusal, no warning, just a note saying it holds the estate** |
| `machine=<a distinguishing name>` | the machine that wrote it | `theirs` — it refuses itself |

**Row 2 is the whole lock failing open**, and it is worse than a missing lock because the second
machine is told it HOLDS the estate. Row 3 is why writing a better name could not fix it: identity is
matched against a value the tool computes, so **the tool is what had to change**.

**RULED 2026-09-16: identity is `<base name>-<8 hex>`, where the suffix is a random id persisted in
the clone's COMMON gitdir** (`.git/bio-machine`, never committed), minted on first use with an
exclusive create. `machineIdentity()` in `tools/estatehold.mjs` is the only reader of that question
and `plancheck` prints what it derived, every run, as a note.

Why that and not a platform fact — the alternatives were available here and were **rejected for a
stated reason, not overlooked**: `/etc/machine-id` may be baked into an image and shared by every
container from it, **which this session could not measure having only one container**, so resting the
lock on it would repeat exactly the unverified-premise mistake that produced the defect;
`CLAUDE_CODE_CONTAINER_ID` and the session id are Claude-specific, so the Mac and the cloud would
derive identity by different rules and only one of them would ever be exercised. A minted id is
**distinct because it is minted rather than observed**, uniform across platforms, stable across turns
and suspensions, and **shared by every WORKTREE of one clone** — the correct grain, because one
machine is one identity however many lanes it runs. It is the pattern `mintid.mjs` already trusts for
the id ledger.

**Two consequences, stated rather than left to be discovered.** A machine that RE-CLONES gets a new
identity, so an ephemeral container is a new machine every session — which is the honest answer and
the reason the window below is short for one. And a machine crossing this change finds its own
earlier hold unrecognisable: the tool says so when the hold names its base name, but that is
informative and never permissive — **let it expire, or rewrite it in the commit that upgrades the
rule**, which is what this change itself did.

## CLAIM BEFORE YOU VERIFY — the ordering, ruled

**RULED 2026-09-16, at Bob's direction: a machine claims the estate BEFORE it runs the battery and
the rest of its startup verification, not after.** The claim's own gate is **`plancheck`** — the
claim is a one-line change to this file, which `gates.mjs` classifies docs-class — and **not** the
full battery, which is what made the old ordering look necessary.

The old ordering had a session verify first and claim after, which is wrong twice. It spends nine
minutes on this machine and up to twenty-five on others **before discovering it lost the race**, and
everything it then did it must discard. And it inverts the point of the lock: the window in which two
machines are both doing real work is exactly the window the lock exists to close, so the claim
belongs at the FRONT of the startup sequence, where it costs seconds. **Nothing is lost by claiming
early: the hold expires on its own, so a machine that claims and then fails its own gate has not
stranded the estate** — which is the property `held through` was added for.

## Why `held through` and not `held since` — this file's own first failure

**The first version of this file was released by nobody and it failed within hours, exactly as the
class predicts.** It carried `held since` and instructed a session to release at stand-down, which
made the release a VOLUNTARY ACT BY A SESSION THAT MIGHT NOT SURVIVE TO PERFORM IT. The integrator
was then suspended mid-flight at Bob's own direction, never reached the stand-down the instruction
named, and **the hold outlived the condition it was holding for** — the machine stopped developing
and the file went on saying it held. That is the third of `CLAUDE.md`'s six doors, reproduced in a
new file hours after being written down.

**`held since` makes staleness a JUDGEMENT with two causes** — still working, or died holding it —
which is why the first version had to end *"only Bob breaks a hold"*, putting the human back in the
common case. **`held through` makes expiry a FACT**: a hold past its date is expired whatever the
reason, no adjudication, no escalation. The two-cause absence disappears because nothing has to be
inferred from silence.

**The 48 hours is a bound, not a measurement**, and it is deliberately generous: the cost of an
over-long window is a new machine waiting, and the cost of a short one is a working machine losing
its lock. If a real window is ever wanted, measure the longest legitimate gap between pushes across
a wave and set it from that.

## What is NOT covered

This lock governs DEVELOPMENT — commits, pushes, spawns, deploys. Reading the repository, running
`plancheck` locally, and reading the published record are safe from any machine at any time: none of
them changes anything another machine can see.

**But safe is not the same as sensible, which is what the claim-before-you-verify ruling above
settles.** The battery is safe for the repository and it is not free: it costs nine to twenty-five
minutes and it is work you discard if you then find you lost the race. So the honest reading of this
section is narrow — *reading is never a violation* — and it is not licence to do a startup sequence
unlocked.
