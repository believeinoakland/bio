# Verification: what "tested" means here, and how it is checked

Established 2026-07-31 (session BOB), at Bob's direction, alongside `MILESTONES.md`.
`CLAUDE.md` states the verification discipline as five ordered steps and the standing
lessons state the rules. **This file is the part that was missing: an INSTRUMENT that
says whether the discipline is actually being followed, and a floor that fails when it
is not.** A rule nobody measures is a rule that erodes silently, which is the same
argument that put the check catalog in front of the gate.

Everything below was measured on 2026-07-31 by the instruments it describes. Numbers
belong to `MEASUREMENTS.md` and are repeated here only where they are the point.

---

## Why line coverage is not the metric, and what is

**36 of the 42 suites drive the plane through Miniflare, which runs `src/**` inside
WORKERD — a different process from the node harness.** `NODE_V8_COVERAGE` therefore
instruments the test files and not the subject: it would report high coverage of
`test/`, nothing at all for `store.mjs`, and the number would be a fabrication in
exactly the sense `cpu.mjs` records for a Worker timing itself. So this project does
not report line coverage, and `scripts/coverage.mjs` says why in its own header rather
than leaving the next session to rediscover it.

What it measures instead is the three surfaces whose gaps have actually shipped
defects here:

| surface | why this one | the defect that earned it |
| --- | --- | --- |
| **ops reached through the control plane** | a real caller has exactly one route | `op=invitelook` shipped with a ReferenceError while 1276 assertions passed (D-43) |
| **checks named by an assertion** | a check only ever run in the passing direction is unproven | C-20.1 skipped every mechanical entry and the audit reported clean because it was not looking (S-7) |
| **negative controls declared** | "a suite that does not fail when you break its subject is testing something else" | the inbox grammar check, neutered, left all 67 assertions passing |

Run it:

```bash
cd bio-plane && node scripts/coverage.mjs --strict
```

**AND READ THE EXIT STATUS WITHOUT A PIPE.** `cmd | tail` reports TAIL's status, not `cmd`'s, so a FAILED strict run reads as exit 0 — CONDUCT recorded a false `exit 0` that way on 2026-08-04 and REC-49 caught it. Also: `npm run test:coverage --strict` does NOT pass the flag (npm swallows it — `npm warn Unknown cli config "--strict"`); the run is strict only because the package script already carries it. When the answer must be evidence, run `node scripts/coverage.mjs --strict` directly and read `$?` with nothing piped after it.

## The measured floor, 2026-07-31

| | measured | note |
| --- | --- | --- |
| suites in the battery | 42 | discovered from `test/`, not from a hand-kept list |
| assertions passing | 2,252 | 42/42 green |
| ops declared | 85 | read out of the `OPS` table in `index.mjs` |
| ops reached through the control plane | 81 (95.3%) | **upper bound**, see below |
| ops reached only at the Durable Object | 1 · `sourcereach` | the D-43 class |
| ops unreached by any suite | 3 · `archivelookup`, `linkproject`, `signerlist` | one is mutating |
| checks in the catalog | 51 | |
| checks named by an assertion | 18 (35.3%) | 33 are exercised only in the direction that passes |
| suites declaring a negative control | **151 of 151 · 782 arms across 150 classified · 1 UNCLASSIFIED, PLUS THE FLEET'S 5 of 5 suites · 48 arms — MOVED AT INTEGRATION 2026-08-10 by CONDUCT, from the figures `--strict` PRINTED on a green run of the merged tree at `eb367d1` (`NEGATIVE CONTROLS 151 of 151 suites declare one (100.0%) · 782 arms stated across 150 classified declaration(s) · fullest 51 (hygiene.test.mjs) · 1 UNCLASSIFIED`; `FLEET … 5/5 SUITES declaring a negative control · 48 arms`).** **THE NINTH CONSECUTIVE ITEM FOUND IT STALE BEFORE THIS MOVE — the outgoing CONDUCT recorded that in its handoff rather than fixing it, which is the honest half; the count of consecutive misses is now itself the strongest argument in this row.** **THE EIGHTH CONSECUTIVE ITEM FOUND THIS ROW STALE, and VF-1 RAISED IT RATHER THAN EDITING IT — which this row's own rule says is the right thing and it is recorded as such rather than corrected.** **AND VF-1 MADE THE FLEET HALF EXIST: until 2026-08-09 the fleet's four suites were NOT IN THIS REGISTER AT ALL, and their controls were counted per MEMBER, so `agent-worker/test/harness.test.mjs` — which IS FL-3/IS-9 and owns one of the seven owed controls — could stop declaring entirely with `--strict` still at EXIT 0 and every printed figure unmoved.** A sibling suite's declaration covered for it. That is this row's own subject one directory over: a figure nobody prints is a figure nobody re-measures, and a register whose reach is narrower than the claim it prints is the same defect as a stale number. The fleet now has its own floor (`FLEET_FLOOR.suites`/`.arms`) and an undeclared fleet suite fails `--strict` BY NAME. **AND THE REASON IT IS THE INTEGRATOR MOVING IT IS THIS ROW'S OWN SUBJECT ANSWERED IN PRACTICE: SEVEN CONSECUTIVE ITEMS FOUND THIS ROW STALE BY MEASURING IT** — M0-14, REC-67, UI-48, CPDF-9, M0-11, REC-65 and M-4 — **and FIVE of the seven DELIBERATELY RAISED IT RATHER THAN EDITING IT**, on the stated reasoning that two workers moving one shared prose figure in parallel is a merge for nothing. They were right, and the proof is one file over: seven items DID move `REGISTER_FLOOR` in parallel, and a keep-both merge twice left **duplicate `arms:` keys in one object literal** — valid JavaScript where the LAST key silently wins, and the last was the LOWEST, which would have installed slack in a ratchet whose whole purpose is to have none. **So the rule this row now carries is: a HAND-CARRIED figure in prose is moved by the INTEGRATOR, once, from a printed run of the merged tree — and a worker that RAISES it rather than editing it has done the right thing and should not be corrected for it.** The instrument prints this figure on every `--strict` run; that is the authority, and this row is a convenience that must never be believed over it. |

