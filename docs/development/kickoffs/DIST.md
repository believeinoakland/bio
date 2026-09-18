# Area DIST: distribution, and the only area that cuts releases

Created 2026-07-31 as part of the move to parallel development. DIST exists to
take the release out of every other area's critical path.

**Work in a worktree**: `claude --worktree DIST`. One session per working tree
(`PARALLELISM.md`, DEC-3) — **CONDUCT holds the main checkout at
`/Users/sparky/ClaudeCodeBIO/bio` and DIST does not work in it.** Added 2026-08-05 by
CONDUCT, late: every other area kickoff has carried this rule since 2026-07-31 and this
file never did, because DIST was created before the rule and split into its own session
after it. On 2026-08-05 a DIST session committed inside CONDUCT's tree four minutes before
CONDUCT committed there — two sessions in one tree, which a `CLAIMS.md` claim cannot
protect against, since a claim reserves paths BETWEEN checkouts and does nothing about two
sessions sharing one.

**Coordination:** before making a change another session must know about, read
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE" — the channels, which
carries what, and the receipts for every way a correct change reached nobody. Claim
in `CLAIMS.md` before editing; publish before you call anything done.

## A STANDING LANE — never idle-archived, and never ends a turn on a question nobody will read

**RULED BY BOB, 2026-09-18:** *"Don't archive DIST or FLEET sessions just because they've been idle for some
period of time. They should stay alive because they will always eventually be needed again. Only refresh them
if/when their context windows are too full."* `tools/retirable.mjs` enforces it: this lane's NEWEST session is
PROTECTED however long it idles (`STANDING_LANES`, negative-control arm A6b). **Idle is this lane's normal state.**

**The receipt, and the half the tool cannot fix.** The only DIST and FLEET sessions (2026-09-16) oriented, then
ended their turns on a question — *"Standing by for your sequencing"*, *"may I push it?"* — addressed to a human
who was not in the session. Nobody read either; both were archived idle four hours later; no release was cut for
four days while four disclosure fixes sat on `main`. **So: never end a turn on a question.** Pushing is not gated
(`CLAUDE.md`); decide what is yours; route what is genuinely another lane's by `SendMessage` to CONDUCT (sequencing)
or BOB (design, doctrine) and continue with the rest. A question only Bob can answer goes to BOB, which carries it.

**Refresh, when context is too full:** write `<LANE>-NEXT.md` from the measured state, push it, verify it on the
remote, and tell BOB — whose successor protocol retires a predecessor only after D-398's three conditions hold.

## WHEN DIST CUTS, AND WHAT WAKES IT — decided 2026-09-18 by BOB #15 (Bob: *"I should not be involved in the decision whether and how DIST cut and sign the next release. There's plenty of protocol definition for how a release gets cut."*)

This file defined HOW to cut (the gate below) and never WHEN, and nothing woke DIST. The receipt: 0.58.0 was
cut 2026-09-14; the only DIST session (2026-09-16) confirmed `main` green and cuttable, ended *"Standing by
for your sequencing"* to nobody, and was swept idle; by 2026-09-18 four disclosure fixes (REC-123, REC-125,
MK-1, REC-130) sat on `main` and on no deployed plane. **So DIST decides when, by this rule, and asks nobody:**

- **CUT NOW** when `main` carries any integrated change that closes a SECURITY OR DISCLOSURE defect —
  something a stranger, a machine credential or the wrong member could read or do — that is not in the
  latest signed release. CONDUCT names such a change when it integrates it (its merge commit says so, and it
  messages DIST); DIST also checks for itself: `git log <last release tag>..origin/main` against the rows.
