<!-- DRAFT for BOB, uncommitted. Written 2026-10-10 by a worker for BOB #151 from build/plan/next.md as it stood at T42's opening (the entries since moved to archive/next-applied.md). Each requirements file named was read whole; each code site cited was read. Ids are the next free ones in the files as committed at 84668c0914. Wording is BOB's to settle. -->

# T42 requirement text: draft

Layers are from `build/modules.json`. "Mark" means `*(not yet met: T42)*` at the end of the line.

---

## N831 · credentials `accountUsesOf`, ai-use re-points

**credentials** (L2). New line after R61:

> - **R62** (T42; N831; K2442, K2480) `accountUsesOf({owner})` is an in-plane read. No route reaches it and it takes no viewer. It answers one account's uses exactly as R60 answers them to that account's owners: `{owner, held, uses}`, plus `accounts` for `member:<id>`, and no `keptAway`. `owner` is spelled as in R55. An `owner` not spelled that way is answered `held: false, uses: null`. When the account cannot be read, it answers `held: null, uses: null, unreadable: true` and never a default value (fail closed: no switch reads as on). It never carries a key or a digest of one, writes nothing and never throws. It is the read an in-plane caller uses for an account it does not own (`ai-use` R3, R6, R9). Such a caller never asks `accountUses` as an owner it is not. *(not yet met: T42)*

**ai-use** (L6). Append to R3's `explore` bullet, after "(A5, B6; K2400).":

> (T42; N831) The owner's `explore` value is read through `credentials.accountUsesOf` (its R62), with no viewer. It reads as `no` when the account is not held, cannot be read, or holds a value other than `no`, `ask` or `yes` (fail closed). It is never read through `accountUses` asked as one of the account's owners. *(not yet met: T42)*

Replace the `credentials` line in Uses with:

> - `credentials`: `USE_KINDS` (its R55), the project account's owner refusals (its R54), `aiKeptAway` and `projectsKeptAway` (its R57), the owner's `explore` value through `accountUsesOf` (its R62; R3, R6, R9; T42), and `accountUses`'s owners and refusals (its R60; R12).

**Tests.**
- credentials `t42.test.mjs`:
  - R62's answer equals R60's to an owner, for `group`, `project:<id>` and `member:<id>`.
  - It answers without a viewer, including for a project whose only owners the founder cannot see.
  - A malformed owner gives `held: false`.
  - A broken store gives `unreadable: true` with no default.
  - No key or digest appears in the answer (sentinel).
  - No route serves it: the ops map has no `accountusesof`.
- ai-use `explore.test.mjs`:
  - `explore: "yes"` on the group with no active administrator is not refused `EXPLORE_NOT_ENABLED`. Negative control: `no` is refused.
  - A project account whose owner list is empty is judged on its stored value.
  - An unreadable read is answered as `no`.

**Users.** None outside the two modules. `ai-use` R12 (`aiLimits`) keeps `accountUses` with the real viewer.

**Doubt.** `question-explorer` (L6, `#switchedOff`) and `ai-runs` (L6, the dispatch's `suggestions`) also call `accountUses`. They do so as `member:<id>` asking about its own account, which R60 allows, so they need no change. My reading: leave both as they are.

---

## N830 · retrieval: a decoration on the search page

**retrieval** (L5). New line after R56, under its heading:

> - **R78** (T42; N830; K2480; as R56) `registerSearchDecoration(module, fn)` adds keys to the hits of a `search` answer in `page` mode (R6). For each hit, the hit gains the keys the registered `fn(hits, {viewer})` answers for it. `fn` answers synchronously with an array holding one object, or null, per hit, in the page's order. Each module registers once, and decorations apply in the modules' total order (R83). A module's second registration is refused `DECORATION_DECLARED`, and a malformed one `DECORATION_MALFORMED` (R56's codes). A decoration never adds, removes or reorders a hit, and never replaces a key R6 answers: such a key is ignored. It never changes `total`, `facets`, `widen`, or an `ids` or `count` answer. A `fn` that throws, or answers a promise or any other shape, adds nothing to any hit, and the answer is as it would be without it. With nothing registered the answer is R6's, byte for byte. `search` stays synchronous. *(not yet met: T42)*

