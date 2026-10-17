# doorbell (T50)

**Status** · session_01XWMEFuyrSGAdEFQKYTTBGH · depth 2 · COMPLETE · handled B1

## Completion

- **Entry applied:** T50-56 (N1194, owners §7) R13. `pullKnock`, `inboxResolve` (its `pulled` arm) and the routes `inboxpull` and `inboxresolve` take `viewer` (the stamp from the query, never the body). For a knock not yet pulled, after `NO_SUCH_KNOCK` and `KNOCK_DISCARDED` and before its bytes are read, when provenance's `homeOf` finds a bundle that exists for the knock's digest, the pull answers `{ok, existed: true, knockId, capture: {sha256, bytes}, holder, pulled_by, pulled_at}` with no document. `holder` is the bundle id when membership's `viewerPredicate` (R43) admits the viewer to it, else null (also null with no viewer). The row becomes `pulled` with the digest, `by`, the instant and the admitted reason; no receipt, document, actor or bytes are written and `within` is not called. A digest registered nowhere, or whose home is gone, takes the old act; a knock already pulled answers its own `existed` with the document and no `holder` key.
- **Words:** none added; the answer carries no sentence (screens-intake draws `screen.inbox.alreadyheld`/`.other`). `setup-words` is unused by this change.
- **Deferred:** nothing.
- **Found in other modules:** none. Note for BOB: `test/m/store-door/routes.test.mjs:342` (R15 `reauthdue`) fails here with `SIGN_IN_REFUSED`, identically with my change stashed; not doorbell's.
- **Tests:** `test/m/doorbell/held.test.mjs` (4 tests naming R13, with controls); `node --test test/m/doorbell/`: pass 73, fail 0. `store-door` and `sources` (users of the pull): pass 85, fail 1 (the inherited `reauthdue` above, same before my change). No layer tests named for L3 in the manifest.
- **Checks:** format: 0 failures; architecture doorbell: 14 product files, 0 failures; coverage doorbell: 25 of 25 live ids named, 0 failures; ownership doorbell vs tranche/T50: 0 failures. `checks/run.mjs` over the product: 25 coverage failures in other modules, none doorbell's (inherited).
- Size (session_01XWMEFuyrSGAdEFQKYTTBGH): test runs 5, module lines 1165
