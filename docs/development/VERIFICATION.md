# Verification: what "tested" means here, and how it is checked

Cut to the reading budget on 2026-09-19 (`CLAUDE.md` §1): this file is READ WHOLE and holds every rule a
session follows to verify its work. The full prior text — the narrative, receipts, dated incidents and
argument behind each rule — is archived verbatim at `docs/archive/VERIFICATION-2026-09-19.md`; look it up
by subject or by the id a rule names, never read it to learn the process. `CLAUDE.md` §5–§6 state the
discipline and win any disagreement; this file is the instruments that check it and the floors that fail.
A figure here is dated; the instrument's printed figure is the authority over it.

## Why line coverage is not the metric, and what is

Most plane suites drive `src/**` inside WORKERD through Miniflare, a process the node harness cannot
instrument, so `NODE_V8_COVERAGE` would measure `test/` and call it coverage. **Do not report line
coverage.** (Re-take the ratio, do not trust it: `ls bio-plane/test/*.test.mjs | wc -l` against
`grep -l miniflare bio-plane/test/*.test.mjs | wc -l`.) `scripts/coverage.mjs` measures the three
surfaces whose gaps have shipped defects instead:

| surface | why | receipt |
| --- | --- | --- |
| **ops reached through the control plane** | a real caller has one route | D-43 |
| **checks named by an assertion** | a check run only in the passing direction is unproven | S-7 |
| **negative controls declared** | a suite that does not fail when its subject breaks tests something else | the inbox grammar check |

Run `cd bio-plane && node scripts/coverage.mjs --strict` **directly, and read `$?` with nothing piped
after it** — `cmd | tail` reports tail's status (REC-49), and `npm run test:coverage --strict` swallows the
flag.

## The measured floor, 2026-07-31

The rest of the 2026-07-31 table is archived; this row stays (pinned by `register-grammar.test.mjs` B5):

| | reading | rule |
| --- | --- | --- |
| suites declaring a negative control | 152 of 152 · 792 arms across 151 classified · 1 UNCLASSIFIED; fleet 5 of 5 · 48 arms — printed by `--strict` at `35bc9dc`, moved 2026-08-10 | **a hand-carried figure in prose is moved by the INTEGRATOR, once, from a printed run of the merged tree; a worker RAISES it rather than editing it.** The printed figure is the authority; this row is never believed over it (PL-18, and duplicate `arms:` keys from parallel moves). |

- **The control-plane figure is an upper bound.** Act on the exact buckets: unreached, and DO-only.
- **An unnamed check is not an unrun check** (`conformance.test.mjs` runs them all): no assertion proves it
  FIRES on a violation (S-7).

## Three defects the instruments found on first run

An unchained suite never ran; one read an absolute container path; a fixture held a value no real
instance could (D-40). **Correct a wrong fixture; never relax the assertion.**

## The battery runs every suite, and reports all of them

`cd bio-plane && npm run test:battery` (≡ `npm test`, both `node scripts/battery.mjs`; a subset by name
fragment: `node scripts/battery.mjs <fragment>`). Suites are DISCOVERED from the directory, never listed
(D-93). A suite whose tally cannot be read is *unknown*, never zero. A suite needing stock `ssh-keygen`
SKIPS loudly with a named reason; read the SKIP COUNT, not only the exit status (`CLAUDE.md` §6).

### A printed failure is a failure, and one log holds one run (M0-67, D-425)

- The verdict takes the exit status AND the printed tally: a printed failure with exit 0 is RED,
  `EXIT/TALLY DISAGREE (D-425)`.
- **Write every run to a file of its own.** The runner refuses (exit 3) a file another battery is writing,
  and prints `LOG SHARED (D-425)` if foreign lines appear.
- **Match a quoted completion line's `run <id>` to its header.** Behind `| tee` the id is the only defence.

### What the battery says about TEMP, and about the half it does not own (D-237)

