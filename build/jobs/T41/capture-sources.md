# capture-sources (T41)

**Status** · session_01AQ3yjggSC6tiKpht4z578o · depth 2 · WORKING · handled B0

## Completion (CAPTURE-SOURCES #12)

**Reading set** (mechanics §17, K2304): BOB's measure 405 KB; own code and tests alone 340 KB, so over 300 KB. Read whole myself: `build/requirements/capture-sources.md`; the plan's entry T41-7 and K2408, K2434, K2442; the services my Uses names for this entry, membership's Terms, R43 `viewerPredicate`, R44 `sight`, R64 `isAdministrator`, R20, R85, R88, R120 (with their code, `membership/index.mjs` :30–100, :1040–1075); all of `src/capture-sources/credentials.mjs` and `test/m/capture-sources/credentials.test.mjs`, the code and tests the entry changes. A worker read the other 13 files whole (render, browserrender, cdx, drive, memento, own-hosts and their tests, dec149) and wrote a ~5 KB summary citing file:line. It found every id R1–R54, R64, R65 named by a test, and no read of membership, sight, administrators or the credentials store in those files. Nothing it left out mattered: the entry touches none of them, and all of their tests pass unchanged. (Layer 3's row of `build/layers.md`: imports unchanged, `architecture` 0 failures.)

**Entry applied (T41-7, N822; D54, K2408, K2434).** R58: an administrator, the founder included, sees every `member` and `group` credential entry, and a `project` entry only at `FULL` sight of its project. `#visibleClause` no longer gives an administrator `1=1`: the `project` arm is membership's `viewerPredicate` for every viewer, and that rule admits an administrator to a hidden project only as a participant. `#sees`, which R57's withdrawal shares, asks `sight(...) === "full"` for an administrator too. So a credential of a hidden project the administrator is not in is answered `CAPTURE_CREDENTIAL_NO_SUCH` on withdrawal, as one they may not see (R57). Discoverable projects are unchanged.

**Tests re-stated (K874, negative control).** The test world gains P3 (discoverable) and P4 (hidden, the founder's). R58's listing test asserts administrators (`member:second`, `admin`, `member:admin`) see member, group and P3 entries and none of hidden P1 and P2, even when filtered by a project's id. Its controls: an invitation to P1 gives `second` P1's entries; the founder sees P4's and `second` does not; P2 set discoverable gives administrators its entries; a revoked administrator sees nothing. The bounded test cuts the administrator's page over the rows it sees. The R63 test: an administrator is refused `NOT_PERMITTED` on discoverable P3's credential and `NO_SUCH` on hidden P1's. Against the old code these three tests fail (20 pass, 3 fail); against the new code all pass.

**Ran.**
- `node --test test/m/capture-sources/`: tests 96, pass 96, fail 0. The manifest names no layer tests.
- Users' suites (capture-requests, plane, capture, acquisition, monitoring, answer-envelope, extraction; reading-pipeline untouched by credentials): tests 857, pass 844, fail 13. The same 13 fail with my change stashed, so none is mine. They are capture R41 ×2 and R69, plane B2, K1806, R12 ×2 and R19 ×4, and answer-envelope R2/R7 ×2: inherited reds (rule 4).
- No module outside capture-sources calls `credentialList` or `credentialWithdraw` (grep over `bio-plane/src`, `bio-plane/test`).
- Checks: `format` 0 failures; `architecture` capture-sources 0 failures; `coverage` 65 of 65; `ownership` 0 failures (rerun after commit, below).

**Deferred.** None. The requirement's `*(not yet met: T41)*` mark on R58 is BOB's to strike (requirements are not my paths).

**Found in other modules.** None from this change. Generated artifacts staled: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), regenerated at layer close. Small observations from the worker on my own files, none a breach of a requirement:
- `own-hosts.mjs:33`: a suffix entry with a trailing dot matches nothing (an R65 edge case; the composition root hands none in).
- `render.mjs:111`: a comment says "three-valued" but four values are listed.
- `browserrender.mjs:548/557/568`: dead guards on a non-null constant.

These are left for a later job of this module, not this entry.

Size (session_01AQ3yjggSC6tiKpht4z578o): test runs 6, module lines 2687
