# extraction (T43)

**Status** · session_01PpDwes3iUurs4FGnAcYgt6 · depth 2 · RUNNING until 2026-10-11T09:53:26Z (users' tests (29 modules), branch and tranche baseline) · handled B3

## J1 · QUESTION

Five readings I am building on (carrying on; none blocks me):
1. R71 (N853a): a relayed `aiRefusal` is answered with its own `status` when it carries a 4xx one, else 403, as the keep-away refusal is relayed today. No requirement names the status (answer-envelope R1–R3 keep the handler's).
2. R71, R27 `{pages}`: the member's page numbers (reading page 0 is "1"), ascending, each once, joined by ", " ("2, 3"). The design stream may later choose runs or "and".
3. R27 `unread_pages`: carried for any reading with a positive `page_count` (a PDF's or, since N853b, a picture's one page), not PDF only; computed as the pages whose index holds no glyph-bearing `pdf-page` unit, a page inside a skipped-over-bound run counted read. Absent when no pages, and absent when the viewer may not see the bundle.
4. R73: in `pageTranscribe`, a detected format whose entry's `structure` answers `ok:false` (e.g. a damaged PDF) is also answered 200 `performed:false` with `why` naming the format and the entry's reason, nothing written, so the row-less 422 at `index.mjs`:1572 is gone. `op=pdfstructure`'s 422 (:1365) stays, R31 being unchanged.
5. R71 `says`: `transcribe.done` only when the pages were filled AND written (absent when the write rolled back); `{pages}` = the pages handed to the AI. `transcribe.none` when the AI path's `transcribe` was called and filled nothing, except an answer `ok:false` with reason AGENT_WORKER_UNBOUND, EVIDENCE_ABSENT or NO_PAGE_RENDERED (no `says`, performed:false with its reason). No `says` when no page was left or the act stopped before the AI path was called.
