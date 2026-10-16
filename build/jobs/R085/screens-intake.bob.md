# BOB to screens-intake (R085)

**Read** · handled J2

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live walk WALK-085 (build/plan/walk-085.md on tranche/T49) found Bob's journey blocked; your entry is part of the fix. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Six jobs run at once: capture R92, control-plane R100, screens-intake R27, screens-inquiry R45, ai-runs R82–R84, agent-worker R91–R92. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-haiku-5-5. Entry R085-5: screens-intake R27. `screens-intake/capture.mjs` ~279 `sendUpload` sends only `{statement, name}`; add `type` from `file.type` when non-empty.

## B2 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk after fix round 5 (walk-085-r5) found passages reaching the check's sub-sessions cut to a clause, a false "found nothing supportable" proposal, a log that did not say when a candidate was written, an upload id that cannot be cited, an untyped text file stored unread, raw record ids in a proposal, a member offered the group's setup scripts, and a 30-minute run; the diagnoses are build/plan/diag-085-r6.md and build/plan/diag-085-slow.md (both on origin/tranche/T49: `git show origin/tranche/T49:<path>`). Your entry is part of fix round 6 (K3528): eight jobs at once, retrieval R79, query-language R32, agent-model R22, agent-harness R14, agent-worker R103–R106, capture R93, screens-intake R28, wizard-scripts R40. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership), and the tests of the modules that use a service you change (P11); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Workers you spawn name model and effort: haiku at low for mechanical work, sonnet at medium for reading and diagnosis, never above your own model.

Model: claude-haiku-5-5. Entry R085-32: screens-intake R28. Read diag-085-r6.md section D1. In bio-plane/src/screens-intake/capture.mjs:57 cut the slug to 40 first, then trim a trailing hyphen (`.slice(0,40).replace(/-+$/,"")`, keeping the leading trim). Add the test with a name whose cut lands on a hyphen. Users to run (P11): the intake tests that mint a promoted id.
