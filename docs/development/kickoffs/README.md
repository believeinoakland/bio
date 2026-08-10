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

## The operating model (2026-07-31)

This project now runs as **CONDUCT** (orchestration/integration, formerly `ARCH`)
and **BOB** (requirements/UX/architecture with Bob) draining a shared work queue
via ephemeral workers. The model is in `docs/development/ORCHESTRATION.md`; the
live queue is `docs/development/QUEUE.md`. The area table below is the roster
those workers are drawn from — an area is a queue, not a standing agent.

## Active threads

| Thread | Owns | Kickoff |
| --- | --- | --- |
| `RECORD` | **ACTIVE, new 2026-07-31** · the store core, retrieval and the scheduler · `schema.mjs` core, `store.mjs` (not CAPTURE's link/capture/task/reachability functions), `query.mjs`, the OPS table in `index.mjs` · OWNS I3 and I5 | `kickoffs/RECORD.md` |
| `CAPTURE` | **holds the release baton** · `bio-plane/src/subresources.mjs`, `src/cpu.mjs`, capture and link tables in `src/schema.mjs`, capture ops in `src/index.mjs`, `test/subresources.test.mjs` | `kickoffs/CAPTURE.md` |
| `CONTENT-PDF` | structure AND text inside PDFs (D-91) · `bio-plane/src/pdfstructure.mjs`, `test/pdfstructure.test.mjs`, and **`pdf-worker/**` (the first fleet member, I6)** · CONSUMES I1, PRODUCES structure. Its kickoff item (3) was SUPERSEDED 2026-07-31 by the Worker-topology decision | `kickoffs/CONTENT-PDF.md` |
| `CONTENT-HTML` | **dormant, scope pending** · content inside HTML (D-64) · not yet carvable (link graph is CAPTURE's, recognizers are FRAMEWORK's, D-64 blocked on D-55) | `kickoffs/CONTENT-HTML.md` |
| `CONTENT-OFFICE` | **ACTIVE, new 2026-08-03** · the FORMAT registry and the office-format axis (XLSX/DOCX/PPTX) · `bio-plane/src/formats.mjs`, `bio-plane/src/ooxml.mjs`, the per-format entry modules and their tests/fixtures; COFF-1 moves the `HTML_CT` and `op=pdfstructure` dispatch touchpoints (named in its claim; CAPTURE/CONTENT-PDF dormant) · OWNS I7, PRODUCES I2 | `kickoffs/CONTENT-OFFICE.md` |
| `UI` | `civicos-ui/**`, `docs/development/UI-PLAN.md` | `kickoffs/UI.md` |
| `DIST` | **cuts all plane releases** · `newgroup/**`, `release/**`, `scripts/deploy.mjs`, versions and tags | `kickoffs/DIST.md` |
| `FRAMEWORK` | `docprofile/**`, `docs/architecture/BIO_Content_Framework_*`, `docs/architecture/CONSTRUCTS.md`, `docs/development/DOCUMENT-PROFILES.md` | `kickoffs/FRAMEWORK.md` |
| `SKILL` | **ACTIVE, new 2026-08-10** · the doctrine and judgement layer of `IS-BUILD-PLAN.md` (SK-2/SK-3/SK-4) · the skill/doctrine pack SK-1 landed, its versioned successors and their tests · **owns no plane path and no interface, and may never hold a GATE** — loop bounds, fan-out and the investigate-mode gate all live in FL-3's landed control-flow table (§14b.4). This is the one plan track that takes a slot without contending for `store.mjs` | `kickoffs/SKILL.md` |

**A WORKER is not an AREA.** As of 2026-07-31 the topology includes single-purpose
Workers beside the plane (`pdf-worker` first). A fleet member is one area's CODE and
DIST's RELEASE OBJECT; owning the code does not mean deploying it. See
`PARALLELISM.md`, "Deployment units are a separate axis from areas".

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

## Closing a turn: PUBLISH FIRST

**Before the decision items, before the summary, run `node tools/plancheck.mjs` and
get it green.** Added 2026-07-31 after a session left a new kickoff UNTRACKED while
three workers were already running from an earlier commit; both the rule it enforced
and the file that fixed it reached nobody. A worktree is a checkout of a commit, so
unpublished work is not "nearly landed" — it is invisible.

The check refuses an unpublished or unpushed planning surface, an ACTIVE area with no
kickoff, an item behind an unregistered interface, an unknown milestone, and an open
debt row with no disposition. Every one of those is a way a session's work fails to
reach the next session, and every one has happened here.

Three obligations it cannot check, which are yours:

- **A change that supersedes queued or in-flight work goes in the `BOB INBOX`** at the
  top of `QUEUE.md`, naming the item id (`ORCHESTRATION.md`). Whether to stop a
  running worker is CONDUCT's call; making the supersession visible is yours.
- **A kickoff your change supersedes is corrected in the SAME turn, by you** — the one
  licensed exception to "do not write another area's kickoff", because that area's
  next session is precisely who the stale text misleads.
- **Report from the remote.** "Committed" is not "pushed", and neither is "written".

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

- `ORCHESTRATION.md`, "COMMUNICATING A CHANGE" — the coordination skill: the channels,
  which carries what, and the receipts for every way a correct change reached nobody.
  Read it before making a change another session must know about
- `MILESTONES.md` — the capability ladder and where every open piece of work sits.
  Read it before deciding what an area does next; `QUEUE.md` is what is runnable
- `VERIFICATION.md` — what "tested" means here, the coverage instruments, and the
  floor a queue item must clear
- `SOURCE-ACCESS.md` — a public body refusing the record, and the standing
  position that BIO does not disguise its requests
- `MEASUREMENTS.md` — every number the project's limits rest on
- `LINK-FIDELITY.md`, `CAPTURE-SCALING.md`, `CLIENT-RENDERED.md` — designs that
  outlive the thread that wrote them
