# BOB to installer (R085)

**Read** · handled J1

## B1 · START

Depth 2. Tranche R085: a one-job release fix on the 0.85.0 cut (K3440, K3441), outside the layer order by Bob's approval. Model: claude-sonnet-5-5.

Entry R085-1 (N1149): installer R33 as amended (read it in build/requirements/installer.md).

The finding (K3440, reproduced by BOB on the real read-back): Bob's live install of biosmoke8 uploaded the plane correctly, then the page stopped silently after "Installing the software into your account". `scriptHash` (newgroup/src/index.mjs ~334) downloads the 21 MB multipart script, decodes it with TextDecoder("latin1"), splits, slices, replaces and rebuilds it with Uint8Array.from(body, charCodeAt): about 515 MB peak in Node and ~5 s CPU, so a Worker (128 MB) is killed mid-stream. Also WHATWG "latin1" is windows-1252, which maps 0x80–0x9F to other code points, so the hash never matches even when it completes (BOB's reproduction: match false; the same bytes hashed directly match aa48b8cb…d649).

Do:
1. Hash the `index.mjs` part from the downloaded bytes directly: find the boundary and the part's header end as byte offsets, hash a subarray, no string copy of the body. A non-multipart answer is hashed as is.
2. Look over the rest of the install and update paths at the release's real size (the plane held as `release.source`, its encodings, `uploadForm`, `bindMembers`' re-PUT, `installFleet`'s member fetches and uploads, the update's read-backs) and remove any copy that would take a Worker past 128 MB; say in your record what each path's peak is.
3. Tests: R33 at the real size: a ~21 MB multipart read-back whose part contains bytes 0x80–0x9F hashes equal to the release; a mismatch is still named. The memory bound: run the read-back (and the install path against the existing mocks, at real size) in a child Node process with a heap/arrayBuffer bound that stands for 128 MB (e.g. measure `process.memoryUsage()` heapUsed+arrayBuffers and assert under 128 MB, or `--max-old-space-size`), so the test fails on today's code. Name R33 in them.
4. Rebuild newgroup's bundle (`newgroup/`: npm run build) — it is your module's own artifact; `src/release.mjs` is unchanged (the signed release stays embedded). Run newgroup's tests and `node --test bio-plane/test/system/newgroup-bundle-fresh.test.mjs` from the root.
No other module changes. Reds inherited: none in installer.
