# hypotheses (T33)

**Status** · session_016wtrFGMhFT4mUJE4EjCmkP · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings, which I am building on now; please confirm or correct.

1. **R4's scope.** `connection-grammar` R8 and its battery compare an item's `scope` with the `scope` passed to the owner, and `explore`'s walk passes owners `scope.inquiry` (a string). So at the owner, `neighbours`' `scope` is the inquiry's bundle id as a string (`null` outside an exploration); R4's "`scope.inquiry`" is read as explore's `{inquiry}` unwrapped. Each hunch hop carries `scope: <that bundle id>`.

2. **R6's derived ids.** A derived connection id is `connection-grammar.derivedId`'s form (64 lowercase hex). A leg citing one carries its derivation beside the target, `derivation: {kind, from, to, as_of, method}`, which the check hands to `explore.rederive` with the leg's id. A derived-id target with no derivation, or one `rederive` answers `matches: false` or cannot read, is refused inside `BASIS_REFUSED` with its own code `LEG_NOT_REDERIVED` (C-row beside `HYPOTHESIS_NOT_A_LEG` and `LEAD_NOT_A_LEG`), never passed; `declared_or_hunch: true` is `LEAD_NOT_A_LEG` naming the first declared or hunch hop.

3. **R6's calculation arm.** `calculations` R4 admits seven input kinds, none of which is a derived connection, and its reads are async while promotion's check is synchronous. So the arm takes a synchronous provider, `deps.calculationInputs(calcId)` (the plane wires it from `calculations`' stored inputs; absent, the arm asks nothing), and applies R6 to any input that carries a `derivation` (or names a hypothesis id, R5). Today it finds none, since calculations refuses such an input; it guards a later input kind. If you'd rather drop the arm until calculations admits a derived input, say so.

Also: code `bio-plane/src/hypotheses/`, tests `bio-plane/test/m/hypotheses/`; hunch owner name `hypotheses`.

## J2 · REPORT

Found in other modules (nothing of theirs changed by me):

1. **explore R12 (`rederive`)** reads the owners at a derivation's ends with `scope: null`, so a derived connection whose input is a hunch hop never sees that hop (connection-grammar R8 hides hunches outside their inquiry): `rests_on` answers it with `class: null` and `declared_or_hunch: false`. A derived connection resting on a hunch would then pass hypotheses R6 as not a lead. hypotheses applies R6 to whatever `rederive` answers (tested with a stub answering a hunch hop); the gap is explore's: `rederive` could take the leg's inquiry as `scope`, or treat an input it cannot read as undetermined (refused), never as evidentiary.
2. **hypotheses' requirements, R4's wording** "`scope.inquiry`" is explore's `{inquiry}` form; at the owner the scope is the inquiry id string (K1601 (1)). A wording fix at the next fold.
3. **R6's leg form.** The frontmatter grammar holds scalars only in a basis list item, so a document's leg carries its derivation as five flat fields `derivation_kind`, `derivation_from`, `derivation_to`, `derivation_as_of`, `derivation_method`; the object `derivation: {…}` (J1 (2)) is accepted from callers too. `inquiry-grammar` (R4's leg arm) has no arm for a derived-id target or these fields; until it does, such a leg is refused there first (unknown target), and hypotheses' check stands behind it.