**SUPERSEDED READINGS OF THE ROW ABOVE, moved out of the table 2026-08-09 by CONDUCT.**
PL-18 found this metric occupying **THREE table rows** with three different figures, newest
first — so the table asserted its own value three times and a reader had no way to tell which
was current. That is the same hand-carried-figure defect the row itself is about, one level up:
the fix was never to add a fresher row beside the stale one. The readings are kept because each
names what moved and why; they are no longer rows, so nothing reads them as the answer.

- **120 of 120 — REMEASURED 2026-08-08 by M0-14**, and **THE ARMS HALF OF THIS ROW WAS NOT MERELY STALE, IT WAS MEASURED BY AN INSTRUMENT THAT COULD NOT SEE WHOLE DECLARATION STYLES (D-233).** `node scripts/coverage.mjs --strict` now prints `120 of 120 suites declare one (100.0%) · 470 arms stated across 119 classified declaration(s) · fullest 29 (hygiene.test.mjs) · 1 UNCLASSIFIED`. **The same tree read 395 before this item and 462 after, with the suites' declarations UNTOUCHED — the +67 is instrument, not estate**; the further +8 is this item writing its own control into a declaration, which is a property the register has always had and now says so. **Four suites scored ZERO while declaring 48 arms between them, and a fifth scored 1 against a real 10** — the four had FOUR DIFFERENT causes, none of them the numbered style the debt row named. See the section below. The tally now carries a FLOOR (`REGISTER_FLOOR` in `scripts/coverage.mjs`) so it FAILS when it falls, and a declaration the detector cannot read is reported as UNCLASSIFIED and NAMED rather than scored zero. (It read **117 of 117 · 380 arms** remeasured 2026-08-08 by REC-73, which landed `machine-fences.test.mjs` and moved this row in the same turn. The ARMS half of that was ALREADY STALE when REC-73 arrived — it read 370 over a tree the instrument measured at 375 — which was the fourth consecutive item to find a hand-carried figure here wrong by measuring it, and D-233 is the FIFTH, found in the mechanised half instead. It read **116 of 116 · 370 arms** remeasured 2026-08-08 by PL-11; **105 of 105** remeasured 2026-08-07, itself a correction of `0 of 42`.)

- **120 of 120 — REMEASURED 2026-08-08 by M0-14**, and **THE ARMS HALF OF THIS ROW WAS NOT MERELY STALE, IT WAS MEASURED BY AN INSTRUMENT THAT COULD NOT SEE WHOLE DECLARATION STYLES (D-233).** `node scripts/coverage.mjs --strict` now prints `122 of 122 suites declare one (100.0%) · 486 arms stated across 121 classified declaration(s) · fullest 32 (hygiene.test.mjs) · 1 UNCLASSIFIED` — **REMEASURED 2026-08-08 by M0-15**, which added `battery-provenance.test.mjs` (eight marked arms) and moved all three `REGISTER_FLOOR` numerals in the same turn from the figures a green run PRINTED (`GREW by 8 arm(s)`). **The same tree read 395 before this item and 462 after, with the suites' declarations UNTOUCHED — the +67 is instrument, not estate**; the further +8 is this item writing its own control into a declaration, which is a property the register has always had and now says so. **Four suites scored ZERO while declaring 48 arms between them, and a fifth scored 1 against a real 10** — the four had FOUR DIFFERENT causes, none of them the numbered style the debt row named. See the section below. The tally now carries a FLOOR (`REGISTER_FLOOR` in `scripts/coverage.mjs`) so it FAILS when it falls, and a declaration the detector cannot read is reported as UNCLASSIFIED and NAMED rather than scored zero. (It read **117 of 117 · 380 arms** remeasured 2026-08-08 by REC-73, which landed `machine-fences.test.mjs` and moved this row in the same turn. The ARMS half of that was ALREADY STALE when REC-73 arrived — it read 370 over a tree the instrument measured at 375 — which was the fourth consecutive item to find a hand-carried figure here wrong by measuring it, and D-233 is the FIFTH, found in the mechanised half instead. It read **116 of 116 · 370 arms** remeasured 2026-08-08 by PL-11; **105 of 105** remeasured 2026-08-07, itself a correction of `0 of 42`.)




**The control-plane figure is honestly an upper bound and the instrument says so.**
A suite that drives both the worker and the store directly is credited to the worker
for every op it names. The two exact buckets are the ones to act on: unreached, and
Durable-Object-only. An over-credited coverage number is precisely an equality that
costs nothing to produce.

**33 unnamed checks does not mean 33 unrun checks.** `conformance.test.mjs` runs the
whole catalog over real bundles and asserts zero findings, so every check executes.
Unnamed means *no assertion proves the check FIRES on a violation*. That is the exact
shape of the S-7 defect, and it is why this is reported as a coverage gap rather than
as a stylistic one.

## Three defects the instruments found on first run

Recorded because they are the argument for having built them:

1. **`bundle.test.mjs` was in `test/` and not in the `npm test` chain**, so nothing
   ran it. The chain was a hand-maintained list of 38 files against a directory of
   41 — the same class as the purge table list (D-113), and it fell behind in exactly
   the same way.
2. **That suite could not run on any machine but one.** It read
   `/home/claude/work/bio-plane/dist/bio-plane.bundled.mjs`, an absolute container
   path. Now resolved relative to the file.
3. **Once it ran, it failed** — its fixture configured an 11-character probe token
   where `livefire` asserts no configured token is under 16. The fixture was wrong,
   not the rule, so the fixture was CORRECTED rather than the assertion relaxed
   (standing lesson: superseded rules in tests are corrected, never exempted). This
   is D-40's class: a fixture that could not exist on a real instance.

## The battery runs every suite, and reports all of them

`npm test` once chained 38 suites with `&&`, which **stops at the first failure**. D-93
was that defect exactly: `ratify.test.mjs` dies when `ssh-keygen` is absent and
everything after it never runs, on the one path where a false green matters most. As of
M0-4 **both entry points run the discovering runner** — `npm test` is now
`node scripts/battery.mjs`, the same command `npm run test:battery` invokes — so a
crashing suite can no longer hide the suites behind it.

