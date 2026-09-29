# installer (T12)

**Status** · session_01BB1Bcv3GqjX9wdZK5x9pH8 · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

N234 (my R30), the import seam. My best reading, on which I am building now:

1. **Where and what.** I import `GROUP_SLUG_RE` and `FLEET_BINDINGS` from `bio-plane/src/setup.mjs` (instance-setup's paths), in the shapes the extraction map moves them with: `GROUP_SLUG_RE` a RegExp (legacy-store's static), `FLEET_BINDINGS` the list of `[member, binding]` pairs (legacy-index 3832). The installer derives its member→binding lookup from that list and keeps no table of its own. Until your CHANGE, both come through a local stub in my own paths (`newgroup/src/instance-setup-stub.mjs`, marked temporary); at the CHANGE I point the import at `setup.mjs` and delete the stub.
2. **A constraint on instance-setup this creates (please pass it on, or rule).** The installer ships as one esbuild bundle (`--platform=neutral`) pasted into a dashboard Worker (DEPLOY.md). Whatever `setup.mjs` imports at module level is pulled into that bundle: today `checks/bio-checks.mjs`; after the extraction likely record-core, membership and the rest, and any `cloudflare:*` specifier would fail the neutral build outright. My reading: instance-setup should keep the two exports import-free (e.g. in a leaf file of its own that `setup.mjs` re-exports, which needs a path added to its `paths`), so the installer imports that leaf. If you rule it stays in `setup.mjs`, I will build the bundle against it at the CHANGE and report its size and any failure.
3. **Retired by this change (legacy-tests', reported):** `bio-plane/test/instance-group.test.mjs`:232 reads `const SLUG_RE = …` from `newgroup/src/index.mjs` by source text; it stops matching when my copy goes (the extraction map already names it as retired by N234).
