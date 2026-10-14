# record-core (T48)

**Status** · session_01SKNK7kRvAXffeKRZrSeanL · depth 2 · WORKING · handled B1

## Completion (RECORD-CORE #23)

**Read, whole:** `build/requirements/record-core.md` (public and private); the public parts (Purpose, Provides) of `record-grammar`, `id-spaces` and `test-support`; `build/layers.md` whole (layer 2's contract among it); my entry in `build/plan/current.md` (T48-8) and its rules at the opening; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every file under my `tests` paths (`record-core.test.mjs`, `t33.test.mjs`, `t35.test.mjs`, `t46.test.mjs`, `t47.test.mjs`, `storage.mjs`, `stats-disclosure.test.mjs`) (P20).

**Applied (T48-8):**
- R62 (N1018, K3112): `mintExhausted("WCD")` answers "your group's Civicsmith could not find a free id for a draft of a new edition's statement of what changed: every one it drew was already taken. Nothing was written." `mintExhausted("OUTC")` answers the same with "carried outcome id". Each sentence is distinct from every other prefix's. `CASE`'s sentence and every other prefix's are unchanged, and the row C-59.6 is unchanged. `case-inputs` already calls `mintExhausted` with both prefixes (`case-inputs/index.mjs`:255, :401), so its answers now name the object with no change on its side. `WCD`'s object is a phrase, so it is placed after "id for", in its own small map (`MINTED_ID_FOR`). The other prefixes keep their "<object> id" form.
- (N1052) `stats-disclosure.test.mjs` signs in by `{handle, password}` (credentials R67), clearing its K3192 red: 31 pass, 0 fail (it was 0 pass, 1 fail at the START).

**Deferred:** nothing. I found no flaw in my module. I corrected two comments in `index.mjs` that list which prefixes R62 names.

**Other modules:** none found wanting. Generated artifacts: this merge stales the plane bundle and `program.mjs` (rule 5 (5), regenerated at the layer's close). I wrote none.

**Tests and checks:**
- `node --test bio-plane/test/m/record-core/`: tests 181, pass 181, fail 0. The new `t48.test.mjs` holds three R62 tests: each new sentence and its distinctness; the control (`CASE`'s and every other prefix's sentence unchanged, and look-alike prefixes unnamed); and the condition as `case-inputs` meets it (64 collisions, nothing written, `extra` never replacing the sentence).
- `node bio-plane/test/stats-disclosure.test.mjs`: 31 pass, 0 fail.
- `mintExhausted`'s users: case-inputs, case-authoring `identity`, tasks `ledger` and `inbox`, review `acts` and `invariants`, case-account `drafts`, sources `contract`, promotion `promote`: 142 tests, 142 pass.
- No layer tests are named in the manifest.
- `checks/format.mjs`: 168 modules, 167 requirements files, 0 failures.
- `checks/architecture.mjs … record-core`: 0 failures.
- `checks/coverage.mjs … record-core`: 84 of 84 live ids named, 0 failures.
- `checks/ownership.mjs … record-core tranche/T48`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 (3260 files), channels 0. Coverage has 28 failures, all in other modules' T48 ids (rule 5 (1)) and none in record-core.

Size (session_01SKNK7kRvAXffeKRZrSeanL): test runs 7, module lines 2379