The runner fences each suite in its own `$TMPDIR` and fails on residue inside it (D-186). **That figure is
about the fence, not the estate.** The outside-the-fence report never fails a run and grades evidence
three ways, never collapsed: **HELD** (a pid chain — the only state allowed to say *this run*),
**APPEARED/CHANGED** (a candidate), **PRE-EXISTING**. The failing guard is `hygiene.test.mjs`'s
containment check (M0-10): no suite roots a filesystem ground at an absolute-path literal. Blind spots:
D-249, D-250, `scripts/residue.mjs`.

## The negative-control register

Every suite declares its control in a comment, anywhere, over as many lines and arms as it needs:

```
NEGATIVE CONTROL: <what to break in the subject> -> <what must then fail>
   (b) <the next arm> -> <what that one broke>
```

**Declaring it is not running it.** The line records what was RUN and what it broke, dated, so a later
session re-runs it in one step instead of re-deriving how to break the subject. A new suite declares one
at birth. The detector is `bio-plane/scripts/control-register.mjs` (M0-9): a declaration ends at its
comment's close or a blank line; a suite stating its control twice is recorded by the fullest, **never
the sum**. An arm is one MARKED item — a TRANSITION (`->`) or an ENUMERATION (a parenthesised ordinal);
the count is **max(transitions, enumerations), never the sum** (M0-14, D-233).

<!-- D-263 PROVENANCE: THE DOUBLE MOVE. Recovered 2026-08-09 from `0ca7640^2`, the
     REC-68 branch blob, and AMENDED rather than restored verbatim — see the last
     paragraph of this block for why the original was right when it was written and
     why putting it back unchanged would have been a second defect. Do not delete
     this block without deleting its pin: `test/register-grammar.test.mjs`. -->

**A DECLARATION'S TALLY MOVES TWICE IN A TURN THAT WRITES ITS RESULTS BACK INTO
ITSELF, AND THE FIGURE MUST THEREFORE BE READ OFF THE INSTRUMENT AFTER THE *LAST*
EDIT.** This follows from the grammar above rather than from anything special: a
control's RESULT is naturally written as a transition — `GREEN -> RED`, `471 -> 482` —
and a transition is exactly what the matcher counts. So a worker who adds arms,
reads the printed figure, then records what those arms DID in the same declaration
has invalidated the figure they just read. **DRIVEN 2026-08-09, not reasoned about**:
a two-arm arrow declaration goes to **4** when its results are written in, and the
estate's suites really do write results back — **measured 2026-08-09, 20 of the 146
suites with a countable declaration state their own results inside it** — so this is a
live property and not a curiosity. **That corpus count is a DATED MEASUREMENT and not
a claim about today**; `test/register-grammar.test.mjs` PRINTS the live figure on every
run, and the printed one is the authority. It is written that way deliberately: this
whole block exists because a figure asserted in the present tense went false, and
repeating that here would be the defect wearing the fix's clothes.

**AND THE HALF THE ORIGINAL SENTENCE DID NOT STATE, which is why it is amended:
the rise is NOT unconditional.** Because the count is `max`, a declaration counted by
its ENUMERATIONS absorbs results for free — a three-ordinal declaration whose results
are added as prose stays at **3**, and adding them in arrow grammar moves it only once
the arrows OUTNUMBER the ordinals (measured: three ordinals + four arrow results -> 4,
transitions 4 against enumerations 3). **So "writing results back raises the tally" is
true of ARROW-GRAMMAR declarations and only sometimes true of enumerated ones.** A
worker who takes the unconditional form on trust and skips the re-read will be right
most of the time, which is the worst way for a rule to be wrong.

**THE HISTORY, because it is the receipt and it is permanently true of its own tree.**
The arms floor moved **471 -> 482 on 2026-08-08 by REC-68**, in the turn that
invalidated it — four arms in `hygiene.test.mjs` for its schema-comment/vocabulary
guard, three in `query.test.mjs` for D-228's controls — and it moved in TWO printed
readings, `arms 478/471 · GREW by 7` and then `arms 482/478 · GREW by 4`, taken from
what `coverage.mjs` PRINTED and never by adding to the number in the file.

