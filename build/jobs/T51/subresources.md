# subresources (T51)

**Status** · session_01XC1xckBh1sjtooJq8nyEsw · depth 2 · WORKING · handled B3

## J1 · REPORT

A test outside this module holds a sentence this module owns. `bio-plane/test/m/acquisition/subresources-walk.test.mjs:100` asserts `/DERIVED ARTIFACT, not evidence/`, copying the derived-artifact banner that `bio-plane/src/subresources.mjs` now reads through `localize`. The file is acquisition's (not in this job's paths), so I changed nothing there. The banner's wording is unchanged, so the test still passes; the copy is a words-check issue for acquisition's owner to convert to a key assertion (K3810).

## J2 · REPORT

Generated artifacts made stale by this job's change (unchanged text, so their content is still correct until regenerated; listed for BOB's layer-close regeneration, manifest §14):
- `bio-plane/dist/bio-plane.bundled.mjs` (bio-plane, `npm run build`)
- `pdf-worker/dist/pdf-worker.bundled.mjs` (pdf-worker; its inputs include `subresources`)
- `ocr-worker/dist/ocr-worker.bundled.mjs` (ocr-worker; its inputs include `subresources`)
The bundles' source text for `BANNER` and `link_note` changed form (now `localize(...)` calls), so their bytes will differ on rebuild even though the rendered text is identical.

## J3 · COMPLETE

Entry T51-174 applied (the three words findings from `build/plan/words-pass/subresources.md`):
1. `bio-plane/src/subresources.mjs` `link_note` (findings at :1367 and :1373, one concatenated sentence): now one literal read through `localize("subresources.subresources.every_a_the_page_carried", en)`.
2. `bio-plane/src/subresources.mjs` `BANNER` (finding at :407, the derived-artifact banner): now `localize("subresources.subresources.derived_banner", en, { primarySha, when })`. I judged it a derived text, not a signed one (K1333): the companion is derived and its hash is recorded, not signed. Its wording is unchanged, so output is byte-identical.
Verified byte-identical: old and new `BANNER(...)` and `link_note` strings compared with HEAD for two input sets; equal.

Deferred: nothing.

Reports to BOB (posted as REPORT): a copy of the banner sentence in acquisition's `subresources-walk.test.mjs:100` (not this module's path); the three stale generated bundles.

