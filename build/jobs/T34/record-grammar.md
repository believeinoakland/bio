# record-grammar (T34)

**Status** · session_01X5UrDpK4HmWSTEDUK3KEDX · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R46's `CALC` clause asks two things that one function cannot give: `idPattern('CALC')` "matches an opaque `CALC-` core and refuses a sequential one", and a sequential `CALC-` minted before T34 "stays valid wherever it is read". Today every reader reads through `idPattern('CALC')` (inquiry-grammar `CALCULATION_REF_RE`, strength's reference scan, calculations `CALC_RE`, connection-grammar `shape.mjs`), and ~26 test files of other modules use sequential `CALC-2026-0001`-style ids. Flipping `CALC` to opaque alone makes every one of those readers refuse a 0.80.0 copy's calculations.

My best reading (proposed; I am building R49 and the form flip meanwhile, and will build this on your answer):
1. `ID_TABLE`'s `CALC` row becomes `{prefix: 'CALC', owner: 'calculations', form: 'opaque', legacy: 'sequential'}`: `legacy` present only on a row whose form changed, naming the form still read as valid and never minted (as `STATES`' `legacy`, R35). R46's entry shape reads `{prefix, owner, form}` plus that optional key.
2. `idPattern(prefix)` stays the minting form (R47 unchanged: opaque only for `CALC`); record-core keeps minting from `form`.
3. A new provided read, `idReadPattern(prefix)`: the anchored RegExp matching an id core of the row's `form` or its `legacy` form (equal to `idPattern` for every row without `legacy`), `null` for an unknown prefix, never throws. Readers that judge a stored id re-point to it (inquiry-grammar R14, strength, calculations' reads, connection-grammar, answers' `isFigureAddress`), each in its own job; minting and the "is this freshly minted" checks keep `idPattern`.
This needs a new R (or R47 amended) worded by you, and the readers' requirements amended. Alternative if you prefer no new name: `idPattern(prefix, {read: true})`.
Until you answer, other modules' tests that build sequential `CALC-` ids through `idPattern('CALC')`-based readers will go red once my flip merges; I will name them in my REPORT before COMPLETE.

## Completion

**Entries applied (T34-1).**
- N568 → R49: `PROPOSAL_STATES` gains `law_relation`, last (after `wizard`), frozen, three sentences: a law relation, court link or treatment is proposed and is not one the record holds until a member records it themselves; machine work, labelled as machine work, can propose one and never record one (K1443). `proposalLabel`'s `RangeError` names the twelve subjects. Other tables unchanged.
- N570 → R46, R47 (as amended by K1728, answer B2 to J1): `ID_TABLE`'s `CALC` row is `{prefix: 'CALC', owner: 'calculations', form: 'opaque', legacy: 'sequential'}`; `legacy` appears on no other row. `idPattern(prefix)` matches a core of `form`, or for a row with `legacy` of either form, in one non-capturing group (`^CALC-\d{4}-(?:[a-z0-9]{16}|\d{4,})$`), so slug composition and larger alternations (strength's scan) keep their group numbering. Minting follows `form` alone (record-core's `OPAQUE_PREFIXES` reads `form`, so it now mints `CALC` opaque).

**Deferred.** None.

**Found in other modules** (also in REPORT J2). With `CALC` minted opaque, these tests (green on `tranche/T34` before this job) are red, each pinning the old sequential minting, not a reading:
- record-core `t33.test.mjs` "R76: allocId for every opaque prefix…" (pins the opaque set as five) and "R62: mintExhausted names each opaque prefix's object…" (no sentence for `CALC`; R62 needs a "calculation" sentence). T34-9's job, or a CHANGE.
- calculations `calculations.test.mjs` "R4 create's refusals in order…" (line 49 matches a fresh id against `/^CALC-2026-\d{4,}$/`). T34-27's job.
- workbooks `ops.test.mjs` "R15 workbooksOps publishes one route arm…" (an export's bytes differ: the export carries a newly minted `CALC-` id, now opaque). No T34 entry for workbooks.
- Generated artifacts made stale (mechanics §14): `bio-plane/src/case-checker/program.mjs` (bundles record-grammar; case-checker R13 was already red on the tranche branch before this job) and `agent-worker/dist/agent-worker.bundled.mjs` (carries `ids.mjs`). BOB regenerates at the layer close.
- standards still labels law proposals through `standard` (`law.mjs:312`); its switch to `law_relation` is T34-21's (N568, user side).
- With the legacy read, the readers that went red under an opaque-only `idPattern('CALC')` are green again: inquiry-grammar `t33` (5), strength `legs` (1), inquiry `held-legs` (1).

**Tests and checks.**
- `node --test bio-plane/test/m/record-grammar/`: tests 72, pass 72, fail 0.
- Layer tests: none named in `build/manifest.md`.
- Users of the changed service, sampled: connection-grammar, answers, money, public-read, case-import, hypotheses, inquiry-grammar t33, strength legs, inquiry held-legs: 0 fail; record-core 2 fail, calculations 1, workbooks 1, case-checker 1 (the last already red at base), as above.
- `node checks/format.mjs`: format: 126 modules, 125 requirements files; 0 failures.
- `node checks/architecture.mjs … record-grammar`: 25 product files, 45 relative imports; 0 failures.
- `node checks/coverage.mjs … record-grammar`: 47 of 47 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … record-grammar tranche/T34`: 0 failures.

Size (session_01X5UrDpK4HmWSTEDUK3KEDX): test runs 9, module lines 2396

## J2 · REPORT

CALC now minted opaque (record-core reads ID_TABLE's form), so tests pinning the old sequential minting are red, each green on tranche/T34 before this job: record-core t33.test.mjs R76 (opaque set pinned as five) and R62 (mintExhausted has no 'calculation' sentence for CALC); calculations calculations.test.mjs R4 (line 49 expects /^CALC-2026-\d{4,}$/ for a fresh id); workbooks ops.test.mjs R15 (export bytes carry a new CALC id; workbooks has no T34 entry). Stale generated artifacts: case-checker program.mjs (R13 already red at base) and agent-worker's bundle (carries ids.mjs). standards law.mjs:312 still labels through 'standard' (T34-21). The legacy read keeps inquiry-grammar t33, strength legs and inquiry held-legs green. Details in my record's Completion.
