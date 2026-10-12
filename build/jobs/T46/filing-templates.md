# filing-templates (T46)

**Status** · session_018acpnGGGPwqinsMDvEo2a5 · depth 2 · COMPLETE · handled B1

## Completion (FILING-TEMPLATES #9)

**Read whole** (P20; START B1): `build/requirements/filing-templates.md`; the public parts of record-grammar, jurisdictions, record-core, membership and action-grammar; `build/layers.md` (layer 9's contract, action-grammar's section, "No jurisdiction in the product"); my plan entry T46-36 and the opening's rules; all of the module's code (`index.mjs`, `checks.mjs`, `blanks.mjs`, `schema.mjs`) and all of its tests (`fixture.mjs`, `draft`, `lifecycle`, `review`, `reads`, `offer`, `grant-channel`, `invariants`).

**Entries applied.** T46-36 (N913; R29): C-125.33 `TEMPLATE_NOT_REVIEWED` now takes its translation from `words.json`'s `refusal.TEMPLATE_NOT_REVIEWED`, read by key through `FILING_TEMPLATES_WORDS` (`checks.mjs`, exported from `index.mjs`), as `HANDLE_WORDS` and `TRANSCRIBE_WORDS` are; `{missing}` is left for the screen, the refusal's `lacks` beside it. Code, number, `where` and behaviour are unchanged. C-125.34 `TEMPLATE_COURT_PETITION` keeps its present translation, as R29 says. The other 42 rows are byte-identical to T45's (pinned by digest in the test). The changed row waits for T47's promotion stamp (rule 5 (2)).

**Tests.** `test/m/filing-templates/t46-words.test.mjs` (new): three tests naming R29. They cover the words table verbatim against `words.json`, the row reading it, T45's words answered no longer, C-125.34 kept, the other rows unmoved, and the refusal as `offeredVersion` (by id and by name) and `templateRead` answer it with `lacks` beside it. Each has its control: the same templates offered once attributed, and C-125.34 as the draft answers it.

**Deferred, in my own module.** C-125.4 `TEMPLATE_BLANK_UNKNOWN`'s `where` names only `#textRefusal > is-template-text`, but R15's `#profileRefusal` also raises it for a profile template, so the row names one of its two raising sites. Re-pointing a `where` is a row change for promotion's stamp, and T46's N913 entries keep every other row's `where` unmoved, so I left it. It is BOB's to place, for example as a T47 entry naming both sites, as record-grammar R29 does for `NO_BASIS`. I found no other flaw.

**Other modules.** None changed. The plane bundles (`bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs`) still hold C-125.33's T45 sentence: stale by this merge, regenerated at the layer's close (rule 5 (4)); I wrote neither. `filings`' tests check only the code `TEMPLATE_NOT_REVIEWED` and still pass (92/92).

**Tests and checks run.**
- `node --test test/m/filing-templates/`: tests 66, pass 66, fail 0
- `node --test test/m/filings/` (a user that passes the refusal through): tests 92, pass 92, fail 0
- `checks/format.mjs`: 159 modules, 158 requirements files; 0 failures
- `checks/architecture.mjs … filing-templates`: 12 product files, 37 relative imports; 0 failures
- `checks/coverage.mjs … filing-templates`: 29 of 29 live requirement ids named by a test; 0 failures
- `checks/ownership.mjs … filing-templates tranche/T46`: 4 files changed; 0 failures
- `checks/run.mjs` over the product: format 0, architecture 0 (2957 files), channels 0. Coverage has 29 failures, all other modules' T46 ids not yet met (rule 5 (1)); none of them is filing-templates'.
- No layer tests are named in `build/manifest.md`.

Size (session_018acpnGGGPwqinsMDvEo2a5): test runs 2, module lines 1863

## J1 · COMPLETE

T46-36 applied (R29): C-125.33 TEMPLATE_NOT_REVIEWED reads words.json's refusal.TEMPLATE_NOT_REVIEWED by key (FILING_TEMPLATES_WORDS), code, number, where and behaviour unmoved; C-125.34 kept; the other 42 rows byte-identical. New test t46-words.test.mjs (R29, three tests with controls). filing-templates 66/66, filings 92/92; format, architecture, coverage (29/29) and ownership 0 failures; run.mjs: architecture 0, coverage reds are only other modules' T46 ids (rule 5 (1)). No new file outside my paths. Plane bundles stale by this merge (rule 5 (4)). One item deferred in my own module and placed with you: C-125.4 TEMPLATE_BLANK_UNKNOWN's where names only #textRefusal, while #profileRefusal (R15) also raises it. That is a row change, so it is not in this entry's scope. Details in my record.