**WHY THIS IS HERE AND NOT IN THE ROW ABOVE, AND WHY IT IS NOT REC-68'S SENTENCE
VERBATIM (D-263).** REC-68 wrote this as the tail of the register ROW, opening *"THE
CURRENT PRINTED FIGURE IS `482 arms`"*; the merge `0ca7640` kept main's side of that
row and the sentence landed in the merged tree nowhere. **It was RIGHT when it was
written** — 482 was the printed figure of that tree, and the row was where the figure
lived. It is wrong TODAY only because the figure moved: restoring it verbatim would
have put `482` back into a file whose instrument prints a far larger number, trading a
missing explanation for a false one, which this project rates as the worse of the two.
So the perishable half — the current figure — stays in the row above where the
integrator moves it, and the durable half — how the figure MOVES — is stated here
beside the grammar it follows from, where no measurement can age it out.

<!-- END D-263 PROVENANCE. The span is marked at BOTH ends on purpose, which is
     DEC-49's own smallest-span rule applied to prose: the pin reads what is
     between these two markers and nothing else, so it cannot pass by citing a
     neighbouring paragraph the drop never touched. -->

**A declaration the instrument cannot classify is `null`, never `0`, and is NAMED** (D-233); a missing
tally reported as zero is how "stayed GREEN" gets recorded for a suite that never ran. The matcher does
not follow a delegation to another file, does not count a LABELLED arm `(D-231a)`, and does not cross
unmarked prose — so the tally is a FLOOR on arms stated, not an exact count. `REGISTER_FLOOR` in
`scripts/coverage.mjs` gates `--strict` on arms, classified declarations and corpus size (a matcher
narrowed to nothing reports 100% of nothing); a new UNCLASSIFIED declaration fails (`REGISTER_UNCLASSIFIED`).
**Move a floor only to a figure a green run PRINTED, never by arithmetic on the file.** Controls:
`node test/register.control.mjs`.

### THE REGISTER'S REACH STOPPED AT THE PLANE, AND THE SUITE IT COULD NOT SEE WAS THE WORST ONE (VF-1, 2026-08-09)

**An instrument's REACH must match the claim it prints.** Fleet suites are read per SUITE under
`FLEET_FLOOR` (`suites`, `arms`); an undeclared fleet suite fails `--strict` by name. When you replace a
rule, DELETE the old copy — a second copy absorbs the control meant to prove the first (IS-6, C-22.4).
`OWED_CONTROLS` prints the owed controls; never invent a placement for an outstanding one.
`civicos-ui/test` and `newgroup/test` are reported and deliberately NOT gated (their areas own them;
DELEGATION in `CLAIMS.md`, 2026-08-09). Controls: `node test/owed-controls.control.mjs`.

### A THROWING CONTROL DRIVER VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING (D-331, 2026-09-14)

The driver law. A dead anchor in a throwing driver blinds every arm behind it. **A driver that throws on a
zero-match MUST first count every arm's quote in the file that arm will write and PRINT THE WHOLE TABLE**
(`preflight()` in `bio-plane/scripts/armdecay.mjs`). **Keep the throw**: a half-armed tree is never
measured. Refuse only for the arms the invocation will run. **A driver's declared arm count is held
against its run** (D-333, `m025-arm-census.mjs`); an UNKNOWN on either side is listed apart, not gated.

### A DRIVER IS FOUND BY WALKING THE DRIVERS, NEVER BY GUESSING ITS NAME (M0-51, 2026-09-17)

Find a suite's driver by walking the drivers and reading which suites each names **in code** (prose
blanked by the estate's lexer, D-277/D-301); the same-name sibling is one way in, not the rule. **Never
rename a subject to satisfy an instrument.** `hasDriver` is a POINTER, never a GRADE. Report three facts,
not a percentage: NOT FOUND, HAVE IT AND CANNOT READ IT, NOT WHERE I LOOKED (e.g. `*.control.sh` shell
drivers, named, not parsed). **A driver existing is not a driver having run.**

### RUN vs DECLARED — AND THE LIMIT IS THE FIRST THING STATED (M0-42, 2026-09-16)