```bash
cd bio-plane && npm run test:battery       # every suite, all reported, fails if any failed
cd bio-plane && npm test                   # identical: also the runner now
node scripts/battery.mjs search cite       # a subset, by name fragment
```

Suites are **discovered from the directory**, so a suite added later cannot fall out
of the battery by not being mentioned. The runner reads each suite's own
`N pass, M fail` line; a suite whose count cannot be read is reported as *unknown*
rather than as zero, because an unreadable number and no assertions are different
claims — the `sshsig` 16-versus-18 case in D-93 is what happens when they are
collapsed.

### What the battery says about TEMP, and about the half it does not own (D-237)

The runner hands every suite a `$TMPDIR` of its own and fails the run on anything left
inside it (D-186). **That figure is about the FENCE, and for eight days it was read as a
figure about the estate.** The line now says so in its own words —
`this run left 0 directories holding 0 miniflare sandboxes INSIDE $TMPDIR` — and a second
report answers the other half:

```
outside the fence: 3 shared temp root(s) walked to depth 4 · 893 top-level entries
                 · 0 HELD by this run · 1 moved while it ran · 2 standing workerd ground(s)
  roots: /private/tmp, /private/var/folders/…/T, /private/var/tmp
  HELD arm: 153 lsof sample(s) covering 125 of 134 suite(s) — 9 suite(s) finished before a
  sample could be taken and were NOT covered by the pid-chain arm
  NAMED — the fenced figure above is a statement about $TMPDIR ONLY …
    /private/tmp/mfp  10.9 MB · 18 file(s) · written 2026-07-31 17:36 .. 2026-08-08 19:13
      PRE-EXISTING, untouched by this run · unfenced · workerd persistence
```