Also add "and R78's" to R58's list of ops (`retrievalRoutes`). This is wording only, since R78 adds no op.

**inquiry** (L6). Replace R60 with:

> - **R60** (H38) Every read that answers a question to a member answers `projects`, `leg-earning` R14's answer for that viewer. These reads are the question's document, this module's own reads of a question with a viewer, and (T42; N830) the question's row in a `search` page, through `retrieval` R78, which this module registers with at start. `stepsOn`'s header is `steps` R4's share (K2472). *(not yet met: T42)*

**Tests.**
- retrieval `decoration.test.mjs`:
  - R78's refusals.
  - Keys added on page hits only. `ids`, `count` and `total` are unchanged.
  - A decoration naming `bundle_id` or `title` is ignored.
  - A throwing `fn` or a promise leaves the answer byte-identical to the answer with nothing registered.
  - Two modules apply in order.
- inquiry `projects.test.mjs`:
  - A question found by `search` carries `projects` for the viewer. A hidden project is never named.
  - A non-inquiry hit carries no `projects`.
  - An unreadable R14 gives `projects: null` with `projects_undetermined`.

**Users.** `plane` (L11): `wiring.mjs`:231 reads `search` synchronously and only reads `object_type`, so no change is needed.

**Doubt.** R56 calls its `fn` once per row and may answer a promise. R78 is batched and synchronous, so `search` stays synchronous and the page costs one call, not 200. My reading: batched is right. inquiry's `fn` loops over its own `projectsOf`.

---

## N835 · reading-pipeline: the paying owner's spelling

**reading-pipeline** (L4). Tests only. The requirement stands: R29, unchanged. R29 already requires the act "on the paying account and within its limits". `member:member:<id>` fails `ai-use`'s owner grammar (`parseOwner` answers null), so a member's own account is never judged and the act is refused. This is a defect against R29 as it stands, not new meaning. The owner is built from the bare id: `member:<id>`, whether `member` was handed bare or stamped.

**Tests.** reading-pipeline `transcribe.test.mjs`. With `member` given as `member:<id>` and with a bare `<id>`, each served by the member's own account:
- `useCheck` is asked with `owner: "member:<id>"`.
- The transcription goes ahead.
- Negative control: a limit reached on `member:<id>` refuses.

**Users.** None. R29 has no caller until N832.

---

## N834 · `onMachinePassage`: a machine's passage cited as hers only once she accepts it

**inquiry** (L6). New line R62, after R61:

> - **R62** (T42; N834; `run-productions` R22; K2496, K31) `onMachinePassage(module, fn)` registers the read that says whether a member may cite as hers a passage a machine proposed. One module registers it (`run-productions`, its R25). A malformed registration is refused through `membership`'s `listenerRefusal` (its R81: `LISTENER_MALFORMED`), and a second, by any module, `LISTENER_DECLARED` naming the holder.
>
> R11's check of a promotion of an inquiry whose author is not a machine calls `fn({legs, author, viewer})` once. `legs` is each leg the revision adds or changes against the held document, each `{ord, target, content_id?, extent_capture?, extent_*?}`; a leg unchanged is never asked. `fn` answers synchronously with `null`, meaning each leg may stand as hers, or with a refusal. A refusal refuses the promotion unchanged and nothing is written. A `fn` that throws, or answers anything else, refuses it `MACHINE_PASSAGE_UNCHECKED` (C-2.20, the next free number of this module's C-2 family) (fail closed). With nothing registered, no leg is refused by this rule.
>
> `machinePassageUnchecked(detail, extra?)`, exported and pure, is that refusal's one spelling (K231): `basis-versions` R49 answers through it. *(not yet met: T42)*

