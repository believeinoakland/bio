# standards (T8)

**Status** · session_01UmVjw9n9gtCPtw463X9hRc · depth 2 · WORKING · handled B2

## J1 · QUESTION

Four readings; I am building on each now and will bring the work in line with your answer.

1. **Refusal family.** standards' refusal rows are a family of its own in `src/standards/checks.mjs` (K174's pattern). C-111 is intent's highest; C-112 onward is unused on `tranche/T8` and on every layer-9 job branch. My reading: **C-112 `STANDARDS_CHECKS`** (standards being first in layer 9). Six jobs mint families at once, so please assign (or confirm) mine.
2. **R3 "a withheld fact (jurisdictions R15)".** `combine` unions `standard_sources` (R14) and never withholds an entry, so no R15 conflict can reach R3 from that section. My reading, per R15's "never chooses between profiles that disagree" and the Suggestions' "two profiles that disagree (withheld, so undetermined)": when entries from **different profiles** match the citation and differ in `source`, `kind`, `issuer` or `level`, the answer is `source: undetermined`, its why naming both. Two matches from one profile take the first (the profile's own order), and matches that agree take the first. `combine` answering `ok: false` (a profile no longer held or invalid) is also undetermined.
3. **R5 "any id for a viewer naming no member".** My reading is membership R43's rule, through `inSight`. A member sees every standard (a bundle outside any project); a machine credential and the founder's `admin` see it too; any other viewer (none, malformed) gets `NO_SUCH_STANDARD`. The same gate applies to `standardsIn`, and to `standardAdopt`'s proposal lookup.
4. **R11 at the write.** To hold "the only writers of a standard are R1 and R10", standards registers a promotion step (R39) refusing a `standard`-type promotion not made by its own acts: a raw `op=promote` of a `STD-` bundle, or any revision, is refused with a new code `STANDARD_WRITTEN_ELSEWHERE` in my family. A replay (restore) is admitted.

## J2 · REPORT

**standards' Provides are built and tested; ready for the early merge (K248).** Branch `job/T8/standards` @ c25cec140c. `bio-plane/src/standards/` (`index.mjs`, `checks.mjs` C-112.1–.19 `STANDARDS_CHECKS`, 18 rows (C-112.11 unused), `schema.mjs`); tests `bio-plane/test/m/standards/` 16/16 (every live id R1–R15 named; format, architecture, coverage and ownership clean). The factory is `standardsOf(host, deps)` (deps: `record`, `membership`, `promotion`, `content`, `combine`, `now`). At creation it declares its four tables to purge and registers one promotion step (`standards`, a check only: R11). It touches no legacy module.

The exact answer shapes (every refusal is `{ok: false, reason, code, check, translation, detail, ...}`):

- **`standardRead({id, viewer})`** → `{ok: true, id, cite, kind, issuer, text: [content ids], period: {from, to}, source, declared_by, declared_at, supersedes, superseded_by, proposal, texts: [{content_id, standing, newer}], says}`. `period`'s bounds are `YYYY-MM-DD` or null; `superseded_by` and `supersedes` are a standard id or null; `standing` is `content.standings`' entry, and `newer` is `content.passageNotice`'s answer for that viewer. The refusals are `NO_ID` (row-less, see below) and `NO_SUCH_STANDARD`; the latter also answers a viewer R43 admits to nothing, including a null viewer. **FILINGS #1's reading is confirmed**: it is a subset of this answer.
- **`inForce(id, date)`** → `{ok: true, id, date, state, why}`, `state` one of `in_force`, `not_in_force`, `undetermined`; refusals `STANDARD_DATE_INVALID`, `NO_SUCH_STANDARD`. No viewer: it is an internal read. **FILINGS #1's `{state, why}` is confirmed**, with `ok`, `id` and `date` beside them. Bounds are inclusive.
- **`standardsIn({at, kind, source, cite, after, limit, viewer})`** → `{ok: true, items, count, limit, truncated, cursor}`, plus `at` and `says` when `at` is given. Each item has standardRead's fields without `texts` and `says`, and with `in_force: {state, why}` when `at` is given. `cursor` is the last id when truncated, else null. `source` filters on the matched source's name, or on `"undetermined"`; `cite` is a case-insensitive substring.
- **`standardDeclare({cite, kind, issuer, text, period?, supersedes?, author, viewer})`** → standardRead's fields without `texts` and `says`, plus `bundleSha`.
- **`standardPropose({cite, kind?, issuer?, text?, why, act?, proposer, viewer})`** → `{ok: true, proposal: {id, cite, kind, issuer, text, why, act, at, by, state, machine_work, says, adoption: null}, standard: false, says}`. The proposal id is `STDP-<year>-NNNN`.
- **`standardAdopt({proposal, author, viewer, ...R1's fields})`** → standardDeclare's answer plus `adopted: {proposal, from_proposal: [fields], says}`.
- **`sourceOf(cite, {kind, issuer})`** (R3, also public) → `{state: "matched", source, kind, issuer, level, profile, basis, differs?}` or `{state: "undetermined", why, disagreeing?}`.
- Constants: `STANDARD_KINDS` (jurisdictions' `SOURCE_KINDS`), `IN_FORCE_STATES`, `PAGE_MAX` 200, `CITE_MAX` 200, `WHY_MAX` 240. Pure helpers: `isDate(v)` and `inForceAt(period, date)`.
- Ops (`standardsOps(s, url, body)`): `standarddeclare`, `standard`, `standards`, `standardinforce`, `standardpropose`, `standardadopt`.

**For layer 11 (legacy-index, affordances):** nothing routes these ops yet. The legacy-index job adds their routes, stamping `author` and `proposer` in the body and `viewer` in the URL, and affordances publishes them. Legacy-store needs no dispatch entry for them, and I made no change there.

**Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is not stale yet, since nothing the plane loads imports `src/standards/`. It will be once legacy-index routes the ops.

**Two refusal codes differ from R1's and R5's text; please fold them into the requirements (K238's precedent: codes are interface detail, and no meaning changes).** The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`, arm G) keys a row by its code across every family:
- R1's `MACHINE_CANNOT_DECLARE` is already strength's row (`STRENGTH_BAR_CHECKS`), for a different condition. Mine is **`MACHINE_CANNOT_DECLARE_STANDARD`** (C-112.1).
- R5's `NO_ID` is the generic code that content, inquiry, publication and strength mint row-less (the catalogue's REC-64 rule, K163). A row in my family would have claimed all their sites, so **`NO_ID` stays row-less** here too, with the same code. C-112.11 is left unused so no row is renumbered.

**For legacy-tests (layer 11):** `check-refusal-codes.mjs` has the same 115 FAIL lines as base (`tranche/T8` @ 9ca625cb29). Its ratchets grow by my 18 new rows: `rows` 636 → 654, `census` 924 → 942, `reach` 672 → 690 (floors 633 / 919 / 668, already slack on base). Re-pin from its print. `hygiene` 1333/2, `refusal-wire` 37/6, `machinefences-dec49` 80/4 and `machine-fences` 80/9 are identical to base.

## Completion

**Entries applied.**
- Built per its requirements (map: nothing moves; K171 (3), (12)).
  - `bio-plane/src/standards/`: `index.mjs` holds `standardsOf(host, deps)`, the services R1–R10, `sourceOf` (R3), `standardsOps` and the registered check (R11). `checks.mjs` is the C-112 family (K248, 18 rows). `schema.mjs` holds the tables `standards`, `standard_texts`, `standard_proposals` and `standard_adoptions`, append-only and declared to purge (R14).
  - A standard is a `STD-<year>-NNNN-<kind>` bundle of type `standard`, promoted outside any project (R15, K171 (12)); its bundle audits clean.
  - No legacy module was touched.
- R3's source `level` is read from jurisdictions R23/R31 (N130), `undetermined` when an entry states none.
- R9's label is `proposalLabel(proposer, "standard")` (N129).
- BOB's answers to J1 (B2, K248), all four readings standing:
  - R3: profiles that disagree answer undetermined.
  - R5: the viewer gate is membership R43 through `inSight`.
  - R11: the step `STANDARD_WRITTEN_ELSEWHERE`, replays admitted.
  - The family is C-112.
- My own readings, stated in the code:
  - R2: a text passage whose document the viewer may not see is answered as not held.
  - R7: period bounds are inclusive.
  - R8: `source` filters on the matched source's name, or on `undetermined`; `cite` is a case-insensitive substring.
  - R10: a field the adopting member does not state is the proposal's, and the answer names which fields were.
  - R12: each act refuses an unknown field by name (`STANDARD_FIELD_UNKNOWN`).

**Deferred.** None of this module's work. Two codes differ from R1's and R5's text for the DEC-49 guard; BOB is asked to fold them (REPORT J2): `MACHINE_CANNOT_DECLARE_STANDARD`, and a row-less `NO_ID`.

**Found in other modules / stale artifacts** (REPORT J2):
- legacy-index and affordances route and publish the six ops.
- legacy-tests re-pins the `check-refusal-codes` ratchets (rows, census and reach each +18).
- No generated artifact is stale yet.

**Tests and checks.**
- `node --test bio-plane/test/m/standards/`: tests 16, pass 16, fail 0, todo 0 (`declare` 6, `read` 3, `proposals` 2, `invariants` 5).
- Negative controls, each failing only the tests it should, each restored green:
  - R11's check off: R11 and R4 fail;
  - the profile-disagreement rule ignored: R3 fails;
  - the `at` filter off: R8 fails;
  - the text sight test off: R2 fails;
  - the `to` bound ignored: R7 fails.
- Old battery against base (`tranche/T8` @ 9ca625cb29):
  - Identical: `hygiene` 1333/2, `refusal-wire` 37/6, `machinefences-dec49` 80/4, `machine-fences` 80/9.
  - `civicos-ui/check-refusal-codes.mjs`: 115 FAIL lines on both. Only the ratchet figures grow with the new rows.
- format: 69 modules, 64 requirements files; 0 failures. architecture: 8 product files, 27 relative imports; 0 failures. coverage: 15 of 15 live requirement ids named by a test; 0 failures. ownership: 9 files changed by standards; 0 failures.

Size (session_01UmVjw9n9gtCPtw463X9hRc): test runs 14, module lines 781
