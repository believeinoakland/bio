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

    HOLD: machine=none | account=none | status=RELEASED | through=1970-01-01T00:00Z

**Timestamps are ISO 8601 UTC with the `Z`, always.** The first version wrote a bare date, so two
machines in different zones could disagree by a day about whether a hold had expired — an expiry
that is not a fact in one clock is not an expiry.

**RELEASED 2026-09-16 by the outgoing machine, and the release is now belt-and-braces.** BOB #11
released it, re-claimed it to land this file's corrections and the `plancheck` arm that enforces
them — developing the lock without holding the lock would have been its first violation — and
released it again here. **Had that second release been missed, the hold would have expired on its
own**, which is the correction this file's first version earned.

**Evidence for the release:** `origin/main` had not moved for 16 hours at `93ecbd5`, *"work
suspended at the operator's direction"*; zero rows read `running`; no session on this machine is
running. A new machine may claim it.

## How to take it, and why the push is the mechanism

1. `git fetch origin` and read the **HOLD line** from `origin/main` — never from your own tree.
2. **It is free when `status=RELEASED`, or when `through` is in the past** (compare in UTC).
   Otherwise STOP: name the machine and its `through`, and do not develop, spawn or push.
3. **Claim it by rewriting the WHOLE line** — machine, account, `status=HELD`, `through` = now + 48 h
   in UTC — then commit and **push to `main`**. **The push is the allocator.** A rejected push means
   you lost the race: fetch, read who won, and STOP — do not rebase and re-push, which is the one
   reflex that defeats this.
4. **REFRESH INSIDE AN ACT YOU ALREADY PERFORM**, never as a separate chore: rewrite `through` when
   you push a planning surface, and at every integration. `plancheck` fails you if the hold has
   expired under you, so the refresh is enforced rather than remembered.
5. **Release at stand-down**: `status=RELEASED`, `machine=none`, `through` in the past.

**`node tools/plancheck.mjs` ENFORCES this** — it reads the HOLD line from `origin/main` and REFUSES
when another machine holds it unexpired, and when this machine's own hold has expired. It warns,
visibly and by name, when nobody holds it, because a machine must be able to COMMIT the claim that
makes it compliant; that bootstrap is the reason the free case is not a refusal, and it is stated
here so a later reader can revisit it rather than infer it.

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
`plancheck` locally, and reading the published record are safe from any machine at any time.
