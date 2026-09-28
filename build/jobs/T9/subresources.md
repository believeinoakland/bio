# subresources (T9)

**Status** · session_01PwqLa1NvQSNYxStbJ9R5ds · depth 2 · WORKING · handled B2

## J1 · QUESTION

N79 adds a field to R15's `links[]`, a provided service, and no requirement id states it yet, so I have none to test it by. My best reading, which I am building now; please word it into `build/requirements/subresources.md` (a new id, R34, or a clause of R15) or correct it:

**R34** Every `links[]` entry carries its containment: `chrome: true` with `chrome_basis` naming the furniture region its href sat in (`<nav>`, `<footer>`, `<header>`, `<aside>`, or `role=navigation|banner|contentinfo|complementary|search`), when that href (as written, trimmed) appears in a furniture region anywhere on the page by R8's rule (body wins anywhere on the open-element stack; a declared `role=` outranks the element name; a commented-out region opens nothing); otherwise `chrome: false` and `chrome_basis: null`. The first furniture basis met in document order is the one named. A link one citation written two ways (a relative href in the body, the absolute one in the nav) is one entry, contained. Containment is a classification, never a filter: every link is recorded exactly as without it, and whether the link IS the site's chrome (recurrence across pages) is capture's R28, not decided here. A link restored from `resume` keeps its containment.

The field names are the ones capture already reads (`acquire.mjs`: `chrome: l.chrome === true`, `chrome_basis`), so capture's layer-3 share needs no rename. The one choice beyond the snapshot's D-340 (`furnitureLinks`): an uncontained link carries an explicit `chrome: false, chrome_basis: null` rather than neither field, so the field is total and never read as absent.

## J2 · REPORT

Two findings outside my module.

1. **Generated artifacts made stale (manifest §14).** My change to `bio-plane/src/subresources.mjs` stales four bundles: `bio-plane/dist/bio-plane.bundled.mjs`, `pdf-worker/dist/pdf-worker.bundled.mjs`, `ocr-worker/dist/ocr-worker.bundled.mjs`, `agent-worker/dist/agent-worker.bundled.mjs` (with their `.bundle.json`). `node --test bio-plane/test/fleetbundles.test.mjs` names each as `STALE BUNDLE — the source …/subresources.mjs has changed`. Not rebuilt, as B1 says; yours at the layer close. The manifest's §14 table lists `subresources` among pdf-worker's and ocr-worker's inputs but not agent-worker's; the verifier says agent-worker's bundle carries it too, so that row's "inputs come from" column is one module short.
2. **connections: a red test on `tranche/T9` without my change.** `bio-plane/test/m/connections/factory.test.mjs`, "R24, R18, K155: the capture and extraction connections creates carry the env it was given…", fails with capture's R58 refusal (`captureOf: a caller supplied a different env for a storage whose capture already holds another one…`, `capture/index.mjs:112`), the same with my change stashed. Against connections R24 (the env reaches the capture it creates): the test, or connections' factory, reuses a storage whose capture already holds another env; capture's R58 refuses it by design. connections is in layer 5 (T10), so this is for `next.md`, unless T9's capture job owns the cause.
