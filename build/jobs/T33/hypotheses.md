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

## J3 · COMPLETE

**Entries applied.** T33-46 whole (K1467, K1473, K1487, K1489): R1–R10 met, a new module, with B2 (K1601: scope as the inquiry id string; derived-id legs re-derived through `explore.rederive`, refused `LEG_NOT_REDERIVED` when they cannot be; the calculation arm kept behind the injected synchronous `calculationInputs`, which plane wires none of in T33, tested with a stub).

**Paths and uses (for modules.json).** `paths` `bio-plane/src/hypotheses/`; `tests` `bio-plane/test/m/hypotheses/`. Final `uses`: record-grammar, record-core, membership, promotion, connection-grammar, explore. Dropped: `inquiry` (the inquiry's existence, type and sight are read through record-core's `bundleInfo`, its R34/R37, and membership's `inSight`; nothing of inquiry is imported).

**Shape.** `hypothesesOf(host, deps)`; hold/revise/withdraw/read/hypothesesOf; `neighbours` registered at load into the default registry as owner `hypotheses`, kind `hunch` (class `hunch`, word "a member's hunch"), routed by `host`, else the isolate's one instance, else `OWNER_HOST_AMBIGUOUS`; a hunch is undated, so every hop is undetermined at every date (K1563 (2)); `legRefusals` and the promotion step `hypotheses` (a check, every inquiry promotion, replays included); `hypothesesOps` (`hypothesishold`, `hypothesisrevise`, `hypothesiswithdraw`, `hypotheses` with `id` or `inquiry`). Tables `hypotheses`, `hypothesis_revisions`, declared keyed by `bundle_id`, purge clear, sight bundle, export yes. Readings beyond the text: `revise` of a withdrawn hypothesis is refused `HYPOTHESIS_WITHDRAWN`; a second withdrawal answers the first (`already`); a machine's revise or withdraw is refused `MACHINE_CANNOT_HYPOTHESISE`; `flow` and `other` take `{from, to}` or a list of ids (only `{from, to}` makes a hop).

**Rows awaiting stamp** (new family C-134, the next free after duties' C-133; they enter the row census with the paths above, at the merge), all `awaiting stamp`: C-134.1 NO_SUCH_BUNDLE, C-134.2 NOT_AN_INQUIRY, C-134.3 MACHINE_CANNOT_HYPOTHESISE, C-134.4 UNKNOWN_HYPOTHESIS_KIND, C-134.5 NO_STATEMENT, C-134.6 BAD_ABOUT, C-134.7 NO_REASON, C-134.8 NO_SUCH_HYPOTHESIS, C-134.9 HYPOTHESIS_WITHDRAWN, C-134.10 HYPOTHESIS_NOT_A_LEG, C-134.11 LEAD_NOT_A_LEG, C-134.12 LEG_NOT_REDERIVED. control-plane adds the family to `CHECK_FAMILIES` (its T33-89).

**Deferred.** Nothing of this module's requirements. Wiring is plane's (T33-90): compose `hypothesesOf(host)` at boot so the step registers and the load-time owner finds its instance, and route the four ops.

**Found in other modules.** J2 (explore's `rederive` and hunch inputs; R4's wording; inquiry-grammar's leg arm for derived ids). No generated artifact is staled (no bundle takes hypotheses yet).

**Tests and checks.** `node --test bio-plane/test/m/hypotheses/`: tests 14, pass 14, fail 0, on the real record-core, membership, promotion, connection-grammar (its owner-conformance battery: the only failure the inapplicable `at` check of an undated kind, K1563 (2); R6/R7 tested directly) and explore (`rederive` over stand-in owners). No other module uses hypotheses' services; no layer tests (manifest). With the paths and uses above in a scratch copy of modules.json (not committed): `format: 126 modules, 125 requirements files; 0 failures`; `architecture: 8 product files, 23 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 10 of 10 live requirement ids named by a test; 0 failures`; `ownership: 9 files changed by hypotheses between tranche/T33 and HEAD; 0 failures`.

Size (session_016wtrFGMhFT4mUJE4EjCmkP): test runs 8, module lines 513
