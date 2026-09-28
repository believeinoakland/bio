# citation (T10)

**Status** · session_01R6VXZuB7rBeeJDJ5k42mMd · depth 2 · WORKING · handled B1

## J1 · REPORT

Found outside my module; none of it touched by me.

1. **citation's requirements (yours):** R1's mark `(not yet met: T10, N146: #noSuchProject is a copy)` can be struck. The copy is deleted, and `cite`, `sever` and `reinstate` now answer `membership.noSuchProject` (its R78) byte for byte, including its `code`, `check` and `translation`. Tests: cite-refusals R1/R9, sever R4.
2. **legacy-tests, `bio-plane/test/meaning-bounds.test.mjs` D-240 (b):** `#document$citationOf[silent]` ×2 has left the lost-by-widening list (N196). `#document` now returns its refusal as itself, `ok: false` at the top level, and `{ok: true, text, data}` on success. The arm is still red on extraction's seven `pdfStructure[silent]` only. Its T8 comment ("`#document$citationOf[silent]` x2 … N70's") is now stale. No other line of that file's output moved, before vs. after.
3. **legacy-tests, `bio-plane/test/refuse-gate.test.mjs`:** red on the tranche before my change and unchanged after. I did not investigate it.
4. **N165 (for reevaluation's R14):** citation's share holds with nothing to build. A case's `cites` edge to a document pins `extent_capture` (REC-219), and so does a question's document leg (REC-220), both at the act and in the document's own bytes. The holder is the citing document itself (the project's or the inquiry's bundle id): the edge or leg lives only in its `references[]` or `basis[]` (R6). Tests: cite-write R2 (both arms), R3 (`pinned_captures`, per-leg `pinned_capture`).