**Nothing here proves a control ran**; any artifact a worker can write it can write without running
anything. The limit is printed first and pinned (C7b). `readRunEvidence` grades each declaration:
**RUN** (a past-tense execution verb with an ISO date within 60 characters), **UNDETERMINED** (a
measured-looking outcome, no date — a figure alone cannot separate a measurement from a prediction),
**DECLARED-ONLY**. So: **write your run into the declaration with a date and the figure it produced**
(`RUN 2026-09-16 by M0-42 …`). The grade is syntactic and a forged token passes (arm 9 drives that).
`REGISTER_FLOOR.run` is a ratchet, not a requirement; token staleness is never a finding.
**Re-run a control whose declaration you rely on**: a declaration nobody re-runs decays toward GREEN.
Never retune an assertion's threshold so a control declaration comes true.

## Prose naming an op is a CLAIM about the dispatch table (M0-12)

`bio-plane/scripts/op-claims.mjs` (in the battery; controls `node test/op-claims.control.mjs`) asserts
every op token in the corpus names a key of `OPS` or is ledgered with a reason and an EXACT count, and
checks a stated routing. **It does not check what an op RETURNS** — drive the op before you write what it
returns (REC-58, IC-22). A DO path (`publishcase`) is not an op. This file is in the swept corpus: never
prefix a non-op name to quote the defect. Language-reading drafts were removed (141, then 48 false
claims): a check that cries wolf gets switched off.

## THE BATTERY DISCOVERS, AND A DIRECTORY IS NOT A COMMIT (M0-15, D-238)

`refs/stash` is shared by every worktree, so a file can arrive in yours from another's `pop`. The
battery's `provenance:` line NAMES any discovered suite not in the commit at HEAD, and says UNVERIFIED
when git cannot answer. **Before you quote a baseline or move a floor, read that line**; a count including
a phantom suite is a wrong number held with full confidence. It reports and does not fail, cannot stop the
deposit (prevention: the recipe in `ORCHESTRATION.md`), and says nothing about PUSHED — that is
`plancheck`'s (see WORK THAT REACHES NOBODY).

## DID THE MERGE CARRY WHAT THE BRANCH CHANGED? (M0-20)

`node tools/mergecarry.mjs`, run by `plancheck` §2c before every push, FAILS naming any path a merge kept
main's side of that its branch changed (receipt `e241672`: a dropped floor move goes SLACK, not red).
**When you deliberately take main's side, declare it per path in the merge message:**

    Dropped-from-branch: <path> — <why the branch's change is correctly superseded>

Prose in the body is not the declaration. Predicate copy: `bio-plane/test/mergecarry.test.mjs`.

## ONE PROVENANCE CHECK, AND WHAT IT STILL CANNOT SEE (M0-16, D-238)

**One rule, one module**: every walk that feeds a figure calls `bio-plane/scripts/provenance.mjs`; never
copy the check. Move `REGISTER_FLOOR` only to the REPRODUCIBLE figure — a floor moved while a phantom is
present fails every honest run and gets switched off. Every caller prints and floors its corpus size. A
new `readdirSync` walk fails `hygiene.test.mjs` by name until guarded or named. Blind to: replaced CONTENT
of a tracked path, anything relative to a HEAD other than this worktree's, walks it never saw.

## DOES THE CITATION RESOLVE TO THE ACTOR THE SENTENCE NAMES? (M0-39, 2026-09-15)

`node tools/attribution.mjs`, `plancheck` §2d. An architect attribution means DOCTRINE (not revisitable);
a session's name means MECHANISM (revisitable on evidence). **Attribute to Bob only what Bob ruled**; a
commit resolves to its session through its trailers, a `DEC-n` through its `for:` field, and the arm fails
in BOTH directions. **Never write a specimen into a file that is a corpus** — `tools/decided.mjs` indexes
every ruling marker, so a quoted form mints phantom rulings (D-367). A ruling cited by date and place
alone is not graded: the arm can say a pairing is wrong, not certify it right.

