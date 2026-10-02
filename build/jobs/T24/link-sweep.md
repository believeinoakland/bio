# link-sweep (T24)

**Status** · session_01CB47oKg96hYW5eGnbZtNP7 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Q1 (R66's grammar and C-18.16; decides one field monitoring's job reads). `SWEEP_TERM_REFUSED` (C-18.16) is this module's row, and monitoring R66 says R27's one refusal is `SWEEP_TERM_REFUSED` before `GATHERING_REFUSED`; monitoring cannot import this module (P4), so it cannot read the row's check and translation itself.

My reading, which I am building: the code is minted where the term is refused, in this module's `grammar` (DEC-49 region `is-sweep-term` in `src/link-sweep/checks.mjs`, the row's `where` `src/link-sweep/checks.mjs sweepGrammar > is-sweep-term`). Each finding `grammar(entry, ids)` answers is `{check: "C-18.5", severity: "error", message}` (C-18.5's finding shape, as `checkGatheringGrammar` gives today), and a refused term's finding also carries `code: "SWEEP_TERM_REFUSED"` and `refusal: {code: "SWEEP_TERM_REFUSED", check: "C-18.16", translation}`. Monitoring's R27, when any finding carries `code: "SWEEP_TERM_REFUSED"`, answers `{ok: false, reason: "SWEEP_TERM_REFUSED", code, check, translation}` from that finding's `refusal`, `detail` the term findings' messages joined with "; ", and `findings` all errors as `{check, detail}` (today's answer, byte for byte). `fence(c, nextText)` answers null or the whole refusal (`SWEEP_NOT_A_MEMBER` / `SWEEP_RATIFY_NOT_AN_OWNER` with check, translation, detail, sweeps, project), which monitoring returns as is. `dueForSlate(nowMs, sees)` answers today's items `{kind: "ratified-sweep", bundle, id, definition}`.

If monitoring's job builds another shape, tell me which and I conform. Until monitoring's merge I test against a stand-in keeping R65/R66 as stated plus this reading.
