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
| `DIST` | **cuts all plane releases** · `newgroup/**`, `release/**`, `scripts/deploy.mjs`, versions and tags | `kickoffs/DIST.md` |
| `FRAMEWORK` | `docprofile/**`, `docs/architecture/BIO_Content_Framework_*`, `docs/architecture/CONSTRUCTS.md`, `docs/development/DOCUMENT-PROFILES.md` | `kickoffs/FRAMEWORK.md` |

**Owns** means: this thread may rewrite these paths freely. It does NOT mean
other threads may not read them, and it does not make ownership permanent. A
thread that needs to change another thread's files should say so in its decision
items rather than doing it quietly, because the other thread will not know.

**Two paths were added to CAPTURE on 2026-07-30**, both previously unowned rather
than another thread's: the link and capture functions in `store.mjs`, and the
capture and authority checks in `bio-checks`. Unowned is not the same as
somebody else's, but it is the same collision risk, and `store.mjs` is the
largest file in the repo. If a thread finds itself needing an unowned path twice,
that is the signal to name an owner rather than to keep editing quietly.

## Closing a turn: DECISION ITEMS

**Every turn ends with the decisions that are BOB'S, and with nothing else.**
Reinstated 2026-07-31, after the practice quietly lapsed across the 0.49.0 to
0.53.0 sessions: those turns ended with status and with scattered asides of the
"say the word if you'd read that differently" kind, which is not the same thing
and does not work. A decision buried in a paragraph of results is a decision
nobody makes.

It lapsed the first time because it had gone bad in three specific ways. Each
one now has a test the session applies BEFORE writing an item down.

1. **It is not a decision if the answer already exists.** If the repository, a
   standing ruling, or a measurement settles it, it is not Bob's to settle.
   Resolve it, and record WHERE the answer came from so the resolution can be
   checked. Asking about something already ruled is worse than not asking,
   because it invites re-litigating settled doctrine.

2. **It is not a decision if the session is better placed to make it.** Naming,
   file structure, test shape, algorithm, schema layout, which of two equivalent
   mechanisms: decide these, and do not narrate the deliberation. Bob's judgement
   is for what his judgement actually changes — DOCTRINE (what the record means
   and what it may claim), PRIORITY (what gets built and in what order), RISK HE
   CARRIES (legal exposure, relations with the City, anything with his name on
   it), and EFFECTS ON PEOPLE OUTSIDE THIS PROJECT (load or blocks landing on
   third parties, anything a member or a source experiences).

3. **It is not a decision item if it cannot be acted on without reading the
   diff.** State the choice in the terms of the RECORD, not the code. A reader
   who has not seen the session's work should be able to decide from the item
   alone.

**The shape of an item.** Enough to decide, and no more:

- what is running NOW, stated as a provisional decision rather than a fact
- why it was genuinely ambiguous, in one line
- the alternative, stated fairly enough that choosing it is easy
- a RECOMMENDATION, because a session that has done the work owes a view
- what reversing it costs, and specifically whether it gets more expensive once
  data exists under the current choice

**Ship provisional decisions only when they are cheap to reverse.** If a
provisional choice would be expensive to undo, it is not a decision item at the
end of a turn; it is a reason to stop before shipping and ask.

**An empty list is a real answer.** A turn with nothing genuinely Bob's says so
in one line and stops. The list is not a quota, and padding it re-creates
failure mode 1.

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
