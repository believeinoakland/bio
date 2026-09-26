# Plan: tranche T1, the certification run

**Status** · OPEN. Opened by BOB #38, 2026-09-26 (PROCESS-MECHANICS §5; TRANSITION.md T9). Branch `tranche/T1` from `main` @ f246896e6f. Bob's weekly meter at the opening: not yet given. T1 proves the process on a small tranche (P3) and starts the metrics (P14). Everything else waits in `next.md`: the other layer-1 modules and their entries (N1–N3, N7, N11, and the carried rows) are the next tranche's.

**Why these four.** They are small, and between them they exercise every part of a layer: a job that only writes tests (`ooxml`), a job that fixes one carried defect (`subresources`), and two jobs in the same layer where one changes a service the other uses and the change is carried between them (`pdf-reader` and `pdf-worker`, N9). None of them depends on the jurisdiction profile, which the next tranche builds.

**Every job** also writes the module's requirement-named tests at its interface, so that every live requirement id is named by a test and the coverage check passes (P7, mechanics §12.3). Built work named below sits on the snapshot branch and is judged against the requirements, never landed as it stands (mechanics §12.5).

## Layer 1

**ooxml** (26 requirement ids)
- T1-1 · Requirement-named tests for every live id; no other entry.

**subresources** (33 ids)
- T1-2 · Requirement-named tests for every live id.
- D-603 · A capture manifest stamps `fetched_at` on every subresource record, including ones never fetched (reused, skipped, deferred, capped, refused). Meet R17: a record carries `fetched_at` only when it was fetched in this capture.

**pdf-reader** (29 ids)
- T1-3 · Requirement-named tests for every live id.
- D-591 · Tier 1 inflate refuses a Flate stream with bytes after the zlib end, and the page then reads empty with no marker. Built work: none.
- D-627 · A full-page image whose only text is a folio is not routed to OCR and nothing says its content is unread. Built work: `land/worker/D-627` @ 056d3092, judged at the job.
- N9 · Provide, as named services, what `pdf-worker` reads today through private fields (`PdfDoc.objects`, `._pageOrder`, an image placement's `_stream` and `_ctm`). BOB carries the service change to `pdf-worker` (P5, P10).

**pdf-worker** (40 ids)
- T1-4 · Requirement-named tests for every live id; its tests stop importing the old battery's helpers and use `test-support`.
- D-671 · `/Rotate` is read from the leaf page only, so a page inheriting its rotation from `/Pages` renders un-turned.
- N9 · Use only `pdf-reader`'s named services, never its private fields.

**Deferred to a later tranche, from these modules:** D-622 (decoders for JBIG2 and JPX image-only pages in `pdf-worker`): a large piece of work, kept out of the certification run.
