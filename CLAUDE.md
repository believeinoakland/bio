# BIO / CivicOS — standing instructions for every session

Loaded automatically. This is what EVERY session in this repository needs
regardless of which area it works in. Your area's own plan is in
`docs/development/kickoffs/<AREA>.md`; read it after this.

## Who you are working with, and what that means for you

Bob is the architect. He is fluent in software architecture, design patterns and
the engineering process, and he reviews at that level: consequences, tradeoffs,
doctrine, priority. He was once fluent in shells and editors and is deliberately
no longer, and that is a settled fact about how this project runs rather than a
gap to work around.

**So: never hand him a command to run or a diff to apply.** If something needs
doing on the machine, do it. If it needs doing repeatedly, script it. If it
cannot be done from where you are, say so plainly and name the single smallest
action only he can take — not a sequence of steps, and not a shell command
dressed up as a suggestion.

What to bring him instead:

- **Decisions that are actually his**, in the shape `kickoffs/README.md`
  defines: what is running provisionally, why it was ambiguous, the alternative,
  your recommendation, what reversing it costs. Nothing the repo already
  answers. Nothing you are better placed to decide.
- **Consequences, not implementation.** "Publishing would then be permitted for
  material we cannot attribute" is his call. "Should this be a Map or a Set" is
  not, and asking makes him do your job.
- **The correction when he is wrong**, with the evidence. He corrects course on
  evidence and expects the same back; agreeing with him when the measurement
  says otherwise is the least useful thing you can do.

He will often hand a determination back — "you decide what the proper metric
should be", "you do what you know to be right." That is delegation, not a
formality. Decide it, implement it, record the reasoning where the next session
will find it, and tell him what you chose and why. Do not return the question.

One consequence for tooling: a session that stops every few minutes for
permission to run a command is not usable at this level. `.claude/settings.json`
already pre-approves everything this project does routinely, so if you find
yourself prompting him for a command that recurs, ADD IT THERE rather than
asking twice. Reserve the interruptions for the three things that are actually
gated: pushing, deploying the plane, and deploying the installer.

## What this is

**CivicOS exists to answer questions, make a case, tell a story, and take action to
affect a living civic system.** Bob, 2026-08-01, and it governs everything below:
*"There's nothing about CivicOS and how it works that's more important than
supporting users traverse that winding path of questioning, exploring, discovering,
documenting, and impacting the civic system."*

Everything else here is SUBSTRATE for that. Capture produces bytes and provenance;
content produces structure; the framework produces meaning; retrieval finds things;
progressions model how {information, money, responsibility, relationships, decisions,
power} is supposed to flow and where it actually does. All of it serves the path, and
a capability that does not serve the path is not obviously worth building.

### CONTENT IS THE UNIT, AND A DOCUMENT IS NOT THE ANSWER

**This is here because Bob has had to say it repeatedly, in session after session, and a
point that must be re-made is a point the record failed to carry.** It is written in the
one file every session loads, so no session can begin without it.