**It never fails a run, and it never says "this run" without a pid chain.** The space it
looks at belongs to everybody — 861 top-level entries and 236 MB of other tools' work on
the development machine, with a second worktree's battery running throughout — so a bare
arrival diff would blame this run for other people's files, which is the same defect
pointing the other way. Three strengths of evidence, never collapsed: **HELD** (a pid
chain from the battery to a process holding the path — the only state allowed to say *this
run*), **APPEARED/CHANGED** (a candidate, with the suite named because suites run
sequentially, and any concurrent checkout produces the identical observation),
**PRE-EXISTING** (not this run's, named anyway because accumulation is the finding).

The structural guard that DOES fail is `hygiene.test.mjs`'s containment check (M0-10): no
suite may root a filesystem ground at an absolute-path literal. This report exists for what
a source read cannot see — a literal built by concatenation, a path in a variable, a path
from an environment variable, a path a dependency chooses — and for residue that is already
there. `scripts/residue.mjs` states its blind spots at the site; D-250 carries the two that
matter, and D-249 carries the one no filesystem instrument can reach at all (a fixed PORT).

The second half of D-93 is closed too: a suite that depends on stock `ssh-keygen`
(`ratify`, `reuse-ratify`, `signpage`) now detects its absence and **skips loudly with
a named reason** — `name: SKIPPED — ssh-keygen not on PATH; …` — rather than dying with
an unhandled spawn error; and `sshsig`, which has a pinned-fixture fallback, runs its 16
pinned assertions and **names the 2 fresh-signature cases it skipped** (`16 pass, 0
fail, 2 skip (…)`) rather than silently reporting 16. The runner surfaces both:
skipped suites are listed `SKIPPED (named)` and a short-running suite is listed `ran
short (named)`, and neither counts as a failure, so with `ssh-keygen` hidden the battery
still completes green.

## The negative-control register

The discipline exists and has never had a ledger, so nobody could answer *which*
suites have been controlled, or when, or what broke. The register is now mechanical:
a suite declares its control in a comment **anywhere in the file**, over **as many
lines and as many arms as it needs**, and the instrument keeps the tally.

```
NEGATIVE CONTROL: <what to break in the subject> -> <what must then fail>
   (b) <the next arm> -> <what that one broke>
```

For example, for `reachability.test.mjs`, whose control is already recorded in prose
in D-104: `NEGATIVE CONTROL: let a governed refusal fall through to the failure path
-> 17 of 34 assertions fail`.

Declaring it is not running it. The line records **what was run and what it broke**,
so a later session can re-run it in one step instead of re-deriving how to break the
subject. Backfilling all 42 is one queued item; a new suite declares one at birth.

**M0-9 corrected this section, and the correction is the point rather than a
detail.** It used to say *inside its first 60 lines*, and the detector behind it
(`/NEGATIVE CONTROL:\s*(.+?)\s*(?:\*\/|$)/` over a 60-line head window) had three
measured failure modes, all in the generous direction:

1. **A declaration whose arms continued onto a second line matched NOTHING**, so the
   suite read as declaring *no control at all*. `.` does not cross a newline and there
   was no `m` flag. This is what took the strict run from exit 0 to exit 1 at 96 of
   98 when REC-48 gave two suites a **longer, better** control block — and REC-48 got
   past it by moving its arms into a second comment the register never saw, which is a
   convention holding an instrument up. (The re-measurement at integration blamed the
   head window instead; that was wrong, and it is corrected here because the wrong
   cause yields the wrong fix.)
2. **The 60-line window** was a real defect too, just not that one: a marker past line
   60 was invisible, and a declaration straddling line 60 was recorded as whatever
   fragment fell inside — silently, while still counting as controlled. One suite in
   the tree (`readingname.test.mjs`) had its fuller declaration outside the window all
   along.
3. **Only the first line was ever captured**, so a five-arm control entered the
   register as one arm. `acquire.test.mjs` was registered with 2 of its 5 arms and
   `hygiene.test.mjs` with 4 of its 9.

The detector now lives in `bio-plane/scripts/control-register.mjs`, with its own
header stating where a declaration ends (its comment's close, or a blank line — a
declaration is a paragraph) and which one is recorded when a suite states its control
twice (the fullest, **never the sum**). The register now also **reports the number of
arms stated**, so a declaration that got shorter is visible; that count is reported and
**never gated** — `--strict` still fails on exactly what it always failed on, a suite
with no declaration at all. The detector's own reach is asserted at the foot of
`hygiene.test.mjs`, on fixtures *and* on the real corpus, every arm a delta rather than
an absolute count: a detector that finds nothing passes everything.

**M0-14 CORRECTED THE TALLY ITSELF, AND THE WAY IT WAS FOUND IS THE POINT.** M0-13
predicted the register would move **388 → 390** for two arms it had just added, and
**it did not move at all.** Four of 120 suites scored ZERO while declaring 48 arms
between them, a fifth scored **1 against a real 10**, and nothing was red — because
the count was reported and never gated, so no figure here could be falsified. That is
the same argument D-231 was worth an item for: *an instrument that reports a number
nobody can falsify trains every session to trust it.*

**The four zeros had FOUR DIFFERENT CAUSES, and none of them was the numbered style
the debt row named.** Read them together, because the class is what matters:

1. `bias.test.mjs` stated thirteen arms **in the arrow grammar the detector already
   understood**, in enumerated paragraphs after the marker's own paragraph. Every
   arrow was legible; the EXTENT rule cut them all off. The style was not exotic —
   the instrument stopped reading.
2. `case-opened.test.mjs` heads its fuller block `NEGATIVE CONTROL —` with a DASH.
   **One character of punctuation made a whole declaration invisible.**
3. and 4. `suggest.test.mjs` and `strengthpair.test.mjs` DELEGATE their arms to a
   sibling `*.control.mjs`. Their own declarations state the arms as ordinal lists
   with **no arrow anywhere** — `strengthpair` says *"THE SEVENTEEN ARMS"* and the
   corrected matcher now counts exactly seventeen.

And the finding nobody was looking for: `versionstate.test.mjs` scored **1**, and that
one was a FALSE POSITIVE — an `->` inside a quoted CODE EDIT, not an arm. **A count
that is merely WRONG is harder to notice than a count that is zero.**

**THE FIX INVERTS THE TEST RATHER THAN LENGTHENING A LIST OF SPELLINGS** (REC-70's
lesson, and its queue row is the precedent). An arm is **one MARKED item of the list a
declaration states**, and a list marks its items in exactly two ways: a TRANSITION (the
`break -> consequence` arrow) or an ENUMERATION (a parenthesised ordinal opening a
segment). The count is **max(transitions, enumerations), never the sum** — an arm
usually carries both, and summing credits it twice, which is `readControl`'s own
never-the-sum rule one level down.

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


**The half that makes it safe, and it is the whole of D-233: a declaration carrying no
marking of either kind is NOT a declaration of zero arms.** It is one the instrument
**could not classify**, it reports `null` rather than `0`, and the register **NAMES it**.
A missing tally reported as zero is how "stayed GREEN" gets recorded for a suite that
never ran.

**WHAT THE MATCHER STILL CANNOT SEE, stated here rather than discovered later:**

- It does not follow a DELEGATION. A declaration whose arms live in another file is
  counted only for the marks in its own text.
- It does not count an arm given a **LABEL** rather than an ordinal — `(D-231a)` — so
  `suggest.test.mjs` reads 8 against a real 10. Widening the ordinal to any bracketed
  token would count every `(D-113)` and `(DEC-46)` this prose is full of, which is the
  over-strictness failure in the other direction. **The tally is therefore an explicit
  FLOOR on arms stated, not an exact count, and the instrument prints that.**
- It cannot tell a list item from quoted code that happens to be a parenthesised
  single letter. The `>= 2 distinct tokens including a first ordinal` guard is what
  stops a lone `(b)` in a sentence from counting.
- `case-opened.test.mjs` remains **UNCLASSIFIED and NAMED**: its foot block separates
  its marker from its arms with a paragraph of prose, and the extent rule deliberately
  does not cross unmarked prose.

**AND THE FIGURE IS NOW FALSIFIABLE, WHICH IS THE OTHER HALF.** `REGISTER_FLOOR` in
`scripts/coverage.mjs` gates `--strict` on the arms tally, on the number of classified
declarations, and on the **corpus** — how many suites the register reads at all, because
a matcher narrowed to nothing reports a beautiful 100% over an empty corpus. A ceiling
could never have caught D-233: this tally only ever rises on its own, so it can only
fall by an edit. **A new UNCLASSIFIED declaration also fails `--strict`**, pinned by
name in `REGISTER_UNCLASSIFIED`, because that is D-233 arriving again.

The six arms are declared in `hygiene.test.mjs`'s own control block and RUN by
`bio-plane/test/register.control.mjs` (`node test/register.control.mjs`).

### THE REGISTER'S REACH STOPPED AT THE PLANE, AND THE SUITE IT COULD NOT SEE WAS THE WORST ONE (VF-1, 2026-08-09)

**Everything above is about how well the register READS a declaration. This is about
WHICH FILES IT READS AT ALL, and the answer was wrong in the generous direction for the
one component that had just been built.** The register's corpus is
`bio-plane/test/*.test.mjs`. The fleet's suites — `pdf-worker/test/`, `agent-worker/test/`
— were held to a different and much weaker rule: `coverage.mjs` asked whether **ANY ONE**
of a member's suites declared a control, and reported the member. So:

- **`agent-worker/test/harness.test.mjs` is FL-3 / IS-9 and it OWNS VF-1's owed control 7**
  (the empty-run instrument). **Hiding its declaration entirely left `--strict` at EXIT 0**,
  printing `2/2 declaring a negative control` and `control declared` beside the member's
  name, with the plane's `134/134 · 621 arms` unmoved. Measured 2026-08-09, before the fix.
- VF-1's own `accepts-when` in `IS-BUILD-PLAN.md` reads *"shows every IS suite declaring …
  an undeclared IS suite would be its first regression."* **For the one IS suite that lives
  in the fleet, that sentence was false**, and the row's named command
  (`node bio-plane/scripts/control-register.mjs`) is a MODULE with no entry point that
  prints nothing and exits 0 over any tree at all. Both are corrected at the row.

**WHAT CHANGED.** The fleet's controls are now read **per SUITE**, at the grain the plane's
are, and `FLEET_FLOOR` gained two numerals — `suites` (the reach: a suite that DISAPPEARS
takes `4/4` to `3/3`, which reads *greener* than before, and only a floor can see that) and
`arms` (a declaration that got SHORTER, which is M0-14's lesson one directory over). An
undeclared or unclassifiable fleet suite now FAILS `--strict` by name. **The old member-level
flag was DELETED rather than left beside the new walk** — the first arm written to prove the
fix came back GREEN because nothing read the flag any more, which is IS-6's C-22.4 receipt
(a second copy of a rule absorbs the control meant to prove the first).

**AND THE SEVEN OWED CONTROLS ARE NOW A LEDGER IN THE INSTRUMENT** rather than a paragraph
in a plan: `OWED_CONTROLS` in `scripts/coverage.mjs` prints all seven on every run with
their owning item, the suite each is recorded in, and the measured figure from the run that
proved it. Four are PLACED and RUN (PL-11, PL-14, PL-3, FL-3); **three are OUTSTANDING and
say so — DEC-44's, DEC-34's and DEC-46(a)'s all belong to PL-16, which has not landed, and
inventing a placement for them would be coverage that measures nothing.** The total is
pinned at seven so a row cannot be deleted to make the section tidy, and the outstanding
count is a ceiling that may only fall in the turn that places AND runs an arm. What the
ledger CANNOT do is read a declaration and judge that the owed arm is the one described —
the four owners spell their reference to VF-1 four different ways, and grading one spelling
is REC-70's defect; the evidence an arm RAN stays the measured figure in the owner's own
`NEGATIVE CONTROL:` line.

**AND THE CLASS SWEEP FOUND THE REST OF THE ESTATE, which is a bigger number than the
thing that started it.** The KIND of defect was never "`some` instead of `every`" — it is an
instrument whose REACH is narrower than the claim it prints. Measured 2026-08-09 and now
PRINTED by `coverage.mjs` on every run rather than written into this file, because a
hand-carried figure goes stale silently:

| directory | declaring a control | arms | read by a register? |
| --- | --- | --- | --- |
| `bio-plane/test` | 135 / 135 | 631 | yes — the register, floored |
| `agent-worker/test` + `pdf-worker/test` | 4 / 4 | 35 | **as of VF-1**, floored |
| `civicos-ui/test` | **19 / 41** | 110 | **no instrument at all** |
| `newgroup/test` | **1 / 2** | 3 | **no instrument at all** |

**The last two are REPORTED and deliberately NOT GATED, and the reason is measured rather
than assumed:** arm (8) of the control harness wires the sweep into `--strict` and the run
EXITS 1 over an honest tree. Those suites belong to UI and to DIST; a gate that fails honest
runs gets switched off, and a fence tighter than its rule is an undeclared interface change
wearing the costume of caution. Authoring 22 declarations from outside the area would produce
the appearance of coverage and none of it — a control nobody ran being the exact defect this
whole section is about. The DELEGATION is in `CLAIMS.md`, dated 2026-08-09.

The suite is `bio-plane/test/owed-controls.test.mjs`; its nine arms are declared there and
RUN by `bio-plane/test/owed-controls.control.mjs` (`node test/owed-controls.control.mjs`
from `bio-plane/`).

## Prose naming an op is a CLAIM about the dispatch table (M0-12)

**REC-58 was a whole queue item spent establishing that a sentence was false**, and the
sentence had already been COPIED into the item's own scope before anybody drove the op.
`bio-plane/scripts/op-claims.mjs` + `bio-plane/test/op-claims.test.mjs` are the
mechanical defence. Run in the battery; the controls are
`node test/op-claims.control.mjs`.

**READ WHAT IT ESTABLISHES BEFORE QUOTING IT AS A DEFENCE. IT IS HALF A DEFENCE AND
THE HALF IT IS NOT IS THE ONE THE ORIGINAL SENTENCE WAS ALSO WRONG ABOUT.**

| it | what |
| --- | --- |
| **DOES** | assert that every `op=<name>` token in the corpus names a key of the `OPS` whitelist, or is registered with a human's reason |
| **DOES** | separate the two LEVELS. `OPS` in `index.mjs` is a strict whitelist; the store's `map` is DO paths resolved from `pathname`, where **no `op=` reaches at all**. `DO_PATH` aliases `op=publish` onto the DO path `publishcase`, so the op whose NAME matches the method is routed AWAY from it |
| **DOES** | check a stated ROUTING — prose saying an op dispatches to a named method must agree with the table |
| **DOES NOT** | **check what an op RETURNS. Not one assertion reads a response shape.** A field arriving through a SPREAD declares no key, so no source-level instrument can see it (REC-58 measured exactly this) |
| **DOES NOT** | verify that a stated NON-existence is TRUE, except for the `NEVER` ledger entries a human registered |

**WOULD IT HAVE CAUGHT IC-22? YES — AND NOT FOR THE REASON THE QUEUE ROW HOPED.** The
sentence prefixed `publishcase` as an op and said it returns `opened`, and it was wrong
TWICE. The check catches the op half: **there is no such op**, `publishcase` is the DO
path. It does not
and cannot catch `returns opened`. Had the sentence named `op=publish` — the same
falsehood about the field, under the correct op name — **every check here would pass
it.** Stated this way because describing it generously is the exact failure M0-12 exists
to prevent.

**THE LANGUAGE-READING VERSION WAS BUILT, MEASURED AND REMOVED, and that measurement is
the reusable part.** Two drafts classified a mention from the prose around it, so a
sentence saying an op does NOT exist would invert the check rather than switch it off.
Draft 1 (a 220-char window, vocabulary including "absent from") called **141** mentions
of ops that DO exist claims that they do not. Draft 2, tightened to +110/-40 with
phrases read off real sites, still produced **48, every one inspected being noise** —
`op=list … a hash that never existed` (the HASH), `absent from op=list` (the RECORD),
`op=ratify … a caller gets unknown op` (a DIFFERENT op in the same clause).
**The vocabulary of non-existence is the vocabulary this repository uses for absence of
every kind**, and no window separates them because the ambiguity is semantic, not
positional. A check that cries wolf gets switched off — this file's own reason for not
making `--strict` the gate yet — so it was removed rather than tuned.

**WHAT REPLACED IT IS A LEDGER**, `LEDGER` in `op-claims.mjs`: every `(file, name)`
where prose names a non-op, with a reason and an EXACT count. Exact, not a ceiling,
on `REGISTER_FLOOR`'s reasoning. Each kind carries its own expiry — a `DO-PATH` entry
fails if the name stops being a route, a `NEVER` entry fails if it becomes one, and
**either fails the day the name appears in `OPS`**. `PLANNED_OPS` registers designed-but-
unbuilt ops BY NAME and fails when one is built.

**WHAT IT FOUND ON ITS FIRST RUN, over 401 files / 16,940,634 chars / 7,063 mentions
across 199 distinct names:** 135 sites naming something that is not an op. **The
sharpest was in the correction REC-58 itself wrote**: `store.mjs`, `case-opened.test.mjs`
and `multifinding.test.mjs` all prefixed `publishcase` as an op while recording that
REC-41 had been *right about the field and wrong about the op*. **Fourth time.** 23 sites corrected
in `bio-plane/**`, which now reads ZERO; the rest are ledgered and delegated, the largest
single instance being `research/DATA-MODEL.md`'s route table (27 registrations) and two
genuinely rotten names there (`session`, `wake`, both prefixed as ops) that are in
neither table. **This paragraph is written in bare path names on purpose: this file is
inside the corpus the check sweeps, and prefixing them to quote the defect would BE the
defect.** The instrument and its suite are both written around their own rule for the
same reason — the first drafts of each FAILED THEMSELVES, which is the "sweep arm that
failed by citing itself" shape this project has already paid for.

## THE BATTERY DISCOVERS, AND A DIRECTORY IS NOT A COMMIT (M0-15, D-238)

Suites are DISCOVERED from the directory rather than from a hand-kept list, which
is the fix for D-93 and is correct. **The cost nobody had priced is that discovery
trusts the directory**, and on 2026-08-08 a worker's first baseline discovered 124
suites including `machinefences-dec49.test.mjs` (57 pass) — another worker's file,
in no commit, gone by the next run. It could not determine how the file arrived and
said so, which is why this became an item.

**The mechanism is named and measured: `git stash` is REPOSITORY-WIDE.**
`refs/stash` is not one of git's per-worktree refs, so all 60 checkouts of this
repository share ONE stash stack; `push -u` carries untracked files, and a `pop`
in another worktree deposits them there. The measurement is in `MEASUREMENTS.md`,
the instance is stash commit `8706832`, and the corrected worker recipe is in
`ORCHESTRATION.md`.

**Why it outranks its size, and it is the whole reason this file exists.** Every
worker is instructed to MEASURE ITS OWN BASELINE AND TRUST IT OVER ITS BRIEF, and
that instruction has caught a stale figure on nine consecutive items. A baseline
that silently includes a phantom suite makes it produce a WRONG NUMBER WITH FULL
CONFIDENCE — strictly worse than the stale briefs it defeats, because a stale brief
is corrected by measurement and this defeats measurement itself. Every item's
`+N attributed by re-running the true baseline` is computed against it.

**What the battery now says, on every run** (this is a real run of the tree that
introduced the check, and it is naming the check's OWN suite because that suite was
not yet committed — the mechanism working on itself):

```
provenance: 126 of 127 discovered item(s) are in the commit at HEAD (eb95b5c) · 125 suite(s) run · 2 fleet manifest(s)
  NOT IN ANY COMMIT — this run COUNTED work no other checkout can see (M0-15):
    bio-plane/test/battery-provenance.test.mjs  (UNTRACKED) — battery-provenance.test.mjs: 23 pass
  7841 assertions were counted above; 7818 of them come from suites that are in the commit.
```

It NAMES rather than skips — a runner that silently dropped an untracked suite would
hide the next phantom exactly as the silence hid this one, which is M0-14's rule for
the register (an unclassifiable declaration is NAMED, never scored zero) and CPDF-9's
for the dark fleet member. It checks BOTH discovery paths, because a `fleet-member.json`
enrols a whole directory and is therefore the larger hole. It uses `git ls-tree HEAD`
and not `git status`, because an IGNORED file does not appear in `git status` and
`.claude/worktrees/` is ignored here. And when git cannot answer it prints
**UNVERIFIED**, never clean.

**What it still cannot see, stated here rather than discovered later:**

- **It reports and does not FAIL.** A worker writing a suite before committing it is
  the normal case, and failing on that would be a false red on the battery. So a run
  whose totals include a phantom is still GREEN and only this line says so. Closing
  that is a decision about how workers work, not about the runner.
- **It cannot stop the deposit**, only the silent count. Prevention is the recipe
  change in `ORCHESTRATION.md`.
- ~~**Three other walks over the same uncontrolled directory are unguarded**~~ —
  **CLOSED 2026-08-08 by M0-16, and the rule moved rather than being copied.** See
  the section below.
- **It says nothing about whether a commit is PUSHED.** "In a commit" is a weaker
  claim than "reaches anybody", and `tools/plancheck.mjs` is what checks the latter.

## DID THE MERGE CARRY WHAT THE BRANCH CHANGED? (M0-20)

`node tools/mergecarry.mjs`, and `tools/plancheck.mjs` section 2c runs it before every
push. For every merge in `origin/main..HEAD` it compares the file set the merge CARRIED
against the file set its branch CHANGED, and FAILS naming any path where the merge kept
main's version byte for byte.

**The receipt.** `e241672`, 2026-08-08: REC-69's branch changed 12 files, the merge carried
11, and the missing one held **70 lines of floor moves**. **Nothing went red** — a dropped
floor move goes SLACK, not broken — so the battery was green, `--strict` exit 0 and
`civicos-ui/test/run.mjs` exit 0 while eleven floors sat stale for days. It surfaced by
accident. That is the shape this whole document exists to make impossible, arriving in the
one place none of the three instruments looks.

**Why it is in `plancheck` and not in the battery.** The battery runs in every worker's
worktree, where there is no merge to judge, so the check would be a no-op for ~85 of ~86
runners — and a check that finds nothing for almost everybody is one nobody notices
breaking. `plancheck` runs at the moment the defect is created, in the tree of the only
session that merges. The battery carries a copy of the PREDICATE
(`bio-plane/test/mergecarry.test.mjs`), for the reason `mintid` already states: the
cheap-and-early copy plus the cannot-be-bypassed copy.

**A worktree CAN judge a merge, and this was checked rather than assumed.** A linked
worktree's `.git` is a file; `--git-common-dir` resolves to the shared object store, so
every commit is reachable from every worktree even though the working tree holds one.

**THE FALSE POSITIVE IS THE WHOLE DESIGN PROBLEM, AND IT IS THIS DOCUMENT'S OWN ARGUMENT
TURNED ON A NEW CHECK.** A merge legitimately carries fewer files than its branch changed
in several ordinary cases; a check that fires on them gets switched off, which is the
stated reason `--strict` is not the gate yet. Measured over `origin/main`'s whole history —
**182 merges, 3 findings, none of them a false positive**. The benign classes are
enumerated in the tool and DRIVEN one by one through real `git merge`: main already made
the same change; the file was deleted on main; the file was renamed on main; an octopus
merge; a rebase before merging; a fast-forward; a branch deletion main declined.

**WHAT IT CANNOT DISTINGUISH, AND THIS IS THE HONEST LIMIT.** A drop is also the shape of a
correct hand-resolution that deliberately took main's side — the trees are identical and no
archaeology separates them. The check does not claim to know which. It requires the drop to
be **DECLARED**, per path, in a trailer:

    Dropped-from-branch: <path> — <why the branch's change is correctly superseded>

**Prose in the merge body is deliberately NOT the declaration**, because prose is what
failed: REC-69's merge message named `check-refusal-codes.mjs`, described taking main's
side, and promised a re-read that never came. The trailer's value is that it puts somebody
at the keystroke where they must finish the sentence, and an unfinishable sentence is the
finding.

## ONE PROVENANCE CHECK, AND WHAT IT STILL CANNOT SEE (M0-16, D-238)

M0-15 closed the battery's two discovery walks and NAMED the rest. **M0-16 did not
copy that check into the other files.** It moved it into `bio-plane/scripts/provenance.mjs`
and made the walks its CALLERS, because four statements of one rule is how the next
one goes stale in silence — the same argument as the machine-identity predicate
(REC-46) and the DISPOSITIONS table (REC-35). `battery.mjs` prints exactly what it
printed before; its suite is 23 pass before and after.

**Guarded now:** `scripts/battery.mjs` (2 walks), `scripts/coverage.mjs` (3 — suites,
fleet manifests, and the `wrangler.jsonc` files by which a directory is judged to be
a Worker), `test/hygiene.test.mjs` (3 over `test/`, plus its 5 over `src/` and
`checks/`). **Two corrections landed with it:** `coverage.mjs`'s fleet walk had NO
dotfile filter while the battery's always has, so it could enrol a member the runner
it reports on would never run; and `REGISTER_FLOOR` is now compared against — and
must be moved to — the REPRODUCIBLE figure.

**Why the floor is the payload.** `REGISTER_FLOOR` is moved BY HAND to a figure a
green run printed, by seven different items on 2026-08-08 alone. A floor moved while
a phantom was present is PERMANENTLY TOO HIGH: it fails every honest run afterwards,
and a gate that fails honest runs gets switched off — which is this file's own stated
reason for not making `--strict` the gate yet. So the defect's payload was never a
wrong number; it was a disabled ratchet. **This was not theoretical during the build:**
with M0-16's own suite written and not yet committed, the instrument printed
`arms 534` beside a reproducible `526`, refused to compare against 534, and said in
as many words which of the two a floor may be quoted from.

**THE CLASS, SWEPT AND RATCHETED RATHER THAN JUDGED.** `hygiene.test.mjs` now counts
every `readdirSync` site in the estate: **21 files walk a directory, 3 are GUARDED,
18 are NAMED.** A new one fails by name. The named eighteen mostly report findings
about source rather than baselines anybody quotes into a floor, so the payload above
does not reach them — **with one exception, and it is delegated in `CLAIMS.md`:
`civicos-ui/test/run.mjs` is the UI battery's RUNNER, it discovers over a directory
it does not control, and the total it prints IS a baseline sessions quote.** That is
`battery.mjs` before M0-15, one estate over.

**What the check cannot see, stated in the module and repeated here:**

- **CONTENT.** `ls-tree HEAD --name-only` answers about a PATH. A tracked file whose
  content was REPLACED is "in the commit" by this test. It detects an ARRIVAL, not a
  MODIFICATION — `git status` sees the second and is the wrong instrument for the
  first, which is why the two are different questions.
- **HEAD ITSELF.** Every answer is relative to this worktree's HEAD; the short SHA is
  printed for that reason.
- **ANYTHING DISCOVERY NEVER ADMITTED.** The check is handed what a walk counted, so
  a NARROWED walk reports a clean provenance over an empty corpus. Every caller
  therefore PRINTS ITS CORPUS SIZE and floors it.
- **The census matcher** sees a literal `readdirSync(` in a tracked `.mjs` under
  `bio-plane/` or `civicos-ui/`. It does not see `fs.promises.readdir`, `opendirSync`,
  a glob library, a shell walk, an aliased binding, or anything in `newgroup/`,
  `tools/`, `agent-worker/` or `pdf-worker/`; and it cannot tell a temp-directory walk
  from a repository walk, which is why the named list carries that judgement.

## What a queue item must satisfy before it is done

The one thing `PLAN.md` had that `QUEUE.md` did not: *every acceptance test is
runnable, and a step that cannot be verified by running something is a wrong step.*
That moves onto the item as `accepts-when:`. An item is done when:

1. `npm run test:battery` is green — the whole battery, not the suite touched.
2. The item's own `accepts-when:` command passes.
3. The negative control for whatever it added has been RUN, and its result is
   recorded in the suite's `NEGATIVE CONTROL:` line.
3a. **A rule enforced in N places carries an assertion at EACH place.** REC-24's
   correspondence control initially PASSED its first suite draft: the op refused
   malformed input before the document was ever written, so the catalog arm and the
   write arm sat untested behind the op's own refusal — neutering them changed
   nothing the suite could see. Test through the op AND at each enforcement layer
   the op fronts; a control that breaks one layer must fail against that layer's
   own assertion, not be absorbed by an earlier gate. (2026-08-04.)
4. `node scripts/coverage.mjs --strict` shows no NEW unreached op and no new undeclared control — run directly, exit status read with nothing piped after it (see the note above).
   A change that adds an op adds a control-plane assertion for it in the same turn.
5. For anything destructive or security-sensitive, CONDUCT re-runs the control
   itself at integration rather than believing the worker's report.

## Where the floor goes next, in order

Each of these is a queue item under M0 in `MILESTONES.md`, not an aspiration here:

1. **The three unreached ops get control-plane assertions**, and `sourcereach` gets
   one through the worker rather than only at the store. Smallest, and it closes the
   D-43 class for the current surface.
2. **Backfill the negative-control register** across the 42 suites, one line each,
   recording what was actually broken and what failed.
3. **Name the 33 unnamed checks**, cheapest first: one assertion per check that
   tampers a conformant bundle and requires that check by id. This is the largest
   single coverage gain available and it is mechanical.
4. ~~**`npm test` becomes the runner**, so a crash cannot hide the suites behind it
   (closes D-93's first half; the second half is `ratify.test.mjs` skipping loudly
   when `ssh-keygen` is absent rather than dying).~~ DONE (M0-4): `npm test` is now
   `node scripts/battery.mjs`; `ratify`/`reuse-ratify`/`signpage` skip loudly with a
   named reason and `sshsig` names its 2 skipped cases — both halves of D-93 closed.
5. **`--strict` becomes the gate** once 1 to 3 are done, so the floor cannot fall
   back. Not before: a gate set above the current state fails on day one and gets
   switched off, which is worse than no gate.

## The fleet blind spot, named before it bites (D-117)

`scripts/coverage.mjs` reads the `OPS` table out of `bio-plane/src/index.mjs`. The
2026-07-31 topology decision adds Workers beside the plane (`pdf-worker` first, I6),
and **a second Worker's surface is not counted at all**. The day the first fleet
member ships, coverage reports the same percentage while a whole component goes
untested — wrong in the generous direction, which is the one failure mode this file
exists to prevent.

The instrument must enumerate fleet members and hold each to the same three surfaces.
It is an M0 item, and it should land in the same turn as the first fleet member rather
than after it: an instrument that lags the thing it measures reports a floor that no
longer describes anything.

## THE DEC-49 GUARD ASKS WHAT A REFUSAL IS IN PRINCIPLE — 2026-08-08, REC-76 (D-236)

`civicos-ui/check-refusal-codes.mjs` is run by `civicos-ui/test/run.mjs`, from the
REPO ROOT, and it is the instrument that makes DEC-49 safe: *every code a surface
can receive has a translation, and an untranslated code FAILS THE HARNESS rather
than reaching a member.* Its arm C — the teeth — used to grade a refusal by ONE
literal, `ok: false`, and this section is here because **that is the most-repeated
instrument defect in this repository and it now has a stated remedy rather than a
fourth instance.**

**HOW IT DECIDES NOW.** Arm C takes every object literal in RETURN POSITION inside
a governed span and reads its VERDICT — the FIRST BOOLEAN-SHAPED top-level
property. A verdict of literal `true` means the outcome DECLARES ITSELF A SUCCESS
and is not judged; the literal `false` or a COMPUTED boolean (`!x`, a comparison,
`Boolean(x)`) is a refusal and owes a code with a canned translation; **no
boolean-shaped property at all is UNCLASSIFIED, printed BY NAME on every run and
held under a ceiling that may only fall.** The field names (`ok`, `started`,
`found`, `proposed`, `preview`) are what go stale; the set of boolean-producing
OPERATORS is fixed by JavaScript's grammar, not by the next commit.

**WHY IT MATTERS BEYOND ONE GUARD, and the rule to carry:** a classifier that
grades by one literal reads as a complete sweep while it is partly blind, and it
fails in the GENEROUS direction. **The fix is always to INVERT — grade everything
that does not declare itself the other thing — and to NAME what cannot be
classified.** REC-70 (27 hidden ops), M0-14 (four suites scoring zero for four
different reasons), CPDF-9, and now REC-76 are the same defect four times.

**WHAT THE GUARD CANNOT SEE, stated because a limit nobody wrote down gets
rediscovered by paying for it:** a refusal built into a VARIABLE and returned later
(measured: 0 of 61 governed sites, though `subresources.mjs` writes refusals that
way outside them); a NEGATIVE-POLARITY verdict (`failed: true`), for which the
cross-check is that a declared success carrying a refusal CODE fails, gated at
zero; and a refusal a helper builds out of sight, which is arm A's and arm B's
ground rather than arm C's. **Two other instruments still grade a return by one
literal and are ledgered as D-240** with their measured cost.

## What this deliberately does not claim

- **It does not measure branch or line execution inside the plane.** It cannot, for
  the workerd reason above. If that is ever wanted, it needs a workerd-side
  instrument, and that is a real piece of work rather than a flag.
- **It does not measure the UI.** `civicos-ui/test/run.mjs` is its own path and UI
  is dormant; extending the instrument there is an item under M7.
- **It says nothing about live verification.** A green battery is not a serving
  build (D-108), and `op=audit` clean on the instance remains a separate step in
  `CLAUDE.md`'s ladder. No instrument here substitutes for it.
