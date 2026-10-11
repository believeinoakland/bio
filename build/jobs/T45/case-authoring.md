# case-authoring (T45)

**Status** · session_01GDnDMjDLXJXoDemp1UPqER · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Two readings, carrying on with both; neither stops the job.

(1) R72's row. I answer COUNSEL_MATTER_NOT_PUBLISHED with publication R78's row read through publication's existing export `CASE_SOURCES_CHECKS` (from `publication/index.mjs`; its C-122 family), key `COUNSEL_MATTER_NOT_PUBLISHED`, holding no copy. My R72 test asserts check and translation equal that row, so it is red until PUBLICATION #29 merges the row under that export. Best reading: that is the export name; please confirm with publication's job, or tell me the name it uses. Behaviour otherwise passes (publishing project and a member's committing project, `record.bundleInfo().project`, each asked of `project-roster.projectScope`; R2 and R4 first; pre-flight `first`; scope-none and `own` controls).

(2) R57's withheld count. case-grammar R20's `timeline:` block has no field for the we_did lane's `withheld` count, and the block is case-grammar's. My reading: the count is written in the body's timeline section (my renderer: "N of the group's own act(s) were not marked public … and are left out of this published record of what we did."), and answered by publishCase as `timeline: {we_did, withheld}`; no front-matter field. If BOB wants it in the signed front matter, that is a case-grammar R20 field (owed to that module), and I would write it through case-grammar's renderer once it exists.

## J2 · REPORT

Progress, pushed on job/T45/case-authoring: R70 (registerOpenRequests, openRequestsOn) and R34's sign-step open_requests, R57 (audience "public", public:true only, withheld counted; K2830's reading), R72 (red only for publication R78's row until PUBLICATION merges), R65's T45 tail tested, and R71's service: carryOutcome, withdrawCarriedOutcome, carriedOutcomesOf, two append-only tables declared to purge, six new rows C-136.3–C-136.8 in PUBLISH_ACT_CHECKS (the module's existing family; translations my drafts, BOB's to re-word), pending read from ratified signed documents, and the pending outcomes listed in the pre-flight's step 1. Module checks: format, architecture, coverage (54/54), ownership all 0 failures.

Left: writing the pending outcomes into the document (case-grammar R29's outcomesLines/outcomesOf, and its body section) and judging them (case-account R6's `outcomes`), which need CASE-GRAMMAR #14 and CASE-ACCOUNT #2 merged. Until then a local reader of the `outcomes:` rows stands in for outcomesOf, replaced by the import at the merge. I wait for your CHANGE announcing those merges; meanwhile I fix flaws in my own tests.

## J3 · COMPLETE

COMPLETE, on job/T45/case-authoring (merged tranche/T45 through B4: case-grammar, publication, case-account).

**Entries applied (T45-21):**
- **R70.**
  - `registerOpenRequests` takes `(source)` or `(module, source)`. A second registration is refused `PROVIDER_DECLARED`, one without the door `PROVIDER_MALFORMED`, and neither registers anything.
  - `openRequestsSource` reports whether a source is registered, and by whom.
  - `openRequestsOn` is synchronous. It answers `[]` with no source. A source that throws, or answers anything but R70's rows, reads `undetermined`. A promise counts as not a list.
- **R34.** The sign step (step 8) gains `open_requests`.
  - It holds one fact line per row, in the source's order, keyed `signing.openrequest.line` or `.noreply`, each with one plain sentence until the UX stream gives words. An unreadable source gives one sentence keyed `.unread`. When op=publish refuses before the case is known, it says "not reached".
  - It is read once, from the case and pins the rolled-back run resolved, and the viewer is the act's.
  - It is never a blocker and never `first`, and never changes `ready`. It is never written into the document.
  - Control: the pre-flight is byte-equal, but for `open_requests`, to the same act with no source.
- **R57.** `events.timeline` is asked with `audience: "public"`. Only `we_did` items marked `public: true` are written. Any other item is counted in `withheld` and never written.
  - The body states the count.
  - `publishCase` answers `timeline: {we_did, withheld}`, as K2830 rules. There is no front-matter field.
- **R72.** `COUNSEL_MATTER_NOT_PUBLISHED`, publication's C-122.8, is read through `CASE_SOURCES_CHECKS`, with no copy held here.
  - It is asked after R2 and R4, before any write or id.
  - It covers the publishing project and each member's committing project (`record.bundleInfo().project`), through `project-roster.projectScope`.
  - The pre-flight answers it as `first`.
  - Controls: scope `none`, `own`, and no record at all each prepare.
- **R71.**
  - **Services:** `carryOutcome`, `withdrawCarriedOutcome` and `carriedOutcomesOf`, the last fenced as R19's member door (the dead answer otherwise).
  - **Tables:** `carried_outcomes` and `carried_outcome_withdrawals`, append-only and declared whole to purge.
  - **Ids:** opaque, prefix `OUTC`, minted through `mintOpaqueId`, as R39's `WCD` is.
  - **Pending:** an outcome is pending until a ratified, signed document's `outcomes:` block holds it, read with case-grammar's `outcomesOf`.
  - **Into the document:** every pending, unwithdrawn outcome is written with `outcomesLines` and `outcomesSectionLines`. The section sits after the account and before the tensions.
  - **Judgment:** each outcome is judged through case-account R6's `outcomes` as `kind: outcome`, and a refusal names the outcome.
  - **Pre-flight:** step 1 lists the outcomes.
  - **Kinds:** `OUTCOME_KINDS` is case-grammar's, re-exported.
- **R65 tail.** A body field naming outcomes is `CASE_FIELD_NOT_ALLOWED`. This was already true by construction, and is now tested.
- **Satisfies.** Already in the requirements file. No requirements file was edited by me.

**New rows, BOB's to word.** R71's six codes are C-136.3–C-136.8 in `PUBLISH_ACT_CHECKS`, this module's existing family: `MACHINE_CANNOT_CARRY_OUTCOME`, `CARRY_NOT_A_PARTICIPANT`, `BAD_CARRIED_OUTCOME`, `NO_SUCH_CARRIED_OUTCOME`, `CARRIED_OUTCOME_SETTLED` and `CARRY_NO_REASON`.
- The translations are my drafts, for BOB and the UX stream to re-word.
- They await promotion's stamp (rule 4 (2)).
- `NO_SUCH_CASE` stays rowless, as R39's is.

**Readings recorded:**
- **R71's "does not see in full"** is `membership.sight(project, member:by) === "full"`.
- **Withdrawal asks no participant fence**, only sight, as R71 lists.
- **"Ratified"** is `case_documents.ratified_at` and `sig_armored` both set.

**Read whole:** my requirements; all my code (index, document, checks, schema, searched); `fixture.mjs` and `timeline.test.mjs`; publication's provider pattern, events' timeline, project-roster's `projectScope`, case-grammar's `outcomes.mjs` and case-account's R5 and R6 code. The reading set was over 600 KB (K2700), so it was read as follows:
- Two helpers read, in full, the public parts of events, case-grammar, case-account, publication, project-roster, membership, ratification and record-core, and wrote a digest citing each id (K2032).
- A third helper read the rest of my tests in full and digested them.
- The sources stay binding.

**Own flaws fixed (P8):**
- In identity R10, a negative control was skipped by `continue` and never ran. It now runs through the pre-flight.
- Fences R2 and R3 now prove by snapshot that no refusal writes. The weak `notDeepEqual` and the dead variables are gone.
- Invariants R28 reads purge's `removed` report rather than an `in` over alternatives.
- Document R15's second case is now checked.
- Pinned lists were updated: R15's answer keys gain `timeline`, R28's tables, and R29's rows.

**Deferred:**
- The remaining digest notes are constant-table tests and white-box argument positions in `disclosures.test`. They are inherited style, not failures.

**Other modules:**
- No defect found against their requirements.
- Generated artifacts: the plane bundle is staled as any merge stales it (rule 4 (5)).
- case-authoring is now 4,072 lines with comments, about 3,200 without (P6, K617; M-T45-6). This is for BOB's size watch.

**Tests and checks:**
- case-authoring: tests 204, pass 204, fail 0. New files are `openrequests`, `counsel` and `outcomes`; `timeline`, `identity`, `fences`, `invariants` and `document` were amended.
- The users' tests:
  - review 46/46 and consequences 41/41, both green.
  - The remaining reds are identical on bare `origin/tranche/T45`, so none is mine: affordances 2, op-declarations 1, answer-envelope 4, control-plane 3, plane 2. These are accepted reds (rule 4 (9), (11), (12)) or tranche-wide.
  - `migrate-released`: 0 fail.
- Checks: format 0 failures; architecture 0 failures (180 imports); coverage 54 of 54 ids; ownership 13 files, 0 failures.

Size (session_01GDnDMjDLXJXoDemp1UPqER): test runs 30, module lines 4072
