# screens-daily (T49)

**Status** · session_01K3B1SwGYL8nCwqykgeAT82 · depth 2 · WORKING · handled B1

## J1 · QUESTION

START measurements (your note 1):

1. **R29, `projectlist`'s participation state: it answers none.** `projectList` (`project-roster/index.mjs`:744) answers `{id, name, stage, owner, members, activity, lastChange}` per project; `members` are `{member, handle}` with no state, so an invited member's row cannot be told from a joined one. `membership.participation()` has the state but `projectlist` does not carry it. My best reading: project-roster (T49-2) adds `participation` (`"joined"` or `"invited"`, absent for a viewer with none: an administrator seeing a discoverable project) to each row of `projectlist`, and R29 is met on that. I build against it now: a row with `participation: "invited"` draws "Join" (`projectjoin`, `{projectId}`) on `projects` and in Home's "Needs you"; any other row does not. Tested over a fake plane answering that field. If project-roster will not add it, tell me and I report R29 as not met rather than guess from `members`.

2. **`cite`'s `found` form (R24).** `project` is the citing object, "a case or a question" (citation R1); `question` is optional and only names the question the passage was looked for, changing no other judgement. `role` is required on an inquiry (`NO_ROLE`, `BAD_ROLE`) and refused on a project (`ROLE_NOT_APPLICABLE`). So "Cite in the question" with a role must name the question itself as `project`; sending the question as `question` too is accepted and says why it was looked for. A project id as `project` could not carry the role. I send `{project: <question>, question: <question>, found, role}`, the role chosen on the screen. The question's own project is not needed by `cite`, and the search hit does not carry it. Say if you read R24's "that question's project" differently.

3. **R25, the title.** `screens-inquiry/project.mjs`:93 reads the `title` field of the project document's frontmatter (`doc.title || id`); `home.mjs`:319 and `projects.mjs` write only `objective:` there (and `meta.title`). I write `title:` into the frontmatter beside `objective:`.

## J2 · QUESTION

BLOCKER for R29 (decides whether `SCREENS` loads at all): "Join" (`projectjoin`) as an act of `projects` and of `home`.

`checkScreens` (interface-shell R21) throws, for the whole page, on an act that is neither the registry's for that screen nor a named re-point (`RE_POINTS`, `interface-shell/index.mjs`:109). `SCREEN_REGISTRY` (wizard-scripts, re-taken at PR #34) lists `projects`: `promote` only, and `home`: `release, adoptversion, keepversion, filingapprove, taskresolve, promote, startfrom`. The design stream's `registry.json` in the tree already lists `projectjoin` on `projects` and on `queue`, but not on `home`. No T49 job re-takes wizard-scripts' registry or adds the re-point.

My best reading: interface-shell (T49-20) adds `projects: ["projectjoin"]` and `home: ["projectjoin"]` to `RE_POINTS` (R55's form, "until the registry lists it"), and the registry re-take (an ask in your channel act) drops them later. I have built both screens with the act, tested against that.

If you will not add the re-points, say so, and I draw "Join" on Home and Projects as a link to the project's own screen, which lists `projectjoin` (R29's "Join (`projectjoin`)" then met on `project`, not on these two). Until the answer, the pushed module loads only once the re-points exist.

Also for your channel act / the owners:
- `queue` items carry no subject title (queue Terms: `subject` is `{kind, id}`; a task's `summary` is its subject text, often an address). R28 draws a subject's title from `subject.title` or the item's `title` when the plane carries one (as `source-modified` items do, queue-producers R40), else `queue.source.untitled`. For R28 to name the title on a real task, queue must carry `subject.title`.
- `retrieval.findIn` answers no document title: its scope echo and its items hold `capture_sha`, `extent`, `words` only. R26 names a project scope by its title (read with `image`), and a document scope or a result by its title when the answer carries `title` (scope or item) and otherwise by "This document" and its passage, never by a digest. For R26 on a real document, `findIn` must answer the title.
- `queue.source.untitled` now reads "A document with no title, captured {date}": the item carries no capture date; I fill `{date}` from `captured` or the item's `age.since`.
- No key holds a plural/singular pair for: `screen.queue.more`, `screen.find-in.notread`, `screen.finder.nobody`, `screen.answers.withheld` (each reads "1 …s" at one), nor a Home label for Join (`act.projectjoin.label.home`; I use `act.projectjoin.label.projects` on both).
- `SCREEN_WORDS` is gone from this module (R34); its requirements' Provides line still names it.

## J3 · REPORT

Found in other modules, and needs from them (my part is built on the fallback named; nothing here blocks COMPLETE):

- **queue / queue-producers (N1123):** `subject.title` is absent on queue items (R28 falls back to `queue.source.untitled` for a task's subject). `queue.source.untitled` now reads "... captured {date}": an item carries no capture date, so I fill `{date}` from `captured` or `age.since`, else leave it empty.
- **hypotheses / queue-producers (the hint):** the design's `screen.queue.hint.rate` now holds `{rate}`, `{false}`, `{looked}` and `{reason}`; a hint carries `false_alarm_rate` only. I draw the sentence only when the hint carries `false`, `looked` and `reason`; with a rate and no counts nothing is drawn (never the word with its placeholders showing); with no rate, `screen.queue.hint.rate.none`.
- **retrieval (N1123):** `findIn` answers no document title (scope or item): R26 names a document by the `title` its answer carries, else "This document" and the passage, never a digest. `screen.find-in.scope.project` now holds `{project}` and `{count}`, so a project scope reads as that sentence only after the find has said how many captures it holds (`scope.captures`); before it, the project's title alone (read through `image`).
- **project-roster (N1118):** until `projectlist` answers `participation`, each project listed is read once through `projectparticipants` (one read per project, on Home and on Projects) to find the member's own row by her handle; a row that answers `participation` is taken at its word and read no further.
- **design lane:** no singular key for `screen.queue.more`, `screen.find-in.notread`, `screen.finder.nobody`, `screen.answers.withheld` (each reads "1 ...s" at one); no `act.projectjoin.label.home` (I use `.projects` on both); no Home strip reading for "no reply recorded" (R31 draws it in the rows only; the strip counts no item as overdue); no key for the supports/against choice's legend (I use `act.cite.label.find-in`).
- **interface-shell (K3373):** `RE_POINTS` projects/home `projectjoin` is needed for `SCREENS` to load; the pushed module throws at load against the tranche's shell until R72 merges. I tested with that one line added locally, never committed.
- **screens-inquiry:** `document.test.mjs` "R15 Watch for changes" fails on the tranche (its drawn sentence differs from the words it asserts); not mine.
