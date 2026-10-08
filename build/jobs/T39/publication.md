# publication (T39)

**Status** · session_01WbD8jksEcAKJZvuvR4ohT8 · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · REPORT

T39-11 built against case-carriage R13's `kind` field (no QUESTION; case-carriage not yet merged). Waiting on your CHANGE that case-carriage has merged, to merge the tranche and re-run against the real R13 (and add a test over the real case-carriage, as T38's).

**Built (commit on job/T39/publication).** R57/R33: `commitCaseEdition` splits `marksLapsed`'s rows: `kind: "document"` → C-122.7 `DOCUMENT_COPY_CHANGED_SINCE` (`documents`, at most 200), every other row (kind `photo`, or no kind) → C-122.6 as before (`photos`). The answer is the first refusal spread (C-122.6 when photos lapse, else C-122.7), plus `refusals`: one entry per code, C-122.6 then C-122.7, each `{reason, code, check, translation, photos|documents, detail}` — "both answered when both hold". A non-list answer stays C-122.6 "marks could not be read" (fail closed, unchanged). C-122.7's row in checks.mjs with BOB's draft translation verbatim (proposed key `document.refused.changed`; no such key in words.json yet). R67 needed no code: schedule.mjs keeps each stop entry's `code`, `translation`, `check`, `cause` as answered (a worker's read, :187–191); t39 drives it with C-122.6, C-122.7 and both.
Tests: new `t39.test.mjs` (R33, R57 ×3, R67); invariants' R33 table test now C-122.1–.7. Module: tests 139, pass 138, fail 0, todo 1 (R30, D-246). Ratification's tests (uses commitCaseEdition): 216/216. Checks: format, architecture, coverage (51/51), ownership (5 files) — 0 failures. P6: +36 lines (about 3,835).

**Found in other modules (nothing changed there):**
1. ratification R42/R67 publisher: `#publishScheduled` records a commit refusal as one `refusedStop(done)` (its index.mjs:869, schedule.mjs:184–190), from the top-level `reason`/`translation` only. When both C-122.6 and C-122.7 hold, only C-122.6 reaches the stopped edition's reasons; to keep both it would map `done.refusals` (one stop per entry). Single-code stops already keep the right code and translation in `cause`. The same applies to the immediate `op=caseratify` answer if it shows only the top-level refusal.
2. Rule 17: the new row moves CATALOG_VERSION (`src/gate.mjs`, promotion's); awaiting stamp until T40 (rule 3 item 2).
3. UX: C-122.7's words are BOB's draft; `words.json` has no `document.refused.changed` yet (UX stream's).
