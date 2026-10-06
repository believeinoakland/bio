# hypotheses (T33)

**Status** · session_016wtrFGMhFT4mUJE4EjCmkP · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three readings, which I am building on now; please confirm or correct.

1. **R4's scope.** `connection-grammar` R8 and its battery compare an item's `scope` with the `scope` passed to the owner, and `explore`'s walk passes owners `scope.inquiry` (a string). So at the owner, `neighbours`' `scope` is the inquiry's bundle id as a string (`null` outside an exploration); R4's "`scope.inquiry`" is read as explore's `{inquiry}` unwrapped. Each hunch hop carries `scope: <that bundle id>`.

2. **R6's derived ids.** A derived connection id is `connection-grammar.derivedId`'s form (64 lowercase hex). A leg citing one carries its derivation beside the target, `derivation: {kind, from, to, as_of, method}`, which the check hands to `explore.rederive` with the leg's id. A derived-id target with no derivation, or one `rederive` answers `matches: false` or cannot read, is refused inside `BASIS_REFUSED` with its own code `LEG_NOT_REDERIVED` (C-row beside `HYPOTHESIS_NOT_A_LEG` and `LEAD_NOT_A_LEG`), never passed; `declared_or_hunch: true` is `LEAD_NOT_A_LEG` naming the first declared or hunch hop.

3. **R6's calculation arm.** `calculations` R4 admits seven input kinds, none of which is a derived connection, and its reads are async while promotion's check is synchronous. So the arm takes a synchronous provider, `deps.calculationInputs(calcId)` (the plane wires it from `calculations`' stored inputs; absent, the arm asks nothing), and applies R6 to any input that carries a `derivation` (or names a hypothesis id, R5). Today it finds none, since calculations refuses such an input; it guards a later input kind. If you'd rather drop the arm until calculations admits a derived input, say so.

Also: code `bio-plane/src/hypotheses/`, tests `bio-plane/test/m/hypotheses/`; hunch owner name `hypotheses`.