## WORK THAT REACHES NOBODY (M0-48, 2026-09-16 — D-288's DETECTION half)

A change is made when committed AND pushed (`CLAUDE.md` §4), and that holds for a WORKER's tree too.
`tools/strandedwork.mjs`, `plancheck` §8, **warns and never fails** (a gate red on inherited state gets
switched off). **Push your own branch before you report** (D-288 item 1, `WORKER.md`); a disposition is not
a schedule (D-288 sat open five weeks).

### A CORRECT FIX CAN DISARM A CONTROL ARM, AND THE ARM GOES ON REPORTING *ARMED* (2026-09-17)

A control arm is coupled to where the behaviour LIVES; a suite, to the behaviour. After a refactor a green
suite says nothing about its controls. **Re-run the control driver after changing the subject, and read
the arms' own results** — `hits === 1` proves a patch applied, only the downstream assertion proves an
effect (M-60 Q9; `CLAUDE.md` §5).

### TWO SESSIONS AT THE ARTIFACT CAN DISAGREE IF THE INSTRUMENT WILL NOT SAY WHERE IT STOOD (2026-09-17)

STRANDED WORK is estate-wide; UNPUSHED is `origin/main..HEAD` in the tree it runs in. **Read a finding's
`SCOPE:` before acting on it for another tree**, and make any instrument you build declare its vantage:
two disagreeing readings may both be true of different places (`strandedwork.test.mjs` §9).

### Three windows, in three different sets of words

| window | state | next act |
| --- | --- | --- |
| **NEVER PUSHED** | commits past `origin/main`, no remote ref | push it |
| **PUSHED, THEN BEHIND** | remote ref exists, local HEAD not on it | push it |
| **UNCOMMITTED** | working-tree changes | commit first — no push helps |

The unit is the WORKTREE, not the branch: no push closes the third window.

### What is exempt, and how that was wrong twice

A truly idle worktree (nothing past `origin/main` AND no working-tree change, both re-read every run) is
never named. Never exempt on the tip or cache a verdict. MODIFIED and UNTRACKED are counted separately
and printed: report the shape and let the reader judge scratch versus work.

### The population, not the spelling

Enumerate by what a thing IS (`git worktree list --porcelain`, plus local branches with no worktree), never
by a naming glob, which passes its own control for the population it misses. Read the remote with
`git ls-remote`; under `--local` the finding says it used a cache. Prune after deleting a remote branch
(`git fetch --prune`, `kickoffs/CONDUCT.md`).

### The defeat it was designed against arrived twice inside its own construction

**A failed enumeration is a distinct state, never an empty one** (`walkFailed`: *says NOTHING about
stranded work*). Shell out with `execFileSync` and an argv array. Fixtures encode SHAPES, not a snapshot.
Each branch of a WARN path states its own precondition and cannot throw — a throw there kills every later
check.

### What it cannot see, stated rather than left to be found

One clone, one machine, one instant; whether the work matters; a remote other than `origin`; an editor
buffer or stash entry. Controls: `node bio-plane/test/strandedwork.control.mjs` — no arm touches a ref,
a worktree or a working tree (a dirtied tree defeats a `plancheck` control).

## What a queue item must satisfy before it is done

Every acceptance test is runnable; a step that cannot be verified by running something is a wrong step.
An item is done when:

1. `npm run test:battery` is green — the whole battery, not the suite touched — ending
   `N/N suites green · M assertions passing` (`CLAUDE.md` §5).
2. The item's own `accepts-when:` command passes.
3. The negative control for whatever it added has been RUN, and its result is recorded in the suite's
   `NEGATIVE CONTROL:` line.
3a. **A rule enforced in N places carries an assertion at EACH place.** Test through the op AND at each
   enforcement layer the op fronts; a control that breaks one layer must fail against that layer's own
   assertion, not be absorbed by an earlier gate (REC-24, 2026-08-04).
4. `node scripts/coverage.mjs --strict` shows no NEW unreached op and no new undeclared control — run
   directly, exit status read unpiped. A change that adds an op adds a control-plane assertion for it in
   the same turn.
