# bias (T35)

**Status** · session_019zdNUsk54fCyiEu7YX6E5x · depth 2 · WORKING · handled B1

## Completion

**Entry applied: T35-36** (N682, DEC-149 sweep, 2 rows; K1833, K1941).
- `index.mjs`:469–470 (R16): each `lock_violations` entry's detail now reads "a project override naming a LOCKED group statement is a conformance error; the group statement stands".
- `index.mjs`:554–556 (R24): `interactions_stated` now says "a group statement" and "addressing the group statement", word for word as R24 quotes it.
- C-26.2's translation (`checks.mjs`, `BIAS_STATEMENT_SUBJECT_NOT_REGISTERED`): "a project statement and an instance statement" → "… and a group statement". The term was split across two lines, so the opening's grep missed it; the entry names "checks" too.
- The stored and wire scope value `instance` is unchanged, as are the field names `instance_bundle` and `interactions[].instance`. Code and schema comments keep the old word under DEC-149's X rule. The one exception is the R24 comment beside the changed string, re-worded to match.

**Also fixed in this module (a DEC-149 row the sweep missed; worded under BOB's delegated M rule, BOB's review (1)):** R11's group-scope refusal, sent through `membership.notAnAdmin`, said "the whole instance" in its act and its remedy. `INSTANCE_ADOPTION_ACT` now reads "adopting a bias set for the whole group". `INSTANCE_ADOPTION_REMEDY` ends "… ask an administrator to adopt it for the whole group." The constant names stay. No other module's test pins these strings (grep).

**Kept as the sweep classed them (X):** `index.mjs`:303, "The plane takes the name from the session" (it names ops), and the schema comments at :48 and :85.

**Tests:** new `test/m/bias/dec149.test.mjs`, with five tests:
- R16 and R24: each sentence is named whole, through the method and through the op.
- R11: the act, the remedy, and the `notAnAdmin` answer's detail and message.
- R29: C-26.2's translation is named whole, and no C-26 translation carries a retired word.
- R16, R24, R26: no manifest, adoption, inhale, draft or debt answer carries a retired word.
- Negative control: against the old source all five fail (0 pass, 5 fail).

The R16, R24 and R26 titles in `adopt-manifest.test.mjs` are re-worded. R26 stays `test.todo` under its own deferral (K102).

**Deferred:** none.

**Found in other modules (REPORT J2):**
1. control-plane `rows-before-r43.json` pins C-26.2's translation digest (`BIAS_STATEMENT_SUBJECT_NOT_REGISTERED`: `34a21a493da8de0f` → `f10fde3b4d80b59b`). `catalogue-end.test.mjs` is already red (red 19) and stops at its first difference, so this adds C-26.2 to the rows T35-72 re-pins, no new red. The row also awaits stamp under red 2.
2. The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, §14, `not_product`) embeds `src/bias/` and is now stale until L5's close regenerates it.

**Tests and checks run:**
- `node --test test/m/bias/` (from `bio-plane/`): tests 68, pass 67, fail 0, todo 1 (R26).
- `node --test test/m/control-plane/catalogue-end.test.mjs`: pass 1, fail 1, both before and after the change (red 19).
- `checks/format.mjs`: 130 modules, 129 requirements files; 2 failures. Both are `law-relations` paths and tests entries, accepted red 24.
- `checks/architecture.mjs bias`: 12 product files, 42 relative imports; 0 failures.
- `checks/coverage.mjs bias`: 48 of 48 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bias tranche/T35`: 5 files changed by bias; 0 failures.

Size (session_019zdNUsk54fCyiEu7YX6E5x): test runs 5, module lines 1916

## J1 · REPORT

Two findings outside bias, from T35-36. (1) control-plane rows-before-r43.json pins C-26.2's translation digest. BIAS_STATEMENT_SUBJECT_NOT_REGISTERED moves 34a21a493da8de0f → f10fde3b4d80b59b, because its translation said "an instance statement" split across two lines. catalogue-end.test.mjs is already red (red 19) and stops at its first difference, so this adds C-26.2 to T35-72's re-pin list without a new red. (2) The plane bundle (§14) embeds src/bias/ and is stale until L5's close regenerates it. Also done in bias, under BOB's review (1) M rule: R11's NOT_AN_ADMIN act and remedy said "the whole instance" (a row the sweep missed) and now say "the whole group". No other module's test pins those strings.

## J2 · COMPLETE

T35-36 applied. R16's lock_violations detail and R24's interactions_stated say "group statement", word for word as the requirements quote them. C-26.2's translation is re-worded the same way. R11's act and remedy now say "the whole group". The scope value instance and the field names are unchanged. New test/m/bias/dec149.test.mjs names each string; it fails 5 of 5 on the old source. bias tests: 67 pass, 0 fail, 1 todo (R26, deferred by K102). Checks: architecture 0, coverage 48/48, ownership 0; format 2 failures, both red 24 (law-relations). Record committed on job/T35/bias @ f9dc8e210d.
