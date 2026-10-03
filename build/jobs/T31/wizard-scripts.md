# wizard-scripts (T31)

**Status** · session_015rXhvVXUnRr73rAvgxK4WZ · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two points need you; my best readings follow, and I carry on with them.

**Q1 (decides one test, R5).** R5 labels a proposal `proposalLabel(proposer, "wizard")` (record-grammar R42), but record-grammar's `PROPOSAL_STATES` has no `wizard` subject: the call throws `RangeError`. record-grammar is not in T31 and I may not write it. Reading: I call `proposalLabel(p, "wizard")` exactly as R5 says, so R5's label test stays red until record-grammar gains the subject (one frozen table, three sentences, worded as `template`'s for a wizard script's steps). Please either add a record-grammar entry now (a small CHANGE to a record-grammar job, or your own fold), or rule an interim.

**Q2 (paths).** `paths`: `bio-plane/src/wizard-scripts/`; `tests`: `bio-plane/test/m/wizard-scripts/`. The Civicsmith library's data file (your path at the opening, not in START): reading `bio-plane/src/wizard-scripts/civicsmith-library.mjs`, exporting `CIVICSMITH_LIBRARY`, a frozen empty list (an .mjs so it bundles without a JSON import), entries `{id, name, required, version, steps, approved: {by, at}}`; `plane` passes it to `wizardRegister`.

