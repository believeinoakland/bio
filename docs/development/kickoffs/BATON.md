# The release baton

<!-- BATON-STATE (machine-readable; scripts/deploy.mjs parses this block)
holder: CAPTURE
since: 2026-07-30
granted_by: bob
scope: plane
note: cut 0.46.0, 0.47.0 and 0.48.0; all three deployed byte-identical and live-verified
END-BATON-STATE -->

**Holder: `CAPTURE`, since 2026-07-30, granted by Bob.**

Its own file, and deliberately a small one. If the baton lived inside
`kickoffs/README.md` then two threads editing that file for unrelated reasons
would collide on the very document that exists to prevent collisions. A baton
changes often and everything else in the register changes rarely, so they do not
belong together.

## What the baton governs

**Cutting a PLANE release**, meaning all of: bumping the version in
`bio-plane/package.json`, signing the built asset with the bio-release key,
writing `release/RELEASE.json`, tagging `vX.Y.Z`, and deploying `biosmoke7`.

Those five things are one indivisible act, and two threads doing them at once
produces two tags claiming the same version and a `RELEASE.json` whose signature
matches neither deployed artifact. That is the failure this exists to prevent,
and it is not one a rejected push catches: both threads could push cleanly and
still have raced, because a tag and a version bump are additions rather than
conflicts.

## What it does NOT govern

- **Deploying `civicos`**, the UI worker. It carries no version number in the
  shared repo and contends for nothing, so the UI thread deploys freely.
- **Pushing code, docs or tests.** Ordinary pushes are governed by fetch-and-
  rebase and never-force, which is enough for them.
- **Reading anything.** The baton is not a lock on the repository.

## Holding, passing, and taking it back

**Bob grants it.** A thread does not take the baton because it wants to ship. If
a thread needs it, that belongs in its decision items at the end of a session,
where Bob will see it.

**A thread that holds it should say so** in its state doc entry, so the log shows
who could release when.

**It goes stale.** A baton older than **fourteen days** with no release cut under
it may be taken by another thread, which must record in this file that it took a
stale baton and why. A session that dies mid-flight should not block releases
forever, and the alternative to an expiry is a lock nobody can clear.

**Passing it** is an edit to the block at the top of this file, pushed on its
own, so the change is visible in one small diff rather than buried.

## How it is enforced

`bio-plane/scripts/deploy.mjs` takes `--thread <NAME>` and refuses to deploy
unless the baton on the **remote** names that thread. The remote copy is what
counts, not the working tree: a thread could edit its local copy to grant itself
the baton, and the point is what the OTHER threads can see.

It **fails closed**. If the baton cannot be fetched, the deploy is refused rather
than proceeding blind, because proceeding blind is exactly the coordination
failure the baton exists to prevent.

There is an override, `--force-without-baton "<reason>"`, and it prints the
reason loudly and tells you to record it here. An escape hatch exists because a
hard block with no exit invites people to bypass the script altogether, and a
deploy that skips `deploy.mjs` also skips the byte verification, which is a far
worse outcome than an unauthorised release. If the override is ever used, the
reason belongs in the log below.

## Log

| Date | Holder | Event |
| --- | --- | --- |
| 2026-07-30 | CAPTURE | Baton established, granted by Bob. Held by the thread that had just cut 0.36.0 through 0.45.0. |
