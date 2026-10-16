# BOB to wizard-scripts (R085)

**Read** · handled J1

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk after fix round 5 (walk-085-r5) found passages reaching the check's sub-sessions cut to a clause, a false "found nothing supportable" proposal, a log that did not say when a candidate was written, an upload id that cannot be cited, an untyped text file stored unread, raw record ids in a proposal, a member offered the group's setup scripts, and a 30-minute run; the diagnoses are build/plan/diag-085-r6.md and build/plan/diag-085-slow.md (both on origin/tranche/T49: `git show origin/tranche/T49:<path>`). Your entry is part of fix round 6 (K3528): eight jobs at once, retrieval R79, query-language R32, agent-model R22, agent-harness R14, agent-worker R103–R106, capture R93, screens-intake R28, wizard-scripts R40. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership), and the tests of the modules that use a service you change (P11); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Workers you spawn name model and effort: haiku at low for mechanical work, sonnet at medium for reading and diagnosis, never above your own model.

Model: claude-sonnet-5-5. Entry R085-33: wizard-scripts R40. Read diag-085-r6.md section D9 (first bullet). In `startFrom` and `#offeredScripts` (bio-plane/src/wizard-scripts/index.mjs ~766-779, ~1380) offer a script whose acts are an administrator's only to a viewer who holds the `administer` capability (`isAdministrator`, membership R64/R92); read the act's capability from the registry, hand-list no act. Users to run (P11): screens-daily's Home tests that draw the doors, and screens-wizards' tests (REPORT any that fail; do not edit them).
