# wizard-scripts (T35)

**Status** · session_01F19u4T5HkFviDXS9qe5X7j · depth 2 · WORKING · handled B0

## Completion (WIZARD-SCRIPTS #4)

**Entries applied.** T35-84 (K2021; filing-templates R26). In `src/wizard-scripts/index.mjs`, `#check`'s `templateOffered` now handles a `{template}` ref in two ways:
- A ref beginning with `@` calls `filingTemplates.offeredVersion({name: ref, project?, viewer})`. `project` is the script's own project when the check runs for a script: at submission (R6), at approval (R7) and in the registration's re-check (R13). `op=wizardcheck` checks steps with no script, so it passes no project, and a handle then resolves among the group's and the active profiles' templates, as R26 orders.
- An `<id>@<n>` ref keeps its split into template and version. A bare id asks for the latest approved version, as before.

Before this change, `@records-request` reached `offeredVersion` as template `''` and was refused `TEMPLATE_REF_REFUSED`.

**Tests.** One new test in `checks.test.mjs`, "R12 R2 a {template} draft named @ and a handle … (K2021)". It approves a project template "Records request" in P through filing-templates' own acts, then checks:
- A script of P with `@records-request` submits, is approved and is offered.
- The same ref in a script of Q is refused `WIZARD_DRAFT_REFUSED`, naming step 1.
- With no project, the profile's `@request-under-the-records-act` passes, and P's `@records-request` is refused.
- Malformed and absent handles are refused.
- `<id>@1` passes; `<id>@9` is refused; a group template's `id@version` passes.
- At the next start, the registration's re-check leaves P's script unbroken.

With the source change stashed, this test fails (submission refused `WIZARD_DRAFT_REFUSED`, "no filing template '@records-request' is offered here").

**Deferred.** None.

**Found in another module.** Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` embeds this module's source, so this change makes it stale. BOB regenerates it at L11's close (§14). There is no other finding.

**Tests and checks run.**
- `node --test bio-plane/test/m/wizard-scripts/`: tests 64, pass 64, fail 0 (63 before, plus the new one).
- No provided service changed (its interface and answers are the same), so users' tests were not required. The manifest names no layer tests.
- `checks/format.mjs`: 133 modules, 132 requirements files; 0 failures.
- `checks/architecture.mjs` wizard-scripts: 23 product files, 52 relative imports; 0 failures.
- `checks/coverage.mjs` wizard-scripts: 27 of 27 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs` wizard-scripts tranche/T35: 0 failures (3 files: the source, the test, this record).

Size (session_01F19u4T5HkFviDXS9qe5X7j): test runs 3, module lines 2273
