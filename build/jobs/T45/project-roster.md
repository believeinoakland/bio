# project-roster (T45)

**Status** · session_01JnZy4CSrJYv25f2UVq4NE2 · depth 2 · COMPLETE · handled B3

## Record

**How the reading set was read** (mechanics §17). Read whole by me: `roles/JOB.md`; `build/requirements/project-roster.md` (public and private); the public part of `membership` (Purpose, Provides) and of `jurisdictions` (Purpose, Provides); layer 2's contract in `build/layers.md` and its "No jurisdiction in the product"; the plan's T45 opening rules and L2 entries; `draft-T45-lower.md` §1 and §9–§11; K2781, K2782, K2786; `BIO_Action_v0_2.md` rules 9, 15, 20 and §6. **My own code and tests read whole** (P20, plan rule 2): `index.mjs`, `checks.mjs`, `schema.mjs`, and all eight test files with the fixture. `record-core`'s R21, R25, R34, R37, R46 and `record-grammar`'s R13 read where I use them.

**Entries applied (T45-3):**
- **R21** `projectScopeSet` (`op=projectscopeset`): sight first (C-70.1, the absent answer, `NOT_A_PROJECT`), then membership R55 `joined` asked as `member:<by>` (B2 (b): a machine credential, the founder or an unnamed caller not joined is refused, never passed), then `PROJECT_SCOPE_UNKNOWN`, `NO_REASON` (absent, blank, over 2,000), `PROJECT_SCOPE_NEEDS_HIDDEN`, `PROJECT_SCOPE_OWN_NOT_SOLE` (setting or leaving `own`: an owner, the only participant in any state), `PROJECT_SCOPE_UNCHANGED`. Appends to `project_scopes`; the latest governs. History read in R6's form as `scopes` on `projectParticipants` (B2 (a)).
- **R22** the guard registered at start in membership R128 (`start()` answers `guard`): `PROJECT_SCOPE_OWN` on an invitation to an `own` project; `PROJECT_SCOPE_KEEPS_HIDDEN` on setting a counsel matter or an own project discoverable. R5's rescue of an `own` project refused `PROJECT_SCOPE_OWN` after `NOT_AN_ADMIN` and before the rescue's own refusals, naming only the project's id (it is reachable at an administrator's EXISTENCE); a counsel matter is still rescued.
- **R23** `projectScope(projectId)`: `{scope, since, by}`, `none` for no record or no project; asks no viewer, writes nothing, never throws (tested over an unreadable store).
- **R24** `projectApprovalSet` (`op=projectapprovalset`, `needs` read as JSON): sight, `NOT_THE_OWNER` (administrators and the founder included), `APPROVAL_RULE_INVALID` naming the entry and index, `APPROVAL_KIND_UNKNOWN` against `jurisdictions.combine` over `getSetting("jurisdiction_profiles")`, `NO_REASON`; appended to `project_approval_settings`, history as `approvals` on `projectParticipants`. `secondApprovalNeeded` answers `{needed, matched}`; a tier other than 1, 2 or 3 is undetermined and matches every `{tier}` entry (B2 (c)).
- **R18** both new tables declared through `declarePurge` with the three before; a purge through the real record-core clears them and keeps another project's.
- Rows: family C-147 (B2), `PROJECT_SCOPE_CHECKS` C-147.1–.8, BOB's draft translations, re-wordable by the UX stream; R20 tested over the rows and every new answer.

Not-yet-met marks this job meets: **R18 (T45 clause), R21, R22, R23, R24**, named by `scope-approval.test.mjs` (R20–R24), `figures-purge.test.mjs` (R18) and `ops.test.mjs` (R21, R24 through the ops).

**Flaws found in my own module (P8):** none found in the code read whole. Tests that pinned the old lists (R18's three tables, the ten ops) re-pinned to the amended requirements, none loosened. Deferred: none.

**Other modules (REPORT J2):**
- `plane` `test/m/plane/roster.test.mjs` "R5, R9 (T38-26; N783): project-roster's whole ops map is routed…" pins this module's ten ops; it now sees `projectscopeset` and `projectapprovalset` (red from this merge until plane re-pins; plane R5/R9 unchanged in meaning).
- `op-declarations` (and `store-door`'s `projectId` parameter list, `control-plane`) must declare `projectscopeset` and `projectapprovalset` before they are reachable through the control plane (draft §10 owes them to op-declarations); until then the services are reached in-process only.
- `promotion`: stamp C-147.1–.8 (T45-4's stamp names this module's L2 rows).

**Tests and checks run** (final, on 415e354119, `tranche/T45` merged in after B3):
- `node --test bio-plane/test/m/project-roster/`: tests 38, pass 38, fail 0.
- `node --test bio-plane/test/m/membership/ bio-plane/test/members.test.mjs` (the guard's caller): pass 211, fail 0.
- `node --test bio-plane/test/m/plane/ bio-plane/test/m/affordances/plane.test.mjs bio-plane/test/d526-refusal-order.test.mjs bio-plane/test/m/answer-envelope/ bio-plane/test/m/op-declarations/` (users): pass 390, fail 1 (plane's roster pin, above; 0 fail without my change).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs project-roster`: 12 product files, 0 failures. `checks/coverage.mjs project-roster`: 24 of 24 live ids named, 0 failures. `checks/ownership.mjs project-roster tranche/T45`: 8 files, 0 failures.

Size (session_01JnZy4CSrJYv25f2UVq4NE2): test runs 12, module lines 1180

## J1 · QUESTION

Catalogue family for the new rows (K2480's precedent: BOB names new families). R21, R22 and R24's nine new codes need DEC-49 rows: PROJECT_SCOPE_UNKNOWN, PROJECT_SCOPE_NEEDS_HIDDEN, PROJECT_SCOPE_OWN_NOT_SOLE, PROJECT_SCOPE_UNCHANGED, PROJECT_SCOPE_OWN, PROJECT_SCOPE_KEEPS_HIDDEN, APPROVAL_RULE_INVALID, APPROVAL_KIND_UNKNOWN (and NO_REASON, NOT_THE_OWNER kept bare as R3–R5 answer them today). My best reading: a new family C-147 (the census's highest is C-146), rows C-147.1–.8 in that order, exported from this module's checks.mjs as PROJECT_SCOPE_CHECKS (answer-envelope finds it by suffix, no edit there); translations BOB's draft per draft-T45-lower §10, re-wordable by the UX stream. Other readings I am building on, no answer needed unless you differ: (a) R21/R24's history is read in R6's form, as `scopes` and `approvals` on projectParticipants (R1's readers); (b) R21's participant test asks membership R55 with the identity `member:<by>`, so a machine credential or founder not joined is refused PROJECT_ACT_NOT_A_PARTICIPANT rather than passed unasked; (c) R24's `tier` other than 1, 2 or 3 (absent, null, a string) reads undetermined and matches every {tier} entry; secondApprovalNeeded and projectScope answer the defaults for an unknown project. I carry on with C-147 meanwhile.

## J2 · REPORT

Other modules (also in my record): (1) plane's test/m/plane/roster.test.mjs 'R5, R9 (T38-26; N783): project-roster's whole ops map is routed…' pins my ten ops and now sees projectscopeset and projectapprovalset: red from my merge until plane re-pins it. (2) op-declarations (with store-door's projectId parameter list and control-plane) must declare projectscopeset and projectapprovalset before they are reachable through the control plane (draft-T45-lower §10). (3) promotion's T45-4 stamp: C-147.1–.8.
