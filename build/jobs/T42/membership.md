# membership (T42)

**Status** · session_01RzYrca5P3xs9xcgtmKsFnL · depth 2 · COMPLETE · handled B0

## Completion (MEMBERSHIP #33)

**Reading set** (mechanics §17; K2304): BOB measured 403 KB; membership's own code (~245 KB) and tests (~370 KB) are over 300 KB, so the over path. Read whole myself: `build/requirements/membership.md`; layer 2's row of `build/layers.md` and its membership-split section; plan T42's opening rules 1–4 and entry T42-3; K657, K2484, K2607, K2608 (and K874); actions R52, R56–R60 (the services they ask of membership) and actions' `#mayName` and hold code (`actions/index.mjs` 1640–1760, to know what it reads); `bio-plane/src/membership/index.mjs` lines 1–1630; `module-order.test.mjs`, `t41-sight-words.test.mjs`, `fixture.mjs`. Used services named in Uses: record-core `bundleInfo`, `declarePurge`, `registerAuditFinding` and record-grammar `MACHINE_CLASS_PREFIX`, unchanged and read as membership calls them. Two workers read the rest in full and wrote summaries citing file:line: `index.mjs` 1630–2973 (~4 KB summary: nothing there concerns sight levels, holds or `MODULE_ORDER`; no comment limits EXISTENCE's reach to the rescue), and `checks.mjs`, `schema.mjs`, the other 25 test files and `members.test.mjs` (380 KB read, ~6.5 KB summary: C-70.1's row and its two forms, `t9-notice-sight-bounds.test.mjs`:164 also pins `MODULE_ORDER` to the file; no existing test covered the hold acts at a hidden project).

**Entries applied (T42-3).**
- **R83** `MODULE_ORDER` re-pinned from `build/modules.json`: `doorbell` after `capture` (layer 3), `case-account` after `case-disclosures` and before `case-authoring` (layer 8). `module-order.test.mjs`: each pinned between its neighbours (`file-safety`'s pin now reads `doorbell` before it); the tolerated names are now exactly `doorbell` and `case-account` (`ai-use` and T41's five have merged and are held to their paths); a T42-3 negative control (the T41 list, either module missing or misplaced, refused; verified red against the old list: 4 of 8 fail). Clears plan rule 4 (5) for membership; `t9-notice-sight-bounds`:164 and progressions' `order` test green.
- **R60** (N833, K2484; my reading, no question needed): the hold acts' reach is built in `actions` (T41-47, `#mayName`: FULL, or EXISTENCE of a hidden project) from membership's `sight` and `visibilityOf`; membership's share is that those reads answer exactly that set and open nothing else. No service changed. New `t42-hold-reach.test.mjs` (R60, R44, R85, each with a negative control): an administrator (both founder spellings, an active administrator) neither invited nor joined may name a hidden project; an ordinary member, a revoked administrator, an unknown viewer, an absent id and a member at a discoverable project's EXISTENCE may not; nothing inside the project is opened (`sight`/`inSight` of its bundles, the R43 read, R88's subtraction, `projectAuthority`, `isProjectEditor`); a project not nameable answers `existenceAct` then `noSuchProject` as absent; a project made hidden is nameable at EXISTENCE at once. The acts themselves are driven by `actions`' own suite (`test/m/actions/t41.test.mjs`), green. The file header names T42-3. The `*(not yet met: T42)*` mark on R60 is BOB's to clear.

**Ran.**
- `node --test bio-plane/test/m/membership/ bio-plane/test/members.test.mjs`: tests 202, pass 202, fail 0. No layer tests in the manifest.
- Users' suites (P11; 93 modules whose `uses` names membership, 109 test paths, one at a time, with `test/m/actions/`): pass 7,572, fail 5. All five are red with membership's source from `origin/tranche/T42` too, so none is mine: `test/system/row-census.test.mjs` (rule 4 (2)); `test/m/answer-envelope/` catalogue-end pins (rule 4 (6)); `test/system/migrate-released.test.mjs` (rule 4 (7)); `test/fixtures/row-census-1.68.0.jsonl` and `test/fixtures/cpdf20/tier2-recorded.json` (data files under `tests` paths, not tests: node reads them as scripts).
- Checks: `format` 0 failures (147 modules); `architecture membership` 0 failures; `coverage membership` 94 of 94; `ownership membership tranche/T42` 0 failures.

**Deferred.** None.

**Found in other modules.** None new. (R60's `*(not yet met: T42)*` mark stays in the requirements for BOB to clear.)

Size (session_01RzYrca5P3xs9xcgtmKsFnL): test runs 9, module lines 3693

## J1 · COMPLETE

T42-3 done (commit dfd6926f27; record's Completion). R83: MODULE_ORDER gains doorbell (after capture) and case-account (before case-authoring); the two are tolerated by name until their merges; ai-use and T41's five now held to their paths; negative control verified. R60: no membership service changed; actions' #mayName (T41-47) composes sight+visibilityOf; new t42-hold-reach.test.mjs holds at membership's interface that exactly an administrator neither invited nor joined reaches a hidden project at EXISTENCE and nothing inside it opens (negative controls). R60's not-yet-met mark is yours to clear. Membership 202/202; users' suites (93 modules) 7,572 pass, 5 fail, all red on tranche/T42 too (rule 4 (2), (6), (7); two fixture data files). format, architecture, coverage (94/94), ownership: 0 failures.
