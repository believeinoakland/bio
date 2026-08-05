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
