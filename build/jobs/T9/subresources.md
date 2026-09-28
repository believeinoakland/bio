# subresources (T9)

**Status** · session_01PwqLa1NvQSNYxStbJ9R5ds · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N79 adds a field to R15's `links[]`, a provided service, and no requirement id states it yet, so I have none to test it by. My best reading, which I am building now; please word it into `build/requirements/subresources.md` (a new id, R34, or a clause of R15) or correct it:

**R34** Every `links[]` entry carries its containment: `chrome: true` with `chrome_basis` naming the furniture region its href sat in (`<nav>`, `<footer>`, `<header>`, `<aside>`, or `role=navigation|banner|contentinfo|complementary|search`), when that href (as written, trimmed) appears in a furniture region anywhere on the page by R8's rule (body wins anywhere on the open-element stack; a declared `role=` outranks the element name; a commented-out region opens nothing); otherwise `chrome: false` and `chrome_basis: null`. The first furniture basis met in document order is the one named. A link one citation written two ways (a relative href in the body, the absolute one in the nav) is one entry, contained. Containment is a classification, never a filter: every link is recorded exactly as without it, and whether the link IS the site's chrome (recurrence across pages) is capture's R28, not decided here. A link restored from `resume` keeps its containment.

The field names are the ones capture already reads (`acquire.mjs`: `chrome: l.chrome === true`, `chrome_basis`), so capture's layer-3 share needs no rename. The one choice beyond the snapshot's D-340 (`furnitureLinks`): an uncontained link carries an explicit `chrome: false, chrome_basis: null` rather than neither field, so the field is total and never read as absent.

## J2 · REPORT

Two findings outside my module.

1. **Generated artifacts made stale (manifest §14).** My change to `bio-plane/src/subresources.mjs` stales four bundles: `bio-plane/dist/bio-plane.bundled.mjs`, `pdf-worker/dist/pdf-worker.bundled.mjs`, `ocr-worker/dist/ocr-worker.bundled.mjs`, `agent-worker/dist/agent-worker.bundled.mjs` (with their `.bundle.json`). `node --test bio-plane/test/fleetbundles.test.mjs` names each as `STALE BUNDLE — the source …/subresources.mjs has changed`. Not rebuilt, as B1 says; yours at the layer close. The manifest's §14 table lists `subresources` among pdf-worker's and ocr-worker's inputs but not agent-worker's; the verifier says agent-worker's bundle carries it too, so that row's "inputs come from" column is one module short.
2. **connections: a red test on `tranche/T9` without my change.** `bio-plane/test/m/connections/factory.test.mjs`, "R24, R18, K155: the capture and extraction connections creates carry the env it was given…", fails with capture's R58 refusal (`captureOf: a caller supplied a different env for a storage whose capture already holds another one…`, `capture/index.mjs:112`), the same with my change stashed. Against connections R24 (the env reaches the capture it creates): the test, or connections' factory, reuses a storage whose capture already holds another env; capture's R58 refuses it by design. connections is in layer 5 (T10), so this is for `next.md`, unless T9's capture job owns the cause.

## J3 · COMPLETE

**Entries applied.** N79 (K278, R34): every `captureSubresources` `links[]` entry carries its containment. **The field, exactly, for capture R28:** `chrome` (boolean, on every link) and `chrome_basis` (string or `null`). `chrome: true` with `chrome_basis` one of `<nav>`, `<footer>`, `<header>`, `<aside>`, `role=navigation`, `role=banner`, `role=contentinfo`, `role=complementary`, `role=search`, when the link's href (as written, trimmed) sat in a furniture region anywhere on the page by R8's rule; else `chrome: false, chrome_basis: null`. The first furniture basis in document order is named; one citation written two ways is one entry, contained if either was; every partition (anchor, intra, deferred, refused) carries it; a refused link has `address: null`, so capture's `acquire.mjs` (which files `subs.links.filter((l) => l.address)`) never sees it. Capture's `acquire.mjs` already reads `chrome: l.chrome === true, chrome_basis: l.chrome_basis || null`, so capture's layer-3 share needs no rename. R34's "*(not yet met: T9, N79)*" can be struck.

**How.** The region stack (R8) is now one helper, `regionStack()`, used by one walk, `scanHtml()`, that gives the references and the links' containment together, so both are classified by one rule, the `nest` handling for a role on a generic element included (improved over the snapshot's D-340 `furnitureLinks`, which lacked it and walked the page twice). `parseHtmlRefs` keeps its export and its output. A resumed tick re-walks the page for its links alone (meter segment `link_containment`), because a link can change partition between ticks (deferred, then intra once its bytes are held) and the new entry needs containment; a restored link that predates the field is given it.

**Deferred.** Nothing.

**Other modules.** J2: four bundles stale (bio-plane, pdf-worker, ocr-worker, agent-worker), and the manifest's §14 row for agent-worker omits `subresources` from its inputs; connections' `factory.test.mjs` R24 red on `tranche/T9` without my change (capture R58's refusal).

**Tests.**
- `node --test bio-plane/test/m/subresources/`: tests 35, pass 35, fail 0 (R1–R34 and Errors). R34's test was proven to bite by five mutations (body-wins, nesting, the two-ways merge, first-basis, the restored-link fallback), each turning it red.
- Users of my service, `node --test` over `test/m/` of office-readers, odf-reader, pdf-reader, capture-sources, capture, connections, monitoring: tests 391, pass 379, fail 1, todo 11. The one failure is connections' R24, red on the tranche without my change (J2).
- The old battery's files that import subresources (`test/subresources.test.mjs`, `drive`, `formats-odf`, `versionnotice`): tests 4, pass 4, fail 0.
- `node --test bio-plane/test/fleetbundles.test.mjs`: fails with the four STALE BUNDLE findings of J2, as expected.

**Checks** (process repo @ 5c397bd2, on this branch after merging `tranche/T9` for K278):
- `format`: 69 modules, 64 requirements files; 0 failures
- `architecture subresources`: 2 product files, 2 relative imports; 0 failures
- `coverage subresources`: 34 of 34 live requirement ids named by a test; 0 failures
- `ownership subresources tranche/T9`: 3 files changed; 0 failures

Size (session_01PwqLa1NvQSNYxStbJ9R5ds): test runs 16, module lines 1426

## J4 · REPORT

Correction to J3, one sentence: a refused link does NOT have `address: null`. It carries the refused address (the raw text for a refused scheme, the resolved address for a refused locator), as before N79, so capture's `acquire.mjs` files refused links too, each with its `chrome` and `chrome_basis` like every other link. Only an empty href is refused with no link record. Everything else in J3 stands; my state stays COMPLETE.
