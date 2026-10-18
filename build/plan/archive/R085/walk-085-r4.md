# WALK-085 r4: live walk of fix round 4 on biosmoke8 (2026-10-16, 05:00–05:40 UTC)

Signed in as administrator (sparky): by `op=login` for the ops (token in scratchpad `tok`, mode 600) and in Playwright Chromium (`--no-proxy-server`, with a private NSS store at `pw/home` trusting the session's egress CA; TLS still verified). No repository file was edited; no deploy. One run started; no proposal accepted or rejected.
Screens: `walk-085-r4/q0..q10-*.png/.txt`. Raw ops: `r4-airun-final.json`, `r4-airunlog-final.json`, `r4-spawn.json`, `r4-bv.json`, `poll.log`.

## 1. The run
- **The question page has no "Ask the assistant" button in this state.** `question.mjs:166-193` offers `askAct` only in state c (no cited leg) or when no proposals are pending. Because INQ-0001 has a cited leg and two pending proposals, the only way to start a run is the dock (header "Assistant" > "Ask the assistant to work on this"). I pressed it once at 05:05:34Z.
- The run is **RUN-55795a8154fd58b6**, mode check. airunopen and airundispatch both answered 200. It finished at 05:31:49Z: `completed`, 36 ticks, pass 3. That is 26 min 15 s.
- The dock said "A run of yours is working on this. Working on this: step 3." within 16 s, so the press is now acknowledged.

## 2. Verdict on the fix: partly fixed. The document is now named but never read; no answer was composed.
**Fixed:**
- `airunspawn` now carries `subjects`: `{INFO-2026-0003-rewalk-sample-txt, extent "¶1", kind leg}` and `{INFO-2026-0003…, cited}` (R85).
- Every sub-session named INFO-2026-0003 and searched "on" it. This strongly suggests `ids` reached the plane.
- Holdings: `documents: 1`, and `by_document` records INFO-0003 / upload:ea1a… as held (C6 partly).
**Not fixed:**
- No report got a row from the document. Every content and document report says "0 rows… no document was in scope / 0 captures counted".
- Log entries, quoted:
  - log:1 meaning LOOKED_INDETERMINATE (the report's own state is PRESENT): "one leg … cites INFO-2026-0003-rewalk-sample-txt ¶1. The row records no count…"
  - log:2 content: "Passage search for "pothole" on INFO-2026-0003-rewalk-sample-txt returned 0 rows. No document was in scope…"
  - log:3 document LOOKED_ABSENT: "…the only document subject. No document was in scope and nothing matched, so the document level is empty."
  - log:5 meaning: "A capture (sha ea1a5a20…) now sits behind it, but its text is not indexed (indexed_none; snippet null)…"
  - log:6, 11 content and log:7, 12 document: all LOOKED_INDETERMINATE, 0 rows. log:7 says "2 documents are in scope, but 0 captures were searchable at passage grain".
- **Reproduced live (my inference about what the model sent):**
  - `rows=passage&q=pothole` with body `ids:[INFO-0003]` gives 0 rows and `scope.documents 0`.
  - `q=passage:pothole`, with or without ids, gives 1 row, ¶1, snippet "In 2025 the city closed 1,204 pothole reports. Of these, 311…".
  - `q=` (empty) with ids also gives 1 row.
  - So the model still writes bare words; it does not use the `passage:` form. The run log does not record its tool calls, so the exact queries are UNVERIFIED.
- **C5 is still live on this capture.** The working read answers `indexed_none: 1` and `indexed_full: 0`. R38 probably applies only to newly written rows, and the old capture was not re-derived. The model read this literally: "its text is not indexed (indexed_none)". The pass-1 candidate then withdrew the level-empty claim, but only "because … the zero came from text that was never indexed". That is false.
- **The passes agreed on the wrong thing.** Each pass found nothing; meaning came out partial, content and document indeterminate, internet NEVER_LOOKED.
- **Compose made no candidate answer.** log:4 says "No version composed: nothing in the reports supports a reading…". That condition text was not a vocabulary word, so it was not recorded.
  - Each pass composed exactly one `level-empty-documents` candidate (log:4, 9, 13).
  - The final state is `submission: null`, and `basisversions` shows no new version. The only versions are still the two from RUN-56442 (02:48:33Z). **No proposals were written.**
  - The dedup step probably dropped the candidate as a duplicate of the existing "level-empty-documents", but nothing in the log says so (UNVERIFIED).
- **C6 residue.** The meaning report cited `INFO-2026-0003-rewalk-sample-txt¶1` with no space. Holdings lists it as unchained: "the record holds no captured version at this address". R100 splits only on a space or `#`.
- The coordinator's targets are free text (`{level, target}`) with no `id`. Whether R12's `targets` reached the contracts is UNVERIFIED.

## 3. Cost
- `session.cost`: **87 calls, 1,730,208 tokens, $1.610627**, first_at 05:07:08Z, last_at 05:31:49Z. The run took 26 min 15 s.
- The dock's 30-day figure went from $5.87 / 178 calls to $7.48 / 265 calls, which matches (+$1.61, +87). The previous run cost $1.49 for 89 calls.
- **Wallclock is now metered.** It read 54 ms at tick 3, then 1,568,928 ms of the 1,800,000 allowed at the end. That is 87% of the allowance, so a longer run would be stopped by it.
- Budget at the end: subsessions 12, runtime 89, fetches 0.
- **Whether usage entries name claude-sonnet-5-5: UNVERIFIED live.**
  - `ai-use.countUsage` does not persist `model` in `ai_usage` or `ai_use_acts`.
  - No read answers per-model figures: `aiusage` and `airun.cost` have no model field.
  - The code has R98 (`agent-worker/src/index.mjs:1602`) and R21 (`agent-model/src/model.mjs:194`).

## 4. Screen checks
- Question page: **"Opened by sparky, 15 October 2026"**. PASS.
- Queue: "You are up to date"; `op=queue` item_count 0, before, during and after the run. There is no "A document with no title … A capture finished" item. PASS.
- Run bar: new run `standard.basis "none-recorded"`, "no bar was recorded when this run was formed…". The spawn payload says the same. The old run RUN-56442 now also reads none-recorded. PASS (ops only: no screen shows the run's bar; `/app/ai-session/<run>` is "Nothing is here").

## 5. Other defects seen
1. **The question page gives no run state at all.** During the run and after it, the page was identical to before; only the dock shows the run. It offers no Ask button (§1), and nothing says that the run finished with nothing new (`endedPart` is suppressed while proposals are pending).
2. **The dock says "No run yet. Ask it to work on this…"** on a fresh load, both before and after the run, although two finished runs of sparky's exist on this question (q2, q10).
3. **The dock shows no progress beyond "Working on this: step 3."** It gives no pass or level and no cost so far, and no result when the run ends (gap (d) still open).
4. A false premise reaches the member's screen through the model: the candidate text says the document's "text is not indexed". It was not written this time, because no submission was made.
5. The old proposals still show the raw id "INQ-2026-0001-how-many-pothole-reports-did-the-city-cl" in member-facing text.
6. `GET /favicon.ico` still answers 400 on every load (console error).
7. `airunopen`'s `projectGate` says "this run is over a question, and a project does not own a line of inquiry", although the question is filed under PROJ-2026-5304. Wording check only, not judged.
8. `/app/ai-session/<run>` is not routed ("Nothing is here"), although `plane/screens.mjs:76` declares the screen.
