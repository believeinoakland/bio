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

## 1.16.6, recorded 2026-07-24

`checkGatheringGrammar` is exported. No logic changed. The gate already ran it at
ratification; the plane now also runs it at the WRITE, so a malformed gathering
request never lands rather than being caught later. Exporting the existing
function is how that happens without a second grammar pretending to be the same
one.

## Divergence from 1.16.4, recorded 2026-07-24

This file is now **1.16.6** and no longer matches the SHA-256 the retired Apps
Script pinned. One line changed, for one reason.

C-12.2's history-snapshot presence check used `ctx.files.has(snapPath)`. The
catalog's own 1.13.0 presence rule, stated in the comment above `hasFile_`, is
that a path exists if its bytes are carried OR it is declared elided, and that
existence assertions consult the union while byte checks read `files` directly.
A snapshot recorded in the manifest being "missing" is an existence assertion, so
it should have used `hasFile_` and did not.

The consequence was not theoretical. A tier-scoped read of the live record
produced 71 phantom findings, and it forced any caller wanting to gate to build a
byte-complete image: for the bundle carrying a 39.6MB capture that means pulling
that capture and its history copies into a Worker's memory to answer a question
about whether a file exists.

Byte checks are untouched. Capture integrity is still verified, and verified
earlier and more strongly than a gate could: the plane's capture op hashes the
body server-side on write and refuses a mismatch, so bytes are proven when they
land rather than re-proven on every ratification.

The Apps Script embed is retired, so nothing now runs 1.16.4. This file is the
one copy.

Read `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` alongside it. The
document is the specification; this is the implementation, and where they
disagree the disagreement is itself a finding (see the state document for the
ones identified on July 24, 2026).