**basis-versions** (L6). New line R49, after R48:

> - **R49** (T42; N834; K2496) `onMachinePassage(module, fn)` is a slot like `inquiry` R62's, with one registration (`run-productions` R25's) and R40's refusals. R6's check of a promotion whose author is not a machine calls `fn({legs, author, viewer})` once, over:
>   - each leg of a version the revision adds, `narrow`'s version included (R27). A version already held is frozen (R29) and is never asked;
>   - at `versionAccept` of a version a machine authored, that version's legs, with the accepting member as `author`.
>
> A refusal from `fn` refuses the act unchanged and nothing is written. A `fn` that throws or answers anything else is refused through `inquiry.machinePassageUnchecked` (its R62). A machine's own `suggested` version (R28; `run-productions` R4) is never asked. With nothing registered, no leg is refused by this rule. *(not yet met: T42)*

Add to Uses, under `inquiry`: "`machinePassageUnchecked` (its R62; R49)".

**run-productions** (L6). New line R25, after R24:

> - **R25** (T42; N834; R22; K2496, K31) At start this module registers one read with `inquiry.onMachinePassage` (its R62) and with `basis-versions.onMachinePassage` (its R49). Given `{legs, author, viewer}`, the read judges each leg whose content row is one a run proposed (R11). That content row is the one the leg names, or the one its part resolves to. Such a leg stands as `author`'s only when `acceptedFor` (R22) answers `accepted: true` for that proposal and that member: her own acceptance, not another member's. Any other such leg is refused `PROPOSAL_NOT_TAKEN_UP` (C-104.32, the next free number of C-104). The refusal names each leg and its proposal, with R22's act as the remedy. A leg resting on nothing a run proposed stands. When the acceptance cannot be read, the leg is refused (fail closed). The read is synchronous, writes nothing and never throws. *(not yet met: T42)*

Update the Suggestions line "Registrations filled": `basis-versions`' R25 (R14), and R62 and R49 (R25).

**citation** (L6). No new line, and no seam. Recommended: `cite` writes a leg onto an inquiry only through `inquiry`'s promotion check (its R11), and that check asks R62. A `cites` edge on a project is not a leg. Extend R1's relayed list instead: "A refusal from the write (`inquiry` R11: `BASIS_REFUSED`, `SELF_BASIS`, `BASIS_CYCLE`; (T42) `inquiry` R62's and `run-productions` R25's `PROPOSAL_NOT_TAKEN_UP`, `MACHINE_PASSAGE_UNCHECKED`) is answered unchanged, with the handle and drift." *(not yet met: T42)*

If BOB keeps a citation seam as the entry words it, use the next free id, R14, with inquiry R62's text and `cite`'s legs before the write. That checks the same thing twice.

**Tests.**
- inquiry, new `machine-passage.test.mjs`:
  - R62's refusals.
  - A member's leg on a machine-proposed passage not taken up is refused, and nothing is written. Negative control: after her `proposalAccept` it lands.
  - Another member's acceptance does not count.
  - An unchanged held leg is not asked.
  - A throwing `fn` gives `MACHINE_PASSAGE_UNCHECKED`.
  - With nothing registered, the leg lands.
- basis-versions `registration.test.mjs`:
  - The same cases for a new version's legs and for `narrow`.
  - `versionAccept` of a machine's version citing a passage nobody took up is refused.
  - `appendVersion` by a machine is not asked.
- run-productions `reading.test.mjs`:
  - R25's verdicts.
  - Fail closed.
- citation `cite-write.test.mjs`: `cite` relays the refusal.

**Users.** `plane` (L11) needs nothing, because run-productions registers itself in its factory, as R14 does. promotion (L2) stamps C-2.20 and C-104.32.

**Doubts.**
1. A proposed connection (`proposed_connections`, R21) is not a connection of the record until taken up, so no leg can name one. R25 therefore judges passages only. My reading: the "or connection" in run-productions R22 is met by R22's own act.
2. Asking at `versionAccept` of a machine's version is my reading of "cited as hers only then". It is not named in the entry.
3. Whether the content row a leg's part resolves to is known at R11's check time (before R12 mints) is the job's to confirm at START.

