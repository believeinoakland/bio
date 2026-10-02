# monitoring R29: the link sweep (DRAFT requirements for T23)

**Status** · DRAFT, revised by a worker for BOB #91, 2026-10-02, on `draft/T23-monitoring-notices` from `tranche/T22`, with Bob's answers of K1036 folded in. First drafted by a read-only worker for BOB #90, 2026-10-01. For BOB's review, then pasting into `build/requirements/` at T23's opening (P18). `monitoring.md` is not edited on T22, because T22's L10 monitoring job reads it. Owed by K1019 ("R29: BOB drafts the sweep design during T22 for T23"), `plan/t22-check.md` question 6 and A31, the inventory row A31 (`plan/t22-inventory.md`, `next.md`), and the T22 handoff item (5) (`docs/development/TRANSITION.md` §6).

**Bob's answers (K1036, on "How a Sweep Works")** · (6) It is a link sweep. `match.terms` may be regular expressions, and the member picks `match.formats` from the formats the copy supports. (7) A project owner ratifies a sweep, and any member may draft one. (8) Members are told of every condition that needs a look. BOB's reading adds three to the two drafted items: a listing page that cannot be reached on a run, a redirect out of scope, and a sweep that has filed nothing in its last four runs. (9) A ratified sweep is named standing intent (Intake Doctrine §9). BOB's detail: a regular-expression term is at most 200 characters, uses no backreference or lookaround, and is refused at the gate otherwise.

**How to paste.** Each block below names its target file. A **new** id is added to that file. An **amended** id replaces the text of that id in full. Ids are the next free ones on `tranche/T22`: monitoring is at R52, capture at R81, acquisition at R30, queue-producers at R25, scheduler at R20, promotion at R56 and capture-requests at R44. Re-check the free ids at T23's opening, in case the T22 merges add ids first.

## What the canon fixes

- **Intake Doctrine §4** ("Standing intent", "The ratification fence", "Constraints as security controls", "The manual path"):
  - a sweep names a query, not a document: its scope, its source-class constraints, its cadence and its breadth budget;
  - what a sweep brings lands at `collected`, never higher. The scope is ratified up front, and each document is ratified afterward;
  - fetching is governed by policy, never by a caller;
  - the constraints are explicit origin allowlists, https only and public hosts only;
  - the budget (a fetch cap per tick, a ceiling on the collected backlog, an anomaly note) is part of the ratified definition;
  - the fields have a bounded grammar that the gate checks, and the slate shows them as quoted data.
- **Intake Doctrine §6** (blanket direction): breadth is "bounded exactly as a sweep is". **§4a**: release from hold is per document. **§9**: the daemon creates Information bundles "from named standing intent only, always at collected".
- **State Rules §4.1** (the register): a sweep origin carries `matched_sweep` and `deeming_actor`. **§6, I-18**: such a bundle never stands at verified without a member's transition.
- **NOTIFICATIONS.md**: the item contract and the CONDITION class. **OBSERVATION-LOG-DESIGN** §4.1: the monitor's look.

**Already built:**
- `gathering.json` `sweeps[]` with `id`, `ratified` and `sources`, checked by C-18.5 (`monitoring/checks.mjs`);
- `daemon.sweep_budget`, checked but read by nothing;
- the slate lists ratified sweeps;
- `acquisition` R21 files `origin: {kind: "sweep", matched_sweep, deeming_actor}`;
- `capture` R57 (`links`) and R77 (held captures).

## Rationale (short)