Tests and checks:
- `node --test bio-plane/test/m/subresources/subresources.test.mjs`: 36 pass, 0 fail.
- `node --test bio-plane/test/m/acquisition/subresources-walk.test.mjs`: 13 pass, 0 fail (reads the module, not edited).
- `node checks/run.mjs /home/user/bio`: format 0 failures (174 modules); architecture 0 failures; the words check lists no finding for subresources (its full run still reports other modules' findings, outside this job).
- `node checks/ownership.mjs /home/user/bio subresources tranche/T51 job/T51/subresources`: 1 file changed by subresources, 0 failures.

Size (session_016S5EWxLud6RnWPVBD4mLr4): test runs 36, module lines 1400

## J4 · REPORT

One plain finding is left unkeyed on purpose: `bio-plane/src/subresources.mjs:402`, the render companion's Content-Security-Policy string (`object-src 'none'; form-action 'none'; base-uri 'none'` and its siblings). It is wire grammar: the browser reads it from the companion's meta tag, and no member reads it, so I did not key it. For the design's unkeyed list (K3944).

## J5 · COMPLETE

CHANGE B2 handled: merged `tranche/T51` into `job/T51/subresources` and pulled civicos-process at 27aa50e; judged the thirteen plain findings in `build/plan/words-pass/subresources.md`.

Keyed through `localize` (same English, so output is unchanged):
- `SPREAD_CLOCKS.capture.clock` (:719), the `THIRD_PARTY` detail (:761), the unreachable-address detail (:996), the two `DEFERRED` details (:1032, :1033, one per branch), the `CAP_REACHED` detail (:1039), the reused-record detail's two fragments (:1076: the capture name, and the earlier-captures count, singular and plural as separate ids), the platform-refusal detail (:1120), the `platformCeiling` note's two branches (:1324), and the `reason` and `transform` of the snapshot manifest and `reason` of the render companion (:1393, :1396, :1397).

Not keyed, reported (REPORT J4): `:402`, the render companion's CSP string. It is wire grammar read by the browser, not by a member.

Not judged as member text, left unchanged: the render companion's `transform` string at :1392 (not flagged by the plain arm; it carries placeholders and punctuation).

Verified: `node --test bio-plane/test/m/subresources/subresources.test.mjs` 36 pass, 0 fail; `node --test bio-plane/test/m/acquisition/subresources-walk.test.mjs` 13 pass, 0 fail; `node checks/run.mjs /home/user/bio`: format 0 failures, and the words check's only subresources finding is the reported :402; `node checks/ownership.mjs /home/user/bio subresources tranche/T51 job/T51/subresources`: 0 files changed by subresources outside the job's paths... (see below).

Size (session_016S5EWxLud6RnWPVBD4mLr4): test runs 36, module lines 1400

## J6 · COMPLETE

CHANGE B3 handled: merged `tranche/T51` (with DEC-343's unkeyed list) into `job/T51/subresources`, at ca9abff92e. The recomputed "Plain findings (K3957)" section names seven lines, all of them ones this job already keyed through `localize` on its own branch (the section was computed on the tranche's copy, which lacks this job's commits). The `:402` CSP string is no longer named, so the unkeyed list has taken it. The words check on this branch shows no finding in subresources.
`node bio-plane/src/setup-words/build.mjs --check` names calc-grammar only, not this module.
Tests: `node --test bio-plane/test/m/subresources/subresources.test.mjs`: 36 pass, 0 fail. `checks/run.mjs`: format 0 failures, architecture 0 failures.

Size (session_016S5EWxLud6RnWPVBD4mLr4): test runs 36, module lines 1400

## J7 · COMPLETE

Round 9, G133c piece (`subresources.mjs`, B4 START). Merged tranche/T51 first; read the requirement whole (R24 amended, R36 new).

Root cause (1): `linkWrapper.deferred` called `encodeURIComponent` on a string holding a lone surrogate, which throws `URIError` (was line 810). An unparseable address was already `UNRESOLVABLE` but not marked final.
Fix: `linkWrapper.deferred` turns a lone surrogate into U+FFFD before encoding (a well-formed pair is untouched), so it never throws and gives the same wrapper every call (R24). `classifyRef` marks an unparseable address `final: true`, and `captureSubresources` carries `final: true` onto the `UNRESOLVABLE` record (R36). `normalizeAddress`, `normalizeCitation` and the link records were checked with lone-surrogate and unparseable forms: none throws.
(2) Why the tests missed it: no test passed a lone surrogate or checked the record for finality. Gap fixed by the two tests below.
(3) Failing-first, seen RED then green, both through the public interface: 
- `R24: a lone surrogate in the url is U+FFFD in the wrapper, never a URIError, the same every call`: red line `✖ R24: a lone surrogate ... (0.63ms)` with `URIError: URI malformed`.
- `R36: a failure that comes of an address's own bytes is a final record and never a throw`: red line `✖ R36: a failure that comes of an address's own bytes is a final record and never a throw (4.78ms)`.
Both green after the fix.
(4) Platform check: N (pure string code, no platform limit involved).

Tests: `node --test --test-force-exit bio-plane/test/m/subresources/ bio-plane/test/m/acquisition/subresources-walk.test.mjs`: 51 pass, 0 fail. Users of `linkWrapper`: office-readers 115 pass, odf-reader 74 pass, pdf-reader 145 pass, 0 fail. `node build/plan/impact.mjs origin/tranche/T51 HEAD`: 122 of 176 modules (the module's callers span the plane); the three direct users above were run.
Checks: format 0 failures; architecture 0 failures; coverage 36 of 36 ids named, 0 failures; ownership 3 files changed by subresources, 0 failures; words: no finding names subresources (the run's 17 failures are other modules').

Words owed: none new (no new sentence).
Stale generated artifacts (BOB regenerates at the round end): `bio-plane/dist/bio-plane.bundled.mjs`, `pdf-worker/dist/pdf-worker.bundled.mjs`, `ocr-worker/dist/ocr-worker.bundled.mjs`.
Deferred: nothing. Found in other modules: nothing new beyond the plan's other G133c pieces (ooxml, meeting-calendar, reading-pipeline), which are other jobs'.
Files created outside paths: none.

Size (session_019jzP674bQQxG4CVu7SZEUt): test runs 6, module lines 1403
