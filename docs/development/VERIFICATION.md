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
| suites declaring a negative control | 0 of 42 | the discipline is real and has never been recorded |

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
a suite declares its control in a comment inside its first 60 lines, and the
instrument keeps the tally.

```
NEGATIVE CONTROL: <what to break in the subject> -> <what must then fail>
```

For example, for `reachability.test.mjs`, whose control is already recorded in prose
in D-104: `NEGATIVE CONTROL: let a governed refusal fall through to the failure path
-> 17 of 34 assertions fail`.

Declaring it is not running it. The line records **what was run and what it broke**,
so a later session can re-run it in one step instead of re-deriving how to break the
subject. Backfilling all 42 is one queued item; a new suite declares one at birth.

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
