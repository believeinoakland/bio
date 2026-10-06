# roster-reader (T34)

**Status** · session_0126RaWsKDwYb2AVQaFGQ3gF · depth 2 · COMPLETE · handled B2


## Completion (ROSTER-READER #2)

**Entries applied.** T34-64 (N614; K1505 (6), K1683, K1725): R12 `rosterSource(reads)` in `roster-reader/source.mjs`, exported from `index.mjs`. A held document is read by R2 (`staff_roster.parse` over its text flattened as `readText` does, rows placed by its own segment map), a held table by R6 (`rosterColumns`), each answered `{source, as_of, rows}`; a contact or unnamed column is never read and a contact point inside a cell is left unread (R4); the level is "held as a table, read by roster-reader"; no held roster gives `rosters: []` with why; `reads` absent, throwing, refusing, answering a promise or no list gives "held as a table, not read" with why; an item it cannot read is named in `unread` with why; it writes nothing and never throws. Built on the readings of J1 (the shape of `reads`' answer; an `org_chart` item read by R3, its named posts as rows), still open with BOB.

**Deferred.** Nothing.

**Other modules (REPORT J2).** `plane`: `bio-plane/src/plane/wiring.mjs` `rosterSource()` still registers the "not read" source (`ROSTER_NOT_READ`), and `store.mjs:183` registers it into `people`. To meet people R18 with this module's R12, plane composes `reads({organisation, viewer})` from the store (the Suggestion: captures placed as `staff_roster` or `org_chart` whose stated organisation resolves to the entity, and calculations' tables with R6's roles), in J1's shape, and registers `rosterSource(reads)` imported from `roster-reader`; its `t33.test.mjs` (lines 280–287) asserts the old not-read source and moves with it. No generated artifact is made stale by this module's change until plane imports it (the plane bundle then).

**Tests and checks.** `node --test roster-reader/test/`: tests 22, pass 22, fail 0 (R12 by six new tests in `test/source.test.mjs`). No layer tests (manifest). From civicos-process: format `126 modules, 125 requirements files; 0 failures`; architecture `15 product files, 30 relative imports (0 naming no tracked file, not judged); 0 failures`; coverage `12 of 12 live requirement ids named by a test; 0 failures`; ownership `4 files changed by roster-reader between tranche/T34 and HEAD; 0 failures`. R12's `*(not yet met: T34)*` mark in `build/requirements/roster-reader.md` is BOB's to clear at merge.

**Final `uses`** (K1505 (7)): `docprofile` (unchanged).

Size (session_0126RaWsKDwYb2AVQaFGQ3gF): test runs 2, module lines 1597

## J1 · QUESTION

R12, two readings I am building on (carrying on meanwhile):

1. **The shape of what `reads` answers** is not stated. My reading: a list of items (or `{items, view}`, or a refusal `{ok:false, why}`), answered synchronously because `people.staffingAt` calls a source without awaiting. A TABLE item is `{source, header, rows, as_of?, view?}` (rows as cell lists in header order, or objects keyed by header text); any other item is a DOCUMENT `{source, text, type?, view?}`, `text` a string or I2 shape, flattened as `readText` does. A promise answer gives "held as a table, not read" with why. The view is the item's, else the answer's, else docprofile's reader view (K39). `plane` composes `reads` to this shape at its composition.
2. **An `org_chart` capture** (the Suggestion names them among `reads`' items): R12 says a document is read by R2. My reading: an item with `type: "org_chart"` is read by R3 instead, and only a post whose holder is named on its own line becomes a row `{name, title}`; a chart read by R2 would make rows of box labels. If you want charts left out of the source instead, say so.

No row bound: each roster's rows are answered whole, as R12 states (people bounds its own lists, R17).

## J2 · REPORT

`plane` (not mine): `bio-plane/src/plane/wiring.mjs` `rosterSource()` still registers the "held as a table, not read" source (`ROSTER_NOT_READ`), and `store.mjs:183` registers it into `people`. To meet people R18 with roster-reader R12, plane composes `reads({organisation, viewer})` from the store (captures placed as `staff_roster` or `org_chart` whose stated organisation resolves to the entity; calculations' tables with R6's roles), in J1's shape, and registers `rosterSource(reads)` imported from `roster-reader/index.mjs`. Its `test/m/plane/t33.test.mjs` (lines 280–287) asserts the old source and moves with it; the plane bundle goes stale when plane imports it.

## J3 · COMPLETE

T34-64 applied: R12 `rosterSource(reads)` (`roster-reader/source.mjs`). Tests 22/22; format, architecture, coverage (12 of 12) and ownership 0 failures. Built on J1's readings (open); an ANSWER that changes them re-opens me. Plane's wiring to it is REPORT J2. Final `uses`: docprofile. Details in my record's Completion.

## J4 · QUESTION

B2: the seam test now registers doctypes' types through `registerDoctypes(registerDoctype)` before the roster types (pushed; 22/22 green on the current base, where docprofile still registers by default). The architecture check fails on it: `roster-reader/test/seam.test.mjs imports doctypes/index.mjs of doctypes, which roster-reader does not declare in uses`. My reading: `modules.json` is not mine to write, so you add `doctypes` to roster-reader's `uses` on tranche/T34 (it is earlier in layer 1). I then merge tranche/T34 once docprofile is merged there, re-run tests and checks, and COMPLETE again.
