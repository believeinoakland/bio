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

## J4 · COMPLETE

screens-daily (T49-24) COMPLETE on `job/T49/screens-daily`, tranche merged at the end (BOB #181's plan commit in).

**Entries applied.**
- **R24** "Cite in the question": a `supports`/`against` choice (radios in a fieldset, none preselected) beside each result; `cite` sends `{project: <question>, question: <question>, found, role}` (K3369 (2)); refused in place (`screen.findin.cite.norole`) until one is chosen, after the question is.
- **R25** the project's `title` is written in the document's front matter beside `objective` (Home and Projects, one part `start-project.mjs`); door cards: title and description two elements, the closed door's summary carries `aria-label` = its name; counts pick `.one`/`.many` where the list holds both.
- **R26** Find-in names a project scope by its title (read with `image`, also in the path's crumbs), a document scope and each result by the `title` the answer carries, else "This document" and the passage; no digest or 12-hex run is drawn. K3372: `/app/find-in/<scope>/<question>` reads the second step as the question chosen.
- **R27** `ANSWER_MALFORMED` is drawn by `refusal.ANSWER_MALFORMED` (the refusal map and the key listed); `not_established` is drawn beneath `screen.answers.notestablished`, one line each (a string, `{text}`, or the system's `{withheld: n}`).
- **R28** queue and Home items: the subject by its title as a reference (`queue.source.untitled` with none), the producer's words only when not an address, the act by `act.<op>.label.<screen>` (new part `item-words.mjs`, shared by both).
- **R29** (K3369 (1)) "Join" (`projectjoin`, query `projectId`) on Projects (under `projects.invited.head`) and in Home's "Needs you", from the member's own row in `projectparticipants` (one read per project, new part `participation.mjs`), or from `participation` when `projectlist` answers it (N1118). Failed, loading or no row: nothing offered.
- **R30** the start form (title, "Who can find it" hidden preselected or findable, the later note, "Start the project"); `promote` sends `visibility` (`hidden` when untouched); `NAME_TAKEN` and `PROJECT_VISIBILITY_NO_OWNER` by their words.
- **R31** a reply owed whose date passed: `action.noreply.title` with `{date}` in a row; the strip counts no overdue item; a passed date is drawn with its date and no word. `screen.home.strip.overdue` and `screen.queue.due.overdue` are gone.
- **R32** `founder: true, handle: null` is `member.founder.unnamed`, as owner and among the members, never the id.
- **R33** Projects with none: `projects.empty.sub`, `projects.empty.note`, then the form.
- **R34** `words.mjs` and `SCREEN_WORDS` deleted; each screen's `words` is a frozen list of keys; every sentence is drawn through the shell from `setup-words`; every test asserts `word(key, vars)` and each key with `hasWord`; no test holds a sentence's English. The queue's `file.trigger.*` keys write the session log's trigger.
- Rule 6: words by key; "labeled": no member-facing English of mine (comments only name "labelled"); the `admin` grep: every `admin` here is a role value, none a member id, none reaches a reader; N1073 (`contract:123`): the expected acts are read from the registry (owner's declaration) less the acts left to other screens; D29: the shell turns `ok: false` carried inside a 200 into a refusal before any `done` runs, and no handler of mine takes `started: false`, `dispatched: false` or `withheld` as success (Ask draws its withheld count).

**Read, not read.** Read whole: the requirements, the plan entry, all eleven source files, the tests that name a requirement I changed (answers, contract, elsewhere, find-in, finder, home, projects, queue, common-line); the other tests were run (all of this module's). No flaw found in my own module left unfixed.

**Deferred.** (1) R31's strip reading for "no reply recorded": no key holds a count form; the rows carry it. (2) The question's own project is not sent (K3369 (2)). Both in the REPORT (J3) with the others.

**Found in other modules:** the REPORT, J3.

**Tests and checks (from the process repository).**
- `node --test bio-plane/test/m/screens-daily/`: tests 108, pass 108, fail 0, against the real `setup-words` and 11,823 words, with `RE_POINTS` projects/home `projectjoin` added to the shell locally, never committed (K3373; without it `SCREENS` throws at load until interface-shell R72 merges).
- `checks/architecture.mjs product screens-daily`: 0 failures (24 product files). `checks/coverage.mjs product screens-daily`: 34 of 34 live requirement ids named by a test, 0 failures. `checks/ownership.mjs product screens-daily tranche/T49`: 24 files changed, 0 failures.
- `checks/format.mjs product`: 2 failures, both `site`'s paths (not mine). `checks/run.mjs`: coverage fails for modules still to be built or restored in L11 (not mine).
- Other modules' tests that import `SCREENS`: screens-wizards page 5 of 5, answer-envelope 3 of 3; screens-inquiry `document.test.mjs` 1 fails and plane `t47.test.mjs` R43 and control-plane `t47-e2e.test.mjs` fail on their own (a drawn sentence there; the plane bundle; miniflare not starting), none from this change.

Size (session_01K3B1SwGYL8nCwqykgeAT82): test runs 24, module lines 1786
