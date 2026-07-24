# bio-checks

The authoritative check catalog. Extracted from `BIO_CHECKS_SOURCE` inside the
Apps Script promotion service on July 24, 2026 and verified against the
`BIO_CHECKS_SHA256` constant the accelerator pins beside it:

```
version 1.16.4
sha256  bb92adfde6b03390906eddf025f755e74c1ac3b19068115e590a214751b0582c
```

The hash matches, so this file is the exact bytes the Apps Script runtime
compiled and executed, not a transcription of them.

**Why it is here.** The Cloudflare plane ships `plane-gate/0.1`, which
implements only the mechanical integrity subset: live hashes, the base chain,
capture presence, dangling references. This catalog implements 49 distinct
checks across families C-1 through C-20. Until now it existed in exactly one
place, embedded in a runtime being decommissioned. The plane's gate cannot
reach parity with a catalog it cannot read.

**What it is not.** It is not the plane's gate and it does not run in the
plane yet. It is plain ES-module JavaScript with zero dependencies, written to
run identically in node, a browser, and the Apps Script embed, so it should
port with adapter work rather than a rewrite. Its filesystem access is
injected (`files`, `sha256`, `sha512`, `resolveTarget`, `releaseRegistry`), and
those five seams are the whole porting surface.

**Its own crypto, and why.** The catalog hand-implements SHA-256 and Ed25519
verification in portable JavaScript because Apps Script has neither. The
comments explain the reasoning, including the deliberate avoidance of BigInt.
The plane has WebCrypto, so a port should inject platform primitives at those
seams rather than carry the hand-rolled versions, and the catalog is written
to allow exactly that.

Read `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` alongside it. The
document is the specification; this is the implementation, and where they
disagree the disagreement is itself a finding (see the state document for the
ones identified on July 24, 2026).
