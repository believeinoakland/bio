# screens-intake (T49)

**Status** · session_01DfJcVnWmWXDs839tKJcnve · depth 2 · WORKING · handled B1

## J1 · QUESTION

M-T49-5 measured (START line 1). Result: the project half can be done from what the screen writes; the "For which question" half (R25, and R22's "files it as `captured_for`") cannot. The provider line is owed through BOB (P9) before I build R25.

**1. Project placement (R22): works.** `heldcaptures` answers `project` from `bundles.project` (`capture/index.mjs`:970–1065). A promoted bundle's `bundles.project` is the top-level `project: <PROJ id>` line of its front matter (`promotion/index.mjs`:141–146, R53 `projectOf`; `record-core` `commit` writes it, line 960). So the screen puts `project: <the question's project, or the project opened as subject>` in `bundle.md`, and the held row shows it. I did not trace the project's Find `captures` count to its end; it reads the same column through membership's project fence, and I will assert it in a test against the real modules where the sandbox allows, else against a fake and say so.

**2. `lead_inquiry` and `captured_for` (R25): cannot, from what the screen writes.** Two independent reasons, both in `capture-requests`:
- R48's reader (`capture-requests/index.mjs`:1355–1371) answers `captured_for` only from requests with `target IS NOT NULL` and `state='captured'` and `capture_sha` among the document's captures. R48 says in terms: "`lead_inquiry` is not a question the document was captured for." So a `capturerequest` carrying only `lead_inquiry` can never make the held row name the question.
- A request becomes `captured` with its `capture_sha` only when the drain fetches it (R15, line 791). A member's own `acquire` just before or after never settles the request, and `drains: false` today (no unattended capture). So the immediate-`acquire` sequence cannot link the capture to the request at all, whichever field I send.

**Options (provider line):**
(a) `acquire` takes an optional `for` (a question id the member can see) and the capture side records it, so `captured_for` (capture R83) names that question for the document. The screen sends it, and sends no `capturerequest` for it. Smallest and truthful; `capture` and `acquisition` change.
(b) `capture-requests` settles a matching open member request when an `acquire` of the same address by the same member files a capture (sets `captured`, `capture_sha`), and R48 also reads `lead_inquiry`-only rows. Larger, two modules, and it keeps K3327's `lead_inquiry`.
(c) The screen sends `target` = the question instead of `lead_inquiry`. Fixes only the field; reason 2 still holds, so `captured_for` stays empty until the drain runs. Not enough alone.

Recommendation: (a). It is what Bob's DEC-245/246 need (the held row names the question; once vouched for it opens beside that question), and it keeps `capturerequest` as "Ask for this later" only.

**What I do meanwhile:** R21, R23, R24, R26, and R22's project filing by the front-matter line. I do not build "For which question" (R25 first part) or R22's `captured_for` expectation until you answer. R25's second part (refusals by key, `capture.fieldneeded`) I build now.
