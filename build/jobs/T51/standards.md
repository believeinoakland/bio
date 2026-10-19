# standards (T51)

**Status** · session_01GMf4vYSoxxQorhQmm2FhQa · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T51-204 · standards: the words check's findings are fixed (B1, layer 5 re-run, K3949, K3957, K3958).

**Entries applied**
- Inline (`words-pass/standards.md`, 6 lines):
  - `checks.mjs` STANDARD_PROPOSER_UNNAMED's translation reads its refusal row, `word('refusal.STANDARD_PROPOSER_UNNAMED')` (the row already holds the sentence; the table wins).
  - `index.mjs` proposal "stored with no captured text" sentence → `localize('standards.index.proposal_stored_no_text', …)`.
  - `index.mjs` cited-by refusal detail → `localize('standards.index.cited_by_names_where_cited', …)`.
  - `index.mjs` period_basis refusal "'s {side} is a held passage…" → `localize('standards.index.side_is_held_passage', …, { side })`.
- Plain (4 lines, each judged a sentence a member reads; none left unjudged, no REPORT needed):
  - `standards.index.no_source_matches_citation` (line ~302), `standards.index.sources_disagree_none_chosen` (~308), `standards.index.period_starts_after_captures` (~744), `standards.index.documents_cite_it_as_stated` (~1540).
- `localize` takes one string literal per call (setup-words build reads it), so each multi-line sentence is one literal on one line. Wording, codes, shapes and behaviour unchanged.
- Commit `4c43e67e3f` on `job/T51/standards`, pushed.

**Deferred:** nothing.

**Found in another module:** none in code I read for the job. Forward-looking note, not a current flaw: `index.mjs` `#eventDay` relays `events`' `when` reason with `String(w.why)`. Today events answers a string, so this is correct. When events' CR-7 makes that reason `{key, vars}`, this line must pass it through as given (not `String`), or the sentence reads "[object Object]". Mine to change then; noting it so CR-7's job knows.

**R48 tests (K3958).** `reads.test.mjs` "R48 neighbours…" and "R48 … registers once at load…" are green on this tree. They read civil-time's `why` as truthy only, which a `{key, vars}` satisfies. The relay of civil-time's `why` in R20 (`#versionAtPeriod`) already passes it through as given. No change needed there.

**Tests and checks run**
- `node --test test/m/standards/*.test.mjs` (bio-plane): before and after the edits, `tests 104, pass 104, fail 0`.
- `node checks/run.mjs /home/user/bio` (civicos-process): `format: 175 modules, 174 requirements files; 0 failures`; `architecture: 3617 product files, 12043 relative imports (36 naming no tracked file, not judged); 0 failures`; `channels: 2 participants, 1051 outbox commits read; 0 failures`. `coverage: 174 modules, 5929 of 6060 live requirement ids named by a test; 30 failures`, none in standards. The words check's totals are repo-wide (3791 failures in other modules; `standards` none, in `src/standards/` or `test/m/standards/`). The exit is 1 for those repo-wide failures, not from this module.
- `node bio-plane/src/setup-words/build.mjs --check`: a stale-rows note, expected (rows regenerate at layer close): `rows.mjs is stale: word 19608 (standards.index.cited_by_names_where_cited)`. Not a refusal. No refusal names `standards`.
- `node checks/ownership.mjs /home/user/bio standards tranche/T51 job/T51/standards`: `1 files changed by standards between tranche/T51 and job/T51/standards; 0 failures`.

**Attribution note:** the commit message omits the Co-Authored-By line naming the model (the Model identity rule forbids model identifiers in commits); the Claude-Session line is kept.

Size (session_01GMf4vYSoxxQorhQmm2FhQa): test runs 2, module lines 3570

## J2 · COMPLETE

K3992 (CHANGE B2) done: events' `when` reason is passed on as given.

- `index.mjs` `#eventDay`: a reason events gives as `{key, vars}` returns unchanged; a string reason still reads through `standards.why.event_record_read`. Same change in the bounds relay (`standards.bounds`), the override reason (`standards.why.overrides_portion_whether`) and the undetermined branch of `#versionAtPeriod`, where a keyed bound reason is returned as given (this also covers civil-time's keyed `why` in the overrides path, which `String()` would have stringified).
- Test added: `inforce.test.mjs` "K3992 a reason events gives as {key, vars} reaches inForceAt as given" (keyed reason returned by deepEqual; a plain string reason still matches its sentence).
- Commit `9994d2b84b`, pushed to `job/T51/standards`.

Tests: `node --test test/m/standards/*.test.mjs`: tests 105, pass 105, fail 0.
Checks (`node checks/run.mjs /home/user/bio`): format 0 failures; architecture 0 failures; channels 0 failures; coverage 30 failures, none in standards; words: no finding in `src/standards/` or `test/m/standards/` (repo-wide 3791 failures are other modules'). Ownership (`standards tranche/T51 job/T51/standards`): 3 files changed by standards, 0 failures. `setup-words --check`: the expected stale-rows note for `standards.index.cited_by_names_where_cited` only.

Size (session_01GMf4vYSoxxQorhQmm2FhQa): test runs 4, module lines 3570
