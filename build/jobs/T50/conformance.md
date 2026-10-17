# conformance (T50)

**Status** · session_01A6uUMNWkd555swANVn8caL · depth 2 · COMPLETE · handled B2

## Completion (T50-76)

**Entries applied**
- **R40** C-113.6 `NO_FINDINGS` now reads `refusal.NO_FINDINGS` by key through `setup-words`' `word`. `CONFORMANCE_WORDS` is built from `word()` for seven keys (that one and R38's six), so no row holds a copy of its sentence. Found at the baseline: the six R38 rows' copies said "group", and `words.json` now says "team" (D29), so the existing t46 tests were red before any change of mine. Reading all seven by key fixes that too. Code, number, `where`, order and behaviour of the rows are unmoved. The changed rows ride T51's stamp (plan rule 5 (2)).
- **R41** an accepted finding's `basis` answers `matter_stake` from `case-import.importedCase`'s `group_fields.matter_stake`, as answered: `null` when the source recorded none, `"undetermined"` when `identity` and `stake` are `null` and `"undetermined"` for want of recorded fields. Labeled by the same `identity_label` as `stake`. A published or held finding's basis carries no `matter_stake`.
- STANDARDS #15 J1 (K3677): `t36.test.mjs`:55 now asserts the sentence of key `standard.inforce.known` (`word(key, {through, source, author})`), no longer standards' old wording.

**Deferred** None.

**Found in other modules** (each red at the base too: stashing my change leaves the same counts)
- `consequences` tests R25 (2 fail), `escalation` (3 fail: R30 and R31/R33 and the words test R33), `filings` (3 fail: R51, R52 twice), `action-plans` (2 fail: R47 twice): the same drift of a module's keyed-words table against `words.json` ("group" → "team" and new keys), each for that module's own T50 job. `actions`, `action-clocks`, `plan-work` pass.
- `SOURCE_DECLARATION_SAYS` and `SOURCE_FACTS_UNRECORDED` (this module, R39's labels) are inline English and say "group"; no key holds them. Not in my entries; a REPORT for a UX key, not changed (rule 6).
- Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundles `conformance`), BOB regenerates at layer close.

**Tests and checks**
- `node --test bio-plane/test/m/conformance/`: tests 119, pass 119, fail 0, skipped 0 (new: four R41 tests in `t47.test.mjs`, R40 rewritten in `t46-words.test.mjs`; `t45` basis updated for R41).
- `checks/format.mjs`: 171 modules, 170 requirements files; 0 failures. `checks/architecture.mjs conformance`: 18 product files, 77 relative imports; 0 failures. `checks/coverage.mjs conformance`: 41 of 41 live requirement ids named by a test; 0 failures. `checks/ownership.mjs conformance tranche/T50`: 0 failures.

Size (session_01A6uUMNWkd555swANVn8caL): test runs 6, module lines 2769

## J1 · COMPLETE

T50-76 conformance complete. R40: C-113.6 reads refusal.NO_FINDINGS by key; R38's six rows also now read by key via setup-words word() (their copies said 'group', words.json says 'team', so t46 was red at the baseline). R41: accepted basis answers matter_stake (null / 'undetermined' as specified). t36:55 asserts key standard.inforce.known. Module tests 119/119; format, architecture, coverage (41/41), ownership 0 failures; checks/run.mjs shows no conformance failure (30 coverage failures are other modules'). Found elsewhere, red at base too: consequences R25 (2), escalation R30/R31/R33 (3), filings R51/R52 (3), action-plans R47 (2): the same words.json drift in their own tables. Stale artifact: bio-plane/dist/bio-plane.bundled.mjs. REPORT-worthy: SOURCE_DECLARATION_SAYS and SOURCE_FACTS_UNRECORDED are inline English saying 'group' with no key. Details in build/jobs/T50/conformance.md.

## Completion again (B2 CHANGE)
`SOURCE_FACTS_UNRECORDED` and `SOURCE_DECLARATION_SAYS` now say "the source team's" (identifiers unchanged; still inline until the design lane keys them). No test pinned the old text. Module tests 119/119; format, architecture, coverage (41/41) and ownership 0 failures.

## J2 · COMPLETE · re B2

B2 applied: both labels say 'the source team's'. Tests 119/119; format, architecture, coverage 41/41, ownership 0 failures. Pushed.

## Completion again (B3 CHANGE)
`SOURCE_FACTS_UNRECORDED` reads `case-import.group_fields_none` and `SOURCE_DECLARATION_SAYS` reads `case-import.group_fields_label`, each by `word(key)` (DEC-328 (6)); `t47.test.mjs` asserts each by key and that neither says "group". Module tests 119/119; format, architecture, coverage (41/41) and ownership 0 failures.
