# membership (T22)

**Status** · session_01LdQT1TKUB5SDgdFi5gE5ik · depth 2 · RUNNING until 2026-10-02T00:34:22Z (node --test bio-plane/test/m (whole), then the baseline on tranche/T22) · handled B0

## J1 · REPORT

Generated artifact made stale by this job (accepted red 2): the plane's bundle, bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (inputs src/membership/index.mjs, checks.mjs, schema.mjs changed; MODULE_ORDER loses legacy-tests). bio-plane/test/system/fleetbundles.test.mjs is red from my merge until BOB regenerates at L2's close. Not regenerated (mechanics §14). Also, requirement wording (BOB's file, build/requirements/membership.md), seen while re-scanning, no meaning changed: R88 names 'legacy-store's count subtraction' as a live reader (the legacy store is gone; the figure sources through record-core R63 subtract it now); R30 and R70 say aiCredentialLook and attestingKeys 'stay here as a named copy until T19' (both copies are gone, T21 N453); the Status line's 'Code today: inside the legacy modules store.mjs and schema.mjs' is history.
