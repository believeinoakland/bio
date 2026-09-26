# T1 · subresources — job record

**Status** · COMPLETE, 2026-09-26. Branch `job/T1/subresources`. No open question for BOB.

## Entries applied

- **T1-2** · Requirement-named tests for every live id: `bio-plane/test/m/subresources/subresources.test.mjs`, 34 tests (R1–R33 and the Errors clause), each at the interface (`captureSubresources` with fake callbacks, and the exported helpers). No test reads source text.
- **D-603 (R17)** · `fetched_at` is now carried only by a record whose fetch was issued this run (fetched, `SOURCE_REFUSED`, `FETCH_FAILED`, `TOO_LARGE`). Every record carries `considered_at`, the instant this run took the reference up (the requirement's suggested name). Reused, policy-skipped, `DEFERRED`, `CAP_REACHED`, `BUDGET_EXHAUSTED`, `PLATFORM_LIMIT` and refused records carry no `fetched_at`. R17 can be marked met.

## Other flaws fixed in this module (step 4)

- **R11, R28** · The reuse window was measured from `Date.now()`, not the injected `now()`; now `now()`.
- **R3** · Priority put every furniture reference after every document reference (a furniture stylesheet after a document script). Now kind first, furniture after the document's own within a kind.
- **R8** · A `role=` on a generic element (`<div role="navigation">`) never closed, so the rest of the page was furniture. Region entries now close on their own end tag, counting same-name elements nested inside; void and self-closed elements open none; `role` is read by its first token.
- **R1** · Tags inside `<script>` text were discovered (`document.write('<img …>')`); `<style>` bodies are now read in place (document order and the region they sit in); `url()` inside CSS comments is no longer followed; an `@import` target is kind `stylesheet`; a bare `#fragment` (`<use href="#x">`, `url(#grad)`) is not a reference (it re-fetched the page); `<source src>` is media; `<link rel=preload as=image imagesrcset>` is a srcset family.
- **R2, R14** · srcset descriptors were paired by a second comma split, misaligned after a URL containing a comma; one parser (`srcsetCandidates`) now serves discovery and the companion. The score is the descriptor's own number, ties in discovery order.
- **R10, R12, R13** · The reference the runtime refused (`PLATFORM_LIMIT`) was not queued, so a resumed capture lost it. It is now outstanding and retried on resume; `manifest.outstanding` is the queue's length.
- **R16, R33** · A `fetchOne` reason outside the closed set (the plane's own `HOST_COOLING_OFF`) landed in no bucket. It is now `FETCH_FAILED` with the caller's word kept as `fetch_reason`; an unexplained non-ok answer stays `SOURCE_REFUSED`.
- **R18** · `normalizeAddress` re-encoded the query (`a+b` became `a%20b`, `flag` became `flag=`); it now only reorders the parameters as written. An unparseable input returns `String(url).trim()`. Effect elsewhere: an existing `site_assets.address_norm` whose query had such an encoding misses once and is re-fetched (the safe direction).
- **R19** · A citation's fragment is trimmed.
- **Errors** · A missing `fetchOne`/`put`/`sha256`/`isPublic` is a `TypeError` up front, whatever the page holds.

Deferred: none.

## Found in another module

- **legacy-tests** · `bio-plane/test/subresources.test.mjs` now fails 2 of 357, both by design: line 330 ("every entry carries the address it came from and when") asserts `fetched_at` on every record, the unmet behaviour the requirements say must be corrected (check `considered_at` there instead, or `fetched_at` only on issued fetches); line ~487 ("and how much is outstanding") expects 21 where the queue now holds 22, since the refused reference is outstanding too. Neither file is this module's to change.

## Tests and checks run

- `node --test bio-plane/test/m/subresources/` · tests 34, pass 34, fail 0.
- Layer tests: none named in `build/manifest.md`.
- Tests of the modules that use this one (none have `test/m/` tests yet), run from the legacy battery: `formats-docx`, `formats-pptx`, `formats-xlsx`, `formats-odf`, `pdfstructure`, `drive`, `cap13-reuse-pages`, `cap14-reused-from`, `reuse-ratify`, `d543-instant-precision`, `d57selflink`, `multicase`, and in `civicos-ui/test/` `capture-honesty`, `snapshot-render`, `link-surface`, `refusal-codes`: all exit 0. `bio-plane/test/subresources.test.mjs`: 355 pass, 2 fail (above; 357 pass before this job).
- `checks/format.mjs` · 61 modules, 14 requirements files; 0 failures.
- `checks/architecture.mjs` · 1 product files, 1 relative imports; 0 failures.
- `checks/coverage.mjs` · 33 of 33 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs` · see below.
