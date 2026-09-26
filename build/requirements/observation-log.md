# observation-log — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 5. Code today (measured on `tranche/T3` @ `7d91579`, after membership's early merge; `build/extraction/observation-log.md` has the table): `bio-plane/src/store.mjs` 42579–42690 (the one append site, `#lookAuthority`, `#observe`, `#observationReferent`), 42692–42784 (`#observeExtraction`), 20478–20592 (`#observeIndexed`), 43726–43895 (the meaning-level writers), 42786–42895 (the missing-row rule), 43078–43110, 43172–43187, 43215–43379 and 43966–44002 (the latest-per-subject view, verification, the row-whole fence, the cause set), 22551–22902 (the lead), and the dispatch entries `lead`, `leadlook`, `leadshare`, `leadread` (50331–50349, 50359–50365, 50402–50405). `bio-plane/src/airun.mjs` 106–1404 and 1931–2127 (the vocabulary, the pure judgements every writer uses, `checkObservation`), a file `ai-runs` owns today (map §5.2). `bio-plane/checks/bio-checks.mjs`: the observation rows of `AI_RUN_CHECKS` (C-22.1–C-22.4, C-22.6, C-22.9, C-22.10) and `LEAD_CHECKS` (C-54.2–C-54.10). `schema.mjs` 3182–3261 and 3462–3504: `observation_log`, `leads`, `lead_shares`. `from`: `legacy-store` and `legacy-checks` (K64's pattern); `index.mjs` holds only these ops' routing, gates and stamps, which stay with `control-plane` (K3). Not yet met: R3 (no row), R13 (N39, K71), R20 (D-681), R21 (D-682). Old-plan rows carried to `observation-log`: D-681 and D-682.

**Size (P6).** About 3,120 lines move (about 1,210 without comment-only and blank lines): `store.mjs` 1,233, `airun.mjs` 1,496, `bio-checks.mjs` 266, `schema.mjs` 123. Under 4,000 only because `op=frontier`'s level arms (1,116 lines, map §2) are proposed for `retrieval`. With them here the module would be about 4,230, over the mark at which BOB reports a module: the frontier is a set of reads over the log and other modules' tables, and `retrieval` already uses this module and every table the arms read. The member-knowledge attribution act (MK-7, about 400 lines), filed under this module's name, is `publication`'s (map §5.1).

## Public

### Purpose

The observation log records looking: every time the record looked for something, at which of the four levels (the internet, the documents held, their content, their meaning), under what authority, and what it found, including that it found nothing or could not tell. It is append-only and separate from the record, so an absence is recorded rather than retried away, and a later reader can say which absence is true. This module holds the one append site and its refusals, the vocabulary every writer and reader shares, the writers other modules' events drive, the rules for reading a missing row, the fence that decides which rows a viewer may see, and the member's lead: something a member was told, which is somewhere to look and never evidence.

### Provides

Terms. An **entry** is `{actor_class, actor, authority_kind, authority, level, subject_kind, subject, state, governed, condition, bound, result_kind, result_ref, detail}`; a **row** is an entry with `seq` and `at`. A **definitive** state is `LOOKED_ABSENT` or `PRESENT`. The **condition vocabulary** is the queue's condition kinds (map §5.3). A viewer and every author are the control plane's stamps, read through `membership`. Every refusal carries its `check` and `translation`.

**The vocabulary** (published with a sentence per member)
- **R1** Levels `internet`, `document`, `content`, `meaning`. States `LOOKED_ABSENT`, `LOOKED_INDETERMINATE`, `partial`, `PRESENT`, with `NEVER_LOOKED` named as the state of a subject with no row. Actor classes `plane`, `machine`, `member`. Authority kinds `run`, `sweep`, `link`, `ratify`, `acquire`, `extract`, `derive`, `lead`, `objective`. Subject kinds `address`, `capture`, `extent`, `entity`, `description`, `reference`, `unstated`. The content-axis states (`indexed_full`, `indexed_partial`, `indexed_none`, `not_extracted`, and `undetermined` apart from them), the missing-row causes and the coverage of a row, each with its sentence.

