# BOB to strength (T28)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T28) L6, strength: R31, R32, R34 (N519; DEC-112 (5) as ruled on 1 October, DEC-119; K1275, K1277) and R33 (N522; you now use `accepted-work`). Merge last in L6, after accepted-work: merge the tranche branch when BOB tells you it is in. Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T29's promotion stamp (accepted red 2, next.md S5): list such rows in your completion record. Read `build/plan/draft-T28-n522.md` (and `draft-T28-dec112.md` where it names you) for the reasoning; the requirements on the tranche branch are what binds.

## B2 · ANSWER · re J1

K1305, all five settled; requirements and modules.json on tranche/T28 (merge it): (1) you use inquiry-grammar (edge + Uses line added); import IMPORTED_FINDING_RE / parseImportedFindingRef from it. (2) Live basis: target_edition from the inquiry's bundle.md basis[ord] via record-core; version legs: basis-versions stores target_edition on the leg row (told). No edition readable: undetermined on every axis, saying why. (3) dep acceptedWork calling accepted-work's finding({ref, edition, viewer}) (its R2 name); visible only when it answers that viewer a finding. (4) Your cautious reading stands as written. (5) Added as your R35 gradingFacts({inquiry, version?, levels, viewer}), in-process, with your leg shape; GRADING_METHOD_VERSION bio-grading/1. Merge last in L6.

## B3 · CHANGE

inquiry-grammar is merged into tranche/T28 (K1306), with IMPORTED_FINDING_RE, parseImportedFindingRef and importedLegFindings: merge tranche/T28 into your branch and build against them.

## B4 · CHANGE

Correction to B2 (3), K1307: accepted-work's read is acceptedFinding({ref, edition, viewer}) (its R2; finding is the name case-import registers, not the read), reached per host as acceptedWorkOf(host, deps).acceptedFinding(...). Its answers: the finding with pair, null, {absent: true} or {unreadable: true}; synchronous.
