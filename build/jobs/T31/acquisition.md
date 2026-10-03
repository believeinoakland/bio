# acquisition (T31)

**Status** · session_01TNXZ4EjoqnXE7ZRkqLBzKq · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** · L3 N538 (DEC-124, K1365 (6), K1367): R9, R16, R24.
- R24: `acquisition/checks.mjs` now holds `CIVICSMITH_CONTACT_URL` (value unchanged, `https://github.com/believeinoakland/bio`) and `civicsmithUserAgent`, which answers `Civicsmith/<version> (+<url>; instance <instance>; <purpose>)` with the same defaults (`0.0.0`, `unnamed`). `CIVICOS_CONTACT_URL` and `civicosUserAgent` are exported beside them as aliases of the same constant and the same function object (`export const civicosUserAgent = civicsmithUserAgent`), not copies; `index.mjs` re-exports all four.
- R9: `userAgent` (and so `governedFetch`, `governedCall`, the subresource walk, the archive lookup and co-attestation) composes through `civicsmithUserAgent`; a delegated agent is still sent verbatim.
- R16: a new capture's first hop `who` is `instance <name> (Civicsmith/<version>)`. Nothing in this module rewrites a filed document, so one captured before T31 keeps its `who` as written.
- Comments re-worded to the new name where they named the agent.

**Tests** · `checks.test.mjs`: the R24 test re-keyed to `civicsmithUserAgent` (exact strings, defaults, purity, no "CivicOS" in what is sent, R9's agent is it); a new R24 test proving the aliases are the same function and constant (`===`), from `index.mjs` and `checks.mjs`, sending byte-identical agents. `acquire.test.mjs`: R9/R16/R20/R23/R28 assertions re-keyed to `Civicsmith/`; a new "R9 R16 (DEC-124)" test drives the direct arm with supporting files and co-attestation, the archive arm, the render arm and the capture-request arm, and checks every outbound request's agent (`acquire`, `attest`, `archive-lookup`, `investigate` purposes) and every first-hop `who`, that "CivicOS" is in no answer, R24's defaults on an unnamed instance, and a delegated agent as the negative control. `memento.test.mjs` and `subresources-walk.test.mjs` re-keyed to `^Civicsmith\/`.

**Deferred** · none. Removing the aliases is a later entry once capture-requests (L6), monitoring (L10) and instance-setup (L11) have re-pointed (K1365 (6)).

**Found elsewhere** · `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundle, `not_product`, BOB's at the layer close) is now stale against this module's source: `fleetbundles.test.mjs` fails with my change and passes without it. Regenerate at the close. Not new: `capture/index.mjs` ~845 still writes `(CivicOS/…)` in its own `who` (capture's L3 entry), and `capture-requests`, `monitoring`, `setup.mjs` (instance-setup) and their tests still import `civicosUserAgent`, which works through the alias and now sends `Civicsmith/…`.

**Runs** · `node --test test/m/acquisition/` (from `bio-plane/`): tests 72, pass 72, fail 0, skipped 0. Users of the changed service, unchanged and green: capture (with `cap13-reuse-pages`, `d57selflink`) 119/119; capture-requests 72/72; docket 39/39; ratification 203/203; monitoring 99/99; instance-setup 88/88; control-plane 147/147. No layer tests are named in the manifest. Checks: `format: 98 modules, 97 requirements files; 0 failures`; `architecture: 11 product files, 46 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 32 of 32 live requirement ids named by a test; 0 failures`; `ownership: 7 files changed by acquisition between tranche/T31 and HEAD; 0 failures`. R9, R16 and R24's `*(not yet met: T31)*` marks are in `build/requirements/acquisition.md`, BOB's to strike.

Size (session_01TNXZ4EjoqnXE7ZRkqLBzKq): test runs 4, module lines 1573