A copy has no index of the web. A third-party search engine would let a provider choose what is fetched, tell that provider what the group is investigating, and could not be reproduced. A link sweep reads only pages the group names as listings (an agenda index, a records portal's list, a feed, a sitemap). It goes one hop, matches the links against the group's ratified terms, and stays inside the origin allowlist. Every document it brings in answers "why does the group hold this?" with three facts: the listing that linked it, the sweep that matched it, and the owner who ratified that sweep.

---

## `monitoring` (amended R29, R31, R36; new R53–R63)

**Standing intent** (Intake Doctrine §4, §9)
- **R29** (amended) A ratified sweep is named standing intent. It is run by R56–R61, within its scope (R53) and its budget, and each document it brings in is filed as its own Information bundle at `collected`, never higher. *(not yet met: T23)*

**The sweep's definition** (an entry of `data/gathering.json` `sweeps[]`, refused by C-18.5 through R27)
- **R53** A sweep is `{id, title, ratified, sources, seeds, match, cadence, budget}` and nothing else. C-18.5 refuses an entry that breaks any of the following, with one finding per field *(not yet met: T23)*:
  - `id`: `^[a-z0-9][a-z0-9-]{0,39}$`, unique within the file. A sweep's full name is `"<bundle>#<id>"`.
  - `title`: a non-empty single line of at most 200 characters.
  - `ratified`: a boolean.
  - `sources`: the origin allowlist. It holds 1–20 public https prefixes (`isPublicHttpsLocator`). Each is a scheme and a host with an optional path prefix, and has no query or fragment. An address is **in scope** when its normalised form (`subresources.normalizeAddress`) equals a prefix, or continues one at a `/`.
  - `seeds`: 1–10 public https locators, each in scope. These are the listing pages read on every run.
  - `match`: `{terms?, paths?, formats?}`.
    - `terms`: 0–20 terms, each as R54 states.
    - `paths`: 0–20 prefixes, each in scope.
    - `formats`: 0–10 format names, each one that `format-registry.listFormats()` (its R8) answers at the gate.
  - `cadence`: `daily`, `weekly` or `monthly` (R14's intervals).
  - `budget`: `{per_run, backlog}`. `per_run` is an integer 1–100 and `backlog` an integer 1–1,000.

  `title` and `terms` are only ever shown as quoted data. `daemon.sweep_budget`, when set, caps the fetches all of a bundle's sweeps make in one tick together. When it is 0, they make none, and the run says so.
- **R54** A **term** is a single-line string of 1–200 characters. It is a regular expression when it is written between slashes (`/…/`), and a literal otherwise. Both match without regard to case *(not yet met: T23)*.
  - C-18.5 refuses a regular expression that does not compile, or that uses a backreference, a lookahead or a lookbehind (`SWEEP_TERM_REFUSED`, naming the term and the construct).
  - A term's matching time is linear in the length of the text it is matched against, whatever the term is. No term can make a run take longer than its text's length bounds.
  - A term is matched against at most 2,048 characters of a link's text and 2,048 of its decoded address. The rest is not read, and the run says how many links it cut.

**Who may write a sweep** (K1036 (7))
- **R55** A non-replay promotion carrying `data/gathering.json` is refused before anything is written, as follows *(not yet met: T23)*:
  - `SWEEP_NOT_A_MEMBER` (C-18.5) when its author is not a member (an identity in `record-grammar`'s non-member set) and it adds a sweep, removes one, or changes any field of one. The one exception is setting `ratified` to `false`.
  - `SWEEP_RATIFY_NOT_AN_OWNER` (C-18.5) when its author is not an owner of the bundle's project (`record-core.bundleInfo`, its R34; `membership.isProjectOwner`, its R54) and the promotion does either of these:
    - sets a sweep's `ratified` to `true`;
    - changes any field of a sweep that is ratified before or after the write.

    A bundle in no project has no owner, so every such promotion on it is refused.

  Any member who may write the bundle may add or change an unratified sweep. An owner's change to a ratified sweep re-ratifies it. Any writer, the daemon included, may set `ratified` to `false`, because stopping breadth is never refused. The ratifying member and the instant are those of the promotion that last set `ratified` to `true` or changed a ratified sweep, read from the bundle's history.

**The run** (`sweepDue(now)`, `sweepWake(now)` and `sweepTick(now, rank?)`, for `scheduler`'s `gathering-sweep` consumer)
- **R56** A sweep is due when all of the following hold *(not yet met: T23)*:
  - it is ratified;
  - the daemon is not paused (R30);
  - its bundle's `daemon.enabled` is not `false`;
  - its project is not at stage `closed` (Bob, K1094 (1));
  - it is not held (R60);
  - it has never run, or its last run plus its cadence's interval is at or before `now`.

  `sweepWake` answers now + 1 s while one is due, else the earliest next run, else null. A tick runs at most 5 due sweeps, longest-overdue first and then by full name. Given the scheduler's rank, it reads at most ten times that number in that order and runs its batch in the rank's order. Each sweep is offered as `{kind: "sweep", id: "<bundle>#<id>", waitingSince}`. Claims and epochs are R21's, and the tick is not re-entrant (R22).
- **R57** **Seeds.** Each seed is fetched through `capture.acquire`, paced by `host-governor`, with `origin: {kind: "sweep", matched_sweep: "<bundle>#<id>", deeming_actor: "bio-monitor"}` and the sweep's `sources` as the redirect scope (`acquisition` R31). Its capture is filed in the sweep's own bundle as a monitor snapshot, in the way R9 files a tick's bytes *(not yet met: T23)*.
  - A seed whose bytes equal its last capture is recorded as `unchanged`, and its candidates are read again from that capture.
  - A seed that fails is recorded with `capture`'s reachability (its R8), and the run goes on with the other seeds.
  - A seed redirected out of scope is not fetched beyond the redirect, and is recorded as `out_of_scope_redirect` with its target.
- **R58** **Candidates and the match.** The candidates are the links in this run's seed captures, read from the seed's own bytes: HTML anchors with their text, feed items with their titles, and sitemap entries (address only). A candidate matches when all of these hold *(not yet met: T23)*:
  - its normalised address is in scope;
  - it lies under one of `match.paths`, when any are given;
  - one of `match.terms` (R54) matches its text or its decoded address, when any are given.

  Only one hop is followed. A matching candidate is skipped, with the reason stated, in each of these cases:
  - this sweep has already filed a capture at that address (`already_swept`);
  - the record already holds a capture at that address (`already_held`);
  - the run's budget is spent (`budget_spent`). Seed fetches count toward `per_run` and toward `daemon.sweep_budget`.

  The rest are fetched in seed order and then in link order, each through `capture.acquire` with R57's origin and redirect scope. A redirect out of scope is recorded as `out_of_scope_redirect` with its target, and nothing at the target is fetched.
- **R59** **Filing.** Each fetched candidate whose detected format (`format-registry.detectFormat`) is in `match.formats` (any format when none are given) is filed as a new Information bundle at `collected` *(not yet met: T23)*:
  - in the project of the sweep's bundle;
  - with the register entry's `origin` as R57 states it;
  - with the seed capture that listed it named in the bundle's Provenance Notes.

  A fetched document of another format is not filed (`format_excluded`), and its fetch still counts toward the budget.
- **R60** **Backlog, hold, anomaly and silence.** *(not yet met: T23)*
  - **Backlog** is `capture.heldCount({sweep: "<bundle>#<id>"})` (`capture` R82): this sweep's documents still at `collected`, neither released nor set aside.
  - **Held:** while the backlog is at or over `budget.backlog`, the sweep does not run, and every read of it (R61) states `held: backlog`.
  - **Anomaly:** once at least 4 runs exist, a run notes an anomaly in either of these cases:
    - it filed more than three times the median of the last 8 runs, and more than 5;
    - it filed 0 while that median is at least 2.

    The note is kept on the run and changes nothing else.
  - **Silent:** a sweep whose last 4 runs each filed nothing, and which is not held, is `silent`.
- **R61** **Reads.** *(not yet met: T23)*
  - `sweeps({viewer})` (`op=sweeps`; read; member session) answers every sweep in a `gathering.json` the viewer may see. Each comes with:
    - its definition, as quoted data;
    - `ratified`, with the ratifying member and instant (R55);
    - `due`, `next`, `held` and the backlog;
    - its last 20 runs, each with the seeds fetched, unchanged, failed or redirected, the candidates, the number filed, the skipped by reason, the links cut (R54) and any anomaly.

    It also answers `formats`, which is `format-registry.listFormats()`, the list the member chooses `match.formats` from (K1036 (6)).
  - R30's due slate carries each due sweep's definition as quoted data inside the fixed framing.
- **R62** **Looks.** Each seed fetch and each candidate fetch writes one observation row (`observation-log`), with these fields *(not yet met: T23)*:
  - authority kind `sweep`, authority `"<bundle>#<id>"`, level `document`, subject the address;
  - state `PRESENT`, referring to the capture, or `LOOKED_INDETERMINATE` with the reason (a failed fetch, `out_of_scope_redirect`, `format_excluded`, or a governed refusal marked `governed`).

  A skipped candidate writes nothing, because nothing was looked at.

**What reaches members** (K1036 (8))
- **R63** `sweepConditions({viewer})` answers, for each sweep the viewer may see, every condition that needs a member's look, derived on read and writing nothing. Each condition is `{sweep, kind, since, detail}` *(not yet met: T23)*:
  - `sweep-held-backlog`: the sweep is held (R60). `detail` gives the backlog and the limit.
  - `sweep-yield-anomaly`: the last run noted an anomaly (R60). `detail` gives the count filed and the median.
  - `sweep-seed-unreachable`: a seed failed on the last run (R57). `detail` names each such seed and its reachability.
  - `sweep-redirect-out-of-scope`: the last run met a redirect out of scope (R57, R58). `detail` names each address and its target.
  - `sweep-silent`: the sweep is silent (R60).

  A condition leaves on the first read after it stops holding.
- **R31** (amended) Its reads give the items `queue-producers` publishes in the item contract, with their options:
  - `source-modified` and `source-removed` (FINDING), one for each flagged tick, from R48 (`queue-producers` R2);
  - `archive-fallback-eligible` (CONDITION), one for each eligible address, from R47;
  - `monitoring-recheck-due` (CONDITION), one for each monitored address overdue by more than its interval or unscheduled, from R16 and R32 (`queue-producers` R3);
  - the five sweep conditions of R63 (CONDITION; `queue-producers` R26).

  This module publishes no item itself, and `queue` reads them. (A32; K1038; K1036 (8)) *(not yet met: T22 for its test, `understanding.test.mjs`:13, a todo; T23 for the sweep items)*

**Invariants**
- **R36** (amended) The daemon fetches only what store state authorizes:
  - a bundle that asks to be monitored;
  - a named request's locators;
  - a ratified sweep's seeds, and the candidates that R58 admits.

  No caller names what is fetched. `op=monitor` takes a bundle id, the fallback names only the document address, and no sweep fetch reaches an address out of its scope (Intake Doctrine §4). *(the sweep arm not yet met: T23)*
- R40 (unchanged): no sweep field is a lens.

**Satisfies** (add): Intake Doctrine §4 (the ratified sweep, the ratification fence, constraints as security controls), §6 (bounded breadth), §9 (named standing intent); State Rules §4.1 (the register's sweep origin) and §6 I-18; `docs/development/NOTIFICATIONS.md` (the CONDITION items); K1036.

**Uses** (add): `format-registry`'s `listFormats` (its R8; `detectFormat` is already used); `capture`'s `heldCount` (its R82); `record-core`'s `bundleInfo` (its R34); `project-stage`'s `projectStage` (its R1, R2), for R56's closed test.

**Suggestions** (add)
- Tables: `sweep_runs` (one row per run, with its counts and anomaly) and `sweep_filed` (the addresses each sweep filed, for `already_swept`). Both are this module's, declared to purge and derived, as R41's are.
- A linear-time matcher (R54) is a Thompson-NFA or RE2-class engine, never JavaScript's backtracking `RegExp`. Banning backreferences and lookaround alone does not make a backtracking engine linear, because `(a|a)*` and `(a+)+` still blow up.
- Codes `SWEEP_TERM_REFUSED`, `SWEEP_NOT_A_MEMBER` and `SWEEP_RATIFY_NOT_AN_OWNER` each take a catalogue row in this module's table (DEC-49). `op=sweeps` takes an `op-declarations` spec (member session, read) in L11.
- Tests:
  - each C-18.5 arm, with a negative control;
  - a regular expression with a backreference, and one with a lookbehind;
  - a pathological term over a 2,048-character text, finishing within a fixed bound;
  - an owner who ratifies against a member who ratifies;
  - a non-owner who changes a ratified sweep, and one who sets `ratified` to `false`;
  - the budget counted with seeds;
  - a redirect out of scope that fetches nothing at its target;
  - an `already_held` skip;
  - the held, anomaly and silent edges at 3/4 runs and at the median;
  - every R63 kind arriving and leaving.

## `capture` (new R82)
- **R82** `heldCount({sweep})` answers the number of Information documents at `collected`, not set aside (R79, R81) and not released, whose register origin names `matched_sweep` equal to `sweep`. It counts the whole store, with no viewer, because it is read only by the daemon's hold (`monitoring` R60). It writes nothing and never throws. An unknown sweep answers 0. (K1036; Intake Doctrine §4, the backlog ceiling) *(not yet met: T23)*

## `acquisition` (new R31)
- **R31** An acquire with a sweep origin carries `scope`, a list of in-scope prefixes (`monitoring` R53). A redirect whose target is not in scope is not followed. The acquire answers `{ok: false, code: "SWEEP_REDIRECT_OUT_OF_SCOPE", target}`, fetches nothing at the target and files nothing. A sweep-origin acquire without `scope` is refused `SWEEP_SCOPE_MISSING`. No caller other than `monitoring` and `capture-requests`' sweep arm sets a sweep origin. (Intake Doctrine §4, "Constraints as security controls") *(not yet met: T23)*

## `queue-producers` (new R26)
- **R26** (monitoring R63; K1036 (8)) CONDITIONs, one for each condition that `monitoring.sweepConditions` answers the viewer *(not yet met: T23)*:
  - the kinds are `sweep-held-backlog`, `sweep-yield-anomaly`, `sweep-seed-unreachable`, `sweep-redirect-out-of-scope` and `sweep-silent`;
  - each is keyed `CONDITION::<kind>::<bundle>#<id>`;
  - each goes to the members of the sweep's project who may see its bundle;
  - its subject is the sweep's bundle, its `age` runs from `since`, and its `detail` comes from the condition;
  - it leaves when the condition leaves.

  The items' words are the UX design stream's (NOTIFICATIONS.md item contract; `docs/development/ux-substrate/ux-experience.json` UC-035).

## `scheduler` (amended R5, R9)
- **R5** (amended) Add, after `monitor-cadence`, the consumer `gathering-sweep` (`monitoring`'s `sweepTick(now, rank)`, its R56, with `sweepDue` and `sweepWake`). The rest of R5 is unchanged.
- **R9** (amended) Add, to the acts that leave the alarm armed, "a promotion that ratifies or re-ratifies a sweep (`promotion` R45)". The rest of R9 is unchanged.

## `promotion` (amended R45)
- **R45** (amended) The last sentence reads: "(`scheduler` registers its `arm`, for a promotion that leaves a bundle monitored or holds a ratified sweep.)" The rest of R45 is unchanged.

## `capture-requests` (new R45; the AI's "relevant nearby" arm, Intake Doctrine §4)
- **R45** A run's request may name a sweep (`sweep: "<bundle>#<id>"`). The drain then files the request with `matched_sweep` set to that sweep and `deeming_actor` set to the run (R38). It does so only when a scope check, registered once at start by `monitoring` (K31's pattern; this module is earlier, P4), answers that the sweep is ratified and not held, and that every locator of the request is in its scope. Otherwise the request is refused `CAPTURE_SWEEP_OUT_OF_SCOPE`. The request counts toward the sweep's `per_run` on the sweep's next run. *(not yet met: T23, or a later tranche by BOB's placement)*

## `modules.json`
- `monitoring` `uses` adds `project-stage` (index 57, earlier than `monitoring` at 72). No other edge changes: `scheduler`, `queue-producers` and `capture-requests`' registration already follow the order.

---

## Bob's answers (K1094, 2026-10-02)

1. **A closed project's sweeps.** Does a ratified sweep keep fetching after its project is closed? **Bob: no** (K1094). It stops, and the stop is stated (R56). A closed project has no one acting on what it brings, and the backlog would grow unread.
2. **A sweep whose ratifier is no longer an owner.** Does it keep running? **Bob: yes** (K1094). It runs until an owner changes it or un-ratifies it, and `sweeps` shows that the ratifier is no longer an owner. Ratification is the group's act at the time, as a signed case is.

Decided by BOB (P17; for the rulings, reported to Bob):
- the regular-expression form (`/…/`) and case-insensitive matching;
- the requirement that matching is linear, met by a linear engine, because K1036's ban on backreferences and lookaround is necessary but not sufficient;
- the 2,048-character match window;
- no default budgets: both figures are required in the definition, so an owner ratifies numbers that are written down;
- one hop only, and the anomaly rule (3× or zero, against the median of the last 8 runs);
- `silent` after 4 empty runs (K1036 (8), BOB's reading);
- the five conditions' recipients: the project's members who may see the bundle;
- at most 5 sweeps per tick; seed captures filed in the sweep's own bundle;
- `daemon.sweep_budget` given its meaning as a per-bundle cap per tick;
- the redirect scope enforced inside `acquisition` (R31), so nothing out of scope is fetched;
- the backlog read as `capture` R82;
- a non-member's write to a sweep refused (Intake Doctrine §4: "written through the gated path by a human");
- the consumer named `gathering-sweep`, distinct from the existing `selection-sweep` and `notice-sweep`;
- the AI's nearby arm (`capture-requests` R45) placed in T23 or later by BOB.
