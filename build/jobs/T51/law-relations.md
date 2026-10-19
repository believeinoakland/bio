# law-relations (T51)

**Status** · session_01WUaDP43x71LajSMPAd7ZrS · depth 2 · WORKING · handled B2

## J1 · COMPLETE

Entry T51-197 (words, the four words-check findings and two plain findings in `build/plan/words-pass/law-relations.md`) is applied in commit b3a28d3893 on `job/T51/law-relations`, after merging `tranche/T51` (merge 1082344d24).

**Applied**
- `index.mjs` (inline, 4 findings, one per site): the temporal-effect refusal detail → `localize("law-relations.index.no_effective_detail", …)`; the referential-set note of `lawRelationsOf` → `localize("law-relations.index.says_kept_apart", …)` (this also clears the plain finding at :339); the no-viewer `why` of `neighbours` → `localize("law-relations.index.read_names_member", …)` (the same sentence is copied in `duties` and `hypotheses`; I did not hand-reference their keys, K3268); the court-standards note → `word("law-relations.why.first_court_standards", {scan_max})` (an existing row; the `{}` placeholder was a template literal); the citation-lookup note → `word("law-relations.says.keyed_citation_lookup")` (existing row, same sentence; this clears the plain finding at :627).
- Undetermined in-force reason (K3958, R7 / R7-R12 red since CR-1): `neighbours` now passes civil-time's keyed `why` `{key, vars}` on as is, and its fallback is `{key: "law-relations.why.undetermined_date_asked", vars: {}}` (an existing row for "undetermined at the date asked", the copy finding at :672). The `catch` around `validAt` used to put the exception's text into `why`; it now sets an undetermined answer with no reason, so the keyed fallback applies. A developer message no longer reaches `why`.
- `test/m/law-relations/reads.test.mjs` (R7 / R12 case): the assertion on `undetermined.why` now checks it is keyed (`.key` a string) rather than a string. This is the keyed-reason change BOB asked for, not a weakened test.
- No new requirement id, no change to any other module, no generated artifact edited.

**Deferred:** nothing in my module.

**Found in another module:** nothing to report. The whole-product words check run (`checks/run.mjs`) shows failures in other modules, all outside this job.

**Tests and checks**
- `node --test bio-plane/test/m/law-relations/*.test.mjs`: before my change 25 pass, 1 fail (R7 R12, the keyed reason); after: 26 pass, 0 fail.
- `node checks/words.mjs /home/user/bio law-relations`: 0 failures (was 6).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage line for law-relations shows no finding (21 of 21 live ids named by a test; `checks/coverage.mjs`: 0 failures). The product-wide words line shows 3,795 failures in other modules; none name law-relations.
- `node bio-plane/src/setup-words/build.mjs --check`: exit 1 with one stale-rows note naming `law-relations.index.no_effective_detail` (expected: the new ids are not in `rows.mjs` until BOB regenerates it at the layer close; `localize` answers the English meanwhile). It names no refusal.
- `node checks/ownership.mjs /home/user/bio law-relations tranche/T51 job/T51/law-relations`: 1 file changed by law-relations, 0 failures.
- `node checks/architecture.mjs /home/user/bio law-relations`: 0 failures.

Size (session_015HSCTTafg8KGt1DUeEh3D1): test runs 2, module lines 936
