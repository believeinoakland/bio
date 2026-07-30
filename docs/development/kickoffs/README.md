# Kickoff register

Established 2026-07-30, after two sessions ran concurrently and both rewrote the
same kickoff file. Nothing was lost, because the second push was correctly
rejected and rebased by hand, but that was luck: both threads happened to be
editing only prose. Had either touched `store.mjs` or `index.mjs`, the loser of
the race would have faced a real merge or the temptation to force.

**One kickoff per THREAD, not one per project.** A session is told at the top of
its prompt which thread it belongs to, reads only that thread's file, and at the
close rewrites only that thread's file.

## How a session starts

The first line of the pasted prompt names the thread:

```
Kickoff: thread CAPTURE. Read docs/development/kickoffs/CAPTURE.md from
raw.githubusercontent.com/believeinoakland/bio/main and follow it.
```

Everything else the thread needs is in that file: what to read, what to do in
what order, the grant slots, and the standing knowledge for that line of work.
A session that has not been told its thread should ask rather than guess, because
guessing wrong means rewriting another thread's handoff at the end.

## Active threads

| Thread | Owns | Kickoff |
| --- | --- | --- |
| `CAPTURE` | **holds the release baton** · `bio-plane/src/subresources.mjs`, `src/cpu.mjs`, capture and link tables in `src/schema.mjs`, capture ops in `src/index.mjs`, `test/subresources.test.mjs` | `kickoffs/CAPTURE.md` |
| `UI` | `civicos-ui/**`, `docs/development/UI-PLAN.md` | `kickoffs/UI.md` |
| `FRAMEWORK` | `docprofile/**`, `docs/architecture/BIO_Content_Framework_*`, `docs/architecture/CONSTRUCTS.md`, `docs/development/DOCUMENT-PROFILES.md` | `kickoffs/FRAMEWORK.md` |

**Owns** means: this thread may rewrite these paths freely. It does NOT mean
other threads may not read them, and it does not make ownership permanent. A
thread that needs to change another thread's files should say so in its decision
items rather than doing it quietly, because the other thread will not know.

## Shared files, and the rule for them

These are written by more than one thread and are the collision risk:

- `docs/development/DEBT.md` — **append only.** Take the next free D-number at
  the moment you write, not at the moment you planned to. If two threads take
  the same number, the second to push renumbers rather than the first.
- `docs/development/CIVICOS_UI_STATE.md` — **prepend a new entry.** Never edit an
  existing one. Version numbers may collide; the date and thread name
  disambiguate, so put both in the entry's first line.
- `docs/development/MEASUREMENTS.md` — **append a section.** Never restate a
  figure inline elsewhere; point at this file so a stale number has one home.
- `bio-plane/**` outside a thread's owned paths — coordinate first. Two threads
  editing the plane concurrently is the case that would actually hurt.

## The rule that matters most

**Fetch and rebase before pushing. Never force-push `main`.**

A rejected push means another thread has landed work. The correct response is to
reset onto the remote, re-apply your own additions on top, and check that the
other thread's work survived. It is never to force. Anything you cannot re-apply
cleanly is a decision item for Bob, not something to resolve by overwriting.

If your work is additive (new files, appended sections) this costs minutes. If it
is not, that is a signal the thread boundaries above need redrawing.

## Releases: one baton, and it is enforced

**`kickoffs/BATON.md` names the single thread that may cut a plane release.**
Bob grants it; a thread does not take it because it wants to ship.

This is the one coordination rule that could not be left as a convention.
Fetch-and-rebase catches ordinary collisions because they are conflicts. A
release race is not a conflict: two threads can each bump the version, sign, tag
and push CLEANLY, and the result is two tags claiming one version and a
`RELEASE.json` whose signature matches neither deployed artifact. Git sees
additions and reports success.

So `bio-plane/scripts/deploy.mjs` takes `--thread <NAME>` and refuses unless the
baton on the REMOTE names that thread. The remote copy is what counts: a thread
could edit its local copy to grant itself the baton, and the point is what the
other threads can see. It fails CLOSED, refusing when the baton cannot be read,
because proceeding blind is the failure it exists to prevent.

There is an override, `--force-without-baton "<reason>"`, which prints the reason
loudly and must be logged in `BATON.md`. It exists because a hard block with no
exit invites bypassing `deploy.mjs` entirely, and a deploy that skips that script
also skips the byte verification, which is far worse than an unauthorised
release.

Deploying `civicos`, the UI worker, is NOT gated: it carries no version number in
the shared repo and contends for nothing.

A baton older than fourteen days with no release under it is stale and may be
taken, with a note in the log. A session that dies mid-flight must not block
releases forever.

## Cross-cutting documents

Some findings belong to no thread and to all of them. File them as their own
document and cross-reference from the threads that care, rather than burying them
in a kickoff only one thread reads:

- `SOURCE-ACCESS.md` — a public body refusing the record, and the standing
  position that BIO does not disguise its requests
- `MEASUREMENTS.md` — every number the project's limits rest on
- `LINK-FIDELITY.md`, `CAPTURE-SCALING.md`, `CLIENT-RENDERED.md` — designs that
  outlive the thread that wrote them