5. For anything destructive or security-sensitive, CONDUCT re-runs the control itself at integration
   rather than believing the worker's report.

## Where the floor goes next, in order

The 2026-07-31 plan, each an M0 item in `MILESTONES.md`: (1) control-plane assertions for the unreached
ops and `sourcereach`; (2) backfill the register; (3) name the unnamed checks, one tampering assertion
each; (4) `npm test` becomes the runner — done (M0-4); (5) `--strict` becomes the gate once 1–3 are done,
not before: **a gate set above the current state fails on day one and gets switched off, which is worse
than no gate.** Today `node tools/gates.mjs` runs `--strict` in the full set (`CLAUDE.md` §6); ask
`coverage.mjs` for the figures, not this list.

## The fleet blind spot, named before it bites (D-117)

An instrument must enumerate every Worker it claims to cover and land with the first member, not after:
an instrument that lags its subject reports a floor that describes nothing. (Fleet coverage: VF-1, above.)

## THE DEC-49 GUARD ASKS WHAT A REFUSAL IS IN PRINCIPLE — 2026-08-08, REC-76 (D-236)

`civicos-ui/check-refusal-codes.mjs` (run by `civicos-ui/test/run.mjs`) grades a returned object by its
VERDICT — the first boolean-shaped property: literal `true` is a success; `false` or a computed boolean is
a refusal owing a translated code; none is UNCLASSIFIED, named, under a falling ceiling. **The rule to
carry: never grade by one literal. INVERT — grade everything that does not declare itself the other
thing — and NAME what cannot be classified** (REC-70, M0-14, CPDF-9, REC-76; D-240 holds two more).

## What this deliberately does not claim

- No branch or line execution inside the plane (the workerd reason above).
- Not the UI: `civicos-ui/test/run.mjs` is its own path.
- **Nothing about live verification.** A green battery is not a serving build (D-108); verify live
  (`CLAUDE.md` §5).

## WHAT COMPOSES THE INSTRUMENTS — the question this document never asked (M0-41's DESIGN GAP, folded in 2026-09-15)

A floor here is a floor on what a run REPORTS unless something makes the run happen (M-25). **Ask of any
instrument whether it can be skipped without trace**; REQUIRED and merely EXISTING are different objects.

## THE FIRST ENTRY LOOP THIS ESTATE COMPOSES, AND WHY IT IS A PUSH RATHER THAN A GATE

`docs/DECIDED.md` is generated from every ruling, so any prose edit stales it (`plancheck` arm 2b fails).
A rebase can stale it under a correct index, after every gate has run, so the guard is a `pre-push` hook
(M0-56): **it runs `decided.mjs --check` and REFUSES a stale push; it never regenerates** (a gate that
edits its subject cannot say whether the tree was correct). When refused: regenerate, commit, push. `plancheck` installs the hook on every run; it writes only `.git/hooks/pre-push` (untracked).

### THE LIMIT, STATED RATHER THAN IMPLIED CLOSED

A fresh clone is unguarded until a gate runs once in it; `--no-verify` skips the hook. A dirty corpus
gets a verdict about the TREE and is told so; a ref whose sha is not HEAD is named as unspoken-for.

### D-406 — ONE HOOK, EVERY WORKTREE, BUT THE SCRIPT RESOLVED PER-WORKTREE

**A mechanism shipped as a file in the repository is in the loop only for checkouts made or rebased after
it landed** — and a missing guard looks exactly like a passing one. The hook tries the worktree's
`tools/pushguard.mjs`, then `<git-common-dir>/bio-pushguard.mjs`. Every write to shared machinery is an
atomic rename; `install()` refuses to downgrade. Remaining limits: a clone covered only after some worktree
has run `plancheck`; a cache that can lag the tracked script.

### THE ACCEPTANCE INSTRUMENT WAS WRONG FIRST, AND THAT IS THE MORE USEFUL FINDING

**A coverage claim about a shared mechanism must drive the artifact that is installed, never a model of
it** — execute the installed hook with cwd set to each worktree and read what it says.
