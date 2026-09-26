# T2 · id-spaces — job record

Session: `session_01JxBcyrvDmhXth7LevtRM2H` (ID-SPACES #1)

**Status** · WORKING, 2026-09-26. Job for module `id-spaces`, tranche T2, branch `job/T2/id-spaces` (`origin/tranche/T2` @ 79e6ccd829 merged). Entries: T2-6, N2. One open question (Q1), carrying on on the best reading below. Waiting on: BOB's ANSWER to Q1; the CHANGE when `jurisdictions` merges into `tranche/T2`.

## Questions

### Q1 · the legacy caller of the old interface (`store.mjs`, `op=idmatch`)

`bio-plane/src/store.mjs` (legacy-store) imports `ID_SPACES`, `recognise(space, raw)`, `apnStanding`, `systemOfAddresses` and `judgePair(space, a, b, reading)` from `idspaces.mjs`, with Oakland's spaces, systems and floors held in this module. The requirements replace that interface: every service takes `view` first, the spaces are renamed (`cms` → `enactment`, `apn` → `parcel`), `apnStanding` → `parcelStanding`, `systemOfAddresses` → `systemOf`, and R24 forbids naming a place here. Applying N2 therefore breaks `op=idmatch` and its legacy test `bio-plane/test/rec203-idspaces.test.mjs` (legacy-tests), which I may not edit.

**Best reading, on which I carry on:** this module exports only the interface its requirements state and holds no local fact (N2, R24). `op=idmatch` in legacy-store is then out of step until a change there (for BOB to route): build the view with `jurisdictions.combine(<the instance's active profiles>)`, call `recognise(view, …)`, `systemOf(view, …)`, `judgePair(view, …)`, `parcelStanding`, and list spaces with `spaces(view)`; `rec203-idspaces.test.mjs` moves to the new space names. I keep no compatibility shim, because any shim must either hold Oakland's facts here (against R24) or pick a profile itself (which the requirements leave to the record's instance setting).

**The alternative, if BOB prefers the tranche green in the meantime:** keep a clearly marked, temporary legacy adapter in this module under the old export names, detecting the old call shape (a string first argument), that builds its view by combining every held non-test profile from `jurisdictions` (naming no place). It would be removed when legacy-store moves to the new interface.

**Addendum (measured after the module was rewritten, commit on this branch):** the break is not confined to `op=idmatch`. `store.mjs` imports `ID_SPACES` statically, so with the new module the whole plane fails to load (`bio-plane/test/rec203-idspaces.test.mjs`: workerd `SyntaxError: The requested module './idspaces.mjs' does not provide an export named 'ID_SPACES'`). Every Miniflare test of the old battery that loads `index.mjs` fails the same way until legacy-store changes or this module keeps the old names. This makes the alternative (a temporary adapter under the old names) the safer choice unless the legacy-store change lands in this tranche. Until BOB answers, the module on this branch exports only the required interface.