**CONTENT is a reference to a PART of a document, up to and including the whole
document — so a document is content too** (Bob's definition, 2026-08-04; ruled as DEC-23).
Documents are what is HARVESTED. Content is what is EXTRACTED. **Meaning derives from
both, and neither one alone.**

**The internet is noisy relative to what an inquiry needs — AND SO IS THE DATA STORE.**
Holding a document is not holding an answer. A store full of captured PDFs, none of them
read, is a pile of noise with good provenance. Finding the document is the cheap half;
extracting what is IN it, connecting it, and letting a member make meaning of it is the
half the product exists for.

Three consequences that keep being lost and are therefore stated as rules:

- **A search that returns documents has not finished.** The same searching that grows the
  document set is what identifies content within documents, makes connections between
  content, and produces meaning. It is ONE process working at several altitudes, not a
  pipeline with a document stage that completes.
- **NEVER ASSUME THE LOWER LEVELS ARE COMPLETE.** When anything — a member, an assistant,
  a query — goes looking, it may need to search **meaning, content, documents, AND the
  open internet**, in any order. Treating the store as complete short-circuits exactly the
  exploration and discovery the system is for. Bob, 2026-08-04, and it is the correction
  that earned this section.
- **Sparse is the normal condition at every level.** Absence at one level is not evidence
  of absence at the next: no meaning derived may mean nothing was extracted; nothing
  extracted may mean the document was never read; no document may mean nobody looked.
  Saying which of those is true is a first-class obligation, not a diagnostic detail.

The design work sits in `docs/architecture/BIO_Content_Framework_v0_10.md` **Part II** —
content's role and model (§14), the forms it takes (§15), the extraction process as built
(§16), how it is organized and reached (§17), and the central gap stated once (§18) —
which carries `STORE-AS-CACHE.md`'s three axes and four-level search; the ruling that
content is the unit the record points at is DEC-23; the primitive that lets an edge point
at content is D-164.

**The design corpus is held to a standard, and every design document carries FRONT MATTER
that says what it is, where it sits, what it lacks, and what it contains** — Bob,
2026-09-14, after the content construct sat undesigned for 46 days in a document that never
said what it lacked. `docs/architecture/BIO_System_Design.md` places every major construct
and names its home document; `docs/architecture/CORPUS-STANDARD.md` is the standard;
`node tools/corpuscheck.mjs` enforces it and `plancheck` runs it. **A landing that changes a
construct updates its home document's front matter in the same commit**, and a citation
into a design document names the SECTION, not a line.

**The stance, and it is doctrine.** BIO is defined through doctrine and nothing in it
resembles "stick it to the man". The objective is BETTER GOVERNMENT, pursued through
**greater understanding, less narrative, and accountability**. The working assumption is
that at the highest level all stakeholders want better outcomes in the public interest,
so we are on the same side — while bad actors genuinely exist among us, and are
identified BY EVIDENCE rather than assumed by role. No structural prior against any
class of actor belongs anywhere in this system.

**"Less narrative" is a constraint on us, not only on them.** Threats to the record run
in both directions: someone may damage a publisher, and someone may make claims reaching
far beyond what the evidence supports. Nearly every rule below defends against the
SECOND — undetermined is first-class, an equality that costs nothing is not evidence,
grade tracks directness, the publication fence. The primary threat model here has always
been self-directed.

The record is the FOUNDATION of that, and the whole product is TRUSTWORTHINESS OF THE
RECORD: groups capture what a public body published and can prove later that it said
what they claim. So a defect that makes the record claim more than it can support is
worse than a missing feature, and much worse than an ugly one — because a case built
on a record that overclaims is worse than no case.

The plane is a Cloudflare Worker plus a Durable Object with SQLite, R2 for
captured bytes. `newgroup` is the installer that puts a sovereign instance into
a group's own Cloudflare account — that is the distribution model, not a demo.

## The rules that are not negotiable

**Never force-push.** Fetch and rebase.

**THE REPOSITORY IS THE CHANNEL. A change is not made when it is written; it is
made when it is COMMITTED AND PUSHED.** Sessions do not share a working tree: an
area session works in a git worktree, and a worktree is a checkout of a COMMIT, so
an uncommitted file reaches nobody and an UNTRACKED one cannot even be found. On
2026-07-31 a session wrote the rule "an area may not be ACTIVE without a kickoff",
created the missing kickoff, and left it untracked while three workers were already
running — so both the rule and its fix reached no one. Verify from the REMOTE, not
from your own tree, the same way `deploy.mjs` reads the bytes back from the account
rather than trusting the upload.

Before you hand off, run it — this is not advisory:

    node tools/plancheck.mjs

It fails on an unpublished or unpushed planning surface, an ACTIVE area with no
kickoff, an item behind an unregistered interface, a milestone that does not exist,
and an open debt row with no disposition.

**BEFORE RAISING A QUESTION, OR WRITING A DECISION ITEM, ASK WHAT IS ALREADY DECIDED:**

    node tools/decided.mjs "<the subject>"

It answers from a generated index of every ruling in the corpus — 598 of them,
167 KB — returning the ruling in the words it was ruled in, plus the file and
line that owns it. **Only 12% of those rulings are in `DECISIONS.md`**; the rest
are spread across fifty documents, several of which are larger than a context
window. So a session re-asks a settled question not because it was careless but
because the answer was somewhere it could not afford to open.

**Regenerate it (`node tools/decided.mjs`) in any turn that rules on anything** —
`plancheck` fails on the drift. It is a FLOOR on what has been settled and never
a ceiling: a ruling recorded without a marker word is invisible to it, so grep
before concluding nothing was decided.

**It scans `docs/archive/**`**, which is what makes archiving a closed document
safe rather than lossy, and why the archive is where finished work goes rather
than being deleted.

> **The measurements that produced this, 2026-08-10, kept because they are the
> argument.** The reading this file and the kickoffs demanded before a session
> could work totalled **~565,000 tokens** — no session could read its own
> required reading list, so it read some and the rest of the record was invisible
> to it. `CLAIMS.md` alone was 1.7 MB of released claims. The consolidation that
> followed took the orientation set to **~295 k** and the live corpus from 7.35 MB
> to 3.56 MB, with 3.83 MB archived rather than deleted. `docs/archive/CORPUS-STUDY.md`
> carries the study and what remains undone.

**Before making a change another session must know about, read
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE".** It is the skill this
ecosystem runs on: which channel carries what, the rules that make each work, and the
receipts for every way a correct change has failed to reach anybody.

**A mechanism that is not in the loop the reader actually runs is not a mechanism.**
Documenting it is necessary and never sufficient. If you add a step, add it to the
file whose owner must perform it — `kickoffs/CONDUCT.md` for CONDUCT, the area's
kickoff for an area — not only to the document that explains it.

**Measure, do not assume.** Numbers come from `docs/development/MEASUREMENTS.md`
and go into it with their date and instrument. A vendor's documentation is a
claim, not a measurement, and gets labelled as theirs. On 2026-07-31 three
claims the archive design rested on turned out to be wrong when finally
measured; every one had been in the design document for weeks.

**Run the negative control.** Break the thing you just tested and confirm the
suite fails. Neutering the inbox write-path grammar check left all 67 assertions
passing, because every input the code generated was well-formed by construction:
the suite was testing something else and nobody could have known without the
control. A suite that does not fail when you break its subject is not a suite.

**AND BREAK ONLY THE THING — A CONTROL WHOSE METHOD PERTURBS A SECOND VARIABLE PRODUCES A
REFUTATION THAT LOOKS MORE CONFIDENT THAN THE FINDING IT REFUTES** (CONDUCT #11's general
form, 2026-09-15, from a control run twice wrong in this session). Driving the claim that
`plancheck` degrades to green when a predicate cannot load: making the predicate unloadable
by RENAMING it dirties the tree, so the run failed on UNPUBLISHED and exited 1; `chmod 000`
dirties it too, because git reports a file modified when it cannot read it. **Both produced a
non-zero exit and a NAMED failure — which feels like evidence and is the signature of *cannot
reproduce* — while the subject was never exercised at all.** Only `--local`, which skips the
publication half, isolated the variable, and the defect then reproduced exactly: `0 fail,
2 warn`, exit 0. **It is the arm-that-did-not-arm class with the sign flipped: not an arm that
failed to fire, but one that fired at the wrong thing and reported success at refuting.** So
when a control refutes a finding, check what ELSE your method changed before believing it —
and record the method beside the result, because the next person re-driving it the obvious
way gets the confident wrong answer.

**Correct superseded tests, never exempt them.** If a rule changed, change the
assertion and say in a comment why the old one was wrong. An exempted test is a
rule nobody is enforcing and nobody remembers deleting.

**Test through the op, and verify live.** A store-level test and a passing
battery are not evidence that a caller can reach the feature. `op=invitelook`
shipped with a ReferenceError while 1276 assertions passed.

**A deploy verified is not a build serving.** `deploy.mjs` proves the bytes
landed. Rollout is per-isolate and NOT atomic: seconds after a byte-identical
verification of 0.52.0, `/version` answered 0.51.0 and a probe answered by the
old build looked exactly like a security defect in the new one. `deploy.mjs` now
waits for the version to serve. Durable-Object-routed ops can still lag after
that. **If a live probe contradicts the suite, establish which build answered
before believing either.**

**An equality or an outcome that costs nothing to produce is not evidence.** Our
governor refusing is not the source failing. Two empty-body digests agreeing
agree on nothing. A provenance hop a caller can hand us is one a caller can
invent. All three are enforced structurally, not by convention.

**THE AGREEMENT OF SEVERAL DOCUMENTS IS NOT EVIDENCE — IT IS USUALLY ONE SOURCE
COPIED.** Found by CONDUCT #11 on 2026-09-15 after it was the day's repeated shape:
**four premises stated confidently in several places at once turned out to be false**,
and **three of the four were corrected by someone going to the ARTIFACT instead of
re-reading the sentence.** A credential's presence asserted in three documents; a
design resting on a debt row 38 days after the row's own remedy shipped; an inbox act
held under a rule when the patch it asked for was already in the tree; and a tool
described as not allocating a namespace it has allocated all along, because a true
note about the tool's AUDIT half was widened into a false claim about its ALLOCATOR
half. **This is the costs-nothing rule one level up: corroboration that cost nothing
to produce is not corroboration**, and documents agreeing because one was copied from
another agree on exactly as much as two digests of an empty body. So when a claim
matters, **go to the thing it describes** — run the tool and read its own output, grep
the code, probe the account — and treat a second document saying the same as a
POINTER to where the claim came from rather than as a second witness.

**A BLOCKER IS A CLAIM, AND NOTHING HERE AUDITS ONE.** Every instrument in this
repository is pointed one way — at the record claiming more than it can support. The
publication fence, undetermined-is-first-class, grade tracks directness, the
costs-nothing rule, the negative control: all of them catch an overstatement of what we
HAVE. **A statement of what we CANNOT do passes every one of them untouched, because
nobody audits a reason for not building something** — and it costs real work in the
direction that leaves no trace, since the work simply never happens. Two receipts, both
2026-09-14. A debt row named an unmet precondition **38 days after its own remedy had
shipped**, and a design rested on it and sequenced an item to build what already existed
(REC-89; D-225 closed in fact by REC-60/IC-25). A worker's report named its blocker as
*the record does not persist a page set*, when the page set had been persisted that same
day and the real blocker was one missing canvas in one surface — the difference between a
UI someone can build and a plane item nobody owed and nobody was going to write. So:
**verify a blocker the way you verify a capability — grep the code it names, on the tree
you are on, before you rest a decomposition, a deferral, a row or a refusal on it.** A
blocker inherited from a ledger is a claim about the day it was written.

**AND THE SAME RULE GOVERNS OUR OWN PROCESS, WHERE IT KEEPS ARRIVING THROUGH NEW DOORS.**
Stated because 2026-09-14/15 produced SIX instances in two days and they are not six
lessons — they are one lesson with six doors (CONDUCT #11): **a row that outlived its
work; a row that outlived its worker; a hold that outlived the condition it held for; an
inference clause telling a reader to read *no live worker* as `queued`; a reap that killed
the children and left the parents, so a respawned orphan was indistinguishable from one
nobody reaped; and a spawn that silently did not happen, leaving seven rows advertising
workers that did not exist.** Every one is **a reader concluding a value from an absence
that has two causes** — the rule above, turned on the machinery that builds the record
rather than on the record.

Two consequences worth more than the list. **Care does not catch this class and a
VERIFICATION STEP does**: five of the six were preventable by someone being more careful,
and the sixth — a working directory that reverts between turns — was not preventable by
anyone at all, which is why *an act is not done until it is verified to have taken* beats
*be careful* every time. And **a workaround nobody NAMES is a hazard whose evidence it
consumes**: one session defended against that reverting directory on every command for
hours without recognising the defence, paying the cost of the bug continuously while
generating no record of it, so the silence looked like health until a spawn failed loudly.

**Undetermined is first-class and must be STATED.** Never invent an attribution
to get past a gate. A gate that pressures someone into inventing one is a bug in
the gate: that is why the publication fence moved off the content axis onto the
provenance chain.

**Do not create debt that can be avoided.** When you must, write it in
`DEBT.md` with what it costs and what closing it takes.

## Working in an area

Areas, claims, interfaces and the change protocol are in
`docs/development/PARALLELISM.md`. The short version:

- **Claim your area in `docs/development/CLAIMS.md` before editing**, and say
  which paths. A claim keeps other sessions out.
- **Do not edit another area's paths.** Append a DELEGATION entry saying what
  you need and continue with your own work.
- **Interfaces are stable by default.** To change one, use the protocol in
  `INTERFACE-CHANGES.md`. Do not change a shape another area builds against
  just because you can reach the file.
- **Use a worktree**: `claude --worktree <area>`. One session per worktree.

## Cutting a release

**Only the `DIST` area cuts plane releases**, and only from a green `main`. If
you are not DIST, do not bump a version, sign, tag or deploy the plane. Land
tested code and ask DIST. See `docs/development/kickoffs/DIST.md` for the gate.

## Verification discipline, in order

`docs/development/VERIFICATION.md` is the full process, the coverage floor and the
measured state. **Pick the profile by MEASURING the change, not by judgment:**

    node tools/gates.mjs

It classifies the diff. A change that is entirely prose under `docs/` runs the
doc-facing suites (derived fresh by grepping `test/` for `docs/` readers — never a
hand list) plus `plancheck`, minutes instead of the ~25 the full set costs. ONE
non-docs path in the diff and it runs the full four gates. `--explain` prints the
plan without running; `--full` forces everything. The full set, when it is owed:

1. `cd bio-plane && npm run test:battery` — EVERY suite, all of them reported. Not just
   the suite you touched. As of M0-4 `npm test` runs the same discovering runner (it no
   longer chains with `&&`, which stopped at the first failure and hid everything after
   it — D-93), so either entry point runs the whole battery; `test:battery` is the
   canonical name.
2. The negative control for whatever you just added — RUN, and recorded in the
   suite's own `NEGATIVE CONTROL:` line so the next session can re-run it in one step
   instead of re-deriving how to break the subject.
2a. `node scripts/coverage.mjs --strict` — no NEW unreached op, and an op you added carries a
   control-plane assertion in the same turn. Coverage here is ops, checks and
   controls; line coverage is not measurable, because the plane runs inside workerd
   and not in the node harness.
   **AND READ THE EXIT STATUS WITHOUT A PIPE.** `cmd | tail` reports TAIL's
   status, not `cmd`'s, so a FAILED strict run reads as exit 0 — CONDUCT
   recorded a false `exit 0` that way on 2026-08-04 and REC-49 caught it. Also
   `npm run test:coverage --strict` does NOT pass the flag: npm swallows it
   (`npm warn Unknown cli config "--strict"`) and the run is strict only
   because the package script already carries it. When the answer must be
   EVIDENCE, run the script directly and read `$?` with nothing piped after it.
3. Build, sign, deploy (DIST only), and wait for the rollout gate.
4. Live-verify **in your own instance's scratch namespace**, never the real
   record, and sweep it after.
5. `op=audit` clean before you call anything done.

## Where things are

| Path | What |
| --- | --- |
| `bio-plane/src/` | the plane: `index.mjs` control plane, `store.mjs` the DO, `schema.mjs`, `cdx.mjs`, `subresources.mjs` |
| `bio-plane/checks/bio-checks.mjs` | the check catalog. C-numbers. The gate runs it |
| `bio-plane/test/` | the battery. `hygiene.test.mjs` catches source-level hazards |
| `newgroup/` | the installer. Out of bounds without an explicit instruction |
| `docs/development/MILESTONES.md` | the capability ladder, and where every open piece of work sits |
| `docs/development/QUEUE.md` | what is RUNNABLE now. CONDUCT's, sole writer. `PLAN.md` is closed history |
| `docs/development/VERIFICATION.md` | what "tested" means here, the instruments, and the floor |
| `docs/development/` | DEBT, MEASUREMENTS, the designs, the kickoffs |
| `release/` | the signed artifact and RELEASE.json |

## Traps that have already cost time

**WHAT BELONGS HERE, AND WHEN AN ENTRY SHOULD LEAVE.** An entry earns its place when its
**SYMPTOM IS DISTANT FROM ITS CAUSE and NO INSTRUMENT NAMES IT.** The distance takes three
forms, and *exit 0* is NOT the common thread — that hypothesis was tested first and breaks on
two entries that fail loudly. It is distance in **KIND** (the operation reports success while
doing the wrong thing), in **LOCATION** (the failure surfaces where the cause is not), or in
**TIME** (a stale number reads plausible for weeks because nobody re-measures). Verified over
all nine entries by CONDUCT #11, 2026-09-15.

**So this section has an EXIT CONDITION, which it has never had: the fix for an entry is to
BUILD THE INSTRUMENT THAT NAMES IT**, after which the entry stops needing to be read and
becomes a note beside a check. **A traps section is a list of defects the estate has not yet
instrumented, and it should SHRINK.** The proof is already in it: the schema-table entry below
is the one whose symptom points straight at its cause, and it is the one two suites assert BY
NAME — `aicredential.test.mjs` and `bias.test.mjs` both check the ordering and cite this trap
in the assertion text. That is the mechanism rather than a coincidence, and it makes that entry
this section's first candidate for demotion to a note beside its check.

- **BUILD A COMMIT MESSAGE WITH A HEREDOC (`git commit -F -`), NEVER WITH `printf`.**
  Backticks in `-m` are command-substituted and silently delete words (three times in
  one day, 2026-08-08). `printf` fails the same way one character over: a literal `%`
  is a FORMAT DIRECTIVE, so a message containing `1%.` aborts printf mid-string and
  the commit lands **truncated at that point with exit 0** — the push succeeds and
  nothing reports it (2026-08-10, this file's own handoff commit). Same class, same
  cost, and the heredoc is immune to both.

- **`git checkout -- <file>` RESTORES TO HEAD, NOT TO WHAT YOU HAD.** In a tree
  with uncommitted work it is not "put it back", it is "throw mine away", and it
  exits 0 either way. Measured twice in two days (2026-09-11 and 2026-09-12,
  both DIST): a negative-control arm edited a file, `git checkout --` was used to
  undo the arm, and it silently discarded the session's own uncommitted change to
  that same file — once losing a whole implementation that then had to be
  rewritten from the transcript. The next arm measured the wrong tree and its
  result was nearly recorded. **To undo an on-disk control arm, `cp` the file
  aside first and `cp` it back**, then verify with a hash — the restore is only
  believable if it is measured, and `restored byte-identically: NO` is the line
  that caught both. Writing the lesson in a commit message did not prevent the
  second occurrence, which is why it is here.

- **A FRESH WORKTREE HAS NO `node_modules` IN ANY OF THE THREE PACKAGES THAT HAVE
  DEPENDENCIES, AND A BASELINE MEASURED BEFORE `npm ci` IS A WRONG NUMBER CARRYING FULL
  CONFIDENCE.** Two workers hit this
  independently on 2026-08-10 and both reported it rather than working around it: one
  read `28/157 green` with 129 suites failing `ERR_MODULE_NOT_FOUND: miniflare`, the
  other `43 pass / 3 fail, exit 1` on the UI harness, whose suites drive the real plane
  through miniflare. The true baseline in both cases was green. **This is worse than an
  ordinary flake because it looks exactly like the damage your own change did** — the
  standing instruction to measure your own baseline and trust it over the brief points
  the wrong way here unless you install first. **Run `npm ci` in `bio-plane/`, `pdf-worker/` AND
  `ocr-worker/` before you measure anything in a new worktree** — three packages carry
  dependencies and `agent-worker/` carries none (measured 2026-09-14 off the four
  `package.json` files, not recalled). **The entry said `bio-plane/` alone for five weeks
  and that was one package short of the instrument.**

  **THE SECOND SIGHTING IS THE DANGEROUS ONE, AND IT LOOKS NOTHING LIKE THE FIRST.**
  Measured 2026-09-14 (CAP-12's worker; `MEASUREMENTS.md` carries both arms with their
  shas): a pristine worktree with `npm ci` in `bio-plane/` only ran the battery **green
  but one, and EXITED 0** — a whole fleet member's suite and its assertions simply were
  not in the total. The runner is not at fault and must not be "fixed": it SKIPS A MEMBER
  BY NAME on purpose (VF-3/FL-2, so a fresh checkout gets a named skip rather than a red
  `main`), and it printed the name. The hazard is that the HEADLINE and the EXIT STATUS
  both read healthy, so a session scanning the tail — which is what the standing
  instruction to trust your own baseline over the brief encourages — records a pass over a
  battery that never ran a member. The 2026-08-10 sighting was loud (~14 green, a hundred
  `ERR_MODULE_NOT_FOUND`) and therefore cheap; this one is quiet and therefore not.
  **So read the SKIP COUNT and the SUITE TOTAL, never the exit status alone** — if a member
  is named as skipped, your baseline is not a baseline yet.

- **A SESSION'S WORKING DIRECTORY CAN REVERT BETWEEN TURNS, AND THE FAILURE IT CAUSES
  DOES NOT LOOK LIKE A DIRECTORY PROBLEM.** Observed independently in two lanes on
  2026-09-15: CONDUCT's spawn of a flipped row failed because the session's working
  directory had drifted from the repository to the WRAPPER above it, leaving rows reading
  `running` with no worker — the wrong-status class arriving through the harness rather
  than through anyone's mistake; and BOB's own directory moved between the worktree and
  the wrapper repeatedly across one session. **The trigger is NOT established and is
  stated as unknown rather than guessed** — what is established is that persistence
  cannot be assumed. The wrapper is not a git repository, so what you get is a `git`
  command failing in a way that reads as a broken checkout, or a tool resolving a
  relative path against the wrong root and finding nothing.
  **The mitigation has two halves and the first one alone is NOT enough.** For your own
  shell commands, anchor each with an explicit absolute `cd` to the tree you mean rather
  than relying on where the last one left you — that is necessary and it is what one lane
  did silently all session. **But CONDUCT #11 measured the half that bites: a `cd` inside a
  SUBSHELL — the safe form for everything else — does NOT set what the TOOLS see**, so a
  session can run a hundred correct commands and still be outside the repository when a
  spawn or worktree tool asks. A bare `cd` in its own command does set it. **The authority
  is the environment line the harness prints, not your last `pwd`** — read it, and treat a
  tool that creates or resolves paths as asking a different question from your shell. And the act that matters most is the one CONDUCT now performs — a
  spawn or a flip is not done until it is VERIFIED to have taken, because an act that
  silently did not happen is indistinguishable from one that did until somebody reads the
  row and believes it. **The receipt: four spawns failed this way at once and `origin/main`
  carried seven rows claiming live workers that did not exist**, minutes after the session
  that published them had landed the rule about exactly that. The general form is worth
  more than the trap — **a step that PUBLISHES a claim and a step that MAKES it true are
  two steps, and the gap between them is where every wrong status in this project has
  lived** (CONDUCT #11, 2026-09-15): publishing first protects the reader who would act on
  a stale value, and leaves the reader who acts on a value that never became true. Close
  both ends — confirm the act took, and revert the publication in the same minute if it
  did not.

- **New schema tables go BEFORE the `host_governor` block** in `schema.mjs`.
  `hygiene.test.mjs` asserts the literal ends on a `);`.
- **No backticks inside the schema or setup template literals.** A balanced
  stray pair still parses, so `node --check` will not save you.
- **NO SEMICOLON INSIDE AN INLINE `--` COMMENT IN `schema.mjs`.** `#migrate`
  splits the schema on `;` before executing it (`for (const s of bare.split(";"))`),
  so a semicolon inside a column comment TRUNCATES the statement and every
  `promote` then fails with `SQLITE_ERROR: incomplete input`. Same class as the
  backtick trap above and found the same way — by paying for it (PL-1, 2026-08-08,
  ~15 minutes and three comments). `node --check` will not save you here either.
- **A derived table must be added to `purge`** or a whole-store purge reports
  scope ALL and silently leaves rows (D-113).
- **`store.mjs` IS LARGE AND GROWING, AND THIS LINE NO LONGER CARRIES A NUMBER — MEASURE IT:**
  `wc -l < bio-plane/src/store.mjs`. **The figure has been wrong here four times.** It read
  ~4,900 for weeks against a real 16,287 (more than three times out, unmeasured because it
  read as a rough order of magnitude); it was corrected in two files on 2026-08-04 and a
  THIRD site was found still stale a day later; and on 2026-08-08 it read ~16,300 against a
  real 21,248. **A hand-carried number in a document nobody re-measures goes stale silently,
  which is this project's most-repeated finding — so the instruction is now the command
  rather than the answer.** What actually matters about the size has not changed: **a stray
  byte makes plain `grep` treat the file as BINARY and silently match nothing, so use
  `grep -a` on it**, and grep before assuming a helper does not exist.

## Which Cloudflare account you are talking to

`wrangler` authenticates from an OAuth session stored on the MACHINE, and a
machine may well be logged in to a different account for unrelated work. On
2026-07-31 a fresh checkout was found authenticated to `neologic`, not to this
project's account, and a deploy would have SUCCEEDED — putting the installer
somewhere nobody was looking, with no error to notice.

Both `wrangler.jsonc` files now pin `account_id`, so the repository decides
where a Worker goes rather than the machine. Do not remove it, and do not add a
new Worker config without it.

`scripts/deploy.mjs` was never exposed: it takes the account from `CF_ACCT` and
talks to the REST API directly. The exposure was `wrangler deploy`, which the
installer uses. If a wrangler command ever reports an account other than
`20b533579290b9b93168345edd3b7f72`, stop and say so rather than proceeding.

## Credentials

Read from `.env`, never committed. `.env` is gitignored and carried into
worktrees by `.worktreeinclude`. `tokens.mjs` denylists any token value
published in the repo and treats it as NOT SET, so committing one revokes it.

**How a secret gets onto the machine, since the operator does not edit files by
hand and should not be typing tokens into a conversation:** he copies the value
to the macOS clipboard from wherever he keeps it, and you read it with
`pbpaste`. The value never appears in a prompt, a transcript, or a tool call
you print.

    printf 'CLOUDFLARE_API_TOKEN=%s\n' "$(pbpaste)" >> .env

NEVER echo, cat, or otherwise print a secret you have read this way, including
"just to confirm it landed". Confirm it by USING it: run the command that needs
it and report what the SERVICE said. `npx wrangler whoami` reporting the right
account is proof the token is correct; printing the token proves nothing and
puts it somewhere it was not before.

If a value is already visible in the conversation because it arrived there
before this rule existed, do not repeat it. Use it and move on.
