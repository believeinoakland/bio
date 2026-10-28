# doorbell (T53)

**Status** · session_018BhcecgyadihJwzejgvKmY · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# doorbell T53 report

Entries applied:
- T53-116 (R29): a pulled knock's document carries `knocker_file_name` (`{text, words_of: "the knocker", evidence_of_truth: false}`), null when none was sent.
- T53-117 (R31, DEC-479): `inboxView({knockId, viewer, sheet, fromRow})`, route and declared op `inboxview`. It fetches the bytes, checks the digest, calls `file-safety` R71 `safeViewOfBytes` through `deps.fileSafety` (default `fileSafetyOf`) and maps the refusals: `KNOCK_BYTES_CHANGED` (C-85.6, in the C-85 table), `NO_SAFE_VIEW` (`screen.inbox.view.nokind`), the encrypted file (`SAFE_VIEW_FAILED`/`ENCRYPTED`), `EVIDENCE_NOT_HELD`, `NO_SUCH_KNOCK`. Writes nothing. Seam tests run over file-safety's real code.
- T53-118 (R30): `clearDiscarded`, `discardClearDue`, `discardClearWake`; `DISCARD_DAYS` from runtime-limits. Bytes are removed first (unless another row names the digest), then the rows in one transaction; a failed removal keeps the row for the next call; a knock being cleared answers NO_SUCH_KNOCK to a resolve meanwhile.
- T53-119 (K5565): the three English sites converted to word keys; the module's two files are out of the baseline; words check 0 testenglish.

Not done: nothing.

Found in other modules (placed by BOB, K5693): store-assembly t42 pins nine doorbell routes (T53-557); op-declarations, op-grades, control-plane for `inboxview` (T53-558 to T53-560); scheduler R35 to call the R30 services (T53-561). `discardClearDue` ignores the hold reader, so during a hold its wake instant stays in the past (scheduler's to bear).

**Met** · R29, R30, R31

Tests: 115/115. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecgyadihJwzejgvKmY): test runs 1, module lines 1367
