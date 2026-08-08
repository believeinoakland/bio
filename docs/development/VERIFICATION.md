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
| suites declaring a negative control | **120 of 120 — REMEASURED 2026-08-08 by M0-14**, and **THE ARMS HALF OF THIS ROW WAS NOT MERELY STALE, IT WAS MEASURED BY AN INSTRUMENT THAT COULD NOT SEE WHOLE DECLARATION STYLES (D-233).** `node scripts/coverage.mjs --strict` now prints `120 of 120 suites declare one (100.0%) · 470 arms stated across 119 classified declaration(s) · fullest 29 (hygiene.test.mjs) · 1 UNCLASSIFIED`. **The same tree read 395 before this item and 462 after, with the suites' declarations UNTOUCHED — the +67 is instrument, not estate**; the further +8 is this item writing its own control into a declaration, which is a property the register has always had and now says so. **Four suites scored ZERO while declaring 48 arms between them, and a fifth scored 1 against a real 10** — the four had FOUR DIFFERENT causes, none of them the numbered style the debt row named. See the section below. The tally now carries a FLOOR (`REGISTER_FLOOR` in `scripts/coverage.mjs`) so it FAILS when it falls, and a declaration the detector cannot read is reported as UNCLASSIFIED and NAMED rather than scored zero. (It read **117 of 117 · 380 arms** remeasured 2026-08-08 by REC-73, which landed `machine-fences.test.mjs` and moved this row in the same turn. The ARMS half of that was ALREADY STALE when REC-73 arrived — it read 370 over a tree the instrument measured at 375 — which was the fourth consecutive item to find a hand-carried figure here wrong by measuring it, and D-233 is the FIFTH, found in the mechanised half instead. It read **116 of 116 · 370 arms** remeasured 2026-08-08 by PL-11; **105 of 105** remeasured 2026-08-07, itself a correction of `0 of 42`.) | the backfill in item 2 below is DONE, the register is complete, and as of M0-14 it is FALSIFIABLE | **AND A FIFTH ITEM FOUND IT STALE INDEPENDENTLY IN THE SAME HOURS: REC-67 measured `117 of 117 · 380` against a real `120 of 120 · 395` and corrected it, from a tree that had not yet seen M0-14 — and UI-48 and CPDF-9 each RAISED it rather than editing it, deliberately, to avoid two items moving one shared floor in parallel. **Four items measuring one row wrong in one day, and only one of them touching it, is this row's own subject answered in practice: a hand-carried figure goes stale silently, and what fixes it is the instrument printing the number rather than the document carrying it.** THE CURRENT PRINTED FIGURE IS `483 arms across 121 classified declarations over a corpus of 122`, **remeasured 2026-08-08 by REC-65 and moved in `REGISTER_FLOOR` from the figures the instrument PRINTED on a green run.** (It read `471 arms / 119 / 120`, moved at integration by CONDUCT because REC-75 added an arm after M0-14 measured — the fifth time in two days a figure has been true of one branch and false of the merged tree.) **REC-65 IS THE SIXTH CONSECUTIVE ITEM TO FIND THIS BLOCK STALE BY MEASURING IT, AND IT SPLIT ITS OWN CONTRIBUTION OUT RATHER THAN CLAIMING THE WHOLE MOVE — which is the part that makes the next reading checkable.** With its own suite moved ASIDE, the same worktree printed `475 / 120 / 121` against a floor of `471 / 119 / 120`: **4 arms and one of each of the other two were already owed by work that landed without moving the floor**, before REC-65 wrote a line. Its own contribution is +8 arms and +1 classified / +1 corpus, from `identity-claims.test.mjs`. The measurement that separates the two is one command — run the register with the new suite removed — and it is recorded here because "I moved the floor by N" and "N was mine" are different claims that this row has now collapsed six times.

| suites declaring a negative control | **120 of 120 — REMEASURED 2026-08-08 by M0-14**, and **THE ARMS HALF OF THIS ROW WAS NOT MERELY STALE, IT WAS MEASURED BY AN INSTRUMENT THAT COULD NOT SEE WHOLE DECLARATION STYLES (D-233).** `node scripts/coverage.mjs --strict` now prints `120 of 120 suites declare one (100.0%) · 470 arms stated across 119 classified declaration(s) · fullest 29 (hygiene.test.mjs) · 1 UNCLASSIFIED`. **The same tree read 395 before this item and 462 after, with the suites' declarations UNTOUCHED — the +67 is instrument, not estate**; the further +8 is this item writing its own control into a declaration, which is a property the register has always had and now says so. **Four suites scored ZERO while declaring 48 arms between them, and a fifth scored 1 against a real 10** — the four had FOUR DIFFERENT causes, none of them the numbered style the debt row named. See the section below. The tally now carries a FLOOR (`REGISTER_FLOOR` in `scripts/coverage.mjs`) so it FAILS when it falls, and a declaration the detector cannot read is reported as UNCLASSIFIED and NAMED rather than scored zero. (It read **117 of 117 · 380 arms** remeasured 2026-08-08 by REC-73, which landed `machine-fences.test.mjs` and moved this row in the same turn. The ARMS half of that was ALREADY STALE when REC-73 arrived — it read 370 over a tree the instrument measured at 375 — which was the fourth consecutive item to find a hand-carried figure here wrong by measuring it, and D-233 is the FIFTH, found in the mechanised half instead. It read **116 of 116 · 370 arms** remeasured 2026-08-08 by PL-11; **105 of 105** remeasured 2026-08-07, itself a correction of `0 of 42`.) | the backfill in item 2 below is DONE, the register is complete, and as of M0-14 it is FALSIFIABLE | **AND A FIFTH ITEM FOUND IT STALE INDEPENDENTLY IN THE SAME HOURS: REC-67 measured `117 of 117 · 380` against a real `120 of 120 · 395` and corrected it, from a tree that had not yet seen M0-14 — and UI-48 and CPDF-9 each RAISED it rather than editing it, deliberately, to avoid two items moving one shared floor in parallel. **Four items measuring one row wrong in one day, and only one of them touching it, is this row's own subject answered in practice: a hand-carried figure goes stale silently, and what fixes it is the instrument printing the number rather than the document carrying it.** THE CURRENT PRINTED FIGURE IS `122 of 122 suites · 480 arms across 121 classified declarations`, **re-measured 2026-08-08 by REC-63**, which added one suite (`provenance-marker.test.mjs`, a five-arm declaration) and moved all three halves of `REGISTER_FLOOR` in the same turn from what the instrument PRINTED — `GREW by 9 arm(s)` — rather than by adding to the number in the file. The previous figure was `471 arms`, moved at integration by CONDUCT because REC-75 added an arm after M0-14 measured — **the fifth time in two days a figure has been true of one branch and false of the merged tree, which is why REC-63's own note at the floor tells the integrator to re-read it from the merged tree rather than trust it.**

