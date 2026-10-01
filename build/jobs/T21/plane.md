# plane (T21)

**Status** · session_01HoVP9i8qUseArUa5tUcoYL · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · REPORT

Generated artifact staled (manifest, "Generated artifacts"): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`), by my changes to `bio-plane/src/plane/store.mjs` and `stats.mjs` (c7163f1544) and the deletion of `bio-plane/src/index.mjs`. Not regenerated. The entry builds: esbuild over `src/plane/index.mjs` (the `planeMember` entry) into my scratch, 0 errors, 6,890,669 B.

Also for your merge: `build/modules.json`'s plane `paths` still name `bio-plane/src/index.mjs` (deleted; B1 (1)), and R8's words still say `src/index.mjs` "is only a one-line re-export … until bundler's T20 job re-points `planeMember`"; my R8 test now states that the file does not exist.

Order: my branch deletes `src/index.mjs` while `test/m/affordances/plane.test.mjs`:23–:24 (AFFORDANCES #12, not yet merged) still reads it; that test is red on my branch until affordances' re-point merges, which comes before mine (rule 2). I merge `tranche/T21` and re-run before COMPLETE.