---

## N837 · inquiry names `personFacts`

**inquiry** (L6). New line R63, after R59, under its heading:

> - **R63** (T42; N837; K2526; R59's read) `personFacts({text, subject?, viewer})` answers the record's facts for the persons `text` and `subject` may name, for `personWarning` (R59), as `intent` R32, `hypotheses` R19 and `investigation` R22 read them.
>   - The persons considered are: the subject entity; every `ENT-` id written in `text`; and every entity of kind person whose live alias, read through `entities.entitiesByAlias` (its R6) as `viewer`, is a run of `text`'s words. A run is at most 8 words (`PERSON_NAME_WORDS_MAX`), over its first 120 words (`PERSON_TEXT_WORDS_MAX`).
>   - Each person the record holds is answered as `{entity_id, kind: "person", label, public_role, named: true}`, by id, each once. `public_role` is true exactly when `lines` holds, not withdrawn, a line of `PUBLIC_ROLE_LINES` from the person: `holds`, `responsible_for` or `acts_for` to an `office`, or `belongs_to` or `seat_on` to a `body` of sector `government`.
>   - An id the record does not hold, or one that is not a person, is left out.
>   - A read that fails leaves what was found standing.
>   - It writes nothing and never throws. *(not yet met: T42)*

**Tests.** inquiry `person-warning.test.mjs`:
- Each source of a person (subject, `ENT-` id, alias run).
- `public_role` for each line kind, a withdrawn line, and a non-government body.
- An alias past word 120 is not read.
- An entity that is not a person is left out.

**Users.** `intent` (L7), `hypotheses` (L6) and `investigation` (L7) read it already. No change.

**Doubt.** R59 names only `holds` to an office and `seat_on`/`belongs_to` to a government body, while the code (`PUBLIC_ROLE_LINES`) also counts `responsible_for` and `acts_for`. R63 states the code's set, which R59's "an office it holds, is responsible for or speaks for" already allows. My reading: wording only.

---

## N843 · each later module re-codes its distinct condition

Recommended: re-code in place, keeping each row's number. The rows are unstamped T41 rows awaiting T42's stamp, and K238 (and credentials R51's C-29.32) re-key a code with "its number unmoved". If BOB prefers new rows, the next free numbers are: C-134.29 and .30, C-142.32, C-146.29 and .30. In that case the old numbers are retired and never reused.

| module (layer) | row | was | becomes | why distinct |
|---|---|---|---|---|
| hypotheses (L6) | C-134.22 | `PROPOSAL_NO_RUN` (action-plans' C-124.47) | `HYPOTHESIS_PROPOSAL_NO_RUN` | a hypothesis proposal with no run, not an option's |
| hypotheses (L6) | C-134.23 | `NO_SUCH_PROPOSAL` (intent's C-111.22) | `NO_SUCH_HYPOTHESIS_PROPOSAL` | hypotheses' own proposals |
| steps (L6) | C-142.28 | `NO_SUCH_PROPOSAL` | `NO_SUCH_STEP_PROPOSAL` | a proposed step |
| investigation (L7) | C-146.21 | `NO_SUCH_PROPOSAL` | `NO_SUCH_PLANNING_PROPOSAL` | a planning proposal (`NO_SUCH_PLAN_PROPOSAL` is action-plans' C-124) |
| investigation (L7) | C-146.26 | `NARRATIVE_NOT_A_LEG` (hypotheses' C-134.28) | `INTERVIEW_NOT_A_LEG` | an interview, not a shared note; hypotheses keeps C-134.28 |

Translations unchanged.

**hypotheses.** New line R22, under Invariants:

> - **R22** (T42; N843; K231, K275, K2566) This module's codes name its own conditions. A proposal of the system's with no run (R16) is refused `HYPOTHESIS_PROPOSAL_NO_RUN` (C-134.22), and a proposal absent or unseen at R17's or R18's act is refused `NO_SUCH_HYPOTHESIS_PROPOSAL` (C-134.23). Each row keeps its number and translation. It never answers `PROPOSAL_NO_RUN` (action-plans') or `NO_SUCH_PROPOSAL` (intent's). *(not yet met: T42)*

**steps.** New line R28, under Invariants:

> - **R28** (T42; N843; K231, K2566) R24's `stepAccept` refuses a proposed step that is absent or unseen with `NO_SUCH_STEP_PROPOSAL` (C-142.28, its number and translation unchanged), and never with `NO_SUCH_PROPOSAL` (intent's). *(not yet met: T42)*

**investigation.** Replace in R12 "(a check registered with `promotion` refuses it, `NARRATIVE_NOT_A_LEG`)" with "(a check registered with `promotion` refuses it, `INTERVIEW_NOT_A_LEG`, C-146.26; T42, N843: hypotheses' `NARRATIVE_NOT_A_LEG` names a shared note)". Mark the line. New line R23, under Invariants:

> - **R23** (T42; N843; K231, K2566) R20's `planAccept` refuses a planning proposal that is absent or unseen with `NO_SUCH_PLANNING_PROPOSAL` (C-146.21, its number and translation unchanged), and never with `NO_SUCH_PROPOSAL` (intent's). *(not yet met: T42)*

**answer-envelope** (L11). Tests only; the requirement stands: R7 and R10. The pins return to green by themselves: `PROPOSAL_NO_RUN` and `NO_SUCH_PROPOSAL` decorate from action-plans and intent again.
- In `rows-before-r43.json`, `changed.note`, drop the "not re-pinned … until N843" sentence.
- In `families.test.mjs`, `HELD_EARLIER` loses the three N843 rows (C-142.28, C-146.21, C-146.26).
- `catalogue-end.test.mjs` passes unchanged.

**Tests.**
- hypotheses `t41.test.mjs`, steps `proposals.test.mjs`, investigation `plan.test.mjs` and `interview.test.mjs`: the new code, check and words on each refusal. Negative control: the old code is not answered.
- answer-envelope: `catalogue-end.test.mjs` and `families.test.mjs` green.

**Users.** promotion (L2) stamps the three families' re-keyed rows. answer-envelope (L11) changes its snapshot note and `HELD_EARLIER`. `docs/development/ux-substrate/ux-substrate-v2.json` names these codes: the UX stream's file, to tell.

**Doubt.** `families.test.mjs`' `HELD_EARLIER` also lists steps' C-142.3 `NO_SUCH_BUNDLE` (held by hypotheses' C-134.1) and investigation's C-146.10 `NO_SUCH_QUESTION` (held by citation). These are outside N843.
- `NO_SUCH_BUNDLE` is the same condition everywhere (K275: the earliest module holds it), so steps' row should retire.
- `NO_SUCH_QUESTION` in investigation means "not drawn on by this project", arguably a distinct condition.

My reading: leave both to a later entry. They do not break the pins.

---

## N845 · question-explorer migrates at creation

**question-explorer** (L6). New line R15, after R14:

> - **R15** (T42; N845; K2571) `questionExplorerOf(host, deps?)` answers one instance per host with its tables already created: it runs its `migrate()` before declaring them to purge, as `publish-schedule`'s factory does. A host that builds it and never calls `migrate()` therefore reads, ticks and purges without error. `migrate()` stays callable and idempotent. *(not yet met: T42)*

**Tests.** question-explorer `module.test.mjs`:
- A fresh host built through the factory alone: `exploreDue` and a `record-core` purge run with no `no such table`.
- Calling `migrate()` twice changes nothing.

**Users.**
- `plane` (L11): R30's explicit migration may stay. It is now redundant but harmless.
- `scheduler` (L10): no change.

---

## N846 · investigation `watchArrival` atomicity, and every watched source

**investigation** (L7). Append to R18:

> (T42; N846; K2572)
> - `watchArrival` never throws for an arrival it has recorded. Once the arrival is written it answers `ok: true` with each of its reads (`quiet`, `standing`, `milestones`) as read after the write. A read that fails is answered `{unread: <why>}` in its place.
> - A refusal, or a failure before the write, records nothing.
> - `watchedProjects()` answers each watched project with every source `intent` R7 names for it, following R7's `cursor` to its end, never its first page alone. A project whose sources cannot be read whole is answered `watch: null` with `watch_unread` naming why, never a partial set as whole. *(not yet met: T42)*

**Tests.** investigation `quiet.test.mjs`:
- A stub whose `projectStanding` throws: the arrival is recorded, and the answer is `ok` with `standing: {unread}`. Negative control: an unwatched project writes nothing.
- An `intent` stub answering two pages of captures: `watchedProjects` carries both.
- A stub failing on page 2 gives `watch: null`.

**Users.** `monitoring` (L10) R70 reads both. Its tests may assume the first page or a throw; check them at its START, with no change of meaning.

**Doubt.** The entry offers two fixes. I chose "recorded, reads marked unread". Computing the reads before the write would answer the pre-arrival `quiet: true`, which changes what the answer says.

---

## N848 · ai-use drops `ai_ceilings` after the carry

**ai-use** (L6). Append to R2's last bullet ("The migration writes today's ceilings …"):

> (T42; N848; K2592) Once carried, `ai_ceilings` is dropped in the same migration, as R1's pre-T40 counter table is, so a migrated store holds no table a fresh one lacks. A store whose carry already ran but which still holds the table drops it at its next migration. Idempotent. *(not yet met: T42)*

**Tests.**
- ai-use `limits.test.mjs`:
  - A store holding `ai_ceilings` migrates: the limits are carried and the table is gone.
  - A store with the `ceilings` marker and the table: the table is dropped and nothing is carried twice.
  - A second `migrate()` is a no-op.
- `test/system/migrate-released.test.mjs`: the `ai_ceilings` arm is green (clears T41 rule 4 (24)).

**Users.** None. No other module names the table.

---

## N841 · conformance efficiency

**conformance** (L9).

(1) This is wording only and needs nothing from Bob. No requirement states whether `determine` or `comparisonPropose` answers synchronously. No module calls either in process; only this module's ops map does, and its route relays the answer. The refusals can be asked first and answered synchronously before any measure is read. The act stays synchronous without measures, as now, so it need not become a Promise in every case. Either form keeps every answer's meaning.

New line R30, after R29:

> - **R30** (T42; N841; K2558) `determine` and `comparisonPropose` ask every refusal that needs no measure before reading any R29 measure, so a refused act reads no calculation. For `determine` these are R1's `MACHINE_CANNOT_DETERMINE`, `NO_SUCH_PROJECT` and `DETERMINATION_NOT_A_PARTICIPANT`, and R18's size cap. For a comparison they are `NO_SUCH_PROJECT` and the cap. The refusals and their order are otherwise unchanged. *(not yet met: T42)*

(2) Append to R11:

> (T42; N841) A page's reads do not grow with its items. The page's supersessions, standards and findings are each read once per page, and an `ACT-` id's event (`events.eventForAct`, R26) once per distinct id, never once per item. The answer is unchanged. *(not yet met: T42)*

**Tests.** conformance `determine.test.mjs`:
- A machine author, and an unseen project, with a measure row: `calculations.read` is never called (counting stub), and the refusal is as before.

conformance `reads.test.mjs`:
- A page of 200: `eventForAct` is called once per distinct `ACT-` id.
- The `determination_*` statements are a fixed count per page (a wrapped `sql.exec`).
- The answer is byte-identical to the per-item read.

**Users.** `consequences`, `actions` and `escalation` (L9) read R11. Their answer is unchanged. `control-plane` (L11) relays the op. No change.