| suites declaring a negative control | **120 of 120 — REMEASURED 2026-08-08 by M0-14**, and **THE ARMS HALF OF THIS ROW WAS NOT MERELY STALE, IT WAS MEASURED BY AN INSTRUMENT THAT COULD NOT SEE WHOLE DECLARATION STYLES (D-233).** `node scripts/coverage.mjs --strict` now prints `122 of 122 suites declare one (100.0%) · 486 arms stated across 121 classified declaration(s) · fullest 32 (hygiene.test.mjs) · 1 UNCLASSIFIED` — **REMEASURED 2026-08-08 by M0-15**, which added `battery-provenance.test.mjs` (eight marked arms) and moved all three `REGISTER_FLOOR` numerals in the same turn from the figures a green run PRINTED (`GREW by 8 arm(s)`). **The same tree read 395 before this item and 462 after, with the suites' declarations UNTOUCHED — the +67 is instrument, not estate**; the further +8 is this item writing its own control into a declaration, which is a property the register has always had and now says so. **Four suites scored ZERO while declaring 48 arms between them, and a fifth scored 1 against a real 10** — the four had FOUR DIFFERENT causes, none of them the numbered style the debt row named. See the section below. The tally now carries a FLOOR (`REGISTER_FLOOR` in `scripts/coverage.mjs`) so it FAILS when it falls, and a declaration the detector cannot read is reported as UNCLASSIFIED and NAMED rather than scored zero. (It read **117 of 117 · 380 arms** remeasured 2026-08-08 by REC-73, which landed `machine-fences.test.mjs` and moved this row in the same turn. The ARMS half of that was ALREADY STALE when REC-73 arrived — it read 370 over a tree the instrument measured at 375 — which was the fourth consecutive item to find a hand-carried figure here wrong by measuring it, and D-233 is the FIFTH, found in the mechanised half instead. It read **116 of 116 · 370 arms** remeasured 2026-08-08 by PL-11; **105 of 105** remeasured 2026-08-07, itself a correction of `0 of 42`.) | the backfill in item 2 below is DONE, the register is complete, and as of M0-14 it is FALSIFIABLE | **AND A FIFTH ITEM FOUND IT STALE INDEPENDENTLY IN THE SAME HOURS: REC-67 measured `117 of 117 · 380` against a real `120 of 120 · 395` and corrected it, from a tree that had not yet seen M0-14 — and UI-48 and CPDF-9 each RAISED it rather than editing it, deliberately, to avoid two items moving one shared floor in parallel. **Four items measuring one row wrong in one day, and only one of them touching it, is this row's own subject answered in practice: a hand-carried figure goes stale silently, and what fixes it is the instrument printing the number rather than the document carrying it.** THE FIGURE AFTER M0-15 IS `486 arms / 121 classified / 122 corpus`, printed by a green `--strict` run of that tree. The figure before it was `471 arms`, moved at integration by CONDUCT because REC-75 added an arm after M0-14 measured — **the fifth time in two days a figure has been true of one branch and false of the merged tree.**

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
- **Three other walks over the same uncontrolled directory are unguarded**:
  `scripts/coverage.mjs` (suites, and fleet manifests — without battery's dotfile
  filter) and `hygiene.test.mjs` (three corpus walks). A phantom inflates the
  register corpus, so a `REGISTER_FLOOR` moved while one is present would be
  permanently too high. Named in D-238.
- **It says nothing about whether a commit is PUSHED.** "In a commit" is a weaker
  claim than "reaches anybody", and `tools/plancheck.mjs` is what checks the latter.

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

## What this deliberately does not claim

- **It does not measure branch or line execution inside the plane.** It cannot, for
  the workerd reason above. If that is ever wanted, it needs a workerd-side
  instrument, and that is a real piece of work rather than a flag.
- **It does not measure the UI.** `civicos-ui/test/run.mjs` is its own path and UI
  is dormant; extending the instrument there is an item under M7.
- **It says nothing about live verification.** A green battery is not a serving
  build (D-108), and `op=audit` clean on the instance remains a separate step in
  `CLAUDE.md`'s ladder. No instrument here substitutes for it.
