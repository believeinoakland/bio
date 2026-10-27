# Copying a record's files between R2 buckets (the whole-record move, K5441, K5443)

**Status** · READY for PLANNING (FILES #1, F9, 2026-10-27), to be taken into the move draft (PLATFORM's). Sources: Cloudflare's S3 API and data-location pages fetched 2026-10-27; the stored layout from GAP-1.5.

## 1. What is documented
- **Same endpoint:** the S3 API supports `CopyObject` (with `x-amz-copy-source` and its conditionals) and `UploadPartCopy` (with `x-amz-copy-source-range`, no conditionals). Both copy inside R2 without the bytes passing through a Worker.
- **Jurisdictions:** a jurisdiction bucket is reached only on its own endpoint (`https://<ACCOUNT>.<JURISDICTION>.r2.cloudflarestorage.com`), which cannot reach resources outside the jurisdiction; a bucket's jurisdiction never changes. Whether a copy may cross that boundary is **not documented**: inferred not possible as one call; to be settled by the one eu rehearsal on the throwaway account (K5443).

## 2. Requirements for the move's copy (drafts for BOB's wording)
- **MV1** The default is **ranged streaming**: read the source in ranges, write the destination by multipart, never holding a whole file in memory; part sizes at least 5 MiB except the last; each part's digest verified against the source's before completion. Test: a 500 MB object and a 2 GB-unpacked member copied between a default and an eu bucket; whole-sha equal at both ends; peak memory under the step's bound.
- **MV2** If the rehearsal shows `CopyObject`/`UploadPartCopy` works across the boundary, it is used in place of MV1 for objects it handles, and MV1 stays for any it refuses. Test: the rehearsal's result is recorded; both paths pass the same digest test.
- **MV3** If Super Slurper (R2 as a source) is shown by the rehearsal to support jurisdiction buckets, it may carry a bulk move; it is an alternative, not the default, because it is outside the product's own record of what moved. Test: a move through it, then the product's reconciliation (every document's whole sha present at the destination).
- **MV4** The copy is **resumable and idempotent**: a move interrupted at any object resumes without recopying completed objects or leaving a half object visible (multipart completes only when every part is verified); a restart mid-object restarts that object. Test: kill during a multipart copy; resume completes once.
- **MV5** The copy is **verified before the source is trusted gone**: every document's whole sha is read back at the destination, and the source is retained until the move is confirmed (the source's deletion is a separate, later act, never part of the copy). Test: a corrupted destination part is detected and the object recopied.
- **MV6** **Until the whole-sha migration (GAP-1.5) runs, the move copies parts, not whole files**: records may hold part-keyed rows (a multipart upload's parts keyed by part sha, X35, N20). The move copies every part a document's rows name, and keeps the part rows' keys. After the migration it copies whole objects. The migration is BOB's and enters the plan as an entry before or with the move. Test: a record holding part rows moved and read at the destination, same bytes and citations.
- **MV7** The destination's reads during the move follow the record's pointer, which flips to the destination only when MV5 has passed for the whole record (the move is whole-record, K5441). Test: a read during the move comes from the source; after the flip from the destination.

## 3. Costs to PLATFORM
R2 operation counts (a multipart copy is 1 + parts + 1 operations; a 5 MiB part size means a 500 MB file is ~100 parts, a 2 GB file ~400), and egress if the source is read through a Worker (R2 egress is free; the Worker's time is not). Unmeasured; the rehearsal measures one 500 MB object.
