# membership (T36)

**Status** · session_01Kozvc5CabUVjWrHpUnjz1Z · depth 2 · WORKING · handled B0

## Completion

**Entry applied: T36-6 (N723).** `MODULE_ORDER` (`bio-plane/src/membership/index.mjs`) re-pinned to `build/modules.json` in the file's places: `file-scanner` after `sheet-worker` (layer 1), `file-safety` between `capture` and `sources` (layer 3), `law-relations` between `observation-log` and `standards` (layer 5), `op-grades` between `wizard-scripts` and `affordances`, and `answer-envelope`, `store-door` between `admission` and `control-plane` (layer 11). The list now equals the file: 135 ids, same order. Red 3 is cleared (module-order, promotion `registry.test.mjs`, standards `reads.test.mjs` green). R83's text is unchanged; its `*(not yet met: T36)*` mark is BOB's to strike. The comment above the list, which at the opening claimed every module was held, is now true.

**Tests changed** (`test/m/membership/module-order.test.mjs`): a new test, "R83 T36-6", pins each of the six names between both its neighbours and in its layer. T33-19a's pin of layers 1 and 5 now leaves out the modules added since T33, so it still holds T33's order. `file-safety` (empty `paths` until T36-11) is tolerated as not yet built, by name (`T36_NEW`); the test names it in its diagnostic.

**Red 14 (K2084): traced and reported, not re-pinned (J1).** The D-57 arm (`members.test.mjs`:124–126) reads `credentials`' `LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED`. Its "your group's Civicsmith" (T35-15, `a767b78ddd`) matches `\byour\b`. No membership sentence is involved, so the arm is left as it is and the red stays until credentials rewords the sentence so it needs no name (proposed in J1).

**Found in other modules:**
- `progressions` `test/m/progressions/order.test.mjs`:15–17 (R41) pins a hand copy of layer 5 without `law-relations`, so the re-pin turns it red (J2). The fix is progressions'.
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (~line 21753) carries the old list. This change stales it, and it is regenerated at the layer close (mechanics §14; `not_product`'s artifact).

**Deferred:** nothing.

**Reading set:**
- Read whole myself: `build/requirements/membership.md`; layer 2's row of `build/layers.md`; plan T36's rules and entry T36-6; K1961, K2008, K2084; `bio-plane/src/membership/index.mjs` (3,202 lines); `module-order.test.mjs`; `t9-notice-sight-bounds.test.mjs`; `bio-plane/test/members.test.mjs`.
- My worker read whole `checks.mjs`, `schema.mjs` and every other file under `test/m/membership/`. Its summary (about 7 KB) cites file and line for:
  - every reader of `MODULE_ORDER` in the repository: promotion `registry.test.mjs`:43–79; standards `reads.test.mjs`:201–231; progressions `order.test.mjs`:15; plane `store.mjs`:103–112 and `store.test.mjs`:106–116; `store-door`'s and `control-plane`'s `record.mjs`:63–66; 18 product modules ranking by `indexOf`, none pinning length or position;
  - the D-57 path (control-plane `index.mjs`:676–679 → answer-envelope `:301–306` → credentials `:1910`, `:339`, `:329–330`, `:318–327`).
- Nothing the summary left out mattered: no membership file outside those I read reads `MODULE_ORDER` or `modules.json`, and no membership string is read by the arm.
- Used modules' public parts (record-grammar, signatures, record-core, test-support) were not needed for a names-only change; their services are unchanged.

**Tests run (with the change):**
- `test/m/membership/`: 172 pass, 0 fail.
- `test/members.test.mjs`: members 95 pass, 1 fail (red 14, credentials' sentence, J1).
- promotion `registry.test.mjs` 18/0; standards `reads.test.mjs` 7/0.
- Every other test naming `MODULE_ORDER`: 207 pass, 1 fail (progressions `order.test.mjs`, J2).
- store-door 36/0; control-plane 167/0; plane `store.test.mjs` 11/0 (worker's run).
- No layer tests are named in the manifest.

**Checks** (process repository):
- `format: 135 modules, 134 requirements files; 0 failures`
- `architecture: 26 product files, 68 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 95 of 95 live requirement ids named by a test; 0 failures`
- `ownership: 3 files changed by membership between tranche/T36 and HEAD; 0 failures`

**P6:** 3,969 lines (3,970 at the opening): names only, net -1.

Size (session_01Kozvc5CabUVjWrHpUnjz1Z): test runs 16, module lines 3,969

## J1 · REPORT

Red 14 traced (K2084; T36-6): the sentence is **credentials'**, not membership's. No re-pin made.

`bio-plane/test/members.test.mjs`:124–126 (the D-57 arm) reads `.detail` of two `op=login` refusals (`member:ruth` with a wrong password, and `member:nobody`). Both come from `credentials`' `Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED`, `bio-plane/src/credentials/index.mjs`:318–324, which reads (opening):

> "no session was issued and nothing was written. Either your group's Civicsmith holds no active credential under that role — a role that was never registered and one whose membership is no longer active are the same answer here — or a credential is stored and the password supplied does not derive its stored hash. …"

T35-15 (`a767b78ddd`, credentials' DEC-149 sweep) changed "Either this instance holds" to "Either your group's Civicsmith holds"; the arm's `/\byou\b|\byour\b|\byours\b/i` now matches "your" in both refusals: run on `job/T36/membership`, `members: 95 pass, 1 fail`, want `[false,false]`, got `[true,true]`. No membership string is read by the arm.

Against credentials' requirements: DEC-149 allows the name or a rewording "so it needs no name" (membership R112 states the same rule). A rewording that needs no name, e.g. "Either no active credential is held under that role …", meets DEC-149 and D-57 and clears red 14 with the test unchanged. Proposed for CREDENTIALS #7 (next in L2's merge order). Membership changes nothing for it; the arm stays as it is.

## J2 · REPORT

T36-6's re-pin stales one test outside membership: **progressions** `bio-plane/test/m/progressions/order.test.mjs`:15 (R41). It pins a hand copy of T33's layer 5, `between("entities", "workbooks")` deep-equal to a literal list without `law-relations`. MODULE_ORDER now holds `law-relations` between `observation-log` and `standards` (modules.json's place since K1961), so the copy fails: `+ 'law-relations'` after `observation-log`. It passes on `tranche/T36` without my change (1/0) and fails with it (0/1). Nothing in progressions' code is affected: the rest of the test orders by MODULE_ORDER itself.

Against progressions' requirements: R41 asks that listeners are told in MODULE_ORDER. The pinned literal restates the order instead of reading it, so it goes stale with every module added to layer 5. Fix for progressions' next job: add `"law-relations"` after `"observation-log"` in the literal, or compare with `modules.json`'s layer 5 as membership's own R83 test does. Proposed as an accepted red (as red 3 was for promotion and standards) until progressions' job. Membership re-pins nothing for it.

Checked green with the re-pin: membership `test/m/membership/` 172/0 (module-order 6/0, t9 10/0); promotion `registry.test.mjs` 18/0; standards `reads.test.mjs` 7/0; every other test naming MODULE_ORDER 207/1 (this one); store-door 36/0 and control-plane 167/0 (their `record.mjs` reads MODULE_ORDER).