**observe(entry, at?, terminal?) → null or refusal** The one append site.
- **R2** Refusals, in order: C-22.6 (the entry names a bundle to be written into); C-22.9 (an authority kind absent or not in R1); C-22.1 (a state not in R1); C-22.2 (a definitive state on a `governed` entry); C-22.3 (`PRESENT` with the condition `client-rendered-shell`); C-22.10 (`PRESENT` with no `result_ref`, or an `observation` referent that is not an earlier `PRESENT` row of the same authority, the fault named as `not_earlier`, `unresolved`, `other_authority` or `not_present`); C-22.4 (a condition not in the condition vocabulary). A refused entry writes nothing.
- **R3** `NEVER_LOOKED` is refused at the append: it is never stored. *(not yet met: no row; the append accepts it today)*
- **R4** An accepted entry is one row with a store-wide `seq` that only increases and is never reused, and `at` (the writer's instant, else now, to the second). It answers null.

**Writers** Each is registered on an earlier module's event (K31's pattern) or called by a later module; each derives the actor class from the author (a member, a machine identity, else the plane with no actor), never naming a member who did not look.
- **R5** Document level, on `provenance.onReceipt`: a receipt at an address is a `PRESENT` row naming the capture, authority `acquire` for a direct fetch and `link` for another route unless the caller named its own, subject the normalised address, detail new, unchanged or changed with the route.
- **R6** Content level, on `extraction`'s reading notice: one row per tier outcome of the reading (Observation Log §4.2's table), authority `extract` naming the bundle, subject the capture, detail beginning `first extraction;` or `re-extraction;` according to whether an `extract` row for that capture exists. A chain step no rule classifies is returned by name, never counted as nothing. It answers `{written, states, refused, reextraction, unclassified}`.
- **R7** The index, on `extraction`'s index notice: one `derive` row per capture: `PRESENT` when every unit was stored, `partial` with the bound that stopped it, `LOOKED_ABSENT` when there was no text, `LOOKED_INDETERMINATE` with the reason when the container has no unit arm; its referent is the reading, never a content row.
- **R8** Meaning level: per reader run over a capture, `PRESENT` with the reference count, `LOOKED_ABSENT` when it found none, `LOOKED_INDETERMINATE` when no reader is registered for the type; per resolution attempt (`entities.onResolveAttempt`); per connection derivation over an entity, with its count, documents and whether it was truncated (`connections`' notice).

**Reads over the log**
- **R9** `latest(level, {subjectKind, limit})`: the latest row per (level, subject kind, subject), newest first, at most `limit`. `byAuthority(kind, authority, {limit})`: that authority's rows in `seq` order. `firstRowAt(level)`: the earliest `at` at a level, or null.
- **R10** `verification(level, subjectKind, subject)`: `last_verified`, the latest `PRESENT` row's `at`, and `unreachable_since`, the earliest `LOOKED_INDETERMINATE` after it; each null when there is none.
- **R11** `missingCause({hasArtifact, registeredAt, firstRowAt})`: `pre_log` when the level's pre-log artifact exists; `purged` when the level has no row, the subject has no registration instant, or it entered before the first row; `watermark_band` when it entered within the one clock second before the first row's; `never_looked` only when it entered after. `causesNotRuledOut(cause, {evidenceOneSided})` publishes the causes still live: where the evidence is one-sided (a reference, an entity) a missing row leaves all three open.
- **R12** `contentAxisFor(...)`: the content-axis state of one capture from its latest `extract` and `derive` rows and R11's cause, the two axes never merged; a capture with no row is `not_extracted` only under `never_looked`, and `undetermined`, naming the cause, otherwise.

**rowVisible(row, viewer) → boolean; registerAuthority(kind, resolve)** The row-whole fence (Observation Log §6).
- **R13** A credential with no person behind it sees every row; an absent or unrecognised viewer sees none. Otherwise a row is visible only when every bundle it names is visible to the viewer: the bundle holding its `capture` referent; for `ratify`, `link`, `acquire`, `extract` and `derive`, the bundle its authority names, or the bundle holding the capture it names; for `sweep` and `run`, what the resolver registered for that kind answers (`capture-requests`: a request's target and lead inquiry; `ai-runs`: whether the viewer may read the run), else a bundle of that id. A `lead`, an `objective`, any other kind, and a referent no bundle holds withhold the row. A row is withheld whole, never with a column blanked. *(not yet met: N39; the `sweep` and `run` arms read `capture_requests` and `ai_runs` directly)*

**The lead** (`op=lead`, `op=leadshare`, `op=leadlook`, `op=leadread`)
- **R14** `lead({words, locator, author})`: C-54.2 (no author, or a machine identity); C-54.3 (no words); C-54.4 (words or locator over 131,072 bytes, refused, never cut). Success records `LEAD-YYYY-MMDD-<12 hex>` with author, words, locator and instant, writes no observation, and answers `state: NEVER_LOOKED`, `looks: 0`, `evidence: false`.
- **R15** A lead is readable by its author and by a joined or leaving participant of a project its author shared it to, the member asked being the caller's positional identity; being an administrator reaches no lead, and a credential with no member reaches none. Every other caller is answered C-54.5 exactly as for a lead that does not exist.
- **R16** `leadShare({lead, project, sharer, viewer})`: C-54.5; C-54.10 (the sharer is not the author); C-54.9 (not a joined or leaving participant of a project by that id: one answer for absent, invisible and not joined). A share is recorded once; a repeat answers `already: true` with the first sharer and instant.
- **R17** `leadLook({lead, state, resultKind, resultRef, condition, detail, looker, viewer})`: C-54.8 (no looker, or a machine identity); C-54.5; C-54.6 (a state not `LOOKED_ABSENT`, `LOOKED_INDETERMINATE`, `partial` or `PRESENT`; `NEVER_LOOKED` answered with why it is never stored); C-54.7 (a kind without a ref or a ref without a kind; a referent on a state other than `PRESENT` or `partial`; a kind other than `capture` or `content`; a referent not held where the viewer can read it); C-54.4 (detail over the cap); then R2's refusals. Success appends one row (actor the looker, authority `lead` and the lead id, level `internet`, subject kind `description`, subject the lead's words) and answers its `seq`, `at` and a sentence.
- **R18** `leadRead({id, limit, viewer})`: C-54.5; the looks in `seq` order (`limit` 200 by default, at most 2,000, `truncated`), each with its coverage, a referent the viewer can no longer read given as null; `shared_to` (the author sees every share, a participant only the projects they have joined), bounded by the same limit with `shared_to_truncated`; `state`, the latest look's or `NEVER_LOOKED`.
- **R19** `leadReach(viewer)` answers R15 as one predicate over leads, for a read that must gate inside its own statement (the internet frontier).

- **R20** `leadList({limit, viewer})`: every lead this viewer may read (R15), each once with its own latest state, bounded and saying so. *(not yet met: D-681)*
- **R21** `op=leadread` and the internet frontier carry `vocabulary {states, outcomes}` with member-facing words for every state, `partial` included. *(not yet met: D-682)*

## Private

### Uses

- `legacy-checks`: the C-22 and C-54 rows until they move here (R26), `isMachineIdentity`, `stampInstant`.
- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge`.
- `membership`: `membershipOf(ctx)`, `viewerPredicate`, the positional identity, project participation, the bundle redactor.
- `content`: whether a content row is held and visible (R17, R18).
- `entities`: `onResolveAttempt` (R8).
- `provenance`: `onReceipt` (R5); `register` as a stated read contract (R13, R17). *(not declared)*
- `extraction`: the reading and index notices (R6, R7). *(not declared)*
- `connections`: the derivation notice (R8) (K76).

### Invariants

- **R22** The log is append-only: no row is updated, and none is deleted but by the whole-store purge.
- **R23** Nothing in the log is ever written into a bundle (C-22.6), and a per-bundle purge leaves the log as it is (§7); `observation_log` and `leads` carry no `bundle_id` and clear only with the whole store; `lead_shares` carries `bundle_id` and is declared to record-core's purge (K23).
- **R24** A look is recorded only under an authority the record can name; a member's own searching, viewing or reading writes nothing (§4.6).
- **R25** A lead is never evidence: nothing here mints a bundle or a content row, its id has no bundle shape, and the leg grammars refuse it (C-54.1, which stays with them).
- **R26** Each check moves here as an invariant with its test (K6): C-22.1, C-22.2, C-22.3, C-22.4, C-22.6, C-22.9, C-22.10 (split from `AI_RUN_CHECKS` by the first job to move, numbers unchanged) and C-54.2–C-54.10.
- **R27** One judgement, one place: every writer's outcome rule, the content-axis rule and the missing-row rule are the pure functions this module exports, and no caller restates one.
- **R28** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/development/OBSERVATION-LOG-DESIGN.md` §1, §3 (the one table and its rules), §4 (the writers), §5 and §5.1 (the view, a missing row's causes), §6 (the fence, the readers), §7 (purge and growth).
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (the lead), §7 (what it refuses).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3 (D-129's states, the four levels), §18 piece 3.
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (sight).
- `docs/architecture/BIO_Design_Requirements_v2.md`: absence is stated at the level it was found; undetermined is first-class.

### Suggestions

- **Factory.** `observationLogOf(ctx)` answers the one instance per Durable Object storage and reaches `record-core`, `membership` and `content` through theirs (K61); it registers its writers with `provenance`, `extraction`, `entities` and `connections` on the same `ctx`. The lead's op handlers move here (K3).
- **What stays out.** `op=frontier`'s level arms and `op=contentaxis` are `retrieval`'s (K73 for the second; map §2 for the first), reading R9–R13 and R19. The run's log (`#aiRunAppend`, `op=airunlog`), the capture-request drain's looks, the monitor's and ratification's looks are their modules', each calling `observe`. The case's `searched` section is `publication`'s, computed from R9. The MK-7 attribution act is `publication`'s (map §5.1).
- **Growth.** §7's edge rule (a steady-state unchanged revisit writes no row) is the sweeping writer's to keep; this module states it and does not enforce it.
- Tests: each of R2's refusals and each C-54 row gets a negative control; R13 gets an arm per authority kind (an unknown kind is withheld); R11 gets the tie inside one second.

## Open for Bob

1. **After a per-bundle purge, may a member still see that the group once looked at, and held, a document that is now gone?** The design says the log keeps such a row and marks its capture `purged` at read time (§7). The code withholds the row from every member, because nothing can say which project it belonged to, and only the operator's credential sees the marking. *Recommendation:* keep the code's answer. A purge is the group choosing to forget, and a row naming what it held would undo that. Amend §7 to say so.
2. **Should a member's own searches stay out of the log?** §4.6 leaves this provisional: a look is recorded only under a named authority (a run, a sweep, a lead), never because a member typed a query. That keeps what members searched for out of what a legal process can reach, and it means a member's completeness statement cannot cite their own searching. *Recommendation:* confirm the provisional. A member who wants a search on the record writes a lead and records the look.
