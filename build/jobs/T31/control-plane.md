# control-plane (T31)

**Status** · session_011cKk173siQnTMHMYF56fFs · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

Readings I am building on (carrying on; none blocks me until wizard-scripts and op-declarations merge):

1. **R50, stamps** (wizard-scripts not yet built, so its map's keys are my reading of its signatures): `wizarddraft`, `wizardrevise`, `wizardsubmit` stamped `author`; `wizardapprove`, `wizardretire`, `wizardeditorgrant`, `wizardeditorrevoke` stamped `by`; each the POSITIONAL identity (`member:<id>`, founder `member:admin`; a machine `class:<cls>`, never reached since their rows are session-only), as filing-templates' acts (QUERY_AUTHOR_ACTIONS). `wizardpropose` stamped `proposer` by `templatepropose`'s expression (session its member id, machine `class:<cls>`, agent `class:ai/<tokenId>`). `viewer` on every act but the two editor-grant acts, and on all six reads (`wizardcheck` included: R12's `WIZARD_DUPLICATE` asks offered scripts, which are seen by viewer). `wizardprogress`: no stamp at all (every caller stamp deleted as for every op). If wizard-scripts' map reads other keys, BOB please say which.
2. **R50, the tally**: "every refusal it answers to a member's session" read as every answer with `ok: false` (top level, or `result.ok: false`) carrying a string `reason`/`code`, answered after `admission` has admitted the caller by a session (any session, the founder's included), on the gated path: the door's own refusals, a handler's, the store's, a silence (`STORE_DID_NOT_ANSWER`) and `PLANE_INTERNAL_ERROR`. Refusals `admission` answers before it names the caller (NOT_AUTHENTICATED, CLASS_FORBIDDEN, NOT_CAPABLE, ...) are NOT counted: `admit` returns no caller with a refusal, so the door cannot tell a session's from another's without re-doing admission. If BOB wants those counted, admission must hand `viaSession` with its refusal (an `admission` change). `op` is the op the caller asked (`inboxresolve`, not its `inboxpull` re-route). The count crosses to the store by a store-internal route `wizardrefusaltally` that this module adds to its routes (`controlPlaneRoutes`), calling `wizardScriptsOf(ctx).tallyRefusal(op, code)` — capture's `doorbellrefused` pattern; a failed tally never changes the answer. Consequences for others: op-declarations R6's store-internal list (and its `tables.test.mjs` STORE_INTERNAL) should name `wizardrefusaltally`; I read R28's "nothing is read or written when a gate refuses" as the record, the unattributed tally being status like `doorbellrefused`.
3. **R51**: one policy on every `text/html` response the Worker door returns (its own pages and any a hook returns): `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'`. Both pages are single files with inline script and style and fetch only `/api` on their own origin (measured).
4. **R41**: already a pass-through of affordances' answer, so `screens` and `wizard_scripts` reach `renderPack` once affordances R37 publishes them; I add the test.
5. **R52**: `importwatch`, `importunwatch` join this module's case-import act list (`by` and `viewer`, positional `by`), as R49's acts.

## J2 · COMPLETE

**Completion record** (tranche/T31 merged through B6, K1404).

Entries applied:
- N528 R41: the untargeted `op=affordances` answer passes `screens` and `wizard_scripts` (affordances R37) to `renderPack` whole; test `affordances-pack.test.mjs` (driven layer, a broken script giving `pack: null` + `pack_absent`, absence stated without them).
- N528 R50: wizard-scripts' 15 ops routed by the general forward through its own map; `author` stamped on every act (positional identity; the proposal's label on `wizardpropose`), K1402; `viewer` on every act but the editor grant's two and on every read; `wizardprogress` stamped nothing. Refusal tally: every refusal answered to a member's session after admission (both levels, silences and internal errors included; admission's pre-caller refusals not counted, K1396) is handed `{op, code}` through the store-internal route `wizardrefusaltally` (`controlPlaneRoutes`) to `wizardScriptsOf(ctx).tallyRefusal`; a failed tally changes nothing. Tests `r50-routes.test.mjs`, `refusal-tally.test.mjs`.
- N528 R51: `content-security-policy` (own origin only; inline script/style; `connect-src`, `form-action` `'self'`; `base-uri`, `object-src` `'none'`) set on every `text/html` response leaving the Worker door, hooks' pages included. Test `page-policy.test.mjs` parses the policy per directive.
- N534 R52: `importwatch`, `importunwatch` in this module's case-import act list (`by` positional, `viewer`); test `r52-routes.test.mjs` (route, stamps forged and not, refusals to every non-session caller). `r49-routes.test.mjs` #1 now pins the map at R49's eight plus R52's two (K1383's red turned green).
- R43 (wizard-scripts' report, K1401): `CHECK_FAMILY_FILES` gains `src/wizard-scripts/checks.mjs` at its place (first in L11, after link-sweep).

Deferred: none.

Found in other modules:
- plane: `test/m/plane/` two reds, identical with or without this job's code (measured by checking out tranche/T31's control-plane): R17/R5 pins case-import's map without `importwatch`/`importunwatch` (K1383 #7, plane R20's job), and R2/R5 (N13) pins affordances' map without its new `affordancescreens` route (affordances R37's merge). Plane's to turn green.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (bundler, `not_product`) is stale by this job's source changes; regenerated at the layer close (§14).

Tests and checks:
- `node --test test/m/control-plane/`: tests 159, pass 159, fail 0.
- `node --test test/m/op-declarations/` with plane: op-declarations green; plane 133/135 (the two above, not this job's).
- format: 98 modules, 97 requirements files; 0 failures. architecture: 45 product files, 253 relative imports; 0 failures. coverage: 36 of 36 live requirement ids named by a test; 0 failures. ownership: 10 files changed by control-plane between tranche/T31 and HEAD; 0 failures.

Size (session_011cKk173siQnTMHMYF56fFs): test runs 22, module lines 3729
