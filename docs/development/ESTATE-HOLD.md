# Which account holds the estate

**One ACCOUNT develops this repository at a time** — RULED by Bob 2026-09-16: *the estate gate is
held per account, not per session.* One account may run many sessions on many machines; they are one
holder and they share the hold. Two ACCOUNTS both believing they hold it is the one collision nothing
else here protects against: claims keep two SESSIONS out of one tree, worktrees keep two sessions out
of one checkout, and neither knows a second account exists.

## THE HOLD — one line, because two claimants must collide

**Every field a reader needs is on the single line below, and that is the point.** The first
version spread machine, status and expiry across a TABLE, so two machines claiming at once could
edit different rows and git would auto-merge BOTH claims into a file naming one machine and
another machine's expiry — a textual merge of a semantic conflict. One line forces the conflict
git is good at. **Read this line, never the prose.**
    HOLD: machine=Sparky-Air-c47d80fb | account=acct-13711d31 | status=HELD | through=2026-09-18T20:29Z
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

## WHO THE HOLDER IS — THE ACCOUNT, and the code got this wrong twice in one day

**The unit is the ACCOUNT: the estate gate is held per account, not per session.** Bob, 2026-09-16,
RULED. One account may run as many sessions and as many machines as it likes — they are one holder
and they share the hold. A DIFFERENT account is refused. That is the collision this lock exists to
prevent, and it is the only one it is trying to prevent.

**`account=` is the load-bearing field. `machine=` is a label** for a human reading the line, so it
says where the work was happening. Nothing turns on it.

**Both of this file's implementations got the unit wrong, in OPPOSITE directions, and they are kept
here because a reader who knows only the fix will reintroduce one of them.**

**v1 keyed on the hostname.** `plancheck` derived the holder from `scutil --get ComputerName` ||
`hostname -s`. A hostname identifies no account at all, and on the Claude Code cloud image it is the
constant `vm` for every container — so the load-bearing question was answered by a value incapable of
answering it, while the `account=` field sat beside it as a **hand-typed literal**. The one field
that mattered was the one nothing derived.

**v2 keyed on the clone, and was wrong the other way.** It replaced the hostname with a random id
minted per clone: distinct, stable, well-tested — and it would have **refused an account its own
estate**, because a second session is a second clone. It was written to close a "fail-open" where two
cloud containers read each other's hold as `ours`; under this ruling **that was never a defect**.
Two containers of one account agreeing is correct. v2 measured the mechanism accurately and
mis-named the unit, which is the more expensive half of the error and the one no test caught, because
there were no tests.

**The rule now: the holder key is derived from `oauthAccount.accountUuid` in `~/.claude.json`,
hashed to eight hex** — RULED by Bob, 2026-09-16. Hashed rather than written out because this line
lives in a repository, and an account UUID in it would be an identifier disclosed for no benefit —
the lock needs two accounts to DIFFER, not to be readable. `accountIdentity()` in
`tools/estatehold.mjs` is the only reader of that question, and `plancheck` prints the key it
derived on every run, beside the machine label.

**`CLAUDE_CODE_ACCOUNT_UUID` was the primary and is demoted, because the rule rested on a claim
about the environment that nobody had measured.** Measured on a desktop session, 2026-09-16:
twenty-six `CLAUDE_*` variables present and NOT that one. So `accountIdentity` fell through to the
per-clone id, an account read ITS OWN unexpired hold as another holder's, and `plancheck` refused
by name — **naming the very machine it was refusing as "another machine"**. That is v3 of this
file's unit error: not the hostname of v1 and not the clone of v2, but the right unit read from a
source that is not there, which degrades to v2 silently and wears v1's error message. The lesson
that generalises past this file: **a fallback that announces itself in a NOTE while the refusal
above it states the opposite is not an announcement.**

Why this source, measured rather than reasoned: the uuid is UUID-shaped; it is SERVER-ISSUED, since
the record holding it also carries `profileFetchedAt`, `seatTier`, `billingType` and
`organizationRole`, none of which a machine could mint; and it is distinct from the sibling
top-level `machineID`, which is not UUID-shaped — **so the config's own schema separates the account
from the machine, which is the separation this lock turns on.** It lives in the HOME directory and
not in the repository, so every clone and every worktree on one machine derives ONE key, which is
exactly the property the per-clone fallback lacks.

**WHAT IS NOT YET MEASURED, AND IT IS THE LOAD-BEARING HALF.** Only ONE account's config has ever
been read. That the uuid DIFFERS across two accounts is a property of the field's construction and
not an observation, and the estate has been burned twice by exactly that distinction. **The arm that
would settle it is one reading of `oauthAccount.accountUuid` and `oauthAccount.emailAddress`
together, taken while signed in as the other account** — differing email with differing uuid
confirms the rule; differing email with the SAME uuid disqualifies this source outright. Until that
reading exists, this rule is the best-supported candidate and not a verified one, and it is recorded
here as such rather than as settled.

Fallbacks, in order, each NAMED in the output so a reader sees which applied: `BIO_HOLD_ACCOUNT` for
an explicit value and for controls; then the config uuid above; then `CLAUDE_CODE_ACCOUNT_UUID`, for
a platform that has the variable and no config file; then the per-clone id, which is **not
account-scoped and says so**, so the two-accounts collision is still caught on a machine with
neither; then nothing, reported as not discriminating, where the tool REFUSES to claim rather than
claim under a key that cannot discriminate.

**A holder crossing this change finds its own earlier hold unrecognisable**, because the old line's
account field was a literal rather than a derived key. The tool says so when it sees an undervived
field, but that is informative and never permissive: **let it expire, or rewrite it in the commit
that upgrades the rule**, which is what this change itself did.

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