Readings (settled unless you say otherwise):
1. R12's `{template}` check: `checkScript` stays pure and takes an optional `templateOffered(ref)` predicate in its options; the module's own submit, approve, registration and `op=wizardcheck` pass one built from `filing-templates.offeredVersion` with the actor's viewer (registration: the version author's). Without it a `{template}` is judged by shape only. `offered` is the offered scripts' step lists, for `WIZARD_DUPLICATE`.
2. A step's `what` or `why` left empty (a recorded step not yet revised) is R12's `WIZARD_STEP_NO_WHY`; R4 and R5 refuse `WIZARD_STEP_REFUSED` only on shape (types, lengths over 300, a malformed draft), so a draft may be saved part-written.
3. R3 `from` an approved (or `updated`) version makes a new draft version of that same script; a `civicsmith` script answers `WIZARD_NOT_THE_GROUPS` (after `NO_SUCH_WIZARD`, R9's "R3 included"), and a retired script `WIZARD_ALREADY_ENDED`. `from` a draft, submitted or withdrawn version is `NO_SUCH_WIZARD`. A proposal for a script makes a new version of it; one for a project a new script there (it needs `name`).
4. R4's allowed pairs without a grant: the multiset union (max counts) of the recorded pairs, the `from` source's pairs, and every adopted proposal's pairs.
5. A widened (`group`) script's next version is approved, and retired, by an administrator (R17's reading, as filing-templates widens); drafted still by a joined participant of its project.
6. New codes, each a C-131 row: `WIZARD_PROGRESS_REFUSED` (R15: an event other than start, step or finish, so `abandon` is refused; a step outside the version); `WIZARD_USE_REFUSED` (R15, R16: visible, but the viewer is not a project owner, the version's author or, for a script with no project, an administrator); `WIZARD_EDITOR_MEMBER_UNKNOWN` and `WIZARD_NO_SUCH_GRANT` (R8); `WIZARDS_STATE_REFUSED` (R10, an unknown `state`). A second live grant to one member answers `existed: true` with the first.
7. R10 `wizards` lists only scripts whose project the viewer owns, and every script to an administrator (a Civicsmith script to administrators); others get an empty list. `wizardRead` answers any visible version (R20).
8. R11 answers `{ok: true, screen, scripts}`; "answers `[]`" is `scripts: []`.
9. R15 `wizardProgress` carries no viewer (R15 keeps none); it counts for any held version (a Civicsmith one included, and an author's own draft run), `NO_SUCH_WIZARD` otherwise.
10. R16 `wizardCandidates`: at most 20 step drops (script, version, step, screen, act, reached, next, drop; summed over days) among the scripts the viewer may see, and at most 20 (op, code) pairs by count.
11. R13 runs the break check for the offered version of each group script; a Civicsmith script is judged only by R14 (release).

## J2 · REPORT

Another module, found at my start (not mine to change): `membership` R83's test (`bio-plane/test/m/membership/module-order.test.mjs`) fails on `tranche/T31`: `MODULE_ORDER` (`membership/index.mjs`:170) lacks `wizard-scripts`, which `modules.json` now lists between `scheduler` and `affordances`. Membership is not in T31; it needs one line added (as for link-sweep, attestation, docket at T24, T25, T27). My module registers no listener, so nothing of mine reads it.

## J3 · REPORT

B3 applied. One reading for queue-producers (please forward, P9): in both brokenScripts and submittedFor entries, `version` is the version NUMBER (an integer), so its keys `<script>@<version>` are built from `script` and `version` as R32 and R33 write them; `author` is the version author's member id; `refusal.translation` is the row's (R32 names a withdrawal's refusal by it). One more for R17/R33: a retired script's submitted versions are not listed (R33's item leaves when its script is retired). Also R7 (my reading, stated in my record): since only a version's author revises it (R4), a member contributes by a proposal the author adopts or drafts from; a member's adopted proposal counts as that member's contribution for APPROVER_IS_AUTHOR, a machine's as a run.

## J4 · COMPLETE

**Completion.** N528 applied: `wizard-scripts`, a new module, R1–R20, at `bio-plane/src/wizard-scripts/` (`index.mjs`, `checks.mjs`, `schema.mjs`, `civicsmith-library.mjs`), tests at `bio-plane/test/m/wizard-scripts/` (6 test files, fixture). B3 (K1397) applied: `brokenScripts` and `submittedFor` answer `{ok, entries, cursor, truncated}` in its entry shapes; factory `wizardScriptsOf(host, deps)`. BOB writes `paths` and `tests` into `modules.json` before the merge (K1396).

**What it provides.** `wizardRegister`, `registeredScreens`, `brokenScripts`, `wizardDraft`, `wizardRevise`, `wizardPropose`, `wizardSubmit`, `wizardApprove`, `wizardEditorGrant`, `wizardEditorRevoke`, `wizardRetire`, `wizards`, `wizardRead`, `wizardsAt`, `wizardCheck`, `wizardProgress`, `wizardUse`, `tallyRefusal`, `wizardCandidates`, `submittedFor` on the instance; pure `checkScript`, `requiredFailures`, `canonicalSteps`, `stepsSha`, `normaliseRegistration`; `wizardScriptsOps(m, url, body)` with ops `wizarddraft`, `wizardrevise`, `wizardpropose`, `wizardsubmit`, `wizardapprove`, `wizardeditorgrant`, `wizardeditorrevoke`, `wizardretire`, `wizards`, `wizardread`, `wizardsat`, `wizardcheck`, `wizardprogress`, `wizarduse`, `wizardcandidates` (stamps `author`, `viewer` from the query); `WIZARD_SCRIPTS_CHECKS` (C-131.1–C-131.32), `WIZARD_SCRIPTS_TABLES`, `CIVICSMITH_LIBRARY`, `wizardScriptsOwns`. Tables `wiz_*` (10), declared to purge; mint seed WIZ, WZP, WEG.

**Readings beyond J1 (K1396 settled 1–11):**
- R7: only a version's author revises it (R4), so another member contributes by a proposal the author adopts (or drafts from): a member's adopted proposal is listed as that member's contribution (`kind: "member"`, with `proposal`), a machine's as a run; `APPROVER_IS_AUTHOR` reads members. (J3)
- R15 (refines reading 9): `wizardProgress` takes an optional stamped `viewer`, asked only whether it may see the script (R20) and never kept; with none it counts for any held version.
- R17: a retired script's submitted versions are not listed. In both queue reads `version` is the number and `author` the member id (J3).
- R3: a recording and a `from` together are `WIZARD_STEP_REFUSED`; a malformed recorded step (no screen) is `WIZARD_STEP_REFUSED` naming it, after the values check. A script holds at most 200 steps (`STEPS_MAX`).
- R16: `wizardCandidates` is answered to administrators and to owners of a project that holds a script (membership offers no "owns any project" read).
- `NOT_A_DRAFT`, `NOT_AN_APPROVER`, `APPROVER_IS_AUTHOR` are also filing-templates' codes: this module answers its own C-131 rows; control-plane's composed catalogue keeps the first source's (filing-templates', C-125) for `dec49Row`.

**Deferred:** none. Size: 1,584 source lines (estimate 900–1,300), 1,114 test lines.

**Found in other modules (reported, not mine):**
- record-grammar: no `wizard` subject in `PROPOSAL_STATES` (J1 Q1): R5's label test red, accepted by name until N543 (K1396).
- membership: `MODULE_ORDER` lacks `wizard-scripts`, R83's test red, accepted until N544 (J2, K1396).
- control-plane: `CHECK_FAMILY_FILES` must gain `src/wizard-scripts/checks.mjs` (its R41, a T31 entry); its families test's totality arm will name the file once `modules.json` carries my paths.
- queue-producers: the entry readings in J3.

**Tests and checks** (modules.json patched locally with my paths for the checks, not committed):
- `node --test bio-plane/test/m/wizard-scripts/`: 35 tests, 34 pass, 1 fail: "R5 a proposal is labelled proposalLabel(proposer, "wizard")" (RangeError from record-grammar; accepted red, K1396).
- `node --test bio-plane/test/m/filing-templates/` (a provider): 47 pass, 0 fail. `bio-plane/test/m/control-plane/families.test.mjs`: 9 pass, 0 fail. No layer tests named in the manifest.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs . wizard-scripts`: 11 product files, 29 relative imports, 0 failures. `checks/coverage.mjs . wizard-scripts`: 20 of 20 live ids named, 0 failures. `checks/ownership.mjs . wizard-scripts tranche/T31`: 12 files, 0 failures. (Without the paths in `modules.json`, coverage and ownership fail on the empty paths alone.)

Size (session_015rXhvVXUnRr73rAvgxK4WZ): test runs 17, module lines 1584
