# membership (T14)

**Status** · session_018enJcPLdFUzkqbmn9nSNdx · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied** (layer 2's membership bullet; B1), commit 8ef7fe3898:
1. **N128, R81.** `listenerRefusal` reads its rows from this module's `MEMBERSHIP_CHECKS`, no longer the catalogue's `REGISTRATION_CHECKS` (that import is gone). There are two new rows: **C-102.11** `LISTENER_MALFORMED` and **C-102.12** `LISTENER_DECLARED`. They use the wordings' translations, and each `where` is `src/membership/index.mjs listenerRefusal > is-listener-registration`. Every branch carries `check` and `translation`: malformed, a throwing read, declared in a list, and declared in a one-registration slot. `extra` never replaces them. The region was not split. The DEC-49 guard accepts two rows in one region, and its "unclaimed marker" failure on the base is gone. It did report each code as minted at two literal sites, so each code is now written once, through two local helpers inside the region.
2. **N327, R84 (DEC-83).** `notAnAdmin(by, act, extra)` reads `extra.remedy`, which must be one non-blank string (anything else adds nothing). The answer keeps it as `remedy`, and `message` is the C-96.1 translation, a space, then the remedy. `message` belongs to the function and a caller's copy never replaces it. With no remedy, neither field is present, so the nine T13 callers answer byte for byte as before. R84's callers now include:
   - **R22** `expertiseConfirm`: act "confirming or withdrawing a member's declared expertise". Remedy: "An active administrator of this group can confirm it, for any member, another administrator included." It is still asked first.
   - **R41/R75** `rescueRefusal`: act "adding an owner to a project whose owners are all inactive (7.13)". Remedy: "An active administrator of this group can add the owner; while any owner of the project is active, its owners add one instead." R41 still asks sight first, and R75 is byte-identical to R41.
   - **R62** `aiCredentialMint`: act "minting an organisation-wide AI credential". Remedy: "A member-scoped AI credential, which acts for you alone, is open to every member." `by` is the minter. The answer no longer carries `who`, because `by` holds it.

   `ADMIN_ONLY` and `AI_CREDENTIAL_ORG_NOT_ADMIN` are no longer minted anywhere in membership. R84's "held twice" test assertion is removed (K408 (4)), and the `CUSTODIAL_CHECKS` import went from that test. The remedies are my wording (DEC-83 names no sentences); BOB may reword them.
3. **N329, R86.** `activeAdmins()` reads `ORDER BY created, member_id`, with the founder first once claimed. The `awaiting` and `deciders` lists that read it follow the same order.
4. **N335, R87.** `notAParticipant(projectId, by, extra?)` is a new module-level export. It answers `{ok, reason, code: NOT_A_PARTICIPANT, check: C-56.3, translation, project, detail}`, where `detail` is one fixed sentence, `project` is null when none is given, and `extra` never replaces those fields. It writes nothing and never throws. R35 `projectLeave` answers through it. New codes and rows:
   - **R36** `projectRemove`: **`TARGET_NOT_A_PARTICIPANT`** (C-56.4, region `is-remove-target-participant`).
   - **R39** `projectOwnerAdd`: **`TARGET_NOT_JOINED`** (C-56.5, region `is-owner-target-joined`). It is also the answer for a target with no participation, which R39's "unless the target has joined" reads as.
   - **R6**: `NOT_PROPOSED` gains its row, **C-96.14** (region `is-endorse-proposed`).
5. **Rows for promotion to stamp (N318), all added to `MEMBERSHIP_CHECKS`:** C-102.11, C-102.12, C-56.3, C-56.4, C-56.5, C-96.14. None was moved or retired. C-29.12 is now minted by nothing, and legacy-checks retires it in T15. **Six new translations** (C-56.3–.5, C-96.14 are mine; C-102.11/.12 are the wordings') are in `src/membership/checks.mjs`.
6. **Tests.** New file `test/m/membership/t14-rows-remedy-order.test.mjs` (7 tests):
   - `remedy` and `message`: shape, and that a caller's copy never replaces them.
   - Each site (R22, R41, R75, R62) for three non-administrators: byte-for-byte equal to `notAnAdmin(by, act, {remedy})`, one fixed act and remedy per site, nothing written. R75 equals R41.
   - Refusal order: R22 is asked first; R41 asks sight first.
   - R86: rows created in the reverse of id order, a tie broken by id, the founder first once claimed, revoked administrators and ordinary members excluded.
   - R87: shape, row, `extra`, hostile inputs, writes nothing. R35 through it, with an absent project and a hidden one answering alike.
   - The C-56.4, C-56.5 and C-96.14 rows at their sites, with R6's order.

   Existing tests re-pointed to the new codes: R22, R39, R41, R75, R36, R62. R81's test now requires C-102.11/.12 on every branch, and its `test.todo` is retired. Sight's no-leak regex gains `NOT_AN_ADMIN`.
7. **Marks for BOB to strike** (the requirements file is outside my paths): `*(not yet met: N335)*` on R6, R35, R36, R39 and R87; `*(not yet met: N327)*` on R22, R62, R41, R75 and R84; `*(not yet met: N329)*` on R86; `*(not yet met: N128)*` on R81; and the Status line's "… not yet met". All are met.

**Deferred:** none.

**Found in other modules, reported (not edited):**
- **promotion R43** (layer 2, its N335 share): `src/promotion/index.mjs`:820 still mints `NOT_A_PARTICIPANT` itself. The DEC-49 guard's arm G reports the code at two literal sites, and the multi-site ceiling goes 54 → 55. Both clear once the fork calls `notAParticipant(projectId, by, extra)`, which is exported now.
- **legacy-tests: old-battery reds this change makes**, all named in the plan or in `t14-reread.md`, each red here and green on `tranche/T14`:
  - `aicredential` (`AI_CREDENTIAL_ORG_NOT_ADMIN`)
  - `capability` (`ADMIN_ONLY`)
  - `machine-attest` (`expertiseconfirm` `ADMIN_ONLY`)
  - `project-sight` (`projectownerrescue` `ADMIN_ONLY`)
  - `identity-claims` (`ADMIN_ONLY`)
  - `projects` (`NOT_A_PARTICIPANT` → `TARGET_NOT_JOINED`, and `ADMIN_ONLY`)
- **legacy-tests: DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`). The base has 8 failures; this change has 18.
  - **Cleared by this change (3):** the unclaimed `is-listener-registration` marker; "rows 789, floor 790"; "governed sites 498, floor 499".
  - **New floor slack to re-pin (9 ratchets):** rows 795, census 1083, reach 830, governedSites 503, regions 465, regionLines 5556, codesChecked 911, outcomeReturns 274, refusalsJudged 868.
  - **Other new failures:** arm F's untranslated floor (284, against 287), because four codes gained rows. Arm G's `NOT_A_PARTICIPANT` and the multi-site ceiling of 55, which are promotion's, above.
  - **Unchanged from the base:** 109 families (floor 110), `gate.mjs`:446 codeless, 4 verdictless, 6 spread, HELD TWICE C-96.1 (LEGACY-CHECKS #8's re-pin, K458).
- **UI and affordances grep:**
  - `bio-plane/src/affordances.mjs`:1834 lists `projectownerrescue`'s refusals as "ADMIN_ONLY, NO_OWNERS, OWNERS_ARE_ACTIVE"; the first is now `NOT_AN_ADMIN`.
  - `affordances.mjs`:1827 and `src/affordances/facts.mjs`:117 name leave's `NOT_A_PARTICIPANT`. It is unchanged in code, now minted through R87.
  - All three are comments, so no behaviour changes.
  - `civicos-ui/`: no hit for `ADMIN_ONLY`, `AI_CREDENTIAL_ORG_NOT_ADMIN`, `NOT_PROPOSED`, `TARGET_NOT_*`, `notAParticipant`, `activeAdmins`, `listenerRefusal` or `LISTENER_*` outside the guard's own ratchet notes. The redesign owes the display of `message` (DEC-83).
- **Generated artifact (§14):** `agent-worker/dist/agent-worker.bundled.mjs` is STALE against `src/membership/checks.mjs` and `index.mjs`. `fleetbundles.test.mjs` fails its agent-worker arm; it passes on the base, and ocr-worker and pdf-worker pass. Not rebuilt; BOB regenerates it at the layer close.

**Tests and checks run:**
- **membership** (`bio-plane/test/m/membership/`): 107 tests, 107 pass, 0 fail, 0 todo.
- **`test/m/` whole:** 2755 tests, 2739 pass, 0 fail, 16 todo.
- **Old-battery suites reading this code** (mine / base): derivation-bounds, signer-enrolment, adminvote, bias, members, membership, refusal-wire, machine-fences, project-discoverable and bounds pass on both. d134-custodial-refusals and d470-catalog-census are red on both (legacy-checks' layer-1 removal, K458). The six named above are red only with this change. The guard and fleetbundles are as above.
- `format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `architecture.mjs … membership`: 16 product files, 38 relative imports; 0 failures.
- `coverage.mjs … membership`: 87 of 87 live requirement ids named by a test; 0 failures.
- `ownership.mjs … membership tranche/T14`: 10 files changed; legacy-store 0 added, 0 removed; 0 failures.

Size (session_018enJcPLdFUzkqbmn9nSNdx): test runs 51, module lines 6,060
