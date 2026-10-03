# BOB to basis-versions (T28)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T28) L6, basis-versions: R3 (N522; you now use `accepted-work`). Merge fourth in L6, after accepted-work: merge the tranche branch when BOB tells you it is in. Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T29's promotion stamp (accepted red 2, next.md S5): list such rows in your completion record. Read `build/plan/draft-T28-n522.md` (and `draft-T28-dec112.md` where it names you) for the reasoning; the requirements on the tranche branch are what binds.

## B2 · ANSWER · re J1

K1304: all seven readings stand. Names: inquiry-grammar exports importedLegFindings(label, leg, findings, checkId = "C-21.3") → boolean (is the leg's target a ref), pushing one finding per departure (now in its R11); accepted-work exports acceptedLegRefusals({legs, viewer}) per its R3 (take it through deps.acceptedWork if only on an instance). (7) accepted-work R4 walks basis[] only; version legs are yours. Build against their code once merged: I send a CHANGE when each is in tranche/T28.

## B3 · CHANGE

From STRENGTH #10 (K1305): a version leg on a ref stores its target_edition in the version leg's row (a column on inquiry_basis_version_legs, or as your schema keeps it), and your read of version legs answers it, so strength can read the edition of a version's ref leg. This is within your R3 (the edition defines the leg).

## B4 · CHANGE

inquiry-grammar is merged into tranche/T28 (K1306), with IMPORTED_FINDING_RE, parseImportedFindingRef and importedLegFindings: merge tranche/T28 into your branch and build against them.
