# The observation log — Part II §18 piece 3

**Status** · v0.1 DRAFT design, written 2026-09-14 by session BOB #11 under Bob's standing delegation (mechanism is the architect's). Not yet reviewed by Bob. It rests on three things already settled: the architectural decision in `STORE-AS-CACHE.md` that THE RECORD AND THE OBSERVATION LOG ARE SEPARATE, WITH DIFFERENT LIFECYCLES; Bob's four-level correction of 2026-08-04 (Part II §14.3); and the investigative run's log (`INVESTIGATIVE-SESSION.md` §11), which is BUILT (`ai_run_log`) and is the precedent this generalises. One choice is doctrine-adjacent and is stated with its provisional and its reversal cost rather than decided silently: a member's unattributed search is never logged (§4.6). Complete as a design at its level; the authored half of the frontier (a member's LEAD, D-194) is designed in Program B and this document carries only the column it needs. **§8 ITEM 1 IS BUILT (REC-93, IC-92 on I5): the `observations` table, the ONE append site with C-22.1/22.2/22.3/22.6 generalised onto it plus two new refusals C-22.9 and C-22.10, the frontier view and its bounded document-level read (`op=frontier`), the document-level writers at acquire / the sweep / ratify / the archive fallback, §7's edge-triggered rule, and the `ai_run_log` FOLD with `op=airunlog` proved byte-identical against the pre-item build itself. Item 2 is BUILT by REC-94, below; items 3 and 4 are NOT built and are REC-95 and REC-96.**

**§8 ITEM 2 IS BUILT (REC-94, IC-95 on I3): the content-level writer at promote and at a re-extraction — one row per extraction attempt per capture per TIER, cumulative so the frontier's latest row is true of the capture — through REC-93's ONE append site, which it does not duplicate; the per-capture content-axis read (`op=contentaxis`); and the bounded content-level frontier (`op=frontier&level=content`, which no longer answers not-built) with its re-extraction candidate list, derived from the log's own states and from CPDF-13's calibration drift join rather than from a second copy of either rule. **The content-axis vocabulary of `CONTENT-SEARCH-DESIGN.md` §4.4 is now ONE EXPORTED CONSTANT** (`CONTENT_AXIS_STATES` in `bio-plane/src/airun.mjs`) with a fifth constant beside it for the UNDETERMINED answer; REC-94 was the FIRST of the three items to land and therefore exported it, and a divergent spelling is a build error. **Items 3 and 4 are NOT built and are REC-95 and REC-96.** as of 2026-09-15

