# connections (T19)

**Status** · session_01VkAjFUNEhmF9vLV9YVG7uK · depth 2 · COMPLETE · handled B1

## Completion (CONNECTIONS #7)

**Entries applied** (`build/plan/current.md` L5 connections, kept; `draft-T19.md` L5; B1):
- **R35, R46, the catalogue share:** C-49 `CONNECTION_PAIR_CHECKS`, C-81 `THEME_CHECKS`, `THEME_ID_RE`, `THEME_REF_RE`, `THEME_LEG_KEYS` and `themeLegFindings` copied into `src/connections/checks.mjs` beside C-74, line for line with their comments. `themeLegFindings` keeps its own `refusal`, over a copy of the catalogue's finding shape `f`. Codes, numbers and translations are unchanged. Each `where` names its site in this module: only C-81.1's moved, to `src/connections/checks.mjs themeLegFindings > is-theme-not-evidence`; the others already named connections' files. `index.mjs` re-exports all of them, adding `THEME_REF_RE` and `THEME_LEG_KEYS`, for inquiry-grammar and action-grammar. The catalogue keeps its copy for its own leg grammars (inquiry-grammar deletes it in L6).
- **Rule 1, re-points:**
  - `index.mjs` reads `isMachineIdentity` and `MACHINE_CLASS_PREFIX` from record-grammar `actors.mjs`, `parseFrontmatter` from `frontmatter.mjs` and `sha256HexSync` from `sha256.mjs`, and the C-49/C-81 names from `./checks.mjs`. Its `BUNDLE_ID_RE` import was unused and is dropped.
  - `pair.mjs` reads C-49 from `./checks.mjs`.
  - `themes.mjs` reads `actors.mjs`, `ids.mjs` (`BUNDLE_ID_RE`) and `./checks.mjs`.
  - `converts-links.test.mjs` reads `parseFrontmatter` from record-grammar, and `checkBundle` from record-grammar's `bundle.mjs` with `{grammars: []}`. The `links_to` arm it asks about is record-grammar's structural C-6.1, which runs with no grammar registered, so no legacy grammar is needed.
  - `derive.test.mjs` reads `LISTENER_MALFORMED`/`LISTENER_DECLARED` from membership's `MEMBERSHIP_CHECKS`. Its vacuous `if (row)` arms are now unconditional assertions, and both hold.
  - `read.test.mjs`' dynamic catalogue import and its C-74 absence arm are dropped.
  - No connections file, product or test, imports `bio-checks.mjs`.
- **K785:** the catalogue's empty `REGISTRATION_CHECKS` export and its C-102 header are deleted (legacy-checks −38/+0). `derive.test.mjs` was its last importer; the remaining mentions are comments and the old guard's strings.
- **R60:** `Connections#counts(hid)` answers `connections` and `connectionPairChoices` (keyed on `a_bundle_id` and `b_bundle_id`, `COALESCE` as the store's `nx`) and `connectionDirty`, `themes` and `themePlacements` (whole, as the store takes them today). It is synchronous and writes nothing. `connectionsOf` registers them once at start through `record.registerCounts("connections", CONNECTIONS_COUNT_KEYS, …)`, and a refusal throws. The store's own five literal lines stay for legacy-store's job (R60), as content's did.
- **The one store delegation:** `Store#citesInto` is deleted. Its one caller, `#retirementCitedBy`, calls `connectionsOf(this.ctx).citesInto(id)` (legacy-store +1/−4, the added line using the imported name).

**Copied unchanged, measured** (a scratch sweep, not committed, so that no test imports the catalogue inquiry-grammar empties): over 205 leg shapes, the copy's `themeLegFindings` gave the catalogue's answer and findings in 205 of 205. C-49's and C-81's codes, checks and translations are identical, and so is `THEME_ID_RE`; the only `where` that differs is C-81.1's.

**Rs met, with their tests (for BOB to strike):**
- R60: `figures.test.mjs`, four "R60: …" tests.
- R35, R46 (T19's share): `figures.test.mjs`, "R35, R46 (T19): …" and "R46 (T19): …".
- The refusal arms stay in `read.test.mjs`, `converts-position.test.mjs` and `themes.test.mjs`.

**Deferred:** nothing.

**Found in other modules (REPORT):**
1. **For inquiry-grammar's deletion of the catalogue's C-49/C-81 copy (L6):** besides the catalogue's own grammars, three old suites still import it.
   - `bio-plane/test/reading-position.test.mjs`:68 and `reading-position-occurrences.test.mjs`:45 (`CONNECTION_PAIR_CHECKS`; legacy-tests).
   - `civicos-ui/test/themes.test.mjs`:76 (`THEME_CHECKS`; legacy-ui).
   - Connections exports the same rows. The `bio-plane/src/gate.mjs`:275 mention is a comment.
2. **legacy-tests' DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`, an old suite; run read-only, base 157 failures, this branch 176), the same transient shape content's C-45 copy left:
   - the 14 copied codes are "defined TWICE" until L6;
   - `THEME_NOT_EVIDENCE` is at two mint sites (arm G);
   - the catalogue's `is-theme-not-evidence` region is now claimed by no `where`;
   - census 1259 → 1260, and families 121 → 120 (the empty `REGISTRATION_CHECKS` gone).
   - These clear when inquiry-grammar deletes the catalogue's copy, or legacy-tests re-pins them.
3. **legacy-store (L10):** it will delete `#counts`' five literal lines (`connections`, `connectionPairChoices`, `connectionDirty`, and the proof-only `themes`, `themePlacements`) and their `d(…)` echoes in purge, which the registered figures now give identically. `store.mjs`:366's comment still names `#citesInto`.
4. **Generated artifact staled:** `bio-plane/dist/bio-plane.bundled.mjs` (inputs `src/connections/*`, `src/store.mjs`, `checks/bio-checks.mjs`), for the layer close's regeneration.

**Tests and checks:**
- `node --test bio-plane/test/m/connections/`: tests 102, pass 102, fail 0 (start: 96).
- The tests of every module using connections, plus legacy-store and record-core (`test/m/` of progressions, observation-log, retrieval, inquiry, basis-versions, ai-runs, run-productions, reevaluation, publication, ratification, actions, scheduler, affordances, tasks, queue-producers, queue, control-plane, legacy-store, record-core), on this branch and on its base (`811b037a30`, a worktree without my changes): 1,277 pass and 206 fail on both, the same failing set. None is added; all are in modules not yet merged this tranche.
- `format`: 87 modules, 0 failures. `architecture connections`: 18 product files, 0 failures. `coverage connections`: 60 of 60 live ids. `ownership connections tranche/T19`: legacy-store 1 added, 4 removed; legacy-checks 0 added, 38 removed; 0 failures.

Size (session_01VkAjFUNEhmF9vLV9YVG7uK): test runs 7, module lines 2658
