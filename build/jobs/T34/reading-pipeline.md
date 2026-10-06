# reading-pipeline (T34)

**Status** · session_0142QJow5hdFsVyMZKTNrq98 · depth 2 · WORKING · handled B2

## Completion

**Entries applied.** T34-66 (N615, K1683, with B2's K1773): both of `read`'s `doctypeFor` passes are handed the capture's origin as `ctx.origin`: its own (R1, text read as text, and the type's reader `parse`) and `docprofile.readText`'s (R11, which spreads its ctx into `doctypeFor` and the reader). The origin is `"fetch"` for every document, as J1 reads it: the acquire document records no bytes-origin, and every capture it can be is a copy's fetch (K1775) or a knock (K1776); it is never read off `capture.actor_class` or the request's `origin`. So `ecourt_roa` (court-doctypes R2) never matches through `read`, as it never matches at intake. R24's signature unchanged; no requirement changed (req: none). If BOB answers J1 otherwise, the change is one constant (`CAPTURE_ORIGIN`) and its two uses.

**Fixed in this module.** K1737's ×16 reds: the eight suites (convert-chain, convert-ocr, convert-tiers, emitted, hooks, pieces, read, staffdirectory) each register doctypes' readers with `registerDoctypes(registerDoctype)`, as the plane's store does; no assertion changed. New `origin.test.mjs` (3 tests, named R1 and R11 (N615)): the probe type's detect and reader see `"fetch"` on both passes for a plain document, a member session's fetch, a knock-shaped document and a request origin naming a member; a member-only type (with a control showing it matches when `"member"` is stated) and the real `ecourt_roa` never match. Two of the three fail without the source change.

**Deferred.** None.

**For BOB (modules.json).** The tests now import `doctypes` (`doctypes/index.mjs`, eight suites, as B1 directs) and `court-doctypes` (`court-doctypes/index.mjs`, `origin.test.mjs`, the real `ecourt_roa`): `node checks/architecture.mjs` reports these 9 undeclared imports until `reading-pipeline`'s `uses` gain both (both layer 1, earlier). Nothing else found in another module; no generated artifact made stale (the plane bundle includes this module's source, so it is stale as at every merge, regenerated at the close).

**Tests and checks.**
- `node --test bio-plane/test/m/reading-pipeline/ bio-plane/test/d606-perpage-ocr.test.mjs bio-plane/test/tier2-wire.test.mjs bio-plane/test/system/pdf-worker-binding.test.mjs`: tests 88, pass 88, fail 0, skipped 0 (before: 85 tests, 16 fail, K1737's). No layer tests named in the manifest.
- `node checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `node checks/architecture.mjs … reading-pipeline`: 24 product files, 73 relative imports; 9 failures, all the test uses above (doctypes ×8, court-doctypes ×1), BOB's to declare.
- `node checks/coverage.mjs … reading-pipeline`: 28 of 28 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … reading-pipeline tranche/T34`: 11 files changed; 0 failures.

Size (session_0142QJow5hdFsVyMZKTNrq98): test runs 6, module lines 1435

## J1 · QUESTION

T34-66 (N615): where `read` takes the origin from. My best reading, which I am building now: the acquire document `read` is handed records no bytes-origin (acquisition hands `profileOf` `"fetch"` and stores no origin in the profile; the document's own `origin` field is the request's kind, `named_request`/`sweep`/`doorbell`, and a doorbell document's `capture.actor_class` is `"member"`, which K1776 says must read as `"fetch"`). Every document the plane produces today is a copy's fetch (K1775) or a knock (K1776), both `"fetch"`. So `read` hands `origin: "fetch"` to both of its `doctypeFor` passes (its own at R1, and `docprofile.readText`'s, which spreads its ctx into `doctypeFor`), never derived from `actor_class` or `origin.kind`; `ecourt_roa` can then never match through `read`, matching intake. No new option on `read` (R24's signature unchanged). When a member-supplied-bytes path (an upload) is built, its document will need to state the origin and `read` to read it; that is a requirement for that entry, not this one. If you would rather `read` take an optional `origin` option (R24 widened, extraction to pass it), say so.