**Place in the system** · Level 2. Serves construct 9 (retrieval — the store as a read-through cache; `BIO_System_Design.md` §3 names no level-1 home, Part II §14.2–14.3 and §17's OBSERVE row carry the design) and construct 10 (standing intent and monitoring, `BIO_Intake_Doctrine_v1_1.md` §4). Depends on `STORE-AS-CACHE.md` ("The one architectural decision", "What each new piece must carry") and `INVESTIGATIVE-SESSION.md` §11 and §14b.6–7. Feeds `CONTENT-SEARCH-DESIGN.md` §4.4 (the content-axis tally a search answer carries), D-196 (the completeness statement gains a search record), D-194 and D-184 (Program B, piece 5: the lead and the firsthand observation plug into the `authority` column). Supersedes the run log's table as a separate shape: `ai_run_log` folds into this table (§4.4) and `op=airunlog` reads through unchanged.

**Incomplete sections** ·
- §4.2 — **THREE THINGS REC-94 FOUND BY BUILDING IT.** (1) **The fourth outcome has no producer.** *The document has no text (a scan, and tier 3 read nothing above the floor)* is `LOOKED_ABSENT`, and telling it apart from *text was produced* needs a CHARACTER COUNT the persisted reading does not carry — measured, not assumed. The field that looks like the answer, `found: false`, means the reader found no ENTITIES in text it read perfectly well, which is a MEANING-level absence; using it would file every document that mentions nobody as a document with no text. **DEBT ROW D-375**, closed by one field CAPTURE persists at acquire exactly as CAP-9 persisted `page_count`. (2) **"One row per tier" and "the frontier is the latest row per subject" conflict unless the rows are CUMULATIVE.** A mixed document read whole by two tiers would otherwise leave `partial` as its latest row and the frontier would say the record got part of a document it got all of. Each row therefore states the capture's state AFTER that attempt and names its own tier in `detail`. The section should say so. (3) **A SCOPED chain covers the whole document only if the document's page count is known**, which is CAP-9 / D-345's field; in its absence the answer is `partial` with the undetermination STATED, never a coverage claim off a page set nobody counted.
- §4.2 / §4.3 — **the per-capture `indexed` state is only half answerable until REC-91 lands.** §4.2 says the state is *"this row read through the index's own predicate"*, and the index is `capture_text` (`CONTENT-SEARCH-DESIGN.md` §4.1), which does not exist. Two of §4.4's four states ARE answerable from the observation alone and are answered; the middle two need the unit index, and the read returns a FIFTH value — undetermined, stated, naming what it waits on — rather than collapsing them into *none*. The design should say which of its states are claims about EXTRACTION and which about the INDEX, because they are not the same axis and this item had to separate them to answer honestly.
- §6 row 1 — **the frontier read's withholding is applied at the CONTENT level and NOT at the document level.** §6 says *a subject discloses a project's interest, so REC-36's withholding applies row-whole across the fence*. REC-94 measured `Store#frontier` accepting a `viewer` and never reading it, so the document arm applies no fence today while the content arm does. Recorded in IC-95 and delegated; the design is right and the landing is one arm short of it.
- §4.5 — the internet level's authored writer (a member's lead, D-194) is Program B's design; only the column is here.
- §6 — the member-facing frontier surface is Program B's; this document names what it reads and not what it looks like.
- §7 — **DISCHARGED 2026-09-14 by REC-93 as M-14.** The sweep-volume measurement was named and not taken; it is now taken over COFF-6's census corpus (43,283 keys, anonymous `ListObjectsV2`, no credential and no body downloaded) and **it CONFIRMS the edge-triggered rule**: the naive rule writes 43,283 rows/day (15,798,295 a year) and the edge rule writes **15.14 rows/day** over the 2,859-day span — a **2,859x** reduction, 0.0350% of the naive volume — with a **2,713-row busiest day** that is what the table is actually sized on. The figure is a FLOOR and is labelled as one: `LastModified` keeps only the latest write per key, deletions are invisible to a listing, and a byte-identical rewrite still moves the timestamp. Instrument: `tools/measure-office-corpus.py sweepvolume`.
- §3 vs §4.4 — **A CONFLICT FOUND BY BUILDING IT (REC-93), and neither section is wrong on its own.** §3 writes `subject TEXT NOT NULL` and refuses `PRESENT` with no `result_ref`; §4.4 requires every `ai_run_log` row to fold in and read back UNCHANGED. `ai_run_log` permits a NULL subject and HAS NO `result_ref` column, so both rules would force the fold to invent facts about rows already written. The landing resolved it conservatively and said so at every site: `subject` is nullable in SQL with the requirement enforced in code; `subject_kind` gains a sixth value `unstated` (not in §3's list) which says the kind was never recorded rather than deriving one from the level; and C-22.10 does not fire on `authority_kind = run`, which is DEBT ROW D-366 and closes when REC-95's writers carry referents. **§3's column list and §4.4's fold need reconciling in the document, and that is the design's to do rather than the landing's.**
- §4.4 — it names `actor` as *"the run's credential"*; `ai_runs` has no `credential` column, and the machine identity it actually carries is `principal_claude`. REC-93 writes that and states the substitution at the site.

**Contents**
- [1. What an observation is, and what it is not](#1-what-an-observation-is-and-what-it-is-not)
- [2. What exists today, and what each is](#2-what-exists-today-and-what-each-is)
- [3. The one table](#3-the-one-table)
- [4. The writers, in build order](#4-the-writers-in-build-order)
  - [4.1 The document level](#41-the-document-level)
  - [4.2 The content level — the content-axis frontier](#42-the-content-level-the-content-axis-frontier)
  - [4.3 The meaning level](#43-the-meaning-level)
  - [4.4 The run's log folds in](#44-the-runs-log-folds-in)
  - [4.5 The internet level](#45-the-internet-level)
  - [4.6 What is never written — stated as a provisional, with its cost](#46-what-is-never-written-stated-as-a-provisional-with-its-cost)
- [5. The frontier is a view over the log](#5-the-frontier-is-a-view-over-the-log)
  - [5.1 What a missing row means, in order — and it is not one thing](#51-what-a-missing-row-means-in-order-and-it-is-not-one-thing)
- [6. The readers](#6-the-readers)
- [7. Lifecycle, purge and growth](#7-lifecycle-purge-and-growth)
- [8. The decomposition](#8-the-decomposition)
- [9. Negative controls the discipline demands](#9-negative-controls-the-discipline-demands)

---

## 1. What an observation is, and what it is not

An observation is an append-only EVENT ABOUT LOOKING: we fetched and it was unchanged; we fetched and it had changed; we looked and it was gone; we looked and could not tell; we extracted and got half; we read the text and found no reference; we searched for a thing a member named and found nothing. It is separate from the record because the record is write-once and content-addressed and never evicts, and folding a failed look into it makes every failed look either a phantom capture or nothing at all (`STORE-AS-CACHE.md`). It is what lets absence be RECORDED rather than retried away, at the cost of one row and zero record bytes — the WARC `revisit` economy.

It is not: a transcript (DEC-61 — those are device-local and never in the store); a measurement of the runtime (`runtime_observations` measures what WE cost, and stays where it is); a capture (a look that produced bytes points at the capture and is not one); a member's browsing (§4.6).

Three rules it inherits from the run log it generalises, each already a refusal in code:

- **Absence uses D-129's vocabulary, widened by `partial`**: `NEVER_LOOKED` (no row, **and read under §5.1's order rather than inferred from the emptiness itself** — this design said for one day that the absence of an observation states itself, which is an inference rule turning *I see nothing* into a definite value, the defect CONDUCT #11 found in the queue's own falsification clause on 2026-09-15 and I had written one section over) · `LOOKED_ABSENT` · `LOOKED_INDETERMINATE` · `PARTIAL` · `PRESENT`. Which absence is a stated fact, never a diagnostic detail.
- **"Source unreachable" and "our governor held us" are different facts** (D-104): `governed = 1` on a row is a fact about us, and a definitive state on a governed row is refused (C-22.2's rule, generalised).
- **A client-rendered shell is `LOOKED_INDETERMINATE`, never `PRESENT`** (D-64): an evidentially empty capture that reads as coverage is the false-coverage hazard again.

## 2. What exists today, and what each is

| thing | what it records | what it is in this design |
| --- | --- | --- |
| `ai_run_log` (`run, seq, at, level, subject, state, governed, condition, bound, terminal, detail`) | where one investigative run searched across the four levels and where it stopped; append-only; never in `bundle.md` (C-22.6) | the precedent and the first consumer; folds in (§4.4) |
| `captured_locators.observations` (a counter) plus `first_retrieved`/`last_retrieved` | how many times an address was fetched and resolved to a capture | a CACHE of the log's document level — kept, re-derivable |
| ratify's re-fetch outcome (`confirmed` · … · `not_attempted`) | whether reused bytes re-fetched identical at ratification | a document-level observation with `authority = ratify` |
| the `deferred` link partition (`subresources.mjs`) | URLs discovered inside documents and not fetched | the DERIVED frontier — a subject with `NEVER_LOOKED` state and `authority = link` |
| a reading's `found: false` | the reader ran and found nothing | the RESULT is on the reading; the LOOK is not recorded anywhere — §4.3 |
| the condition vocabulary (`queuestate.mjs`: `source-unreachable-governed`, `client-rendered-shell`, `runtime-ceiling-reached`, …) | why a look ended as it did | the `condition` column's values; no new vocabulary |
| `heldMatch`'s discipline | *not found* and *did not finish looking* are different facts | the `bound` and `terminal` columns |

The content and meaning levels record NOTHING about looking today (Part II §17's OBSERVE row: ABSENT at content grain; BUILT for one consumer at meaning grain). The content-axis states Part II §14.3 names — not extracted · partial · extracted · unextractable — are stored nowhere; a reading's basis string and a `tier3_candidate` flag are the only trace.

## 3. The one table

`observation_log` — the run log's columns, generalised; one shape for every level, because a log per
level is the D-164 failure (built three times, drifts) arriving in the coverage record.

**The name is `observation_log` and not `observations`, decided 2026-09-14 after CONDUCT measured the
neighbourhood.** Two things in the schema already carry the bare word — `runtime_observations` (what
the runtime was observed to COST, which is a fact about us) and `captured_locators.observations` (a
COUNTER of fetches per address) — and a third named `observations` would put one word on three
unrelated things, which is how a reader infers a relationship that is not there. The suffix is not
invented either: `ai_run_log` is the table this one generalises (§4.4), so `observation_log` is the
existing convention rather than a new one.

    seq            INTEGER PRIMARY KEY  -- monotonic, store-wide; never reused
    at             TEXT NOT NULL
    actor_class    TEXT NOT NULL        -- plane | machine | member
    actor          TEXT                 -- a machine credential or a member id; NULL for the plane's own scheduler
    authority_kind TEXT NOT NULL        -- run | sweep | link | ratify | acquire | extract | derive | lead | objective
    authority      TEXT                 -- the run id, the sweep's request id, the document the link came from, the lead id …
    level          TEXT NOT NULL        -- internet | document | content | meaning
    subject_kind   TEXT NOT NULL        -- address | capture | extent | entity | description
    subject        TEXT NOT NULL        -- the address (normalised), the capture_sha, the canonical extent, the entity id, or a member's words
    state          TEXT NOT NULL        -- LOOKED_ABSENT | LOOKED_INDETERMINATE | PARTIAL | PRESENT   (NEVER_LOOKED is never STORED; it is read by §5.1's order)
    governed       INTEGER NOT NULL DEFAULT 0
    condition      TEXT                 -- queuestate.mjs's vocabulary
    bound          TEXT                 -- which bound stopped it, if one did
    terminal       INTEGER NOT NULL DEFAULT 0
    result_kind    TEXT                 -- capture | content | entity | reading   (what the look produced, if anything)
    result_ref     TEXT                 -- the capture_sha, content_id, entity id …  — THE BACK-REFERENCE
    detail         TEXT                 -- `unchanged` | `changed` | the reason | the reader's name …

Indexes: `(level, subject_kind, subject, seq)` for the frontier view (§5); `(authority_kind, authority, seq)` for the run's read-through; `(level, state, seq)` for the tallies.

Rules, each a refusal in the catalogue and a control in the suite:

- **Append-only, never updated** — a resumed run reads its own log and continues; a log that can be rewritten is not evidence of anything (C-22's class).
- **Never written into `bundle.md`** — the log's whole value is the failure path, and `bundle.md` is written only on success (C-22.6 generalised to the one append site).
- **`authority_kind` is never NULL** — a look the record cannot say WHY it made is not recorded (§4.6). RFC 2308's rule as `STORE-AS-CACHE.md` carries it: a negative answer with no authority behind it is not recordable.
- **`PRESENT` with no `result_ref` is refused** — the WARC lesson: a revisit that omits what it refers to silently loses which URL the bytes came from.
- **A definitive state on a governed row is refused** (C-22.2).
- **A client-rendered shell never reads `PRESENT`** (C-22's shell rule).
- **The state column is not a SQL enum** — the refusal lives in code where it can name the legal values and the reason, as `airun.mjs` does today.

## 4. The writers, in build order

`STORE-AS-CACHE.md`'s order stands: observations first, because it is small, it makes absence recordable, and every other layer writes to it.

### 4.1 The document level

| site | what it writes |
| --- | --- |
| `op=acquire` (a new address, or a monitored one) | `PRESENT` + `result_ref = capture_sha`, `detail = new` · `PRESENT` + the existing sha, `detail = unchanged` (the zero-payload revisit) · `PRESENT` + the new sha, `detail = changed` · `LOOKED_ABSENT` (gone, with the status) · `LOOKED_INDETERMINATE` + `condition` (unreachable, envelope, shell) · `governed = 1` when our pacing held us (D-104) |
| the monitor's sweep (`SCHEDULER.md`) | the same vocabulary, `authority_kind = sweep`, `authority` = the named request or ratified sweep |
| ratify's re-fetch of reused parts | `authority_kind = ratify`; `confirmed` → `PRESENT unchanged`; `changed` → `PRESENT changed`; `unreachable` → `LOOKED_INDETERMINATE`; `not_attempted` → no row, because a look not taken is `NEVER_LOOKED` and the budget that stopped it is recorded on the ratification, where it already is |
| the archive fallback (`ARCHIVE-FALLBACK.md`) | `subject_kind = address`, `via` in `detail`, so an archive capture and a direct capture of one address are two observations of one subject |

`captured_locators.observations` keeps counting; it is a cache of this level and may be re-derived from it. The `last_verified` field `STORE-AS-CACHE.md` says HTTP obsoleted and we must own lives on the frontier view (§5), not here — it is the latest `PRESENT` row's `at`.

### 4.2 The content level — the content-axis frontier

This is the enumeration Part II §16's closing table calls ABSENT: *documents held but unextracted, or extracted below what is now available*. One row per extraction attempt per capture per tier:

| outcome | state | detail |
| --- | --- | --- |
| text produced over the whole document | `PRESENT`, `result_kind = reading` | the tier and the chain's last step |
| text produced over part (tier 1 partial, pages below the floor discarded, over the per-capture index bound) | `PARTIAL` | which pages, or the bound |
| no text possible (no text layer and no OCR member bound; encrypted; over the 20 MiB office bound) | `LOOKED_INDETERMINATE` | the reason, from the condition vocabulary |
| the document has no text (a scan, and tier 3 read nothing above the floor) | `LOOKED_ABSENT` | — |
| read-time re-extraction to tier 3 (`EXTRACTION-BREADTH-DESIGN.md` §5.1) | a NEW row under `authority_kind = extract`, `actor` the member who asked | the new chain's last step |

The `indexed` state `CONTENT-SEARCH-DESIGN.md` §4.3 needs — `full` · `partial` · `none (reason)` — is this row read through the index's own predicate: a capture whose latest content-level row is `PRESENT` and whose units were all written is `full`; over the bound is `partial`; a container with no unit arm is `none` with the reason. One vocabulary, one table.

The frontier read at this level — *every capture whose latest content-level state is below what the fleet can now do* (a `tier3_candidate`; a chain whose engine is older than its calibration) — is the candidate list for re-extraction, and it is what makes D-319's opt-in re-read a choice a member can make from a list rather than a fact they must remember.

### 4.3 The meaning level

Where today `found: false` sits on the reading and the LOOK is unrecorded: one row per reader run per capture (`PRESENT` with the reference count in `detail`, or `LOOKED_ABSENT` when the reader ran and found none — and those are different from *no reader is registered for this type*, which is `LOOKED_INDETERMINATE` with the condition); one row per resolution attempt over an entity; one row per connection derivation. So *nothing has been derived — which may only mean nothing was extracted* (Part II §14.3) becomes a query rather than a caveat.

### 4.4 The run's log folds in

`ai_run_log`'s rows are rows of this table with `authority_kind = run`, `authority = <run>`, `actor_class = machine`, `actor` = the run's credential; `seq` is store-wide rather than per run, and the run's own ordering is the `seq` order within its authority. `op=airunlog` reads through the `(authority_kind, authority, seq)` index and answers in its existing envelope (IC-24's bound), so I3 does not change shape. C-22.1, C-22.2 and C-22.6 move to the general append site. Whether the old table is dropped or kept as a view is the landing's call; two writers is not.

### 4.5 The internet level

The look that produced nothing we hold: an acquisition attempt for an address the record has no capture of (`subject_kind = address`, `LOOKED_ABSENT` / `LOOKED_INDETERMINATE`), the investigative run's open-internet searches (already the run log's `internet` level), and — Program B — a member's LEAD: `authority_kind = lead`, `subject_kind = description`, the member's words as the subject, the outcome as the state. D-194's whole argument is that the lead is the AUTHORITY that makes *we looked and there is none* a finding with a name behind it; the column is here so the writer can arrive without a schema change.

### 4.6 What is never written — stated as a provisional, with its cost

**A member's ad hoc search, view or read is not an observation.** A look is recorded when it carries an authority the record can name — a run, a sweep, a link, a lead, an objective, a ratification, an acquire — and never because a person typed a query.

*Why it is doctrine-adjacent.* The record would otherwise hold what its members looked for, and the record is what a legal process can reach (`BIO_Membership_Architecture_v2.md` §Residual risk says as much of the cover-to-handle table). *Provisional.* Not logged, by DEC-61's analogy: transcripts are internal notes and never in the record store; a member's search is the same kind of thing. *Alternative.* Log member searches as observations with `authority_kind = member`, so a member's own search history backs their completeness statement. *Recommendation.* The provisional; a member who wants a search on the record states it as a LEAD, which is the authored act D-194 designs and the one that carries a name by choice. *What reversing costs.* Nothing in either direction at the schema (the column takes the value); everything in one direction at the record — rows written cannot be unwritten, so the conservative provisional is the one that stays reversible.

## 5. The frontier is a view over the log

`STORE-AS-CACHE.md`: *the observation log and the frontier are the same table seen from two angles.* A frontier entry is a subject together with its current state and the observation that last set it; the four-state model is its state column. So the frontier at any level is the latest row per `(level, subject_kind, subject)` — a view, not a table — and:

### 5.1 What a missing row means, in order — and it is not one thing

**A subject with no row has three possible causes and they are different facts**, so the frontier reads them in this order rather than concluding the first: (1) **the log did not yet exist for that subject** — every capture, reading and resolution the record held before this table landed was looked at by someone, and none of them has a row; a capture whose `first_retrieved` predates the log's first row was FETCHED and the look is recorded in `captured_locators`, not here, and the frontier says so rather than calling it never-looked. (2) **the subject was looked at and the row was purged** — a whole-store purge clears this table (§7), so an instance that purged has no rows and has not thereby become one that never looked. (3) **nobody looked** — which is the honest answer only when the record holds NOTHING ELSE about the subject: no capture, no reading, no counter. Where (1) or (2) cannot be excluded the frontier reads **UNDETERMINED and says which of the three it could not rule out**, because that is what this whole document exists to make possible; treating the empty set as a positive finding is the costs-nothing rule inverted — an absence that took no work to produce, reported as a fact about the world.

This is the one place the design had the defect it was written to prevent, and it is corrected here rather than left for a builder to hit: the writer stores four states and **never stores `NEVER_LOOKED`**, and the reader derives it under this order.

- `NEVER_LOOKED` is a subject with no row AND nothing else in the record, per §5.1: the `deferred` link partition supplies those subjects at the document level (with `authority_kind = link` and the document they came from as the authority), and the content and meaning levels supply theirs from the captures and readings that exist without a corresponding look;
- `last_verified` is the latest `PRESENT` row's `at`; *source unreachable since* is the earliest `LOOKED_INDETERMINATE` after it;
- `surfaced_by` (`agent` / `human`, the field the deferred partition already carries) maps onto `actor_class`;
- a PLAN PROPOSAL (`STORE-AS-CACHE.md`, "The genuinely new capability") is derived FROM the view and is never itself an observation — it is a proposal awaiting an authored act (D-82, D-90).

## 6. The readers

| reader | what it answers | shape |
| --- | --- | --- |
| the frontier read, per level | *what have we looked for at this level, and what came of it* — the candidate list for FETCH / EXTRACT / DERIVE | envelope-bounded (REC-57); a subject discloses a project's interest, so REC-36's withholding applies row-whole across the fence |
| the per-capture content-axis state | `CONTENT-SEARCH-DESIGN.md` §4.4's tally | a fixed-key read per capture, and an aggregate over a bundle set for the search envelope |
| the run's log | unchanged, through `op=airunlog` | §4.4 |
| **the completeness statement's `searched` section** (D-196) | at case signing: which levels were searched for the case's subjects, under which authorities, with which outcomes and where each stopped — computed from the log, published with the case, the first thing behind a completeness claim that is not prose | an addition to the case document's completeness block (C-41.10); the format `bio-case-document/1` is signed, so the addition is an IC on I3 and a format minor |
| the member-facing surface | what the group has looked for and what it found, by level; where a lead stands | Program B — not rowed here |

## 7. Lifecycle, purge and growth

- **Purge of a bundle leaves its observations.** They are the coverage record, not derived from the bundle; a `result_ref` to a purged capture is annotated at read time (`purged`), never rewritten. A whole-store purge (scope ALL) clears the table — D-113's rule applies to it as to every table.
- **Growth is bounded by an edge-triggered rule, not by retention.** A monitor sweeping the census corpus daily would otherwise write one row per asset per day (43,282 rows a day over the city census; ~16 million a year), which is the WARC revisit economy done wrong. So: **first looks and transitions are logged; a steady-state revisit that finds the subject `PRESENT` and `unchanged` updates the frontier's cache (`captured_locators.last_retrieved`, `observations + 1`) and writes no row.** A change, a disappearance, an indeterminate, a governed hold, or a first look each writes one. The number that confirms this is the sweep-volume measurement (Incomplete sections), owed before the sweep writer lands.
- **Nothing is ever deleted from the log** except by whole-store purge; the edge rule is what keeps that affordable.

## 8. The decomposition

Four items now, in dependency order, handed through the BOB INBOX (CONDUCT mints the ids). The surface is Program B's and the lead is piece 5's.

| # | owner | item | depends on | interface | design |
| --- | --- | --- | --- | --- | --- |
| 1 | RECORD | **the table, the refusals, the frontier view, the document-level writers, the run-log fold** — `observation_log` before `host_governor`, purge both arms, hygiene; C-22.1/22.2/22.6 at the one append site; the writers at acquire, the sweep (edge-triggered per §7, with the volume measurement recorded first), ratify and the archive fallback; the frontier view and its bounded read at the document level; `ai_run_log` folded, `op=airunlog` reading through unchanged; the negative controls | — | I5 (additive, an IC); I3 unchanged in shape and recorded as such | §3, §4.1, §4.4, §5, §7 |
| 2 | RECORD | **the content-level writers and the content-axis frontier** — one row per extraction attempt per capture per tier at promote and at read-time re-extraction; the per-capture `indexed` state read; the bounded frontier read at content level (`tier3_candidate`, chain older than calibration) | item 1; pairs with `CONTENT-SEARCH-DESIGN.md` item 4 (one vocabulary) and `EXTRACTION-BREADTH-DESIGN.md` item 5 | I3 (the two reads, additive, an IC) | §4.2 |
| 3 | RECORD | **the meaning-level writers** — the reader run, the resolution attempt, the connection derivation | item 1 | — | §4.3 |
| 4 | RECORD | **the completeness statement's `searched` section** (D-196) — computed from the log at case signing over the case's subjects; published with the case; C-41.10's block gains it; the negative control (a case whose subjects were never looked for at the content level says so in the signed document) | items 1–3 | I3 (`bio-case-document/1` → an additive minor, an IC) | §6 |

## 9. Negative controls the discipline demands

- an acquire that returns the same bytes writes `PRESENT unchanged` with the existing sha as `result_ref`; drop the back-reference and the append is refused;
- a governed hold writes `governed = 1` and any definitive state on it is refused;
- a client-rendered shell capture writes `LOOKED_INDETERMINATE`; forcing `PRESENT` is refused by name;
- a row with no `authority_kind` is refused; a member's `op=search` writes nothing (the row count is unchanged after any search);
- the frontier view's `NEVER_LOOKED` set for a document with three deferred links has three subjects; fetch one and it has two;
- **a capture the record held BEFORE the log's first row does not read `NEVER_LOOKED`** — it reads UNDETERMINED naming the pre-log cause, with `captured_locators` as the evidence it was fetched; break §5.1's order and the arm fails on the oldest capture in the fixture;
- a steady-state sweep over N unchanged assets writes zero rows and increments N counters; change one asset and it writes one row;
- `op=airunlog` answers byte-identically before and after the fold for a run written before it;
- a case signed with the `searched` section carries the log's outcomes; alter the log after signing and the signed section does not move.