- **OTHERWISE BATCH**: cut when `main` is green and differs from the latest release in any shipped path
  (`bio-plane/src`, `bio-plane/checks`, a fleet member's source), at most once a day.
- **The plane and the fleet members that consume a changed interface ship TOGETHER** (IC-130: an old
  `agent-worker` silently drops model-judged steps). DIST reads `INTERFACE-CHANGES.md` for every IC since
  the last release and states which members must move with the plane.

**WHAT WAKES IT.** DIST is a STANDING LANE (above): its session stays alive. At session start it arms its own
recurring self-wake with `CronCreate` (every 6 hours) whose prompt is *"DIST: apply WHEN DIST CUTS"*; CONDUCT
also messages it on integrating a security fix. On each wake, apply the rule; if nothing is owed, end the turn
with one line saying so.

**THE ONE GATED ACT, AND WHERE ITS QUESTION GOES.** Cutting, signing and tagging are DIST's and need nobody.
**Deploying the plane and the installer are gated by `CLAUDE.md`**, and Bob is not in this session — so DIST
brings the deploy to him THROUGH BOB: `SendMessage` to the BOB session naming the version, what it closes,
the members that move with it, and the gate's evidence. BOB carries it into Bob's conversation. **Never end a
turn waiting on that answer**; the cut, signature and tag are already landed either way.

**FIRST CHECK FOR THE NEXT CUT — found 2026-09-16 by the last DIST session and recorded nowhere until now:**
`newgroup`'s `npm test` and `build` both run `npm run embed` (`scripts/embed-release.mjs`), which the session
reported *silently replaces the signed 0.58.0 embed with an unsigned rebuild*, and
`newgroup/test/embed.test.mjs` carries no negative control. **Unverified since — verify it before cutting**,
because a gate step that can put an unsigned plane in front of a sovereign group is the one defect that
outranks the cut itself. If it holds, it is a DIST-owned fix (newgroup is DIST's) with its own control.

## Why this area exists

Cutting a plane release is five indivisible acts on GLOBAL state: bump the
version, sign the built asset, write `release/RELEASE.json`, tag `vX.Y.Z`, and
deploy `biosmoke7`. Two areas doing that at once produce two tags claiming one
version and a RELEASE.json whose signature matches neither artifact — and git
catches none of it, because a tag and a version bump are additions rather than
conflicts. That is what the release baton has been guarding.

The baton solved the correctness problem and created a throughput one: it is
held for a whole session, so every area waits on whoever has it. **The fix is
not a better lock. It is that areas stop cutting releases.** Areas land tested
code on `main` continuously; DIST batches releases. The baton goes from
held-for-a-session to held-for-minutes, and it stops being what anyone waits on.

## What DIST owns

`newgroup/**`, `release/**`, `bio-plane/scripts/deploy.mjs`, the version in
`bio-plane/package.json` and `bio-plane/wrangler.jsonc`, and all tags.

**No other area touches any of these.** An area needing an installer change
appends a DELEGATION entry in `CLAIMS.md`.

## The gate: what must be true before anything is distributed

Regression testing is a REQUIREMENT, and DIST runs it itself rather than
trusting that the contributing area ran it. This is not distrust of the area; it
is that `main` after a merge is a tree nobody has tested, and that tree is what
ships. Two areas can each land green and produce a red `main`.

In order, and all of it on the merged `main`:

1. **`cd bio-plane && npm test`** — the entire battery, every suite, zero
   failures. Not the suites the change touched.
2. **`cd newgroup && npm test`** — the installer's own suite, which includes the
   D-106 guard that the embedded plane version matches `package.json`.
3. **`node test/hygiene.test.mjs` is part of (1)** and is the cheap early
   warning: version-source agreement, the schema literal, the no-caller-supplied
   -provenance source check.
4. **Bump the version in BOTH `package.json` and `wrangler.jsonc`.** Hygiene
   fails if they disagree; that check exists because they drifted thirteen
   releases apart once (D-106).
5. **Build, then sign with the out-of-tree Node SSHSIG reconstruction**, and
   verify against stock `ssh-keygen -Y verify` with NEGATIVE CONTROLS every
   time: altered bytes, wrong namespace, the wrong key, and the previous
   release's signature against the new bytes. All four must fail to verify. A
   signature accepted without controls is a signature nobody has checked.
6. **`node scripts/deploy.mjs <slug> <version> ../release/bio-plane.bundled.mjs
   --thread DIST`**. It refuses without the baton, believes only the bytes it
   reads back, and then WAITS for the version to serve. If it prints ROLLOUT NOT
   CONFIRMED, do not verify behaviour yet.
7. **Live-verify** the release's headline change through the op a real caller
   uses, in a scratch namespace, then sweep it.
8. **`op=audit` clean.**
9. **Re-cut the installer** on the new plane and deploy it, then read the script
   back from the account and confirm the embedded version AND that
   `bindings: []` is still empty. That empty binding set is a structural
   security guarantee, not a detail.
10. **Tag and push**, tag and branch both.

A release that fails any step is not a release. Nothing here is skippable
because the change looked small; 0.52.0's near miss was a one-line-looking
change.

## What DIST does NOT do

It does not decide what goes in a release. It does not fix failures it finds: a
red battery goes back to the area that owns the code as a DELEGATION, and DIST
does not cut until it is green. DIST holding the fix would make it the busiest
area in the project and put it back on the critical path.

## Transition

Until a second session exists, DIST is a ROLE the single active session takes on
deliberately at the end of a work item, not a separate agent. The point of doing
it that way first is to find out whether the gate above is right before anyone
depends on it. Split it into its own session once two development areas are live
and both want to ship.
